// Kurzmessungen auf Schnee und Eis (M11a, Teil B):  node tools/schnee-messung.mjs [--wurzel <ordner>] [--json <datei>]
// Ohne Browser, echte Fahrphysik (js/physics.js) und Getriebe (tools/fahrmessung.js), alle Autos, Beläge
// asphalt / schotter / schnee / eis:
//   bremsweg  Vollbremsung 100 -> 0 km/h geradeaus (m), dazu Verhältnis gegen Schotter
//   null60    0 auf 60 km/h mit Vollgas (s) – "Vortrieb" (Allrad soll auf Schnee vorn sein)
//   kreis     grösstes Tempo im Kreis mit 50 m Radius (km/h) – seitlicher Halt
//   drift     digitaler Vollausschlag 1 s bei 60 km/h (Schotter 70) mit Vollgas: grösster Schwimmwinkel (°) und
//             Zeit bis er sich fängt (s, null = nicht in 5 s), Dreher
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { baueMessung } from './fahrmessung.js';
import { kEinlenken } from './m8f-ziele.js';

const WURZEL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (n) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null; };
export const AUTOS = ['prototyp', 'rt4', 'delto', 'escorta', 'l073', 'imprexa'];
export const BELAEGE = ['asphalt', 'schotter', 'schnee', 'eis'];

export async function schneeMessung(wurzel = WURZEL, { belaege = BELAEGE, autos = AUTOS, kreis = true } = {}) {
  const lade = (d) => import(pathToFileURL(path.join(wurzel, 'js', d)).href);
  const { CONFIG } = await lade('config.js');
  const { Fahrphysik } = await lade('physics.js');
  const { Getriebe } = await lade('getriebe.js');
  const fp = await lade('fahrprofil.js');
  const m = baueMessung({ CONFIG, Fahrphysik, Getriebe });
  const erg = {};
  for (const id of autos) {
    fp.waehleFahrprofil(id);
    erg[id] = {};
    for (const art of belaege) {
      if (!CONFIG.untergrund[art]) continue;
      const k = kEinlenken(m, CONFIG, { art, kmh: art === 'schotter' || art === 'asphalt' ? 70 : 60, gas: 1 });
      erg[id][art] = { bremsweg: m.bremsweg(art, 100), null60: m.beschleunigung(art, 60), kreis: kreis ? m.kreisGrenze(50, art) : null, drift: k.max, fangen: k.gerade, dreher: k.dreher };
    }
  }
  fp.waehleFahrprofil(fp.STANDARD_PROFIL);
  return erg;
}

export function messText(e) {
  const f = (x, n = 1) => (x == null ? '--' : x.toFixed(n));
  const z = ['| Auto | Belag | Bremsweg 100-0 (m) | gegen Schotter | 0-60 (s) | Kreis R50 (km/h) | Drift max (°) / fängt (s) |', '|---|---|---|---|---|---|---|'];
  for (const [id, r] of Object.entries(e)) for (const [art, w] of Object.entries(r)) {
    const v = r.schotter ? w.bremsweg / r.schotter.bremsweg : null;
    z.push(`| ${id} | ${art} | ${f(w.bremsweg)} | ${f(v, 2)} | ${f(w.null60, 2)} | ${f(w.kreis)} | ${f(w.drift)} / ${f(w.fangen, 2)}${w.dreher ? ' DREHER' : ''} |`);
  }
  return z.join('\n');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const e = await schneeMessung(arg('--wurzel') ? path.resolve(arg('--wurzel')) : WURZEL, { kreis: !process.argv.includes('--ohne-kreis') });
  console.log(messText(e));
  if (arg('--json')) fs.writeFileSync(arg('--json'), JSON.stringify(e, null, 1));
}
