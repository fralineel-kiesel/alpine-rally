// Streckendatei "Alpen" – Etappe Passstrasse (seit M10a; Inhalt wie in Version 0.9a.2).
// Reine Daten, keine Logik. Format und Felder: docs/strecken-format.md. Prüfen: node tools/strecke-pruefen.mjs strecken/alpen.js
// Was hier steht, gilt nur für diese Strecke. Regeln (wie etwas gebaut wird) stehen im Code, Grössen in js/config.js.
//
// Koordinaten in Metern:  x = Osten (+) / Westen (-),  z = Süden (+) / Norden (-),  h = Höhe über dem Talboden beim Start.
// s = Streckenmeter (entlang der Etappe ab Strassenanfang), seite -1 = links / +1 = rechts (in Fahrtrichtung),
// lat = so weit neben der Strassenmitte (Meter).

export default {
  format: 1,
  id: 'alpen',
  etappe: 'passstrasse',      // Kennung für Bestzeiten und letzten Lauf – nie ändern (sonst sind die Bestzeiten weg)
  revision: 2,                 // M10d: drei Sprünge (neues Höhenprofil) – Bestzeiten der Alpen beginnen neu ('passstrasse-r2')
  name: { de: 'PASSSTRASSE', en: 'MOUNTAIN PASS' },
  beschreibung: { de: 'ASPHALT, SCHOTTER, WIESENWEG', en: 'TARMAC, GRAVEL, MEADOW TRACK' },
  untergrundInfo: { de: 'ASPHALT UND SCHOTTER', en: 'TARMAC AND GRAVEL' }, // Kurzinfo für die Etappenwahl (seit M10b)
  // Deko-Sets (seit M10b): welche Motive und Typen der Spielcode malt (Pixelbilder im Code, Liste: docs/strecken-format.md)
  deko: {
    fahne: 'schweiz',          // Fahnen der Zuschauer und an den Masten: Schweizer Kreuz
    tier: 'kuh',               // Herden auf Weide und Alp: Kühe
    tierKlang: 'glocke',       // ... mit Kuhglocken
    haus: 'alphuette',         // Haus an der Weide: Alphütte
    stadel: 'heustadel',       // kleiner Schuppen: Heustadel
    nadelbaum: 'tanne',        // Nadelbaum: Tanne
    laubbaum: 'laub',          // Laubbaum: runde Krone
  },
  laenge: 3667.587,           // Meter (Kontrolle: das Spiel rechnet nach, mehr als 0.5 m daneben = Fehlerseite)

  // --- Zufallszahlen (gleiche Zahl = gleiche Welt) ---
  seeds: {
    gelaende: 1987,            // Hügel
    sprites: 4242,             // Bäume und Steine (an erzeugt.baumfolge gebunden)
    buesche: 5150,             // Büsche, Jungtannen, Grasbüschel
    fernwald: 2024,            // Fernbäume
    berge: 77,                 // Hintergrundberge
    kuehe: 1300,               // Kühe (an erzeugt.kuhfolge gebunden)
    nebenwegWald: 6060,        // Waldrand an den Nebenwegen
    stummelSichtschutz: 3301,  // Tannen quer vor den Stummel-Enden
    absperrung: 4711,          // Absperrungen auf den Stummeln
    sperren: 815,              // Abkürzungs-Sperren und ihre Themen
    strassenrand: 77,          // Zaun-Felder, Lücken, Tore
    startZiel: 3030,           // Zuschauer, Strohballen, Bäume an Start und Ziel
    leben: 3131,               // Fans, Stühle, Steine, Schäden
    lebenZaun: 3132,           // Tore, Latten, Pfosten der Zäune von "leben"
    lebenKuehe: 3133,          // Herden von "leben"
    umgebung: 7007,            // Umgebungsklang (Glocken, Vögel, Jubel)
  },

  // --- Abschnitte: gelten ab der Zeile mit ihrem Namen in "punkte" ---
  //   baeume: wie viele Bäume (1 = normal, 2 = doppelt so dicht, 0.2 = fast keine)
  //   wald:   0..1, wie viel davon geschlossener Tannenwald ist
  //   nah:    true = Bäume dürfen näher an die Strasse (Waldstück)
  //   wand:   'links' / 'rechts' = Felswand auf dieser Seite, auf der anderen Seite geht es ins Tal (Abhang)
  //   voegel: Dichte der Vogelrufe (Umgebungsklang, 1 = normal, 0 = keine)
  abschnitte: {
    'Start im Tal': { baeume: 0.35, wald: 0, voegel: 0.7 },
    'Talabschnitt': { baeume: 0.8, wald: 0, voegel: 1.0 },
    'Waldstück': { baeume: 2.2, wald: 1, nah: true, voegel: 1.0 },
    'Kehrengruppe': { baeume: 1.6, wald: 0.3, voegel: 0.5 },
    'Felswand 1': { baeume: 1.0, wald: 0.2, wand: 'links', voegel: 0 },
    'Almweg': { baeume: 0.45, wald: 0.05, voegel: 0.7 },
    'Passhöhe': { baeume: 0.15, wald: 0, voegel: 0.15 },
    'Wiesenweg': { baeume: 0.25, wald: 0, voegel: 1.0 },
    'Abfahrt': { baeume: 1.0, wald: 0.2, wand: 'rechts', voegel: 0.4 },
    'Zielgerade': { baeume: 0.5, wald: 0, voegel: 0.6 },
  },

  // --- Stützpunkte [x, z, h]: weiche Kurve (Spline) durch alle Punkte. Ein Abschnitts-Name gilt für die Punkte danach.
  //     Die Punkte wurden aus "Gerade / Kurve mit Radius" berechnet (siehe Kommentare). Die Stücke zwischen
  //     "<nebenweg NAME>" und "</nebenweg>" schreibt tools/nebenweg-bogen.mjs (Bogen dort ändern, nicht hier).
  punkte: [
    // --- 1. Start im Tal: gerade, offene Wiese, Berge voraus ---
    'Start im Tal',
    [0, 0, 0],
    // gerade 250 m, Steigung 0 %
    [0.0, -25.0, 0.0], [0.0, -50.0, 0.0], [0.0, -75.0, 0.0],
    [0.0, -100.0, 0.0], [0.0, -125.0, 0.0], [0.0, -150.0, 0.0],
    [0.0, -175.0, 0.0], [0.0, -200.0, 0.0], [0.0, -225.0, 0.0],
    [0.0, -250.0, 0.0],

    // --- 2. Talabschnitt: weite, flüssige Kurven, leichte Steigung ---
    'Talabschnitt',
    // Kurve rechts 35°, Radius 300 m, Steigung 4 %
    [1.1, -276.1, 1.0], [4.6, -302.1, 2.1], [10.2, -327.6, 3.1],
    [18.1, -352.6, 4.2], [28.1, -376.8, 5.2], [40.2, -400.0, 6.3],
    [54.3, -422.1, 7.3],
    // gerade 60 m, Steigung 5 %
    [71.5, -446.6, 8.8], [88.7, -471.2, 10.3],
    // Kurve links 70°, Radius 220 m, Steigung 5 %
    [101.5, -492.0, 11.6], [112.0, -514.0, 12.8], [120.0, -537.1, 14.0],
    [125.4, -560.9, 15.2], [128.1, -585.2, 16.4], [128.1, -609.6, 17.7],
    [125.4, -633.9, 18.9], [120.0, -657.7, 20.1], [112.0, -680.8, 21.3],
    [101.5, -702.8, 22.5], [88.7, -723.6, 23.8],
    // Kurve rechts 30°, Radius 260 m, Steigung 5 % (Anfang)
    [74.2, -746.7, 25.1],

    // --- Seit M3a: Nebenweg "Talschleife" (Schotter). Die Etappe biegt von der Hauptstrasse ab
    //     und mündet später wieder ein (Stummel und Absperrungen: config.js, "nebenwege") ---
// <nebenweg Talschleife>
    // (automatisch von tools/nebenweg-bogen.mjs – Bogen dort ändern, nicht hier)
    'Waldstück',
    // Kurve rechts 80°, Radius 28 m, Steigung 5 % – Abzweig: rechts auf den Nebenweg (Schotter)
    [65.8730, -761.7046, 25.9654], [65.3135, -776.3421, 26.7104], [72.2215, -789.2591, 27.4554],
    // gerade 27 m, Steigung 0 %
    [85.8409, -801.6932, 28.3825],
    // Kurve links 67°, Radius 35 m, Steigung 11 % – Nebenweg: Kurve links
    [98.2731, -813.8705, 30.0910], [104.4682, -827.9512, 32.1990], [104.0274, -843.3282, 33.3798],
    // gerade 25 m, Steigung 0 %
    [98.1053, -860.7505, 33.0813],
    // Kurve rechts 62°, Radius 38 m, Steigung 8 % – Nebenweg: Kurve rechts
    [93.2583, -877.3395, 31.7673], [94.6104, -892.9097, 32.4408], [102.1151, -906.6187, 34.1623],
    // Kurve links 66°, Radius 28 m, Steigung 5 % – Einmündung: links auf die Hauptstrasse
    [114.6316, -920.1846, 35.1247], [120.9916, -933.3800, 35.8697], [119.8185, -947.9811, 36.6147],
    // Kurve rechts 28°, Radius 45 m, Steigung 0 % – Hauptstrasse: Kurve rechts
    [114.1036, -963.8901, 37.4663],
// </nebenweg>
    // Ende der Kurve links 45°, Radius 70 m (wie vor M3a)
    [113.7, -980.4, 38.3], [114.6, -991.4, 38.8],
    // gerade 30 m, Steigung 5 %
    [114.6, -1021.4, 40.3],
    // Kurve rechts 80°, Radius 90 m, Steigung 5 %
    [115.4, -1033.9, 40.9], [118.0, -1046.2, 41.6], [122.3, -1058.0, 42.2],
    [128.2, -1069.1, 42.8], [135.6, -1079.2, 43.5], [144.3, -1088.3, 44.1],
    [154.2, -1096.0, 44.7], [165.1, -1102.3, 45.3], [176.7, -1107.0, 46.0],
    [188.9, -1110.0, 46.6],
    // gerade 72 m, Steigung 6 %
    [212.6, -1114.2, 48.0], [236.2, -1118.4, 49.5], [259.8, -1122.5, 50.9],

    // --- 4. Kehrengruppe: vier Spitzkehren am Hang: links, rechts, links, rechts ---
    'Kehrengruppe',
    // gerade 70 m, Steigung 8 %
    [282.8, -1126.6, 52.8], [305.8, -1130.6, 54.7], [328.8, -1134.7, 56.5],
    // Spitzkehre links 180°, Radius 13 m, Steigung 6 %
    [333.5, -1136.5, 56.8], [337.2, -1140.0, 57.1], [339.2, -1144.7, 57.4],
    [339.3, -1149.7, 57.7], [337.5, -1154.5, 58.1], [334.0, -1158.1, 58.4],
    [329.3, -1160.2, 58.7], [324.3, -1160.3, 59.0],
    // gerade 105 m, Steigung 11 %
    [298.4, -1155.7, 61.9], [272.5, -1151.2, 64.7], [246.7, -1146.6, 67.6],
    [220.8, -1142.1, 70.5],
    // Spitzkehre rechts 180°, Radius 13 m, Steigung 6 %
    [215.8, -1142.2, 70.8], [211.1, -1144.2, 71.1], [207.6, -1147.9, 71.4],
    [205.8, -1152.6, 71.7], [205.9, -1157.7, 72.1], [207.9, -1162.3, 72.4],
    [211.6, -1165.8, 72.7], [216.3, -1167.7, 73.0],
    // gerade 105 m, Steigung 11 %
    [242.2, -1172.2, 75.9], [268.0, -1176.8, 78.7], [293.9, -1181.3, 81.6],
    [319.7, -1185.9, 84.5],
    // Spitzkehre links 180°, Radius 13 m, Steigung 6 %
    [324.5, -1187.7, 84.8], [328.1, -1191.2, 85.1], [330.2, -1195.9, 85.4],
    [330.3, -1200.9, 85.7], [328.4, -1205.7, 86.1], [324.9, -1209.3, 86.4],
    [320.3, -1211.4, 86.7], [315.2, -1211.5, 87.0],
    // gerade 105 m, Steigung 11 %
    [289.4, -1206.9, 89.9], [263.5, -1202.4, 92.7], [237.7, -1197.8, 95.6],
    [211.8, -1193.3, 98.5],
    // Spitzkehre rechts 180°, Radius 13 m, Steigung 6 %
    [206.7, -1193.4, 98.8], [202.1, -1195.4, 99.1], [198.6, -1199.1, 99.4],
    [196.8, -1203.8, 99.7], [196.9, -1208.9, 100.1], [198.9, -1213.5, 100.4],
    [202.6, -1217.0, 100.7], [207.3, -1218.9, 101.0],
    // gerade 45 m, Steigung 8 %
    [229.5, -1222.8, 102.8], [251.6, -1226.7, 104.6],

    // --- 5. Felswand 1: Felswand links, Abhang ins Tal rechts ---
    'Felswand 1',
    // Kurve links 30°, Radius 150 m, Steigung 8 % (Anfang)
    [276.9, -1233.4, 106.7], [300.6, -1244.5, 108.8], [322.0, -1259.5, 110.9],

    // --- Seit M3b: Nebenweg "Almweg" (Schotter). Die Felswand hört davor auf und geht nach der
    //     Einmündung weiter (Abschnitt-Zeile "Felswand 1" im Bogen) ---
// <nebenweg Almweg>
    // (automatisch von tools/nebenweg-bogen.mjs – Bogen dort ändern, nicht hier)
    'Almweg',
    // Kurve rechts 45°, Radius 25 m, Steigung 0 % – Abzweig: rechts auf den Almweg (Schotter)
    [342.7271, -1273.1692, 112.8640],
    // gerade 15 m, Steigung 0 %
    [364.5202, -1273.0726, 114.6140],
    // Kurve links 30°, Radius 110 m, Steigung 8 % – Almweg: grosse Kurve links
    [389.4985, -1270.2517, 116.6019], [414.0419, -1272.8767, 118.5551],
    // gerade 219 m, Steigung 8 % – Almweg: lange Gerade
    [438.3322, -1280.6781, 120.5713], [463.3037, -1289.6503, 122.6664], [488.2752, -1298.6224, 124.9183],
    [513.2467, -1307.5945, 127.7702], [538.2182, -1316.5667, 130.6899], [563.1898, -1325.5388, 133.0317],
    [588.1613, -1334.5110, 134.6024], [613.1328, -1343.4831, 135.8128],
    // Kurve rechts 45°, Radius 80 m, Steigung 8 % – Almweg: grosse Kurve rechts
    [637.6979, -1352.1635, 137.3217], [661.5082, -1355.4123, 139.1996], [685.2091, -1351.4434, 141.1043],
    // gerade 20 m, Steigung 0 %
    [708.5623, -1341.1126, 143.1221],
    // Kurve links 40°, Radius 30 m, Steigung 0 % – Einmündung: links auf die Hauptstrasse
    [729.5523, -1336.7000, 144.8468],
    'Felswand 1',
// </nebenweg>
    // gerade 120 m, Steigung 6 % (Rest, wie vor M3b)
    [753.7, -1342.0, 146.8], [777.4, -1346.2, 148.2],
    [801.0, -1350.3, 149.7], [824.6, -1354.5, 151.1],

    // --- 6. Passhöhe: offenes Hochplateau, weite schnelle Kurven ---
    'Passhöhe',
    // Kurve links 50°, Radius 260 m, Steigung 3 %
    [849.2, -1360.1, 151.9], [873.1, -1368.0, 152.6], [896.2, -1378.2, 153.4],
    [918.1, -1390.6, 154.1], [938.8, -1405.1, 154.9], [957.9, -1421.4, 155.6],
    [975.4, -1439.6, 156.4], [991.0, -1459.4, 157.1], [1004.6, -1480.6, 157.9],
    // Kurve rechts 20°, Radius 350 m, Steigung 0 % (Anfang)
    [1017.6, -1501.3, 157.9], [1032.0, -1521.0, 157.9], [1047.7, -1539.8, 157.9],

    // --- Seit M3b: Nebenweg "Wiesenweg" (Feldweg über die Wiese, Checkpoint 3). Die Abfahrt mit der
    //     Felswand beginnt erst nach der Einmündung (Abschnitt-Zeile "Abfahrt" im Bogen) ---
// <nebenweg Wiesenweg>
    // (automatisch von tools/nebenweg-bogen.mjs – Bogen dort ändern, nicht hier)
    'Wiesenweg',
    // gerade 26 m, Steigung 0 %
    [1066.8774, -1550.5853, 156.6917],
    // Kurve links 26°, Radius 80 m, Steigung -5 % – Wiesenweg: Kurve links
    [1093.1690, -1556.3334, 155.2523], [1115.7781, -1566.4827, 153.9216],
    // gerade 163 m, Steigung -5 %
    [1137.0966, -1582.6174, 152.4915], [1158.7627, -1599.3434, 151.0278], [1180.4289, -1616.0693, 149.5640],
    [1202.0950, -1632.7953, 148.1003], [1223.7612, -1649.5213, 146.6365], [1245.4273, -1666.2472, 145.1727],
    // Kurve rechts 36°, Radius 70 m, Steigung -5 % – Wiesenweg: Kurve rechts
    [1266.7586, -1679.3950, 143.8272], [1290.6755, -1684.4201, 142.5135],
    // Kurve links 36°, Radius 25 m, Steigung 0 % – Einmündung: links auf die Hauptstrasse
    [1313.1636, -1688.3784, 141.2743],
    'Abfahrt',
// </nebenweg>
    // Kurve links 25°, Radius 220 m (Ende, wie vor M3b)
    [1334.0, -1703.4, 139.9],
    // gerade 40 m, Steigung -6 %
    [1350.4, -1714.9, 138.7], [1366.8, -1726.3, 137.5],
    // Kurve rechts 45°, Radius 30 m, Steigung -3 %
    [1377.5, -1731.0, 137.1], [1389.2, -1731.3, 136.8],
    // Kurve links 45°, Radius 30 m, Steigung -3 %
    [1400.9, -1731.6, 136.4], [1411.6, -1736.3, 136.0],
    // gerade 60 m, Steigung -7 %
    [1436.2, -1753.5, 133.9], [1460.8, -1770.7, 131.8],
    // Kurve rechts 25°, Radius 250 m, Steigung -7 %
    [1483.9, -1785.1, 129.9], [1508.5, -1796.9, 128.0], [1534.2, -1805.9, 126.1],
    [1560.7, -1812.1, 124.2],
    // gerade 30 m, Steigung -4 %
    [1590.3, -1817.3, 123.0],

    // --- 8. Zielgerade: flach, Ziellinie ---
    'Zielgerade',
    // gerade 250 m, Steigung 0 %
    [1614.9, -1821.6, 123.0], [1639.5, -1826.0, 123.0], [1664.1, -1830.3, 123.0],
    [1688.8, -1834.7, 123.0], [1713.4, -1839.0, 123.0], [1738.0, -1843.4, 123.0],
    [1762.6, -1847.7, 123.0], [1787.2, -1852.0, 123.0], [1811.9, -1856.4, 123.0],
    [1836.5, -1860.7, 123.0],
  ],

  // --- Start, Ziel, Checkpoints ---
  strasse: {
    startBeiMeter: 25,         // Startlinie: so viele Meter nach Strassenanfang
    zielVorEnde: 45,           // Ziellinie: so viele Meter vor Strassenende
    spawnBeiMeter: 10,         // hier steht das Auto beim Start
  },
  checkpoints: [900, 1870, 2880], // wo die Tore stehen (Meter ab Strassenanfang)

  // M10d: drei Sprünge auf natürlichen Kuppen (Format wie Finnland, docs/strecken-format.md „Sprünge“). Der Verlauf der
  // Strasse bleibt, nur das Höhenprofil bekommt Kuppen. Orte: schnelle Geraden (Testfahrer ≥ 90 km/h), Landezone 60 m frei,
  // nicht vor den Kehren, je ein Drittel der Strecke. Richtwerte bei 100 km/h: 1 klein 15–18 m, 2 dazwischen, 3 mittel 20–25 m.
  sprung: [
    { s: 180, name: 'STARTKUPPE', von: 95, bis: 300, kante: 180, landeVon: 184, landeBis: 215, staerke: 1.0,
      form: { anlauf: 40, rampe: 0.061, kante: 2, gefaelle: 0.061, auslauf: 30, weich: 15 } },
    { s: 2140, name: 'ALMKUPPE', von: 2050, bis: 2265, kante: 2140, landeVon: 2145, landeBis: 2180, staerke: 1.0,
      form: { anlauf: 35, rampe: 0.08, kante: 3, gefaelle: 0.08, auslauf: 30, weich: 15 } },
    { s: 3440, name: 'ZIELKUPPE', von: 3340, bis: 3560, kante: 3440, landeVon: 3445, landeBis: 3485, staerke: 1.0,
      form: { anlauf: 40, rampe: 0.08, kante: 3, gefaelle: 0.08, auslauf: 30, weich: 15 } },
  ],

  // --- Nebenwege: Untergrund-Abschnitte (sonst Asphalt). Die Etappe biegt von der Hauptstrasse auf einen Nebenweg ab
  //     und mündet später wieder ein; die Hauptstrasse läuft an beiden Stellen als Stummel weiter (abgesperrt, Ende
  //     versteckt). Stützpunkte des Nebenwegs: oben in "punkte" (gerechnet mit tools/nebenweg-bogen.mjs).
  nebenwege: [
    {
      name: 'Talschleife',
      abzweig: 800,            // hier verlässt die Etappe die Hauptstrasse (Streckenmeter, Anfang der Abbiege-Kurve)
      einmuendung: 1020.5,     // hier ist sie wieder auf der Hauptstrasse (Ende der Einmündungs-Kurve)
      belag: 'schotter',       // Belag dazwischen
      sperreAbzweig: 'band',   // Absperrung auf dem Stummel: 'band', 'reifen', 'heu', 'zaun' (leer = reihum)
      sperreEinmuendung: 'reifen',
      // Form der Stummel (fehlt etwas, gilt der Wert aus "stummel" unten)
      stummelAbzweig: { kurve: -75, radius: 50, seitenschutz: 'zaun' },
      stummelEinmuendung: { kurve: -70, radius: 55, seitenschutz: 'planke' },
    },
    {
      // M3b: nach den Kehren, ca. 415 m: biegt nach rechts ab (Talseite), lange Gerade über die Alp, kommt von links
      // (Bergseite) zurück. Die Felswand hört davor auf und beginnt danach wieder.
      name: 'Almweg',
      abzweig: 1985.6,         // Werte laut tools/nebenweg-bogen.mjs (Ausgabe "Streckenmeter")
      einmuendung: 2400.8,
      belag: 'schotter',
      // Absperrungen ohne Angabe: reihum (absperrung.reihenfolge), hier Strohballen (heu) und Holzböcke (zaun)
      // Waldrand (M3b, sonst wie nebenwegWald): Alp und Wiese, nur lockere Gruppen mit viel Wiese dazwischen.
      // Dichter nur, wo man sonst abkürzen könnte (geprüft mit tools/nebenweg-wald.mjs)
      wald: {
        innenAbKruemmung: 1 / 130, // auch die weiten Kurven (Radius bis 130 m) haben eine dichte Innenseite
        innen: { abstand: [6.2, 6.9], gruppe: [3, 6], schritt: [1.7, 2.3], luecke: [0.5, 1.1], zweiteReihe: 0.35, zweiteAbstand: [9, 12] },
        aussen: { abstand: [8, 15], gruppe: [1, 3], schritt: [2, 3.5], luecke: [16, 38], zweiteReihe: 0.15, zweiteAbstand: [11, 16] },
      },
      // Kreuzungen mit flacherem Winkel (40-45°) als bei der Talschleife: Etappe und Stummel liegen länger
      // übereinander, darum liegt der Stummel länger genau auf der Höhe der Etappe (hoeheAngleichen)
      stummelAbzweig: { kurve: -70, radius: 50, seitenschutz: 'zaun', hoeheAngleichen: [26, 46] },
      stummelEinmuendung: { kurve: -70, radius: 55, seitenschutz: 'zaun', hoeheAngleichen: [26, 46] },
    },
    {
      // M3b: auf der Abfahrt, nach rechts über die Wiese (Feldweg), ca. 310 m. Checkpoint 3 liegt darauf.
      name: 'Wiesenweg',
      abzweig: 2797.7,
      einmuendung: 3107.9,
      belag: 'wiesenweg',
      // Absperrungen ohne Angabe: reihum (absperrung.reihenfolge), hier Flatterband (band) und Reifen
      // Waldrand (M3b, sonst wie nebenwegWald): Alp und Wiese, nur lockere Gruppen mit viel Wiese dazwischen.
      // Dichter nur, wo man sonst abkürzen könnte (geprüft mit tools/nebenweg-wald.mjs)
      wald: {
        innenAbKruemmung: 1 / 130, // auch die weiten Kurven (Radius bis 130 m) haben eine dichte Innenseite
        innen: { abstand: [6.2, 6.9], gruppe: [3, 6], schritt: [1.7, 2.3], luecke: [0.5, 1.1], zweiteReihe: 0.35, zweiteAbstand: [9, 12] },
        aussen: { abstand: [8, 15], gruppe: [1, 3], schritt: [2, 3.5], luecke: [16, 38], zweiteReihe: 0.15, zweiteAbstand: [11, 16] },
        steinAnteil: 0.3,          // Wiese: mehr Felsbrocken statt Tannen
      },
      // Kreuzungen mit flachem Winkel (36°): Stummel länger auf der Höhe der Etappe (siehe Almweg)
      stummelAbzweig: { kurve: -70, radius: 55, seitenschutz: 'zaun', hoeheAngleichen: [32, 54] },
      stummelEinmuendung: { kurve: -70, radius: 55, seitenschutz: 'zaun', hoeheAngleichen: [32, 54] },
    },
  ],

  // --- Umgebung: Palette, Licht, Dunst, Hintergrundberge, Fernwald-Farben, Gelände ---
  umgebung: {
    farben: {
      himmelOben: '#2d6fd2',     // klares Blau im Zenit
      dunst: '#aabdc8',          // Blaugrau am Horizont (= Nebelfarbe, auch für Gelände und Bergfüsse)
      gras: '#4e9a2c',           // sattes Gras
      grasDunkel: '#3b7d22',     // dunklere Grasflecken
      fels: '#7f7b74',           // Steingrau (steile Hänge, Felswand)
      felsDunkel: '#5f5b55',     // dunkler Fels
      erde: '#7a6446',           // Erde an steilen, nicht ganz felsigen Stellen
      bankett: '#8b6e4a',        // Schotterbraun neben der Strasse
      asphalt: '#56585b',        // Strassenbelag
      mittellinie: '#c9c9bd',    // dezente Mittellinie
      schotter: '#ada48f',       // Schotter-Nebenweg: helles Graubeige (seit M3a)
      schotterSpur: '#968d7a',   // ... festgefahrene Fahrspuren, etwas dunkler
      wiesenweg: '#7c6243',      // Wiesenweg (M3b): erdbraun ...
      wiesenwegSpur: '#6a523a',  // ... die zwei festgefahrenen Fahrspuren, dunkler
      wiesenwegGras: '#4e9a2c',  // ... Gras in der Mitte und am Rand (wie farben.gras)
      bergFels: '#596070',         // Hintergrundberge, Fels
      bergFuss: '#3f6a30',       // Hintergrundberge, bewaldeter Fuss (passt zum fernen Gelände)
      schnee: '#f2f5fa',         // Schneekappen
      // (Autofarben seit M8a in autoOptik: Lackierungen und feste Farben)
    },
    licht: {
      sonneStaerke: 2.2,         // Helligkeit der Sonne
      sonneFarbe: '#fff3df',     // leicht warmes Sonnenlicht
      sonneRichtung: [0.5, 0.9, 0.35], // woher die Sonne scheint (x, y, z)
      umgebungStaerke: 1.15,     // Grundhelligkeit (Schattenseiten)
      umgebungFarbe: '#c9d6ec',  // leicht bläuliches Umgebungslicht
    },
    nebel: {
      start: 120,                // ab hier beginnt der Dunst (Meter)
      ende: 3000,                // hier ist der Dunst am dichtesten (Meter)
      maxDichte: 0.45,           // so dicht wird der Dunst höchstens (0..1). Nur leichte Tiefenwirkung:
                                 // je höher, desto eher entsteht wieder ein milchiger Dunststreifen
      bergDunst: 0.15,           // Hintergrundberge: so viel Dunst liegt auf den Gipfeln (0..1)
      bergDunstUnten: 0.3,       // ... und so viel kommt zum Bergfuss hin dazu. Fuss = beide zusammen,
                                 // sollte etwa maxDichte sein, dann passt der Fuss zum fernen Gelände
    },
    berge: {
      anzahl: 34,                // Berge im hinteren Kranz (vorne kommen 70 % dazu)
      abstand: [1400, 2200],     // Entfernung hinter dem Geländerand (Meter)
      hoehe: [1000, 1750],       // Gipfelhöhe (bei bezugsAbstand, weiter weg etwas höher)
      bezugsAbstand: 3300,       // bei dieser Entfernung gilt die Gipfelhöhe
      schneeAb: 0.5,             // Schnee ab diesem Anteil der Höhe
      fussBis: 0.3,              // bis zu diesem Anteil der Höhe geht der Bergfuss von Grün (farben.bergFuss) in Fels über
    },
    fernwald: {
      waldFarbe: '#224821',      // Tannengrün der Waldstücke ...
      waldDunkel: '#163418',     // ... mit dunkleren Flecken (Kronen)
      wiesenFarbe: '#5da838',    // offene Wiese in der Ferne: etwas heller
      geroellFarbe: '#77736a',   // Geröllflecken an Hängen
    },
    gelaende: {
      huegelHoehe: 7,            // Höhe der kleinen Zufallshügel
      grundWeite: 250,           // Grundhöhe der Landschaft = Strassenhöhe, über so viele Meter gemittelt
      wandBerg: 75,              // Berg hinter den Felswänden (Höhe über der Grundhöhe)
      talTiefe: 55,              // Tal unter den Abhängen (Tiefe unter der Grundhöhe)
      randAnstiegAb: 350,        // ab diesem Abstand von der Strecke steigt das Land an ...
      randAnstiegBis: 1000,      // ... bis hier ...
      randHoehe: 170,            // ... um so viele Meter (Talflanken, liegen im Dunst)
    },
    // Zusätzliche Landschaftsformen von Hand: grosse Hügel und Senken (radius = wie breit, hoehe = wie hoch, negativ = Senke).
    // Berge hinter den Felswänden und Täler unter den Abhängen entstehen automatisch.
    landschaft: [
      { x: -260, z: -350, radius: 220, hoehe: 70 },   // Hügel westlich vom Tal
      { x: 330, z: -500, radius: 200, hoehe: 45 },    // Hügel östlich vom Tal
      { x: 250, z: -1330, radius: 190, hoehe: 70 },   // Hang über der Kehrengruppe
      { x: 1150, z: -1150, radius: 260, hoehe: -40 }, // Senke unter der Felswand 1
      { x: 1500, z: -1450, radius: 230, hoehe: 70 },  // Berg zwischen Pass und Abfahrt
    ],
  },

  // --- Natur: Baumdichte, Büsche, Kühe, Waldrand-Gruppen ---
  natur: {
    sprites: {
      tannenProKm: 4200,         // Versuche pro km Strecke (wie viele stehen bleiben, hängt vom Abschnitt ab)
      laubProKm: 2800,
      steineProKm: 1600,
    },
    buesche: {
      blueten: 0.18,             // so ein Anteil der Büsche blüht (rosa Alpenrosen)
      beeren: 0.15,              // ... so ein Anteil sind Heidelbeer-Sträucher
    },
    kuehe: {
      anzahl: 34,                // so viele Kühe insgesamt (ungefähr; passen nicht alle hin, sind es weniger)
      einzeln: 3,                // dazu so viele Einzeltiere
      anteilTal: 0.6,            // so ein Anteil der Kühe steht auf den Weiden im Tal (Rest auf den Alpwiesen)
      alpAb: 120,                // Alpwiese: Strasse höher als so viele Meter über dem Start ...
      alpBreite: [10, 30],       // ... Kühe so weit neben der Strasse (mehr als 45 m kommt man mit dem Auto nicht hin)
      passBei: 2586,             // nahe dieser Stelle (Passhöhe, Streckenmeter) steht sicher eine Herde auf der Alpwiese
      // M3c: zusätzliche Herden beim Start und beim Ziel (s = Streckenmeter, seite -1 links / +1 rechts,
      // lat = so weit neben der Strasse). Werden zuletzt geplant: alle anderen Kühe bleiben gleich.
      zusatzHerden: [
        { s: 150, seite: 1, lat: [26, 40], anzahl: 5 },   // Start: Wiese rechts, nach dem Zuschauerbereich
        { s: 3505, seite: 1, lat: [20, 34], anzahl: 5 },  // Ziel: Weide rechts hinter dem Zaun, vor dem Zuschauerbereich
      ],
    },
    // Waldrand an den Nebenwegen: von Hand gesetzte Gruppen (Tannen und Felsen gemischt): s = Streckenmeter (Mitte)
    // 766 links: vor dem Abzweig, schliesst wie in M3a die Linien aus der freien Kurve 482-752 bis an den Abzweig
    nebenwegWaldGruppen: [
      { s: 766, seite: -1, abstand: [7, 10.5], laenge: 12, anzahl: 6, steine: 0.4 },
      // M3b: Almweg, Innenseite der grossen Linkskurve (dort blieb eine Lücke für eine Abkürzungs-Linie)
      { s: 2075, seite: -1, abstand: [9, 22], laenge: 30, anzahl: 10, steine: 0.3 },
      // M3b: Wiesenweg, kleines Wäldchen in der Ecke rechts vom Abzweig: Die Kreuzung ist flach (36°),
      // quer über die Wiese sparte man dort sonst bis 8.7 m (1.7 s)
      { s: 2765, seite: 1, abstand: [7, 22], laenge: 34, anzahl: 18, steine: 0.25 },
      { s: 2812, seite: 1, abstand: [7, 18], laenge: 30, anzahl: 14, steine: 0.25 },
    ],
  },

  // --- Start und Ziel: Verlängerungen hinter Start und Ziel (abgesperrt, Ende versteckt), Bäume rundherum ---
  startZiel: {
    // Verlängerung hinter dem Start (Richtung Strassenanfang, hinter dem Auto)
    start: {
      form: { gerade: 80, kurve: 75, radius: 45, rest: 50, kuppe: 1.8, abfall: 0.08, seitenschutz: 'zaun', sichtschutz: 16, sichtschutzSeed: 3401 },
      sperreBei: 34,           // Absperrung so viele Meter hinter dem Strassenanfang (Auto steht 10 m davor)
      sperreBogen: 1.6,        // ... Mitte der Absperrung so viel weiter hinten als die Enden (gebogen)
      sperreUeber: 0.3,        // ... reicht so weit über das Bankett hinaus (dort beginnt der Seitenschutz)
      sperreArt: 'heu',        // 'band', 'reifen', 'heu', 'zaun' (wie bei den Nebenwegen)
    },
    // Verlängerung hinter dem Ziel: Ausrollstrecke, dann Absperrung, Kurve, versteckt
    ziel: {
      form: { gerade: 175, kurve: -80, radius: 50, rest: 55, kuppe: 2.4, abfall: 0.09, seitenschutz: 'zaun', sichtschutz: 18, sichtschutzSeed: 3402 },
      sperreBei: 155,          // Absperrung so viele Meter nach dem Strassenende (Ziellinie 45 m davor: ca. 200 m Ausrollen)
      sperreBogen: 2.0,
      sperreUeber: 0.3,
      sperreArt: 'reifen',
    },
    // Bäume und Büsche: Übergang zur Landschaft. gruppen: bereich, seite, Meter ab der Linie (von, bis), seitlich (von, bis), Anzahl Gruppen
    landschaft: {
      gruppen: [
        { bereich: 'start', seite: 1, m: [-90, 120], lat: [22, 70], anzahl: 8 },
        { bereich: 'start', seite: -1, m: [-110, -30], lat: [16, 60], anzahl: 5 },
        { bereich: 'start', seite: -1, m: [-230, -110], lat: [12, 50], anzahl: 6 },
        { bereich: 'start', seite: 1, m: [-230, -110], lat: [12, 50], anzahl: 6 },
        { bereich: 'ziel', seite: 1, m: [-90, 120], lat: [24, 70], anzahl: 8 },
        { bereich: 'ziel', seite: -1, m: [-90, 120], lat: [22, 70], anzahl: 7 },
        { bereich: 'ziel', seite: 1, m: [80, 190], lat: [14, 40], anzahl: 4 },   // entlang der Ausrollstrecke
        { bereich: 'ziel', seite: -1, m: [80, 190], lat: [14, 40], anzahl: 4 },
        { bereich: 'ziel', seite: 1, m: [190, 350], lat: [12, 50], anzahl: 8 },
        { bereich: 'ziel', seite: -1, m: [190, 350], lat: [12, 50], anzahl: 8 },
      ],
      proGruppe: [3, 7],        // Bäume pro Gruppe
      gruppeRadius: 7,          // ... so weit verstreut
      laubAnteil: 0.3,          // so ein Anteil Laubbäume (Rest Tannen)
      strasse: 11,              // Bäume mindestens so weit von jeder Strassenmitte
      buesche: 45,              // Büsche je Bereich (Versuche)
      buschLat: [8, 30],        // ... so weit neben der Strasse
    },
  },

  // --- Leben an der Strecke (Meilenstein 3d, js/leben.js) --------------
  // Wiesenweg als Alpweide (Zaun, Kühe, Alphütte, Heustadel, Brunnen, Steinmännchen, Wegweiser, Heurollen,
  // Findlinge), drei Fan-Spots und zwei Unfallautos (stehende Wracks). Alles hat eigene seeds: Bäume, Kühe,
  // Zäune und Schilder von vorher bleiben genau, wo sie sind. Orte: s = Streckenmeter, seite -1 links / +1
  // rechts (in Fahrtrichtung), lat = so weit neben der Strassenmitte (Meter), drehung in Grad.
  // Regeln (prüft tools/leben-test.mjs): nie näher als abstandStrasse an einer Strassenmitte (auch Stummel),
  // nie auf der Innenseite einer Kurve (Abkürzungs-Kurven plus Puffer, dazu jede engere Kurve der Etappe).
  leben: {
    an: true,                  // false = alles wie vor M3d
    sichtweite: 600,           // weiter weg von der Kamera wird ein Ort nicht gezeichnet (unter 1 Pixel)
    abstandStrasse: 6.5,       // Hütten, Details, Wracks mindestens so weit neben jeder Strassenmitte
    pufferNichtSchneiden: 20,  // Innenseite der gesperrten Kurven (sVon–sBis plus so viel) bleibt frei
    pufferSchneiden: 50,       // ... und der freien Kurven
    innenRadius: 130,          // dazu jede Kurve enger als das (auch auf den Nebenwegen): Innenseite frei ...
    innenVorNach: 20,          // ... auch so viele Meter vor und nach der Kurve ...
    innenBreite: 60,           // ... bis so weit neben der Strasse

    // Holzzaun am Wiesenweg (dazu der Zaun von M2a rechts bei 2931–3068 m). Gebaut wie die anderen Zäune
    // (Abstand per randAbstand an die schmale Strasse angepasst), mit Weidetoren (Lücken wie in M2a)
    zaeune: [
      { seite: -1, von: 2888, bis: 2952, latten: 3, tore: [2905] },  // links nach Checkpoint 3: Weide mit der Herde von vorher; tore: Lücke ab diesem Meter (leer = reihum)
    ],
    torAlle: [24, 40],         // ein Weidetor alle so viele Meter Zaun
    tor: [4, 5.5],             // Breite der Lücke (Meter)

    // Neue Kühe (eigene Herden mit eigenem seed; die alten Kühe sind in js/kuhfolge.js eingefroren)
    kuehe: {
      herdenAbstand: 26,       // neue Herden mindestens so weit von jeder anderen Herde (Mitte zu Mitte)
      herden: [
        { s: 3008, seite: -1, lat: [13, 24], anzahl: 4, radius: 6 },   // vor der Alphütte
        { s: 2985, seite: 1, lat: [11, 18], anzahl: 3, radius: 5 },    // rechts hinter dem Zaun von M2a
        { s: 2862, seite: 1, lat: [26, 36], anzahl: 3, radius: 6 },    // rechts am Hang beim Abzweig
      ],
    },

    // Wiesenweg (2798–3108 m): Alphütte, Heustadel, Kleinigkeiten
    wiesenweg: {
      huette: { s: 2988, seite: -1, lat: 38, drehung: 12, laenge: 7.6, tiefe: 5.6, hoehe: 2.5 }, // Alphütte (laenge entlang der Strasse)
      stadel: { s: 2900, seite: 1, lat: 52, drehung: -18, laenge: 5.2, tiefe: 4.2, hoehe: 2.3 },  // kleiner Heustadel weiter weg
      brunnen: { s: 2979, seite: -1, lat: 31, drehung: 20 },       // Brunnentrog mit Röhre
      holzstapel: true,                                           // Holzstapel an der Hüttenwand
      wegweiser: { s: 2957, seite: -1, lat: 7.4 },                // gelber Wanderwegweiser (erfundene Ziele)
      steinmaennchen: [[2852, 1, 21], [2918, 1, 31], [3043, -1, 20]], // [s, seite, lat]
      heurollen: [[2866, 1, 19], [2869.5, 1, 22.2], [2862, 1, 23.5], [3057, -1, 25], [3062.5, -1, 28]],
      findlinge: [[2908, -1, 25, 2.0], [3000, 1, 13, 1.6], [2945, 1, 42, 2.6]], // [s, seite, lat, Höhe]
    },

    // Fan-Spots (Zuschauer wie in M3c: Pixel-Figuren, schauen zur Strasse, hinter dem Absperrband)
    fans: {
      abstand: 7.2,            // Zuschauer mindestens so weit neben jeder Strassenmitte
      gruppe: [3, 7],          // Grösse der Gruppen
      gruppeLaenge: 6,         // eine Gruppe steht über so viele Meter verteilt
      radius: 0.35,            // Kollision und Platzbedarf je Zuschauer
      dicht: 0.75,             // so nah stehen zwei Zuschauer höchstens
      blickStreuung: 0.6,      // Blick zur Strasse, so viel (Bogenmass) zufällig daneben
      posen: [0.22, 0.18, 0.14, 0.14, 0.1, 0.12, 0.1], // stehend, winkend, jubelnd, Schweizer Fahne, Fotograf, Mütze, Fahne
      kinder: 0.1,
      spots: [
        {
          name: 'kehren', s: [1694, 1716], seite: 1, lat: [8.5, 19], anzahl: 22, blickS: 1668, // am Hang aussen an Kehre 3
          band: [[1692, 1718, 7.9]],               // Absperrband: von, bis, lat
          banner: [[1704.5, 9.6, 'kehre']],          // Fan-Banner auf zwei Pfosten: s, lat, Name (lebenbild.js)
          fahnen: [[1697, 16, 'motiv'], [1706, 13.5, 'gruen']],
          stuehle: 3,                              // Klappstühle (mit sitzenden Fans)
        },
        {
          name: 'pass', s: [2590, 2652], seite: 1, lat: [8, 17], anzahl: 28, blickS: null,   // Passhöhe, grösster Spot
          band: [[2596, 2656, 7.2]],
          banner: [[2616, 9.2, 'pass'], [2641, 9.4, 'turbo']],
          fahnen: [[2600, 11, 'motiv'], [2624, 12.5, 'motiv'], [2646, 11.5, 'rot']],
          stuehle: 4,
          camper: [2630, 21.5, 14],                // Wohnmobil: s, lat, Drehung
          zelt: [2609, 17.5],                      // Pavillon
        },
        {
          name: 'alm', s: [1970, 1990], seite: -1, lat: [8.5, 14], anzahl: 14, blickS: 1984,  // hinter der Strohballen-Wand am Almweg-Abzweig
          band: [[1968, 1986, 7.8]],
          banner: [[1977, 9.4, 'alm']],
          fahnen: [[1984, 12.5, 'motiv']],
          stuehle: 2,
          pickup: [1979, 18.5, -60],               // parkierter Pickup: s, lat, Drehung
        },
      ],
    },

    // Unfallautos (stehende Wracks, Fantasie-Rallyeautos im Stil der 80er-Gruppe B, keine echten Modelle)
    //   typ 'brunnwald' (Keil-Coupé) oder 'vallora' (kantiger Kompakter), Farben, Startnummer, Sponsor
    //   baum: [s, seite, lat] = das Auto steckt mit der Front am nächsten Baum dort (Baum bleibt, wo er ist)
    //   sonst s/seite/lat/drehung (Grad: 0 = in Fahrtrichtung, 90 = schaut von der Strasse weg)
    //   warndreieck: so viele Meter davor am Strassenrand (lat), posten: Streckenposten [s, lat]
    wracks: [
      {
        name: 'tal', typ: 'brunnwald', lack: '#f2f0e8', akzent: '#c8202a', nummer: '14', sponsor: 'firn',
        baum: [638, 1, 12.2], anstoss: 0.28, winkel: 42,   // Front 0.28 m neben der Mitte am Stamm, so schräg zur Strasse
        schaden: 'front',                                   // Front eingedrückt, Haube offen, Rad schief
        warndreieck: { vor: 24, lat: 6.3 }, flagge: { vor: 20, lat: 7.0 },
        posten: [[651, 13.5], [626, 15.5]],
      },
      {
        name: 'abfahrt', typ: 'vallora', lack: '#2f62c8', akzent: '#f0c020', nummer: '23', sponsor: 'murmeli',
        s: 2488, seite: 1, lat: 9.6, drehung: 62,           // an der Böschung gleich nach dem Ende der Leitplanke (vor dem Weidezaun)
        schaden: 'seite',                                   // Seite eingedrückt, Rad ab, Tür abgesprungen, Flügel schief
        warndreieck: { vor: 26, lat: 5.85 }, flagge: { vor: 18, lat: 6.6 },
        posten: [[2503, 13.5], [2474, 12.5]],
      },
    ],
    kreisRadius: 0.92,         // Wrack-Kollision: drei Kreise entlang der Karosserie mit diesem Radius
    postenJacken: ['#ff6a10', '#e2f02a'], // Warnwesten (orange, gelb)
    postenFahne: '#f4d21a',    // gelbe Flagge
    rauch: { anzahl: 6, leben: 5, steigen: 0.5, groesse: [0.5, 1.9], dichte: 0.38, farbe: '#a9a7a2', wind: [0.35, 0.15] }, // dezente Rauchfahne je Wrack (Wölkchen, Lebensdauer s, Steigen m/s, Grösse m, Dichte 0..1)
  },

  // --- Beschriftungen (erfundene Namen, Pixelschrift: nur Grossbuchstaben) ---
  beschriftung: {
    // Fan-Banner und Sponsoren der Wracks: Name, Grundfarbe, Schriftfarbe (Schlüssel wie in leben.fans.spots[].banner, leben.wracks[].sponsor)
    banner: {
      firn: ['FIRNWERK', '#c8202a', '#f2f0e8'],        // Wrack 1 (rot-weiss)
      murmeli: ['MURMELI OEL', '#1d3f8f', '#f0c020'],  // Wrack 2 (blau-gelb)
      turbo: ['TURBO SENN', '#1c1c1c', '#f0c020'],
      kehre: ['FANCLUB KEHRE 3', '#2c7a3a', '#f2f0e8'], // Fan-Spot Kehren
      pass: ['HOPP HOPP PASSFANS', '#c8202a', '#f2f0e8'], // Fan-Spot Passhöhe
      alm: ['ALMRAUSCH FANS', '#f0c020', '#1c1c1c'],    // Fan-Spot Almweg
    },
    // Sponsor-Streifen für die Unfallautos (Schlüssel aus banner; seit M10b hier statt im Code)
    autoSponsoren: ['firn', 'murmeli', 'turbo'],
    // Wanderwegweiser auf der Alpweide (gelb): je Ziel eine Tafel
    wegweiser: ['ALP 1 STD', 'FURGGA 2 STD', 'SEELI 40 MIN'],
    // Sponsoren an Start und Ziel (Banden, Banner): Name, Grundfarbe, Schriftfarbe
    sponsoren: [
      ['BERGKRAFT', '#1f4fa8', '#f2f0e8'], ['SENNHOF', '#2c7a3a', '#f4e27a'], ['AUDAN', '#c8202a', '#f2f0e8'], ['PASSGOLD', '#f0c020', '#1c1c1c'],
    ],
  },

  // --- Umgebungsklang ---
  klang: {
    // Publikum an Start, Ziel und den Fan-Spots (Name wie in leben.fans.spots): Stärke; Start/Ziel: Meter ab der Linie
    publikumOrte: {
      start: { staerke: 1.0, von: -70, bis: 70 },
      ziel: { staerke: 1.0, von: -70, bis: 350 },
      kehren: { staerke: 0.6 }, pass: { staerke: 0.8 }, alm: { staerke: 0.5 },
    },
    boeenAbschnitt: 'Passhöhe', // Windböen in diesem Abschnitt (null = keine)
  },

  // --- Abkürzungen von Hand (sonst entscheidet tools/abkuerzungen.mjs) ---
  abkuerzung: {
    immerSperren: [],          // Streckenmeter irgendwo in einer Kurve, die immer gesperrt sein soll, z. B. [1520]
    immerFrei: [],             // Streckenmeter irgendwo in einer Kurve, die immer frei sein soll, z. B. [612]
    sperrThemen: {},           // Thema einer gesperrten Kurve von Hand: Streckenmeter -> 'fels', 'staemme' oder 'baeume'
  },

  // --- Von Werkzeugen erzeugt – bitte nicht von Hand ändern (Werkzeug steht beim Block) ---
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
      streckenLaenge: 3667.59,
      minGewinn: 3,
      sperren: [
        { s: 1371, seite: -1, von: 6, bis: 11.1 },
        { s: 1381, seite: -1, von: 6, bis: 9.9 },
        { s: 1394, seite: -1, von: 6, bis: 11.9 },
        { s: 1516, seite: 1, von: 6, bis: 11.9 },
        { s: 1528, seite: 1, von: 6, bis: 10.7 },
        { s: 1542, seite: 1, von: 6, bis: 10.3 },
        { s: 1811, seite: 1, von: 6, bis: 10.8 },
        { s: 1818, seite: 1, von: 6, bis: 9 },
        { s: 1833, seite: 1, von: 6, bis: 10.8 },
        { s: 1837, seite: 1, von: 6, bis: 9.1 },
        { s: 3205, seite: -1, von: 6, bis: 9 },
      ],
      nichtSchneiden: [
        { sVon: 1350, sBis: 1415, seite: 'links' }, // Gewinn bis 6.9 m – Gewinn 6.9 m, Umgebung: 4.84 Bäume/Steine pro 100 m², Hang 23 %
        { sVon: 1496, sBis: 1562, seite: 'rechts' }, // Gewinn bis 8.4 m – Gewinn 8.4 m, Umgebung: 3.88 Bäume/Steine pro 100 m², Hang 22 %
        { sVon: 1789, sBis: 1854, seite: 'rechts' }, // Gewinn bis 6.3 m – Gewinn 6.3 m, Umgebung: 4.53 Bäume/Steine pro 100 m², Hang 20 %
        { sVon: 3196, sBis: 3234, seite: 'links' }, // Gewinn bis 3.2 m – Pflicht: Schneiden spart 1.54 s >= 0.5 s
      ],
      schneiden: [
        { sVon: 482, sBis: 752, seite: 'links', gewinn: 7.1 }, // offene Wiese (Sperre wäre eine 21.4 m lange Reihe)
        { sVon: 1085, sBis: 1230, seite: 'rechts', gewinn: 3.2 }, // Quote erreicht, kleinerer Gewinn (4.0 m) oder Nachbar schon gesperrt
        { sVon: 1643, sBis: 1708, seite: 'links', gewinn: 6.3 }, // Quote erreicht, kleinerer Gewinn (7.3 m) oder Nachbar schon gesperrt
        { sVon: 2484, sBis: 2710, seite: 'links', gewinn: 5.1 }, // offene Wiese (Sperre wäre eine 16.4 m lange Reihe)
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
        { von: 265, bis: 418, kmh: 155 }, // rechts 30°, Radius 227 m, asphalt
        { von: 504, bis: 749, kmh: 142.4 }, // links 64°, Radius 168 m, asphalt
        { von: 796, bis: 847, kmh: 59.9 }, // rechts 82°, Radius 25 m, schotter
        { von: 850, bis: 914, kmh: 58.9 }, // links 70°, Radius 31 m, schotter
        { von: 917, bis: 979, kmh: 67.8 }, // rechts 66°, Radius 33 m, schotter
        { von: 981, bis: 1026, kmh: 62.1 }, // links 67°, Radius 23 m, schotter
        { von: 1028, bis: 1057, kmh: null }, // rechts 27°, Radius 31 m, asphalt, Vollgas
        { von: 1088, bis: 1226, kmh: 99 }, // rechts 80°, Radius 79 m, asphalt
        { von: 1353, bis: 1413, kmh: 42.7 }, // links 179°, Radius 13 m, asphalt, Kehre
        { von: 1499, bis: 1560, kmh: 42.7 }, // rechts 180°, Radius 13 m, asphalt, Kehre
        { von: 1645, bis: 1706, kmh: 42.7 }, // links 179°, Radius 13 m, asphalt, Kehre
        { von: 1792, bis: 1852, kmh: 42.7 }, // rechts 179°, Radius 13 m, asphalt, Kehre
        { von: 1879, bis: 1953, kmh: null }, // links 26°, Radius 101 m, asphalt, Vollgas
        { von: 1976, bis: 2022, kmh: 73.2 }, // rechts 46°, Radius 24 m, schotter
        { von: 2027, bis: 2078, kmh: 77.9 }, // links 27°, Radius 70 m, schotter
        { von: 2288, bis: 2361, kmh: 92.2 }, // rechts 47°, Radius 59 m, schotter
        { von: 2365, bis: 2411, kmh: 82.2 }, // links 42°, Radius 35 m, schotter
        { von: 2508, bis: 2706, kmh: 149.6 }, // links 45°, Radius 189 m, asphalt
        { von: 2779, bis: 2829, kmh: 85.8 }, // rechts 43°, Radius 47 m, asphalt
        { von: 2833, bis: 2883, kmh: 78.9 }, // links 29°, Radius 64 m, wiesenweg
        { von: 3022, bis: 3089, kmh: 87.2 }, // rechts 31°, Radius 46 m, wiesenweg
        { von: 3092, bis: 3120, kmh: 73.6 }, // links 32°, Radius 31 m, wiesenweg
        { von: 3161, bis: 3192, kmh: 82.5 }, // rechts 37°, Radius 24 m, asphalt
        { von: 3197, bis: 3231, kmh: null }, // links 37°, Radius 24 m, asphalt, Vollgas
        { von: 3292, bis: 3374, kmh: 147.4 }, // rechts 20°, Radius 201 m, asphalt
      ],
    },
    // </erzeugt>
    // <erzeugt baumfolge>
    // Feste Zufallsfolge der Bäume und Steine (seit Meilenstein 3a) – bitte nicht von Hand ändern.
    //
    // Bäume und Steine werden mit Zufall verteilt (sprites.js, "verteile"): viele Versuche, jeder
    // würfelt eine Stelle, und nur ein Teil davon bekommt wirklich einen Baum. Bis M2c lief das
    // der Reihe nach durch EINE Zufallsfolge. Ein Versuch mit Baum brauchte 8 Zufallszahlen, einer
    // ohne Baum 4. Änderte sich irgendwo die Strecke (ein Baum mehr oder weniger), rutschte die
    // ganze restliche Folge – und ALLE Bäume der Welt standen woanders.
    //
    // Hier ist eingefroren, welcher Versuch beim Stand M2c einen Baum gestellt hat (1 Bit pro
    // Versuch: Tannen, dann Laubbäume, dann Steine). Daraus weiss jeder Versuch, wo in der
    // Zufallsfolge er beginnt – egal, was vorher passiert ist. So bleibt der Wald überall gleich,
    // und nur dort, wo sich die Strecke ändert (z. B. am Nebenweg), stehen die Bäume anders.
    //
    // Gilt nur für sprites.seed = 4242 und genau diese Anzahl Versuche (tannenProKm, laubProKm,
    // steineProKm und Streckenlänge). Ändert sich etwas davon, wird diese Datei nicht benutzt und
    // der ganze Wald neu gewürfelt (dann einfach so lassen oder BAUMFOLGE = null setzen).
    baumfolge: {
      seed: 4242,
      versuche: [15404, 10269, 5868], // Tannen, Laubbäume, Steine
      bits: 'VIQAAQCrhNxygZYoD0yklLI8ViWYREpwYAYIEGKgFGIZAQSQChZisU2VoBBtAQDEdhw1tFGBROVkOgOpAk4Bok4qRGB9AiZSBXhEASHCg8UzxcDVJACwPJG68FIEpwMgcUESesozAQgiieZCHgxmJ2NCggAQjA1HTG0YvhrSWg+iC7AyQBAdEMjkSqGBdkUgHBDaTUGhBw3DqUOaypxbZEjEEkChEnGAhKgAkAMAJaQzUSLCggASQoBAyGhALHaCAaSLKTTlJNMHvTRYMAcUCCOBGeAYBNhRMQqA8RBIaQ4V5OXqRglhMFZQqfFwBKXwoJweQjBALEnR5DD4kgYEp6e1SAJcIJQlAAmQIRlCy0ggIEhpQJcFAhHIi6MBARBzQKRRqlFRAUQnJChFJQyoARSAgsoCpEKMFYIAQCKg4vjxdACFYGQ5miAo0ZqqxQ4UxAFgAWEURgzQpIciMJsO+CIBAM1ggQER+A3ZCQC2AI0ZYMCmqh8SSEIgASgIVms9EAYBRgEiHFib0AYDgxk5HADAYEzqplAglAQ37OLkS2EAAhDCmAyUACAAloAxoQFThkXsZEAqKlawKBDThEqEBkmWEAg04EiAiYBHDmAZwgAsEG4sdUI+YRKGbwWgiOAwA1MDBwAJ354MSgAyRBcMgSRGkJQHJvDDlVkPikERAHNrYNSpYmAAFOkBqhCsQIhlI6IjHRBMAYDQSRoJYVMEUccIggMRYrtAJCLPiUgx3qQiJAKNQKIAwH2AYQo9rRhN4xqURIQQwRyAaJkqBwkGOM8gWGWWQQDJDwOIosB5BFiSZUBdUTIgQ/xUAkOaAwFMdQXAjAQDBuRGMggB1CaDKeIBgXtph0gPQIWJVARbhEzAYDY3ghTXQavpQAwADgQyeephCGCaBEzpHiUYEfQS0JAJIA5IBTjzBA6akkmADrGc1ekYGBgUoIdBb+YQiHELIGAJBsnEnZ5ZxEABSiohYRTFZFUDCxDIragIZiUaZMRLgMAo0MFEJZCFMo0+Byn2A2YDpU8KbQjcgICBABGJBAc54qNKFY2CCFGhKguxuc1gGKrijVokJBwAxFGpwnUAVJliPBcRxBUgkBCjHGmCAHQBIiMURzDhC0VgEgcFAEY4zHQjU0iFAWk0RoSGgFhWFQBWVEENUPPGR4McEjqgIBTQE9ATJNsyOXSVIihIBhcDMiMQJa0Fh0xgvUACJEIm6toMCCIGThwm2fJAcWDEICSme+MMMFIYDZD7OBClEQ/4cUIFm1CB0jMFsZ9KupDizdsDwvgOEQjCalB6ELwTGA67QIDxFyVRyvAEYFY8DqiIsQAARO+J1Ql1k03kMBUAgUzOi4gxCAU8ZxSJQ5Jkw0Jk8FThwsEY0oEWADxbAUWYIgWYUSwgTRhgBdM1Q1jgUHRH1B8gIkChhGhxUy5eZO4kHNEw8PcLBGE6AhFAewgEkSBCa6YYQjIBzkUISJvNDzQpIFCAsDEOAEC6VJIkasADKjAk8aMXQ4kHBXSwnQcQLYBVZAEriAhChqkcRLAeSNxIM6FwoE0JCpQ4sSUwy5MBwGTiROAwAIkSGOJ8gEodjAjvBwiMoQIyAfEogkAFo0AMsDG+4KXeAQy2JApGQK54EGDOgAFfoeLMVtwACcEU0ArIBqBEoSG0LgA1LBSyARgpIn0WIssBLiRBtJ4jYqPxkSUHYGDUivA1RazFvC6YbzECkgbCEwDM6DQBUBPhqEsEhCBLTRhKcQnaCARiMaUJWEK4GxIsgHk4wFm5AxEVS0PvQQowQowEJYCEMMDADKE2iBQOoATKEFCANhimBKg8QI0AlYIHMgkoUbLVbQ+qIgQTo1BWSEEKgVOxKCQhVEjTIVbmSBG14WgTB8ADxopiiWFRIXIDEUSADydVFAdPEEANoCAABbDgAoBoxEUAJAcIpdH3Eh6YAukMOoxUeF7gyKRQgeJyANKwQxcCYDBo0xAgoawGYxUmJMOLBg/gtrI4VXSSAwxpLAAUAaXAJCzYhgAcgUUkaIMCeBECAEhGUgi+TE2IzGiYcuD9QboP+hRYQilEI8ZJDSNJ8YYUbABtSDkFJaEIxVEQ4knIipASWoBRUIkaRp/RPFCIIToDQaeBAKoYJTQhZ4QZIAoDqwDFYKMYBKR4zM5lxBEcMgPZx6NgUISCABL5QhgOA1AwlEADiYlUYqTYAuGABBQhlqhMDMDcoURZGJpJLgTArXAcgnbZQgxihXLaIigRiagggcHyRETsv0fhjaHF0iFJiUwlNJuQAmDiM1GLQorQz2QdDQybCihFcBIQghHzII7IAwATQLdmogRI4kIsAQUlzWA1ZC4VCCBG7IwXQB19wGEAAECyDEAYxCGEHRAxiAyqYUQoVAAGQgElQgx4gcpbEgmI4sQ6s54ZUISJBIiZOipFDEZMgGfVAg4HQVBYSAA4MjAEWiEi14j6gNQZGAISnZEnEBoFEEEKrACCwKNBwNWVQIAOUylWYKh7HJiRAzzPKE+loBEAJhAgZgRJNAKSqpUwBUHkmoAZnSSggENkQEUMBgMSAiC5BRgz3lDIQs8lKZpAKCAAAAIAAAAAACAAAEIAERAAAQAAAAAAgAgAAAgAAAAAAgAIAEABIBAAAAAKAAAIEAAAAgAAAAAAAAAQJEAAIEgRAAAAADAAAAggAQAAABCAAAAAGAICCAACgQCAQAAAIgAAEACgAMAAACAIAIQEABAAAAQAAAAQIAAAApAAoCAoAAAAGAAAACAAAACACQAAAAAgAAICAAAAAECJAAAAAEAAAAAAoAAEAIIQAIBIAAASICEAAAAACQgAAAgIAogAAAAAABAGEABEAIIAQAMkAACEAAAAABAAAAEAIAAACCIAgAAAAAAAAYAAgAAAAQEAAAAEABABAAAAgBSAgQAAABEBAAABAMAAAAAEAAQACBBFAAAAABBAQQQAACQAAAQAI4AAAAAAAEEAAARCAAAAAABAQQIiAAAACAAACUAAAAgQAAIAAAAAAAwAKBAAAhAQAAAAABAQgBAAFAAAAAACAAAgAAAAAAgAACAAAgAAICAAAAAAAAAAAIAAAAgAAAAEAQhAAgAAAAAAAIAiAAAEAACAAIQAgABDEAAAIAAgEAAAAQBAAgJAAAAhAAQEAgAAEEBAAAAgAAAAQAAAAAAAAAIQAAAAABAAgEAAACAAAAABAAAAAACiAFAAAAAAIgACAEAAFAAAAAAAQAAAAAgEAgAAAAIEAAAIIABCAAggAAAABQAAASEAAAAAAAEEAgABAAAAAAAAABVAAAABAAAIAgAAAAAAAAAAQDAACIEiAAAMEAAAAAAAAEAADAAAAAAAEBIAAABAAIAAAAAIAAABwCIhAAAEAAAAAAAgAIAAAAAAFAQqAgAAAQAAUACEAAAAAABAAAAAAAAACKAkACBAAQAAMAACAACIAQAAgAEQAAEASACAAAAAAAYQAAFQAIAAgAAAAAAQAAAIAEAAAgAAEAAOhFQECAAFAABSAAAAAAAASAABAAAAAAAoAAAQAAIgAABACABCAAAAIIAAACADAAAAAAAgAAEAkAACAACAABgARCCJAAAACQAGgAAEAAAARAAAAgAAAgAQiAAAJAAECAAAQAAARAgAAACAAAYAAgAAAQAAIAAAACABAAAEBAAAAAGEAIAAAAAwAAAAQEAECABABAAEAAAAAAoAAAIAAAAAgAoQAQAAASAAAAIAAAggDAQAAEAEAEQAgoAAgQAhABAEAAAQAggIAA4AECKCCCIAAAAAABEAFCAAEAIAAIAAAAAAAAFAAAiAhAAACCEAIEAgAACABAAAAAAAAAABADACCAFABABAFAAAAAAEQAAAIAAAAQAAUoAAAAAUAAAQACQAAAAABAAAAEAAKAQAAAAAAAIUAAACAAAAAAAAAAARAAAAAACgCAAAAEABEAAAgAAACAAAAJAACAQgAABAAACAAAAAAQAAEAAAAAAAAAAAQABAAEAAAIABAAAAAAAAhgAAgQAAAAwAAAgAAAIgIAgAAEAAACAAgEAgAAAAQCAAAABIAAIGAAAEAAoAAAAQAAAAgAAAAAKAAgAgAAEECgAQAgFIAAAEECIAAJAAAAAAgEIBCMEgAAEAAAAEACAAAAgAAABgCAAiSAQAAgAAIBBAAiAAEAAAAAKgEAAAAAIAAAAAAAAkgCAACAACAhgAQQAAQFAAAIAAAQAAAACDAAAAgAIgAAIABABgAAAAACAAIAAYQAMAYAkCACAAAAAQBIAAABAUACAAAABIiAAAAAgQICBAAAAAIgAQMAQAAAABEAAIxAwmUDCAAAECIgAFAAGByAGABAmFCCEBCCAABACAAgEAQHABEhEACEAEAYUKByAAABIkCRyEAAFCgDKDAEQYQEICAAFRIBAgQEEEIoCEAFAAAIgSAAAAYyAAQIEVBEAAgAAEABACiAAAGEABQJQwAQACAAEQSQTECEKACAAYBYAAigEIAEAUQAABmQAsCMYhSQCQQAGCQAACQQAEABQiEAFEAKFETEQEIIQAEglgKgEpAIQAklRABhACgJCAhCAARIwgCARAACAgAAAgIQCBKTwAgQIBFkASgIYgTAJBAAgBBg0BAUgwKAICQCCEgAYwCIkCAQABhAAFAIIALFSBECAAEEAAAIIAAKIAiC4iBKyYIAAkAAkApAADAgWQQAESqsAFIQACAAAkAAChNALBECApJRTAQAEhAAQAIIAyCEAKABwEEAAAgDAQBBQpAQBAmBJYRCAAACWQgAEABRgiEbCgEQIBAgIBAIJCgCKCIAAACMAAAAgogCEAhiECYCABBB0oEDRAoEAKQgAACUQiUDABQgAAcCMQUFAEUAAEACgIwIIAAAAAAECAAAQAAgAQAABhAAgWBAAQCmgKBAYJBigwAIAgQxGAEZSDAAQIEAEACQAAEACIAQQiQAEAAEIAEA8AABAAo6CIAAQ0kAAACEADBABACIAjNAAAAAAoFAFAQACRABACGEABSAICAAIFIIDAYAEQQBAEAAEkAMQAIAEQAAgACChFFEgJgKMAgBBgCAAaBBALAkABRJADAgkBAKAQJQAoGggIBSAgDhAAAgCAqEBJAAIc4ABIgpAAAQGAQAAYIAMAAAhIAgCAgKAAABEAAAHAwQgAACBOACkAAgAAAmgATCKABASBAIy7gAAkKmAoYEAqCWIhAEAAAQQhBIUUAVAJIIBAIKAkqEAAGCQSBACAAQMAAAABCAAKD6AAIDBEGASEQAhLgIAGQCASAA==',
    },
    // </erzeugt>
    // <erzeugt kuhfolge>
    // Feste Kuh-Liste (seit Meilenstein 3d) – bitte nicht von Hand ändern (neu schreiben: node tools/kuhfolge-schreiben.mjs).
    //
    // Bis M3b würfelte der Kuh-Planer (kuehe.js) alle Herden mit EINER Zufallsfolge. Änderte sich irgendwo die
    // Strecke (z. B. eine neue Wiese), rutschte die ganze Folge und alle Kühe standen woanders (so in M3b passiert).
    // Hier sind die Kühe vom Stand M3b eingefroren. Jede wird beim Laden noch mit den Regeln geprüft (Abstand zur
    // Strasse, zu Zäunen, nicht in den Kurven-Innenseiten ...); passt eine nicht mehr, fällt sie weg.
    // Neue Herden (z. B. am Wiesenweg, M3d) kommen mit eigenem seed dazu (config.js, Block "leben").
    // Gilt nur für kuehe.seed = 1300; bei einem anderen seed wird wie früher gewürfelt.
    // Je Kuh: x, z, Blickrichtung, Pose (0 steht, 1 grast, 2 liegt), Art, Grösse, Weide (0 Tal, 1 Alp), Herde
    kuhfolge: {
      seed: 1300,
      kuehe: [
        [890.586444, -1353.690902, 2.767547, 1, 5, 0.931184, 1, 0],
        [899.477517, -1355.908418, 2.567743, 1, 1, 0.977628, 1, 0],
        [894.778472, -1354.942934, 2.676375, 2, 0, 1.013812, 1, 0],
        [886.404938, -1356.651239, 2.179851, 1, 0, 0.920244, 1, 0],
        [397.062728, -1249.758687, 0.728762, 0, 1, 1.053428, 0, 1],
        [394.213703, -1240.526247, 3.83833, 0, 3, 1.011754, 0, 1],
        [394.498683, -1245.23013, 4.125014, 0, 4, 0.928557, 0, 1],
        [403.083065, -1237.794128, 4.213248, 1, 3, 0.931615, 0, 1],
        [446.057151, -1262.961846, 0.875607, 0, 4, 0.996693, 0, 2],
        [443.247368, -1260.214192, 0.408207, 1, 4, 0.926252, 0, 2],
        [-18.997337, -21.9586, 6.636067, 0, 0, 1.032133, 0, 3],
        [-13.337117, -17.766506, 1.437896, 0, 0, 0.960074, 0, 3],
        [-20.580195, -31.201193, 2.463815, 2, 1, 1.056763, 0, 3],
        [-19.345466, -27.1622, 0.655387, 0, 3, 0.946487, 0, 3],
        [-18.992419, -18.639801, 5.895622, 2, 3, 1.055771, 0, 3],
        [-12.672339, -14.477432, 5.744884, 1, 0, 0.952641, 0, 3],
        [-24.432254, -97.165512, 2.426, 2, 2, 1.004131, 0, 4],
        [-30.140913, -95.872019, 1.475525, 0, 3, 1.026677, 0, 4],
        [-20.192606, -98.995232, 1.521975, 2, 2, 0.93324, 0, 4],
        [-18.282796, -91.611924, 1.587997, 0, 2, 0.961125, 0, 4],
        [121.38273, -731.197138, 4.379705, 1, 5, 0.984867, 0, 5],
        [115.055076, -731.61945, 4.112692, 1, 2, 1.006773, 0, 5],
        [121.556095, -727.715417, 3.87675, 0, 3, 0.946185, 0, 5],
        [1154.837354, -1612.896166, 0.544538, 2, 0, 1.050834, 1, 6],
        [1156.570947, -1616.8821, 6.40371, 1, 2, 0.949793, 1, 6],
        [1150.445285, -1620.697867, 5.60727, 1, 0, 0.940834, 1, 6],
        [1154.230708, -1619.391962, 5.81018, 0, 3, 0.949995, 1, 6],
        [1137.256059, -1550.376951, 0.628955, 0, 5, 0.951252, 1, 7],
        [1138.122983, -1547.776067, 2.898756, 0, 3, 0.981305, 1, 7],
        [613.2697, -1361.342519, 3.093211, 0, 5, 0.99086, 1, 8],
        [609.902068, -1359.481796, 0.439328, 0, 0, 1.052721, 1, 8],
        [1002.026547, -1424.666227, 0.328533, 0, 0, 0.96813, 1, 9],
        [1227.839237, -1683.693772, 6.115449, 0, 2, 0.985318, 1, 10],
        [1173.328413, -1645.799276, 1.146986, 0, 2, 0.944161, 1, 11],
        [29.977772, -145.083279, 4.636031, 1, 0, 1.016426, 0, 12],
        [21.839887, -146.552417, 4.938738, 0, 1, 1.058562, 0, 12],
        [26.733011, -138.481218, 4.662357, 1, 2, 0.976627, 0, 12],
        [31.029094, -154.804189, 0.692498, 0, 4, 1.051541, 0, 12],
        [20.934171, -142.534523, 0.767257, 2, 2, 0.97826, 0, 12],
        [1679.398604, -1804.887863, 3.415529, 1, 2, 1.046931, 0, 13],
        [1685.493507, -1816.301074, 2.511236, 2, 4, 0.980219, 0, 13],
        [1690.27435, -1809.281156, 2.312571, 0, 4, 0.922069, 0, 13],
        [1674.985502, -1814.342855, 0.047396, 0, 0, 0.996775, 0, 13],
        [1681.405064, -1799.404356, 6.206919, 1, 2, 1.031554, 0, 13],
      ],
    },
    // </erzeugt>
  },
};
