// Reporte resumen propio de Playwright: cuántos escenarios se ejecutaron, cuántos pasaron, cuántos fallaron
// y POR QUÉ (descripción del error). Es lo que pide el punto 1 de la prueba.
// Escribe tres archivos juntos:
//   resumen.html      -> para cualquier persona del equipo (PO, UX, AF, dev, QA): se abre con el navegador
//   resumen.md        -> mismo contenido, legible en GitHub o en cualquier editor
//   resultados.json   -> para máquinas (integración continua u otras herramientas)
// Las capturas de evidencia que adjuntan las pruebas se copian a <outputDir>/evidencias/.

import type { FullConfig, FullResult, Reporter, Suite, TestCase, TestResult } from "@playwright/test/reporter";
import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const DEFAULT_HELP =
  "un escenario es una prueba con un texto concreto. «Pasó» significa que el sitio mostró lo esperado. «Falló» significa que el sitio mostró algo distinto; abajo está la descripción del error y una captura de pantalla de ese momento.";

interface Options {
  title: string;
  subtitle?: string;
  outputDir: string;
  // Texto del recuadro amarillo «Cómo leer este reporte». Si no se indica, se usa el de la suite web (habla de «el sitio»).
  help?: string;
}

type Status = "passed" | "failed" | "skipped";

interface Row {
  id: string;
  title: string;
  category: string;
  description: string;
  input?: string;
  finding?: string;
  status: Status;
  durationMs: number;
  retried: boolean;
  errors: string[]; // descripciones legibles de lo que salió mal
  evidence?: string; // ruta de la captura, relativa a outputDir
}

const ANSI = /\u001b\[[0-9;]*m/g;

const CATEGORY_LABEL: Record<string, string> = {
  core: "Núcleo (requisito de la prueba)",
  observacion: "Observación (comportamiento documentado)",
  hallazgo: "Hallazgo a validar (el sitio se desvía de lo esperado)",
};

function annotationOf(test: TestCase, type: string): string | undefined {
  return test.annotations.find((a) => a.type === type)?.description;
}

/** Quita los caracteres que Windows no permite en nombres de archivo. */
function sanitizeFileName(name: string): string {
  return name.replace(/[\\/:*?"<>|]/g, "-");
}

function categoryOf(test: TestCase): string {
  const tag = test.tags.find((t) => ["@core", "@observacion", "@hallazgo"].includes(t));
  return tag ? tag.slice(1) : "core";
}

/** Convierte el texto de error técnico de Playwright en una frase corta que pueda leer una persona no técnica. */
function humanizeError(raw: string): string {
  const text = raw.replace(ANSI, "");
  const firstLines = text.split("\n").map((l) => l.trim());
  const headline = (firstLines[0] ?? "").replace(/^Error:\s*/, "").replace(/^expect\.soft\(.*?\)\.\w+\(.*?\)\s*/, "");
  const expected = text.match(/Expected(?: string| pattern| substring)?:\s*(.*)/)?.[1]?.trim();
  const received = text.match(/Received(?: string| pattern| substring)?:\s*(.*)/)?.[1]?.trim();

  if (expected !== undefined && received !== undefined) {
    const label = headline && !headline.startsWith("expect") && !headline.startsWith("Timed out") ? headline : "Valor distinto";
    const unquote = (value: string): string => {
      try {
        const parsed: unknown = JSON.parse(value);
        return typeof parsed === "string" ? parsed : value;
      } catch {
        return value;
      }
    };
    // Los helpers devuelven "" cuando todo está bien; por eso, si lo "recibido" no está vacío, ya es la lista de diferencias.
    if (unquote(expected) === "") return `${label}. Diferencias: ${unquote(received)}.`;
    return `${label}. Se esperaba «${unquote(expected)}» y el sitio mostró «${unquote(received)}».`;
  }
  const clean = firstLines.filter((l) => l && !l.startsWith("at ") && !l.startsWith("Call log")).slice(0, 3).join(" ");
  return clean || "Error sin detalle";
}

export default class SummaryReporter implements Reporter {
  private readonly options: Options;
  private startedAt = new Date();
  private rows: Row[] = [];
  private suite!: Suite;

  constructor(options: Options) {
    this.options = options;
  }

  onBegin(_config: FullConfig, suite: Suite): void {
    this.startedAt = new Date();
    this.suite = suite;
  }

  async onEnd(result: FullResult): Promise<void> {
    const outDir = this.options.outputDir;
    const evidenceDir = join(outDir, "evidencias");
    rmSync(evidenceDir, { recursive: true, force: true });
    mkdirSync(evidenceDir, { recursive: true });

    for (const test of this.suite.allTests()) {
      const results = test.results;
      const last: TestResult | undefined = results[results.length - 1];
      const outcome = test.outcome();
      const status: Status = outcome === "skipped" ? "skipped" : outcome === "unexpected" ? "failed" : "passed";
      const title = test.title;
      const id = title.split("|")[0]?.trim() ?? title;

      const finding = annotationOf(test, "hallazgo");
      const errors = last ? last.errors.map((e) => humanizeError(e.message ?? "")) : [];
      let evidence: string | undefined;
      const shot = last?.attachments.find((a) => a.name === "evidencia" && a.path);
      if (shot?.path && existsSync(shot.path)) {
        // Si el escenario corresponde a un bug, la captura lleva el nombre del bug: "BUG-002 [Desktop] Título - ED-01.png".
        // Si no, usa el ID del escenario: "SC-01-OK.png".
        const file = finding ? `${sanitizeFileName(finding)} - ${id}.png` : `${id}-${status === "passed" ? "OK" : "FALLO"}.png`;
        copyFileSync(shot.path, join(evidenceDir, file));
        evidence = `evidencias/${file}`;
      }

      this.rows.push({
        id,
        title: title.includes("|") ? title.split("|").slice(1).join("|").trim() : title,
        category: categoryOf(test),
        description: annotationOf(test, "descripcion") ?? "",
        input: annotationOf(test, "entrada"),
        finding,
        status,
        durationMs: results.reduce((sum, r) => sum + r.duration, 0),
        retried: results.length > 1,
        errors,
        evidence,
      });
    }

    // Las pruebas sin navegador (algoritmo) no generan capturas: no se deja una carpeta "evidencias" vacía.
    if (readdirSync(evidenceDir).length === 0) rmSync(evidenceDir, { recursive: true, force: true });

    this.rows.sort((a, b) => a.id.localeCompare(b.id, "en", { numeric: true }));
    const finishedAt = new Date();
    const totals = {
      executed: this.rows.filter((r) => r.status !== "skipped").length,
      passed: this.rows.filter((r) => r.status === "passed").length,
      failed: this.rows.filter((r) => r.status === "failed").length,
      skipped: this.rows.filter((r) => r.status === "skipped").length,
    };

    mkdirSync(outDir, { recursive: true });
    writeFileSync(join(outDir, "resultados.json"), JSON.stringify({ ...this.meta(finishedAt, result), totals, rows: this.rows }, null, 2), "utf8");
    writeFileSync(join(outDir, "resumen.md"), this.markdown(totals, finishedAt), "utf8");
    writeFileSync(join(outDir, "resumen.html"), this.html(totals, finishedAt), "utf8");

    // Resumen corto en la consola, para ver el resultado sin abrir el reporte.
    console.log(
      `\n  RESUMEN: ${totals.executed} escenarios ejecutados · ${totals.passed} pasaron · ${totals.failed} fallaron` +
        `\n  Reporte para el equipo: ${join(outDir, "resumen.html")}\n`,
    );
  }

  private meta(finishedAt: Date, result: FullResult) {
    return {
      title: this.options.title,
      subtitle: this.options.subtitle,
      startedAt: this.startedAt.toISOString(),
      finishedAt: finishedAt.toISOString(),
      durationSeconds: Math.round((finishedAt.getTime() - this.startedAt.getTime()) / 100) / 10,
      runStatus: result.status,
      node: process.version,
    };
  }

  private markdown(t: { executed: number; passed: number; failed: number; skipped: number }, finishedAt: Date): string {
    const seconds = Math.round((finishedAt.getTime() - this.startedAt.getTime()) / 100) / 10;
    const icon = (s: Status) => (s === "passed" ? "✅ Pasó" : s === "failed" ? "❌ Falló" : "⏭ Omitido");
    const lines: string[] = [];
    lines.push(`# ${this.options.title}`, "");
    if (this.options.subtitle) lines.push(`_${this.options.subtitle}_`, "");
    lines.push(`Ejecución: ${this.startedAt.toLocaleString("es-AR")} · Duración: ${seconds} s`, "");
    lines.push("## Resumen", "");
    lines.push("| Escenarios ejecutados | Pasaron | Fallaron | Omitidos |", "|---|---|---|---|");
    lines.push(`| **${t.executed}** | **${t.passed}** | **${t.failed}** | ${t.skipped} |`, "");

    const byCategory = Object.keys(CATEGORY_LABEL)
      .map((c) => ({ c, rows: this.rows.filter((r) => r.category === c) }))
      .filter((g) => g.rows.length > 0);
    if (byCategory.length > 1) {
      lines.push("| Tipo de escenario | Total | Pasaron | Fallaron |", "|---|---|---|---|");
      for (const g of byCategory) {
        lines.push(`| ${CATEGORY_LABEL[g.c]} | ${g.rows.length} | ${g.rows.filter((r) => r.status === "passed").length} | ${g.rows.filter((r) => r.status === "failed").length} |`);
      }
      lines.push("");
    }

    lines.push("## Todos los escenarios", "", "| ID | Escenario | Tipo | Resultado |", "|---|---|---|---|");
    for (const r of this.rows) lines.push(`| ${r.id} | ${r.title} | ${CATEGORY_LABEL[r.category] ?? r.category} | ${icon(r.status)} |`);
    lines.push("");

    const failed = this.rows.filter((r) => r.status === "failed");
    if (failed.length) {
      lines.push("## Detalle de los escenarios que fallaron", "");
      for (const r of failed) {
        lines.push(`### ${r.id} · ${r.title}`, "");
        if (r.description) lines.push(`**Qué se probó:** ${r.description}`, "");
        if (r.input) lines.push(`**Texto ingresado:** \`${r.input}\``, "");
        lines.push("**Descripción del error:**", "");
        for (const e of r.errors) lines.push(`- ${e}`);
        lines.push("");
        if (r.finding) lines.push(`**Hallazgo relacionado:** ${r.finding}`, "");
        // Se usan <> alrededor de la ruta porque el nombre tiene espacios y corchetes.
        if (r.evidence) lines.push(`**Evidencia:** ![${r.id}](<${r.evidence}>)`, "");
      }
    }
    return lines.join("\n");
  }

  private html(t: { executed: number; passed: number; failed: number; skipped: number }, finishedAt: Date): string {
    const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const seconds = Math.round((finishedAt.getTime() - this.startedAt.getTime()) / 100) / 10;
    const badge = (s: Status) =>
      s === "passed" ? '<span class="b ok">Pasó</span>' : s === "failed" ? '<span class="b ko">Falló</span>' : '<span class="b sk">Omitido</span>';

    const rowsHtml = this.rows
      .map(
        (r) => `<tr class="${r.status}">
  <td>${esc(r.id)}</td><td>${esc(r.title)}</td><td>${esc(CATEGORY_LABEL[r.category] ?? r.category)}</td><td>${badge(r.status)}</td>
</tr>`,
      )
      .join("\n");

    const failedHtml = this.rows
      .filter((r) => r.status === "failed")
      .map(
        (r) => `<section class="card">
  <h3>${esc(r.id)} · ${esc(r.title)}</h3>
  ${r.description ? `<p><strong>Qué se probó:</strong> ${esc(r.description)}</p>` : ""}
  ${r.input ? `<p><strong>Texto ingresado:</strong> <code>${esc(r.input)}</code></p>` : ""}
  <p><strong>Descripción del error:</strong></p>
  <ul>${r.errors.map((e) => `<li>${esc(e)}</li>`).join("")}</ul>
  ${r.finding ? `<p><strong>Hallazgo relacionado:</strong> ${esc(r.finding)}</p>` : ""}
  ${r.evidence ? `<p><a href="${encodeURI(r.evidence)}"><img src="${encodeURI(r.evidence)}" alt="Evidencia ${esc(r.id)}" loading="lazy"></a></p>` : ""}
</section>`,
      )
      .join("\n");

    return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(this.options.title)}</title>
<style>
  body{font-family:Segoe UI,Arial,sans-serif;margin:0;background:#f5f6f8;color:#1c2330}
  header{background:#0b5ed7;color:#fff;padding:24px 32px}
  header h1{margin:0 0 4px;font-size:24px} header p{margin:0;opacity:.9}
  main{max-width:1100px;margin:0 auto;padding:24px}
  .kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px}
  .kpi{background:#fff;border-radius:10px;padding:16px;text-align:center;box-shadow:0 1px 3px #0002}
  .kpi b{display:block;font-size:34px} .kpi.ok b{color:#198754} .kpi.ko b{color:#c62828}
  table{width:100%;border-collapse:collapse;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 1px 3px #0002}
  th,td{padding:10px 12px;text-align:left;border-bottom:1px solid #eee;font-size:14px} th{background:#eef1f6}
  .b{padding:2px 10px;border-radius:12px;font-size:12px;font-weight:600;color:#fff}
  /* Los colores de fondo van solo en la etiqueta (.b): las tarjetas de arriba (.kpi) usan .ok/.ko solo para el color del número. */
  .b.ok{background:#198754}.b.ko{background:#c62828}.b.sk{background:#6c757d}
  .card{background:#fff;border-left:5px solid #c62828;border-radius:8px;padding:8px 20px 16px;margin:16px 0;box-shadow:0 1px 3px #0002}
  .card img{max-width:100%;border:1px solid #ddd;border-radius:6px} code{background:#f0f0f0;padding:1px 6px;border-radius:4px}
  .help{background:#fff8e1;border:1px solid #ffe08a;border-radius:8px;padding:12px 16px;margin:0 0 24px;font-size:14px}
  @media(max-width:700px){.kpis{grid-template-columns:repeat(2,1fr)}}
</style></head><body>
<header><h1>${esc(this.options.title)}</h1><p>${esc(this.options.subtitle ?? "")} · Ejecutado el ${esc(this.startedAt.toLocaleString("es-AR"))} · ${seconds} s</p></header>
<main>
  <div class="kpis">
    <div class="kpi"><b>${t.executed}</b>Escenarios ejecutados</div>
    <div class="kpi ok"><b>${t.passed}</b>Pasaron</div>
    <div class="kpi ko"><b>${t.failed}</b>Fallaron</div>
    <div class="kpi"><b>${t.skipped}</b>Omitidos</div>
  </div>
  <div class="help"><strong>Cómo leer este reporte:</strong> ${esc(this.options.help ?? DEFAULT_HELP)}</div>
  <h2>Todos los escenarios</h2>
  <table><thead><tr><th>ID</th><th>Escenario</th><th>Tipo</th><th>Resultado</th></tr></thead><tbody>
${rowsHtml}
  </tbody></table>
  ${failedHtml ? `<h2>Detalle de los escenarios que fallaron</h2>\n${failedHtml}` : ""}
</main></body></html>`;
  }
}
