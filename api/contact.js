// Contact form endpoint (Vercel serverless function): POST /api/contact
// Sends the visitor's message to my inbox through Gmail. The Gmail app password lives only in
// Vercel environment variables and never reaches the browser.
//
// Environment variables (Vercel → Project → Settings → Environment Variables):
//   GMAIL_USER          the Gmail account that sends (akshayravella@gmail.com)
//   GMAIL_APP_PASSWORD  a Google "app password" for that account (16 characters, no spaces needed)
//   CONTACT_TO          where messages are delivered (defaults to GMAIL_USER)
const nodemailer = require('nodemailer');

const LIMITS = { name: 100, email: 200, message: 5000 };
const MIN_FILL_MS = 3000;            // humans take longer than this to write a message; most bots don't
const RATE = { max: 5, windowMs: 60 * 60 * 1000 };
const hits = new Map();              // best-effort per-instance rate limit (ip -> timestamps)

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const clean = v => (typeof v === 'string' ? v.trim() : '');
const oneLine = v => v.replace(/[\r\n]+/g, ' ');
const esc = v => v.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const validate = ({ name, email, message }) => {
  const errors = {};
  if (!name) errors.name = 'Name is required';
  else if (name.length > LIMITS.name) errors.name = 'Name is too long';
  if (!email) errors.email = 'Email is required';
  else if (email.length > LIMITS.email || !EMAIL_RE.test(email)) errors.email = 'Enter a valid email';
  if (!message) errors.message = 'Message is required';
  else if (message.length < 10) errors.message = 'Please write a little more';
  else if (message.length > LIMITS.message) errors.message = 'Message is too long';
  return errors;
};

const limited = ip => {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter(t => now - t < RATE.windowMs);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > RATE.max;
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  body = body || {};

  const data = { name: oneLine(clean(body.name)), email: clean(body.email), message: clean(body.message) };

  // Spam traps: a hidden field only bots fill in, and a form sent too quickly after the page loaded.
  // Pretend success so bots learn nothing.
  const elapsed = Number(body.elapsed) || 0;
  if (clean(body.company) || elapsed < MIN_FILL_MS) return res.status(200).json({ ok: true });

  const errors = validate(data);
  if (Object.keys(errors).length) return res.status(400).json({ ok: false, errors });

  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
  if (limited(ip)) return res.status(429).json({ ok: false, error: 'Too many messages. Please try again later or email me directly.' });

  const user = process.env.GMAIL_USER, pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    console.error('contact: GMAIL_USER / GMAIL_APP_PASSWORD are not set');
    return res.status(500).json({ ok: false, error: 'The form is not configured yet. Please email me directly.' });
  }

  const transport = process.env.CONTACT_DRY_RUN
    ? nodemailer.createTransport({ jsonTransport: true })          // local testing: builds the email without sending
    : nodemailer.createTransport({ service: 'gmail', auth: { user, pass: pass.replace(/\s+/g, '') } });

  try {
    const info = await transport.sendMail({
      from: { name: 'Portfolio contact', address: user },
      to: process.env.CONTACT_TO || user,
      replyTo: { name: data.name, address: data.email },
      subject: `Portfolio: message from ${data.name}`,
      text: `${data.message}\n\n— ${data.name} <${data.email}>`,
      html: `<p style="white-space:pre-wrap;font:15px/1.6 -apple-system,Segoe UI,sans-serif">${esc(data.message)}</p>`
        + `<p style="color:#666;font:13px -apple-system,Segoe UI,sans-serif">— ${esc(data.name)} &lt;${esc(data.email)}&gt;<br>Sent from the portfolio contact form. Reply to answer them directly.</p>`
    });
    if (process.env.CONTACT_DRY_RUN) console.log('contact (dry run):', info.message);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('contact: send failed', err && err.message);
    return res.status(502).json({ ok: false, error: 'Could not send right now. Please email me directly.' });
  }
};
