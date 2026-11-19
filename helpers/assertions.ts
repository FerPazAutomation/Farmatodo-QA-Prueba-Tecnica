import { expect } from "@playwright/test";
import type { Scenario } from "../data/scenarios";
import type { Keyword, WordCounterPage } from "../pages/wordCounterPage";

const soft = expect.configure({ soft: true });

/** El sitio escribe los números grandes con separador de miles en inglés ("20,000"). */
export const formatNumber = (n: number): string => n.toLocaleString("en-US");

export const preview = (text: string): string => JSON.stringify(text);

/**
 * Compara lo que lista el sitio con la tabla de frecuencias esperada, TOLERANDO EMPATES:
 *  - las cantidades mostradas, en orden, deben ser las cantidades más altas de la tabla;
 *  - cada palabra mostrada debe tener realmente la cantidad que muestra el sitio (así se acepta
 *    cualquier palabra de un empate, porque el sitio no desempata alfabéticamente);
 *  - no puede haber una palabra repetida, y la cantidad de filas es el menor entre `limit` y las palabras distintas.
 * Devuelve un texto vacío si todo está bien; si no, una frase que describe los primeros problemas
 * (ese texto es el que aparece como "descripción del error" en el reporte).
 */
export function describeTopMismatch(actual: Keyword[], frequencies: Record<string, number>, limit: number): string {
  const expectedCounts = Object.values(frequencies)
    .sort((a, b) => b - a)
    .slice(0, limit);
  const shown = actual.slice(0, limit);
  const format = (items: Array<{ word: string; count: number }>) => items.map((i) => `«${i.word}» ×${i.count}`).join(", ") || "ninguna";
  const problems: string[] = [];

  if (shown.length !== expectedCounts.length) {
    const sample = Object.entries(frequencies)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([word, count]) => ({ word, count }));
    problems.push(`cantidad de palabras en el top: se esperaban ${expectedCounts.length} (ej. ${format(sample)}) y el sitio listó ${shown.length} (${format(shown)})`);
  }
  shown.forEach((item, index) => {
    const realCount = frequencies[item.word];
    if (realCount === undefined) problems.push(`posición ${index + 1}: el sitio muestra «${item.word}», que no es una palabra del texto tal como se esperaba`);
    else if (realCount !== item.count) problems.push(`posición ${index + 1}: «${item.word}» debería repetirse ${realCount} veces y el sitio muestra ${item.count}`);
    if (expectedCounts[index] !== undefined && item.count !== expectedCounts[index]) {
      problems.push(`posición ${index + 1}: se esperaba una palabra con ${expectedCounts[index]} repeticiones y el sitio muestra «${item.word}» con ${item.count}`);
    }
  });
  if (new Set(shown.map((s) => s.word)).size !== shown.length) problems.push("el sitio repite una palabra en el top");
  return problems.join(" | ");
}

/**
 * Verifica las tres cosas que pide la prueba: cantidad de palabras, cantidad de caracteres y top 3 de Keyword Density.
 * Usa verificaciones "soft": si una falla, la prueba sigue y el reporte muestra todos los errores juntos.
 */
export async function expectScenario(wc: WordCounterPage, s: Scenario): Promise<void> {
  const quoted = preview(s.text);

  await soft(wc.wordCount, `Número de palabras de ${quoted}`).toHaveText(formatNumber(s.expected.words));
  await soft(wc.characterCount, `Número de caracteres de ${quoted}`).toHaveText(formatNumber(s.expected.characters));

  await soft
    .poll(async () => describeTopMismatch(await wc.readKeywords(), s.expected.frequencies, 3), {
      message: `Top 3 palabras más repetidas (Keyword Density) de ${quoted}`,
    })
    .toBe("");

  if (s.expected.checkPercentages) {
    await soft
      .poll(
        async () => {
          const wrong = (await wc.readKeywords()).filter((k) => k.percent !== Math.round((k.count / s.expected.words) * 100));
          return wrong.map((k) => `«${k.word}» muestra ${k.percent}% y debería mostrar ${Math.round((k.count / s.expected.words) * 100)}%`).join(" | ");
        },
        { message: `Porcentajes de Keyword Density de ${quoted}` },
      )
      .toBe("");
  }
}
