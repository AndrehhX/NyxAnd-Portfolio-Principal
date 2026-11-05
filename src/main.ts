import "./style.css";
import { setupInteractions } from "./hero/interactions";
import { heroMarkup } from "./hero/markup";
import { createHero } from "./hero/renderer";

const app = document.querySelector<HTMLDivElement>("#app")!;
app.innerHTML = heroMarkup;

const params = new URLSearchParams(location.search);
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const hero = createHero({
  canvas: app.querySelector("canvas")!,
  panel: app.querySelector<HTMLElement>(".panel")!,
  frozen: params.has("freeze") || reduced,
});
if (!hero) document.documentElement.classList.add("no-webgl");
setupInteractions(app, reduced);
