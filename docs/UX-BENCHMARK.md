# Usability benchmark — Producer Theory Lab against the market

What the leading music-learning apps do, why it works, and the changes worth making here.
Researched 2026-09-20. Every competitor claim is sourced at the bottom; every claim about *this*
app is a measurement taken from the current build, and the measurement is given.

---

## 1. How the market teaches

| App | Model | Session shape | Feedback | What it is best at |
|---|---|---|---|---|
| **Duolingo** (not music, but the pattern everyone copies) | Single guided Path | One short lesson, explicit end | Instant, per-answer | Knowing what to do next |
| **Simply Piano** | Sequential courses, mic detection | Short steps, gated progression | Green / red / yellow note lights | Getting a true beginner playing in week one |
| **Yousician** | Missions + Workouts | Song run, scored | Real-time pitch detection, Gold Stars | Engagement through game mechanics |
| **flowkey** | Song library + courses | Play a song, your pace | Wait-mode, hands separate, loops | Practice *tools* (slow down, loop, hands) |
| **Melodics** | Daily 5-minute practice | Hard stop at 5 min on free tier | Strict per-note scoring | The daily habit |
| **SmartMusic** | Assigned repertoire | Teacher-set | Green/red pitch + rhythm assessment | Measured assessment |
| **Hooktheory** | Interactive book + Hookpad | Read, then compose | None (it is a tool) | Theory taught through real songs |
| **musictheory.net / Teoria** | Reference + drills | Untimed drills | Right/wrong | Depth, free, no account |
| **Ableton Learning Music** | Interactive explainers | Self-paced | None | Making the concept playable in the page |

### What consistently works, and why

**A single obvious next action.** Duolingo replaced its skill tree with one linear Path because
learners "are not sure whether they're using Duolingo the 'correct' or 'best' way." The Path
removes the choice and states the next step. The cost is real — users complained "I feel like I'm
in a straight jacket" and lost easy access to reviewing a chosen skill — so the pattern that
actually wins is **one recommended next step, with the full list still one tap away.**

**A bounded session with a visible end.** Growth.design's teardown calls this *exit points*:
"allow users to disengage from your product with a sense of completion", rather than associating
it with a never-ending list of tasks. Melodics builds its whole free tier around a 5-minute daily
cap; Waay is praised for "5–6 minute video lessons" that keep sessions focused. Length is not the
point — **a defined end is.**

**Immediate value before any commitment.** Duolingo gets a user to a finished lesson and XP "within
15 minutes" *before* asking for a profile. Simply Piano's most-praised property is speed to a first
win: "start your first lesson in just a few minutes."

**A short personalising intake.** All three piano apps ask before they show. Yousician asks about
your instrument and "what kind of things you can play"; flowkey asks about prior experience and
what you are here for — songs, theory, or starting from nothing; Simply Piano asks experience
level, piano goals and "preferred musical genres". Reviewers describe flowkey's interface as the
"user-friendly" one of the group. Simply Piano's intake is praised for speed but criticised for
being shallow: the reviewer wishes "the questions could be more in-depth".

**Practice tools, not just a play button.** flowkey's slow-down (50/75/100%), hands-separate,
loop-a-section and wait-mode are the features reviewers single out; Melodics breaks a lesson "into
smaller chunks, allowing you to work on just the parts you're having problems with", and lets you
slow a passage and loop bars. This is the difference between a demo and a practice instrument.

**Feedback that names the error.** SmartMusic highlights correct pitches green and wrong ones red,
per note, and scores the take. That specificity is why teachers adopt it.

**Real songs.** flowkey's 1,000+ song library, Hooktheory's deconstruction of famous tracks,
Ableton teaching in the context of A Tribe Called Quest and the Sleng Teng riddim. Ethan Hein's
praise for Ableton is precisely that theory arrives attached to music people already care about.

### What consistently fails — the friction list to avoid

1. **Unreliable detection.** The single most-repeated complaint. Simply Piano: "it was fine most of
   the time, but when it wasn't fine, it was absolutely terrible." Yousician: "sound recognition is
   awful." Tested comparisons conclude MIDI beats microphones every time.
2. **Billing traps.** The largest single category of negative review across the paid apps.
   Yousician sits at 4.0/5 on Trustpilot (1,320 reviews) with auto-renewal complaints dominating
   the negative tail — "cancelled the same day, but they still took €139.99". Simply Piano's trial rolls into an
   annual term, which a tester calls the mechanism rather than an oversight — "the absence of a
   clear pre-billing reminder is the mechanism" — and cancelling "a maze"; a sentiment analysis
   of 30 recent App Store reviews puts it at an NPS of **-4**, with the aggressive paywall and ads
   named as the top complaint themes. Fender Play draws "kept billing after I stopped using it".
3. **Completion ≠ competence.** Simply Piano "will be marked as complete with no performance-based
   statistics" — you can finish a course having played badly throughout.
4. **Praise for a bad take.** flowkey's worst flaw: you "can literally play the wrong notes, wrong
   note length, all at the wrong time, and it will still say well done."
5. **Punishment for a good one.** The opposite error — a Melodics user, quoted in review: "the
   scoring algorithm penalizes you so much for even the slightest error that even when you play
   most of the lesson perfectly, you may still not pass."
6. **No dashboard.** Simply Piano: "you don't have a dashboard where you can see all of your
   playing stats at once."
7. **The month-three cliff.** Testers report shallow long-term utility across the category —
   "the lessons that felt like progress in week one are still drilling the same four chords in
   month three." Beginner-optimised, then nothing.
8. **Dated or overwhelming interfaces** in the free theory tools: Teoria is praised for depth and
   criticised as "dated and purely functional", musictheory.net's design "feels dated compared to
   newer apps", and EarMaster "can feel overwhelming for beginners."

---

## 2. Where Producer Theory Lab stands

Measured on the current build (26 lessons), not estimated.

**Already ahead of the field**

- Free, no account, no paywall, no ads — which is the top complaint category for every paid app here.
- Feedback is **deterministic**: answers are clicks and built patterns, not microphone pitch
  detection. The #1 friction point in the market does not exist here. This is a feature; say so.
- Theory is derived, not typed, so spellings can't drift (C minor is C–E♭–G everywhere).
- Keyboard- and screen-reader-operable instruments, a flat view, two reading levels. No competitor
  reviewed here is close on accessibility.
- A real dashboard (Today) with mastery, due dates and a streak — the thing Simply Piano is
  criticised for lacking.
- MIDI export: work leaves the app. Nothing else in this list does that for a beginner.

**Measured gaps**

| Measurement | Value | Why it matters |
|---|---|---|
| Prose per lesson | **670 words average**, 410–980 range | A Melodics session is 5 minutes; a Waay lesson is 5–6 min of video. A 670-word read before the instrument is a chapter, not a session. |
| Lesson page height at 390px | **3,512px average** (max 4,766px) | Against 523px of visible page below the sticky stage: **6.7 screens of scrolling per lesson**. |
| Sidebar | **27 buttons, 1,258px tall in a 659px pane** | A menu, not a path. Every competitor shows one next step. |
| Chrome above the lesson title on mobile | **215px** (113px reading-level bar, wrapped to 3 lines, + 60px a11y disclosure row) | 41% of the visible page below the stage, repeated on every lesson, exactly where the content should start. |
| Stage on mobile | **38% of a 390×844 viewport** | Reasonable — but the instrument and the text it explains are never visible together below the fold. |
| Taps to first sound, cold start | **2** (Open The Grid → Play) | Good. Duolingo's bar is a finished lesson in 15 minutes; this is fine but could be 0–1. |
| Touch targets under 44px | **33**, mostly 32px-high nav rows | Below the standard minimum for thumbs. |
| Lessons with a practice round | **16 of 26** | Ten chapters end at a quiz. |
| Lesson completion | **Manual "Mark this lesson done" button** | Same failure Simply Piano is criticised for: completion asserts nothing about competence. |
| Session end | **None** | No moment that says "that's today's work, you're done." |
| Intake questions | **0** | All three leading piano apps ask three to five before showing anything. |

---

## 3. Recommendations, in priority order

> **Status, 2026-09-20.** P0.2, P0.3, P0.4 and P0.5 are built. Measured after: average lesson
> 3,512px → **1,784px** at 390px (670 → 217 visible words, 6.7 → 3.4 screens); chrome above the
> lesson title 215px → **64px**; three questions on a first visit; lessons tick themselves off the
> quiz and the practice round. P0.1 — the session-end screen — is still the biggest thing missing.

Effort is rough: **S** = an afternoon, **M** = a day or two, **L** = a week+.

### P0 — do these first

**1. Give the session an end. (M — `src/ui.js`, new `renderDone()`)**
The workout on Today already knows how many questions it has. When the last one is answered, do not
silently re-render the page: show a completion screen — questions right, which concepts moved,
which one is next, the streak incremented, and exactly one button ("Done for today" / "One more
round"). This is the highest-leverage change on the list because it converts an open-ended tool
into a session with a finish line, which is the mechanic every retaining app in the table shares.

**2. Split "read it" from "do it". (M — `src/ui.js` render(), `src/styles.css`)**
Default every lesson to a **Do** view: the lede, the Try It block, the practice round, the quiz —
roughly 150 words. Put the explanatory blocks behind a "Read the whole thing" expander (or a
second tab). Nothing is deleted; 670 words stop standing between the learner and the instrument.
Acceptance check: median lesson page height at 390px falls from 3,527px to under 1,500px in Do view.

**3. Reclaim the top of the mobile lesson. (S — `modeBar()` in `src/ui.js`, CSS)**
Move reading level and theme out of the per-lesson bar into a single ⚙ control in the stage foot
(or the rail header). Collapse the a11y disclosure into the stage-foot row rather than a full-width
band. Recovers 215px above the fold on every lesson at 390px — 41% of the visible page — on every visit.

**4. Ask three questions once. (S — new `renderIntake()`, shown when there is no saved progress)**
"What do you make?" · "Can you find middle C?" · "How long do you want to practise a day?" →
sets reading level, picks the entry lesson, sets `workoutMins`. One screen, skippable, never shown
again. It is the cheapest change here that all three leading piano apps
already make, and the one that lets everything downstream — reading level, first lesson, workout
length — start from something better than a default.

**5. Derive completion from performance. (S — `progress()` / the quiz block)**
A lesson should tick itself when the quiz is answered and (where one exists) the practice round is
passed. Keep the manual button as an override labelled "Mark done anyway". This closes the exact
gap reviewers hit Simply Piano with, and it costs almost nothing because both signals are already
recorded.

### P1 — next

**6. A third verdict: "close". (M — `src/practice.js`)**
Right now an answer is right or wrong. Add a middle state with a named diagnosis: right chord
quality, wrong root; right rhythm, wrong lane; right interval, wrong direction. flowkey fails by
praising everything and Melodics fails by punishing everything — the value is in the sentence that
says *what* went wrong. A "close" does not break the streak but does not clear the concept either.

**7. Forgive one missed day. (S — `src/mastery.js`)**
Streaks work through loss aversion, but Duolingo's own growth lead notes "losing a streak is also a
big reason why people quit." One free skipped day per week, shown honestly ("streak held — one rest
day used"), keeps the mechanic without the cliff.

**8. Collapse the sidebar into the path. (M — `buildNav()`)**
Eight stage accordions, current one open, each showing "3 / 4". The full list stays one tap away —
that is the lesson from the Duolingo Path backlash, where removing the ability to jump to a chosen
skill was the loudest complaint.

**9. Practice tools on the stage. (M — `src/scenes.js` + lesson controls)**
Half-speed, loop-these-two-bars and hear-it-again are the features reviewers single out in
flowkey, and chunking a hard passage is what Melodics is credited with. A tempo slider exists in
some lessons; make slow / loop / repeat a standard stage control wherever the transport runs.

**10. Fill the ten practice-less chapters. (L — `src/practice.js` MAKERS + PLAN)**
Meter, inversions, borrowed, circle, the three melody lessons, beatblock, eightbar, structure. The
scheduler can only work with concepts that have a round; ten chapters currently feed it nothing, so
Today's plan is thinner than it should be for anyone past stage 4.

### P2 — when the above is done

**11. Real music, legally.** The thing every reviewer praises — flowkey's songs, Hooktheory's
real-track analysis, Ableton's Sleng Teng — is music people recognise. Options that stay clean:
name well-known songs that use a progression *as text* without reproducing them, and build
original or public-domain riffs into the lessons as playable examples.

**12. Touch targets to 44px** in the nav drawer and chip rows (33 currently below it).

**13. A weekly goal** ("3 of 5 sessions this week") on Today — a second, slower-moving progress
ring next to the streak, which is the pattern that survives past month three.

**14. "You last practised 6 days ago"** on Today — the only re-engagement move a page with no
account and no notifications can honestly make.

### Explicitly do not copy

- **Microphone / pitch detection.** The most-complained-about feature in the entire market. The
  deterministic answer model here is better; keep it and say so on the landing screen.
- **Trial and cancellation pressure.** Irrelevant while the app is free, and the reason a large
  share of negative reviews exist at all.
- **Guitar-Hero scoring.** A reviewer calls Yousician's gaming interface "fundamentally
  incompatible with a lot of what makes advanced playing" advanced. Score understanding, not
  reflexes.
- **Gating progression on mastery.** Simply Piano enforces it — "you will not be able to move to
  the next lesson unless you master the current one" — and the review lists it as a *pro*, because
  it stops beginners skipping ahead. My read is that it costs more than it buys for self-directed
  adults, who already chose to be here: recommend the next step, but never lock the rest. That is a
  judgement call, not a sourced finding.

---

## 4. Suggested order of work

1. Session-end screen (P0.1) — the retention mechanic the app is missing entirely.
2. Do/Read split (P0.2) + mobile chrome (P0.3) — the two changes that make a lesson feel like five
   minutes instead of a chapter.
3. Three-question intake (P0.4) + derived completion (P0.5) — both small, both remove a known
   failure mode.
4. "Close" verdict (P1.6) and streak forgiveness (P1.7).
5. Nav accordions (P1.8), stage practice tools (P1.9), then the ten missing rounds (P1.10).

---

## Sources

- [Simply Piano review — Pianist's Compass](https://pianistscompass.org/reviews/apps/simply-piano/)
- [flowkey review — Pianist's Compass](https://pianistscompass.org/reviews/apps/flowkey/)
- [Simply Piano user feedback analysis — Kimola](https://kimola.com/reports/unlock-insights-simply-piano-user-feedback-analysis-app-store-us-148133)
- [Simply Piano vs Yousician vs Flowkey — Omari MC](https://www.omarimc.com/simply-piano-vs-yousician-vs-flowkey-review/)
- [Yousician reviews — Trustpilot](https://www.trustpilot.com/review/yousician.com)
- [Yousician review — American Songwriter](https://americansongwriter.com/yousician-review/)
- [Melodics review — Omari MC](https://www.omarimc.com/melodics-app-review/)
- [SmartMusic review — Common Sense Education](https://www.commonsense.org/education/reviews/smartmusic)
- [Best piano learning apps, re-tested — Practis](https://pract.is/blog/best-piano-learning-apps-adults-2026)
- [Music learning apps ranked — Unstar](https://unstar.app/blog/yousician-simply-piano-flowkey-fender-play-music-learning-apps-ranked-2026)
- [Duolingo's user retention tactics — Growth.Design](https://growth.design/case-studies/duolingo-user-retention)
- [The new Duolingo home screen — Duolingo blog](https://blog.duolingo.com/new-duolingo-home-screen-design)
- [Duolingo's learning path, honest review — Duoplanet](https://duoplanet.com/duolingo-new-learning-path-review/)
- [Duolingo UX breakdown — 925 Studios](https://www.925studios.co/blog/duolingo-design-breakdown)
- [Hooktheory review — Hyperbits](https://hyperbits.com/blog/hooktheory/)
- [Best music theory apps tested — Preply](https://preply.com/en/blog/best-music-theory-apps/)
- [Learning Music from Ableton — Ethan Hein](https://www.ethanhein.com/wp/2017/learning-music-from-ableton/)
