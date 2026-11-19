import { expect, type Locator, type Page } from "@playwright/test";

/** Una fila de la lista "Keyword Density": la palabra, cuántas veces aparece y el porcentaje que muestra el sitio. */
export interface Keyword {
  word: string;
  count: number;
  percent: number;
}

/**
 * Page Object de https://wordcounter.net/ (configuración por defecto).
 *
 * ¿Qué es un Page Object? Un archivo que concentra CÓMO se encuentran los elementos de una página.
 * Si el sitio cambia un selector, se corrige aquí y no en cada prueba.
 *
 * Nota sobre los selectores: los contadores no tienen rol accesible, etiqueta ni `data-testid`, así que los `id`
 * estables de la página son la mejor opción disponible. Esto también se reporta como oportunidad de mejora
 * en docs/02-reporte-fallas-wordcounter.md.
 */
export class WordCounterPage {
  readonly editor: Locator;
  readonly wordCount: Locator;
  readonly characterCount: Locator;
  readonly headline: Locator; // título grande de arriba: "14 words 99 characters"
  readonly footerSummary: Locator; // barra debajo del editor: "14 words 99 characters"
  readonly keywordRows: Locator;
  readonly keywordTabX1: Locator;
  readonly clearButton: Locator;
  readonly autoSaveButton: Locator;

  constructor(private readonly page: Page) {
    // El cuadro de texto no tiene <label>: su nombre accesible sale solo del texto de ayuda (placeholder).
    this.editor = page.getByRole("textbox", { name: /Start typing, or copy and paste/ });
    this.wordCount = page.locator("#word_count");
    this.characterCount = page.locator("#character_count");
    this.headline = page.locator("h1").first();
    this.footerSummary = page.locator("h4:visible").filter({ hasText: /\d[\d,]* words? \d[\d,]* characters?/ }).first();
    this.keywordRows = page.locator("#kwd-accordion-data .list-group-item");
    this.keywordTabX1 = page.locator("#consecutive-1-link");
    // El nombre accesible es "<glifo del ícono> CLEAR": el ícono decorativo no está oculto para lectores de pantalla.
    // Por eso se busca con una expresión que termina en "clear".
    this.clearButton = page.getByRole("button", { name: /clear$/i });
    this.autoSaveButton = page.getByRole("button", { name: /auto-save/i });
  }

  /** Abre el sitio y espera a que el editor esté listo para escribir. */
  async open(): Promise<void> {
    await this.page.goto("/", { waitUntil: "domcontentloaded" });
    // Se espera la carga completa: si la página termina de iniciar después de escribir, puede borrar el texto.
    // (Esto evitó una falla intermitente de SC-01 con 4 pruebas en paralelo.)
    await this.page.waitForLoadState("load");
    await expect(this.editor).toBeVisible();
    await expect(this.editor).toBeEditable();
  }

  /** Pone todo el texto en el editor de una vez (rápido; dispara el mismo evento `input` que un pegado). */
  async enterText(text: string): Promise<void> {
    await this.editor.fill(text);
  }

  /** Escribe tecla por tecla, como lo haría una persona. */
  async typeLikeUser(text: string): Promise<void> {
    await this.editor.pressSequentially(text, { delay: 30 });
  }

  /** Lo que lista hoy el panel "Keyword Density", en el mismo orden en que lo muestra el sitio. */
  async readKeywords(): Promise<Keyword[]> {
    const raw = await this.keywordRows.evaluateAll((rows) =>
      rows.map((row) => ({
        word: (row.querySelector(".word")?.textContent ?? "").trim(),
        badge: (row.querySelector(".badge")?.textContent ?? "").trim(),
      })),
    );
    return raw
      .filter((r) => r.word !== "")
      .map((r) => {
        // La insignia tiene el formato "1,234 (43%)": se separan la cantidad (sin la coma de miles) y el porcentaje.
        const match = r.badge.match(/([\d,]+)\s*\((\d+)%\)/);
        return { word: r.word, count: Number((match?.[1] ?? "NaN").replace(/,/g, "")), percent: Number(match?.[2] ?? "NaN") };
      });
  }

  /** Captura de pantalla de lo que importa (contadores, editor y Keyword Density). */
  async evidence(): Promise<Buffer> {
    // Página completa: los paneles Details y Keyword Density están a la derecha, y en pantallas chicas quedan abajo.
    return this.page.screenshot({ fullPage: true });
  }
}
