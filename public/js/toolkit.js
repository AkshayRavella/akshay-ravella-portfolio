// Toolkit ribbon: the stack cards sit on a curved strip that bends harder the faster it moves.
// Desktop: pinned; scrolling, dragging or a sideways trackpad swipe moves the strip, and it settles on the nearest card.
// Phones: the native swipe strip, with the same curve driven by its scroll position.
(() => {
  const sec = document.querySelector('.tk3');
  if (!sec || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const pin = sec.querySelector('.tk3-pin');
  const view = sec.querySelector('.tk3-view');
  const cards = [...sec.querySelectorAll('.tk3-card')], N = cards.length;
  const num = sec.querySelector('[data-tk-num]');
  const desktop = window.matchMedia('(min-width: 992px)');
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

  let step = 0, cur = 0, target = 0, last = 0, vel = 0, raf = 0, active = -1, dragging = false, snapT = 0;
  const measure = () => { step = cards[0].offsetWidth + (desktop.matches ? 40 : 16); };
  const total = () => sec.offsetHeight - pin.offsetHeight;   // scroll distance of the pinned stretch
  const perCard = () => total() / (N - 1);                    // scroll px that move the strip one card

  const setActive = i => {
    if (i === active) return;
    active = i;
    cards.forEach((c, k) => c.classList.toggle('is-active', k === i));
    num.textContent = String(i + 1).padStart(2, '0');
  };

  // Desktop: the cards sit on the inside of a cylinder around the viewer, so the side cards swing in
  // towards you like a curved screen. Speed widens the swing and lifts the strip in the direction of travel.
  const place = (c, d, W, bend, dir) => {
    const R = Math.max(W * .6, 680);
    const a = d * (step / R) * (1 + bend * .4);                     // angle on the cylinder (rad)
    const x = R * Math.sin(a), z = R * (1 - Math.cos(a));
    const y = dir * bend * Math.min(d * d, 4) * 22;
    c.style.transform = `translate(-50%, -50%) translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px) rotateY(${(-a * 57.3).toFixed(2)}deg) rotateZ(${(dir * bend * d * 1.6).toFixed(2)}deg)`;
    c.style.opacity = (1 - clamp((Math.abs(a) - 1.2) / .3)).toFixed(3);
    shade(c, a, 1.1);
  };
  // Phones: the strip scrolls natively; only the turn and depth are added.
  const placeMobile = (c, off, W, bend) => {
    const u = clamp(off / (W * .5), -1.6, 1.6);
    const a = u * (.62 + bend * .3);
    c.style.transform = `translate3d(0, 0, ${(u * u * 70).toFixed(1)}px) rotateY(${(-a * 57.3).toFixed(2)}deg)`;
    shade(c, a, 1);
  };
  const shade = (c, a, full) => {
    c.style.setProperty('--shade', (clamp(Math.abs(a) / full) * .75).toFixed(3));
    c.style.setProperty('--sd', a > 0 ? '270deg' : '90deg');   // the inner (far) edge darkens
  };

  const render = () => {
    const W = view.clientWidth, bend = clamp(Math.abs(vel) * 9), dir = Math.sign(vel);
    if (desktop.matches) {
      cards.forEach((c, i) => place(c, i - cur, W, bend, dir));
      setActive(clamp(Math.round(cur), 0, N - 1));
    } else {
      const mid = view.scrollLeft + W / 2;
      cards.forEach(c => placeMobile(c, c.offsetLeft + c.offsetWidth / 2 - mid, W, bend));
      setActive(clamp(Math.round(view.scrollLeft / step), 0, N - 1));
    }
  };

  const tick = () => {
    if (desktop.matches) cur += (target - cur) * .12;
    else cur = view.scrollLeft / step;
    vel += ((cur - last) - vel) * .25;
    last = cur;
    if (Math.abs(target - cur) < .0005 && desktop.matches) cur = target;
    render();
    raf = (desktop.matches ? cur !== target : false) || Math.abs(vel) > .0004 ? requestAnimationFrame(tick) : 0;
    if (!raf) { vel = 0; render(); }
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };

  const read = () => {
    if (!desktop.matches) return;
    const t = total(), p = clamp(-sec.getBoundingClientRect().top / t);
    target = p * (N - 1);
    kick();
    // settle on the nearest card once scrolling stops inside the pinned stretch
    clearTimeout(snapT);
    if (p > 0 && p < 1 && !dragging) snapT = setTimeout(() => {
      const top = sec.getBoundingClientRect().top + scrollY;
      const want = top + Math.round(target) * perCard();
      if (Math.abs(want - scrollY) > 2) window.AR.scrollTo(want);
    }, 180);
  };

  // Drag (desktop): the page scrolls under the pointer, so scrolling and dragging never disagree.
  let sx = 0, sy = 0;
  view.addEventListener('pointerdown', e => {
    if (!desktop.matches || e.button) return;
    dragging = true; sx = e.clientX; sy = scrollY;
    view.setPointerCapture(e.pointerId); view.classList.add('is-drag');
  });
  view.addEventListener('pointermove', e => {
    if (!dragging) return;
    window.AR.scrollTo(sy - (e.clientX - sx) / step * perCard(), { instant: true });
  });
  const end = () => { if (!dragging) return; dragging = false; view.classList.remove('is-drag'); read(); };
  view.addEventListener('pointerup', end);
  view.addEventListener('pointercancel', end);
  // Sideways trackpad swipes move the strip too.
  view.addEventListener('wheel', e => {
    if (!desktop.matches || Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    e.preventDefault();
    window.AR.scrollTo(scrollY + e.deltaX / step * perCard(), { instant: true });
  }, { passive: false });

  view.addEventListener('scroll', () => { if (!desktop.matches) kick(); }, { passive: true });

  const mode = () => {
    sec.classList.toggle('tk-live', desktop.matches);
    cards.forEach(c => c.removeAttribute('style'));
    measure(); active = -1; vel = 0;
    if (desktop.matches) { read(); cur = last = target; }
    else cur = last = view.scrollLeft / step;
    render();
  };
  desktop.addEventListener('change', mode);
  addEventListener('resize', () => { measure(); render(); });
  mode();
  window.AR.onScroll(read);
})();
