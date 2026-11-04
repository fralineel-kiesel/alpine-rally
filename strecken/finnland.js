// Strecke "Finnland-Schotter" (seit M10b) – reine Daten, Format: docs/strecken-format.md
// Waldstrecke im Spätsommer-Abend (seit M10b.1 ca. 4 km): Tannen-, Kiefern- und Birkenwald, zwei Seen, ein Dorf auf
// Asphalt (man biegt an Einmündungen auf den Schotter ab und wieder ein), Holzbrücke über einen Fluss, drei Spitzkehren,
// eine Schikane, vier markierte Kuppen (später Sprünge, M10c).
// Der Verlauf kommt aus tools/finnland-entwurf.mjs (Gerade / Kurve mit Radius, Höhenprofil): dort ändern, nicht hier.

export default {
  format: 1,
  id: 'finnland',
  etappe: 'finnland',          // Kennung für Bestzeiten und letzten Lauf – nie ändern (sonst sind die Bestzeiten weg)
  revision: 3,                 // Verlauf-Stand (seit M10b.1): neuer Verlauf = neue Zahl, alte Bestzeiten zählen dann nicht mehr (M10c: 3, Sprünge)
  name: { de: 'FINNLAND-SCHOTTER', en: 'FINLAND GRAVEL' },
  beschreibung: { de: 'SCHOTTER, KUPPEN, SEEN', en: 'GRAVEL, CRESTS, LAKES' },
  untergrundInfo: { de: 'SCHOTTER', en: 'GRAVEL' },
  laenge: 4161.647,             // Meter (Kontrolle: das Spiel rechnet nach, mehr als 0.5 m daneben = Fehlerseite)

  // Deko-Sets: was der Spielcode malt (Pixelbilder im Code)
  deko: {
    fahne: 'finnland',         // blau-weisse Fahnen (nordisches Kreuz)
    tier: 'rentier',           // Rentiere statt Kühe
    tierKlang: 'rentier',      // ... ohne Glocken; M10b.2: leises Schnauben und Klicken (js/config.js rentierKlang)
    haus: 'holzhaus',          // rote Holzhäuser mit weissen Kanten
    stadel: 'holzschuppen',    // rote Schuppen
    nadelbaum: 'nordwald',     // M10b.1: Fichten (dunkle Kegel, Hauptbaum) und Kiefern gemischt, ca. 2 : 1
    laubbaum: 'birke',         // Birken (Farbtupfer)
    unterholz: 'nordisch',     // M10b.1: Farn, Heidekraut, Stümpfe, Totholz, Findlinge, Schilf am See
    tierschild: 'elch',        // M10b.1: Warnschild mit Elch statt der allgemeinen Tier-Silhouette
  },

  // Sprünge (M10c, Format docs/strecken-format.md "Sprünge"): s = kante = Absprungkante, von/bis = Sprungzone (nur dort kann
  // das Auto abheben), landeVon/landeBis = Landezone (Landehang), form = Rampe/Landehang (Steigungen als Verhältnis).
  // Richtwerte bei 100 km/h Absprungtempo: 1 klein 12–18 m, 2 mittel 22–28 m, 3 gross 35–42 m, 4 mittel bis gross 25–32 m.
  // BIRKENKUPPE: Kante 1830 statt 1751 m – Checkpoint 2 (1707 m) braucht 60 m Abstand zur Zone.
  sprung: [
    { s: 495, name: 'KIEFERNKUPPE', von: 330, bis: 650, kante: 495, landeVon: 498, landeBis: 530, staerke: 1.0,
      form: { anlauf: 40, rampe: 0.04, kante: 2, gefaelle: 0.05, auslauf: 30 } },
    { s: 1830, name: 'BIRKENKUPPE', von: 1768, bis: 1990, kante: 1830, landeVon: 1836, landeBis: 1880, staerke: 1.1,
      form: { anlauf: 30, rampe: 0.08, kante: 4, gefaelle: 0.08, auslauf: 25, weich: 10 } },
    { s: 3090, name: 'HOCHWALDKUPPE', von: 2890, bis: 3245, kante: 3090, landeVon: 3100, landeBis: 3160, staerke: 1.0,
      form: { anlauf: 40, rampe: 0.11, kante: 4, gefaelle: 0.10, auslauf: 30 } },
    { s: 3656, name: 'SEEKUPPE', von: 3480, bis: 3820, kante: 3656, landeVon: 3662, landeBis: 3710, staerke: 1.0,
      form: { anlauf: 40, rampe: 0.07, kante: 4, gefaelle: 0.08, auslauf: 30 } },
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
    'Kiefernwald': { baeume: 2.6, wald: 1, voegel: 1.0 },
    'Kiefernkehre': { baeume: 1.1, wald: 0.35, voegel: 0.9 },   // Lichtung um die erste Spitzkehre (Platz zum Rutschen)
    'Seeufer': { baeume: 0.55, wald: 0.15, voegel: 1.3 },
    'Dorf': { baeume: 0.12, wald: 0, voegel: 0.7 },
    'Birkenhain': { baeume: 2.0, wald: 0.5, voegel: 1.3 },
    'Kehre am Hügel': { baeume: 2.6, wald: 1, voegel: 0.8 },  // dicht: zwischen den Schenkeln der Kehre keine Abkürzung
    'Hochwald': { baeume: 2.6, wald: 1, voegel: 0.9 },
    'Hochwaldkehre': { baeume: 1.1, wald: 0.35, voegel: 0.9 },  // Lichtung um die dritte Spitzkehre
    'Zielgerade am See': { baeume: 0.3, wald: 0, voegel: 1.1 },
  },

  punkte: [
    // <punkte> (geschrieben von tools/finnland-entwurf.mjs – Entwurf dort ändern)
    'Start am Waldrand',
    [0.0, 0.0, -0.17],
    // gerade 100 m
    [0.0, -25.0, -0.10],
    [0.0, -50.0, -0.08],
    [0.0, -75.0, -0.10],
    [0.0, -100.0, -0.22],

    'Kiefernwald',
    // Kurve rechts 50°, Radius 60 m
    [5.6, -125.4, -0.39],
    [21.4, -146.0, -0.33],
    // gerade 80 m
    [41.9, -163.1, 0.19],
    [62.3, -180.2, 1.12],
    [82.7, -197.4, 2.02],
    // Kurve rechts 50°, Radius 200 m
    [102.8, -212.2, 2.37],
    [124.5, -224.4, 1.93],
    [147.6, -233.8, 0.66],
    [171.6, -240.2, -1.16],
    [196.3, -243.6, -3.10],
    [221.2, -243.9, -4.70],
    [246.0, -241.1, -5.62],
    // gerade 160 m
    [272.3, -236.5, -6.03],
    [298.5, -231.9, -5.00],
    [324.8, -227.2, -2.56],
    [351.0, -222.6, -3.32],
    [377.3, -218.0, -3.37],
    [403.6, -213.4, -3.72],
    // Kurve links 30°, Radius 300 m
    [429.5, -209.9, -4.29],
    [455.7, -208.8, -4.61],
    [481.8, -209.9, -4.25],
    [507.8, -213.4, -3.10],
    [533.3, -219.0, -1.47],
    [558.3, -226.9, 0.08],

    'Kiefernkehre',
    // gerade 170 m
    [581.1, -235.2, 1.01],
    [603.9, -243.5, 1.40],
    [626.7, -251.8, 1.43],
    [649.6, -260.1, 1.38],
    [672.4, -268.4, 1.32],
    [695.2, -276.7, 1.18],
    [718.0, -285.0, 0.84],
    // Kurve rechts 165°, Radius 21 m
    [732.8, -284.9, 0.57],
    [743.8, -275.0, 0.30],
    [745.6, -260.3, 0.11],
    [737.2, -248.1, 0.02],
    // gerade 60 m
    [712.7, -230.9, 0.17],
    [688.1, -213.7, 0.36],

    'Seeufer',
    // Kurve links 30°, Radius 180 m
    [669.7, -198.9, 0.11],
    [653.5, -181.9, -0.71],
    [639.5, -162.9, -2.01],
    [628.2, -142.3, -3.44],
    // gerade 213 m
    [618.2, -120.9, -4.57],
    [608.2, -99.4, -5.09],
    [598.2, -78.0, -5.02],
    [588.2, -56.5, -4.61],
    [578.2, -35.1, -4.20],
    [568.2, -13.6, -3.92],
    [558.2, 7.8, -3.70],
    [548.2, 29.3, -3.38],
    [538.2, 50.7, -2.91],
    // gerade 8 m
    [534.8, 58.0, -2.73],

    'Dorf',
    // Kurve links 50°, Radius 38 m
    [531.2, 74.0, -2.35],
    [534.8, 90.1, -1.97],
    // gerade 230 m
    [545.6, 113.3, -1.38],
    [556.4, 136.4, -0.79],
    [567.2, 159.6, -0.30],
    [578.0, 182.8, 0.09],
    [588.8, 205.9, 0.44],
    [599.6, 229.1, 0.67],
    [610.4, 252.2, 0.84],
    [621.2, 275.4, 1.08],
    [632.0, 298.6, 1.32],

    'Birkenhain',
    // Kurve links 85°, Radius 36 m
    [650.9, 316.6, 1.24],
    [677.0, 317.2, 0.53],
    // gerade 150 m
    [700.4, 308.6, -0.57],
    [723.9, 300.1, -1.89],
    [747.4, 291.5, -2.38],
    [770.9, 283.0, -1.01],
    [794.4, 274.4, -1.69],
    [817.9, 265.9, -1.95],
    // Kurve rechts 35°, Radius 300 m
    [842.9, 258.0, -2.06],
    [868.4, 252.3, -2.80],
    [894.4, 248.9, -4.08],
    [920.5, 247.8, -5.57],
    [946.7, 248.9, -6.79],
    [972.6, 252.3, -7.28],
    [998.2, 258.0, -6.82],
    // gerade 150 m
    [1022.3, 264.5, -5.57],
    [1046.5, 270.9, -3.84],
    [1070.6, 277.4, -2.05],
    [1094.7, 283.9, -0.65],
    [1118.9, 290.4, 0.11],
    [1143.0, 296.8, 0.18],
    // Kurve links 35°, Radius 60 m
    [1161.2, 298.8, -0.09],
    [1179.1, 295.2, -0.48],
    // Kurve rechts 35°, Radius 60 m
    [1197.0, 291.7, -0.83],
    [1215.1, 293.7, -1.02],
    // gerade 40 m
    [1234.5, 298.9, -0.94],
    [1253.8, 304.0, -0.56],

    'Kehre am Hügel',
    // Kurve rechts 30°, Radius 316.6 m
    [1276.4, 311.0, 0.10],
    [1298.4, 319.7, 0.65],
    [1319.8, 329.9, 0.76],
    [1340.3, 341.8, 0.25],
    [1359.8, 355.1, -0.75],
    [1378.4, 369.9, -1.86],
    [1395.7, 386.0, -2.73],
    // gerade 120 m
    [1412.7, 402.9, -3.21],
    [1429.7, 419.9, -3.41],
    [1446.6, 436.9, -3.55],
    [1463.6, 453.9, -3.73],
    [1480.6, 470.8, -3.86],
    // Kurve links 170°, Radius 20 m
    [1493.8, 476.7, -3.85],
    [1507.6, 472.0, -3.77],
    [1514.5, 459.3, -3.62],
    [1511.1, 445.2, -3.47],
    // gerade 40 m
    [1499.6, 428.8, -3.38],
    [1488.1, 412.4, -3.54],
    // Kurve rechts 45°, Radius 220 m
    [1475.2, 391.5, -4.13],
    [1464.6, 369.2, -4.97],
    [1456.6, 345.8, -5.68],
    [1451.2, 321.8, -5.89],
    [1448.6, 297.2, -5.32],
    [1448.8, 272.6, -4.00],
    [1451.7, 248.1, -2.17],
    // gerade 40 m
    [1455.2, 228.4, -0.60],
    [1458.6, 208.7, 0.80],

    'Hochwald',
    // Kurve links 35°, Radius 260 m
    [1461.9, 182.4, 2.04],
    [1462.5, 155.9, 2.37],
    [1460.4, 129.6, 1.87],
    [1455.6, 103.6, 0.87],
    [1448.2, 78.1, -0.14],
    [1438.2, 53.6, -0.78],
    // gerade 240 m
    [1428.1, 31.9, -0.93],
    [1418.0, 10.1, -0.98],
    [1407.8, -11.6, -0.99],
    [1397.7, -33.4, -0.41],
    [1387.5, -55.1, -1.34],
    [1377.4, -76.9, -2.97],
    [1367.2, -98.6, -3.98],
    [1357.1, -120.4, -4.64],
    [1347.0, -142.1, -4.94],
    [1336.8, -163.9, -5.09],

    'Hochwaldkehre',
    // gerade 60 m
    [1324.1, -191.1, -5.31],
    [1311.5, -218.3, -5.43],
    // Kurve rechts 170°, Radius 21 m
    [1310.5, -233.5, -5.34],
    [1320.0, -245.3, -5.08],
    [1335.0, -247.6, -4.67],
    [1347.7, -239.2, -4.18],
    // gerade 50 m
    [1362.0, -218.7, -3.43],
    [1376.4, -198.2, -3.04],
    // Kurve links 65°, Radius 140 m
    [1393.5, -178.1, -3.13],
    [1414.1, -161.6, -3.51],
    [1437.5, -149.2, -3.73],
    [1462.7, -141.4, -3.39],
    [1489.0, -138.5, -2.29],
    [1515.4, -140.7, -0.60],
    // gerade 30 m
    [1544.9, -145.9, 1.22],

    'Zielgerade am See',
    // gerade 110 m
    [1572.0, -150.6, 2.97],
    [1599.1, -155.4, 4.70],
    [1626.1, -160.2, 2.96],
    [1653.2, -165.0, 1.35],
    // Kurve rechts 35°, Radius 300 m
    [1679.2, -168.4, -0.34],
    [1705.3, -169.5, -1.78],
    [1731.5, -168.4, -2.68],
    [1757.4, -165.0, -3.05],
    [1783.0, -159.3, -3.20],
    [1807.9, -151.4, -3.44],
    [1832.1, -141.4, -3.81],
    // gerade 116 m
    [1853.1, -131.6, -4.13],
    [1874.2, -121.8, -4.33],
    [1895.2, -112.0, -4.47],
    [1916.2, -102.2, -4.70],
    [1937.2, -92.4, -5.11],
    // gerade 8 m
    [1944.5, -89.0, -5.28],
    // Kurve links 50°, Radius 38 m
    [1960.6, -85.4, -5.61],
    [1976.6, -89.0, -5.82],
    // gerade 110 m
    [2001.5, -100.6, -5.60],
    [2026.5, -112.3, -4.53],
    [2051.4, -123.9, -2.95],
    [2076.3, -135.5, -1.48],
    // </punkte>
  ],

  strasse: { startBeiMeter: 25, zielVorEnde: 45, spawnBeiMeter: 10 },
  checkpoints: [1000, 1707, 2614, 3419],
  // --- Nebenwege wie in den Alpen (seit M10b.1): Start, Dorf und Ziel liegen an einer Asphaltstrasse. Die Etappe biegt
  //     an jedem Untergrundwechsel ab (Abzweig) oder ein (Einmündung); die Asphaltstrasse läuft dort als abgesperrter
  //     Stummel weiter. Dazwischen Schotter. Streckenmeter laut tools/finnland-entwurf.mjs (Anfang/Ende der Kurve).
  nebenwege: [
    {
      name: 'Waldweg',         // vom Start (Asphalt) rechts ab in den Wald, links ins Dorf hinein
      abzweig: 100.0,
      einmuendung: 1362.9,
      belag: 'schotter',
      sperreAbzweig: 'heu', sperreEinmuendung: 'band',
      // Waldrand am Schotterweg (wie in den Alpen, sonst nebenwegWald in config.js): innen dicht (keine Abkürzung),
      // aber weiter weg als in den Alpen (innen ab 9.5 m statt 6.2 m, aussen ab 10.5 m, ohne Felsbrocken: auf Schotter rutscht man weiter hinaus)
      wald: {
        nach: 6,               // Waldrand hört kurz nach der Einmündung ins Dorf auf (Alpen: 72 m)
        innenVorNach: 60,      // dichte Innenseite auch 60 m vor und nach engen Kurven (Schenkel der Kehren)
        steinAnteil: 0,        // keine Felsbrocken im Waldrand (Findlinge stehen als Unterholz weiter weg)
        innen: { abstand: [9.5, 10.3], gruppe: [3, 6], schritt: [1.7, 2.3], luecke: [0.5, 1.1], zweiteReihe: 0.35, zweiteAbstand: [10, 13] },
        aussen: { abstand: [10.5, 15], gruppe: [1, 3], schritt: [1.8, 3], luecke: [10, 24], zweiteReihe: 0.15, zweiteAbstand: [12, 16] }, // M10b.1: locker (Bildzeit)
      },
      // flache Kreuzungen (50°): Stummel länger auf der Höhe der Etappe (wie Almweg/Wiesenweg in den Alpen)
      stummelAbzweig: { kurve: -70, radius: 50, seitenschutz: 'zaun', hoeheAngleichen: [26, 46] },
      stummelEinmuendung: { kurve: -70, radius: 55, seitenschutz: 'zaun', hoeheAngleichen: [26, 46] },
    },
    {
      name: 'Birkenweg',       // hinter der Brücke links ab aus dem Dorf, kurz vor dem Ziel links auf die Seestrasse
      abzweig: 1592.9,
      einmuendung: 4051.1,
      belag: 'schotter',
      sperreAbzweig: 'reifen', sperreEinmuendung: 'heu',
      // Waldrand am Schotterweg (wie in den Alpen, sonst nebenwegWald in config.js): innen dicht (keine Abkürzung),
      // aber weiter weg als in den Alpen (innen ab 9.5 m statt 6.2 m, aussen ab 10.5 m, ohne Felsbrocken: auf Schotter rutscht man weiter hinaus)
      wald: {
        vor: 6,                // ... und beginnt erst kurz vor dem Abzweig aus dem Dorf (Alpen: 42 m)
        innenVorNach: 60,      // dichte Innenseite auch 60 m vor und nach engen Kurven (Schenkel der Kehren)
        steinAnteil: 0,        // keine Felsbrocken im Waldrand (Findlinge stehen als Unterholz weiter weg)
        innen: { abstand: [9.5, 10.3], gruppe: [3, 6], schritt: [1.7, 2.3], luecke: [0.5, 1.1], zweiteReihe: 0.35, zweiteAbstand: [10, 13] },
        aussen: { abstand: [10.5, 15], gruppe: [1, 3], schritt: [1.8, 3], luecke: [10, 24], zweiteReihe: 0.15, zweiteAbstand: [12, 16] }, // M10b.1: locker (Bildzeit)
      },
      stummelAbzweig: { kurve: 70, radius: 50, seitenschutz: 'zaun' },
      stummelEinmuendung: { kurve: -70, radius: 55, seitenschutz: 'zaun', hoeheAngleichen: [26, 46] },
    },
  ],

  // --- Wasser: zwei Seen und ein Fluss mit Holzbrücke (js/wasser.js) ---
  wasser: {
    seen: [
      { s: 1090, seite: -1, lat: 70, rx: 46, rz: 105, drehung: 0, tiefe: 2.2 },  // Seeufer: See links, innen in der Kurve
      { s: 4093, seite: 1, lat: 56, rx: 38, rz: 90, drehung: 0, tiefe: 2.0 },   // Zielgerade am See (rechts)
    ],
    fluesse: [
      { s: 1477, breite: 9, laenge: 420, winkel: 8, tiefe: 2.5 },             // Fluss mit Holzbrücke (im Dorf; M10b.2: 2.5 statt 3.0 m tief, sonst wird die Böschung neben der Brücke zu steil)
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
    // M10b.2: Böschung (Gelände neben der Strasse und am Ufer): flache Schulter 2.5 m nach dem Bankett, Hang höchstens
    // 0.3 (ca. 17°), über 4 m weich angesetzt, gilt bis 40 m neben der Strasse (docs/strecken-format.md)
    boeschung: { schulter: 2.5, steigung: 0.3, weich: 4, reichweite: 40 },
  },

  // M10b.2: Kunst-Schatten (js/schatten.js): Sonne im Westsüdwesten (Grad, 0 = Nord, wie licht.sonneRichtung), tiefe
  // Abendsonne = lange Schatten (Länge = Objekthöhe mal laenge), dunkelheit = Deckkraft der Flecken
  schatten: { sonne: 240, laenge: 2.2, dunkelheit: 0.75 },

  // --- Natur ---
  natur: {
    sprites: { tannenProKm: 3600, laubProKm: 2700, steineProKm: 800, // Fichten+Kiefern, Birken, Steine (M10b.1: mehr Birken; weniger Versuche als 0.10b wegen der Bildzeit, dichter wirkt der Wald durch Fichten und Unterholz)
      mindestAbstand: 10.5, waldAbstand: 10.5 }, // M10b.1: Bäume erst ab 10.5 m neben der Mitte (Platz zum Rutschen auf Schotter)
    buesche: { blueten: 0, beeren: 0.45 },  // keine Alpenrosen, viele Heidelbeeren
    kuehe: {                   // (Tiere: Rentiere, deko.tier)
      anzahl: 6, einzeln: 3, anteilTal: 1, alpAb: 999, alpBreite: [10, 30], passBei: 2000,
      zusatzHerden: [
        { s: 330, seite: 1, lat: [26, 40], anzahl: 4 },
        { s: 2824, seite: 1, lat: [22, 34], anzahl: 4 },
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
        { s: 1560, seite: 1, lat: [32, 42], anzahl: 3, radius: 6 },   // Wiese hinter dem Dorf
        { s: 1090, seite: 1, lat: [18, 28], anzahl: 3, radius: 5 },   // Lichtung gegenüber dem See
      ],
    },
    // Häuser im Dorf (Haus-Typ deko.haus, mit schuppen: true deko.stadel) und Stege am See
    wiesenweg: {
      holzstapel: false,
      haeuser: [
        // M10b.1: Dorf mit sechs Gebäuden in drei Bauarten (typ), verschiedene Grössen, Drehungen und Dachfarben (dach)
        { s: 1388, seite: 1, lat: 15, drehung: 0, laenge: 8, tiefe: 6, hoehe: 2.6, typ: 'holzhaus', dach: 'rot' },
        { s: 1404, seite: -1, lat: 15, drehung: 5, laenge: 9, tiefe: 6.5, hoehe: 2.8, typ: 'holzhaus' },
        { s: 1428, seite: 1, lat: 27, drehung: -8, laenge: 11, tiefe: 7, hoehe: 3.4, typ: 'scheune', dach: 'braun' },
        { s: 1448, seite: -1, lat: 25, drehung: 20, laenge: 5, tiefe: 4, hoehe: 2.2, typ: 'holzschuppen', dach: 'rot' },
        { s: 1507, seite: 1, lat: 17, drehung: 12, laenge: 7, tiefe: 5.5, hoehe: 2.4, typ: 'holzhaus', dach: 'braun' },
        { s: 1527, seite: 1, lat: 28, drehung: -15, laenge: 4, tiefe: 3.5, hoehe: 2.1, typ: 'saunahuette' },
        { s: 1240, seite: -1, lat: 24, drehung: 15, laenge: 5, tiefe: 4, hoehe: 2.3, typ: 'saunahuette' }, // Sauna am See
      ],
      stege: [
        { s: 1170, seite: -1, lat: 24, drehung: 10, laenge: 10, hoehe: 0.4 },
        { s: 4093, seite: 1, lat: 22, drehung: -10, laenge: 9, hoehe: 0.4 },
      ],
      // M10b.1: Ruderboote neben den Stegen (liegen auf dem Wasser)
      boote: [
        { s: 1173, seite: -1, lat: 29, drehung: 75, farbe: '#b8452e' },
        { s: 4096, seite: 1, lat: 27, drehung: -80, farbe: '#3f6a8a' },
      ],
      // M10b.1: Leben im Dorf: Holzstapel, Briefkästen an der Strasse, Holzzäune, Heuballen, Brunnen, parkende Wagen
      holzstapelOrte: [
        { s: 1400, seite: -1, lat: 22, drehung: 10 }, { s: 1534, seite: 1, lat: 20, drehung: -5, laenge: 3 },
        { s: 700, seite: 1, lat: 13, drehung: 0, laenge: 4 }, { s: 2980, seite: -1, lat: 13, drehung: 0, laenge: 5, hoehe: 1.3 }, // am Waldrand
      ],
      briefkaesten: [
        { s: 1382, seite: 1, lat: 9, farbe: '#e8c22a' }, { s: 1416, seite: -1, lat: 9, farbe: '#3a6ab0' }, { s: 1501, seite: 1, lat: 9, farbe: '#e8c22a' },
      ],
      holzzaeune: [
        { s: 1402, seite: 1, lat: 10.6, laenge: 8 }, { s: 1514, seite: 1, lat: 11.5, laenge: 12 }, { s: 1408, seite: -1, lat: 11.5, laenge: 8 },
      ],
      parkwagen: [
        { s: 1456, seite: -1, lat: 13, drehung: 0, farbe: '#4a6a8c' }, { s: 1514, seite: 1, lat: 22, drehung: 80, farbe: '#c8c0a8' },
      ],
      heurollen: [[1438, 1, 36], [1444, 1, 38], [1450, 1, 35]],
      brunnen: { s: 1426, seite: -1, lat: 13, drehung: 0 },
    },
    fans: {
      abstand: 7.2, gruppe: [3, 7], gruppeLaenge: 6, radius: 0.35, dicht: 0.75, blickStreuung: 0.6,
      posen: [0.2, 0.16, 0.14, 0.22, 0.08, 0.1, 0.1], // stehend, winkend, jubelnd, Landesfahne, Fotograf, Mütze, Fahne
      kinder: 0.1,
      spots: [
        {
          name: 'dorf', s: [1546, 1582], seite: 1, lat: [8.5, 17], anzahl: 28, blickS: 1600, // vor dem Abzweig am Dorfende, aussen (M10b.1: mehr Fans)
          band: [[1544, 1584, 7.9]],
          banner: [[1564, 9.6, 'dorf']],
          fahnen: [[1552, 13, 'motiv'], [1576, 12, 'motiv']],
          stuehle: 3,
        },
        {
          name: 'kuppe', s: [1797, 1827], seite: 1, lat: [8, 15], anzahl: 22, blickS: null, // an der Birkenkuppe (M10c: mit der Kante 1830 m um 60 m nach hinten)
          band: [[1794, 1830, 7.4]],
          banner: [[1811, 9.4, 'hyppy']],
          fahnen: [[1801, 11, 'motiv'], [1823, 12, 'motiv']],
          stuehle: 3,
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
    wasser: [[1090, -22], [1477, 0], [4093, 22]], // Wasser-Klang (Brunnen-Klang) an See, Fluss und See
  },

  abkuerzung: { immerSperren: [1347, 4031], immerFrei: [2185, 2300, 2559], sperrThemen: {} }, // Einmündungen ins Dorf und vor dem Ziel (innen sonst 7–8 m Gewinn)

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
      streckenLaenge: 4161.65,
      minGewinn: 3,
      sperren: [
        { s: 911, seite: 1, von: 6, bis: 11.2 },
        { s: 925, seite: 1, von: 6, bis: 10.4 },
        { s: 939, seite: 1, von: 6, bis: 11.1 },
        { s: 1327, seite: -1, von: 6, bis: 40 },
        { s: 2575, seite: -1, von: 6, bis: 10.2 },
        { s: 2667, seite: 1, von: 6, bis: 12 },
        { s: 3350, seite: 1, von: 6, bis: 10 },
        { s: 3436, seite: -1, von: 6, bis: 11.9 },
      ],
      nichtSchneiden: [
        { sVon: 880, sBis: 972, seite: 'rechts' }, // Gewinn bis 5.2 m – Gewinn 5.2 m, Umgebung: 8.58 Bäume/Steine pro 100 m²
        { sVon: 1323, sBis: 1378, seite: 'links' }, // Gewinn bis 16.6 m – Pflicht: Gewinn 16.6 m >= 12 m
        { sVon: 2602, sBis: 2810, seite: 'rechts' }, // Gewinn bis 5 m – Gewinn 5.0 m, Umgebung: 6.3 Bäume/Steine pro 100 m²
        { sVon: 3380, sBis: 3585, seite: 'links' }, // Gewinn bis 5.8 m – Gewinn 5.8 m, Umgebung: 3.75 Bäume/Steine pro 100 m²
      ],
      schneiden: [
        { sVon: 1002, sBis: 1120, seite: 'links', gewinn: 4.7 }, // Quote erreicht, kleinerer Gewinn (5.5 m) oder Nachbar schon gesperrt
        { sVon: 1578, sBis: 1661, seite: 'links', gewinn: 4 }, // Quote erreicht, kleinerer Gewinn (4.0 m) oder Nachbar schon gesperrt
        { sVon: 2116, sBis: 2159, seite: 'links', gewinn: 3.3 }, // Quote erreicht, kleinerer Gewinn (3.3 m) oder Nachbar schon gesperrt
        { sVon: 2173, sBis: 2214, seite: 'rechts', gewinn: 3.4 }, // von Hand: immerFrei
        { sVon: 2235, sBis: 2416, seite: 'rechts', gewinn: 3.4 }, // von Hand: immerFrei
        { sVon: 2515, sBis: 2600, seite: 'links', gewinn: 5 }, // von Hand: immerFrei
        { sVon: 3283, sBis: 3377, seite: 'rechts', gewinn: 5.3 }, // Quote erreicht, kleinerer Gewinn (5.3 m) oder Nachbar schon gesperrt
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
        { von: 87, bis: 166, kmh: 87.6 }, // rechts 53°, Radius 43 m, schotter
        { von: 225, bis: 397, kmh: 132.4 }, // rechts 47°, Radius 165 m, schotter
        { von: 582, bis: 709, kmh: 152.8 }, // links 25°, Radius 223 m, schotter
        { von: 881, bis: 970, kmh: 47 }, // rechts 169°, Radius 18 m, schotter, Kehre
        { von: 1008, bis: 1116, kmh: null }, // links 29°, Radius 145 m, schotter, Vollgas
        { von: 1324, bis: 1376, kmh: 75.7 }, // links 52°, Radius 29 m, schotter
        { von: 1578, bis: 1661, kmh: 65.3 }, // links 91°, Radius 24 m, schotter
        { von: 1812, bis: 1964, kmh: 153.2 }, // rechts 30°, Radius 242 m, schotter
        { von: 2118, bis: 2159, kmh: 93.6 }, // links 29°, Radius 41 m, schotter
        { von: 2174, bis: 2213, kmh: 78.6 }, // rechts 29°, Radius 42 m, schotter
        { von: 2299, bis: 2394, kmh: 154.6 }, // rechts 18°, Radius 247 m, schotter
        { von: 2516, bis: 2599, kmh: 46 }, // links 174°, Radius 17 m, schotter, Kehre
        { von: 2603, bis: 2807, kmh: null }, // rechts 47°, Radius 188 m, schotter, Vollgas
        { von: 2855, bis: 2986, kmh: 148.2 }, // links 30°, Radius 201 m, schotter
        { von: 3284, bis: 3376, kmh: 47 }, // rechts 174°, Radius 18 m, schotter, Kehre
        { von: 3402, bis: 3580, kmh: null }, // links 65°, Radius 111 m, schotter, Vollgas
        { von: 3726, bis: 3878, kmh: 153.9 }, // rechts 30°, Radius 245 m, schotter
        { von: 4012, bis: 4065, kmh: 75.7 }, // links 52°, Radius 29 m, schotter
      ],
    },
    // </erzeugt>
  },
};
