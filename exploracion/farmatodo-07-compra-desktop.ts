// Exploración (desktop): agregar al carrito con "+", detalle del producto, carrito y entrada al pago.
import { chromium, type Page } from "@playwright/test";

const shot = (page: Page, name: string, full = false) => page.screenshot({ path: `exploracion/${name}.png`, fullPage: full });

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "es-AR", timezoneId: "America/Argentina/Buenos_Aires" });
  const page = await ctx.newPage();
  await page.goto("https://www.farmatodo.com.ar/buscar?product=shampoo&departamento=Todos&filtros=", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(9000);

  // información del botón "+"
  const plusInfo = await page.locator("button").evaluateAll((els) =>
    els.filter((b) => { const r = b.getBoundingClientRect(); return r.width > 20 && r.width < 50 && r.top > 80 && r.top < 700; })
      .slice(0, 3).map((b) => ({ html: b.outerHTML.slice(0, 300), w: Math.round(b.getBoundingClientRect().width), aria: b.getAttribute("aria-label"), title: b.getAttribute("title") })));
  console.log("plus buttons:", JSON.stringify(plusInfo, null, 1));

  // Clic en el primer "+" (el botón de la primera tarjeta de producto)
  await page.mouse.click(481, 107);
  await page.waitForTimeout(3000);
  await shot(page, "ft-07-a-click-mas");
  console.log("after + url:", page.url());
  console.log("dialogs:", JSON.stringify(await page.locator("[role=dialog], .modal, mat-dialog-container, .cdk-overlay-container *").evaluateAll((els) => els.slice(0, 5).map((e) => (e.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 160)))));
  console.log("cart badge:", JSON.stringify((await page.locator("a[href*='carrito'], [class*='cart']").allInnerTexts()).map((t) => t.trim()).slice(0, 5)));
  await browser.close();
})();
