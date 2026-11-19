// Exploración: (a) ¿el precio/promoción del mismo producto es estable entre cargas? (b) ¿qué hace "+" con y sin ciudad elegida?
import { chromium, type Page } from "@playwright/test";

const URL = "https://www.farmatodo.com.ar/buscar?product=shampoo&departamento=Todos&filtros=";

async function cardInfo(page: Page, needle: string) {
  return page.evaluate((n) => {
    const links = [...document.querySelectorAll("a[href*='/producto/']")].filter((a) => (a.textContent ?? "").includes(n));
    const a = links[0];
    return a ? (a.textContent ?? "").trim().replace(/\s+/g, " ") : "(no encontrado)";
  }, needle);
}

(async () => {
  const browser = await chromium.launch();

  // (a) estabilidad del precio: 5 navegadores limpios
  for (let i = 1; i <= 5; i++) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "es-AR", timezoneId: "America/Argentina/Buenos_Aires" });
    const page = await ctx.newPage();
    await page.goto(URL, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(9000);
    console.log(`load ${i} Aveno   :`, await cardInfo(page, "Aveno Infantil"));
    console.log(`load ${i} Johnson :`, await cardInfo(page, "Johnson"));
    await ctx.close();
  }

  // (b) comportamiento del botón "+"
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "es-AR", timezoneId: "America/Argentina/Buenos_Aires" });
  const page = await ctx.newPage();
  const requests: string[] = [];
  page.on("request", (r) => { if (r.method() !== "GET" || /cart|carrito|order|customer/i.test(r.url())) requests.push(`${r.method()} ${r.url().slice(0, 140)}`); });
  await page.goto(URL, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(9000);
  await page.locator("button.button-plus").first().click();
  await page.waitForTimeout(3000);
  console.log("\n[+ sin ciudad] cart header:", JSON.stringify(await page.locator("header, nav").first().innerText().catch(() => "")).slice(0, 200));
  console.log("[+ sin ciudad] requests:", JSON.stringify(requests, null, 1));
  await page.screenshot({ path: "exploracion/ft-08-a-mas-sin-ciudad.png" });

  // abrir el selector de ciudad
  await page.getByText("Ciudad...").first().click();
  await page.waitForTimeout(2500);
  await page.screenshot({ path: "exploracion/ft-08-b-selector-ciudad.png" });
  console.log("[ciudad] visible texts:", JSON.stringify((await page.locator("body").innerText()).split("\n").map((t) => t.trim()).filter(Boolean).slice(0, 25)));
  await browser.close();
})();
