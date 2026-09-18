/* ═══════════════════════════════════════════════════════════════
   LESSONS — Level 3 · Pro moves
   ═══════════════════════════════════════════════════════════════ */

LESSONS.push({
  id:'circle', level:3, tag:'Keys', title:'The Circle of Fifths',
  hint:'Tap a key on the wheel',
  lede:'Twelve keys arranged so that every neighbour is a friend. It looks like theory homework and works like a map of which chords will fit.',
  stage:{ view:'wheel', cfg:{ spin:0.06 } },
  blocks:[
    { h:'How the wheel is built' },
    { p:'Start at C and move up a <b>perfect 5th</b> each time: C → G → D → A → E → B → F♯ → D♭ → A♭ → E♭ → B♭ → F → back to C. Twelve steps and you’ve used all twelve notes. Going clockwise <b>adds one sharp</b> to the key signature each time; going anticlockwise adds one flat.' },
    { p:'The inner ring holds each key’s <b>relative minor</b> — the minor key that shares its exact notes, three semitones below. C major and A minor sit together because they are the same seven notes with a different home.' },
    { h:'Why neighbours matter' },
    { p:'Two keys next to each other on the wheel share <b>six of their seven notes</b>. That’s the whole practical payoff:' },
    { keys:[
      'The keys either side of yours are your <b>IV</b> and <b>V</b> — the two most useful chords after the tonic.',
      'Your position plus its two neighbours, plus the three relative minors underneath them, give you <b>six chords guaranteed to work together</b> — a complete songwriting palette.',
      'Read the inner ring carefully: each minor is the relative minor of the tile <em>above</em> it, so from your key they come out as <b>ii</b> (under IV), <b>vi</b> (under I) and <b>iii</b> (under V). In C: Dm, Am, Em.',
      'To change key smoothly, move one step round the wheel. Only one note changes, so the listener follows you.',
      'To change key dramatically, jump across the wheel. A tritone away shares almost nothing — instant lift or shock.' ] },
    { h:'Reading it as a chord chooser' },
    { p:'Pick any key on the outer ring. The chords in that key are: the key itself (<b>I</b>), its anticlockwise neighbour (<b>IV</b>), its clockwise neighbour (<b>V</b>), and the minors underneath those same three tiles — which come out as <b>ii</b> under IV, <b>vi</b> under I and <b>iii</b> under V. In C major that is C, F, G, Dm, Am, Em. Six of the seven diatonic chords, with no maths.' },
    { small:'The seventh, vii° (Bdim in C), has no tile of its own — it is the one chord the wheel does not show you.' },
    { note:{ h:'Key signatures, quickly',
      p:'Clockwise from C: G has 1♯, D has 2♯, A 3♯, E 4♯, B 5♯, F♯ 6♯. Anticlockwise: F has 1♭, B♭ 2♭, E♭ 3♭, A♭ 4♭, D♭ 5♭. Producers rarely write notation, but DAW key-detection plugins and sample packs label things this way, so it pays to recognise them.' } },
    { try:{ h:'Use the wheel', p:'Tap any outer tile. The lab lights up that key’s neighbours and relative minor, then plays its six-chord palette so you hear that it works.',
      build:ctx => [
        UI.btn('Play this key’s palette', () => ctx.palette()),
        UI.btn('Modulate one step clockwise', () => ctx.step(1)),
        UI.btn('Jump across the wheel', () => ctx.step(6)),
        UI.toggle('Spin the wheel', v => ctx.v.spin(v ? 0.12 : 0), true)
      ] } }
  ],
  quiz:[
    { q:'Moving one step clockwise on the circle does what to the key signature?', a:['Adds a flat','Adds a sharp','Nothing','Changes to minor'], c:1,
      why:'Clockwise = up a perfect 5th = one more sharp. Anticlockwise = up a 4th = one more flat.' },
    { q:'Two adjacent keys on the circle share…', a:['All seven notes','Six of seven notes','Three notes','No notes'], c:1,
      why:'Only one note differs, which is exactly why modulating to a neighbour sounds effortless.' },
    { q:'The relative minor of E♭ major is…', a:['Cm','Gm','Fm','Bm'], c:0,
      why:'Three semitones below the major tonic, or the 6th degree of the scale: E♭ major → C minor. They share the same three flats.' }
  ],
  init:ctx => {
    const setKey = i => {
      const pcRoot = T.CIRCLE[i];
      const iv = (i + 11) % 12, v = (i + 1) % 12;
      ctx.v.select(i).roles({ ['M' + iv]:'extra', ['M' + v]:'chord',
        ['m' + i]:'target', ['m' + iv]:'scale', ['m' + v]:'scale' }).links([iv, v]);
      /* The minor sitting under a tile is the relative minor of THAT key, so
         reading left to right the inner ring gives ii (under IV), vi (under I)
         and iii (under V) of the selected key. */
      ctx.read(T.KEY_LABEL[i] + ' major  ·  ' + T.SIGNATURE[i] +
        '\nIV ' + T.KEY_LABEL[iv] + '    V ' + T.KEY_LABEL[v] +
        '\nii ' + T.MINOR_LABEL[iv] + '   iii ' + T.MINOR_LABEL[v] +
        '\nvi ' + T.MINOR_LABEL[i] + '  (relative minor)');
      ctx.cur = { i, pcRoot };
    };
    ctx.palette = () => {
      const i = ctx.cur.i, base = 48 + T.CIRCLE[i];
      const chords = [
        { d:1, q:'maj', lab:'I' }, { d:4, q:'maj', lab:'IV' }, { d:5, q:'maj', lab:'V' },
        { d:6, q:'min', lab:'vi' }, { d:2, q:'min', lab:'ii' }, { d:3, q:'min', lab:'iii' }
      ];
      const dia = T.diatonic(base, 'major');
      const KR = T.MAJ_ROOT[T.CIRCLE[i]];
      chords.forEach((c, k) => ctx.later(() => {
        const ch = dia[c.d - 1];
        const cr = T.inKey(ch.root, KR, 'major');
        A.chord(ch.notes, 1.1, { spread:.05 });
        ctx.read(c.lab + '  \u00B7  ' + T.chordName(cr, ch.quality) +
          '\n' + T.spellChord(cr, ch.quality).join(' ') +
          '\nin ' + KR + ' major');
      }, k * 850));
    };
    ctx.step = n => {
      const i = (ctx.cur.i + n) % 12;
      setKey(i);
      const base = 48 + T.CIRCLE[i];
      A.chord(T.chordNotes(base, 'maj'), 1.8, { spread:.05 });
      ctx.read(T.KEY_LABEL[i] + ' major  ·  ' +
        (n === 1 ? 'one step — barely a bump' : 'a long jump — feels like a new world') +
        '\n' + T.SIGNATURE[i]);
    };
    ctx.v.onTile((i, ring) => {
      ctx.keep('key', i);
      if (ring === 'maj') {
        setKey(i);
        A.chord(T.chordNotes(48 + T.CIRCLE[i], 'maj'), 1.6, { spread:.05 });
      } else {
        A.chord(T.chordNotes(45 + T.CIRCLE[i], 'min'), 1.6, { spread:.05 });
        ctx.read(T.MINOR_LABEL[i] + '  ·  relative minor of ' + T.KEY_LABEL[i] +
          '\nsame seven notes, different home');
      }
    });
    setKey(ctx.recall('key') || 0);
  }
});

LESSONS.push({
  id:'melody', level:3, tag:'Melody', title:'Melody Craft',
  hint:'Tap the roll to write notes',
  lede:'A melody is not a list of nice notes. It’s a shape you repeat, vary and answer — and the shape is what people remember.',
  stage:{ view:'roll', cfg:{ steps:16, root:60, scale:'minor', octaves:2, contour:true } },
  blocks:[
    { h:'Start with a motif, not a melody' },
    { p:'A <b>motif</b> is a short idea — 2 to 4 notes, under one bar. It’s the smallest thing a listener can recognise coming back. Write one, then build the whole part out of it. This is the opposite of what beginners do (write 8 bars of new notes and wonder why nothing sticks).' },
    { p:'Then <b>vary</b> it. The four classic moves:' },
    { keys:[
      '<b>Repeat</b> — same notes, same rhythm. Free familiarity.',
      '<b>Transpose</b> — same shape, started on a different scale note. This is why degrees matter more than letters.',
      '<b>Invert</b> — flip the direction. Up-up-down becomes down-down-up.',
      '<b>Rhythmic variation</b> — same pitches, different timing. Often the strongest and least obvious option.' ] },
    { h:'Contour is the thing you actually hear' },
    { p:'<b>Contour</b> is the up-and-down line the melody draws — the ribbon above the roll. Strong melodies have a clear one: usually a rise to a high point (the <b>climax</b>, often 2/3 of the way through) then a fall home. Weak melodies wander in a narrow band or zigzag randomly.' },
    { p:'Two practical rules. Keep <b>steps</b> (next scale note) as your default movement and use <b>leaps</b> as events — a leap costs attention, so spend it once or twice. And after a big leap, come back down by step; the ear wants the gap filled in.' },
    { h:'Call and response' },
    { p:'Split your phrase in two. Bars 1–2 ask a question — end it on an unstable note, hanging. Bars 3–4 answer it — end on the tonic or the 3rd. That question/answer pair is a <b>period</b>, and it’s the reason 4- and 8-bar phrases feel complete rather than merely long.' },
    { note:{ h:'Space is a note',
      p:'Beginner melodies are too busy. A rest lets the previous note land and gives the vocal or the drums room. Try deleting a third of your notes — the melody usually gets better, and more of the ones you kept get heard.' } },
    { try:{ h:'Write a shape', p:'Tap the 3D roll to add or remove notes. The rows are the notes of C minor, so everything you write stays in the key — which is not the same as agreeing with a chord underneath (that is lesson 20). Then use the tools to vary what you wrote.',
      build:ctx => [
        UI.btn('Give me a motif', () => ctx.motif()),
        UI.btn('Repeat it', () => ctx.repeat()),
        UI.btn('Transpose the copy up a 3rd', () => ctx.seqUp()),
        UI.btn('Invert the shape', () => ctx.invert()),
        UI.btn('Clear', () => ctx.v.clearNotes())
      ] } }
  ],
  quiz:[
    { q:'A motif is…', a:['A full 8-bar melody','A short recognisable idea you repeat and vary','A chord progression','A drum pattern'], c:1,
      why:'Two to four notes is plenty. Everything memorable in pop is a motif that got repeated with small changes.' },
    { q:'After a large leap upward, the ear usually wants…', a:['Another leap up','Stepwise movement back down','Silence','A key change'], c:1,
      why:'Leaps create tension by leaving a gap. Filling it in by step resolves that tension — which is why the trick works every time.' },
    { q:'Ending a 2-bar phrase on an unstable note does what?', a:['Finishes the idea','Asks a question the next phrase can answer','Breaks the key','Changes the tempo'], c:1,
      why:'That’s call and response. Question phrase hangs; answer phrase lands on the tonic or 3rd.' }
  ],
  init:ctx => {
    const rootMidi = 60, scale = 'minor';
    const deg = T.SCALES[scale].steps;
    const pitch = d => rootMidi + (d >= 7 ? 12 + deg[d - 7] : deg[d]);
    let bpm = 92;
    ctx.motif = () => {
      const start = Math.floor(Math.random() * 3);
      const shape = [[0,2,1,4],[0,1,2,0],[4,2,1,0],[0,3,2,4]][Math.floor(Math.random() * 4)];
      const rhythm = [[0,2,4,6],[0,3,4,7],[0,1,3,6],[0,2,3,7]][Math.floor(Math.random() * 4)];
      const ns = shape.map((s, i) => ({ step:rhythm[i], midi:pitch(start + s), len: i === 3 ? 2 : 1 }));
      ctx.v.setNotes(ns);
      ctx.keep('notes', ns.slice());
      ctx.read('motif: ' + ns.map(n => T.inKey(n.midi, 'C', 'minor')).join(' ') +
        '\nfour notes, half a bar');
      ctx.play();
    };
    ctx.repeat = () => {
      const ns = ctx.v.notes.filter(n => n.step < 8);
      ctx.v.setNotes(ns.concat(ns.map(n => ({ step:n.step + 8, midi:n.midi, len:n.len }))));
      ctx.read('repeated in the second half\nfamiliarity for free');
      ctx.play();
    };
    ctx.seqUp = () => {
      const ns = ctx.v.notes.filter(n => n.step < 8);
      const rows = [];
      for (let o = 0; o < 2; o++) deg.forEach(s => rows.push(rootMidi + s + 12 * o));
      rows.push(rootMidi + 24);
      ctx.v.setNotes(ns.concat(ns.map(n => {
        const i = rows.indexOf(n.midi);
        return { step:n.step + 8, midi:rows[Math.min(rows.length - 1, i + 2)], len:n.len };
      })));
      ctx.read('the copy starts two scale notes higher\nsame shape, new altitude');
      ctx.play();
    };
    ctx.invert = () => {
      const ns = ctx.v.notes.slice();
      if (!ns.length) return;
      const pivot = ns[0].midi;
      const rows = [];
      for (let o = 0; o < 2; o++) deg.forEach(s => rows.push(rootMidi + s + 12 * o));
      rows.push(rootMidi + 24);
      const pi = rows.indexOf(pivot);
      ctx.v.setNotes(ns.map(n => {
        const i = rows.indexOf(n.midi);
        const j = Math.max(0, Math.min(rows.length - 1, pi - (i - pi)));
        return { step:n.step, midi:rows[j], len:n.len };
      }));
      ctx.read('shape flipped around the first note\nup becomes down');
      ctx.play();
    };
    ctx.play = () => {
      ctx.stop();
      ctx.seq({ bpm, div:16, steps:16, cb:(step, t) => {
        ctx.v.notes.filter(n => n.step === step).forEach(n =>
          A.note(n.midi, 0.28 * (n.len || 1) + 0.25, { when:t }));
        sch(ctx, t, () => ctx.v.playhead(step));
      } });
    };
    ctx.v.onCell((s, m, added) => {
      if (added) A.note(m, .6);
      ctx.keep('notes', ctx.v.notes.slice());
    });
    ctx.stage(
      UI.toggle('▶ Loop', v => { if (v) ctx.play(); else { ctx.stop(); ctx.v.playhead(-1); } }),
      UI.slider('Tempo', 60, 150, bpm, 1, v => { bpm = v; ctx.transport.bpm = v; }, v => v + ' BPM'),
      UI.toggle('Contour ribbon', v => ctx.v.contour(v), true)
    );
    ctx.read('C minor roll\ntap cells to write \u00B7 only scale notes shown');
    const kept = ctx.recall('notes');
    if (kept && kept.length) ctx.v.setNotes(kept); else ctx.motif();
  }
});

LESSONS.push({
  id:'melody-chords', level:3, tag:'Melody', title:'Melody Over Chords',
  hint:'The coloured slabs are the chords',
  lede:'The same note is beautiful over one chord and painful over the next. Melody writing is really the art of knowing which note you’re landing on when.',
  stage:{ view:'roll', cfg:{ steps:16, root:60, scale:'minor', octaves:2, contour:true } },
  blocks:[
    { h:'Chord tones are your landing pads' },
    { p:'Over any chord, the notes <em>in</em> that chord (<b>chord tones</b>) sound settled. The other scale notes (<b>non-chord tones</b>) sound like motion. Neither is better — but <b>where</b> you use them is everything:' },
    { keys:[
      'Land on a <b>chord tone</b> on strong beats and at the end of phrases. That’s what makes a melody sound “right”.',
      'Use <b>non-chord tones</b> on weak beats and in between. That’s what makes it sound alive rather than like an arpeggio.',
      'The <b>3rd</b> and <b>7th</b> of a chord are the most expressive landing notes — they carry the chord’s identity. The 5th is the safest and the dullest.' ] },
    { h:'The three ways to pass through a note' },
    { p:'<b>Passing tone</b> — step between two chord tones (E → F → G). <b>Neighbour tone</b> — step away and straight back (E → F → E). <b>Approach note</b> — arrive at your target chord tone from a semitone below on the last moment before the chord changes. That last one is the single most professional-sounding melodic habit there is.' },
    { h:'Tension notes, used on purpose' },
    { p:'Some non-chord tones are strong colours rather than passing motion. Over a minor 7th chord, the <b>9th</b> is gorgeous. Over a major chord, the <b>6th</b> is warm and the natural <b>11th</b> is a clash. Over a dominant 7th, almost anything works because the chord is already unstable — which is why solos get busy over V7.' },
    { note:{ h:'The avoid note',
      p:'On a major chord, the 4th degree sits a semitone above the 3rd and fights it. On a minor chord, the ♭6 does the same to the 5th. These aren’t forbidden — just don’t <em>hold</em> them or land on them. Pass through and keep moving.' } },
    { try:{ h:'Same melody, three treatments', p:'A four-chord minor loop is loaded underneath. Hear a melody that only lands on chord tones, one that ignores them, and one that uses approach notes.',
      build:ctx => [
        UI.chips([{label:'Chord tones only',value:'safe'},{label:'Ignoring the chords',value:'bad'},
                  {label:'With approach notes',value:'pro'},{label:'Tension notes (9ths)',value:'colour'}],
          v => ctx.load(v), 0),
        UI.btn('Chords alone', () => ctx.bedOnly())
      ] } }
  ],
  quiz:[
    { q:'Chord tones are best placed…', a:['On weak beats only','On strong beats and phrase endings','Never','Only in the bass'], c:1,
      why:'Landing on a chord tone at a strong moment is what makes a melody sound resolved. Non-chord tones do their work in between.' },
    { q:'An “approach note” is…', a:['The first note of a song','A note a semitone below your target, played just before it','A chord you approach from','A drum fill'], c:1,
      why:'A one-semitone lean into the note you actually want. Cheap to write, and it instantly sounds intentional.' },
    { q:'Which chord tone is usually the least interesting to land on?', a:['The 3rd','The 5th','The 7th','The 9th'], c:1,
      why:'The 5th is the most neutral note in the chord — safe, but it says nothing about the chord’s colour. The 3rd and 7th carry the identity.' }
  ],
  init:ctx => {
    const bed = [
      { step:0,  len:4, notes:[48,51,55,58], label:'Cm7',
        spell:['C','E\u266D','G','B\u266D'] },
      { step:4,  len:4, notes:[44,48,51,55], label:'A\u266Dmaj7',
        spell:['A\u266D','C','E\u266D','G'] },
      { step:8,  len:4, notes:[46,50,53,56], label:'B\u266D7',
        spell:['B\u266D','D','F','A\u266D'] },
      { step:12, len:4, notes:[48,51,55,58], label:'Cm7',
        spell:['C','E\u266D','G','B\u266D'] }
    ];
    let bpm = 88, which = 'safe';
    const M = {
      safe:  [[0,63,2],[2,67,2],[4,63,2],[6,68,2],[8,65,2],[10,70,2],[12,67,2],[14,63,2]],
      bad:   [[0,62,2],[2,65,2],[4,62,2],[6,65,2],[8,62,2],[10,68,2],[12,62,1],[13,65,3]],
      pro:   [[0,62,1],[1,63,2],[4,67,1],[5,68,2],[8,65,1],[9,67,2],[12,70,1],[13,72,3]],
      colour:[[0,63,2],[2,70,2],[4,72,2],[6,68,2],[8,65,2],[10,72,2],[12,70,2],[14,63,2]]
    };
    const chordAt = s => bed.find(b => s >= b.step && s < b.step + b.len);
    const role = (s, m) => {
      const c = chordAt(s); if (!c) return 'pass';
      const pcs = c.notes.map(n => T.pc(n));
      return pcs.indexOf(T.pc(m)) >= 0 ? 'chord' : 'tension';
    };
    ctx.load = k => {
      which = k; ctx.keep('which', k);
      ctx.v.setNotes(M[k].map(([step, midi, len]) => ({ step, midi, len, role:role(step, midi) })));
      const hits = M[k].filter(([s, m]) => role(s, m) === 'chord').length;
      ctx.read({ safe:'chord tones only — safe, a little plain',
                 bad:'ignoring the chords — notice the clashes',
                 pro:'approach notes into every landing',
                 colour:'9ths and colour tones over the chords' }[k] +
        '\n' + hits + ' of ' + M[k].length + ' notes are chord tones' +
        '\ngreen = chord tone · red = non-chord tone');
      ctx.play();
    };
    ctx.bedOnly = () => {
      ctx.stop(); ctx.v.playhead(-1);
      bed.forEach((b, i) => ctx.later(() => {
        A.chord(b.notes, 1.4, { spread:.05 });
        ctx.read(b.label + '\n' + b.spell.join(' '));
      }, i * 1150));
    };
    ctx.play = () => {
      ctx.stop();
      ctx.seq({ bpm, div:16, steps:16, cb:(step, t) => {
        const c = bed.find(b => b.step === step);
        if (c) A.chord(c.notes, 2.1, { when:t, spread:.03, gain:.55 });
        ctx.v.notes.filter(n => n.step === step).forEach(n =>
          A.note(n.midi + 12, 0.22 * (n.len || 1) + 0.25, { when:t, gain:.95 }));
        sch(ctx, t, () => ctx.v.playhead(step));
      } });
    };
    ctx.v.setChords(bed);
    ctx.v.onCell((s, m, added) => {
      if (!added) return;
      A.note(m + 12, .7);
      const r = role(s, m), c = chordAt(s);
      ctx.read(T.inKey(m, 'C', 'minor') + ' over ' + (c ? c.label : '\u2014') + '\n' +
        (r === 'chord' ? 'chord tone — safe landing' : 'non-chord tone — motion, keep moving'));
    });
    ctx.stage(
      UI.toggle('▶ Loop', v => { if (v) ctx.play(); else { ctx.stop(); ctx.v.playhead(-1); } }),
      UI.slider('Tempo', 60, 140, bpm, 1, v => { bpm = v; ctx.transport.bpm = v; }, v => v + ' BPM')
    );
    ctx.load(ctx.recall('which') || 'safe');
  }
});

LESSONS.push({
  id:'beatblock', level:3, tag:'Workflow', title:'A Cure for Beat-Block',
  hint:'Generate, then edit — never stare',
  lede:'Blank-project paralysis is a decision problem, not a talent problem. The fix is to remove choices until starting is trivial.',
  stage:{ view:'roll', cfg:{ steps:16, root:57, scale:'minor', octaves:2, contour:true } },
  blocks:[
    { h:'Constrain first, create second' },
    { p:'An empty project offers infinite options, and infinite options produce nothing. Before you write a note, decide three things and refuse to reconsider them: <b>key</b>, <b>tempo</b>, <b>one reference</b>. Now you’re not writing music, you’re answering a much smaller question.' },
    { h:'Five openings that always work' },
    { keys:[
      '<b>Steal the shape, not the notes.</b> Take a progression you love, write it as numerals, then use different chords with the same numerals in a different key and rhythm. Numerals aren’t copyrightable; they’re grammar.',
      '<b>Start with the bass.</b> Write four bass notes. Harmonise them afterwards — each note can be the root, 3rd or 5th of several chords, so the bass line hands you options.',
      '<b>Loop one chord.</b> Sit on a single m9 chord and put all the movement in rhythm and melody. Most trap and ambient works this way.',
      '<b>Randomise, then curate.</b> Generate something mechanical, keep the 20% that surprised you and delete the rest. Editing is far easier than inventing.',
      '<b>Write the drop’s melody first.</b> Then work backwards: the intro is that melody stripped to two notes.' ] },
    { h:'Reharmonise to get unstuck' },
    { p:'If a loop is boring but you like the melody, don’t rewrite the melody — change what’s underneath it. Swap a chord for another with the same job (vi for I, ii for IV), add a 7th or 9th, borrow a iv, or put a different note of the same chord in the bass. Same tune, new song.' },
    { note:{ h:'Finish-ability beats quality',
      p:'An 8-bar loop you finished teaches you more than a 32-bar arrangement you abandoned. Set the smallest possible target — one bar, one sound, one hook — then decide whether to continue. Momentum is the actual skill.' } },
    { try:{ h:'The idea generator', p:'Each press gives you a constrained, playable starting point: a key, a progression in numerals and a motif that fits it. Keep what surprises you.',
      build:ctx => [
        UI.btn('Generate a starting point', () => ctx.gen(), { primary:true }),
        UI.btn('Reharmonise (keep the melody)', () => ctx.reharm()),
        UI.btn('Same chords, new rhythm', () => ctx.rerhythm()),
        UI.btn('Strip it to two notes', () => ctx.strip())
      ] } }
  ],
  quiz:[
    { q:'The most reliable first move against beat-block is…', a:['Browse more sample packs','Constrain your choices before writing','Start with mixing','Learn a new plugin'], c:1,
      why:'Fewer options means faster starts. Fix key, tempo and one reference, and the blank project stops being infinite.' },
    { q:'Reharmonising means…', a:['Rewriting the melody','Changing the chords under the same melody','Transposing everything','Adding drums'], c:1,
      why:'Keep the tune, change what’s underneath. It is the cheapest way to make a tired loop feel new.' },
    { q:'Why write progressions as roman numerals?', a:['It sounds professional','They describe the shape independently of key, so you can reuse and transpose them','It’s required notation','They change the chords'], c:1,
      why:'Numerals are the grammar of a progression. The same numerals in another key with different voicings is a new piece of music built on a proven shape.' }
  ],
  init:ctx => {
    const KEYS = [{ n:'A minor', root:57, rn:'A' }, { n:'C minor', root:48, rn:'C' },
                  { n:'D minor', root:50, rn:'D' }, { n:'F\u266F minor', root:54, rn:'F\u266F' },
                  { n:'G minor', root:55, rn:'G' }];
    const PROGS = [[1,6,3,7],[1,4,6,5],[1,7,6,7],[1,6,7,1],[1,3,4,5],[1,5,6,4]];
    let cur = { key:KEYS[0], prog:PROGS[0], bpm:84, notes:[] };
    const build = () => {
      const root = cur.key.root, dia = T.diatonic(root, 'minor');
      const bed = cur.prog.map((d, i) => {
        const c = dia[d - 1];
        const cr = T.inKey(c.root, cur.key.rn, 'minor');
        return { step:i * 4, len:4, notes:c.seventh, label:T.chordName(cr, c.q7),
                 num:T.roman(c.degree, c.q7) };
      });
      ctx.v.setScale(root + 12, 'minor', 2).setChords(bed);
      ctx.bed = bed;
      return bed;
    };
    const motif = () => {
      const deg = T.SCALES.minor.steps, root = cur.key.root + 12;
      const rows = [];
      for (let o = 0; o < 2; o++) deg.forEach(s => rows.push(root + s + 12 * o));
      const shapes = [[0,2,1,4],[0,1,3,2],[2,1,0,3],[0,4,2,1]];
      const rhy = [[0,2,4,7],[0,3,6,8],[0,1,4,6],[0,2,5,7]];
      const sh = shapes[Math.floor(Math.random() * 4)], rh = rhy[Math.floor(Math.random() * 4)];
      const start = Math.floor(Math.random() * 3);
      cur.notes = sh.map((s, i) => ({ step:rh[i], midi:rows[start + s], len:2 }));
      cur.notes = cur.notes.concat(cur.notes.map(n => ({ step:n.step + 8, midi:n.midi, len:n.len })));
      ctx.v.setNotes(cur.notes);
    };
    ctx.gen = () => {
      cur.key = KEYS[Math.floor(Math.random() * KEYS.length)];
      cur.prog = PROGS[Math.floor(Math.random() * PROGS.length)];
      cur.bpm = [76,84,90,140,146][Math.floor(Math.random() * 5)];
      ctx.transport.bpm = cur.bpm;
      const bed = build(); motif();
      ctx.read(cur.key.n + '  ·  ' + cur.bpm + ' BPM\n' +
        bed.map(b => b.num).join(' – ') + '\n' + bed.map(b => b.label).join(' ') +
        '\none reference, one key, go');
      ctx.keep('cur', { key:cur.key, prog:cur.prog.slice(), bpm:cur.bpm, notes:cur.notes.slice() });
      ctx.play();
    };
    ctx.reharm = () => {
      const swap = { 1:6, 6:4, 4:2, 5:7, 3:1, 7:5, 2:4 };
      cur.prog = cur.prog.map((d, i) => i === 0 ? d : (swap[d] || d));
      const bed = build();
      ctx.v.setNotes(cur.notes);
      ctx.read('same melody, new chords\n' + bed.map(b => b.num).join(' – ') +
        '\n' + bed.map(b => b.label).join(' '));
      ctx.play();
    };
    ctx.rerhythm = () => {
      const slots = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15];
      const pick = [];
      while (pick.length < cur.notes.length) {
        const s = slots[Math.floor(Math.random() * 16)];
        if (pick.indexOf(s) < 0) pick.push(s);
      }
      pick.sort((a, b) => a - b);
      cur.notes = cur.notes.map((n, i) => ({ step:pick[i], midi:n.midi, len:n.len }));
      ctx.v.setNotes(cur.notes);
      ctx.read('same pitches, new timing\nrhythm is usually the bigger lever');
      ctx.play();
    };
    ctx.strip = () => {
      cur.notes = cur.notes.filter((n, i) => i % 3 === 0);
      ctx.v.setNotes(cur.notes);
      ctx.read('stripped to ' + cur.notes.length + ' notes\nthis is your intro');
      ctx.play();
    };
    ctx.play = () => {
      ctx.stop();
      ctx.seq({ bpm:cur.bpm, div:16, steps:16, cb:(step, t) => {
        const c = ctx.bed.find(b => b.step === step);
        if (c) A.chord(c.notes, 2.2, { when:t, spread:.04, gain:.5 });
        if (step % 4 === 0) A.click('kick', t);
        if (step % 8 === 4) A.click('snare', t);
        ctx.v.notes.filter(n => n.step === step).forEach(n =>
          A.note(n.midi, .45, { when:t, gain:.9 }));
        sch(ctx, t, () => ctx.v.playhead(step));
      } });
    };
    ctx.v.onCell((s, m, added) => {
      if (added) { A.note(m, .6); cur.notes.push({ step:s, midi:m, len:1 }); }
      else cur.notes = ctx.v.notes.slice();
    });
    ctx.stage(
      UI.toggle('▶ Loop', v => { if (v) ctx.play(); else { ctx.stop(); ctx.v.playhead(-1); } })
    );
    const back = ctx.recall('cur');
    if (back) {
      cur = { key:back.key, prog:back.prog.slice(), bpm:back.bpm, notes:back.notes.slice() };
      ctx.transport.bpm = cur.bpm;
      build(); ctx.v.setNotes(cur.notes);
      ctx.read(cur.key.n + '  \u00B7  ' + cur.bpm + ' BPM\n' + ctx.bed.map(b => b.num).join(' \u2013 '));
    } else {
      build(); motif();
      ctx.read('press generate\nconstraints first, notes second');
    }
  }
});

LESSONS.push({
  id:'challenges', level:3, tag:'Drills', title:'Challenges',
  hint:'Ear training — no looking',
  lede:'Theory you can only see is half-learned. These drills are deliberately unfair to your eyes: you have to hear it.',
  stage:{ view:'keys', cfg:{ lo:48, hi:72, labels:'none' } },
  blocks:[
    { h:'How to use these' },
    { p:'Pick a drill, listen, answer. Get it wrong and you’ll be shown the right answer with the notes lit up — that correction is where the learning actually happens. Ten minutes a day for two weeks will change how you write, more than any amount of reading.' },
    { keys:[
      '<b>Interval</b> — name the distance between two notes. The foundation of everything else.',
      '<b>Chord quality</b> — major, minor, diminished, augmented, and the 7th-chord family.',
      '<b>Progression</b> — hear four chords and name the numerals.',
      '<b>Scale</b> — identify major, minor, harmonic minor, and the modes.',
      '<b>Degree</b> — a key is established, then one note plays; name its scale degree. This is the skill that lets you transcribe melodies.' ] },
    { h:'Easy and hard' },
    { p:'In easy mode the questions stay in a comfortable register and use a small set of answers. <b>Hard mode</b> moves the root around all twelve notes, widens the register by an octave, adds the seventh-chord family, inversions, the remaining modes, and compound intervals. Work in easy until you are consistently right, then switch — the point is to recognise the <em>relationship</em>, not one memorised shape in one position.' },
    { h:'Sing it, then answer' },
    { p:'The fastest ear-training shortcut is physical: hum the two notes before you answer. Your voice knows intervals before your brain names them, and matching pitch forces you to actually hear the distance instead of guessing from timbre.' },
    { note:{ h:'A useful frustration',
      p:'Minor 3rd vs major 3rd and perfect 4th vs perfect 5th are the two pairs everyone confuses at first. If you can only reliably tell those two pairs apart, you can already work out most melodies by ear.' } },
    { try:{ h:'Run a drill', p:'Choose a type, then press listen. You can replay as many times as you like before answering.',
      build:ctx => {
        const box = UI.el('div', 'ctl');
        const wrap = UI.el('div');
        wrap.style.display = 'grid'; wrap.style.gap = '10px'; wrap.style.width = '100%';
        wrap.append(
          UI.chips([{label:'Interval',value:'ivl'},{label:'Chord quality',value:'chord'},
                    {label:'Progression',value:'prog'},{label:'Scale',value:'scale'},
                    {label:'Scale degree',value:'deg'}], v => ctx.setDrill(v), 0),
          UI.row(UI.btn('\uD83D\uDD0A Listen', () => ctx.playQ(), { primary:true }),
                 UI.btn('\u21BB Replay', () => ctx.replay()),
                 UI.btn('Next question', () => ctx.next()),
                 UI.toggle('Hard mode', v => ctx.setHard(v))),
          box);
        ctx.answers = box;
        return wrap;
      } } }
  ],
  init:ctx => {
    let drill = ctx.recall('drill') || 'ivl', q = null, hard = !!ctx.recall('hard');
    let score = ctx.recall('score') || { right:0, total:0 };
    const say = extra => ctx.read('score ' + score.right + '/' + score.total +
      '  \u00B7  ' + (hard ? 'hard' : 'easy') + (extra ? '\n' + extra : '\nlisten, then answer'));
    const rnd = a => a[Math.floor(Math.random() * a.length)];
    /* Roots move around so you learn the sound, not one fixed shape.
       Hard mode widens the register and adds inversions and voicings. */
    const EASY_ROOTS = [48, 53, 55, 57, 60];
    const ALL_ROOTS = [48,49,50,51,52,53,54,55,56,57,58,59];
    const pickRoot = () => hard
      ? Math.min(66, rnd(ALL_ROOTS) + rnd([0, 0, 12]))
      : rnd(EASY_ROOTS);

    const DRILLS = {
      ivl: () => {
        const base = pickRoot();
        const n = hard ? rnd([1,2,3,4,5,6,7,8,9,10,11,12,13,14]) : rnd([3,4,5,7,8,9,12]);
        const rn = T.MAJ_ROOT[T.pc(base)];
        return { notes:[[base], [base + n]], answer:T.ivl(n).label,
          options:T.IVL.slice(1, hard ? 15 : 13).map(i => i.label),
          show:() => {
            ctx.v.clear().mark(base, 'root').mark(Math.min(base + n, 72), 'target').apply().clearExtras();
            if (base + n <= 72) ctx.v.arc(base, base + n, T.ivl(n).short);
          },
          why:rn + ' up to ' + T.spellIvl(rn, n) + '  \u00B7  ' + n + ' semitones' };
      },
      chord: () => {
        const root = pickRoot();
        const types = hard
          ? ['maj','min','dim','aug','maj7','min7','dom7','m7b5','dim7','minMaj7']
          : ['maj','min','dim','aug'];
        const t = rnd(types);
        let ns = T.chordNotes(root, t);
        if (hard && Math.random() < 0.4) ns = T.invert(ns, 1 + Math.floor(Math.random() * 2));
        const rn = T.MAJ_ROOT[T.pc(root)];
        return { notes:[ns], answer:T.CHORDS[t].label,
          options:types.map(x => T.CHORDS[x].label),
          show:() => ctx.v.clear().marks(ns.filter(x => x <= 72), 'chord').mark(ns[0], 'root')
            .apply().clearExtras().stack(ns.filter(x => x <= 74)),
          why:T.chordName(rn, t) + '  \u00B7  ' + T.spellChord(rn, t).join(' ') +
            (ns[0] !== root ? '  (inverted)' : '') };
      },
      prog: () => {
        const opts = [[1,5,6,4],[1,6,4,5],[6,4,1,5],[1,4,5,1],[1,7,6,7]];
        const p = rnd(opts);
        const kind = Math.random() < 0.5 ? 'major' : 'minor';
        const root = hard ? rnd([48,50,53,55,57]) : 48;
        const rn = T.rootFor(root, kind);
        const dia = T.diatonic(root, kind);
        const chords = p.map(d => dia[d - 1]);
        return { notes:chords.map(c => c.notes), spaced:true,
          answer:p.map(d => T.roman(d, dia[d - 1].quality)).join(' \u2013 '),
          options:opts.map(o => o.map(d => T.roman(d, dia[d - 1].quality)).join(' \u2013 ')),
          show:() => {
            ctx.v.clear().marks(chords[0].notes, 'chord').apply().clearExtras();
            ctx.v.tag(chords.map(c => T.chordName(T.inKey(c.root, rn, kind), c.quality)).join(' '), 0, 3.4);
          },
          why:'in ' + rn + ' ' + kind + ': ' +
            chords.map(c => T.chordName(T.inKey(c.root, rn, kind), c.quality)).join(' ') };
      },
      scale: () => {
        const keys = hard
          ? ['major','minor','harmonicMinor','melodicMinor','dorian','phrygian','lydian','mixolydian','locrian','minorPent','blues']
          : ['major','minor','harmonicMinor','minorPent'];
        const k = rnd(keys);
        const root = pickRoot();
        const rn = T.rootFor(root, k);
        const ns = T.scaleNotes(root, k).concat([root + 12]);
        return { notes:ns.map(n => [n]), spaced:true, answer:T.SCALES[k].label,
          options:keys.map(x => T.SCALES[x].label),
          show:() => ctx.v.clear().marks(ns.filter(n => n <= 72), 'scale').mark(root, 'root')
            .apply().clearExtras().spelling(T.keyMap(rn, k)),
          why:rn + ' ' + T.SCALES[k].label + '  \u00B7  ' + T.spellScale(rn, k).join(' ') };
      },
      deg: () => {
        const root = hard ? rnd([48,50,53,55,57,60]) : 60;
        const d = 1 + Math.floor(Math.random() * 7);
        const step = T.SCALES.major.steps[d - 1];
        const target = root + step + (hard && Math.random() < 0.3 ? 12 : 0);
        const rn = T.MAJ_ROOT[T.pc(root)];
        const dia = T.diatonic(root, 'major');
        return { notes:[dia[0].notes, dia[4].notes, dia[0].notes, [target]], spaced:true,
          answer:'degree ' + d,
          options:[1,2,3,4,5,6,7].map(x => 'degree ' + x),
          show:() => ctx.v.clear().marks(T.scaleNotes(root, 'major').filter(n => n <= 72), 'ghost')
            .mark(root, 'root').mark(Math.min(target, 72), 'target').apply().clearExtras()
            .spelling(T.keyMap(rn, 'major')),
          why:'the key was ' + rn + ' major; the note was ' +
            T.inKey(target, rn, 'major') + ' \u2014 degree ' + d };
      }
    };

    const renderAnswers = () => {
      if (!ctx.answers) return;
      ctx.answers.innerHTML = '';
      const uniq = q.options.filter((o, i) => q.options.indexOf(o) === i);
      uniq.forEach(o => {
        const b = UI.el('button', 'chip', o);
        b.type = 'button';
        b.addEventListener('click', () => {
          if (q.done) return;
          q.done = true;
          score.total++;
          const ok = o === q.answer;
          if (ok) score.right++;
          ctx.keep('score', score);
          ctx.score(ok);
          Array.from(ctx.answers.children).forEach(c => {
            if (c.textContent === q.answer) c.style.borderColor = '#4FD1A5';
            if (c === b && !ok) c.style.borderColor = '#E23E57';
          });
          q.show();
          say((ok ? '✓ ' : '✗ ') + q.answer + '\n' + q.why);
        });
        ctx.answers.appendChild(b);
      });
    };
    ctx.playQ = () => {
      if (!q) return;
      ctx.v.labelMode('none');
      if (!q.done) ctx.v.clear().apply().clearExtras();
      const gap = q.spaced ? (q.notes.length > 6 ? 260 : 900) : 0;
      q.notes.forEach((group, i) => ctx.later(() => {
        if (group.length > 1) A.chord(group, gap ? 1.1 : 1.8, { spread:.04 });
        else A.note(group[0], gap ? .5 : 1.6, { gain:.95 });
      }, i * (gap || 700)));
    };
    ctx.replay = () => ctx.playQ();
    ctx.next = () => {
      q = DRILLS[drill]();
      renderAnswers();
      ctx.v.clear().apply().clearExtras().labelMode('none');
      say('new question — press listen');
      ctx.playQ();
    };
    ctx.setDrill = v => { drill = v; ctx.keep('drill', v); ctx.next(); };
    ctx.setHard = v => { hard = v; ctx.keep('hard', v); ctx.next(); };
    ctx.v.onKey(m => { A.note(m, .9); });
    q = DRILLS.ivl();
    ctx.later(() => renderAnswers(), 30);
    say('pick a drill and press listen');
  }
});
