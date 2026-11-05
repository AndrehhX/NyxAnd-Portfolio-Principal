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

void main() {
  vec2 p = vec2(vUv.x, 1.0 - vUv.y) * STAGE;
  // La deformación vale cero en t = 0: el primer fotograma es la composición de referencia.
  vec2 q = p + flow(p, uTime) - flow(p, 0.0);
  q += flow(q * 1.35 + 40.0, uTime * 0.8) * 0.35 - flow(q * 1.35 + 40.0, 0.0) * 0.35;

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
      float w = mix(a.z, b.z, h) * breathe * 1.42;
      float amp = mix(a.w, b.w, h);
      float d2 = dot(c, c) / (w * w);
      // Núcleo denso, caída suave y un halo ancho de humo alrededor.
      float core = exp(-d2 * 0.62);
      float halo = exp(-d2 * 0.085) * 0.2;
      best = max(best, amp * max(core, halo));
    }
    dark *= 1.0 - best;
    start = end;
  }
  float v = 1.0 - dark;
  color = vec4(v, v, v, 1.0);
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

const vec3 BASE = vec3(0.066);
const vec3 SMOKE = vec3(0.30, 0.285, 0.26);
const vec3 CREAM = vec3(0.905, 0.85, 0.735);

vec3 ramp(float v) {
  vec3 c = mix(BASE, SMOKE, smoothstep(0.0, 0.5, v));
  return mix(c, CREAM, smoothstep(0.3, 0.86, v));
}
float hash(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}

void main() {
  vec2 frag = vUv * uRes;
  float v = texture(uLiquid, vUv).r;
  vec3 col = ramp(v);

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

  col *= uReveal;
  float g = hash(frag + fract(uTime) * 311.0) - 0.5;
  col += g * 0.016;
  color = vec4(col, 1.0);
}`;
