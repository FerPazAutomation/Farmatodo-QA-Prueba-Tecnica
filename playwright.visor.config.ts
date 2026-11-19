// Configuración de las pruebas de la página web local del contador (visor/contador-palabras.html), parte del punto 4.
// Abre el archivo HTML directamente desde el disco en Chromium: no necesita internet.
// Se ejecuta con `npm run test:visor`. Genera los reportes en reports/visor/.
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/visor",
  fullyParallel: true,
  timeout: 30_000,
  expect: { timeout: 8_000 },
  outputDir: "reports/visor/test-results",
  reporter: [
    ["list"],
    [
      "./reporters/summary-reporter.ts",
      {
        title: "Pruebas de la página web local del contador de palabras",
        subtitle: "Prueba técnica Farmatodo · Punto 4 (visor HTML)",
        outputDir: "reports/visor",
        help: "cada escenario abre visor/contador-palabras.html en un navegador (sin internet), escribe o carga un texto concreto y compara lo que muestra la página con lo esperado. «Pasó» significa que la página mostró exactamente lo esperado. «Falló» significa que mostró algo distinto; abajo está la descripción del error y una captura de pantalla de ese momento.",
      },
    ],
  ],
  use: { locale: "es-AR" },
  projects: [{ name: "chromium-desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1100, height: 900 } } }],
});
