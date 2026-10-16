// HUD: Tachos, Zeit, Pace-Notes (seit M4), Zielanzeige und Debug-Panel.
// Gezeichnet mit einer eigenen 5x7-Pixelschrift (keine externen Fonts).

import { CONFIG } from './config.js';
import { baueTachos, miniText, miniBreite } from './tacho.js';
import { zeichneSymbol, zeichneZusatz, symbolBreite, SYMBOL_HOEHE, ZUSATZ_GROESSE } from './pacenotesbild.js';

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
  leisten.pnText = schriftLeiste(PN.farbeText);
  leisten.pnDistanz = schriftLeiste(PN.farbeDistanz);
  for (const [name, f] of Object.entries(PN.farben)) leisten[`pn_${name}`] = schriftLeiste(f); // Stufen-Zahl farbig

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

  // Zeit-Tafel oben Mitte. Ergebnis: y unter den Checkpoint-Punkten
  function zeitTafel(z) {
    const c = CONFIG.hud.zeit;
    const zeit = formatZeit(z.zeit);           // immer 8 Zeichen -> feste Breite
    const bZeit = zeit.length * 6 - 1, bWort = miniBreite('ZEIT');
    const b = c.innen + bWort + c.luecke + bZeit + c.innen + 2;
    const x = Math.round(B / 2 - b / 2), y = c.oben;
    tafel(x, y, b, c.hoehe, c.ecke, CONFIG.hud.tacho.farbeBlatt, c.farbeRand);
    const yText = y + Math.round((c.hoehe - 7) / 2);
    miniText(ctx, 'ZEIT', x + 1 + c.innen, yText + 1, c.farbeBeschriftung);
    text(zeit, x + 1 + c.innen + bWort + c.luecke, yText, 1, z.zustand === 'laeuft' ? 'weiss' : 'gelb');
    // Checkpoint-Punkte: leer = noch nicht erreicht, gelb gefüllt = erreicht
    const n = z.anzahlCps, g = c.cpGroesse;
    const bPunkte = n * g + (n - 1) * c.cpAbstand;
    const yP = y + c.hoehe + c.cpUnter;
    for (let i = 0; i < n; i++) {
      const xp = Math.round(B / 2 - bPunkte / 2) + i * (g + c.cpAbstand);
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

  // --- Pace-Notes (M4): kleine Tafel unter der Zeit, höchstens 3 Zeilen ---------------------------------
  // Jede Ansage wird einmal (beim ersten Zeigen) als kleines Bild gemalt: Symbol(e), Text, Zusatz-Zeichen.
  // Pro Bild kommen nur noch dieses Bild und die Distanz dazu (keine neuen Objekte).
  const noteBilder = [];
  const UND = ` ${PN.texte.und} `;
  const farbe = (name) => PN.farben[name] || PN.farben.weiss;
  function noteBild(nt, nr) {
    if (noteBilder[nr]) return noteBilder[nr];
    // erst messen, dann malen
    const schritte = [];
    let x = 0, vorherText = false;
    nt.stuecke.forEach((st, k) => {
      if (k > 0) {
        if (vorherText && st.text) { schritte.push(['text', UND.trim(), x + 6]); x += UND.length * 6; }
        else x += 3;
      }
      schritte.push(['symbol', st, x]);
      x += symbolBreite(st.symbol) + 4;
      if (st.text) {
        schritte.push(['text', st.text, x]);
        // Stufen-Zahl in der Farbe des Symbols (rot 1-2, gelb 3-4, grün 5-6)
        const i = st.stufe != null ? st.text.indexOf(` ${st.stufe}`) : -1;
        if (i >= 0) schritte.push(['ziffer', String(st.stufe), x + (i + 1) * 6, st.farbe]);
        x += st.text.length * 6 - 1;
        vorherText = true;
      } else x -= 4;
    });
    for (const zs of nt.zusatz) {
      x += 3;
      schritte.push(['zusatz', zs, x]);
      x += ZUSATZ_GROESSE;
    }
    const c = document.createElement('canvas');
    c.width = x + 1; c.height = SYMBOL_HOEHE + 1;
    const cx = c.getContext('2d');
    for (const [art, was, xx, f] of schritte) {
      if (art === 'text') textAuf(cx, was, xx, 1, 1, 'pnText');
      else if (art === 'ziffer') { cx.clearRect(xx, 1, 6, 8); textAuf(cx, was, xx, 1, 1, `pn_${f}`); }
      else if (art === 'symbol') zeichneSymbol(cx, was.symbol, xx, 0, farbe(was.farbe), was.richtung);
      else {
        const name = was === 'schotter' || was === 'wiesenweg' ? 'belag' : was;
        const f = was === 'schneiden' ? 'gruen' : was === 'nichtSchneiden' ? 'rot' : was;
        zeichneZusatz(cx, name, xx, 1, PN.farben[f] || farbe('weiss'));
      }
    }
    noteBilder[nr] = { bild: c, breite: x };
    return noteBilder[nr];
  }
  // Distanz-Texte vorab (0, 10, 20 ... 500 m), damit pro Bild kein neuer Text entsteht
  const distanzTexte = [];
  for (let m = 0; m <= 500; m += PN.distanzRunden) distanzTexte.push(String(m));
  const distanzBreite = 3 * 6 - 1 + 4; // drei Ziffern und ein kleines "M"
  const MINI_M = ['#.#', '###', '###', '#.#', '#.#'];
  const ZIFFER_NR = [...'0123456789'].map((z) => ZEICHEN.indexOf(z));
  // Distanz rechtsbündig zeichnen (Ziffern und ein kleines "M" für Meter, ohne neue Objekte)
  function ziffern(t, xRechts, y) {
    for (let yy = 0; yy < 5; yy++) {
      for (let xx = 0; xx < 3; xx++) {
        if (MINI_M[yy][xx] !== '#') continue;
        ctx.fillStyle = CONFIG.hud.tacho.farbeSchatten;
        ctx.fillRect(xRechts - 2 + xx, y + 3 + yy, 1, 1);
        ctx.fillStyle = PN.farbeDistanz;
        ctx.fillRect(xRechts - 3 + xx, y + 2 + yy, 1, 1);
      }
    }
    xRechts -= 5;
    const x0 = xRechts - (t.length * 6 - 1);
    for (let i = 0; i < t.length; i++) {
      const n = ZIFFER_NR[t.charCodeAt(i) - 48];
      ctx.drawImage(leisten.schatten, n * 6, 0, 5, 7, x0 + i * 6 + 1, y + 1, 5, 7);
      ctx.drawImage(leisten.pnDistanz, n * 6, 0, 5, 7, x0 + i * 6, y, 5, 7);
    }
  }
  let pnBreite = 0, pnVersatz = 0;
  function zeichnePaceNotes(a, y, dt) {
    if (!a || !a.anzahl) { pnBreite = 0; return; }
    let maxB = 0, maxA = 0, unten = 0;
    for (let k = 0; k < a.anzahl; k++) {
      const zl = a.zeilen[k];
      const nb = noteBild(a.notes[zl.nr], zl.nr);
      if (nb.breite > maxB) maxB = nb.breite;
      if (zl.alpha > maxA) maxA = zl.alpha;
      if (zl.y + 1 > unten) unten = zl.y + 1;
    }
    // Tafel wird weich breiter/schmaler, wenn eine längere/kürzere Zeile kommt
    const zielB = PN.innen * 2 + maxB + PN.distanzAbstand + distanzBreite;
    pnBreite = pnBreite ? pnBreite + (zielB - pnBreite) * Math.min(1, dt * 12) : zielB;
    const b = Math.round(pnBreite);
    const h = Math.round(unten * PN.zeilenHoehe) + PN.innen * 2 - 1;
    const x = Math.round(B / 2 - b / 2);
    ctx.globalAlpha = maxA;
    tafel(x, y, b, h, 2, PN.farbeTafel, PN.farbeRand);
    for (let k = 0; k < a.anzahl; k++) {
      const zl = a.zeilen[k];
      const nb = noteBilder[zl.nr];
      const yz = y + PN.innen + Math.round(zl.y * PN.zeilenHoehe);
      ctx.globalAlpha = zl.alpha * zl.alpha; // weicher Übergang
      ctx.drawImage(nb.bild, x + PN.innen + 1, yz);
      const dt2 = distanzTexte[Math.min(distanzTexte.length - 1, zl.distanz / PN.distanzRunden)];
      ziffern(dt2, x + b - PN.innen - 1, yz + 1);
    }
    ctx.globalAlpha = 1;
  }

  return {
    zeichne(z) {
      ctx.clearRect(0, 0, B, H);
      // Zeit oben Mitte auf der Tafel, darunter die Checkpoint-Punkte
      const unterTafel = zeitTafel(z);
      // Pace-Notes unter den Punkten; steht eine Zwischenzeit-Meldung da, rutschen sie weich darunter
      const zielVersatz = z.meldung && z.zustand !== 'ziel' ? CONFIG.hud.zeit.meldungUnter + 9 : 0;
      pnVersatz += (zielVersatz - pnVersatz) * Math.min(1, z.dt * 10);
      zeichnePaceNotes(z.notes, unterTafel + PN.unterPunkte + Math.round(pnVersatz), z.dt);
      // Tachos unten rechts (Drehzahl mit Gang, Tempo)
      tachos.zeichne(z.dt, z.kmh, z.drehzahl, z.gang);

      if (z.zustand === 'bereit' && z.hilfe) {
        text('PFEILE/WASD: FAHREN', 5, H - 43);
        text('LEERTASTE: HANDBREMSE', 5, H - 34);
        text('R: AUF STRASSE  F3: DEBUG', 5, H - 25);
        text('N: ANSAGEN AN/AUS', 5, H - 16);
      }
      // Meldung oben (Zwischenzeit oder "Checkpoint verpasst")
      if (z.meldung && z.zustand !== 'ziel') text(z.meldung.text, B / 2, unterTafel + CONFIG.hud.zeit.meldungUnter, 1, z.meldung.farbe, 'mitte');
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
        ctx.fillStyle = 'rgba(10,14,20,0.6)';
        ctx.fillRect(2, 44, 158, zeilen.length * 9 + 4);
        zeilen.forEach((t, i) => text(t, 5, 47 + i * 9));
      }
    },
  };
}
