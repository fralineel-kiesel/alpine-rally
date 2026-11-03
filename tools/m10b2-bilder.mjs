// Bilder für Meilenstein 10b.2:  node tools/m10b2-bilder.mjs --alt <ordner 0.10b.1>   -> screenshots/m10b2/
//   01-hang-969-alt.png / 02-hang-969-neu.png  Hang zum See bei Meter 969 (0.10b.1 | jetzt), Auto im Hang
//   03-wasser.png       Wasser-Moment: Platsch, Bild wird schwarz, HUD bleibt
//   04-schatten-wald.png  Fichtenwald mit Schatten (Auto, Bäume)
//   05-schatten-dorf.png  Dorf mit Schatten (Häuser, Zuschauer)
//   06-garage-escorta.png Garage mit dem Escorta (Zeile SCHOTTER-SPEZIALIST)
// Das Spiel selbst lädt diese Datei nicht.
import fs from 'node:fs';
import path from 'node:path';
import { starteSpiel, WURZEL } from './spiel-browser.mjs';

const arg = (name) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : null; };
const ALT = arg('--alt') ? path.resolve(arg('--alt')) : null;
const AUS = path.join(WURZEL, 'screenshots/m10b2');
fs.mkdirSync(AUS, { recursive: true });
const UHR = () => {
  let jetzt = 0; const warte = [];
  performance.now = () => jetzt;
  window.requestAnimationFrame = (f) => { warte.push(f); return warte.length; };
  window.cancelAnimationFrame = () => {};
  window.__bild = (n, dt) => { for (let i = 0; i < n; i++) { jetzt += dt; for (const f of warte.splice(0)) f(jetzt); } };
  window.__foto = (hud) => { window.__bild(1, 1000 / 60); const a = document.getElementById('spiel'), h = document.getElementById('hud'); const c = document.createElement('canvas'); c.width = h.width; c.height = h.height; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(a, 0, 0, h.width, h.height); if (hud) x.drawImage(h, 0, 0); return c.toDataURL(); };
};
const speichere = (name, url) => { fs.writeFileSync(path.join(AUS, name), Buffer.from(url.split(',')[1], 'base64')); console.log(`screenshots/m10b2/${name}`); };
async function seite(wurzel, adresse) {
  const s = await starteSpiel({ wurzel, breite: 640, hoehe: 360 });
  await s.page.addInitScript(UHR);
  await s.page.goto(`${s.url}/index.html${adresse}`);
  await s.page.waitForFunction(() => window.__alpineRally, null, { timeout: 180000, polling: 200 });
  await s.page.evaluate(() => window.__bild(2, 1000 / 60));
  return s;
}

// Hang bei 969 m: Kamera auf der Strasse bei 975 m, Blick quer zum See (links), Auto 9 m neben der Mitte im Hang
const HANG = () => {
  const A = window.__alpineRally, S = A.strecke, W = A.welt; A.anhalten = true;
  const p = S.punktBei(969), k = S.punktBei(982), z = S.punktBei(962);
  A.physik.reset(p.x + p.tz * 10, p.z - p.tx * 10, Math.atan2(p.tz, -p.tx) - 0.5);
  const kx = k.x - k.tz * 3, kz = k.z + k.tx * 3, zx = z.x + z.tz * 22, zz = z.z - z.tx * 22;
  A.testKamera = { pos: [kx, S.py[982] + 3.5, kz], ziel: [zx, W.gelaendeHoehe(zx, zz), zz] };
  window.__bild(6, 1000 / 60);
};
for (const [wurzel, name] of [[ALT, '01-hang-969-alt.png'], [WURZEL, '02-hang-969-neu.png']]) {
  if (!wurzel) continue;
  const s = await seite(wurzel, '?menue=aus&ton=aus&strecke=finnland&auto=escorta');
  await s.page.evaluate(HANG);
  speichere(name, await s.page.evaluate(() => window.__foto(false)));
  await s.schliessen();
}

// Wasser-Moment: ins tiefe Wasser bei 969 m, kurz nach dem Platsch (Bild halb schwarz, Spritzer, HUD bleibt)
{
  const s = await seite(WURZEL, '?menue=aus&ton=aus&strecke=finnland&auto=rt4');
  await s.page.evaluate(() => {
    const A = window.__alpineRally, S = A.strecke, P = A.physik; A.anhalten = true;
    A.setzeAuf(950); A.rennen.zustand = 'laeuft'; A.rennen.zeit = 61.4;
    for (let i = 0; i < 120; i++) A.rennSchritt(A.SCHRITT, { gas: 0.4, bremse: 0, lenkung: 0, handbremse: false });
    const p = S.punktBei(969);
    P.reset(p.x + p.tz * 6, p.z - p.tx * 6, Math.atan2(p.tz, -p.tx) - 0.4); P.vx = Math.sin(P.richtung) * 13; P.vz = Math.cos(P.richtung) * 13;
    for (let i = 0; i < 1200 && !(A.wasserBad.aktiv && A.wasserBad.t > 0.2); i++) A.rennSchritt(A.SCHRITT, { gas: 1, bremse: 0, lenkung: 0, handbremse: false });
    A.anhalten = false; window.__bild(3, 1000 / 60); A.anhalten = true;
  });
  speichere('03-wasser.png', await s.page.evaluate(() => window.__foto(true)));
  await s.schliessen();
}

// Schatten: Fichtenwald und Dorf (ohne HUD)
for (const [name, sM, auto] of [['04-schatten-wald.png', 560, 'escorta'], ['05-schatten-dorf.png', 1420, 'imprexa']]) {
  const s = await seite(WURZEL, `?menue=aus&ton=aus&strecke=finnland&auto=${auto}`);
  await s.page.evaluate((sM) => { const A = window.__alpineRally; A.anhalten = true; A.setzeAuf(sM); A.kameraSofort(); window.__bild(8, 1000 / 60); }, sM);
  speichere(name, await s.page.evaluate(() => window.__foto(false)));
  await s.schliessen();
}

// Garage mit dem Escorta
{
  const g = await starteSpiel({ breite: 640, hoehe: 360, auto: '' });
  await g.page.addInitScript(() => { try { localStorage.setItem('alpineRally.einstellungen', JSON.stringify({ sprache: 'de' })); } catch { /* egal */ } });
  await g.page.goto(`${g.url}/index.html`);
  await g.page.waitForFunction(() => window.__alpineRally && window.__alpineRally.menue, null, { timeout: 180000 });
  for (const k of ['Enter', 'ArrowDown', 'Enter', 'ArrowDown', 'ArrowDown']) { await g.page.keyboard.press(k); await g.page.waitForTimeout(200); }
  await g.page.waitForFunction(() => window.__alpineRally.menue.einblendung >= 1, null, { timeout: 30000 });
  await g.page.waitForTimeout(1500);
  fs.writeFileSync(path.join(AUS, '06-garage-escorta.png'), await g.page.screenshot()); console.log('screenshots/m10b2/06-garage-escorta.png');
  await g.schliessen();
}
