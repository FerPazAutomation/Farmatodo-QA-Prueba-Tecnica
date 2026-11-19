// Exploración (desktop): el estado "1" después de presionar "+", el hover y el clic sobre él, la página del carrito y la entrada al pago.
import { chromium, type Page } from "@playwright/test";

const URL = "https://www.farmatodo.com.ar/buscar?product=shampoo&departamento=Todos&filtros=";
const shot = (page: Page, name: string, full = false) => page.screenshot({ path: `exploracion/${name}.png`, fullPage: full });

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "es-AR", timezoneId: "America/Argentina/Buenos_Aires" });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(9000);

  const firstPlus = page.locator("button.button-plus").first();
  await firstPlus.click();
  await page.waitForTimeout(2500);
  const firstCard = page.locator("button.button-plus, [class*='counter'], [class*='quantity']").first();
  console.log("first control html:", (await page.locator("ftd-product-card, ftd-card-product, [class*='card']").first().evaluate((e) => e.outerHTML.slice(0, 700)).catch(() => "n/a")));

  // pasar el mouse sobre la burbuja "1" (arriba a la derecha de la primera tarjeta)
  await page.mouse.move(481, 107);
  await page.waitForTimeout(1200);
  await shot(page, "ft-09-a-hover-1");
  await page.mouse.click(481, 107);
  await page.waitForTimeout(1500);
  await shot(page, "ft-09-b-click-1");
  console.log("cart count after click 1:", JSON.stringify(await page.locator("header").first().innerText().catch(() => "")).slice(-60));
  void firstCard;

  // abrir el carrito
  await page.goto("https://www.farmatodo.com.ar/carrito", { waitUntil: "domcontentloaded" }).catch(() => {});
  await page.waitForTimeout(7000);
  console.log("cart url:", page.url());
  await shot(page, "ft-09-c-carrito");
  console.log("cart text:", JSON.stringify((await page.locator("body").innerText()).split("\n").map((t) => t.trim()).filter(Boolean).slice(0, 40)));
  console.log("cart buttons:", JSON.stringify((await page.getByRole("button").allInnerTexts()).map((t) => t.trim().replace(/\s+/g, " ")).filter(Boolean)));
  await browser.close();
})();
