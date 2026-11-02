// Streckendatei prüfen (M10a):  node tools/strecke-pruefen.mjs <datei> [--still]
// Prüft alles, was js/streckenpruefung.js kennt (voll), und meldet Fehler mit Pfad. Rückgabe 0 = in Ordnung, 1 = Fehler.
// Format: docs/strecken-format.md

import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { pruefeStrecke } from '../js/streckenpruefung.js';

const datei = process.argv.slice(2).find((a) => !a.startsWith('--'));
const still = process.argv.includes('--still');
if (!datei) { console.log('Aufruf: node tools/strecke-pruefen.mjs <datei>'); process.exit(1); }

let daten;
try {
  daten = (await import(pathToFileURL(path.resolve(datei)).href)).default;
} catch (e) {
  console.log(`FEHLER ${datei}: lässt sich nicht laden – ${e.message.split('\n')[0]}`);
  process.exit(1);
}
const fehler = pruefeStrecke(daten, { voll: true });
if (fehler.length) {
  console.log(`FEHLER ${datei}: ${fehler.length} Fehler`);
  for (const f of fehler) console.log(`  ${f}`);
  process.exit(1);
}
if (!still) {
  const punkte = daten.punkte.filter(Array.isArray).length;
  console.log(`ok ${datei}: Strecke "${daten.id}" (Etappe ${daten.etappe}), ${daten.laenge} m, ${punkte} Stützpunkte, ` +
    `${Object.keys(daten.abschnitte).length} Abschnitte, ${daten.checkpoints.length} Checkpoints, ${daten.nebenwege.length} Nebenwege`);
}
process.exit(0);
