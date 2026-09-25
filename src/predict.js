/* ═══════════════════════════════════════════════════════════════
   PREDICT — guess first, then listen.

   A few lessons open with one question the learner answers before hearing
   anything: which will sound sadder, which will feel faster. A guess — even
   a wrong one — makes the sound that follows land as an answer rather
   than as one more example. It is not scored; it is only there to make you
   listen for something.

   Each entry: q, a (options), c (the answer), play(ctx) → how long it
   takes in ms, and why.
   ═══════════════════════════════════════════════════════════════ */
const PREDICT = (() => {
  const note = (ctx, m, at, d) => ctx.later(() => A.note(m, d || 0.5), at);
  const chord = (ctx, ns, at, d) => ctx.later(() => A.chord(ns, d || 1.2, { spread:0.03 }), at);
  const tell = (ctx, at, t) => ctx.later(() => ctx.read(t), at);
  const hats = (ctx, n, span, at) => { for (let i = 0; i < n; i++) ctx.later(() => A.click('hat', undefined, i % (n / 4) === 0 ? 0.8 : 0.45), at + i * span / n); };

  const P = {
    grid:{ q:'Same tempo, two hi-hat lines: one on every 8th, one on every 16th. Which will feel faster?',
      a:['The 8ths', 'The 16ths', 'Neither — the tempo is the same'], c:1,
      play:ctx => { tell(ctx, 0, 'A · 8ths'); hats(ctx, 8, 2400, 0); tell(ctx, 2900, 'B · 16ths'); hats(ctx, 16, 2400, 2900); return 5400; },
      why:'Twice as many hits in the same time. The tempo never moved; the subdivision did. That is why trap at 70 BPM can feel frantic.' },
    meter:{ q:'Same tempo again: one bar splits each beat in two, the next in three. Which one will gallop?',
      a:['Split in two', 'Split in three', 'They will feel the same'], c:1,
      play:ctx => {
        tell(ctx, 0, 'A · two per beat');
        for (let b = 0; b < 4; b++) for (let s = 0; s < 2; s++) ctx.later(() => A.click(s ? 'hat' : 'mid'), b * 600 + s * 300);
        tell(ctx, 2600, 'B · three per beat');
        for (let b = 0; b < 4; b++) for (let s = 0; s < 3; s++) ctx.later(() => A.click(s ? 'hat' : 'mid'), 2600 + b * 600 + s * 200);
        return 5000; },
      why:'Three pieces per beat rolls; two walks. Your foot tapped at the same speed both times.' },
    notes:{ q:'Two moves up from C: a half step, then a whole step. Which will sound like the bigger jump?',
      a:['The half step', 'The whole step', 'The same size'], c:1,
      play:ctx => { tell(ctx, 0, 'A · half step: C → C♯'); note(ctx, 60, 0); note(ctx, 61, 450);
        tell(ctx, 1300, 'B · whole step: C → D'); note(ctx, 60, 1300); note(ctx, 62, 1750); return 2500; },
      why:'A whole step is two half steps — twice the distance, and you can hear it.' },
    intervals:{ q:'Two pairs of notes, played together: a perfect 5th, then a tritone. Which will sound like it wants to move?',
      a:['The 5th', 'The tritone', 'Both equally'], c:1,
      play:ctx => { tell(ctx, 0, 'A · perfect 5th: C + G'); chord(ctx, [60, 67], 0, 1.4);
        tell(ctx, 1700, 'B · tritone: C + F♯'); chord(ctx, [60, 66], 1700, 1.4); return 3300; },
      why:'The 5th is stable enough to hold forever. The tritone is the most restless interval there is — it wants to slide somewhere.' },
    scales:{ q:'The same five-note run twice: once from the major scale, once from the minor. Which will sound more serious?',
      a:['The major run', 'The minor run', 'No difference'], c:1,
      play:ctx => {
        tell(ctx, 0, 'A · C major'); [60, 62, 64, 65, 67].forEach((m, i) => note(ctx, m, i * 230, 0.4));
        tell(ctx, 1500, 'B · C minor'); [60, 62, 63, 65, 67].forEach((m, i) => note(ctx, m, 1500 + i * 230, 0.4));
        return 2900; },
      why:'One note changed — the 3rd, a half step lower — and the mood went with it.' },
    chords:{ q:'C major, then C minor. Only the middle note moves, by one half step. Which will sound sadder?',
      a:['C major', 'C minor', 'Neither'], c:1,
      play:ctx => { tell(ctx, 0, 'A · C major: C E G'); chord(ctx, [60, 64, 67], 0);
        tell(ctx, 1500, 'B · C minor: C E♭ G'); chord(ctx, [60, 63, 67], 1500); return 3000; },
      why:'The minor 3rd is the whole difference between bright and sad.' },
    progressions:{ q:'Two endings in C: G → C, and C → G. Which one sounds finished?',
      a:['G → C', 'C → G', 'Both'], c:0,
      play:ctx => { tell(ctx, 0, 'A · G → C'); chord(ctx, [55, 59, 62], 0); chord(ctx, [48, 52, 55, 60], 900, 1.6);
        tell(ctx, 2800, 'B · C → G'); chord(ctx, [48, 52, 55, 60], 2800); chord(ctx, [55, 59, 62], 3700, 1.6); return 5400; },
      why:'V → I is a full stop. Ending on V is a comma — it leaves the question hanging, which is exactly what a loop wants.' },
    bassline:{ q:'A C minor chord with three different bass notes under it: C, then E♭, then B♭. Which will sound most settled?',
      a:['C', 'E♭', 'B♭'], c:0,
      play:ctx => {
        [[36, 'C'], [39, 'E♭'], [34, 'B♭']].forEach(([b, n], i) => {
          tell(ctx, i * 1400, String.fromCharCode(65 + i) + ' · ' + n + ' in the bass');
          chord(ctx, [60, 63, 67], i * 1400, 1.1); note(ctx, b, i * 1400, 1.1);
        });
        return 4300; },
      why:'The root under its own chord confirms what the ear already hears. The others colour it — useful, but not settled.' },
    velocity:{ q:'The same hi-hat line twice: every hit equally loud, then with loud and soft hits. Which will sound played by a person?',
      a:['All equal', 'Loud and soft', 'No difference'], c:1,
      play:ctx => {
        tell(ctx, 0, 'A · every hit the same');
        for (let i = 0; i < 8; i++) ctx.later(() => A.click('hat', undefined, 0.6), i * 250);
        tell(ctx, 2300, 'B · accents and ghosts');
        [0.9, 0.3, 0.6, 0.25, 0.85, 0.3, 0.65, 0.4].forEach((v, i) => ctx.later(() => A.click('hat', undefined, v), 2300 + i * 250));
        return 4400; },
      why:'Nobody hits every note equally. Velocity is how a programmed part stops sounding programmed.' },
    inversions:{ q:'C major, then the same three notes with E at the bottom. Will it still be a C major chord?',
      a:['Yes — same notes', 'No — it becomes E minor', 'No — it becomes a new chord'], c:0,
      play:ctx => { tell(ctx, 0, 'A · C E G'); chord(ctx, [60, 64, 67], 0);
        tell(ctx, 1500, 'B · E G C'); chord(ctx, [64, 67, 72], 1500); return 3000; },
      why:'Same three notes, same chord. What changes is the weight: the bottom note colours it, and the bass line gets smoother.' },
    sevenths:{ q:'Cmaj7, then C7. One note differs. Which will sound bluesy?',
      a:['Cmaj7', 'C7', 'Neither'], c:1,
      play:ctx => { tell(ctx, 0, 'A · Cmaj7: C E G B'); chord(ctx, [60, 64, 67, 71], 0, 1.4);
        tell(ctx, 1700, 'B · C7: C E G B♭'); chord(ctx, [60, 64, 67, 70], 1700, 1.4); return 3300; },
      why:'The flat 7th in C7 is the blues sound — and the pull of a dominant chord. Maj7 is dreamier and stays put.' },
    suspensions:{ q:'Csus4, then C major. Which one sounds like it is waiting for something?',
      a:['Csus4', 'C major', 'Neither'], c:0,
      play:ctx => { tell(ctx, 0, 'A · Csus4: C F G'); chord(ctx, [60, 65, 67], 0, 1.4);
        tell(ctx, 1700, 'B · C major: C E G'); chord(ctx, [60, 64, 67], 1700, 1.4); return 3300; },
      why:'The 4th sits where the 3rd wants to be. Resolve it down to the 3rd and the wait is over.' },
    borrowed:{ q:'C, F, then F minor. Will the F minor sound brighter or darker than the F?',
      a:['Brighter', 'Darker', 'The same'], c:1,
      play:ctx => { chord(ctx, [48, 52, 55, 60], 0); tell(ctx, 900, 'F'); chord(ctx, [53, 57, 60], 900);
        tell(ctx, 1800, 'F minor, borrowed'); chord(ctx, [53, 56, 60], 1800); chord(ctx, [48, 52, 55, 60], 2700, 1.6); return 4300; },
      why:'One note, A down to A♭, borrowed from C minor. A sudden shadow in a major key.' },
    modes:{ q:'Dorian, then Phrygian, both from D. Which will sound darker?',
      a:['Dorian', 'Phrygian', 'The same'], c:1,
      play:ctx => {
        tell(ctx, 0, 'A · D Dorian'); [62, 64, 65, 67, 69].forEach((m, i) => note(ctx, m, i * 220, 0.4));
        tell(ctx, 1500, 'B · D Phrygian'); [62, 63, 65, 67, 69].forEach((m, i) => note(ctx, m, 1500 + i * 220, 0.4));
        return 2800; },
      why:'Phrygian’s flat 2nd sits a half step above home. That one note is the darkness.' },
    circle:{ q:'From C, two jumps: to G (next door on the circle), then to F♯ (straight across). Which will sound more natural?',
      a:['C → G', 'C → F♯', 'Both the same'], c:0,
      play:ctx => { tell(ctx, 0, 'A · C → G'); chord(ctx, [48, 52, 55], 0); chord(ctx, [55, 59, 62], 900);
        tell(ctx, 2300, 'B · C → F♯'); chord(ctx, [48, 52, 55], 2300); chord(ctx, [54, 58, 61], 3200); return 4600; },
      why:'Neighbours on the circle share six of seven notes. Opposite sides share almost none.' }
  };
  return P;
})();
