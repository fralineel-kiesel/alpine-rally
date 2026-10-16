// Rennablauf (seit M5b): Anzeige des Countdowns 3 - 2 - 1 - GO! in der Bildmitte.
// Jede Zahl wird nur einmal (beim ersten Zeigen) mit der Pixelschrift auf ein eigenes kleines Bild gemalt,
// danach pro Bild nur noch kopiert (keine neuen Objekte pro Bild).
// Die Logik (Auto gesperrt, Zeit startet bei GO, Zielbildschirm) steht in main.js.

import { CONFIG } from './config.js';
import { pixelText, textBreite } from './pixel.js';

const B = 320;
const TEXTE = ['GO!', '1', '2', '3']; // Nummer 0 = GO!, sonst die Zahl selbst
const bilder = [];                     // fertig gemalte Zahlen: [Nummer * 2 + (Pop ? 1 : 0)] -> Leinwand

function bildVon(nr, pop) {
  let c = bilder[nr * 2 + (pop ? 1 : 0)];
  if (!c) {
    const text = TEXTE[nr], groesse = CONFIG.rennablauf.groesse + (pop ? 1 : 0);
    const farbe = nr === 0 ? CONFIG.rennablauf.farbeGo : CONFIG.rennablauf.farbeZahl;
    const R = CONFIG.rennablauf;
    const schatten = Math.max(1, Math.floor(groesse / 2));
    c = document.createElement('canvas');
    c.width = textBreite(text, groesse) + schatten;
    c.height = 7 * groesse + schatten;
    const x = c.getContext('2d');
    x.imageSmoothingEnabled = false;
    pixelText(x, text, 0, 0, groesse, farbe, 'links', R.farbeSchatten);
    bilder[nr * 2 + (pop ? 1 : 0)] = c;
  }
  return c;
}

// Was zeigt der Countdown gerade? zeit = Sekunden seit dem Beginn des Countdowns,
// go = Rest der GO-Anzeige (Sekunden, > 0 nach dem Start). Ergebnis: 3, 2, 1, 0 (= GO!) oder -1 (nichts)
export function countdownNummer(zeit, go) {
  if (go > 0) return 0;
  const n = 3 - Math.floor(zeit / CONFIG.rennablauf.zahlDauer);
  return n >= 1 && n <= 3 ? n : -1;
}
export const countdownText = (zeit, go) => TEXTE[countdownNummer(zeit, go)] ?? null; // für Tests

// Zahl bzw. GO! zeichnen. zeit/go wie oben
export function zeichneCountdown(ctx, zeit, go) {
  const R = CONFIG.rennablauf;
  const nr = countdownNummer(zeit, go);
  if (nr < 0) return;
  // seit wann steht dieser Text, wie lange bleibt er noch?
  const seit = go > 0 ? R.goDauer - go : zeit % R.zahlDauer;
  const rest = go > 0 ? go : R.zahlDauer - seit;
  const pop = seit < R.popDauer; // kurzer Pop: eine Stufe grösser
  const groesse = R.groesse + (pop ? 1 : 0);
  const alpha = Math.max(0, Math.min(1, rest / R.ausblenden));
  if (alpha <= 0) return;
  const bild = bildVon(nr, pop);
  // Mitte bleibt am selben Platz (auch beim Pop)
  const x = Math.round(B / 2 - (bild.width - 1) / 2), y = Math.round(R.hoehe + (7 * R.groesse) / 2 - (7 * groesse) / 2);
  ctx.globalAlpha = alpha;
  ctx.drawImage(bild, x, y);
  ctx.globalAlpha = 1;
}
