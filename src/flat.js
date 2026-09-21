/* ═══════════════════════════════════════════════════════════════
   FLAT — the same instrument, drawn face-on.

   The 3D stage is lovely and hard to hit with a thumb. This draws the
   instrument the lab is already running as a straight-on keyboard or step
   grid: big targets, names on every key, no perspective to read through.

   It renders from the same descriptor the accessible button panel uses, so
   it follows whatever the lesson does without a lesson knowing it exists.
   ═══════════════════════════════════════════════════════════════ */
const FLAT = (() => {
  const KEY = 'rbx-theory-flat-v1';
  /* Narrow screens start flat, because that is where the 3D stage is worst to
     use — but an explicit choice always wins and is remembered. */
  let on = null;
  function load() {
    try {
      const v = localStorage.getItem(KEY);
      if (v === 'on' || v === 'off') on = (v === 'on');
    } catch (e) {}
    if (on === null) on = narrow();
    return on;
  }
  function narrow() {
    try { return window.matchMedia('(max-width: 720px)').matches; } catch (e) { return false; }
  }
  function set(v) {
    on = !!v;
    try { localStorage.setItem(KEY, on ? 'on' : 'off'); } catch (e) {}
    return on;
  }
  load();

  const el = (tag, cls, txt) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (txt != null) n.textContent = txt;
    return n;
  };

  /* what the a11y descriptor last looked like — a rebuild is only needed when
     the instrument itself changes shape */
  let host = null, built = '', cells = [];
  const DRAWS = { keys:keyboard, grid:grid, roll:roll, path:path };
  /* whether the instrument currently on the stage is one this can draw */
  function supports() {
    const d = V.a11y && V.a11y();
    return !!(d && d.shape && DRAWS[d.shape]);
  }
  const shapeOf = d => !d ? '' : d.shape + ':' +
    (d.groups || []).map(g => g.name + '/' + g.items.length).join('|') +
    (d.matrix ? '#' + d.matrix.rows.length + 'x' + d.matrix.steps : '');

  function keyboard(d) {
    const items = d.groups[0].items;
    const whites = items.filter(i => i.white);
    const wrap = el('div', 'flat-keys');
    const board = el('div', 'flat-board');
    /* the board never squeezes keys below a thumb's width — on a narrow screen
       it grows past the viewport and scrolls instead */
    board.style.setProperty('--keys', whites.length);
    /* white keys carry the layout; black keys float between them */
    const width = 100 / Math.max(1, whites.length);
    let wi = -1;
    items.forEach(it => {
      const b = el('button', 'fk ' + (it.white ? 'white' : 'black'));
      b.type = 'button';
      if (it.white) wi++;
      b.style.left = (it.white ? wi * width : (wi + 1) * width - width * 0.3) + '%';
      b.style.width = (it.white ? width : width * 0.6) + '%';
      b.dataset.midi = it.midi;
      b.setAttribute('aria-label', it.aria);
      b.setAttribute('aria-pressed', it.pressed ? 'true' : 'false');
      if (it.role) b.dataset.role = it.role;
      const nm = el('span', 'fk-name', it.name);
      if (it.name === 'C') nm.textContent = it.name + it.octave;
      b.appendChild(nm);
      b.addEventListener('pointerdown', e => { e.preventDefault(); A.resume(); it.act(); });
      board.appendChild(b);
      cells.push({ node:b, g:0, i:items.indexOf(it) });
    });
    wrap.appendChild(board);
    return wrap;
  }

  function grid(d) {
    const wrap = el('div', 'flat-grid');
    d.groups.forEach((g, gi) => {
      const row = el('div', 'flat-lane');
      row.appendChild(el('span', 'flat-lane-name', g.laneName || g.name));
      const steps = el('div', 'flat-steps');
      steps.style.setProperty('--cols', g.items.length);
      g.items.forEach((it, i) => {
        const b = el('button', 'fs' + (it.downbeat ? ' down' : '') + (it.accent ? ' accent' : ''));
        b.type = 'button';
        b.setAttribute('aria-label', it.aria);
        b.setAttribute('aria-pressed', it.pressed ? 'true' : 'false');
        b.appendChild(el('span', 'fs-num', it.downbeat ? String(it.beat) : ''));
        b.addEventListener('pointerdown', e => { e.preventDefault(); A.resume(); it.act(); });
        steps.appendChild(b);
        cells.push({ node:b, g:gi, i });
      });
      row.appendChild(steps);
      wrap.appendChild(row);
    });
    return wrap;
  }

  /* Today's path, face-on: one row per stage, one numbered button per
     lesson, lit when it is done. Tapping opens the lesson. */
  function path(d) {
    const wrap = el('div', 'flat-grid flat-path');
    d.groups.forEach((g, gi) => {
      const row = el('div', 'flat-lane');
      row.appendChild(el('span', 'flat-lane-name', g.name));
      const steps = el('div', 'flat-steps');
      steps.style.setProperty('--cols', Math.max(4, g.items.length));
      g.items.forEach((it, i) => {
        const b = el('button', 'fs');
        b.type = 'button';
        b.setAttribute('aria-label', it.aria);
        b.setAttribute('aria-pressed', it.pressed ? 'true' : 'false');
        b.appendChild(el('span', 'fs-num', it.label));
        b.addEventListener('click', () => it.act());
        steps.appendChild(b);
        cells.push({ node:b, g:gi, i });
      });
      row.appendChild(steps);
      wrap.appendChild(row);
    });
    return wrap;
  }

  /* the piano roll, face-on: pitch up the side, time across, the way a DAW
     draws it — and the one view where the 3D stage is hardest to aim at */
  function roll(d) {
    const m = d.matrix;
    const wrap = el('div', 'flat-roll');
    m.rows.forEach((r, ri) => {
      const row = el('div', 'flat-lane');
      const name = el('span', 'flat-lane-name' + (r.black ? ' black' : ''), r.label);
      row.appendChild(name);
      const steps = el('div', 'flat-steps');
      steps.style.setProperty('--cols', m.steps);
      r.cells.forEach((on, s) => {
        const b = el('button', 'fs fr' + (s % (m.group || 4) === 0 ? ' down' : ''));
        b.type = 'button';
        b.setAttribute('aria-label', r.label + ', step ' + (s + 1) + (on ? ', on' : ', off'));
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
        b.addEventListener('pointerdown', e => {
          e.preventDefault(); A.resume(); m.toggle(s, r.midi);
        });
        steps.appendChild(b);
        cells.push({ node:b, roll:true, row:ri, step:s });
      });
      row.appendChild(steps);
      wrap.appendChild(row);
    });
    return wrap;
  }

  /* Build or refresh. Cheap enough to call on every instrument change, because
     an unchanged attribute is never written — the same rule the button panel
     follows, so a running playhead cannot make a screen reader chatter. */
  function paint(node) {
    if (node) host = node;
    if (!host) return;
    const d = V.a11y && V.a11y();
    if (!on || !d || !DRAWS[d.shape]) { host.hidden = true; host.innerHTML = ''; built = ''; return; }
    host.hidden = false;
    const shape = shapeOf(d);
    if (shape !== built) {
      host.innerHTML = ''; cells = [];
      host.appendChild(DRAWS[d.shape](d));
      built = shape;
      /* fall through, so a freshly built board is also scrolled to what is lit */
    }
    let firstLit = null;
    cells.forEach(c => {
      if (c.roll) {
        const r = d.matrix.rows[c.row];
        if (!r) return;
        if (!firstLit && r.cells[c.step]) firstLit = c.node;
        const on = r.cells[c.step] ? 'true' : 'false';
        if (c.node.getAttribute('aria-pressed') !== on) {
          c.node.setAttribute('aria-pressed', on);
          c.node.setAttribute('aria-label', r.label + ', step ' + (c.step + 1) +
            (r.cells[c.step] ? ', on' : ', off'));
        }
        return;
      }
      const it = d.groups[c.g] && d.groups[c.g].items[c.i];
      if (!it) return;
      if (!firstLit && it.role && it.role !== 'ghost' && it.role !== 'scale') firstLit = c.node;
      const pressed = it.pressed ? 'true' : 'false';
      if (c.node.getAttribute('aria-pressed') !== pressed) c.node.setAttribute('aria-pressed', pressed);
      if (c.node.getAttribute('aria-label') !== it.aria) c.node.setAttribute('aria-label', it.aria);
      const role = it.role || '';
      if ((c.node.dataset.role || '') !== role) {
        if (role) c.node.dataset.role = role; else delete c.node.dataset.role;
      }
      if (it.name != null) {
        const nm = c.node.firstChild;
        const want = it.name === 'C' ? it.name + it.octave : it.name;
        if (nm && nm.textContent !== want) nm.textContent = want;
      }
      if (it.accent != null) c.node.classList.toggle('accent', !!it.accent);
    });
    keepInView(firstLit);
  }

  /* When the board is wider than the screen, follow what the lesson is pointing
     at rather than leaving the learner to go looking for it. */
  function keepInView(node) {
    if (!node) return;
    /* whichever box actually scrolls: the keyboard scrolls sideways inside the
       stage, the roll scrolls up and down inside itself */
    [host, node.closest && node.closest('.flat-roll')].forEach(box => {
      if (!box) return;
      const n = node.getBoundingClientRect(), b = box.getBoundingClientRect();
      if (box.scrollWidth > box.clientWidth + 4 && (n.left < b.left + 8 || n.right > b.right - 8))
        box.scrollLeft += (n.left - b.left) - (b.width - n.width) / 2;
      if (box.scrollHeight > box.clientHeight + 4 && (n.top < b.top + 6 || n.bottom > b.bottom - 6))
        box.scrollTop += (n.top - b.top) - (b.height - n.height) / 2;
    });
  }

  const reset = () => { built = ''; cells = []; };
  return { paint, reset, set, load, narrow, supports, get on() { return on; } };
})();
