/* ═══════════════════════════════════════════════════════════════
   MASTERY — what you know, how well, and when to see it again.

   PRACTICE records every answer. This turns that log into two numbers
   per skill: a mastery score, and a date it is next worth practising.
   From those it builds the day's workout.

   The formulas are the same ones server/store.js uses, deliberately:
   with the local server running the numbers agree, and without it the
   browser still schedules on its own. Change one, change both.
   ═══════════════════════════════════════════════════════════════ */
const MASTERY = (() => {
  const DAY = 86400000;
  /* right answers push the next review further out; a wrong one brings it
     back to today. Days, indexed by how many you have got right in a row. */
  const LADDER = [0, 1, 2, 4, 8, 16, 30];

  /* accuracy with a weak prior (so one lucky answer is not mastery),
     plus recent form, plus how long ago you last saw it */
  function score(e) {
    const n = (e.right || 0) + (e.wrong || 0);
    const acc = ((e.right || 0) + 1) / (n + 2);
    const runs = e.runs || [];
    const tail = runs.slice(-5);
    const recent = tail.length ? tail.reduce((a, b) => a + b, 0) / tail.length : acc;
    const ageDays = e.seen ? (Date.now() - e.seen) / DAY : 30;
    const fresh = Math.max(0, 1 - ageDays / 45);
    return Math.round(Math.min(1, Math.max(0, 0.5 * acc + 0.35 * recent + 0.15 * fresh)) * 100) / 100;
  }
  const streakOf = e => {
    const r = e.runs || [];
    let n = 0;
    for (let i = r.length - 1; i >= 0 && r[i] === 1; i--) n++;
    return n;
  };
  function dueAt(e) {
    const s = streakOf(e);
    const days = s === 0 ? 0 : LADDER[Math.min(s, LADDER.length - 1)];
    return (e.seen || Date.now()) + days * DAY;
  }
  /* "in 2 days", "today", "overdue" — the only form of this a learner needs */
  function when(due) {
    const d = Math.round((due - Date.now()) / DAY);
    if (d <= -1) return 'overdue';
    if (d <= 0) return 'today';
    if (d === 1) return 'tomorrow';
    return 'in ' + d + ' days';
  }

  const entries = () => (typeof PRACTICE === 'undefined' ? [] : PRACTICE.entries());

  /* every practised skill, weakest first */
  function board() {
    return entries().map(e => ({
      lesson:e.lesson, kind:e.kind, concept:e.concept, label:e.label,
      right:e.right || 0, wrong:e.wrong || 0,
      mastery:score(e), due:dueAt(e), streak:streakOf(e),
      trend:(typeof PRACTICE !== 'undefined' && PRACTICE.trend) ? PRACTICE.trend(e) : null
    })).sort((a, b) => a.mastery - b.mastery || a.due - b.due);
  }
  const dueNow = () => board().filter(s => s.due <= Date.now());

  /* ── the day's workout ──────────────────────────────────────
     Due first, then the weakest, then something new from a lesson they
     have already reached — so a session is never only revision and never
     only novelty. One item is about a minute. */
  function workout(minutes, reachedIds) {
    const want = Math.max(4, Math.min(12, Math.round(minutes || 10)));
    const seen = {}, out = [];
    const take = s => {
      const k = s.lesson + '|' + s.kind + '|' + s.concept;
      if (seen[k] || out.length >= want) return;
      seen[k] = 1;
      out.push({ lesson:s.lesson, kind:s.kind, concept:s.concept, label:s.label });
    };
    const all = board();
    all.filter(s => s.due <= Date.now()).forEach(take);   /* due */
    all.filter(s => s.mastery < 0.7).forEach(take);       /* shaky */
    /* then fresh questions from lessons that have a round and have been reached */
    if (out.length < want && typeof PRACTICE !== 'undefined') {
      const reached = reachedIds && reachedIds.length ? reachedIds : Object.keys(PRACTICE.PLAN);
      reached.filter(id => PRACTICE.PLAN[id]).forEach(id => {
        if (out.length >= want) return;
        const plan = PRACTICE.PLAN[id];
        out.push({ lesson:id, kind:plan.kind, concept:null, label:'something new' });
      });
    }
    return out.slice(0, want);
  }

  /* ── days practised, for the week strip and the streak ── */
  const DKEY = 'rbx-theory-days-v1';
  const today = () => new Date().toISOString().slice(0, 10);
  function days() {
    try { return JSON.parse(localStorage.getItem(DKEY) || '[]') || []; } catch (e) { return []; }
  }
  function touch() {
    try {
      const d = days(), t = today();
      if (d[d.length - 1] === t) return;
      d.push(t);
      localStorage.setItem(DKEY, JSON.stringify(d.slice(-400)));
    } catch (e) {}
  }
  function streak() {
    const d = days(), set = {};
    d.forEach(x => { set[x] = 1; });
    let n = 0;
    for (let i = 0; ; i++) {
      const day = new Date(Date.now() - i * DAY).toISOString().slice(0, 10);
      if (set[day]) n++;
      else if (i > 0) break;
      else break;
    }
    return n;
  }
  /* the last seven days, oldest first, for the strip */
  function week() {
    const set = {};
    days().forEach(x => { set[x] = 1; });
    const out = [];
    for (let i = 6; i >= 0; i--) {
      const dt = new Date(Date.now() - i * DAY);
      const key = dt.toISOString().slice(0, 10);
      out.push({ day:key, on:!!set[key],
                 letter:['S','M','T','W','T','F','S'][dt.getDay()] });
    }
    return out;
  }

  function summary() {
    const b = board();
    const avg = b.length ? b.reduce((s, x) => s + x.mastery, 0) / b.length : 0;
    return {
      skills:b.length,
      mastery:Math.round(avg * 100),
      due:b.filter(s => s.due <= Date.now()).length,
      weak:b.filter(s => s.mastery < 0.7).length,
      streak:streak()
    };
  }

  return { LADDER, score, dueAt, when, board, dueNow, workout,
           days, touch, streak, week, summary };
})();
