# Prueba técnica · Ingeniero de Calidad (QA) · Farmatodo

Autor: Fernando Llanes Paz

Este repositorio contiene la resolución de los 4 puntos de la prueba. Todo está en español, incluidos los comentarios del código, para que cualquier persona del equipo pueda leerlo y mantenerlo. Solo los nombres técnicos (funciones, variables, archivos de configuración) están en inglés, como es habitual en programación.

## Transparencia sobre el uso de IA

Este repositorio se desarrolló con ayuda de un **asistente de inteligencia artificial integrado en el editor Cursor**. El código del algoritmo del punto 4 (`src/word-frequency/`), el código de las pruebas y los comentarios en español que explican cada parte **fueron escritos por la IA, no por mí**. Un algoritmo así va más allá de lo que hago normalmente como QA y prefiero decirlo con claridad.

Lo que sí es mío: el **criterio de prueba** (qué casos probar y qué resultado esperar), las **reglas de negocio** del conteo (qué es una palabra y un carácter, mayúsculas, puntuación, tildes, emoji, orden), la **elección y el formato** de los defectos reportados, y la **revisión y validación** de todo el resultado. La documentación de cada decisión está en `docs/`.

Tecnologías: TypeScript, Node.js, `tsx`, Playwright Test, y las funciones estándar de JavaScript `readline`, `Map`, `Intl.Segmenter` e `Intl.Collator`. El detalle de qué hace cada archivo y función está en [`docs/04-contador-frecuencia-palabras.md`](docs/04-contador-frecuencia-palabras.md#transparencia-cómo-se-desarrolló-este-punto).

## Dónde está cada punto

| Punto | Qué se pidió | Dónde está | Resultado |
|---|---|---|---|
| **1** | Suite automatizada sobre https://wordcounter.net/ (palabras, caracteres, top 3 de Keyword Density) y reporte resumen | Código: `tests/wordcounter/`, `pages/`, `helpers/`, `data/scenarios.ts`. Reporte: [`resultados-referencia/wordcounter/resumen.html`](resultados-referencia/wordcounter/resumen.html) | 30 escenarios · **21 pasaron** · **9 fallaron** (los 9 son defectos del sitio documentados; los 19 de núcleo pasan) |
| **2** | Reporte de defectos u oportunidades de mejora de wordcounter.net | [`docs/02-reporte-fallas-wordcounter.md`](docs/02-reporte-fallas-wordcounter.md) | 5 bugs (BUG-001 a BUG-005) + observaciones |
| **3** | 3 problemas de UX en farmatodo.com.ar | [`docs/03-reporte-ux-farmatodo.md`](docs/03-reporte-ux-farmatodo.md) | 3 bugs (BUG-006 a BUG-008) + observaciones (OBS-01 a OBS-04) |
| **4** | Algoritmo de histograma de palabras desde un `.txt` (desarrollado con IA, ver «Transparencia») | Código: `src/word-frequency/`. Explicación y complejidad: [`docs/04-contador-frecuencia-palabras.md`](docs/04-contador-frecuencia-palabras.md) | 37 pruebas del algoritmo · **37 pasaron**. Más una **página web local** (`visor/contador-palabras.html`, se abre con doble clic, sin internet): 19 pruebas · **19 pasaron** |

Otros documentos:

- [`docs/01-resumen-ejecutivo.md`](docs/01-resumen-ejecutivo.md): resumen sin tecnicismos, para producto, UX y áreas funcionales.
- [`docs/05-glosario.md`](docs/05-glosario.md): palabras técnicas explicadas en simple.

## Convención de nombres

- **Bugs:** `BUG-001` a `BUG-008`. Cada uno tiene su ficha completa en `docs/02` (wordcounter) o `docs/03` (Farmatodo).
- **Observaciones:** `OBS-01`, `OBS-02`, etc. Todavía no son bugs confirmados.
- **Capturas:** llevan el nombre del bug y la plataforma, por ejemplo `BUG-006 [Mobile] El precio cambia según cómo se llega a la búsqueda - buscador.png`. Así se encuentra la evidencia de cada bug sin buscarla.
- **Escenarios automatizados:** `SC-xx` (núcleo, deben pasar), `OB-xx` (observaciones de la suite) y `ED-xx` (escenarios que falla un bug). En el reporte, cada `ED-xx` muestra el bug al que corresponde.

## Requisitos

Antes de empezar, instala estas dos herramientas (una sola vez):

1. **Git:** https://git-scm.com/downloads (sirve para bajar el proyecto).
2. **Node.js 20 o superior**, versión LTS: https://nodejs.org (se probó con Node 26). Para comprobarlo, abre una terminal y escribe `node -v`. Debe mostrar `v20` o un número mayor.

Además:

- Conexión a internet para instalar y para el punto 1 (usa el sitio real de wordcounter.net). El punto 4 (algoritmo y página web local) funciona sin internet una vez instalado.
- Windows, macOS o Linux. Los comandos están escritos para PowerShell; en otras terminales son iguales.

## Instalación desde cero

Abre una terminal (PowerShell en Windows) y sigue estos pasos:

1. **Bajar el proyecto** desde GitHub y entrar a su carpeta:
   ```powershell
   git clone https://github.com/FerPazAutomation/Farmatodo-QA-Prueba-Tecnica.git
   cd Farmatodo-QA-Prueba-Tecnica
   ```
2. **Instalar las librerías del proyecto.** Se descargan en la carpeta `node_modules/`, que no se sube a git:
   ```powershell
   npm install
   ```
3. **Instalar el navegador de las pruebas** (Chromium, con Playwright):
   ```powershell
   npx playwright install chromium
   ```
4. **Comprobar que todo funciona.** Este comando no necesita internet y debe terminar con 37 pruebas pasadas:
   ```powershell
   npm run test:algoritmo
   ```

Luego puedes seguir con la tabla de «Cómo ejecutar» más abajo.

**Problemas frecuentes:**

- **Aparece «la ejecución de scripts está deshabilitada» al usar `npm`** (Windows). Ejecuta una sola vez en PowerShell `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, confirma con `S` y vuelve a intentar.
- **`node` o `npm` no se reconocen.** Cierra la terminal y ábrela de nuevo después de instalar Node.js.
- **`npx playwright install chromium` falla.** Revisa la conexión a internet y vuelve a correrlo.
- **Las pruebas del punto 1 no pueden abrir el sitio.** Revisa la conexión. Si el sitio está caído, esas pruebas fallan, pero el punto 4 sigue funcionando.

## Cómo ejecutar

| Qué | Comando | Dura | Internet |
|---|---|---|---|
| Punto 4: pruebas del algoritmo | `npm run test:algoritmo` | ~3 s | No |
| Punto 4: **abrir la página web local** (cuenta palabras, porcentajes y empates) | `npm run visor` (o abrir `visor/contador-palabras.html` con doble clic) | instantáneo | No |
| Punto 4: pruebas de la página web local | `npm run test:visor` | ~15 s | No |
| Punto 4: usar el programa de consola | `npm run frecuencia -- samples/ejemplo-farmatodo.txt` | instantáneo | No |
| Punto 4: con barras | `npm run frecuencia -- samples/ejemplo-farmatodo.txt --bars` | instantáneo | No |
| Punto 1: suite de wordcounter.net | `npm run test:wordcounter` | ~2 min | **Sí** |
| Solo escenarios de núcleo | `npm run test:core` | ~1 min | Sí |
| Todo junto | `npm run test:todo` | ~2 min | Sí |
| Revisión de tipos | `npm run typecheck` | segundos | No |
| Abrir el reporte detallado de Playwright | `npm run report` | | |

**Importante sobre la suite web:** termina con código de error (`exit 1`) **a propósito**, porque 9 escenarios `ED-xx` afirman el comportamiento esperado y el sitio hoy no lo cumple (cada uno es un defecto documentado). Los escenarios de núcleo `SC-xx` y las observaciones `OB-xx` deben pasar siempre. Si alguno de ellos falla, es una regresión o un cambio en el sitio.

Tras cada ejecución se generan, en `reports/` (no se sube a git):

- `reports/wordcounter/resumen.html`: resumen para el equipo (escenarios ejecutados, cuántos pasaron, cuántos fallaron, descripción de cada error y captura).
- `reports/wordcounter/resumen.md` y `resultados.json`: lo mismo en texto y en datos.
- `reports/wordcounter/playwright-html/`: reporte técnico con trazas.
- `reports/algoritmo/resumen.html`: idem para el algoritmo.
- `reports/visor/resumen.html`: idem para la página web local del contador.

**Cómo leer el `resumen.html`:**

1. **Arriba, cuatro tarjetas:** escenarios ejecutados, cuántos pasaron (verde), cuántos fallaron (rojo) y cuántos se omitieron.
2. **«Todos los escenarios»:** una fila por escenario, con su ID, nombre, tipo y resultado (Pasó / Falló).
3. **«Detalle de los escenarios que fallaron»:** por cada fallo, qué se probó, el texto ingresado, la descripción del error, el bug relacionado (BUG-xxx) y una captura de pantalla.
4. En la suite web, **9 fallos es el resultado esperado** (ED-01 a ED-09, uno por cada comportamiento erróneo del sitio). Si falla un `SC-xx` u `OB-xx`, hay que mirarlo: puede ser un cambio del sitio o lentitud de la red.
5. En el reporte del algoritmo, el resultado esperado es **0 fallos**.

Una ejecución de referencia ya está guardada en [`resultados-referencia/`](resultados-referencia/) para poder verla sin ejecutar nada.

## Estructura

```
data/scenarios.ts             Escenarios SOLO de wordcounter.net (SC-xx y ED-xx) con valores esperados calculados a mano
pages/wordCounterPage.ts      Page Object (selectores estables, roles accesibles)
helpers/fixtures.ts           Fixture con captura de pantalla automática como evidencia
helpers/assertions.ts         Verificación del top 3 tolerante a empates, con porcentajes
tests/wordcounter/            Pruebas del punto 1 (conteo.spec.ts, interaccion.spec.ts)
unit/                         Casos del ALGORITMO (punto 4: AL-xx) y verificación cruzada (XV-xx)
src/word-frequency/           Algoritmo (core.ts), lectura de archivos, formato de salida y línea de comandos
src/word-frequency/visor/     Plantilla de la página web local y punto de entrada que empaqueta el algoritmo
scripts/construir-visor.ts    Genera visor/contador-palabras.html a partir de la plantilla y del algoritmo real
visor/                        contador-palabras.html: página web local (un solo archivo, sin internet). GENERADA, no editar a mano
tests/visor/                  Pruebas de la página web local (VI-xx, 19 pruebas)
reporters/                    Generador del reporte resumen
samples/                      Texto de ejemplo para el algoritmo (se puede editar)
docs/                         Documentación (puntos 2, 3, 4, resumen y glosario)
evidencias/                   Capturas CURADAS de cada bug (wordcounter/ y farmatodo/), enlazadas desde docs/02 y docs/03.
                              No cambian con cada ejecución: son la prueba que respalda cada reporte de bug.
exploracion/                  Scripts de exploración manual (no son parte de la suite)
resultados-referencia/        Una ejecución completa guardada como referencia. Es autosuficiente: cada resumen.html trae
                              sus propias capturas en su carpeta evidencias/, así se abre sin depender de nada más.
                              Se sobrescribe cada vez que se actualiza la referencia (por eso no es la evidencia de los bugs).
```

## Cómo está pensada la suite del punto 1

- **Configuración por defecto del sitio.** No se cambia ningún ajuste (idioma del navegador fijo en `en-US` porque el sitio está en inglés).
- **Valores esperados calculados a mano**, nunca copiados de lo que muestra el sitio. Se verifican contra el algoritmo del punto 4 (`unit/scenarios-vs-algorithm.spec.ts`).
- **Tres tipos de escenario:**
  - `SC-xx` **núcleo:** lo que pide la prueba y debe funcionar (19, todos pasan).
  - `OB-xx` **observación:** comportamiento del sitio que se deja documentado (2, pasan).
  - `ED-xx` **hallazgo:** afirma lo razonable; falla porque el sitio se desvía (9).
- **Top 3 con empates:** si dos palabras empatan, el sitio las ordena por aparición (no alfabético; se documenta en `OB-01`). La verificación acepta cualquier orden válido dentro de un empate.
- **Evidencia automática:** cada escenario guarda una captura de pantalla.

## Supuestos principales

- Palabra = bloque separado por espacios o saltos de línea; mayúsculas iguales; puntuación en los bordes ignorada.
- Carácter = lo que se ve (un emoji cuenta 1), con espacios y sin saltos de línea.
- Si el equipo tiene otra definición, los hallazgos `ED-xx` pasarían a ser diferencias de criterio.

El detalle completo está en `docs/04-contador-frecuencia-palabras.md` y `docs/02-reporte-fallas-wordcounter.md`.

## Navegador y entorno de la ejecución de referencia

Chromium de Playwright (headless), Windows 11, Node 26, ventana 1366×900, idioma `en-US`. Ejecución del 19/11/2026.
