/* =====================================================================
   STUDIO VISIONS v8 — effets : relief et LiDAR, hologramme, radar, sons, décodage
   Aucun fichier externe : tout est dessiné ou synthétisé ici.
   ===================================================================== */
(function () {
  "use strict";
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  /* ---------- bruit de valeur (déterministe) ---------- */
  const perm = new Uint8Array(512);
  (function seed(s) {
    const p = Array.from({ length: 256 }, (_, i) => i);
    for (let i = 255; i > 0; i--) { s = (s * 16807) % 2147483647; const j = s % (i + 1); [p[i], p[j]] = [p[j], p[i]]; }
    for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  })(5057);
  const fade = t => t * t * (3 - 2 * t);
  const lerp = (a, b, t) => a + (b - a) * t;
  function vnoise(x, y) {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    const X = xi & 255, Y = yi & 255;
    const a = perm[perm[X] + Y] / 255, b = perm[perm[X + 1] + Y] / 255;
    const c = perm[perm[X] + Y + 1] / 255, d = perm[perm[X + 1] + Y + 1] / 255;
    const u = fade(xf), v = fade(yf);
    return lerp(lerp(a, b, u), lerp(c, d, u), v);
  }
  function fbm(x, y) {
    let s = 0, a = .55, f = 1;
    for (let o = 0; o < 4; o++) { s += a * vnoise(x * f, y * f); f *= 2.03; a *= .5; }
    return s;
  }

  /* =====================================================================
     TERRAIN : relief filaire en perspective, lignes occultées (vallées
     de l'Ourthe imaginaires). Dessiné de loin vers près.
     ===================================================================== */
  const Terrain = (() => {
    const cv = document.getElementById("terrain");
    const cx = cv.getContext("2d");
    let W = 0, H = 0, dpr = 1, raf = 0, last = 0, travel = 0, T = 0;
    const st = { alpha: 1, speed: 1, rgb: "255,255,255", horizon: .5, amp: 1 };
    const tgt = { ...st };
    let mode = "lines", horizonPx = null, minY = new Float32Array(0);
    /* vision thermique : fond teinté et palette par altitude (froid en bas, chaud sur les crêtes) */
    let bg = "#000", pal = null;
    /* caméra du poste de pilotage : position, altitude, cap, roulis, tangage */
    const cam = { x: 12, z: 0, h: 2.6, yaw: 0, roll: 0, pitch: 0 };

    function resize() {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = innerWidth; H = innerHeight;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      cv.style.width = W + "px"; cv.style.height = H + "px";
      cx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (RM) draw(0);
    }

    /* relief de l'écran titre : une vallée au centre */
    function height(x, z) {
      const n = fbm(x * .16 + 40, z * .16);
      const ridge = 1 - Math.abs(vnoise(x * .07 + 9, z * .07) * 2 - 1);
      const valley = Math.min(1, Math.abs(x) / 1.3);
      return (Math.pow(n, 1.6) * 2.4 + ridge * .9) * (.35 + .65 * valley);
    }
    /* relief survolé : plateaux et grandes vallées, sans axe privilégié */
    function fbm3(x, y) { return .58 * vnoise(x, y) + .29 * vnoise(x * 2.03, y * 2.03) + .145 * vnoise(x * 4.12, y * 4.12); }
    function heightL(x, z) {
      const n = fbm3(x * .15 + 40, z * .15);
      const ridge = 1 - Math.abs(vnoise(x * .06 + 9, z * .06) * 2 - 1);
      const basin = vnoise(x * .035 + 3, z * .035 + 7);
      return (n * n * 3.6 + ridge * .9) * Math.min(1, .22 + basin * basin * 2.4);
    }

    function drawLines(dt) {
      travel += dt * .9 * st.speed;
      cx.fillStyle = bg;
      cx.fillRect(0, 0, W, H);
      if (st.alpha < .01) return;

      const horizon = H * st.horizon;
      const fov = Math.max(W, H) * .62;
      const camH = 2.6;
      const dz = .55, rows = 56, zNear = .9;
      const off = travel % dz;
      const step = Math.max(6, Math.round(W / 150));

      const g = cx.createLinearGradient(0, horizon - 80, 0, horizon + 40);
      g.addColorStop(0, "rgba(0,0,0,0)");
      g.addColorStop(1, "rgba(" + st.rgb + "," + (.07 * st.alpha) + ")");
      cx.fillStyle = g; cx.fillRect(0, horizon - 80, W, 120);

      for (let r = rows; r >= 0; r--) {
        const z = zNear + r * dz - off;
        if (z <= .3) continue;
        const zw = z + travel;
        const depth = (z - zNear) / (rows * dz);
        let a = Math.pow(1 - depth, 1.15) * st.alpha;
        if (z < 1.6) a *= (z - .3) / 1.3;
        if (a <= .004) continue;
        cx.beginPath();
        let first = true;
        for (let sx = -step; sx <= W + step; sx += step) {
          const x = (sx - W / 2) * z / fov;
          const h = height(x, zw) * st.amp;
          const sy = horizon + (camH - h) * fov / z * .5;
          if (first) { cx.moveTo(sx, sy); first = false; } else cx.lineTo(sx, sy);
        }
        cx.lineTo(W + step, H + 2); cx.lineTo(-step, H + 2); cx.closePath();
        cx.fillStyle = bg; cx.fill();
        cx.strokeStyle = "rgba(" + st.rgb + "," + Math.min(.9, a * .85).toFixed(3) + ")";
        cx.lineWidth = r % 8 === 0 ? 1.1 : .7;
        cx.stroke();
      }
    }

    /* LiDAR : nuage de points du relief, vu du cockpit. Occultation par « horizon flottant »
       (du plus près au plus loin), impulsion de balayage qui s'éloigne de l'appareil. */
    function drawLidar(dt) {
      const yaw = cam.yaw, cs = Math.cos(yaw), sn = Math.sin(yaw);
      const adv = dt * 1.5 * st.speed;
      cam.x += sn * adv; cam.z += cs * adv; travel += adv;
      const g0 = Math.max(heightL(cam.x, cam.z), heightL(cam.x + sn * 2.5, cam.z + cs * 2.5), heightL(cam.x + sn * 5, cam.z + cs * 5));
      cam.h += (g0 + 1.05 - cam.h) * (dt === 0 ? 1 : Math.min(1, dt * 1.4));

      cx.fillStyle = bg;
      cx.fillRect(0, 0, W, H);
      if (st.alpha < .01) return;
      const horizon = (horizonPx == null ? H * st.horizon : horizonPx) + cam.pitch;
      const fov = Math.max(W, H) * .62;

      cx.save();
      cx.translate(W / 2, horizon); cx.rotate(cam.roll); cx.translate(-W / 2, -horizon);
      const gl = cx.createLinearGradient(0, horizon - 90, 0, horizon + 30);
      gl.addColorStop(0, "rgba(0,0,0,0)");
      gl.addColorStop(1, "rgba(" + st.rgb + "," + (.1 * st.alpha).toFixed(3) + ")");
      cx.fillStyle = gl; cx.fillRect(-W * .3, horizon - 90, W * 1.6, 120);

      const x0 = -W * .2, x1 = W * 1.2, step = Math.max(5, Math.round(W / 175));
      const cols = Math.ceil((x1 - x0) / step) + 2;
      if (minY.length !== cols) minY = new Float32Array(cols);
      minY.fill(H * 1.7);
      const dz = .46, rows = 66, zNear = .8, zFar = zNear + rows * dz;
      const off = travel % dz, base = Math.floor(travel / dz);
      const sd = (T * 6.5) % (zFar + 8);
      for (let r = 1; r <= rows; r++) {
        const z = zNear + r * dz - off;
        const depth = (z - zNear) / (rows * dz);
        let a = Math.pow(1 - depth, 1.25) * st.alpha;
        if (z < 1.5) a *= Math.max(0, (z - .7) / .8);
        const boost = Math.max(0, 1 - Math.abs(z - sd) / 1.1);
        const al = Math.min(1, a * (.78 + boost * 1.6));
        const show = al > .012, alS = al.toFixed(3);
        if (show && !pal) cx.fillStyle = "rgba(" + st.rgb + "," + alS + ")";
        let cur = -1;
        const size = boost > .3 ? 2.6 : Math.max(1.1, 2.5 * (1 - depth));
        const k = fov / z, half = ((base + r) & 1) ? step / 2 : 0;
        for (let c = 0; c < cols; c++) {
          const sx = x0 + c * step + half;
          const x = (sx - W / 2) / k;
          const h = heightL(cam.x + x * cs + z * sn, cam.z - x * sn + z * cs);
          const sy = horizon + (cam.h - h) * k * .62;
          if (sy < minY[c]) {
            if (show) {
              if (pal) {                                  /* la couleur ne change que d'un palier d'altitude à l'autre */
                const b = boost > .3 ? 3 : h < pal.t[0] ? 0 : h < pal.t[1] ? 1 : 2;
                if (b !== cur) { cx.fillStyle = "rgba(" + pal.c[b] + "," + alS + ")"; cur = b; }
              }
              cx.fillRect(sx, sy, size, size);
            }
            minY[c] = sy;
          }
        }
      }
      cx.restore();
    }

    function draw(dt) {
      for (const k of ["alpha", "speed", "horizon", "amp"]) st[k] += (tgt[k] - st[k]) * Math.min(1, dt * 2.2);
      st.rgb = tgt.rgb;
      T += dt;
      if (mode === "lidar") drawLidar(dt); else drawLines(dt);
    }

    function loop(t) {
      raf = requestAnimationFrame(loop);
      if (document.hidden) return;
      const dt = Math.min(.1, (t - last) / 1000 || 0);
      if (t - last < 30) return;                                /* ~30 i/s suffit */
      last = t;
      draw(dt);
    }

    resize();
    addEventListener("resize", resize);
    draw(0);
    if (RM) { Object.assign(st, tgt); draw(0); } else raf = requestAnimationFrame(loop);

    return {
      cam,
      get alt() { return cam.h; },
      get speed() { return st.speed; },
      set(o) {
        if (o.mode) mode = o.mode;
        if ("horizonPx" in o) horizonPx = o.horizonPx;
        if ("pal" in o) pal = o.pal;
        if ("bg" in o) bg = o.bg;
        for (const k of ["alpha", "speed", "rgb", "horizon", "amp"]) if (k in o) tgt[k] = o[k];
        if (o.now) { st.alpha = tgt.alpha; draw(0); }       /* sans fondu : l'accueil ne laisse pas voir le relief s'effacer */
        if (RM) { Object.assign(st, tgt); draw(0); }
      }
    };
  })();

  /* =====================================================================
     HOLOGRAMME : le copilote en nuage de points, tiré de la silhouette de l'Oracle.
     Il tourne lentement, suit le pointeur et vibre quand il parle.
     ===================================================================== */
  const Holo = (() => {
    let cv = null, cx = null, pts = [], talk = 0, talkT = 0, look = 0, raf = 0, last = 0, w = 0, h = 0, T = 0, ratio = 1.78;
    let c1 = "255,255,255", c2 = "169,212,255";   /* points forts, points courants */
    function fit() {
      if (!cv) return;
      const d = Math.min(2, devicePixelRatio || 1);
      w = cv.clientWidth || 120; h = cv.clientHeight || 150;
      cv.width = Math.round(w * d); cv.height = Math.round(h * d); cx.setTransform(d, 0, 0, d, 0, 0);
    }
    function mount(canvas, src) {
      cv = canvas; cx = cv.getContext("2d"); fit();
      addEventListener("resize", fit);
      const im = new Image();
      im.onload = () => {
        const sw = 110, sh = Math.round(sw * im.height / im.width);
        ratio = sh / sw;
        const c = document.createElement("canvas"); c.width = sw; c.height = sh;
        const g = c.getContext("2d"); g.drawImage(im, 0, 0, sw, sh);
        let d;
        try { d = g.getImageData(0, 0, sw, sh).data; } catch (e) { return; }
        const out = [];
        let s = 99;
        const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
        for (let y = 0; y < sh; y++) for (let x = 0; x < sw; x++) {
          const i = (y * sw + x) * 4, l = (d[i] * .55 + d[i + 1] * .3 + d[i + 2] * .15) / 255;
          if (l > .13 && rnd() < Math.min(1, l * 1.5)) out.push([x / sw - .5, (y / sh - .5) * ratio, l]);
        }
        pts = out; frame(0);
      };
      im.src = src;
      if (!raf) raf = requestAnimationFrame(loop);
    }
    function frame(dt) {
      if (!cx || !w) return;
      T += dt; talk += (talkT - talk) * Math.min(1, dt * 8 + (dt === 0 ? 1 : 0));
      cx.clearRect(0, 0, w, h);
      const rot = (RM ? 0 : Math.sin(T * .6) * .24) + look * .5, cs = Math.cos(rot), sn = Math.sin(rot);
      const sc = Math.min(w / 1.02, h / (ratio * 1.04));
      const scanY = ((T * .35) % 1.3 - .65) * ratio;
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i], z = Math.cos(p[0] * Math.PI) * .24;
        const xr = p[0] * cs + z * sn, zr = -p[0] * sn + z * cs;
        const k = 1.8 / (1.8 - zr);
        const jy = talk > .02 ? Math.sin(T * 24 + p[1] * 30 + p[0] * 9) * talk * .011 : 0;
        const sx = w / 2 + xr * k * sc, sy = h / 2 + (p[1] + jy) * k * sc;
        const near = Math.abs(p[1] - scanY) < .035 ? .5 : 0;
        const a = Math.min(1, .28 + p[2] * .72 + near + talk * .15);
        cx.fillStyle = "rgba(" + (p[2] > .72 || near ? c1 : c2) + "," + a.toFixed(2) + ")";
        cx.fillRect(sx, sy, 1.25, 1.25);
      }
    }
    function loop(t) {
      raf = requestAnimationFrame(loop);
      if (document.hidden || !cv || !cv.offsetParent) return;
      const dt = Math.min(.1, (t - last) / 1000 || 0);
      if (t - last < 30) return;
      last = t; frame(dt);
    }
    return { mount, fit, talk(v) { talkT = v ? 1 : 0; }, look(v) { look = v; }, tint(a, b) { c1 = a; c2 = b; frame(0); } };
  })();

  /* =====================================================================
     RADAR : balayage, une trace par opération livrée
     ===================================================================== */
  const Radar = (() => {
    let cv = null, cx = null, blips = [], hi = null, raf = 0, last = 0, ang = 0, size = 0;
    let rgb = "255,255,255";
    function hash(s) { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967295; }
    function mount(canvas, keys) {
      cv = canvas; cx = cv.getContext("2d");
      blips = keys.map((k, i) => ({ k, a: (i / keys.length) * Math.PI * 2 + hash(k) * .5, r: .28 + hash(k + "r") * .62, lit: 0 }));
      fit();
      addEventListener("resize", fit);
      frame(0);
      if (!raf) raf = requestAnimationFrame(loop);
    }
    function fit() {
      if (!cv) return;
      const d = Math.min(2, devicePixelRatio || 1);
      size = cv.clientWidth || 240;
      cv.width = size * d; cv.height = size * d; cx.setTransform(d, 0, 0, d, 0, 0);
    }
    function frame(dt) {
      if (!cx || !size) return;
      const c = size / 2, R = c - 4;
      cx.clearRect(0, 0, size, size);
      cx.strokeStyle = "rgba(" + rgb + ",.16)"; cx.lineWidth = 1;
      for (let i = 1; i <= 4; i++) { cx.beginPath(); cx.arc(c, c, R * i / 4, 0, Math.PI * 2); cx.stroke(); }
      cx.beginPath(); cx.moveTo(c - R, c); cx.lineTo(c + R, c); cx.moveTo(c, c - R); cx.lineTo(c, c + R); cx.stroke();
      for (let i = 0; i < 72; i++) {
        const a = i / 72 * Math.PI * 2, l = i % 6 === 0 ? 7 : 3;
        cx.beginPath(); cx.moveTo(c + Math.cos(a) * R, c + Math.sin(a) * R); cx.lineTo(c + Math.cos(a) * (R - l), c + Math.sin(a) * (R - l)); cx.stroke();
      }
      if (!RM) ang = (ang + dt * 1.3) % (Math.PI * 2);
      for (let i = 0; i < 28; i++) {
        const a0 = ang - i * .035;
        cx.beginPath(); cx.moveTo(c, c); cx.arc(c, c, R, a0 - .036, a0); cx.closePath();
        cx.fillStyle = "rgba(" + rgb + "," + (.2 * (1 - i / 28)).toFixed(3) + ")"; cx.fill();
      }
      cx.strokeStyle = "rgba(" + rgb + ",.9)";
      cx.beginPath(); cx.moveTo(c, c); cx.lineTo(c + Math.cos(ang) * R, c + Math.sin(ang) * R); cx.stroke();
      for (const b of blips) {
        let d = ang - b.a; d = ((d % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        if (d < .08) b.lit = 1; else b.lit = Math.max(0, b.lit - dt * .45);
        const x = c + Math.cos(b.a) * R * b.r, y = c + Math.sin(b.a) * R * b.r;
        const on = hi === b.k;
        const a = on ? 1 : (RM ? .8 : .18 + b.lit * .82);
        cx.fillStyle = on ? "rgba(169,212,255,1)" : "rgba(" + rgb + "," + a.toFixed(3) + ")";
        cx.beginPath(); cx.arc(x, y, on ? 3.5 : 2.4, 0, Math.PI * 2); cx.fill();
        if (on) {
          cx.strokeStyle = "rgba(169,212,255,.9)";
          cx.strokeRect(x - 9, y - 9, 18, 18);
          cx.font = "9px " + getComputedStyle(document.body).getPropertyValue("--mono");
          cx.fillText(b.k.toUpperCase(), x + 13, y + 3);
        }
      }
    }
    function loop(t) {
      raf = requestAnimationFrame(loop);
      if (document.hidden || !cv || !cv.offsetParent) return;
      const dt = Math.min(.1, (t - last) / 1000 || 0);
      if (t - last < 30) return;
      last = t; frame(dt);
    }
    return { mount, focus(k) { hi = k; }, color(c) { rgb = c; } };
  })();

  /* =====================================================================
     SONS : bips synthétisés (Web Audio), coupables avec M
     ===================================================================== */
  const Sfx = (() => {
    let ctx = null, master = null, on = store.get("sv7.sound") !== "0", hold = null, armed = false, humN = null;
    function ensure() {
      if (!on || !armed) return null;   /* rien avant le premier geste du visiteur */
      if (!ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        ctx = new AC(); master = ctx.createGain(); master.gain.value = .16; master.connect(ctx.destination);
      }
      if (ctx.state === "suspended") ctx.resume();
      return ctx;
    }
    function tone(f, d, type, g, when, f2) {
      const c = ensure(); if (!c) return;
      const t = c.currentTime + (when || 0);
      const o = c.createOscillator(), a = c.createGain();
      o.type = type || "square"; o.frequency.setValueAtTime(f, t);
      if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
      a.gain.setValueAtTime(0, t); a.gain.linearRampToValueAtTime(g || .2, t + .004);
      a.gain.exponentialRampToValueAtTime(.0001, t + d);
      o.connect(a); a.connect(master); o.start(t); o.stop(t + d + .03);
    }
    function noise(d, g, when, freq) {
      const c = ensure(); if (!c) return;
      const t = c.currentTime + (when || 0);
      const buf = c.createBuffer(1, Math.ceil(c.sampleRate * d), c.sampleRate);
      const ch = buf.getChannelData(0); for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1;
      const s = c.createBufferSource(); s.buffer = buf;
      const f = c.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = freq || 1800; f.Q.value = .8;
      const a = c.createGain(); a.gain.setValueAtTime(g || .2, t); a.gain.exponentialRampToValueAtTime(.0001, t + d);
      s.connect(f); f.connect(a); a.connect(master); s.start(t);
    }
    /* sons enregistrés : un seul fichier découpé en repères [début, durée].
       Le fichier est demandé à l'avance, décodé au premier geste, et ne joue que si le son est actif. */
    const CUES = { beeps: [0.0, 5.9], startup: [6.3, 4.0], riser: [10.7, 5.0], tinnitus: [16.1, 2.5], impact: [19.0, 5.5], flyby: [24.9, 3.7], door: [29.0, 2.1], whale: [31.5, 9.0] };
    const BANK_URL = ((window.SV && window.SV.media) || "media/") + "sfx.mp3";
    let bank = null, bytesP = null, bankP = null, live = {};
    function prefetch() {
      if (!on || bytesP) return;
      bytesP = fetch(BANK_URL).then(r => (r.ok ? r.arrayBuffer() : null)).catch(() => null);
    }
    function loadBank() {
      const c = ensure(); if (!c) return null;
      if (!bankP) {
        prefetch();
        bankP = (bytesP || Promise.resolve(null)).then(b => (b ? new Promise(res => c.decodeAudioData(b, res, () => res(null))) : null)).then(buf => { bank = buf; return buf; });
      }
      return bankP;
    }
    function cut(name, fade) {
      const p = live[name]; if (!p || !ctx) return;
      delete live[name];
      const t = ctx.currentTime, d = fade || .2;
      try { p.g.gain.cancelScheduledValues(t); p.g.gain.setTargetAtTime(0, t, d / 3); p.s.stop(t + d + .05); } catch (e) {}
    }
    return {
      get on() { return on; },
      prefetch,
      /* joue un repère du fichier ; opt : { gain, delay } */
      cue(name, opt) {
        const c = ensure(), q = CUES[name]; if (!c || !q) return;
        const go = () => {
          if (!bank || !on) return;
          cut(name, .05);
          const sN = c.createBufferSource(), gN = c.createGain(), t = c.currentTime + ((opt && opt.delay) || 0);
          sN.buffer = bank; gN.gain.value = (opt && opt.gain) || .8;
          sN.connect(gN); gN.connect(c.destination); sN.start(t, q[0], q[1]);
          const rec = live[name] = { s: sN, g: gN };
          sN.onended = () => { if (live[name] === rec) delete live[name]; };
        };
        if (bank) go(); else { const pr = loadBank(); if (pr) pr.then(go); }
      },
      cut,
      cutAll(fade) { Object.keys(live).forEach(k => cut(k, fade)); },
      toggle(v) { on = v === undefined ? !on : v; store.set("sv7.sound", on ? "1" : "0"); if (on) { ensure(); this.select(); } else { this.hum(false); this.cutAll(.1); } return on; },
      unlock() { armed = true; ensure(); },
      move() { tone(1480, .03, "square", .07); },
      select() { tone(740, .045, "square", .1); tone(1110, .07, "square", .1, .05); },
      back() { tone(620, .07, "square", .08, 0, 310); },
      tick() { tone(2600, .01, "square", .025); },
      open() { noise(.18, .12, 0, 2400); tone(220, .2, "triangle", .14, 0, 440); },
      boot() { noise(.35, .1, 0, 900); tone(55, .5, "sine", .25, 0, 110); },
      engage() { noise(.75, .16, 0, 520); tone(85, .75, "sawtooth", .09, 0, 430); },
      /* --- poste de pilotage --- */
      turn() { noise(.16, .07, 0, 700); tone(1320, .025, "square", .05); },                 /* changement de cap : souffle et clic */
      lock() { tone(1568, .05, "sine", .09); tone(2093, .09, "sine", .09, .07); },          /* cap verrouillé */
      ping() { tone(1175, .28, "sine", .08); },                                             /* visuel en approche */
      sw() { noise(.03, .16, 0, 3200); tone(190, .05, "square", .06, .01); },               /* interrupteur */
      radio() { noise(.07, .06, 0, 2600); },                                                /* ouverture du canal du copilote */
      arrive() { tone(70, .45, "sine", .3, 0, 38); noise(.4, .1, 0, 1400); tone(660, .12, "sine", .06, .05); },
      /* accélération : une montée de moteur et un souffle qui grimpent pendant d secondes */
      warp(d) {
        const c = ensure(); if (!c) return;
        d = d || .6;
        const t = c.currentTime, o = c.createOscillator(), a = c.createGain(), f = c.createBiquadFilter();
        o.type = "sawtooth"; o.frequency.setValueAtTime(60, t); o.frequency.exponentialRampToValueAtTime(520, t + d);
        f.type = "lowpass"; f.frequency.setValueAtTime(300, t); f.frequency.exponentialRampToValueAtTime(4200, t + d);
        a.gain.setValueAtTime(0, t); a.gain.linearRampToValueAtTime(.1, t + d * .7); a.gain.exponentialRampToValueAtTime(.0001, t + d + .12);
        o.connect(f); f.connect(a); a.connect(master); o.start(t); o.stop(t + d + .2);
        const buf = c.createBuffer(1, Math.ceil(c.sampleRate * (d + .2)), c.sampleRate), ch = buf.getChannelData(0);
        for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1;
        const n = c.createBufferSource(), bp = c.createBiquadFilter(), na = c.createGain();
        bp.type = "bandpass"; bp.Q.value = 1.2; bp.frequency.setValueAtTime(400, t); bp.frequency.exponentialRampToValueAtTime(5200, t + d);
        na.gain.setValueAtTime(0, t); na.gain.linearRampToValueAtTime(.2, t + d * .8); na.gain.exponentialRampToValueAtTime(.0001, t + d + .15);
        n.buffer = buf; n.connect(bp); bp.connect(na); na.connect(master); n.start(t);
      },
      /* fond de cabine : un grave très doux et un filet d'air, seulement en vol */
      hum(v) {
        if (!v) {
          if (!humN || !ctx) { humN = null; return; }
          const h = humN; humN = null;
          try { h.g.gain.setTargetAtTime(0, ctx.currentTime, .12); setTimeout(() => { try { h.o1.stop(); h.o2.stop(); h.n.stop(); } catch (e) {} }, 700); } catch (e) {}
          return;
        }
        const c = ensure(); if (!c || humN) return;
        const g = c.createGain(); g.gain.value = 0; g.connect(master);
        const lp = c.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 210; lp.connect(g);
        const og = c.createGain(); og.gain.value = .5; og.connect(lp);
        const o1 = c.createOscillator(), o2 = c.createOscillator();
        o1.type = o2.type = "sawtooth"; o1.frequency.value = 55; o2.frequency.value = 55.7; o1.connect(og); o2.connect(og);
        const buf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate), ch = buf.getChannelData(0);
        for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1;
        const n = c.createBufferSource(); n.buffer = buf; n.loop = true;
        const bp = c.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 900; bp.Q.value = .6;
        const ng = c.createGain(); ng.gain.value = .1; n.connect(bp); bp.connect(ng); ng.connect(g);
        o1.start(); o2.start(); n.start();
        g.gain.setTargetAtTime(.5, c.currentTime, .9);
        humN = { g, o1, o2, n, lp, ng };
      },
      /* le fond suit le vol : plus aigu et plus d'air quand ça accélère ou que ça vire */
      humSet(speed, roll) {
        if (!humN || !ctx) return;
        const t = ctx.currentTime, k = Math.min(3, Math.max(0, speed));
        humN.o1.frequency.setTargetAtTime(55 + k * 20, t, .2); humN.o2.frequency.setTargetAtTime(55.7 + k * 20.6, t, .2);
        humN.lp.frequency.setTargetAtTime(200 + k * 240, t, .2);
        humN.ng.gain.setTargetAtTime(.09 + k * .1 + Math.min(.12, Math.abs(roll) * .004), t, .2);
      },
      alert() { for (let i = 0; i < 3; i++) { tone(988, .1, "sawtooth", .12, i * .2); tone(740, .1, "sawtooth", .12, i * .2 + .1); } },
      tx() { for (let i = 0; i < 4; i++) tone(1760, .05, "sine", .1, i * .11); },
      seal() { [220, 277, 330, 440].forEach((f, i) => tone(f, 1.6, "triangle", .12, i * .02)); noise(.5, .16, 0, 600); },
      holdStart() {
        const c = ensure(); if (!c) return;
        const o = c.createOscillator(), a = c.createGain(), t = c.currentTime;
        o.type = "sawtooth"; o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(660, t + 1.3);
        const f = c.createBiquadFilter(); f.type = "lowpass"; f.frequency.setValueAtTime(400, t); f.frequency.exponentialRampToValueAtTime(3000, t + 1.3);
        a.gain.setValueAtTime(0, t); a.gain.linearRampToValueAtTime(.08, t + .1);
        o.connect(f); f.connect(a); a.connect(master); o.start(t);
        hold = { o, a };
      },
      holdStop() {
        if (!hold || !ctx) return;
        const t = ctx.currentTime; hold.a.gain.cancelScheduledValues(t); hold.a.gain.setValueAtTime(hold.a.gain.value, t);
        hold.a.gain.exponentialRampToValueAtTime(.0001, t + .08); hold.o.stop(t + .1); hold = null;
      }
    };
  })();

  /* =====================================================================
     DÉCODAGE : le texte se résout caractère par caractère
     ===================================================================== */
  const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%/<>アイウエオカキクケコサシスセソタチツテトナニヌネノ";
  function decode(el, dur) {
    const final = el.textContent;
    if (RM || !final.trim()) return;
    if (!el.hasAttribute("aria-label")) el.setAttribute("aria-label", final);
    const n = final.length, total = dur || Math.min(900, 260 + n * 14);
    const start = performance.now();
    const res = Array.from({ length: n }, (_, i) => (i / n) * total * .75 + Math.random() * total * .25);
    let lastTick = 0;
    (function step(t) {
      const e = t - start;
      let out = "";
      for (let i = 0; i < n; i++) {
        const ch = final[i];
        out += (e >= res[i] || ch === " " || ch === "\n") ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      el.textContent = out;
      if (t - lastTick > 70) { Sfx.tick(); lastTick = t; }
      if (e < total) requestAnimationFrame(step); else el.textContent = final;
    })(start);
  }

  /* onde de la transmission */
  function wave(canvas, active) {
    const cx = canvas.getContext("2d"), d = Math.min(2, devicePixelRatio || 1);
    const w = canvas.clientWidth, h = canvas.clientHeight;
    canvas.width = w * d; canvas.height = h * d; cx.setTransform(d, 0, 0, d, 0, 0);
    let raf = 0, t0 = performance.now();
    (function f(t) {
      raf = requestAnimationFrame(f);
      const e = (t - t0) / 1000, talk = active();
      cx.clearRect(0, 0, w, h);
      const bars = 18, bw = w / bars;
      for (let i = 0; i < bars; i++) {
        const v = talk ? (.25 + .75 * Math.abs(Math.sin(e * 9 + i * .9) * Math.sin(e * 3.3 + i * .4))) : .08;
        const bh = Math.max(2, v * h);
        cx.fillStyle = "rgba(169,212,255," + (.35 + v * .65).toFixed(2) + ")";
        cx.fillRect(i * bw + 1, (h - bh) / 2, bw - 2, bh);
      }
    })(t0);
    return () => cancelAnimationFrame(raf);
  }

  /* nuage de points d'une image : contours et lumières, comme un retour LiDAR.
     Points triés par intensité pour dessiner par paliers. */
  const clouds = {};
  function cloud(src, target) {
    if (clouds[src]) return clouds[src];
    return (clouds[src] = new Promise((res, rej) => {
      const im = new Image();
      im.onload = () => {
        const w = 92, h = Math.max(40, Math.round(w * im.height / im.width));
        const c = document.createElement("canvas"); c.width = w; c.height = h;
        const g = c.getContext("2d", { willReadFrequently: true }); g.drawImage(im, 0, 0, w, h);
        let d;
        try { d = g.getImageData(0, 0, w, h).data; } catch (e) { rej(e); return; }
        const L = new Float32Array(w * h), Wt = new Float32Array(w * h);
        for (let i = 0; i < w * h; i++) L[i] = (d[i * 4] * .3 + d[i * 4 + 1] * .59 + d[i * 4 + 2] * .11) / 255;
        let sum = 0;
        for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
          const i = y * w + x, gx = L[i + 1] - L[i - 1], gy = L[i + w] - L[i - w];
          sum += (Wt[i] = L[i] * .3 + Math.min(1, Math.sqrt(gx * gx + gy * gy) * 3.2));
        }
        const k = (target || 1100) / (sum || 1);
        let sd = 7 + src.length;
        const rnd = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
        const pts = [];
        for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
          const i = y * w + x;
          if (rnd() < Wt[i] * k) pts.push([x / w - .5, (y / h - .5) * (h / w), Math.min(1, .25 + Wt[i])]);
        }
        pts.sort((a, b) => a[2] - b[2]);
        res({ pts, ratio: h / w });
      };
      im.onerror = () => rej(new Error("image"));
      im.src = src;
    }));
  }

  window.FX = { Terrain, Holo, Radar, Sfx, decode, wave, cloud, RM, store };
})();
