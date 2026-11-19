// Exploración: secuencia de capturas de la transición home -> /buscar mientras se escribe, para detectar si hay una pantalla en blanco.
import { chromium } from "@playwright/test";

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "es-AR" });
  const page = await ctx.newPage();
  await page.goto("https://www.farmatodo.com.ar/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(5000);

  const search = page.locator('input[name="search-product-ftd"]');
  await search.click();
  const t0 = Date.now();
  const word = "shampoo";
  const samples: string[] = [];
  const snap = async (tag: string) => {
    try {
      const r = await page.evaluate(() => {
        const header = document.querySelector("header, nav, .header");
        return { url: location.pathname + location.search, textLen: document.body.innerText.length, visibleImgs: [...document.images].filter((i) => i.getBoundingClientRect().height > 40 && i.complete).length, header: !!header };
      });
      samples.push(`${String(Date.now() - t0).padStart(5)} ms  ${tag.padEnd(8)} url=${r.url} textLen=${r.textLen} imgs=${r.visibleImgs}`);
    } catch {
      samples.push(`${String(Date.now() - t0).padStart(5)} ms  ${tag.padEnd(8)} (page navigating)`);
    }
  };
  for (const ch of word) {
    await page.keyboard.type(ch, { delay: 0 });
    await snap(`key ${ch}`);
    await page.waitForTimeout(150);
  }
  let shots = 0;
  for (let i = 0; i < 40; i++) {
    await snap("after");
    if ([2, 6, 12, 20].includes(i)) { await page.screenshot({ path: `exploracion/ft-06-t${i}.png` }); shots++; }
    await page.waitForTimeout(250);
  }
  console.log(samples.join("\n"));
  console.log("shots:", shots);
  await browser.close();
})();
