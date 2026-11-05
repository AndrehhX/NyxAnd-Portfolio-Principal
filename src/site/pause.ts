import gsap from "gsap";
import type Lenis from "lenis";
import { links } from "../hero/content";
import { stage } from "../hero/state";

const external = 'target="_blank" rel="noopener noreferrer"';

const ITEMS = [
  { label: "Inicio", href: "#inicio", hint: "Volver al principio, donde está Andreh." },
  { label: "Sobre mí", href: "#sobre-mi", hint: "Quién soy, qué estudio y con qué trabajo." },
  { label: "Proyectos", href: "#proyectos", hint: "Lo que he construido, con demo y código." },
  { label: "Recorrido", href: "#recorrido", hint: "Experiencia, hackathon y formación." },
  { label: "Hablemos", href: "#contacto", hint: "Correo, GitHub y currículum." },
  { label: "Currículum", href: links.cv, hint: "Abre el PDF en otra pestaña.", ext: true },
  { label: "GitHub", href: links.github, hint: "Mi código en AndrehhX, en otra pestaña.", ext: true },
];

// Glifos de mando dibujados a mano.
const glyph = {
  pad: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M10 5h4v5h5v4h-5v5h-4v-5H5v-4h5Z" fill="currentColor"/></svg>',
  cross: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="m8 8 8 8M16 8l-8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  circle: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="12" cy="12" r="4.6" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
};

export const pauseMarkup = `
  <button class="pausebtn" type="button" data-open-pause aria-label="Abrir el menú de pausa">
    <span class="pausebtn__bars" aria-hidden="true"><i></i><i></i></span>
    <span class="pausebtn__label">Menú</span>
    <kbd>Esc</kbd>
  </button>

  <dialog class="pause" aria-label="Menú de pausa" data-lenis-prevent>
    <div class="pause__veil" aria-hidden="true"></div>
    <div class="pause__stage">
      <p class="pause__word" aria-hidden="true">${[..."Pausa"].map((c) => `<span>${c}</span>`).join("")}</p>
      <nav class="pause__nav" aria-label="Navegar por el portafolio">
        <ul class="pause__list">
          ${ITEMS.map(
            (item, i) => `<li><a href="${item.href}" data-index="${i}" data-hint="${item.hint}" ${item.ext ? external : ""}>${item.label}</a></li>`,
          ).join("")}
        </ul>
        <p class="pause__hint" aria-live="polite"></p>
      </nav>
    </div>
    <div class="pause__keys">
      <span class="pause__key pause__key--fine">${glyph.pad}Navegar</span>
      <span class="pause__key pause__key--fine">${glyph.cross}Elegir</span>
      <span class="pause__key pause__key--touch">Toca una opción</span>
      <button class="pause__key" type="button" data-pause-back>${glyph.circle}Volver</button>
    </div>
  </dialog>`;

export function setupPause(root: HTMLElement, reduced: boolean) {
  const dialog = root.querySelector<HTMLDialogElement>(".pause")!;
  const anchors = [...dialog.querySelectorAll<HTMLAnchorElement>(".pause__list a")];
  const hint = dialog.querySelector<HTMLElement>(".pause__hint")!;
  const button = root.querySelector<HTMLElement>(".pausebtn")!;
  const lenis = () => (window as unknown as { lenis?: Lenis }).lenis;
  let active = 0;
  let closing = false;

  // Una sola línea de tiempo: se reproduce al abrir y se rebobina más rápido al cerrar.
  const tl = gsap
    .timeline({ paused: true })
    .fromTo(".pause__veil", { opacity: 0 }, { opacity: 1, duration: 0.45, ease: "power2.out" })
    .fromTo(".pause__word", { rotationY: 78, x: -90, opacity: 0 }, { rotationY: 24, x: 0, opacity: 1, duration: 1, ease: "expo.out" }, 0.05)
    .fromTo(".pause__word span", { yPercent: 70, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.8, ease: "expo.out", stagger: 0.05 }, 0.08)
    .fromTo(anchors, { x: 70, opacity: 0 }, { x: 0, opacity: 1, duration: 0.7, ease: "expo.out", stagger: 0.045 }, 0.16)
    .fromTo(".pause__hint", { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0.45)
    .fromTo(".pause__key", { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "expo.out", stagger: 0.06 }, 0.4);

  const select = (index: number, focus = true) => {
    active = (index + anchors.length) % anchors.length;
    anchors.forEach((a, i) => {
      const on = i === active;
      a.classList.toggle("is-active", on);
      a.setAttribute("aria-current", on ? "true" : "false");
      gsap.to(a, { x: on ? 18 : 0, scale: on ? 1.06 : 1, duration: 0.45, ease: "expo.out", overwrite: "auto" });
    });
    hint.textContent = anchors[active].dataset.hint ?? "";
    if (focus) anchors[active].focus({ preventScroll: true });
  };

  const open = () => {
    if (dialog.open) return;
    closing = false;
    stage.paused = true;
    lenis()?.stop();
    dialog.showModal();
    select(active);
    if (reduced) tl.progress(1);
    else tl.timeScale(1).play(0);
  };

  const close = () =>
    new Promise<void>((resolve) => {
      if (!dialog.open || closing) return resolve();
      closing = true;
      const finish = () => {
        dialog.close();
        stage.paused = false;
        lenis()?.start();
        closing = false;
        button.focus({ preventScroll: true });
        resolve();
      };
      if (reduced) {
        tl.progress(0);
        finish();
      } else {
        tl.eventCallback("onReverseComplete", () => {
          tl.eventCallback("onReverseComplete", null);
          finish();
        });
        tl.timeScale(1.7).reverse();
      }
    });

  root.querySelectorAll("[data-open-pause], [data-open-menu]").forEach((el) => el.addEventListener("click", open));
  dialog.querySelector("[data-pause-back]")!.addEventListener("click", () => void close());

  // Esc abre la pausa como en un juego; dentro del panel, Esc vuelve.
  addEventListener("keydown", (e) => {
    if (e.key !== "Escape" || dialog.open) return;
    const typing = (e.target as Element).closest("input, textarea, [contenteditable]");
    if (!typing) {
      e.preventDefault();
      open();
    }
  });
  dialog.addEventListener("cancel", (e) => {
    e.preventDefault();
    void close();
  });
  dialog.addEventListener("click", (e) => {
    if ((e.target as Element).closest(".pause__veil, .pause__stage") && !(e.target as Element).closest("a, .pause__word")) void close();
  });

  dialog.addEventListener("keydown", (e) => {
    const key = e.key;
    if (key === "ArrowDown" || key === "s") select(active + 1);
    else if (key === "ArrowUp" || key === "w") select(active - 1);
    else if (key === "Home") select(0);
    else if (key === "End") select(anchors.length - 1);
    else if (key.length === 1 && /\p{L}/u.test(key)) {
      // Escribir una letra salta a la primera opción que empieza con ella.
      const i = anchors.findIndex((a, j) => j > active && a.textContent!.toLowerCase().startsWith(key.toLowerCase()));
      const k = i >= 0 ? i : anchors.findIndex((a) => a.textContent!.toLowerCase().startsWith(key.toLowerCase()));
      if (k >= 0) select(k);
      else return;
    } else return;
    e.preventDefault();
  });

  anchors.forEach((a, i) => {
    a.addEventListener("pointerenter", () => i !== active && select(i));
    a.addEventListener("focus", () => i !== active && select(i, false));
    a.addEventListener("click", (e) => {
      const hash = a.getAttribute("href")!;
      if (!hash.startsWith("#")) {
        void close();
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      gsap.fromTo(a, { opacity: 0.35 }, { opacity: 1, duration: 0.25, repeat: 1 });
      void close().then(() => {
        const target = hash === "#inicio" ? 0 : document.querySelector<HTMLElement>(hash);
        if (target === null) return;
        const l = lenis();
        if (l) l.scrollTo(target, { duration: 1.6 });
        else if (target === 0) scrollTo(0, 0);
        else target.scrollIntoView();
        history.replaceState(null, "", hash);
      });
    });
  });

  // El botón fijo aparece cuando la interfaz del hero ya se fue.
  const toggleButton = () => button.classList.toggle("is-on", scrollY > innerHeight * 0.55);
  addEventListener("scroll", toggleButton, { passive: true });
  toggleButton();
}
