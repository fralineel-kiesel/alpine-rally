// Aussehen der Touch-Knöpfe (Meilenstein 9a) im Pixel-Look des Spiels: kleine Leinwände, Pixel für Pixel gemalt,
// per CSS vergrössert (image-rendering: pixelated). Jeder Zustand (normal, gedrückt, beim D-Pad jede Richtung) wird
// einmal beim Aufbau gemalt; beim Drücken wird nur das fertige Bild kopiert (kein Neuzeichnen im Bildtakt).
// Farben: CONFIG.touch (dunkelblau halbtransparent, heller Rand, orange wenn gedrückt).

import { CONFIG } from './config.js';
import { pixelText, textBreite } from './pixel.js';
import { miniText, miniBreite } from './tacho.js'; // M9a.1: Mini-Schrift für "AUTO" im Knopf A

// Grösse der kleinen Leinwände (Pixel); die CSS-Grösse kommt aus js/touchlayout.js
// (schulterR: R ist seit M9a.1 etwas höher als L; klein: START/SELECT/NOTES als flache Pille, Breite nach der Beschriftung)
export const PIXEL = { dpad: 48, ab: 24, schulter: [26, 13], schulterR: [26, 14], klein: 13 };
const PILLE_INNEN = 5; // Abstand der Beschriftung zum Rand der Pille (Pixel)
export const pilleBreite = (text) => textBreite(text) + 2 * PILLE_INNEN;

function neueLeinwand(b, h) {
  const c = document.createElement('canvas');
  c.width = b; c.height = h;
  const x = c.getContext('2d');
  x.imageSmoothingEnabled = false;
  return { c, x };
}
const punkt = (x, px, py, farbe) => { x.fillStyle = farbe; x.fillRect(px, py, 1, 1); };

// Runder Knopf (n x n Pixel): Füllung und 1 Pixel Rand, jedes Pixel nur einmal (die Farben sind halbtransparent)
function kreis(x, n, fuellung, rand) {
  const m = (n - 1) / 2, r = n / 2 - 0.25;
  for (let py = 0; py < n; py++) for (let px = 0; px < n; px++) {
    const d = Math.hypot(px - m, py - m);
    if (d > r) continue;
    punkt(x, px, py, d > r - 1.1 ? rand : fuellung);
  }
}
// Dreieck im Arm des D-Pads (Spitze nach aussen): 4 Zeilen, 2 bis 8 Pixel breit; arm 0 = hoch, 1 = rechts, 2 = runter, 3 = links
function dreieck(x, n, arm, farbe) {
  const m = n / 2, oben = 5;
  for (let i = 0; i < 4; i++) for (let j = -i - 1; j <= i; j++) {
    const [px, py] = [[m + j, oben + i], [n - 1 - oben - i, m + j], [m + j, n - 1 - oben - i], [oben + i, m + j]][arm];
    punkt(x, px, py, farbe);
  }
}

// D-Pad: Kreuz mit vier Dreiecken; richtung 0 = nichts, 1 = hoch, 2 = hoch-rechts, 3 = rechts ... 8 = hoch-links
export const armeVon = (r) => [r === 1 || r === 2 || r === 8, r >= 2 && r <= 4, r >= 4 && r <= 6, r >= 6 && r <= 8];
function malDpad(richtung) {
  const T = CONFIG.touch, n = PIXEL.dpad;
  const { c, x } = neueLeinwand(n, n);
  const arme = armeVon(richtung);
  const b = 16, l0 = (n - b) / 2, l1 = l0 + b; // Arm 16 Pixel breit, Kreuz von 1 bis n-2
  const imKreuz = (px, py) => (px >= l0 && px < l1 && py >= 1 && py < n - 1) || (py >= l0 && py < l1 && px >= 1 && px < n - 1);
  const armVon = (px, py) => {
    if (py < l0) return 0; if (px >= l1) return 1; if (py >= l1) return 2; if (px < l0) return 3;
    return -1; // Mitte
  };
  for (let py = 0; py < n; py++) for (let px = 0; px < n; px++) {
    if (!imKreuz(px, py)) continue;
    const rand = !imKreuz(px - 1, py) || !imKreuz(px + 1, py) || !imKreuz(px, py - 1) || !imKreuz(px, py + 1);
    const a = armVon(px, py);
    const an = a >= 0 && arme[a];
    punkt(x, px, py, rand ? T.farbeRand : an ? T.farbeGedrueckt : T.farbeGrund);
  }
  // Dreiecke in den Armen, Mulde in der Mitte
  const m = n / 2;
  for (let i = 0; i < 4; i++) dreieck(x, n, i, arme[i] ? T.farbeZeichenGedrueckt : T.farbeZeichen);
  for (const [px, py] of [[m - 2, m - 1], [m + 1, m - 1], [m - 2, m], [m + 1, m], [m - 1, m - 2], [m, m - 2], [m - 1, m + 1], [m, m + 1]]) punkt(x, px, py, T.farbeRand);
  return c;
}

// A / B: rund mit Buchstaben (Pixelschrift doppelt gross); hinweis (M9a.1, AUTO-GAS): Buchstabe klein, darunter "AUTO"
function malRund(buchstabe, gedrueckt, hinweis = '') {
  const T = CONFIG.touch, n = PIXEL.ab;
  const { c, x } = neueLeinwand(n, n);
  kreis(x, n, gedrueckt ? T.farbeGedrueckt : T.farbeGrund, T.farbeRand);
  const farbe = gedrueckt ? T.farbeZeichenGedrueckt : T.farbeZeichen;
  if (!hinweis) { pixelText(x, buchstabe, n / 2, (n - 14) / 2, 2, farbe, 'mitte', null); return c; }
  pixelText(x, buchstabe, n / 2, 4, 1, farbe, 'mitte', null);
  miniText(x, hinweis, Math.floor((n - miniBreite(hinweis)) / 2), 13, gedrueckt ? farbe : T.farbeAutoGas, null);
  return c;
}
// L / R: Schulterknopf (Tafel mit abgeschrägten Ecken)
function malSchulter(buchstabe, gedrueckt, [b, h]) {
  const T = CONFIG.touch;
  const { c, x } = neueLeinwand(b, h);
  // wie zeichneTafel, aber jedes Pixel nur einmal (halbtransparente Farben)
  const e = 3;
  for (let py = 0; py < h; py++) {
    const ein = Math.max(0, e - py, e - (h - 1 - py));
    for (let px = ein; px < b - ein; px++) {
      const einO = Math.max(0, e - (py - 1), e - (h - py)), einU = Math.max(0, e - (py + 1), e - (h - 2 - py));
      const rand = py === 0 || py === h - 1 || px === ein || px === b - 1 - ein || px < einO || px >= b - einO || px < einU || px >= b - einU;
      punkt(x, px, py, rand ? T.farbeRand : gedrueckt ? T.farbeGedrueckt : T.farbeGrund);
    }
  }
  pixelText(x, buchstabe, b / 2, Math.round((h - 7) / 2), 1, gedrueckt ? T.farbeZeichenGedrueckt : T.farbeZeichen, 'mitte', null);
  return c;
}
// START / SELECT / NOTES (M9a.1): flache Pille mit der Beschriftung innen (runde Enden, jedes Pixel nur einmal)
function malPille(text, gedrueckt) {
  const T = CONFIG.touch, h = PIXEL.klein, b = pilleBreite(text);
  const { c, x } = neueLeinwand(b, h);
  const m = (h - 1) / 2, r = h / 2 - 0.25;
  for (let py = 0; py < h; py++) for (let px = 0; px < b; px++) {
    const d = Math.hypot(px - Math.max(m, Math.min(b - 1 - m, px)), py - m); // Abstand zur Mittellinie
    if (d > r) continue;
    punkt(x, px, py, d > r - 1.1 ? T.farbeRand : gedrueckt ? T.farbeGedrueckt : T.farbeGrund);
  }
  pixelText(x, text, b / 2, Math.round((h - 7) / 2), 1, gedrueckt ? T.farbeZeichenGedrueckt : T.farbeSchrift, 'mitte', null);
  return c;
}
// Bilder eines kleinen Knopfs mit dieser Beschriftung: [normal, gedrückt] (neu bei Sprachwechsel)
export const malKlein = (text) => [malPille(text, false), malPille(text, true)];

// Alle Bilder einmal malen: { name: [Bild je Zustand] } (D-Pad: 9 Richtungen, sonst [normal, gedrückt]);
// beschriftung(n) = Text der kleinen Knöpfe; A hat dazu [2] und [3] = normal und gedrückt mit AUTO-GAS (beschriftung('auto'))
export function malAlle(beschriftung) {
  return {
    dpad: Array.from({ length: 9 }, (_, r) => malDpad(r)),
    a: [malRund('A', false), malRund('A', true), malRund('A', false, beschriftung('auto')), malRund('A', true, beschriftung('auto'))],
    b: [malRund('B', false), malRund('B', true)],
    l: [malSchulter('L', false, PIXEL.schulter), malSchulter('L', true, PIXEL.schulter)],
    r: [malSchulter('R', false, PIXEL.schulterR), malSchulter('R', true, PIXEL.schulterR)],
    select: malKlein(beschriftung('select')),
    start: malKlein(beschriftung('start')),
    notes: malKlein(beschriftung('notes')),
  };
}
