// Comparación A/B: mismo producto, misma búsqueda. Camino A = home -> escribir en el buscador. Camino B = abrir directamente la URL de resultados.
import { chromium, type Page } from "@playwright/test";

const URL = "https://www.farmatodo.com.ar/buscar?product=shampoo&departamento=Todos&filtros=";
const NAMES = ["Aveno Infantil", "Johnson"];

async function prices(page: Page): Promise<string> {
  const out: string[] = [];
  for (const n of NAMES) {
    const t = await page.locator("a[href*='/producto/']").filter({ hasText: n }).first().innerText({ timeout: 8000 }).catch(() => "(no encontrado)");
    out.push(t.replace(/\s+/g, " ").replace(/Shampoo /, "").trim());
  }
  return out.join("  ||  ");
}

(async () => {
  const browser = await chromium.launch();
  try {
    for (let i = 1; i <= 3; i++) {
      // Camino A: a través de la interfaz (el buscador)
      let ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "es-AR", timezoneId: "America/Argentina/Buenos_Aires" });
      ctx.setDefaultTimeout(15000);
      let page = await ctx.newPage();
      await page.goto("https://www.farmatodo.com.ar/", { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(5000);
      const search = page.locator('input[name="search-product-ftd"]');
      await search.click();
      await search.pressSequentially("shampoo", { delay: 100 });
      await search.press("Enter");
      await page.waitForTimeout(10000);
      console.log(`A${i} (home -> buscador) : ${await prices(page)}`);
      if (i === 1) await page.screenshot({ path: "exploracion/ft-12-A-via-buscador.png" });
      await ctx.close();

      // Camino B: URL directa
      ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "es-AR", timezoneId: "America/Argentina/Buenos_Aires" });
      ctx.setDefaultTimeout(15000);
      page = await ctx.newPage();
      await page.goto(URL, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(10000);
      console.log(`B${i} (URL directa)      : ${await prices(page)}`);
      if (i === 1) await page.screenshot({ path: "exploracion/ft-12-B-url-directa.png" });
      await ctx.close();
    }
  } finally {
    await browser.close();
    process.exit(0);
  }
})();
