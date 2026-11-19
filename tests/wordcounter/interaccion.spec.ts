// Escenarios sobre cómo se comporta la página mientras una persona la usa: escribir, borrar, limpiar, pegar,
// que los totales coincidan en los tres lugares donde se muestran, y comportamientos que se documentan.
// A diferencia de conteo.spec.ts (un texto -> un resultado), aquí cada prueba tiene su propio recorrido.
import { crossCheckParagraph, scenarios, type Scenario } from "../../data/scenarios";
import { expectScenario, formatNumber, preview } from "../../helpers/assertions";
import { expect, test } from "../../helpers/fixtures";
import { analyzeText } from "../../src/word-frequency/analyzer";

const example = scenarios.find((s) => s.id === "SC-01") as Scenario;

test.describe("WordCounter · uso real de la página", () => {
  test("SC-13 | Escribir tecla por tecla y borrar todo actualiza los contadores", {
    tag: "@core",
    annotation: [
      {
        type: "descripcion",
        description:
          "Una persona escribe letra por letra, no pega todo junto. Verifico que los números se actualicen al escribir y vuelvan a cero al borrar todo el texto.",
      },
      { type: "entrada", description: preview("hola mundo hola") },
    ],
  }, async ({ wc }) => {
    // Se escribe tecla por tecla (como una persona) y se verifica que los contadores se actualicen.
    await wc.typeLikeUser("hola mundo hola");
    await expect.soft(wc.wordCount, "Número de palabras después de escribir").toHaveText("3");
    await expect.soft(wc.characterCount, "Número de caracteres después de escribir").toHaveText("15");
    await expect.configure({ soft: true }).poll(async () => (await wc.readKeywords()).map((k) => `${k.word}:${k.count}`).join(","), {
      message: "Keyword Density después de escribir",
    }).toBe("hola:2,mundo:1");

    // Seleccionar todo y borrar: todo debe volver a cero.
    await wc.editor.press("Control+A");
    await wc.editor.press("Delete");
    await expect.soft(wc.wordCount, "Número de palabras después de borrar todo").toHaveText("0");
    await expect.soft(wc.characterCount, "Número de caracteres después de borrar todo").toHaveText("0");
    await expect.configure({ soft: true }).poll(() => wc.readKeywords().then((k) => k.length), {
      message: "Cantidad de palabras en Keyword Density después de borrar todo",
    }).toBe(0);
  });

  test("SC-14 | Un texto largo (20.000 palabras) se cuenta bien y usa separador de miles", {
    tag: "@core",
    annotation: [
      {
        type: "descripcion",
        description:
          "Un documento real puede ser largo. Verifico que el sitio cuente 20.000 palabras sin errores y que escriba los números grandes con coma (20,000), como se muestra en pantalla.",
      },
    ],
  }, async ({ wc }) => {
    // Texto de 20.000 palabras alternando "perro" y "gato". Los valores esperados se calculan a mano (ver abajo).
    const text = Array.from({ length: 20_000 }, (_, i) => (i % 2 === 0 ? "perro" : "gato")).join(" ");
    const scenario: Scenario = {
      id: "SC-14",
      category: "core",
      title: "Texto largo",
      plain: "",
      text,
      // Caracteres: 10.000 x "perro"(5) + 10.000 x "gato"(4) + 19.999 espacios = 109.999
      expected: { words: 20_000, characters: 109_999, frequencies: { perro: 10_000, gato: 10_000 } },
    };
    await wc.enterText(text);
    // Al reporte solo se le pasa un resumen del texto, para que no quede un mensaje de 100 mil caracteres.
    await expectScenario(wc, { ...scenario, text: `${scenario.text.slice(0, 20)}… (20.000 palabras)` });
    await expect.soft(wc.headline, "Título principal con separador de miles").toHaveText(`${formatNumber(20_000)} words ${formatNumber(109_999)} characters`);
  });

  test("SC-15 | El botón Clear deja todo en cero", {
    tag: "@core",
    annotation: [
      { type: "descripcion", description: "Después de limpiar, el editor queda vacío, los totales vuelven a 0 y Keyword Density no muestra palabras viejas." },
    ],
  }, async ({ wc }) => {
    await wc.enterText(example.text);
    await expect(wc.wordCount).toHaveText("14");
    await wc.clearButton.click();
    await expect.soft(wc.editor, "Contenido del editor después de Clear").toHaveValue("");
    await expect.soft(wc.headline, "Título principal después de Clear").toHaveText("0 words 0 characters");
    await expect.soft(wc.wordCount, "Número de palabras después de Clear").toHaveText("0");
    await expect.soft(wc.characterCount, "Número de caracteres después de Clear").toHaveText("0");
    await expect.configure({ soft: true }).poll(() => wc.readKeywords().then((k) => k.length), {
      message: "Palabras listadas en Keyword Density después de Clear",
    }).toBe(0);
  });

  test("SC-16 | El total es el mismo en los tres lugares donde se muestra", {
    tag: "@core",
    annotation: [
      {
        type: "descripcion",
        description:
          "Los totales aparecen en el título grande, en la barra debajo del editor y en el panel «Details». Los tres tienen que decir lo mismo y escribir bien el singular («1 word»).",
      },
      { type: "entrada", description: preview(example.text) },
    ],
  }, async ({ wc }) => {
    await wc.enterText(example.text);
    await expect.soft(wc.headline, "Título principal").toHaveText("14 words 99 characters");
    await expect.soft(wc.footerSummary, "Barra debajo del editor").toHaveText("14 words 99 characters");
    await expect.soft(wc.wordCount, "Panel Details · Words").toHaveText("14");
    await expect.soft(wc.characterCount, "Panel Details · Characters").toHaveText("99");

    await wc.enterText("hola");
    await expect.soft(wc.headline, "Título principal con una sola palabra (singular)").toHaveText("1 word 4 characters");
    await expect.soft(wc.footerSummary, "Barra debajo del editor con una sola palabra (singular)").toHaveText("1 word 4 characters");
  });

  test("SC-17 | Pegar un texto desde el portapapeles (Ctrl+V) se cuenta igual que escribirlo", {
    tag: "@core",
    annotation: [
      {
        type: "descripcion",
        description: "El propio sitio invita a «copiar y pegar tu documento». Copio el texto del enunciado al portapapeles y lo pego con Ctrl+V como lo haría una persona.",
      },
      { type: "entrada", description: preview(example.text) },
    ],
  }, async ({ wc, context, page }) => {
    // El navegador automatizado necesita permiso explícito para usar el portapapeles.
    await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin: "https://wordcounter.net" });
    await page.evaluate((text) => navigator.clipboard.writeText(text), example.text);
    await wc.editor.click();
    await wc.editor.press("Control+V");
    await expectScenario(wc, example);
  });

  test("SC-18 | El sitio y el algoritmo del punto 4 coinciden en un párrafo real", {
    tag: "@core",
    annotation: [
      {
        type: "descripcion",
        description:
          "Verificación cruzada: se calcula el resultado esperado con el algoritmo del punto 4 y se compara con lo que muestra el sitio para un párrafo en español.",
      },
      { type: "entrada", description: preview(crossCheckParagraph) },
    ],
  }, async ({ wc }) => {
    // El resultado esperado sale del algoritmo del punto 4, no de lo que muestra el sitio.
    const result = await analyzeText(crossCheckParagraph);
    const scenario: Scenario = {
      id: "SC-18",
      category: "core",
      title: "Verificación cruzada",
      plain: "",
      text: `${crossCheckParagraph.slice(0, 40)}… (párrafo completo)`,
      expected: {
        words: result.words,
        characters: result.characters,
        frequencies: Object.fromEntries(result.frequencies.map((f) => [f.word, f.count])),
      },
    };
    await wc.enterText(crossCheckParagraph);
    await expectScenario(wc, scenario);
  });

  test("SC-19 | Estado inicial con la configuración por defecto", {
    tag: "@core",
    annotation: [
      {
        type: "descripcion",
        description:
          "Antes de escribir nada, el sitio muestra todo en cero, la lista de palabras sugiere empezar a escribir, está activa la vista «x1» (palabras sueltas) y el guardado automático está apagado. Esta es la configuración que uso en todas las pruebas, sin cambiar nada.",
      },
    ],
  }, async ({ wc, page }) => {
    await expect.soft(wc.headline, "Título principal inicial").toHaveText("0 words 0 characters");
    await expect.soft(wc.editor, "Editor inicial").toHaveValue("");
    await expect.soft(wc.keywordTabX1, "Vista x1 de Keyword Density activa por defecto").toHaveClass(/active_consecutive/);
    await expect.soft(wc.autoSaveButton, "Estado inicial de AUTO-SAVE").toContainText("OFF");
    await expect.soft(page.getByText("Start typing your document to get a list of most used keywords"), "Mensaje inicial de Keyword Density").toBeVisible();
  });
});

test.describe("WordCounter · comportamientos documentados (observaciones)", () => {
  test("OB-01 | Cuando hay empate, el sitio ordena por orden de aparición (no alfabético)", {
    tag: "@observacion",
    annotation: [
      {
        type: "descripcion",
        description:
          "Documento cómo desempata el sitio: la palabra que aparece primero en el texto va primero en la lista. No es alfabético. Lo dejo como prueba para que, si algún día cambia, nos enteremos. Por eso mis pruebas de top 3 no exigen un orden dentro de un empate.",
      },
    ],
  }, async ({ wc }) => {
    const order = async () => (await wc.readKeywords()).map((k) => k.word).join(",");
    await wc.enterText("zeta zeta alfa alfa");
    await expect.configure({ soft: true }).poll(order, { message: "Orden con empate (zeta aparece primero)" }).toBe("zeta,alfa");
    await wc.enterText("alfa alfa zeta zeta");
    await expect.configure({ soft: true }).poll(order, { message: "Orden con empate (alfa aparece primero)" }).toBe("alfa,zeta");
  });

  test("OB-02 | Keyword Density lista como máximo 10 palabras", {
    tag: "@observacion",
    annotation: [
      {
        type: "descripcion",
        description: "La propia página dice que muestra las 10 palabras clave principales. Con 14 palabras distintas, la lista tiene exactamente 10. De ahí salen las 3 más repetidas.",
      },
    ],
  }, async ({ wc }) => {
    await wc.enterText("uno dos tres cuatro cinco seis siete ocho nueve diez once doce trece catorce");
    await expect.configure({ soft: true }).poll(() => wc.readKeywords().then((k) => k.length), {
      message: "Cantidad de palabras listadas en Keyword Density con 14 palabras distintas",
    }).toBe(10);
  });
});

test.describe("WordCounter · hallazgos (comportamiento que se desvía de lo esperado)", () => {
  test("ED-09 | Con AUTO-SAVE en OFF el texto no debería quedar guardado al recargar", {
    tag: "@hallazgo",
    annotation: [
      {
        type: "descripcion",
        description:
          "El botón dice «AUTO-SAVE OFF» (apagado). Si cierro o recargo la página, lo razonable es empezar con el editor vacío. Si el texto vuelve, el sitio lo guardó igual en este navegador. Es un tema de coherencia y de privacidad en computadoras compartidas.",
      },
      { type: "entrada", description: preview("texto privado de prueba") },
      { type: "hallazgo", description: "BUG-001 [Desktop] Con AUTO-SAVE en OFF el texto se guarda igual" },
    ],
  }, async ({ wc, page }) => {
    await expect(wc.autoSaveButton, "Condición previa: AUTO-SAVE debe estar en OFF").toContainText("OFF");
    await wc.enterText("texto privado de prueba");
    // Se espera a que el sitio guarde lo escrito (lo hace en segundo plano) antes de recargar.
    // La espera es OBLIGATORIA: si el texto nunca se guarda, la prueba debe fallar aquí y no pasar en falso
    // (si no hubiera nada guardado, la recarga mostraría el editor vacío y el resultado no probaría nada).
    await page.waitForFunction(() => localStorage.getItem("text") === "texto privado de prueba", null, { timeout: 15_000 });
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(wc.editor).toBeVisible();
    await expect.soft(wc.editor, "Contenido del editor después de recargar con AUTO-SAVE en OFF").toHaveValue("");
  });
});