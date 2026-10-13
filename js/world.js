// Die Welt: Gelände, Strasse, Felswand, Hintergrundberge, Himmel.
// Alles richtet sich nach der Strecke (Mittelpunkt, Ausdehnung, Höhen),
// damit die Welt mitwächst, wenn die Strecke länger wird.

import * as THREE from 'three';
import { CONFIG } from './config.js';
import { zufall, fbm, glatt, mische, begrenze } from './util.js';
import {
  koernungTextur, asphaltTextur, ASPHALT_LAENGE, bankettTextur, BANKETT_LAENGE, mittellinienTextur, zielTextur,
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

export function baueWelt(szene, strecke) {
  const welt = {};
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
        let minD2 = Infinity, sw = 1e-4, sh = 1e-4 * mittelH;
        for (const i of probe) {
          const dx = x - px[i], dz = z - pz[i];
          const d2 = dx * dx + dz * dz;
          if (d2 < minD2) minD2 = d2;
          const w = Math.exp(-d2 / s2);
          sw += w; sh += w * py[i];
        }
        feldAbstand[j * GX + k] = Math.sqrt(minD2);
        feldGrund[j * GX + k] = sh / sw;
      }
    }
  }
  function feld(arr, x, z) {
    const fx = begrenze((x - X0) / G, 0, GX - 1.001), fz = begrenze((z - Z0) / G, 0, GZ - 1.001);
    const k = Math.floor(fx), j = Math.floor(fz), ax = fx - k, az = fz - j;
    const a = arr[j * GX + k], b = arr[j * GX + k + 1], c = arr[(j + 1) * GX + k], d = arr[(j + 1) * GX + k + 1];
    return (a + (b - a) * ax) * (1 - az) + (c + (d - c) * ax) * az;
  }

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
    const ws = strecke.wandSeite[i];
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

  // Stützpunkte der Strecke (alle 3 m) in einem Raster, für die Glättung
  const SIGMA = 30, RW = SIGMA * 3, R2 = RW * RW, SZ = 30;
  const SX = Math.ceil((KX * T) / SZ) + 1, SZN = Math.ceil((KZ * T) / SZ) + 1;
  const stuetzZellen = Array.from({ length: SX * SZN }, () => []);
  for (let i = 0; i < strecke.anzahl; i += 3) {
    const cx = Math.floor((px[i] - X0) / SZ), cz = Math.floor((pz[i] - Z0) / SZ);
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
          const dx = x - px[i], dz = z - pz[i];
          const d2 = dx * dx + dz * dz;
          if (d2 < minD2) minD2 = d2;
          if (d2 > R2) continue;
          const w = Math.exp(-d2 / (SIGMA * SIGMA));
          const lat = dx * -tz[i] + dz * tx[i];
          summeW += w;
          summeH += w * (py[i] + profil(i, lat, basis));
        }
      }
    }
    const minD = Math.min(Math.sqrt(minD2), RW);
    let h = summeH / summeW;
    // kleine Hügel, nahe der Strasse schwächer
    h += (fbm(x / 55, z / 55, g.seed + 3) - 0.5) * 2 * g.huegelHoehe * glatt(10, 60, minD);
    if (minD < ZONE) {
      // ganz nahe: flach auf Strassenhöhe
      strecke.abfrage(x, z, q);
      // auf der Wandseite steigt es schnell an (dort steht die Felswand)
      const wandSeite = q.wandSeite && Math.sign(q.seite) === q.wandSeite;
      const uber = wandSeite ? mische(g.uebergang, 4, q.wandStaerke) : g.uebergang;
      const t = glatt(g.flachBis, g.flachBis + uber, q.abstand);
      h = mische(q.h - 0.3, h, t);
      // Liegt ein anderer Ast der Strecke nahe (z. B. die Kehre darüber)?
      // Dann dazwischen eine saubere Böschung von Strasse zu Strasse.
      if (strecke.andererAst(x, z, q.s, 40, 40, q2)) {
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
  const detailBis = CONFIG.nebel.ende + 60;
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
  // Strasse als Bänder entlang der Strecke: Asphalt, zwei Bankette und
  // die Mittellinie, jedes mit eigener Textur (bleibt in der Ferne grau).
  // ---------------------------------------------------------------
  const s = CONFIG.strasse;
  const halb = s.breite / 2, aussen = halb + s.bankett;

  // Baut ein Band aus Streifen. Jeder Streifen: Liste von Querpunkten
  // { lat (Abstand zur Mitte, + = rechts), dy (Höhe), u (Textur quer) }.
  // vLaenge = so viele Meter entspricht eine Texturlänge.
  function baueBand(streifen, vLaenge, extra) {
    const n = strecke.anzahl;
    const pos = [], uv = [], seiteAttr = [], rechtsAttr = [], idx = [];
    for (const quer of streifen) {
      const m = quer.length, basis = pos.length / 3;
      for (let i = 0; i < n; i++) {
        const rx = -strecke.tz[i], rz = strecke.tx[i];
        for (let c = 0; c < m; c++) {
          pos.push(strecke.px[i] + rx * quer[c].lat, strecke.py[i] + quer[c].dy, strecke.pz[i] + rz * quer[c].lat);
          uv.push(quer[c].u, strecke.s[i] / vLaenge);
          if (extra) { seiteAttr.push(Math.sign(quer[c].lat)); rechtsAttr.push(rx, 0, rz); }
        }
      }
      for (let i = 0; i < n - 1; i++) {
        for (let c = 0; c < m - 1; c++) {
          const a = basis + i * m + c, b = a + 1, cc = a + m, d = cc + 1;
          idx.push(a, b, cc, b, d, cc);
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

  // Asphalt
  szene.add(new THREE.Mesh(
    baueBand([[{ lat: -halb, dy: 0, u: 0 }, { lat: halb, dy: 0, u: 1 }]], ASPHALT_LAENGE),
    new THREE.MeshLambertMaterial({ map: asphaltTextur(f), polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -2 }),
  ));
  // Bankett links und rechts (fällt nach aussen leicht ab)
  szene.add(new THREE.Mesh(
    baueBand([
      [{ lat: -aussen, dy: -0.35, u: 0 }, { lat: -halb, dy: 0, u: 1 }],
      [{ lat: halb, dy: 0, u: 1 }, { lat: aussen, dy: -0.35, u: 0 }],
    ], BANKETT_LAENGE),
    new THREE.MeshLambertMaterial({ map: bankettTextur(f), polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -2 }),
  ));
  // Mittellinie: schmaler Streifen. In der Ferne wird er etwas breiter
  // gezeichnet (mind. mittellinieMinPixel Bildpunkte), damit er nicht
  // zwischen den groben Pixeln verschwindet und flimmert.
  {
    const lb = s.mittellinieBreite / 2;
    const geo = baueBand([[{ lat: -lb, dy: 0, u: 0 }, { lat: lb, dy: 0, u: 1 }]], s.abstandMittellinie, true);
    const mat = new THREE.MeshLambertMaterial({
      map: mittellinienTextur(f, s.mittellinieStrich / s.abstandMittellinie),
      transparent: true, depthWrite: false,
      polygonOffset: true, polygonOffsetFactor: -1.5, polygonOffsetUnits: -3,
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
    const mat = new THREE.MeshLambertMaterial({ map: zielTex, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 });
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
    const pos = [], col = [];
    const cFels = new THREE.Color(f.bergFels), cSchnee = new THREE.Color(f.schnee), cDunst = new THREE.Color(f.dunst);
    const dunstFarbe = (c, y, H) => {
      let anteil = begrenze(CONFIG.nebel.bergDunst + CONFIG.nebel.bergDunstUnten * (1 - y / H), 0, 1);
      if (c === cSchnee) return c.clone().lerp(cDunst, anteil * 0.3).multiplyScalar(1.35); // Schnee soll leuchten
      return c.clone().lerp(cDunst, anteil);
    };
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
        const grund = schnee ? cSchnee : cFels.clone().multiplyScalar(0.8 + rndB() * 0.3);
        const farbe = dunstFarbe(grund, my, H);
        for (let k = 0; k < 3; k++) col.push(farbe.r, farbe.g, farbe.b);
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
    geo.computeVertexNormals();
    const mat = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true, fog: false, side: THREE.DoubleSide });
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
  const qb = {};
  welt.bodenBei = function (x, z, abfrage) {
    const a = abfrage || strecke.abfrage(x, z, qb);
    const seite = Math.abs(a.seite);
    if (a.abstand <= aussen && a.s > 0.5 && a.s < strecke.laenge - 0.5) {
      if (seite <= halb) return { h: a.h, art: 'asphalt' };
      return { h: a.h - ((seite - halb) / s.bankett) * 0.35, art: 'bankett' };
    }
    return { h: welt.gelaendeHoehe(x, z), art: 'gras' };
  };

  return welt;
}
