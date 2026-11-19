// Genera la página web local visor/contador-palabras.html.
//
// Cómo funciona:
//  1. Toma el algoritmo REAL (src/word-frequency/core.ts + histogram.ts) y lo empaqueta en un solo bloque de JavaScript con esbuild.
//  2. Lo inserta dentro de la plantilla (src/word-frequency/visor/plantilla.html), en el lugar marcado con /*__ALGORITMO__*/.
//  3. Guarda el resultado en visor/contador-palabras.html: un único archivo que se abre con doble clic, sin servidor ni internet.
//
// Uso:
//   npm run visor:construir     -> solo genera el archivo
//   npm run visor               -> genera el archivo y lo abre en el navegador
//
// Desarrollado con un asistente de IA (Cursor); ver docs/04-contador-frecuencia-palabras.md.
import { build } from "esbuild";
import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

export const RUTA_ENTRADA = resolve("src/word-frequency/visor/entrada.ts");
export const RUTA_PLANTILLA = resolve("src/word-frequency/visor/plantilla.html");
export const RUTA_SALIDA = resolve("visor/contador-palabras.html");
const MARCA = "/*__ALGORITMO__*/";

/** Devuelve el contenido completo que debe tener visor/contador-palabras.html (sin escribirlo). */
export async function construirVisor(): Promise<string> {
  const empaquetado = await build({
    entryPoints: [RUTA_ENTRADA],
    bundle: true,
    write: false,
    format: "iife",
    globalName: "AlgoritmoFrecuencia", // en la página queda disponible como AlgoritmoFrecuencia.analyzeText(...)
    platform: "browser",
    target: "es2022",
    charset: "ascii", // los caracteres no ASCII salen escapados (\uXXXX): el archivo no depende de la codificación
    legalComments: "none",
    logLevel: "silent",
  });
  const codigo = empaquetado.outputFiles[0].text;

  // Protección: dentro de un <script> estas secuencias cortarían el bloque. No debería haberlas; si aparecen, se avisa.
  if (/<\/script|<!--/i.test(codigo)) throw new Error("El algoritmo empaquetado contiene una secuencia que rompería el <script> del HTML.");

  const plantilla = (await readFile(RUTA_PLANTILLA, "utf8")).replace(/\r\n/g, "\n");
  if (!plantilla.includes(MARCA)) throw new Error(`La plantilla no contiene la marca ${MARCA}.`);
  // Se usa una función en replace para que los "$" del código no se interpreten como patrones especiales.
  return plantilla.replace(MARCA, () => codigo.replace(/\r\n/g, "\n").trimEnd());
}

function abrirEnNavegador(ruta: string): void {
  if (process.platform === "win32") execFile("cmd", ["/c", "start", "", ruta]);
  else if (process.platform === "darwin") execFile("open", [ruta]);
  else execFile("xdg-open", [ruta]);
}

async function main(): Promise<void> {
  const html = await construirVisor();
  await mkdir(dirname(RUTA_SALIDA), { recursive: true });
  await writeFile(RUTA_SALIDA, html, "utf8");
  console.log(`Página generada: ${RUTA_SALIDA}`);
  if (process.argv.includes("--abrir")) {
    console.log("Abriendo en el navegador...");
    abrirEnNavegador(RUTA_SALIDA);
  }
}

// Solo se ejecuta cuando se lanza el script directamente (no cuando lo importa una prueba).
if (/construir-visor\.[cm]?[jt]s$/.test(process.argv[1] ?? "")) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
