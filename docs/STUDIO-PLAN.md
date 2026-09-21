# Plan — the last chapter becomes a studio

**Goal.** Replace the end of the course with the thing the whole course was for: making a track.
Three steps, in the order a producer actually works — **pick the sounds, place them in a channel
rack, mix them** — on a surface that stays open afterwards as free space, so you can add
instruments, put them in bars, hit play and swap them around.

**Phases 1–3 of section 6 are built** — the mixer, the instrument presets and the channel
rack, reachable as **Studio** in the sidebar. Everything else below is still the design to
argue with.

---

## 1. Why three steps, and these three

FL Studio's own manual gives the workflow as **load instruments → sequence → arrange → mix →
export**. Collapsing arrange into sequence (we are working at loop length, not song length) leaves
exactly three decisions, and they are the three that separate a track that sounds produced from
one that sounds like an exercise:

| Step | The producer decision | What it teaches |
|---|---|---|
| **1 · Pick the sounds** | Which kit, which bass, which chord sound | Sound choice carries more genre than any chord does |
| **2 · Place them** | What plays on which box of which bar | Arrangement is subtraction; parts take turns |
| **3 · Mix them** | Level, pan, space | Balance before anything clever |

Everything the course already taught — the grid, intervals, progressions, basslines, melody,
velocity — becomes material you spend here. That is the point of putting it last.

---

## 2. Where it lives

- **`make-track`** — a new final chapter in the *Ear & Production Skills* stage, after
  `beatblock` and `challenges`, with three steps in one page.
- **Studio** — the same surface, minus the teaching, as a permanent nav entry beside **Today**.
  Finishing step 3 hands you there.

The important property: **you learn on the instrument you will keep using.** The three steps are
not a simulation of a studio, they are the studio with a guide rail on top. Compare Melodics, where
the lesson player and the practice tool are the same screen, against the apps where the lesson is a
video of something you then do elsewhere.

`eightbar` stays where it is. It is the guided version — four fixed layers, graded. `make-track` is
the open version. One proves you can follow a recipe; the other is an empty project.

---

## 3. UI references worth stealing from

- **FL Studio's Channel Rack** — the layout is the target: one row per instrument, each row
  carrying a mute LED, a volume knob, a pan knob and a name on the left, and the 16 step buttons on
  the right. Rows are instruments, columns are time. Nothing else on screen.
- **Chrome Music Lab's Song Maker** — reviewers call it "the most approachable website for making
  music online". Its trick: the grid *is* the interface. No file menu, no dialogs, no settings.
- **Ableton's Learning Music** — "click in the grid boxes to make your own version by creating or
  deleting notes", with the explanation above the grid and nothing between you and it.
- **BeepBox** — stores the whole song in the URL, so sharing is a link. Cheap to copy, and this app
  already has no accounts.
- **PatternSketch** — "preset patterns" and a choice of drum kits, so the empty state is never
  truly empty.

What none of them do well, and we should: **say why**. A rack with a one-line reason next to each
sound ("sub — felt, not heard; keep it mono") is the thing a theory course can add that a toy
sequencer cannot.

---

## 4. What has to be built

### 4.1 The audio engine has no mixer (the real blocker)

Today every voice in `src/theory.js` connects straight to one `master` gain, with a fixed reverb
send. There is no per-instrument level, no pan, no mute. Step 3 is impossible until that changes.

**Change:** a channel strip per instrument.

```
voice → [channel gain] → [stereo panner] → master → destination
                      └→ [send gain] → convolver → master
```

- `A.channel(id)` creates or returns a strip: `{gain, pan, send, mute, solo}`.
- `A.note(midi, dur, {ch})` and `A.click(kind, when, vel, {ch})` route into that strip instead of
  master. With no `ch` they behave exactly as now, so **every existing lesson is untouched**.
- Solo is computed, not stored per strip: any strip soloed mutes the rest.

New file `src/mixer.js`, or an extra section in `theory.js` — probably its own file, since
`theory.js` is already the biggest thing in `src/`.

### 4.2 Instruments are two timbres, and need to be eight

`A.note` has one voice with a `pad` flag. That is enough to demonstrate an interval and nowhere
near enough to "pick a sound".

**Change:** `src/instruments.js` — a table of presets, each one data, not code:

```js
{ id:'sub',   name:'Sub bass',  role:'bass',
  oscs:[['sine',0.9,0],['triangle',0.25,-1200]],
  filter:{ type:'lowpass', from:m => 380, to:m => 180, q:0.7 },
  env:{ a:0.006, d:0.12, s:0.8, r:0.18 }, gain:0.9, pan:0, send:0.02,
  why:'Felt more than heard. Keep it mono and low.' }
```

Eight is the right number — enough to change the genre, few enough to audition in a minute:

| Role | Presets |
|---|---|
| Drums | 808 kit · Acoustic kit · Lo-fi kit *(parameter variants of the existing kick/snare/hat)* |
| Bass | Sub · Pluck bass |
| Chords | Warm pad · Electric keys |
| Lead | Square lead · Bell |

Drum kits are the cheapest win: `click()` already takes a kind and a velocity; a kit is a set of
numbers (pitch sweep, noise length, filter corner) rather than new code.

### 4.3 The channel rack is DOM, not WebGL

The 3D stage is right for teaching one idea at a time. A channel rack is a dense control surface —
eight rows of knobs, names and 16 toggles. `src/flat.js` already proves DOM instruments work here,
and they are accessible for free.

**Layout, desktop:**

```
┌─ transport ─────────────────────────────────────────────────┐
│  ▶  ■   96 BPM   bar 1 2 3 4   [+ add instrument]           │
├─ rack ──────────────────────────────────────────────────────┤
│ ● Kick      [vol][pan]  ■·■·■·■·■·■·■·■·  ← 16 steps        │
│ ● Snare     [vol][pan]  ··■···■···■···■·                     │
│ ● Sub bass  [vol][pan]  ▣───▣───▣───▣───  ← notes, not steps│
│ ● Warm pad  [vol][pan]  ▣───────▣───────                     │
├─ selected channel ──────────────────────────────────────────┤
│  Sub bass · change sound ▾ · open piano roll · clear         │
└─────────────────────────────────────────────────────────────┘
```

- A **drum row** is 16 toggles, as now.
- A **pitched row** is 16 cells too, but a cell holds a note. Tap to place the current chord's root;
  tap-and-hold (or the roll button) to open the existing `roll` view for that channel. This is the
  compromise that keeps one grid for everything.
- **Bars**: 4 bars of 16 steps. The bar selector swaps which bar the grid shows; a channel can be
  off for a bar, which is how arrangement-by-subtraction gets taught without a second screen.

**Mobile (390px)** — the constraint that decides the design:

- Channel names and the mute dot freeze on the left; the 16 steps scroll horizontally.
- The mixer is a bottom sheet, not a column.
- Tapping a row name zooms to that one channel full-width — the "one channel at a time" mode.

### 4.4 The data model

One object, saved through `STUDIO` and synced by `src/sync.js` like everything else:

```js
{ bpm:96, key:'C', scale:'minor', bars:4,
  channels:[
    { id:'c1', name:'Kick', preset:'kit808.kick', vol:0.9, pan:0, mute:false, send:0,
      steps:[[1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0], /* bar 2 */ …] },
    { id:'c3', name:'Sub bass', preset:'sub', vol:0.8, pan:0, mute:false, send:0.05,
      notes:[{ bar:0, step:0, midi:36, len:4, vel:105 }, …] }
  ] }
```

Flat, JSON-safe, diffable. The existing save/undo history in `src/studio.js` works on it unchanged.

### 4.5 Export has to become multi-track

`STUDIO.midi()` writes a format-1 file with a tempo track and **one** note track on one channel. A
four-instrument project needs four.

**Change:** `STUDIO.midiMulti(tracks, opt)` — same encoder, `1 + n` tracks, each with its own name
and channel, drums forced to GM channel 9. Roughly thirty lines; `midi()` stays as a one-track
wrapper so nothing that calls it breaks.

---

## 5. The three steps, concretely

### Step 1 — Pick your sounds

The rack starts with four empty slots labelled by **role**, not instrument: *drums, bass, chords,
top line*. That framing is the lesson: a track is four jobs, and you are casting them.

Each slot opens a picker — the preset name, its one-line reason, and a **hear it** button that
plays it over whatever is already in the rack, so the choice is made in context rather than in
isolation. A **surprise me** button fills all four, because an empty project is the single most
common place a beginner stops.

*Teaching point:* the same four bars with an 808 kit and a sub is trap; with the acoustic kit and
electric keys it is soul. Nothing about the notes changed. Offer exactly that A/B as one button.

### Step 2 — Place them in the rack

Start the drums with a preset pattern rather than an empty grid (PatternSketch's move), then:

1. Steps for drums — the grid lesson, now with a kit you chose.
2. One note per bar for the bass — the root of each chord in the progression, which is the
   `bassline` chapter's first exercise, now in the rack.
3. A chord per bar — placed as a block, from the key the project is in.
4. The top line last, over four bars, and only where the others leave a gap.

**Bars 1–4 with a channel toggled off per bar** is the arrangement lesson: play the same four
bars with the pad off in bar 1 and it becomes an intro. That is the whole of `structure`, made by
tapping four checkboxes.

*Grading, if any:* none. Step 2 finishes when you press play and like it. A check here would be the
"praise for a bad take" failure that flowkey is criticised for, or the harsh-scoring failure that
Melodics is criticised for. Neither is worth it.

### Step 3 — Mix them

Levels, pan and space, taught in the order engineers actually use, one control at a time and each
one unlocked by the last:

1. **Drums first, and loudest.** Set the kick, then everything against it.
2. **Bass to the kick.** If they fight, one moves — level, or timing.
3. **Pan to make room.** Drums and bass stay centre; anything doubled goes wide.
4. **Space last.** One reverb send, not an effects chain: the point is the *idea* that space is a
   send, not a lesson in reverb design.

A **compare** button flips between your mix and a flat one (everything at unity, dead centre), which
is the fastest way to hear that mixing is a real thing and not a mystery.

### Then: the Studio

Step 3 ends on a button that says "keep going" and drops the guide rail. Same rack, same project,
plus: add or remove channels, change any sound, more bars, save, export MIDI, share by URL.

---

## 6. Build order

> **Phases 1–3 are built** (2026-09-21). What changed against the plan: the level and pan controls
> left the step row and became a Mix panel under the grid, because on a 390px screen the knobs were
> eating the width the steps needed — and a mixer is a separate surface in every DAW anyway. The
> rack also shipped with its own page rather than waiting for phase 7, since a component with
> nowhere to live cannot be tried. Steps have three states, not two: off, hit, accent.
> The plan's claim that `theory.js` is "the biggest thing in src/" was wrong — it is 350 lines
> against `scenes.js` at 950 — but the mixer got its own file anyway, for a better reason: the
> engine now knows nothing about mixing, it just plays into whatever node it is handed.

| Phase | What ships | Why this order |
|---|---|---|
| **1** ✅ | Mixer strips in the audio engine (4.1) + `midiMulti` (4.5) | Nothing visible, everything depends on it; existing lessons keep working |
| **2** ✅ | `src/instruments.js` with eight presets, auditioned from a throwaway page | Sound design is the part most likely to need iteration by ear |
| **3** ✅ | The rack component: rows, steps, transport, bars — drums only | Proves the grid and the mobile layout before pitched parts complicate it |
| **4** | Pitched rows, roll hand-off, the project data model, save/export | The rack becomes a real instrument |
| **5** | The mixer surface: vol, pan, mute, solo, send, compare | Step 3 has something to teach on |
| **6** | `make-track` chapter: the three steps as a guide rail over the finished rack | The teaching goes on last, over a tool that already works |
| **7** | Studio as a nav entry, URL sharing | The thing they keep |

Phases 1–3 are the risky half. If the rack does not feel good on a phone at phase 3, the design
above is wrong and it is cheap to find out there.

---

## 7. What this deliberately does not become

- **No audio upload or sampling.** Everything stays generated in the browser — no file handling,
  no licensing, nothing to host. That is a feature of this project, not a limitation to fix.
- **No effects chain.** One reverb send. A compressor the learner cannot hear the point of is
  worse than no compressor.
- **No automation lane, no time-stretching, no plugin format.** This is a teaching studio. When
  someone outgrows it the MIDI export is the exit, and that exit already exists.
- **No account or cloud project store.** Local, plus the optional localhost server that is already
  there.

---

## Sources

- [FL Studio manual — basics of the workflow](https://www.image-line.com/fl-studio-learning/fl-studio-online-manual/html/basics_workflow.htm)
- [How to use the Channel Rack in FL Studio — Audeobox](https://www.audeobox.com/learn/fl-studio/how-to-use-the-channel-rack-in-fl-studio/)
- [FL Studio Channel Rack complete guide — Zeverb](https://zeverb.com/blog/fl-studio-channel-rack-a-complete-guide)
- [The 8 best online sequencers — Online Tech Tips](https://www.online-tech-tips.com/the-8-best-online-sequencers-for-music-enthusiasts/)
- [Chrome Music Lab — Song Maker](https://musiclab.chromeexperiments.com/Song-Maker)
- [Ableton — Learning Music, Make Beats](https://learningmusic.ableton.com/make-beats/make-beats.html)
- [Best online DAWs 2026 — Slooply](https://slooply.com/blog/best-online-daws/)
