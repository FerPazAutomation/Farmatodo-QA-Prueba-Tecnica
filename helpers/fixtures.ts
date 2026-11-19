import { test as base } from "@playwright/test";
import { writeFile } from "node:fs/promises";
import { WordCounterPage } from "../pages/wordCounterPage";

/**
 * Un "fixture" es algo que Playwright prepara antes de cada prueba y limpia al terminar.
 * Cada prueba recibe:
 *  - `wc`: el Page Object con el sitio ya abierto. Cada prueba usa un navegador limpio, así que no queda
 *    texto guardado por otras pruebas.
 *  - una captura de pantalla automática, adjunta como "evidencia" al terminar la prueba (pase o falle).
 */
export const test = base.extend<{ wc: WordCounterPage; autoEvidence: void }>({
  wc: async ({ page }, use) => {
    const wc = new WordCounterPage(page);
    await wc.open();
    await use(wc);
  },
  autoEvidence: [
    async ({ page, wc }, use, testInfo) => {
      await use();
      if (page.isClosed()) return;
      const body = await wc.evidence().catch(() => undefined);
      if (!body) return;
      // Primero se guarda en un archivo real: el reporte solo puede copiar adjuntos que tengan una ruta.
      const path = testInfo.outputPath("evidencia.png");
      await writeFile(path, body);
      await testInfo.attach("evidencia", { path, contentType: "image/png" });
    },
    { auto: true },
  ],
});

export { expect } from "@playwright/test";
