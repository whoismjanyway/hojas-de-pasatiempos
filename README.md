# Hojas de pasatiempos

Generador de hojas de pasatiempos para imprimir. Elige un juego y una dificultad, y descarga un PDF con juegos nuevos y su hoja de soluciones.

Todo funciona en un solo archivo (`index.html`) que se abre en el navegador. No necesita instalación.

## Juegos

| Juego | Qué cambia con la dificultad |
| --- | --- |
| **Sudoku** | De unas 50 pistas hasta tableros que requieren técnicas avanzadas. |
| **Laberinto** | De 6×6 hasta 30×30. |
| **Sopa de letras** | De 8×8 con 6 palabras (solo → y ↓) hasta 16×16 con 16 palabras en 8 direcciones y letras trampa. |
| **Crucigrama** | De 5 palabras con la primera letra puesta hasta 17 palabras sin ayudas. |
| **Encuentra las diferencias** | De 3 diferencias grandes hasta 10 diferencias chicas. |
| **Rompecabezas** | De 4 piezas hasta 25 piezas, algunas giradas. |

Cada juego tiene 7 niveles: súper fácil, fácil, medio, medio-difícil, difícil, extremo y súper extremo.

**Mezclar juegos** combina los seis juegos en las mismas hojas.

## Idioma

Se puede elegir **español** o **inglés**. Esto cambia las palabras de la sopa de letras, las pistas del crucigrama y las instrucciones impresas. Las dificultades son iguales en los dos idiomas. En español las palabras van sin acentos dentro de la cuadrícula; la Ñ se conserva.

## Tamaños de hoja

- **A4:** hoja completa.
- **A5:** se imprime en la mitad superior de una hoja A4 para después cortarla.

Algunos juegos necesitan más espacio, así que el número de juegos por hoja está limitado:

| Juego | A4 | A5 |
| --- | --- | --- |
| Sudoku, laberinto | hasta 6 | hasta 4 |
| Sopa de letras, crucigrama, diferencias, rompecabezas | hasta 4 | hasta 2 |

Al imprimir, usa **tamaño real (100 %)**.

## Cómo usarlo

1. Abre `index.html` en el navegador (o publícalo con GitHub Pages).
2. Elige juego, dificultad, idioma, tamaño de hoja y cuántos juegos por hoja.
3. Revisa la vista previa y pulsa **Descargar PDF**.

El PDF se genera con [jsPDF](https://github.com/parallax/jsPDF), que se carga desde cdnjs, así que la descarga necesita conexión a internet.
