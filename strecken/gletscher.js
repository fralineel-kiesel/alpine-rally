// Strecke "Gletscher" (seit M11a) – reine Daten, Format: docs/strecken-format.md
// Hochgebirgs-Piste an einem Gletscher an einem strahlenden Tag (ca. 4.3 km): Start an der Talstation auf Schotter, an
// einer Kreuzung rechts ab auf die geräumte Gletscherstrasse (Schnee), lange offene Bögen am Gletscherrand, drei
// Spitzkehren (die zweite auf Eis), eine Senke über das Eisfeld, Ziel auf der Hochebene an der Bergstation (dort mündet
// die Strasse in die asphaltierte Zufahrt der Bergstation ein). Schneewälle statt Leitplanken (js/schneewall.js),
// Eis nur noch auf 3 gefrorenen Seen (eisseen, seit M11a.1), 3 Sprünge über Schneekuppen.
// Der Verlauf kommt aus tools/gletscher-entwurf.mjs (Gerade / Kurve mit Radius, Höhenprofil): dort ändern, nicht hier.

export default {
  format: 1,
  id: 'gletscher',
  etappe: 'gletscher',         // Kennung für Bestzeiten und letzten Lauf – nie ändern (sonst sind die Bestzeiten weg)
  revision: 2,                 // Verlauf-Stand: neuer Verlauf = neue Zahl, alte Bestzeiten zählen dann nicht mehr (M11a.1: Eisseen, Rand)
  name: { de: 'GLETSCHER', en: 'GLACIER' },
  beschreibung: { de: 'SCHNEE, EIS, KEHREN', en: 'SNOW, ICE, HAIRPINS' },
  untergrundInfo: { de: 'SCHNEE UND EIS', en: 'SNOW AND ICE' },
  laenge: 4345.260,              // Meter (Kontrolle: das Spiel rechnet nach, mehr als 0.5 m daneben = Fehlerseite)

  // Deko-Sets: was der Spielcode malt (Pixelbilder im Code)
  deko: {
    fahne: 'schweiz',          // Schweizer Fahnen bei den Zuschauern
    tier: 'steinbock',         // Steinböcke am Hang (reine Deko)
    tierKlang: null,           // ... ohne Ton (keine Glocken)
    haus: 'alphuette',         // Berghütte
    stadel: 'heustadel',       // kleiner Holzschopf
    nadelbaum: 'kiefer',       // wenige Zwergkiefern (Baumgrenze)
    laubbaum: 'laub',          // (keine Laubbäume: laubProKm 0)
    unterholz: null,
    tierschild: 'allgemein',
  },

  // Sprünge über Schneekuppen (Format "Sprünge"): Weite bei 100 km/h ca. 16 / 22 / 24 m, Landezone Schnee (nie Eis),
  // nicht in den 250 m vor einer Kehre, Checkpoints 60 m weg
  sprung: [
    { s: 718, name: 'SCHNEEKUPPE', von: 620, bis: 840, kante: 718, landeVon: 722, landeBis: 755, staerke: 1.0,
      form: { anlauf: 40, rampe: 0.061, kante: 2, gefaelle: 0.061, auslauf: 30, weich: 15 } },
    { s: 3196, name: 'MORÄNENKUPPE', von: 3100, bis: 3320, kante: 3196, landeVon: 3201, landeBis: 3240, staerke: 1.0,
      form: { anlauf: 40, rampe: 0.08, kante: 3, gefaelle: 0.08, auslauf: 30, weich: 15 } },
    { s: 3845, name: 'FIRNKUPPE', von: 3750, bis: 3970, kante: 3845, landeVon: 3850, landeBis: 3890, staerke: 1.05,
      form: { anlauf: 40, rampe: 0.085, kante: 3, gefaelle: 0.085, auslauf: 30, weich: 15 } },
  ],

  // --- Zufallszahlen (gleiche Zahl = gleiche Welt) ---
  seeds: {
    gelaende: 3110, sprites: 3111, buesche: 3112, fernwald: 3113, berge: 3114, kuehe: 3115, nebenwegWald: 3116,
    stummelSichtschutz: 3117, absperrung: 3118, sperren: 3119, strassenrand: 3120, startZiel: 3121, leben: 3122,
    lebenZaun: 3123, lebenKuehe: 3124, umgebung: 3125,
  },

  // --- Abschnitte (baeume, wald, nah, voegel; keine Vögel im Hochgebirge) ---
  abschnitte: {
    'Talstation': { baeume: 0.5, wald: 0, voegel: 0 },
    'Gletscherstrasse': { baeume: 0.35, wald: 0, voegel: 0 },
    'Erste Kehre': { baeume: 0.15, wald: 0, voegel: 0 },
    'Gletscherrand': { baeume: 0.05, wald: 0, voegel: 0 },
    'Eiskehre': { baeume: 0, wald: 0, voegel: 0 },
    'Eisfeld': { baeume: 0, wald: 0, voegel: 0 },
    'Dritte Kehre': { baeume: 0, wald: 0, voegel: 0 },
    'Moräne': { baeume: 0, wald: 0, voegel: 0 },
    'Hochebene': { baeume: 0, wald: 0, voegel: 0 },
    'Bergstation': { baeume: 0, wald: 0, voegel: 0 },
  },

  punkte: [
    // <punkte> (geschrieben von tools/gletscher-entwurf.mjs – Entwurf dort ändern)
    'Talstation',
    [0.0, 0.0, 0.01],
    // gerade 110 m
    [0.0, -27.5, 0.32],
    [0.0, -55.0, 0.62],
    [0.0, -82.5, 0.88],
    [0.0, -110.0, 1.07],
    // Kurve rechts 25°, Radius 260 m
    [1.0, -132.7, 1.17],
    [3.9, -155.1, 1.21],
    [8.9, -177.3, 1.22],
    [15.7, -198.9, 1.21],
    [24.4, -219.9, 1.19],
    // gerade 100 m
    [34.9, -242.5, 1.18],
    [45.5, -265.2, 1.17],
    [56.1, -287.9, 1.17],
    [66.6, -310.5, 1.15],

    'Gletscherstrasse',
    // Kurve rechts 70°, Radius 40 m
    [82.9, -328.2, 1.20],
    [106.4, -333.5, 1.71],
    // gerade 60 m
    [136.2, -330.8, 3.35],
    [166.1, -328.2, 6.21],
    // Kurve links 35°, Radius 260 m
    [192.6, -327.3, 9.46],
    [219.0, -329.0, 13.03],
    [245.1, -333.4, 16.57],
    [270.6, -340.4, 19.79],
    [295.2, -350.0, 22.50],
    [318.8, -362.1, 24.54],
    // gerade 230 m
    [340.9, -374.8, 25.76],
    [363.1, -387.6, 26.18],
    [385.2, -400.4, 26.06],
    [407.3, -413.2, 26.21],
    [429.5, -426.0, 26.59],
    [451.6, -438.7, 27.02],
    [473.7, -451.5, 27.33],
    [495.8, -464.3, 27.41],
    [518.0, -477.1, 27.60],
    // Kurve rechts 30°, Radius 300 m
    [541.2, -489.2, 28.62],
    [565.4, -499.2, 30.50],
    [590.3, -507.0, 33.10],
    [615.9, -512.7, 36.09],
    [641.8, -516.1, 38.98],
    [668.0, -517.3, 41.27],
    // gerade 70 m
    [691.3, -517.3, 42.54],
    [714.6, -517.3, 43.16],
    [738.0, -517.3, 43.36],

    'Erste Kehre',
    // gerade 60 m
    [768.0, -517.3, 43.52],
    [798.0, -517.3, 43.82],
    // Kurve links 165°, Radius 22 m
    [812.5, -522.7, 44.07],
    [819.8, -536.4, 44.41],
    [816.3, -551.5, 44.77],
    [803.7, -560.5, 45.07],
    // gerade 70 m
    [781.1, -566.6, 45.24],
    [758.6, -572.6, 45.24],
    [736.1, -578.6, 45.11],

    'Gletscherrand',
    // Kurve rechts 40°, Radius 200 m
    [714.0, -585.9, 44.91],
    [692.9, -595.8, 44.71],
    [673.1, -608.0, 44.54],
    [654.9, -622.4, 44.44],
    [638.4, -638.9, 44.43],
    [624.0, -657.1, 44.53],
    // gerade 120 m
    [610.2, -676.8, 44.73],
    [596.5, -696.4, 45.04],
    [582.7, -716.1, 45.44],
    [568.9, -735.7, 45.90],
    [555.2, -755.4, 46.39],
    // Kurve links 55°, Radius 180 m
    [539.7, -774.6, 46.91],
    [521.7, -791.5, 47.40],
    [501.6, -805.7, 47.84],
    [479.7, -817.1, 48.19],
    [456.5, -825.4, 48.46],
    [432.3, -830.5, 48.61],
    [407.7, -832.2, 48.66],
    // gerade 90 m
    [385.2, -832.2, 48.62],
    [362.7, -832.2, 48.52],
    [340.2, -832.2, 48.37],
    [317.7, -832.2, 48.19],
    // Kurve rechts 60°, Radius 150 m
    [291.7, -834.4, 48.00],
    [266.4, -841.2, 47.87],
    [242.7, -852.2, 47.85],
    [221.3, -867.2, 47.96],
    [202.8, -885.7, 48.19],
    [187.8, -907.2, 48.51],
    // gerade 80 m
    [174.5, -930.2, 48.81],
    [161.1, -953.3, 49.01],
    [147.8, -976.4, 49.10],

    'Eiskehre',
    // gerade 60 m
    [132.8, -1002.4, 49.15],
    [117.8, -1028.4, 49.28],
    // Kurve rechts 170°, Radius 21 m
    [115.5, -1043.4, 49.46],
    [124.0, -1056.1, 49.79],
    [138.7, -1059.7, 50.20],
    [152.1, -1052.4, 50.52],
    // gerade 60 m
    [171.4, -1029.4, 50.92],
    [190.7, -1006.4, 51.11],

    'Eisfeld',
    // Kurve links 45°, Radius 200 m
    [208.7, -987.5, 51.07],
    [229.1, -971.2, 50.88],
    [251.5, -957.6, 50.60],
    [275.5, -947.1, 50.27],
    [300.6, -939.7, 49.91],
    [326.4, -935.8, 49.44],
    // gerade 200 m
    [351.3, -933.6, 48.66],
    [376.2, -931.4, 47.41],
    [401.1, -929.2, 46.07],
    [426.0, -927.0, 45.56],
    [451.0, -924.9, 46.44],
    [475.9, -922.7, 48.14],
    [500.8, -920.5, 49.69],
    [525.7, -918.3, 50.70],
    // Kurve rechts 50°, Radius 154 m
    [552.1, -913.7, 51.34],
    [577.3, -904.5, 51.75],
    [600.6, -891.1, 51.99],
    [621.1, -873.8, 52.07],
    [638.4, -853.2, 52.04],
    // gerade 60 m
    [655.6, -828.7, 51.95],
    [672.8, -804.1, 51.89],

    'Dritte Kehre',
    // gerade 60 m
    [690.0, -779.5, 51.85],
    [707.2, -754.9, 51.73],
    // Kurve links 160°, Radius 23 m
    [720.1, -745.9, 51.63],
    [735.8, -747.3, 51.61],
    [746.9, -758.4, 51.65],
    [748.3, -774.1, 51.61],
    // gerade 60 m
    [740.5, -803.1, 51.79],
    [732.8, -832.0, 53.20],

    'Moräne',
    // Kurve rechts 35°, Radius 240 m
    [727.6, -855.9, 55.27],
    [725.0, -880.2, 57.96],
    [724.8, -904.6, 60.99],
    [727.1, -928.9, 64.06],
    [731.9, -952.9, 66.91],
    [739.0, -976.2, 69.29],
    // gerade 260 m
    [747.9, -1000.7, 71.09],
    [756.8, -1025.1, 71.97],
    [765.7, -1049.5, 72.49],
    [774.6, -1074.0, 73.48],
    [783.5, -1098.4, 74.71],
    [792.4, -1122.8, 75.88],
    [801.3, -1147.3, 76.68],
    [810.2, -1171.7, 76.87],
    [819.1, -1196.1, 76.75],
    [828.0, -1220.6, 77.26],
    // Kurve links 40°, Radius 260 m
    [835.6, -1245.3, 78.42],
    [840.7, -1270.7, 80.15],
    [843.3, -1296.5, 82.37],
    [843.3, -1322.4, 84.93],
    [840.7, -1348.2, 87.68],
    [835.6, -1373.6, 90.44],
    [828.0, -1398.4, 93.03],
    // gerade 60 m
    [817.7, -1426.6, 95.58],
    [807.5, -1454.8, 97.45],

    'Hochebene',
    // Kurve rechts 30°, Radius 320 m
    [800.1, -1477.6, 98.32],
    [794.5, -1500.8, 98.76],
    [790.6, -1524.4, 99.43],
    [788.6, -1548.3, 100.31],
    [788.3, -1572.2, 101.26],
    [789.7, -1596.1, 102.14],
    [793.0, -1619.8, 102.79],
    // gerade 220 m
    [797.3, -1643.9, 103.11],
    [801.5, -1668.0, 103.01],
    [805.7, -1692.0, 102.90],
    [810.0, -1716.1, 102.99],
    [814.2, -1740.2, 103.18],
    [818.5, -1764.2, 103.35],
    [822.7, -1788.3, 103.41],
    [827.0, -1812.4, 103.33],
    [831.2, -1836.5, 103.43],
    // Kurve links 25°, Radius 300 m
    [834.6, -1862.4, 103.82],
    [835.8, -1888.6, 104.50],
    [834.6, -1914.7, 105.35],
    [831.2, -1940.7, 106.22],
    [825.6, -1966.2, 106.90],
    // gerade 104 m
    [818.8, -1991.3, 107.31],
    [812.1, -2016.4, 107.48],
    [805.4, -2041.5, 107.57],
    [798.6, -2066.7, 107.77],
    // gerade 8 m
    [796.6, -2074.4, 107.88],

    'Bergstation',
    // Kurve links 55°, Radius 36 m
    [788.3, -2089.4, 108.17],
    [774.1, -2098.9, 108.54],
    // gerade 110 m
    [748.3, -2108.3, 109.17],
    [722.4, -2117.7, 109.72],
    [696.6, -2127.1, 110.04],
    [670.7, -2136.5, 110.12],
    // </punkte>
  ],

  strasse: { startBeiMeter: 25, zielVorEnde: 45, spawnBeiMeter: 10 },
  // Schneewälle statt Leitplanken (M11a, js/schneewall.js): keine Planke, Wall auf beiden Seiten der ganzen Etappe
  strassenrand: { ohnePlanke: [[0, 4400, -1], [0, 4400, 1]], ohneZaun: true, schneewall: { an: true, ohne: [] } },
  checkpoints: [1000, 1900, 2650, 3550],
  // Die Gletscherstrasse ist ein Nebenweg mit Belag Schnee: an der Talstation biegt die Etappe vom Schotter rechts ab
  // (geradeaus läuft die Talstrasse als abgesperrter Stummel weiter), an der Bergstation mündet sie in deren Zufahrt ein
  nebenwege: [
    {
      name: 'Gletscherstrasse',
      abzweig: 323.4,
      einmuendung: 4232.2,
      belag: 'schnee',
      sperreAbzweig: 'band', sperreEinmuendung: 'heu',
      wald: { vor: 0, nach: 0, innenVorNach: 0, steinAnteil: 0.3,
        innen: { abstand: [12, 14], gruppe: [1, 2], schritt: [4, 6], luecke: [30, 60], zweiteReihe: 0, zweiteAbstand: [14, 16] },
        aussen: { abstand: [13, 18], gruppe: [1, 2], schritt: [4, 6], luecke: [40, 80], zweiteReihe: 0, zweiteAbstand: [16, 20] } },
      // Stummel wie in Finnland (gleiche Abbiege-Richtung): flache Kreuzungen, Stummel länger auf der Höhe der Etappe
      stummelAbzweig: { kurve: -70, radius: 50, seitenschutz: 'zaun', hoeheAngleichen: [26, 46] },
      stummelEinmuendung: { kurve: -70, radius: 55, seitenschutz: 'zaun', hoeheAngleichen: [26, 46] },
    },
  ],
  // Untergrund ohne Kreuzung: Schotter vom Start bis zum Abzweig; Eis nur auf den drei Eisseen (M11a.1), jeweils ab 6 m
  // hinter dem Ufer (davor liegt Schnee auf dem Eis: Übergang Schnee → Eis, der Reifenton wechselt dort)
  belagAbschnitte: [
    { von: 0, bis: 323, belag: 'schotter' },
    { von: 1356, bis: 1414, belag: 'eis' },   // kleiner See am Gletscherrand
    { von: 2386, bis: 2474, belag: 'eis' },   // grosser See auf dem Eisfeld
    { von: 3406, bis: 3454, belag: 'eis' },   // kleiner See an der Moräne
  ],
  // Eisseen (M11a.1, js/eissee.js): die Strasse weitet sich zu einer freien Eisfläche (Mitte s, Länge entlang der
  // Strasse, Breite quer, Meter). Nur auf Geraden/weiten Bögen, 150 m weg von Kehren, Sprüngen und Landezonen,
  // nicht in den ersten 400 m, mindestens 600 m auseinander, einer je Streckendrittel, nichts auf dem See
  eisseen: [
    { s: 1385, laenge: 70, breite: 32 },
    { s: 2430, laenge: 100, breite: 38 },
    { s: 3430, laenge: 60, breite: 32 },
  ],


  umgebung: {
    farben: {
      himmelOben: '#2a63c9',     // tiefblauer Himmel
      dunst: '#cfe2f6',          // klarer, heller Horizont (= Nebelfarbe)
      gras: '#eef3f9',           // Schneehänge (das Gelände)
      grasDunkel: '#d7e1ee',
      fels: '#4b4f58',           // dunkler Fels als Kontrast
      felsDunkel: '#33363d',
      erde: '#8a909a',
      bankett: '#aab6c6',        // festgefahrener, grauer Schneerand
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
      schneeWeg: '#a8b3c3',      // (M11a Kontrast-Messung: vorher #c2ccd9, im Gegenlicht nur 20 Stufen dunkler als der Hang)
      schneeSpur: '#646f80',
      schneeGlitzer: '#ffffff',
      eisWeg: '#6fa3d2',         // (vorher #8fbde3)
      eisGlanz: '#d8ecff',
      eisRiss: '#5f93c4',
      // M11a.1: Eisseen (js/eissee.js): hellblau, schon von weitem klar anders als die graue Schneestrasse
      seeEis: '#5ea6ef',         // Grund des Sees
      seeEisHell: '#80bcf3',     // hellere Flecken
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
    berge: { anzahl: 24, abstand: [1200, 2000], hoehe: [380, 720], bezugsAbstand: 3300, schneeAb: 0.25, fussBis: 0.5 }, // hohe, verschneite Gipfel
    fernwald: { waldFarbe: '#56625c', waldDunkel: '#3f4944', wiesenFarbe: '#e3eaf3', geroellFarbe: '#7a808b' },
    gelaende: { huegelHoehe: 5, grundWeite: 250, wandBerg: 0, talTiefe: 0, randAnstiegAb: 320, randAnstiegBis: 950, randHoehe: 110 },
    landschaft: [],
    boeschung: { schulter: 3, steigung: 0.28, weich: 5, reichweite: 40 },
  },

  // Kunst-Schatten: Mittagssonne aus Süden (kurz wie in den Alpen), bläulich auf dem Schnee (farbe, M11a)
  schatten: { sonne: 170, laenge: 0.7, dunkelheit: 0.55, steine: true, farbe: '#3a5c9a' },

  // --- Natur: über der Baumgrenze fast nichts, wenige Zwergkiefern und viele Steine ---
  natur: {
    sprites: { tannenProKm: 260, laubProKm: 0, steineProKm: 1100, mindestAbstand: 12, waldAbstand: 12 },
    buesche: { an: false, blueten: 0, beeren: 0 },
    kuehe: {                   // (Tiere: Steinböcke, deko.tier)
      anzahl: 4, einzeln: 2, anteilTal: 1, alpAb: 999, alpBreite: [20, 40], passBei: 2000,
      zusatzHerden: [
        { s: 1350, seite: -1, lat: [30, 46], anzahl: 3 },
        { s: 2950, seite: 1, lat: [28, 44], anzahl: 4 },
      ],
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
      gruppen: [
        { bereich: 'start', seite: 1, m: [-90, 120], lat: [22, 60], anzahl: 3 },
        { bereich: 'start', seite: -1, m: [-110, 120], lat: [18, 60], anzahl: 3 },
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
      herden: [
        { s: 1700, seite: 1, lat: [34, 46], anzahl: 3, radius: 6 },   // Steinböcke am Hang über dem Gletscherrand
        { s: 3420, seite: -1, lat: [30, 42], anzahl: 2, radius: 5 },  // an der Moräne
      ],
    },
    wiesenweg: {
      holzstapel: false,
      haeuser: [
        { s: 1240, seite: 1, lat: 22, drehung: 10, laenge: 8, tiefe: 6, hoehe: 2.8, typ: 'alphuette', dach: 'braun' },    // Berghütte
        { s: 1256, seite: 1, lat: 30, drehung: -5, laenge: 4, tiefe: 3.5, hoehe: 2.2, typ: 'heustadel' },                // Schopf
        { s: 4290, seite: 1, lat: 22, drehung: 0, laenge: 16, tiefe: 10, hoehe: 5.5, typ: 'alphuette', dach: 'rot' }, // Bergstation (gross)
        { s: 4310, seite: -1, lat: 20, drehung: 5, laenge: 7, tiefe: 6, hoehe: 3, typ: 'alphuette', dach: 'rot' },        // Restaurant
      ],
      stege: [], boote: [], holzstapelOrte: [], briefkaesten: [], holzzaeune: [], parkwagen: [], heurollen: [],
      findlinge: [[860, 1, 11, 1.1], [1620, -1, 12, 1.3], [2230, 1, 13, 1.0], [2600, -1, 11.5, 1.2], [3330, 1, 12, 0.9], [3700, -1, 12.5, 1.2]],
    },
    fans: {
      abstand: 7.2, gruppe: [3, 7], gruppeLaenge: 6, radius: 0.35, dicht: 0.75, blickStreuung: 0.6,
      posen: [0.2, 0.16, 0.14, 0.22, 0.08, 0.1, 0.1],
      kinder: 0.1,
      spots: [
        {
          name: 'kehre', s: [1050, 1080], seite: 1, lat: [9.5, 15], anzahl: 18, blickS: 1130, // vor der ersten Kehre, aussen
          band: [[1048, 1082, 9.2]],
          banner: [[1064, 10.5, 'kehre']],
          fahnen: [[1054, 13, 'motiv'], [1074, 12, 'motiv']],
          stuehle: 2,
        },
        {
          name: 'kuppe', s: [3150, 3180], seite: -1, lat: [9.5, 15], anzahl: 18, blickS: null, // an der Moränenkuppe
          band: [[3148, 3182, 9.2]],
          banner: [[3165, 10.5, 'kuppe']],
          fahnen: [[3156, 12, 'motiv'], [3174, 13, 'motiv']],
          stuehle: 2,
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
      kehre: ['GLETSCHERFANS', '#c8202a', '#f2f0e8'],
      kuppe: ['FIRNSPRUNG', '#f2f0e8', '#c8202a'],
    },
    wegweiser: ['BERGSTATION 4 KM', 'HÜTTE 1 KM', 'GLETSCHER 2 KM'],
    sponsoren: [
      ['FIRNWERK', '#1f4f9e', '#f2f0e8'], ['GLETSCHERBRÄU', '#c8202a', '#f2f0e8'], ['EISKRISTALL', '#7fb8e6', '#13233a'], ['BERGFUNK', '#f0c020', '#1c1c1c'],
    ],
  },

  // --- Umgebungsklang: pfeifender Wind (Böen auf der Hochebene), sonst Stille, ferne Zuschauer ---
  klang: {
    publikumOrte: {
      start: { staerke: 0.8, von: -70, bis: 70 },
      ziel: { staerke: 0.9, von: -70, bis: 350 },
      kehre: { staerke: 0.6 }, kuppe: { staerke: 0.6 },
    },
    boeenAbschnitt: 'Hochebene', // Windböen (pfeifender Wind) auf der Hochebene
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
      streckenLaenge: 4345.42,
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
        { von: 122, bis: 212, kmh: 145.3 }, // rechts 21°, Radius 214 m, schotter
        { von: 309, bis: 388, kmh: 59.2 }, // rechts 75°, Radius 29 m, schnee
        { von: 446, bis: 578, kmh: 126.6 }, // links 30°, Radius 212 m, schnee
        { von: 838, bis: 964, kmh: 134.2 }, // rechts 25°, Radius 239 m, schnee
        { von: 1094, bis: 1186, kmh: 37.4 }, // links 169°, Radius 18 m, schnee
        { von: 1237, bis: 1388, kmh: 110.1 }, // rechts 39°, Radius 160 m, schnee
        { von: 1495, bis: 1683, kmh: 99 }, // links 55°, Radius 146 m, schnee
        { von: 1756, bis: 1932, kmh: 95.8 }, // rechts 60°, Radius 118 m, schnee
        { von: 2047, bis: 2140, kmh: 24.4 }, // rechts 174°, Radius 18 m, eis, Kehre
        { von: 2195, bis: 2331, kmh: 109.8 }, // links 40°, Radius 152 m, schnee
        { von: 2533, bis: 2686, kmh: 97.2 }, // rechts 50°, Radius 121 m, schnee
        { von: 2781, bis: 2876, kmh: 38.4 }, // links 164°, Radius 19 m, schnee
        { von: 2932, bis: 3056, kmh: 84.7 }, // rechts 30°, Radius 183 m, schnee
        { von: 3341, bis: 3497, kmh: 124.8 }, // links 35°, Radius 211 m, schnee
        { von: 3585, bis: 3724, kmh: 136.7 }, // rechts 26°, Radius 243 m, schnee
        { von: 3974, bis: 4074, kmh: 95.8 }, // links 20°, Radius 254 m, schnee
        { von: 4195, bis: 4249, kmh: 66 }, // links 57°, Radius 28 m, schnee
      ],
    },
    // </erzeugt>
  },
};
