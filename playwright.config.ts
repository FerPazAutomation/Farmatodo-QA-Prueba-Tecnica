// Configuración de la suite de https://wordcounter.net/ (punto 1). Solo con la configuración por defecto del sitio.
// Se ejecuta con `npm run test:wordcounter`. Genera los reportes en reports/wordcounter/.
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/wordcounter",
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,
  retries: process.env.CI ? 1 : 0,
  // Tiempos más amplios: con 4 pruebas en paralelo el sitio tarda más en actualizar sus contadores.
  // Con 4 segundos hubo fallas falsas intermitentes (SC-01 y SC-16) que no se reproducían en aislado.
  timeout: 60_000,
  expect: { timeout: 8_000 },
  outputDir: "reports/wordcounter/test-results",
  reporter: [
    ["list"],
    [
      "./reporters/summary-reporter.ts",
      {
        title: "Suite automatizada de wordcounter.net",
        subtitle: "Prueba técnica Farmatodo · Punto 1",
        outputDir: "reports/wordcounter",
      },
    ],
    ["html", { outputFolder: "reports/wordcounter/playwright-html", open: "never" }],
  ],
  use: {
    baseURL: "https://wordcounter.net",
    locale: "en-US", // el sitio está en inglés; se fija para que el comportamiento por defecto sea siempre el mismo
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium-desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1366, height: 900 } } }],
});
