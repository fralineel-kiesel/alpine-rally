// Start- und Zielbereich (Meilenstein 3c).
//
// An Start und Ziel ist bei einer Rallye am meisten los. Hier stehen:
//   - Startbogen und Zielbogen über der Strasse (Alu-Gerüst, Banner START / ZIEL mit Schachbrett)
//   - Absperrband an rot-weissen Stangen entlang beider Strassenseiten (wo kein Weidezaun steht),
//     Strohballen davor und in den Lücken der Weidezäune (Tore)
//   - Zuschauer in Gruppen hinter Band und Zaun (Pixel-Figuren, schauen zur Strasse, manche winken
//     oder schwenken eine Fahne)
//   - Startuhr, Zeitnahme-Zelt, Servicezelt mit Transporter (hinter der Absperrung am Start),
//     Zeitnahme-Container am Ziel, parkierte Autos, Fahnenmasten, Werbebanden (erfundene Sponsoren)
//   - mehr Bäume und Büsche, damit der Übergang zur Landschaft natürlich ist
// Regeln: nichts steht auf der Fahrbahn oder dem Bankett (alles mindestens strassenrand.abstand neben
// der Strassenmitte, Zuschauer mindestens zuschauer.abstand[0]), die Bögen sind hoch genug für Auto und
// Kamera. Alles, was man anfahren kann, ist ein Hindernis (Kreise wie beim Zaun: hart zum Halt).
// Gezeichnet wird je Bereich ein Teil (ein Material, ein Bild) und die Zuschauer (instanziert):
// zusammen 2 Zeichenaufrufe pro Bereich. Fester Zufall (startZiel.seed).
// Werte: config.js, Block "startZiel".

import * as THREE from 'three';
import { CONFIG } from './config.js';
import { zufall, mische } from './util.js';
import { baueKollision } from './kollision.js';
import { startZielAtlas, zuschauerAtlas, ZUSCHAUER_POSEN, SPONSOREN } from './startzielbild.js';

// Zuschauer-Sprite: wie die Kühe (Ansicht je nach Winkel zur Kamera), dazu 2 Bilder (Winken) und
// Farben pro Zuschauer (Farbschlüssel im Bild, siehe startzielbild.js)
const VERTEX = /* glsl */ `
  #include <common>
  #include <fog_pars_vertex>
  attribute vec3 aFuss;      // Fusspunkt in der Welt
  attribute vec4 aDaten;     // Breite, Höhe, Zeile im Bild (Pose), Helligkeit
  attribute float aBlick;    // Blickrichtung (Winkel wie beim Auto: 0 = +z)
  attribute vec2 aTakt;      // Winken: Bilder pro Sekunde, Versatz
  attribute vec3 aJacke;
  attribute vec3 aHose;
  attribute vec3 aMuetze;    // Mütze oder Fahne
  attribute vec3 aHaar;
  uniform vec2 uRaster;      // Spalten, Zeilen
  uniform float uZeit;
  varying vec2 vUv;
  varying float vHell;
  varying vec3 vJacke;
  varying vec3 vHose;
  varying vec3 vMuetze;
  varying vec3 vHaar;
  void main() {
    vec2 zurKamera = cameraPosition.xz - aFuss.xz;
    vec2 d = normalize(zurKamera + vec2(1e-4, 0.0));
    vec3 rechts = vec3(d.y, 0.0, -d.x);
    vec2 f = vec2(sin(aBlick), cos(aBlick));
    float winkel = atan(f.x * d.y - f.y * d.x, dot(f, d));
    float ansicht = mod(floor(winkel / 1.5707963 + 0.5), 4.0);
    float bild = mod(floor(uZeit * aTakt.x + aTakt.y), 2.0);
    vec3 welt = aFuss + rechts * position.x * aDaten.x + vec3(0.0, position.y * aDaten.y, 0.0);
    vUv = vec2((ansicht * 2.0 + bild + uv.x) / uRaster.x, 1.0 - (aDaten.z + 1.0 - uv.y) / uRaster.y);
    vHell = aDaten.w;
    vJacke = aJacke; vHose = aHose; vMuetze = aMuetze; vHaar = aHaar;
    vec4 mvPosition = viewMatrix * vec4(welt, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`;
const FRAGMENT = /* glsl */ `
  #include <common>
  #include <fog_pars_fragment>
  uniform sampler2D map;
  uniform vec3 uLicht;
  varying vec2 vUv;
  varying float vHell;
  varying vec3 vJacke;
  varying vec3 vHose;
  varying vec3 vMuetze;
  varying vec3 vHaar;
  void main() {
    vec4 t = texture2D(map, vUv);
    if (t.a < 0.5) discard;
    vec3 c = t.rgb;
    // Farbschlüssel: Jacke magenta, Hose cyan, Mütze/Fahne gelb, Haare grün (Helligkeit = Schatten)
    if (c.g < 0.01 && abs(c.r - c.b) < 0.01 && c.r > 0.1) c = vJacke * (0.35 + 0.65 * c.r);
    else if (c.r < 0.01 && abs(c.g - c.b) < 0.01 && c.g > 0.1) c = vHose * (0.35 + 0.65 * c.g);
    else if (c.b < 0.01 && abs(c.r - c.g) < 0.01 && c.r > 0.1) c = vMuetze * (0.35 + 0.65 * c.r);
    else if (c.r < 0.01 && c.b < 0.01 && c.g > 0.1) c = vHaar * (0.35 + 0.65 * c.g);
    gl_FragColor = vec4(c * uLicht * vHell, 1.0);
    #include <colorspace_fragment>
    #include <fog_fragment>
  }
`;

const farbe = (hex) => new THREE.Color(hex);

// pflanzen, rand, kuehe: was schon steht (Bäume, Strassenrand inkl. Absperrungen, Kühe)
export function baueStartZiel(szene, strecke, welt, { pflanzen, rand, kuehe }) {
  const t0 = performance.now();
  const C = CONFIG.startZiel;
  const leer = { hindernisse: [], hindernisseBaeume: [], zuschauer: [], tannen: [], laub: [], buesche: [], belegt: [], objekte: [], meshes: [], fern: [], aktualisiere() {}, statistik: {}, ort: null };
  if (!C || C.an === false || !welt.netz || !welt.netz.enden.length) return leer;
  const N = welt.netz, S = strecke;
  const startAst = N.ende('start'), zielAst = N.ende('ziel');
  const rnd = zufall(C.seed);

  // Punkt bei m Metern (Etappe; negativ = Verlängerung am Start, grösser als die Länge = am Ziel),
  // lat = seitlich (+ = rechts in Fahrtrichtung der Etappe). Richtung tx/tz = Fahrtrichtung der Etappe.
  function ort(m, lat = 0) {
    if (m < 0 && startAst) {
      const p = startAst.punkt(-m, -lat);
      return { x: p.x, z: p.z, h: p.h, tx: -p.tx, tz: -p.tz };
    }
    if (m > S.laenge && zielAst) return zielAst.punkt(m - S.laenge, lat);
    const p = N.etappePunkt(m);
    return { x: p.x - p.tz * lat, z: p.z + p.tx * lat, h: p.h, tx: p.tx, tz: p.tz };
  }
  const boden = (x, z) => welt.bodenBei(x, z).h;

  // --- Was schon steht: Hindernisse (Bäume, Zäune, Schilder, Absperrungen), Kühe ----------------
  const kolAlt = baueKollision([...pflanzen.hindernisse, ...rand.hindernisse]);
  const kolKuh = baueKollision(kuehe.hindernisse);
  const hindernisse = [];
  const belegt = [];  // Grundflächen der neuen Objekte: { x, z, ux, uz, l, b } (halbe Länge/Breite)
  const kreis = (x, z, r, art) => hindernisse.push({ x, z, r, rand: art });
  // Rechteck (Mitte x/z, Richtung ux/uz, halbe Länge l, halbe Breite b): Kreise rundherum (hart)
  function rechteckKreise(x, z, ux, uz, l, b, art, r = 0.35) {
    const vx = -uz, vz = ux;
    const ecken = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, c]) => [x + ux * (l - r) * a + vx * (b - r) * c, z + uz * (l - r) * a + vz * (b - r) * c]);
    for (let k = 0; k < 4; k++) {
      const [ax, az] = ecken[k], [bx, bz] = ecken[(k + 1) % 4];
      const n = Math.max(1, Math.ceil(Math.hypot(bx - ax, bz - az) / 0.6));
      for (let j = 0; j < n; j++) kreis(ax + ((bx - ax) * j) / n, az + ((bz - az) * j) / n, r, art);
    }
  }
  // Ist der Platz für einen Kreis (x, z, r) frei? (alte Hindernisse, Kühe, neue Objekte, Strassen)
  const qa = {};
  function frei(x, z, r, { strasse = CONFIG.strassenrand.abstand + 0.3, kuh = 3.5, objekt = 0.4 } = {}) {
    if (N.abfrage(x, z, qa).abstand < strasse) return false;
    if (!kolAlt.frei(x, z, r)) return false;
    if (!kolKuh.frei(x, z, r + kuh)) return false;
    for (const o of belegt) {
      const dx = x - o.x, dz = z - o.z;
      const a = Math.abs(dx * o.ux + dz * o.uz) - o.l, b = Math.abs(-dx * o.uz + dz * o.ux) - o.b;
      if (Math.hypot(Math.max(a, 0), Math.max(b, 0)) < r + objekt) return false;
    }
    return true;
  }

  // --- Geometrie: je Bereich ein Teil (ein Material) --------------------------------------
  const atlas = startZielAtlas();
  const geos = new Map();
  let G = null;
  const WEISS = farbe('#ffffff');
  function viereck(a, b, c, d, kachel, hell = 1, f = WEISS, teil = null) {
    const t = atlas.kachel(kachel);
    let u0 = t.u0, u1 = t.u1, v0 = t.v0, v1 = t.v1;
    if (teil) {
      const du = t.u1 - t.u0, dv = t.v1 - t.v0;
      [u0, u1, v0, v1] = [t.u0 + du * teil[0], t.u0 + du * teil[1], t.v0 + dv * teil[2], t.v0 + dv * teil[3]];
    }
    const basis = G.pos.length / 3;
    G.pos.push(...a, ...b, ...c, ...d);
    G.uv.push(u0, v0, u1, v0, u1, v1, u0, v1);
    for (let k = 0; k < 4; k++) G.col.push(f.r * hell, f.g * hell, f.b * hell);
    G.idx.push(basis, basis + 1, basis + 2, basis, basis + 2, basis + 3);
  }
  function dreieck(a, b, c, kachel, hell = 1, f = WEISS) {
    const t = atlas.kachel(kachel);
    const basis = G.pos.length / 3;
    G.pos.push(...a, ...b, ...c);
    G.uv.push(t.u0, t.v0, t.u1, t.v0, (t.u0 + t.u1) / 2, t.v1);
    for (let k = 0; k < 3; k++) G.col.push(f.r * hell, f.g * hell, f.b * hell);
    G.idx.push(basis, basis + 1, basis + 2);
  }
  // Quader: Mitte unten (x, y, z), Richtung (ux, uz), Länge L, Tiefe T, Höhe H. k: Kacheln je Seite
  function quader(x, y, z, ux, uz, L, T, H, k, hell = 1, f = WEISS) {
    const vx = -uz, vz = ux, l = L / 2, t = T / 2;
    const p = (a, b, oben) => [x + ux * a * l + vx * b * t, y + (oben ? H : 0), z + uz * a * l + vz * b * t];
    const ks = typeof k === 'string' ? { seite: k } : k;
    const seite = ks.seite, oben = ks.oben || seite, ende = ks.ende || seite;
    viereck(p(-1, -1, 0), p(1, -1, 0), p(1, -1, 1), p(-1, -1, 1), ks.vorne || seite, hell, f);
    viereck(p(1, 1, 0), p(-1, 1, 0), p(-1, 1, 1), p(1, 1, 1), ks.hinten || seite, hell * 0.88, f);
    viereck(p(1, -1, 0), p(1, 1, 0), p(1, 1, 1), p(1, -1, 1), ende, hell * 0.94, f);
    viereck(p(-1, 1, 0), p(-1, -1, 0), p(-1, -1, 1), p(-1, 1, 1), ende, hell * 0.94, f);
    if (oben !== 'keins') viereck(p(-1, -1, 1), p(1, -1, 1), p(1, 1, 1), p(-1, 1, 1), oben, hell * 1.05, f);
  }
  // Balken von a nach b (quadratischer Querschnitt)
  function balken(a, b, dicke, kachel, hell = 1, f = WEISS) {
    const d = new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]).normalize();
    const hilf = Math.abs(d.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
    const e1 = new THREE.Vector3().crossVectors(d, hilf).normalize().multiplyScalar(dicke / 2);
    const e2 = new THREE.Vector3().crossVectors(d, e1).normalize().multiplyScalar(dicke / 2);
    const ecke = (p, s1, s2) => [p[0] + e1.x * s1 + e2.x * s2, p[1] + e1.y * s1 + e2.y * s2, p[2] + e1.z * s1 + e2.z * s2];
    const s = [[1, 1], [-1, 1], [-1, -1], [1, -1]];
    for (let k = 0; k < 4; k++) {
      const [a1, a2] = s[k], [b1, b2] = s[(k + 1) % 4];
      viereck(ecke(a, a1, a2), ecke(a, b1, b2), ecke(b, b1, b2), ecke(b, a1, a2), kachel, hell * (k % 2 ? 0.88 : 1), f);
    }
  }
  // Rad: n-eckige Scheibe um die Achse (ax, az) (waagrecht), Mitte (x, y, z)
  function rad(x, y, z, ax, az, r, breite, n = 8) {
    const ring = (seite) => Array.from({ length: n }, (_, k) => {
      const w = (k / n) * Math.PI * 2;
      const quer = Math.cos(w) * r, hoch = Math.sin(w) * r;
      return [x + ax * seite * breite / 2 - az * quer, y + hoch, z + az * seite * breite / 2 + ax * quer];
    });
    const a = ring(-1), b = ring(1);
    for (let k = 0; k < n; k++) viereck(a[k], a[(k + 1) % n], b[(k + 1) % n], b[k], 'gummi', 0.9);
    for (const r0 of [a, b]) for (let k = 1; k < n - 1; k++) dreieck(r0[0], r0[k], r0[k + 1], 'gummi', 0.75);
  }
  // tiefster Boden unter einer Grundfläche (damit nichts schwebt)
  function bodenUnter(x, z, ux, uz, l, b) {
    let y = Infinity;
    for (const a of [-1, 0, 1]) for (const c of [-1, 0, 1]) y = Math.min(y, boden(x + ux * l * a - uz * b * c, z + uz * l * a + ux * b * c));
    return y;
  }
  function stelleHin(x, z, ux, uz, l, b, rand0 = 0.3) {
    belegt.push({ x, z, ux, uz, l: l + rand0, b: b + rand0 });
  }

  // =====================================================================
  // Bauteile
  // =====================================================================
  const cb = C.bogen;
  // Bogen quer über die Strasse bei m: zwei Gerüst-Pfosten, Querträger, Banner (vorne START/ZIEL)
  function bogen(m, art) {
    const p = ort(m), ux = p.tx, uz = p.tz, vx = -uz, vz = ux;   // v = nach rechts
    const H = cb.hoehe, D = cb.dicke, L = cb.pfosten;
    for (const sd of [-1, 1]) {
      const x = p.x + vx * sd * L, z = p.z + vz * sd * L;
      const y = boden(x, z) - 0.05;
      quader(x, y, z, ux, uz, D, D, H, { seite: 'geruest', oben: 'metall' });
      quader(x, y, z, ux, uz, D + 0.5, D + 0.5, 0.12, 'metall', 0.8);         // Fussplatte
      kreis(x, z, D * 0.5 + 0.2, 'bogen');
      stelleHin(x, z, ux, uz, D / 2 + 0.3, D / 2 + 0.3, 0.2);
    }
    // Querträger (Fachwerk) und Banner darunter
    const y0 = p.h + H - D;
    quader(p.x, y0, p.z, vx, vz, 2 * L + D, D, D, { seite: 'geruest', oben: 'geruest' });
    const bb = cb.bannerBreite / 2, bh = cb.bannerBreite * (11 / 48);
    const yo = y0 - 0.02, yu = yo - bh;
    const vorne = art === 'start' ? 'bannerStart' : 'bannerZiel';
    const e = 0.03; // vorne zur anfahrenden Seite (gegen die Fahrtrichtung)
    const pl = (sd, oben, v) => [p.x + vx * sd * bb - ux * v, oben ? yo : yu, p.z + vz * sd * bb - uz * v];
    viereck(pl(-1, 0, e), pl(1, 0, e), pl(1, 1, e), pl(-1, 1, e), vorne, 1.15);
    viereck(pl(1, 0, -e), pl(-1, 0, -e), pl(-1, 1, -e), pl(1, 1, -e), 'bannerHinten', 1.05);
    // zwei Abspannseile (dünne Balken) vom Träger zum Banner-Rand
    for (const sd of [-1, 1]) balken([p.x + vx * sd * bb, yu, p.z + vz * sd * bb], [p.x + vx * sd * (bb + 0.6), yo + 0.1, p.z + vz * sd * (bb + 0.6)], 0.04, 'metall', 0.7);
  }

  // Absperrband an Stangen von m0 bis m1 auf Seite sd (lat = band.abstand), Kollision hart
  const cBand = C.band;
  let bandMeter = 0;
  function band(m0, m1, sd) {
    const L = cBand.abstand;
    const n = Math.max(1, Math.round((m1 - m0) / cBand.pfostenAbstand));
    const posten = [];
    for (let k = 0; k <= n; k++) {
      const m = m0 + ((m1 - m0) * k) / n;
      const p = ort(m, sd * (L + (rnd() - 0.5) * 0.08));
      p.y = boden(p.x, p.z);
      posten.push(p);
      quader(p.x, p.y - 0.1, p.z, p.tx, p.tz, 0.07, 0.07, cBand.hoehe + 0.1, { seite: 'stange', oben: 'stange' });
    }
    for (let k = 0; k < n; k++) {
      const a = posten[k], b = posten[k + 1];
      for (const h of cBand.baender) {
        const teile = 3;
        for (let j = 0; j < teile; j++) {
          const f0 = j / teile, f1 = (j + 1) / teile, sag = (f) => cBand.durchhang * 4 * f * (1 - f);
          const q0 = [mische(a.x, b.x, f0), mische(a.y, b.y, f0) + h - sag(f0), mische(a.z, b.z, f0)];
          const q1 = [mische(a.x, b.x, f1), mische(a.y, b.y, f1) + h - sag(f1), mische(a.z, b.z, f1)];
          viereck([q0[0], q0[1] - 0.05, q0[2]], [q1[0], q1[1] - 0.05, q1[2]], [q1[0], q1[1] + 0.05, q1[2]], [q0[0], q0[1] + 0.05, q0[2]], 'band', 1.15);
        }
      }
      // Kollision: Kreise knapp hinter dem Band (wie beim Zaun)
      const r = 0.25, dl = Math.hypot(b.x - a.x, b.z - a.z), mm = Math.max(1, Math.round(dl / 0.6));
      const ox = -a.tz * sd * r, oz = a.tx * sd * r;
      for (let j = 0; j < mm; j++) kreis(mische(a.x, b.x, j / mm) + ox, mische(a.z, b.z, j / mm) + oz, r, 'band');
      bandMeter += dl;
    }
    const pe = posten[n];
    kreis(pe.x - pe.tz * sd * 0.25, pe.z + pe.tx * sd * 0.25, 0.25, 'band');
  }

  // Strohballen-Stapel (Kleinballen) bei m, lat: unten 2 nebeneinander, oben einer (Anzahl zufällig)
  const cS = C.stroh;
  let ballen = 0;
  function strohStapel(m, lat, laengs = true) {
    const p = ort(m, lat);
    const ux = laengs ? p.tx : -p.tz, uz = laengs ? p.tz : p.tx; // längs zur Strasse oder quer
    const vx = -uz, vz = ux;
    const [L, T, H] = cS.ballen;
    const unten = rnd() < 0.5 ? 2 : 1, oben = unten === 2 && rnd() < cS.obenAnteil ? 1 : 0;
    const y = bodenUnter(p.x, p.z, ux, uz, L * unten / 2, T / 2) - 0.03;
    for (let k = 0; k < unten; k++) {
      const a = (k - (unten - 1) / 2) * (L + 0.03), w = (rnd() - 0.5) * 0.12;
      const qx = ux * Math.cos(w) - vx * Math.sin(w), qz = uz * Math.cos(w) - vz * Math.sin(w);
      quader(p.x + ux * a, y, p.z + uz * a, qx, qz, L, T, H, { seite: 'strohSeite', ende: 'strohEnde' }, 0.9 + rnd() * 0.2);
      ballen++;
    }
    if (oben) {
      quader(p.x + vx * 0.03, y + H - 0.02, p.z + vz * 0.03, ux, uz, L, T, H, { seite: 'strohSeite', ende: 'strohEnde' }, 0.9 + rnd() * 0.2);
      ballen++;
    }
    const l2 = (L * unten) / 2;
    for (const a of unten === 2 ? [-l2 / 2, l2 / 2] : [0]) kreis(p.x + ux * a, p.z + uz * a, Math.max(T / 2 + 0.05, 0.3), 'stroh');
    stelleHin(p.x, p.z, ux, uz, l2, T / 2, 0.1);
  }

  // Werbebande (Sponsor) bei m, lat, schaut zur Strasse
  function bande(m, lat, k) {
    const p = ort(m, lat), sd = Math.sign(lat);
    const bx = p.tz * sd, bz = -p.tx * sd;            // zur Strasse hin
    const ux = p.tx, uz = p.tz, l = 1.3, y = boden(p.x, p.z);
    const e = (a, h, v = 0) => [p.x + ux * a * l + bx * v, y + h, p.z + uz * a * l + bz * v];
    viereck(e(-1, 0.25, 0.02), e(1, 0.25, 0.02), e(1, 0.9, 0.02), e(-1, 0.9, 0.02), `sponsor${k}`, 1.1, WEISS, sd > 0 ? [1, 0, 0, 1] : null);
    viereck(e(1, 0.25, -0.02), e(-1, 0.25, -0.02), e(-1, 0.9, -0.02), e(1, 0.9, -0.02), 'plane', 0.85);
    for (const a of [-0.85, 0.85]) balken([p.x + ux * a * l - bx * 0.05, y - 0.05, p.z + uz * a * l - bz * 0.05], [p.x + ux * a * l - bx * 0.05, y + 0.95, p.z + uz * a * l - bz * 0.05], 0.05, 'metall', 0.8);
    kreis(p.x, p.z, 0.3, 'bande'); kreis(p.x + ux * 0.9, p.z + uz * 0.9, 0.3, 'bande'); kreis(p.x - ux * 0.9, p.z - uz * 0.9, 0.3, 'bande');
    stelleHin(p.x, p.z, ux, uz, l, 0.1, 0.25);
  }

  // Fahnenmast mit Fahne (Kreuz, Zielflagge oder einfarbig)
  function fahnenmast(m, lat, art, f = WEISS) {
    const p = ort(m, lat), y = boden(p.x, p.z), H = C.fahne.hoehe;
    if (!frei(p.x, p.z, 0.3, { objekt: 0.2 })) return false;
    balken([p.x, y - 0.1, p.z], [p.x, y + H, p.z], 0.08, 'metall', 0.95);
    // Fahne weht quer zur Strasse (Wind vom Tal), leicht gewellt: drei Streifen
    const wx = p.tx, wz = p.tz, b = C.fahne.breite, h = C.fahne.hoehe2;
    const kachel = art === 'kreuz' ? 'fahneKreuz' : art === 'karo' ? 'fahneKaro' : 'stoff';
    for (let k = 0; k < 3; k++) {
      const a0 = (k / 3) * b, a1 = ((k + 1) / 3) * b;
      const w0 = Math.sin(k * 1.7) * 0.12, w1 = Math.sin((k + 1) * 1.7) * 0.12;
      const q = (a, w, oben) => [p.x + wx * a - wz * w, y + H - 0.05 - (oben ? 0 : h) - a * 0.06, p.z + wz * a + wx * w];
      viereck(q(a0, w0, 0), q(a1, w1, 0), q(a1, w1, 1), q(a0, w0, 1), kachel, 1.1, f, [k / 3, (k + 1) / 3, 0, 1]);
    }
    kreis(p.x, p.z, 0.15, 'fahne');
    stelleHin(p.x, p.z, 1, 0, 0.1, 0.1, 0.3);
    return true;
  }

  // Beachflag (hohe, schmale Werbefahne, gebogen), f = Nummer des Sponsors
  function beachflag(m, lat, f) {
    const p = ort(m, lat), y = boden(p.x, p.z);
    if (!frei(p.x, p.z, 0.3, { objekt: 0.2 })) return false;
    const H = 3.4;
    balken([p.x, y - 0.05, p.z], [p.x, y + H, p.z], 0.04, 'metall', 0.9);
    // Stoff mit dem Sponsor-Bild, Schrift von unten nach oben (u läuft die Höhe hinauf)
    const stufen = 5;
    for (let k = 0; k < stufen; k++) {
      const h0 = 0.9 + (k / stufen) * (H - 1.0), h1 = 0.9 + ((k + 1) / stufen) * (H - 1.0);
      const b0 = 0.55 + Math.sin((k / stufen) * Math.PI) * 0.15, b1 = 0.55 + Math.sin(((k + 1) / stufen) * Math.PI) * 0.15;
      const krumm0 = (k / stufen) ** 2 * 0.35, krumm1 = ((k + 1) / stufen) ** 2 * 0.35;
      viereck([p.x, y + h0, p.z], [p.x, y + h1, p.z], [p.x + p.tx * (b1 + krumm1), y + h1, p.z + p.tz * (b1 + krumm1)],
        [p.x + p.tx * (b0 + krumm0), y + h0, p.z + p.tz * (b0 + krumm0)], `sponsor${f}`, 1.05, WEISS, [k / stufen, (k + 1) / stufen, 0, 1]);
    }
    kreis(p.x, p.z, 0.15, 'fahne');
    stelleHin(p.x, p.z, 1, 0, 0.1, 0.1, 0.3);
    return true;
  }

  // Zelt (Pavillon): vier Beine, Dach als Pyramide, Volant rundherum; hinten optional eine Wand
  function zelt(m, lat, breite, tiefe, dach, volantVorne, volantSonst, { wand = false, tisch = true } = {}) {
    const p = ort(m, lat), sd = Math.sign(lat);
    const ux = p.tx, uz = p.tz, vx = -uz * sd, vz = ux * sd; // v = von der Strasse weg
    const l = breite / 2, b = tiefe / 2, y = bodenUnter(p.x, p.z, ux, uz, l, b) - 0.03;
    const he = 2.15, hd = he + Math.min(breite, tiefe) * 0.33;
    const e = (a, c, h) => [p.x + ux * l * a + vx * b * c, y + h, p.z + uz * l * a + vz * b * c];
    for (const [a, c] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) balken(e(a, c, -0.05), e(a, c, he), 0.07, 'metall');
    const spitze = [p.x, y + hd, p.z];
    const ecken = [e(-1, -1, he), e(1, -1, he), e(1, 1, he), e(-1, 1, he)];
    for (let k = 0; k < 4; k++) dreieck(ecken[k], ecken[(k + 1) % 4], spitze, dach, 1.05 - (k % 2) * 0.08);
    // Volant (30 cm) rundherum; vorne (zur Strasse) mit Aufschrift
    const vol = [[e(1, -1, he - 0.3), e(-1, -1, he - 0.3), e(-1, -1, he), e(1, -1, he)], [e(-1, 1, he - 0.3), e(1, 1, he - 0.3), e(1, 1, he), e(-1, 1, he)],
      [e(1, 1, he - 0.3), e(1, -1, he - 0.3), e(1, -1, he), e(1, 1, he)], [e(-1, -1, he - 0.3), e(-1, 1, he - 0.3), e(-1, 1, he), e(-1, -1, he)]];
    vol.forEach((q, k) => viereck(...q, k === 0 ? volantVorne : volantSonst, 1.05, WEISS, sd < 0 && k === 0 ? [1, 0, 0, 1] : null));
    if (wand) {
      viereck(e(-1, 1, 0), e(1, 1, 0), e(1, 1, he - 0.3), e(-1, 1, he - 0.3), 'plane', 0.95);
      viereck(e(-1, -0.2, 0), e(-1, 1, 0), e(-1, 1, he - 0.3), e(-1, -0.2, he - 0.3), 'plane', 0.9);
      viereck(e(1, 1, 0), e(1, -0.2, 0), e(1, -0.2, he - 0.3), e(1, 1, he - 0.3), 'plane', 0.9);
    }
    if (tisch) {
      const t = [p.x + vx * b * 0.1, p.z + vz * b * 0.1];
      quader(t[0], y, t[1], ux, uz, Math.min(1.8, breite * 0.6), 0.6, 0.76, { seite: 'holz', oben: 'holz' }, 0.95);
    }
    rechteckKreise(p.x, p.z, ux, uz, l, b, 'zelt');
    stelleHin(p.x, p.z, ux, uz, l, b, 0.4);
  }

  // Container (Zeitnahme): geripptes Blech, Fenster und Tür zur Strasse, Schild auf dem Dach
  function container(m, lat) {
    const p = ort(m, lat), sd = Math.sign(lat), ux = p.tx, uz = p.tz, vx = -uz * sd, vz = ux * sd;
    const L = 6, T = 2.45, H = 2.6, y = bodenUnter(p.x, p.z, ux, uz, L / 2, T / 2) - 0.05;
    quader(p.x, y, p.z, ux, uz, L, T, H, { seite: 'container', oben: 'container' });
    const w = (a, h, c = -1.01) => [p.x + ux * a + vx * c * T / 2, y + h, p.z + uz * a + vz * c * T / 2];
    for (const a of [-1.8, 0.6]) viereck(w(a - 0.7, 1.0), w(a + 0.7, 1.0), w(a + 0.7, 1.9), w(a - 0.7, 1.9), 'fenster', 1);
    viereck(w(1.7, 0.02), w(2.5, 0.02), w(2.5, 2.1), w(1.7, 2.1), 'tuer', 1);
    // Schild auf dem Dach (schaut zur Strasse)
    const s = (a, h) => [p.x + ux * a - vx * T * 0.3, y + H + h, p.z + uz * a - vz * T * 0.3];
    viereck(s(-1.8, 0.05), s(1.8, 0.05), s(1.8, 0.7), s(-1.8, 0.7), 'schildZeit', 1.15, WEISS, sd > 0 ? [1, 0, 0, 1] : null);
    for (const a of [-1.5, 1.5]) balken([...s(a, 0)], [...s(a, 0.55)], 0.05, 'metall', 0.7);
    balken([p.x + ux * 2.6, y + H, p.z + uz * 2.6], [p.x + ux * 2.6, y + H + 1.6, p.z + uz * 2.6], 0.03, 'metall', 0.6); // Antenne
    // Treppe vor der Tür
    quader(p.x + ux * 2.1 - vx * (T / 2 + 0.35), y, p.z + uz * 2.1 - vz * (T / 2 + 0.35), ux, uz, 1.0, 0.7, 0.22, 'metall', 0.7);
    rechteckKreise(p.x, p.z, ux, uz, L / 2, T / 2, 'container');
    stelleHin(p.x, p.z, ux, uz, L / 2 + 0.6, T / 2 + 0.8, 0.3);
  }

  // Startuhr: Tafel auf zwei Pfosten, schaut zum wartenden Auto (gegen die Fahrtrichtung)
  function startuhr(m, lat) {
    const p = ort(m, lat), y = boden(p.x, p.z), ux = -p.tz, uz = p.tx; // quer zur Strasse
    const b = 0.75, u = 1.3, o = u + 0.85;
    const e = (a, h, v = 0) => [p.x + ux * a * b - p.tx * v, y + h, p.z + uz * a * b - p.tz * v];
    viereck(e(-1, u, 0.06), e(1, u, 0.06), e(1, o, 0.06), e(-1, o, 0.06), 'uhr', 1.2);
    quader(p.x, y + u, p.z, ux, uz, 2 * b + 0.04, 0.1, o - u, { seite: 'metall', vorne: 'metall', hinten: 'metall' }, 0.55);
    for (const a of [-0.8, 0.8]) balken(e(a, -0.05), e(a, u + 0.1), 0.08, 'metall', 0.85);
    kreis(e(-0.8, 0)[0], e(-0.8, 0)[2], 0.2, 'uhr'); kreis(e(0.8, 0)[0], e(0.8, 0)[2], 0.2, 'uhr');
    stelleHin(p.x, p.z, ux, uz, b + 0.1, 0.15, 0.3);
  }

  // Auto (Kombi, low-poly) oder Transporter, Mitte (x, z), Richtung (ux, uz), Farbe
  function fahrzeug(x, z, ux, uz, f, art = 'auto') {
    const vx = -uz, vz = ux;
    const L = art === 'transporter' ? 5.0 : 4.3, B = art === 'transporter' ? 2.0 : 1.75;
    const y = bodenUnter(x, z, ux, uz, L / 2, B / 2) - 0.02;
    const lack = { seite: 'lack', oben: 'lack' };
    if (art === 'transporter') {
      quader(x - ux * 0.45, y + 0.35, z - uz * 0.45, ux, uz, L - 0.9, B, 1.95, lack, 1, f);              // Kasten
      quader(x + ux * (L / 2 - 0.45), y + 0.35, z + uz * (L / 2 - 0.45), ux, uz, 0.9, B * 0.96, 0.85, lack, 1, f); // Motorhaube
      // Frontscheibe schräg, Seitenfenster vorne
      const fr = (a, c, h) => [x + ux * a + vx * c, y + h, z + uz * a + vz * c];
      viereck(fr(L / 2 - 0.9, -B * 0.46, 1.2), fr(L / 2 - 0.9, B * 0.46, 1.2), fr(L / 2 - 1.25, B * 0.46, 2.2), fr(L / 2 - 1.25, -B * 0.46, 2.2), 'scheibe', 1);
      for (const c of [-1, 1]) viereck(fr(L / 2 - 1.3, c * (B / 2 + 0.01), 1.3), fr(L / 2 - 2.2, c * (B / 2 + 0.01), 1.3), fr(L / 2 - 2.2, c * (B / 2 + 0.01), 2.0), fr(L / 2 - 1.3, c * (B / 2 + 0.01), 2.0), 'scheibe', 1);
      // roter Streifen und Sponsor auf der Seite
      for (const c of [-1, 1]) {
        viereck(fr(-L / 2 + 0.1, c * (B / 2 + 0.012), 0.75), fr(L / 2 - 0.95, c * (B / 2 + 0.012), 0.75), fr(L / 2 - 0.95, c * (B / 2 + 0.012), 0.95), fr(-L / 2 + 0.1, c * (B / 2 + 0.012), 0.95), 'stoff', 1, farbe('#c8202a'));
        const t = [fr(-1.6, c * (B / 2 + 0.014), 1.25), fr(0.8, c * (B / 2 + 0.014), 1.25), fr(0.8, c * (B / 2 + 0.014), 1.75), fr(-1.6, c * (B / 2 + 0.014), 1.75)];
        if (c < 0) viereck(t[1], t[0], t[3], t[2], 'sponsor2', 1.05); else viereck(...t, 'sponsor2', 1.05);
      }
      for (const c of [-1, 1]) viereck(fr(L / 2 + 0.01, c * 0.75, 0.75), fr(L / 2 + 0.01, c * 0.45, 0.75), fr(L / 2 + 0.01, c * 0.45, 0.9), fr(L / 2 + 0.01, c * 0.75, 0.9), 'licht', 1.2);
    } else {
      quader(x, y + 0.3, z, ux, uz, L, B, 0.62, lack, 1, f);
      // Dach mit schrägen Scheiben (Trapez): unten 2.5 m, oben 1.7 m lang
      const fr = (a, c, h) => [x + ux * a + vx * c, y + h, z + uz * a + vz * c];
      const hU = 0.92, hO = 1.38, bU = B * 0.47, bO = B * 0.4;
      const uV = 0.6, uH = -1.9, oV = 0.05, oH = -1.65;
      viereck(fr(uV, -bU, hU), fr(uV, bU, hU), fr(oV, bO, hO), fr(oV, -bO, hO), 'scheibe', 1);   // Frontscheibe
      viereck(fr(uH, bU, hU), fr(uH, -bU, hU), fr(oH, -bO, hO), fr(oH, bO, hO), 'scheibe', 0.9); // Heckscheibe
      for (const c of [-1, 1]) viereck(fr(uH, c * bU, hU), fr(uV, c * bU, hU), fr(oV, c * bO, hO), fr(oH, c * bO, hO), 'scheibe', 0.95);
      viereck(fr(oH, -bO, hO), fr(oV, -bO, hO), fr(oV, bO, hO), fr(oH, bO, hO), 'lack', 1.05, f);   // Dach
      for (const c of [-1, 1]) viereck(fr(L / 2 + 0.01, c * 0.72, 0.55), fr(L / 2 + 0.01, c * 0.42, 0.55), fr(L / 2 + 0.01, c * 0.42, 0.72), fr(L / 2 + 0.01, c * 0.72, 0.72), 'licht', 1.2);
      viereck(fr(L / 2 + 0.01, -0.35, 0.5), fr(L / 2 + 0.01, 0.35, 0.5), fr(L / 2 + 0.01, 0.35, 0.72), fr(L / 2 + 0.01, -0.35, 0.72), 'grill', 1);
    }
    const ra = art === 'transporter' ? 1.65 : 1.35, rr = 0.33;
    for (const a of [-ra, ra]) for (const c of [-1, 1]) rad(x + ux * a + vx * c * (B / 2 - 0.08), y + rr, z + uz * a + vz * c * (B / 2 - 0.08), vx, vz, rr, 0.24);
    rechteckKreise(x, z, ux, uz, L / 2, B / 2, 'auto');
    stelleHin(x, z, ux, uz, L / 2, B / 2, 0.5);
  }
  const fahrzeugBei = (m, lat, winkel, f, art) => {
    const p = ort(m, lat), w = (winkel * Math.PI) / 180;
    fahrzeug(p.x, p.z, p.tx * Math.cos(w) - p.tz * Math.sin(w), p.tz * Math.cos(w) + p.tx * Math.sin(w), f, art);
  };

  // =====================================================================
  // Bereiche
  // =====================================================================
  const P = rand.plan;
  const zaeune = [...P.zaunLaeufe, ...P.plankenLaeufe];
  const bereiche = [
    { name: 'start', linie: S.startS, von: -startAst.sperre.aussen.u, bis: S.startS + C.bereich.nach, zuschauer: C.zuschauer.start },
    { name: 'ziel', linie: S.zielS, von: S.zielS - C.bereich.vor, bis: S.zielS + C.bereich.nach, zuschauer: C.zuschauer.ziel },
  ];
  const meshes = [], zuschauerListe = [], objekte = [];
  const ZF = C.zuschauer;
  const jacken = ZF.jacken.map(farbe), hosen = ZF.hosen.map(farbe), muetzen = ZF.muetzen.map(farbe), haare = ZF.haare.map(farbe);
  const wahl = (liste) => liste[Math.floor(rnd() * liste.length)];

  for (const B of bereiche) {
    G = { pos: [], uv: [], col: [], idx: [] };
    geos.set(B.name, G);
    const start = B.name === 'start';
    // 1. Bogen über der Linie
    bogen(B.linie, B.name);
    // 2. Weidezäune im Bereich (bleiben stehen): Lücken (Tore) mit Strohballen schliessen,
    //    dazwischen Absperrband, wo kein Zaun steht
    for (const sd of [-1, 1]) {
      const zu = zaeune.filter((l) => l.seite === sd && l.bis > B.von - 1 && l.von < B.bis + 1).map((l) => [l.von, l.bis]).sort((a, b) => a[0] - b[0]);
      let m = B.von;
      for (const [a, b] of zu) {
        if (a - m > 1) band(m, Math.min(a, B.bis), sd);
        m = Math.max(m, b);
      }
      if (B.bis - m > 1) band(m, B.bis, sd);
      // Tore im Bereich: Strohballen in die Lücke (quer zur Strasse würde der Ballen ins Tor ragen: längs)
      for (const t of P.tore.filter((t) => t.seite === sd && t.bis > B.von - 2 && t.von < B.bis + 2)) {
        const breite = Math.abs(t.bis - t.von), n = Math.max(2, Math.ceil(breite / 1.05));
        for (let k = 0; k < n; k++) strohStapel(t.von + ((k + 0.5) * breite) / n, sd * (CONFIG.strassenrand.abstand + 0.1), true);
      }
    }
    // 3. Strohballen in lockeren Abständen vor Band und Zaun
    for (const sd of [-1, 1]) {
      let m = B.von + 4 + rnd() * 6;
      while (m < B.bis - 2) {
        if (Math.abs(m - B.linie) > 3) strohStapel(m, sd * cS.abstand, true);
        m += mische(cS.alle[0], cS.alle[1], rnd());
      }
    }
    // 4. Startuhr / Zeitnahme, Zelte, Container, Fahrzeuge
    if (start) {
      startuhr(B.linie - 1.6, C.platz.uhr);
      zelt(B.linie + 5.5, C.platz.zeitzelt, 3, 3, 'dachRot', 'schildZeit', 'sponsor0');
      zelt(-startAst.sperre.aussen.u - 13, C.platz.servicezelt, 5, 4, 'dachBlau', 'sponsor2', 'sponsor2', { wand: true });
      fahrzeugBei(-startAst.sperre.aussen.u - 9, -0.6, 180, farbe('#f2f0e8'), 'transporter');
      fahrzeugBei(B.linie + C.platz.autoStart[0], C.platz.autoStart[1], C.platz.autoStart[2], farbe(C.autoFarben[0]));
    } else {
      container(B.linie + 7, C.platz.container);
      zelt(B.linie - 14, C.platz.zielzelt, 3, 3, 'dachGelb', 'sponsor3', 'sponsor1');
      fahrzeugBei(B.linie + C.platz.autoZiel[0], C.platz.autoZiel[1], C.platz.autoZiel[2], farbe(C.autoFarben[1]));
    }
    // 5. Fahnen, Beachflags, Werbebanden
    for (const [dm, lat, art] of C.fahne.plaetze) {
      const f = art === 'farbe' ? farbe(wahl(ZF.muetzen)) : WEISS;
      fahnenmast(B.linie + dm, lat, art, f);
    }
    for (const [dm, lat] of C.platz.beachflags) beachflag(B.linie + dm, lat, Math.floor(rnd() * SPONSOREN.length));
    let kB = start ? 0 : 2;
    for (const sd of [-1, 1]) {
      for (let m = B.von + 10 + rnd() * 6; m < B.bis - 4; m += mische(C.bande.alle[0], C.bande.alle[1], rnd())) {
        if (Math.abs(m - B.linie) < 6) continue;
        const ok = [-0.9, 0, 0.9].every((a) => {
          const p = ort(m + a, sd * C.bande.abstand);
          return frei(p.x, p.z, 0.35, { strasse: C.bande.abstand - 0.2, objekt: 0.05 });
        });
        if (!ok) continue;
        bande(m, sd * C.bande.abstand, kB++ % SPONSOREN.length);
      }
    }
    objekte.push({ bereich: B.name, belegt: belegt.length });

    // 6. Zuschauer in Gruppen hinter Band und Zaun
    const liste = [];
    let versuche = 0;
    while (liste.length < B.zuschauer && versuche++ < 400) {
      const sd = rnd() < 0.5 ? -1 : 1;
      const mVon = Math.max(B.von + 3, start ? -startAst.sperre.aussen.u + 3 : B.von), mBis = B.bis - 2;
      const mm = mische(mVon, mBis, rnd());
      const anzahl = Math.round(mische(ZF.gruppe[0], ZF.gruppe[1], rnd()));
      for (let k = 0; k < anzahl && liste.length < B.zuschauer; k++) {
        for (let v = 0; v < 10; v++) {
          const m = mm + (rnd() - 0.5) * ZF.gruppeLaenge;
          const lat = sd * (ZF.abstand[0] + Math.pow(rnd(), 1.6) * (ZF.abstand[1] - ZF.abstand[0]));
          if (m < mVon || m > mBis) continue;
          const p = ort(m, lat);
          if (N.abfrage(p.x, p.z, qa).abstand < ZF.abstand[0]) continue;
          if (!frei(p.x, p.z, ZF.radius, { strasse: ZF.abstand[0], kuh: 3, objekt: 0.3 })) continue;
          if (liste.some((z) => (z.x - p.x) ** 2 + (z.z - p.z) ** 2 < ZF.dicht * ZF.dicht)) continue;
          // Blick zur Strasse (Richtung Linie leicht dazu), etwas zufällig
          const q = ort(mische(m, B.linie, 0.25 * rnd()), 0);
          const blick = Math.atan2(q.x - p.x, q.z - p.z) + (rnd() - 0.5) * ZF.blickStreuung;
          const zp = rnd();
          let pose = 0, summe = 0;
          for (let i = 0; i < ZF.posen.length; i++) { summe += ZF.posen[i]; if (zp <= summe) { pose = i; break; } }
          const kind = rnd() < ZF.kinder;
          const groesse = kind ? mische(0.6, 0.72, rnd()) : mische(ZF.groesse[0], ZF.groesse[1], rnd()) / 1.75;
          const name = ZUSCHAUER_POSEN[pose];
          const muetze = name.startsWith('fahne') && rnd() < 0.7 ? farbe(ZF.fahnenRot) : farbe(wahl(ZF.muetzen));
          const takt = name === 'winkend' || name === 'jubelnd' || name.startsWith('fahne') ? mische(ZF.winken[0], ZF.winken[1], rnd()) : 0;
          liste.push({
            x: p.x, z: p.z, y: welt.gelaendeHoehe(p.x, p.z) - 0.04, m, lat, blick, pose, groesse, hell: 0.9 + rnd() * 0.15,
            jacke: wahl(jacken), hose: wahl(hosen), muetze, haar: wahl(haare), takt, phase: rnd() * 2, bereich: B.name,
          });
          kreis(p.x, p.z, ZF.radius, 'zuschauer');
          break;
        }
      }
    }
    zuschauerListe.push(...liste);
  }

  // --- Meshes: Aufbau je Bereich -----------------------------------------------------
  const material = new THREE.MeshLambertMaterial({ map: atlas.textur, vertexColors: true, flatShading: true, side: THREE.DoubleSide, alphaTest: 0.5 });
  let dreiecke = 0;
  for (const [name, g] of geos) {
    if (!g.idx.length) continue;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(g.pos, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(g.uv, 2));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(g.col, 3));
    geo.setIndex(g.idx);
    geo.computeVertexNormals();
    geo.computeBoundingSphere();
    const mesh = new THREE.Mesh(geo, material);
    mesh.name = `startziel-${name}`;
    szene.add(mesh);
    meshes.push(mesh);
    dreiecke += g.idx.length / 3;
  }

  // --- Zuschauer: ein Sprite pro Person, je Bereich ein Zeichenaufruf ------------------------
  const zatlas = zuschauerAtlas();
  const l = CONFIG.licht;
  const licht = new THREE.Color(l.umgebungFarbe).multiplyScalar(l.umgebungStaerke)
    .add(new THREE.Color(l.sonneFarbe).multiplyScalar(l.sonneStaerke * 0.55)).multiplyScalar(CONFIG.sprites.helligkeit);
  const zMaterial = new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, {
      map: { value: null }, uLicht: { value: licht }, uRaster: { value: new THREE.Vector2(zatlas.spalten, zatlas.zeilen) }, uZeit: { value: 0 },
    }]),
    vertexShader: VERTEX, fragmentShader: FRAGMENT, fog: true,
  });
  zMaterial.uniforms.map.value = zatlas.textur;
  const zMeshes = [];
  for (const name of ['start', 'ziel']) {
    const liste = zuschauerListe.filter((z) => z.bereich === name);
    if (!liste.length) continue;
    const basis = new THREE.PlaneGeometry(1, 1);
    basis.translate(0, 0.5, 0);
    const geo = new THREE.InstancedBufferGeometry();
    geo.index = basis.index;
    geo.setAttribute('position', basis.attributes.position);
    geo.setAttribute('uv', basis.attributes.uv);
    const n = liste.length;
    const fuss = new Float32Array(n * 3), daten = new Float32Array(n * 4), blick = new Float32Array(n), takt = new Float32Array(n * 2);
    const fa = [new Float32Array(n * 3), new Float32Array(n * 3), new Float32Array(n * 3), new Float32Array(n * 3)];
    let cx = 0, cz = 0, cy = 0;
    liste.forEach((z, i) => {
      fuss.set([z.x, z.y, z.z], i * 3);
      daten.set([zatlas.zelleM[0] * z.groesse, zatlas.zelleM[1] * z.groesse, z.pose, z.hell], i * 4);
      blick[i] = z.blick;
      takt.set([z.takt, z.phase], i * 2);
      [z.jacke, z.hose, z.muetze, z.haar].forEach((c, k) => fa[k].set([c.r, c.g, c.b], i * 3));
      cx += z.x / n; cy += z.y / n; cz += z.z / n;
    });
    geo.setAttribute('aFuss', new THREE.InstancedBufferAttribute(fuss, 3));
    geo.setAttribute('aDaten', new THREE.InstancedBufferAttribute(daten, 4));
    geo.setAttribute('aBlick', new THREE.InstancedBufferAttribute(blick, 1));
    geo.setAttribute('aTakt', new THREE.InstancedBufferAttribute(takt, 2));
    ['aJacke', 'aHose', 'aMuetze', 'aHaar'].forEach((a, k) => geo.setAttribute(a, new THREE.InstancedBufferAttribute(fa[k], 3)));
    geo.instanceCount = n;
    // Kugel um alle Zuschauer des Bereichs: so wird der Bereich nicht gezeichnet, wenn er nicht im Bild ist
    let r = 0;
    for (const z of liste) r = Math.max(r, Math.hypot(z.x - cx, z.y - cy, z.z - cz));
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(cx, cy, cz), r + 3);
    const mesh = new THREE.Mesh(geo, zMaterial);
    mesh.name = `zuschauer-${name}`;
    szene.add(mesh);
    zMeshes.push(mesh);
  }

  // --- Bäume und Büsche: Übergang zur Landschaft (Daten; gezeichnet von sprites.js) -----------
  const tannen = [], laub = [], buesche = [];
  const kolNeu = () => baueKollision([...pflanzen.hindernisse, ...rand.hindernisse, ...hindernisse]);
  let kolFest = kolNeu();
  const cL = C.landschaft;
  const baumListe = [...pflanzen.tannen, ...pflanzen.laubbaeume];
  const rasterB = new Map(), ZB = 8;
  const rk = (x, z) => `${Math.floor(x / ZB)},${Math.floor(z / ZB)}`;
  for (const b of baumListe) { const k = rk(b.x, b.z); if (!rasterB.has(k)) rasterB.set(k, []); rasterB.get(k).push(b); }
  const baumNah = (x, z, d) => {
    const ix = Math.floor(x / ZB), iz = Math.floor(z / ZB);
    for (let a = ix - 1; a <= ix + 1; a++) for (let c = iz - 1; c <= iz + 1; c++) for (const b of rasterB.get(`${a},${c}`) || []) if ((b.x - x) ** 2 + (b.z - z) ** 2 < d * d) return true;
    return false;
  };
  const tanneTex = pflanzen.tanne, laubTex = pflanzen.laubTex;
  for (const gr of cL.gruppen) {
    const B = bereiche.find((b) => b.name === gr.bereich);
    for (let g = 0; g < gr.anzahl; g++) {
      // Gruppenmitte, dann 3-8 Bäume darum
      const m = B.linie + mische(gr.m[0], gr.m[1], rnd()), lat = gr.seite * mische(gr.lat[0], gr.lat[1], rnd());
      const mitte = ort(m, lat);
      const n = Math.round(mische(cL.proGruppe[0], cL.proGruppe[1], rnd()));
      for (let k = 0; k < n; k++) {
        const w = rnd() * Math.PI * 2, d = Math.sqrt(rnd()) * cL.gruppeRadius;
        const x = mitte.x + Math.cos(w) * d, z = mitte.z + Math.sin(w) * d;
        const istLaub = rnd() < cL.laubAnteil;
        const tex = istLaub ? laubTex : tanneTex;
        const h = istLaub ? mische(...CONFIG.sprites.laubHoehe, rnd()) : mische(...CONFIG.sprites.tannenHoehe, rnd());
        const variante = Math.floor(rnd() * tex.varianten), hell = 0.82 + rnd() * 0.26, spiegeln = rnd() < 0.5;
        if (N.abfrage(x, z, qa).abstand < cL.strasse) continue;
        if (!kolKuh.frei(x, z, 2.5) || !kolFest.frei(x, z, 1.2) || baumNah(x, z, 2.6)) continue;
        if (zuschauerListe.some((zz) => (zz.x - x) ** 2 + (zz.z - z) ** 2 < 4)) continue;
        if (belegt.some((o) => Math.hypot(x - o.x, z - o.z) < Math.hypot(o.l, o.b) + 1.5)) continue;
        const baum = { x, z, y: welt.gelaendeHoehe(x, z) - 0.25, h, b: h * tex.seitenVerhaeltnis, variante, hell, spiegeln, startZiel: true };
        (istLaub ? laub : tannen).push(baum);
        const kk = rk(x, z);
        if (!rasterB.has(kk)) rasterB.set(kk, []);
        rasterB.get(kk).push(baum);
      }
    }
  }
  // Büsche: hinter den Zuschauern, um Zelte und Bäume (keine Kollision; deko baut sie mit ein)
  for (const B of bereiche) {
    for (let k = 0; k < cL.buesche; k++) {
      const sd = rnd() < 0.5 ? -1 : 1;
      const m = mische(B.von - 15, B.bis + 25, rnd()), lat = sd * mische(cL.buschLat[0], cL.buschLat[1], rnd());
      const p = ort(m, lat);
      buesche.push({ x: p.x, z: p.z, gras: rnd() < 0.3 });
    }
  }
  const hindernisseBaeume = [...tannen, ...laub].map((t) => ({ x: t.x, z: t.z, r: CONFIG.kollision.stammRadius }));

  // --- Jedes Bild: Winken, weit Entferntes nicht zeichnen ------------------------------------
  let zeit = 0;
  const fern = []; // zusätzliche Meshes (z. B. die Absperrungen an Start und Ziel), die weit weg ausgehen
  function aktualisiere(dt, kamPos) {
    zeit += dt;
    zMaterial.uniforms.uZeit.value = zeit;
    for (const m of [...meshes, ...zMeshes, ...fern]) {
      const k = m.geometry.boundingSphere;
      m.visible = k.center.distanceTo(kamPos) - k.radius < C.sichtweite;
    }
  }

  const statistik = {
    zuschauer: zuschauerListe.length, start: zuschauerListe.filter((z) => z.bereich === 'start').length,
    ziel: zuschauerListe.filter((z) => z.bereich === 'ziel').length, ballen, bandMeter: Math.round(bandMeter),
    tannen: tannen.length, laub: laub.length, buesche: buesche.length, hindernisse: hindernisse.length + hindernisseBaeume.length,
    dreiecke, ms: Math.round(performance.now() - t0),
  };
  return {
    hindernisse, hindernisseBaeume, zuschauer: zuschauerListe, tannen, laub, buesche, belegt, meshes: [...meshes, ...zMeshes], fern,
    aktualisiere, statistik, ort, objekte,
  };
}
