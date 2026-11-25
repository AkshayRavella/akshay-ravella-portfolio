// Contact form on a sticky note held by a paper clip: validates as you go, then posts to /api/contact (api/contact.js),
// which emails me. When the message is sent, the note peels off and flies away.
// Without JavaScript the form still posts to the same endpoint.
(() => {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const fields = { name: form.elements.name, email: form.elements.email, message: form.elements.message };
  const status = form.querySelector('.cf-status'), btn = form.querySelector('.cf-send'), btnText = form.querySelector('.cf-send-text');
  const opened = Date.now();
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const FALLBACK = 'akshayravella@gmail.com';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pad = form.closest('.notepad');

  // Sent: a copy of the filled note peels off and flies away, leaving a fresh note under the pin
  const tear = () => {
    if (!pad || reduced) return;
    const page = form.cloneNode(true);
    page.removeAttribute('id');
    page.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
    Object.keys(fields).forEach(k => {
      const el = page.querySelector(`[name="${k}"]`);
      if (k === 'message') el.textContent = fields[k].value; else el.setAttribute('value', fields[k].value);
    });
    page.querySelector('.cf-status').textContent = '';
    page.querySelector('.cf-send-text').textContent = 'Send message';
    page.querySelector('.cf-send').disabled = false;
    page.classList.remove('is-sending', 'is-shake');
    page.classList.add('np-torn');
    Object.assign(page.style, { left: form.offsetLeft + 'px', top: form.offsetTop + 'px', width: form.offsetWidth + 'px', height: form.offsetHeight + 'px' });
    pad.append(page);
    page.addEventListener('animationend', () => page.remove(), { once: true });
  };
  const shake = () => {
    form.classList.remove('is-shake'); void form.offsetWidth; form.classList.add('is-shake');
    form.addEventListener('animationend', () => form.classList.remove('is-shake'), { once: true });
  };

  const check = {
    name: v => !v ? 'Name is required' : '',
    email: v => !v ? 'Email is required' : !EMAIL_RE.test(v) ? 'Enter a valid email' : '',
    message: v => !v ? 'Message is required' : v.length < 10 ? 'Please write a little more' : ''
  };
  const show = (key, msg) => {
    const el = fields[key];
    el.closest('.cf-field').classList.toggle('is-invalid', !!msg);
    el.setAttribute('aria-invalid', msg ? 'true' : 'false');
    document.getElementById(`cf-${key}-err`).textContent = msg;
  };
  const validate = key => { const msg = check[key](fields[key].value.trim()); show(key, msg); return !msg; };

  Object.keys(fields).forEach(key => {
    const el = fields[key];
    el.addEventListener('blur', () => { if (el.value || el.dataset.touched) { el.dataset.touched = '1'; validate(key); } });
    el.addEventListener('input', () => { if (el.closest('.cf-field').classList.contains('is-invalid')) validate(key); });
  });

  const setStatus = (msg, kind) => { clearTimeout(status._t); status.classList.remove('is-fading'); status.textContent = msg; status.dataset.kind = kind || ''; };

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const ok = Object.keys(fields).map(validate).every(Boolean);
    if (!ok) { shake(); fields[Object.keys(fields).find(k => fields[k].getAttribute('aria-invalid') === 'true')].focus(); return; }

    form.classList.add('is-sending'); btn.disabled = true; btnText.textContent = 'Sending…'; setStatus('');
    try {
      const res = await fetch(form.action, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fields.name.value.trim(), email: fields.email.value.trim(), message: fields.message.value.trim(),
          company: form.elements.company.value, elapsed: Date.now() - opened
        })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        tear();
        form.reset();
        Object.keys(fields).forEach(k => { show(k, ''); delete fields[k].dataset.touched; });
        form.classList.add('is-sent');
        setStatus('Thanks! I usually reply within a day or two.', 'ok');
        // the thank-you stays for 4 seconds, then fades away
        clearTimeout(status._t);
        status._t = setTimeout(() => {
          status.classList.add('is-fading');
          setTimeout(() => { status.classList.remove('is-fading'); if (status.dataset.kind === 'ok') setStatus(''); form.classList.remove('is-sent'); }, 500);
        }, 4000);
      } else if (data.errors) {
        Object.entries(data.errors).forEach(([k, msg]) => fields[k] && show(k, msg));
        setStatus('Please fix the highlighted fields.', 'err'); shake();
      } else {
        setStatus(`${data.error || 'Could not send right now.'} You can also write to ${FALLBACK}.`, 'err'); shake();
      }
    } catch (err) {
      setStatus(`Could not send right now. Please email me at ${FALLBACK}.`, 'err'); shake();
    } finally {
      form.classList.remove('is-sending'); btn.disabled = false; btnText.textContent = 'Send message';
    }
  });
  form.addEventListener('input', () => { if (form.classList.contains('is-sent')) { form.classList.remove('is-sent'); setStatus(''); } });
})();
