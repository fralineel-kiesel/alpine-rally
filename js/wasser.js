// Wasser (seit M10b): Seen und Flüsse als flache Flächen im Pixel-Look, Holzbrücke, wo ein Fluss die Strasse kreuzt.
// Alles kommt aus der Streckendatei (Block "wasser", fehlt er: kein Wasser, nichts ändert sich):
//   seen:    { s, seite, lat, rx, rz, drehung, tiefe } – Ellipse neben der Strasse (Mitte bei Streckenmeter s, seite
//            -1/+1, lat Meter daneben), Halbachsen rx quer / rz längs zur Strasse, drehung in Grad, Wasserspiegel
//            tiefe Meter unter der Strasse bei s
//   fluesse: { s, breite, laenge, winkel, tiefe } – gerader Fluss, kreuzt die Strasse bei s (winkel = Grad gegen die
//            Senkrechte zur Strasse), Wasserspiegel tiefe Meter unter der Strasse; dort steht eine Brücke
// Das Gelände wird unter dem Wasser ausgehoben (welt.js ruft wasserSchnitt beim Rechnen jeder Geländehöhe), Bäume
// und Büsche bleiben draussen (welt.imFels meldet Wasser wie Fels). Werte zum Aussehen: config.js, Block "wasser".

import * as THREE from 'three';
import { CONFIG } from './config.js';
import { leinwand, setze, zuTextur, hexZuRgb } from './pixel.js';
import { zufall } from './util.js';

const GRAD = Math.PI / 180;

// Flächen in Weltkoordinaten (einmal beim Bau der Welt). netz.etappePunkt(s) -> { x, z, tx, tz }, strecke.py = Höhe
export function wasserFlaechen(daten, strecke, netz) {
  const W = daten || {};
  const punkt = (s) => (netz ? netz.etappePunkt(s) : strecke.punktBei(s));
  const hBei = (s) => strecke.py[Math.max(0, Math.min(strecke.anzahl - 1, Math.round(s)))];
  const seen = (W.seen || []).map((w) => {
    const p = punkt(w.s), lat = w.seite * w.lat;
    const ach = Math.atan2(p.tx, p.tz) + (w.drehung || 0) * GRAD; // Richtung der Längsachse (rz)
    return { art: 'see', x: p.x - p.tz * lat, z: p.z + p.tx * lat, rx: w.rx, rz: w.rz, ux: Math.sin(ach), uz: Math.cos(ach), h: hBei(w.s) - w.tiefe };
  });
  const fluesse = (W.fluesse || []).map((w) => {
    const p = punkt(w.s);
    // Richtung des Flusses: quer zur Strasse, um winkel gedreht
    const a = Math.atan2(-p.tz, p.tx) + (w.winkel || 0) * GRAD;
    return { art: 'fluss', s: w.s, x: p.x, z: p.z, ux: Math.cos(a), uz: Math.sin(a), breite: w.breite, laenge: w.laenge, h: hBei(w.s) - w.tiefe, strasseH: hBei(w.s) };
  });
  return { seen, fluesse, alle: seen.concat(fluesse), an: seen.length + fluesse.length > 0 };
}

// Abstand eines Punkts zum Wasserrand (Meter, negativ = im Wasser) und die Fläche; null = weit weg
function randAbstand(f, x, z) {
  const dx = x - f.x, dz = z - f.z;
  if (f.art === 'see') {
    const laengs = dx * f.ux + dz * f.uz, quer = dx * f.uz - dz * f.ux;
    const e = Math.hypot(quer / f.rx, laengs / f.rz);
    return (e - 1) * Math.min(f.rx, f.rz);
  }
  const laengs = dx * f.ux + dz * f.uz, quer = dx * -f.uz + dz * f.ux;
  if (Math.abs(laengs) > f.laenge / 2) return Infinity;
  return Math.abs(quer) - f.breite / 2;
}

// Geländehöhe am Wasser: unter dem Spiegel ausheben, Ufer als Böschung (Werte: config.js, wasser)
export function wasserSchnitt(plan, x, z, h) {
  const C = CONFIG.wasser;
  for (const f of plan.alle) {
    const d = randAbstand(f, x, z);
    const B = CONFIG.gelaende.boeschung;
    if (d > C.ufer && !B) continue;
    const k0 = (C.tiefeRand + C.uferHoehe) / C.ufer; // Steigung des flachen Ufers
    let ziel = d < 0 ? f.h - C.tiefeRand - Math.min(C.tiefeMehr, -d * 0.15) : f.h - C.tiefeRand + Math.min(d, C.ufer) * k0;
    // M10b.2 (Böschung): hinter dem flachen Ufer steigt das Gelände gleichmässig an (höchstens B.steigung, weich
    // angesetzt) statt am Rand der Uferzone senkrecht auf die alte Höhe zu springen (das war der "Faltenwurf")
    if (B && d > C.ufer) ziel += uferAnstieg(d - C.ufer, k0, B);
    if (ziel < h) h = ziel;
  }
  return h;
}

// M10b.2: Anstieg hinter dem Ufer nach e Metern: Steigung wächst über B.weich Meter von k0 auf B.steigung
export function uferAnstieg(e, k0, B) {
  const w = Math.max(0.01, B.weich), st = B.steigung;
  return k0 * e + (st - k0) * (e < w ? (e * e) / (2 * w) : e - w / 2);
}

// M10b.2: kleinster Abstand zum Rand eines Flusses (negativ = im Fluss, Infinity = kein Fluss nahe)
export function flussAbstand(plan, x, z) {
  let d = Infinity;
  for (const f of plan.fluesse) d = Math.min(d, randAbstand(f, x, z));
  return d;
}

// Liegt ein Kreis (x, z, r) im Wasser (oder am nassen Ufer)?
export function imWasser(plan, x, z, r = 0) {
  for (const f of plan.alle) if (randAbstand(f, x, z) < r + CONFIG.wasser.trockenAb) return true;
  return false;
}

// Pixel-Textur: Grundfarbe, ein paar helle Wellenstriche, 32x32, wiederholt
function wasserTextur() {
  const C = CONFIG.wasser, l = leinwand(32, 32), rnd = zufall(919);
  const g = hexZuRgb(C.farbe), hl = hexZuRgb(C.farbeHell), dk = hexZuRgb(C.farbeDunkel);
  for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) setze(l, x, y, rnd() < 0.18 ? dk : g);
  for (let k = 0; k < 9; k++) {
    const y = Math.floor(rnd() * 32), x0 = Math.floor(rnd() * 32), n = 3 + Math.floor(rnd() * 5);
    for (let i = 0; i < n; i++) setze(l, (x0 + i) % 32, y, hl);
  }
  return zuTextur(l, { wiederholen: true });
}

// Wasser, Brücken und Brücken-Geländer bauen. Ergebnis: { meshes, hindernisse, plan }
export function baueWasser(szene, strecke, netz, plan) {
  const C = CONFIG.wasser;
  const aus = { meshes: [], hindernisse: [], plan, bruecken: [] };
  if (!plan || !plan.an) return aus;
  // --- Wasserflächen (ein Zeichenaufruf) ---
  const pos = [], uv = [], idx = [];
  const flaeche = (rand, h) => { // rand = Punkte [x, z] im Kreis, Mitte = Mittelwert
    const o = pos.length / 3;
    let mx = 0, mz = 0;
    for (const [x, z] of rand) { mx += x; mz += z; }
    mx /= rand.length; mz /= rand.length;
    pos.push(mx, h, mz); uv.push(mx / C.texturMeter, mz / C.texturMeter);
    for (const [x, z] of rand) { pos.push(x, h, z); uv.push(x / C.texturMeter, z / C.texturMeter); }
    for (let i = 0; i < rand.length; i++) idx.push(o, o + 1 + ((i + 1) % rand.length), o + 1 + i);
  };
  for (const f of plan.seen) {
    const rand = [];
    for (let i = 0; i < 40; i++) {
      const w = (i / 40) * Math.PI * 2, q = Math.cos(w) * (f.rx + C.ufer * 0.2), l = Math.sin(w) * (f.rz + C.ufer * 0.2);
      rand.push([f.x + f.uz * q + f.ux * l, f.z - f.ux * q + f.uz * l]);
    }
    flaeche(rand, f.h);
  }
  for (const f of plan.fluesse) {
    const b = f.breite / 2 + C.ufer * 0.2, L = f.laenge / 2, qx = -f.uz, qz = f.ux;
    flaeche([[f.x - f.ux * L - qx * b, f.z - f.uz * L - qz * b], [f.x + f.ux * L - qx * b, f.z + f.uz * L - qz * b],
      [f.x + f.ux * L + qx * b, f.z + f.uz * L + qz * b], [f.x - f.ux * L + qx * b, f.z - f.uz * L + qz * b]], f.h);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ map: wasserTextur() }));
  mesh.name = 'wasser';
  szene.add(mesh);
  aus.meshes.push(mesh);

  // --- Brücken: Seitenbalken (Holz) und Geländer, wo ein Fluss die Strasse kreuzt ---
  const bp = [], bc = [], bi = [];
  const holz = new THREE.Color(C.brueckeHolz), dunkel = new THREE.Color(C.brueckeDunkel);
  const quad = (a, b, c, d, farbe) => { const o = bp.length / 3; for (const p of [a, b, c, d]) { bp.push(...p); bc.push(farbe.r, farbe.g, farbe.b); } bi.push(o, o + 1, o + 2, o, o + 2, o + 3); };
  for (const f of plan.fluesse) {
    const halb = f.breite / 2 + C.brueckeUeber;
    const s0 = f.s - halb, s1 = f.s + halb;
    const hb = netz.halbBei(f.s) + CONFIG.strasse.bankett * 0.6, lat = hb + 0.15;
    aus.bruecken.push({ s0, s1 });
    for (const sd of [-1, 1]) {
      let vorher = null;
      for (let s = s0; s <= s1 + 1e-6; s += 1) {
        const p = netz.etappePunkt(s), y = strecke.py[Math.round(s)];
        const ax = p.x - p.tz * sd * hb, az = p.z + p.tx * sd * hb, gx = p.x - p.tz * sd * lat, gz = p.z + p.tx * sd * lat;
        const jetzt = { ax, az, gx, gz, y };
        if (vorher) {
          // Seitenbalken (aussen, von der Fahrbahn 1.3 m nach unten)
          quad([vorher.ax, vorher.y + 0.05, vorher.az], [ax, y + 0.05, az], [ax, y - 1.3, az], [vorher.ax, vorher.y - 1.3, vorher.az], dunkel);
          // Handlauf (Brett, schräg sichtbar) auf Geländerhöhe
          quad([vorher.gx, vorher.y + C.gelaenderHoehe, vorher.gz], [gx, y + C.gelaenderHoehe, gz], [gx, y + C.gelaenderHoehe - 0.18, gz], [vorher.gx, vorher.y + C.gelaenderHoehe - 0.18, vorher.gz], holz);
          quad([vorher.gx, vorher.y + 0.45, vorher.gz], [gx, y + 0.45, gz], [gx, y + 0.3, gz], [vorher.gx, vorher.y + 0.3, vorher.gz], holz);
        }
        if (Math.abs((s - s0) % 2) < 1e-6 || s + 1 > s1) {
          // Pfosten: kleines Viereck quer
          const tx = p.tx * 0.08, tz = p.tz * 0.08;
          quad([gx - tx, y, gz - tz], [gx + tx, y, gz + tz], [gx + tx, y + C.gelaenderHoehe, gz + tz], [gx - tx, y + C.gelaenderHoehe, gz - tz], dunkel);
        }
        aus.hindernisse.push({ x: gx, z: gz, r: C.gelaenderKreis, rand: 'zaun' });
        vorher = jetzt;
      }
    }
  }
  if (bp.length) {
    const g2 = new THREE.BufferGeometry();
    g2.setAttribute('position', new THREE.Float32BufferAttribute(bp, 3));
    g2.setAttribute('color', new THREE.Float32BufferAttribute(bc, 3));
    g2.setIndex(bi);
    g2.computeVertexNormals();
    const m2 = new THREE.Mesh(g2, new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide, flatShading: true }));
    m2.name = 'bruecken';
    szene.add(m2);
    aus.meshes.push(m2);
  }
  return aus;
}
