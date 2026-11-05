// Alambres cromados de la esquina inferior. Cada punto es [x, y, grosor, presencia, brillo].
type W = readonly [number, number, number, number, number];

const STRANDS: readonly (readonly W[])[] = [
  [[105, 258, 0, 1, 0.3], [124, 287, 0.65, 1, 0.3], [143, 320, 0.8, 1, 0.5], [165, 349, 1, 1, 0.75], [186, 370, 1.15, 1, 1], [200, 376, 0.95, 1, 1], [218, 367, 0.7, 0.9, 0.9], [238, 354, 0.5, 0.75, 0.75], [258, 340, 0.32, 0.4, 0.4], [282, 318, 0.25, 0.22, 0.3], [312, 278, 0.1, 0.1, 0.2]],
  [[105, 258, 0, 1, 0.2], [125, 295, 0.8, 1, 0.2], [139, 325, 1, 1, 0.2], [150, 355, 1.15, 1, 0.25], [159, 383, 1.35, 1, 0.3], [159, 396, 1.3, 1, 0.45], [150, 404, 0.95, 1, 0.6], [134, 409, 0.65, 0.9, 0.45], [103, 412, 0, 0.7, 0.3]],
  [[312, 280, 0.1, 0.1, 0.25], [296, 303, 0.22, 0.28, 0.45], [280, 325, 0.3, 0.55, 0.65], [266, 352, 0.42, 0.75, 0.8], [256, 376, 0.5, 0.85, 0.9], [251.5, 392, 0.65, 0.9, 1], [252, 401, 0.9, 1, 1], [254, 404, 0.8, 1, 1]],
];

export const WIRES = { x: 95, y: 250, w: 225, h: 164, anchor: [105, 258] as const };
const SCALE = 5;

export function buildWireCanvas() {
  const canvas = document.createElement("canvas");
  canvas.width = WIRES.w * SCALE;
  canvas.height = WIRES.h * SCALE;
  const g = canvas.getContext("2d")!;
  g.scale(SCALE, SCALE);
  g.translate(-WIRES.x, -WIRES.y);

  for (const strand of STRANDS) {
    for (let i = 0; i < strand.length - 1; i++) {
      const p0 = strand[Math.max(i - 1, 0)];
      const p1 = strand[i];
      const p2 = strand[i + 1];
      const p3 = strand[Math.min(i + 2, strand.length - 1)];
      for (let s = 0; s < 60; s++) {
        const t = s / 60;
        const at = (k: number) =>
          0.5 *
          (2 * p1[k] +
            (p2[k] - p0[k]) * t +
            (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t * t +
            (3 * p1[k] - p0[k] - 3 * p2[k] + p3[k]) * t * t * t);
        const width = Math.max(0.03, at(2));
        const presence = Math.min(1, Math.max(0, at(3)));
        const shine = Math.min(1, Math.max(0, at(4)));
        g.fillStyle = `rgb(${Math.round(presence * 255)} ${Math.round(shine * 255)} 0)`;
        g.beginPath();
        g.arc(at(0), at(1), width / 2, 0, Math.PI * 2);
        g.fill();
      }
    }
  }
  return canvas;
}
