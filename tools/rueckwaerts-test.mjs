// Rückwärts-Tempo je Untergrund (Meilenstein 5a.1).  node tools/rueckwaerts-test.mjs [--wurzel <ordner>]
// Läuft ohne Browser: echte Fahrphysik (js/physics.js) und Getriebe, ebener Boden.
//   1. Ebener Asphalt, aus dem Stand Bremse/Rückwärts voll (Heck voraus): Höchsttempo und Zeit bis dahin
//   2. Gras, Bankett, Schotter, Wiesenweg: Rückwärts-Höchsttempo weiter höchstens 6 m/s (wie seit M2c)
//   3. Übergang: mit vollem Rückwärtstempo vom Asphalt aufs Bankett / Gras – kein Ruck (Verzögerung pro Schritt
//      höchstens so gross wie die Reibung dort, Grenzwert unten). Zum Vergleich: ein harter Deckel (wie vor M5a.1)
//   4. Getriebe (Gang R, Drehzahl) und Anzeige (km/h, mph) beim neuen Höchsttempo
// Untergrund-Objekte ohne "rueckwaertsMax" (z. B. aus gras-test) fahren wie bisher: Deckel 6 m/s.

import path from 'node:path';
import { pathToFileURL } from 'node:url';

const arg = (name) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : null; };
const wurzel = arg('--wurzel') ? path.resolve(arg('--wurzel')) : path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const lade = (datei) => import(pathToFileURL(path.join(wurzel, 'js', datei)).href);
const { CONFIG } = await lade('config.js');
const { Fahrphysik } = await lade('physics.js');
const { Getriebe } = await lade('getriebe.js');

const DT = 1 / 120;
const f2 = (n) => n.toFixed(2);
// Untergrund wie in main.js an die Physik gegeben
function boden(art) {
  const u = CONFIG.untergrund[art];
  return { grip: u.grip, rollen: u.rollen, rollenTempo: u.rollenTempo, steigung: 0, rueckwaerts: u.rueckwaerts ?? 1, heck: u.heck ?? 1,
    stabilitaet: u.stabilitaet ?? 1, geradeaus: u.geradeaus ?? 1, rueckwaertsMax: u.rueckwaertsMax ?? 1 };
}
const RUECK = { gas: 0, bremse: 1, lenkung: 0, handbremse: false };
function neu() { const p = new Fahrphysik(); p.reset(0, 0, 0); p.g = new Getriebe(); return p; }
const schritt = (p, e, b) => p.schritt(DT, e, b, p.g.schritt(DT, e, p.vVor, p.tempo, b.grip));

let fehler = 0;
const pruefe = (ok, text) => { console.log(`${ok ? 'OK    ' : 'FEHLER'} ${text}`); if (!ok) fehler++; };
console.log(`Fahrphysik aus: ${wurzel}`);
const deckel = CONFIG.auto.rueckwaertsTempo;

// 1. + 2. Höchsttempo rückwärts je Untergrund, Zeit bis 99 % davon
const erg = {};
for (const art of ['asphalt', 'bankett', 'gras', 'schotter', 'wiesenweg'].filter((a) => CONFIG.untergrund[a])) {
  const p = neu(), b = boden(art);
  let max = 0, t99 = null, t = 0;
  const ziel = deckel * b.rueckwaertsMax;
  for (; t < 8; t += DT) {
    schritt(p, RUECK, b);
    max = Math.max(max, -p.vVor);
    if (t99 == null && -p.vVor >= ziel * 0.99) t99 = t + DT;
  }
  erg[art] = { max, t99, ziel };
  console.log(`  ${art.padEnd(10)} rückwärts höchstens ${f2(max)} m/s (${(max * 3.6).toFixed(1)} km/h), 99 % davon nach ${t99 == null ? '–' : f2(t99) + ' s'}`);
}
const a = erg.asphalt;
pruefe(Math.abs(a.max - 9) < 0.3, `Asphalt eben: Höchsttempo rückwärts ca. 9 m/s (${f2(a.max)} m/s = ${(a.max * 3.6).toFixed(1)} km/h, Richtwert)`);
console.log(`       Zeit aus dem Stand bis ${f2(a.max)} m/s: ${f2(a.t99)} s (bis 99 %; Beschleunigung ${CONFIG.auto.rueckwaertsBeschl} m/s² unverändert)`);
for (const art of ['bankett', 'gras', 'schotter', 'wiesenweg']) if (erg[art]) pruefe(erg[art].max <= deckel + 1e-6, `${art}: weiter höchstens ${deckel} m/s (${f2(erg[art].max)} m/s)`);
// Untergrund-Objekt ohne rueckwaertsMax (wie gras-test, belag-test): Deckel wie bisher
{
  const p = neu(), b = boden('asphalt');
  delete b.rueckwaertsMax;
  let max = 0;
  for (let t = 0; t < 6; t += DT) { schritt(p, RUECK, b); max = Math.max(max, -p.vVor); }
  pruefe(Math.abs(max - deckel) < 1e-6, `Untergrund ohne "rueckwaertsMax" (alte Test-Werkzeuge): Deckel wie bisher ${deckel} m/s (${f2(max)} m/s)`);
}

// 3. Übergang Asphalt -> Bankett / Gras mit vollem Rückwärtstempo
function uebergang(nach, hart) {
  const p = neu(), bA = boden('asphalt'), bN = boden(nach);
  for (let t = 0; t < 6; t += DT) schritt(p, RUECK, bA);
  const v0 = -p.vVor;
  let maxVerz = 0, t = 0, unter = null;
  for (; t < 4; t += DT) {
    const vor = -p.vVor;
    if (hart) p.rueckDeckel = 0; // wie vor M5a.1: harter Deckel ohne Gedächtnis
    schritt(p, RUECK, bN);
    maxVerz = Math.max(maxVerz, (vor + p.vVor) / DT); // Tempoverlust pro Sekunde in diesem Schritt
    if (unter == null && -p.vVor <= deckel + 1e-3) unter = t + DT;
  }
  return { v0, maxVerz, unter, ende: -p.vVor };
}
const GRENZE = 6; // m/s²: höchstens so stark darf das Tempo beim Belagwechsel pro Schritt sinken (Gras-Reibung ca. 3.5)
for (const nach of ['bankett', 'gras']) {
  const w = uebergang(nach, false), h = uebergang(nach, true);
  console.log(`  ${nach}: mit ${f2(w.v0)} m/s rückwärts vom Asphalt drauf -> grösste Verzögerung ${f2(w.maxVerz)} m/s² (${f2(w.maxVerz * DT * 100)} cm/s pro Schritt),` +
    ` nach ${w.unter == null ? '–' : f2(w.unter) + ' s'} bei ${deckel} m/s, nach 4 s ${f2(w.ende)} m/s; mit hartem Deckel wären es ${f2(h.maxVerz)} m/s² (Sprung in einem Schritt)`);
  pruefe(w.maxVerz <= GRENZE && w.ende <= deckel + 1e-6, `Übergang Asphalt -> ${nach}: kein Ruck (höchstens ${GRENZE} m/s² pro Schritt), danach wieder höchstens ${deckel} m/s`);
}

// 4. Getriebe und Anzeige bei vollem Rückwärtstempo auf Asphalt
{
  const p = neu(), b = boden('asphalt');
  for (let t = 0; t < 6; t += DT) schritt(p, RUECK, b);
  const kmh = p.tempo * 3.6, mph = kmh / 1.609344, rpm = p.g.drehzahl;
  console.log(`  Anzeige bei ${f2(p.tempo)} m/s rückwärts: Gang ${p.g.anzeige}, ${Math.round(rpm)} U/min, ${Math.round(kmh)} km/h, ${Math.round(mph)} mph`);
  pruefe(p.g.anzeige === 'R' && rpm > CONFIG.getriebe.leerlauf && rpm < CONFIG.getriebe.nennDrehzahl, `Gang R, Drehzahl zwischen Leerlauf und ${CONFIG.getriebe.nennDrehzahl} U/min`);
  pruefe(kmh < CONFIG.hud.tacho.tempoMax && mph < CONFIG.hud.tacho.tempoMaxMph, `Tacho: ${Math.round(kmh)} km/h / ${Math.round(mph)} mph liegen auf der Skala (bis ${CONFIG.hud.tacho.tempoMax} km/h / ${CONFIG.hud.tacho.tempoMaxMph} mph)`);
}
console.log(fehler ? `\n${fehler} Prüfung(en) NICHT erfüllt.` : '\nAlle Prüfungen erfüllt.');
process.exit(fehler ? 1 : 0);
