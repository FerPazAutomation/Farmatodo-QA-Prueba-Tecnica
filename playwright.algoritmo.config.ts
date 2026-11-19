// Configuración de las pruebas unitarias del algoritmo de frecuencia de palabras (punto 4). Sin navegador y sin internet.
// Se ejecuta con `npm run test:algoritmo`. Genera los reportes en reports/algoritmo/.
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./unit",
  fullyParallel: true,
  timeout: 30_000,
  outputDir: "reports/algoritmo/test-results",
  reporter: [
    ["list"],
    [
      "./reporters/summary-reporter.ts",
      {
        title: "Pruebas del algoritmo de frecuencia de palabras",
        subtitle: "Prueba técnica Farmatodo · Punto 4",
        outputDir: "reports/algoritmo",
        help: "cada escenario es una prueba del programa con un texto de entrada concreto (no usa navegador ni internet). «Pasó» significa que el programa devolvió exactamente lo esperado. «Falló» significa que devolvió algo distinto y abajo se muestra la descripción del error.",
      },
    ],
  ],
});
