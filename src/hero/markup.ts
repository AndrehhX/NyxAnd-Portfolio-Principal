import { sectionsMarkup } from "../site/sections";
import { content as c, links, projects } from "./content";

const icon = (path: string) =>
  `<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">${path}</svg>`;

const icons = {
  menu: icon('<rect x="2" y="2.5" width="12" height="1.4"/><rect x="2" y="6" width="12" height="1.4"/><rect x="2" y="9.5" width="12" height="1.4"/><rect x="2" y="13" width="12" height="1.4"/>'),
  list: icon('<path fill-rule="evenodd" d="M2.6 3h10.8A1.6 1.6 0 0 1 15 4.6v6.8a1.6 1.6 0 0 1-1.6 1.6H2.6A1.6 1.6 0 0 1 1 11.4V4.6A1.6 1.6 0 0 1 2.6 3Zm.4 2.6v1.2h10V5.6Zm0 2.3v1.2h10V7.9Zm0 2.3v1.2h10v-1.2Z"/>'),
  search: icon('<path fill-rule="evenodd" d="M6.8 1.5a5.3 5.3 0 0 1 4.3 8.4l3.6 3.6-1.5 1.5-3.6-3.6A5.3 5.3 0 1 1 6.8 1.5Zm0 2.3a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"/>'),
  doc: icon('<path fill-rule="evenodd" d="M2.8 1h10.4A1.8 1.8 0 0 1 15 2.8v10.4a1.8 1.8 0 0 1-1.8 1.8H2.8A1.8 1.8 0 0 1 1 13.2V2.8A1.8 1.8 0 0 1 2.8 1Zm.4 2v3.4h4V3Zm6 .6v1.2h3.6V3.6Zm0 2.2V7h3.6V5.8ZM3.2 8.6v1.2h9.6V8.6Zm0 2.4v1.2h9.6V11Z"/>'),
  check: icon('<path fill-rule="evenodd" d="M8 1a7 7 0 1 1 0 14A7 7 0 0 1 8 1Zm0 2.1a4.9 4.9 0 1 0 0 9.8 4.9 4.9 0 0 0 0-9.8Zm3.1 2.7 1 1.1-4.6 4.5-3-2.9 1.1-1.1 1.9 1.8Z"/>'),
};

const external = 'target="_blank" rel="noopener noreferrer"';
const sectionLinks = c.sections.map((s) => `<li><a href="#${s.id}">${s.label}</a></li>`).join("");

// Destinos que aparecen en el menú y en la búsqueda.
const destinations = [
  ...c.sections.map((s) => ({ label: s.label, hint: "Sección", href: `#${s.id}`, ext: false })),
  ...projects.map((p) => ({ label: p.name, hint: p.kind, href: p.demo ?? p.code ?? "#proyectos", ext: !!(p.demo ?? p.code) })),
  { label: "Currículum", hint: "PDF", href: links.cv, ext: true },
  { label: "GitHub", hint: "AndrehhX", href: links.github, ext: true },
];

export const heroMarkup = `
  <canvas class="stage" aria-hidden="true"></canvas>
  <div class="grain" aria-hidden="true"></div>
  <div class="cursor" aria-hidden="true"><span class="cursor__label"></span></div>
  <div class="stage-fallback" aria-hidden="true"></div>

  <main>
    <section class="hero" id="inicio">
      <header class="ui">
        <a class="brand at" style="--x:65;--y:59" href="#inicio">${c.brand}</a>
        <nav class="topnav" aria-label="Principal">
          <button class="iconbtn at" data-open-menu style="--x:229;--y:51" type="button" aria-label="Abrir menú">${icons.menu}</button>
          <ul>${sectionLinks}</ul>
        </nav>
        <a class="tag at" style="--x:485;--y:51" href="${links.github}" ${external}>GitHub</a>
      </header>

      <div class="toolbar">
        <a class="iconbtn at" style="--x:272;--y:131.5" href="#proyectos" aria-label="Ver proyectos" title="Proyectos">${icons.list}</a>
        <button class="iconbtn at" data-open-menu style="--x:342;--y:131.5" type="button" aria-label="Buscar en el portafolio" title="Buscar">${icons.search}</button>
        <a class="iconbtn at" style="--x:358;--y:131.5" href="${links.cv}" ${external} aria-label="Abrir currículum" title="Currículum">${icons.doc}</a>
        <a class="iconbtn at" style="--x:374;--y:131.5" href="#contacto" aria-label="Ir a contacto" title="Contacto">${icons.check}</a>
        <a class="profile at" style="--x:462;--y:131" href="#sobre-mi">Sobre mí</a>
      </div>

      <h1 class="wordmark">
        <span class="sr-only">${c.logoAlt}</span>
        <span class="edition at" style="--x:368;--y:257">${c.role}</span>
      </h1>
      <p class="cost at" style="--x:522;--y:150">${c.year}</p>

      <a class="side at" style="--x:55.5;--y:152" href="#proyectos">Baja</a>
      <p class="side at" style="--x:55.5;--y:192">Guatemala</p>
      <p class="side side--down at" style="--x:672.5;--y:240.5">Andreh</p>
      <p class="side side--down at" style="--x:672.5;--y:274">${c.year}</p>

      <aside class="panel">
        <div class="ring">
          <svg class="ring__art" viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="50" cy="50" r="48.5" pathLength="100" class="ring__dim"/>
            <circle cx="50" cy="50" r="48.5" pathLength="100" class="ring__arc" data-clock-arc stroke-dasharray="74 26"/>
          </svg>
          <p class="ring__title" data-clock>--:--</p>
          <p class="ring__detail">Guatemala</p>
        </div>
        <a class="ring" href="#proyectos">
          <svg class="ring__art" viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="50" cy="50" r="48.5" pathLength="100" class="ring__dim"/>
            <circle cx="50" cy="50" r="48.5" pathLength="100" class="ring__arc" data-scroll-arc stroke-dasharray="0 100"/>
          </svg>
          <span class="ring__title">Proyectos</span>
          <span class="ring__detail">${String(projects.length).padStart(2, "0")}</span>
        </a>
      </aside>

      <footer class="ui">
        <div class="mark">
          <a class="mark__logo" href="#inicio">${c.mark}<span class="mark__dot"></span></a>
          <nav aria-label="Secundaria">
            <ul class="mark__nav">
              <li><a href="#inicio">Inicio</a></li>
              <li><a href="#proyectos">Trabajo</a></li>
              <li><a href="${links.cv}" ${external}>CV</a></li>
              <li><a href="#contacto">Hablemos</a></li>
            </ul>
          </nav>
        </div>
        <a class="tag at" style="--x:435;--y:369" href="mailto:${links.email}">Correo</a>
        <a class="tag at" style="--x:466;--y:369" href="${links.github}" ${external}>Código</a>
        <p class="counter at" style="--x:672;--y:368" data-scroll-count aria-hidden="true">00</p>
      </footer>
    </section>

    ${sectionsMarkup}
  </main>

  <dialog class="menu" aria-label="Menú y búsqueda">
    <form method="dialog" class="menu__head">
      <label class="sr-only" for="menu-search">Buscar proyectos y secciones</label>
      <input id="menu-search" type="search" placeholder="Buscar proyectos y secciones" autocomplete="off" />
      <button type="submit">Cerrar</button>
    </form>
    <ul class="menu__list">
      ${destinations
        .map(
          (d) => `<li data-search="${`${d.label} ${d.hint}`.toLowerCase()}">
            <a href="${d.href}" ${d.ext ? external : ""}><span>${d.label}</span><small>${d.hint}</small></a>
          </li>`,
        )
        .join("")}
    </ul>
    <p class="menu__empty" hidden>Sin resultados. Prueba con el nombre de un proyecto.</p>
  </dialog>`;
