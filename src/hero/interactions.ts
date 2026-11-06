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
  let maxScroll = 1;
  const updateMax = () => {
    maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  };
  updateMax();

  let lastPct = -1;
  const onScroll = () => {
    const progress = Math.min(1, Math.max(0, window.scrollY / maxScroll));
    const pct = Math.round(progress * 100);
    if (pct !== lastPct) {
      lastPct = pct;
      arc.setAttribute("stroke-dasharray", `${Math.max(pct, 1)} 100`);
      count.textContent = String(pct).padStart(2, "0");
    }
  };
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", () => {
    updateMax();
    onScroll();
  }, { passive: true });
  onScroll();
}
