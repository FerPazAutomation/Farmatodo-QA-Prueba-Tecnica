// Línea de comandos del contador de frecuencia de palabras. Desarrollado con un asistente de IA (Cursor); ver docs/04.
// Uso:  npm run frecuencia -- <archivo.txt> [--bars]
// Códigos de salida: 0 = todo bien, 1 = no se pudo leer el archivo, 2 = faltó indicar el archivo.
import { analyzeFile } from "./analyzer";
import { formatReport } from "./histogram";

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const bars = args.includes("--bars");
  const path = args.find((a) => !a.startsWith("--"));

  if (!path) {
    console.error("Uso: npm run frecuencia -- <archivo.txt> [--bars]");
    process.exitCode = 2;
    return;
  }

  try {
    const result = await analyzeFile(path);
    console.log(formatReport(result, { bars }));
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") console.error(`No encontré el archivo: ${path}`);
    else if (code === "EISDIR") console.error(`Eso es una carpeta, no un archivo: ${path}`);
    else console.error(`No pude leer el archivo (${(error as Error).message})`);
    process.exitCode = 1;
  }
}

void main();
