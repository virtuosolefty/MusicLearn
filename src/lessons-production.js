/* ═══════════════════════════════════════════════════════════════
   LESSONS — the making-music chapters.

   These four sit inside the stages rather than after them: a bassline
   belongs with your first progression, velocity with your first groove,
   and the capstone is where drums, bass, chords and melody finally meet.
   ═══════════════════════════════════════════════════════════════ */

/* the loop every making-music lesson builds over: i – VI – III – VII in C minor,
   the progression under a very large amount of modern music */
const LOOP_CM = [
  { step:0,  len:4, notes:[48,51,55], root:36, label:'Cm',  spell:['C','E♭','G'] },
  { step:4,  len:4, notes:[44,48,51], root:32, label:'A♭', spell:['A♭','C','E♭'] },
  { step:8,  len:4, notes:[51,55,58], root:39, label:'E♭', spell:['E♭','G','B♭'] },
  { step:12, len:4, notes:[46,50,53], root:34, label:'B♭', spell:['B♭','D','F'] }
];

LESSONS.push({
  id:'bassline', tag:'Bass', title:'Basslines',
  hint:'Write the low part under the chords',
  lede:'The bass is not a quiet guitar. It is the note that tells your ear which chord it is hearing, and it is the part most beginner tracks get wrong by writing too much of it.',
  stage:{ view:'roll', cfg:{ steps:16, root:36, scale:'minor', octaves:2 } },
  blocks:[
    { h:'What the bass is actually for' },
    { p:'Two jobs, in this order. First, it <b>names the chord</b>: the lowest note is what your ear takes as the root, which is why an inversion sounds different from the same chord in root position. Second, it <b>locks to the drums</b> — bass and kick together are what people feel in their chest.' },
    { p:'Everything else (melody, movement, fills) is a distant third. A bassline that only plays the right note at the right time already works.' },
    { h:'Start with roots' },
    { p:'Under each chord, play its <b>root</b>. Four chords, four bass notes, one per bar. That is a complete, professional bassline — most house, trap and pop basslines are barely more than this.' },
    { p:'The moment that gets dull, you have three moves, in order of safety:' },
    { keys:[
      '<b>Octaves.</b> Same note, jumped an octave up or down. No new harmony, instant movement — the backbone of disco and house.',
      '<b>The 5th.</b> Root and 5th alternate. Strong and neutral, because the 5th says nothing about major or minor.',
      '<b>Passing notes.</b> A short note that walks from one root to the next, usually stepwise, usually on a weak box just before the change. It belongs to the <em>next</em> chord more than the current one.' ] },
    { h:'Rhythm: lock, then leave gaps' },
    { p:'Put a bass note where the kick is and the two fuse into one sound. Put one where the kick is not and you get a bounce. Both are valid — what does not work is bass under every box, which turns into a drone and eats the low end.' },
    { p:'A useful discipline: write the bass rhythm <em>before</em> the pitches. Tap the rhythm first, then decide which note goes at each hit.' },
    { h:'Register: lower is not better' },
    { p:'Keep the bass <b>mono</b> and mostly between <span class="k">E1</span> and <span class="k">E3</span>. Below E1 most speakers and phones reproduce nothing, so notes there use up headroom and are simply never heard. Above E3 it stops functioning as bass and starts competing with the chords.' },
    { note:{ h:'The kick and the bass are one instrument',
      p:'If they fight, you have two choices: move one of them in time so they do not land together, or duck the bass under the kick (sidechain compression). The theory decision — which notes — comes first; the mixing decision comes after.' } },
    { try:{ h:'Build one, one move at a time', p:'The chords are playing a i–VI–III–VII loop in C minor. Start with roots, then add each move and listen to what it costs.',
      build:ctx => [
        UI.chips([
          { label:'Roots only', value:'roots' },
          { label:'Roots + octaves', value:'octaves' },
          { label:'Root and 5th', value:'fifths' },
          { label:'With passing notes', value:'passing' },
          { label:'Too busy (hear the problem)', value:'busy' }
        ], v => ctx.load(v), 0),
        UI.toggle('Lock to the kick', v => ctx.setLock(v), true),
        UI.btn('Clear and write your own', () => ctx.clear())
      ] } },
    { keys:[
      'The lowest note names the chord. Get that right and the rest is decoration.',
      'Roots alone is a finished bassline. Octaves, 5ths and passing notes are the three upgrades.',
      'Write the rhythm before the pitches, and leave gaps.',
      'Mono, roughly E1–E3, and decide early whether bass and kick land together.' ] }
  ],
  quiz:[
    { q:'Under a C minor chord, the safest bass note is…', a:['E♭','G','C','B♭'], c:2,
      why:'The root. It confirms the chord your ear is already hearing. The others work, but they change how settled the chord sounds.' },
    { q:'Why is the 5th a safe bass note to alternate with the root?', a:['It is the loudest note','It says nothing about major or minor','It is always in the melody','It cancels the root'], c:1,
      why:'The 5th is the same in a major and a minor chord, so it adds movement without changing the chord’s colour.' },
    { q:'Your bass and kick sound muddy together. Which is a theory fix rather than a mixing fix?', a:['Sidechain the bass','Move one of them off the other’s box','Add reverb','Boost 60 Hz'], c:1,
      why:'Changing when the notes land is a writing decision. Sidechaining is the mixing answer to the same problem — both are legitimate, but write first.' },
    { q:'Most of a bassline’s notes should sit…', a:['Below E1','Between E1 and E3','Around middle C','Wherever the melody is'], c:1,
      why:'Below E1 is mostly inaudible on real speakers; above E3 the part stops doing the bass’s job and starts crowding the chords.' }
  ],
  init:ctx => {
    let bpm = 92, lock = ctx.recall('lock') !== false, kit = true;
    const KICK = [1,0,0,0, 0,0,1,0, 0,0,0,0, 1,0,0,0];
    const PAT = {
      roots:   [[0,36],[4,32],[8,39],[12,34]],
      octaves: [[0,36],[2,48],[4,32],[6,44],[8,39],[10,51],[12,34],[14,46]],
      fifths:  [[0,36],[3,43],[4,32],[7,39],[8,39],[11,46],[12,34],[15,41]],
      passing: [[0,36],[3,36],[4,32],[6,32],[7,34],[8,39],[11,39],[12,34],[14,34],[15,35]],
      busy:    [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].map(s =>
                 [s, LOOP_CM[Math.floor(s / 4)].root])
    };
    const rows = () => [36,38,39,41,43,44,46,48,50,51,53,55,56,58,60];
    const snap = m => rows().reduce((b, r) => Math.abs(r - m) < Math.abs(b - m) ? r : b, rows()[0]);
    ctx.v.setChords(LOOP_CM);
    ctx.load = k => {
      const ns = PAT[k].map(([step, midi]) => ({ step, midi:snap(midi), len:1 }));
      ctx.v.setNotes(ns);
      ctx.keep('pat', k);
      ctx.syncA11y && ctx.syncA11y();
      ctx.read({
        roots:   'roots only\none note per chord · always correct',
        octaves: 'roots + octaves\nmovement, no new harmony',
        fifths:  'root and 5th\nstrong, neutral, says nothing about major or minor',
        passing: 'passing notes\nshort steps into the next root',
        busy:    'a note on every box\nlisten: the low end turns into a drone'
      }[k]);
      ctx.play();
    };
    ctx.clear = () => { ctx.v.clearNotes(); ctx.syncA11y && ctx.syncA11y();
      ctx.read('empty\ntap the roll to write your own'); };
    ctx.setLock = v => { lock = v; ctx.keep('lock', v); };
    ctx.play = () => {
      ctx.stop();
      ctx.seq({ bpm, div:16, steps:16, cb:(step, t) => {
        const c = LOOP_CM.find(b => b.step === step);
        if (c) A.chord(c.notes.map(n => n + 12), 2.1, { when:t, spread:.03, gain:.4 });
        if (kit) {
          if (KICK[step]) A.click('kick', t);
          if (step === 4 || step === 12) A.click('snare', t);
          if (step % 2 === 0) A.click('hat', t, .5);
        }
        ctx.v.notes.filter(n => n.step === step).forEach(n =>
          A.note(n.midi, .5, { when: t + (lock || !KICK[step] ? 0 : 0.012), gain:1 }));
        sch(ctx, t, () => ctx.v.playhead(step));
      } });
    };
    ctx.v.onCell((s, m, added) => {
      if (added) A.note(m, .6);
      const c = LOOP_CM[Math.floor(s / 4)];
      const role = c && c.notes.concat([c.root]).some(n => T.pc(n) === T.pc(m))
        ? 'chord tone — safe' : 'outside the chord — keep it short';
      ctx.read(T.inKey(m, 'C', 'minor') + T.oct(m) + ' under ' + (c ? c.label : '—') + '\n' + role);
      ctx.keep('notes', ctx.v.notes.slice());
    });
    ctx.keepCfg = { kind:'roll', name:'Bassline', bpm:() => bpm };
    ctx.stage(
      UI.toggle('▶ Loop', v => { if (v) ctx.play(); else { ctx.stop(); ctx.v.playhead(-1); } }),
      UI.toggle('Drums', v => { kit = v; }, true),
      UI.slider('Tempo', 70, 140, bpm, 1, v => { bpm = v; ctx.transport.bpm = v; }, v => v + ' BPM')
    );
    const back = ctx.recall('notes');
    if (back && back.length) { ctx.v.setNotes(back); ctx.read('your bassline\npress loop'); }
    else ctx.load(ctx.recall('pat') || 'roots');
  }
});

LESSONS.push({
  id:'velocity', tag:'Groove', title:'Velocity and Groove',
  hint:'Same notes, different weight',
  lede:'Two producers program the identical pattern. One sounds like a drum machine and one sounds like a person. The difference is almost never the notes — it is how hard and how exactly on time each one is played.',
  stage:{ view:'grid', cfg:{ steps:16, group:4,
    lanes:[{name:'Kick',kind:'kick'},{name:'Snare',kind:'snare'},{name:'Hat',kind:'hat'}] } },
  blocks:[
    { h:'Velocity is how hard, not how loud' },
    { p:'Every note you draw carries a <b>velocity</b> from 1 to 127. It usually controls volume, but on a real instrument hitting something harder also makes it <em>brighter</em> and longer, and good samples and synths follow that. Which is why a velocity change reads as a different <em>performance</em> rather than a fader move.' },
    { p:'Default velocity in most DAWs is 100, and every note at exactly 100 is the sound people mean when they say a beat is “stiff”.' },
    { h:'Accents and ghost notes' },
    { keys:[
      '<b>Accent</b> — noticeably harder than its neighbours, around 110–127. It marks where the pattern leans.',
      '<b>Normal</b> — 90–105. The body of the pattern.',
      '<b>Ghost note</b> — deliberately weak, around 20–45. You barely hear it as a hit; you hear it as texture and forward motion. Ghost snares between the backbeats are most of what makes a drum loop feel human.' ] },
    { p:'A hat pattern of sixteen identical hits is noise. The same sixteen with a loud one on each beat, mid ones on the &s, and ghosts on the e/a is a groove.' },
    { h:'Timing: the other half' },
    { p:'<b>Swing</b> delays every second 16th by a percentage, turning even pairs into long-short. <b>Micro-timing</b> is smaller and more powerful: a few milliseconds late feels laid-back and heavy, a few early feels urgent. Drummers push hats and drag snares without being told to.' },
    { p:'Most DAWs call presets of these two things <b>groove templates</b> or <b>grooves</b>. They are doing exactly what you can do by hand: nudging velocity and timing in a repeating shape.' },
    { table:{ head:['Move','Typical setting','What it does'],
      rows:[
        ['Flat velocity','everything 100','machine-like, tiring quickly'],
        ['Accent on the beat','beat 110–120, rest 95','marks the pulse, still tidy'],
        ['Ghost notes','20–45 between hits','motion and human feel'],
        ['Velocity curve','rising over a bar','builds into the next bar'],
        ['Swing 15–25%','second 16ths late','lopes without sounding triplety'],
        ['Late snare','+8–15 ms','heavier, more relaxed'],
        ['Early hat','−5–10 ms','urgent, pushed'] ] } },
    { note:{ h:'Note length matters too',
      p:'Short notes leave air and let the next sound through; long notes glue a part together and can smother the low end. On a bass, note length is as much a groove decision as velocity — same pitches, staccato versus sustained, completely different track.' } },
    { try:{ h:'Hear the difference before you believe it', p:'One pattern. Switch how it is played — the boxes do not move.',
      build:ctx => [
        UI.chips([
          { label:'Flat 100 (robot)', value:'flat' },
          { label:'Accented', value:'accent' },
          { label:'Accents + ghost notes', value:'ghost' },
          { label:'Building curve', value:'curve' }
        ], v => ctx.setFeel(v), 0),
        UI.slider('Swing', 0, 60, 0, 5, v => ctx.setSwing(v), v => v + '%'),
        UI.slider('Snare timing', -20, 20, 0, 1, v => ctx.setPush(v), v => (v > 0 ? '+' : '') + v + ' ms')
      ] } },
    { keys:[
      'Velocity 1–127; 100 is the default, and all-100 is what “stiff” sounds like.',
      'Accent 110–127, normal 90–105, ghost 20–45.',
      'Swing is a percentage on second 16ths; micro-timing is a few milliseconds and does more.',
      'Note length is part of groove, not just an editing detail.' ] }
  ],
  quiz:[
    { q:'A ghost note is…', a:['A note with no sound','A deliberately weak hit, roughly 20–45','A note an octave down','A muted MIDI note'], c:1,
      why:'Weak enough that you feel it more than hear it. Ghost snares between the backbeats are the classic example.' },
    { q:'Why does raising velocity often change the tone, not only the volume?', a:['MIDI sends brightness','Hitting something harder is brighter, and good instruments reproduce that','It shortens the note','It is a DAW bug'], c:1,
      why:'Velocity usually maps to a filter or a different sample layer, because that is what a real hit does.' },
    { q:'Which change is smaller but usually does more for feel?', a:['Swing at 50%','A few milliseconds of timing offset','Doubling the tempo','Transposing an octave'], c:1,
      why:'Micro-timing is the difference between laid-back and urgent. Swing is the bigger, more obvious lope.' }
  ],
  init:ctx => {
    let bpm = 92, feel = ctx.recall('feel') || 'flat', swing = 0, push = 0;
    const PAT = [
      [1,0,0,0, 0,0,1,0, 0,0,0,0, 1,0,0,0],
      [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
      [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1]
    ];
    /* velocity per lane per step, 0..1 — the whole lesson in three arrays */
    const FEELS = {
      flat:   () => PAT.map(row => row.map(v => v ? .78 : 0)),
      accent: () => [
        PAT[0].map((v, s) => v ? (s % 4 === 0 ? .95 : .8) : 0),
        PAT[1].map(v => v ? .95 : 0),
        PAT[2].map((v, s) => v ? (s % 4 === 0 ? .95 : s % 2 === 0 ? .7 : .45) : 0)
      ],
      ghost:  () => [
        PAT[0].map((v, s) => v ? (s % 4 === 0 ? .95 : .8) : 0),
        PAT[1].map((v, s) => v ? .95 : (s % 4 === 2 ? .22 : 0)),
        PAT[2].map((v, s) => v ? (s % 4 === 0 ? .95 : s % 2 === 0 ? .68 : .3) : 0)
      ],
      curve:  () => [
        PAT[0].map((v, s) => v ? .6 + .35 * (s / 15) : 0),
        PAT[1].map(v => v ? .9 : 0),
        PAT[2].map((v, s) => v ? .35 + .6 * (s / 15) : 0)
      ]
    };
    let vel = FEELS[feel]();
    const paint = () => {
      PAT.forEach((row, l) => ctx.v.pattern(l, row.map((v, s) => vel[l][s] > .85 ? 2 : (vel[l][s] || v ? 1 : 0))));
      /* the hat lane's velocity shape, drawn as box height */
      ctx.v.accents(vel[2].map(x => Math.max(.12, x)));
      ctx.syncA11y && ctx.syncA11y();
    };
    ctx.setFeel = k => {
      feel = k; vel = FEELS[k](); ctx.keep('feel', k); paint();
      ctx.read({
        flat:  'every hit at 100\nnothing leans — this is the robot sound',
        accent:'accents on the beat\n120 on the pulse, 100 between',
        ghost: 'accents + ghost notes\nghost snares at ~28, ghost hats at ~38',
        curve: 'a rising velocity curve\nthe bar builds into the next one'
      }[k]);
      ctx.play();
    };
    ctx.setSwing = v => { swing = v; ctx.keep('swing', v); };
    ctx.setPush = v => { push = v; ctx.keep('push', v); };
    ctx.play = () => {
      ctx.stop();
      ctx.seq({ bpm, div:16, steps:16, cb:(step, t) => {
        const beat = 60 / bpm, sixteenth = beat / 4;
        const late = (step % 2 === 1) ? sixteenth * (swing / 100) : 0;
        for (let l = 0; l < 3; l++) {
          const v = vel[l][step];
          if (!v) continue;
          const off = late + (l === 1 ? push / 1000 : 0);
          A.click(['kick','snare','hat'][l], t + off, v);
        }
        sch(ctx, t, () => {
          ctx.v.playhead(step);
          const v = vel[2][step];
          if (v) ctx.read('step ' + (step + 1) + '  ·  hat velocity ' + Math.round(v * 127) +
            (v < .5 ? '  (ghost)' : v > .85 ? '  (accent)' : ''));
        });
      } });
    };
    ctx.keepCfg = { kind:'grid', kinds:['kick','snare','hat'], name:'Groove', bpm:() => bpm };
    ctx.stage(
      UI.toggle('▶ Play', v => { if (v) ctx.play(); else { ctx.stop(); ctx.v.playhead(-1); } }),
      UI.slider('Tempo', 70, 150, bpm, 1, v => { bpm = v; ctx.transport.bpm = v; }, v => v + ' BPM')
    );
    ctx.v.onCell(() => {});
    ctx.setFeel(feel);
  }
});

LESSONS.push({
  id:'eightbar', tag:'Build', title:'Build an 8-Bar Idea',
  hint:'Four layers, one loop, exported',
  lede:'Everything so far, in one place. Drums, bass, chords and a melody — the smallest thing that is recognisably a piece of music rather than an exercise.',
  stage:{ view:'roll', cfg:{ steps:16, root:60, scale:'minor', octaves:2, contour:true } },
  blocks:[
    { h:'The order that works' },
    { p:'Layers are easiest to write from the bottom up, because each one gives the next its constraints:' },
    { keys:[
      '<b>1 · Drums.</b> Kick and snare first. Hats last, and only as much as the track needs.',
      '<b>2 · Chords.</b> Four of them, one per bar, from one key. You already know a shape that works.',
      '<b>3 · Bass.</b> The roots, locked to the kick. Add an octave or a passing note only if it is dull.',
      '<b>4 · Melody.</b> A short motif over the top, landing on chord tones on strong beats.' ] },
    { p:'Written in this order, the melody is the only part you have to be clever about, and by then it is a small decision rather than a blank page.' },
    { h:'What makes eight bars feel finished' },
    { p:'Two four-bar halves, where the second answers the first. Change <em>one</em> thing in bars 5–8: the last chord, the melody’s ending, an extra drum layer, or a bar of silence before it loops. One change is a phrase; several changes are a new section.' },
    { note:{ h:'This is the unit of modern production',
      p:'Most tracks are an 8-bar idea repeated with layers taken away and put back. Learning to finish eight bars is worth more than learning to start thirty-two.' } },
    { h:'Your task' },
    { keys:[
      'Keep the chords and the drums that are loaded.',
      'Write a melody of <b>six notes or fewer</b> in the first four bars.',
      'Repeat it in bars 5–8 with <b>one</b> change — a different last note is enough.',
      'Land on a chord tone at the start of each bar, and leave at least one full beat of silence somewhere.',
      'Export the whole loop as MIDI and open it in your DAW.' ] },
    { try:{ h:'Build it', p:'Tap the roll to write your melody. Layers can be muted while you work, and the export contains all four.',
      build:ctx => [
        UI.btn('Give me a starting motif', () => ctx.seed()),
        UI.btn('Copy bars 1–4 into 5–8', () => ctx.copyHalf()),
        UI.btn('Vary the ending', () => ctx.varyEnd()),
        UI.btn('Check my 8 bars', () => ctx.check(), { primary:true }),
        UI.btn('↓ Export the full loop as MIDI', () => ctx.exportAll())
      ] } }
  ],
  quiz:[
    { q:'Writing order that gives each layer its constraints…', a:['Melody, chords, bass, drums','Drums, chords, bass, melody','Chords, melody, drums, bass','Bass, melody, drums, chords'], c:1,
      why:'Bottom up. By the time you reach the melody, the key, the rhythm and the landing notes are all already decided.' },
    { q:'To make 8 bars feel like a phrase rather than a loop of 4, you should…', a:['Change everything in bars 5–8','Change one thing in bars 5–8','Add a key change','Double the tempo'], c:1,
      why:'One change reads as an answer to the first half. Several changes read as a different section.' }
  ],
  init:ctx => {
    let bpm = 90, mute = { drums:false, bass:false, chords:false };
    const KICK = [1,0,0,0, 0,0,1,0, 0,0,0,0, 1,0,0,0];
    const BASS = [[0,36],[4,32],[8,39],[12,34]];
    ctx.v.setChords(LOOP_CM);
    const rows = [60,62,63,65,67,68,70,72,74,75,77,79,80,82,84];
    ctx.seed = () => {
      const shape = [[0,63],[2,67],[4,65],[7,63]];
      ctx.v.setNotes(shape.map(([step, midi]) => ({ step, midi, len:1 })));
      ctx.syncA11y && ctx.syncA11y();
      ctx.read('a four-note motif in bars 1–2\nnow answer it in bars 5–8');
      ctx.play();
    };
    ctx.copyHalf = () => {
      const first = ctx.v.notes.filter(n => n.step < 8);
      ctx.v.setNotes(first.concat(first.map(n => ({ step:n.step + 8, midi:n.midi, len:n.len }))));
      ctx.syncA11y && ctx.syncA11y();
      ctx.read('bars 1–4 copied into 5–8\nnow change one thing');
      ctx.play();
    };
    ctx.varyEnd = () => {
      const ns = ctx.v.notes.slice().sort((a, b) => a.step - b.step);
      if (!ns.length) return ctx.read('write something first');
      const last = ns[ns.length - 1];
      const i = rows.indexOf(last.midi);
      last.midi = rows[Math.max(0, Math.min(rows.length - 1, i + (Math.random() < .5 ? -2 : 2)))];
      ctx.v.setNotes(ns);
      ctx.syncA11y && ctx.syncA11y();
      ctx.read('last note moved\nthat alone turns a loop into a phrase');
      ctx.play();
    };
    /* the checklist from the lesson, actually checked */
    ctx.check = () => {
      const ns = ctx.v.notes.slice().sort((a, b) => a.step - b.step);
      const first = ns.filter(n => n.step < 8), second = ns.filter(n => n.step >= 8);
      const onChordTone = ns.filter(n => {
        const c = LOOP_CM[Math.floor(n.step / 4)];
        return c && c.notes.some(x => T.pc(x) === T.pc(n.midi)) && n.step % 4 === 0;
      }).length;
      const barStarts = ns.filter(n => n.step % 4 === 0).length;
      const gaps = [];
      for (let s = 0; s < 16; s++) if (!ns.some(n => n.step === s)) gaps.push(s);
      let run = 0, best = 0;
      for (let s = 0; s < 16; s++) { run = gaps.indexOf(s) >= 0 ? run + 1 : 0; best = Math.max(best, run); }
      const lines = [
        (first.length ? '✓' : '✗') + ' something in bars 1–4 (' + first.length + ' notes)',
        (first.length && first.length <= 6 ? '✓' : '✗') + ' six notes or fewer in the first half',
        (second.length ? '✓' : '✗') + ' an answer in bars 5–8 (' + second.length + ' notes)',
        (barStarts && onChordTone === barStarts ? '✓' : '✗') +
          ' every bar starts on a chord tone (' + onChordTone + '/' + barStarts + ')',
        (best >= 4 ? '✓' : '✗') + ' at least one full beat of silence (longest gap: ' + best + ' boxes)'
      ];
      const done = lines.filter(l => l[0] === '✓').length;
      ctx.read(lines.join('\n'));
      ctx.score(done === lines.length);
      ctx.hint(done === lines.length
        ? 'All five — export it and keep it.'
        : done + ' of 5. The readout says which.');
    };
    ctx.exportAll = () => {
      if (typeof STUDIO === 'undefined') return;
      const step = STUDIO.PPQ / 4, out = [];
      LOOP_CM.forEach(c => c.notes.forEach(n =>
        out.push({ note:n + 12, t:c.step * step, dur:c.len * step - 20, vel:78 })));
      BASS.forEach(([s, m]) => out.push({ note:m, t:s * step, dur:step * 3.5, vel:105 }));
      KICK.forEach((v, s) => { if (v) out.push({ note:STUDIO.DRUM.kick, t:s * step, dur:step / 2, vel:110 }); });
      [4, 12].forEach(s => out.push({ note:STUDIO.DRUM.snare, t:s * step, dur:step / 2, vel:112 }));
      for (let s = 0; s < 16; s += 2) out.push({ note:STUDIO.DRUM.hat, t:s * step, dur:step / 3, vel:70 });
      ctx.v.notes.forEach(n => out.push({ note:n.midi, t:n.step * step, dur:(n.len || 1) * step - 12, vel:100 }));
      const okDl = STUDIO.download(STUDIO.midi(out, { bpm, name:'8-bar idea' }), 'musiclearn-8-bar-idea.mid');
      ctx.read(okDl
        ? 'exported: drums, bass, chords and your melody\nopen it in your DAW'
        : 'downloads are blocked in this viewer\nopen the site or your local copy to export');
    };
    ctx.play = () => {
      ctx.stop();
      ctx.seq({ bpm, div:16, steps:16, cb:(step, t) => {
        if (!mute.chords) {
          const c = LOOP_CM.find(b => b.step === step);
          if (c) A.chord(c.notes.map(n => n + 12), 2.2, { when:t, spread:.03, gain:.38 });
        }
        if (!mute.bass) { const b = BASS.find(x => x[0] === step); if (b) A.note(b[1], .55, { when:t }); }
        if (!mute.drums) {
          if (KICK[step]) A.click('kick', t);
          if (step === 4 || step === 12) A.click('snare', t);
          if (step % 2 === 0) A.click('hat', t, step % 4 === 0 ? .8 : .45);
        }
        ctx.v.notes.filter(n => n.step === step).forEach(n =>
          A.note(n.midi, .3 * (n.len || 1) + .25, { when:t, gain:.95 }));
        sch(ctx, t, () => ctx.v.playhead(step));
      } });
    };
    ctx.v.onCell((s, m, added) => {
      if (added) A.note(m, .6);
      ctx.keep('notes', ctx.v.notes.slice());
      const c = LOOP_CM[Math.floor(s / 4)];
      ctx.read(T.inKey(m, 'C', 'minor') + T.oct(m) + ' over ' + (c ? c.label : '—') + '\n' +
        (c && c.notes.some(x => T.pc(x) === T.pc(m)) ? 'chord tone — good landing' : 'not in the chord — pass through it'));
    });
    ctx.keepCfg = { kind:'roll', name:'8-bar idea', bpm:() => bpm };
    ctx.stage(
      UI.toggle('▶ Loop', v => { if (v) ctx.play(); else { ctx.stop(); ctx.v.playhead(-1); } }),
      UI.toggle('Drums', v => { mute.drums = !v; }, true),
      UI.toggle('Bass', v => { mute.bass = !v; }, true),
      UI.toggle('Chords', v => { mute.chords = !v; }, true)
    );
    const back = ctx.recall('notes');
    if (back && back.length) { ctx.v.setNotes(back); ctx.read('your 8 bars\npress loop, or check them'); }
    else ctx.read('empty roll\nchords and drums are already playing — add a melody');
  }
});

LESSONS.push({
  id:'structure', tag:'Arrangement', title:'Song Structure',
  hint:'16 bars across, one layer per row',
  lede:'A track is an 8-bar idea with things taken away and put back. Arrangement is mostly deciding what is missing.',
  stage:{ view:'grid', cfg:{ steps:16, group:4,
    lanes:[{name:'Drums',kind:'kick'},{name:'Bass',kind:'kick'},{name:'Chords',kind:'hat'},{name:'Melody',kind:'hat'}] } },
  blocks:[
    { h:'Read the grid differently here' },
    { p:'Each box is <b>one bar</b>, not one 16th, and each row is a <b>layer</b>. Sixteen bars across, four layers down: that is an arrangement, and it is the same picture your DAW shows you zoomed out.' },
    { h:'Sections' },
    { table:{ head:['Section','Usual length','What it does','Layers'],
      rows:[
        ['Intro','4–8 bars','establishes the loop','1–2'],
        ['Verse','8–16 bars','room for a vocal or the main idea','2–3'],
        ['Build','4–8 bars','tension, no low end','rising'],
        ['Chorus / drop','8–16 bars','the payoff','all of them'],
        ['Breakdown','4–8 bars','contrast, strips back','1–2'],
        ['Outro','4–8 bars','removes layers','falling'] ] } },
    { p:'Lengths are almost always <b>4, 8 or 16 bars</b>. The reason is the same as in a melody: the ear counts in twos and fours, so an odd-length section registers as a mistake unless you make it obviously deliberate.' },
    { h:'Arrangement is subtraction' },
    { p:'Beginners arrange by adding new material until something interesting happens. Producers arrange by writing one strong loop and then <em>removing</em> parts of it, so the moment everything comes back feels enormous. The chorus is not louder because of the mix — it is louder because the bar before it had almost nothing in it.' },
    { keys:[
      '<b>Drop a layer</b> to create a section boundary. The most common: bass out for four bars, bass back in on the drop.',
      '<b>Silence is a transition.</b> One beat of nothing before a chorus does more than any sweep.',
      '<b>A fill marks the join.</b> The last bar before a new section changes the drums.',
      '<b>Keep one constant.</b> Something should run through everything, or the sections stop sounding like the same song.' ] },
    { note:{ h:'The path from 8 bars to a track',
      p:'Loop your 8 bars four times. Delete layers from the first pass to make an intro, strip the third pass to make a breakdown, and put everything back for the fourth. That is a 32-bar arrangement made entirely of subtraction — and it is genuinely how a lot of released music is built.' } },
    { try:{ h:'Arrange 16 bars', p:'Tap boxes to turn a layer on or off in that bar. Load a shape, then take something away and hear the difference.',
      build:ctx => [
        UI.chips([
          { label:'Intro → verse → chorus', value:'pop' },
          { label:'Build → drop (dance)', value:'dance' },
          { label:'Loop with a breakdown', value:'break' },
          { label:'Everything, all the time', value:'flat' }
        ], v => ctx.load(v), 0),
        UI.btn('Clear and arrange it yourself', () => ctx.clear())
      ] } },
    { keys:[
      'One box = one bar; one row = one layer.',
      'Sections come in 4, 8 or 16 bars.',
      'Arrange by taking away, not by adding new material.',
      'Mark the joins: a fill, a gap, or a layer appearing.' ] }
  ],
  quiz:[
    { q:'Why do sections almost always last 4, 8 or 16 bars?', a:['MIDI requires it','The ear counts in twos and fours','DAWs cannot do otherwise','It saves CPU'], c:1,
      why:'Phrasing is grouped in twos and fours all the way up. An odd-length section sounds like a slip unless it is clearly on purpose.' },
    { q:'The most reliable way to make a chorus feel big is…', a:['Raise its volume','Strip the bar before it','Add more reverb','Change key'], c:1,
      why:'Contrast. A near-empty bar makes the full arrangement that follows sound enormous without touching a fader.' },
    { q:'“Arrangement is subtraction” means…', a:['Delete your worst ideas','Write one strong loop, then remove parts to create sections','Use fewer instruments overall','Shorten the track'], c:1,
      why:'One good loop plus a plan for what is missing when gets you a full arrangement.' }
  ],
  init:ctx => {
    let bpm = 110;
    const SHAPES = {
      pop: [
        [0,0,0,0, 1,1,1,1, 1,1,1,1, 1,1,1,1],
        [0,0,0,0, 0,0,0,0, 1,1,1,1, 1,1,1,1],
        [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1],
        [0,0,0,0, 0,0,0,0, 0,0,0,0, 1,1,1,1]
      ],
      dance: [
        [1,1,1,1, 1,1,1,1, 1,1,1,0, 1,1,1,1],
        [1,1,1,1, 0,0,0,0, 0,0,0,0, 1,1,1,1],
        [0,0,0,0, 1,1,1,1, 1,1,1,0, 1,1,1,1],
        [0,0,0,0, 0,0,0,0, 1,1,1,0, 1,1,1,1]
      ],
      break: [
        [1,1,1,1, 1,1,1,1, 0,0,0,0, 1,1,1,1],
        [1,1,1,1, 1,1,1,1, 0,0,0,0, 1,1,1,1],
        [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1],
        [0,0,0,0, 1,1,1,1, 0,0,0,0, 1,1,1,1]
      ],
      flat: [0,1,2,3].map(() => new Array(16).fill(1))
    };
    const SECTION = s => s < 4 ? 'bars 1–4' : s < 8 ? 'bars 5–8' : s < 12 ? 'bars 9–12' : 'bars 13–16';
    ctx.load = k => {
      SHAPES[k].forEach((row, l) => ctx.v.pattern(l, row));
      ctx.keep('shape', k);
      ctx.syncA11y && ctx.syncA11y();
      ctx.read({
        pop:  'intro → verse → chorus\nlayers arrive one section at a time',
        dance:'build → drop\nbass out for the build, everything back on bar 13',
        break:'loop with a breakdown\nbars 9–12 lose the rhythm section',
        flat: 'everything, all 16 bars\nnothing to arrive — listen to how flat it feels'
      }[k]);
      ctx.play();
    };
    ctx.clear = () => { ctx.v.clearAll(); ctx.syncA11y && ctx.syncA11y();
      ctx.read('empty arrangement\ntap boxes: a box is one bar'); };
    /* each bar of the arrangement plays one bar of the loop */
    ctx.play = () => {
      ctx.stop();
      ctx.seq({ bpm:bpm, div:1, steps:16, cb:(bar, t) => {
        const on = l => ctx.v.state[l][bar];
        const beat = 60 / bpm;
        for (let b = 0; b < 4; b++) {
          const tb = t + b * beat;
          if (on(0)) {
            A.click('kick', tb, b === 0 ? 1 : .85);
            if (b % 2 === 1) A.click('snare', tb, .9);
            A.click('hat', tb + beat / 2, .4);
          }
          if (on(1) && b % 2 === 0) A.note(LOOP_CM[bar % 4].root, .7, { when:tb, gain:.9 });
        }
        if (on(2)) A.chord(LOOP_CM[bar % 4].notes.map(n => n + 12), beat * 3.6,
          { when:t, spread:.03, gain:.34 });
        if (on(3)) [0, 1.5, 2.5].forEach((b, i) =>
          A.note([75, 70, 72][i], .45, { when:t + b * beat, gain:.85 }));
        sch(ctx, t, () => {
          ctx.v.playhead(bar);
          const layers = [0,1,2,3].filter(on).length;
          ctx.read('bar ' + (bar + 1) + ' of 16  ·  ' + SECTION(bar) +
            '\n' + layers + ' of 4 layers playing');
        });
      } });
    };
    ctx.keepCfg = { kind:'grid', kinds:['kick','kick','hat','hat'], name:'Arrangement', bpm:() => bpm };
    ctx.stage(
      UI.toggle('▶ Play 16 bars', v => { if (v) ctx.play(); else { ctx.stop(); ctx.v.playhead(-1); } }),
      UI.slider('Tempo', 80, 150, bpm, 1, v => { bpm = v; ctx.transport.bpm = v; }, v => v + ' BPM')
    );
    ctx.v.onCell(() => { ctx.keep('arr', ctx.v.state.map(r => r.slice())); });
    const back = ctx.recall('arr');
    if (back) { back.forEach((row, l) => ctx.v.pattern(l, row)); ctx.read('your arrangement\npress play'); }
    else ctx.load(ctx.recall('shape') || 'pop');
  }
});
