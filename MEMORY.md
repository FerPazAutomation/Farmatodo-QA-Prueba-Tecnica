# MEMORY.md — Prueba técnica QA Farmatodo

Memoria viva del proyecto. Leer primero al empezar un chat nuevo.
Ubicación: la carpeta raíz de este repositorio.

## 1. Estado general (19/11/2026)

**Todo el contenido de la prueba está terminado y verificado.** Falta solo lo que requiere decisión de Fernando (ver sección 6).

| Punto | Estado | Dónde |
|---|---|---|
| 1 Suite wordcounter.net | Hecho. Corrida completa: 30 escenarios · 21 pasaron · 9 fallaron (ED-01..ED-09, a propósito). 19 de núcleo y 2 OB pasan. | `tests/wordcounter/`, `resultados-referencia/wordcounter/resumen.html` |
| 2 Reporte de fallas | Hecho, en formato de ficha (título, ambiente, precondiciones, pasos, resultado actual/esperado, severidad, criticidad). BUG-001..005 | `docs/02-reporte-fallas-wordcounter.md`, capturas en `evidencias/wordcounter/` |
| 3 UX Farmatodo | Hecho, en formato de ficha. BUG-006 precio distinto según camino (verificado desktop, tablet y mobile), BUG-007 «+» tapa el nombre (mobile), BUG-008 «1 productos» (desktop+mobile). OBS-01..04 como observaciones | `docs/03-reporte-ux-farmatodo.md`, capturas en `evidencias/farmatodo/` |
| 4 Algoritmo | Hecho. 37/37 pruebas + página web local (19/19). Salida del enunciado (14 / 99 / farmatodo: 6) verificada y documentada en `docs/04` | `src/word-frequency/`, `docs/04-contador-frecuencia-palabras.md` |
| Docs extra | Hechos | `README.md`, `docs/01-resumen-ejecutivo.md`, `docs/05-glosario.md`. El borrador del correo se quitó de `docs/` (ver pendiente 2) |
| Git | Repo **local** inicializado y commiteado. **Sin remoto**: no se creó repo en GitHub ni se hizo push | — |

**Convención de nombres (pedido de Fernando 19/11 15:38):** bugs `BUG-xxx`, observaciones `OBS-xx`. Cada captura lleva el nombre del bug y la plataforma: `BUG-006 [Mobile] Título.png`. El reporter genera las capturas de wordcounter con ese mismo formato (`BUG-xxx [Plataforma] Título - ED-xx.png`). Al agregar un bug nuevo: ficha en `docs/` y captura con el mismo nombre.

## 2. Qué pide la prueba (PDF `prueba-ingeniero-calidad-qa-farmatodo.pdf`)

1. Suite automatizada sobre https://wordcounter.net/ (palabras, caracteres, top 3 de Keyword Density con repeticiones). Configuración por defecto. Reporte resumen: ejecutados / pasaron / fallaron + descripción del error.
2. Reporte breve de defectos u oportunidades de mejora de wordcounter.net.
3. 3 problemas de UX en farmatodo.com.ar (elegimos Argentina): qué está mal, cómo replicarlo, en qué vista.
4. Algoritmo propio que lee un .txt, cuenta palabras y caracteres, histograma desc y alfabético en empate. Complejidad.

Requisitos: repo en GitHub compartido con instrucciones; **preguntas o supuestos en un solo correo**; sin cambiar configuración del sitio.

## 3. Criterio de entrega pedido por Fernando

- Lenguaje natural, detallado, con evidencias reales (capturas, salidas).
- Documentación legible por técnicos y también por UX/PO/AF: resumen ejecutivo simple + detalle técnico aparte.
- Chat, documentación **y comentarios de código en español** (el equipo que lo recibe habla solo español; pedido de Fernando el 19/11 15:00). Los nombres de funciones/variables siguen en inglés. Al agregar código nuevo, comentar siempre en español.
- Fernando delegó el control total (19/11 10:17) para terminar el proyecto sin pedir permisos; revisará al volver.

## 4. Cómo se ejecuta (ver README.md)

```powershell
npm install
npx playwright install chromium
npm run test:algoritmo      # punto 4 (37 tests, sin internet)
npm run test:visor          # página web local (19 tests, sin internet)
npm run visor               # genera y abre la página web local
npm run test:wordcounter    # punto 1 (~2 min, internet; termina en exit 1 a propósito por los ED)
npm run frecuencia -- samples/ejemplo-farmatodo.txt [--bars]
npm run typecheck
```

## 5. Gotchas de entorno (importante para futuros chats)

- En el terminal de Cursor la variable `PLAYWRIGHT_BROWSERS_PATH` apunta a un caché de sandbox vacío y **se restablece en cada llamada**. Hay que hacer `Remove-Item Env:PLAYWRIGHT_BROWSERS_PATH` **dentro del mismo comando** que corre Playwright (los navegadores los instala `npx playwright install chromium`). Si no, los 30 tests fallan en 5 ms con «Executable doesn't exist».
- Los comandos de shell necesitan `required_permissions: ["all"]` en esta máquina (no hay sandbox de archivos).
- La consola de PowerShell muestra mal los acentos (solo visual). Para editar archivos con acentos usar las herramientas Write/StrReplace, **no** `Get-Content | Set-Content` (rompe la codificación).
- `FORCE_COLOR`/`NO_COLOR` ya no molestan; el warning de Node es inofensivo.

## 5a. Transparencia sobre IA (pedido de Fernando 19/11 16:34)

- Fernando pidió decir con honestidad que el algoritmo del punto 4 (y el código en general) lo desarrolló una IA (Cursor), que él no lo escribió, pero que sí puso el criterio de prueba y las reglas de negocio. Quedó escrito en `README.md` (sección «Transparencia»), `docs/04` (quién hizo qué, tecnologías, qué hace cada función), `docs/01`, el correo (ya no está en `docs/`) y en el encabezado de `src/word-frequency/*.ts`.
- Regla: no escribir en primera persona que el código o el algoritmo son «míos/propios». Usar «el algoritmo del punto 4».
- Fernando cambió `samples/ejemplo-farmatodo.txt` (ahora 55 palabras, 312 caracteres). Las 37 pruebas no dependen de ese archivo; usan textos propios. Si se vuelve a cambiar el ejemplo, actualizar la sección «Salida real» de `docs/04`.

## 5a2. Reporte resumen y carpetas de evidencias (19/11 17:17)

- Bug visual corregido en `reporters/summary-reporter.ts`: `.ok/.ko` pintaban de verde/rojo el fondo de las tarjetas «Pasaron/Fallaron» y el número quedaba invisible. Ahora el fondo va solo en `.b.ok/.b.ko` (las etiquetas). Nuevo option `help` para que el recuadro «Cómo leer este reporte» del algoritmo no hable de «el sitio».
- El reporter ya no deja una carpeta `evidencias/` vacía (el algoritmo no genera capturas).
- Roles: `evidencias/` = capturas curadas de los bugs, enlazadas desde docs/02 y docs/03; `resultados-referencia/` = corrida completa autosuficiente (HTML + sus capturas). Las 9 capturas de ED-xx existen en ambas pero son de corridas distintas (no idénticas byte a byte). Decisión tomada: se mantienen ambas; la de la raíz no se sobrescribe al regenerar la referencia.

## 5a3. Página web local del contador (19/11 17:48)

- Pedido de Fernando: un HTML local que haga lo mismo que el algoritmo (contar palabras, porcentajes, orden en empates), para quien abra el proyecto.
- Diseño: el algoritmo puro se separó en `src/word-frequency/core.ts` (sin Node). `analyzer.ts` lo re-exporta y agrega `analyzeFile`. `scripts/construir-visor.ts` empaqueta `core.ts` + `histogram.ts` con esbuild (ahora devDependency explícita) dentro de `src/word-frequency/visor/plantilla.html` y genera `visor/contador-palabras.html` (archivo GENERADO, no editar a mano; se regenera con `npm run visor:construir`).
- Comandos: `npm run visor` (genera y abre), `npm run visor:construir`, `npm run test:visor` (19 pruebas VI-xx en `tests/visor/`, config `playwright.visor.config.ts`, reporte `reports/visor/`). `test:todo` ahora corre algoritmo + visor + wordcounter.
- Porcentaje = veces / total de palabras, 1 decimal con coma («42,9 %»). Empates comparten puesto (1,2,3,3,5…) y van alfabéticos.
- Validación hecha: 19/19, y prueba de mutación (se rompió el desempate y el formato del porcentaje: fallaron 14 y 3 pruebas; luego se revirtió). Las pruebas con valores a mano (VI-01, 03, 04, 13) son las que detectan errores del algoritmo; VI-06 compara contra el propio algoritmo. VI-12 falla si el HTML guardado está desactualizado: tras tocar `core.ts`, `histogram.ts` o la plantilla, correr `npm run visor:construir`.
- Solo probado en Chromium.

## 5a4. Agentes y subagentes (19/11 18:30)

- Se creó `AGENTS.md` (con el formato de plantilla pedido) y un esquema coordinador + subagentes basado en el PDF `Apuntes-Curso-Desarrollo-IA-Dia-3.pdf` (sección «05 - Multiagentes y subagentes», IA-Moure). Flujo del curso: coordinador → planificador → implementador → revisor.
- Coordinador: `.cursor/rules/coordinador.mdc` (siempre activo). Subagentes en `.cursor/agents/`: `planificador`, `implementador`, `revisor` (flujo SDD) y `revisor-wordcounter`, `revisor-algoritmo`, `revisor-ux-farmatodo`, `revisor-reportes-docs` (revisión por área).
- Flujos: SDD con specs en `specs/NNN-nombre/` (spec.md, plan.md, tasks.md), aprobación de Fernando de la spec y del plan, una tarea por vez, máximo 2 vueltas de correcciones. Y revisión de cambios: el coordinador llama en paralelo a los revisores de área según los archivos tocados.

## 5b. Fallas intermitentes resueltas (19/11 15:38)

- Con 4 pruebas en paralelo el sitio tarda más en actualizar sus contadores. Se subió `expect.timeout` a 8 s y `timeout` de prueba a 60 s (`playwright.config.ts`). Antes, SC-01 y SC-16 fallaban de forma intermitente sin razón real.
- `open()` ahora espera `load` completo antes de escribir.
- ED-09 tenía un falso positivo: la espera de guardado tenía `.catch`, así que si el sitio no guardaba, la prueba pasaba. Ahora la espera es obligatoria.
- Resultado final verificado: 21 pasan (todo SC-xx y OB-xx), 9 fallan (ED-01..ED-09 = BUG-001..005).

## 6. Pendientes que dependen de Fernando

1. **Crear el repo en GitHub, compartirlo y hacer push** (no se hizo sin tu OK). Comandos: `git remote add origin <url>` y `git push -u origin main`.
2. **Redactar y enviar el correo único** con preguntas y supuestos. El borrador se quitó de `docs/` (19/11) por decisión de Fernando; sigue en el historial de git (`git show HEAD:docs/05-correo-preguntas-y-supuestos.md`) si hay que recuperarlo. Confirmar destinatario. Solo se puede mandar uno.
3. Confirmar los 3 problemas de UX elegidos (hay 4 observaciones adicionales por si prefiere cambiar alguno).
4. Opcional: probar BUG-007 en un celular real y revisar a mano el selector de ciudad (no se pudo automatizar) y la burbuja «1» de la grilla (resultado no concluyente).
5. Revisión completa del 19/11 (18:33) con los subagentes `revisor*`: typecheck limpio, 37/37, 19/19 y 21/30 con los 9 fallos esperados. Quedó una lista de mejoras de redacción y de repeticiones entre documentos (ver chat); se aplican solo con el OK de Fernando.

## 7. Supuestos y decisiones fijas

- Palabra = bloque entre espacios/saltos de línea con al menos una letra, dígito o emoji; puntuación de borde ignorada; mayúsculas iguales; guiones/guion bajo/barras internos se conservan.
- Carácter = grafema visible, con espacios, sin saltos de línea. Emoji = 1 carácter y 1 palabra.
- El desempate del sitio en Keyword Density es por orden de aparición (OB-01); el top 3 se valida tolerante a empates.
- Complejidad del algoritmo: tiempo O(n + k log k), espacio O(k).
- Locale `en-US` en la suite (el sitio está en inglés). No se modifica ningún ajuste del sitio.
- Escenarios ED fallan a propósito y quedan documentados; SC/OB deben pasar.
- Si se cambia la regla de emoji en `analyzer.ts`, revisar AL-08, AL-16 y ED-01.

## 8. Estructura

```
data/scenarios.ts             Escenarios (SC núcleo, ED hallazgos) con valores esperados a mano
pages/wordCounterPage.ts      Page Object
helpers/                      fixtures (evidencia automática) y assertions (top 3 con empates)
tests/wordcounter/            conteo.spec.ts (data-driven) · interaccion.spec.ts (SC-13..19, OB-01/02, ED-09)
unit/                         word-frequency.spec.ts (AL-01..17) · scenarios-vs-algorithm.spec.ts (XV-)
src/word-frequency/           core.ts (algoritmo puro) · analyzer.ts · histogram.ts · cli.ts · visor/ (plantilla de la página web local)
scripts/construir-visor.ts    Genera visor/contador-palabras.html (archivo generado, no editar)
visor/ · tests/visor/         Página web local y sus 19 pruebas (VI-xx)
samples/                      Texto de ejemplo del algoritmo
specs/                        Specs del flujo SDD (se crea cuando haga falta)
reporters/summary-reporter.ts Genera resumen.html/md y resultados.json
docs/                         01..06
evidencias/                   farmatodo/ y wordcounter/ (capturas para los reportes)
resultados-referencia/        Copia de la corrida completa (html/md/json + capturas)
exploracion/                  Scripts y salidas de exploración manual (no son parte de la suite)
reports/                      Salida generada (en .gitignore)
```
