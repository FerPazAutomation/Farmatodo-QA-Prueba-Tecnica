# Suite automatizada de wordcounter.net

_Prueba técnica Farmatodo · Punto 1_

Ejecución: 19/11/2026, 05:18:39 · Duración: 199.9 s

## Resumen

| Escenarios ejecutados | Pasaron | Fallaron | Omitidos |
|---|---|---|---|
| **30** | **21** | **9** | 0 |

| Tipo de escenario | Total | Pasaron | Fallaron |
|---|---|---|---|
| Núcleo (requisito de la prueba) | 19 | 19 | 0 |
| Observación (comportamiento documentado) | 2 | 2 | 0 |
| Hallazgo a validar (el sitio se desvía de lo esperado) | 9 | 0 | 9 |

## Todos los escenarios

| ID | Escenario | Tipo | Resultado |
|---|---|---|---|
| ED-01 | Un emoji cuenta como 1 carácter | Hallazgo a validar (el sitio se desvía de lo esperado) | ❌ Falló |
| ED-02 | Palabras unidas por espacio de no separación (NBSP) | Hallazgo a validar (el sitio se desvía de lo esperado) | ❌ Falló |
| ED-03 | Los números también son palabras repetidas | Hallazgo a validar (el sitio se desvía de lo esperado) | ❌ Falló |
| ED-04 | Las letras sueltas también son palabras repetidas | Hallazgo a validar (el sitio se desvía de lo esperado) | ❌ Falló |
| ED-05 | Palabras comunes en inglés (the, and) | Hallazgo a validar (el sitio se desvía de lo esperado) | ❌ Falló |
| ED-06 | Un link y un email cuentan como una palabra cada uno | Hallazgo a validar (el sitio se desvía de lo esperado) | ❌ Falló |
| ED-07 | Palabras unidas con guion bajo (hola_mundo) | Hallazgo a validar (el sitio se desvía de lo esperado) | ❌ Falló |
| ED-08 | Palabras unidas con barra (mañana/tarde) | Hallazgo a validar (el sitio se desvía de lo esperado) | ❌ Falló |
| ED-09 | Con AUTO-SAVE en OFF el texto no debería quedar guardado al recargar | Hallazgo a validar (el sitio se desvía de lo esperado) | ❌ Falló |
| OB-01 | Cuando hay empate, el sitio ordena por orden de aparición (no alfabético) | Observación (comportamiento documentado) | ✅ Pasó |
| OB-02 | Keyword Density lista como máximo 10 palabras | Observación (comportamiento documentado) | ✅ Pasó |
| SC-01 | El texto de ejemplo del enunciado | Núcleo (requisito de la prueba) | ✅ Pasó |
| SC-02 | Una sola palabra | Núcleo (requisito de la prueba) | ✅ Pasó |
| SC-03 | Mayúsculas y minúsculas cuentan como la misma palabra | Núcleo (requisito de la prueba) | ✅ Pasó |
| SC-04 | Signos de puntuación pegados a la palabra | Núcleo (requisito de la prueba) | ✅ Pasó |
| SC-05 | Espacios repetidos entre palabras | Núcleo (requisito de la prueba) | ✅ Pasó |
| SC-06 | Espacios al principio y al final del texto | Núcleo (requisito de la prueba) | ✅ Pasó |
| SC-07 | Los saltos de línea no cuentan como caracteres | Núcleo (requisito de la prueba) | ✅ Pasó |
| SC-08 | Tildes y la letra ñ | Núcleo (requisito de la prueba) | ✅ Pasó |
| SC-09 | Top 3 claro, sin empates | Núcleo (requisito de la prueba) | ✅ Pasó |
| SC-10 | Empate en el tercer lugar | Núcleo (requisito de la prueba) | ✅ Pasó |
| SC-11 | Palabra con guion interno es una sola palabra | Núcleo (requisito de la prueba) | ✅ Pasó |
| SC-12 | Palabras con letras y números juntos | Núcleo (requisito de la prueba) | ✅ Pasó |
| SC-13 | Escribir tecla por tecla y borrar todo actualiza los contadores | Núcleo (requisito de la prueba) | ✅ Pasó |
| SC-14 | Un texto largo (20.000 palabras) se cuenta bien y usa separador de miles | Núcleo (requisito de la prueba) | ✅ Pasó |
| SC-15 | El botón Clear deja todo en cero | Núcleo (requisito de la prueba) | ✅ Pasó |
| SC-16 | El total es el mismo en los tres lugares donde se muestra | Núcleo (requisito de la prueba) | ✅ Pasó |
| SC-17 | Pegar un texto desde el portapapeles (Ctrl+V) se cuenta igual que escribirlo | Núcleo (requisito de la prueba) | ✅ Pasó |
| SC-18 | El sitio y el algoritmo del punto 4 coinciden en un párrafo real | Núcleo (requisito de la prueba) | ✅ Pasó |
| SC-19 | Estado inicial con la configuración por defecto | Núcleo (requisito de la prueba) | ✅ Pasó |

## Detalle de los escenarios que fallaron

### ED-01 · Un emoji cuenta como 1 carácter

**Qué se probó:** Una persona ve el emoji 😀 como un solo carácter. Si el sitio lo cuenta como dos, el total de caracteres no coincide con lo que se ve (importa si hay límites de caracteres, como un SMS o un campo con máximo).

**Texto ingresado:** `"hola 😀 hola 😀 mundo"`

**Descripción del error:**

- Número de caracteres de "hola 😀 hola 😀 mundo". Se esperaba «19» y el sitio mostró «21».

**Hallazgo relacionado:** BUG-002 [Desktop] Cada emoji cuenta como 2 caracteres

**Evidencia:** ![ED-01](<evidencias/BUG-002 [Desktop] Cada emoji cuenta como 2 caracteres - ED-01.png>)

### ED-02 · Palabras unidas por espacio de no separación (NBSP)

**Qué se probó:** Este espacio invisible aparece al copiar desde páginas web o Word. El contador de palabras y la lista de Keyword Density tienen que usar la misma regla, y hoy no la usan.

**Texto ingresado:** `"hola mundo hola mundo"`

**Descripción del error:**

- Top 3 palabras más repetidas (Keyword Density) de "hola mundo hola mundo". Diferencias: cantidad de palabras en el top: se esperaban 2 (ej. «hola» ×2, «mundo» ×2) y el sitio listó 1 («hola mundo» ×2) | posición 1: el sitio muestra «hola mundo», que no es una palabra del texto tal como se esperaba.

**Hallazgo relacionado:** BUG-003 [Desktop] Words y Keyword Density cuentan distinto con espacio invisible

**Evidencia:** ![ED-02](<evidencias/BUG-003 [Desktop] Words y Keyword Density cuentan distinto con espacio invisible - ED-02.png>)

### ED-03 · Los números también son palabras repetidas

**Qué se probó:** El contador de palabras suma los números, pero Keyword Density los esconde. Si un número se repite mucho (por ejemplo un precio o un código), no aparece en el top.

**Texto ingresado:** `"123 123 456 hola"`

**Descripción del error:**

- Top 3 palabras más repetidas (Keyword Density) de "123 123 456 hola". Diferencias: cantidad de palabras en el top: se esperaban 3 (ej. «123» ×2, «456» ×1, «hola» ×1) y el sitio listó 1 («hola» ×1) | posición 1: se esperaba una palabra con 2 repeticiones y el sitio muestra «hola» con 1.

**Hallazgo relacionado:** BUG-004 [Desktop] Keyword Density omite números, letras sueltas y palabras comunes en inglés

**Evidencia:** ![ED-03](<evidencias/BUG-004 [Desktop] Keyword Density omite números, letras sueltas y palabras comunes en inglés - ED-03.png>)

### ED-04 · Las letras sueltas también son palabras repetidas

**Qué se probó:** Mismo problema: letras sueltas como «b» o «c» se cuentan como palabras pero no aparecen en Keyword Density.

**Texto ingresado:** `"b a c b a c d"`

**Descripción del error:**

- Top 3 palabras más repetidas (Keyword Density) de "b a c b a c d". Diferencias: cantidad de palabras en el top: se esperaban 3 (ej. «b» ×2, «a» ×2, «c» ×2) y el sitio listó 0 (ninguna).

**Hallazgo relacionado:** BUG-004 [Desktop] Keyword Density omite números, letras sueltas y palabras comunes en inglés

**Evidencia:** ![ED-04](<evidencias/BUG-004 [Desktop] Keyword Density omite números, letras sueltas y palabras comunes en inglés - ED-04.png>)

### ED-05 · Palabras comunes en inglés (the, and)

**Qué se probó:** El sitio esconde palabras como «the» y «and» de la lista, sin avisarlo. La prueba pide las 3 palabras más repetidas, y «the» es la más repetida de este texto.

**Texto ingresado:** `"the cat and the dog and the bird"`

**Descripción del error:**

- Top 3 palabras más repetidas (Keyword Density) de "the cat and the dog and the bird". Diferencias: posición 1: se esperaba una palabra con 3 repeticiones y el sitio muestra «cat» con 1 | posición 2: se esperaba una palabra con 2 repeticiones y el sitio muestra «dog» con 1.

**Hallazgo relacionado:** BUG-004 [Desktop] Keyword Density omite números, letras sueltas y palabras comunes en inglés

**Evidencia:** ![ED-05](<evidencias/BUG-004 [Desktop] Keyword Density omite números, letras sueltas y palabras comunes en inglés - ED-05.png>)

### ED-06 · Un link y un email cuentan como una palabra cada uno

**Qué se probó:** Pegar una dirección web o un email es muy común. Entre espacios son dos bloques de texto, pero el sitio los parte en pedazos y cuenta 3 palabras.

**Texto ingresado:** `"https://farmatodo.com info@farmatodo.com"`

**Descripción del error:**

- Número de palabras de "https://farmatodo.com info@farmatodo.com". Se esperaba «2» y el sitio mostró «3».
- Top 3 palabras más repetidas (Keyword Density) de "https://farmatodo.com info@farmatodo.com". Diferencias: cantidad de palabras en el top: se esperaban 2 (ej. «https://farmatodo.com» ×1, «info@farmatodo.com» ×1) y el sitio listó 3 («farmatodo» ×2, «com» ×2, «https» ×1) | posición 1: el sitio muestra «farmatodo», que no es una palabra del texto tal como se esperaba | posición 1: se esperaba una palabra con 1 repeticiones y el sitio muestra «farmatodo» con 2 | posición 2: el sitio muestra «com», que no es una palabra del texto tal como se esperaba | posición 2: se esperaba una palabra con 1 repeticiones y el sitio muestra «com» con 2 | posición 3: el sitio muestra «https», que no es una palabra del texto tal como se esperaba.

**Hallazgo relacionado:** BUG-005 [Desktop] Parte palabras en guion bajo, barras y direcciones web

**Evidencia:** ![ED-06](<evidencias/BUG-005 [Desktop] Parte palabras en guion bajo, barras y direcciones web - ED-06.png>)

### ED-07 · Palabras unidas con guion bajo (hola_mundo)

**Qué se probó:** Un nombre como «hola_mundo» (usuarios, archivos) se ve como una palabra; el sitio la parte en dos.

**Texto ingresado:** `"hola_mundo hola_mundo"`

**Descripción del error:**

- Número de palabras de "hola_mundo hola_mundo". Se esperaba «2» y el sitio mostró «4».
- Top 3 palabras más repetidas (Keyword Density) de "hola_mundo hola_mundo". Diferencias: cantidad de palabras en el top: se esperaban 1 (ej. «hola_mundo» ×2) y el sitio listó 2 («hola» ×2, «mundo» ×2) | posición 1: el sitio muestra «hola», que no es una palabra del texto tal como se esperaba | posición 2: el sitio muestra «mundo», que no es una palabra del texto tal como se esperaba.

**Hallazgo relacionado:** BUG-005 [Desktop] Parte palabras en guion bajo, barras y direcciones web

**Evidencia:** ![ED-07](<evidencias/BUG-005 [Desktop] Parte palabras en guion bajo, barras y direcciones web - ED-07.png>)

### ED-08 · Palabras unidas con barra (mañana/tarde)

**Qué se probó:** Escrituras como «mañana/tarde» o «y/o» se usan mucho en textos de farmacia (posología). Se ven como un bloque, el sitio cuenta dos.

**Texto ingresado:** `"mañana/tarde mañana/tarde"`

**Descripción del error:**

- Top 3 palabras más repetidas (Keyword Density) de "mañana/tarde mañana/tarde". Diferencias: cantidad de palabras en el top: se esperaban 1 (ej. «mañana/tarde» ×2) y el sitio listó 2 («mañana» ×2, «tarde» ×2) | posición 1: el sitio muestra «mañana», que no es una palabra del texto tal como se esperaba | posición 2: el sitio muestra «tarde», que no es una palabra del texto tal como se esperaba.

**Hallazgo relacionado:** BUG-005 [Desktop] Parte palabras en guion bajo, barras y direcciones web

**Evidencia:** ![ED-08](<evidencias/BUG-005 [Desktop] Parte palabras en guion bajo, barras y direcciones web - ED-08.png>)

### ED-09 · Con AUTO-SAVE en OFF el texto no debería quedar guardado al recargar

**Qué se probó:** El botón dice «AUTO-SAVE OFF» (apagado). Si cierro o recargo la página, lo razonable es empezar con el editor vacío. Si el texto vuelve, el sitio lo guardó igual en este navegador. Es un tema de coherencia y de privacidad en computadoras compartidas.

**Texto ingresado:** `"texto privado de prueba"`

**Descripción del error:**

- Contenido del editor después de recargar con AUTO-SAVE en OFF. Diferencias: texto privado de prueba.

**Hallazgo relacionado:** BUG-001 [Desktop] Con AUTO-SAVE en OFF el texto se guarda igual

**Evidencia:** ![ED-09](<evidencias/BUG-001 [Desktop] Con AUTO-SAVE en OFF el texto se guarda igual - ED-09.png>)
