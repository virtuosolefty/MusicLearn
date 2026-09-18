#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════
   MusicLearn local server.

     node server/index.js            → http://localhost:8787
     PORT=3000 node server/index.js

   It does two jobs: serve the app, and keep a learner's record.
   No dependencies, no build step, no database to install — the whole
   thing is this file plus server/store.js.

   The app works perfectly well without it (everything falls back to
   localStorage). Run this when you want progress, mastery and saved
   projects to survive a cleared browser, or to be shared between
   browsers on the same machine.
   ═══════════════════════════════════════════════════════════════ */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { jsonStore, VERSION } = require('./store');

const ROOT = path.join(__dirname, '..');
const PORT = Number(process.env.PORT || 8787);
const DATA = process.env.MUSICLEARN_DATA || path.join(ROOT, 'server', 'data', 'musiclearn.json');
const store = jsonStore(DATA);

const TYPES = {
  '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8',
  '.css':'text/css; charset=utf-8', '.json':'application/json; charset=utf-8',
  '.png':'image/png', '.jpg':'image/jpeg', '.svg':'image/svg+xml',
  '.mid':'audio/midi', '.md':'text/markdown; charset=utf-8', '.ico':'image/x-icon'
};

const send = (res, code, body, type) => {
  res.writeHead(code, {
    'Content-Type':type || 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin':'*',
    'Access-Control-Allow-Headers':'Content-Type',
    'Access-Control-Allow-Methods':'GET,POST,PUT,DELETE,OPTIONS',
    'Cache-Control':'no-store'
  });
  res.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body));
};
const bad = (res, code, msg) => send(res, code, { error:msg });

function body(req) {
  return new Promise(resolve => {
    let s = '';
    req.on('data', c => { s += c; if (s.length > 2e6) req.destroy(); });
    req.on('end', () => { try { resolve(JSON.parse(s || '{}')); } catch (e) { resolve({}); } });
  });
}

/* ── the API ────────────────────────────────────────────────── */
async function api(req, res, url) {
  const parts = url.pathname.replace(/^\/api\/?/, '').split('/').filter(Boolean);
  const [head, a, b] = parts;
  const m = req.method;

  if (m === 'OPTIONS') return send(res, 204, '');

  if (head === 'health')
    return send(res, 200, { ok:true, version:VERSION, store:store.kind, users:store.users().length });

  if (head === 'users') {
    if (m === 'GET') return send(res, 200, { users:store.users() });
    if (m === 'POST') { const d = await body(req); return send(res, 201, store.createUser(d.name)); }
    if (m === 'PUT' && a) { const d = await body(req);
      const u = store.renameUser(a, d.name); return u ? send(res, 200, u) : bad(res, 404, 'no such user'); }
  }

  if (head === 'profile' && a && m === 'GET') {
    const u = store.user(a);
    if (!u) return bad(res, 404, 'no such user');
    return send(res, 200, {
      user:{ id:u.id, name:u.name },
      progress:u.progress,
      skills:store.skills(a),
      projects:store.projects(a),
      stats:store.stats(a)
    });
  }

  if (head === 'progress' && a && m === 'PUT') {
    const d = await body(req);
    const p = store.putProgress(a, d);
    return p ? send(res, 200, p) : bad(res, 404, 'no such user');
  }

  if (head === 'attempts' && a && m === 'POST') {
    const d = await body(req);
    const list = Array.isArray(d.attempts) ? d.attempts : [d];
    const out = list.map(x => store.recordAttempt(a, x)).filter(Boolean);
    return out.length ? send(res, 201, { recorded:out.length, skills:out })
                      : bad(res, 404, 'no such user');
  }

  if (head === 'review' && a && m === 'GET')
    return send(res, 200, { due:store.due(a), all:store.skills(a) });

  if (head === 'projects' && a) {
    if (m === 'GET') return send(res, 200, { projects:store.projects(a) });
    if (m === 'POST') { const d = await body(req);
      const p = store.putProject(a, d); return p ? send(res, 201, p) : bad(res, 404, 'no such user'); }
    if (m === 'DELETE' && b)
      return send(res, 200, { deleted:store.dropProject(a, b) });
  }

  if (head === 'stats' && a && m === 'GET') {
    const s = store.stats(a);
    return s ? send(res, 200, s) : bad(res, 404, 'no such user');
  }

  return bad(res, 404, 'unknown endpoint');
}

/* ── static files ───────────────────────────────────────────── */
function serve(req, res, url) {
  if (url.pathname === '/favicon.ico') return send(res, 204, '', 'image/x-icon');
  let rel = decodeURIComponent(url.pathname);
  if (rel === '/') rel = '/index.html';
  const file = path.join(ROOT, path.normalize(rel).replace(/^([/\\])+/, ''));
  if (!file.startsWith(ROOT)) return bad(res, 403, 'outside the project');   /* no ../ escapes */
  fs.readFile(file, (err, buf) => {
    if (err) return send(res, 404, 'Not found', 'text/plain; charset=utf-8');
    send(res, 200, buf, TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream');
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://' + (req.headers.host || 'localhost'));
  if (url.pathname.startsWith('/api')) {
    api(req, res, url).catch(e => bad(res, 500, String(e && e.message || e)));
  } else serve(req, res, url);
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log('MusicLearn → http://localhost:' + PORT);
    console.log('records    → ' + DATA);
    console.log('api        → http://localhost:' + PORT + '/api/health');
  });
}
module.exports = { server, store };
