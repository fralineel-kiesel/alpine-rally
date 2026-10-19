// Bilder für Meilenstein 7b:  node tools/m7b-bilder.mjs
// Schreibt screenshots/m7b/: Einstellungen mit den Reglern LAUTSTÄRKE, SIGNALTÖNE und MUSIK (Deutsch und Englisch, 1280x720 und
// Originalgrösse 320x180). Spektrogramme, Pan-Verlauf und das Ton-Labor schreibt tools/ton-umgebung-test.mjs.

import fs from 'node:fs';
import path from 'node:path';
import { starteSpiel, WURZEL } from './spiel-browser.mjs';

const ORDNER = path.join(WURZEL, 'screenshots/m7b');
fs.mkdirSync(ORDNER, { recursive: true });

const spiel = await starteSpiel({ breite: 1280, hoehe: 720, args: ['--autoplay-policy=no-user-gesture-required'] });
const p = spiel.page;
await p.addInitScript(() => { if (!sessionStorage.getItem('m7b')) { localStorage.clear(); sessionStorage.setItem('m7b', '1'); } });
await spiel.ladeSpiel(false, { menue: true });
const A = (f, arg) => p.evaluate(f, arg);
const bilder = (n) => p.evaluate((n) => new Promise((r) => { let k = 0; const f = () => (++k >= n ? r() : requestAnimationFrame(f)); requestAnimationFrame(f); }), n);
await bilder(25);
await p.keyboard.press('Enter'); // Titel -> Hauptmenü (Ton entsperrt)
await bilder(10);
const ruhe = async (ms = 700) => { await p.waitForTimeout(ms); await bilder(3); };
async function bild(name, vorher) {
  await vorher();
  await ruhe();
  await p.screenshot({ path: path.join(ORDNER, `${name}.png`) });
  await p.setViewportSize({ width: 320, height: 180 });
  await vorher();
  await ruhe(500);
  await p.screenshot({ path: path.join(ORDNER, `${name}-320x180.png`) });
  await p.setViewportSize({ width: 1280, height: 720 });
  await ruhe(300);
  console.log('  ', name);
}
// Einstellungen öffnen, MUSIK wählen (Standard 60 %)
const zuMusik = () => A(async () => {
  const A = window.__alpineRally, m = A.menue, E = await import('/js/einstellungen.js');
  E.setze('musik', 60);
  if (!m.seite || m.seite.id !== 'einstellungen') m.oeffne(A.seiten.einstellungen, true);
  const n = m.seite.eintraege.findIndex((e) => e.text === 'einst.musik');
  for (let k = 0; k < 40 && m.wahl !== n; k++) m.runter();
});
await bild('31-einstellungen-lautstaerke-signaltoene-musik', zuMusik);
await A(async () => { (await import('/js/texte.js')).setzeSprache('en'); });
await bild('32-einstellungen-music-englisch', zuMusik);
await A(async () => { (await import('/js/texte.js')).setzeSprache('de'); });
if (spiel.fehler.length) console.log('Fehler:', spiel.fehler.join(' | '));
await spiel.schliessen();
