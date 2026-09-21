/* ═══════════════════════════════════════════════════════════════
   RACK — the channel rack.

   Rows are instruments, columns are time. That is the whole idea, and it
   is the same picture FL Studio, a 909 and a piece of squared paper all
   show you. Each row carries what the row needs to be mixed — a mute, a
   solo, a level and a pan — and then sixteen steps.

   Phase 3 is drums only: four parts, four bars, one kit at a time. The
   pitched rows come next and the data model already has room for them.

   This is DOM rather than WebGL on purpose. The 3D stage is for looking
   at one idea; a rack is a control surface, and a control surface wants
   real buttons — which are also, for free, operable by keyboard and
   readable by a screen reader.
   ═══════════════════════════════════════════════════════════════ */
const RACK = (() => {
  const BARS = 4, STEPS = 16;
  const KEY = 'rbx-theory-studio-v1';

  /* three states per step: off, a normal hit, and an accent. Velocity is a
     real musical control and this is the cheapest honest place to put it. */
  const VEL = [0, 0.62, 1];
  const PARTS = [
    { part:'kick',  name:'Kick',  why:'The pulse. Everything else is placed against it.' },
    { part:'snare', name:'Snare', why:'The backbeat — usually boxes 5 and 13.' },
    { part:'clap',  name:'Clap',  why:'Doubles the snare, or replaces it.' },
    { part:'hat',   name:'Hat',   why:'The subdivision you feel but do not listen to.' }
  ];

  /* ── starter patterns, because an empty grid is where people stop ── */
  const PATTERNS = {
    'four-to-the-floor':{ name:'Four to the floor', why:'House, disco, most dance music.',
      kick:[2,0,0,0, 2,0,0,0, 2,0,0,0, 2,0,0,0],
      snare:[0,0,0,0, 2,0,0,0, 0,0,0,0, 2,0,0,0],
      clap:[0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
      hat:[0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0] },
    'boom-bap':{ name:'Boom bap', why:'Hip hop. Kick low and lazy, snare hard on 2 and 4.',
      kick:[2,0,0,0, 0,0,1,0, 0,0,2,0, 0,0,0,0],
      snare:[0,0,0,0, 2,0,0,0, 0,0,0,0, 2,0,0,1],
      clap:[0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
      hat:[1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0] },
    trap:{ name:'Trap', why:'Sparse kick, clap on 3, hats doing the work.',
      kick:[2,0,0,0, 0,0,1,0, 0,0,0,0, 0,1,0,0],
      snare:[0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
      clap:[0,0,0,0, 0,0,0,0, 2,0,0,0, 0,0,0,0],
      hat:[1,0,1,1, 1,0,1,0, 1,1,1,0, 1,0,1,1] },
    empty:{ name:'Empty', why:'Start from nothing.',
      kick:[], snare:[], clap:[], hat:[] }
  };

  const zeros = () => new Array(STEPS).fill(0);
  const barsOf = row => {
    const out = [];
    for (let b = 0; b < BARS; b++) out.push((row && row.length === STEPS) ? row.slice() : zeros());
    return out;
  };

  function blank(patternId) {
    const p = PATTERNS[patternId] || PATTERNS['four-to-the-floor'];
    return {
      v:1, bpm:96, bars:BARS, kit:'acoustic',
      channels:PARTS.map(d => ({
        id:d.part, kind:'drum', part:d.part, name:d.name,
        vol:d.part === 'kick' ? 0.95 : d.part === 'hat' ? 0.6 : 0.8,
        pan:d.part === 'hat' ? 0.18 : 0, mute:false, solo:false, send:d.part === 'hat' ? 0.06 : 0.02,
        on:[true, true, true, true],           /* which bars this channel plays */
        steps:barsOf(p[d.part])
      }))
    };
  }

  /* ── the record, kept in this browser like everything else here ── */
  function load() {
    try {
      const v = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (v && v.channels && v.channels.length) return v;
    } catch (e) {}
    return blank('four-to-the-floor');
  }
  function save(project) {
    try { localStorage.setItem(KEY, JSON.stringify(project)); } catch (e) {}
  }

  /* ── what the mixer should be doing for this project ── */
  function pushMix(project) {
    if (typeof MIXER === 'undefined') return;
    project.channels.forEach(c =>
      MIXER.set('rack:' + c.id, { vol:c.vol, pan:c.pan, mute:c.mute, solo:c.solo, send:c.send }));
  }
  const outOf = c => (typeof MIXER === 'undefined' ? null : MIXER.input('rack:' + c.id));

  /* one hit, wherever it is coming from — playback, or a tap on a step */
  function strike(project, c, when, vel) {
    if (typeof INSTRUMENTS === 'undefined') return;
    INSTRUMENTS.hit(project.kit, c.part, when, vel, { out:outOf(c) });
  }

  /* ── MIDI: one track per channel, which is what a DAW wants to open ── */
  function toMidi(project) {
    if (typeof STUDIO === 'undefined') return null;
    const step = STUDIO.PPQ / 4;
    const tracks = project.channels.map(c => {
      const notes = [];
      c.steps.forEach((bar, bi) => {
        if (!c.on[bi]) return;
        bar.forEach((s, si) => {
          if (!s) return;
          notes.push({ note:STUDIO.DRUM[c.part] || 38,
                       t:(bi * STEPS + si) * step, dur:step / 2,
                       vel:Math.round(VEL[s] * 127) });
        });
      });
      return { name:c.name, ch:9, notes };          /* 9 is the GM drum channel */
    });
    return STUDIO.midiMulti(tracks, { bpm:project.bpm, name:'Producer Theory Lab' });
  }

  /* ═══ the surface ═══════════════════════════════════════════ */
  function build(host, opts) {
    opts = opts || {};
    const project = opts.project || load();
    const transport = A.transport();
    let bar = 0, playing = false, timers = [];
    const later = (fn, ms) => { timers.push(setTimeout(fn, ms)); };
    const clearLater = () => { timers.forEach(clearTimeout); timers = []; };

    const el = UI.el, html = UI.html;
    const wrap = el('div', 'rack');
    const rows = {};                        /* channel id -> its live handles */
    let playhead = -1;

    const touch = () => { save(project); if (opts.onChange) opts.onChange(project); };

    /* ── transport row ── */
    const head = el('div', 'rack-head');
    const play = UI.btn('▶ Play', () => togglePlay(), { primary:true });
    const bpm = UI.slider('Tempo', 60, 160, project.bpm, 1, v => {
      project.bpm = v; transport.bpm = v; touch();
    }, v => v + ' BPM');
    head.append(play, bpm);
    wrap.appendChild(head);

    /* ── bar strip: which bar you are editing, and which bars each row plays ── */
    const bars = el('div', 'rack-bars');
    bars.appendChild(html('span', 'lab', 'Bar'));
    const barBtns = [];
    for (let b = 0; b < project.bars; b++) {
      const t = UI.el('button', 'barbtn', String(b + 1));
      t.type = 'button';
      t.setAttribute('aria-pressed', b === 0 ? 'true' : 'false');
      t.title = 'Edit bar ' + (b + 1);
      t.addEventListener('click', () => { bar = b; paintAll(); });
      bars.appendChild(t); barBtns.push(t);
    }
    const copy = UI.btn('Copy bar to all', () => {
      project.channels.forEach(c => {
        const src = c.steps[bar];
        c.steps = c.steps.map(() => src.slice());
      });
      touch(); paintAll();
    });
    copy.title = 'Make every bar the same as this one';
    bars.appendChild(copy);
    wrap.appendChild(bars);

    /* ── the grid ── */
    const grid = el('div', 'rack-grid');
    project.channels.forEach(c => {
      const row = el('div', 'rack-row');

      const handles = rows[c.id] = { row, cells:[] };
      const nameCell = el('div', 'rack-name');
      const mute = UI.el('button', 'dot');
      mute.type = 'button';
      mute.title = 'Mute ' + c.name;
      mute.setAttribute('aria-label', 'Mute ' + c.name);
      mute.addEventListener('click', () => {
        c.mute = !c.mute; pushMix(project); touch(); paintRow(c);
      });
      const solo = UI.el('button', 'solo', 'S');
      solo.type = 'button';
      solo.title = 'Solo ' + c.name;
      solo.setAttribute('aria-label', 'Solo ' + c.name);
      solo.addEventListener('click', () => {
        c.solo = !c.solo; pushMix(project); touch(); paintAll();
      });
      const label = UI.el('button', 'rack-label', c.name);
      label.type = 'button';
      label.title = c.why || ('Hear the ' + c.name.toLowerCase());
      label.addEventListener('click', () => {
        A.resume(); strike(project, c, null, 1);
        if (opts.onSay) opts.onSay(c.name + ' · ' + (partWhy(c.part) || ''));
      });
      handles.mute = mute; handles.solo = solo;
      nameCell.append(mute, solo, label);
      row.appendChild(nameCell);

      const steps = el('div', 'rack-steps');
      for (let i = 0; i < STEPS; i++) {
        const b = UI.el('button', 'step');
        b.type = 'button';
        b.dataset.i = i;
        b.addEventListener('click', () => {
          A.resume();
          const now = c.steps[bar][i] || 0;
          const next = (now + 1) % 3;
          c.steps[bar][i] = next;
          if (next) strike(project, c, null, VEL[next]);
          touch(); paintRow(c);
        });
        steps.appendChild(b);
        handles.cells.push(b);
      }
      row.appendChild(steps);
      grid.appendChild(row);
    });
    wrap.appendChild(grid);

    /* ── the mixer ──
       Off the step row on purpose: on a phone the knobs were eating the width
       the steps needed, and a mixer is a separate surface in every DAW there
       has ever been. */
    const mix = el('details', 'rack-mix');
    mix.open = true;
    const msum = el('summary');
    msum.innerHTML = '<span>Mix</span><span class="wc">level \u00b7 pan \u00b7 per channel</span>';
    mix.appendChild(msum);
    const mixBody = el('div', 'mixbody');
    project.channels.forEach(c => {
      const r = el('div', 'mixrow');
      r.appendChild(html('b', null, c.name));
      r.appendChild(mini('Level', 0, 120, Math.round(c.vol * 100), v => {
        c.vol = v / 100; pushMix(project); touch();
      }));
      r.appendChild(mini('Pan', -100, 100, Math.round(c.pan * 100), v => {
        c.pan = v / 100; pushMix(project); touch();
      }));
      mixBody.appendChild(r);
    });
    mix.appendChild(mixBody);
    wrap.appendChild(mix);

    /* ── the bits under the grid ── */
    const foot = el('div', 'rack-foot');
    const kitPick = UI.select('Kit', INSTRUMENTS.KITS.map(k => ({ label:k.name, value:k.id })),
      v => {
        project.kit = v; touch();
        const k = INSTRUMENTS.kitById(v);
        if (opts.onSay) opts.onSay(k.name + ' · ' + k.why);
        /* hear the change straight away, on the part most defined by a kit */
        const kick = project.channels.filter(x => x.part === 'kick')[0];
        if (kick) strike(project, kick, null, 1);
      }, project.kit);
    const patPick = UI.select('Pattern', Object.keys(PATTERNS).map(id =>
      ({ label:PATTERNS[id].name, value:id })), id => {
        const p = PATTERNS[id];
        project.channels.forEach(c => { c.steps = barsOf(p[c.part]); });
        touch(); paintAll();
        if (opts.onSay) opts.onSay(p.name + ' · ' + p.why);
      }, 'four-to-the-floor');
    foot.append(kitPick, patPick);
    wrap.appendChild(foot);

    const acts = el('div', 'ctl');
    const dl = UI.btn('↓ Export MIDI', () => {
      const bytes = toMidi(project);
      if (!bytes) { if (opts.onSay) opts.onSay('nothing to export yet'); return; }
      const ok = STUDIO.download(bytes, 'musiclearn-beat.mid');
      if (opts.onSay) opts.onSay(ok ? 'exported · four named tracks, one per part'
                                    : 'downloads are blocked in this viewer');
    });
    const clear = UI.btn('Clear', () => {
      project.channels.forEach(c => { c.steps = barsOf([]); });
      touch(); paintAll();
    });
    acts.append(dl, clear);
    wrap.appendChild(acts);

    /* ── painting ── */
    function partWhy(part) {
      const d = PARTS.filter(x => x.part === part)[0];
      return d ? d.why : '';
    }
    function paintRow(c) {
      const h = rows[c.id];
      const strip = (typeof MIXER !== 'undefined') ? MIXER.get('rack:' + c.id) : null;
      const quiet = c.mute || (strip && !strip.audible);
      h.cells.forEach((b, i) => {
        const v = c.steps[bar][i] || 0;
        b.className = 'step' + (v === 2 ? ' accent' : v === 1 ? ' on' : '') +
          (i % 4 === 0 ? ' beat' : '') + (i === playhead ? ' now' : '');
        b.setAttribute('aria-pressed', v ? 'true' : 'false');
        b.setAttribute('aria-label', c.name + ', bar ' + (bar + 1) + ', step ' + (i + 1) + ', ' +
          (v === 2 ? 'accent' : v === 1 ? 'on' : 'off'));
      });
      h.row.classList.toggle('quiet', !!quiet);
      h.mute.classList.toggle('off', !!c.mute);
      h.mute.setAttribute('aria-pressed', c.mute ? 'true' : 'false');
      h.solo.classList.toggle('on', !!c.solo);
      h.solo.setAttribute('aria-pressed', c.solo ? 'true' : 'false');
    }
    function paintAll() {
      barBtns.forEach((t, i) => t.setAttribute('aria-pressed', i === bar ? 'true' : 'false'));
      project.channels.forEach(paintRow);
    }

    /* ── playback ── */
    function togglePlay() {
      A.resume();
      if (playing) return stop();
      playing = true;
      play.textContent = '■ Stop';
      play.classList.add('on');
      pushMix(project);
      transport.start({
        bpm:project.bpm, div:16, steps:project.bars * STEPS,
        cb:(s, t) => {
          const b = Math.floor(s / STEPS), i = s % STEPS;
          project.channels.forEach(c => {
            if (!c.on[b]) return;
            const v = c.steps[b][i];
            if (v) strike(project, c, t, VEL[v]);
          });
          later(() => {
            if (!playing) return;
            playhead = i;
            if (b !== bar) { bar = b; paintAll(); } else { playheadOnly(i); }
          }, Math.max(0, (t - A.now()) * 1000));
        }
      });
    }
    /* the playhead moves many times a second: move only the class, never
       rewrite an aria-label, or a screen reader reads the whole loop aloud */
    function playheadOnly(i) {
      Object.keys(rows).forEach(id => {
        rows[id].cells.forEach((b, j) => b.classList.toggle('now', j === i));
      });
    }
    function stop() {
      playing = false; transport.stop(); clearLater();
      play.textContent = '▶ Play';
      play.classList.remove('on');
      playhead = -1; paintAll();
    }

    /* small labelled range, tighter than UI.slider for a table row */
    function mini(label, lo, hi, val, fn) {
      const w = el('label', 'mini');
      w.title = label;
      const r = el('input'); r.type = 'range';
      r.min = lo; r.max = hi; r.value = val;
      r.setAttribute('aria-label', label);
      r.addEventListener('input', () => fn(Number(r.value)));
      w.append(html('span', null, label), r);
      return w;
    }

    pushMix(project);
    paintAll();
    host.appendChild(wrap);
    return { project, stop, el:wrap, toMidi:() => toMidi(project) };
  }

  return { build, blank, load, save, toMidi, PATTERNS, PARTS, VEL, BARS, STEPS, KEY };
})();
