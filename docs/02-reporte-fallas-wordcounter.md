# Punto 2 · Reporte de bugs de wordcounter.net

Cada bug tiene su ficha completa para reproducirlo sin ayuda. Las capturas de evidencia llevan el mismo nombre del bug.

## Datos generales

- **Sitio:** https://wordcounter.net/ (configuración por defecto, sin cambiar nada del sitio).
- **Fecha de la verificación:** 19/11/2026.
- **Plataforma probada:** Desktop. Los bugs 001 a 005 no se verificaron en mobile.
- **Cómo se verificó:** con la suite automatizada del punto 1 (carpeta `tests/wordcounter/`). Cada bug tiene al menos un escenario `ED-xx` que falla a propósito, y la prueba toma una captura en el momento del fallo.

## Resumen de bugs

| ID | Título | Plataforma | Severidad | Criticidad | Escenario automatizado |
|---|---|---|---|---|---|
| BUG-001 | Con AUTO-SAVE en OFF el texto se guarda igual | Desktop | Media | Media | ED-09 |
| BUG-002 | Cada emoji cuenta como 2 caracteres | Desktop | Baja | Baja | ED-01 |
| BUG-003 | Words y Keyword Density cuentan distinto con espacio invisible | Desktop | Media | Baja | ED-02 |
| BUG-004 | Keyword Density omite números, letras sueltas y palabras comunes en inglés | Desktop | **Alta** | Media | ED-03, ED-04, ED-05 |
| BUG-005 | Parte palabras en guion bajo, barras y direcciones web | Desktop | Media | Baja | ED-06, ED-07, ED-08 |

### Qué significan Severidad y Criticidad

- **Severidad** = qué tan grave es el defecto en sí. Alta: el resultado es incorrecto en la función principal, o hay pérdida de datos o de privacidad. Media: el comportamiento es incorrecto pero hay forma de seguir usando la función. Baja: detalle visual, ortográfico o de un caso poco frecuente.
- **Criticidad** = qué tan urgente es corregirlo para el negocio. Alta: corregir antes de la próxima versión. Media: planificar en el siguiente ciclo. Baja: corregir cuando haya tiempo.

Un bug puede tener severidad alta y criticidad media (por ejemplo, un resultado equivocado en una herramienta gratuita que no mueve dinero). La decisión final de prioridad la toma el PO.

---

## BUG-001 · [Desktop] Con AUTO-SAVE en OFF el texto se guarda igual

- **Título:** Con AUTO-SAVE en OFF el texto se guarda igual
- **Ambiente:** https://wordcounter.net/ · Chromium automatizado (Playwright) · Windows 11 · Desktop 1366×900 · idioma en-US · configuración por defecto.
- **Precondiciones:** El editor está vacío (ventana nueva o recién abierta). El botón AUTO-SAVE muestra **OFF**.
- **Pasos de reproducción:**
  1. Abrir https://wordcounter.net/.
  2. Confirmar que el botón AUTO-SAVE dice **OFF**.
  3. Escribir `texto privado de prueba` en el editor.
  4. Esperar unos 3 segundos.
  5. Recargar la página (F5).
- **Resultado actual:** Al recargar, el editor muestra otra vez `texto privado de prueba`. En una ventana de incógnito nueva el editor aparece vacío, así que el texto quedó guardado en ese navegador.
- **Resultado esperado:** Con AUTO-SAVE en OFF, el editor queda vacío al recargar.
- **Severidad:** Media. El botón dice una cosa y el sitio hace otra.
- **Criticidad:** Media. En una computadora compartida (cybercafé, biblioteca, oficina), la siguiente persona ve el texto anterior.
- **Evidencia:** ![Captura BUG-001](<../evidencias/wordcounter/BUG-001 [Desktop] Con AUTO-SAVE en OFF el texto se guarda igual - ED-09.png>)

---

## BUG-002 · [Desktop] Cada emoji cuenta como 2 caracteres

- **Título:** Cada emoji cuenta como 2 caracteres
- **Ambiente:** https://wordcounter.net/ · Chromium automatizado (Playwright) · Windows 11 · Desktop 1366×900 · idioma en-US · configuración por defecto.
- **Precondiciones:** El editor está vacío.
- **Pasos de reproducción:**
  1. Abrir https://wordcounter.net/.
  2. Escribir `hola 😀 hola 😀 mundo`.
  3. Mirar el número de **characters** en el título grande o en el panel Details.
- **Resultado actual:** Muestra **21 characters**.
- **Resultado esperado:** **19 characters**. Cada emoji se ve como un solo carácter.
- **Severidad:** Baja. Solo cambia el número cuando hay emoji.
- **Criticidad:** Baja. Afecta a quien usa el total para respetar un límite de caracteres (SMS, un campo con máximo).
- **Evidencia:** ![Captura BUG-002](<../evidencias/wordcounter/BUG-002 [Desktop] Cada emoji cuenta como 2 caracteres - ED-01.png>)

---

## BUG-003 · [Desktop] Words y Keyword Density cuentan distinto con espacio invisible

- **Título:** Words y Keyword Density cuentan distinto con espacio invisible
- **Ambiente:** https://wordcounter.net/ · Chromium automatizado (Playwright) · Windows 11 · Desktop 1366×900 · idioma en-US · configuración por defecto.
- **Precondiciones:** El editor está vacío. Se necesita un **espacio de no separación** (NBSP, el espacio invisible que aparece al copiar desde páginas web o Word).
- **Pasos de reproducción:**
  1. Abrir https://wordcounter.net/.
  2. Escribir `hola`, luego un espacio de no separación, luego `mundo`, luego un espacio normal, luego `hola`, luego otro espacio de no separación y `mundo`.
     - Forma de escribir el espacio de no separación en Windows: mantener **Alt** y tipear **0160** en el teclado numérico. También sirve copiar el texto desde una página web o desde Word.
  3. Mirar el número de **words** en el panel Details.
  4. Mirar la lista de **Keyword Density**.
- **Resultado actual:** Words muestra **4** (separa bien las palabras). Keyword Density muestra **«hola mundo» ×2** como una sola palabra.
- **Resultado esperado:** Keyword Density muestra **hola ×2** y **mundo ×2**, con la misma regla que usa Words.
- **Severidad:** Media. Dos paneles de la misma pantalla no coinciden.
- **Criticidad:** Baja. Aparece con texto copiado desde web o Word, y la diferencia puede pasar desapercibida.
- **Evidencia:** ![Captura BUG-003](<../evidencias/wordcounter/BUG-003 [Desktop] Words y Keyword Density cuentan distinto con espacio invisible - ED-02.png>)

---

## BUG-004 · [Desktop] Keyword Density omite números, letras sueltas y palabras comunes en inglés

- **Título:** Keyword Density omite números, letras sueltas y palabras comunes en inglés
- **Ambiente:** https://wordcounter.net/ · Chromium automatizado (Playwright) · Windows 11 · Desktop 1366×900 · idioma en-US · configuración por defecto.
- **Precondiciones:** El editor está vacío.
- **Pasos de reproducción:**
  1. Abrir https://wordcounter.net/.
  2. Escribir `123 123 456 hola`. Mirar la lista de Keyword Density.
  3. Borrar todo y escribir `b a c b a c d`. Mirar la lista.
  4. Borrar todo y escribir `the cat and the dog and the bird`. Mirar la lista.
- **Resultado actual:**
  - Paso 2: solo aparece **hola ×1**. No aparece **123**, que se repite 2 veces.
  - Paso 3: la lista de Keyword Density queda **vacía**, aunque **b**, **a** y **c** se repiten 2 veces cada una.
  - Paso 4: aparecen **cat**, **dog** y **bird** con ×1. No aparecen **the** (3 veces) ni **and** (2 veces).
- **Resultado esperado:**
  - Paso 2: **123 ×2**, **456 ×1**, **hola ×1**.
  - Paso 3: **b ×2**, **a ×2**, **c ×2**, **d ×1**.
  - Paso 4: **the ×3**, **and ×2**, luego **cat**, **dog**, **bird** con ×1.
- **Severidad:** **Alta.** La lista responde mal cuál es la palabra más usada, y no avisa que está filtrando.
- **Criticidad:** Media. Es una herramienta gratuita y no mueve dinero, pero el panel es justamente para ver las palabras más usadas (por ejemplo, para revisar un texto de SEO).
- **Evidencia:**
  - Paso 2: ![Captura BUG-004 paso 2](<../evidencias/wordcounter/BUG-004 [Desktop] Keyword Density omite números, letras sueltas y palabras comunes en inglés - ED-03.png>)
  - Paso 3: ![Captura BUG-004 paso 3](<../evidencias/wordcounter/BUG-004 [Desktop] Keyword Density omite números, letras sueltas y palabras comunes en inglés - ED-04.png>)
  - Paso 4: ![Captura BUG-004 paso 4](<../evidencias/wordcounter/BUG-004 [Desktop] Keyword Density omite números, letras sueltas y palabras comunes en inglés - ED-05.png>)

---

## BUG-005 · [Desktop] Parte palabras en guion bajo, barras y direcciones web

- **Título:** Parte palabras en guion bajo, barras y direcciones web
- **Ambiente:** https://wordcounter.net/ · Chromium automatizado (Playwright) · Windows 11 · Desktop 1366×900 · idioma en-US · configuración por defecto.
- **Precondiciones:** El editor está vacío.
- **Pasos de reproducción:**
  1. Abrir https://wordcounter.net/.
  2. Escribir `https://farmatodo.com info@farmatodo.com`. Mirar Words y Keyword Density.
  3. Borrar todo y escribir `hola_mundo hola_mundo`. Mirar Words y Keyword Density.
  4. Borrar todo y escribir `mañana/tarde mañana/tarde`. Mirar Keyword Density.
- **Resultado actual:**
  - Paso 2: Words muestra **3** (deberían ser 2). Keyword Density muestra **farmatodo ×2**, **com ×2** y **https ×1**. No aparecen los dos bloques completos.
  - Paso 3: Words muestra **4** (deberían ser 2). Keyword Density muestra **hola ×2** y **mundo ×2**.
  - Paso 4: Words muestra 2 (correcto). Keyword Density muestra **mañana ×2** y **tarde ×2**.
- **Resultado esperado:**
  - Paso 2: Words **2**. Keyword Density: **https://farmatodo.com ×1** e **info@farmatodo.com ×1**.
  - Paso 3: Words **2**. Keyword Density: **hola_mundo ×2**.
  - Paso 4: Keyword Density: **mañana/tarde ×2**.
- **Severidad:** Media. El total de palabras queda inflado y la lista se llena de pedazos que no existen como palabras.
- **Criticidad:** Baja. Pasa con correos, direcciones y escrituras como «mg/ml» o «y/o», comunes en textos de farmacia.
- **Nota:** `e-mail` y `perro-gato` (guion medio) sí se cuentan como una palabra en ambos paneles, así que el criterio es inconsistente entre símbolos parecidos.
- **Evidencia:**
  - Paso 2: ![Captura BUG-005 paso 2](<../evidencias/wordcounter/BUG-005 [Desktop] Parte palabras en guion bajo, barras y direcciones web - ED-06.png>)
  - Paso 3: ![Captura BUG-005 paso 3](<../evidencias/wordcounter/BUG-005 [Desktop] Parte palabras en guion bajo, barras y direcciones web - ED-07.png>)
  - Paso 4: ![Captura BUG-005 paso 4](<../evidencias/wordcounter/BUG-005 [Desktop] Parte palabras en guion bajo, barras y direcciones web - ED-08.png>)

---

## Observaciones (no son bugs)

Son comportamientos documentados que no contradicen lo que dice el sitio.

| ID | Observación | Escenario |
|---|---|---|
| OB-01 | Cuando dos palabras empatan, el sitio las ordena por orden de aparición, no alfabéticamente. Con `zeta zeta alfa alfa` muestra `zeta` primero. Por eso el top 3 de la suite no exige un orden dentro de un empate. | OB-01 (pasa) |
| OB-02 | Keyword Density muestra como máximo **10** palabras. | OB-02 (pasa) |

Otras oportunidades de mejora que salieron de la exploración manual. No tienen escenario automatizado.

1. **Accesibilidad del editor:** el cuadro de texto no tiene una etiqueta accesible; solo tiene un texto de ayuda (placeholder), que los lectores de pantalla no siempre anuncian. Los contadores sí están en regiones que se anuncian (aria-live).
2. **Consola del navegador:** aparece `Permissions policy violation: unload is not allowed in this document`. No afecta a la persona usuaria, pero es código que dejará de funcionar en versiones futuras de Chrome.
3. **Publicidad superpuesta:** en desktop, un aviso flotante tapa parte del texto explicativo y del panel Keyword Density (visible en la captura de BUG-005).
4. **Números con separador:** `1,000 3.14 hola` cuenta 3 palabras, pero Keyword Density solo lista `hola`. Es el mismo origen que BUG-004.

## Lo que funciona bien

Los 19 escenarios de núcleo pasan: el texto de ejemplo del enunciado da `14 words 99 characters` con `farmatodo` 6 (43 %), `cuida` 3 (21 %), `tu` 2 y `salud` 2. También funcionan bien las mayúsculas, la puntuación, los espacios repetidos, los saltos de línea, las tildes y la ñ, los guiones internos, el texto de 20.000 palabras, pegar con Ctrl+V, el botón CLEAR y la coincidencia de totales en los tres lugares donde se muestran.

## Resultado de la última ejecución

- Suite completa: **30 escenarios · 21 pasaron · 9 fallaron**.
- Los 9 que fallan son exactamente los bugs `ED-01` a `ED-09`. **Ningún escenario de núcleo falla.**
- Reporte para el equipo: [`resultados-referencia/wordcounter/resumen.html`](../resultados-referencia/wordcounter/resumen.html).
