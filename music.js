/* Music data and deterministic theory helpers. No network dependency. */
const Music = (() => {
const scales=[
  {
    "id": "major",
    "name": "Mayor / jónico",
    "notes": [
      0,
      2,
      4,
      5,
      7,
      9,
      11
    ],
    "degrees": [
      0,
      1,
      2,
      3,
      4,
      5,
      6
    ],
    "group": "Diatónicas",
    "description": "T–T–S–T–T–T–S. Centro estable y sensible en el VII."
  },
  {
    "id": "minor",
    "name": "Menor natural / eólico",
    "notes": [
      0,
      2,
      3,
      5,
      7,
      8,
      10
    ],
    "degrees": [
      0,
      1,
      2,
      3,
      4,
      5,
      6
    ],
    "group": "Diatónicas",
    "description": "Tercera, sexta y séptima menores. Compárala con su relativa mayor."
  },
  {
    "id": "dorian",
    "name": "Dórico",
    "notes": [
      0,
      2,
      3,
      5,
      7,
      9,
      10
    ],
    "degrees": [
      0,
      1,
      2,
      3,
      4,
      5,
      6
    ],
    "group": "Modos",
    "description": "Menor con sexta mayor. Destaca ese VI sobre un pedal de tónica."
  },
  {
    "id": "phrygian",
    "name": "Frigio",
    "notes": [
      0,
      1,
      3,
      5,
      7,
      8,
      10
    ],
    "degrees": [
      0,
      1,
      2,
      3,
      4,
      5,
      6
    ],
    "group": "Modos",
    "description": "Menor con segunda menor; el II rebajado define su color."
  },
  {
    "id": "lydian",
    "name": "Lidio",
    "notes": [
      0,
      2,
      4,
      6,
      7,
      9,
      11
    ],
    "degrees": [
      0,
      1,
      2,
      3,
      4,
      5,
      6
    ],
    "group": "Modos",
    "description": "Mayor con cuarta aumentada. Evita perder la tónica al recorrer sus notas."
  },
  {
    "id": "mixo",
    "name": "Mixolidio",
    "notes": [
      0,
      2,
      4,
      5,
      7,
      9,
      10
    ],
    "degrees": [
      0,
      1,
      2,
      3,
      4,
      5,
      6
    ],
    "group": "Modos",
    "description": "Mayor con séptima menor. Puede sostener un centro modal sin sensible."
  },
  {
    "id": "locrian",
    "name": "Locrio",
    "notes": [
      0,
      1,
      3,
      5,
      6,
      8,
      10
    ],
    "degrees": [
      0,
      1,
      2,
      3,
      4,
      5,
      6
    ],
    "group": "Modos",
    "description": "Tercera menor y quinta disminuida; su tríada de tónica es disminuida."
  },
  {
    "id": "harmonic",
    "name": "Menor armónica",
    "notes": [
      0,
      2,
      3,
      5,
      7,
      8,
      11
    ],
    "degrees": [
      0,
      1,
      2,
      3,
      4,
      5,
      6
    ],
    "group": "Menores",
    "description": "Eleva el VII de la menor natural y permite el V mayor."
  },
  {
    "id": "melodic",
    "name": "Menor melódica",
    "notes": [
      0,
      2,
      3,
      5,
      7,
      9,
      11
    ],
    "degrees": [
      0,
      1,
      2,
      3,
      4,
      5,
      6
    ],
    "group": "Menores",
    "description": "Forma ascendente: VI y VII elevados. Aquí se mantiene al descender, como en el uso jazzístico."
  },
  {
    "id": "majorPent",
    "name": "Pentatónica mayor",
    "notes": [
      0,
      2,
      4,
      7,
      9
    ],
    "degrees": [
      0,
      1,
      2,
      4,
      5
    ],
    "group": "Pentatónicas y blues",
    "description": "Grados 1–2–3–5–6 de la mayor. Útil para construir motivos con espacio."
  },
  {
    "id": "minorPent",
    "name": "Pentatónica menor",
    "notes": [
      0,
      3,
      5,
      7,
      10
    ],
    "degrees": [
      0,
      2,
      3,
      4,
      6
    ],
    "group": "Pentatónicas y blues",
    "description": "Grados 1–♭3–4–5–♭7. Comparte notas con su relativa pentatónica mayor."
  },
  {
    "id": "minorBlues",
    "name": "Blues menor",
    "notes": [
      0,
      3,
      5,
      6,
      7,
      10
    ],
    "degrees": [
      0,
      2,
      3,
      4,
      4,
      6
    ],
    "group": "Pentatónicas y blues",
    "description": "Pentatónica menor con ♭5 cromático. El lenguaje blues también usa inflexiones de afinación."
  },
  {
    "id": "majorBlues",
    "name": "Blues mayor",
    "notes": [
      0,
      2,
      3,
      4,
      7,
      9
    ],
    "degrees": [
      0,
      1,
      2,
      2,
      4,
      5
    ],
    "group": "Pentatónicas y blues",
    "description": "Pentatónica mayor con ♭3 añadida, que contrasta con la tercera mayor."
  },
  {
    "id": "whole",
    "name": "Tonos enteros",
    "notes": [
      0,
      2,
      4,
      6,
      8,
      10
    ],
    "degrees": null,
    "group": "Simétricas",
    "description": "Seis notas separadas por tonos. Solo hay dos colecciones distintas por transposición."
  },
  {
    "id": "dimHW",
    "name": "Disminuida S–T",
    "notes": [
      0,
      1,
      3,
      4,
      6,
      7,
      9,
      10
    ],
    "degrees": null,
    "group": "Simétricas",
    "description": "Alterna semitono y tono. Puede aportar ♭9, ♯9, 3, ♯11, 5, 13 y ♭7 a un dominante."
  },
  {
    "id": "dimWH",
    "name": "Disminuida T–S",
    "notes": [
      0,
      2,
      3,
      5,
      6,
      8,
      9,
      11
    ],
    "degrees": null,
    "group": "Simétricas",
    "description": "Alterna tono y semitono. Relaciona sus notas con un acorde de séptima disminuida."
  },
  {
    "id": "chromatic",
    "name": "Cromática",
    "notes": [
      0,
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11
    ],
    "degrees": null,
    "group": "Simétricas",
    "description": "Los doce semitonos. Las etiquetas son una escritura práctica, no una única ortografía posible."
  },
  {
    "id": "phrygDom",
    "name": "Frigio dominante",
    "notes": [
      0,
      1,
      4,
      5,
      7,
      8,
      10
    ],
    "degrees": [
      0,
      1,
      2,
      3,
      4,
      5,
      6
    ],
    "group": "Colores avanzados",
    "description": "Quinto modo de la menor armónica. Combina tercera mayor y segunda menor."
  },
  {
    "id": "lydDom",
    "name": "Lidio dominante",
    "notes": [
      0,
      2,
      4,
      6,
      7,
      9,
      10
    ],
    "degrees": [
      0,
      1,
      2,
      3,
      4,
      5,
      6
    ],
    "group": "Colores avanzados",
    "description": "Cuarto modo de la menor melódica: dominante con ♯11."
  },
  {
    "id": "altered",
    "name": "Alterada",
    "notes": [
      0,
      1,
      3,
      4,
      6,
      8,
      10
    ],
    "degrees": [
      0,
      1,
      2,
      3,
      4,
      5,
      6
    ],
    "group": "Colores avanzados",
    "description": "Séptimo modo de la menor melódica. Su ♭4 es enarmónico de la tercera mayor del dominante; distingue escritura de escala y función armónica."
  },
  {
    "id": "harmMajor",
    "name": "Mayor armónica",
    "notes": [
      0,
      2,
      4,
      5,
      7,
      8,
      11
    ],
    "degrees": [
      0,
      1,
      2,
      3,
      4,
      5,
      6
    ],
    "group": "Colores avanzados",
    "description": "Mayor con sexta menor: conviven tercera mayor y ♭6."
  },
  {
    "id": "doubleHarm",
    "name": "Doble armónica mayor",
    "notes": [
      0,
      1,
      4,
      5,
      7,
      8,
      11
    ],
    "degrees": [
      0,
      1,
      2,
      3,
      4,
      5,
      6
    ],
    "group": "Colores avanzados",
    "description": "Mayor con ♭2 y ♭6. Contiene dos segundas aumentadas."
  },
  {
    "id": "hungarian",
    "name": "Menor húngara",
    "notes": [
      0,
      2,
      3,
      6,
      7,
      8,
      11
    ],
    "degrees": [
      0,
      1,
      2,
      3,
      4,
      5,
      6
    ],
    "group": "Colores avanzados",
    "description": "Menor armónica con IV elevado; analiza sus saltos antes de usarla melódicamente."
  },
  {
    "id": "bebop",
    "name": "Bebop dominante",
    "notes": [
      0,
      2,
      4,
      5,
      7,
      9,
      10,
      11
    ],
    "degrees": [
      0,
      1,
      2,
      3,
      4,
      5,
      6,
      6
    ],
    "group": "Colores avanzados",
    "description": "Mixolidio con VII mayor cromático añadido. La colocación rítmica decide qué notas caen en los pulsos."
  }
];
const chords=[
  {
    "id": "major",
    "name": "Mayor",
    "suffix": "",
    "notes": [
      0,
      4,
      7
    ],
    "degrees": [
      0,
      2,
      4
    ],
    "group": "Tríadas",
    "formula": "1 · 3 · 5"
  },
  {
    "id": "minor",
    "name": "Menor",
    "suffix": "m",
    "notes": [
      0,
      3,
      7
    ],
    "degrees": [
      0,
      2,
      4
    ],
    "group": "Tríadas",
    "formula": "1 · ♭3 · 5"
  },
  {
    "id": "dim",
    "name": "Disminuido",
    "suffix": "dim",
    "notes": [
      0,
      3,
      6
    ],
    "degrees": [
      0,
      2,
      4
    ],
    "group": "Tríadas",
    "formula": "1 · ♭3 · ♭5"
  },
  {
    "id": "aug",
    "name": "Aumentado",
    "suffix": "aug",
    "notes": [
      0,
      4,
      8
    ],
    "degrees": [
      0,
      2,
      4
    ],
    "group": "Tríadas",
    "formula": "1 · 3 · ♯5"
  },
  {
    "id": "sus2",
    "name": "Suspendido 2",
    "suffix": "sus2",
    "notes": [
      0,
      2,
      7
    ],
    "degrees": [
      0,
      1,
      4
    ],
    "group": "Suspendidos",
    "formula": "1 · 2 · 5; reemplaza la tercera"
  },
  {
    "id": "sus4",
    "name": "Suspendido 4",
    "suffix": "sus4",
    "notes": [
      0,
      5,
      7
    ],
    "degrees": [
      0,
      3,
      4
    ],
    "group": "Suspendidos",
    "formula": "1 · 4 · 5; reemplaza la tercera"
  },
  {
    "id": "power",
    "name": "Quinta sin tercera",
    "suffix": "5",
    "notes": [
      0,
      7
    ],
    "degrees": [
      0,
      4
    ],
    "group": "Suspendidos",
    "formula": "1 · 5; no define mayor ni menor"
  },
  {
    "id": "six",
    "name": "Mayor sexta",
    "suffix": "6",
    "notes": [
      0,
      4,
      7,
      9
    ],
    "degrees": [
      0,
      2,
      4,
      5
    ],
    "group": "Añadidos",
    "formula": "1 · 3 · 5 · 6"
  },
  {
    "id": "min6",
    "name": "Menor sexta",
    "suffix": "m6",
    "notes": [
      0,
      3,
      7,
      9
    ],
    "degrees": [
      0,
      2,
      4,
      5
    ],
    "group": "Añadidos",
    "formula": "1 · ♭3 · 5 · 6"
  },
  {
    "id": "add9",
    "name": "Mayor add9",
    "suffix": "add9",
    "notes": [
      0,
      4,
      7,
      14
    ],
    "degrees": [
      0,
      2,
      4,
      8
    ],
    "group": "Añadidos",
    "formula": "1 · 3 · 5 · 9; no implica séptima"
  },
  {
    "id": "minadd9",
    "name": "Menor add9",
    "suffix": "m(add9)",
    "notes": [
      0,
      3,
      7,
      14
    ],
    "degrees": [
      0,
      2,
      4,
      8
    ],
    "group": "Añadidos",
    "formula": "1 · ♭3 · 5 · 9"
  },
  {
    "id": "maj7",
    "name": "Mayor séptima",
    "suffix": "maj7",
    "notes": [
      0,
      4,
      7,
      11
    ],
    "degrees": [
      0,
      2,
      4,
      6
    ],
    "group": "Séptimas",
    "formula": "1 · 3 · 5 · 7"
  },
  {
    "id": "dom7",
    "name": "Dominante séptima",
    "suffix": "7",
    "notes": [
      0,
      4,
      7,
      10
    ],
    "degrees": [
      0,
      2,
      4,
      6
    ],
    "group": "Séptimas",
    "formula": "1 · 3 · 5 · ♭7"
  },
  {
    "id": "min7",
    "name": "Menor séptima",
    "suffix": "m7",
    "notes": [
      0,
      3,
      7,
      10
    ],
    "degrees": [
      0,
      2,
      4,
      6
    ],
    "group": "Séptimas",
    "formula": "1 · ♭3 · 5 · ♭7"
  },
  {
    "id": "half",
    "name": "Semidisminuido",
    "suffix": "m7♭5",
    "notes": [
      0,
      3,
      6,
      10
    ],
    "degrees": [
      0,
      2,
      4,
      6
    ],
    "group": "Séptimas",
    "formula": "1 · ♭3 · ♭5 · ♭7"
  },
  {
    "id": "dim7",
    "name": "Séptima disminuida",
    "suffix": "dim7",
    "notes": [
      0,
      3,
      6,
      9
    ],
    "degrees": [
      0,
      2,
      4,
      6
    ],
    "group": "Séptimas",
    "formula": "1 · ♭3 · ♭5 · 𝄫7"
  },
  {
    "id": "minmaj7",
    "name": "Menor con séptima mayor",
    "suffix": "m(maj7)",
    "notes": [
      0,
      3,
      7,
      11
    ],
    "degrees": [
      0,
      2,
      4,
      6
    ],
    "group": "Séptimas",
    "formula": "1 · ♭3 · 5 · 7"
  },
  {
    "id": "augmaj7",
    "name": "Aumentado con séptima mayor",
    "suffix": "aug(maj7)",
    "notes": [
      0,
      4,
      8,
      11
    ],
    "degrees": [
      0,
      2,
      4,
      6
    ],
    "group": "Séptimas",
    "formula": "1 · 3 · ♯5 · 7"
  },
  {
    "id": "sus7",
    "name": "Dominante suspendido",
    "suffix": "7sus4",
    "notes": [
      0,
      5,
      7,
      10
    ],
    "degrees": [
      0,
      3,
      4,
      6
    ],
    "group": "Suspendidos",
    "formula": "1 · 4 · 5 · ♭7"
  },
  {
    "id": "maj9",
    "name": "Mayor novena",
    "suffix": "maj9",
    "notes": [
      0,
      4,
      7,
      11,
      14
    ],
    "degrees": [
      0,
      2,
      4,
      6,
      8
    ],
    "group": "Extensiones",
    "formula": "1 · 3 · 5 · 7 · 9"
  },
  {
    "id": "dom9",
    "name": "Dominante novena",
    "suffix": "9",
    "notes": [
      0,
      4,
      7,
      10,
      14
    ],
    "degrees": [
      0,
      2,
      4,
      6,
      8
    ],
    "group": "Extensiones",
    "formula": "1 · 3 · 5 · ♭7 · 9"
  },
  {
    "id": "min9",
    "name": "Menor novena",
    "suffix": "m9",
    "notes": [
      0,
      3,
      7,
      10,
      14
    ],
    "degrees": [
      0,
      2,
      4,
      6,
      8
    ],
    "group": "Extensiones",
    "formula": "1 · ♭3 · 5 · ♭7 · 9"
  },
  {
    "id": "b9",
    "name": "Dominante ♭9",
    "suffix": "7(♭9)",
    "notes": [
      0,
      4,
      7,
      10,
      13
    ],
    "degrees": [
      0,
      2,
      4,
      6,
      8
    ],
    "group": "Extensiones",
    "formula": "1 · 3 · 5 · ♭7 · ♭9"
  },
  {
    "id": "s9",
    "name": "Dominante ♯9",
    "suffix": "7(♯9)",
    "notes": [
      0,
      4,
      7,
      10,
      15
    ],
    "degrees": [
      0,
      2,
      4,
      6,
      8
    ],
    "group": "Extensiones",
    "formula": "1 · 3 · 5 · ♭7 · ♯9"
  },
  {
    "id": "thirteen",
    "name": "Dominante 13",
    "suffix": "13",
    "notes": [
      0,
      4,
      10,
      14,
      21
    ],
    "degrees": [
      0,
      2,
      6,
      8,
      12
    ],
    "group": "Extensiones",
    "formula": "Voicing: 1 · 3 · ♭7 · 9 · 13; omite 5 y 11"
  }
];
const progressions=[
  {
    "id": "auth",
    "name": "El punto de llegada",
    "group": "Cadencias",
    "mode": "Mayor",
    "roman": "V7–I",
    "chords": [
      {
        "offset": 7,
        "quality": "dom7",
        "roman": "V7"
      },
      {
        "offset": 0,
        "quality": "major",
        "roman": "I"
      }
    ],
    "description": "La sensible y la séptima de dominante se dirigen a la tónica. Canta B–C y F–E en do."
  },
  {
    "id": "plagal",
    "name": "Un cierre más suave",
    "group": "Cadencias",
    "mode": "Mayor",
    "roman": "IV–I",
    "chords": [
      {
        "offset": 5,
        "quality": "major",
        "roman": "IV"
      },
      {
        "offset": 0,
        "quality": "major",
        "roman": "I"
      }
    ],
    "description": "Compara su color con V–I. El cierre también depende de la melodía y del ritmo."
  },
  {
    "id": "deceptive",
    "name": "La resolución inesperada",
    "group": "Cadencias",
    "mode": "Mayor",
    "roman": "V–vi",
    "chords": [
      {
        "offset": 7,
        "quality": "dom7",
        "roman": "V7"
      },
      {
        "offset": 9,
        "quality": "minor",
        "roman": "vi"
      }
    ],
    "description": "La dominante evita la tónica esperada y llega al relativo menor."
  },
  {
    "id": "ii",
    "name": "La columna vertebral",
    "group": "Jazz y soul",
    "mode": "Mayor",
    "roman": "ii7–V7–Imaj7",
    "chords": [
      {
        "offset": 2,
        "quality": "min7",
        "roman": "ii7"
      },
      {
        "offset": 7,
        "quality": "dom7",
        "roman": "V7"
      },
      {
        "offset": 0,
        "quality": "maj7",
        "roman": "Imaj7"
      }
    ],
    "description": "Escucha terceras y séptimas. El bajo re–sol–do organiza la dirección por quintas."
  },
  {
    "id": "pop",
    "name": "Cuatro acordes, muchas canciones",
    "group": "Pop",
    "mode": "Mayor",
    "roman": "I–V–vi–IV",
    "chords": [
      {
        "offset": 0,
        "quality": "major",
        "roman": "I"
      },
      {
        "offset": 7,
        "quality": "major",
        "roman": "V"
      },
      {
        "offset": 9,
        "quality": "minor",
        "roman": "vi"
      },
      {
        "offset": 5,
        "quality": "major",
        "roman": "IV"
      }
    ],
    "description": "Una vuelta abierta: el regreso de IV a I sostiene la repetición sin usar V justo antes de I."
  },
  {
    "id": "popMinor",
    "name": "Mismo material, otro inicio",
    "group": "Pop",
    "mode": "Mayor",
    "roman": "vi–IV–I–V",
    "chords": [
      {
        "offset": 9,
        "quality": "minor",
        "roman": "vi"
      },
      {
        "offset": 5,
        "quality": "major",
        "roman": "IV"
      },
      {
        "offset": 0,
        "quality": "major",
        "roman": "I"
      },
      {
        "offset": 7,
        "quality": "major",
        "roman": "V"
      }
    ],
    "description": "Compara comenzar en vi y en I. El centro depende también de duración y fraseo."
  },
  {
    "id": "fifties",
    "name": "La rueda clásica",
    "group": "Pop",
    "mode": "Mayor",
    "roman": "I–vi–IV–V",
    "chords": [
      {
        "offset": 0,
        "quality": "major",
        "roman": "I"
      },
      {
        "offset": 9,
        "quality": "minor",
        "roman": "vi"
      },
      {
        "offset": 5,
        "quality": "major",
        "roman": "IV"
      },
      {
        "offset": 7,
        "quality": "major",
        "roman": "V"
      }
    ],
    "description": "La dominante final prepara el retorno. Crea una melodía distinta en cada vuelta."
  },
  {
    "id": "three",
    "name": "Los tres pilares",
    "group": "Funcional",
    "mode": "Mayor",
    "roman": "I–IV–V–I",
    "chords": [
      {
        "offset": 0,
        "quality": "major",
        "roman": "I"
      },
      {
        "offset": 5,
        "quality": "major",
        "roman": "IV"
      },
      {
        "offset": 7,
        "quality": "major",
        "roman": "V"
      },
      {
        "offset": 0,
        "quality": "major",
        "roman": "I"
      }
    ],
    "description": "Tónica, preparación, dominante y reposo. Un mapa inicial para escuchar funciones."
  },
  {
    "id": "royal",
    "name": "Una cadena que sigue",
    "group": "Pop",
    "mode": "Mayor",
    "roman": "IV–V–iii–vi",
    "chords": [
      {
        "offset": 5,
        "quality": "major",
        "roman": "IV"
      },
      {
        "offset": 7,
        "quality": "major",
        "roman": "V"
      },
      {
        "offset": 4,
        "quality": "minor",
        "roman": "iii"
      },
      {
        "offset": 9,
        "quality": "minor",
        "roman": "vi"
      }
    ],
    "description": "El final en vi permite continuar hacia ii o volver a IV. No presupone por sí solo una nueva tonalidad."
  },
  {
    "id": "borrow",
    "name": "Mayor que se vuelve menor",
    "group": "Intercambio modal",
    "mode": "Mayor",
    "roman": "I–IV–iv–I",
    "chords": [
      {
        "offset": 0,
        "quality": "major",
        "roman": "I"
      },
      {
        "offset": 5,
        "quality": "major",
        "roman": "IV"
      },
      {
        "offset": 5,
        "quality": "minor",
        "roman": "iv"
      },
      {
        "offset": 0,
        "quality": "major",
        "roman": "I"
      }
    ],
    "description": "Sigue el VI de la tonalidad: la–la♭–sol en do. El iv se toma del modo paralelo menor."
  },
  {
    "id": "flatColors",
    "name": "Ventanas al modo menor",
    "group": "Intercambio modal",
    "mode": "Mayor",
    "roman": "I–♭VI–♭VII–I",
    "chords": [
      {
        "offset": 0,
        "quality": "major",
        "roman": "I"
      },
      {
        "offset": 8,
        "quality": "major",
        "roman": "♭VI"
      },
      {
        "offset": 10,
        "quality": "major",
        "roman": "♭VII"
      },
      {
        "offset": 0,
        "quality": "major",
        "roman": "I"
      }
    ],
    "description": "Los grados rebajados introducen otro color sin cambiar necesariamente la tónica."
  },
  {
    "id": "minorCad",
    "name": "Tensión en modo menor",
    "group": "Menor",
    "mode": "Menor",
    "roman": "i–iv–V7–i",
    "chords": [
      {
        "offset": 0,
        "quality": "minor",
        "roman": "i"
      },
      {
        "offset": 5,
        "quality": "minor",
        "roman": "iv"
      },
      {
        "offset": 7,
        "quality": "dom7",
        "roman": "V7"
      },
      {
        "offset": 0,
        "quality": "minor",
        "roman": "i"
      }
    ],
    "description": "El V mayor utiliza el VII elevado de la escala menor armónica."
  },
  {
    "id": "andalusian",
    "name": "Bajo que desciende",
    "group": "Menor",
    "mode": "Menor",
    "roman": "i–♭VII–♭VI–V",
    "chords": [
      {
        "offset": 0,
        "quality": "minor",
        "roman": "i"
      },
      {
        "offset": 10,
        "quality": "major",
        "roman": "♭VII"
      },
      {
        "offset": 8,
        "quality": "major",
        "roman": "♭VI"
      },
      {
        "offset": 7,
        "quality": "major",
        "roman": "V"
      }
    ],
    "description": "Versión tonal menor de la llamada cadencia andaluza. El análisis puede cambiar en un contexto flamenco."
  },
  {
    "id": "minorPop",
    "name": "Épica en modo menor",
    "group": "Menor",
    "mode": "Menor",
    "roman": "i–♭VI–♭III–♭VII",
    "chords": [
      {
        "offset": 0,
        "quality": "minor",
        "roman": "i"
      },
      {
        "offset": 8,
        "quality": "major",
        "roman": "♭VI"
      },
      {
        "offset": 3,
        "quality": "major",
        "roman": "♭III"
      },
      {
        "offset": 10,
        "quality": "major",
        "roman": "♭VII"
      }
    ],
    "description": "Colección de menor natural. Mantén la tónica menor como referencia al crear tu melodía."
  },
  {
    "id": "minor251",
    "name": "ii–V–i con profundidad",
    "group": "Jazz y soul",
    "mode": "Menor",
    "roman": "iiø7–V7(♭9)–i(add6)",
    "chords": [
      {
        "offset": 2,
        "quality": "half",
        "roman": "iiø7"
      },
      {
        "offset": 7,
        "quality": "b9",
        "roman": "V7(♭9)"
      },
      {
        "offset": 0,
        "quality": "min6",
        "roman": "i(add6)"
      }
    ],
    "description": "El semidisminuido prepara la dominante. La ♭9 añade tensión; la tónica menor sexta aporta otro reposo."
  },
  {
    "id": "turnaround",
    "name": "Vuelta al comienzo",
    "group": "Jazz y soul",
    "mode": "Mayor",
    "roman": "Imaj7–vi7–ii7–V7",
    "chords": [
      {
        "offset": 0,
        "quality": "maj7",
        "roman": "Imaj7"
      },
      {
        "offset": 9,
        "quality": "min7",
        "roman": "vi7"
      },
      {
        "offset": 2,
        "quality": "min7",
        "roman": "ii7"
      },
      {
        "offset": 7,
        "quality": "dom7",
        "roman": "V7"
      }
    ],
    "description": "Un turnaround prepara la siguiente vuelta. Prueba inversiones cercanas para dar continuidad."
  },
  {
    "id": "backdoor",
    "name": "La puerta de atrás",
    "group": "Jazz y soul",
    "mode": "Mayor",
    "roman": "ivm7–♭VII7–Imaj7",
    "chords": [
      {
        "offset": 5,
        "quality": "min7",
        "roman": "ivm7"
      },
      {
        "offset": 10,
        "quality": "dom7",
        "roman": "♭VII7"
      },
      {
        "offset": 0,
        "quality": "maj7",
        "roman": "Imaj7"
      }
    ],
    "description": "Fm7–B♭7–Cmaj7 en do. El ♭VII7 conecta por voces con la tónica sin ser su V7."
  },
  {
    "id": "secondary",
    "name": "Un dominante dentro del camino",
    "group": "Dominantes",
    "mode": "Mayor",
    "roman": "I–V7/ii–ii7–V7–I",
    "chords": [
      {
        "offset": 0,
        "quality": "major",
        "roman": "I"
      },
      {
        "offset": 9,
        "quality": "dom7",
        "roman": "V7/ii"
      },
      {
        "offset": 2,
        "quality": "min7",
        "roman": "ii7"
      },
      {
        "offset": 7,
        "quality": "dom7",
        "roman": "V7"
      },
      {
        "offset": 0,
        "quality": "major",
        "roman": "I"
      }
    ],
    "description": "El dominante secundario dirige la atención a ii y después recupera el recorrido principal."
  },
  {
    "id": "doubleDom",
    "name": "La dominante de la dominante",
    "group": "Dominantes",
    "mode": "Mayor",
    "roman": "I–V7/V–V7–I",
    "chords": [
      {
        "offset": 0,
        "quality": "major",
        "roman": "I"
      },
      {
        "offset": 2,
        "quality": "dom7",
        "roman": "V7/V"
      },
      {
        "offset": 7,
        "quality": "dom7",
        "roman": "V7"
      },
      {
        "offset": 0,
        "quality": "major",
        "roman": "I"
      }
    ],
    "description": "En do: C–D7–G7–C. Localiza la nota fa♯ que apunta a sol."
  },
  {
    "id": "chain",
    "name": "Una cadena de dominantes",
    "group": "Dominantes",
    "mode": "Mayor",
    "roman": "III7–VI7–II7–V7–Imaj7",
    "chords": [
      {
        "offset": 4,
        "quality": "dom7",
        "roman": "III7"
      },
      {
        "offset": 9,
        "quality": "dom7",
        "roman": "VI7"
      },
      {
        "offset": 2,
        "quality": "dom7",
        "roman": "II7"
      },
      {
        "offset": 7,
        "quality": "dom7",
        "roman": "V7"
      },
      {
        "offset": 0,
        "quality": "maj7",
        "roman": "Imaj7"
      }
    ],
    "description": "Cada dominante prepara al siguiente por quinta descendente. Escucha el proceso antes de etiquetar el centro."
  },
  {
    "id": "tritone",
    "name": "La bajada cromática",
    "group": "Dominantes",
    "mode": "Mayor",
    "roman": "ii7–subV7–Imaj7",
    "chords": [
      {
        "offset": 2,
        "quality": "min7",
        "roman": "ii7"
      },
      {
        "offset": 1,
        "quality": "dom7",
        "roman": "subV7"
      },
      {
        "offset": 0,
        "quality": "maj7",
        "roman": "Imaj7"
      }
    ],
    "description": "Dm7–D♭7–Cmaj7. El sustituto comparte el tritono enarmónico con G7 y crea un bajo cromático."
  },
  {
    "id": "doric",
    "name": "Una luz dentro del menor",
    "group": "Modal",
    "mode": "Dórico",
    "roman": "i7–IV7–i7",
    "chords": [
      {
        "offset": 0,
        "quality": "min7",
        "roman": "i7"
      },
      {
        "offset": 5,
        "quality": "dom7",
        "roman": "IV7"
      },
      {
        "offset": 0,
        "quality": "min7",
        "roman": "i7"
      }
    ],
    "description": "En do dórico, la natural aparece en F7. El reposo regresa a Cm7 para afirmar el centro modal."
  },
  {
    "id": "mixolydian",
    "name": "Mayor sin sensible",
    "group": "Modal",
    "mode": "Mixolidio",
    "roman": "I7–♭VII–IV–I7",
    "chords": [
      {
        "offset": 0,
        "quality": "dom7",
        "roman": "I7"
      },
      {
        "offset": 10,
        "quality": "major",
        "roman": "♭VII"
      },
      {
        "offset": 5,
        "quality": "major",
        "roman": "IV"
      },
      {
        "offset": 0,
        "quality": "dom7",
        "roman": "I7"
      }
    ],
    "description": "La séptima menor pertenece al centro mixolidio. No todo acorde 7 tiene que resolver como dominante funcional."
  },
  {
    "id": "lydian",
    "name": "Flotar sobre el cuarto grado",
    "group": "Modal",
    "mode": "Lidio",
    "roman": "Imaj7–II–Imaj7",
    "chords": [
      {
        "offset": 0,
        "quality": "maj7",
        "roman": "Imaj7"
      },
      {
        "offset": 2,
        "quality": "major",
        "roman": "II"
      },
      {
        "offset": 0,
        "quality": "maj7",
        "roman": "Imaj7"
      }
    ],
    "description": "El II mayor contiene la cuarta aumentada de la tónica lidia. Mantén el reposo en I."
  },
  {
    "id": "sus",
    "name": "Suspender y liberar",
    "group": "Texturas",
    "mode": "Mayor",
    "roman": "Isus2–IVsus2–Isus4–I",
    "chords": [
      {
        "offset": 0,
        "quality": "sus2",
        "roman": "Isus2"
      },
      {
        "offset": 5,
        "quality": "sus2",
        "roman": "IVsus2"
      },
      {
        "offset": 0,
        "quality": "sus4",
        "roman": "Isus4"
      },
      {
        "offset": 0,
        "quality": "major",
        "roman": "I"
      }
    ],
    "description": "La ausencia de tercera deja espacio. El cuarto grado del sus4 puede bajar a la tercera al resolver."
  },
  {
    "id": "gospel",
    "name": "El bajo también cuenta",
    "group": "Texturas",
    "mode": "Mayor",
    "roman": "I–IV–I/V–V7–I",
    "chords": [
      {
        "offset": 0,
        "quality": "major",
        "roman": "I"
      },
      {
        "offset": 5,
        "quality": "major",
        "roman": "IV"
      },
      {
        "offset": 0,
        "quality": "major",
        "roman": "I/V",
        "bass": 7
      },
      {
        "offset": 7,
        "quality": "dom7",
        "roman": "V7"
      },
      {
        "offset": 0,
        "quality": "major",
        "roman": "I"
      }
    ],
    "description": "I/V pone la quinta en el bajo. La inversión cambia la línea grave sin cambiar la calidad del acorde."
  },
  {
    "id": "circle",
    "name": "Quintas diatónicas",
    "group": "Funcional",
    "mode": "Mayor",
    "roman": "I–IV–viiø–iii–vi–ii–V–I",
    "chords": [
      {
        "offset": 0,
        "quality": "maj7",
        "roman": "Imaj7"
      },
      {
        "offset": 5,
        "quality": "maj7",
        "roman": "IVmaj7"
      },
      {
        "offset": 11,
        "quality": "half",
        "roman": "viiø7"
      },
      {
        "offset": 4,
        "quality": "min7",
        "roman": "iii7"
      },
      {
        "offset": 9,
        "quality": "min7",
        "roman": "vi7"
      },
      {
        "offset": 2,
        "quality": "min7",
        "roman": "ii7"
      },
      {
        "offset": 7,
        "quality": "dom7",
        "roman": "V7"
      },
      {
        "offset": 0,
        "quality": "maj7",
        "roman": "Imaj7"
      }
    ],
    "description": "Cadena diatónica por cuartas ascendentes. F–B es el enlace tritonal que conserva las notas de la tonalidad."
  },
  {
    "id": "blues",
    "name": "Doce compases de blues",
    "group": "Blues",
    "mode": "Blues",
    "roman": "I7 · IV7 · V7",
    "chords": [
      {
        "offset": 0,
        "quality": "dom7",
        "roman": "I7"
      },
      {
        "offset": 5,
        "quality": "dom7",
        "roman": "IV7"
      },
      {
        "offset": 0,
        "quality": "dom7",
        "roman": "I7"
      },
      {
        "offset": 0,
        "quality": "dom7",
        "roman": "I7"
      },
      {
        "offset": 5,
        "quality": "dom7",
        "roman": "IV7"
      },
      {
        "offset": 5,
        "quality": "dom7",
        "roman": "IV7"
      },
      {
        "offset": 0,
        "quality": "dom7",
        "roman": "I7"
      },
      {
        "offset": 0,
        "quality": "dom7",
        "roman": "I7"
      },
      {
        "offset": 7,
        "quality": "dom7",
        "roman": "V7"
      },
      {
        "offset": 5,
        "quality": "dom7",
        "roman": "IV7"
      },
      {
        "offset": 0,
        "quality": "dom7",
        "roman": "I7"
      },
      {
        "offset": 7,
        "quality": "dom7",
        "roman": "V7"
      }
    ],
    "description": "Una variante de 12 compases con quick change. Los acordes de séptima son parte del lenguaje, no todos dominantes secundarios."
  }
];
const circle=[
  {
    "root": "C",
    "pc": 0,
    "name": "Do mayor",
    "relative": "Am",
    "relativeName": "La menor",
    "signature": "Sin alteraciones",
    "accidentals": []
  },
  {
    "root": "G",
    "pc": 7,
    "name": "Sol mayor",
    "relative": "Em",
    "relativeName": "Mi menor",
    "signature": "1 sostenido",
    "accidentals": [
      "Fa♯"
    ]
  },
  {
    "root": "D",
    "pc": 2,
    "name": "Re mayor",
    "relative": "Bm",
    "relativeName": "Si menor",
    "signature": "2 sostenidos",
    "accidentals": [
      "Fa♯",
      "Do♯"
    ]
  },
  {
    "root": "A",
    "pc": 9,
    "name": "La mayor",
    "relative": "F♯m",
    "relativeName": "Fa♯ menor",
    "signature": "3 sostenidos",
    "accidentals": [
      "Fa♯",
      "Do♯",
      "Sol♯"
    ]
  },
  {
    "root": "E",
    "pc": 4,
    "name": "Mi mayor",
    "relative": "C♯m",
    "relativeName": "Do♯ menor",
    "signature": "4 sostenidos",
    "accidentals": [
      "Fa♯",
      "Do♯",
      "Sol♯",
      "Re♯"
    ]
  },
  {
    "root": "B",
    "pc": 11,
    "name": "Si mayor",
    "relative": "G♯m",
    "relativeName": "Sol♯ menor",
    "signature": "5 sostenidos",
    "accidentals": [
      "Fa♯",
      "Do♯",
      "Sol♯",
      "Re♯",
      "La♯"
    ]
  },
  {
    "root": "F♯",
    "pc": 6,
    "name": "Fa♯ mayor",
    "relative": "D♯m",
    "relativeName": "Re♯ menor",
    "signature": "6 sostenidos",
    "accidentals": [
      "Fa♯",
      "Do♯",
      "Sol♯",
      "Re♯",
      "La♯",
      "Mi♯"
    ]
  },
  {
    "root": "D♭",
    "pc": 1,
    "name": "Re♭ mayor",
    "relative": "B♭m",
    "relativeName": "Si♭ menor",
    "signature": "5 bemoles",
    "accidentals": [
      "Si♭",
      "Mi♭",
      "La♭",
      "Re♭",
      "Sol♭"
    ]
  },
  {
    "root": "A♭",
    "pc": 8,
    "name": "La♭ mayor",
    "relative": "Fm",
    "relativeName": "Fa menor",
    "signature": "4 bemoles",
    "accidentals": [
      "Si♭",
      "Mi♭",
      "La♭",
      "Re♭"
    ]
  },
  {
    "root": "E♭",
    "pc": 3,
    "name": "Mi♭ mayor",
    "relative": "Cm",
    "relativeName": "Do menor",
    "signature": "3 bemoles",
    "accidentals": [
      "Si♭",
      "Mi♭",
      "La♭"
    ]
  },
  {
    "root": "B♭",
    "pc": 10,
    "name": "Si♭ mayor",
    "relative": "Gm",
    "relativeName": "Sol menor",
    "signature": "2 bemoles",
    "accidentals": [
      "Si♭",
      "Mi♭"
    ]
  },
  {
    "root": "F",
    "pc": 5,
    "name": "Fa mayor",
    "relative": "Dm",
    "relativeName": "Re menor",
    "signature": "1 bemol",
    "accidentals": [
      "Si♭"
    ]
  }
];
const letters=['C','D','E','F','G','A','B'], natural=[0,2,4,5,7,9,11], solfege=['Do','Re','Mi','Fa','Sol','La','Si'];
const tonicNames=['C','D♭','D','E♭','E','F','F♯','G','A♭','A','B♭','B'];
function mod(n,m=12){return ((n%m)+m)%m}
function pitch(root){const letter=letters.indexOf(root[0]);return mod(natural[letter]+[...root.slice(1)].reduce((n,a)=>n+(a==='♯'||a==='#'?1:a==='♭'||a==='b'?-1:0),0))}
function spell(pc,letter){const i=mod(letter,7);let diff=mod(pc-natural[i]);if(diff>6)diff-=12;return letters[i]+(diff>0?'♯'.repeat(diff):'♭'.repeat(-diff))}
function name(root){return solfege[letters.indexOf(root[0])]+root.slice(1)}
function noteAt(root,semitones,degree){return degree===undefined?tonicNames[mod(pitch(root)+semitones)]:spell(pitch(root)+semitones,letters.indexOf(root[0])+degree)}
function scale(id,root){const s=scales.find(s=>s.id===id);if(!s)throw Error('Escala desconocida');return {...s,root,names:s.notes.map((n,i)=>noteAt(root,n,s.degrees?.[i]))}}
function chord(id,root){const c=chords.find(c=>c.id===id);if(!c)throw Error('Acorde desconocido');return {...c,root,symbol:root+c.suffix,names:c.notes.map((n,i)=>noteAt(root,n,c.degrees[i]))}}
function degreeFromRoman(roman){const s=roman.replace(/^[♭#♯]+/,'');const match=s.match(/^(vii|iii|vi|iv|ii|v|i)/i);return match?({i:0,ii:1,iii:2,iv:3,v:4,vi:5,vii:6})[match[1].toLowerCase()]:undefined}
function progression(id,root){
  const p=progressions.find(p=>p.id===id);if(!p)throw Error('Progresión desconocida');
  return {...p,root,chords:p.chords.map(item=>{
    // Applied and substituted dominants need their actual root spelling, not the label's Roman numeral.
    let degree=degreeFromRoman(item.roman);
    if(item.roman.includes('/ii'))degree=5;
    if(item.roman==='V7/V')degree=1;
    if(item.roman==='subV7')degree=1;
    const r=noteAt(root,item.offset,degree),c=chord(item.quality,r);
    return {...item,...c,midi:48+pitch(r),symbol:c.symbol+(item.bass!==undefined?'/'+noteAt(root,item.bass,4):'')};
  })};
}
function harmonize(id,root){
  const s=scale(id,root);if(s.notes.length!==7)return [];
  return s.notes.map((n,i)=>{
    const offsets=[0,2,4].map(k=>{const j=i+k;return s.notes[j%7]+Math.floor(j/7)*12-n});
    const type=chords.find(c=>c.notes.length===3&&c.notes.every((v,j)=>v===offsets[j]));
    return {degree:i+1,root:s.names[i],type:type?.id,notes:offsets,symbol:s.names[i]+(type?type.suffix:' (otra tríada)'),names:[0,2,4].map(k=>s.names[(i+k)%7])};
  });
}
function invert(notes,index){const a=[...notes].sort((x,y)=>x-y);for(let i=0;i<index;i++){let n=a.shift()+12;while(a.length&&n<=a.at(-1))n+=12;a.push(n)}return a}
function leadVoices(notes,previous){
  let best=[...notes],score=Infinity;
  for(let inv=0;inv<notes.length;inv++){
    const rotated=invert(notes,inv);
    for(const shift of [-12,0,12]){
      const candidate=rotated.map(n=>n+shift);if(candidate[0]<45||candidate.at(-1)>88)continue;
      const distance=previous?candidate.reduce((s,n,i)=>s+Math.abs(n-previous[Math.min(i,previous.length-1)]),0):candidate.reduce((s,n)=>s+Math.abs(n-64),0);
      if(distance<score){score=distance;best=candidate}
    }
  }
  return best;
}
return {scales,chords,progressions,circle,tonicNames,mod,pitch,spell,name,noteAt,scale,chord,progression,harmonize,invert,leadVoices};
})();
