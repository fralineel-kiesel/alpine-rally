// Die Welt: Gelände, Strasse, Felswand, Hintergrundberge, Himmel.
// Alles richtet sich nach der Strecke (Mittelpunkt, Ausdehnung, Höhen),
// damit die Welt mitwächst, wenn die Strecke länger wird.

import * as THREE from 'three';
import { CONFIG } from './config.js';
import { zufall, fbm, glatt, mische, begrenze } from './util.js';
import {
  koernungTextur, asphaltTextur, ASPHALT_LAENGE, bankettTextur, BANKETT_LAENGE, mittellinienTextur, zielTextur,
  schotterTextur, SCHOTTER_LAENGE, SCHOTTER_U, fransenTextur, FRANSEN_LAENGE,
} from './pixel.js';

// Zusätzliche Landschaftsformen von Hand: grosse Hügel und Senken.
// radius = wie breit, hoehe = wie hoch (negativ = Senke).
// Berge hinter den Felswänden und Täler unter den Abhängen entstehen automatisch.
export const LANDSCHAFT = [
  { x: -260, z: -350, radius: 220, hoehe: 70 },   // Hügel westlich vom Tal
  { x: 330, z: -500, radius: 200, hoehe: 45 },    // Hügel östlich vom Tal
  { x: 250, z: -1330, radius: 190, hoehe: 70 },   // Hang über der Kehrengruppe
  { x: 1150, z: -1150, radius: 260, hoehe: -40 }, // Senke unter der Felswand 1
  { x: 1500, z: -1450, radius: 230, hoehe: 70 },  // Berg zwischen Pass und Abfahrt
];

export function baueWelt(szene, strecke, netz) {
  const welt = { netz };
  const g = CONFIG.gelaende;
  const f = CONFIG.farben;
  const koernung = koernungTextur();
  const { px, py, pz, tx, tz } = strecke;

  // Mittelpunkt und Ausdehnung der Strecke
  const box = strecke.box;
  const mitte = { x: (box.minX + box.maxX) / 2, z: (box.minZ + box.maxZ) / 2 };
  const ausdehnung = Math.hypot(box.maxX - box.minX, box.maxZ - box.minZ) / 2; // halbe Diagonale
  welt.mitte = mitte;
  welt.ausdehnung = ausdehnung;

  // Geländefläche: Streckenbox plus Rand, in Kacheln aufgeteilt
  const T = g.kachel;
  const X0 = Math.floor((box.minX - g.aussenRand) / T) * T, Z0 = Math.floor((box.minZ - g.aussenRand) / T) * T;
  const KX = Math.ceil((box.maxX + g.aussenRand - X0) / T), KZ = Math.ceil((box.maxZ + g.aussenRand - Z0) / T);

  // ---------------------------------------------------------------
  // Grobe Felder (alle 32 m): Abstand zur Strecke und Grundhöhe
  // (weich gemittelte Strassenhöhe, damit das Land zur Strasse passt)
  // ---------------------------------------------------------------
  const G = 32;
  const GX = Math.ceil((KX * T) / G) + 1, GZ = Math.ceil((KZ * T) / G) + 1;
  const feldAbstand = new Float32Array(GX * GZ), feldGrund = new Float32Array(GX * GZ);
  const feldIndex = new Int32Array(GX * GZ); // nächster Streckenpunkt (grob, für den Waldanteil in der Ferne)
  {
    const probe = [];
    for (let i = 0; i < strecke.anzahl; i += 8) probe.push(i);
    const s2 = g.grundWeite * g.grundWeite;
    let mittelH = 0;
    for (const i of probe) mittelH += py[i];
    mittelH /= probe.length;
    for (let j = 0; j < GZ; j++) {
      for (let k = 0; k < GX; k++) {
        const x = X0 + k * G, z = Z0 + j * G;
        let minD2 = Infinity, sw = 1e-4, sh = 1e-4 * mittelH, bestI = 0;
        for (const i of probe) {
          const dx = x - px[i], dz = z - pz[i];
          const d2 = dx * dx + dz * dz;
          if (d2 < minD2) { minD2 = d2; bestI = i; }
          const w = Math.exp(-d2 / s2);
          sw += w; sh += w * py[i];
        }
        feldAbstand[j * GX + k] = Math.sqrt(minD2);
        feldGrund[j * GX + k] = sh / sw;
        feldIndex[j * GX + k] = bestI;
      }
    }
  }
  function feld(arr, x, z) {
    const fx = begrenze((x - X0) / G, 0, GX - 1.001), fz = begrenze((z - Z0) / G, 0, GZ - 1.001);
    const k = Math.floor(fx), j = Math.floor(fz), ax = fx - k, az = fz - j;
    const a = arr[j * GX + k], b = arr[j * GX + k + 1], c = arr[(j + 1) * GX + k], d = arr[(j + 1) * GX + k + 1];
    return (a + (b - a) * ax) * (1 - az) + (c + (d - c) * ax) * az;
  }
  const fern = CONFIG.fernwald;
  // Grober Abstand zur Strecke (aus dem 32-m-Raster, auf wenige Meter genau)
  welt.streckeAbstand = (x, z) => feld(feldAbstand, x, z);
  // Nächster Streckenpunkt (Index), grob – reicht für den Waldanteil weit weg von der Strasse
  const naechsterIndex = (x, z) => {
    const k = begrenze(Math.round((x - X0) / G), 0, GX - 1), j = begrenze(Math.round((z - Z0) / G), 0, GZ - 1);
    return feldIndex[j * GX + k];
  };

  // Wie stark steht hier Wald? 0 = Wiese, 1 = dichter Tannenwald (Meilenstein 2b).
  // Dieselbe Rechnung wie bei den Tannen-Sprites (sprites.js, "verteile"): Waldstücke aus
  // Rauschen, dazu geschlossener Wald je nach Abschnitt (waldAnteil), mal Baumdichte.
  // Nur weich statt hart (für die Geländefarbe und die Fernbäume).
  // k = nächster Streckenpunkt (wenn bekannt, sonst grob aus dem Raster).
  // d = Abstand zur Strasse (nur für die Ferne): Die Talflanken sind bewaldeter als der Talboden an
  // der Strasse, darum steigt die Baumdichte weit weg auf "normal" (fernwald.dichteAb).
  welt.waldBei = function (x, z, k = naechsterIndex(x, z), d = 0) {
    const sd = CONFIG.sprites.seed;
    const stueck = glatt(0.5, 0.56, fbm(x / 140, z / 140, sd));
    const zu = glatt(-0.03, 0.03, fbm(x / 70, z / 70, sd + 9) - (1 - strecke.waldAnteil[k] * 0.75));
    const dichte = mische(Math.min(1, strecke.baumFaktor[k]), 1, glatt(fern.dichteAb[0], fern.dichteAb[1], d));
    return Math.max(stueck, zu) * dichte;
  };

  // Berge hinter den Felswänden und Täler unter den Abhängen (automatisch)
  const wandBerge = [];
  for (let i = 0; i < strecke.anzahl; i += 30) {
    const ws = strecke.wandSeite[i];
    if (!ws) continue;
    const rx = -tz[i], rz = tx[i], st = strecke.wandStaerke[i];
    wandBerge.push({ x: px[i] + rx * ws * 85, z: pz[i] + rz * ws * 85, r: 75, h: g.wandBerg * st, y: py[i] });
    wandBerge.push({ x: px[i] - rx * ws * 95, z: pz[i] - rz * ws * 95, r: 85, h: -g.talTiefe * st, y: py[i] });
  }

  // ---------------------------------------------------------------
  // Natürliche Landschaft (ohne Strasse)
  // ---------------------------------------------------------------
  function basisHoehe(x, z) {
    let h = feld(feldGrund, x, z);
    let berg = 0, tal = 0;
    for (const b of wandBerge) {
      const dx = x - b.x, dz = z - b.z, d2 = dx * dx + dz * dz;
      if (d2 > 9 * b.r * b.r) continue;
      const w = b.h * Math.exp(-d2 / (b.r * b.r));
      if (w > berg) berg = w;
      if (w < tal) tal = w;
    }
    h += berg + tal;
    for (const b of LANDSCHAFT) {
      const dx = x - b.x, dz = z - b.z;
      h += b.hoehe * Math.exp(-(dx * dx + dz * dz) / (b.radius * b.radius));
    }
    h += (fbm(x / 260, z / 260, g.seed) - 0.5) * 34;
    // weit weg von der Strecke steigt das Land an (liegt im Dunst)
    h += glatt(g.randAnstiegAb, g.randAnstiegBis, feld(feldAbstand, x, z)) * g.randHoehe;
    return h;
  }

  // Wie das Gelände neben einem Streckenpunkt aussieht (relativ zur Strasse).
  // lat = seitlicher Abstand (+ = rechts)
  const fw = CONFIG.felswand;
  function profil(i, lat, basis) {
    const a = Math.abs(lat);
    let p = Math.max(0, a - g.flachBis) * 0.1; // leicht ansteigende Böschung
    const ws = i < strecke.anzahl ? strecke.wandSeite[i] : 0; // Stummel: keine Felswand
    if (ws) {
      const st = strecke.wandStaerke[i];
      let spezial;
      if (Math.sign(lat) === ws) {
        // hinter der Felswand: steiler Berghang
        spezial = Math.min(48, Math.max(0, a - fw.abstand) * 1.25);
      } else {
        // Abhang ins Tal
        spezial = Math.max(basis - py[i] - 4, -Math.max(0, a - fw.abhangStart) * 1.5);
      }
      p = mische(p, spezial, st);
    }
    return p;
  }

  // Stützpunkte der Strecke (alle 3 m) in einem Raster, für die Glättung.
  // Seit M3a zählen auch die Stummel an den Nebenwegen mit (Index ab strecke.anzahl,
  // Daten in sp*: Lage, Höhe, Richtung; Stummel haben keine Felswand).
  const SIGMA = 30, RW = SIGMA * 3, R2 = RW * RW, SZ = 30;
  const SX = Math.ceil((KX * T) / SZ) + 1, SZN = Math.ceil((KZ * T) / SZ) + 1;
  const stuetzZellen = Array.from({ length: SX * SZN }, () => []);
  const spX = Array.from(px), spY = Array.from(py), spZ = Array.from(pz), spTX = Array.from(tx), spTZ = Array.from(tz);
  const stuetzen = [];
  for (let i = 0; i < strecke.anzahl; i += 3) stuetzen.push(i);
  for (const ast of netz ? netz.aeste : []) {
    for (let u = 3; u < ast.anzahl; u += 3) {
      stuetzen.push(spX.length);
      spX.push(ast.px[u]); spY.push(ast.py[u]); spZ.push(ast.pz[u]); spTX.push(ast.tx[u]); spTZ.push(ast.tz[u]);
    }
  }
  for (const i of stuetzen) {
    const cx = Math.floor((spX[i] - X0) / SZ), cz = Math.floor((spZ[i] - Z0) / SZ);
    if (cx >= 0 && cz >= 0 && cx < SX && cz < SZN) stuetzZellen[cz * SX + cx].push(i);
  }

  // ---------------------------------------------------------------
  // Höhe an einem Punkt: Strasse + Profil nahe der Strecke, sonst Landschaft
  // ---------------------------------------------------------------
  const q = {}, q2 = {};
  const ZONE = g.flachBis + g.uebergang + 6;
  function hoehe(x, z) {
    const basis = basisHoehe(x, z);
    // Gewichtetes Mittel: Strassenhöhe + Profil, je näher desto wichtiger
    let summeW = 0.04, summeH = 0.04 * basis, minD2 = Infinity;
    const cx = Math.floor((x - X0) / SZ), cz = Math.floor((z - Z0) / SZ);
    for (let jz = cz - 3; jz <= cz + 3; jz++) {
      if (jz < 0 || jz >= SZN) continue;
      for (let jx = cx - 3; jx <= cx + 3; jx++) {
        if (jx < 0 || jx >= SX) continue;
        const liste = stuetzZellen[jz * SX + jx];
        for (let k = 0; k < liste.length; k++) {
          const i = liste[k];
          const dx = x - spX[i], dz = z - spZ[i];
          const d2 = dx * dx + dz * dz;
          if (d2 < minD2) minD2 = d2;
          if (d2 > R2) continue;
          const w = Math.exp(-d2 / (SIGMA * SIGMA));
          const lat = dx * -spTZ[i] + dz * spTX[i];
          summeW += w;
          summeH += w * (spY[i] + profil(i, lat, basis));
        }
      }
    }
    const minD = Math.min(Math.sqrt(minD2), RW);
    let h = summeH / summeW;
    // kleine Hügel, nahe der Strasse schwächer
    h += (fbm(x / 55, z / 55, g.seed + 3) - 0.5) * 2 * g.huegelHoehe * glatt(10, 60, minD);
    if (minD < ZONE) {
      // ganz nahe: flach auf Strassenhöhe (nächste Strasse: Etappe oder Stummel)
      if (netz) netz.abfrage(x, z, q); else strecke.abfrage(x, z, q);
      // auf der Wandseite steigt es schnell an (dort steht die Felswand)
      const wandSeite = q.wandSeite && Math.sign(q.seite) === q.wandSeite;
      const uber = wandSeite ? mische(g.uebergang, 4, q.wandStaerke) : g.uebergang;
      const t = glatt(g.flachBis, g.flachBis + uber, q.abstand);
      h = mische(q.h - 0.3, h, t);
      // Liegt ein anderer Ast der Strecke nahe (z. B. die Kehre darüber)?
      // Dann dazwischen eine saubere Böschung von Strasse zu Strasse.
      if (netz ? netz.zweiteStrasse(x, z, q, 40, q2) : strecke.andererAst(x, z, q.s, 40, 40, q2)) {
        const e1 = Math.max(0, q.abstand - g.flachBis), e2 = Math.max(0, q2.abstand - g.flachBis);
        const rampe = mische(q.h, q2.h, glatt(0, 1, e1 / Math.max(1e-3, e1 + e2))) - 0.3;
        h = mische(h, rampe, 1 - glatt(12, 30, e1 + e2));
      } else if (!wandSeite) {
        // direkt neben der Strasse nicht zu steil ansteigen, sonst ragen die
        // groben Gelände-Dreiecke über den Strassenrand
        h = Math.min(h, q.h - 0.3 + Math.max(0, q.abstand - g.flachBis) * g.randSteigung);
      }
    }
    return h;
  }

  // ---------------------------------------------------------------
  // Kacheln: fein nahe der Strecke, gröber weiter weg
  // ---------------------------------------------------------------
  const kacheln = new Array(KX * KZ);
  for (let kz = 0; kz < KZ; kz++) {
    for (let kx = 0; kx < KX; kx++) {
      const d = feld(feldAbstand, X0 + (kx + 0.5) * T, Z0 + (kz + 0.5) * T) - T * 0.75;
      let schritt = 32;
      if (d < g.kernRand) schritt = g.raster;
      else if (d < g.mittelRand) schritt = g.raster * 2;
      else if (d < g.fernRand) schritt = g.raster * 4;
      kacheln[kz * KX + kx] = { schritt, n: T / schritt };
    }
  }
  const schrittBei = (kx, kz) =>
    kx < 0 || kz < 0 || kx >= KX || kz >= KZ ? 0 : kacheln[kz * KX + kx].schritt;

  // Höhen und Farben je Kachel berechnen
  const cGras = new THREE.Color(f.gras), cGrasD = new THREE.Color(f.grasDunkel);
  const cFels = new THREE.Color(f.fels), cFelsD = new THREE.Color(f.felsDunkel);
  const cErde = new THREE.Color(f.erde);
  const tmp = new THREE.Color();
  // Fernwald (M2b): weit weg von der Strasse wird das Gelände nach den Waldstücken eingefärbt
  const cWaldH = new THREE.Color(fern.waldFarbe), cWaldD = new THREE.Color(fern.waldDunkel), cWald = new THREE.Color();
  const cWiese = new THREE.Color(fern.wiesenFarbe), cGeroell = new THREE.Color(fern.geroellFarbe);
  const jitter = (x, z) => {
    let hsh = Math.imul(Math.round(x * 4), 73856093) ^ Math.imul(Math.round(z * 4), 19349663);
    hsh = Math.imul(hsh ^ (hsh >>> 13), 1274126177);
    return ((hsh >>> 0) / 4294967296);
  };
  let anzahlPunkte = 0;
  for (let kz = 0; kz < KZ; kz++) {
    for (let kx = 0; kx < KX; kx++) {
      const kach = kacheln[kz * KX + kx];
      const { schritt, n } = kach;
      const ox = X0 + kx * T, oz = Z0 + kz * T;
      // mit einem Ring Extra-Punkten rundherum (für die Steilheit am Rand)
      const P = n + 3;
      const roh = new Float32Array(P * P);
      for (let j = 0; j < P; j++) {
        for (let i = 0; i < P; i++) roh[j * P + i] = hoehe(ox + (i - 1) * schritt, oz + (j - 1) * schritt);
      }
      const N = n + 1;
      const hs = new Float32Array(N * N), farben = new Float32Array(N * N * 3);
      for (let j = 0; j < N; j++) {
        for (let i = 0; i < N; i++) {
          const r = (j + 1) * P + (i + 1);
          hs[j * N + i] = roh[r];
          const gx = (roh[r + 1] - roh[r - 1]) / (2 * schritt), gz = (roh[r + P] - roh[r - P]) / (2 * schritt);
          const ny = 1 / Math.sqrt(1 + gx * gx + gz * gz); // 1 = flach
          const x = ox + i * schritt, z = oz + j * schritt;
          const flecken = fbm(x / 23, z / 23, 99);
          tmp.copy(cGras).lerp(cGrasD, glatt(0.45, 0.62, flecken));
          if (ny < 0.86) tmp.lerp(cErde, glatt(0.86, 0.78, ny) * 0.8);
          if (ny < 0.76) tmp.copy(fbm(x / 9, z / 9, 7) > 0.5 ? cFels : cFelsD).lerp(cErde, glatt(0.62, 0.76, ny) * 0.5);
          // Fernwald: ab ca. 150 m neben der Strasse (dort stehen kaum noch Sprites) Wald dunkel,
          // Wiese etwas heller, ein paar Geröllflecken. Weicher Übergang, keine Kante.
          const dStrasse = feld(feldAbstand, x, z);
          const weit = fern.faerben ? glatt(fern.farbeAb[0], fern.farbeAb[1], dStrasse) : 0;
          if (weit > 0) {
            const w = welt.waldBei(x, z, naechsterIndex(x, z), dStrasse) * glatt(0.7, 0.8, ny); // auf steilem Fels kein Wald
            cWald.copy(cWaldH).lerp(cWaldD, glatt(0.4, 0.6, fbm(x / 18, z / 18, 41))); // fleckige Kronen
            tmp.lerp(cWiese, weit * (1 - w) * glatt(0.8, 0.9, ny) * fern.wiesenStaerke);
            tmp.lerp(cWald, weit * w * fern.waldStaerke);
            const geroell = glatt(fern.geroell, fern.geroell + 0.06, fbm(x / 45, z / 45, 77)) * glatt(0.95, 0.85, ny);
            tmp.lerp(cGeroell, weit * geroell * 0.7);
          }
          const jj = 0.94 + jitter(x, z) * 0.1;
          const k = (j * N + i) * 3;
          farben[k] = tmp.r * jj; farben[k + 1] = tmp.g * jj; farben[k + 2] = tmp.b * jj;
        }
      }
      kach.hs = hs; kach.farben = farben; kach.N = N; kach.ox = ox; kach.oz = oz;
      anzahlPunkte += N * N;
    }
  }
  // Ränder an gröbere Nachbarkacheln angleichen (sonst entstehen Ritzen)
  for (let kz = 0; kz < KZ; kz++) {
    for (let kx = 0; kx < KX; kx++) {
      const kach = kacheln[kz * KX + kx];
      const { hs, N, schritt } = kach;
      const raender = [
        [schrittBei(kx, kz - 1), (t) => t],                 // oben (j = 0)
        [schrittBei(kx, kz + 1), (t) => (N - 1) * N + t],   // unten
        [schrittBei(kx - 1, kz), (t) => t * N],             // links (i = 0)
        [schrittBei(kx + 1, kz), (t) => t * N + N - 1],     // rechts
      ];
      for (const [nachbar, idx] of raender) {
        if (nachbar <= schritt) continue;
        const v = nachbar / schritt;
        for (let t = 0; t < N; t++) {
          const r = t % v;
          if (!r) continue;
          const a = hs[idx(t - r)], b = hs[idx(t - r + v)];
          hs[idx(t)] = a + ((b - a) * r) / v;
        }
      }
    }
  }
  welt.gelaendePunkte = anzahlPunkte;

  // Höhe an beliebiger Stelle (genau wie die gezeichneten Dreiecke)
  welt.gelaendeHoehe = function (x, z) {
    const kx = begrenze(Math.floor((x - X0) / T), 0, KX - 1), kz = begrenze(Math.floor((z - Z0) / T), 0, KZ - 1);
    const kach = kacheln[kz * KX + kx];
    const { hs, N, schritt } = kach;
    const lx = begrenze((x - kach.ox) / schritt, 0, N - 1.0001), lz = begrenze((z - kach.oz) / schritt, 0, N - 1.0001);
    const i = Math.floor(lx), j = Math.floor(lz), fx = lx - i, fz = lz - j;
    const h00 = hs[j * N + i], h10 = hs[j * N + i + 1];
    const h01 = hs[(j + 1) * N + i], h11 = hs[(j + 1) * N + i + 1];
    if (fx >= fz) return h00 + fx * (h10 - h00) + fz * (h11 - h10);
    return h00 + fz * (h01 - h00) + fx * (h11 - h01);
  };
  // Höhe des groben Geländes (32 m), das weit weg von der Kamera gezeichnet wird (M2b, für Fernbäume)
  welt.gelaendeHoeheGrob = function (x, z) {
    const kx = begrenze(Math.floor((x - X0) / T), 0, KX - 1), kz = begrenze(Math.floor((z - Z0) / T), 0, KZ - 1);
    const kach = kacheln[kz * KX + kx];
    const { hs, N, schritt } = kach;
    const v = Math.max(1, 32 / schritt), M = (N - 1) / v + 1, S = schritt * v;
    const lx = begrenze((x - kach.ox) / S, 0, M - 1.0001), lz = begrenze((z - kach.oz) / S, 0, M - 1.0001);
    const i = Math.floor(lx), j = Math.floor(lz), fx = lx - i, fz = lz - j;
    const h = (a, b) => hs[b * v * N + a * v];
    const h00 = h(i, j), h10 = h(i + 1, j), h01 = h(i, j + 1), h11 = h(i + 1, j + 1);
    if (fx >= fz) return h00 + fx * (h10 - h00) + fz * (h11 - h10);
    return h00 + fz * (h01 - h00) + fx * (h11 - h01);
  };

  // ---------------------------------------------------------------
  // Gelände-Mesh: mehrere Kacheln zu einem Stück zusammengefasst.
  // Jedes Stück gibt es zweimal: fein und ganz grob (32 m). Weiter weg als
  // der Dunst reicht, wird nur das grobe gezeichnet (spart viel Arbeit).
  // ---------------------------------------------------------------
  const gelaendeMat = new THREE.MeshLambertMaterial({ vertexColors: true, map: koernung, flatShading: true });
  const STUECK = g.stueck;
  const GROB = 32;
  const gelaende = new THREE.Group();
  const stuecke = [];
  let dreiecke = 0;
  function baueStueck(sx, sz, grob) {
    const pos = [], col = [], uv = [], idx = [];
    for (let kz = sz; kz < Math.min(KZ, sz + STUECK); kz++) {
      for (let kx = sx; kx < Math.min(KX, sx + STUECK); kx++) {
        const { hs, farben, N, schritt, ox, oz } = kacheln[kz * KX + kx];
        const v = grob ? Math.max(1, GROB / schritt) : 1; // nur jeden v-ten Punkt nehmen
        const M = (N - 1) / v + 1;
        const basisIdx = pos.length / 3;
        for (let j = 0; j < M; j++) {
          for (let i = 0; i < M; i++) {
            const x = ox + i * v * schritt, z = oz + j * v * schritt, k = j * v * N + i * v;
            pos.push(x, hs[k], z);
            col.push(farben[k * 3], farben[k * 3 + 1], farben[k * 3 + 2]);
            uv.push(x / 6, z / 6);
          }
        }
        for (let j = 0; j < M - 1; j++) {
          for (let i = 0; i < M - 1; i++) {
            const a = basisIdx + j * M + i, b = a + 1, c = a + M, d = c + 1;
            idx.push(a, d, b, a, c, d);
          }
        }
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geo.setIndex(idx);
    geo.computeBoundingSphere();
    if (!grob) dreiecke += idx.length / 3;
    return new THREE.Mesh(geo, gelaendeMat);
  }
  for (let sz = 0; sz < KZ; sz += STUECK) {
    for (let sx = 0; sx < KX; sx += STUECK) {
      const fein = baueStueck(sx, sz, false), grob = baueStueck(sx, sz, true);
      grob.visible = false;
      gelaende.add(fein, grob);
      stuecke.push({
        fein, grob,
        minX: X0 + sx * T, maxX: X0 + Math.min(KX, sx + STUECK) * T,
        minZ: Z0 + sz * T, maxZ: Z0 + Math.min(KZ, sz + STUECK) * T,
      });
    }
  }
  szene.add(gelaende);
  welt.gelaendeDreiecke = dreiecke;

  // Jedes Bild: nahe Stücke fein, ferne grob zeigen
  const detailBis = g.feinBis;
  welt.aktualisiere = function (kamPos) {
    for (const st of stuecke) {
      const dx = Math.max(st.minX - kamPos.x, 0, kamPos.x - st.maxX);
      const dz = Math.max(st.minZ - kamPos.z, 0, kamPos.z - st.maxZ);
      const nah = dx * dx + dz * dz < detailBis * detailBis;
      st.fein.visible = nah;
      st.grob.visible = !nah;
    }
  };

  // ---------------------------------------------------------------
  // Strasse als Bänder entlang der Strecke: Asphalt, Schotter (seit M3a), zwei Bankette
  // und die Mittellinie, jedes mit eigener Textur (bleibt in der Ferne grau).
  // Seit M3a gibt es mehrere "Wege": die Etappe (je Belag in Stücke geteilt) und die
  // Stummel an den Nebenwegen. Wo sich zwei überlagern (Kreuzung), liegt Asphalt oben
  // (polygonOffset), Schotter darunter, Bankett zuunterst.
  // ---------------------------------------------------------------
  const s = CONFIG.strasse;
  const halb = s.breite / 2, aussen = halb + s.bankett;
  const BL = CONFIG.belaege;
  const aeste = netz ? netz.aeste : [];
  // Ein Weg: Punkte (px, py, pz, tx, tz), Texturlänge v(i) in Metern
  const etappeWeg = { px, py, pz, tx, tz, v: (i) => strecke.s[i] };
  const astWege = aeste.map((ast) => ({ ...ast, v: (u) => ast.sJ + ast.richtung * u }));
  // Zusammenhängende Stücke der Etappe mit diesem Belag
  function etappeStuecke(belag) {
    const liste = [];
    const n = strecke.anzahl;
    let start = -1;
    for (let i = 0; i <= n; i++) {
      const an = i < n && (netz ? netz.belag[i] : 'asphalt') === belag;
      if (an && start < 0) start = i;
      // Asphalt überlappt die Nachbarstücke um einen Punkt (liegt oben), die anderen stossen nur an
      const plus = belag === 'asphalt' ? 1 : 0;
      if (!an && start >= 0) { liste.push({ von: Math.max(0, start - plus), bis: Math.min(n - 1, i - 1 + plus) }); start = -1; }
    }
    return liste;
  }

  // Liegt ein Punkt einer Kreuzung auf dem Asphalt eines Stummels / auf dem Schotter der Etappe?
  // Dann wird ein Band, das darunter liegen soll, dort ein paar cm abgesenkt (kein Flimmern).
  const qa = {}, qk = {};
  function unterAsphalt(x, z, y) {
    for (const ast of aeste) {
      const w = netz.stummelAbfrage(ast, x, z, 10, qa);
      if (w && w.s >= -0.2 && w.s <= ast.laenge && Math.abs(w.seite) < ast.halb + 0.15) y = Math.min(y, w.h - CONFIG.kreuzung.unterAsphalt);
    }
    return y;
  }
  function unterSchotter(x, z, y) {
    strecke.abfrage(x, z, qk);
    if (qk.abstand < 12 && netz.belag[qk.i] !== 'asphalt' && Math.abs(qk.seite) < netz.halbBei(qk.s) + 0.15) y = Math.min(y, qk.h - 0.06);
    return y;
  }
  // Bankett der Etappe in der abgerundeten Ecke einer Einfahrt: liegt unter dem Schotter der Ecke
  // (M3a.1, sonst schauen braune Fetzen durch). Auch knapp daneben (die Kante der Ecke ist die
  // innere Kante des Banketts).
  function unterAsphaltOderEcke(x, z, y) {
    y = unterAsphalt(x, z, y);
    for (const [dx, dz] of [[0, 0], [0.3, 0], [-0.3, 0], [0, 0.3], [0, -0.3]]) {
      if (netz.inEcke(x + dx, z + dz)) return y - CONFIG.kreuzung.unterAsphalt;
    }
    return y;
  }
  const nahKreuzung = (x, z) => aeste.some((ast) => Math.hypot(x - ast.px[0], z - ast.pz[0]) < 75);

  // Baut ein Band aus Teilen. Teil: { weg, von, bis, quer, anpassen }. quer = Liste von Streifen,
  // jeder Streifen = Liste von Querpunkten { lat (Abstand zur Mitte, + = rechts), dy (Höhe), u (Textur quer) }.
  // vLaenge = so viele Meter entspricht eine Texturlänge.
  function baueBand(teile, vLaenge, extra) {
    const pos = [], uv = [], seiteAttr = [], rechtsAttr = [], idx = [];
    for (const { weg, von, bis, quer, anpassen } of teile) {
      for (const streifen of quer) {
        const m = streifen.length, basis = pos.length / 3;
        for (let i = von; i <= bis; i++) {
          const rx = -weg.tz[i], rz = weg.tx[i];
          for (let c = 0; c < m; c++) {
            const x = weg.px[i] + rx * streifen[c].lat, z = weg.pz[i] + rz * streifen[c].lat;
            // Stummel nahe der Kreuzung: jeder Punkt auf Höhe der Etappe (M3a.1, netz.js)
            let y = (weg.hoeheBei && i < weg.angleichenBis ? weg.hoeheBei(x, z, i, weg.pyEigen[i]) : weg.py[i]) + streifen[c].dy;
            if (anpassen && nahKreuzung(x, z)) y = anpassen(x, z, y);
            pos.push(x, y, z);
            uv.push(streifen[c].u, weg.v(i) / vLaenge);
            if (extra) { seiteAttr.push(Math.sign(streifen[c].lat)); rechtsAttr.push(rx, 0, rz); }
          }
        }
        for (let i = 0; i < bis - von; i++) {
          for (let c = 0; c < m - 1; c++) {
            const a = basis + i * m + c, b = a + 1, cc = a + m, d = cc + 1;
            idx.push(a, b, cc, b, d, cc);
          }
        }
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    if (extra) {
      geo.setAttribute('aSeite', new THREE.Float32BufferAttribute(seiteAttr, 1));
      geo.setAttribute('aRechts', new THREE.Float32BufferAttribute(rechtsAttr, 3));
    }
    geo.setIndex(idx);
    geo.computeVertexNormals();
    return geo;
  }
  const versatz = (f, u) => ({ polygonOffset: true, polygonOffsetFactor: f, polygonOffsetUnits: u });
  const asphaltStuecke = etappeStuecke('asphalt');
  const astTeil = (ast, quer, anpassen) => ({ weg: ast, von: 0, bis: ast.anzahl - 1, quer, anpassen });

  // Asphalt (Etappe + Stummel)
  const asphaltQuer = [[{ lat: -halb, dy: 0, u: 0 }, { lat: halb, dy: 0, u: 1 }]];
  szene.add(new THREE.Mesh(
    baueBand([
      ...asphaltStuecke.map((st) => ({ weg: etappeWeg, ...st, quer: asphaltQuer })),
      ...astWege.map((w) => astTeil(w, asphaltQuer)),
    ], ASPHALT_LAENGE),
    new THREE.MeshLambertMaterial({ map: asphaltTextur(f), ...versatz(-2, -4) }),
  ));
  // Schotter (Nebenwege der Etappe) und die abgerundeten Ecken der Einfahrten
  const schotterStuecke = etappeStuecke('schotter');
  if (schotterStuecke.length) {
    const hs = BL.schotter.breite / 2;
    // quer in mehrere Streifen geteilt (M3a.1): So wird der Schotter unter dem Asphalt der
    // Stummel Punkt für Punkt abgesenkt und schaut nirgends durch den Asphalt (auch nicht aus der Nähe)
    const K = CONFIG.kreuzung.schotterStreifen;
    const schotterQuer = [Array.from({ length: K + 1 }, (_, k) => ({ lat: -hs + (2 * hs * k) / K, dy: 0, u: (SCHOTTER_U * k) / K }))];
    const geo = baueBand(schotterStuecke.map((st) => ({ weg: etappeWeg, ...st, quer: schotterQuer, anpassen: unterAsphalt })), SCHOTTER_LAENGE);
    // Ecken: Fläche aus netz.js (folgt der gebogenen Kante der Etappe), Textur ohne Fahrspuren
    const pos = Array.from(geo.attributes.position.array), uv = Array.from(geo.attributes.uv.array), idx = Array.from(geo.index.array);
    for (const ast of aeste) {
      const m = ast.muendung;
      if (!m) continue;
      const basis = pos.length / 3;
      const ux = ast.tx[0], uz = ast.tz[0];
      for (const p of m.punkte) {
        pos.push(p.x, p.h + 0.005, p.z);
        // Textur: quer zum Stummel = u (im Teil ohne Fahrspuren), längs = v
        const quer = Math.abs((p.x - m.c.x) * -uz + (p.z - m.c.z) * ux);
        // (2 Pixel Abstand zum Weg-Teil der Textur: sonst mischt der Filter dessen braunen Rand hinein)
        const u0 = SCHOTTER_U + 2 / 48, u1 = 1 - 1 / 48;
        uv.push(u0 + (u1 - u0) * Math.min(1, quer / (CONFIG.kreuzung.eckRadius + 1)), ((p.x - m.c.x) * ux + (p.z - m.c.z) * uz) / SCHOTTER_LAENGE);
      }
      for (const [a0, b0, c0] of m.dreiecke) {
        // Drehsinn so, dass die Fläche nach oben schaut
        const a = m.punkte[a0], b = m.punkte[b0], c = m.punkte[c0];
        const oben = (b.x - a.x) * (c.z - a.z) - (b.z - a.z) * (c.x - a.x) < 0;
        if (oben) idx.push(basis + a0, basis + b0, basis + c0); else idx.push(basis + a0, basis + c0, basis + b0);
      }
    }
    const g2 = new THREE.BufferGeometry();
    g2.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g2.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g2.setIndex(idx);
    g2.computeVertexNormals();
    szene.add(new THREE.Mesh(g2, new THREE.MeshLambertMaterial({ map: schotterTextur(f), ...versatz(-1.5, -3) })));
  }
  // Ausfransen: an der Einfahrt hört der Asphalt nicht mit einer harten Kante auf, sondern
  // franst in den Schotter aus (schmaler Streifen mit Löchern, entlang der Asphaltkante)
  if (aeste.some((a) => a.muendung)) {
    const fr = CONFIG.kreuzung.fransen;
    const teile = [];
    for (const ast of astWege) {
      const m = ast.muendung;
      if (!m) continue;
      const sd = m.seiteN;
      const quer = sd > 0
        ? [[{ lat: ast.halb - 0.3, dy: 0, u: 0 }, { lat: ast.halb + fr, dy: 0, u: 1 }]]
        : [[{ lat: -ast.halb - fr, dy: 0, u: 1 }, { lat: -ast.halb + 0.3, dy: 0, u: 0 }]];
      teile.push({ weg: ast, von: 1, bis: Math.min(ast.anzahl - 1, Math.round(m.uP1)), quer, anpassen: (x, z, y) => y + 0.004 });
    }
    szene.add(new THREE.Mesh(baueBand(teile, FRANSEN_LAENGE),
      new THREE.MeshLambertMaterial({ map: fransenTextur(f), alphaTest: 0.5, ...versatz(-2.25, -4.5) })));  // über dem Asphalt (deckt dessen dunklen Rand)
  }
  // Bankett links und rechts (fällt nach aussen leicht ab), Breite je Belag
  {
    const bankQuer = (h) => [
      [{ lat: -h - s.bankett, dy: -0.35, u: 0 }, { lat: -h, dy: 0, u: 1 }],
      [{ lat: h, dy: 0, u: 1 }, { lat: h + s.bankett, dy: -0.35, u: 0 }],
    ];
    const teile = [];
    for (const [belag, stuecke] of [['asphalt', asphaltStuecke], ['schotter', schotterStuecke]]) {
      for (const st of stuecke) teile.push({ weg: etappeWeg, ...st, quer: bankQuer(BL[belag].breite / 2), anpassen: unterAsphaltOderEcke });
    }
    // Stummel: auf der Seite des Nebenwegs erst nach der Einfahrt (dort liegt Schotter)
    for (const w of astWege) {
      const [links, rechts] = bankQuer(halb);
      const ab = w.muendung ? Math.min(w.anzahl - 2, Math.round(w.muendung.uP1)) : 0;
      teile.push({ weg: w, von: w.muendung && w.muendung.seiteN < 0 ? ab : 0, bis: w.anzahl - 1, quer: [links], anpassen: unterSchotter });
      teile.push({ weg: w, von: w.muendung && w.muendung.seiteN > 0 ? ab : 0, bis: w.anzahl - 1, quer: [rechts], anpassen: unterSchotter });
    }
    szene.add(new THREE.Mesh(baueBand(teile, BANKETT_LAENGE),
      new THREE.MeshLambertMaterial({ map: bankettTextur(f), ...versatz(-1, -2) })));
  }
  // Mittellinie: schmaler Streifen, nur auf Asphalt (Etappe + Stummel). In der Ferne wird er
  // etwas breiter gezeichnet (mind. mittellinieMinPixel Bildpunkte), damit er nicht
  // zwischen den groben Pixeln verschwindet und flimmert.
  {
    const lb = s.mittellinieBreite / 2;
    const linieQuer = [[{ lat: -lb, dy: 0, u: 0 }, { lat: lb, dy: 0, u: 1 }]];
    const teile = [];
    for (const [belag, stuecke] of [['asphalt', asphaltStuecke], ['schotter', schotterStuecke]]) {
      if (BL[belag].mittellinie) for (const st of stuecke) teile.push({ weg: etappeWeg, ...st, quer: linieQuer });
    }
    for (const w of astWege) teile.push(astTeil(w, linieQuer));
    const geo = baueBand(teile, s.abstandMittellinie, true);
    const mat = new THREE.MeshLambertMaterial({
      map: mittellinienTextur(f, s.mittellinieStrich / s.abstandMittellinie),
      transparent: true, depthWrite: false,
      ...versatz(-2.5, -5),
    });
    const pixelWinkel = (2 * Math.tan((CONFIG.kamera.sichtfeld * Math.PI) / 360)) / CONFIG.bild.hoehe;
    mat.onBeforeCompile = (shader) => {
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nattribute float aSeite;\nattribute vec3 aRechts;')
        .replace('#include <begin_vertex>', `#include <begin_vertex>
          float linieSoll = distance(cameraPosition, transformed) * ${pixelWinkel.toFixed(6)} * ${s.mittellinieMinPixel.toFixed(2)};
          transformed += aRechts * aSeite * max(0.0, linieSoll - ${s.mittellinieBreite.toFixed(3)}) * 0.5;`);
    };
    szene.add(new THREE.Mesh(geo, mat));
  }

  // Start- und Ziellinie (Schachbrett quer über die Strasse)
  const zielTex = zielTextur();
  for (const sLinie of [strecke.startS, strecke.zielS]) {
    const p = strecke.punktBei(sLinie);
    const geo = new THREE.PlaneGeometry(s.breite, 1.5);
    geo.rotateX(-Math.PI / 2);
    const mat = new THREE.MeshLambertMaterial({ map: zielTex, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -6 });
    const m = new THREE.Mesh(geo, mat);
    m.position.set(p.x, p.h + 0.02, p.z);
    m.rotation.y = Math.atan2(p.tx, p.tz);
    szene.add(m);
  }

  // ---------------------------------------------------------------
  // Felswand: zerklüfteter Block neben der Strasse
  // ---------------------------------------------------------------
  {
    const rndW = zufall(321);
    const pos = [], col = [], uv = [], idx = [];
    const cF = new THREE.Color(f.fels), cD = new THREE.Color(f.felsDunkel);
    let reiheVorher = -1;
    const PRO = 5; // Punkte pro Querschnitt
    for (let i = 0; i < strecke.anzahl; i += 2) {
      const ws = strecke.wandSeite[i];
      if (!ws) { reiheVorher = -1; continue; }
      const st = strecke.wandStaerke[i];
      const H = fw.hoehe * (0.85 + rndW() * 0.3);
      const j1 = (rndW() - 0.5) * 0.8, j2 = (rndW() - 0.5) * 1.4, j3 = (rndW() - 0.5) * 2;
      const querschnitt = [
        [fw.abstand - 0.2, -1.5],
        [fw.abstand + 0.5 + j1, mische(-2, H * 0.45, st)],
        [fw.abstand + 1.5 + j2, mische(-2, H, st)],
        [fw.abstand + 6 + j3, mische(-2, H + 2.5 + j3, st)],
        [22, -4],
      ];
      const ox = -strecke.tz[i] * ws, oz = strecke.tx[i] * ws; // nach aussen (zur Wand)
      const basisIdx = pos.length / 3;
      for (const [l, y] of querschnitt) {
        pos.push(strecke.px[i] + ox * l, strecke.py[i] + y, strecke.pz[i] + oz * l);
        const c = (rndW() < 0.5 ? cF : cD).clone().multiplyScalar(0.9 + rndW() * 0.2);
        col.push(c.r, c.g, c.b);
        uv.push(strecke.s[i] / 5, y / 5);
      }
      if (reiheVorher >= 0) {
        for (let c = 0; c < PRO - 1; c++) {
          const a = reiheVorher + c, b = a + 1, cc = basisIdx + c, d = cc + 1;
          idx.push(a, b, cc, b, d, cc);
        }
      }
      reiheVorher = basisIdx;
    }
    if (idx.length) {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
      geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
      geo.setIndex(idx);
      const mat = new THREE.MeshLambertMaterial({ vertexColors: true, map: koernung, flatShading: true, side: THREE.DoubleSide });
      szene.add(new THREE.Mesh(geo, mat));
    }
  }

  // ---------------------------------------------------------------
  // Hintergrundberge: Kranz aus Low-Poly-Bergen mit Schneekappen
  // ---------------------------------------------------------------
  {
    const b = CONFIG.berge;
    const rndB = zufall(b.seed);
    const pos = [], col = [], dunst = [];
    const cFels = new THREE.Color(f.bergFels), cSchnee = new THREE.Color(f.schnee), cFuss = new THREE.Color(f.bergFuss);
    // Wie viel Dunst auf einem Punkt liegt: oben wenig, zum Fuss hin mehr.
    // Wird erst nach dem Licht beigemischt (wie der Nebel auf dem Gelände),
    // darum hat der Bergfuss genau die Farbe des fernen Geländes.
    const dunstAnteil = (y, H) => begrenze(CONFIG.nebel.bergDunst + CONFIG.nebel.bergDunstUnten * (1 - y / H), 0, CONFIG.nebel.maxDichte);
    // Ein Berg: Ringe von unten nach oben, oben eine Spitze
    function berg(cx, cz, H, fuss) {
      const seiten = 6 + Math.floor(rndB() * 3);
      const ringe = [
        { y: -120, r: fuss },
        { y: H * (0.3 + rndB() * 0.1), r: fuss * (0.55 + rndB() * 0.1) },
        { y: H * (0.62 + rndB() * 0.1), r: fuss * (0.26 + rndB() * 0.08) },
      ];
      const dreh = rndB() * Math.PI;
      const ringPunkte = ringe.map((ring) => {
        const p = [];
        for (let k = 0; k < seiten; k++) {
          const w = dreh + (k / seiten) * Math.PI * 2 + (rndB() - 0.5) * 0.4;
          const rr = ring.r * (0.7 + rndB() * 0.55);
          p.push(new THREE.Vector3(cx + Math.cos(w) * rr, ring.y + (rndB() - 0.5) * H * 0.1, cz + Math.sin(w) * rr));
        }
        return p;
      });
      const gipfel = new THREE.Vector3(cx + (rndB() - 0.5) * fuss * 0.25, H, cz + (rndB() - 0.5) * fuss * 0.25);
      const schneeY = H * b.schneeAb;
      const dreieck = (a, bb, c) => {
        pos.push(a.x, a.y, a.z, bb.x, bb.y, bb.z, c.x, c.y, c.z);
        const my = (a.y + bb.y + c.y) / 3;
        const maxY = Math.max(a.y, bb.y, c.y);
        const schnee = my > schneeY + (rndB() - 0.5) * H * 0.15 || (maxY >= H - 1 && rndB() < 0.8);
        // unten bewaldet (grün), nach oben Fels
        const farbe = schnee
          ? cSchnee.clone().multiplyScalar(1.35) // Schnee soll leuchten
          : cFuss.clone().lerp(cFels, glatt(0, b.fussBis, my / H)).multiplyScalar(0.8 + rndB() * 0.3);
        for (let k = 0; k < 3; k++) col.push(farbe.r, farbe.g, farbe.b);
        // Schnee bekommt weniger Dunst, damit die Gipfel weiss bleiben
        for (const p of [a, bb, c]) dunst.push(dunstAnteil(p.y, H) * (schnee ? 0.3 : 1));
      };
      for (let ri = 0; ri < ringPunkte.length; ri++) {
        const unten = ringPunkte[ri], oben = ringPunkte[ri + 1];
        for (let k = 0; k < seiten; k++) {
          const k2 = (k + 1) % seiten;
          if (oben) {
            dreieck(unten[k], oben[k], unten[k2]);
            dreieck(unten[k2], oben[k], oben[k2]);
          } else {
            dreieck(unten[k], gipfel, unten[k2]);
          }
        }
      }
    }
    // zwei Reihen: hinten hohe Gipfel, vorne niedrigere Vorberge
    // Abstand vom Streckenmittelpunkt: wächst mit der Grösse der Strecke,
    // damit die Berge immer hinter dem Gelände stehen
    const basisR = ausdehnung + g.aussenRand * 1.45;
    for (const reihe of [{ r: 1, h: 1, n: b.anzahl }, { r: 0.8, h: 0.55, n: Math.round(b.anzahl * 0.7) }]) {
      for (let n = 0; n < reihe.n; n++) {
        const winkel = (n / reihe.n) * Math.PI * 2 + (rndB() - 0.5) * 0.12;
        const r = (basisR + mische(b.abstand[0], b.abstand[1], rndB())) * reihe.r;
        // grössere Entfernung = etwas höhere Berge (damit sie gleich gross wirken)
        const H = mische(b.hoehe[0], b.hoehe[1], rndB()) * reihe.h * (r / reihe.r / b.bezugsAbstand);
        berg(mitte.x + Math.cos(winkel) * r, mitte.z + Math.sin(winkel) * r, H, H * (0.75 + rndB() * 0.35));
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    geo.setAttribute('aDunst', new THREE.Float32BufferAttribute(dunst, 1));
    geo.computeVertexNormals();
    // Statt des normalen Nebels (die Berge sind zu weit weg, sie wären ganz im
    // Dunst) eigener Dunst pro Punkt, in derselben Nebelfarbe.
    const mat = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true, fog: true, side: THREE.DoubleSide });
    mat.onBeforeCompile = (shader) => {
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nattribute float aDunst;\nvarying float vDunst;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvDunst = aDunst;');
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', '#include <common>\nvarying float vDunst;')
        .replace('#include <fog_fragment>', 'gl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor, vDunst);');
    };
    const berge = new THREE.Mesh(geo, mat);
    berge.frustumCulled = false;
    szene.add(berge);
  }

  // ---------------------------------------------------------------
  // Himmel: Kuppel mit Farbverlauf (Dunst unten, Blau oben)
  // ---------------------------------------------------------------
  {
    const geo = new THREE.SphereGeometry(CONFIG.kamera.sichtweite * 0.8, 24, 16);
    const p = geo.attributes.position;
    const col = new Float32Array(p.count * 3);
    const oben = new THREE.Color(f.himmelOben), dunst = new THREE.Color(f.dunst), c = new THREE.Color();
    for (let i = 0; i < p.count; i++) {
      const y = p.getY(i) / (CONFIG.kamera.sichtweite * 0.8);
      c.copy(dunst).lerp(oben, Math.pow(glatt(-0.02, 0.45, y), 0.7));
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const mat = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false });
    const himmel = new THREE.Mesh(geo, mat);
    himmel.renderOrder = -1;
    himmel.frustumCulled = false;
    szene.add(himmel);
    welt.himmel = himmel;
  }

  // ---------------------------------------------------------------
  // Boden unter dem Auto: Strasse genau, sonst Gelände
  // ---------------------------------------------------------------
  // Seit M3a: Etappe (Asphalt oder Schotter je Abschnitt), Stummel (Asphalt) und die
  // abgerundeten Ecken der Einfahrten (Schotter). Asphalt geht vor Schotter vor Bankett.
  const qb = {}, qs2 = {};
  const kreuzungen = aeste.map((ast) => ({ x: ast.px[0], z: ast.pz[0] }));
  welt.bodenBei = function (x, z, abfrage) {
    const a = abfrage || strecke.abfrage(x, z, qb);
    let art = null, h = 0, rang = 9;
    const seite = Math.abs(a.seite);
    if (a.abstand <= aussen && a.s > 0.5 && a.s < strecke.laenge - 0.5) {
      const belag = netz ? netz.belag[a.i] : 'asphalt';
      const hb = netz ? netz.halbBei(a.s) : halb;
      if (seite <= hb) { art = belag; h = a.h; rang = belag === 'asphalt' ? 0 : 1; } else if (seite <= hb + s.bankett) {
        art = 'bankett'; h = a.h - ((seite - hb) / s.bankett) * 0.35; rang = 2;
      }
    }
    if (rang > 0 && kreuzungen.some((k) => Math.abs(x - k.x) < 260 && Math.abs(z - k.z) < 260)) {
      for (const ast of aeste) {
        const w = netz.stummelAbfrage(ast, x, z, aussen, qs2);
        if (!w || w.s < 0 || w.s > ast.laenge) continue;
        const ws = Math.abs(w.seite);
        if (ws <= ast.halb) { art = 'asphalt'; h = w.h; rang = 0; break; }
        if (ws <= ast.halb + s.bankett && rang > 2) { art = 'bankett'; h = w.h - ((ws - ast.halb) / s.bankett) * 0.35; rang = 2; }
      }
      if (rang > 1) {
        const e = netz.inEcke(x, z);
        if (e) { art = 'schotter'; h = e.h; rang = 1; }
      }
    }
    if (art) return { h, art };
    return { h: welt.gelaendeHoehe(x, z), art: 'gras' };
  };

  return welt;
}
