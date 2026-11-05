# Contenido de los juegos

Esta carpeta es la base de datos del sitio. Los juegos se generan solos cada vez, pero las palabras, pistas, frases, adivinanzas, personajes y misterios salen de estos archivos. Si agregas contenido aquí, todos los juegos tendrán más variedad.

## Cómo editar desde GitHub

1. Abre el archivo en github.com y pulsa el lápiz (**Edit this file**).
2. Agrega tus líneas siguiendo el mismo formato que las que ya están (abajo hay ejemplos).
3. Pulsa **Commit changes**. En uno o dos minutos el sitio usa el contenido nuevo.

Si algo queda mal escrito (por ejemplo, falta una coma o unas comillas), el sitio mostrará un aviso de que no pudo cargar el contenido. Para arreglarlo, revisa el último cambio en el historial del archivo.

## Archivos

| Archivo | Lo usan | Qué contiene |
| --- | --- | --- |
| `palabras.json` | Sopa de letras, crucigrama, escape room | Temas con palabras y pistas en español e inglés |
| `frases.json` | Mensaje secreto | Frases fijas y plantillas para armar frases nuevas |
| `adivinanzas.json` | Escape room | Adivinanzas con su respuesta |
| `logica.json` | Acertijo de lógica | Nombres y categorías (mascota, color, deporte…) |
| `misterios.json` | Misterio | Historias, la pregunta final y sus categorías |

## Ejemplos

**Una palabra nueva** en `palabras.json`, dentro de la lista `palabras` de un tema:

```json
["CANGURO", "Salta y lleva a su cría en una bolsa", "KANGAROO", "Hops and carries its baby in a pouch"],
```

El orden es: palabra en español, pista en español, palabra en inglés, pista en inglés. Las palabras pueden llevar acentos y Ñ: el programa los quita en la cuadrícula. La pista no debe contener la palabra.

**Un tema nuevo**: copia un tema completo (desde `{` hasta `}`), cámbiale el `id` (sin espacios ni acentos), los nombres `es` y `en`, y sus palabras. Conviene que tenga al menos 20 palabras para que la sopa de letras más grande tenga de dónde escoger.

**Una adivinanza** en `adivinanzas.json`:

```json
["Tengo cuatro patas y no camino, tengo cabecera y no pienso.", "Cama"],
```

**Una frase** en `frases.json`. Las plantillas usan `{cosa}`, `{lugar}`, `{cuando}` y `{plan}`, y el programa las combina con las listas del mismo nombre. Agregar una sola línea a `lugar` multiplica las frases posibles.

**Una categoría de lógica** en `logica.json`: cada valor lleva el texto corto para la cuadrícula y el texto para las pistas.

```json
{"id": "postre", "titulo": "Postre", "si": "pidió {v}", "no": "no pidió {v}",
 "valores": [["Flan", "flan"], ["Pastel", "pastel"], ["Helado", "helado"], ["Gelatina", "gelatina"], ["Galletas", "galletas"]]}
```

Las frases deben quedar bien después del nombre («Ana pidió flan») y después de «quien» («Quien pidió flan…»). Cada categoría necesita al menos 5 valores.

**Un misterio** en `misterios.json`: copia uno completo y cambia `titulo`, `intro`, `pregunta`, `evidencia` y sus tres categorías. En `evidencia`, `{si}` se reemplaza por la característica del culpable («…el culpable traía una linterna»).

## Letras que se pueden usar

Los PDF usan una fuente básica que no tiene emojis ni símbolos especiales. Usa letras, números, acentos, Ñ, ¿, ¡ y la puntuación normal.
