/* =====================================================================
   STUDIO VISIONS v8 — L'ADN (écran d'accueil)
   Un seul essaim de particules qui se transforme : l'hélice d'ADN se
   fabrique, se défait, devient un visuel du studio en relief, puis une
   galaxie, puis un autre visuel. L'essaim tourne dans l'espace, suit la
   souris ou le doigt et s'écarte en tourbillon à leur passage.
   Aucune bibliothèque : canvas 2D, comme le reste du site.
   ===================================================================== */
(function () {
  "use strict";
  const FX = window.FX, RM = FX.RM, TAU = Math.PI * 2;
  const CAMZ = 3.2, MORPH = 1.8;
  let cv = null, g = null, W = 0, H = 0, f = 800, CX = 0, CY = 0;
  let N = 0, px, py, pz, sx, sy, sz, tx, ty, tz, pb, seed, delay, bk;
  let raf = 0, last = 0, T = 0, on = false, items = [], clouds = [], asked = [], onForm = null;
  let ink = "234,242,255", pal = null;
  let step = -1, t0 = 0, hold = 3, kind = "swarm", imgI = -1, spin = 0;
  const P = { x: -9999, y: -9999, has: false, e: 0, nx: 0, ny: 0, lx: 0, ly: 0 };
  const view = { ry: 0, rx: 0 };

  /* ---------- les formes : chacune écrit la place visée de chaque particule ---------- */
  function fHelix() {
    const turns = 3.2, R = .46, Hh = 2.3, tilt = -.38, ct = Math.cos(tilt), st = Math.sin(tilt);
    for (let i = 0; i < N; i++) {
      const t = Math.random(), m = i % 5;
      let a = t * turns * TAU, y = (t - .5) * Hh, x, z, b;
      if (m < 2) {                                         /* les deux brins */
        const r = R + (Math.random() - .5) * .035; if (m) a += Math.PI;
        x = Math.cos(a) * r; z = Math.sin(a) * r; b = .7 + Math.random() * .3;
      } else if (m < 4) {                                  /* les barreaux : paires de bases */
        const q = Math.round(t * 34) / 34, u = Math.random() * 2 - 1;
        a = q * turns * TAU; y = (q - .5) * Hh + (Math.random() - .5) * .012;
        x = Math.cos(a) * R * u; z = Math.sin(a) * R * u; b = .32 + Math.random() * .3;
      } else {                                             /* poussière autour */
        const r = R * (1.5 + Math.random() * 1.7), aa = Math.random() * TAU;
        x = Math.cos(aa) * r; z = Math.sin(aa) * r; b = .1 + Math.random() * .2;
      }
      tx[i] = x * ct - y * st; ty[i] = x * st + y * ct; tz[i] = z; pb[i] = b;
    }
  }
  function fGalaxy() {
    const tilt = 1.02, ct = Math.cos(tilt), st = Math.sin(tilt);
    for (let i = 0; i < N; i++) {
      const core = i % 6 === 0, r = core ? Math.pow(Math.random(), 2) * .28 : .12 + Math.pow(Math.random(), .8) * 1.05;
      const a = (i % 2) * Math.PI + r * 4.6 + (Math.random() - .5) * (core ? TAU : .55 / (r + .25));
      const x = Math.cos(a) * r, z = Math.sin(a) * r, y = (Math.random() - .5) * .07 * (1.3 - r);
      tx[i] = x; ty[i] = y * ct - z * st; tz[i] = y * st + z * ct;
      pb[i] = core ? .8 + Math.random() * .2 : (.22 + Math.random() * .5) * (1.25 - r);
    }
  }
  /* un visuel : chaque point du nuage devient quelques particules voisines, le clair en avant (relief) */
  function fImage(c) {
    const pts = c.pts, n = pts.length, s = 2.3 / Math.max(1, c.ratio * .92), jit = .6 / 92 * s;
    for (let i = 0; i < N; i++) {
      const p = pts[(Math.random() * n) | 0];
      tx[i] = p[0] * s + (Math.random() - .5) * jit; ty[i] = p[1] * s + (Math.random() - .5) * jit;
      tz[i] = -(p[2] - .55) * .34 + (Math.random() - .5) * .03; pb[i] = p[2];
    }
  }
  function morph(fill) {
    for (let i = 0; i < N; i++) { sx[i] = px[i]; sy[i] = py[i]; sz[i] = pz[i]; delay[i] = Math.random() * .75; }
    fill();
    for (let i = 0; i < N; i++) bk[i] = Math.min(4, (pb[i] * 5) | 0);
    t0 = T;
  }
  function load(i) {
    if (!items.length) return;
    i = ((i % items.length) + items.length) % items.length;
    if (asked[i]) return;
    asked[i] = true;
    FX.cloud(items[i].src, 1100).then(c => { clouds[i] = c; }).catch(() => {});
  }
  /* la suite : une forme, un visuel, une forme, un visuel… */
  function advance() {
    step++;
    let done = false;
    if (step % 2 === 1 && items.length) {
      for (let k = 0; k < items.length && !done; k++) {
        const i = (imgI + 1 + k) % items.length;
        if (clouds[i]) { imgI = i; kind = "image"; morph(() => fImage(clouds[i])); hold = 4.8; done = true; }
      }
      load(imgI + 1); load(imgI + 2);
    }
    if (!done) {
      kind = ((step / 2) | 0) % 2 === 0 ? "helix" : "galaxy";
      morph(kind === "helix" ? fHelix : fGalaxy); hold = 3.2;
    }
    if (onForm) onForm(kind, kind === "image" ? items[imgI] : null, N);
  }

  function fit() {
    if (!cv) return;
    const d = Math.min(2, window.devicePixelRatio || 1);
    W = cv.clientWidth || innerWidth; H = cv.clientHeight || innerHeight;
    cv.width = Math.round(W * d); cv.height = Math.round(H * d);
    g.setTransform(d, 0, 0, d, 0, 0);
    const wide = W > 860;
    f = wide ? Math.min(H * 1.05, W * 1.35) : Math.min(H * .6, W * 1.2);
    CX = W * (wide ? .66 : .5); CY = wide ? H * .38 : 54 + H * .17;
    if (RM || !on) frame(0);
  }

  function frame(dt) {
    if (!g || !W) return;
    T += dt;
    const e = T - t0;
    if (!RM && e > MORPH + .75 + hold) advance();
    P.e *= Math.exp(-dt * 2.2);
    /* l'ensemble tourne : en continu pour l'hélice et la galaxie, en balancier pour un visuel, et vers le pointeur */
    if (kind === "image") spin += (Math.round(spin / TAU) * TAU - spin) * Math.min(1, dt * 2.4);
    else spin += dt * (.42 + P.e * 1.6);
    const osc = Math.sin(T * .45) * (kind === "image" ? .42 : .14);
    view.ry += (spin + osc + P.nx * .8 - view.ry) * Math.min(1, dt * 5 + (dt === 0 ? 1 : 0));
    view.rx += (Math.sin(T * .31) * .1 + P.ny * .5 - view.rx) * Math.min(1, dt * 5 + (dt === 0 ? 1 : 0));
    const cy = Math.cos(view.ry), sy_ = Math.sin(view.ry), cxr = Math.cos(view.rx), sxr = Math.sin(view.rx);
    const wob = .004 + P.e * .03, Rp = Math.max(110, Math.min(W, H) * .2), R2 = Rp * Rp, f0 = f / CAMZ;

    g.globalCompositeOperation = "source-over";
    g.clearRect(0, 0, W, H);
    g.globalCompositeOperation = "lighter";                /* les points s'additionnent : les amas brillent */
    const AL = [.16, .3, .48, .7, .95];
    for (let b = 0; b < 5; b++) {
      g.fillStyle = "rgba(" + (pal ? pal[b] : ink) + "," + AL[b] + ")";
      const big = b > 2;
      for (let i = 0; i < N; i++) {
        if (bk[i] !== b) continue;
        /* trajet : de l'ancienne place à la nouvelle, en arc, chaque particule avec son retard */
        let u = (e - delay[i]) / MORPH; u = u < 0 ? 0 : u > 1 ? 1 : u;
        const k = u * u * (3 - 2 * u), dx = tx[i] - sx[i], dy = ty[i] - sy[i], dz = tz[i] - sz[i];
        const sw = Math.sin(Math.PI * u) * (.2 + seed[i] * .34) * (1 + P.e);
        const x = sx[i] + dx * k - dz * sw * .6 + Math.sin(seed[i] * 40 + T * 1.3) * wob;
        const y = sy[i] + dy * k + Math.sin(Math.PI * u) * (seed[i] - .5) * .5 + Math.cos(seed[i] * 31 + T * 1.1) * wob;
        const z = sz[i] + dz * k + dx * sw * .6;
        px[i] = x; py[i] = y; pz[i] = z;
        const X = x * cy + z * sy_, Z = -x * sy_ + z * cy, Y = y * cxr - Z * sxr, zc = y * sxr + Z * cxr + CAMZ;
        if (zc < .4) continue;
        const sc = f / zc;
        let scx = CX + X * sc, scy = CY + Y * sc;
        if (P.has) {                                       /* le pointeur écarte l'essaim en tourbillon */
          const ax = scx - P.x, ay = scy - P.y, d2 = ax * ax + ay * ay;
          if (d2 < R2) {
            const d = Math.sqrt(d2) || 1, q = 1 - d / Rp, q2 = q * q;
            scx += (ax / d) * q2 * 54 - (ay / d) * q2 * 40; scy += (ay / d) * q2 * 54 + (ax / d) * q2 * 40;
          }
        }
        const s = (big ? 1.7 : 1.15) * Math.min(1.9, sc / f0);
        g.fillRect(scx, scy, s, s);
      }
    }
    g.globalCompositeOperation = "source-over";
  }
  function loop(t) {
    if (!on) { raf = 0; return; }
    raf = requestAnimationFrame(loop);
    if (document.hidden) return;
    const dt = Math.min(.05, (t - last) / 1000 || 0);
    if (last && t - last < 15) return;
    last = t; frame(dt);
  }

  function onMove(e) {
    if (!on || !cv) return;
    const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    if (P.has) P.e = Math.min(1.6, P.e + Math.hypot(x - P.lx, y - P.ly) / Math.max(W, 1) * 2.4);
    P.lx = P.x = x; P.ly = P.y = y; P.has = true;
    P.nx = x / W - .5; P.ny = y / H - .5;
  }
  function onOut(e) { if (e.type !== "pointerup" || e.pointerType === "touch") { P.has = false; P.nx = P.ny = 0; } }
  addEventListener("pointermove", onMove, { passive: true });
  addEventListener("pointerdown", onMove, { passive: true });
  addEventListener("pointerup", onOut, { passive: true });
  addEventListener("pointercancel", onOut, { passive: true });
  document.documentElement.addEventListener("mouseleave", onOut);
  addEventListener("resize", fit);

  window.Adn = {
    /* canvas, liste [{ src, label }], rappel à chaque nouvelle forme */
    mount(canvas, list, cb) {
      cv = canvas; g = cv.getContext("2d"); items = list || []; onForm = cb || null;
      clouds = []; asked = []; step = -1; imgI = -1; T = 0; t0 = 0; spin = 0; view.ry = view.rx = 0;
      N = (innerWidth < 700 ? 3000 : 5600);
      const A = () => new Float32Array(N);
      px = A(); py = A(); pz = A(); sx = A(); sy = A(); sz = A(); tx = A(); ty = A(); tz = A(); pb = A(); seed = A(); delay = A();
      bk = new Uint8Array(N);
      for (let i = 0; i < N; i++) {                        /* départ : un nuage épars, d'où l'hélice se fabrique */
        const r = 1.2 + Math.random() * 1.6, a = Math.random() * TAU, h = Math.random() * 2 - 1, q = Math.sqrt(1 - h * h);
        px[i] = Math.cos(a) * q * r; py[i] = h * r; pz[i] = Math.sin(a) * q * r; seed[i] = Math.random();
      }
      load(0); load(1);
      fit();
      advance();
      if (RM) { for (let i = 0; i < N; i++) { sx[i] = tx[i]; sy[i] = ty[i]; sz[i] = tz[i]; delay[i] = 0; } T = t0 + MORPH + .1; frame(0); }
    },
    start() { if (on || RM || !cv) return; on = true; last = 0; raf = requestAnimationFrame(loop); },
    stop() { on = false; P.has = false; },
    next() { if (cv && !RM && T - t0 > .5) advance(); },
    ink(rgb, p5) { ink = rgb; pal = p5 || null; if (cv && (RM || !on)) frame(0); }
  };
})();
