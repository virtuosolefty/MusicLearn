/* ═══════════════════════════════════════════════════════════════
   STUDIO — keeping what you make: undo, saved ideas, and a MIDI file
   you can drop straight into a DAW.

   Everything here is written in the browser. The MIDI writer is a small
   standard-MIDI-file encoder: a tempo track plus one track of notes.
   ═══════════════════════════════════════════════════════════════ */
const STUDIO = (() => {
  const PPQ = 480;                       /* ticks per quarter note */
  const chars = s => s.split('').map(c => c.charCodeAt(0) & 0x7F);

  /* delta times are variable-length: seven bits per byte, high bit = more */
  function vlq(n) {
    const out = [n & 0x7F];
    n = Math.floor(n / 128);
    while (n > 0) { out.unshift((n & 0x7F) | 0x80); n = Math.floor(n / 128); }
    return out;
  }
  const chunk = (id, data) => chars(id).concat([
    (data.length >>> 24) & 255, (data.length >>> 16) & 255,
    (data.length >>> 8) & 255, data.length & 255], data);

  function trackBytes(notes, name, ch) {
    const evs = [];
    notes.forEach(n => {
      evs.push({ t:n.t, kind:1, note:n.note, vel:n.vel == null ? 100 : n.vel });
      evs.push({ t:n.t + n.dur, kind:0, note:n.note, vel:0 });
    });
    /* note-offs first when they land on the same tick, so a repeated note
       retriggers instead of being cut short by its own predecessor */
    evs.sort((a, b) => a.t - b.t || a.kind - b.kind);
    let out = [];
    if (name) out = out.concat([0, 0xFF, 0x03, Math.min(127, name.length)], chars(name).slice(0, 127));
    let prev = 0;
    evs.forEach(e => {
      out = out.concat(vlq(e.t - prev));
      prev = e.t;
      out.push((e.kind ? 0x90 : 0x80) | (ch & 0x0F), e.note & 0x7F, e.vel & 0x7F);
    });
    return out.concat([0, 0xFF, 0x2F, 0x00]);
  }

  /* notes: [{note, t, dur, vel}] in ticks. ch 9 is the GM drum channel. */
  function midi(notes, opt) {
    opt = opt || {};
    const bpm = Math.max(20, Math.min(300, Math.round(opt.bpm || 100)));
    const us = Math.round(60000000 / bpm);
    const tempo = [0, 0xFF, 0x51, 0x03, (us >> 16) & 255, (us >> 8) & 255, us & 255]
      .concat([0, 0xFF, 0x58, 0x04, 4, 2, 24, 8],          /* 4/4 */
              [0, 0xFF, 0x2F, 0x00]);
    const head = [0, 1, 0, 2, (PPQ >> 8) & 255, PPQ & 255];  /* format 1, 2 tracks */
    const bytes = chunk('MThd', head)
      .concat(chunk('MTrk', tempo))
      .concat(chunk('MTrk', trackBytes(notes, opt.name || 'Producer Theory Lab', opt.ch || 0)));
    return new Uint8Array(bytes);
  }

  function download(bytes, filename) {
    try {
      const blob = new Blob([bytes], { type:'audio/midi' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename;
      document.body.appendChild(a); a.click();
      setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 400);
      return true;
    } catch (e) { return false; }
  }

  /* ── turning an instrument into notes ──────────────────────── */
  /* General MIDI drum notes, so the export lands on the right pads in a DAW */
  const DRUM = { kick:36, snare:38, hat:42, clap:39, click:37 };

  function notesFrom(kind, data, opt) {
    opt = opt || {};
    const step = PPQ / 4;                              /* one 16th box */
    if (kind === 'grid') {
      const out = [];
      (data.rows || []).forEach((row, l) => {
        const note = DRUM[(data.kinds || [])[l]] || 38;
        row.forEach((v, s) => { if (v) out.push({ note, t:s * step, dur:step / 2, vel:v === 2 ? 118 : 100 }); });
      });
      return out;
    }
    if (kind === 'roll') {
      return (data.notes || []).map(n =>
        ({ note:n.midi, t:n.step * step, dur:Math.max(1, n.len || 1) * step - 12, vel:100 }));
    }
    if (kind === 'chords') {
      const bar = PPQ * 4;
      const out = [];
      (data.chords || []).forEach((ns, i) =>
        ns.forEach(m => out.push({ note:m, t:i * bar, dur:bar - 20, vel:92 })));
      return out;
    }
    return [];
  }

  /* ── saved ideas ───────────────────────────────────────────── */
  const KEY = 'rbx-theory-saves-v1';
  let saves = [];
  function loadSaves() {
    try { saves = JSON.parse(localStorage.getItem(KEY) || '[]') || []; } catch (e) { saves = []; }
    if (!Array.isArray(saves)) saves = [];
  }
  function writeSaves() { try { localStorage.setItem(KEY, JSON.stringify(saves)); } catch (e) {} }
  loadSaves();
  const forLesson = id => saves.filter(s => s.lesson === id);
  function put(entry) {
    saves.push(Object.assign({ id:'s' + Date.now().toString(36) + Math.floor(Math.random() * 1e4),
                               when:Date.now() }, entry));
    writeSaves();
    return saves[saves.length - 1];
  }
  function drop(id) { saves = saves.filter(s => s.id !== id); writeSaves(); }

  /* ── undo ──────────────────────────────────────────────────── */
  /* Snapshots, not commands: these instruments are small enough that keeping
     whole states is simpler than describing each edit, and it cannot drift. */
  function history(readState, writeState, limit) {
    const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    const back = [], forward = [];
    let current = readState(), muted = false;
    return {
      /* call after the instrument has changed — a call that turns out to change
         nothing is ignored, so it is safe to shout about every edit twice */
      changed() {
        if (muted || same(readState(), current)) return;
        back.push(current);
        if (back.length > (limit || 40)) back.shift();
        forward.length = 0;
        current = readState();
      },
      get canUndo() { return back.length > 0; },
      get canRedo() { return forward.length > 0; },
      undo() {
        if (!back.length) return false;
        forward.push(current);
        current = back.pop();
        muted = true; writeState(current); muted = false;
        return true;
      },
      redo() {
        if (!forward.length) return false;
        back.push(current);
        current = forward.pop();
        muted = true; writeState(current); muted = false;
        return true;
      },
      /* after loading a saved idea, that becomes the state to undo back to */
      reset() { current = readState(); }
    };
  }

  /* ── the panel a lesson shows under its instrument ──────────── */
  function build(ctx, cfg) {
    const kind = cfg.kind;
    const wrap = UI.el('div', 'studio');

    /* how to read and write this instrument's contents */
    const io = {
      grid:{
        read: () => ({ rows:ctx.v.state.map(r => r.slice()), kinds:cfg.kinds || ['kick','snare','hat'] }),
        write: d => (d.rows || []).forEach((row, l) => ctx.v.pattern(l, row)),
        empty: d => !(d.rows || []).some(r => r.some(Boolean)),
        count: d => (d.rows || []).reduce((n, r) => n + r.filter(Boolean).length, 0)
      },
      roll:{
        read: () => ({ notes:ctx.v.notes.map(n => ({ step:n.step, midi:n.midi, len:n.len || 1 })) }),
        write: d => ctx.v.setNotes((d.notes || []).map(n => ({ step:n.step, midi:n.midi, len:n.len || 1 }))),
        empty: d => !(d.notes || []).length,
        count: d => (d.notes || []).length
      },
      chords:{
        read: () => cfg.read(),
        write: d => cfg.write && cfg.write(d),
        empty: d => !(d.chords || []).length,
        count: d => (d.chords || []).length
      }
    }[kind];
    if (!io) return wrap;

    const hist = history(io.read, io.write);
    const status = UI.el('span', 'val', '');
    const list = UI.el('div', 'savelist');

    const refresh = () => {
      undoBtn.disabled = !hist.canUndo;
      redoBtn.disabled = !hist.canRedo;
      const d = io.read();
      status.textContent = io.empty(d) ? 'nothing yet' :
        io.count(d) + (kind === 'chords' ? ' chords' : ' notes');
      drawList();
    };

    const undoBtn = UI.btn('↩ Undo', () => { hist.undo(); ctx.syncA11y && ctx.syncA11y();
                                                 if (ctx.saveInstrument) ctx.saveInstrument(); refresh(); });
    const redoBtn = UI.btn('↪ Redo', () => { hist.redo(); ctx.syncA11y && ctx.syncA11y();
                                                 if (ctx.saveInstrument) ctx.saveInstrument(); refresh(); });

    const saveBtn = UI.btn('⬇ Save this', () => {
      const d = io.read();
      if (io.empty(d)) { status.textContent = 'nothing to save yet'; return; }
      const n = forLesson(ctx.L.id).length + 1;
      put({ lesson:ctx.L.id, kind, name:(cfg.name || ctx.L.title) + ' ' + n,
            bpm:cfg.bpm ? cfg.bpm() : 100, data:d });
      refresh();
    }, { primary:true });

    const exportBtn = UI.btn('♪ Export MIDI', () => {
      const d = io.read();
      if (io.empty(d)) { status.textContent = 'nothing to export yet'; return; }
      sendMidi(d, (cfg.name || ctx.L.title), cfg.bpm ? cfg.bpm() : 100);
    });

    function sendMidi(d, name, bpm) {
      const notes = notesFrom(kind, d);
      const bytes = midi(notes, { bpm, name, ch:kind === 'grid' ? 9 : 0 });
      const file = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '.mid';
      status.textContent = download(bytes, file) ? 'saved ' + file : 'could not write the file';
    }

    function drawList() {
      list.innerHTML = '';
      const mine = forLesson(ctx.L.id);
      if (!mine.length) {
        list.appendChild(UI.html('span', 'hint',
          'Nothing saved from this lesson yet. Saved ideas stay in this browser.'));
        return;
      }
      mine.slice().reverse().forEach(s => {
        const row = UI.el('div', 'saverow');
        row.appendChild(UI.html('span', 'savename', s.name +
          ' <span class="hint">' + (s.data && io.count(s.data)) +
          (s.kind === 'chords' ? ' chords' : ' notes') + '</span>'));
        row.appendChild(UI.btn('Load', () => {
          io.write(s.data); hist.reset(); hist.changed();
          if (ctx.saveInstrument) ctx.saveInstrument();
          ctx.syncA11y && ctx.syncA11y();
          status.textContent = 'loaded ' + s.name;
          refresh();
        }));
        row.appendChild(UI.btn('♪ MIDI', () => sendMidi(s.data, s.name, s.bpm)));
        row.appendChild(UI.btn('×', () => { drop(s.id); refresh(); }));
        list.appendChild(row);
      });
    }

    wrap.append(UI.row(undoBtn, redoBtn, saveBtn, exportBtn, status), list);

    /* Follow the instrument itself rather than each thing that edits it: taps,
       presets and generators all repaint, and a change that changes nothing is
       ignored, so this cannot double-count. */
    const onEdit = () => { hist.changed(); refresh(); };
    if (V.onPaint) V.onPaint(onEdit);
    ctx.contentChanged = onEdit;
    /* keyboard undo, the way every other tool does it */
    const onKey = e => {
      if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== 'z') return;
      if (/INPUT|SELECT|TEXTAREA/.test((e.target || {}).tagName || '')) return;
      e.preventDefault();
      if (e.shiftKey) hist.redo(); else hist.undo();
      if (ctx.saveInstrument) ctx.saveInstrument();
      ctx.syncA11y && ctx.syncA11y();
      refresh();
    };
    document.addEventListener('keydown', onKey);
    if (ctx.onLeave) ctx.onLeave(() => document.removeEventListener('keydown', onKey));

    refresh();
    return wrap;
  }

  return { build, midi, download, notesFrom, history, put, drop, forLesson, DRUM, PPQ,
           get saves() { return saves; } };
})();
