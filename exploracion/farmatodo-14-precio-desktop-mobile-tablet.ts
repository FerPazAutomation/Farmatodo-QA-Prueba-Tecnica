// Verificación de BUG-006 (precio distinto según el camino) en desktop, mobile y tablet.
// Para cada vista se comparan dos caminos con navegador limpio (sin cookies ni datos previos):
//   Camino A = entrar a la home, escribir "shampoo" en el buscador y presionar Enter.
//   Camino B = abrir directamente la URL de resultados de "shampoo".
// Se imprime el texto completo de la tarjeta de "Shampoo Aveno Infantil" en cada caso.
// Se ejecuta con: npx tsx exploracion/farmatodo-14-precio-desktop-mobile-tablet.ts
import { chromium, type Browser, type Page } from "@playwright/test";

const BASE = "https://www.farmatodo.com.ar";
const RESULTS = `${BASE}/buscar?product=shampoo&departamento=Todos&filtros=`;
const PRODUCT = "Aveno Infantil";

const VIEWS = {
  desktop: { viewport: { width: 1440, height: 900 }, isMobile: false, hasTouch: false },
  tablet: { viewport: { width: 820, height: 1180 }, isMobile: false, hasTouch: false },
  mobile: {
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
  },
} as const;

/** Abre una ventana nueva y limpia (sin cookies previas) para cada intento. */
async function newPage(browser: Browser, view: keyof typeof VIEWS) {
  const ctx = await browser.newContext({ ...VIEWS[view], locale: "es-AR", timezoneId: "America/Argentina/Buenos_Aires" });
  ctx.setDefaultTimeout(20000);
  return { page: await ctx.newPage(), close: () => ctx.close() };
}

/**
 * Texto de la tarjeta del producto, en una sola línea.
 * Si se indica `shot`, también guarda una captura de la tarjeta en evidencias/farmatodo/ (solo para la evidencia de mobile).
 */
async function cardText(page: Page, shot?: string): Promise<string> {
  const card = page.locator("a[href*='/producto/']").filter({ hasText: PRODUCT }).first();
  await card.waitFor({ timeout: 30000 });
  if (shot) await card.screenshot({ path: `evidencias/farmatodo/${shot}` });
  return (await card.innerText()).replace(/\s+/g, " ").trim();
}

async function pathA(browser: Browser, view: keyof typeof VIEWS, shot?: string): Promise<string> {
  const { page, close } = await newPage(browser, view);
  try {
    await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(5000);
    const search = page.locator('input[name="search-product-ftd"]').first();
    await search.click();
    await search.pressSequentially("shampoo", { delay: 100 });
    await search.press("Enter");
    await page.waitForTimeout(10000);
    return await cardText(page, shot);
  } catch (e) {
    return `(no se pudo completar el camino A: ${(e as Error).message.split("\n")[0]})`;
  } finally {
    await close();
  }
}

async function pathB(browser: Browser, view: keyof typeof VIEWS, shot?: string): Promise<string> {
  const { page, close } = await newPage(browser, view);
  try {
    await page.goto(RESULTS, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(10000);
    return await cardText(page, shot);
  } catch (e) {
    return `(no se pudo completar el camino B: ${(e as Error).message.split("\n")[0]})`;
  } finally {
    await close();
  }
}

(async () => {
  const browser = await chromium.launch();
  try {
    for (const view of ["desktop", "tablet", "mobile"] as const) {
      // Solo en mobile se guardan capturas de la tarjeta: son la evidencia de BUG-006 en mobile.
      const shotA = view === "mobile" ? "BUG-006 [Mobile] El precio cambia según cómo se llega a la búsqueda - buscador.png" : undefined;
      const shotB = view === "mobile" ? "BUG-006 [Mobile] El precio cambia según cómo se llega a la búsqueda - URL directa.png" : undefined;
      console.log(`== ${view}`);
      console.log(`  A (buscador)     : ${await pathA(browser, view, shotA)}`);
      console.log(`  B (URL directa)  : ${await pathB(browser, view, shotB)}`);
    }
  } finally {
    await browser.close();
    process.exit(0);
  }
})();
