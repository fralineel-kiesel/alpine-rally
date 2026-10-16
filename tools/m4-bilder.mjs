// Screenshots für Meilenstein 4 (Pace-Notes), 1280x720 mit HUD.
//
//   node tools/m4-bilder.mjs       Bilder nach screenshots/m4/<nr>-<stelle>.png
//
// Das Auto wird an die Stelle gesetzt und bekommt ein passendes Tempo (die Ansagen erscheinen je nach
// Tempo früher oder später). Die Physik steht still, nur Anzeige und Kamera laufen. Die Zeit wird für
// das Bild auf einen ungefähren Wert gesetzt (ca. 76 km/h Schnitt), passierte Checkpoints sind gefüllt.
// Dazu je Bild ein Ausschnitt in Originalgrösse (320x180, *-320.png), um die Lesbarkeit zu beurteilen.
// Das Spiel selbst lädt diese Datei nicht.

import fs from 'node:fs';
import path from 'node:path';
import { starteSpiel, WURZEL } from './spiel-browser.mjs';

const ordner = path.join(WURZEL, 'screenshots/m4');
fs.mkdirSync(ordner, { recursive: true });

const spiel = await starteSpiel({ breite: 1280, hoehe: 720 });
await spiel.ladeSpiel();
const page = spiel.page;

// name, Streckenmeter, Tempo (km/h), Ansagen aus?
const STELLEN = [
  ['start', 10, 0],
  ['vor-kehre', 1270, 65],
  ['vor-schikane', 3085, 80],
  ['vor-nicht-schneiden', 1425, 70],
  ['vor-schneiden', 1035, 90],
  ['vor-abzweig', 705, 115],
  ['vor-einmuendung', 2300, 90],
  ['passhoehe', 2640, 140],
  ['vor-ziel', 3480, 130],
  ['ausgeschaltet', 705, 115, true],
  ['nach-dem-ziel', 3640, 40],
];

let nr = 1;
const liste = [];
for (const [name, s, kmh, aus] of STELLEN) {
  await page.evaluate(({ s, kmh, aus, name }) => {
    const A = window.__alpineRally;
    A.testKamera = null;
    A.neustart();
    if (A.paceNotes.anzeige.an === !!aus) A.paceNotes.umschalten();
    A.rennen.meldung = null;
    A.setzeAuf(s);
    const p = A.physik, v = kmh / 3.6;
    p.vx = Math.sin(p.richtung) * v; p.vz = Math.cos(p.richtung) * v; p.vVor = v;
    if (s > A.strecke.startS) {
      A.rennen.zustand = name === 'nach-dem-ziel' ? 'ziel' : 'laeuft';
      A.rennen.zeit = A.rennen.endZeit = s / 21;
      A.rennen.zwischenzeiten = A.checkpoints.filter((c) => c.s < s).map((c) => c.s / 21);
      A.rennen.naechsterCp = A.rennen.zwischenzeiten.length;
      A.rennen.hilfe = false;
    }
  }, { s, kmh, aus, name });
  await page.waitForTimeout(1500); // Ansagen einblenden lassen
  const zeilen = await page.evaluate(() => {
    const a = window.__alpineRally.paceNotes.anzeige;
    return a.zeilen.slice(0, a.anzahl).map((z) => `${a.notes[z.nr].text} (${z.distanz} m)`);
  });
  // Zeichenaufrufe der 3D-Szene (die Ansagen liegen auf dem HUD-Bild und dürfen keine dazu bringen)
  const calls = await page.evaluate(() => window.__alpineRally.renderer.info.render.calls);
  const datei = `${String(nr).padStart(2, '0')}-${name}`;
  await page.screenshot({ path: path.join(ordner, `${datei}.png`) });
  liste.push(`${datei}: ${zeilen.length ? zeilen.join(' | ') : '(keine Ansage)'}  [Zeichenaufrufe ${calls}]`);
  nr++;
}
// Originalgrösse (320x180): das HUD-Bild selbst ist 320x180, das Spielbild auch
await page.setViewportSize({ width: 320, height: 180 });
for (const [name, s, kmh] of [STELLEN[3], STELLEN[5]]) {
  await page.evaluate(({ s, kmh }) => {
    const A = window.__alpineRally;
    A.neustart();
    if (!A.paceNotes.anzeige.an) A.paceNotes.umschalten();
    A.setzeAuf(s);
    const p = A.physik, v = kmh / 3.6;
    p.vx = Math.sin(p.richtung) * v; p.vz = Math.cos(p.richtung) * v;
    A.rennen.zustand = 'laeuft'; A.rennen.hilfe = false; A.rennen.zeit = s / 21;
  }, { s, kmh });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(ordner, `${String(nr).padStart(2, '0')}-${name}-320x180.png`) });
  nr++;
}
console.log(liste.join('\n'));
if (spiel.fehler.length) console.log(`Fehler im Spiel: ${spiel.fehler.length}`, spiel.fehler);
await spiel.schliessen();
