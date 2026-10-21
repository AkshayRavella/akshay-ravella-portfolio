(() => {
  const progress = document.getElementById('progress');
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.querySelector('.nav-links');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  menuToggle?.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.textContent = open ? '×' : '☰';
  });
  navLinks?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
    if (menuToggle) menuToggle.textContent = '☰';
  }));

  const revealItems = document.querySelectorAll('.reveal, .title-line, .signal-item');
  if ('IntersectionObserver' in window && !reducedMotion) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const group = el.parentElement;
          const siblings = group ? [...group.querySelectorAll(':scope > .reveal, :scope > .title-line, :scope > .signal-item')] : [];
          const stagger = Math.max(0, siblings.indexOf(el)) * 75;
          el.style.transitionDelay = (stagger ? Math.min(stagger, 350) : 0) + 'ms';
          el.classList.add('visible');
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.13, rootMargin: '0px 0px -36px 0px' });
    revealItems.forEach(el => observer.observe(el));
  } else {
    revealItems.forEach(el => el.classList.add('visible'));
  }

  let ticking = false;
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const amount = max > 0 ? window.scrollY / max * 100 : 0;
    if (progress) progress.style.width = amount + '%';
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateProgress);
      ticking = true;
    }
  }, { passive: true });
  updateProgress();

  // The numbers are sourced from the provided resume, not calculated estimates.
  const counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window && !reducedMotion) {
    const countObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target, target = Number(el.dataset.count), suffix = el.dataset.suffix || '';
      const duration = 1150, start = performance.now();
      const step = now => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 4);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      countObserver.unobserve(el);
    }), { threshold: .6 });
    counters.forEach(el => countObserver.observe(el));
  }
})();