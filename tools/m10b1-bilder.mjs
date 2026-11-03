// Bilder für Meilenstein 10b.1:  node tools/m10b1-bilder.mjs [--alt <ordner 0.10b>]   (nach screenshots/m10b1/)
//   01-tannenwald.png    Finnland im Rennen: Fichten-/Kiefernwald mit Unterholz (ohne HUD)
//   02-dorf.png          Dorf mit mehreren Häusern (Holzhaus, Scheune, Zäune, Briefkasten)
//   03-einmuendung.png   Einmündung ins Dorf: Schotter trifft auf die Asphaltstrasse, Stummel abgesperrt
//   04-karte.png         Karte und Höhenprofil der neuen Strecke (tools/strecke-karte.mjs)
//   05-garage-escorta.png Garage mit dem Escorta (Zeile SCHOTTER-SPEZIALIST)
//   06-baum-alt-neu.png  Baumbilder alt (0.10b: Kiefer, Birke) und neu (Fichten, Kiefern, Birke), 4-fach vergrössert
// Alles in Chromium (Software-Grafik), eigene Bild-Uhr wie in tools/m10b1-test.mjs.

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { starteSpiel, WURZEL } from './spiel-browser.mjs';

const arg = (name) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : null; };
const ALT = arg('--alt') ? path.resolve(arg('--alt')) : null;
const AUS = path.join(WURZEL, 'screenshots/m10b1');
fs.mkdirSync(AUS, { recursive: true });
const UHR = () => {
  let jetzt = 0; const warte = [];
  performance.now = () => jetzt;
  window.requestAnimationFrame = (f) => { warte.push(f); return warte.length; };
  window.cancelAnimationFrame = () => {};
  window.__bild = (n, dt) => { for (let i = 0; i < n; i++) { jetzt += dt; for (const f of warte.splice(0)) f(jetzt); } };
  window.__foto = () => { window.__bild(1, 1000 / 60); const a = document.getElementById('spiel'), h = document.getElementById('hud'); const c = document.createElement('canvas'); c.width = h.width; c.height = h.height; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(a, 0, 0, h.width, h.height); return c.toDataURL(); }; // (ohne HUD: freie Sicht)
};
const speichere = (name, url) => { fs.writeFileSync(path.join(AUS, name), Buffer.from(url.split(',')[1], 'base64')); console.log(`screenshots/m10b1/${name}`); };
async function collage(seite, bilder, h) {
  return seite.evaluate(async ({ bilder, h }) => {
    const ims = await Promise.all(bilder.map(async (u) => createImageBitmap(await (await fetch(u)).blob())));
    const breiten = ims.map((im) => Math.round(im.width * h / im.height));
    const c = document.createElement('canvas'); c.width = breiten.reduce((a, b) => a + b, 0) + 8 * (ims.length - 1); c.height = h;
    const x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.fillStyle = '#000'; x.fillRect(0, 0, c.width, c.height);
    let ox = 0; ims.forEach((im, i) => { x.drawImage(im, ox, 0, breiten[i], h); ox += breiten[i] + 8; });
    return c.toDataURL();
  }, { bilder, h });
}

// 01–03: Finnland im Rennen (ohne HUD), Bild 320x180 doppelt gross
{
  const s = await starteSpiel({ breite: 640, hoehe: 360 });
  await s.page.addInitScript(UHR);
  await s.page.goto(`${s.url}/index.html?menue=aus&ton=aus&strecke=finnland&auto=rt4`);
  await s.page.waitForFunction(() => window.__alpineRally, null, { timeout: 180000, polling: 200 });
  await s.page.evaluate(() => window.__bild(2, 1000 / 60));
  for (const [name, sM] of [['01-tannenwald.png', 560], ['02-dorf.png', 1372], ['03-einmuendung.png', 1316]]) {
    await s.page.evaluate((sM) => { const A = window.__alpineRally; A.anhalten = true; A.setzeAuf(sM); A.kameraSofort(); window.__bild(6, 1000 / 60); }, sM);
    speichere(name, await collage(s.page, [await s.page.evaluate(() => window.__foto())], 360));
  }
  await s.schliessen();
}

// 04: Karte und Höhenprofil
{
  const tmp = '/tmp/m10b1-karte';
  spawnSync('node', [path.join(WURZEL, 'tools/strecke-karte.mjs'), '--strecke', 'finnland', '--aus', tmp], { cwd: WURZEL, stdio: 'ignore' });
  const s = await starteSpiel({ breite: 640, hoehe: 360 });
  await s.page.goto(`${s.url}/tools/leer.html`).catch(() => {});
  const url = (f) => `data:image/png;base64,${fs.readFileSync(path.join(tmp, f)).toString('base64')}`;
  speichere('04-karte.png', await collage(s.page, [url('finnland-karte.png'), url('finnland-profil.png')], 700));
  await s.schliessen();
}

// 05: Garage mit dem Escorta (Hauptmenü -> AUTO, zwei nach unten: Audan, Delto, Escorta)
{
  const g = await starteSpiel({ breite: 640, hoehe: 360, auto: '' });
  await g.page.addInitScript(() => { try { localStorage.setItem('alpineRally.einstellungen', JSON.stringify({ sprache: 'de' })); } catch { /* egal */ } });
  await g.page.goto(`${g.url}/index.html`);
  await g.page.waitForFunction(() => window.__alpineRally && window.__alpineRally.menue, null, { timeout: 180000 });
  for (const k of ['Enter', 'ArrowDown', 'Enter', 'ArrowDown', 'ArrowDown']) { await g.page.keyboard.press(k); await g.page.waitForTimeout(200); }
  await g.page.waitForFunction(() => window.__alpineRally.menue.einblendung >= 1, null, { timeout: 30000 });
  await g.page.waitForTimeout(1500);
  fs.writeFileSync(path.join(AUS, '05-garage-escorta.png'), await g.page.screenshot()); console.log('screenshots/m10b1/05-garage-escorta.png');
  await g.schliessen();
}

// 06: Baumbilder alt und neu (Texturen direkt, 4-fach)
{
  const baeume = async (wurzel, neu) => {
    const s = await starteSpiel({ breite: 320, hoehe: 180, wurzel });
    await s.page.goto(`${s.url}/index.html?menue=aus&ton=aus&strecke=finnland`);
    await s.page.waitForFunction(() => window.__alpineRally, null, { timeout: 180000, polling: 200 });
    const url = await s.page.evaluate(async (neu) => {
      const P = await import('/js/pixel.js');
      const liste = neu ? [P.nordwaldTextur(), P.birkenTextur()] : [P.kiefernTextur(), P.birkenTextur()];
      const bilder = liste.map((t) => t.textur.image);
      const c = document.createElement('canvas'); c.width = bilder.reduce((a, b) => a + b.width, 0) + 4 * (bilder.length - 1); c.height = 32;
      const x = c.getContext('2d'); x.fillStyle = neu ? '#5c8a32' : '#5c8a32'; x.fillRect(0, 0, c.width, c.height);
      let ox = 0; for (const b of bilder) { x.drawImage(b, ox, 0); ox += b.width + 4; }
      return c.toDataURL();
    }, neu);
    await s.schliessen();
    return url;
  };
  const neu = await baeume(WURZEL, true);
  const alt = ALT ? await baeume(ALT, false) : null;
  const s = await starteSpiel({ breite: 320, hoehe: 180 });
  await s.page.goto(`${s.url}/tools/leer.html`).catch(() => {});
  speichere('06-baum-alt-neu.png', await collage(s.page, alt ? [alt, neu] : [neu], 128));
  await s.schliessen();
}
console.log(`Bilder: ${fs.readdirSync(AUS).join(', ')}`);
