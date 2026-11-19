// Script de exploración: escribe distintos textos y vuelca lo que muestra el sitio.
import { chromium } from "@playwright/test";

const SAMPLES: Record<string, string> = {
  ejemplo_prueba: "farmatodo farmatodo farmatodo farmatodo farmatodo cuida cuida tu salud\nfarmatodo cuida toda tu salud",
  ingles_stopwords: "the cat and the dog and the bird",
  mayusculas: "Hola hola HOLA mundo",
  puntuacion: "Hola, hola. hola! mundo?",
  espacios_multiples: "uno   dos    tres",
  guion_apostrofe: "don't stop well-known well-known",
  numeros: "123 123 456",
  acentos: "canción canción niño niño árbol",
  empate: "b a c b a c d",
};

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
  await page.goto("https://wordcounter.net/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);

  // 1) Mirar el DOM de Details y Keyword Density una vez que hay texto
  await page.locator("#box").fill(SAMPLES.ejemplo_prueba);
  await page.waitForTimeout(1500);
  const dom = await page.evaluate(() => {
    const kd = document.querySelector("#kd_list, .keyword-density, #keyword_density");
    const aside = [...document.querySelectorAll("h3")].find((h) => (h.textContent || "").includes("Keyword Density"));
    const panel = aside?.closest("div");
    return {
      h1: document.querySelector("h1")?.textContent?.trim(),
      kdFound: !!kd,
      kdHtml: panel?.parentElement?.outerHTML.slice(0, 3500),
    };
  });
  console.log("=== DOM ===");
  console.log(JSON.stringify(dom, null, 2));
  const detailsHtml = await page.evaluate(() => {
    const h = [...document.querySelectorAll("h3")].find((e) => (e.textContent || "").trim() === "Details");
    return h?.closest(".panel, div")?.parentElement?.outerHTML.slice(0, 3000);
  });
  console.log("=== DETAILS HTML ===\n", detailsHtml);
  await page.screenshot({ path: "exploracion/wc-02-ejemplo.png", fullPage: true });

  await browser.close();
})();
