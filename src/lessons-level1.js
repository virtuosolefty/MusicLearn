/* ═══════════════════════════════════════════════════════════════
   LESSONS — Level 1 · Fundamentals
   ═══════════════════════════════════════════════════════════════ */
const LESSONS = [];
/* schedule a visual exactly when its audio lands */
const sch = (ctx, t, fn) => ctx.later(fn, Math.max(0, (t - A.now()) * 1000));
const MID = 60; // middle C

LESSONS.push({
  id:'grid', level:1, tag:'Rhythm', title:'The Grid',
  hint:'Tap the pads to build a beat',
  lede:'Before any note has a name, music is divided into boxes. Learn to read the boxes and half of “where do I put this?” disappears.',
  stage:{ view:'grid', cfg:{ steps:16, group:4,
    lanes:[{name:'Kick',kind:'kick'},{name:'Snare',kind:'snare'},{name:'Hat',kind:'hat'}] } },
  blocks:[
    { h:'Bars, beats, boxes' },
    { p:'A <b>bar</b> is one full lap of the loop. In <span class="k">4/4</span> — the time signature behind almost all pop, hip-hop and reggaetón — a bar holds <b>4 beats</b>. That’s the pulse you nod your head to.' },
    { p:'Your DAW then chops each beat into 4 smaller boxes, so one bar is <b>16 boxes</b>. Those boxes are <b>16th notes</b>. The grid on the stage above is exactly one bar: four groups of four.' },
    { p:'Producers count it out loud like this: <span class="k a">1 e &amp; a  2 e &amp; a  3 e &amp; a  4 e &amp; a</span>. The numbers are beats; <em>e</em>, <em>&amp;</em> and <em>a</em> are the three boxes in between. When someone says “put the hat on the &amp;”, they mean the third box of a beat.' },
    { table:{ head:['Name','Boxes per bar','Counted as','Feels'],
      rows:[
        ['Whole note','1 (holds all bar)','1 – – –','a pad, a drone'],
        ['Quarter note','4','1 2 3 4','the walking pulse'],
        ['8th note','8','1 & 2 & 3 & 4 &','steady hats'],
        ['16th note','16','1 e & a 2 e & a…','trap hats, fast rolls'],
        ['Triplet','12','1-trip-let 2-trip-let…','swung, rolling'] ] } },
    { h:'Tempo is just how fast the boxes go by' },
    { p:'<b>BPM</b> = beats per minute, so it counts the <em>beats</em>, not the boxes. At 120 BPM a beat lasts half a second and a 16th box lasts an eighth of a second. Genre gives you a rough home: boom-bap 85–95, trap 130–150 (but written so it <em>feels</em> like 65–75), reggaetón 90–100, house 120–128.' },
    { try:{ h:'Build one bar', p:'The classic starting point is loaded: kick on beats 1 and 3, snare on 2 and 4, hats on every 8th. Tap any pad in the 3D grid to add or remove a hit, then press play and move the tempo around.',
      build:ctx => [
        UI.btn('Reset to the classic', () => ctx.preset('classic')),
        UI.btn('Clear the grid', () => ctx.preset('clear')),
        UI.btn('Trap hats (16ths)', () => ctx.preset('traphats'))
      ] } },
    { keys:[
      'One bar of 4/4 = 4 beats = 16 boxes of a 16th note each.',
      'Count <span class="k a">1 e &amp; a</span> and you can name any box out loud.',
      'BPM counts beats, not boxes — the same pattern at 140 BPM is a different genre than at 90.',
      'Nothing about pitch matters yet. Rhythm is its own layer and it carries most of a beat’s identity.' ] }
  ],
  quiz:[
    { q:'How many 16th-note boxes are in two bars of 4/4?', a:['16','24','32','64'], c:2,
      why:'16 boxes per bar × 2 bars = 32. Most loops you make will be 2, 4 or 8 bars long.' },
    { q:'A producer says “move that clap to the &amp; of 3”. Which box is that?', a:['Box 9','Box 10','Box 11','Box 12'], c:2,
      why:'Beat 3 starts at box 9, so 3 = 9, 3e = 10, 3& = 11, 3a = 12. The “&” is always the halfway box of a beat.' },
    { q:'At 120 BPM, how long is one beat?', a:['0.25 s','0.5 s','1 s','2 s'], c:1,
      why:'60 ÷ 120 = 0.5 seconds per beat. A 16th box is a quarter of that — 0.125 s.' }
  ],
  init:ctx => {
    const CLASSIC = [
      [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
      [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
      [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0]
    ];
    /* every route into the grid — pad, preset, accessible button — ends here,
       so the saved pattern and the button mirror can never fall behind it */
    const sync = () => {
      ctx.keep('pattern', ctx.v.state.map(r => r.slice()));
      ctx.syncA11y();
      if (ctx.contentChanged) ctx.contentChanged();
    };
    ctx.saveInstrument = sync;
    ctx.preset = kind => {
      ctx.v.clearAll();
      if (kind === 'classic') CLASSIC.forEach((row, l) => ctx.v.pattern(l, row));
      if (kind === 'traphats') {
        CLASSIC.forEach((row, l) => ctx.v.pattern(l, row));
        ctx.v.pattern(2, new Array(16).fill(1));
      }
      sync();
    };
    CLASSIC.forEach((row, l) => ctx.v.pattern(l, row));
    let bpm = 96;
    const kinds = ['kick','snare','hat'];
    const play = on => {
      if (!on) { ctx.stop(); ctx.v.playhead(-1); ctx.read('stopped'); return; }
      ctx.seq({ bpm, div:16, steps:16, cb:(step, t) => {
        for (let l = 0; l < 3; l++) if (ctx.v.state[l][step]) A.click(kinds[l], t);
        sch(ctx, t, () => {
          ctx.v.playhead(step);
          for (let l = 0; l < 3; l++) if (ctx.v.state[l][step]) ctx.v.hit(l, step);
          const beat = Math.floor(step / 4) + 1, sub = ['','e','&','a'][step % 4];
          ctx.read('bar 1  ·  ' + beat + sub + '\nstep ' + (step + 1) + '/16  ·  ' + bpm + ' BPM');
        });
      } });
    };
    ctx.stage(
      UI.toggle('▶ Play', play),
      UI.slider('Tempo', 60, 170, bpm, 1, v => { bpm = v; ctx.transport.bpm = v; }, v => v + ' BPM')
    );
    const saved = ctx.recall('pattern');
    if (saved) saved.forEach((row, l) => ctx.v.pattern(l, row));
    ctx.v.onCell(sync);
    ctx.keepCfg = { kind:'grid', kinds:['kick','snare','hat'], name:'Beat', bpm:() => bpm };
    ctx.read('one bar of 4/4\n16 boxes  \u00B7  press play');
  }
});

LESSONS.push({
  id:'accents', level:1, tag:'Rhythm', title:'Strong and Weak Beats',
  hint:'Height = how strong the box feels',
  lede:'Not every box carries the same weight. The grid has a built-in gravity, and every genre is a different argument with it.',
  stage:{ view:'grid', cfg:{ steps:16, group:4,
    lanes:[{name:'Kick',kind:'kick'},{name:'Snare',kind:'snare'},{name:'Hat',kind:'hat'}] } },
  blocks:[
    { h:'The grid is not flat' },
    { p:'In 4/4, beat <b>1</b> is the heaviest — the <b>downbeat</b>. Beat 3 is the second heaviest. Beats 2 and 4 are lighter, and everything in between (the <em>e</em>s, <em>&amp;</em>s and <em>a</em>s) is lighter still. The tall columns on the stage are the strong boxes; the flat ones are weak.' },
    { p:'That ranking is why a kick on 1 sounds like an anchor and the same kick on the <em>a</em> of 4 sounds like it’s falling forward into the next bar.' },
    { h:'Landing on it, or against it' },
    { p:'<b>On the beat</b> = hitting the tall boxes. Solid, obvious, danceable. <b>Off-beat</b> = hitting the short boxes. <b>Syncopation</b> is the trick of deliberately accenting weak boxes so the listener’s body leans. Reggaetón’s dembow, funk guitar, and every rolling trap hat pattern are syncopation.' },
    { p:'The <b>backbeat</b> — snare on 2 and 4 — is so common in pop and rock that it reads as neutral. Hip-hop keeps it but moves the kick around it; reggaetón replaces it with a 3+3+2 pattern that pushes against the pulse all bar.' },
    { note:{ h:'Why this matters more than it sounds like it should',
      p:'A “weak” beat isn’t a beat you should avoid — it’s a beat that <em>costs</em> something when you hit it. Anticipation, groove and swing are all made of borrowed weight. If your beat feels stiff, you are probably only hitting tall boxes.' } },
    { try:{ h:'Feel the same notes move', p:'Three patterns, same kit, same tempo. Listen to where your head nods.',
      build:ctx => UI.chips([
        { label:'Straight (on the beat)', value:'straight' },
        { label:'Backbeat', value:'back' },
        { label:'Dembow (syncopated)', value:'dembow' },
        { label:'Trap (rolling)', value:'trap' }
      ], v => ctx.load(v), ctx.recall('kit') || 'straight') } },
    { keys:[
      'Strength order in 4/4: <b>1</b> &gt; 3 &gt; 2 and 4 &gt; the &amp;s &gt; the <em>e</em>s and <em>a</em>s.',
      'Syncopation = accenting a weak box on purpose.',
      'Groove comes from the conversation between strong and weak, not from more notes.' ] }
  ],
  quiz:[
    { q:'Which beat in a 4/4 bar is the strongest?', a:['1','2','3','4'], c:0,
      why:'Beat 1, the downbeat. Beat 3 is a secondary strong beat — that’s why a two-kick pattern usually lands on 1 and 3.' },
    { q:'A snare on beats 2 and 4 is called…', a:['Syncopation','The backbeat','A triplet','A downbeat'], c:1,
      why:'The backbeat. It emphasises the weaker beats, which is why it drives so well — mild, permanent syncopation.' },
    { q:'Your loop feels stiff and “square”. The most likely cause is…', a:['Tempo too slow','Everything lands on strong boxes','Too few instruments','Wrong key'], c:1,
      why:'If every hit is on a tall box there is no tension against the pulse. Move one element to an off-beat box and the loop starts to breathe.' }
  ],
  init:ctx => {
    ctx.v.accents([1,0,.25,0, .55,0,.25,0, .8,0,.25,0, .55,0,.25,0]);
    const P = {
      straight:[[1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],
                [0,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
                [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0]],
      back:    [[1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
                [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
                [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0]],
      dembow:  [[1,0,0,0, 0,0,1,0, 0,0,0,0, 0,0,1,0],
                [0,0,0,1, 0,0,1,0, 0,0,0,1, 0,0,1,0],
                [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0]],
      trap:    [[1,0,0,0, 0,0,1,0, 0,0,0,0, 1,0,0,0],
                [0,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
                [1,0,1,1, 1,0,1,0, 1,1,1,1, 1,0,1,1]]
    };
    let bpm = 92;
    ctx.load = k => {
      P[k].forEach((row, l) => ctx.v.pattern(l, row));
      ctx.keep('kit', k);
      if (ctx.contentChanged) ctx.contentChanged();
      ctx.read(k + ' pattern loaded');
    };
    ctx.v.onCell(() => {});
    ctx.load(ctx.recall('kit') || 'straight');
    const play = on => {
      if (!on) { ctx.stop(); ctx.v.playhead(-1); return; }
      ctx.seq({ bpm, div:16, steps:16, cb:(step, t) => {
        const kinds = ['kick','snare','hat'];
        for (let l = 0; l < 3; l++) if (ctx.v.state[l][step]) A.click(kinds[l], t);
        sch(ctx, t, () => {
          ctx.v.playhead(step);
          const w = [1,0,.25,0, .55,0,.25,0, .8,0,.25,0, .55,0,.25,0][step];
          ctx.read('step ' + (step + 1) + '/16\nmetric weight ' + w.toFixed(2));
        });
      } });
    };
    ctx.stage(UI.toggle('▶ Play', play),
      UI.slider('Tempo', 60, 160, bpm, 1, v => { bpm = v; ctx.transport.bpm = v; }, v => v + ' BPM'));
    ctx.keepCfg = { kind:'grid', kinds:['kick','snare','hat'], name:'Groove', bpm:() => bpm };
  }
});

LESSONS.push({
  id:'meter', level:1, tag:'Rhythm', title:'Simple and Compound Meter',
  hint:'Apple taps or strawberry taps',
  lede:'4/4 divides each beat into 2. 6/8 divides it into 3. That single difference is why some music walks and some music rolls.',
  stage:{ view:'grid', cfg:{ steps:12, group:3,
    lanes:[{name:'Pulse',kind:'click'},{name:'Kick',kind:'kick'},{name:'Hat',kind:'hat'}] } },
  blocks:[
    { h:'The idea in one line' },
    { p:'<b>Meter</b> is how a bar’s beats are organised, and only two things about it ever change: <b>how many beats</b> are in the bar, and whether each beat splits into <b>2</b> or into <b>3</b>. Split by 2 = <b>simple</b>. Split by 3 = <b>compound</b>. Everything below is notation for those two facts.' },
    { h:'Reading a time signature' },
    { p:'The bottom number says <b>which note value one unit is</b> — 4 means a quarter note, 8 means an 8th note. The top number counts <b>how many of those units are in a bar</b>.' },
    { p:'In <b>simple</b> meters that unit <em>is</em> the beat, so the top number is also the beat count: <span class="k">3/4</span> is three quarter-note beats, a waltz. In <b>compound</b> meters it is not. <span class="k">6/8</span> holds six 8th notes, but they group in threes, so the bar has <b>two beats</b> and each beat is a <b>dotted quarter</b>. Same for <span class="k">9/8</span> (three dotted-quarter beats) and <span class="k">12/8</span> (four).' },
    { small:'So "top number = beats per bar" is a simple-meter rule, not a universal one. In compound meter, divide the top number by 3 to get the beats. <a href="https://viva.pressbooks.pub/openmusictheory/chapter/compound-meters-and-time-signatures/" target="_blank" rel="noopener">Open Music Theory: compound meters</a>' },
    { h:'Simple vs compound' },
    { p:'<b>Simple meter</b> splits each beat into <b>2</b>: 4/4, 3/4, 2/4. Counting is <em>1 &amp; 2 &amp;</em>. <b>Compound meter</b> splits each beat into <b>3</b>: 6/8, 9/8, 12/8. Counting is <em>1-la-li 2-la-li</em>. Compound has a rolling, galloping feel — think drill triplet flows, Afrobeats, a lot of gospel and most swung beats.' },
    { table:{ head:['Signature','Type','Beats per bar','Feel / where you hear it'],
      rows:[
        ['4/4','Simple','4, split in 2','almost everything'],
        ['3/4','Simple','3, split in 2','waltz, ballads'],
        ['6/8','Compound','2, split in 3','Afro rhythms, ballads, drill rolls'],
        ['12/8','Compound','4, split in 3','blues shuffle, gospel'],
        ['5/4 · 7/8','Odd','5 or 7','prog, math rock, film cues'] ] } },
    { p:'Odd meters are the leftovers drawer. Groups of 2, 3 and 4 dominate because they are what bodies walk to; a group of 5 or 7 will not divide evenly, so it reads as a limp or a skipped step.' },
    { h:'The cheat every producer uses' },
    { p:'You rarely change your DAW’s time signature. Instead you stay in 4/4 and place <b>triplets</b> — three notes in the space of two — for the compound feel, or turn on <b>swing</b>, which nudges every second 16th late so pairs of boxes become long-short. Swing at 0% is stiff and mechanical; at 100% it’s fully triplet.' },
    { try:{ h:'Two against three', p:'The pulse lane marks the big beats, and the tempo stays put when you switch. In 4/4 you get four beats of two boxes; in 12/8 (which is just two bars of 6/8 back to back) you get four beats of three. Same speed, different gait.',
      build:ctx => {
        const at = ctx.recall('meter') || 2;
        ctx.pills = UI.chips([
          { label:'Simple — 2 per beat (apple)', value:2 },
          { label:'Compound — 3 per beat (strawberry)', value:3 }
        ], v => ctx.setMeter(v), at);
        return [
          ctx.pills,
          UI.btn('Now split each beat into 4', () => ctx.setMeter(4)),
          UI.btn('Fill every box', () => ctx.fill())
        ];
      } } },
    { keys:[
      'Bottom number = which note value counts as one unit. Top number = how many units per bar.',
      'Simple meter: the unit is the beat, so the top number is the beat count (3/4 = 3 beats).',
      'Compound meter: units group in threes, so beats = top ÷ 3, and each beat is a dotted note (6/8 = 2 dotted-quarter beats).',
      'Simple = beats divide by 2. Compound = beats divide by 3.',
      'You can get a compound feel inside 4/4 with triplets or swing — no signature change needed.' ] }
  ],
  quiz:[
    { q:'6/8 is usually felt as…', a:['Six equal heavy beats','Two dotted-quarter beats, each split in three','Three big beats of two','Four beats of four'], c:1,
      why:'Six 8th notes grouped 3 + 3. The beat is the dotted quarter, so the top number (6) counts divisions here, not beats.' },
    { q:'Which is a simple meter?', a:['6/8','9/8','3/4','12/8'], c:2,
      why:'3/4 — three beats, each splitting in two. The others all split their beats into three.' },
    { q:'Turning up swing on your 16ths does what?', a:['Changes the key','Makes every other 16th late','Doubles the tempo','Adds reverb'], c:1,
      why:'It delays the second 16th of each pair, giving a long-short lope — an easy way to borrow a compound feel while staying in 4/4.' }
  ],
  init:ctx => {
    let bpm = 100, group = 2, nSteps = 8;
    /* One bar, four beats, tempo unchanged — only the number of boxes
       inside each beat changes: 2 (simple), 3 (compound) or 4 (simple,
       subdivided again). That keeps the pulse constant, which is the
       whole point of the comparison. */
    ctx.setMeter = g => {
      group = g;
      const steps = g * 4;                    /* always four beats per bar */
      nSteps = steps;
      ctx.stop();
      ctx.v = V.set('grid', { steps, group:g,
        lanes:[{name:'Pulse',kind:'click'},{name:'Kick',kind:'kick'},{name:'Hat',kind:'hat'}] });
      const pulse = [], kick = [], hat = [];
      for (let i = 0; i < steps; i++) {
        pulse.push(i % g === 0 ? 1 : 0);
        kick.push(i % (g * 2) === 0 ? 1 : 0);
        hat.push(1);
      }
      ctx.v.pattern(0, pulse); ctx.v.pattern(1, kick); ctx.v.pattern(2, hat);
      const acc = [];
      for (let i = 0; i < steps; i++) acc.push(i === 0 ? 1 : i % (g * 2) === 0 ? .8 : i % g === 0 ? .5 : .18);
      ctx.v.accents(acc);
      ctx.read(g === 3
        ? 'STRAW-BER-RY  ·  compound\n4 beats, 3 boxes each = 12/8\nbeat = a dotted quarter'
        : g === 2
          ? 'AP-PLE  ·  simple\n4 beats, 2 boxes each = 4/4 in 8ths\nbeat = a quarter'
          : 'AP-PLE, twice as fine  ·  simple\n4 beats, 4 boxes each = 4/4 in 16ths\nstill 2-per-beat at heart');
      ctx.keep('meter', g);
      /* the grid it mirrors has a different number of steps now */
      ctx.syncA11y();
      /* 4-per-beat arrives from its own button, so no pill matches it */
      if (ctx.pills) ctx.pills.show(g === 2 ? 0 : g === 3 ? 1 : -1);
    };
    ctx.fill = () => { ctx.v.pattern(2, new Array(nSteps).fill(1)); ctx.syncA11y(); };
    ctx.setMeter(ctx.recall('meter') || 2);
    const play = on => {
      if (!on) { ctx.stop(); ctx.v.playhead(-1); return; }
      const steps = nSteps;
      ctx.seq({ bpm, div: steps, steps, cb:(step, t) => {
        if (ctx.v.state[0][step]) A.click(step === 0 ? 'strong' : 'mid', t);
        if (ctx.v.state[1][step]) A.click('kick', t);
        if (ctx.v.state[2][step]) A.click('hat', t);
        sch(ctx, t, () => { ctx.v.playhead(step); ctx.v.hit(0, step); });
      } });
    };
    ctx.stage(UI.toggle('▶ Play', play),
      UI.slider('Tempo', 60, 150, bpm, 1, v => { bpm = v; ctx.transport.bpm = v; }, v => v + ' BPM'));
  }
});

LESSONS.push({
  id:'pianoroll', level:1, tag:'Pitch', title:'The Piano Roll',
  hint:'Tap keys to hear them',
  lede:'Twelve notes, repeating forever. Once you can see that pattern on the keys, the piano roll stops being a wall of stripes.',
  stage:{ view:'keys', cfg:{ lo:48, hi:72, labels:'names' } },
  blocks:[
    { h:'Twelve, then again' },
    { p:'Western music uses <b>12 pitches</b>, then starts over higher. The names are <span class="k">C  C♯  D  D♯  E  F  F♯  G  G♯  A  A♯  B</span> and then C again. One step from any note to its neighbour — white to black, or E to F — is a <b>semitone</b> (a half step). Two semitones make a <b>tone</b> (a whole step).' },
    { p:'That repeat is an <b>octave</b>: 12 semitones up, and you land on a note that sounds like the same note, higher. C3, C4, C5 are all C. Middle C is usually <span class="k">C4</span> = MIDI note <span class="k">60</span>.' },
    { h:'Why the black keys sit in 2s and 3s' },
    { p:'Look at the keyboard above. The black keys come in a group of <b>2</b> then a group of <b>3</b>. That’s your map: <b>C is always the white key just left of the group of two</b>, and F is the white key just left of the group of three. There is no black key between E–F and B–C, which is why those pairs are only a semitone apart while the other white-key pairs are a tone.' },
    { p:'The same black key has two names. The one between C and D is <b>C♯</b> if you’re thinking upward and <b>D♭</b> if you’re thinking downward. Same sound, different spelling — that’s called <b>enharmonic</b>. Sharp keys spell it ♯; flat keys spell it ♭. Nothing changes in the MIDI.' },
    { h:'What a note block actually stores' },
    { p:'Every block in your piano roll carries four things: <b>pitch</b> (which row), <b>start</b> (which box), <b>length</b> (how many boxes it holds), and <b>velocity</b> (how hard, 1–127). Velocity is the one beginners ignore and the one that makes programmed parts sound played. Vary it by 15–25 and a stiff chord stab becomes a performance.' },
    { try:{ h:'Find things by shape, not by name', p:'Play the keyboard, then have the lab hide the labels and ask you for a note. Use the black-key groups to find it.',
      build:ctx => [
        UI.chips([{label:'Note names',value:'names'},{label:'MIDI numbers',value:'midi'},{label:'Labels off',value:'none'}],
          v => ctx.setLabels(v), 'names'),
        UI.btn('Sharps ♯ / flats ♭', () => ctx.flip()),
        UI.btn('Quiz me: find a note', () => ctx.findNote())
      ] } },
    { keys:[
      '12 semitones, then the octave repeats. Same letter, higher pitch.',
      'C sits just left of the group of <b>two</b> black keys; F just left of the group of <b>three</b>.',
      'E–F and B–C have no black key between them — those are semitone pairs.',
      'C♯ and D♭ are the same key, spelled two ways.',
      'A note block = pitch + start + length + velocity. Move velocity around; it’s free realism.' ] }
  ],
  quiz:[
    { q:'How many semitones are in an octave?', a:['7','8','12','13'], c:2,
      why:'12. The 13th note is the octave itself — the same letter again.' },
    { q:'Which pair of white keys has NO black key between them?', a:['C and D','F and G','E and F','A and B'], c:2,
      why:'E–F (and B–C). They are a single semitone apart, which is why scale patterns land where they do.' },
    { q:'G♯ and A♭ are…', a:['A semitone apart','The same pitch, spelled differently','An octave apart','Two different black keys'], c:1,
      why:'The same key. Which name you use depends on the key you’re in — sharp keys spell sharps, flat keys spell flats.' }
  ],
  init:ctx => {
    let flats = false, target = null;
    const midiMap = () => { const m = {}; for (let i = 48; i <= 72; i++) m[i] = i; return m; };
    ctx.setLabels = mode => {
      if (mode === 'midi') ctx.v.labelMode('map', midiMap());
      else ctx.v.labelMode(mode);
    };
    ctx.flip = () => { flats = !flats; ctx.v.flats(flats); ctx.read((flats ? 'flat' : 'sharp') + ' spelling'); };
    ctx.findNote = () => {
      const pool = [49,51,54,56,58,61,63,66,68,70,60,64,65,67,71];
      target = pool[Math.floor(Math.random() * pool.length)];
      ctx.v.labelMode('none').clear();
      ctx.read('find ' + T.name(target, flats) + '\n(any octave)');
      ctx.hint('Tap the key you think is ' + T.name(target, flats));
    };
    ctx.v.onKey(m => {
      A.note(m, 1.1);
      if (target != null) {
        const ok = T.pc(m) === T.pc(target);
        ctx.v.clear().mark(m, ok ? 'target' : 'root').apply();
        ctx.read((ok ? '✓ correct — ' : '✗ that was ') + T.fullName(m, flats) +
          (ok ? '' : '\nlooking for ' + T.name(target, flats)));
        if (ok) { target = null; ctx.hint('Nice. Press quiz me for another.'); }
      } else {
        ctx.v.clear().mark(m, 'root').apply();
        ctx.read(T.fullName(m, flats) + '  ·  MIDI ' + m + '\n' + Math.round(T.freq(m)) + ' Hz  ·  ' +
          (T.isBlack(m) ? 'black key' : 'white key'));
      }
    });
    ctx.stage(
      UI.btn('C major run', () => {
        T.scaleNotes(60, 'major').concat([72]).forEach((m, i) =>
          ctx.later(() => { A.note(m, .5); ctx.v.press(m); ctx.read('C major · ' + T.name(m)); }, i * 190));
      }),
      UI.btn('Chromatic crawl', () => {
        for (let i = 0; i <= 12; i++) ctx.later(() => {
          A.note(60 + i, .35); ctx.v.press(60 + i);
          ctx.read('semitone ' + i + '  ·  ' + T.name(60 + i, flats));
        }, i * 150);
      })
    );
    ctx.read('tap any key\n25 keys · C3 → C5');
  }
});

LESSONS.push({
  id:'intervals', level:1, tag:'Pitch', title:'Intervals',
  hint:'Pick two notes, hear the gap',
  lede:'An interval is the distance between two notes, measured in semitones. Every chord, scale and hook is built from a handful of them — and each one has a mood.',
  stage:{ view:'keys', cfg:{ lo:48, hi:72, labels:'names' } },
  blocks:[
    { h:'Count the semitones. That’s it.' },
    { p:'To find an interval, count the keys — black and white — from the lower note to the higher one. C up to G is 7 keys, so it’s <b>7 semitones</b>: a <b>perfect 5th</b>. C up to E♭ is 3 semitones: a <b>minor 3rd</b>. The arc drawn on the stage shows every semitone you step through.' },
    { p:'Names have two parts. The <b>number</b> (3rd, 5th, 7th) counts letter names, which is why a 3rd can be major or minor — same letters, one semitone apart. The <b>quality</b> — major, minor, perfect, diminished, augmented — tells you which size. <em>Perfect</em> is only used for 4ths, 5ths, octaves and unisons, because they have just one common size.' },
    { table:{ head:['Semitones','Name','Sounds like'],
      rows:[
        ['1','minor 2nd','tense, creeping — horror'],
        ['2','major 2nd','one step, neutral'],
        ['3','minor 3rd','sad — the minor sound'],
        ['4','major 3rd','happy — the major sound'],
        ['5','perfect 4th','open, heroic, hollow'],
        ['6','tritone','unstable, wants to resolve'],
        ['7','perfect 5th','strong, powerful, empty'],
        ['8','minor 6th','longing'],
        ['9','major 6th','warm, sweet'],
        ['10','minor 7th','soulful, smooth'],
        ['11','major 7th','dreamy with an edge'],
        ['12','octave','the same note, higher'] ] } },
    { h:'The two that decide everything' },
    { p:'The <b>3rd</b> is the mood switch. 4 semitones = major = bright. 3 semitones = minor = dark. One key difference, entirely different song. The <b>5th</b> is the stability bolt — it’s so consonant it barely has an opinion, which is why power chords and 808 basslines lean on it.' },
    { note:{ h:'“Sounds like” means “usually, in this music”',
      p:'The moods in that table are strong tendencies in Western pop, not properties of the physics. Context overrides them constantly: a minor 3rd is the backbone of plenty of triumphant anthems, and a major 3rd over the wrong bass note can sound desolate. Rhythm, register, tempo, instrument and what came before all get a vote. Use the table to recognise intervals, then judge each one by ear in the actual track.' } },
    { note:{ h:'Consonant and dissonant',
      p:'Consonant intervals (octave, 5th, 4th, 3rds, 6ths) sound settled. Dissonant ones (2nds, 7ths, tritone) sound like they’re leaning somewhere. Dissonance is not a mistake — it’s fuel. Tension you resolve is the single oldest trick in music.' } },
    { try:{ h:'Hear the gaps', p:'Play any interval from C, or let the lab test your ear. Harmonic means both notes at once; melodic means one after the other.',
      build:ctx => [
        UI.chips(T.IVL.slice(0, 13).map(i => ({ label:i.short, value:i.n })), v => ctx.show(v), 7),
        UI.btn('Ear test', () => ctx.test()),
        UI.toggle('Together / apart', v => ctx.setTogether(v), true)
      ] } },
    { keys:[
      'Interval = number of semitones between two notes. Count every key.',
      'Major 3rd (4) = happy. Minor 3rd (3) = sad. That’s the mood dial.',
      'Perfect 5th (7) = stable and strong. Tritone (6) = maximum tension.',
      'Learn the sound before the name — you already recognise most of these from songs.' ] }
  ],
  quiz:[
    { q:'C up to G is how many semitones?', a:['5','6','7','8'], c:2,
      why:'7 — a perfect 5th. Count: C♯ D D♯ E F F♯ G.' },
    { q:'Which interval makes a chord sound minor?', a:['Major 3rd (4)','Minor 3rd (3)','Perfect 5th (7)','Major 6th (9)'], c:1,
      why:'The minor 3rd — 3 semitones above the root. Raise it by one key and the chord turns major.' },
    { q:'A tritone (6 semitones) sounds…', a:['Completely stable','Unstable, like it wants to move','Exactly like an octave','Like a unison'], c:1,
      why:'It sits dead centre of the octave and belongs to no comfortable chord on its own, so it pulls hard toward resolution. It’s the engine inside every dominant 7th chord.' }
  ],
  init:ctx => {
    const base = 60; let together = true, answer = null;
    ctx.setTogether = v => { together = v; };
    const playPair = (a, b) => {
      if (together) { A.note(a, 1.5, { gain:.9 }); A.note(b, 1.5, { gain:.9 }); }
      else { A.note(a, .8); ctx.later(() => A.note(b, 1.2), 450); }
    };
    ctx.show = n => {
      answer = null;
      const hi = base + n;
      ctx.v.clear().mark(base, 'root').mark(hi, 'chord').apply().clearExtras();
      const I = T.ivl(n);
      ctx.v.arc(base, hi, I.short + '  ' + n + ' semis');
      ctx.read('C \u2192 ' + T.spellIvl('C', n) + '\n' + I.label + '  \u00B7  ' + n +
        ' semitones\n' + I.feel);
      playPair(base, hi);
    };
    ctx.test = () => {
      const n = 1 + Math.floor(Math.random() * 12);
      answer = n;
      ctx.v.clear().clearExtras().mark(base, 'root').apply();
      ctx.read('listen…\nwhich interval was that?');
      ctx.hint('Tap the key you think the second note was');
      playPair(base, base + n);
    };
    ctx.v.onKey(m => {
      if (answer != null) {
        const guess = m - base, ok = guess === answer;
        ctx.v.clear().mark(base, 'root').mark(base + answer, 'target').apply().clearExtras();
        ctx.v.arc(base, base + answer, T.ivl(answer).short);
        ctx.read((ok ? '\u2713 ' : '\u2717 ') + 'it was a ' + T.ivl(answer).label +
          ' \u2014 C to ' + T.spellIvl('C', answer) + ', ' + answer + ' semitones' +
          (ok ? '' : '\nyou picked ' + guess + ' semitones'));
        answer = null; ctx.hint('Press ear test for another');
      } else { A.note(m, 1); ctx.show(m - base >= 0 ? m - base : 0); }
    });
    ctx.show(7);
  }
});

LESSONS.push({
  id:'scales', level:1, tag:'Pitch', title:'Scales',
  hint:'Seven notes that agree with each other',
  lede:'A scale is a small set of notes that sound good together. Pick one and you have removed 5 of the 12 keys from the argument.',
  stage:{ view:'keys', cfg:{ lo:48, hi:72, labels:'names' } },
  blocks:[
    { h:'The major scale is a pattern of steps' },
    { p:'Start on any note and walk up using this recipe of tones (T) and semitones (S): <span class="k a">T T S T T T S</span>. That’s the <b>major scale</b>. From C it uses no black keys at all: <span class="k">C D E F G A B</span>. From any other root the same recipe automatically tells you which black keys you need.' },
    { p:'In semitones from the root it looks like this: <span class="k">0 2 4 5 7 9 11</span>. Memorise those seven numbers and you can build a major scale from any note in your head.' },
    { h:'Scale degrees are the real vocabulary' },
    { p:'Inside a scale, each note gets a number — <b>degree</b> 1 to 7 — and that number, not the letter, is what producers actually think in. Degree 1 is the <b>tonic</b>: home. Degree 5 is the <b>dominant</b>: the strongest pull back to home. Degree 3 decides major or minor. Degree 7 is the leading note; it leans hard into the tonic.' },
    { p:'This is why you can move a melody from C minor to F minor and it still “works” — the degrees are the same, only the letters changed. Learn degrees and transposing becomes free.' },
    { h:'Minor: the same seven notes, a different home' },
    { p:'The <b>natural minor</b> scale is <span class="k a">T S T T S T T</span>, or <span class="k">0 2 3 5 7 8 10</span>. Compare with major: the 3rd, 6th and 7th are each one semitone lower. That flat 3rd is the whole difference between “happy” and “serious”.' },
    { p:'Here’s the shortcut that saves hours: every major scale has a <b>relative minor</b> that uses <em>exactly the same notes</em>, starting from its 6th degree. C major and A minor are the same seven white keys. The notes don’t change — which note feels like home does.' },
    { table:{ head:['Scale','Semitones from root','From C','Used for'],
      rows:[
        ['Major','0 2 4 5 7 9 11','C D E F G A B','pop, house, gospel'],
        ['Natural minor','0 2 3 5 7 8 10','C D E♭ F G A♭ B♭','rap, drill, most trap'],
        ['Minor pentatonic','0 3 5 7 10','C E♭ F G B♭','riffs, hooks, vocal lines'],
        ['Major pentatonic','0 2 4 7 9','C D E G A','safe, singable melodies'],
        ['Blues','0 3 5 6 7 10','C E♭ F G♭ G B♭','grit, soul, guitar'] ] } },
    { note:{ h:'Pentatonics are the beginner’s cheat code',
      p:'A pentatonic scale is a 7-note scale with the two most argumentative notes removed. Fewer notes means fewer ways to fight the harmony, which is why hooks so often live here. If your melodies keep clashing, write the hook in minor pentatonic first, then add colour notes back one at a time.' } },
    { note:{ h:'“In the scale” does not mean “safe”',
      p:'A scale keeps you in the key — it does not guarantee agreement with the chord playing underneath. Hold a D over a C chord and it is a 9th (lovely); hold the same D over a G7 and it is the 5th (plain); hold an F over a C major chord and it fights the E a semitone below it, even though F is in C major. Lesson 20 is entirely about that difference. Treat a scale as a shortlist, not a guarantee.' } },
    { try:{ h:'Build a scale from any root', p:'Change the root and the scale type, and watch which keys light up — the pattern moves with the root, the shape stays the same.',
      build:ctx => [
        UI.select('Root', [48,49,50,51,52,53,54,55,56,57,58,59].map(m =>
          ({ label:T.MAJ_ROOT[T.pc(m)], value:m })),
          v => ctx.setRoot(Number(v)), ctx.recall('root') || 48),
        UI.select('Scale', ['major','minor','majorPent','minorPent','blues','harmonicMinor']
          .map(k => ({ label:T.SCALES[k].label, value:k })), v => ctx.setScale(v),
          ctx.recall('type') || 'major'),
        UI.btn('Play it up and down', () => ctx.run()),
        UI.toggle('Show degrees', v => ctx.degrees(v))
      ] } },
    { keys:[
      'Major = <span class="k a">T T S T T T S</span> = semitones 0 2 4 5 7 9 11.',
      'Natural minor = 0 2 3 5 7 8 10 — flat 3rd, 6th and 7th.',
      'Think in <b>degrees</b> (1–7), not letters. Degrees transpose for free.',
      'A major scale and the minor scale starting on its 6th degree share every note.',
      'Stuck? Write in pentatonic — fewer notes, fewer collisions.' ] }
  ],
  quiz:[
    { q:'The major scale step pattern is…', a:['T S T T S T T','T T S T T T S','T T T S T T S','S T T S T T T'], c:1,
      why:'Tone Tone Semitone Tone Tone Tone Semitone. The two semitones sit between degrees 3–4 and 7–8.' },
    { q:'Which scale is the relative minor of C major?', a:['C minor','E minor','A minor','G minor'], c:2,
      why:'A minor — it starts on the 6th degree of C major and uses the exact same seven notes.' },
    { q:'Compared with major, natural minor flattens which degrees?', a:['2, 5, 7','3, 6, 7','1, 4, 5','3, 4, 6'], c:1,
      why:'The 3rd, 6th and 7th each drop a semitone. The flat 3rd is what your ear hears as “minor”.' }
  ],
  init:ctx => {
    let rootPc = ctx.recall('root') || 48, type = ctx.recall('type') || 'major', showDeg = false;
    const notes = () => T.scaleNotes(rootPc + 12, type);
    const RN = () => T.rootFor(rootPc, type);
    const paint = () => {
      const ns = notes(), all = [];
      ns.forEach(n => { all.push(n); if (n - 12 >= 48) all.push(n - 12); if (n + 12 <= 72) all.push(n + 12); });
      ctx.v.clear().marks(all, 'scale').apply();
      ns.forEach((n, i) => { if (i === 0) ctx.v.mark(n, 'root'); });
      [rootPc, rootPc + 12, rootPc + 24].forEach(n => { if (n >= 48 && n <= 72) ctx.v.mark(n, 'root'); });
      ctx.v.apply();
      if (showDeg) {
        const map = {};
        T.SCALES[type].steps.forEach((s, i) => {
          [rootPc + s, rootPc + 12 + s, rootPc + 24 + s].forEach(m => { if (m >= 48 && m <= 72) map[m] = i + 1; });
        });
        ctx.v.labelMode('map', map);
      } else ctx.v.labelMode('names');
      const steps = T.SCALES[type].steps;
      const gaps = steps.map((s, i) => i === 0 ? null : steps[i] - steps[i - 1])
        .concat([12 - steps[steps.length - 1]]).slice(1)
        .map(g => g === 2 ? 'T' : g === 1 ? 'S' : g + '');
      ctx.v.spelling(T.keyMap(RN(), type));
      ctx.read(RN() + ' ' + T.SCALES[type].label + '\n' +
        T.spellScale(RN(), type).join(' ') + '\n' +
        gaps.join(' ') + '   (' + steps.join(' ') + ')\n' + T.SCALES[type].mood);
    };
    ctx.setRoot = v => { rootPc = v; ctx.keep('root', v); paint(); };
    ctx.setScale = v => { type = v; ctx.keep('type', v); paint(); };
    ctx.degrees = v => { showDeg = v; paint(); };
    ctx.run = () => {
      const ns = notes().concat([rootPc + 24]);
      const seq = ns.concat(ns.slice(0, -1).reverse());
      seq.forEach((m, i) => ctx.later(() => {
        A.note(m, .45); if (m <= 72) ctx.v.press(m);
      }, i * 200));
    };
    ctx.v.onKey(m => {
      A.note(m, 1);
      const ns = T.SCALES[type].steps.map(s => T.pc(rootPc + s));
      const i = ns.indexOf(T.pc(m));
      ctx.read(T.inKey(m, RN(), type) + T.oct(m) +
        (i >= 0 ? '\ndegree ' + (i + 1) + ' of ' + RN() + ' ' + T.SCALES[type].label
                : '\noutside the scale \u2014 a colour note'));
    });
    paint();
  }
});

LESSONS.push({
  id:'modes', level:1, tag:'Pitch', title:'Modes',
  hint:'Same seven keys, seven different moods',
  lede:'Take the white keys and decide that D — not C — is home. Nothing about the notes changed, but the music now sounds completely different. That’s a mode.',
  stage:{ view:'keys', cfg:{ lo:48, hi:72, labels:'names' } },
  blocks:[
    { h:'One scale, seven starting points' },
    { p:'The major scale has seven notes, so you can start on any of them and treat that note as home. Each starting point gives a different pattern of tones and semitones relative to its own root — and therefore a different mood. Those seven results are the <b>modes</b>.' },
    { table:{ head:['Mode','From C major','Flavour vs major/minor','Mood'],
      rows:[
        ['Ionian','C D E F G A B','= major','bright, resolved'],
        ['Dorian','D E F G A B C','minor with a ♮6','minor but hopeful, jazzy, UK garage'],
        ['Phrygian','E F G A B C D','minor with a ♭2','dark, Spanish, trap'],
        ['Lydian','F G A B C D E','major with a ♯4','dreamy, floating, film'],
        ['Mixolydian','G A B C D E F','major with a ♭7','bluesy, funk, rock'],
        ['Aeolian','A B C D E F G','= natural minor','sad, serious'],
        ['Locrian','B C D E F G A','minor with ♭2 and ♭5','unstable — rarely a home'] ] } },
    { h:'The useful way to think about it' },
    { p:'Forget the Greek names for a second. Every mode is just <b>major or minor with one or two notes moved</b>, and that moved note is the whole personality:' },
    { keys:[
      '<b>Dorian</b> = minor, but the 6th is natural. That one note stops it sounding hopeless.',
      '<b>Phrygian</b> = minor with a ♭2. That semitone above the root is the darkest move in the set — pure drill and trap.',
      '<b>Lydian</b> = major with a ♯4. Weightless, unresolved, dreamy.',
      '<b>Mixolydian</b> = major with a ♭7. Cocky and bluesy; no strong pull home.',
      '<b>Locrian</b> = the ♭5 kills the home chord. Use it for colour, not for a key.' ] },
    { h:'Brightness is a dial' },
    { p:'Line the modes up from brightest to darkest and you get: <b>Lydian → Ionian → Mixolydian → Dorian → Aeolian → Phrygian → Locrian</b>. Every step down that list flattens exactly one note. That’s the most practical thing about modes — if a loop feels too happy, move one step darker rather than rewriting it.' },
    { note:{ h:'How to actually use a mode',
      p:'Modes only register if you keep hammering home the root and use the chord that contains the characteristic note. Dorian over a static Dm–G vamp sings; the same notes over a C chord just sounds like C major. Mode = notes + a stubborn root.' } },
    { try:{ h:'Turn the brightness dial', p:'All seven modes on the same root, so you hear the mood change instead of the key change. Watch which single key moves each time.',
      build:ctx => [
        UI.chips(T.MODE_ORDER.map(k => ({ label:T.SCALES[k].label.split(' ')[0], value:k })),
          v => ctx.setMode(v), ctx.recall('mode') || 'major'),
        UI.btn('Play the mode', () => ctx.run()),
        UI.btn('Play its home chord', () => ctx.vamp())
      ] } }
  ],
  quiz:[
    { q:'Dorian differs from natural minor by…', a:['A raised 6th','A flat 2nd','A raised 3rd','A flat 5th'], c:0,
      why:'One note: the natural (raised) 6th. It is the single reason Dorian sounds hopeful rather than sad.' },
    { q:'Which mode is “major with a ♭7”?', a:['Lydian','Phrygian','Mixolydian','Locrian'], c:2,
      why:'Mixolydian — the bluesy, funky major. Lowering the 7th removes the strong pull back to the tonic.' },
    { q:'Playing the white keys but treating E as home gives you…', a:['C major','E Phrygian','E minor','A Dorian'], c:1,
      why:'E Phrygian. Same white keys as C major, but from E the pattern starts with a semitone — the dark ♭2.' }
  ],
  init:ctx => {
    const rootMidi = 52; let mode = ctx.recall('mode') || 'major';
    const paint = () => {
      const ns = T.scaleNotes(rootMidi, mode).concat(T.scaleNotes(rootMidi + 12, mode));
      ctx.v.clear().marks(ns.filter(n => n <= 72), 'scale').apply();
      ctx.v.mark(rootMidi, 'root').mark(rootMidi + 12, 'root').apply();
      ctx.v.spelling(T.keyMap('E', mode));
      const maj = T.SCALES.major.steps, cur = T.SCALES[mode].steps;
      const diff = cur.map((s, i) => s === maj[i] ? null : (i + 1) + (s < maj[i] ? '♭' : '♯')).filter(Boolean);
      ctx.v.clearExtras();
      const idx = T.MODE_ORDER.indexOf(mode);
      ctx.v.tag('E ' + T.SCALES[mode].label, 0, 3.3);
      ctx.read(T.SCALES[mode].label + ' on E' +
        '\n' + T.spellScale('E', mode).join(' ') +
        '\nvs major: ' + (diff.length ? diff.join(' ') : 'identical') +
        '\nbrightness ' + (idx + 1) + '/7 — ' + T.SCALES[mode].mood);
    };
    ctx.setMode = v => { mode = v; ctx.keep('mode', v); paint(); ctx.run(); };
    ctx.run = () => {
      const ns = T.scaleNotes(rootMidi, mode).concat([rootMidi + 12]);
      ns.forEach((m, i) => ctx.later(() => { A.note(m, .45); ctx.v.press(m); }, i * 190));
    };
    ctx.vamp = () => {
      const d = T.diatonic(rootMidi, mode)[0];
      A.chord(d.seventh, 2.2, { spread:.05 });
      ctx.read('home chord: ' + T.chordName('E', d.q7) + '\n' +
        T.spellChord('E', d.q7).join(' '));
    };
    ctx.v.onKey(m => { A.note(m, 1); ctx.read(T.inKey(m, 'E', mode) + T.oct(m)); });
    paint();
  }
});

LESSONS.push({
  id:'chords', level:1, tag:'Harmony', title:'Building Chords',
  hint:'Stack every other scale note',
  lede:'A chord is three or more notes at once. The good news: you build almost all of them by skipping every second note of a scale.',
  stage:{ view:'keys', cfg:{ lo:48, hi:72, labels:'names', flats:true } },
  blocks:[
    { h:'Stack thirds. That’s the whole trick.' },
    { p:'Take a scale. Start on any note, skip the next one, take the one after, skip again, take the one after. You now have a <b>triad</b> — a three-note chord. From C major: C, skip D, <b>E</b>, skip F, <b>G</b>. That’s a C major chord.' },
    { p:'Because you skipped a note each time, the gaps between your chord notes are <b>3rds</b>. And the type of 3rd decides the chord’s quality:' },
    { table:{ head:['Chord','Semitones','Stack','Sound'],
      rows:[
        ['Major','0 4 7','major 3rd + minor 3rd','bright, settled'],
        ['Minor','0 3 7','minor 3rd + major 3rd','dark, settled'],
        ['Diminished','0 3 6','minor 3rd + minor 3rd','tense, unstable'],
        ['Augmented','0 4 8','major 3rd + major 3rd','eerie, floating'] ] } },
    { p:'Look at the numbers: major and minor <em>both</em> have the perfect 5th (7). Only the middle note moves — one semitone is the whole difference. That one semitone is usually described as happy versus sad, and in a lot of pop it does land that way, but it is a tendency and not a rule: plenty of minor-key music is euphoric and plenty of major-key music is bleak. What the 3rd reliably changes is the <em>colour</em>; what that colour means depends on everything around it.' },
    { h:'Every scale gives you seven chords' },
    { p:'Do the stacking from each degree of the scale and you get the seven <b>diatonic chords</b> of that key — the chords that are already guaranteed to fit. In a major key they always come out in this order:' },
    { p:'<span class="k v">I</span> major &nbsp; <span class="k v">ii</span> minor &nbsp; <span class="k v">iii</span> minor &nbsp; <span class="k v">IV</span> major &nbsp; <span class="k v">V</span> major &nbsp; <span class="k v">vi</span> minor &nbsp; <span class="k v">vii°</span> diminished.' },
    { p:'Those are <b>roman numerals</b>: capital = major, lowercase = minor, ° = diminished. Numerals describe a progression without naming a key, so <span class="k">I–V–vi–IV</span> is the same song shape in every key. This is how producers trade ideas.' },
    { note:{ h:'In a minor key the order shifts',
      p:'Natural minor gives you <span class="k v">i  ii°  III  iv  v  VI  VII</span>. The big ones are <b>i</b>, <b>iv</b>, <b>VI</b> and <b>VII</b> — that VI–VII–i move is most of modern trap and drill harmony.' } },
    { try:{ h:'See a chord get built', p:'Pick a degree and the lab stacks it for you, naming each gap. Switch the key to hear the same numeral in a different place.',
      build:ctx => [
        UI.chips([1,2,3,4,5,6,7].map(d => ({ label:'Degree ' + d, value:d })),
          v => ctx.deg(v), ctx.recall('deg') || 1),
        UI.select('Key', [{label:'C major',value:'major'},{label:'C minor',value:'minor'}],
          v => ctx.key(v), ctx.recall('key') || 'major'),
        UI.btn('Play all seven', () => ctx.all())
      ] } },
    { keys:[
      'A triad = root + 3rd + 5th, built by skipping scale notes.',
      'Major 0-4-7, minor 0-3-7, diminished 0-3-6, augmented 0-4-8.',
      'Only the middle note separates major from minor.',
      'Major key chords: I ii iii IV V vi vii°. Minor key: i ii° III iv v VI VII.',
      'Think in numerals and your ideas move between keys for free.' ] }
  ],
  quiz:[
    { q:'A minor triad in semitones from the root is…', a:['0 4 7','0 3 7','0 3 6','0 4 8'], c:1,
      why:'0 3 7 — minor 3rd then perfect 5th. Raise the 3 to a 4 and it becomes major.' },
    { q:'In a major key, the chord on degree 5 is always…', a:['minor','major','diminished','augmented'], c:1,
      why:'Major — the V chord. It contains the leading note and is the strongest pull back to I.' },
    { q:'What does “vi” tell you?', a:['A major chord on degree 6','A minor chord on degree 6','A diminished chord on degree 6','The 6th note of a chord'], c:1,
      why:'Lowercase numerals mean minor, and the numeral gives the scale degree. In C major, vi = A minor.' }
  ],
  init:ctx => {
    let keyType = ctx.recall('key') || 'major', deg = ctx.recall('deg') || 1;
    const root = 48;
    const RN = () => T.rootFor(root, keyType);
    const show = () => {
      const ch = T.diatonic(root, keyType)[deg - 1];
      const scale = T.scaleNotes(root, keyType).concat(T.scaleNotes(root + 12, keyType)).filter(n => n <= 72);
      ctx.v.clear().marks(scale, 'ghost').marks(ch.notes, 'chord').mark(ch.root, 'root').apply().clearExtras();
      ctx.v.stack(ch.notes, { degrees:['root', '3rd', '5th'] });
      const num = T.roman(ch.degree, ch.quality);
      const cr = T.inKey(ch.root, RN(), keyType);
      ctx.v.spelling(T.keyMap(RN(), keyType));
      ctx.v.tag(T.chordName(cr, ch.quality) + '   ' + num, 0, 5.1);
      ctx.read(num + '  \u00B7  ' + T.chordName(cr, ch.quality) +
        '\n' + T.spellChord(cr, ch.quality).join('  ') +
        '\n' + T.CHORDS[ch.quality].label + '  \u00B7  ' + ch.notes.map(n => n - ch.root).join(' '));
      A.chord(ch.notes, 1.8, { spread:.06 });
    };
    ctx.deg = d => { deg = d; ctx.keep('deg', d); show(); };
    ctx.key = k => { keyType = k; ctx.keep('key', k); show(); };
    ctx.all = () => {
      T.diatonic(root, keyType).forEach((ch, i) => ctx.later(() => {
        deg = i + 1; show();
      }, i * 900));
    };
    ctx.v.onKey(m => { A.note(m, 1); ctx.read(T.inKey(m, RN(), keyType) + T.oct(m)); });
    show();
  }
});

LESSONS.push({
  id:'progressions', level:1, tag:'Harmony', title:'Progressions That Work',
  hint:'Tap a chord slot to change it',
  lede:'Chords in a row create a story: leave home, build tension, come back. Once you hear the three jobs a chord can have, you can write progressions instead of guessing them.',
  stage:{ view:'keys', cfg:{ lo:48, hi:72, labels:'names', flats:true } },
  blocks:[
    { h:'Three jobs' },
    { p:'Every diatonic chord does one of three things:' },
    { keys:[
      '<b>Tonic</b> (I, vi, iii) — home. Rest, arrival, stability.',
      '<b>Subdominant</b> (IV, ii) — motion. Away from home, no urgency.',
      '<b>Dominant</b> (V, vii°) — tension. V contains the <em>leading note</em>, which leans into the tonic; add its 7th (V7) and you also get a tritone, which is what makes the pull so strong. The plain V triad in C major — G B D — has no tritone in it; G7 does, between B and F.' ] },
    { p:'A progression is a route through those three states. <b>Home → away → tension → home</b> is the shape underneath thousands of songs. Once a chord has done its job you can swap it for another with the same job — that’s how you reharmonise without breaking anything.' },
    { h:'The progressions worth stealing' },
    { table:{ head:['Numerals','In C','Where you hear it'],
      rows:[
        ['I–V–vi–IV','C G Am F','the pop axis — everywhere'],
        ['vi–IV–I–V','Am F C G','the same loop, sadder entry'],
        ['ii–V–I','Dm G C','jazz, neo-soul, R&B turnarounds'],
        ['I–vi–IV–V','C Am F G','doo-wop, ballads'],
        ['i–VI–III–VII','Cm A♭ E♭ B♭','epic minor — trap, drill, film'],
        ['i–iv–i–V','Cm Fm Cm G','dark minor — the G major needs the raised 7th (B♮)'],
        ['i–VII–VI–VII','Cm B♭ A♭ B♭','flamenco-ish vamp, reggaetón'] ] } },
    { h:'Cadences: how a phrase lands' },
    { p:'The end of a phrase is its <b>cadence</b>, and it decides whether the section feels finished:' },
    { keys:[
      '<b>Authentic / perfect — V → I.</b> A full stop. Strongest when the melody lands on the tonic.',
      '<b>Plagal — IV → I.</b> A gentle arrival, the “amen” ending. No leading note pushing into it.',
      '<b>Half (British: imperfect) — the phrase <em>ends on</em> V.</b> A comma: it has arrived somewhere unstable on purpose and expects an answer.',
      '<b>Deceptive / interrupted — V → vi.</b> You set up the full stop and then sidestep it. This is a surprise, not a comma.' ] },
    { small:'Naming conventions differ: British theory says “imperfect” where American theory says “half”, and “interrupted” where American theory says “deceptive”. Both describe the same two things, so recognise the sound and read whichever label your source uses. <a href="https://musictheory.pugetsound.edu/mt21c/cadences.html" target="_blank" rel="noopener">Cadence reference</a>' },
    { note:{ h:'Loops don’t need cadences — they need a hinge',
      p:'Most modern production loops 4 or 8 bars forever, so instead of “ending” you often want a chord that throws you back to bar 1 — usually the V, the VII or the IV. Try it both ways: ending on the unstable chord pulls the loop around, and ending on I makes each pass feel like a complete statement. Which one is right depends on the track.' } },
    { try:{ h:'Four slots, your call', p:'Load a classic, then tap any slot and change its numeral. You will hear immediately which swaps keep the story and which break it.',
      build:ctx => {
        /* the controls open on whatever is actually loaded — an edited
           progression shows no preset lit, because none of them is what
           you are hearing */
        const st = ctx.recall('state') || {};
        ctx.pills = UI.chips([
            { label:'I–V–vi–IV', value:'1,5,6,4' },
            { label:'vi–IV–I–V', value:'6,4,1,5' },
            { label:'ii–V–I–I', value:'2,5,1,1' },
            { label:'i–VI–III–VII (natural minor)', value:'m1,6,3,7' },
            { label:'i–iv–VI–v (natural minor)', value:'m1,4,6,5' },
            { label:'i–iv–VI–V (harmonic minor)', value:'h1,4,6,5' }
          ], v => ctx.loadProg(v), st.preset === undefined ? '1,5,6,4' : st.preset);
        return [
          ctx.pills,
          UI.btn('▶ Play the loop', () => ctx.loop()),
          UI.toggle('Add 7ths', v => ctx.sevenths(v), !!st.sevens)
        ];
      } } },
    { keys:[
      'Chords have jobs: tonic (home), subdominant (motion), dominant (tension).',
      'Home → away → tension → home is the default story.',
      'Swap chords with the same job to reharmonise safely.',
      'For loops, end on the unstable chord so the loop pulls back to bar 1.' ] }
  ],
  quiz:[
    { q:'Which chord creates the strongest pull back to the tonic?', a:['IV','ii','V','vi'], c:2,
      why:'V — the dominant. It holds the leading note and (with its 7th) a tritone, both of which lean into I.' },
    { q:'I–V–vi–IV in the key of G is…', a:['G D Em C','G C Am D','G Bm C D','G Em C D'], c:0,
      why:'G major: I = G, V = D, vi = Em, IV = C. Numerals let you move the same progression to any key.' },
    { q:'A “plagal” cadence is…', a:['V → I','IV → I','V → vi','ii → V'], c:1,
      why:'IV → I. Softer than V → I — it arrives home without the same push. Gospel and worship music live on it.' }
  ],
  init:ctx => {
    /* What gets kept is the progression as it stands — key, the four degrees,
       and whether 7ths are on — not the name of the preset it started from.
       Editing a slot and switching reading level therefore keeps the edit.
       `preset` is only the pill to light up, and goes blank once edited. */
    const st = ctx.recall('state') || {};
    let keyType = st.keyType || 'major';
    let seq = (st.seq || [1,5,6,4]).slice();
    let sevens = !!st.sevens;
    let preset = st.preset === undefined ? '1,5,6,4' : st.preset;
    let playing = false;
    const root = 48;
    const store = () => {
      ctx.keep('state', { keyType, seq:seq.slice(), sevens, preset });
      if (ctx.contentChanged) ctx.contentChanged();
    };
    const RN = () => T.rootFor(root, keyType === 'major' ? 'major' : 'minor');
    const chordAt = d => {
      const c = T.diatonic(root, keyType)[d - 1];
      const q = sevens ? c.q7 : c.quality;
      const cr = T.inKey(c.root, RN(), keyType);
      return { notes: sevens ? c.seventh : c.notes, root:c.root, spell:T.spellChord(cr, q),
               label: T.chordName(cr, q), num: T.roman(c.degree, q) };
    };
    const showChord = i => {
      const c = chordAt(seq[i]);
      const scale = T.scaleNotes(root, keyType).concat(T.scaleNotes(root + 12, keyType)).filter(n => n <= 72);
      ctx.v.clear().marks(scale, 'ghost').marks(c.notes.filter(n => n <= 72), 'chord')
        .mark(c.root, 'root').apply().clearExtras();
      ctx.v.spelling(T.keyMap(RN(), keyType));
      ctx.v.tag(c.num + '   ' + c.label, 0, 3.4);
      ctx.read(seq.map((d, j) => (j === i ? '[' : ' ') + chordAt(d).num + (j === i ? ']' : ' ')).join(' ') +
        '\n' + c.label + '  \u00B7  ' + c.spell.join(' ') +
        (keyType === 'harmonicMinor' ? '\nharmonic minor \u2014 raised 7th' : ''));
      A.chord(c.notes, sevens ? 2 : 1.7, { spread:.05 });
    };
    ctx.loadProg = v => {
      /* 'm' = natural minor (degree 5 is minor), 'h' = harmonic minor
         (degree 5 is major, because the 7th is raised). The numerals in the
         readout are derived from the notes actually played, so the label and
         the sound can never drift apart. */
      keyType = v[0] === 'm' ? 'minor' : v[0] === 'h' ? 'harmonicMinor' : 'major';
      seq = v.replace(/^[mh]/, '').split(',').map(Number);
      preset = v; store();
      showChord(0);
    };
    ctx.sevenths = v => { sevens = v; store(); showChord(0); };
    ctx.loop = () => {
      if (playing) return;
      playing = true;
      const step = i => {
        if (i >= 8) { playing = false; return; }
        showChord(i % 4);
        ctx.later(() => step(i + 1), 1100);
      };
      step(0);
    };
    /* Editing a slot makes the progression its own thing: the preset pills go
       blank, because none of them is what you are hearing any more. */
    const degSel = UI.select('to numeral', [1,2,3,4,5,6,7].map(d => ({ label:'degree ' + d, value:d })), v => {
      const i = (ctx.slot || 1) - 1;
      seq[i] = Number(v); preset = null; store();
      if (ctx.pills) ctx.pills.show(-1);
      showChord(i);
    }, seq[0]);
    ctx.stage(
      UI.select('Change slot', [1,2,3,4].map(i => ({ label:'Slot ' + i, value:i })), v => {
        ctx.slot = Number(v);
        degSel.el.value = String(seq[ctx.slot - 1]);   /* show the slot's own degree */
      }, 1),
      degSel
    );
    ctx.v.onKey(m => { A.note(m, 1); ctx.read(T.inKey(m, RN(), keyType) + T.oct(m)); });
    /* what is worth keeping here is the progression itself — four chords a bar
       each, exported in the key you are hearing */
    ctx.keepCfg = { kind:'chords', name:'Progression', bpm:() => 96,
      read: () => ({ chords:seq.map(d => chordAt(d).notes), keyType, seq:seq.slice(), sevens }),
      write: d => {
        if (!d.seq) return;
        keyType = d.keyType || 'major'; seq = d.seq.slice(); sevens = !!d.sevens;
        preset = null; store();
        if (ctx.pills) ctx.pills.show(-1);
        showChord(0);
      } };
    showChord(0);
  }
});
