// Skipiste (Meilenstein 11a.1): reine Deko am Hang neben der Gletscher-Etappe (Streckendatei "skipiste").
// Eine präparierte Piste (helle Fläche mit Pistenspuren, dem Gelände nach gelegt), rote und blaue Pistenstangen am Rand
// und ein paar Skifahrer (kleine Pixel-Figuren mit bunten Jacken), die in Schwüngen den Hang hinunterfahren und unten
// wieder oben anfangen. Keine Kollision, kein Ton. Die Wege sind beim Laden vorberechnet; je Bild werden nur die
// vorhandenen Sprites verschoben (kein Garbage). Werte: config.js, Block skipiste. Ohne "skipiste" passiert nichts.
import * as THREE from 'three';
import { CONFIG } from './config.js';
import { STRECKE } from './streckenlader.js';
import { leinwand, setze, zuTextur, hexZuRgb } from './pixel.js';
import { zufall, mische } from './util.js';

// Pistenspuren: helle Fläche mit feinen Rillen längs (Pistenbully), dazwischen etwas Glitzer
function pistenTextur(C) {
  const B = 16, H = 32, l = leinwand(B, H), rnd = zufall(4711);
  const weiss = hexZuRgb(C.farbe), spur = hexZuRgb(C.farbeSpur), glitzer = hexZuRgb('#ffffff');
  for (let y = 0; y < H; y++) for (let x = 0; x < B; x++) setze(l, x, y, x % 4 === 1 ? spur : rnd() < 0.03 ? glitzer : weiss);
  const t = zuTextur(l, { wiederholen: true });
  t.minFilter = THREE.LinearMipmapLinearFilter;
  return t;
}
// Skifahrer: 8x12 Pixel, zwei Haltungen (Schwung nach links / rechts), Jacke in der Farbe des Fahrers
function fahrerTextur(jacke, rechts) {
  const l = leinwand(8, 12), J = hexZuRgb(jacke), H = hexZuRgb('#20242c'), K = hexZuRgb('#e8b896'), M = hexZuRgb('#d8262a'), S = hexZuRgb('#30343c');
  const p = (x, y, c) => setze(l, rechts ? 7 - x : x, y, c);
  p(3, 0, M); p(4, 0, M);                                   // Mütze
  p(3, 1, K); p(4, 1, K);                                   // Gesicht
  for (let y = 2; y <= 5; y++) for (let x = 2; x <= 5; x++) p(x + (y > 3 ? 1 : 0), y, J); // Jacke, leicht in den Schwung gelehnt
  p(1, 3, J); p(6, 4, J);                                   // Arme
  p(0, 4, S); p(0, 5, S); p(7, 6, S); p(7, 7, S);           // Stöcke
  for (let y = 6; y <= 8; y++) { p(3 + (y - 6), y, H); p(4 + (y - 6), y, H); } // Hose, Knie gebeugt
  for (let x = 1; x <= 7; x++) p(x, 9 + (x < 4 ? 1 : 0), S); // Ski schräg
  const t = zuTextur(l, { mipmaps: false });
  return t;
}

// M11b: "skipiste" darf auch eine Liste sein (mehrere Pisten, Skigebiet); ein einzelnes Objekt wie bisher
export function baueSkipiste(szene, strecke, welt) {
  const S = STRECKE && STRECKE.skipiste, C = CONFIG.skipiste;
  // (?skipiste=aus in der Adresse: nur für den Bildzeit-Vergleich in den Tests)
  const aus = typeof location !== 'undefined' && /[?&]skipiste=aus/.test(location.search);
  if (!S || !C || aus) return { an: false, aktualisiere: () => {}, fahrer: [], meshes: [] };
  if (!Array.isArray(S)) return bauePiste(szene, strecke, welt, S, C);
  const teile = S.map((D) => bauePiste(szene, strecke, welt, D, C));
  const aktualisiere = (dt) => { for (let i = 0; i < teile.length; i++) teile[i].aktualisiere(dt); };
  return {
    an: true, aktualisiere, fahrer: teile.flatMap((x) => x.fahrer), meshes: teile.flatMap((x) => x.meshes), pisten: teile,
    laenge: Math.min(...teile.map((x) => x.laenge)), oben: teile[0].oben, unten: teile[0].unten,
  };
}

function bauePiste(szene, strecke, welt, D, C) {
  const sd = D.seite >= 0 ? 1 : -1;
  const punkt = (s, lat) => { const p = strecke.punktBei(s); return [p.x - p.tz * sd * lat, p.z + p.tx * sd * lat]; };
  const [ox, oz] = punkt(D.s[0], D.lat[0]), [ux, uz] = punkt(D.s[1], D.lat[1]); // oben, unten
  const lx = ux - ox, lz = uz - oz, L = Math.hypot(lx, lz), ex = lx / L, ez = lz / L, qx = -ez, qz = ex; // Richtung, quer
  const boden = (x, z) => welt.gelaendeHoehe(x, z);
  const meshes = [];
  // --- Fläche: dem Gelände nach (alle schritt Meter eine Reihe, spalten Stücke quer) ---
  const pos = [], uv = [], idx = [], N = Math.ceil(L / C.schritt), Q = C.spalten;
  for (let i = 0; i <= N; i++) for (let k = 0; k <= Q; k++) {
    const a = (i / N) * L, b = (k / Q - 0.5) * D.breite;
    const x = ox + ex * a + qx * b, z = oz + ez * a + qz * b;
    pos.push(x, boden(x, z) + C.heben, z); uv.push(k / Q * D.breite / 8, a / 8);
  }
  for (let i = 0; i < N; i++) for (let k = 0; k < Q; k++) { const a = i * (Q + 1) + k, b = a + 1, c = a + Q + 2, d = a + Q + 1; idx.push(a, d, c, a, c, b); }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx); geo.computeVertexNormals();
  const flaeche = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ map: pistenTextur(C), polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -2 }));
  szene.add(flaeche); meshes.push(flaeche);
  // --- Pistenstangen: links rot, rechts blau (gekreuzte schmale Flächen), ein Zeichenaufruf ---
  const sp = [], sc = [], si = [];
  for (const [seite, farbe] of [[-1, C.stangeLinks], [1, C.stangeRechts]]) {
    const c = new THREE.Color(farbe);
    for (let a = 4; a < L; a += C.stangenAbstand) {
      const x = ox + ex * a + qx * seite * D.breite / 2, z = oz + ez * a + qz * seite * D.breite / 2, y = boden(x, z) - 0.1, w = 0.07;
      for (const [dx, dz] of [[w, 0], [0, w]]) {
        const b0 = sp.length / 3;
        for (const [px, py, pz] of [[x - dx, y, z - dz], [x + dx, y, z + dz], [x + dx, y + C.stangeHoehe, z + dz], [x - dx, y + C.stangeHoehe, z - dz]]) { sp.push(px, py, pz); sc.push(c.r, c.g, c.b); }
        si.push(b0, b0 + 1, b0 + 2, b0, b0 + 2, b0 + 3);
      }
    }
  }
  const g2 = new THREE.BufferGeometry();
  g2.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
  g2.setAttribute('color', new THREE.Float32BufferAttribute(sc, 3));
  g2.setIndex(si);
  const stangen = new THREE.Mesh(g2, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide }));
  szene.add(stangen); meshes.push(stangen);
  // --- Skifahrer: Weg vorberechnet (Schwünge quer zur Piste), zwei Sprites je Fahrer (Schwung links / rechts) ---
  const rnd = zufall(D.seed ?? 5150), fahrer = [];
  for (let j = 0; j < D.skifahrer; j++) {
    const jacke = C.jacken[j % C.jacken.length];
    const dauer = mische(C.dauer[0], C.dauer[1], rnd()), phase = rnd(), boegen = Math.round(mische(C.boegen[0], C.boegen[1], rnd()));
    const breite = (D.breite / 2 - 3) * mische(0.5, 0.9, rnd()), versatz = (rnd() - 0.5) * D.breite * 0.2, phi = rnd() * Math.PI * 2;
    const M = C.wegPunkte, weg = new Float32Array(M * 4); // x, y, z, Haltung (+1 = Schwung nach rechts)
    for (let m = 0; m < M; m++) {
      const u = m / (M - 1), w = 2 * Math.PI * boegen * u + phi, b = versatz + Math.sin(w) * breite;
      const x = ox + ex * u * L + qx * b, z = oz + ez * u * L + qz * b;
      weg[m * 4] = x; weg[m * 4 + 1] = boden(x, z) + C.groesse * 0.5; weg[m * 4 + 2] = z; weg[m * 4 + 3] = Math.cos(w) >= 0 ? 1 : -1;
    }
    const sprites = [false, true].map((rechts) => {
      // (harte Alpha-Kante statt Transparenz-Mischung: billiger und Pixel-Look wie die Bäume)
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: fahrerTextur(jacke, rechts), fog: true, transparent: false, alphaTest: 0.5 }));
      s.scale.set(C.groesse * 0.67, C.groesse, 1);
      szene.add(s); return s;
    });
    fahrer.push({ dauer, phase, weg, sprites, t: 0 });
  }
  let zeit = 0;
  function aktualisiere(dt) {
    zeit += dt;
    for (const f of fahrer) {
      const t = (zeit / f.dauer + f.phase) % 1, M = C.wegPunkte, a = t * (M - 1), m = Math.min(M - 2, Math.floor(a)), r = a - m, w = f.weg;
      const x = w[m * 4] + (w[m * 4 + 4] - w[m * 4]) * r, y = w[m * 4 + 1] + (w[m * 4 + 5] - w[m * 4 + 1]) * r, z = w[m * 4 + 2] + (w[m * 4 + 6] - w[m * 4 + 2]) * r;
      const rechts = w[m * 4 + 3] > 0;
      f.t = t;
      f.sprites[0].visible = !rechts; f.sprites[1].visible = rechts;
      f.sprites[rechts ? 1 : 0].position.set(x, y, z);
    }
  }
  aktualisiere(0);
  return { an: true, aktualisiere, fahrer, meshes, laenge: L, oben: [ox, oz], unten: [ux, uz] };
}
