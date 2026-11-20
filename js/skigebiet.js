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
const ATLAS = 176; // Breite des Bildes: 11 Felder zu 16 Pixeln (M11b.1: 6 bis 10 für die Kicker)
function dekoTextur(C) {
  const l = leinwand(ATLAS, 32), rnd = zufall(8123);
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
  // Feld 4: Kicker-Kante (Streifen blau/orange, quer) – Feld 5: Fahne (bunt, oben) mit Stange (unten)
  const kb = hexZuRgb(C.kickerFarben[0]), ko = hexZuRgb(C.kickerFarben[1]);
  for (let y = 0; y < 32; y++) for (let x = 64; x < 80; x++) setze(l, x, y, Math.floor(x / 4) % 2 ? kb : ko);
  const fa = C.fahnenFarben.map(hexZuRgb), stange = hexZuRgb('#30343c');
  for (let y = 0; y < 32; y++) for (let x = 80; x < 96; x++) {
    if (x === 80 || x === 81) setze(l, x, y, stange);
    else if (y >= 18 && x < 94 - (31 - y) * 0.3) setze(l, x, y, fa[Math.floor((x - 82) / 3) % fa.length]);
  }
  // M11b.1 Kicker: Feld 6 Schneewand (seitlich, unten dunkler, körnig), 7 Schatten unter der Lippe, 8 Tor-Banner
  // (orange mit blauen Rändern und weissen Pfeilen), 9 Fangzaun (orange Maschen, Lücken durchsichtig), 10 Schnee oben
  const wa = hexZuRgb(C.kickerWandFarbe), wd = hexZuRgb(C.kickerWandDunkel), sn = hexZuRgb(C.kickerSchnee), sch = hexZuRgb(C.kickerSchattenFarbe);
  const [to, tb, tw] = C.torFarben.map(hexZuRgb), za = hexZuRgb(C.zaunFarbe), pf = hexZuRgb(C.pfostenFarbe);
  const mische = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
  for (let y = 0; y < 32; y++) for (let x = 0; x < 16; x++) {
    const r = rnd();
    setze(l, 96 + x, y, y < 3 ? sn : mische(wa, wd, Math.min(1, (y - 3) / 28) * 0.8 + (r < 0.15 ? 0.15 : 0)));
    setze(l, 112 + x, y, r < 0.1 ? mische(sch, wd, 0.3) : sch);
    const rand = y < 4 || y > 27, pfeil = Math.abs(((x + 2) % 8) - 4) + 6 === Math.abs(y - 16) + 6 && Math.abs(y - 16) < 5;
    setze(l, 128 + x, y, rand ? tb : pfeil ? tw : to);
    if (x % 4 === 0 || y % 4 === 0) setze(l, 144 + x, y, x === 0 ? pf : za);
    setze(l, 160 + x, y, r < 0.04 ? hexZuRgb('#ffffff') : sn);
  }
  return zuTextur(l, { wiederholen: false, mipmaps: false });
}

export function baueSkigebietDeko(szene, strecke, netz, welt) {
  const C = CONFIG.skigebietDeko, T = (STRECKE && STRECKE.tribuenen) || [], P = (STRECKE && STRECKE.pistenkreuzungen) || [];
  const F = (STRECKE && STRECKE.funpark) || null;
  if (!C || (!T.length && !P.length && !F)) return { an: false, meshes: [], kreuzungen: [], tribuenen: [], kicker: [] };
  const pos = [], uv = [], idx = [];
  const feld = (f, u, v) => [(f * 16 + u * 15.98 + 0.01) / ATLAS, v];
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
  // --- Funpark (M11b Teil D): farbige Kante quer über jeden Kicker, Stangen mit Fahne links und rechts der Kante,
  // Fahnenreihe am Rand, Bande am Ende. Die Schanze selbst ist die Sprungzone (Höhe der Strasse, js/sprung.js).
  const kicker = [];
  let kickerMesh = null;
  if (F) {
    const fahne = (s, lat, h) => { // Stange mit Fahne, quer zur Strasse (Bild Feld 5)
      const q = seitlich(s, lat), y = welt.gelaendeHoehe(q.x, q.z) - 0.1, ax = q.tx * 0.5, az = q.tz * 0.5;
      quad([q.x - ax, y, q.z - az], [q.x + ax, y, q.z + az], [q.x + ax, y + h, q.z + az], [q.x - ax, y + h, q.z - az], 5);
    };
    const zonen = (STRECKE.sprung || []).filter((z) => F.kicker.includes(z.kante));
    for (const k of F.kicker) {
      const hb = netz.halbBei(k) + CONFIG.strasse.bankett * 0.5;
      const e = (s, lat) => { const q = seitlich(s, lat); return [q.x, welt.bodenBei(q.x, q.z).h + 0.05, q.z]; };
      for (let i = 0; i < 6; i++) { const l0 = -hb + (2 * hb * i) / 6, l1 = -hb + (2 * hb * (i + 1)) / 6; quad(e(k - C.kanteBreite, l0), e(k - C.kanteBreite, l1), e(k, l1), e(k, l0), 4, 0.5); }
      for (const sd of [-1, 1]) fahne(k, sd * (hb + 1.2), C.fahneHoehe);
      kicker.push({ kante: k });
    }
    // M11b.1: Kicker sichtbar machen (eigenes Mesh, damit Tests es aus- und einblenden können). Die Rampe selbst bleibt
    // die Strasse (Sprungzone): hier nur Wände, Schattenband, Tor, Zaun und Fahnen darum herum
    const kPos = [], kUv = [], kIdx = [], kq = (a, b, c, d, f, vU = 1) => {
      const n = kPos.length / 3;
      for (const [p, uu, vv] of [[a, 0, 0], [b, 1, 0], [c, 1, vU], [d, 0, vU]]) { kPos.push(...p); kUv.push(...feld(f, uu, vv)); }
      kIdx.push(n, n + 1, n + 2, n, n + 2, n + 3);
    };
    const W = C.kickerWand, TOR = C.kickerTor, ZA = C.kickerZaun;
    const boden = (s, lat, dy = 0) => { const q = seitlich(s, lat); return [q.x, welt.bodenBei(q.x, q.z).h + dy, q.z]; };
    for (const k of F.kicker) {
      const z = zonen.find((x) => x.kante === k) || { landeVon: k + 4, landeBis: k + 28 };
      // Schneewände: innen senkrecht (Feld 6), oben Schnee (Feld 10), aussen schräg zum Gelände; Höhe wächst zur Kante
      for (const sd of [-1, 1]) {
        const N = Math.round(W.anlauf / 2);
        for (let i = 0; i < N; i++) {
          const s0 = k - W.anlauf + (W.anlauf * i) / N, s1 = k - W.anlauf + (W.anlauf * (i + 1)) / N;
          const h0 = W.hoehe[0] + (W.hoehe[1] - W.hoehe[0]) * (i / N), h1 = W.hoehe[0] + (W.hoehe[1] - W.hoehe[0]) * ((i + 1) / N);
          const li = sd * (netz.halbBei(s0) + W.abstand), la = sd * (netz.halbBei(s0) + W.abstand + W.breite);
          const yr0 = boden(s0, sd * (netz.halbBei(s0) - 0.05))[1], yr1 = boden(s1, sd * (netz.halbBei(s1) - 0.05))[1];
          const P = (s, lat, y) => { const q = seitlich(s, lat); return [q.x, y, q.z]; };
          kq(P(s0, li, yr0 - 0.3), P(s1, li, yr1 - 0.3), P(s1, li, yr1 + h1), P(s0, li, yr0 + h0), 6);
          kq(P(s0, li, yr0 + h0), P(s1, li, yr1 + h1), P(s1, la, yr1 + h1), P(s0, la, yr0 + h0), 10, 0.2);
          kq(P(s0, la, yr0 + h0), P(s1, la, yr1 + h1), boden(s1, la + sd * 0.8, -0.2), boden(s0, la + sd * 0.8, -0.2), 6);
        }
        // Stirnseite an der Kante (zeigt zum Landehang)
        const li = sd * (netz.halbBei(k) + W.abstand), la = sd * (netz.halbBei(k) + W.abstand + W.breite), yr = boden(k, sd * (netz.halbBei(k) - 0.05))[1];
        const P = (lat, y) => { const q = seitlich(k, lat); return [q.x, y, q.z]; };
        kq(P(li, yr - 0.3), P(la, yr - 0.3), P(la, yr + W.hoehe[1]), P(li, yr + W.hoehe[1]), 6);
        for (let s = k - W.anlauf + 2; s <= k; s += W.fahnen) { // kleine Fahnen auf der Wand
          const q = seitlich(s, sd * (netz.halbBei(s) + W.abstand + W.breite * 0.5)), y = boden(s, sd * (netz.halbBei(s) - 0.05))[1] + W.hoehe[0] + (W.hoehe[1] - W.hoehe[0]) * ((s - k + W.anlauf) / W.anlauf);
          kq([q.x - q.tx * 0.4, y, q.z - q.tz * 0.4], [q.x + q.tx * 0.4, y, q.z + q.tz * 0.4], [q.x + q.tx * 0.4, y + 1.6, q.z + q.tz * 0.4], [q.x - q.tx * 0.4, y + 1.6, q.z - q.tz * 0.4], 5);
        }
      }
      // dunkles Band hinter der Lippe (Schatten der Kante auf dem Landehang)
      const hb = netz.halbBei(k);
      for (let i = 0; i < 6; i++) { const l0 = -hb + (2 * hb * i) / 6, l1 = -hb + (2 * hb * (i + 1)) / 6; kq(boden(k, l0, 0.05), boden(k, l1, 0.05), boden(k + C.kickerSchatten, l1, 0.05), boden(k + C.kickerSchatten, l0, 0.05), 7, 0.3); }
      // Tor über dem Anlauf: zwei Pfosten (kreuzweise), Banner quer über die Piste (beidseitig)
      const sT = k - TOR.vor, hT = netz.halbBei(sT) + TOR.abstand, d = TOR.dicke / 2;
      const yT = Math.max(...[-1, 1].map((sd) => boden(sT, sd * hT)[1]));
      for (const sd of [-1, 1]) {
        const q = seitlich(sT, sd * hT), y0 = boden(sT, sd * hT)[1] - 0.1, ax = -q.tz, az = q.tx;
        kq([q.x - ax * d, y0, q.z - az * d], [q.x + ax * d, y0, q.z + az * d], [q.x + ax * d, yT + TOR.hoehe, q.z + az * d], [q.x - ax * d, yT + TOR.hoehe, q.z - az * d], 9, 4);
        kq([q.x - q.tx * d, y0, q.z - q.tz * d], [q.x + q.tx * d, y0, q.z + q.tz * d], [q.x + q.tx * d, yT + TOR.hoehe, q.z + q.tz * d], [q.x - q.tx * d, yT + TOR.hoehe, q.z - q.tz * d], 9, 4);
      }
      const a = seitlich(sT, -hT), b = seitlich(sT, hT);
      kq([a.x, yT + TOR.hoehe - TOR.banner, a.z], [b.x, yT + TOR.hoehe - TOR.banner, b.z], [b.x, yT + TOR.hoehe, b.z], [a.x, yT + TOR.hoehe, a.z], 8, 1);
      // Fangzaun neben dem Landehang (nur Optik)
      for (const sd of [-1, 1]) for (let s = z.landeVon; s < z.landeBis; s += 4) {
        const l0 = sd * (netz.halbBei(s) + CONFIG.strasse.bankett + ZA.abstand), l1 = sd * (netz.halbBei(s + 4) + CONFIG.strasse.bankett + ZA.abstand);
        const p0 = boden(s, l0, -0.05), p1 = boden(s + 4, l1, -0.05);
        kq(p0, p1, [p1[0], p1[1] + ZA.hoehe, p1[2]], [p0[0], p0[1] + ZA.hoehe, p0[2]], 9, 0.25);
      }
    }
    if (kIdx.length) {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(kPos, 3));
      g.setAttribute('uv', new THREE.Float32BufferAttribute(kUv, 2));
      g.setIndex(kIdx); g.computeVertexNormals();
      kickerMesh = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ map: null, alphaTest: 0.5, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -2 }));
    }
    for (let s = F.von; s <= F.bis; s += C.fahnenAbstand) for (const sd of [-1, 1]) fahne(s, sd * (netz.halbBei(s) + CONFIG.strasse.bankett + 3), C.fahneHoehe * 0.8);
    if (F.bande) { // Bande quer hinter dem Ende (Werbetafel-Optik aus dem Beton-Feld und Kicker-Streifen)
      const q0 = seitlich(F.bande, -(netz.halbBei(F.bande) + 9)), q1 = seitlich(F.bande, -(netz.halbBei(F.bande) + 25));
      const y0 = welt.gelaendeHoehe(q0.x, q0.z) - 0.1, y1 = welt.gelaendeHoehe(q1.x, q1.z) - 0.1;
      quad([q0.x, y0, q0.z], [q1.x, y1, q1.z], [q1.x, y1 + 1.1, q1.z], [q0.x, y0 + 1.1, q0.z], 4, 0.3);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx); geo.computeVertexNormals();
  const tex = dekoTextur(C);
  const mesh = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ map: tex, alphaTest: 0.5, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 }));
  szene.add(mesh);
  const meshes = [mesh];
  if (kickerMesh) { kickerMesh.material.map = tex; szene.add(kickerMesh); meshes.push(kickerMesh); } // (M11b.1: zweiter Zeichenaufruf)
  return { an: true, meshes, kreuzungen, tribuenen, kicker, kickerMesh };
}
