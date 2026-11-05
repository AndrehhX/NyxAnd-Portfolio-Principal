// Bandas de seda líquida medidas sobre la referencia, en coordenadas 736 x 414.
// Cada punto es [x, y, semiancho, intensidad]. En t = 0 el fondo reproduce la composición original.
export const STAGE = { w: 736, h: 414 } as const;

type Pt = readonly [number, number, number, number];

export const RIBBONS: readonly (readonly Pt[])[] = [
  // Banda superior izquierda
  [[205, -24, 26, 1], [188, 2, 27, 1], [158, 34, 25, 1], [132, 72, 22, 1], [116, 104, 18, 0.9], [104, 132, 13, 0.45], [100, 154, 9, 0.08]],
  // Hilo vertical superior
  [[292, -16, 7, 0.75], [286, 20, 7, 0.72], [279, 60, 6.5, 0.62], [273, 104, 6, 0.42], [270, 150, 5, 0.14], [268, 190, 4, 0]],
  // Columna inferior izquierda
  [[166, 138, 12, 0], [158, 174, 15, 0.26], [147, 214, 19, 0.58], [132, 254, 23, 0.94], [121, 300, 25, 1], [114, 352, 25, 1], [110, 430, 26, 1]],
  // Velo cálido junto a la columna
  [[182, 212, 22, 0], [176, 262, 30, 0.2], [166, 322, 30, 0.2], [166, 430, 30, 0.14]],
  // Gran arco derecho
  [[338, 256, 18, 0.26], [366, 222, 18, 0.62], [398, 190, 17, 0.8], [436, 160, 14, 0.82], [478, 148, 11, 0.92], [522, 148, 11, 1], [566, 160, 13, 1], [596, 190, 16, 1], [606, 232, 18, 1], [598, 282, 24, 1], [582, 326, 29, 1], [574, 356, 26, 1], [572, 372, 8, 0.5]],
  // Diagonal superior central que entra al arco
  [[476, 42, 14, 0.14], [448, 66, 16, 0.32], [422, 96, 16, 0.5], [402, 132, 15, 0.56], [386, 172, 14, 0.46]],
  // Filo exterior del arco
  [[626, 196, 4, 0], [642, 222, 5.5, 0.5], [640, 258, 5.5, 0.56], [626, 298, 4.5, 0.44], [606, 338, 3.5, 0.14]],
  // Velo bajo el logo
  [[270, 268, 18, 0], [318, 262, 22, 0.16], [362, 248, 24, 0.16], [404, 236, 16, 0]],
  // Resplandor inferior izquierdo
  [[-8, 394, 16, 0.22], [18, 412, 20, 0.26], [44, 430, 16, 0.08]],
  // Veladuras muy tenues de fondo
  [[342, -10, 24, 0.05], [352, 62, 28, 0.07], [336, 136, 24, 0.06]],
  [[28, 120, 22, 0.04], [36, 220, 24, 0.05], [30, 318, 20, 0.03]],
  [[488, 300, 22, 0.05], [498, 360, 24, 0.05], [492, 430, 20, 0.04]],
];

// Catmull-Rom: suaviza cada banda para que el shader no muestre vértices.
function smooth(ribbon: readonly Pt[], steps = 3): number[][] {
  const out: number[][] = [];
  for (let i = 0; i < ribbon.length - 1; i++) {
    const p0 = ribbon[Math.max(i - 1, 0)];
    const p1 = ribbon[i];
    const p2 = ribbon[i + 1];
    const p3 = ribbon[Math.min(i + 2, ribbon.length - 1)];
    for (let s = 0; s < steps; s++) {
      const t = s / steps;
      out.push(
        p1.map((_, k) => {
          const a = 2 * p1[k];
          const b = (p2[k] - p0[k]) * t;
          const c = (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t * t;
          const d = (3 * p1[k] - p0[k] - 3 * p2[k] + p3[k]) * t * t * t;
          return 0.5 * (a + b + c + d);
        }),
      );
    }
  }
  out.push([...ribbon[ribbon.length - 1]]);
  return out;
}

export function packRibbons() {
  const smoothed = RIBBONS.map((r) => smooth(r));
  const total = smoothed.reduce((n, r) => n + r.length, 0);
  const points = new Float32Array(total * 4);
  const ends = new Int32Array(smoothed.length);
  let i = 0;
  smoothed.forEach((ribbon, r) => {
    for (const p of ribbon) points.set(p, i++ * 4);
    ends[r] = i;
  });
  return { points, ends, total, count: smoothed.length };
}
