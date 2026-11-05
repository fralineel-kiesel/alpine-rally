// Meilenstein 10c.1: Bilder für den Bericht nach screenshots/m10c1/ (höchstens 6):  node tools/m10c1-bilder.mjs [--nur sprung,kehre,...]
// 01-sprung3-landung (steifere Kamera), 02-seekehre-strasse, 03-seekehre-oben, 04-menue-etappe, 05-hud-640x360, 06-einstellungen.
// Spiel bei 640x360 (Pixelgrösse AUTO bzw. fest), Fenster 640x360, eigene Bild-Uhr (gleiche Bilder bei jedem Lauf).
import fs from 'node:fs';
import path from 'node:path';
import { starteSpiel, WURZEL } from './spiel-browser.mjs';

const arg = (n) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null; };
const NUR = arg('--nur') ? arg('--nur').split(',') : null;
const ZIEL = path.join(WURZEL, 'screenshots', 'm10c1');
fs.mkdirSync(ZIEL, { recursive: true });
const UHR = () => {
  let jetzt = 0; const warte = [];
  performance.now = () => jetzt;
  window.requestAnimationFrame = (f) => { warte.push(f); return warte.length; };
  window.cancelAnimationFrame = () => {};
  window.__bild = (n, dt) => { for (let i = 0; i < n; i++) { jetzt += dt; for (const f of warte.splice(0)) f(jetzt); } };
};
async function oeffne(adresse, speicher = {}) {
  const s = await starteSpiel({ breite: 640, hoehe: 360, auto: 'rt4' });
  await s.page.addInitScript((sp) => { localStorage.clear(); for (const [k, v] of Object.entries(sp)) localStorage.setItem(k, v); }, speicher);
  await s.page.addInitScript(UHR);
  await s.page.goto(`${s.url}/index.html${adresse}`);
  await s.page.waitForFunction(() => window.__alpineRally, null, { timeout: 600000, polling: 200 });
  return s;
}
// Bild: 3D-Leinwand in ihrer Grösse, HUD/Menü (320x180) scharf darüber hochskaliert (wie im Spiel, ohne Glätten)
const bild = async (s, name) => {
  const url = await s.page.evaluate(() => {
    window.__bild(1, 1000 / 60); // (gleich nach dem Zeichnen auslesen, sonst ist das 3D-Bild leer)
    const a = document.getElementById('spiel'), h = document.getElementById('hud');
    const c = document.createElement('canvas'); c.width = 640; c.height = 360;
    const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
    x.drawImage(a, 0, 0, 640, 360); x.drawImage(h, 0, 0, 640, 360);
    return c.toDataURL();
  });
  fs.writeFileSync(path.join(ZIEL, `${name}.png`), Buffer.from(url.split(',')[1], 'base64')); console.log(`${name}.png`);
};
const teil = (n) => !NUR || NUR.includes(n);

if (teil('sprung')) {
  const s = await oeffne('?menue=aus&ton=aus&strecke=finnland&aufloesung=640x360');
  await s.page.evaluate(() => window.__bild(330, 1000 / 60));
  await s.page.evaluate(() => {
    const A = window.__alpineRally, P = A.physik, F = A.flug;
    A.anhalten = false; A.rennen.naechsterCp = 3; A.setzeAuf(3030); A.kameraSofort();
    P.vx = Math.sin(P.richtung) * 110 / 3.6; P.vz = Math.cos(P.richtung) * 110 / 3.6; A.testEingabe = { gas: 1 };
    let k = 0; const l0 = F.ereignis.landung;
    while (k++ < 400 && F.ereignis.landung === l0) window.__bild(1, 1000 / 60);
    window.__bild(3, 1000 / 60); // 3 Bilder nach dem Aufsetzen (Ruck)
    A.testEingabe = null; A.anhalten = true;
  });
  await bild(s, '01-sprung3-landung');
  await s.schliessen();
}
if (teil('kehre')) {
  const s = await oeffne('?menue=aus&ton=aus&strecke=finnland&aufloesung=640x360');
  await s.page.evaluate(() => window.__bild(330, 1000 / 60));
  await s.page.evaluate(() => { const A = window.__alpineRally; A.anhalten = true; A.rennen.naechsterCp = 3; A.setzeAuf(3292); A.kameraSofort(); window.__bild(4, 1000 / 60); });
  await bild(s, '02-seekehre-strasse');
  await s.page.evaluate(() => { const A = window.__alpineRally; A.testKamera = { pos: [1322, 95, -222], ziel: [1322, -6, -238] }; window.__bild(2, 1000 / 60); });
  await bild(s, '03-seekehre-oben');
  await s.schliessen();
}
if (teil('menue')) {
  const s = await oeffne('?ton=aus&strecke=finnland&aufloesung=640x360', { 'alpineRally.sprungRekorde': JSON.stringify({ finnland: { weite: 51.2, auto: 'rt4', datum: '2026-11-04T10:00:00.000Z' } }) });
  await s.page.evaluate(() => window.__bild(30, 1000 / 60));
  await s.page.evaluate(() => { const A = window.__alpineRally; A.menue.zeige(A.seiten.etappe, true); });
  await s.page.evaluate(() => new Promise((ok) => setTimeout(ok, 500)));
  await s.page.evaluate(() => window.__bild(4, 1000 / 60));
  await bild(s, '04-menue-etappe');
  await s.page.evaluate(() => { const A = window.__alpineRally, S = A.seiten.einstellungen; A.menue.zeige(S, true); const L = typeof S.eintraege === 'function' ? S.eintraege() : S.eintraege; const i = L.findIndex((e) => e.text === 'einst.aufloesung'); if (i >= 0) A.menue.wahl = i; window.__bild(4, 1000 / 60); });
  await bild(s, '06-einstellungen');
  await s.schliessen();
}
if (teil('hud')) {
  const s = await oeffne('?menue=aus&ton=aus&aufloesung=640x360');
  await s.page.evaluate(() => window.__bild(330, 1000 / 60));
  await s.page.evaluate(() => { const A = window.__alpineRally; A.testEingabe = { gas: 1 }; window.__bild(420, 1000 / 60); A.testEingabe = null; });
  await bild(s, '05-hud-640x360');
  await s.schliessen();
}
