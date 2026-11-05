# NyxAnd

Portafolio personal de **Dereck Andreh Callejas Ajin**, estudiante de Ingeniería en Ciencias de la Computación en la Universidad del Valle de Guatemala.

Es un sitio de una sola página construido desde cero, sin plantillas: un fondo de seda líquida renderizado en tiempo real con WebGL2, un logo de cristal que se deforma con el puntero y una narrativa guiada por el scroll que lleva a mis proyectos, mi experiencia y mi contacto.

> Este repositorio es público para mostrar mi trabajo, no para reutilizarlo. Todo el código, el diseño y el contenido son propiedad de su autor. Consulta la [licencia](#licencia).

---

## Contenido

- [Qué incluye](#qué-incluye)
- [Tecnologías](#tecnologías)
- [Cómo ejecutarlo](#cómo-ejecutarlo)
- [Estructura](#estructura)
- [Editar el contenido](#editar-el-contenido)
- [Rendimiento](#rendimiento)
- [Accesibilidad](#accesibilidad)
- [Licencia](#licencia)
- [Créditos de terceros](#créditos-de-terceros)
- [Contacto](#contacto)

## Qué incluye

**Hero en WebGL2**
- Fondo de seda líquida con shaders propios: bandas suavizadas con Catmull-Rom, deformación encadenada y respuesta al puntero.
- Logo graffiti «Andreh» de acrílico biselado. Se genera como campo de distancia en un Web Worker y el shader calcula el bisel, la refracción y los reflejos. Ondula, se hincha bajo el puntero y se derrite al hacer scroll.
- Alambres cromados que cambian de tono según el fondo que tienen detrás.
- Panel esmerilado con la hora de Guatemala en vivo y el avance del scroll.

**Recorrido con scroll**
- Escena «NYXAND»: el líquido vive dentro de letras recortadas en un velo negro y la cámara entra por la X.
- Índice de secciones con tarjetas que se inclinan con el puntero e iluminan el fondo.
- «Sobre mí» como tarjeta de perfil: banner, insignia de píxeles, reproductor que controla un carrusel de fotos propias y círculos de herramientas.
- Galería horizontal de proyectos que se tuerce con la velocidad del scroll.
- Recorrido profesional con líneas que se trazan solas y contacto con cinta en movimiento.

**Navegación**
- Menú de pausa al estilo de un videojuego. Se abre con <kbd>Esc</kbd>, desde los botones del hero o con el botón fijo, y congela el líquido mientras está abierto.
- Desplazamiento suave con Lenis y anclas internas.
- Cursor propio que indica la acción disponible.

## Tecnologías

| Área | Herramienta |
| --- | --- |
| Base | [Vite](https://vite.dev) y [TypeScript](https://www.typescriptlang.org) en modo estricto, sin framework |
| Gráficos | WebGL2 con shaders GLSL escritos a mano, Web Worker y `OffscreenCanvas` |
| Animación | [GSAP](https://gsap.com) con ScrollTrigger y SplitText |
| Scroll | [Lenis](https://lenis.darkroom.engineering) |
| Tipografía | Inter Tight, Archivo y Anton, servidas localmente con [Fontsource](https://fontsource.org) |

## Cómo ejecutarlo

Requisitos: Node.js 20 o superior.

```bash
npm install
npm run dev        # servidor de desarrollo en http://localhost:5173
npm run build      # comprueba tipos y genera /dist
npm run preview    # sirve la versión de producción
```

Parámetros útiles para revisar el sitio:

| Parámetro | Efecto |
| --- | --- |
| `?freeze` | Congela el líquido en su primer fotograma |
| `?static` | Desactiva las animaciones de scroll |

El sitio respeta la preferencia del sistema `prefers-reduced-motion`: con ella activa, se muestra sin animaciones.

## Estructura

```text
src/
├── main.ts              Punto de entrada: monta el marcado e inicia cada módulo
├── style.css            Estilos del hero y variables globales
├── hero/
│   ├── content.ts       Todo el texto, enlaces, proyectos y fotos del sitio
│   ├── markup.ts        Marcado del hero
│   ├── renderer.ts      Bucle WebGL2: líquido, logo, alambres y panel
│   ├── shaders.ts       Shaders GLSL
│   ├── liquid.ts        Bandas del fondo
│   ├── logo.ts          Trazos del logo y campo de distancia
│   ├── logo.worker.ts   Cálculo del campo fuera del hilo principal
│   ├── wires.ts         Alambres cromados
│   ├── interactions.ts  Reloj y progreso de scroll
│   └── state.ts         Estado compartido entre el lienzo y las animaciones
└── site/
    ├── sections.ts      Marcado de las secciones
    ├── sections.css     Estilos de las secciones
    ├── motion.ts        Lenis y todas las animaciones de scroll
    ├── about.ts         Carrusel y reproductor del perfil
    ├── pause.ts         Menú de pausa
    ├── pause.css        Estilos del menú de pausa
    └── cursor.ts        Cursor propio
public/
├── media/               Capturas de proyectos y fotos en WebP
└── cv-andreh-callejas.pdf
```

## Editar el contenido

Los textos, proyectos, experiencia, enlaces y fotos están centralizados en [`src/hero/content.ts`](src/hero/content.ts). Para cambiar un dato no hace falta tocar el marcado ni los estilos.

## Rendimiento

Medido con Lighthouse 12 sobre la versión de producción el 5 de noviembre de 2026:

| Perfil | Rendimiento | Accesibilidad | Buenas prácticas | SEO |
| --- | --- | --- | --- | --- |
| Escritorio | 96 | 95 | 100 | 100 |
| Móvil (simulado) | 79 a 91 | 95 | 100 | 100 |

En escritorio la página carga en 0,6 s (LCP) y no se desplaza durante la carga (CLS de 0). El sitio completo pesa unos 230 KB transferidos.

Decisiones que lo hacen posible:
- El campo de distancia del logo se calcula en un Web Worker y los shaders se compilan en paralelo con `KHR_parallel_shader_compile`.
- El líquido se renderiza a baja resolución y se escala en la composición, y en pantallas táctiles se dibuja con menos píxeles.
- Las animaciones de scroll se preparan en pasos pequeños cuando el navegador queda libre.
- El tono de las fotos viene horneado en las imágenes, sin filtros CSS en tiempo real.
- Si el equipo no sostiene unos 40 fps, el sitio baja la resolución por sí solo.

## Accesibilidad

- Navegación completa con teclado, incluido el menú de pausa: flechas, letras, <kbd>Enter</kbd> y <kbd>Esc</kbd>.
- Foco visible en todos los controles.
- Títulos animados con texto alternativo para lectores de pantalla.
- Respeto de `prefers-reduced-motion`.
- Alternativa estática si el navegador no admite WebGL2.

## Licencia

**Todos los derechos reservados.** Este portafolio no es software libre ni de código abierto.

Puedes ver el código y ejecutarlo en tu equipo solo para evaluarlo. No puedes copiarlo, modificarlo, publicarlo ni usarlo, total o parcialmente, como tu propio portafolio o en otro proyecto. Las fotos, el currículum, el logo «Andreh», la marca NyxAnd y los textos son personales y no se licencian.

Las condiciones completas están en [`LICENSE`](LICENSE). Para pedir permiso, escríbeme.

## Créditos de terceros

Las dependencias conservan sus propias licencias, que esta licencia no modifica:

- [GSAP](https://gsap.com), bajo su [licencia estándar sin costo](https://gsap.com/standard-license).
- [Lenis](https://github.com/darkroomengineering/lenis), bajo licencia MIT.
- Inter Tight, Archivo y Anton, bajo la SIL Open Font License 1.1.
- Vite (MIT) y TypeScript (Apache 2.0), como herramientas de desarrollo.

Las capturas de Orunei y Kaze son de proyectos propios. El arte de terceros que pueda aparecer en ellas pertenece a sus autores.

## Contacto

- Correo: [andrehcallex@gmail.com](mailto:andrehcallex@gmail.com)
- GitHub: [AndrehhX](https://github.com/AndrehhX)

© 2026 Dereck Andreh Callejas Ajin. NyxAnd.
