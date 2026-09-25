/* ═══════════════════════════════════════════════════════════════
   GENRES — the idea you are learning, inside a track.

   An interval played on its own is an exercise; the same two notes as a
   hook over a lo-fi beat is music. Four small styles, each a tempo, a kit,
   a sound for the chords and a drum pattern, play whatever the lesson on
   screen is currently showing. Nothing is sampled: every sound is the same
   synth the rest of the app uses.
   ═══════════════════════════════════════════════════════════════ */
const GENRES = (() => {
  const S = {
    lofi:{ name:'Lo-fi', bpm:78, kit:'lofi', voice:'keys', lead:'bell',
      why:'Slow, dusty, swung. The chords do the talking.',
      kick:[1,0,0,0, 0,0,0,0, 0,0,1,0, 0,0,0,0], snare:[0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
      hat:[1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0], swing:0.14, bass:[0, 10] },
    trap:{ name:'Trap', bpm:140, kit:'808', voice:'pad', lead:'pluck',
      why:'Half-time: the snare lands on beat 3, and the hats do the running.',
      kick:[1,0,0,0, 0,0,0,0, 0,0,1,0, 0,0,0,0], snare:[0,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
      hat:[1,0,1,0, 1,0,1,1, 1,0,1,0, 1,1,1,1], swing:0, bass:[0, 10] },
    pop:{ name:'Pop', bpm:108, kit:'acoustic', voice:'pluck', lead:'lead',
      why:'Straight eighths, backbeat on 2 and 4 — the default setting of the radio.',
      kick:[1,0,0,0, 0,0,0,1, 1,0,0,0, 0,0,0,0], snare:[0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
      hat:[1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0], swing:0, bass:[0, 8] },
    house:{ name:'House', bpm:124, kit:'acoustic', voice:'organ', lead:'bell',
      why:'Four on the floor, open hats on the offbeat.',
      kick:[1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0], snare:[0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
      hat:[0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0], swing:0, bass:[2, 6, 10, 14] }
  };
  const ORDER = ['lofi', 'trap', 'pop', 'house'];

  /* material: { chords:[[midi…], …] one per bar, line:[midi…] spread across them } */
  function play(ctx, id, material) {
    const g = S[id]; if (!g || !material) return;
    const chords = (material.chords && material.chords.length) ? material.chords : [[48, 55, 60]];
    const bars = Math.max(2, chords.length);
    const line = material.line || [];
    const perBar = line.length ? Math.max(1, Math.ceil(line.length / bars)) : 0;
    const slots = perBar > 4 ? [0, 2, 4, 6, 8, 10, 12, 14] : perBar > 2 ? [0, 4, 8, 12] : [0, 8];
    const has = typeof INSTRUMENTS !== 'undefined';
    ctx.seq({ bpm:g.bpm, div:16, steps:16 * bars, cb:(step, when, dt) => {
      const bar = Math.floor(step / 16), s = step % 16;
      const late = (s % 2 === 1) ? g.swing * dt : 0;
      const t = when + late;
      const c = chords[bar % chords.length];
      if (has) {
        if (g.kick[s]) INSTRUMENTS.hit(g.kit, 'kick', t, 1);
        if (g.snare[s]) INSTRUMENTS.hit(g.kit, id === 'trap' || id === 'house' ? 'clap' : 'snare', t, 0.9);
        if (g.hat[s]) INSTRUMENTS.hit(g.kit, 'hat', t, s % 4 === 0 ? 0.7 : 0.45);
        if (s === 0) c.forEach(m => INSTRUMENTS.play(g.voice, m, 60 / g.bpm * 3.6, { when:t, gain:0.42 }));
        if (g.bass.indexOf(s) >= 0) {
          let r = Math.min.apply(null, c); while (r >= 48) r -= 12;
          INSTRUMENTS.play(id === 'trap' ? 'sub' : 'pluckbass', r, 60 / g.bpm * 0.9, { when:t, gain:0.9 });
        }
        if (perBar) {
          const k = slots.indexOf(s);
          if (k >= 0 && k < perBar) {
            const m = line[(bar * perBar + k) % line.length];
            if (m != null) INSTRUMENTS.play(g.lead, m + (Math.min.apply(null, line) < 60 ? 12 : 0), 60 / g.bpm * 0.8, { when:t, gain:0.7 });
          }
        }
      } else {
        if (g.kick[s]) A.click('kick', t);
        if (g.snare[s]) A.click('snare', t);
        if (s === 0) A.chord(c, 1.5, { when:t, gain:0.4 });
      }
    } });
  }

  /* the panel under a lesson's controls. getMaterial is read on every press,
     so it always plays what the lesson is showing right now */
  function panel(ctx, getMaterial) {
    const p = UI.el('div', 'panel genre-panel');
    p.appendChild(UI.html('h4', null, 'Hear it in a track'));
    const note = UI.html('p', 'small', 'The same idea inside four styles. Change it above, then press a style again.');
    p.appendChild(note);
    const row = UI.el('div', 'ctl');
    let on = null;
    const btns = {};
    const paint = () => ORDER.forEach(id => {
      btns[id].classList.toggle('on', on === id);
      btns[id].setAttribute('aria-pressed', on === id ? 'true' : 'false');
      UI.label(btns[id], (on === id ? '■ ' : '▶ ') + S[id].name);
    });
    ORDER.forEach(id => {
      const b = UI.btn(S[id].name, () => {
        A.resume();
        if (on === id) { ctx.stop(); on = null; paint(); note.textContent = 'Stopped.'; return; }
        const m = getMaterial();
        on = id; paint();
        play(ctx, id, m);
        note.innerHTML = '<b>' + S[id].name + ', ' + S[id].bpm + ' BPM.</b> ' + S[id].why +
          (m && m.label ? ' Playing: ' + m.label + '.' : '');
      });
      btns[id] = b; row.appendChild(b);
    });
    paint();
    p.appendChild(row);
    return p;
  }

  return { STYLES:S, ORDER, play, panel };
})();
