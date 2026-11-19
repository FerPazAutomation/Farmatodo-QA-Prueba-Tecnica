# Pruebas del algoritmo de frecuencia de palabras

_Prueba técnica Farmatodo · Punto 4_

Ejecución: 19/11/2026, 05:29:50 · Duración: 3.8 s

## Resumen

| Escenarios ejecutados | Pasaron | Fallaron | Omitidos |
|---|---|---|---|
| **37** | **37** | **0** | 0 |

## Todos los escenarios

| ID | Escenario | Tipo | Resultado |
|---|---|---|---|
| AL-01 | Produce exactamente la salida del ejemplo del enunciado | Núcleo (requisito de la prueba) | ✅ Pasó |
| AL-02 | Empate de frecuencia se ordena alfabéticamente | Núcleo (requisito de la prueba) | ✅ Pasó |
| AL-03 | Ordena por frecuencia descendente aunque el texto venga desordenado | Núcleo (requisito de la prueba) | ✅ Pasó |
| AL-04 | Mayúsculas y minúsculas son la misma palabra | Núcleo (requisito de la prueba) | ✅ Pasó |
| AL-05 | Ignora la puntuación en los bordes pero conserva la interna | Núcleo (requisito de la prueba) | ✅ Pasó |
| AL-06 | Tildes y ñ se conservan y se ordenan en español | Núcleo (requisito de la prueba) | ✅ Pasó |
| AL-07 | Cuenta los espacios y no cuenta los saltos de línea (\n y \r\n) | Núcleo (requisito de la prueba) | ✅ Pasó |
| AL-08 | Un emoji cuenta como 1 carácter | Núcleo (requisito de la prueba) | ✅ Pasó |
| AL-09 | Archivo vacío: 0 palabras, 0 caracteres y sin histograma | Núcleo (requisito de la prueba) | ✅ Pasó |
| AL-10 | Solo símbolos no cuenta como palabras | Núcleo (requisito de la prueba) | ✅ Pasó |
| AL-11 | Singular correcto: «1 word» y «1 character» | Núcleo (requisito de la prueba) | ✅ Pasó |
| AL-12 | Lee un archivo real de disco (UTF-8, con BOM y sin salto final) | Núcleo (requisito de la prueba) | ✅ Pasó |
| AL-13 | Un archivo que no existe da un mensaje claro y código de salida 1 | Núcleo (requisito de la prueba) | ✅ Pasó |
| AL-14 | La opción --bars agrega un histograma visual proporcional | Núcleo (requisito de la prueba) | ✅ Pasó |
| AL-15 | Rendimiento: 1.000.000 de palabras en menos de 3 segundos | Núcleo (requisito de la prueba) | ✅ Pasó |
| AL-16 | Un emoji suelto cuenta como palabra y se agrupa con los iguales | Núcleo (requisito de la prueba) | ✅ Pasó |
| AL-17 | Una tilde escrita en dos formas cuenta como la misma palabra | Núcleo (requisito de la prueba) | ✅ Pasó |
| XV-ED-01 | Un emoji cuenta como 1 carácter | Núcleo (requisito de la prueba) | ✅ Pasó |
| XV-ED-02 | Palabras unidas por espacio de no separación (NBSP) | Núcleo (requisito de la prueba) | ✅ Pasó |
| XV-ED-03 | Los números también son palabras repetidas | Núcleo (requisito de la prueba) | ✅ Pasó |
| XV-ED-04 | Las letras sueltas también son palabras repetidas | Núcleo (requisito de la prueba) | ✅ Pasó |
| XV-ED-05 | Palabras comunes en inglés (the, and) | Núcleo (requisito de la prueba) | ✅ Pasó |
| XV-ED-06 | Un link y un email cuentan como una palabra cada uno | Núcleo (requisito de la prueba) | ✅ Pasó |
| XV-ED-07 | Palabras unidas con guion bajo (hola_mundo) | Núcleo (requisito de la prueba) | ✅ Pasó |
| XV-ED-08 | Palabras unidas con barra (mañana/tarde) | Núcleo (requisito de la prueba) | ✅ Pasó |
| XV-SC-01 | El texto de ejemplo del enunciado | Núcleo (requisito de la prueba) | ✅ Pasó |
| XV-SC-02 | Una sola palabra | Núcleo (requisito de la prueba) | ✅ Pasó |
| XV-SC-03 | Mayúsculas y minúsculas cuentan como la misma palabra | Núcleo (requisito de la prueba) | ✅ Pasó |
| XV-SC-04 | Signos de puntuación pegados a la palabra | Núcleo (requisito de la prueba) | ✅ Pasó |
| XV-SC-05 | Espacios repetidos entre palabras | Núcleo (requisito de la prueba) | ✅ Pasó |
| XV-SC-06 | Espacios al principio y al final del texto | Núcleo (requisito de la prueba) | ✅ Pasó |
| XV-SC-07 | Los saltos de línea no cuentan como caracteres | Núcleo (requisito de la prueba) | ✅ Pasó |
| XV-SC-08 | Tildes y la letra ñ | Núcleo (requisito de la prueba) | ✅ Pasó |
| XV-SC-09 | Top 3 claro, sin empates | Núcleo (requisito de la prueba) | ✅ Pasó |
| XV-SC-10 | Empate en el tercer lugar | Núcleo (requisito de la prueba) | ✅ Pasó |
| XV-SC-11 | Palabra con guion interno es una sola palabra | Núcleo (requisito de la prueba) | ✅ Pasó |
| XV-SC-12 | Palabras con letras y números juntos | Núcleo (requisito de la prueba) | ✅ Pasó |
