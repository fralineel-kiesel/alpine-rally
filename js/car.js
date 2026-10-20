// Das Auto als 3D-Modell (seit M8a): baueAuto(modell, lackierung) baut es aus den Modelldaten in js/autos.js.
// Hier steht kein Wissen über ein bestimmtes Auto, nur der Baukasten:
//  - Karosserie: alle Teile mit Lack oder fester Farbe in EINER Geometrie (eine Lack-Textur, Pixel-Look),
//    die Farbe kommt aus einem kleinen Bildatlas, der im Code gemalt wird (Lackierung, Streifen, Nummern, Sponsoren,
//    Scheiben, Helme). Jede Fläche holt sich die Farbe aus der Ansicht, in die sie schaut (Seite, oben, vorne, hinten).
//  - Lichter: Scheinwerfer, Rücklichter (Bremslicht), Rückfahrlicht als eigene, unbeleuchtete Teile (Farbe umschalten).
//  - Räder: je ein Teil, Felge mit Speichen; bei hohem Tempo weich zur Scheibe (sonst "Wagenrad-Effekt").
//  - Dreck: im Shader der Karosserie und der Räder (kein eigenes Teil): unten mehr, nach oben weniger, als Pixel-Flecken.
// Die Fahrphysik steckt in physics.js; hier nur Aussehen.

import * as THREE from 'three';
import { CONFIG } from './config.js';
import { autoModell } from './autos.js';
import { pixelText, textBreite } from './pixel.js';

// ---------------------------------------------------------------------------------------------
// Bildatlas: Ansichten (Seite links/rechts, oben, vorne, hinten, Flügel) und einfarbige Felder
// ---------------------------------------------------------------------------------------------
// Bereich einer Ansicht in Autokoordinaten (Meter) und wie er auf die Textur kommt.
// Jede Ansicht ist so angelegt, dass ein Betrachter, der auf diese Fläche schaut, Texte richtig herum liest.
function ansichtenAnlegen(m) {
  const t = m.textur;
  // Grösse der Ansichten: Auto plus etwas Rand (Meter); Flügel: eigener Streifen von fluegelZ[0] bis fluegelZ[1]
  const Z = m.masse.laenge / 2 + 0.02, X = m.masse.breite / 2 + 0.03, Y = t.hoeheBis, [F0, F1] = t.fluegelZ;
  // px(u, v): Lage eines Punktes (Autokoordinaten der Ansicht) im Bereich, in Metern ab der linken oberen Ecke
  const def = {
    seiteL: { k: t.seite, b: 2 * Z, h: Y, achsen: ['z', 'y'], px: (z, y) => [(Z - z), (Y - y)] },   // von links: vorne links im Bild
    seiteR: { k: t.seite, b: 2 * Z, h: Y, achsen: ['z', 'y'], px: (z, y) => [(z + Z), (Y - y)] },   // von rechts: vorne rechts
    oben: { k: t.oben, b: 2 * Z, h: 2 * X, achsen: ['x', 'z'], px: (x, z) => [(Z - z), (X - x)] },
    vorne: { k: t.vorne, b: 2 * X, h: Y, achsen: ['x', 'y'], px: (x, y) => [(x + X), (Y - y)] },
    hinten: { k: t.hinten, b: 2 * X, h: Y, achsen: ['x', 'y'], px: (x, y) => [(X - x), (Y - y)] },
    fluegel: { k: t.fluegel, b: 2 * X, h: F0 - F1, achsen: ['x', 'z'], px: (x, z) => [(X - x), (F0 - z)] },
  };
  // einfache Regal-Packung in den Atlas
  const namen = Object.keys(def).sort((a, b) => def[b].h * def[b].k - def[a].h * def[a].k);
  let x = 0, y = 0, zeile = 0;
  for (const n of namen) {
    const d = def[n];
    d.w = Math.ceil(d.b * d.k); d.hp = Math.ceil(d.h * d.k);
    if (x + d.w > t.breite) { x = 0; y += zeile; zeile = 0; }
    d.x0 = x; d.y0 = y;
    x += d.w; zeile = Math.max(zeile, d.hp);
  }
  // einfarbige Felder (4x4 Pixel) im Rest: in einer Reihe unter dem tiefsten Bereich
  const felder = { x0: 0, y0: y + zeile, n: 0 };
  if (felder.y0 + 4 > t.hoehe) throw new Error('Lack-Textur zu klein');
  return { def, felder };
}

// Farbe eines Namens: zuerst die Lackierung, dann die festen Autofarben (null = nicht malen)
function farbeVon(name, lack) {
  if (name in lack) return lack[name];
  const f = CONFIG.autoOptik.farben;
  if (name in f) return f[name];
  throw new Error(`Autofarbe unbekannt: ${name}`);
}

// Die Lack-Textur malen (auch beim Wechsel der Lackierung, gleiche Leinwand)
function maleLack(ctx, m, A, lack, feldListe, detailBreite) {
  const t = m.textur;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, t.breite, t.hoehe);
  // Grund: alles in Wagenfarbe
  ctx.fillStyle = farbeVon('lack', lack);
  for (const d of Object.values(A.def)) ctx.fillRect(d.x0, d.y0, d.w, d.hp);
  ctx.fillStyle = farbeVon('fluegel', lack);
  ctx.fillRect(A.def.fluegel.x0, A.def.fluegel.y0, A.def.fluegel.w, A.def.fluegel.hp);
  // einfarbige Felder
  feldListe.forEach((name, i) => {
    ctx.fillStyle = farbeVon(name, lack);
    ctx.fillRect(A.felder.x0 + i * 4, A.felder.y0, 4, 4);
  });
  // Bemalung, für jede passende Ansicht
  for (const b of m.bemalung) {
    if (b.abBreite && detailBreite < b.abBreite) continue; // kleine Schrift erst bei feinerem Bild (sonst Pixelrauschen)
    const ziele = b.ansicht === 'seite' ? (b.nur === 'links' ? ['seiteL'] : b.nur === 'rechts' ? ['seiteR'] : ['seiteL', 'seiteR']) : [b.ansicht];
    for (const n of ziele) {
      male(ctx, A.def[n], n, b, lack, m);
      if (b.spiegeln) male(ctx, A.def[n], n, { ...b, gespiegelt: true }, lack, m);
    }
  }
}

// Punkt der Ansicht (Meter) -> Pixel im Atlas
function zuPixel(d, u, v) {
  const [a, b] = d.px(u, v);
  return [d.x0 + a * d.k, d.y0 + b * d.k];
}

// Für Texte: "rechts" und "oben" des Lesers in der Ansicht (u, v)
function leseRichtung(n, b) {
  if (n === 'seiteL') return { r: [-1, 0], o: [0, 1] };
  if (n === 'seiteR') return { r: [1, 0], o: [0, 1] };
  if (n === 'vorne') return { r: [1, 0], o: [0, 1] };
  if (n === 'hinten') return { r: [-1, 0], o: [0, 1] };
  // oben / Flügel (u = x, v = z): von hinten gelesen: rechts = -x, oben = +z; von vorne: rechts = +x, oben = -z
  return b.lesbarVon === 'vorne' ? { r: [1, 0], o: [0, -1] } : { r: [-1, 0], o: [0, 1] };
}

// Text (Pixelschrift) zentriert auf (u, v) der Ansicht malen, richtig herum für den Leser
const textLeinwand = typeof document !== 'undefined' ? document.createElement('canvas') : null;
function maleText(ctx, d, n, b, text, mitte, farbe) {
  const w = textBreite(text), h = 7;
  textLeinwand.width = w; textLeinwand.height = h;
  const tc = textLeinwand.getContext('2d');
  tc.clearRect(0, 0, w, h);
  pixelText(tc, text, 0, 0, 1, farbe, 'links', null);
  const { r, o } = leseRichtung(n, b);
  // Richtungen in Pixeln: wohin zeigt "rechts" und "unten" des Textes im Atlas?
  const [p0x, p0y] = zuPixel(d, mitte[0], mitte[1]);
  const [prx, pry] = zuPixel(d, mitte[0] + r[0], mitte[1] + r[1]);
  const [pox, poy] = zuPixel(d, mitte[0] + o[0], mitte[1] + o[1]);
  const rx = Math.sign(Math.round(prx - p0x)), ry = Math.sign(Math.round(pry - p0y));
  const ux = -Math.sign(Math.round(pox - p0x)), uy = -Math.sign(Math.round(poy - p0y)); // "unten" = gegen "oben"
  const cx = Math.round(p0x - (rx * w + ux * h) / 2), cy = Math.round(p0y - (ry * w + uy * h) / 2);
  ctx.setTransform(rx, ry, ux, uy, cx, cy);
  ctx.drawImage(textLeinwand, 0, 0);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

// Pixelgenau füllen: jedes Pixel, dessen Mitte im Umriss liegt (kein Kantenglätten). Nur im Rahmen
// box = [x0, y0, x1, y1] (Pixel) suchen und zusammenhängende Pixel einer Zeile als ein Rechteck malen (schneller Start)
function fuellePixel(ctx, d, drin, farbe, box) {
  ctx.fillStyle = farbe;
  const xa = Math.max(d.x0, Math.floor(box[0]) - 1), xb = Math.min(d.x0 + d.w, Math.ceil(box[2]) + 1);
  const ya = Math.max(d.y0, Math.floor(box[1]) - 1), yb = Math.min(d.y0 + d.hp, Math.ceil(box[3]) + 1);
  for (let py = ya; py < yb; py++) {
    let start = -1;
    for (let px = xa; px <= xb; px++) {
      const an = px < xb && drin(px + 0.5, py + 0.5);
      if (an && start < 0) start = px;
      else if (!an && start >= 0) { ctx.fillRect(start, py, px - start, 1); start = -1; }
    }
  }
}
// Rahmen um Punkte (Pixel)
function rahmen(punkte) {
  const b = [Infinity, Infinity, -Infinity, -Infinity];
  for (const [x, y] of punkte) { b[0] = Math.min(b[0], x); b[1] = Math.min(b[1], y); b[2] = Math.max(b[2], x); b[3] = Math.max(b[3], y); }
  return b;
}
function imPolygon(x, y, p) {
  let drin = false;
  for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
    if ((p[i][1] > y) !== (p[j][1] > y) && x < ((p[j][0] - p[i][0]) * (y - p[i][1])) / (p[j][1] - p[i][1]) + p[i][0]) drin = !drin;
  }
  return drin;
}

function male(ctx, d, n, b, lack, m) {
  const spx = (u, v) => zuPixel(d, b.gespiegelt ? -u : u, v);
  const farbe = b.farbe ? farbeVon(b.farbe, lack) : null;
  if (b.farbe && farbe === null) return; // (z. B. kein zweiter Streifen in dieser Lackierung)
  if (b.art === 'rechteck' || b.art === 'polygon') {
    const punkte = (b.art === 'rechteck'
      ? [[b.von[0], b.von[1]], [b.bis[0], b.von[1]], [b.bis[0], b.bis[1]], [b.von[0], b.bis[1]]] : b.punkte).map(([u, v]) => spx(u, v));
    fuellePixel(ctx, d, (x, y) => imPolygon(x, y, punkte), farbe, rahmen(punkte));
  } else if (b.art === 'ring') {
    const [mx, my] = spx(b.mitte[0], b.mitte[1]);
    const r0 = b.r[0] * d.k, r1 = b.r[1] * d.k;
    fuellePixel(ctx, d, (x, y) => { const r = Math.hypot(x - mx, y - my); return r >= r0 && r <= r1 && y <= my + 0.5; }, farbe,
      [mx - r1, my - r1, mx + r1, my + r1]);
  } else if (b.art === 'helm') {
    // Helm: runder Fleck mit dunklem Visier (grob, Farbfleck). visier: 'vorne' (Seitenansicht: nur zur Front hin),
    // 'mitte' (von vorne), 'keins' (von hinten sieht man den Hinterkopf)
    const [mx, my] = spx(b.mitte[0], b.mitte[1]);
    const r = b.r * d.k;
    fuellePixel(ctx, d, (x, y) => Math.hypot((x - mx) * 1.1, y - my) <= r, farbe, [mx - r, my - r, mx + r, my + r]);
    const vorneLinks = zuPixel(d, b.mitte[0] + 1, b.mitte[1])[0] < zuPixel(d, b.mitte[0], b.mitte[1])[0]; // wo ist im Atlas vorne?
    const imVisier = (x) => (b.visier === 'vorne' ? (vorneLinks ? x <= mx + 0.5 : x >= mx - 0.5) && Math.abs(x - mx) <= r * 1.0 : Math.abs(x - mx) <= r * 0.75);
    if (b.visier !== 'keins') {
      fuellePixel(ctx, d, (x, y) => y >= my - Math.max(1, r * 0.3) && y <= my + 0.2 && imVisier(x), farbeVon('visier', lack),
        [mx - r, my - Math.max(1, r * 0.3), mx + r, my + 0.2]);
    }
    // Schultern darunter (dunkel); b.schulter = [Breite, Höhe] mal r (fehlt: 1.5 / 1.9 wie in M8a)
    const [sb, sh] = b.schulter || [1.5, 1.9];
    fuellePixel(ctx, d, (x, y) => y > my + r && y <= my + r * sh && Math.abs(x - mx) <= r * sb, farbeVon('schulter', lack),
      [mx - r * sb, my + r, mx + r * sb, my + r * sh]);
  } else if (b.art === 'text') {
    maleText(ctx, d, n, b, b.text, [b.gespiegelt ? -b.mitte[0] : b.mitte[0], b.mitte[1]], farbe);
  } else if (b.art === 'nummer' || b.art === 'kennzeichen') {
    // Feld mit Rand, darin die Startnummer bzw. das Kennzeichen (Feld folgt der Leserichtung im Atlas)
    const nummer = b.art === 'nummer';
    const text = nummer ? m.nummer : m.kennzeichen;
    const grund = farbeVon(nummer ? 'nummerFeld' : 'kennzeichen', lack);
    const rand = farbeVon(nummer ? 'nummerRand' : 'kennzeichenSchrift', lack);
    const schrift = farbeVon(nummer ? 'nummerSchrift' : 'kennzeichenSchrift', lack);
    const { r } = leseRichtung(n, b);
    const [p0x, p0y] = spx(b.mitte[0], b.mitte[1]);
    const [prx, pry] = spx(b.mitte[0] + r[0], b.mitte[1] + r[1]);
    const waagrecht = Math.abs(prx - p0x) > Math.abs(pry - p0y);
    const bw = textBreite(text) + (nummer ? 6 : 4), bh = 11;
    const w = waagrecht ? bw : bh, h = waagrecht ? bh : bw;
    const xa = Math.round(p0x - w / 2), ya = Math.round(p0y - h / 2);
    ctx.fillStyle = rand; ctx.fillRect(xa, ya, w, h);
    ctx.fillStyle = grund; ctx.fillRect(xa + 1, ya + 1, w - 2, h - 2);
    maleText(ctx, d, n, b, text, b.mitte, schrift);
  }
}

// ---------------------------------------------------------------------------------------------
// Geometrie: Dreiecke mit flacher Normale, Farbe über UV (Atlas) oder Vertex-Farbe (Lichter)
// ---------------------------------------------------------------------------------------------
function baueSammler() {
  return { pos: [], nor: [], uv: [], col: [] };
}
const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3(), _n = new THREE.Vector3();

// Dreieck a, b, c anhängen; aussen = ungefähre Richtung nach aussen (die Reihenfolge wird passend gedreht).
// uvVon(p, normale) gibt die UV eines Punktes, farbe (optional) die Vertex-Farbe
function dreieck(s, a, b, c, aussen, uvVon, farbe) {
  _a.set(...a); _b.set(...b); _c.set(...c);
  _n.subVectors(_b, _a).cross(_c.clone().sub(_a));
  if (_n.lengthSq() < 1e-12) return;
  if (aussen && _n.dot(aussen) < 0) { const t = b; b = c; c = t; _n.negate(); }
  _n.normalize();
  for (const p of [a, b, c]) {
    s.pos.push(p[0], p[1], p[2]);
    s.nor.push(_n.x, _n.y, _n.z);
    if (uvVon) { const [u, v] = uvVon(p, _n, a, b, c); s.uv.push(u, v); }
    if (farbe) s.col.push(farbe.r, farbe.g, farbe.b);
  }
}
function viereck(s, a, b, c, d, aussen, uvVon, farbe) {
  dreieck(s, a, b, c, aussen, uvVon, farbe);
  dreieck(s, a, c, d, aussen, uvVon, farbe);
}
const V = (x, y, z) => new THREE.Vector3(x, y, z);

// Ein Teil als Liste von Flächen [{ punkte: [[x,y,z],...], aussen: Vector3 }] (Polygone, konvex oder triangulierbar)
function flaechenVon(t) {
  const F = [];
  if (t.art === 'quader') {
    const [x0, y0, z0] = t.min, [x1, y1, z1] = t.max;
    const p = (i) => [i & 1 ? x1 : x0, i & 2 ? y1 : y0, i & 4 ? z1 : z0];
    F.push({ punkte: [p(1), p(3), p(7), p(5)], aussen: V(1, 0, 0) }, { punkte: [p(0), p(4), p(6), p(2)], aussen: V(-1, 0, 0) });
    F.push({ punkte: [p(2), p(6), p(7), p(3)], aussen: V(0, 1, 0) }, { punkte: [p(0), p(1), p(5), p(4)], aussen: V(0, -1, 0) });
    F.push({ punkte: [p(4), p(5), p(7), p(6)], aussen: V(0, 0, 1) }, { punkte: [p(0), p(2), p(3), p(1)], aussen: V(0, 0, -1) });
  } else if (t.art === 'trapez') {
    const [yu, xu, zuv, zuh] = t.unten, [yo, xo, zov, zoh] = t.oben;
    const u = [[xu, yu, zuv], [-xu, yu, zuv], [-xu, yu, zuh], [xu, yu, zuh]];
    const o = [[xo, yo, zov], [-xo, yo, zov], [-xo, yo, zoh], [xo, yo, zoh]];
    const ohne = t.ohne || [];
    const mitte = V(0, (yu + yo) / 2, (zuv + zuh + zov + zoh) / 4);
    const add = (name, punkte) => {
      if (ohne.includes(name)) return;
      const c = punkte.reduce((s, p) => s.add(V(...p)), V(0, 0, 0)).multiplyScalar(1 / punkte.length);
      F.push({ punkte, aussen: c.sub(mitte) });
    };
    add('unten', u); add('oben', o);
    add('vorne', [u[0], u[1], o[1], o[0]]); add('hinten', [u[3], u[2], o[2], o[3]]);
    add('links', [u[0], u[3], o[3], o[0]]); add('rechts', [u[1], u[2], o[2], o[1]]);
  } else if (t.art === 'prisma') {
    const [x0, x1] = t.x;
    const P = t.profil;
    // Umlaufsinn (in z, y): positiv = gegen den Uhrzeiger
    let flaeche = 0;
    for (let i = 0; i < P.length; i++) { const [z1, y1] = P[i], [z2, y2] = P[(i + 1) % P.length]; flaeche += z1 * y2 - z2 * y1; }
    const dreiecke = THREE.ShapeUtils.triangulateShape(P.map(([z, y]) => new THREE.Vector2(z, y)), []);
    for (const [x, aussen] of [[x1, V(1, 0, 0)], [x0, V(-1, 0, 0)]]) {
      for (const tri of dreiecke) F.push({ punkte: tri.map((i) => [x, P[i][1], P[i][0]]), aussen });
    }
    for (let i = 0; i < P.length; i++) {
      const [za, ya] = P[i], [zb, yb] = P[(i + 1) % P.length];
      // Normale der Kante in (z, y), nach aussen (je nach Umlaufsinn)
      let nz = yb - ya, ny = -(zb - za);
      if (flaeche < 0) { nz = -nz; ny = -ny; }
      F.push({ punkte: [[x0, ya, za], [x1, ya, za], [x1, yb, zb], [x0, yb, zb]], aussen: V(0, ny, nz) });
    }
  } else if (t.art === 'zylinder') {
    const n = t.segmente || 8, r = t.radius, h = t.laenge / 2, [mx, my, mz] = t.mitte;
    const punkt = (w, s) => (t.achse === 'x'
      ? [mx + s * h, my + r * Math.sin(w), mz + r * Math.cos(w)]
      : [mx + r * Math.cos(w), my + r * Math.sin(w), mz + s * h]);
    const ax = t.achse === 'x' ? V(1, 0, 0) : V(0, 0, 1);
    const kappe = (s) => Array.from({ length: n }, (_, k) => punkt((2 * Math.PI * k) / n, s));
    F.push({ punkte: kappe(1), aussen: ax.clone() }, { punkte: kappe(-1), aussen: ax.clone().negate() });
    for (let k = 0; k < n; k++) {
      const w0 = (2 * Math.PI * k) / n, w1 = (2 * Math.PI * (k + 1)) / n, wm = (w0 + w1) / 2;
      const aussen = t.achse === 'x' ? V(0, Math.sin(wm), Math.cos(wm)) : V(Math.cos(wm), Math.sin(wm), 0);
      F.push({ punkte: [punkt(w0, -1), punkt(w1, -1), punkt(w1, 1), punkt(w0, 1)], aussen });
    }
  }
  if (t.spiegeln) {
    const gesp = F.map((f) => ({ punkte: f.punkte.map(([x, y, z]) => [-x, y, z]), aussen: V(-f.aussen.x, f.aussen.y, f.aussen.z) }));
    F.push(...gesp);
  }
  return F;
}

// Fläche (Polygon) in Dreiecke (Fächer; die Polygone sind konvex oder schon Dreiecke)
function flaecheAnhaengen(s, f, uvVon, farbe) {
  const p = f.punkte;
  for (let i = 1; i + 1 < p.length; i++) dreieck(s, p[0], p[i], p[i + 1], f.aussen, uvVon, farbe);
}

function zuGeometrie(s) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(s.pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(s.nor, 3));
  if (s.uv.length) g.setAttribute('uv', new THREE.Float32BufferAttribute(s.uv, 2));
  if (s.col.length) g.setAttribute('color', new THREE.Float32BufferAttribute(s.col, 3));
  g.computeBoundingSphere();
  g.computeBoundingBox();
  return g;
}

// ---------------------------------------------------------------------------------------------
// Rad-Textur (64x64): Scheibe mit Speichen, Scheibe "verwischt", Lauffläche mit Profil
// ---------------------------------------------------------------------------------------------
function maleRad(ctx, r) {
  const F = CONFIG.autoOptik.farben;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, 64, 64);
  const felgeAnteil = r.felgeRadius / r.radius; // Felge im Verhältnis zum ganzen Rad
  const scheibe = (x0, verwischt) => {
    for (let y = 0; y < 32; y++) {
      for (let x = 0; x < 32; x++) {
        const dx = x + 0.5 - 16, dy = y + 0.5 - 16, d = Math.hypot(dx, dy) / 16, w = Math.atan2(dy, dx);
        let f;
        if (d > 1.02) f = F.reifen;
        else if (d > felgeAnteil + 0.04) f = d > 0.93 ? F.reifen : F.reifenFlanke;        // Flanke (hell), Rand dunkel
        else if (d > felgeAnteil - 0.06) f = F.felgeDunkel;                                 // Felgenhorn
        else if (d < 0.14) f = F.felgeMitte;                                                 // Mittelmutter
        else if (verwischt) f = d < 0.26 ? F.felge : F.felgeVerwischt;                     // drehende Speichen = Scheibe
        else {
          // Speichen: r.speichen Stück, je ca. 0.5 rad breit
          const a = ((w * r.speichen) / (2 * Math.PI) % 1 + 1) % 1;
          f = a < 0.32 || d < 0.26 ? F.felge : F.felgeDunkel;
        }
        ctx.fillStyle = f;
        ctx.fillRect(x0 + x, y, 1, 1);
      }
    }
  };
  scheibe(0, false);
  scheibe(32, true);
  // Lauffläche (64 x 16): Profilblöcke
  for (let y = 32; y < 48; y++) {
    for (let x = 0; x < 64; x++) {
      const rand = y === 32 || y === 47;
      const block = ((x >> 2) + (y > 39 ? 1 : 0)) % 2 === 0 && y > 33 && y < 46 && (x & 3) !== 3;
      ctx.fillStyle = rand ? F.reifenFlanke : block ? F.reifenProfil : F.reifen;
      ctx.fillRect(x, y, 1, 1);
    }
  }
  // dunkle Felder: Innenseite, Felgenwand
  ctx.fillStyle = F.reifen; ctx.fillRect(0, 48, 8, 8);
  ctx.fillStyle = F.felgeDunkel; ctx.fillRect(8, 48, 8, 8);
}

// Ein Rad (links, Aussenseite +x); rechts wird gespiegelt. UV in die Rad-Textur.
function radGeometrie(r) {
  const s = baueSammler();
  const n = r.segmente, R = r.radius, rf = r.felgeRadius, h = r.breite / 2, tief = r.felgeTiefe;
  const P = (x, rad, w) => [x, rad * Math.sin(w), rad * Math.cos(w)];
  const scheibeUV = (rad, w) => [0.25 + 0.25 * (rad / R) * Math.cos(w), 0.75 + 0.25 * (rad / R) * Math.sin(w)];
  const feld = (u, v) => () => [u, v];
  // (um eine Viertelumdrehung versetzt: oben und unten liegt eine Ecke, das Rad ist genau 2 x Radius hoch)
  for (let k = 0; k < n; k++) {
    const w0 = (2 * Math.PI * k) / n + Math.PI / 2, w1 = (2 * Math.PI * (k + 1)) / n + Math.PI / 2, wm = (w0 + w1) / 2;
    const radial = V(0, Math.sin(wm), Math.cos(wm));
    // Lauffläche: u einmal rundherum (Profil), v über die Breite
    const ua = k / n, ub = (k + 1) / n;
    const lauf = [[h, R, w0, ua, 0.255], [h, R, w1, ub, 0.255], [-h, R, w1, ub, 0.495], [-h, R, w0, ua, 0.495]];
    const uvLauf = new Map(lauf.map(([x, rad, w, u, v]) => [P(x, rad, w).join(), [u, v]]));
    viereck(s, ...lauf.map(([x, rad, w]) => P(x, rad, w)), radial, (p) => uvLauf.get(p.join()));
    // Flanke aussen (Ring zwischen Felge und Reifen)
    const uvScheibe = (p) => { const rad = Math.hypot(p[1], p[2]), w = Math.atan2(p[1], p[2]); return scheibeUV(rad, w); };
    viereck(s, P(h, rf, w0), P(h, R, w0), P(h, R, w1), P(h, rf, w1), V(1, 0, 0), uvScheibe);
    // Felgenhorn (Wand nach innen) und Felge (Speichen), etwas vertieft
    viereck(s, P(h, rf, w0), P(h, rf, w1), P(h - tief, rf, w1), P(h - tief, rf, w0), radial.clone().negate(), feld(0.19, 0.2));
    dreieck(s, [h - tief, 0, 0], P(h - tief, rf, w0), P(h - tief, rf, w1), V(1, 0, 0), uvScheibe);
    // Innenseite (dunkel)
    dreieck(s, [-h, 0, 0], P(-h, R, w0), P(-h, R, w1), V(-1, 0, 0), feld(0.06, 0.2));
  }
  return zuGeometrie(s);
}

// ---------------------------------------------------------------------------------------------
// Shader-Zusätze: Dreck (Karosserie und Räder) und Felgen-Unschärfe (Räder)
// ---------------------------------------------------------------------------------------------
const DRECK_GLSL = /* glsl */ `
  float dreckRausch(vec3 p) { return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453); }
`;
function karosserieShader(mat, U) {
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uDreck = U.dreck; sh.uniforms.uDreckFarbe = U.farbe; sh.uniforms.uDreckHoehe = U.hoehe;
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vAutoPos;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvAutoPos = position;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>\nvarying vec3 vAutoPos;\nuniform float uDreck;\nuniform vec3 uDreckFarbe;\nuniform vec3 uDreckHoehe;\n${DRECK_GLSL}`)
      .replace('#include <map_fragment>', `#include <map_fragment>
        if (uDreck > 0.0) {
          // unten voll, nach oben bis uDreckHoehe.y ausdünnend; Flecken im Raster uDreckHoehe.z (Pixel-Look)
          float hoch = clamp((uDreckHoehe.y - vAutoPos.y) / (uDreckHoehe.y - uDreckHoehe.x), 0.0, 1.0);
          float n = dreckRausch(floor(vAutoPos * uDreckHoehe.z));
          if (n < uDreck * pow(hoch, 0.8)) diffuseColor.rgb = mix(diffuseColor.rgb, uDreckFarbe, 0.8 + 0.2 * n);
        }`);
  };
  mat.customProgramCacheKey = () => 'auto-karosserie-m8a';
}
function radShader(mat, U) {
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uDreck = U.dreck; sh.uniforms.uDreckFarbe = U.farbe; sh.uniforms.uUnschaerfe = U.unschaerfe;
    sh.uniforms.uReifen = U.reifen; sh.uniforms.uFelge = U.felge; sh.uniforms.uFelgeAnteil = U.felgeAnteil;
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>\nuniform float uDreck;\nuniform vec3 uDreckFarbe;\nuniform float uUnschaerfe;\nuniform float uReifen;\nuniform float uFelge;\nuniform float uFelgeAnteil;\n${DRECK_GLSL}`)
      .replace('#include <map_fragment>', `
        vec4 sampledDiffuseColor = texture2D( map, vMapUv );
        bool scheibe = vMapUv.y > 0.5 && vMapUv.x < 0.5;
        // Felge: weich von den Speichen zur gleichmässigen Scheibe (gleiche Stelle im rechten Teil der Textur)
        if (scheibe && uUnschaerfe > 0.0) sampledDiffuseColor = mix(sampledDiffuseColor, texture2D( map, vMapUv + vec2(0.5, 0.0) ), uUnschaerfe);
        diffuseColor *= sampledDiffuseColor;
        if (uDreck > 0.0) {
          float aufReifen = scheibe ? step(uFelgeAnteil, length(vMapUv - vec2(0.25, 0.75)) * 4.0) : 1.0;
          float menge = uDreck * mix(uFelge, uReifen, aufReifen);
          float n = dreckRausch(vec3(floor(vMapUv * 64.0), 1.0));
          if (n < menge) diffuseColor.rgb = mix(diffuseColor.rgb, uDreckFarbe, 0.85);
        }`);
  };
  mat.customProgramCacheKey = () => 'auto-rad-m8a';
}

// ---------------------------------------------------------------------------------------------
// baueAuto
// ---------------------------------------------------------------------------------------------
// detailBreite: Breite des 3D-Bildes in Pixeln (320, 480, 640): kleine Schrift wird erst ab bemalung.abBreite gemalt
export function baueAuto(modell = autoModell(CONFIG.autoOptik.modell), lackierungName = CONFIG.autoOptik.lackierung, detailBreite = 320) {
  const m = typeof modell === 'string' ? autoModell(modell) : modell;
  const O = CONFIG.autoOptik;
  const A = ansichtenAnlegen(m);

  // --- Farbfelder: alle Namen, die als "slot" vorkommen (Lack-Ansichten haben keinen) ---
  const feldListe = ['unterboden', 'fluegel', ...(m.innenFlaechen ? [m.innenFlaechen.farbe] : [])];
  for (const t of m.teile) if (!t.licht && t.slot !== 'lack' && t.slot !== 'fluegel' && !feldListe.includes(t.slot)) feldListe.push(t.slot);
  const feldUV = (name) => {
    const i = feldListe.indexOf(name);
    return [(A.felder.x0 + i * 4 + 2) / m.textur.breite, 1 - (A.felder.y0 + 2) / m.textur.hoehe];
  };

  // --- Lack-Textur ---
  const leinwand = document.createElement('canvas');
  leinwand.width = m.textur.breite; leinwand.height = m.textur.hoehe;
  const ctx = leinwand.getContext('2d');
  const lackTex = new THREE.CanvasTexture(leinwand);
  lackTex.colorSpace = THREE.SRGBColorSpace;
  lackTex.magFilter = THREE.NearestFilter;
  lackTex.minFilter = THREE.NearestFilter;
  lackTex.generateMipmaps = false;
  let lackName = null;
  function lackierung(name) {
    const lack = O.lackierungen[name] ? name : Object.keys(O.lackierungen)[0];
    maleLack(ctx, m, A, O.lackierungen[lack], feldListe, detailBreite);
    lackTex.needsUpdate = true;
    lackName = lack;
    return lack;
  }
  lackierung(lackierungName);

  // UV einer Fläche: Ansicht je Blickrichtung der Normale (Lack), sonst ein einfarbiges Feld
  const T = m.textur;
  const ansichtUV = (n, p) => {
    const d = A.def[n];
    const u = d.achsen[0] === 'x' ? p[0] : p[2], v = d.achsen[1] === 'y' ? p[1] : p[2];
    const [x, y] = zuPixel(d, u, v);
    return [x / T.breite, 1 - y / T.hoehe];
  };
  const richtung = (nrm) => {
    const ax = Math.abs(nrm.x), ay = Math.abs(nrm.y), az = Math.abs(nrm.z);
    if (ay >= ax && ay >= az) return nrm.y > 0 ? 'oben' : 'unten';
    if (ax >= az) return nrm.x > 0 ? 'seiteL' : 'seiteR';
    return nrm.z > 0 ? 'vorne' : 'hinten';
  };
  // Flächen nach vorne/hinten, die mitten im Auto liegen (Radlauf-Wände, Enden von Kotflügeln und Schwellern),
  // bekommen eine feste Farbe statt der Front-/Heck-Bemalung (sonst erscheinen dort Streifen von Scheinwerfern & Co.)
  const I = m.innenFlaechen;
  const innen = (a, b, c) => I && [a, b, c].every((q) => Math.abs(q[2]) < I.zBis && q[1] < I.yBis + 1e-9);
  const uvFuer = (slot) => (p, nrm, a, b, c) => {
    const r = richtung(nrm);
    if (slot === 'lack' && (r === 'vorne' || r === 'hinten') && innen(a, b, c)) return feldUV(I.farbe);
    if (slot === 'lack') return r === 'unten' ? feldUV('unterboden') : ansichtUV(r, p);
    if (slot === 'fluegel') return r === 'oben' ? ansichtUV('fluegel', p) : feldUV('fluegel');
    return feldUV(slot);
  };

  // --- Teile sammeln: Karosserie (eine Geometrie), Lichter (je Art eine) ---
  const karosserie = baueSammler();
  const lichter = { vorne: baueSammler(), hinten: baueSammler(), rueck: baueSammler() };
  for (const t of m.teile) {
    const flaechen = flaechenVon(t);
    if (t.licht) {
      const farbe = t.farbe ? new THREE.Color(farbeVon(t.farbe, O.lackierungen[lackName])) : null;
      for (const f of flaechen) flaecheAnhaengen(lichter[t.licht], f, null, farbe);
    } else {
      const uv = uvFuer(t.slot);
      for (const f of flaechen) flaecheAnhaengen(karosserie, f, uv);
    }
  }

  // --- gemeinsame Werte für die Shader (ein Objekt, nur die Zahlen ändern sich) ---
  // (Zahlen-Werte mit eigener Form { zahl, value }: so legt das Setzen einer Kommazahl kein neues Objekt an)
  const D = O.dreck;
  const zahl = (w) => ({ zahl: true, value: w });
  const U = {
    dreck: zahl(0), farbe: { value: new THREE.Color(0, 0, 0) }, hoehe: { value: new THREE.Vector3(D.hoeheVoll, D.hoeheAus, D.raster) },
    unschaerfe: zahl(0), reifen: zahl(D.reifen), felge: zahl(D.felge), felgeAnteil: zahl(m.raeder.felgeRadius / m.raeder.radius),
  };

  const auto = new THREE.Group();      // folgt Position, Richtung und Gelände
  auto.name = 'auto';
  const karosse = new THREE.Group();   // Federung: neigt sich um den Schwerpunkt (Nicken, Rollen) und federt (Hub)
  karosse.position.y = m.schwerpunktHoehe;
  auto.add(karosse);
  const teilMeshes = [];
  const anKarosse = (geo, mat, name) => {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = -m.schwerpunktHoehe;
    mesh.name = name;
    karosse.add(mesh);
    teilMeshes.push(mesh);
    return mesh;
  };
  const lackMat = new THREE.MeshLambertMaterial({ map: lackTex, flatShading: true });
  karosserieShader(lackMat, U);
  anKarosse(zuGeometrie(karosserie), lackMat, 'auto-karosserie');
  const F = O.farben;
  const farbe = (h) => new THREE.Color(h);
  const L = {
    hintenAus: farbe(F.ruecklichtAus), hintenAn: farbe(F.ruecklichtAn), rueckAus: farbe(F.rueckfahrAus), rueckAn: farbe(F.rueckfahrAn),
  };
  anKarosse(zuGeometrie(lichter.vorne), new THREE.MeshBasicMaterial({ vertexColors: true }), 'auto-scheinwerfer');
  const matHinten = new THREE.MeshBasicMaterial({ color: L.hintenAus });
  const matRueck = new THREE.MeshBasicMaterial({ color: L.rueckAus });
  anKarosse(zuGeometrie(lichter.hinten), matHinten, 'auto-ruecklicht');
  anKarosse(zuGeometrie(lichter.rueck), matRueck, 'auto-rueckfahrlicht');

  // --- Räder: vorne lenkbar, alle drehen sich; bleiben am Boden (neigen sich nicht mit der Karosserie) ---
  const r = m.raeder;
  const radLeinwand = document.createElement('canvas');
  radLeinwand.width = 64; radLeinwand.height = 64;
  maleRad(radLeinwand.getContext('2d'), r);
  const radTex = new THREE.CanvasTexture(radLeinwand);
  radTex.colorSpace = THREE.SRGBColorSpace;
  radTex.magFilter = THREE.NearestFilter;
  radTex.minFilter = THREE.NearestFilter;
  radTex.generateMipmaps = false;
  const radMat = new THREE.MeshLambertMaterial({ map: radTex, flatShading: true });
  radShader(radMat, U);
  const radGeo = radGeometrie(r);
  const raeder = [];
  for (const [sx, sz] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) {
    const lenk = new THREE.Group();
    lenk.position.set(sx * r.x, r.radius, sz * r.z);
    const dreh = new THREE.Mesh(radGeo, radMat);
    dreh.name = 'auto-rad';
    if (sx < 0) dreh.scale.x = -1; // rechte Räder: gespiegelt (Aussenseite nach rechts)
    lenk.add(dreh);
    auto.add(lenk);
    raeder.push({ lenk, dreh, vorne: sz > 0 });
  }

  // --- einfacher dunkler Fleck als Schatten (so gross wie das Auto) ---
  if (O.blobSchatten) {
    const g = new THREE.PlaneGeometry(m.schatten.breite, m.schatten.laenge);
    g.rotateX(-Math.PI / 2);
    const s = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: '#000', transparent: true, opacity: 0.3, depthWrite: false }));
    s.position.y = 0.05;
    s.renderOrder = 1;
    s.name = 'auto-schatten';
    auto.add(s);
  }

  let bremsAn = null, rueckAn = null;
  const radWinkel = new Float64Array(1); // Drehwinkel der Räder (Zahlenfeld: kein neues Objekt pro Bild)
  return {
    objekt: auto,
    karosse,
    modell: m,
    get lackName() { return lackName; },
    uniforms: U,
    leinwand, radLeinwand,
    // Räder: z = { lenkwinkel (rad, sichtbarer Einschlag vorne), strecke (gefahrene Meter seit dem letzten Bild,
    // rückwärts negativ), tempo (m/s, für die Unschärfe der Felge) } – ein Objekt statt drei Zahlen (nichts Neues pro Bild)
    raederBewegen(z) {
      radWinkel[0] += z.strecke / r.radius;
      // Drehung direkt als Quaternion setzen (wie rotation.x = ..., aber ohne Funktionsaufruf mit Kommazahl: so legt
      // der Browser pro Bild kein kleines Zahl-Objekt an). Die Euler-Winkel werden mitgeführt (nur zum Lesen).
      const sd = Math.sin(radWinkel[0] / 2), cd = Math.cos(radWinkel[0] / 2);
      const sl = Math.sin(z.lenkwinkel / 2), cl = Math.cos(z.lenkwinkel / 2);
      for (let i = 0; i < raeder.length; i++) {
        const rad = raeder[i], qd = rad.dreh.quaternion, ed = rad.dreh.rotation;
        qd._x = sd; qd._y = 0; qd._z = 0; qd._w = cd; ed._x = radWinkel[0];
        if (rad.vorne) {
          const ql = rad.lenk.quaternion, el = rad.lenk.rotation;
          ql._x = 0; ql._y = sl; ql._z = 0; ql._w = cl; el._y = z.lenkwinkel;
        }
      }
      const ab = O.radUnschaerfeAb, breite = Math.max(1e-6, O.radUnschaerfeBreite);
      const x = Math.min(1, Math.max(0, (Math.abs(z.tempo) - ab) / breite));
      U.unschaerfe.value = x * x * (3 - 2 * x);
    },
    // Federung: f = { nicken (rad, + = Nase runter), rollen (rad, + = lehnt nach rechts), hub (m, + = höher) },
    // z. B. das Objekt aus js/federung.js (ein Objekt statt drei Zahlen: so entsteht pro Bild nichts Neues).
    // Anschlag (Federweg): die vier Radläufe kommen den Reifen nie näher als raeder.radlaufLuft; sonst wird die
    // Karosserie so weit angehoben (sonst stäche das Rad bei starkem Nicken und Einfedern durch den Kotflügel)
    federung(f) {
      const nicken = f.nicken, rollen = f.rollen;
      let hub = f.hub;
      // tiefster der vier Radläufe (vorne/hinten mal links/rechts), ohne neue Objekte
      const tiefst = hub - Math.abs(r.z * Math.sin(nicken)) - Math.abs(r.x * Math.sin(rollen));
      if (tiefst < -r.radlaufLuft) hub += -r.radlaufLuft - tiefst;
      // (wie karosse.rotation.set(nicken, 0, rollen), Reihenfolge XYZ, aber direkt: kein Zahl-Objekt pro Bild)
      const sx = Math.sin(nicken / 2), cx = Math.cos(nicken / 2), sz = Math.sin(rollen / 2), cz = Math.cos(rollen / 2);
      const q = karosse.quaternion, e = karosse.rotation;
      q._x = sx * cz; q._y = -sx * sz; q._z = cx * sz; q._w = cx * cz;
      e._x = nicken; e._y = 0; e._z = rollen;
      karosse.position.y = m.schwerpunktHoehe + hub;
    },
    // Bremslicht und Rückfahrlicht (nur bei Änderung: Farbe des vorhandenen Materials setzen)
    lichter(bremse, rueckwaerts) {
      if (bremse !== bremsAn) { bremsAn = bremse; matHinten.color.copy(bremse ? L.hintenAn : L.hintenAus); }
      if (rueckwaerts !== rueckAn) { rueckAn = rueckwaerts; matRueck.color.copy(rueckwaerts ? L.rueckAn : L.rueckAus); }
    },
    // Dreck: d = { menge (0..autoOptik.dreck.max), r, g, b (Farbe linear, 0..1) }; an = false: kein Dreck zeigen
    dreck(d, an = true) {
      U.dreck.value = an ? d.menge : 0;
      const c = U.farbe.value;
      c.r = d.r; c.g = d.g; c.b = d.b;
    },
    lackierung,
    // Bildbreite (320, 480, 640) ändern: Lack neu malen, wenn dadurch Schrift dazukommt oder wegfällt
    detail(breite) {
      if (breite === detailBreite) return;
      detailBreite = breite;
      lackierung(lackName);
    },
    get detailBreite() { return detailBreite; },
    // Für Tests: Drehwinkel der Räder, Teile
    get radWinkel() { return radWinkel[0]; },
    raeder, teilMeshes,
  };
}
