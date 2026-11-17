// Hero → Point of view, scroll-driven and reversible (eased toward the scroll position).
// 1) the AI engine powers up (wires retract, capability boxes are pulled in), 2) a circular portal opens
// from the engine until it fills the screen, 3) inside it the manifesto streams in like an LLM answer.
// Phones: no pinning; the circle opens and the headline streams as Point of view scrolls in.
(() => {
  const sec = document.querySelector('.portal');
  if (!sec || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const stage = sec.querySelector('.pt-stage');
  const hero = stage.querySelector('.hero');
  const hole = stage.querySelector('.pt-hole');
  const ring = stage.querySelector('.pt-ring');
  const core = hero.querySelector('.ai-core');
  const nodes = [...hero.querySelectorAll('.ai-node')];
  const fades = [...hero.querySelectorAll('.ai-wire, .ai-prompt, .ai-readout, .packet')];
  const heroText = [...hero.querySelectorAll('.hero-copy, .hero-top, .hero-foot')];
  const headline = hole.querySelector('.pt-stream');
  const later = [...hole.querySelectorAll('.pt-fade')];
  const desktop = window.matchMedia('(min-width: 992px)');
  sec.classList.add('pt-live');

  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  // Split the headline into characters (keeping the inner <span>) so it can be written out.
  const chars = [];
  const split = el => [...el.childNodes].forEach(n => {
    if (n.nodeType === 3) {
      const frag = document.createDocumentFragment();
      for (const ch of n.textContent) {
        const s = document.createElement('span');
        s.className = 'pt-ch'; s.textContent = ch; s.dataset.c = ch;
        frag.append(s); chars.push(s);
      }
      n.replaceWith(frag);
    } else if (n.nodeType === 1) split(n);
  });
  headline.setAttribute('aria-label', headline.textContent.trim());
  split(headline);
  const GLYPHS = '01<>/{}[]#*+=$%&@ΣΔλ';
  const WINDOW = 7; // characters still "decoding" ahead of the cursor

  let cx = 0, cy = 0, rMax = 0, pulls = [];
  const measure = () => {
    const s = stage.getBoundingClientRect(), c = core.getBoundingClientRect();
    cx = c.left + c.width / 2 - s.left; cy = c.top + c.height / 2 - s.top;
    rMax = Math.hypot(Math.max(cx, s.width - cx), Math.max(cy, s.height - cy)) + 30;
    pulls = nodes.map(n => { const r = n.getBoundingClientRect(); return [c.left + c.width / 2 - (r.left + r.width / 2), c.top + c.height / 2 - (r.top + r.height / 2)]; });
  };

  let target = 0, cur = 0, raf = 0;
  const read = () => {
    if (desktop.matches) {
      const total = sec.offsetHeight - stage.offsetHeight;
      target = clamp(-sec.getBoundingClientRect().top / total);
    } else {
      const r = hole.getBoundingClientRect(), vh = innerHeight;
      target = clamp((vh * .95 - r.top) / (vh * .85));
    }
    if (!raf) raf = requestAnimationFrame(tick);
  };
  const tick = () => {
    cur += (target - cur) * 0.14;
    if (Math.abs(target - cur) < 0.0004) cur = target;
    render(cur);
    raf = cur === target ? 0 : requestAnimationFrame(tick);
  };

  const stream = q => {
    const n = Math.round(q * chars.length);
    chars.forEach((s, i) => {
      s.classList.toggle('is-off', i >= n + WINDOW);
      const scr = i >= n && i < n + WINDOW && q < 1;
      s.classList.toggle('is-scr', scr);
      if (scr && s.dataset.c.trim()) s.dataset.g = GLYPHS[(Math.random() * GLYPHS.length) | 0]; // drawn over the real letter, so widths never change
      s.classList.toggle('is-cur', i === Math.max(0, n - 1) && q > 0);
    });
  };

  const render = p => {
    if (!desktop.matches) return renderMobile(p);
    // 0 → .22: the engine powers up and pulls its capability boxes in
    const pull = ease(clamp(p / .22));
    nodes.forEach((n, i) => {
      if (pull === 0) { n.style.transform = ''; n.style.opacity = ''; return; }
      const [dx, dy] = pulls[i] || [0, 0];
      n.style.transform = `translate(${(dx * pull * .9).toFixed(1)}px, ${(dy * pull * .9).toFixed(1)}px) scale(${(1 - pull * .7).toFixed(3)})`;
      n.style.opacity = (1 - pull).toFixed(3);
    });
    fades.forEach(el => { el.style.opacity = pull ? (1 - pull).toFixed(3) : ''; });
    core.style.transform = pull ? `translate(-50%, -50%) scale(${(1 + pull * .45).toFixed(3)})` : '';
    heroText.forEach(el => { el.style.opacity = (1 - clamp((p - .08) / .3) * .85).toFixed(3); });
    // .15 → .55: the portal opens from the engine
    const open = ease(clamp((p - .15) / .4));
    const r = open * rMax;
    hole.style.clipPath = `circle(${r.toFixed(1)}px at ${cx.toFixed(1)}px ${cy.toFixed(1)}px)`;
    Object.assign(ring.style, { left: cx + 'px', top: cy + 'px', width: 2 * r + 'px', height: 2 * r + 'px', opacity: r > 1 && open < .98 ? 1 : 0 });
    // .45 → .85: the headline streams in; then the rest of the section settles
    stream(clamp((p - .45) / .4));
    const rest = clamp((p - .8) / .15);
    later.forEach(el => { el.style.opacity = rest; el.style.transform = `translateY(${((1 - rest) * 18).toFixed(1)}px)`; });
  };

  const renderMobile = p => {
    const open = ease(clamp(p / .5));
    const w = hole.offsetWidth, h = hole.offsetHeight;
    hole.style.clipPath = `circle(${(open * Math.hypot(w, h)).toFixed(1)}px at 50% 40%)`;
    stream(clamp((p - .3) / .6));
    const rest = clamp((p - .8) / .2);
    later.forEach(el => { el.style.opacity = rest; el.style.transform = `translateY(${((1 - rest) * 18).toFixed(1)}px)`; });
  };

  const reset = () => {
    [...nodes, ...fades, ...heroText, core, ring, hole, ...later].forEach(el => el.removeAttribute('style'));
    measure(); cur = target = 0; read(); render(0);
  };
  desktop.addEventListener('change', reset);
  addEventListener('resize', () => { if (cur < .01) measure(); });
  document.fonts?.ready.then(() => { if (cur < .01) measure(); });
  measure();
  render(0);
  window.AR.onScroll(read);
})();
