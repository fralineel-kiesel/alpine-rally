// Kurzmessungen auf Schotter (M10b.2, Teil C):  node tools/schotter-messung.mjs [--wurzel <ordner>] [--json]
// Ohne Browser, mit der echten Fahrphysik (js/physics.js) und dem Getriebe (tools/fahrmessung.js), für alle Autos:
//   (1) 0 auf 80 km/h geradeaus mit Vollgas auf Schotter (s) – "Räder drehen durch" = Traktion begrenzt
//   (2) digitaler Vollausschlag in der Kurve: 70 km/h auf Schotter, Vollgas, Taste links 1.0 s gehalten (Lenk-Rampe wie
//       js/input.js), dann los, ohne Gegenlenken. Gemessen: grösster Schwimmwinkel (Grad) und Zeit ab dem Loslassen, bis
//       er unter 5° fällt und 0.3 s darunter bleibt (null = fängt sich nicht in 5 s), Dreher (über 60°)
//   (3) dasselbe auf Asphalt (Kontrolle: Escorta auf Asphalt unverändert)
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { baueMessung } from './fahrmessung.js';
import { kEinlenken } from './m8f-ziele.js';

const WURZEL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (n) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null; };
export const AUTOS = ['prototyp', 'rt4', 'delto', 'escorta', 'l073', 'imprexa'];

export async function schotterMessung(wurzel = WURZEL) {
  const lade = (d) => import(pathToFileURL(path.join(wurzel, 'js', d)).href);
  const { CONFIG } = await lade('config.js');
  const { Fahrphysik } = await lade('physics.js');
  const { Getriebe } = await lade('getriebe.js');
  const fp = await lade('fahrprofil.js');
  const m = baueMessung({ CONFIG, Fahrphysik, Getriebe });
  const erg = {};
  for (const id of AUTOS) {
    fp.waehleFahrprofil(id);
    const k = kEinlenken(m, CONFIG, { art: 'schotter', kmh: 70, gas: 1 });
    const ka = kEinlenken(m, CONFIG, { art: 'asphalt', kmh: 70, gas: 1 });
    erg[id] = {
      null80: m.beschleunigung('schotter', 80), null80Asphalt: m.beschleunigung('asphalt', 80),
      drift: k.max, fangen: k.gerade, dreher: k.dreher, driftAsphalt: ka.max, fangenAsphalt: ka.gerade,
    };
  }
  fp.waehleFahrprofil(fp.STANDARD_PROFIL);
  return erg;
}

export function messText(e) {
  const f = (x, n = 2) => (x == null ? '--' : x.toFixed(n));
  const z = ['Auto      0-80 Schotter  0-80 Asphalt  Drift Schotter (max°, fängt sich nach s)  Drift Asphalt'];
  for (const [id, r] of Object.entries(e)) z.push(`${id.padEnd(9)} ${f(r.null80).padStart(8)} s ${f(r.null80Asphalt).padStart(10)} s    ${f(r.drift, 1).padStart(6)}° ${f(r.fangen).padStart(6)} s${r.dreher ? ' DREHER' : ''}              ${f(r.driftAsphalt, 1)}° ${f(r.fangenAsphalt)} s`);
  return z.join('\n');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const e = await schotterMessung(arg('--wurzel') ? path.resolve(arg('--wurzel')) : WURZEL);
  console.log(messText(e));
  if (process.argv.includes('--json')) fs.writeFileSync('/tmp/schotter-messung.json', JSON.stringify(e, null, 1));
}
