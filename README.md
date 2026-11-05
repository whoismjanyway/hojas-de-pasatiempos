# Hojas de pasatiempos

Generador de hojas de pasatiempos para imprimir, con su hoja de soluciones. Cada vez que lo usas salen juegos nuevos, generados automáticamente.

**Úsalo en línea:** https://whoismjanyway.github.io/hojas-de-pasatiempos/

## Juegos

Todos tienen 7 niveles, de súper fácil a súper extremo.

| Juego | Qué cambia con la dificultad |
| --- | --- |
| **Sudoku** | De unas 50 pistas hasta tableros que requieren técnicas avanzadas. |
| **Laberinto** | De 6×6 hasta 30×30. |
| **Sopa de letras** | De 8×8 con 6 palabras hasta 16×16 con dos temas, trampas y solo pistas en lugar de palabras. En el nivel difícil a las palabras les faltan letras. |
| **Crucigrama** | De 5 palabras con la primera letra puesta hasta 17 palabras sin ayudas. |
| **Cruci-números** | Operaciones en cruz: de 2×2 con sumas a 3×3 vacío con las cuatro operaciones. Siempre tiene una sola solución. |
| **Mensaje secreto** | Frase cifrada: de la clave A = 1 a claves revueltas, letras corridas o claves incompletas. |
| **Acertijo de lógica** | Una pequeña historia (una carrera, una feria de ciencias, una pizzería…), pistas, cuadrícula para deducir y una pregunta final. De 3 personas y 2 categorías a 5 personas en orden con pistas indirectas. Solución única comprobada. |
| **Misterio** | Un caso con sospechosos, lugares, objetos y horarios; la última pista señala al culpable. Solución única comprobada. |
| **Escape room** | Una hoja con 5 retos (sopa de letras, candado matemático, mensaje secreto, cruci-números y adivinanza) y un código final. |

En **Mezcla** tú eliges qué juegos combinar.

### Menos repetición

El sitio recuerda en tu navegador las palabras, frases, adivinanzas y misterios que ya salieron, y prefiere contenido nuevo en las siguientes hojas. Con esa memoria, 10 sopas de letras seguidas no repiten ninguna palabra.

## Imprimir

- **Imprimir** abre directamente el cuadro de impresión del dispositivo (computadora, celular o tableta). Las hojas se mandan como dibujos vectoriales, así que salen nítidas.
- **Ver o descargar PDF** muestra todas las hojas y permite descargar el PDF.
- En los navegadores que no pueden imprimir directamente (por ejemplo, el navegador interno de algunas apps), se abre el visor para descargar el PDF.
- Usa **tamaño real (100 %)**. En A5, el juego sale en la mitad de arriba de una hoja A4 con una línea punteada para cortar.

## Historial

Cada impresión se guarda en el historial (las últimas 30, solo en ese navegador). Desde ahí puedes:

- **Ver soluciones** de esa impresión, aunque no las hayas impreso.
- **Ver hojas** o **Imprimir otra vez** exactamente los mismos juegos.
- **Usar estos juegos** para cargarlos en la página con sus ajustes.

## Agregar contenido

Las palabras, pistas, frases, adivinanzas, categorías de lógica y misterios están en la carpeta [`datos/`](datos/). Se pueden editar desde GitHub sin programar; la guía está en [`datos/LEEME.md`](datos/LEEME.md).

## Archivos

| Archivo | Para qué sirve |
| --- | --- |
| `index.html`, `estilos.css` | La página |
| `js/app.js` | Controles, vista previa, impresión e historial |
| `js/hojas.js` | Catálogo de juegos y dibujo de las hojas (SVG y PDF) |
| `js/motor.js` | Generadores de juegos; corre en segundo plano |
| `datos/*.json` | Contenido de los juegos |

El PDF se genera con [jsPDF](https://github.com/parallax/jsPDF). Como el contenido se carga desde `datos/`, la página debe abrirse desde su dirección web (o desde un servidor local), no con doble clic en el archivo.
