// Minimap oben rechts (Meilenstein 6): die ganze Etappe, Norden oben (feste Karte, dreht nicht mit).
// Gefahrene Strecke gelb/orange (bis zum weitesten Punkt dieses Laufs, schrumpft nie), Start grün, Ziel als Karo,
// Checkpoints als kurzer Querstrich (weiss, durchfahren grün, verpasst rot), das Auto als heller Punkt.
// Die Karte wird beim Laden einmal auf eine kleine Leinwand gemalt (im 320x180-Raster, Linien Pixel für Pixel).
// Neu gefärbt wird sie nur, wenn das Auto hud.minimap.neuFaerbenAb Meter weiter ist oder ein Checkpoint wechselt;
// pro Bild kommen nur die fertige Karte und der Punkt dazu (keine neuen Objekte).

import { CONFIG } from './config.js';
import { zeichneTafel } from './pixel.js';

export function baueMinimap(strecke, checkpoints) {
  const c = CONFIG.hud.minimap;
  const { px, pz, anzahl } = strecke;
  const sAt = strecke.s;
  // Massstab: die ganze Strecke passt in die Tafel (höchstens maxBreite x maxHoehe mit Rand)
  const box = strecke.box;
  const w = box.maxX - box.minX, h = box.maxZ - box.minZ;
  const innenB = c.maxBreite - 2 * c.rand, innenH = c.maxHoehe - 2 * c.rand;
  const mass = Math.min((innenB - 1) / w, (innenH - 1) / h); // Pixel pro Meter
  const breite = Math.round(w * mass) + 1 + 2 * c.rand, hoehe = Math.round(h * mass) + 1 + 2 * c.rand;
  const x0 = CONFIG.bild.breite - c.rechts - breite, y0 = c.oben;
  // Kartenpunkt eines Streckenpunkts (Pixel in der Tafel, Kommazahl): x nach Osten, z nach Süden = unten (Norden oben)
  const kx = (x) => c.rand + 0.5 + (x - box.minX) * mass;
  const ky = (z) => c.rand + 0.5 + (z - box.minZ) * mass;

  // Punkte der Karte alle punktAbstand Meter (und der letzte Punkt)
  const schritt = Math.max(1, Math.round(c.punktAbstand / (sAt[1] - sAt[0] || 1)));
  const n = Math.ceil((anzahl - 1) / schritt) + 1;
  const mu = new Int16Array(n), mv = new Int16Array(n), ms = new Float32Array(n);
  for (let k = 0; k < n; k++) {
    const i = Math.min(anzahl - 1, k * schritt);
    mu[k] = Math.floor(kx(px[i])); mv[k] = Math.floor(ky(pz[i])); ms[k] = sAt[i];
  }
  const pixel = (s) => Math.max(0, Math.min(anzahl - 1, Math.round(s / (sAt[1] - sAt[0] || 1))));

  // Linie Pixel für Pixel (Bresenham), 1 Pixel breit, ohne Kantenglättung
  function linie(ctx, xa, ya, xb, yb) {
    const dx = Math.abs(xb - xa), dy = -Math.abs(yb - ya), sx = xa < xb ? 1 : -1, sy = ya < yb ? 1 : -1;
    let err = dx + dy;
    for (let k = 0; k < 400; k++) {
      ctx.fillRect(xa, ya, 1, 1);
      if (xa === xb && ya === yb) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; xa += sx; }
      if (e2 <= dx) { err += dx; ya += sy; }
    }
  }

  // Grundbild: Tafel und die ganze Strecke (noch nicht gefahren)
  const leinwand = (b, hh) => { const l = document.createElement('canvas'); l.width = b; l.height = hh; return l; };
  const grund = leinwand(breite, hoehe), karte = leinwand(breite, hoehe);
  const gx = grund.getContext('2d'), kc = karte.getContext('2d');
  zeichneTafel(gx, 0, 0, breite, hoehe, c.ecke, c.farbeTafel, c.farbeRand);
  gx.fillStyle = c.farbeOffen;
  for (let k = 1; k < n; k++) linie(gx, mu[k - 1], mv[k - 1], mu[k], mv[k]);

  // Checkpoint-Striche: Lage und Richtung quer zur Strecke (auf 8 Richtungen gerundet)
  const cps = checkpoints.map((cp) => {
    const p = strecke.punktBei(cp.s);
    const nx = -p.tz, nz = p.tx; // quer zur Fahrtrichtung
    const r = (v) => (Math.abs(v) > 0.38 ? Math.sign(v) : 0);
    return { u: Math.floor(kx(p.x)), v: Math.floor(ky(p.z)), du: r(nx), dv: r(nz) };
  });
  const start = strecke.punktBei(strecke.startS), ziel = strecke.punktBei(strecke.zielS);
  const startU = Math.floor(kx(start.x)), startV = Math.floor(ky(start.z));
  const zielU = Math.floor(kx(ziel.x)), zielV = Math.floor(ky(ziel.z));

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

  // Karte neu färben: Grundbild, gefahrene Strecke bis maxS, dann Start, Ziel und Checkpoints obendrauf
  const stand = { maxS: NaN, code: -1, neuGemalt: 0 }; // (neuGemalt: für Tests)
  function faerben(maxS, code) {
    stand.maxS = maxS; stand.code = code; stand.neuGemalt++;
    kc.clearRect(0, 0, breite, hoehe);
    kc.drawImage(grund, 0, 0);
    if (maxS > -Infinity) {
      kc.fillStyle = c.farbeGefahren;
      for (let k = 1; k < n; k++) {
        if (ms[k - 1] >= maxS) break;
        if (ms[k] <= maxS) { linie(kc, mu[k - 1], mv[k - 1], mu[k], mv[k]); continue; }
        // letztes Stück nur bis maxS
        const i = pixel(maxS);
        linie(kc, mu[k - 1], mv[k - 1], Math.floor(kx(px[i])), Math.floor(ky(pz[i])));
        break;
      }
    }
    // Checkpoints: kurzer Strich quer zur Strecke
    let f = 1;
    for (let i = 0; i < cps.length; i++) {
      const p = cps[i], st = Math.floor(code / f) % 3; f *= 3;
      kc.fillStyle = CP_FARBE[st];
      const halb = (c.cpLaenge - 1) / 2;
      for (let j = -halb; j <= halb; j++) kc.fillRect(p.u + p.du * j, p.v + p.dv * j, 1, 1);
    }
    // Start: 2x2 grün; Ziel: Karo 3x3 (schwarz/weiss)
    kc.fillStyle = c.farbeStart;
    kc.fillRect(startU - 1, startV - 1, 2, 2);
    for (let j = 0; j < 9; j++) {
      kc.fillStyle = j % 2 ? c.farbeZielDunkel : c.farbeZielHell;
      kc.fillRect(zielU - 1 + (j % 3), zielV - 1 + Math.floor(j / 3), 1, 1);
    }
  }

  // Wo steht der Punkt? (für Tests: Kartenpunkt als Kommazahl und das gezeichnete 2x2-Quadrat, Bildpixel)
  const punkt = { x: 0, y: 0, rx: 0, ry: 0 };
  let uhr = 0;
  return {
    x: x0, y: y0, breite, hoehe, mass, stand, punkt, karte, cps, // (cps, karte: für Tests)
    // Kartenpunkt (Bildpixel, Kommazahl) einer Weltposition – für Tests
    projiziere: (x, z) => ({ x: x0 + kx(x), y: y0 + ky(z) }),
    // Jedes Bild: s = Stelle des Autos (aus der Abfrage der Spielschleife), maxS = weitester Punkt dieses Laufs
    zeichne(ctx, dt, s, maxS, zwischenzeiten, naechster, verpasstCp) {
      const code = cpCode(zwischenzeiten, naechster, verpasstCp);
      // neu färben: beim ersten Mal, bei einem neuen Lauf (maxS kleiner), alle neuFaerbenAb Meter, Checkpoint-Wechsel
      let neu;
      if (Number.isNaN(stand.maxS)) neu = true;
      else if (!(maxS > -Infinity)) neu = stand.maxS > -Infinity;
      else neu = !(stand.maxS > -Infinity) || maxS < stand.maxS || maxS - stand.maxS > c.neuFaerbenAb;
      if (neu || code !== stand.code) faerben(maxS, code);
      ctx.drawImage(karte, x0, y0);
      // Auto: nächster Streckenpunkt zur Stelle s (bleibt auf der Linie, auch auf der Wiese)
      const i = pixel(s);
      punkt.x = x0 + kx(px[i]); punkt.y = y0 + ky(pz[i]);
      punkt.rx = Math.round(punkt.x) - 1; punkt.ry = Math.round(punkt.y) - 1;
      uhr += dt;
      ctx.fillStyle = c.farbeAutoRand;
      ctx.fillRect(punkt.rx - 1, punkt.ry - 1, 4, 4);
      ctx.globalAlpha = 1 - c.blinkenTiefe * (0.5 - 0.5 * Math.cos(uhr * c.blinkenHz * 2 * Math.PI));
      ctx.fillStyle = c.farbeAuto;
      ctx.fillRect(punkt.rx, punkt.ry, 2, 2);
      ctx.globalAlpha = 1;
    },
  };
}
