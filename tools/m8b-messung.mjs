// Fahrmessung Meilenstein 8b: Audan Quarto (Profil rt4) gegen prototyp, je M8a (0.8a) und M8b (jetzt), mit den Zielen
// aus dem Auftrag M8b Teil C.
//
//   node tools/m8b-messung.mjs --alt <ordner 0.8a>   misst 0.8a (Physik und Testfahrer) und jetzt, schreibt
//                                                    tools/m8b-messung.json und screenshots/m8b/80-messtabelle.md/.png
//   node tools/m8b-messung.mjs                       nur jetzt messen, die 0.8a-Werte aus tools/m8b-messung.json
//   --schnell                                        ohne Testfahrer (nur Physik)
//
// Physik ohne Browser (tools/fahrmessung.js), Testfahrer mit tools/testfahrer.mjs (Headless-Browser).
// Das Spiel selbst lädt diese Datei nicht.

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { WURZEL, starteSpiel } from './spiel-browser.mjs';
import { baueMessung, alleMessungen } from './fahrmessung.js';

const arg = (name) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : null; };
const ALT = arg('--alt') ? path.resolve(arg('--alt')) : null;
const schnell = process.argv.includes('--schnell');
const DATEI = path.join(WURZEL, 'tools/m8b-messung.json');
const ORDNER = path.join(WURZEL, 'screenshots/m8b');
const zeitZahl = (t) => { const [m, s] = t.split(':'); return +m * 60 + +s; };
const fmtZeit = (t) => (t == null ? '--' : `${Math.floor(t / 60)}:${(t % 60).toFixed(2).padStart(5, '0')}`);

// Physik: Profile prototyp und rt4 einer Version (eigene Kopie der Module je Ordner)
async function physik(wurzel) {
  const lade = (d) => import(pathToFileURL(path.join(wurzel, 'js', d)).href);
  const { CONFIG, VERSION } = await lade('config.js');
  const { Fahrphysik } = await lade('physics.js');
  const { Getriebe } = await lade('getriebe.js');
  const fp = await lade('fahrprofil.js');
  const m = baueMessung({ CONFIG, Fahrphysik, Getriebe });
  const erg = { version: VERSION };
  for (const id of ['prototyp', 'rt4']) { fp.waehleFahrprofil(id); erg[id] = alleMessungen(m); }
  fp.waehleFahrprofil(fp.STANDARD_PROFIL);
  return erg;
}

// Testfahrer (ganze Etappe, drei Fahrer) über tools/testfahrer.mjs, Ausgabe gelesen
function testfahrer(wurzel, auto) {
  const text = execFileSync(process.execPath, [path.join(WURZEL, 'tools/testfahrer.mjs'), '--wurzel', wurzel, '--auto', auto], { encoding: 'utf8', maxBuffer: 1 << 24 });
  const erg = {};
  let aktuell = null;
  for (const z of text.split('\n')) {
    const k = z.match(/^\s+(vorsichtig|mittel|flott)\s+(\d+:\d\d\.\d\d)\s+CPs ([\d:. /]+?)\s+Aufpralle: (.*?)\s+hängen geblieben: (\d+)/);
    if (k) { aktuell = erg[k[1]] = { zeit: zeitZahl(k[2]), cps: k[3].split(' / ').map(zeitZahl), aufpralle: k[4], haenger: +k[5], wege: {} }; continue; }
    const w = z.match(/^\s+(\S+) \((schotter|wiesenweg), [\d-]+ m\): ([\d.]+) s/);
    if (w && aktuell) aktuell.wege[w[1]] = +w[3];
  }
  for (const t of Object.values(erg)) t.asphalt = t.zeit - Object.values(t.wege).reduce((a, b) => a + b, 0); // Rest = Asphalt-Abschnitte
  return erg;
}

let daten = fs.existsSync(DATEI) ? JSON.parse(fs.readFileSync(DATEI, 'utf8')) : {};
daten.hinweis = 'Automatisch erzeugt von node tools/m8b-messung.mjs. m8a = Version 0.8a, m8b = jetzt; je Profil prototyp und rt4 (Audan Quarto).';
if (ALT) {
  daten.m8a = { physik: await physik(ALT) };
  if (!schnell) daten.m8a.testfahrer = { rt4: testfahrer(ALT, 'rt4') };
}
daten.m8b = { physik: await physik(WURZEL) };
if (!schnell) daten.m8b.testfahrer = { prototyp: testfahrer(WURZEL, 'prototyp'), rt4: testfahrer(WURZEL, 'rt4') };
else if (fs.existsSync(DATEI)) daten.m8b.testfahrer = JSON.parse(fs.readFileSync(DATEI, 'utf8')).m8b?.testfahrer;
fs.writeFileSync(DATEI, JSON.stringify(daten, null, 1) + '\n');

// --- Tabelle: M8a / M8b / Ziel (Unterschied RT4 gegen prototyp) ---
const P = daten.m8b.physik.prototyp, A = daten.m8a ? daten.m8a.physik.rt4 : null, B = daten.m8b.physik.rt4;
const pzw = (b, a) => (b / a - 1) * 100;
const pz = (b, a) => (a == null || b == null ? '--' : `${pzw(b, a) >= 0 ? '+' : ''}${pzw(b, a).toFixed(1)} %`);
const gr = (w) => (w == null ? '--' : `${w >= 0 ? '+' : ''}${w.toFixed(1)}°`);
// [Messung, Wert(R), Bezug(P), Darstellung ('pz' = Prozent gegen prototyp, 'abs' = Grad), Ziel-Text, Prüfung(Wert), Hinweis]
const Z = [
  ['0–100 km/h Asphalt', (R) => R.beschl100_asphalt, P.beschl100_asphalt, 'pz', '±3 %', (d) => Math.abs(d) <= 3],
  ['0–100 km/h Schotter', (R) => R.beschl100_schotter, P.beschl100_schotter, 'pz', '7 bis 10 % schneller', (d) => d <= -7 && d >= -10],
  ['0–60 km/h Schotter (Info, z. B. aus der Kehre)', (R) => R.beschl60_schotter, P.beschl60_schotter, 'pz', '–', null],
  ['0–100 km/h Wiesenweg', (R) => R.beschl100_wiesenweg, P.beschl100_wiesenweg, 'pz', '11 bis 14 % schneller', (d) => d <= -11 && d >= -14],
  ['0–60 km/h Gras', (R) => R.beschl60_gras, P.beschl60_gras, 'pz', 'gleich', (d) => Math.abs(d) < 0.05],
  ['0–100 km/h Bankett', (R) => R.beschl100_bankett, P.beschl100_bankett, 'pz', 'nicht schneller als M8a (−2.0 %)', (d) => d >= -2.05],
  ['Bremsweg 100 → 0 Asphalt', (R) => R.bremsweg100_asphalt, P.bremsweg100_asphalt, 'pz', '±5 %', (d) => Math.abs(d) <= 5],
  ['Kreis R 25 m Grenztempo Asphalt', (R) => R.kreis25_asphalt, P.kreis25_asphalt, 'pz', '+1 bis +3 %', (d) => d >= 1 && d <= 3],
  ['Kreis R 25 m Grenztempo Schotter', (R) => R.kreis25_schotter, P.kreis25_schotter, 'pz', '+5 bis +8 %', (d) => d >= 5 && d <= 8],
  ['Kreis R 25 m Grenztempo Wiesenweg', (R) => R.kreis25_wiesenweg, P.kreis25_wiesenweg, 'pz', '+10 bis +14 %', (d) => d >= 10 && d <= 14],
  ['Lenkwinkel 80 km/h auf R 60 m', (R) => R.lenk80_r60.grad, P.lenk80_r60.grad, 'pz', '+10 bis +20 %', (d) => d >= 10 && d <= 20],
  ['Heck: 90 km/h, R 80 m, Gas weg + Bremse 60 %: Zusatz-Schwimmwinkel nach 0.5 s', (R) => R.heck90_r80.zusatz, null, 'abs', '+3.5 bis +5°', (w) => w >= 3.5 && w <= 5],
  ['... eingefangen nach (s)', (R) => R.heck90_r80.einfangen, null, 's', 'unter 0.8 s', (w) => w != null && w < 0.8],
  ['Heck: dasselbe mit Vollbremsung', (R) => R.heck90_r80_voll.zusatz, null, 'abs', 'höchstens 7°', (w) => w <= 7],
  ['Vollgas in der Kurve R 80 m, Schwimmwinkel', (R) => R.gas_r80.max, P.gas_r80.max, 'pz', 'kleiner oder gleich prototyp', (d) => d <= 0],
  ['... auf Schotter (Info)', (R) => R.gas_r80_schotter.max, P.gas_r80_schotter.max, 'pz', '–', null],
  ['Handbremsen-Drift Asphalt nach 0.5 s', (R) => R.hb_asphalt.nach05, P.hb_asphalt.nach05, 'pz', '±15 %', (d) => Math.abs(d) <= 15],
  ['Handbremsen-Drift Schotter nach 0.5 s (Info)', (R) => R.hb_schotter.nach05, P.hb_schotter.nach05, 'pz', '–', null],
  ['Rückwärts Asphalt: Höchsttempo', (R) => R.rueck_asphalt.max, P.rueck_asphalt.max, 'pz', 'identisch', (d) => d === 0],
  ['Rückwärts Asphalt: Tempo nach 1 s', (R) => R.rueck_asphalt.nach1s, P.rueck_asphalt.nach1s, 'pz', 'identisch', (d) => d === 0],
  ['Rückwärts Gras: Tempo nach 1 s', (R) => R.rueck_gras.nach1s, P.rueck_gras.nach1s, 'pz', 'identisch', (d) => d === 0],
];
const zeilen = [];
const md = ['| Messung | prototyp | M8a (0.8a) | M8b (jetzt) | Ziel M8b | erfüllt? |', '|---|---|---|---|---|---|'];
for (const [name, wert, bezug, art, ziel, pruef] of Z) {
  const a = A ? wert(A) : null, b = wert(B);
  const zahl = (w) => (art === 'pz' ? `${w.toFixed(2)} (${pz(w, bezug)})` : art === 'abs' ? gr(w) : w == null ? '--' : `${w.toFixed(2)} s`);
  const d = art === 'pz' ? (bezug ? pzw(b, bezug) : 0) : b;
  const ok = pruef ? pruef(d) : null;
  zeilen.push({ name, m8a: a, m8b: b, prototyp: bezug, ziel, ok });
  md.push(`| ${name} | ${bezug == null ? (art === 'abs' ? gr(wert(P)) : '--') : bezug.toFixed(2)} | ${a == null ? '--' : zahl(a)} | ${zahl(b)} | ${ziel} | ${ok === null ? '–' : ok ? '✅' : '❌'} |`);
}
const tz = daten.m8b.testfahrer;
if (tz && tz.prototyp && tz.rt4) {
  md.push('', '| Testfahrer | prototyp | RT4 M8a (0.8a) | Audan Quarto M8b | Unterschied M8b | Asphalt-Abschnitte | Aufpralle / Hänger | Ziel |', '|---|---|---|---|---|---|---|---|');
  for (const f of ['vorsichtig', 'mittel', 'flott']) {
    const p = tz.prototyp[f], b = tz.rt4[f], a = daten.m8a?.testfahrer?.rt4?.[f];
    const ok = pzw(b.zeit, p.zeit) <= -0.5 && pzw(b.zeit, p.zeit) >= -1.5 && Math.abs(pzw(b.asphalt, p.asphalt)) <= 2 && b.aufpralle === 'keine' && b.haenger === 0;
    md.push(`| ${f} | ${fmtZeit(p.zeit)} | ${a ? `${fmtZeit(a.zeit)} (${pz(a.zeit, p.zeit)})` : '--'} | ${fmtZeit(b.zeit)} | ${pz(b.zeit, p.zeit)} | ${b.asphalt.toFixed(2)} s gegen ${p.asphalt.toFixed(2)} s (${pz(b.asphalt, p.asphalt)}) | ${b.aufpralle} / ${b.haenger} | 0.5 bis 1.5 % schneller, Asphalt ±2 % ${ok ? '✅' : '❌'} |`);
    for (const w of Object.keys(b.wege)) md.push(`| … ${w} | ${p.wege[w].toFixed(2)} s | ${a ? `${a.wege[w].toFixed(2)} s` : '--'} | ${b.wege[w].toFixed(2)} s | ${pz(b.wege[w], p.wege[w])} | | | |`);
  }
}
const text = md.join('\n');
console.log(text);
fs.mkdirSync(ORDNER, { recursive: true });
fs.writeFileSync(path.join(ORDNER, '80-messtabelle.md'), `# Messtabelle M8b (node tools/m8b-messung.mjs)\n\n${text}\n`);

// --- als Bild (einfaches HTML im Headless-Browser) ---
const html = `<!doctype html><meta charset="utf-8"><style>body{background:#0d1218;color:#f4f4ee;font:13px/1.35 monospace;margin:16px}
table{border-collapse:collapse;margin-bottom:18px}td,th{border:1px solid #44505c;padding:3px 7px;text-align:left}th{color:#ffd23c}h1{color:#ffd23c;font-size:18px}</style>
<h1>ALPINE RALLY · M8b · AUDAN QUARTO GEGEN PROTOTYP</h1>${text.split('\n\n').map((t) => {
  const r = t.split('\n').filter((z) => !/^\|---/.test(z));
  return `<table>${r.map((z, i) => `<tr>${z.split('|').slice(1, -1).map((c) => (i ? `<td>${c.trim()}</td>` : `<th>${c.trim()}</th>`)).join('')}</tr>`).join('')}</table>`;
}).join('')}`;
const s = await starteSpiel({ breite: 1400, hoehe: 900 });
await s.page.setContent(html);
await s.page.screenshot({ path: path.join(ORDNER, '80-messtabelle.png'), fullPage: true });
await s.schliessen();
console.log(`\n-> tools/m8b-messung.json, screenshots/m8b/80-messtabelle.md und .png geschrieben`);
