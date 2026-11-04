// Streckenverlauf (Meilenstein 1, seit M10a aus der Streckendatei).
// Die Strecke ist eine weiche Kurve (Spline) durch die Stützpunkte der Streckendatei (strecken/<id>.js, Feld "punkte";
// Format: docs/strecken-format.md). Abschnitte (Bäume, Wald, Felswand) gelten ab ihrer Zeile für alle Punkte danach.
//
// Koordinaten in Metern:  x = Osten (+) / Westen (-),  z = Süden (+) / Norden (-),  h = Höhe

import * as THREE from 'three';
import { CONFIG } from './config.js';
import { STRECKE, StreckenFehler } from './streckenlader.js';
import { sprungZonen, wendeProfilAn } from './sprung.js';

// Stützpunkte und Abschnitts-Zeilen in der Reihenfolge der Datei (vom Lader gebaut)
export const STRECKEN_PUNKTE = STRECKE.stuetzpunkte;
const ABKUERZUNGEN = STRECKE.erzeugt.abkuerzungen;

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
  // Kontrolle (M10a): passt die Länge zur Angabe in der Streckendatei?
  if (!(Math.abs(laenge - STRECKE.laenge) <= 0.5)) throw new StreckenFehler('laenge', `${STRECKE.id}: ${laenge.toFixed(3)} m statt ${STRECKE.laenge} m`);
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
  // M10c: Sprungzonen (Streckenfeld "sprung" mit von/bis): Höhen-Zusatz der Strasse für Anlauf, Kante und Landehang.
  // Nur die Höhe ändert sich, Draufsicht, Länge und Streckenmeter bleiben. Ohne Zonen (Alpen) passiert hier nichts.
  const sprungZonenListe = sprungZonen(STRECKE.sprung);
  if (sprungZonenListe.length) wendeProfilAn(py, sArr, sprungZonenListe);
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
    sprungZonen: sprungZonenListe, // M10c: Sprungzonen (js/sprung.js), leer = keine Sprünge
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
