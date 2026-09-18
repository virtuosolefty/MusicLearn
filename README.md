# MusicLearn — Producer Theory Lab

An interactive music theory course for producers. Twenty-two lessons, each attached to a 3D
instrument you can play, with every sound generated live in the browser. No build step, no
framework, no dependencies to install — it is one HTML file, a stylesheet, and eight scripts.

![The Scales lesson in the light theme](docs/light.png)

## What makes it different from reading a theory page

Every lesson drives a WebGL stage that changes instrument to match the topic:

| Stage | Used for | What you can do |
| --- | --- | --- |
| **Keyboard** | notes, intervals, scales, modes, chords, voicings | tap keys to hear them; chords appear as stacked, labelled tiles; intervals draw an arc with a dot per semitone |
| **Step grid** | the grid, strong/weak beats, meter | tap pads to build a beat; cell height shows how strongly a box lands |
| **Circle of fifths** | keys, modulation | tap a key to light its neighbours and hear its six-chord palette |
| **Piano roll** | melody writing, melody over chords, beat-block | draw notes on scale rows, see the contour ribbon, hear them over chord slabs |

Audio is a small Web Audio synth (triangle/saw voices, filter, envelope, convolution reverb)
plus a look-ahead step clock, so playback stays in time without blocking the UI.

## Two reading levels

A switch at the top of every lesson flips the text between:

- **Like I'm 5** — numbered steps and everyday analogies (apple vs strawberry for simple vs
  compound meter), written for someone who has never read a theory page. It is *longer* than the
  other level, not shorter: the same concepts, broken into smaller pieces.
- **Producer** — the dense version, in the vocabulary used in a studio.

The 3D stage, its controls and its audio are identical in both. Only the words change, so you can
switch mid-lesson without losing your place.

## Two themes

A light/dark toggle sits next to the reading-level switch. With no explicit choice the page
follows the device setting; once you pick one it is remembered. The 3D stage is repainted too —
each theme has its own palette, lighting rig and label ink, so text drawn on a key always
contrasts with that key.

![The Circle of Fifths lesson in the dark theme](docs/dark.png)

## Curriculum

**Level 1 · Fundamentals** — The Grid · Strong and Weak Beats · Simple and Compound Meter ·
The Piano Roll · Intervals · Scales · Modes · Building Chords · Progressions That Work

**Level 2 · Harmony** — Advanced Intervals · Seventh Chords · Chord Extensions · Suspensions ·
Inversions and Voicing · Dominant, Diminished, Augmented · Harmonic Minor · Borrowed and
Chromatic Chords

**Level 3 · Pro moves** — The Circle of Fifths · Melody Craft · Melody Over Chords ·
A Cure for Beat-Block · Challenges (ear-training drills)

Progress is remembered per browser, and each lesson ends with self-check questions that explain
the answer either way.

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

`build.js` inlines the stylesheet and all eight scripts into one file:

```bash
node build.js              # → dist/musiclearn.html   standalone, open it anywhere
node build.js --artifact   # → dist/artifact.html     body-only, for claude.ai Artifacts
```

`index.html` stays the source of truth; the build only rewrites how it is packaged.
`dist/musiclearn.html` is committed so you can grab the whole app as one file; the artifact
variant is generated on demand and not tracked.

## Layout

```
index.html              the app shell — markup, fonts, script order
build.js                single-file bundler
src/styles.css          design tokens; light palette on :root, dark under the toggle + media query
src/theory.js           T = pitch/scale/chord maths · A = synth, drum voices, look-ahead clock
src/scenes.js           V = one WebGL canvas with four swappable instruments + both palettes
src/ui.js               UI = control builders · APP = nav, rendering, progress, mode, theme
src/lessons-level1.js   LESSONS 1–9    (producer text, 3D wiring, quizzes)
src/lessons-level2.js   LESSONS 10–17
src/lessons-level3.js   LESSONS 18–22
src/simple-level1.js    SIMPLE text for lessons 1–11
src/simple-level2.js    SIMPLE text for lessons 12–22
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

## Accuracy

Every scale, chord, interval and diatonic table is generated from `src/theory.js` rather than
typed by hand, and was checked against theory programmatically. All 22 lessons have been walked
in a headless browser in both reading levels and both themes, clicking every control and every
quiz option.

## Credits

Built as a companion to the concepts in the Red Bow Music *"All The Music Theory A Producer
Needs"* curriculum (Levels 1–3). The explanations, exercises and code here are original work
written against that syllabus — none of the course's own material is reproduced. If you want the
course itself, it is at [redbowmusic.com](https://redbowmusic.com/).

Type: Bricolage Grotesque, Newsreader and IBM Plex Mono via Google Fonts. 3D: Three.js.
