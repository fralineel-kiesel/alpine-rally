// Strassennetz (Meilenstein 3a): die Etappe plus die Stummel an den Nebenwegen.
//
// Die Etappe (track.js) ist eine Linie. Bei einem Nebenweg biegt sie von der Hauptstrasse ab
// und mündet später wieder ein. Die Hauptstrasse läuft an beiden Stellen als "Stummel" weiter:
// ein kurzes Stück Asphalt, abgesperrt, das hinter einer Kurve und einer Kuppe verschwindet.
//
// Wer was kennt:
//   - Gelände, Strassenband, Boden unter dem Auto, Bäume ("nicht auf die Strasse"), Strassenrand
//     und Kollision fragen das NETZ (netz.abfrage): nächste Strasse, egal ob Etappe oder Stummel.
//   - Rennlogik (Fortschritt, Checkpoints, Zurücksetzen, Zeit, Abkürzungen) fragt weiter nur die
//     ETAPPE (strecke.abfrage). Ein Stummel zählt dort nie.
// Werte: config.js, Blöcke "nebenwege", "stummel", "belaege", "kreuzung".

import { CONFIG } from './config.js';
import { glatt, mische } from './util.js';

const ARTEN = ['band', 'reifen', 'heu', 'zaun'];
const GRAD = Math.PI / 180;

// Punkt der Etappe bei s Metern (zwischen zwei Streckenpunkten gemittelt)
function etappePunkt(strecke, s) {
  const n = strecke.anzahl;
  const f = Math.max(0, Math.min(n - 1.001, s));
  const i = Math.floor(f), t = f - i, j = i + 1;
  const ux = strecke.tx[i] + (strecke.tx[j] - strecke.tx[i]) * t, uz = strecke.tz[i] + (strecke.tz[j] - strecke.tz[i]) * t;
  const l = Math.hypot(ux, uz) || 1;
  return {
    x: strecke.px[i] + (strecke.px[j] - strecke.px[i]) * t, z: strecke.pz[i] + (strecke.pz[j] - strecke.pz[i]) * t,
    h: strecke.py[i] + (strecke.py[j] - strecke.py[i]) * t, tx: ux / l, tz: uz / l,
  };
}

// Ein Stummel: Linie mit Punkten alle 1 m (wie die Etappe). richtung: +1 = in Fahrtrichtung der
// Etappe weiter (beim Abzweig), -1 = entgegen (bei der Einmündung)
function baueStummel(strecke, sJ, richtung, form) {
  const p0 = etappePunkt(strecke, sJ);
  const dx0 = p0.tx * richtung, dz0 = p0.tz * richtung;
  // Steigung der Etappe an der Kreuzung (in Richtung des Stummels)
  const pa = etappePunkt(strecke, sJ - 3), pb = etappePunkt(strecke, sJ + 3);
  const g0 = ((pb.h - pa.h) / 6) * richtung;
  const bogen = Math.abs(form.kurve) * GRAD * form.radius;
  const L = Math.round(form.gerade + bogen + form.rest);
  const n = L + 1;
  const px = new Float32Array(n), py = new Float32Array(n), pz = new Float32Array(n);
  const tx = new Float32Array(n), tz = new Float32Array(n);
  let x = p0.x, z = p0.z, w = Math.atan2(dx0, -dz0); // Richtung: 0 = Norden, + = nach rechts gedreht
  const dreh = (form.kurve * GRAD) / Math.max(1, bogen);
  // Höhe: erst wie die Etappe weiter, dann bis zur Kurvenmitte um "kuppe" höher, danach bergab
  const uK = form.gerade + bogen * 0.5;
  const hK = p0.h + g0 * uK + form.kuppe;
  for (let u = 0; u < n; u++) {
    px[u] = x; pz[u] = z;
    tx[u] = Math.sin(w); tz[u] = -Math.cos(w);
    const linear = p0.h + g0 * u;
    py[u] = u < uK ? linear + form.kuppe * glatt(form.gerade * 0.5, uK, u) : hK - form.abfall * (u - uK) * glatt(0, 25, u - uK);
    // einen Meter weiter
    const imBogen = u >= form.gerade && u < form.gerade + bogen;
    if (imBogen) w += dreh * 0.5;
    x += Math.sin(w); z += -Math.cos(w);
    if (imBogen) w += dreh * 0.5;
  }
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
  for (let u = 0; u < n; u++) {
    minX = Math.min(minX, px[u]); maxX = Math.max(maxX, px[u]); minZ = Math.min(minZ, pz[u]); maxZ = Math.max(maxZ, pz[u]);
  }
  return { px, py, pz, tx, tz, anzahl: n, laenge: L, box: { minX, maxX, minZ, maxZ }, sJ, richtung, form };
}

// Nächster Punkt eines Stummels zu (x, z) (nur wenn er näher als "weit" ist). Ergebnis in ziel
// (gleiche Felder wie strecke.abfrage, s = Meter entlang des Stummels ab der Kreuzung)
function stummelAbfrage(ast, x, z, weit, ziel) {
  const b = ast.box;
  if (x < b.minX - weit || x > b.maxX + weit || z < b.minZ - weit || z > b.maxZ + weit) return null;
  const { px, pz, anzahl } = ast;
  let best = 0, bestD = Infinity;
  for (let i = 0; i < anzahl; i += 4) {
    const d = (px[i] - x) ** 2 + (pz[i] - z) ** 2;
    if (d < bestD) { bestD = d; best = i; }
  }
  for (let i = Math.max(0, best - 4); i <= Math.min(anzahl - 1, best + 4); i++) {
    const d = (px[i] - x) ** 2 + (pz[i] - z) ** 2;
    if (d < bestD) { bestD = d; best = i; }
  }
  if (bestD > weit * weit) return null;
  const i = best, ux = ast.tx[i], uz = ast.tz[i];
  const ddx = x - px[i], ddz = z - pz[i];
  const laengs = ddx * ux + ddz * uz;
  let j = i, f = 0;
  if (laengs >= 0 && i < anzahl - 1) { j = i + 1; f = Math.min(1, laengs); } else if (laengs < 0 && i > 0) { j = i - 1; f = Math.min(1, -laengs); }
  ziel.i = i;
  ziel.s = i + laengs;
  ziel.seite = ddx * -uz + ddz * ux;
  ziel.h = ast.py[i] + (ast.py[j] - ast.py[i]) * f;
  ziel.tx = ux; ziel.tz = uz;
  ziel.abstand = Math.sqrt(bestD);
  ziel.wandSeite = 0; ziel.wandStaerke = 0;
  return ziel;
}

export function baueNetz(strecke) {
  const C = CONFIG;
  const halbA = C.belaege.asphalt.breite / 2;
  const bank = C.strasse.bankett;
  const n = strecke.anzahl;

  // --- Belag der Etappe je Streckenpunkt -------------------------------------------
  const belag = new Array(n).fill('asphalt');
  const nebenwege = (C.nebenwege || []).map((nw, k) => ({ ...nw, nr: k }));
  for (const nw of nebenwege) {
    for (let i = Math.ceil(nw.abzweig); i <= Math.floor(nw.einmuendung); i++) if (i >= 0 && i < n) belag[i] = nw.belag || 'schotter';
  }
  const halbBei = (s) => C.belaege[belag[Math.max(0, Math.min(n - 1, Math.round(s)))]].breite / 2;

  // --- Stummel ------------------------------------------------------------------------
  const aeste = [];
  let artZaehler = 0;
  const naechsteArt = (wunsch) => {
    const liste = C.absperrung && C.absperrung.reihenfolge && C.absperrung.reihenfolge.length ? C.absperrung.reihenfolge : ARTEN;
    const art = wunsch || liste[artZaehler % liste.length];
    artZaehler = liste.indexOf(art) + 1;
    return art;
  };
  for (const nw of nebenwege) {
    for (const [art, sJ, richtung, formExtra, sperreWunsch] of [
      ['abzweig', nw.abzweig, 1, nw.stummelAbzweig, nw.sperreAbzweig],
      ['einmuendung', nw.einmuendung, -1, nw.stummelEinmuendung, nw.sperreEinmuendung],
    ]) {
      const form = { ...C.stummel, ...(formExtra || {}) };
      const ast = baueStummel(strecke, sJ, richtung, form);
      ast.art = art;
      ast.nebenweg = nw;
      ast.nr = aeste.length + 1;            // 0 = Etappe, 1.. = Stummel
      ast.belag = 'asphalt';
      ast.halb = halbA;
      ast.sperreArt = naechsteArt(sperreWunsch);
      aeste.push(ast);
    }
  }

  // --- Einfahrt (Mündung) des Nebenwegs an jedem Stummel ---------------------------------
  // Der Nebenweg verlässt den Stummel auf einer Seite (seiteN, im Stummel gesehen). Die Kante
  // des Nebenwegs, die zum Stummel hin schaut, schneidet die Asphaltkante des Stummels in C.
  // Die Ecke dort wird abgerundet (P1 auf dem Stummel, P2 auf dem Nebenweg, Kurve dazwischen).
  const r = C.kreuzung.eckRadius;
  const q = {};
  for (const ast of aeste) {
    const weg = ast.richtung > 0 ? 1 : -1; // so läuft die Etappe von der Kreuzung weg in den Nebenweg
    const pN = etappePunkt(strecke, ast.sJ + weg * 40);
    stummelAbfrage(ast, pN.x, pN.z, 1e6, q);
    ast.seiteN = Math.sign(q.seite) || 1;
    // Kante der Etappe, die zum Stummel schaut (in Etappen-Sicht: links = -1, rechts = +1)
    const sigma = -ast.seiteN * ast.richtung;
    const halbS = halbBei(ast.sJ + weg * 20);
    const kante = (s) => {
      const p = etappePunkt(strecke, s);
      return { x: p.x - p.tz * sigma * halbS, z: p.z + p.tx * sigma * halbS, h: p.h, s };
    };
    let pc = null, sC = 0;
    for (let d = 0; d < 80; d += 0.25) {
      const k = kante(ast.sJ + weg * d);
      stummelAbfrage(ast, k.x, k.z, 1e6, q);
      if (q.seite * ast.seiteN > halbA) { pc = k; sC = d; break; }
    }
    if (!pc) { ast.muendung = null; ast.sperreU = C.stummel.gerade * 0.6; continue; }
    stummelAbfrage(ast, pc.x, pc.z, 1e6, q);
    const uC = q.s;
    const uP1 = uC + r;
    const p1 = { x: ast.px[Math.round(uP1)] - ast.tz[Math.round(uP1)] * ast.seiteN * halbA, z: ast.pz[Math.round(uP1)] + ast.tx[Math.round(uP1)] * ast.seiteN * halbA, h: ast.py[Math.round(uP1)] };
    // P2: auf der Kante des Nebenwegs etwa r Meter von C weg
    let p2 = pc;
    for (let d = sC; d < sC + 4 * r; d += 0.25) {
      p2 = kante(ast.sJ + weg * d);
      if (Math.hypot(p2.x - pc.x, p2.z - pc.z) >= r) break;
    }
    // Rundung: quadratische Bézier-Kurve von P1 nach P2 mit C als Kontrollpunkt
    const rand = [];
    for (let k = 0; k <= 10; k++) {
      const t = k / 10, a = (1 - t) * (1 - t), b = 2 * t * (1 - t), c = t * t;
      rand.push({ x: a * p1.x + b * pc.x + c * p2.x, z: a * p1.z + b * pc.z + c * p2.z, h: mische(p1.h, p2.h, t) });
    }
    ast.muendung = { c: pc, p1, p2, rand, uC, uP1, sC: ast.sJ + weg * sC, sP2: p2.s, seiteN: ast.seiteN, seiteEtappe: sigma };
    ast.sperreU = uP1 + C.stummel.sperreNachEinfahrt;
  }

  // Liegt (x, z) in der abgerundeten Ecke einer Einfahrt? (Dreiecksfächer von C aus)
  function inEcke(x, z) {
    for (const ast of aeste) {
      const m = ast.muendung;
      if (!m || Math.hypot(x - m.c.x, z - m.c.z) > r * 1.6) continue;
      for (let k = 0; k < m.rand.length - 1; k++) {
        const a = m.c, b = m.rand[k], c = m.rand[k + 1];
        const d1 = (x - b.x) * (a.z - b.z) - (a.x - b.x) * (z - b.z);
        const d2 = (x - c.x) * (b.z - c.z) - (b.x - c.x) * (z - c.z);
        const d3 = (x - a.x) * (c.z - a.z) - (c.x - a.x) * (z - a.z);
        if ((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0)) continue;
        return { h: (a.h + b.h + c.h) / 3, ast };
      }
    }
    return null;
  }

  const qs = {};
  const netz = {
    aeste, nebenwege, belag, halbBei, inEcke, etappePunkt: (s) => etappePunkt(strecke, s),
    halbAsphalt: halbA, bankett: bank,

    // Nächster Punkt eines Stummels (ast = Objekt aus aeste), null wenn weiter als "weit"
    stummelAbfrage: (ast, x, z, weit = 1e6, ziel = {}) => stummelAbfrage(ast, x, z, weit, ziel),

    // Nächste Strasse (Etappe ODER Stummel) zu (x, z). Wie strecke.abfrage, dazu
    // ziel.ast (0 = Etappe, sonst Nummer des Stummels) und ziel.halb (halbe Fahrbahnbreite).
    // NUR für Gelände, Boden, Bäume, Strassenrand – nie für die Rennlogik!
    abfrage(x, z, ziel = {}) {
      strecke.abfrage(x, z, ziel);
      ziel.ast = 0;
      ziel.halb = halbBei(ziel.s);
      for (const ast of aeste) {
        const w = stummelAbfrage(ast, x, z, Math.min(ziel.abstand, 200), qs);
        if (!w || w.s < -0.5 || w.abstand >= ziel.abstand) continue;
        Object.assign(ziel, w);
        ziel.ast = ast.nr;
        ziel.halb = halbA;
      }
      return ziel;
    },

    // Abstand zum nächsten Stummel (nur Stummel, ab der Kreuzung), Infinity wenn keiner nahe
    stummelAbstand(x, z, weit = 60) {
      let best = Infinity;
      for (const ast of aeste) {
        const w = stummelAbfrage(ast, x, z, weit, qs);
        if (w && w.s >= -0.5 && w.abstand < best) best = w.abstand;
      }
      return best;
    },

    // Gibt es neben der nächsten Strasse (erster: Ergebnis von abfrage) noch eine andere
    // in der Nähe? Etappe: Stück mehr als 40 m (Strecke) entfernt, oder ein Stummel.
    // Stummel: die Etappe oder ein anderer Stummel. Ergebnis in ziel, sonst null.
    zweiteStrasse(x, z, erster, weit, ziel) {
      let gefunden = null;
      if (erster.ast === 0) {
        if (strecke.andererAst(x, z, erster.s, 40, weit, ziel)) { ziel.ast = 0; gefunden = ziel.abstand; }
      } else {
        strecke.abfrage(x, z, ziel);
        if (ziel.abstand < weit) { ziel.ast = 0; gefunden = ziel.abstand; }
      }
      for (const ast of aeste) {
        if (ast.nr === erster.ast) continue;
        const w = stummelAbfrage(ast, x, z, weit, qs);
        if (!w || w.s < -0.5 || (gefunden !== null && w.abstand >= gefunden)) continue;
        Object.assign(ziel, w);
        ziel.ast = ast.nr;
        gefunden = w.abstand;
      }
      return gefunden === null ? null : ziel;
    },
  };
  return netz;
}
