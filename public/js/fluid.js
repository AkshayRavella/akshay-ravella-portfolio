// Hero backdrop: a small WebGL2 fluid simulation. Cursor movement stirs the fluid and leaves a
// glowing, softly shaded smoke trail in the theme accent that swirls and then fades.
(() => {
  const canvas = document.querySelector('.hero-fluid');
  if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false });
  if (!gl || !gl.getExtension('EXT_color_buffer_float')) { canvas.remove(); return; }

  const SIM = 128, DYE = 512;                 // simulation / smoke grid size
  const CURL = 9, PRESSURE_ITERS = 18;         // swirl strength, solver quality
  const VEL_FADE = 0.9, DYE_FADE = 1.9;        // how fast motion and smoke settle
  const FORCE = 4200, RADIUS = 0.00052;         // cursor push strength and size
  const MAX_PUSH = 1600;                       // cap on very fast flicks (prevents grainy artifacts)

  // ---------- shaders ----------
  const VS = `#version 300 es
in vec2 aPos; uniform vec2 texel;
out vec2 vUv, vL, vR, vT, vB;
void main(){ vUv=aPos*.5+.5; vL=vUv-vec2(texel.x,0.); vR=vUv+vec2(texel.x,0.); vT=vUv+vec2(0.,texel.y); vB=vUv-vec2(0.,texel.y); gl_Position=vec4(aPos,0.,1.); }`;
  const head = `#version 300 es
precision highp float; in vec2 vUv, vL, vR, vT, vB; out vec4 o;`;
  const FS = {
    splat: head + `uniform sampler2D uTarget; uniform float aspect, radius; uniform vec3 color; uniform vec2 point;
void main(){ vec2 p=vUv-point; p.x*=aspect; o=vec4(texture(uTarget,vUv).xyz+exp(-dot(p,p)/radius)*color,1.); }`,
    advect: head + `uniform sampler2D uVelocity, uSource; uniform vec2 texel; uniform float dt, fade;
void main(){ vec2 c=vUv-dt*texture(uVelocity,vUv).xy*texel; o=texture(uSource,c)/(1.+fade*dt); }`,
    divergence: head + `uniform sampler2D uVelocity;
void main(){ float L=texture(uVelocity,vL).x, R=texture(uVelocity,vR).x, T=texture(uVelocity,vT).y, B=texture(uVelocity,vB).y;
vec2 C=texture(uVelocity,vUv).xy; if(vL.x<0.)L=-C.x; if(vR.x>1.)R=-C.x; if(vT.y>1.)T=-C.y; if(vB.y<0.)B=-C.y;
o=vec4(.5*(R-L+T-B),0.,0.,1.); }`,
    curl: head + `uniform sampler2D uVelocity;
void main(){ o=vec4(.5*(texture(uVelocity,vR).y-texture(uVelocity,vL).y-texture(uVelocity,vT).x+texture(uVelocity,vB).x),0.,0.,1.); }`,
    vorticity: head + `uniform sampler2D uVelocity, uCurl; uniform float curl, dt;
void main(){ float L=texture(uCurl,vL).x, R=texture(uCurl,vR).x, T=texture(uCurl,vT).x, B=texture(uCurl,vB).x, C=texture(uCurl,vUv).x;
vec2 f=.5*vec2(abs(T)-abs(B),abs(R)-abs(L)); f/=length(f)+1e-4; f*=curl*C; f.y*=-1.;
o=vec4(clamp(texture(uVelocity,vUv).xy+f*dt,-1000.,1000.),0.,1.); }`,
    pressure: head + `uniform sampler2D uPressure, uDivergence;
void main(){ o=vec4((texture(uPressure,vL).x+texture(uPressure,vR).x+texture(uPressure,vB).x+texture(uPressure,vT).x-texture(uDivergence,vUv).x)*.25,0.,0.,1.); }`,
    gradient: head + `uniform sampler2D uPressure, uVelocity;
void main(){ vec2 v=texture(uVelocity,vUv).xy-vec2(texture(uPressure,vR).x-texture(uPressure,vL).x,texture(uPressure,vT).x-texture(uPressure,vB).x); o=vec4(v,0.,1.); }`,
    scale: head + `uniform sampler2D uTexture; uniform float value;
void main(){ o=value*texture(uTexture,vUv); }`,
    // Smoke: tone-mapped dye with a little surface shading so swirls read as volume, not a flat stain.
    display: head + `uniform sampler2D uDye; uniform vec2 texel; uniform float hot, strength, lift, depth;
void main(){
  vec3 c=texture(uDye,vUv).rgb;
  float dx=length(texture(uDye,vR).rgb)-length(texture(uDye,vL).rgb);
  float dy=length(texture(uDye,vT).rgb)-length(texture(uDye,vB).rgb);
  vec3 n=normalize(vec3(dx,dy,length(texel)*6.));
  c*=clamp(dot(n,vec3(0.,0.,1.))+.94,.94,1.);
  float m=max(c.r,max(c.g,c.b));
  float a=pow(1.-exp(-m*strength),lift);   // lift mid-tones so thin wisps glow instead of going muddy
  vec3 col=m>1e-4?c/m:vec3(0.);
  col*=depth;                                // <1 keeps a deep tone on light pages
  col=mix(col,vec3(1.),smoothstep(.55,1.,a)*hot);
  o=vec4(col*a,a);
}`
  };

  const compile = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
  const vs = compile(gl.VERTEX_SHADER, VS);
  const programs = {};
  try {
    for (const [name, src] of Object.entries(FS)) {
      const p = gl.createProgram(); gl.attachShader(p, vs); gl.attachShader(p, compile(gl.FRAGMENT_SHADER, src));
      gl.bindAttribLocation(p, 0, 'aPos'); gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
      const u = {}; const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
      for (let i = 0; i < n; i++) { const info = gl.getActiveUniform(p, i); u[info.name] = gl.getUniformLocation(p, info.name); }
      programs[name] = { p, u };
    }
  } catch (e) { console.warn('hero fluid disabled:', e); canvas.remove(); return; }

  // Full-screen quad
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  const fbo = (w, h) => {
    const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null);
    const fb = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    return { tex, fb, w, h, tx: 1 / w, ty: 1 / h };
  };
  const pair = (w, h) => { let a = fbo(w, h), b = fbo(w, h); return { get read() { return a; }, get write() { return b; }, swap() { [a, b] = [b, a]; }, w, h, tx: 1 / w, ty: 1 / h }; };

  let velocity, dye, pressure, divergence, curl;
  const initTargets = () => {
    const aspect = canvas.width / canvas.height || 1;
    const sw = Math.round(aspect >= 1 ? SIM * aspect : SIM), sh = Math.round(aspect >= 1 ? SIM : SIM / aspect);
    const dw = Math.round(aspect >= 1 ? DYE * aspect : DYE), dh = Math.round(aspect >= 1 ? DYE : DYE / aspect);
    velocity = pair(sw, sh); pressure = pair(sw, sh); divergence = fbo(sw, sh); curl = fbo(sw, sh); dye = pair(dw, dh);
  };

  const tex = (unit, t) => { gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t.tex); return unit; };
  const run = (name, target, uniforms) => {
    const { p, u } = programs[name]; gl.useProgram(p);
    const t = target || { w: canvas.width, h: canvas.height, tx: 1 / velocity.w, ty: 1 / velocity.h };
    if (u.texel) gl.uniform2f(u.texel, (target && target.tx) || velocity.tx, (target && target.ty) || velocity.ty);
    for (const [k, v] of Object.entries(uniforms)) {
      if (!u[k]) continue;
      if (typeof v === 'number') gl.uniform1f(u[k], v);
      else if (v.unit !== undefined) gl.uniform1i(u[k], v.unit);
      else if (v.length === 2) gl.uniform2f(u[k], v[0], v[1]);
      else if (v.length === 3) gl.uniform3f(u[k], v[0], v[1], v[2]);
    }
    gl.viewport(0, 0, t.w, t.h);
    gl.bindFramebuffer(gl.FRAMEBUFFER, target ? target.fb : null);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };
  const S = unit => ({ unit });

  const splat = (x, y, dx, dy) => {
    const aspect = canvas.width / canvas.height;
    run('splat', velocity.write, { uTarget: S(tex(0, velocity.read)), aspect, point: [x, y], color: [dx, dy, 0], radius: RADIUS * (aspect > 1 ? aspect : 1) });
    velocity.swap();
    const k = Math.min(Math.hypot(dx, dy) / 16000, 0.09) + 0.012;
    const t = 0.5 + 0.5 * Math.sin(performance.now() / 1400);
    const mix = colors.drift * t;
    const col = colors.smoke.map((v, i) => (v * (1 - mix) + colors.smoke2[i] * mix) * k);
    run('splat', dye.write, { uTarget: S(tex(0, dye.read)), aspect, point: [x, y], color: col, radius: RADIUS * 1.25 * (aspect > 1 ? aspect : 1) });
    dye.swap();
  };

  const step = dt => {
    gl.disable(gl.BLEND);
    run('curl', curl, { uVelocity: S(tex(0, velocity.read)) });
    run('vorticity', velocity.write, { uVelocity: S(tex(0, velocity.read)), uCurl: S(tex(1, curl)), curl: CURL, dt }); velocity.swap();
    run('divergence', divergence, { uVelocity: S(tex(0, velocity.read)) });
    run('scale', pressure.write, { uTexture: S(tex(0, pressure.read)), value: 0.8 }); pressure.swap();
    for (let i = 0; i < PRESSURE_ITERS; i++) { run('pressure', pressure.write, { uPressure: S(tex(0, pressure.read)), uDivergence: S(tex(1, divergence)) }); pressure.swap(); }
    run('gradient', velocity.write, { uPressure: S(tex(0, pressure.read)), uVelocity: S(tex(1, velocity.read)) }); velocity.swap();
    run('advect', velocity.write, { uVelocity: S(tex(0, velocity.read)), uSource: S(tex(0, velocity.read)), dt, fade: VEL_FADE }); velocity.swap();
    run('advect', dye.write, { uVelocity: S(tex(0, velocity.read)), uSource: S(tex(1, dye.read)), dt, fade: DYE_FADE, texel: [velocity.tx, velocity.ty] }); dye.swap();
  };

  // ---------- theme colours ----------
  let colors = {};
  const hex = h => { h = h.trim().replace('#', ''); if (h.length === 3) h = h.split('').map(x => x + x).join(''); return [0, 2, 4].map(k => parseInt(h.slice(k, k + 2), 16) / 255); };
  const readTheme = () => {
    const cs = getComputedStyle(document.documentElement);
    const rgb = cs.getPropertyValue('--accent-rgb').trim().split(/[\s,]+/).map(Number);
    const accent = rgb.length === 3 && rgb.every(n => !isNaN(n)) ? rgb.map(n => n / 255) : [0.84, 0.98, 0.39];
    let accent2 = [1, 0.54, 0.37];
    try { const a2 = cs.getPropertyValue('--accent-2'); if (a2.trim().startsWith('#')) accent2 = hex(a2); } catch (e) { /* keep default */ }
    const theme = document.documentElement.dataset.theme;
    const paper = theme === 'paper';
    // Lavender: Deep Indigo ink with the faintest drift toward Tangerine Glow.
    if (theme === 'lavender') { colors = { smoke: [0.17, 0.18, 0.36], smoke2: [1, 0.54, 0.12], drift: 0.08, hot: 0, strength: 15, lift: 0.62, depth: 0.42 }; return; }
    colors = paper
      // Paper uses Acid's lime family, deepened to read on a light page: leaf green drifting to a deeper forest green.
      ? { smoke: [0.36, 0.62, 0.04], smoke2: [0.16, 0.42, 0.12], drift: 0.45, hot: 0, strength: 16, lift: 0.62, depth: 0.62 }
      : { smoke: accent, smoke2: accent2, drift: 0.3, hot: 0.5, strength: 15, lift: 0.55, depth: 1 };
  };
  readTheme();
  new MutationObserver(readTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  // ---------- size ----------
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const r = canvas.getBoundingClientRect();
    const w = Math.max(2, Math.round(r.width * dpr)), h = Math.max(2, Math.round(r.height * dpr));
    if (w === canvas.width && h === canvas.height && velocity) return;
    canvas.width = w; canvas.height = h; initTargets();
  };
  resize();
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas);

  // ---------- pointer ----------
  let last = null;
  const onMove = e => {
    const r = canvas.getBoundingClientRect();
    if (e.clientY < r.top || e.clientY > r.bottom) { last = null; return; }
    const x = (e.clientX - r.left) / r.width, y = 1 - (e.clientY - r.top) / r.height;
    if (last) {
      let dx = (x - last.x) * FORCE * (r.width / r.height), dy = (y - last.y) * FORCE;
      const len = Math.hypot(dx, dy);
      if (len > MAX_PUSH) { dx *= MAX_PUSH / len; dy *= MAX_PUSH / len; }
      if (len > 0.5) queued.push([x, y, dx, dy]);
    }
    last = { x, y };
    wake();
  };
  const queued = [];
  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('pointerleave', () => { last = null; });

  // ---------- loop (pauses off-screen / hidden / when settled) ----------
  let visible = true, raf = 0, prev = performance.now(), idleFrames = 0;
  const frame = now => {
    raf = 0;
    if (!visible || document.hidden) return;
    const dt = Math.min((now - prev) / 1000, 1 / 30); prev = now;
    while (queued.length) splat(...queued.shift());
    step(dt);
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    run('display', null, { uDye: S(tex(0, dye.read)), texel: [dye.tx, dye.ty], hot: colors.hot, strength: colors.strength, lift: colors.lift, depth: colors.depth });
    // Keep simulating ~4s after the last movement so swirls can settle, then sleep.
    idleFrames++;
    if (idleFrames < 240) raf = requestAnimationFrame(frame);
  };
  const wake = () => { idleFrames = 0; if (!raf) { prev = performance.now(); raf = requestAnimationFrame(frame); } };
  if ('IntersectionObserver' in window) new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) wake(); }).observe(canvas);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) wake(); });
  new MutationObserver(wake).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  // A gentle opening swirl so the effect is discoverable before anyone moves the mouse.
  setTimeout(() => {
    // Spread over a few frames so the splats don't pile up in one spot.
    for (let i = 0; i < 6; i++) setTimeout(() => { const a = i / 5 * Math.PI * 1.2; queued.push([0.7 + Math.cos(a) * 0.09, 0.5 + Math.sin(a) * 0.16, -Math.sin(a) * 380, Math.cos(a) * 380]); wake(); }, i * 45);
  }, 900);
  wake();
})();
