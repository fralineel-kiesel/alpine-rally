// Lage der Touch-Knöpfe und des Spielbilds (Meilenstein 9a). Reine Rechnung, ohne Seite: die Tests rufen sie direkt auf.
// berechneLayout(breite, hoehe, safe) bekommt die Fenstergrösse in CSS-Pixeln und die Safe-Area-Ränder des Handys
// { o, r, u, l } (Notch, Home-Balken) und liefert:
//   { format: 'hoch' | 'quer', k (Grösse der Knöpfe, 1 = wie in config.js), bild: { x, y, b, h } (16:9),
//     flaeche: { x, y, b, h } (Hochformat: dunkle Steuerfläche unten, sonst null),
//     el: { dpad, a, b, l, r, select, start, notes } }
//   el.dpad.zone (M9a.1) = unsichtbare Trefferzone des D-Pads beim Fahren (grösser als das Kreuz, siehe touch.fahrZone)
// M9a.2: optionen { faktor (Einstellung KNOPFGRÖSSE, touch.knopfGroessen; 1 = NORMAL), gespiegelt (LAYOUT GESPIEGELT:
//   alles waagrecht gespiegelt, D-Pad und L rechts, A/B und R links; nur die Lage, die Bilder der Knöpfe bleiben lesbar) }.
//   Der Faktor wirkt auf alle Knöpfe zusammen; passt etwas nicht ins Fenster, wird er dort kleiner (wie bisher k).
// Jedes Element: { x, y, b, h } = Trefferfläche (nie kleiner als minTreffer; START/SELECT/NOTES im Querformat nie kleiner
// als kleinTreffer), v = sichtbarer Knopf darin.
// Hochformat: Bild in voller Breite, mittig im Raum über der Steuerfläche; Steuerfläche unten mit L in der oberen Ecke
//   links und R in der oberen Ecke rechts, D-Pad links, A/B rechts (B tiefer und weiter links), SELECT START NOTES unten
//   in der Mitte.
// Querformat: Bild in der Mitte, so gross wie es die Seitenzonen erlauben; links L oben, D-Pad, SELECT; rechts R oben in
//   der Ecke (M9a.2: wieder wie in M9a, in M9a.1 sass R direkt über A), A/B, NOTES und START (oder alle drei in einer
//   Reihe unter dem Bild, wenn dort Platz ist).

import { CONFIG } from './config.js';
import { t } from './texte.js';
import { PIXEL, pilleBreite } from './touchbild.js';

export const KLEINE = ['select', 'start', 'notes'];
export const beschriftung = (n) => t(`touch.${n}`); // Beschriftung von START, SELECT, NOTES (js/texte.js)

// Grössen aller Knöpfe bei Massstab k; kleinTreffer = Mindestgrösse der Trefferfläche von START/SELECT/NOTES;
// f = Faktor der Knopfgrösse (M9a.2, nur für R im Querformat nötig: k enthält f schon)
function groessen(k, kleinTreffer, f = 1) {
  const T = CONFIG.touch;
  const m = T.minTreffer;
  const d = Math.max(T.dpadMinDurchmesser, T.dpad * k);
  const a = Math.max(m, T.ab * k);
  const dx = Math.max(T.abVersatz[0] * k, a + 2), dy = T.abVersatz[1] * k;
  const sb = Math.max(m, T.schulter[0] * k), sh = T.schulter[1] * k;
  // R (Handbremse, M9a.1): im Querformat nicht um den Faktor kleiner, erst wenn das Fenster es verlangt
  const kr = Math.min(f, k / T.quer.faktor);
  const rb = Math.max(m, T.schulterR[0] * kr), rh = T.schulterR[1] * kr;
  // kleine Knöpfe (M9a.1): Pille kv hoch, Breite nach der Beschriftung; Trefferfläche mindestens kleinTreffer
  const kv = T.klein * k, kt = Math.max(kleinTreffer, kv);
  const kb = (n) => Math.max(kt, pilleBreite(beschriftung(n)) * kv / PIXEL.klein); // Breite der Trefferfläche
  return {
    d, a, dx, dy, sb, sh, sht: Math.max(m, sh), rb, rh, rht: Math.max(m, rh), kv, kt, kb, kh: kt, // kh: Höhe der Reihe
    abB: dx + a, abH: dy + a, // Feld von A und B zusammen
  };
}

const rechteck = (x, y, b, h) => ({ x, y, b, h });
const mitte = (r, b, h) => rechteck(r.x + (r.b - b) / 2, r.y + (r.h - h) / 2, b, h);

// Ein Element an seiner Trefferfläche; v = sichtbarer Teil (zentriert)
function element(x, y, b, h, vb, vh) { const r = rechteck(x, y, b, h); r.v = mitte(r, vb, vh); return r; }
function klein(n, x, y, g) { return element(x, y, g.kb(n), g.kt, pilleBreite(beschriftung(n)) * g.kv / PIXEL.klein, g.kv); }
// D-Pad (Mitte cx, cy) und A/B (A mit der rechten Kante bei xr, beide zusammen senkrecht um cy)
function dpadBei(cx, cy, g) { return element(cx - g.d / 2, cy - g.d / 2, g.d, g.d, g.d, g.d); }
function abBei(xr, cy, g) {
  const ay = cy - g.abH / 2;
  return {
    a: element(xr - g.a, ay, g.a, g.a, g.a, g.a),
    b: element(xr - g.a - g.dx, ay + g.dy, g.a, g.a, g.a, g.a),
  };
}
// Trefferzone des D-Pads beim Fahren (M9a.1): waagrecht von x0 bis x1, senkrecht fahrZone.hoehe der D-Pad-Grösse über
// und unter das Kreuz (zwischen yMin und yMax). Liegt ein anderer Knopf darin (L, SELECT), gewinnt der Knopf (touch.js).
function fahrZone(el, x0, x1, yMin, yMax) {
  const Z = CONFIG.touch.fahrZone, d = el.dpad;
  const y0 = Math.max(yMin, d.y - Z.hoehe * d.h), y1 = Math.min(yMax, d.y + d.h + Z.hoehe * d.h);
  return rechteck(x0, y0, x1 - x0, y1 - y0);
}
// R (Handbremse) oben in der rechten Ecke (M9a.2, wie in M9a), rechte Kante bei xr
const rEcke = (xr, y, g) => element(xr - g.rb, y, g.rb, g.rht, g.rb, g.rh);

// Layout waagrecht spiegeln (M9a.2, LAYOUT GESPIEGELT): jedes Rechteck an der Fenstermitte
function spiegeln(r, W) {
  if (!r) return r;
  const s = rechteck(W - r.x - r.b, r.y, r.b, r.h);
  if (r.v) s.v = spiegeln(r.v, W);
  if (r.zone) s.zone = spiegeln(r.zone, W);
  return s;
}

export function berechneLayout(W, H, safe = { o: 0, r: 0, u: 0, l: 0 }, { faktor = 1, gespiegelt = false } = {}) {
  if (gespiegelt) {
    // normal rechnen mit vertauschten Safe-Area-Rändern, dann spiegeln
    const L = berechneLayout(W, H, { ...safe, l: safe.r, r: safe.l }, { faktor });
    const el = {};
    for (const n of Object.keys(L.el)) el[n] = spiegeln(L.el[n], W);
    return { ...L, bild: spiegeln(L.bild, W), flaeche: spiegeln(L.flaeche, W), el, gespiegelt: true };
  }
  const f = faktor;
  const T = CONFIG.touch;
  const mL = Math.max(T.rand, safe.l), mR = Math.max(T.rand, safe.r);
  const ro = T.randOben, lu = T.luecke;
  // Spalten: links L, D-Pad, kleine Knöpfe; rechts R, A/B, kleine Knöpfe (L und R oben in einer Reihe)
  const spalteH = (g) => ro + Math.max(g.sht, g.rht) + lu + Math.max(g.d, g.abH) + lu + g.kh + ro;
  const el = {};
  if (H > W) {
    // --- Hochformat ---
    const bb = W - safe.l - safe.r, bh = bb * 9 / 16;
    const breiteNoetig = (g) => g.d + 16 + g.abB;
    const reiheB = (g) => KLEINE.reduce((s, n) => s + g.kb(n), 0) + 2 * T.hoch.kleinLuecke;
    let k = f; // (M9a.2: mit der Knopfgrösse; zu gross für das Fenster: k wird kleiner)
    const platz = H - safe.o - bh - 4; // so hoch darf die Steuerfläche höchstens sein (das Bild bleibt ganz)
    const kt = T.hoch.kleinTreffer;
    for (let g = groessen(k, kt, f); k > 0.4 && (breiteNoetig(g) > W - mL - mR || reiheB(g) > W - mL - mR || spalteH(g) + safe.u > platz); g = groessen(k, kt, f)) k -= 0.02;
    const g = groessen(k, kt, f);
    const P = Math.min(platz, Math.max(spalteH(g) + safe.u, T.hoch.steuerAnteil * H));
    const yP = H - P;
    const flaeche = rechteck(0, yP, W, P);
    const bild = rechteck(safe.l, safe.o + (yP - safe.o - bh) / 2, bb, bh);
    el.l = element(mL, yP + ro, g.sb, g.sht, g.sb, g.sh);
    const yK = H - safe.u - ro - g.kh; // Reihe der kleinen Knöpfe
    let x = (W - reiheB(g)) / 2;
    for (const n of KLEINE) { el[n] = klein(n, x, yK, g); x += g.kb(n) + T.hoch.kleinLuecke; }
    const cy = (yP + ro + g.sht + yK) / 2;
    el.dpad = dpadBei(mL + g.d / 2, cy, g);
    Object.assign(el, abBei(W - mR, cy, g));
    el.r = rEcke(W - mR, yP + ro, g);
    el.dpad.zone = fahrZone(el, mL, (el.dpad.x + el.dpad.b + el.b.x) / 2, yP, H - safe.u);
    return { format: 'hoch', k, bild, flaeche, el };
  }
  // --- Querformat ---
  // Kleine Knöpfe in einer Reihe unter dem Bild (wenn darunter Platz ist), sonst in den Seitenzonen (links SELECT unter
  // dem D-Pad; rechts NOTES direkt unter R und START unten, M9a.2). Die Knöpfe werden kleiner, bis beide Spalten in
  // die Höhe passen und die Zone nicht breiter als zoneMaxAnteil wird (nie kleiner als dpadMinDurchmesser und minTreffer).
  const Q = T.quer;
  const Hv = H - safe.o - safe.u;
  const oben = safe.o + ro, unterkante = H - safe.u - ro;
  const reiheB = (g) => KLEINE.reduce((s, n) => s + g.kb(n), 0) + 2 * T.hoch.kleinLuecke;
  const k0 = Q.faktor * Math.min(1, H / Q.kleinAb) * f; // (M9a.2: mal Knopfgrösse)
  // Knöpfe bei Massstab k; passt = beide Spalten haben in der Höhe Platz und die Zone rechts ist nicht zu breit
  const bau = (k, seitlich) => {
    const g = groessen(k, T.kleinTreffer, f);
    const e = {};
    const yK = unterkante - g.kh; // seitlich: Reihe der kleinen Knöpfe unten in den Zonen
    const boden = seitlich ? yK - lu : unterkante; // so tief dürfen D-Pad und A/B reichen
    // M9a.1: D-Pad quer mit eigener Grösse (nicht mal k), begrenzt durch Fensterhöhe, Zone links und Platz in der Spalte
    // (M9a.2: Grösse, Höhenanteil und Zone wachsen mit der Knopfgrösse f; Platz in der Spalte begrenzt)
    g.d = Math.max(T.dpadMinDurchmesser, Math.min(Q.dpad * f, Q.dpadHoehe * f * Hv, Q.dpadZoneMax * f * W - mL - Q.bildLuecke, boden - oben - g.sht - lu));
    const cy = (oben + g.sht + lu + boden) / 2; // Mitte der Spalten (zwischen L und dem Boden)
    // links: L oben, D-Pad (und SELECT); rechts: R oben in der Ecke, A/B (und NOTES unter R, START unten)
    e.l = element(mL, oben, g.sb, g.sht, g.sb, g.sh);
    e.dpad = dpadBei(mL + g.d / 2, cy, g);
    Object.assign(e, abBei(W - mR, cy, g));
    e.r = rEcke(W - mR, oben, g);
    if (seitlich) {
      e.select = klein('select', mL + (g.d - g.kb('select')) / 2, yK, g);
      e.start = klein('start', W - mR - g.kb('start'), yK, g);
      e.notes = klein('notes', W - mR - g.kb('notes'), e.r.y + e.r.h + lu, g);
    }
    const ueberA = seitlich ? e.notes : e.r; // das unterste Element über A/B
    const eps = 0.01;
    const ZL = mL + Math.max(g.d, g.sb, seitlich ? e.select.b : 0) + Q.bildLuecke;
    const ZR = mR + Math.max(g.abB, g.rb, seitlich ? Math.max(e.start.b, e.notes.b) : 0) + Q.bildLuecke;
    const hoehe = e.dpad.y >= e.l.y + e.l.h + lu - eps && e.dpad.y + e.dpad.h <= boden + eps
      && ueberA.y + ueberA.h + lu <= e.a.y + eps && e.b.y + e.b.h <= boden + eps;
    const breite = ZR <= Q.zoneMaxAnteil * f * W || g.a <= T.minTreffer; // (links begrenzt dpadZoneMax das D-Pad)
    return { k, g, e, ZL, ZR, passt: hoehe && breite };
  };
  const versuch = (seitlich) => {
    let v = bau(k0, seitlich);
    for (let k = k0; k > 0.4 && !v.passt; ) { k -= 0.02; v = bau(k, seitlich); }
    v.ZL = Math.max(Q.seitenZone * f, v.ZL); v.ZR = Math.max(Q.seitenZone * f, v.ZR);
    const frei = Q.bildMittig ? W - 2 * Math.max(v.ZL, v.ZR) : W - v.ZL - v.ZR;
    v.bb = Math.min(frei, (seitlich ? Hv : Hv - lu - v.g.kh - ro) * 16 / 9);
    v.bh = v.bb * 9 / 16;
    return v;
  };
  // beide Varianten rechnen, die mit dem grösseren Bild gewinnt (bei gleich grossem Bild: unter dem Bild)
  const u = versuch(false), sv = versuch(true);
  const seitlich = sv.bh > u.bh + 0.5 || reiheB(u.g) > u.bb;
  const { k, g, bb, bh, e, ZL, ZR } = seitlich ? sv : u;
  const blockH = seitlich ? bh : bh + lu + g.kh;
  // Bild mittig im Fenster oder (bildMittig: false) mittig zwischen den beiden Zonen
  const bx = Q.bildMittig ? (W - bb) / 2 : ZL + (W - ZL - ZR - bb) / 2;
  const bild = rechteck(bx, safe.o + (Hv - blockH) / 2, bb, bh);
  Object.assign(el, e);
  if (!seitlich) {
    let x = bild.x + (bb - reiheB(g)) / 2;
    for (const n of KLEINE) { el[n] = klein(n, x, bild.y + bh + lu, g); x += g.kb(n) + T.hoch.kleinLuecke; }
  }
  el.dpad.zone = fahrZone(el, mL, bild.x - T.fahrZone.bildAbstand, safe.o, H - safe.u);
  return { format: 'quer', k, bild, flaeche: null, el, klein: seitlich ? 'seitlich' : 'unten' };
}
