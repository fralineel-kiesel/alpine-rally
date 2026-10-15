// Streckenverlauf der Etappe "Passstrasse" (Meilenstein 1).
// Die Strecke ist eine weiche Kurve (Spline) durch die Punkte unten.
// Zum Umbauen einfach Punkte verschieben, einfügen oder löschen.
//
// Koordinaten in Metern:  x = Osten (+) / Westen (-)
//                         z = Süden (+) / Norden (-)
//                         h = Höhe über dem Talboden beim Start
//
// Abschnitts-Zeilen ({ abschnitt: ... }) gelten für alle Punkte danach:
//   baeume: wie viele Bäume (1 = normal, 2 = doppelt so dicht, 0.2 = fast keine)
//   wald:   0..1, wie viel davon geschlossener Tannenwald ist
//   nah:    true = Bäume dürfen näher an die Strasse (Waldstück)
//   wand:   'links' / 'rechts' = Felswand auf dieser Seite, auf der anderen
//           Seite geht es ins Tal (Abhang)
//
// Die Punkte wurden aus "Gerade / Kurve mit Radius" berechnet (siehe Kommentare).

import * as THREE from 'three';
import { CONFIG } from './config.js';
import { ABKUERZUNGEN } from './abkuerzungen.js';

export const STRECKEN_PUNKTE = [
  // --- 1. Start im Tal: gerade, offene Wiese, Berge voraus ---
  { abschnitt: 'Start im Tal', baeume: 0.35, wald: 0 },
  { x: 0, z: 0, h: 0 },
  // gerade 250 m, Steigung 0 %
  { x: 0.0, z: -25.0, h: 0.0 }, { x: 0.0, z: -50.0, h: 0.0 }, { x: 0.0, z: -75.0, h: 0.0 },
  { x: 0.0, z: -100.0, h: 0.0 }, { x: 0.0, z: -125.0, h: 0.0 }, { x: 0.0, z: -150.0, h: 0.0 },
  { x: 0.0, z: -175.0, h: 0.0 }, { x: 0.0, z: -200.0, h: 0.0 }, { x: 0.0, z: -225.0, h: 0.0 },
  { x: 0.0, z: -250.0, h: 0.0 },

  // --- 2. Talabschnitt: weite, flüssige Kurven, leichte Steigung ---
  { abschnitt: 'Talabschnitt', baeume: 0.8, wald: 0 },
  // Kurve rechts 35°, Radius 300 m, Steigung 4 %
  { x: 1.1, z: -276.1, h: 1.0 }, { x: 4.6, z: -302.1, h: 2.1 }, { x: 10.2, z: -327.6, h: 3.1 },
  { x: 18.1, z: -352.6, h: 4.2 }, { x: 28.1, z: -376.8, h: 5.2 }, { x: 40.2, z: -400.0, h: 6.3 },
  { x: 54.3, z: -422.1, h: 7.3 },
  // gerade 60 m, Steigung 5 %
  { x: 71.5, z: -446.6, h: 8.8 }, { x: 88.7, z: -471.2, h: 10.3 },
  // Kurve links 70°, Radius 220 m, Steigung 5 %
  { x: 101.5, z: -492.0, h: 11.6 }, { x: 112.0, z: -514.0, h: 12.8 }, { x: 120.0, z: -537.1, h: 14.0 },
  { x: 125.4, z: -560.9, h: 15.2 }, { x: 128.1, z: -585.2, h: 16.4 }, { x: 128.1, z: -609.6, h: 17.7 },
  { x: 125.4, z: -633.9, h: 18.9 }, { x: 120.0, z: -657.7, h: 20.1 }, { x: 112.0, z: -680.8, h: 21.3 },
  { x: 101.5, z: -702.8, h: 22.5 }, { x: 88.7, z: -723.6, h: 23.8 },
  // Kurve rechts 30°, Radius 260 m, Steigung 5 % (Anfang)
  { x: 74.2, z: -746.7, h: 25.1 },

  // --- Seit M3a: Nebenweg "Talschleife" (Schotter). Die Etappe biegt von der Hauptstrasse ab
  //     und mündet später wieder ein (Stummel und Absperrungen: config.js, "nebenwege") ---
// <nebenweg Talschleife>
  // (automatisch von tools/nebenweg-bogen.mjs – Bogen dort ändern, nicht hier)
  { abschnitt: 'Waldstück', baeume: 2.2, wald: 1, nah: true },
  // Kurve rechts 80°, Radius 28 m, Steigung 5 % – Abzweig: rechts auf den Nebenweg (Schotter)
  { x: 65.8730, z: -761.7046, h: 25.9654 }, { x: 65.3135, z: -776.3421, h: 26.7104 }, { x: 72.2215, z: -789.2591, h: 27.4554 },
  // gerade 27 m, Steigung 0 %
  { x: 85.8409, z: -801.6932, h: 28.3825 },
  // Kurve links 67°, Radius 35 m, Steigung 11 % – Nebenweg: Kurve links
  { x: 98.2731, z: -813.8705, h: 30.0910 }, { x: 104.4682, z: -827.9512, h: 32.1990 }, { x: 104.0274, z: -843.3282, h: 33.3798 },
  // gerade 25 m, Steigung 0 %
  { x: 98.1053, z: -860.7505, h: 33.0813 },
  // Kurve rechts 62°, Radius 38 m, Steigung 8 % – Nebenweg: Kurve rechts
  { x: 93.2583, z: -877.3395, h: 31.7673 }, { x: 94.6104, z: -892.9097, h: 32.4408 }, { x: 102.1151, z: -906.6187, h: 34.1623 },
  // Kurve links 66°, Radius 28 m, Steigung 5 % – Einmündung: links auf die Hauptstrasse
  { x: 114.6316, z: -920.1846, h: 35.1247 }, { x: 120.9916, z: -933.3800, h: 35.8697 }, { x: 119.8185, z: -947.9811, h: 36.6147 },
  // Kurve rechts 28°, Radius 45 m, Steigung 0 % – Hauptstrasse: Kurve rechts
  { x: 114.1036, z: -963.8901, h: 37.4663 },
  // </nebenweg>
  // Ende der Kurve links 45°, Radius 70 m (wie vor M3a)
  { x: 113.7, z: -980.4, h: 38.3 }, { x: 114.6, z: -991.4, h: 38.8 },
  // gerade 30 m, Steigung 5 %
  { x: 114.6, z: -1021.4, h: 40.3 },
  // Kurve rechts 80°, Radius 90 m, Steigung 5 %
  { x: 115.4, z: -1033.9, h: 40.9 }, { x: 118.0, z: -1046.2, h: 41.6 }, { x: 122.3, z: -1058.0, h: 42.2 },
  { x: 128.2, z: -1069.1, h: 42.8 }, { x: 135.6, z: -1079.2, h: 43.5 }, { x: 144.3, z: -1088.3, h: 44.1 },
  { x: 154.2, z: -1096.0, h: 44.7 }, { x: 165.1, z: -1102.3, h: 45.3 }, { x: 176.7, z: -1107.0, h: 46.0 },
  { x: 188.9, z: -1110.0, h: 46.6 },
  // gerade 72 m, Steigung 6 %
  { x: 212.6, z: -1114.2, h: 48.0 }, { x: 236.2, z: -1118.4, h: 49.5 }, { x: 259.8, z: -1122.5, h: 50.9 },

  // --- 4. Kehrengruppe: vier Spitzkehren am Hang: links, rechts, links, rechts ---
  { abschnitt: 'Kehrengruppe', baeume: 1.6, wald: 0.3 },
  // gerade 70 m, Steigung 8 %
  { x: 282.8, z: -1126.6, h: 52.8 }, { x: 305.8, z: -1130.6, h: 54.7 }, { x: 328.8, z: -1134.7, h: 56.5 },
  // Spitzkehre links 180°, Radius 13 m, Steigung 6 %
  { x: 333.5, z: -1136.5, h: 56.8 }, { x: 337.2, z: -1140.0, h: 57.1 }, { x: 339.2, z: -1144.7, h: 57.4 },
  { x: 339.3, z: -1149.7, h: 57.7 }, { x: 337.5, z: -1154.5, h: 58.1 }, { x: 334.0, z: -1158.1, h: 58.4 },
  { x: 329.3, z: -1160.2, h: 58.7 }, { x: 324.3, z: -1160.3, h: 59.0 },
  // gerade 105 m, Steigung 11 %
  { x: 298.4, z: -1155.7, h: 61.9 }, { x: 272.5, z: -1151.2, h: 64.7 }, { x: 246.7, z: -1146.6, h: 67.6 },
  { x: 220.8, z: -1142.1, h: 70.5 },
  // Spitzkehre rechts 180°, Radius 13 m, Steigung 6 %
  { x: 215.8, z: -1142.2, h: 70.8 }, { x: 211.1, z: -1144.2, h: 71.1 }, { x: 207.6, z: -1147.9, h: 71.4 },
  { x: 205.8, z: -1152.6, h: 71.7 }, { x: 205.9, z: -1157.7, h: 72.1 }, { x: 207.9, z: -1162.3, h: 72.4 },
  { x: 211.6, z: -1165.8, h: 72.7 }, { x: 216.3, z: -1167.7, h: 73.0 },
  // gerade 105 m, Steigung 11 %
  { x: 242.2, z: -1172.2, h: 75.9 }, { x: 268.0, z: -1176.8, h: 78.7 }, { x: 293.9, z: -1181.3, h: 81.6 },
  { x: 319.7, z: -1185.9, h: 84.5 },
  // Spitzkehre links 180°, Radius 13 m, Steigung 6 %
  { x: 324.5, z: -1187.7, h: 84.8 }, { x: 328.1, z: -1191.2, h: 85.1 }, { x: 330.2, z: -1195.9, h: 85.4 },
  { x: 330.3, z: -1200.9, h: 85.7 }, { x: 328.4, z: -1205.7, h: 86.1 }, { x: 324.9, z: -1209.3, h: 86.4 },
  { x: 320.3, z: -1211.4, h: 86.7 }, { x: 315.2, z: -1211.5, h: 87.0 },
  // gerade 105 m, Steigung 11 %
  { x: 289.4, z: -1206.9, h: 89.9 }, { x: 263.5, z: -1202.4, h: 92.7 }, { x: 237.7, z: -1197.8, h: 95.6 },
  { x: 211.8, z: -1193.3, h: 98.5 },
  // Spitzkehre rechts 180°, Radius 13 m, Steigung 6 %
  { x: 206.7, z: -1193.4, h: 98.8 }, { x: 202.1, z: -1195.4, h: 99.1 }, { x: 198.6, z: -1199.1, h: 99.4 },
  { x: 196.8, z: -1203.8, h: 99.7 }, { x: 196.9, z: -1208.9, h: 100.1 }, { x: 198.9, z: -1213.5, h: 100.4 },
  { x: 202.6, z: -1217.0, h: 100.7 }, { x: 207.3, z: -1218.9, h: 101.0 },
  // gerade 45 m, Steigung 8 %
  { x: 229.5, z: -1222.8, h: 102.8 }, { x: 251.6, z: -1226.7, h: 104.6 },

  // --- 5. Felswand 1: Felswand links, Abhang ins Tal rechts ---
  { abschnitt: 'Felswand 1', baeume: 1.0, wald: 0.2, wand: 'links' },
  // Kurve links 30°, Radius 150 m, Steigung 8 % (Anfang)
  { x: 276.9, z: -1233.4, h: 106.7 }, { x: 300.6, z: -1244.5, h: 108.8 }, { x: 322.0, z: -1259.5, h: 110.9 },

  // --- Seit M3b: Nebenweg "Almweg" (Schotter). Die Felswand hört davor auf und geht nach der
  //     Einmündung weiter (Abschnitt-Zeile "Felswand 1" im Bogen) ---
// <nebenweg Almweg>
  // (automatisch von tools/nebenweg-bogen.mjs – Bogen dort ändern, nicht hier)
  { abschnitt: 'Almweg', baeume: 0.45, wald: 0.05 },
  // Kurve rechts 45°, Radius 25 m, Steigung 0 % – Abzweig: rechts auf den Almweg (Schotter)
  { x: 342.7271, z: -1273.1692, h: 112.8640 },
  // gerade 15 m, Steigung 0 %
  { x: 364.5202, z: -1273.0726, h: 114.6140 },
  // Kurve links 30°, Radius 110 m, Steigung 8 % – Almweg: grosse Kurve links
  { x: 389.4985, z: -1270.2517, h: 116.6019 }, { x: 414.0419, z: -1272.8767, h: 118.5551 },
  // gerade 219 m, Steigung 8 % – Almweg: lange Gerade
  { x: 438.3322, z: -1280.6781, h: 120.5713 }, { x: 463.3037, z: -1289.6503, h: 122.6664 }, { x: 488.2752, z: -1298.6224, h: 124.9183 },
  { x: 513.2467, z: -1307.5945, h: 127.7702 }, { x: 538.2182, z: -1316.5667, h: 130.6899 }, { x: 563.1898, z: -1325.5388, h: 133.0317 },
  { x: 588.1613, z: -1334.5110, h: 134.6024 }, { x: 613.1328, z: -1343.4831, h: 135.8128 },
  // Kurve rechts 45°, Radius 80 m, Steigung 8 % – Almweg: grosse Kurve rechts
  { x: 637.6979, z: -1352.1635, h: 137.3217 }, { x: 661.5082, z: -1355.4123, h: 139.1996 }, { x: 685.2091, z: -1351.4434, h: 141.1043 },
  // gerade 20 m, Steigung 0 %
  { x: 708.5623, z: -1341.1126, h: 143.1221 },
  // Kurve links 40°, Radius 30 m, Steigung 0 % – Einmündung: links auf die Hauptstrasse
  { x: 729.5523, z: -1336.7000, h: 144.8468 },
  { abschnitt: 'Felswand 1', baeume: 1.0, wald: 0.2, wand: 'links' },
  // </nebenweg>
  // gerade 120 m, Steigung 6 % (Rest, wie vor M3b)
  { x: 753.7, z: -1342.0, h: 146.8 }, { x: 777.4, z: -1346.2, h: 148.2 },
  { x: 801.0, z: -1350.3, h: 149.7 }, { x: 824.6, z: -1354.5, h: 151.1 },

  // --- 6. Passhöhe: offenes Hochplateau, weite schnelle Kurven ---
  { abschnitt: 'Passhöhe', baeume: 0.15, wald: 0 },
  // Kurve links 50°, Radius 260 m, Steigung 3 %
  { x: 849.2, z: -1360.1, h: 151.9 }, { x: 873.1, z: -1368.0, h: 152.6 }, { x: 896.2, z: -1378.2, h: 153.4 },
  { x: 918.1, z: -1390.6, h: 154.1 }, { x: 938.8, z: -1405.1, h: 154.9 }, { x: 957.9, z: -1421.4, h: 155.6 },
  { x: 975.4, z: -1439.6, h: 156.4 }, { x: 991.0, z: -1459.4, h: 157.1 }, { x: 1004.6, z: -1480.6, h: 157.9 },
  // Kurve rechts 20°, Radius 350 m, Steigung 0 % (Anfang)
  { x: 1017.6, z: -1501.3, h: 157.9 }, { x: 1032.0, z: -1521.0, h: 157.9 }, { x: 1047.7, z: -1539.8, h: 157.9 },

  // --- Seit M3b: Nebenweg "Wiesenweg" (Feldweg über die Wiese, Checkpoint 3). Die Abfahrt mit der
  //     Felswand beginnt erst nach der Einmündung (Abschnitt-Zeile "Abfahrt" im Bogen) ---
// <nebenweg Wiesenweg>
  // (automatisch von tools/nebenweg-bogen.mjs – Bogen dort ändern, nicht hier)
  { abschnitt: 'Wiesenweg', baeume: 0.25, wald: 0 },
  // gerade 26 m, Steigung 0 %
  { x: 1066.8774, z: -1550.5853, h: 156.6917 },
  // Kurve links 26°, Radius 80 m, Steigung -5 % – Wiesenweg: Kurve links
  { x: 1093.1690, z: -1556.3334, h: 155.2523 }, { x: 1115.7781, z: -1566.4827, h: 153.9216 },
  // gerade 163 m, Steigung -5 %
  { x: 1137.0966, z: -1582.6174, h: 152.4915 }, { x: 1158.7627, z: -1599.3434, h: 151.0278 }, { x: 1180.4289, z: -1616.0693, h: 149.5640 },
  { x: 1202.0950, z: -1632.7953, h: 148.1003 }, { x: 1223.7612, z: -1649.5213, h: 146.6365 }, { x: 1245.4273, z: -1666.2472, h: 145.1727 },
  // Kurve rechts 36°, Radius 70 m, Steigung -5 % – Wiesenweg: Kurve rechts
  { x: 1266.7586, z: -1679.3950, h: 143.8272 }, { x: 1290.6755, z: -1684.4201, h: 142.5135 },
  // Kurve links 36°, Radius 25 m, Steigung 0 % – Einmündung: links auf die Hauptstrasse
  { x: 1313.1636, z: -1688.3784, h: 141.2743 },
  { abschnitt: 'Abfahrt', baeume: 1.0, wald: 0.2, wand: 'rechts' },
  // </nebenweg>
  // Kurve links 25°, Radius 220 m (Ende, wie vor M3b)
  { x: 1334.0, z: -1703.4, h: 139.9 },
  // gerade 40 m, Steigung -6 %
  { x: 1350.4, z: -1714.9, h: 138.7 }, { x: 1366.8, z: -1726.3, h: 137.5 },
  // Kurve rechts 45°, Radius 30 m, Steigung -3 %
  { x: 1377.5, z: -1731.0, h: 137.1 }, { x: 1389.2, z: -1731.3, h: 136.8 },
  // Kurve links 45°, Radius 30 m, Steigung -3 %
  { x: 1400.9, z: -1731.6, h: 136.4 }, { x: 1411.6, z: -1736.3, h: 136.0 },
  // gerade 60 m, Steigung -7 %
  { x: 1436.2, z: -1753.5, h: 133.9 }, { x: 1460.8, z: -1770.7, h: 131.8 },
  // Kurve rechts 25°, Radius 250 m, Steigung -7 %
  { x: 1483.9, z: -1785.1, h: 129.9 }, { x: 1508.5, z: -1796.9, h: 128.0 }, { x: 1534.2, z: -1805.9, h: 126.1 },
  { x: 1560.7, z: -1812.1, h: 124.2 },
  // gerade 30 m, Steigung -4 %
  { x: 1590.3, z: -1817.3, h: 123.0 },

  // --- 8. Zielgerade: flach, Ziellinie ---
  { abschnitt: 'Zielgerade', baeume: 0.5, wald: 0 },
  // gerade 250 m, Steigung 0 %
  { x: 1614.9, z: -1821.6, h: 123.0 }, { x: 1639.5, z: -1826.0, h: 123.0 }, { x: 1664.1, z: -1830.3, h: 123.0 },
  { x: 1688.8, z: -1834.7, h: 123.0 }, { x: 1713.4, z: -1839.0, h: 123.0 }, { x: 1738.0, z: -1843.4, h: 123.0 },
  { x: 1762.6, z: -1847.7, h: 123.0 }, { x: 1787.2, z: -1852.0, h: 123.0 }, { x: 1811.9, z: -1856.4, h: 123.0 },
  { x: 1836.5, z: -1860.7, h: 123.0 },
];

// Abstand der berechneten Streckenpunkte (Meter)
const SCHRITT = 1;
// Rastergrösse für die schnelle Suche nach dem nächsten Streckenpunkt (Meter)
const ZELLE = 16;

// Baut aus den Punkten die fertige Strecke mit allen Daten,
// die Gelände, Physik und Zeitmessung brauchen.
export function baueStrecke() {
  // Punkte und Abschnitts-Zeilen trennen
  const roh = [], abschnitte = [];
  for (const e of STRECKEN_PUNKTE) {
    if (e.abschnitt) {
      abschnitte.push({
        name: e.abschnitt, baeume: e.baeume ?? 1, wald: e.wald ?? 0, nah: !!e.nah, wand: e.wand || null,
      });
      continue;
    }
    roh.push({ ...e, abschnitt: Math.max(0, abschnitte.length - 1) });
  }
  const punkte = roh.map((p) => new THREE.Vector3(p.x, p.h, p.z));
  const kurve = new THREE.CatmullRomCurve3(punkte, false, 'centripetal');
  kurve.arcLengthDivisions = 20000;
  const laenge = kurve.getLength();
  const anzahl = Math.ceil(laenge / SCHRITT) + 1;

  const n = punkte.length - 1;
  const px = new Float32Array(anzahl), py = new Float32Array(anzahl), pz = new Float32Array(anzahl);
  const tx = new Float32Array(anzahl), tz = new Float32Array(anzahl);
  const sArr = new Float32Array(anzahl);
  const wandSeite = new Int8Array(anzahl);   // -1 = links, 1 = rechts, 0 = keine
  const wandStaerke = new Float32Array(anzahl);
  const abschnittNr = new Uint8Array(anzahl);

  const v = new THREE.Vector3();
  for (let i = 0; i < anzahl; i++) {
    const u = Math.min(1, (i * SCHRITT) / laenge);
    kurve.getPointAt(u, v);
    px[i] = v.x; py[i] = v.y; pz[i] = v.z;
    sArr[i] = u * laenge;
    // Abschnitt bestimmen (über den Spline-Parameter t)
    const t = kurve.getUtoTmapping(u);
    const seg = Math.min(n - 1, Math.floor(t * n));
    const a = roh[seg], b = roh[seg + 1];
    abschnittNr[i] = b.abschnitt;
    // Felswand nur zwischen zwei Punkten, die beide im selben Wand-Abschnitt liegen
    const wa = abschnitte[a.abschnitt] && abschnitte[a.abschnitt].wand;
    const wb = abschnitte[b.abschnitt] && abschnitte[b.abschnitt].wand;
    if (wa && wa === wb) wandSeite[i] = wa === 'links' ? -1 : 1;
  }
  // Richtung (Tangente) in der Ebene
  for (let i = 0; i < anzahl; i++) {
    const i0 = Math.max(0, i - 1), i1 = Math.min(anzahl - 1, i + 1);
    const dx = px[i1] - px[i0], dz = pz[i1] - pz[i0];
    const l = Math.hypot(dx, dz) || 1;
    tx[i] = dx / l; tz[i] = dz / l;
  }
  // Felswand weich ein- und ausblenden (25 m)
  const blende = 25;
  for (let i = 0; i < anzahl; i++) {
    if (!wandSeite[i]) continue;
    let vor = 0, nach = 0;
    while (i - vor > 0 && wandSeite[i - vor - 1] === wandSeite[i] && vor < blende) vor++;
    while (i + nach < anzahl - 1 && wandSeite[i + nach + 1] === wandSeite[i] && nach < blende) nach++;
    const r = Math.min(vor, nach) / blende;
    wandStaerke[i] = r * r * (3 - 2 * r);
  }
  // Wo beginnt und endet jeder Abschnitt (Meter)?
  abschnitte.forEach((a) => { a.von = Infinity; a.bis = 0; });
  for (let i = 0; i < anzahl; i++) {
    const a = abschnitte[abschnittNr[i]];
    a.von = Math.min(a.von, sArr[i]); a.bis = Math.max(a.bis, sArr[i]);
  }
  // Baumdichte und Waldanteil entlang der Strecke, an den Abschnittsgrenzen
  // weich übergeblendet (über ca. 80 m)
  const baumFaktor = new Float32Array(anzahl), waldAnteil = new Float32Array(anzahl), nahWald = new Float32Array(anzahl);
  {
    const B = 40;
    const roh1 = Float32Array.from(abschnittNr, (k) => abschnitte[k].baeume);
    const roh2 = Float32Array.from(abschnittNr, (k) => abschnitte[k].wald);
    const roh3 = Float32Array.from(abschnittNr, (k) => (abschnitte[k].nah ? 1 : 0));
    for (let i = 0; i < anzahl; i++) {
      let s1 = 0, s2 = 0, s3 = 0, z = 0;
      for (let j = Math.max(0, i - B); j <= Math.min(anzahl - 1, i + B); j += 4) {
        s1 += roh1[j]; s2 += roh2[j]; s3 += roh3[j]; z++;
      }
      baumFaktor[i] = s1 / z; waldAnteil[i] = s2 / z; nahWald[i] = s3 / z;
    }
  }

  // Raster für die schnelle Suche: welche Streckenpunkte liegen in welcher Zelle?
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
  for (let i = 0; i < anzahl; i++) {
    minX = Math.min(minX, px[i]); maxX = Math.max(maxX, px[i]);
    minZ = Math.min(minZ, pz[i]); maxZ = Math.max(maxZ, pz[i]);
  }
  const RX = Math.floor((maxX - minX) / ZELLE) + 1, RZ = Math.floor((maxZ - minZ) / ZELLE) + 1;
  const zelle = (i) => Math.floor((pz[i] - minZ) / ZELLE) * RX + Math.floor((px[i] - minX) / ZELLE);
  const zStart = new Int32Array(RX * RZ + 1);
  for (let i = 0; i < anzahl; i++) zStart[zelle(i) + 1]++;
  for (let c = 0; c < RX * RZ; c++) zStart[c + 1] += zStart[c];
  const zFuell = zStart.slice(0, RX * RZ), zListe = new Int32Array(anzahl);
  for (let i = 0; i < anzahl; i++) zListe[zFuell[zelle(i)]++] = i;

  // Nächster Streckenpunkt (Index) zu (x, z). Ergebnis: [Index, Abstand²]
  const treffer = [0, 0];
  function naechster(x, z) {
    let best = -1, bestD = Infinity;
    // zuerst die Zellen rundherum (2 Zellen = 32 m weit sicher)
    const cx = Math.floor((x - minX) / ZELLE), cz = Math.floor((z - minZ) / ZELLE);
    for (let jz = cz - 2; jz <= cz + 2; jz++) {
      if (jz < 0 || jz >= RZ) continue;
      for (let jx = cx - 2; jx <= cx + 2; jx++) {
        if (jx < 0 || jx >= RX) continue;
        const c = jz * RX + jx;
        for (let k = zStart[c]; k < zStart[c + 1]; k++) {
          const i = zListe[k];
          const dx = px[i] - x, dz = pz[i] - z;
          const d = dx * dx + dz * dz;
          if (d < bestD) { bestD = d; best = i; }
        }
      }
    }
    if (best < 0 || bestD > (2 * ZELLE) ** 2) {
      // weit weg: ganze Strecke grob absuchen (jeder 4. Punkt), dann fein
      best = 0; bestD = Infinity;
      for (let i = 0; i < anzahl; i += 4) {
        const dx = px[i] - x, dz = pz[i] - z;
        const d = dx * dx + dz * dz;
        if (d < bestD) { bestD = d; best = i; }
      }
      const von = Math.max(0, best - 4), bis = Math.min(anzahl - 1, best + 4);
      for (let i = von; i <= bis; i++) {
        const dx = px[i] - x, dz = pz[i] - z;
        const d = dx * dx + dz * dz;
        if (d < bestD) { bestD = d; best = i; }
      }
    }
    treffer[0] = best; treffer[1] = bestD;
    return treffer;
  }

  // Abfrage-Ergebnis für Punkt i ausfüllen
  function fuelle(i, bestD, x, z, ziel) {
    const ux = tx[i], uz = tz[i];
    const rx = -uz, rz = ux; // rechts von der Fahrtrichtung
    const dx = x - px[i], dz = z - pz[i];
    const laengs = dx * ux + dz * uz;
    const seite = dx * rx + dz * rz;
    let j = i, f = 0;
    if (laengs >= 0 && i < anzahl - 1) { j = i + 1; f = Math.min(1, laengs / SCHRITT); }
    else if (laengs < 0 && i > 0) { j = i - 1; f = Math.min(1, -laengs / SCHRITT); }
    ziel.i = i;
    ziel.s = sArr[i] + laengs;
    ziel.seite = seite;
    ziel.h = py[i] + (py[j] - py[i]) * f;
    ziel.tx = ux; ziel.tz = uz;
    ziel.abstand = Math.sqrt(bestD);
    ziel.wandSeite = wandSeite[i];
    ziel.wandStaerke = wandStaerke[i];
    return ziel;
  }

  const strecke = {
    kurve, laenge, anzahl, px, py, pz, tx, tz, s: sArr, wandSeite, wandStaerke,
    abschnitte, abschnittNr, baumFaktor, waldAnteil, nahWald,
    box: { minX, maxX, minZ, maxZ },
    startS: CONFIG.strasse.startBeiMeter,
    zielS: laenge - CONFIG.strasse.zielVorEnde,
    // Gesperrte Kurven { sVon, sBis, seite } für die Pace-Note "nicht schneiden"
    // (Meilenstein 4). Kommt automatisch aus tools/abkuerzungen.mjs.
    nichtSchneiden: ABKUERZUNGEN.nichtSchneiden,
    // Freie Kurven { sVon, sBis, seite, gewinn } für die Pace-Note "schneiden" (Meilenstein 4).
    schneiden: ABKUERZUNGEN.schneiden || [],

    // Nächster Streckenpunkt zu (x, z).
    // Ergebnis: s (Meter entlang der Strecke), seite (Abstand zur Mitte, + = rechts),
    // h (Strassenhöhe), i (Index), tx/tz (Richtung), abstand (Luftlinie zur Mitte)
    abfrage(x, z, ziel = {}) {
      const [i, d] = naechster(x, z);
      return fuelle(i, d, x, z, ziel);
    },

    // Wie abfrage, aber nur Streckenpunkte, die mehr als minDs Meter (entlang der
    // Strecke) von sNicht entfernt sind – also ein ANDERER Ast der Strecke
    // (z. B. die nächste Kehre darüber). maxAbstand: nur so weit suchen.
    andererAst(x, z, sNicht, minDs, maxAbstand, ziel = {}) {
      let best = -1, bestD = maxAbstand * maxAbstand;
      const r = Math.ceil(maxAbstand / ZELLE);
      const cx = Math.floor((x - minX) / ZELLE), cz = Math.floor((z - minZ) / ZELLE);
      for (let jz = cz - r; jz <= cz + r; jz++) {
        if (jz < 0 || jz >= RZ) continue;
        for (let jx = cx - r; jx <= cx + r; jx++) {
          if (jx < 0 || jx >= RX) continue;
          const c = jz * RX + jx;
          for (let k = zStart[c]; k < zStart[c + 1]; k++) {
            const i = zListe[k];
            if (Math.abs(sArr[i] - sNicht) < minDs) continue;
            const dx = px[i] - x, dz = pz[i] - z;
            const d = dx * dx + dz * dz;
            if (d < bestD) { bestD = d; best = i; }
          }
        }
      }
      if (best < 0) return null;
      return fuelle(best, bestD, x, z, ziel);
    },

    // Punkt bei s Metern (für Reset und Startposition)
    punktBei(s) {
      const i = Math.max(0, Math.min(anzahl - 1, Math.round(s / SCHRITT)));
      return { x: px[i], h: py[i], z: pz[i], tx: tx[i], tz: tz[i], i };
    },
  };
  return strecke;
}
