// Exploración de https://www.farmatodo.com/ (desktop): a qué país redirige, qué hay en la home y errores de consola.
import { chromium } from "@playwright/test";

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "es-AR" });
  const page = await ctx.newPage();
  const errors: string[] = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 160)); });
  const t0 = Date.now();
  const resp = await page.goto("https://www.farmatodo.com/", { waitUntil: "domcontentloaded", timeout: 60000 }).catch((e) => { console.log("GOTO ERROR", String(e).slice(0, 200)); return null; });
  console.log("status:", resp?.status(), "final url:", page.url(), "ms:", Date.now() - t0);
  await page.waitForTimeout(6000);
  console.log("title:", await page.title());
  await page.screenshot({ path: "exploracion/ft-01-home-desktop.png", fullPage: false });
  const h = await page.locator("h1,h2").allInnerTexts();
  console.log("headings:", JSON.stringify(h.slice(0, 15)));
  const links = await page.locator("a").evaluateAll((els) => els.slice(0, 40).map((a) => ((a.textContent ?? "").trim().slice(0, 30)) + " -> " + (a.getAttribute("href") ?? "")));
  console.log("links:", JSON.stringify(links, null, 1));
  console.log("console errors:", JSON.stringify(errors.slice(0, 10), null, 1));
  await browser.close();
})();
