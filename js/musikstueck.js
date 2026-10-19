// Menü-Musik (M7b): Notendaten des Stücks "Passfahrt" – Eigenkomposition im Stil 80er-Arcade-Rally (a-Moll, 138 BPM).
// Gespielt von js/musik.js. Hier stehen nur Daten: Abschnitte, Akkorde (einer pro Takt), Melodie und Gegenstimme
// als Noten, Bass/Arpeggio/Schlagzeug als Muster. Raster: 16tel (16 pro Takt).
//
// Noten-Schreibweise je Takt: 'A4:2 R:1 C5:2 ...' = Note (A4 = 440 Hz, '#' = erhöht) und Länge in 16teln, R = Pause.
// Jeder Takt hat genau 16 16tel (prüft tools/ton-umgebung-test.mjs). Tonumfang Melodie a (A3, 220 Hz) bis a'' (A5, 880 Hz),
// im Abschnitt D bis h'' (B5, 988 Hz); Bass a1 (A1, 55 Hz) bis a (A3, 220 Hz).
// Erlaubte Töne: a-Moll (A B C D E F G), dazu gis über E-Dur; im Abschnitt D (h-Moll, ein Ganzton höher) die h-Moll-Tonleiter
// (B C# D E F# G A), dazu ais über Fis-Dur.

// Akkorde: Grundton (Halbtöne über C) und Töne (Halbtöne über dem Grundton)
export const AKKORDE = {
  Am: [9, [0, 3, 7]], F: [5, [0, 4, 7]], G: [7, [0, 4, 7]], Dm: [2, [0, 3, 7]], E: [4, [0, 4, 7]], Em: [4, [0, 3, 7]],
  Bm: [11, [0, 3, 7]], A: [9, [0, 4, 7]], 'F#': [6, [0, 4, 7]],
};
// Tonleitern (Halbtöne über C) und erlaubte Ausnahmen je Akkord
export const TONARTEN = {
  a: { leiter: [9, 11, 0, 2, 4, 5, 7], ausnahmen: { E: [8] } },          // a-Moll natürlich, gis über E
  h: { leiter: [11, 1, 2, 4, 6, 7, 9], ausnahmen: { 'F#': [10] } },      // h-Moll natürlich, ais über Fis
};

// --- Melodien (Lead) und Gegenstimmen, je Takt ein Text ---
const A_LEAD = [
  'A4:2 R:1 A4:1 C5:2 R:2 B4:2 C5:2 E5:4',   // Am  Frage
  'D5:2 C5:1 B4:1 C5:4 R:8',                 // Am
  'A4:2 R:1 A4:1 C5:2 R:2 D5:2 C5:2 A4:4',   // F   Antwort
  'B4:2 C5:1 D5:1 B4:4 G4:4 R:4',            // G
  'A4:2 R:1 A4:1 C5:2 R:2 B4:2 C5:2 E5:4',   // Am  Frage
  'F5:2 E5:2 D5:2 C5:2 E5:4 R:4',            // Am
  'D5:2 R:1 D5:1 F5:2 R:2 E5:2 D5:2 C5:2 A4:2', // Dm Antwort
  'B4:2 C5:1 B4:1 G#4:4 E4:4 R:4',           // E
];
const A2_LEAD = [ // A': gleiche Fragen, Antworten höher und anders
  'A4:2 R:1 A4:1 C5:2 R:2 B4:2 C5:2 E5:4',
  'G5:2 E5:1 D5:1 E5:4 R:8',
  'A4:2 R:1 A4:1 C5:2 R:2 F5:2 E5:2 C5:4',
  'D5:2 E5:1 D5:1 B4:4 D5:4 R:4',
  'C5:2 R:1 C5:1 E5:2 R:2 D5:2 E5:2 G5:2 A5:2',
  'G5:2 E5:2 D5:2 C5:2 E5:4 R:4',
  'F5:2 R:1 F5:1 A5:2 R:2 G5:2 F5:2 E5:2 D5:2',
  'E5:2 D5:1 C5:1 B4:4 G#4:4 R:4',
];
const B_LEAD = [ // Aufbau: steigende Linie
  'A4:3 A4:1 C5:4 A4:2 C5:2 D5:4',           // F
  'D5:3 D5:1 B4:4 D5:2 E5:2 G5:4',           // G
  'E5:3 E5:1 C5:4 E5:2 F5:2 G5:2 A5:2',      // Am
  'A5:8 G5:2 E5:2 R:4',                      // Am
  'F5:3 F5:1 E5:2 D5:2 C5:2 D5:2 F5:4',      // F
  'G5:3 G5:1 F5:2 E5:2 D5:2 E5:2 G5:4',      // G
  'G#5:4 E5:2 G#5:2 A5:4 G#5:4',             // E
  'E5:6 D5:2 B4:4 R:4',                      // E
];
const C_LEAD = [ // Refrain: Hook = 2-Takt-Motiv (3+3+2, mit Pause), zweimal gleich, beim dritten Mal (Takt 7-8) variiert
  'E5:3 E5:3 G5:2 A5:4 R:2 G5:2',            // Am  Motiv
  'E5:3 D5:3 B4:2 D5:6 R:2',                 // G
  'C5:3 C5:3 D5:2 F5:4 R:2 E5:2',            // F   Antwort
  'E5:3 D5:3 B4:2 G#4:6 R:2',                // E
  'E5:3 E5:3 G5:2 A5:4 R:2 G5:2',            // Am  Motiv (zweites Mal)
  'E5:3 D5:3 B4:2 D5:6 R:2',                 // G
  'A5:3 A5:3 G5:2 F5:4 R:2 E5:2',            // F   Motiv variiert (drittes Mal)
  'G#5:3 E5:3 D5:2 E5:4 R:4',                // E
];
const C_GEGEN = [ // Gegenstimme im Refrain (Kanal Arpeggio): absteigende Linien unter der Melodie
  'C5:6 B4:2 A4:8', 'B4:6 A4:2 G4:8', 'A4:6 G4:2 F4:8', 'G#4:6 A4:2 B4:8',
  'C5:6 B4:2 A4:8', 'B4:6 C5:2 D5:8', 'C5:6 B4:2 A4:8', 'B4:6 A4:2 G#4:8',
];
const D2_LEAD_ENDE = [ // C'': wie D, aber Takt 5, 7 und 8 anders (Höhepunkt bis h'')
  'D5:2 F#5:1 D5:1 F#5:2 A5:2 B5:4 R:2 A5:2', // Bm (Takt 5)
  'B5:3 B5:3 A5:2 G5:4 R:2 F#5:2',            // G  (Takt 7)
  'A#5:3 F#5:3 E5:2 F#5:8',                   // F# (Takt 8)
];
const RUECK_LEAD = [
  'E5:4 D5:2 B4:2 G4:4 B4:4',                // Em
  'A4:4 C5:4 D5:2 C5:2 A4:4',                // F
  'B4:8 G#4:4 R:4',                          // E
  'R:16',                                    // E   Stille, Schlagzeug-Fill
];
const AUSKLANG_LEAD = [ // Zielbildschirm: ruhige Schleife, sanfte lange Töne
  'E5:8 C5:8', 'B4:8 A4:4 R:4', 'F5:8 E5:4 D5:4', 'A4:12 R:4',
  'C5:8 A4:8', 'C5:4 D5:4 C5:4 R:4', 'B4:8 G#4:8', 'E4:12 R:4',
];

// Ganzton höher (Abschnitt D): Text-Noten um 2 Halbtöne verschieben (mit Kreuzen geschrieben)
const NAMEN = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const STUFE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
export function notenNummer(n) { // 'A4' -> 69 (MIDI), 'R' -> -1
  const m = /^([A-G])(#|b)?(\d)$/.exec(n);
  if (!m) return -1;
  return 12 * (Number(m[3]) + 1) + STUFE[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
}
const notenName = (k) => `${NAMEN[k % 12]}${Math.floor(k / 12) - 1}`;
const hoeher = (takte, h) => takte.map((t) => t.split(' ').map((x) => {
  const [n, l] = x.split(':');
  return n === 'R' ? x : `${notenName(notenNummer(n) + h)}:${l}`;
}).join(' '));

const D_LEAD = hoeher(C_LEAD, 2), D_GEGEN = hoeher(C_GEGEN, 2);
const D2_LEAD = [...D_LEAD.slice(0, 4), D2_LEAD_ENDE[0], D_LEAD[5], D2_LEAD_ENDE[1], D2_LEAD_ENDE[2]];

// --- Schlagzeug-Muster (16 Schritte): k = Kick, s = Snare, h = Hi-Hat zu, o = Hi-Hat offen.
// X = betont, x = normal, g = leise (Ghost), . = nichts
export const SCHLAGZEUG = {
  intro: { k: 'x.....x.x.......', s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.', o: '................' },
  strophe: { k: 'x.....x.x.....x.', s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.', o: '..............o.' },
  aufbau: { k: 'x..x..x.x..x..x.', s: '....x.......x..g', h: 'XgxgXgxgXgxgXgxg', o: '................' },
  refrain: { k: 'x...x...x...x...', s: '....X.......X...', h: 'xg.gxg.gxg.gxg.g', o: '..o...o...o...o.' },
  schluss: { k: 'x...x...x...x..x', s: '....X..g....X.g.', h: 'xg.gxg.gxg.gxg.g', o: '..o...o...o...o.' },
  fill: { k: 'x.......x.....x.', s: '....x...x.xgxXxX', h: 'x.x.x.x.........', o: '................' },
};

// --- Abschnitte (76 Takte = 2:12 bei 138 BPM). Muster: arp = Arpeggio auf dem Akkord ('gegen' = Gegenstimme),
// bass = 'pump' (Achtel: Grundton auf der Eins/Zählzeit, Oktave/Quinte dazwischen), 'viertel', 'halb';
// schlagzeug = Muster oben oder null; fill = letzter Takt jeder 8er-Gruppe (und kurzer Abschnitte) mit Fill;
// voll = Melodie mit Oktave darunter (noch voller); duty = Tastverhältnis der Melodie-Pulswelle; staerke = alle Noten mal so viel
export const ABSCHNITTE = [
  { name: 'Intro', kurz: 'intro', tonart: 'a', akkorde: ['Am', 'Am', 'F', 'G'], lead: null, arp: 'auf', arpAb: 2, bass: 'pump', schlagzeug: 'intro', fill: true },
  { name: 'A', kurz: 'A', tonart: 'a', akkorde: ['Am', 'Am', 'F', 'G', 'Am', 'Am', 'Dm', 'E'], lead: A_LEAD, arp: 'auf', bass: 'pump', schlagzeug: 'strophe', fill: true, duty: 0.25 },
  { name: 'B', kurz: 'B', tonart: 'a', akkorde: ['F', 'G', 'Am', 'Am', 'F', 'G', 'E', 'E'], lead: B_LEAD, arp: 'auf', bass: 'pump', schlagzeug: 'aufbau', fill: true, duty: 0.25 },
  { name: 'C', kurz: 'C', tonart: 'a', akkorde: ['Am', 'G', 'F', 'E', 'Am', 'G', 'F', 'E'], lead: C_LEAD, arp: 'gegen', gegen: C_GEGEN, bass: 'pump', schlagzeug: 'refrain', fill: true, duty: 0.125 },
  { name: "A'", kurz: 'A2', tonart: 'a', akkorde: ['Am', 'Am', 'F', 'G', 'Am', 'Am', 'Dm', 'E'], lead: A2_LEAD, arp: 'auf', bass: 'pump', schlagzeug: 'strophe', fill: true, duty: 0.25 },
  { name: 'Break', kurz: 'break', tonart: 'a', akkorde: ['Dm', 'Dm', 'E', 'E'], lead: null, arp: 'auf', bass: 'viertel', schlagzeug: null, fill: false, riser: 3, staerke: 1.3 },
  { name: "B'", kurz: 'B2', tonart: 'a', akkorde: ['F', 'G', 'Am', 'Am', 'F', 'G', 'E', 'E'], lead: B_LEAD, arp: 'auf', bass: 'pump', schlagzeug: 'aufbau', fill: true, duty: 0.25 },
  { name: "C'", kurz: 'C2', tonart: 'a', akkorde: ['Am', 'G', 'F', 'E', 'Am', 'G', 'F', 'E'], lead: C_LEAD, arp: 'gegen', gegen: C_GEGEN, bass: 'pump', schlagzeug: 'refrain', fill: true, duty: 0.125 },
  { name: 'D', kurz: 'D', tonart: 'h', akkorde: ['Bm', 'A', 'G', 'F#', 'Bm', 'A', 'G', 'F#'], lead: D_LEAD, arp: 'gegen', gegen: D_GEGEN, bass: 'pump', schlagzeug: 'schluss', fill: true, duty: 0.125, voll: true },
  { name: "C''", kurz: 'C3', tonart: 'h', akkorde: ['Bm', 'A', 'G', 'F#', 'Bm', 'A', 'G', 'F#'], lead: D2_LEAD, arp: 'gegen', gegen: D_GEGEN, bass: 'pump', schlagzeug: 'schluss', fill: true, duty: 0.125, voll: true },
  { name: 'Rückführung', kurz: 'rueck', tonart: 'a', akkorde: ['Em', 'F', 'E', 'E'], lead: RUECK_LEAD, arp: 'auf', bass: 'pump', schlagzeug: 'strophe', fill: true, duty: 0.25 },
];
// Zielbildschirm: ruhiger Ausklang (nicht Teil der 76 Takte), Schleife; Arpeggio und Bass wie im Break, sanfte Melodie
export const AUSKLANG = {
  name: 'Ausklang', kurz: 'ausklang', tonart: 'a', akkorde: ['Am', 'Am', 'Dm', 'Dm', 'F', 'F', 'E', 'E'],
  lead: AUSKLANG_LEAD, arp: 'auf', bass: 'halb', schlagzeug: null, fill: false, duty: 0.5, sanft: true,
};
