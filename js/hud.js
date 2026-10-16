// HUD: Tachos, Zeit (oben links), Pace-Notes (oben Mitte, seit M4.1 als Kacheln), R-Countdown,
// Zielanzeige und Debug-Panel.
// Gezeichnet mit einer eigenen 5x7-Pixelschrift (keine externen Fonts).

import { CONFIG } from './config.js';
import { baueTachos, miniText, miniBreite } from './tacho.js';
import { zeichneKachel, zeichneReset, KACHEL_HOEHE } from './pacenotesbild.js';

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
  // Umlaute (M4, für die Pace-Notes): zwei Punkte oben, Buchstabe etwas kürzer
  'Ä': ['.#.#.', '.....', '.###.', '#...#', '#####', '#...#', '#...#'],
  'Ö': ['.#.#.', '.....', '.###.', '#...#', '#...#', '#...#', '.###.'],
  'Ü': ['.#.#.', '.....', '#...#', '#...#', '#...#', '#...#', '.###.'],
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
  const PN = CONFIG.pacenotes;

  // Text zeichnen (auf ctx oder ein anderes Bild c)
  function textAuf(c, t, x, y, groesse = 1, farbe = 'weiss', ausrichtung = 'links') {
    t = String(t).toUpperCase();
    const breite = t.length * 6 * groesse - groesse;
    if (ausrichtung === 'mitte') x = Math.round(x - breite / 2);
    if (ausrichtung === 'rechts') x = Math.round(x - breite);
    const schatten = Math.max(1, Math.floor(groesse / 2));
    for (const [leiste, d] of [[leisten.schatten, schatten], [leisten[farbe], 0]]) {
      for (let i = 0; i < t.length; i++) {
        let n = ZEICHEN.indexOf(t[i]);
        if (n < 0) n = ZEICHEN.indexOf(' ');
        c.drawImage(leiste, n * 6, 0, 5, 7, x + i * 6 * groesse + d, y + d, 5 * groesse, 7 * groesse);
      }
    }
  }
  const text = (t, x, y, groesse, farbe, ausrichtung) => textAuf(ctx, t, x, y, groesse, farbe, ausrichtung);

  const tachos = baueTachos(ctx, text);

  // Rechteck mit pixelig abgeschrägten Ecken (e = so viele Pixel abgeschrägt)
  function tafel(x, y, b, h, e, fuellung, rand) {
    for (let i = 0; i < h; i++) {
      const ein = Math.max(0, e - i, e - (h - 1 - i)); // Einzug dieser Zeile
      ctx.fillStyle = fuellung;
      ctx.fillRect(x + ein, y + i, b - 2 * ein, 1);
      ctx.fillStyle = rand;
      if (i === 0 || i === h - 1) ctx.fillRect(x + ein, y + i, b - 2 * ein, 1);
      else {
        ctx.fillRect(x + ein, y + i, 1, 1);
        ctx.fillRect(x + b - 1 - ein, y + i, 1, 1);
        // Schräge: Pixel zwischen dieser und der Zeile darüber/darunter schliessen
        const einOben = Math.max(0, e - (i - 1), e - (h - i)), einUnten = Math.max(0, e - (i + 1), e - (h - 2 - i));
        for (const n of [einOben, einUnten]) {
          if (n > ein + 1) { ctx.fillRect(x + ein + 1, y + i, n - ein - 1, 1); ctx.fillRect(x + b - n, y + i, n - ein - 1, 1); }
        }
      }
    }
  }

  // Zeit-Tafel oben links (seit M4.1, vorher Mitte). Ergebnis: y unter den Checkpoint-Punkten
  const zeitBreite = CONFIG.hud.zeit.innen * 2 + miniBreite('ZEIT') + CONFIG.hud.zeit.luecke + 8 * 6 - 1 + 2;
  function zeitTafel(z) {
    const c = CONFIG.hud.zeit;
    const zeit = formatZeit(z.zeit);           // immer 8 Zeichen -> feste Breite
    const bWort = miniBreite('ZEIT');
    const b = zeitBreite;
    const x = c.links, y = c.oben;
    tafel(x, y, b, c.hoehe, c.ecke, CONFIG.hud.tacho.farbeBlatt, c.farbeRand);
    const yText = y + Math.round((c.hoehe - 7) / 2);
    miniText(ctx, 'ZEIT', x + 1 + c.innen, yText + 1, c.farbeBeschriftung);
    text(zeit, x + 1 + c.innen + bWort + c.luecke, yText, 1, z.zustand === 'laeuft' ? 'weiss' : 'gelb');
    // Checkpoint-Punkte mittig unter der Tafel: leer = noch nicht erreicht, gelb gefüllt = erreicht
    const n = z.anzahlCps, g = c.cpGroesse;
    const bPunkte = n * g + (n - 1) * c.cpAbstand;
    const yP = y + c.hoehe + c.cpUnter;
    for (let i = 0; i < n; i++) {
      const xp = Math.round(x + b / 2 - bPunkte / 2) + i * (g + c.cpAbstand);
      ctx.fillStyle = 'rgba(10, 14, 20, 0.7)'; // Schatten
      ctx.fillRect(xp + 1, yP + 1, g, g);
      if (z.zwischenzeiten[i] != null) {
        ctx.fillStyle = c.farbeCpErreicht;
        ctx.fillRect(xp, yP, g, g);
      } else {
        ctx.fillStyle = c.farbeCpLeer;
        ctx.fillRect(xp, yP, g, g);
        ctx.fillStyle = CONFIG.hud.tacho.farbeBlatt;
        ctx.fillRect(xp + 1, yP + 1, g - 2, g - 2);
      }
    }
    return yP + g;
  }

  // --- Pace-Notes (M4.1): kleine Kacheln oben Mitte, nur Symbole -----------------------------------
  // Alle Kacheln der Etappe werden einmal (beim ersten Bild) auf ein gemeinsames Bild gemalt.
  // Pro Bild kommen nur noch die Tafel und je Kachel ein Bildausschnitt dazu (keine neuen Objekte).
  let atlas = null;
  function baueAtlas(alle) {
    let breite = 0;
    for (const k of alle) breite += k.breite + 1;
    atlas = document.createElement('canvas');
    atlas.width = Math.max(1, breite); atlas.height = KACHEL_HOEHE;
    const ax = atlas.getContext('2d');
    let x = 0;
    for (const k of alle) { k.atlasX = x; zeichneKachel(ax, k, x, 0); x += k.breite + 1; }
  }
  const pnH = KACHEL_HOEHE + PN.innen * 2 + 1;
  let pnLinks = 0, pnRechts = 0;
  // Ergebnis: y unter der Tafel (für den R-Countdown)
  function zeichnePaceNotes(a, dt) {
    const y = PN.oben;
    if (!a || !a.anzahl) { pnLinks = pnRechts = 0; return y; }
    if (!atlas) baueAtlas(a.alle);
    let links = 1e9, rechts = -1e9, maxA = 0;
    for (let k = 0; k < a.anzahl; k++) {
      const e = a.kacheln[k], kk = a.alle[e.nr];
      if (e.x < links) links = e.x;
      if (e.x + kk.breite > rechts) rechts = e.x + kk.breite;
      if (e.alpha > maxA) maxA = e.alpha;
    }
    // Tafel wird weich breiter/schmaler
    const f = Math.min(1, dt * 14);
    pnLinks = pnRechts ? pnLinks + (links - pnLinks) * f : links;
    pnRechts = pnRechts ? pnRechts + (rechts - pnRechts) * f : rechts;
    const x0 = Math.round(pnLinks) - PN.innen - 1, b = Math.round(pnRechts) - x0 + PN.innen;
    ctx.globalAlpha = Math.min(1, maxA * 1.5);
    tafel(x0, y, b, pnH, 2, PN.farbeTafel, PN.farbeRand);
    for (let k = 0; k < a.anzahl; k++) {
      const e = a.kacheln[k], kk = a.alle[e.nr];
      ctx.globalAlpha = e.alpha * e.alpha; // weicher Übergang
      ctx.drawImage(atlas, kk.atlasX, 0, kk.breite, KACHEL_HOEHE, Math.round(e.x), y + PN.innen + 1, kk.breite, KACHEL_HOEHE);
    }
    ctx.globalAlpha = 1;
    return y + pnH;
  }

  // R-Countdown (M4.1): kleines Reset-Zeichen und eine Ziffer, mittig unter den Pace-Notes
  const ZIFFER = [...'0123456789'];
  function zeichneCountdown(rest, y) {
    const c = CONFIG.zurueck;
    const zahl = ZIFFER[Math.min(9, Math.max(1, Math.ceil(rest)))];
    const b = 7 + 3 + 5, h = 9;
    const x = Math.round(B / 2 - b / 2);
    tafel(x - 3, y, b + 6, h + 4, 2, PN.farbeTafel, PN.farbeRand);
    zeichneReset(ctx, x, y + 3, c.farbe, PN.farbeSchatten);
    text(zahl, x + 10, y + 3, 1, 'gelb');
  }

  return {
    zeichne(z) {
      ctx.clearRect(0, 0, B, H);
      // Zeit oben links auf der Tafel, darunter die Checkpoint-Punkte
      const unterTafel = zeitTafel(z);
      // Pace-Notes oben Mitte, darunter ggf. der R-Countdown
      const unterNotes = zeichnePaceNotes(z.notes, z.dt);
      if (z.countdown > 0) zeichneCountdown(z.countdown, Math.max(unterNotes, PN.oben + pnH) + CONFIG.zurueck.oben);
      // Tachos unten rechts (Drehzahl mit Gang, Tempo)
      tachos.zeichne(z.dt, z.kmh, z.drehzahl, z.gang);

      if (z.zustand === 'bereit' && z.hilfe) {
        text('PFEILE/WASD: FAHREN', 5, H - 43);
        text('LEERTASTE: HANDBREMSE', 5, H - 34);
        text('R: AUF STRASSE  F3: DEBUG', 5, H - 25);
        text('N: ANSAGEN AN/AUS', 5, H - 16);
      }
      // Meldung oben (Zwischenzeit oder "Checkpoint verpasst")
      if (z.meldung && z.zustand !== 'ziel') text(z.meldung.text, CONFIG.hud.zeit.links, unterTafel + CONFIG.hud.zeit.meldungUnter, 1, z.meldung.farbe);
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
          `ANSAGEN ${z.notes && z.notes.an ? 'AN' : 'AUS'} (TASTE N)`,
        ];
        // die nächsten Ansagen als Text (intern, nur hier)
        const a = z.notes;
        if (a) for (let n = a.naechste; n < Math.min(a.notes.length, a.naechste + 3); n++) zeilen.push(`> ${a.notes[n].text}`);
        ctx.fillStyle = 'rgba(10,14,20,0.6)';
        ctx.fillRect(2, 44, 158, zeilen.length * 9 + 4);
        zeilen.forEach((t, i) => text(t, 5, 47 + i * 9));
      }
    },
  };
}
