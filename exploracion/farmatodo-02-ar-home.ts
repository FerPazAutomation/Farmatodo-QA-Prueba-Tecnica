// Exploración de https://www.farmatodo.com.ar/ (desktop): home, ventanas emergentes, encabezado y buscador.
import { chromium } from "@playwright/test";

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "es-AR", timezoneId: "America/Argentina/Buenos_Aires" });
  const page = await ctx.newPage();
  const errors: string[] = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 200)); });
  const t0 = Date.now();
  const resp = await page.goto("https://www.farmatodo.com.ar/", { waitUntil: "domcontentloaded", timeout: 60000 }).catch((e) => { console.log("GOTO ERROR", String(e).slice(0, 300)); return null; });
  console.log("status:", resp?.status(), "url:", page.url(), "dcl ms:", Date.now() - t0);
  await page.waitForTimeout(8000);
  console.log("title:", await page.title());
  await page.screenshot({ path: "exploracion/ft-02-ar-home-desktop.png" });
  await page.screenshot({ path: "exploracion/ft-02-ar-home-desktop-full.png", fullPage: true });
  console.log("headings:", JSON.stringify((await page.locator("h1,h2,h3").allInnerTexts()).map((t) => t.trim()).filter(Boolean).slice(0, 30)));
  console.log("buttons:", JSON.stringify((await page.getByRole("button").allInnerTexts()).map((t) => t.trim()).filter(Boolean).slice(0, 40)));
  console.log("inputs:", JSON.stringify(await page.locator("input").evaluateAll((els) => els.map((i) => ({ type: i.getAttribute("type"), ph: i.getAttribute("placeholder"), name: i.getAttribute("name"), aria: i.getAttribute("aria-label"), id: i.id })))));
  console.log("errors:", JSON.stringify(errors.slice(0, 8), null, 1));
  await browser.close();
})();
