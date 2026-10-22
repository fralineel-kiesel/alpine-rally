// Meilenstein 8g prüfen:  node tools/m8g-test.mjs [--nur a,b,c,d,e,f,g,h,i] [--alt <ordner 0.8f>] [--lang]
//   (a) Tacho KLASSISCH pixelgleich zu 0.8f: fünf Autos (und Prototyp), km/h und mph, direkt gemalt in mehreren
//       Zuständen und im Spiel (HUD-Ausschnitt) in drei Auflösungen
// --alt <ordner 0.8f>: der alte Stand zum Vergleich (git worktree add <ordner> <commit von 0.8f>); ohne --alt gelten
//   die Prüfsummen aus tools/m8g-referenz-08f.json (mit --referenz-schreiben neu schreiben)
// Ich sehe die Bilder, aber ich fahre nicht: ob ein Tacho im Fahren gut lesbar ist, beurteile ich nur an Bildern und Zahlen.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { starteSpiel, WURZEL } from './spiel-browser.mjs';

const arg = (name) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : null; };
const NUR = arg('--nur') ? arg('--nur').split(',') : null;
const ALT = arg('--alt') ? path.resolve(arg('--alt')) : null;
const teil = (k) => !NUR || NUR.includes(k);
let fehler = 0, kompromisse = 0;
const melde = (ok, text) => { console.log(`${ok ? '  ok  ' : 'FEHLER'} ${text}`); if (!ok) fehler++; };
const info = (text) => console.log(`       ${text}`);
const hash = (s) => crypto.createHash('sha1').update(s).digest('hex').slice(0, 12);
const ALLE = ['rt4', 'delto', 'escorta', 'l073', 'imprexa'];
const ORDNER = path.join(WURZEL, 'screenshots/m8g');
fs.mkdirSync(ORDNER, { recursive: true });

// Ausschnitt der Tacho-Gruppe im 320x180-HUD (mit Rand für "höchstens 8 Pixel höher")
const AUSSCHNITT = [205, 110, 115, 70];
// Zustände für das direkte Malen: [km/h, U/min, Gang]
const ZUSTAENDE = [[0, 1000, 'N'], [95, 5200, '3'], [189, 6820, '5'], [20, 2200, 'R'], [230, 9400, '4']];

// Tacho direkt aus js/tacho.js malen (wie hud.js), je Profil, Einheit und Zustand; Ergebnis: Prüfsumme je Fall
async function tachoDirekt(wurzel, modus) {
  const s = await starteSpiel({ wurzel, breite: 640, hoehe: 360 });
  await s.page.goto(`${s.url}/index.html?menue=aus&auto=rt4`);
  await s.page.waitForFunction(() => window.__alpineRally, null, { timeout: 120000 });
  const r = await s.page.evaluate(async ([ids, zustaende, aus, modus]) => {
    const T = await import('/js/tacho.js'), P = await import('/js/pixel.js');
    const c = document.createElement('canvas'); c.width = 320; c.height = 180;
    const ctx = c.getContext('2d');
    const FARBEN = { weiss: '#f4f4ee', gelb: '#ffd23c', rot: '#ff4a3a' };
    const text = (tx, x, y, g = 1, f = 'weiss', a = 'links') => P.pixelText(ctx, tx, x, y, g, FARBEN[f] || f, a);
    const tachos = T.baueTachos(ctx, text);
    if (tachos.setzeModus) tachos.setzeModus(modus);
    const out = {};
    for (const id of ids) {
      for (const e of ['kmh', 'mph']) {
        tachos.setzeEinheit(e);
        tachos.setzeSkala(id);
        zustaende.forEach(([kmh, rpm, gang], i) => {
          for (let n = 0; n < 80; n++) { ctx.clearRect(0, 0, 320, 180); tachos.zeichne(1, kmh, rpm, gang); }
          out[`${id}-${e}-${i}`] = Array.from(ctx.getImageData(...aus).data).join(',');
        });
      }
    }
    return out;
  }, [['prototyp', ...ALLE], ZUSTAENDE, AUSSCHNITT, modus]);
  await s.schliessen();
  return Object.fromEntries(Object.entries(r).map(([k, v]) => [k, hash(v)]));
}
// Tacho im Spiel (HUD-Ausschnitt) je Auto, Einheit und Auflösung (Leerlauf im Stand)
async function tachoImSpiel(wurzel, modus) {
  const s = await starteSpiel({ wurzel, breite: 640, hoehe: 360 });
  const out = {};
  for (const id of ALLE) {
    await s.page.goto(`${s.url}/index.html?menue=aus&auto=${id}`);
    await s.page.waitForFunction(() => window.__alpineRally, null, { timeout: 120000 });
    Object.assign(out, await s.page.evaluate(async ([id, aus, modus]) => {
      const E = await import('/js/einstellungen.js');
      const warte = (ms) => new Promise((r) => setTimeout(r, ms));
      E.setze('tacho', modus);
      const o = {};
      for (const a of [0, 1, 2]) {
        for (const e of ['kmh', 'mph']) {
          E.setze('aufloesung', a); E.setze('einheit', e);
          await warte(700);
          o[`${id}-${e}-${a}`] = Array.from(document.getElementById('hud').getContext('2d').getImageData(...aus).data).join(',');
        }
      }
      E.setze('einheit', 'kmh'); E.setze('aufloesung', 0);
      return o;
    }, [id, AUSSCHNITT, modus]));
  }
  await s.schliessen();
  return Object.fromEntries(Object.entries(out).map(([k, v]) => [k, hash(v)]));
}

// Referenz 0.8f: aus --alt gerechnet (und mit --referenz-schreiben gespeichert) oder aus tools/m8g-referenz-08f.json
let REF = null;
async function referenz() {
  if (REF) return REF;
  const datei = path.join(WURZEL, 'tools/m8g-referenz-08f.json');
  if (ALT) {
    REF = { tachoDirekt: await tachoDirekt(ALT, 'klassisch'), tachoSpiel: await tachoImSpiel(ALT, 'klassisch') };
    if (process.argv.includes('--referenz-schreiben')) fs.writeFileSync(datei, `${JSON.stringify(REF, null, 1)}\n`);
  } else REF = JSON.parse(fs.readFileSync(datei, 'utf8'));
  return REF;
}

// ---------------------------------------------------------------- (a) klassisch pixelgleich zu 0.8f
if (teil('a')) {
  console.log('(a) Tacho KLASSISCH pixelgleich zu 0.8f');
  const R = await referenz();
  const d = await tachoDirekt(WURZEL, 'klassisch');
  const andersD = Object.keys(R.tachoDirekt).filter((k) => R.tachoDirekt[k] !== d[k]);
  melde(andersD.length === 0, `direkt gemalt: ${Object.keys(R.tachoDirekt).length} Fälle (Prototyp + 5 Autos, km/h und mph, ${ZUSTAENDE.length} Zustände) gleich wie 0.8f${andersD.length ? `; anders: ${andersD.slice(0, 8).join(', ')}` : ''}`);
  const sp = await tachoImSpiel(WURZEL, 'klassisch');
  const andersS = Object.keys(R.tachoSpiel).filter((k) => R.tachoSpiel[k] !== sp[k]);
  melde(andersS.length === 0, `im Spiel: ${Object.keys(R.tachoSpiel).length} Ausschnitte (5 Autos, km/h und mph, 320x180 / 480x270 / 640x360) gleich wie 0.8f${andersS.length ? `; anders: ${andersS.slice(0, 8).join(', ')}` : ''}`);
}

console.log(`\n${fehler === 0 ? 'Alle Prüfungen bestanden.' : `${fehler} Prüfung(en) NICHT bestanden.`}${kompromisse ? ` (${kompromisse} Kompromiss(e), siehe docs/meilensteine/m8g.md)` : ''}`);
process.exit(fehler === 0 ? 0 : 1);
