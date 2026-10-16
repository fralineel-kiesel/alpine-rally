// Screenshots für Meilenstein 4.1 (Pace-Notes als Kacheln, R mit Wartezeit).
//
//   node tools/m41-bilder.mjs      Bilder nach screenshots/m4-1/<nr>-<stelle>.png (1280x720)
//                                  und <nr>-<stelle>-320x180.png (Originalgrösse, um die Lesbarkeit zu beurteilen)
//
// Das Auto wird an die Stelle gesetzt und bekommt ein passendes Tempo (die Kacheln erscheinen je nach Tempo
// früher oder später). Die Physik steht still, nur Anzeige und Kamera laufen. Die Zeit wird für das Bild auf
// einen ungefähren Wert gesetzt (ca. 76 km/h Schnitt), passierte Checkpoints sind gefüllt.
// Ausgabe: welche Kacheln zu sehen sind, Breite der Tafel (Pixel im 320x180-Bild), Zeichenaufrufe der 3D-Szene.
// Das Spiel selbst lädt diese Datei nicht.

import fs from 'node:fs';
import path from 'node:path';
import { starteSpiel, WURZEL } from './spiel-browser.mjs';

const ordner = path.join(WURZEL, 'screenshots/m4-1');
fs.mkdirSync(ordner, { recursive: true });

const spiel = await starteSpiel({ breite: 1280, hoehe: 720 });
await spiel.ladeSpiel();
const page = spiel.page;

// name, Streckenmeter, Tempo (km/h), Extras
const STELLEN = [
  ['start', 10, 0],
  ['vor-kurve-stufe-6', 160, 110],
  ['vor-kurve-stufe-2', 830, 45],
  ['vor-kehre', 1290, 60],
  ['vor-schneiden', 1040, 80],
  ['vor-nicht-schneiden', 3125, 60],
  ['vor-abzweig', 690, 115],
  ['vor-kuppe', 2680, 120],
  ['vor-ziel', 3500, 140],
  ['r-countdown', 1310, 0, { r: true }],
  ['ausgeschaltet', 690, 115, { aus: true }],
];

async function stelle(name, s, kmh, x = {}) {
  await page.evaluate(({ s, kmh, x, name }) => {
    const A = window.__alpineRally;
    A.testKamera = null;
    A.neustart();
    if (A.paceNotes.anzeige.an === !!x.aus) A.paceNotes.umschalten();
    A.rennen.meldung = null;
    A.setzeAuf(s, x.r ? 5 : 0);
    const p = A.physik, v = kmh / 3.6;
    p.vx = Math.sin(p.richtung) * v; p.vz = Math.cos(p.richtung) * v; p.vVor = v;
    if (s > A.strecke.startS) {
      A.rennen.zustand = 'laeuft';
      A.rennen.zeit = s / 21;
      A.rennen.zwischenzeiten = A.checkpoints.filter((c) => c.s < s).map((c) => c.s / 21);
      A.rennen.naechsterCp = A.rennen.zwischenzeiten.length;
      A.rennen.hilfe = false;
    }
    if (x.r) { A.rTaste(); A.rueck.rest = 2.6; } // Countdown steht auf "3" (Physik ist angehalten)
  }, { s, kmh, x, name });
  await page.waitForTimeout(1500); // Kacheln einblenden lassen
}

let nr = 1;
const liste = [];
for (const [name, s, kmh, x] of STELLEN) {
  await stelle(name, s, kmh, x);
  const info = await page.evaluate(() => {
    const A = window.__alpineRally, a = A.paceNotes.anzeige, P = A.CONFIG.pacenotes;
    const k = a.kacheln.slice(0, a.anzahl).map((e) => a.alle[e.nr]);
    const breite = k.length ? k.reduce((b, kk) => b + kk.breite, 0) + (k.length - 1) * P.luecke + 2 * P.innen + 1 : 0;
    return {
      kacheln: k.map((kk) => `${a.notes[kk.note].text} [${kk.art}${kk.stufe ? ' ' + kk.stufe : ''}${kk.form ? ' ' + kk.form : ''}${kk.schneiden ? ' ' + kk.schneiden : ''}${kk.belag ? ' ' + kk.belag : ''}]`),
      breite, hoehe: 14 + 2 * P.innen + 1, calls: A.renderer.info.render.calls,
    };
  });
  const datei = `${String(nr).padStart(2, '0')}-${name}`;
  await page.screenshot({ path: path.join(ordner, `${datei}.png`) });
  liste.push(`${datei}: ${info.kacheln.length ? info.kacheln.join(' | ') : '(keine Kachel)'}  [Tafel ${info.breite}x${info.breite ? info.hoehe : 0} px, Zeichenaufrufe ${info.calls}]`);
  nr++;
}
// Originalgrösse (320x180): das HUD-Bild ist 320x180, das Spielbild auch
await page.setViewportSize({ width: 320, height: 180 });
nr = 1;
for (const [name, s, kmh, x] of STELLEN) {
  await stelle(name, s, kmh, x);
  await page.screenshot({ path: path.join(ordner, `${String(nr).padStart(2, '0')}-${name}-320x180.png`) });
  nr++;
}
console.log(liste.join('\n'));
if (spiel.fehler.length) console.log(`Fehler im Spiel: ${spiel.fehler.length}`, spiel.fehler);
await spiel.schliessen();
