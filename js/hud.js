// HUD: Tachos, Zeit, Zielanzeige und Debug-Panel.
// Gezeichnet mit einer eigenen 5x7-Pixelschrift (keine externen Fonts).

import { CONFIG } from './config.js';
import { baueTachos } from './tacho.js';

// Pixelschrift: jedes Zeichen 5 Pixel breit, 7 hoch ('#' = Pixel an)
const SCHRIFT = {
  '0': ['.###.', '#...#', '#..##', '#.#.#', '##..#', '#...#', '.###.'],
  '1': ['..#..', '.##..', '..#..', '..#..', '..#..', '..#..', '.###.'],
  '2': ['.###.', '#...#', '....#', '...#.', '..#..', '.#...', '#####'],
  '3': ['#####', '...#.', '..#..', '...#.', '....#', '#...#', '.###.'],
  '4': ['...#.', '..##.', '.#.#.', '#..#.', '#####', '...#.', '...#.'],
  '5': ['#####', '#....', '####.', '....#', '....#', '#...#', '.###.'],
  '6': ['..##.', '.#...', '#....', '####.', '#...#', '#...#', '.###.'],
  '7': ['#####', '....#', '...#.', '..#..', '.#...', '.#...', '.#...'],
  '8': ['.###.', '#...#', '#...#', '.###.', '#...#', '#...#', '.###.'],
  '9': ['.###.', '#...#', '#...#', '.####', '....#', '...#.', '.##..'],
  'A': ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  'B': ['####.', '#...#', '#...#', '####.', '#...#', '#...#', '####.'],
  'C': ['.###.', '#...#', '#....', '#....', '#....', '#...#', '.###.'],
  'D': ['###..', '#..#.', '#...#', '#...#', '#...#', '#..#.', '###..'],
  'E': ['#####', '#....', '#....', '####.', '#....', '#....', '#####'],
  'F': ['#####', '#....', '#....', '####.', '#....', '#....', '#....'],
  'G': ['.###.', '#...#', '#....', '#.###', '#...#', '#...#', '.####'],
  'H': ['#...#', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  'I': ['.###.', '..#..', '..#..', '..#..', '..#..', '..#..', '.###.'],
  'J': ['..###', '...#.', '...#.', '...#.', '...#.', '#..#.', '.##..'],
  'K': ['#...#', '#..#.', '#.#..', '##...', '#.#..', '#..#.', '#...#'],
  'L': ['#....', '#....', '#....', '#....', '#....', '#....', '#####'],
  'M': ['#...#', '##.##', '#.#.#', '#.#.#', '#...#', '#...#', '#...#'],
  'N': ['#...#', '#...#', '##..#', '#.#.#', '#..##', '#...#', '#...#'],
  'O': ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  'P': ['####.', '#...#', '#...#', '####.', '#....', '#....', '#....'],
  'Q': ['.###.', '#...#', '#...#', '#...#', '#.#.#', '#..#.', '.##.#'],
  'R': ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'],
  'S': ['.####', '#....', '#....', '.###.', '....#', '....#', '####.'],
  'T': ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
  'U': ['#...#', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  'V': ['#...#', '#...#', '#...#', '#...#', '#...#', '.#.#.', '..#..'],
  'W': ['#...#', '#...#', '#...#', '#.#.#', '#.#.#', '#.#.#', '.#.#.'],
  'X': ['#...#', '#...#', '.#.#.', '..#..', '.#.#.', '#...#', '#...#'],
  'Y': ['#...#', '#...#', '.#.#.', '..#..', '..#..', '..#..', '..#..'],
  'Z': ['#####', '....#', '...#.', '..#..', '.#...', '#....', '#####'],
  ':': ['.....', '.##..', '.##..', '.....', '.##..', '.##..', '.....'],
  '.': ['.....', '.....', '.....', '.....', '.....', '.##..', '.##..'],
  '/': ['....#', '....#', '...#.', '..#..', '.#...', '#....', '#....'],
  '-': ['.....', '.....', '.....', '.###.', '.....', '.....', '.....'],
  '>': ['.#...', '..#..', '...#.', '....#', '...#.', '..#..', '.#...'],
  '=': ['.....', '.....', '#####', '.....', '#####', '.....', '.....'],
  '°': ['.##..', '#..#.', '#..#.', '.##..', '.....', '.....', '.....'],
  '+': ['.....', '..#..', '..#..', '#####', '..#..', '..#..', '.....'],
  '(': ['...#.', '..#..', '.#...', '.#...', '.#...', '..#..', '...#.'],
  ')': ['.#...', '..#..', '...#.', '...#.', '...#.', '..#..', '.#...'],
  ',': ['.....', '.....', '.....', '.....', '.##..', '..#..', '.#...'],
  '!': ['..#..', '..#..', '..#..', '..#..', '..#..', '.....', '..#..'],
  ' ': ['.....', '.....', '.....', '.....', '.....', '.....', '.....'],
};

const ZEICHEN = Object.keys(SCHRIFT);

// Schrift einmal in eine Bildleiste malen, je Farbe
function schriftLeiste(farbe) {
  const c = document.createElement('canvas');
  c.width = ZEICHEN.length * 6;
  c.height = 7;
  const ctx = c.getContext('2d');
  ctx.fillStyle = farbe;
  ZEICHEN.forEach((z, n) => {
    const zeilen = SCHRIFT[z];
    for (let y = 0; y < 7; y++)
      for (let x = 0; x < 5; x++) if (zeilen[y][x] === '#') ctx.fillRect(n * 6 + x, y, 1, 1);
  });
  return c;
}

export function formatZeit(sek) {
  const ms = Math.floor(sek * 100);
  const m = Math.floor(ms / 6000), s = Math.floor((ms % 6000) / 100), h = ms % 100;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(h).padStart(2, '0')}`;
}

export function baueHud(canvas) {
  const B = CONFIG.bild.breite, H = CONFIG.bild.hoehe;
  canvas.width = B;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  const leisten = {
    weiss: schriftLeiste('#f4f4ee'), schatten: schriftLeiste('#101418'), gelb: schriftLeiste('#ffd23c'),
    rot: schriftLeiste('#ff4a3a'),
  };

  function text(t, x, y, groesse = 1, farbe = 'weiss', ausrichtung = 'links') {
    t = String(t).toUpperCase();
    const breite = t.length * 6 * groesse - groesse;
    if (ausrichtung === 'mitte') x = Math.round(x - breite / 2);
    if (ausrichtung === 'rechts') x = Math.round(x - breite);
    const schatten = Math.max(1, Math.floor(groesse / 2));
    for (const [leiste, d] of [[leisten.schatten, schatten], [leisten[farbe], 0]]) {
      for (let i = 0; i < t.length; i++) {
        let n = ZEICHEN.indexOf(t[i]);
        if (n < 0) n = ZEICHEN.indexOf(' ');
        ctx.drawImage(leiste, n * 6, 0, 5, 7, x + i * 6 * groesse + d, y + d, 5 * groesse, 7 * groesse);
      }
    }
  }

  const tachos = baueTachos(ctx, text);

  return {
    zeichne(z) {
      ctx.clearRect(0, 0, B, H);
      // Zeit oben Mitte
      text(formatZeit(z.zeit), B / 2, 5, 2, z.zustand === 'laeuft' ? 'weiss' : 'gelb', 'mitte');
      // Tachos unten rechts (Drehzahl mit Gang, Tempo)
      tachos.zeichne(z.dt, z.kmh, z.drehzahl, z.gang);

      if (z.zustand === 'bereit' && z.hilfe) {
        text('PFEILE/WASD: FAHREN', 5, H - 34);
        text('LEERTASTE: HANDBREMSE', 5, H - 25);
        text('R: AUF STRASSE  F3: DEBUG', 5, H - 16);
      }
      // Meldung oben (Zwischenzeit oder "Checkpoint verpasst")
      if (z.meldung && z.zustand !== 'ziel') text(z.meldung.text, B / 2, 25, 2, z.meldung.farbe, 'mitte');
      if (z.zustand === 'ziel') {
        ctx.fillStyle = 'rgba(10,14,20,0.55)';
        ctx.fillRect(0, 42, B, 96);
        text('ZIEL!', B / 2, 47, 4, 'gelb', 'mitte');
        text(formatZeit(z.endZeit), B / 2, 79, 3, 'weiss', 'mitte');
        // Zwischenzeiten der Checkpoints
        for (let n = 0; n < z.anzahlCps; n++) {
          const zz = z.zwischenzeiten[n];
          const x = B / 2 + (n - (z.anzahlCps - 1) / 2) * 100;
          text(`CP ${n + 1}  ${zz == null ? '--:--.--' : formatZeit(zz)}`, x, 107, 1, 'weiss', 'mitte');
        }
        text('R ODER START = NEUSTART', B / 2, 124, 1, 'gelb', 'mitte');
      }
      if (z.debug) {
        const zeilen = [
          `FPS ${Math.round(z.fps)}`,
          `METER ${Math.max(0, Math.round(z.meter))} / ${Math.round(z.laenge)}`,
          `TEMPO ${Math.round(z.kmh)} KM/H`,
          `GANG ${z.gang} U/MIN ${Math.round(z.drehzahl)}`,
          `DRIFT ${Math.round(z.drift)}°`,
          `UNTERGRUND ${z.untergrund}`,
          `HINDERNISSE ${z.hindernisse}`,
          z.naechsterCp.nummer
            ? `NAECHSTER CP ${z.naechsterCp.nummer} IN ${Math.round(z.naechsterCp.abstand)} M`
            : `ZIEL IN ${Math.round(z.naechsterCp.abstand)} M`,
          z.aufprall
            ? `AUFPRALL ${Math.round(z.aufprall.vorher * 3.6)} -> ${Math.round(z.aufprall.nachher * 3.6)} KM/H`
            : 'AUFPRALL -',
        ];
        ctx.fillStyle = 'rgba(10,14,20,0.6)';
        ctx.fillRect(2, 44, 158, zeilen.length * 9 + 4);
        zeilen.forEach((t, i) => text(t, 5, 47 + i * 9));
      }
    },
  };
}
