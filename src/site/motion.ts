import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import { SHOT_EVENT, stage } from "../hero/state";

gsap.registerPlugin(ScrollTrigger, SplitText);

const lerp = (a: number, b: number, t: number) => a + (b - a) * Math.min(1, Math.max(0, t));

export function setupMotion(root: HTMLElement, reduced: boolean) {
  // El fotograma del líquido se reutiliza como fondo de tarjetas y banner.
  const applyShot = () => stage.shot && document.documentElement.style.setProperty("--shot", `url("${stage.shot}")`);
  applyShot();
  addEventListener(SHOT_EVENT, applyShot);

  let lenis: Lenis | null = null;
  if (!reduced) {
    lenis = new Lenis({ lerp: 0.09 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis!.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    document.documentElement.classList.add("lenis-on");
    // Acceso para depurar desde la consola.
    (window as unknown as { lenis?: Lenis }).lenis = lenis;
    root.querySelector(".menu")?.setAttribute("data-lenis-prevent", "");
  }

  // Enlaces internos con desplazamiento suave.
  root.addEventListener("click", (e) => {
    const a = (e.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
    if (!a) return;
    const hash = a.getAttribute("href")!;
    const target = hash === "#inicio" ? 0 : document.querySelector<HTMLElement>(hash);
    if (target === null) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(target, { duration: 1.6 });
    else if (target === 0) scrollTo(0, 0);
    else target.scrollIntoView();
    history.replaceState(null, "", hash);
  });

  // Las opciones encienden el líquido al pasar por encima.
  root.querySelectorAll(".option").forEach((option) => {
    option.addEventListener("pointerenter", () => (stage.glow = 1));
    option.addEventListener("pointerleave", () => (stage.glow = 0));
    option.addEventListener("focus", () => (stage.glow = 1));
    option.addEventListener("blur", () => (stage.glow = 0));
  });

  if (reduced) return;
  // Las animaciones de scroll se preparan cuando el navegador queda libre, sin competir con la carga.
  const idle = (cb: () => void) => ("requestIdleCallback" in window ? requestIdleCallback(cb, { timeout: 1200 }) : setTimeout(cb, 200));
  document.fonts.ready.then(() =>
    idle(async () => {
      await build(root);
      ScrollTrigger.refresh();
    }),
  );
}

// Cede el hilo entre pasos: ninguna tarea larga bloquea la página mientras se arman las escenas.
const pause = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

async function build(root: HTMLElement) {
  const q = <T extends Element = HTMLElement>(s: string) => root.querySelector<T>(s)!;
  const qa = <T extends Element = HTMLElement>(s: string) => [...root.querySelectorAll<T>(s)];

  // 1. La interfaz del hero se dispersa a distintas velocidades mientras el logo se derrite.
  gsap.to(".hero", { "--exit": 260, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  gsap.to(qa(".hero > header, .hero > footer, .hero > .toolbar, .hero > .wordmark, .hero > .cost, .hero > .side, .hero > .panel"), {
    autoAlpha: 0,
    ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "70% top", scrub: true },
  });

  await pause();
  // 2. NYXAND recortado sobre un velo negro: el líquido vive dentro de las letras y la cámara entra por la X.
  const knock = q(".knock");
  const text = q<SVGTextElement>(".knock__word text");
  const ext = text.getExtentOfChar(2);
  const origin = `${ext.x + ext.width / 2} ${ext.y + ext.height * 0.5}`;
  const veil = q(".knock__veil");
  gsap.set(veil, { opacity: 0 });
  gsap.to(veil, { opacity: 1, ease: "none", scrollTrigger: { trigger: knock, start: "top 90%", end: "top top", scrub: true } });
  const words = qa(".knock__word");
  const scene = gsap.timeline({
    scrollTrigger: {
      trigger: knock,
      start: "top top",
      end: "bottom bottom",
      scrub: 1,
      onUpdate: (self) => {
        const p = self.progress;
        stage.dimOverride = p < 0.14 ? lerp(0.74, 0, p / 0.14) : p > 0.84 ? lerp(0, 0.74, (p - 0.84) / 0.16) : 0;
      },
      onLeave: () => (stage.dimOverride = null),
      onLeaveBack: () => (stage.dimOverride = null),
    },
  });
  scene
    .fromTo(words, { scale: 0.92 }, { scale: 1, duration: 0.14, ease: "none" }, 0)
    .to(words, { scale: 95, svgOrigin: origin, duration: 0.7, ease: "power3.in" }, 0.14)
    .to(".knock__line", { autoAlpha: 0, y: -24, duration: 0.12, stagger: 0.03 }, 0.16)
    .to(veil, { opacity: 0, duration: 0.1 }, 0.86)
    .to({}, { duration: 0.04 });

  await pause();
  // 3. Títulos oscuros: letras que suben desde una máscara, punto y coma que rebota y subrayado a mano.
  for (const t of qa(".dtitle")) {
    await pause();
    const split = SplitText.create(t.querySelector(".dtitle__word")!, { type: "chars", mask: "chars", aria: "hidden" });
    gsap
      .timeline({ scrollTrigger: { trigger: t, start: "top 84%" } })
      .from(split.chars, { yPercent: 118, rotate: 9, duration: 1.1, ease: "expo.out", stagger: 0.045 })
      .from(t.querySelectorAll(".dtitle__small"), { autoAlpha: 0, y: 16, duration: 0.6, stagger: 0.12 }, 0.25)
      .from(t.querySelector(".dtitle__semi"), { scale: 0, rotate: -40, transformOrigin: "50% 70%", duration: 0.8, ease: "back.out(3)" }, 0.45)
      .fromTo(t.querySelectorAll(".dtitle__swoosh path"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.9, ease: "power3.inOut" }, 0.5)
      .fromTo(t.querySelectorAll(".dtitle__scratch path"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.7, stagger: 0.12, ease: "power2.out" }, 0.15);
  }

  await pause();
  // 4. Opciones que caen en cascada y se inclinan siguiendo al puntero.
  gsap.from(".option", {
    yPercent: 40,
    rotate: (i) => (i % 2 ? 3 : -3),
    autoAlpha: 0,
    duration: 1.1,
    ease: "expo.out",
    stagger: 0.09,
    scrollTrigger: { trigger: ".options__grid", start: "top 82%" },
  });
  qa(".option").forEach((option) => {
    const rx = gsap.quickTo(option, "rotationX", { duration: 0.5, ease: "power3.out" });
    const ry = gsap.quickTo(option, "rotationY", { duration: 0.5, ease: "power3.out" });
    option.addEventListener("pointermove", (e) => {
      const r = option.getBoundingClientRect();
      ry(((e.clientX - r.left) / r.width - 0.5) * 10);
      rx(-((e.clientY - r.top) / r.height - 0.5) * 10);
    });
    option.addEventListener("pointerleave", () => {
      rx(0);
      ry(0);
    });
  });

  await pause();
  // 5. La tarjeta de perfil se arma pieza por pieza.
  gsap
    .timeline({ scrollTrigger: { trigger: ".pcard", start: "top 78%" } })
    .from(".pcard", { clipPath: "inset(10% 9% 14% 9% round 30px)", duration: 1.3, ease: "expo.out" })
    .from(".pcard__shot", { scale: 1.3, duration: 1.8, ease: "expo.out" }, 0)
    .from(".pcard__chip", { y: -20, autoAlpha: 0, duration: 0.6, stagger: 0.1 }, 0.4)
    .from(".pcard__badge", { scale: 0, rotate: -120, duration: 0.9, ease: "back.out(2.2)" }, 0.5)
    .from(".pill--search", { x: -70, autoAlpha: 0, duration: 0.8, ease: "expo.out" }, 0.6)
    .from(".pill--meter", { x: 70, autoAlpha: 0, duration: 0.8, ease: "expo.out" }, 0.6)
    .from(".player", { y: 24, autoAlpha: 0, duration: 0.7, ease: "expo.out" }, 0.75);
  gsap.to(".pcard__shot", { yPercent: 10, ease: "none", scrollTrigger: { trigger: ".pcard", start: "top bottom", end: "bottom top", scrub: true } });
  gsap.fromTo(".pixel", { rotate: -14 }, { rotate: 14, ease: "none", scrollTrigger: { trigger: ".pcard", start: "top bottom", end: "bottom top", scrub: 1 } });
  gsap.from(".carousel", { y: 90, rotate: -2, autoAlpha: 0, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: ".carousel", start: "top 88%" } });
  gsap.from(".highlight", { scale: 0.3, autoAlpha: 0, duration: 0.8, ease: "back.out(2)", stagger: 0.07, scrollTrigger: { trigger: ".highlights", start: "top 90%" } });
  gsap.from(".pcard__text > *, .pbtn", { y: 26, autoAlpha: 0, duration: 0.9, ease: "expo.out", stagger: 0.08, scrollTrigger: { trigger: ".pcard__text", start: "top 88%" } });

  await pause();
  // 6. Proyectos: en escritorio la galería corre de lado y se tuerce con la velocidad del scroll.
  const mm = gsap.matchMedia();
  mm.add("(min-width: 900px) and (min-aspect-ratio: 1/1)", () => {
    const track = q(".work__track");
    const cards = qa(".work__card");
    const distance = () => Math.max(0, track.scrollWidth - innerWidth);
    const skew = gsap.quickTo(cards, "skewX", { duration: 0.5, ease: "power3.out" });
    const slide = gsap.to(track, {
      x: () => -distance(),
      ease: "none",
      scrollTrigger: {
        trigger: ".work",
        pin: ".work__pin",
        start: "top top",
        end: () => `+=${distance()}`,
        scrub: 0.6,
        invalidateOnRefresh: true,
        onUpdate: (self) => skew(gsap.utils.clamp(-7, 7, self.getVelocity() / -260)),
      },
    });
    cards.forEach((card) => {
      const img = card.querySelector("img, .slide__shot");
      if (img)
        gsap.fromTo(img, { xPercent: -7 }, { xPercent: 7, ease: "none", scrollTrigger: { trigger: card, containerAnimation: slide, start: "left right", end: "right left", scrub: true } });
      gsap.from(card.querySelector(".work__name"), { yPercent: 70, autoAlpha: 0, duration: 1, ease: "expo.out", scrollTrigger: { trigger: card, containerAnimation: slide, start: "left 85%" } });
    });
  });
  mm.add("(max-width: 899px), (max-aspect-ratio: 1/1)", () => {
    qa(".work__card").forEach((card) =>
      gsap.from(card, { y: 70, autoAlpha: 0, duration: 1, ease: "expo.out", scrollTrigger: { trigger: card, start: "top 88%" } }),
    );
  });

  await pause();
  // 7. Recorrido: cada línea se traza y el cargo sube detrás de ella.
  qa(".path__item").forEach((item) => {
    gsap
      .timeline({ scrollTrigger: { trigger: item, start: "top 85%" } })
      .from(item.querySelector(".path__line"), { scaleX: 0, transformOrigin: "left center", duration: 1.2, ease: "expo.inOut" })
      .from(item.querySelectorAll(".path__period, .path__role, .path__place, .path__detail"), { y: 34, autoAlpha: 0, duration: 0.9, ease: "expo.out", stagger: 0.07 }, 0.25);
  });

  await pause();
  // 8. Contacto: el correo se arma letra por letra y la cinta acelera con el scroll.
  const mail = SplitText.create(q(".contact__mail"), { type: "chars", mask: "chars" });
  gsap.from(mail.chars, { yPercent: 110, duration: 1, ease: "expo.out", stagger: 0.018, scrollTrigger: { trigger: ".contact__mail", start: "top 88%" } });
  const loop = gsap.to(".marquee__track", { xPercent: -50, duration: 38, ease: "none", repeat: -1 });
  ScrollTrigger.create({
    trigger: ".contact",
    start: "top bottom",
    end: "bottom top",
    onUpdate: (self) => {
      const boost = 1 + Math.min(6, Math.abs(self.getVelocity()) / 350);
      gsap.to(loop, { timeScale: self.direction * boost, duration: 0.2, overwrite: true });
      gsap.to(loop, { timeScale: self.direction, duration: 1.2, delay: 0.25 });
    },
  });
}
