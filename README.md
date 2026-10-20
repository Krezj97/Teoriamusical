# Cadencia · Teoría musical

Aplicación educativa en español para aprender fundamentos de teoría musical y explorar conceptos avanzados.

## Incluye

- 20 lecciones en 10 etapas, con explicaciones, ejemplos, prácticas y preguntas.
- Piano de una octava con sonido sintetizado y atajos de teclado.
- Reproducción de escalas, acordes, inversiones y progresiones.
- Metrónomo de 40 a 200 BPM en 2/4, 3/4 y 4/4.
- Entrenamiento de intervalos ascendentes.
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
| `app.js` | Navegación, ejercicios, audio y progreso |

Los scripts se cargan con `defer`, primero el contenido y después la aplicación.

## Alcance actual

Esta es la versión inicial trasladada desde el prototipo de la conversación, con el código separado para facilitar cambios. El recorrido introduce conceptos de fundamentos a armonía avanzada; no equivale a una formación profesional completa.

El progreso se guarda por navegador y origen; no se sincroniza entre dispositivos ni se transfiere automáticamente desde la vista previa de ChatGPT. La app no usa cuentas ni servidor. El piano utiliza síntesis de onda triangular, no muestras de un piano acústico.

## Comprobación manual

1. Abre el recorrido y una lección; una respuesta incorrecta no debe aprobarla y una correcta debe sumar progreso una sola vez.
2. Recarga y comprueba que el progreso permanece si el navegador permite almacenamiento local.
3. En el laboratorio, prueba el piano, las escalas, los acordes, sus inversiones y las progresiones.
4. Inicia el metrónomo, cambia tempo y compás y verifica que se detiene al navegar o al ocultar la pestaña.
5. En oído, escucha y responde: cada pregunta debe contabilizarse una sola vez.
6. Revisa la navegación en móvil y el diálogo de reinicio: cancelar conserva el progreso y confirmar lo borra.

## Publicación

Los archivos son estáticos y pueden alojarse en un servidor web o GitHub Pages. La carga al repositorio no activa automáticamente una web pública.
