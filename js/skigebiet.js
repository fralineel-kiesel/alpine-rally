// Skigebiet-Deko (Meilenstein 11b): kleine Tribüne in der Zielarena (Streckendatei "tribuenen") und Pistenkreuzungen
// (Streckendatei "pistenkreuzungen": Pistenschild als Piktogramm und Pistenspuren quer über die Strasse). Reine Deko:
// keine Kollision, keine Wirkung aufs Fahren (querende Skifahrer kommen erst in M11c). Alles in einem Zeichenaufruf
// (ein Bild mit Zuschauer-Reihen, Beton, Schild und Spuren). Ohne die Felder (Alpen, Finnland) passiert hier nichts.
// Werte: config.js, Block skigebietDeko.
import * as THREE from 'three';
import { CONFIG } from './config.js';
import { STRECKE } from './streckenlader.js';
import { leinwand, setze, zuTextur, hexZuRgb } from './pixel.js';
import { zufall } from './util.js';

// Bild 64 x 32 in vier Feldern (je 16 breit): 0 Zuschauer-Reihe (Köpfe, bunte Jacken), 1 Beton (Stufen), 2 Schild
// "Pistenkreuzung" (rotes Warndreieck mit Skifahrer), 3 Pistenspuren (helle Rillen mit Lücken, Rest durchsichtig)
function dekoTextur(C) {
  const l = leinwand(64, 32), rnd = zufall(8123);
  const beton = hexZuRgb(C.beton), betonD = hexZuRgb(C.betonDunkel), haut = hexZuRgb('#e8b896'), muetze = hexZuRgb('#20242c');
  const jacken = C.jacken.map(hexZuRgb);
  for (let y = 0; y < 32; y++) for (let x = 0; x < 16; x++) setze(l, x, y, betonD);
  for (let y = 0; y < 32; y += 8) for (let x = 0; x < 16; x += 4) { // je Reihe 4 Zuschauer
    const j = jacken[Math.floor(rnd() * jacken.length)];
    setze(l, x + 1, y + 1, rnd() < 0.5 ? muetze : j); setze(l, x + 2, y + 1, rnd() < 0.5 ? muetze : j);
    setze(l, x + 1, y + 2, haut); setze(l, x + 2, y + 2, haut);
    for (let k = 3; k < 7; k++) for (let i = 0; i < 4; i++) setze(l, x + i, y + k, j);
    if (rnd() < 0.3) { setze(l, x + 3, y, j); setze(l, x + 3, y + 1, haut); } // winkt
  }
  for (let y = 0; y < 32; y++) for (let x = 16; x < 32; x++) setze(l, x, y, (y % 8 === 0) ? betonD : beton);
  // Schild: weiss mit rotem Rand (Dreieck), schwarzer Skifahrer
  const rot = hexZuRgb('#d8262a'), weiss = hexZuRgb('#f6f6f6'), schwarz = hexZuRgb('#1c1c1c');
  for (let y = 0; y < 32; y++) for (let x = 32; x < 48; x++) {
    const u = x - 32, h = 31 - y, halb = h * 0.5; // Dreieck mit Spitze oben
    if (Math.abs(u - 7.5) <= halb && h >= 4) setze(l, x, y, Math.abs(u - 7.5) > halb - 2 || h < 6 ? rot : weiss);
  }
  for (const [u, v] of [[7, 11], [8, 11], [7, 12], [8, 13], [7, 14], [6, 15], [9, 15], [5, 16], [10, 16], [4, 18], [5, 18], [6, 18], [7, 18], [8, 18], [9, 18], [10, 18], [11, 18], [8, 14], [9, 14]]) setze(l, 32 + u, v + 6, schwarz);
  // Spuren: Rillen längs (Pistenraupe), zwischendurch Lücken
  const spur = hexZuRgb(C.spur), spurD = hexZuRgb(C.spurDunkel);
  for (let y = 0; y < 32; y++) for (let x = 48; x < 64; x++) if ((x % 3 === 0 && rnd() < 0.85) || rnd() < 0.08) setze(l, x, y, x % 6 === 0 ? spurD : spur);
  return zuTextur(l, { wiederholen: false, mipmaps: false });
}

export function baueSkigebietDeko(szene, strecke, netz, welt) {
  const C = CONFIG.skigebietDeko, T = (STRECKE && STRECKE.tribuenen) || [], P = (STRECKE && STRECKE.pistenkreuzungen) || [];
  if (!C || (!T.length && !P.length)) return { an: false, meshes: [], kreuzungen: [], tribuenen: [] };
  const pos = [], uv = [], idx = [];
  const feld = (f, u, v) => [(f * 16 + u * 15.98 + 0.01) / 64, v];
  const quad = (a, b, c, d, f, vU = 1) => { // a unten links, b unten rechts, c oben rechts, d oben links
    const n = pos.length / 3;
    for (const [p, uu, vv] of [[a, 0, 0], [b, 1, 0], [c, 1, vU], [d, 0, vU]]) { pos.push(...p); uv.push(...feld(f, uu, vv)); }
    idx.push(n, n + 1, n + 2, n, n + 2, n + 3);
  };
  const seitlich = (s, lat) => { const p = strecke.punktBei(s); return { x: p.x - p.tz * lat, z: p.z + p.tx * lat, tx: p.tx, tz: p.tz }; };
  // --- Tribünen: Stufen nach aussen ansteigend, Vorderseite jeder Stufe mit Zuschauern, Oberseite Beton ---
  const tribuenen = [];
  for (const t of T) {
    const sd = t.seite >= 0 ? 1 : -1, L = t.laenge, R = t.reihen;
    const a0 = seitlich(t.s - L / 2, sd * t.lat), a1 = seitlich(t.s + L / 2, sd * t.lat);
    const qx = -a0.tz * sd, qz = a0.tx * sd; // nach aussen (weg von der Strasse)
    const y0 = Math.min(welt.gelaendeHoehe(a0.x, a0.z), welt.gelaendeHoehe(a1.x, a1.z)) - 0.2;
    const nSeg = Math.max(1, Math.round(L / C.segment)); // je Segment einmal das Zuschauer-Feld (4 Figuren)
    for (let r = 0; r < R; r++) {
      const d = r * C.stufeTiefe, h = r * C.stufeHoehe;
      for (let g = 0; g < nSeg; g++) {
        const b0 = seitlich(t.s - L / 2 + (L * g) / nSeg, sd * t.lat), b1 = seitlich(t.s - L / 2 + (L * (g + 1)) / nSeg, sd * t.lat);
        const p = (q, dd, hh) => [q.x + qx * dd, y0 + hh, q.z + qz * dd];
        quad(p(b0, d, h), p(b1, d, h), p(b1, d, h + C.stufeHoehe + 0.6), p(b0, d, h + C.stufeHoehe + 0.6), 0, 0.25); // Reihe Zuschauer
        quad(p(b0, d, h + C.stufeHoehe), p(b1, d, h + C.stufeHoehe), p(b1, d + C.stufeTiefe, h + C.stufeHoehe), p(b0, d + C.stufeTiefe, h + C.stufeHoehe), 1, 0.25);
      }
    }
    const D = R * C.stufeTiefe, H = R * C.stufeHoehe + 0.6, p = (q, dd, hh) => [q.x + qx * dd, y0 + hh, q.z + qz * dd];
    quad(p(a1, D, 0), p(a0, D, 0), p(a0, D, H), p(a1, D, H), 1); // Rückwand
    quad(p(a0, 0, 0), p(a0, D, 0), p(a0, D, H), p(a0, 0, 0.4), 1); quad(p(a1, D, 0), p(a1, 0, 0), p(a1, 0, 0.4), p(a1, D, H), 1); // Seiten
    tribuenen.push({ s: t.s, seite: sd, lat: t.lat, laenge: L, reihen: R });
  }
  // --- Pistenkreuzungen: Spuren-Band quer (dem Boden nach), Schild 40 m davor rechts ---
  const kreuzungen = [];
  for (const k of P) {
    const B = C.spurBreite, W = C.spurWeite, N = 24;
    for (let i = 0; i < N; i++) {
      const l0 = -W + (2 * W * i) / N, l1 = -W + (2 * W * (i + 1)) / N;
      const e = (s, lat) => { const q = seitlich(s, lat); return [q.x, welt.bodenBei(q.x, q.z).h + 0.04, q.z]; };
      quad(e(k.s - B / 2, l0), e(k.s - B / 2, l1), e(k.s + B / 2, l1), e(k.s + B / 2, l0), 3, 2);
    }
    const sS = k.s - C.schildVor, lat = netz.halbBei(sS) + CONFIG.strasse.bankett + 1.2, q = seitlich(sS, lat);
    const y = welt.gelaendeHoehe(q.x, q.z), b = C.schildGroesse / 2, ax = q.tz, az = -q.tx; // Schild quer zur Strasse
    const S = (u, hh) => [q.x + u * ax, y + hh, q.z + u * az];
    quad(S(-b, C.schildHoehe), S(b, C.schildHoehe), S(b, C.schildHoehe + 2 * b), S(-b, C.schildHoehe + 2 * b), 2); // Tafel
    quad(S(-0.05, 0), S(0.05, 0), S(0.05, C.schildHoehe), S(-0.05, C.schildHoehe), 1); // Pfosten
    kreuzungen.push({ s: k.s, schildS: sS });
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx); geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ map: dekoTextur(C), alphaTest: 0.5, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 }));
  szene.add(mesh);
  return { an: true, meshes: [mesh], kreuzungen, tribuenen };
}
