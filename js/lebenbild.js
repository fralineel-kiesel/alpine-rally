// Pixel-Bilder für "Leben an der Strecke" (Meilenstein 3d), im Code gezeichnet (keine Bilddateien):
// Alphütte und Heustadel (Bretter, Schindeln, Steinsockel, Fenster), Brunnen, Heurollen, Wegweiser,
// Fan-Banner, Camper, Klappstühle, Unfallautos (Lack, Startnummern, Sponsoren, kaputtes Glas, Felgen,
// Zusatzscheinwerfer), Warndreieck, gelbe Flagge. Ein Bild für EIN Material.
// Alle Namen sind erfunden: keine echten Marken, Logos oder Rallye-Teams.

import { leinwand, setze, zuTextur, hexZuRgb } from './pixel.js';
import { zufall } from './util.js';
import { KLEIN, schreibe as schreibeKlein } from './startzielbild.js';

// Zusätzliche Zeichen zur kleinen 3x5-Schrift (Startnummern, Zeitangaben)
const MEHR = {
  4: ['#.#', '#.#', '###', '..#', '..#'], 6: ['.##', '#..', '###', '#.#', '###'], 7: ['###', '..#', '.#.', '.#.', '.#.'],
  8: ['###', '#.#', '###', '#.#', '###'], 9: ['###', '#.#', '###', '..#', '##.'], V: ['#.#', '#.#', '#.#', '#.#', '.#.'],
  J: ['..#', '..#', '..#', '#.#', '.#.'], Y: ['#.#', '#.#', '.#.', '.#.', '.#.'], '-': ['...', '...', '###', '...', '...'],
  '.': ['...', '...', '...', '...', '.#.'], '!': ['.#.', '.#.', '.#.', '...', '.#.'],
};
const SCHRIFT = { ...KLEIN, ...MEHR };
const schreibe = (px, text, x, y, rgb) => schreibeKlein(px, text, x, y, rgb, SCHRIFT);
const breite = (text) => [...text].reduce((b, z) => b + ((SCHRIFT[z] || SCHRIFT[' '])[0].length + 1), 0) - 1;
// Startnummern gross (5x7), nur Ziffern
const ZIFFERN = {
  0: ['.###.', '#...#', '#..##', '#.#.#', '##..#', '#...#', '.###.'], 1: ['..#..', '.##..', '..#..', '..#..', '..#..', '..#..', '.###.'],
  2: ['.###.', '#...#', '....#', '...#.', '..#..', '.#...', '#####'], 3: ['####.', '....#', '....#', '.###.', '....#', '....#', '####.'],
  4: ['...#.', '..##.', '.#.#.', '#..#.', '#####', '...#.', '...#.'], 7: ['#####', '....#', '...#.', '..#..', '.#...', '.#...', '.#...'],
};

// Erfundene Sponsoren und Fanclubs (Name, Grund, Schrift)
export const LEBEN_SPONSOREN = {
  firn: ['FIRNWERK', '#c8202a', '#f2f0e8'],        // Wrack 1 (rot-weiss)
  murmeli: ['MURMELI OEL', '#1d3f8f', '#f0c020'],  // Wrack 2 (blau-gelb)
  turbo: ['TURBO SENN', '#1c1c1c', '#f0c020'],
  kehre: ['FANCLUB KEHRE 3', '#2c7a3a', '#f2f0e8'], // Fan-Spot Kehren
  pass: ['HOPP HOPP PASSFANS', '#c8202a', '#f2f0e8'], // Fan-Spot Passhöhe
  alm: ['ALMRAUSCH FANS', '#f0c020', '#1c1c1c'],    // Fan-Spot Almweg
};

export function lebenAtlas(seed = 313) {
  const N = 256, NH = 256, RAND = 2;
  const l = leinwand(N, NH);
  const rnd = zufall(seed);
  const rechtecke = {};
  let x0 = 0, y0 = 0, zeileH = 0;
  // Kachel mit wiederholtem Rand (gegen Nähte); null-Pixel bleiben durchsichtig
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
  const hx = hexZuRgb;
  const hell = (rgb, f) => rgb.map((c) => Math.max(0, Math.min(255, Math.round(c * f))));
  const voll = (b, h, f) => (px) => { for (let y = 0; y < h; y++) for (let x = 0; x < b; x++) px(x, y, f(x, y)); };
  const ROT = hx('#c8202a'), WEISS = hx('#f2f0e8'), SCHWARZ = hx('#1c1c1c'), GELB = hx('#f0c020'), GRAU = hx('#a7adb3');

  // --- Hütte und Heustadel --------------------------------------------------------------------
  // Bretter senkrecht, verwittert (dunkles Braun bis Grau), Fugen dunkel. 16x16
  kachel('bretter', 16, 16, (px) => {
    const b0 = [hx('#5e4430'), hx('#6b4f37'), hx('#574030'), hx('#73593f')];
    for (let x = 0; x < 16; x++) {
      const brett = Math.floor(x / 4), fuge = x % 4 === 3;
      const grund = b0[(brett + Math.floor(rnd() * 2)) % 4];
      for (let y = 0; y < 16; y++) px(x, y, fuge ? hx('#33241a') : hell(grund, 0.9 + rnd() * 0.18 - (y > 13 ? 0.12 : 0)));
    }
  });
  // Bretter quer (Giebel, Trog, Holzstapel-Seite)
  kachel('bretterQuer', 16, 8, voll(16, 8, (x, y) => (y % 4 === 3 ? hx('#33241a') : hell(hx('#6b4f37'), 0.88 + rnd() * 0.2))));
  // Schindeldach: Reihen, versetzt, grau-braun. 16x16
  kachel('schindel', 16, 16, (px) => {
    for (let y = 0; y < 16; y++) {
      const reihe = Math.floor(y / 3), vers = reihe % 2 ? 2 : 0;
      for (let x = 0; x < 16; x++) {
        const kante = y % 3 === 2 || (x + vers) % 4 === 0;
        px(x, y, kante ? hx('#3a332d') : hell(hx(rnd() < 0.5 ? '#6d6259' : '#7b6f63'), 0.9 + rnd() * 0.18));
      }
    }
  });
  // Steinsockel: Bruchsteine grau mit dunklen Fugen. 16x8
  kachel('steinmauer', 16, 8, (px) => {
    for (let y = 0; y < 8; y++) for (let x = 0; x < 16; x++) {
      const fuge = y % 4 === 3 || (x + (Math.floor(y / 4) % 2) * 3) % 6 === 0;
      px(x, y, fuge ? hx('#4a4741') : hell(hx(rnd() < 0.5 ? '#8f8a80' : '#a29c90'), 0.9 + rnd() * 0.16));
    }
  });
  // kleines Fenster: Rahmen hell, Sprossenkreuz, Scheibe dunkel, rot-weisse Läden links und rechts. 12x8
  kachel('hfenster', 12, 8, (px) => {
    for (let y = 0; y < 8; y++) for (let x = 0; x < 12; x++) {
      let c;
      if (x < 3 || x > 8) c = (y + (x < 3 ? x : 11 - x)) % 2 ? ROT : WEISS;      // Fensterläden (geflammt)
      else if (x === 3 || x === 8 || y === 0 || y === 7 || x === 5 || x === 6 || y === 3 || y === 4) c = hx('#e9e2d2');
      else c = y < 3 && x === 4 ? hx('#6f8ea2') : hx('#26343f');
      px(x, y, c);
    }
  });
  // Tür: Bretter, Beschlag. 8x14
  kachel('htuer', 8, 14, voll(8, 14, (x, y) => (x === 0 || x === 7 || y === 0 ? hx('#3a2a1e') : (y === 4 || y === 10) && x > 0 && x < 6 ? hx('#2a2a2a') : hell(hx('#7a5a3c'), x % 3 === 2 ? 0.75 : 1))));
  // Holzstapel: Stirnseiten der Scheite (helle Ringe). 8x8
  kachel('holzende', 8, 8, (px) => {
    for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
      const cx = (x % 4) - 1.5, cy = (y % 4) - 1.5, r = Math.hypot(cx, cy);
      px(x, y, r > 1.9 ? hx('#3b2a1c') : r < 0.8 ? hx('#9a7348') : hx('#c49a63'));
    }
  });
  kachel('rinde', 8, 4, voll(8, 4, () => hell(hx('#5a4130'), 0.85 + rnd() * 0.25)));
  kachel('wasser', 8, 4, voll(8, 4, (x, y) => (y === 0 && x % 3 === 1 ? hx('#b9d8e8') : hell(hx('#3f78a0'), 0.92 + rnd() * 0.12))));
  // Heurolle (Rundballen): Seite mit Halmen quer, Stirnseite als Spirale. 16x8 / 8x8
  const STROH = ['#d8bd6a', '#c7a955', '#e6d088', '#a98c40'].map(hx);
  kachel('rolleSeite', 16, 8, voll(16, 8, (x, y) => hell(STROH[Math.floor(rnd() * 3)], (y === 0 || y === 7 ? 0.85 : 1) * (rnd() < 0.07 ? 0.78 : 1))));
  kachel('rolleEnde', 8, 8, (px) => {
    for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
      const cx = x - 3.5, cy = y - 3.5, r = Math.hypot(cx, cy), w = Math.atan2(cy, cx);
      const spirale = Math.round(r * 1.4 + w / Math.PI) % 2;
      px(x, y, r > 3.9 ? null : spirale ? STROH[0] : STROH[2]);
    }
  });
  // Stein (Steinmännchen, Findlinge, Brunnen): grau, fleckig. 8x8
  kachel('fels', 8, 8, voll(8, 8, () => hell(hx(rnd() < 0.3 ? '#6f6b64' : rnd() < 0.5 ? '#8a857c' : '#9a958b'), 0.9 + rnd() * 0.15)));
  kachel('flechte', 8, 8, voll(8, 8, () => (rnd() < 0.18 ? hx('#a4a65a') : hell(hx('#858077'), 0.88 + rnd() * 0.18))));
  // Wegweiser (gelb, schwarze Schrift, Spitze rechts): je Ziel eine Kachel 30x6
  for (const [name, text] of [['weg1', 'ALP 1 STD'], ['weg2', 'FURGGA 2 STD'], ['weg3', 'SEELI 40 MIN']]) {
    kachel(name, 32, 7, (px) => {
      for (let y = 0; y < 7; y++) for (let x = 0; x < 32; x++) {
        const spitze = x > 27 && Math.abs(y - 3) > (31 - x);
        if (!spitze) px(x, y, y === 0 || y === 6 ? hell(GELB, 0.8) : GELB);
      }
      schreibe(px, text, 2, 1, SCHWARZ);
    });
  }

  // --- Fan-Spots ------------------------------------------------------------------------------
  // Fan-Banner (Stoff, 56x9): Name gross genug für das kleine Bild
  for (const [k, [text, grund, schrift]] of Object.entries(LEBEN_SPONSOREN)) {
    const G = hx(grund), S = hx(schrift), b = Math.max(40, breite(text) + 6);
    kachel(`banner_${k}`, b, 7, (px) => {
      for (let y = 0; y < 7; y++) for (let x = 0; x < b; x++) px(x, y, y === 0 || y === 6 ? hell(G, 0.72) : hell(G, 0.97 + rnd() * 0.06));
      schreibe(px, text, Math.floor((b - breite(text)) / 2), 1, S);
    });
  }
  kachel('band', 32, 3, voll(32, 3, (x, y) => (Math.floor((x + y) / 4) % 2 ? WEISS : ROT)));
  kachel('stange', 4, 16, voll(4, 16, (x, y) => hell(Math.floor(y / 4) % 2 ? WEISS : ROT, x === 3 ? 0.8 : 1)));
  kachel('stoff', 4, 4, voll(4, 4, () => hell(WEISS, 0.95 + rnd() * 0.05)));
  kachel('metall', 4, 4, voll(4, 4, (x) => hell(GRAU, x === 0 ? 1.1 : x === 3 ? 0.8 : 1)));
  kachel('fahneKreuz', 12, 8, voll(12, 8, (x, y) => ((x >= 5 && x <= 6 && y >= 1 && y <= 6) || (y >= 3 && y <= 4 && x >= 3 && x <= 8) ? WEISS : ROT)));
  // Zeltdach grün-weiss
  kachel('dachGruen', 16, 16, voll(16, 16, (x) => hell(Math.floor(x / 4) % 2 ? WEISS : hx('#2c7a3a'), 0.96 + rnd() * 0.06)));
  // Camper: Wohnwagen-Streifen (braun-orange, 70er/80er), Tür, Fenster
  kachel('camperStreifen', 16, 6, voll(16, 6, (x, y) => (y < 2 ? hx('#8a4a1e') : y < 4 ? hx('#d8782a') : hx('#e7b04a'))));
  kachel('ctuer', 6, 12, voll(6, 12, (x, y) => (x === 0 || y === 0 || x === 5 ? hell(GRAU, 0.7) : y > 2 && y < 6 && x > 0 && x < 5 ? hx('#26343f') : x === 4 && y === 7 ? SCHWARZ : hx('#ece8dc'))));

  // --- Unfallautos ----------------------------------------------------------------------------
  kachel('lack', 4, 4, voll(4, 4, () => hell(WEISS, 0.97 + rnd() * 0.03)));
  kachel('kratzer', 8, 8, voll(8, 8, () => (rnd() < 0.06 ? hx('#6a6a6a') : rnd() < 0.12 ? hx('#b4b4b0') : hell(WEISS, 0.93 + rnd() * 0.07)))); // leicht verschrammter Lack (Farbe über die Ecken)
  kachel('scheibe', 8, 4, voll(8, 4, (x, y) => (y === 0 && x > 1 && x < 5 ? hx('#6d8ca0') : hx('#22303c'))));
  // zerbrochene Scheibe: Löcher (durchsichtig), helle Sprünge sternförmig. 12x8
  kachel('scheibeKaputt', 12, 8, (px) => {
    for (let y = 0; y < 8; y++) for (let x = 0; x < 12; x++) {
      const dx = x - 4, dy = y - 3, r = Math.hypot(dx, dy);
      const strahl = Math.abs(dy * 3 - dx) < 0.8 || Math.abs(dy + dx * 0.4) < 0.6 || Math.abs(dx) < 0.5 || (r > 3.3 && r < 4.1);
      if (r < 1.6 || (x > 8 && y > 4)) continue;          // Loch
      px(x, y, strahl ? hx('#c9d6dc') : (x + y) % 3 ? hx('#2a3a46') : hx('#4d6474'));
    }
  });
  kachel('gummi', 4, 4, voll(4, 4, () => hx(rnd() < 0.5 ? '#1c1c1e' : '#2a2a2e')));
  // Felge (Rallye-Look): heller Ring, Speichen, dunkle Nabe. 8x8
  kachel('felge', 8, 8, (px) => {
    for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
      const dx = x - 3.5, dy = y - 3.5, r = Math.hypot(dx, dy);
      if (r > 3.9) px(x, y, hx('#1c1c1e'));
      else if (r < 1.1) px(x, y, hx('#3a3a3c'));
      else px(x, y, (Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) % 2 === 0 || r > 3.1) ? hx('#e4e0d4') : hx('#5a5a5e'));
    }
  });
  kachel('licht', 4, 2, voll(4, 2, () => hx('#f6efc0')));
  // Zusatzscheinwerfer: runde gelbe Lampe mit schwarzem Ring. 6x6
  kachel('zusatz', 6, 6, (px) => {
    for (let y = 0; y < 6; y++) for (let x = 0; x < 6; x++) { const r = Math.hypot(x - 2.5, y - 2.5); px(x, y, r > 2.6 ? hx('#141414') : r < 1 ? hx('#fff6c8') : hx('#f2d24a')); }
  });
  kachel('zusatzKaputt', 6, 6, (px) => {
    for (let y = 0; y < 6; y++) for (let x = 0; x < 6; x++) { const r = Math.hypot(x - 2.5, y - 2.5); px(x, y, r > 2.6 ? hx('#141414') : (x + y) % 2 ? hx('#3a3a30') : hx('#c9c9a0')); }
  });
  // Kühlergrill (erfunden: Lamellen quer, kein Markenzeichen)
  kachel('grill', 8, 4, voll(8, 4, (x, y) => (y % 2 ? hx('#1a1a1c') : hx('#4a4a50'))));
  kachel('schwarz', 4, 4, voll(4, 4, () => hell(hx('#1e1f22'), 0.95 + rnd() * 0.1)));
  kachel('kaefig', 4, 4, voll(4, 4, () => hx('#d8d8d0')));
  kachel('motor', 8, 8, voll(8, 8, (x, y) => ((x + y) % 4 === 0 ? hx('#9a958b') : rnd() < 0.3 ? hx('#5a4a3a') : hx('#2c2c2e'))));
  // Startnummer: weisse Scheibe mit schwarzer Zahl (Ecken durchsichtig). 14x10
  for (const n of ['7', '14', '23']) {
    kachel(`nr${n}`, 14, 10, (px) => {
      for (let y = 0; y < 10; y++) for (let x = 0; x < 14; x++) {
        const r = Math.hypot((x - 6.5) / 6.6, (y - 4.5) / 4.8);
        if (r <= 1) px(x, y, r > 0.86 ? hx('#1c1c1c') : WEISS);
      }
      const b = n.length * 6 - 1;
      let xx = Math.floor((14 - b) / 2);
      for (const z of n) {
        const m = ZIFFERN[z];
        for (let y = 0; y < 7; y++) for (let k = 0; k < 5; k++) if (m[y][k] === '#') px(xx + k, 1 + y, SCHWARZ);
        xx += 6;
      }
    });
  }
  // Sponsor-Streifen fürs Auto (Schrift auf Farbe), Schmutzfänger
  for (const k of ['firn', 'murmeli', 'turbo']) {
    const [text, grund, schrift] = LEBEN_SPONSOREN[k];
    const b = breite(text) + 4;
    kachel(`sp_${k}`, b, 7, (px) => {
      for (let y = 0; y < 7; y++) for (let x = 0; x < b; x++) px(x, y, hx(grund));
      schreibe(px, text, 2, 1, hx(schrift));
    });
  }
  kachel('schmutz', 6, 8, voll(6, 8, (x, y) => (y >= 2 && y <= 4 && x > 0 && x < 5 ? WEISS : hx('#151515'))));
  // Warndreieck: roter Rand, Mitte rot-durchscheinend (hier hell), unten Spitze. 8x8
  kachel('warn', 8, 8, voll(8, 8, (x, y) => (y > 5 || x < 2 || x > 5 ? hx('#e0262a') : hx('#f2d0c8'))));
  kachel('fahneGelb', 8, 6, voll(8, 6, (x, y) => hell(hx('#f4d21a'), y === 5 ? 0.85 : 1)));

  const textur = zuTextur(l);
  return {
    textur,
    kachel(name) {
      const r = rechtecke[name];
      if (!r) throw new Error(`Atlas: Kachel ${name} fehlt`);
      return { u0: r.x / N, u1: (r.x + r.b) / N, v0: 1 - (r.y + r.h) / NH, v1: 1 - r.y / NH };
    },
    hat: (name) => !!rechtecke[name],
  };
}
