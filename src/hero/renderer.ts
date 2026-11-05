import { packRibbons } from "./liquid";
import { VERT, compositeFrag, liquidFrag } from "./shaders";

function program(gl: WebGL2RenderingContext, fs: string) {
  const compile = (type: number, source: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, source);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader");
    return s;
  };
  const p = gl.createProgram()!;
  gl.attachShader(p, compile(gl.VERTEX_SHADER, VERT));
  gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) ?? "link");
  return p;
}

export interface HeroOptions {
  canvas: HTMLCanvasElement;
  panel: HTMLElement;
  frozen: boolean;
}

export function createHero({ canvas, panel, frozen }: HeroOptions) {
  const gl = canvas.getContext("webgl2", { antialias: false, alpha: false, powerPreference: "high-performance" });
  if (!gl) return null;

  const ribbons = packRibbons();
  const liquid = program(gl, liquidFrag(ribbons.total, ribbons.count));
  const composite = program(gl, compositeFrag);
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  const floatTarget = !!gl.getExtension("EXT_color_buffer_float");
  const FBO_W = 512;
  const FBO_H = 288;
  const liquidTex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, liquidTex);
  gl.texStorage2D(gl.TEXTURE_2D, 5, floatTarget ? gl.RGBA16F : gl.RGBA8, FBO_W, FBO_H);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const fbo = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, liquidTex, 0);

  const L = (name: string) => gl.getUniformLocation(liquid, name);
  const C = (name: string) => gl.getUniformLocation(composite, name);
  gl.useProgram(liquid);
  gl.uniform4fv(L("uPts"), ribbons.points);
  gl.uniform1iv(L("uEnds"), ribbons.ends);
  gl.useProgram(composite);
  gl.uniform1i(C("uLiquid"), 0);

  const pointer = { x: 368, y: 207, force: 0, tx: 368, ty: 207, tf: 0 };
  window.addEventListener("pointermove", (e) => {
    pointer.tx = (e.clientX / window.innerWidth) * 736;
    pointer.ty = (e.clientY / window.innerHeight) * 414;
    pointer.tf = 0.42;
  });
  document.documentElement.addEventListener("pointerleave", () => (pointer.tf = 0));

  let panelRect = new Float32Array(4);
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(canvas.clientWidth * dpr);
    canvas.height = Math.round(canvas.clientHeight * dpr);
    const r = panel.getBoundingClientRect();
    panelRect = new Float32Array([r.left * dpr, r.top * dpr, r.width * dpr, r.height * dpr]);
  };
  resize();
  new ResizeObserver(resize).observe(canvas);

  const start = performance.now();
  const frame = (now: number) => {
    const t = frozen ? 0 : (now - start) / 1000;
    pointer.x += (pointer.tx - pointer.x) * 0.06;
    pointer.y += (pointer.ty - pointer.y) * 0.06;
    pointer.force += ((frozen ? 0 : pointer.tf) - pointer.force) * 0.04;

    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.viewport(0, 0, FBO_W, FBO_H);
    gl.useProgram(liquid);
    gl.uniform1f(L("uTime"), t);
    gl.uniform2f(L("uPointer"), pointer.x, pointer.y);
    gl.uniform1f(L("uPointerForce"), pointer.force);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, liquidTex);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.useProgram(composite);
    gl.uniform2f(C("uRes"), canvas.width, canvas.height);
    gl.uniform1f(C("uTime"), t);
    gl.uniform1f(C("uReveal"), frozen ? 1 : Math.min(1, (now - start) / 1400));
    gl.uniform4fv(C("uPanel"), panelRect);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    if (!frozen) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  if (frozen) window.addEventListener("resize", () => requestAnimationFrame(frame));
  return gl;
}
