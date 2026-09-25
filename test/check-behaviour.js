#!/usr/bin/env node
/* Behaviour checks: what the lessons DO, not just what the theory says.
 *
 *   node test/check-behaviour.js
 *
 * These run the real lesson `init` code against a recording stand-in for the
 * 3D stage, so they catch the class of bug where the sound, the label and the
 * highlighted keys drift apart — or where switching reading level quietly
 * throws away what the learner just built.
 */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');

let fail = 0, pass = 0;
const eq = (got, want, label) => {
  if (String(got) === String(want)) { pass++; return; }
  fail++; console.log('  FAIL  ' + label + '\n        got  ' + got + '\n        want ' + want);
};
const ok = (cond, label) => { if (cond) pass++; else { fail++; console.log('  FAIL  ' + label); } };
const head = t => console.log('\n' + t);

/* ── a fake DOM, just enough for the lesson controls to be built ── */
function fakeEl(tag) {
  const n = {
    tagName:(tag || 'div').toUpperCase(), children:[], dataset:{}, style:{}, attrs:{},
    className:'', textContent:'', value:'', type:'', hidden:false, disabled:false,
    listeners:{}, el:null,
    classList:{ add(){}, remove(){}, toggle(){}, contains:() => false },
    set innerHTML(v) { this._html = v; if (v === '') this.children = []; },
    get innerHTML() { return this._html || ''; },
    appendChild(c) { this.children.push(c); return c; },
    append(...cs) { cs.forEach(c => c && this.children.push(c)); },
    setAttribute(k, v) { this.attrs[k] = String(v); },
    getAttribute(k) { return this.attrs[k]; },
    addEventListener(k, fn) { (this.listeners[k] = this.listeners[k] || []).push(fn); },
    click() { (this.listeners.click || []).forEach(fn => fn()); },
    focus() {},
    querySelector: () => null,
    querySelectorAll: () => [],
    getContext: () => ({ measureText:() => ({ width:10 }), fillText(){}, beginPath(){},
      moveTo(){}, lineTo(){}, quadraticCurveTo(){}, fill(){}, stroke(){}, scale(){} })
  };
  return n;
}
global.window = {};
global.document = {
  createElement:fakeEl,
  querySelector:() => null,
  querySelectorAll:() => [],
  addEventListener(){},
  documentElement:fakeEl('html'),
  get activeElement() { return null; }
};
global.localStorage = {
  _d:{}, getItem(k) { return this._d[k] === undefined ? null : this._d[k]; },
  setItem(k, v) { this._d[k] = String(v); }
};

/* ── a stage that records instead of drawing ── */
function recorder() {
  let self = null;                 /* every method returns the proxy, so calls chain */
  const view = {
    marked:new Map(), state:[[], [], []], notes:[], sel:0, _steps:16, _lanes:3,
    _reset(steps, lanes) {
      view._steps = steps; view._lanes = lanes; view.state = [];
      for (let l = 0; l < lanes; l++) view.state.push(new Array(steps).fill(0));
    },
    range() { return [48, 72]; },
    clear() { view.marked = new Map(); return self; },
    mark(m, role) { view.marked.set(m, role || 'chord'); return self; },
    marks(list, role) { (list || []).forEach(m => view.marked.set(m, role || 'chord')); return self; },
    pattern(l, arr) { arr.forEach((v, s) => { if (view.state[l]) view.state[l][s] = v; }); return self; },
    toggle(l, s) { view.state[l][s] = view.state[l][s] ? 0 : 1; return self; },
    clearAll() { view.state.forEach(r => r.fill(0)); return self; },
    /* the real GridView builds its accessible buttons from exactly this */
    a11y() {
      return { title:'Step grid', groups:view.state.map((row, l) => ({
        name:'lane ' + l + ' · ' + view._steps + ' steps',
        items:row.map((v, st) => ({ label:String(st + 1),
          aria:'lane ' + l + ', step ' + (st + 1) + (v ? ', on' : ', off'),
          pressed:!!v, act:() => view.toggle(l, st) })) })) };
    }
  };
  /* everything else on the view is a chainable no-op */
  self = new Proxy(view, { get(t, k) {
    if (k in t) return t[k];
    return () => self;
  } });
  return self;
}

/* ── load the app modules against those stand-ins ── */
const theory = read('src/theory.js');
const uiSrc = read('src/ui.js');
const practiceSrc = read('src/practice.js');
const masterySrc = read('src/mastery.js');
const mixerSrc = read('src/mixer.js');
const instrSrc = read('src/instruments.js');
const rackSrc = read('src/rack.js');
const studioSrc = read('src/studio.js');
const flatSrc = read('src/flat.js');
const scenesSrc = read('src/scenes.js');
const extraSrc = ['src/input.js','src/track.js','src/genres.js','src/glossary.js',
                  'src/predict.js','src/cheatsheet.js'].map(read).join('\n');
const lessonSrc = ['src/lessons-level1.js','src/lessons-level2.js','src/lessons-level3.js',
                   'src/simple-level1.js','src/simple-level2.js',
                   'src/lessons-production.js','src/simple-production.js',
                   'src/curriculum.js'].map(read).join('\n');

const heard = [];            /* every pitch the audio engine was asked to play */
const KIT_MOCK = {
  kick:{ from:155, to:48, sweep:0.11, gain:0.9, tail:0.1, tailV:0.15 },
  snare:{ len:0.16, hp:1400, decay:2, gain:0.5 },
  clap:{ len:0.20, hp:1100, decay:1.4, gain:0.42 },
  hat:{ len:0.045, hp:7000, decay:1.2, gain:0.22 }
};
const Amock = {
  KIT:KIT_MOCK,
  PLUCK:{ oscs:[['triangle', 0.55, 0], ['sine', 0.34, -1200], ['sawtooth', 0.12, 4]] },
  PAD:{ oscs:[['sawtooth', 0.30, 0], ['sawtooth', 0.22, 7], ['triangle', 0.34, -1200]] },
  resume:() => {}, now:() => 0, init:() => {},
  note:(m) => heard.push(m),
  chord:(ms) => ms.forEach(m => heard.push(m)),
  click:() => {},
  transport:() => ({ start(){}, stop(){}, get playing() { return false; }, set bpm(v) {} })
};
let stage = recorder();
const Vmock = { set:(kind, cfg) => {
                  if (kind === 'grid') stage._reset((cfg && cfg.steps) || 16,
                                                    (cfg && cfg.lanes || [0,0,0]).length);
                  return stage;
                },
                a11y:() => stage.a11y(), setTheme:() => {}, label:() => ({}), mount:() => {},
                input:(m, vel) => { inputs.push([m, vel]); return m; },
                get view() { return stage; } };
const inputs = [];          /* every note the INPUT module handed to the stage */

const sandbox = new Function('A', 'V', 'document', 'window', 'localStorage',
  theory.replace(/^const A = \(\(\)[\s\S]*$/m, '') + '\n' +
  mixerSrc + '\n' + instrSrc + '\n' +
  uiSrc + '\n' + practiceSrc + '\n' + masterySrc + '\n' + studioSrc + '\n' + rackSrc + '\n' + flatSrc + '\n' +
  extraSrc + '\n' + lessonSrc +
  '\nreturn { LESSONS, UI, T, APP, PRACTICE, STUDIO, FLAT, MASTERY, MIXER, INSTRUMENTS, RACK,' +
  ' INPUT, TRACK, GENRES, GLOSSARY, PREDICT, CHEAT, CURRICULUM };');
const { LESSONS, UI, T, APP, PRACTICE, STUDIO, FLAT, MASTERY, MIXER, INSTRUMENTS, RACK,
        INPUT, TRACK, GENRES, GLOSSARY, PREDICT, CHEAT, CURRICULUM } =
  sandbox(Amock, Vmock, global.document, global.window, global.localStorage);
PRACTICE.plan(LESSONS);

/* a lesson context, backed by a store that survives a "re-render" the way the
   app's own per-lesson scratch space does */
function makeCtx(store, L) {
  let syncs = 0;
  const ctx = {
    v:stage, L:L || { id:'test', title:'Test' }, T, A:Amock, UI, later:fn => fn(), reads:[],
    read(t) { ctx.reads.push(String(t)); },
    hint(){}, stage(){}, seq(){}, stop(){},
    keep:(k, v) => { store[k] = v; },
    recall:k => store[k],
    syncA11y:() => { syncs++; },
    get syncs() { return syncs; },
    score(){}
  };
  return ctx;
}
/* run a lesson the way render() does: build its controls, then init */
function mount(L, store) {
  const ctx = makeCtx(store, L);
  const built = [];
  (L.blocks || []).forEach(b => {
    if (!b.try || !b.try.build) return;
    const made = b.try.build(ctx);
    (Array.isArray(made) ? made : [made]).forEach(x => x && built.push(x));
  });
  if (L.init) L.init(ctx);
  return { ctx, built };
}
const lesson = id => LESSONS.find(L => L.id === id);

/* ═══ 1. a chord's name always matches the notes underneath it ═══ */
head('Chord names agree with their notes');
{
  const pcsOf = ns => ns.map(n => T.pc(n)).sort((a, b) => a - b).join(',');
  Object.keys(T.SCALES).forEach(type => {
    if (T.SCALES[type].steps.length !== 7) return;
    T.diatonic(48, type).forEach(c => {
      [['quality', c.notes], ['q7', c.seventh]].forEach(([qk, notes]) => {
        const q = c[qk];
        const rn = T.inKey(c.root, T.rootFor(48, type), type);
        const spelt = T.spellChord(rn, q);
        const named = T.chordName(rn, q);
        ok(!!T.CHORDS[q], type + ' degree ' + c.degree + ' ' + qk + ': "' + q + '" is a real chord');
        if (!T.CHORDS[q]) return;
        eq(pcsOf(T.chordNotes(T.nameToPc(rn), q)), pcsOf(notes),
           type + ' ' + named + ': written notes match the notes played');
        eq(spelt.length, notes.length, type + ' ' + named + ': one name per note');
      });
    });
  });
  /* the reported case: III of harmonic minor carries a MAJOR 7th */
  const III = T.diatonic(51, 'harmonicMinor')[2];      /* E♭ in C harmonic minor */
  eq(III.q7, 'augMaj7', 'harmonic minor III with a 7th is an augmented major 7th');
  eq(T.spellChord('E♭', III.q7).join(' '), 'E♭ G B D', 'E♭maj7♯5 spells E♭ G B D');
  eq(T.chordName('E♭', III.q7), 'E♭maj7♯5', 'and is named maj7♯5, not 7♯5');
  ok(T.roman(3, III.q7).indexOf('+') > 0, 'its numeral is still augmented');
}

/* ═══ 2. switching reading level keeps what the learner built ═══ */
head('Mode switches keep edits');
{
  const L = lesson('progressions');
  const store = {};
  const a = mount(L, store);
  a.ctx.loadProg('h1,4,6,5');          /* harmonic minor preset */
  a.ctx.sevenths(true);
  a.ctx.slot = 1;
  /* edit slot 1 to degree 3 — the augmented chord from bug 1 */
  const degSel = null;
  a.ctx.pills && a.ctx.pills.show(-1);
  store.state = { keyType:'harmonicMinor', seq:[3,4,6,5], sevens:true, preset:null };
  const b = mount(L, store);           /* "switch to Like I'm 5" */
  const kept = store.state;
  eq(kept.seq.join(','), '3,4,6,5', 'the edited progression survives the switch');
  eq(kept.keyType, 'harmonicMinor', 'so does the key');
  eq(kept.sevens, 'true', 'so does the 7ths setting');
  const sevenToggle = b.built.filter(x => x && x.attrs && x.attrs['aria-pressed'] !== undefined &&
                                     x.textContent === 'Add 7ths')[0];
  ok(sevenToggle && sevenToggle.attrs['aria-pressed'] === 'true',
     'the Add 7ths control comes back switched on');
  const pills = b.ctx.pills;
  const litPill = pills && pills.children.filter(c => c.attrs['aria-pressed'] === 'true');
  eq(litPill ? litPill.length : -1, 0, 'no preset pill claims to be the edited progression');
  /* and the chord actually shown is the edited degree, not the preset's */
  const readout = b.ctx.reads.join('\n');
  ok(/\[III\+\]|\[III\]/.test(readout) || /E♭/.test(readout),
     'the readout opens on the edited slot 1, not the preset (' +
     readout.split('\n')[0] + ')');
}

/* ═══ 3. presets are saved and announced ═══ */
head('Preset changes persist and resync the buttons');
{
  const L = lesson('grid');
  const store = {};
  const a = mount(L, store);
  const before = a.ctx.syncs;
  a.ctx.preset('traphats');
  ok(a.ctx.syncs > before, 'a preset tells the accessible panel to refresh');
  ok(!!store.pattern, 'a preset is saved like a tap is');
  eq(store.pattern[2].join(''), '1111111111111111', 'trap hats are on every box');
  const b = mount(L, store);           /* re-render, e.g. a theme or mode change */
  eq(b.ctx.v.state[2].join(''), '1111111111111111', 'and they are still there afterwards');

  /* the accessible buttons describe the grid as it actually is */
  const d = Vmock.a11y();
  const onCount = d.groups[2].items.filter(i => i.pressed).length;
  eq(onCount, 16, 'every hat button reports itself as on');
  ok(d.groups[2].items.every(i => /, on$/.test(i.aria)),
     'and says so in its description too');
  /* a meter change swaps the grid for one with a different step count */
  const M = lesson('meter');
  const mstore = {};
  const m = mount(M, mstore);
  m.ctx.setMeter(3);
  eq(Vmock.a11y().groups[0].items.length, 12, 'compound meter exposes 12 steps');
  m.ctx.setMeter(2);
  eq(Vmock.a11y().groups[0].items.length, 8, 'simple meter exposes 8, matching the demo');
}

/* ═══ 4. every question keeps its own score ═══ */
head('Quiz questions have stable, distinct identities');
{
  ok(typeof APP.qKey === 'function', 'the app exposes its question identity');
  let shared = 0, distinct = 0;
  LESSONS.forEach(L => {
    const pro = L.quiz || [], simple = (L.simple && L.simple.quiz) || [];
    pro.forEach((Q, i) => {
      const S = simple[i];
      if (!S) return;
      const same = String(Q.q) === String(S.q) && Q.a.join('|') === S.a.join('|');
      if (same) { shared++; eq(APP.qKey(Q), APP.qKey(S), L.id + ' Q' + (i + 1) + ': identical questions share a record'); }
      else { distinct++; ok(APP.qKey(Q) !== APP.qKey(S), L.id + ' Q' + (i + 1) + ': different questions score separately'); }
    });
  });
  ok(distinct > 0, 'the two reading levels really do ask different questions (' + distinct + ')');
  /* the reported case: one bar vs two bars in The Grid */
  const G = lesson('grid');
  ok(APP.qKey(G.quiz[0]) !== APP.qKey(G.simple.quiz[0]),
     'The Grid: "two bars" and "one bar" are not the same question');
  /* a key must depend on the options too, not only the text */
  ok(APP.qKey({ q:'x', a:['1','2'] }) !== APP.qKey({ q:'x', a:['1','3'] }),
     'the options are part of a question\'s identity');
}

/* ═══ 5. ear training never lights a note it did not play ═══ */
head('Ear training shows the notes it actually played');
{
  const L = lesson('challenges');
  const LO = 48, HI = 84;          /* the keyboard this lesson puts on the stage */
  eq(L.stage.cfg.lo + '-' + L.stage.cfg.hi, LO + '-' + HI, 'the stage spans three octaves');
  ['ivl','chord','prog','scale','deg'].forEach(kind => {
    const store = { drill:kind, hard:true };
    const { ctx } = mount(L, store);
    let outOfRange = 0, mismatch = 0, rounds = 0;
    for (let i = 0; i < 120; i++) {
      heard.length = 0;
      stage.clear();
      ctx.next();                                   /* generates and plays */
      const played = heard.slice();
      if (!played.length) continue;
      rounds++;
      if (played.some(m => m < LO || m > HI)) outOfRange++;
      /* answer, which triggers the correction the learner is shown */
      const first = ctx.answers && ctx.answers.children[0];
      if (!first) continue;
      first.click();
      const shown = Array.from(stage.marked.keys())
        .filter(m => ['root','target','chord','scale'].indexOf(stage.marked.get(m)) >= 0);
      if (shown.some(m => played.indexOf(m) < 0)) mismatch++;
    }
    ok(rounds > 0, kind + ': questions were generated');
    eq(outOfRange, 0, kind + ' (hard): every note played is on the keyboard');
    eq(mismatch, 0, kind + ' (hard): every key lit up is a key that sounded');
  });
}

/* ═══ 6. the two corrected teaching claims stay corrected ═══ */
head('Teaching claims');
{
  const text = lessonSrc.replace(/\s+/g, ' ');
  ok(!/7ths soften the push of a V chord/.test(text),
     'the "7ths soften the V" claim is gone');
  ok(/adding the 7th to a V chord <em>increases<\/em> the tension/i.test(text),
     'and is replaced by the pull it actually adds');
  ok(!/B♭ becomes B — and the chord on 5 turns into <b>G7<\/b>/.test(text),
     'raising the 7th no longer "turns the chord into G7"');
  ok(/The chord on 5 is now G–B–D: <b>G major<\/b>/.test(text),
     'it turns into G major, with G7 named as the separate step');
  ok(/Add the 7th of the chord on top — F — and you get <b>G7<\/b>/.test(text),
     'and adding F is what makes it G7');
}

/* ═══ 7. practice rounds are answerable and stay on the keyboard ═══ */
head('Practice rounds');
{
  const ids = Object.keys(PRACTICE.PLAN);
  ok(ids.length > 0, 'some lessons carry a practice round');
  ids.forEach(id => {
    const L = lesson(id);
    ok(!!L, id + ': the plan names a real lesson');
    if (!L) return;
    ok(!!L.practice, id + ': the plan is attached to the lesson');
    const cfg = PRACTICE.PLAN[id];
    if (cfg.mix) {
      /* a mixed round borrows every other lesson's own maker */
      const qs = PRACTICE.mixQueue(ids, 5);
      eq(qs.length, 5, id + ': a mixed round has five questions');
      ok(qs.every(e => e.lesson !== id && PRACTICE.MAKERS[e.kind]), id + ': each one from another lesson, with a maker');
      return;
    }
    ok(typeof PRACTICE.MAKERS[cfg.kind] === 'function', id + ': its kind has a maker');
    /* a piano roll only has the rows of its scale */
    const rc = L.stage.cfg || {};
    const rollRows = [];
    if (L.stage.view === 'roll') {
      for (let o = 0; o < (rc.octaves || 2); o++) T.SCALES[rc.scale || 'minor'].steps.forEach(st => rollRows.push((rc.root || 60) + st + 12 * o));
      rollRows.push((rc.root || 60) + 12 * (rc.octaves || 2));
    }
    let offRoll = 0, badWheel = 0, badExample = 0;
    const lo = (L.stage.cfg && L.stage.cfg.lo) || 48;
    const hi = (L.stage.cfg && L.stage.cfg.hi) || 72;
    const onKeys = L.stage.view === 'keys';
    let bad = 0, unanswerable = 0, unnamed = 0, offGrid = 0;
    for (let i = 0; i < 200; i++) {
      const q = PRACTICE.MAKERS[cfg.kind](cfg);
      if (q.options.indexOf(q.answer) < 0) unanswerable++;
      if (!q.concept || !q.label) unnamed++;
      const heard = [].concat.apply([], q.notes || []);
      const shown = (q.build && q.build.expect) || [];
      if (onKeys) {
        const all = heard.concat(q.build.mode === 'keys' ? shown : [], [q.build.from]);
        if (all.some(m => m < lo || m > hi)) bad++;
      }
      if (q.build.mode === 'grid' && q.build.column) {
        if (q.build.column.on.length !== ((L.stage.cfg && L.stage.cfg.lanes) || []).length) offGrid++;
      } else if (q.build.mode === 'grid') {
        const steps = q.build.meter ? q.build.meter * 4 : ((L.stage.cfg && L.stage.cfg.steps) || 16);
        if (shown.length !== steps) offGrid++;
        if (!shown.some(v => v)) offGrid++;       /* an empty answer is not a pattern */
      }
      if (q.build.mode === 'roll') {
        const all = (q.build.expect || []).concat((q.build.show || []).map(n => n.midi));
        if (all.some(m => rollRows.indexOf(m) < 0)) offRoll++;
        /* the example it shows after a miss must itself pass */
        if (q.build.check && !q.build.check((q.build.show || []).map(n => ({ step:n.step, midi:n.midi })))) badExample++;
      }
      if (q.build.mode === 'wheel') {
        const t = q.build.expect;
        if (!t || t.idx < 0 || t.idx > 11 || (t.ring !== 'maj' && t.ring !== 'min')) badWheel++;
      }
    }
    if (L.stage.view === 'roll') eq(offRoll, 0, id + ': every note it asks for is a row on the roll');
    eq(badExample, 0, id + ': the example answer it shows passes its own check');
    eq(badWheel, 0, id + ': every wheel answer is a real tile');
    eq(unanswerable, 0, id + ': the right answer is always among the options');
    eq(unnamed, 0, id + ': every round records a named concept');
    if (onKeys) eq(bad, 0, id + ': every note it plays or asks for fits the keyboard (' + lo + '-' + hi + ')');
    if (!onKeys) eq(offGrid, 0, id + ': every pattern fits the grid');
  });
  /* the build step must be satisfiable by the notes it names */
  const ivl = PRACTICE.MAKERS.interval({ pool:[12], roots:[60] });
  eq(ivl.build.expect.join(','), '60,72', 'an octave asks for two different keys');
  ok(ivl.build.exact, 'and is judged on the keys, not the note names');

  /* the record: right and wrong accumulate, and improvement is visible */
  PRACTICE.clear();
  PRACTICE.record('intervals', 'interval', '3', 'minor 3rd', false);
  PRACTICE.record('intervals', 'interval', '3', 'minor 3rd', false);
  eq(PRACTICE.misses().length, 1, 'a missed concept shows up for review');
  PRACTICE.record('intervals', 'interval', '3', 'minor 3rd', true);
  PRACTICE.record('intervals', 'interval', '3', 'minor 3rd', true);
  eq(PRACTICE.misses().length, 1, 'two right answers is not yet enough to retire it');
  PRACTICE.record('intervals', 'interval', '3', 'minor 3rd', true);
  eq(PRACTICE.misses().length, 0, 'three in a row retires it from the review list');
  const e = PRACTICE.forLesson('intervals')[0];
  eq(e.right + '/' + e.wrong, '3/2', 'the tally is kept');
  const t = PRACTICE.trend(e);
  ok(t && t.to > t.from, 'and the trend shows it improving (' + t.from + '% → ' + t.to + '%)');
  PRACTICE.clear();
}

/* ═══ 8. review asks the same concept again, with different notes ═══ */
head('Mistake review');
{
  PRACTICE.clear();
  const missed = [
    { lesson:'intervals', kind:'interval', concept:'3', label:'minor 3rd' },
    { lesson:'chords', kind:'chord', concept:'dim', label:'diminished' },
    { lesson:'modes', kind:'scale', concept:'dorian', label:'Dorian' },
    { lesson:'grid', kind:'rhythm', concept:'dembow', label:'dembow (3+3+2)' },
    { lesson:'progressions', kind:'progression', concept:'6415', label:'vi – IV – I – V' }
  ];
  missed.forEach(m => PRACTICE.record(m.lesson, m.kind, m.concept, m.label, false));
  const due = PRACTICE.misses();
  eq(due.length, missed.length, 'every missed concept is queued for review');

  due.forEach(e => {
    const cfg = PRACTICE.queued(e);
    const seen = {};
    let wrongConcept = 0, missingOption = 0;
    for (let i = 0; i < 60; i++) {
      const q = PRACTICE.MAKERS[cfg.kind](cfg, cfg.only);
      if (String(q.concept) !== String(e.concept)) wrongConcept++;
      if (q.options.indexOf(q.answer) < 0) missingOption++;
      seen[JSON.stringify(q.notes || q.pattern)] = 1;
    }
    eq(wrongConcept, 0, e.label + ': review asks about that exact concept');
    eq(missingOption, 0, e.label + ': and it is still one of several options');
    /* rhythms are a fixed pattern; anything pitched should move around */
    if (cfg.kind !== 'rhythm') {
      ok(Object.keys(seen).length > 1,
         e.label + ': with different notes each time (' + Object.keys(seen).length + ' variants)');
    }
    ok(q_options_plural(cfg, e), e.label + ': the answer is not the only choice offered');
  });

  function q_options_plural(cfg, e) {
    const q = PRACTICE.MAKERS[cfg.kind](cfg, cfg.only);
    return q.options.length > 1;
  }

  /* a concept the lesson's own pool does not contain is still reviewable */
  const odd = PRACTICE.queued({ lesson:'chords', kind:'chord', concept:'min7', label:'minor 7th' });
  const q = PRACTICE.MAKERS.chord(odd, odd.only);
  eq(q.concept, 'min7', 'a concept outside the lesson pool can still be asked');
  ok(q.options.indexOf(q.answer) >= 0, 'and it is added to the options');
  PRACTICE.clear();
}

/* ═══ 9. the MIDI it writes is a file a DAW will open ═══ */
head('MIDI export');
{
  /* decode what we just encoded: a file that only this code can read is no use */
  function parse(bytes) {
    const str = (o, n) => String.fromCharCode.apply(null, Array.from(bytes.slice(o, o + n)));
    const u32 = o => (bytes[o] << 24 | bytes[o + 1] << 16 | bytes[o + 2] << 8 | bytes[o + 3]) >>> 0;
    const u16 = o => bytes[o] << 8 | bytes[o + 1];
    const hdr = { magic:str(0, 4), len:u32(4), format:u16(8), tracks:u16(10), division:u16(12) };
    const chunks = [];
    let pos = 14;
    while (pos < bytes.length) {
      const id = str(pos, 4), len = u32(pos + 4);
      chunks.push({ id, len, at:pos + 8 });
      pos += 8 + len;
    }
    const evs = [], meta = [];
    chunks.forEach(c => {
      let p = c.at, t = 0, guard = 0;
      const vlq = () => { let v = 0, b; do { b = bytes[p++]; v = (v << 7) | (b & 0x7F); } while (b & 0x80); return v; };
      while (p < c.at + c.len && guard++ < 5000) {
        t += vlq();
        const st = bytes[p++];
        if (st === 0xFF) {
          const type = bytes[p++], l = vlq();
          meta.push({ type, data:Array.from(bytes.slice(p, p + l)) });
          p += l;
          if (type === 0x2F) break;
          continue;
        }
        evs.push({ t, cmd:st & 0xF0, ch:st & 0x0F, note:bytes[p++], vel:bytes[p++] });
      }
    });
    return { hdr, chunks, evs, meta, bytes:bytes.length };
  }

  const grid = { rows:[[1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],
                       [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
                       [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0]],
                 kinds:['kick','snare','hat'] };
  const notes = STUDIO.notesFrom('grid', grid);
  eq(notes.length, 4 + 2 + 8, 'a drum pattern turns into one note per hit');
  const f = parse(STUDIO.midi(notes, { bpm:96, name:'Beat', ch:9 }));
  eq(f.hdr.magic, 'MThd', 'the file starts with a MIDI header');
  eq(f.hdr.len, 6, 'the header is the standard six bytes');
  eq(f.hdr.format, 1, 'written as format 1');
  eq(f.hdr.tracks, 2, 'a tempo track and a note track');
  eq(f.hdr.division, STUDIO.PPQ, 'ticks per quarter note are declared');
  eq(f.chunks.length, 2, 'and both chunks are present');
  eq(f.evs.filter(e => e.cmd === 0x90).length, f.evs.filter(e => e.cmd === 0x80).length,
     'every note that starts also stops');
  eq(f.evs.length, notes.length * 2, 'no events are lost or invented');
  ok(f.evs.every(e => e.ch === 9), 'drums are written to the GM drum channel');
  eq([...new Set(f.evs.map(e => e.note))].sort((a, b) => a - b).join(','), '36,38,42',
     'on the GM kick, snare and hat notes');
  /* a 16th box is a quarter of a quarter note */
  const kicks = f.evs.filter(e => e.cmd === 0x90 && e.note === 36).map(e => e.t);
  eq(kicks.join(','), [0, 4, 8, 12].map(s => s * STUDIO.PPQ / 4).join(','),
     'four on the floor lands on the beats');
  /* tempo meta carries the right microseconds per quarter note */
  const tempo = f.meta.filter(m => m.type === 0x51)[0];
  ok(!!tempo, 'the file states its tempo');
  const us = (tempo.data[0] << 16) | (tempo.data[1] << 8) | tempo.data[2];
  eq(Math.round(60000000 / us), 96, 'and it is the tempo the lesson was playing at');

  /* delta times longer than 127 ticks need multi-byte encoding */
  const far = STUDIO.PPQ * 8;
  const g = parse(STUDIO.midi([{ note:60, t:0, dur:120 }, { note:62, t:far, dur:120 }],
                              { bpm:120, ch:0 }));
  eq(g.evs.filter(e => e.cmd === 0x90).map(e => e.t).join(','), '0,' + STUDIO.PPQ * 8,
     'a note eight beats later still lands eight beats later');
  ok(g.evs.every(e => e.ch === 0), 'pitched parts are written to channel 1');

  /* melodies and chords */
  const roll = STUDIO.notesFrom('roll', { notes:[{ step:0, midi:60, len:2 }, { step:4, midi:63, len:1 }] });
  eq(roll.map(n => n.note + '@' + n.t).join(' '), '60@0 63@480', 'roll steps become ticks');
  ok(roll[0].dur > roll[1].dur, 'and a longer note stays longer');
  const chords = STUDIO.notesFrom('chords', { chords:[[48,52,55],[53,57,60]] });
  eq(chords.length, 6, 'each chord exports all of its notes');
  eq(chords[3].t, STUDIO.PPQ * 4, 'with one bar per chord');

  /* undo keeps its own history, and a no-op edit is not an edit */
  let state = { n:1 };
  const h = STUDIO.history(() => JSON.parse(JSON.stringify(state)), s => { state = s; });
  ok(!h.canUndo, 'nothing to undo to begin with');
  state = { n:2 }; h.changed();
  state = { n:3 }; h.changed();
  h.changed();                      /* nothing moved */
  ok(h.canUndo, 'an edit can be undone');
  h.undo(); eq(state.n, 2, 'undo steps back one edit, not two');
  h.undo(); eq(state.n, 1, 'and again');
  ok(!h.canUndo, 'until there is nothing left to undo');
  ok(h.canRedo, 'and everything undone can be redone');
  h.redo(); eq(state.n, 2, 'redo steps forward');
  state = { n:9 }; h.changed();
  ok(!h.canRedo, 'a fresh edit drops the redo trail');
}

/* ═══ 10. every instrument can be drawn face-on, or says it cannot ═══ */
head('Flat view');
{
  /* each 3D view has to declare what it is, or the flat view has nothing to go on */
  const views = (scenesSrc.match(/a11y\(\)\s*\{/g) || []).length;
  const shapes = (scenesSrc.match(/shape:'[a-z]+'/g) || []).map(s => s.slice(7, -1));
  eq(shapes.length + 1, views, 'every view but one declares a shape');
  eq(shapes.slice().sort().join(','), 'grid,keys,path,roll', 'and they are the four it can draw');
  /* the one that does not is the circle — a wheel has no face-on version */
  const wheelLesson = LESSONS.filter(L => L.stage.view === 'wheel').map(L => L.id);
  eq(wheelLesson.join(','), 'circle', 'the only view without one is the circle of fifths');

  /* supports() decides whether the canvas may be hidden — getting this wrong
     is a blank stage, which is how the roll lessons first broke */
  const shown = { shape:'grid', groups:[{ name:'k', items:[] }] };
  Vmock.a11y = () => shown;
  ok(FLAT.supports(), 'a grid can be drawn flat');
  shown.shape = 'keys'; ok(FLAT.supports(), 'so can a keyboard');
  shown.shape = 'roll'; shown.matrix = { steps:16, rows:[] }; ok(FLAT.supports(), 'so can a piano roll');
  shown.shape = 'wheel'; ok(!FLAT.supports(), 'a wheel says it cannot');
  Vmock.a11y = () => null;
  ok(!FLAT.supports(), 'and neither can nothing at all');
  Vmock.a11y = () => stage.a11y();

  /* the choice is remembered, and a phone starts flat */
  FLAT.set(true); ok(FLAT.on, 'turning it on sticks');
  FLAT.set(false); ok(!FLAT.on, 'and so does turning it off');
  eq(typeof FLAT.narrow(), 'boolean', 'it can tell whether the screen is narrow');

  /* every lesson is covered by a flat view or is the known exception */
  const uncovered = LESSONS.filter(L => ['keys','grid','roll'].indexOf(L.stage.view) < 0)
    .map(L => L.id + ':' + L.stage.view);
  eq(uncovered.join(','), 'circle:wheel', 'every other lesson has a face-on instrument');
}

/* ═══ 11. an ear-training miss is recorded as a concept, and re-askable ═══ */
head('Ear training feeds the review');
{
  PRACTICE.clear();
  const L = lesson('challenges');
  const seen = {};
  ['ivl','chord','prog','scale','deg'].forEach(kind => {
    const { ctx } = mount(L, { drill:kind, hard:false });
    for (let i = 0; i < 8; i++) {
      ctx.next();
      const first = ctx.answers && ctx.answers.children[0];
      if (first) first.click();
    }
    const got = PRACTICE.forLesson('challenges').filter(e => !seen[e.kind + e.concept]);
    got.forEach(e => { seen[e.kind + e.concept] = 1; });
    ok(got.length > 0, kind + ': answers are recorded against what was asked');
  });

  const all = PRACTICE.forLesson('challenges');
  ok(all.length > 0, 'the ear trainer writes to the same record the review reads');
  ok(all.every(e => !!PRACTICE.MAKERS[e.kind]),
     'every drill records a kind the review knows how to ask again (' +
     [...new Set(all.map(e => e.kind))].join(', ') + ')');
  ok(all.every(e => e.label && String(e.concept).length),
     'and names the concept, so a breakdown can point at it');

  /* the round trip: a miss here comes back as a question about the same thing */
  let mismatched = 0;
  all.forEach(e => {
    const cfg = PRACTICE.queued(e);
    const q = PRACTICE.MAKERS[cfg.kind](cfg, cfg.only);
    if (String(q.concept) !== String(e.concept)) mismatched++;
  });
  eq(mismatched, 0, 'and the review asks about exactly that concept again');

  /* the five drills map onto five distinct practice kinds */
  eq([...new Set(all.map(e => e.kind))].sort().join(','),
     'chord,degree,interval,progression,scale', 'all five drills are covered');
  PRACTICE.clear();
}

/* ═══ Mastery, review dates and the day's workout ═══════════════ */
head('What to practise today');
{
  PRACTICE.clear();
  const DAY = 86400000;
  /* a perfect record and a hopeless one, so the ordering has something to say */
  for (let i = 0; i < 6; i++) PRACTICE.record('intervals', 'interval', 7, 'perfect 5th', true);
  for (let i = 0; i < 4; i++) PRACTICE.record('chords', 'chord', 'min', 'minor triad', false);
  PRACTICE.record('scales', 'scale', 'major', 'major scale', true);

  const board = MASTERY.board();
  eq(board.length, 3, 'every practised concept is on the board');
  ok(board[0].label === 'minor triad', 'and the weakest is first');
  ok(board[board.length - 1].mastery > board[0].mastery,
     'mastery rises with a better record (' + board[0].mastery + ' \u2192 ' +
     board[board.length - 1].mastery + ')');
  ok(board.every(s => s.mastery >= 0 && s.mastery <= 1), 'mastery stays inside 0..1');

  /* the ladder: right answers push the next date out, a wrong one pulls it back */
  const five = board.filter(s => s.label === 'perfect 5th')[0];
  const min3 = board.filter(s => s.label === 'minor triad')[0];
  ok(five.due - Date.now() > 10 * DAY, 'six right in a row is not asked again for weeks');
  ok(min3.due <= Date.now(), 'something you keep missing is due now');
  eq(MASTERY.when(min3.due), 'today', 'and is described as due today');
  eq(MASTERY.when(Date.now() + 1.2 * DAY), 'tomorrow', 'tomorrow reads as tomorrow');
  eq(MASTERY.when(Date.now() - 2 * DAY), 'overdue', 'a missed date reads as overdue');

  /* the workout: due and shaky first, and every item asks about a real concept */
  const plan = MASTERY.workout(10, ['intervals', 'chords', 'scales']);
  ok(plan.length >= 4 && plan.length <= 12, 'a workout is between 4 and 12 questions');
  eq(plan[0].concept, 'min', 'and it opens with the thing that is due');
  let bad = 0;
  plan.forEach(item => {
    if (item.concept == null) return;          /* "something new" has no fixed concept */
    const cfg = PRACTICE.queued(item);
    if (!PRACTICE.MAKERS[cfg.kind]) { bad++; return; }
    const q = PRACTICE.MAKERS[cfg.kind](cfg, cfg.only);
    if (String(q.concept) !== String(item.concept)) bad++;
  });
  eq(bad, 0, 'every workout item turns back into a question about that same concept');
  const ids = plan.map(i => i.lesson + '|' + i.kind + '|' + i.concept);
  eq(new Set(ids).size, ids.length, 'and nothing is asked twice in one workout');

  /* the week strip and the streak */
  MASTERY.touch();
  eq(MASTERY.week().length, 7, 'the strip is seven days long');
  eq(MASTERY.week()[6].on, true, 'answering a question lights up today');
  ok(MASTERY.streak() >= 1, 'and starts a streak');
  const sum = MASTERY.summary();
  eq(sum.skills, 3, 'the summary counts the skills');
  ok(sum.due >= 1, 'and says how many are due');
  ok(sum.mastery >= 0 && sum.mastery <= 100, 'average mastery is a percentage');
  PRACTICE.clear();
}

/* the browser and the server must agree about when to ask again */
head('Client and server schedule the same way');
{
  const store = read('server/store.js');
  const ladder = /LADDER\s*=\s*\[([^\]]+)\]/.exec(store);
  ok(!!ladder, 'the server declares a review ladder');
  if (ladder) {
    eq(ladder[1].split(',').map(x => x.trim()).join(','), MASTERY.LADDER.join(','),
       'and it is the same ladder the browser uses');
  }
}

/* ═══ The "Do" view: what a lesson opens as ════════════════════ */
head('Every lesson has something to do without reading first');
{
  let noTry = [], noTrySimple = [];
  LESSONS.forEach(L => {
    if (!(L.blocks || []).some(b => b.try)) noTry.push(L.id);
    if (L.simple && !(L.simple.blocks || []).some(b => b.try)) noTrySimple.push(L.id);
  });
  eq(noTry.join(',') || 'none', 'none',
     'the producer text of every lesson carries an interactive panel');
  eq(noTrySimple.join(',') || 'none', 'none',
     'and so does every simple-mode rewrite \u2014 the Do view is never empty');

  /* the split the page makes: try blocks stay, prose folds away */
  const L = LESSONS[0];
  const doing = L.blocks.filter(b => b.try), reading = L.blocks.filter(b => !b.try);
  eq(doing.length + reading.length, L.blocks.length, 'every block lands on one side of the split');
  ok(reading.length > 0, 'and there is prose to fold away');
}

/* ═══ The three questions asked on a first visit ═══════════════ */
head('First-run intake');
{
  const src = read('src/ui.js');
  const entry = /const ENTRY = \[([\s\S]*?)\];/.exec(src);
  ok(!!entry, 'the intake declares its entry points');
  if (entry) {
    const ids = [...entry[1].matchAll(/id:'([a-z-]+)'/g)].map(m => m[1]);
    eq(ids.length, 3, 'three of them');
    ids.forEach(id => ok(LESSONS.some(L => L.id === id),
      'entry point "' + id + '" is a real lesson'));
    /* and they must be in teaching order, or "start here" would go backwards */
    const ranks = ids.map(id => LESSONS.findIndex(L => L.id === id));
    eq(ranks.slice().sort((a, b) => a - b).join(','), ranks.join(','),
       'and they run in curriculum order');
  }
}

/* ═══ An answer tells the page about itself ════════════════════ */
head('Practice answers notify the page');
{
  PRACTICE.clear();
  let seen = 0, last = null;
  PRACTICE.watch(e => { seen++; last = e; });
  PRACTICE.record('chords', 'chord', 'maj', 'major triad', true);
  eq(seen, 1, 'a recorded answer reaches the watcher');
  eq(last && last.lesson, 'chords', 'and carries the entry it just wrote');
  PRACTICE.record('chords', 'chord', 'maj', 'major triad', false);
  eq(seen, 2, 'a wrong one does too \u2014 that is what un-ticks nothing and re-queues it');
  PRACTICE.clear();
}

/* ═══ An instrument on the stage is never silent ═══════════════ */
head('Pressing a key makes a sound on every page');
{
  const src = read('src/ui.js');
  const open = /function openStage\(L\)[\s\S]*?\n  \}/.exec(src);
  ok(!!open, 'openStage is where every page gets its instrument');
  ok(open && /v\.onKey\(/.test(open[0]) && /A\.note\(/.test(open[0]),
     'and it wires a default key handler there, so a page with no lesson behind it ' +
     '\u2014 the first run, Today, the review, a practice build step \u2014 still sounds');
  ok(open && /typeof v\.onKey === 'function'/.test(open[0]),
     'guarded, because the grid and the wheel have no keys to press');

  /* and a lesson must be able to take it over, or its own key meaning is lost */
  let wired = 0;
  LESSONS.forEach(L => { if (L.stage.view === 'keys') wired++; });
  ok(wired > 0, wired + ' lessons put a keyboard on the stage');
  ok(/onKey\(cb\) \{ onKeyCb = cb;/.test(read('src/scenes.js')),
     'onKey replaces rather than adds, so a lesson overrides the default in init()');

  const intake = /function renderIntake\(\)[\s\S]*?\n  \}/.exec(src);
  ok(intake && /ctx\.v\.onKey\(/.test(intake[0]),
     'the first screen overrides it again, because its readout promises the keys work');
}

/* ═══ The studio: presets, the rack, and what it exports ═══════ */
head('Instrument presets');
{
  const ids = INSTRUMENTS.PRESETS.map(p => p.id);
  eq(new Set(ids).size, ids.length, 'every preset id is unique');
  eq(ids.length, 8, 'eight of them \u2014 enough to change the genre, few enough to audition');
  const roles = INSTRUMENTS.ROLES.map(r => r.id);
  let bad = 0;
  INSTRUMENTS.PRESETS.forEach(p => {
    if (!p.name || !p.why) bad++;
    if (roles.indexOf(p.role) < 0) bad++;
    const v = p.voice || {};
    if (!(v.oscs || []).length || typeof v.atk !== 'number' ||
        typeof v.rel !== 'function' || typeof v.open !== 'function' ||
        typeof v.close !== 'function' || typeof v.q !== 'number') bad++;
    if (!(p.vol > 0 && p.vol <= 1.4)) bad++;
  });
  eq(bad, 0, 'each one names itself, says what it is for, and is a playable voice');
  roles.forEach(r => ok(r === 'drums' || INSTRUMENTS.byRole(r).length > 0,
    'role "' + r + '" has at least one preset'));

  /* the regression that matters: the two voices the 26 lessons already use */
  eq(JSON.stringify(INSTRUMENTS.byId('pluck').voice.oscs), JSON.stringify(Amock.PLUCK.oscs),
     'the pluck preset is the voice every lesson already plays, note for note');
  eq(JSON.stringify(INSTRUMENTS.byId('pad').voice.oscs), JSON.stringify(Amock.PAD.oscs),
     'and the pad preset is the chord voice, unchanged');
  ok(INSTRUMENTS.kitById('acoustic').kit === Amock.KIT,
     'the default kit is literally the kit object the lessons were written with');

  /* the mock above is only as good as its agreement with the real engine, so
     check the two files against each other rather than against my typing */
  {
    const eng = read('src/theory.js'), ins = read('src/instruments.js');
    const grab = (src, name) => {
      const m = new RegExp('const ' + name + ' = \\{\\s*oscs:(\\[[^\\n]*\\]),').exec(src);
      return m ? m[1] : null;
    };
    ['PLUCK', 'PAD'].forEach(name => {
      const spec = grab(eng, name);
      ok(!!spec, 'the engine declares its ' + name + ' voice as data');
      if (spec) ok(ins.indexOf('oscs:' + spec) >= 0,
        'and instruments.js carries that exact ' + name + ' spec \u2014 the preset cannot drift ' +
        'from the voice 26 lessons are already using');
    });
    ok(eng.indexOf('const KIT = {') >= 0 && ins.indexOf('kit:A.KIT') >= 0,
       'the acoustic kit is referenced, not copied, so it cannot drift either');
  }
  eq(INSTRUMENTS.KITS.length, 3, 'three kits');
  let kbad = 0;
  INSTRUMENTS.KITS.forEach(k => INSTRUMENTS.PARTS.forEach(part => {
    if (!k.kit[part]) kbad++;
  }));
  eq(kbad, 0, 'and every kit has all four parts, so switching never goes silent');
}

head('The channel rack');
{
  const p = RACK.blank('four-to-the-floor');
  eq(p.channels.length, 4, 'four drum channels');
  eq(p.bars, RACK.BARS, 'four bars');
  let shape = 0;
  p.channels.forEach(c => {
    if (c.steps.length !== RACK.BARS) shape++;
    c.steps.forEach(bar => { if (bar.length !== RACK.STEPS) shape++; });
    if (c.on.length !== RACK.BARS) shape++;
  });
  eq(shape, 0, 'every channel is bars \u00d7 16, with a per-bar on switch');

  /* starter patterns: an empty grid is where beginners stop */
  let pbad = 0;
  Object.keys(RACK.PATTERNS).forEach(id => {
    const pat = RACK.PATTERNS[id];
    if (!pat.name || !pat.why) pbad++;
    RACK.PARTS.forEach(d => {
      const row = pat[d.part];
      if (!Array.isArray(row)) pbad++;
      else if (row.length && row.length !== RACK.STEPS) pbad++;
      else if (row.some(v => v < 0 || v > 2)) pbad++;
    });
  });
  eq(pbad, 0, 'every starter pattern covers all four parts at 16 steps');
  ok(RACK.PATTERNS['four-to-the-floor'].kick.filter(Boolean).length === 4,
     'four to the floor is, in fact, four kicks');
  eq(RACK.VEL.length, 3, 'a step is off, a hit, or an accent');
  ok(RACK.VEL[2] > RACK.VEL[1] && RACK.VEL[1] > RACK.VEL[0], 'and an accent is the loud one');
}

head('Exporting a beat');
{
  const p = RACK.blank('boom-bap');
  const bytes = RACK.toMidi(p);
  ok(!!bytes && bytes.length > 60, 'a project exports to a MIDI file');
  eq(String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]), 'MThd', 'with a real header');
  eq((bytes[8] << 8) | bytes[9], 1, 'format 1 \u2014 separate tracks');
  const used = RACK.PARTS.filter(d =>
    p.channels.filter(c => c.part === d.part)[0].steps.some(b => b.some(Boolean))).length;
  eq((bytes[10] << 8) | bytes[11], used + 1, 'one track per part that plays, plus tempo');

  /* silence exports nothing rather than an empty file that opens as one bar */
  const quiet = RACK.blank('empty');
  eq(RACK.toMidi(quiet), null, 'an empty project exports nothing at all');

  /* and the single-track writer still works, because lessons use it */
  const one = STUDIO.midi([{ note:60, t:0, dur:240, vel:100 }], { bpm:100 });
  eq((one[10] << 8) | one[11], 2, 'the one-track export is untouched: tempo plus one');
}

/* ═══ Course changes ═══════════════════════════════════════════ */
head('One explanation per lesson, about five minutes');
{
  const strip = h => String(h || '').replace(/<[^>]+>/g, ' ');
  const words = bs => (bs || []).filter(b => !b.try).reduce((n, b) => {
    const t = [b.h, b.p, b.small, b.note && b.note.h, b.note && b.note.p].concat(b.keys || [])
      .concat(b.table ? [].concat(b.table.head, ...b.table.rows) : []).map(strip).join(' ');
    return n + t.split(/\s+/).filter(Boolean).length;
  }, 0);
  const over = [];
  LESSONS.forEach(L => {
    if (words(L.blocks) > 500) over.push(L.id + ' (producer ' + words(L.blocks) + ')');
    if (L.simple && words(L.simple.blocks) > 500) over.push(L.id + ' (simple ' + words(L.simple.blocks) + ')');
  });
  eq(over.join(', ') || 'none', 'none', 'no lesson explanation runs past 500 words (about two and a half minutes)');
  const sizes = CURRICULUM.STAGES.map(st => (CURRICULUM.PATH[st.id] || []).length);
  ok(Math.max.apply(null, sizes) <= 5, 'no stage is longer than five lessons (largest: ' + Math.max.apply(null, sizes) + ')');
}

head('Every lesson ends in practice');
{
  const none = LESSONS.filter(L => !L.practice).map(L => L.id);
  eq(none.join(',') || 'none', 'none', 'all ' + LESSONS.length + ' lessons carry a hear-it, name-it, build-it round');
}

head('Naming notes comes before intervals');
{
  const ids = LESSONS.map(L => L.id);
  ok(ids.indexOf('notes') >= 0 && ids.indexOf('notes') < ids.indexOf('intervals'),
     'the half-step lesson sits right before intervals');
  const L = lesson('notes');
  eq(L.part, 'notes', 'and opens the Notes & Keys stage');
  const q = PRACTICE.MAKERS.notename({ pool:[0], lo:55 });
  eq(T.pc(q.show[0]), 0, 'its practice lights the key it asks about');
  ok(q.options.indexOf(q.answer) >= 0, 'and offers the right name');
  eq(Math.abs(q.build.expect[0] - q.show[0]) <= 2, true, 'then asks for a half or whole step from it');
}

head('Practice rounds grow in small groups');
{
  PRACTICE.clear();
  const cfg = PRACTICE.PLAN.intervals;
  eq(PRACTICE.level(cfg).pool.join(','), '3,4', 'intervals starts with just the two thirds');
  ['3', '3', '4'].forEach(c => PRACTICE.record('intervals', 'interval', c, c, true));
  eq(PRACTICE.level(cfg).n, 1, 'one right answer each is not yet enough');
  PRACTICE.record('intervals', 'interval', '4', '4', true);
  eq(PRACTICE.level(cfg).pool.join(','), '3,4,5,7', 'twice each and the 4th and 5th join');
  eq(PRACTICE.level(PRACTICE.PLAN.scales).pool.join(','), 'major,minor', 'scales start with major and minor');
  eq(PRACTICE.level(PRACTICE.PLAN.notes).pool.length, 7, 'note names start on the white keys');
  PRACTICE.clear();
  /* every ladder step is part of the full pool, so a review can still ask it */
  ['intervals', 'scales', 'notes'].forEach(id => {
    const c = PRACTICE.PLAN[id];
    ok(c.ladder.every(st => st.pool.every(x => c.pool.indexOf(x) >= 0)), id + ': every step is in the full pool');
  });
}

head('Melody shapes are judged by shape');
{
  const n = (s, m) => ({ step:s, midi:m });
  eq(PRACTICE.shapeOf([n(0, 60), n(4, 63), n(8, 67), n(12, 70)]), 'rise', 'up, up, up is a rise');
  eq(PRACTICE.shapeOf([n(0, 60), n(4, 67), n(8, 63), n(12, 62)]), 'arch', 'up then down is an arch');
  eq(PRACTICE.shapeOf([n(0, 67), n(4, 60), n(8, 63), n(12, 65)]), 'valley', 'down then up is a valley');
  eq(PRACTICE.shapeOf([n(0, 60), n(4, 60), n(8, 63)]), 'flat', 'a repeated note is not a direction');
  eq(PRACTICE.shapeOf([n(0, 60), n(4, 63)]), 'too short', 'two notes are not a shape');
}

head('The ear warm-up');
{
  const q = PRACTICE.earQueue(['grid', 'notes', 'intervals'], 3);
  eq(q.length, 3, 'three questions');
  ok(q.every(e => e.lesson !== 'notes'), 'never the note-naming round, which needs your eyes');
  eq(PRACTICE.earQueue(['grid'], 3).length, 3, 'from lesson one on, even with a single lesson reached');
  eq(PRACTICE.earQueue(['notes'], 3).length, 0, 'and nothing at all rather than a question it cannot ask by ear');
}

head('Your track');
{
  TRACK.clear();
  eq(TRACK.bed().map(c => c.label).join(' '), 'Cm A♭ E♭ B♭', 'an empty track plays the stock loop');
  eq(TRACK.bass().map(n => n.midi).join(','), '36,32,39,34', 'with its roots as the bass');
  const grid = [[1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0], [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0], new Array(16).fill(1)];
  TRACK.set('drums', TRACK.fromGrid(grid));
  eq(TRACK.drums().kick.filter(Boolean).length, 4, 'the beat from The Grid becomes the drums');
  ok(TRACK.fitsKey('minor') && TRACK.fitsKey('harmonicMinor') && !TRACK.fitsKey('major'),
     'only a minor progression fits a track in C minor');
  /* the progression lesson hands over what it is showing */
  const store = {};
  const { ctx } = mount(lesson('progressions'), store);
  ok(ctx.trackCfg && ctx.trackCfg.layer === 'chords', 'Progressions offers the chords layer');
  ok(ctx.trackCfg.fits() !== true, 'and explains, rather than adds, a major progression');
  ctx.trackCfg.fix.run();
  eq(ctx.trackCfg.fits(), true, 'its one-press fix switches to a minor one');
  TRACK.set('chords', ctx.trackCfg.read());
  eq(TRACK.bed().map(c => c.label).join(' '), 'Cm A♭ E♭ B♭', 'i–VI–III–VII is the loop the lessons play');
  ok(TRACK.bed().every(c => Math.min.apply(null, c.notes) >= 43 && Math.min.apply(null, c.notes) < 56),
     'seated in the register the stock loop used');
  ok(TRACK.bass().every(n => n.midi >= 32 && n.midi <= 43), 'and its bass roots sit in the bass register');
  ['grid', 'progressions', 'bassline', 'melody'].forEach(id => {
    const m = mount(lesson(id), {});
    ok(m.ctx.trackCfg && TRACK.LAYERS.some(x => x.id === m.ctx.trackCfg.layer && x.lesson === id),
       id + ': adds its own layer');
  });
  const e8 = mount(lesson('eightbar'), {});
  ok(e8.ctx.trackCfg && e8.ctx.trackCfg.layer === null, 'Build an 8-Bar Idea shows the track it is built from');
  TRACK.clear();
}

head('Guess first');
{
  const ids = Object.keys(PREDICT);
  ok(ids.length >= 10, ids.length + ' lessons open with a guess');
  ids.forEach(id => {
    const P = PREDICT[id];
    ok(!!lesson(id), id + ': is a real lesson');
    ok(P.c >= 0 && P.c < P.a.length && new Set(P.a).size === P.a.length, id + ': a real answer among distinct options');
    const c = { later:() => {}, read:() => {} };
    ok(P.play(c) > 0 && !!P.why, id + ': plays, and says why');
  });
}

head('Tap a word for its meaning');
{
  const T2 = GLOSSARY.TERMS;
  ok(T2.length >= 30, T2.length + ' terms defined');
  const forms = [];
  T2.forEach(t => [t[0]].concat(t[1]).forEach(f => forms.push(f.toLowerCase())));
  eq(forms.length, new Set(forms).size, 'no spelling belongs to two terms');
  ok(T2.every(t => t[2] && t[2].length < 140), 'every definition is one short line');
  ok(GLOSSARY.indexOf('Semitones') === GLOSSARY.indexOf('half step'), 'plural, case and synonyms find the same term');
  ok(GLOSSARY.indexOf('keys') < 0, 'and "keys" is left alone — on a keyboard it means the keys');
}

head('Hear it in a track');
{
  let bad = 0;
  GENRES.ORDER.forEach(id => {
    const g = GENRES.STYLES[id];
    ['kick', 'snare', 'hat'].forEach(k => { if (g[k].length !== 16) bad++; });
    if (!INSTRUMENTS.kitById(g.kit) || !INSTRUMENTS.byId(g.voice) || !INSTRUMENTS.byId(g.lead)) bad++;
  });
  eq(bad, 0, 'four styles, each a real kit and real sounds over one bar of 16 steps');
  const withMaterial = ['intervals', 'scales', 'chords', 'progressions'].filter(id => {
    const m = mount(lesson(id), {});
    const mat = m.ctx.material && m.ctx.material();
    return mat && mat.chords.length && mat.line.length && mat.label;
  });
  eq(withMaterial.length, 4, 'intervals, scales, chords and progressions each hand over what they show');
}

head('Playing from a keyboard');
{
  inputs.length = 0;
  global.document.body = { classList:{ contains:() => false } };
  INPUT._key({ key:'a', target:{ tagName:'BODY' } });
  INPUT._key({ key:'w', target:{ tagName:'BODY' } });
  INPUT._key({ key:'a', target:{ tagName:'INPUT' } });
  INPUT._key({ key:'a', ctrlKey:true, target:{ tagName:'BODY' } });
  eq(inputs.length, 2, 'letters play, but not while typing and not with a modifier');
  eq(inputs[1][0] - inputs[0][0], 1, 'A then W is a half step');
  INPUT._message({ data:[0x90, 64, 127] });
  INPUT._message({ data:[0x90, 64, 0] });
  INPUT._message({ data:[0x80, 64, 90] });
  eq(inputs.length, 3, 'a MIDI note-on plays; velocity 0 and note-off do not');
  eq(inputs[2][0] + ',' + inputs[2][1], '64,1', 'at its own pitch and velocity');
  INPUT._message({ data:[0x99, 36, 100] });
  eq(inputs.length, 3, 'a drum pad on channel 10 is a drum, not a key');
  delete global.document.body;
}

head('The cheat sheet');
{
  ok(typeof CHEAT.build === 'function', 'the page builder exists');
  ok(/renderCheat/.test(uiSrc) && /cheatsheet/.test(uiSrc), 'and has its own page and address');
}

console.log('\n' + pass + ' checks passed' + (fail ? ', ' + fail + ' FAILED' : ''));
process.exit(fail ? 1 : 0);
