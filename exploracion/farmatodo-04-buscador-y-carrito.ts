// Exploración (desktop): qué pasa MIENTRAS se escribe en el buscador y luego con el botón "+", el detalle y el carrito.
import { chromium, type Page } from "@playwright/test";

const shot = (page: Page, name: string, full = false) => page.screenshot({ path: `exploracion/${name}.png`, fullPage: full });

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "es-AR", timezoneId: "America/Argentina/Buenos_Aires" });
  const page = await ctx.newPage();
  await page.goto("https://www.farmatodo.com.ar/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(5000);

  const search = page.locator('input[name="search-product-ftd"]');
  await search.click();
  const word = "shampoo";
  for (let i = 0; i < word.length; i++) {
    await search.pressSequentially(word[i], { delay: 0 });
    await page.waitForTimeout(700);
    const bodyLen = await page.evaluate(() => document.body.innerText.length);
    console.log(`typed "${word.slice(0, i + 1)}" url=${page.url()} bodyTextLen=${bodyLen} inputValue="${await search.inputValue().catch(() => "?")}" focused=${await search.evaluate((e) => document.activeElement === e).catch(() => "?")}`);
    if (i === 1 || i === 3) await shot(page, `ft-04-a-tipeando-${i + 1}`);
  }
  await page.waitForTimeout(3000);
  await shot(page, "ft-04-a-tipeando-final");

  // nombres accesibles de los botones "+"
  const plus = page.locator("button").filter({ has: page.locator("svg, img") });
  console.log("buttons with icon (first 6 aria/title):", JSON.stringify(await page.locator("button").evaluateAll((els) => els.slice(0, 80).map((b) => (b.getAttribute("aria-label") ?? b.getAttribute("title") ?? (b.textContent ?? "").trim().slice(0, 20) ?? "")).filter((t, i) => i < 80))));
  void plus;
  await browser.close();
})();
