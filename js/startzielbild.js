// Pixel-Bilder für den Start- und Zielbereich (Meilenstein 3c), im Code gezeichnet (keine Bilddateien).
//   startZielAtlas(): ein Bild mit allen Teilen (Bögen, Banner, Zelte, Container, Autos, Fahnen ...)
//                     für EIN Material (ein Zeichenaufruf je Bereich)
//   zuschauerAtlas(): Pixel-Figuren, 4 Ansichten (vorne, rechts, hinten, links) x 2 Bilder (winken)
//                     x 7 Posen. Jacke, Hose, Mütze/Fahne und Haare sind Farbschlüssel: Die echte
//                     Farbe kommt pro Zuschauer aus dem Shader (startziel.js), so reichen wenige Bilder.
// Erfundene Sponsoren, keine echten Marken.

import { leinwand, setze, zuTextur, hexZuRgb } from './pixel.js';
import { zufall } from './util.js';

// Kleine Schrift 3x5 (Sponsoren, Schilder)
export const KLEIN = {
  A: ['.#.', '#.#', '###', '#.#', '#.#'], B: ['##.', '#.#', '##.', '#.#', '##.'], C: ['.##', '#..', '#..', '#..', '.##'],
  D: ['##.', '#.#', '#.#', '#.#', '##.'], E: ['###', '#..', '##.', '#..', '###'], F: ['###', '#..', '##.', '#..', '#..'],
  G: ['.##', '#..', '#.#', '#.#', '.##'], H: ['#.#', '#.#', '###', '#.#', '#.#'], I: ['###', '.#.', '.#.', '.#.', '###'],
  K: ['#.#', '#.#', '##.', '#.#', '#.#'], L: ['#..', '#..', '#..', '#..', '###'], M: ['#.#', '###', '###', '#.#', '#.#'],
  N: ['##.', '#.#', '#.#', '#.#', '#.#'], O: ['.#.', '#.#', '#.#', '#.#', '.#.'], P: ['##.', '#.#', '##.', '#..', '#..'],
  R: ['##.', '#.#', '##.', '#.#', '#.#'], S: ['.##', '#..', '.#.', '..#', '##.'], T: ['###', '.#.', '.#.', '.#.', '.#.'],
  U: ['#.#', '#.#', '#.#', '#.#', '###'], W: ['#.#', '#.#', '###', '###', '#.#'], Z: ['###', '..#', '.#.', '#..', '###'],
  0: ['###', '#.#', '#.#', '#.#', '###'], 1: ['.#.', '##.', '.#.', '.#.', '###'], 2: ['##.', '..#', '.#.', '#..', '###'],
  3: ['##.', '..#', '.#.', '..#', '##.'], 5: ['###', '#..', '##.', '..#', '##.'], ':': ['...', '.#.', '...', '.#.', '...'],
  ' ': ['...', '...', '...', '...', '...'],
};
// Grosse Schrift 5x7 (START / ZIEL auf den Bögen, aus der Fahrt lesbar)
const GROSS = {
  S: ['.####', '#....', '#....', '.###.', '....#', '....#', '####.'], T: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
  A: ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'], R: ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'],
  Z: ['#####', '....#', '...#.', '..#..', '.#...', '#....', '#####'], I: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '#####'],
  E: ['#####', '#....', '#....', '####.', '#....', '#....', '#####'], L: ['#....', '#....', '#....', '#....', '#....', '#....', '#####'],
};
export function schreibe(px, text, x0, y0, rgb, schrift = KLEIN) {
  let x = x0;
  for (const z of text) {
    const m = schrift[z] || schrift[' '] || KLEIN[' '];
    for (let y = 0; y < m.length; y++) for (let k = 0; k < m[y].length; k++) if (m[y][k] === '#') px(x + k, y0 + y, rgb);
    x += m[0].length + 1;
  }
}
export const textBreite = (text, schrift = KLEIN) => [...text].reduce((b, z) => b + ((schrift[z] || KLEIN[' '])[0].length + 1), 0) - 1;

// Erfundene Sponsoren: Name, Grundfarbe, Schriftfarbe
export const SPONSOREN = [
  ['BERGKRAFT', '#1f4fa8', '#f2f0e8'], ['SENNHOF', '#2c7a3a', '#f4e27a'], ['RINGWERK', '#c8202a', '#f2f0e8'], ['PASSGOLD', '#f0c020', '#1c1c1c'],
];

export function startZielAtlas(seed = 91) {
  const N = 256, NH = 128, RAND = 2;
  const l = leinwand(N, NH);
  const rnd = zufall(seed);
  const rechtecke = {};
  let x0 = 0, y0 = 0, zeileH = 0;
  // Kachel mit Rand aus wiederholten Randpixeln (gegen Nähte), wie beim Strassenrand-Atlas.
  // null-Pixel bleiben durchsichtig (Gerüst: man sieht durch)
  function kachel(name, b, h, malen) {
    if (x0 + b + RAND * 2 > N) { x0 = 0; y0 += zeileH; zeileH = 0; }
    if (y0 + h + RAND * 2 > NH) throw new Error(`Atlas voll bei Kachel ${name}`);
    const ox = x0 + RAND, oy = y0 + RAND;
    const daten = new Array(b * h).fill(null);
    malen((x, y, rgb) => { if (x >= 0 && y >= 0 && x < b && y < h) daten[y * b + x] = rgb; });
    for (let y = -RAND; y < h + RAND; y++) {
      for (let x = -RAND; x < b + RAND; x++) {
        const d = daten[Math.min(h - 1, Math.max(0, y)) * b + Math.min(b - 1, Math.max(0, x))];
        if (d) setze(l, ox + x, oy + y, d);
      }
    }
    rechtecke[name] = { x: ox, y: oy, b, h };
    x0 += b + RAND * 2;
    zeileH = Math.max(zeileH, h + RAND * 2);
  }
  const hell = (rgb, f) => rgb.map((c) => Math.max(0, Math.min(255, Math.round(c * f))));
  const ROT = hexZuRgb('#c8202a'), WEISS = hexZuRgb('#f2f0e8'), SCHWARZ = hexZuRgb('#1c1c1c'), GELB = hexZuRgb('#f0c020');
  const BLAU = hexZuRgb('#1d3f8f'), GRAU = hexZuRgb('#a7adb3');
  const voll = (b, h, f) => (px) => { for (let y = 0; y < h; y++) for (let x = 0; x < b; x++) px(x, y, f(x, y)); };

  // Startbogen-Banner: dunkelblau, oben und unten ein roter Streifen, in der Mitte START (gross, weiss),
  // links und rechts kleine Zielflaggen-Felder. 48x11 (Bild oben = y 0). Schmal, damit die Schrift
  // auch aus 30-40 m noch ganze Pixel hat (320x180)
  kachel('bannerStart', 48, 11, (px) => {
    for (let y = 0; y < 11; y++) for (let x = 0; x < 48; x++) px(x, y, y === 0 || y === 10 ? ROT : hell(BLAU, 0.96 + rnd() * 0.06));
    for (const xa of [1, 41]) for (let y = 2; y < 9; y++) for (let x = xa; x < xa + 6; x++) px(x, y, (Math.floor((x - xa) / 2) + Math.floor(y / 2)) % 2 ? SCHWARZ : WEISS);
    schreibe(px, 'START', Math.floor((48 - textBreite('START', GROSS)) / 2), 2, WEISS, GROSS);
  });
  // Zielbogen-Banner: Schachbrett, in der Mitte ein schwarzes Feld mit ZIEL (gross, weiss). 48x11
  kachel('bannerZiel', 48, 11, (px) => {
    for (let y = 0; y < 11; y++) for (let x = 0; x < 48; x++) px(x, y, (Math.floor(x / 2) + Math.floor((y + 1) / 2)) % 2 ? SCHWARZ : WEISS);
    const b = textBreite('ZIEL', GROSS), xa = Math.floor((48 - b) / 2);
    for (let y = 1; y < 10; y++) for (let x = xa - 3; x < xa + b + 3; x++) px(x, y, SCHWARZ);
    schreibe(px, 'ZIEL', xa, 2, WEISS, GROSS);
  });
  // Rückseite der Banner (was man im Rückspiegel sähe): schlicht mit Sponsor
  kachel('bannerHinten', 48, 11, (px) => {
    for (let y = 0; y < 11; y++) for (let x = 0; x < 48; x++) px(x, y, y === 0 || y === 10 ? ROT : hell(BLAU, 0.9));
    schreibe(px, 'BERGKRAFT', Math.floor((48 - textBreite('BERGKRAFT')) / 2), 3, WEISS);
  });
  // Gerüst (Alu-Fachwerk): zwei Längsrohre, Querstreben im Zickzack, dazwischen durchsichtig. 8x16
  kachel('geruest', 8, 16, (px) => {
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 8; x++) {
        const rohr = x === 0 || x === 7;
        const strebe = Math.abs(x - (y % 8 < 4 ? (y % 8) * 2 : 14 - (y % 8) * 2)) <= 0.5 || y % 8 === 0;
        if (rohr || strebe) px(x, y, hell(GRAU, rohr ? (x === 0 ? 1.1 : 0.85) : 0.95));
      }
    }
  });
  // Absperrband (rot-weiss schräg) und Warnstange (rot-weiss geringelt), wie bei den Absperrungen
  kachel('band', 32, 3, voll(32, 3, (x, y) => (Math.floor((x + y) / 4) % 2 ? WEISS : ROT)));
  kachel('stange', 4, 16, voll(4, 16, (x, y) => hell(Math.floor(y / 4) % 2 ? WEISS : ROT, x === 3 ? 0.8 : 1)));
  // Strohballen (Kleinballen): Halme längs, zwei Schnüre. Seite 16x8, Stirn 8x8
  const STROH = ['#d8bd6a', '#c7a955', '#e6d088', '#a98c40'].map(hexZuRgb);
  kachel('strohSeite', 16, 8, (px) => {
    for (let y = 0; y < 8; y++) {
      let f = rnd() < 0.5 ? 0 : 1;
      for (let x = 0; x < 16; x++) {
        if (rnd() < 0.25) f = Math.floor(rnd() * 3);
        let c = STROH[f];
        if (rnd() < 0.06) c = STROH[3];
        if (x === 4 || x === 11) c = hell(STROH[3], 0.8);
        px(x, y, c);
      }
    }
  });
  kachel('strohEnde', 8, 8, voll(8, 8, () => hell(STROH[rnd() < 0.5 ? 1 : 3], 0.9 + rnd() * 0.2)));
  // Zeltdach: Streifen (rot-weiss / blau-weiss / gelb-blau), 16x16; Zeltwand weisse Plane
  for (const [name, a, b] of [['dachRot', ROT, WEISS], ['dachBlau', BLAU, WEISS], ['dachGelb', GELB, BLAU]]) {
    kachel(name, 16, 16, voll(16, 16, (x) => hell(Math.floor(x / 4) % 2 ? b : a, 0.96 + rnd() * 0.06)));
  }
  kachel('plane', 8, 8, voll(8, 8, (x, y) => hell(WEISS, y === 7 ? 0.82 : 0.92 + rnd() * 0.06)));
  // Volant (Stoffband unter dem Zeltdach) mit Sponsor
  SPONSOREN.forEach(([name, grund, schrift], k) => {
    const G = hexZuRgb(grund), S = hexZuRgb(schrift);
    kachel(`sponsor${k}`, 40, 7, (px) => {
      for (let y = 0; y < 7; y++) for (let x = 0; x < 40; x++) px(x, y, y === 0 || y === 6 ? hell(G, 0.75) : G);
      schreibe(px, name, Math.floor((40 - textBreite(name)) / 2), 1, S);
    });
  });
  // Zeitnahme-Schild: weiss auf blau
  kachel('schildZeit', 40, 7, (px) => {
    for (let y = 0; y < 7; y++) for (let x = 0; x < 40; x++) px(x, y, y === 0 || y === 6 ? WEISS : BLAU);
    schreibe(px, 'ZEITNAHME', Math.floor((40 - textBreite('ZEITNAHME')) / 2), 1, WEISS);
  });
  // Startuhr: schwarze Tafel, gelbe Ziffern 0:30, darunter drei Lampen (rot, rot, grün). 24x14
  kachel('uhr', 24, 14, (px) => {
    for (let y = 0; y < 14; y++) for (let x = 0; x < 24; x++) px(x, y, x === 0 || y === 0 || x === 23 || y === 13 ? hell(GRAU, 0.7) : SCHWARZ);
    schreibe(px, '0:30', Math.floor((24 - textBreite('0:30')) / 2), 2, GELB);
    [[5, ROT], [11, ROT], [17, hexZuRgb('#2fd04a')]].forEach(([x, c]) => { for (let y = 9; y < 12; y++) for (let k = 0; k < 3; k++) px(x + k, y, c); });
  });
  // Container: geripptes Blech (hellgrau) und Fenster / Tür
  kachel('container', 16, 16, voll(16, 16, (x, y) => hell(hexZuRgb('#d6dade'), x % 3 === 0 ? 0.82 : y === 15 ? 0.8 : 0.97 + rnd() * 0.04)));
  kachel('fenster', 8, 6, voll(8, 6, (x, y) => (x === 0 || y === 0 || x === 7 || y === 5 ? hell(GRAU, 0.8) : y < 2 && x > 1 && x < 4 ? hexZuRgb('#8fb2c6') : hexZuRgb('#2a3c4a'))));
  kachel('tuer', 6, 12, voll(6, 12, (x, y) => (x === 0 || y === 0 || x === 5 ? hell(GRAU, 0.7) : x === 4 && y === 6 ? SCHWARZ : hexZuRgb('#5d7f9a'))));
  // Autos: Lack weiss (Farbe kommt über die Eckfarben), Scheibe, Reifen, Licht, Kühlergrill
  kachel('lack', 4, 4, voll(4, 4, () => hell(WEISS, 0.97 + rnd() * 0.03)));
  kachel('scheibe', 8, 4, voll(8, 4, (x, y) => (y === 0 && x > 1 && x < 5 ? hexZuRgb('#6d8ca0') : hexZuRgb('#22303c'))));
  kachel('gummi', 4, 4, voll(4, 4, () => hexZuRgb(rnd() < 0.5 ? '#1c1c1e' : '#2a2a2e')));
  kachel('licht', 4, 2, voll(4, 2, () => hexZuRgb('#f6efc0')));
  kachel('grill', 8, 4, voll(8, 4, (x, y) => (y % 2 ? hexZuRgb('#2a2a2e') : hexZuRgb('#5a5a60'))));
  // Metall (Pfosten, Masten), Holz (Tisch), Stoff weiss (Fahnen, Farbe über die Eckfarben)
  kachel('metall', 4, 4, voll(4, 4, (x) => hell(GRAU, x === 0 ? 1.1 : x === 3 ? 0.8 : 1)));
  kachel('holz', 8, 8, voll(8, 8, (x, y) => hexZuRgb(y === 7 ? '#5a4128' : rnd() < 0.2 ? '#8a6b46' : '#a1815a')));
  kachel('stoff', 4, 4, voll(4, 4, () => hell(WEISS, 0.95 + rnd() * 0.05)));
  // Fahnen: Schweizer Kreuz (rot, weisses Kreuz) und Zielflagge (Schachbrett). 12x8
  kachel('fahneKreuz', 12, 8, voll(12, 8, (x, y) => {
    const kreuz = (x >= 5 && x <= 6 && y >= 1 && y <= 6) || (y >= 3 && y <= 4 && x >= 3 && x <= 8);
    return kreuz ? WEISS : ROT;
  }));
  kachel('fahneKaro', 12, 8, voll(12, 8, (x, y) => ((Math.floor(x / 2) + Math.floor(y / 2)) % 2 ? SCHWARZ : WEISS)));
  // Werbebande (Sponsor gross, quer): wie die Volants, aber eigene Kachel je Sponsor (oben schon: sponsor0..3)

  const textur = zuTextur(l);
  return {
    textur,
    kachel(name) {
      const r = rechtecke[name];
      if (!r) throw new Error(`Atlas: Kachel ${name} fehlt`);
      return { u0: r.x / N, u1: (r.x + r.b) / N, v0: 1 - (r.y + r.h) / NH, v1: 1 - r.y / NH };
    },
  };
}

// ---------------------------------------------------------------------
// Zuschauer: Pixel-Figuren. Zelle 16x28 Pixel (0.1 m pro Pixel: eine 1.75 m grosse Figur ist 17-18
// Pixel hoch, darüber Platz für erhobene Arme und Fahnen). Spalten: Ansicht (0 vorne, 1 schaut nach
// rechts, 2 hinten, 3 schaut nach links) x Bild (0/1, für Winken und wehende Fahnen). Zeilen: Posen.
// Farbschlüssel (Helligkeit im Kanal = Schattierung): Jacke magenta, Hose cyan, Mütze/Fahne gelb,
// Haare grün. Der Shader ersetzt sie durch die Farben des einzelnen Zuschauers.
// ---------------------------------------------------------------------
// M3d: 'posten' (Streckenposten mit Warnweste und gelber Fahne) und 'sitzend' (auf dem Klappstuhl) kommen
// hinten dazu – die Zeilen davor bleiben gleich (Start und Ziel nehmen nur die ersten 7)
export const ZUSCHAUER_POSEN = ['stehend', 'winkend', 'jubelnd', 'fahneKreuz', 'fotograf', 'muetze', 'fahne', 'posten', 'sitzend'];
export function zuschauerAtlas() {
  const ZB = 16, ZH = 28, ANSICHTEN = 4, BILDER = 2;
  const l = leinwand(ZB * ANSICHTEN * BILDER, ZH * ZUSCHAUER_POSEN.length);
  const JACKE = [255, 0, 255], JACKE_D = [150, 0, 150], HOSE = [0, 255, 255], HOSE_D = [0, 160, 160];
  const MUETZE = [255, 255, 0], MUETZE_D = [170, 170, 0], HAAR = [0, 255, 0], HAAR_D = [0, 170, 0];
  const HAUT = [232, 186, 148], HAUT_D = [200, 150, 115], SCHUH = [46, 38, 32], AUGE = [40, 30, 30];
  const HOLZ = [120, 86, 52], WEISS = [244, 242, 236], SCHWARZ = [28, 28, 30];
  const REFLEX = [222, 226, 214]; // M3d: Reflexstreifen der Warnweste

  ZUSCHAUER_POSEN.forEach((pose, zeile) => {
    for (let ansicht = 0; ansicht < ANSICHTEN; ansicht++) {
      for (let bild = 0; bild < BILDER; bild++) {
        const ox = (ansicht * BILDER + bild) * ZB, oy = zeile * ZH;
        // px(x, h): x in der Zelle (0..15), h = Pixel über dem Boden (0 = Schuhsohle)
        const spiegeln = ansicht === 3;
        const px = (x, h, rgb) => {
          if (h < 0 || h >= ZH || x < 0 || x >= ZB) return;
          setze(l, ox + (spiegeln ? ZB - 1 - x : x), oy + ZH - 1 - h, rgb);
        };
        const seite = ansicht === 1 || ansicht === 3, hinten = ansicht === 2;
        figur(px, pose, seite, hinten, bild);
      }
    }
  });

  // Eine Figur zeichnen (Mitte bei x = 7.5). seite: Profil (schaut nach rechts), hinten: Rücken
  function figur(px, pose, seite, hinten, bild) {
    const rechteck = (x0, x1, h0, h1, rgb) => { for (let h = h0; h <= h1; h++) for (let x = x0; x <= x1; x++) px(x, h, rgb); };
    // M3d: sitzend – alles 4 Pixel tiefer, Oberschenkel nach vorne, Unterschenkel hängen (der Stuhl ist Geometrie)
    if (pose === 'sitzend') { sitzFigur(px, seite, hinten); return; }
    // Beine und Schuhe
    if (seite) {
      rechteck(7, 8, 1, 6, HOSE); px(8, 1, HOSE_D); px(8, 2, HOSE_D);
      rechteck(7, 9, 0, 0, SCHUH);
    } else {
      rechteck(6, 7, 1, 6, HOSE); rechteck(8, 9, 1, 6, HOSE_D);
      rechteck(6, 7, 0, 0, SCHUH); rechteck(8, 9, 0, 0, SCHUH);
    }
    // Oberkörper (Jacke), Saum etwas dunkler
    if (seite) { rechteck(6, 9, 7, 12, JACKE); rechteck(6, 6, 7, 12, JACKE_D); } else { rechteck(5, 10, 7, 12, JACKE); rechteck(5, 10, 7, 7, JACKE_D); }
    // Kopf und Haare
    const kopf = () => {
      if (hinten) { rechteck(6, 9, 13, 16, HAAR); rechteck(6, 9, 13, 13, HAAR_D); return; }
      if (seite) {
        rechteck(6, 9, 13, 16, HAUT); rechteck(6, 7, 14, 16, HAAR); rechteck(6, 9, 16, 16, HAAR); px(9, 13, HAUT_D); px(9, 15, AUGE);
        return;
      }
      rechteck(6, 9, 13, 16, HAUT); rechteck(6, 9, 16, 16, HAAR); px(6, 15, HAAR); px(9, 15, HAAR);
      px(7, 14, AUGE); px(8, 14, AUGE); rechteck(6, 9, 13, 13, HAUT_D);
    };
    kopf();
    const muetze = () => { rechteck(6, 9, 16, 17, MUETZE); rechteck(6, 9, 16, 16, MUETZE_D); px(7, 18, MUETZE); px(8, 18, MUETZE); };
    // Arme: unten (an der Seite), Hände Haut
    const armUnten = (x) => { rechteck(x, x, 8, 12, JACKE_D); px(x, 7, HAUT); };
    const armHoch = (x, schraeg) => {
      if (schraeg) { // Ellbogen seitlich, Hand über dem Kopf
        const dx = x > 7 ? 1 : -1;
        px(x, 12, JACKE_D); px(x + dx, 13, JACKE_D); px(x + dx, 14, JACKE_D); px(x + dx, 15, JACKE_D); px(x + 2 * dx, 16, JACKE_D); px(x + 2 * dx, 17, HAUT);
      } else { rechteck(x, x, 12, 18, JACKE_D); px(x, 19, HAUT); }
    };
    const fahne = (kreuz) => {
      // Stock in der Hand rechts vom Körper, Fahne weht nach rechts (Bild 1: Welle)
      const xs = seite ? 10 : 11;
      rechteck(xs, xs, 9, 25, HOLZ);
      px(xs, 11, HAUT); px(xs - 1, 11, JACKE_D); px(xs - 1, 10, JACKE_D);
      // Fahne 5x5 Pixel: das Kreuz (3x3) sitzt genau in der Mitte
      for (let x = xs + 1; x <= Math.min(15, xs + 5); x++) {
        const welle = bild ? (x % 2 ? 1 : 0) : 0;
        for (let h = 21 - welle; h <= 25 - welle; h++) {
          const fx = x - xs - 1, fh = h - (21 - welle);
          const k = kreuz && ((fx === 2 && fh >= 1 && fh <= 3) || (fh === 2 && fx >= 1 && fx <= 3));
          px(x, h, k ? WEISS : h === 21 - welle ? MUETZE_D : MUETZE);
        }
      }
    };
    if (seite) {
      // im Profil sieht man einen Arm (vorne), je nach Pose
      if (pose === 'winkend') armHoch(8, bild === 1);
      else if (pose === 'jubelnd') armHoch(8, bild === 1);
      else if (pose === 'fotograf') { rechteck(9, 10, 11, 12, JACKE_D); rechteck(10, 11, 14, 15, SCHWARZ); px(10, 13, HAUT); }
      else if (pose === 'fahneKreuz' || pose === 'fahne' || pose === 'posten') fahne(pose === 'fahneKreuz');
      else armUnten(8);
    } else {
      // vorne/hinten: zwei Arme (hinten gespiegelt: rechter Arm erscheint links)
      const r = hinten ? 4 : 11, li = hinten ? 11 : 4;
      if (pose === 'winkend') { armUnten(li); armHoch(r, bild === 1); }
      else if (pose === 'jubelnd') { armHoch(4, bild === 1); armHoch(11, bild === 1); }
      else if (pose === 'fotograf') {
        rechteck(4, 4, 10, 12, JACKE_D); rechteck(11, 11, 10, 12, JACKE_D);
        if (!hinten) { rechteck(6, 9, 14, 15, SCHWARZ); px(7, 15, [90, 90, 96]); px(5, 14, HAUT); px(10, 14, HAUT); }
        else { px(5, 13, HAUT); px(10, 13, HAUT); }
      } else if (pose === 'fahneKreuz' || pose === 'fahne' || pose === 'posten') { armUnten(li); fahne(pose === 'fahneKreuz'); }
      else if (pose === 'muetze') { rechteck(4, 4, 9, 12, JACKE_D); rechteck(11, 11, 9, 12, JACKE_D); } // Hände in den Taschen
      else { armUnten(4); armUnten(11); }
    }
    if (pose === 'muetze' || pose === 'fotograf') muetze();
    // M3d: Warnweste der Streckenposten – zwei helle Reflexstreifen quer über die Jacke
    if (pose === 'posten') {
      const x0 = seite ? 6 : 5, x1 = seite ? 9 : 10;
      for (const h of [9, 11]) for (let x = x0; x <= x1; x++) px(x, h, REFLEX);
    }
  }

  // Sitzende Figur (M3d, Klappstuhl): Kopf und Jacke 4 Pixel tiefer, Knie vorne
  function sitzFigur(px, seite, hinten) {
    const rechteck = (x0, x1, h0, h1, rgb) => { for (let h = h0; h <= h1; h++) for (let x = x0; x <= x1; x++) px(x, h, rgb); };
    if (seite) {
      rechteck(7, 11, 4, 5, HOSE); rechteck(10, 11, 1, 3, HOSE_D); rechteck(10, 12, 0, 0, SCHUH); // Oberschenkel, Unterschenkel
      rechteck(6, 9, 6, 10, JACKE); rechteck(6, 6, 6, 10, JACKE_D);
      rechteck(8, 9, 6, 7, JACKE_D); px(10, 6, HAUT);                                               // Arm auf dem Knie
      rechteck(6, 9, 11, 14, HAUT); rechteck(6, 7, 12, 14, HAAR); rechteck(6, 9, 14, 14, HAAR); px(9, 13, AUGE);
      return;
    }
    if (!hinten) { rechteck(6, 9, 3, 5, HOSE); rechteck(6, 7, 0, 2, HOSE_D); rechteck(8, 9, 0, 2, HOSE_D); px(6, 0, SCHUH); px(7, 0, SCHUH); px(8, 0, SCHUH); px(9, 0, SCHUH); }
    else rechteck(6, 9, 3, 4, HOSE_D);
    rechteck(5, 10, 5, 10, JACKE); rechteck(5, 10, 5, 5, JACKE_D);
    rechteck(4, 4, 6, 9, JACKE_D); rechteck(11, 11, 6, 9, JACKE_D); px(4, 5, HAUT); px(11, 5, HAUT);
    if (hinten) { rechteck(6, 9, 11, 14, HAAR); rechteck(6, 9, 11, 11, HAAR_D); return; }
    rechteck(6, 9, 11, 14, HAUT); rechteck(6, 9, 14, 14, HAAR); px(6, 13, HAAR); px(9, 13, HAAR);
    px(7, 12, AUGE); px(8, 12, AUGE); rechteck(6, 9, 11, 11, HAUT_D);
  }

  return { textur: zuTextur(l, { mipmaps: false }), spalten: ANSICHTEN * BILDER, zeilen: ZUSCHAUER_POSEN.length, zelleM: [1.6, 2.8], pixelM: 0.1 };
}
