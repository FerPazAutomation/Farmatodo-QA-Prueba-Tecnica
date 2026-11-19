// Genera las capturas de evidencia con marca para docs/03-reporte-ux-farmatodo.md  ->  evidencias/farmatodo/
// El contorno rojo se dibuja directamente sobre el elemento de la página en vivo, así que la evidencia es real
// (no está editada a mano). Se ejecuta con: npx tsx exploracion/farmatodo-evidencias.ts
import { chromium, type Browser, type Locator, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";

const OUT = "evidencias/farmatodo";
const BASE = "https://www.farmatodo.com.ar";
const RESULTS = `${BASE}/buscar?product=shampoo&departamento=Todos&filtros=`;
mkdirSync(OUT, { recursive: true });

async function mark(target: Locator, color = "#e00000"): Promise<void> {
  await target.evaluate((el, c) => {
    (el as HTMLElement).style.outline = `4px solid ${c}`;
    (el as HTMLElement).style.outlineOffset = "2px";
  }, color);
}

async function newPage(browser: Browser, kind: "desktop" | "mobile" | "tablet"): Promise<{ page: Page; close: () => Promise<void> }> {
  const sizes = { desktop: { width: 1440, height: 900 }, mobile: { width: 390, height: 844 }, tablet: { width: 820, height: 1180 } };
  const ctx = await browser.newContext({
    viewport: sizes[kind],
    deviceScaleFactor: 2,
    isMobile: kind === "mobile",
    hasTouch: kind === "mobile",
    locale: "es-AR",
    timezoneId: "America/Argentina/Buenos_Aires",
    userAgent: kind === "mobile" ? "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1" : undefined,
  });
  ctx.setDefaultTimeout(20000);
  return { page: await ctx.newPage(), close: () => ctx.close() };
}

const card = (page: Page, name: string) => page.locator("a[href*='/producto/']").filter({ hasText: name }).first();

async function searchViaUi(page: Page): Promise<void> {
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(5000);
  const search = page.locator('input[name="search-product-ftd"]');
  await search.click();
  await search.pressSequentially("shampoo", { delay: 100 });
  await search.press("Enter");
  await page.waitForTimeout(10000);
}

(async () => {
  const browser = await chromium.launch();
  try {
    // ---------------- BUG-006 (desktop): el precio depende de cómo se llega a la búsqueda
    {
      const { page, close } = await newPage(browser, "desktop");
      await searchViaUi(page);
      await mark(card(page, "Aveno Infantil"));
      await mark(card(page, "Johnson"));
      await page.screenshot({ path: `${OUT}/BUG-006 [Desktop y Mobile] El precio cambia según cómo se llega a la búsqueda - buscador.png` });
      await close();
    }
    {
      const { page, close } = await newPage(browser, "desktop");
      await page.goto(RESULTS, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(10000);
      await mark(card(page, "Aveno Infantil"));
      await mark(card(page, "Johnson"));
      await page.screenshot({ path: `${OUT}/BUG-006 [Desktop y Mobile] El precio cambia según cómo se llega a la búsqueda - URL directa.png` });
      await close();
    }

    // ---------------- BUG-007 (mobile): el botón "+" tapa el nombre del producto
    {
      const { page, close } = await newPage(browser, "mobile");
      await page.goto(RESULTS, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(10000);
      const plus = page.locator("button.button-plus");
      await mark(plus.nth(0));
      await mark(plus.nth(2));
      await page.screenshot({ path: `${OUT}/BUG-007 [Mobile] El botón + tapa el nombre del producto - vista general.png` });
      const box = await card(page, "Aveno Infantil").boundingBox();
      if (box) await page.screenshot({ path: `${OUT}/BUG-007 [Mobile] El botón + tapa el nombre del producto - zoom.png`, clip: { x: 0, y: Math.max(0, box.y - 10), width: 390, height: box.height + 30 } });
      await close();
    }

    // ---------------- Observación (responsive / tablet 820): el diseño de celular queda estirado
    {
      const { page, close } = await newPage(browser, "tablet");
      await page.goto(RESULTS, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(10000);
      await mark(page.locator("button.button-plus").nth(0));
      await mark(page.locator("button.button-plus").nth(2));
      await page.screenshot({ path: `${OUT}/OBS-02 [Tablet] Diseño de celular estirado en 820 px.png` });
      await close();
    }
    {
      const { page, close } = await newPage(browser, "desktop");
      await page.goto(RESULTS, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(10000);
      await page.screenshot({ path: `${OUT}/OBS-02 [Desktop] Referencia para comparar con tablet.png` });
      await close();
    }

    // ---------------- OBS-03 (desktop): burbuja "1" (resultado no concluyente) + OBS-01 etiqueta cortada
    {
      const { page, close } = await newPage(browser, "desktop");
      await searchViaUi(page);
      await page.locator("button.button-plus").first().click();
      await page.waitForTimeout(2000);
      const bubble = page.locator("button.button-plus").first();
      await mark(bubble);
      for (let i = 0; i < 3; i++) { await bubble.click({ force: true }); await page.waitForTimeout(1200); }
      await page.screenshot({ path: `${OUT}/OBS-03 [Desktop] Botón 1 de la grilla, sin respuesta confirmada.png` });
      const aveno = card(page, "Aveno Infantil");
      await mark(page.getByText("¡EXCLUSIVO WEB Y APP FARMATODO!").first(), "#e00000");
      await aveno.screenshot({ path: `${OUT}/OBS-01 [Desktop] Etiqueta de promo cortada en la tarjeta.png` });
      await close();
    }

    // ---------------- BUG-008 (carrito): "1 productos" en desktop y en mobile
    {
      const { page, close } = await newPage(browser, "desktop");
      await page.goto(RESULTS, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(9000);
      await page.locator("button.button-plus").first().click();
      await page.waitForTimeout(2500);
      await page.goto(BASE + "/carrito", { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(7000);
      await mark(page.getByText("(1 productos)").first());
      await mark(page.getByText("1 productos", { exact: true }).first());
      await page.screenshot({ path: `${OUT}/BUG-008 [Desktop y Mobile] El carrito dice 1 productos - desktop.png` });
      await close();
    }
    {
      const { page, close } = await newPage(browser, "mobile");
      await page.goto(RESULTS, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(9000);
      await page.locator("button.button-plus").first().click();
      await page.waitForTimeout(2500);
      await page.goto(BASE + "/carrito", { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(7000);
      await mark(page.getByText("(1 productos)").first());
      await page.screenshot({ path: `${OUT}/BUG-008 [Desktop y Mobile] El carrito dice 1 productos - mobile.png` });
      await close();
    }
  } finally {
    await browser.close();
    process.exit(0);
  }
})();
