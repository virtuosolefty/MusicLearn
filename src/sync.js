/* ═══════════════════════════════════════════════════════════════
   SYNC — optional. Talks to the local server when one is running.

   The app is built to work with no backend at all, and that stays true:
   if nothing answers /api/health, this module does nothing and every
   other module carries on reading and writing localStorage.

   When the server IS there, it becomes the source of truth:
     · on boot, the saved record is pulled down into localStorage before
       the app reads it, so a new browser picks up where you left off
     · every later write to those keys is pushed back, debounced
     · practice attempts are posted individually, which is what feeds
       mastery and the review schedule on the server

   Nothing here blocks the app for more than `TIMEOUT` milliseconds.
   ═══════════════════════════════════════════════════════════════ */
const SYNC = (() => {
  const TIMEOUT = 900;
  const KEYS = {
    lessons:'rbx-theory-progress-v1',
    drills:'rbx-theory-drills-v2',
    practice:'rbx-theory-practice-v1',
    saves:'rbx-theory-saves-v1',
    mode:'rbx-theory-mode-v1',
    theme:'rbx-theory-theme-v1',
    flat:'rbx-theory-flat-v1'
  };
  const UID = 'rbx-theory-user-v1';
  /* written by MASTERY, derived by the server from its own session rows */
  const DAYS = 'rbx-theory-days-v1';
  let base = '', on = false, uid = null, me = null, timer = null;

  const read = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const write = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
  const parse = (k, d) => { try { return JSON.parse(read(k) || '') ?? d; } catch (e) { return d; } };

  function ask(path, opt) {
    opt = opt || {};
    const ctl = typeof AbortController === 'function' ? new AbortController() : null;
    const t = setTimeout(() => ctl && ctl.abort(), opt.timeout || TIMEOUT);
    return fetch(base + path, {
      method:opt.method || 'GET',
      headers:{ 'Content-Type':'application/json' },
      body:opt.body ? JSON.stringify(opt.body) : undefined,
      signal:ctl ? ctl.signal : undefined
    }).then(r => r.ok ? r.json() : Promise.reject(new Error(String(r.status))))
      .finally(() => clearTimeout(t));
  }

  /* pull the server's copy into localStorage, before anything reads it */
  function hydrate(profile) {
    const p = profile.progress || {};
    if (p.lessons && Object.keys(p.lessons).length) write(KEYS.lessons, JSON.stringify(p.lessons));
    if (p.drills && Object.keys(p.drills).length) write(KEYS.drills, JSON.stringify(p.drills));
    if (p.mode) write(KEYS.mode, p.mode);
    if (p.theme) write(KEYS.theme, p.theme);
    if (p.flat) write(KEYS.flat, p.flat);
    if (profile.projects && profile.projects.length) {
      /* the studio stores saves under one key; keep its shape */
      const saves = profile.projects.filter(x => x.kind === 'studio').map(x => x.data);
      if (saves.length) write(KEYS.saves, JSON.stringify(saves));
    }
    /* The practice log is what the scheduler runs on, so a restored browser
       that got its lesson ticks back but not this would come back with an
       empty Today page. The server keeps it per skill; the log keys it per
       lesson, so the lesson comes off the skill, or off its last attempt. */
    const skills = profile.skills || [];
    if (skills.length) {
      const log = {};
      skills.forEach(k => {
        const from = (k.attempts || []).filter(a => a.lesson);
        const lesson = k.lesson || (from.length ? from[from.length - 1].lesson : null);
        if (!lesson) return;
        log[lesson + '|' + k.kind + '|' + k.concept] = {
          lesson, kind:k.kind, concept:k.concept, label:k.label,
          right:k.right || 0, wrong:k.wrong || 0,
          runs:(k.runs || []).slice(-12), seen:k.lastSeen || Date.now()
        };
      });
      if (Object.keys(log).length) write(KEYS.practice, JSON.stringify(log));
    }
    /* and the days practised, which is what the streak counts */
    const days = (profile.stats && profile.stats.days) || [];
    const on = days.filter(d => d.answered > 0).map(d => d.day);
    if (on.length) write(DAYS, JSON.stringify(on));
    me = profile.user;
  }

  const snapshot = () => ({
    lessons:parse(KEYS.lessons, {}),
    drills:parse(KEYS.drills, {}),
    mode:read(KEYS.mode), theme:read(KEYS.theme), flat:read(KEYS.flat)
  });

  function push(now) {
    if (!on || !uid) return;
    clearTimeout(timer);
    timer = setTimeout(() => {
      ask('/api/progress/' + uid, { method:'PUT', body:snapshot() }).catch(() => {});
      const saves = parse(KEYS.saves, []);
      saves.forEach(s => ask('/api/projects/' + uid, { method:'POST',
        body:{ id:'save-' + (s.id || s.at || s.name), kind:'studio', name:s.name || 'Idea',
               lesson:s.lesson || null, bpm:s.bpm || null, data:s } }).catch(() => {}));
    }, now ? 0 : 600);
  }
  /* leaving the page should not lose the last answer */
  function armFlush() {
    const flush = () => push(true);
    try {
      window.addEventListener('pagehide', flush);
      window.addEventListener('beforeunload', flush);
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') flush();
      });
      setInterval(() => push(true), 20000);     /* cheap on localhost */
    } catch (e) {}
  }

  /* watch the keys this app already writes, rather than rewriting every
     module to call us — one shim, and the rest of the code is untouched */
  function watch() {
    try {
      const orig = localStorage.setItem.bind(localStorage);
      localStorage.setItem = function (k, v) {
        orig(k, v);
        if (Object.keys(KEYS).some(n => KEYS[n] === k)) push();
      };
    } catch (e) {}
  }

  /* A browser with no id of its own — a fresh profile, or storage the learner
     wiped — asks the server whose machine this is. The record with work in it
     and the newest write wins; an empty shell never does. This is what makes
     "clear your browser and your progress comes back" true, and it is only
     safe because this server is one person's localhost with no accounts. */
  function adopt() {
    return ask('/api/users', { timeout:2500 })
      .then(r => {
        const used = (r && r.users || []).filter(u => (u.lessons || 0) + (u.skills || 0) > 0);
        if (!used.length) return null;
        used.sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0));
        uid = used[0].id;
        write(UID, uid);
        return ask('/api/profile/' + uid, { timeout:2500 }).catch(() => null);
      })
      .catch(() => null);
  }

  /* practice attempts go up one at a time: they are what mastery is made of */
  function attempt(a) {
    if (!on || !uid) return;
    ask('/api/attempts/' + uid, { method:'POST', body:a, timeout:2000 }).catch(() => {});
  }

  /* If the record arrives after the app has already booted (a slow first
     request, a cold server), we do not want a half-hydrated session: tell the
     app to re-read storage instead of hoping the timing worked out. */
  let booted = false;
  function applyLate() {
    if (booted && typeof APP !== 'undefined' && APP.rehydrate) APP.rehydrate();
  }
  function start(done) {
    const go = () => { try { booted = true; done(); } catch (e) {} };
    let finished = false;
    const finish = () => { if (!finished) { finished = true; go(); } };
    if (typeof fetch !== 'function' || location.protocol === 'file:') return finish();
    ask('/api/health')
      .then(h => {
        if (!h || !h.ok) throw new Error('no api');
        on = true;
        watch(); armFlush();        /* before anything else can write */
        uid = read(UID);
        return uid ? ask('/api/profile/' + uid, { timeout:2500 }).catch(() => null) : adopt();
      })
      .then(profile => {
        if (on && !profile) {
          return ask('/api/users', { method:'POST', body:{ name:'Producer' }, timeout:2500 })
            .then(u => { uid = u.id; write(UID, uid); me = { id:u.id, name:u.name }; });
        }
        if (profile) hydrate(profile);
      })
      .then(() => { if (on) push(); })
      .catch(() => { on = false; })
      .finally(() => { finish(); applyLate(); });
    /* never hold the app hostage — but give a healthy server long enough to
       answer, because booting early means reading storage before it is filled */
    setTimeout(finish, TIMEOUT * 3);
  }

  return {
    start, attempt, push,
    get on() { return on; },
    get user() { return me; },
    rename(name) {
      if (!on || !uid) return Promise.resolve(null);
      return ask('/api/users/' + uid, { method:'PUT', body:{ name } })
        .then(u => (me = { id:u.id, name:u.name }));
    },
    stats() { return (on && uid) ? ask('/api/stats/' + uid) : Promise.resolve(null); },
    review() { return (on && uid) ? ask('/api/review/' + uid) : Promise.resolve(null); }
  };
})();
