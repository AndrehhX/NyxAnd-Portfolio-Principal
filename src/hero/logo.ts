// Logo graffiti trazado a mano sobre la referencia, en coordenadas 736 x 414.
// Se rasteriza a un campo de distancia: el shader saca de ahÃ­ el bisel, el grosor y la refracciÃ³n.
type P = readonly [number, number];

const SHAPES: readonly (readonly P[])[] = [
  // S
  [
    [301, 154.5], [306, 155], [309, 159], [309, 165], [307, 172], [305, 182], [303, 195], [301.5, 203], [299, 206],
    [294, 207.5], [291, 206], [290.5, 203], [292, 192], [294, 182], [296, 176], [295.5, 174], [292, 176], [283, 184],
    [275, 191], [269, 196], [268.5, 198], [272, 203], [280, 211], [290, 219], [300, 227], [308, 233], [311, 236],
    [310.5, 238], [306, 241], [302, 243.5], [297, 241], [290, 238], [282, 236], [274, 236.5], [267, 239], [263, 243],
    [259, 245.5], [254, 246], [253, 244], [254, 238], [256, 230], [258, 222], [261, 215], [265, 212], [268, 212],
    [269.5, 214], [269.5, 225], [270, 226], [284, 225.5], [284, 223.5], [276, 216], [268, 208], [262, 202], [260, 198],
    [261, 193], [266, 187], [273, 180], [282, 170], [292, 160], [297, 156],
  ],
  // A, Z y N forman una sola pieza
  [
    [330.5, 176], [331, 172], [334, 169.5], [337.5, 170.5], [339.5, 174], [340, 177.5], [345, 173], [352, 167], [360, 160],
    [365, 156.5], [368.5, 156], [371, 158.5], [371, 165], [368.5, 173], [365, 181], [361, 190], [357, 200], [354, 209],
    [352.5, 214], [354, 215.5], [362, 214], [372, 211.5], [377.5, 209.5], [378.5, 204], [379.5, 195], [381, 185], [382, 176],
    [382.5, 171], [385, 168], [389, 167], [392, 168.5], [394, 172], [394, 177], [396, 178.5], [400, 176.5], [408, 175.5],
    [416, 173], [424, 169], [430, 164], [433, 160.5], [436, 159], [441, 160], [442.5, 162.5], [441, 166], [437, 172],
    [433, 178], [429, 184], [426, 191], [423, 198], [420, 202], [417, 202], [415.5, 199], [417, 193], [419.5, 186],
    [421, 179.5], [415, 181], [408, 184], [403, 186], [402, 193], [402.5, 203], [405, 212], [410, 219], [415, 225],
    [414, 227], [409, 229], [404, 228], [399, 223], [395, 213], [392, 200], [390, 189], [389, 190], [387.5, 203], [386, 213],
    [386, 218], [389, 219.5], [394, 220], [394.5, 225], [392.5, 229], [388, 230.5], [378, 231], [368, 232], [366.5, 230],
    [367, 227], [371, 222], [369, 221.5], [366, 224], [365, 228], [361, 226], [354, 226], [351, 227], [350, 230.5], [345, 231],
    [336, 230.5], [335, 229], [340, 219], [346, 205], [352, 190], [357, 177], [356, 174.5], [352, 176], [346, 180], [342, 182.5],
    [345, 187], [342, 190], [337, 191], [336, 200], [335, 215], [334.5, 228], [334, 231], [326, 231.5], [322, 230.5], [321, 224],
    [318, 218], [316, 216], [313, 219], [310, 224], [308.5, 228], [305, 229], [302.5, 227], [303, 223], [306, 218], [310, 213],
    [309.5, 211], [306, 208], [303, 205], [302.5, 202], [305, 199], [310, 198.5], [316, 197], [320, 194.5], [323, 190], [326, 185],
    [328, 180], [329.5, 176],
  ],
  // S final con su cinta
  [
    [445, 165], [448, 163.5], [453, 163.5], [454.5, 166], [452.5, 171], [452, 178], [454, 186], [458, 193], [458, 195], [453, 199.5],
    [449.5, 202.5], [449.5, 208], [450, 213], [447, 217], [441, 219], [434, 220], [431, 220.5], [431, 222], [437, 222], [445, 222],
    [450, 222.5], [450, 225], [444, 229], [437, 232], [430, 233], [424, 231], [421, 227], [421, 221], [423, 216], [426, 214.5],
    [433, 213.5], [438, 211], [439, 209], [433, 201], [429, 195], [426.5, 192], [428, 190.5], [431, 192.5], [433, 190.5], [438, 186],
    [442, 181.5], [443, 178], [443, 172],
  ],
  // Punto
  [[460, 214], [462, 212.5], [467, 214.5], [474, 220], [474, 222], [470, 225], [464, 225], [460, 222], [460, 218]],
];

// Ranuras internas que dibujan los contornos entre letras.
const SLITS: readonly (readonly P[])[] = [
  [[324.5, 195], [327, 196], [325, 207], [323, 208.5], [322.5, 207], [324, 200]],
  [[445, 184], [446.5, 184], [449, 201], [447.5, 201.5], [445.5, 192]],
];

// Agujeros de las anillas: [x, y, radio]
const HOLES: readonly (readonly [number, number, number])[] = [
  [303, 161.8, 2.2],
  [334.2, 173.4, 2],
  [388.2, 172, 2.2],
  [436, 163.8, 2.1],
  [449, 168, 2],
];

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
  for (const shape of SHAPES) {
    g.beginPath();
    outline(g, shape);
    g.fill();
  }
  g.globalCompositeOperation = "destination-out";
  for (const slit of SLITS) {
    g.beginPath();
    outline(g, slit);
    g.fill();
  }
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
