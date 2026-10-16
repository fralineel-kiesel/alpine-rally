// Leben an der Strecke (Meilenstein 3d).
//
//   1. Wiesenweg als Alpweide: Alphütte (Steinsockel, Bretter, Schindeldach, kleine Fenster, Holzstapel),
//      kleiner Heustadel, Brunnentrog, Steinmännchen, gelber Wegweiser, Heurollen, Findlinge.
//      (Zaun und neue Kühe: strassenrand.js und kuehe.js, Werte hier im selben Config-Block.)
//   2. Drei Fan-Spots: Zuschauer wie am Start/Ziel (Pixel-Figuren, schauen zur Strasse) hinter Absperrband,
//      dazu Banner mit erfundenen Fanclubs, Fahnen, Klappstühle, Wohnmobil, Pavillon, Pickup.
//   3. Zwei Unfallautos: Fantasie-Rallyeautos im Stil der 80er-Gruppe B (kantig, breite Radkästen,
//      Heckflügel, Dachhutze, Zusatzscheinwerfer, Käfig, Schmutzfänger, Startnummern, erfundene Sponsoren),
//      beschädigt (eingedrückt, Rad schief oder ab, Haube/Tür offen, Glas kaputt), dezente Rauchfahne,
//      Warndreieck, gelbe Flagge und Streckenposten. Kein Mensch im Auto.
// Regeln: nichts näher als leben.abstandStrasse an einer Strassenmitte (Fans: fans.abstand), nichts auf
// der Innenseite einer Kurve (Abkürzungs-Kurven plus Puffer und jede engere Kurve, auch auf den
// Nebenwegen), nichts auf schon stehenden Bäumen, Zäunen oder Kühen. Was man anfahren kann, ist ein
// Hindernis (Kreise wie beim Zaun: hart zum Halt). Ein Ort, der eine Regel bricht, wird weggelassen und
// in statistik.abgelehnt gemeldet (tools/leben-test.mjs prüft, dass das nie passiert).
// Gezeichnet wird je Ort ein Teil (ein Material), die Figuren je Ort (instanziert) und der Rauch je Wrack
// (instanziert, läuft ganz im Shader: kein Rechnen pro Bild). Fester Zufall (leben.seed).
// Werte: config.js, Block "leben".

import * as THREE from 'three';
import { CONFIG } from './config.js';
import { zufall, mische } from './util.js';
import { baueKollision } from './kollision.js';
import { lebenAtlas } from './lebenbild.js';
import { zuschauerAtlas, ZUSCHAUER_POSEN } from './startzielbild.js';
import { ZUSCHAUER_VERTEX, ZUSCHAUER_FRAGMENT } from './startziel.js';

const GRAD = Math.PI / 180;
const farbe = (hex) => new THREE.Color(hex);
const WEISS = new THREE.Color('#ffffff');

// Plätze, die für die neuen Kühe frei bleiben (Hütte, Stadel, Brunnen, Details am Wiesenweg).
// netz = Strassennetz (js/netz.js). Ergebnis: Kreise { x, z, r }
export function lebenPlaetze(netz) {
  const L = CONFIG.leben;
  if (!L || L.an === false) return [];
  const W = L.wiesenweg, aus = [];
  const p = (s, seite, lat, r) => { const q = netz.etappePunkt(s); aus.push({ x: q.x - q.tz * seite * lat, z: q.z + q.tx * seite * lat, r }); };
  for (const h of [W.huette, W.stadel]) if (h) p(h.s, h.seite, h.lat, Math.hypot(h.laenge, h.tiefe) / 2 + 2.5);
  if (W.brunnen) p(W.brunnen.s, W.brunnen.seite, W.brunnen.lat, 2.5);
  for (const [s, sd, lat] of [...(W.steinmaennchen || []), ...(W.heurollen || [])]) p(s, sd, lat, 1.6);
  for (const [s, sd, lat, h] of W.findlinge || []) p(s, sd, lat, h + 0.8);
  if (W.wegweiser) p(W.wegweiser.s, W.wegweiser.seite, W.wegweiser.lat, 1.2);
  return aus;
}

// Rauch: Billboards, Position und Grösse rechnet der Shader aus der Zeit (Wölkchen steigen, wachsen,
// werden durchsichtiger und fangen von vorne an). Gerastert durchscheinend wie der Staub.
const RAUCH_VERTEX = /* glsl */ `
  #include <common>
  #include <fog_pars_vertex>
  attribute vec4 aStart;     // x, y, z, Phase 0..1
  uniform float uZeit;
  uniform vec4 uRauch;       // Lebensdauer, Steigen (m/s), Grösse am Anfang, am Ende
  uniform vec2 uWind;
  varying vec2 vUv;
  varying float vDichte;
  void main() {
    float t = fract(uZeit / uRauch.x + aStart.w);
    vec3 p = aStart.xyz + vec3(uWind.x * t * uRauch.x, uRauch.y * t * uRauch.x, uWind.y * t * uRauch.x);
    float g = mix(uRauch.z, uRauch.w, sqrt(t));
    vUv = uv;
    vDichte = smoothstep(0.0, 0.12, t) * (1.0 - t);
    vec4 mvPosition = viewMatrix * vec4(p, 1.0);
    mvPosition.xy += position.xy * g;
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`;
const RAUCH_FRAGMENT = /* glsl */ `
  #include <common>
  #include <fog_pars_fragment>
  uniform vec3 uFarbe;
  uniform float uDichte;
  varying vec2 vUv;
  varying float vDichte;
  float raster(vec2 p) {
    vec2 q = mod(floor(p), 4.0);
    float i = q.x + q.y * 4.0;
    if (i < 0.5) return 0.0;   if (i < 1.5) return 8.0;  if (i < 2.5) return 2.0;  if (i < 3.5) return 10.0;
    if (i < 4.5) return 12.0;  if (i < 5.5) return 4.0;  if (i < 6.5) return 14.0; if (i < 7.5) return 6.0;
    if (i < 8.5) return 3.0;   if (i < 9.5) return 11.0; if (i < 10.5) return 1.0; if (i < 11.5) return 9.0;
    if (i < 12.5) return 15.0; if (i < 13.5) return 7.0; if (i < 14.5) return 13.0; return 5.0;
  }
  void main() {
    float r = length(vUv - 0.5) * 2.0;
    float dichte = uDichte * vDichte * clamp(1.0 - r, 0.0, 1.0) * 2.0;
    if (dichte * 16.0 <= raster(gl_FragCoord.xy) + 0.5) discard;
    gl_FragColor = vec4(uFarbe * (0.9 + 0.15 * (1.0 - r)), 1.0);
    #include <colorspace_fragment>
    #include <fog_fragment>
  }
`;

// pflanzen, rand, kuehe: was schon steht
export function baueLeben(szene, strecke, welt, { pflanzen, rand, kuehe }) {
  const t0 = performance.now();
  const L = CONFIG.leben;
  const leer = { hindernisse: [], figuren: [], buesche: [], orte: [], belegt: [], meshes: [], wracks: [], aktualisiere() {}, statistik: { abgelehnt: [] } };
  if (!L || L.an === false || !welt.netz) return leer;
  const N = welt.netz, S = strecke;
  const rnd = zufall(L.seed);

  // Punkt bei s Metern der Etappe, lat seitlich (+ = rechts). tx/tz = Fahrtrichtung
  function ort(s, lat = 0) {
    const p = N.etappePunkt(s);
    return { x: p.x - p.tz * lat, z: p.z + p.tx * lat, h: p.h, tx: p.tx, tz: p.tz };
  }
  const boden = (x, z) => welt.bodenBei(x, z).h;

  // --- Was schon steht ------------------------------------------------------------------------
  const kolAlt = baueKollision([...pflanzen.hindernisse, ...rand.hindernisse]);
  const kolKuh = baueKollision(kuehe.hindernisse);
  const kolKrone = baueKollision([...pflanzen.tannen, ...pflanzen.laubbaeume].map((t) => ({ x: t.x, z: t.z, r: Math.max(0.45, t.b * 0.38) })));
  const hindernisse = [];
  const belegt = []; // Grundflächen der neuen Objekte { x, z, ux, uz, l, b } (halbe Länge/Breite)
  const abgelehnt = [], verschoben = [];
  // Passt ein Objekt nicht an die Wunschstelle, ein paar Meter daneben versuchen (entlang, weiter weg).
  // fn(ds, dl) baut das Objekt um ds Meter entlang und dl Meter weiter weg verschoben (meldet sich bei Misserfolg in "abgelehnt")
  const VERSATZ = [[0, 0], [3, 0], [-3, 0], [0, 2], [0, -1.5], [6, 0], [-6, 0], [3, 2], [-3, 2], [0, 4], [6, 3], [-6, 3], [9, 0], [-9, 0], [0, 6]];
  function versuche(name, fn) {
    for (const [ds, dl] of VERSATZ) {
      const n = abgelehnt.length;
      const erg = fn(ds, dl);
      if (abgelehnt.length === n) { if (ds || dl) verschoben.push(`${name}: ${ds} m entlang, ${dl} m weiter weg`); return erg; }
      abgelehnt.length = n;
    }
    return fn(0, 0); // keiner ging: so lassen (steht dann in "abgelehnt")
  }
  const kreis = (x, z, r, art) => hindernisse.push({ x, z, r, rand: art, leben: true });
  function rechteckKreise(x, z, ux, uz, l, b, art, r = 0.35) {
    const vx = -uz, vz = ux;
    const ecken = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, c]) => [x + ux * (l - r) * a + vx * (b - r) * c, z + uz * (l - r) * a + vz * (b - r) * c]);
    for (let k = 0; k < 4; k++) {
      const [ax, az] = ecken[k], [bx, bz] = ecken[(k + 1) % 4];
      const n = Math.max(1, Math.ceil(Math.hypot(bx - ax, bz - az) / 0.6));
      for (let j = 0; j < n; j++) kreis(ax + ((bx - ax) * j) / n, az + ((bz - az) * j) / n, r, art);
    }
  }
  const stelleHin = (x, z, ux, uz, l, b, rand0 = 0.3) => belegt.push({ x, z, ux, uz, l: l + rand0, b: b + rand0 });

  // Innenseiten der Kurven: Abkürzungs-Kurven (plus Puffer) und jede Kurve enger als innenRadius.
  // Je Seite und Streckenmeter: bis so weit neben der Strasse ist es "innen" (0 = gar nicht)
  const innenBis = [new Float32Array(S.anzahl), new Float32Array(S.anzahl)];
  const sNr = (seite) => (seite > 0 ? 1 : 0);
  const markiere = (von, bis, seite, breite) => {
    const arr = innenBis[sNr(seite)];
    for (let i = Math.max(0, Math.floor(von)); i <= Math.min(S.anzahl - 1, Math.ceil(bis)); i++) arr[i] = Math.max(arr[i], breite);
  };
  for (const [liste, puffer] of [[S.nichtSchneiden, L.pufferNichtSchneiden], [S.schneiden, L.pufferSchneiden]]) {
    for (const k of liste) markiere(k.sVon - puffer, k.sBis + puffer, k.seite === 'rechts' ? 1 : -1, 1e9);
  }
  for (let i = 0; i < S.anzahl; i++) {
    const a = Math.max(0, i - 5), b = Math.min(S.anzahl - 1, i + 5);
    const w = Math.atan2(S.tx[b], S.tz[b]) - Math.atan2(S.tx[a], S.tz[a]);
    const k = Math.atan2(Math.sin(w), Math.cos(w)) / Math.max(1, b - a); // > 0 = Linkskurve
    if (Math.abs(k) >= 1 / L.innenRadius) markiere(i - L.innenVorNach, i + L.innenVorNach, k > 0 ? -1 : 1, L.innenBreite);
  }
  const istInnen = (s, seite, abstand) => {
    const i = Math.max(0, Math.min(S.anzahl - 1, Math.round(s)));
    return abstand < innenBis[sNr(seite)][i];
  };
  // Darf hier etwas mit Radius r stehen? (Strasse, Innenseiten, Felswand, alte Hindernisse, Kühe, neue Objekte)
  const qa = {}, qb = {}, qc = {};
  let grund = ''; // warum der letzte Platz nicht ging (für statistik.abgelehnt)
  function platzOk(x, z, r, { strasse = L.abstandStrasse, objekt = 0.3, kuh = 2.5, krone = false } = {}) {
    const nein = (g) => { grund = g; return false; };
    if (N.abfrage(x, z, qa).abstand < strasse + r) return nein('Strasse');
    S.abfrage(x, z, qb);
    if (istInnen(qb.s, Math.sign(qb.seite), qb.abstand)) return nein('Kurven-Innenseite');
    if (qb.wandSeite && Math.sign(qb.seite) === qb.wandSeite && qb.wandStaerke > 0.05 && qb.abstand < 30) return nein('Felswand');
    const ast = S.andererAst(x, z, qb.s, 30, 60, qc);
    if (ast && (ast.abstand < strasse + r || istInnen(ast.s, Math.sign(ast.seite), ast.abstand))) return nein('andere Kehre');
    if (!kolAlt.frei(x, z, r)) return nein('Baum/Zaun/Stein');
    if (krone && !kolKrone.frei(x, z, r)) return nein('Baumkrone');
    if (!kolKuh.frei(x, z, r + kuh)) return nein('Kuh');
    for (const o of belegt) {
      const dx = x - o.x, dz = z - o.z;
      const a = Math.abs(dx * o.ux + dz * o.uz) - o.l, b = Math.abs(-dx * o.uz + dz * o.ux) - o.b;
      if (Math.hypot(Math.max(a, 0), Math.max(b, 0)) < r + objekt) return nein('anderes neues Objekt');
    }
    return true;
  }
  // ganze Grundfläche prüfen (Rechteck: Punkte am Rand und innen)
  function flaecheOk(x, z, ux, uz, l, b, opt) {
    const vx = -uz, vz = ux;
    for (let a = -1; a <= 1.001; a += 0.5) for (let c = -1; c <= 1.001; c += 0.5) {
      if (!platzOk(x + ux * l * a + vx * b * c, z + uz * l * a + vz * b * c, 0.4, opt)) return false;
    }
    return true;
  }

  // --- Geometrie: je Ort ein Teil ---------------------------------------------------------------
  const atlas = lebenAtlas();
  const geos = new Map();
  let G = null;
  // Rahmen: lokale Koordinaten [a (rechts), y (hoch), b (vorne)] -> Welt. Standard: Welt = lokal
  let T = (p) => p;
  function rahmen(x, y, z, ux, uz, { nick = 0, roll = 0, verform = null } = {}) {
    const rx = -uz, rz = ux, cn = Math.cos(nick), sn = Math.sin(nick), cr = Math.cos(roll), sr = Math.sin(roll);
    T = (p) => {
      let [a, yy, b] = verform ? verform(p) : p;
      const y1 = yy * cn + b * sn, b1 = b * cn - yy * sn;   // Nicken (Nase hoch = +)
      const y2 = y1 * cr - a * sr, a2 = a * cr + y1 * sr;   // Rollen (rechte Seite runter = +)
      return [x + rx * a2 + ux * b1, y + y2, z + rz * a2 + uz * b1];
    };
  }
  function poly(pts, uvs, kachel, hell = 1, f = WEISS) {
    const t = atlas.kachel(kachel);
    const basis = G.pos.length / 3;
    for (let k = 0; k < pts.length; k++) {
      G.pos.push(...T(pts[k]));
      G.uv.push(t.u0 + (t.u1 - t.u0) * uvs[k][0], t.v0 + (t.v1 - t.v0) * uvs[k][1]);
      G.col.push(f.r * hell, f.g * hell, f.b * hell);
    }
    for (let k = 1; k < pts.length - 1; k++) G.idx.push(basis, basis + k, basis + k + 1);
  }
  // Viereck a-b-c-d (unten links, unten rechts, oben rechts, oben links), teil = [u0, u1, v0, v1] der Kachel
  function viereck(a, b, c, d, kachel, hell = 1, f = WEISS, teil = null) {
    const [u0, u1, v0, v1] = teil || [0, 1, 0, 1];
    poly([a, b, c, d], [[u0, v0], [u1, v0], [u1, v1], [u0, v1]], kachel, hell, f);
  }
  const dreieck = (a, b, c, kachel, hell = 1, f = WEISS) => poly([a, b, c], [[0, 0], [1, 0], [0.5, 1]], kachel, hell, f);
  // Kiste aus 8 Ecken: unten [hinten links, hinten rechts, vorne rechts, vorne links], oben ebenso.
  // k: Kacheln { seite, vorne, hinten, oben, unten, links, rechts } ('keins' = Fläche weglassen)
  function kiste(e, k, hell = 1, f = WEISS) {
    const ks = typeof k === 'string' ? { seite: k } : k;
    const sei = ks.seite;
    const fl = [[0, 1, 5, 4, ks.hinten || sei, 0.86], [1, 2, 6, 5, ks.rechts || sei, 0.94], [2, 3, 7, 6, ks.vorne || sei, 1],
      [3, 0, 4, 7, ks.links || sei, 0.94], [4, 5, 6, 7, ks.oben || sei, 1.06], [3, 2, 1, 0, ks.unten || 'keins', 0.7]];
    for (const [i0, i1, i2, i3, kach, h] of fl) if (kach !== 'keins') viereck(e[i0], e[i1], e[i2], e[i3], kach, hell * h, f);
  }
  // Quader in lokalen Koordinaten: a0..a1, y0..y1, b0..b1; oben optional schmaler (einzug a, b)
  function quader(a0, a1, y0, y1, b0, b1, k, hell = 1, f = WEISS, { einA = 0, einB = 0, einV = 0 } = {}) {
    kiste([[a0, y0, b0], [a1, y0, b0], [a1, y0, b1], [a0, y0, b1],
      [a0 + einA, y1, b0 + einB], [a1 - einA, y1, b0 + einB], [a1 - einA, y1, b1 - einV], [a0 + einA, y1, b1 - einV]], k, hell, f);
  }
  // Balken von p nach q (lokal), quadratischer Querschnitt
  function balken(p, q, dicke, kachel, hell = 1, f = WEISS) {
    const d = new THREE.Vector3(q[0] - p[0], q[1] - p[1], q[2] - p[2]).normalize();
    const hilf = Math.abs(d.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
    const e1 = new THREE.Vector3().crossVectors(d, hilf).normalize().multiplyScalar(dicke / 2);
    const e2 = new THREE.Vector3().crossVectors(d, e1).normalize().multiplyScalar(dicke / 2);
    const ecke = (o, s1, s2) => [o[0] + e1.x * s1 + e2.x * s2, o[1] + e1.y * s1 + e2.y * s2, o[2] + e1.z * s1 + e2.z * s2];
    const s = [[1, 1], [-1, 1], [-1, -1], [1, -1]];
    for (let k = 0; k < 4; k++) {
      const [a1, a2] = s[k], [b1, b2] = s[(k + 1) % 4];
      viereck(ecke(p, a1, a2), ecke(p, b1, b2), ecke(q, b1, b2), ecke(q, a1, a2), kachel, hell * (k % 2 ? 0.88 : 1), f);
    }
  }
  // Zylinder um eine Achse (lokal): Mitte m, Achse ach (Einheitsvektor), Radius r, Länge len, n Ecken.
  // seite / ende: Kacheln (Ende rund abgebildet)
  function zylinder(m, ach, r, len, n, seite, ende, hell = 1, f = WEISS, endeHell = 1) {
    const hilf = Math.abs(ach[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0];
    const e1 = norm(kreuz(ach, hilf)), e2 = kreuz(ach, e1);
    const ring = (sd) => Array.from({ length: n }, (_, k) => {
      const w = (k / n) * Math.PI * 2, c = Math.cos(w) * r, s = Math.sin(w) * r;
      return [m[0] + ach[0] * sd * len / 2 + e1[0] * c + e2[0] * s, m[1] + ach[1] * sd * len / 2 + e1[1] * c + e2[1] * s, m[2] + ach[2] * sd * len / 2 + e1[2] * c + e2[2] * s];
    });
    const A = ring(-1), B = ring(1);
    for (let k = 0; k < n; k++) viereck(A[k], A[(k + 1) % n], B[(k + 1) % n], B[k], seite, hell * (0.85 + 0.15 * Math.cos((k / n) * Math.PI * 2)), f, [k / n, (k + 1) / n, 0, 1]);
    const uvRing = Array.from({ length: n }, (_, k) => [0.5 + 0.5 * Math.cos((k / n) * Math.PI * 2), 0.5 + 0.5 * Math.sin((k / n) * Math.PI * 2)]);
    if (ende) { poly(B, uvRing, ende, endeHell, f); poly([...A].reverse(), [...uvRing].reverse(), ende, endeHell * 0.9, f); }
  }
  // Brocken (Findling, Stein): drei unregelmässige Ringe und eine Spitze, Mitte unten m, Radius r, Höhe h
  function brocken(m, r, h, kachel, hell = 1) {
    const n = 6, w0 = rnd() * Math.PI;
    const ring = (rr, y, dw) => Array.from({ length: n }, (_, k) => {
      const w = w0 + dw + (k / n) * Math.PI * 2, f2 = rr * (0.8 + rnd() * 0.35);
      return [m[0] + Math.cos(w) * f2, m[1] + y, m[2] + Math.sin(w) * f2 * 0.85];
    });
    const R = [ring(r * 0.85, -0.25, 0), ring(r, h * 0.42, 0.5), ring(r * 0.55, h * 0.82, 0.2)];
    const top = [m[0] + (rnd() - 0.5) * r * 0.3, m[1] + h, m[2] + (rnd() - 0.5) * r * 0.3];
    for (let j = 0; j < 2; j++) for (let k = 0; k < n; k++) viereck(R[j][k], R[j][(k + 1) % n], R[j + 1][(k + 1) % n], R[j + 1][k], kachel, hell * (0.8 + 0.25 * ((k + j) % 3) / 2));
    for (let k = 0; k < n; k++) dreieck(R[2][k], R[2][(k + 1) % n], top, kachel, hell * 1.08);
  }
  const kreuz = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const norm = (a) => { const l = Math.hypot(...a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
  // Rad: Achse quer (lokal a), Mitte (a, y, b), Radius r, Breite w; sturz/spur in Grad (schiefes Rad)
  function rad(a, y, b, r, w, { sturz = 0, spur = 0 } = {}) {
    const cs = Math.cos(sturz * GRAD), ss = Math.sin(sturz * GRAD), cp = Math.cos(spur * GRAD), sp = Math.sin(spur * GRAD);
    const ach = norm([cs * cp, ss, -cs * sp]);
    zylinder([a, y, b], ach, r, w, 10, 'gummi', 'felge', 0.95, WEISS, 1.05);
  }

  // =====================================================================
  // Bauteile: Landschaft und Fans
  // =====================================================================
  // Ort mit Richtung: Mitte bei (s, lat), lokal b = entlang der Strasse gedreht um "drehung" (Grad)
  function platzRahmen(s, lat, drehung = 0, y = null) {
    const p = ort(s, lat), w = drehung * GRAD;
    const ux = p.tx * Math.cos(w) - p.tz * Math.sin(w) * 1, uz = p.tz * Math.cos(w) + p.tx * Math.sin(w);
    return { x: p.x, z: p.z, ux, uz, y };
  }
  function bodenUnter(x, z, ux, uz, l, b) {
    let y = Infinity;
    for (const a of [-1, 0, 1]) for (const c of [-1, 0, 1]) y = Math.min(y, boden(x + ux * l * a - uz * b * c, z + uz * l * a + ux * b * c));
    return y;
  }

  // Alphütte / Heustadel: Steinsockel, Bretterwände, Satteldach mit Schindeln (First entlang b)
  function huette(cfg, stadel) {
    const R = platzRahmen(cfg.s, cfg.seite * cfg.lat, cfg.drehung);
    const lb = cfg.laenge / 2, ta = cfg.tiefe / 2; // halbe Länge (b) und Tiefe (a)
    if (!flaecheOk(R.x, R.z, R.ux, R.uz, lb + 0.6, ta + 0.6, { krone: true })) { abgelehnt.push(stadel ? 'stadel' : 'huette'); return null; }
    const y0 = bodenUnter(R.x, R.z, R.ux, R.uz, lb, ta);
    const yHoch = Math.max(...[-1, 1].flatMap((a) => [-1, 1].map((c) => boden(R.x + R.ux * lb * a - R.uz * ta * c, R.z + R.uz * lb * a + R.ux * ta * c))));
    rahmen(R.x, y0, R.z, R.ux, R.uz);
    const sockel = (yHoch - y0) + (stadel ? 0.35 : 0.55), H = cfg.hoehe, dach = cfg.tiefe * (stadel ? 0.42 : 0.36);
    // zur Strasse hin: Seite a = -cfg.seite (die Hütte steht neben der Strasse, ihre Front zeigt hin)
    const vorn = -cfg.seite;
    if (stadel) {
      // auf Steinblöcken (Luft unter dem Boden), Bretter mit Lücken
      for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1], [0, -1], [0, 1]]) quader(a * ta - 0.25, a * ta + 0.25, -0.3, sockel, b * lb - 0.25, b * lb + 0.25, 'steinmauer', 0.95);
    } else quader(-ta - 0.08, ta + 0.08, -0.4, sockel, -lb - 0.08, lb + 0.08, 'steinmauer', 1);
    quader(-ta, ta, sockel, sockel + H, -lb, lb, { seite: 'bretter', oben: 'keins' }, stadel ? 0.92 : 1);
    // Giebel (Dreiecke an den Enden b = ±lb) und Dach
    const yt = sockel + H, yf = yt + dach, ue = 0.4, ueb = 0.35;
    for (const b of [-lb, lb]) dreieck([b < 0 ? ta : -ta, yt, b], [b < 0 ? -ta : ta, yt, b], [0, yf, b], 'bretterQuer', 0.9);
    for (const sd of [-1, 1]) {
      const unten = (bb) => [sd * (ta + ue), yt - ue * (dach / ta), bb], oben = (bb) => [0, yf + 0.06, bb];
      viereck(unten(-lb - ueb), unten(lb + ueb), oben(lb + ueb), oben(-lb - ueb), 'schindel', sd > 0 ? 1.04 : 0.86);
    }
    // Front: Tür und Fenster; Rückseite ein Fenster
    const fa = vorn * (ta + 0.02);
    const flaeche = (a, b0, b1, h0, h1, kachel, hell = 1) => viereck([a, h0, b0], [a, h0, b1], [a, h1, b1], [a, h1, b0], kachel, hell);
    if (stadel) {
      flaeche(fa, -0.9, 0.9, sockel + 0.05, sockel + H - 0.15, 'htuer', 0.95);
    } else {
      flaeche(fa, -0.45 - lb * 0.15, 0.45 - lb * 0.15, sockel, sockel + 1.85, 'htuer');
      for (const b of [-lb * 0.62, lb * 0.45]) flaeche(fa, b - 0.55, b + 0.55, sockel + 0.95, sockel + 1.6, 'hfenster', 1.05);
      flaeche(-fa, -0.5, 0.5, sockel + 0.95, sockel + 1.55, 'hfenster', 0.95);
      for (const b of [-lb - 0.02, lb + 0.02]) viereck([-0.5, sockel + 1.0, b], [0.5, sockel + 1.0, b], [0.5, sockel + 1.6, b], [-0.5, sockel + 1.6, b], 'hfenster', 0.9);
      // Kamin aus Stein
      quader(-0.3 - ta * 0.3, 0.3 - ta * 0.3, yt + dach * 0.5, yf + 0.7, lb * 0.4 - 0.3, lb * 0.4 + 0.3, 'steinmauer', 0.9);
      // Holzstapel an der Stirnseite (b = -lb), Bank vor der Front
      if (L.wiesenweg.holzstapel) {
        const hb = -lb - 0.55;
        quader(-ta + 0.3, ta - 0.3, -0.1, 1.5, hb - 0.5, hb + 0.5, { seite: 'rinde', vorne: 'holzende', hinten: 'holzende', oben: 'rinde', links: 'holzende', rechts: 'holzende' }, 1);
        viereck([-ta, yt - 0.4, hb - 0.75], [ta, yt - 0.4, hb - 0.75], [ta, 1.75, hb - 0.75], [-ta, 1.75, hb - 0.75], 'schindel', 0.75); // Vordach über dem Holz
      }
      quader(fa + vorn * 0.35 - 0.2, fa + vorn * 0.35 + 0.2, sockel - 0.1, sockel + 0.45, 0.6, 2.2, { seite: 'bretterQuer' }, 0.9); // Bank
    }
    const lx = lb + (stadel ? 0.5 : 1.3) * 0.5 + (stadel ? 0 : 0.6), lz = ta + 0.2;
    rechteckKreise(R.x - R.ux * (stadel ? 0 : 0.3), R.z - R.uz * (stadel ? 0 : 0.3), R.ux, R.uz, lx, lz, stadel ? 'stadel' : 'huette', 0.4);
    stelleHin(R.x, R.z, R.ux, R.uz, lx + 0.4, lz + 0.6, 0.5);
    return { x: R.x, z: R.z, ux: R.ux, uz: R.uz, l: lx, b: lz };
  }

  function brunnen(cfg) {
    const R = platzRahmen(cfg.s, cfg.seite * cfg.lat, cfg.drehung);
    if (!flaecheOk(R.x, R.z, R.ux, R.uz, 1.3, 0.5)) { abgelehnt.push('brunnen' + ` (${grund})`); return; }
    const y0 = bodenUnter(R.x, R.z, R.ux, R.uz, 1.2, 0.45);
    rahmen(R.x, y0, R.z, R.ux, R.uz);
    quader(-0.45, 0.45, -0.15, 0.62, -1.2, 1.2, { seite: 'bretterQuer', oben: 'keins' }, 1.2);   // Trog (Holz)
    viereck([-0.38, 0.55, -1.12], [0.38, 0.55, -1.12], [0.38, 0.55, 1.12], [-0.38, 0.55, 1.12], 'wasser', 1.1);
    for (const a of [-0.45, 0.45]) viereck([a, 0.62, -1.2], [a, 0.62, 1.2], [a * 0.84, 0.62, 1.2], [a * 0.84, 0.62, -1.2], 'bretterQuer', 1.05); // Rand oben
    balken([0, -0.1, 1.42], [0, 1.25, 1.42], 0.22, 'bretterQuer', 0.85);                            // Brunnenstock
    balken([0, 1.0, 1.36], [0, 0.95, 0.85], 0.06, 'metall', 0.8);                                   // Röhre
    rechteckKreise(R.x + R.ux * 0.1, R.z + R.uz * 0.1, R.ux, R.uz, 1.45, 0.5, 'brunnen', 0.3);
    stelleHin(R.x, R.z, R.ux, R.uz, 1.5, 0.5, 0.4);
  }

  function wegweiser(cfg) {
    const p = ort(cfg.s, cfg.seite * cfg.lat);
    if (!platzOk(p.x, p.z, 0.3, { strasse: 0 }) || N.abfrage(p.x, p.z, qa).abstand < L.abstandStrasse) { abgelehnt.push('wegweiser' + ` (${grund})`); return; }
    const y = boden(p.x, p.z);
    rahmen(p.x, y, p.z, p.tx, p.tz);
    balken([0, -0.1, 0], [0, 2.3, 0], 0.1, 'bretterQuer', 0.9);
    // drei Tafeln zeigen in Fahrtrichtung (Richtung Hütte), lesbar von der Strasse; Rückseite schlicht gelb
    const gelb = farbe('#f0c020');
    const tafel = (y0, kachel, l) => {
      const h = 0.24;
      viereck([0.06, y0, -0.05], [0.06, y0, l], [0.06, y0 + h, l], [0.06, y0 + h, -0.05], kachel, 1.15);
      viereck([-0.06, y0, l], [-0.06, y0, -0.05], [-0.06, y0 + h, -0.05], [-0.06, y0 + h, l], 'stoff', 0.95, gelb);
    };
    tafel(1.95, 'weg1', 1.15); tafel(1.65, 'weg2', 1.15); tafel(1.35, 'weg3', 1.15);
    kreis(p.x, p.z, 0.15, 'wegweiser');
    stelleHin(p.x, p.z, p.tx, p.tz, 0.2, 0.2, 0.3);
  }

  function steinmann(s, sd, lat) {
    const p = ort(s, sd * lat);
    if (!platzOk(p.x, p.z, 0.6)) { abgelehnt.push(`steinmann ${s}` + ` (${grund})`); return; }
    const y = boden(p.x, p.z);
    T = (q) => q;
    let h = y - 0.05, r = 0.42;
    for (let k = 0; k < 5; k++) {
      const hh = r * (0.55 + rnd() * 0.25);
      brocken([p.x + (rnd() - 0.5) * 0.08, h, p.z + (rnd() - 0.5) * 0.08], r, hh, k % 2 ? 'flechte' : 'fels', 0.95 + rnd() * 0.15);
      h += hh * 0.8; r *= 0.78;
    }
    kreis(p.x, p.z, 0.45, 'steinmann');
    stelleHin(p.x, p.z, 1, 0, 0.5, 0.5, 0.3);
  }

  function heurolle(s, sd, lat) {
    const p = ort(s, sd * lat);
    if (!platzOk(p.x, p.z, 0.9)) { abgelehnt.push(`heurolle ${s}` + ` (${grund})`); return; }
    const w = rnd() * Math.PI, ach = [Math.cos(w), 0, Math.sin(w)], r = 0.68;
    T = (q) => q;
    zylinder([p.x, boden(p.x, p.z) + r - 0.06, p.z], ach, r, 1.2, 10, 'rolleSeite', 'rolleEnde', 1.0 + rnd() * 0.1, WEISS, 1.3);
    for (const f of [-0.35, 0.35]) kreis(p.x + ach[0] * f, p.z + ach[2] * f, 0.66, 'heurolle');
    stelleHin(p.x, p.z, ach[0], ach[2], 0.6, 0.68, 0.3);
  }

  function findling(s, sd, lat, h) {
    const p = ort(s, sd * lat), r = h * 0.75;
    if (!platzOk(p.x, p.z, r * 0.9, { krone: true })) { abgelehnt.push(`findling ${s}` + ` (${grund})`); return; }
    T = (q) => q;
    brocken([p.x, boden(p.x, p.z), p.z], r, h, rnd() < 0.5 ? 'fels' : 'flechte', 0.92 + rnd() * 0.12);
    kreis(p.x, p.z, r * 0.8, 'findling');
    stelleHin(p.x, p.z, 1, 0, r, r, 0.3);
  }

  // Absperrband an rot-weissen Stangen von s0 bis s1 (lat mit Vorzeichen), Kollision hart wie ein Zaun
  let bandMeter = 0;
  function band(s0, s1, lat) {
    const sd = Math.sign(lat), n = Math.max(1, Math.round((s1 - s0) / 3));
    const posten = [];
    T = (q) => q;
    for (let k = 0; k <= n; k++) {
      const s = s0 + ((s1 - s0) * k) / n;
      const p = ort(s, lat + (rnd() - 0.5) * 0.1);
      p.y = boden(p.x, p.z);
      p.ok = platzOk(p.x, p.z, 0.2, { strasse: L.abstandStrasse - 0.7, kuh: 1, objekt: 0 }); // gleiche Regeln wie alles andere
      posten.push(p);
    }
    for (let k = 0; k <= n; k++) {
      const p = posten[k];
      if (p.ok) balken([p.x, p.y - 0.1, p.z], [p.x, p.y + 1.05, p.z], 0.07, 'stange', 1);
      if (k === n) break;
      const q = posten[k + 1];
      if (!p.ok || !q.ok) continue;
      for (const hb of [0.95, 0.55]) {
        for (let j = 0; j < 3; j++) {
          const f0 = j / 3, f1 = (j + 1) / 3, sag = (f) => 0.05 * 4 * f * (1 - f);
          const a = [mische(p.x, q.x, f0), mische(p.y, q.y, f0) + hb - sag(f0), mische(p.z, q.z, f0)];
          const b = [mische(p.x, q.x, f1), mische(p.y, q.y, f1) + hb - sag(f1), mische(p.z, q.z, f1)];
          viereck([a[0], a[1] - 0.05, a[2]], [b[0], b[1] - 0.05, b[2]], [b[0], b[1] + 0.05, b[2]], [a[0], a[1] + 0.05, a[2]], 'band', 1.15);
        }
      }
      const r = 0.25, dl = Math.hypot(q.x - p.x, q.z - p.z), mm = Math.max(1, Math.round(dl / 0.6));
      const ox = -p.tz * sd * r, oz = p.tx * sd * r;
      for (let j = 0; j <= mm; j++) kreis(mische(p.x, q.x, j / mm) + ox, mische(p.z, q.z, j / mm) + oz, r, 'band');
      bandMeter += dl;
    }
  }

  // Fan-Banner auf zwei Pfosten, schaut zur Strasse
  function banner(s, lat, name) {
    const p = ort(s, lat), sd = Math.sign(lat);
    const t = atlas.kachel(`banner_${name}`);
    const l = 0.065 * (t.u1 - t.u0) * 256; // Länge nach Kachelbreite (1 Pixel = 6.5 cm)
    const ok = [-1, 0, 1].every((a) => platzOk(p.x + p.tx * a * l / 2, p.z + p.tz * a * l / 2, 0.2, { strasse: L.fans.abstand - 0.6 }));
    if (!ok) { abgelehnt.push(`banner ${name}` + ` (${grund})`); return; }
    const y = Math.min(boden(p.x - p.tx * l / 2, p.z - p.tz * l / 2), boden(p.x + p.tx * l / 2, p.z + p.tz * l / 2));
    rahmen(p.x, y, p.z, p.tx, p.tz);
    // lokal: b entlang der Strasse, a = rechts; Strasse liegt bei -sd
    const a0 = -sd * 0.02;
    const vorne = (b0, b1, h0, h1) => (sd > 0 ? [[a0, h0, b1], [a0, h0, b0], [a0, h1, b0], [a0, h1, b1]] : [[a0, h0, b0], [a0, h0, b1], [a0, h1, b1], [a0, h1, b0]]);
    const hb = l * 7 / ((t.u1 - t.u0) * 256);
    const [q0, q1, q2, q3] = vorne(-l / 2, l / 2, 0.85, 0.85 + hb);
    viereck(q0, q1, q2, q3, `banner_${name}`, 1.15);
    viereck([sd * 0.02, 0.85, -l / 2], [sd * 0.02, 0.85, l / 2], [sd * 0.02, 0.85 + hb, l / 2], [sd * 0.02, 0.85 + hb, -l / 2], 'stoff', 0.85);
    for (const b of [-l / 2, l / 2]) { balken([0, -0.1, b], [0, 0.95 + hb, b], 0.07, 'metall', 0.9); kreis(p.x + p.tx * b, p.z + p.tz * b, 0.15, 'banner'); }
    stelleHin(p.x, p.z, p.tx, p.tz, l / 2, 0.15, 0.3);
  }

  // Fahnenmast (Schweizer Kreuz oder einfarbig)
  function fahne(s, lat, art) {
    const p = ort(s, lat);
    if (!platzOk(p.x, p.z, 0.3, { strasse: L.fans.abstand - 0.6 })) { abgelehnt.push(`fahne ${s}` + ` (${grund})`); return; }
    const y = boden(p.x, p.z), H = 5.2;
    T = (q) => q;
    balken([p.x, y - 0.1, p.z], [p.x, y + H, p.z], 0.07, 'metall', 0.95);
    const f = art === 'gruen' ? farbe('#2c7a3a') : art === 'rot' ? farbe('#c8202a') : WEISS;
    const kachel = art === 'kreuz' ? 'fahneKreuz' : 'stoff';
    for (let k = 0; k < 3; k++) {
      const a0 = (k / 3) * 1.4, a1 = ((k + 1) / 3) * 1.4, w0 = Math.sin(k * 1.7) * 0.12, w1 = Math.sin((k + 1) * 1.7) * 0.12;
      const q = (a, w, oben) => [p.x + p.tx * a - p.tz * w, y + H - 0.05 - (oben ? 0 : 0.95) - a * 0.06, p.z + p.tz * a + p.tx * w];
      viereck(q(a0, w0, 0), q(a1, w1, 0), q(a1, w1, 1), q(a0, w0, 1), kachel, 1.1, f, [k / 3, (k + 1) / 3, 0, 1]);
    }
    kreis(p.x, p.z, 0.15, 'fahne');
    stelleHin(p.x, p.z, 1, 0, 0.1, 0.1, 0.3);
  }

  // Klappstuhl (Mitte x, z, schaut in Richtung w), Stoff farbig
  function klappstuhl(x, z, w, f) {
    const y = boden(x, z);
    rahmen(x, y, z, Math.sin(w), Math.cos(w));
    for (const a of [-0.22, 0.22]) {
      balken([a, 0, -0.2], [a, 0.45, 0.18], 0.035, 'metall', 0.8);
      balken([a, 0, 0.2], [a, 0.45, -0.18], 0.035, 'metall', 0.8);
      balken([a, 0.45, -0.2], [a, 0.92, -0.3], 0.035, 'metall', 0.8);
    }
    viereck([-0.24, 0.45, -0.2], [0.24, 0.45, -0.2], [0.24, 0.45, 0.2], [-0.24, 0.45, 0.2], 'stoff', 0.95, f);
    viereck([-0.24, 0.55, -0.24], [0.24, 0.55, -0.24], [0.24, 0.9, -0.3], [-0.24, 0.9, -0.3], 'stoff', 0.85, f);
    kreis(x, z, 0.3, 'stuhl');
  }

  // Pavillon (wie am Start/Ziel): Beine, Pyramidendach, Volant
  function zelt(s, lat) {
    const R = platzRahmen(s, lat, 0);
    const l = 1.6, b = 1.5;
    if (!flaecheOk(R.x, R.z, R.ux, R.uz, l, b, { krone: true })) { abgelehnt.push('zelt' + ` (${grund})`); return; }
    const y = bodenUnter(R.x, R.z, R.ux, R.uz, l, b) - 0.03;
    rahmen(R.x, y, R.z, R.ux, R.uz);
    const he = 2.15, hd = he + 1.0;
    const e = (a, c, h) => [a * b, h, c * l];
    for (const [a, c] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) balken(e(a, c, -0.05), e(a, c, he), 0.07, 'metall');
    const ecken = [e(-1, -1, he), e(1, -1, he), e(1, 1, he), e(-1, 1, he)];
    for (let k = 0; k < 4; k++) dreieck(ecken[k], ecken[(k + 1) % 4], [0, hd, 0], 'dachGruen', 1.05 - (k % 2) * 0.08);
    for (let k = 0; k < 4; k++) {
      const a = ecken[k], c = ecken[(k + 1) % 4];
      viereck([a[0], he - 0.28, a[2]], [c[0], he - 0.28, c[2]], c, a, 'dachGruen', 0.95);
    }
    quader(-0.3, 0.3, 0, 0.74, -0.7, 0.7, { seite: 'bretterQuer', oben: 'bretterQuer' }, 0.9); // Tisch
    rechteckKreise(R.x, R.z, R.ux, R.uz, l, b, 'zelt');
    stelleHin(R.x, R.z, R.ux, R.uz, l, b, 0.4);
  }

  // Wohnmobil (Alkoven, 80er-Streifen) mit ausgefahrener Markise zur Strasse
  function camper(s, lat, drehung) {
    const R = platzRahmen(s, lat, drehung);
    const lb = 3.1, ta = 1.12;
    if (!flaecheOk(R.x, R.z, R.ux, R.uz, lb, ta + 1.6, { krone: true })) { abgelehnt.push('camper' + ` (${grund})`); return; }
    const y = bodenUnter(R.x, R.z, R.ux, R.uz, lb, ta) - 0.02;
    rahmen(R.x, y, R.z, R.ux, R.uz);
    const lack = farbe('#f1eee4');
    quader(-ta, ta, 0.45, 2.85, -lb, 1.3, { seite: 'lack', oben: 'lack' }, 1, lack);                      // Wohnkabine
    quader(-ta, ta, 0.45, 1.55, 1.3, lb, { seite: 'lack', oben: 'lack' }, 1, lack, { einV: 0.15 });     // Fahrerhaus unten
    kiste([[-ta * 0.98, 1.55, 1.3], [ta * 0.98, 1.55, 1.3], [ta * 0.98, 1.55, lb - 0.15], [-ta * 0.98, 1.55, lb - 0.15],
      [-ta * 0.95, 2.05, 1.3], [ta * 0.95, 2.05, 1.3], [ta * 0.95, 2.05, 2.1], [-ta * 0.95, 2.05, 2.1]], { seite: 'scheibe', oben: 'lack', hinten: 'keins' }, 1, WEISS);
    quader(-ta, ta, 2.05, 2.85, 1.3, 2.25, { seite: 'lack', oben: 'lack', vorne: 'lack' }, 1, lack, { einV: 0.2 }); // Alkoven
    for (const sd of [-1, 1]) {
      const a = sd * (ta + 0.012);
      const fl = (b0, b1, h0, h1, k, hell = 1) => (sd > 0 ? viereck([a, h0, b1], [a, h0, b0], [a, h1, b0], [a, h1, b1], k, hell) : viereck([a, h0, b0], [a, h0, b1], [a, h1, b1], [a, h1, b0], k, hell));
      fl(-lb, lb - 0.2, 1.0, 1.32, 'camperStreifen', 1);
      fl(-2.3, -1.2, 1.55, 2.25, 'scheibe');
      fl(-0.6, 0.3, 1.55, 2.25, 'scheibe');
    }
    const sz = -Math.sign(lat); // Seite zur Strasse (lokal a)
    const at = sz * (ta + 0.013);
    viereck(sz > 0 ? [at, 0.5, 0.9] : [at, 0.5, 0.1], sz > 0 ? [at, 0.5, 0.1] : [at, 0.5, 0.9], sz > 0 ? [at, 2.3, 0.1] : [at, 2.3, 0.9], sz > 0 ? [at, 2.3, 0.9] : [at, 2.3, 0.1], 'ctuer');
    // Markise (gestreift) mit zwei Stützen
    viereck([sz * ta, 2.6, -2.6], [sz * ta, 2.6, 0.9], [sz * (ta + 2.2), 2.2, 0.9], [sz * (ta + 2.2), 2.2, -2.6], 'dachGruen', 1.0);
    for (const b of [-2.5, 0.8]) balken([sz * (ta + 2.15), -0.05, b], [sz * (ta + 2.15), 2.22, b], 0.05, 'metall', 0.85);
    for (const [a, b] of [[-1, -2.1], [1, -2.1], [-1, 2.15], [1, 2.15]]) rad(a * (ta - 0.12), 0.38, b, 0.38, 0.26);
    viereck([-0.7, 0.75, lb + 0.01], [0.7, 0.75, lb + 0.01], [0.7, 1.0, lb + 0.01], [-0.7, 1.0, lb + 0.01], 'grill', 1);
    for (const a of [-0.85, 0.85]) viereck([a - 0.15, 0.8, lb + 0.012], [a + 0.15, 0.8, lb + 0.012], [a + 0.15, 0.95, lb + 0.012], [a - 0.15, 0.95, lb + 0.012], 'licht', 1.2);
    rechteckKreise(R.x, R.z, R.ux, R.uz, lb, ta, 'camper');
    for (const b of [-2.5, 0.8]) kreis(R.x + R.ux * b - R.uz * sz * (ta + 2.15), R.z + R.uz * b + R.ux * sz * (ta + 2.15), 0.12, 'markise');
    stelleHin(R.x - R.uz * sz * 1.1, R.z + R.ux * sz * 1.1, R.ux, R.uz, lb, ta + 1.1, 0.4);
  }

  // Pickup (Fans vom Almweg): Fahrerhaus, offene Ladefläche
  function pickup(s, lat, drehung) {
    const R = platzRahmen(s, lat, drehung);
    const lb = 2.45, ta = 0.92;
    if (!flaecheOk(R.x, R.z, R.ux, R.uz, lb, ta, { krone: true })) { abgelehnt.push('pickup' + ` (${grund})`); return; }
    const y = bodenUnter(R.x, R.z, R.ux, R.uz, lb, ta) - 0.02;
    rahmen(R.x, y, R.z, R.ux, R.uz);
    const lack = farbe('#8a2a22');
    quader(-ta, ta, 0.45, 1.05, -lb, lb, { seite: 'lack', oben: 'keins' }, 1, lack);
    viereck([-ta + 0.08, 0.95, -lb + 0.08], [ta - 0.08, 0.95, -lb + 0.08], [ta - 0.08, 0.95, -0.35], [-ta + 0.08, 0.95, -0.35], 'schwarz', 0.9); // Ladefläche
    viereck([-ta, 1.05, -0.3], [ta, 1.05, -0.3], [ta, 1.05, lb], [-ta, 1.05, lb], 'lack', 1.05, lack);
    kiste([[-ta * 0.95, 1.05, -0.3], [ta * 0.95, 1.05, -0.3], [ta * 0.95, 1.05, 1.0], [-ta * 0.95, 1.05, 1.0],
      [-ta * 0.85, 1.72, -0.25], [ta * 0.85, 1.72, -0.25], [ta * 0.85, 1.72, 0.6], [-ta * 0.85, 1.72, 0.6]], { seite: 'scheibe', oben: 'lack' }, 1, WEISS);
    viereck([-ta * 0.85, 1.721, -0.25], [ta * 0.85, 1.721, -0.25], [ta * 0.85, 1.721, 0.6], [-ta * 0.85, 1.721, 0.6], 'lack', 1.05, lack);
    for (const [a, b] of [[-1, -1.55], [1, -1.55], [-1, 1.55], [1, 1.55]]) rad(a * (ta - 0.1), 0.36, b, 0.36, 0.26);
    viereck([-0.55, 0.6, lb + 0.01], [0.55, 0.6, lb + 0.01], [0.55, 0.85, lb + 0.01], [-0.55, 0.85, lb + 0.01], 'grill', 1);
    rechteckKreise(R.x, R.z, R.ux, R.uz, lb, ta, 'pickup');
    stelleHin(R.x, R.z, R.ux, R.uz, lb, ta, 0.4);
  }

  // =====================================================================
  // Unfallautos
  // =====================================================================
  // Karosserie nach Typ, in lokalen Koordinaten (a rechts, y hoch, b vorne). Schäden über "sch".
  // sch: { hauben: 'offen'|'weg'|null, rad: { welches: 'vr'|'vl', art: 'schief'|'ab' }, tuer: 'weg'|null,
  //        fluegelSchief: Grad, scheiben: Liste der kaputten Scheiben }
  function rallyeauto(typ, lack, akzent, nummer, sponsor, sch) {
    const K = typ === 'brunnwald';
    const ha = 0.86, L2 = K ? 2.02 : 1.95, Lh = K ? -2.0 : -1.92;
    const yU = 0.26, yHinten = K ? 0.88 : 0.84, yVorne = K ? 0.62 : 0.74, dachY = K ? 1.33 : 1.42;
    const topY = (b) => mische(yHinten, yVorne, (b - Lh) / (L2 - Lh));
    const L = lack, A = akzent, SW = farbe('#1e1f22');
    const kL = { seite: 'kratzer', oben: 'lack' };
    // Unterteil (Keil)
    kiste([[-ha, yU, Lh], [ha, yU, Lh], [ha, yU, L2], [-ha, yU, L2], [-ha + 0.02, yHinten, Lh], [ha - 0.02, yHinten, Lh], [ha - 0.02, yVorne, L2], [-ha + 0.02, yVorne, L2]],
      { ...kL, vorne: 'lack', hinten: 'lack' }, 1, L);
    // Kabine
    const kb0 = K ? -1.3 : -1.85, kb1 = K ? 0.75 : 0.85, ko0 = K ? -1.0 : -1.62, ko1 = K ? 0.08 : 0.12;
    const kaputt = (n) => (sch.scheiben || []).includes(n);
    kiste([[-0.8, topY(kb0), kb0], [0.8, topY(kb0), kb0], [0.8, topY(kb1), kb1], [-0.8, topY(kb1), kb1],
      [-0.62, dachY, ko0], [0.62, dachY, ko0], [0.62, dachY, ko1], [-0.62, dachY, ko1]],
    { seite: 'scheibe', links: kaputt('links') ? 'scheibeKaputt' : 'scheibe', rechts: kaputt('rechts') ? 'scheibeKaputt' : 'scheibe',
      vorne: kaputt('vorne') ? 'scheibeKaputt' : 'scheibe', hinten: K ? 'lack' : 'scheibe', oben: 'lack' }, 1, WEISS);
    // Dach in Akzentfarbe (Brunnwald) bzw. Lack, Fensterrahmen (A-/C-Säule) als dünne Balken
    viereck([-0.62, dachY + 0.005, ko0], [0.62, dachY + 0.005, ko0], [0.62, dachY + 0.005, ko1], [-0.62, dachY + 0.005, ko1], 'lack', 1.06, K ? A : L);
    for (const sd of [-1, 1]) {
      balken([sd * 0.8, topY(kb1), kb1], [sd * 0.62, dachY, ko1], 0.07, 'lack', 0.95, L);
      balken([sd * 0.8, topY(kb0), kb0], [sd * 0.62, dachY, ko0], 0.09, 'lack', 0.9, L);
    }
    // Überrollkäfig (sichtbar durch die kaputten Scheiben)
    for (const b of [ko0 + 0.15, ko1 - 0.1]) {
      balken([-0.58, topY(b) + 0.02, b], [-0.55, dachY - 0.06, b], 0.05, 'kaefig');
      balken([0.58, topY(b) + 0.02, b], [0.55, dachY - 0.06, b], 0.05, 'kaefig');
      balken([-0.55, dachY - 0.06, b], [0.55, dachY - 0.06, b], 0.05, 'kaefig');
    }
    balken([-0.55, dachY - 0.06, ko0 + 0.15], [0.55, topY(ko1 - 0.1) + 0.05, ko1 - 0.1], 0.05, 'kaefig');
    // Radkästen: stark ausgestellt, kantig
    const radB = K ? 1.28 : 1.25, ra = 0.98, rr = 0.34;
    for (const b of [-radB, radB]) for (const sd of [-1, 1]) {
      const a0 = sd * 0.74, a1 = sd * (K ? 1.0 : 1.03), bb = K ? 0.58 : 0.62;
      const o = Math.min(topY(b - bb), topY(b + bb)) - (K ? 0.04 : 0.02);
      kiste([[a0, yU + 0.02, b - bb], [a1, yU + 0.05, b - bb], [a1, yU + 0.05, b + bb], [a0, yU + 0.02, b + bb],
        [a0, o, b - bb - 0.05], [a1 - sd * 0.06, o - 0.1, b - bb + 0.12], [a1 - sd * 0.06, o - 0.1, b + bb - 0.12], [a0, o, b + bb + 0.05]],
      { seite: 'kratzer', oben: 'lack', unten: 'schwarz', links: sd > 0 ? 'keins' : 'kratzer', rechts: sd < 0 ? 'keins' : 'kratzer' }, 1, L);
      viereck([a1, yU + 0.05, b - bb + 0.1], [a1, yU + 0.05, b + bb - 0.1], [a1 - sd * 0.02, yU + 0.5, b + bb - 0.15], [a1 - sd * 0.02, yU + 0.5, b - bb + 0.15], 'schwarz', 0.7); // Radhaus innen (dunkel)
    }
    // Räder (eines schief oder ab)
    for (const b of [-radB, radB]) for (const sd of [-1, 1]) {
      const name = (b > 0 ? 'v' : 'h') + (sd > 0 ? 'r' : 'l');
      if (sch.rad && sch.rad.welches === name) {
        if (sch.rad.art === 'schief') rad(sd * 0.82, rr - 0.05, b - 0.18, rr, 0.3, { sturz: sd * 22, spur: sd * 18 });
        continue; // 'ab': liegt neben dem Auto (siehe wrack)
      }
      rad(sd * (ra - 0.14), rr, b, rr, 0.3);
    }
    // Stossstange vorne (schwarz), Zusatzscheinwerfer-Leiste, Scheinwerfer, Grill
    quader(-0.93, 0.93, 0.12, 0.38, L2 - 0.05, L2 + 0.16, 'schwarz', 1);
    const podY = K ? [0.62, 0.84] : [0.42, 0.62], podB = K ? L2 - 0.02 : L2 + 0.16;
    quader(-0.74, 0.74, podY[0], podY[1], podB, podB + 0.12, 'schwarz', 1);
    [-0.54, -0.18, 0.18, 0.54].forEach((a, k) => {
      const kap = sch.lampenKaputt && k < 2;
      viereck([a - 0.15, podY[0] + 0.03, podB + 0.125], [a + 0.15, podY[0] + 0.03, podB + 0.125], [a + 0.15, podY[1] - 0.03, podB + 0.125], [a - 0.15, podY[1] - 0.03, podB + 0.125], kap ? 'zusatzKaputt' : 'zusatz', 1.15);
    });
    const yL = K ? 0.44 : 0.56;
    for (const sd of [-1, 1]) viereck([sd * 0.82, yL, L2 + 0.005], [sd * 0.5, yL, L2 + 0.005], [sd * 0.5, yL + 0.12, L2 + 0.005], [sd * 0.82, yL + 0.12, L2 + 0.005], 'licht', 1.15);
    if (!K) viereck([-0.4, 0.4, L2 + 0.005], [0.4, 0.4, L2 + 0.005], [0.4, 0.68, L2 + 0.005], [-0.4, 0.68, L2 + 0.005], 'grill', 1);
    // Heck: Leuchten, Stossstange
    for (const sd of [-1, 1]) viereck([sd * 0.5, 0.58, Lh - 0.005], [sd * 0.82, 0.58, Lh - 0.005], [sd * 0.82, 0.72, Lh - 0.005], [sd * 0.5, 0.72, Lh - 0.005], 'stoff', 1, farbe('#b01818'));
    quader(-0.9, 0.9, 0.16, 0.36, Lh - 0.14, Lh + 0.04, 'schwarz', 1);
    // Heckflügel (Brunnwald: hoch auf Stützen; Vallora: auf der Heckklappe), eventuell schief
    const fs = (sch.fluegelSchief || 0) * GRAD;
    const fl = (a, y, b) => [a, y + Math.sin(fs) * a, b];
    if (K) {
      const y = 1.17;
      kiste([fl(-0.96, y, -2.28), fl(0.96, y, -2.28), fl(0.96, y, -1.86), fl(-0.96, y, -1.86), fl(-0.96, y + 0.05, -2.28), fl(0.96, y + 0.05, -2.28), fl(0.96, y + 0.09, -1.86), fl(-0.96, y + 0.09, -1.86)], 'lack', 1, A);
      for (const sd of [-1, 1]) {
        viereck(fl(sd * 0.965, y - 0.12, -2.3), fl(sd * 0.965, y - 0.12, -1.84), fl(sd * 0.965, y + 0.2, -1.84), fl(sd * 0.965, y + 0.2, -2.3), 'schwarz', 0.9);
        balken([sd * 0.55, topY(-1.95) - 0.02, -1.98], fl(sd * 0.55, y, -1.98), 0.06, 'schwarz', 1);
      }
    } else {
      const y = dachY - 0.02;
      kiste([fl(-0.74, y, -1.98), fl(0.74, y, -1.98), fl(0.74, y, -1.6), fl(-0.74, y, -1.6), fl(-0.74, y + 0.06, -2.02), fl(0.74, y + 0.06, -2.02), fl(0.74, y + 0.1, -1.6), fl(-0.74, y + 0.1, -1.6)], 'lack', 1, A);
      for (const sd of [-1, 1]) viereck(fl(sd * 0.745, y - 0.25, -2.0), fl(sd * 0.745, y - 0.25, -1.6), fl(sd * 0.745, y + 0.12, -1.6), fl(sd * 0.745, y + 0.12, -2.02), 'lack', 0.9, A);
    }
    // Dachhutze (Lufteinlass): vorne offen (schwarz)
    const hb0 = K ? -0.55 : -0.4, hb1 = K ? -0.05 : 0.08, hw = K ? 0.24 : 0.3, hh = K ? 0.14 : 0.17;
    kiste([[-hw, dachY, hb0], [hw, dachY, hb0], [hw, dachY, hb1], [-hw, dachY, hb1], [-hw, dachY + hh * 0.6, hb0], [hw, dachY + hh * 0.6, hb0], [hw, dachY + hh, hb1 - 0.04], [-hw, dachY + hh, hb1 - 0.04]],
      { seite: 'lack', vorne: 'schwarz' }, 1, K ? A : L);
    // Schmutzfänger hinter den Rädern
    for (const b of [-radB - 0.5, radB - 0.62]) for (const sd of [-1, 1]) {
      viereck([sd * 0.66, 0.06, b], [sd * 0.98, 0.06, b], [sd * 0.98, 0.36, b], [sd * 0.66, 0.36, b], 'schmutz', 1);
    }
    // Lackierung: Streifen, Startnummern (Türen, Dach), Sponsor
    for (const sd of [-1, 1]) {
      const a = sd * (ha + 0.012);
      // Schrift lesbar von aussen: rechts (sd > 0) läuft sie nach vorne, links nach hinten
      const fl2 = (b0, b1, h0, h1, k, hell = 1, f = WEISS) => (sd > 0 ? viereck([a, h0, b0], [a, h0, b1], [a, h1, b1], [a, h1, b0], k, hell, f) : viereck([a, h0, b1], [a, h0, b0], [a, h1, b0], [a, h1, b1], k, hell, f));
      fl2(Lh + 0.05, L2 - 0.08, 0.3, 0.4, 'stoff', 1, A);                       // Streifen unten
      if (!K) fl2(-0.7, L2 - 0.08, 0.6, 0.66, 'stoff', 1, A);                     // Vallora: zweiter Streifen
      fl2(-0.75, 0.05, 0.42, 0.74, `nr${nummer}`, 1.05);
      const spk = `sp_${sponsor}`, t = atlas.kachel(spk), sb = 0.2 * ((t.u1 - t.u0) * 256) / 7;
      fl2(0.2, Math.min(L2 - 0.15, 0.2 + sb), 0.43, 0.63, spk, 1.05);
    }
    viereck([-0.32, dachY + 0.01, ko0 + 0.08], [0.32, dachY + 0.01, ko0 + 0.08], [0.32, dachY + 0.01, ko0 + 0.5], [-0.32, dachY + 0.01, ko0 + 0.5], `nr${nummer}`, 1.05);
    // Motorhaube (vorne bis zur Scheibe): normal, offen (aufgestellt) oder weg (dann sieht man den Motorraum)
    const hb = kb1 + 0.02, hv = L2 - 0.06;
    if (!sch.haube) {
      viereck([-0.8, topY(hb) + 0.01, hb], [0.8, topY(hb) + 0.01, hb], [0.8, topY(hv) + 0.01, hv], [-0.8, topY(hv) + 0.01, hv], 'lack', 1.04, K ? A : A);
    } else {
      viereck([-0.76, topY(hb) - 0.02, hb], [0.76, topY(hb) - 0.02, hb], [0.76, topY(hv) - 0.02, hv], [-0.76, topY(hv) - 0.02, hv], 'motor', 1);
      if (sch.haube === 'offen') {
        // aufgestellt und geknickt: Scharnier vorne (aufgesprungen), hinten hoch
        const yv = topY(hv) + 0.02, k1 = [0, yv + 0.32, (hb + hv) / 2 + 0.1], hinten = [0, yv + 0.62, hb + 0.2];
        viereck([-0.8, yv, hv], [0.8, yv, hv], [0.78, k1[1] + 0.06, k1[2]], [-0.82, k1[1], k1[2]], 'lack', 1.05, A);
        viereck([-0.82, k1[1], k1[2]], [0.78, k1[1] + 0.06, k1[2]], [0.74, hinten[1] + 0.08, hinten[2]], [-0.8, hinten[1], hinten[2]], 'lack', 0.95, A);
      }
    }
  }

  // Ein Wrack aufstellen. Ergebnis: Daten für Rauch, Tests (Lage, Kreise)
  const wracks = [];
  function wrack(cfg) {
    const sch = cfg.schaden === 'front'
      ? { haube: 'offen', rad: { welches: 'vr', art: 'schief' }, scheiben: ['vorne', 'rechts'], lampenKaputt: true, fluegelSchief: 0 }
      : { haube: null, rad: { welches: 'vl', art: 'ab' }, tuer: 'weg', scheiben: ['links', 'vorne'], fluegelSchief: 9 };
    // Lage: am Baum (Front am Stamm) oder frei
    let x, z, ux, uz;
    let baum = null;
    if (cfg.baum) {
      const [s, sd, lat] = cfg.baum, p = ort(s, sd * lat);
      let best = Infinity;
      for (const t of [...pflanzen.laubbaeume, ...pflanzen.tannen]) {
        const d = Math.hypot(t.x - p.x, t.z - p.z);
        if (d < best) { best = d; baum = t; }
      }
      if (!baum || best > 3) { abgelehnt.push(`wrack ${cfg.name}: kein Baum` + ` (${grund})`); return; }
      const q = S.abfrage(baum.x, baum.z, {}), r0 = ort(q.s, 0);
      // Blickrichtung des Autos: um "winkel" (Grad) von der Strassenrichtung zum Baum hin gedreht
      const w = cfg.winkel * GRAD * Math.sign(q.seite);
      ux = r0.tx * Math.cos(w) - r0.tz * Math.sin(w); uz = r0.tz * Math.cos(w) + r0.tx * Math.sin(w);
      const front = 1.5 + CONFIG.kollision.stammRadius; // Front nach dem Eindrücken
      const rx = -uz, rz = ux;
      x = baum.x - ux * front - rx * cfg.anstoss; z = baum.z - uz * front - rz * cfg.anstoss;
    } else {
      const R = platzRahmen(cfg.s, cfg.seite * cfg.lat, cfg.seite * cfg.drehung);
      x = R.x; z = R.z; ux = R.ux; uz = R.uz;
    }
    const rx = -uz, rz = ux;
    // Kreise der Karosserie (drei, hart wie die anderen Hindernisse)
    const kr = L.kreisRadius, kreise = [-1.1, 0, 1.0].map((b) => ({ x: x + ux * b, z: z + uz * b, r: kr }));
    const ok = kreise.every((k) => N.abfrage(k.x, k.z, qa).abstand >= L.abstandStrasse + k.r - 0.6) &&
      kreise.every((k) => { S.abfrage(k.x, k.z, qb); return !istInnen(qb.s, Math.sign(qb.seite), qb.abstand); }) &&
      kreise.every((k) => kolKuh.frei(k.x, k.z, k.r + 2));
    if (!ok) { abgelehnt.push(`wrack ${cfg.name}` + ` (${grund})`); return; }
    // Neigung aus dem Gelände unter den Rädern (fehlt ein Rad, sackt die Ecke ab)
    const h = (a, b) => boden(x + rx * a + ux * b, z + rz * a + uz * b);
    const hv = (h(-0.8, 1.28) + h(0.8, 1.28)) / 2, hh = (h(-0.8, -1.28) + h(0.8, -1.28)) / 2;
    const hl = (h(-0.8, 1.28) + h(-0.8, -1.28)) / 2, hr = (h(0.8, 1.28) + h(0.8, -1.28)) / 2;
    let nick = Math.atan2(hv - hh, 2.56), roll = Math.atan2(hl - hr, 1.6);
    let y = (hv + hh) / 2 - 0.03;
    if (sch.rad && sch.rad.art === 'ab') { nick -= 0.06; roll += sch.rad.welches.endsWith('l') ? -0.07 : 0.07; y -= 0.05; }
    if (sch.rad && sch.rad.art === 'schief') { roll += 0.03; nick -= 0.025; }
    // Verformung: Front eingedrückt (am Baum, leicht seitlich) oder Seite eingedrückt (Leitplanke/Böschung)
    const verform = cfg.schaden === 'front'
      ? ([a, yy, b]) => {
        if (b < 0.9) return [a, yy, b];
        const d = b - 0.9, beule = Math.exp(-((a - cfg.anstoss) ** 2) / 0.18);
        return [a + d * 0.06, yy + d * 0.08 * (yy > 0.5 ? 1 : 0.2), 0.9 + d * 0.7 - beule * d * 0.32];
      }
      : ([a, yy, b]) => {
        if (a > -0.45) return [a, yy, b];
        const t = Math.exp(-((b - 0.2) ** 2) / 1.1) * Math.min(1, (-a - 0.45) / 0.5);
        return [a + t * 0.24, yy - t * 0.03 * (yy > 1 ? 1 : 0), b];
      };
    rahmen(x, y, z, ux, uz, { nick, roll, verform });
    rallyeauto(cfg.typ, farbe(cfg.lack), farbe(cfg.akzent), cfg.nummer, cfg.sponsor, sch);
    // abgefallene Teile neben dem Auto (auf dem Boden, nicht verformt)
    const teil = (a, b, w) => { const px = x + rx * a + ux * b, pz = z + rz * a + uz * b; return { px, pz, y: boden(px, pz), ux: Math.sin(w), uz: Math.cos(w) }; };
    if (sch.rad && sch.rad.art === 'ab') {
      const t = teil(-2.4, 1.9, rnd() * 3);
      rahmen(t.px, t.y, t.pz, t.ux, t.uz);
      rad(0, 0.15, 0, 0.34, 0.3, { sturz: 90 }); // flach liegend
    }
    if (sch.tuer === 'weg') {
      const t = teil(-2.2, -0.6, 0.7);
      rahmen(t.px, t.y + 0.04, t.pz, t.ux, t.uz);
      viereck([-0.45, 0, -0.55], [0.45, 0, -0.55], [0.45, 0.02, 0.55], [-0.45, 0.02, 0.55], 'kratzer', 1.05, farbe(cfg.lack));
      viereck([-0.45, 0.025, -0.4], [0.45, 0.025, -0.4], [0.45, 0.03, 0.35], [-0.45, 0.03, 0.35], `nr${cfg.nummer}`, 1.0);
      // Türöffnung am Auto: dunkle Fläche (Innenraum) auf der linken Seite
      rahmen(x, y, z, ux, uz, { nick, roll, verform });
      viereck([-0.9, 0.35, -0.75], [-0.9, 0.35, 0.3], [-0.84, 1.15, 0.2], [-0.84, 1.15, -0.65], 'schwarz', 0.6);
    }
    // Glassplitter am Boden (kleine helle Flecken vor der Front; bewusst nie rot – soll nicht nach Blut aussehen)
    T = (q) => q;
    for (let k = 0; k < 7; k++) {
      const t = teil((rnd() - 0.5) * 2.6, 1.9 + rnd() * 1.6, 0), s2 = 0.05 + rnd() * 0.06;
      viereck([t.px - s2, t.y + 0.02, t.pz - s2], [t.px + s2, t.y + 0.02, t.pz - s2], [t.px + s2, t.y + 0.02, t.pz + s2], [t.px - s2, t.y + 0.02, t.pz + s2], k % 3 ? 'kaefig' : 'scheibe', 1.1);
    }
    for (const k of kreise) kreis(k.x, k.z, k.r, 'wrack');
    stelleHin(x, z, ux, uz, 2.6, 1.3, 0.8);
    // Rauch aus dem Motorraum (vorne)
    const rauchB = cfg.typ === 'brunnwald' ? 1.25 : 1.3;
    wracks.push({ name: cfg.name, x, z, ux, uz, y, kreise, baum: baum ? { x: baum.x, z: baum.z } : null,
      rauch: [x + ux * rauchB, y + 0.95, z + uz * rauchB], s: S.abfrage(x, z, {}).s, abstand: S.abfrage(x, z, {}).abstand });
  }

  // Warndreieck am Strassenrand (schaut zum anfahrenden Fahrer) und gelbe Flagge
  function warndreieck(s, lat) {
    const p = ort(s, lat), y = boden(p.x, p.z);
    rahmen(p.x, y, p.z, -p.tx, -p.tz); // b zeigt zum Fahrer
    const w = 0.42, hgt = 0.62;
    viereck([-w, 0.06, 0], [w, 0.06, 0], [0.04, 0.06 + hgt, 0], [-0.04, 0.06 + hgt, 0], 'warn', 1.2);
    viereck([w, 0.06, -0.02], [-w, 0.06, -0.02], [-0.04, 0.06 + hgt, -0.02], [0.04, 0.06 + hgt, -0.02], 'warn', 0.9);
    balken([0, 0.06, -0.02], [0, 0, -0.35], 0.03, 'metall', 0.8);
    balken([-w, 0.06, 0], [w, 0.06, 0], 0.03, 'metall', 0.8);
  }
  function flagge(s, lat) {
    const p = ort(s, lat), y = boden(p.x, p.z);
    if (N.abfrage(p.x, p.z, qa).abstand < L.abstandStrasse) { abgelehnt.push(`flagge ${s}` + ` (${grund})`); return; }
    T = (q) => q;
    balken([p.x, y - 0.1, p.z], [p.x, y + 1.5, p.z], 0.04, 'metall', 0.9);
    const ax = -p.tz * Math.sign(lat), az = p.tx * Math.sign(lat);
    viereck([p.x, y + 1.0, p.z], [p.x + ax * 0.6, y + 1.0, p.z + az * 0.6], [p.x + ax * 0.6, y + 1.45, p.z + az * 0.6], [p.x, y + 1.45, p.z], 'fahneGelb', 1.15);
    kreis(p.x, p.z, 0.12, 'flagge');
  }

  // =====================================================================
  // Figuren (Fans, Streckenposten): Daten wie am Start/Ziel, gezeichnet je Ort (instanziert)
  // =====================================================================
  const F = L.fans;
  const ZF = CONFIG.startZiel.zuschauer;
  const jacken = ZF.jacken.map(farbe), hosen = ZF.hosen.map(farbe), muetzen = ZF.muetzen.map(farbe), haare = ZF.haare.map(farbe);
  const wahl = (liste) => liste[Math.floor(rnd() * liste.length)];
  const figuren = [];
  const POSE = (name) => ZUSCHAUER_POSEN.indexOf(name);
  function figur(x, z, blick, pose, ortName, extra = {}) {
    const name = ZUSCHAUER_POSEN[pose];
    const kind = name !== 'posten' && name !== 'sitzend' && rnd() < F.kinder;
    const groesse = kind ? mische(0.6, 0.72, rnd()) : mische(ZF.groesse[0], ZF.groesse[1], rnd()) / 1.75;
    const muetze = name.startsWith('fahne') && rnd() < 0.7 ? farbe(ZF.fahnenRot) : farbe(wahl(ZF.muetzen));
    const takt = name === 'winkend' || name === 'jubelnd' || name.startsWith('fahne') || name === 'posten' ? mische(ZF.winken[0], ZF.winken[1], rnd()) : 0;
    const f = { x, z, y: welt.gelaendeHoehe(x, z) - 0.04, blick, pose, groesse, hell: 0.9 + rnd() * 0.15,
      jacke: wahl(jacken), hose: wahl(hosen), muetze, haar: wahl(haare), takt, phase: rnd() * 2, ort: ortName, ...extra };
    figuren.push(f);
    kreis(x, z, F.radius, name === 'posten' ? 'posten' : 'zuschauer');
    return f;
  }
  const blickZu = (x, z, s) => { const q = ort(s, 0); return Math.atan2(q.x - x, q.z - z); };
  function poseWuerfeln() {
    const zp = rnd();
    let summe = 0;
    for (let i = 0; i < F.posen.length; i++) { summe += F.posen[i]; if (zp <= summe) return i; }
    return 0;
  }
  const figurFrei = (x, z) => platzOk(x, z, F.radius, { strasse: F.abstand, kuh: 2.5, objekt: 0.25 }) &&
    !figuren.some((f) => (f.x - x) ** 2 + (f.z - z) ** 2 < F.dicht * F.dicht);

  function fanSpot(sp) {
    G = { pos: [], uv: [], col: [], idx: [] };
    geos.set(sp.name, G);
    const sd = sp.seite;
    for (const [a, b, lat] of sp.band || []) band(a, b, sd * lat);
    for (const [s, lat, name] of sp.banner || []) versuche(`banner ${name}`, (ds, dl) => banner(s + ds * 0.5, sd * (lat + Math.max(0, dl) * 0.5), name));
    for (const [s, lat, art] of sp.fahnen || []) versuche(`fahne ${s}`, (ds, dl) => fahne(s + ds * 0.5, sd * (lat + dl * 0.5), art));
    if (sp.camper) versuche('camper', (ds, dl) => camper(sp.camper[0] + ds, sd * (sp.camper[1] + dl), sp.camper[2]));
    if (sp.zelt) versuche('zelt', (ds, dl) => zelt(sp.zelt[0] + ds, sd * (sp.zelt[1] + dl)));
    if (sp.pickup) versuche('pickup', (ds, dl) => pickup(sp.pickup[0] + ds, sd * (sp.pickup[1] + dl), sp.pickup[2]));
    const vorher = figuren.length;
    // Klappstühle mit sitzenden Fans (in der hinteren Reihe)
    const stoffe = ['#2b5fc2', '#2f9a48', '#d23b2c', '#f0c020', '#3a3f48'].map(farbe);
    for (let k = 0, v = 0; k < (sp.stuehle || 0) && v < 60; v++) {
      const s = mische(sp.s[0], sp.s[1], rnd()), lat = sd * mische(mische(sp.lat[0], sp.lat[1], 0.45), sp.lat[1], rnd());
      const p = ort(s, lat);
      if (!figurFrei(p.x, p.z) || !platzOk(p.x, p.z, 0.6, { strasse: F.abstand })) continue;
      const blick = blickZu(p.x, p.z, sp.blickS ?? s) + (rnd() - 0.5) * 0.4;
      klappstuhl(p.x - Math.sin(blick) * 0.18, p.z - Math.cos(blick) * 0.18, blick, wahl(stoffe));
      figur(p.x + Math.sin(blick) * 0.05, p.z + Math.cos(blick) * 0.05, blick, POSE('sitzend'), sp.name);
      k++;
    }
    // Gruppen
    let anlaeufe = 0;
    while (figuren.length - vorher < sp.anzahl && anlaeufe++ < 300) {
      const mm = mische(sp.s[0], sp.s[1], rnd());
      const anzahl = Math.round(mische(F.gruppe[0], F.gruppe[1], rnd()));
      for (let k = 0; k < anzahl && figuren.length - vorher < sp.anzahl; k++) {
        for (let v = 0; v < 10; v++) {
          const s = mm + (rnd() - 0.5) * F.gruppeLaenge;
          const lat = sd * (sp.lat[0] + Math.pow(rnd(), 1.5) * (sp.lat[1] - sp.lat[0]));
          if (s < sp.s[0] - 2 || s > sp.s[1] + 2) continue;
          const p = ort(s, lat);
          if (!figurFrei(p.x, p.z)) continue;
          const blick = blickZu(p.x, p.z, sp.blickS ?? s + (rnd() - 0.5) * 10) + (rnd() - 0.5) * F.blickStreuung;
          figur(p.x, p.z, blick, poseWuerfeln(), sp.name);
          break;
        }
      }
    }
    return figuren.length - vorher;
  }

  // =====================================================================
  // Aufbauen
  // =====================================================================
  const orte = [];
  // 1. Wiesenweg
  {
    G = { pos: [], uv: [], col: [], idx: [] };
    geos.set('wiesenweg', G);
    const W = L.wiesenweg;
    const h = W.huette ? versuche('huette', (ds, dl) => huette({ ...W.huette, s: W.huette.s + ds, lat: W.huette.lat + dl }, false)) : null;
    if (W.stadel) versuche('stadel', (ds, dl) => huette({ ...W.stadel, s: W.stadel.s + ds, lat: W.stadel.lat + dl }, true));
    if (W.brunnen) versuche('brunnen', (ds, dl) => brunnen({ ...W.brunnen, s: W.brunnen.s + ds, lat: W.brunnen.lat + dl }));
    if (W.wegweiser) wegweiser(W.wegweiser);
    for (const [s, sd, lat] of W.steinmaennchen || []) versuche(`steinmann ${s}`, (ds, dl) => steinmann(s + ds, sd, lat + dl));
    for (const [s, sd, lat] of W.heurollen || []) versuche(`heurolle ${s}`, (ds, dl) => heurolle(s + ds * 0.5, sd, lat + dl * 0.5));
    for (const [s, sd, lat, hh] of W.findlinge || []) versuche(`findling ${s}`, (ds, dl) => findling(s + ds, sd, lat + dl, hh));
    orte.push({ name: 'wiesenweg', s: W.huette ? W.huette.s : 2950, huette: h });
  }
  // 2. Fan-Spots
  const fanZahlen = {};
  for (const sp of F.spots) {
    fanZahlen[sp.name] = fanSpot(sp);
    orte.push({ name: sp.name, s: (sp.s[0] + sp.s[1]) / 2, fans: fanZahlen[sp.name] });
  }
  // 3. Wracks mit Warndreieck, Flagge, Streckenposten
  for (const w of L.wracks) {
    G = { pos: [], uv: [], col: [], idx: [] };
    geos.set(`wrack-${w.name}`, G);
    const vorher = wracks.length;
    wrack(w);
    if (wracks.length === vorher) continue;
    const wr = wracks[wracks.length - 1];
    const sd = Math.sign(S.abfrage(wr.x, wr.z, {}).seite) || 1;
    if (w.warndreieck) warndreieck(wr.s - w.warndreieck.vor, sd * w.warndreieck.lat);
    if (w.flagge) flagge(wr.s - w.flagge.vor, sd * w.flagge.lat);
    for (const [s, lat] of w.posten || []) {
      const p = ort(s, sd * lat);
      if (!figurFrei(p.x, p.z)) { abgelehnt.push(`posten ${s}` + ` (${grund})`); continue; }
      const f = figur(p.x, p.z, blickZu(p.x, p.z, s - 25), POSE('posten'), `wrack-${w.name}`);
      f.jacke = farbe(L.postenJacken[figuren.length % L.postenJacken.length]);
      f.muetze = farbe(L.postenFahne);
      f.hose = farbe('#26262a');
    }
    orte.push({ name: `wrack-${w.name}`, s: wr.s, wrack: wr });
  }

  // --- Meshes: je Ort ein Teil -------------------------------------------------------------------
  const material = new THREE.MeshLambertMaterial({ map: atlas.textur, vertexColors: true, flatShading: true, side: THREE.DoubleSide, alphaTest: 0.5 });
  const meshes = [];
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
    mesh.name = `leben-${name}`;
    szene.add(mesh);
    meshes.push(mesh);
    dreiecke += g.idx.length / 3;
  }

  // --- Figuren: je Ort ein Zeichenaufruf (wie die Zuschauer am Start/Ziel) ------------------------
  const zatlas = zuschauerAtlas();
  const l = CONFIG.licht;
  const licht = new THREE.Color(l.umgebungFarbe).multiplyScalar(l.umgebungStaerke)
    .add(new THREE.Color(l.sonneFarbe).multiplyScalar(l.sonneStaerke * 0.55)).multiplyScalar(CONFIG.sprites.helligkeit);
  const zMaterial = new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, {
      map: { value: null }, uLicht: { value: licht }, uRaster: { value: new THREE.Vector2(zatlas.spalten, zatlas.zeilen) }, uZeit: { value: 0 },
    }]),
    vertexShader: ZUSCHAUER_VERTEX, fragmentShader: ZUSCHAUER_FRAGMENT, fog: true,
  });
  zMaterial.uniforms.map.value = zatlas.textur;
  for (const name of [...new Set(figuren.map((f) => f.ort))]) {
    const liste = figuren.filter((f) => f.ort === name);
    const basis = new THREE.PlaneGeometry(1, 1);
    basis.translate(0, 0.5, 0);
    const geo = new THREE.InstancedBufferGeometry();
    geo.index = basis.index;
    geo.setAttribute('position', basis.attributes.position);
    geo.setAttribute('uv', basis.attributes.uv);
    const n = liste.length;
    const fuss = new Float32Array(n * 3), daten = new Float32Array(n * 4), blick = new Float32Array(n), takt = new Float32Array(n * 2);
    const fa = [new Float32Array(n * 3), new Float32Array(n * 3), new Float32Array(n * 3), new Float32Array(n * 3)];
    let cx = 0, cy = 0, cz = 0;
    liste.forEach((f, i) => {
      fuss.set([f.x, f.y, f.z], i * 3);
      daten.set([zatlas.zelleM[0] * f.groesse, zatlas.zelleM[1] * f.groesse, f.pose, f.hell], i * 4);
      blick[i] = f.blick;
      takt.set([f.takt, f.phase], i * 2);
      [f.jacke, f.hose, f.muetze, f.haar].forEach((c, k) => fa[k].set([c.r, c.g, c.b], i * 3));
      cx += f.x / n; cy += f.y / n; cz += f.z / n;
    });
    geo.setAttribute('aFuss', new THREE.InstancedBufferAttribute(fuss, 3));
    geo.setAttribute('aDaten', new THREE.InstancedBufferAttribute(daten, 4));
    geo.setAttribute('aBlick', new THREE.InstancedBufferAttribute(blick, 1));
    geo.setAttribute('aTakt', new THREE.InstancedBufferAttribute(takt, 2));
    ['aJacke', 'aHose', 'aMuetze', 'aHaar'].forEach((a, k) => geo.setAttribute(a, new THREE.InstancedBufferAttribute(fa[k], 3)));
    geo.instanceCount = n;
    let r = 0;
    for (const f of liste) r = Math.max(r, Math.hypot(f.x - cx, f.y - cy, f.z - cz));
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(cx, cy, cz), r + 3);
    const mesh = new THREE.Mesh(geo, zMaterial);
    mesh.name = `leben-figuren-${name}`;
    szene.add(mesh);
    meshes.push(mesh);
  }

  // --- Rauch: je Wrack ein paar Wölkchen (fester Vorrat, im Shader bewegt) ---------------------------
  const cr = L.rauch;
  const rMaterial = new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, {
      uZeit: { value: 0 }, uRauch: { value: new THREE.Vector4(cr.leben, cr.steigen, cr.groesse[0], cr.groesse[1]) },
      uWind: { value: new THREE.Vector2(...cr.wind) }, uFarbe: { value: farbe(cr.farbe) }, uDichte: { value: cr.dichte },
    }]),
    vertexShader: RAUCH_VERTEX, fragmentShader: RAUCH_FRAGMENT, fog: true,
  });
  for (const wr of wracks) {
    const basis = new THREE.PlaneGeometry(1, 1);
    const geo = new THREE.InstancedBufferGeometry();
    geo.index = basis.index;
    geo.setAttribute('position', basis.attributes.position);
    geo.setAttribute('uv', basis.attributes.uv);
    const start = new Float32Array(cr.anzahl * 4);
    for (let k = 0; k < cr.anzahl; k++) start.set([wr.rauch[0] + (rnd() - 0.5) * 0.5, wr.rauch[1], wr.rauch[2] + (rnd() - 0.5) * 0.5, k / cr.anzahl + rnd() * 0.05], k * 4);
    geo.setAttribute('aStart', new THREE.InstancedBufferAttribute(start, 4));
    geo.instanceCount = cr.anzahl;
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(wr.rauch[0], wr.rauch[1] + cr.leben * cr.steigen / 2, wr.rauch[2]), cr.leben * cr.steigen + 3);
    const mesh = new THREE.Mesh(geo, rMaterial);
    mesh.name = `leben-rauch-${wr.name}`;
    szene.add(mesh);
    meshes.push(mesh);
  }

  // --- Büsche um Hütte und Fan-Spots (Deko, baut sprites.js mit ein) ---------------------------------
  const buesche = [];
  for (const o of orte) {
    if (!o.huette) continue;
    const hu = o.huette;
    for (let k = 0; k < 14; k++) {
      const w = rnd() * Math.PI * 2, d = Math.hypot(hu.l, hu.b) + 1 + rnd() * 6;
      buesche.push({ x: hu.x + Math.cos(w) * d, z: hu.z + Math.sin(w) * d, gras: rnd() < 0.5 });
    }
  }

  // --- Jedes Bild: Winken, Rauch, weit Entferntes nicht zeichnen ----------------------------------
  let zeit = 0;
  function aktualisiere(dt, kamPos) {
    zeit += dt;
    zMaterial.uniforms.uZeit.value = zeit;
    rMaterial.uniforms.uZeit.value = zeit;
    for (const m of meshes) {
      const k = m.geometry.boundingSphere;
      m.visible = k.center.distanceTo(kamPos) - k.radius < L.sichtweite;
    }
  }

  const statistik = {
    figuren: figuren.length, fans: fanZahlen, posten: figuren.filter((f) => ZUSCHAUER_POSEN[f.pose] === 'posten').length,
    wracks: wracks.length, hindernisse: hindernisse.length, bandMeter: Math.round(bandMeter), dreiecke, meshes: meshes.length,
    abgelehnt, verschoben, ms: Math.round(performance.now() - t0),
  };
  return { hindernisse, figuren, buesche, orte, belegt, meshes, wracks, aktualisiere, statistik, istInnen, platzOk };
}
