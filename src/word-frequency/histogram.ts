// Da formato a la salida del contador (texto y barras). Desarrollado con un asistente de IA (Cursor); ver docs/04.
// Solo usa tipos de core.ts (sin código de Node), así que también va empaquetado en la página web local.
import type { AnalysisResult } from "./core";

export interface FormatOptions {
  bars?: boolean; // agrega una barra visual al lado de cada cantidad
  barWidth?: number; // ancho de la barra más larga (por defecto 30)
}

/**
 * Da formato a la salida exactamente como en el ejemplo del enunciado:
 *   14 words
 *   99 characters
 *   farmatodo: 6
 *   ...
 */
export function formatReport(result: AnalysisResult, options: FormatOptions = {}): string {
  const { words, characters, frequencies } = result;
  const lines = [`${words} ${words === 1 ? "word" : "words"}`, `${characters} ${characters === 1 ? "character" : "characters"}`];

  const max = frequencies[0]?.count ?? 0;
  const barWidth = options.barWidth ?? 30;
  for (const { word, count } of frequencies) {
    let line = `${word}: ${count}`;
    if (options.bars && max > 0) {
      line += " " + "█".repeat(Math.max(1, Math.round((count / max) * barWidth)));
    }
    lines.push(line);
  }
  return lines.join("\n");
}
