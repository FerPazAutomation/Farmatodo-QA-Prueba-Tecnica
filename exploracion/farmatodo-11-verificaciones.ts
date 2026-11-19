// Verificación: (a) estabilidad del precio promocional en cargas nuevas, (b) qué hace la burbuja "1" al hacer clic.
import { chromium, type Page } from "@playwright/test";

const URL = "https://www.farmatodo.com.ar/buscar?product=shampoo&departamento=Todos&filtros=";

async function priceOf(page: Page, name: string): Promise<string> {
  const card = page.locator("a[href*='/producto/']").filter({ hasText: name }).first();
  const text = await card.innerText({ timeout: 8000 }).catch(() => "(no encontrado)");
  return text.replace(/\s+/g, " ").trim();
}

(async () => {
  const browser = await chromium.launch();
  try {
    console.log("== (a) estabilidad de precio/promo (6 cargas nuevas, desktop, directo a la URL)");
    for (let i = 1; i <= 6; i++) {
      const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "es-AR", timezoneId: "America/Argentina/Buenos_Aires" });
      ctx.setDefaultTimeout(15000);
      const page = await ctx.newPage();
      await page.goto(URL, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(10000);
      console.log(`carga ${i} | Aveno: ${await priceOf(page, "Aveno Infantil")}`);
      console.log(`carga ${i} | Johnson: ${await priceOf(page, "Johnson")}`);
      await ctx.close();
    }

    console.log("\n== (b) comportamiento del '1' tras el '+'");
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "es-AR", timezoneId: "America/Argentina/Buenos_Aires" });
    ctx.setDefaultTimeout(15000);
    const page = await ctx.newPage();
    await page.goto(URL, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(10000);
    const bubble = page.locator("button.button-plus").first();
    await bubble.click();
    await page.waitForTimeout(2000);
    const cartBadge = async () => (await page.locator("header").first().innerText().catch(() => "")).replace(/\s+/g, " ").slice(-30);
    console.log("tras '+': cart header tail =", JSON.stringify(await cartBadge()));
    console.log("html de la tarjeta (control):", (await page.locator("ftd-product-card").first().evaluate((e) => (e.shadowRoot?.innerHTML ?? "(sin shadow)").slice(0, 100))).replace(/\s+/g, " "));
    for (let n = 1; n <= 3; n++) {
      await page.mouse.click(481, 107);
      await page.waitForTimeout(1800);
      console.log(`click ${n} sobre el '1' -> cart header tail =`, JSON.stringify(await cartBadge()));
    }
    await page.screenshot({ path: "exploracion/ft-11-tras-clicks-en-1.png" });
    await ctx.close();
  } finally {
    await browser.close();
    process.exit(0);
  }
})();
