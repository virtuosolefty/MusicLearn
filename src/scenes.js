/* ═══════════════════════════════════════════════════════════════
   STAGE — one WebGL canvas, four swappable 3D instruments:
     keys   · a playable two-octave keyboard (+ interval arcs, chord stacks)
     grid   · a step sequencer you can see the beat move across
     wheel  · the circle of fifths as a turntable
     roll   · a piano roll for melodies, with a contour ribbon
   ═══════════════════════════════════════════════════════════════ */
const V = (() => {
  /* Two painted worlds for the 3D stage, matching the page tokens.
     Light is a paper-white study; dark is a green-black control room. */
  const PAL = {
    light:{
      clear:0xF4FAF7, fog:0xF4FAF7, floor:0xD5E5DC,
      white:0xFFFFFF, black:0x1B2B23, shell:0xE3EEE8,
      slate:0xE6F0EA, slateHi:0xD2E5DA, disc:0xEFF6F2,
      tile1:0xE0EDE6, tile2:0xEAF3EE, pad:0xEFF6F2, strip:0xD9EAE0,
      grid:0xBFD5C8, post:0xB6CCC0, dot:0x6E8579, dim:0xB8DECB,
      accent:0x0E9465, amber:0xC08521, mint:0x12A671, sky:0x1C7CBD,
      violet:0x5B4FD4, flag:0xC6453A, tint:0xBFCBF4, emiss:0.45,
      lab1:'#13251D', lab2:'#42574C', lab3:'#5E7568', labAcc:'#9A6612',
      labGreen:'#0B7A52', labOn:'#FFFFFF',
      labBg:'rgba(255,255,255,.93)', labBorder:'#C0D4C8',
      ambC:0xF4FAF7, ambI:1.18, keyC:0xFFFFFF, keyI:0.7,
      fillC:0xD9E8FF, fillI:0.3, rimI:0.25, floorO:0.5, lit:1,
      gridLine:'#93B8A4',
      poolInner:'rgba(20,56,40,0.26)', poolMid:'rgba(20,56,40,0.12)',
      poolO:0.85, poolAdd:false
    },
    dark:{
      clear:0x0A1210, fog:0x0A1210, floor:0x1C2A24,
      white:0xF1F8F4, black:0x141D19, shell:0x22302A,
      slate:0x22302A, slateHi:0x2C3D35, disc:0x141E1A,
      tile1:0x1E2B25, tile2:0x18231E, pad:0x101A16, strip:0x1A2922,
      grid:0x2E4038, post:0x3C5148, dot:0xB2C6BB, dim:0xA6CFBB,
      accent:0x34D399, amber:0xF0B429, mint:0x4FD1A5, sky:0x56C1F0,
      violet:0x9B8BF5, flag:0xFF7B6B, tint:0x7B70DC, emiss:1,
      lab1:'#E9F3ED', lab2:'#B2C6BB', lab3:'#7C9488', labAcc:'#F0B429',
      labGreen:'#6EE7B7', labOn:'#FFFFFF',
      labBg:'rgba(9,16,13,.88)', labBorder:'#36483F',
      ambC:0xD6E6DE, ambI:0.72, keyC:0xFFF6E8, keyI:1.05,
      fillC:0x88A8FF, fillI:0.42, rimI:0.8, floorO:0.7, lit:0.62,
      gridLine:'#3E5A4C',
      poolInner:'rgba(52,211,153,0.22)', poolMid:'rgba(52,211,153,0.08)',
      poolO:1, poolAdd:true
    }
  };
  let theme = 'light';
  let C = PAL.light;
  let ROLE = roles();
  function roles() {
    return { root:C.accent, chord:C.amber, scale:C.tint, target:C.sky,
             extra:C.mint, ghost:C.dim, press:0xFFFFFF };
  }

  let renderer, scene, camera, root, current = null, running = false, last = 0;
  let lightAmb = null, lightKey = null, lightFill = null, lightRim = null;
  let floorMat = null, poolMat = null;
  let cvs, W = 1, H = 1, ray = null, ptr = null;
  /* plain object, so this module can be defined even if the Three.js CDN fails */
  const orb = { tgt:{ x:0, y:0, z:0, set(x, y, z) { this.x = x; this.y = y; this.z = z; } },
                r:17, th:0, ph:1.06, rMin:7, rMax:46, auto:0 };
  let hooks = { readout:()=>{} };

  /* ── canvas text labels as sprites ───────────────────────── */
  function label(text, o) {
    o = o || {};
    const size = 46, weight = o.weight || 700, dpr = 2;
    const fam = o.mono ? '"IBM Plex Mono", monospace' : '"Bricolage Grotesque", Arial, sans-serif';
    const c = document.createElement('canvas'), x = c.getContext('2d');
    x.font = weight + ' ' + size + 'px ' + fam;
    const tw = Math.ceil(x.measureText(text).width), pad = 16;
    c.width = (tw + pad * 2) * dpr / 2; c.height = (size + pad * 2) * dpr / 2;
    const g = c.getContext('2d');
    g.scale(dpr / 2, dpr / 2);
    if (o.bg) {
      g.fillStyle = o.bg;
      const r = 12, w = tw + pad * 2, h = size + pad * 2;
      g.beginPath();
      g.moveTo(r,0); g.lineTo(w-r,0); g.quadraticCurveTo(w,0,w,r); g.lineTo(w,h-r);
      g.quadraticCurveTo(w,h,w-r,h); g.lineTo(r,h); g.quadraticCurveTo(0,h,0,h-r);
      g.lineTo(0,r); g.quadraticCurveTo(0,0,r,0); g.fill();
      if (o.border) { g.strokeStyle = o.border; g.lineWidth = 3; g.stroke(); }
    }
    g.font = weight + ' ' + size + 'px ' + fam;
    g.fillStyle = o.color || C.lab1;
    g.textBaseline = 'middle'; g.textAlign = 'center';
    g.fillText(text, (tw + pad * 2) / 2, (size + pad * 2) / 2 + 2);
    const tex = new THREE.CanvasTexture(c);
    tex.minFilter = THREE.LinearFilter;
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map:tex, transparent:true, depthWrite:false }));
    const h = o.h || 0.62;
    sp.scale.set(h * (c.width / c.height), h, 1);
    return sp;
  }
  /* pick black or white ink for text drawn on top of a coloured key */
  function inkOn(hex) {
    const r = ((hex >> 16) & 255) / 255, g = ((hex >> 8) & 255) / 255, b = (hex & 255) / 255;
    /* weighted by how brightly this theme lights the scene, so the choice
       matches what the key actually looks like on screen */
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) * (C.lit || 1) > 0.52 ? '#16261E' : '#FFFFFF';
  }
  /* A square of grid lines whose alpha falls away towards the edges, so the
     floor has no visible boundary and no hard horizon. */
  function gridTexture() {
    const S = 512, cells = 28, cell = S / cells;
    const c = document.createElement('canvas'); c.width = c.height = S;
    const g = c.getContext('2d');
    g.clearRect(0, 0, S, S);
    g.strokeStyle = C.gridLine; g.lineWidth = 1;
    for (let i = 0; i <= cells; i++) {
      const p = Math.round(i * cell) + 0.5;
      g.globalAlpha = (i % 4 === 0) ? 0.85 : 0.35;         /* every fourth line reads as a bar */
      g.beginPath(); g.moveTo(p, 0); g.lineTo(p, S); g.stroke();
      g.beginPath(); g.moveTo(0, p); g.lineTo(S, p); g.stroke();
    }
    /* fade to nothing at the edges */
    g.globalAlpha = 1;
    g.globalCompositeOperation = 'destination-in';
    const fade = g.createRadialGradient(S / 2, S / 2, S * 0.08, S / 2, S / 2, S * 0.5);
    fade.addColorStop(0, 'rgba(0,0,0,1)');
    fade.addColorStop(0.55, 'rgba(0,0,0,0.75)');
    fade.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = fade; g.fillRect(0, 0, S, S);
    const t = new THREE.CanvasTexture(c);
    t.minFilter = THREE.LinearFilter;
    return t;
  }
  /* The light the instrument stands in — or the shadow it casts, depending
     on which way round the room is lit. */
  function poolTexture() {
    const S = 256;
    const c = document.createElement('canvas'); c.width = c.height = S;
    const g = c.getContext('2d');
    const r = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
    r.addColorStop(0, C.poolInner);
    r.addColorStop(0.45, C.poolMid);
    r.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = r; g.fillRect(0, 0, S, S);
    const t = new THREE.CanvasTexture(c);
    t.minFilter = THREE.LinearFilter;
    return t;
  }
  function disposeDeep(obj) {
    obj.traverse(n => {
      if (n.geometry) n.geometry.dispose();
      if (n.material) {
        const ms = Array.isArray(n.material) ? n.material : [n.material];
        ms.forEach(m => { if (m.map) m.map.dispose(); m.dispose(); });
      }
    });
    while (obj.children.length) obj.remove(obj.children[0]);
  }
  const mat = (color, o) => new THREE.MeshStandardMaterial(Object.assign(
    { color, roughness:0.52, metalness:0.12 }, o || {}));

  /* ── boot ────────────────────────────────────────────────── */
  /* If Three.js loaded but this device cannot give it a WebGL context, the
     instruments are still built — just never drawn — so the flat view, which
     mirrors them as buttons, keeps working. mount() returns false then. */
  let headless = false;
  function mount(canvas, h) {
    cvs = canvas; hooks = Object.assign(hooks, h || {});
    ray = new THREE.Raycaster(); ptr = new THREE.Vector2();
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:false });
      renderer.setClearColor(C.clear, 1);
    } catch (e) { renderer = null; headless = true; }
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(C.fog, 26, 62);
    camera = new THREE.PerspectiveCamera(42, 1, 0.1, 300);
    root = new THREE.Group(); scene.add(root);

    lightAmb = new THREE.AmbientLight(C.ambC, C.ambI); scene.add(lightAmb);
    lightKey = new THREE.DirectionalLight(C.keyC, C.keyI); lightKey.position.set(6, 14, 9); scene.add(lightKey);
    lightFill = new THREE.DirectionalLight(C.fillC, C.fillI); lightFill.position.set(-9, 6, -6); scene.add(lightFill);
    lightRim = new THREE.PointLight(C.accent, C.rimI, 40); lightRim.position.set(0, 3, -13); scene.add(lightRim);

    /* The room the instruments stand in: a grid that fades out instead of
       ending in a hard square, and a pool of light underneath — a glow in the
       dark theme, a soft shadow in the light one. Both are canvas textures, so
       they are regenerated when the theme changes and cost nothing to draw. */
    floorMat = new THREE.MeshBasicMaterial({
      map:gridTexture(), transparent:true, opacity:C.floorO,
      depthWrite:false, fog:false });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(70, 70), floorMat);
    floor.rotation.x = -Math.PI / 2; floor.position.y = -2.6; scene.add(floor);

    poolMat = new THREE.MeshBasicMaterial({
      map:poolTexture(), transparent:true, opacity:C.poolO,
      depthWrite:false, fog:false,
      blending:C.poolAdd ? THREE.AdditiveBlending : THREE.NormalBlending });
    const pool = new THREE.Mesh(new THREE.PlaneGeometry(46, 30), poolMat);
    pool.rotation.x = -Math.PI / 2; pool.position.set(0, -2.55, 0); scene.add(pool);

    if (headless) return false;
    bindPointer();
    resize();
    window.addEventListener('resize', resize);
    running = true; last = performance.now(); requestAnimationFrame(tick);
    return true;
  }
  function resize() {
    if (!renderer) return;
    const r = cvs.getBoundingClientRect();
    W = Math.max(1, r.width); H = Math.max(1, r.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(W, H, false);
    camera.aspect = W / H; camera.updateProjectionMatrix();
    if (current && current.onResize) current.onResize(W / H);
  }
  /* frame an object of roughly bw × bh world units, whatever the stage shape.
     vertical FOV is 42°, so the visible height at distance d is 0.768·d       */
  function fit(bw, bh) {
    const a = (W / H) || 1.6;
    orb.bw = bw; orb.bh = bh;
    /* views declare a generous height; trimming it lets a wide stage frame the
       instrument across ~80% of its width instead of a narrow middle band.
       A narrow (phone) stage is width-limited and is not affected. */
    const rh = bh * 0.74 / 0.768, rw = bw / (0.768 * a);
    orb.r = Math.max(rh, rw) * (rw >= rh ? 1.06 : 1.02);
    orb.rMin = orb.r * 0.45; orb.rMax = orb.r * 2.6;
  }
  function placeCam() {
    const { tgt, r, th, ph } = orb;
    camera.position.set(
      tgt.x + r * Math.sin(ph) * Math.sin(th),
      tgt.y + r * Math.cos(ph),
      tgt.z + r * Math.sin(ph) * Math.cos(th));
    camera.lookAt(tgt.x, tgt.y, tgt.z);
  }
  /* The flat view hides the canvas; there is no reason to keep rendering into
     it, least of all on the phone the flat view exists for. */
  let paused = false;
  function setPaused(v) {
    const was = paused;
    paused = !!v;
    if (was && !paused && running) { last = performance.now(); requestAnimationFrame(tick); }
  }
  function tick(now) {
    if (!running || paused) return;      /* setPaused(false) restarts the loop */
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (orb.auto) orb.th += orb.auto * dt;
    if (current && current.update) current.update(dt, now / 1000);
    FX.update(dt);
    placeCam();
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }

  /* ── drag to orbit, tap to pick ──────────────────────────── */
  function bindPointer() {
    let down = false, moved = 0, lx = 0, ly = 0, id = null, pinch = 0;
    const pos = e => { const r = cvs.getBoundingClientRect();
      return { x:((e.clientX - r.left) / r.width) * 2 - 1, y:-((e.clientY - r.top) / r.height) * 2 + 1 }; };
    cvs.addEventListener('pointerdown', e => {
      down = true; moved = 0; lx = e.clientX; ly = e.clientY; id = e.pointerId;
      cvs.setPointerCapture(id);
    });
    cvs.addEventListener('pointermove', e => {
      if (!down) { hover(pos(e)); return; }
      const dx = e.clientX - lx, dy = e.clientY - ly;
      moved += Math.abs(dx) + Math.abs(dy);
      orb.th -= dx * 0.006;
      orb.ph = Math.max(0.22, Math.min(1.5, orb.ph - dy * 0.005));
      lx = e.clientX; ly = e.clientY;
    });
    const up = e => {
      if (!down) return; down = false;
      try { cvs.releasePointerCapture(id); } catch (err) {}
      if (moved < 7) pick(pos(e));
    };
    cvs.addEventListener('pointerup', up);
    cvs.addEventListener('pointercancel', () => { down = false; });
    cvs.addEventListener('wheel', e => {
      e.preventDefault();
      orb.r = Math.max(orb.rMin, Math.min(orb.rMax, orb.r + e.deltaY * 0.012));
    }, { passive:false });
    cvs.addEventListener('touchmove', e => {
      if (e.touches.length === 2) {
        const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX,
                             e.touches[0].clientY - e.touches[1].clientY);
        if (pinch) orb.r = Math.max(orb.rMin, Math.min(orb.rMax, orb.r + (pinch - d) * 0.04));
        pinch = d;
      }
    }, { passive:true });
    cvs.addEventListener('touchend', () => { pinch = 0; });
  }
  function cast(p) {
    ptr.set(p.x, p.y); ray.setFromCamera(ptr, camera);
    const list = (current && current.pickables) || [];
    return list.length ? ray.intersectObjects(list, true) : [];
  }
  function pick(p) {
    const hit = cast(p)[0];
    if (hit && current && current.onPick) current.onPick(hit);
  }
  function hover(p) {
    if (!current || !current.onHover) return;
    const hit = cast(p)[0];
    current.onHover(hit);
  }

  /* ═══════════════════ FX · feedback that moves ═══════════════════
     One pool of sparks, one of confetti, four rings and a pool of falling
     note bars — all allocated once, the first time they are needed, and
     recycled for the life of the page. Nothing here is created per press.

     Sparks are additive in the dark theme and plain in the light one:
     additive light on a near-white floor is invisible. */
  const FX = (() => {
    const NS = 192, NC = 120, NR = 4, NF = 48;
    let sparks = null, conf = null, falls = null, rings = [], built = false;
    const S = { life:new Float32Array(NS), max:new Float32Array(NS),
                p:new Float32Array(NS * 3), v:new Float32Array(NS * 3), sz:new Float32Array(NS) };
    const Q = { life:new Float32Array(NC), max:new Float32Array(NC),
                p:new Float32Array(NC * 3), v:new Float32Array(NC * 3),
                r:new Float32Array(NC * 3), w:new Float32Array(NC * 3) };
    const F = { land:new Float64Array(NF), start:new Float64Array(NF), x:new Float32Array(NF),
                z:new Float32Array(NF), y:new Float32Array(NF), wd:new Float32Array(NF), on:new Uint8Array(NF) };
    let sNext = 0, qNext = 0, fNext = 0;
    /* made on first use: this module has to load even when Three.js did not */
    let m4, q4, e3, p3, s3, col;
    let mq = null;
    const reduced = () => {
      try { mq = mq || window.matchMedia('(prefers-reduced-motion: reduce)'); return mq.matches; }
      catch (e) { return false; }
    };
    function softDot() {
      const c = document.createElement('canvas'); c.width = c.height = 64;
      const x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.35, 'rgba(255,255,255,.7)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = g; x.fillRect(0, 0, 64, 64);
      return new THREE.CanvasTexture(c);
    }
    const hide = (mesh, i) => { m4.makeScale(0, 0, 0); mesh.setMatrixAt(i, m4); };
    function build() {
      if (built || !scene) return;
      built = true;
      m4 = new THREE.Matrix4(); q4 = new THREE.Quaternion(); e3 = new THREE.Euler();
      p3 = new THREE.Vector3(); s3 = new THREE.Vector3(); col = new THREE.Color();
      sparks = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1),
        new THREE.MeshBasicMaterial({ map:softDot(), transparent:true, depthWrite:false, fog:false }), NS);
      conf = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.16, 0.26),
        new THREE.MeshBasicMaterial({ side:THREE.DoubleSide, transparent:true, fog:false }), NC);
      falls = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshBasicMaterial({ transparent:true, opacity:0.9, fog:false }), NF);
      [sparks, conf, falls].forEach((m, k) => {
        m.frustumCulled = false;
        if (m.instanceMatrix.setUsage) m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        const n = k === 0 ? NS : k === 1 ? NC : NF;
        for (let i = 0; i < n; i++) { hide(m, i); m.setColorAt(i, col.setHex(0xFFFFFF)); }
        m.instanceMatrix.needsUpdate = true;
        if (m.instanceColor) m.instanceColor.needsUpdate = true;
        scene.add(m);
      });
      for (let i = 0; i < NR; i++) {
        const r = new THREE.Mesh(new THREE.RingGeometry(0.86, 1, 56),
          new THREE.MeshBasicMaterial({ transparent:true, opacity:0, depthWrite:false,
                                        side:THREE.DoubleSide, fog:false }));
        r.rotation.x = -Math.PI / 2; r.visible = false; r.userData = { t:0, max:0 };
        scene.add(r); rings.push(r);
      }
      restyle();
    }
    function restyle() {
      if (!sparks) return;
      sparks.material.blending = C.poolAdd ? THREE.AdditiveBlending : THREE.NormalBlending;
      sparks.material.needsUpdate = true;
    }
    const TONE = () => ({ good:C.accent, bad:C.amber,
                          none:C.poolAdd ? 0xDFFFEF : C.mint });

    /* a burst of sparks rising from a point */
    function burst(at, tone, n) {
      if (reduced() || !scene) return;
      build();
      const c = TONE()[tone || 'none'] || TONE().none;
      n = Math.min(24, n || 14);
      for (let k = 0; k < n; k++) {
        const i = sNext; sNext = (sNext + 1) % NS;
        const a = Math.random() * Math.PI * 2, sp = 0.6 + Math.random() * 1.6, up = 1.8 + Math.random() * 2.2;
        S.p[i * 3] = at.x; S.p[i * 3 + 1] = at.y; S.p[i * 3 + 2] = at.z;
        S.v[i * 3] = Math.cos(a) * sp; S.v[i * 3 + 1] = up; S.v[i * 3 + 2] = Math.sin(a) * sp;
        S.max[i] = 0.34 + Math.random() * 0.16; S.life[i] = S.max[i];
        S.sz[i] = 0.16 + Math.random() * 0.16;
        sparks.setColorAt(i, col.setHex(c));
      }
      if (sparks.instanceColor) sparks.instanceColor.needsUpdate = true;
    }
    /* confetti over the whole stage; `size` scales with the milestone */
    function confetti(size) {
      if (reduced() || !scene) return;
      build();
      const n = size === 'huge' ? 120 : size === 'large' ? 80 : 44;
      const pal = [C.accent, C.amber, C.sky, C.mint];
      const cx = orb.tgt.x, cy = orb.tgt.y, cz = orb.tgt.z;
      for (let k = 0; k < n; k++) {
        const i = qNext; qNext = (qNext + 1) % NC;
        const a = Math.random() * Math.PI * 2, sp = 1.5 + Math.random() * 3.2;
        Q.p[i * 3] = cx + (Math.random() - 0.5) * 2; Q.p[i * 3 + 1] = cy - 0.5; Q.p[i * 3 + 2] = cz + (Math.random() - 0.5) * 2;
        Q.v[i * 3] = Math.cos(a) * sp; Q.v[i * 3 + 1] = 5 + Math.random() * 4; Q.v[i * 3 + 2] = Math.sin(a) * sp;
        for (let j = 0; j < 3; j++) { Q.r[i * 3 + j] = Math.random() * 6.28; Q.w[i * 3 + j] = (Math.random() - 0.5) * 14; }
        Q.max[i] = 1.4 + Math.random() * 0.4; Q.life[i] = Q.max[i];
        conf.setColorAt(i, col.setHex(pal[k % pal.length]));
      }
      if (conf.instanceColor) conf.instanceColor.needsUpdate = true;
    }
    /* a flat ring that widens and fades — "that was right", drawn on the floor
       of the instrument rather than only in the text below it */
    function ring(at, tone) {
      if (!scene) return;
      build();
      const r = rings.find(x => !x.visible) || rings[0];
      r.position.set(at.x, at.y, at.z);
      r.material.color.setHex(TONE()[tone || 'good']);
      r.userData.t = 0; r.userData.max = reduced() ? 0.3 : 0.52;
      r.visible = true;
    }
    /* a bar that falls onto a key and lands exactly when the note sounds */
    const FALL_SPEED = 7, FALL_TOP = 7.5;
    function fall(x, y, z, wd, inMs, colour) {
      if (reduced() || !scene) return;
      build();
      const i = fNext; fNext = (fNext + 1) % NF;
      const now = performance.now();
      F.land[i] = now + inMs; F.start[i] = F.land[i] - (FALL_TOP / FALL_SPEED) * 1000;
      F.x[i] = x; F.y[i] = y; F.z[i] = z; F.wd[i] = wd; F.on[i] = 1;
      falls.setColorAt(i, col.setHex(colour || C.accent));
      if (falls.instanceColor) falls.instanceColor.needsUpdate = true;
    }

    function update(dt) {
      if (!built) return;
      let dirty = false;
      /* sparks: billboards, slight gravity, shrink as they fade */
      q4.copy(camera.quaternion);
      for (let i = 0; i < NS; i++) {
        if (S.life[i] <= 0) continue;
        S.life[i] -= dt; dirty = true;
        if (S.life[i] <= 0) { hide(sparks, i); continue; }
        S.v[i * 3 + 1] -= 6.5 * dt;
        S.p[i * 3] += S.v[i * 3] * dt; S.p[i * 3 + 1] += S.v[i * 3 + 1] * dt; S.p[i * 3 + 2] += S.v[i * 3 + 2] * dt;
        const k = S.life[i] / S.max[i], z = S.sz[i] * (0.4 + 0.6 * k);
        p3.set(S.p[i * 3], S.p[i * 3 + 1], S.p[i * 3 + 2]); s3.set(z, z, z);
        m4.compose(p3, q4, s3); sparks.setMatrixAt(i, m4);
      }
      if (dirty) sparks.instanceMatrix.needsUpdate = true;
      /* confetti: tumble, gravity, a little drag */
      dirty = false;
      for (let i = 0; i < NC; i++) {
        if (Q.life[i] <= 0) continue;
        Q.life[i] -= dt; dirty = true;
        if (Q.life[i] <= 0) { hide(conf, i); continue; }
        Q.v[i * 3 + 1] -= 9 * dt;
        for (let j = 0; j < 3; j++) { Q.v[i * 3 + j] *= (1 - 0.9 * dt); Q.p[i * 3 + j] += Q.v[i * 3 + j] * dt; Q.r[i * 3 + j] += Q.w[i * 3 + j] * dt; }
        const k = Math.min(1, Q.life[i] / 0.35);
        e3.set(Q.r[i * 3], Q.r[i * 3 + 1], Q.r[i * 3 + 2]); q4.setFromEuler(e3);
        p3.set(Q.p[i * 3], Q.p[i * 3 + 1], Q.p[i * 3 + 2]); s3.set(k, k, k);
        m4.compose(p3, q4, s3); conf.setMatrixAt(i, m4);
      }
      if (dirty) conf.instanceMatrix.needsUpdate = true;
      /* rings */
      rings.forEach(r => {
        if (!r.visible) return;
        const u = r.userData; u.t += dt;
        const k = Math.min(1, u.t / u.max), e = 1 - Math.pow(1 - k, 3);
        const rad = 0.2 + 2.2 * e;
        r.scale.set(rad, rad, rad);
        r.material.opacity = 0.75 * (1 - k);
        if (k >= 1) r.visible = false;
      });
      /* falling bars */
      dirty = false;
      const now = performance.now();
      for (let i = 0; i < NF; i++) {
        if (!F.on[i]) continue;
        dirty = true;
        if (now >= F.land[i]) { F.on[i] = 0; hide(falls, i); continue; }
        if (now < F.start[i]) { hide(falls, i); continue; }
        const h = 0.7, y = F.y[i] + h / 2 + FALL_SPEED * (F.land[i] - now) / 1000;
        q4.identity(); p3.set(F.x[i], y, F.z[i]); s3.set(F.wd[i], h, 0.9);
        m4.compose(p3, q4, s3); falls.setMatrixAt(i, m4);
      }
      if (dirty) falls.instanceMatrix.needsUpdate = true;
    }
    /* the rings belong to the scene, not a view, so clear any mid-flight
       effect when the instrument changes underneath it */
    function clear() {
      if (!built) return;
      S.life.fill(0); Q.life.fill(0); F.on.fill(0);
      for (let i = 0; i < NS; i++) hide(sparks, i);
      for (let i = 0; i < NC; i++) hide(conf, i);
      for (let i = 0; i < NF; i++) hide(falls, i);
      sparks.instanceMatrix.needsUpdate = conf.instanceMatrix.needsUpdate = falls.instanceMatrix.needsUpdate = true;
      rings.forEach(r => { r.visible = false; });
    }
    return { burst, confetti, ring, fall, update, clear, restyle, reduced };
  })();

  /* a spring that dips fast and settles without wobble: critically damped,
     stepped in small slices so a slow frame cannot make it overshoot */
  const SPRING_K = 420, SPRING_D = 2 * Math.sqrt(SPRING_K);
  function springStep(o, target, dt) {
    let t = dt;
    while (t > 0) {
      const h = Math.min(t, 1 / 240);
      o.vy += (SPRING_K * (target - o.off) - SPRING_D * o.vy) * h;
      o.off += o.vy * h;
      t -= h;
    }
  }
  const tmpV = () => new THREE.Vector3();

  /* ═══════════════════ VIEW 1 · KEYBOARD ═══════════════════ */
  function KeyView(cfg) {
    cfg = Object.assign({ lo:48, hi:72, labels:'names', flats:false }, cfg);
    const g = new THREE.Group(); root.add(g);
    const keys = new Map();      // midi -> {mesh, base, white, x, sprite}
    const marks = new Map();     // midi -> role
    const extras = new THREE.Group(); g.add(extras);
    let onKeyCb = null, labelMap = null, labelMode = cfg.labels;
    const taps = [];
    let spell = cfg.spell || null;          /* pc -> spelled name */
    /* a spelled name when the key supplies one, otherwise the accidental that
       key signature prefers — so a button and the readout never disagree */
    const nameOf = m => (spell && spell[T.pc(m)]) ||
      T.name(m, spell ? !!spell.flats : cfg.flats);

    let wi = 0; const whites = [];
    for (let m = cfg.lo; m <= cfg.hi; m++) if (!T.isBlack(m)) whites.push(m);
    const span = whites.length, x0 = -(span - 1) / 2;
    for (let m = cfg.lo; m <= cfg.hi; m++) {
      const black = T.isBlack(m);
      if (!black) {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.34, 4.2), mat(C.white, { roughness:0.6 }));
        mesh.position.set(x0 + wi, 0, 0);
        mesh.userData = { midi:m }; g.add(mesh);
        keys.set(m, { mesh, base:C.white, white:true, x:x0 + wi });
        wi++;
      } else {
        const x = x0 + wi - 0.5;
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.42, 2.7), mat(C.black, { roughness:0.42 }));
        mesh.position.set(x, 0.24, -0.72);
        mesh.userData = { midi:m }; g.add(mesh);
        keys.set(m, { mesh, base:C.black, white:false, x });
      }
    }
    // body shell
    const shell = new THREE.Mesh(new THREE.BoxGeometry(span + 0.5, 0.5, 5.2), mat(C.shell, { roughness:0.7 }));
    shell.position.set(0, -0.32, -0.3); g.add(shell);

    orb.tgt.set(0, 1.3, -0.2);
    orb.th = 0; orb.ph = cfg.ph || 0.84; orb.auto = 0;
    fit(span + 3.5, 10);

    const sprites = new THREE.Group(); g.add(sprites);
    function drawLabels() {
      disposeDeep(sprites);
      if (labelMode === 'none') return;
      keys.forEach((k, m) => {
        const role = marks.get(m);
        const keyCol = role ? (ROLE[role] || C.violet) : k.base;
        const ink = inkOn(keyCol);
        let txt = null, col = ink;
        if (labelMode === 'names') {
          if (k.white || role) txt = nameOf(m);
          if (T.pc(m) === 0) {
            txt = nameOf(m) + T.oct(m);
            col = ink === '#FFFFFF' ? '#FFE2A8' : '#8A5A10';
          }
        } else if (labelMode === 'map') {
          if (labelMap && labelMap[m] != null) { txt = String(labelMap[m]); col = ink; }
        }
        if (!txt) return;
        const sp = label(txt, { h:0.5, color:col, mono:labelMode === 'map', weight:600 });
        sp.position.set(k.x, k.white ? 0.34 : 0.56, k.white ? 2.35 : 0.75);
        sprites.add(sp);
      });
    }
    /* paint() decides what a key IS (its role, its resting place); update()
       layers what it is DOING on top (a press, a glow) without losing that */
    function paint() {
      keys.forEach((k, m) => {
        const role = marks.get(m);
        const col = role ? ROLE[role] || C.violet : k.base;
        k.mesh.material.color.setHex(col);
        k.baseEm = role && role !== 'ghost' ? col : 0x000000;
        const ei = role === 'root' ? 0.55 : (role === 'scale' || role === 'ghost') ? 0.14 : 0.35;
        k.baseEI = role ? ei * C.emiss : 0;
        k.baseY = (k.white ? 0 : 0.24) + (role ? -0.03 : 0);
        if (!active.has(m)) {
          k.mesh.material.emissive.setHex(k.baseEm);
          k.mesh.material.emissiveIntensity = k.baseEI;
          k.mesh.position.y = k.baseY;
        }
      });
      drawLabels();
    }
    const active = new Set();       /* keys mid-press or still glowing */
    let judgeFn = null;             /* practice rounds say which presses were wanted */
    const topOf = k => {
      const v = tmpV(); k.mesh.getWorldPosition(v);
      v.y += k.white ? 0.2 : 0.26; v.z += k.white ? 1.2 : 0.4;
      return v;
    };
    const api = {
      group:g,
      get pickables() { return Array.from(keys.values()).map(k => k.mesh); },
      onPick(hit) {
        const m = hit.object.userData.midi;
        if (m == null) return;
        api.tap(m);
      },
      /* the one place a key press happens, whether from the canvas or a button */
      tap(m, vel) {
        api.press(m, null, vel == null ? null : { vel });
        if (onKeyCb) onKeyCb(m); taps.forEach(f => f(m)); return api;
      },
      /* the keys this keyboard has, for anything playing it from outside —
         a MIDI keyboard or the computer's own letters */
      range() { return [cfg.lo, cfg.hi]; },
      /* an extra listener, for anything watching alongside the lesson's own */
      listen(cb) { taps.push(cb); return api; },
      unlisten(cb) { const i = taps.indexOf(cb); if (i >= 0) taps.splice(i, 1); return api; },
      a11y() {
        const items = [];
        keys.forEach((k, m) => {
          const role = marks.get(m);
          items.push({
            label:nameOf(m) + T.oct(m),
            aria:nameOf(m) + T.oct(m) + ', ' + (k.white ? 'white key' : 'black key') +
              (role ? ', highlighted as ' + role : ''),
            pressed:!!role,
            /* layout, for anyone drawing these as an instrument rather than a list */
            midi:m, white:k.white, role:role || null, name:nameOf(m), octave:T.oct(m),
            act:() => api.tap(m)
          });
        });
        return { title:'Piano keys', shape:'keys', labels:labelMode,
                 groups:[{ name:'Keys, low to high', items }] };
      },
      onKey(cb) { onKeyCb = cb; return api; },
      /* A press has weight: the key dips on a spring, glows and lets the glow
         go over ~350ms, and throws a few sparks. In a practice round's build
         step the sparks say whether that note was one of the wanted ones. */
      press(m, dur, opt) {
        const k = keys.get(m); if (!k) return;
        opt = opt || {};
        const vel = opt.vel == null ? 0.8 : Math.max(0, Math.min(1, opt.vel));
        const still = FX.reduced();
        if (k.off == null) { k.off = 0; k.vy = 0; }
        k.dip = still ? 0 : 0.06 + 0.06 * vel;
        k.hold = (dur || 220) / 1000;
        k.glow = 0.9;
        const tone = opt.tone || (judgeFn ? judgeFn(m) : null);
        k.glowCol = tone === 'good' ? C.accent : tone === 'bad' ? C.amber : 0xFFFFFF;
        active.add(m);
        if (!still && opt.sparks !== false) FX.burst(topOf(k), tone, 10 + Math.round(6 * vel));
      },
      update(dt) {
        active.forEach(m => {
          const k = keys.get(m);
          if (!k) { active.delete(m); return; }
          k.hold -= dt;
          springStep(k, k.hold > 0 ? -k.dip : 0, dt);
          k.glow *= Math.pow(0.001, dt / 0.35);
          k.mesh.position.y = k.baseY + k.off;
          if (k.glow > 0.03) {
            k.mesh.material.emissive.setHex(k.glowCol);
            k.mesh.material.emissiveIntensity = Math.max(k.baseEI, k.glow * (C.poolAdd ? 1 : 0.7));
          } else {
            k.mesh.material.emissive.setHex(k.baseEm);
            k.mesh.material.emissiveIntensity = k.baseEI;
          }
          if (k.hold <= 0 && Math.abs(k.off) < 0.0008 && Math.abs(k.vy) < 0.01 && k.glow <= 0.03) {
            k.off = 0; k.vy = 0; k.mesh.position.y = k.baseY;
            k.mesh.material.emissive.setHex(k.baseEm);
            k.mesh.material.emissiveIntensity = k.baseEI;
            active.delete(m);
          }
        });
      },
      /* fn(midi) -> 'good' | 'bad' | null, or null to stop judging */
      judge(fn) { judgeFn = typeof fn === 'function' ? fn : null; return api; },
      /* where on the instrument a set of notes sits — for the ring under a
         right answer. No notes: the middle of the keyboard. */
      spot(list) {
        const ks = (list || []).map(m => keys.get(m)).filter(Boolean);
        const v = tmpV();
        if (!ks.length) { v.set(0, 0.25, 0.2); g.localToWorld(v); return v; }
        ks.forEach(k => { const w = tmpV(); k.mesh.getWorldPosition(w); v.add(w); });
        v.multiplyScalar(1 / ks.length); v.y = 0.25;
        return v;
      },
      /* drop a bar onto a key so it lands exactly as the note plays */
      fall(m, inMs, role) {
        const k = keys.get(m); if (!k) return api;
        const w = tmpV(); k.mesh.getWorldPosition(w);
        FX.fall(w.x, w.y + (k.white ? 0.17 : 0.21), w.z + (k.white ? 0.6 : 0.2),
                k.white ? 0.62 : 0.44, Math.max(0, inMs || 0), ROLE[role || 'root'] || C.accent);
        return api;
      },
      clear() { marks.clear(); paint(); return api; },
      mark(m, role) { marks.set(m, role || 'chord'); return api; },
      marks(list, role) { (list || []).forEach(m => marks.set(m, role || 'chord')); return api; },
      apply() { paint(); return api; },
      labelMode(mode, map) { labelMode = mode; labelMap = map || null; drawLabels(); return api; },
      flats(v) { cfg.flats = v; drawLabels(); return api; },
      /* pass {pitchClass: 'E\u266D', …} so labels read the way the key is written */
      spelling(map) { spell = map || null; drawLabels(); return api; },
      nameOf,
      clearExtras() { disposeDeep(extras); return api; },
      /* an arc from key a to key b, with a dot per semitone stepped through */
      arc(a, b, text, opt) {
        opt = opt || {};
        const ka = keys.get(a), kb = keys.get(b); if (!ka || !kb) return api;
        const mid = new THREE.Vector3((ka.x + kb.x) / 2, 1.4 + Math.abs(b - a) * 0.12, 1.2);
        const curve = new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(ka.x, 0.3, 1.6), mid, new THREE.Vector3(kb.x, 0.3, 1.6));
        const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 40, 0.045, 8, false),
          new THREE.MeshBasicMaterial({ color:opt.color || C.amber }));
        extras.add(tube);
        const n = Math.abs(b - a);
        for (let i = 1; i < n; i++) {
          const p = curve.getPoint(i / n);
          const d = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 10),
            new THREE.MeshBasicMaterial({ color:C.dot }));
          d.position.copy(p); extras.add(d);
        }
        if (text) {
          const sp = label(text, { h:0.62, bg:C.labBg, border:C.labAcc, color:C.labAcc });
          sp.position.copy(curve.getPoint(0.5)).add(new THREE.Vector3(0, 0.55, 0));
          extras.add(sp);
        }
        return api;
      },
      /* floating tiles above the keys: the chord, stacked, with the gaps named */
      stack(midis, opt) {
        opt = opt || {};
        const cols = [C.accent, C.amber, C.sky, C.violet, C.mint, C.flag];
        midis.forEach((m, i) => {
          const k = keys.get(m) || keys.get(m - 12) || keys.get(m + 12);
          const x = k ? k.x : 0;
          const y = 1.5 + i * 1.05, col = cols[i % cols.length];
          const tile = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.5, 0.5),
            mat(col, { emissive:col, emissiveIntensity:0.34, roughness:0.35 }));
          tile.position.set(x, y, 1.9); extras.add(tile);
          const gap = i > 0 ? midis[i] - midis[i - 1] : 0;
          const nm = label(nameOf(m) +
            (opt.degrees && opt.degrees[i] ? ' ' + opt.degrees[i] : '') +
            (gap ? '  +' + gap : ''), { h:0.46, color:C.labOn, weight:700 });
          nm.position.set(x, y + 0.02, 2.3); extras.add(nm);
          const post = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, y - 0.3, 6),
            new THREE.MeshBasicMaterial({ color:C.post }));
          post.position.set(x, (y - 0.3) / 2 + 0.3, 1.9); extras.add(post);
        });
        return api;
      },
      tag(text, x, y, col) {
        const sp = label(text, { h:0.6, bg:C.labBg, border:col || C.labGreen,
          color:col || C.labGreen });
        sp.position.set(x || 0, y || 3.4, 1.4); extras.add(sp); return api;
      },
      onResize() { fit(span + 3.5, 10); },
      dispose() { disposeDeep(g); root.remove(g); }
    };
    paint();
    return api;
  }

  /* ═══════════════════ VIEW 2 · STEP GRID ═══════════════════ */
  function GridView(cfg) {
    const lit = new Set();
    let judgeCell = null;
    cfg = Object.assign({ steps:16, lanes:[{ name:'Kick', kind:'kick' }], group:4 }, cfg);
    const g = new THREE.Group(); root.add(g);
    const cells = [];            // [lane][step] = mesh
    const state = [];            // [lane][step] = 0|1|2(accent)
    let onCellCb = null, head = -1, heights = null;
    const taps = [];
    const S = cfg.steps, L = cfg.lanes.length;
    const sx = 1.02, sz = 1.25, x0 = -(S - 1) * sx / 2, z0 = -(L - 1) * sz / 2;
    const laneCol = [C.accent, C.sky, C.amber, C.mint, C.violet];

    for (let l = 0; l < L; l++) {
      cells.push([]); state.push([]);
      for (let s = 0; s < S; s++) {
        const m = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.18, 0.92),
          mat(C.slate, { roughness:0.62 }));
        m.position.set(x0 + s * sx, 0, z0 + l * sz);
        m.userData = { lane:l, step:s }; g.add(m); cells[l].push(m); state[l].push(0);
      }
      const nm = label(cfg.lanes[l].name, { h:0.5, color:C.lab2, weight:600 });
      nm.position.set(x0 - 1.6, 0.2, z0 + l * sz); g.add(nm);
    }
    // beat numbers + bar ticks
    const nums = new THREE.Group(); g.add(nums);
    function drawNums() {
      disposeDeep(nums);
      for (let s = 0; s < S; s++) {
        const beat = Math.floor(s / cfg.group) + 1, sub = s % cfg.group;
        const txt = sub === 0 ? String(beat) : (cfg.group === 4 ? ['','e','&','a'][sub] : ['','·','·','·','·','·'][sub] || '·');
        if (!txt) continue;
        const sp = label(txt, { h: sub === 0 ? 0.55 : 0.36, mono:true,
          color: sub === 0 ? C.labAcc : C.lab3, weight:600 });
        sp.position.set(x0 + s * sx, 0.1, z0 + L * sz - 0.35); nums.add(sp);
      }
      for (let s = 0; s <= S; s += cfg.group) {
        const bar = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.03, L * sz + 0.9),
          new THREE.MeshBasicMaterial({ color:C.post }));
        bar.position.set(x0 + s * sx - sx / 2, -0.1, z0 + (L - 1) * sz / 2); nums.add(bar);
      }
    }
    drawNums();
    const playhead = new THREE.Mesh(new THREE.BoxGeometry(0.98, 1.7, L * sz + 1.1),
      new THREE.MeshBasicMaterial({ color:C.amber, transparent:true, opacity:0.22 }));
    playhead.position.set(0, 0.7, z0 + (L - 1) * sz / 2); playhead.visible = false; g.add(playhead);

    orb.tgt.set(0, 0.4, z0 + (L - 1) * sz / 2);
    orb.th = 0; orb.ph = cfg.ph || 0.72; orb.auto = 0;
    const bounds = () => fit(S * sx + 5, L * sz + 5.5);
    bounds();

    function paint() {
      for (let l = 0; l < L; l++) for (let s = 0; s < S; s++) {
        const v = state[l][s], m = cells[l][s];
        const strong = heights ? heights[s] : (s % cfg.group === 0 ? 1 : 0);
        const base = strong === 1 ? C.slateHi : C.slate;
        const col = v ? laneCol[l % laneCol.length] : base;
        m.material.color.setHex(col);
        m.userData.baseEm = v ? col : 0x000000;
        m.userData.baseEI = v === 2 ? 0.6 : v ? 0.3 : 0;
        if (!(m.userData.glow > 0.03)) {
          m.material.emissive.setHex(m.userData.baseEm);
          m.material.emissiveIntensity = m.userData.baseEI;
        }
        const hy = heights ? 0.18 + heights[s] * 0.5 : (v === 2 ? 0.7 : v ? 0.42 : 0.18);
        m.scale.y = hy / 0.18;
        m.position.y = hy / 2 - 0.09;
      }
    }
    const api = {
      group:g, state,
      get pickables() { return [].concat.apply([], cells); },
      onPick(hit) {
        const { lane, step } = hit.object.userData;
        api.tapCell(lane, step);
      },
      tapCell(l, s) {
        api.toggle(l, s);
        const m = cells[l] && cells[l][s];
        if (m && state[l][s]) {
          const v = tmpV(); m.getWorldPosition(v); v.y += 0.4;
          FX.burst(v, judgeCell ? judgeCell(l, s) : null, 10);
        }
        if (onCellCb) onCellCb(l, s, state[l][s]);
        taps.forEach(f => f(l, s, state[l][s]));
        return api;
      },
      listen(cb) { taps.push(cb); return api; },
      unlisten(cb) { const i = taps.indexOf(cb); if (i >= 0) taps.splice(i, 1); return api; },
      a11y() {
        return { title:'Step grid', shape:'grid', group:cfg.group, steps:S,
          groups:cfg.lanes.map((ln, l) => ({
            name:ln.name + ' \u00B7 ' + S + ' steps',
            lane:l, laneName:ln.name,
            items:state[l].map((v, st) => ({
              label:String(st + 1),
              aria:ln.name + ', step ' + (st + 1) + ' of ' + S +
                ', beat ' + (Math.floor(st / cfg.group) + 1) + (v ? ', on' : ', off'),
              pressed:!!v,
              step:st, beat:Math.floor(st / cfg.group) + 1, accent:v === 2,
              downbeat:st % cfg.group === 0,
              act:() => api.tapCell(l, st)
            }))
          })) };
      },
      onCell(cb) { onCellCb = cb; return api; },
      toggle(l, s) { state[l][s] = state[l][s] ? 0 : 1; paint(); return api; },
      set(l, s, v) { state[l][s] = v; paint(); return api; },
      pattern(l, arr) { arr.forEach((v, s) => { if (s < S) state[l][s] = v; }); paint(); return api; },
      clearAll() { state.forEach(r => r.fill(0)); paint(); return api; },
      grouping(n) { cfg.group = n; drawNums(); paint(); return api; },
      /* per-step emphasis 0..1, drawn as cell height — the metric accent map */
      accents(arr) { heights = arr; paint(); return api; },
      /* playback: a flash that lets go, rather than one that switches off */
      hit(l, s) {
        const m = cells[l] && cells[l][s]; if (!m) return api;
        m.userData.glow = 0.9; lit.add(m);
        return api;
      },
      update(dt) {
        lit.forEach(m => {
          m.userData.glow *= Math.pow(0.001, dt / 0.3);
          if (m.userData.glow > 0.03) {
            m.material.emissive.setHex(0xFFFFFF);
            m.material.emissiveIntensity = Math.max(m.userData.baseEI || 0, m.userData.glow);
          } else {
            m.userData.glow = 0;
            m.material.emissive.setHex(m.userData.baseEm || 0);
            m.material.emissiveIntensity = m.userData.baseEI || 0;
            lit.delete(m);
          }
        });
      },
      judge(fn) { judgeCell = typeof fn === 'function' ? fn : null; return api; },
      playhead(s) {
        head = s;
        playhead.visible = s >= 0;
        if (s >= 0) playhead.position.x = x0 + s * sx;
        return api;
      },
      onResize() { bounds(); },
      dispose() { disposeDeep(g); root.remove(g); }
    };
    paint();
    return api;
  }

  /* ═══════════════ VIEW 3 · CIRCLE OF FIFTHS ═══════════════ */
  function WheelView(cfg) {
    cfg = Object.assign({ sel:0 }, cfg);
    const g = new THREE.Group(); root.add(g);
    const outer = [], inner = [];
    const R1 = 6.2, R2 = 4.2;
    let onTileCb = null, sel = cfg.sel, roles = {};

    const disc = new THREE.Mesh(new THREE.CylinderGeometry(R1 + 1.2, R1 + 1.2, 0.3, 64),
      mat(C.disc, { roughness:0.8 }));
    disc.position.y = -0.2; g.add(disc);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(R1 + 1.15, 0.07, 8, 80),
      new THREE.MeshBasicMaterial({ color:C.post }));
    rim.rotation.x = Math.PI / 2; g.add(rim);

    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const mk = (r, w, h, col, arr, txt, tcol) => {
        const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.34, h), mat(col, { roughness:0.5 }));
        m.position.set(Math.sin(a) * r, 0.1, Math.cos(a) * r);
        m.rotation.y = a; m.userData = { idx:i, ring:arr === outer ? 'maj' : 'min' };
        g.add(m); arr.push(m);
        const sp = label(txt, { h:arr === outer ? 0.85 : 0.66, color:tcol, weight:700 });
        sp.position.set(Math.sin(a) * r, 0.62, Math.cos(a) * r); g.add(sp);
        return m;
      };
      mk(R1, 1.9, 1.4, C.tile1, outer, T.KEY_LABEL[i], C.lab1);
      mk(R2, 1.5, 1.1, C.tile2, inner, T.MINOR_LABEL[i], C.lab2);
    }
    const spokes = new THREE.Group(); g.add(spokes);

    orb.tgt.set(0, 0, 0); orb.ph = cfg.ph || 0.66; orb.th = 0; orb.auto = cfg.spin || 0;
    fit((R1 + 1.6) * 2, (R1 + 1.6) * 2 * 0.95);

    function paint() {
      outer.forEach((m, i) => {
        const role = roles['M' + i];
        const col = i === sel ? C.accent : role ? ROLE[role] : C.tile1;
        m.material.color.setHex(col);
        m.material.emissive.setHex(i === sel || role ? col : 0x000000);
        m.material.emissiveIntensity = i === sel ? 0.5 : role ? 0.3 : 0;
        m.position.y = i === sel ? 0.28 : 0.1;
      });
      inner.forEach((m, i) => {
        const role = roles['m' + i];
        const col = role ? ROLE[role] : C.tile2;
        m.material.color.setHex(col);
        m.material.emissive.setHex(role ? col : 0x000000);
        m.material.emissiveIntensity = role ? 0.3 : 0;
        m.position.y = role ? 0.22 : 0.1;
      });
    }
    const taps = [];
    const api = {
      group:g,
      get pickables() { return outer.concat(inner); },
      onPick(hit) {
        const { idx, ring } = hit.object.userData;
        api.tapTile(idx, ring);
      },
      tapTile(idx, ring) {
        if (ring === 'maj') sel = idx;
        paint();
        const m = (ring === 'maj' ? outer : inner)[idx];
        if (m) { const v = tmpV(); m.getWorldPosition(v); v.y += 0.4; FX.burst(v, null, 12); }
        if (onTileCb) onTileCb(idx, ring);
        taps.forEach(f => f(idx, ring));
        return api;
      },
      listen(cb) { taps.push(cb); return api; },
      unlisten(cb) { const i = taps.indexOf(cb); if (i >= 0) taps.splice(i, 1); return api; },
      a11y() {
        const mk = (ring, labels) => labels.map((lab, i) => ({
          label:lab,
          aria:lab + (ring === 'maj' ? ' major' : ' minor') + ', position ' + (i + 1) +
            ' on the circle' + (ring === 'maj' && i === sel ? ', selected' : ''),
          pressed:ring === 'maj' && i === sel,
          act:() => api.tapTile(i, ring)
        }));
        return { title:'Circle of fifths',
          groups:[{ name:'Major keys, clockwise from C', items:mk('maj', T.KEY_LABEL) },
                  { name:'Relative minors', items:mk('min', T.MINOR_LABEL) }] };
      },
      onTile(cb) { onTileCb = cb; return api; },
      select(i) { sel = i; paint(); return api; },
      get sel() { return sel; },
      roles(r) { roles = r || {}; paint(); return api; },
      spin(v) { orb.auto = v; return api; },
      /* lines from the selected key out to its neighbours */
      links(list) {
        disposeDeep(spokes);
        (list || []).forEach(i => {
          const a1 = (sel / 12) * Math.PI * 2, a2 = (i / 12) * Math.PI * 2;
          const p1 = new THREE.Vector3(Math.sin(a1) * R1, 0.1, Math.cos(a1) * R1);
          const p2 = new THREE.Vector3(Math.sin(a2) * R1, 0.1, Math.cos(a2) * R1);
          const cur = new THREE.QuadraticBezierCurve3(p1,
            p1.clone().add(p2).multiplyScalar(0.5).setY(1.7), p2);
          const t = new THREE.Mesh(new THREE.TubeGeometry(cur, 24, 0.05, 6, false),
            new THREE.MeshBasicMaterial({ color:C.amber, transparent:true, opacity:0.75 }));
          spokes.add(t);
        });
        return api;
      },
      onResize() { fit((R1 + 1.6) * 2, (R1 + 1.6) * 2 * 0.95); },
      dispose() { disposeDeep(g); root.remove(g); }
    };
    paint();
    return api;
  }

  /* ═══════════════════ VIEW 4 · PIANO ROLL ═══════════════════ */
  function RollView(cfg) {
    cfg = Object.assign({ steps:16, root:60, scale:'minor', octaves:2, group:4 }, cfg);
    const g = new THREE.Group(); root.add(g);
    const notes = new THREE.Group(); g.add(notes);
    const beds = new THREE.Group(); g.add(beds);
    const ribbon = new THREE.Group(); g.add(ribbon);
    const S = cfg.steps, sx = 0.95, sz = 0.78;
    let rows = [], noteList = [], onCellCb = null, chords = [], judgeCell = null;
    const taps = [];

    function buildRows() {
      rows = [];
      const st = T.SCALES[cfg.scale].steps;
      for (let o = 0; o < cfg.octaves; o++) for (let i = 0; i < st.length; i++)
        rows.push(cfg.root + st[i] + 12 * o);
      rows.push(cfg.root + 12 * cfg.octaves);
    }
    buildRows();
    const x0 = () => -(S - 1) * sx / 2;
    const z0 = () => (rows.length - 1) * sz / 2;
    const rowZ = r => z0() - r * sz;

    const pad = new THREE.Mesh(new THREE.PlaneGeometry(S * sx, rows.length * sz),
      new THREE.MeshBasicMaterial({ color:C.pad }));
    pad.rotation.x = -Math.PI / 2; pad.position.y = -0.05; g.add(pad);

    const lines = new THREE.Group(); g.add(lines);
    const names = new THREE.Group(); g.add(names);
    function drawFrame() {
      disposeDeep(lines); disposeDeep(names);
      const pts = [];
      for (let r = 0; r <= rows.length; r++) {
        const z = z0() - r * sz + sz / 2;
        pts.push(new THREE.Vector3(x0() - sx / 2, 0, z), new THREE.Vector3(x0() + S * sx - sx / 2, 0, z));
      }
      for (let s = 0; s <= S; s++) {
        const x = x0() + s * sx - sx / 2;
        pts.push(new THREE.Vector3(x, 0, z0() + sz / 2), new THREE.Vector3(x, 0, z0() - rows.length * sz + sz / 2));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      lines.add(new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color:C.grid })));
      rows.forEach((m, r) => {
        const tonic = T.pc(m) === T.pc(cfg.root);
        const sp = label(T.name(m) + (tonic ? T.oct(m) : ''), { h:0.52, mono:true,
          color: tonic ? C.labAcc : C.lab3, weight:600 });
        sp.position.set(x0() - 1.5, 0.12, rowZ(r)); names.add(sp);
        if (tonic) {
          const strip = new THREE.Mesh(new THREE.BoxGeometry(S * sx, 0.02, sz * 0.94),
            new THREE.MeshBasicMaterial({ color:C.strip }));
          strip.position.set(x0() + (S - 1) * sx / 2, -0.03, rowZ(r)); names.add(strip);
        }
      });
      for (let s = 0; s < S; s += cfg.group) {
        const sp = label(String(Math.floor(s / cfg.group) + 1), { h:0.5, mono:true, color:C.labAcc });
        sp.position.set(x0() + s * sx, 0.1, z0() + 0.95); names.add(sp);
      }
    }
    drawFrame();

    const playhead = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.4, rows.length * sz + 0.6),
      new THREE.MeshBasicMaterial({ color:C.amber, transparent:true, opacity:0.22 }));
    playhead.position.set(0, 0.6, z0() - (rows.length - 1) * sz / 2);
    playhead.visible = false; g.add(playhead);

    orb.tgt.set(0, 0, 0); orb.ph = cfg.ph || 0.66; orb.th = 0; orb.auto = 0;
    const bounds = () => fit(S * sx + 4.5, rows.length * sz + 2.8);
    bounds();

    function drawNotes() {
      disposeDeep(notes); disposeDeep(ribbon);
      noteList.forEach(n => {
        const r = rows.indexOf(n.midi); if (r < 0) return;
        const len = n.len || 1;
        const col = n.role === 'tension' ? C.flag : n.role === 'chord' ? C.accent : C.violet;
        const m = new THREE.Mesh(new THREE.BoxGeometry(len * sx - 0.12, 0.34, sz * 0.78),
          mat(col, { emissive:col, emissiveIntensity:0.38, roughness:0.4 }));
        m.position.set(x0() + n.step * sx + (len - 1) * sx / 2, 0.18, rowZ(r));
        notes.add(m);
      });
      if (cfg.contour && noteList.length > 1) {
        const pts = noteList.slice().sort((a, b) => a.step - b.step).map(n => {
          const r = rows.indexOf(n.midi);
          return new THREE.Vector3(x0() + n.step * sx, 0.95, rowZ(r < 0 ? 0 : r));
        });
        const cur = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.4);
        ribbon.add(new THREE.Mesh(new THREE.TubeGeometry(cur, 90, 0.07, 8, false),
          new THREE.MeshBasicMaterial({ color:C.amber, transparent:true, opacity:0.85 })));
      }
    }
    const api = {
      group:g,
      get pickables() { return [pad]; },
      onPick(hit) {
        const p = hit.point.clone(); g.worldToLocal(p);
        const s = Math.round((p.x - x0()) / sx), r = Math.round((z0() - p.z) / sz);
        if (s < 0 || s >= S || r < 0 || r >= rows.length) return;
        api.tapCell(s, rows[r]);
      },
      onCell(cb) { onCellCb = cb; return api; },
      listen(cb) { taps.push(cb); return api; },
      unlisten(cb) { const i = taps.indexOf(cb); if (i >= 0) taps.splice(i, 1); return api; },
      tapCell(step, midi) {
        const i = noteList.findIndex(n => n.step === step && n.midi === midi);
        if (i >= 0) noteList.splice(i, 1); else noteList.push({ step, midi, len:1 });
        drawNotes();
        const r = rows.indexOf(midi);
        if (i < 0 && r >= 0) {
          const v = tmpV(); v.set(x0() + step * sx, 0.35, rowZ(r)); g.localToWorld(v);
          FX.burst(v, judgeCell ? judgeCell(step, midi) : null, 10);
        }
        if (onCellCb) onCellCb(step, midi, i < 0);
        taps.forEach(f => f(step, midi, i < 0));
        return api;
      },
      a11y() {
        const has = (step, midi) => noteList.some(n => n.step === step && n.midi === midi);
        return { title:'Piano roll', shape:'roll',
          /* the button panel gets a short add/remove form rather than a few
             hundred buttons; a face-on view gets the whole matrix */
          matrix:{ steps:S, group:cfg.group,
            rows:rows.slice().reverse().map(m => ({
              midi:m, label:T.name(m) + T.oct(m), black:T.isBlack(m),
              cells:Array.from({ length:S }, (_, s) => has(s, m))
            })),
            toggle:(step, midi) => api.tapCell(step, midi) },
          form:{
            steps:S, rows:rows.slice(),
            rowLabel:m => T.name(m) + T.oct(m),
            has,
            toggle:(step, midi) => api.tapCell(step, midi),
            list:() => noteList.slice().sort((a, b) => a.step - b.step || a.midi - b.midi)
          } };
      },
      get notes() { return noteList; },
      get rows() { return rows.slice(); },
      /* fn(step, midi) -> 'good' | 'bad' | null — a practice round's live verdict */
      judge(fn) { judgeCell = typeof fn === 'function' ? fn : null; return api; },
      setNotes(list) { noteList = (list || []).slice(); drawNotes(); return api; },
      clearNotes() { noteList = []; drawNotes(); return api; },
      setScale(rootMidi, scale, octaves) {
        cfg.root = rootMidi; cfg.scale = scale; if (octaves) cfg.octaves = octaves;
        buildRows(); drawFrame(); drawNotes(); bounds(); return api;
      },
      contour(v) { cfg.contour = v; drawNotes(); return api; },
      /* translucent slabs under the roll showing which chord is playing when */
      setChords(list) {
        disposeDeep(beds); chords = list || [];
        chords.forEach((c, i) => {
          const col = [C.accent, C.sky, C.violet, C.amber][i % 4];
          const slab = new THREE.Mesh(new THREE.BoxGeometry(c.len * sx - 0.1, 0.08, rows.length * sz),
            new THREE.MeshBasicMaterial({ color:col, transparent:true, opacity:0.2 }));
          slab.position.set(x0() + c.step * sx + (c.len - 1) * sx / 2, -0.12,
            z0() - (rows.length - 1) * sz / 2);
          beds.add(slab);
          /* chord names ride along the far edge, clear of the beat numbers */
          const sp = label(c.label, { h:0.6, color:C.lab1, bg:C.labBg, border:C.labBorder });
          sp.position.set(x0() + c.step * sx + (c.len - 1) * sx / 2, 0.35,
            z0() - rows.length * sz - 0.15);
          beds.add(sp);
        });
        return api;
      },
      playhead(s) {
        playhead.visible = s >= 0;
        if (s >= 0) playhead.position.x = x0() + s * sx;
        return api;
      },
      onResize() { bounds(); },
      dispose() { disposeDeep(g); root.remove(g); }
    };
    drawNotes();
    return api;
  }

  /* ═══════════════ VIEW 5 · THE PATH (Today) ═══════════════
     Every lesson as a node on a rising spiral, grouped by stage. Progress
     as a shape you can read from across the room: dim and small for not
     started, lit for done, bigger and brighter with mastery, an amber ring
     when something is due, and a gentle pulse on the next one. Tap a node
     to open that lesson. Everything is read from progress the app already
     keeps; nothing new is recorded. */
  function PathView(cfg) {
    const g = new THREE.Group(); root.add(g);
    let data = [], onNodeCb = null, stageNames = [];
    const N = Math.max(1, cfg.count || 26);
    const R = 5.2, TURNS = 1.15, RISE = 3.4;
    const at = i => {
      const t = N > 1 ? i / (N - 1) : 0, a = -Math.PI * 0.55 + t * Math.PI * 2 * TURNS;
      return new THREE.Vector3(Math.cos(a) * R, -0.9 + t * RISE, Math.sin(a) * R * 0.78);
    };
    const pts = []; for (let i = 0; i < N; i++) pts.push(at(i));
    const curve = new THREE.CatmullRomCurve3(pts);
    const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 200, 0.045, 6, false),
      new THREE.MeshBasicMaterial({ color:C.post, transparent:true, opacity:0.75 }));
    g.add(tube);

    const nodes = new THREE.InstancedMesh(new THREE.SphereGeometry(0.3, 18, 14),
      mat(0xFFFFFF, { roughness:0.35, metalness:0.05 }), N);
    nodes.frustumCulled = false;
    const halo = new THREE.InstancedMesh(new THREE.TorusGeometry(0.52, 0.045, 8, 36),
      new THREE.MeshBasicMaterial({ color:C.amber }), N);
    halo.frustumCulled = false;
    g.add(nodes); g.add(halo);
    const glow = new THREE.PointLight(C.accent, 0, 6); g.add(glow);
    const labels = new THREE.Group(); g.add(labels);

    const m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion(), s3 = new THREE.Vector3(),
          e3 = new THREE.Euler(Math.PI / 2, 0, 0), col = new THREE.Color();
    let pulseI = -1, t = 0;
    const sizeOf = d => !d ? 0.7 : d.done ? 0.95 + 0.3 * (d.mastery || 0) :
      d.mastery != null ? 0.8 + 0.25 * d.mastery : 0.7;
    function place() {
      for (let i = 0; i < N; i++) {
        const d = data[i], z = sizeOf(d) * (i === pulseI ? 1 + 0.07 * Math.sin(t * Math.PI * 2 / 1.8) : 1);
        s3.set(z, z, z); q4.identity(); m4.compose(pts[i], q4, s3); nodes.setMatrixAt(i, m4);
        const h = d && d.due ? z : 0;
        q4.setFromEuler(e3); s3.set(h, h, h); m4.compose(pts[i], q4, s3); halo.setMatrixAt(i, m4);
      }
      nodes.instanceMatrix.needsUpdate = true; halo.instanceMatrix.needsUpdate = true;
    }
    function paint() {
      for (let i = 0; i < N; i++) {
        const d = data[i] || {};
        let c;
        if (d.done) c = col.setHex(C.accent).lerp(new THREE.Color(C.mint), 1 - (d.mastery || 0) * 0.6);
        else if (i === pulseI) c = col.setHex(C.sky);
        else if (d.mastery != null) c = col.setHex(C.post).lerp(new THREE.Color(C.accent), d.mastery * 0.6);
        else c = col.setHex(C.poolAdd ? C.post : C.grid);
        nodes.setColorAt(i, c);
      }
      if (nodes.instanceColor) nodes.instanceColor.needsUpdate = true;
      if (pulseI >= 0) { glow.position.copy(pts[pulseI]); glow.position.y += 0.6; glow.intensity = C.poolAdd ? 1.6 : 0.8; }
      else glow.intensity = 0;
      place();
    }
    function drawLabels() {
      disposeDeep(labels);
      stageNames.forEach(sn => {
        if (sn.first < 0 || sn.first >= N) return;
        const sp = label(sn.name, { h:0.38, color:C.lab2, weight:600 });
        const p = pts[sn.first].clone(); p.y += 0.7;
        sp.position.copy(p); labels.add(sp);
      });
    }

    orb.tgt.set(0, 0.8, 0);
    orb.th = 0.35; orb.ph = 1.02;
    /* a slow drift, one turn in about ninety seconds — unless the learner
       has asked for less motion */
    orb.auto = FX.reduced() ? 0 : (Math.PI * 2) / 90;
    fit(2 * R + 3, 2 * R * 0.78 + RISE + 1.2);

    const api = {
      group:g,
      get pickables() { return [nodes]; },
      onPick(hit) {
        const i = hit && hit.instanceId;
        if (i != null && onNodeCb) onNodeCb(i);
      },
      onHover(hit) { if (cvs) cvs.style.cursor = hit && hit.instanceId != null ? 'pointer' : ''; },
      /* list: [{ title, part, done, mastery (0..1 or null), due, next }] */
      nodes(list, stages) {
        data = list || [];
        pulseI = data.findIndex(d => d && d.next);
        stageNames = stages || [];
        paint(); drawLabels();
        return api;
      },
      onNode(cb) { onNodeCb = cb; return api; },
      update(dt) {
        t += dt;
        if (pulseI >= 0 && !FX.reduced()) place();
      },
      a11y() {
        const groups = [];
        stageNames.forEach((sn, k) => {
          const end = k + 1 < stageNames.length ? stageNames[k + 1].first : N;
          const items = [];
          for (let i = sn.first; i < end; i++) {
            const d = data[i] || {};
            const state = d.done ? 'done' : d.next ? 'next up' : 'not started';
            items.push({ label:String(i + 1),
              aria:'Lesson ' + (i + 1) + ', ' + (d.title || '') + ', ' + state + (d.due ? ', due for review' : ''),
              pressed:!!d.done, act:() => { if (onNodeCb) onNodeCb(i); } });
          }
          if (items.length) groups.push({ name:sn.name, items });
        });
        return { title:'Your path', shape:'path', groups };
      },
      dispose() {
        orb.auto = 0;
        if (cvs) cvs.style.cursor = '';
        disposeDeep(g); root.remove(g);
      }
    };
    return api;
  }

  /* ── switcher ────────────────────────────────────────────── */
  const KINDS = { keys:KeyView, grid:GridView, wheel:WheelView, roll:RollView, path:PathView };
  /* if WebGL or the library is unavailable, hand back something harmless
     so the written lessons and their audio still work */
  const STUB = typeof Proxy === 'function' ? new Proxy({}, { get(t, k) {
    if (k === 'pickables' || k === 'notes') return [];
    if (k === 'state') return [[], [], []];
    if (k === 'sel') return 0;
    return () => STUB;
  } }) : {};
  /* Anything that can change an instrument announces it once per tick, so the
     accessible button panel can follow the instrument instead of being told
     about each change by hand at every call site. */
  let watchers = [], pinged = false, notifying = false;
  function ping() {
    if (pinged || notifying || !watchers.length) return;
    pinged = true;
    /* a timer, not an animation frame: a background tab stops painting, but the
       buttons a screen reader is walking still have to describe the truth */
    setTimeout(() => {
      pinged = false; notifying = true;
      try { watchers.forEach(f => { try { f(); } catch (e) {} }); }
      finally { notifying = false; }
    }, 0);
  }
  /* wrap a view so its own chaining still works, but every call pings */
  /* called every frame or purely visual: pinging on these would resync the
     accessible panel sixty times a second for nothing */
  const SILENT = { update:1, fall:1, spot:1, judge:1, glowCell:1, range:1 };
  function watch(api) {
    if (typeof Proxy !== 'function') return api;
    const p = new Proxy(api, { get(t, k) {
      const v = t[k];
      if (typeof v !== 'function') return v;
      if (SILENT[k]) return v.bind(t);
      return function () {
        const r = v.apply(t, arguments);
        ping();
        return r === t ? p : r;
      };
    } });
    return p;
  }
  function set(kind, cfg) {
    if (!scene) return STUB;
    if (current && current.dispose) current.dispose();
    FX.clear();
    current = watch(KINDS[kind](cfg || {}));
    return current;
  }
  /* Repaint the world. Views are rebuilt by the caller afterwards. */
  function setTheme(t) {
    theme = (t === 'dark') ? 'dark' : 'light';
    C = PAL[theme]; ROLE = roles();
    if (!renderer) return;
    renderer.setClearColor(C.clear, 1);
    if (scene && scene.fog) scene.fog.color.setHex(C.fog);
    if (floorMat) {
      if (floorMat.map) floorMat.map.dispose();
      floorMat.map = gridTexture(); floorMat.opacity = C.floorO; floorMat.needsUpdate = true;
    }
    if (poolMat) {
      if (poolMat.map) poolMat.map.dispose();
      poolMat.map = poolTexture(); poolMat.opacity = C.poolO;
      poolMat.blending = C.poolAdd ? THREE.AdditiveBlending : THREE.NormalBlending;
      poolMat.needsUpdate = true;
    }
    if (lightAmb) { lightAmb.color.setHex(C.ambC); lightAmb.intensity = C.ambI; }
    if (lightKey) { lightKey.color.setHex(C.keyC); lightKey.intensity = C.keyI; }
    if (lightFill) { lightFill.color.setHex(C.fillC); lightFill.intensity = C.fillI; }
    if (lightRim) { lightRim.color.setHex(C.accent); lightRim.intensity = C.rimI; }
    FX.restyle();
  }
  const a11y = () => (current && current.a11y) ? current.a11y() : null;
  /* several things follow the instrument: the accessible panel, and whatever
     is offering to save or undo what is on it */
  const onPaint = cb => { watchers.push(cb); };
  const clearPaint = () => { watchers = []; };
  /* effects the page can ask for directly: a ring under a right answer,
     confetti for a milestone */
  const fx = {
    ring(list, tone) { if (!renderer || !current) return;
      const at = current.spot ? current.spot(list) : new THREE.Vector3(orb.tgt.x, 0.2, orb.tgt.z);
      FX.ring(at, tone); },
    confetti(size) { if (renderer && !paused) FX.confetti(size); },
    get reduced() { return FX.reduced(); }
  };
  /* A note from outside the canvas — a MIDI keyboard, or the computer's
     letters. On a keyboard it is exactly a tap (sound, glow, the lesson's own
     response, a practice round's listener), folded into the keys the stage
     has. Anywhere else it is simply heard. Returns the note that sounded. */
  function input(m, vel) {
    const v = current;
    if (v && typeof v.range === 'function' && typeof v.tap === 'function') {
      const r = v.range();
      while (m < r[0]) m += 12;
      while (m > r[1]) m -= 12;
      v.tap(m, vel);
      return m;
    }
    if (typeof A !== 'undefined') { A.resume(); A.note(m, 0.6, { gain:0.35 + 0.65 * (vel == null ? 0.8 : vel) }); }
    return m;
  }

  return { mount, set, label, setTheme, a11y, onPaint, clearPaint, setPaused, fx, input,
           get C() { return C; }, get ROLE() { return ROLE; },
           get theme() { return theme; }, get view() { return current; },
           get headless() { return headless; },
           get orbit() { return orb; }, resize };
})();
