// Script de exploración: prueba muchos textos y muestra lo que realmente responde wordcounter.net.
import { chromium } from "@playwright/test";

const SAMPLES: Record<string, string> = {
  ejemplo_prueba: "farmatodo farmatodo farmatodo farmatodo farmatodo cuida cuida tu salud\nfarmatodo cuida toda tu salud",
  una_palabra: "hola",
  stopwords_en: "the cat and the dog and the bird",
  stopwords_es: "el gato y el perro y el pajaro",
  mayusculas: "Hola hola HOLA mundo",
  puntuacion: "Hola, hola. hola! mundo?",
  espacios_multiples: "uno   dos    tres",
  espacios_bordes: "   hola mundo   ",
  saltos_linea: "uno\ndos\n\ntres",
  guion_apostrofe: "don't stop well-known well-known",
  numeros: "123 123 456",
  acentos_enie: "canción canción niño niño árbol",
  empate_alfabetico: "b a c b a c d",
  top3_con_empate_en_3er_lugar: "uno uno uno dos dos tres tres cuatro",
  emoji: "hola 😀 hola 😀 mundo",
  solo_simbolos: "!!! ??? ...",
  tabulacion: "a\tb\tc",
  url_email: "https://farmatodo.com info@farmatodo.com",
};

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
  await page.goto("https://wordcounter.net/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);

  for (const [name, text] of Object.entries(SAMPLES)) {
    await page.locator("#box").fill(text);
    await page.waitForTimeout(700);
    const r = {
      h1: await page.locator("h1").first().innerText(),
      words: await page.locator("#word_count").innerText(),
      chars: await page.locator("#character_count").innerText(),
      kw: await page.locator("#kwd-accordion-data .list-group-item").evaluateAll((els) =>
        els.map((a) => (a.querySelector(".word")?.textContent ?? "").trim() + " = " + (a.querySelector(".badge")?.textContent ?? "").trim()),
      ),
    };
    console.log(`\n## ${name}  ${JSON.stringify(text)}`);
    console.log(`   h1="${r.h1}" words=${r.words} chars=${r.chars}`);
    console.log(`   keywords: ${r.kw.join(" | ") || "(vacío)"}`);
  }

  // Persistencia: se recarga la página, ¿vuelve el texto? (la página menciona el autoguardado)
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);
  console.log("\nAFTER RELOAD box =", JSON.stringify(await page.locator("#box").inputValue()));
  await browser.close();
})();
