// Point of view: when the section lands, its headline is read like an attention map.
// The words appear as tokens, glowing arcs fire between related words, then the tokens resolve
// into the sentence and "the hard problem" stays lit. Timed (not scroll-scrubbed), so fast scrolling still sees it;
// it replays after scrolling back above the section.
(() => {
  const sec = document.getElementById('manifesto');
  const head = sec?.querySelector('.at-head');
  if (!head || window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;

  // Wrap each word (keeping the inner <span> sentence) so it can be boxed as a token.
  const words = [];
  const wrap = el => [...el.childNodes].forEach(n => {
    if (n.nodeType === 1) return wrap(n);
    if (n.nodeType !== 3) return;
    const frag = document.createDocumentFragment();
    n.textContent.split(/(\s+)/).forEach(part => {
      if (!part) return;
      if (/^\s+$/.test(part)) return frag.append(part);
      const w = document.createElement('span');
      w.className = 'at-w'; w.textContent = part;
      frag.append(w); words.push(w);
    });
    n.replaceWith(frag);
  });
  head.setAttribute('aria-label', head.textContent.trim());
  wrap(head);
  if (words.length < 10) return;

  // Not · AI · for · the · headline. · AI · for · the · hard · problem.
  const WEIGHTS = ['.12', '.91', '.08', '.05', '.88', '.94', '.07', '.21', '.97', '.99'];
  const PAIRS = [[1, 5], [4, 8], [0, 8], [2, 6], [4, 9], [3, 7], [5, 9], [1, 9]];
  const HOT = [1, 4, 5, 8, 9], LIT = [7, 8, 9];
  words.forEach((w, i) => { w.dataset.t = WEIGHTS[i] || ''; w.style.setProperty('--d', i * .04 + 's'); });
  LIT.forEach(i => words[i].classList.add('at-lit'));

  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'at-arcs'); svg.setAttribute('aria-hidden', 'true');
  head.append(svg);

  let timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));

  const fire = () => {
    svg.replaceChildren();
    const box = head.getBoundingClientRect();
    svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
    const pt = w => { const r = w.getBoundingClientRect(); return [r.left + r.width / 2 - box.left, r.top - box.top + r.height * .12]; };
    PAIRS.forEach(([a, b], k) => {
      const [ax, ay] = pt(words[a]), [bx, by] = pt(words[b]);
      const lift = Math.abs(bx - ax) * .28 + Math.abs(by - ay) * .2 + 26;
      const path = document.createElementNS(NS, 'path');
      path.setAttribute('d', `M${ax},${ay} Q${(ax + bx) / 2},${Math.min(ay, by) - lift} ${bx},${by}`);
      svg.append(path);
      const len = path.getTotalLength();
      path.style.strokeDasharray = len; path.style.strokeDashoffset = len;
      later(() => {
        path.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration: 520, easing: 'cubic-bezier(.6,0,.2,1)', fill: 'forwards' });
        [[ax, ay], [bx, by]].forEach(([x, y]) => {
          const dot = document.createElementNS(NS, 'circle');
          dot.setAttribute('cx', x); dot.setAttribute('cy', y); dot.setAttribute('r', 3);
          svg.append(dot);
          dot.animate([{ r: 0 }, { r: 5 }, { r: 3 }], { duration: 400, fill: 'forwards' });
        });
        [a, b].forEach(i => HOT.includes(i) && words[i].classList.add('is-hot'));
      }, k * 95);
    });
  };

  const play = () => {
    sec.classList.add('at-tok');
    sec.classList.remove('at-wait');   // the copy on the right arrives with the tokens, not after them
    later(fire, 380);
    later(() => { sec.classList.add('at-done'); }, 380 + PAIRS.length * 95 + 650);
  };
  const reset = () => {
    timers.forEach(clearTimeout); timers = [];
    sec.classList.remove('at-tok', 'at-done');
    sec.classList.add('at-wait');
    words.forEach(w => w.classList.remove('is-hot'));
    svg.replaceChildren();
  };

  sec.classList.add('at-ready', 'at-wait');
  let played = false;
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !played) { played = true; play(); }
    else if (!e.isIntersecting && e.boundingClientRect.top > 0 && played) { played = false; reset(); }  // scrolled back up above it
  }, { threshold: .45 }).observe(head);
})();
