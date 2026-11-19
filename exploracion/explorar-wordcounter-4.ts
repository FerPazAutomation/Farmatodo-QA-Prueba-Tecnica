// Script de exploración (lote 2): empates, tamaño de la lista, casos borde de separación de palabras, escribir vs. pegar, borrar/deshacer.
import { chromium, type Page } from "@playwright/test";

const SAMPLES: Record<string, string> = {
  empate_zeta_primero: "zeta zeta alfa alfa",
  empate_alfa_primero: "alfa alfa zeta zeta",
  empate_tres_vs_dos: "tres tres dos dos uno",
  barra: "a/b word/word si/no",
  coma_miles: "1,000 3.14 hola",
  guion_medio: "e-mail perro-gato",
  parentesis_comillas: '(hola) "hola" \'hola\' hola',
  raya_larga: "hola—mundo hola—mundo",
  puntos_suspensivos: "hola...mundo hola...mundo",
  guion_bajo: "hola_mundo hola_mundo",
  alfanumerico: "abc123 abc123 xyz",
  doce_unicas: "uno dos tres cuatro cinco seis siete ocho nueve diez once doce trece catorce",
  no_latino: "こんにちは 世界 こんにちは",
  dos_letras: "ok ok si si no",
  mayus_acentos: "Canción cancion CANCIÓN",
  nbsp: "hola\u00a0mundo hola\u00a0mundo",
};

async function read(page: Page) {
  return {
    h1: (await page.locator("h1").first().innerText()).replace(/\s+/g, " "),
    kw: await page.locator("#kwd-accordion-data .list-group-item").evaluateAll((els) =>
      els.map((a) => (a.querySelector(".word")?.textContent ?? "").trim() + "=" + (a.querySelector(".badge")?.textContent ?? "").trim()),
    ),
  };
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
  await page.goto("https://wordcounter.net/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);

  for (const [name, text] of Object.entries(SAMPLES)) {
    await page.locator("#box").fill(text);
    await page.waitForTimeout(600);
    const r = await read(page);
    console.log(`\n## ${name}  ${JSON.stringify(text)}\n   ${r.h1}\n   kw(${r.kw.length}): ${r.kw.join(" | ") || "(vacío)"}`);
  }

  // Escribir como una persona real (teclas) vs. pegar todo de una vez
  await page.locator("#box").fill("");
  await page.locator("#box").pressSequentially("hola mundo hola", { delay: 40 });
  await page.waitForTimeout(600);
  console.log("\n## TYPED 'hola mundo hola'", await read(page));

  // Botón Clear
  await page.locator("#clear-btn").click();
  await page.waitForTimeout(600);
  console.log("## AFTER CLEAR", await read(page), "box=", JSON.stringify(await page.locator("#box").inputValue()));
  await page.screenshot({ path: "exploracion/wc-03-despues-clear.png" });

  // Deshacer (Undo)
  await page.locator("#undo-btn").click();
  await page.waitForTimeout(600);
  console.log("## AFTER UNDO", await read(page), "box=", JSON.stringify(await page.locator("#box").inputValue()));

  // Texto grande: 20.000 palabras
  const big = Array.from({ length: 20000 }, (_, i) => (i % 2 === 0 ? "perro" : "gato")).join(" ");
  const t0 = Date.now();
  await page.locator("#box").fill(big);
  await page.waitForFunction(() => (document.querySelector("#word_count")?.textContent ?? "").trim() === "20,000" || (document.querySelector("#word_count")?.textContent ?? "").trim() === "20000", null, { timeout: 15000 }).catch(() => {});
  console.log("\n## BIG 20000 words", Date.now() - t0, "ms", await read(page), "word_count el:", await page.locator("#word_count").innerText(), "char_count el:", await page.locator("#character_count").innerText());
  await browser.close();
})();
