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

  // Draw each connector from the AI core's rim to the nearest edge of its label.
  // Measuring the rendered elements keeps the endpoints aligned across desktop and mobile.
  const aiStage = document.querySelector('.ai-stage');
  if (aiStage) {
    const aiCore = aiStage.querySelector('.ai-core');
    const aiPaths = [...aiStage.querySelectorAll('.connection-path[data-target]')];

    const updateAIConnections = () => {
      const stageRect = aiStage.getBoundingClientRect();
      const coreRect = aiCore?.getBoundingClientRect();
      if (!coreRect || !stageRect.width || !stageRect.height) return;

      const coreX = (coreRect.left + coreRect.right) / 2;
      const coreY = (coreRect.top + coreRect.bottom) / 2;
      const radiusX = coreRect.width * 0.445;
      const radiusY = coreRect.height * 0.445;

      aiPaths.forEach((path, index) => {
        const target = aiStage.querySelector('.' + path.dataset.target);
        if (!target) return;
        const rect = target.getBoundingClientRect();
        const nodeX = (rect.left + rect.right) / 2;
        const nodeY = (rect.top + rect.bottom) / 2;
        const dx = nodeX - coreX;
        const dy = nodeY - coreY;
        const rayScale = 1 / Math.sqrt((dx / radiusX) ** 2 + (dy / radiusY) ** 2);
        const startX = coreX + dx * rayScale;
        const startY = coreY + dy * rayScale;

        const horizontalScore = Math.abs(dx) / Math.max(rect.width / 2, 1);
        const verticalScore = Math.abs(dy) / Math.max(rect.height / 2, 1);
        let endX = nodeX, endY = nodeY;
        if (horizontalScore >= verticalScore) {
          endX = dx < 0 ? rect.right : rect.left;
        } else {
          endY = dy < 0 ? rect.bottom : rect.top;
        }

        const x1 = ((startX - stageRect.left) / stageRect.width) * 100;
        const y1 = ((startY - stageRect.top) / stageRect.height) * 100;
        const x2 = ((endX - stageRect.left) / stageRect.width) * 100;
        const y2 = ((endY - stageRect.top) / stageRect.height) * 100;
        const vx = x2 - x1, vy = y2 - y1;
        const distance = Math.hypot(vx, vy) || 1;
        const bend = Math.min(4.5, Math.max(1.1, distance * 0.075)) * (index % 2 ? -1 : 1);
        const px = -vy / distance * bend, py = vx / distance * bend;
        const c1x = x1 + vx * 0.34 + px, c1y = y1 + vy * 0.34 + py;
        const c2x = x1 + vx * 0.74 + px, c2y = y1 + vy * 0.74 + py;
        const d = `M ${x1.toFixed(2)} ${y1.toFixed(2)} C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${x2.toFixed(2)} ${y2.toFixed(2)}`;
        path.setAttribute('d', d);
        const packetPath = aiStage.querySelector('animateMotion[data-follow="' + path.id + '"]');
        packetPath?.setAttribute('path', d);
      });
    };

    requestAnimationFrame(updateAIConnections);
    window.addEventListener('resize', () => requestAnimationFrame(updateAIConnections), { passive: true });
    aiStage.querySelectorAll('.ai-node').forEach(node => node.addEventListener('transitionend', updateAIConnections));
  }
})();