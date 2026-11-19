// Verificación: la persona busca desde el buscador (ve la promoción) y luego recarga la página (F5). ¿Cambia el precio?
import { chromium, type Page } from "@playwright/test";

async function aveno(page: Page): Promise<string> {
  const t = await page.locator("a[href*='/producto/']").filter({ hasText: "Aveno Infantil" }).first().innerText({ timeout: 8000 }).catch(() => "(no encontrado)");
  return t.replace(/\s+/g, " ").trim();
}

(async () => {
  const browser = await chromium.launch();
  try {
    for (let i = 1; i <= 3; i++) {
      const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "es-AR", timezoneId: "America/Argentina/Buenos_Aires" });
      ctx.setDefaultTimeout(15000);
      const page = await ctx.newPage();
      await page.goto("https://www.farmatodo.com.ar/", { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(5000);
      const search = page.locator('input[name="search-product-ftd"]');
      await search.click();
      await search.pressSequentially("shampoo", { delay: 100 });
      await search.press("Enter");
      await page.waitForTimeout(10000);
      const before = await aveno(page);
      if (i === 1) await page.screenshot({ path: "exploracion/ft-13-1-antes-de-recargar.png" });
      await page.reload({ waitUntil: "domcontentloaded" });
      await page.waitForTimeout(10000);
      const after = await aveno(page);
      if (i === 1) await page.screenshot({ path: "exploracion/ft-13-2-despues-de-recargar.png" });
      console.log(`intento ${i}\n  antes de F5  : ${before}\n  despues de F5: ${after}\n  url: ${page.url()}`);
      await ctx.close();
    }
  } finally {
    await browser.close();
    process.exit(0);
  }
})();
