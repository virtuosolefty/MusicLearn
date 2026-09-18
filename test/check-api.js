#!/usr/bin/env node
/* Checks the local server: every endpoint, and the two formulas that
   decide what you practise next.  node test/check-api.js               */
const path = require('path');
const fs = require('fs');
const os = require('os');

const tmp = path.join(os.tmpdir(), 'musiclearn-test-' + Date.now() + '.json');
process.env.MUSICLEARN_DATA = tmp;
const { server, store } = require('../server/index.js');
const { masteryOf, dueAfter, LADDER } = require('../server/store.js');

let pass = 0, fail = 0;
const ok = (c, label) => { if (c) pass++; else { fail++; console.log('  FAIL  ' + label); } };
const eq = (got, want, label) => {
  if (String(got) === String(want)) pass++;
  else { fail++; console.log('  FAIL  ' + label + '\n        got ' + got + ' want ' + want); }
};
const head = t => console.log('\n' + t);

(async () => {
  await new Promise(r => server.listen(0, r));
  const port = server.address().port;
  const base = 'http://127.0.0.1:' + port;
  const call = (p, opt) => fetch(base + p, Object.assign({
    headers:{ 'Content-Type':'application/json' } }, opt || {},
    opt && opt.body ? { body:JSON.stringify(opt.body) } : {}))
    .then(async r => ({ status:r.status, body:await r.json().catch(() => null) }));

  head('Serving the app');
  const page = await fetch(base + '/').then(r => ({ s:r.status, t:r.headers.get('content-type'), b:r.text() }));
  eq(page.s, 200, 'GET / serves the app');
  ok(/text\/html/.test(page.t), 'served as HTML');
  const js = await fetch(base + '/src/theory.js').then(r => r.status);
  eq(js, 200, 'GET /src/theory.js serves a module');
  const esc = await fetch(base + '/../../etc/passwd').then(r => r.status).catch(() => 400);
  ok(esc === 403 || esc === 404 || esc === 400, 'paths cannot escape the project directory');

  head('Health and users');
  const h = await call('/api/health');
  eq(h.status, 200, 'GET /api/health');
  ok(h.body.ok === true, 'health says ok');
  const made = await call('/api/users', { method:'POST', body:{ name:'Lefty' } });
  eq(made.status, 201, 'POST /api/users creates a learner');
  const uid = made.body.id;
  ok(!!uid, 'a user id comes back');
  const list = await call('/api/users');
  ok(list.body.users.some(u => u.id === uid), 'the new user is listed');
  const renamed = await call('/api/users/' + uid, { method:'PUT', body:{ name:'Lefty B' } });
  eq(renamed.body.name, 'Lefty B', 'a user can be renamed');

  head('Progress');
  await call('/api/progress/' + uid, { method:'PUT',
    body:{ lessons:{ grid:true, scales:true }, drills:{ grid:{ 0:true, 1:false } },
           mode:'simple', theme:'dark' } });
  const prof = await call('/api/profile/' + uid);
  eq(prof.status, 200, 'GET /api/profile');
  eq(Object.keys(prof.body.progress.lessons).length, 2, 'lessons stored');
  eq(prof.body.progress.mode, 'simple', 'reading level stored');
  eq(prof.body.progress.theme, 'dark', 'theme stored');
  await call('/api/progress/' + uid, { method:'PUT', body:{ lessons:{ chords:true } } });
  const merged = await call('/api/profile/' + uid);
  eq(Object.keys(merged.body.progress.lessons).length, 3, 'progress merges rather than replaces');

  head('Attempts, mastery and review');
  const post = a => call('/api/attempts/' + uid, { method:'POST', body:a });
  await post({ kind:'interval', concept:'7', label:'perfect 5th', ok:true, lesson:'intervals' });
  await post({ kind:'interval', concept:'7', label:'perfect 5th', ok:true, lesson:'intervals' });
  await post({ kind:'interval', concept:'3', label:'minor 3rd', ok:false, lesson:'intervals' });
  const rev = await call('/api/review/' + uid);
  const five = rev.body.all.filter(s => s.concept === '7')[0];
  const third = rev.body.all.filter(s => s.concept === '3')[0];
  ok(!!five && !!third, 'both skills are tracked separately');
  eq(five.right, 2, 'right answers counted');
  eq(third.wrong, 1, 'wrong answers counted');
  ok(five.mastery > third.mastery, 'the skill answered right has the higher mastery');
  ok(third.due <= Date.now() + 1000, 'a missed skill is due immediately');
  ok(five.due > Date.now(), 'a skill answered right twice is pushed into the future');
  ok(rev.body.due.some(s => s.concept === '3'), 'the missed skill is in the due list');
  ok(!rev.body.due.some(s => s.concept === '7'), 'the known skill is not');

  head('The formulas');
  eq(masteryOf({ right:0, wrong:0, runs:[] }) > 0, true, 'an unseen skill is not zero (weak prior)');
  ok(masteryOf({ right:1, wrong:0, runs:[1], lastSeen:Date.now() }) < 1,
     'one right answer is not full mastery');
  ok(masteryOf({ right:20, wrong:0, runs:[1,1,1,1,1], lastSeen:Date.now() }) > 0.9,
     'a long clean run approaches full mastery');
  ok(masteryOf({ right:10, wrong:0, runs:[1,1,1,1,1], lastSeen:Date.now() - 60 * 86400000 })
     < masteryOf({ right:10, wrong:0, runs:[1,1,1,1,1], lastSeen:Date.now() }),
     'mastery decays when a skill is not practised');
  const day = 86400000;
  eq(Math.round((dueAfter({ streak:0 }) - Date.now()) / day), 0, 'streak 0 → due today');
  eq(Math.round((dueAfter({ streak:1 }) - Date.now()) / day), LADDER[1], 'streak 1 → tomorrow');
  eq(Math.round((dueAfter({ streak:3 }) - Date.now()) / day), LADDER[3], 'streak 3 → four days');
  ok(dueAfter({ streak:99 }) - Date.now() <= LADDER[LADDER.length - 1] * day + 1000,
     'the interval is capped');

  head('Projects');
  const proj = await call('/api/projects/' + uid, { method:'POST',
    body:{ kind:'studio', name:'House beat', lesson:'grid', bpm:124, data:{ rows:[[1,0,0,0]] } } });
  eq(proj.status, 201, 'POST /api/projects saves a project');
  const got = await call('/api/projects/' + uid);
  eq(got.body.projects.length, 1, 'it comes back');
  eq(got.body.projects[0].name, 'House beat', 'with its name');
  const del = await call('/api/projects/' + uid + '/' + proj.body.id, { method:'DELETE' });
  ok(del.body.deleted === true, 'and can be deleted');

  head('Stats');
  const st = await call('/api/stats/' + uid);
  eq(st.body.lessonsDone, 3, 'lessons done counted');
  ok(st.body.streak >= 1, 'practising today counts as a streak day');
  ok(Array.isArray(st.body.weakest) && st.body.weakest.length, 'the weakest skills are listed');
  ok(st.body.weakest[0].label === 'minor 3rd', 'weakest first');

  head('Durability');
  ok(fs.existsSync(tmp), 'the record is written to disk');
  const raw = JSON.parse(fs.readFileSync(tmp, 'utf8'));
  ok(!!raw.users[uid], 'and contains this learner');
  const missing = await call('/api/profile/nobody');
  eq(missing.status, 404, 'an unknown user is a clean 404');
  const nonsense = await call('/api/nonsense');
  eq(nonsense.status, 404, 'an unknown endpoint is a clean 404');

  console.log('\n' + pass + ' checks passed' + (fail ? ', ' + fail + ' FAILED' : ''));
  server.close();
  try { fs.unlinkSync(tmp); } catch (e) {}
  process.exit(fail ? 1 : 0);
})();
