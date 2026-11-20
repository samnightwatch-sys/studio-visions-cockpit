/* =====================================================================
   STUDIO VISIONS v8 — POSTE DE PILOTAGE
   Tous les textes du site. Aucun texte en dur dans app.js.
   Règles : tutoiement, français de Belgique, phrases courtes.
   Balises [À REMPLIR] / [À VALIDER] : surlignées en mode brouillon.
   ===================================================================== */
window.SV = {
  draft: true,
  version: "v8.7-a",
  oracleUrl: "#oracle",
  /* le site Framer : c'est le site personnel de Sam (son parcours, ses images), pas « le site du studio » */
  home: { url: "https://fantastic-terms-202563.framer.app/", label: "Le site perso de Sam" },
  signature: "Poste de pilotage — développé par Studio Visions",
  media: "media/",
  img: "img/",

  boot: [
    ["NWF-01 « VEILLEUR » — SÉQUENCE DE DÉMARRAGE", "v8.0"],
    ["(c) 2026 NIGHT WATCH FORCES", "夜警"],
    ["ALIMENTATION PRINCIPALE", "OK"],
    ["CENTRALE INERTIELLE — LA ROCHE-EN-ARDENNE 50°11′N 05°34′E", "ALIGNÉE"],
    ["LIDAR", "EN ROTATION"],
    ["CHARGE UTILE : 41 BRIQUES / 6 FAMILLES", "ARRIMÉE"],
    ["CAP 2030", "VERROUILLÉ"],
    ["COPILOTE ORACLE", "EN ATTENTE"]
  ],

  title: {
    presents: "NIGHT WATCH FORCES présente",
    kicker: "Agence de pub · print · web · campagnes · IA",
    name: "Studio Visions",
    tag: "(SV® — Poste de pilotage)",
    jp: "スタジオ・ビジョンズ",
    line: "Créer le futur. Résoudre le présent.",
    sub: "Une agence de pub complète, portée par un imprimeur de métier : print de luxe, sites, campagnes, pitchs. Petit ou grand budget. Et si tu veux aller plus vite, on ajoute l'IA.",
    /* même entrée que le site officiel : un grand bouton avec le son, un lien sans le son */
    start: "Décoller",
    quiet: "Entrer sans le son",
    oath: "Le serment",
    place: "La Roche-en-Ardenne · Bruxelles",
    /* l'accueil se lit comme le menu d'un jeu : quatre entrées numérotées (touches 1 à 4) */
    playCap: "Le poste de pilotage",
    modesLabel: "Les autres entrées",
    modes: {
      oracle: { n: "02", label: "Talk with the Nightwatch Oracle", desc: "Ton projet chiffré en cinq questions" },
      site: { n: "03", label: "Vers moi ↗", desc: "Sam Ahodikpe : mon site perso, mon parcours, mes images" },
      oath: { n: "04", label: "Le serment", desc: "La promesse de la Nightwatch" }
    },
    /* le menu, dit comme dans un jeu : un mot de jeu, puis ce que ça fait */
    game: {
      label: "Menu principal",
      start: ["NEW GAME", "Entrer dans le poste de pilotage"],
      cont: ["CONTINUE", "Reprendre le vol"],
      oracle: ["MISSION ORACLE", "Talk with the Nightwatch Oracle : ton projet chiffré"],
      site: ["SPECIAL ↗", "Vers moi : le site perso de Sam"],
      oath: ["CINEMATIC", "Le serment de la Nightwatch"],
      options: ["OPTIONS", ""],
      soundOn: "Son : activé",
      soundOff: "Son : coupé",
      hint: "↑ ↓ CHOISIR · ENTRÉE VALIDER · CLIC DANS LE VIDE : TRANSFORMER",
      hintTouch: "TOUCHE UNE LIGNE · TOUCHE LE VIDE POUR TRANSFORMER"
    },
    /* relevés de la scène de particules : libellés seulement, les valeurs viennent de la simulation */
    data: {
      helix: "ADN", galaxy: "Galaxie", count: "particules", morph: "Transformation", spin: "Rotation", fps: "Images / s", aim: "Viseur",
      strandA: "Brin A", strandB: "Brin B", link: "Paire de bases", atom: "Atome", dust: "Poussière",
      pair: "Paire", angle: "Angle", depth: "Profondeur", radius: "Rayon",
      bulge: "Bulbe", arm: "Bras", disc: "Disque", halo: "Halo", star: "Étoile lointaine", inRing: "Dans le viseur"
    }
  },

  /* ---------- LA PORTE D'ENTRÉE : rien ne démarre avant le premier geste (les navigateurs l'exigent pour le son) ---------- */
  gate: {
    start: "PRESS START",
    quiet: "Démarrer sans le son",
    hint: "ENTRÉE OU CLIC",
    hintTouch: "TOUCHE POUR DÉMARRER"
  },

  /* ---------- SON ET VOIX : un seul bouton, toujours visible, coupe tout ---------- */
  sound: {
    off: ["Couper le ", "son"],
    on: ["Activer le ", "son"],
    offTip: "Couper tous les sons et la voix du copilote",
    onTip: "Activer les sons et la voix du copilote",
    toastOff: "SON ET VOIX COUPÉS",
    toastOn: "SON ACTIVÉ"
  },

  /* Serment original de la Nightwatch (texte propre au studio). */
  oath: {
    label: "LE SERMENT DE LA NIGHTWATCH",
    jp: "夜警の誓い",
    lines: [
      "Quand les écrans s'éteignent, la Nightwatch s'allume.",
      "Je veille sur chaque image comme sur un plan de cinéma.",
      "Je ne livrerai rien de tiède. Rien de faux. Rien de « correct ».",
      "Je suis le cadre qui tient, la lumière qui révèle, l'œil qui ne dort pas.",
      "Je sers l'histoire de ceux qui me confient la leur.",
      "Je signe chaque pièce comme si c'était la dernière."
    ],
    motto: "CREATIVE FOREVER & EVER",
    hold: "MAINTIENS ENTRÉE POUR SCELLER",
    holdTouch: "MAINTIENS LE DOIGT POUR SCELLER",
    sealed: "SERMENT SCELLÉ",
    welcome: "BIENVENUE DANS LA NIGHTWATCH"
  },

  hud: {
    brand: "Studio Visions",
    unit: "NWF",
    status: "VEILLE ACTIVE",
    statusJp: "警戒中",
    alert: "ALERTE — LIAISON ORACLE",
    alertJp: "警報",
    oracle: "Talk with the Nightwatch Oracle",
    ticker: "IA GÉNÉRATIVE // ASSISTANTS IA // AUTOMATISATION // FORMATION // VIDÉO & CINÉMA // SITES WEB // IDENTITÉS // CAP 2030 // ",
    keys: [["↑ ↓", "NAVIGUER"], ["1–7", "MISSION"], ["O", "ORACLE"], ["ÉCHAP", "RETOUR"], ["M", "SON"]]
  },

  transmission: {
    head: "TRANSMISSION ENTRANTE",
    jp: "通信",
    from: "COMMANDEMENT — STUDIO VISIONS",
    text: "Ici le commandement. Tu es au QG de Studio Visions. À gauche, tes missions. En rouge, l'Oracle : cinq questions, et tu repars avec ton plan de progression IA jusqu'en 2030, chiffré. Bonne veille.",
    ok: "COMPRIS"
  },

  missions: [
    { id: "briefing",      n: "01", label: "BRIEFING",      jp: "ブリーフィング", sub: "Le studio", say: "le briefing",
      desc: "Qui pilote, ce qu'on sait faire, et pourquoi l'IA se dirige comme du cinéma." },
    { id: "arsenal",       n: "02", label: "ARSENAL",       jp: "装備",         sub: "Services", say: "l'arsenal",
      desc: "Six familles de services. L'IA et l'automatisation en tête, chaque brique en trois niveaux." },
    { id: "operations",    n: "03", label: "OPÉRATIONS",    jp: "作戦記録",      sub: "Projets", say: "les opérations",
      desc: "Douze dossiers livrés : identités, films, univers. Chaque opération a son dossier." },
    { id: "terrains",      n: "04", label: "TERRAINS",      jp: "地形",         sub: "Secteurs", say: "les terrains",
      desc: "Six secteurs qu'on connaît par cœur, de la PME à la culture." },
    { id: "protocole",     n: "05", label: "PROTOCOLE",     jp: "手順",         sub: "Méthode", say: "le protocole",
      desc: "Quatre temps, pas un de plus. Et le comparatif avec une agence classique." },
    { id: "renseignement", n: "06", label: "RENSEIGNEMENT", jp: "情報",         sub: "Journal et questions", say: "le renseignement",
      desc: "Ce qu'on a appris en faisant, et les questions qu'on nous pose." },
    { id: "liaison",       n: "07", label: "LIAISON",       jp: "通信",         sub: "Contact", say: "la liaison",
      desc: "Le formulaire, le téléphone, ou l'Oracle qui chiffre ton plan." }
  ],

  /* ---------- VISUELS-MÉTÉORITES ----------
     items vide = les douze opérations. Pour d'autres visuels (par exemple synchronisés
     depuis Notion) : [{ src, label, href }]. */
  meteors: { items: [] },

  /* ---------- POSTE DE PILOTAGE ---------- */
  deck: {
    callsign: "NWF-01 « VEILLEUR »",
    chips: ["PILOTE AUTO", "LIDAR", "LIAISON BRU"],
    nav: "NAV — CAPS",
    target: "CAP SÉLECTIONNÉ",
    copilot: "COPILOTE — ORACLE",
    engage: "ENGAGER",
    back: "RETOUR AU VOL",
    talk: "PARLER",
    command: "MENU",
    prompt: "ENTRÉE POUR ENGAGER",
    keys: "← → OU MOLETTE : CAP · ENTRÉE : OUVRIR · / : MENU · N : VISION · M : SON",
    hello: "Poste de pilotage en ligne. Sept caps disponibles. Choisis un cap, ou ouvre le menu.",
    toward: "Cap sur",
    inFlight: "On est déjà en vol. Choisis un cap.",
    help: "Tu peux dire : arsenal, opérations, oracle, contact, ou retour.",
    unknown: "Pas compris. Dis par exemple : arsenal, opérations, oracle ou contact.",
    noMic: "Pas de micro disponible ici. Tape ta commande.",
    micDenied: "Micro refusé. Tape ta commande à la place.",
    voiceHello: "Voix en ligne.",
    voiceOn: "VOIX ACTIVÉE",
    voiceOff: "VOIX COUPÉE",
    voiceNone: "Pas de voix française correcte sur cet appareil. Le copilote reste à l'écrit.",
    voiceNeedsSound: "Le son est coupé. Active-le pour entendre la voix.",
    cmdPlaceholder: "Où veux-tu aller ? Tape un cap, « oracle », « contact »…",
    cmdHint: "↑ ↓ CHOISIR · ENTRÉE VALIDER · ÉCHAP FERMER",
    /* le menu : tout le site en une liste, au clavier, à la souris ou au doigt */
    menu: {
      caps: "Caps",
      actions: "Actions",
      voices: "Voix du copilote",
      back: "Retour au vol",
      soundOff: "Couper le son et la voix",
      soundOn: "Activer le son",
      voiceOff: "Couper la voix du copilote",
      voiceOn: "Activer la voix du copilote",
      voicePick: "Changer la voix du copilote",
      voiceBack: "Retour au menu",
      voiceCurrent: "voix actuelle",
      vision: "Vision",
      oath: "Le serment",
      title: "Écran d'accueil",
      ask: "Dire au copilote"
    },
    /* aide de première visite, une seule fois */
    coach: {
      keys: [["Tourne", "← → ou la molette"], ["Ouvre", "Entrée"], ["Menu", "/"]],
      touch: [["Tourne", "glisse, ou penche le téléphone"], ["Accélère", "garde le doigt posé"], ["Ouvre", "touche le losange"]],
      ok: "Compris"
    },
    /* les quatre visions, proposées sur le poste (touche N) */
    vision: {
      label: "Vision",
      modes: { std: "Claire", nv: "Nuit", thermal: "Thermique", red: "Rouge" },
      toast: { std: "VISION CLAIRE", nv: "VISION NOCTURNE", thermal: "VISION THERMIQUE", red: "VISION ROUGE" },
      current: "active"
    },
    /* téléphone : on penche l'appareil pour tourner, comme un manche */
    tilt: {
      cta: "Piloter en penchant",
      on: "PENCHE LE TÉLÉPHONE POUR TOURNER",
      off: "PILOTAGE PAR INCLINAISON COUPÉ",
      denied: "CAPTEUR DE MOUVEMENT REFUSÉ OU INDISPONIBLE",
      menuOn: "Piloter en penchant le téléphone",
      menuOff: "Couper le pilotage par inclinaison"
    },
    skip: "Aller à la navigation",
    tabs: "Caps",
    close: "Fermer",
    states: { idle: "EN VEILLE", talk: "PARLE", listen: "ÉCOUTE" },
    meteor: {
      intro: "Visuels en approche. Clique sur l'un d'eux pour ouvrir son dossier.",
      hint: "OUVRIR LE DOSSIER",
      none: "Aucun visuel en vue pour l'instant."
    }
  },

  /* ---------- 01 BRIEFING ---------- */
  briefing: {
    title: "L'IA, dirigée comme du cinéma.",
    text: "Commerces, PME et agences veulent l'IA, l'image et l'automatisation. Rares sont ceux qui ont un studio capable de faire les trois. Studio Visions les réunit sous un même toit : des images de niveau cinéma, des process qui tournent seuls, des équipes formées aux outils qui arrivent. Quarante ans de création derrière, une chaîne d'outils IA déjà en production devant.",
    quote: "[À VALIDER] « Une image qui ne fait rien ressentir ne vend rien. »",
    sign: "Samuel Ahodikpe, Partner & Art Director",
    stats: [
      { v: "41", u: "", l: "briques de service au catalogue" },
      { v: "3", u: "", l: "niveaux de qualité par brique : Essentiel, Studio, Signature" },
      { v: "2030", u: "", l: "l'horizon de chaque plan de progression construit par l'Oracle" },
      { v: "1", u: "", l: "seul interlocuteur, du brief à la livraison" }
    ],
    agent: {
      code: "AGENT RÉFÉRENT",
      name: "Samuel Ahodikpe",
      role: "Partner & Art Director",
      text: "Quarante ans de création sur tous les supports, du print au cinéma, et aujourd'hui à la direction des outils d'IA.",
      img: "credit.jpg",
      alt: "Buste noir de profil, contour éclairé en rouge"
    },
    units: [
      { n: "SV", name: "Studio Visions", l: "Le studio créatif de Night Watch Forces." },
      { n: "PV", name: "Pretoria V", l: "Le pôle cinéma et univers de film." },
      { n: "LAB", name: "NWF Lab", l: "La recherche, la formation et l'installation d'outils de nouvelle génération." }
    ],
    alliesLabel: "ILS NOUS ONT FAIT CONFIANCE",
    alliesLine: "Des artisans, des marques et des entrepreneurs qui voulaient mieux que « correct ».",
    allies: ["Raskin Entreprise Générale", "DIM Toiture", "Ponomarov Toitures", "Wood-up House", "[À REMPLIR]"]
  },

  /* ---------- 02 ARSENAL ---------- */
  arsenal: {
    title: "Tout ce qu'on sait faire, en six familles.",
    sub: "Chaque famille se décline en briques, chaque brique en trois niveaux. Tu prends ce dont tu as besoin, rien de plus.",
    families: [
      { n: "1", name: "IA GÉNÉRATIVE", line: "La puissance d'une production de studio, sans le plateau.",
        intro: "Séries de visuels cohérents, voix off en plusieurs langues, campagnes vidéo avec personnages et lieux constants. L'IA est un outil, la direction reste humaine.",
        items: ["Visuels produits et lieux", "Voix off multilingues", "Campagnes vidéo IA", "Production en marque blanche"],
        who: ["Marques", "Agences en marque blanche", "Projets immobiliers"] },
      { n: "2", name: "AUTOMATISATION & NWF LAB", line: "Tes tâches répétitives, prises en charge. Tes équipes, formées.",
        intro: "Prise de commande, devis, relances, publication, tableaux de bord : on relie tes outils pour que ton entreprise tourne pendant que tu travailles. Et on forme tes équipes aux nouveaux outils.",
        items: ["Prise de commande et devis", "Relances et publication automatiques", "Tableaux de bord Notion", "Formation et installation"],
        who: ["TPE et PME", "Commerces", "Équipes qui veulent se former"] },
      { n: "3", name: "VIDÉO, MOTION & CINÉMA", line: "Des teasers aux univers de film, avec Pretoria V.",
        intro: "Teaser de quinze secondes ou univers de film complet avec Pretoria V : on écrit, on génère, on monte et on étalonne, avec une musique sous licence.",
        items: ["Teasers et reels", "Logo animé", "Films de marque", "Direction artistique de film"],
        who: ["Marques et lancements", "Réseaux sociaux", "Cinéma et culture"] },
      { n: "4", name: "SITES WEB", line: "Des sites qui vendent pendant que tu dors.",
        intro: "Vitrine, réservation, paiement, plusieurs langues : on construit des sites rapides, beaux sur téléphone, et pensés pour transformer une visite en demande.",
        items: ["Site vitrine", "Site avec réservation ou paiement", "Multilingue", "Maintenance et évolution"],
        who: ["PME et services", "Artisans et entreprises du bâtiment", "Commerces en ligne"] },
      { n: "5", name: "IDENTITÉ DE MARQUE", line: "Un logo, une voix, des règles. Pour que tout se reconnaisse du premier coup d'œil.",
        intro: "Un logo seul ne fait pas une marque. On construit le système complet : signe, couleurs, typographies, règles, déclinaisons, pour que chaque support parle d'une seule voix.",
        items: ["Logo et refonte", "Palette et typographies", "Guide d'utilisation", "Déclinaisons réseaux"],
        who: ["Entreprises qui se lancent", "Artisans qui montent en gamme", "Marques qui se sont éparpillées"] },
      { n: "6", name: "DESIGN & PRINT", line: "Des supports qui donnent envie avant même d'être lus.",
        intro: "Une affiche, un packaging ou une carte, c'est le premier contact avec ton client. On les conçoit pour qu'ils travaillent pour toi : lisibles, désirables, prêts à imprimer.",
        items: ["Affiches et campagnes print", "Packaging et étiquettes", "Cartes, menus et papeterie", "Signalétique et salons"],
        who: ["Commerces et marques", "Hôtellerie et restauration", "Événements"] }
    ],
    levels: [
      { n: "I", name: "ESSENTIEL", l: "Le bon travail, rapidement. Idéal pour démarrer ou tester." },
      { n: "II", name: "STUDIO", l: "Le niveau pro : plus de recherche, plus de déclinaisons, plus de finitions." },
      { n: "III", name: "SIGNATURE", l: "Le haut de gamme : direction artistique complète, pièces uniques, suivi rapproché." }
    ],
    levelsNote: "Tu peux en avoir pour cent euros, mais tu n'auras pas la qualité d'un deux mille. Tu choisis en connaissance de cause."
  },

  /* ---------- 03 OPÉRATIONS ---------- */
  operations: {
    title: "Ce qu'on a livré.",
    sub: "Identités, sites, films, univers. Chaque opération a son dossier.",
    note: "[À VALIDER] Textes des dossiers repris de la v5.7.0, à relire.",
    list: [
      { k: "carpa", lab: "Night Watch Forces", year: "2026", role: "Armoiries, direction artistique",
        txt: "Le blason de l'agence. Un cheval ailé cabré sur la roche, la tour au fond, deux idéogrammes pour la veille de nuit. Gravé comme une plaque de métal, pas dessiné comme un logo. La devise en ruban : Creative Advanced Research Projects Agency.",
        imgs: ["carpa", "univers", "novice"], alt: "Blason Night Watch Forces : cheval ailé cabré sur un rocher, une tour, gravé comme une plaque de métal" },
      { k: "raskinbadge", lab: "Raskin, badge", year: "2026", role: "Identité, mise en situation",
        txt: "L'identité Raskin tenue dans la main. Le pictogramme maison en verre orange, rétro-éclairé, comme un objet qui existe. La mise en situation vend l'identité mieux qu'une planche.",
        imgs: ["raskinbadge", "raskinaff"], alt: "Badge Raskin tenu en main : pictogramme maison en verre orange rétroéclairé" },
      { k: "caprice", lab: "Caprice", year: "2026", role: "Blason, gravure",
        txt: "Deux sangliers dressés, une tour sur le rocher, le soleil qui se lève. Un blason d'argent pour un lieu qui voulait une histoire avant un logo. Tout est en relief, rien n'est plat.",
        imgs: ["caprice", "carpa"], alt: "Blason Caprice en argent : deux sangliers dressés, une tour sur un rocher, un soleil levant" },
      { k: "univers", lab: "Pretoria V, univers", year: "2026", role: "Concept art, monde",
        txt: "Le monde de Pretoria V en une planche : le vaisseau abandonné, la planète brûlée, les deux peuples, la tour, le terminal qui affiche encore Night Watch Force. Une image pour caler toute une équipe sur le même film.",
        imgs: ["univers", "novice", "elfe", "masque"], alt: "Concept art de Pretoria V : vaisseau abandonné, planète brûlée, une tour et un terminal" },
      { k: "novice", lab: "Novice", year: "2026", role: "Personnage, Pretoria V",
        txt: "Un personnage constant, reconnaissable sous tous les angles. Peau blanche, taches de rousseur, oreilles pointues, capuche de lin. Générée pour être regénérée cent fois sans changer de visage.",
        imgs: ["novice", "elfe", "univers"], alt: "Personnage de Pretoria V : peau blanche, taches de rousseur, oreilles pointues, capuche de lin" },
      { k: "elfe", lab: "Elfe", year: "2026", role: "Personnage, mode",
        txt: "Le même peuple, en lumière de studio. Or au cou, résine sur la peau, gants noirs. Entre le portrait de mode et la fiche de personnage. C'est là que l'univers devient une collection.",
        imgs: ["elfe", "novice", "masque"], alt: "Portrait en lumière de studio : collier d'or, gants noirs" },
      { k: "masque", lab: "Masque", year: "2026", role: "Portrait, mode",
        txt: "Un masque de crâne transparent, une mâchoire qui s'éclaire en rouge, une veste de cuir matelassé. Un portrait généré qui tient face à une vraie photo de mode.",
        imgs: ["masque", "elfe", "quatre"], alt: "Portrait : masque de crâne transparent, mâchoire éclairée en rouge, veste de cuir matelassé" },
      { k: "scarabee", lab: "Scarabée", year: "2026", role: "Objet, New Toys",
        txt: "Un scarabée de verre rouge, des haut-parleurs dans l'abdomen, la forêt la nuit. Un objet qui ne devrait pas exister, photographié comme s'il existait. La direction New Toys en une image.",
        imgs: ["scarabee", "veilleur", "masque"], alt: "Scarabée de verre rouge avec haut-parleurs, dans une forêt de nuit" },
      { k: "raskinaff", lab: "Raskin, affiche", year: "2026", role: "Identité, campagne",
        txt: "L'affiche de chantier. Photo de couvreur passée en noir et blanc, deux bandes orange, le pictogramme maison et les numéros à appeler. Elle se lit à dix mètres sous la pluie.",
        imgs: ["raskinaff", "raskinbadge"], alt: "Affiche de chantier Raskin : couvreur en noir et blanc, deux bandes orange, pictogramme maison" },
      { k: "quatre", lab: "Quatre", year: "2026", role: "Couverture, édition",
        txt: "Un regard, un voile vert brodé, quatre traits. La couverture d'une édition qui ne dit pas son nom. La matière, les paillettes et l'eau sur la peau font le luxe.",
        imgs: ["quatre", "masque", "elfe"], alt: "Couverture d'édition : regard derrière un voile vert brodé" },
      { k: "veilleur", lab: "Veilleur", year: "2026", role: "Plan généré, ambiance",
        txt: "Une silhouette debout sur l'arête d'un toit, la brume, l'aube orange. Un plan de teaser qui n'avait pas de tournage. Une image, une couleur, un mouvement.",
        imgs: ["veilleur", "scarabee", "univers"], alt: "Silhouette debout sur l'arête d'un toit dans la brume, aube orange" },
      { k: "sunny", lab: "Chicken Sunny", year: "2026", role: "Logo, mascotte 3D",
        txt: "Une mascotte de chrome pour une équipe qui voulait un écusson vivant. Le coq bandé, le ballon, les plumes en lames. Rendu en métal poli pour passer du maillot à l'écran.",
        imgs: ["sunny", "caprice", "raskinbadge"], alt: "Mascotte Chicken Sunny : coq en chrome poli avec un ballon" }
    ],
    alts: {
      carpa: "Blason Night Watch Forces : cheval ailé cabré sur un rocher, une tour",
      raskinbadge: "Badge Raskin : pictogramme maison en verre orange rétroéclairé",
      caprice: "Blason Caprice en argent : deux sangliers dressés, une tour, un soleil levant",
      univers: "Concept art de Pretoria V : vaisseau abandonné, planète brûlée",
      novice: "Personnage de Pretoria V : capuche de lin, oreilles pointues",
      elfe: "Portrait en lumière de studio : collier d'or, gants noirs",
      masque: "Portrait : masque de crâne transparent, mâchoire éclairée en rouge",
      scarabee: "Scarabée de verre rouge dans une forêt de nuit",
      raskinaff: "Affiche de chantier Raskin : couvreur en noir et blanc, bandes orange",
      quatre: "Couverture d'édition : regard derrière un voile vert brodé",
      veilleur: "Silhouette sur l'arête d'un toit dans la brume, aube orange",
      sunny: "Mascotte Chicken Sunny : coq en chrome poli"
    }
  },

  /* ---------- 04 TERRAINS ---------- */
  terrains: {
    title: "Six terrains qu'on connaît par cœur.",
    sub: "On ne vend pas la même chose à une PME et à un couvreur. On parle leur langue.",
    zones: [
      { z: "A", name: "PME & entreprises", t: "Devis, relances, tableaux de bord, assistants IA : on installe ce qui te rend des heures chaque semaine, et on forme ceux qui s'en servent.", x: 22, y: 30 },
      { z: "B", name: "Bâtiment & artisans", t: "Un savoir-faire solide mérite une image solide : identité, site, suivi de chantier et devis automatisés.", x: 63, y: 22 },
      { z: "C", name: "Immobilier & promotion", t: "Des projets qu'on voit avant qu'ils existent : visuels, films, 3D immersive, dossiers investisseurs.", x: 80, y: 58 },
      { z: "D", name: "Agences de communication", t: "Ton studio IA en marque blanche. Tu vends, on produit, ton client ne voit que toi.", x: 44, y: 54 },
      { z: "E", name: "Marques, commerces & hôtellerie", t: "Campagnes, packaging, réseaux, cartes : une marque cohérente sur chaque point de contact, en salle comme à l'écran.", x: 18, y: 74 },
      { z: "F", name: "Culture, cinéma & événements", t: "Affiches, teasers, univers visuels. Là où le cinégraphisme est né.", x: 60, y: 82 }
    ]
  },

  /* ---------- 05 PROTOCOLE ---------- */
  protocole: {
    title: "Quatre temps, pas un de plus.",
    steps: [
      { n: "01", name: "Tu parles à l'Oracle", t: "Cinq questions : qui tu es, où tu en es avec l'IA, ta priorité, ton horizon, ton budget. Tu repars avec ton plan jusqu'en 2030." },
      { n: "02", name: "On chiffre au détail", t: "Chaque brique en Essentiel, Studio ou Signature. Tu vois exactement ce que tu paies." },
      { n: "03", name: "On produit et on installe", t: "Tu valides aux étapes clés, jamais de surprise à la livraison." },
      { n: "04", name: "On fait progresser", t: "Formation, maintenance, veille : ton entreprise monte d'un niveau à chaque phase." }
    ],
    compareLabel: "ANALYSE TACTIQUE",
    compareTitle: "Studio Visions contre l'agence classique.",
    compareSub: "Même exigence, sans la lourdeur.",
    cols: ["CRITÈRE", "Studio Visions", "AGENCE CLASSIQUE"],
    rows: [
      ["IA", "Dans chaque process, installée et expliquée à ton équipe.", "Un outil de plus, sans méthode."],
      ["Délai", "Premiers visuels en 48 à 72 h.", "Trois semaines avant la première maquette."],
      ["Interlocuteur", "Un seul, qui fait lui-même.", "Commercial, chef de projet, créatif, sous-traitant."],
      ["Production", "Tes vraies images, augmentées par l'IA.", "Banques d'images et gabarits."],
      ["Prix", "Détaillé brique par brique, en trois niveaux.", "Forfait global, dépassements en fin de projet."],
      ["Qualité", "Standard cinéma, même pour un menu.", "Selon le junior disponible."],
      ["Cohérence", "Site, vidéo, réseaux et automatisation se tiennent.", "Chaque prestataire repart avec sa pièce."],
      ["Horizon", "Un plan en phases jusqu'en 2030.", "Le projet suivant, au coup par coup."]
    ]
  },

  /* ---------- 06 RENSEIGNEMENT ---------- */
  renseignement: {
    title: "Ce qu'on a appris en faisant.",
    sub: "Des idées courtes, directement utilisables.",
    articles: [
      { cat: "IA GÉNÉRATIVE", date: "[À REMPLIR]", title: "IA générative : ce qu'on fait avec, ce qu'on ne fait jamais.",
        chapo: "L'outil est puissant. Il faut donc des règles.",
        body: [
          "Ce qu'on fait : partir de tes vraies images et les augmenter, générer des plans impossibles à tourner pour ton budget, décliner une campagne en dix formats, prêter une voix en plusieurs langues à ta vidéo.",
          "Ce qu'on ne fait jamais : faire passer une image générée pour une preuve (un chantier, un plat, un résultat), utiliser le visage ou la voix de quelqu'un sans son accord, livrer un fichier dont on ne maîtrise pas les droits.",
          "L'IA accélère. La direction artistique, elle, reste humaine."
        ] },
      { cat: "MÉTHODE", date: "[À REMPLIR]", title: "Essentiel, Studio ou Signature : comment choisir ton niveau.",
        chapo: "Le même service, trois ambitions. Voici comment trancher.",
        body: [
          "Choisis Essentiel si tu dois tester une idée, ouvrir vite ou tenir un petit budget. C'est du travail propre, livré rapidement.",
          "Choisis Studio si la pièce va vivre longtemps et représenter ton entreprise : plus de recherche, plus de déclinaisons, plus de finitions.",
          "Choisis Signature si c'est ta pièce maîtresse : lancement, marque haut de gamme, projet qui doit marquer les esprits. Direction artistique complète et suivi rapproché.",
          "Tu peux mélanger : un site en Studio, un menu en Essentiel, un teaser en Signature. L'Oracle te montre le total en direct."
        ] },
      { cat: "VIDÉO & CINÉMA", date: "[À REMPLIR]", title: "Cinégraphisme : pourquoi on éclaire un plat du jour comme une scène de film.",
        chapo: "Parce que l'émotion vend mieux que l'information.",
        body: [
          "Le cinéma a cent ans d'avance sur la publicité pour une raison simple : il sait faire ressentir. Cadrer, éclairer, choisir un rythme, laisser respirer une image.",
          "Le cinégraphisme, c'est appliquer ces règles à tout ce qu'on fabrique, même à un visuel fixe.",
          "Concrètement, avant de dessiner, on se pose trois questions de réalisateur : qu'est-ce que le spectateur doit ressentir, où doit aller son regard, et que doit-il faire juste après ? Les réponses changent tout, même sur une affiche A4."
        ] },
      { cat: "DESIGN & PRINT", date: "[À REMPLIR]", title: "Le menu est ta première publicité.",
        chapo: "Avant de goûter, ton client lit. Et il décide souvent là.",
        body: [
          "Un menu n'est pas une liste de prix. C'est la seule publicité que ton client tient en main pendant plusieurs minutes, assis, disponible. Trois règles suffisent à le rendre efficace.",
          "Un : une hiérarchie claire. L'œil doit trouver en deux secondes les plats que tu veux vendre, pas ceux qui te rapportent le moins.",
          "Deux : une identité. Le menu doit ressembler à ta salle, à ta cuisine, à toi. Un gabarit trouvé en ligne dit le contraire.",
          "Trois : des déclinaisons. Table, comptoir, vitrine, QR code, réseaux : le même menu doit vivre partout sans être refait à chaque fois.",
          "C'est souvent par là qu'on commence avec un restaurant. Puis viennent les photos, le site, la vidéo."
        ] }
    ],
    faqLabel: "QUESTIONS",
    faqTitle: "Les questions qu'on nous pose.",
    faq: [
      ["C'est quoi, le cap 2030 ?", "Un plan de progression en phases : ce que tu gagnes tout de suite, ce que tu structures en 2027, ce que tu accélères en 2028, et l'entreprise que tu veux être en 2030. L'Oracle te le construit en deux minutes."],
      ["Combien ça coûte ?", "Ça dépend de ce que tu prends et du niveau choisi. Chaque brique existe en Essentiel, Studio et Signature, avec son prix. L'Oracle chiffre ton plan phase par phase."],
      ["En combien de temps c'est livré ?", "Un menu ou un visuel : 48 à 72 h. Un site vitrine ou une identité : une à deux semaines. Un lancement complet : trois à six semaines."],
      ["Vous utilisez l'IA ? Ça se voit ?", "Oui, et non. L'IA accélère la production, on part de tes vraies images et on dirige chaque plan. Le résultat doit tenir la comparaison avec un tournage."],
      ["Faut-il un code pour parler à l'Oracle ?", "Non pour le diagnostic : il est ouvert. Pour transmettre ton plan, on te demande qui tu es, on préfère savoir à qui on parle. Si on t'a donné un code Nightwatch, tu l'entres à ce moment-là."],
      ["Vous travaillez hors de Belgique ?", "Oui. Le studio est à La Roche-en-Ardenne, avec un pied à Bruxelles, et on livre partout où arrive un fichier."],
      ["Et après la livraison ?", "Tu gardes tes fichiers sources. Si tu veux, on reste à tes côtés : maintenance, nouveaux contenus, direction créative au mois."]
    ]
  },

  /* ---------- 07 LIAISON ---------- */
  liaison: {
    title: "Dis-nous ce que tu veux.",
    sub: "Deux chemins : le formulaire classique, ou l'Oracle qui construit ton plan IA en deux minutes.",
    form: {
      name: "Nom", company: "Entreprise", email: "Email", phone: "Téléphone (facultatif)",
      what: "Ce que tu veux faire", budget: "Budget indicatif", delay: "Délai souhaité",
      budgets: ["Moins de 500 €", "500 à 2 000 €", "2 000 à 5 000 €", "Plus de 5 000 €", "Je ne sais pas encore"],
      send: "Envoyer",
      sending: "TRANSMISSION EN COURS",
      ok: "Reçu. On revient vers toi sous 24 h ouvrées. [À VALIDER]",
      fallback: "Le serveur ne répond pas ici. Ton logiciel de mail s'ouvre avec le message prêt.",
      invalid: "Il manque ton nom, ton email ou ce que tu veux faire."
    },
    directLabel: "EN DIRECT",
    email: "sam@studiovisions.io",
    phone: "+32 494 92 66 00",
    phoneHref: "+32494926600",
    place: "La Roche-en-Ardenne, Belgique, et Bruxelles sur rendez-vous",
    final: "Une affiche pour la semaine prochaine ou une campagne complète : dis-nous ce qu'il te faut, on te dit ce que ça coûte."
  },

  /* ---------- ORACLE : ton projet chiffré, en cinq questions ----------
     Une agence de pub complète : print, identité, site, campagne, vidéo, pitch, événement.
     Petit ou grand budget. L'IA est une option : proposée à la question 4, et encore dans le plan. */
  oracle: {
    label: "LIAISON ORACLE",
    jp: "神託",
    canal: "CANAL SÉCURISÉ",
    voice: { answer: "RÉPONDRE À LA VOIX", retry: "Pas compris. Dis le numéro de ta réponse." },
    intro: {
      kicker: "ORACLE — TON PROJET CHIFFRÉ",
      title: "Dis-moi ce qu'il te faut.",
      text: "Print de luxe, identité, site, campagne, film, pitch : l'Oracle compose ton plan et le chiffre avec la grille réelle du studio, sur trois niveaux. Cinq questions, deux minutes. Petit ou grand budget.",
      start: "OUVRIR LA LIAISON",
      alt: "Je préfère le formulaire",
      say: "Liaison ouverte. Cinq questions. Réponds juste, pas joli."
    },
    steps: [
      { key: "who", tag: "IDENTITÉ", video: "lr-1", q: "Qui es-tu ?", say: "Commençons. Qui es-tu ?",
        opts: [
          { v: "pme", t: "Une PME, une entreprise de services", r: "Une PME. On te donne l'image d'une grande, sans le budget d'une grande." },
          { v: "btp", t: "Le bâtiment, un artisan", r: "Le bâtiment. On fait voir ton sérieux avant même le premier rendez-vous." },
          { v: "immo", t: "L'immobilier, la promotion", r: "L'immobilier. Faire voir un projet avant qu'il existe, c'est notre métier." },
          { v: "agence", t: "Une agence de communication", r: "Une agence. Tu vends, on produit sous ton nom. Ton client ne voit que toi." },
          { v: "marque", t: "Une marque, un commerce, un lieu", r: "Une marque. Elle doit exister partout, au niveau d'une vraie campagne." },
          { v: "culture", t: "La culture, le cinéma, l'événementiel", r: "La culture. Affiches, identités, films : on parle la même langue." }
        ] },
      { key: "prio", tag: "BESOIN", video: "lr-2", multi: 3, q: "Qu'est-ce qu'on fait pour toi ?", say: "Qu'est-ce qu'on fait pour toi ? Trois choix maximum.",
        opts: [
          { v: "print", t: "Du print : affiches, menus, packaging, édition" },
          { v: "ident", t: "Une identité : logo, charte, univers de marque" },
          { v: "site", t: "Un site internet qui vend" },
          { v: "campagne", t: "Une campagne : pub, réseaux sociaux, lancement" },
          { v: "video", t: "De la vidéo : teaser, film, motion" },
          { v: "pitch", t: "Un pitch, une présentation, un dossier" },
          { v: "event", t: "Un événement : identité, affiches, images" }
        ], r: "Noté. C'est le métier : on sait le faire." },
      { key: "horizon", tag: "DURÉE", video: "lr-3", q: "Un coup ponctuel, ou on construit ?", say: "Un coup ponctuel, ou on construit dans la durée ?",
        opts: [
          { v: 1, t: "Un besoin précis, livré vite", s: "PHASE 01", r: "Un besoin, une livraison. Les phases suivantes restent fermées, tu pourras les ouvrir." },
          { v: 2, t: "Une année de communication", s: "PHASES 01 À 02", r: "Une année. On pose les bases, puis on fait vivre." },
          { v: 4, t: "Un plan jusqu'en 2030", s: "PHASES 01 À 04", r: "Jusqu'en 2030. Chaque phase prépare la suivante." }
        ] },
      { key: "level", tag: "IA", video: "lr-4", q: "Et l'IA, on en met ?", say: "Et l'IA, on en met ? Ça va plus vite, ça peut rapporter, et ça a un prix.",
        opts: [
          { v: 0, t: "Non. Du métier, fait main", s: "SANS IA", r: "Sans IA. Du métier, fait main. Ça nous va très bien." },
          { v: 1, t: "Un peu, pour produire plus vite", s: "IA EN PRODUCTION", r: "Un peu d'IA en production : plus d'images, plus vite. Elle a un coût, elle le rend en délais." },
          { v: 2, t: "Oui, pour automatiser et gagner du temps", s: "IA ET AUTOMATISATION", r: "On automatise ce qui te prend du temps. Ça coûte au départ, ça rapporte ensuite." },
          { v: 3, t: "À fond : assistant, formation, tout brancher", s: "IA PARTOUT", r: "À fond. Assistant, formation, outils branchés. C'est un vrai chantier, on le découpe en phases." }
        ] },
      { key: "budget", tag: "BUDGET", video: "lr-5", q: "Quel budget pour commencer ?", say: "Dernière question. Quel budget pour commencer ? Petit ou grand, on prend.",
        opts: [
          { v: "b00", t: "Moins de 500 €", max: 500, tier: "E", r: "Petit budget. Tu veux un petit truc, on te fait un petit truc. Bien fait." },
          { v: "b1", t: "500 à 2 000 €", max: 2000, tier: "E", r: "Jusqu'à deux mille. On choisit peu, et on le fait bien." },
          { v: "b2", t: "2 000 à 10 000 €", max: 10000, tier: "S", r: "Jusqu'à dix mille. De quoi poser une vraie première phase." },
          { v: "b3", t: "10 000 à 30 000 €", max: 30000, tier: "S", r: "Jusqu'à trente mille. On peut mener une vraie campagne." },
          { v: "b4", t: "Plus de 30 000 €", max: 999999, tier: "X", r: "Plus de trente mille. On parle d'un programme. On bloque un calendrier." },
          { v: "b0", t: "Je ne sais pas encore", max: 999999, tier: "S", r: "Tu ne sais pas encore. Normal. Je te place au niveau Studio, tu montes ou tu descends." }
        ] }
    ],
    computing: "Je compose ton plan.",
    calc: ["LECTURE DU BESOIN", "SÉLECTION DES BRIQUES", "CHIFFRAGE SUR LA GRILLE 2026", "MISE EN PHASES"],
    planTag: "TON PLAN",
    planTitle: "Ton plan, phase par phase.",
    horizonTags: { 1: "UN BESOIN PRÉCIS", 2: "UNE ANNÉE", 4: "JUSQU'EN 2030" },
    /* l'IA reste une option proposée jusqu'au bout, avec son prix */
    ia: {
      none: "Ce plan est fait main, sans IA. Si tu veux aller plus vite, on peut en ajouter : ça accélère, ça peut rapporter, et ça a un coût.",
      some: "Il y a de l'IA dans ce plan. On peut en mettre plus : automatisation, assistant, formation.",
      full: "L'IA est partout dans ce plan. C'est un chantier : il est découpé en phases.",
      add: "Ajouter de l'IA",
      remove: "Retirer l'IA"
    },
    /* le rapport que le visiteur garde, signé du studio (les logos viendront plus tard) */
    report: {
      cta: "Enregistrer mon rapport (PDF)",
      title: "Rapport de l'Oracle",
      sub: "Plan chiffré",
      by: "Night Watch Forces",
      to: "Pour",
      rows: { who: "Profil", prio: "Besoin", horizon: "Durée", level: "IA", budget: "Budget de départ" },
      cols: ["Brique", "Niveau", "Prix HTVA", "Délai"],
      phase: "Phase",
      totals: ["Total phase 01", "Total du plan", "Récurrent, par mois"],
      note: "Montants HTVA, grille Studio Visions 2026. Indicatif jusqu'au devis signé.",
      fallback: "Le serveur ne répond pas ici : ton logiciel de mail s'ouvre avec le plan. Ton rapport, lui, est prêt."
    },
    phases: [
      { n: "01", when: "MAINTENANT — 0 À 3 MOIS", name: "Premiers gains", img: "phase-1", alt: "Bureau high-tech en activité, écrans allumés" },
      { n: "02", when: "2027", name: "Structurer", img: "phase-2", alt: "Ondes lumineuses abstraites en noir et blanc" },
      { n: "03", when: "2028", name: "Accélérer", img: "phase-3", alt: "Silhouette en cape face à une arche circulaire" },
      { n: "04", when: "CAP 2030", name: "L'entreprise augmentée", img: "phase-4", alt: "Descente depuis la stratosphère vers une ville" }
    ],
    locked: "FERMÉE — tu as choisi plus court",
    unlock: "Ouvrir jusqu'en 2030",
    tiers: {
      E: { name: "ESSENTIEL", say: "Essentiel : propre, juste, livré vite. Pour démarrer ou tester." },
      S: { name: "STUDIO", say: "Studio : plus de recherche, de déclinaisons, de finitions. Le niveau pro." },
      X: { name: "SIGNATURE", say: "Signature : direction complète, pièces uniques, suivi rapproché." }
    },
    verdict: {
      plan: "Voici ton plan. Règle chaque brique sur trois niveaux, le prix suit. Retire ce qui ne te sert pas.",
      none: "Plus aucune brique en phase 01. Rétablis-en au moins une, sinon je ne chiffre rien.",
      over: "La phase 01 dépasse ton budget de départ. Descends un niveau ou retire une brique. Ou assume : c'est souvent là que ça se joue.",
      under: "La phase 01 tient dans ton budget, avec de la marge pour monter d'un niveau.",
      ok: "La phase 01 tient dans ton budget. C'est cohérent.",
      sent: "Plan transmis. On te rappelle dans la journée. [À VALIDER]"
    },
    transmit: {
      title: "Transmettre le plan",
      text: "Le plan est libre. Dis-nous qui tu es : tu repars avec ton rapport signé Studio Visions, et on te rappelle pour en parler.",
      name: "Nom", company: "Entreprise", email: "Email", phone: "Téléphone (facultatif)",
      code: "Code Nightwatch (facultatif)",
      send: "Transmettre",
      sending: "TRANSMISSION EN COURS",
      invalid: "Il manque ton nom ou ton email.",
      badCode: "Ce code ne dit rien. Laisse vide si tu n'en as pas.",
      fallback: "Le serveur ne répond pas ici. Ton logiciel de mail s'ouvre avec le plan prêt.",
      codes: [
        { code: "1234", who: "Test" },
        { code: "SV-DEMO", who: "Démonstration" },
        { code: "NWF-NIKOS", who: "Nikos" },
        { code: "NWF-MEL", who: "Melissa" }
      ]
    }
  },

  footer: {
    line: "L'agence de pub et le studio créatif de Night Watch Forces. Créer le futur, résoudre le présent.",
    copy: "© 2026 Studio Visions — Night Watch Forces. CREATIVE FOREVER & EVER."
  }
};
