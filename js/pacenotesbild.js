// Pixel-Symbole der Pace-Notes, im Code gezeichnet (keine Bilder).
// Seit M4.1: kleine Kacheln nur mit Symbolen (kein Text ausser der Stufen-Zahl).
//
// Zeichen in den Bildern: '#' = Farbe des Symbols (Stufe), 'w' = weiss, 'g' = grau (gesperrter Ast),
// 'r' = rot (Absperrung), 'd' = dunkel, '.' = leer.
// Gezeichnet ist immer die Rechts-Variante; für Linkskurven wird gespiegelt.
// Grosse Symbole sind 11 Pixel breit und 13 hoch (ältere, abschaltbare 9x9), kleine Zeichen 5x5.

import { CONFIG } from './config.js';
import { miniText } from './tacho.js';

// Grosse Symbole
const GROSS = {
  // sanfte Kurve (Stufe 5-6): biegt nur leicht ab, Pfeil schräg nach rechts oben
  kurve56: [
    '......####.',
    '........##.',
    '.......#.#.',
    '......#..#.',
    '.....#.....',
    '....#......',
    '...#.......',
    '...#.......',
    '..#........',
    '..#........',
    '..#........',
    '..#........',
    '..#........',
  ],
  // rechtwinklige Kurve (Stufe 3-4)
  kurve34: [
    '...........',
    '........#..',
    '.........#.',
    '....#######',
    '...#.....#.',
    '..#.....#..',
    '..#........',
    '..#........',
    '..#........',
    '..#........',
    '..#........',
    '..#........',
    '..#........',
  ],
  // enge Kurve (Stufe 1-2): biegt über 90° hinaus, Pfeil schräg nach unten
  kurve12: [
    '...........',
    '..###......',
    '.#...#.....',
    '.#....#....',
    '.#.....#..#',
    '.#......#.#',
    '.#.......##',
    '.#.....####',
    '.#.........',
    '.#.........',
    '.#.........',
    '.#.........',
    '.#.........',
  ],
  // Kehre: ganz herum (schmales U), Pfeil gerade nach unten
  kehre: [
    '...........',
    '..#####....',
    '.#.....#...',
    '.#.....#...',
    '.#.....#...',
    '.#.....#...',
    '.#.....#...',
    '.#.....#...',
    '.#...#.#.#.',
    '.#....###..',
    '.#.....#...',
    '.#.........',
    '.#.........',
  ],
  // Schikane: kurzes S (erst rechts, dann wieder links), Pfeil gerade nach oben
  schikane: [
    '........#..',
    '.......###.',
    '......#.#.#',
    '........#..',
    '........#..',
    '.......#...',
    '...####....',
    '..#........',
    '..#........',
    '..#........',
    '..#........',
    '..#........',
    '..#........',
  ],
  // Kuppe (Blindkuppe): Strasse über einen Buckel
  kuppe: [
    '...........',
    '...........',
    '...........',
    '....###....',
    '..##...##..',
    '.#.......#.',
    '#.........#',
    '...........',
    '###########',
    '...........',
    '...........',
    '...........',
    '...........',
  ],
  // Abzweig rechts: die Etappe biegt ab (Pfeil in der Farbe der Stufe),
  // geradeaus geht die alte Strasse weiter, aber abgesperrt (grau mit rotem Balken)
  abzweig: [
    'rwrwr......',
    '..g........',
    '..g........',
    '..g.....#..',
    '..g......#.',
    '..g.#######',
    '..g#.....#.',
    '..#.....#..',
    '..#........',
    '..#........',
    '..#........',
    '..#........',
    '..#........',
  ],
  // Einmündung rechts: die Etappe kommt auf eine Querstrasse und biegt rechts ab,
  // links ist die Querstrasse abgesperrt
  einmuendung: [
    '...........',
    '........#..',
    'r........#.',
    'wggg#######',
    'r...#....#.',
    '....#...#..',
    '....#......',
    '....#......',
    '....#......',
    '....#......',
    '....#......',
    '....#......',
    '....#......',
  ],
  // Ziel: Zielflagge (Schachbrett)
  ziel: [
    '...........',
    'wwwddwwddww',
    'wwwddwwddww',
    'wddwwddwwdd',
    'wddwwddwwdd',
    'wwwddwwddww',
    'wwwddwwddww',
    'wddwwddwwdd',
    'wddwwddwwdd',
    'w..........',
    'w..........',
    'w..........',
    'w..........',
  ],
  // --- nur mit config.pacenotes.anzeigen wieder einschaltbar (Standard aus) ---
  gerade: ['....#....', '...###...', '..#.#.#..', '....#....', '....#....', '....#....', '....#....', '....#....', '....#....'],
  senke: ['.........', '#.......#', '.#.....#.', '..#...#..', '...###...', '.........', '.........', '#########', '.........'],
  // Felswand: Warndreieck mit Ausrufezeichen
  gefahr: ['....#....', '...#.#...', '...#.#...', '..#.#.#..', '..#.#.#..', '.#.....#.', '.#..#..#.', '#.......#', '#########'],
  belag: ['.........', '.#...#...', '...#...#.', '.#...#...', '...#...#.', '.#...#...', '...#...#.', '.........', '.........'],
};

// Kleine Zeichen (5x5)
const KLEIN = {
  // Schneiden lohnt sich: Pfeil quer durchs Kurveninnere (grün)
  schneiden: ['..###', '...##', '..#.#', '.#...', '#....'],
  // Nicht schneiden: rotes Kreuz (Sperren im Kurveninnern)
  nichtSchneiden: ['#...#', '.#.#.', '..#..', '.#.#.', '#...#'],
  // eng ("minus"): enger als die Stufe sonst
  eng: ['.....', '.....', '#####', '.....', '.....'],
  // weit ("plus"): weiter als die Stufe sonst
  weit: ['..#..', '..#..', '#####', '..#..', '..#..'],
  // lang: Mass-Strich |---|
  lang: ['.....', '#...#', '#####', '#...#', '.....'],
  // öffnet: wird weiter (<)
  oeffnet: ['...##', '.##..', '#....', '.##..', '...##'],
  // zieht zu: wird enger (>)
  ziehtZu: ['##...', '..##.', '....#', '..##.', '##...'],
  // Belag beim Abzweig: Schotter (Körner) und Wiesenweg (Grasbüschel)
  schotter: ['.#..#', '#..#.', '..#..', '.#..#', '#..#.'],
  wiesenweg: ['#.#.#', '#.#.#', '.###.', '..#..', '#####'],
};

export const SYMBOL_BREITE = 11;
export const SYMBOL_HOEHE = 13;
export const KLEIN_GROESSE = 5;
export const KACHEL_HOEHE = SYMBOL_HOEHE + 1;

function male(ctx, kunst, x, y, farben, spiegeln, schatten) {
  const b = Math.max(...kunst.map((z) => z.length));
  for (let yy = 0; yy < kunst.length; yy++) {
    for (let xx = 0; xx < kunst[yy].length; xx++) {
      const c = kunst[yy][xx];
      if (c === '.') continue;
      if (schatten) { if (c === 'd') continue; ctx.fillStyle = schatten; } else ctx.fillStyle = farben[c] || farben['#'];
      ctx.fillRect(x + (spiegeln ? b - 1 - xx : xx), y + yy, 1, 1);
    }
  }
}

// Bild mit dunklem Schatten (1 Pixel nach rechts unten) zeichnen
function mitSchatten(ctx, kunst, x, y, farben, spiegeln) {
  male(ctx, kunst, x + 1, y + 1, farben, spiegeln, farben.d);
  male(ctx, kunst, x, y, farben, spiegeln, null);
}

// Ziffer 5x7 aus der HUD-Schrift (nur 1-6 nötig)
const ZIFFERN = {
  1: ['..#..', '.##..', '..#..', '..#..', '..#..', '..#..', '.###.'],
  2: ['.###.', '#...#', '....#', '...#.', '..#..', '.#...', '#####'],
  3: ['#####', '...#.', '..#..', '...#.', '....#', '#...#', '.###.'],
  4: ['...#.', '..##.', '.#.#.', '#..#.', '#####', '...#.', '...#.'],
  5: ['#####', '#....', '####.', '....#', '....#', '#...#', '.###.'],
  6: ['..##.', '.#...', '#....', '####.', '#...#', '#...#', '.###.'],
};

// Eine Kachel zeichnen (x, y = links oben). k = Kachel aus pacenotes.js:
// { symbol, richtung, farbe, stufe, form, schneiden, belag, kehrenNr, kehrenAnzahl }
export function zeichneKachel(ctx, k, x, y) {
  const P = CONFIG.pacenotes;
  const F = P.farben;
  const schatten = P.farbeSchatten;
  const farbe = F[k.farbe] || F.weiss;
  const farben = { '#': farbe, w: F.weiss, g: P.farbeGesperrt, r: F.rot, d: schatten };
  const sym = GROSS[k.symbol];
  const links = k.richtung < 0;
  if (sym) {
    const h = sym.length, b = Math.max(...sym.map((z) => z.length));
    // kleinere (alte) Symbole senkrecht mittig
    const ox = x + Math.floor((SYMBOL_BREITE - b) / 2), oy = y + Math.floor((SYMBOL_HOEHE - h) / 2);
    mitSchatten(ctx, sym, ox, oy, farben, links);
  }
  // Spalte rechts: oben die Stufen-Zahl, darunter ein Zusatz-Zeichen
  const sx = x + SYMBOL_BREITE + 1;
  if (k.stufe) mitSchatten(ctx, ZIFFERN[k.stufe], sx, y, { '#': farbe, d: schatten }, false);
  const unten = k.belag || k.form;
  if (unten && KLEIN[unten]) {
    const f = unten === 'schotter' ? P.farbeSchotter : unten === 'wiesenweg' ? P.farbeWiese : P.farbeZeichen;
    mitSchatten(ctx, KLEIN[unten], sx, y + 8, { '#': f, d: schatten }, false);
  }
  // Kehren-Nummer als kleiner Bruch (z. B. 1 über 4)
  if (k.kehrenNr && k.kehrenAnzahl > 1) {
    miniText(ctx, String(k.kehrenNr), sx + 1, y, P.farbeZeichen, schatten);
    ctx.fillStyle = schatten; ctx.fillRect(sx + 1, y + 7, 4, 1);
    ctx.fillStyle = P.farbeZeichen; ctx.fillRect(sx, y + 6, 4, 1);
    miniText(ctx, String(k.kehrenAnzahl), sx + 1, y + 8, P.farbeZeichen, schatten);
  }
  // Schneiden (grüner Pfeil quer durchs Kurveninnere) / nicht schneiden (rotes Kreuz): eigene Spalte
  if (k.schneiden) {
    const f = k.schneiden === 'schneiden' ? F.gruen : F.rot;
    mitSchatten(ctx, KLEIN[k.schneiden], sx + KLEIN_GROESSE + 1, y + 4, { '#': f, d: schatten }, links);
  }
}

// Breite einer Kachel (Pixel, mit Schatten): Symbol, Spalte für Zahl/Zeichen, Spalte fürs Schneiden
export function kachelBreite(k) {
  let b = SYMBOL_BREITE;
  if (k.stufe || k.form || k.belag || k.kehrenNr) b += 1 + KLEIN_GROESSE;
  if (k.schneiden) b = SYMBOL_BREITE + 2 * (1 + KLEIN_GROESSE);
  return b + 1;
}

// Kleines Reset-Zeichen für den R-Countdown (Kreispfeil, 7x7)
const RESET = ['..##.#.', '.#..##.', '#..###.', '#......', '#.....#', '.#...#.', '..###..'];
export function zeichneReset(ctx, x, y, farbe, schatten) {
  mitSchatten(ctx, RESET, x, y, { '#': farbe, d: schatten }, false);
  return RESET[0].length;
}
