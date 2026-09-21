/* ═══════════════════════════════════════════════════════════════
   INSTRUMENTS — the sounds you can pick from, written as data.

   Eight pitched presets and three drum kits. Eight is deliberate: enough
   that the choice changes the genre, few enough that you can audition all
   of them in a minute. Every one carries a line saying what it is for,
   because "pick a sound" is useless advice on its own and the reason is
   the part a theory course can actually teach.

   A preset is numbers, not code. `voice` is handed straight to A.note;
   `kit` straight to A.click. Adding one means adding a row here.
   ═══════════════════════════════════════════════════════════════ */
const INSTRUMENTS = (() => {
  /* filter shapes, as functions of the note's own frequency — so a preset
     sounds like itself at the bottom of the keyboard and at the top */
  const bright = { open:f => Math.min(11000, f * 9 + 1200), close:f => Math.max(600, f * 3.0), q:0.7 };
  const warm   = { open:f => Math.min(9000, f * 7 + 700),   close:f => Math.max(400, f * 2.2), q:0.9 };
  const dark   = { open:f => Math.min(2600, f * 4 + 160),   close:f => Math.max(140, f * 1.4), q:1.1 };

  const PRESETS = [
    /* ── bass ───────────────────────────────────────────────── */
    { id:'sub', name:'Sub bass', role:'bass',
      why:'Felt more than heard. One note at a time, low, and never panned.',
      vol:0.95, pan:0, send:0.02,
      voice:Object.assign({ oscs:[['sine', 0.95, 0], ['triangle', 0.22, -1200]],
                            atk:0.008, rel:d => Math.min(0.3, d * 0.5), sus:0.85 }, dark) },
    { id:'pluckbass', name:'Pluck bass', role:'bass',
      why:'Short and percussive. Leaves gaps for the kick to sit in.',
      vol:0.85, pan:0, send:0.05,
      voice:Object.assign({ oscs:[['sawtooth', 0.45, 0], ['square', 0.25, -1200], ['sine', 0.3, 0]],
                            atk:0.006, rel:d => Math.min(0.22, d * 0.4), sus:0.35 }, warm) },

    /* ── chords ─────────────────────────────────────────────── */
    { id:'pad', name:'Warm pad', role:'chords',
      why:'Slow in, slow out. Fills the space behind everything else.',
      vol:0.6, pan:0, send:0.35,
      voice:Object.assign({ oscs:[['sawtooth', 0.30, 0], ['sawtooth', 0.22, 7], ['triangle', 0.34, -1200]],
                            atk:0.09, rel:() => 0.55, sus:0.62 }, warm) },
    { id:'keys', name:'Electric keys', role:'chords',
      why:'Defined enough to carry the harmony on its own.',
      vol:0.72, pan:0, send:0.18,
      voice:Object.assign({ oscs:[['sine', 0.6, 0], ['sine', 0.3, 1200], ['triangle', 0.22, 3]],
                            atk:0.01, rel:d => Math.min(0.6, d * 0.8), sus:0.45 }, bright) },

    /* ── top line ───────────────────────────────────────────── */
    { id:'pluck', name:'Pluck', role:'top',
      why:'The app’s default voice. Neutral, clear, sits above the chords.',
      vol:0.8, pan:0, send:0.2,
      voice:Object.assign({ oscs:[['triangle', 0.55, 0], ['sine', 0.34, -1200], ['sawtooth', 0.12, 4]],
                            atk:0.012, rel:d => Math.min(0.5, d * 0.7), sus:0.62 }, warm) },
    { id:'lead', name:'Square lead', role:'top',
      why:'Cuts through a busy mix. Use it for one line, not for chords.',
      vol:0.62, pan:0, send:0.25,
      voice:Object.assign({ oscs:[['square', 0.4, 0], ['sawtooth', 0.18, 6], ['square', 0.12, -1200]],
                            atk:0.008, rel:d => Math.min(0.4, d * 0.6), sus:0.7 }, bright) },
    { id:'bell', name:'Bell', role:'top',
      why:'Long tail, no body. One note every few bars is usually enough.',
      vol:0.55, pan:0.15, send:0.45,
      voice:Object.assign({ oscs:[['sine', 0.7, 0], ['sine', 0.25, 1900], ['sine', 0.12, 2800]],
                            atk:0.004, rel:d => Math.max(0.6, d), sus:0.25 }, bright) },
    { id:'organ', name:'Organ', role:'chords',
      why:'No attack, no decay — it is simply on. Good under a vocal.',
      vol:0.6, pan:0, send:0.22,
      voice:Object.assign({ oscs:[['sine', 0.5, 0], ['sine', 0.3, 1200], ['sine', 0.2, 1902], ['square', 0.1, 0]],
                            atk:0.02, rel:() => 0.12, sus:0.95 }, warm) }
  ];

  /* ── drum kits ────────────────────────────────────────────────
     Parameter sets over the voices A.click already has. `acoustic` is the
     kit this app has always used, number for number, so every existing
     lesson keeps the drums it was written with. */
  const KITS = [
    { id:'acoustic', name:'Acoustic kit',
      why:'What every lesson here uses. Round kick, bright snare.',
      kit:A.KIT },
    { id:'808', name:'808 kit',
      why:'Long tuned kick, thin snap. Trap, drill, most modern rap.',
      kit:{ kick:{ from:180, to:32, sweep:0.16, gain:1.0, tail:0.22, tailV:0.3 },
            snare:{ len:0.11, hp:1900, decay:2.6, gain:0.42 },
            clap:{ len:0.17, hp:1300, decay:1.2, gain:0.46 },
            hat:{ len:0.03, hp:9000, decay:1.5, gain:0.2 } } },
    { id:'lofi', name:'Lo-fi kit',
      why:'Dull and soft, like a sampled record. Nothing cuts.',
      kit:{ kick:{ from:120, to:44, sweep:0.09, gain:0.75, tail:0.09, tailV:0.1 },
            snare:{ len:0.14, hp:800, decay:1.6, gain:0.38, lp:900 },
            clap:{ len:0.18, hp:700, decay:1.1, gain:0.34, lp:1100 },
            hat:{ len:0.05, hp:4500, decay:1.0, gain:0.17, lp:1200 } } }
  ];

  const byId = id => PRESETS.filter(p => p.id === id)[0] || null;
  const kitById = id => KITS.filter(k => k.id === id)[0] || KITS[0];
  const byRole = role => PRESETS.filter(p => p.role === role);
  const ROLES = [
    { id:'drums',  name:'Drums',    why:'The floor everything else stands on.' },
    { id:'bass',   name:'Bass',     why:'Tells your ear which chord it is hearing.' },
    { id:'chords', name:'Chords',   why:'The harmony, and most of the mood.' },
    { id:'top',    name:'Top line', why:'The bit people hum. Last in, first noticed.' }
  ];

  /* Play one preset, through a mixer strip if a channel is given. */
  function play(id, midi, dur, opt) {
    const p = byId(id); if (!p) return;
    opt = opt || {};
    A.note(midi, dur == null ? 0.6 : dur, Object.assign({}, opt, {
      voice:p.voice,
      gain:(opt.gain == null ? 1 : opt.gain) * (opt.raw ? 1 : p.vol),
      out:opt.out
    }));
  }
  /* and one drum hit out of a named kit */
  function hit(kitId, part, when, vel, opt) {
    A.click(part, when, vel, Object.assign({ kit:kitById(kitId).kit }, opt || {}));
  }

  return { PRESETS, KITS, ROLES, byId, kitById, byRole, play, hit,
           PARTS:['kick', 'snare', 'clap', 'hat'] };
})();
