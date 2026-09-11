/* ============================================================
   ARKA PLAN — ReactBits "Line Waves", düz WebGL'e taşınmış hâli.

   Müşterinin ReactBits demo sayfasında ayarladığı değerler AYNEN
   (PARAMS). Linkte olmayan değerler demo sayfasının varsayılanları:
   brightness 0.2, edgeFadeWidth 0, fare etkileşimi açık, influence 2.0.

   NEDEN TAŞINDI: asıl bileşen React + ogl istiyor. Bu proje React
   kullanmıyor ve ogl'dan yalnız dört sınıf (Renderer, Program, Mesh,
   Triangle) tek bir tam ekran üçgen çizmek için kullanılıyor. İki
   bağımlılık eklemek yerine aynı iş ~100 satır WebGL. SHADER BİREBİR
   AYNI — tek harfine dokunulmadı; görüntü demodakiyle aynı olmalı.

   ogl'un varsayılanları da korundu: dpr 1 (çizgiler CSS pikselinde
   aynı kalınlıkta), alpha açık, premultipliedAlpha kapalı.

   KORUMALAR (orijinalde yok, menü telefonda açıldığı için gerekli):
   · WebGL yoksa ya da bağlam düşerse sessizce vazgeçer; CSS zemini
     (.ambient) kalır, sayfa bozulmaz.
   · prefers-reduced-motion: tek kare çizer, döngü kurmaz.
   · Sekme arka plandayken rAF zaten durur; katman sayfadan kalkınca
     (ana sayfaya dönüş) döngü kendini kapatır ve bağlamı bırakır.
   · ClientRouter: .ambient `transition:persist` ile sayfalar arasında
     yaşıyor; ikinci kez kurulmuyor, dalga sayfa değişince kesilmiyor.

   ------------------------------------------------------------
   Line Waves — React Bits (https://reactbits.dev)
   MIT + Commons Clause License Condition v1.0
   Copyright (c) 2026 David Haz

   Permission is hereby granted, free of charge, to any person obtaining
   a copy of this software and associated documentation files (the
   "Software"), to deal in the Software without restriction, including
   without limitation the rights to use, copy, modify, merge, publish,
   and distribute the Software as part of an application, website, or
   product, subject to the following conditions:

   The above copyright notice and this permission notice shall be
   included in all copies or substantial portions of the Software.

   Commons Clause Restriction: You may use this Software, including for
   any commercial purpose, so long as you do not sell, sublicense, or
   redistribute the components themselves - whether alone, in a bundle,
   or as a ported version.

   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
   EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
   MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
   NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
   LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
   OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
   WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
   ============================================================ */

/** Müşterinin ayarı — reactbits.dev/backgrounds/line-waves?… */
const PARAMS = {
  color1: '#9d7701',
  color2: '#ecd382',
  color3: '#b1902b',
  speed: 0.2,
  warpIntensity: 0.4,
  innerLineCount: 29,
  outerLineCount: 28,
  colorCycleSpeed: 2.3,
  rotation: 109,
  // linkte yok → demo varsayılanı
  edgeFadeWidth: 0.0,
  brightness: 0.2,
  enableMouseInteraction: true,
  mouseInfluence: 2.0,
} as const;

/** ogl Renderer varsayılanı — çizgi kalınlığı demodakiyle aynı kalsın */
const DPR = 1;

const vertexShader = `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`;

const fragmentShader = `
precision highp float;

uniform float uTime;
uniform vec3 uResolution;
uniform float uSpeed;
uniform float uInnerLines;
uniform float uOuterLines;
uniform float uWarpIntensity;
uniform float uRotation;
uniform float uEdgeFadeWidth;
uniform float uColorCycleSpeed;
uniform float uBrightness;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform vec2 uMouse;
uniform float uMouseInfluence;
uniform bool uEnableMouse;
uniform float uLightMode;

#define HALF_PI 1.5707963

float hashF(float n) {
  return fract(sin(n * 127.1) * 43758.5453123);
}

float smoothNoise(float x) {
  float i = floor(x);
  float f = fract(x);
  float u = f * f * (3.0 - 2.0 * f);
  return mix(hashF(i), hashF(i + 1.0), u);
}

float displaceA(float coord, float t) {
  float result = sin(coord * 2.123) * 0.2;
  result += sin(coord * 3.234 + t * 4.345) * 0.1;
  result += sin(coord * 0.589 + t * 0.934) * 0.5;
  return result;
}

float displaceB(float coord, float t) {
  float result = sin(coord * 1.345) * 0.3;
  result += sin(coord * 2.734 + t * 3.345) * 0.2;
  result += sin(coord * 0.189 + t * 0.934) * 0.3;
  return result;
}

vec2 rotate2D(vec2 p, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return vec2(p.x * c - p.y * s, p.x * s + p.y * c);
}

void main() {
  vec2 coords = gl_FragCoord.xy / uResolution.xy;
  coords = coords * 2.0 - 1.0;
  coords = rotate2D(coords, uRotation);

  float halfT = uTime * uSpeed * 0.5;
  float fullT = uTime * uSpeed;

  float mouseWarp = 0.0;
  if (uEnableMouse) {
    vec2 mPos = rotate2D(uMouse * 2.0 - 1.0, uRotation);
    float mDist = length(coords - mPos);
    mouseWarp = uMouseInfluence * exp(-mDist * mDist * 4.0);
  }

  float warpAx = coords.x + displaceA(coords.y, halfT) * uWarpIntensity + mouseWarp;
  float warpAy = coords.y - displaceA(coords.x * cos(fullT) * 1.235, halfT) * uWarpIntensity;
  float warpBx = coords.x + displaceB(coords.y, halfT) * uWarpIntensity + mouseWarp;
  float warpBy = coords.y - displaceB(coords.x * sin(fullT) * 1.235, halfT) * uWarpIntensity;

  vec2 fieldA = vec2(warpAx, warpAy);
  vec2 fieldB = vec2(warpBx, warpBy);
  vec2 blended = mix(fieldA, fieldB, mix(fieldA, fieldB, 0.5));

  float fadeTop = smoothstep(uEdgeFadeWidth, uEdgeFadeWidth + 0.4, blended.y);
  float fadeBottom = smoothstep(-uEdgeFadeWidth, -(uEdgeFadeWidth + 0.4), blended.y);
  float vMask = 1.0 - max(fadeTop, fadeBottom);

  float tileCount = mix(uOuterLines, uInnerLines, vMask);
  float scaledY = blended.y * tileCount;
  float nY = smoothNoise(abs(scaledY));

  float ridge = pow(
    step(abs(nY - blended.x) * 2.0, HALF_PI) * cos(2.0 * (nY - blended.x)),
    5.0
  );

  float lines = 0.0;
  for (float i = 1.0; i < 3.0; i += 1.0) {
    lines += pow(max(fract(scaledY), fract(-scaledY)), i * 2.0);
  }

  float pattern = vMask * lines;

  float cycleT = fullT * uColorCycleSpeed;
  float rChannel = (pattern + lines * ridge) * (cos(blended.y + cycleT * 0.234) * 0.5 + 1.0);
  float gChannel = (pattern + vMask * ridge) * (sin(blended.x + cycleT * 1.745) * 0.5 + 1.0);
  float bChannel = (pattern + lines * ridge) * (cos(blended.x + cycleT * 0.534) * 0.5 + 1.0);

  vec3 col = (rChannel * uColor1 + gChannel * uColor2 + bChannel * uColor3) * uBrightness;
  float alpha = clamp(length(col), 0.0, 1.0);

  if (uLightMode > 0.5) {
    vec3 weights = pow(max(vec3(rChannel, gChannel, bChannel), vec3(0.0)), vec3(3.0));
    float weightSum = max(weights.r + weights.g + weights.b, 0.0001);
    vec3 chroma = (weights.r * uColor1 + weights.g * uColor2 + weights.b * uColor3) / weightSum;
    float neutral = min(chroma.r, min(chroma.g, chroma.b));
    chroma = max(chroma - vec3(neutral * 0.92), vec3(0.0));
    float peak = max(chroma.r, max(chroma.g, chroma.b));
    chroma = pow(clamp(chroma / max(peak, 0.0001), 0.0, 1.0), vec3(1.08));
    float ink = clamp(max(rChannel, max(gChannel, bChannel)) * uBrightness * 1.15, 0.0, 0.92);
    gl_FragColor = vec4(mix(vec3(1.0), chroma, ink), 1.0);
  } else {
    gl_FragColor = vec4(col, alpha);
  }
}
`;

const hexToVec3 = (hex: string): [number, number, number] => {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ];
};

function compile(gl: WebGLRenderingContext, type: number, src: string): WebGLShader | null {
  const s = gl.createShader(type);
  if (!s) return null;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    gl.deleteShader(s);
    return null;
  }
  return s;
}

function mount(host: HTMLElement): void {
  // ClientRouter: katman kalıcı, ikinci kez kurma
  if (host.dataset['waves'] === 'on') return;

  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl', {
    alpha: true,
    premultipliedAlpha: false,
    antialias: false,
    depth: false,
    powerPreference: 'low-power',
  });
  if (!gl) return; // CSS zemini kalır

  const vs = compile(gl, gl.VERTEX_SHADER, vertexShader);
  const fs = compile(gl, gl.FRAGMENT_SHADER, fragmentShader);
  const prog = gl.createProgram();
  if (!vs || !fs || !prog) return;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);

  /* ogl Triangle'ın aynısı: ekranı taşan tek üçgen */
  const attr = (name: string, data: number[]) => {
    const loc = gl.getAttribLocation(prog, name);
    if (loc < 0) return; // derleyici kullanılmayanı atabilir
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  };
  attr('position', [-1, -1, 3, -1, -1, 3]);
  attr('uv', [0, 0, 2, 0, 0, 2]);

  const u = (name: string) => gl.getUniformLocation(prog, name);
  gl.uniform1f(u('uSpeed'), PARAMS.speed);
  gl.uniform1f(u('uInnerLines'), PARAMS.innerLineCount);
  gl.uniform1f(u('uOuterLines'), PARAMS.outerLineCount);
  gl.uniform1f(u('uWarpIntensity'), PARAMS.warpIntensity);
  gl.uniform1f(u('uRotation'), (PARAMS.rotation * Math.PI) / 180);
  gl.uniform1f(u('uEdgeFadeWidth'), PARAMS.edgeFadeWidth);
  gl.uniform1f(u('uColorCycleSpeed'), PARAMS.colorCycleSpeed);
  gl.uniform1f(u('uBrightness'), PARAMS.brightness);
  gl.uniform3fv(u('uColor1'), hexToVec3(PARAMS.color1));
  gl.uniform3fv(u('uColor2'), hexToVec3(PARAMS.color2));
  gl.uniform3fv(u('uColor3'), hexToVec3(PARAMS.color3));
  gl.uniform1f(u('uMouseInfluence'), PARAMS.mouseInfluence);
  gl.uniform1f(u('uLightMode'), 0);

  const uTime = u('uTime');
  const uRes = u('uResolution');
  const uMouse = u('uMouse');
  const uEnableMouse = u('uEnableMouse');

  gl.clearColor(0, 0, 0, 0);

  const resize = () => {
    const w = host.clientWidth;
    const h = host.clientHeight;
    canvas.width = Math.max(1, Math.round(w * DPR));
    canvas.height = Math.max(1, Math.round(h * DPR));
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform3f(uRes, canvas.width, canvas.height, canvas.width / canvas.height);
  };

  /* Fare: katman içeriğin ARKASINDA (pointer-events: none), olay tuvale
     ulaşmıyor. Katman tam ekran ve sabit olduğu için pencere koordinatı
     tuval koordinatıyla aynı — dinleyici pencerede. Dokunmatikte yok. */
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const useMouse = PARAMS.enableMouseInteraction && !still && matchMedia('(pointer: fine)').matches;
  gl.uniform1i(uEnableMouse, useMouse ? 1 : 0);

  const cur = [0.5, 0.5];
  let target = [0.5, 0.5];
  const onMove = (e: PointerEvent) => {
    target = [e.clientX / window.innerWidth, 1 - e.clientY / window.innerHeight];
  };
  const onLeave = () => { target = [0.5, 0.5]; };

  let raf = 0;

  const teardown = () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', resize);
    window.removeEventListener('pointermove', onMove);
    document.documentElement.removeEventListener('mouseleave', onLeave);
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    canvas.remove();
    delete host.dataset['waves'];
  };

  const draw = (t: number) => {
    gl.uniform1f(uTime, t * 0.001);
    if (useMouse) {
      cur[0]! += 0.05 * (target[0]! - cur[0]!);
      cur[1]! += 0.05 * (target[1]! - cur[1]!);
    }
    gl.uniform2f(uMouse, cur[0]!, cur[1]!);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  const loop = (t: number) => {
    // katman sayfadan kalktı (ana sayfaya dönüş): döngüyü kapat
    if (!host.isConnected) { teardown(); return; }
    draw(t);
    raf = requestAnimationFrame(loop);
  };

  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); teardown(); });

  window.addEventListener('resize', resize);
  if (useMouse) {
    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);
  }

  host.appendChild(canvas);
  host.dataset['waves'] = 'on';
  resize();

  if (still) {
    // hareket istenmiyor: temsilî tek kare, döngü yok
    draw(8000);
  } else {
    raf = requestAnimationFrame(loop);
  }
}

document.addEventListener('astro:page-load', () => {
  const host = document.querySelector<HTMLElement>('.ambient');
  if (host) mount(host);
});

/* Modül: diğer betiklerle aynı küresel kapsama düşmesin. */
export {};
