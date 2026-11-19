// ================================================================================================================
//  ESTE ARCHIVO CONTIENE SOLO ESCENARIOS DE WORDCOUNTER.NET (PUNTO 1 Y 2 DE LA PRUEBA)
// ================================================================================================================
//  Todo lo que está debajo (SC-xx, ED-xx y el párrafo de verificación cruzada) corresponde al sitio
//  https://wordcounter.net/ y lo consumen las pruebas de tests/wordcounter/.
//
//  Dónde están los casos de los otros puntos (NO están en esta carpeta):
//   - ALGORITMO (punto 4)  -> unit/word-frequency.spec.ts (AL-01 a AL-17) y unit/scenarios-vs-algorithm.spec.ts (XV-xx).
//                             Cada prueba lleva su propio texto de entrada dentro del archivo.
//   - FARMATODO (punto 3)  -> no tiene pruebas automatizadas: los bugs BUG-006 a BUG-008 están en
//                             docs/03-reporte-ux-farmatodo.md y los scripts de exploración en exploracion/farmatodo-*.ts.
// ================================================================================================================
//
// Escenarios dirigidos por datos para https://wordcounter.net/ (solo con la configuración por defecto).
// Para agregar un caso nuevo basta con sumar un objeto a la lista `scenarios`: las pruebas lo toman solas.
//
// Los valores esperados se calculan A MANO con la definición de abajo, nunca se copian de lo que muestra el sitio:
//   - palabra     = bloque de texto separado por espacios (misma definición que el punto 4 de la prueba)
//   - carácter    = lo que una persona ve como un carácter, con espacios y sin saltos de línea
//   - frecuencia  = sin distinguir mayúsculas, ignorando la puntuación en los bordes de la palabra
// Cada valor esperado se verifica contra el algoritmo del punto 4 en unit/scenarios-vs-algorithm.spec.ts.

export type Category = "core" | "edge";

export interface Finding {
  id: string; // BUG-xx, el mismo ID que se usa en docs/02-reporte-fallas-wordcounter.md
  platform: string; // "Desktop", "Mobile" o "Desktop y Mobile"
  title: string; // título del bug, igual que en el reporte (también nombra la evidencia)
}

export interface Scenario {
  id: string;
  category: Category;
  title: string; // título corto en español (aparece en el reporte)
  plain: string; // explicación en lenguaje simple para quien no es técnico
  text: string;
  expected: {
    words: number;
    characters: number;
    // Tabla completa palabra -> cantidad (en minúsculas). El helper deduce de ahí el "top 3" válido,
    // así los empates no vuelven frágil al escenario.
    frequencies: Record<string, number>;
    // Opcional: verificar también el porcentaje que muestra el sitio junto a cada palabra (cantidad / palabras).
    checkPercentages?: boolean;
  };
  finding?: Finding; // solo para escenarios "edge": un desvío conocido del sitio según los supuestos indicados
}

// Lista de escenarios de WORDCOUNTER.NET (no incluye algoritmo ni Farmatodo, ver el encabezado del archivo).
export const scenarios: Scenario[] = [
  // ---------------------------------------------------------------- WORDCOUNTER.NET · NÚCLEO (deben pasar)
  {
    id: "SC-01",
    category: "core",
    title: "El texto de ejemplo del enunciado",
    plain:
      "Uso exactamente el texto que trae la prueba. El enunciado ya dice que debe dar 14 palabras y 99 caracteres, así que sirve como referencia oficial.",
    text: "farmatodo farmatodo farmatodo farmatodo farmatodo cuida cuida tu salud\nfarmatodo cuida toda tu salud",
    expected: {
      words: 14,
      characters: 99,
      frequencies: { farmatodo: 6, cuida: 3, tu: 2, salud: 2, toda: 1 },
      checkPercentages: true,
    },
  },
  {
    id: "SC-02",
    category: "core",
    title: "Una sola palabra",
    plain: "El caso más chico posible. Verifica que el sitio no se rompa con un solo dato y que escriba bien el singular.",
    text: "hola",
    expected: { words: 1, characters: 4, frequencies: { hola: 1 }, checkPercentages: true },
  },
  {
    id: "SC-03",
    category: "core",
    title: "Mayúsculas y minúsculas cuentan como la misma palabra",
    plain: "«Hola», «hola» y «HOLA» son la misma palabra para una persona. El sitio tiene que sumarlas juntas.",
    text: "Hola hola HOLA mundo",
    expected: { words: 4, characters: 20, frequencies: { hola: 3, mundo: 1 } },
  },
  {
    id: "SC-04",
    category: "core",
    title: "Signos de puntuación pegados a la palabra",
    plain:
      "En un texto real las palabras vienen con comas, puntos y signos pegados. «Hola,» y «hola.» deben contarse como «hola».",
    text: "Hola, hola. hola! mundo?",
    expected: { words: 4, characters: 24, frequencies: { hola: 3, mundo: 1 } },
  },
  {
    id: "SC-05",
    category: "core",
    title: "Espacios repetidos entre palabras",
    plain: "Cuando alguien pone varios espacios seguidos no aparecen palabras fantasma, pero los espacios sí cuentan como caracteres.",
    text: "uno   dos    tres",
    expected: { words: 3, characters: 17, frequencies: { uno: 1, dos: 1, tres: 1 } },
  },
  {
    id: "SC-06",
    category: "core",
    title: "Espacios al principio y al final del texto",
    plain: "Los espacios de los bordes no son palabras, pero sí son caracteres.",
    text: "   hola mundo   ",
    expected: { words: 2, characters: 16, frequencies: { hola: 1, mundo: 1 } },
  },
  {
    id: "SC-07",
    category: "core",
    title: "Los saltos de línea no cuentan como caracteres",
    plain:
      "Las reglas de la prueba dicen que los saltos de línea no se cuentan. Además un salto de línea separa palabras, aunque no haya espacio.",
    text: "uno\ndos\n\ntres",
    expected: { words: 3, characters: 10, frequencies: { uno: 1, dos: 1, tres: 1 } },
  },
  {
    id: "SC-08",
    category: "core",
    title: "Tildes y la letra ñ",
    plain: "Farmatodo es una marca en español. Verifico que «canción», «niño» y «árbol» se lean completas y se cuenten bien.",
    text: "canción canción niño niño árbol",
    expected: { words: 5, characters: 31, frequencies: { canción: 2, niño: 2, árbol: 1 } },
  },
  {
    id: "SC-09",
    category: "core",
    title: "Top 3 claro, sin empates",
    plain:
      "Cuatro palabras con repeticiones distintas (4, 3, 2 y 1). El top 3 tiene que dejar afuera a la que aparece una sola vez y mostrar los porcentajes correctos.",
    text: "perro perro perro perro gato gato gato casa casa lobo",
    expected: {
      words: 10,
      characters: 53,
      frequencies: { perro: 4, gato: 3, casa: 2, lobo: 1 },
      checkPercentages: true,
    },
  },
  {
    id: "SC-10",
    category: "core",
    title: "Empate en el tercer lugar",
    plain:
      "«dos» y «tres» aparecen 2 veces cada una y pelean por el segundo y tercer puesto. La prueba no exige un orden dentro del empate: pido que el conteo sea correcto.",
    text: "uno uno uno dos dos tres tres cuatro",
    expected: { words: 8, characters: 36, frequencies: { uno: 3, dos: 2, tres: 2, cuatro: 1 } },
  },
  {
    id: "SC-11",
    category: "core",
    title: "Palabra con guion interno es una sola palabra",
    plain: "«e-mail» y «perro-gato» son una palabra cada una, no dos. Es la forma habitual de contar en un procesador de texto.",
    text: "e-mail perro-gato e-mail",
    expected: { words: 3, characters: 24, frequencies: { "e-mail": 2, "perro-gato": 1 } },
  },
  {
    id: "SC-12",
    category: "core",
    title: "Palabras con letras y números juntos",
    plain: "Códigos como «abc123» (muy comunes en una farmacia: lotes, SKU) se tratan como una palabra.",
    text: "abc123 abc123 xyz",
    expected: { words: 3, characters: 17, frequencies: { abc123: 2, xyz: 1 } },
  },

  // ---------------------------------------------------------------- WORDCOUNTER.NET · BORDE (desvíos conocidos del sitio)
  // Estos escenarios afirman la definición *estándar* de arriba. Hoy el sitio se desvía, por eso fallan a propósito:
  // cada fallo es un hallazgo documentado (ver docs/02-reporte-fallas-wordcounter.md).
  {
    id: "ED-01",
    category: "edge",
    title: "Un emoji cuenta como 1 carácter",
    plain:
      "Una persona ve el emoji 😀 como un solo carácter. Si el sitio lo cuenta como dos, el total de caracteres no coincide con lo que se ve (importa si hay límites de caracteres, como un SMS o un campo con máximo).",
    text: "hola 😀 hola 😀 mundo",
    expected: { words: 5, characters: 19, frequencies: { hola: 2, "😀": 2, mundo: 1 } },
    finding: { id: "BUG-002", platform: "Desktop", title: "Cada emoji cuenta como 2 caracteres" },
  },
  {
    id: "ED-02",
    category: "edge",
    title: "Palabras unidas por espacio de no separación (NBSP)",
    plain:
      "Este espacio invisible aparece al copiar desde páginas web o Word. El contador de palabras y la lista de Keyword Density tienen que usar la misma regla, y hoy no la usan.",
    text: "hola\u00a0mundo hola\u00a0mundo",
    expected: { words: 4, characters: 21, frequencies: { hola: 2, mundo: 2 } },
    finding: { id: "BUG-003", platform: "Desktop", title: "Words y Keyword Density cuentan distinto con espacio invisible" },
  },
  {
    id: "ED-03",
    category: "edge",
    title: "Los números también son palabras repetidas",
    plain:
      "El contador de palabras suma los números, pero Keyword Density los esconde. Si un número se repite mucho (por ejemplo un precio o un código), no aparece en el top.",
    text: "123 123 456 hola",
    expected: { words: 4, characters: 16, frequencies: { "123": 2, "456": 1, hola: 1 } },
    finding: { id: "BUG-004", platform: "Desktop", title: "Keyword Density omite números, letras sueltas y palabras comunes en inglés" },
  },
  {
    id: "ED-04",
    category: "edge",
    title: "Las letras sueltas también son palabras repetidas",
    plain: "Mismo problema: letras sueltas como «b» o «c» se cuentan como palabras pero no aparecen en Keyword Density.",
    text: "b a c b a c d",
    expected: { words: 7, characters: 13, frequencies: { b: 2, a: 2, c: 2, d: 1 } },
    finding: { id: "BUG-004", platform: "Desktop", title: "Keyword Density omite números, letras sueltas y palabras comunes en inglés" },
  },
  {
    id: "ED-05",
    category: "edge",
    title: "Palabras comunes en inglés (the, and)",
    plain:
      "El sitio esconde palabras como «the» y «and» de la lista, sin avisarlo. La prueba pide las 3 palabras más repetidas, y «the» es la más repetida de este texto.",
    text: "the cat and the dog and the bird",
    expected: { words: 8, characters: 32, frequencies: { the: 3, and: 2, cat: 1, dog: 1, bird: 1 } },
    finding: { id: "BUG-004", platform: "Desktop", title: "Keyword Density omite números, letras sueltas y palabras comunes en inglés" },
  },
  {
    id: "ED-06",
    category: "edge",
    title: "Un link y un email cuentan como una palabra cada uno",
    plain:
      "Pegar una dirección web o un email es muy común. Entre espacios son dos bloques de texto, pero el sitio los parte en pedazos y cuenta 3 palabras.",
    text: "https://farmatodo.com info@farmatodo.com",
    expected: { words: 2, characters: 40, frequencies: { "https://farmatodo.com": 1, "info@farmatodo.com": 1 } },
    finding: { id: "BUG-005", platform: "Desktop", title: "Parte palabras en guion bajo, barras y direcciones web" },
  },
  {
    id: "ED-07",
    category: "edge",
    title: "Palabras unidas con guion bajo (hola_mundo)",
    plain: "Un nombre como «hola_mundo» (usuarios, archivos) se ve como una palabra; el sitio la parte en dos.",
    text: "hola_mundo hola_mundo",
    expected: { words: 2, characters: 21, frequencies: { hola_mundo: 2 } },
    finding: { id: "BUG-005", platform: "Desktop", title: "Parte palabras en guion bajo, barras y direcciones web" },
  },
  {
    id: "ED-08",
    category: "edge",
    title: "Palabras unidas con barra (mañana/tarde)",
    plain: "Escrituras como «mañana/tarde» o «y/o» se usan mucho en textos de farmacia (posología). Se ven como un bloque, el sitio cuenta dos.",
    text: "mañana/tarde mañana/tarde",
    expected: { words: 2, characters: 25, frequencies: { "mañana/tarde": 2 } },
    finding: { id: "BUG-005", platform: "Desktop", title: "Parte palabras en guion bajo, barras y direcciones web" },
  },
];

// ---------------------------------------------------------------- WORDCOUNTER.NET · verificación cruzada (SC-18)
// Párrafo largo y realista en español, usado para la verificación cruzada contra el algoritmo del punto 4.
// Se escribe en wordcounter.net y su resultado esperado lo calcula el algoritmo (tests/wordcounter/interaccion.spec.ts).
export const crossCheckParagraph =
  "Farmatodo cuida tu salud. En Farmatodo encontras medicamentos, vitaminas y productos de cuidado personal. " +
  "Cuida tu salud con Farmatodo y cuida a tu familia. Tu salud es lo primero.";
