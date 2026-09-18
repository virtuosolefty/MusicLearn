#!/usr/bin/env node
/* Consistency checks for the theory engine and the lesson data.
 *
 *   node test/check-theory.js
 *
 * Everything here is derived, not typed by hand: if a lesson displays a chord
 * name, a numeral or a spelling, it comes from src/theory.js, so these checks
 * cover what the lessons show. Run it after touching theory or lesson data.
 */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');

/* load the modules without a browser */
global.window = {};
global.document = { createElement:() => ({ getContext:() => ({
  measureText:() => ({ width:10 }), fillText(){}, beginPath(){}, moveTo(){}, lineTo(){},
  quadraticCurveTo(){}, fill(){}, stroke(){}, scale(){} }) }) };

const theory = read('src/theory.js');
const { T } = new Function(theory + '\nreturn { T };')();
const lessonSrc = ['src/lessons-level1.js','src/lessons-level2.js','src/lessons-level3.js',
                   'src/simple-level1.js','src/simple-level2.js'].map(read).join('\n');
const { LESSONS } = new Function(theory + '\n' +
  read('src/ui.js').replace(/^const APP[\s\S]*$/m, '') + '\n' +
  'const V = { set:()=>({}), a11y:()=>null, setTheme:()=>{} };\n' +
  lessonSrc + '\nreturn { LESSONS };')();

let fail = 0, pass = 0;
const eq = (got, want, label) => {
  if (String(got) === String(want)) { pass++; return; }
  fail++; console.log('  FAIL  ' + label + '\n        got  ' + got + '\n        want ' + want);
};
const ok = (cond, label) => { if (cond) pass++; else { fail++; console.log('  FAIL  ' + label); } };
const head = t => console.log('\n' + t);

/* ── 1. spelling: letters follow the interval, not the pitch class ── */
head('Spelling');
eq(T.spellChord('C','min').join(' '), 'C E♭ G', 'C minor triad');
eq(T.spellChord('D','dim').join(' '), 'D F A♭', 'D diminished');
eq(T.spellChord('C','aug').join(' '), 'C E G♯', 'C augmented');
eq(T.spellChord('B','dim7').join(' '), 'B D F A♭', 'B diminished 7th');
eq(T.spellChord('E♭','dom7').join(' '), 'E♭ G B♭ D♭', 'E♭7');
eq(T.spellChord('F♯','min7').join(' '), 'F♯ A C♯ E', 'F♯m7');
eq(T.spellChord('C','add9').join(' '), 'C E G D', 'Cadd9');
eq(T.spellScale('C','minor').join(' '), 'C D E♭ F G A♭ B♭', 'C natural minor');
eq(T.spellScale('C','harmonicMinor').join(' '), 'C D E♭ F G A♭ B', 'C harmonic minor');
eq(T.spellScale('A♭','major').join(' '), 'A♭ B♭ C D♭ E♭ F G', 'A♭ major');
eq(T.spellIvl('C',3), 'E♭', 'minor 3rd above C');
eq(T.spellIvl('C',6), 'F♯', 'tritone above C');
/* no scale in any key may spell two notes with the same letter */
T.MAJ_ROOT.forEach(rn => {
  const letters = T.spellScale(rn, 'major').map(n => n[0]);
  ok(new Set(letters).size === 7, rn + ' major uses each letter once');
});

/* ── 2. diatonic chords in all twelve keys ── */
head('Diatonic sets, all twelve keys');
for (let pc = 0; pc < 12; pc++) {
  eq(T.diatonic(48 + pc, 'major').map(c => T.roman(c.degree, c.quality)).join(' '),
     'I ii iii IV V vi vii°', T.MAJ_ROOT[pc] + ' major triad qualities');
  eq(T.diatonic(48 + pc, 'minor').map(c => T.roman(c.degree, c.quality)).join(' '),
     'i ii° III iv v VI VII', T.MIN_ROOT[pc] + ' minor triad qualities');
  const hm = T.diatonic(48 + pc, 'harmonicMinor');
  ok(hm[4].quality === 'maj', T.MIN_ROOT[pc] + ' harmonic minor: V is major');
  ok(hm[6].q7 === 'dim7', T.MIN_ROOT[pc] + ' harmonic minor: vii is a diminished 7th');
}

/* ── 3. the circle of fifths, as the lesson reads it ── */
head('Circle of fifths');
for (let i = 0; i < 12; i++) {
  const iv = (i + 11) % 12, v = (i + 1) % 12;
  const dia = T.diatonic(48 + T.CIRCLE[i], 'major');
  const pcOf = lab => T.nameToPc(lab.replace('m', ''));
  eq(pcOf(T.KEY_LABEL[iv]), T.pc(dia[3].root), T.KEY_LABEL[i] + ': tile to the left is IV');
  eq(pcOf(T.KEY_LABEL[v]),  T.pc(dia[4].root), T.KEY_LABEL[i] + ': tile to the right is V');
  eq(pcOf(T.MINOR_LABEL[iv]), T.pc(dia[1].root), T.KEY_LABEL[i] + ': minor under IV is ii');
  eq(pcOf(T.MINOR_LABEL[v]),  T.pc(dia[2].root), T.KEY_LABEL[i] + ': minor under V is iii');
  eq(pcOf(T.MINOR_LABEL[i]),  T.pc(dia[5].root), T.KEY_LABEL[i] + ': minor under I is vi');
  eq(T.pc(T.CIRCLE[i]), (i * 7) % 12, T.KEY_LABEL[i] + ' is ' + i + ' fifths from C');
}

/* ── 4. chord tables agree with their own interval counts ── */
head('Chord definitions');
Object.keys(T.CHORDS).forEach(k => {
  const c = T.CHORDS[k];
  ok(!!c.deg && c.deg.length === c.steps.length, k + ' has a letter degree per note');
  const spelt = T.spellChord('C', k);
  ok(spelt.every(n => n && n.length <= 3), k + ' spells cleanly from C (' + spelt.join(' ') + ')');
});

/* ── 5. lesson data integrity ── */
head('Lesson data');
ok(LESSONS.length === 22, '22 lessons present');
const ids = LESSONS.map(l => l.id);
ok(new Set(ids).size === ids.length, 'lesson ids are unique');
LESSONS.forEach(L => {
  ok(!!(L.title && L.lede && L.stage && L.init), L.id + ': complete');
  ok(!!(L.blocks && L.blocks.length), L.id + ': has producer-mode content');
  ok(!!L.simple, L.id + ': has a simple-mode version');
  const bothQuiz = [[L.quiz, 'producer'], [L.simple && L.simple.quiz, 'simple']];
  bothQuiz.forEach(([qs, which]) => (qs || []).forEach((Q, i) => {
    ok(Q.a && Q.c != null && Q.c < Q.a.length, L.id + ' ' + which + ' Q' + (i + 1) + ': answer index in range');
    ok(!!Q.why, L.id + ' ' + which + ' Q' + (i + 1) + ': has an explanation');
    ok(new Set(Q.a).size === Q.a.length, L.id + ' ' + which + ' Q' + (i + 1) + ': options are distinct');
    /* options that are the same notes in a different order are ambiguous */
    const norm = s => String(s).replace(/[^A-G♯♭]/g, '').split('').sort().join('');
    const looksLikeNotes = Q.a.every(x => /^[A-G][♯♭]?( [A-G][♯♭]?)+$/.test(String(x)));
    if (looksLikeNotes) {
      ok(new Set(Q.a.map(norm)).size === Q.a.length,
         L.id + ' ' + which + ' Q' + (i + 1) + ': note-set options are not reorderings of each other');
    }
  }));
});

/* ── 6. no lesson text may claim the plain V triad holds a tritone ── */
head('Claims');
const text = lessonSrc.replace(/\s+/g, ' ');
ok(!/V[^.]{0,40}contains the leading note and the tritone/.test(text),
   'no "V contains the tritone" claim left');
ok(/belongs to keys|vii°7 of C minor/.test(text),
   'diminished 7th is placed in a key rather than "no key"');
ok(/does <em>not<\/em> promise|does not guarantee agreement|not the same as agreeing/.test(text),
   'the in-scale / in-chord distinction is stated');

console.log('\n' + pass + ' checks passed' + (fail ? ', ' + fail + ' FAILED' : ''));
process.exit(fail ? 1 : 0);
