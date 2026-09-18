/* ═══════════════════════════════════════════════════════════════
   PRACTICE — the short loop that turns a read lesson into a skill:
   hear an example, say what it was, then build the same thing yourself.

   A lesson declares one line (`practice:{ kind:'chord', pool:[…] }`) and
   this module does the rest against that lesson's own instrument. Every
   answer is recorded per concept, which is what MISTAKES then feeds on.
   ═══════════════════════════════════════════════════════════════ */
const PRACTICE = (() => {
  const rnd = a => a[Math.floor(Math.random() * a.length)];
  const uniq = a => a.filter((x, i) => a.indexOf(x) === i);
  const shuffle = a => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(p => p[1]);

  /* ── the record of what has been practised ─────────────────── */
  const KEY = 'rbx-theory-practice-v1';
  let log = {};
  function load() {
    try { log = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { log = {}; }
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(log)); } catch (e) {} }
  load();

  /* One entry per concept per lesson: enough to say "you have missed this
     three times, and here is whether that is getting better." */
  function record(lessonId, kind, concept, label, ok) {
    const k = lessonId + '|' + kind + '|' + concept;
    const e = log[k] || (log[k] = { lesson:lessonId, kind, concept, label, right:0, wrong:0, runs:[] });
    e.label = label;
    e[ok ? 'right' : 'wrong']++;
    e.runs.push(ok ? 1 : 0);
    if (e.runs.length > 12) e.runs = e.runs.slice(-12);
    e.seen = Date.now();
    save();
    return e;
  }
  const entries = () => Object.keys(log).map(k => log[k]);
  /* what is worth revisiting: missed at least once, and not yet answered
     right three times in a row since */
  const shaky = e => {
    if (!e.wrong) return false;
    const tail = e.runs.slice(-3);
    return !(tail.length === 3 && tail.every(x => x === 1));
  };
  const misses = () => entries().filter(shaky)
    .sort((a, b) => (b.wrong - b.right) - (a.wrong - a.right));
  const forLesson = id => entries().filter(e => e.lesson === id);
  /* "is this getting better?" — the first half of the record against the last */
  function trend(e) {
    const r = e.runs || [];
    if (r.length < 4) return null;
    const half = Math.floor(r.length / 2);
    const early = r.slice(0, half), late = r.slice(half);
    const pct = a => Math.round(100 * a.reduce((s, x) => s + x, 0) / a.length);
    return { from:pct(early), to:pct(late) };
  }
  function clear(lessonId) {
    Object.keys(log).forEach(k => { if (!lessonId || log[k].lesson === lessonId) delete log[k]; });
    save();
  }

  /* ── question makers, one per kind of thing a lesson teaches ── */
  /* Each returns: concept + label (what to record), answer + options (the
     identify step), notes (what to play), and a build step described in the
     instrument's own terms. */
  const MAKERS = {
    /* two notes, name the gap, then play it back from a given root */
    interval(cfg) {
      const pool = cfg.pool || [3,4,5,7,8,9,12];
      const n = rnd(pool);
      const base = rnd(cfg.roots || [55, 57, 60, 62]);
      const rn = T.MAJ_ROOT[T.pc(base)];
      const I = T.ivl(n);
      return {
        concept:String(n), label:I.label,
        notes:[[base], [base + n]], gap:420,
        answer:I.label, options:uniq(pool.map(x => T.ivl(x).label)),
        build:{ mode:'keys', from:base, expect:[base, base + n], exact:true,
          prompt:'Play a ' + I.label + ' up from ' + rn + ' — tap the two keys.' },
        why:rn + ' up to ' + T.spellIvl(rn, n) + ' is ' + n + ' semitones.'
      };
    },
    /* a chord, name its quality, then stack it yourself */
    chord(cfg) {
      const pool = cfg.pool || ['maj','min','dim','aug'];
      const t = rnd(pool);
      const root = rnd(cfg.roots || [55, 57, 60]);
      const rn = T.MAJ_ROOT[T.pc(root)];
      const ns = T.chordNotes(root, t);
      return {
        concept:t, label:T.CHORDS[t].label,
        notes:[ns],
        answer:T.CHORDS[t].label, options:uniq(pool.map(x => T.CHORDS[x].label)),
        build:{ mode:'keys', from:root, expect:ns,
          prompt:'Build ' + T.chordName(rn, t) + ' — tap all ' + ns.length +
                 ' notes, starting from the lit key.' },
        why:T.chordName(rn, t) + ' is ' + T.spellChord(rn, t).join(' ') +
            '  ·  ' + T.CHORDS[t].steps.join(' ') + ' from the root.'
      };
    },
    /* a scale, name it, then walk it up */
    scale(cfg) {
      const pool = cfg.pool || ['major','minor','harmonicMinor','minorPent'];
      const k = rnd(pool);
      const root = rnd(cfg.roots || [55, 57, 60]);
      const rn = T.rootFor(root, k);
      const ns = T.scaleNotes(root, k).concat([root + 12]);
      return {
        concept:k, label:T.SCALES[k].label,
        notes:ns.map(n => [n]), gap:230,
        answer:T.SCALES[k].label, options:uniq(pool.map(x => T.SCALES[x].label)),
        build:{ mode:'keys', from:root, expect:T.scaleNotes(root, k),
          prompt:'Play ' + rn + ' ' + T.SCALES[k].label.toLowerCase() +
                 ' — tap its ' + T.SCALES[k].steps.length + ' notes from the lit key up.' },
        why:rn + ' ' + T.SCALES[k].label + ': ' + T.spellScale(rn, k).join(' ') + '.'
      };
    },
    /* one note against a key centre, name the degree, then find it */
    degree(cfg) {
      const root = cfg.root || 60;
      const type = cfg.type || 'major';
      const d = 1 + Math.floor(Math.random() * 7);
      const rn = T.rootFor(root, type);
      const target = root + T.SCALES[type].steps[d - 1];
      const dia = T.diatonic(root, type);
      return {
        concept:'deg' + d, label:'degree ' + d,
        notes:[dia[0].notes, dia[4].notes, [target]], gap:620,
        answer:'degree ' + d, options:[1,2,3,4,5,6,7].map(x => 'degree ' + x),
        build:{ mode:'keys', from:root, expect:[target],
          prompt:'Find degree ' + d + ' of ' + rn + ' ' + type.replace('Minor', ' minor') +
                 ' — tap that one key.' },
        why:'In ' + rn + ', degree ' + d + ' is ' + T.inKey(target, rn, type) + '.'
      };
    },
    /* four chords, name the numerals, then tap the four roots in order */
    progression(cfg) {
      const pool = cfg.pool || [[1,5,6,4],[6,4,1,5],[1,4,5,1],[2,5,1,1]];
      const p = rnd(pool);
      const type = cfg.type || 'major';
      const root = cfg.root || 48;
      const rn = T.rootFor(root, type);
      const dia = T.diatonic(root, type);
      const nameOf = seq => seq.map(d => T.roman(d, dia[d - 1].quality)).join(' – ');
      return {
        concept:p.join(''), label:nameOf(p),
        notes:p.map(d => dia[d - 1].notes), gap:820,
        answer:nameOf(p), options:uniq(pool.map(nameOf)),
        build:{ mode:'keys', ordered:true, from:dia[p[0] - 1].root,
          expect:p.map(d => dia[d - 1].root),
          prompt:'Tap the four chord roots in order: ' + nameOf(p) + '.' },
        why:'In ' + rn + ': ' +
            p.map(d => T.chordName(T.inKey(dia[d - 1].root, rn, type), dia[d - 1].quality)).join(' ') + '.'
      };
    },
    /* a one-bar drum pattern, name it, then place it on the grid */
    rhythm(cfg) {
      const pats = cfg.pool || [
        { concept:'four', label:'four on the floor', row:[1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0] },
        { concept:'boombap', label:'boom bap (1 and the & of 2)', row:[1,0,0,0, 0,0,1,0, 0,0,0,0, 0,0,0,0] },
        { concept:'offbeat', label:'every offbeat', row:[0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0] },
        { concept:'dembow', label:'dembow (3+3+2)', row:[1,0,0,1, 0,0,1,0, 0,1,0,0, 1,0,0,0] }
      ];
      const p = rnd(pats);
      const lane = cfg.lane == null ? 0 : cfg.lane;
      return {
        concept:p.concept, label:p.label,
        pattern:p.row, lane,
        answer:p.label, options:uniq(pats.map(x => x.label)),
        build:{ mode:'grid', lane, expect:p.row.slice(),
          prompt:'Put that pattern on the ' + (cfg.laneName || 'kick') +
                 ' lane — tap the boxes, then check.' },
        why:'It lands on boxes ' +
            p.row.map((v, i) => v ? i + 1 : 0).filter(Boolean).join(', ') + '.'
      };
    }
  };

  /* ── the flow on the page ──────────────────────────────────── */
  function build(ctx, cfg) {
    const kind = cfg.kind;
    const maker = MAKERS[kind];
    const wrap = UI.el('div', 'practice');
    if (!maker) return wrap;

    let q = null, stage = 'hear', tapped = [], listener = null, identifiedOk = null;
    /* the learner's own beat, put back the moment the exercise is over — a
       practice round must not quietly overwrite what they were working on */
    let borrowedLane = null;
    const head = UI.html('p', 'small', '');
    const controls = UI.el('div', 'ctl');
    const answers = UI.el('div', 'ctl');
    const builder = UI.el('div', 'ctl');
    const verdict = UI.html('p', 'why', '');
    verdict.hidden = true;
    wrap.append(head, controls, answers, builder, verdict);

    const say = t => { head.innerHTML = t; };
    const playQ = () => {
      A.resume();
      const groups = q.notes || [[60]];
      const gap = q.gap || 0;
      if (q.pattern) {                        /* rhythm plays as clicks */
        q.pattern.forEach((v, i) => { if (v) ctx.later(() => A.click(cfg.sound || 'kick'), i * 125); });
        return;
      }
      groups.forEach((g, i) => ctx.later(() => {
        if (g.length > 1) A.chord(g, gap ? 1.1 : 1.6, { spread:.04 });
        else A.note(g[0], gap ? .55 : 1.4, { gain:.95 });
      }, i * (gap || 620)));
    };

    const stopListening = () => {
      if (listener && ctx.v.unlisten) ctx.v.unlisten(listener);
      listener = null;
    };
    const giveLaneBack = () => {
      if (!borrowedLane) return;
      ctx.v.pattern(borrowedLane.lane, borrowedLane.row);
      borrowedLane = null;
      if (ctx.saveInstrument) ctx.saveInstrument();
    };

    /* step 3 — build it on the instrument */
    function startBuild() {
      stage = 'build';
      answers.innerHTML = '';
      builder.innerHTML = '';
      tapped = [];
      const b = q.build;
      say('<b>Now build it.</b> ' + b.prompt);
      const note = UI.el('span', 'val', b.mode === 'keys' ? '0 tapped' : 'tap the grid');
      if (b.mode === 'keys') {
        ctx.v.clear().mark(b.from, 'root').apply().clearExtras();
        listener = m => {
          tapped.push(m);
          ctx.v.mark(m, 'target').apply();
          note.textContent = tapped.length + ' tapped';
        };
        ctx.v.listen(listener);
      }
      if (b.mode === 'grid') {
        const row = (ctx.v.state[b.lane] || []).slice();
        if (!borrowedLane) borrowedLane = { lane:b.lane, row };
        ctx.v.pattern(b.lane, row.map(() => 0));    /* an empty lane to work in */
      }
      const check = UI.btn('Check my answer', () => finish(judgeBuild()), { primary:true });
      const again = UI.btn('Start over', () => startBuild());
      builder.append(check, again, note);
    }

    function judgeBuild() {
      const b = q.build;
      if (b.mode === 'grid') {
        const row = (ctx.v.state[b.lane] || []).slice(0, b.expect.length);
        return row.join('') === b.expect.join('');
      }
      if (b.ordered) {
        const want = b.expect.map(m => T.pc(m)).join(',');
        const got = tapped.slice(-b.expect.length).map(m => T.pc(m)).join(',');
        return want === got;
      }
      /* an octave is two different keys with one name, so intervals are judged
         on the actual keys; chords and scales only care which notes */
      const norm = m => b.exact ? m : T.pc(m);
      const want = uniq(b.expect.map(norm)).sort((x, y) => x - y).join(',');
      const got = uniq(tapped.map(norm)).sort((x, y) => x - y).join(',');
      return want === got;
    }

    function finish(builtOk) {
      stopListening();
      stage = 'done';
      builder.innerHTML = '';
      const ok = identifiedOk && builtOk;
      record(ctx.L.id, kind, q.concept, q.label, ok);
      if (ctx.score) ctx.score(ok);
      verdict.hidden = false;
      verdict.innerHTML =
        (identifiedOk ? '✓ named it' : '✗ named it') + ' · ' +
        (builtOk ? '✓ built it' : '✗ built it') +
        '<br>' + q.why +
        (builtOk ? '' : '<br>' + hint());
      if (q.build.mode === 'keys') {
        ctx.v.clear().marks(q.build.expect, 'chord').mark(q.build.from, 'root').apply();
      }
      if (q.build.mode === 'grid') ctx.v.pattern(q.build.lane, q.build.expect);
      say(ok ? '<b>Both right.</b> That is the one that sticks.'
             : '<b>Worth another go.</b> The bit you missed is now in your review list.');
      controls.innerHTML = '';
      controls.append(UI.btn('↻ Another', () => reset(), { primary:true }),
                      UI.btn('🔊 Hear it again', () => playQ()));
    }

    const hint = () => {
      const b = q.build;
      if (b.mode === 'grid') return 'It should look like: ' +
        b.expect.map(v => v ? '■' : '·').join(' ');
      return 'The notes are ' + b.expect.map(m => T.name(m) + T.oct(m)).join(' ') + '.';
    };

    /* step 2 — say what it was */
    function showAnswers() {
      stage = 'identify';
      answers.innerHTML = '';
      say('<b>What was that?</b>');
      shuffle(q.options).forEach(o => {
        const b = UI.el('button', 'chip', o);
        b.type = 'button';
        b.addEventListener('click', () => {
          if (stage !== 'identify') return;
          identifiedOk = (o === q.answer);
          Array.from(answers.children).forEach(c => {
            c.disabled = true;
            if (c.textContent === q.answer) c.classList.add('right');
            if (c === b && !identifiedOk) c.classList.add('wrong');
          });
          ctx.later(() => startBuild(), 450);
        });
        answers.appendChild(b);
      });
    }

    /* step 1 — hear it */
    function reset() {
      stopListening();
      giveLaneBack();
      q = maker(cfg);
      stage = 'hear';
      identifiedOk = null;
      tapped = [];
      answers.innerHTML = ''; builder.innerHTML = '';
      verdict.hidden = true;
      controls.innerHTML = '';
      say('Listen first — you only need your ears for this part.');
      const hear = UI.btn('🔊 Hear it', () => {
        playQ();
        if (stage === 'hear') ctx.later(() => showAnswers(), 300);
      }, { primary:true });
      controls.append(hear, UI.btn('↻ Replay', () => playQ()));
    }

    if (ctx.onLeave) ctx.onLeave(() => { stopListening(); giveLaneBack(); });
    reset();
    return wrap;
  }

  /* ── which lessons get a round, and what it drills ───────────
     Only lessons whose own instrument can actually be used to build the
     answer are listed. Roots are chosen so every note lands on the keyboard
     that lesson puts on the stage. */
  const PLAN = {
    grid:        { kind:'rhythm', lane:0, laneName:'kick', sound:'kick' },
    accents:     { kind:'rhythm', lane:1, laneName:'snare', sound:'snare' },
    pianoroll:   { kind:'interval', pool:[1,2,12], roots:[55,57,60],
                   p:'Three distances, and the whole keyboard is made of them: one key, two keys, ' +
                     'and the same note again twelve keys up.' },
    intervals:   { kind:'interval', pool:[3,4,5,7,8,9,12], roots:[55,57,60] },
    scales:      { kind:'scale', pool:['major','minor','majorPent','minorPent','blues'], roots:[55,57,60] },
    modes:       { kind:'scale', pool:T.MODE_ORDER, roots:[55,57,60] },
    chords:      { kind:'chord', pool:['maj','min','dim','aug'], roots:[55,57,60] },
    progressions:{ kind:'progression', root:48, type:'major',
                   pool:[[1,5,6,4],[6,4,1,5],[1,4,5,1],[2,5,1,1],[1,6,4,5]] },
    'adv-intervals': { kind:'interval', pool:[1,2,3,4,5,6,7,8,9,10,11,12], roots:[55,57,60] },
    sevenths:    { kind:'chord', pool:['maj7','min7','dom7','m7b5','dim7','minMaj7'], roots:[55,57,60] },
    extensions:  { kind:'chord', pool:['maj','maj7','add9','maj9','six9','min9'], roots:[48,50] },
    suspensions: { kind:'chord', pool:['sus2','sus4','maj','min'], roots:[55,57,60] },
    'dom-dim-aug': { kind:'chord', pool:['dom7','dim7','aug','m7b5'], roots:[55,57,60] },
    'harmonic-minor': { kind:'scale', pool:['minor','harmonicMinor','melodicMinor','phrygianDom'],
                        roots:[55,57,60] }
  };
  const plan = lessons => lessons.forEach(L => { if (PLAN[L.id]) L.practice = PLAN[L.id]; });

  return { build, record, misses, forLesson, entries, trend, clear, MAKERS, plan, PLAN,
           get log() { return log; } };
})();
