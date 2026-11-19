// Verificación cruzada: los valores esperados que se calcularon A MANO (a partir de la definición, no copiados del sitio)
// para la suite del sitio web deben coincidir con lo que calcula el algoritmo del punto 4. Si dos cálculos independientes coinciden, los valores esperados
// son confiables y no están copiados de lo que muestra el sitio.
import { test, expect } from "@playwright/test";
import { scenarios } from "../data/scenarios";
import { analyzeText } from "../src/word-frequency/analyzer";

test.describe("Valores esperados de la suite vs. algoritmo del punto 4", () => {
  for (const s of scenarios) {
    test(`XV-${s.id} | ${s.title}`, {
      tag: "@core",
      annotation: [
        {
          type: "descripcion",
          description: `Se comprueba que lo que se espera del sitio en ${s.id} (palabras, caracteres y frecuencias) coincide con lo que calcula el algoritmo del punto 4.`,
        },
      ],
    }, async () => {
      const result = await analyzeText(s.text);
      const actual = Object.fromEntries(result.frequencies.map((f) => [f.word, f.count]));
      expect(result.words, "palabras").toBe(s.expected.words);
      expect(result.characters, "caracteres").toBe(s.expected.characters);
      expect(actual, "frecuencias").toEqual(s.expected.frequencies);
    });
  }
});
