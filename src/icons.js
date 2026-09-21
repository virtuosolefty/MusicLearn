/* ═══════════════════════════════════════════════════════════════
   ICONS — one inline SVG sprite, drawn for this app.

   Until now the interface used Unicode characters as icons (⌂ ▦ ☰ ▶ ↻ ☀ ☾),
   which render in whatever font the operating system falls back to: some
   become colour emoji, some change weight, none sit on the baseline the
   same way. These are 24-unit line icons at a 1.75 stroke, drawn in
   `currentColor`, so they take the colour and size of the text around them.

   Existing labels keep working: a button written '▶ Play' or 'Next →'
   is decorated with the matching icon automatically, so the 26 lessons
   did not need editing.
   ═══════════════════════════════════════════════════════════════ */
const ICONS = (() => {
  const P = {
    home:'<path d="M3.5 10.5 12 4l8.5 6.5V19a1 1 0 0 1-1 1H15v-5.5H9V20H4.5a1 1 0 0 1-1-1z"/>',
    studio:'<rect x="3.5" y="4" width="17" height="16" rx="2"/><path d="M3.5 9.5h17M3.5 14.5h17M9 4v16M14.5 4v16"/>',
    menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
    play:'<path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/>',
    stop:'<rect x="6.5" y="6.5" width="11" height="11" rx="2" fill="currentColor"/>',
    retry:'<path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3"/><path d="M4.5 4.5v4.2h4.2"/>',
    download:'<path d="M12 4v11.5M7 10.5l5 5 5-5M5 19.5h14"/>',
    check:'<path class="draw" d="M5 12.5 9.8 17 19 7.5"/>',
    cross:'<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M5.5 18.5l1.7-1.7M16.8 7.2l1.7-1.7"/>',
    moon:'<path d="M19.5 14.6A7.8 7.8 0 0 1 9.4 4.5a7.8 7.8 0 1 0 10.1 10.1z"/>',
    settings:'<path d="M4 7h9M17 7h3M4 12h3M11 12h9M4 17h11M19 17h1"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="17" r="2"/>',
    chevron:'<path d="M9.5 6l6 6-6 6"/>',
    right:'<path d="M5 12h13.5M13 6.5l5.5 5.5-5.5 5.5"/>',
    left:'<path d="M19 12H5.5M11 6.5 5.5 12l5.5 5.5"/>',
    note:'<path d="M9 17.5V6l10-2v11.5"/><circle cx="6.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="15.5" r="2.5"/>',
    keyboard:'<rect x="2.5" y="6" width="19" height="12" rx="2"/><path d="M6.5 10h.01M10 10h.01M13.5 10h.01M17 10h.01M7.5 14h9"/>',
    speaker:'<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4.2 4.2 0 0 1 0 6M18.3 6.5a8 8 0 0 1 0 11"/>',
    flag:'<path d="M5.5 21V4M5.5 4.5h11l-2.2 4 2.2 4h-11"/>',
    spark:'<path d="M12 3.5v4M12 16.5v4M3.5 12h4M16.5 12h4M6 6l2.6 2.6M15.4 15.4 18 18M6 18l2.6-2.6M15.4 8.6 18 6"/>'
  };
  const sprite = '<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">' +
    Object.keys(P).map(k => '<symbol id="i-' + k + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">' + P[k] + '</symbol>').join('') +
    '</svg>';
  let mounted = false;
  function mount() {
    if (mounted || typeof document === 'undefined' || !document.body) return;
    mounted = true;
    document.body.insertAdjacentHTML('afterbegin', sprite);
  }
  const svg = (name, cls) => P[name]
    ? '<svg class="i' + (cls ? ' ' + cls : '') + '" aria-hidden="true" focusable="false"><use href="#i-' + name + '"/></svg>'
    : '';

  /* glyph → icon, for labels written before this file existed */
  const LEAD = {
    '▶':'play', '■':'stop', '↻':'retry', '↓':'download',
    '⌂':'home', '▦':'studio', '☰':'menu', '☀':'sun', '☾':'moon',
    '🔊':'speaker', '✓':'check', '✗':'cross'
  };
  const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  /* returns HTML if the label carries an icon glyph, or null if it has none */
  function decorate(text) {
    const t = String(text);
    let lead = null, body = t, tail = null;
    for (const g in LEAD) {
      if (t.indexOf(g + ' ') === 0) { lead = LEAD[g]; body = t.slice(g.length + 1); break; }
    }
    if (/ →$/.test(body)) { tail = 'right'; body = body.slice(0, -2); }
    else if (/ ✓$/.test(body)) { tail = 'check'; body = body.slice(0, -2); }
    else if (/^← /.test(body)) { lead = lead || 'left'; body = body.slice(2); }
    if (!lead && !tail) return null;
    return (lead ? svg(lead) : '') + '<span>' + esc(body) + '</span>' + (tail ? svg(tail) : '');
  }
  /* put a label on a button, with its icon if it has one */
  function label(el, text) {
    if (/</.test(text)) { el.innerHTML = text; return el; }
    const h = decorate(text);
    if (h) el.innerHTML = h; else el.textContent = text;
    return el;
  }
  if (typeof document !== 'undefined') {
    if (document.body) mount();
    else document.addEventListener('DOMContentLoaded', mount);
  }
  /* the icon drawn inline rather than referenced, for the few that animate —
     CSS cannot reach inside a <use> clone */
  const inline = (name, cls) => P[name]
    ? '<svg class="i' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
      P[name] + '</svg>'
    : '';
  return { svg, inline, decorate, label, mount, NAMES:Object.keys(P) };
})();
