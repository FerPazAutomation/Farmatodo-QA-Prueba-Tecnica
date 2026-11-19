// Exploración (desktop): búsqueda -> resultados -> detalle del producto -> agregar al carrito -> carrito. Captura en cada paso.
import { chromium, type Page } from "@playwright/test";

const shot = (page: Page, name: string, full = false) => page.screenshot({ path: `exploracion/${name}.png`, fullPage: full });

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "es-AR", timezoneId: "America/Argentina/Buenos_Aires" });
  const page = await ctx.newPage();
  await page.goto("https://www.farmatodo.com.ar/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(5000);

  // 1) Búsqueda con autocompletado
  const search = page.getByRole("searchbox", { name: "Buscar producto" }).or(page.locator('input[name="search-product-ftd"]')).first();
  await search.click();
  await search.pressSequentially("shampoo", { delay: 120 });
  await page.waitForTimeout(2500);
  await shot(page, "ft-03-a-autocomplete");
  console.log("after typing url:", page.url());

  await search.press("Enter");
  await page.waitForTimeout(6000);
  console.log("results url:", page.url());
  await shot(page, "ft-03-b-resultados");
  await shot(page, "ft-03-b-resultados-full", true);
  console.log("h1/h2:", JSON.stringify((await page.locator("h1,h2").allInnerTexts()).map((t) => t.trim()).filter(Boolean).slice(0, 10)));
  console.log("buttons:", JSON.stringify((await page.getByRole("button").allInnerTexts()).map((t) => t.trim().replace(/\s+/g, " ")).filter(Boolean).slice(0, 40)));
  const cards = await page.locator("a[href*='/producto/'], a[href*='/product']").evaluateAll((els) => els.slice(0, 8).map((a) => ((a.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 80)) + " -> " + a.getAttribute("href")));
  console.log("cards:", JSON.stringify(cards, null, 1));
  await browser.close();
})();
