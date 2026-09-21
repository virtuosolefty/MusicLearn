/* ═══════════════════════════════════════════════════════════════
   MIXER — one strip per instrument.

   Until now every voice in this app connected straight to one master
   gain, which is why there was never anything to mix. A strip is the
   smallest thing that makes "turn the bass down" mean something:

       voice → gain → pan → master
                   └→ send → reverb

   Nothing here changes how the lessons sound. A voice with no strip
   still goes to master exactly as it always did; strips only exist for
   what asks for one.
   ═══════════════════════════════════════════════════════════════ */
const MIXER = (() => {
  const strips = {};
  let built = null;              /* the AudioContext the strips belong to */

  /* A browser without StereoPannerNode still gets level and send; it just
     cannot place anything left or right. Nothing downstream needs to know. */
  const canPan = ctx => !!(ctx && typeof ctx.createStereoPanner === 'function');

  function make(id) {
    const ctx = A.resume();
    if (!ctx) return null;
    /* the context is rebuilt only if the page did something drastic; if it is
       a different one than our nodes came from, every strip is stale */
    if (built && built !== ctx) { Object.keys(strips).forEach(k => delete strips[k]); }
    built = ctx;
    const gain = ctx.createGain();
    const send = ctx.createGain();
    let out = gain, pan = null;
    if (canPan(ctx)) { pan = ctx.createStereoPanner(); gain.connect(pan); out = pan; }
    out.connect(A.master);
    gain.connect(send); send.connect(A.verb);
    send.gain.value = 0;
    const s = { id, gain, pan, send, vol:0.8, panning:0, mute:false, solo:false };
    gain.gain.value = s.vol;
    strips[id] = s;
    return s;
  }

  /* The strip for a channel, made on first use. `input` is what a voice
     connects to — pass it as `out` to A.note / A.click. */
  function strip(id) {
    const s = strips[id] || make(id);
    return s;
  }
  const input = id => { const s = strip(id); return s ? s.gain : null; };

  /* Solo is not stored on the strip that is soloed — it is a property of the
     whole desk: the moment anything is soloed, everything else is down. */
  const anySolo = () => Object.keys(strips).some(k => strips[k].solo);
  function audible(s) {
    if (s.mute) return false;
    return anySolo() ? s.solo : true;
  }
  function apply() {
    Object.keys(strips).forEach(k => {
      const s = strips[k];
      const g = audible(s) ? s.vol : 0;
      if (s.gain.gain.setTargetAtTime) s.gain.gain.setTargetAtTime(g, A.now(), 0.01);
      else s.gain.gain.value = g;
      if (s.pan) s.pan.pan.value = Math.max(-1, Math.min(1, s.panning));
    });
  }

  /* Set whatever is given and leave the rest: set('kick', {vol:0.5}) */
  function set(id, v) {
    const s = strip(id);
    if (!s) return null;
    if (v.vol != null) s.vol = Math.max(0, Math.min(1.4, v.vol));
    if (v.pan != null) s.panning = Math.max(-1, Math.min(1, v.pan));
    if (v.mute != null) s.mute = !!v.mute;
    if (v.solo != null) s.solo = !!v.solo;
    if (v.send != null) s.send.gain.value = Math.max(0, Math.min(1, v.send));
    apply();
    return s;
  }
  const get = id => {
    const s = strips[id];
    return s ? { id, vol:s.vol, pan:s.panning, mute:s.mute, solo:s.solo,
                 send:s.send.gain.value, audible:audible(s) } : null;
  };
  const ids = () => Object.keys(strips);
  /* clear the solo state without touching levels — the "listen to everything
     again" button, which is otherwise a fiddly thing to do by hand */
  function unsoloAll() { ids().forEach(k => { strips[k].solo = false; }); apply(); }
  function reset() {
    ids().forEach(k => {
      try { strips[k].gain.disconnect(); strips[k].send.disconnect();
            if (strips[k].pan) strips[k].pan.disconnect(); } catch (e) {}
      delete strips[k];
    });
  }

  return { strip, input, set, get, ids, apply, unsoloAll, reset, audible,
           get soloing() { return anySolo(); } };
})();
