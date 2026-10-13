// Die Welt: Gelände, Strasse, Felswand, Hintergrundberge, Himmel.

import * as THREE from 'three';
import { CONFIG } from './config.js';
import { zufall, fbm, glatt, mische, begrenze } from './util.js';
import {
  koernungTextur, asphaltTextur, ASPHALT_LAENGE, bankettTextur, BANKETT_LAENGE, mittellinienTextur, zielTextur,
} from './pixel.js';

// Grobe Landschaftsform: grosse Hügel und Senken, unabhängig von der Strasse.
// radius = wie breit, hoehe = wie hoch (negativ = Senke)
export const LANDSCHAFT = [
  { x: -320, z: -700, radius: 340, hoehe: 200 },  // Bergflanke im Westen (hinter der Felswand)
  { x: -170, z: -200, radius: 200, hoehe: 50 },   // Hügel westlich vom Start
  { x: 250, z: 60, radius: 160, hoehe: 28 },      // Hügel im Südosten
  { x: 480, z: -560, radius: 220, hoehe: 90 },    // Hügel jenseits des Tals im Osten
  { x: 110, z: -1200, radius: 280, hoehe: 150 },  // Berg nach dem Ziel
  { x: 240, z: -730, radius: 170, hoehe: -45 },   // Tal unter dem Abhang
];

export function baueWelt(szene, strecke) {
  const welt = {};
  const g = CONFIG.gelaende;
  const f = CONFIG.farben;
  const koernung = koernungTextur();

  // Mittelpunkt und Ausdehnung der Strecke
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
  for (let i = 0; i < strecke.anzahl; i++) {
    minX = Math.min(minX, strecke.px[i]); maxX = Math.max(maxX, strecke.px[i]);
    minZ = Math.min(minZ, strecke.pz[i]); maxZ = Math.max(maxZ, strecke.pz[i]);
  }
  const mitte = { x: (minX + maxX) / 2, z: (minZ + maxZ) / 2 };
  welt.mitte = mitte;
  welt.kernBox = { minX: minX - g.kernRand, maxX: maxX + g.kernRand, minZ: minZ - g.kernRand, maxZ: maxZ + g.kernRand };

  // ---------------------------------------------------------------
  // Natürliche Landschaft (ohne Strasse)
  // ---------------------------------------------------------------
  function basisHoehe(x, z) {
    let h = 0;
    for (const b of LANDSCHAFT) {
      const dx = x - b.x, dz = z - b.z;
      h += b.hoehe * Math.exp(-(dx * dx + dz * dz) / (b.radius * b.radius));
    }
    h += (fbm(x / 260, z / 260, g.seed) - 0.5) * 34;
    // gegen den Bergkranz hin ansteigen (liegt im Dunst)
    const r = Math.hypot(x - mitte.x, z - mitte.z);
    h += glatt(620, 1150, r) * 170;
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
        spezial = Math.max(basis - strecke.py[i] - 4, -Math.max(0, a - fw.abhangStart) * 1.5);
      }
      p = mische(p, spezial, st);
    }
    return p;
  }

  // ---------------------------------------------------------------
  // Höhengitter: fein nahe der Strecke, gröber nach aussen
  // ---------------------------------------------------------------
  function achse(kernMin, kernMax, aussenMin, aussenMax) {
    const w = [];
    for (let v = kernMin; v <= kernMax + 1e-6; v += g.raster) w.push(v);
    let v = w[0], schritt = g.raster;
    while (v > aussenMin) { schritt = Math.min(schritt * 1.18, 80); v -= schritt; w.unshift(v); }
    v = w[w.length - 1]; schritt = g.raster;
    while (v < aussenMax) { schritt = Math.min(schritt * 1.18, 80); v += schritt; w.push(v); }
    return Float64Array.from(w);
  }
  const kb = welt.kernBox;
  const xs = achse(kb.minX, kb.maxX, mitte.x - g.aussenRand, mitte.x + g.aussenRand);
  const zs = achse(kb.minZ, kb.maxZ, mitte.z - g.aussenRand, mitte.z + g.aussenRand);
  const NX = xs.length, NZ = zs.length;
  const hoehen = new Float32Array(NX * NZ);

  // Strecken-Stützpunkte (jeder 4. Meter) für die Glättung
  const stuetz = [];
  for (let i = 0; i < strecke.anzahl; i += 4) stuetz.push(i);
  const SIGMA = 30, R2 = (SIGMA * 3) ** 2;
  const q = {};

  for (let jz = 0; jz < NZ; jz++) {
    for (let ix = 0; ix < NX; ix++) {
      const x = xs[ix], z = zs[jz];
      const basis = basisHoehe(x, z);
      // Gewichtetes Mittel: Strassenhöhe + Profil, je näher desto wichtiger
      let summeW = 0.04, summeH = 0.04 * basis, minD2 = Infinity;
      for (let k = 0; k < stuetz.length; k++) {
        const i = stuetz[k];
        const dx = x - strecke.px[i], dz = z - strecke.pz[i];
        const d2 = dx * dx + dz * dz;
        if (d2 < minD2) minD2 = d2;
        if (d2 > R2) continue;
        const w = Math.exp(-d2 / (SIGMA * SIGMA));
        const lat = dx * -strecke.tz[i] + dz * strecke.tx[i];
        summeW += w;
        summeH += w * (strecke.py[i] + profil(i, lat, basis));
      }
      const minD = Math.sqrt(minD2);
      let h = summeH / summeW;
      // kleine Hügel, nahe der Strasse schwächer
      h += (fbm(x / 55, z / 55, g.seed + 3) - 0.5) * 2 * g.huegelHoehe * glatt(10, 60, minD);
      // ganz nahe: flach auf Strassenhöhe
      if (minD < g.flachBis + g.uebergang + 6) {
        strecke.abfrage(x, z, q);
        const uber = mische(g.uebergang, 4, q.wandStaerke);
        const t = glatt(g.flachBis, g.flachBis + uber, q.abstand);
        h = mische(q.h - 0.3, h, t);
      }
      hoehen[jz * NX + ix] = h;
    }
  }

  // Höhe an beliebiger Stelle (genau wie die gezeichneten Dreiecke)
  function suche(arr, v) {
    let lo = 0, hi = arr.length - 2;
    if (v <= arr[0]) return 0;
    if (v >= arr[hi + 1]) return hi;
    while (lo < hi) {
      const m = (lo + hi + 1) >> 1;
      if (arr[m] <= v) lo = m; else hi = m - 1;
    }
    return lo;
  }
  welt.gelaendeHoehe = function (x, z) {
    const i = suche(xs, x), j = suche(zs, z);
    const fx = begrenze((x - xs[i]) / (xs[i + 1] - xs[i]), 0, 1);
    const fz = begrenze((z - zs[j]) / (zs[j + 1] - zs[j]), 0, 1);
    const h00 = hoehen[j * NX + i], h10 = hoehen[j * NX + i + 1];
    const h01 = hoehen[(j + 1) * NX + i], h11 = hoehen[(j + 1) * NX + i + 1];
    if (fx >= fz) return h00 + fx * (h10 - h00) + fz * (h11 - h10);
    return h00 + fz * (h01 - h00) + fx * (h11 - h01);
  };

  // ---------------------------------------------------------------
  // Gelände-Mesh in Kacheln (damit Unsichtbares nicht gezeichnet wird)
  // ---------------------------------------------------------------
  const cGras = new THREE.Color(f.gras), cGrasD = new THREE.Color(f.grasDunkel);
  const cFels = new THREE.Color(f.fels), cFelsD = new THREE.Color(f.felsDunkel);
  const cErde = new THREE.Color(f.erde);
  const farbenGitter = new Float32Array(NX * NZ * 3);
  const rnd = zufall(g.seed);
  const tmp = new THREE.Color();
  for (let jz = 0; jz < NZ; jz++) {
    for (let ix = 0; ix < NX; ix++) {
      const i0 = Math.max(0, ix - 1), i1 = Math.min(NX - 1, ix + 1);
      const j0 = Math.max(0, jz - 1), j1 = Math.min(NZ - 1, jz + 1);
      const gx = (hoehen[jz * NX + i1] - hoehen[jz * NX + i0]) / (xs[i1] - xs[i0]);
      const gz = (hoehen[j1 * NX + ix] - hoehen[j0 * NX + ix]) / (zs[j1] - zs[j0]);
      const ny = 1 / Math.sqrt(1 + gx * gx + gz * gz); // 1 = flach
      const x = xs[ix], z = zs[jz];
      const flecken = fbm(x / 23, z / 23, 99);
      tmp.copy(cGras).lerp(cGrasD, glatt(0.45, 0.62, flecken));
      if (ny < 0.86) tmp.lerp(cErde, glatt(0.86, 0.78, ny) * 0.8);
      if (ny < 0.76) tmp.copy(fbm(x / 9, z / 9, 7) > 0.5 ? cFels : cFelsD).lerp(cErde, glatt(0.62, 0.76, ny) * 0.5);
      const j = 0.94 + rnd() * 0.1;
      const k = (jz * NX + ix) * 3;
      farbenGitter[k] = tmp.r * j; farbenGitter[k + 1] = tmp.g * j; farbenGitter[k + 2] = tmp.b * j;
    }
  }

  const gelaendeMat = new THREE.MeshLambertMaterial({ vertexColors: true, map: koernung, flatShading: true });
  const KACHEL = 40;
  const gelaende = new THREE.Group();
  for (let kz = 0; kz < NZ - 1; kz += KACHEL) {
    for (let kx = 0; kx < NX - 1; kx += KACHEL) {
      const ex = Math.min(NX - 1, kx + KACHEL), ez = Math.min(NZ - 1, kz + KACHEL);
      const bx = ex - kx + 1, bz = ez - kz + 1;
      const pos = new Float32Array(bx * bz * 3), col = new Float32Array(bx * bz * 3), uv = new Float32Array(bx * bz * 2);
      for (let jz = 0; jz < bz; jz++) {
        for (let ix = 0; ix < bx; ix++) {
          const gi = (kz + jz) * NX + (kx + ix), li = jz * bx + ix;
          pos[li * 3] = xs[kx + ix]; pos[li * 3 + 1] = hoehen[gi]; pos[li * 3 + 2] = zs[kz + jz];
          col[li * 3] = farbenGitter[gi * 3]; col[li * 3 + 1] = farbenGitter[gi * 3 + 1]; col[li * 3 + 2] = farbenGitter[gi * 3 + 2];
          uv[li * 2] = xs[kx + ix] / 6; uv[li * 2 + 1] = zs[kz + jz] / 6;
        }
      }
      const idx = [];
      for (let jz = 0; jz < bz - 1; jz++) {
        for (let ix = 0; ix < bx - 1; ix++) {
          const a = jz * bx + ix, b = a + 1, c = a + bx, d = c + 1;
          idx.push(a, d, b, a, c, d);
        }
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
      geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
      geo.setIndex(idx);
      geo.computeBoundingSphere();
      gelaende.add(new THREE.Mesh(geo, gelaendeMat));
    }
  }
  szene.add(gelaende);

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
    for (const reihe of [{ r: 1, h: 1, n: b.anzahl }, { r: 0.72, h: 0.55, n: Math.round(b.anzahl * 0.7) }]) {
      for (let n = 0; n < reihe.n; n++) {
        const winkel = (n / reihe.n) * Math.PI * 2 + (rndB() - 0.5) * 0.12;
        const r = mische(b.radius[0], b.radius[1], rndB()) * reihe.r;
        const H = mische(b.hoehe[0], b.hoehe[1], rndB()) * reihe.h;
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
