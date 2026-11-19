# Glosario

| Término | Qué significa en este proyecto |
|---|---|
| **Escenario / caso de prueba** | Una situación concreta que se prueba: un texto de entrada y lo que debería mostrar el sitio. |
| **Suite** | El conjunto de todos los escenarios automatizados. |
| **Automatizado** | Un programa abre el sitio, escribe el texto, lee los resultados y compara. Se puede repetir las veces que haga falta. |
| **Pasó / Falló** | Pasó: el sitio mostró lo esperado. Falló: mostró otra cosa. |
| **Núcleo (SC)** | Escenarios que piden la prueba y el sentido común. Deben pasar. |
| **Observación (OB)** | Un comportamiento del sitio que se documenta, aunque no sea un error. |
| **Hallazgo (ED)** | Escenario que falla a propósito porque el sitio se desvía de lo esperado. Cada uno es un defecto o una oportunidad de mejora. |
| **Bug** | Un defecto del sitio descrito con ficha completa: título, ambiente, precondiciones, pasos, resultado actual y esperado, severidad, criticidad y evidencia. Un bug puede estar probado por varios escenarios. Se nombra `BUG-xxx`. |
| **Observación (OBS)** | Algo que se vio durante la exploración pero que todavía no está confirmado como bug. |
| **Ambiente** | Dónde se probó: sitio, navegador, sistema operativo, tamaño de pantalla e idioma. |
| **Precondiciones** | Lo que debe estar listo antes de empezar los pasos (por ejemplo, una ventana sin datos previos). |
| **Pasos de reproducción** | La lista exacta de acciones para que cualquier persona vea el mismo problema. |
| **Resultado actual / esperado** | Lo que pasa hoy contra lo que debería pasar. |
| **Severidad** | Qué tan grave es el defecto en sí: alta (resultado incorrecto en la función principal o pérdida de datos), media (incorrecto pero se puede seguir usando), baja (detalle visual u ortográfico). |
| **Criticidad** | Qué tan urgente es corregirlo para el negocio: alta (antes de la próxima versión), media (planificar), baja (cuando haya tiempo). |
| **Plataforma** | Dónde se confirmó el bug: Desktop, Tablet o Mobile. |
| **Keyword Density** | Panel de wordcounter.net con las palabras clave más usadas y su porcentaje. |
| **Top 3** | Las tres palabras más repetidas. |
| **Empate** | Dos palabras con la misma cantidad de repeticiones. |
| **Palabra** | Lo que está entre espacios. Ver la definición completa en `04-contador-frecuencia-palabras.md`. |
| **Carácter** | Un símbolo visible. Los espacios cuentan, los saltos de línea no. |
| **Emoji** | Dibujitos como 😀. Para una persona son 1 carácter. Para algunos programas son 2. |
| **Espacio de no separación (NBSP)** | Un espacio invisible que aparece al copiar desde una web o desde Word. Se ve igual que un espacio, pero es otro carácter. |
| **Palabra común (stopword)** | Palabra muy frecuente («the», «and», «el») que algunos sitios ocultan de las listas de palabras clave. |
| **Falso positivo** | La prueba falla pero el sitio está bien (el error es de la prueba). |
| **Falso negativo** | La prueba pasa pero había un error real que no vio. |
| **Regresión** | Algo que funcionaba y dejó de funcionar. |
| **Evidencia** | Captura de pantalla o salida real que demuestra lo que se afirma. |
| **Responsive** | Que el sitio se adapta al tamaño de pantalla (computadora, tablet, celular). |
| **Desktop / Tablet / Mobile** | Vistas de computadora (1440 px de ancho), tablet (820 px) y celular (390 px). |
| **UX** | Experiencia de usuario: qué tan claro y cómodo es usar el sitio. |
| **Complejidad O(n)** | Cuánto crece el tiempo o la memoria cuando crece el tamaño del archivo. O(n) = crece en línea recta; O(n log n) = un poco más rápido que doble al duplicar el tamaño. |
| **Histograma** | Lista de cuántas veces aparece cada palabra. |
| **Page Object** | Archivo que concentra cómo se encuentran los elementos de una página, para que las pruebas sean fáciles de mantener. |
| **Playwright** | Herramienta que controla un navegador desde código. |
| **CLI** | Programa que se usa desde la terminal escribiendo un comando. |
