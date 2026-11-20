/* =====================================================================
   STUDIO VISIONS v8 — L'ADN ET LA GALAXIE (écran d'accueil)
   Un seul essaim de particules, en plein écran, qui passe de l'hélice
   d'ADN à une galaxie et retour. Chaque forme a ses plans : pour l'ADN
   les deux brins, les paires de bases, les atomes, la poussière ; pour la
   galaxie le bulbe, quatre bras, le disque, le halo, les étoiles lointaines.
   Un clic ou un doigt lance la transformation depuis le point touché.
   Sous le pointeur, un viseur lit en direct la particule la plus proche :
   toutes les valeurs affichées sont celles de la simulation.
   Aucune bibliothèque : canvas 2D.
   ===================================================================== */
(function () {
  "use strict";
  const FX = window.FX, RM = FX.RM, TAU = Math.PI * 2;
  const CAMZ = 4.2, MORPH = 2.3, PAIRS = 46, TURNS = 4.6, AUTO = 12;
  let cv = null, g = null, W = 0, H = 0, f = 800, CX = 0, CY = 0, N = 0;
  let px, py, pz, sx, sy, sz, tx, ty, tz, pb, seed, delay, bk, part, pa, qx, qy;
  let raf = 0, last = 0, T = 0, on = false, t0 = 0, spin = 0, spinV = .3, kind = "swarm", fps = 60, lastInfo = 0;
  let ink = "234,242,255", pal = null, L = {}, onInfo = null, font = "sans-serif";
  const P = { x: -9999, y: -9999, has: false, e: 0, nx: 0, ny: 0, lx: 0, ly: 0 };
  const view = { ry: 0, rx: 0 };
  const rnd = Math.random;

  /* ---------- poussière lointaine, commune aux deux formes : elle remplit l'écran ---------- */
  function field(i) { tx[i] = (rnd() - .5) * 11; ty[i] = (rnd() - .5) * 7; tz[i] = -2 + rnd() * 6; pb[i] = .08 + rnd() * .16; part[i] = 4; pa[i] = 0; }

  /* ---------- l'ADN : 0 brin A, 1 brin B, 2 paire de bases, 3 atomes, 4 poussière ---------- */
  function fHelix() {
    const R = .62, Lh = 6.6, tilt = -.52, ct = Math.cos(tilt), st = Math.sin(tilt);
    for (let i = 0; i < N; i++) {
      const m = i % 20, t = rnd();
      if (m >= 16) { field(i); continue; }
      const pair = Math.min(PAIRS, 1 + Math.floor(t * PAIRS)), q = (pair - .5) / PAIRS;
      let a, y, x, z;
      if (m < 7) {                                         /* les deux brins, continus */
        const s = m % 2, r = R + (rnd() - .5) * .04;
        a = t * TURNS * TAU + (s ? Math.PI : 0); y = (t - .5) * Lh;
        x = Math.cos(a) * r; z = Math.sin(a) * r; pb[i] = .62 + rnd() * .38; part[i] = s;
      } else if (m < 12) {                                 /* les barreaux, une paire par cran */
        const u = rnd() * 2 - 1;
        a = q * TURNS * TAU; y = (q - .5) * Lh + (rnd() - .5) * .014;
        x = Math.cos(a) * R * u; z = Math.sin(a) * R * u; pb[i] = .3 + rnd() * .3; part[i] = 2;
      } else {                                             /* les atomes : un amas à chaque bout de barreau */
        const s = rnd() < .5 ? 0 : Math.PI, rr = Math.cbrt(rnd()) * .11, u = rnd() * TAU, v = Math.acos(rnd() * 2 - 1);
        a = q * TURNS * TAU + s; y = (q - .5) * Lh + Math.cos(v) * rr;
        x = Math.cos(a) * R + Math.sin(v) * Math.cos(u) * rr; z = Math.sin(a) * R + Math.sin(v) * Math.sin(u) * rr;
        pb[i] = .5 + rnd() * .5; part[i] = 3;
      }
      pa[i] = pair;
      tx[i] = x * ct - y * st; ty[i] = x * st + y * ct; tz[i] = z;
    }
  }
  /* ---------- la galaxie : 0 bulbe, 10 à 13 les quatre bras, 2 disque, 3 halo, 4 étoiles lointaines ---------- */
  function fGalaxy() {
    const tilt = 1.02, ct = Math.cos(tilt), st = Math.sin(tilt);
    for (let i = 0; i < N; i++) {
      const m = i % 20;
      if (m >= 17) { field(i); continue; }
      let x, y, z, r;
      if (m < 3) {                                         /* le bulbe, au centre */
        r = Math.pow(rnd(), 1.6) * .44; const u = rnd() * TAU, v = Math.acos(rnd() * 2 - 1);
        x = Math.sin(v) * Math.cos(u) * r; y = Math.cos(v) * r * .7; z = Math.sin(v) * Math.sin(u) * r;
        pb[i] = .7 + rnd() * .3; part[i] = 0;
      } else if (m < 13) {                                 /* quatre bras : deux forts, deux fins */
        const arm = m % 4;
        r = .32 + Math.pow(rnd(), .75) * 2.25;
        const a = arm * (TAU / 4) + r * 2.5 + (rnd() - .5) * (.4 / (r + .3));
        x = Math.cos(a) * r; z = Math.sin(a) * r; y = (rnd() - .5) * .1 * (1.5 - r * .4);
        pb[i] = (arm % 2 ? .26 : .5) * (1.25 - r * .32) + rnd() * .28; part[i] = 10 + arm;
      } else if (m < 15) {                                 /* le disque, entre les bras */
        r = Math.sqrt(rnd()) * 2.5; const a = rnd() * TAU;
        x = Math.cos(a) * r; z = Math.sin(a) * r; y = (rnd() - .5) * .06; pb[i] = .1 + rnd() * .2; part[i] = 2;
      } else {                                             /* le halo, tout autour */
        r = 1.3 + rnd() * 1.7; const u = rnd() * TAU, v = Math.acos(rnd() * 2 - 1);
        x = Math.sin(v) * Math.cos(u) * r; y = Math.cos(v) * r; z = Math.sin(v) * Math.sin(u) * r;
        pb[i] = .1 + rnd() * .16; part[i] = 3;
      }
      pa[i] = r;
      tx[i] = x; ty[i] = y * ct - z * st; tz[i] = y * st + z * ct;
    }
  }
  /* la transformation part du point touché et se propage comme une onde */
  function morph(to, ox, oy) {
    const wave = ox !== undefined, D = Math.max(W, H) || 1;
    for (let i = 0; i < N; i++) {
      sx[i] = px[i]; sy[i] = py[i]; sz[i] = pz[i];
      delay[i] = wave ? Math.hypot(qx[i] - ox, qy[i] - oy) / D * 1.5 + rnd() * .12 : rnd() * .8;
    }
    kind = to; (to === "helix" ? fHelix : fGalaxy)();
    for (let i = 0; i < N; i++) bk[i] = Math.min(4, (pb[i] * 5) | 0);
    t0 = T;
    info(true);
  }
  function fit() {
    if (!cv) return;
    const d = Math.min(2, window.devicePixelRatio || 1);
    W = cv.clientWidth || innerWidth; H = cv.clientHeight || innerHeight;
    cv.width = Math.round(W * d); cv.height = Math.round(H * d);
    g.setTransform(d, 0, 0, d, 0, 0);
    const wide = W > 860;
    f = wide ? Math.min(H * 1.5, W * 1.15) : Math.min(H * .95, W * 1.9);
    CX = W * (wide ? .56 : .5); CY = H * (wide ? .47 : .36);
    font = (getComputedStyle(document.body).getPropertyValue("--one") || "sans-serif").trim();
    if ((RM || !on) && kind !== "swarm") frame(0);
  }
  const prog = () => Math.max(0, Math.min(1, (T - t0) / (MORPH + .9)));
  function info(force) {
    if (!onInfo || (!force && T - lastInfo < .12)) return;
    lastInfo = T;
    onInfo({ kind, n: N, fps: Math.round(fps), morph: prog(), spin: spinV, x: P.has ? P.nx : null, y: P.has ? P.ny : null });
  }
  /* ce que dit le viseur de la particule i */
  function describe(i) {
    const c = part[i], out = [];
    if (kind === "helix") {
      out.push(c === 0 ? L.strandA : c === 1 ? L.strandB : c === 2 ? L.link : c === 3 ? L.atom : L.dust);
      if (c < 4) { out.push(L.pair + " " + pa[i] + " / " + PAIRS); out.push(L.angle + " " + Math.round((pa[i] - .5) / PAIRS * TURNS * 360 % 360) + "°"); }
    } else {
      out.push(c === 0 ? L.bulge : c >= 10 ? L.arm + " " + (c - 9) + " / 4" : c === 2 ? L.disc : c === 3 ? L.halo : L.star);
      if (c !== 4) out.push(L.radius + " " + pa[i].toFixed(2));
    }
    out.push(L.depth + " " + (pz[i] >= 0 ? "+" : "") + pz[i].toFixed(2));
    return out;
  }

  function frame(dt) {
    if (!g || !W) return;
    T += dt;
    if (dt > 0) fps += (1 / dt - fps) * .06;
    const e = T - t0;
    if (!RM && e > MORPH + AUTO) morph(kind === "helix" ? "galaxy" : "helix");
    P.e *= Math.exp(-dt * 2.2);
    spinV = (kind === "helix" ? .34 : .16) + P.e * 1.4;
    spin += dt * spinV;
    view.ry += (spin + P.nx * .9 - view.ry) * Math.min(1, dt * 5 + (dt === 0 ? 1 : 0));
    view.rx += (Math.sin(T * .27) * .12 + P.ny * .6 - view.rx) * Math.min(1, dt * 5 + (dt === 0 ? 1 : 0));
    const cy = Math.cos(view.ry), sy_ = Math.sin(view.ry), cxr = Math.cos(view.rx), sxr = Math.sin(view.rx);
    const wob = .004 + P.e * .03, Rp = Math.max(120, Math.min(W, H) * .2), R2 = Rp * Rp, f0 = f / CAMZ;
    let best = -1, bd = 1e9, inRing = 0;
    const near = [];

    g.globalCompositeOperation = "source-over";
    g.clearRect(0, 0, W, H);
    g.globalCompositeOperation = "lighter";                /* les points s'additionnent : les amas brillent */
    const AL = [.16, .3, .48, .72, .96];
    for (let b = 0; b < 5; b++) {
      g.fillStyle = "rgba(" + (pal ? pal[b] : ink) + "," + AL[b] + ")";
      const big = b > 2;
      for (let i = 0; i < N; i++) {
        if (bk[i] !== b) continue;
        let u = (e - delay[i]) / MORPH; u = u < 0 ? 0 : u > 1 ? 1 : u;
        const k = u * u * (3 - 2 * u), dx = tx[i] - sx[i], dy = ty[i] - sy[i], dz = tz[i] - sz[i];
        const sw = Math.sin(Math.PI * u) * (.2 + seed[i] * .36) * (1 + P.e);
        const x = sx[i] + dx * k - dz * sw * .6 + Math.sin(seed[i] * 40 + T * 1.3) * wob;
        const y = sy[i] + dy * k + Math.sin(Math.PI * u) * (seed[i] - .5) * .6 + Math.cos(seed[i] * 31 + T * 1.1) * wob;
        const z = sz[i] + dz * k + dx * sw * .6;
        px[i] = x; py[i] = y; pz[i] = z;
        const X = x * cy + z * sy_, Z = -x * sy_ + z * cy, Y = y * cxr - Z * sxr, zc = y * sxr + Z * cxr + CAMZ;
        if (zc < .45) { qx[i] = -9999; continue; }
        const sc = f / zc;
        let scx = CX + X * sc, scy = CY + Y * sc;
        if (P.has) {                                       /* le pointeur écarte l'essaim en tourbillon, et relève ce qu'il survole */
          const ax = scx - P.x, ay = scy - P.y, d2 = ax * ax + ay * ay;
          if (d2 < R2) {
            const d = Math.sqrt(d2) || 1, q = 1 - d / Rp, q2 = q * q;
            scx += (ax / d) * q2 * 46 - (ay / d) * q2 * 40; scy += (ay / d) * q2 * 46 + (ax / d) * q2 * 40;
            if (part[i] !== 4) { inRing++; if (near.length < 60) near.push(i); if (d2 < bd) { bd = d2; best = i; } }
          }
        }
        qx[i] = scx; qy[i] = scy;
        const s = (big ? 1.7 : 1.15) * Math.min(2.4, sc / f0);
        g.fillRect(scx, scy, s, s);
      }
    }
    g.globalCompositeOperation = "source-over";

    /* le viseur : anneau gradué, liaisons vers les particules voisines, relevé de la plus proche */
    if (P.has && !RM) {
      const c = a => "rgba(" + ink + "," + a + ")";
      g.lineWidth = 1; g.strokeStyle = c(.5);
      g.beginPath(); g.arc(P.x, P.y, Rp, 0, TAU); g.stroke();
      g.strokeStyle = c(.8); g.beginPath();
      for (let d = 0; d < 360; d += 15) {
        const a = d * Math.PI / 180 + T * .4, l = d % 45 === 0 ? 9 : 4;
        g.moveTo(P.x + Math.cos(a) * Rp, P.y + Math.sin(a) * Rp); g.lineTo(P.x + Math.cos(a) * (Rp + l), P.y + Math.sin(a) * (Rp + l));
      }
      g.stroke();
      near.sort((a, b) => (qx[a] - P.x) ** 2 + (qy[a] - P.y) ** 2 - ((qx[b] - P.x) ** 2 + (qy[b] - P.y) ** 2));
      g.strokeStyle = c(.22); g.beginPath();
      for (let j = 1; j < Math.min(12, near.length); j++) { g.moveTo(qx[near[0]], qy[near[0]]); g.lineTo(qx[near[j]], qy[near[j]]); }
      g.stroke();
      if (best >= 0) {
        const bx = qx[best], by = qy[best], right = P.x < W - 290, lx = P.x + (right ? Rp + 26 : -Rp - 26), ly = Math.max(70, Math.min(H - 110, P.y - Rp * .5));
        g.strokeStyle = c(.95); g.strokeRect(bx - 5, by - 5, 11, 11);
        g.beginPath(); g.moveTo(bx + (right ? 6 : -5), by); g.lineTo(lx, ly); g.lineTo(lx + (right ? 150 : -150), ly); g.stroke();
        const lines = describe(best).concat([L.inRing + " " + inRing]);
        g.textAlign = right ? "left" : "right"; g.textBaseline = "top";
        lines.forEach((t, j) => {
          g.font = (j === 0 ? "700 13px " : "400 11px ") + font;
          g.fillStyle = c(j === 0 ? 1 : .78);
          g.fillText(j === 0 ? t : t.toUpperCase(), lx + (right ? 2 : -2), ly + 7 + j * 17 + (j ? 3 : 0));
        });
      }
    }
    info();
  }
  function loop(t) {
    if (!on) { raf = 0; return; }
    raf = requestAnimationFrame(loop);
    if (document.hidden) return;
    const dt = Math.min(.05, (t - last) / 1000 || 0);
    if (last && t - last < 15) return;
    last = t; frame(dt);
  }

  function onMove(ev) {
    if (!on || !cv) return;
    const r = cv.getBoundingClientRect(), x = ev.clientX - r.left, y = ev.clientY - r.top;
    if (P.has) P.e = Math.min(1.6, P.e + Math.hypot(x - P.lx, y - P.ly) / Math.max(W, 1) * 2.4);
    P.lx = P.x = x; P.ly = P.y = y; P.has = true;
    P.nx = x / W - .5; P.ny = y / H - .5;
  }
  function onOut(ev) { if (ev.type !== "pointerup" || ev.pointerType === "touch") { P.has = false; P.nx = P.ny = 0; } }
  addEventListener("pointermove", onMove, { passive: true });
  addEventListener("pointerdown", onMove, { passive: true });
  addEventListener("pointerup", onOut, { passive: true });
  addEventListener("pointercancel", onOut, { passive: true });
  document.documentElement.addEventListener("mouseleave", onOut);
  addEventListener("resize", fit);

  window.Adn = {
    /* canvas, libellés du viseur, rappel d'état (forme, nombre de particules, images par seconde…) */
    mount(canvas, labels, cb) {
      cv = canvas; g = cv.getContext("2d"); L = labels || {}; onInfo = cb || null;
      T = 0; t0 = 0; spin = 0; view.ry = view.rx = 0; kind = "swarm";
      N = innerWidth < 700 ? 4600 : 9000;
      const A = () => new Float32Array(N);
      px = A(); py = A(); pz = A(); sx = A(); sy = A(); sz = A(); tx = A(); ty = A(); tz = A(); pb = A(); seed = A(); delay = A(); pa = A(); qx = A(); qy = A();
      bk = new Uint8Array(N); part = new Uint8Array(N);
      for (let i = 0; i < N; i++) {                        /* départ : un nuage épars, d'où l'hélice se fabrique */
        const r = 1.6 + rnd() * 2.6, a = rnd() * TAU, h = rnd() * 2 - 1, q = Math.sqrt(1 - h * h);
        px[i] = Math.cos(a) * q * r; py[i] = h * r; pz[i] = Math.sin(a) * q * r; seed[i] = rnd();
      }
      fit();
      morph("helix");
      if (RM) { for (let i = 0; i < N; i++) { sx[i] = tx[i]; sy[i] = ty[i]; sz[i] = tz[i]; delay[i] = 0; } T = t0 + MORPH + 1; frame(0); }
    },
    start() { if (on || RM || !cv) return; on = true; last = 0; raf = requestAnimationFrame(loop); },
    stop() { on = false; P.has = false; },
    /* forme suivante ; avec un point (x, y) à l'écran, la transformation part de là */
    next(x, y) { if (!cv || RM || T - t0 < .6) return null; morph(kind === "helix" ? "galaxy" : "helix", x, y); return kind; },
    get kind() { return kind; },
    ink(rgb, p5) { ink = rgb; pal = p5 || null; if (cv && (RM || !on)) frame(0); }
  };
})();
