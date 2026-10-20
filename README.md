# Cadencia · Teoría musical

Aplicación educativa en español para aprender fundamentos de teoría musical y explorar conceptos avanzados.

## Incluye

- 20 lecciones en 10 etapas, con 60 secciones de desarrollo, ejemplos resueltos, prácticas, cuaderno y 60 preguntas en total.
- Piano de una octava con muestras reales Salamander Grand Piano (Yamaha C5), polifonía y atajos de teclado.
- Reproducción de escalas, acordes, inversiones y progresiones.
- Metrónomo de 40 a 200 BPM en 2/4, 3/4 y 4/4.
- Entrenamiento de intervalos ascendentes.
- Reverb estéreo opcional con cantidad ajustable, volumen y preferencias persistentes.
- Progreso guardado en el navegador mediante localStorage.

## Ejecutar

No requiere instalación, dependencias ni compilación. Descarga el repositorio y abre `index.html` en un navegador moderno.

Para trabajar desde un servidor local, si tienes Python instalado:

```sh
python3 -m http.server 8000
```

Abre http://localhost:8000 y pulsa un control de reproducción para activar el sonido.

## Estructura

| Archivo | Responsabilidad |
| --- | --- |
| `index.html` | Estructura y navegación principal |
| `styles.css` | Diseño adaptable a móvil y escritorio |
| `lessons.js` | Contenido de las 20 lecciones y sus preguntas |
| `app.js` | Navegación, evaluación, cuaderno, controles y progreso |
| `audio.js` | Carga de muestras, reproducción polifónica y reverb |
| `lesson-details.js` | Desarrollo ampliado, ejemplos resueltos y preguntas adicionales |
| `THIRD_PARTY_NOTICES.md` | Fuente, licencia y atribución del piano |

Los scripts se cargan con `defer`: contenido base, desarrollo ampliado, motor de sonido y aplicación.

## Alcance actual

Esta es la versión inicial trasladada desde el prototipo de la conversación, con el código separado para facilitar cambios. El recorrido introduce conceptos de fundamentos a armonía avanzada; no equivale a una formación profesional completa.

El progreso se guarda por navegador y origen; no se sincroniza entre dispositivos ni se transfiere automáticamente desde la vista previa de ChatGPT. La app no usa cuentas ni servidor. El piano usa 17 muestras MP3 (unos 1,1 MB de descarga comprimida), cargadas al activar el sonido. Requiere conexión para la carga inicial; tiene origen alternativo y reintento ante errores. No sustituye silenciosamente un fallo por un sintetizador. El metrónomo funciona sin descargar las muestras y queda fuera de la reverb. La reverb está apagada por defecto. Las grabaciones son de Alexander Holm, CC BY 3.0; consulta THIRD_PARTY_NOTICES.md.

## Comprobación manual

1. Abre el recorrido y una lección; una respuesta incorrecta no debe aprobarla y cada respuesta correcta debe dar una explicación. Las tres preguntas deben resolverse para aprobar; el progreso se suma una sola vez.
2. Recarga y comprueba que el progreso permanece si el navegador permite almacenamiento local.
3. En el laboratorio, carga el piano, prueba notas simultáneas y compara reverb apagada/encendida, 0%/60% y volumen. Prueba escalas, acordes (incluida tercera inversión en séptimas) y progresiones.
4. Inicia el metrónomo, cambia tempo y compás y verifica que se detiene al navegar o al ocultar la pestaña.
5. En oído, escucha y responde: cada pregunta debe contabilizarse una sola vez.
6. Abre una lección, escucha su ejemplo, escribe en el cuaderno, entra al laboratorio y vuelve a la lección. Comprueba notas guardadas tras recargar.
7. Revisa la navegación en móvil y el diálogo de reinicio: cancelar conserva el progreso y confirmar lo borra.

## Publicación

Los archivos son estáticos y pueden alojarse en un servidor web o GitHub Pages. La carga al repositorio no activa automáticamente una web pública.

## Pruebas de regresión

Con Node.js instalado, ejecuta:

```sh
node tests/regression.cjs
```

La suite comprueba carga compartida de las 17 muestras, reutilización de buffers, origen alternativo, errores de descarga, cancelación al navegar, controles del grafo de audio, contenido y preguntas, aprobación completa sin duplicados, cuaderno, navegación y tercera inversión.

Estas comprobaciones usan dobles de Web Audio y un DOM mínimo. No sustituyen una prueba de calidad audible, latencia, diseño o compatibilidad en un navegador real.
