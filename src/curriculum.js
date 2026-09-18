/* ═══════════════════════════════════════════════════════════════
   CURRICULUM — the order the lessons are taught in.

   The lessons themselves are just data; this file decides the journey.
   It is deliberately the last thing loaded, so changing the path never
   means touching a lesson, and the path is reviewable in one screen.

   The shape: get someone making recognisable music early, then widen.
   Harmony that is not needed to finish an 8-bar idea waits until after
   they have finished one.
   ═══════════════════════════════════════════════════════════════ */
const CURRICULUM = (() => {
  const STAGES = [
    { id:'start',   name:'Start Making Music',
      blurb:'Beats, bars and the piano roll — enough to put sound anywhere you want it.' },
    { id:'notes',   name:'Notes & Keys',
      blurb:'The twelve notes, the distances between them, and the small teams that agree.' },
    { id:'first',   name:'Build Your First Track',
      blurb:'Chords, a progression, a bassline and a tune over the top.' },
    { id:'musical', name:'Make It Musical',
      blurb:'Which notes land, and how hard you hit them.' },
    { id:'finish',  name:'Finish an 8-Bar Idea',
      blurb:'Put the four layers together, then arrange them into a track.' },
    { id:'toolkit', name:'Harmony Toolkit',
      blurb:'The chords that make a progression sound expensive.' },
    { id:'advanced',name:'Advanced Producer Theory',
      blurb:'Modes, borrowed chords and the map of all twelve keys.' },
    { id:'ear',     name:'Ear & Production Skills',
      blurb:'Recognise it without looking, and get unstuck when you are staring at an empty project.' }
  ];

  /* The path. Every lesson id appears exactly once; the tests enforce that. */
  const PATH = {
    start:    ['grid', 'accents', 'meter', 'pianoroll'],
    notes:    ['intervals', 'scales'],
    first:    ['chords', 'progressions', 'bassline', 'melody'],
    musical:  ['melody-chords', 'velocity'],
    finish:   ['eightbar', 'structure'],
    toolkit:  ['inversions', 'sevenths', 'suspensions', 'extensions'],
    advanced: ['modes', 'adv-intervals', 'harmonic-minor', 'dom-dim-aug', 'borrowed', 'circle'],
    ear:      ['beatblock', 'challenges']
  };

  /* Apply the path: stamp each lesson with its stage and sort into order.
     A lesson missing from PATH is kept at the end rather than dropped, so a
     half-finished new chapter is visible instead of silently invisible. */
  function apply(lessons) {
    const order = [];
    STAGES.forEach(s => (PATH[s.id] || []).forEach(id => order.push({ id, part:s.id })));
    const rank = {}, partOf = {};
    order.forEach((o, i) => { rank[o.id] = i; partOf[o.id] = o.part; });
    lessons.forEach(L => {
      /* `L.stage` is the 3D instrument; the curriculum grouping is `L.part` */
      L.part = partOf[L.id] || 'ear';
      L.rank = rank[L.id] == null ? 900 + lessons.indexOf(L) : rank[L.id];
    });
    lessons.sort((a, b) => a.rank - b.rank);
    return lessons;
  }
  const part = id => STAGES.filter(s => s.id === id)[0] || STAGES[STAGES.length - 1];
  const partIndex = id => STAGES.map(s => s.id).indexOf(id);

  return { STAGES, PATH, apply, part, partIndex };
})();

if (typeof LESSONS !== 'undefined') CURRICULUM.apply(LESSONS);
