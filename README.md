# Cadencia · Entiende, escucha y crea música

Escuela interactiva de teoría musical en español, sin dependencias de compilación.

Web: https://krezj97.github.io/Teoriamusical/

## Recorrido y biblioteca

- 30 lecciones en 15 etapas: fundamentos, lectura, ritmo, intervalos, tonalidad, acordes, función, modos, textura y composición.
- 90 secciones de desarrollo y 90 preguntas de lección.
- Ejemplos resueltos, audio, diagramas vectoriales, actividades y cuaderno local.
- 10 guías de profundización accesibles desde la biblioteca.
- Los IDs de las 20 lecciones anteriores se conservan para mantener el progreso.

## Laboratorio

- 24 escalas: diatónicas, siete modos, menores, pentatónicas, blues, simétricas y colores avanzados.
- 25 tipos de acorde: tríadas, suspendidos, añadidos, séptimas, novenas y dominante trece.
- 28 progresiones: cadencias, pop, jazz, menor, intercambio modal, dominantes, modos, texturas y blues de 12 compases.
- Transporte a 12 tónicas, escritura de notas, acordes en bloque o arpegios, tempo de progresión, repetición y enlaces cercanos.
- Armonización por tríadas de las colecciones de siete notas.
- Piano de una octava con teclado físico A W S E D F T G Y H U J K.
- Metrónomo independiente de 40 a 200 BPM en 2/4, 3/4 y 4/4.

Los enlaces cercanos son una heurística de desplazamiento entre disposiciones; no sustituyen reglas de conducción de un estilo. Para acordes extendidos, las rotaciones se presentan como voicings. El C13 de la biblioteca omite quinta y oncena explícitamente.

## Círculo de quintas

Doce tonalidades seleccionables, armaduras, relativas menores, IV y V, escala y ii–V–I reproducibles. La guía de seis pasos explica quintas, armaduras, relativos, acordes, modulación y la costura enarmónica entre Fa♯/Sol♭ y Do♯/Re♭. Las notas de IV y V conservan su escritura tonal correcta aunque una posición de la rueda use su equivalente enarmónico.

## Entrenamiento

Nueve modalidades con preguntas generadas en dos niveles:

1. Lectura en pentagrama.
2. Intervalos por semitonos.
3. Grados de escalas.
4. Notas de acordes.
5. Armaduras y relativas menores.
6. Completar ii–V–I.
7. Duraciones rítmicas.
8. Intervalos auditivos (el nivel avanzado incluye descenso y simultaneidad).
9. Cualidades de acordes por oído.

Cada ejercicio cuenta un solo intento y muestra una explicación. Las respuestas auditivas esperan a que termine el ejemplo. Las estadísticas se guardan por navegador; los totales auditivos de la versión anterior se migran al área nueva.

## Sonido

Salamander Grand Piano, grabado de un Yamaha C5 por Alexander Holm, bajo CC BY 3.0. La app usa 19 muestras MP3, aproximadamente 1,3 MB de descarga inicial, con fuente alternativa y reintento. El audio necesita conexión para descargar las muestras. Reverb estéreo opcional, volumen y preferencias guardados localmente. El metrónomo no recibe la reverb.

Créditos y tratamiento de las muestras: [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## Ejecutar localmente

No requiere instalación ni build. Para servir todos los archivos:

```sh
python3 -m http.server 8000
```

Abre http://localhost:8000 y pulsa Cargar piano. Un servidor local evita diferencias de comportamiento del almacenamiento o peticiones desde file://.

## Estructura

| Archivo | Responsabilidad |
| --- | --- |
| index.html | Estructura, navegación y controles de sonido |
| styles.css | Diseño adaptable a móvil y escritorio |
| app.js | Recorrido, lector de lecciones, progreso y navegación |
| music.js | Catálogo, escritura, transporte, armonización y voicings |
| visuals.js | Diagramas SVG musicales |
| academy.js | Laboratorio, círculo, práctica y biblioteca |
| practice-data.js | Generador de ejercicios con soluciones y explicaciones |
| lessons.js | Contenido base de las 30 lecciones |
| lesson-details.js | Desarrollo, ejemplos, prácticas y evaluación ampliada |
| audio.js | Muestras, reproducción polifónica, volumen y reverb |
| assets/ | Nueve imágenes SVG originales de apoyo musical |
| tests/ | Regresiones de lógica, datos, audio y manejadores de interfaz |

Los scripts usan defer en orden de dependencias. Los diagramas son vectoriales y locales; no necesitan un proveedor externo de imágenes.

## Verificar

Con Node.js:

```sh
node tests/regression.cjs
node tests/music.cjs
```

Las pruebas cubren el modelo musical en las 12 tónicas, ortografía, rotaciones, progresiones, 720 variantes de ejercicios, carga/fallo de muestras, reverb, evaluación, cuaderno, controles de reproducción y navegación. Las pruebas de interfaz usan un DOM mínimo y las de audio, dobles de Web Audio. No comprueban diseño renderizado, compatibilidad real, latencia ni calidad audible.

Comprobación manual sugerida:

- En móvil y escritorio, abrir navegación, una lección nueva y sus diagramas; completar tres preguntas y guardar notas.
- Escuchar piano y reverb; cambiar entre las cuatro herramientas del laboratorio.
- Reproducir un blues, cambiar tempo y tónica, probar repetición y detener; navegar durante una reproducción.
- Comparar modos desde una misma tónica y escuchar sus tríadas.
- Cambiar las doce posiciones del círculo, especialmente Fa♯ y Re♭, y escuchar ii–V–I.
- Probar cada modalidad de ejercicio en ambos niveles; verificar bloqueos durante audio y conteo único.
- Recargar para comprobar progreso y estadísticas. Cancelar y confirmar el reinicio de progreso.

## Alcance y persistencia

El recorrido introduce herramientas desde fundamentos hasta temas avanzados. Una formación profesional requiere además repertorio, práctica instrumental, análisis y orientación docente. El porcentaje de la app mide lecciones aprobadas.

Progreso, cuaderno, estadísticas y preferencias se guardan por navegador y origen. No hay cuentas ni sincronización entre dispositivos. Al ampliar el curso se conserva cada aprobación anterior, aunque el porcentaje se calcule ahora sobre 30 lecciones.

## Publicación

GitHub Pages publica la rama main desde la raíz. Cada actualización conserva la identidad del repositorio y cambia conjuntamente los archivos necesarios.



## Perfiles locales y modo invitado (v7)

La aplicación sigue siendo estática y se aloja en GitHub Pages. Los perfiles son locales al navegador: no existe autenticación de servidor, recuperación de contraseña ni sincronización entre dispositivos. El formulario lo indica antes de registrarse. El usuario se normaliza; la contraseña (mínimo 12 caracteres) deriva una clave con PBKDF2-SHA-256, 600.000 iteraciones y sal aleatoria de 16 bytes. El progreso y el cuaderno se cifran con AES-GCM, un IV nuevo de 12 bytes por escritura y el nombre de usuario como dato autenticado. La contraseña y la clave no se guardan. Se requiere iniciar sesión tras recargar. Esto protege el almacenamiento en reposo; no equivale a una cuenta de servidor ni protege una sesión abierta frente a código del mismo origen.

El invitado usa memoria, sin persistir avance ni notas. Al recargar o salir se pierde. Los ajustes de audio son preferencias del navegador y sí se conservan. La importación del progreso anterior es explícita y no elimina los datos de origen. Los errores de guardado dejan la sesión abierta para poder reintentar.

El panel de piano se despliega dentro del contenido y ofrece piano de cola (muestras Salamander), suave y brillante (variaciones procesadas), eléctrico (síntesis aditiva) y pluck de cuerdas (síntesis de cuerda pulsada). Incluye tres registros, reverb y volumen.

Validación: `node tests/regression.cjs`, `node tests/music.cjs` y `node tests/profiles.cjs`.
