/* ═══════════════════════════════════════════════════════════════
   LESSONS — Level 2 · Harmony with the lid off
   ═══════════════════════════════════════════════════════════════ */

LESSONS.push({
  id:'adv-intervals', level:2, tag:'Pitch', title:'Advanced Intervals',
  hint:'Past the octave, and upside down',
  lede:'Everything above 12 semitones is just an interval you already know, wearing a bigger number. Learn the two rules and the jazz chord names stop being scary.',
  stage:{ view:'keys', cfg:{ lo:48, hi:72, labels:'names' } },
  blocks:[
    { h:'Compound intervals: add 7 to the number' },
    { p:'An interval wider than an octave is <b>compound</b>. Its name is the simple interval plus 7, because you’ve added a whole octave (which spans 8 letter names, and the two overlap by one). So a 2nd + octave = a <b>9th</b>. A 4th + octave = an <b>11th</b>. A 6th + octave = a <b>13th</b>.' },
    { table:{ head:['Semitones','Compound name','Same note as','Chord it colours'],
      rows:[
        ['13','minor 9th','minor 2nd','altered dominants — very crunchy'],
        ['14','major 9th','major 2nd','add9, 9, m9 — the “pretty” note'],
        ['15','minor 10th','minor 3rd','the minor 3rd, voiced wide'],
        ['17','perfect 11th','perfect 4th','m11, sus — washy'],
        ['18','sharp 11th','tritone','maj7♯11 — lydian, dreamy'],
        ['21','major 13th','major 6th','13 chords — plush, soul'] ] } },
    { p:'Why not just say “2nd”? Because <b>register changes the feel</b>. A major 2nd rubbing right next to the root is a clash; the same note an octave up is a shimmer on top of the chord. Same pitch class, different job.' },
    { h:'Interval inversion: the rule of 9' },
    { p:'Flip the two notes — move the lower one up an octave — and the interval becomes its <b>inversion</b>. The two numbers always add up to <b>9</b>, and the qualities swap: major ↔ minor, perfect stays perfect.' },
    { keys:[
      'A 3rd inverts to a 6th (3 + 6 = 9). Major 3rd → minor 6th.',
      'A 4th inverts to a 5th. Perfect stays perfect.',
      'A 2nd inverts to a 7th. Minor 2nd → major 7th.',
      'The tritone inverts to itself — 6 + 6 = 12. That symmetry is exactly why it’s so unstable.' ] },
    { p:'This is genuinely useful: it means you only have to learn six intervals by ear, because the other six are their mirrors. And when you voice a chord and it sounds muddy, inverting one interval is often the whole fix.' },
    { try:{ h:'Stretch it and flip it', p:'Play a simple interval, then push the top note up an octave and hear the same relationship turn into colour instead of clash.',
      build:ctx => [
        UI.chips([{label:'m2 / M7',value:1},{label:'M2 / m7',value:2},{label:'m3 / M6',value:3},
                  {label:'M3 / m6',value:4},{label:'P4 / P5',value:5},{label:'Tritone',value:6}],
          v => ctx.show(v), 2),
        UI.btn('Invert it', () => ctx.invert()),
        UI.btn('Add an octave (compound)', () => ctx.compound())
      ] } }
  ],
  quiz:[
    { q:'A major 9th is the same pitch as…', a:['A major 2nd an octave up','A minor 7th','A perfect 5th','A major 3rd an octave up'], c:0,
      why:'14 semitones = 2 + 12. Same pitch class as a major 2nd, but sitting an octave higher, where it sounds sweet instead of clashing.' },
    { q:'A perfect 4th inverts to…', a:['A perfect 4th','A perfect 5th','A major 6th','A minor 3rd'], c:1,
      why:'4 + 5 = 9. Perfect intervals stay perfect when inverted.' },
    { q:'Which interval is its own inversion?', a:['Major 3rd','Perfect 5th','Tritone','Major 7th'], c:2,
      why:'The tritone — 6 semitones up or 6 down lands in the same place. That symmetry is why it has no home and pulls so hard.' }
  ],
  init:ctx => {
    const base = 60; let n = 2, wide = false;
    const draw = () => {
      const hi = base + n + (wide ? 12 : 0);
      ctx.v.clear().mark(base, 'root').mark(Math.min(hi, 72), 'chord').apply().clearExtras();
      if (hi <= 72) ctx.v.arc(base, hi, T.ivl(n + (wide ? 12 : 0)).short);
      const I = T.ivl(n + (wide ? 12 : 0)), inv = T.ivl(12 - n);
      ctx.read(T.name(base) + ' → ' + T.name(hi) + (hi > 72 ? ' (above the keys)' : '') +
        '\n' + I.label + '  ·  ' + (n + (wide ? 12 : 0)) + ' semis' +
        '\ninverts to ' + inv.label + '\n' + I.feel);
      A.note(base, 1.6, { gain:.85 }); A.note(hi, 1.6, { gain:.85 });
    };
    ctx.show = v => { n = v; wide = false; draw(); };
    ctx.invert = () => { n = 12 - n; wide = false; draw(); };
    ctx.compound = () => { wide = !wide; draw(); };
    ctx.v.onKey(m => { A.note(m, 1); ctx.read(T.fullName(m)); });
    draw();
  }
});

LESSONS.push({
  id:'sevenths', level:2, tag:'Harmony', title:'Seventh Chords',
  hint:'One more note, ten times the mood',
  lede:'Triads state a fact. Seventh chords have an opinion. Adding one note to each chord is the fastest upgrade available to a beginner producer.',
  stage:{ view:'keys', cfg:{ lo:48, hi:72, labels:'names' } },
  blocks:[
    { h:'Keep stacking' },
    { p:'You built a triad by skipping scale notes: 1–3–5. Don’t stop — skip once more and you get the <b>7th</b>: 1–3–5–7. Which kind of 7th you land on depends on the scale, and that gives you five chords that cover nearly all of modern R&B, neo-soul, lo-fi and gospel.' },
    { table:{ head:['Chord','Semitones','Written','Feel'],
      rows:[
        ['Major 7th','0 4 7 11','Cmaj7','dreamy, warm, lo-fi'],
        ['Minor 7th','0 3 7 10','Cm7','smooth, soulful, safe'],
        ['Dominant 7th','0 4 7 10','C7','tense, bluesy, wants to move'],
        ['Half-diminished','0 3 6 10','Cm7♭5','anxious, transitional'],
        ['Diminished 7th','0 3 6 9','Cdim7','pure horror-film tension'],
        ['Minor major 7th','0 3 7 11','Cm(maj7)','spy-film, sinister beauty'] ] } },
    { h:'The one you must not confuse' },
    { p:'<span class="k">Cmaj7</span> and <span class="k">C7</span> are different chords. Cmaj7 has a <b>major</b> 7th (11 semitones — one semitone below the octave) and sounds gorgeous and still. C7 has a <b>minor</b> 7th (10 semitones) and sounds like it’s halfway out the door. “C7” always means dominant. If you want the pretty one, you must write “maj7”.' },
    { h:'Where they land in a key' },
    { p:'Run the stacking through a major scale and the seventh chords come out in a fixed order: <span class="k v">Imaj7 &nbsp; iim7 &nbsp; iiim7 &nbsp; IVmaj7 &nbsp; V7 &nbsp; vim7 &nbsp; viim7♭5</span>. Notice the <b>V7</b> — the only dominant 7th in the key. It’s the tension chord, and the m7♭5 on degree 7 is the anxious one.' },
    { p:'In natural minor: <span class="k v">im7 &nbsp; iim7♭5 &nbsp; IIImaj7 &nbsp; ivm7 &nbsp; vm7 &nbsp; VImaj7 &nbsp; VII7</span>. That <b>VII7</b> is the sound of a thousand drill loops.' },
    { note:{ h:'Producer move: swap every triad for its 7th',
      p:'Take a progression you already like and add the 7th to each chord. Nothing about the key or the roman numerals changes, but the loop suddenly sounds expensive. If it gets muddy, drop the 5th — in a 7th chord the 5th is the most disposable note.' } },
    { try:{ h:'Triad vs 7th, back to back', p:'Pick a quality and A/B it against the plain triad. The floating tiles name every stacked gap.',
      build:ctx => [
        UI.chips([{label:'maj7',value:'maj7'},{label:'m7',value:'min7'},{label:'7 (dominant)',value:'dom7'},
                  {label:'m7♭5',value:'m7b5'},{label:'dim7',value:'dim7'},{label:'m(maj7)',value:'minMaj7'}],
          v => ctx.show(v), 0),
        UI.btn('Hear the triad first', () => ctx.compare()),
        UI.btn('All seven of the key', () => ctx.key())
      ] } }
  ],
  quiz:[
    { q:'Cmaj7 contains which notes?', a:['C E G B♭','C E G B','C E♭ G B♭','C E G A'], c:1,
      why:'C E G B — 0 4 7 11. With a B♭ instead it would be C7, a dominant chord with a completely different job.' },
    { q:'In a major key, which degree carries the only dominant 7th chord?', a:['I','IV','V','vi'], c:2,
      why:'Degree 5. V7 is the key’s tension chord — the reason it resolves so hard is the tritone between its 3rd and 7th.' },
    { q:'Your 7th chords sound muddy in the low register. Best first fix?', a:['Remove the root','Remove the 5th','Remove the 7th','Remove the 3rd'], c:1,
      why:'Drop the 5th. The root, 3rd and 7th carry the chord’s identity; the 5th mostly adds weight you don’t need.' }
  ],
  init:ctx => {
    let type = 'maj7';
    const root = 55;
    const draw = () => {
      const ns = T.chordNotes(root, type);
      ctx.v.clear().marks(ns.filter(n => n <= 72), 'chord').mark(root, 'root').apply().clearExtras();
      ctx.v.stack(ns, { degrees:['root','3rd','5th','7th'] });
      ctx.v.tag(T.name(root) + T.CHORDS[type].sym, 0, 5.9);
      ctx.read(T.name(root) + T.CHORDS[type].sym + '  ·  ' + T.CHORDS[type].label +
        '\n' + ns.map(n => T.name(n)).join(' ') + '\n' + T.CHORDS[type].steps.join(' '));
      A.chord(ns, 2.4, { spread:.05 });
    };
    ctx.show = v => { type = v; draw(); };
    ctx.compare = () => {
      const tri = type === 'min7' || type === 'minMaj7' ? 'min' : type === 'dom7' || type === 'maj7' ? 'maj' : 'dim';
      A.chord(T.chordNotes(root, tri), 1.3, { spread:.05 });
      ctx.read('triad first…');
      ctx.later(draw, 1500);
    };
    ctx.key = () => {
      T.diatonic(48, 'major').forEach((c, i) => ctx.later(() => {
        ctx.v.clear().marks(c.seventh.filter(n => n <= 72), 'chord').mark(c.root, 'root').apply().clearExtras();
        ctx.v.tag(T.roman(c.degree, c.q7) + '   ' + T.name(c.root) + T.CHORDS[c.q7].sym, 0, 3.4);
        ctx.read(T.roman(c.degree, c.q7) + '  ·  ' + T.name(c.root) + T.CHORDS[c.q7].sym +
          '\n' + T.CHORDS[c.q7].label);
        A.chord(c.seventh, 1.1, { spread:.04 });
      }, i * 950));
    };
    ctx.v.onKey(m => { A.note(m, 1); ctx.read(T.fullName(m)); });
    draw();
  }
});

LESSONS.push({
  id:'extensions', level:2, tag:'Harmony', title:'Chord Extensions',
  hint:'9ths, 11ths, 13ths — the colour layer',
  lede:'Keep stacking past the 7th and you reach the notes that make a chord sound like a record instead of a lesson.',
  stage:{ view:'keys', cfg:{ lo:48, hi:72, labels:'names', flats:true } },
  blocks:[
    { h:'The stack keeps going' },
    { p:'1 → 3 → 5 → 7 → <b>9</b> → <b>11</b> → <b>13</b>. Past the 13th you’d be back at the root, so that’s the whole list. Those top three are <b>extensions</b>: they don’t change whether a chord is major or minor, they change its <em>texture</em>.' },
    { keys:[
      '<b>9th</b> (14 semitones) — the sweet one. Adds air and modern polish. Safe on almost anything.',
      '<b>11th</b> (17) — washy and suspended. On minor chords it’s lovely; on major chords it fights the 3rd, so it’s usually sharpened (♯11) instead.',
      '<b>13th</b> (21) — plush and soulful. Same note as the 6th, an octave up.' ] },
    { h:'“add9” is not the same as “9”' },
    { p:'<span class="k">Cadd9</span> = triad + 9th, <b>no 7th</b> (C E G D). Open, poppy, guitar-ish. <span class="k">C9</span> = dominant 7th + 9th (C E G B♭ D) — a full jazz/funk chord with tension in it. Beginners reach for “9” when they mean “add9” and wonder why everything sounds unresolved.' },
    { p:'The other easy win is <span class="k">6/9</span> (C E G A D) — a major chord with no 7th at all, just the 6th and 9th. It sounds finished and expensive at the same time, which is why neo-soul ends on it constantly.' },
    { h:'You must leave notes out' },
    { p:'A full 13th chord has seven notes. Play them all in the low-mid range and you get mud. Real voicings <b>omit</b>: keep the <b>root</b> (often in the bass, far below), the <b>3rd</b> (it sets major/minor), the <b>7th</b> (it sets the chord’s job) and whichever extension you want to hear. Drop the 5th first, then the 11th.' },
    { note:{ h:'Rootless is a real technique',
      p:'If your bass or 808 is already hammering the root, the chord doesn’t need it. Play 3–5–7–9 and let the bass supply the root. This one habit is most of what makes keys sit nicely in a mix instead of clashing with the low end.' } },
    { try:{ h:'Add colour one layer at a time', p:'Start from the triad and switch layers on. Listen for the moment it stops sounding “basic” — usually the 9th.',
      build:ctx => [
        UI.chips([{label:'Triad',value:'maj'},{label:'maj7',value:'maj7'},{label:'add9',value:'add9'},
                  {label:'maj9',value:'maj9'},{label:'6/9',value:'six9'},{label:'m9',value:'min9'},
                  {label:'m11',value:'min11'},{label:'maj13',value:'maj13'}], v => ctx.show(v), 0),
        UI.toggle('Rootless voicing', v => ctx.rootless(v)),
        UI.toggle('Drop the 5th', v => ctx.no5(v))
      ] } }
  ],
  quiz:[
    { q:'Cadd9 contains…', a:['C E G B♭ D','C E G D','C E G B D','C D E G'], c:1,
      why:'Triad plus the 9th, with no 7th: C E G D. Adding a B♭ would make it C9, a dominant chord.' },
    { q:'Which extension usually clashes on a major chord?', a:['9th','11th','13th','6th'], c:1,
      why:'The natural 11th sits a semitone above the major 3rd. On major chords producers use ♯11 instead, or move to a sus/m11 sound.' },
    { q:'Which note do you drop first when a big chord gets muddy?', a:['Root','3rd','5th','7th'], c:2,
      why:'The 5th carries the least information. The 3rd and 7th define the chord’s quality and function, so they stay.' }
  ],
  init:ctx => {
    let type = 'maj', rootless = false, no5 = false;
    const root = 53;
    const draw = () => {
      let ns = T.chordNotes(root, type).slice();
      if (no5) ns = ns.filter(n => (n - root) % 12 !== 7);
      if (rootless) ns = ns.filter(n => n !== root);
      ctx.v.clear().marks(ns.filter(n => n <= 72), 'chord').apply().clearExtras();
      if (!rootless) ctx.v.mark(root, 'root').apply();
      ctx.v.stack(ns.filter(n => n <= 74));
      ctx.v.tag(T.name(root) + T.CHORDS[type].sym + (rootless ? '  (rootless)' : ''), 0,
        1.6 + ns.length * 1.05);
      ctx.read(T.name(root) + T.CHORDS[type].sym + '  ·  ' + T.CHORDS[type].label +
        '\n' + ns.map(n => T.name(n)).join(' ') +
        '\nintervals ' + ns.map(n => n - root).join(' ') +
        (no5 ? '\n5th omitted' : ''));
      if (rootless) A.note(root - 12, 2.4, { gain:.7 });
      A.chord(ns, 2.6, { spread:.05 });
    };
    ctx.show = v => { type = v; draw(); };
    ctx.rootless = v => { rootless = v; draw(); };
    ctx.no5 = v => { no5 = v; draw(); };
    ctx.v.onKey(m => { A.note(m, 1); ctx.read(T.fullName(m)); });
    draw();
  }
});

LESSONS.push({
  id:'suspensions', level:2, tag:'Harmony', title:'Suspensions',
  hint:'Take the 3rd out and let it fall back',
  lede:'A sus chord is a chord with its mood deliberately removed. It can’t be happy or sad, so it hangs — and then resolving it is one of the most satisfying moves you have.',
  stage:{ view:'keys', cfg:{ lo:48, hi:72, labels:'names' } },
  blocks:[
    { h:'What gets suspended' },
    { p:'The 3rd is what makes a chord major or minor. <b>Suspend</b> it — replace it with the note above or below — and the chord loses its quality:' },
    { keys:[
      '<b>sus4</b> = 0 5 7. The 3rd is pushed <em>up</em> to the 4th. Tense, grand, anthemic.',
      '<b>sus2</b> = 0 2 7. The 3rd is pulled <em>down</em> to the 2nd. Open, airy, ambient.' ] },
    { p:'Neither has a 3rd, so neither is major or minor. That’s the point: a sus chord is a question, and moving the suspended note back to the 3rd is the answer. <span class="k">Dsus4 → D</span> is a full sentence in two chords.' },
    { h:'sus2 and sus4 are the same chord, moved' },
    { p:'Csus2 is C D G. Gsus4 is G C D. Same three notes. Which one you call it depends on which note you put in the bass — and that decides completely how it feels. Handy when you want a new chord without learning a new shape.' },
    { h:'Where producers actually use them' },
    { keys:[
      '<b>Hold the suspension</b> and never resolve it — ambient, cinematic, most “floaty” intros.',
      '<b>Resolve on the last beat</b> of a bar so the loop breathes: 3 beats of sus4, 1 beat of the plain chord.',
      '<b>Sus over a moving bass</b> — a static sus2 shape in the right hand while the 808 walks underneath is the entire harmonic content of a lot of trap.',
      '<b>7sus4 → 7</b> is the gospel/neo-soul version, with extra weight.' ] },
    { note:{ h:'Sus vs add',
      p:'“sus” <em>replaces</em> the 3rd. “add” <em>keeps</em> it. Csus2 = C D G. Cadd9 = C E G D — same D, but the 3rd is still there, so it’s still a happy chord with colour. Writing sus when you meant add is one of the most common notation mix-ups.' } },
    { try:{ h:'Hang it, then land it', p:'Play the suspension and hear it resolve. Then try holding it and see how long your ear can take the ambiguity.',
      build:ctx => [
        UI.chips([{label:'sus4',value:'sus4'},{label:'sus2',value:'sus2'},{label:'7sus4',value:'7sus4'}],
          v => ctx.show(v), 0),
        UI.btn('Resolve to major', () => ctx.resolve('maj')),
        UI.btn('Resolve to minor', () => ctx.resolve('min')),
        UI.btn('Loop: 3 beats sus, 1 beat resolved', () => ctx.loop())
      ] } }
  ],
  quiz:[
    { q:'A sus4 chord in semitones is…', a:['0 4 7','0 2 7','0 5 7','0 3 7'], c:2,
      why:'0 5 7 — the 3rd replaced by the 4th. No 3rd means no major or minor quality.' },
    { q:'Csus2 and Gsus4 are…', a:['Unrelated','The same three notes','An octave apart','Both minor chords'], c:1,
      why:'C D G in both cases. Which note sits in the bass decides the name and the feel.' },
    { q:'The difference between sus2 and add9 is…', a:['Nothing','sus2 has no 3rd; add9 keeps it','add9 has no 5th','sus2 is always minor'], c:1,
      why:'“sus” replaces the 3rd, “add” keeps it. That’s why add9 still sounds major while sus2 sounds open and undecided.' }
  ],
  init:ctx => {
    let type = 'sus4';
    const root = 57;
    const notesOf = t => t === '7sus4' ? [root, root + 5, root + 7, root + 10] : T.chordNotes(root, t);
    const draw = (t, label) => {
      const ns = notesOf(t || type);
      ctx.v.clear().marks(ns.filter(n => n <= 72), 'chord').mark(root, 'root').apply().clearExtras();
      ctx.v.stack(ns);
      ctx.v.tag(T.name(root) + (label || (T.CHORDS[type] ? T.CHORDS[type].sym : '7sus4')), 0, 1.6 + ns.length * 1.05);
      ctx.read(T.name(root) + (label || (T.CHORDS[type] ? T.CHORDS[type].sym : '7sus4')) +
        '\n' + ns.map(n => T.name(n)).join(' ') +
        '\n' + (label ? 'resolved — the 3rd is back' : 'no 3rd · no major or minor'));
      A.chord(ns, 2.2, { spread:.05 });
    };
    ctx.show = v => { type = v; draw(); };
    ctx.resolve = q => {
      draw();
      ctx.later(() => draw(q, T.CHORDS[q].sym), 1200);
    };
    ctx.loop = () => {
      for (let i = 0; i < 4; i++) {
        ctx.later(() => draw(), i * 2000);
        ctx.later(() => draw('maj', ''), i * 2000 + 1500);
      }
    };
    ctx.v.onKey(m => { A.note(m, 1); ctx.read(T.fullName(m)); });
    draw();
  }
});

LESSONS.push({
  id:'inversions', level:2, tag:'Harmony', title:'Inversions and Voicing',
  hint:'Same chord, different bottom note',
  lede:'Most beginner progressions sound clumsy for one reason: every chord is played in root position, so the hands jump. Inversions fix it, and they’re free.',
  stage:{ view:'keys', cfg:{ lo:48, hi:72, labels:'names' } },
  blocks:[
    { h:'Rotate the stack' },
    { p:'Take C–E–G and move the bottom note up an octave: E–G–C. Still a C major chord, but E is now the lowest note. That’s the <b>1st inversion</b>. Do it again — G–C–E — and you have the <b>2nd inversion</b>. A 7th chord has a 3rd inversion too.' },
    { table:{ head:['Name','Bass note','C major becomes','Written'],
      rows:[
        ['Root position','the root','C E G','C'],
        ['1st inversion','the 3rd','E G C','C/E'],
        ['2nd inversion','the 5th','G C E','C/G'],
        ['3rd inversion (7ths)','the 7th','B C E G','Cmaj7/B'] ] } },
    { p:'That slash notation — <span class="k">C/E</span> — reads “C chord with E in the bass”. You’ll see it constantly in chord charts, and it’s a straight instruction to your bass line.' },
    { h:'Voice leading: move as little as possible' },
    { p:'Play <span class="k">C → F</span> in root position and every finger jumps. Play C (C E G) → F in 2nd inversion (C F A) and only <em>two</em> notes moved, by one step each. Same chords, far smoother. The rule: <b>keep common notes where they are, move the rest to the nearest available note</b>. That’s <b>voice leading</b>, and it’s what separates “chords” from “a part”.' },
    { h:'Voicing: where you put the notes' },
    { keys:[
      '<b>Close voicing</b> — all notes within an octave. Compact, can get muddy low down.',
      '<b>Open / spread voicing</b> — root in the bass, the rest up high with a gap in the middle. This is the sound of professional keys.',
      '<b>Drop 2</b> — take the second note from the top and drop it an octave. Instant sophistication on 7th chords.',
      '<b>Rule of thumb</b>: below C3, two notes maximum. The low register has no room for chords.' ] },
    { note:{ h:'The inversion that changes the bass line',
      p:'Inversions let you write a bass line without changing your chords. C – C/B – Am – Am/G gives you a descending bass under almost no harmonic movement. Half of all ballads are built this way.' } },
    { try:{ h:'Rotate, then smooth a progression', p:'Invert a single chord first, then play the same progression twice — once all in root position, once voice-led — and hear the difference.',
      build:ctx => [
        UI.chips([{label:'Root position',value:0},{label:'1st inversion',value:1},
                  {label:'2nd inversion',value:2},{label:'3rd (7th chords)',value:3}], v => ctx.inv(v), 0),
        UI.btn('C–F–G–C all in root position', () => ctx.prog(false)),
        UI.btn('Same, voice-led', () => ctx.prog(true))
      ] } }
  ],
  quiz:[
    { q:'G/B means…', a:['G and B played together','A G chord with B in the bass','B minor','G chord without the 5th'], c:1,
      why:'Slash notation: chord on the left, bass note on the right. B is the 3rd of G, so this is 1st inversion.' },
    { q:'The point of voice leading is…', a:['To play more notes','To move each voice as little as possible','To always use root position','To raise the key'], c:1,
      why:'Smaller movements sound smoother and more deliberate. Keep shared notes still and move the others to the nearest note.' },
    { q:'Your chords sound muddy under C3. Best fix?', a:['Add more notes','Use no more than two notes down there','Add reverb','Transpose down'], c:1,
      why:'The low register has almost no harmonic room. Put the root (and maybe a 5th or 7th) down there and voice everything else above middle C.' }
  ],
  init:ctx => {
    let n = 0;
    const root = 60;
    const draw = (notes, label) => {
      ctx.v.clear().marks(notes.filter(x => x <= 72), 'chord').mark(notes[0], 'root').apply().clearExtras();
      ctx.v.stack(notes.filter(x => x <= 74));
      ctx.v.tag(label, 0, 1.6 + notes.length * 1.05);
      ctx.read(label + '\n' + notes.map(x => T.name(x)).join(' ') +
        '\nbass note: ' + T.name(notes[0]));
      A.chord(notes, 2.1, { spread:.05 });
    };
    ctx.inv = v => {
      n = v;
      const base = v === 3 ? T.chordNotes(root, 'maj7') : T.chordNotes(root, 'maj');
      const ns = T.invert(base, v);
      const names = ['C', 'C/E', 'C/G', 'Cmaj7/B'];
      draw(ns, names[v] + '  ·  ' + ['root position','1st inversion','2nd inversion','3rd inversion'][v]);
    };
    ctx.prog = smooth => {
      const seq = smooth
        ? [[60,64,67], [60,65,69], [59,62,67], [60,64,67]]
        : [[60,64,67], [65,69,72], [67,71,74], [60,64,67]];
      const labels = smooth ? ['C','F/C','G/B','C'] : ['C','F','G','C'];
      seq.forEach((ns, i) => ctx.later(() => {
        draw(ns, labels[i] + (smooth ? '  ·  voice-led' : '  ·  root position'));
      }, i * 1000));
    };
    ctx.v.onKey(m => { A.note(m, 1); ctx.read(T.fullName(m)); });
    ctx.inv(0);
  }
});

LESSONS.push({
  id:'dom-dim-aug', level:2, tag:'Harmony', title:'Dominant, Diminished, Augmented',
  hint:'The three engines of tension',
  lede:'Stable chords are furniture. These three are motors — they exist to push the music somewhere else.',
  stage:{ view:'keys', cfg:{ lo:48, hi:72, labels:'names', flats:true } },
  blocks:[
    { h:'The dominant 7th: a tritone with a plan' },
    { p:'<span class="k">G7</span> = G B D F. Look at B and F: 6 semitones apart — a <b>tritone</b>. That interval is unstable, and in this chord both of its notes have somewhere to go: B wants to rise a semitone to C, F wants to fall a semitone to E. Release them and you land on C major. That’s why <b>V7 → I</b> is the strongest resolution in tonal music.' },
    { p:'Producers use that pull deliberately: sit on the V7 at the end of a 4-bar loop and the loop yanks itself back to bar 1. Secondary dominants take it further — make <em>any</em> chord a dominant 7th and it will pull toward the chord a 5th below it. <span class="k">A7 → Dm</span> works in C major even though A7 isn’t in the key.' },
    { h:'Diminished: symmetrical, homeless, useful' },
    { p:'<b>dim7</b> = 0 3 6 9 — four notes, every gap a minor 3rd. Because it’s perfectly symmetrical it belongs to no key, so it can slot in anywhere. Its main jobs:' },
    { keys:[
      '<b>Passing chord</b> — put a dim7 between two chords a tone apart to walk the bass chromatically.',
      '<b>Leading tone chord</b> — vii°7 resolving to i is a darker, tighter V7.',
      '<b>Dread</b> — hold one and it’s pure suspense; horror scores live on it.' ] },
    { h:'Augmented: the pivot' },
    { p:'<b>aug</b> = 0 4 8 — two stacked major 3rds, also symmetrical. It sounds uneasy and weightless. Used as a one-beat pivot between two stable chords (<span class="k">C → Caug → Am</span>) it adds motion with no commitment. Hold it for a bar and everything sounds like a dream sequence.' },
    { note:{ h:'The tritone substitution',
      p:'Any dominant 7th can be replaced by the dominant 7th a tritone away, because they share the same tritone. <span class="k">G7 → C</span> can become <span class="k">D♭7 → C</span>, which gives you a slinky chromatic bass. This one substitution is most of what makes a progression sound “jazzy”.' } },
    { try:{ h:'Feel the pull, then release it', p:'Hear each engine chord alone, then hear it resolve. Notice how little you have to move.',
      build:ctx => [
        UI.chips([{label:'V7 → I',value:'v7'},{label:'vii°7 → i',value:'dim'},{label:'Caug → Am',value:'aug'},
                  {label:'Tritone sub: D♭7 → C',value:'sub'},{label:'Secondary: A7 → Dm',value:'sec'}],
          v => ctx.demo(v), 0),
        UI.btn('Tension only (no resolution)', () => ctx.hold())
      ] } }
  ],
  quiz:[
    { q:'Which interval inside G7 creates its pull toward C?', a:['The perfect 5th','The tritone between B and F','The major 3rd','The octave'], c:1,
      why:'B–F is 6 semitones. B rises to C and F falls to E — both by one semitone — landing on a C major chord.' },
    { q:'A dim7 chord is built from…', a:['Stacked major 3rds','Stacked minor 3rds','Stacked perfect 4ths','Stacked semitones'], c:1,
      why:'Four notes, each a minor 3rd apart (0 3 6 9). That symmetry means it belongs to no single key, so it can pass between almost anything.' },
    { q:'A tritone substitution replaces G7 with…', a:['C7','D♭7','A7','E7'], c:1,
      why:'D♭7 — a tritone away from G7, and sharing the same tritone (B/C♭ and F). Same tension, chromatic bass movement.' }
  ],
  init:ctx => {
    const D = {
      v7:   { a:[55,59,62,65], b:[48,52,55,60], la:'G7', lb:'C  ·  resolved',
              note:'B→C and F→E, one semitone each' },
      dim:  { a:[59,62,65,68], b:[48,51,55,60], la:'Bdim7', lb:'Cm  ·  resolved',
              note:'most voices move by a single semitone' },
      aug:  { a:[48,52,56], b:[45,48,52], la:'Caug', lb:'Am  ·  resolved',
              note:'G♯ pulls up to A — a one-beat pivot' },
      sub:  { a:[49,53,56,59], b:[48,52,55,60], la:'D♭7', lb:'C  ·  resolved',
              note:'same tritone as G7, bass slides down a semitone' },
      sec:  { a:[57,61,64,67], b:[50,53,57,62], la:'A7', lb:'Dm  ·  resolved',
              note:'a dominant built on degree 2 — pulls to Dm, not C' }
    };
    let cur = 'v7';
    const paint = (ns, label, extra) => {
      ctx.v.clear().marks(ns.filter(n => n <= 72), 'chord').mark(ns[0], 'root').apply().clearExtras();
      ctx.v.tag(label, 0, 3.4);
      ctx.read(label + '\n' + ns.map(n => T.name(n)).join(' ') + (extra ? '\n' + extra : ''));
      A.chord(ns, 2, { spread:.05 });
    };
    ctx.demo = k => {
      cur = k; const d = D[k];
      paint(d.a, d.la + '  ·  tension', d.note);
      ctx.later(() => paint(d.b, d.lb), 1500);
    };
    ctx.hold = () => { const d = D[cur]; paint(d.a, d.la + '  ·  unresolved', d.note); };
    ctx.v.onKey(m => { A.note(m, 1); ctx.read(T.fullName(m)); });
    ctx.demo('v7');
  }
});

LESSONS.push({
  id:'harmonic-minor', level:2, tag:'Harmony', title:'Harmonic Minor',
  hint:'Raise the 7th, unlock the drama',
  lede:'Natural minor has a weak dominant chord — so composers raised one note to fix it. The side effect is the most cinematic scale in common use.',
  stage:{ view:'keys', cfg:{ lo:48, hi:72, labels:'names', flats:true } },
  blocks:[
    { h:'The problem it solves' },
    { p:'In natural minor the chord on degree 5 comes out <b>minor</b> (in C minor: G B♭ D). A minor v has no leading note and barely pulls home. So: raise the 7th degree by a semitone — B♭ becomes B — and the chord on 5 turns into <b>G7</b>, a proper dominant that slams back into Cm.' },
    { p:'That’s <b>harmonic minor</b>: <span class="k">0 2 3 5 7 8 11</span>. Natural minor with a raised 7th. One note changed, and the key suddenly has a strong home pull.' },
    { h:'The side effect: an augmented 2nd' },
    { p:'Between the ♭6 and the ♮7 there is now a gap of <b>3 semitones</b> (A♭ to B in C minor) — an <b>augmented 2nd</b>, the widest step in any common scale. Your ear reads that leap as “exotic, dramatic, Middle-Eastern, sinister”. It’s the sound of Eastern European folk, flamenco, metal, drill and most film villains.' },
    { h:'The chords you get' },
    { table:{ head:['Degree','Chord in C harmonic minor','Quality','Use'],
      rows:[
        ['i','Cm (C E♭ G)','minor','home'],
        ['ii°','Ddim (D F A♭)','diminished','tense approach to V'],
        ['III+','E♭aug','augmented','strange, transitional'],
        ['iv','Fm','minor','the dark subdominant'],
        ['V','G / G7','major','the whole reason for the scale'],
        ['VI','A♭','major','huge, cinematic'],
        ['vii°7','Bdim7','diminished 7th','maximum tension → i'] ] } },
    { p:'The two you will use constantly are <b>V</b> (or V7) and <b>vii°7</b>. Both are only available because of that raised 7th, and both resolve to the minor tonic with real force.' },
    { note:{ h:'Melodic minor, in one line',
      p:'Singers found the augmented 2nd awkward, so <b>melodic minor</b> also raises the 6th (0 2 3 5 7 <b>9 11</b>) going up, and reverts to natural minor coming down. In production you mostly borrow it for smooth minor lines and jazz-minor chords.' } },
    { note:{ h:'Phrygian dominant — the fifth mode',
      p:'Start harmonic minor on its 5th degree and you get <b>phrygian dominant</b> (0 1 4 5 7 8 10): a major chord with a ♭2 above it. Flamenco, Egyptian and a huge amount of dark drill sits right here. Same notes as the parent harmonic minor, different home.' } },
    { try:{ h:'Hear the one note that changes everything', p:'A/B natural and harmonic minor, then play the V chord in each. The second one sounds like it means it.',
      build:ctx => [
        UI.chips([{label:'Natural minor',value:'minor'},{label:'Harmonic minor',value:'harmonicMinor'},
                  {label:'Melodic minor',value:'melodicMinor'},{label:'Phrygian dominant',value:'phrygianDom'}],
          v => ctx.setScale(v), 0),
        UI.btn('Play the scale', () => ctx.run()),
        UI.btn('Play V → i', () => ctx.cadence()),
        UI.btn('vii°7 → i', () => ctx.dim())
      ] } }
  ],
  quiz:[
    { q:'Harmonic minor differs from natural minor by…', a:['A raised 6th','A raised 7th','A flat 2nd','A raised 3rd'], c:1,
      why:'The 7th degree is raised a semitone, which turns the v chord into a real dominant V.' },
    { q:'The “exotic” sound of harmonic minor comes from…', a:['The flat 3rd','The augmented 2nd between ♭6 and ♮7','The perfect 5th','The octave'], c:1,
      why:'A three-semitone step between two adjacent scale degrees — unusually wide, and instantly recognisable.' },
    { q:'In C harmonic minor, the chord on degree 5 is…', a:['Gm','G major','G dim','G sus4'], c:1,
      why:'G B D — major, because the raised 7th (B) is now the chord’s 3rd. Add F and you get G7, the strongest way home.' }
  ],
  init:ctx => {
    const root = 48; let type = 'minor';
    const paint = () => {
      const ns = T.scaleNotes(root, type).concat(T.scaleNotes(root + 12, type)).filter(n => n <= 72);
      ctx.v.clear().marks(ns, 'scale').mark(root, 'root').mark(root + 12, 'root').apply().clearExtras();
      const st = T.SCALES[type].steps;
      const gaps = st.map((s, i) => i ? st[i] - st[i - 1] : null).slice(1).concat([12 - st[st.length - 1]]);
      const big = gaps.indexOf(3);
      if (type === 'harmonicMinor') ctx.v.mark(root + 11, 'target').mark(root + 8, 'extra').apply();
      ctx.v.tag(T.name(root) + ' ' + T.SCALES[type].label, 0, 3.3);
      ctx.read(T.SCALES[type].label + '\n' + st.join(' ') +
        '\nsteps ' + gaps.join(' ') +
        (big >= 0 ? '\naugmented 2nd between degrees ' + (big + 1) + ' and ' + (big + 2) : '') +
        '\n' + T.SCALES[type].mood);
    };
    ctx.setScale = v => { type = v; paint(); ctx.run(); };
    ctx.run = () => {
      const ns = T.scaleNotes(root, type).concat([root + 12]);
      ns.forEach((m, i) => ctx.later(() => { A.note(m, .45); ctx.v.press(m); }, i * 200));
    };
    ctx.cadence = () => {
      const V = type === 'minor' ? [55,58,62] : [55,59,62,65];
      A.chord(V, 1.4, { spread:.05 });
      ctx.read((type === 'minor' ? 'Gm  ·  weak v' : 'G7  ·  strong V') + '\n' + V.map(n => T.name(n)).join(' '));
      ctx.v.clear().marks(V, 'chord').apply();
      ctx.later(() => {
        const i = [48,51,55,60];
        A.chord(i, 2, { spread:.05 });
        ctx.v.clear().marks(i, 'chord').mark(48, 'root').apply();
        ctx.read('Cm  ·  home' + (type === 'minor' ? '\nnotice how softly it lands' : '\nthat is a real resolution'));
      }, 1400);
    };
    ctx.dim = () => {
      const d = [59,62,65,68];
      A.chord(d, 1.4, { spread:.04 });
      ctx.v.clear().marks(d, 'chord').apply();
      ctx.read('Bdim7  ·  vii°7\nB D F A♭ — all minor 3rds');
      ctx.later(() => {
        A.chord([48,51,55,60], 2, { spread:.05 });
        ctx.v.clear().marks([48,51,55,60], 'chord').mark(48, 'root').apply();
        ctx.read('Cm  ·  three voices moved by one semitone');
      }, 1400);
    };
    ctx.v.onKey(m => { A.note(m, 1); ctx.read(T.fullName(m)); });
    paint();
  }
});

LESSONS.push({
  id:'borrowed', level:2, tag:'Harmony', title:'Borrowed and Chromatic Chords',
  hint:'Chords from outside the key',
  lede:'Once the seven diatonic chords feel predictable, you start borrowing. Done with a reason, an outside chord is the most memorable bar in the song.',
  stage:{ view:'keys', cfg:{ lo:48, hi:72, labels:'names', flats:true } },
  blocks:[
    { h:'Modal interchange' },
    { p:'You are in C <b>major</b>, but you play a chord from C <b>minor</b>. Same root note, different parent scale — so it still feels like “home key”, just recoloured. This is <b>modal interchange</b> (or modal mixture), and it is the single most useful outside-the-key technique.' },
    { table:{ head:['Borrowed chord','In C major','Borrowed from','Effect'],
      rows:[
        ['♭VI','A♭','C minor','huge, heroic lift'],
        ['♭VII','B♭','Mixolydian','rock/anthemic; avoids the leading note'],
        ['iv','Fm','C minor','instant heartbreak — the “sad IV”'],
        ['♭III','E♭','C minor','dramatic, gospel'],
        ['II (major)','D','Lydian','bright surprise; leads to V'],
        ['♭II','D♭','Phrygian','dark, cinematic, one-bar shock'] ] } },
    { p:'The famous one is <b>IV → iv</b>: play F major, then F minor, then go home to C. One note moves (A → A♭) and the whole phrase turns bittersweet. Pop choruses use it constantly for the final repeat.' },
    { h:'Secondary dominants' },
    { p:'Any chord in the key can be preceded by its <em>own</em> dominant 7th, even though that chord isn’t in the key. Want to arrive at Dm more strongly? Put <b>A7</b> in front of it. Written <span class="k v">V7/ii</span> — “the five of two”. You get a chromatic note, a strong pull, and no loss of key.' },
    { h:'Chromatic bass moves' },
    { p:'Some outside chords exist only to walk the bass. A <b>dim7 passing chord</b> between two diatonic chords a tone apart, or a <b>tritone sub</b> to slide into the tonic from a semitone above — these are bass-line decisions that happen to make interesting harmony.' },
    { note:{ h:'The one rule',
      p:'Borrow for <em>one or two bars</em>, then come home. An outside chord is an event. If everything is borrowed, nothing is surprising — and you’ve just changed key without meaning to.' } },
    { try:{ h:'Borrow something', p:'Each option plays a plain diatonic loop, then the same loop with one chord swapped for an outside one. Listen for the bar that grabs you.',
      build:ctx => [
        UI.chips([{label:'IV → iv (sad IV)',value:'iv'},{label:'♭VI lift',value:'bVI'},
                  {label:'♭VII rock move',value:'bVII'},{label:'V7/ii secondary',value:'sec'},
                  {label:'♭II shock',value:'bII'}], v => ctx.demo(v), 0),
        UI.btn('Diatonic version first', () => ctx.plain())
      ] } }
  ],
  quiz:[
    { q:'Playing Fm in the key of C major is an example of…', a:['A key change','Modal interchange','A tritone substitution','An inversion'], c:1,
      why:'iv borrowed from C minor. Same tonic, different parent scale — the key still feels like C.' },
    { q:'“V7/ii” means…', a:['The 7th of chord ii','The dominant 7th that resolves to ii','A ii chord with a V bass','Two dominants at once'], c:1,
      why:'A secondary dominant. In C major, ii is Dm, so V7/ii is A7 — it pulls hard into Dm.' },
    { q:'Best practice with borrowed chords is to…', a:['Use them for most of the loop','Use one or two, then return home','Only use them in minor keys','Avoid them entirely'], c:1,
      why:'They work by contrast. A borrowed chord surrounded by diatonic ones is an event; borrow everything and you’ve simply modulated.' }
  ],
  init:ctx => {
    const P = {
      plain: { seq:[[48,52,55],[53,57,60],[55,59,62],[48,52,55]], lab:['C','F','G','C'] },
      iv:    { seq:[[48,52,55],[53,57,60],[53,56,60],[48,52,55]], lab:['C','F','Fm  ← borrowed','C'] },
      bVI:   { seq:[[48,52,55],[44,48,51],[53,57,60],[55,59,62]], lab:['C','A♭  ← ♭VI','F','G'] },
      bVII:  { seq:[[48,52,55],[46,50,53],[53,57,60],[48,52,55]], lab:['C','B♭  ← ♭VII','F','C'] },
      sec:   { seq:[[48,52,55],[57,61,64,67],[50,53,57],[55,59,62]], lab:['C','A7  ← V7/ii','Dm','G'] },
      bII:   { seq:[[48,52,55],[49,53,56],[55,59,62],[48,52,55]], lab:['C','D♭  ← ♭II','G','C'] }
    };
    const run = k => {
      const p = P[k];
      p.seq.forEach((ns, i) => ctx.later(() => {
        const out = /←/.test(p.lab[i]);
        ctx.v.clear().marks(ns, out ? 'root' : 'chord').apply().clearExtras();
        ctx.v.tag(p.lab[i], 0, 3.4, out ? '#F2B33D' : null);
        ctx.read(p.lab[i] + '\n' + ns.map(n => T.name(n)).join(' ') +
          (out ? '\noutside the key — that is the point' : ''));
        A.chord(ns, 1.15, { spread:.05 });
      }, i * 1000));
    };
    ctx.demo = k => run(k);
    ctx.plain = () => run('plain');
    ctx.v.onKey(m => { A.note(m, 1); ctx.read(T.fullName(m)); });
    run('iv');
  }
});
