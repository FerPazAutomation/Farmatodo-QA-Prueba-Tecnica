// Escenarios "dirigidos por datos": para cada texto de data/scenarios.ts el sitio debe mostrar la cantidad correcta
// de palabras, de caracteres y el top 3 de Keyword Density. Se escribe UNA sola prueba y se repite por cada escenario.
//
// - Los escenarios de núcleo (SC-xx) deben pasar.
// - Los escenarios de hallazgo (ED-xx) afirman la definición estándar y son desvíos conocidos del sitio:
//   hoy fallan a propósito y cada uno está documentado como defecto en docs/02-reporte-fallas-wordcounter.md.
import { scenarios } from "../../data/scenarios";
import { expectScenario, preview } from "../../helpers/assertions";
import { test } from "../../helpers/fixtures";

test.describe("WordCounter · conteo de palabras, caracteres y Keyword Density", () => {
  for (const s of scenarios) {
    const isEdge = s.category === "edge";
    // La etiqueta (@core o @hallazgo) permite correr solo un grupo: `npm run test:core`.
    test(`${s.id} | ${s.title}`, {
      tag: isEdge ? "@hallazgo" : "@core",
      annotation: [
        { type: "descripcion", description: s.plain },
        { type: "entrada", description: preview(s.text) },
        ...(s.finding ? [{ type: "hallazgo", description: `${s.finding.id} [${s.finding.platform}] ${s.finding.title}` }] : []),
      ],
    }, async ({ wc }) => {
      // 1) Se ingresa el texto en el editor. 2) Se comparan palabras, caracteres y top 3 con lo esperado.
      await wc.enterText(s.text);
      await expectScenario(wc, s);
    });
  }
});
