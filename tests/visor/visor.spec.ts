// ================================================================================================================
//  PRUEBAS DE LA PÁGINA WEB LOCAL DEL CONTADOR · VI-01 a VI-14   (parte del punto 4)
// ================================================================================================================
//  Abren visor/contador-palabras.html directamente desde el disco (sin servidor y sin internet), escriben o cargan un
//  texto y comprueban que la página muestre: palabras, caracteres, palabras distintas, el puesto, las veces y el
//  porcentaje de cada palabra, el orden alfabético en los empates y la salida de texto.
//
//  Cómo se asegura que la página hace "exactamente lo mismo" que el programa de consola:
//   - Los valores de VI-01, VI-03, VI-04 y VI-13 están escritos a mano (no salen del algoritmo).
//   - En el resto se compara con el algoritmo real (src/word-frequency) y con formatReport (la salida de consola).
//   - VI-12 verifica que el HTML guardado en el repositorio es el que se genera hoy con el código actual.
//  Se ejecutan con: npm run test:visor
// ================================================================================================================
import { test as base, expect, type Page } from "@playwright/test";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { analyzeFile, analyzeText } from "../../src/word-frequency/analyzer";
import { formatReport } from "../../src/word-frequency/histogram";
import { construirVisor, RUTA_SALIDA } from "../../scripts/construir-visor";

const URL_VISOR = pathToFileURL(RUTA_SALIDA).href;
const ARCHIVO_EJEMPLO = resolve("samples/ejemplo-farmatodo.txt");

// Texto del enunciado original de la prueba (14 palabras, 99 caracteres).
const ENUNCIADO = "farmatodo farmatodo farmatodo farmatodo farmatodo cuida cuida tu salud\nfarmatodo cuida toda tu salud";

interface Fila {
  puesto: number;
  palabra: string;
  veces: number;
  porcentaje: string;
}

/** Cada prueba abre la página en un navegador limpio y adjunta una captura como evidencia al terminar. */
const test = base.extend<{ visor: Page }>({
  visor: async ({ page }, use, testInfo) => {
    await page.goto(URL_VISOR);
    await use(page);
    if (page.isClosed()) return;
    const ruta = testInfo.outputPath("evidencia.png");
    await writeFile(ruta, await page.screenshot());
    await testInfo.attach("evidencia", { path: ruta, contentType: "image/png" });
  },
});

/** Lee las filas que la página dibuja en la tabla de resultados. */
async function leerFilas(page: Page): Promise<Fila[]> {
  return page.locator("#tabla-resultados tbody tr").evaluateAll((filas) =>
    filas.map((tr) => ({
      puesto: Number(tr.querySelector(".puesto")?.textContent),
      palabra: tr.querySelector(".palabra")?.textContent ?? "",
      veces: Number(tr.querySelector(".veces")?.textContent),
      porcentaje: tr.querySelector(".porcentaje")?.textContent ?? "",
    })),
  );
}

/** Formato de porcentaje esperado: un decimal y coma. Se escribe aparte a propósito, no se reutiliza el código de la página. */
function porcentajeEsperado(veces: number, total: number): string {
  return `${((veces * 100) / total).toFixed(1).replace(".", ",")} %`;
}

/** Filas esperadas calculadas con el algoritmo real y con las reglas de puesto y porcentaje escritas acá. */
async function filasEsperadas(texto: string): Promise<{ words: number; characters: number; filas: Fila[] }> {
  const r = await analyzeText(texto);
  let puesto = 0;
  const filas = r.frequencies.map((f, i) => {
    if (i === 0 || f.count !== r.frequencies[i - 1].count) puesto = i + 1;
    return { puesto, palabra: f.word, veces: f.count, porcentaje: porcentajeEsperado(f.count, r.words) };
  });
  return { words: r.words, characters: r.characters, filas };
}

async function escribir(page: Page, texto: string): Promise<void> {
  await page.locator("#texto").fill(texto);
}

async function verificarTotales(page: Page, words: number, characters: number, distintas: number): Promise<void> {
  await expect(page.locator("#total-palabras"), "Total de palabras").toHaveText(String(words));
  await expect(page.locator("#total-caracteres"), "Total de caracteres").toHaveText(String(characters));
  await expect(page.locator("#total-distintas"), "Palabras distintas").toHaveText(String(distintas));
}

const resumen = (texto: string) => JSON.stringify(texto.length > 120 ? `${texto.slice(0, 120)}… (${texto.length} caracteres)` : texto);

test.describe("Página web local del contador de palabras", () => {
  test("VI-01 | Texto del enunciado: totales, porcentajes y orden (valores escritos a mano)", {
    tag: "@core",
    annotation: [
      { type: "descripcion", description: "Con el texto del enunciado la página debe mostrar 14 palabras y 99 caracteres. farmatodo 6 veces (42,9 %), cuida 3 (21,4 %), salud y tu 2 (14,3 %) en empate, y toda 1 (7,1 %)." },
      { type: "entrada", description: resumen(ENUNCIADO) },
    ],
  }, async ({ visor }) => {
    await escribir(visor, ENUNCIADO);
    await verificarTotales(visor, 14, 99, 5);
    await expect.poll(() => leerFilas(visor), { message: "Filas de la tabla" }).toEqual([
      { puesto: 1, palabra: "farmatodo", veces: 6, porcentaje: "42,9 %" },
      { puesto: 2, palabra: "cuida", veces: 3, porcentaje: "21,4 %" },
      { puesto: 3, palabra: "salud", veces: 2, porcentaje: "14,3 %" },
      { puesto: 3, palabra: "tu", veces: 2, porcentaje: "14,3 %" },
      { puesto: 5, palabra: "toda", veces: 1, porcentaje: "7,1 %" },
    ]);
  });

  test("VI-02 | Cargar un archivo .txt da lo mismo que el programa de consola", {
    tag: "@core",
    annotation: [
      { type: "descripcion", description: "Se carga samples/ejemplo-farmatodo.txt con el botón «Cargar archivo» y se compara lo que muestra la página con lo que calcula el programa de consola sobre ese mismo archivo (analyzeFile)." },
      { type: "entrada", description: "samples/ejemplo-farmatodo.txt" },
    ],
  }, async ({ visor }) => {
    const desdeArchivo = await analyzeFile(ARCHIVO_EJEMPLO);
    await visor.locator("#archivo").setInputFiles(ARCHIVO_EJEMPLO);
    await verificarTotales(visor, desdeArchivo.words, desdeArchivo.characters, desdeArchivo.frequencies.length);
    await expect(visor.locator("#nombre-archivo")).toContainText("ejemplo-farmatodo.txt");
    let puesto = 0;
    const esperadas = desdeArchivo.frequencies.map((f, i) => {
      if (i === 0 || f.count !== desdeArchivo.frequencies[i - 1].count) puesto = i + 1;
      return { puesto, palabra: f.word, veces: f.count, porcentaje: porcentajeEsperado(f.count, desdeArchivo.words) };
    });
    await expect.poll(() => leerFilas(visor), { message: "Filas de la tabla" }).toEqual(esperadas);
  });

  test("VI-03 | Empates: orden alfabético en español (con ñ y tildes) y puesto compartido (valores a mano)", {
    tag: "@core",
    annotation: [
      { type: "descripcion", description: "pera, banana y ñandú aparecen 2 veces cada una y empatan: deben salir en orden alfabético del español (banana, ñandú, pera) con el mismo puesto 1. «árbol» y «cebra» empatan con 1 y comparten el puesto 4." },
      { type: "entrada", description: resumen("pera pera banana banana ñandú ñandú árbol cebra") },
    ],
  }, async ({ visor }) => {
    await escribir(visor, "pera pera banana banana ñandú ñandú árbol cebra");
    await verificarTotales(visor, 8, 47, 5);
    await expect.poll(() => leerFilas(visor), { message: "Filas de la tabla" }).toEqual([
      { puesto: 1, palabra: "banana", veces: 2, porcentaje: "25,0 %" },
      { puesto: 1, palabra: "ñandú", veces: 2, porcentaje: "25,0 %" },
      { puesto: 1, palabra: "pera", veces: 2, porcentaje: "25,0 %" },
      { puesto: 4, palabra: "árbol", veces: 1, porcentaje: "12,5 %" },
      { puesto: 4, palabra: "cebra", veces: 1, porcentaje: "12,5 %" },
    ]);
  });

  test("VI-04 | Emoji cuenta 1 carácter y la tilde suelta es igual a la tilde integrada (valores a mano)", {
    tag: "@core",
    annotation: [
      { type: "descripcion", description: "El texto trae dos emoji y «canción» escrita de tres formas (minúscula, mayúscula y con la tilde como carácter aparte). Debe dar 5 palabras, 27 caracteres, canción 3 veces (60,0 %) y el emoji 2 veces (40,0 %)." },
      { type: "entrada", description: resumen("😀 😀 canción Canción cancio\u0301n") },
    ],
  }, async ({ visor }) => {
    await escribir(visor, "😀 😀 canción Canción cancio\u0301n");
    await verificarTotales(visor, 5, 27, 2);
    await expect.poll(() => leerFilas(visor), { message: "Filas de la tabla" }).toEqual([
      { puesto: 1, palabra: "canción", veces: 3, porcentaje: "60,0 %" },
      { puesto: 2, palabra: "😀", veces: 2, porcentaje: "40,0 %" },
    ]);
  });

  test("VI-05 | Sin texto: todo en cero, sin tabla y con un mensaje claro", {
    tag: "@core",
    annotation: [
      { type: "descripcion", description: "Al abrir la página (sin texto) debe mostrar 0 palabras, 0 caracteres, 0 distintas, ocultar la tabla, mostrar el mensaje de «todavía no hay palabras» y la salida de texto «0 words / 0 characters»." },
      { type: "entrada", description: "(vacío)" },
    ],
  }, async ({ visor }) => {
    await verificarTotales(visor, 0, 0, 0);
    await expect(visor.locator("#tabla-resultados")).toBeHidden();
    await expect(visor.locator("#estado-vacio")).toBeVisible();
    await expect(visor.locator("#salida-texto")).toHaveText("0 words\n0 characters");
  });

  const textosSalida: Array<{ id: string; nombre: string; texto: string }> = [
    { id: "a", nombre: "enunciado", texto: ENUNCIADO },
    { id: "b", nombre: "empates con ñ y tildes", texto: "pera pera banana banana ñandú ñandú árbol cebra" },
    { id: "c", nombre: "mayúsculas y puntuación", texto: "Hola, hola. HOLA! ¿Qué tal? que TAL; qué" },
    { id: "d", nombre: "saltos de línea CRLF y espacios repetidos", texto: "uno   uno\r\ndos\r\n\r\n  dos   tres" },
    { id: "e", nombre: "solo símbolos y palabras con guion", texto: "!!! --- e-mail perro-gato e-mail ???" },
    { id: "f", nombre: "una sola palabra", texto: "hola" },
  ];
  for (const caso of textosSalida) {
    test(`VI-06${caso.id} | Salida de texto, totales y filas iguales al algoritmo real (${caso.nombre})`, {
      tag: "@core",
      annotation: [
        { type: "descripcion", description: "La salida de texto de la página debe ser idéntica a la del programa de consola (formatReport). Los totales y las filas deben coincidir con el algoritmo real, con puesto y porcentaje calculados aparte." },
        { type: "entrada", description: resumen(caso.texto) },
      ],
    }, async ({ visor }) => {
      const esperado = await filasEsperadas(caso.texto);
      await escribir(visor, caso.texto);
      await verificarTotales(visor, esperado.words, esperado.characters, esperado.filas.length);
      await expect.poll(() => leerFilas(visor), { message: "Filas de la tabla" }).toEqual(esperado.filas);
      await expect(visor.locator("#salida-texto"), "Salida de texto").toHaveText(formatReport(await analyzeText(caso.texto)));
    });
  }

  test("VI-07 | «Mostrar las 10 primeras» limita las filas, y «todas» las muestra todas", {
    tag: "@core",
    annotation: [
      { type: "descripcion", description: "Con 15 palabras distintas, elegir «las 10 primeras» deja 10 filas (las de mayor cantidad). Volver a «todas» muestra las 15." },
      { type: "entrada", description: "palabra01 … palabra15 (las primeras repetidas más veces)" },
    ],
  }, async ({ visor }) => {
    const palabras = Array.from({ length: 15 }, (_, i) => `palabra${String(i + 1).padStart(2, "0")}`);
    // palabra01 aparece 15 veces, palabra02 14 veces ... palabra15 1 vez: orden y cantidades distintas.
    const texto = palabras.flatMap((p, i) => Array(15 - i).fill(p)).join(" ");
    await escribir(visor, texto);
    await expect(visor.locator("#tabla-resultados tbody tr")).toHaveCount(15);
    await visor.locator("#cantidad-mostrar").selectOption("10");
    await expect(visor.locator("#tabla-resultados tbody tr")).toHaveCount(10);
    const filas = await leerFilas(visor);
    expect(filas.map((f) => f.palabra), "Las 10 primeras en orden").toEqual(palabras.slice(0, 10));
    await visor.locator("#cantidad-mostrar").selectOption("0");
    await expect(visor.locator("#tabla-resultados tbody tr")).toHaveCount(15);
  });

  test("VI-08 | Los botones «Usar ejemplo» y «Limpiar» funcionan", {
    tag: "@core",
    annotation: [
      { type: "descripcion", description: "«Usar ejemplo» carga el texto del enunciado (14 palabras). «Limpiar» vacía el cuadro de texto y deja todo en cero." },
      { type: "entrada", description: "Clic en «Usar ejemplo» y luego en «Limpiar»" },
    ],
  }, async ({ visor }) => {
    await visor.getByRole("button", { name: "Usar ejemplo" }).click();
    await verificarTotales(visor, 14, 99, 5);
    await expect(visor.locator("#texto")).toHaveValue(ENUNCIADO);
    await visor.getByRole("button", { name: "Limpiar" }).click();
    await verificarTotales(visor, 0, 0, 0);
    await expect(visor.locator("#texto")).toHaveValue("");
    await expect(visor.locator("#estado-vacio")).toBeVisible();
  });

  test("VI-09 | Funciona sin internet: no pide nada fuera del archivo", {
    tag: "@core",
    annotation: [
      { type: "descripcion", description: "Mientras se usa la página no debe hacer ninguna petición de red (ni fuentes, ni scripts, ni imágenes externas). Todo viene dentro del único archivo HTML." },
      { type: "entrada", description: "Abrir la página, escribir un texto y cargar un archivo" },
    ],
  }, async ({ page }, testInfo) => {
    const pedidos: string[] = [];
    page.on("request", (r) => pedidos.push(r.url()));
    await page.goto(URL_VISOR);
    await page.locator("#texto").fill(ENUNCIADO);
    await verificarTotales(page, 14, 99, 5);
    await page.locator("#archivo").setInputFiles(ARCHIVO_EJEMPLO);
    await expect(page.locator("#nombre-archivo")).toContainText("ejemplo-farmatodo.txt");
    expect(pedidos.filter((u) => !u.startsWith("file:")), "Peticiones que no son del archivo local").toEqual([]);
    const ruta = testInfo.outputPath("evidencia.png");
    await writeFile(ruta, await page.screenshot());
    await testInfo.attach("evidencia", { path: ruta, contentType: "image/png" });
  });

  test("VI-10 | Lo escrito no se interpreta como código HTML ni se ejecuta", {
    tag: "@core",
    annotation: [
      { type: "descripcion", description: "Si el texto trae etiquetas HTML o un intento de ejecutar código, la página las muestra como texto: no crea elementos ni abre diálogos." },
      { type: "entrada", description: resumen("<b>hola</b> <img src=x onerror=alert(1)> <script>alert(2)</script>") },
    ],
  }, async ({ visor }) => {
    const texto = "<b>hola</b> <img src=x onerror=alert(1)> <script>alert(2)</script>";
    let dialogo = false;
    visor.on("dialog", async (d) => {
      dialogo = true;
      await d.dismiss();
    });
    const esperado = await filasEsperadas(texto);
    await escribir(visor, texto);
    await verificarTotales(visor, esperado.words, esperado.characters, esperado.filas.length);
    await expect.poll(() => leerFilas(visor)).toEqual(esperado.filas);
    await visor.waitForTimeout(300);
    expect(dialogo, "Se abrió un diálogo (código ejecutado)").toBe(false);
    await expect(visor.locator("#tabla-resultados img, #tabla-resultados b, #tabla-resultados script"), "Elementos creados desde el texto").toHaveCount(0);
  });

  test("VI-11 | Texto largo (20.000 palabras): porcentajes y empate correctos y respuesta rápida", {
    tag: "@core",
    annotation: [
      { type: "descripcion", description: "«perro» y «gato» se alternan 10.000 veces cada una: 20.000 palabras, 2 distintas, 50,0 % cada una, mismo puesto 1 y «gato» antes que «perro» (orden alfabético). El resultado debe aparecer en pocos segundos." },
      { type: "entrada", description: "perro gato perro gato … (20.000 palabras)" },
    ],
  }, async ({ visor }) => {
    const texto = Array.from({ length: 10_000 }, () => "perro gato").join(" ");
    await escribir(visor, texto);
    await verificarTotales(visor, 20_000, 109_999, 2);
    await expect.poll(() => leerFilas(visor)).toEqual([
      { puesto: 1, palabra: "gato", veces: 10_000, porcentaje: "50,0 %" },
      { puesto: 1, palabra: "perro", veces: 10_000, porcentaje: "50,0 %" },
    ]);
  });

  test("VI-12 | El HTML guardado en el repositorio es el que se genera con el código actual", {
    tag: "@core",
    annotation: [
      { type: "descripcion", description: "Genera la página en memoria con `npm run visor:construir` (algoritmo actual + plantilla) y comprueba que sea idéntica al archivo visor/contador-palabras.html. Si el algoritmo o la plantilla cambian y no se regenera el HTML, esta prueba falla." },
      { type: "entrada", description: "visor/contador-palabras.html" },
    ],
  }, async ({ visor }) => {
    const generado = await construirVisor();
    const guardado = (await readFile(RUTA_SALIDA, "utf8")).replace(/\r\n/g, "\n");
    expect(guardado === generado, "visor/contador-palabras.html está desactualizado: ejecutar `npm run visor:construir`").toBe(true);
    await expect(visor.locator("h1")).toHaveText("Contador de frecuencia de palabras");
  });

  test("VI-13 | Archivo con BOM y saltos de línea de Windows (CRLF) se lee igual que en el programa de consola (valores a mano)", {
    tag: "@core",
    annotation: [
      { type: "descripcion", description: "Un archivo UTF-8 con BOM (marca invisible del inicio) y saltos CRLF no debe contar el BOM como carácter: «hola hola» + «mundo» = 3 palabras y 14 caracteres. hola 2 veces (66,7 %) y mundo 1 vez (33,3 %)." },
      { type: "entrada", description: "\\uFEFFhola hola\\r\\nmundo" },
    ],
  }, async ({ visor }) => {
    await visor.locator("#archivo").setInputFiles({ name: "con-bom.txt", mimeType: "text/plain", buffer: Buffer.from("\uFEFFhola hola\r\nmundo", "utf8") });
    await verificarTotales(visor, 3, 14, 2);
    await expect.poll(() => leerFilas(visor)).toEqual([
      { puesto: 1, palabra: "hola", veces: 2, porcentaje: "66,7 %" },
      { puesto: 2, palabra: "mundo", veces: 1, porcentaje: "33,3 %" },
    ]);
  });

  test("VI-14 | Al editar el texto, los resultados se actualizan y no quedan datos viejos", {
    tag: "@core",
    annotation: [
      { type: "descripcion", description: "Se escribe un texto, se cambia por otro y se vuelve a cambiar: la página siempre muestra el resultado del último texto, sin mezclar filas anteriores." },
      { type: "entrada", description: resumen("uno uno dos  ->  tres  ->  cuatro cuatro cuatro cinco") },
    ],
  }, async ({ visor }) => {
    await escribir(visor, "uno uno dos");
    await verificarTotales(visor, 3, 11, 2);
    await escribir(visor, "tres");
    await verificarTotales(visor, 1, 4, 1);
    await expect.poll(() => leerFilas(visor)).toEqual([{ puesto: 1, palabra: "tres", veces: 1, porcentaje: "100,0 %" }]);
    await escribir(visor, "cuatro cuatro cuatro cinco");
    await verificarTotales(visor, 4, 26, 2);
    await expect.poll(() => leerFilas(visor)).toEqual([
      { puesto: 1, palabra: "cuatro", veces: 3, porcentaje: "75,0 %" },
      { puesto: 2, palabra: "cinco", veces: 1, porcentaje: "25,0 %" },
    ]);
  });
});
