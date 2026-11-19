# Resumen ejecutivo

Para quien no es técnico (producto, UX, áreas funcionales). Cada punto remite al documento con el detalle y los pasos para reproducir cada bug.

## En 30 segundos

- **wordcounter.net funciona bien en lo básico**: en los 19 casos principales cuenta bien palabras y caracteres, incluido el texto de ejemplo de la prueba (14 palabras, 99 caracteres).
- **Tiene 5 bugs.** El más serio (severidad alta) es que la lista de «palabras más usadas» esconde sin avisar números, letras sueltas y palabras comunes en inglés.
- **farmatodo.com.ar tiene 3 bugs de UX.** El más serio (severidad y criticidad altas) es que **el mismo producto muestra dos precios distintos** según cómo se llegue a la búsqueda. Además, en celular el botón + tapa el nombre del producto, y el carrito dice «1 productos».
- **El programa del punto 4 funciona y está probado** (desarrollado con ayuda de IA; ver la sección de transparencia): 37 de 37 pruebas pasan, incluso con un millón de palabras en menos de 3 segundos.

## Cómo leer los bugs

Cada bug tiene: título, ambiente, precondiciones, pasos para reproducirlo, resultado actual, resultado esperado, **severidad** (qué tan grave es) y **criticidad** (qué tan urgente es corregirlo), y una captura de pantalla.

- **Severidad:** Alta = resultado incorrecto en la función principal. Media = incorrecto, pero se puede seguir usando. Baja = detalle visual o de ortografía.
- **Criticidad:** Alta = corregir antes de la próxima versión. Media = planificar. Baja = cuando haya tiempo.

## Punto 1 · Pruebas automáticas de wordcounter.net

| Escenarios ejecutados | Pasaron | Fallaron |
|---|---|---|
| 30 | 21 | 9 |

- Los **19 escenarios principales pasan todos**: texto de la prueba, mayúsculas, puntuación, espacios, tildes, ñ, texto largo, pegar con Ctrl+V, botón CLEAR.
- Los **9 que fallan son los bugs del punto 2**. Se dejaron fallando a propósito para que cada uno quede documentado y se pueda volver a verificar cuando el sitio cambie.
- Detalle y capturas: [`resultados-referencia/wordcounter/resumen.html`](../resultados-referencia/wordcounter/resumen.html).

## Punto 2 · Bugs de wordcounter.net

| ID | En simple | Severidad | Criticidad |
|---|---|---|---|
| BUG-004 | La lista de palabras más usadas **esconde** números, letras sueltas y palabras como «the» y «and». Si un texto repite «the» tres veces, el sitio dice que las más usadas son otras. | **Alta** | Media |
| BUG-001 | El botón dice «AUTO-SAVE OFF» (apagado), pero igual guarda el texto y lo devuelve al recargar. En una computadora compartida es un problema de privacidad. | Media | Media |
| BUG-003 | Dos paneles de la misma pantalla cuentan palabras de forma distinta cuando el texto viene de Word o de una web (espacio invisible). | Media | Baja |
| BUG-005 | Direcciones web, nombres con guion bajo y «mañana/tarde» se parten en pedazos, y el total de palabras sube. | Media | Baja |
| BUG-002 | Cada emoji cuenta como 2 caracteres, y para una persona es 1. | Baja | Baja |

Detalle con pasos para reproducir: [`02-reporte-fallas-wordcounter.md`](02-reporte-fallas-wordcounter.md).

## Punto 3 · Bugs de UX en farmatodo.com.ar

| ID | En simple | Vista | Severidad | Criticidad |
|---|---|---|---|---|
| BUG-006 | **Dos precios para el mismo producto.** Buscando `shampoo` desde el buscador, Aveno Infantil cuesta $24.923 con 25 % de descuento. Abriendo la misma búsqueda desde un enlace directo, cuesta $33.230 sin descuento. | Desktop y Mobile | **Alta** | **Alta** |
| BUG-007 | El botón + tapa el nombre del producto. | Mobile | Media | Media |
| BUG-008 | «Carrito (1 productos)»: error de concordancia. | Desktop y Mobile | Baja | Baja |

Detalle, pasos y capturas: [`03-reporte-ux-farmatodo.md`](03-reporte-ux-farmatodo.md). Hay además observaciones que todavía no son bugs confirmados.

## Punto 4 · Programa de histograma de palabras (desarrollado con IA)

**Transparencia:** el código de este programa lo escribió un asistente de IA (Cursor); yo no lo desarrollé. Lo que sí es mío es el criterio: cómo debe funcionar, qué casos probar y la revisión del resultado. Qué hace cada parte, con qué tecnologías, y quién hizo qué, está en [`04-contador-frecuencia-palabras.md`](04-contador-frecuencia-palabras.md).


- Lee un archivo de texto y muestra cantidad de palabras, de caracteres y cuántas veces aparece cada palabra, de más a menos repetida y en orden alfabético cuando empatan.
- Con el texto del enunciado (`farmatodo cuida tu salud…`) da exactamente 14 palabras y 99 caracteres, y está cubierto por pruebas automáticas. El archivo de ejemplo del repositorio es otro texto y se puede cambiar.
- **Hay una página web local para probarlo sin usar la terminal:** `visor/contador-palabras.html`. Se abre con doble clic, no necesita internet, y muestra palabras, caracteres, cuántas veces y qué porcentaje representa cada palabra, con los empates ordenados alfabéticamente. Usa exactamente el mismo código del programa de consola y tiene 19 pruebas propias (19 de 19 pasan).
- **Rapidez:** un millón de palabras en menos de 3 segundos. **Memoria:** crece con la cantidad de palabras *distintas*, no con el tamaño del archivo.
- Detalle y explicación de complejidad: [`04-contador-frecuencia-palabras.md`](04-contador-frecuencia-palabras.md).

## Qué se supuso (y se pregunta en el correo)

1. Una «palabra» es lo que está entre espacios; `hola_mundo` y `info@farmatodo.com` son una palabra cada una.
2. Un emoji es **1** carácter.
3. Se mide con la configuración por defecto de wordcounter.net, sin cambiar nada del sitio.
4. Para Farmatodo se eligió la versión de **Argentina**.

## Qué sigue

- Confirmar con producto si el descuento de BUG-006 es intencional (promoción por primera compra o por canal). Si lo es, debe explicarse; si no, es un error.
- Validar BUG-007 en un celular real.
- Decidir si las observaciones OBS-01 y OBS-02 de Farmatodo pasan a bug.
- Si el equipo de WordCounter confirma otra definición de «palabra», actualizar los valores esperados de los escenarios `ED-xx` en `data/scenarios.ts`.
