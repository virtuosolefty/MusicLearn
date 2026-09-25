/* ═══════════════════════════════════════════════════════════════
   GLOSSARY — tap a word, get one line and, where it helps, a sound.

   The first time a term appears on a page it becomes a small button. Its
   definition is one sentence written for someone who has never met the
   word, and most of them can be heard, because "a minor 3rd" defined in
   words is worse than one played.

   Only the first mention on a page is marked, so a paragraph never turns
   into a row of underlines.
   ═══════════════════════════════════════════════════════════════ */
const GLOSSARY = (() => {
  const ch = (ns, gap) => () => { A.resume(); A.chord(ns, 1.4, { spread:gap || 0.04 }); };
  const run = (ns, gap) => () => { A.resume(); ns.forEach((m, i) => setTimeout(() => A.note(m, 0.45), i * (gap || 260))); };
  const beats = (pattern) => () => {
    A.resume();
    pattern.forEach((v, i) => { if (v) setTimeout(() => A.click(v === 2 ? 'strong' : 'hat', undefined, v === 2 ? 0.9 : 0.5), i * 150); });
  };

  /* [term, other forms, one-line definition, sound] — longest forms match first */
  const TERMS = [
    ['beat', ['beats'], 'The steady pulse you nod your head to. Four of them make a bar of 4/4.', beats([2,0,0,0,2,0,0,0,2,0,0,0,2])],
    ['bar', ['bars'], 'One lap of the beat pattern — in 4/4, four beats. Loops are counted in bars.', beats([2,0,1,0,1,0,1,0,2])],
    ['BPM', [], 'Beats per minute: how fast the beats go by. It counts beats, not the small boxes.', null],
    ['16th note', ['16th notes', 'sixteenth note', 'sixteenth notes'], 'A quarter of a beat — one small box of a DAW’s grid. Sixteen fill a bar of 4/4.', beats([2,1,1,1,2,1,1,1])],
    ['time signature', ['time signatures'], 'Two stacked numbers, like 4/4: how many units in a bar, and which note is one unit.', null],
    ['triplet', ['triplets'], 'Three notes squeezed into the space where two normally go. It gives a rolling feel.', beats([2,0,0,1,0,0,2,0,0,1,0,0])],
    ['swing', [], 'Every second small note played a little late, so pairs go long-short.', null],
    ['semitone', ['semitones', 'half step', 'half steps'], 'The smallest step: from one key to the very next, black or white.', run([60, 61])],
    ['whole step', ['whole steps'], 'Two half steps — skip one key.', run([60, 62])],
    ['octave', ['octaves'], 'Twelve half steps up: the same note name, higher. It sounds like the same note.', run([48, 60])],
    ['sharp', ['sharps'], 'A half step up. C♯ is the key just above C.', run([60, 61])],
    ['flat', ['flats'], 'A half step down. D♭ is the key just below D — the same key as C♯.', run([62, 61])],
    ['enharmonic', [], 'Two names for the same key, like C♯ and D♭. Same sound, different spelling.', null],
    ['interval', ['intervals'], 'The distance between two notes, counted in half steps and given a name.', run([60, 67])],
    ['scale', ['scales'], 'A set of notes that belong together, walked in order from a home note.', run([60, 62, 64, 65, 67, 69, 71, 72], 180)],
    ['tonic', [], 'Degree 1: the home note of a key. Music feels finished there.', run([67, 65, 64, 62, 60])],
    ['root', ['roots'], 'The note a chord is built on and named after.', ch([48, 52, 55])],
    ['degree', ['degrees'], 'A note’s number inside a scale, 1 to 7. Producers think in these, because they work in every key.', null],
    ['triad', ['triads'], 'A three-note chord: a root, the note a third above, and the note a fifth above.', ch([60, 64, 67])],
    ['chord', ['chords'], 'Three or more notes played together.', ch([60, 64, 67])],
    ['major', [], 'The bright, settled sound. A major chord has a major 3rd (4 half steps) above the root.', ch([60, 64, 67])],
    ['minor', [], 'The darker, serious sound. A minor chord has a minor 3rd (3 half steps) above the root.', ch([60, 63, 67])],
    ['diatonic', [], 'Belonging to the key — built only from the notes of the scale.', null],
    ['Roman numeral', ['Roman numerals', 'numeral', 'numerals'], 'A chord named by its degree: I, IV, V. Capitals are major, small letters minor.', null],
    ['progression', ['progressions'], 'Chords in an order — the harmony of a loop.', null],
    ['cadence', ['cadences'], 'How a phrase ends: a full stop (V → I), a comma (ending on V), or a surprise.', ch([55, 59, 62])],
    ['inversion', ['inversions'], 'A chord with a note other than its root at the bottom. Same chord, different weight.', ch([64, 67, 72])],
    ['seventh chord', ['seventh chords', '7th chord', '7th chords'], 'A triad with one more third on top — four notes, richer and less settled.', ch([60, 64, 67, 71])],
    ['suspended', ['sus chord', 'sus chords', 'sus2', 'sus4'], 'A chord with the 3rd swapped for the 2nd or 4th. Neither major nor minor; it wants to resolve.', ch([60, 65, 67])],
    ['extension', ['extensions'], 'A note stacked above the 7th — a 9th, 11th or 13th — for colour.', ch([48, 52, 55, 59, 62])],
    ['mode', ['modes'], 'A scale started from a different note of the same set, which moves where home is.', null],
    ['relative minor', [], 'The minor key that shares every note with a major key, starting on its 6th degree.', null],
    ['circle of fifths', [], 'The twelve keys in a ring, each a 5th from its neighbours. Neighbours share almost every note.', null],
    ['borrowed chord', ['borrowed chords'], 'A chord taken from the parallel key — the minor version of the key you are in.', ch([53, 56, 60])],
    ['dominant', [], 'Degree 5, and the chord built on it. It pulls hardest back to home.', ch([55, 59, 62, 65])],
    ['leading note', ['leading tone'], 'Degree 7 of a major scale, a half step below home. It leans into it.', run([71, 72])],
    ['resolve', ['resolves', 'resolution'], 'To move from a tense sound to a settled one.', null],
    ['tension', [], 'The pull you hear in a sound that wants to move somewhere else.', ch([60, 66])],
    ['chord tone', ['chord tones'], 'A note that belongs to the chord playing underneath. Melodies land on these.', null],
    ['passing note', ['passing notes', 'passing tone'], 'A note between two chord tones, on the way from one to the other.', null],
    ['motif', ['motifs'], 'A short melodic idea — often three or four notes — that a tune is built from.', run([63, 67, 65, 63], 220)],
    ['contour', [], 'The shape a melody draws: up, down, an arch or a valley.', null],
    ['velocity', [], 'How hard a note is hit, 1 to 127. Varying it is what makes programmed parts sound played.', null],
    ['pentatonic', [], 'A five-note scale — a 7-note scale with the two most clashing notes removed.', run([60, 62, 64, 67, 69, 72], 200)],
    ['chromatic', [], 'Moving in half steps, using all twelve notes.', run([60, 61, 62, 63, 64], 140)]
  ];

  /* one lookup, longest spelling first, so "seventh chord" beats "chord" */
  const FORMS = [];
  TERMS.forEach((t, i) => [t[0]].concat(t[1]).forEach(f => FORMS.push({ f, i })));
  FORMS.sort((a, b) => b.f.length - a.f.length);
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const RX = new RegExp('\\b(' + FORMS.map(x => esc(x.f)).join('|') + ')\\b', 'i');
  const indexOf = word => {
    const w = word.toLowerCase();
    const hit = FORMS.find(x => x.f.toLowerCase() === w);
    return hit ? hit.i : -1;
  };

  /* never inside these — a button inside a button, a term inside a heading */
  const SKIP = /^(BUTTON|A|H1|H2|H3|H4|SUMMARY|SELECT|OPTION|INPUT|TEXTAREA|SCRIPT|STYLE|SVG|TH|LABEL)$/;
  function skipped(node, root) {
    for (let n = node.parentNode; n && n !== root; n = n.parentNode) {
      if (n.nodeType === 1 && (SKIP.test(n.tagName) || n.classList.contains('k') ||
          n.classList.contains('term') || n.classList.contains('opts') || n.classList.contains('ctl'))) return true;
    }
    return false;
  }

  let pop = null, openBtn = null;
  function close() {
    if (!pop) return;
    pop.hidden = true;
    if (openBtn) { openBtn.setAttribute('aria-expanded', 'false'); }
    openBtn = null;
  }
  function show(btn, i) {
    if (!pop) {
      pop = document.createElement('div');
      pop.className = 'term-pop';
      pop.setAttribute('role', 'dialog');
      pop.hidden = true;
      document.body.appendChild(pop);
      document.addEventListener('click', e => {
        if (pop && !pop.hidden && !pop.contains(e.target) && !(e.target.closest && e.target.closest('.term'))) close();
      });
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && pop && !pop.hidden) { const b = openBtn; close(); if (b) b.focus(); }
      });
      window.addEventListener('scroll', close, true);
    }
    if (openBtn === btn) { close(); return; }
    const t = TERMS[i];
    pop.setAttribute('aria-label', t[0]);
    pop.innerHTML = '<b>' + t[0] + '</b><p>' + t[2] + '</p>';
    if (t[3]) {
      const h = document.createElement('button');
      h.type = 'button'; h.className = 'b';
      if (typeof ICONS !== 'undefined') ICONS.label(h, '▶ Hear it'); else h.textContent = 'Hear it';
      h.addEventListener('click', e => { e.stopPropagation(); t[3](); });
      pop.appendChild(h);
    }
    pop.hidden = false;
    if (openBtn) openBtn.setAttribute('aria-expanded', 'false');
    openBtn = btn;
    btn.setAttribute('aria-expanded', 'true');
    const r = btn.getBoundingClientRect();
    const w = Math.min(300, window.innerWidth - 24);
    pop.style.width = w + 'px';
    pop.style.left = Math.max(12, Math.min(window.innerWidth - w - 12, r.left)) + 'px';
    const below = r.bottom + 8, h2 = pop.offsetHeight;
    pop.style.top = (below + h2 > window.innerHeight - 8 ? Math.max(8, r.top - h2 - 8) : below) + 'px';
  }

  /* mark the first mention of each term inside `root` */
  function decorate(root) {
    if (!root || typeof document === 'undefined' || !document.createTreeWalker) return 0;
    const seen = {};
    let made = 0;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    for (let n = walker.nextNode(); n; n = walker.nextNode()) nodes.push(n);
    nodes.forEach(node => {
      if (!node.nodeValue || !node.nodeValue.trim() || skipped(node, root)) return;
      let cur = node;
      for (let guard = 0; guard < 6 && cur; guard++) {
        const m = RX.exec(cur.nodeValue);
        if (!m) break;
        const i = indexOf(m[1]);
        if (i < 0 || seen[i]) {
          /* already marked on this page: look further along the same text */
          const rest = cur.splitText(m.index + m[1].length);
          cur = rest; continue;
        }
        seen[i] = true;
        const word = cur.splitText(m.index);
        const after = word.splitText(m[1].length);
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'term';
        b.textContent = word.nodeValue;
        b.setAttribute('aria-expanded', 'false');
        b.setAttribute('aria-label', word.nodeValue + ' — what this means');
        b.addEventListener('click', e => { e.stopPropagation(); show(b, i); });
        word.parentNode.replaceChild(b, word);
        made++;
        cur = after;
      }
    });
    return made;
  }

  return { TERMS, decorate, close, indexOf };
})();
