/* ═══════════════════════════════════════════════════════════════
   CHEAT — one page with every table the course uses, each row playable.

   Nothing here is typed in by hand: intervals, chord formulas, scale
   patterns and the diatonic chords all come from the same music maths the
   lessons use (theory.js), so this page cannot disagree with them. Pick a
   key at the top and every spelled example follows it.
   ═══════════════════════════════════════════════════════════════ */
const CHEAT = (() => {
  const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const STEP = { 1:'H', 2:'W', 3:'W+H', 4:'2W' };
  const CHORD_LIST = ['maj', 'min', 'dim', 'aug', 'sus2', 'sus4', 'maj7', 'min7', 'dom7', 'm7b5', 'dim7', 'add9', 'maj9', 'min9'];
  const SCALE_LIST = ['major', 'minor', 'harmonicMinor', 'majorPent', 'minorPent', 'blues',
                      'dorian', 'phrygian', 'lydian', 'mixolydian'];
  const PROGS = [
    { t:'major', seq:[1,5,6,4], feel:'the pop loop' },
    { t:'major', seq:[6,4,1,5], feel:'the same loop, starting sadder' },
    { t:'major', seq:[2,5,1,1], feel:'jazz, neo-soul, R&B' },
    { t:'major', seq:[1,4,5,1], feel:'a full stop at the end' },
    { t:'minor', seq:[1,6,3,7], feel:'big minor — trap, drill, film' },
    { t:'minor', seq:[1,4,6,5], feel:'dark, cinematic' },
    { t:'minor', seq:[1,7,6,7], feel:'a two-chord vamp with a lift' }
  ];
  const VALUES = [
    ['Whole note', '1 per bar', [1]], ['Half note', '2 per bar', [1, 0, 0, 0, 0, 0, 0, 0, 1]],
    ['Quarter note', '4 per bar — the beat', [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1]],
    ['8th note', '8 per bar', [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1]],
    ['16th note', '16 per bar — one grid box', [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]]
  ];

  let rootPc = 0;
  const later = [];
  const stop = () => { later.forEach(clearTimeout); later.length = 0; };
  const at = (fn, ms) => later.push(setTimeout(fn, ms));
  const runOf = (ns, gap) => { stop(); A.resume(); ns.forEach((m, i) => at(() => A.note(m, 0.45), i * (gap || 200))); };
  const chordOf = ns => { stop(); A.resume(); A.chord(ns, 1.5, { spread:0.03 }); };
  const seqOf = chords => { stop(); A.resume(); chords.forEach((ns, i) => at(() => A.chord(ns, 1.1, { spread:0.03 }), i * 850)); };
  const clicks = row => { stop(); A.resume(); row.forEach((v, i) => { if (v) at(() => A.click(i === 0 ? 'strong' : 'mid'), i * 150); }); };

  const hear = (label, fn) => {
    const b = UI.el('button', 'b hear');
    b.type = 'button';
    b.setAttribute('aria-label', 'Hear ' + label);
    b.innerHTML = typeof ICONS !== 'undefined' ? ICONS.svg('play') : '▶';
    b.addEventListener('click', fn);
    return b;
  };
  function table(head, rows) {
    const tw = UI.el('div', 'tablewrap cheat-table'), t = UI.el('table');
    const tr = UI.el('tr');
    ['', ...head].forEach(h => tr.appendChild(UI.html('th', null, h)));
    const hd = UI.el('thead'); hd.appendChild(tr); t.appendChild(hd);
    const tb = UI.el('tbody');
    rows.forEach(r => {
      const row = UI.el('tr');
      const c0 = UI.el('td', 'play-cell'); c0.appendChild(hear(r.label, r.play)); row.appendChild(c0);
      r.cells.forEach((c, i) => row.appendChild(UI.html('td', i === 0 ? 'hi' : null, c)));
      tb.appendChild(row);
    });
    t.appendChild(tb); tw.appendChild(t);
    return tw;
  }
  const section = (host, title, blurb) => {
    const s = UI.el('section', 'cheat-sec');
    s.appendChild(UI.html('h3', null, title));
    if (blurb) s.appendChild(UI.html('p', 'small', blurb));
    host.appendChild(s);
    return s;
  };

  function paint(body) {
    body.innerHTML = '';
    const R = 48 + rootPc, rn = T.MAJ_ROOT[rootPc], mn = T.rootFor(rootPc, 'minor');

    /* the twelve notes */
    const s0 = section(body, 'The twelve notes', 'Tap any one. Black keys have two names — a sharp going up, a flat coming down.');
    const row = UI.el('div', 'cheat-notes');
    for (let i = 0; i < 12; i++) {
      const m = 60 + i;
      const b = UI.el('button', 'b' + (T.isBlack(m) ? ' blackkey' : ''));
      b.type = 'button';
      b.textContent = T.isBlack(m) ? T.name(m) + ' / ' + T.name(m, true) : T.name(m);
      b.addEventListener('click', () => { A.resume(); A.note(m, 0.8); });
      row.appendChild(b);
    }
    s0.appendChild(row);

    /* intervals */
    const s1 = section(body, 'Intervals', 'Counted in half steps from ' + esc(rn) + '. Each plays as two notes, then together.');
    s1.appendChild(table(['Half steps', 'Name', 'Short', 'From ' + esc(rn), 'Sounds'],
      T.IVL.filter(I => I.n <= 12).map(I => ({
        label:I.label, play:() => { stop(); A.resume(); A.note(R + 12, 0.5); at(() => A.note(R + 12 + I.n, 0.5), 420);
                                    at(() => A.chord([R + 12, R + 12 + I.n], 1.2), 900); },
        cells:[String(I.n), I.label, I.short, esc(rn) + ' → ' + esc(T.spellIvl(rn, I.n)), I.feel]
      }))));

    /* chords */
    const s2 = section(body, 'Chords', 'Each chord as a recipe of intervals above its root, spelled on ' + esc(rn) + '.');
    s2.appendChild(table(['Chord', 'Symbol', 'Recipe', 'On ' + esc(rn)],
      CHORD_LIST.map(q => {
        const C = T.CHORDS[q];
        return { label:C.label + ' chord', play:() => chordOf(T.chordNotes(R, q)),
          cells:[C.label, esc(T.chordName(rn, q)), C.steps.map(n => T.ivl(n).short).join(' '),
                 esc(T.spellChord(rn, q).join(' '))] };
      })));

    /* scales */
    const s3 = section(body, 'Scales', 'W = whole step, H = half step. Spelled from ' + esc(rn) + '.');
    s3.appendChild(table(['Scale', 'Steps', 'On ' + esc(rn), 'Mood'],
      SCALE_LIST.map(k => {
        const S = T.SCALES[k], st = S.steps.concat([12]);
        const pattern = st.slice(1).map((v, i) => STEP[v - st[i]] || (v - st[i])).join(' ');
        const nm = T.rootFor(rootPc, k);
        return { label:S.label + ' scale', play:() => runOf(T.scaleNotes(R + 12, k).concat([R + 24]), 170),
          cells:[S.label, pattern, esc(T.spellScale(nm, k).join(' ')), S.mood] };
      })));

    /* the chords of a key */
    const s4 = section(body, 'The seven chords of a key', 'Stack thirds on every note of the scale. Capitals are major, small letters minor, ° diminished.');
    [['major', rn], ['minor', mn]].forEach(([type, name]) => {
      const dia = T.diatonic(R, type);
      s4.appendChild(table([esc(name) + ' ' + type, 'Chord', 'Notes'],
        dia.map(c => {
          const cn = T.inKey(c.root, name, type);
          return { label:T.roman(c.degree, c.quality) + ' in ' + name + ' ' + type, play:() => chordOf(c.notes),
            cells:[T.roman(c.degree, c.quality), esc(T.chordName(cn, c.quality)),
                   esc(T.spellChord(cn, c.quality).join(' '))] };
        })));
    });

    /* progressions */
    const s5 = section(body, 'Progressions worth stealing', 'The numerals stay the same in every key — that is the point of them.');
    s5.appendChild(table(['Numerals', 'In ' + esc(rn) + ' major / ' + esc(mn), 'Where you hear it'],
      PROGS.map(p => {
        const dia = T.diatonic(R, p.t), name = p.t === 'major' ? rn : mn;
        const num = p.seq.map(d => T.roman(d, dia[d - 1].quality)).join(' – ');
        return { label:num, play:() => seqOf(p.seq.map(d => dia[d - 1].notes)),
          cells:[num, esc(p.seq.map(d => T.chordName(T.inKey(dia[d - 1].root, name, p.t), dia[d - 1].quality)).join(' ')), p.feel] };
      })));

    /* rhythm */
    const s6 = section(body, 'Note values', 'One bar of 4/4, sixteen boxes. Each plays its hits across a bar.');
    s6.appendChild(table(['Value', 'How many'],
      VALUES.map(v => ({ label:v[0], play:() => clicks(v[2]), cells:[v[0], v[1]] }))));
  }

  function build(host) {
    const top = UI.el('div', 'ctl cheat-top');
    const pick = UI.select('Key', T.MAJ_ROOT.map((n, i) => ({ label:n, value:i })), v => {
      rootPc = Number(v); paint(body);
      if (typeof GLOSSARY !== 'undefined') GLOSSARY.decorate(body);
    }, rootPc);
    top.appendChild(pick);
    host.appendChild(top);
    const body = UI.el('div', 'cheat-body');
    host.appendChild(body);
    paint(body);
    return { stop };
  }
  return { build, stop };
})();
