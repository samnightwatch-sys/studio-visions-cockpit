/* =====================================================================
   STUDIO VISIONS v8 — POSTE DE PILOTAGE
   Machine d'états : boot -> titre -> serment -> vol (7 caps) -> panneau
   Routes : # (titre)  #serment  #vol  #<mission>  #op-<clé>  #oracle
   ===================================================================== */
(function () {
  "use strict";
  const S = window.SV, FX = window.FX;
  const { Sfx, Terrain, Holo, Radar, decode, RM, store } = FX;
  const Voice = window.Voice;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const T = s => esc(s).replace(/\[(À REMPLIR|À VALIDER)\]/g, m => (S.draft ? '<mark class="todo">' + m + "</mark>" : ""));
  const pad = n => String(n).padStart(2, "0");
  const touch = matchMedia("(hover: none)").matches;
  const ss = {
    get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
  };
  /* ?embed=1 : le poste est affiché dans une page du site officiel (pas de séquence de démarrage) */
  const EMBED = /[?&]embed=1\b/.test(location.search);
  if (EMBED) document.documentElement.classList.add("embed");

  let current = null, booted = false, hqBuilt = false, curMission = null;
  let timers = [];
  const later = (fn, ms) => { const id = setTimeout(fn, ms); timers.push(id); return id; };
  const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };

  /* ---------------------------------------------------------------- écrans */
  const TERRAIN = {
    boot: { mode: "lines", horizonPx: null, alpha: 0 },
    title: { mode: "lines", horizonPx: null, alpha: 0, now: true },          /* l'accueil a sa propre scène : l'essaim de particules */
    oath: { mode: "lines", horizonPx: null, alpha: .5, speed: .4, horizon: .64, amp: .8 },
    hq: { mode: "lidar", alpha: 1, speed: .55, horizon: .4, amp: 1 },
    oracle: { mode: "lines", horizonPx: null, alpha: 0 }
  };
  let backHash = "#vol";
  function show(id) {
    const prev = current;
    for (const s of $$(".screen")) s.hidden = s.id !== id;
    current = id;
    if (prev === "oracle" && id !== "oracle") { window.Oracle.close(); setAlert(false); }
    document.body.dataset.screen = id;
    $("#skip").hidden = !(id === "boot" || id === "oath");
    $("#snd").hidden = id === "boot";
    Terrain.set(TERRAIN[id]);
    if (id !== "hq") { closeDossier(true); closeTx(true); closeCmd(); }
    Sfx.hum(id === "hq");
    if (id !== "title" && window.Adn) window.Adn.stop();
    visPaint();
    if (prev === "hq" && id !== "hq") { Voice.hush(); metClear(); }
  }

  /* transition en volets, puis changement de route */
  function go(hash) {
    const c = $("#curtain");
    if (RM) { location.hash = hash; return; }
    c.classList.remove("go", "red"); void c.offsetWidth; c.classList.add("go");
    setTimeout(() => { location.hash = hash; }, 380);
    setTimeout(() => c.classList.remove("go"), 950);
  }

  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg; t.classList.add("on");
    clearTimeout(toast.id); toast.id = setTimeout(() => t.classList.remove("on"), 2000);
  }

  /* ---------------------------------------------------------------- BOOT */
  function boot(quick) {
    clearTimers();
    show("boot");
    const el = $("#boot"), log = $(".log", el);
    el.classList.remove("p2", "off");
    $(".presents p", el).textContent = S.title.presents;
    log.innerHTML = "";
    const per = quick ? 60 : 130;
    let i = 0;
    (function next() {
      if (i < S.boot.length) {
        const [k, v] = S.boot[i];
        const ln = document.createElement("div");
        ln.className = "ln";
        ln.innerHTML = '<span class="k">' + (i > 1 ? "&gt; " : "") + esc(k) + '</span><span class="d"></span><span class="v' + (v === "EN ATTENTE" ? " wait" : "") + '">' + esc(v) + "</span>";
        log.appendChild(ln); i++; Sfx.tick();
        later(next, per);
      } else {
        const cur = document.createElement("div"); cur.innerHTML = '<span class="cursor"></span>'; log.appendChild(cur);
        if (quick) { later(endBoot, 420); return; }
        later(() => { el.classList.add("p2"); Sfx.boot(); }, 420);
        later(() => el.classList.add("off"), 1750);
        later(endBoot, 2200);
      }
    })();
  }
  function endBoot() { clearTimers(); booted = true; goTitle(); }

  /* ---------------------------------------------------------------- ENTRÉE
     Même geste que sur le site officiel : un grand bouton avec le son, un lien sans le son.
     Le nom s'écrit toujours comme le logotype : « Studio Visions », jamais tout en capitales. */
  const svName = '<span class="sv-name">Studio Visions</span>';
  const sig = () => esc(S.signature).replace("Studio Visions", svName);
  const homeA = () => (S.home && S.home.url)
    ? '<a href="' + esc(S.home.url) + '" target="_top" rel="noopener">' + esc(S.home.label) + " ↗</a>" : "";
  function goTitle() {
    clearTimers();
    show("title");
    document.title = "Poste de pilotage — Studio Visions";
    const t = S.title, home = S.home && S.home.url;
    const mode = (m, attrs) => '<a class="en-mode" data-n="' + m.n + '" ' + attrs + "><small>" + m.n + "</small><b>" + esc(m.label) + "</b><span>" + esc(m.desc) + "</span></a>";
    $("#title").innerHTML =
      '<canvas class="adn" id="adn" aria-hidden="true"></canvas>' +
      '<header class="en-top"><span>© ' + svName + '</span><span class="en-mid">' + esc(t.tag) + "</span></header>" +
      '<p class="en-form" id="enForm" aria-hidden="true"></p>' +
      '<div class="en-main">' +
        '<p class="en-k">' + esc(t.kicker) + "</p>" +
        '<h1 class="en-name">' + esc(t.name) + "<sup>®</sup></h1>" +
        '<p class="en-line">' + esc(t.line) + "</p>" +
        '<p class="en-sub">' + esc(t.sub) + "</p>" +
        '<p class="en-cap"><small>01</small>' + esc(t.playCap) + "</p>" +
        '<div class="en-acts">' +
          '<button type="button" class="play" data-act="start"><i aria-hidden="true"></i>' + esc(t.start) + "</button>" +
          '<button type="button" class="en-quiet" data-act="quiet">' + esc(t.quiet) + "</button>" +
        "</div>" +
        /* les autres entrées, comme le menu d'un jeu : l'Oracle, le site classique, le serment */
        '<nav class="en-modes" aria-label="' + esc(t.modesLabel) + '">' +
          mode(t.modes.oracle, 'data-oracle href="' + esc(S.oracleUrl) + '"') +
          (home ? mode(t.modes.site, 'href="' + esc(home) + '" target="_top" rel="noopener"') : "") +
          mode(t.modes.oath, 'href="#serment"') +
        "</nav>" +
      "</div>" +
      '<footer class="en-foot"><span>' + sig() + '</span><span class="en-r">' + esc(t.place) + " · " + esc(S.version) + "</span></footer>";
    $(".en-acts").addEventListener("click", e => { const b = e.target.closest("[data-act]"); if (b) enter(b.dataset.act === "start"); });
    /* l'essaim : hélice d'ADN, visuels du studio, galaxie. Un clic ou un doigt dans le vide : forme suivante. */
    const F = t.forms, lab = $("#enForm");
    window.Adn.mount($("#adn"), metItems(), (kind, it, n) => {
      lab.innerHTML = "<b>" + esc(kind === "image" ? it.label : F[kind]) + "</b><span>" + esc(n.toLocaleString("fr-BE") + " " + F.count) + "</span>";
    });
    window.Adn.ink(VISION[vision].ink, VISION[vision].m5);
    window.Adn.start();
    const p = $("#title .play"); p && p.focus({ preventScroll: true });
  }
  /* entrée dans le poste : avec ou sans le son, selon le bouton choisi */
  function enter(sound) {
    setSound(sound, true);
    Sfx.select();
    if (store.get("sv8.tilt") === "1") tiltOn(true);
    store.set("sv7.seen", "1");
    go("#vol");
  }

  /* ---------------------------------------------------------------- SERMENT */
  let oathRun = 0, oathAll = null, hold = null;
  function goOath() {
    clearTimers();
    show("oath");
    document.title = S.oath.label + " — Studio Visions";
    const o = $("#oath"), O = S.oath, run = ++oathRun;
    o.className = "screen";
    o.innerHTML =
      '<div class="bar t"></div><div class="bar b"></div>' +
      '<p class="olabel">' + esc(O.label) + '<span class="jp">' + O.jp + "</span></p>" +
      '<div class="lines">' + O.lines.map(l => '<p class="ol">' + esc(l) + "</p>").join("") +
        '<p class="motto">' + esc(O.motto) + "</p></div>" +
      '<div class="holdwrap"><button type="button" class="hold" aria-label="' + esc(touch ? O.holdTouch : O.hold) + '">' +
        '<svg viewBox="0 0 84 84" aria-hidden="true"><circle class="trk" cx="42" cy="42" r="40"/><circle class="prg" cx="42" cy="42" r="40"/></svg>' +
        '<span class="core" aria-hidden="true">誓</span></button>' +
        '<span class="holdtxt">' + esc(touch ? O.holdTouch : O.hold) + "</span></div>" +
      '<div class="seal" aria-live="assertive"><span class="stamp">' + esc(O.sealed) + "</span><p>" + esc(O.welcome) + "</p></div>";
    later(() => o.classList.add("lb"), 40);
    const lines = $$(".ol", o);
    let i = 0;
    const reveal = () => {
      lines.forEach(l => { l.classList.add("in"); l.classList.remove("past"); });
      $(".motto", o).classList.add("in");
      later(() => { if (run !== oathRun) return; $(".holdwrap", o).classList.add("in"); $(".hold", o).focus({ preventScroll: true }); }, RM ? 0 : 900);
    };
    oathAll = () => { clearTimers(); if (!$(".holdwrap", o).classList.contains("in")) reveal(); };
    if (RM) { reveal(); }
    else {
      const next = () => {
        if (run !== oathRun) return;
        if (i > 0) lines[i - 1].classList.add("past");
        if (i < lines.length) { lines[i].classList.add("in"); Sfx.tick(); i++; later(next, 2300); }
        else reveal();
      };
      later(next, 1300);
    }
    bindHold(o);
  }
  function bindHold(o) {
    const btn = $(".hold", o), prg = $(".prg", o), C = 251.3, DUR = 1300;
    let t0 = 0, raf = 0, on = false, done = false;
    const tick = t => {
      const p = Math.min(1, (t - t0) / DUR);
      prg.style.strokeDashoffset = (C * (1 - p)).toFixed(1);
      if (p >= 1) { finish(); return; }
      raf = requestAnimationFrame(tick);
    };
    const start = () => {
      if (done || on || !$(".holdwrap", o).classList.contains("in")) return;
      on = true; btn.classList.add("on"); prg.style.transition = "";
      t0 = performance.now(); Sfx.holdStart(); raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      if (!on || done) return;
      on = false; btn.classList.remove("on"); cancelAnimationFrame(raf); Sfx.holdStop();
      prg.style.transition = "stroke-dashoffset .3s"; prg.style.strokeDashoffset = C;
    };
    const finish = () => {
      done = true; on = false; Sfx.holdStop(); Sfx.seal();
      store.set("sv7.sworn", "1"); store.set("sv7.seen", "1");
      const f = $("#flash"); f.classList.remove("go"); void f.offsetWidth; f.classList.add("go");
      o.classList.add("sealed");
      later(() => go("#vol"), RM ? 600 : 2100);
    };
    btn.addEventListener("pointerdown", e => { e.preventDefault(); try { btn.setPointerCapture(e.pointerId); } catch (x) {} start(); });
    ["pointerup", "pointercancel", "lostpointercapture"].forEach(ev => btn.addEventListener(ev, stop));
    btn.addEventListener("contextmenu", e => e.preventDefault());
    hold = { start, stop };
  }

  /* ---------------------------------------------------------------- POSTE DE PILOTAGE
     Chaque mission est un cap sur le ruban. On tourne l'appareil vers un cap
     (flèches, souris, voix), on engage, et le panneau de verre s'ouvre. */
  const D = { sel: 0, hdg: 0, roll: 0, pitch: 0, mx: 0, my: 0, open: false, boost: 0, raf: 0, last: 0, W: 0, H: 0, top: 0, dpr: 1, hud: null, wps: [],
    warp: 0, warpT: 0, streaks: null, going: false, wpGo: false, settle: false, free: false, push: false };
  const NW = S.missions.length;
  const WPH = S.missions.map((m, i) => Math.round(i * 360 / NW));
  const adiff = (a, b) => ((a - b + 540) % 360) - 180;
  const deg3 = d => String(Math.round(((d % 360) + 360) % 360) % 360).padStart(3, "0") + "°";
  let FONT_MONO = "monospace", FONT_HUD = "sans-serif";

  function goHQ(id, sub) {
    if (current !== "hq") {
      clearTimers();
      show("hq");
      if (!hqBuilt) buildDeck();
      deckSize();
      deckTick(0);                                   /* première image tout de suite, sans attendre la boucle */
      if (!D.raf) { D.last = 0; D.raf = requestAnimationFrame(deckLoop); }
      paintSound();
      if (!id) coachShow();
      if (ss.get("sv8.hello") !== "1") {
        ss.set("sv8.hello", "1");
        later(() => { if (current === "hq" && !D.open) copilot(S.deck.hello, true); }, 900);
      }
    }
    if (id) {
      const i = S.missions.findIndex(m => m.id === id);
      if (i !== D.sel) selectWp(i, true);
      if (id !== curMission || !D.open) openMission(id);
      if (id === "operations" && sub) openDossier(sub); else closeDossier(true);
    } else { closePanel(); closeDossier(true); }
  }

  function buildDeck() {
    hqBuilt = true;
    const H = S.hud, K = S.deck;
    const oracleBtn = cls => '<a class="btn-oracle ' + (cls || "") + '" data-oracle href="' + esc(S.oracleUrl) + '"><i></i>' + esc(H.oracle) + "</a>";
    const menuBtn = '<button class="hud-btn cmdb" type="button" aria-haspopup="dialog">' + esc(K.command) + " <kbd>/</kbd></button>";
    $("#hq").innerHTML =
      '<button type="button" class="skiplink" id="skipNav">' + esc(K.skip) + "</button>" +
      '<header class="dk-top">' +
        '<a class="brand" href="#" aria-label="Studio Visions, retour à l\'écran titre"><span class="bn">Studio Visions<sup>®</sup></span></a>' +
        '<span class="dk-call">' + esc(K.callsign) + "</span>" +
        '<div class="dk-chips" aria-hidden="true">' + K.chips.map(c => '<span class="chip on">' + esc(c) + "</span>").join("") + "</div>" +
        '<div class="status"><i class="dot"></i><span id="stTxt">' + esc(H.status) + '</span><span class="jp" id="stJp">' + H.statusJp + "</span></div>" +
        '<div class="clock"><span id="clk">--:--:--</span> <span class="dim">BRUXELLES</span></div>' +
        menuBtn + oracleBtn() +
      "</header>" +
      '<section class="dk-wind" aria-label="Pare-brise et caps">' +
        '<canvas id="hud" aria-hidden="true"></canvas>' +
        '<div class="dk-wps">' + S.missions.map((m, i) =>
          '<button type="button" class="wp" data-i="' + i + '" tabindex="-1" aria-label="Cap ' + esc(m.label) + '" hidden><i></i><span>' + esc(m.label) + "</span></button>").join("") + "</div>" +
        '<div class="dk-mets"></div>' +
        '<div class="dk-pillar l" aria-hidden="true"></div><div class="dk-pillar r" aria-hidden="true"></div>' +
        '<button type="button" class="dk-arrow l" aria-label="Cap précédent">‹</button>' +
        '<button type="button" class="dk-arrow r" aria-label="Cap suivant">›</button>' +
        '<p class="dk-prompt" id="dkPrompt" aria-hidden="true"></p>' +
        '<div class="dk-coach" id="dkCoach" hidden></div>' +
      "</section>" +
      '<section class="dk-mfds">' +
        '<nav class="mfd mfd-nav" aria-label="Caps"><h2><span>' + esc(K.nav) + "</span><span>" + pad(NW) + "</span></h2>" +
          '<ul class="mlist">' + S.missions.map((m, i) =>
            '<li><a class="mi" href="#' + m.id + '" data-i="' + i + '"><span class="n">' + m.n + '</span><span class="l">' + esc(m.label) + '</span><span class="h">' + deg3(WPH[i]) + "</span></a></li>").join("") + "</ul></nav>" +
        '<div class="mfd mfd-tgt"><h2><span>' + esc(K.target) + '</span><span id="tgHdg"></span></h2><div id="tgBody" aria-live="polite"></div>' +
          '<p class="tg-keys" aria-hidden="true">' + esc(K.keys) + "</p></div>" +
        '<aside class="mfd mfd-co" aria-label="Copilote"><h2><span>' + esc(K.copilot) + '</span><span id="coState">' + esc(K.states.idle) + "</span></h2>" +
          '<div class="co-row"><canvas id="holo" aria-hidden="true"></canvas><div class="co-txt"><p class="co-line" id="coLine" aria-live="polite"></p><p class="co-heard" id="coHeard"></p></div></div>' +
          '<div class="co-acts"><button type="button" class="btn mic">' + esc(K.talk) + ' <kbd>ESPACE</kbd></button>' +
            '<button type="button" class="hud-btn vox" aria-pressed="false">VOIX <b>OFF</b></button></div></aside>' +
      "</section>" +
      /* en-tête du panneau : les sept caps en onglets, toujours visibles, plus précédent / suivant */
      '<main class="panel glass" id="panel" tabindex="-1" aria-label="Contenu du cap" hidden><div class="gl-head">' +
        '<button type="button" class="gl-step" data-step="-1" aria-label="Cap précédent">‹</button>' +
        '<nav class="gl-tabs" aria-label="' + esc(K.tabs) + '">' + S.missions.map((m, i) =>
          '<a href="#' + m.id + '" data-i="' + i + '"><small>' + m.n + "</small>" + esc(m.label) + "</a>").join("") + "</nav>" +
        '<button type="button" class="gl-step" data-step="1" aria-label="Cap suivant">›</button>' +
        '<button type="button" class="hud-btn" id="glClose"><span class="lg">' + esc(K.back) + ' <kbd>ÉCHAP</kbd></span><span class="sm">' + esc(K.close) + "</span></button></div>" +
        '<div class="scanbar" aria-hidden="true"></div><div class="pin" id="pin"></div></main>' +
      '<div class="mbar"><button type="button" class="hud-btn mic">' + esc(K.talk) + "</button>" + oracleBtn() + "</div>";

    $("#cmd").innerHTML =
      '<form class="cmd-box" autocomplete="off" tabindex="-1"><label class="vh" for="cmdIn">' + esc(K.command) + "</label>" +
      '<input id="cmdIn" type="text" enterkeyhint="go" role="combobox" aria-expanded="true" aria-controls="cmdList" aria-autocomplete="list" placeholder="' + esc(K.cmdPlaceholder) + '">' +
      '<ul id="cmdList" role="listbox" aria-label="' + esc(K.command) + '"></ul>' +
      '<p class="cmd-hint" aria-hidden="true">' + esc(K.cmdHint) + "</p></form>";

    const cs = getComputedStyle(document.body);
    FONT_MONO = cs.getPropertyValue("--mono") || FONT_MONO;
    FONT_HUD = cs.getPropertyValue("--hud") || FONT_HUD;
    if (document.fonts && document.fonts.load) document.fonts.load('400 18px "SV Text"').catch(() => {});
    D.wps = $$(".wp");

    /* caps : pare-brise, flèches, liste */
    $(".dk-wps").addEventListener("click", e => {
      const b = e.target.closest(".wp"); if (!b) return;
      const i = +b.dataset.i;
      if (i === D.sel) engage(); else selectWp(i);
    });
    $(".dk-arrow.l").addEventListener("click", () => stepWp(-1));
    $(".dk-arrow.r").addEventListener("click", () => stepWp(1));
    const list = $(".mfd-nav .mlist");
    list.addEventListener("mouseover", e => { const a = e.target.closest(".mi"); if (a && +a.dataset.i !== D.sel) selectWp(+a.dataset.i); });
    list.addEventListener("focusin", e => { const a = e.target.closest(".mi"); if (a && +a.dataset.i !== D.sel) selectWp(+a.dataset.i, true); });
    list.addEventListener("click", e => {
      const a = e.target.closest(".mi"); if (!a || e.metaKey || e.ctrlKey) return;
      e.preventDefault(); selectWp(+a.dataset.i, true); engage();
    });
    $("#tgBody").addEventListener("click", e => { if (e.target.closest("[data-engage]")) { e.preventDefault(); engage(); } });
    $("#glClose").addEventListener("click", () => { Sfx.back(); location.hash = "#vol"; });
    $$(".gl-step").forEach(b => b.addEventListener("click", () => stepWp(+b.dataset.step)));
    $("#skipNav").addEventListener("click", () => {
      const t = D.open ? $("#panel") : ($(".mfd-nav .mi[aria-current]") || $(".dk-arrow.r"));
      t && t.focus();
    });

    /* glisser sur le pare-brise pour changer de cap */
    const wind = $(".dk-wind"); let sx0 = null;
    wind.addEventListener("pointerdown", e => { if (!e.target.closest("button,.mt")) { sx0 = e.clientX; D.push = true; } });
    wind.addEventListener("pointerup", e => { D.push = false; if (sx0 !== null && Math.abs(e.clientX - sx0) > 44) stepWp(e.clientX < sx0 ? 1 : -1); sx0 = null; });
    wind.addEventListener("pointercancel", () => { sx0 = null; D.push = false; });
    wind.addEventListener("pointerleave", () => { D.push = false; });
    /* molette ou pavé tactile : un cran = un cap. Dans une page du site officiel,
       seul le geste horizontal tourne, pour ne pas bloquer le défilement de la page. */
    let wAcc = 0, wLock = 0, wLast = 0;
    wind.addEventListener("wheel", e => {
      if (D.open) return;
      const horiz = Math.abs(e.deltaX) > Math.abs(e.deltaY);
      if (EMBED && !horiz) return;
      e.preventDefault();
      const now = performance.now();
      if (now < wLock) return;
      if (now - wLast > 240) wAcc = 0;
      wLast = now;
      wAcc += horiz ? e.deltaX : e.deltaY;
      if (Math.abs(wAcc) >= 50) { stepWp(wAcc > 0 ? 1 : -1); wAcc = 0; wLock = now + 420; }
    }, { passive: false });
    addEventListener("pointermove", e => {
      if (current !== "hq" || e.pointerType === "touch") return;
      D.mx = e.clientX / innerWidth - .5; D.my = e.clientY / innerHeight - .5;
      Holo.look(D.mx);
    });

    /* voix, micro, menu */
    $$(".vox", $("#hq")).forEach(b => b.addEventListener("click", toggleVoice));
    $$(".mic", $("#hq")).forEach(b => b.addEventListener("click", () => { if (Voice.listening) Voice.stop(); else talkStart(); }));
    $$(".cmdb", $("#hq")).forEach(b => b.addEventListener("click", openCmd));
    const cmd = $("#cmd"), cf = $("#cmd form"), ci = $("#cmdIn"), cl = $("#cmdList");
    cf.addEventListener("submit", e => { e.preventDefault(); cmdRun(CMD.sel); });
    ci.addEventListener("input", () => { CMD.sel = 0; cmdRender(); });
    ci.addEventListener("keydown", e => {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); cmdMove(e.key === "ArrowDown" ? 1 : -1); }
      else if (e.key === "Tab") { e.preventDefault(); cmdMove(e.shiftKey ? -1 : 1); }
      else if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); closeCmd(true); }
    });
    /* clic sur le fond : fermer ; clic dans la liste : garder le curseur dans le champ */
    cmd.addEventListener("mousedown", e => { if (e.target === cmd) closeCmd(true); else if (e.target !== ci) e.preventDefault(); });
    cl.addEventListener("click", e => { const li = e.target.closest("[role=option]"); if (li) cmdRun(+li.dataset.i); });
    cl.addEventListener("mousemove", e => {
      const li = e.target.closest("[role=option]");
      if (li && +li.dataset.i !== CMD.sel) { CMD.sel = +li.dataset.i; cmdPaint(); }
    });

    Holo.mount($("#holo"), S.media + "oracle-1.jpg");

    const fmt = new Intl.DateTimeFormat("fr-BE", { timeZone: "Europe/Brussels", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
    const clk = () => { const c = $("#clk"); if (c) c.textContent = fmt.format(new Date()); };
    clk(); setInterval(clk, 1000);
    selectWp(D.sel, true);
    D.hdg = WPH[D.sel];
  }

  function selectWp(i, silent) {
    D.sel = ((i % NW) + NW) % NW;
    const m = S.missions[D.sel];
    const act = document.activeElement, inNav = !!(act && act.classList && act.classList.contains("mi"));
    $$(".mfd-nav .mi").forEach((a, j) => {
      if (j !== D.sel) { a.removeAttribute("aria-current"); return; }
      a.setAttribute("aria-current", "true");
      if (inNav && a !== act) a.focus({ preventScroll: true });   /* le curseur clavier suit le cap choisi */
    });
    D.wps.forEach((b, j) => b.classList.toggle("sel", j === D.sel));
    $("#tgHdg").textContent = "CAP " + deg3(WPH[D.sel]);
    $("#tgBody").innerHTML =
      '<p class="tg-n">' + m.n + " / " + pad(NW) + ' <span class="jp">' + m.jp + "</span></p>" +
      '<h3 class="tg-l">' + esc(m.label) + '</h3><p class="tg-d">' + esc(m.desc) + "</p>" +
      '<div class="tg-acts"><a class="btn solid" data-engage href="#' + m.id + '">' + esc(S.deck.engage) + " <kbd>ENTRÉE</kbd></a>" + oracleA() + "</div>";
    $("#dkPrompt").textContent = "CAP " + deg3(WPH[D.sel]) + " · " + m.label + " · " + S.deck.prompt;
    if (!silent) { Sfx.turn(); D.settle = true; }
  }
  function stepWp(d) {
    selectWp(D.sel + d);
    if (D.open) location.hash = "#" + S.missions[D.sel].id;
  }
  function engage() {
    const m = S.missions[D.sel];
    coachDone();
    if (RM) { location.hash = "#" + m.id; return; }
    if (D.going) return;                                /* un seul départ à la fois */
    D.going = true; D.wpGo = true; D.boost = 1; D.warpT = .62; Sfx.warp(.6);
    copilot(S.deck.toward + " " + m.say + ".", true);
    later(() => { D.going = false; location.hash = "#" + m.id; }, 600);
  }
  function goCap(i) {
    selectWp(i, true);
    if (D.open) location.hash = "#" + S.missions[i].id; else engage();
  }

  /* aide de première visite : trois gestes, montrés une seule fois */
  function coachShow() {
    const el = $("#dkCoach");
    if (!el || store.get("sv8.coach") === "1") return;
    const C = S.deck.coach;
    el.innerHTML = (touch ? C.touch : C.keys).map(([a, b]) => "<span><b>" + esc(a) + "</b> " + esc(b) + "</span>").join('<i class="sep" aria-hidden="true">·</i>') +
      (tiltCan() && !TILT.on ? '<button type="button" class="alt" data-tilt>' + esc(S.deck.tilt.cta) + "</button>" : "") +
      '<button type="button" data-ok>' + esc(C.ok) + "</button>";
    el.hidden = false;
    $("[data-ok]", el).addEventListener("click", coachDone);
    const tb = $("[data-tilt]", el);
    if (tb) tb.addEventListener("click", () => { tiltOn(); coachDone(); });
  }
  function coachDone() {
    const el = $("#dkCoach");
    if (el && !el.hidden) { el.hidden = true; store.set("sv8.coach", "1"); }
  }

  /* le copilote écrit sa phrase, et la dit si la voix est active */
  let coIv = 0;
  function copilot(text, speak) {
    const el = $("#coLine"); if (!el) return;
    clearInterval(coIv);
    if (RM) el.textContent = text;
    else { let i = 0; coIv = setInterval(() => { i += 2; el.textContent = text.slice(0, i); if (i >= text.length) clearInterval(coIv); }, 20); }
    if (speak) Sfx.radio();
    if (speak && !Voice.speak(text)) { Holo.talk(true); setTimeout(() => Holo.talk(false), Math.min(4200, 600 + text.length * 45)); }
  }
  Voice.on_("talk", v => {
    Holo.talk(v); $("#snd").classList.toggle("talk", v);
    const s = $("#coState"); if (s && !Voice.listening) s.textContent = v ? S.deck.states.talk : S.deck.states.idle;
  });
  Voice.on_("voices", () => paintVoice());
  Voice.on_("listen", v => {
    $$(".mic").forEach(b => b.classList.toggle("on", v));
    const s = $("#coState"); if (s) s.textContent = v ? S.deck.states.listen : S.deck.states.idle;
    if (v) { const h = $("#coHeard"); if (h) h.textContent = "…"; Sfx.tick(); }
  });
  Voice.on_("heard", (txt, final) => {
    const h = $("#coHeard"); if (h) h.textContent = "« " + txt.trim() + " »";
    if (!final) return;
    if (current === "oracle") window.Oracle.hear(txt); else if (current === "hq") runIntent(txt);
  });
  Voice.on_("error", code => {
    if (current !== "hq") return;
    if (/not-allowed|service-not-allowed|indisponible/.test(code)) { copilot(S.deck.micDenied, false); openCmd(); }
  });

  function talkStart() {
    if (!Voice.canListen) { if (current === "hq") { copilot(S.deck.noMic, false); openCmd(); } return; }
    Voice.listen();
  }
  window.SVTalk = () => { if (Voice.listening) Voice.stop(); else talkStart(); };
  /* ---- son : un seul interrupteur, toujours visible, coupe les effets ET la voix ---- */
  function paintSound() {
    const b = $("#snd"), on = Sfx.on, L = S.sound, t = on ? L.off : L.on;
    b.dataset.on = on ? "1" : "0";
    b.title = on ? L.offTip : L.onTip;
    b.setAttribute("aria-label", on ? L.offTip : L.onTip);
    $(".lb", b).innerHTML = '<span class="v">' + esc(t[0]) + "</span>" + esc(t[1]);
    paintVoice();
  }
  function paintVoice() {
    const on = Voice.on && Sfx.on, any = Voice.voices().length > 0;
    $$(".vox").forEach(b => { b.setAttribute("aria-pressed", on); $("b", b).textContent = on ? "ON" : "OFF"; b.hidden = !any; });
  }
  function setSound(on, quiet) {
    if (on !== Sfx.on) Sfx.toggle(on);
    if (on && current === "hq") Sfx.hum(true);
    Voice.mute(!on);
    paintSound();
    if (!quiet) toast(on ? S.sound.toastOn : S.sound.toastOff);
  }
  function toggleSound() { setSound(!Sfx.on); }
  function toggleVoice() {
    if (!Voice.voices().length) { copilot(S.deck.voiceNone, false); return; }
    const want = !(Voice.on && Sfx.on);
    if (want && !Sfx.on) setSound(true, true);      /* demander la voix, c'est demander le son */
    Voice.toggle(want);
    paintVoice();
    toast(want ? S.deck.voiceOn : S.deck.voiceOff);
    if (want) copilot(S.deck.voiceHello, true);
  }

  /* ---- le menu : tout le site dans une liste filtrable (clavier, souris, doigt) ---- */
  const CMD = { items: [], sel: 0, mode: "main", opener: null };
  function cmdAll() {
    const M = S.deck.menu, out = [];
    if (CMD.mode === "voices") {
      out.push({ g: M.voices, label: "← " + M.voiceBack, keep: true, run: () => { CMD.mode = "main"; } });
      Voice.voices().forEach(v => out.push({
        g: M.voices, label: v.name, hint: v.lang + (v.current ? " · " + M.voiceCurrent : ""), keep: true,
        run: () => {
          Voice.choose(v.name);
          if (!Sfx.on) setSound(true, true);
          Voice.toggle(true); paintVoice();
          copilot(S.deck.voiceHello, true);
        }
      }));
      return out;
    }
    S.missions.forEach((m, i) => out.push({ g: M.caps, n: m.n, label: m.label, hint: m.sub, kw: m.say + " " + m.desc, run: () => goCap(i) }));
    out.push({ g: "Oracle", label: S.hud.oracle, hint: "Ton plan IA jusqu'en 2030", kw: "oracle plan prix tarif devis chiffrer 2030", run: oracleGo });
    if (D.open) out.push({ g: M.actions, label: M.back, kw: "fermer retour vol", run: () => { location.hash = "#vol"; } });
    out.push({ g: M.actions, label: Sfx.on ? M.soundOff : M.soundOn, kw: "son silence muet audio stop", run: toggleSound });
    if (Voice.voices().length) {
      out.push({ g: M.actions, label: (Voice.on && Sfx.on) ? M.voiceOff : M.voiceOn, kw: "voix parler copilote", run: toggleVoice });
      out.push({ g: M.actions, label: M.voicePick, hint: Voice.current, kw: "voix changer choisir", keep: true, run: () => { CMD.mode = "voices"; } });
    }
    VORDER.forEach(v => out.push({ g: M.vision, label: S.deck.vision.modes[v], hint: v === vision ? S.deck.vision.current : "", kw: "vision mode couleur " + v, run: () => setVision(v) }));
    if (tiltCan()) out.push({ g: M.actions, label: TILT.on ? S.deck.tilt.menuOff : S.deck.tilt.menuOn, kw: "gyroscope pencher incliner telephone", run: () => { if (TILT.on) tiltOff(); else tiltOn(); } });
    out.push({ g: M.actions, label: M.oath, kw: "serment nightwatch", run: () => go("#serment") });
    out.push({ g: M.actions, label: M.title, kw: "accueil titre debut entree", run: () => go("#") });
    if (S.home && S.home.url) out.push({ g: M.actions, label: S.home.label + " ↗", kw: "site officiel studio", run: () => { window.open(S.home.url, "_top"); } });
    return out;
  }
  function cmdRender() {
    const ci = $("#cmdIn"), raw = ci.value.trim(), q = Voice.norm(raw), all = cmdAll();
    let items = q ? all.filter(it => Voice.norm([it.n, it.label, it.hint, it.kw].filter(Boolean).join(" ")).includes(q)) : all;
    if (q && !items.length && CMD.mode === "main") items = [{ g: S.deck.menu.actions, label: S.deck.menu.ask + " : « " + raw + " »", run: () => runIntent(raw) }];
    CMD.items = items;
    if (CMD.sel >= items.length) CMD.sel = 0;
    let g = null, html = "";
    items.forEach((it, i) => {
      if (it.g !== g) { g = it.g; html += '<li class="cg" role="presentation">' + esc(g) + "</li>"; }
      html += '<li role="option" id="cmdO' + i + '" data-i="' + i + '">' + (it.n ? '<span class="n">' + it.n + "</span>" : "") +
        "<span>" + esc(it.label) + "</span>" + (it.hint ? "<small>" + esc(it.hint) + "</small>" : "") + "</li>";
    });
    $("#cmdList").innerHTML = html;
    cmdPaint(true);
  }
  function cmdPaint(scroll) {
    $$("#cmdList [role=option]").forEach((li, i) => {
      li.setAttribute("aria-selected", i === CMD.sel);
      if (scroll && i === CMD.sel) li.scrollIntoView({ block: "nearest" });
    });
    $("#cmdIn").setAttribute("aria-activedescendant", CMD.items.length ? "cmdO" + CMD.sel : "");
  }
  function cmdMove(d) { const n = CMD.items.length; if (!n) return; CMD.sel = (CMD.sel + d + n) % n; cmdPaint(true); Sfx.move(); }
  function cmdRun(i) {
    const it = CMD.items[i]; if (!it) return;
    if (it.keep) {                                   /* reste ouvert : sous-menu des voix, essai d'une voix */
      const mode = CMD.mode; it.run();
      if (CMD.mode !== mode) { CMD.sel = 0; $("#cmdIn").value = ""; }
      cmdRender(); return;
    }
    closeCmd(); Sfx.select(); it.run();
  }
  function openCmd() {
    const c = $("#cmd");
    if (!c.firstChild || current !== "hq" || !$("#dossier").hidden) return;
    CMD.mode = "main"; CMD.sel = 0; CMD.opener = document.activeElement;
    c.hidden = false;
    const i = $("#cmdIn"); i.value = ""; cmdRender();
    (touch ? $(".cmd-box", c) : i).focus({ preventScroll: true });   /* au doigt : pas de clavier qui masque la liste */
    visPaint();
  }
  function closeCmd(restore) {
    const c = $("#cmd"); if (!c || c.hidden) return;
    c.hidden = true;
    visPaint();
    if (restore && CMD.opener && CMD.opener.isConnected && CMD.opener !== document.body) CMD.opener.focus({ preventScroll: true });
  }

  function runIntent(txt) {
    const it = Voice.intent(txt);
    const h = $("#coHeard"); if (h) h.textContent = "« " + String(txt).trim() + " »";
    if (it.type === "mission") {
      const i = S.missions.findIndex(m => m.id === it.id);
      selectWp(i, true);
      if (D.open) location.hash = "#" + it.id; else engage();
    } else if (it.type === "oracle") oracleGo();
    else if (it.type === "back") { if (D.open) { Sfx.back(); location.hash = "#vol"; } else copilot(S.deck.inFlight, true); }
    else if (it.type === "next") stepWp(1);
    else if (it.type === "prev") stepWp(-1);
    else if (it.type === "engage") { if (!D.open) engage(); }
    else if (it.type === "vis") setVision(it.id);
    else if (it.type === "meteor") {
      const m = MET.list.slice().sort((a, b) => Math.abs(a.t - .5) - Math.abs(b.t - .5))[0];
      if (m) { if (RM) location.hash = m.it.href; else metFly(m); } else copilot(S.deck.meteor.none, true);
    }
    else if (it.type === "mute") setSound(false);
    else if (it.type === "help") { copilot(S.deck.help, true); openCmd(); }
    else copilot(S.deck.unknown, true);
  }

  /* ---- météorites : les visuels traversent le pare-brise en nuage de points ---- */
  const MET = { list: [], next: 0, last: 0, items: null, told: false };
  function metItems() {
    if (!MET.items) {
      const M = S.meteors || {};
      MET.items = (M.items && M.items.length) ? M.items
        : S.operations.list.map(p => ({ src: S.img + p.k + ".jpg", label: p.lab, href: "#op-" + p.k }));
    }
    return MET.items;
  }
  /* poussière en deux bras de spirale autour du visuel : l'effet galaxie */
  function metDust(n) {
    const out = [];
    for (let i = 0; i < n; i++) {
      const r = .58 + Math.pow(Math.random(), .7) * .75;
      out.push([r, (i % 2 ? Math.PI : 0) + r * 3.4 + (Math.random() - .5) * .9]);
    }
    return out;
  }
  function metSpawn(now) {
    const items = metItems(), it = items[MET.next % items.length];
    MET.next++; MET.last = now;
    FX.cloud(it.src, 1100).then(c => {
      if (current !== "hq" || D.open) return;
      const left = MET.next % 2 === 0, lane = (MET.next % 3) / 3, el = document.createElement("a");   /* côtés alternés, trois couloirs */
      el.className = "mt"; el.href = it.href; el.tabIndex = -1;
      el.setAttribute("aria-label", it.label + " — " + S.deck.meteor.hint);
      el.innerHTML = '<img src="' + esc(it.src) + '" alt=""><span><b>' + esc(it.label) + "</b>" + esc(S.deck.meteor.hint) + "</span>";
      /* profondeur : 0 = loin (petit, lent, pâle), 1 = près (grand, rapide). Un sur quatre est un bolide. */
      const z = Math.random(), fast = Math.random() < .26;
      const m = { it, c, el, t: 0, z, fast, hover: false, fly: 0, x: 0, y: 0, w: 0,
        dur: fast ? 5 + Math.random() * 2.5 : 24 - z * 11 + Math.random() * 5,
        x0: left ? -.18 : 1.18, x1: left ? 1.18 : -.18, y0: .12 + lane * .2 + Math.random() * .06, y1: .18 + (1 - lane) * .32 + Math.random() * .06,
        s0: .26 + z * .3, s1: .5 + z * .72, rot: (Math.random() - .5) * .3, spin: (Math.random() - .5) * (fast ? .5 : .14),
        dust: metDust(22 + Math.round(z * 30)), dsp: (Math.random() < .5 ? -1 : 1) * (.12 + Math.random() * .2) };
      el.addEventListener("mouseenter", () => { m.hover = true; Sfx.ping(); });
      el.addEventListener("mouseleave", () => { m.hover = false; });
      el.addEventListener("focus", () => { m.hover = true; });
      el.addEventListener("blur", () => { m.hover = false; });
      el.addEventListener("click", e => {
        if (e.metaKey || e.ctrlKey || RM) { Sfx.select(); return; }
        e.preventDefault();
        metFly(m);
      });
      $(".dk-mets").appendChild(el);
      MET.list.push(m);
      MET.list.sort((a, b) => a.z - b.z);                 /* les plus lointains dessinés d'abord */
      if (!MET.told) { MET.told = true; later(() => { if (current === "hq" && !D.open) copilot(S.deck.meteor.intro, false); }, 5200); }
    }).catch(() => {});
  }
  /* on fonce vers le visuel choisi : il grossit jusqu'à nous, puis son dossier s'ouvre */
  function metFly(m) {
    if (m.fly || D.going) return;
    D.going = true; m.fly = performance.now(); m.fx = m.x; m.fy = m.y; m.fw = m.w;
    m.el.classList.add("fly");
    D.warpT = .6; Sfx.select(); Sfx.warp(.55);
  }
  function metClear() { MET.list.forEach(m => m.el.remove()); MET.list = []; }
  function metTick(dt, g, W, H, ink) {
    const now = performance.now();
    if (D.open) { if (MET.list.length) metClear(); return; }
    if (!RM && !D.going && MET.list.length < 5 && now - MET.last > (MET.list.length ? 2600 + MET.list.length * 700 : 1800)) metSpawn(now);
    const base = Math.max(Math.min(W * .2, H * .46), Math.min(W * .4, 150)), pal = VISION[vision].m5;
    for (let i = 0; i < MET.list.length; i++) {
      const m = MET.list[i];
      let x, y, w, fade;
      if (m.fly) {
        const p = Math.min(1, (now - m.fly) / 560), e = p * p;
        if (p >= 1) { D.going = false; location.hash = m.it.href; return; }
        x = m.fx + (W / 2 - m.fx) * e; y = m.fy + (H * (D.hz || .5) - m.fy) * e; w = m.fw * (1 + e * 4.2);
        fade = 1 - Math.max(0, (p - .72) / .28);
      } else {
        m.t += dt / m.dur * (m.hover ? .08 : 1);
        if (m.t >= 1) { m.el.remove(); MET.list.splice(i, 1); i--; continue; }
        const e = m.t;
        x = (m.x0 + (m.x1 - m.x0) * e) * W; y = (m.y0 + (m.y1 - m.y0) * e) * H;
        w = base * (m.s0 + (m.s1 - m.s0) * e);
        fade = Math.max(0, Math.min(1, e / .06, (1 - e) / .06)) * (.5 + m.z * .5);
        m.rot += m.spin * dt;
      }
      m.x = x; m.y = y; m.w = w;
      const h = w * m.c.ratio;
      const vx = (m.x1 - m.x0) * W, vy = (m.y1 - m.y0) * H, vl = Math.hypot(vx, vy) || 1, ux = vx / vl, uy = vy / vl;
      /* traîne : quelques filets derrière le visuel, plus longs pour les bolides */
      g.strokeStyle = "rgba(" + ink + "," + (.2 * fade).toFixed(3) + ")";
      g.beginPath();
      for (let k = -2; k <= 2; k++) {
        const ox = -uy * k * h * .2, oy = ux * k * h * .2, len = w * (.45 + ((k + 2) % 2) * .5) * (m.fast ? 2.4 : 1);
        g.moveTo(x - ux * w * .56 + ox, y - uy * w * .56 + oy);
        g.lineTo(x - ux * (w * .56 + len) + ox, y - uy * (w * .56 + len) + oy);
      }
      g.stroke();
      const cs = Math.cos(m.rot), sn = Math.sin(m.rot), pts = m.c.pts, a0 = (m.hover && !m.fly ? .18 : 1) * fade;
      /* poussière de galaxie : deux bras qui tournent lentement autour du visuel */
      g.fillStyle = "rgba(" + (pal ? pal[1] : ink) + "," + (.5 * a0).toFixed(2) + ")";
      const da = now / 1000 * m.dsp;
      for (let j = 0; j < m.dust.length; j++) {
        const d = m.dust[j], px = Math.cos(d[1] + da) * d[0] * w * .62, py = Math.sin(d[1] + da) * d[0] * w * .3;
        g.fillRect(x + px * cs - py * sn, y + px * sn + py * cs, 1.2, 1.2);
      }
      let bucket = -1;
      for (let j = 0; j < pts.length; j++) {
        const p = pts[j], b = (p[2] * 5) | 0;
        if (b !== bucket) { bucket = b; g.fillStyle = "rgba(" + (pal ? pal[Math.min(4, b)] : ink) + "," + Math.min(1, a0 * (.22 + b * .19)).toFixed(2) + ")"; }
        const px = p[0] * w, py = p[1] * w;
        g.fillRect(x + px * cs - py * sn, y + px * sn + py * cs, 1.5, 1.5);
      }
      const st = m.el.style;
      st.width = w.toFixed(1) + "px"; st.height = h.toFixed(1) + "px"; st.opacity = fade.toFixed(2);
      st.transform = "translate(" + (x - w / 2).toFixed(1) + "px," + (y - h / 2).toFixed(1) + "px) rotate(" + m.rot.toFixed(3) + "rad)";
    }
  }

  function deckSize() {
    const w = $(".dk-wind"), c = $("#hud"); if (!w || !c) return;
    const r = w.getBoundingClientRect();
    D.dpr = Math.min(2, window.devicePixelRatio || 1);
    D.W = r.width; D.H = r.height; D.top = r.top;
    D.hz = r.height < 300 ? .62 : .5;                 /* pare-brise bas : l'horizon descend pour laisser la place au ruban de cap */
    c.width = Math.round(r.width * D.dpr); c.height = Math.round(r.height * D.dpr);
    D.hud = c.getContext("2d");
    Holo.fit();
  }
  addEventListener("resize", () => { if (current === "hq") { deckSize(); deckTick(0); } });

  function deckLoop(t) {
    if (current !== "hq") { D.raf = 0; return; }
    D.raf = requestAnimationFrame(deckLoop);
    if (document.hidden) return;
    const dt = Math.min(.1, (t - D.last) / 1000 || 0);
    if (D.last && t - D.last < 30) return;
    D.last = t;
    deckTick(dt);
  }
  function deckTick(dt) {
    D.dt = dt;
    const tilt = TILT.on && TILT.seen && !RM;
    /* pilotage en penchant le téléphone : le roulis fait tourner l'appareil, et le cap le plus proche se sélectionne */
    D.free = false;
    if (tilt && !D.open && !D.going) {
      const r = TILT.roll, dz = 7;
      if (Math.abs(r) > dz) {
        D.free = true;
        D.hdg = (D.hdg + Math.sign(r) * (Math.abs(r) - dz) * 3.2 * dt + 360) % 360;
        let best = D.sel, bd = 999;
        WPH.forEach((w, i) => { const a = Math.abs(adiff(w, D.hdg)); if (a < bd) { bd = a; best = i; } });
        if (best !== D.sel) selectWp(best);
      }
    }
    const d = adiff(WPH[D.sel], D.hdg);
    if (RM) { D.hdg = WPH[D.sel]; D.roll = 0; D.pitch = 0; }
    else {
      if (!D.free) D.hdg = (D.hdg + d * Math.min(1, dt * 3) + 360) % 360;
      const rollT = tilt ? Math.max(-34, Math.min(34, TILT.roll * .9)) : Math.max(-26, Math.min(26, d * .7)) - D.mx * 5;
      D.roll += (rollT - D.roll) * Math.min(1, dt * (tilt ? 7 : 4.5));
      D.pitch += ((tilt ? -TILT.pitch * 1.6 : D.my * 16) - D.pitch) * Math.min(1, dt * 4);
      /* cap atteint : un double bip, une seule fois */
      if (D.settle && !D.free && Math.abs(d) < .8) { D.settle = false; if (!D.open) Sfx.lock(); }
    }
    D.boost = Math.max(0, D.boost - dt * 1.1);
    if (D.push && !D.open) D.boost = Math.min(1, D.boost + dt * 3.2);     /* doigt ou clic maintenu sur le pare-brise : poussée */
    /* voyage : l'intensité monte tant que le compte à rebours court, puis retombe */
    if (D.warpT > 0) { D.warpT -= dt; D.warp += (1 - D.warp) * Math.min(1, dt * 7); }
    else D.warp = Math.max(0, D.warp - dt * 2.4);
    const speed = (D.open ? .22 : .55) + D.boost * 3.2 + D.warp * 6;
    Terrain.cam.yaw = D.hdg * Math.PI / 180;
    Terrain.cam.roll = -D.roll * Math.PI / 180;
    Terrain.cam.pitch = D.pitch;
    Terrain.set({ horizonPx: D.top + D.H * (D.hz || .5), speed, alpha: D.open ? .45 : 1 });
    Sfx.humSet(speed, D.roll);
    drawHud();
  }


  function drawHud() {
    const g = D.hud, W = D.W, H = D.H; if (!g || !W) return;
    const ink = VISION[vision].ink;
    const c = a => "rgba(" + ink + "," + a + ")";
    const mono = "10.5px " + FONT_MONO, hudF = s => "400 " + s + "px " + FONT_HUD;
    g.setTransform(D.dpr, 0, 0, D.dpr, 0, 0);
    g.clearRect(0, 0, W, H);
    const cx = W / 2, my = H * (D.hz || .5), cy = my + D.pitch, ppd = W / 84, pd = H < 300 ? 4.5 : 8;
    g.lineWidth = 1; g.textBaseline = "middle";

    /* horizon et échelle de tangage, inclinés avec l'appareil */
    g.save(); g.translate(cx, cy); g.rotate(-D.roll * Math.PI / 180);
    g.strokeStyle = c(.5);
    g.beginPath(); g.moveTo(-W, 0); g.lineTo(-74, 0); g.moveTo(74, 0); g.lineTo(W, 0); g.stroke();
    g.font = mono; g.fillStyle = c(.6);
    for (const p of [-10, -5, 5, 10]) {
      const y = -p * pd, l = p % 10 === 0 ? 62 : 32;
      g.setLineDash(p < 0 ? [6, 5] : []);
      g.beginPath(); g.moveTo(-l - 44, y); g.lineTo(-44, y); g.moveTo(44, y); g.lineTo(l + 44, y); g.stroke();
      if (p % 10 === 0) { g.textAlign = "right"; g.fillText(String(Math.abs(p)), -l - 52, y); g.textAlign = "left"; g.fillText(String(Math.abs(p)), l + 52, y); }
    }
    g.setLineDash([]); g.restore();

    /* voyage : des filets de vitesse partent du point de fuite et s'allongent */
    const wk = Math.max(D.warp, D.boost * .5);
    if (wk > .02) {
      if (!D.streaks) D.streaks = Array.from({ length: 110 }, () => ({ a: Math.random() * Math.PI * 2, p: Math.random(), v: .5 + Math.random() * 1.1 }));
      const R = Math.hypot(W, H) * .56;
      g.lineWidth = 1.2;
      for (const s of D.streaks) {
        s.p += (D.dt || 0) * s.v * (.5 + wk * 2.6);
        if (s.p > 1) { s.p -= 1; s.a = Math.random() * Math.PI * 2; }
        const r0 = (.05 + s.p * s.p) * R, r1 = r0 + (10 + 240 * wk) * (.25 + s.p), ca = Math.cos(s.a), sa = Math.sin(s.a);
        g.strokeStyle = c((wk * Math.min(1, s.p * 2.5) * .85).toFixed(3));
        g.beginPath(); g.moveTo(cx + ca * r0, my + sa * r0); g.lineTo(cx + ca * r1, my + sa * r1); g.stroke();
      }
      g.lineWidth = 1;
    }

    /* vecteur vitesse, fixe au centre */
    g.strokeStyle = c(.95); g.lineWidth = 1.4;
    g.beginPath(); g.arc(cx, my, 7, 0, Math.PI * 2);
    g.moveTo(cx - 26, my); g.lineTo(cx - 7, my); g.moveTo(cx + 7, my); g.lineTo(cx + 26, my); g.moveTo(cx, my - 7); g.lineTo(cx, my - 16);
    g.stroke(); g.lineWidth = 1;

    /* ruban de cap */
    const ty = 46;
    g.strokeStyle = c(.5); g.fillStyle = c(.78); g.textAlign = "center"; g.font = mono;
    const h0 = Math.floor((D.hdg - 44) / 5) * 5;
    for (let a = h0; a <= D.hdg + 44; a += 5) {
      const x = cx + (a - D.hdg) * ppd, k = 1 - Math.min(1, Math.abs(a - D.hdg) / 44);
      const aa = ((a % 360) + 360) % 360;
      g.globalAlpha = Math.pow(k, .6);
      g.beginPath(); g.moveTo(x, ty); g.lineTo(x, ty + (aa % 10 === 0 ? 10 : 5)); g.stroke();
      if (aa % 30 === 0) g.fillText(aa === 0 ? "N" : aa === 90 ? "E" : aa === 180 ? "S" : aa === 270 ? "O" : String(aa).padStart(3, "0"), x, ty + 22);
    }
    g.globalAlpha = 1;
    WPH.forEach((w, i) => {
      const dd = adiff(w, D.hdg); if (Math.abs(dd) > 44) return;
      const x = cx + dd * ppd;
      g.fillStyle = i === D.sel ? c(1) : c(.4);
      g.beginPath(); g.moveTo(x, ty - 2); g.lineTo(x - 5, ty - 10); g.lineTo(x + 5, ty - 10); g.closePath(); g.fill();
    });
    g.fillStyle = "rgba(0,0,0,.72)"; g.strokeStyle = c(.8);
    g.beginPath(); g.rect(cx - 36, 6, 72, 26); g.fill(); g.stroke();
    g.fillStyle = c(1); g.font = hudF(18); g.fillText(deg3(D.hdg), cx, 20);

    /* rubans de vitesse et d'altitude : valeurs du simulateur de vol, pas des chiffres du studio */
    if (W > 720) {
      const tape = (x, label, val, unit, right) => {
        g.strokeStyle = c(.3); g.beginPath(); g.moveTo(x, my - 72); g.lineTo(x, my + 72); g.stroke();
        const off = (val % 10) / 10 * 14;
        g.strokeStyle = c(.5);
        for (let i = -5; i <= 5; i++) { const yy = my + i * 14 + off; if (Math.abs(yy - my) > 72) continue; g.beginPath(); g.moveTo(x, yy); g.lineTo(x + (right ? -8 : 8), yy); g.stroke(); }
        const bx = right ? x - 84 : x + 14;
        g.fillStyle = "rgba(0,0,0,.72)"; g.strokeStyle = c(.8);
        g.beginPath(); g.rect(bx, my - 15, 70, 30); g.fill(); g.stroke();
        g.fillStyle = c(1); g.font = hudF(19); g.textAlign = "center"; g.fillText(String(Math.round(val)), bx + 35, my + 1);
        g.font = mono; g.fillStyle = c(.55); g.fillText(label, bx + 35, my - 28); g.fillText(unit, bx + 35, my + 28);
      };
      tape(Math.max(46, W * .07), "VIT", 190 + Terrain.speed * 140, "KT", false);
      tape(W - Math.max(46, W * .07), "ALT", 220 + Terrain.alt * 120, "M", true);
    }

    metTick(D.dt || 0, g, W, H, ink);

    /* balises des caps dans le pare-brise */
    const wy = cy - (H < 300 ? 40 : 50);
    for (let i = 0; i < D.wps.length; i++) {
      const b = D.wps[i], dd = adiff(WPH[i], D.hdg), vis = Math.abs(dd) < 42;
      if (b.hidden === vis) b.hidden = !vis;
      if (vis) {
        const go = i === D.sel && D.wpGo && D.warp > .02;     /* le cap engagé grossit : on fonce dessus */
        b.style.transform = "translate(" + (cx + dd * ppd).toFixed(1) + "px," + wy.toFixed(1) + "px) translate(-50%,-50%)" + (go ? " scale(" + (1 + D.warp * D.warp * 4).toFixed(2) + ")" : "");
        b.style.opacity = go ? (1 - D.warp * .85).toFixed(2) : "";
      }
    }
  }

  /* gabarits communs */
  const head = (m, title, sub) =>
    '<header class="sec-head"><p class="sec-label"><span>[' + m.n + "/07] — " + esc(m.label) + '</span><span class="jp">' + m.jp + "</span></p>" +
    '<h1 class="sec-title" data-decode>' + esc(title) + "</h1>" + (sub ? '<p class="sec-sub">' + T(sub) + "</p>" : "") + "</header>";
  const oracleA = cls => '<a class="btn-oracle ' + (cls || "") + '" data-oracle href="' + esc(S.oracleUrl) + '"><i></i>' + esc(S.hud.oracle) + "</a>";
  const nextBlock = idx => {
    const n = S.missions[(idx + 1) % S.missions.length];
    return '<nav class="next" aria-label="Suite"><a class="btn solid" href="#' + n.id + '">Cap suivant — ' + n.n + " " + esc(n.label) + "</a>" + oracleA() + "</nav>";
  };
  const footer = () => {
    const L = S.liaison, F = S.footer;
    return '<footer class="pfoot"><div><b class="sv-name">Studio Visions<sup>®</sup></b><p>' + esc(F.line) + "</p></div>" +
      '<div><a href="mailto:' + L.email + '">' + L.email + '</a><br><a href="tel:' + L.phoneHref + '">' + L.phone + "</a><br>La Roche-en-Ardenne, Belgique</div>" +
      '<p class="copy">' + esc(F.copy) + '</p><p class="copy sign">' + sig() + (homeA() ? " · " + homeA() : "") + "</p></footer>";
  };

  /* ---------------------------------------------------------------- MISSIONS */
  const BUILD = {
    briefing(m) {
      const b = S.briefing, a = b.agent;
      return head(m, b.title) +
        '<p class="lead">' + T(b.text) + "</p>" +
        '<blockquote class="quote"><p>' + T(b.quote) + "</p><cite>" + esc(b.sign) + "</cite></blockquote>" +
        '<h2 class="h3">ÉTAT DES FORCES</h2>' +
        '<div class="stats">' + b.stats.map(s =>
          '<div class="stat"><div class="v">' + esc(s.v) + (s.u ? "<small>" + esc(s.u) + "</small>" : "") + '</div><div class="l">' + esc(s.l) + '</div><div class="gauge"><i></i></div></div>').join("") + "</div>" +
        '<h2 class="h3">' + esc(a.code) + "</h2>" +
        '<article class="dossier-agent"><div class="ph"><img src="' + S.img + a.img + '" alt="' + esc(a.alt) + '" loading="lazy"></div>' +
          '<div class="meta"><span class="code">DOSSIER 001 — ' + esc(a.code) + '</span><span class="nm">' + esc(a.name) + '</span><span class="rl">' + esc(a.role) + "</span><p>" + esc(a.text) + "</p>" +
          "<dl><dt>BASE</dt><dd>La Roche-en-Ardenne</dd><dt>RELAIS</dt><dd>Bruxelles</dd><dt>UNITÉ</dt><dd>Studio Visions</dd><dt>CANAL</dt><dd>" + S.liaison.email + "</dd></dl></div></article>" +
        '<h2 class="h3">UNITÉS DE L\'ÉCOSYSTÈME NIGHT WATCH FORCES</h2>' +
        '<div class="units">' + b.units.map(u =>
          '<div class="unit brk"><div class="ins"><span>' + esc(u.n) + "</span></div><h4>" + esc(u.name) + "</h4><p>" + esc(u.l) + "</p></div>").join("") + "</div>" +
        '<h2 class="h3">' + esc(b.alliesLabel) + "</h2>" +
        '<p class="lead">' + esc(b.alliesLine) + '</p><div class="allies">' + b.allies.map(x => "<span>" + T(x) + "</span>").join("") + "</div>";
    },

    arsenal(m) {
      const A = S.arsenal;
      return head(m, A.title, A.sub) +
        '<div class="ars"><div class="slots" role="tablist" aria-label="Familles de services">' + A.families.map((f, i) =>
          '<button type="button" class="slot" role="tab" id="slot' + i + '" data-i="' + i + '" aria-selected="' + (i === 0) + '" aria-controls="adetail" tabindex="' + (i === 0 ? 0 : -1) + '">' +
          '<span class="sn"><span>[' + f.n + ']</span><span class="lv" aria-hidden="true"><i></i><i></i><i></i></span></span>' +
          '<span class="nm">' + esc(f.name) + '</span><span class="ln">' + esc(f.line) + "</span></button>").join("") + "</div>" +
        '<div class="adetail" id="adetail" role="tabpanel" aria-labelledby="slot0"></div></div>' +
        '<h2 class="h3">NIVEAUX DE QUALITÉ — CHAQUE BRIQUE EN TROIS</h2>' +
        '<div class="levels">' + A.levels.map((l, i) =>
          '<div class="lvl"><div class="meter" aria-hidden="true">' + [0, 1, 2].map(j => '<i class="' + (j <= i ? "on" : "") + '"></i>').join("") + "</div>" +
          "<small>NIVEAU " + l.n + "</small><b>" + esc(l.name) + "</b><p>" + esc(l.l) + "</p></div>").join("") + "</div>" +
        '<p class="lnote">' + esc(A.levelsNote) + "</p>";
    },

    operations(m) {
      const O = S.operations;
      return head(m, O.title, O.sub) +
        '<div class="ops">' + O.list.map((p, i) =>
          '<a class="op" href="#op-' + p.k + '" data-k="' + p.k + '">' +
          '<img src="' + S.img + p.k + '.jpg" alt="' + esc(p.alt) + '" loading="lazy" decoding="async">' +
          '<span class="ret brk" aria-hidden="true"></span>' +
          '<span class="top" aria-hidden="true"><span class="rec"><i></i>OP-' + pad(i + 1) + "</span><span>" + esc(p.year) + "</span></span>" +
          '<span class="open" aria-hidden="true">OUVRIR LE DOSSIER</span>' +
          '<span class="bot"><b>' + esc(p.lab) + "</b><small>" + esc(p.role) + "</small></span></a>").join("") + "</div>" +
        '<p class="opnote">' + T(O.note) + "</p>";
    },

    terrains(m) {
      const Z = S.terrains;
      return head(m, Z.title, Z.sub) +
        '<div class="terr"><div class="map" id="map" aria-hidden="true">' + contours() +
          '<span class="scan"></span><span class="coords tl">SECTEURS — GRILLE 10 × 10</span><span class="coords br">50°11′N 05°34′E</span>' +
          Z.zones.map((z, i) => '<button type="button" tabindex="-1" class="zone' + (z.x > 58 ? " l" : "") + '" data-z="' + i + '" aria-pressed="' + (i === 0) + '" style="left:' + z.x + "%;top:" + z.y + '%"><i><b>' + z.z + "</b></i><span>" + esc(z.name) + "</span></button>").join("") +
        "</div>" +
        '<div class="zlist">' + Z.zones.map((z, i) =>
          '<button type="button" class="zitem" data-z="' + i + '" aria-pressed="' + (i === 0) + '"><span class="zz">' + z.z + "</span><b>" + esc(z.name) + "</b><p>" + esc(z.t) + "</p></button>").join("") +
        "</div></div>";
    },

    protocole(m) {
      const P = S.protocole;
      return head(m, P.title) +
        '<div class="steps" id="steps">' + P.steps.map(s =>
          '<div class="step"><div class="ph">PHASE ' + s.n + '</div><div class="node" aria-hidden="true"></div><b>' + esc(s.name) + "</b><p>" + esc(s.t) + "</p></div>").join("") + "</div>" +
        '<h2 class="h3">' + esc(P.compareLabel) + "</h2>" +
        '<h2 class="sec-title sm" data-decode>' + esc(P.compareTitle) + '</h2><p class="sec-sub">' + esc(P.compareSub) + "</p>" +
        '<table class="cmp"><thead><tr><th scope="col">' + P.cols[0] + '</th><th scope="col" class="sv">' + P.cols[1] + "</th><th scope=\"col\">" + P.cols[2] + "</th></tr></thead><tbody>" +
        P.rows.map(r => '<tr><td>' + esc(r[0]) + '</td><td class="sv">' + esc(r[1]) + '</td><td class="ag">' + esc(r[2]) + "</td></tr>").join("") +
        "</tbody></table>";
    },

    renseignement(m) {
      const R = S.renseignement;
      return head(m, R.title, R.sub) +
        R.articles.map((a, i) =>
          '<details class="intel"><summary><span class="ic">INTERCEPTION ' + pad(i + 1) + " — <em>" + esc(a.cat) + "</em> — " + T(a.date) + "</span>" +
          '<span class="it">' + esc(a.title) + '</span><p class="ichap">' + esc(a.chapo) + '</p><span class="pm" aria-hidden="true"></span></summary>' +
          '<div class="ibody">' + a.body.map(p => "<p>" + T(p) + "</p>").join("") + "</div></details>").join("") +
        '<h2 class="h3">' + esc(R.faqLabel) + "</h2>" +
        '<h2 class="sec-title sm" data-decode>' + esc(R.faqTitle) + "</h2>" +
        '<div class="faq">' + R.faq.map(q =>
          '<details class="qa"><summary><b>' + esc(q[0]) + '</b><span class="pm" aria-hidden="true"></span></summary><p>' + T(q[1]) + "</p></details>").join("") + "</div>";
    },

    liaison(m) {
      const L = S.liaison, F = L.form;
      const fld = (n, lab, type, ac, cls, req) =>
        '<div class="fld ' + (cls || "") + '"><label for="f_' + n + '">' + esc(lab) + "</label>" +
        (type === "textarea" ? '<textarea id="f_' + n + '" name="' + n + '"' + (req ? " required" : "") + "></textarea>"
          : type === "select" ? '<select id="f_' + n + '" name="' + n + '"><option value="">—</option>' + F.budgets.map(b => "<option>" + esc(b) + "</option>").join("") + "</select>"
          : '<input id="f_' + n + '" name="' + n + '" type="' + type + '"' + (ac ? ' autocomplete="' + ac + '"' : "") + (req ? " required" : "") + ">") + "</div>";
      return head(m, L.title, L.sub) +
        '<div class="lia"><form class="form" id="lform" novalidate><p class="ft"><span>CANAL SÉCURISÉ — FORMULAIRE</span><b id="fready">PRÊT</b></p>' +
          '<div class="fgrid">' +
            fld("name", F.name, "text", "name", "", true) + fld("company", F.company, "text", "organization") +
            fld("email", F.email, "email", "email", "", true) + fld("phone", F.phone, "tel", "tel") +
            fld("what", F.what, "textarea", "", "full", true) +
            fld("budget", F.budget, "select") + fld("delay", F.delay, "text") +
          "</div>" +
          '<input class="hp" name="hp" tabindex="-1" autocomplete="off" aria-hidden="true">' +
          '<div class="fact"><button class="btn solid" type="submit">' + esc(F.send) + '</button><p class="fstat" id="fstat" role="status"></p></div>' +
        "</form>" +
        '<aside class="direct"><div class="row"><small>' + esc(L.directLabel) + '</small><div class="wave" aria-hidden="true">' +
          Array.from({ length: 24 }, (_, i) => '<i style="animation-delay:-' + ((i * 137) % 1100) + 'ms"></i>').join("") + "</div>" +
          '<div class="freq"><a href="tel:' + L.phoneHref + '">' + L.phone + "</a></div></div>" +
          '<div class="row"><small>EMAIL</small><a class="em" href="mailto:' + L.email + '">' + L.email + "</a></div>" +
          '<div class="row"><small>BASE</small><p>' + esc(L.place) + "</p></div>" +
          '<div class="row">' + oracleA("big") + "</div></aside></div>" +
        '<div class="final"><p>' + esc(L.final) + "</p>" + oracleA("big") + "</div>";
    }
  };

  const BIND = {
    arsenal(pin) {
      const slots = $$(".slot", pin);
      const sel = (i, focus) => {
        slots.forEach((s, j) => { s.setAttribute("aria-selected", j === i); s.tabIndex = j === i ? 0 : -1; });
        if (focus) slots[i].focus();
        const f = S.arsenal.families[i], d = $("#adetail");
        d.setAttribute("aria-labelledby", "slot" + i);
        d.innerHTML =
          '<div class="ad-top"><span>FAMILLE ' + f.n + "/6</span><span>EXEMPLES DE BRIQUES</span></div>" +
          "<h3>" + esc(f.name) + '</h3><p class="tag">' + esc(f.line) + '</p><p class="intro">' + esc(f.intro) + "</p>" +
          "<h4>BRIQUES</h4><ul>" + f.items.map((x, j) => "<li><span>" + pad(j + 1) + "</span>" + esc(x) + "</li>").join("") + "</ul>" +
          '<h4>POUR QUI</h4><div class="who">' + f.who.map(w => "<span>" + esc(w) + "</span>").join("") + "</div>" +
          '<div class="acts">' + oracleA() + '<a class="btn" href="#operations">Voir les opérations</a></div>';
        d.classList.remove("swap"); void d.offsetWidth; d.classList.add("swap");
      };
      slots.forEach((s, i) => {
        s.addEventListener("click", () => { sel(i); Sfx.select(); if (innerWidth <= 1100) $("#adetail").scrollIntoView({ behavior: RM ? "auto" : "smooth", block: "start" }); });
        s.addEventListener("mouseenter", () => Sfx.move());
      });
      $(".slots", pin).addEventListener("keydown", e => {
        const i = slots.indexOf(document.activeElement); if (i < 0) return;
        const d = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 2, ArrowUp: -2 }[e.key];
        if (d === undefined) return;
        e.preventDefault(); e.stopPropagation();
        const n = (i + d + slots.length) % slots.length; sel(n, true); Sfx.move();
      });
      sel(0);
    },
    operations(pin) {
      $$(".op", pin).forEach(a => {
        a.addEventListener("mouseenter", () => { Radar.focus(a.dataset.k); Sfx.move(); });
        a.addEventListener("focus", () => Radar.focus(a.dataset.k));
        a.addEventListener("mouseleave", () => Radar.focus(null));
      });
    },
    terrains(pin) {
      const all = $$("[data-z]", pin);
      const sel = i => { all.forEach(b => b.setAttribute("aria-pressed", +b.dataset.z === i)); };
      all.forEach(b => {
        b.addEventListener("click", () => { sel(+b.dataset.z); Sfx.select(); });
        b.addEventListener("mouseenter", () => { sel(+b.dataset.z); Sfx.move(); });
      });
    },
    liaison(pin) {
      const form = $("#lform", pin), st = $("#fstat", pin), F = S.liaison.form;
      const say = (msg, cls) => { st.className = "fstat " + (cls || ""); st.innerHTML = T(msg); };
      form.addEventListener("submit", async e => {
        e.preventDefault();
        const d = Object.fromEntries(new FormData(form));
        if (!d.name.trim() || !d.what.trim() || !/^\S+@\S+\.\S+$/.test(d.email.trim())) { say(F.invalid, "err"); Sfx.back(); return; }
        say(F.sending, "busy"); Sfx.select(); $("#fready").textContent = "ÉMISSION";
        const brief = "CONTACT — SITE v7\n\nNom : " + d.name + "\nEntreprise : " + (d.company || "-") + "\nBudget : " + (d.budget || "-") + "\nDélai : " + (d.delay || "-") + "\n\nCe que je veux faire :\n" + d.what;
        const payload = { from: d.email.trim(), phone: d.phone, note: [d.name, d.company].filter(Boolean).join(" — "), brief, subject: "Liaison site — " + d.name, total: "à chiffrer", page: location.href, hp: d.hp, session: { who: d.name, code: "" } };
        try {
          const r = await fetch("send.php", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
          const j = await r.json();
          if (!j.ok) throw new Error(j.msg);
          say(F.ok); form.reset(); $("#fready").textContent = "REÇU"; Sfx.tx();
        } catch (err) {
          say(F.fallback, "err"); $("#fready").textContent = "REPLI";
          location.href = "mailto:" + S.liaison.email + "?subject=" + encodeURIComponent(payload.subject) + "&body=" + encodeURIComponent(brief + "\n\n" + d.email + (d.phone ? " / " + d.phone : ""));
        }
      });
    }
  };

  /* courbes de niveau dessinées une fois (graine fixe) */
  function contours() {
    let s = 77;
    const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    let out = '<svg viewBox="0 0 160 110" preserveAspectRatio="none">';
    for (let h = 0; h < 6; h++) {
      const cx = 12 + rnd() * 136, cy = 10 + rnd() * 90, base = 9 + rnd() * 16;
      const p1 = rnd() * 6, p2 = rnd() * 6, k = 2 + Math.round(rnd() * 2);
      for (let l = 1; l <= 6; l++) {
        const r0 = base * l / 3.2;
        let d = "";
        for (let j = 0; j <= 64; j++) {
          const a = j / 64 * Math.PI * 2;
          const r = r0 * (1 + .2 * Math.sin(k * a + p1 + l * .3) + .1 * Math.sin(5 * a + p2));
          d += (j ? "L" : "M") + (cx + Math.cos(a) * r).toFixed(1) + " " + (cy + Math.sin(a) * r * .8).toFixed(1);
        }
        out += '<path d="' + d + 'Z"' + (l % 3 === 0 ? ' class="hi"' : "") + "/>";
      }
    }
    return out + "</svg>";
  }

  function openMission(id) {
    const m = S.missions.find(x => x.id === id), idx = S.missions.indexOf(m);
    curMission = id;
    const pin = $("#pin"), panel = $("#panel");
    pin.innerHTML = BUILD[id](m, idx) + nextBlock(idx) + footer();
    coachDone();
    if (panel.hidden) { panel.hidden = false; panel.classList.remove("up"); void panel.offsetWidth; panel.classList.add("up"); }
    $$(".gl-tabs a").forEach((a, j) => {
      if (j !== idx) { a.removeAttribute("aria-current"); return; }
      a.setAttribute("aria-current", "page");
      const box = a.parentNode;                      /* onglet courant ramené au centre de la rangée */
      box.scrollLeft = a.offsetLeft - (box.clientWidth - a.offsetWidth) / 2;
    });
    D.open = true;
    document.body.classList.add("paneled");
    $(".dk-mfds").inert = true;
    panel.scrollTop = 0;
    if (!panel.contains(document.activeElement)) panel.focus({ preventScroll: true });   /* le clavier fait défiler le contenu tout de suite */
    panel.classList.remove("wipe"); void panel.offsetWidth; panel.classList.add("wipe");
    $$("[data-decode]", pin).forEach(el => decode(el));
    if (BIND[id]) BIND[id](pin);
    setTimeout(() => {
      $$(".gauge", pin).forEach((g, i) => setTimeout(() => g.classList.add("go"), i * 140));
      const st = $("#steps", pin); if (st) st.classList.add("go");
    }, 260);
    document.title = m.label + " — Studio Visions";
    D.going = false; D.wpGo = false;
    if (!RM && D.warpT <= 0) D.warpT = .32;            /* un reste de vitesse derrière le panneau qui arrive */
    Sfx.arrive();
  }
  function closePanel() {
    const panel = $("#panel");
    D.open = false; D.going = false; D.wpGo = false;
    document.body.classList.remove("paneled");
    if (!panel) return;
    const mf = $(".dk-mfds"); if (mf) mf.inert = false;
    if (!panel.hidden) {
      const had = panel.contains(document.activeElement);
      panel.hidden = true; document.title = "Poste de pilotage — Studio Visions";
      const a = $(".mfd-nav .mi[aria-current]");     /* le clavier reprend là où il était : sur le cap choisi */
      if (had && a && a.offsetParent) a.focus({ preventScroll: true });
    }
  }

  /* ---------------------------------------------------------------- DOSSIER */
  let dS = null;
  function openDossier(k) {
    const L = S.operations.list, i = L.findIndex(p => p.k === k);
    if (i < 0) return;
    const p = L[i], nx = L[(i + 1) % L.length], d = $("#dossier");
    dS = { p, n: 0, busy: false };
    d.innerHTML =
      '<div class="dtop"><span>DOSSIER <b>OP-' + pad(i + 1) + "</b> / " + pad(L.length) + '</span><span class="hide-s">CLASSIFICATION : OUVERT</span><span class="sp"></span>' +
        '<button class="btn" type="button" data-close>Retour <kbd>ÉCHAP</kbd></button></div>' +
      '<div class="dstage"><div class="frame brk"><img id="dimg" alt=""></div>' +
        '<div class="dnav"><button type="button" data-prev>PRÉCÉDENT</button><span id="dcount" aria-live="polite"></span><button type="button" data-next>SUIVANT</button></div></div>' +
      '<div class="dinfo"><p class="code">OPÉRATION ' + pad(i + 1) + " — " + esc(p.year) + "</p>" +
        '<h2 data-decode>' + esc(p.lab) + "</h2>" +
        '<div class="tags"><span>' + esc(p.role) + "</span><span>" + esc(p.year) + "</span></div>" +
        '<div class="sect"><h3>[01/02] — LE DOSSIER</h3><p>' + T(p.txt) + "</p></div>" +
        '<div class="sect"><h3>[02/02] — STATUT</h3><p>' + T(S.operations.note) + "</p></div>" +
        '<div class="acts"><a class="btn solid" href="#op-' + nx.k + '">Opération suivante — ' + esc(nx.lab) + "</a>" + oracleA() + "</div></div>";
    d.hidden = false;
    d.classList.remove("in"); void d.offsetWidth; d.classList.add("in");
    setImg(0, true);
    $("[data-close]", d).addEventListener("click", () => { Sfx.back(); location.hash = "#operations"; });
    $("[data-prev]", d).addEventListener("click", () => setImg(dS.n - 1));
    $("[data-next]", d).addEventListener("click", () => setImg(dS.n + 1));
    $("[data-close]", d).focus({ preventScroll: true });
    decode($("h2", d));
    Radar.focus(k);
    document.title = p.lab + " — Opérations — Studio Visions";
    D.going = false;
    if (!RM && D.warpT <= 0) D.warpT = .32;
    visPaint();
    Sfx.arrive();
  }
  function setImg(n, first) {
    if (!dS || dS.busy) return;
    const imgs = dS.p.imgs;
    n = (n + imgs.length) % imgs.length;
    const img = $("#dimg"), key = imgs[n];
    const apply = () => {
      img.src = S.img + key + ".jpg";
      img.alt = S.operations.alts[key] || "";
      $("#dcount").textContent = pad(n + 1) + " / " + pad(imgs.length);
      dS.n = n;
    };
    if (first || RM) { apply(); return; }
    dS.busy = true; Sfx.move();
    img.classList.add("out");
    const tok = dS;
    setTimeout(() => {
      if (dS !== tok) return;                 /* dossier changé entre-temps */
      apply();
      img.classList.remove("out"); img.classList.add("pre"); void img.offsetWidth; img.classList.remove("pre");
      setTimeout(() => { if (dS) dS.busy = false; }, 380);
    }, 330);
  }
  function closeDossier(silent) {
    const d = $("#dossier");
    if (d.hidden) return;
    d.hidden = true; d.innerHTML = ""; dS = null; Radar.focus(null);
    visPaint();
    if (!silent) Sfx.back();
    const a = $(".op[data-k]"); if (current === "hq" && curMission === "operations" && a) { /* garder la place */ }
    if (curMission) document.title = S.missions.find(x => x.id === curMission).label + " — Studio Visions";
  }

  /* ---------------------------------------------------------------- TRANSMISSION */
  let txState = null;
  function openTx() {
    const X = S.transmission, tx = $("#tx");
    tx.innerHTML =
      '<div class="txl"><canvas aria-hidden="true"></canvas><small>' + X.jp + "<br>CANAL 07</small></div>" +
      '<div class="txr"><p class="txh"><span class="blink">' + esc(X.head) + '</span><span class="jp">' + X.jp + "</span></p>" +
      '<p class="txf">' + esc(X.from) + '</p><p class="txt" id="txt"></p>' +
      '<div class="txa"><button class="btn solid" type="button" data-txok>' + esc(X.ok) + " [ENTRÉE]</button></div></div>";
    tx.hidden = false; tx.classList.remove("in"); void tx.offsetWidth; tx.classList.add("in");
    Sfx.tx();
    const el = $("#txt"), full = X.text;
    txState = { i: 0, done: false, talk: true, stopWave: null, iv: 0 };
    const cv = $("canvas", tx);
    if (cv.offsetParent) txState.stopWave = FX.wave(cv, () => txState && txState.talk);
    const finish = () => { clearInterval(txState.iv); el.textContent = full; txState.done = true; txState.talk = false; };
    if (RM) finish();
    else txState.iv = setInterval(() => {
      txState.i += 2; el.textContent = full.slice(0, txState.i);
      if (txState.i % 6 === 0) Sfx.tick();
      if (txState.i >= full.length) finish();
    }, 28);
    txState.finish = finish;
    $("[data-txok]", tx).addEventListener("click", () => closeTx());
    $("[data-txok]", tx).focus({ preventScroll: true });
  }
  function closeTx(silent) {
    const tx = $("#tx");
    if (tx.hidden || !txState) return;
    if (!txState.done && !silent) { txState.finish(); return; }
    clearInterval(txState.iv); txState.stopWave && txState.stopWave(); txState = null;
    tx.hidden = true; tx.innerHTML = "";
    ss.set("sv7.tx", "1");
    if (!silent) { Sfx.select(); const a = $(".mi[aria-current]"); a && a.focus({ preventScroll: true }); }
  }

  /* ---------------------------------------------------------------- ORACLE / MODES */
  function setAlert(on) {
    if (current === "oracle") on = true;
    document.body.classList.toggle("alert", on);
    const st = $("#stTxt"), jp = $("#stJp"), or = $("#tOr");
    if (st) { st.textContent = on ? S.hud.alert : S.hud.status; jp.textContent = on ? S.hud.alertJp : S.hud.statusJp; }
    if (or) or.textContent = on ? "PRÊT" : "EN ATTENTE";
    Radar.color(on ? "234,242,255" : "255,255,255");
    Terrain.set({ rgb: VISION[vision].terr });
  }
  function oracleGo() {
    if (current === "oracle") return;
    Sfx.alert(); setAlert(true);
    const c = $("#curtain");
    $(".msg", c).textContent = "LIAISON ORACLE — 神託 — CANAL SÉCURISÉ";
    c.classList.remove("go"); c.classList.add("red", "cover");
    setTimeout(() => { location.hash = "#oracle"; }, RM ? 0 : 750);
    setTimeout(() => c.classList.remove("red", "cover"), RM ? 60 : 1050);
  }
  function goOracle() {
    clearTimers();
    show("oracle");
    document.title = "Oracle — Studio Visions";
    setAlert(true);
    window.Oracle.open();
  }
  window.Oracle.quit = () => { Sfx.back(); location.hash = backHash; };
  document.addEventListener("click", e => {
    const a = e.target.closest("[data-oracle]");
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault(); oracleGo();
  });
  document.addEventListener("mouseover", e => { if (e.target.closest && e.target.closest("[data-oracle]")) setAlert(true); });
  document.addEventListener("mouseout", e => { const a = e.target.closest && e.target.closest("[data-oracle]"); if (a && !a.contains(e.relatedTarget)) setAlert(false); });
  document.addEventListener("focusin", e => setAlert(!!(e.target.closest && e.target.closest("[data-oracle]"))));

  /* ---------------------------------------------------------------- VISIONS
     Claire (par défaut), nuit, thermique, rouge. Nuit et rouge teintent tout l'écran ;
     la thermique recolore le relief par altitude et les visuels par intensité. */
  const THERM = ["70,50,220", "150,40,190", "230,45,110", "255,150,40", "255,236,160"];
  const VISION = {
    std: { ink: "234,242,255", terr: "255,255,255", bg: "#000", pal: null, m5: null, holo: ["255,255,255", "169,212,255"] },
    thermal: { ink: "255,214,130", terr: "150,70,255", bg: "#06031a", m5: THERM, holo: ["255,236,160", "255,110,50"],
      pal: { c: [THERM[0], THERM[2], THERM[3], "255,248,215"], t: [.75, 1.6] } }
  };
  VISION.nv = VISION.red = VISION.std;
  const VORDER = ["std", "nv", "thermal", "red"];
  let vision = "std";
  function setVision(v, quiet) {
    if (!VISION[v]) v = "std";
    vision = v;
    const b = document.body, V = VISION[v];
    VORDER.forEach(k => b.classList.toggle("vis-" + k, k === v));
    b.classList.toggle("nv", v === "nv");
    Terrain.set({ rgb: V.terr, pal: V.pal, bg: V.bg });
    Holo.tint(V.holo[0], V.holo[1]);
    if (window.Adn) window.Adn.ink(V.ink, V.m5);
    $$("#vis [data-v]").forEach(x => x.setAttribute("aria-checked", x.dataset.v === v));
    store.set("sv8.vision", v);
    if (!quiet) { Sfx.sw(); toast(S.deck.vision.toast[v]); }
    if (current === "hq") deckTick(0);
  }
  function cycleVision() { setVision(VORDER[(VORDER.indexOf(vision) + 1) % VORDER.length]); }
  /* le sélecteur reste au-dessus des teintes, donc ses pastilles gardent leur vraie couleur */
  function visPaint() {
    const el = $("#vis");
    if (el) el.hidden = !(current === "hq" && $("#dossier").hidden && $("#cmd").hidden);
  }

  /* ---------------------------------------------------------------- INCLINAISON
     Sur téléphone : on penche l'appareil pour tourner, comme un manche. iOS demande
     l'accord du visiteur, et seulement à la suite d'un geste. */
  const TILT = { on: false, seen: false, roll: 0, pitch: 0, base: null };
  function tiltCan() { return touch && typeof window.DeviceOrientationEvent !== "undefined"; }
  function onTilt(e) {
    if (e.beta == null || e.gamma == null) return;
    const ang = (screen.orientation && screen.orientation.angle) || window.orientation || 0;
    let roll, pitch;
    if (ang === 90) { roll = e.beta; pitch = -e.gamma; }                       /* paysage, haut du téléphone à gauche */
    else if (ang === -90 || ang === 270) { roll = -e.beta; pitch = e.gamma; }  /* paysage, haut du téléphone à droite */
    else { roll = e.gamma; pitch = e.beta; }                                   /* portrait */
    if (TILT.base === null || TILT.ang !== ang) { TILT.base = pitch; TILT.ang = ang; }   /* la tenue de départ sert de neutre */
    TILT.roll = Math.max(-36, Math.min(36, roll));
    TILT.pitch = Math.max(-25, Math.min(25, pitch - TILT.base));
    TILT.seen = true;
  }
  async function tiltOn(quiet) {
    if (!tiltCan()) return false;
    try {
      const DOE = window.DeviceOrientationEvent;
      if (typeof DOE.requestPermission === "function" && (await DOE.requestPermission()) !== "granted") throw new Error("refus");
    } catch (e) { if (!quiet) toast(S.deck.tilt.denied); return false; }
    if (!TILT.on) addEventListener("deviceorientation", onTilt);
    TILT.on = true; TILT.seen = false; TILT.base = null;
    store.set("sv8.tilt", "1");
    if (!quiet) toast(S.deck.tilt.on);
    return true;
  }
  function tiltOff() {
    removeEventListener("deviceorientation", onTilt);
    TILT.on = false; TILT.seen = false; D.free = false;
    store.set("sv8.tilt", "0");
    toast(S.deck.tilt.off);
  }


  /* ---------------------------------------------------------------- CLAVIER */
  const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
  let kpos = 0;
  document.addEventListener("keydown", e => {
    Sfx.unlock(); Voice.arm();
    if (current === "hq") Sfx.hum(true);
    const k = e.key;
    kpos = (k.toLowerCase() === KONAMI[kpos].toLowerCase()) ? kpos + 1 : (k === KONAMI[0] ? 1 : 0);
    if (kpos === KONAMI.length) { kpos = 0; setVision(vision === "nv" ? "std" : "nv", true); toast("CODE ACCEPTÉ — VISION NOCTURNE"); return; }
    if (current === "oracle" && window.Oracle.key(e)) return;
    /* ⌘K ou Ctrl+K : le menu, depuis n'importe où dans le poste */
    if ((e.metaKey || e.ctrlKey) && (k === "k" || k === "K") && current === "hq") {
      e.preventDefault();
      if ($("#cmd").hidden) openCmd(); else closeCmd(true);
      return;
    }
    const tg = e.target, typing = tg && (/^(INPUT|TEXTAREA|SELECT)$/.test(tg.tagName) || tg.isContentEditable);
    if (typing) { if (k === "Escape") tg.blur(); return; }
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (!$("#cmd").hidden) { if (k === "Escape") { e.preventDefault(); closeCmd(true); } return; }
    if (k === "m" || k === "M") { toggleSound(); return; }
    if (k === "n" || k === "N") { cycleVision(); return; }
    if ((k === "o" || k === "O") && current !== "oracle" && current !== "boot") { e.preventDefault(); oracleGo(); return; }
    if ((k === "v" || k === "V") && (current === "hq" || current === "oracle")) { e.preventDefault(); if (Voice.listening) Voice.stop(); else talkStart(); return; }

    if (current === "boot") {
      if (k === "Enter" || k === " " || k === "Escape") { e.preventDefault(); endBoot(); }
      return;
    }
    if (current === "title") {
      const f = $$("#title .en-acts button, #title .en-mode"), i = f.indexOf(document.activeElement);
      if (/^[1-9]$/.test(k)) {                              /* comme dans un menu de jeu : 1 décoller, 2, 3, 4 les autres entrées */
        const a = k === "1" ? null : $('#title .en-mode[data-n="0' + k + '"]');
        if (k === "1") { e.preventDefault(); enter(true); } else if (a) { e.preventDefault(); a.click(); }
        return;
      }
      if (/^Arrow/.test(k) && f.length) {
        e.preventDefault();
        f[(Math.max(i, 0) + ((k === "ArrowRight" || k === "ArrowDown") ? 1 : -1) + f.length) % f.length].focus();
        Sfx.move();
      } else if ((k === "Enter" || k === " ") && i < 0) { e.preventDefault(); enter(true); }   /* sur un bouton, le navigateur s'en charge */
      return;
    }
    if (current === "oath") {
      const ready = $("#oath .holdwrap.in");
      if (k === "Escape") { e.preventDefault(); store.set("sv7.seen", "1"); go("#vol"); return; }
      if (k === "Enter" || k === " ") {
        e.preventDefault();
        if (e.repeat) return;
        if (ready && hold) hold.start(); else if (oathAll) oathAll();
      }
      return;
    }
    if (current === "hq") {
      if (!$("#dossier").hidden) {
        if (k === "Tab") {
          const f = $$("#dossier button, #dossier a[href]"), i = f.indexOf(document.activeElement);
          if (f.length) { e.preventDefault(); f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus(); }
          return;
        }
        if (k === "Escape") { e.preventDefault(); Sfx.back(); location.hash = "#operations"; }
        else if (k === "ArrowLeft") { e.preventDefault(); setImg(dS.n - 1); }
        else if (k === "ArrowRight") { e.preventDefault(); setImg(dS.n + 1); }
        return;
      }
      if (k === "/") { e.preventDefault(); openCmd(); return; }
      if (/^[1-7]$/.test(k)) {
        e.preventDefault();
        const i = +k - 1; Sfx.select(); selectWp(i, true);
        if (D.open) location.hash = "#" + S.missions[i].id; else engage();
        return;
      }
      const onCtl = tg && tg.closest && tg.closest("a,button,summary,[role=tab]");
      if (D.open) {
        if (k === "Escape") { e.preventDefault(); Sfx.back(); location.hash = "#vol"; }
        else if ((k === "ArrowLeft" || k === "ArrowRight") && !onCtl) { e.preventDefault(); stepWp(k === "ArrowRight" ? 1 : -1); }
        return;
      }
      if (k === "ArrowLeft" || k === "ArrowUp") { e.preventDefault(); stepWp(-1); }
      else if (k === "ArrowRight" || k === "ArrowDown") { e.preventDefault(); stepWp(1); }
      else if (k === "Enter" && !onCtl) { e.preventDefault(); engage(); }
      else if (k === " " && !onCtl) { e.preventDefault(); if (!e.repeat) talkStart(); }
    }
  });
  document.addEventListener("keyup", e => {
    if (current === "oath" && (e.key === "Enter" || e.key === " ") && hold) hold.stop();
    if (current === "hq" && e.key === " ") Voice.stop();
  });
  document.addEventListener("pointerdown", () => { Sfx.unlock(); Voice.arm(); if (current === "hq") Sfx.hum(true); }, { capture: true });
  document.addEventListener("visibilitychange", () => { Sfx.hum(!document.hidden && current === "hq"); });

  $("#skip").addEventListener("click", () => {
    if (current === "boot") endBoot();
    else if (current === "oath") { store.set("sv7.seen", "1"); go("#vol"); }
  });
  $("#boot").addEventListener("click", () => { if (current === "boot") endBoot(); });   /* un clic suffit pour passer */
  $("#title").addEventListener("click", e => { if (current === "title" && !e.target.closest("a,button")) window.Adn.next(); });
  /* après un clic de souris sur un bouton du poste, le clavier reprend la main (Entrée engage, ← → tournent) */
  document.addEventListener("click", e => {
    if (!e.detail || current !== "hq" || D.open || !e.target.closest) return;
    const b = e.target.closest("#snd,.dk-arrow,.hud-btn,.wp,.dk-coach button");
    if (b && b === document.activeElement) b.blur();
  });
  $("#snd").addEventListener("click", toggleSound);
  Voice.mute(!Sfx.on);
  paintSound();
  $("#vis").innerHTML = '<span class="vl" aria-hidden="true">' + esc(S.deck.vision.label) + "</span>" + VORDER.map(v =>
    '<button type="button" role="radio" data-v="' + v + '" aria-checked="false" aria-label="' + esc(S.deck.vision.label + " " + S.deck.vision.modes[v]) + '" title="' + esc(S.deck.vision.modes[v]) + '"><i></i><span>' + esc(S.deck.vision.modes[v]) + "</span></button>").join("");
  $("#vis").addEventListener("click", e => { const b = e.target.closest("[data-v]"); if (b) { setVision(b.dataset.v); if (e.detail) b.blur(); } });
  setVision(store.get("sv8.vision") || "std", true);

  /* ---------------------------------------------------------------- ROUTEUR */
  function route() {
    const h = decodeURIComponent(location.hash.replace(/^#\/?/, ""));
    let [a, b] = h.split("/");
    if (/^op-/.test(a)) { b = a.slice(3); a = "operations"; }   /* #op-<clé> = dossier */
    if (!a) {
      if (current === "boot") return;
      backHash = "#";
      if (!booted && !EMBED) boot(store.get("sv7.seen") === "1");
      else { booted = true; goTitle(); }
      return;
    }
    booted = true;
    if (a === "oracle") { goOracle(); return; }
    backHash = location.hash;
    if (a === "serment") { goOath(); return; }
    if (a === "vol") { goHQ(null); return; }
    if (S.missions.some(m => m.id === a)) { goHQ(a, b); return; }
    history.replaceState(null, "", "#vol");
    goHQ(null);
  }
  addEventListener("hashchange", route);
  route();
})();
