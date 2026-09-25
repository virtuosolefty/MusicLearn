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
    if (typeof MASTERY !== 'undefined') MASTERY.touch();
    watchers.forEach(fn => { try { fn(e); } catch (err) {} });
    /* the server, when there is one, keeps mastery and the review schedule */
    if (typeof SYNC !== 'undefined' && SYNC.on) {
      SYNC.attempt({ lesson:lessonId, kind, concept, label, ok:!!ok });
    }
    return e;
  }
  /* anyone who needs to know the moment an answer lands — the page that ticks
     a lesson off, the dashboard that redraws its streak */
  const watchers = [];
  const watch = fn => { watchers.push(fn); };

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
  const RHYTHMS = [
    { concept:'four', label:'four on the floor', row:[1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0] },
    { concept:'boombap', label:'boom bap (1 and the & of 2)', row:[1,0,0,0, 0,0,1,0, 0,0,0,0, 0,0,0,0] },
    { concept:'offbeat', label:'every offbeat', row:[0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0] },
    { concept:'dembow', label:'dembow (3+3+2)', row:[1,0,0,1, 0,0,1,0, 0,1,0,0, 1,0,0,0] }
  ];
  /* a pinned concept has to be one of the options, even if the lesson that
     taught it is not the one whose pool we are drawing from */
  const withOnly = (pool, only) =>
    (only == null || pool.indexOf(only) >= 0) ? pool : pool.concat([only]);

  /* `only` pins which concept comes up — that is how the review asks again
     about the exact thing you missed, with fresh notes. The options still come
     from the whole pool, or the question would answer itself. */
  /* the direction a melody takes, read from its notes left to right */
  function shapeOf(notes) {
    const ns = (notes || []).slice().sort((a, b) => a.step - b.step);
    if (ns.length < 3) return 'too short';
    const dir = [];
    for (let i = 1; i < ns.length; i++) {
      if (ns[i].step === ns[i - 1].step) return 'chord';
      const d = ns[i].midi - ns[i - 1].midi;
      if (!d) return 'flat';
      dir.push(d > 0 ? 1 : -1);
    }
    const turns = dir.filter((d, i) => i && d !== dir[i - 1]).length;
    if (!turns) return dir[0] > 0 ? 'rise' : 'fall';
    if (turns === 1) return dir[0] > 0 ? 'arch' : 'valley';
    return 'zigzag';
  }

  const MAKERS = {
    /* two notes, name the gap, then play it back from a given root */
    interval(cfg, only) {
      const pool = withOnly(cfg.pool || [3,4,5,7,8,9,12], only == null ? null : Number(only));
      const n = only == null ? rnd(pool) : Number(only);
      const base = rnd(cfg.roots || [55, 57, 60, 62]);
      const rn = T.MAJ_ROOT[T.pc(base)];
      const I = T.ivl(n);
      return {
        concept:String(n), label:I.label,
        notes:[[base], [base + n]], gap:420,
        answer:I.label, options:uniq(pool.map(x => T.ivl(x).label)),
        build:cfg.roll
          ? { mode:'roll', expect:[base, base + n], exact:true, ordered:true,
              show:[{ step:0, midi:base }, { step:4, midi:base + n }],
              prompt:'On the roll: ' + rn + T.oct(base) + ' on beat 1 (box 1), then a ' + I.label +
                     ' above it on beat 2 (box 5).' }
          : { mode:'keys', from:base, expect:[base, base + n], exact:true,
              prompt:'Play ' + (/^[aeiou8]|^11/i.test(I.label) ? 'an ' : 'a ') + I.label + ' up from ' + rn + ' — tap the two keys.' },
        why:rn + ' up to ' + T.spellIvl(rn, n) + ' is ' + n + ' semitones.'
      };
    },
    /* a chord, name its quality, then stack it yourself */
    chord(cfg, only) {
      const pool = withOnly(cfg.pool || ['maj','min','dim','aug'], only);
      const t = only || rnd(pool);
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
    scale(cfg, only) {
      const pool = withOnly(cfg.pool || ['major','minor','harmonicMinor','minorPent'], only);
      const k = only || rnd(pool);
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
    degree(cfg, only) {
      const root = cfg.root || 60;
      const type = cfg.type || 'major';
      const d = only ? Number(String(only).replace('deg', '')) : 1 + Math.floor(Math.random() * 7);
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
    progression(cfg, only) {
      const base = cfg.pool || [[1,5,6,4],[6,4,1,5],[1,4,5,1],[2,5,1,1]];
      const pool = only && !base.some(x => x.join('') === only)
        ? base.concat([String(only).split('').map(Number)]) : base;
      const p = only ? pool.filter(x => x.join('') === only)[0] : rnd(pool);
      const type = cfg.type || 'major';
      /* the same numerals in a different key every time — which is the whole
         reason numerals exist, and what makes a review round a fresh example */
      const root = rnd(cfg.roots || [cfg.root || 48]);
      const rn = T.rootFor(root, type);
      const dia = T.diatonic(root, type);
      const nameOf = seq => seq.map(d => T.roman(d, dia[d - 1].quality)).join(' – ');
      return {
        concept:p.join(''), label:nameOf(p),
        notes:p.map(d => dia[d - 1].notes), gap:820,
        answer:nameOf(p), options:uniq(pool.map(nameOf)),
        build:cfg.roll
          ? { mode:'roll', ordered:true, expect:p.map(d => dia[d - 1].root),
              show:p.map((d, i) => ({ step:i * 4, midi:dia[d - 1].root })),
              prompt:'On the roll, put the four chord roots in order, one on each beat ' +
                     '(boxes 1, 5, 9, 13): ' + nameOf(p) + '.' }
          : { mode:'keys', ordered:true, from:dia[p[0] - 1].root,
              expect:p.map(d => dia[d - 1].root),
              prompt:'Tap the four chord roots in order: ' + nameOf(p) + '.' },
        why:'In ' + rn + ': ' +
            p.map(d => T.chordName(T.inKey(dia[d - 1].root, rn, type), dia[d - 1].quality)).join(' ') + '.'
      };
    },
    /* a lit key: say its name, then find the key a half or whole step away */
    notename(cfg, only) {
      const pcs = cfg.pool || [0,2,4,5,7,9,11];
      const want = only != null ? Number(only) : rnd(pcs);
      const lo = cfg.lo || 55;
      const m = lo + ((want - T.pc(lo) + 12) % 12);
      const nm = x => T.isBlack(x) ? T.name(x) + ' / ' + T.name(x, true) : T.name(x);
      const moves = cfg.moves || [[1, 'half step up'], [2, 'whole step up'], [-1, 'half step down'], [-2, 'whole step down']];
      const mv = rnd(moves);
      const target = m + mv[0];
      const others = shuffle([0,1,2,3,4,5,6,7,8,9,10,11].filter(x => x !== want &&
        (pcs.indexOf(x) >= 0 || pcs.length < 4))).slice(0, 3);
      return {
        concept:String(want), label:nm(m),
        notes:[[m]], show:[m],
        answer:nm(m), options:uniq([nm(m)].concat(others.map(x => nm(lo + ((x - T.pc(lo) + 12) % 12))))),
        build:{ mode:'keys', from:m, expect:[target], exact:true,
          prompt:'Tap the key a <b>' + mv[1] + '</b> from the lit one.' },
        why:'The lit key is ' + nm(m) + '. A ' + mv[1] + ' from it is ' + nm(target) + '.'
      };
    },
    /* a bar that walks in twos or rolls in threes: say which, then mark the beats */
    meter(cfg, only) {
      const g = only === 'compound' ? 3 : only === 'simple' ? 2 : rnd([2, 3]);
      const LAB = { 2:'simple \u2014 2 per beat', 3:'compound \u2014 3 per beat' };
      const expect = [];
      for (let i = 0; i < g * 4; i++) expect.push(i % g === 0 ? 1 : 0);
      return {
        concept:g === 3 ? 'compound' : 'simple', label:LAB[g],
        play:ctx => {
          const beat = 560;
          for (let bt = 0; bt < 8; bt++) for (let s2 = 0; s2 < g; s2++) {
            ctx.later(() => A.click(s2 ? 'hat' : (bt % 4 === 0 ? 'strong' : 'mid'), undefined, s2 ? 0.45 : 0.9),
              bt * beat + s2 * beat / g);
          }
        },
        answer:LAB[g], options:[LAB[2], LAB[3]],
        build:{ mode:'grid', lane:cfg.lane == null ? 1 : cfg.lane, meter:g, expect,
          prompt:'The grid now splits each beat in ' + (g === 3 ? 'three' : 'two') + '. Put a kick on ' +
                 'every beat \u2014 the first box of each group \u2014 then check.' },
        why:g === 3 ? 'Each beat split in three \u2014 straw-ber-ry. That rolling feel is compound meter.'
                    : 'Each beat split in two \u2014 ap-ple. That walking feel is simple meter.'
      };
    },
    /* four notes with a shape: name the shape, then draw any melody with it */
    contour(cfg, only) {
      const SHAPES = { rise:'rises', fall:'falls', arch:'rises, then falls', valley:'falls, then rises' };
      const pool = withOnly(cfg.pool || Object.keys(SHAPES), only);
      const k = only || rnd(pool);
      const root = cfg.root || 60, sc = cfg.scale || 'minor';
      const rows = T.scaleNotes(root, sc).concat([root + 12]);
      const pick = shuffle(rows.map((_, i) => i)).slice(0, 4).sort((a, b) => a - b);
      const [w, x, y, z] = pick;
      const order = { rise:[w, x, y, z], fall:[z, y, x, w], arch:[x, z, y, w], valley:[y, w, x, z] }[k];
      const ns = order.map(i => rows[i]);
      const rn = T.rootFor(root, sc);
      return {
        concept:k, label:'a melody that ' + SHAPES[k],
        notes:ns.map(m => [m]), gap:380,
        answer:'it ' + SHAPES[k], options:uniq(pool.map(x2 => 'it ' + SHAPES[x2])),
        build:{ mode:'roll', shape:k,
          check:notes => shapeOf(notes) === k,
          show:ns.map((m, i) => ({ step:i * 4, midi:m })),
          prompt:'Draw your own four-note melody that ' + SHAPES[k] + ' \u2014 one note on each beat ' +
                 '(boxes 1, 5, 9 and 13). Any notes, as long as the shape is right.' },
        why:'It ' + SHAPES[k] + ': ' + ns.map(m => T.inKey(m, rn, sc)).join(' \u2192 ') +
            '. The shape is what the ear remembers, long before the notes.'
      };
    },
    /* a chord, then one note over it: does the note belong? then place one that does */
    chordtone(cfg, only) {
      const root = cfg.root || 60, sc = cfg.scale || 'minor';
      const rn = T.rootFor(root, sc);
      const dia = T.diatonic(root, sc);
      const pool = (cfg.pool || [1, 4, 6, 7]).map(String);
      const d = Number(only || rnd(pool));
      const c = dia[d - 1];
      const cn = T.chordName(T.inKey(c.root, rn, sc), c.quality);
      const rows = T.scaleNotes(root, sc).concat([root + 12]);
      const inChord = m => c.notes.some(x => T.pc(x) === T.pc(m));
      const tone = Math.random() < 0.5;
      const m = rnd(rows.filter(x => inChord(x) === tone));
      const YES = 'a chord tone \u2014 it sits', NO = 'not a chord tone \u2014 it leans';
      const low = c.notes.map(n => n - 12);
      return {
        concept:String(d), label:'the notes of ' + cn,
        notes:[low, [m]], gap:760,
        answer:tone ? YES : NO, options:[YES, NO],
        build:{ mode:'roll',
          check:notes => { const on1 = notes.filter(n => n.step === 0); return on1.length > 0 && on1.every(n => inChord(n.midi)); },
          judgeCell:(st, mm) => st !== 0 ? null : inChord(mm) ? 'good' : 'bad',
          show:[{ step:0, midi:rows.filter(inChord)[0] }],
          prompt:'Put a note on beat 1 (box 1) that belongs to <b>' + cn + '</b>.' },
        why:cn + ' is ' + T.spellChord(T.inKey(c.root, rn, sc), c.quality).join(' ') + '. ' +
            T.inKey(m, rn, sc) + (tone ? ' is one of them, so it sits still.' : ' is not, so it wants to step onto one.')
      };
    },
    /* one chord in three voicings: which note is at the bottom? then play that voicing */
    inversion(cfg, only) {
      const INV = [['root', 'root position', 'root'], ['first', '1st inversion', '3rd'], ['second', '2nd inversion', '5th']];
      const i = only ? Math.max(0, INV.findIndex(x => x[0] === only)) : Math.floor(Math.random() * 3);
      const q = rnd(cfg.types || ['maj', 'min']);
      const root = rnd(cfg.roots || [55, 57, 60]);
      let ns = T.chordNotes(root, q);
      for (let k = 0; k < i; k++) ns = ns.slice(1).concat([ns[0] + 12]);
      while (Math.max.apply(null, ns) > (cfg.hi || 72)) ns = ns.map(n => n - 12);
      const cn = T.chordName(T.MAJ_ROOT[T.pc(root)], q);
      return {
        concept:INV[i][0], label:INV[i][1],
        notes:[ns].concat(ns.map(n => [n])),
        gap:520,
        answer:INV[i][1], options:INV.map(x => x[1]),
        build:{ mode:'keys', from:ns[0], expect:ns, exact:true,
          prompt:'Play ' + cn + ' in ' + INV[i][1] + ' \u2014 the lit key is the bottom note.' },
        why:'The bottom note is ' + T.name(ns[0]) + ', the ' + INV[i][2] + ' of ' + cn + ': ' +
            ns.map(n => T.name(n) + T.oct(n)).join(' ') + '.'
      };
    },
    /* home, a chord from the parallel minor, home again: which one was borrowed? */
    borrowed(cfg, only) {
      const B = { iv:{ lab:'iv \u2014 the minor four', off:5, q:'min' },
                  bVI:{ lab:'\u266DVI \u2014 the flat six', off:8, q:'maj' },
                  bVII:{ lab:'\u266DVII \u2014 the flat seven', off:10, q:'maj' },
                  bIII:{ lab:'\u266DIII \u2014 the flat three', off:3, q:'maj' } };
      const pool = withOnly(cfg.pool || Object.keys(B), only);
      const k = only || rnd(pool);
      const home = rnd(cfg.roots || [48, 50, 53]);
      const kn = T.MAJ_ROOT[T.pc(home)];
      const r = home + B[k].off;
      const ns = T.chordNotes(r, B[k].q);
      const rname = T.name(r, true);
      const cn = T.chordName(rname, B[k].q);
      return {
        concept:k, label:B[k].lab,
        notes:[T.chordNotes(home, 'maj'), ns, T.chordNotes(home, 'maj')], gap:900,
        answer:B[k].lab, options:pool.map(x => B[x].lab),
        build:{ mode:'keys', from:r, expect:ns,
          prompt:'Build that borrowed chord \u2014 ' + cn + ' \u2014 up from the lit key.' },
        why:'In ' + kn + ' major, ' + B[k].lab.split(' \u2014 ')[0] + ' is ' + cn + ' (' +
            T.spellChord(rname, B[k].q).join(' ') + '), borrowed from ' + kn + ' minor.'
      };
    },
    /* two keys in a row: how far round the wheel did it move? then tap where it went */
    neighbour(cfg, only) {
      const M = { up:['a 5th up', 'one step clockwise'], down:['a 5th down', 'one step anticlockwise'],
                  rel:['its relative minor', 'the inner ring, same spoke'] };
      const pool = withOnly(cfg.pool || Object.keys(M), only);
      const k = only || rnd(pool);
      const i = Math.floor(Math.random() * 12);
      const t = k === 'up' ? { idx:(i + 1) % 12, ring:'maj' } : k === 'down' ? { idx:(i + 11) % 12, ring:'maj' }
              : { idx:i, ring:'min' };
      const pcOf = (idx, ring) => ((idx * 7) % 12 + (ring === 'min' ? 9 : 0)) % 12;
      const chord = (idx, ring) => T.chordNotes(48 + pcOf(idx, ring), ring === 'min' ? 'min' : 'maj');
      const lab = (idx, ring) => ring === 'min' ? T.MINOR_LABEL[idx] : T.KEY_LABEL[idx];
      return {
        concept:k, label:M[k][0],
        notes:[chord(i, 'maj'), chord(t.idx, t.ring)], gap:950,
        answer:M[k][0] + ' \u2014 ' + M[k][1], options:pool.map(x => M[x][0] + ' \u2014 ' + M[x][1]),
        build:{ mode:'wheel', from:i, expect:t, target:lab(t.idx, t.ring),
          prompt:'On the wheel, tap the key that is ' + M[k][0] + ' from ' + T.KEY_LABEL[i] + '.' },
        why:T.KEY_LABEL[i] + ' \u2192 ' + lab(t.idx, t.ring) + ': ' + M[k][1] + '.'
      };
    },
    /* a few bars of the loop with some layers out: which section is it? */
    section(cfg, only) {
      const S = { intro:['intro \u2014 chords alone', [0, 0, 1, 0]],
                  verse:['verse \u2014 drums, bass and chords', [1, 1, 1, 0]],
                  drop:['chorus or drop \u2014 everything in', [1, 1, 1, 1]],
                  breakdown:['breakdown \u2014 drums and bass out', [0, 0, 1, 1]] };
      const pool = withOnly(cfg.pool || Object.keys(S), only);
      const k = only || rnd(pool);
      const on = S[k][1];
      return {
        concept:k, label:S[k][0],
        play:ctx => {
          const bed = (typeof TRACK !== 'undefined') ? TRACK.bed() : null;
          const chords = bed || [{ notes:[48,51,55], root:36 }, { notes:[44,48,51], root:32 },
                                  { notes:[51,55,58], root:39 }, { notes:[46,50,53], root:34 }];
          const beat = 330;
          for (let st = 0; st < 16; st++) ctx.later(() => {
            const c = chords[Math.floor(st / 4) % chords.length];
            if (on[0]) { if (st % 4 === 0) A.click('kick'); if (st % 8 === 4) A.click('snare'); A.click('hat', undefined, 0.35); }
            if (on[1] && st % 2 === 0) A.note(c.root, 0.3, { gain:0.8 });
            if (on[2] && st % 4 === 0) A.chord(c.notes.map(n => n + 12), 1.2, { spread:0.03, gain:0.35 });
            if (on[3] && st % 2 === 1) A.note(c.notes[(st >> 1) % c.notes.length] + 24, 0.25, { gain:0.6 });
          }, st * beat / 2);
        },
        answer:S[k][0], options:pool.map(x => S[x][0]),
        build:{ mode:'grid', column:{ step:0, on:on.slice() },
          prompt:'In the first column (bar 1), switch on exactly the layers a <b>' + k +
                 '</b> uses \u2014 and switch the others off.' },
        why:'A ' + k + ' is ' + S[k][0].split(' \u2014 ')[1] + '. Arrangement is mostly deciding what is missing.'
      };
    },
    /* a one-bar drum pattern, name it, then place it on the grid */
    rhythm(cfg, only) {
      const pats = cfg.pool || RHYTHMS;
      const p = (only && pats.filter(x => x.concept === only)[0]) || rnd(pats);
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
  /* A review queue turns entries from the log back into questions: same
     concept, fresh notes, and the instrument the concept belongs on. */
  function queued(entry) {
    const base = PLAN[entry.lesson] || {};
    /* everything the lesson's own round knows — its roots, its roll, its
       grid lane — plus which concept to ask about */
    return Object.assign({}, base, { kind:entry.kind || base.kind, only:entry.concept,
                                     lesson:entry.lesson, queue:undefined });
  }

  /* ── a round that grows ─────────────────────────────────────
     A lesson can introduce its ideas in small groups: `ladder` lists them in
     order, and the next group joins the round once every idea already in it
     has come back right twice. Nothing to switch on; it just widens. */
  function level(cfg) {
    if (!cfg.ladder) return null;
    const got = {};
    forLesson(cfg.lesson).forEach(e => { got[e.concept] = e.right || 0; });
    let n = 1;
    while (n < cfg.ladder.length &&
           cfg.ladder.slice(0, n).every(st => st.pool.every(c => (got[String(c)] || 0) >= 2))) n++;
    const pool = [].concat.apply([], cfg.ladder.slice(0, n).map(st => st.pool));
    return { n, of:cfg.ladder.length, pool, name:cfg.ladder[n - 1].name };
  }
  const withLevel = cfg => {
    const lv = level(cfg);
    return lv ? Object.assign({}, cfg, { pool:lv.pool }) : cfg;
  };

  let lastQ = null;          /* the question most recently asked, for tests and tools */
  function build(ctx, cfg) {
    const queue = cfg.queue ? cfg.queue.slice() : null;
    const wrap = UI.el('div', 'practice');
    let at = 0, cur = cfg;
    const maker = () => MAKERS[cur.kind];
    if (queue ? !queue.length : !MAKERS[cfg.kind]) return wrap;

    let q = null, stage = 'hear', tapped = [], listener = null, identifiedOk = null, pending = null;
    /* the learner's own beat, put back the moment the exercise is over — a
       practice round must not quietly overwrite what they were working on */
    let borrowedLane = null, borrowedGrid = null, borrowedRoll = null;
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
      if (q.show && q.build.mode === 'keys' && ctx.v.mark) {
        ctx.v.clear().marks(q.show, 'root').apply();
      }
      if (q.play) { q.play(ctx); return; }
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
      if (ctx.v && ctx.v.judge) ctx.v.judge(null);
    };
    const giveLaneBack = () => {
      if (borrowedLane && ctx.v.pattern) {
        ctx.v.pattern(borrowedLane.lane, borrowedLane.row);
        borrowedLane = null;
        if (ctx.saveInstrument) ctx.saveInstrument();
      }
      if (borrowedGrid && ctx.v.pattern) {
        borrowedGrid.forEach((row, l) => ctx.v.pattern(l, row));
        borrowedGrid = null;
        if (ctx.saveInstrument) ctx.saveInstrument();
      }
      if (borrowedRoll && ctx.v.setNotes) {
        ctx.v.setNotes(borrowedRoll);
        if (ctx.keep) ctx.keep('notes', borrowedRoll.slice());
        borrowedRoll = null;
        if (ctx.syncA11y) ctx.syncA11y();
      }
    };
    /* the notes on the roll that the learner put there, left to right */
    const placed = () => (ctx.v.notes || []).filter(n => n.role !== 'seed')
      .slice().sort((a, b) => a.step - b.step || a.midi - b.midi);

    /* step 3 — build it on the instrument */
    function startBuild() {
      stage = 'build';
      answers.innerHTML = '';
      builder.innerHTML = '';
      tapped = [];
      const b = q.build;
      say('<b>Now build it.</b> ' + b.prompt);
      const note = UI.el('span', 'val', b.mode === 'keys' ? '0 tapped' : b.mode === 'roll' ? 'tap the roll'
        : b.mode === 'wheel' ? 'tap the wheel' : 'tap the grid');
      if (b.mode === 'keys') {
        ctx.v.clear().mark(b.from, 'root').apply().clearExtras();
        listener = m => {
          tapped.push(m);
          ctx.v.mark(m, 'target').apply();
          note.textContent = tapped.length + ' tapped';
        };
        ctx.v.listen(listener);
        /* each press answers straight away — green if that note belongs,
           amber if not — so the check at the end is never the first news */
        const norm = m => b.exact ? m : T.pc(m);
        const wanted = b.expect.map(norm);
        if (ctx.v.judge) ctx.v.judge(m => wanted.indexOf(norm(m)) >= 0 ? 'good' : 'bad');
      }
      if (b.mode === 'grid' && b.column) {
        /* an arrangement question: the whole first column is the answer */
        if (!borrowedGrid) borrowedGrid = ctx.v.state.map(r => r.slice());
        ctx.v.state.forEach((r, l) => { const nr = r.slice(); nr[b.column.step] = 0; ctx.v.pattern(l, nr); });
        if (ctx.v.judge) ctx.v.judge((l, s) => s !== b.column.step ? null : b.column.on[l] ? 'good' : 'bad');
      } else if (b.mode === 'grid') {
        /* a meter question brings its own grid: two or three boxes to a beat */
        if (b.meter && (ctx.v.state[b.lane] || []).length !== b.expect.length) {
          /* the meter lesson knows how to redraw its own grid; anywhere else
             (Today, a mixed round) the grid is simply swapped for one that fits */
          if (ctx.setMeter && ctx.L && ctx.L.id === 'meter') ctx.setMeter(b.meter);
          else {
            ctx.v = V.set('grid', { steps:b.meter * 4, group:b.meter,
              lanes:[{ name:'Pulse', kind:'click' }, { name:'Kick', kind:'kick' }, { name:'Hat', kind:'hat' }] });
            if (ctx.syncA11y) ctx.syncA11y();
          }
        }
        const row = (ctx.v.state[b.lane] || []).slice();
        if (!borrowedLane && !b.meter) borrowedLane = { lane:b.lane, row };
        ctx.v.pattern(b.lane, row.map(() => 0));    /* an empty lane to work in */
        if (ctx.v.judge) ctx.v.judge((l, s) => l !== b.lane ? null : b.expect[s] ? 'good' : 'bad');
      }
      if (b.mode === 'roll') {
        if (!borrowedRoll) borrowedRoll = (ctx.v.notes || []).slice();
        ctx.v.setNotes([]);
        listener = () => {
          const n = placed().length;
          note.textContent = n + (n === 1 ? ' note' : ' notes') + ' placed';
        };
        ctx.v.listen(listener);
        if (ctx.v.judge) {
          if (b.judgeCell) ctx.v.judge(b.judgeCell);
          else if (b.expect) {
            const norm = m => b.exact ? m : T.pc(m);
            const wanted = b.expect.map(norm);
            ctx.v.judge((st, m) => wanted.indexOf(norm(m)) >= 0 ? 'good' : 'bad');
          }
        }
        if (ctx.syncA11y) ctx.syncA11y();
      }
      if (b.mode === 'wheel') {
        if (ctx.v.roles) ctx.v.roles({});
        if (b.from != null && ctx.v.select) ctx.v.select(b.from);
        listener = (idx, ring) => {
          tapped = [{ idx, ring }];
          note.textContent = (ring === 'min' ? T.MINOR_LABEL[idx] : T.KEY_LABEL[idx]) + ' picked';
        };
        ctx.v.listen(listener);
      }
      const check = UI.btn('Check my answer', () => finish(judgeBuild()), { primary:true });
      const again = UI.btn('Start over', () => startBuild());
      builder.append(check, again, note);
    }

    function judgeBuild() {
      const b = q.build;
      if (b.mode === 'grid' && b.column) {
        return b.column.on.every((v, l) => !!(ctx.v.state[l] || [])[b.column.step] === !!v);
      }
      if (b.mode === 'wheel') {
        const t = tapped[tapped.length - 1];
        return !!t && t.idx === b.expect.idx && t.ring === b.expect.ring;
      }
      if (b.mode === 'roll') {
        const ns = placed();
        if (b.check) return !!b.check(ns);
        const norm = m => b.exact ? m : T.pc(m);
        return ns.map(n => norm(n.midi)).join(',') === b.expect.map(norm).join(',');
      }
      if (b.check) return !!b.check(tapped);
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

    /* the ear warm-up stops at "name it": no instrument, one channel only */
    function finishEar() {
      stage = 'done';
      const ok = !!identifiedOk;
      record(cur.lesson || ctx.L.id, cur.kind, q.concept, q.label, ok);
      if (cfg.onResult) cfg.onResult(ok, q, cur);
      verdict.hidden = false;
      verdict.classList.toggle('good', ok);
      verdict.classList.toggle('bad', !ok);
      verdict.innerHTML = '<span class="say">' + (typeof ICONS !== 'undefined'
        ? ICONS.inline(ok ? 'check' : 'cross') : '') + '<span>' + (ok ? 'Right \u2014 ' : 'It was ') +
        escape(q.answer) + '.</span></span>' + q.why;
      say(ok ? '<b>By ear.</b> Nothing to look at, and you still knew.' : '<b>Listen again</b>, now that you know.');
      controls.innerHTML = '';
      const more = !queue || at < queue.length;
      controls.append(
        UI.btn(queue ? (more ? 'Next →' : 'Finish') : '↻ Another', () => reset(), { primary:true }),
        UI.btn('🔊 Hear it again', () => playQ()));
    }
    const escape = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;');

    function finish(builtOk) {
      stopListening();
      stage = 'done';
      builder.innerHTML = '';
      const ok = identifiedOk && builtOk;
      record(cur.lesson || ctx.L.id, cur.kind, q.concept, q.label, ok);
      if (ctx.score) ctx.score(ok);
      if (cfg.onResult) cfg.onResult(ok, q, cur);
      verdict.hidden = false;
      const tick = (on, word) => '<span class="verdict ' + (on ? 'good' : 'bad') + '">' +
        (typeof ICONS !== 'undefined' ? ICONS.inline(on ? 'check' : 'cross')
                                      : (on ? '\u2713' : '\u2717')) + '<span>' + word + '</span></span>';
      verdict.classList.toggle('good', ok);
      verdict.classList.toggle('bad', !ok);
      verdict.innerHTML =
        '<span class="say">' + tick(identifiedOk, 'named it') + ' &nbsp; ' + tick(builtOk, 'built it') + '</span>' +
        q.why + (builtOk ? '' : '<br>' + hint());
      if (ctx.chime) ctx.chime(ok);
      if (ok && typeof V !== 'undefined' && V.fx) V.fx.ring(q.build.mode === 'keys' ? q.build.expect : null, 'good');
      if (q.build.mode === 'keys') {
        ctx.v.clear().marks(q.build.expect, 'chord').mark(q.build.from, 'root').apply();
      }
      if (q.build.mode === 'grid' && q.build.column) {
        q.build.column.on.forEach((v, l) => {
          const r = (ctx.v.state[l] || []).slice(); r[q.build.column.step] = v ? 1 : 0; ctx.v.pattern(l, r);
        });
      } else if (q.build.mode === 'grid') ctx.v.pattern(q.build.lane, q.build.expect);
      if (q.build.mode === 'roll' && !builtOk && q.build.show) {
        ctx.v.setNotes(q.build.show.map(n => ({ step:n.step, midi:n.midi, len:1, role:'chord' })));
      }
      if (q.build.mode === 'wheel') {
        const t = q.build.expect;
        if (t.ring === 'maj') ctx.v.select(t.idx); else ctx.v.roles({ ['m' + t.idx]:'chord' });
      }
      if (ctx.syncA11y) ctx.syncA11y();
      const lvAfter = level(cur);
      const up = lvAfter && q.level && lvAfter.n > q.level.n;
      say(up ? '<b>Level up.</b> ' + lvAfter.name.charAt(0).toUpperCase() + lvAfter.name.slice(1) +
               ' join the round from the next question.'
         : ok ? '<b>Both right.</b> That is the one that sticks.'
             : '<b>Worth another go.</b> The bit you missed is now in your review list.');
      controls.innerHTML = '';
      const more = !queue || at < queue.length;
      controls.append(
        UI.btn(queue ? (more ? 'Next →' : 'Finish') : '↻ Another',
          () => reset(), { primary:true }),
        UI.btn('🔊 Hear it again', () => playQ()));
    }

    const hint = () => {
      const b = q.build;
      if (b.mode === 'grid' && b.column) return 'Bar 1 should have: ' +
        ['drums', 'bass', 'chords', 'melody'].filter((x, i) => b.column.on[i]).join(', ') + '.';
      if (b.mode === 'wheel') return 'The answer is ' + b.target + '.';
      if (b.mode === 'roll' && b.check) return 'One that works is on the roll now.';
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
            if (c === b) c.classList.add('picked');
            if (c !== b && c.textContent === q.answer) c.classList.add('reveal');
          });
          if (ctx.chime) ctx.chime(identifiedOk);
          if (cfg.earOnly) ctx.later(() => finishEar(), 350);
          else ctx.later(() => startBuild(), 450);
        });
        answers.appendChild(b);
      });
    }

    /* step 1 — hear it */
    function reset() {
      stopListening();
      giveLaneBack();
      if (queue) {
        if (at >= queue.length) { if (cfg.onDone) cfg.onDone(); return; }
        cur = queued(queue[at++]);
        /* the concept's own instrument — though a page that has its own use
           for the stage (Today's path) keeps it until the round is begun */
        if (cfg.onStage) {
          if (cfg.lazyStage && at === 1) pending = cur;
          else cfg.onStage(cur);
        }
      }
      if (!maker()) { if (cfg.onDone) cfg.onDone(); return; }
      const lvBefore = level(cur);
      q = maker()(cur.only == null ? withLevel(cur) : cur, cur.only);
      q.level = lvBefore;
      lastQ = q;
      stage = 'hear';
      identifiedOk = null;
      tapped = [];
      answers.innerHTML = ''; builder.innerHTML = '';
      verdict.hidden = true;
      controls.innerHTML = '';
      say(queue ? 'Listen first — <b>' + at + ' of ' + queue.length + '</b>: ' +
                  (cur.only ? 'the one you missed, with different notes.' : '')
                : 'Listen first — you only need your ears for this part.' +
                  (q.level ? ' <span class="lvl">Level ' + q.level.n + ' of ' + q.level.of +
                    ' \u00b7 ' + q.level.name + '</span>' : ''));
      const hear = UI.btn('🔊 Hear it', () => {
        if (pending) { const p = pending; pending = null; cfg.onStage(p); }
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
    notes:       { kind:'notename', pool:[0,1,2,3,4,5,6,7,8,9,10,11], lo:55,
                   ladder:[{ name:'the white keys', pool:[0,2,4,5,7,9,11] },
                           { name:'the black keys', pool:[1,3,6,8,10] }],
                   p:'A key lights up: say its name, then find the key a half or a whole step away. ' +
                     'White keys first; the black ones join once those come back right.' },
    intervals:   { kind:'interval', pool:[3,4,5,7,8,9,12], roots:[55,57,60],
                   ladder:[{ name:'the two thirds', pool:[3,4] },
                           { name:'the 4th and 5th', pool:[5,7] },
                           { name:'the sixths and the octave', pool:[8,9,12] }],
                   p:'It starts with just the two thirds \u2014 sad and happy. The 4th and 5th join once ' +
                     'you have landed both twice, then the sixths and the octave.' },
    scales:      { kind:'scale', pool:['major','minor','majorPent','minorPent','blues'], roots:[55,57,60],
                   ladder:[{ name:'major and minor', pool:['major','minor'] },
                           { name:'the two pentatonics', pool:['majorPent','minorPent'] },
                           { name:'the blues scale', pool:['blues'] }],
                   p:'Major and minor first. The pentatonics join once both come back right twice, ' +
                     'then the blues scale.' },
    meter:       { kind:'meter', lane:1, laneName:'kick',
                   p:'Hear a bar, say whether it walks in twos or rolls in threes, then mark the beats.' },
    melody:      { kind:'contour', root:60, scale:'minor',
                   p:'Hear four notes and say which way they go. Then draw your own \u2014 any notes, same shape.' },
    'melody-chords': { kind:'chordtone', root:60, scale:'minor', pool:[1,4,6,7],
                   p:'A chord, then one note over it. Does it sit, or lean? Then put a note that sits on beat 1.' },
    eightbar:    { kind:'progression', roll:true, type:'minor', roots:[60],
                   pool:[[1,6,3,7],[1,4,5,1],[6,7,1,1],[1,7,6,7]],
                   p:'Four chords in C minor. Name the numerals, then lay the four roots out on the roll.' },
    structure:   { kind:'section',
                   p:'A few bars of the loop with layers taken out. Name the section, then set bar 1 to match.' },
    inversions:  { kind:'inversion', types:['maj','min'], roots:[55,57,60],
                   p:'The same chord, three ways up. Listen for the bottom note, then play that voicing.' },
    borrowed:    { kind:'borrowed', roots:[48,50,53],
                   p:'Home, one borrowed chord, home again. Name the stranger, then build it.' },
    circle:      { kind:'neighbour',
                   p:'Two chords in a row. How far round the wheel did it move? Then tap where it went.' },
    beatblock:   { kind:'contour', root:57, scale:'minor', pool:['rise','fall','arch','valley'],
                   p:'A starting motif is a shape before it is notes. Name this one, then draw your own.' },
    challenges:  { kind:'mix', mix:true,
                   p:'Five questions from the lessons you have reached, each on its own instrument.' },
    modes:       { kind:'scale', pool:T.MODE_ORDER, roots:[55,57,60] },
    chords:      { kind:'chord', pool:['maj','min','dim','aug'], roots:[55,57,60] },
    progressions:{ kind:'progression', roots:[48,50,52,53], type:'major',
                   pool:[[1,5,6,4],[6,4,1,5],[1,4,5,1],[2,5,1,1],[1,6,4,5]] },
    'adv-intervals': { kind:'interval', pool:[1,2,3,4,5,6,7,8,9,10,11,12], roots:[55,57,60] },
    sevenths:    { kind:'chord', pool:['maj7','min7','dom7','m7b5','dim7','minMaj7'], roots:[55,57,60] },
    extensions:  { kind:'chord', pool:['maj','maj7','add9','maj9','six9','min9'], roots:[48,50] },
    suspensions: { kind:'chord', pool:['sus2','sus4','maj','min'], roots:[55,57,60] },
    'dom-dim-aug': { kind:'chord', pool:['dom7','dim7','aug','m7b5'], roots:[55,57,60] },
    'harmonic-minor': { kind:'scale', pool:['minor','harmonicMinor','melodicMinor','phrygianDom'],
                        roots:[55,57,60] },
    /* bass moves: the distances a bassline actually walks */
    bassline:    { kind:'interval', pool:[0,5,7,12], roots:[36,39,43], roll:true,
                   p:'Root, 4th, 5th, octave \u2014 four distances, and most basslines are made of them.' },
    velocity:    { kind:'rhythm', lane:2, laneName:'hat', sound:'hat',
                   p:'Name the pattern, then place it. Velocity is what you bring to it afterwards.' }
  };
  const plan = lessons => lessons.forEach(L => {
    if (PLAN[L.id]) { PLAN[L.id].lesson = L.id; L.practice = PLAN[L.id]; }
  });
  /* the ear warm-up: kinds that can be named from sound alone */
  const EAR = ['interval','chord','scale','rhythm','meter','progression','inversion','borrowed',
               'neighbour','contour','chordtone','section','degree'];
  function earQueue(ids, n) {
    const pool = shuffle((ids || []).filter(id => PLAN[id] && EAR.indexOf(PLAN[id].kind) >= 0));
    const out = [];
    for (let i = 0; pool.length && i < (n || 3); i++) {
      const id = pool[i % pool.length];
      out.push({ lesson:id, kind:PLAN[id].kind, concept:null });
    }
    return out;
  }
  /* a mixed round: one question each from lessons already reached, fresh notes */
  function mixQueue(ids, n) {
    const pool = shuffle((ids || []).filter(id => PLAN[id] && !PLAN[id].mix));
    return pool.slice(0, n || 5).map(id => ({ lesson:id, kind:PLAN[id].kind, concept:null }));
  }

  return { build, record, misses, forLesson, entries, trend, clear, watch, reload:load,
           MAKERS, plan, PLAN, mixQueue, earQueue, EAR, level, shapeOf,
           queued, RHYTHMS,
           get log() { return log; }, get current() { return lastQ; } };
})();
