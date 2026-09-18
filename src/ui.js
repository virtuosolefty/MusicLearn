/* ═══════════════════════════════════════════════════════════════
   UI — small builders the lessons use to put controls on the page.
   ═══════════════════════════════════════════════════════════════ */
const UI = (() => {
  const el = (tag, cls, txt) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (txt != null) n.textContent = txt;
    return n;
  };
  const html = (tag, cls, h) => { const n = el(tag, cls); n.innerHTML = h; return n; };

  function btn(text, fn, o) {
    o = o || {};
    const b = el('button', 'b' + (o.primary ? ' primary' : ''));
    if (/</.test(text)) b.innerHTML = text; else b.textContent = text;
    b.type = 'button';
    b.addEventListener('click', () => { A.resume(); fn(b); });
    return b;
  }
  function toggle(text, fn, on) {
    const b = el('button', 'b' + (on ? ' on' : ''), text);
    b.type = 'button'; b.setAttribute('aria-pressed', on ? 'true' : 'false');
    let v = !!on;
    b.addEventListener('click', () => {
      A.resume(); v = !v;
      b.classList.toggle('on', v); b.setAttribute('aria-pressed', v ? 'true' : 'false');
      fn(v, b);
    });
    return b;
  }
  /* A row of mutually exclusive pills. items: [{label, value}]
     `start` is the *value* to show as chosen — lessons pass their restored
     state, so the pills cannot disagree with what is actually loaded. A value
     no item carries (null, or an edited progression) lights none of them. */
  function chips(items, fn, start) {
    const wrap = el('div', 'chips');
    const at = start === undefined ? 0
             : items.findIndex(it => String(it.value) === String(start));
    const bs = items.map((it, i) => {
      const b = el('button', 'chip', it.label);
      b.type = 'button';
      b.setAttribute('aria-pressed', i === at ? 'true' : 'false');
      b.addEventListener('click', () => {
        A.resume();
        wrap.show(i);
        fn(it.value, i, it);
      });
      wrap.appendChild(b);
      return b;
    });
    /* move the selection without running the callback */
    wrap.show = i => bs.forEach((o, j) => o.setAttribute('aria-pressed', i === j ? 'true' : 'false'));
    wrap.pick = i => bs[i] && bs[i].click();
    return wrap;
  }
  function slider(labelTxt, min, max, val, step, fn, fmt) {
    const w = el('div', 'ctl');
    const lb = el('label', null, labelTxt);
    const r = el('input'); r.type = 'range';
    r.min = min; r.max = max; r.value = val; r.step = step || 1;
    r.id = 'sl-' + labelTxt.replace(/\W+/g, '-').toLowerCase();
    lb.setAttribute('for', r.id);
    const out = el('span', 'val', fmt ? fmt(val) : String(val));
    r.addEventListener('input', () => {
      const v = Number(r.value);
      out.textContent = fmt ? fmt(v) : String(v);
      fn(v);
    });
    w.append(lb, r, out);
    w.set = v => { r.value = v; out.textContent = fmt ? fmt(v) : String(v); };
    return w;
  }
  function select(labelTxt, options, fn, val) {
    const w = el('div', 'ctl');
    const s = el('select', 'b');
    s.id = 'se-' + labelTxt.replace(/\W+/g, '-').toLowerCase();
    options.forEach(o => {
      const op = el('option', null, o.label);
      op.value = o.value; s.appendChild(op);
    });
    if (val != null) s.value = val;
    s.addEventListener('change', () => { A.resume(); fn(s.value); });
    if (labelTxt) { const lb = el('label', null, labelTxt); lb.setAttribute('for', s.id); w.appendChild(lb); }
    w.appendChild(s);
    w.el = s;
    return w;
  }
  const row = (...kids) => { const r = el('div', 'ctl'); kids.forEach(k => k && r.appendChild(k)); return r; };
  const note = t => html('p', 'small', t);

  return { el, html, btn, toggle, chips, slider, select, row, note };
})();

/* ═══════════════════════════════════════════════════════════════
   APP — nav, lesson rendering, progress, the stage handshake.
   ═══════════════════════════════════════════════════════════════ */
const APP = (() => {
  const $ = s => document.querySelector(s);
  let idx = 0, done = {}, timers = [], transport = A.transport();
  /* reading level: 'simple' explains every lesson from zero, 'pro' is the
     producer-facing text. The 3D lab and its audio are identical in both. */
  let mode = 'simple';
  const MKEY = 'rbx-theory-mode-v1';
  function loadMode() {
    try { const v = localStorage.getItem(MKEY); if (v === 'simple' || v === 'pro') mode = v; }
    catch (e) {}
  }
  function saveMode() { try { localStorage.setItem(MKEY, mode); } catch (e) {} }

  /* theme: null follows the device, 'light' / 'dark' is an explicit choice.
     The page reads it from a data-theme stamp; the 3D stage is repainted too. */
  let theme = null;
  const TKEY = 'rbx-theory-theme-v1';
  function systemTheme() {
    try {
      return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
        ? 'dark' : 'light';
    } catch (e) { return 'light'; }
  }
  const effTheme = () => theme || systemTheme();
  function loadTheme() {
    try { const v = localStorage.getItem(TKEY); if (v === 'light' || v === 'dark') theme = v; }
    catch (e) {}
  }
  function applyTheme() {
    const r = document.documentElement;
    if (theme) r.setAttribute('data-theme', theme); else r.removeAttribute('data-theme');
    if (V && V.setTheme) V.setTheme(effTheme());
  }
  function toggleTheme() {
    theme = (effTheme() === 'dark') ? 'light' : 'dark';
    try { localStorage.setItem(TKEY, theme); } catch (e) {}
    applyTheme();
    render();   /* rebuilds the 3D view so its materials pick up the new palette */
  }

  /* progress, stored per viewer only — fine if it comes back empty */
  const KEY = 'rbx-theory-progress-v1';
  function load() {
    try { done = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { done = {}; }
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(done)); } catch (e) {}
  }
  function progress() {
    const n = Object.keys(done).filter(k => done[k]).length;
    $('#progTxt').textContent = n + ' / ' + LESSONS.length;
    $('#progBar').style.width = (100 * n / LESSONS.length) + '%';
    let right = 0, total = 0;
    LESSONS.forEach(L => { const t = drillTally(L.id); right += t.right; total += t.total; });
    const dt = $('#drillTxt');
    if (dt) dt.textContent = total ? right + ' / ' + total + ' right' : 'not started';
    const db = $('#drillBar');
    if (db) db.style.width = (total ? 100 * right / total : 0) + '%';
    const rb = $('#reviewBtn');
    if (rb && typeof PRACTICE !== 'undefined') {
      const n = PRACTICE.misses().length;
      rb.hidden = !n && !PRACTICE.entries().length;
      rb.textContent = n ? '↻ Review ' + n + (n === 1 ? ' miss' : ' misses')
                         : '↻ Review · all clear';
      rb.classList.toggle('primary', n > 0);
    }
    document.querySelectorAll('#nav button').forEach(b => {
      b.classList.toggle('done', !!done[b.dataset.id]);
      const t = drillTally(b.dataset.id);
      b.classList.toggle('review', t.wrong.length > 0);
      const tk = b.querySelector('.tick');
      if (tk) tk.textContent = t.wrong.length ? '!' : '\u2713';
      b.title = t.total
        ? t.right + ' of ' + t.total + ' drill answers right' + (t.wrong.length ? ' \u00B7 worth revisiting' : '')
        : '';
    });
  }

  function buildNav() {
    const nav = $('#nav');
    nav.innerHTML = '';
    let lvl = null;
    LESSONS.forEach((L, i) => {
      if (L.level !== lvl) {
        lvl = L.level;
        const h = UI.el('div', 'lvl');
        h.innerHTML = '<b>Level ' + lvl + '</b> · ' + ['Fundamentals','Harmony','Pro moves'][lvl - 1];
        nav.appendChild(h);
      }
      const b = UI.el('button');
      b.type = 'button'; b.dataset.id = L.id;
      b.innerHTML = '<span class="num">' + (i + 1) + '</span><span>' + L.title +
                    '</span><span class="tick">✓</span>';
      b.addEventListener('click', () => { go(i); closeRail(); });
      nav.appendChild(b);
    });
  }

  /* Scratch space per lesson, kept for the life of the session so that
     switching reading level or theme does not throw away a pattern or a
     progression the learner built. */
  const kept = {};
  const keep = (id, k, v) => { (kept[id] = kept[id] || {})[k] = v; };
  const recall = (id, k) => (kept[id] || {})[k];

  /* Drill accuracy, tracked separately from "lesson done". First answer on
     each question counts; a lesson can be retried to clear its record. */
  /* v2: results are keyed by the question itself rather than by its position,
     so the simple and producer versions of a lesson no longer overwrite each
     other's scores. v1 records cannot be mapped onto questions reliably, so
     they are left where they are rather than guessed at. */
  const DKEY = 'rbx-theory-drills-v2';
  let drills = {};
  function loadDrills() {
    try { drills = JSON.parse(localStorage.getItem(DKEY) || '{}') || {}; } catch (e) { drills = {}; }
  }
  function saveDrills() { try { localStorage.setItem(DKEY, JSON.stringify(drills)); } catch (e) {} }

  /* Identity of a quiz question: its text plus its options. Two questions that
     read identically in both modes share one record; different ones never do. */
  function qKey(Q) {
    const s = String(Q.q) + ' ' + (Q.a || []).join(' ');
    let h = 5381;
    for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
    return 'q' + h.toString(36);
  }
  function drillTally(id) {
    const rec = drills[id] || {};
    const ks = Object.keys(rec);
    return { total:ks.length, right:ks.filter(k => rec[k]).length,
             wrong:ks.filter(k => !rec[k]) };
  }
  /* Clear one lesson's quiz answers so they can be attempted again. Ear-training
     runs (the 'd' records) are a separate history and are left alone. */
  function retryQuiz(id) {
    const rec = drills[id]; if (!rec) return;
    Object.keys(rec).forEach(k => { if (k[0] === 'q') delete rec[k]; });
    saveDrills();
  }

  function clearTimers() { timers.forEach(clearTimeout); timers = []; }
  const later = (fn, ms) => { timers.push(setTimeout(fn, ms)); };

  /* things to undo before the page is rebuilt — a practice round that has
     borrowed a drum lane puts it back here rather than saving it by accident */
  let leaving = [];
  /* Reset the stage and hand back the object every lesson — and the review —
     talks to it through. */
  function openStage(L) {
    leaving.forEach(fn => { try { fn(); } catch (e) {} });
    leaving = [];
    clearTimers(); transport.stop();
    if (V.clearPaint) V.clearPaint();
    $('#hudTag').textContent = L.tag;
    $('#stageCtl').innerHTML = '';
    $('#stageHint').textContent = L.hint || 'Drag to orbit · pinch or scroll to zoom';
    $('#readout').textContent = 'loading…';

    const v = V.set(L.stage.view, L.stage.cfg || {});
    const ctx = {
      v, L, T, A, UI, transport, later,
      read: t => { $('#readout').textContent = t; },
      hint: t => { $('#stageHint').textContent = t; },
      stage: (...kids) => { kids.forEach(k => k && $('#stageCtl').appendChild(k)); },
      seq: opts => { transport.stop(); transport.start(opts); },
      stop: () => { transport.stop(); },
      keep: (k, v) => keep(L.id, k, v),
      recall: k => recall(L.id, k),
      /* lessons call this after changing the instrument behind the panel's back
         — a preset, or a view swapped for one with a different step count */
      syncA11y: () => syncA11y(ctx),
      onLeave: fn => leaving.push(fn),
      /* ear-training results feed the same accuracy tally as the quizzes */
      score: ok => {
        const rec = drills[L.id] = drills[L.id] || {};
        rec['d' + Object.keys(rec).filter(x => x[0] === 'd').length] = !!ok;
        saveDrills(); progress();
      }
    };
    return ctx;
  }

  function render() {
    const L = LESSONS[idx];
    const ctx = openStage(L);

    /* ── prose ── */
    const S = (mode === 'simple' && L.simple) ? L.simple : null;
    const lede = (S && S.lede) || L.lede;
    const blocks = (S && S.blocks) || L.blocks || [];
    const quiz = (S && S.quiz) || L.quiz;
    const art = $('#console');
    art.innerHTML = '';
    const w = UI.el('div', 'wrap');

    const bar = UI.el('div', 'modebar');
    bar.appendChild(UI.html('span', 'lab', 'Explain it'));
    const seg = UI.el('div', 'seg');
    [['simple', 'Like I\u2019m 5'], ['pro', 'Producer']].forEach(pair => {
      const b = UI.el('button', null, pair[1]);
      b.type = 'button';
      b.setAttribute('aria-pressed', mode === pair[0] ? 'true' : 'false');
      b.addEventListener('click', () => {
        if (mode === pair[0]) return;
        mode = pair[0]; saveMode(); render();
      });
      seg.appendChild(b);
    });
    bar.appendChild(seg);
    bar.appendChild(UI.html('span', 'lab',
      mode === 'simple' ? 'small steps, nothing skipped' : 'full detail'));
    bar.appendChild(UI.el('span', 'spacer'));
    const tb = UI.el('button', 'theme-btn');
    tb.type = 'button';
    tb.textContent = effTheme() === 'dark' ? '\u2600 Light' : '\u263E Dark';
    tb.title = 'Switch to the ' + (effTheme() === 'dark' ? 'light' : 'dark') + ' theme';
    tb.addEventListener('click', toggleTheme);
    bar.appendChild(tb);
    w.appendChild(bar);

    const crumb = UI.html('div', 'crumb',
      '<b>Level ' + L.level + '</b> &nbsp;·&nbsp; Lesson ' + (idx + 1) + ' of ' + LESSONS.length +
      ' &nbsp;·&nbsp; ' + L.tag);
    w.appendChild(crumb);
    w.appendChild(UI.html('h2', null, L.title));
    w.appendChild(UI.html('p', 'lede', lede));

    blocks.forEach(b => {
      if (b.h) w.appendChild(UI.html('h3', null, b.h));
      if (b.p) w.appendChild(UI.html('p', null, b.p));
      if (b.small) w.appendChild(UI.html('p', 'small', b.small));
      if (b.note) {
        const p = UI.el('div', 'panel');
        p.appendChild(UI.html('h4', null, b.note.h || 'Worth knowing'));
        p.appendChild(UI.html('p', null, b.note.p));
        w.appendChild(p);
      }
      if (b.table) {
        const tw = UI.el('div', 'tablewrap'), t = UI.el('table');
        const th = UI.el('tr');
        b.table.head.forEach(h => th.appendChild(UI.html('th', null, h)));
        const hd = UI.el('thead'); hd.appendChild(th); t.appendChild(hd);
        const tb = UI.el('tbody');
        b.table.rows.forEach(r => {
          const tr = UI.el('tr');
          r.forEach((c, i) => tr.appendChild(UI.html('td', i === 0 ? 'hi' : null, c)));
          tb.appendChild(tr);
        });
        t.appendChild(tb); tw.appendChild(t); w.appendChild(tw);
      }
      if (b.keys) {
        const ul = UI.el('ul', 'keys');
        b.keys.forEach(k => ul.appendChild(UI.html('li', null, '<span>' + k + '</span>')));
        w.appendChild(ul);
      }
      if (b.try) {
        /* simple mode reuses the lesson's own interactive controls */
        const build = b.try.build ||
          ((L.blocks || []).filter(x => x.try)[0] || { try:{} }).try.build;
        const p = UI.el('div', 'panel try');
        p.appendChild(UI.html('h4', null, b.try.h || 'Try it'));
        if (b.try.p) p.appendChild(UI.html('p', null, b.try.p));
        const host = UI.el('div', 'ctl');
        p.appendChild(host);
        w.appendChild(p);
        const made = build ? build(ctx) : null;
        (Array.isArray(made) ? made : [made]).forEach(k => k && host.appendChild(k));
      }
    });

    /* ── practice: hear it, name it, build it ── */
    if (L.practice && typeof PRACTICE !== 'undefined') {
      const p = UI.el('div', 'panel try practice-panel');
      p.appendChild(UI.html('h4', null, L.practice.h || 'Practise it'));
      p.appendChild(UI.html('p', null, L.practice.p ||
        'One round takes a minute: listen, say what it was, then build the same thing ' +
        'on the instrument above. Getting it wrong here is what puts it in your review list.'));
      p.appendChild(PRACTICE.build(ctx, L.practice));
      w.appendChild(p);
    }

    /* filled in after init, because what a lesson lets you keep depends on
       state the lesson only has once it has started (its tempo, its key) */
    const studioSlot = UI.el('div');
    w.appendChild(studioSlot);

    /* ── quiz ── */
    {
      const q = UI.el('div', 'quiz');
      const title = UI.html('h3', null, 'Check yourself');
      if (quiz && quiz.length) q.appendChild(title);
      const rec = drills[L.id] = drills[L.id] || {};
      /* the running score and the retry offer follow the answers as they land,
         instead of describing how things stood when the page was drawn */
      const chrome = () => {
        const t = drillTally(L.id);
        title.innerHTML = 'Check yourself' +
          (t.total ? ' \u00B7 <span style="color:var(--muted)">' + t.right + '/' + t.total +
            ' right so far</span>' : '');
        const any = Object.keys(rec).some(k => k[0] === 'q');
        if (retry) retry.hidden = !any;
      };
      let retry = null;
      (quiz || []).forEach((Q, qi) => {
        const key = qKey(Q);
        const box = UI.el('div', 'q');
        box.appendChild(UI.html('p', 'qt', '<span class="qn">Q' + (qi + 1) + '</span>' + Q.q));
        const opts = UI.el('div', 'opts');
        const why = UI.html('p', 'why', Q.why); why.hidden = true;
        const settle = picked => {
          Array.from(opts.children).forEach((o, oi) => {
            o.disabled = true;
            if (oi === Q.c) o.classList.add('right');
            if (picked != null && oi === picked && picked !== Q.c) o.classList.add('wrong');
          });
          why.hidden = false;
        };
        Q.a.forEach((txt, ai) => {
          const b = UI.el('button', 'opt', txt);
          b.type = 'button';
          b.addEventListener('click', () => {
            settle(ai);
            if (rec[key] === undefined) {      /* only the first answer is scored */
              rec[key] = (ai === Q.c); saveDrills(); progress();
            }
            chrome();
            if (Q.hear) { A.resume(); Q.hear(); }
          });
          opts.appendChild(b);
        });
        box.append(opts, why);
        /* an answered question stays answered across a re-render, so switching
           reading level or theme does not quietly offer a second first attempt */
        if (rec[key] !== undefined) settle(rec[key] ? Q.c : null);
        q.appendChild(box);
      });
      const mark = UI.btn(done[L.id] ? 'Done ✓' : 'Mark this lesson done ✓', () => {
        done[L.id] = true; save(); progress();
        mark.textContent = 'Done ✓'; mark.classList.add('on');
      }, { primary:!done[L.id] });
      retry = UI.btn('↻ Try these again', () => { retryQuiz(L.id); render(); });
      retry.title = 'Clear this lesson’s answers and start the questions over';
      chrome();
      q.appendChild(UI.row(mark, retry));
      w.appendChild(q);
    }

    /* ── pager ── */
    const pg = UI.el('div', 'pager');
    if (idx > 0) {
      const p = LESSONS[idx - 1];
      pg.appendChild(UI.btn('<span class="lab">← Previous</span><span class="ttl">' + p.title + '</span>',
        () => go(idx - 1)));
    } else pg.appendChild(UI.el('span'));
    if (idx < LESSONS.length - 1) {
      const n = LESSONS[idx + 1];
      pg.appendChild(UI.btn('<span class="lab">Next →</span><span class="ttl">' + n.title + '</span>',
        () => go(idx + 1)));
    } else pg.appendChild(UI.el('span'));
    w.appendChild(pg);

    w.appendChild(UI.html('div', 'foot',
      'Built as a companion to the Red Bow Music <em>producer theory</em> curriculum — ' +
      'the concepts, rebuilt here as things you can click, hear and rotate. ' +
      'Every note you hear is generated live in the browser.'));
    art.appendChild(w);

    /* the 3D instrument gets set up last, so it can talk to the DOM above */
    if (L.init) L.init(ctx);

    /* ── keep what you made ── */
    if (ctx.keepCfg && typeof STUDIO !== 'undefined') {
      const p = UI.el('div', 'panel studio-panel');
      p.appendChild(UI.html('h4', null, 'Keep this'));
      p.appendChild(UI.html('p', null,
        'Undo is Ctrl+Z (⌘Z), and shift with it to redo. Saved ideas stay in this browser; ' +
        'the MIDI file drops straight into a DAW at the tempo shown.'));
      p.appendChild(STUDIO.build(ctx, ctx.keepCfg));
      studioSlot.appendChild(p);
    }
    /* and the button mirror after that, so it reflects the loaded pattern and
       the view the lesson actually ended up with — then follows it from there */
    buildA11y(ctx);
    if (V.onPaint) V.onPaint(() => syncA11y(ctx));
    document.querySelectorAll('#nav button').forEach(b =>
      b.setAttribute('aria-current', b.dataset.id === L.id ? 'true' : 'false'));
    const cur = document.querySelector('#nav button[aria-current="true"]');
    if (cur && cur.scrollIntoView) cur.scrollIntoView({ block:'nearest' });
    $('#main').scrollTop = 0;
    progress();
    try { location.hash = L.id; } catch (e) {}
  }

  /* Mirror the 3D instrument as real buttons: operable by keyboard, named for
     screen readers, and legible for anyone who finds the perspective labels
     small. The canvas itself is marked decorative.

     The panel is built *after* the lesson has initialised, and every button
     re-reads the instrument after it acts, so what a screen reader announces is
     the instrument's real state rather than a guess about what the tap did. */
  let a11yPads = [];      /* [{btn, g, i}] \u2014 live handles for in-place refresh */
  let a11yShape = '';     /* group/lane layout the panel was built from */

  const shapeOf = d => !d ? '' :
    (d.groups || []).map(g => g.name + '\u00d7' + g.items.length).join('|') +
    (d.form ? '#form' + d.form.steps : '');

  /* Repaint names and pressed states from the instrument. Rebuilds only when
     the instrument itself changed shape (a lesson swapping 8 steps for 12). */
  function syncA11y(ctx) {
    const d = V.a11y && V.a11y();
    if (shapeOf(d) !== a11yShape) { buildA11y(ctx); return; }
    /* only write what actually changed: the playhead repaints the stage many
       times a second, and rewriting an unchanged aria-label makes a screen
       reader chatter through the whole loop */
    a11yPads.forEach(p => {
      const it = d.groups[p.g] && d.groups[p.g].items[p.i];
      if (!it) return;
      const aria = it.aria || it.label;
      if (p.btn.textContent !== it.label) p.btn.textContent = it.label;
      if (p.btn.getAttribute('aria-label') !== aria) p.btn.setAttribute('aria-label', aria);
      if (it.pressed != null) {
        const now = it.pressed ? 'true' : 'false';
        if (p.btn.getAttribute('aria-pressed') !== now) {
          p.btn.setAttribute('aria-pressed', now);
          p.btn.classList.toggle('on', !!it.pressed);
        }
      }
      p.act = it.act;
    });
    if (d.form) buildForm(ctx, d.form);
  }

  function buildA11y(ctx) {
    const body = $('#a11yBody'), sum = $('#a11ySum');
    if (!body) return;
    const focusId = document.activeElement && body.contains(document.activeElement)
      ? document.activeElement.dataset.a11yId : null;
    body.innerHTML = ''; a11yPads = [];
    const d = V.a11y && V.a11y();
    a11yShape = shapeOf(d);
    if (!d) {
      body.appendChild(UI.html('p', 'hint', 'This lesson has no instrument to operate.'));
      return;
    }
    if (sum) sum.textContent = d.title + ' \u2014 buttons (keyboard and screen-reader friendly)';
    body.appendChild(UI.html('p', 'hint',
      'These do exactly what tapping the 3D stage does. Tab to move, Enter or Space to play. ' +
      'Results are announced in the readout above the lesson.'));

    (d.groups || []).forEach((g, gi) => {
      body.appendChild(UI.html('h4', null, g.name));
      const row = UI.el('div', 'pads');
      g.items.forEach((it, ii) => {
        const b = UI.el('button', 'pad' + (/black/.test(it.aria || '') ? ' black' : ''), it.label);
        b.type = 'button';
        b.dataset.a11yId = gi + '-' + ii;
        b.setAttribute('aria-label', it.aria || it.label);
        if (it.pressed != null) {
          b.setAttribute('aria-pressed', it.pressed ? 'true' : 'false');
          b.classList.toggle('on', !!it.pressed);
        }
        const handle = { btn:b, g:gi, i:ii, act:it.act };
        b.addEventListener('click', () => { A.resume(); handle.act(); syncA11y(ctx); });
        a11yPads.push(handle);
        row.appendChild(b);
      });
      body.appendChild(row);
    });
    if (focusId) {
      const back = body.querySelector('[data-a11y-id="' + focusId + '"]');
      if (back) back.focus();
    }

    if (d.form) buildForm(ctx, d.form);
  }

  /* the piano roll gets a compact add/remove form instead of 240 buttons */
  function buildForm(ctx, f) {
    const body = $('#a11yBody');
    let host = body.querySelector('.a11yform');
    if (host) host.innerHTML = ''; else { host = UI.el('div', 'a11yform'); body.appendChild(host); }
    host.appendChild(UI.html('h4', null, 'Write a note'));
    const stepSel = UI.select('Step', Array.from({ length:f.steps }, (_, i) =>
      ({ label:'step ' + (i + 1), value:i })), () => {}, 0);
    const rowSel = UI.select('Note', f.rows.map(m =>
      ({ label:f.rowLabel(m), value:m })), () => {}, f.rows[0]);
    const act = UI.btn('Add or remove', () => {
      const st = Number(stepSel.el.value), md = Number(rowSel.el.value);
      f.toggle(st, md);
      syncA11y(ctx);
    }, { primary:true });
    host.appendChild(UI.row(stepSel, rowSel, act));
    const list = f.list();
    host.appendChild(UI.html('h4', null, 'Notes on the roll (' + list.length + ')'));
    const wrap = UI.el('div', 'notelist');
    if (!list.length) wrap.appendChild(UI.html('span', 'hint', 'empty'));
    list.forEach(n => {
      const b = UI.el('button', 'pad', f.rowLabel(n.midi) + ' @' + (n.step + 1));
      b.type = 'button';
      b.setAttribute('aria-label', 'Remove ' + f.rowLabel(n.midi) + ' at step ' + (n.step + 1));
      b.addEventListener('click', () => { A.resume(); f.toggle(n.step, n.midi); syncA11y(ctx); });
      wrap.appendChild(b);
    });
    host.appendChild(wrap);
  }

  /* ── Review: the concepts you have missed, asked again with fresh notes ──
     A concept leaves this list after three right answers in a row, so the page
     empties as the gaps close rather than nagging forever. */
  function renderReview() {
    const due = PRACTICE.misses();
    const L = { id:'review', title:'Review', tag:'Review',
                hint:'Your misses, with different notes each time',
                stage:{ view:'keys', cfg:{ lo:48, hi:72, labels:'names' } } };
    const ctx = openStage(L);
    ctx.read(due.length ? due.length + ' to revisit' : 'nothing to revisit');
    progress();

    const art = $('#console');
    art.innerHTML = '';
    const w = UI.el('div', 'wrap');
    w.appendChild(UI.html('div', 'crumb', '<b>Review</b> &nbsp;·&nbsp; what you have missed'));
    w.appendChild(UI.html('h2', null, 'Come back to the hard bits'));

    if (!due.length) {
      w.appendChild(UI.html('p', 'lede', PRACTICE.entries().length
        ? 'Nothing is waiting. Everything you have missed has since come back right ' +
          'three times in a row, which is the point at which it counts as learned.'
        : 'Nothing here yet. Play a practice round at the bottom of any lesson — ' +
          'whatever you get wrong turns up on this page with different notes.'));
      const back = UI.btn('Go to a lesson →', () => go(idx), { primary:true });
      w.appendChild(UI.row(back));
      const past = PRACTICE.entries();
      if (past.length) w.appendChild(scoreTable(past, 'Everything you have practised'));
      art.appendChild(w);
      return;
    }

    w.appendChild(UI.html('p', 'lede',
      'These are the ideas you have got wrong at least once. Each round below asks the ' +
      'same question with different notes — the thing you are learning is the relationship, ' +
      'not one shape in one place.'));
    w.appendChild(scoreTable(due, 'Waiting for you'));

    const p = UI.el('div', 'panel try practice-panel');
    p.appendChild(UI.html('h4', null, 'Work through them'));
    const host = UI.el('div');
    p.appendChild(host);
    w.appendChild(p);
    art.appendChild(w);

    host.appendChild(PRACTICE.build(ctx, {
      queue:due,
      /* each concept belongs to an instrument — put that one on the stage */
      onStage: cur => {
        const owner = LESSONS.filter(x => x.id === cur.lesson)[0];
        if (!owner) return;
        const want = owner.stage.view, cfg = owner.stage.cfg || {};
        ctx.v = V.set(want, cfg);
        ctx.hint(owner.hint || '');
        $('#hudTag').textContent = owner.title;
        if (want === 'grid') ctx.v.clearAll();
        ctx.syncA11y();
      },
      onDone: () => { renderReview(); }
    }));
  }

  /* what each concept's record looks like, and whether it is getting better */
  function scoreTable(list, heading) {
    const box = UI.el('div', 'panel');
    box.appendChild(UI.html('h4', null, heading));
    const tw = UI.el('div', 'tablewrap'), t = UI.el('table');
    const hd = UI.el('thead'), hr = UI.el('tr');
    ['What', 'From', 'Right', 'Wrong', 'Recent', 'Trend'].forEach(h =>
      hr.appendChild(UI.html('th', null, h)));
    hd.appendChild(hr); t.appendChild(hd);
    const tb = UI.el('tbody');
    list.forEach(e => {
      const owner = LESSONS.filter(x => x.id === e.lesson)[0];
      const tr = UI.el('tr');
      const tn = PRACTICE.trend(e);
      const cells = [
        e.label,
        owner ? owner.title : e.lesson,
        String(e.right), String(e.wrong),
        (e.runs || []).slice(-6).map(x => x ? '✓' : '✗').join(' ') || '—',
        tn ? (tn.from + '% → ' + tn.to + '%') : '—'
      ];
      cells.forEach((c, i) => tr.appendChild(UI.html('td', i === 0 ? 'hi' : null, c)));
      tb.appendChild(tr);
    });
    t.appendChild(tb); tw.appendChild(t); box.appendChild(tw);
    return box;
  }

  function go(i) {
    reviewing = false;
    idx = Math.max(0, Math.min(LESSONS.length - 1, i));
    render();
  }
  let reviewing = false;
  function openReview() { reviewing = true; renderReview(); closeRail(); }
  const closeRail = () => {
    $('#rail').dataset.open = 'false';
    $('#scrim').dataset.open = 'false';
    $('#menuBtn').setAttribute('aria-expanded', 'false');
  };

  function boot() {
    loadTheme();
    if (V && V.setTheme) V.setTheme(effTheme());
    if (!window.THREE) {
      /* keep the HUD nodes in place — only the canvas is replaced */
      const gl = document.querySelector('#gl');
      if (gl) gl.hidden = true;
      const msg = UI.el('div', 'nogl',
        'The 3D stage could not load, so this page is running as text only. ' +
        'Check the connection to the Three.js CDN and reload.');
      document.querySelector('#stage').appendChild(msg);
    } else {
      V.mount(document.querySelector('#gl'));
    }
    load(); loadMode(); loadDrills(); applyTheme();
    if (typeof PRACTICE !== 'undefined') PRACTICE.plan(LESSONS);
    buildNav();
    const hash = (location.hash || '').replace('#', '');
    const at = LESSONS.findIndex(l => l.id === hash);
    idx = at >= 0 ? at : 0;
    render();

    $('#menuBtn').addEventListener('click', () => {
      const open = $('#rail').dataset.open !== 'true';
      $('#rail').dataset.open = open ? 'true' : 'false';
      $('#scrim').dataset.open = open ? 'true' : 'false';
      $('#menuBtn').setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    $('#scrim').addEventListener('click', closeRail);
    const rb = $('#reviewBtn');
    if (rb) rb.addEventListener('click', () => { A.resume(); openReview(); });
    document.addEventListener('keydown', e => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
      if (e.key === 'ArrowRight' && e.altKey) go(idx + 1);
      if (e.key === 'ArrowLeft' && e.altKey) go(idx - 1);
    });
    document.addEventListener('pointerdown', () => A.resume(), { once:true });
    try {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const onSys = () => { if (!theme) { applyTheme(); render(); } };
      if (mq.addEventListener) mq.addEventListener('change', onSys);
      else if (mq.addListener) mq.addListener(onSys);
    } catch (e) {}
    new ResizeObserver(() => V.resize && V.resize()).observe(document.querySelector('#stage'));
  }
  return { boot, go, qKey, get idx() { return idx; } };
})();
