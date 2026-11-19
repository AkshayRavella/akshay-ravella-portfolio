// Small motion details: stat sparklines, timeline head, portrait scan, magnetic contact word,
// cursor path and the credentials entrance. Each part only runs if its markup is on the page.
(() => {
  if (window.AR?.reduced) return;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const once = (el, fn, threshold = .5) => {
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { fn(); io.disconnect(); } }, { threshold });
    io.observe(el);
  };
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- 1. Stat sparklines: a tiny chart draws under each number ---------- */
  const SPARKS = {
    // documents piling up
    docs: '<g class="sp-bars">' + [5, 8, 7, 11, 13, 12, 16, 19, 22, 26].map((h, i) => `<rect x="${i * 12 + 1}" y="${28 - h}" width="7" height="${h}" style="--i:${i}"/>`).join('') + '</g>',
    // ROC curve over the chance diagonal
    roc: '<path class="sp-base" d="M2 28 L118 2"/><path class="sp-line" pathLength="1" d="M2 28 C 8 8, 24 4, 60 3 S 110 2, 118 2"/>',
    // 69 s shrinking to 11 s
    speed: '<rect class="sp-track" x="0" y="11" width="120" height="6"/><rect class="sp-fill" x="0" y="11" width="120" height="6"/><text x="120" y="8" text-anchor="end" class="sp-t sp-a">69 s</text><text x="0" y="8" class="sp-t sp-b">11 s</text>',
    // coverage: a bar fills to 98 of 100
    ring: '<rect class="sp-track" x="0" y="13" width="120" height="4"/><rect class="sp-cov" x="0" y="13" width="120" height="4"/><circle class="sp-tip" cx="117.6" cy="15" r="3.5"/><text x="0" y="8" class="sp-t">0</text><text x="120" y="8" text-anchor="end" class="sp-t">100</text>'
  };
  $$('.signal').forEach(sig => {
    const kind = sig.dataset.spark;
    if (!SPARKS[kind]) return;
    sig.insertAdjacentHTML('beforeend', `<svg class="spark spark--${kind}" viewBox="0 0 120 30" aria-hidden="true">${SPARKS[kind]}</svg>`);
    once(sig, () => sig.classList.add('is-drawn'), .6);
  });

  /* ---------- 2. Experience timeline: a glowing head rides the line ---------- */
  const list = $('.xp-list');
  if (list) list.insertAdjacentHTML('beforeend', '<span class="xp-head" aria-hidden="true"></span>');

  /* ---------- 3. Portrait scan ---------- */
  const photo = $('.portrait-photo');
  if (photo) {
    photo.insertAdjacentHTML('beforeend', '<span class="pscan" aria-hidden="true"></span>');
    once(photo, () => photo.classList.add('is-scan'), .55);
  }

  /* ---------- 5. Magnetic "LET'S BUILD" ---------- */
  const word = $('.contact-word'), contact = $('.contact');
  if (word && contact && fine) {
    const letters = [...word.textContent].map(ch => {
      const s = document.createElement('span');
      s.className = 'cw-l'; s.textContent = ch === ' ' ? ' ' : ch;
      return s;
    });
    word.replaceChildren(...letters);
    let mx = -1e4, my = -1e4, raf = 0;
    const pull = () => {
      raf = 0;
      letters.forEach(l => {
        const r = l.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        const dx = mx - cx, dy = my - cy, d = Math.hypot(dx, dy), f = Math.max(0, 1 - d / 420);
        l.style.transform = f ? `translate(${(dx * f * .12).toFixed(1)}px, ${(dy * f * .12).toFixed(1)}px) scaleY(${(1 + f * .14).toFixed(3)})` : '';
      });
    };
    contact.addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; if (!raf) raf = requestAnimationFrame(pull); });
    contact.addEventListener('pointerleave', () => { mx = my = -1e4; if (!raf) raf = requestAnimationFrame(pull); });
    // the word lights up while the pointer is on the email, any contact button, or the network
    const net = $('.contact-net');
    const glowOn = e => {
      const onLink = !!e.target.closest?.('.contact-email, .contact-links a');
      const r = net?.getBoundingClientRect();
      const onNet = !!(r && r.width && e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom);
      word.classList.toggle('is-snap', onLink || onNet);
    };
    contact.addEventListener('pointermove', glowOn, { passive: true });
    contact.addEventListener('pointerover', glowOn);
    contact.addEventListener('pointerleave', () => word.classList.remove('is-snap'));
  }

  /* ---------- 6. Cursor: an eased point that draws a glowing path behind the pointer (outside the hero) ---------- */
  // Slow movement leaves a wide stroke, fast movement a thin one; the path fades out over 330 ms.
  if (fine) {
    document.body.insertAdjacentHTML('beforeend', '<canvas class="cur-canvas" aria-hidden="true"></canvas>');
    const canvas = $('.cur-canvas'), ctx = canvas.getContext('2d'), hero = $('.hero');
    let points = [], width = 2, raf = 0, inside = false, tx = 0, ty = 0, x = 0, y = 0, rgb = '215,250,99';
    const colour = () => { rgb = getComputedStyle(document.documentElement).getPropertyValue('--accent-rgb').trim().split(/\s+/).join(',') || rgb; };
    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.round(innerWidth * dpr); canvas.height = Math.round(innerHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); points = [];
    };
    const net = $('.contact-net');
    // no trail over the hero or the contact network (both have their own motion)
    const inHero = (py, px) => {
      const r = hero?.getBoundingClientRect(), n = net?.getBoundingClientRect();
      return (r && py > r.top && py < r.bottom) || (n && n.width && px > n.left && px < n.right && py > n.top && py < n.bottom);
    };
    const tick = () => {
      const now = performance.now();
      const moving = Math.abs(tx - x) + Math.abs(ty - y) > .1;
      if (moving) {
        x += (tx - x) * .21; y += (ty - y) * .21;
        const last = points[points.length - 1];
        if (inside && (!last || (x - last.x) ** 2 + (y - last.y) ** 2 >= .1)) points.push({ x, y, t: now });
      }
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      points = points.filter(p => now - p.t < 330);
      ctx.lineCap = 'butt';
      ctx.shadowColor = `rgba(${rgb},.75)`; ctx.shadowBlur = 40;
      for (let i = 1; i < points.length - 1; i++) {
        const prev = points[i - 1], curr = points[i], next = points[i + 1];
        const v = Math.hypot(curr.x - prev.x, curr.y - prev.y) / Math.max(1, curr.t - prev.t);
        const target = 16 - clamp((v - .08) / (2.8 - .08)) * 14;
        const alpha = (1 - (now - curr.t) / 330) ** 2;
        if (alpha <= .005) continue;
        width += (target - width) * .5;
        ctx.beginPath();
        ctx.moveTo((prev.x + curr.x) / 2, (prev.y + curr.y) / 2);
        ctx.quadraticCurveTo(curr.x, curr.y, (curr.x + next.x) / 2, (curr.y + next.y) / 2);
        ctx.lineWidth = width; ctx.strokeStyle = `rgba(${rgb},${alpha.toFixed(3)})`;
        ctx.stroke();
      }
      raf = points.length || moving ? requestAnimationFrame(tick) : 0;
    };
    const clamp = v => Math.min(1, Math.max(0, v));
    addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      tx = e.clientX; ty = e.clientY;
      const ok = !inHero(ty, tx);
      if (ok && !inside) { x = tx; y = ty; }
      inside = ok;
      if (!raf) raf = requestAnimationFrame(tick);
    }, { passive: true });
    const stop = () => { inside = false; };
    document.addEventListener('mouseleave', stop);
    addEventListener('blur', stop);
    addEventListener('resize', resize, { passive: true });
    new MutationObserver(colour).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    colour(); resize();
  }

  /* ---------- 8. Credentials: boxes collide into place ---------- */
  const creds = $('.creds');
  if (creds && 'IntersectionObserver' in window) {
    creds.classList.add('cr-wait');
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) creds.classList.add('cr-hit');
      else if (e.boundingClientRect.top > 0) creds.classList.remove('cr-hit');   // replay after scrolling back above
    }, { threshold: .3 }).observe(creds);
  }

})();
