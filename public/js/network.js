// Contact: a drifting "neural network" on the right (same model as the reference hero network).
// Nodes drift inside a compact oval and bounce off its rim, each links to at most 4 close neighbours, and the pointer
// pushes nodes away while linking to the 7 nearest. Two colour families: the accent and the second accent.
(() => {
  const wrap = document.querySelector('.contact-net');
  if (!wrap) return;
  const canvas = wrap.querySelector('canvas'), ctx = canvas.getContext('2d');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  let W = 0, H = 0, nodes = [], raf = 0, last = 0, visible = false;
  const m = { active: false, strength: 0, tx: 0, ty: 0, x: 0, y: 0 };
  let colA = [215, 250, 99], colB = [255, 137, 94];
  const sprites = new Map();
  const RX = .47, RY = .45; // oval the nodes live in, as a share of the canvas

  const rgb = v => v.trim().split(/\s+/).map(Number);
  const hex = v => { v = v.trim().replace('#', ''); return v.length === 6 ? [0, 2, 4].map(i => parseInt(v.slice(i, i + 2), 16)) : null; };
  const colours = () => {
    const cs = getComputedStyle(document.documentElement);
    const deep = cs.getPropertyValue('--hl-deep-rgb');
    colA = deep.trim() ? rgb(deep) : rgb(cs.getPropertyValue('--accent-rgb'));
    colB = hex(cs.getPropertyValue('--accent-2')) || colB;
    sprites.clear();
  };
  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

  // soft glow sprite per colour, drawn once and reused
  const glow = c => {
    const key = c.join(',');
    if (sprites.has(key)) return sprites.get(key);
    const s = document.createElement('canvas'); s.width = s.height = 128;
    const g = s.getContext('2d'), r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    r.addColorStop(0, rgba(c, .8)); r.addColorStop(.16, rgba(c, .43)); r.addColorStop(.43, rgba(c, .14)); r.addColorStop(1, rgba(c, 0));
    g.fillStyle = r; g.fillRect(0, 0, 128, 128);
    sprites.set(key, s);
    return s;
  };

  // seeded random so the layout is the same on every visit
  const make = (w, h, n) => {
    let seed = 49734321;
    const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
    return Array.from({ length: n }, (_, i) => {
      const depth = .58 + rnd() * .42, speed = (7 + rnd() * 10) * depth, ang = rnd() * Math.PI * 2;
      const tier = (i * 11) % 20, fam = (i * 7) % 20;
      const size = tier < 6 ? 0 : tier < 15 ? 1 : 2;
      return {
        // start inside the ellipse (sqrt keeps the density even towards the rim)
        ...(() => { const a = rnd() * Math.PI * 2, r = Math.sqrt(rnd()) * .94; return { x: w / 2 + Math.cos(a) * r * w * RX, y: h / 2 + Math.sin(a) * r * h * RY }; })(),
        vx: Math.cos(ang) * speed, vy: Math.sin(ang) * speed, dx: Math.cos(ang) * speed, dy: Math.sin(ang) * speed,
        core: size === 0 ? 1.35 + rnd() * .5 : size === 1 ? 2.05 + rnd() * .75 : 3.25 + rnd() * 1.15,
        glowScale: size === 0 ? 4.7 : size === 1 ? 5.35 : 6.1,
        depth, phase: rnd() * Math.PI * 2, breathe: 62e-5 + rnd() * 54e-5, bright: .6 + rnd() * .2,
        b: fam >= 15   // second colour family for about a quarter of the nodes
      };
    });
  };

  const draw = (t, dt, move) => {
    ctx.clearRect(0, 0, W, H);
    if (!W || !H) return;
    const LINK = Math.max(108, Math.min(150, W * .19)), PUSH = Math.max(128, Math.min(178, W * .22));
    if (move) {
      const k = 1 - Math.exp(-dt * 12);
      m.x += (m.tx - m.x) * k; m.y += (m.ty - m.y) * k;
      m.strength += ((m.active ? 1 : 0) - m.strength) * (1 - Math.exp(-dt * 7));
      for (const p of nodes) {
        const wx = Math.sin(t * 17e-5 + p.phase) * 2.2, wy = Math.cos(t * 13e-5 + p.phase * 1.37) * 2;
        p.vx += (p.dx + wx - p.vx) * dt * .38; p.vy += (p.dy + wy - p.vy) * dt * .38;
        if (m.strength > .01) {
          const ex = p.x - m.x, ey = p.y - m.y, d = Math.hypot(ex, ey);
          if (d > .1 && d < PUSH) { const f = (1 - d / PUSH) ** 2 * 43 * m.strength; p.vx += ex / d * f * dt; p.vy += ey / d * f * dt; }
        }
        const sp = Math.hypot(p.vx, p.vy);
        if (sp > 28) { p.vx = p.vx / sp * 28; p.vy = p.vy / sp * 28; }
        p.x += p.vx * dt; p.y += p.vy * dt;
        // keep the network in one compact oval: bounce off its rim
        const rx = W * RX, ry = H * RY, nx = (p.x - W / 2) / rx, ny = (p.y - H / 2) / ry, e = Math.hypot(nx, ny);
        if (e > 1) {
          p.x = W / 2 + nx / e * rx; p.y = H / 2 + ny / e * ry;
          let gx = nx / rx, gy = ny / ry; const gl = Math.hypot(gx, gy); gx /= gl; gy /= gl;
          const vd = p.vx * gx + p.vy * gy, dd = p.dx * gx + p.dy * gy;
          if (vd > 0) { p.vx = (p.vx - 2 * vd * gx) * .88; p.vy = (p.vy - 2 * vd * gy) * .88; }
          if (dd > 0) { p.dx -= 2 * dd * gx; p.dy -= 2 * dd * gy; }
        }
      }
    }
    // links: grid lookup, at most 4 per node
    const grid = new Map(), count = new Uint8Array(nodes.length);
    nodes.forEach((p, i) => { const key = `${Math.floor(p.x / LINK)},${Math.floor(p.y / LINK)}`; (grid.get(key) || grid.set(key, []).get(key)).push(i); });
    ctx.lineWidth = 1.25;
    nodes.forEach((a, i) => {
      const gx = Math.floor(a.x / LINK), gy = Math.floor(a.y / LINK);
      for (let ox = -1; ox <= 1; ox++) for (let oy = -1; oy <= 1; oy++) {
        const cell = grid.get(`${gx + ox},${gy + oy}`);
        if (!cell) continue;
        for (const j of cell) {
          if (j <= i || count[i] >= 4 || count[j] >= 4) continue;
          const b = nodes[j], d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d >= LINK) continue;
          const u = 1 - d / LINK, al = Math.min(.6, .14 + (u * .4 + u * u * .3) * Math.min(a.depth, b.depth));
          ctx.strokeStyle = rgba(a.b || b.b ? colB : colA, al.toFixed(3));
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          count[i]++; count[j]++;
        }
      }
    });
    // pointer links to the 7 nearest nodes
    if (m.strength > .01) {
      ctx.lineWidth = 1.5;
      nodes.map(p => [p, Math.hypot(p.x - m.x, p.y - m.y)]).filter(([, d]) => d < PUSH).sort((a, b) => a[1] - b[1]).slice(0, 7).forEach(([p, d]) => {
        const u = 1 - d / PUSH;
        ctx.strokeStyle = rgba(p.b ? colB : colA, Math.min(.95, (.28 + u * .66 + u * u * .4) * m.strength).toFixed(3));
        ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(p.x, p.y); ctx.stroke();
      });
    }
    // nodes: glow sprite, coloured core, bright centre
    for (const p of nodes) {
      const c = p.b ? colB : colA, br = reduced ? 0 : Math.sin(t * p.breathe + p.phase);
      const a = p.bright * (.88 + br * .12), r = p.core * p.depth * (1 + br * .055), s = r * p.glowScale;
      ctx.globalAlpha = Math.min(1, a * .92); ctx.drawImage(glow(c), p.x - s, p.y - s, s * 2, s * 2);
      ctx.globalAlpha = Math.min(1, a);
      ctx.fillStyle = rgba(c, .98); ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(1.45, r), 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(247,255,240,.68)'; ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(.52, r * .36), 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  };

  const loop = t => {
    const dt = last ? Math.min((t - last) / 1000, .034) : 1 / 60;
    last = t; draw(t, dt, true);
    raf = visible && !document.hidden ? requestAnimationFrame(loop) : 0;
  };
  const start = () => { if (!reduced && visible && !raf) { last = 0; raf = requestAnimationFrame(loop); } };

  const size = () => {
    const r = canvas.getBoundingClientRect(), w = Math.max(1, r.width), h = Math.max(1, r.height);
    const dpr = Math.min(devicePixelRatio || 1, 1.75), n = w < 560 ? 22 : 40;
    if (Math.abs(w - W) <= 1 && Math.abs(h - H) <= 1 && nodes.length === n) return;
    W = w; H = h; canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    nodes = make(W, H, n);
    m.tx = m.x = W * .52; m.ty = m.y = H * .5;
    draw(performance.now(), 0, false);
  };

  const section = wrap.closest('section') || wrap;
  section.addEventListener('pointermove', e => {
    if (!fine || e.pointerType === 'touch') return;
    const r = canvas.getBoundingClientRect();
    m.tx = e.clientX - r.left; m.ty = e.clientY - r.top;
    m.active = m.tx > -40 && m.tx < W + 40 && m.ty > -40 && m.ty < H + 40;
  }, { passive: true });
  section.addEventListener('pointerleave', () => { m.active = false; });
  document.addEventListener('visibilitychange', start);
  new ResizeObserver(size).observe(canvas);
  new MutationObserver(() => { colours(); if (reduced) draw(performance.now(), 0, false); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) start(); }, { threshold: .01 }).observe(wrap);
  colours(); size();
})();
