// Home page: the pinned "selected work" wheel and the experience timeline.
(() => {
  const P = window.PROJECTS, N = P.length, STEP = 44;
  const sec = document.getElementById('work');
  if (!sec) return;
  const pad = n => String(n).padStart(2, '0');
  const arrow = '<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M11.985 4L12 10.77h-1.069V6.607l.015-.8L4.742 12 4 11.244l6.204-6.207-.727.015H5.217V4z"/></svg>';
  const icon = p => `<svg viewBox="0 0 24 24" aria-hidden="true">${p.icon}</svg>`;

  sec.style.setProperty('--n', N);
  sec.innerHTML = `
    <div class="ww-pin">
      <header class="ww-head">
        <h2>Selected systems,<br><span>built for production.</span></h2>
        <div class="ww-count label"><b data-ww-num>01</b><span>/ ${pad(N)}</span><span>· scroll to explore</span></div>
      </header>
      <nav class="ww-bar" aria-label="Projects">${P.map((p, i) => `<button type="button" data-i="${i}">${p.short}</button>`).join('')}</nav>
      <div class="ww-body">
        <div class="ww-wheel-wrap" aria-hidden="true">
          <div class="ww-connector"></div>
          <div class="ww-wheel"><div class="ww-ticks"></div>
            ${P.map((p, i) => `<a class="ww-node" data-i="${i}" style="--a:${i * STEP}deg" href="/work/${p.slug}/" tabindex="-1">
              <span class="ww-pill"><span class="ww-ico">${icon(p)}</span><span class="ww-pill-text">${p.short}</span></span></a>`).join('')}
          </div>
        </div>
        <div class="ww-copy">
          ${P.map((p, i) => `<article class="ww-panel" data-i="${i}" style="--vtt:title-${p.slug}">
            <div class="label"><b>${pad(i + 1)} / ${pad(N)}</b> — ${p.kicker}</div>
            <h3 class="ww-title">${p.name}</h3>
            <p class="ww-lead">${p.lead}</p>
            <ul>${p.bullets.map(([b, r]) => `<li><strong>${b}</strong>${r}</li>`).join('')}</ul>
            <div class="ww-inline" style="--vt:viz-${p.slug}"><a href="/work/${p.slug}/" aria-label="${p.name} case study">${window.renderViz(p.visual)}</a></div>
            <div class="ww-actions">
              <a class="btn btn-primary" href="/work/${p.slug}/">Read full story ${arrow}</a>
              <a class="btn" href="/work/${p.slug}/#architecture">Architecture ${arrow}</a>
            </div>
          </article>`).join('')}
        </div>
        <div class="ww-visual">
          ${P.map((p, i) => `<figure class="ww-shot" data-i="${i}" style="--vt:viz-${p.slug};margin:0">${window.renderViz(p.visual)}<a href="/work/${p.slug}/" tabindex="-1" aria-label="${p.name} case study"></a></figure>`).join('')}
        </div>
      </div>
    </div>`;

  const wheel = sec.querySelector('.ww-wheel');
  const conn = sec.querySelector('.ww-connector');
  const num = sec.querySelector('[data-ww-num]');
  const bar = sec.querySelector('.ww-bar');
  const groups = ['.ww-node', '.ww-panel', '.ww-shot', '.ww-bar button'].map(s => [...sec.querySelectorAll(s)]);
  const desktop = window.matchMedia('(min-width: 992px)');
  let current = -1;

  const setStep = i => {
    if (i === current) return;
    current = i;
    wheel.style.setProperty('--rot', -i * STEP + 'deg');
    // Replay the connector draw so it re-extends once the wheel settles.
    conn.style.animation = 'none'; void conn.offsetWidth; conn.style.animation = '';
    groups.forEach(list => list.forEach((el, idx) => {
      el.classList.toggle('is-active', idx === i);
      el.classList.toggle('is-above', idx < i);
      el.classList.toggle('is-below', idx > i);
    }));
    num.textContent = pad(i + 1);
    const pill = groups[3][i];
    if (pill && bar.scrollWidth > bar.clientWidth) bar.scrollTo({ left: pill.offsetLeft - (bar.clientWidth - pill.offsetWidth) / 2, behavior: 'smooth' });
  };

  const range = () => {
    const total = sec.offsetHeight - innerHeight;
    return { top: sec.getBoundingClientRect().top + scrollY, total };
  };

  // Desktop: scroll progress through the pinned section picks the step (floor(p * N)).
  window.AR.onScroll(() => {
    if (desktop.matches) {
      const { total } = range();
      const p = Math.min(Math.max(-sec.getBoundingClientRect().top / total, 0), 1);
      setStep(Math.min(N - 1, Math.floor(p * N)));
    } else {
      bar.classList.toggle('is-gone', sec.getBoundingClientRect().bottom < 180);
    }
  });

  // Mobile: the panel with the most visible area wins.
  let lockUntil = 0;
  const ratios = new Map();
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => ratios.set(e.target, e.intersectionRatio));
    if (desktop.matches || Date.now() < lockUntil) return;
    let best = null, max = 0;
    ratios.forEach((r, el) => { if (r > max) { max = r; best = el; } });
    if (best) setStep(Number(best.dataset.i));
  }, { rootMargin: '-25% 0px -35% 0px', threshold: [0, .25, .5, .75, 1] });
  groups[1].forEach(p => io.observe(p));

  const goTo = i => {
    if (desktop.matches) {
      const { top, total } = range();
      scrollTo({ top: top + total * ((i + 0.5) / N), behavior: window.AR.reduced ? 'auto' : 'smooth' });
    } else {
      lockUntil = Date.now() + 1500;
      setStep(i);
      groups[1][i].scrollIntoView({ behavior: window.AR.reduced ? 'auto' : 'smooth', block: 'start' });
    }
  };
  // Clicking a non-active pill rotates the wheel to it; clicking the active one opens the case study.
  groups[0].forEach((node, i) => node.addEventListener('click', e => { if (i !== current) { e.preventDefault(); goTo(i); } }));
  groups[3].forEach((btn, i) => btn.addEventListener('click', () => goTo(i)));
  desktop.addEventListener('change', () => { current = -1; dispatchEvent(new Event('scroll')); });
  setStep(0);

  /* ---------- Experience timeline: line fills as you read ---------- */
  const list = document.querySelector('.xp-list');
  if (list) {
    const items = [...list.querySelectorAll('.xp-item')];
    window.AR.onScroll(() => {
      const r = list.getBoundingClientRect(), mark = innerHeight * 0.62;
      list.style.setProperty('--xp-p', Math.min(Math.max((mark - r.top) / r.height, 0), 1).toFixed(4));
      items.forEach(it => it.classList.toggle('is-lit', it.getBoundingClientRect().top < mark));
    });
  }
})();
