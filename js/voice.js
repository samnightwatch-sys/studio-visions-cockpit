/* =====================================================================
   STUDIO VISIONS v8 — LA VOIX
   Synthèse : le copilote et l'Oracle parlent avec une voix française de
   l'appareil du visiteur. Le site ne parle que si une voix correcte existe,
   et jamais quand le son est coupé.
   Écoute : commandes vocales là où le navigateur le permet ; sinon, le
   menu au clavier fait le même travail.
   Aucun fichier audio, aucun service ajouté par le site.
   ===================================================================== */
(function () {
  "use strict";
  const store = window.FX.store;
  const synth = window.speechSynthesis || null;
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition || null;

  /* Voix à ne jamais choisir : voix robotiques ou fantaisie livrées avec les systèmes. */
  const BAD = /\b(eddy|flo|grandma|grandpa|reed|rocko|sandy|shelley|albert|bahh|bells|boing|bubbles|cellos|jester|organ|superstar|trinoids|whisper|wobble|zarvox|fred|junior|kathy|ralph)\b|bad news|good news/i;
  const BEST = /premium|enhanced|am[eé]lior|natural|neural|online|siri/i;
  const KNOWN = /thomas|am[eé]lie|aude\b|audrey|aur[eé]lie|marie|jacques|denise|henri|[eé]lo[iï]se|vivienne|r[eé]my|brigitte|charline|google/i;
  const score = v => {
    let s = 0;
    if (BAD.test(v.name)) s -= 100;
    if (BEST.test(v.name)) s += 40;
    if (/google/i.test(v.name)) s += 30;
    else if (KNOWN.test(v.name)) s += 18;
    if (/fr[-_]BE/i.test(v.lang)) s += 8; else if (/fr[-_]FR/i.test(v.lang)) s += 6; else if (/fr[-_]CH/i.test(v.lang)) s += 4; else if (/fr[-_]CA/i.test(v.lang)) s += 2;
    if (v.localService) s += 1;
    return s;
  };

  /* préférence du visiteur : "1", "0", ou rien (alors on parle seulement si la voix est correcte) */
  let pref = store.get("sv8.voice"), wanted = store.get("sv8.voiceName") || "";
  let muted = false, armed = false, voice = null, list = [], rec = null, listening = false, speaking = false;
  const subs = {};
  const emit = (ev, a, b) => (subs[ev] || []).forEach(f => { try { f(a, b); } catch (e) {} });

  function pick() {
    if (!synth) return;
    const seen = {};
    list = synth.getVoices().filter(v => /^fr/i.test(v.lang) && !seen[v.name + v.lang] && (seen[v.name + v.lang] = 1))
      .map(v => ({ v, s: score(v) })).sort((a, b) => b.s - a.s);
    const ok = list.filter(x => x.s > -50);
    voice = (ok.find(x => x.v.name === wanted) || ok[0] || list[0] || {}).v || null;
    emit("voices");
  }
  if (synth) { pick(); if (synth.addEventListener) synth.addEventListener("voiceschanged", pick); }
  const quality = () => { const x = list.find(y => y.v === voice); return !x ? "none" : x.s >= 18 ? "good" : "basic"; };
  const isOn = () => (pref === "1" || pref === "0") ? pref === "1" : quality() === "good";

  const norm = s => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();

  /* du plus précis au plus général : la première règle qui correspond l'emporte */
  const INTENTS = [
    ["vis", "thermal", /\b(thermique|chaleur|infrarouge)\b/],
    ["vis", "red", /\b(vision rouge|rouge)\b/],
    ["vis", "nv", /\b(vision nocturne|nocturne|nuit)\b/],
    ["vis", "std", /\b(vision claire|claire|normale?|standard)\b/],
    ["mute", null, /\b(silence|tais|muet|coupe|stop)\b/],
    ["help", null, /\b(aide|commande\w*|menu)\b/],
    ["meteor", null, /\b(meteor\w*|intercept\w*|visuel\w*)\b/],
    ["oracle", null, /\b(oracle|plan|2030|diagnostic|chiffr\w*|combien|prix|tarif\w*)\b/],
    ["mission", "liaison", /\b(liaison|contact\w*|telephone|appel\w*|mail|email|devis|formulaire|ecrire)\b/],
    ["mission", "arsenal", /\b(arsenal|service\w*|offre\w*|catalogue|brique\w*)\b/],
    ["mission", "operations", /\b(operation\w*|projet\w*|realisation\w*|portfolio|travaux|dossier\w*)\b/],
    ["mission", "terrains", /\b(terrain\w*|secteur\w*|metier\w*)\b/],
    ["mission", "protocole", /\b(protocole|methode|comment|process\w*|etapes?)\b/],
    ["mission", "renseignement", /\b(renseignement\w*|journal|article\w*|question\w*|faq)\b/],
    ["mission", "briefing", /\b(briefing|studio|equipe|presentation)\b/],
    ["back", null, /\b(retour|ferme\w*|vol|sortir|quitte\w*)\b/],
    ["next", null, /\b(suivant\w*|prochain\w*|droite)\b/],
    ["prev", null, /\b(precedent\w*|gauche)\b/],
    ["engage", null, /\b(engage\w*|valide\w*|ouvre|ouvrir|entre\w*|go)\b/]
  ];

  const Voice = {
    norm,
    get on() { return isOn(); },
    get muted() { return muted; },
    get canSpeak() { return !!synth && !!voice; },
    get canListen() { return !!SR; },
    get listening() { return listening; },
    get speaking() { return speaking; },
    get quality() { return quality(); },
    get current() { return voice ? voice.name : ""; },
    /* voix françaises utilisables, la meilleure d'abord */
    voices() {
      const ok = list.filter(x => x.s > -50);
      return (ok.length ? ok : list).map(x => ({ name: x.v.name, lang: x.v.lang, good: x.s >= 18, current: x.v === voice }));
    },
    choose(name) {
      const x = list.find(y => y.v.name === name);
      if (!x) return false;
      voice = x.v; wanted = name; store.set("sv8.voiceName", name);
      return true;
    },
    on_(ev, f) { (subs[ev] = subs[ev] || []).push(f); },
    arm() { armed = true; },
    toggle(v) {
      const on = v === undefined ? !isOn() : !!v;
      pref = on ? "1" : "0";
      store.set("sv8.voice", pref);
      if (!on) Voice.hush();
      return on;
    },
    /* son général coupé : plus aucune phrase ne part, et celle en cours s'arrête */
    mute(v) { muted = !!v; if (muted) Voice.hush(); },
    /* renvoie true si la phrase part vraiment en synthèse */
    speak(text) {
      if (muted || !isOn() || !synth || !armed) return false;
      const clean = String(text).replace(/\s*\[À (REMPLIR|VALIDER)\]/g, "").trim();
      if (!clean) return false;
      try {
        synth.cancel();
        const u = new SpeechSynthesisUtterance(clean);
        if (!voice) pick();
        if (voice) { u.voice = voice; u.lang = voice.lang; } else u.lang = "fr-FR";
        u.rate = 1.02; u.pitch = 1; u.volume = 1;          /* voix naturelle : ni ralentie ni déformée */
        u.onstart = () => { speaking = true; emit("talk", true); };
        u.onend = u.onerror = () => { speaking = false; emit("talk", false); };
        synth.speak(u);
        return true;
      } catch (e) { return false; }
    },
    hush() { if (synth) synth.cancel(); speaking = false; emit("talk", false); },
    listen() {
      if (!SR || listening) return false;
      try {
        if (synth) synth.cancel();
        rec = new SR();
        rec.lang = "fr-FR"; rec.interimResults = true; rec.continuous = false; rec.maxAlternatives = 1;
        let final = false;
        rec.onresult = e => {
          const r = e.results[e.results.length - 1];
          if (r.isFinal) final = true;
          emit("heard", r[0].transcript, r.isFinal);
        };
        rec.onerror = e => emit("error", e.error || "erreur");
        rec.onend = () => { listening = false; emit("listen", false); if (!final) emit("silence"); };
        rec.start();
        listening = true; emit("listen", true);
        return true;
      } catch (e) { listening = false; emit("error", "indisponible"); return false; }
    },
    stop() { if (rec && listening) { try { rec.stop(); } catch (e) {} } },
    /* texte libre -> intention */
    intent(text) {
      const n = norm(text);
      for (const [type, id, re] of INTENTS) if (re.test(n)) return { type, id, text: n };
      return { type: "unknown", text: n };
    }
  };
  window.Voice = Voice;
})();
