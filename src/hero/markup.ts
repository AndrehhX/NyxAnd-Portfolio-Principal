import { content as c } from "./content";

const icon = (path: string) =>
  `<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">${path}</svg>`;

const icons = {
  menu: icon('<rect x="2" y="2.5" width="12" height="1.4"/><rect x="2" y="6" width="12" height="1.4"/><rect x="2" y="9.5" width="12" height="1.4"/><rect x="2" y="13" width="12" height="1.4"/>'),
  list: icon('<path fill-rule="evenodd" d="M2.6 3h10.8A1.6 1.6 0 0 1 15 4.6v6.8a1.6 1.6 0 0 1-1.6 1.6H2.6A1.6 1.6 0 0 1 1 11.4V4.6A1.6 1.6 0 0 1 2.6 3Zm.4 2.6v1.2h10V5.6Zm0 2.3v1.2h10V7.9Zm0 2.3v1.2h10v-1.2Z"/>'),
  search: icon('<path fill-rule="evenodd" d="M6.8 1.5a5.3 5.3 0 0 1 4.3 8.4l3.6 3.6-1.5 1.5-3.6-3.6A5.3 5.3 0 1 1 6.8 1.5Zm0 2.3a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"/>'),
  image: icon('<path fill-rule="evenodd" d="M2.8 1h10.4A1.8 1.8 0 0 1 15 2.8v10.4a1.8 1.8 0 0 1-1.8 1.8H2.8A1.8 1.8 0 0 1 1 13.2V2.8A1.8 1.8 0 0 1 2.8 1Zm.4 2v3.4h4V3Zm6 .6v1.2h3.6V3.6Zm0 2.2V7h3.6V5.8ZM3 8.4v3.8c0 .5.3.8.8.8h8.4c.5 0 .8-.3.8-.8V9.6l-2.3-1.7-2.6 2.4-2-1.3-1.4 1Z"/>'),
  check: icon('<path fill-rule="evenodd" d="M8 1a7 7 0 1 1 0 14A7 7 0 0 1 8 1Zm0 2.1a4.9 4.9 0 1 0 0 9.8 4.9 4.9 0 0 0 0-9.8Zm3.1 2.7 1 1.1-4.6 4.5-3-2.9 1.1-1.1 1.9 1.8Z"/>'),
};

const links = (items: readonly string[]) =>
  items.map((label) => `<li><a href="#">${label}</a></li>`).join("");

// Cada anillo tiene un tramo tenue: el mismo corte que se ve en la referencia.
const ring = (title: string, detail: string, dim: string, rotate: number) => `
  <div class="ring">
    <svg class="ring__art" viewBox="0 0 100 100" aria-hidden="true">
      <g transform="rotate(${rotate} 50 50)">
        <circle cx="50" cy="50" r="48.5" pathLength="100" class="ring__dim"/>
        <circle cx="50" cy="50" r="48.5" pathLength="100" class="ring__arc" stroke-dasharray="${dim}"/>
      </g>
    </svg>
    <p class="ring__title">${title}</p>
    <p class="ring__detail">${detail}</p>
  </div>`;

export const heroMarkup = `
  <main class="hero">
    <canvas class="hero__canvas" aria-hidden="true"></canvas>
    <div class="hero__fallback" aria-hidden="true"></div>

    <header class="ui">
      <a class="brand at" style="--x:65;--y:59" href="#">${c.brand}</a>
      <nav class="topnav" aria-label="Principal">
        <button class="iconbtn at" style="--x:229;--y:51" type="button" aria-label="Abrir menú">${icons.menu}</button>
        <ul>${links(c.topNav)}</ul>
      </nav>
      <a class="tag at" style="--x:485;--y:51" href="#">${c.topRight}</a>
    </header>

    <div class="toolbar">
      <button class="iconbtn at" style="--x:272;--y:131.5" type="button" aria-label="Ver lista">${icons.list}</button>
      <button class="iconbtn at" style="--x:342;--y:131.5" type="button" aria-label="Buscar">${icons.search}</button>
      <button class="iconbtn at" style="--x:358;--y:131.5" type="button" aria-label="Ver imágenes">${icons.image}</button>
      <button class="iconbtn at" style="--x:374;--y:131.5" type="button" aria-label="Marcar como visto">${icons.check}</button>
      <a class="profile at" style="--x:462;--y:131" href="#">${c.profile}</a>
    </div>

    <h1 class="wordmark">
      <span class="sr-only">${c.logoAlt}</span>
      <span class="edition at" style="--x:366.8;--y:249">${c.edition}</span>
    </h1>
    <p class="cost at" style="--x:466;--y:165.5">${c.cost}</p>

    <p class="side at" style="--x:55.5;--y:152">${c.sideLeft[0]}</p>
    <p class="side at" style="--x:55.5;--y:192">${c.sideLeft[1]}</p>
    <p class="side side--down at" style="--x:672.5;--y:240.5">${c.sideRight[0]}</p>
    <p class="side side--down at" style="--x:672.5;--y:274">${c.sideRight[1]}</p>

    <aside class="panel">
      ${ring(c.rings[0].title, c.rings[0].detail, "74 26", 0)}
      ${ring(c.rings[1].title, c.rings[1].detail, "72 28", 118)}
    </aside>

    <footer class="ui">
      <div class="mark">
        <a class="mark__logo" href="#">${c.mark}<span class="mark__dot"></span></a>
        <nav aria-label="Secundaria"><ul class="mark__nav">${links(c.markNav)}</ul></nav>
      </div>
      <p class="tag at" style="--x:435;--y:369">${c.footer[0]}</p>
      <p class="tag at" style="--x:463;--y:369">${c.footer[1]}</p>
      <p class="counter at" style="--x:672;--y:368">${c.counter}</p>
    </footer>
  </main>`;
