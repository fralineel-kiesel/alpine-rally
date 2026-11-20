// Strecke "Skigebiet" (seit M11b, ersetzt den Gletscher) – reine Daten, Format: docs/strecken-format.md
// Skigebiet an einem strahlenden Tag: Start im Dorf bei der Talstation, schmale Pistenraupen-Zufahrt mit Spitzkehren
// steil den Hang hoch, Bergstation, Grat mit Ausblick, steile Abfahrt mit Kuppen und Funpark-Kickern, Ziel in der
// Zielarena im Talboden. Der Verlauf kommt aus tools/skigebiet-entwurf.mjs (Gerade / Kurve mit Radius, Höhenprofil):
// dort ändern, nicht hier.

export default {
  format: 1,
  id: 'skigebiet',
  etappe: 'skigebiet',        // Kennung für Bestzeiten und letzten Lauf – nie ändern (sonst sind die Bestzeiten weg)
  revision: 2,                 // (M11b.1: 2, breite Piste, Belag und Rand neu) Verlauf-Stand: neuer Verlauf = neue Zahl, alte Bestzeiten zählen dann nicht mehr
  name: { de: 'SKIGEBIET', en: 'SKI RESORT' },
  beschreibung: { de: 'SCHNEE, STEIL, SPRÜNGE', en: 'SNOW, STEEP, JUMPS' },
  untergrundInfo: { de: 'SCHNEE', en: 'SNOW' },
  laenge: 4329.006,              // Meter (Kontrolle: das Spiel rechnet nach, mehr als 0.5 m daneben = Fehlerseite)

  // Deko-Sets: was der Spielcode malt (Pixelbilder im Code)
  deko: {
    fahne: 'schweiz',          // Schweizer Fahnen bei den Zuschauern
    tier: 'steinbock',         // Steinböcke am Hang (reine Deko)
    tierKlang: null,           // ... ohne Ton (keine Glocken)
    haus: 'alphuette',         // Berghütte
    stadel: 'heustadel',       // kleiner Holzschopf
    nadelbaum: 'schneetanne',  // M11b.1: verschneite Tannen (js/pixel.js schneetannenTextur), überall verteilt, dichter an Dorf und Abfahrt
    laubbaum: 'laub',          // (keine Laubbäume: laubProKm 0)
    unterholz: null,
    tierschild: 'allgemein',
  },

  // M11b: Hangabtrieb (Steigung zieht stärker als in Alpen/Finnland, dort 1): die Autos kämpfen im Anstieg; Allrad hat
  // dort mehr Traktion übrig (config.js, getriebe.allrad je Auto) als die Hinterrad-Autos
  hangabtrieb: 1.6,
  // M11b.1: Kamera folgt dem Gefälle (config.js, kamera.gefaelle): bergab höher und weiter voraus, sonst wie bisher
  kameraGefaelle: 1,
  // M11b.1: Untergrund nur für diese Strecke (überschreibt einzelne Werte aus config.js, Block untergrund):
  // Piste griffiger (Bremsweg ca. 1.2x Schotter statt 1.5x); Tiefschnee: mehr Grip zum Herauskommen, Widerstand wächst mit
  // dem Tempo im Quadrat (langsam kommt man gut voran, schnell bremst er sehr stark: Abkürzen lohnt nie)
  untergrund: {
    schnee: { grip: 0.6, traktion: 0.8, heck: 1.0 }, // (traktion: Schub nur wenig besser als 0.11b, sonst wird der Hang zu leicht; heck: mit mehr Tempo bleibt das Heck ruhiger)
    tiefschnee: { grip: 0.65, rollen: 0.8, rollenTempo: 0.1, rollenQuadrat: 0.03 },
  },
  // M11b.1: breite präparierte Piste (Lino: 4.9 m war viel zu schmal). Alpen-Strasse zum Vergleich 7 m.
  // Dorfstrasse 10 m (zwischen Startbereich und Abzweig: Startbogen, Band und Stroh stehen fest für 7 m), Anstieg mit
  // Kehren, Bergstation und Grat 9.5 m, Abfahrt und Funpark 11 m (bis vor die Einmündung in die Zielarena, die wie der
  // Startbereich 7 m bleibt). Zwischen den Abschnitten je 25 m Übergang (CONFIG.strassenBreiteRampe)
  strassenBreite: [
    { von: 95, bis: 200, breite: 10 },
    { von: 290, bis: 2480, breite: 9.5 },
    { von: 2480, bis: 4115, breite: 11 },
  ],

  // M11b Teil D: Sprünge (Format "Sprünge", js/sprung.js): ein natürlicher Sprung über eine Kuppe am Steilhang der
  // ersten Abfahrt und drei Kicker im Funpark (Schanzen aus Schnee, 110 m Abstand). Landezonen auf Schnee, mindestens
  // 40 m frei, nicht am Ende einer Kehre, nicht an einem Netz; Checkpoints 60 m weg
  sprung: [
    { s: 2640, name: 'SCHNEEKUPPE', von: 2560, bis: 2735, kante: 2640, landeVon: 2645, landeBis: 2690, staerke: 1.0,
      form: { anlauf: 40, rampe: 0.07, kante: 2, gefaelle: 0.07, auslauf: 35, weich: 15 } },
    { s: 3560, name: 'KICKER', von: 3500, bis: 3605, kante: 3560, landeVon: 3564, landeBis: 3588, staerke: 1.0,
      form: { anlauf: 20, rampe: 0.06, kante: 2, gefaelle: 0.06, auslauf: 15, weich: 8 } },
    { s: 3670, name: 'KICKER', von: 3610, bis: 3715, kante: 3670, landeVon: 3674, landeBis: 3698, staerke: 1.0,
      form: { anlauf: 20, rampe: 0.06, kante: 2, gefaelle: 0.06, auslauf: 15, weich: 8 } },
    { s: 3780, name: 'KICKER', von: 3720, bis: 3825, kante: 3780, landeVon: 3784, landeBis: 3808, staerke: 1.0,
      form: { anlauf: 20, rampe: 0.06, kante: 2, gefaelle: 0.06, auslauf: 15, weich: 8 } },
  ],
  // M11b Teil E: Gondelbahn von der Talstation (75 m, rechts) zur Bergstation (2020 m, links), 6 Masten (ca. 140 m
  // Abstand), 6 Gondeln
  seilbahn: { von: [75, 24], bis: [2020, -22], masten: 6, gondeln: 6 },
  // M11b Teil E: zwei Skipisten mit Skifahrern (js/skipiste.js, wie M11a.1): vom Grat nach Norden und von der
  // Pistenkreuzung bei 3200 m nach Süden; oben an der Strasse, gut sichtbar, nicht bei den Kickern
  skipiste: [
    { s: [2200, 2260], seite: -1, lat: [30, 250], breite: 28, skifahrer: 5, seed: 5151 },
    { s: [3200, 3230], seite: 1, lat: [30, 230], breite: 26, skifahrer: 5, seed: 5152 },
  ],
  // M11b Teil D: Funpark-Optik (js/skigebiet.js): farbige Kanten an den Kickern, Fahnenreihe, Bande am Ende
  funpark: { von: 3490, bis: 3840, kicker: [3560, 3670, 3780], bande: 3870 },

  // --- Zufallszahlen (gleiche Zahl = gleiche Welt) ---
  seeds: {
    gelaende: 3210, sprites: 3211, buesche: 3212, fernwald: 3213, berge: 3214, kuehe: 3215, nebenwegWald: 3216,
    stummelSichtschutz: 3217, absperrung: 3218, sperren: 3219, strassenrand: 3220, startZiel: 3221, leben: 3222,
    lebenZaun: 3223, lebenKuehe: 3224, umgebung: 3225,
  },

  // --- Abschnitte (baeume, wald, nah, voegel; keine Vögel im Hochgebirge) ---
  // --- Abschnitte (baeume, wald, nah, voegel) ---
  // M11b.1: verschneite Tannen (Lino: überall, auch oben einzelne Gruppen): baeume = Dichte, wald = geschlossene Stücke
  abschnitte: {
    'Dorf': { baeume: 1, wald: 0.35, voegel: 0.3 },
    'Zufahrt': { baeume: 0.6, wald: 0.1, voegel: 0 },
    'Kehren': { baeume: 0.45, wald: 0.05, voegel: 0 },
    'Bergstation': { baeume: 0.3, wald: 0, voegel: 0 },
    'Grat': { baeume: 0.3, wald: 0, voegel: 0 },
    'Abfahrt': { baeume: 0.9, wald: 0.3, voegel: 0 },
    'Funpark': { baeume: 0.6, wald: 0.1, voegel: 0 },
    'Zielarena': { baeume: 1, wald: 0.3, voegel: 0 },
  },

  punkte: [
    // <punkte> (geschrieben von tools/skigebiet-entwurf.mjs – Entwurf dort ändern)
    'Dorf',
    [0.0, 0.0, 0.00],
    // gerade 230 m
    [0.0, -25.6, 0.00],
    [0.0, -51.1, 0.00],
    [0.0, -76.7, 0.00],
    [0.0, -102.2, 0.00],
    [0.0, -127.8, 0.00],
    [0.0, -153.3, 0.00],
    [0.0, -178.9, 0.00],
    [0.0, -204.4, 0.00],
    [0.0, -230.0, 0.05],

    'Zufahrt',
    // Kurve links 65°, Radius 40 m
    [-6.3, -251.5, 0.23],
    [-23.1, -266.3, 0.77],
    // gerade 70 m
    [-44.2, -276.1, 2.11],
    [-65.4, -286.0, 3.74],
    [-86.5, -295.8, 6.23],
    // gerade 120 m
    [-108.3, -306.0, 10.96],
    [-130.0, -316.1, 16.48],
    [-151.8, -326.3, 22.00],
    [-173.5, -336.4, 27.52],
    [-195.3, -346.5, 32.19],
    // gerade 70 m
    [-216.4, -356.4, 34.61],
    [-237.6, -366.3, 36.24],
    [-258.7, -376.1, 37.66],

    'Kehren',
    // Kurve rechts 128°, Radius 18 m
    [-267.8, -385.6, 38.24],
    [-268.0, -398.7, 38.69],
    [-259.3, -408.5, 39.23],
    // gerade 70 m
    [-238.5, -419.1, 40.49],
    [-217.7, -429.7, 41.89],
    [-196.9, -440.3, 44.15],
    // gerade 70 m
    [-176.1, -450.9, 48.51],
    [-155.3, -461.5, 53.65],
    [-134.6, -472.0, 57.91],
    // gerade 70 m
    [-113.8, -482.6, 60.09],
    [-93.0, -493.2, 61.49],
    [-72.2, -503.8, 62.72],
    // Kurve links 128°, Radius 18 m
    [-63.5, -513.6, 63.25],
    [-63.7, -526.7, 63.69],
    [-72.8, -536.2, 64.24],
    // gerade 70 m
    [-93.9, -546.0, 65.50],
    [-115.0, -555.9, 66.90],
    [-136.2, -565.8, 69.18],
    // gerade 70 m
    [-157.3, -575.6, 73.56],
    [-178.5, -585.5, 78.69],
    [-199.6, -595.3, 82.94],
    // gerade 70 m
    [-220.8, -605.2, 85.10],
    [-241.9, -615.1, 86.50],
    [-263.1, -624.9, 87.73],
    // Kurve rechts 128°, Radius 18 m
    [-272.1, -634.4, 88.26],
    [-272.3, -647.5, 88.70],
    [-263.6, -657.3, 89.23],
    // gerade 70 m
    [-242.9, -667.9, 90.48],
    [-222.1, -678.5, 91.88],
    [-201.3, -689.1, 94.10],
    // gerade 50 m
    [-179.0, -700.4, 98.78],
    [-156.7, -711.8, 103.46],
    // gerade 70 m
    [-135.9, -722.3, 105.68],
    [-115.1, -732.9, 107.08],
    [-94.4, -743.5, 108.33],
    // Kurve links 128°, Radius 18 m
    [-85.6, -753.3, 108.86],
    [-85.9, -766.4, 109.30],
    [-94.9, -775.9, 109.84],
    // gerade 70 m
    [-116.1, -785.7, 111.09],
    [-137.2, -795.6, 112.49],
    [-158.4, -805.5, 114.73],
    // gerade 70 m
    [-179.5, -815.3, 119.06],
    [-200.7, -825.2, 124.20],
    [-221.8, -835.1, 128.49],
    // gerade 70 m
    [-242.9, -844.9, 130.69],
    [-264.1, -854.8, 132.09],
    [-285.2, -864.6, 133.34],
    // Kurve rechts 128°, Radius 18 m
    [-294.3, -874.1, 133.87],
    [-294.5, -887.2, 134.31],
    [-285.8, -897.0, 134.85],
    // gerade 70 m
    [-265.0, -907.6, 136.11],
    [-244.2, -918.2, 137.51],
    [-223.4, -928.8, 139.71],
    // gerade 50 m
    [-201.2, -940.1, 144.22],
    [-178.9, -951.5, 148.67],
    // gerade 70 m
    [-158.1, -962.1, 150.81],
    [-137.3, -972.7, 152.21],
    [-116.5, -983.2, 153.45],
    // Kurve links 128°, Radius 18 m
    [-107.8, -993.0, 153.98],
    [-108.0, -1006.1, 154.42],
    [-117.1, -1015.6, 154.96],
    // gerade 70 m
    [-138.2, -1025.5, 156.22],
    [-159.4, -1035.3, 157.62],
    [-180.5, -1045.2, 159.46],
    // gerade 60 m
    [-207.7, -1057.9, 163.27],
    [-234.9, -1070.5, 166.93],

    'Bergstation',
    // Kurve rechts 65°, Radius 60 m
    [-253.2, -1083.7, 168.31],
    [-265.3, -1102.8, 169.22],
    [-269.5, -1124.9, 169.91],
    // gerade 80 m
    [-269.5, -1151.6, 170.10],
    [-269.5, -1178.2, 170.17],
    [-269.5, -1204.9, 171.81],

    'Grat',
    // Kurve rechts 60°, Radius 150 m
    [-267.3, -1231.0, 171.16],
    [-260.5, -1256.2, 172.87],
    [-249.4, -1279.9, 174.69],
    [-234.4, -1301.3, 172.74],
    [-216.0, -1319.8, 175.89],
    [-194.5, -1334.8, 175.58],
    // gerade 150 m
    [-172.9, -1347.3, 174.68],
    [-151.2, -1359.8, 177.72],
    [-129.6, -1372.3, 176.10],
    [-107.9, -1384.8, 176.30],
    [-86.3, -1397.3, 178.89],
    [-64.6, -1409.8, 176.59],
    // Kurve rechts 30°, Radius 200 m
    [-41.2, -1421.4, 177.84],
    [-16.4, -1429.8, 178.80],
    [9.3, -1434.9, 176.28],
    [35.4, -1436.6, 176.86],

    'Abfahrt',
    // Kurve rechts 20°, Radius 150 m
    [61.4, -1434.3, 173.35],
    [86.7, -1427.6, 169.32],
    // gerade 200 m
    [110.2, -1419.0, 164.08],
    [133.6, -1410.5, 158.33],
    [157.1, -1401.9, 152.58],
    [180.6, -1393.4, 146.83],
    [204.1, -1384.8, 141.08],
    [227.6, -1376.3, 135.33],
    [251.1, -1367.7, 129.58],
    [274.6, -1359.2, 124.78],
    // gerade 70 m
    [296.5, -1351.2, 122.58],
    [318.5, -1343.2, 121.18],
    [340.4, -1335.2, 119.95],
    // Kurve rechts 130°, Radius 18 m
    [350.3, -1326.4, 119.41],
    [351.5, -1313.1, 118.97],
    [343.2, -1302.7, 118.42],
    // gerade 70 m
    [323.0, -1291.1, 117.16],
    [302.8, -1279.4, 115.76],
    [282.6, -1267.7, 113.43],
    // gerade 70 m
    [262.4, -1256.1, 108.87],
    [242.2, -1244.4, 103.51],
    [222.0, -1232.7, 99.07],
    // gerade 70 m
    [201.8, -1221.1, 96.86],
    [181.6, -1209.4, 95.46],
    [161.4, -1197.7, 94.23],
    // Kurve links 130°, Radius 18 m
    [153.1, -1187.3, 93.69],
    [154.3, -1174.1, 93.25],
    [164.2, -1165.2, 92.70],
    // gerade 70 m
    [186.1, -1157.2, 91.44],
    [208.1, -1149.3, 90.04],
    [230.0, -1141.3, 87.78],
    // gerade 180 m
    [254.1, -1132.5, 82.89],
    [278.3, -1123.7, 77.24],
    [302.5, -1114.9, 71.58],
    [326.6, -1106.1, 65.92],
    [350.8, -1097.3, 60.27],
    [375.0, -1088.5, 54.61],
    [399.1, -1079.7, 49.28],

    'Funpark',
    // Kurve rechts 50°, Radius 150 m
    [422.8, -1068.7, 44.80],
    [444.2, -1053.7, 40.61],
    [462.7, -1035.2, 36.42],
    [477.7, -1013.8, 32.23],
    [488.8, -990.1, 28.09],
    // gerade 400 m
    [497.3, -966.6, 24.30],
    [505.9, -943.1, 20.55],
    [514.4, -919.6, 16.80],
    [523.0, -896.1, 13.05],
    [531.5, -872.6, 9.30],
    [540.1, -849.1, 5.55],
    [548.6, -825.6, 1.80],
    [557.2, -802.1, -1.95],
    [565.7, -778.6, -5.70],
    [574.3, -755.1, -9.45],
    [582.8, -731.6, -13.20],
    [591.4, -708.2, -16.95],
    [599.9, -684.7, -20.70],
    [608.5, -661.2, -24.45],
    [617.0, -637.7, -28.20],
    [625.6, -614.2, -32.01],
    // Kurve links 40°, Radius 200 m
    [634.8, -592.8, -35.68],
    [646.4, -572.7, -39.41],
    [660.3, -554.0, -43.13],
    [676.3, -537.1, -46.85],
    [694.1, -522.2, -50.58],
    [713.5, -509.4, -54.20],
    // gerade 70 m
    [733.7, -497.7, -57.56],
    [753.9, -486.0, -60.83],
    [774.1, -474.4, -63.53],
    // gerade 50 m
    [795.8, -461.9, -64.84],
    [817.4, -449.4, -65.43],

    'Zielarena',
    // Kurve links 90°, Radius 30 m
    [840.2, -446.4, -65.58],
    [858.4, -460.4, -65.58],
    // gerade 120 m
    [870.4, -481.1, -65.58],
    [882.4, -501.9, -65.58],
    [894.4, -522.7, -65.58],
    [906.4, -543.5, -65.58],
    [918.4, -564.3, -65.58],
    // </punkte>
  ],

  strasse: { startBeiMeter: 25, zielVorEnde: 45, spawnBeiMeter: 10 },
  // Rand (M11a.1): keine Leitplanken; neben der Strasse Tiefschnee (bremst stark, keine Strafe, wie Gras in den Alpen),
  // Schneestangen markieren den Rand; der weiche Schneewall (js/schneewall.js) steht nur noch in den Hohlwegen als Bank
  strassenrand: { ohnePlanke: [[0, 4400, -1], [0, 4400, 1]], ohneZaun: true, tiefschnee: true, schneewall: { an: true, ohne: [], nurHohlwege: true, pistenStangen: true } },
  // Checkpoints: nach der Anstiegsmitte, an der Bergstation, in der Abfahrt (nicht in Sprungzonen, 60 m Abstand)
  // M11b: Fangnetze (orange) und Fangzäune an der Talseite und aussen an den Kehren: Wand mit Wand-Strafe (js/fangnetz.js).
  // Offen bleiben die Aussenseiten von Kehre 3, Kehre 5 und der ersten Abfahrt-Kehre (Absturzkante in M11c), die
  // Landezone des natürlichen Sprungs, der Grat (Ausblick) und die Pistenkreuzungen; sonst Tiefschnee mit Pistenstangen
  fangnetze: [
    { von: 300, bis: 600, seite: -1 }, { von: 576, bis: 850, seite: 1 }, { von: 826, bis: 1020, seite: -1 },
    { von: 1090, bis: 1330, seite: 1 }, { von: 1306, bis: 1500, seite: -1 }, { von: 1570, bis: 1810, seite: 1 },
    { von: 1810, bis: 1915, seite: -1, art: 'zaun' },
    { von: 2490, bis: 2600, seite: 1 }, { von: 2730, bis: 2785, seite: 1 },
    { von: 2855, bis: 2925, seite: -1 }, { von: 2955, bis: 3040, seite: -1 }, { von: 3040, bis: 3105, seite: 1, art: 'zaun' },
    { von: 3105, bis: 3185, seite: 1 }, { von: 3215, bis: 3330, seite: 1 },
  ],
  // M11b: Pistenkreuzungen (nur Optik und Schild, js/skigebiet.js; querende Skifahrer erst in M11c)
  pistenkreuzungen: [{ s: 2940 }, { s: 3200 }],
  // M11b: kleine Tribüne in der Zielarena (Zuschauer auf die Stufen gemalt)
  tribuenen: [{ s: 4255, seite: -1, lat: 16, laenge: 24, reihen: 4 }],
  checkpoints: [1120, 2000, 3100],
  // Vorbereitung M11c (nur Kommentar, noch ohne Wirkung):
  //   Absturzkante (offener Hang ausserhalb einer Kehre, dort kein Netz, nur Tiefschnee): Kehre 3 (1036–1076 m, aussen
  //   links), Kehre 5 (1516–1556 m, aussen links), erste Abfahrt-Kehre (2799–2840 m, aussen links)
  //   Querende Skifahrer: Pistenkreuzungen bei ca. 2940 m (zweiter Abfahrt-Ast) und 3200 m (dritter Abfahrt-Ast)
  //   M11b.1 (breite Piste): Kante jetzt 6.75 m (Kehren 3/5) bzw. 7.5 m (Abfahrt) neben der Mitte; an der Abfahrt-Kehre steht
  //   4.6 m hinter dem Bankett eine Tannengruppe, an der Kreuzung 2940 m stehen Tannen im Spurband (Korridor frei machen)
  // Die Pistenzufahrt ist ein Nebenweg mit Belag Schnee: im Dorf biegt die Etappe von der Dorfstrasse (Asphalt) links ab
  // (geradeaus läuft die Dorfstrasse als abgesperrter Stummel weiter), in der Zielarena mündet sie in deren Zufahrt ein
  nebenwege: [
    {
      name: 'Pistenzufahrt',
      abzweig: 230,
      einmuendung: 4178.2,
      belag: 'schnee',
      sperreAbzweig: 'band', sperreEinmuendung: 'band',
      wald: { vor: 0, nach: 0, innenVorNach: 0, steinAnteil: 1,
        innen: { abstand: [12, 14], gruppe: [1, 2], schritt: [4, 6], luecke: [40, 80], zweiteReihe: 0, zweiteAbstand: [14, 16] },
        aussen: { abstand: [13, 18], gruppe: [1, 2], schritt: [4, 6], luecke: [50, 90], zweiteReihe: 0, zweiteAbstand: [16, 20] } },
      stummelAbzweig: { kurve: 70, radius: 50, seitenschutz: 'zaun', hoeheAngleichen: [26, 46], sichtschutz: 0 },
      stummelEinmuendung: { kurve: -70, radius: 55, seitenschutz: 'zaun', hoeheAngleichen: [26, 46], sichtschutz: 0 },
    },
  ],
  // Untergrund: Schotter am Anfang der Pistenzufahrt (Pistenraupen-Weg) und auf dem Platz der Bergstation, sonst
  // präparierter Schnee bis zur Zielarena (das Steilstück liegt schon auf Schnee: dort zählt die Traktion auf Schnee)
  belagAbschnitte: [
    { von: 230, bis: 370, belag: 'schotter' },
    { von: 1945, bis: 2030, belag: 'schotter' },
  ],

  umgebung: {
    farben: {
      himmelOben: '#2a63c9',     // tiefblauer Himmel
      dunst: '#cfe2f6',          // klarer, heller Horizont (= Nebelfarbe)
      gras: '#eef3f9',           // Schneehänge (das Gelände)
      grasDunkel: '#d7e1ee',
      fels: '#8d97a6',           // M11b: steile Schneehänge hellgrau (vorher dunkler Fels: der steile Berg über der Zufahrt wirkte wie ein Gewitterhimmel)
      felsDunkel: '#717c8d',
      erde: '#c3ccd8',           // M11b: abgeblasener Schnee statt grauer Erde
      bankett: '#dbe4f0',        // M11b.1: heller Pistenrand (klare Kante zwischen Piste und Tiefschnee; vorher grau #aab6c6)
      asphalt: '#4a4c50',
      mittellinie: '#d8d4c8',
      schotter: '#9a9184',       // Moränen-Schotter, grau
      schotterSpur: '#7f776c',
      wiesenweg: '#8a7d6a',
      wiesenwegSpur: '#76695a',
      wiesenwegGras: '#c9d4e2',
      bergFels: '#55617a',       // ferne Gipfel
      bergFuss: '#7c889c',
      schnee: '#f7faff',
      // M11a: Schneestrasse und Eis (js/pixel.js schneeTextur/eisTextur): Fahrbahn grauer als die Hänge, dunkle Spurrillen
      schneeWeg: '#939eb0',      // (M11b: eine Stufe dunkler als beim Gletscher: auf dem Grat sonst nur 40 Stufen Kontrast)
      schneeSpur: '#646f80',
      schneeGlitzer: '#ffffff',
      // M11b.1: präparierte Piste (js/pixel.js pisteTextur): gleichmässig, etwas heller als die alte Schneestrasse,
      // feine Cord-Rillen der Pistenraupe; Rand (bankett) hell wie eine frisch gefräste Kante
      pisteWeg: '#8f9aac',
      pisteRille: '#7d889b',
      eisWeg: '#6fa3d2',         // (vorher #8fbde3)
      eisGlanz: '#d8ecff',
      eisRiss: '#5f93c4',
      // M11a.1: Eisseen (js/eissee.js): hellblau, schon von weitem klar anders als die graue Schneestrasse
      seeEis: '#549ce6',         // Grund des Sees
      seeEisHell: '#76b2ec',     // hellere Flecken
      seeRand: '#4f8ed2',        // zum Ufer hin (dickes Eis) ...
      seeRandDunkel: '#3d70a8',  // ... ganz aussen und die Kante
      seeRissDunkel: '#355f92',  // Risse: dunkle Linie ...
      seeRissHell: '#eef8ff',    // ... mit heller Kante
      seeStaub: '#e9f1f9',       // Schneestaub auf dem Eis
      seeGlanz: '#d6edff',       // glänzende Streifen
    },
    licht: {
      sonneStaerke: 2.3,         // Mittagssonne ...
      sonneFarbe: '#fff4e6',     // ... fast weiss
      sonneRichtung: [0.35, 0.82, 0.45], // hoch im Süden
      umgebungStaerke: 1.0,
      umgebungFarbe: '#a9c1ea',  // bläuliches Himmelslicht (Schattenseiten)
    },
    nebel: { start: 160, ende: 3400, maxDichte: 0.32, bergDunst: 0.18, bergDunstUnten: 0.15 }, // klare Sicht
    // M11a.1: Talkessel – vier Reihen (Alpen: zwei), höhere Gipfel, Schnee in drei Weisstönen, dunkler Fels im Schnee,
    // blaue Gletscherzungen zur Strecke hin, Gipfelkreuz auf dem Berg beim Ziel
    berge: {
      anzahl: 28, abstand: [1200, 2000], hoehe: [1000, 1800], bezugsAbstand: 3300, schneeAb: 0.22, fussBis: 0.5,
      reihen: [{ r: 1.15, h: 1.1, n: 30 }, { r: 1, h: 0.9, n: 28 }, { r: 0.86, h: 0.62, n: 24 }, { r: 0.74, h: 0.4, n: 20 }],
      extra: {
        schneeStufen: ['#f7faff', '#dde7f3', '#c2d0e3'], felsImSchnee: 0.12, eis: '#7db5e8', zungeAlle: 0, // M11b: keine Gletscherzungen
        gipfelkreuz: { hoehe: 60, dicke: 6, farbe: '#3a2a1e' }, // (gross: der Berg ist ca. 2 km weit weg)
      },
    },
    fernwald: { waldFarbe: '#56625c', waldDunkel: '#3f4944', wiesenFarbe: '#e3eaf3', geroellFarbe: '#7a808b', baeume: false, faerben: false }, // M11a.1: kein Wald, keine Fernbäume
    gelaende: { huegelHoehe: 5, grundWeite: 250, wandBerg: 0, talTiefe: 0, randAnstiegAb: 320, randAnstiegBis: 950, randHoehe: 110 },
    // M11b: keine Hügel von Hand: das Grundgelände folgt schon der geglätteten Strassenhöhe (grundWeite); zusätzliche
    // Hügel standen neben dem Grat als Wand über der Strasse
    landschaft: [],
    boeschung: { schulter: 3, steigung: 0.28, weich: 5, reichweite: 40 },
  },

  // Kunst-Schatten: Mittagssonne aus Süden (kurz wie in den Alpen), bläulich auf dem Schnee (farbe, M11a)
  schatten: { sonne: 170, laenge: 0.7, dunkelheit: 0.55, steine: true, farbe: '#3a5c9a' },

  // --- Natur: verschneite Tannen (M11b.1), viele Steine und Findlinge ---
  natur: {
    sprites: { tannenProKm: 500, laubProKm: 0, steineProKm: 1100, mindestAbstand: 12, waldAbstand: 12, einzelNah: 0.1, einzelFern: 0.02, gruppe: [3, 12], gruppeRadius: 7 }, // M11b.1: Tannen in Gruppen von 3 bis 12 (vorher keine)
    buesche: { an: false, blueten: 0, beeren: 0 },
    kuehe: {                   // (Tiere: Steinböcke, deko.tier)
      anzahl: 4, einzeln: 2, anteilTal: 1, alpAb: 999, alpBreite: [20, 40], passBei: 2000,
      zusatzHerden: [],
    },
    nebenwegWaldGruppen: [],
  },

  // --- Start (Talstation) und Ziel (Bergstation) ---
  startZiel: {
    start: {
      form: { gerade: 80, kurve: -40, radius: 60, rest: 50, kuppe: 0.5, abfall: 0.04, seitenschutz: 'zaun', sichtschutz: 0, sichtschutzSeed: 3601 },
      sperreBei: 34, sperreBogen: 1.6, sperreUeber: 0.3, sperreArt: 'band',
    },
    ziel: {
      form: { gerade: 170, kurve: 40, radius: 60, rest: 55, kuppe: 0.5, abfall: 0.04, seitenschutz: 'zaun', sichtschutz: 0, sichtschutzSeed: 3602 },
      sperreBei: 150, sperreBogen: 2.0, sperreUeber: 0.3, sperreArt: 'reifen',
    },
    landschaft: {
      gruppen: [ // M11b: einzelne Tannen am Dorfrand (nur im Tal, auf dem Berg keine Bäume)
        { bereich: 'start', seite: -1, m: [80, 200], lat: [30, 60], anzahl: 3 },
        { bereich: 'start', seite: 1, m: [-60, 40], lat: [32, 60], anzahl: 2 },
      ],
      proGruppe: [1, 3], gruppeRadius: 6, laubAnteil: 0, strasse: 12, buesche: 0, buschLat: [8, 30],
    },
  },

  // --- Leben: Berghütte, Bergstation, Zuschauer in Winterjacken, Steinböcke ---
  leben: {
    an: true,
    sichtweite: 600, abstandStrasse: 7, pufferNichtSchneiden: 20, pufferSchneiden: 50, innenRadius: 130, innenVorNach: 20, innenBreite: 60,
    zaeune: [],
    torAlle: [24, 40], tor: [4, 5.5],
    kuehe: {
      herdenAbstand: 30,
      herden: [],
    },
    wiesenweg: {
      holzstapel: false,
      haeuser: [
        { s: 75, seite: 1, lat: 24, drehung: 0, laenge: 18, tiefe: 11, hoehe: 6, typ: 'alphuette', dach: 'rot' },        // Talstation (Gondelhaus)
        { s: 150, seite: 1, lat: 20, drehung: 8, laenge: 9, tiefe: 7, hoehe: 3.5, typ: 'alphuette', dach: 'rot' },        // Dorf
        { s: 205, seite: -1, lat: 19, drehung: -6, laenge: 8, tiefe: 7, hoehe: 3.2, typ: 'alphuette', dach: 'braun' },   // Dorf
        { s: 2020, seite: -1, lat: 22, drehung: 0, laenge: 16, tiefe: 10, hoehe: 5.5, typ: 'alphuette', dach: 'rot' },   // Bergstation
        { s: 2048, seite: 1, lat: 17, drehung: 4, laenge: 8, tiefe: 6, hoehe: 3, typ: 'alphuette', dach: 'braun' },      // Hütte (Après-Ski)
        // M11b.1: eingeschneite Holzhütten und Heustadel am Hang (dach 'schnee')
        { s: 470, seite: -1, lat: 30, drehung: 12, laenge: 7, tiefe: 5, hoehe: 2.8, typ: 'heustadel', dach: 'schnee' },
        { s: 920, seite: 1, lat: 34, drehung: -20, laenge: 8, tiefe: 6, hoehe: 3, typ: 'alphuette', dach: 'schnee' },
        { s: 1420, seite: -1, lat: 28, drehung: 8, laenge: 6, tiefe: 5, hoehe: 2.6, typ: 'heustadel', dach: 'schnee' },
        { s: 2260, seite: 1, lat: 36, drehung: 30, laenge: 9, tiefe: 6, hoehe: 3.2, typ: 'alphuette', dach: 'schnee' },
        { s: 2880, seite: 1, lat: 32, drehung: -10, laenge: 7, tiefe: 5, hoehe: 2.8, typ: 'heustadel', dach: 'schnee' },
        { s: 3420, seite: -1, lat: 38, drehung: 15, laenge: 8, tiefe: 6, hoehe: 3, typ: 'alphuette', dach: 'schnee' },
      ],
      stege: [], boote: [], briefkaesten: [], heurollen: [],
      // M11b.1: Holzstapel und Holzzäune am Dorfrand
      holzstapelOrte: [
        { s: 140, seite: 1, lat: 15, drehung: 0, laenge: 4 }, { s: 190, seite: -1, lat: 14, drehung: 5, laenge: 3 }, { s: 100, seite: 1, lat: 15, drehung: 0, laenge: 5, hoehe: 1.3 },
      ],
      holzzaeune: [
        { s: 160, seite: 1, lat: 13, laenge: 12 }, { s: 176, seite: -1, lat: 13, laenge: 10 }, { s: 60, seite: -1, lat: 14, laenge: 10 },
      ],
      // M11b.1: Wegweiser an der Bergstation (Tafeln aus beschriftung.wegweiser)
      wegweiser: { s: 2072, seite: 1, lat: 9.5 },
      // Parkplatz an der Talstation (stehende Deko-Autos)
      parkwagen: [
        { s: 110, seite: -1, lat: 14, drehung: 90, farbe: '#c8202a' }, { s: 116, seite: -1, lat: 14, drehung: 90, farbe: '#2456d8' },
        { s: 122, seite: -1, lat: 14, drehung: 90, farbe: '#e8e8e0' }, { s: 128, seite: -1, lat: 14, drehung: 90, farbe: '#20242c' },
        { s: 113, seite: -1, lat: 20, drehung: 90, farbe: '#2a9a4a' }, { s: 119, seite: -1, lat: 20, drehung: 90, farbe: '#f0c020' },
        { s: 125, seite: -1, lat: 20, drehung: 90, farbe: '#8a8f99' },
      ],
      // Felsbrocken an der Zufahrt und auf dem Grat (statt einer Felswand: die Alpen-Felswand steht fest 5.2 m neben der
      // Strassenmitte und folgt der Breite nicht – auf der breiten Piste stünde sie auf der Fahrbahn; Bericht M11b.1)
      findlinge: [[400, 1, 13, 1.4], [440, 1, 15, 1.1], [680, -1, 13, 1.3], [930, 1, 14, 1.5], [1170, -1, 13, 1.2], [1410, 1, 14, 1.3], [1650, -1, 13, 1.4], [2150, -1, 16, 1.6], [2300, 1, 18, 1.2],
        // M11b.1: Felsgruppen und Felsrücken (eingeschneit: 5. Wert 1) an Zufahrt, drei Kehren-Schenkeln und dem Grat
        [300, 1, 20.9, 2.8, 1], [297, 1, 25.0, 1.6, 1], [301, 1, 24.4, 1.3, 1], [320, -1, 22.4, 2.4, 1], [321, -1, 27.6, 2.2, 1],
        [343, 1, 19.2, 3.3, 1], [341, 1, 24.0, 1.9, 1], [347, 1, 22.5, 1.5, 1], [365, -1, 21.7, 2.4, 1], [368, -1, 23.8, 1.7, 1],
        [385, 1, 20.0, 3.3, 1], [382, 1, 24.6, 1.9, 1], [405, -1, 23.7, 4.1, 1], [406, -1, 26.2, 1.7, 1], [426, 1, 21.3, 4.3, 1],
        [429, 1, 25.8, 1.0, 1], [446, -1, 16.0, 3.4, 1], [443, -1, 21.2, 1.1, 1], [465, 1, 16.8, 4.2, 1], [465, 1, 20.3, 1.1, 1],
        [464, 1, 20.0, 1.5, 1], [483, -1, 23.5, 4.0, 1], [484, -1, 25.6, 2.2, 1], [502, 1, 18.1, 3.9, 1], [505, 1, 20.9, 1.8, 1],
        [499, 1, 24.1, 1.0, 1], [521, -1, 24.0, 3.7, 1], [519, -1, 28.5, 1.2, 1], [310, 1, 51.0, 7.0, 1], [317, 1, 51.6, 4.0, 1],
        [348, 1, 34.9, 5.9, 1], [356, 1, 40.9, 6.2, 1], [385, 1, 36.6, 7.7, 1], [394, 1, 53.6, 4.6, 1], [416, -1, 53.7, 6.7, 1],
        [424, -1, 37.2, 4.9, 1], [454, 1, 39.7, 6.7, 1], [461, 1, 51.8, 6.7, 1], [490, 1, 44.5, 7.5, 1], [499, 1, 54.0, 5.2, 1],
        [524, 1, 41.6, 6.8, 1], [530, 1, 49.1, 6.8, 1], [600, 1, 23.5, 4.3, 1], [601, 1, 27.5, 1.8, 1], [604, 1, 25.8, 1.0, 1],
        [620, -1, 20.5, 3.6, 1], [621, -1, 24.8, 1.9, 1], [643, 1, 22.4, 2.7, 1], [645, 1, 28.1, 1.7, 1], [667, -1, 15.1, 3.9, 1],
        [670, -1, 18.5, 2.0, 1], [665, -1, 17.2, 2.1, 1], [689, 1, 22.3, 2.3, 1], [685, 1, 25.4, 1.8, 1], [707, -1, 19.1, 4.3, 1],
        [704, -1, 21.6, 1.9, 1], [731, 1, 22.4, 3.2, 1], [733, 1, 25.0, 2.0, 1], [755, -1, 18.4, 3.8, 1], [757, -1, 23.1, 1.5, 1],
        [610, -1, 50.7, 6.1, 1], [617, -1, 51.9, 5.2, 1], [646, 1, 52.6, 5.5, 1], [653, 1, 50.6, 4.9, 1], [685, 1, 38.5, 5.6, 1],
        [694, 1, 43.4, 5.0, 1], [722, 1, 51.0, 8.6, 1], [730, 1, 38.6, 6.4, 1], [754, 1, 50.5, 8.6, 1], [762, 1, 48.1, 5.2, 1],
        [1100, 1, 23.6, 2.7, 1], [1103, 1, 28.6, 1.6, 1], [1097, 1, 28.5, 1.6, 1], [1124, -1, 18.4, 4.4, 1], [1127, -1, 20.5, 2.2, 1],
        [1144, 1, 15.6, 3.1, 1], [1143, 1, 17.9, 1.1, 1], [1163, -1, 21.3, 2.1, 1], [1162, -1, 26.5, 1.0, 1], [1183, 1, 17.9, 3.6, 1],
        [1185, 1, 22.1, 1.6, 1], [1205, -1, 15.0, 2.7, 1], [1205, -1, 20.3, 1.3, 1], [1208, -1, 17.7, 1.3, 1], [1227, 1, 17.5, 3.5, 1],
        [1226, 1, 20.0, 2.1, 1], [1230, 1, 21.4, 1.9, 1], [1248, -1, 15.7, 4.0, 1], [1250, -1, 17.7, 1.3, 1], [1110, -1, 32.7, 8.1, 1],
        [1120, -1, 47.5, 5.2, 1], [1148, -1, 54.0, 6.2, 1], [1156, -1, 40.4, 4.3, 1], [1184, -1, 44.8, 8.4, 1], [1192, -1, 40.3, 4.8, 1],
        [1220, 1, 37.2, 7.7, 1], [1227, 1, 43.1, 4.6, 1], [1580, 1, 18.8, 2.6, 1], [1581, 1, 20.9, 2.0, 1], [1603, -1, 17.6, 2.0, 1],
        [1600, -1, 22.7, 1.0, 1], [1599, -1, 21.5, 1.9, 1], [1625, 1, 21.1, 2.2, 1], [1629, 1, 25.8, 1.8, 1], [1646, -1, 19.0, 2.9, 1],
        [1650, -1, 24.2, 1.4, 1], [1650, -1, 23.5, 1.7, 1], [1667, 1, 20.3, 2.2, 1], [1668, 1, 23.1, 2.0, 1], [1687, -1, 16.3, 3.8, 1],
        [1688, -1, 19.3, 1.0, 1], [1705, 1, 16.4, 3.9, 1], [1705, 1, 19.3, 1.3, 1], [1727, -1, 17.9, 2.1, 1], [1725, -1, 22.2, 2.0, 1],
        [1590, -1, 48.6, 8.4, 1], [1600, -1, 47.2, 7.0, 1], [1627, -1, 45.0, 6.8, 1], [1637, -1, 37.8, 6.2, 1], [1658, 1, 40.1, 7.7, 1],
        [1666, 1, 44.1, 6.1, 1], [1696, 1, 50.3, 5.9, 1], [1705, 1, 41.9, 6.3, 1], [1735, -1, 48.3, 7.6, 1], [1741, -1, 51.1, 4.7, 1],
        [2080, 1, 16.2, 2.0, 1], [2078, 1, 20.4, 2.1, 1], [2077, 1, 18.7, 1.9, 1], [2099, -1, 23.8, 4.3, 1], [2097, -1, 25.9, 1.5, 1],
        [2095, -1, 29.0, 2.2, 1], [2118, 1, 21.6, 2.6, 1], [2121, 1, 26.2, 1.9, 1], [2115, 1, 27.0, 1.8, 1], [2139, -1, 16.4, 3.2, 1],
        [2139, -1, 19.4, 1.3, 1], [2158, 1, 18.6, 3.2, 1], [2155, 1, 23.0, 1.7, 1], [2177, -1, 18.3, 4.1, 1], [2175, -1, 23.1, 2.1, 1],
        [2196, 1, 17.0, 4.4, 1], [2196, 1, 22.4, 1.9, 1], [2220, -1, 20.1, 3.7, 1], [2217, -1, 24.1, 2.0, 1], [2241, 1, 18.4, 3.4, 1],
        [2238, 1, 21.8, 1.2, 1], [2244, 1, 21.2, 1.5, 1], [2259, -1, 19.8, 3.2, 1], [2257, -1, 25.0, 1.5, 1], [2258, -1, 25.2, 1.4, 1],
        [2279, 1, 15.7, 4.1, 1], [2281, 1, 18.0, 1.6, 1], [2280, 1, 20.3, 2.0, 1], [2297, -1, 15.6, 4.4, 1], [2295, -1, 21.5, 1.5, 1],
        [2296, -1, 19.4, 1.1, 1], [2316, 1, 22.3, 4.1, 1], [2320, 1, 26.6, 1.5, 1], [2320, 1, 26.0, 2.2, 1], [2340, -1, 18.1, 2.0, 1],
        [2340, -1, 21.2, 1.0, 1], [2341, -1, 21.7, 1.2, 1], [2361, 1, 18.9, 3.4, 1], [2363, 1, 21.2, 1.2, 1], [2360, 1, 24.3, 1.3, 1],
        [2090, 1, 48.0, 6.8, 1], [2099, 1, 47.1, 6.0, 1], [2130, 1, 42.5, 7.3, 1], [2137, 1, 36.2, 5.9, 1], [2167, -1, 33.5, 5.9, 1],
        [2174, -1, 52.4, 5.2, 1], [2202, 1, 46.4, 6.5, 1], [2211, 1, 48.3, 4.4, 1], [2236, -1, 44.6, 5.2, 1], [2246, -1, 37.8, 6.4, 1],
        [2276, -1, 37.3, 7.4, 1], [2285, -1, 50.3, 5.1, 1], [2308, -1, 53.4, 9.0, 1], [2314, -1, 52.0, 4.3, 1], [2348, 1, 42.3, 8.1, 1],
        [2357, 1, 44.1, 5.8, 1]
      ],
    },
    fans: {
      abstand: 7.2, gruppe: [3, 7], gruppeLaenge: 6, radius: 0.35, dicht: 0.75, blickStreuung: 0.6,
      posen: [0.2, 0.16, 0.14, 0.22, 0.08, 0.1, 0.1],
      kinder: 0.1,
      spots: [
        {
          name: 'apres', s: [2036, 2054], seite: 1, lat: [10.5, 13], anzahl: 5, blickS: null, // Après-Ski-Gruppe an der Hütte
          band: [], banner: [[2045, 9.8, 'apres']], fahnen: [[2040, 12, 'motiv'], [2052, 12.5, 'motiv']], stuehle: 1,
        },
        {
          name: 'funpark', s: [3632, 3652], seite: -1, lat: [11, 14], anzahl: 9, blickS: 3670, // M11b.1: Zuschauer am Funpark (zwischen Kicker 1 und 2, neben dem Anlauf)
          band: [], banner: [[3642, 11.5, 'funpark']], fahnen: [[3634, 13.5, 'motiv'], [3650, 14, 'motiv']], stuehle: 0,
        },
        {
          name: 'arena', s: [4235, 4275], seite: 1, lat: [9.5, 14], anzahl: 22, blickS: null, // Zielarena gegenüber der Tribüne
          band: [[4233, 4277, 9.2]], banner: [[4255, 10.5, 'arena']], fahnen: [[4242, 12, 'motiv'], [4268, 13, 'motiv']], stuehle: 0,
        },
      ],
    },
    wracks: [],
    kreisRadius: 0.92, postenJacken: ['#ff6a10', '#e2f02a'], postenFahne: '#f4d21a',
    rauch: { anzahl: 0, leben: 5, steigen: 0.5, groesse: [0.5, 1.9], dichte: 0.38, farbe: '#a9a7a2', wind: [0.35, 0.15] },
  },

  // --- Beschriftungen (erfundene Namen) ---
  beschriftung: {
    banner: {
      apres: ['APRES SKI', '#e040a0', '#f2f0e8'],
      arena: ['ZIELARENA', '#2456d8', '#f2f0e8'],
      funpark: ['FUNPARK', '#ff6a10', '#1c1c1c'], // M11b.1
    },
    wegweiser: ['FUNPARK 1.5 KM', 'ZIELARENA 2 KM', 'TALSTATION'], // (M11b.1: Wegweiser an der Bergstation)
    sponsoren: [
      ['FIRNWERK', '#1f4f9e', '#f2f0e8'], ['PULVERBRÄU', '#c8202a', '#f2f0e8'], ['EISKRISTALL', '#7fb8e6', '#13233a'], ['BERGFUNK', '#f0c020', '#1c1c1c'],
    ],
  },

  // --- Umgebungsklang: pfeifender Wind (Böen auf der Hochebene), sonst Stille, ferne Zuschauer ---
  klang: {
    publikumOrte: {
      start: { staerke: 0.8, von: -70, bis: 70 },
      ziel: { staerke: 0.9, von: -70, bis: 350 },
      apres: { staerke: 0.5 }, arena: { staerke: 0.8 }, funpark: { staerke: 0.5 }, // (M11b.1: Funpark-Zuschauer)
    },
    boeenAbschnitt: 'Dorf', // Windböen (pfeifender Wind) auf der Hochebene
    wasser: [],
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
      streckenLaenge: 4329.01,
      minGewinn: 3,
      sperren: [
      ],
      nichtSchneiden: [
      ],
      schneiden: [
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
        { von: 216, bis: 288, kmh: 72.9 }, // links 69°, Radius 29 m, schotter
        { von: 526, bis: 591, kmh: 39.9 }, // rechts 132°, Radius 16 m, schnee, Kehre
        { von: 777, bis: 843, kmh: 39.9 }, // links 132°, Radius 16 m, schnee, Kehre
        { von: 1029, bis: 1095, kmh: 39.9 }, // rechts 132°, Radius 16 m, schnee, Kehre
        { von: 1260, bis: 1326, kmh: 39.5 }, // links 132°, Radius 15 m, schnee, Kehre
        { von: 1512, bis: 1578, kmh: 39.9 }, // rechts 132°, Radius 16 m, schnee, Kehre
        { von: 1743, bis: 1809, kmh: 39.9 }, // links 132°, Radius 16 m, schnee, Kehre
        { von: 1913, bis: 2008, kmh: 78.2 }, // rechts 67°, Radius 49 m, schotter
        { von: 2066, bis: 2242, kmh: 103.7 }, // rechts 60°, Radius 118 m, schnee
        { von: 2394, bis: 2551, kmh: 115.2 }, // rechts 48°, Radius 126 m, schnee
        { von: 2803, bis: 2869, kmh: 39.1 }, // rechts 134°, Radius 15 m, schnee, Kehre
        { von: 3055, bis: 3122, kmh: 39.1 }, // links 134°, Radius 15 m, schnee, Kehre
        { von: 3354, bis: 3505, kmh: 103.3 }, // rechts 50°, Radius 121 m, schnee
        { von: 3910, bis: 4048, kmh: 117.3 }, // links 37°, Radius 166 m, schnee
        { von: 4148, bis: 4223, kmh: 64.6 }, // links 96°, Radius 21 m, asphalt
      ],
    },
    // </erzeugt>
  },
};
