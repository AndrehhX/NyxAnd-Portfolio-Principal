// Comportamiento de la interfaz: reloj de Guatemala y progreso de scroll.
export function setupInteractions(root: HTMLElement) {
  const clock = root.querySelector<HTMLElement>("[data-clock]")!;
  const clockArc = root.querySelector<SVGCircleElement>("[data-clock-arc]")!;
  const time = new Intl.DateTimeFormat("es-GT", { timeZone: "America/Guatemala", hour: "2-digit", minute: "2-digit", hour12: false });
  const seconds = new Intl.DateTimeFormat("en-US", { timeZone: "America/Guatemala", second: "numeric" });
  const tick = () => {
    const now = new Date();
    clock.textContent = time.format(now);
    const s = Number(seconds.format(now));
    clockArc.setAttribute("stroke-dasharray", `${((s + 1) / 60) * 100} 100`);
  };
  tick();
  setInterval(tick, 1000);

  const arc = root.querySelector<SVGCircleElement>("[data-scroll-arc]")!;
  const count = root.querySelector<HTMLElement>("[data-scroll-count]")!;
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const progress = max > 0 ? Math.min(1, scrollY / max) : 0;
    arc.setAttribute("stroke-dasharray", `${Math.max(progress * 100, 1)} 100`);
    count.textContent = String(Math.round(progress * 100)).padStart(2, "0");
  };
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);
  onScroll();
}
