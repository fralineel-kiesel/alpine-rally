// Kuh-Sprites (Meilenstein 2b), im Code gezeichnet wie alle anderen Pixel-Texturen.
//
// Damit eine Kuh nicht wie Pappe aussieht, gibt es sie aus 8 Richtungen (wie bei Doom):
// von vorne, schräg vorne, von der Seite, schräg hinten, von hinten – und dasselbe von der
// anderen Seite. Welche Ansicht man sieht, rechnet der Vertex-Shader aus dem Winkel zwischen
// Blickrichtung der Kuh und Kamera aus (kuehe.js).
//
// Damit alle Ansichten zusammenpassen (Flecken an derselben Stelle), wird jede Kuh aus
// einfachen Formen gebaut (Ellipsoide: Rumpf, Hals, Kopf, Beine, Hörner ...) und jede
// Ansicht Pixel für Pixel abgetastet: ein gerader Strahl pro Pixel, die vorderste Form
// bestimmt Farbe und Helligkeit. Danach grob schattiert (4 Stufen) wie die anderen Sprites.
//
// Bild: 8 Spalten (Ansichten) x (6 Kuh-Arten x 3 Posen) Zeilen, je 32x24 Pixel = 2.8 x 2.1 m.

import { zufall } from './util.js';
import { leinwand, hexZuRgb, setze, zuTextur } from './pixel.js';

export const KUH_BILD = {
  spalten: 8,        // Ansichten rundherum
  zelleB: 32, zelleH: 24, // Pixel pro Bild
  breiteM: 2.8, hoeheM: 2.1, // so gross ist ein Bild in Metern (Kuh 2.4 m lang, 1.4 m hoch)
  posen: ['stehend', 'grasend', 'liegend'],
};

// Fellarten (Fantasie-Kühe in Schweizer Art, keine echten Rassen)
const FELLE = [
  { name: 'braun-weiss', grund: '#8a4a26', weiss: '#ece5d6', flecken: 0.42, kopfWeiss: true, socken: true, bauch: true,
    maul: '#d6a59a', nase: '#c48c84', ohr: '#8a4a26', quaste: '#e6dece' },
  { name: 'schwarz-weiss', grund: '#262321', weiss: '#ebe7df', flecken: 0.4, kopfWeiss: false, blesse: true, socken: true, bauch: true,
    maul: '#3d3836', nase: '#2b2725', ohr: '#262321', quaste: '#e6e1d8' },
  { name: 'braun', grund: '#7c6550', weiss: null, flecken: 0, kopfWeiss: false, socken: false, bauch: false,
    maul: '#d3c8b4', nase: '#2a2420', ohr: '#6e5945', quaste: '#2e2620', dunkelUnten: '#5e4c3c' },
];
// 6 Kuh-Arten: jede Fellart mit und ohne Hörner
export const KUH_ARTEN = FELLE.flatMap((f, i) => [{ fell: i, horn: true, name: `${f.name} mit Hörnern` }, { fell: i, horn: false, name: `${f.name} ohne Hörner` }]);

// Farben einmal in RGB umrechnen
for (const f of FELLE) for (const k of ['grund', 'weiss', 'maul', 'nase', 'ohr', 'quaste', 'dunkelUnten']) if (f[k]) f[k] = hexZuRgb(f[k]);
const HORN = hexZuRgb('#e0d3b0'), HORN_SPITZE = hexZuRgb('#3b342b'), HUF = hexZuRgb('#2a2420'), AUGE = hexZuRgb('#141110');

// --- kleine Vektor-Hilfen -------------------------------------------------------
const plus = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mal = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const punkt = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const kreuz = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const mitte = (a, b) => mal(plus(a, b), 0.5);
const OBEN = [0, 1, 0];

// Ellipsoid entlang einer Richtung: rLang in Richtung "dir", rBreit quer, rHoch nach oben
function ei(teil, c, dir, rLang, rBreit, rHoch) {
  const e1 = norm(dir);
  let e2 = kreuz(e1, OBEN);
  e2 = Math.hypot(...e2) < 1e-3 ? [1, 0, 0] : norm(e2);
  const e3 = kreuz(e2, e1);
  return { teil, c, e: [e1, e2, e3], r: [rLang, rBreit, rHoch] };
}
// Ellipsoid entlang der Achsen (rx quer, ry hoch, rz längs)
const kugel = (teil, c, rx, ry, rz) => ({ teil, c, e: [[1, 0, 0], [0, 1, 0], [0, 0, 1]], r: [rx, ry, rz] });

// Kopf: P = Stirn zwischen den Ohren, F = Richtung der Schnauze
function kopf(P, F, horn) {
  const U = norm(plus(OBEN, mal(F, -punkt(F, OBEN)))); // Oberseite des Kopfs
  const teile = [
    ei('kopf', plus(P, mal(F, 0.2)), F, 0.3, 0.165, 0.165),
    ei('maul', plus(plus(P, mal(F, 0.45)), mal(U, -0.02)), F, 0.12, 0.13, 0.12),
  ];
  for (const s of [-1, 1]) {
    const S = [s, 0, 0];
    teile.push(kugel('auge', plus(plus(plus(P, mal(F, 0.16)), mal(S, 0.135)), mal(U, 0.04)), 0.035, 0.035, 0.035));
    teile.push(ei('ohr', plus(plus(plus(P, mal(S, 0.21)), mal(F, 0.04)), mal(U, -0.03)), plus(S, mal(F, 0.2)), 0.11, 0.07, 0.035));
    if (horn) teile.push(ei('horn', plus(plus(plus(P, mal(S, 0.15)), mal(U, 0.07)), mal(F, 0.02)), norm(plus(plus(S, mal(U, 0.9)), mal(F, 0.15))), 0.12, 0.033, 0.033));
  }
  return teile;
}

// Das Modell einer Kuh in einer Pose. Kuh steht im Ursprung und schaut nach +z, y = oben.
// dy = so weit ist der Rumpf abgesenkt (für die Lage der Flecken)
function modell(pose, horn) {
  const t = [];
  const dy = pose === 'liegend' ? -0.56 : 0;
  const breiter = pose === 'liegend' ? 0.04 : 0;
  // Rumpf: Brust, Hinterteil, Bauch, Hüftknochen
  t.push(kugel('koerper', [0, 1.0 + dy, 0.35], 0.33 + breiter, 0.36, 0.55));
  t.push(kugel('koerper', [0, 1.02 + dy, -0.42], 0.34 + breiter, 0.35, 0.52));
  t.push(kugel('koerper', [0, 0.9 + dy, -0.02], 0.31 + breiter, 0.31, 0.6));
  for (const s of [-1, 1]) t.push(kugel('koerper', [s * 0.19, 1.3 + dy, -0.62], 0.07, 0.07, 0.07));
  if (pose === 'stehend' || pose === 'grasend') {
    // Hals und Kopf
    const [h1, h2, P, F] = pose === 'stehend'
      ? [[0, 1.13, 0.72], [0, 1.2, 1.0], [0, 1.33, 1.06], norm([0, -0.55, 0.84])]
      : [[0, 1.1, 0.7], [0, 0.6, 1.0], [0, 0.55, 1.08], norm([0, -0.93, 0.36])];
    t.push(ei('koerper', mitte(h1, h2), plus(h2, mal(h1, -1)), 0.24, 0.17, 0.2));
    t.push(...kopf(P, F, horn));
    // Beine: oben Teil des Rumpfs, unten schlank, dunkle Hufe
    for (const s of [-1, 1]) {
      for (const z of [0.52, -0.58]) {
        const x = s * 0.17;
        if (z > 0) t.push(ei('koerper', [x, 0.72, z], OBEN, 0.2, 0.1, 0.12));
        else t.push(kugel('koerper', [x, 0.78, z + 0.03], 0.12, 0.24, 0.18));
        t.push(ei('bein', [x, 0.32, z], OBEN, 0.3, 0.065, 0.07));
        t.push(kugel('huf', [x, 0.055, z + 0.02], 0.075, 0.06, 0.085));
      }
    }
    // Schwanz mit Quaste
    t.push(ei('schwanz', mitte([0, 1.3, -0.9], [0, 0.62, -0.97]), [0, -0.68, -0.07], 0.35, 0.03, 0.03));
    t.push(kugel('quaste', [0, 0.56, -0.97], 0.05, 0.09, 0.05));
  } else {
    // liegend: Kopf oben (wiederkäuen), Vorderbeine eingeklappt, ein Hinterbein zur Seite
    t.push(ei('koerper', mitte([0, 0.6, 0.65], [0, 0.74, 0.9]), [0, 0.14, 0.25], 0.22, 0.17, 0.2));
    t.push(...kopf([0, 0.9, 0.98], norm([0, -0.4, 0.92]), horn));
    for (const s of [-1, 1]) {
      t.push(ei('bein', [s * 0.2, 0.08, 0.62], [0, 0, 1], 0.28, 0.07, 0.07));
      t.push(kugel('huf', [s * 0.2, 0.06, 0.88], 0.07, 0.055, 0.08));
    }
    t.push(kugel('koerper', [0.33, 0.25, -0.4], 0.14, 0.2, 0.32));
    t.push(ei('bein', [0.4, 0.07, -0.1], [0.3, 0, 1], 0.3, 0.065, 0.065));
    t.push(kugel('huf', [0.47, 0.06, 0.18], 0.07, 0.055, 0.08));
    t.push(ei('schwanz', mitte([0, 0.75, -0.92], [0.15, 0.06, -1.0]), [0.15, -0.69, -0.08], 0.36, 0.03, 0.03));
    t.push(kugel('quaste', [0.16, 0.05, -1.0], 0.05, 0.05, 0.09));
  }
  return { teile: t, dy };
}

// Fellfarbe an einem Punkt (Kuh-Koordinaten). blobs = Flecken dieser Kuh-Art
function farbe(teil, P, art, blobs, dy, lokal) {
  const f = FELLE[art.fell];
  const grund = f.grund, weiss = f.weiss;
  const k = [P[0], P[1] - dy, P[2]]; // Rumpf-Koordinaten (Flecken wandern beim Liegen mit)
  const fleck = () => {
    if (!weiss) return false;
    for (const b of blobs) {
      const a = (k[0] - b.c[0]) / b.r[0], c = (k[1] - b.c[1]) / b.r[1], e = (k[2] - b.c[2]) / b.r[2];
      if (a * a + c * c + e * e < 1) return true;
    }
    return false;
  };
  switch (teil) {
    case 'horn': return lokal[0] > 0.4 ? HORN_SPITZE : HORN;
    case 'huf': return HUF;
    case 'auge': return AUGE;
    case 'maul': return lokal[0] > 0.55 ? f.nase : f.maul;
    case 'ohr': return f.ohr;
    case 'quaste': return f.quaste;
    case 'kopf':
      if (f.kopfWeiss) return lokal[0] < -0.55 && Math.abs(P[0]) > 0.07 ? grund : weiss; // weisser Kopf, hinten etwas braun
      if (f.blesse && Math.abs(P[0]) < 0.05 && lokal[0] > -0.3) return weiss;          // weisse Blesse vorne
      return grund;
    case 'bein':
      if (f.socken && P[1] < 0.42) return weiss;
      if (f.dunkelUnten && P[1] < 0.35) return f.dunkelUnten;
      return fleck() ? weiss : grund;
    default: // Rumpf, Hals, Schwanz
      if (f.bauch && k[1] < 0.72 && teil === 'koerper' && Math.abs(k[2]) < 0.68) return weiss; // Bauch (nicht der Hals)
      return fleck() ? weiss : grund;
  }
}

// Formen in ein Bild rastern (Tiefenpuffer): je Pixel die vorderste Form und ihr Abstand.
// F = vorgerechnete Zahlen je Form (siehe kuhAtlas)
function rastern(F, nf, B, H, breiteM, pyM, tiefe, welche) {
  for (let k = 0, o = 0; k < nf; k++, o += 17) {
    const x0 = Math.max(0, Math.floor((F[o + 13] / breiteM + 0.5) * B)), x1 = Math.min(B - 1, Math.ceil((F[o + 14] / breiteM + 0.5) * B));
    const y0 = Math.max(0, Math.floor(H - F[o + 16] / pyM - 0.5)), y1 = Math.min(H - 1, Math.ceil(H - F[o + 15] / pyM - 0.5));
    const a4 = 4 * F[o + 12];
    for (let y = y0; y <= y1; y++) {
      const wy = (H - y - 0.5) * pyM;
      for (let x = x0; x <= x1; x++) {
        const u = ((x + 0.5) / B - 0.5) * breiteM;
        const l0 = F[o] * u + F[o + 3] * wy + F[o + 6], l1 = F[o + 1] * u + F[o + 4] * wy + F[o + 7], l2 = F[o + 2] * u + F[o + 5] * wy + F[o + 8];
        const bq = 2 * (l0 * F[o + 9] + l1 * F[o + 10] + l2 * F[o + 11]), c = l0 * l0 + l1 * l1 + l2 * l2 - 1;
        const disk = bq * bq - a4 * c;
        if (disk < 0) continue;
        const t = (-bq - Math.sqrt(disk)) * 2 / a4;
        const i = y * B + x;
        if (t > 0 && t < tiefe[i]) { tiefe[i] = t; welche[i] = k; }
      }
    }
  }
}

// Farbe und Helligkeit je Pixel einer Ansicht, dann ins grosse Bild (ab ox, oy) schreiben
function faerben(l, ox, oy, B, H, breiteM, pyM, F, teile, tiefe, welche, d, r, licht, art, blobs, dy) {
  const lokal = [0, 0, 0], P = [0, 0, 0];
  for (let y = 0; y < H; y++) {
    const wy = (H - y - 0.5) * pyM;
    for (let x = 0; x < B; x++) {
      const i = y * B + x, k = welche[i];
      if (k < 0) continue;
      const u = ((x + 0.5) / B - 0.5) * breiteM, t = tiefe[i], p = teile[k], o = k * 17;
      for (let j = 0; j < 3; j++) lokal[j] = F[o + j] * u + F[o + 3 + j] * wy + F[o + 6 + j] + F[o + 9 + j] * t; // Punkt auf der Einheitskugel
      P[0] = r[0] * u + d[0] * (5 - t); P[1] = wy; P[2] = r[2] * u + d[2] * (5 - t);
      // Normale der Form an dieser Stelle
      let nx = 0, ny = 0, nz = 0;
      for (let j = 0; j < 3; j++) { const e = p.e[j], w = lokal[j] / p.r[j]; nx += e[0] * w; ny += e[1] * w; nz += e[2] * w; }
      const nl = Math.hypot(nx, ny, nz) || 1;
      // grob schattieren: 4 Helligkeitsstufen, unten etwas dunkler (steht auf dem Boden)
      const hell = 0.6 + 0.55 * Math.max(0, (nx * licht[0] + ny * licht[1] + nz * licht[2]) / nl);
      let stufe = hell > 1.02 ? 1.08 : hell > 0.88 ? 0.96 : hell > 0.72 ? 0.82 : 0.68;
      if (P[1] < 0.3 && p.teil !== 'huf') stufe *= 0.9;
      // Kanten: Rand der Kuh und Stellen hinter einem näheren Teil (z. B. Bein vor dem Bauch)
      // etwas dunkler, damit man die Form im kleinen Bild erkennt (unten ist Boden, keine Kante)
      let kante = 1;
      for (let n = 0; n < 4; n++) {
        const qx = x + (n === 0 ? -1 : n === 1 ? 1 : 0), qy = y + (n === 2 ? -1 : n === 3 ? 1 : 0);
        if (qy >= H) continue;
        if (qx < 0 || qx >= B || qy < 0 || welche[qy * B + qx] < 0) kante = Math.min(kante, 0.8);
        else if (tiefe[qy * B + qx] < t - 0.3) kante = Math.min(kante, 0.84);
      }
      const rgb = farbe(p.teil, P, art, blobs, dy, lokal), sk = stufe * kante;
      setze(l, ox + x, oy + y, [Math.min(255, Math.round(rgb[0] * sk)), Math.min(255, Math.round(rgb[1] * sk)), Math.min(255, Math.round(rgb[2] * sk))]);
    }
  }
}

// Das ganze Bild: 8 Ansichten x 6 Arten x 3 Posen
export function kuhAtlas(seed = 71) {
  const K = KUH_BILD, B = K.zelleB, H = K.zelleH;
  const zeilen = KUH_ARTEN.length * K.posen.length;
  const l = leinwand(B * K.spalten, H * zeilen);
  const rnd = zufall(seed);
  const pyM = K.hoeheM / H;
  KUH_ARTEN.forEach((art, ai) => {
    // Flecken dieser Kuh-Art: Eier auf dem Rumpf, bis ungefähr der gewünschte Anteil weiss ist
    // (gemessen an Stichproben auf der Oberfläche des Rumpfs)
    const f = FELLE[art.fell], blobs = [];
    if (f.flecken > 0) {
      const probe = [];
      for (let i = 0; i < 300; i++) {
        const w = rnd() * Math.PI * 2, h = rnd() * 2 - 1, q = Math.sqrt(1 - h * h);
        probe.push([Math.cos(w) * q * 0.34, 1.0 + h * 0.35, Math.sin(w) * q * 0.95]);
      }
      const drin = (p, b) => ((p[0] - b.c[0]) / b.r[0]) ** 2 + ((p[1] - b.c[1]) / b.r[1]) ** 2 + ((p[2] - b.c[2]) / b.r[2]) ** 2 < 1;
      const anteil = () => probe.filter((p) => blobs.some((b) => drin(p, b))).length / probe.length;
      for (let n = 0; n < 30 && anteil() < f.flecken; n++) {
        const r = 0.14 + rnd() * 0.2;
        const b = { c: [(rnd() - 0.5) * 0.8, 0.72 + rnd() * 0.7, -0.95 + rnd() * 1.9], r: [r * 1.2, r, r * 1.3] };
        blobs.push(b);
        if (anteil() > f.flecken + 0.08) blobs.pop(); // zu viel weiss: diesen Fleck weglassen
      }
    }
    K.posen.forEach((pose, pi) => {
      const { teile, dy } = modell(pose, art.horn);
      const zeile = ai * K.posen.length + pi;
      for (let v = 0; v < K.spalten; v++) {
        // Ansicht v: Kamera unter dem Winkel a zur Blickrichtung der Kuh (0 = von vorne).
        // Gleiche Rechnung wie im Shader (kuehe.js): Richtung zur Kamera d, rechts im Bild r.
        const a = (v / K.spalten) * Math.PI * 2;
        const d = [-Math.sin(a), 0, Math.cos(a)], r = [Math.cos(a), 0, Math.sin(a)];
        const licht = norm(plus(plus(mal(r, -0.55), mal(OBEN, 0.75)), mal(d, 0.45))); // von links oben vorne
        // Pro Form vorrechnen (schnell): Strahl-Ursprung o = r*u + oben*y + d*5, Richtung -d.
        // Im Einheitskugel-Raum der Form ist der Ursprung dann lo = A*u + B*y + C, die Richtung D fest.
        // Je Form 17 Zahlen: A(3) B(3) C(3) D(3), a, Box im Bild (uMin, uMax, yMin, yMax)
        const nf = teile.length, F = new Float64Array(nf * 17);
        teile.forEach((p, k) => {
          const o = k * 17;
          for (let i = 0; i < 3; i++) {
            const e = p.e[i], ri = p.r[i];
            F[o + i] = (r[0] * e[0] + r[2] * e[2]) / ri;
            F[o + 3 + i] = e[1] / ri;
            F[o + 6 + i] = (5 * (d[0] * e[0] + d[2] * e[2]) - (p.c[0] * e[0] + p.c[1] * e[1] + p.c[2] * e[2])) / ri;
            F[o + 9 + i] = -(d[0] * e[0] + d[2] * e[2]) / ri;
          }
          F[o + 12] = F[o + 9] ** 2 + F[o + 10] ** 2 + F[o + 11] ** 2;
          const rm = Math.max(p.r[0], p.r[1], p.r[2]), u0 = p.c[0] * r[0] + p.c[2] * r[2];
          F[o + 13] = u0 - rm; F[o + 14] = u0 + rm; F[o + 15] = p.c[1] - rm; F[o + 16] = p.c[1] + rm;
        });
        // Jede Form tastet nur die Pixel in ihrem eigenen Bildausschnitt ab, die vorderste gewinnt
        const tiefe = new Float32Array(B * H).fill(Infinity), welche = new Int16Array(B * H).fill(-1);
        rastern(F, nf, B, H, K.breiteM, pyM, tiefe, welche);
        faerben(l, v * B, zeile * H, B, H, K.breiteM, pyM, F, teile, tiefe, welche, d, r, licht, art, blobs, dy);
      }
    });
  });
  return { textur: zuTextur(l), spalten: K.spalten, zeilen, breiteM: K.breiteM, hoeheM: K.hoeheM };
}
