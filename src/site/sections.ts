import { about, experience, highlights, links, projectImages, projects, slides } from "../hero/content";

const external = 'target="_blank" rel="noopener noreferrer"';

// Título oscuro de cada sección: etiqueta pequeña, palabra grande, punto y coma, firma y subrayado a mano.
const title = (small: string, word: string, tail: string, id: string, ink = false) => `
  <h2 class="dtitle${ink ? " dtitle--ink" : ""}" id="${id}">
    <svg class="dtitle__scratch" viewBox="0 0 400 200" preserveAspectRatio="none" aria-hidden="true">
      <path pathLength="1" d="M40 182 L250 18"/><path pathLength="1" d="M118 190 L292 34"/>
    </svg>
    <span class="sr-only">${word}</span>
    <span class="dtitle__small dtitle__small--start" aria-hidden="true">${small}</span>
    <span class="dtitle__row" aria-hidden="true"><span class="dtitle__word">${word}</span><span class="dtitle__semi">;</span><span class="dtitle__small dtitle__small--end">${tail}</span></span>
    <svg class="dtitle__swoosh" viewBox="0 0 400 24" preserveAspectRatio="none" aria-hidden="true">
      <path pathLength="1" d="M6 15 C 90 7, 210 3, 300 7 S 380 13, 394 9"/>
    </svg>
  </h2>`;

const icon = (d: string, extra = "") => `<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true" ${extra}>${d}</svg>`;
const icons = {
  search: icon('<path fill-rule="evenodd" d="M6.8 1.5a5.3 5.3 0 0 1 4.3 8.4l3.6 3.6-1.5 1.5-3.6-3.6A5.3 5.3 0 1 1 6.8 1.5Zm0 2.3a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"/>'),
  back: icon('<path d="M8 2.2a5.8 5.8 0 1 1-5.6 7.3l1.6-.4A4.2 4.2 0 1 0 5.1 5L6.6 6.5H2V1.9l1.9 1.9A5.8 5.8 0 0 1 8 2.2Z"/>'),
  fwd: icon('<path d="M8 2.2a5.8 5.8 0 1 0 5.6 7.3l-1.6-.4A4.2 4.2 0 1 1 10.9 5L9.4 6.5H14V1.9l-1.9 1.9A5.8 5.8 0 0 0 8 2.2Z"/>'),
  pause: icon('<rect x="3.5" y="2.5" width="3" height="11" rx="0.6"/><rect x="9.5" y="2.5" width="3" height="11" rx="0.6"/>', 'data-icon="pause"'),
  play: icon('<path d="M4 2.4v11.2a.6.6 0 0 0 .9.5l9-5.6a.6.6 0 0 0 0-1L4.9 1.9a.6.6 0 0 0-.9.5Z"/>', 'data-icon="play" hidden'),
  share: icon('<path d="M3 9v4.2c0 .5.3.8.8.8h8.4c.5 0 .8-.3.8-.8V9h-1.6v3.4H4.6V9Zm5-7.4L4.6 5l1.1 1.1 1.5-1.5V10h1.6V4.6l1.5 1.5L11.4 5Z"/>'),
  quote: icon('<path d="M2 9.6C2 6.5 3.6 4.4 6.3 3.6l.6 1.3C5.5 5.5 4.8 6.5 4.7 7.7h2v5H2Zm7.3 0c0-3.1 1.6-5.2 4.3-6l.6 1.3c-1.4.6-2.1 1.6-2.2 2.8h2v5H9.3Z"/>'),
};

// Calavera de píxeles dibujada a mano en una rejilla de 11 x 11.
const SKULL = [
  "..#######..",
  ".#########.",
  "###########",
  "###..#..###",
  "##...#...##",
  "###..#..###",
  "#####.#####",
  ".####.####.",
  "..#######..",
  "..#.#.#.#..",
  "..#######..",
];
const skull = `<svg class="pixel" viewBox="0 0 11 11" shape-rendering="crispEdges" aria-hidden="true">${SKULL.flatMap((row, y) =>
  [...row].map((c, x) => (c === "#" ? `<rect x="${x}" y="${y}" width="1" height="1"/>` : "")),
).join("")}</svg>`;

const slide = (s: (typeof slides)[number], i: number) => `
  <li class="slide${s.image ? "" : " slide--type"}" data-index="${i}" aria-label="${s.stamp}">
    ${s.image ? `<img src="${s.image}" alt="" loading="lazy" decoding="async"${s.focus ? ` style="object-position:${s.focus}"` : ""} />` : `<span class="slide__shot"></span><span class="slide__word" aria-hidden="true">${s.stamp}</span>`}
    <span class="slide__stamp" aria-hidden="true"><b>${s.stamp}</b><b>${s.stamp}</b></span>
    <span class="slide__shade" aria-hidden="true"></span>
  </li>`;

const card = (p: (typeof projects)[number]) => {
  const img = projectImages[p.name];
  return `
  <li class="work__card" data-cursor="${p.demo ? "Abrir" : p.code ? "Código" : "Pronto"}">
    <div class="work__media${img ? "" : " work__media--type"}">
      ${img ? `<img src="${img}" alt="Captura de ${p.name}" loading="lazy" decoding="async" />` : `<span class="slide__shot"></span>`}
      <span class="work__name">${p.name}</span>
    </div>
    <div class="work__info">
      <p class="work__kind">${p.kind}</p>
      <p class="work__summary">${p.summary}</p>
      <p class="work__stack">${p.stack.join(", ")}</p>
      <p class="work__links">
        ${p.demo ? `<a href="${p.demo}" ${external}>Abrir demo</a>` : ""}
        ${p.code ? `<a href="${p.code}" ${external}>Ver código</a>` : ""}
        ${p.status ? `<span>${p.status}</span>` : ""}
      </p>
    </div>
  </li>`;
};

const options = [
  { href: "#sobre-mi", word: "Sobre mí", hint: "Quién soy, qué estudio y con qué trabajo." },
  { href: "#proyectos", word: "Proyectos", hint: "Lo que he construido, con demo y código." },
  { href: "#recorrido", word: "Recorrido", hint: "Experiencia, hackathon y formación." },
  { href: "#contacto", word: "Hablemos", hint: "Correo, GitHub y currículum." },
];

export const sectionsMarkup = `
  <section class="knock" aria-label="NyxAnd">
    <div class="knock__pin">
      <svg class="knock__svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <defs>
          <mask id="knock-mask" maskUnits="userSpaceOnUse" x="-6000" y="-6000" width="13600" height="12900">
            <rect x="-6000" y="-6000" width="13600" height="12900" fill="#fff"/>
            <g class="knock__word"><text x="800" y="470" text-anchor="middle" dominant-baseline="central" textLength="1420" lengthAdjust="spacingAndGlyphs">NYXAND</text></g>
          </mask>
        </defs>
        <rect class="knock__veil" x="-6000" y="-6000" width="13600" height="12900" mask="url(#knock-mask)"/>
        <g class="knock__word knock__outline"><text x="800" y="470" text-anchor="middle" dominant-baseline="central" textLength="1420" lengthAdjust="spacingAndGlyphs">NYXAND</text></g>
      </svg>
      <p class="knock__line knock__line--top">sigue bajando</p>
      <p class="knock__line knock__line--bottom">código, interfaces y automatización</p>
    </div>
  </section>

  <section class="options" aria-labelledby="t-opciones">
    ${title("elige por dónde", "Empezar", "índice", "t-opciones")}
    <ul class="options__grid">
      ${options
        .map(
          (o) => `<li><a class="option" href="${o.href}" data-cursor="Ir">
            <span class="option__word">${o.word}</span>
            <span class="option__hint">${o.hint}</span>
          </a></li>`,
        )
        .join("")}
    </ul>
  </section>

  <section class="about" id="sobre-mi" aria-labelledby="t-sobre">
    <div class="pcard">
      <div class="pcard__banner">
        <span class="pcard__shot" aria-hidden="true"></span>
        <span class="pcard__chip pcard__chip--start">nyxand</span>
        <span class="pcard__chip pcard__chip--end">guatemala</span>
        ${title("un poco", "Sobre mí", "andreh", "t-sobre", true)}
      </div>
      <div class="pcard__badge">${skull}</div>

      <div class="pcard__row">
        <a class="pill pill--search" href="${links.github}" ${external}><span>andrehhx en github</span>${icons.search}</a>
        <div class="pill pill--meter" role="presentation"><span class="pill__fill"></span></div>
      </div>

      <div class="player" role="group" aria-label="Controles del carrusel">
        <button type="button" data-prev aria-label="Diapositiva anterior">${icons.back}</button>
        <button type="button" data-toggle aria-label="Pausar el carrusel">${icons.pause}${icons.play}</button>
        <button type="button" data-next aria-label="Diapositiva siguiente">${icons.fwd}</button>
        <span class="player__time" data-elapsed>0:00</span>
        <input class="player__range" type="range" min="0" max="1000" value="0" aria-label="Posición del carrusel" />
        <span class="player__time" data-remaining>-0:00</span>
        <button type="button" data-share aria-label="Compartir perfil">${icons.share}</button>
      </div>

      <div class="carousel" role="region" tabindex="0" aria-roledescription="carrusel" aria-label="Momentos y proyectos">
        <ul class="carousel__track">${slides.map(slide).join("")}</ul>
        <span class="carousel__quote" aria-hidden="true">${icons.quote}</span>
      </div>
      <p class="pcard__caption" aria-live="polite"></p>

      <ul class="highlights" aria-label="Herramientas">
        ${highlights
          .map(
            (h, i) => `<li class="highlight">
              <span class="highlight__ring"><span class="highlight__face">${h.short}</span></span>
              <span class="highlight__label">#${String(i + 1).padStart(3, "0")} ${h.name}</span>
            </li>`,
          )
          .join("")}
      </ul>

      <div class="pcard__text">
        <p class="pcard__lead">${about.lead}</p>
        <p class="pcard__body">${about.body}</p>
      </div>

      <div class="pcard__actions">
        <a class="pbtn" href="${links.cv}" ${external}>Ver currículum</a>
        <button class="pbtn" type="button" data-share>Compartir perfil</button>
      </div>
      <p class="toast" role="status" hidden>Enlace copiado</p>
    </div>
  </section>

  <section class="work" id="proyectos" aria-labelledby="t-proyectos">
    <div class="work__pin">
      <div class="work__head">${title("lo que", "Construyo", "proyectos", "t-proyectos")}</div>
      <ul class="work__track">${projects.map(card).join("")}</ul>
    </div>
  </section>

  <section class="path" id="recorrido" aria-labelledby="t-recorrido">
    ${title("mi", "Recorrido", "2025 a 2026", "t-recorrido")}
    <ol class="path__list">
      ${experience
        .map(
          (e) => `<li class="path__item">
            <span class="path__line" aria-hidden="true"></span>
            <p class="path__period">${e.period}</p>
            <h3 class="path__role">${e.role}</h3>
            <p class="path__place">${e.place}</p>
            <p class="path__detail">${e.detail}</p>
          </li>`,
        )
        .join("")}
    </ol>
    <p class="path__skills">${about.skills.join(", ")}</p>
  </section>

  <section class="contact" id="contacto" aria-labelledby="t-contacto">
    ${title("escríbeme", "Hablemos", "nyxand", "t-contacto")}
    <a class="contact__mail" href="mailto:${links.email}" data-cursor="Escribir">${links.email}</a>
    <p class="contact__links">
      <a href="${links.github}" ${external}>GitHub</a>
      <a href="${links.cv}" ${external}>Currículum</a>
    </p>
    <div class="marquee" aria-hidden="true">
      <div class="marquee__track">${"<span>Disponible para proyectos</span><span>NyxAnd</span>".repeat(6)}</div>
    </div>
    <p class="contact__foot">NyxAnd, Dereck Andreh Callejas Ajin, Guatemala, 2026.</p>
  </section>`;
