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

**Un acertijo de lógica** en `logica.json`, dentro de `escenarios`. Cada escenario es una pequeña historia con categorías que tienen que ver entre sí y una categoría con orden (lugares, mesas, horas o días). Copia uno completo y cambia:

- `titulo` y `persona` (cómo se llama a cada participante en la cuadrícula: «Ciclista», «Vecino»…).
- `inicio`: la primera frase; `{n}` se reemplaza por el número de personas escrito con letra.
- `nota` (opcional): una frase que explica el orden, por ejemplo «Las casas están numeradas de izquierda a derecha».
- En cada categoría: `desc` (lo que se agrega a «Cada quien…»), `si` y `no` (cómo se dice en las pistas) y al menos 5 `valores`, cada uno con el texto corto de la cuadrícula y el de las pistas.

```json
{"id": "postre", "titulo": "Postre", "desc": "pidió otro postre", "si": "pidió {v}", "no": "no pidió {v}",
 "valores": [["Flan", "flan"], ["Pastel", "pastel"], ["Helado", "helado"], ["Gelatina", "gelatina"], ["Galletas", "galletas"]]}
```

Las frases deben quedar bien después de un nombre («Ana pidió flan»), después de «quien» («Quien pidió flan…») y en la pregunta final («¿Quién pidió flan?»). La categoría con orden lleva además `"orden": true` y las frases `menor`, `justo` y `lado` («llegó antes que», «llegó justo antes que», «llegó justo antes o justo después que»); sus valores van en orden.

**Un misterio** en `misterios.json`: copia uno completo y cambia `titulo`, `intro`, `pregunta`, `evidencia` y sus tres categorías. En `evidencia`, `{si}` se reemplaza por la característica del culpable («…el culpable traía una linterna»).

## Letras que se pueden usar

Los PDF usan una fuente básica que no tiene emojis ni símbolos especiales. Usa letras, números, acentos, Ñ, ¿, ¡ y la puntuación normal.
