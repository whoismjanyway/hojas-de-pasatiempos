# Hojas de pasatiempos

Generador de hojas de pasatiempos para imprimir. Elige un juego y una dificultad, pulsa **Imprimir** y se abre un visor del PDF con su hoja de soluciones, desde donde puedes imprimirlo o descargarlo.

**Úsalo en línea:** https://whoismjanyway.github.io/hojas-de-pasatiempos/

Todo funciona en un solo archivo (`index.html`) que se abre en el navegador. No necesita instalación.

## Juegos

| Juego | Qué cambia con la dificultad |
| --- | --- |
| **Sudoku** | De unas 50 pistas hasta tableros que requieren técnicas avanzadas. |
| **Laberinto** | De 6×6 hasta 30×30. |
| **Sopa de letras** | De 8×8 con 6 palabras (solo → y ↓) hasta 16×16 con 16 palabras en 8 direcciones y letras trampa. |
| **Crucigrama** | De 5 palabras con la primera letra puesta hasta 17 palabras sin ayudas. |
| **Cruci-números** | Cuadrícula de operaciones en cruz: de 2×2 con sumas hasta 3×3 vacío con las cuatro operaciones. Siempre tiene una sola solución. |
| **Mensaje secreto** | Frase cifrada: de la clave A = 1 hasta claves revueltas, letras corridas o claves incompletas. |
| **Escape room** | Una hoja completa con 5 retos (sopa de letras, candado matemático, mensaje secreto, cruci-números y adivinanza). Cada reto da un código y al final se escribe el código final. |

Cada juego tiene 7 niveles: súper fácil, fácil, medio, medio-difícil, difícil, extremo y súper extremo.

**Mezcla:** tú eliges qué juegos combinar y se reparten al azar en las hojas. Si incluyes el escape room, habrá un juego por hoja porque necesita la hoja completa.

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
| Sopa de letras, crucigrama | hasta 4 | hasta 2 |
| Escape room | 1 | 1 |

Al imprimir, usa **tamaño real (100 %)**.

## Cómo usarlo

1. Abre el sitio (o `index.html` en el navegador).
2. Elige juego, dificultad, idioma, tamaño de hoja y cuántos juegos por hoja.
3. Revisa la vista previa y pulsa **Imprimir**. Se abre el visor del PDF con los botones **Imprimir** y **Descargar**.

## Historial de impresiones

Cada vez que pulsas **Imprimir**, el programa guarda esos juegos en el historial (las últimas 30 impresiones, solo en tu navegador). Desde **Historial de impresiones** puedes:

- **Ver e imprimir** otra vez exactamente los mismos juegos.
- **Usar estos juegos** para cargarlos en la vista previa con sus ajustes.
- **Quitar** una entrada o borrar todo el historial.

El PDF se genera con [jsPDF](https://github.com/parallax/jsPDF), que se carga desde cdnjs, así que la descarga necesita conexión a internet.
