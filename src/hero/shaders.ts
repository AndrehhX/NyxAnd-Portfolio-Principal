export const VERT = /* glsl */ `#version 300 es
out vec2 vUv;
void main() {
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  vUv = p;
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

export const liquidFrag = (total: number, count: number) => /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 color;
uniform vec4 uPts[${total}];
uniform int uEnds[${count}];
uniform float uTime;
uniform vec2 uPointer;
uniform float uPointerForce;
const vec2 STAGE = vec2(736.0, 414.0);

vec2 flow(vec2 p, float t) {
  vec2 d = vec2(0.0);
  d += 30.0 * sin(p.yx * vec2(0.0072, 0.0058) + t * vec2(0.21, 0.17) + vec2(0.4, 1.9));
  d += 16.0 * sin(p.yx * vec2(0.0151, 0.0127) + t * vec2(-0.29, 0.26) + vec2(2.1, 0.7));
  d +=  7.0 * sin(p.yx * vec2(0.0310, 0.0268) + t * vec2(0.41, -0.37) + vec2(4.2, 3.1));
  return d;
}

// Remolinos encadenados: cada iteracion deforma a la anterior, como un fluido.
vec2 swirl(vec2 p, float t) {
  vec2 q = p * 0.013;
  vec2 o = q;
  for (int i = 0; i < 4; i++) {
    float f = float(i);
    q += 0.55 / (1.0 + f * 0.5) * sin(q.yx * (1.6 + f * 0.55)
      + vec2(t * (0.19 + f * 0.05), -t * (0.16 + f * 0.04))
      + vec2(f * 1.7, f * 2.9));
  }
  return q - o;
}

void main() {
  vec2 p = vec2(vUv.x, 1.0 - vUv.y) * STAGE;
  // La deformaciÃ³n vale cero en t = 0: el primer fotograma es la composiciÃ³n de referencia.
  float slow = uTime * 0.55;
  vec2 q = p + flow(p, slow) - flow(p, 0.0);
  q += flow(q * 1.35 + 40.0, slow * 0.8) * 0.35 - flow(q * 1.35 + 40.0, 0.0) * 0.35;

  vec2 eddy = swirl(p, slow * 1.6);
  q += eddy * 10.0;

  vec2 toPointer = p - uPointer;
  q += toPointer * exp(-dot(toPointer, toPointer) / 5200.0) * uPointerForce;

  float dark = 1.0;
  int start = 0;
  for (int r = 0; r < ${count}; r++) {
    int end = uEnds[r];
    float best = 0.0;
    float breathe = 1.0 + 0.12 * sin(uTime * 0.31 + float(r) * 1.7) * smoothstep(0.0, 6.0, uTime);
    for (int i = start; i < end - 1; i++) {
      vec4 a = uPts[i];
      vec4 b = uPts[i + 1];
      vec2 ab = b.xy - a.xy;
      float h = clamp(dot(q - a.xy, ab) / dot(ab, ab), 0.0, 1.0);
      vec2 c = a.xy + ab * h - q;
      float w = mix(a.z, b.z, h) * breathe * 1.24;
      float amp = mix(a.w, b.w, h);
      float d2 = dot(c, c) / (w * w);
      // NÃºcleo denso, caÃ­da suave y un halo ancho de humo alrededor.
      float core = exp(-pow(d2, 1.6) * 0.55);
      float halo = exp(-d2 * 0.1) * 0.15;
      best = max(best, amp * max(core, halo));
    }
    dark *= 1.0 - best;
    start = end;
  }
  float v = 1.0 - dark;
  // El canal verde guarda la fase de los pliegues que dibuja la composicion.
  float folds = 0.5 + 0.5 * sin((eddy.x - eddy.y) * 3.1);
  color = vec4(v, folds, 0.0, 1.0);
}`;

export const compositeFrag = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 color;
uniform sampler2D uLiquid;
uniform vec2 uRes;
uniform float uTime;
uniform float uReveal;
uniform vec4 uPanel;
uniform sampler2D uLogo;
uniform sampler2D uWires;
uniform vec2 uLogoCenter;
uniform float uLogoScale;
uniform vec4 uLogoBox;
uniform vec2 uLogoRefCenter;
uniform vec2 uLogoTexel;
uniform vec2 uWireOrigin;
uniform float uWireScale;
uniform vec4 uWireBox;
uniform vec2 uWireRefAnchor;
uniform vec2 uLight;

const vec3 BASE = vec3(0.066);
const vec3 SMOKE = vec3(0.30, 0.285, 0.26);
const vec3 CREAM = vec3(0.905, 0.85, 0.735);

vec3 ramp(float v) {
  vec3 c = mix(BASE, SMOKE, smoothstep(0.0, 0.5, v));
  return mix(c, CREAM, smoothstep(0.36, 0.64, v));
}
float hash(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}

void main() {
  vec2 frag = vUv * uRes;
  vec4 field = texture(uLiquid, vUv);
  float v = field.r;
  vec3 col = ramp(v);

  // Relieve del liquido a partir de su propio campo.
  vec2 texel = 1.5 / vec2(textureSize(uLiquid, 0));
  vec2 slope = vec2(
    texture(uLiquid, vUv + vec2(texel.x, 0.0)).r - texture(uLiquid, vUv - vec2(texel.x, 0.0)).r,
    texture(uLiquid, vUv + vec2(0.0, texel.y)).r - texture(uLiquid, vUv - vec2(0.0, texel.y)).r
  );
  vec3 normal = normalize(vec3(-slope * 6.0, 1.0));
  vec3 halfway = normalize(vec3(-0.38, 0.56, 0.74));
  float presence = smoothstep(0.05, 0.42, v);

  // Pliegues que siguen la forma de cada banda.
  float fold = sin(v * 15.0 + field.g * 5.0);
  float foldMask = smoothstep(0.17, 0.34, v) * (1.0 - smoothstep(0.52, 0.8, v));
  col += CREAM * smoothstep(0.7, 1.0, fold) * foldMask * 0.2;
  col *= 1.0 - smoothstep(0.4, 1.0, -fold) * foldMask * 0.28;

  // La crema deja de ser plana: conserva corrientes internas.
  float crest = smoothstep(0.62, 0.96, v);
  col *= mix(1.0, 0.9 + 0.1 * sin(field.g * 6.0 + v * 8.0), crest);

  // Sombra de contacto en un lado y filo de luz en el otro.
  col *= 1.0 - clamp(-dot(normal.xy, halfway.xy) * 1.3, 0.0, 1.0) * 0.38 * presence;
  float spec = pow(max(dot(normal, halfway), 0.0), 42.0);
  col += vec3(1.0, 0.965, 0.89) * spec * 0.42 * presence;

  vec2 pixel = vec2(frag.x, uRes.y - frag.y);
  vec2 pa = (pixel - uPanel.xy) / uPanel.zw;
  if (pa.x > 0.0 && pa.x < 1.0 && pa.y > 0.0 && pa.y < 1.0) {
    float frosted = textureLod(uLiquid, vUv, 3.2).r;
    vec3 glass = mix(vec3(0.2, 0.195, 0.185), vec3(0.122), smoothstep(0.0, 0.85, pa.x));
    glass += ramp(frosted) * 0.42 * (1.0 - pa.x * 0.75);
    glass *= mix(0.86, 1.0, smoothstep(1.0, 0.55, pa.y));
    // Luz que entra por el borde izquierdo del cristal.
    vec2 glow = (pa - vec2(0.0, 0.56)) / vec2(0.36, 0.2);
    glass = mix(glass, CREAM * 1.08, exp(-dot(glow, glow)) * 0.92);
    col = glass;
  }

  // Alambres: oscuros sobre la crema, encendidos sobre el negro.
  vec2 wp = (pixel - uWireOrigin) / uWireScale + uWireRefAnchor;
  vec2 wt = (wp - uWireBox.xy) / uWireBox.zw;
  if (wt.x > 0.0 && wt.x < 1.0 && wt.y > 0.0 && wt.y < 1.0) {
    vec4 w = texture(uWires, wt);
    if (w.a > 0.003) {
      vec3 wc = w.rgb / w.a;
      float l = dot(col, vec3(0.333));
      vec3 lit = mix(vec3(0.34, 0.32, 0.29), vec3(0.98, 0.95, 0.86), wc.g);
      vec3 ink = mix(vec3(0.05, 0.045, 0.035), vec3(0.52, 0.46, 0.36), wc.g * wc.g * 0.8);
      col = mix(col, mix(lit, ink, smoothstep(0.2, 0.52, l)), w.a * wc.r);
    }
  }

  // Logo: acrilico biselado que refracta el liquido que pasa por detras.
  vec2 lp = (pixel - uLogoCenter) / uLogoScale + uLogoRefCenter;
  vec2 lt = (lp - uLogoBox.xy) / uLogoBox.zw;
  if (lt.x > 0.0 && lt.x < 1.0 && lt.y > 0.0 && lt.y < 1.0) {
    float d = texture(uLogo, lt).r;
    float aa = 0.75 / uLogoScale;
    vec2 e = uLogoTexel * 1.5;
    vec2 grad = vec2(
      texture(uLogo, lt + vec2(e.x, 0.0)).r - texture(uLogo, lt - vec2(e.x, 0.0)).r,
      texture(uLogo, lt + vec2(0.0, e.y)).r - texture(uLogo, lt - vec2(0.0, e.y)).r
    );
    float gl = length(grad);
    vec2 g2 = gl > 1e-5 ? grad / gl : vec2(0.0);

    // Sombra de contacto, solo visible sobre zonas claras.
    float sv = dot(col, vec3(0.333));
    if (d < 0.0) col *= 1.0 - exp(d * 1.5) * 0.5 * smoothstep(0.12, 0.5, sv);

    float cover = smoothstep(-aa, aa, d);
    if (cover > 0.0) {
      float bevel = clamp(d / 1.6, 0.0, 1.0);
      float slope = (1.0 - bevel) * (1.0 - bevel);
      vec2 nxy = -g2 * slope;
      vec2 refr = vUv + vec2(nxy.x, -nxy.y) * 0.016 + vec2(-0.004, 0.003);
      float behind = textureLod(uLiquid, refr, 1.4).r;
      vec3 bg = ramp(behind);
      float lum = dot(bg, vec3(0.333));
      float bright = smoothstep(0.3, 0.62, lum);

      // Reflejo largo del liquido sobre la cara del cristal.
      float sheen = textureLod(uLiquid, vec2(vUv.x * 1.6 - 0.28, vUv.y * 0.55 + 0.22), 2.6).r;
      float streak = 0.5 + 0.5 * sin(lp.x * 0.19 + lp.y * 0.05 + 1.1);
      vec3 face = bg * mix(0.8, 1.12, bright);
      face += vec3(0.17, 0.165, 0.158) * (1.0 - bright) * (0.5 + 0.5 * streak);
      face += ramp(sheen) * 0.16 * (1.0 - bright);

      float facing = dot(g2 * -1.0, uLight);
      float lightOn = smoothstep(-0.35, 0.7, facing);
      float rim = exp(-pow((d - 0.82) / 0.46, 2.0));
      float edge = exp(-pow((d - 0.14) / 0.24, 2.0));
      vec3 rimCol = mix(vec3(0.97, 0.95, 0.89), vec3(0.17, 0.135, 0.09), bright);
      float rimAmt = mix(0.34 + 0.66 * lightOn, 0.98, bright);
      vec3 c = mix(face, rimCol, rim * rimAmt);
      // Sobre crema, las aristas que miran a la luz recuperan un filo blanco.
      c = mix(c, vec3(1.0, 0.98, 0.92), bright * smoothstep(0.55, 1.0, facing) * exp(-pow((d - 1.45) / 0.32, 2.0)) * 0.9);
      c = mix(c, vec3(0.03), edge * mix(0.62, 0.3, bright));
      col = mix(col, c, cover);
    }
  }

  col *= uReveal;
  float g = hash(frag + fract(uTime) * 311.0) - 0.5;
  col += g * 0.016;
  color = vec4(col, 1.0);
}`;
