# Punto 3 · Bugs de UX en farmatodo.com.ar

Cada bug tiene su ficha completa para reproducirlo sin ayuda. Las capturas de evidencia llevan el mismo nombre del bug.

## Datos generales

- **Sitio:** https://www.farmatodo.com.ar/ (se eligió Argentina entre las opciones del enunciado).
- **Fecha de la verificación:** 19/11/2026. Los precios y promociones pueden cambiar.
- **Vistas probadas:** Desktop 1440×900, Tablet 820×1180 y Mobile 390×844 (emulado con un iPhone en Chromium; no se probó en un teléfono físico).
- **Herramienta:** Chromium automatizado con Playwright, idioma `es-AR`, zona horaria de Buenos Aires.
- **No se probó:** pago, inicio de sesión y selector de ciudad. El selector no se pudo abrir con automatización: una capa de la página intercepta el clic.

## Resumen de bugs

| ID | Título | Plataforma | Severidad | Criticidad |
|---|---|---|---|---|
| BUG-006 | El precio cambia según cómo se llega a la búsqueda | Desktop y Mobile | **Alta** | **Alta** |
| BUG-007 | El botón + tapa el nombre del producto | Mobile | Media | Media |
| BUG-008 | El carrito dice «1 productos» | Desktop y Mobile | Baja | Baja |

Los bugs están ordenados por impacto. Las observaciones que no llegaron a bug están al final.

### Qué significan Severidad y Criticidad

- **Severidad** = qué tan grave es el defecto en sí.
- **Criticidad** = qué tan urgente es corregirlo para el negocio.

Definiciones completas en [`docs/02-reporte-fallas-wordcounter.md`](02-reporte-fallas-wordcounter.md#qué-significan-severidad-y-criticidad).

---

## BUG-006 · [Desktop y Mobile] El precio cambia según cómo se llega a la búsqueda

- **Título:** El precio cambia según cómo se llega a la búsqueda
- **Ambiente:** https://www.farmatodo.com.ar/ · Chromium automatizado (Playwright) · Windows 11 · idioma es-AR, zona America/Argentina/Buenos_Aires · Desktop 1440×900, Tablet 820×1180 y Mobile 390×844 (emulado iPhone). Sin sesión iniciada y sin ciudad elegida.
- **Precondiciones:**
  - Ventana de incógnito o navegador sin cookies del sitio.
  - Sin sesión iniciada.
  - Producto disponible con su promoción: «Shampoo Aveno Infantil Frasco x 250 ml».
- **Pasos de reproducción:**
  1. Abrir una ventana de incógnito nueva y entrar a https://www.farmatodo.com.ar/. Esperar unos 5 segundos.
  2. Hacer clic en el buscador de arriba, escribir `shampoo` y presionar **Enter**.
  3. Esperar la grilla de resultados. Ubicar **«Shampoo Aveno Infantil Frasco x 250 ml»** y anotar el precio y la etiqueta de descuento.
  4. Cerrar esa ventana de incógnito.
  5. Abrir una ventana de incógnito nueva y pegar directamente esta dirección: `https://www.farmatodo.com.ar/buscar?product=shampoo&departamento=Todos&filtros=`
  6. Ubicar el mismo producto y anotar el precio y la etiqueta.
  7. Comparar los dos resultados.
- **Resultado actual:**
  - Paso 3: **$24.923**, tachado **$33.230**, con la etiqueta «25 % ¡EXCLUSIVO WEB Y APP FARMATODO!».
  - Paso 6: **$33.230**, sin etiqueta de descuento.
  - Es el mismo producto y la misma búsqueda, con dos precios distintos.
- **Resultado esperado:** El mismo precio y la misma promoción sin importar el camino. Si la promoción depende del canal o de la primera compra, debe decirse de forma explícita en el producto.
- **Severidad:** **Alta.** El precio mostrado cambia para la misma búsqueda, y la persona no puede saber cuál es el real.
- **Criticidad:** **Alta.** Es una compra: afecta la confianza y las ventas. Conviene confirmarlo con producto antes de la próxima versión.
- **Notas para reproducirlo:**
  - Desktop: se reprodujo 3 de 3 veces en cada camino (`exploracion/salida-farmatodo-12.txt`). Recargar con F5 en el camino del buscador mantiene el descuento (`exploracion/salida-farmatodo-13.txt`).
  - Tablet y mobile: se verificó con una corrida en cada camino (`exploracion/salida-farmatodo-14-precio-desktop-mobile-tablet.txt`). En las tres vistas el resultado fue el mismo.
  - Si no se reproduce con estos pasos, revisar: cookies o sesión previa (la prueba usa navegador limpio), la ciudad elegida (la prueba no elige ciudad) y el momento (las promociones cambian).
  - La causa no está identificada. Puede ser una promoción atada a la sesión o a la primera búsqueda, o que los precios se pidan a otro servicio según el camino.
- **Evidencia:**
  - Desktop, camino del buscador: ![Captura BUG-006 desktop buscador](<../evidencias/farmatodo/BUG-006 [Desktop y Mobile] El precio cambia según cómo se llega a la búsqueda - buscador.png>)
  - Desktop, URL directa: ![Captura BUG-006 desktop URL directa](<../evidencias/farmatodo/BUG-006 [Desktop y Mobile] El precio cambia según cómo se llega a la búsqueda - URL directa.png>)
  - Mobile, camino del buscador: ![Captura BUG-006 mobile buscador](<../evidencias/farmatodo/BUG-006 [Mobile] El precio cambia según cómo se llega a la búsqueda - buscador.png>)
  - Mobile, URL directa: ![Captura BUG-006 mobile URL directa](<../evidencias/farmatodo/BUG-006 [Mobile] El precio cambia según cómo se llega a la búsqueda - URL directa.png>)

---

## BUG-007 · [Mobile] El botón + tapa el nombre del producto

- **Título:** El botón + tapa el nombre del producto
- **Ambiente:** https://www.farmatodo.com.ar/ · Chromium con emulación de iPhone (Safari) · 390×844 · Windows 11 · idioma es-AR. No verificado en un teléfono físico.
- **Precondiciones:** Ninguna. Basta con abrir la búsqueda de shampoo.
- **Pasos de reproducción:**
  1. Abrir el sitio en un celular, o en un navegador en modo celular de 390 px de ancho.
  2. Entrar a https://www.farmatodo.com.ar/buscar?product=shampoo&departamento=Todos&filtros=
  3. Mirar el primer producto, «Tratamiento Capilar Dove Óleo Bond Intense Repair Frasco x 110 ml».
  4. Mirar el segundo producto, «Shampoo Aveno Infantil Frasco x 250 ml».
- **Resultado actual:** El botón azul **+** cubre el final de la primera línea del nombre. En Aveno Infantil queda tapada parte de la palabra «Frasco».
- **Resultado esperado:** El nombre del producto se lee completo, y el botón no se superpone al texto.
- **Severidad:** Media. El nombre queda parcialmente tapado, y el usuario puede agregar el producto sin ver el nombre completo.
- **Criticidad:** Media. En una farmacia, la presentación y la dosis son datos clave para elegir el producto correcto. Confirmar en un teléfono físico antes de corregir.
- **Evidencia:**
  - Vista general: ![Captura BUG-007 vista general](<../evidencias/farmatodo/BUG-007 [Mobile] El botón + tapa el nombre del producto - vista general.png>)
  - Zoom en Aveno Infantil: ![Captura BUG-007 zoom](<../evidencias/farmatodo/BUG-007 [Mobile] El botón + tapa el nombre del producto - zoom.png>)

---

## BUG-008 · [Desktop y Mobile] El carrito dice «1 productos»

- **Título:** El carrito dice «1 productos»
- **Ambiente:** https://www.farmatodo.com.ar/ · Chromium automatizado (Playwright) · Windows 11 · idioma es-AR · Desktop 1440×900 y Mobile 390×844 (emulado iPhone).
- **Precondiciones:** El carrito está vacío al empezar.
- **Pasos de reproducción:**
  1. Entrar a https://www.farmatodo.com.ar/buscar?product=shampoo&departamento=Todos&filtros=
  2. Presionar el botón **+** de cualquier producto (queda 1 unidad en el carrito).
  3. Entrar al carrito: https://www.farmatodo.com.ar/carrito
  4. Mirar el título **«Carrito (1 productos)»** y el recuadro de envío **«1 productos»**.
  5. Repetir en mobile.
- **Resultado actual:** Dice **«(1 productos)»** y **«1 productos»**, tanto en desktop como en mobile.
- **Resultado esperado:** **«(1 producto)»** y **«1 producto»**. Con 2 o más, **«2 productos»**.
- **Severidad:** Baja. Es un error de concordancia en singular; no impide comprar.
- **Criticidad:** Baja. Es fácil de corregir, pero aparece en cada compra de una unidad, justo antes de pagar, y afecta la percepción de cuidado del sitio.
- **Evidencia:**
  - Desktop: ![Captura BUG-008 desktop](<../evidencias/farmatodo/BUG-008 [Desktop y Mobile] El carrito dice 1 productos - desktop.png>)
  - Mobile: ![Captura BUG-008 mobile](<../evidencias/farmatodo/BUG-008 [Desktop y Mobile] El carrito dice 1 productos - mobile.png>)

---

## Observaciones (todavía no son bugs confirmados)

Estas se anotaron durante la exploración. No forman parte de los 3 bugs entregados. Cada una dice qué le falta para ser bug confirmado.

| ID | Observación | Plataforma | Evidencia | Por qué no es bug todavía |
|---|---|---|---|---|
| OBS-01 | La etiqueta «¡EXCLUSIVO WEB Y APP FARMATO…» se corta en la tarjeta del producto. | Desktop | ![OBS-01](<../evidencias/farmatodo/OBS-01 [Desktop] Etiqueta de promo cortada en la tarjeta.png>) | Es un defecto visual claro. No entra en los 3 bugs entregados. Para confirmarlo como bug hace falta revisarlo en un celular o tablet real. |
| OBS-02 | En tablet (820 px) la grilla de resultados se ve como la de celular, estirada, con mucho espacio en blanco y el botón + lejos del producto. | Tablet | ![OBS-02 tablet](<../evidencias/farmatodo/OBS-02 [Tablet] Diseño de celular estirado en 820 px.png>) · referencia: ![OBS-02 desktop](<../evidencias/farmatodo/OBS-02 [Desktop] Referencia para comparar con tablet.png>) | Es una impresión visual. Para confirmarlo como bug hace falta medir el diseño en tablet real. |
| OBS-03 | Al presionar + en la grilla de desktop, el botón se convierte en una burbuja con «1». No se pudo confirmar si responde a los clics. | Desktop | ![OBS-03](<../evidencias/farmatodo/OBS-03 [Desktop] Botón 1 de la grilla, sin respuesta confirmada.png>) | El recorrido automático no es confiable en este punto. Validar a mano. |
| OBS-04 | Durante la exploración, la consola del navegador mostró bloqueos CORS hacia un servicio de ubicación y hacia un servicio de clientes. | Todas | Sin captura | Puede ser normal en un entorno automatizado. Se anota para el equipo de desarrollo. |

## Limitaciones

- Las pruebas se hicieron sin sesión iniciada y sin ciudad elegida. El precio y la promoción pueden variar según la ubicación del cliente.
- Mobile se emuló en Chromium; no se probó en un teléfono real. Conviene confirmar BUG-007 en un dispositivo físico.
- El precio de BUG-006 se verificó en Argentina con la fecha 19/11/2026.
