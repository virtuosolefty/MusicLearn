/* ═══════════════════════════════════════════════════════════════
   TRACK — one loop, built across the whole course.

   Four lessons each hand over one layer: the beat from The Grid, the
   chords from Progressions That Work, the bass from Basslines and the
   tune from Melody Craft. Every lesson after that which plays "the loop"
   plays yours, and Build an 8-Bar Idea starts from what you made rather
   than from a stock example. Finishing the course means finishing a loop.

   The track lives in C minor at one tempo, because that is the key the
   bass and melody lessons are drawn in. A progression in a major key is
   not refused silently: the panel says why and offers the minor version.

   A layer is plain data — step rows for drums, note lists for everything
   else — kept in this browser like the rest of your progress.
   ═══════════════════════════════════════════════════════════════ */
const TRACK = (() => {
  const KEY = 'rbx-theory-track-v1';
  const LAYERS = [
    { id:'drums',  name:'Drums',  lesson:'grid',         from:'The Grid' },
    { id:'chords', name:'Chords', lesson:'progressions', from:'Progressions That Work' },
    { id:'bass',   name:'Bass',   lesson:'bassline',     from:'Basslines' },
    { id:'melody', name:'Melody', lesson:'melody',       from:'Melody Craft' }
  ];
  /* what plays before you have made anything: the loop the lessons used to hard-code */
  const DEFAULT_BED = [
    { step:0,  len:4, notes:[48,51,55], root:36, label:'Cm',  spell:['C','E♭','G'] },
    { step:4,  len:4, notes:[44,48,51], root:32, label:'A♭', spell:['A♭','C','E♭'] },
    { step:8,  len:4, notes:[51,55,58], root:39, label:'E♭', spell:['E♭','G','B♭'] },
    { step:12, len:4, notes:[46,50,53], root:34, label:'B♭', spell:['B♭','D','F'] }
  ];
  const DEFAULT_DRUMS = {
    kick: [1,0,0,0, 0,0,1,0, 0,0,0,0, 1,0,0,0],
    snare:[0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
    hat:  [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0]
  };
  const MINORISH = ['minor', 'harmonicMinor'];

  let t = {};
  function load() {
    try { t = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { t = {}; }
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(t)); } catch (e) {} }
  load();
  const fns = [];
  const tell = () => fns.forEach(fn => { try { fn(status()); } catch (e) {} });

  const has = id => !!t[id];
  const status = () => { const o = {}; LAYERS.forEach(L => { o[L.id] = has(L.id); }); return o; };
  function set(id, data) {
    t[id] = data; t.at = Date.now(); save(); tell();
  }
  function clear(id) { if (id) delete t[id]; else t = {}; save(); tell(); }

  /* the bass register the stock loop uses: A♭1 up to G2 */
  const bassRoot = pc => 32 + ((pc - 8 + 12) % 12);
  /* chords sit where the stock loop's did — the lessons add an octave on playback */
  const seat = notes => {
    let ns = notes.slice();
    while (Math.min.apply(null, ns) >= 56) ns = ns.map(n => n - 12);
    while (Math.min.apply(null, ns) < 43) ns = ns.map(n => n + 12);
    return ns;
  };

  /* the four chords under everything, one per beat-group of the 16-step loop */
  function bed() {
    const c = t.chords;
    if (!c || !c.bars || c.bars.length !== 4) return DEFAULT_BED;
    return c.bars.map((b, i) => ({ step:i * 4, len:4, notes:seat(b.notes), root:bassRoot(T.pc(b.root)),
                                   label:b.label, spell:b.spell || [] }));
  }
  const drums = () => t.drums || DEFAULT_DRUMS;
  /* your bassline, or the roots of whatever chords are in the track */
  const bass = () => (t.bass && t.bass.length) ? t.bass
    : bed().map(c => ({ step:c.step, midi:c.root, len:3 }));
  const melody = () => (t.melody && t.melody.length) ? t.melody : null;
  const bpm = () => t.bpm || 92;

  /* ── the lessons hand their layer over through these ── */
  const fromGrid = state => ({ kick:(state[0] || []).slice(0, 16), snare:(state[1] || []).slice(0, 16),
                               hat:(state[2] || []).slice(0, 16) });
  /* only a minor progression fits a track in C minor */
  const fitsKey = keyType => MINORISH.indexOf(keyType) >= 0;

  /* ── one pass of the loop, through the lesson's own transport ── */
  function play(ctx, opt) {
    opt = opt || {};
    const mute = opt.mute || {};
    const b = bed(), d = drums(), bs = bass(), mel = opt.melody || melody();
    ctx.seq({ bpm:opt.bpm || bpm(), div:16, steps:16, cb:(step, when) => {
      if (!mute.chords && (has('chords') || opt.all)) {
        const c = b.find(x => x.step === step);
        if (c) A.chord(c.notes.map(n => n + 12), 2.1, { when, spread:0.03, gain:0.38 });
      }
      if (!mute.drums && (has('drums') || opt.all)) {
        if (d.kick[step]) A.click('kick', when);
        if (d.snare[step]) A.click('snare', when);
        if (d.hat[step]) A.click('hat', when, step % 4 === 0 ? 0.8 : 0.45);
      }
      if (!mute.bass && (has('bass') || opt.all)) {
        bs.filter(n => n.step === step).forEach(n => A.note(n.midi, 0.22 * (n.len || 1) + 0.3, { when }));
      }
      if (!mute.melody && mel) {
        mel.filter(n => n.step === step).forEach(n => A.note(n.midi, 0.28 * (n.len || 1) + 0.25, { when, gain:0.95 }));
      }
      if (opt.onStep) opt.onStep(step, when);
    } });
  }

  /* ── the panel a source lesson shows ─────────────────────────
     cfg: { layer:'drums'|'chords'|'bass'|'melody', read:() => data,
            fits:() => true | 'why not', fix:{ label, run } } */
  function panel(ctx, cfg) {
    if (!cfg.layer) return summary(ctx);
    const L = LAYERS.find(x => x.id === cfg.layer);
    const p = UI.el('div', 'panel track-panel');
    p.appendChild(UI.html('h4', null, 'Your track'));
    p.appendChild(UI.html('p', 'small',
      'One loop, built across the course. Four lessons each add a layer — this one adds the <b>' +
      L.name.toLowerCase() + '</b>. By <em>Build an 8-Bar Idea</em> you arrange parts you made yourself.'));
    const strip = UI.el('div', 'layers');
    const msg = UI.html('p', 'small track-msg', '');
    const paint = () => {
      strip.innerHTML = '';
      LAYERS.forEach(x => {
        const on = has(x.id), here = x.id === L.id;
        const c = UI.el('span', 'layer' + (on ? ' on' : '') + (here ? ' here' : ''));
        c.innerHTML = (on && typeof ICONS !== 'undefined' ? ICONS.svg('check') : '<i></i>') +
          '<span>' + x.name + '</span>';
        c.title = on ? x.name + ': in your track' : x.name + ': from ' + x.from;
        strip.appendChild(c);
      });
      const why = cfg.fits ? cfg.fits() : true;
      add.disabled = why !== true;
      UI.label(add, has(L.id) ? 'Replace the ' + L.name.toLowerCase() + ' in your track'
                              : 'Add these ' + L.name.toLowerCase() + ' to your track');
      if (L.id === 'melody' || L.id === 'bass') UI.label(add, has(L.id)
        ? 'Replace the ' + L.name.toLowerCase() + ' in your track' : 'Add this ' + L.name.toLowerCase() + ' to your track');
      fixBtn.hidden = why === true || !cfg.fix;
      if (why !== true) msg.innerHTML = why;
    };
    const add = UI.btn('Add', () => {
      const data = cfg.read();
      if (!data) { msg.textContent = 'Nothing to add yet — make something above first.'; return; }
      set(L.id, data);
      msg.innerHTML = '<b>Added.</b> ' + (LAYERS.every(x => has(x.id))
        ? 'All four layers are in — open Build an 8-Bar Idea to arrange them.'
        : 'Still to come: ' + LAYERS.filter(x => !has(x.id)).map(x => x.name.toLowerCase() + ' (' + x.from + ')').join(', ') + '.');
      if (ctx.chime) ctx.chime(true);
      if (typeof V !== 'undefined' && V.fx) V.fx.ring(null, 'good');
      paint();
    }, { primary:true });
    const fixBtn = UI.btn(cfg.fix ? cfg.fix.label : '', () => { if (cfg.fix) cfg.fix.run(); paint(); });
    const hear = UI.toggle('▶ Hear your track', on => {
      if (!on) { ctx.stop(); return; }
      const any = LAYERS.some(x => has(x.id));
      if (!any) { msg.textContent = 'Your track is empty so far — add this layer first.'; return; }
      play(ctx, {});
    });
    p.append(strip, UI.row(add, fixBtn, hear), msg);
    paint();
    ctx.trackPaint = paint;
    return p;
  }

  /* where the layers come together: what is yours, and where the rest comes from */
  function summary(ctx) {
    const p = UI.el('div', 'panel track-panel');
    p.appendChild(UI.html('h4', null, 'Your track'));
    const mine = LAYERS.filter(x => has(x.id)), rest = LAYERS.filter(x => !has(x.id));
    p.appendChild(UI.html('p', 'small', mine.length
      ? 'Playing under the roll: your ' + mine.map(x => x.name.toLowerCase()).join(', ') + '.' +
        (rest.length ? ' Still stock: ' + rest.map(x => x.name.toLowerCase() + ' (add it in ' + x.from + ')').join(', ') + '.'
                     : ' Every layer is yours.')
      : 'Nothing of yours yet, so the stock loop is playing. Each of these lessons adds a layer: ' +
        LAYERS.map(x => x.from).join(', ') + '.'));
    const strip = UI.el('div', 'layers');
    LAYERS.forEach(x => {
      const on = has(x.id);
      const c = UI.el('span', 'layer' + (on ? ' on' : ''));
      c.innerHTML = (on && typeof ICONS !== 'undefined' ? ICONS.svg('check') : '<i></i>') + '<span>' + x.name + '</span>';
      strip.appendChild(c);
    });
    p.appendChild(strip);
    return p;
  }

  return { LAYERS, DEFAULT_BED, DEFAULT_DRUMS, load, reload:load, set, clear, has, status,
           bed, drums, bass, melody, bpm, play, panel, fromGrid, fitsKey, bassRoot,
           onChange:fn => { fns.push(fn); },
           get data() { return t; } };
})();
