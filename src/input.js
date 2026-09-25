/* ═══════════════════════════════════════════════════════════════
   INPUT — play the stage from a real instrument.

   Two routes in, both ending at V.input(), which is exactly a tap:
   • the computer keyboard, laid out like a piano — the A-row is the white
     keys, the row above is the black keys, Z and X move an octave;
   • a MIDI keyboard (an Akai MPK Mini, anything class-compliant) through
     Web MIDI. The browser asks permission once; after that it reconnects
     by itself on every visit.

   Nothing here knows about lessons. A practice round listening for keys
   hears a MIDI note the same way it hears a click.
   ═══════════════════════════════════════════════════════════════ */
const INPUT = (() => {
  /* letter -> semitones above the octave's C */
  const LETTERS = { a:0, w:1, s:2, e:3, d:4, f:5, t:6, g:7, y:8, h:9, u:10, j:11, k:12, o:13, l:14, p:15, ';':16 };
  /* the General MIDI drum notes most pad controllers send */
  const PADS = { 35:'kick', 36:'kick', 37:'snare', 38:'snare', 39:'clap', 40:'snare',
                 42:'hat', 44:'hat', 46:'hat' };
  const KEY = 'rbx-theory-midi-v1';
  let shift = 0;                 /* octaves, from the computer keyboard's Z/X */
  let access = null, devices = [];
  const statusFns = [];
  const noteFns = [];

  const status = () => ({ midi:!!access, devices:devices.slice(), supported:supported(), shift });
  const tell = () => statusFns.forEach(fn => { try { fn(status()); } catch (e) {} });
  function supported() {
    return typeof navigator !== 'undefined' && typeof navigator.requestMIDIAccess === 'function';
  }

  /* the C the letter A plays: the keyboard's second C when it has two
     octaves, so the row sits in the middle of what the lesson shows */
  function baseC() {
    const v = typeof V !== 'undefined' ? V.view : null;
    let lo = 48, hi = 72;
    if (v && typeof v.range === 'function') { const r = v.range(); lo = r[0]; hi = r[1]; }
    let c = Math.ceil(lo / 12) * 12;
    if (c + 12 <= hi - 12) c += 12;
    return c + 12 * shift;
  }

  function play(m, vel, from) {
    if (typeof document !== 'undefined' && document.body &&
        document.body.classList.contains('no-stage')) {
      /* the Studio hides the stage: a note is just a note there */
      if (typeof A !== 'undefined') { A.resume(); A.note(m, 0.6, { gain:0.35 + 0.65 * vel }); }
    } else if (typeof V !== 'undefined' && V.input) {
      m = V.input(m, vel);
    }
    noteFns.forEach(fn => { try { fn(m, vel, from); } catch (e) {} });
  }

  function onKeyDown(e) {
    if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
    const t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' ||
              t.isContentEditable)) return;
    if (typeof document !== 'undefined' && document.querySelector('.celebrate')) return;
    const k = (e.key || '').toLowerCase();
    if (k === 'z' || k === 'x') {
      shift = Math.max(-2, Math.min(2, shift + (k === 'z' ? -1 : 1)));
      tell();
      return;
    }
    if (!(k in LETTERS)) return;
    if (typeof A !== 'undefined') A.resume();
    play(baseC() + LETTERS[k], 0.8, 'keys');
  }

  function onMessage(ev) {
    const d = ev.data; if (!d || d.length < 3) return;
    const cmd = d[0] & 0xF0, ch = d[0] & 0x0F;
    if (cmd !== 0x90 || d[2] === 0) return;           /* note-ons only */
    const vel = d[2] / 127;
    if (ch === 9 && PADS[d[1]]) {                     /* a drum pad */
      if (typeof A !== 'undefined') { A.resume(); A.click(PADS[d[1]], undefined, vel); }
      noteFns.forEach(fn => { try { fn(d[1], vel, 'pad'); } catch (e) {} });
      return;
    }
    play(d[1], vel, 'midi');
  }

  function wire() {
    devices = [];
    access.inputs.forEach(inp => {
      inp.onmidimessage = onMessage;
      devices.push(inp.name || 'MIDI keyboard');
    });
    tell();
  }

  /* ask for MIDI. Remembered, so the next visit reconnects without asking. */
  function connect() {
    if (!supported()) return Promise.resolve(false);
    return navigator.requestMIDIAccess({ sysex:false }).then(a => {
      access = a;
      access.onstatechange = wire;
      wire();
      try { localStorage.setItem(KEY, '1'); } catch (e) {}
      return true;
    }).catch(() => {
      try { localStorage.removeItem(KEY); } catch (e) {}
      tell();
      return false;
    });
  }
  function disconnect() {
    if (access) access.inputs.forEach(inp => { inp.onmidimessage = null; });
    access = null; devices = [];
    try { localStorage.removeItem(KEY); } catch (e) {}
    tell();
  }

  function init() {
    if (typeof document !== 'undefined') document.addEventListener('keydown', onKeyDown);
    let asked = null;
    try { asked = localStorage.getItem(KEY); } catch (e) {}
    if (asked && supported()) connect();
  }

  return { init, connect, disconnect, status, supported,
           onStatus:fn => { statusFns.push(fn); },
           onNote:fn => { noteFns.push(fn); },
           LETTERS, PADS, baseC, _message:onMessage, _key:onKeyDown };
})();
