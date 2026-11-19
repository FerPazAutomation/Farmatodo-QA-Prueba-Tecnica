// Exploración (mobile 390x844 y tablet/responsive 820x1180): desbordes, tamaño de los botones táctiles y superposición del widget flotante.
import { chromium, type Page } from "@playwright/test";

const SEARCH = "https://www.farmatodo.com.ar/buscar?product=shampoo&departamento=Todos&filtros=";

async function metrics(page: Page, label: string) {
  const m = await page.evaluate(() => ({
    viewport: innerWidth + "x" + innerHeight,
    scrollW: document.documentElement.scrollWidth,
    clientW: document.documentElement.clientWidth,
    overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  }));
  const plus = await page.locator("button.button-plus").first().boundingBox().catch(() => null);
  const widget = await page.getByText("Soporte").first().boundingBox().catch(() => null);
  console.log(`[${label}]`, JSON.stringify(m), "plusBtn:", JSON.stringify(plus), "supportWidget:", JSON.stringify(widget));
}

async function run(label: string, viewport: { width: number; height: number }, mobile: boolean) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 2, isMobile: mobile, hasTouch: mobile, locale: "es-AR", timezoneId: "America/Argentina/Buenos_Aires",
    userAgent: mobile ? "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1" : undefined });
  const page = await ctx.newPage();
  await page.goto("https://www.farmatodo.com.ar/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(8000);
  await page.screenshot({ path: `exploracion/ft-10-${label}-a-home.png` });
  await metrics(page, `${label} home`);

  await page.goto(SEARCH, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(9000);
  await page.screenshot({ path: `exploracion/ft-10-${label}-b-resultados.png` });
  await metrics(page, `${label} resultados`);
  await page.locator("button.button-plus").first().click().catch((e) => console.log("plus click error", String(e).slice(0, 120)));
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `exploracion/ft-10-${label}-c-tras-mas.png` });

  await page.goto("https://www.farmatodo.com.ar/carrito", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(7000);
  await page.screenshot({ path: `exploracion/ft-10-${label}-d-carrito.png` });
  await metrics(page, `${label} carrito`);
  await browser.close();
}

(async () => {
  await run("mobile", { width: 390, height: 844 }, true);
  await run("tablet", { width: 820, height: 1180 }, false);
})();
