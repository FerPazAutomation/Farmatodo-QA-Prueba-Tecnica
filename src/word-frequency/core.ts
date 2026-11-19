// Núcleo del algoritmo de frecuencia de palabras (punto 4 de la prueba).
//
// Nota de transparencia: este código fue desarrollado con un asistente de IA (Cursor), siguiendo los criterios y
// reglas definidos por el autor de la prueba. Qué hace cada parte está explicado en docs/04-contador-frecuencia-palabras.md.
//
// IMPORTANTE: este archivo es "puro": no usa nada de Node (ni archivos ni consola), solo JavaScript estándar.
// Por eso el MISMO código sirve para dos usos:
//   1. El programa de consola (`npm run frecuencia`), que lo usa desde analyzer.ts junto con la lectura de archivos.
//   2. La página web local (visor/contador-palabras.html), que lo trae empaquetado dentro del HTML.
// Si se cambia una regla acá, cambia en los dos lados a la vez (el HTML se regenera con `npm run visor:construir`).
//
// Reglas (los supuestos están documentados en docs/04-contador-frecuencia-palabras.md):
//  - Una "palabra" es un bloque de texto separado por espacios que contiene al menos una letra, un dígito o un emoji.
//  - Las palabras se comparan sin distinguir mayúsculas, y se ignora la puntuación/símbolos de los bordes
//    ("Hola," y "hola." son ambas "hola"). Los caracteres internos se conservan ("e-mail", "don't", "hola_mundo").
//  - Un "carácter" es lo que una persona ve como un símbolo (grafema), con espacios y sin saltos de línea.
//
// Complejidad (n = caracteres del texto, k = palabras distintas):
//  - Tiempo:  O(n) para leer, separar y contar + O(k log k) para ordenar  =>  O(n + k log k)
//  - Espacio: O(k) para el mapa de frecuencias (+ la línea más larga, porque el texto se procesa línea por línea)

export interface WordFrequency {
  word: string;
  count: number;
}

export interface AnalysisResult {
  words: number;
  characters: number;
  frequencies: WordFrequency[]; // ordenado: cantidad descendente y, si empatan, alfabético
}

// Segmentador de grafemas: entiende que un emoji o una letra con acento combinado es UN solo carácter visible.
const graphemeSegmenter = new Intl.Segmenter("es", { granularity: "grapheme" });
// Comparador alfabético en español (para desempatar de forma correcta con tildes y ñ).
const alphabeticalCollator = new Intl.Collator("es");
const WHITESPACE = /\s+/u;

// Caracteres "con significado": letras, dígitos, marcas de acento, emoji (y el unidor invisible de los emoji compuestos).
// Un bloque hecho solo de otros símbolos ("!!!", "---") no es una palabra; un emoji suelto sí (tiene significado).
const MEANINGFUL = "\\p{L}\\p{N}\\p{M}\\p{Extended_Pictographic}\\u200d";
const HAS_MEANINGFUL = new RegExp(`[${MEANINGFUL}]`, "u");
// Expresión que detecta la puntuación/símbolos del principio y del final de una palabra, para quitarlos.
const EDGE_NOISE = new RegExp(`^[^${MEANINGFUL}]+|[^${MEANINGFUL}]+$`, "gu");

/** Cantidad de caracteres visibles de una línea (una línea nunca contiene saltos de línea). */
export function countCharacters(line: string): number {
  // Camino rápido: el texto ASCII puro tiene exactamente un grafema por unidad UTF-16.
  if (/^[\x00-\x7f]*$/.test(line)) return line.length;
  let total = 0;
  for (const _ of graphemeSegmenter.segment(line)) total++;
  return total;
}

/** Separa una línea en palabras normalizadas (minúsculas, sin puntuación en los bordes). */
export function tokenize(line: string): string[] {
  const tokens: string[] = [];
  for (const raw of line.split(WHITESPACE)) {
    if (raw === "" || !HAS_MEANINGFUL.test(raw)) continue;
    // NFC: "canción" escrita como "cancio" + tilde suelta debe ser igual a la forma de un solo carácter.
    const cleaned = raw.normalize("NFC").replace(EDGE_NOISE, "");
    tokens.push(cleaned.toLocaleLowerCase("es"));
  }
  return tokens;
}

/** Ordena el mapa palabra -> cantidad: más repetidas primero y, si empatan, alfabético en español. */
export function sortFrequencies(counts: Map<string, number>): WordFrequency[] {
  return [...counts.entries()]
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count || alphabeticalCollator.compare(a.word, b.word));
}

/** Analiza cualquier secuencia de líneas (un arreglo, un flujo, un generador). La memoria no crece con el tamaño del archivo. */
export async function analyzeLines(lines: Iterable<string> | AsyncIterable<string>): Promise<AnalysisResult> {
  const counts = new Map<string, number>(); // palabra -> cantidad (sumar es O(1) en promedio)
  let words = 0;
  let characters = 0;
  let isFirstLine = true;

  for await (let line of lines) {
    if (isFirstLine) {
      isFirstLine = false;
      if (line.charCodeAt(0) === 0xfeff) line = line.slice(1); // el BOM de UTF-8 (marca invisible del inicio) no es texto
    }
    characters += countCharacters(line);
    for (const token of tokenize(line)) {
      words++;
      counts.set(token, (counts.get(token) ?? 0) + 1);
    }
  }
  return { words, characters, frequencies: sortFrequencies(counts) };
}

/** Atajo para pruebas y textos chicos: los saltos de línea son \n, \r\n o \r (igual que el lector de archivos). */
export function analyzeText(text: string): Promise<AnalysisResult> {
  return analyzeLines(text.split(/\r\n|\n|\r/));
}
