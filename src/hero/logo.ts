// Logo graffiti "Andreh", en coordenadas 736 x 414 de la composición.
// Se rasteriza a un campo de distancia: el shader saca de ahÃ­ el bisel, el grosor y la refracciÃ³n.
type P = readonly [number, number];
// Punto de un trazo: [x, y, grosor]. Un grosor de 0 termina en punta.
type StrokePoint = readonly [number, number, number];
interface Stroke {
  pts: readonly StrokePoint[];
  curve?: boolean;
}

// "Andreh" construido con trazos de grosor variable, como un tag hecho a pulso.
const STROKES: readonly Stroke[] = [
  // A: dos piernas, travesaño y cola
  { pts: [[291, 160, 9], [272, 204, 13], [259, 238, 9], [250, 248, 0]] },
  { pts: [[291, 160, 9], [297, 198, 13], [303, 231, 13], [313, 238, 0]] },
  { pts: [[245, 231, 0], [270, 219, 8], [300, 214, 8], [316, 205, 0]] },
  // n
  { pts: [[318, 182, 9], [315, 210, 12], [312, 232, 13], [303, 238, 0]] },
  { pts: [[317, 197, 9], [327, 184, 11], [339, 187, 11], [338, 212, 12], [336, 232, 13], [345, 238, 0]] },
  // d
  { pts: [[373, 158, 9], [367, 200, 12], [363, 231, 13], [373, 238, 0]] },
  { pts: [[366, 196, 8], [352, 188, 10], [344, 202, 11], [344, 222, 11], [352, 233, 10], [364, 224, 8]], curve: true },
  // r
  { pts: [[386, 183, 9], [383, 210, 12], [380, 232, 13], [371, 238, 0]] },
  { pts: [[385, 202, 9], [393, 189, 10], [404, 184, 8], [414, 187, 0]] },
  // e
  { pts: [[405, 214, 7], [424, 206, 8], [428, 193, 10], [416, 183, 11], [405, 194, 12], [402, 214, 12], [409, 232, 11], [423, 232, 8], [434, 222, 0]], curve: true },
  // h
  { pts: [[443, 158, 9], [437, 200, 12], [432, 232, 13], [423, 238, 0]] },
  { pts: [[438, 203, 9], [447, 189, 11], [458, 192, 11], [456, 214, 12], [454, 232, 13], [463, 238, 0]] },
];

// Punto final del logo
const DOT: readonly P[] = [[463, 217], [465, 215.5], [470, 217.5], [477, 223], [477, 225], [473, 228], [467, 228], [463, 225], [463, 221]];

// Anillas: [x, y, radio del agujero]. Cada una lleva su lóbulo alrededor.
const HOLES: readonly (readonly [number, number, number])[] = [
  [291, 160.5, 2.2],
  [318.2, 181.5, 2],
  [373.2, 158.5, 2.2],
  [386.2, 182.5, 2],
  [443.2, 158.5, 2.2],
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
      g.beginPath();
      g.arc(at(0), at(1), Math.max(at(2) / 2, 0.02), 0, Math.PI * 2);
      g.fill();
    }
  }
}

export const LOGO = { x: 245, y: 148, w: 240, h: 106, center: [365, 200] as const };
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
  for (const [x, y] of HOLES) {
    g.beginPath();
    g.arc(x, y, 5.4, 0, Math.PI * 2);
    g.fill();
  }
  g.beginPath();
  outline(g, DOT);
  g.fill();
  g.globalCompositeOperation = "destination-out";
  for (const [x, y, r] of HOLES) {
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
