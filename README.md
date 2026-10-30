# Hojas de pasatiempos

Generador de hojas de pasatiempos para imprimir. Elige un juego y una dificultad, y descarga un PDF con juegos nuevos y su hoja de soluciones.

**Úsalo en línea:** https://whoismjanyway.github.io/hojas-de-pasatiempos/

Todo funciona en un solo archivo (`index.html`) que se abre en el navegador. No necesita instalación.

## Juegos

| Juego | Qué cambia con la dificultad |
| --- | --- |
| **Sudoku** | De unas 50 pistas hasta tableros que requieren técnicas avanzadas. |
| **Laberinto** | De 6×6 hasta 30×30. |
| **Sopa de letras** | De 8×8 con 6 palabras (solo → y ↓) hasta 16×16 con 16 palabras en 8 direcciones y letras trampa. |
| **Crucigrama** | De 5 palabras con la primera letra puesta hasta 17 palabras sin ayudas. |
| **Rompecabezas** | De 4 piezas hasta 25 piezas, algunas giradas. |
| **Cruci-números** | Cuadrícula de operaciones en cruz: de 2×2 con sumas hasta 3×3 vacío con las cuatro operaciones. Siempre tiene una sola solución. |
| **Mensaje secreto** | Frase cifrada: de la clave A = 1 hasta claves revueltas, letras corridas o claves incompletas. |
| **Escape room** | Una hoja completa con 5 retos (sopa de letras, candado matemático, mensaje secreto, cruci-números y adivinanza). Cada reto da un código y al final se escribe el código final. |

Cada juego tiene 7 niveles: súper fácil, fácil, medio, medio-difícil, difícil, extremo y súper extremo.

**Mezclar juegos** combina varios juegos en las mismas hojas. El escape room no entra en la mezcla porque ocupa una hoja completa.

Todos los juegos se generan automáticamente: cada vez que pulsas «Juegos nuevos» salen distintos.

## Idioma

Se puede elegir **español** o **inglés**. Esto cambia las palabras de la sopa de letras, las pistas del crucigrama, las frases del mensaje secreto, las adivinanzas del escape room y las instrucciones impresas. Las dificultades son iguales en los dos idiomas. En español las palabras van sin acentos dentro de la cuadrícula; la Ñ se conserva.

## Tamaños de hoja

- **A4:** hoja completa.
- **A5:** se imprime en la mitad superior de una hoja A4 para después cortarla.

Algunos juegos necesitan más espacio, así que el número de juegos por hoja está limitado:

| Juego | A4 | A5 |
| --- | --- | --- |
| Sudoku, laberinto, cruci-números, mensaje secreto | hasta 6 | hasta 4 |
| Sopa de letras, crucigrama, rompecabezas | hasta 4 | hasta 2 |
| Escape room | 1 | 1 |

Al imprimir, usa **tamaño real (100 %)**.

## Cómo usarlo

1. Abre `index.html` en el navegador (o publícalo con GitHub Pages).
2. Elige juego, dificultad, idioma, tamaño de hoja y cuántos juegos por hoja.
3. Revisa la vista previa y pulsa **Descargar PDF**.

El PDF se genera con [jsPDF](https://github.com/parallax/jsPDF), que se carga desde cdnjs, así que la descarga necesita conexión a internet.
