import "./style.css";
import "./site/sections.css";
import "./site/pause.css";
import { setupInteractions } from "./hero/interactions";
import { heroMarkup } from "./hero/markup";
import { createHero } from "./hero/renderer";
import { setupAbout } from "./site/about";
import { setupCursor } from "./site/cursor";
import { setupMotion } from "./site/motion";
import { setupPause } from "./site/pause";

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
setupInteractions(app);
setupAbout(app, reduced);
setupMotion(app, reduced || params.has("static"));
setupCursor(app);
setupPause(app, reduced);
