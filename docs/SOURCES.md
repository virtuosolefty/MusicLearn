# Sources, conventions and corrections

## How this course is checked

The theory in MusicLearn is **generated, not typed**. Scales, chords, intervals, diatonic sets,
roman numerals and note spellings all come from `src/theory.js`, so a lesson cannot display a
chord name that disagrees with the notes it plays. `test/check-theory.js` asserts that engine
against theory in **all twelve keys** and checks the lesson data for structural problems
(answer indices in range, distinct options, note-set options that are merely reorderings of
each other, every lesson present in both reading levels):

```bash
node test/check-theory.js
```

What that does **not** cover: pedagogy, ordering, and the wording of explanations. This course
has not been reviewed by a credentialed music educator. If you are one and want to correct
something, please open an issue — see *Corrections* below.

## Naming conventions used here

Music theory has more than one vocabulary. Where terms differ, the lessons name both and then
pick one:

| Concept | Used in the lessons | Also called |
|---|---|---|
| V → I | authentic cadence, "perfect" | perfect cadence (British) |
| Phrase ending on V | half cadence | imperfect cadence (British) |
| V → vi | deceptive cadence | interrupted cadence (British) |
| IV → I | plagal cadence | — |
| 9th added with no 7th | `add9` | `add2` when voiced low, next to the root |
| Note names | spelled by letter degree (C minor is C–E♭–G) | — |

Two further conventions worth stating, because they are common sources of confusion:

- **Time signatures.** The top number counts *units*, and the bottom number says which note
  value a unit is. In **simple** meters the unit is the beat, so the top number is also the beat
  count (3/4 = three beats). In **compound** meters the units group in threes, so the beats are
  dotted and there are `top ÷ 3` of them — 6/8 has **two dotted-quarter beats**, not six.
- **Spelling depends on function, not pitch.** The third of a C minor chord is E♭ because a third
  is always two letters above its root. D♯ is the same key on a keyboard and the wrong name in
  that chord.

## References

Used while writing and correcting these lessons:

- [Open Music Theory](https://viva.pressbooks.pub/openmusictheory/) — general reference; in
  particular [compound meters and time signatures](https://viva.pressbooks.pub/openmusictheory/chapter/compound-meters-and-time-signatures/)
  and [chord symbols](https://viva.pressbooks.pub/openmusictheory/chapter/chord-symbols/).
- [Music Theory for the 21st-Century Classroom — Cadences](https://musictheory.pugetsound.edu/mt21c/cadences.html)
  (Kris Shaffer et al.) — cadence types and the two naming traditions.
- [Comprehensive Musicianship — Intervals](https://iastate.pressbooks.pub/comprehensivemusicianship/chapter/4-1-intervals-tutorial/)
  — interval naming, including why letter spelling matters as well as semitone count.
- [musictheory.net exercises](https://www.musictheory.net/exercises) — the model for
  adjustable-difficulty identification and ear-training drills.
- [Ableton Learning Music](https://learningmusic.ableton.com/) — the model for short
  explain-then-try cycles aimed at producers.

Curriculum shape follows the Red Bow Music *"All The Music Theory A Producer Needs"* syllabus
(Levels 1–3). None of that course's material is reproduced here; the explanations, examples and
code are original.

## Corrections

Found something wrong? Please
[open an issue](https://github.com/virtuosolefty/MusicLearn/issues/new) with the lesson name,
what it showed, and what it should show. Corrections to the theory engine are the most valuable,
because everything the lessons display is derived from it.

### Corrections already applied

| Lesson | Was | Now |
|---|---|---|
| Circle of Fifths | selecting C labelled ii = Em, iii = Bm | ii and iii read off the inner ring correctly (C → ii Dm, iii Em, vi Am), verified in all twelve keys |
| Progressions | a preset labelled **V** played **v** in natural minor | preset labelled `i–iv–VI–v`, plus a separate harmonic-minor preset that really does play **V** |
| Suspensions | after "Resolve to major" the chord was still labelled Asus4 with "no 3rd" | renames itself to A major and names C♯ as the restored third |
| Simple and Compound Meter | caption promised 2 subdivisions per beat; the grid played 4 | simple mode now plays 8 eighth notes in 4/4 against 12 in 12/8, pulse held constant, with a separate button to subdivide further |
| Progressions (cadences) | V → vi grouped with "imperfect" | half cadence (ending on V) and deceptive cadence (V → vi) separated, with both naming traditions given |
| Chord and scale readouts | C minor displayed as C–D♯–G | letter-degree speller: C–E♭–G, and correct spelling in every key |
| Chord Extensions quiz | accepted `C E G D` and rejected `C D E G` for Cadd9 | question replaced with one that has no reordering ambiguity; `add2`/`add9` voicing convention explained |
| Progressions | "the dominant contains the leading note and the tritone" | the V triad has no tritone; V7 does (B–F in C major) — stated in both modes |
| Dominant, Diminished, Augmented | dim7 "belongs to no key, fits almost anywhere" | it is vii°7 of a minor key; its symmetry buys re-interpretation, not a free pass |
| Scales / Melody Craft | staying in the scale implied nothing would clash | in-key and in-chord separated from the start, with a forward reference to Melody Over Chords |
| Several lessons | major = happy, minor = sad, borrow for one or two bars, 7ths sound more professional | stated as tendencies to test by ear, with the cases where they do not hold |
| Progressions (harmonic minor, degree 3 with 7ths) | labelled **E♭7♯5** while playing and lighting E♭ G B D | an augmented triad with a major 7th is a different chord from `aug7`: the engine gained `augMaj7`, so it reads **E♭maj7♯5**, and the seventh's quality is now chosen from the interval rather than the triad alone |
| Seventh Chords | adding a 7th "softens the push of a V chord" | adding the 7th to V *increases* the pull — V7 holds a tritone the triad does not. The extra weight in the texture is a separate matter, and is now described as one |
| Harmonic Minor | raising the 7th "turns the chord on 5 into G7" | it turns it into **G major** (G–B–D); the raised 7th is the chord's third. Adding F is the further step that makes it G7 |
| Challenges (hard mode) | could play a note above the keyboard and then highlight a clamped substitute — C4 → D5 shown as C4 → C5 | the stage spans three octaves and whole examples transpose together, so a lit key is always a key that sounded, spelled the way the explanation spells it |
