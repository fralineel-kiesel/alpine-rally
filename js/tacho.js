// Analoge Tachos im Pixel-Look (Meilenstein 1.2): Tempo und Drehzahl, unten rechts.
// Die Zifferblätter werden einmal vorab auf eigene kleine Bilder (Canvas) gemalt,
// pro Bild kommen nur Nadel und digitale Zahlen dazu. Alles Pixel für Pixel,
// ohne Kantenglättung. Masse und Farben: config.js "hud.tacho".
// M8f: Skala je Fahrprofil (Block "tacho" im Profil: drehzahlMax, drehzahlRotAb, tempoMax; fehlt er, gilt hud.tacho).
// Beim Autowechsel werden die Zifferblätter neu gemalt (je Skala nur einmal, danach aus dem Vorrat).
// M8g: Tacho je Auto. Der Profil-Block "tacho" nennt den Stil (hud.tachoStile) und die Skala im Auto-Stil; der
// Unterblock "klassisch" die Skala im klassischen Tacho (fehlt er, gilt hud.tacho). Einstellung TACHO: 'auto' = Stil
// und Skala des Autos, 'klassisch' = genau der Tacho von 0.8f (Stil "klassisch" = Werte aus hud.tacho).
// Zifferblätter werden einmal je (Stil, Skala, Einheit) gemalt und liegen danach im Vorrat (kein Garbage pro Bild).

import { CONFIG } from './config.js';
import { t as tx, beiSprachwechsel } from './texte.js';

// Winzige Schrift, 3x5 Pixel ('#' = Pixel an), für Skalenzahlen und Beschriftung
export const MINI = {
  '0': ['###', '#.#', '#.#', '#.#', '###'],
  '1': ['.#.', '##.', '.#.', '.#.', '###'],
  '2': ['##.', '..#', '.#.', '#..', '###'],
  '3': ['##.', '..#', '.#.', '..#', '##.'],
  '4': ['#.#', '#.#', '###', '..#', '..#'],
  '5': ['###', '#..', '##.', '..#', '##.'],
  '6': ['.##', '#..', '###', '#.#', '###'],
  '7': ['###', '..#', '.#.', '.#.', '.#.'],
  '8': ['###', '#.#', '###', '#.#', '###'],
  '9': ['###', '#.#', '###', '..#', '##.'],
  'A': ['.#.', '#.#', '###', '#.#', '#.#'], // A, B, L, S seit M6 (Etikett BEST / LETZT / LAST des Live-Vergleichs)
  'B': ['##.', '#.#', '##.', '#.#', '##.'],
  'E': ['###', '#..', '##.', '#..', '###'],
  'H': ['#.#', '#.#', '###', '#.#', '#.#'],
  'I': ['###', '.#.', '.#.', '.#.', '###'],
  'K': ['#.#', '#.#', '##.', '#.#', '#.#'],
  'L': ['#..', '#..', '#..', '#..', '###'],
  'M': ['#.#', '###', '###', '#.#', '#.#'],
  'N': ['##.', '#.#', '#.#', '#.#', '#.#'],
  'P': ['##.', '#.#', '##.', '#..', '#..'],
  'S': ['.##', '#..', '.#.', '..#', '##.'],
  'T': ['###', '.#.', '.#.', '.#.', '.#.'],
  'U': ['#.#', '#.#', '#.#', '#.#', '###'],
  'X': ['#.#', '#.#', '.#.', '#.#', '#.#'],
  'Z': ['###', '..#', '.#.', '#..', '###'],
  'D': ['##.', '#.#', '#.#', '#.#', '##.'], // D, O, R, W seit M8g (BOOST, LADER, BLOWER)
  'O': ['.#.', '#.#', '#.#', '#.#', '.#.'],
  'R': ['##.', '#.#', '##.', '#.#', '#.#'],
  'W': ['#.#', '#.#', '###', '###', '#.#'],
  '/': ['..#', '..#', '.#.', '#..', '#..'],
  ' ': ['...', '...', '...', '...', '...'],
};

// Breite eines Mini-Textes in Pixeln
export const miniBreite = (t) => String(t).length * 4 - 1;

// Mini-Text zeichnen (x, y = links oben), optional mit dunklem Schatten
export function miniText(ctx, t, x, y, farbe, schatten) {
  t = String(t).toUpperCase();
  for (const [f, d] of schatten ? [[schatten, 1], [farbe, 0]] : [[farbe, 0]]) {
    ctx.fillStyle = f;
    for (let i = 0; i < t.length; i++) {
      const z = MINI[t[i]] || MINI[' '];
      for (let yy = 0; yy < 5; yy++) for (let xx = 0; xx < 3; xx++) if (z[yy][xx] === '#') ctx.fillRect(x + i * 4 + xx + d, y + yy + d, 1, 1);
    }
  }
}

// Gerade Linie Pixel für Pixel (Bresenham), breite 1 oder 2
function linie(ctx, x0, y0, x1, y1, breite = 1) {
  x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
  const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  const flach = dx >= -dy; // eher waagrecht -> zweites Pixel darunter, sonst daneben
  let err = dx + dy;
  for (;;) {
    ctx.fillRect(x0, y0, 1, 1);
    if (breite > 1) ctx.fillRect(x0 + (flach ? 0 : 1), y0 + (flach ? 1 : 0), 1, 1);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; x0 += sx; }
    if (e2 <= dx) { err += dx; y0 += sy; }
  }
}

// Winkel (Grad, mathematisch: 0 = rechts, 90 = oben) für einen Anteil 0..1 der Skala
function winkel(f) {
  const b = CONFIG.hud.tacho.bogen;
  return 90 + b / 2 - b * f;
}
const GRAD = Math.PI / 180;
const punkt = (cx, cy, w, d) => [cx + Math.cos(w * GRAD) * d, cy - Math.sin(w * GRAD) * d];

// M8g: Stil auflösen: hud.tacho (Farben, Nadel), darüber hud.tachoStile.klassisch (Form) und der Stil selbst.
// Unbekannter Stil = klassisch. Je Stil nur einmal gerechnet (gemerkt; der Vorrat ist so gross wie die Stil-Tabelle).
const STILE = new Map();
export function tachoStil(id) {
  const tabelle = CONFIG.hud.tachoStile || {};
  const name = Object.prototype.hasOwnProperty.call(tabelle, id) ? id : 'klassisch';
  let s = STILE.get(name);
  if (!s) {
    const k = tabelle.klassisch || {}, eigen = tabelle[name] || {};
    s = { ...CONFIG.hud.tacho, ...k, ...eigen, id: name };
    // Unterblöcke (z. B. gang) einzeln zusammenlegen: fehlt ein Wert, gilt der klassische
    for (const [n, w] of Object.entries(k)) if (w && typeof w === 'object' && !Array.isArray(w)) s[n] = { ...w, ...(eigen[n] || {}) };
    STILE.set(name, s);
  }
  return s;
}
// (für das Fahr-Labor oder Tests nach einer Änderung an config.js: Stile neu rechnen)
export function stileVergessen() { STILE.clear(); }

// M8g: Stil und Skala eines Fahrprofils für die Einstellung TACHO ('auto' oder 'klassisch').
// Ergebnis in ziel (wird überschrieben, kein neues Objekt): { stil, drehzahlMax, drehzahlRotAb, tempoMax, tempoMaxMph }
export function tachoFuer(profilId, modus, ziel = {}) {
  const t = CONFIG.hud.tacho;
  const p = (CONFIG.fahrprofile && CONFIG.fahrprofile[profilId] && CONFIG.fahrprofile[profilId].tacho) || null;
  const q = !p ? {} : modus === 'klassisch' ? p.klassisch || {} : p;
  ziel.stil = modus === 'klassisch' || !p ? 'klassisch' : p.stil || 'klassisch';
  ziel.drehzahlMax = q.drehzahlMax ?? t.drehzahlMax;
  ziel.drehzahlRotAb = q.drehzahlRotAb ?? t.drehzahlRotAb;
  ziel.tempoMax = q.tempoMax ?? t.tempoMax;
  ziel.tempoMaxMph = q.tempoMaxMph ?? t.tempoMaxMph;
  // M8g: Schaltlicht-Schwellen und Art des Laders ('turbo', 'kompressor'), nur im Auto-Stil
  ziel.schaltlicht = modus === 'klassisch' || !p ? null : p.schaltlicht || null;
  ziel.lader = modus === 'klassisch' || !p ? null : p.lader || null;
  return ziel;
}

// Ein Zifferblatt vorab malen. Ergebnis: Canvas, Mitte liegt bei (r + 2, r + 2)
// M8g: t = Stil (tachoStil), klassisch = hud.tacho wie bis 0.8f. skala.frei: Rechtecke [x0, y0, x1, y1] relativ zur
// Mitte, die die Skalenzahlen im Auto-Stil frei lassen müssen (Gang, Digitalanzeige, Lampen). Ergebnis zusätzlich:
// zahlen = gesetzte Skalenzahlen { text, x, y, b } (für Tests: nichts überlappt)
function maleBlatt(r, skala, t = tachoStil('klassisch')) {
  const groesse = 2 * r + 5, m = r + 2;
  const c = document.createElement('canvas');
  c.width = groesse; c.height = groesse;
  const ctx = c.getContext('2d');
  const klassisch = t.id === 'klassisch';
  const rb = t.rotBreite ?? 2, mb = t.musterBreite ?? 0;
  // Anteil der Skala (0..1) für einen Winkel in Grad
  const anteil = (w) => { if (w <= 90 - t.bogen / 2 - 0.01) w += 360; return (90 + t.bogen / 2 - w) / t.bogen; };
  // M8g: Segmentband (LED-Look): Lücke an jedem kurzen Strich, so breit wie ein Pixel auf diesem Radius
  const schritt = t.bogen * skala.kurz / skala.max * GRAD;
  const inLuecke = (f, d) => { const k = f * skala.max / skala.kurz; return Math.abs(k - Math.round(k)) * schritt * d < 0.6; };
  // Scheibe, Rand und dunkler Ring aussen, Pixel für Pixel
  for (let y = 0; y < groesse; y++) {
    for (let x = 0; x < groesse; x++) {
      const dx = x - m, dy = y - m, d = Math.hypot(dx, dy);
      let farbe = null;
      if (d <= r - 0.5) farbe = t.farbeBlatt;
      else if (d <= r + 0.5) farbe = t.farbeRand;
      else if (d <= r + 1.5) farbe = t.farbeRandAussen;
      // M8g: Muster: Innenring (unter den Strichen) oder Segmentband (nur entlang der Skala, mit Lücken)
      if (t.farbeMuster && t.muster === 'innenring' && d <= r - 0.5 && d > r - 0.5 - mb) farbe = t.farbeMuster;
      if (t.farbeMuster && t.muster === 'segmentband' && d <= r - 1.5 && d > r - 1.5 - mb) {
        const f = anteil(Math.atan2(-dy, dx) / GRAD);
        if (f >= 0 && f <= 1 && !inLuecke(f, d)) farbe = t.farbeMuster;
      }
      // roter Bereich (nur Drehzahl): schmales Band innen am Rand
      if (skala.rotAb != null && d > r - 1.5 - rb && d <= r - 1.5) {
        const f = anteil(Math.atan2(-dy, dx) / GRAD);
        if (f >= skala.rotAb / skala.max && f <= 1 && !(t.muster === 'segmentband' && inLuecke(f, d))) farbe = t.farbeRot;
      }
      if (farbe) { ctx.fillStyle = farbe; ctx.fillRect(x, y, 1, 1); }
    }
  }
  // Skalenstriche (M8g: im Auto-Stil ist der letzte Strich immer lang; Punkte statt Linien beim LED-Look)
  // Belegte Pixel merken (Maske), damit die Skalenzahlen im Auto-Stil nichts berühren
  const maske = new Uint8Array(groesse * groesse);
  const merker = { fillStyle: '', fillRect(x, y, b, h) { for (let j = y; j < y + h; j++) for (let i = x; i < x + b; i++) if (i >= 0 && j >= 0 && i < groesse && j < groesse) maske[j * groesse + i] = 1; } };
  ctx.fillStyle = t.farbeStriche;
  for (let v = 0; v <= skala.max + 1e-9; v += skala.kurz) {
    const lang = Math.abs(v / skala.lang - Math.round(v / skala.lang)) < 1e-6 || (!klassisch && Math.abs(v - skala.max) < 1e-6);
    const w = winkel(v / skala.max);
    if (t.strichForm === 'punkt') {
      const [x, y] = punkt(m, m, w, r - 1.5 - Math.max(mb, 2) / 2);
      const g = lang ? 2 : 1, x0 = Math.round(x - (g - 1) / 2), y0 = Math.round(y - (g - 1) / 2);
      ctx.fillRect(x0, y0, g, g); merker.fillRect(x0, y0, g, g);
      continue;
    }
    const [x0, y0] = punkt(m, m, w, r - 1.5);
    const [x1, y1] = punkt(m, m, w, r - (lang ? 5 : 3));
    linie(ctx, x0, y0, x1, y1);
    linie(merker, x0, y0, x1, y1);
  }
  const schatten = t.zahlenSchatten ? t.farbeSchatten : null;
  // feste Beschriftung und freie Felder: auch sie müssen die Zahlen frei lassen
  const bText = skala.beschriftung && skala.beschriftung[0], bx = bText ? Math.round(m - miniBreite(bText) / 2) : 0;
  if (bText) merker.fillRect(bx, m + skala.beschriftung[1], miniBreite(bText) + 1, 6);
  for (const [x0, y0, x1, y1] of skala.frei || []) merker.fillRect(m + x0, m + y0, x1 - x0 + 1, y1 - y0 + 1);
  // Skalenzahlen (Mini-Schrift, gelb mit Schatten). Klassisch wie bis 0.8f; im Auto-Stil ohne Überlappung (zahlenLage)
  const zahlen = klassisch ? zahlenAuf(m, r, skala, skala.zahlAbstand, 1) : zahlenLage(m, r, skala, maske, groesse, !!schatten);
  for (const z of zahlen) miniText(ctx, z.text, z.x, z.y, t.farbeZahlen, schatten);
  if (bText) miniText(ctx, bText, bx, m + skala.beschriftung[1], t.farbeBeschriftung || t.farbeStriche, schatten);
  return { bild: c, m, zahlen: zahlen.map((z) => ({ ...z, x: z.x - m, y: z.y - m })), weggelassen: skala.weggelassen || [] };
}

// Skalenzahlen auf dem Radius r - abstand, jede n-te Zahl. Ergebnis: [{ text, x, y, b }] (x, y = links oben)
function zahlenAuf(m, r, skala, abstand, n) {
  const out = [];
  let i = 0;
  for (let v = 0; v <= skala.max + 1e-9; v += skala.zahlen, i++) {
    if (i % n) continue;
    const text = String(Math.round(v / skala.teiler));
    const [x, y] = punkt(m, m, winkel(v / skala.max), r - abstand);
    out.push({ text, x: Math.round(x - miniBreite(text) / 2), y: Math.round(y - 2.5), b: miniBreite(text) });
  }
  return out;
}
// M8g: Skalenzahlen im Auto-Stil so setzen, dass nichts überlappt: zwischen zwei Zahlen bleibt mindestens ein leeres
// Pixel (der dunkle Schatten zählt nicht), und keine Zahl (mit Schatten) liegt auf einem Strich, der Beschriftung oder
// einem freien Feld. Der Reihe nach versucht:
//  1. alle Zahlen auf dem üblichen Abstand (oder alle einen Pixel weiter aussen oder innen),
//  2. jede Zahl einzeln auf dem ersten Abstand, der passt; höchstens eine Zahl, die nirgends passt, fällt weg
//     (beim Tempo die 200 über der Digitalanzeige; ihr langer Strich bleibt),
//  3. nur jede zweite Zahl.
// Ergebnis: [{ text, x, y, b }]; weggelassene Zahlen stehen in skala.weggelassen (für Tests und den Bericht).
function zahlenLage(m, r, skala, maske, groesse, schatten) {
  const s = schatten ? 1 : 0;
  const frei = (z) => {
    for (let y = z.y; y <= z.y + 4 + s; y++) {
      for (let x = z.x; x < z.x + z.b + s; x++) {
        if (x < 0 || y < 0 || x >= groesse || y >= groesse || maske[y * groesse + x]) return false;
        if (Math.hypot(x - m, y - m) > r - 1.5) return false;
      }
    }
    return true;
  };
  const getrennt = (a, b) => a.x + a.b < b.x || b.x + b.b < a.x || a.y + 5 < b.y || b.y + 5 < a.y;
  const passt = (z) => z.every(frei) && z.every((a, i) => z.every((b, j) => j <= i || getrennt(a, b)));
  const ABSTAENDE = [0, -1, 1];
  for (const da of ABSTAENDE) {
    const z = zahlenAuf(m, r, skala, skala.zahlAbstand + da, 1);
    if (passt(z)) return z;
  }
  const je = ABSTAENDE.map((da) => zahlenAuf(m, r, skala, skala.zahlAbstand + da, 1));
  const gesetzt = [], weg = [];
  for (let i = 0; i < je[0].length; i++) {
    const z = je.map((l) => l[i]).find((k) => frei(k) && gesetzt.every((g) => getrennt(g, k)));
    if (z) gesetzt.push(z); else weg.push(je[0][i].text);
  }
  if (weg.length <= 1) { skala.weggelassen = weg; return gesetzt; }
  let letzte = null;
  for (const da of ABSTAENDE) {
    letzte = zahlenAuf(m, r, skala, skala.zahlAbstand + da, 2);
    if (passt(letzte)) break;
  }
  skala.weggelassen = ['jede zweite'];
  return letzte;
}

// M8g: Vorrat der gemalten Zifferblätter für alle Tachos (HUD und Garage), Schlüssel: Art, Stil, Skala, Einheit.
// Höchstens ein Blatt je Stil und Skala, also nie mehr als die Stil-Tabelle mal drei (Drehzahl, km/h, mph).
const VORRAT = new Map();
function ausVorrat(schluessel, male) {
  let b = VORRAT.get(schluessel);
  if (!b) { b = male(); VORRAT.set(schluessel, b); }
  return b;
}

// M8g: Felder (relativ zur Mitte, [x0, y0, x1, y1]), die die Skalenzahlen im Auto-Stil frei lassen: Nabe,
// Digitalanzeige (Tempo) und Gang-Kästchen (Drehzahl)
const FREI_TEMPO = [[-2, -2, 2, 2], [-10, 9, 9, 17]];
const FREI_DREH = [[-2, -2, 2, 2], [-5, 2, 5, 13]];
// M8g: Feld des Schaltlichts eines Stils (relativ zur Nabe) oder null
export function lichtFeld(stil) {
  const L = stil.schaltlicht;
  if (!L) return null;
  if (L.form === 'reihe') { const b = L.farben.length * 3 - 1, x0 = -Math.floor(b / 2); return [x0, L.y, x0 + b - 1, L.y + 1]; }
  const h = Math.floor(L.groesse / 2);
  return [-h, L.y, h, L.y + L.groesse - 1];
}
// M8g: 7-Segment-Ziffer (LED) im Gang-Kästchen: Segmente a bis g als Rechtecke [x, y, b, h] relativ zur Nabe
const SEGMENTE = { a: [-1, 5, 3, 1], b: [2, 6, 1, 2], c: [2, 9, 1, 2], d: [-1, 11, 3, 1], e: [-2, 9, 1, 2], f: [-2, 6, 1, 2], g: [-1, 8, 3, 1] };
const LED = { 1: 'bc', 2: 'abged', 3: 'abgcd', 4: 'fgbc', 5: 'afgcd', N: 'ceg', R: 'eg' };
const FARBE_R = '#ff4a3a'; // Rückwärtsgang immer rot (wie hud.js 'rot')

// Tachos bauen. text: 5x7-Schrift aus hud.js (text(t, x, y, groesse, farbe, ausrichtung))
export function baueTachos(ctx, text) {
  const t = CONFIG.hud.tacho;
  const B = CONFIG.bild.breite, H = CONFIG.bild.hoehe;
  const rT = t.tempoRadius, rD = t.drehzahlRadius;
  // Mittelpunkte: Tempo ganz rechts, Drehzahl links daneben, unten bündig
  // Tempo-Zifferblatt je Einheit (seit M5a auch mph), wird erst bei Bedarf gemalt
  // M8f: Skala des gewählten Autos (Standard: hud.tacho); M8g: dazu der Stil (Einstellung TACHO)
  const skala = tachoFuer(null, 'klassisch'), neu = tachoFuer(null, 'klassisch');
  let stil = tachoStil(skala.stil);
  const tempoBlatt = (einheit) => (einheit === 'mph'
    ? ausVorrat(`tempo|${stil.id}|mph|${skala.tempoMaxMph}`, () => maleBlatt(rT, { max: skala.tempoMaxMph, lang: t.tempoStrichLangMph, kurz: t.tempoStrichKurzMph, zahlen: t.tempoZahlenMph, teiler: 1, zahlAbstand: 11, beschriftung: [tx('einheit.mph'), 18], frei: FREI_TEMPO }, stil))
    : ausVorrat(`tempo|${stil.id}|kmh|${skala.tempoMax}`, () => maleBlatt(rT, { max: skala.tempoMax, lang: t.tempoStrichLang, kurz: t.tempoStrichKurz, zahlen: t.tempoZahlen, teiler: 1, zahlAbstand: 11, beschriftung: [tx('einheit.kmh'), 18], frei: FREI_TEMPO }, stil)));
  const freiDreh = () => (lichtFeld(stil) ? [...FREI_DREH, lichtFeld(stil)] : FREI_DREH);
  const drehBlatt = () => ausVorrat(`dreh|${stil.id}|${skala.drehzahlMax}|${skala.drehzahlRotAb}`,
    () => maleBlatt(rD, { max: skala.drehzahlMax * 1000, lang: 1000, kurz: 500, zahlen: 1000, teiler: 1000, zahlAbstand: 9, rotAb: skala.drehzahlRotAb * 1000, beschriftung: [tx('tacho.drehzahl'), 14], frei: freiDreh() }, stil));
  const tempo = { cx: B - t.randRechts - rT - 2, cy: H - t.randUnten - rT - 2, r: rT, ...tempoBlatt('kmh') };
  let einheit = 'kmh', faktor = 1, skalaMax = skala.tempoMax, profilVor = null, modus = 'auto', modusVor = null;
  const dreh = { cx: B - t.randRechts - 2 * rT - 5 - t.abstand - rD - 2, cy: H - t.randUnten - rD - 2, r: rD, ...drehBlatt() };
  const anzeige = { kmh: 0, drehzahl: 0, lade: 0, uhr: 0 };
  // M8g: Tafel der Ladedruck-/Lader-Anzeige über dem Drehzahlmesser (Lage relativ zur Nabe; Bild aus dem Vorrat)
  const LADE = { x: -23, y: -(rD + 11), b: 47, h: 9 };
  let ladeTafel = null;
  beiSprachwechsel(() => { ladeTafel = null; });
  function ladeTafelBild() {
    const text = tx(skala.lader === 'kompressor' ? 'tacho.lader' : 'tacho.boost');
    return ausVorrat(`lade|${stil.id}|${text}`, () => {
      const c = document.createElement('canvas'); c.width = LADE.b; c.height = LADE.h;
      const k = c.getContext('2d');
      // Tafel mit abgeschrägten Ecken in den Farben des Stils: innen das Blatt (halbtransparent wie das Zifferblatt),
      // aussen ein 1 Pixel breiter Rand (nicht übereinander malen, sonst mischt sich das Blatt mit dem Rand)
      k.fillStyle = stil.farbeBlatt; k.fillRect(1, 1, LADE.b - 2, LADE.h - 2);
      k.fillStyle = stil.farbeRand;
      k.fillRect(1, 0, LADE.b - 2, 1); k.fillRect(1, LADE.h - 1, LADE.b - 2, 1);
      k.fillRect(0, 1, 1, LADE.h - 2); k.fillRect(LADE.b - 1, 1, 1, LADE.h - 2);
      miniText(k, text, 3, 2, stil.farbeBeschriftung || stil.farbeStriche, stil.zahlenSchatten ? stil.farbeSchatten : null);
      return { bild: c, balkenX: 3 + miniBreite(text) + 3, balkenB: LADE.b - 4 - (3 + miniBreite(text) + 3) };
    });
  }

  // M8g: Gang-Anzeige im Auto-Stil: Kästchen, Kästchen mit Rahmen, nur Ziffer oder 7-Segment-LED; R immer rot
  function zeichneGang(gang) {
    const G = stil.gang, cx = dreh.cx, cy = dreh.cy, farbe = gang === 'R' ? FARBE_R : G.farbeZiffer;
    if (G.form !== 'ohne') { ctx.fillStyle = stil.farbeKasten; ctx.fillRect(cx - 4, cy + 3, 9, 10); }
    if (G.form === 'rahmen') {
      ctx.fillStyle = G.farbeRahmen;
      ctx.fillRect(cx - 5, cy + 2, 11, 1); ctx.fillRect(cx - 5, cy + 13, 11, 1);
      ctx.fillRect(cx - 5, cy + 3, 1, 10); ctx.fillRect(cx + 5, cy + 3, 1, 10);
    }
    if (G.form === 'led') {
      const an = LED[gang] || '';
      for (const s in SEGMENTE) {
        const [x, y, b, h] = SEGMENTE[s];
        ctx.fillStyle = an.includes(s) ? farbe : G.farbeAus;
        ctx.fillRect(cx + x, cy + y, b, h);
      }
      return;
    }
    text(gang, cx - 2, cy + 5, 1, farbe, 'links', G.zifferSchatten ? undefined : null);
  }
  // M8g: Schaltlicht (nur Anzeige): an ab skala.schaltlicht.an, blinkt ab .blinken; aus in N, R und in der Schaltpause.
  // Reihe: Punkt i leuchtet ab fuellenAb + (an - fuellenAb) * i / (Anzahl - 1), der letzte also ab "an".
  function zeichneSchaltlicht(gang, extra) {
    const L = stil.schaltlicht, S = skala.schaltlicht;
    const garage = extra && extra.lichtDrehzahl != null;
    const rpm = garage ? extra.lichtDrehzahl : anzeige.drehzahl;
    const aus = !garage && (gang === 'N' || gang === 'R' || !!(extra && extra.schaltet));
    const blinkt = !aus && rpm >= S.blinken, hell = !blinkt || Math.floor(anzeige.uhr * L.hz * 2) % 2 === 0;
    const cx = dreh.cx, y0 = dreh.cy + L.y;
    if (L.form === 'reihe') {
      const n = L.farben.length, x0 = cx - Math.floor((n * 3 - 1) / 2);
      for (let i = 0; i < n; i++) {
        const ab = n === 1 ? S.an : S.fuellenAb + (S.an - S.fuellenAb) * i / (n - 1);
        ctx.fillStyle = !aus && rpm >= ab && hell ? L.farben[i] : L.farbeAus;
        ctx.fillRect(x0 + i * 3, y0, 2, 2);
      }
      return;
    }
    const an = !aus && rpm >= S.an && hell, g = L.groesse, x0 = cx - Math.floor(g / 2);
    ctx.fillStyle = an ? (blinkt && L.farbeBlinken ? L.farbeBlinken : L.farbeAn) : L.farbeAus;
    if (g >= 5) {
      ctx.fillRect(x0 + 1, y0, g - 2, 1); ctx.fillRect(x0, y0 + 1, g, g - 2); ctx.fillRect(x0 + 1, y0 + g - 1, g - 2, 1);
    } else ctx.fillRect(x0, y0, g, g);
  }
  // M8g: Ladedruck (Turbo: echter Ladedruck) oder Lader (Kompressor: Drehzahl mal Gas) als Leiste auf der Tafel über
  // dem Drehzahlmesser, weich nachgeführt
  function zeichneLader(dt, extra) {
    const A = stil.ladeAnzeige;
    const ziel = !extra ? 0 : skala.lader === 'kompressor'
      ? Math.min(1, Math.max(0, anzeige.drehzahl / (skala.drehzahlMax * 1000))) * (extra.gas || 0)
      : Math.min(1, Math.max(0, extra.ladedruck || 0));
    anzeige.lade += (ziel - anzeige.lade) * (1 - Math.exp(-stil.ladeFolgen * dt));
    if (!ladeTafel) ladeTafel = ladeTafelBild();
    const x = dreh.cx + LADE.x, y = dreh.cy + LADE.y;
    ctx.drawImage(ladeTafel.bild, x, y);
    const bx = x + ladeTafel.balkenX, bb = ladeTafel.balkenB;
    if (A.segmente > 0) {
      const schritt = Math.floor((bb + 1) / A.segmente), an = Math.round(anzeige.lade * A.segmente);
      for (let i = 0; i < A.segmente; i++) { ctx.fillStyle = i < an ? A.farbe : A.farbeLeer; ctx.fillRect(bx + i * schritt, y + 2, schritt - 1, 5); }
    } else {
      const w = Math.round(anzeige.lade * bb);
      ctx.fillStyle = A.farbeLeer; ctx.fillRect(bx, y + 2, bb, 5);
      ctx.fillStyle = A.farbe; ctx.fillRect(bx, y + 2, w, 5);
    }
  }
  // M8g: Nadel je Stil (Breite, Länge, Schatten, andersfarbige Spitze)
  function nadel(d, f) {
    const w = winkel(Math.max(0, Math.min(1.02, f)));
    const [x1, y1] = punkt(d.cx, d.cy, w, d.r - stil.nadelLaenge);
    if (stil.nadelSchatten) {
      ctx.fillStyle = stil.farbeSchatten;
      linie(ctx, d.cx + 1, d.cy + 1, x1 + 1, y1 + 1, stil.nadelBreite);
    }
    ctx.fillStyle = stil.farbeNadel;
    linie(ctx, d.cx, d.cy, x1, y1, stil.nadelBreite);
    if (stil.farbeNadelSpitze) {
      const [x0, y0] = punkt(d.cx, d.cy, w, d.r - stil.nadelLaenge - 3);
      ctx.fillStyle = stil.farbeNadelSpitze;
      linie(ctx, x0, y0, x1, y1, stil.nadelBreite);
    }
    // Nabe
    ctx.fillStyle = stil.farbeSchatten;
    ctx.fillRect(d.cx - 1, d.cy - 1, 3, 3);
    ctx.fillStyle = stil.farbeNabe;
    ctx.fillRect(d.cx - 1, d.cy - 1, 2, 2);
  }

  // Gangzahl im Kästchen (klassisch wie bis 0.8f; M8g: Form und Farben je Stil), Schaltlicht und Lader
  function drehTeil(dt, gang, extra) {
    if (stil.id === 'klassisch') {
      ctx.fillStyle = stil.farbeKasten;
      ctx.fillRect(dreh.cx - 4, dreh.cy + 3, 9, 10);
      text(gang, dreh.cx - 2, dreh.cy + 5, 1, gang === 'R' ? 'rot' : 'gelb');
      return;
    }
    zeichneGang(gang);
    anzeige.uhr += dt;
    if (skala.schaltlicht && stil.schaltlicht) zeichneSchaltlicht(gang, extra);
    if (skala.lader && stil.ladeAnzeige) zeichneLader(dt, extra);
  }

  return {
    // M8f: Skala für dieses Fahrprofil (Id); jedes Bild aufrufbar, tut nur beim Wechsel etwas
    // M8g: dazu der Stil des Autos (oder klassisch, je nach Einstellung TACHO)
    setzeSkala(profilId) {
      if (profilId === profilVor && modus === modusVor) return;
      profilVor = profilId; modusVor = modus;
      tachoFuer(profilId, modus, neu);
      if (neu.stil === skala.stil && neu.drehzahlMax === skala.drehzahlMax && neu.drehzahlRotAb === skala.drehzahlRotAb &&
        neu.tempoMax === skala.tempoMax && neu.tempoMaxMph === skala.tempoMaxMph && neu.schaltlicht === skala.schaltlicht && neu.lader === skala.lader) return;
      Object.assign(skala, neu);
      stil = tachoStil(skala.stil);
      Object.assign(dreh, drehBlatt());
      Object.assign(tempo, tempoBlatt(einheit));
      ladeTafel = null; anzeige.lade = 0;
      skalaMax = einheit === 'mph' ? skala.tempoMaxMph : skala.tempoMax;
    },
    // M8g: Einstellung TACHO ('auto' oder 'klassisch'); wirkt beim nächsten setzeSkala (jedes Bild)
    setzeModus(m) { modus = m === 'klassisch' ? 'klassisch' : 'auto'; },
    get modus() { return modus; },
    skala: () => ({ ...skala }), // (für Tests: Skala, Stil und Anzahl gemalter Zifferblätter im Vorrat)
    vorrat: () => VORRAT.size,
    // M8g (Tests): gesetzte Skalenzahlen und weggelassene Zahlen beider Zifferblätter
    zahlen: () => ({ dreh: dreh.zahlen, tempo: tempo.zahlen, wegDreh: dreh.weggelassen, wegTempo: tempo.weggelassen, stil: stil.id }),
    blaetter: () => ({ dreh, tempo }), // (Tests: Zifferblätter mit Bild und Mitte)
    get anzeige() { return anzeige; }, // (Tests: Nadelstände, Ladedruck-Leiste)
    // Einheit des Tempo-Tachos: 'kmh' oder 'mph' (M5a)
    setzeEinheit(e) {
      if (e === einheit) return;
      einheit = e;
      Object.assign(tempo, tempoBlatt(e));
      faktor = e === 'mph' ? 1 / 1.609344 : 1;
      skalaMax = e === 'mph' ? skala.tempoMaxMph : skala.tempoMax;
      anzeige.kmh *= e === 'mph' ? faktor : 1.609344;
    },
    // dt: Sekunden seit dem letzten Bild, kmh, drehzahl (U/min), gang: 'R', 'N', '1'..'5'
    // extra (M8g, nur Auto-Stil): { ladedruck (0..1), gas (0..1), schaltet, lichtDrehzahl (Garage: Drehzahl fürs Schaltlicht,
    // dann gilt die Regel "aus in N" nicht) } – liest nur, ändert nichts
    zeichne(dt, kmh, drehzahl, gang, extra = null) {
      kmh *= faktor; // (bei mph: Meilen pro Stunde)
      // Nadeln gedämpft nachführen; im Stand ganz ruhig
      anzeige.kmh += (kmh - anzeige.kmh) * (1 - Math.exp(-t.tempoNadelFolgen * dt));
      if (kmh < 0.5 && anzeige.kmh < 0.5) anzeige.kmh = 0;
      anzeige.drehzahl += (drehzahl - anzeige.drehzahl) * (1 - Math.exp(-t.drehzahlNadelFolgen * dt));

      ctx.drawImage(tempo.bild, tempo.cx - tempo.m, tempo.cy - tempo.m);
      ctx.drawImage(dreh.bild, dreh.cx - dreh.m, dreh.cy - dreh.m);

      // digitales Tempo unten im Zifferblatt (feste Breite: 3 Stellen; M8g: Farbe und Fenster je Stil)
      const zahl = String(Math.min(999, Math.round(kmh)));
      if (stil.digitalFenster) { ctx.fillStyle = stil.digitalFenster; ctx.fillRect(tempo.cx - 10, tempo.cy + 9, 20, 9); }
      text(zahl, tempo.cx + 9 - zahl.length * 6, tempo.cy + 10, 1, stil.farbeDigital);
      drehTeil(dt, gang, extra);

      nadel(tempo, anzeige.kmh / skalaMax);
      nadel(dreh, anzeige.drehzahl / (skala.drehzahlMax * 1000));
    },
    // M8g: Garage-Vorschau: nur der Drehzahlmesser (mit Gang, Schaltlicht und Lader), Mitte bei setzeLage
    setzeLage(cx, cy) { dreh.cx = cx; dreh.cy = cy; },
    zeichneVorschau(dt, drehzahl, gang, extra = null) {
      anzeige.drehzahl += (drehzahl - anzeige.drehzahl) * (1 - Math.exp(-t.drehzahlNadelFolgen * dt));
      ctx.drawImage(dreh.bild, dreh.cx - dreh.m, dreh.cy - dreh.m);
      drehTeil(dt, gang, extra);
      nadel(dreh, anzeige.drehzahl / (skala.drehzahlMax * 1000));
    },
  };

}
