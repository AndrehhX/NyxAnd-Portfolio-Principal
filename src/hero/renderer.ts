import { LOGO, buildLogoField } from "./logo";
import { packRibbons } from "./liquid";
import { VERT, compositeFrag, liquidFrag } from "./shaders";
import { SHOT_EVENT, stage } from "./state";
import { WIRES, buildWireCanvas } from "./wires";

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
  const gl = canvas.getContext("webgl2", { antialias: false, alpha: false, powerPreference: "high-performance", preserveDrawingBuffer: frozen });
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
  gl.uniform1i(C("uLogo"), 1);
  gl.uniform1i(C("uWires"), 2);

  const field = buildLogoField();
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.R16F, field.width, field.height, 0, gl.RED, gl.FLOAT, field.data);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.uniform4f(C("uLogoBox"), LOGO.x, LOGO.y, LOGO.w, LOGO.h);
  gl.uniform2f(C("uLogoRefCenter"), LOGO.center[0], LOGO.center[1]);
  gl.uniform2f(C("uLogoTexel"), 1 / field.width, 1 / field.height);

  gl.activeTexture(gl.TEXTURE2);
  gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, buildWireCanvas());
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.uniform4f(C("uWireBox"), WIRES.x, WIRES.y, WIRES.w, WIRES.h);
  gl.uniform2f(C("uWireRefAnchor"), WIRES.anchor[0], WIRES.anchor[1]);

  const pointer = { x: 368, y: 207, force: 0, tx: 368, ty: 207, tf: 0, vx: 0, vy: 0, hover: 0 };
  window.addEventListener("pointermove", (e) => {
    pointer.tx = (e.clientX / window.innerWidth) * 736;
    pointer.ty = (e.clientY / window.innerHeight) * 414;
    pointer.tf = 0.42;
  });
  document.documentElement.addEventListener("pointerleave", () => (pointer.tf = 0));

  const panelRect = new Float32Array(4);
  let panelTop = 0;
  let dprNow = 1;
  const layout = { logoX: 0, logoY: 0, logoScale: 1, wireX: 0, wireY: 0, wireScale: 1 };
  let maxDpr = 2;
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    canvas.width = Math.round(canvas.clientWidth * dpr);
    canvas.height = Math.round(canvas.clientHeight * dpr);
    dprNow = dpr;
    const r = panel.getBoundingClientRect();
    panelTop = r.top + window.scrollY;
    panelRect[0] = r.left * dpr;
    panelRect[2] = r.width * dpr;
    panelRect[3] = r.height * dpr;

    const W = canvas.width;
    const H = canvas.height;
    const portrait = W <= H;
    // En vertical el logo ocupa el ancho; en horizontal mantiene la proporcion de la referencia.
    layout.logoScale = portrait ? W / 310 : Math.min(W / 736, H / 414);
    layout.logoX = portrait ? W / 2 : (LOGO.center[0] / 736) * W;
    layout.logoY = portrait ? H * 0.5 : (LOGO.center[1] / 414) * H;
    layout.wireScale = portrait ? W / 400 : Math.min(W / 736, H / 414);
    layout.wireX = portrait ? W * 0.08 : (WIRES.anchor[0] / 736) * W;
    layout.wireY = portrait ? H * 0.66 : (WIRES.anchor[1] / 414) * H;
  };
  resize();

  const start = performance.now();
  // Si el equipo no llega a unos 40 fps, baja la resolucion una vez en lugar de dar tirones.
  let last = start;
  let shotTaken = false;
  let glow = 0;
  let slowFrames = 0;
  let sampled = 0;
  const frame = (now: number) => {
    const t = frozen ? 0 : (now - start) / 1000;
    const delta = now - last;
    last = now;
    if (maxDpr > 1 && delta < 250) {
      sampled++;
      if (delta > 25) slowFrames++;
      if (sampled === 90) {
        if (slowFrames > 45) {
          maxDpr = 1;
          resize();
        }
        sampled = 0;
        slowFrames = 0;
      }
    }
    pointer.x += (pointer.tx - pointer.x) * 0.06;
    pointer.y += (pointer.ty - pointer.y) * 0.06;
    pointer.force += ((frozen ? 0 : pointer.tf) - pointer.force) * 0.04;
    // El arrastre del puntero estira el cristal en la dirección del movimiento.
    const clampV = (v: number) => Math.max(-16, Math.min(16, v));
    pointer.vx += (clampV((pointer.tx - pointer.x) * 0.3) - pointer.vx) * 0.12;
    pointer.vy += (clampV((pointer.ty - pointer.y) * 0.3) - pointer.vy) * 0.12;
    pointer.hover += ((frozen ? 0 : pointer.tf > 0 ? 1 : 0) - pointer.hover) * 0.05;

    const scroll = window.scrollY;
    const viewH = window.innerHeight;
    const melt = Math.min(1, scroll / (viewH * 0.75));
    const entrance = frozen ? 0 : Math.pow(1 - Math.min(1, (now - start) / 1800), 3);
    panelRect[1] = (panelTop - scroll) * dprNow;

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
    // Una deriva minima con el puntero: el logo flota y la luz lo sigue.
    const px = frozen ? 0 : pointer.x / 368 - 1;
    const py = frozen ? 0 : pointer.y / 207 - 1;
    gl.uniform2f(C("uLogoCenter"), layout.logoX + px * 2.2 * layout.logoScale, layout.logoY + py * 1.4 * layout.logoScale - scroll * dprNow);
    gl.uniform1f(C("uLogoScale"), layout.logoScale);
    gl.uniform2f(C("uWireOrigin"), layout.wireX - px * 1.1 * layout.wireScale, layout.wireY - py * 0.8 * layout.wireScale - scroll * dprNow);
    gl.uniform1f(C("uWireScale"), layout.wireScale);
    const lx = 0.28 + px * 0.5;
    const ly = 0.96 + py * 0.2;
    const ll = Math.hypot(lx, ly);
    gl.uniform2f(C("uLight"), lx / ll, ly / ll);
    gl.uniform2f(C("uPointerPx"), (pointer.x / 736) * canvas.width, (pointer.y / 414) * canvas.height);
    gl.uniform2f(C("uPointerVel"), pointer.vx, pointer.vy);
    gl.uniform1f(C("uHover"), pointer.hover);
    gl.uniform1f(C("uDeform"), entrance + melt * 0.3);
    gl.uniform1f(C("uMelt"), melt);
    glow += (stage.glow - glow) * 0.08;
    const baseDim = stage.dimOverride ?? Math.min(1, scroll / (viewH * 0.8)) * 0.74;
    gl.uniform1f(C("uDim"), Math.max(0, baseDim - glow * 0.42));

    // Una sola vez: fotografía el líquido sin logo, alambres ni panel para usarlo en las tarjetas.
    if (!shotTaken && (frozen || now - start > 1700)) {
      shotTaken = true;
      gl.uniform2f(C("uLogoCenter"), -1e5, -1e5);
      gl.uniform2f(C("uWireOrigin"), -1e5, -1e5);
      gl.uniform4f(C("uPanel"), -10, -10, 0, 0);
      gl.uniform1f(C("uDim"), 0);
      gl.uniform1f(C("uReveal"), 1);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      stage.shot = canvas.toDataURL("image/jpeg", 0.82);
      window.dispatchEvent(new Event(SHOT_EVENT));
      requestAnimationFrame(frame);
      return;
    }
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    if (!frozen) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  // Asignar canvas.width borra el lienzo: el modo congelado debe volver a pintar.
  new ResizeObserver(() => {
    resize();
    if (frozen) requestAnimationFrame(frame);
  }).observe(canvas);
  if (frozen) window.addEventListener("scroll", () => requestAnimationFrame(frame), { passive: true });
  return gl;
}
