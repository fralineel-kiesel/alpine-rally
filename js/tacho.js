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
import { t as tx } from './texte.js';

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
  return ziel;
}

// Ein Zifferblatt vorab malen. Ergebnis: Canvas, Mitte liegt bei (r + 2, r + 2)
// M8g: t = Stil (tachoStil), klassisch = hud.tacho wie bis 0.8f
function maleBlatt(r, skala, t = tachoStil('klassisch')) {
  const groesse = 2 * r + 5, m = r + 2;
  const c = document.createElement('canvas');
  c.width = groesse; c.height = groesse;
  const ctx = c.getContext('2d');
  // Scheibe, Rand und dunkler Ring aussen, Pixel für Pixel
  for (let y = 0; y < groesse; y++) {
    for (let x = 0; x < groesse; x++) {
      const dx = x - m, dy = y - m, d = Math.hypot(dx, dy);
      let farbe = null;
      if (d <= r - 0.5) farbe = t.farbeBlatt;
      else if (d <= r + 0.5) farbe = t.farbeRand;
      else if (d <= r + 1.5) farbe = t.farbeRandAussen;
      // roter Bereich (nur Drehzahl): schmales Band innen am Rand
      if (skala.rotAb != null && d > r - 3.5 && d <= r - 1.5) {
        let w = Math.atan2(-dy, dx) / GRAD;
        if (w <= 90 - t.bogen / 2 - 0.01) w += 360;
        const f = (90 + t.bogen / 2 - w) / t.bogen;
        if (f >= skala.rotAb / skala.max && f <= 1) farbe = t.farbeRot;
      }
      if (farbe) { ctx.fillStyle = farbe; ctx.fillRect(x, y, 1, 1); }
    }
  }
  // Skalenstriche
  ctx.fillStyle = t.farbeStriche;
  for (let v = 0; v <= skala.max + 1e-9; v += skala.kurz) {
    const lang = Math.abs(v / skala.lang - Math.round(v / skala.lang)) < 1e-6;
    const w = winkel(v / skala.max);
    const [x0, y0] = punkt(m, m, w, r - 1.5);
    const [x1, y1] = punkt(m, m, w, r - (lang ? 5 : 3));
    linie(ctx, x0, y0, x1, y1);
  }
  // Skalenzahlen (Mini-Schrift, gelb mit Schatten)
  for (let v = 0; v <= skala.max + 1e-9; v += skala.zahlen) {
    const text = String(Math.round(v / skala.teiler));
    const [x, y] = punkt(m, m, winkel(v / skala.max), r - skala.zahlAbstand);
    miniText(ctx, text, Math.round(x - miniBreite(text) / 2), Math.round(y - 2.5), t.farbeZahlen, t.farbeSchatten);
  }
  // feste Beschriftung
  if (skala.beschriftung) {
    const [text, dy] = skala.beschriftung;
    miniText(ctx, text, Math.round(m - miniBreite(text) / 2), m + dy, t.farbeStriche, t.farbeSchatten);
  }
  return { bild: c, m };
}

// M8g: Vorrat der gemalten Zifferblätter für alle Tachos (HUD und Garage), Schlüssel: Art, Stil, Skala, Einheit.
// Höchstens ein Blatt je Stil und Skala, also nie mehr als die Stil-Tabelle mal drei (Drehzahl, km/h, mph).
const VORRAT = new Map();
function ausVorrat(schluessel, male) {
  let b = VORRAT.get(schluessel);
  if (!b) { b = male(); VORRAT.set(schluessel, b); }
  return b;
}

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
    ? ausVorrat(`tempo|${stil.id}|mph|${skala.tempoMaxMph}`, () => maleBlatt(rT, { max: skala.tempoMaxMph, lang: t.tempoStrichLangMph, kurz: t.tempoStrichKurzMph, zahlen: t.tempoZahlenMph, teiler: 1, zahlAbstand: 11, beschriftung: [tx('einheit.mph'), 18] }, stil))
    : ausVorrat(`tempo|${stil.id}|kmh|${skala.tempoMax}`, () => maleBlatt(rT, { max: skala.tempoMax, lang: t.tempoStrichLang, kurz: t.tempoStrichKurz, zahlen: t.tempoZahlen, teiler: 1, zahlAbstand: 11, beschriftung: [tx('einheit.kmh'), 18] }, stil)));
  const drehBlatt = () => ausVorrat(`dreh|${stil.id}|${skala.drehzahlMax}|${skala.drehzahlRotAb}`,
    () => maleBlatt(rD, { max: skala.drehzahlMax * 1000, lang: 1000, kurz: 500, zahlen: 1000, teiler: 1000, zahlAbstand: 9, rotAb: skala.drehzahlRotAb * 1000, beschriftung: [tx('tacho.drehzahl'), 14] }, stil));
  const tempo = { cx: B - t.randRechts - rT - 2, cy: H - t.randUnten - rT - 2, r: rT, ...tempoBlatt('kmh') };
  let einheit = 'kmh', faktor = 1, skalaMax = skala.tempoMax, profilVor = null, modus = 'auto', modusVor = null;
  const dreh = { cx: B - t.randRechts - 2 * rT - 5 - t.abstand - rD - 2, cy: H - t.randUnten - rD - 2, r: rD, ...drehBlatt() };
  const anzeige = { kmh: 0, drehzahl: 0 };

  function nadel(d, f) {
    const w = winkel(Math.max(0, Math.min(1.02, f)));
    const [x1, y1] = punkt(d.cx, d.cy, w, d.r - 4);
    ctx.fillStyle = stil.farbeSchatten;
    linie(ctx, d.cx + 1, d.cy + 1, x1 + 1, y1 + 1, stil.nadelBreite);
    ctx.fillStyle = stil.farbeNadel;
    linie(ctx, d.cx, d.cy, x1, y1, stil.nadelBreite);
    // Nabe
    ctx.fillStyle = stil.farbeSchatten;
    ctx.fillRect(d.cx - 1, d.cy - 1, 3, 3);
    ctx.fillStyle = stil.farbeNabe;
    ctx.fillRect(d.cx - 1, d.cy - 1, 2, 2);
  }

  return {
    // M8f: Skala für dieses Fahrprofil (Id); jedes Bild aufrufbar, tut nur beim Wechsel etwas
    // M8g: dazu der Stil des Autos (oder klassisch, je nach Einstellung TACHO)
    setzeSkala(profilId) {
      if (profilId === profilVor && modus === modusVor) return;
      profilVor = profilId; modusVor = modus;
      tachoFuer(profilId, modus, neu);
      if (neu.stil === skala.stil && neu.drehzahlMax === skala.drehzahlMax && neu.drehzahlRotAb === skala.drehzahlRotAb &&
        neu.tempoMax === skala.tempoMax && neu.tempoMaxMph === skala.tempoMaxMph) return;
      Object.assign(skala, neu);
      stil = tachoStil(skala.stil);
      Object.assign(dreh, drehBlatt());
      Object.assign(tempo, tempoBlatt(einheit));
      skalaMax = einheit === 'mph' ? skala.tempoMaxMph : skala.tempoMax;
    },
    // M8g: Einstellung TACHO ('auto' oder 'klassisch'); wirkt beim nächsten setzeSkala (jedes Bild)
    setzeModus(m) { modus = m === 'klassisch' ? 'klassisch' : 'auto'; },
    get modus() { return modus; },
    skala: () => ({ ...skala }), // (für Tests: Skala, Stil und Anzahl gemalter Zifferblätter im Vorrat)
    vorrat: () => VORRAT.size,
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
    zeichne(dt, kmh, drehzahl, gang) {
      kmh *= faktor; // (bei mph: Meilen pro Stunde)
      // Nadeln gedämpft nachführen; im Stand ganz ruhig
      anzeige.kmh += (kmh - anzeige.kmh) * (1 - Math.exp(-t.tempoNadelFolgen * dt));
      if (kmh < 0.5 && anzeige.kmh < 0.5) anzeige.kmh = 0;
      anzeige.drehzahl += (drehzahl - anzeige.drehzahl) * (1 - Math.exp(-t.drehzahlNadelFolgen * dt));

      ctx.drawImage(tempo.bild, tempo.cx - tempo.m, tempo.cy - tempo.m);
      ctx.drawImage(dreh.bild, dreh.cx - dreh.m, dreh.cy - dreh.m);

      // digitales Tempo unten im Zifferblatt (feste Breite: 3 Stellen)
      const zahl = String(Math.min(999, Math.round(kmh)));
      text(zahl, tempo.cx + 9 - zahl.length * 6, tempo.cy + 10, 1, 'gelb');
      // Gangzahl im Kästchen
      ctx.fillStyle = stil.farbeKasten;
      ctx.fillRect(dreh.cx - 4, dreh.cy + 3, 9, 10);
      text(gang, dreh.cx - 2, dreh.cy + 5, 1, gang === 'R' ? 'rot' : 'gelb');

      nadel(tempo, anzeige.kmh / skalaMax);
      nadel(dreh, anzeige.drehzahl / (skala.drehzahlMax * 1000));
    },
  };
}
