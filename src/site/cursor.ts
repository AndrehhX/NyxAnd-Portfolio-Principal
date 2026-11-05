import gsap from "gsap";

// Cursor propio solo con ratón: un punto que crece sobre enlaces y muestra qué pasará al hacer clic.
export function setupCursor(root: HTMLElement) {
  if (!matchMedia("(pointer: fine)").matches) return;
  const cursor = root.querySelector<HTMLElement>(".cursor")!;
  const label = cursor.querySelector<HTMLElement>(".cursor__label")!;
  document.documentElement.classList.add("has-cursor");

  const x = gsap.quickTo(cursor, "x", { duration: 0.35, ease: "power3.out" });
  const y = gsap.quickTo(cursor, "y", { duration: 0.35, ease: "power3.out" });
  addEventListener("pointermove", (e) => {
    x(e.clientX);
    y(e.clientY);
    cursor.classList.add("is-on");
  });
  document.documentElement.addEventListener("pointerleave", () => cursor.classList.remove("is-on"));

  root.addEventListener("pointerover", (e) => {
    const target = e.target as Element;
    const labelled = target.closest<HTMLElement>("[data-cursor]");
    const link = target.closest("a, button, input, [tabindex]");
    label.textContent = labelled?.dataset.cursor ?? "";
    cursor.classList.toggle("is-label", !!labelled);
    cursor.classList.toggle("is-link", !labelled && !!link);
  });
}
