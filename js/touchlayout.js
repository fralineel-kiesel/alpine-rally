// Lage der Touch-Knöpfe und des Spielbilds (Meilenstein 9a). Reine Rechnung, ohne Seite: die Tests rufen sie direkt auf.
// berechneLayout(breite, hoehe, safe) bekommt die Fenstergrösse in CSS-Pixeln und die Safe-Area-Ränder des Handys
// { o, r, u, l } (Notch, Home-Balken) und liefert:
//   { format: 'hoch' | 'quer', k (Grösse der Knöpfe, 1 = wie in config.js), bild: { x, y, b, h } (16:9),
//     flaeche: { x, y, b, h } (Hochformat: dunkle Steuerfläche unten, sonst null),
//     el: { dpad, a, b, l, r, select, start, notes } }
// Jedes Element: { x, y, b, h } = Trefferfläche (nie kleiner als minTreffer), v = sichtbarer Knopf darin,
// bei den kleinen Knöpfen zusätzlich s = Beschriftung darunter.
// Hochformat: Bild in voller Breite, mittig im Raum über der Steuerfläche; Steuerfläche unten mit L/R in den oberen Ecken,
//   D-Pad links, A/B rechts (B tiefer und weiter links), SELECT START NOTES unten in der Mitte.
// Querformat: Bild in der Mitte, so gross wie es die Seitenzonen erlauben; links L, D-Pad, SELECT; rechts R, A/B,
//   NOTES und START (oder alle drei in einer Reihe unter dem Bild, wenn dort Platz ist).

import { CONFIG } from './config.js';
import { textBreite } from './pixel.js';
import { t } from './texte.js';

export const KLEINE = ['select', 'start', 'notes'];
export const beschriftung = (n) => t(`touch.${n}`); // Beschriftung unter START, SELECT, NOTES (js/texte.js)

// Grössen aller Knöpfe bei Massstab k
function groessen(k) {
  const T = CONFIG.touch;
  const m = T.minTreffer;
  const d = Math.max(T.dpadMinDurchmesser, T.dpad * k);
  const a = Math.max(m, T.ab * k);
  const dx = Math.max(T.abVersatz[0] * k, a + 2), dy = T.abVersatz[1] * k;
  const sb = Math.max(m, T.schulter[0] * k), sh = T.schulter[1] * k;
  const kv = T.klein * k, kt = Math.max(m, kv);
  const sg = T.schriftGroesse;
  const kb = (n) => Math.max(kt, textBreite(beschriftung(n)) * sg); // Breite eines kleinen Knopfs mit Beschriftung
  return {
    d, a, dx, dy, sb, sh, sht: Math.max(m, sh), kv, kt, kb, kh: kt + 2 + 7 * sg, // kh: Höhe mit Beschriftung
    abB: dx + a, abH: dy + a, // Feld von A und B zusammen
  };
}

const rechteck = (x, y, b, h) => ({ x, y, b, h });
const mitte = (r, b, h) => rechteck(r.x + (r.b - b) / 2, r.y + (r.h - h) / 2, b, h);

// Ein Element an seiner Trefferfläche; v = sichtbarer Teil (zentriert), bei kleinen Knöpfen oben in der Fläche
function element(x, y, b, h, vb, vh) { const r = rechteck(x, y, b, h); r.v = mitte(r, vb, vh); return r; }
function klein(n, x, y, g) {
  const r = rechteck(x, y, g.kb(n), g.kh);
  const oben = rechteck(x, y, r.b, g.kt);
  r.v = mitte(oben, g.kv, g.kv);
  const sg = CONFIG.touch.schriftGroesse;
  const sb = textBreite(beschriftung(n)) * sg;
  r.s = rechteck(x + (r.b - sb) / 2, y + g.kt + 2, sb, 7 * sg);
  return r;
}
// D-Pad (Mitte cx, cy) und A/B (A mit der rechten Kante bei xr, beide zusammen senkrecht um cy)
function dpadBei(cx, cy, g) { return element(cx - g.d / 2, cy - g.d / 2, g.d, g.d, g.d, g.d); }
function abBei(xr, cy, g) {
  const ay = cy - g.abH / 2;
  return {
    a: element(xr - g.a, ay, g.a, g.a, g.a, g.a),
    b: element(xr - g.a - g.dx, ay + g.dy, g.a, g.a, g.a, g.a),
  };
}

export function berechneLayout(W, H, safe = { o: 0, r: 0, u: 0, l: 0 }) {
  const T = CONFIG.touch;
  const mL = Math.max(T.rand, safe.l), mR = Math.max(T.rand, safe.r);
  const ro = T.randOben, lu = T.luecke;
  const spalteH = (g) => ro + g.sht + lu + Math.max(g.d, g.abH) + lu + g.kh + ro; // Schulter, D-Pad/AB, kleine Knöpfe
  const el = {};
  if (H > W) {
    // --- Hochformat ---
    const bb = W - safe.l - safe.r, bh = bb * 9 / 16;
    const breiteNoetig = (g) => g.d + 16 + g.abB;
    const reiheB = (g) => KLEINE.reduce((s, n) => s + g.kb(n), 0) + 2 * T.hoch.kleinLuecke;
    let k = 1;
    const platz = H - safe.o - bh - 4; // so hoch darf die Steuerfläche höchstens sein (das Bild bleibt ganz)
    for (let g = groessen(k); k > 0.4 && (breiteNoetig(g) > W - mL - mR || reiheB(g) > W - mL - mR || spalteH(g) + safe.u > platz); g = groessen(k)) k -= 0.02;
    const g = groessen(k);
    const P = Math.min(platz, Math.max(spalteH(g) + safe.u, T.hoch.steuerAnteil * H));
    const yP = H - P;
    const flaeche = rechteck(0, yP, W, P);
    const bild = rechteck(safe.l, safe.o + (yP - safe.o - bh) / 2, bb, bh);
    el.l = element(mL, yP + ro, g.sb, g.sht, g.sb, g.sh);
    el.r = element(W - mR - g.sb, yP + ro, g.sb, g.sht, g.sb, g.sh);
    const yK = H - safe.u - ro - g.kh; // Reihe der kleinen Knöpfe
    let x = (W - reiheB(g)) / 2;
    for (const n of KLEINE) { el[n] = klein(n, x, yK, g); x += g.kb(n) + T.hoch.kleinLuecke; }
    const cy = (yP + ro + g.sht + yK) / 2;
    el.dpad = dpadBei(mL + g.d / 2, cy, g);
    Object.assign(el, abBei(W - mR, cy, g));
    return { format: 'hoch', k, bild, flaeche, el };
  }
  // --- Querformat ---
  // Zuerst: kleine Knöpfe in einer Reihe unter dem Bild (wenn darunter Platz ist), sonst unten in den Seitenzonen
  // (links SELECT, rechts NOTES und START). Die Knöpfe werden kleiner, bis die Spalten in die Höhe passen und die
  // Zone nicht breiter als zoneMaxAnteil wird (nie kleiner als dpadMinDurchmesser und minTreffer).
  const Q = T.quer;
  const Hv = H - safe.o - safe.u;
  const reiheB = (g) => KLEINE.reduce((s, n) => s + g.kb(n), 0) + 2 * T.hoch.kleinLuecke;
  const unten = (g) => g.kb('notes') + 12 + g.kb('start'); // rechts unten: NOTES und START nebeneinander
  const zoneKnoepfe = (g) => Math.max(mL + Math.max(g.d, g.sb), mR + Math.max(g.abB, g.sb)) + Q.bildLuecke;
  const zoneKlein = (g) => Math.max(mL + g.kb('select'), mR + unten(g)) + Q.bildLuecke;
  const spalteOhne = (g) => ro + g.sht + lu + Math.max(g.d, g.abH) + ro;
  const k0 = Q.faktor * Math.min(1, H / Q.kleinAb);
  const versuch = (seitlich) => {
    let k = k0;
    const hoch = seitlich ? spalteH : spalteOhne;
    for (let g = groessen(k); k > 0.4 && (hoch(g) > Hv || (zoneKnoepfe(g) > Q.zoneMaxAnteil * W && g.d > T.dpadMinDurchmesser)); g = groessen(k)) k -= 0.02;
    const g = groessen(k);
    const Z = Math.max(Q.seitenZone, zoneKnoepfe(g), seitlich ? zoneKlein(g) : 0);
    const bb = Math.min(W - 2 * Z, (seitlich ? Hv : Hv - lu - g.kh - ro) * 16 / 9);
    return { k, g, Z, bb, bh: bb * 9 / 16 };
  };
  // beide Varianten rechnen, die mit dem grösseren Bild gewinnt (bei gleich grossem Bild: unter dem Bild)
  const u = versuch(false), sv = versuch(true);
  const seitlich = sv.bh > u.bh + 0.5 || reiheB(u.g) > u.bb;
  const v = seitlich ? sv : u;
  const { k, g, bb, bh } = v;
  const blockH = seitlich ? bh : bh + lu + g.kh;
  const bild = rechteck((W - bb) / 2, safe.o + (Hv - blockH) / 2, bb, bh);
  const oben = safe.o + ro, yK = seitlich ? H - safe.u - ro - g.kh : bild.y + bh + lu;
  const cy = seitlich ? (oben + g.sht + yK) / 2 : (oben + g.sht + H - safe.u - ro) / 2;
  // links: L oben, D-Pad; rechts: R oben, A/B
  el.l = element(mL, oben, g.sb, g.sht, g.sb, g.sh);
  el.dpad = dpadBei(mL + g.d / 2, cy, g);
  el.r = element(W - mR - g.sb, oben, g.sb, g.sht, g.sb, g.sh);
  Object.assign(el, abBei(W - mR, cy, g));
  if (seitlich) {
    el.select = klein('select', mL + (g.d - g.kb('select')) / 2, yK, g);
    el.start = klein('start', W - mR - g.kb('start'), yK, g);
    el.notes = klein('notes', el.start.x - 12 - g.kb('notes'), yK, g);
  } else {
    let x = (W - reiheB(g)) / 2;
    for (const n of KLEINE) { el[n] = klein(n, x, yK, g); x += g.kb(n) + T.hoch.kleinLuecke; }
  }
  return { format: 'quer', k, bild, flaeche: null, el, klein: seitlich ? 'seitlich' : 'unten' };
}
