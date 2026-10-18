// Minimap oben rechts (Meilenstein 6, seit M6.1 ein mitfahrender Ausschnitt): Norden oben, die Karte dreht nicht.
// Das Auto steht immer in der Mitte der Tafel (als Pfeil in Blickrichtung), die Karte verschiebt sich darunter.
// Gefahrene Strecke gelb/orange (bis zum weitesten Punkt dieses Laufs, schrumpft nie), Start grün, Ziel als Karo,
// Checkpoints als kurzer Querstrich (weiss, durchfahren grün, verpasst rot).
// Die ganze Strecke wird beim Laden einmal im gewählten Zoom auf eine grosse Leinwand gemalt (Strasse 2 Pixel breit
// mit dunklem Rand). Pro Bild wird nur ein Ausschnitt davon in die Tafel kopiert, immer um ganze Pixel verschoben.
// Die orange Linie wird nur weitergemalt, wenn das Auto hud.minimap.neuFaerbenAb Meter weiter ist (nur das neue Stück).

import { CONFIG } from './config.js';
import { zeichneTafel } from './pixel.js';

// Pfeil 5x5 Pixel: nach oben (Norden) und schräg nach rechts oben; die anderen 6 Richtungen sind davon gedreht
const PFEIL_N = ['..#..', '.###.', '#####', '..#..', '..#..'];
const PFEIL_NO = ['.####', '..###', '.#.##', '#...#', '.....'];
// Raster um 90 Grad im Uhrzeigersinn drehen
const drehe = (r) => r.map((_, y) => r.map((_, x) => r[r.length - 1 - x][y]).join(''));

export function baueMinimap(strecke, checkpoints) {
  const c = CONFIG.hud.minimap;
  const { px, pz, anzahl } = strecke;
  const sAt = strecke.s;
  const G = c.groesse;
  const halb = Math.floor((G - 3) / 2);    // Pixel von der Tafelmitte bis zum Innenrand
  const innen = 2 * halb + 1;              // sichtbarer Kartenausschnitt (ohne den 1-Pixel-Rand)
  const mass = (halb + 0.5) / c.sichtMeter; // Pixel pro Meter
  const x0 = CONFIG.bild.breite - c.rechts - G, y0 = c.oben;
  const mitteX = x0 + 1 + halb, mitteY = y0 + 1 + halb; // Bildpixel, in dem das Auto steht

  // Grosse Karte: Streckenbox im Massstab, rundherum eine Tafel Platz (das Auto kann bis 45 m neben der Strasse sein)
  const box = strecke.box;
  const rand = G + Math.ceil(CONFIG.grenze.maxAbstand * mass);
  const kartenB = Math.ceil((box.maxX - box.minX) * mass) + 2 * rand, kartenH = Math.ceil((box.maxZ - box.minZ) * mass) + 2 * rand;
  // Kartenpunkt (Kommazahl, Pixel der grossen Karte): x nach Osten = rechts, z nach Süden = unten (Norden oben)
  const ku = (x) => rand + (x - box.minX) * mass;
  const kv = (z) => rand + (z - box.minZ) * mass;

  // Punkte der Karte alle punktAbstand Meter (und der letzte). Gespeichert ist die Ecke des 2x2-Pinsels:
  // die Strassenmitte liegt auf der Pixelkante zwischen den beiden Pixeln
  const schritt = Math.max(1, Math.round(c.punktAbstand / (sAt[1] - sAt[0] || 1)));
  const n = Math.ceil((anzahl - 1) / schritt) + 1;
  const mu = new Int16Array(n), mv = new Int16Array(n), ms = new Float32Array(n);
  for (let k = 0; k < n; k++) {
    const i = Math.min(anzahl - 1, k * schritt);
    mu[k] = Math.round(ku(px[i])) - 1; mv[k] = Math.round(kv(pz[i])) - 1; ms[k] = sAt[i];
  }
  const index = (s) => Math.max(0, Math.min(anzahl - 1, Math.round(s / (sAt[1] - sAt[0] || 1))));

  // Linie Pixel für Pixel (Bresenham) mit quadratischem Pinsel (b Pixel), ohne Kantenglättung
  function linie(ctx, xa, ya, xb, yb, b, d = 0) {
    const dx = Math.abs(xb - xa), dy = -Math.abs(yb - ya), sx = xa < xb ? 1 : -1, sy = ya < yb ? 1 : -1;
    let err = dx + dy;
    for (let k = 0; k < 2000; k++) {
      ctx.fillRect(xa - d, ya - d, b, b);
      if (xa === xb && ya === yb) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; xa += sx; }
      if (e2 <= dx) { err += dx; ya += sy; }
    }
  }

  const leinwand = (b, h) => { const l = document.createElement('canvas'); l.width = b; l.height = h; return l; };
  // Grundbild: ganze Strecke (noch nicht gefahren), zuerst überall der dunkle Rand, dann die Strasse darüber
  const grund = leinwand(kartenB, kartenH), karte = leinwand(kartenB, kartenH);
  const gx = grund.getContext('2d'), kc = karte.getContext('2d');
  gx.fillStyle = c.farbeStrassenRand;
  for (let k = 1; k < n; k++) linie(gx, mu[k - 1], mv[k - 1], mu[k], mv[k], 4, 1);
  gx.fillStyle = c.farbeOffen;
  for (let k = 1; k < n; k++) linie(gx, mu[k - 1], mv[k - 1], mu[k], mv[k], 2);

  // Tafel (Füllung und Rand) und der Rand allein (kommt über den Ausschnitt, deckt die Ecken ab)
  const tafelBild = leinwand(G, G), rahmenBild = leinwand(G, G);
  zeichneTafel(tafelBild.getContext('2d'), 0, 0, G, G, c.ecke, c.farbeTafel, c.farbeRand);
  zeichneTafel(rahmenBild.getContext('2d'), 0, 0, G, G, c.ecke, 'rgba(0, 0, 0, 0)', c.farbeRand);

  // Pfeile für 8 Richtungen (0 = Norden, im Uhrzeigersinn), je 7x7 Pixel mit dunklem Rand, nebeneinander
  const pfeile = leinwand(8 * 8, 7);
  {
    const pc = pfeile.getContext('2d');
    for (let r = 0; r < 8; r++) {
      let raster = r % 2 ? PFEIL_NO : PFEIL_N;
      for (let d = 0; d < r >> 1; d++) raster = drehe(raster);
      const voll = (x, y) => x >= 0 && y >= 0 && x < 5 && y < 5 && raster[y][x] === '#';
      for (let y = -1; y <= 5; y++) for (let x = -1; x <= 5; x++) {
        let nah = false;
        for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) if (voll(x + a, y + b)) nah = true;
        if (!nah) continue;
        pc.fillStyle = voll(x, y) ? c.farbeAuto : c.farbeAutoRand;
        pc.fillRect(r * 8 + x + 1, y + 1, 1, 1);
      }
    }
  }

  // Checkpoint-Striche: Lage und Richtung quer zur Strecke (auf 8 Richtungen gerundet); u/v = Ecke des 2x2-Pinsels
  const cps = checkpoints.map((cp) => {
    const p = strecke.punktBei(cp.s);
    const nx = -p.tz, nz = p.tx; // quer zur Fahrtrichtung
    const r = (v) => (Math.abs(v) > 0.38 ? Math.sign(v) : 0);
    return { u: Math.round(ku(p.x)) - 1, v: Math.round(kv(p.z)) - 1, du: r(nx), dv: r(nz), s: cp.s };
  });
  const start = strecke.punktBei(strecke.startS), ziel = strecke.punktBei(strecke.zielS);
  const startU = Math.round(ku(start.x)), startV = Math.round(kv(start.z)); // Strassenmitte (Pixelkante)
  const zielU = Math.round(ku(ziel.x)), zielV = Math.round(kv(ziel.z));

  // Zustand je Checkpoint: 0 = offen (weiss), 1 = durchfahren (grün), 2 = verpasst (rot); als eine Zahl (Basis 3)
  // Gleiche Logik wie die Punkte der Zeit-Tafel (Zwischenzeit da = durchfahren). Verpasst: die Rennlogik hat ihn
  // übersprungen (Zwischenzeit null), oder gerade steht "CHECKPOINT VERPASST" für ihn (Auto wird zurückgesetzt).
  function cpCode(zwischenzeiten, naechster, verpasstCp) {
    let code = 0, f = 1;
    for (let i = 0; i < cps.length; i++) {
      const zz = zwischenzeiten[i];
      const st = zz != null ? 1 : (i < naechster || verpasstCp === i) ? 2 : 0;
      code += st * f; f *= 3;
    }
    return code;
  }
  const CP_FARBE = [c.farbeCpOffen, c.farbeCpDurch, c.farbeCpVerpasst];

  // Start, Ziel und Checkpoints obendrauf (nach jedem Weitermalen und bei einem Checkpoint-Wechsel, nur ein paar Pixel)
  function zeichen(code) {
    let f = 1;
    const l = Math.max(0, c.cpLaenge / 2 - 1);
    for (let i = 0; i < cps.length; i++) {
      const p = cps[i], st = Math.floor(code / f) % 3; f *= 3;
      kc.fillStyle = CP_FARBE[st];
      for (let j = -l; j <= l; j++) kc.fillRect(p.u + p.du * j, p.v + p.dv * j, 2, 2);
    }
    const gs = c.startGroesse, gz = c.zielGroesse;
    kc.fillStyle = c.farbeStart;
    kc.fillRect(startU - gs / 2, startV - gs / 2, gs, gs);
    for (let j = 0; j < gz * gz; j++) {
      const a = j % gz, b = Math.floor(j / gz);
      kc.fillStyle = (a + b) % 2 ? c.farbeZielDunkel : c.farbeZielHell;
      kc.fillRect(zielU - gz / 2 + a, zielV - gz / 2 + b, 1, 1);
    }
  }

  // Gefahrene Strecke: nur das neue Stück bis maxS malen (naechstesK = erstes Teilstück, das noch nicht ganz gemalt ist)
  const stand = { maxS: NaN, code: -1, neuGemalt: 0, ganzNeu: 0 }; // (neuGemalt, ganzNeu: für Tests)
  let naechstesK = 1;
  function zurueck() {
    kc.clearRect(0, 0, kartenB, kartenH);
    kc.drawImage(grund, 0, 0);
    naechstesK = 1;
    stand.ganzNeu++;
  }
  function weiterMalen(bis) {
    kc.fillStyle = c.farbeGefahren;
    for (let k = naechstesK; k < n && ms[k - 1] < bis; k++) {
      if (ms[k] <= bis) { linie(kc, mu[k - 1], mv[k - 1], mu[k], mv[k], 2); naechstesK = k + 1; continue; }
      // letztes Stück nur bis maxS (wird beim nächsten Mal ganz gemalt)
      const i = index(bis);
      linie(kc, mu[k - 1], mv[k - 1], Math.round(ku(px[i])) - 1, Math.round(kv(pz[i])) - 1, 2);
      break;
    }
  }
  function faerben(maxS, code) {
    const vor = stand.maxS;
    if (Number.isNaN(vor) || !(maxS > -Infinity) || !(maxS >= vor)) zurueck(); // erstes Mal oder neuer Lauf
    if (maxS > -Infinity) weiterMalen(maxS);
    zeichen(code);
    stand.maxS = maxS; stand.code = code; stand.neuGemalt++;
  }

  // Ausschnitt dieses Bildes (für Tests): Ecke in der grossen Karte, Kartenpixel des Autos, Pfeilrichtung
  const fenster = { sx: 0, sy: 0, u: 0, v: 0, richtung: 0 };
  return {
    x: x0, y: y0, breite: G, hoehe: G, mass, innen, mitteX, mitteY, stand, fenster, karte, cps, // (für Tests)
    start: { u: startU, v: startV }, ziel: { u: zielU, v: zielV },
    // Kartenpunkt (Pixel der grossen Karte, Kommazahl) einer Weltposition – für Tests
    projiziere: (x, z) => ({ u: ku(x), v: kv(z) }),
    // Bildpunkt (Kommazahl) einer Weltposition im aktuellen Ausschnitt – für Tests
    imBild: (x, z) => ({ x: x0 + 1 + ku(x) - fenster.sx, y: y0 + 1 + kv(z) - fenster.sy }),
    // Jedes Bild: Autoposition (x, z), Blickrichtung, maxS = weitester Punkt dieses Laufs
    zeichne(ctx, ax, az, richtung, maxS, zwischenzeiten, naechster, verpasstCp) {
      const code = cpCode(zwischenzeiten, naechster, verpasstCp);
      // weitermalen: beim ersten Mal, bei einem neuen Lauf (maxS kleiner), alle neuFaerbenAb Meter, Checkpoint-Wechsel
      let neu;
      if (Number.isNaN(stand.maxS)) neu = true;
      else if (!(maxS > -Infinity)) neu = stand.maxS > -Infinity;
      else neu = !(stand.maxS > -Infinity) || maxS < stand.maxS || maxS - stand.maxS > c.neuFaerbenAb;
      if (neu || code !== stand.code) faerben(neu ? maxS : stand.maxS, code);
      // Ausschnitt: das Kartenpixel des Autos kommt genau in die Tafelmitte (ganze Pixel, kein Zittern)
      const u = ku(ax), v = kv(az);
      fenster.u = u; fenster.v = v;
      fenster.sx = Math.max(0, Math.min(kartenB - innen, Math.floor(u) - halb));
      fenster.sy = Math.max(0, Math.min(kartenH - innen, Math.floor(v) - halb));
      ctx.drawImage(tafelBild, x0, y0);
      ctx.drawImage(karte, fenster.sx, fenster.sy, innen, innen, x0 + 1, y0 + 1, innen, innen);
      ctx.drawImage(rahmenBild, x0, y0);
      // Pfeil in Blickrichtung (auf 8 Richtungen gerundet): vorne = (sin, cos) in (x, z), auf der Karte z nach unten
      const r = ((Math.round(Math.atan2(Math.sin(richtung), -Math.cos(richtung)) / (Math.PI / 4)) % 8) + 8) % 8;
      fenster.richtung = r;
      ctx.drawImage(pfeile, r * 8, 0, 7, 7, mitteX - 3, mitteY - 3, 7, 7);
    },
  };
}
