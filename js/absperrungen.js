// Absperrungen (Meilenstein 3a): Wo die Etappe von der Hauptstrasse abbiegt (oder wieder
// einmündet), ist die andere Richtung der Hauptstrasse (der Stummel) zu – wie bei einer echten
// Rallye. Vier Arten, je Kreuzung eine andere (config.js, "absperrung" und "nebenwege"):
//   band   rot-weisses Flatterband zwischen Warnstangen, Schild "STRASSE GESPERRT", Rally-Pfeil
//   reifen alte Autoreifen, 2-3 übereinander gestapelt
//   heu    Strohballen, 1-2 Lagen
//   zaun   Holzböcke (Absperrzaun aus Brettern), leicht schief
// Alles quer über die ganze Strasse und ein Stück darüber hinaus. Kollision hart (Kreise wie
// beim Zaun). Links und rechts davon läuft der Seitenschutz (strassenrand.js), damit niemand
// um die Absperrung herumfährt.
// Gezeichnet wird alles mit einem Material und einem Bild (pixel.js, absperrAtlas): ein Zeichenaufruf.

import * as THREE from 'three';
import { CONFIG } from './config.js';
import { zufall, mische } from './util.js';
import { absperrAtlas } from './pixel.js';

export function baueAbsperrungen(szene, welt) {
  const t0 = performance.now();
  const netz = welt.netz;
  const c = CONFIG.absperrung;
  const atlas = absperrAtlas();
  const pos = [], uv = [], col = [], idx = [];
  const hindernisse = [];
  const liste = [];

  // --- kleine Bauteile ------------------------------------------------------------
  // Viereck a-b-c-d (unten links, unten rechts, oben rechts, oben links)
  function viereck(a, b, cc, d, kachel, hell = 1, spiegeln = false) {
    const t = atlas.kachel(kachel);
    let u0 = t.u0, u1 = t.u1;
    if (spiegeln) [u0, u1] = [u1, u0];
    const basis = pos.length / 3;
    pos.push(...a, ...b, ...cc, ...d);
    uv.push(u0, t.v0, u1, t.v0, u1, t.v1, u0, t.v1);
    for (let k = 0; k < 4; k++) col.push(hell, hell, hell);
    idx.push(basis, basis + 1, basis + 2, basis, basis + 2, basis + 3);
  }
  // Quader: Mitte unten (x, y, z), entlang (ux, uz), Länge L, Tiefe T, Höhe H
  function quader(x, y, z, ux, uz, L, T, H, kSeite, kOben, kEnde = kSeite, hell = 1) {
    const vx = -uz, vz = ux, l = L / 2, t = T / 2;
    const p = (a, b, oben) => [x + ux * a * l + vx * b * t, y + (oben ? H : 0), z + uz * a * l + vz * b * t];
    viereck(p(-1, -1, 0), p(1, -1, 0), p(1, -1, 1), p(-1, -1, 1), kSeite, hell);
    viereck(p(1, 1, 0), p(-1, 1, 0), p(-1, 1, 1), p(1, 1, 1), kSeite, hell * 0.9);
    viereck(p(1, -1, 0), p(1, 1, 0), p(1, 1, 1), p(1, -1, 1), kEnde, hell * 0.95);
    viereck(p(-1, 1, 0), p(-1, -1, 0), p(-1, -1, 1), p(-1, 1, 1), kEnde, hell * 0.95);
    viereck(p(-1, -1, 1), p(1, -1, 1), p(1, 1, 1), p(-1, 1, 1), kOben, hell * 1.05);
  }
  // Balken von Punkt a nach Punkt b (quadratischer Querschnitt, dicke)
  function balken(a, b, dicke, kachel, hell = 1) {
    const d = new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]).normalize();
    const hilf = Math.abs(d.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
    const e1 = new THREE.Vector3().crossVectors(d, hilf).normalize().multiplyScalar(dicke / 2);
    const e2 = new THREE.Vector3().crossVectors(d, e1).normalize().multiplyScalar(dicke / 2);
    const ecke = (p, s1, s2) => [p[0] + e1.x * s1 + e2.x * s2, p[1] + e1.y * s1 + e2.y * s2, p[2] + e1.z * s1 + e2.z * s2];
    const s = [[1, 1], [-1, 1], [-1, -1], [1, -1]];
    for (let k = 0; k < 4; k++) {
      const [a1, a2] = s[k], [b1, b2] = s[(k + 1) % 4];
      viereck(ecke(a, a1, a2), ecke(a, b1, b2), ecke(b, b1, b2), ecke(b, a1, a2), kachel, hell * (k % 2 ? 0.9 : 1));
    }
  }
  // Zylinder (Reifen): Mitte unten (x, y, z), Radius r, Höhe h, n Seiten, Drehung w
  function zylinder(x, y, z, r, h, n, kMantel, kOben, w, hell = 1) {
    const t = atlas.kachel(kMantel), o = atlas.kachel(kOben);
    const ring = [];
    for (let k = 0; k <= n; k++) {
      const a = w + (k / n) * Math.PI * 2;
      ring.push([Math.cos(a), Math.sin(a)]);
    }
    for (let k = 0; k < n; k++) {
      const [c1, s1] = ring[k], [c2, s2] = ring[k + 1];
      const basis = pos.length / 3;
      pos.push(x + c1 * r, y, z + s1 * r, x + c2 * r, y, z + s2 * r, x + c2 * r, y + h, z + s2 * r, x + c1 * r, y + h, z + s1 * r);
      const u0 = mische(t.u0, t.u1, k / n), u1 = mische(t.u0, t.u1, (k + 1) / n);
      uv.push(u0, t.v0, u1, t.v0, u1, t.v1, u0, t.v1);
      const hh = hell * (0.85 + 0.15 * Math.abs(c1));
      for (let j = 0; j < 4; j++) col.push(hh, hh, hh);
      idx.push(basis, basis + 1, basis + 2, basis, basis + 2, basis + 3);
    }
    // Deckel als Fächer
    const basis = pos.length / 3;
    pos.push(x, y + h, z);
    uv.push((o.u0 + o.u1) / 2, (o.v0 + o.v1) / 2);
    col.push(hell, hell, hell);
    for (let k = 0; k <= n; k++) {
      const [ck, sk] = ring[k];
      pos.push(x + ck * r, y + h, z + sk * r);
      uv.push(mische(o.u0, o.u1, 0.5 + ck * 0.5), mische(o.v0, o.v1, 0.5 + sk * 0.5));
      col.push(hell, hell, hell);
    }
    for (let k = 0; k < n; k++) idx.push(basis, basis + 1 + k, basis + 2 + k);
  }
  // Tafel an einem Pfosten (Schild, Pfeil): Mitte (x, z), Unterkante unten, schaut in Richtung (bx, bz)
  function tafel(x, y, z, bx, bz, b, h, unten, kachel, spiegeln = false) {
    const rx = bz, rz = -bx; // rechts aus Sicht des Betrachters
    pfostenStahl(x - bx * 0.04, y, z - bz * 0.04, unten + h);
    const p = (f, oben, hinten = 0) => [x + rx * (b / 2) * f - bx * hinten, y + unten + (oben ? h : 0), z + rz * (b / 2) * f - bz * hinten];
    viereck(p(-1, 0), p(1, 0), p(1, 1), p(-1, 1), kachel, 1.1, spiegeln);
    viereck(p(1, 0, 0.03), p(-1, 0, 0.03), p(-1, 1, 0.03), p(1, 1, 0.03), 'blech', 0.9);
  }
  function pfostenStahl(x, y, z, hoch) {
    balken([x, y - 0.1, z], [x, y + hoch, z], 0.07, 'blech', 0.7);
  }

  // --- Kreuzungen ------------------------------------------------------------------
  const rndHaupt = zufall(c.seed);
  for (const ast of netz.aeste) {
    const art = ast.sperreArt;
    const u = ast.sperreU;
    const i = Math.round(u);
    const tx = ast.tx[i], tz = ast.tz[i];
    const rx = -tz, rz = tx;                 // quer über die Strasse (rechts im Stummel)
    const bx = -tx, bz = -tz;                // Blickrichtung der Schilder: zur Kreuzung hin
    const B = ast.halb + c.ueberstand;       // halbe Breite der Absperrung
    const mx = ast.px[i] + tx * (u - i), mz = ast.pz[i] + tz * (u - i);
    const quer = (lat, vor = 0) => [mx + rx * lat + tx * vor, mz + rz * lat + tz * vor];
    const boden = (x, z) => welt.bodenBei(x, z).h;
    const rnd = zufall(c.seed + ast.nr * 97 + Math.floor(rndHaupt() * 1000));

    if (art === 'band') {
      const cb = c.band;
      const n = Math.max(2, Math.round((2 * B) / cb.pfostenAbstand));
      const posten = [];
      for (let k = 0; k <= n; k++) {
        const lat = -B + (2 * B * k) / n;
        const [x, z] = quer(lat, (rnd() - 0.5) * 0.15);
        const y = boden(x, z);
        posten.push({ x, z, y, lat });
        quader(x, y - 0.1, z, tx, tz, 0.07, 0.07, 1.25, 'stange', 'stange');
      }
      // Band in Stücken von ca. 1 m zwischen den Stangen, leicht durchhängend
      for (let k = 0; k < n; k++) {
        const a = posten[k], b = posten[k + 1];
        for (const hoehe of cb.hoehen) {
          const m = 3;
          for (let j = 0; j < m; j++) {
            const f0 = j / m, f1 = (j + 1) / m;
            const sag = (f) => cb.durchhang * 4 * f * (1 - f);
            const p0 = [mische(a.x, b.x, f0), mische(a.y, b.y, f0) + hoehe - sag(f0), mische(a.z, b.z, f0)];
            const p1 = [mische(a.x, b.x, f1), mische(a.y, b.y, f1) + hoehe - sag(f1), mische(a.z, b.z, f1)];
            viereck([p0[0], p0[1] - 0.045, p0[2]], [p1[0], p1[1] - 0.045, p1[2]], [p1[0], p1[1] + 0.045, p1[2]], [p0[0], p0[1] + 0.045, p0[2]], 'band', 1.1);
          }
        }
      }
      // Schild "STRASSE GESPERRT" mitten am Band, Rally-Pfeil daneben (zeigt in den Nebenweg)
      if (c.schild) {
        const [x, z] = quer(-ast.seiteN * 1.2, -0.12);
        tafel(x, boden(x, z), z, bx, bz, 1.5, 0.6, 1.05, 'schild');
      }
      if (c.pfeil) {
        const [x, z] = quer(ast.seiteN * 1.9, -0.12);
        tafel(x, boden(x, z), z, bx, bz, 0.9, 0.68, 1.0, 'pfeil', ast.seiteN < 0);
      }
    } else if (art === 'reifen') {
      const cr = c.reifen;
      const n = Math.floor((2 * B) / (cr.radius * 2)) + 1;
      for (let k = 0; k < n; k++) {
        const lat = -B + cr.radius + ((2 * B - 2 * cr.radius) * k) / (n - 1);
        const [x0, z0] = quer(lat, (rnd() - 0.5) * 0.12);
        let y = boden(x0, z0);
        const lagen = cr.lagen[0] + Math.floor(rnd() * (cr.lagen[1] - cr.lagen[0] + 1));
        for (let j = 0; j < lagen; j++) {
          const x = x0 + (rnd() - 0.5) * 0.08, z = z0 + (rnd() - 0.5) * 0.08;
          zylinder(x, y, z, cr.radius * (0.94 + rnd() * 0.1), cr.hoehe, 8, 'reifenSeite', 'reifenOben', rnd() * Math.PI, cr.hell * (0.85 + rnd() * 0.3));
          y += cr.hoehe;
        }
      }
    } else if (art === 'heu') {
      const ch = c.heu;
      const n = Math.ceil((2 * B) / ch.laenge);
      const lageY = [];
      for (let k = 0; k < n; k++) {
        const lat = -B + ch.laenge / 2 + ((2 * B - ch.laenge) * k) / Math.max(1, n - 1);
        const [x, z] = quer(lat, (rnd() - 0.5) * 0.2);
        const w = (rnd() - 0.5) * 0.12;
        const ux = tx * Math.sin(w) + rx * Math.cos(w), uz = tz * Math.sin(w) + rz * Math.cos(w);
        const y = boden(x, z) - 0.03;
        lageY.push(y);
        quader(x, y, z, ux, uz, ch.laenge * (0.96 + rnd() * 0.06), ch.tiefe, ch.hoehe, 'strohSeite', 'strohSeite', 'strohEnde', 0.9 + rnd() * 0.2);
      }
      // zweite Lage in der Mitte (versetzt)
      const oben = Math.round((n - 1) * ch.obenAnteil);
      const start = Math.floor((n - 1 - oben) / 2);
      for (let k = start; k < start + oben; k++) {
        const lat = -B + ch.laenge + ((2 * B - ch.laenge) * k) / Math.max(1, n - 1);
        const [x, z] = quer(lat, (rnd() - 0.5) * 0.15);
        const w = (rnd() - 0.5) * 0.16;
        const ux = tx * Math.sin(w) + rx * Math.cos(w), uz = tz * Math.sin(w) + rz * Math.cos(w);
        quader(x, Math.max(lageY[k], lageY[k + 1]) + ch.hoehe - 0.04, z, ux, uz, ch.laenge * (0.96 + rnd() * 0.06), ch.tiefe * 0.95, ch.hoehe, 'strohSeite', 'strohSeite', 'strohEnde', 0.9 + rnd() * 0.2);
      }
    } else {
      // Holzböcke: zwei A-Beine, zwei Bretter (oben rot-weiss), leicht schief
      const cz = c.zaun;
      const n = Math.max(2, Math.round((2 * B) / cz.bockBreite));
      const breite = (2 * B) / n;
      for (let k = 0; k < n; k++) {
        const lat = -B + breite * (k + 0.5);
        const [x, z] = quer(lat, (rnd() - 0.5) * 0.3);
        const w = ((rnd() - 0.5) * 2 * cz.schief * Math.PI) / 180;
        const ux = rx * Math.cos(w) + tx * Math.sin(w), uz = rz * Math.cos(w) + tz * Math.sin(w);
        const vx = -uz, vz = ux;
        const halbB = (breite * 0.92) / 2;
        const enden = [-1, 1].map((sd) => {
          const ex = x + ux * sd * (halbB - 0.15), ez = z + uz * sd * (halbB - 0.15);
          return { x: ex, z: ez, y: boden(ex, ez) };
        });
        const hoch = cz.hoehe + (rnd() - 0.5) * 0.08;
        for (const e of enden) {
          // A-Bein: zwei Latten vom Boden (vorn/hinten gespreizt) zur Spitze
          const top = [e.x, e.y + hoch, e.z];
          for (const v of [-1, 1]) balken([e.x + vx * v * 0.32, e.y - 0.05, e.z + vz * v * 0.32], top, 0.06, 'pfosten', 0.85 + rnd() * 0.2);
        }
        // Bretter: leicht schief (ein Ende etwas tiefer)
        for (const [hoehe, kachel] of [[hoch - 0.05, 'brettRot'], [hoch * 0.55, 'brett']]) {
          const d = (rnd() - 0.5) * 0.08;
          const a = enden[0], b = enden[1];
          const ax = a.x - ux * 0.15, az = a.z - uz * 0.15, bx2 = b.x + ux * 0.15, bz2 = b.z + uz * 0.15;
          const ya = a.y + hoehe + d, yb = b.y + hoehe - d;
          const f = -0.05; // vor den Beinen (zur Kreuzung hin)
          viereck([ax + bx * -f, ya - 0.09, az + bz * -f], [bx2 + bx * -f, yb - 0.09, bz2 + bz * -f], [bx2 + bx * -f, yb + 0.09, bz2 + bz * -f], [ax + bx * -f, ya + 0.09, az + bz * -f], kachel, 0.95 + rnd() * 0.15);
        }
      }
    }
    // Kollision: Kreise quer über die ganze Breite (hart, wie ein Zaun)
    const m = Math.ceil((2 * B + 0.2) / c.kreisAbstand);
    for (let k = 0; k <= m; k++) {
      const [x, z] = quer(-B - 0.1 + ((2 * B + 0.2) * k) / m);
      hindernisse.push({ x, z, r: c.kreisRadius, rand: 'absperrung' });
    }
    const [lx, lz] = quer(-B), [qx, qz] = quer(B);
    liste.push({ ast: ast.nr, art, u, x: mx, z: mz, links: [lx, lz], rechts: [qx, qz], richtung: [tx, tz], breite: 2 * B });
  }

  let mesh = null;
  if (idx.length) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    geo.computeBoundingSphere();
    mesh = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({
      map: atlas.textur, vertexColors: true, flatShading: true, side: THREE.DoubleSide, alphaTest: 0.5,
    }));
    mesh.name = 'absperrungen';
    szene.add(mesh);
  }
  return {
    liste, hindernisse, mesh,
    statistik: { anzahl: liste.length, dreiecke: idx.length / 3, kreise: hindernisse.length, ms: Math.round(performance.now() - t0) },
  };
}
