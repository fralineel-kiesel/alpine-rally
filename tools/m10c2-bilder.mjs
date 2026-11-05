// Meilenstein 10c.2: Bilder für den Bericht nach screenshots/m10c2/ (höchstens 3):  node tools/m10c2-bilder.mjs [--nur motor,einst,sprung]
// 01-motor-leuchte (Ausschnitt HUD unten rechts), 02-einstellungen-sprungkamera, 03-sprung3-phasen (Abheben / Gipfel / Landung, NORMAL).
// Spiel bei 640x360 (Pixelgrösse AUTO bzw. fest), Fenster 640x360, eigene Bild-Uhr (gleiche Bilder bei jedem Lauf).
import fs from 'node:fs';
import path from 'node:path';
import { starteSpiel, WURZEL } from './spiel-browser.mjs';

const arg = (n) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null; };
const NUR = arg('--nur') ? arg('--nur').split(',') : null;
const ZIEL = path.join(WURZEL, 'screenshots', 'm10c2');
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
// Ausschnitt (x, y, b, h im 640x360-Bild) speichern, optional vergrössert (ganze Faktoren, ohne Glätten)
const ausschnitt = async (s, name, x, y, b, h, f = 1) => {
  const url = await s.page.evaluate(([x, y, b, h, f]) => {
    window.__bild(1, 1000 / 60);
    const a = document.getElementById('spiel'), hu = document.getElementById('hud');
    const c = document.createElement('canvas'); c.width = 640; c.height = 360;
    const q = c.getContext('2d'); q.imageSmoothingEnabled = false;
    q.drawImage(a, 0, 0, 640, 360); q.drawImage(hu, 0, 0, 640, 360);
    const d = document.createElement('canvas'); d.width = b * f; d.height = h * f;
    const z = d.getContext('2d'); z.imageSmoothingEnabled = false; z.drawImage(c, x, y, b, h, 0, 0, b * f, h * f);
    return d.toDataURL();
  }, [x, y, b, h, f]);
  fs.writeFileSync(path.join(ZIEL, `${name}.png`), Buffer.from(url.split(',')[1], 'base64')); console.log(`${name}.png`);
};

if (teil('motor')) {
  // Alpen, Rennen läuft, 4 s Vollgas; dann ein Treffer eingespielt (wand.treffer wie nach einem Wand-Kontakt), MOTOR-Leuchte an
  const s = await oeffne('?menue=aus&ton=aus&aufloesung=640x360');
  await s.page.evaluate(() => window.__bild(330, 1000 / 60));
  const r = await s.page.evaluate(() => {
    const A = window.__alpineRally; A.start({ countdown: false }); window.__bild(30, 1000 / 60);
    A.testEingabe = { gas: 1 }; window.__bild(240, 1000 / 60); A.testEingabe = null;
    // Treffer: wie ein Wand-Kontakt mit 40 km/h Verlust (gleiche Funktion wie im Spiel), Leuchte in der An-Phase
    const W = A.wand; W.uhr += 1; W.schrittVerlust = 40 / 3.6; W.treffer(); W.strafeSeit = 0.2;
    A.anhalten = true; window.__bild(1, 1000 / 60);
    return { rest: W.strafeRest };
  });
  console.log(`Strafe ${r.rest.toFixed(2)} s`);
  await ausschnitt(s, '01-motor-leuchte', 320, 260, 320, 100, 2);
  await s.schliessen();
}
if (teil('einst')) {
  const s = await oeffne('?ton=aus&aufloesung=640x360');
  await s.page.evaluate(() => window.__bild(30, 1000 / 60));
  await s.page.evaluate(() => { const A = window.__alpineRally, S = A.seiten.einstellungen; A.menue.zeige(S, true); const L = typeof S.eintraege === 'function' ? S.eintraege() : S.eintraege; const i = L.findIndex((e) => e.text === 'einst.sprungkamera'); if (i >= 0) A.menue.wahl = i; window.__bild(4, 1000 / 60); });
  await bild(s, '02-einstellungen-sprungkamera');
  await s.schliessen();
}
if (teil('sprung')) {
  // Hochwaldkuppe (Sprung 3) mit 110 km/h, SPRUNGKAMERA NORMAL: Abheben (5 Bilder nach dem Abheben), Gipfel (höchster
  // Punkt), Landung (3 Bilder nach dem Aufsetzen) nebeneinander, je auf die Hälfte verkleinert (jedes 2. Pixel)
  const s = await oeffne('?menue=aus&ton=aus&strecke=finnland&aufloesung=640x360', { 'alpineRally.einstellungen': JSON.stringify({ sprungkamera: 'normal' }) });
  await s.page.evaluate(() => window.__bild(330, 1000 / 60));
  const url = await s.page.evaluate(() => {
    const A = window.__alpineRally, P = A.physik, F = A.flug;
    const foto = () => { const a = document.getElementById('spiel'), h = document.getElementById('hud'); const c = document.createElement('canvas'); c.width = 640; c.height = 360; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(a, 0, 0, 640, 360); x.drawImage(h, 0, 0, 640, 360); return c; };
    A.anhalten = false; A.rennen.naechsterCp = 3; A.setzeAuf(3030); A.kameraSofort();
    P.vx = Math.sin(P.richtung) * 110 / 3.6; P.vz = Math.cos(P.richtung) * 110 / 3.6; A.testEingabe = { gas: 1 };
    const l0 = F.ereignis.landung; let k = 0, ab = -1, best = -1e9, gipfel = null, abBild = null;
    while (k++ < 500 && F.ereignis.landung === l0) {
      window.__bild(1, 1000 / 60);
      if (F.inLuft && ab < 0) ab = k;
      if (ab > 0 && k === ab + 5) abBild = foto();
      if (F.inLuft && A.autoModell.objekt.position.y > best) { best = A.autoModell.objekt.position.y; gipfel = foto(); }
    }
    window.__bild(3, 1000 / 60); const land = foto();
    A.testEingabe = null; A.anhalten = true;
    const d = document.createElement('canvas'); d.width = 960 + 8; d.height = 180;
    const z = d.getContext('2d'); z.imageSmoothingEnabled = false; z.fillStyle = '#101418'; z.fillRect(0, 0, d.width, d.height);
    [abBild, gipfel, land].forEach((c, i) => z.drawImage(c, 0, 0, 640, 360, i * 324, 0, 320, 180));
    return d.toDataURL();
  });
  fs.writeFileSync(path.join(ZIEL, '03-sprung3-phasen.png'), Buffer.from(url.split(',')[1], 'base64')); console.log('03-sprung3-phasen.png');
  await s.schliessen();
}
