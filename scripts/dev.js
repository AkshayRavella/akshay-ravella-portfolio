// Local preview with a working contact form: serves public/ and runs api/contact.js, like Vercel does.
// Usage: npm run dev   (reads secrets from .env.local, which git ignores), then open http://localhost:3000
const http = require('http');
const fs = require('fs');
const path = require('path');
const contact = require('../api/contact.js');

const ROOT = path.join(__dirname, '..', 'public');
const PORT = Number(process.env.PORT) || 3000;
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.pdf': 'application/pdf' };

// Give the Node request/response the small Vercel-style helpers the function uses (req.body, res.status().json()).
const runFunction = (req, res) => {
  let raw = '';
  req.on('data', chunk => { raw += chunk; if (raw.length > 1e6) req.destroy(); });
  req.on('end', () => {
    try { req.body = raw ? JSON.parse(raw) : {}; } catch (e) { req.body = {}; }
    res.status = code => { res.statusCode = code; return res; };
    res.json = obj => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(obj)); };
    Promise.resolve(contact(req, res)).catch(err => { console.error(err); res.statusCode = 500; res.end(); });
  });
};

http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname === '/api/contact') return runFunction(req, res);
  let file = path.normalize(path.join(ROOT, decodeURIComponent(url.pathname)));
  if (!file.startsWith(ROOT)) { res.statusCode = 403; return res.end(); }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  fs.readFile(file, (err, data) => {
    if (err) { res.statusCode = 404; return res.end('Not found'); }
    res.setHeader('Content-Type', TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream');
    res.end(data);
  });
}).listen(PORT, () => {
  const ready = process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD;
  console.log(`Portfolio running at http://localhost:${PORT}`);
  console.log(ready ? `Contact form: sends as ${process.env.GMAIL_USER}${process.env.CONTACT_DRY_RUN ? ' (dry run, nothing is sent)' : ''}` : 'Contact form: add GMAIL_USER and GMAIL_APP_PASSWORD to .env.local to send real emails');
});
