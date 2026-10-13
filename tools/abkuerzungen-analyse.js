// Abkürzungs-Analyse (läuft im Browser, gestartet von tools/abkuerzungen.mjs).
// Das Spiel selbst lädt diese Datei nicht.
//
// Für jeden Strassenpunkt i und spätere Punkte j (bis ca. 200 m weiter) wird
// die gerade Linie dazwischen geprüft:
//   Gewinn    = Strecke auf der Strasse minus Luftlinie
//   befahrbar = nirgends zu steil bergauf, nicht in die Felswand oder über die
//               Abhang-Grenze, nicht zu weit weg von der Strasse, und ein Auto
//               der Breite "breite" bleibt an keinem Hindernis hängen.
//   Abkürzung = befahrbar, spart mindestens minGewinn Meter und führt neben das
//               Bankett auf die Wiese (sonst ist es nur die Ideallinie).
// Danach werden Sperren geplant: immer dort, wo eine Querlinie von der Strasse
// ins Kurveninnere die meisten Abkürzungen abschneidet.

import { CONFIG } from '../js/config.js';
import { baueKollision } from '../js/kollision.js';
import { planeSperre } from '../js/sperren.js';

// Ist die gerade Linie von (ax, az) nach (bx, bz) befahrbar und führt auf die Wiese?
// halb = halbe Autobreite (so viel Abstand müssen Hindernisse zur Linie halten)
export function linieBefahrbar(strecke, welt, kollision, ax, az, bx, bz, halb) {
  const a = CONFIG.abkuerzung, g = CONFIG.grenze;
  const dx = bx - ax, dz = bz - az;
  const laenge = Math.hypot(dx, dz);
  const n = Math.max(1, Math.ceil(laenge / a.pruefSchritt));
  // 1. Hindernisse (schnell, die meisten Linien scheitern hier)
  for (let k = 0; k <= n; k++) {
    const f = k / n;
    if (!kollision.frei(ax + dx * f, az + dz * f, halb)) return false;
  }
  // 2. Gelände, Felswand, Abhang, Abstand zur Strasse (jeder 2. Punkt reicht)
  const q = {};
  let hAlt = 0, fAlt = 0, wiese = false;
  for (let k = 0; k <= n; k += k + 2 > n && k !== n ? n - k : 2) {
    const f = k / n, x = ax + dx * f, z = az + dz * f;
    strecke.abfrage(x, z, q);
    if (q.abstand > g.maxAbstand) return false;
    if (q.abstand > a.wieseAb) wiese = true;
    if (q.wandSeite && q.wandStaerke > 0.3) {
      const aufWandSeite = Math.sign(q.seite) === q.wandSeite;
      if (Math.abs(q.seite) > (aufWandSeite ? g.wandGrenze : g.abhangGrenze)) return false;
    }
    const boden = welt.bodenBei(x, z, q);
    // zu steil bergauf (wie in der Fahrphysik: nur auf Gras)
    if (k > 0 && boden.art === 'gras' && (boden.h - hAlt) / ((f - fAlt) * laenge) > g.steilsterHang) return false;
    hAlt = boden.h; fAlt = f;
    if (k === n) break;
  }
  return wiese;
}

// Alle Abkürzungen. Ergebnis: Liste von { i, j, sVon, sBis, gewinn, seite (+1 = rechts, -1 = links), ax.. }
export function findeAbkuerzungen(strecke, welt, kollision, { breite, minGewinn } = {}) {
  const a = CONFIG.abkuerzung;
  const halb = (breite ?? a.autoBreite) / 2;
  const min = minGewinn ?? a.minGewinn;
  const { px, pz, tx, tz, s, anzahl } = strecke;
  const schritt = Math.max(1, Math.round(a.linienAbstand));
  const linien = [];
  // nur zwischen Start- und Ziellinie
  const i0 = Math.ceil(strecke.startS), iEnde = Math.min(anzahl - 1, Math.floor(strecke.zielS));
  for (let i = i0; i <= iEnde; i += schritt) {
    const jMax = Math.min(iEnde, i + Math.round(a.maxLaenge));
    for (let j = i + schritt; j <= jMax; j += schritt) {
      const luft = Math.hypot(px[j] - px[i], pz[j] - pz[i]);
      const gewinn = s[j] - s[i] - luft;
      if (gewinn < min) continue;
      if (!linieBefahrbar(strecke, welt, kollision, px[i], pz[i], px[j], pz[j], halb)) continue;
      // Kurveninnenseite: auf welcher Seite der Strasse liegt die Mitte der Linie?
      const m = Math.round((i + j) / 2);
      const mx = (px[i] + px[j]) / 2 - px[m], mz = (pz[i] + pz[j]) / 2 - pz[m];
      const seite = mx * -tz[m] + mz * tx[m] >= 0 ? 1 : -1;
      linien.push({ i, j, sVon: s[i], sBis: s[j], gewinn, seite, ax: px[i], az: pz[i], bx: px[j], bz: pz[j], halb });
    }
  }
  return linien;
}

// Kurven aus der Strassenform: Abschnitte, in denen die Strasse in dieselbe
// Richtung dreht. Ergebnis: { sVon, sBis, seite (+1 = Rechtskurve) }
export function kurvenDerStrecke(strecke) {
  const { tx, tz, s, anzahl } = strecke;
  const B = 5, MIN = 1 / 700; // Krümmung messen über ±5 m; flacher zählt nicht als Kurve
  const seiteBei = new Int8Array(anzahl);
  for (let i = B; i < anzahl - B; i++) {
    const dtx = tx[i + B] - tx[i - B], dtz = tz[i + B] - tz[i - B];
    const kr = (dtx * -tz[i] + dtz * tx[i]) / (2 * B); // + = dreht nach rechts
    if (Math.abs(kr) > MIN) seiteBei[i] = Math.sign(kr);
  }
  const kurven = [];
  let akt = null;
  for (let i = 0; i < anzahl; i++) {
    const sb = seiteBei[i];
    if (sb && akt && akt.seite === sb && s[i] - akt.sBis < 12) { akt.sBis = s[i]; continue; }
    if (sb) { akt = { sVon: s[i], sBis: s[i], seite: sb }; kurven.push(akt); }
  }
  return kurven.filter((k) => k.sBis - k.sVon >= 8);
}

// Jede Abkürzung der Kurve zuordnen, die sie (auf ihrer Seite) am meisten überdeckt
export function gesperrteKurven(strecke, linien) {
  const kurven = kurvenDerStrecke(strecke);
  const treffer = new Map();
  for (const l of linien) {
    let best = null, bestU = 0;
    for (const k of kurven) {
      if (k.seite !== l.seite) continue;
      const u = Math.min(k.sBis, l.sBis) - Math.max(k.sVon, l.sVon);
      if (u > bestU) { bestU = u; best = k; }
    }
    if (!best) continue;
    const t = treffer.get(best) || { gewinn: 0, linien: 0 };
    t.gewinn = Math.max(t.gewinn, l.gewinn); t.linien++;
    treffer.set(best, t);
  }
  return [...treffer.entries()].sort((a, b) => a[0].sVon - b[0].sVon).map(([k, t]) => ({
    sVon: Math.round(k.sVon), sBis: Math.round(k.sBis), seite: k.seite > 0 ? 'rechts' : 'links',
    gewinn: Math.round(t.gewinn * 10) / 10, linien: t.linien,
  }));
}

// Wo kreuzt die Linie l die Querlinie bei s0 (von der Strasse weg auf Seite "seite")?
// Ergebnis: Abstand zur Strassenmitte, oder null
function kreuzung(strecke, l, s0, seite) {
  const p = strecke.punktBei(s0);
  const nx = -p.tz * seite, nz = p.tx * seite;
  const ex = l.bx - l.ax, ez = l.bz - l.az;
  // l.a + t*e = p + d*n
  const det = ex * -nz - ez * -nx;
  if (Math.abs(det) < 1e-9) return null;
  const rx = p.x - l.ax, rz = p.z - l.az;
  const t = (rx * -nz - rz * -nx) / det;
  const d = (ex * rz - ez * rx) / det;
  if (t < 0 || t > 1 || d < 0) return null;
  return d;
}

// Sperren planen, bis keine Abkürzung mehr übrig ist.
// basis: Hindernisse ohne Sperren, tex: Sprite-Seitenverhältnisse
// linien: Abkürzungen (jede mit eigener halber Breite l.halb)
export function planeSperren(strecke, welt, basis, tex, linien) {
  const c = CONFIG.sperren, a = CONFIG.abkuerzung;
  const halb = a.autoBreite / 2;
  const sperren = [];
  let rest = linien.slice();
  const gesperrt = new Set(); // Stellen, an denen eine Sperre nichts gebracht hat
  for (let runde = 0; runde < 300 && rest.length; runde++) {
    // beste Querlinie suchen: blockiert die meisten (gewichtet mit dem Gewinn).
    // Zuerst mit Mindestabstand zu anderen Sperren (keine Mauer), wenn nichts geht ohne.
    let best = null;
    for (const abstand of [c.mindestAbstand, 0]) {
      for (const seite of [-1, 1]) {
        const meine = rest.filter((l) => l.seite === seite);
        if (!meine.length) continue;
        const von = Math.min(...meine.map((l) => l.sVon)), bis = Math.max(...meine.map((l) => l.sBis));
        for (let s0 = Math.ceil(von) + 1; s0 < bis; s0 += 1) {
          if (gesperrt.has(`${seite}:${s0}`)) continue;
          if (sperren.some((sp) => sp.seite === seite && Math.abs(sp.s - s0) < Math.max(abstand, 1))) continue;
          let wert = 0, tief = 0;
          for (const l of meine) {
            if (l.sVon >= s0 || l.sBis <= s0) continue;
            const d = kreuzung(strecke, l, s0, seite);
            if (d === null || d < c.abstandMitte - l.halb || d > c.maxTiefe) continue;
            wert += l.gewinn;
            tief = Math.max(tief, d);
          }
          if (wert > 0 && (!best || wert > best.wert)) best = { s: s0, seite, wert, tief };
        }
      }
      if (best) break;
    }
    if (!best) break;
    const sperre = {
      s: best.s, seite: best.seite, von: c.abstandMitte,
      bis: Math.round(Math.min(c.maxTiefe, best.tief + halb + c.reserve) * 10) / 10,
    };
    const teile = planeSperre(sperre, strecke, welt, tex);
    if (!teile.hindernisse.length) { gesperrt.add(`${best.seite}:${best.s}`); continue; }
    // welche Abkürzungen sind jetzt zu?
    const kol = baueKollision(teile.hindernisse);
    const vorher = rest.length;
    rest = rest.filter((l) => {
      const n = Math.ceil(Math.hypot(l.bx - l.ax, l.bz - l.az) / a.pruefSchritt);
      for (let k = 0; k <= n; k++) {
        if (!kol.frei(l.ax + (l.bx - l.ax) * (k / n), l.az + (l.bz - l.az) * (k / n), l.halb)) return false;
      }
      return true;
    });
    if (rest.length === vorher) { gesperrt.add(`${best.seite}:${best.s}`); continue; }
    sperren.push(sperre);
  }
  return { sperren: sperren.sort((p, q) => p.s - q.s), rest };
}

// Grösste Lücke einer Sperre: Die Teile (Kreise) bilden eine Kette von der
// Strasse bis ans äussere Ende. Gesucht ist der Weg durch die Kette, bei dem die
// grösste Lücke (Kante zu Kante) am kleinsten ist. Ist diese Lücke schmaler als
// das Auto, kommt es nirgends durch. Ergebnis: grösste solche Lücke aller Sperren.
export function groessteLuecke(strecke, welt, sperren, tex) {
  let max = 0, wo = null;
  for (const sp of sperren) {
    const p = strecke.punktBei(sp.s);
    const nx = -p.tz * sp.seite, nz = p.tx * sp.seite;
    const k = planeSperre(sp, strecke, welt, tex).hindernisse
      .map((h) => ({ ...h, d: (h.x - p.x) * nx + (h.z - p.z) * nz }));
    if (k.length < 2) continue;
    const dMin = Math.min(...k.map((h) => h.d - h.r)), dMax = Math.max(...k.map((h) => h.d + h.r));
    // "Engpass-Weg" (wie Dijkstra, aber mit der grössten Lücke statt der Summe)
    const best = k.map((h) => (h.d - h.r < dMin + 0.8 ? 0 : Infinity));
    const fertig = new Array(k.length).fill(false);
    for (;;) {
      let i = -1;
      for (let n = 0; n < k.length; n++) if (!fertig[n] && best[n] < Infinity && (i < 0 || best[n] < best[i])) i = n;
      if (i < 0) break;
      fertig[i] = true;
      if (k[i].d + k[i].r > dMax - 0.8) { if (best[i] > max) { max = best[i]; wo = sp.s; } break; }
      for (let n = 0; n < k.length; n++) {
        if (fertig[n]) continue;
        const l = Math.max(0, Math.hypot(k[n].x - k[i].x, k[n].z - k[i].z) - k[n].r - k[i].r);
        const w = Math.max(best[i], l);
        if (w < best[n]) best[n] = w;
      }
    }
  }
  return { max, wo };
}
