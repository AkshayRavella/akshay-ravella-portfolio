// Shared behaviour for every page: theme switching, nav, scroll progress, reveals and counters.
(() => {
  const root = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const THEME_COLORS = { acid: '#11110f', paper: '#f5f3ec', lavender: '#dcdbe6' };
  // The light theme offered by the toggle. 'lavender' is still fully styled; set this to 'lavender' to use it.
  const LIGHT = 'paper';

  /* ---------- Theme ---------- */
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const applyTheme = theme => {
    root.dataset.theme = theme;
    try { localStorage.setItem('ar-theme', theme); } catch (e) { /* private mode */ }
    if (themeMeta) themeMeta.content = THEME_COLORS[theme];
    document.querySelectorAll('[data-theme-label]').forEach(el => { el.textContent = theme === 'acid' ? LIGHT[0].toUpperCase() + LIGHT.slice(1) : 'Acid'; });
  };
  // Themes in use: acid (dark) and LIGHT. Lavender and mono styles are kept in the CSS but not offered.
  applyTheme(root.dataset.theme === 'acid' || !root.dataset.theme ? 'acid' : LIGHT);

  // Mono theme backdrop: faint contour lines (same recipe as the liquid-glass design system).
  const contours = document.querySelector('.contours');
  if (contours) contours.innerHTML = Array.from({ length: 22 }, (_, i) => {
    const y = 120 + i * 26, a = 60 + i * 5;
    return `<path d="M -100 ${y} C 260 ${y - a}, 520 ${y + a * 0.9}, 860 ${y - a * 0.3} S 1340 ${y + a * 0.7}, 1700 ${y - a * 0.5}" fill="none" stroke="currentColor" stroke-width="1" stroke-opacity="${(0.035 + (i % 4) * 0.012).toFixed(3)}"/>`;
  }).join('');

  document.querySelectorAll('[data-theme-toggle]').forEach(btn => btn.addEventListener('click', e => {
    const next = root.dataset.theme === 'acid' ? LIGHT : 'acid';
    if (!document.startViewTransition || reduced) return applyTheme(next);
    // Circular reveal that grows out of the toggle button.
    const r = btn.getBoundingClientRect();
    const x = e.clientX || r.left + r.width / 2, y = e.clientY || r.top + r.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    root.classList.add('theme-switching');
    const vt = document.startViewTransition(() => applyTheme(next));
    vt.ready.then(() => root.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
      { duration: 750, easing: 'cubic-bezier(.65,0,.35,1)', pseudoElement: '::view-transition-new(root)' }
    ));
    vt.finished.finally(() => root.classList.remove('theme-switching'));
  }));

  /* ---------- Page turn between case studies ---------- */
  // The link's direction is handed to the next page, which plays the turn in its pagereveal handler (see <head>).
  // Browsers without cross-document view transitions get a hand-built version: a page-coloured panel
  // sweeps in diagonally, and the next page opens with that panel sweeping away (see .turn-cover in CSS).
  const nativeTurn = 'PageRevealEvent' in window;
  document.addEventListener('click', e => {
    const a = e.target.closest('a[data-turn]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
    const dir = a.dataset.turn === 'prev' ? 'prev' : 'next';
    if (nativeTurn) {
      try { sessionStorage.setItem('ar-vt', dir); } catch (err) { /* storage unavailable */ }
      root.classList.add('vt-turn-out'); // drop shared-element names so only the page itself turns
      return;
    }
    if (reduced) return;
    e.preventDefault();
    try { sessionStorage.setItem('ar-vt-cover', dir); } catch (err) { /* storage unavailable */ }
    const cover = document.createElement('div');
    cover.className = `turn-cover turn-${dir}`;
    document.body.appendChild(cover);
    let gone = false;
    const go = () => { if (!gone) { gone = true; location.href = a.href; } };
    cover.addEventListener('animationend', go, { once: true });
    setTimeout(go, 900);
  });
  addEventListener('pageshow', () => root.classList.remove('vt-turn-out'));

  /* ---------- Nav ---------- */
  const nav = document.querySelector('.nav');
  const menu = document.querySelector('.menu-toggle');
  const links = document.querySelector('.nav-links');
  menu?.addEventListener('click', () => {
    const open = links.classList.toggle('is-open');
    menu.setAttribute('aria-expanded', String(open));
  });
  links?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    links.classList.remove('is-open');
    menu?.setAttribute('aria-expanded', 'false');
  }));

  // Highlight the nav link of the section in view.
  const navTargets = [...(links?.querySelectorAll('a[href^="#"], a[href^="/#"]') || [])]
    .map(a => [a, document.getElementById(a.getAttribute('href').split('#')[1])])
    .filter(([, el]) => el);
  if (navTargets.length && 'IntersectionObserver' in window) {
    const spy = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navTargets.forEach(([a, el]) => a.classList.toggle('is-current', el === entry.target));
    }), { rootMargin: '-45% 0px -50% 0px' });
    navTargets.forEach(([, el]) => spy.observe(el));
  }

  /* ---------- Scroll progress ---------- */
  const progress = document.querySelector('.progress');
  const scrollHooks = [];
  window.AR = { onScroll: fn => { scrollHooks.push(fn); fn(); }, reduced };
  let ticking = false;
  const onScroll = () => {
    const max = root.scrollHeight - innerHeight;
    if (progress) progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    nav?.classList.toggle('is-scrolled', scrollY > 10);
    scrollHooks.forEach(fn => fn());
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  /* ---------- Reveal on scroll (staggered within a parent) ---------- */
  const revealAll = () => {
    const items = document.querySelectorAll('[data-reveal]:not(.is-in)');
    if (reduced || !('IntersectionObserver' in window)) return items.forEach(el => el.classList.add('is-in'));
    const io = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const sibs = [...el.parentElement.children].filter(c => c.hasAttribute('data-reveal'));
      el.style.setProperty('--rd', Math.min(sibs.indexOf(el) * 0.08, 0.4) + 's');
      el.classList.add('is-in');
      io.unobserve(el);
    }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach(el => io.observe(el));
  };

  /* ---------- Count-up numbers ---------- */
  const countAll = () => {
    const els = document.querySelectorAll('[data-count]');
    const fmt = el => {
      const d = Number(el.dataset.decimals || 0);
      return v => (el.dataset.prefix || '') + v.toFixed(d) + (el.dataset.suffix || '');
    };
    if (reduced || !('IntersectionObserver' in window)) return els.forEach(el => { el.textContent = fmt(el)(Number(el.dataset.count)); });
    const io = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target, target = Number(el.dataset.count), f = fmt(el), start = performance.now();
      const step = now => {
        const p = Math.min((now - start) / 1300, 1);
        el.textContent = f(target * (1 - Math.pow(1 - p, 4)));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      io.unobserve(el);
    }), { threshold: 0.6 });
    els.forEach(el => io.observe(el));
  };

  // Footer: Akshay's local time (IST), refreshed every 30s.
  const clock = document.querySelector('[data-local-time]');
  if (clock) {
    const fmt = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit', hour12: true });
    const tick = () => { clock.textContent = fmt.format(new Date()).toUpperCase() + ' IST'; };
    tick(); setInterval(tick, 30000);
  }

  revealAll();
  countAll();
  requestAnimationFrame(() => document.body.classList.add('is-loaded'));
})();
