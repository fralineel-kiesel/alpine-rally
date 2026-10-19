// Leistung für Meilenstein 7a:  node tools/m7a-leistung.mjs [ordner der alten Version]
//  - Zeichenaufrufe der 3D-Szene an drei Stellen (alt gegen neu, falls die alte Version angegeben ist)
//  - Bildzeit mit Ton (alle Schichten an: Vollgas, Drift, Wind, Turbo) gegen ?ton=aus, abwechselnd gemessen
//  - Rechenzeit von tonBild() pro Bild (Hauptthread; der Klang selbst läuft im Audio-Thread)
//  - Puffer-Aufbau nach dem Entsperren
// Die Ladezeit misst tools/ladezeit.mjs (der Ton wird beim Laden nicht gebaut).

import path from 'node:path';
import { starteSpiel } from './spiel-browser.mjs';

const ARGS = ['--autoplay-policy=no-user-gesture-required'];
const alt = process.argv[2] ? path.resolve(process.argv[2]) : null;
const bilder = (p, n) => p.evaluate((n) => new Promise((r) => { let k = 0; const f = () => (++k >= n ? r() : requestAnimationFrame(f)); requestAnimationFrame(f); }), n);

// Zeichenaufrufe an festen Stellen (ohne Menü, Physik angehalten)
async function zeichenaufrufe(wurzel) {
  const s = await starteSpiel({ wurzel, breite: 640, hoehe: 360 });
  await s.ladeSpiel(true);
  const erg = [];
  for (const m of [60, 1170, 2900]) {
    await s.page.evaluate((m) => { const A = window.__alpineRally; A.setzeAuf(m); A.kameraSofort(); }, m);
    await bilder(s.page, 4);
    erg.push(await s.page.evaluate(() => window.__alpineRally.renderer.info.render.calls));
  }
  await s.schliessen();
  return erg;
}
const neu = await zeichenaufrufe(undefined);
const vorher = alt ? await zeichenaufrufe(alt) : null;
console.log(`Zeichenaufrufe (60 m, 1170 m, 2900 m): neu ${neu.join(' / ')}${vorher ? `, alt ${vorher.join(' / ')}` : ''}`);

// Bildzeit: zwei Seiten (mit Ton / ?ton=aus), gleiche Stelle, gleiche Kamera, Physik steht; mit Ton laufen alle Schichten
async function seite(adresse) {
  const s = await starteSpiel({ breite: 640, hoehe: 360, args: ARGS });
  await s.page.goto(`${s.url}/index.html${adresse}`);
  await s.page.waitForFunction(() => window.__alpineRally, null, { timeout: 120000 });
  await bilder(s.page, 5);
  await s.page.keyboard.press('Enter');
  await s.page.waitForFunction(() => { const t = window.__alpineRally.ton; return !t.an || (t.werk && t.werk.aufbau.fertig); }, null, { timeout: 30000 });
  await s.page.evaluate(() => {
    const A = window.__alpineRally;
    A.start({ countdown: false });
    A.anhalten = true;
    A.setzeAuf(1250);
    // jedes Bild: Motor hoch, Vollgas, Tempo und Drift (die Physik steht, der Ton liest diese Zahlen)
    const halte = () => {
      A.getriebe.drehzahl = 5600; A.getriebe.gang = 3; A.tonEingabe.gas = 1;
      const p = A.physik; p.vx = Math.sin(p.richtung) * 30; p.vz = Math.cos(p.richtung) * 30; p.driftWinkel = 18;
      requestAnimationFrame(halte);
    };
    halte();
    A.testEingabe = { gas: 1 };
  });
  return s;
}
async function bildzeit(s, sek = 6) {
  return s.page.evaluate((sek) => new Promise((r) => {
    const z = [];
    let t0 = performance.now(), vor = t0;
    const f = (jetzt) => { z.push(jetzt - vor); vor = jetzt; if (jetzt - t0 < sek * 1000) requestAnimationFrame(f); else r(z); };
    requestAnimationFrame(f);
  }), sek);
}
// nacheinander (immer nur ein Browser offen), zwei Runden
const zm = [], zo = [];
let info = null;
for (let runde = 0; runde < 2; runde++) {
  for (const adresse of ['', '?ton=aus']) {
    const s = await seite(adresse);
    await bilder(s.page, 10);
    (adresse ? zo : zm).push(...(await bildzeit(s, 8)));
    if (!adresse && !info) info = await messeTon(s);
    if (s.fehler.length) console.log('Fehler:', s.fehler.join(' | '));
    await s.schliessen();
  }
}
const median = (a) => a.slice().sort((x, y) => x - y)[Math.floor(a.length / 2)];
const mittel = (a) => a.reduce((x, y) => x + y, 0) / a.length;
console.log(`Bildzeit mit Ton: Median ${median(zm).toFixed(1)} ms, Mittel ${mittel(zm).toFixed(1)} ms (${zm.length} Bilder)`);
console.log(`Bildzeit ohne Ton (?ton=aus): Median ${median(zo).toFixed(1)} ms, Mittel ${mittel(zo).toFixed(1)} ms (${zo.length} Bilder)`);
function messeTon(s) { return s.page.evaluate(() => {
  const A = window.__alpineRally, w = A.ton.werk;
  // Rechenzeit tonBild() (wie in der Spielschleife, ein Bild = 1/60 s)
  const n = 20000, t0 = performance.now();
  for (let k = 0; k < n; k++) A.tonBild(1 / 60);
  const us = (performance.now() - t0) / n * 1000;
  return { us, aufbau: w.aufbau, stimmen: w.stimmen, z: { turbo: w.zustand.turbo, quietschen: w.zustand.quietschen, wind: w.zustand.wind, surren: w.zustand.surren } };
}); }
console.log(`tonBild(): ${info.us.toFixed(1)} µs pro Bild (Hauptthread), aktive Schichten ${JSON.stringify(info.z)}`);
console.log(`Puffer-Aufbau: ${info.aufbau.ms.toFixed(0)} ms Rechenzeit in ${info.aufbau.haeppchen} Häppchen (längstes ${info.aufbau.laengstesMs.toFixed(1)} ms), fertig ${(info.aufbau.ende - info.aufbau.start).toFixed(0)} ms nach dem Tastendruck`);
