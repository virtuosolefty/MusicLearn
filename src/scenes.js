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
      fillC:0xD9E8FF, fillI:0.3, rimI:0.25, floorO:0.28, lit:1
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
      fillC:0x88A8FF, fillI:0.42, rimI:0.8, floorO:0.5, lit:0.62
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
  let lightAmb = null, lightKey = null, lightFill = null, lightRim = null, floorMat = null;
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
  function mount(canvas, h) {
    cvs = canvas; hooks = Object.assign(hooks, h || {});
    ray = new THREE.Raycaster(); ptr = new THREE.Vector2();
    renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:false });
    renderer.setClearColor(C.clear, 1);
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(C.fog, 26, 62);
    camera = new THREE.PerspectiveCamera(42, 1, 0.1, 300);
    root = new THREE.Group(); scene.add(root);

    lightAmb = new THREE.AmbientLight(C.ambC, C.ambI); scene.add(lightAmb);
    lightKey = new THREE.DirectionalLight(C.keyC, C.keyI); lightKey.position.set(6, 14, 9); scene.add(lightKey);
    lightFill = new THREE.DirectionalLight(C.fillC, C.fillI); lightFill.position.set(-9, 6, -6); scene.add(lightFill);
    lightRim = new THREE.PointLight(C.accent, C.rimI, 40); lightRim.position.set(0, 3, -13); scene.add(lightRim);

    // faint floor so the objects sit somewhere
    const fg = new THREE.PlaneGeometry(90, 90, 30, 30);
    floorMat = new THREE.LineBasicMaterial({ color:C.floor, transparent:true, opacity:C.floorO });
    const floor = new THREE.LineSegments(new THREE.WireframeGeometry(fg), floorMat);
    floor.rotation.x = -Math.PI / 2; floor.position.y = -2.6; scene.add(floor);

    bindPointer();
    resize();
    window.addEventListener('resize', resize);
    running = true; last = performance.now(); requestAnimationFrame(tick);
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
    const rh = bh / 0.768, rw = bw / (0.768 * a);
    orb.r = Math.max(rh, rw) * 1.08;
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
  function tick(now) {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (orb.auto) orb.th += orb.auto * dt;
    if (current && current.update) current.update(dt, now / 1000);
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

  /* ═══════════════════ VIEW 1 · KEYBOARD ═══════════════════ */
  function KeyView(cfg) {
    cfg = Object.assign({ lo:48, hi:72, labels:'names', flats:false }, cfg);
    const g = new THREE.Group(); root.add(g);
    const keys = new Map();      // midi -> {mesh, base, white, x, sprite}
    const marks = new Map();     // midi -> role
    const extras = new THREE.Group(); g.add(extras);
    let onKeyCb = null, labelMap = null, labelMode = cfg.labels;

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
          if (k.white || role) txt = T.name(m, cfg.flats);
          if (T.pc(m) === 0) {
            txt = T.name(m, cfg.flats) + T.oct(m);
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
    function paint() {
      keys.forEach((k, m) => {
        const role = marks.get(m);
        const col = role ? ROLE[role] || C.violet : k.base;
        k.mesh.material.color.setHex(col);
        k.mesh.material.emissive.setHex(role && role !== 'ghost' ? col : 0x000000);
        const ei = role === 'root' ? 0.55 : (role === 'scale' || role === 'ghost') ? 0.14 : 0.35;
        k.mesh.material.emissiveIntensity = role ? ei * C.emiss : 0;
        k.mesh.position.y = (k.white ? 0 : 0.24) + (role ? -0.03 : 0);
      });
      drawLabels();
    }
    const api = {
      group:g,
      get pickables() { return Array.from(keys.values()).map(k => k.mesh); },
      onPick(hit) {
        const m = hit.object.userData.midi;
        if (m == null) return;
        api.press(m);
        if (onKeyCb) onKeyCb(m);
      },
      onKey(cb) { onKeyCb = cb; return api; },
      press(m, dur) {
        const k = keys.get(m); if (!k) return;
        const y0 = k.white ? 0 : 0.24;
        k.mesh.position.y = y0 - 0.11;
        k.mesh.material.emissive.setHex(0xFFFFFF);
        k.mesh.material.emissiveIntensity = 0.6;
        setTimeout(() => { if (keys.has(m)) paint(); }, dur || 260);
      },
      clear() { marks.clear(); paint(); return api; },
      mark(m, role) { marks.set(m, role || 'chord'); return api; },
      marks(list, role) { (list || []).forEach(m => marks.set(m, role || 'chord')); return api; },
      apply() { paint(); return api; },
      labelMode(mode, map) { labelMode = mode; labelMap = map || null; drawLabels(); return api; },
      flats(v) { cfg.flats = v; drawLabels(); return api; },
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
          const nm = label(T.name(m, cfg.flats) +
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
    cfg = Object.assign({ steps:16, lanes:[{ name:'Kick', kind:'kick' }], group:4 }, cfg);
    const g = new THREE.Group(); root.add(g);
    const cells = [];            // [lane][step] = mesh
    const state = [];            // [lane][step] = 0|1|2(accent)
    let onCellCb = null, head = -1, heights = null;
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
        m.material.emissive.setHex(v ? col : 0x000000);
        m.material.emissiveIntensity = v === 2 ? 0.6 : v ? 0.3 : 0;
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
        api.toggle(lane, step);
        if (onCellCb) onCellCb(lane, step, state[lane][step]);
      },
      onCell(cb) { onCellCb = cb; return api; },
      toggle(l, s) { state[l][s] = state[l][s] ? 0 : 1; paint(); return api; },
      set(l, s, v) { state[l][s] = v; paint(); return api; },
      pattern(l, arr) { arr.forEach((v, s) => { if (s < S) state[l][s] = v; }); paint(); return api; },
      clearAll() { state.forEach(r => r.fill(0)); paint(); return api; },
      grouping(n) { cfg.group = n; drawNums(); paint(); return api; },
      /* per-step emphasis 0..1, drawn as cell height — the metric accent map */
      accents(arr) { heights = arr; paint(); return api; },
      hit(l, s) {
        const m = cells[l] && cells[l][s]; if (!m) return api;
        m.material.emissive.setHex(0xFFFFFF); m.material.emissiveIntensity = 0.9;
        setTimeout(() => paint(), 140); return api;
      },
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
    const api = {
      group:g,
      get pickables() { return outer.concat(inner); },
      onPick(hit) {
        const { idx, ring } = hit.object.userData;
        if (ring === 'maj') sel = idx;
        paint();
        if (onTileCb) onTileCb(idx, ring);
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
    let rows = [], noteList = [], onCellCb = null, chords = [];

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
        const midi = rows[r];
        const i = noteList.findIndex(n => n.step === s && n.midi === midi);
        if (i >= 0) noteList.splice(i, 1); else noteList.push({ step:s, midi, len:1 });
        drawNotes();
        if (onCellCb) onCellCb(s, midi, i < 0);
      },
      onCell(cb) { onCellCb = cb; return api; },
      get notes() { return noteList; },
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

  /* ── switcher ────────────────────────────────────────────── */
  const KINDS = { keys:KeyView, grid:GridView, wheel:WheelView, roll:RollView };
  /* if WebGL or the library is unavailable, hand back something harmless
     so the written lessons and their audio still work */
  const STUB = typeof Proxy === 'function' ? new Proxy({}, { get(t, k) {
    if (k === 'pickables' || k === 'notes') return [];
    if (k === 'state') return [[], [], []];
    if (k === 'sel') return 0;
    return () => STUB;
  } }) : {};
  function set(kind, cfg) {
    if (!renderer) return STUB;
    if (current && current.dispose) current.dispose();
    current = KINDS[kind](cfg || {});
    return current;
  }
  /* Repaint the world. Views are rebuilt by the caller afterwards. */
  function setTheme(t) {
    theme = (t === 'dark') ? 'dark' : 'light';
    C = PAL[theme]; ROLE = roles();
    if (!renderer) return;
    renderer.setClearColor(C.clear, 1);
    if (scene && scene.fog) scene.fog.color.setHex(C.fog);
    if (floorMat) { floorMat.color.setHex(C.floor); floorMat.opacity = C.floorO; }
    if (lightAmb) { lightAmb.color.setHex(C.ambC); lightAmb.intensity = C.ambI; }
    if (lightKey) { lightKey.color.setHex(C.keyC); lightKey.intensity = C.keyI; }
    if (lightFill) { lightFill.color.setHex(C.fillC); lightFill.intensity = C.fillI; }
    if (lightRim) { lightRim.color.setHex(C.accent); lightRim.intensity = C.rimI; }
  }
  return { mount, set, label, setTheme, get C() { return C; }, get ROLE() { return ROLE; },
           get theme() { return theme; }, get view() { return current; },
           get orbit() { return orb; }, resize };
})();
