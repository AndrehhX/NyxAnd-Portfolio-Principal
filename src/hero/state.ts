// Estado compartido entre el lienzo WebGL y las animaciones de scroll.
export const stage = {
  /** Oscurecimiento forzado del líquido (0 a 1). null deja que el lienzo lo calcule por scroll. */
  dimOverride: null as number | null,
  /** Cuánto se ilumina el líquido al pasar por una opción (0 a 1). */
  glow: 0,
  /** Fotograma del líquido sin logo ni panel, como data URL, para reutilizarlo en las tarjetas. */
  shot: "",
};

export const SHOT_EVENT = "stage:shot";
