/* =====================================================================
   STUDIO VISIONS v8 — L'ORACLE
   Cinq questions d'agence (qui, besoin, durée, IA ou non, budget), puis un plan
   en quatre phases chiffré avec la grille de la v5.7.0 (catalogue.js).
   L'IA est une option : on peut l'ajouter ou la retirer jusque dans le plan.
   Vues : intro -> question (x5) -> calcul -> plan -> transmission -> envoyé
   ===================================================================== */
(function () {
  "use strict";
  const S = window.SV, O = S.oracle, FX = window.FX;
  const { Sfx, decode, RM } = FX;
  const BR = Object.fromEntries(window.SV_CAT.bricks.map(b => [b.id, b]));
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const T = s => esc(s).replace(/\[(À REMPLIR|À VALIDER)\]/g, m => (S.draft ? '<mark class="todo">' + m + "</mark>" : ""));
  const pad = n => String(n).padStart(2, "0");
  const eur = n => new Intl.NumberFormat("fr-BE").format(Math.round(n)) + " €";
  const M = S.media;
  const TI = { E: 0, S: 1, X: 2 };

  /* ---- ce que l'Oracle propose : [brique, phase] ---- */
  const PRIO = {
    print: [["SV-AFF-01", 1], ["SV-PAK-01", 2]],
    ident: [["SV-IDE-01", 1], ["SV-LOG-01", 2]],
    site: [["SV-WEB-01", 1], ["SV-RET-02", 2]],
    campagne: [["SV-SOC-01", 1], ["SV-PUB-01", 2]],
    video: [["SV-VID-01", 1], ["SV-MOT-01", 2]],
    pitch: [["PV-SCE-01", 1], ["SV-CON-01", 1]],
    event: [["SV-AFF-01", 1], ["SV-SOC-01", 1], ["SV-PHO-01", 2]]
  };
  /* petit budget (moins de 500 €) : la plus petite brique d'abord, le reste en phase 02 */
  const LIGHT = {
    print: [["SV-AFF-01", 1], ["SV-PAK-01", 2]],
    ident: [["SV-LOG-01", 1], ["SV-IDE-01", 2]],
    site: [["SV-CON-01", 1], ["SV-WEB-01", 2]],
    campagne: [["SV-SOC-01", 1], ["SV-PUB-01", 3]],
    video: [["SV-MOT-01", 1], ["SV-VID-01", 2]],
    pitch: [["SV-CON-01", 1], ["PV-SCE-01", 2]],
    event: [["SV-AFF-01", 1], ["SV-SOC-01", 2]]
  };
  /* l'IA, de « sans » à « partout » */
  const IA = [
    [],
    [["SV-IMG-01", 1], ["SV-VOX-01", 2]],
    [["SV-IMG-01", 1], ["SV-AUT-01", 2]],
    [["LAB-FOR-01", 1], ["SV-AUT-01", 2], ["LAB-IA-01", 2], ["SV-CAM-01", 3]]
  ];
  const WHO = {
    pme: [["SV-CON-01", 2]],
    btp: [["SV-PHO-01", 2]],
    immo: [["SV-PHO-01", 2]],
    agence: [["SV-RET-01", 2]],
    marque: [["SV-SOC-01", 2]],
    culture: [["SV-AFF-01", 2]]
  };
  /* la suite, quand on construit dans la durée */
  const LATER = [["SV-RET-01", 2], ["SV-PUB-01", 3], ["SV-UXI-01", 3], ["PV-UNI-01", 4]];
  const LATER_IA = [["LAB-PRO-01", 3], ["LAB-VEI-01", 4]];
  const P1_MAX = 4;
  /* noms des options de la base Notion « Plans Oracle » (voir notion-push.php) */
  const NOTION = {
    who: { pme: "PME", btp: "Bâtiment", immo: "Immobilier", agence: "Agence", marque: "Marque", culture: "Culture" },
    level: ["Sans IA", "IA en production", "IA et automatisation", "IA partout"],
    prio: { print: "Print", ident: "Identité", site: "Site web", campagne: "Campagne", video: "Vidéo", pitch: "Pitch", event: "Événement" },
    horizon: { 1: "Ponctuel", 2: "Une année", 4: "Jusqu'en 2030" },
    budget: { b00: "Moins de 500 €", b1: "500 à 2 000 €", b2: "2 000 à 10 000 €", b3: "10 000 à 30 000 €", b4: "Plus de 30 000 €", b0: "Ne sait pas encore" }
  };
  function planData(d) {
    const a = st.a, t = totals();
    return {
      name: d.name.trim(), company: (d.company || "").trim(),
      profil: NOTION.who[a.who] || "", niveau: NOTION.level[a.level] || "",
      priorites: (a.prio || []).map(v => NOTION.prio[v]).filter(Boolean),
      horizon: NOTION.horizon[st.horizon] || "", engagement: NOTION.budget[a.budget] || "",
      phase1: t.phase[1], total: t.all, mensuel: t.monthly,
      briques: st.items.filter(i => !i.off && i.phase <= st.horizon)
        .map(i => "P" + i.phase + " " + BR[i.id].nm + " [" + O.tiers[i.tier].name + "]").join(" · ")
    };
  }

  let root = null, st = null, typing = 0, view = "intro";
  const fresh = () => ({ step: 0, a: {}, sel: [], items: [], horizon: 4, sent: false });

  /* ---------------------------------------------------------------- plan */
  function compose() {
    const a = st.a, out = new Map();
    const bud = O.steps[4].opts.find(o => o.v === a.budget) || {};
    const small = (bud.max || 999999) <= 500, lv = a.level || 0;
    const add = list => list.forEach(([id, ph]) => {
      if (!BR[id]) return;
      if (!out.has(id) || out.get(id) > ph) out.set(id, ph);
    });
    (a.prio || []).forEach(x => add((small ? LIGHT[x] : PRIO[x]) || []));
    add(small ? IA[lv].map(([id, ph]) => [id, Math.max(2, ph)]) : IA[lv]);      /* petit budget : l'IA attend la phase 02 */
    add(WHO[a.who] || []);
    add(LATER);
    if (lv >= 2) add(LATER_IA);
    const list = [...out.entries()].map(([id, phase]) => ({ id, phase }));
    list.filter(i => i.phase === 1).slice(small ? 2 : P1_MAX).forEach(i => { i.phase = 2; });
    const prev = Object.fromEntries((st.items || []).map(i => [i.id, i]));
    st.items = list.sort((x, y) => x.phase - y.phase).map(i => {
      const keep = prev[i.id];
      return { id: i.id, phase: i.phase, tier: keep ? keep.tier : (bud.tier || "S"), off: keep ? keep.off : false };
    });
    st.horizon = a.horizon || 4;
  }
  function totals() {
    const r = { phase: [0, 0, 0, 0, 0], month: [0, 0, 0, 0, 0], all: 0, monthly: 0 };
    st.items.forEach(i => {
      if (i.off || i.phase > st.horizon) return;
      const b = BR[i.id], price = b.t[TI[i.tier]][0];
      if (b.tier === "recur") { r.monthly += price; r.month[i.phase] += price; }
      else { r.phase[i.phase] += price; r.all += price; }
    });
    return r;
  }
  function verdict() {
    const t = totals(), bud = O.steps[4].opts.find(o => o.v === st.a.budget) || { max: 999999 };
    const p1 = st.items.filter(i => i.phase === 1 && !i.off);
    if (!p1.length) return O.verdict.none;
    if (t.phase[1] > bud.max * 1.1) return O.verdict.over;
    if (bud.max < 999999 && t.phase[1] < bud.max * .6) return O.verdict.under;
    return O.verdict.ok;
  }

  /* ---------------------------------------------------------------- décor */
  let vidOn = 0;
  function setVideo(name) {
    const vs = $$(".ov", root), bg = $(".o-bg", root);
    if (RM) { bg.style.backgroundImage = "url(" + M + name + ".jpg)"; return; }
    const cur = vs[vidOn], nx = vs[1 - vidOn];
    if (cur.dataset.name === name) return;
    nx.dataset.name = name;
    nx.poster = M + name + ".jpg";
    nx.src = M + name + ".mp4";
    const p = nx.play(); if (p && p.catch) p.catch(() => {});
    nx.classList.add("on"); cur.classList.remove("on");
    setTimeout(() => { if (!cur.classList.contains("on")) cur.pause(); }, 1400);
    vidOn = 1 - vidOn;
  }
  function say(text, then) {
    const el = $(".o-line", root), fig = $(".o-figure", root);
    clearInterval(typing);
    if (window.Voice) window.Voice.speak(text);
    fig.classList.add("talk");
    if (RM) { el.textContent = text; fig.classList.remove("talk"); then && setTimeout(then, 300); return; }
    let i = 0;
    typing = setInterval(() => {
      i += 2; el.textContent = text.slice(0, i);
      if (i % 8 === 0) Sfx.tick();
      if (i >= text.length) { clearInterval(typing); el.textContent = text; fig.classList.remove("talk"); then && setTimeout(then, 650); }
    }, 22);
  }
  function crumbs() {
    const n = view === "question" ? st.step : (view === "intro" ? -1 : 5);
    $$(".o-steps li", root).forEach((li, i) => {
      li.classList.toggle("done", i < n); li.classList.toggle("cur", i === n);
    });
    $$(".o-prog i", root).forEach((el, i) => { el.className = i < n ? "done" : i === n ? "cur" : ""; });
  }
  function log() {
    const L = $(".o-log", root);
    L.innerHTML = O.steps.map(s => {
      const v = st.a[s.key];
      if (v === undefined || (Array.isArray(v) && !v.length)) return "";
      const lab = Array.isArray(v) ? v.map(x => s.opts.find(o => o.v === x).t).join(" / ") : s.opts.find(o => o.v === v).t;
      return "<li><span>" + esc(s.tag) + "</span>" + esc(lab) + "</li>";
    }).join("");
  }

  /* ---------------------------------------------------------------- vues */
  function right(html, cls) {
    const R = $("#oRight");
    root.classList.toggle("planmode", cls === "plan" || cls === "transmit" || cls === "sent");
    R.className = "o-right " + (cls || "");
    root.dataset.view = cls || "question";
    R.innerHTML = html;
    R.scrollTop = 0;
    R.classList.remove("in"); void R.offsetWidth; R.classList.add("in");
    $$("[data-decode]", R).forEach(el => decode(el));
    return R;
  }

  function vIntro() {
    view = "intro"; crumbs(); setVideo("lr-1"); log();
    const I = O.intro;
    const R = right(
      '<p class="o-tag">' + esc(I.kicker) + "</p>" +
      '<h2 class="o-q" data-decode>' + esc(I.title) + "</h2>" +
      '<p class="o-text">' + esc(I.text) + "</p>" +
      '<div class="o-acts"><button type="button" class="btn-oracle big o-start"><i></i>' + esc(I.start) + " <kbd>ENTRÉE</kbd></button>" +
      '<a class="btn" href="#liaison">' + esc(I.alt) + "</a></div>", "intro");
    $(".o-start", R).addEventListener("click", () => { Sfx.select(); go(0); say(I.say, () => { if (view === "question" && st.step === 0 && st.a.who === undefined) say(O.steps[0].say); }); });
    $(".o-start", R).focus({ preventScroll: true });
    $(".o-line", root).textContent = "";
  }

  function go(n) {
    st.step = n; view = "question"; st.busy = false; crumbs();
    const s = O.steps[n];
    setVideo(s.video);
    const cur = st.a[s.key];
    st.sel = s.multi ? (cur ? cur.slice() : []) : [];
    const R = right(
      '<p class="o-tag">QUESTION ' + pad(n + 1) + "/" + pad(O.steps.length) + " — " + esc(s.tag) + (s.multi ? " — TROIS CHOIX MAXIMUM" : "") + "</p>" +
      '<h2 class="o-q" data-decode>' + esc(s.q) + "</h2>" +
      '<ul class="o-opts">' + s.opts.map((o, i) => {
        const on = s.multi ? st.sel.includes(o.v) : cur === o.v;
        return '<li><button type="button" class="o-opt" data-i="' + i + '" aria-pressed="' + on + '"><span class="k">' + (i + 1) + '</span><span class="t">' + esc(o.t) + "</span>" + (o.s ? '<span class="s">' + esc(o.s) + "</span>" : "") + "</button></li>";
      }).join("") + "</ul>" +
      '<div class="o-acts">' + (n > 0 ? '<button type="button" class="btn o-back">RETOUR</button>' : "") +
      (s.multi ? '<button type="button" class="btn solid o-next" ' + (st.sel.length ? "" : "disabled") + ">VALIDER <kbd>ENTRÉE</kbd></button>" : "") + "</div>");
    if (n > 0 || st.a[s.key] !== undefined) say(s.say);
    $$(".o-opt", R).forEach(b => {
      b.addEventListener("click", () => pick(+b.dataset.i));
      b.addEventListener("mouseenter", () => Sfx.move());
    });
    const back = $(".o-back", R); if (back) back.addEventListener("click", () => { Sfx.back(); go(n - 1); });
    const nx = $(".o-next", R); if (nx) nx.addEventListener("click", confirmMulti);
    const first = $(".o-opt", R); first && first.focus({ preventScroll: true });
  }
  function pick(i) {
    const s = O.steps[st.step], o = s.opts[i];
    if (!o) return;
    if (navigator.vibrate && navigator.userActivation && navigator.userActivation.isActive) { try { navigator.vibrate(10); } catch (e) {} }     /* petit retour dans la main, là où le téléphone le permet */
    if (s.multi) {
      const k = st.sel.indexOf(o.v);
      if (k >= 0) st.sel.splice(k, 1);
      else if (st.sel.length < s.multi) st.sel.push(o.v);
      else { Sfx.back(); return; }
      Sfx.move();
      $$(".o-opt", root).forEach((b, j) => b.setAttribute("aria-pressed", st.sel.includes(s.opts[j].v)));
      $(".o-next", root).disabled = !st.sel.length;
      return;
    }
    if (st.busy) return;
    st.busy = true; Sfx.select();
    st.a[s.key] = o.v; log();
    $$(".o-opt", root).forEach((b, j) => { b.setAttribute("aria-pressed", j === i); b.disabled = true; });
    say(o.r, () => advance());
  }
  function confirmMulti() {
    const s = O.steps[st.step];
    if (!st.sel.length || st.busy) return;
    st.busy = true; Sfx.select();
    st.a[s.key] = st.sel.slice(); log();
    $$(".o-opt, .o-next", root).forEach(b => { b.disabled = true; });
    say(s.r, () => advance());
  }
  function advance() {
    if (view !== "question") return;
    if (st.step < O.steps.length - 1) go(st.step + 1);
    else computing();
  }

  function computing() {
    view = "computing"; crumbs();
    compose();
    const lines = O.calc;
    const R = right(
      '<div class="o-calc">' + (RM ? "" : '<video class="o-tri" src="' + M + 'triangle.mp4" muted playsinline autoplay loop></video>') +
      '<p class="o-tag">' + esc(O.computing) + '</p><ol class="o-calc-l">' + lines.map(l => "<li>" + l + "</li>").join("") + "</ol></div>", "calc");
    say(O.computing);
    $$(".o-calc-l li", R).forEach((li, i) => setTimeout(() => { li.classList.add("ok"); Sfx.tick(); }, RM ? 0 : 350 + i * 380));
    setTimeout(plan, RM ? 200 : 2000);
  }

  /* ---------------------------------------------------------------- plan */
  function plan() {
    view = "plan"; crumbs(); setVideo("lr-5");
    const lv = st.a.level || 0, I = O.ia;
    right(
      '<p class="o-tag">' + esc(O.planTag) + " — " + esc(O.horizonTags[st.horizon] || "") + "</p>" +
      '<h2 class="o-q" data-decode>' + esc(O.planTitle) + "</h2>" +
      '<div class="o-phases">' + O.phases.map((p, k) => phaseHTML(p, k + 1)).join("") + "</div>" +
      /* l'IA reste une option, proposée jusqu'au bout */
      '<aside class="o-ia"><p>' + esc(lv === 0 ? I.none : lv < 3 ? I.some : I.full) + "</p><div>" +
        (lv < 3 ? '<button type="button" class="btn solid" data-ia="1">' + esc(I.add) + "</button>" : "") +
        (lv > 0 ? '<button type="button" class="btn" data-ia="-9">' + esc(I.remove) + "</button>" : "") + "</div></aside>", "plan");
    summary();
    root.classList.add("planmode");
    say(O.verdict.plan + " " + verdict());
  }
  function phaseHTML(p, ph) {
    const items = st.items.filter(i => i.phase === ph), locked = ph > st.horizon;
    return '<article class="o-phase' + (locked ? " locked" : "") + '" data-ph="' + ph + '">' +
      '<header><img src="' + M + p.img + '.jpg" alt="' + esc(p.alt) + '" loading="lazy">' +
      '<div class="ph-t"><span>PHASE ' + p.n + " — " + esc(p.when) + "</span><b>" + esc(p.name) + "</b></div>" +
      '<em class="ph-sum" data-sum="' + ph + '"></em></header>' +
      (locked ? '<div class="o-lock"><span>' + esc(O.locked) + '</span><button type="button" class="btn o-unlock">' + esc(O.unlock) + "</button></div>" : "") +
      '<ul class="o-bricks">' + items.map(brickHTML).join("") + "</ul></article>";
  }
  function brickHTML(i) {
    const b = BR[i.id], t = b.t[TI[i.tier]], rec = b.tier === "recur";
    return '<li class="o-brick' + (i.off ? " off" : "") + '" data-id="' + i.id + '">' +
      '<div class="bi"><b>' + esc(b.nm) + '</b><p>' + esc(b.de) + '</p><p class="inc">' + t[2].map(esc).join(" · ") + "</p></div>" +
      '<div class="bt" role="group" aria-label="Niveau de ' + esc(b.nm) + '">' + ["E", "S", "X"].map(k =>
        '<button type="button" data-t="' + k + '" aria-pressed="' + (i.tier === k) + '">' + O.tiers[k].name + "</button>").join("") + "</div>" +
      '<div class="bp"><b>' + eur(t[0]) + (rec ? "<small>/MOIS</small>" : "") + "</b><small>" + (rec ? "RÉCURRENT" : t[1] + " JOURS") + "</small></div>" +
      '<button type="button" class="bx">' + (i.off ? "RÉTABLIR" : "RETIRER") + "</button></li>";
  }
  function bindPlan(R) {               /* posé une seule fois, au montage */
    R.addEventListener("click", e => {
      if (view !== "plan") return;
      const ia = e.target.closest("[data-ia]");
      if (ia) {                                            /* plus d'IA, ou plus du tout : le plan se recompose, les réglages déjà faits sont gardés */
        st.a.level = Math.max(0, Math.min(3, (st.a.level || 0) + +ia.dataset.ia));
        compose(); Sfx.select(); plan(); return;
      }
      const li = e.target.closest(".o-brick");
      if (e.target.closest(".o-unlock")) { st.horizon = 4; st.a.horizon = 4; Sfx.select(); plan(); return; }
      if (!li) return;
      const it = st.items.find(x => x.id === li.dataset.id);
      const tb = e.target.closest("[data-t]");
      if (tb) {
        it.tier = tb.dataset.t; Sfx.move();
        li.outerHTML = brickHTML(it);
        say(O.tiers[it.tier].say);
      } else if (e.target.closest(".bx")) {
        it.off = !it.off; it.off ? Sfx.back() : Sfx.select();
        li.outerHTML = brickHTML(it);
      } else return;
      summary(true);
    });
  }
  function summary(react) {
    const t = totals(), S2 = $(".o-sum", root);
    for (let ph = 1; ph <= 4; ph++) { const e = $('[data-sum="' + ph + '"]', root); if (e) e.innerHTML = ph > st.horizon ? "—" : eur(t.phase[ph]) + (t.month[ph] ? "<small>+ " + eur(t.month[ph]) + "/MOIS</small>" : ""); }
    S2.innerHTML =
      '<div><span>PHASE 01</span><b>' + eur(t.phase[1]) + "</b></div>" +
      '<div><span>PLAN COMPLET</span><b>' + eur(t.all) + "</b></div>" +
      '<div><span>RÉCURRENT</span><b>' + eur(t.monthly) + "<small>/MOIS</small></b></div>" +
      '<p>Montants HTVA, grille Studio Visions. Indicatif jusqu\'au devis signé.</p>' +
      '<div class="o-sum-a"><button type="button" class="btn-oracle big o-send"><i></i>TRANSMETTRE LE PLAN</button><button type="button" class="btn o-restart">RECOMMENCER</button></div>';
    S2.hidden = false;
    $(".o-send", S2).addEventListener("click", vTransmit);
    $(".o-restart", S2).addEventListener("click", () => { Sfx.back(); st = fresh(); $(".o-sum", root).hidden = true; vIntro(); });
    if (react) say(verdict());
  }

  /* ---------------------------------------------------------------- transmission */
  function brief(who) {
    const a = st.a, t = totals(), q = k => O.steps.find(s => s.key === k);
    const lab = (k, v) => q(k).opts.find(o => o.v === v).t;
    let s = "PLAN CHIFFRÉ — Oracle Studio Visions v8\n\n" +
      "Profil : " + lab("who", a.who) +
      "\nBesoin : " + (a.prio || []).map(v => lab("prio", v)).join(" / ") +
      "\nDurée : " + lab("horizon", st.horizon) + "\nIA : " + lab("level", a.level || 0) +
      "\nBudget de départ : " + lab("budget", a.budget) + "\n";
    O.phases.forEach((p, k) => {
      const ph = k + 1; if (ph > st.horizon) return;
      s += "\nPHASE " + p.n + " — " + p.when + " — " + p.name + "\n";
      st.items.filter(i => i.phase === ph && !i.off).forEach(i => {
        const b = BR[i.id], tt = b.t[TI[i.tier]];
        s += "  - " + b.nm + " [" + O.tiers[i.tier].name + "] " + eur(tt[0]) + (b.tier === "recur" ? " / mois" : " — " + tt[1] + " jours") + " (" + b.id + ")\n";
      });
    });
    s += "\nTOTAL PHASE 01 : " + eur(t.phase[1]) + " HTVA\nTOTAL PLAN : " + eur(t.all) + " HTVA\nRÉCURRENT : " + eur(t.monthly) + " / mois HTVA\n";
    if (who) s += "\nIdentifié : " + who + "\n";
    return s;
  }
  function vTransmit() {
    view = "transmit"; Sfx.select();
    const X = O.transmit;
    const R = right(
      '<p class="o-tag">TRANSMISSION — ' + esc(O.canal) + "</p>" +
      '<h2 class="o-q" data-decode>' + esc(X.title) + "</h2>" +
      '<div class="o-tx"><figure class="o-card"><img src="' + M + 'sv1.jpg" alt="Studio Visions, visuel 夜警 : profil humanoïde"></figure>' +
      '<form class="o-form" novalidate><p class="o-text">' + esc(X.text) + "</p>" +
      ["name:text:name", "company:text:organization", "email:email:email", "phone:tel:tel", "code:text:off"].map(f => {
        const [n, ty, ac] = f.split(":");
        return '<div class="fld' + (n === "code" ? " full" : "") + '"><label for="o_' + n + '">' + esc(X[n]) + '</label><input id="o_' + n + '" name="' + n + '" type="' + ty + '" autocomplete="' + ac + '"' + (n === "code" ? ' autocapitalize="characters"' : "") + "></div>";
      }).join("") +
      '<input class="hp" name="hp" tabindex="-1" autocomplete="off" aria-hidden="true">' +
      '<div class="o-acts"><button class="btn solid" type="submit">' + esc(X.send) + '</button><button type="button" class="btn o-back">RETOUR AU PLAN</button></div>' +
      '<p class="fstat" role="status"></p></form></div>', "transmit");
    $(".o-back", R).addEventListener("click", () => { Sfx.back(); plan(); });
    const form = $("form", R), stat = $(".fstat", R);
    const msg = (m, c) => { stat.className = "fstat " + (c || ""); stat.innerHTML = T(m); };
    form.addEventListener("submit", async e => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(form));
      if (!d.name.trim() || !/^\S+@\S+\.\S+$/.test(d.email.trim())) { msg(X.invalid, "err"); Sfx.back(); return; }
      let who = d.name.trim(), code = "";
      if (d.code.trim()) {
        const c = X.codes.find(c => c.code.toUpperCase() === d.code.trim().toUpperCase());
        if (!c) { msg(X.badCode, "err"); Sfx.back(); return; }
        code = c.code; who = d.name.trim() + " (code " + c.who + ")";
      }
      st.who = { name: d.name.trim(), company: (d.company || "").trim() };
      msg(X.sending, "busy"); Sfx.select();
      const t = totals(), text = brief(who);
      const payload = { from: d.email.trim(), phone: d.phone, note: [d.name, d.company].filter(Boolean).join(" — "), brief: text,
        subject: "Plan Oracle — " + d.name.trim(), total: eur(t.all) + " + " + eur(t.monthly) + "/mois", page: location.href, hp: d.hp,
        session: { who: d.name.trim(), code }, plan: planData(d) };
      try {
        const r = await fetch("send.php", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        const j = await r.json();
        if (!j.ok) throw new Error(j.msg);
        vSent();
      } catch (err) {
        msg(X.fallback, "err");
        location.href = "mailto:" + S.liaison.email + "?subject=" + encodeURIComponent(payload.subject) + "&body=" + encodeURIComponent(text + "\n" + d.email + (d.phone ? " / " + d.phone : ""));
        vSent(true);
      }
    });
    $("#o_name", R).focus({ preventScroll: true });
    say(X.text);
  }
  function vSent(fallback) {
    view = "sent"; st.sent = !fallback; Sfx.seal();
    const msg = fallback === true ? O.report.fallback : O.verdict.sent;
    const R = right('<div class="o-sent"><img class="o-patch" src="' + M + 'patch.jpg" alt="Écusson Studio Visions : taureau ailé, スタジオ ビジョンズ, CREATIVE FOREVER & EVER">' +
      '<p class="o-tag">' + T(msg) + "</p>" +
      '<div class="o-acts"><button type="button" class="btn-oracle big o-report"><i></i>' + esc(O.report.cta) + "</button>" +
      '<a class="btn" href="#vol">RETOUR AU POSTE DE PILOTAGE</a></div></div>', "sent");
    $(".o-report", R).addEventListener("click", report);
    say(msg.replace(/\s*\[À VALIDER\]/, ""));
  }

  /* le rapport que le visiteur garde : une page à imprimer ou à enregistrer en PDF, signée du studio */
  function report() {
    const X = O.report, a = st.a, t = totals(), w = st.who || {}, L = S.liaison;
    const q = k => O.steps.find(s => s.key === k);
    const lab = (k, v) => { const o = q(k).opts.find(x => x.v === v); return o ? o.t : "—"; };
    const rows = [["who", lab("who", a.who)], ["prio", (a.prio || []).map(v => lab("prio", v)).join(" · ")],
      ["horizon", lab("horizon", st.horizon)], ["level", lab("level", a.level || 0)], ["budget", lab("budget", a.budget)]];
    let el = document.getElementById("report");
    if (!el) { el = document.createElement("section"); el.id = "report"; document.body.appendChild(el); }
    el.innerHTML =
      '<header class="rp-head"><div><p class="rp-brand">Studio Visions<sup>®</sup></p><p class="rp-nwf">' + esc(X.by) + "</p></div>" +
        '<div class="rp-meta"><b>' + esc(X.title) + "</b><span>" + esc(X.sub) + "</span><span>" +
        esc(new Date().toLocaleDateString("fr-BE", { day: "numeric", month: "long", year: "numeric" })) + "</span></div></header>" +
      '<p class="rp-for">' + esc(X.to) + " <b>" + esc(w.name || "—") + "</b>" + (w.company ? ", " + esc(w.company) : "") + "</p>" +
      '<dl class="rp-dl">' + rows.map(r => "<dt>" + esc(X.rows[r[0]]) + "</dt><dd>" + esc(r[1]) + "</dd>").join("") + "</dl>" +
      O.phases.map((p, k) => {
        const ph = k + 1, items = st.items.filter(i => i.phase === ph && !i.off);
        if (ph > st.horizon || !items.length) return "";
        return '<section class="rp-ph"><h2>' + esc(X.phase) + " " + p.n + " — " + esc(p.name) + "<small>" + esc(p.when) + "</small></h2>" +
          "<table><thead><tr>" + X.cols.map(c => "<th>" + esc(c) + "</th>").join("") + "</tr></thead><tbody>" +
          items.map(i => {
            const b = BR[i.id], tt = b.t[TI[i.tier]], rec = b.tier === "recur";
            return "<tr><td><b>" + esc(b.nm) + "</b><br>" + esc(b.de) + "</td><td>" + esc(O.tiers[i.tier].name) + "</td><td>" + eur(tt[0]) + (rec ? " / mois" : "") +
              "</td><td>" + (rec ? "Récurrent" : tt[1] + " jours") + "</td></tr>";
          }).join("") + "</tbody></table></section>";
      }).join("") +
      '<table class="rp-tot"><tbody><tr><td>' + esc(X.totals[0]) + "</td><td>" + eur(t.phase[1]) + "</td></tr><tr><td>" + esc(X.totals[1]) + "</td><td>" + eur(t.all) +
        "</td></tr><tr><td>" + esc(X.totals[2]) + "</td><td>" + eur(t.monthly) + "</td></tr></tbody></table>" +
      '<p class="rp-note">' + esc(X.note) + "</p>" +
      '<footer class="rp-foot"><b>Studio Visions<sup>®</sup></b> — ' + esc(L.email) + " — " + esc(L.phone) + " — La Roche-en-Ardenne, Belgique</footer>";
    Sfx.select();
    window.print();
  }

  /* ---------------------------------------------------------------- montage */
  function build() {
    root = $("#oracle");
    root.innerHTML =
      '<div class="o-bg" aria-hidden="true"><video class="ov on" muted playsinline loop preload="none"></video><video class="ov" muted playsinline loop preload="none"></video><div class="o-shade"></div></div>' +
      '<header class="o-bar"><span class="o-id"><i></i>' + esc(O.label).replace(/^(\S+ )(?=\S)/, '<span class="o-id-a">$1</span>') + ' <span class="jp">' + O.jp + "</span><em> — " + esc(O.canal) + "</em></span>" +
        '<ol class="o-steps" aria-hidden="true">' + O.steps.map((s, i) => "<li>" + pad(i + 1) + "<span> " + esc(s.tag) + "</span></li>").join("") + "<li>PLAN</li></ol>" +
        '<button type="button" class="hud-btn o-quit">QUITTER <kbd>ÉCHAP</kbd></button>' +
        '<div class="o-prog" aria-hidden="true">' + O.steps.map(() => "<i></i>").join("") + "</div></header>" +
      '<div class="o-main">' +
        '<aside class="o-left"><div class="o-figure" aria-hidden="true"><img class="f1" src="' + M + 'oracle-1.jpg" alt=""><img class="f2" src="' + M + 'oracle-2.jpg" alt=""><span class="o-scan"></span><span class="o-ring"></span></div>' +
          '<div class="o-say"><p class="o-who">ORACLE <span class="jp">' + O.jp + '</span></p><p class="o-line" aria-live="polite"></p></div>' +
          '<button type="button" class="btn o-mic" hidden>' + esc(O.voice.answer) + ' <kbd>V</kbd></button>' +
          '<ol class="o-log"></ol><div class="o-sum" hidden></div></aside>' +
        '<section class="o-right" id="oRight"></section>' +
      "</div>";
    $(".o-quit", root).addEventListener("click", () => Oracle.quit());
    bindPlan($("#oRight"));
    /* téléphone : glisser vers la droite revient à la question précédente */
    let tsx = null, tsy = 0;
    const OR = $("#oRight");
    OR.addEventListener("touchstart", e => { const t = e.touches[0]; tsx = t.clientX; tsy = t.clientY; }, { passive: true });
    OR.addEventListener("touchend", e => {
      if (tsx === null) return;
      const t = e.changedTouches[0], dx = t.clientX - tsx, dy = t.clientY - tsy; tsx = null;
      if (dx > 90 && Math.abs(dy) < 50 && view === "question" && st.step > 0 && !st.busy) { Sfx.back(); go(st.step - 1); }
    }, { passive: true });
    const mic = $(".o-mic", root);
    if (window.Voice && window.Voice.canListen) {
      mic.hidden = false;
      mic.addEventListener("click", () => window.SVTalk && window.SVTalk());
      window.Voice.on_("listen", v => mic.classList.toggle("on", v));
    }
  }

  const Oracle = {
    quit: () => {},
    open() {
      if (!root) build();
      if (!st) st = fresh();
      $$(".ov", root).forEach(v => { if (v.classList.contains("on") && v.src) { const p = v.play(); p && p.catch && p.catch(() => {}); } });
      if (view === "plan") plan();
      else if (view === "transmit") vTransmit();
      else if (view === "question") go(st.step);
      else if (view === "sent") vSent();
      else vIntro();
    },
    /* réponse dite à voix haute : un numéro, ou des mots de la réponse */
    hear(txt) {
      const n = window.Voice.norm(txt);
      if (view === "intro") { if (/\b(ouvr\w*|commenc\w*|oui|liaison|go)\b/.test(n)) $(".o-start", root).click(); return; }
      if (view === "question") {
        const s = O.steps[st.step];
        if (/\b(retour|precedent\w*)\b/.test(n) && st.step > 0) { Sfx.back(); go(st.step - 1); return; }
        if (s.multi && /\b(valide\w*|termine\w*|suivant\w*|ok)\b/.test(n)) { confirmMulti(); return; }
        const NUM = { un: 1, une: 1, premier: 1, premiere: 1, deux: 2, deuxieme: 2, trois: 3, troisieme: 3, quatre: 4, quatrieme: 4, cinq: 5, cinquieme: 5, six: 6, sixieme: 6, sept: 7, septieme: 7 };
        let hit = -1;
        for (const w of n.split(" ")) { if (NUM[w]) hit = NUM[w] - 1; else if (/^[1-9]$/.test(w)) hit = +w - 1; }
        if (hit < 0) {
          let best = 0;
          s.opts.forEach((o, i) => {
            const sc = window.Voice.norm(o.t).split(" ").filter(w => w.length > 3 && n.includes(w)).length;
            if (sc > best) { best = sc; hit = i; }
          });
        }
        if (hit >= 0 && hit < s.opts.length) pick(hit); else say(O.voice.retry);
        return;
      }
      if (view === "plan") {
        if (/\btransmet\w*\b/.test(n)) vTransmit();
        else if (/\brecommenc\w*\b/.test(n)) { st = fresh(); $(".o-sum", root).hidden = true; vIntro(); }
      }
    },
    close() {
      clearInterval(typing);
      if (window.Voice) window.Voice.hush();
      if (root) $$("video", root).forEach(v => v.pause());
    },
    key(e) {
      const k = e.key, tg = e.target;
      if (tg && /^(INPUT|TEXTAREA|SELECT)$/.test(tg.tagName)) return false;
      if (k === "Escape") { e.preventDefault(); Oracle.quit(); return true; }
      if (view === "intro" && (k === "Enter" || k === " ")) { if (tg && tg.tagName === "A") return false; e.preventDefault(); $(".o-start", root).click(); return true; }
      if (view === "question") {
        if (/^[1-9]$/.test(k)) { e.preventDefault(); pick(+k - 1); return true; }
        if (k === "Enter" && O.steps[st.step].multi) { e.preventDefault(); confirmMulti(); return true; }
        if (k === "Backspace" && st.step > 0) { e.preventDefault(); Sfx.back(); go(st.step - 1); return true; }
      }
      return false;
    }
  };
  window.Oracle = Oracle;
})();
