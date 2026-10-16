// Kühe einfrieren (Meilenstein 3d):  node tools/kuhfolge-schreiben.mjs
// Plant die Kühe einmal ohne js/kuhfolge.js (wie bis M3b) und schreibt das Ergebnis als feste Liste
// nach js/kuhfolge.js. Danach stehen die Kühe immer genau dort, auch wenn sich die Strecke ändert.
// Nur laufen lassen, wenn die Kühe absichtlich neu verteilt werden sollen. Das Spiel lädt diese Datei nicht.

import fs from 'node:fs';
import path from 'node:path';
import { starteSpiel, WURZEL } from './spiel-browser.mjs';

const spiel = await starteSpiel();
// Spiel ohne eingefrorene Kühe laden: die Datei kurz durch eine leere Liste ersetzen
const datei = path.join(WURZEL, 'js/kuhfolge.js');
const alt = fs.existsSync(datei) ? fs.readFileSync(datei, 'utf8') : null;
fs.writeFileSync(datei, 'export const KUHFOLGE = null;\n');
let kuehe, seed;
try {
  await spiel.ladeSpiel();
  ({ kuehe, seed } = await spiel.page.evaluate(() => {
    const A = window.__alpineRally;
    return { seed: A.CONFIG.kuehe.seed, kuehe: A.kuehe.kuehe.filter((k) => !k.leben).map((k) => [k.x, k.z, k.blick, k.pose, k.art, k.groesse, k.wo === 'tal' ? 0 : 1, k.herde]) };
  }));
} catch (e) {
  if (alt) fs.writeFileSync(datei, alt);
  throw e;
}
await spiel.schliessen();
const r = (v) => Math.round(v * 1e6) / 1e6;
const zeilen = kuehe.map((k) => `    [${k.map((v, i) => (i < 3 || i === 5 ? r(v) : v)).join(', ')}],`).join('\n');
fs.writeFileSync(datei, `// Feste Kuh-Liste (seit Meilenstein 3d) – bitte nicht von Hand ändern (neu schreiben: node tools/kuhfolge-schreiben.mjs).
//
// Bis M3b würfelte der Kuh-Planer (kuehe.js) alle Herden mit EINER Zufallsfolge. Änderte sich irgendwo die
// Strecke (z. B. eine neue Wiese), rutschte die ganze Folge und alle Kühe standen woanders (so in M3b passiert).
// Hier sind die Kühe vom Stand M3b eingefroren. Jede wird beim Laden noch mit den Regeln geprüft (Abstand zur
// Strasse, zu Zäunen, nicht in den Kurven-Innenseiten ...); passt eine nicht mehr, fällt sie weg.
// Neue Herden (z. B. am Wiesenweg, M3d) kommen mit eigenem seed dazu (config.js, Block "leben").
// Gilt nur für kuehe.seed = ${seed}; bei einem anderen seed wird wie früher gewürfelt.
// Je Kuh: x, z, Blickrichtung, Pose (0 steht, 1 grast, 2 liegt), Art, Grösse, Weide (0 Tal, 1 Alp), Herde

export const KUHFOLGE = {
  seed: ${seed},
  kuehe: [
${zeilen}
  ],
};
`);
console.log(`${kuehe.length} Kühe nach js/kuhfolge.js geschrieben`);
