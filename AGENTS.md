# AGENTS.md — Técnica Farmatodo (QA)

Resolución de la prueba técnica de **Ingeniero de Calidad (QA) de Farmatodo**, escrita por Fernando Llanes Paz. La leen y la mantienen QA, y también producto, UX y áreas funcionales, por eso todo va en español y en lenguaje simple. Objetivo: dejar los 4 puntos de la prueba terminados, verificables y fáciles de revisar.

Los 4 puntos de la prueba:

1. Suite automatizada sobre https://wordcounter.net/ (palabras, caracteres, top 3 de Keyword Density) con reporte resumen.
2. Reporte breve de defectos de wordcounter.net.
3. 3 problemas de UX en farmatodo.com.ar.
4. Algoritmo que lee un `.txt`, cuenta palabras y caracteres y arma un histograma, con su complejidad.

## Stack y estructura

- TypeScript, Node.js 20 o superior (se probó con Node 26), `tsx`, Playwright Test, `esbuild`. El algoritmo usa solo funciones estándar de JavaScript (`readline`, `Map`, `Intl.Segmenter`, `Intl.Collator`).
- `src/word-frequency/core.ts`: el algoritmo puro (sin Node). `analyzer.ts` lo re-exporta y agrega la lectura de archivos. `histogram.ts` da formato a la salida. `cli.ts` es la consola.
- `visor/contador-palabras.html`: página web local del punto 4. **Es un archivo generado, no se edita a mano.** Se regenera desde `src/word-frequency/visor/plantilla.html` con `npm run visor:construir`.
- `data/scenarios.ts`: escenarios de wordcounter.net con valores esperados calculados a mano. `pages/wordCounterPage.ts` es el Page Object. `helpers/` tiene la captura automática y la verificación del top 3 con empates.
- `tests/` (web y visor), `unit/` (algoritmo), `reporters/summary-reporter.ts` (genera `resumen.html`, `resumen.md` y `resultados.json`).
- `docs/01` a `docs/05`: resumen ejecutivo, reporte de fallas (BUG-001 a 005), reporte UX (BUG-006 a 008), algoritmo y glosario.
- `evidencias/`: capturas curadas de cada bug, enlazadas desde los docs. `resultados-referencia/`: una corrida completa guardada para verla sin ejecutar nada. `reports/`: salida de cada corrida (no se sube a git). `exploracion/`: scripts de exploración manual, no son parte de la suite.
- `MEMORY.md`: memoria viva del proyecto (estado, decisiones, pendientes). Leer primero al empezar un chat nuevo.
- `.cursor/rules/coordinador.mdc` y `.cursor/agents/`: el agente coordinador y los subagentes (ver «Agentes y subagentes»).

## Comandos

```powershell
npm install
npx playwright install chromium
npm run test:algoritmo      # punto 4: 37 pruebas, ~3 s, sin internet
npm run test:visor          # página web local: 19 pruebas, ~15 s, sin internet
npm run test:wordcounter    # punto 1: 30 escenarios, ~2 min, necesita internet
npm run test:core           # punto 1: solo escenarios de núcleo
npm run test:todo           # algoritmo + visor + wordcounter
npm run typecheck           # revisión de tipos (lint del proyecto)
npm run frecuencia -- samples/ejemplo-farmatodo.txt --bars
npm run visor:construir     # regenera visor/contador-palabras.html
npm run visor               # genera y abre la página web local
npm run report              # reporte técnico de Playwright
```

No hay compilación ni lint aparte: `npm run typecheck` es la revisión estática.

## Convenciones

- **Idioma:** chat, documentación, comentarios de código y textos de las pruebas en **español**. Solo los nombres técnicos (funciones, variables, archivos de configuración) van en inglés. Todo código nuevo se comenta en español.
- **Nombres:** bugs `BUG-001`…, observaciones `OBS-01`…; escenarios `SC-xx` (núcleo, deben pasar), `OB-xx` (observaciones, deben pasar), `ED-xx` (hallazgos, fallan a propósito), `AL-xx` (algoritmo), `XV-xx` (verificación cruzada), `VI-xx` (página web local).
- **Capturas:** `BUG-006 [Mobile] Título.png` (bug, plataforma y título).
- **Patrones de referencia:** escenarios nuevos de wordcounter siguiendo `data/scenarios.ts` y `pages/wordCounterPage.ts`; pruebas del algoritmo siguiendo `unit/word-frequency.spec.ts`; fichas de bug siguiendo `docs/02-reporte-fallas-wordcounter.md` (título, ambiente, precondiciones, pasos, resultado actual y esperado, severidad).
- Valores esperados **siempre calculados a mano**, nunca copiados de lo que muestra el sitio.

## Reglas de dominio / trampas conocidas

- **Palabra:** bloque entre espacios o saltos de línea con al menos una letra, dígito o emoji. La puntuación de borde se ignora, las mayúsculas son iguales, y los guiones, guion bajo y barras internos se conservan. **Carácter:** lo que se ve, con espacios y sin saltos de línea; un emoji cuenta 1.
- **Histograma:** orden descendente por repeticiones y alfabético en empate. El ejemplo del enunciado debe dar `14 words`, `99 characters`, `farmatodo: 6`, `cuida: 3`, `salud: 2`, `tu: 2`, `toda: 1`. Complejidad: tiempo O(n + k log k), espacio O(k).
- **Empates en wordcounter.net:** el sitio desempata por orden de aparición, no alfabético (OB-01). El top 3 se valida tolerante a empates.
- **Los 9 fallos `ED-01` a `ED-09` son el resultado esperado** de la suite web (son defectos del sitio, no errores del proyecto). Si falla un `SC-xx` u `OB-xx`, sí hay que investigar.
- **Playwright en el terminal de Cursor:** la variable `PLAYWRIGHT_BROWSERS_PATH` apunta a un caché vacío y se restablece en cada llamada. Hay que ejecutar `Remove-Item Env:PLAYWRIGHT_BROWSERS_PATH` **en el mismo comando** que corre Playwright; si no, los 30 escenarios fallan en 5 ms con «Executable doesn't exist».
- **Acentos en PowerShell:** la consola los muestra mal (solo visual). Para editar archivos con acentos usar las herramientas de edición, no `Get-Content | Set-Content`.
- **Visor desactualizado:** tras tocar `core.ts`, `histogram.ts` o la plantilla hay que correr `npm run visor:construir`; la prueba VI-12 falla si no se hizo.
- **Transparencia sobre IA:** el algoritmo y el código los desarrolló una IA; Fernando puso el criterio de prueba y las reglas de negocio. No escribir en primera persona que el código o el algoritmo son «míos» o «propios»; decir «el algoritmo del punto 4».
- No cambiar ninguna configuración del sitio probado: siempre la configuración por defecto (idioma del navegador `en-US`).

## Forma de trabajar

- **Planificar antes de tocar código** cuando el cambio afecta reglas de conteo, el formato de salida, el reporte o más de un punto de la prueba. En esos casos se sigue **SDD** (primero la especificación, ver más abajo).
- Cambios chicos y de un solo tema. Un bug nuevo es una ficha en `docs/` más su captura con el nombre correcto.
- Al terminar, explicar en lenguaje natural: qué se cambió, por qué, qué se verificó y qué queda pendiente. Si el estado del proyecto cambió, actualizar `MEMORY.md`.

### Agentes y subagentes

Hay un **agente coordinador** y varios **subagentes** (asistentes que trabajan en una sesión aparte y devuelven su resultado al coordinador). El coordinador habla con Fernando, reparte el trabajo y junta las respuestas en un solo resumen. Está definido en `.cursor/rules/coordinador.mdc`; los subagentes están en `.cursor/agents/`.

| Quién | Para qué sirve |
|---|---|
| Coordinador | Dirige el flujo, pasa el contexto a cada subagente y pide la aprobación de Fernando en cada etapa. |
| `planificador` | Escribe la spec, el plan y las tareas en `specs/NNN-nombre/`. Nunca escribe código. |
| `implementador` | Hace **una** tarea de un plan aprobado y corre las pruebas. |
| `revisor` | Revisa la spec como QA y valida lo implementado requisito por requisito. No modifica nada. Termina con `VEREDICTO: APROBADO` o `CAMBIOS NECESARIOS`. |
| `revisor-wordcounter` | Puntos 1 y 2: escenarios, valores esperados, bugs de wordcounter.net. |
| `revisor-algoritmo` | Punto 4: reglas de conteo, orden del histograma, complejidad y página web local. |
| `revisor-ux-farmatodo` | Punto 3: que cada problema de UX tenga vista, pasos para replicar y captura. |
| `revisor-reportes-docs` | Documentos y resúmenes: claridad, español, consistencia con el código y con `MEMORY.md`. |

**Cuando hay cambios para revisar:** el coordinador mira qué archivos cambiaron y llama, en paralelo, a los revisores de área que corresponden (por ejemplo, un cambio en `core.ts` va a `revisor-algoritmo` y a `revisor`). Después junta todo en un solo informe, sin duplicados, con un veredicto final.

**Cuando hay que implementar algo (SDD, desarrollo guiado por especificación):** coordinador → planificador → implementador → revisor.

1. El `planificador` escribe la spec; el `revisor` la lee como QA; **Fernando la aprueba**.
2. El `planificador` hace el plan y las tareas (máximo 10); **Fernando los aprueba**.
3. El `implementador` hace una tarea por vez, con pruebas en verde después de cada una.
4. El `revisor` valida requisito por requisito. Si pide cambios, se corrige y se revisa de nuevo (máximo 2 vueltas).
5. El coordinador cierra con un resumen y actualiza `MEMORY.md`.

El coordinador nunca se salta una aprobación de Fernando. Un cambio muy chico (un texto, un número) no necesita spec. Los subagentes no ven la conversación: el coordinador les pasa el pedido original, las decisiones y las rutas de los archivos.

## Límites

- ✅ **Siempre:** comentar el código nuevo en español; calcular los valores esperados a mano; correr `npm run typecheck` y las pruebas del área tocada antes de terminar; regenerar el visor si se tocó el algoritmo o la plantilla; actualizar `MEMORY.md` cuando cambie el estado.
- ⚠️ **Preguntar antes:** instalar dependencias nuevas; crear archivos nuevos fuera de `docs/`, `evidencias/` y `specs/`; cambiar las reglas de qué es una palabra o un carácter; cambiar el formato de `resultados.json` o del reporte; elegir otros 3 problemas de UX; cualquier cosa que cambie el criterio de prueba de Fernando.
- 🚫 **Nunca:** editar a mano `visor/contador-palabras.html`; modificar la configuración del sitio que se prueba; hacer que un `ED-xx` pase ocultando el defecto; copiar valores esperados desde el sitio; hacer `git push`, crear el repo en GitHub o enviar el correo sin el OK de Fernando (el correo solo se puede mandar una vez); borrar `evidencias/` o `resultados-referencia/`; escribir que el código lo hizo Fernando.

## Verificación

Antes de dar un cambio por terminado:

1. `npm run typecheck` sin errores.
2. Si se tocó el algoritmo o el visor: `npm run test:algoritmo` (37/37) y `npm run test:visor` (19/19). Si se tocó `core.ts`, `histogram.ts` o la plantilla, correr antes `npm run visor:construir`.
3. Si se tocó la suite web: `npm run test:wordcounter` (con `Remove-Item Env:PLAYWRIGHT_BROWSERS_PATH` en el mismo comando). El resultado esperado es **21 pasan y 9 fallan** (los `ED-01` a `ED-09`).
4. Si se tocó el ejemplo del enunciado: `npm run frecuencia -- samples/ejemplo-farmatodo.txt` y actualizar la sección «Salida real» de `docs/04-contador-frecuencia-palabras.md`.
5. Si se tocaron documentos: revisar que los números y nombres (BUG, SC, ED) coincidan con `README.md` y `MEMORY.md`.
