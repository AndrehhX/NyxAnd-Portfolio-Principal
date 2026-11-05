import gsap from "gsap";
import { slides as data } from "../hero/content";

const SLIDE_SECONDS = 6;
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

// Perfil: el reproductor maneja el carrusel, como en una historia.
export function setupAbout(root: HTMLElement, reduced: boolean) {
  const card = root.querySelector<HTMLElement>(".pcard")!;
  const slides = [...card.querySelectorAll<HTMLElement>(".slide")];
  const carousel = card.querySelector<HTMLElement>(".carousel")!;
  const caption = card.querySelector<HTMLElement>(".pcard__caption")!;
  const range = card.querySelector<HTMLInputElement>(".player__range")!;
  const elapsed = card.querySelector<HTMLElement>("[data-elapsed]")!;
  const remaining = card.querySelector<HTMLElement>("[data-remaining]")!;
  const fill = card.querySelector<HTMLElement>(".pill__fill")!;
  const toggle = card.querySelector<HTMLButtonElement>("[data-toggle]")!;
  const toast = card.querySelector<HTMLElement>(".toast")!;
  const n = slides.length;
  const total = n * SLIDE_SECONDS;

  let time = 0;
  let playing = !reduced;
  let visible = false;
  let active = -1;

  const layout = (index: number, instant = false) => {
    if (index === active) return;
    active = index;
    slides.forEach((slide, j) => {
      const offset = ((j - index + n + Math.floor(n / 2)) % n) - Math.floor(n / 2);
      const near = Math.abs(offset) <= 1;
      gsap.to(slide, {
        xPercent: offset * 84,
        scale: offset === 0 ? 1 : 0.8,
        rotate: offset * 2.5,
        autoAlpha: near ? 1 : 0,
        zIndex: 10 - Math.abs(offset),
        duration: instant ? 0 : 0.95,
        ease: "expo.out",
      });
      // Oscurecer con una capa encima es más barato que animar un filtro.
      gsap.to(slide.querySelector(".slide__shade"), { opacity: offset === 0 ? 0 : 0.45, duration: instant ? 0 : 0.95, ease: "expo.out" });
      slide.setAttribute("aria-hidden", String(offset !== 0));
    });
    gsap.fromTo(caption, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: instant ? 0 : 0.6, onStart: () => void (caption.textContent = data[index].caption) });
  };

  const render = () => {
    const p = time / total;
    range.value = String(Math.round(p * 1000));
    elapsed.textContent = fmt(time);
    remaining.textContent = `-${fmt(total - time)}`;
    fill.style.transform = `scaleX(${p})`;
    layout(Math.min(n - 1, Math.floor(time / SLIDE_SECONDS)));
  };
  const goTo = (index: number) => {
    time = ((index + n) % n) * SLIDE_SECONDS + 0.01;
    render();
  };

  layout(0, true);
  render();

  gsap.ticker.add((_t, deltaMs) => {
    if (!playing || !visible) return;
    time = (time + deltaMs / 1000) % total;
    render();
  });
  new IntersectionObserver(([entry]) => (visible = entry.isIntersecting), { threshold: 0.25 }).observe(carousel);

  // Decodifica las fotos con dos pantallas de anticipación para que no den tirones al aparecer.
  const warm = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;
      warm.disconnect();
      card.querySelectorAll<HTMLImageElement>(".slide img").forEach((img) => {
        img.loading = "eager";
        img.decode().catch(() => {});
      });
    },
    { rootMargin: "200% 0px" },
  );
  warm.observe(card);

  const setPlaying = (value: boolean) => {
    playing = value;
    toggle.querySelector('[data-icon="pause"]')!.toggleAttribute("hidden", !playing);
    toggle.querySelector('[data-icon="play"]')!.toggleAttribute("hidden", playing);
    toggle.setAttribute("aria-label", playing ? "Pausar el carrusel" : "Reproducir el carrusel");
  };
  setPlaying(playing);

  toggle.addEventListener("click", () => setPlaying(!playing));
  card.querySelector("[data-prev]")!.addEventListener("click", () => goTo(active - 1));
  card.querySelector("[data-next]")!.addEventListener("click", () => goTo(active + 1));
  range.addEventListener("input", () => {
    time = (Number(range.value) / 1000) * total * 0.9999;
    render();
  });
  slides.forEach((slide, i) => slide.addEventListener("click", () => i !== active && goTo(i)));
  carousel.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") goTo(active + 1);
    if (e.key === "ArrowLeft") goTo(active - 1);
  });

  card.querySelectorAll("[data-share]").forEach((button) =>
    button.addEventListener("click", async () => {
      const url = location.origin + location.pathname;
      try {
        if (navigator.share) await navigator.share({ title: "NyxAnd, portafolio de Andreh Callejas", url });
        else {
          await navigator.clipboard.writeText(url);
          toast.hidden = false;
          gsap.fromTo(toast, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.35 });
          gsap.to(toast, { autoAlpha: 0, delay: 2, duration: 0.4, onComplete: () => void (toast.hidden = true) });
        }
      } catch {
        // Compartir cancelado por la persona: no hay nada que hacer.
      }
    }),
  );
}
