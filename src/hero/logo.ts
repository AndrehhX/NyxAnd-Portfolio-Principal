// Logo graffiti "Andreh", en coordenadas 736 x 414 de la composición.
// Se rasteriza a un campo de distancia: el shader saca de ahÃ­ el bisel, el grosor y la refracciÃ³n.
type P = readonly [number, number];
// Punto de un trazo: [x, y, grosor]. Un grosor de 0 termina en punta.
type StrokePoint = readonly [number, number, number];
interface Stroke {
  pts: readonly StrokePoint[];
  curve?: boolean;
}

// "Andreh" como tag: alturas desiguales, diagonales fuertes, grosores extremos y puntas que escapan.
const STROKES: readonly Stroke[] = [
  // A: flecha inclinada con cola
  { pts: [[292, 153, 8], [272, 190, 12], [252, 226, 17], [240, 247, 0]] },
  { pts: [[292, 153, 8], [294, 196, 10], [300, 232, 15], [314, 246, 0]] },
  { pts: [[232, 214, 0], [262, 210, 9], [296, 204, 10], [316, 192, 0]] },
  // n: zigzag con una espina que sube hasta arriba
  { pts: [[318, 176, 8], [314, 205, 12], [309, 236, 16], [299, 248, 0]] },
  { pts: [[318, 180, 9], [331, 208, 11], [343, 235, 14]] },
  { pts: [[343, 236, 14], [350, 195, 11], [362, 150, 0]] },
  // d
  { pts: [[396, 154, 8], [388, 196, 11], [381, 232, 15], [391, 247, 0]] },
  { pts: [[386, 192, 7], [370, 190, 11], [357, 205, 14], [354, 224, 14], [364, 236, 12], [380, 226, 8]], curve: true },
  // r: bandera larga que vuela sobre la e
  { pts: [[409, 180, 8], [404, 208, 12], [399, 236, 15], [389, 248, 0]] },
  { pts: [[405, 208, 7], [413, 190, 11], [424, 178, 9], [442, 168, 0]] },
  // e
  { pts: [[428, 222, 6], [446, 211, 7], [449, 200, 9], [440, 194, 10], [427, 204, 12], [422, 220, 13], [430, 235, 11], [442, 236, 8], [456, 227, 0]], curve: true },
  // h
  { pts: [[474, 152, 8], [465, 195, 11], [456, 234, 15], [446, 248, 0]] },
  { pts: [[466, 202, 8], [476, 186, 12], [488, 190, 12], [485, 214, 13], [480, 234, 15], [493, 247, 0]] },
];

// Cortes finos que dibujan contornos dentro de los trazos gruesos.
const CUTS: readonly Stroke[] = [
  { pts: [[258, 238, 0], [266, 214, 1.5], [278, 193, 0]] },
  { pts: [[304, 243, 0], [298, 222, 1.4], [296, 208, 0]] },
  { pts: [[314, 244, 0], [319, 218, 1.4], [323, 196, 0]] },
  { pts: [[347, 228, 0], [352, 200, 1.3], [358, 172, 0]] },
  { pts: [[387, 241, 0], [391, 212, 1.4], [396, 180, 0]] },
  { pts: [[461, 240, 0], [466, 212, 1.4], [472, 176, 0]] },
];

// Punto final del logo
const DOT: readonly P[] = [[496, 218], [498, 216.5], [503, 218.5], [510, 224], [510, 226], [506, 229], [500, 229], [496, 226], [496, 222]];

// Anillas: [x, y, radio del agujero]. Cada una lleva su lóbulo alrededor.
const HOLES: readonly (readonly [number, number, number])[] = [
  [292, 153.5, 2.2],
  [318.2, 176.5, 2],
  [396.2, 154.5, 2.2],
  [409.2, 180.5, 2],
  [474.2, 152.5, 2.2],
];

// Deformación fija: nada queda sobre una línea recta, como un trazo hecho a pulso.
const warp = (x: number, y: number): P => [
  x + 3.4 * Math.sin(y * 0.071 + x * 0.031) + 1.4 * Math.sin(y * 0.19 + 1.1),
  y + 4.6 * Math.sin(x * 0.047 + 0.8) + 1.6 * Math.sin(x * 0.13 + y * 0.03),
];

function drawStroke(g: CanvasRenderingContext2D, stroke: Stroke) {
  const { pts, curve } = stroke;
  const STEPS = 48;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(i + 2, pts.length - 1)];
    for (let s = 0; s <= STEPS; s++) {
      const t = s / STEPS;
      const at = (k: number) =>
        curve
          ? 0.5 *
            (2 * p1[k] +
              (p2[k] - p0[k]) * t +
              (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t * t +
              (3 * p1[k] - p0[k] - 3 * p2[k] + p3[k]) * t * t * t)
          : p1[k] + (p2[k] - p1[k]) * t;
      const [x, y] = warp(at(0), at(1));
      g.beginPath();
      g.arc(x, y, Math.max(at(2) / 2, 0.02), 0, Math.PI * 2);
      g.fill();
    }
  }
}

export const LOGO = { x: 222, y: 136, w: 296, h: 126, center: [370, 200] as const };
const SCALE = 5;

// Recorre el polÃ­gono con esquinas de radio corto: conserva las puntas afiladas del graffiti.
function outline(g: CanvasRenderingContext2D, pts: readonly P[], radius = 1.9) {
  const toward = (a: P, b: P): P => {
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const t = Math.min(radius / len, 0.5);
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  };
  pts.forEach((p, i) => {
    const prev = pts[(i + pts.length - 1) % pts.length];
    const next = pts[(i + 1) % pts.length];
    const a = toward(p, prev);
    const b = toward(p, next);
    if (i === 0) g.moveTo(a[0], a[1]);
    else g.lineTo(a[0], a[1]);
    g.quadraticCurveTo(p[0], p[1], b[0], b[1]);
  });
  g.closePath();
}

// Transformada de distancia exacta de Felzenszwalb y Huttenlocher.
function edt1d(f: Float64Array, n: number, out: Float64Array, v: Int32Array, z: Float64Array) {
  let k = 0;
  v[0] = 0;
  z[0] = -Infinity;
  z[1] = Infinity;
  for (let q = 1; q < n; q++) {
    let s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    while (s <= z[k]) {
      k--;
      s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    }
    k++;
    v[k] = q;
    z[k] = s;
    z[k + 1] = Infinity;
  }
  k = 0;
  for (let q = 0; q < n; q++) {
    while (z[k + 1] < q) k++;
    const d = q - v[k];
    out[q] = d * d + f[v[k]];
  }
}

function edt(grid: Float64Array, w: number, h: number) {
  const size = Math.max(w, h);
  const f = new Float64Array(size);
  const out = new Float64Array(size);
  const v = new Int32Array(size);
  const z = new Float64Array(size + 1);
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) f[y] = grid[y * w + x];
    edt1d(f, h, out, v, z);
    for (let y = 0; y < h; y++) grid[y * w + x] = out[y];
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) f[x] = grid[y * w + x];
    edt1d(f, w, out, v, z);
    for (let x = 0; x < w; x++) grid[y * w + x] = out[x];
  }
}

export function buildLogoField() {
  const w = LOGO.w * SCALE;
  const h = LOGO.h * SCALE;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const g = canvas.getContext("2d", { willReadFrequently: true })!;
  g.scale(SCALE, SCALE);
  g.translate(-LOGO.x, -LOGO.y);

  g.fillStyle = "#fff";
  for (const stroke of STROKES) drawStroke(g, stroke);
  for (const [hx, hy] of HOLES) {
    const [x, y] = warp(hx, hy);
    g.beginPath();
    g.arc(x, y, 5.4, 0, Math.PI * 2);
    g.fill();
  }
  g.beginPath();
  outline(g, DOT);
  g.fill();
  g.globalCompositeOperation = "destination-out";
  for (const cut of CUTS) drawStroke(g, cut);
  for (const [hx, hy, r] of HOLES) {
    const [x, y] = warp(hx, hy);
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fill();
  }

  const alpha = g.getImageData(0, 0, w, h).data;
  const inside = new Float64Array(w * h);
  const outside = new Float64Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const on = alpha[i * 4 + 3] > 127;
    inside[i] = on ? 1e12 : 0;
    outside[i] = on ? 0 : 1e12;
  }
  edt(inside, w, h);
  edt(outside, w, h);

  const raw = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) raw[i] = (Math.sqrt(inside[i]) - Math.sqrt(outside[i])) / SCALE;

  // Un desenfoque corto redondea esquinas y deja normales limpias en el bisel.
  const data = new Float32Array(w * h);
  const R = 3;
  const tmp = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let s = 0;
      for (let k = -R; k <= R; k++) s += raw[y * w + Math.min(w - 1, Math.max(0, x + k))];
      tmp[y * w + x] = s / (2 * R + 1);
    }
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let s = 0;
      for (let k = -R; k <= R; k++) s += tmp[Math.min(h - 1, Math.max(0, y + k)) * w + x];
      data[y * w + x] = s / (2 * R + 1);
    }
  }
  return { data, width: w, height: h };
}
