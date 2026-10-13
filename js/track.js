// Streckenverlauf der Teststrecke.
// Die Strecke ist eine weiche Kurve (Spline) durch die Punkte unten.
// Zum Umbauen einfach Punkte verschieben, einfügen oder löschen.
//
// Koordinaten in Metern:  x = Osten (+) / Westen (-)
//                         z = Süden (+) / Norden (-)
//                         h = Höhe über dem Talboden
// wand: 'links' / 'rechts' = ab diesem Punkt bis zum nächsten Punkt
//       mit wand steht eine Felswand auf dieser Seite, auf der anderen
//       Seite geht es ins Tal (Abhang).

import * as THREE from 'three';
import { CONFIG } from './config.js';

export const STRECKEN_PUNKTE = [
  // 1. Startgerade (Richtung Norden)
  { x: 0, z: 40, h: 0 },
  { x: 0, z: -20, h: 0 },
  { x: 0, z: -100, h: 0 },
  // 2. weite Rechtskurve, dann weite Linkskurve
  { x: 6, z: -170, h: 0.5 },
  { x: 35, z: -225, h: 1 },
  { x: 85, z: -255, h: 1.5 },
  { x: 145, z: -265, h: 2 },
  { x: 195, z: -290, h: 3 },
  { x: 220, z: -335, h: 4.5 },
  // 3. Steigung
  { x: 222, z: -380, h: 8 },
  { x: 215, z: -430, h: 13 },
  { x: 206, z: -478, h: 18 },
  // 4a. Spitzkehre 1 (links herum)
  { x: 204, z: -505, h: 20 },
  { x: 199, z: -521, h: 21 },
  { x: 189, z: -528, h: 22 },
  { x: 179, z: -523, h: 23 },
  { x: 175, z: -508, h: 24 },
  // zurück nach Süden, weiter bergauf
  { x: 176, z: -480, h: 27 },
  { x: 176, z: -463, h: 29 },
  // 4b. Spitzkehre 2 (rechts herum)
  { x: 175, z: -450, h: 30 },
  { x: 170, z: -439, h: 31 },
  { x: 161, z: -435, h: 32 },
  { x: 152, z: -440, h: 33 },
  { x: 148, z: -452, h: 34 },
  // wieder nach Norden, bergauf
  { x: 148, z: -490, h: 38 },
  { x: 148, z: -540, h: 43 },
  { x: 146, z: -590, h: 48 },
  // 5. Felswand links, Abhang rechts ins Tal
  { x: 140, z: -640, h: 52, wand: 'links' },
  { x: 129, z: -690, h: 55, wand: 'links' },
  { x: 123, z: -740, h: 57, wand: 'links' },
  { x: 127, z: -790, h: 58, wand: 'links' },
  { x: 140, z: -830, h: 58, wand: 'links' },
  // 6. Zielgerade
  { x: 160, z: -870, h: 58 },
  { x: 174, z: -925, h: 58 },
];

// Abstand der berechneten Streckenpunkte (Meter)
const SCHRITT = 1;

// Baut aus den Punkten die fertige Strecke mit allen Daten,
// die Gelände, Physik und Zeitmessung brauchen.
export function baueStrecke() {
  const punkte = STRECKEN_PUNKTE.map((p) => new THREE.Vector3(p.x, p.h, p.z));
  const kurve = new THREE.CatmullRomCurve3(punkte, false, 'centripetal');
  kurve.arcLengthDivisions = 6000;
  const laenge = kurve.getLength();
  const anzahl = Math.ceil(laenge / SCHRITT) + 1;

  // Für jeden Punkt merken, zu welchem Abschnitt (zwischen Kontrollpunkten) er gehört
  const n = punkte.length - 1;
  const px = new Float32Array(anzahl), py = new Float32Array(anzahl), pz = new Float32Array(anzahl);
  const tx = new Float32Array(anzahl), tz = new Float32Array(anzahl);
  const sArr = new Float32Array(anzahl);
  const wandSeite = new Int8Array(anzahl);   // -1 = links, 1 = rechts, 0 = keine
  const wandStaerke = new Float32Array(anzahl);

  const v = new THREE.Vector3();
  for (let i = 0; i < anzahl; i++) {
    const u = Math.min(1, (i * SCHRITT) / laenge);
    kurve.getPointAt(u, v);
    px[i] = v.x; py[i] = v.y; pz[i] = v.z;
    sArr[i] = u * laenge;
    // Abschnitt bestimmen (über den Spline-Parameter t)
    const t = kurve.getUtoTmapping(u);
    const seg = Math.min(n - 1, Math.floor(t * n));
    const a = STRECKEN_PUNKTE[seg], b = STRECKEN_PUNKTE[seg + 1];
    if (a.wand && b.wand && a.wand === b.wand) wandSeite[i] = a.wand === 'links' ? -1 : 1;
  }
  // Richtung (Tangente) in der Ebene
  for (let i = 0; i < anzahl; i++) {
    const i0 = Math.max(0, i - 1), i1 = Math.min(anzahl - 1, i + 1);
    let dx = px[i1] - px[i0], dz = pz[i1] - pz[i0];
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

  const strecke = {
    kurve, laenge, anzahl, px, py, pz, tx, tz, s: sArr, wandSeite, wandStaerke,
    startS: CONFIG.strasse.startBeiMeter,
    zielS: laenge - CONFIG.strasse.zielVorEnde,

    // Nächster Streckenpunkt zu (x, z).
    // Ergebnis: s (Meter entlang der Strecke), seite (Abstand zur Mitte, + = rechts),
    // h (Strassenhöhe), i (Index), tx/tz (Richtung), abstand (Luftlinie zur Mitte)
    abfrage(x, z, ziel = {}) {
      let best = 0, bestD = Infinity;
      // grob suchen (jeder 4. Punkt), dann fein
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
      // auf die Strecke projizieren (zwischen zwei Punkten interpolieren)
      const i = best;
      const ux = tx[i], uz = tz[i];
      const rx = -uz, rz = ux; // rechts von der Fahrtrichtung
      const dx = x - px[i], dz = z - pz[i];
      let laengs = dx * ux + dz * uz;
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
    },

    // Punkt bei s Metern (für Reset und Startposition)
    punktBei(s) {
      const i = Math.max(0, Math.min(anzahl - 1, Math.round(s / SCHRITT)));
      return { x: px[i], h: py[i], z: pz[i], tx: tx[i], tz: tz[i], i };
    },
  };
  return strecke;
}
