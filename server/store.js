/* ═══════════════════════════════════════════════════════════════
   STORE — where a learner's record lives.

   One interface, one implementation. The JSON file is deliberate: it
   runs with plain `node`, no install, no service to start, and the whole
   database is readable in a text editor while you are building.

   Swapping in Postgres later means writing another object with these
   same methods — nothing above this file knows how rows are stored.
   The entities are the ones a real backend would need:

     User            who is learning
     Skill           one thing worth knowing (an interval, a chord type…)
     Attempt         one answer, right or wrong, at a moment in time
     SkillMastery    the rolled-up state of a skill for a user
     ReviewSchedule  when that skill is next due
     Project         something they made and kept
     Session         a practice sitting, for streaks
   ═══════════════════════════════════════════════════════════════ */
const fs = require('fs');
const path = require('path');

const VERSION = 1;

function jsonStore(file) {
  let db = { version:VERSION, users:{} };
  let writing = false, dirty = false;

  function read() {
    try {
      const raw = fs.readFileSync(file, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed && parsed.users) db = parsed;
    } catch (e) { /* first run: keep the empty shape */ }
  }
  /* write to a temp file and rename, so a crash mid-write cannot
     leave a half-written database behind */
  function flush() {
    if (writing) { dirty = true; return; }
    writing = true;
    const tmp = file + '.tmp';
    fs.mkdir(path.dirname(file), { recursive:true }, () => {
      fs.writeFile(tmp, JSON.stringify(db, null, 2), err => {
        if (!err) { try { fs.renameSync(tmp, file); } catch (e) {} }
        writing = false;
        if (dirty) { dirty = false; flush(); }
      });
    });
  }
  read();

  const now = () => Date.now();
  const id = () => Math.random().toString(36).slice(2, 10) + now().toString(36).slice(-4);

  const blankUser = name => ({
    id:id(), name:name || 'Producer', createdAt:now(),
    progress:{ lessons:{}, drills:{}, mode:null, theme:null, flat:null },
    skills:{},            /* skillKey -> SkillMastery + ReviewSchedule */
    projects:[],
    sessions:[]           /* one row per day practised */
  });

  return {
    kind:'json', file,

    /* ── users ── */
    users() {
      return Object.keys(db.users).map(k => {
        const u = db.users[k];
        return { id:u.id, name:u.name, createdAt:u.createdAt,
                 /* when this record was last written to — a browser that has
                    lost its id needs this to find which record is its own */
                 updatedAt:(u.progress && u.progress.updatedAt) || u.createdAt,
                 lessons:Object.keys(u.progress.lessons || {}).length,
                 skills:Object.keys(u.skills || {}).length };
      });
    },
    createUser(name) {
      const u = blankUser(name);
      db.users[u.id] = u; flush();
      return u;
    },
    user(uid) { return db.users[uid] || null; },
    renameUser(uid, name) {
      const u = db.users[uid]; if (!u) return null;
      u.name = String(name || '').slice(0, 60) || u.name; flush(); return u;
    },

    /* ── progress: which lessons are done, quiz answers, preferences ── */
    putProgress(uid, patch) {
      const u = db.users[uid]; if (!u) return null;
      const p = u.progress;
      if (patch.lessons) p.lessons = Object.assign({}, p.lessons, patch.lessons);
      if (patch.drills) p.drills = Object.assign({}, p.drills, patch.drills);
      if (patch.mode != null) p.mode = patch.mode;
      if (patch.theme != null) p.theme = patch.theme;
      if (patch.flat != null) p.flat = patch.flat;
      /* the loop built across the course: replaced whole, it is one object */
      if (patch.track != null && typeof patch.track === 'object') p.track = patch.track;
      p.updatedAt = now();
      flush();
      return p;
    },

    /* ── attempts drive mastery and the review schedule ──
       Mastery is a blend, not a bare percentage: how often you are right,
       whether you are right *lately*, and how long ago you last saw it.
       Spacing follows the usual doubling ladder; a wrong answer drops you
       back to today, which is the point of spaced review.            */
    recordAttempt(uid, a) {
      const u = db.users[uid]; if (!u) return null;
      const key = (a.kind || 'x') + '|' + (a.concept == null ? '' : a.concept);
      const s = u.skills[key] || (u.skills[key] = {
        key, kind:a.kind, concept:a.concept, label:a.label || String(a.concept),
        right:0, wrong:0, runs:[], streak:0, attempts:[]
      });
      s.label = a.label || s.label;
      s.lesson = a.lesson || s.lesson;      /* which chapter asked it */
      s[a.ok ? 'right' : 'wrong']++;
      s.streak = a.ok ? s.streak + 1 : 0;
      s.runs.push(a.ok ? 1 : 0);
      if (s.runs.length > 20) s.runs = s.runs.slice(-20);
      s.attempts.push({ at:now(), ok:!!a.ok, ms:a.ms || null, lesson:a.lesson || null });
      if (s.attempts.length > 60) s.attempts = s.attempts.slice(-60);
      s.lastSeen = now();
      s.mastery = masteryOf(s);
      s.due = dueAfter(s);
      /* one session row per calendar day, for streaks */
      const day = new Date().toISOString().slice(0, 10);
      const sess = u.sessions.filter(x => x.day === day)[0] ||
        (u.sessions.push({ day, answered:0, right:0 }), u.sessions[u.sessions.length - 1]);
      sess.answered++; if (a.ok) sess.right++;
      if (u.sessions.length > 400) u.sessions = u.sessions.slice(-400);
      flush();
      return s;
    },
    skills(uid) {
      const u = db.users[uid]; if (!u) return [];
      return Object.keys(u.skills).map(k => u.skills[k])
        .sort((x, y) => (x.mastery || 0) - (y.mastery || 0));
    },
    due(uid, at) {
      const t = at || now();
      return this.skills(uid).filter(s => (s.due || 0) <= t);
    },

    /* ── projects: the things they made ── */
    projects(uid) { const u = db.users[uid]; return u ? u.projects.slice().reverse() : []; },
    putProject(uid, proj) {
      const u = db.users[uid]; if (!u) return null;
      const p = Object.assign({ id:id(), createdAt:now() }, proj);
      const at = u.projects.findIndex(x => x.id === p.id);
      if (at >= 0) u.projects[at] = p; else u.projects.push(p);
      if (u.projects.length > 300) u.projects = u.projects.slice(-300);
      flush();
      return p;
    },
    dropProject(uid, pid) {
      const u = db.users[uid]; if (!u) return false;
      const before = u.projects.length;
      u.projects = u.projects.filter(x => x.id !== pid);
      flush();
      return u.projects.length < before;
    },

    stats(uid) {
      const u = db.users[uid]; if (!u) return null;
      const skills = this.skills(uid);
      const days = u.sessions.slice(-60);
      let streak = 0;
      for (let i = 0; ; i++) {
        const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
        if (days.some(x => x.day === d && x.answered > 0)) streak++;
        else if (i > 0) break; else break;
      }
      return {
        lessonsDone:Object.keys(u.progress.lessons || {}).filter(k => u.progress.lessons[k]).length,
        skills:skills.length,
        weakest:skills.slice(0, 5).map(s => ({ label:s.label, mastery:s.mastery, due:s.due })),
        dueNow:this.due(uid).length,
        projects:u.projects.length,
        streak, days
      };
    }
  };
}

/* ── the two formulas, kept together and documented ── */
/* accuracy with a weak prior (so 1/1 is not 100% mastery), plus how the
   last few went, plus how recently it was practised */
function masteryOf(s) {
  const n = s.right + s.wrong;
  const acc = (s.right + 1) / (n + 2);
  const tail = s.runs.slice(-5);
  const recent = tail.length ? tail.reduce((a, b) => a + b, 0) / tail.length : acc;
  const ageDays = s.lastSeen ? (Date.now() - s.lastSeen) / 86400000 : 30;
  const fresh = Math.max(0, 1 - ageDays / 45);
  const m = 0.5 * acc + 0.35 * recent + 0.15 * fresh;
  return Math.round(Math.min(1, Math.max(0, m)) * 100) / 100;
}
/* the doubling ladder: right answers push the next review further out,
   a wrong answer brings it back to today */
const LADDER = [0, 1, 2, 4, 8, 16, 30];
function dueAfter(s) {
  const step = Math.min(s.streak, LADDER.length - 1);
  const days = s.streak === 0 ? 0 : LADDER[step];
  return Date.now() + days * 86400000;
}

module.exports = { jsonStore, masteryOf, dueAfter, LADDER, VERSION };
