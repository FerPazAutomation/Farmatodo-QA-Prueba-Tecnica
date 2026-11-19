# Punto 4 · Contador de frecuencia de palabras

Programa (TypeScript / Node.js, sin librerías externas de conteo) que lee un archivo `.txt`, cuenta palabras y caracteres e imprime un histograma de frecuencias.

## Transparencia: cómo se desarrolló este punto

**El código de este punto fue desarrollado con una herramienta de inteligencia artificial, no lo escribí yo.** Un algoritmo de este tipo (lectura por flujo, `Intl.Segmenter`, normalización Unicode, ordenamiento con `Intl.Collator`) va más allá de lo que hago en mi trabajo diario como QA, y prefiero decirlo de forma directa en vez de presentarlo como propio.

| | Qué hizo la IA | Qué hice yo |
|---|---|---|
| **Herramienta** | Asistente de IA integrado en el editor **Cursor**, trabajando sobre este repositorio. | Dirigí el trabajo, revisé el resultado y pedí los cambios. |
| **Algoritmo** | Escribió `src/word-frequency/` (`core.ts`, `analyzer.ts`, `histogram.ts`, `cli.ts`), la página web local (`visor/`) y los **comentarios en español** que explican cada parte. | Definí **cómo quería que funcionara**: qué es una palabra y un carácter, cómo se tratan mayúsculas, puntuación, tildes y emoji, y el orden del resultado (ver la tabla «Qué se entiende por palabra y por carácter», más abajo). |
| **Pruebas** | Escribió el código de las 37 pruebas (`unit/`). | Definí **qué había que probar** (los casos de la tabla de «Cómo se probó»), las ejecuté y revisé el resultado. |
| **Ejemplo** | — | Cambié el texto de `samples/ejemplo-farmatodo.txt` (el enunciado no obliga a usar un ejemplo concreto) y comprobé que el resultado es el esperado. |
| **Documentación** | Redactó este documento a partir de mis criterios. | Revisé el contenido y pedí correcciones. |

**Qué sí es mío:** el criterio de prueba, las reglas de negocio del conteo, la revisión y la validación del resultado. **Qué no es mío:** la escritura del código del algoritmo.

### Tecnologías usadas

| Tecnología | Para qué se usa |
|---|---|
| **TypeScript** | Lenguaje del código (con tipos, para detectar errores antes de ejecutar). |
| **Node.js** (20 o superior) | Entorno donde corre el programa. |
| **`tsx`** | Ejecuta TypeScript directamente, sin compilar a mano. |
| **`readline` y `fs` (Node)** | Leer el archivo línea por línea, sin cargarlo entero en memoria. |
| **`Map` (JavaScript)** | Tabla `palabra → cantidad` para contar. |
| **`Intl.Segmenter`** | Contar «lo que una persona ve como un carácter» (emoji, letras con tilde combinada). |
| **`Intl.Collator("es")`** | Orden alfabético en español para desempatar. |
| **Normalización Unicode NFC** | Que `canción` con la tilde suelta o integrada sea la misma palabra. |
| **Playwright Test** | Ejecutar las 37 pruebas del algoritmo (sin abrir navegador), las 19 de la página web local (con Chromium, sin internet) y generar los reportes. |
| **esbuild** | Empaquetar el algoritmo (`core.ts`) en un bloque de JavaScript para meterlo dentro del HTML de la página web local. |
| **HTML + CSS + JavaScript simples** | La página web local (`visor/contador-palabras.html`): un solo archivo, sin librerías ni internet. |
| **Cursor + asistente de IA** | Herramienta con la que se desarrolló el código. |

### Qué hace cada parte del código

| Archivo / función | Qué hace |
|---|---|
| `cli.ts` → `main()` | Lee el argumento (la ruta del archivo y la opción `--bars`), llama al algoritmo y muestra el resultado. Si el archivo no existe, muestra un mensaje claro y termina con código 1. |
| `analyzer.ts` → `analyzeFile(path)` | Abre el archivo como flujo y lo lee línea por línea (es lo único del algoritmo que usa Node). |
| `core.ts` → `analyzeLines(lines)` | Recorre las líneas, descarta la marca invisible BOM del inicio, suma caracteres y palabras, y arma el mapa de frecuencias. |
| `core.ts` → `countCharacters(line)` | Cuenta los caracteres de una línea. Si es solo ASCII, usa el largo directamente; si no, usa `Intl.Segmenter` para contar cada emoji o letra acentuada como uno. |
| `core.ts` → `tokenize(line)` | Separa la línea en palabras: corta por espacios, descarta bloques sin letras/números/emoji, normaliza (NFC), quita la puntuación de los bordes y pasa a minúsculas. |
| `core.ts` → `sortFrequencies(counts)` | Ordena una sola vez: mayor cantidad primero y, si empatan, alfabético en español. |
| `core.ts` → `analyzeText(text)` | Igual que `analyzeFile`, pero con un texto en memoria (lo usan las pruebas y la página web local). |
| `visor/plantilla.html` | La página web: cuadro de texto, carga de archivo, tarjetas de totales y tabla con puesto, veces, porcentaje y barra. Usa el algoritmo de `core.ts`. |
| `scripts/construir-visor.ts` | Arma `visor/contador-palabras.html`: empaqueta `core.ts` + `histogram.ts` con esbuild y los inserta en la plantilla. |
| `histogram.ts` → `formatReport(result, opciones)` | Da formato a la salida: «N words», «N characters» y una línea por palabra, con barras si se pidió `--bars`. |

## Cómo usarlo

```powershell
npm install
npm run frecuencia -- samples/ejemplo-farmatodo.txt          # salida de texto
npm run frecuencia -- samples/ejemplo-farmatodo.txt --bars   # con barras visuales
npm run frecuencia -- mi-archivo.txt                         # con otro archivo
```

Requiere Node.js 20 o superior (probado con Node 26). El código está en `src/word-frequency/`:

| Archivo | Responsabilidad |
|---|---|
| `core.ts` | El algoritmo: tokeniza, cuenta y ordena. No usa nada de Node, por eso también corre en el navegador |
| `analyzer.ts` | Lee el archivo del disco como flujo y usa `core.ts` |
| `histogram.ts` | Da formato a la salida (texto y barras) |
| `cli.ts` | Línea de comandos: argumentos y mensajes de error |

## Página web local (sin internet)

Además del programa de consola, hay una página para quien abra el proyecto y no quiera usar la terminal: **`visor/contador-palabras.html`**. Es **un solo archivo**: se abre con doble clic (o con `npm run visor`), sin servidor y sin conexión a internet.

**Qué hace**
- Se escribe o pega un texto, o se carga un archivo `.txt` (botón «Cargar archivo .txt»). También hay «Usar ejemplo» y «Limpiar».
- Muestra **palabras, caracteres y palabras distintas**.
- Muestra una tabla con **puesto, palabra, veces, porcentaje y una barra**. El porcentaje es *veces ÷ total de palabras* (contando repeticiones), con un decimal: por ejemplo `42,9 %`.
- **Empates:** las palabras con la misma cantidad **comparten puesto** (1, 2, 3, 3, 5…) y salen en orden alfabético del español. La página lo explica al pie de la tabla.
- Se puede elegir ver las 10, 25, 50 o todas las palabras. Si hay más de 2.000 palabras distintas, se dibujan las primeras 2.000 y se avisa.
- Un desplegable muestra la **salida de texto idéntica a la de `npm run frecuencia`**.
- Lo que se escribe se procesa en el navegador y no se envía a ningún lado. El texto se muestra como texto: no se interpreta como HTML.

**Cómo se garantiza que hace lo mismo que el programa de consola.** No hay dos versiones del algoritmo. La página trae empaquetado el **mismo archivo `src/word-frequency/core.ts`** que usa el programa de consola; `scripts/construir-visor.ts` lo mete dentro del HTML con esbuild. Si se cambia una regla en `core.ts`, se regenera la página con `npm run visor:construir` y cambian las dos a la vez. Además, la prueba VI-12 falla si el HTML guardado no coincide con lo que se genera con el código actual.

| Comando | Qué hace |
|---|---|
| `npm run visor` | Genera la página y la abre en el navegador |
| `npm run visor:construir` | Solo genera `visor/contador-palabras.html` |
| `npm run test:visor` | Ejecuta las 19 pruebas de la página (abre Chromium, sin internet) |

Para usarla sin instalar nada, basta abrir `visor/contador-palabras.html` con un navegador moderno. Se probó en Chromium (el motor de Chrome y Edge); en otros navegadores no se probó.

## Ejemplo exacto del enunciado

El enunciado de la prueba da este texto de entrada:

```
farmatodo farmatodo farmatodo farmatodo farmatodo cuida cuida tu salud
farmatodo cuida toda tu salud
```

Y pide esta salida. El algoritmo la produce idéntica (se comprueba en las pruebas automáticas):

```
14 words
99 characters
farmatodo: 6
cuida: 3
salud: 2
tu: 2
toda: 1
```

Cómo salen esos números: son 14 palabras en total; los 99 caracteres cuentan los espacios y no cuentan el salto de línea; `salud` y `tu` empatan en 2 y van en orden alfabético.

## Salida real con otro archivo de ejemplo

El enunciado no obliga a usar un texto concreto, así que el ejemplo se puede cambiar: el contenido está en `samples/ejemplo-farmatodo.txt`. Si se edita ese archivo, el resultado cambia y esta sección queda desactualizada (las 37 pruebas no dependen de este archivo, usan sus propios textos).

Contenido actual del archivo:

```
Jugamos al futbol cuando queremos, por eso el futbol es algo que elegimos para mejorar en el deporte
El deporte es algo que podemos realizar a diario, el futbol nos permite compartir
El futbol es uno de los deportes mas realizados en el mundo. Cuando jugamos compartimos entre amigos, no solo lo vemos como deporte
```

Resultado de `npm run frecuencia -- samples/ejemplo-farmatodo.txt`:

```
55 words
312 characters
el: 6
futbol: 4
deporte: 3
es: 3
algo: 2
cuando: 2
en: 2
jugamos: 2
que: 2
a: 1
al: 1
amigos: 1
como: 1
compartimos: 1
compartir: 1
de: 1
deportes: 1
diario: 1
elegimos: 1
entre: 1
eso: 1
lo: 1
los: 1
mas: 1
mejorar: 1
mundo: 1
no: 1
nos: 1
para: 1
permite: 1
podemos: 1
por: 1
queremos: 1
realizados: 1
realizar: 1
solo: 1
uno: 1
vemos: 1
```

Cómo leer el resultado:

- **55 words:** total de palabras del archivo (con repeticiones).
- **312 characters:** caracteres con espacios y sin saltos de línea.
- Cada línea siguiente es una palabra distinta y cuántas veces aparece. Orden: de más a menos repetida; si empatan, alfabético (`algo`, `cuando`, `en`, `jugamos`, `que` tienen 2 y salen en ese orden).
- `Cuando` y `cuando` cuentan como la misma palabra, y `queremos,` (con coma) es `queremos`.

Con `--bars`, cada línea agrega una barra proporcional a la cantidad:

```
el: 6 ██████████████████████████████
futbol: 4 ████████████████████
deporte: 3 ███████████████
es: 3 ███████████████
algo: 2 ██████████
...
```

Si el archivo no existe: `No encontré el archivo: nada.txt` y el programa termina con código de salida 1.

## Qué se entiende por «palabra» y por «carácter»

El enunciado no los define con detalle, por lo tanto se documentan las decisiones (también están en el correo de consultas).

| Concepto | Regla | Ejemplo |
|---|---|---|
| **Palabra** | Bloque de texto entre espacios o saltos de línea que tenga al menos una letra, un número o un emoji | `hola_mundo`, `e-mail` y `info@farmatodo.com` cuentan como **una** palabra |
| **Palabra repetida** | Se comparan sin distinguir mayúsculas; se ignora la puntuación en los **bordes** | `Hola,`, `hola.` y `HOLA` son `hola` |
| **Puntuación interna** | Se conserva | `don't`, `perro-gato` |
| **Carácter** | Lo que una persona ve como un símbolo, **con espacios** y **sin saltos de línea** | `hola 😀` tiene 6 caracteres |
| **Solo símbolos** | No es palabra | `!!!`, `---` no suman |
| **Orden** | Frecuencia descendente; si empatan, orden alfabético según el español | `salud` antes que `tu` |
| **Tilde** | `canción` escrita con la tilde suelta o integrada es la misma palabra | normalización NFC |
| **BOM** | La marca invisible que algunos editores ponen al inicio del archivo UTF-8 no es texto | se ignora |
| **Saltos de línea** | `\n`, `\r\n` y `\r` son equivalentes | |

**Decisión sobre emoji:** un emoji suelto cuenta como una palabra y como un carácter. Un texto como `😀 😀` produce `😀: 2`.

## Cómo funciona (paso a paso)

1. Se abre el archivo como **flujo (stream)** y se lee **línea por línea**. El archivo completo nunca está en memoria.
2. De cada línea se hacen dos cosas:
   - **Caracteres:** se cuentan los símbolos visibles. Si la línea es solo ASCII, el largo de la línea ya es la respuesta (camino rápido). Si no, se usa `Intl.Segmenter`, que entiende emoji y letras con acento combinado.
   - **Palabras:** se separa por espacios, se descartan los bloques sin letras/números/emoji, se normaliza (NFC), se quita la puntuación de los bordes y se pasa a minúsculas.
3. Cada palabra se suma en un mapa `palabra → cantidad` (`Map`), que permite sumar en tiempo constante.
4. Al terminar el archivo, las entradas del mapa se **ordenan** una sola vez: mayor cantidad primero; si hay empate, se desempata con `Intl.Collator("es")` (alfabético en español).
5. Se imprime: palabras, caracteres y el histograma.

## Complejidad

Sea **n** la cantidad de caracteres del archivo y **k** la cantidad de palabras **distintas**.

| Recurso | Costo | Por qué |
|---|---|---|
| **Tiempo** | **O(n + k log k)** | Recorrer, separar y contar cada carácter una vez es O(n) (sumar en el mapa es O(1) promedio). Ordenar los k distintos es O(k log k). |
| **Espacio** | **O(k)** | Solo se guarda el mapa de palabras distintas, más la línea que se está procesando. |

En palabras simples: el tiempo crece en línea recta con el tamaño del archivo; la memoria crece con la cantidad de palabras **distintas**, no con el tamaño total. Un archivo de 2 GB con vocabulario normal (decenas de miles de palabras distintas) entra sin problema.

**Peor caso:** si casi todas las palabras son distintas, k es proporcional a n y el ordenamiento domina: O(n log n) en tiempo y O(n) en memoria.

**Alternativas consideradas**

- *Ordenar todas las palabras y contar consecutivas:* O(n log n) en tiempo y O(n) en memoria. Peor en ambos.
- *Estructura de árbol (trie):* mismo costo asintótico para contar, más complejo, sin ventaja real aquí.
- *Heap para quedarse solo con las N más frecuentes:* mejora a O(n + k log N), pero el enunciado pide el histograma **completo**, por eso no se usa.

## Cómo se probó

37 pruebas automáticas sin navegador (`npm run test:algoritmo`). **Resultado: 37 de 37 pasan** (verificado de nuevo el 19/11/2026 con el ejemplo actual). Reporte: [`resultados-referencia/algoritmo/resumen.html`](../resultados-referencia/algoritmo/resumen.html).

| Grupo | Pruebas | Qué verifican |
|---|---|---|
| AL-01 a AL-07 | Texto de ejemplo del enunciado original, empate alfabético, orden, mayúsculas, puntuación, tildes y ñ, espacios y saltos de línea (`\n` y `\r\n`) | Reglas del enunciado |
| AL-08 a AL-10, AL-16, AL-17 | Emoji, archivo vacío, solo símbolos, emoji agrupado, tilde en dos formas | Casos borde |
| AL-11 | Singular («1 word», «1 character») | Formato de salida |
| AL-12, AL-13 | Archivo real con BOM y sin salto final; archivo inexistente | Lectura de disco y errores |
| AL-14 | Opción `--bars` | Histograma visual |
| AL-15 | **1.000.000 de palabras en menos de 3 segundos** | Rendimiento |
| XV-SC-01 a XV-SC-12 y XV-ED-01 a XV-ED-08 (20 pruebas) | **Verificación cruzada:** los valores esperados de la suite de wordcounter.net se recalculan con este algoritmo | Que los valores esperados sean coherentes con una definición única |

Las pruebas usan sus propios textos (incluido el ejemplo del enunciado original: `farmatodo farmatodo ... cuida ... tu salud`, que da 14 palabras y 99 caracteres), por eso cambiar `samples/ejemplo-farmatodo.txt` no las afecta. **Página web local: 19 pruebas más** (`npm run test:visor`, **19 de 19 pasan**). Abren `visor/contador-palabras.html` en Chromium, escriben o cargan textos y comprueban totales, puesto, veces, porcentaje, orden en los empates (con ñ y tildes), emoji, archivos con BOM y CRLF, la salida de texto (idéntica a la de consola), el límite de filas, los botones, que no se pida nada a internet, que el texto no se interprete como HTML y que el HTML guardado esté actualizado. Parte de los valores esperados están escritos a mano (VI-01, VI-03, VI-04 y VI-13) y no salen del algoritmo; el resto se compara con el algoritmo real. Para comprobar que las pruebas detectan errores, se rompió a propósito el desempate alfabético y el formato del porcentaje: las pruebas fallaron, y después se revirtió. Reporte: [`resultados-referencia/visor/resumen.html`](../resultados-referencia/visor/resumen.html).

También hay una prueba de la suite web (`SC-18`) que compara este algoritmo con lo que muestra wordcounter.net en un párrafo real y coinciden.

## Limitaciones conocidas

- Idiomas sin espacios (japonés, chino): cada bloque entre espacios es una «palabra». Es coherente con la definición del enunciado.
- Para el desempate se usa la configuración regional `es`. Con otro idioma el orden de símbolos puede variar.
- Un texto con una sola línea gigante (varios GB sin saltos de línea) se carga entero en memoria, porque se lee por líneas.
- No se leen archivos que no sean UTF-8 (por ejemplo UTF-16).
