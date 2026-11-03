// Kunst-Schatten (M10b.2): Die Engine rechnet keine echten Schatten, darum liegen flache Schatten-Flecken auf dem Boden.
// Nur auf Strecken mit dem Feld "schatten" (Streckendatei, sonst nichts: Alpen unverändert). Pixel-Look: drei Dunkelstufen
// mit Raster-Kanten statt weicher Verläufe, Farbe = kühle Abdunklung des Untergrunds (CONFIG.schatten.farbe, multipliziert,
// nie schwarz übermalt), knapp über dem Boden.
//  - Auto: ein Fleck unter dem Auto, in Sonnenrichtung verlängert, dreht mit dem Auto. Er liegt immer auf der BODENHÖHE
//    unter dem Auto (nicht auf der Autohöhe): fliegt das Auto später (M10c), bleibt er am Boden.
//  - Bäume, Häuser, Rentiere, Zuschauer: je ein flaches Viereck vom Fuss weg in Sonnenrichtung (Länge = Höhe mal
//    laenge), dem Gelände nach geneigt. Nur nahe der Strecke, nur die nächsten (Obergrenze CONFIG.schatten.max) im
//    Abschnitt vor dem Auto; über Wasser keine Schatten. Ein Zeichenaufruf (instanziert), keine Objekte pro Bild.
import * as THREE from 'three';
import { CONFIG } from './config.js';
import { leinwand, setze, zuTextur, hexZuRgb } from './pixel.js';
import { imWasser } from './wasser.js';

// Fleck-Textur: Ellipse in drei Stufen (innen dunkel), die Ränder der Stufen gerastert (4x4-Bayer)
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
// Farbe = wie viel jeder Farbkanal abgedunkelt wird (Abdunklung mal Stufe), Mischung: Untergrund mal (1 - Farbe) –
// so wird jeder Untergrund dunkler und kühler (blau bleibt mehr), nie heller und nie schwarz übermalt
function fleckTextur(dunkel) {
  const C = CONFIG.schatten, n = 32, l = leinwand(n, n), f = hexZuRgb(C.farbe);
  const ab = f.map((k) => 1 - k / 255); // je Kanal: so viel geht weg (Farbe dunkelblau = Rot/Grün mehr als Blau)
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const dx = (x + 0.5) / n * 2 - 1, dy = (y + 0.5) / n * 2 - 1, r = Math.sqrt(dx * dx + dy * dy);
    const b = (BAYER[(y % 4) * 4 + (x % 4)] + 0.5) / 16 * 0.16; // Raster: Grenzen um bis 0.16 verschoben
    const stufe = r + b < 0.6 ? 0 : r + b < 0.85 ? 1 : r + b < 1.06 ? 2 : 3;
    const st = stufe < 3 ? C.stufen[stufe] * dunkel : 0;
    setze(l, x, y, ab.map((k) => Math.round(k * st * 255)), 255);
  }
  const t = zuTextur(l, { mipmaps: false });
  t.colorSpace = THREE.NoColorSpace; // Werte direkt (keine Farbumrechnung)
  return t;
}

// Flaches Viereck in der XZ-Ebene (x und z von -0.5 bis 0.5), Normale +Y
function viereck() {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute([-0.5, 0, -0.5, 0.5, 0, -0.5, 0.5, 0, 0.5, -0.5, 0, 0.5], 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute([0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0], 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 1], 2));
  g.setIndex([0, 2, 1, 0, 3, 2]);
  return g;
}

// Matrix eines Flecks (Mitte cx/cz, Längsachse ux/uz Länge lang, Breite breit), dem Boden nach geneigt; in e ab Stelle o
function fleckMatrix(e, o, boden, cx, cz, ux, uz, lang, breit, heben) {
  const vx = uz, vz = -ux; // quer (so dass quer x oben = längs: Vorderseite nach oben)
  const h = boden(cx, cz);
  const hv = boden(cx + ux * lang * 0.5, cz + uz * lang * 0.5), hh = boden(cx - ux * lang * 0.5, cz - uz * lang * 0.5);
  const hl = boden(cx + vx * breit * 0.5, cz + vz * breit * 0.5), hr = boden(cx - vx * breit * 0.5, cz - vz * breit * 0.5);
  const du = hv - hh, dv = hl - hr; // Höhenunterschied über die ganze Länge / Breite
  // Spalten: X = quer (Breite), Y = Normale, Z = längs (Länge), dazu die Neigung
  const qx = vx * breit, qy = dv, qz = vz * breit;
  const lx = ux * lang, ly = du, lz = uz * lang;
  let nx = qy * lz - qz * ly, ny = qz * lx - qx * lz, nz = qx * ly - qy * lx;
  const nl = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
  nx /= nl; ny /= nl; nz /= nl;
  if (ny < 0) { nx = -nx; ny = -ny; nz = -nz; }
  e[o] = qx; e[o + 1] = qy; e[o + 2] = qz; e[o + 3] = 0;
  e[o + 4] = nx; e[o + 5] = ny; e[o + 6] = nz; e[o + 7] = 0;
  e[o + 8] = lx; e[o + 9] = ly; e[o + 10] = lz; e[o + 11] = 0;
  e[o + 12] = cx; e[o + 13] = Math.max(h, Math.max(hv, hh, hl, hr) - 0.02) + heben; e[o + 14] = cz; e[o + 15] = 1;
}

// quellen: Liste { x, z, h (Objekthöhe), b (Breite des Flecks) }. Ergebnis: { an, setzeAn, aktualisiere, statisch, auto }
export function baueSchatten(szene, strecke, welt, quellen, daten) {
  const aus = { an: false, aktiv: false, anzahl: 0, gezeigt: 0, setzeAn() {}, aktualisiere() {}, statisch: null, auto: null };
  if (!daten) return aus;
  const C = CONFIG.schatten;
  const w = ((daten.sonne + 180) % 360) * Math.PI / 180; // Schatten fällt von der Sonne weg (Himmelsrichtung, 0 = Nord)
  const dx = Math.sin(w), dz = -Math.cos(w);              // Weltrichtung (x Osten, z Süden)
  const L = daten.laenge, dunkel = daten.dunkelheit;
  const boden = (x, z) => welt.bodenBei(x, z).h;
  const mat = new THREE.MeshBasicMaterial({
    map: fleckTextur(dunkel), transparent: true, depthWrite: false, fog: false,
    blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.ZeroFactor, blendDst: THREE.OneMinusSrcColorFactor,
    polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
  });
  const geo = viereck();
  // --- feste Schatten: nahe der Strecke, nach Streckenmeter sortiert ---
  const q = {}, liste = [];
  for (const o of quellen) {
    strecke.abfrage(o.x, o.z, q);
    if (q.abstand > C.nahStrecke || !(o.h > 0.2)) continue;
    const lang = o.h * L, cx = o.x + dx * lang * 0.5, cz = o.z + dz * lang * 0.5;
    if (welt.wasser && welt.wasser.an && imWasser(welt.wasser, cx, cz, 0)) continue; // über Wasser keine Schatten
    liste.push({ s: q.s, cx, cz, lang: lang + o.b * 0.6, breit: o.b });
  }
  liste.sort((a, b) => a.s - b.s);
  const N = liste.length, matrizen = new Float32Array(N * 16), sListe = new Float32Array(N);
  liste.forEach((f, i) => { fleckMatrix(matrizen, i * 16, boden, f.cx, f.cz, dx, dz, f.lang, f.breit, C.heben); sListe[i] = f.s; });
  const statisch = new THREE.InstancedMesh(geo, mat, Math.max(1, Math.min(N, C.max)));
  statisch.name = 'schatten';
  statisch.count = 0;
  statisch.frustumCulled = false;
  szene.add(statisch);
  // --- Auto ---
  const autoMesh = new THREE.Mesh(geo, mat);
  autoMesh.name = 'schatten-auto';
  autoMesh.matrixAutoUpdate = false;
  szene.add(autoMesh);
  const qa = {};
  let ab = -1;
  const S = {
    an: true, aktiv: true, anzahl: N, gezeigt: 0, statisch, auto: autoMesh, richtung: [dx, dz], material: mat,
    setzeAn(an) { S.aktiv = !!an; statisch.visible = S.aktiv; autoMesh.visible = S.aktiv; },
    // jedes Bild: Auto (x, z, Blickrichtung) – Schatten des Autos und die festen Flecken im Abschnitt um das Auto
    aktualisiere(x, z, richtung) {
      if (!S.aktiv) return;
      // feste Flecken: Abschnitt [s - hinter, s + vor], höchstens C.max (nur neu schreiben, wenn sich der Anfang ändert)
      strecke.abfrage(x, z, qa);
      const s0 = qa.s - C.hinter;
      let lo = 0, hi = N;
      while (lo < hi) { const m = (lo + hi) >> 1; if (sListe[m] < s0) lo = m + 1; else hi = m; }
      if (lo !== ab) {
        ab = lo;
        const a = statisch.instanceMatrix.array, sBis = qa.s + C.vor;
        let n = 0;
        for (let i = lo; i < N && n < C.max && sListe[i] <= sBis; i++, n++) for (let k = 0; k < 16; k++) a[n * 16 + k] = matrizen[i * 16 + k];
        statisch.count = n; S.gezeigt = n;
        statisch.instanceMatrix.needsUpdate = true;
      }
      // Auto: Rechteck des Autos, in Sonnenrichtung um Höhe x laenge verlängert, auf der Bodenhöhe unter dem Auto
      const A = C.auto, fx = Math.sin(richtung), fz = Math.cos(richtung), sx = fz, sz = -fx;
      const wurf = A.hoehe * L, df = dx * fx + dz * fz, ds = dx * sx + dz * sz;
      const lang = A.laenge + Math.abs(df) * wurf, breit = A.breite + Math.abs(ds) * wurf;
      fleckMatrix(autoMesh.matrix.elements, 0, boden, x + dx * wurf * 0.5, z + dz * wurf * 0.5, fx, fz, lang, breit, C.heben);
      autoMesh.matrixWorldNeedsUpdate = true;
    },
  };
  return S;
}
