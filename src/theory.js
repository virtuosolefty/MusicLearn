/* ═══════════════════════════════════════════════════════════════
   THEORY — the music maths everything else reads from.
   Pitch is always a MIDI number. Middle C = 60.
   ═══════════════════════════════════════════════════════════════ */
const T = (() => {
  const SHARP = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  const FLAT  = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];
  const PRETTY = s => s.replace('#','♯').replace('b','♭');

  const pc = m => ((m % 12) + 12) % 12;
  const oct = m => Math.floor(m / 12) - 1;
  const name = (m, flats) => PRETTY((flats ? FLAT : SHARP)[pc(m)]);
  const fullName = (m, flats) => name(m, flats) + oct(m);
  const freq = m => 440 * Math.pow(2, (m - 69) / 12);
  const isBlack = m => [1,3,6,8,10].includes(pc(m));

  /* Scales — semitones above the root. */
  /* `deg` is the letter distance of each note from the root: 0 = same letter,
     1 = the next letter up, and so on. It is what makes correct spelling
     possible — C minor is C E♭ G, never C D♯ G, because the third of a chord
     is always two letters above its root. */
  const SCALES = {
    major:          { label:'Major (Ionian)',   steps:[0,2,4,5,7,9,11], deg:[0,1,2,3,4,5,6], mood:'bright, resolved, pop' },
    dorian:         { label:'Dorian',           steps:[0,2,3,5,7,9,10], deg:[0,1,2,3,4,5,6], mood:'minor but hopeful, jazzy' },
    phrygian:       { label:'Phrygian',         steps:[0,1,3,5,7,8,10], deg:[0,1,2,3,4,5,6], mood:'dark, Spanish, trap' },
    lydian:         { label:'Lydian',           steps:[0,2,4,6,7,9,11], deg:[0,1,2,3,4,5,6], mood:'dreamy, floating' },
    mixolydian:     { label:'Mixolydian',       steps:[0,2,4,5,7,9,10], deg:[0,1,2,3,4,5,6], mood:'bluesy, funk, rock' },
    minor:          { label:'Natural minor (Aeolian)', steps:[0,2,3,5,7,8,10], deg:[0,1,2,3,4,5,6], mood:'sad, serious, most rap' },
    locrian:        { label:'Locrian',          steps:[0,1,3,5,6,8,10], deg:[0,1,2,3,4,5,6], mood:'unstable, rarely a home key' },
    harmonicMinor:  { label:'Harmonic minor',   steps:[0,2,3,5,7,8,11], deg:[0,1,2,3,4,5,6], mood:'cinematic, ominous, exotic' },
    melodicMinor:   { label:'Melodic minor',    steps:[0,2,3,5,7,9,11], deg:[0,1,2,3,4,5,6], mood:'smooth minor, jazz' },
    phrygianDom:    { label:'Phrygian dominant',steps:[0,1,4,5,7,8,10], deg:[0,1,2,3,4,5,6], mood:'Egyptian, dark drill' },
    majorPent:      { label:'Major pentatonic', steps:[0,2,4,7,9], deg:[0,1,2,4,5],      mood:'safe, singable' },
    minorPent:      { label:'Minor pentatonic', steps:[0,3,5,7,10], deg:[0,2,3,4,6],     mood:'riffs, hooks, blues' },
    blues:          { label:'Blues',            steps:[0,3,5,6,7,10], deg:[0,2,3,4,4,6],   mood:'gritty, vocal' },
    chromatic:      { label:'Chromatic',        steps:[0,1,2,3,4,5,6,7,8,9,10,11], deg:[0,0,1,1,2,3,3,4,4,5,5,6], mood:'every note' }
  };
  const MODE_ORDER = ['lydian','major','mixolydian','dorian','minor','phrygian','locrian'];

  /* Chords — semitones above the root. */
  const CHORDS = {
    maj:    { label:'major',            sym:'',        steps:[0,4,7], deg:[0,2,4] },
    min:    { label:'minor',            sym:'m',       steps:[0,3,7], deg:[0,2,4] },
    dim:    { label:'diminished',        sym:'dim',     steps:[0,3,6], deg:[0,2,4] },
    aug:    { label:'augmented',         sym:'aug',     steps:[0,4,8], deg:[0,2,4] },
    sus2:   { label:'suspended 2nd',     sym:'sus2',    steps:[0,2,7], deg:[0,1,4] },
    sus4:   { label:'suspended 4th',     sym:'sus4',    steps:[0,5,7], deg:[0,3,4] },
    maj7:   { label:'major 7th',         sym:'maj7',    steps:[0,4,7,11], deg:[0,2,4,6] },
    min7:   { label:'minor 7th',         sym:'m7',      steps:[0,3,7,10], deg:[0,2,4,6] },
    dom7:   { label:'dominant 7th',      sym:'7',       steps:[0,4,7,10], deg:[0,2,4,6] },
    m7b5:   { label:'half-diminished',   sym:'m7♭5', steps:[0,3,6,10], deg:[0,2,4,6] },
    dim7:   { label:'diminished 7th',    sym:'dim7',    steps:[0,3,6,9], deg:[0,2,4,6] },
    minMaj7:{ label:'minor major 7th',   sym:'m(maj7)', steps:[0,3,7,11], deg:[0,2,4,6] },
    aug7:   { label:'augmented 7th',     sym:'7♯5', steps:[0,4,8,10], deg:[0,2,4,6] },
    augMaj7:{ label:'augmented major 7th', sym:'maj7♯5', steps:[0,4,8,11], deg:[0,2,4,6] },
    add9:   { label:'added 9th',         sym:'add9',    steps:[0,4,7,14], deg:[0,2,4,8] },
    maj9:   { label:'major 9th',         sym:'maj9',    steps:[0,4,7,11,14], deg:[0,2,4,6,8] },
    min9:   { label:'minor 9th',         sym:'m9',      steps:[0,3,7,10,14], deg:[0,2,4,6,8] },
    dom9:   { label:'dominant 9th',      sym:'9',       steps:[0,4,7,10,14], deg:[0,2,4,6,8] },
    min11:  { label:'minor 11th',        sym:'m11',     steps:[0,3,7,10,14,17], deg:[0,2,4,6,8,10] },
    maj13:  { label:'major 13th',        sym:'maj13',   steps:[0,4,7,11,14,21], deg:[0,2,4,6,8,12] },
    min6:   { label:'minor 6th',         sym:'m6',      steps:[0,3,7,9], deg:[0,2,4,5] },
    maj6:   { label:'major 6th',         sym:'6',       steps:[0,4,7,9], deg:[0,2,4,5] },
    six9:   { label:'six / nine',        sym:'6/9',     steps:[0,4,7,9,14], deg:[0,2,4,5,8] }
  };

  /* Intervals, 0–12 semitones, then the compound ones. */
  const IVL = [
    { n:0,  short:'P1',  label:'unison',          feel:'the same note', deg:0 },
    { n:1,  short:'m2',  label:'minor 2nd',       feel:'tense, horror-film', deg:1 },
    { n:2,  short:'M2',  label:'major 2nd',       feel:'a step, neutral', deg:1 },
    { n:3,  short:'m3',  label:'minor 3rd',       feel:'sad', deg:2 },
    { n:4,  short:'M3',  label:'major 3rd',       feel:'happy', deg:2 },
    { n:5,  short:'P4',  label:'perfect 4th',     feel:'open, heroic', deg:3 },
    { n:6,  short:'TT',  label:'tritone',         feel:'unstable, wants to move', deg:3 },
    { n:7,  short:'P5',  label:'perfect 5th',     feel:'strong, hollow, powerful', deg:4 },
    { n:8,  short:'m6',  label:'minor 6th',       feel:'longing', deg:5 },
    { n:9,  short:'M6',  label:'major 6th',       feel:'warm, sweet', deg:5 },
    { n:10, short:'m7',  label:'minor 7th',       feel:'smooth, soulful', deg:6 },
    { n:11, short:'M7',  label:'major 7th',       feel:'dreamy, sharp-edged', deg:6 },
    { n:12, short:'P8',  label:'octave',          feel:'the same note, higher', deg:7 },
    { n:13, short:'m9',  label:'minor 9th',       feel:'crunchy', deg:8 },
    { n:14, short:'M9',  label:'major 9th',       feel:'colourful, floaty', deg:8 },
    { n:15, short:'m10', label:'minor 10th',      feel:'a wide sad third', deg:9 },
    { n:16, short:'M10', label:'major 10th',      feel:'a wide happy third', deg:9 },
    { n:17, short:'P11', label:'11th',            feel:'washy, suspended', deg:10 },
    { n:21, short:'M13', label:'13th',            feel:'jazzy, plush', deg:12 }
  ];
  const ivl = n => IVL.find(i => i.n === n) || { n, short:n+'st', label:n+' semitones', feel:'', deg:(n % 12) };
  /* the note `semis` above rootName, spelled the way that interval is written */
  const spellIvl = (rootName, semis) => {
    const I = ivl(semis);
    return spellNote(rootName, (I.deg == null ? 0 : I.deg) % 7, semis);
  };

  const scaleNotes = (rootMidi, type) => SCALES[type].steps.map(s => rootMidi + s);
  const chordNotes = (rootMidi, type) => CHORDS[type].steps.map(s => rootMidi + s);

  /* Which triad sits on each degree of a 7-note scale. */
  const qualityOf = (a, b, c) => {
    const i1 = ((b - a) % 12 + 12) % 12, i2 = ((c - b) % 12 + 12) % 12;
    if (i1 === 4 && i2 === 3) return 'maj';
    if (i1 === 3 && i2 === 4) return 'min';
    if (i1 === 3 && i2 === 3) return 'dim';
    if (i1 === 4 && i2 === 4) return 'aug';
    if (i1 === 5 && i2 === 2) return 'sus4';
    return 'maj';
  };
  const diatonic = (rootMidi, type) => {
    const st = SCALES[type].steps, N = st.length, out = [];
    for (let d = 0; d < N; d++) {
      const g = i => rootMidi + st[(d + i) % N] + 12 * Math.floor((d + i) / N);
      const a = g(0), b = g(2), c = g(4), s = g(6);
      const q = qualityOf(a, b, c);
      const sev = ((s - a) % 12 + 12) % 12;
      /* the triad decides the letter of the numeral, the seventh decides the
         rest of the name — an augmented triad carries a major 7th in both
         harmonic and melodic minor, which is a different chord from aug7 */
      let q7 = q === 'maj' ? (sev === 11 ? 'maj7' : 'dom7')
             : q === 'min' ? (sev === 10 ? 'min7' : 'minMaj7')
             : q === 'dim' ? (sev === 10 ? 'm7b5' : 'dim7')
             : q === 'aug' ? (sev === 10 ? 'aug7' : 'augMaj7')
             : 'dom7';
      out.push({ degree:d + 1, root:a, notes:[a,b,c], seventh:[a,b,c,s], quality:q, q7 });
    }
    return out;
  };
  const ROMAN  = ['I','II','III','IV','V','VI','VII'];
  const roman = (d, q) => {
    const r = ROMAN[d - 1];
    if (q === 'min' || q === 'min7' || q === 'minMaj7') return r.toLowerCase();
    if (q === 'dim' || q === 'm7b5' || q === 'dim7') return r.toLowerCase() + '°';
    if (q === 'aug' || q === 'aug7' || q === 'augMaj7') return r + '+';
    return r;
  };
  const chordLabel = (rootMidi, type, flats) => name(rootMidi, flats) + (CHORDS[type] ? CHORDS[type].sym : '');

  /* ── Spelling ───────────────────────────────────────────────────
     A note's name is a letter plus an accidental, and the letter comes
     from the interval's *degree*, not from its semitone count. These
     helpers spell notes inside a chord or a key so that displayed names
     match what a musician would write.                               */
  const LETTERS = ['C','D','E','F','G','A','B'];
  const LETTER_PC = { C:0, D:2, E:4, F:5, G:7, A:9, B:11 };
  const ACC = { '':0, '\u266F':1, '\u266F\u266F':2, '\u266D':-1, '\u266D\u266D':-2, '#':1, 'b':-1 };
  const ACC_NAME = { '-2':'\u266D\u266D', '-1':'\u266D', '0':'', '1':'\u266F', '2':'\u266F\u266F' };

  const nameToPc = n => {
    const l = n[0].toUpperCase(), a = ACC[n.slice(1)] || 0;
    return pc(LETTER_PC[l] + a);
  };
  /* Spell the note `semis` semitones above `rootName`, `letterStep` letters up. */
  function spellNote(rootName, letterStep, semis) {
    const rl = rootName[0].toUpperCase();
    const rootPc = nameToPc(rootName);
    const tl = LETTERS[(LETTERS.indexOf(rl) + letterStep) % 7];
    let acc = pc(rootPc + semis) - LETTER_PC[tl];
    acc = ((acc + 18) % 12) - 6;               // fold into -6..+5
    if (acc < -2 || acc > 2) return name(rootPc + semis, acc < 0); // give up gracefully
    return tl + ACC_NAME[String(acc)];
  }
  const spellChord = (rootName, type) => {
    const c = CHORDS[type]; if (!c) return [];
    const deg = c.deg || c.steps.map((_, i) => i * 2);
    return c.steps.map((st, i) => spellNote(rootName, deg[i] % 7, st));
  };
  const spellScale = (rootName, type) => {
    const sc = SCALES[type]; if (!sc) return [];
    const deg = sc.deg || sc.steps.map((_, i) => i);
    return sc.steps.map((st, i) => spellNote(rootName, deg[i] % 7, st));
  };
  const chordName = (rootName, type) => rootName + (CHORDS[type] ? CHORDS[type].sym : '');

  /* pitch class → spelled name, for one key. Notes outside the key fall back
     to the accidental the key signature already prefers. */
  const _mapCache = {};
  function keyMap(rootName, type) {
    const k = rootName + '|' + type;
    if (_mapCache[k]) return _mapCache[k];
    const names = spellScale(rootName, type), sc = SCALES[type];
    const out = { flats:false };
    sc.steps.forEach((st, i) => { out[pc(nameToPc(rootName) + st)] = names[i]; });
    out.flats = names.some(n => n.indexOf('\u266D') >= 0);
    _mapCache[k] = out;
    return out;
  }
  /* Name one MIDI note as it would be written in this key. */
  const inKey = (midi, rootName, type) => {
    const m = keyMap(rootName || 'C', type || 'major');
    return m[pc(midi)] || name(midi, m.flats);
  };
  /* Conventional key names, so we always spell from a real key root. */
  const MAJ_ROOT = ['C','D\u266D','D','E\u266D','E','F','F\u266F','G','A\u266D','A','B\u266D','B'];
  const MIN_ROOT = ['C','C\u266F','D','E\u266D','E','F','F\u266F','G','G\u266F','A','B\u266D','B'];
  const rootName = (midiOrPc, minorish) =>
    (minorish ? MIN_ROOT : MAJ_ROOT)[pc(midiOrPc)];
  const MINOR_TYPES = ['minor','harmonicMinor','melodicMinor','minorPent','dorian','phrygian','locrian','blues','phrygianDom'];
  const rootFor = (midiOrPc, type) => rootName(midiOrPc, MINOR_TYPES.indexOf(type) >= 0);

  /* Circle of fifths, clockwise from C. */
  const CIRCLE = [0,7,2,9,4,11,6,1,8,3,10,5];
  const KEY_LABEL = ['C','G','D','A','E','B','F♯','D♭','A♭','E♭','B♭','F'];
  const MINOR_LABEL = ['Am','Em','Bm','F♯m','C♯m','G♯m','D♯m','B♭m','Fm','Cm','Gm','Dm'];
  const SIGNATURE = ['no sharps or flats','1♯','2♯','3♯','4♯','5♯','6♯','5♭','4♭','3♭','2♭','1♭'];

  const invert = (notes, n) => {
    const a = notes.slice();
    for (let i = 0; i < n; i++) a.push(a.shift() + 12);
    return a;
  };

  return { SHARP, FLAT, PRETTY, pc, oct, name, fullName, freq, isBlack,
           LETTERS, nameToPc, spellNote, spellChord, spellScale, chordName,
           keyMap, inKey, rootName, rootFor, MAJ_ROOT, MIN_ROOT, spellIvl,
           SCALES, MODE_ORDER, CHORDS, IVL, ivl, scaleNotes, chordNotes,
           diatonic, roman, ROMAN, chordLabel, CIRCLE, KEY_LABEL, MINOR_LABEL,
           SIGNATURE, invert, qualityOf };
})();

/* ═══════════════════════════════════════════════════════════════
   AUDIO — one small synth, a click track and a look-ahead clock.
   Nothing starts until the first tap, per browser autoplay rules.
   ═══════════════════════════════════════════════════════════════ */
const A = (() => {
  let ctx = null, master = null, verb = null, verbGain = null, ready = false;

  function impulse(seconds, decay) {
    const rate = ctx.sampleRate, len = Math.floor(rate * seconds);
    const buf = ctx.createBuffer(2, len, rate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return buf;
  }
  function init() {
    if (ready) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0.22; master.connect(ctx.destination);
    verb = ctx.createConvolver(); verb.buffer = impulse(1.8, 3.2);
    verbGain = ctx.createGain(); verbGain.gain.value = 0.3;
    verb.connect(verbGain); verbGain.connect(master);
    ready = true;
    return ctx;
  }
  const resume = () => { init(); if (ctx && ctx.state === 'suspended') ctx.resume(); return ctx; };
  const now = () => (ctx ? ctx.currentTime : 0);

  /* One plucked / held synth voice. */
  function note(midi, dur = 0.6, opt = {}) {
    if (!resume()) return;
    const t0 = opt.when != null ? opt.when : ctx.currentTime + 0.01;
    const f = T.freq(midi), g = ctx.createGain(), lp = ctx.createBiquadFilter();
    const vol = (opt.gain != null ? opt.gain : 1) * 0.5;
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(Math.min(9000, f * 7 + 700), t0);
    lp.frequency.exponentialRampToValueAtTime(Math.max(400, f * 2.2), t0 + dur * 0.85);
    lp.Q.value = 0.9;
    const oscs = [];
    const spec = opt.pad
      ? [['sawtooth', 0.30, 0], ['sawtooth', 0.22, 7], ['triangle', 0.34, -1200]]
      : [['triangle', 0.55, 0], ['sine', 0.34, -1200], ['sawtooth', 0.12, 4]];
    spec.forEach(([type, amp, det]) => {
      const o = ctx.createOscillator(), og = ctx.createGain();
      o.type = type; o.frequency.value = f; o.detune.value = det;
      og.gain.value = amp; o.connect(og); og.connect(lp);
      o.start(t0); o.stop(t0 + dur + 0.6); oscs.push(o);
    });
    const atk = opt.pad ? 0.09 : 0.012, rel = opt.pad ? 0.55 : Math.min(0.5, dur * 0.7);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + atk);
    g.gain.exponentialRampToValueAtTime(vol * 0.62, t0 + atk + 0.14);
    g.gain.setTargetAtTime(0.0001, t0 + dur, rel / 3.2);
    lp.connect(g); g.connect(master);
    const s = ctx.createGain(); s.gain.value = opt.wet != null ? opt.wet : 0.5;
    g.connect(s); s.connect(verb);
  }
  function chord(midis, dur, opt) {
    dur = dur == null ? 1.5 : dur; opt = opt || {};
    if (!resume()) return;
    const t0 = opt.when != null ? opt.when : ctx.currentTime + 0.02;
    midis.forEach((m, i) => note(m, dur, Object.assign({ pad:true, gain:0.75 }, opt,
      { when: t0 + (opt.spread ? i * opt.spread : 0) })));
  }

  /* Percussive click for the metronome / grid. */
  function click(kind = 'weak', when) {
    if (!resume()) return;
    const t0 = when != null ? when : ctx.currentTime + 0.01;
    if (kind === 'kick') {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.setValueAtTime(155, t0);
      o.frequency.exponentialRampToValueAtTime(48, t0 + 0.11);
      g.gain.setValueAtTime(0.9, t0); g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.25);
      o.connect(g); g.connect(master); o.start(t0); o.stop(t0 + 0.3); return;
    }
    if (kind === 'snare' || kind === 'hat') {
      const len = kind === 'snare' ? 0.16 : 0.045;
      const b = ctx.createBuffer(1, Math.floor(ctx.sampleRate * len), ctx.sampleRate);
      const d = b.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, kind === 'snare' ? 2 : 1.2);
      const s = ctx.createBufferSource(); s.buffer = b;
      const hp = ctx.createBiquadFilter(); hp.type = 'highpass';
      hp.frequency.value = kind === 'snare' ? 1400 : 7000;
      const g = ctx.createGain(); g.gain.value = kind === 'snare' ? 0.5 : 0.22;
      s.connect(hp); hp.connect(g); g.connect(master); s.start(t0); return;
    }
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'square';
    o.frequency.value = kind === 'strong' ? 1500 : kind === 'mid' ? 1100 : 820;
    const v = kind === 'strong' ? 0.3 : kind === 'mid' ? 0.19 : 0.11;
    g.gain.setValueAtTime(v, t0); g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.05);
    o.connect(g); g.connect(master); o.start(t0); o.stop(t0 + 0.06);
  }

  /* Look-ahead step clock: calls cb(stepIndex, audioTime) just before each step. */
  function transport() {
    let timer = null, step = 0, next = 0, bpm = 96, div = 4, steps = 16, cb = null;
    const stop = () => { if (timer) clearInterval(timer); timer = null; };
    return {
      get playing() { return !!timer; },
      get step() { return step; },
      set bpm(v) { bpm = v; },
      start(o) {
        resume(); if (!ctx) return;
        bpm = o.bpm || bpm; div = o.div || div; steps = o.steps || steps; cb = o.cb;
        step = 0; next = ctx.currentTime + 0.08; stop();
        timer = setInterval(() => {
          const spb = 60 / bpm, dt = spb * 4 / div;
          while (next < ctx.currentTime + 0.12) {
            if (cb) cb(step, next, dt);
            next += dt; step = (step + 1) % steps;
          }
        }, 25);
      },
      stop() { stop(); step = 0; }
    };
  }
  return { init, resume, now, note, chord, click, transport,
           get ctx() { return ctx; },
           get on() { return ready && ctx && ctx.state === 'running'; } };
})();
