// Pixel-Symbole der Pace-Notes (Meilenstein 4), im Code gezeichnet (keine Bilder).
// '#' = Pixel in der Farbe des Symbols, 'd' = dunkles Pixel (Kontur/Innenfarbe), '.' = leer.
// Gezeichnet ist immer die Rechts-Variante; für Linkskurven wird gespiegelt.
// Grosse Symbole (vorne in der Zeile) sind 9 Pixel hoch, Zusatz-Zeichen (rechts) 7x7.

const GROSS = {
  // sanfte Kurve (Stufe 5-6): Pfeil schräg nach rechts oben
  kurve56: [
    '.....###.',
    '......##.',
    '.....#.#.',
    '....#....',
    '...#.....',
    '..#......',
    '..#......',
    '..#......',
    '..#......',
  ],
  // rechtwinklige Kurve (Stufe 3-4)
  kurve34: [
    '.......#..',
    '........#.',
    '.#########',
    '.#......#.',
    '.#.....#..',
    '.#........',
    '.#........',
    '.#........',
    '.#........',
  ],
  // enge Kurve (Stufe 1-2): biegt über 90° hinaus, Pfeil nach unten
  kurve12: [
    '..######..',
    '.#......#.',
    '.#......#.',
    '.#....#.#.#',
    '.#.....###.',
    '.#......#..',
    '.#.........',
    '.#.........',
    '.#.........',
  ],
  // Kehre: ganz herum (schmales U), Pfeil ganz nach unten
  kehre: [
    '..####...',
    '.#....#..',
    '.#....#..',
    '.#....#..',
    '.#....#..',
    '.#..#.#.#',
    '.#...###.',
    '.#....#..',
    '.#.......',
  ],
  // Schikane: kurzer Versatz rechts, dann links
  schikane: [
    '......#..',
    '.....###.',
    '....#.#.#',
    '......#..',
    '..#####..',
    '..#......',
    '..#......',
    '..#......',
    '..#......',
  ],
  // Gerade: Pfeil nach oben
  gerade: [
    '....#....',
    '...###...',
    '..#.#.#..',
    '....#....',
    '....#....',
    '....#....',
    '....#....',
    '....#....',
    '....#....',
  ],
  // Kuppe: Strasse über einen Buckel
  kuppe: [
    '.........',
    '.........',
    '...###...',
    '..#...#..',
    '.#.....#.',
    '#.......#',
    '.........',
    '#########',
    '.........',
  ],
  // Senke: Mulde
  senke: [
    '.........',
    '#.......#',
    '.#.....#.',
    '..#...#..',
    '...###...',
    '.........',
    '.........',
    '#########',
    '.........',
  ],
  // Gefahr (Felswand): Warndreieck mit Ausrufezeichen
  gefahr: [
    '....#....',
    '...#.#...',
    '...#.#...',
    '..#.#.#..',
    '..#.#.#..',
    '.#.....#.',
    '.#..#..#.',
    '#.......#',
    '#########',
  ],
  // Ziel: Zielflagge (Schachbrett)
  ziel: [
    '#........',
    '#dd##dd##',
    '#dd##dd##',
    '###dd##dd',
    '###dd##dd',
    '#dd##dd##',
    '#........',
    '#........',
    '#........',
  ],
  // Belag (eigene Ansage): Schotter-Körner
  belag: [
    '.........',
    '.#...#...',
    '...#...#.',
    '.#...#...',
    '...#...#.',
    '.#...#...',
    '...#...#.',
    '.........',
    '.........',
  ],
};

const KLEIN = {
  // Schneiden erlaubt: Pfeil quer durch die Kurven-Innenseite (grün)
  schneiden: [
    '....###',
    '.....##',
    '....#.#',
    '...#...',
    '..#....',
    '.#.....',
    '#......',
  ],
  // Nicht schneiden: Verbotskreis mit Balken (rot)
  nichtSchneiden: [
    '..###..',
    '.#...#.',
    '#...#.#',
    '#..#..#',
    '#.#...#',
    '.#...#.',
    '..###..',
  ],
  // Belagwechsel: Körner
  belag: [
    '.#...#.',
    '...#...',
    '#...#..',
    '..#...#',
    '.#..#..',
    '...#..#',
    '#.#....',
  ],
};

export const SYMBOL_HOEHE = 9;
export const ZUSATZ_GROESSE = 7;

// Breite eines grossen Symbols (Pixel)
export function symbolBreite(name) {
  const a = GROSS[name];
  return a ? Math.max(...a.map((z) => z.length)) : 0;
}

function male(ctx, kunst, x, y, farbe, dunkel, spiegeln) {
  const b = Math.max(...kunst.map((z) => z.length));
  for (let yy = 0; yy < kunst.length; yy++) {
    for (let xx = 0; xx < kunst[yy].length; xx++) {
      const c = kunst[yy][xx];
      if (c === '.') continue;
      ctx.fillStyle = c === '#' ? farbe : dunkel;
      ctx.fillRect(x + (spiegeln ? b - 1 - xx : xx), y + yy, 1, 1);
    }
  }
}

// Grosses Symbol zeichnen (x, y = links oben). richtung -1 = Links-Variante (gespiegelt).
export function zeichneSymbol(ctx, name, x, y, farbe, richtung = 1, schatten = '#101418') {
  const kunst = GROSS[name];
  if (!kunst) return 0;
  const b = symbolBreite(name);
  const spiegeln = richtung < 0;
  male(ctx, kunst.map((z) => z.replace(/d/g, '.')), x + 1, y + 1, schatten, schatten, spiegeln); // Schatten
  male(ctx, kunst, x, y, farbe, schatten, spiegeln);
  return b;
}

// Kleines Zusatz-Zeichen (7x7)
export function zeichneZusatz(ctx, name, x, y, farbe, schatten = '#101418') {
  const kunst = KLEIN[name];
  if (!kunst) return 0;
  male(ctx, kunst, x + 1, y + 1, schatten, schatten, false);
  male(ctx, kunst, x, y, farbe, schatten, false);
  return ZUSATZ_GROESSE;
}
