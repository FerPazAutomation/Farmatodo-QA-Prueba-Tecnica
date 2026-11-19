// Exploración: cómo se exponen los botones de la barra de herramientas (nombre accesible / rol) para elegir un buen selector.
import { chromium } from "@playwright/test";

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 }, locale: "en-US" });
  await page.goto("https://wordcounter.net/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);
  const clear = page.locator("#clear-btn");
  console.log("clear html:", await clear.evaluate((e) => e.outerHTML));
  console.log("visible:", await clear.isVisible());
  console.log("by role (any name):", await page.getByRole("button", { name: /clear/i }).count());
  for (const b of await page.getByRole("button", { name: /clear/i }).all()) {
    console.log(" -", JSON.stringify(await b.innerText()), "id=", await b.getAttribute("id"), "visible=", await b.isVisible());
  }
  console.log("snapshot toolbar:");
  console.log(await page.locator("#editor_container").ariaSnapshot().catch(() => "n/a"));
  await browser.close();
})();
