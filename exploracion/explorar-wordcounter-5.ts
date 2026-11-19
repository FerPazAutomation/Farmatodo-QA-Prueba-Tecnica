// Script de exploración (lote 3): persistencia en un navegador limpio, errores de consola/red, accesibilidad básica y mobile.
import { chromium } from "@playwright/test";

(async () => {
  const browser = await chromium.launch();

  // --- 1) Navegador limpio: etiqueta de autoguardado + persistencia después de recargar
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const page = await ctx.newPage();
  const consoleMsgs: string[] = [];
  const failedReq: string[] = [];
  page.on("console", (m) => { if (["error", "warning"].includes(m.type())) consoleMsgs.push(`[${m.type()}] ${m.text().slice(0, 200)}`); });
  page.on("requestfailed", (r) => failedReq.push(`${r.url().slice(0, 120)} -> ${r.failure()?.errorText}`));
  page.on("response", (r) => { if (r.status() >= 400) failedReq.push(`HTTP ${r.status()} ${r.url().slice(0, 120)}`); });

  await page.goto("https://wordcounter.net/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);
  console.log("AUTOSAVE label:", JSON.stringify(await page.locator("#save-btn, #auto-save-btn, button:has-text('AUTO-SAVE')").allInnerTexts()));
  const autosaveHtml = await page.locator("button:has-text('AUTO-SAVE')").first().evaluate((e) => e.outerHTML).catch(() => "n/a");
  console.log("AUTOSAVE html:", autosaveHtml);
  await page.locator("#box").fill("texto privado de prueba");
  await page.waitForTimeout(1500);
  const ls = await page.evaluate(() => Object.keys(localStorage).map((k) => k + "=" + (localStorage.getItem(k) ?? "").slice(0, 80)));
  console.log("localStorage:", JSON.stringify(ls, null, 1));
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);
  console.log("AFTER RELOAD (same ctx):", JSON.stringify(await page.locator("#box").inputValue()));
  await page.screenshot({ path: "exploracion/wc-04-persistencia.png" });

  // --- 2) Navegador nuevo (como otra persona o una ventana de incógnito)
  const ctx2 = await browser.newContext();
  const p2 = await ctx2.newPage();
  await p2.goto("https://wordcounter.net/", { waitUntil: "domcontentloaded" });
  await p2.waitForTimeout(2500);
  console.log("NEW CONTEXT box:", JSON.stringify(await p2.locator("#box").inputValue()));

  // --- 3) accesibilidad (a11y) básica
  const a11y = await page.evaluate(() => {
    const box = document.querySelector("#box") as HTMLTextAreaElement;
    const live = [...document.querySelectorAll("[aria-live]")].map((e) => e.id || e.className);
    const imgsNoAlt = [...document.querySelectorAll("img")].filter((i) => !i.hasAttribute("alt")).length;
    const labelFor = box ? document.querySelector(`label[for="${box.id}"]`)?.textContent ?? null : null;
    const btnNoName = [...document.querySelectorAll("button")].filter((b) => !(b.textContent || "").trim() && !b.getAttribute("aria-label") && !b.getAttribute("title")).length;
    return {
      boxAriaLabel: box?.getAttribute("aria-label"),
      boxLabelFor: labelFor,
      boxPlaceholder: box?.placeholder,
      ariaLive: live,
      imgsNoAlt,
      btnNoName,
      lang: document.documentElement.lang,
      title: document.title,
      metaDesc: document.querySelector('meta[name="description"]')?.getAttribute("content"),
    };
  });
  console.log("A11Y:", JSON.stringify(a11y, null, 1));
  console.log("CONSOLE:", JSON.stringify(consoleMsgs.slice(0, 15), null, 1));
  console.log("FAILED REQ:", JSON.stringify(failedReq.slice(0, 15), null, 1));

  // --- 4) detalles de "More (12)"
  await page.locator("#box").fill("hola mundo hola");
  const more = page.getByText(/More \(\d+\)/).first();
  console.log("MORE link:", await more.innerText().catch(() => "n/a"));
  await more.click().catch(() => {});
  await page.waitForTimeout(800);
  console.log("DETAILS after More:", JSON.stringify(await page.locator("#details-accordion li:visible").allInnerTexts()));

  // --- 5) Vista mobile
  const mctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const mp = await mctx.newPage();
  await mp.goto("https://wordcounter.net/", { waitUntil: "domcontentloaded" });
  await mp.waitForTimeout(2500);
  await mp.locator("#box").fill("farmatodo farmatodo cuida cuida tu salud");
  await mp.waitForTimeout(1000);
  await mp.screenshot({ path: "exploracion/wc-05-mobile.png" });
  const overflow = await mp.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
  console.log("MOBILE overflow:", overflow);
  await browser.close();
})();
