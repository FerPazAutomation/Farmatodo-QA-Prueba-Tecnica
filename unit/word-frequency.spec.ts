// ================================================================================================================
//  CASOS DEL ALGORITMO DE FRECUENCIA DE PALABRAS (PUNTO 4) · AL-01 a AL-17
// ================================================================================================================
//  Estas pruebas NO usan navegador ni wordcounter.net: ejecutan directamente el código de src/word-frequency/.
//  Cada prueba trae su propio texto de entrada. Los escenarios de wordcounter.net están en data/scenarios.ts.
//  Se ejecutan con: npm run test:algoritmo
// ================================================================================================================
import { test, expect } from "@playwright/test";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { analyzeFile, analyzeText } from "../src/word-frequency/analyzer";
import { formatReport } from "../src/word-frequency/histogram";

const EXAMPLE_INPUT =
  "farmatodo farmatodo farmatodo farmatodo farmatodo cuida cuida tu salud\nfarmatodo cuida toda tu salud";

// Salida exacta que pide el enunciado de la prueba (punto 4).
const EXAMPLE_OUTPUT = ["14 words", "99 characters", "farmatodo: 6", "cuida: 3", "salud: 2", "tu: 2", "toda: 1"].join("\n");

async function report(text: string): Promise<string> {
  return formatReport(await analyzeText(text));
}

test.describe("Algoritmo de frecuencia de palabras", () => {
  test("AL-01 | Produce exactamente la salida del ejemplo del enunciado", {
    tag: "@core",
    annotation: [{ type: "descripcion", description: "Es el ejemplo oficial de la prueba: 14 palabras, 99 caracteres y el histograma ordenado." }],
  }, async () => {
    expect(await report(EXAMPLE_INPUT)).toBe(EXAMPLE_OUTPUT);
  });

  test("AL-02 | Empate de frecuencia se ordena alfabéticamente", {
    tag: "@core",
    annotation: [{ type: "descripcion", description: "«salud» y «tu» aparecen 2 veces: salud va primero porque la 's' viene antes que la 't'." }],
  }, async () => {
    const { frequencies } = await analyzeText("tu tu salud salud zeta alfa");
    expect(frequencies.map((f) => f.word)).toEqual(["salud", "tu", "alfa", "zeta"]);
  });

  test("AL-03 | Ordena por frecuencia descendente aunque el texto venga desordenado", {
    tag: "@core",
    annotation: [{ type: "descripcion", description: "La palabra más repetida siempre va primero, sin importar dónde aparezca." }],
  }, async () => {
    const { frequencies } = await analyzeText("a1 b2 b2 c3 c3 c3");
    expect(frequencies).toEqual([
      { word: "c3", count: 3 },
      { word: "b2", count: 2 },
      { word: "a1", count: 1 },
    ]);
  });

  test("AL-04 | Mayúsculas y minúsculas son la misma palabra", {
    tag: "@core",
    annotation: [{ type: "descripcion", description: "«Hola», «hola» y «HOLA» suman 3 repeticiones de «hola»." }],
  }, async () => {
    const { frequencies } = await analyzeText("Hola hola HOLA");
    expect(frequencies).toEqual([{ word: "hola", count: 3 }]);
  });

  test("AL-05 | Ignora la puntuación en los bordes pero conserva la interna", {
    tag: "@core",
    annotation: [{ type: "descripcion", description: "«Hola,» y «hola.» son «hola»; «e-mail» sigue siendo una sola palabra." }],
  }, async () => {
    const { words, frequencies } = await analyzeText("Hola, hola. ¿hola? e-mail");
    expect(words).toBe(4);
    expect(frequencies).toEqual([
      { word: "hola", count: 3 },
      { word: "e-mail", count: 1 },
    ]);
  });

  test("AL-06 | Tildes y ñ se conservan y se ordenan en español", {
    tag: "@core",
    annotation: [{ type: "descripcion", description: "«canción», «niño» y «árbol» no pierden letras, y el orden alfabético respeta el español (árbol antes que casa)." }],
  }, async () => {
    const { frequencies } = await analyzeText("niño niño canción canción árbol casa");
    expect(frequencies.map((f) => f.word)).toEqual(["canción", "niño", "árbol", "casa"]);
  });

  test("AL-07 | Cuenta los espacios y no cuenta los saltos de línea (\\n y \\r\\n)", {
    tag: "@core",
    annotation: [{ type: "descripcion", description: "Regla de la prueba: caracteres incluyen espacios pero no saltos de línea. Funciona igual con archivos de Windows (CRLF) y de Linux/Mac." }],
  }, async () => {
    const unix = await analyzeText("uno dos\ntres");
    const windows = await analyzeText("uno dos\r\ntres");
    expect(unix.characters).toBe(11); // "uno dos" (7) + "tres" (4)
    expect(windows.characters).toBe(11);
    expect(windows.words).toBe(3);
  });

  test("AL-08 | Un emoji cuenta como 1 carácter", {
    tag: "@core",
    annotation: [{ type: "descripcion", description: "Caracteres = lo que una persona ve. Un emoji (😀) es un carácter, no dos." }],
  }, async () => {
    expect((await analyzeText("😀")).characters).toBe(1);
    expect((await analyzeText("hola 😀")).characters).toBe(6);
  });

  test("AL-09 | Archivo vacío: 0 palabras, 0 caracteres y sin histograma", {
    tag: "@core",
    annotation: [{ type: "descripcion", description: "Un archivo vacío no es un error: el resultado es cero." }],
  }, async () => {
    expect(await report("")).toBe("0 words\n0 characters");
  });

  test("AL-10 | Solo símbolos no cuenta como palabras", {
    tag: "@core",
    annotation: [{ type: "descripcion", description: "«!!! ???» son 11 caracteres pero ninguna palabra." }],
  }, async () => {
    const result = await analyzeText("!!! ??? ...");
    expect(result.words).toBe(0);
    expect(result.characters).toBe(11);
    expect(result.frequencies).toEqual([]);
  });

  test("AL-16 | Un emoji suelto cuenta como palabra y se agrupa con los iguales", {
    tag: "@core",
    annotation: [{ type: "descripcion", description: "Igual que el sitio de la prueba: «hola 😀 hola 😀» son 4 palabras y el emoji se repite 2 veces. En el desempate alfabético los símbolos van antes que las letras." }],
  }, async () => {
    const result = await analyzeText("hola 😀 hola 😀");
    expect(result.words).toBe(4);
    expect(result.frequencies).toEqual([
      { word: "😀", count: 2 },
      { word: "hola", count: 2 },
    ]);
  });

  test("AL-17 | Una tilde escrita en dos formas cuenta como la misma palabra", {
    tag: "@core",
    annotation: [{ type: "descripcion", description: "«canción» con la ñ/tilde precompuesta y «cancio» + acento combinado (dos códigos distintos, misma palabra para una persona) suman 2 repeticiones, no 2 palabras distintas." }],
  }, async () => {
    const precomposed = "canción";
    const decomposed = "cancio\u0301n";
    const result = await analyzeText(`${precomposed} ${decomposed}`);
    expect(result.frequencies).toEqual([{ word: "canción", count: 2 }]);
  });

  test("AL-11 | Singular correcto: «1 word» y «1 character»", {
    tag: "@core",
    annotation: [{ type: "descripcion", description: "La salida no dice «1 words»." }],
  }, async () => {
    expect(await report("a")).toBe("1 word\n1 character\na: 1");
  });

  test("AL-12 | Lee un archivo real de disco (UTF-8, con BOM y sin salto final)", {
    tag: "@core",
    annotation: [{ type: "descripcion", description: "Prueba de punta a punta con un archivo .txt. El BOM (marca invisible de algunos editores de Windows) no cuenta como carácter." }],
  }, async () => {
    const dir = await mkdtemp(join(tmpdir(), "freq-"));
    try {
      const file = join(dir, "con-bom.txt");
      await writeFile(file, "\uFEFF" + EXAMPLE_INPUT, "utf8");
      const result = await analyzeFile(file);
      expect(formatReport(result)).toBe(EXAMPLE_OUTPUT);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  test("AL-13 | Un archivo que no existe da un mensaje claro y código de salida 1", {
    tag: "@core",
    annotation: [{ type: "descripcion", description: "Si el usuario se equivoca de nombre, el programa avisa en castellano y no muestra un error técnico." }],
  }, async () => {
    let stderr = "";
    let status = 0;
    try {
      execFileSync(process.execPath, ["--import", "tsx", "src/word-frequency/cli.ts", "samples/no-existe.txt"], { stdio: "pipe" });
    } catch (error) {
      const e = error as { stderr: Buffer; status: number };
      stderr = e.stderr.toString("utf8");
      status = e.status;
    }
    expect(stderr).toContain("No encontré el archivo");
    expect(status).toBe(1);
  });

  test("AL-14 | La opción --bars agrega un histograma visual proporcional", {
    tag: "@core",
    annotation: [{ type: "descripcion", description: "La palabra más repetida tiene la barra más larga y las demás son proporcionales." }],
  }, async () => {
    const out = formatReport(await analyzeText(EXAMPLE_INPUT), { bars: true, barWidth: 6 });
    const lines = out.split("\n");
    expect(lines[2]).toBe("farmatodo: 6 ██████");
    expect(lines[3]).toBe("cuida: 3 ███");
  });

  test("AL-15 | Rendimiento: 1.000.000 de palabras en menos de 3 segundos", {
    tag: "@core",
    annotation: [{ type: "descripcion", description: "Evidencia de que el algoritmo es lineal: un millón de palabras se procesa en una fracción de segundo." }],
  }, async () => {
    const text = Array.from({ length: 1_000_000 }, (_, i) => `palabra${i % 1000}`).join(" ");
    const started = performance.now();
    const result = await analyzeText(text);
    const ms = performance.now() - started;
    expect(result.words).toBe(1_000_000);
    expect(result.frequencies).toHaveLength(1000);
    expect(ms, `Tardó ${Math.round(ms)} ms`).toBeLessThan(3000);
  });
});
