// Analizador de frecuencia de palabras (punto 4 de la prueba): parte que lee archivos desde el disco.
//
// Nota de transparencia: este código fue desarrollado con un asistente de IA (Cursor), siguiendo los criterios y
// reglas definidos por el autor de la prueba. Qué hace cada parte está explicado en docs/04-contador-frecuencia-palabras.md.
//
// Las reglas y el algoritmo en sí (contar, normalizar, ordenar) viven en core.ts, que no depende de Node y también
// se usa en la página web local. Este archivo solo agrega la lectura de archivos como flujo (stream).
// Se vuelve a exportar todo core.ts para que el resto del proyecto siga importando desde "./analyzer".

import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";
import { analyzeLines, type AnalysisResult } from "./core";

export * from "./core";

/** Lee el archivo como flujo (stream): un archivo de 2 GB no necesita 2 GB de memoria. */
export async function analyzeFile(path: string): Promise<AnalysisResult> {
  const stream = createReadStream(path, { encoding: "utf8" });
  const reader = createInterface({ input: stream, crlfDelay: Infinity });
  try {
    return await analyzeLines(reader);
  } finally {
    reader.close();
    stream.destroy();
  }
}
