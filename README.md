# MusicLearn — Producer Theory Lab

An interactive music theory course for producers. Twenty-six lessons, each attached to an
instrument you can play, with every sound generated live in the browser. No build step, no
framework, no dependencies to install — it is one HTML file, a stylesheet, and eleven scripts.

![The Scales lesson in the light theme](docs/light.png)

## What makes it different from reading a theory page

Every lesson drives a WebGL stage that changes instrument to match the topic:

| Stage | Used for | What you can do |
| --- | --- | --- |
| **Keyboard** | notes, intervals, scales, modes, chords, voicings | tap keys to hear them; chords appear as stacked, labelled tiles; intervals draw an arc with a dot per semitone |
| **Step grid** | the grid, strong/weak beats, meter | tap pads to build a beat; cell height shows how strongly a box lands |
| **Circle of fifths** | keys, modulation | tap a key to light its neighbours and hear its six-chord palette |
| **Piano roll** | melody writing, melody over chords, beat-block | draw notes on scale rows, see the contour ribbon, hear them over chord slabs |

Patterns, progressions and generated ideas survive a reading-level or theme switch, so changing
how a lesson is explained never throws away what you built in it — including edits you made to a
preset, which is what is kept rather than the preset's name.

Every instrument also has a **flat view**: the same keyboard, grid or roll drawn face-on, with a
name on every key and labelled lanes. Phones start there; on a desktop it is a toggle under the
stage. The circle of fifths has no face-on equivalent and keeps its 3D wheel.

Audio is a small Web Audio synth (triangle/saw voices, filter, envelope, convolution reverb)
plus a look-ahead step clock, so playback stays in time without blocking the UI.

## How a lesson opens

A lesson opens as the thing you **do**: the one-line lede, the interactive panel, the practice
round and the questions — around 220 words. The explanation sits under the lede behind one
expander that says how long it is (*"Read the full explanation · 357 words · 2 min"*), and stays
open or shut as you last left it. Nothing is hidden from anyone who wants it; it is just no longer
standing in front of the instrument. At 390px this took the average lesson from 3,512px of
scrolling to 1,784px.

## First run

A first visit asks three questions, each of which changes something: how much theory you already
have (which sets where the course opens), how it should be explained (the reading level), and how
long you want to practise a day (the length of the daily workout). One screen, skippable, never
shown again — and **Reset progress** brings it back. Nothing is locked either way: all 26 chapters
are in the sidebar from the first second.

## Two reading levels

The **Aa** button in the stage foot flips the text between:

- **Like I'm 5** — numbered steps and everyday analogies (apple vs strawberry for simple vs
  compound meter), written for someone who has never read a theory page. It is *longer* than the
  other level, not shorter: the same concepts, broken into smaller pieces.
- **Producer** — the dense version, in the vocabulary used in a studio.

The 3D stage, its controls and its audio are identical in both. Only the words change, so you can
switch mid-lesson without losing your place.

## Two themes

The light/dark toggle sits in that same **Aa** panel. With no explicit choice the page
follows the device setting; once you pick one it is remembered. The 3D stage is repainted too —
each theme has its own palette, lighting rig and label ink, so text drawn on a key always
contrasts with that key.

![The Circle of Fifths lesson in the dark theme](docs/dark.png)

## Curriculum

The path is built around making music, not around theory's own internal order: chords, a
bassline and a tune arrive before modes and extensions, and there is a capstone where the four
layers meet. `src/curriculum.js` holds the whole journey in one screen — change the order there,
never in a lesson.

| Stage | Lessons |
| --- | --- |
| **1 · Start Making Music** | The Grid · Strong and Weak Beats · Simple and Compound Meter · The Piano Roll |
| **2 · Notes & Keys** | Intervals · Scales |
| **3 · Build Your First Track** | Building Chords · Progressions That Work · **Basslines** · Melody Craft |
| **4 · Make It Musical** | Melody Over Chords · **Velocity and Groove** |
| **5 · Finish an 8-Bar Idea** | **Build an 8-Bar Idea** · **Song Structure** |
| **6 · Harmony Toolkit** | Inversions and Voicing · Seventh Chords · Suspensions · Chord Extensions |
| **7 · Advanced Producer Theory** | Modes · Advanced Intervals · Harmonic Minor · Dominant, Diminished, Augmented · Borrowed and Chromatic Chords · The Circle of Fifths |
| **8 · Ear & Production Skills** | A Cure for Beat-Block · Challenges |

The four chapters in bold are new: the bassline and arrangement material the course was missing,
velocity and groove as a first-class topic rather than a footnote, and a capstone that checks
your eight bars against a real list and exports the whole loop — drums, bass, chords and your
melody — as a MIDI file.

Progress is remembered per browser, and each lesson ends with self-check questions that explain
the answer either way.

**Completion and understanding are tracked separately.** "Mark this lesson done" records that you
worked through it; alongside it the sidebar keeps a **drill score** from the first answer you give
each question and from the ear-training drills, and flags any lesson you got something wrong in
with an amber `!` so you know what to revisit. You can reset a lesson's questions at any time.

## Practise it, then review what you missed

Fourteen lessons carry a short round under the text: **hear an example, name it, then build the
same thing on the instrument** — play that interval back from a given root, stack that chord, put
that pattern on the kick lane. Both halves are marked, and what you get wrong is recorded against
the *concept*, not the lesson.

Those misses collect into a **Review** page reachable from the sidebar. It asks the same idea
again with different notes, in a different key, on whichever instrument that concept belongs to —
switching the stage between a keyboard question and a drum-grid one as it goes. A concept leaves
the list after three right answers in a row, so the page empties as the gaps close. Alongside it
a table shows each concept's record, its last six attempts and its trend, so improvement is
visible rather than asserted.

The **ear-training drills** in lesson 22 write to the same record, so each answer is filed under
what was actually asked — the tritone, the half-diminished chord, degree 6. That gives the lesson
a per-drill breakdown (right, asked, recent runs, and the item you miss most) instead of one
lumped score, and it means a note you cannot hear turns up in the review like anything else, where
you have to name it *and* build it.

### A tick you earn

A lesson ticks itself off when the work is done, not when a button is pressed: every question
answered with at least two thirds right, plus — where the lesson has a practice round — one
concept landed in it. The chapters that are pure ear training count a correct drill run instead.
The line above the questions says out loud what the page is waiting for, and **Mark done anyway**
stays as an override. "Complete" should say something about what you can do.

**Reset progress** sits at the bottom of the sidebar and asks twice. It clears lesson ticks,
question answers, the review list and the three first-run answers — and deliberately leaves your
saved ideas alone, because those are work, not progress.

## Today — what to practise, and when

The app opens on **Today**, the first entry in the sidebar. Nothing on it is a second copy of your
progress: every number is derived from the practice log, so it cannot drift out of step with the
lessons.

- **Where you left off** — the first lesson you have not ticked, one tap away.
- **Today's practice** — a workout built for you: whatever is *due*, then whatever is *shakiest*,
  then something new from a lesson you have already reached. Pick 5, 10 or 15 minutes. It runs the
  same hear-it / name-it / build-it round the lessons use, swapping the instrument under each
  question so the thing being asked about is the thing on screen.
- **Needs work** — your weakest concepts with a mastery bar and the date each is next worth
  seeing.
- **The last seven days** — a day lights up when you answer at least one practice question.
- **Ideas you have kept** — your saved patterns, with a way back into the lesson that made them.

Two numbers drive all of it, per concept:

**Mastery** is accuracy with a weak prior — so one lucky answer is not mastery — plus your recent
five answers, plus how fresh it is. **The next review date** climbs a ladder as you get it right:
1, 2, 4, 8, 16, then 30 days. One wrong answer drops it back to today. `src/mastery.js` computes
both in the browser; `server/store.js` computes them the same way for the optional local server,
and a test asserts the two ladders agree.

## Studio — a channel rack of your own

**Studio** sits under **Today** in the sidebar. Rows are instruments, columns are time: four drum
parts, four bars, sixteen steps a bar. Tap a box once for a hit, twice for an accent, a third time
to clear it. Three kits, three starter patterns, a tempo, and a mixer with a level and a pan per
channel — plus mute and solo on every row, working the way a desk works: solo anything and
everything else goes quiet.

It is a real mixer, not a metaphor. Every channel has its own strip —

```
voice → gain → pan → master
             └→ send → reverb
```

— so turning the hat down turns down the hat and nothing else. Export writes a named MIDI track for
every part that plays, drums on the General MIDI drum channel, which is what a DAW expects to open.

The 3D stage is hidden here on purpose: a channel rack is a control surface and it wants the
screen, on a phone especially. Channel names stay pinned while the steps scroll.

This is the first three phases of [docs/STUDIO-PLAN.md](docs/STUDIO-PLAN.md) — the pitched rows, the
mixing lesson and the three-step *Make a Track* chapter come next.

## Keeping what you make

The six lessons with something worth keeping — the two drum-grid lessons, the three piano-roll
ones and the progression builder — carry a **Keep this** panel:

- **Undo and redo**, on the buttons or `Ctrl+Z` / `Shift+Ctrl+Z`.
- **Save** named ideas, which stay in this browser and can be reloaded later.
- **Export MIDI** — a standard MIDI file at the tempo shown, drums on the General MIDI drum
  channel with the right kick, snare and hat notes, so it drops straight into a DAW.

## Running it

Open `index.html` in a browser. That is the whole setup.

Three.js loads from a CDN, so the 3D stage needs a network connection the first time; if it
cannot be reached the lessons still read as text. To serve it locally:

```bash
python3 -m http.server 8000     # then open http://localhost:8000
```

To publish it, any static host works — including GitHub Pages (Settings → Pages → deploy from
the default branch, root folder).

## Single-file build

`build.js` inlines the stylesheet and all eleven scripts into one file:

```bash
node build.js              # → dist/musiclearn.html   standalone, open it anywhere
node build.js --artifact   # → dist/artifact.html     body-only, for claude.ai Artifacts
```

`index.html` stays the source of truth; the build only rewrites how it is packaged.
`dist/musiclearn.html` is committed so you can grab the whole app as one file; the artifact
variant is generated on demand and not tracked.

## Optional: keep your progress with the local server

The app is happy with no backend at all — everything falls back to `localStorage`. Run the
server when you want progress, mastery and saved ideas to outlive a cleared browser, or to be
shared between browsers on the same machine.

```bash
npm start            # or: node server/index.js   →  http://localhost:8787
```

No dependencies and nothing to install: it is `server/index.js` plus `server/store.js`, and the
whole database is a readable JSON file at `server/data/musiclearn.json`.

Open `http://localhost:8787` and the sidebar says *Saving to your local server*. Nothing else
changes. Wipe your browser storage, reload, and your lessons, drill answers, practice record,
streak and preferences come back.

That works because the browser's id is not the only copy of who you are: a browser arriving with
no id asks the server whose machine this is, and adopts the newest record that has work in it —
never an empty one. It is safe here only because this server is one person's localhost with no
accounts, which is also why it is the first thing to change if this ever grows real ones.

**Entities** — the model a real backend would need, already in place:

| Entity | What it holds |
| --- | --- |
| `User` | who is learning (no auth: it is localhost) |
| `Skill` | one thing worth knowing — an interval, a chord type, a scale degree |
| `Attempt` | one answer, right or wrong, with when and how long it took |
| `SkillMastery` | accuracy, recent form and recency, rolled into one 0–1 number |
| `ReviewSchedule` | when that skill is next due — right answers push it out, a wrong one brings it back to today |
| `Project` | something you made and kept |
| `Session` | one row per day practised, which is what a streak is |

**API** — `GET /api/health`, `GET|POST /api/users`, `PUT /api/users/:id`,
`GET /api/profile/:id`, `PUT /api/progress/:id`, `POST /api/attempts/:id`,
`GET /api/review/:id`, `GET|POST /api/projects/:id`, `DELETE /api/projects/:id/:projectId`,
`GET /api/stats/:id`.

**Swapping the storage** — `server/store.js` is one object with one set of methods. A Postgres
or Supabase version means writing another object with the same methods; nothing above that file
knows how rows are kept. The two formulas that decide what you practise next (mastery, and the
review ladder) live there too, documented and unit-tested.

## Layout

```
index.html              the app shell — markup, fonts, script order
build.js                single-file bundler
server/index.js         optional local server: serves the app and a small JSON API
server/store.js         storage + the mastery and review formulas (swap this for a database)
src/sync.js             optional client: mirrors progress to that server, no-ops without it
src/curriculum.js       the journey — stages and lesson order, in one screen
test/check-theory.js    theory, curriculum and lesson-data assertions across all twelve keys
test/check-api.js       the server: every endpoint, plus the mastery and scheduling maths
test/check-behaviour.js what the lessons DO — mode switches, presets, controls, MIDI, practice
src/styles.css          design tokens; light palette on :root, dark under the toggle + media query
src/theory.js           T = pitch/scale/chord maths · A = synth, drum voices, look-ahead clock
src/mixer.js            MIXER = one gain/pan/send strip per channel, with mute and solo
src/instruments.js      eight pitched presets and three drum kits, written as data
src/rack.js             RACK = the channel rack, its project and its MIDI export
src/icons.js            ICONS = one inline SVG sprite; decorates '▶ Play'-style labels
src/scenes.js           V = one WebGL canvas: four instruments, the Today path, effects, both palettes
src/ui.js               UI = control builders · APP = nav, rendering, progress, mode, theme
src/practice.js         PRACTICE = hear it / name it / build it, and the record of what you missed
src/mastery.js          MASTERY = mastery scores, review dates, the day's workout, the streak
src/studio.js           STUDIO = undo, saved ideas, and the MIDI file writer
src/flat.js             FLAT = the same instruments drawn face-on, from the a11y descriptor
src/lessons-level1.js   LESSONS 1–9    (producer text, 3D wiring, quizzes)
src/lessons-level2.js   LESSONS 10–17
src/lessons-level3.js   LESSONS 18–22
src/simple-level1.js    SIMPLE text for lessons 1–11
src/simple-level2.js    SIMPLE text for lessons 12–22
docs/UX-BENCHMARK.md    how this compares with Yousician, Simply Piano, flowkey, Melodics et al
docs/STUDIO-PLAN.md     design for the channel rack and the three-step Make a Track chapter
docs/UI-AUDIT.md        visual and interaction audit, with Three.js specs for the 3D changes
docs/SOURCES.md         conventions, references, corrections log
docs/                   README screenshots
```

### Adding or editing a lesson

A lesson is plain data plus one setup function:

```js
LESSONS.push({
  id:'intervals', level:1, tag:'Pitch', title:'Intervals',
  lede:'One sentence that frames the lesson.',
  stage:{ view:'keys', cfg:{ lo:48, hi:72, labels:'names' } },
  blocks:[
    { h:'A heading' },
    { p:'A paragraph, with <b>markup</b> allowed.' },
    { keys:['a bullet', 'another'] },
    { note:{ h:'Aside', p:'A boxed remark.' } },
    { table:{ head:['A','B'], rows:[['1','2']] } },
    { try:{ h:'Try it', p:'What to do.', build:ctx => [ UI.btn('Play', () => ctx.demo()) ] } }
  ],
  quiz:[ { q:'Question?', a:['wrong','right'], c:1, why:'Why that is the answer.' } ],
  init:ctx => { /* wire the 3D view: ctx.v, ctx.read(), ctx.seq(), ctx.stage() */ }
});
```

`views` are `keys`, `grid`, `wheel` and `roll`. Inside `init`, `ctx.v` is the live view,
`ctx.read()` writes the HUD readout, `ctx.stage(...)` adds controls under the stage, and
`ctx.seq({bpm, div, steps, cb})` runs the transport.

The simple-mode text for a lesson lives in `SIMPLE[<lesson id>]` with the same `blocks` shape. A
simple-mode `try` block carries `{ use:true }` instead of a `build`, and the renderer reuses that
lesson's own controls, so an interaction is only ever written once.

## Accessibility

The 3D stage is marked decorative, and every instrument it draws is mirrored as real HTML
buttons under it — *Instrument controls*, open on demand and always present in the accessibility
tree. Each key, pad and tile is a focusable `<button>` with a spoken label ("C4, white key";
"Kick, step 3 of 16, beat 1, on"), the piano roll gets a compact add/remove form instead of 240
buttons, and the readout above the lesson is a polite live region, so what the instrument just
did is announced as text.

Those buttons are built *after* the lesson has loaded and re-read from the instrument after every
change, so what a screen reader announces is the instrument's real state rather than a guess about
what the last tap did. Only attributes that actually changed are rewritten, so a running playhead
repainting many times a second does not make a screen reader chatter through the loop. The flat
view is drawn from the same descriptor, which is why it follows every lesson without any lesson
knowing it exists.

## Accuracy

Theory here is **generated, not typed**: scales, chords, intervals, diatonic sets, roman numerals
and note spellings all come from `src/theory.js`, so a lesson cannot display a chord name that
contradicts the notes it plays. Note names are spelled by letter degree, which is why C minor
reads C–E♭–G rather than C–D♯–G.

```bash
npm test                      # all three suites
node test/check-theory.js     # 765 assertions: theory in all twelve keys, plus the curriculum
node test/check-behaviour.js  # 674 assertions: lesson wiring, practice, review, flat view
node test/check-api.js        # 43 assertions: the server and its two formulas
```

The first covers the engine in every key plus the lesson data (answer indices in range, distinct
options, no note-set answers that are merely reorderings of each other, both reading levels
present).

The second runs the real lesson code against a recording stand-in for the stage, and covers the
things that break when two parts of the app describe the same thing differently:

- a chord's name, its written notes and the notes it plays agree, in every scale and on every degree;
- switching reading level keeps an edited progression, and every control comes back showing what
  is actually loaded;
- a preset change is saved and announced to the accessible panel, which exposes the same number of
  steps the lesson is really using;
- the two reading levels' questions score separately;
- ear training never lights a key it did not play, in any drill, at any register;
- a practice round's notes always fit the keyboard that lesson puts on stage;
- the review asks the concept you missed, with different notes, still among several options;
- the MIDI it writes decodes back to the notes, channels and tempo it claims;
- every ear-training drill records a concept the review knows how to ask again.

All 26 lessons are also walked in a headless browser in both reading levels, both themes and both
instrument views, clicking every control and every quiz option.

What it does not cover: pedagogy, lesson ordering and the wording of explanations — this has not
had a music-educator review. Conventions used, references, and the list of corrections already
applied are in [docs/SOURCES.md](docs/SOURCES.md). Corrections are welcome via
[an issue](https://github.com/virtuosolefty/MusicLearn/issues/new).

## Known gaps

Honest list of what this is not, so nobody is misled:

- **Not reviewed by a music educator.** The maths is verified; the teaching is not peer-reviewed.
- **Eight lessons have no practice round.** The fourteen whose own instrument can express what
  they teach have one. Meter, inversions, borrowed chords, the circle and the three melody
  lessons do not — their ideas need a build step that has not been designed yet.
- **Practice does not cover every lesson.** Sixteen of the twenty-six carry a hear-it/name-it/
  build-it round; the rest end at the quiz.
- **Saved work is per browser.** Ideas and progress live in `localStorage`: no account, no sync,
  and clearing site data clears them. MIDI export is the way to take work with you.
- **The schedule is a heuristic, not a study.** The ladder (1, 2, 4, 8, 16, 30 days) and the
  mastery weighting are reasonable spacing defaults, not values tuned against outcome data from
  real learners.
- **Genre references are broad.** Where a lesson says a style "uses" something, it is pointing at
  a tendency, not citing a specific record.

## Credits

Built as a companion to the concepts in the Red Bow Music *"All The Music Theory A Producer
Needs"* curriculum (Levels 1–3). The explanations, exercises and code here are original work
written against that syllabus — none of the course's own material is reproduced. If you want the
course itself, it is at [redbowmusic.com](https://redbowmusic.com/).

Type: Bricolage Grotesque, Newsreader and IBM Plex Mono via Google Fonts. 3D: Three.js.
