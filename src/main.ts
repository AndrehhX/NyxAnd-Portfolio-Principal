import "./style.css";
import { createHero } from "./hero/renderer";

const app = document.querySelector<HTMLDivElement>("#app")!;
app.innerHTML = `
  <main class="hero">
    <canvas class="hero__canvas" aria-hidden="true"></canvas>
    <aside class="panel"></aside>
  </main>`;

const params = new URLSearchParams(location.search);
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
createHero({
  canvas: app.querySelector("canvas")!,
  panel: app.querySelector<HTMLElement>(".panel")!,
  frozen: params.has("freeze") || reduced,
});
