// Exploración: ¿el buscador pierde el foco o letras mientras una persona escribe? ¿Se recarga toda la página?
import { chromium, type Page } from "@playwright/test";

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try { return await fn(); } catch { return fallback; }
}

async function attempt(label: string, delay: number, word: string) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "es-AR" });
  const page: Page = await ctx.newPage();
  const navs: string[] = [];
  page.on("framenavigated", (f) => { if (f === page.mainFrame()) navs.push(f.url().replace("https://www.farmatodo.com.ar", "")); });
  await page.goto("https://www.farmatodo.com.ar/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(5000);
  await page.evaluate(() => { (window as unknown as { __marker: number }).__marker = 1; });

  const search = page.locator('input[name="search-product-ftd"]');
  await search.click();
  console.log(`\n=== ${label}: typing "${word}" with ${delay} ms between keys`);
  for (let i = 0; i < word.length; i++) {
    await page.keyboard.type(word[i], { delay: 0 });
    await page.waitForTimeout(delay);
    const value = await safe(() => search.inputValue(), "?");
    const focused = await safe(() => search.evaluate((e) => document.activeElement === e), false);
    const marker = await safe(() => page.evaluate(() => (window as unknown as { __marker?: number }).__marker ?? 0), -1);
    console.log(`  after "${word[i]}": value="${value}" focused=${focused} windowMarkerKept=${marker} url=${page.url().replace("https://www.farmatodo.com.ar", "")}`);
  }
  await page.waitForTimeout(3000);
  const finalValue = await safe(() => search.inputValue(), "?");
  console.log(`  FINAL input value="${finalValue}" (expected "${word}") navigations=${JSON.stringify(navs)}`);
  await page.screenshot({ path: `exploracion/ft-05-${label}.png` });
  await browser.close();
}

(async () => {
  await attempt("lento-300ms", 300, "shampoo");
  await attempt("humano-120ms", 120, "paracetamol");
  await attempt("rapido-40ms", 40, "pañales");
})();
