// Strecke "Finnland-Schotter" (seit M10b) – reine Daten, Format: docs/strecken-format.md
// Schnelle, flüssige Waldstrecke im Spätsommer-Abend: Kiefern- und Birkenwald, zwei Seen, ein Dorf mit zwei engen
// Ecken (Asphalt), Holzbrücke über einen Fluss, eine Spitzkehre, vier markierte Kuppen (später Sprünge, M10c).
// Der Verlauf kommt aus tools/finnland-entwurf.mjs (Gerade / Kurve mit Radius, Höhenprofil): dort ändern, nicht hier.

export default {
  format: 1,
  id: 'finnland',
  etappe: 'finnland',          // Kennung für Bestzeiten und letzten Lauf – nie ändern (sonst sind die Bestzeiten weg)
  name: { de: 'FINNLAND-SCHOTTER', en: 'FINLAND GRAVEL' },
  beschreibung: { de: 'SCHOTTER, KUPPEN, SEEN', en: 'GRAVEL, CRESTS, LAKES' },
  untergrundInfo: { de: 'SCHOTTER', en: 'GRAVEL' },
  laenge: 2795.676,             // Meter (Kontrolle: das Spiel rechnet nach, mehr als 0.5 m daneben = Fehlerseite)

  // Deko-Sets: was der Spielcode malt (Pixelbilder im Code)
  deko: {
    fahne: 'finnland',         // blau-weisse Fahnen (nordisches Kreuz)
    tier: 'rentier',           // Rentiere statt Kühe
    tierKlang: null,           // ... ohne Glocken (still)
    haus: 'holzhaus',          // rote Holzhäuser mit weissen Kanten
    stadel: 'holzschuppen',    // rote Schuppen
    nadelbaum: 'kiefer',       // Kiefern
    laubbaum: 'birke',         // Birken
  },

  // Markierte Kuppen: hier wird die Strecke in M10c abheben (heute ohne Wirkung, normale Kuppen)
  sprung: [
    { s: 699, name: 'KIEFERNKUPPE' },
    { s: 1645, name: 'BIRKENKUPPE' },
    { s: 2335, name: 'HOCHWALDKUPPE' },
    { s: 2653, name: 'SEEKUPPE' },
  ],

  // --- Zufallszahlen (gleiche Zahl = gleiche Welt) ---
  seeds: {
    gelaende: 2610, sprites: 2611, buesche: 2612, fernwald: 2613, berge: 2614, kuehe: 2615, nebenwegWald: 2616,
    stummelSichtschutz: 2617, absperrung: 2618, sperren: 2619, strassenrand: 2620, startZiel: 2621, leben: 2622,
    lebenZaun: 2623, lebenKuehe: 2624, umgebung: 2625,
  },

  // --- Abschnitte (wie bei den Alpen: baeume, wald, nah, voegel) ---
  abschnitte: {
    'Start am Waldrand': { baeume: 1.2, wald: 0.5, voegel: 0.9 },
    'Kiefernwald': { baeume: 2.6, wald: 1, nah: true, voegel: 1.0 },
    'Seeufer': { baeume: 0.55, wald: 0.15, voegel: 1.3 },
    'Dorf': { baeume: 0.12, wald: 0, voegel: 0.7 },
    'Birkenhain': { baeume: 2.0, wald: 0.5, nah: true, voegel: 1.3 },
    'Kehre am Hügel': { baeume: 1.8, wald: 0.7, voegel: 0.8 },
    'Hochwald': { baeume: 2.6, wald: 1, nah: true, voegel: 0.9 },
    'Zielgerade am See': { baeume: 0.3, wald: 0, voegel: 1.1 },
  },

  punkte: [
    // <punkte> (geschrieben von tools/finnland-entwurf.mjs – Entwurf dort ändern)
    'Start am Waldrand',
    [0.0, 0.0, 0.00],
    // gerade 180 m
    [0.0, -25.7, 1.08],
    [0.0, -51.4, 1.23],
    [0.0, -77.1, 0.73],
    [0.0, -102.9, 0.08],
    [0.0, -128.6, -0.22],
    [0.0, -154.3, 0.13],
    [0.0, -180.0, 1.11],

    'Kiefernwald',
    // Kurve rechts 40°, Radius 260 m
    [1.3, -205.9, 2.38],
    [5.2, -231.5, 3.41],
    [11.6, -256.6, 3.64],
    [20.4, -281.0, 2.78],
    [31.7, -304.3, 0.86],
    [45.2, -326.5, -1.73],
    [60.8, -347.1, -4.36],
    // gerade 70 m
    [75.8, -365.0, -6.25],
    [90.8, -382.9, -7.37],
    [105.8, -400.7, -7.61],
    // Kurve links 55°, Radius 200 m
    [120.1, -420.0, -7.11],
    [132.0, -440.8, -6.21],
    [141.3, -463.0, -5.36],
    [147.9, -486.0, -4.92],
    [151.7, -509.7, -5.06],
    [152.6, -533.7, -5.70],
    [150.6, -557.6, -6.53],
    [145.8, -581.1, -7.13],
    // gerade 150 m
    [139.3, -605.2, -7.65],
    [132.9, -629.4, -5.73],
    [126.4, -653.5, -1.83],
    [119.9, -677.7, -1.14],
    [113.4, -701.8, 0.98],
    [107.0, -726.0, 2.93],

    'Seeufer',
    // Kurve rechts 60°, Radius 260 m
    [101.7, -750.1, 3.91],
    [98.8, -774.7, 3.85],
    [98.2, -799.4, 2.95],
    [100.0, -824.1, 1.63],
    [104.1, -848.5, 0.40],
    [110.5, -872.4, -0.35],
    [119.1, -895.6, -0.45],
    [129.9, -917.9, -0.04],
    [142.8, -939.0, 0.51],
    [157.6, -958.8, 0.74],
    [174.3, -977.1, 0.26],
    // gerade 120 m
    [191.2, -994.1, -1.03],
    [208.2, -1011.0, -2.96],
    [225.2, -1028.0, -5.10],
    [242.2, -1045.0, -6.86],
    [259.1, -1062.0, -7.71],

    'Dorf',
    // Kurve links 90°, Radius 28 m
    [267.3, -1081.8, -7.49],
    [259.1, -1101.5, -6.44],
    // gerade 90 m
    [243.2, -1117.5, -4.91],
    [227.3, -1133.4, -3.41],
    [211.4, -1149.3, -2.26],
    [195.5, -1165.2, -1.59],
    // Kurve rechts 95°, Radius 24 m
    [188.5, -1183.2, -1.40],
    [197.0, -1200.5, -1.64],
    // gerade 110 m
    [218.1, -1218.2, -2.85],
    [239.2, -1235.9, -4.33],
    [260.2, -1253.6, -4.34],
    [281.3, -1271.3, -2.88],

    'Birkenhain',
    // Kurve links 40°, Radius 200 m
    [298.2, -1287.2, -1.20],
    [313.2, -1305.0, 0.73],
    [325.9, -1324.5, 2.69],
    [336.4, -1345.2, 4.25],
    [344.3, -1367.1, 5.02],
    [349.7, -1389.7, 4.37],
    // gerade 140 m
    [353.7, -1412.7, 3.39],
    [357.8, -1435.7, 3.61],
    [361.9, -1458.7, 1.19],
    [365.9, -1481.6, -1.76],
    [370.0, -1504.6, -2.96],
    [374.0, -1527.6, -3.43],
    // Kurve rechts 60°, Radius 160 m
    [379.9, -1550.8, -3.33],
    [389.2, -1572.8, -2.96],
    [401.7, -1593.2, -2.76],
    [417.0, -1611.5, -3.05],
    [435.0, -1627.4, -4.01],
    [455.1, -1640.3, -5.53],
    [476.9, -1650.2, -7.28],

    'Kehre am Hügel',
    // Kurve links 165°, Radius 22 m
    [490.6, -1665.2, -8.65],
    [486.2, -1685.0, -9.52],
    [467.4, -1692.8, -9.66],
    // gerade 80 m
    [440.8, -1690.4, -8.70],
    [414.3, -1688.1, -6.68],
    [387.7, -1685.8, -4.15],

    'Hochwald',
    // Kurve rechts 45°, Radius 140 m
    [360.3, -1686.1, -1.74],
    [333.4, -1691.7, -0.14],
    [308.2, -1702.5, 0.41],
    [285.5, -1718.0, 0.13],
    // Kurve links 45°, Radius 140 m
    [262.9, -1733.5, -0.44],
    [237.6, -1744.3, -0.67],
    [210.8, -1749.9, -0.18],
    [183.3, -1750.2, 1.05],
    // gerade 150 m
    [158.4, -1748.1, 1.87],
    [133.5, -1745.9, 3.95],
    [108.6, -1743.7, 6.39],
    [83.7, -1741.5, 4.04],
    [58.8, -1739.3, 2.06],
    [33.9, -1737.2, -0.28],

    'Zielgerade am See',
    // Kurve links 35°, Radius 300 m
    [8.0, -1733.7, -2.95],
    [-17.6, -1728.1, -5.21],
    [-42.6, -1720.2, -6.56],
    [-66.7, -1710.2, -6.88],
    [-90.0, -1698.1, -6.37],
    [-112.0, -1684.0, -5.54],
    [-132.8, -1668.1, -5.23],
    // gerade 200 m
    [-151.9, -1652.0, -5.36],
    [-171.1, -1636.0, -4.42],
    [-190.2, -1619.9, -5.75],
    [-209.4, -1603.8, -7.48],
    [-228.5, -1587.8, -7.88],
    [-247.7, -1571.7, -7.34],
    [-266.8, -1555.6, -5.80],
    [-286.0, -1539.6, -3.48],
    // </punkte>
  ],

  strasse: { startBeiMeter: 25, zielVorEnde: 45, spawnBeiMeter: 10 },
  checkpoints: [800, 1500, 2220],
  nebenwege: [],               // keine Abzweige mit Stummel
  // Untergrund ohne Abzweig: Schotter überall ausser im Dorf (Asphalt, mit der Brücke)
  belagAbschnitte: [
    { von: 0, bis: 1150, belag: 'schotter' },
    { von: 1462, bis: 2900, belag: 'schotter' },
  ],

  // --- Wasser: zwei Seen und ein Fluss mit Holzbrücke (js/wasser.js) ---
  wasser: {
    seen: [
      { s: 910, seite: 1, lat: 66, rx: 46, rz: 130, drehung: 0, tiefe: 2.2 },   // Seeufer: See rechts, innen in der Kurve
      { s: 2690, seite: -1, lat: 60, rx: 40, rz: 170, drehung: 0, tiefe: 2.0 }, // Zielgerade am See (links)
    ],
    fluesse: [
      { s: 1395, breite: 9, laenge: 420, winkel: 8, tiefe: 3.0 },             // Fluss mit Holzbrücke
    ],
  },

  // --- Umgebung: Spätsommer-Abend (tiefe, warme Sonne, warmer Dunst, kühles Umgebungslicht) ---
  umgebung: {
    farben: {
      himmelOben: '#36578f',     // Abendblau im Zenit
      dunst: '#d6b08a',          // warmer Dunst am Horizont (= Nebelfarbe)
      gras: '#5c8a32',           // Spätsommer-Gras, etwas dunkler und gelblicher
      grasDunkel: '#47712a',
      fels: '#7c766d',           // Granit
      felsDunkel: '#5a554e',
      erde: '#6c5a40',
      bankett: '#8c7352',
      asphalt: '#4f5153',
      mittellinie: '#cfc8b2',
      schotter: '#b49a74',       // finnischer Schotter: warmes Graubraun
      schotterSpur: '#9a8160',
      wiesenweg: '#7c6243',
      wiesenwegSpur: '#6a523a',
      wiesenwegGras: '#5c8a32',
      bergFels: '#4c5662',       // ferne Hügel
      bergFuss: '#2f4a2c',
      schnee: '#f2f5fa',
    },
    licht: {
      sonneStaerke: 2.0,         // tiefe Abendsonne ...
      sonneFarbe: '#ffc28a',     // ... warm orange
      sonneRichtung: [-0.75, 0.32, 0.45], // tief im Westen
      umgebungStaerke: 1.05,
      umgebungFarbe: '#a9a6c6',  // kühles, leicht violettes Umgebungslicht (Schattenseiten)
    },
    nebel: { start: 90, ende: 2300, maxDichte: 0.5, bergDunst: 0.3, bergDunstUnten: 0.25 },
    berge: { anzahl: 22, abstand: [1300, 2100], hoehe: [150, 300], bezugsAbstand: 3300, schneeAb: 2, fussBis: 0.95 }, // flache, bewaldete Hügel, kein Schnee
    fernwald: { waldFarbe: '#1f3b21', waldDunkel: '#142916', wiesenFarbe: '#557f30', geroellFarbe: '#6a665e' },
    gelaende: { huegelHoehe: 4, grundWeite: 250, wandBerg: 0, talTiefe: 0, randAnstiegAb: 350, randAnstiegBis: 1000, randHoehe: 55 },
    landschaft: [],
  },

  // --- Natur ---
  natur: {
    sprites: { tannenProKm: 5600, laubProKm: 3000, steineProKm: 700 }, // Kiefern, Birken, Steine
    buesche: { blueten: 0, beeren: 0.45 },  // keine Alpenrosen, viele Heidelbeeren
    kuehe: {                   // (Tiere: Rentiere, deko.tier)
      anzahl: 6, einzeln: 3, anteilTal: 1, alpAb: 999, alpBreite: [10, 30], passBei: 2000,
      zusatzHerden: [
        { s: 160, seite: 1, lat: [26, 40], anzahl: 4 },
        { s: 2560, seite: 1, lat: [22, 34], anzahl: 4 },
      ],
    },
    nebenwegWaldGruppen: [],
  },

  // --- Start und Ziel ---
  startZiel: {
    start: {
      form: { gerade: 80, kurve: -70, radius: 45, rest: 50, kuppe: 1.2, abfall: 0.06, seitenschutz: 'zaun', sichtschutz: 16, sichtschutzSeed: 3501 },
      sperreBei: 34, sperreBogen: 1.6, sperreUeber: 0.3, sperreArt: 'heu',
    },
    ziel: {
      form: { gerade: 170, kurve: 70, radius: 50, rest: 55, kuppe: 1.5, abfall: 0.06, seitenschutz: 'zaun', sichtschutz: 18, sichtschutzSeed: 3502 },
      sperreBei: 150, sperreBogen: 2.0, sperreUeber: 0.3, sperreArt: 'reifen',
    },
    landschaft: {
      gruppen: [
        { bereich: 'start', seite: 1, m: [-90, 120], lat: [22, 70], anzahl: 8 },
        { bereich: 'start', seite: -1, m: [-110, 120], lat: [16, 60], anzahl: 8 },
        { bereich: 'start', seite: -1, m: [-230, -110], lat: [12, 50], anzahl: 6 },
        { bereich: 'start', seite: 1, m: [-230, -110], lat: [12, 50], anzahl: 6 },
        { bereich: 'ziel', seite: 1, m: [-90, 120], lat: [24, 70], anzahl: 8 },
        { bereich: 'ziel', seite: 1, m: [80, 190], lat: [14, 40], anzahl: 5 },
        { bereich: 'ziel', seite: 1, m: [190, 350], lat: [12, 50], anzahl: 8 },
        { bereich: 'ziel', seite: -1, m: [190, 350], lat: [12, 50], anzahl: 6 },
      ],
      proGruppe: [3, 7], gruppeRadius: 7, laubAnteil: 0.45, strasse: 11, buesche: 45, buschLat: [8, 30],
    },
  },

  // --- Leben an der Strecke: Dorf mit roten Holzhäusern, Steg am See, Rentiere, zwei Fan-Spots ---
  leben: {
    an: true,
    sichtweite: 600, abstandStrasse: 6.5, pufferNichtSchneiden: 20, pufferSchneiden: 50, innenRadius: 130, innenVorNach: 20, innenBreite: 60,
    zaeune: [],
    torAlle: [24, 40], tor: [4, 5.5],
    kuehe: {                   // (Tiere: Rentiere)
      herdenAbstand: 26,
      herden: [
        { s: 1250, seite: 1, lat: [26, 36], anzahl: 3, radius: 6 },   // Wiese hinter dem Dorf
        { s: 1030, seite: -1, lat: [18, 28], anzahl: 3, radius: 5 },  // Lichtung gegenüber dem See
      ],
    },
    // Häuser im Dorf (Haus-Typ deko.haus, mit schuppen: true deko.stadel) und Stege am See
    wiesenweg: {
      holzstapel: false,
      haeuser: [
        { s: 1232, seite: 1, lat: 15, drehung: 0, laenge: 8, tiefe: 6, hoehe: 2.6 },
        { s: 1262, seite: -1, lat: 16, drehung: 5, laenge: 9, tiefe: 6.5, hoehe: 2.8 },
        { s: 1268, seite: 1, lat: 23, drehung: -10, laenge: 5, tiefe: 4, hoehe: 2.2, schuppen: true },
        { s: 1372, seite: -1, lat: 17, drehung: 8, laenge: 8, tiefe: 6, hoehe: 2.6 },
        { s: 1388, seite: 1, lat: 19, drehung: -4, laenge: 5.5, tiefe: 4, hoehe: 2.2, schuppen: true },
        { s: 1062, seite: 1, lat: 22, drehung: 15, laenge: 5, tiefe: 4, hoehe: 2.3 },               // Sauna am See
      ],
      stege: [
        { s: 1030, seite: 1, lat: 24, drehung: 10, laenge: 10, hoehe: 0.4 },
        { s: 2700, seite: -1, lat: 22, drehung: -10, laenge: 9, hoehe: 0.4 },
      ],
    },
    fans: {
      abstand: 7.2, gruppe: [3, 7], gruppeLaenge: 6, radius: 0.35, dicht: 0.75, blickStreuung: 0.6,
      posen: [0.2, 0.16, 0.14, 0.22, 0.08, 0.1, 0.1], // stehend, winkend, jubelnd, Landesfahne, Fotograf, Mütze, Fahne
      kinder: 0.1,
      spots: [
        {
          name: 'dorf', s: [1172, 1204], seite: 1, lat: [8.5, 17], anzahl: 20, blickS: 1150, // aussen an der Dorf-Ecke
          band: [[1170, 1206, 7.9]],
          banner: [[1188, 9.6, 'dorf']],
          fahnen: [[1178, 13, 'motiv'], [1197, 12, 'motiv']],
          stuehle: 3,
        },
        {
          name: 'kuppe', s: [1632, 1662], seite: 1, lat: [8, 15], anzahl: 22, blickS: null, // an der Birkenkuppe
          band: [[1629, 1665, 7.4]],
          banner: [[1645, 9.4, 'hyppy']],
          fahnen: [[1635, 11, 'motiv'], [1657, 12, 'motiv']],
          stuehle: 3,
          camper: [1651, 19, 8],
        },
      ],
    },
    wracks: [],
    kreisRadius: 0.92, postenJacken: ['#ff6a10', '#e2f02a'], postenFahne: '#f4d21a',
    rauch: { anzahl: 6, leben: 5, steigen: 0.5, groesse: [0.5, 1.9], dichte: 0.38, farbe: '#a9a7a2', wind: [0.35, 0.15] },
  },

  // --- Beschriftungen (erfundene Namen) ---
  beschriftung: {
    banner: {
      dorf: ['KYLÄ FANIT', '#1f4f9e', '#f2f0e8'],
      hyppy: ['HYPPYKLUBI', '#f2f0e8', '#1f4f9e'],
    },
    wegweiser: ['JÄRVI 2 KM', 'KYLÄ 1 KM', 'METSÄ 3 KM'],
    sponsoren: [
      ['SISUVOIMA', '#1f4f9e', '#f2f0e8'], ['KOIVU OY', '#2c7a3a', '#f4e27a'], ['AUDAN', '#c8202a', '#f2f0e8'], ['JÄRVIGOLD', '#f0c020', '#1c1c1c'],
    ],
  },

  // --- Umgebungsklang ---
  klang: {
    publikumOrte: {
      start: { staerke: 1.0, von: -70, bis: 70 },
      ziel: { staerke: 1.0, von: -70, bis: 350 },
      dorf: { staerke: 0.7 }, kuppe: { staerke: 0.8 },
    },
    boeenAbschnitt: null,      // keine Böen (Wind in den Kiefern über die Vögel/den Fahrtwind)
    wasser: [[910, 22], [1395, 0], [2690, -22]], // Wasser-Klang (Brunnen-Klang) an See, Fluss und See
  },

  abkuerzung: { immerSperren: [], immerFrei: [], sperrThemen: {} },

  // --- Von Werkzeugen erzeugt – bitte nicht von Hand ändern ---
  erzeugt: {
    // <erzeugt abkuerzungen>
    // Automatisch erzeugt von tools/abkuerzungen.mjs – bitte nicht von Hand ändern.
    // Neu erzeugen (z. B. nach Änderungen an Strecke, Gelände, Bäumen oder an
    // "abkuerzung" in config.js):
    //   node tools/abkuerzungen.mjs
    //
    // sperren: wo Abkürzungs-Sperren stehen. s = Streckenmeter, seite = +1 rechts / -1 links
    //   (Kurveninnenseite), von/bis = Abstand zur Strassenmitte (Meter). Wie die Sperren
    //   aussehen, steht in config.js unter "sperren".
    // Seit Meilenstein 1.2 wird nur ein Teil der Kurven gesperrt (config.js: abkuerzung.sperrQuote,
    // immerSperren, immerFrei, pflichtGewinn, pflichtZeit). Für die Pace-Notes (Meilenstein 4):
    // nichtSchneiden: gesperrte Kurven (Sperren stehen) -> Pace-Note "nicht schneiden".
    // schneiden: freie Kurven ohne Sperren, in denen Schneiden etwas bringt (Gewinn mindestens
    //   minGewinn Meter Weg gegenüber der Strassenmitte) -> Pace-Note "schneiden".
    //   sVon/sBis = Streckenmeter, seite = Kurveninnenseite, gewinn = gesparte Meter.
    abkuerzungen: {
      streckenLaenge: 2795.68,
      minGewinn: 3,
      sperren: [
        { s: 1154, seite: -1, von: 6, bis: 11.8 },
        { s: 1189, seite: -1, von: 6, bis: 40 },
        { s: 1198, seite: -1, von: 6, bis: 10.2 },
        { s: 1233, seite: -1, von: 6, bis: 40 },
        { s: 1255, seite: 1, von: 6, bis: 31.6 },
        { s: 1273, seite: 1, von: 6, bis: 40 },
        { s: 1306, seite: 1, von: 6, bis: 10.8 },
        { s: 1324, seite: 1, von: 6, bis: 40 },
        { s: 1918, seite: -1, von: 6, bis: 12 },
        { s: 1931, seite: -1, von: 6, bis: 10.2 },
        { s: 1944, seite: -1, von: 6, bis: 10.9 },
        { s: 2010, seite: -1, von: 6, bis: 40 },
        { s: 2016, seite: -1, von: 6, bis: 25 },
      ],
      nichtSchneiden: [
        { sVon: 1153, sBis: 1225, seite: 'links' }, // Gewinn bis 40.3 m – Pflicht: Gewinn 40.3 m >= 12 m
        { sVon: 1287, sBis: 1357, seite: 'rechts' }, // Gewinn bis 45.8 m – Pflicht: Gewinn 45.8 m >= 12 m
        { sVon: 1886, sBis: 1977, seite: 'links' }, // Gewinn bis 108.6 m – Pflicht: Gewinn 108.6 m >= 12 m
      ],
      schneiden: [
        { sVon: 1440, sBis: 1601, seite: 'links', gewinn: 3.2 }, // Quote erreicht, kleinerer Gewinn (3.9 m) oder Nachbar schon gesperrt
        { sVon: 1719, sBis: 1884, seite: 'rechts', gewinn: 3.5 }, // Quote erreicht, kleinerer Gewinn (5.1 m) oder Nachbar schon gesperrt
        { sVon: 2027, sBis: 2140, seite: 'rechts', gewinn: 4 }, // Quote erreicht, kleinerer Gewinn (4.0 m) oder Nachbar schon gesperrt
        { sVon: 2402, sBis: 2605, seite: 'links', gewinn: 3.4 }, // Quote erreicht, kleinerer Gewinn (3.4 m) oder Nachbar schon gesperrt
      ],
    },
    // </erzeugt>
    // <erzeugt kurvenTempo>
    // Automatisch erzeugt von tools/pacenotes-test.mjs --schreiben – bitte nicht von Hand ändern.
    // Neu erzeugen nach Änderungen an Strecke, Belägen oder Fahrphysik: node tools/pacenotes-test.mjs --schreiben
    //
    // Grenztempo jeder Kurve (km/h), gemessen mit der echten Fahrphysik: Der Testfahrer hält ein festes Tempo
    // und folgt der Strassenmitte; das grösste Tempo, bei dem er ohne Aufprall und höchstens 1 m auf dem
    // Bankett durchkommt. Gilt für den Belag der Kurve (Schotter, Wiesenweg). kmh: null = Vollgas (die Kurve
    // bremst nicht). von/bis = Streckenmeter (so findet js/pacenotes.js die Kurve wieder).
    // Daraus macht js/pacenotes.js die Stufe 1-6 (Grenzen: config.js, pacenotes.stufenGrenzen).
    kurvenTempo: {
      kurven: [
        { von: 193, bis: 349, kmh: 146.4 }, // rechts 35°, Radius 206 m, schotter
        { von: 425, bis: 631, kmh: 132.7 }, // links 55°, Radius 171 m, schotter
        { von: 788, bis: 1034, kmh: 146 }, // rechts 55°, Radius 199 m, schotter
        { von: 1154, bis: 1224, kmh: 63.2 }, // links 95°, Radius 19 m, asphalt
        { von: 1288, bis: 1356, kmh: 59.6 }, // rechts 101°, Radius 17 m, asphalt
        { von: 1460, bis: 1597, kmh: 132 }, // links 38°, Radius 170 m, schotter
        { von: 1723, bis: 1883, kmh: 120.2 }, // rechts 59°, Radius 69 m, schotter
        { von: 1887, bis: 1976, kmh: 47 }, // links 166°, Radius 16 m, schotter, Kehre
        { von: 2031, bis: 2138, kmh: 114.1 }, // rechts 41°, Radius 98 m, schotter
        { von: 2165, bis: 2272, kmh: 106.6 }, // links 41°, Radius 95 m, schotter
        { von: 2428, bis: 2579, kmh: 153.2 }, // links 29°, Radius 271 m, schotter
      ],
    },
    // </erzeugt>
  },
};
