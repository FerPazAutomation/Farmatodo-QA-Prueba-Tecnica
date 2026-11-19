// Script de exploración (no es parte de la suite): vuelca la estructura real de wordcounter.net
// para construir el Page Object sobre lo que el sitio realmente muestra y no sobre suposiciones.
import { chromium } from "@playwright/test";

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
  await page.goto("https://wordcounter.net/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);
  console.log("TITLE:", await page.title());
  console.log("URL:", page.url());

  const info = await page.evaluate(() => {
    const out: Record<string, unknown> = {};
    out.textareas = [...document.querySelectorAll("textarea")].map((t) => ({
      id: t.id, name: t.name, cls: t.className, placeholder: t.placeholder,
    }));
    out.withIds = [...document.querySelectorAll("[id]")]
      .map((e) => `${e.tagName.toLowerCase()}#${e.id}`)
      .slice(0, 120);
    out.h = [...document.querySelectorAll("h1,h2,h3,h4")].map((e) => `${e.tagName}: ${(e.textContent || "").trim()}`);
    return out;
  });
  console.log(JSON.stringify(info, null, 2));
  await page.screenshot({ path: "exploracion/wc-01-inicial.png", fullPage: true });
  await browser.close();
})();
