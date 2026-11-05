// Case-study page renderer. Each /work/<slug>/index.html sets <body data-project="slug">.
(() => {
  const P = window.PROJECTS;
  const idx = P.findIndex(p => p.slug === document.body.dataset.project);
  const main = document.getElementById('main');
  if (idx < 0 || !main) return;
  const p = P[idx], N = P.length;
  const next = P[(idx + 1) % N], prev = P[(idx - 1 + N) % N];
  const pad = n => String(n).padStart(2, '0');
  const arrow = '<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M11.985 4L12 10.77h-1.069V6.607l.015-.8L4.742 12 4 11.244l6.204-6.207-.727.015H5.217V4z"/></svg>';

  const sections = [
    ['overview', 'The problem'],
    ['solution', 'The solution'],
    ['architecture', 'Architecture'],
    ['flow', 'How it works'],
    p.chart && ['signals', 'The model'],
    ['features', 'Capabilities'],
    ['decisions', 'Engineering decisions'],
    ['governance', 'Security & governance'],
    ['stack', 'Stack'],
    ['role', 'My role']
  ].filter(Boolean);

  const head = (id, n, title) => `<div class="cs-head" data-reveal><span class="label"><b>${pad(n)}</b> ${title}</span></div>`;
  const n = id => sections.findIndex(s => s[0] === id) + 1;

  const chart = c => {
    const max = Math.max(...c.data.map(d => d[1]));
    return `<figure class="cs-chart surface" data-reveal>
      <figcaption><strong>${c.title}</strong><span class="label">${c.sub}</span></figcaption>
      <div class="hbars" role="img" aria-label="${c.title}: ${c.data.map(d => `${d[0]} ${d[1]}`).join(', ')}">
        ${c.data.map(([k, v], i) => `<div class="hbar" style="--v:${v / max};--i:${i}" data-tip="${k}: ${v.toFixed(2)}" tabindex="0">
          <span class="hbar-k">${k}</span><span class="hbar-track"><i></i></span><span class="hbar-v">${v.toFixed(2)}</span></div>`).join('')}
      </div>
      <div class="hbar-tip" aria-hidden="true"></div>
      <p class="label cs-note">${c.note}</p>
      <table class="sr-only"><caption>${c.title}</caption><tr><th>Feature</th><th>Importance</th></tr>${c.data.map(d => `<tr><td>${d[0]}</td><td>${d[1]}</td></tr>`).join('')}</table>
    </figure>`;
  };

  document.title = `${p.name} — Akshay Ravella`;
  main.innerHTML = `
  <section class="cs-hero shell">
    <a class="cs-back label" href="/#work" data-reveal>← All work</a>
    <div class="cs-hero-grid">
      <div class="cs-hero-copy">
        <div class="cs-tagrow" data-reveal><span class="tag">${p.category}</span><span class="label">${pad(idx + 1)} / ${pad(N)}</span></div>
        <h1 class="cs-title" style="view-transition-name:title-${p.slug}">${p.name}</h1>
        <p class="cs-summary" data-reveal>${p.summary}</p>
        <dl class="cs-meta" data-reveal>${p.meta.map(([k, v]) => `<div><dt class="label">${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
      </div>
      <div class="cs-hero-viz"><div class="cs-frame">${window.renderViz(p.visual).replace('class="viz', `style="view-transition-name:viz-${p.slug}" class="viz`)}</div></div>
    </div>
  </section>

  <section class="cs-metrics shell" aria-label="Key numbers">
    ${p.metrics.map(m => `<div class="cs-metric surface" data-reveal>
      <b data-count="${m.value}" data-decimals="${m.decimals || 0}" data-prefix="${m.prefix || ''}" data-suffix="${m.suffix || ''}">${m.prefix || ''}${m.value}${m.suffix || ''}</b>
      <span>${m.label}</span></div>`).join('')}
  </section>

  <div class="cs-body shell">
    <nav class="cs-toc" aria-label="On this page">
      <span class="label">On this page</span>
      <ol>${sections.map(([id, t]) => `<li><a href="#${id}">${t}</a></li>`).join('')}</ol>
      <a class="btn btn-primary cs-toc-next" href="/work/${next.slug}/">Next: ${next.short} ${arrow}</a>
    </nav>

    <div class="cs-content">
      <section id="overview" class="cs-sec">
        ${head('overview', n('overview'), 'The problem')}
        <div class="cs-prose">${p.problem.map((t, i) => `<p data-reveal${i === 0 ? ' class="cs-lede"' : ''}>${t}</p>`).join('')}</div>
      </section>

      <section id="solution" class="cs-sec">
        ${head('solution', n('solution'), 'The solution')}
        <p class="cs-big" data-reveal>${p.solution}</p>
      </section>

      <section id="architecture" class="cs-sec cs-wide">
        ${head('architecture', n('architecture'), 'Architecture')}
        <p class="cs-caption" data-reveal>${p.architecture.caption}</p>
        <div class="arch" data-reveal>
          <div class="arch-zones" style="--z:${p.architecture.zones.length};--cols:${p.architecture.zones.length <= 5 ? p.architecture.zones.length : Math.ceil(p.architecture.zones.length / 2)}">
            ${p.architecture.zones.map((z, i) => `<div class="arch-zone${z.hot ? ' is-hot' : ''}" style="--i:${i}">
              <span class="arch-num">${pad(i + 1)}</span><strong>${z.title}</strong>
              <ul>${z.nodes.map(nd => `<li>${nd}</li>`).join('')}</ul>
            </div>`).join('')}
          </div>
          <div class="arch-bands">
            ${p.architecture.bands.map(b => `<div class="arch-band"><span class="label">${b.label}</span><div>${b.items.map(it => `<span class="tag">${it}</span>`).join('')}</div></div>`).join('')}
          </div>
        </div>
      </section>

      <section id="flow" class="cs-sec">
        ${head('flow', n('flow'), 'How it works')}
        <h3 class="cs-h3" data-reveal>${p.flow.title}</h3>
        <ol class="flow">${p.flow.steps.map(([t, d], i) => `<li class="flow-step" data-reveal><span class="flow-n">${pad(i + 1)}</span><div><strong>${t}</strong><p>${d}</p></div></li>`).join('')}</ol>
      </section>

      ${p.chart ? `<section id="signals" class="cs-sec">${head('signals', n('signals'), 'The model')}${chart(p.chart)}</section>` : ''}

      <section id="features" class="cs-sec cs-wide">
        ${head('features', n('features'), 'Capabilities')}
        <div class="feat-grid">${p.features.map(([t, d], i) => `<div class="feat surface" data-reveal><span class="label">${pad(i + 1)}</span><strong>${t}</strong><p>${d}</p></div>`).join('')}</div>
      </section>

      <section id="decisions" class="cs-sec">
        ${head('decisions', n('decisions'), 'Engineering decisions')}
        <div class="dec-list">${p.highlights.map(([t, d]) => `<div class="dec" data-reveal><strong>${t}</strong><p>${d}</p></div>`).join('')}</div>
      </section>

      <section id="governance" class="cs-sec">
        ${head('governance', n('governance'), 'Security & governance')}
        <ul class="gov">${p.security.map(s => `<li data-reveal><span>✓</span>${s}</li>`).join('')}</ul>
      </section>

      <section id="stack" class="cs-sec">
        ${head('stack', n('stack'), 'Stack')}
        <div class="stack-groups">${Object.entries(p.stack).map(([g, items]) => `<div class="stack-group" data-reveal><span class="label">${g}</span><div>${items.map(t => `<span class="tag">${t}</span>`).join('')}</div></div>`).join('')}</div>
      </section>

      <section id="role" class="cs-sec">
        ${head('role', n('role'), 'My role')}
        <blockquote class="cs-role" data-reveal><span class="asterisk">✳</span>${p.role}</blockquote>
      </section>
    </div>
  </div>

  <section class="cs-next shell">
    <a class="cs-next-card" href="/work/${next.slug}/" data-reveal>
      <span class="label">Next project · ${pad((idx + 1) % N + 1)} / ${pad(N)}</span>
      <strong>${next.name}</strong>
      <span class="cs-next-lead">${next.lead}</span>
      <span class="cs-next-arrow">${arrow}</span>
    </a>
    <div class="cs-next-row" data-reveal><a class="label" href="/work/${prev.slug}/">← ${prev.name}</a><a class="label" href="/#work">All work</a></div>
  </section>`;

  // Hooks that need main.js (registered after it has run).
  document.addEventListener('DOMContentLoaded', () => {
    // Scroll-spy for the table of contents.
    const links = [...document.querySelectorAll('.cs-toc a[href^="#"]')];
    const targets = links.map(a => document.getElementById(a.getAttribute('href').slice(1)));
    window.AR.onScroll(() => {
      const mark = innerHeight * 0.35;
      let active = 0;
      targets.forEach((t, i) => { if (t.getBoundingClientRect().top < mark) active = i; });
      links.forEach((a, i) => a.classList.toggle('is-current', i === active));
    });
    // Flow line fills as you read.
    const flow = document.querySelector('.flow');
    if (flow) {
      const steps = [...flow.children];
      window.AR.onScroll(() => {
        const r = flow.getBoundingClientRect(), mark = innerHeight * 0.6;
        flow.style.setProperty('--fp', Math.min(Math.max((mark - r.top) / r.height, 0), 1).toFixed(4));
        steps.forEach(s => s.classList.toggle('is-lit', s.getBoundingClientRect().top < mark));
      });
    }
    // Chart tooltip.
    const fig = document.querySelector('.cs-chart');
    if (fig) {
      const tip = fig.querySelector('.hbar-tip');
      const show = el => {
        const fr = fig.getBoundingClientRect(), r = el.querySelector('.hbar-track i').getBoundingClientRect();
        tip.textContent = el.dataset.tip;
        tip.style.transform = `translate(${r.right - fr.left + 12}px, ${r.top - fr.top - 8}px)`;
        tip.classList.add('is-on');
      };
      fig.querySelectorAll('.hbar').forEach(el => {
        el.addEventListener('mouseenter', () => show(el));
        el.addEventListener('focus', () => show(el));
        el.addEventListener('mouseleave', () => tip.classList.remove('is-on'));
        el.addEventListener('blur', () => tip.classList.remove('is-on'));
      });
    }
  });
})();
