// Bilder für Meilenstein 8f:  node tools/m8f-bilder.mjs [--nur lanza,garage,subora,tacho] [--alt <ordner 0.8e>]
// Schreibt screenshots/m8f/:
//  - lanza:  Lanza 073 von der Seite und schräg hinten, vorher (0.8e, nur mit --alt) und nachher, bei 480x270 und 320x180;
//            dazu schräg vorne rechts, hinten und von oben (480x270)
//  - garage: Garage mit fünf Autos (Deutsch, 480x270), Zeiger auf dem Lanza 073 und auf dem Subora (Lack WERK = Blau)
//  - subora: Subora Imprexa in Blau-Gelb in drei Auflösungen (320x180, 480x270, 640x360), alle vier Lacke
//  - tacho:  Tacho des Subora (Skala bis 9) neben dem Audan (Skala bis 8), 4-fach vergrössert
// Das Spiel selbst lädt diese Datei nicht.

import fs from 'node:fs';
import path from 'node:path';
import { starteSpiel, WURZEL } from './spiel-browser.mjs';

const arg = (name) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : null; };
const NUR = arg('--nur') ? arg('--nur').split(',') : ['lanza', 'garage', 'subora', 'tacho'];
const ALT = arg('--alt') ? path.resolve(arg('--alt')) : null;
const ORDNER = path.join(WURZEL, 'screenshots/m8f');
fs.mkdirSync(ORDNER, { recursive: true });
const speichere = (datei, dataUrl) => { fs.writeFileSync(path.join(ORDNER, datei), Buffer.from(dataUrl.split(',')[1], 'base64')); console.log('  ', datei); };

async function labor(wurzel = WURZEL) {
  const s = await starteSpiel({ wurzel, breite: 640, hoehe: 360 });
  await s.page.goto(`${s.url}/auto-labor.html`);
  await s.page.waitForFunction(() => window.__autoLabor, null, { timeout: 60000 });
  return s;
}
// Ansichten nebeneinander (Ausschnitt um das Auto: 42 % der Bildbreite/-höhe), aufl 0/1/2 = 320x180/480x270/640x360,
// faktor = Vergrösserung mit harten Pixeln
const reihe = (p, id, lack, ansichten, aufl, faktor) => p.evaluate(async ([id, lack, ansichten, aufl, faktor]) => {
  const L = window.__autoLabor; L.aufloesung(aufl);
  const bilder = [];
  for (const a of ansichten) {
    L.modellWaehlen(id, lack); if (lack) L.auto.lackierung(lack); L.ansicht(a);
    bilder.push(await new Promise((r) => { const b = new Image(); b.onload = () => r(b); b.src = L.bildDaten(); }));
  }
  const w = bilder[0].width, h = bilder[0].height, aw = Math.round(w * 0.42), ah = Math.round(h * 0.42);
  const c = document.createElement('canvas'); c.width = aw * faktor * ansichten.length; c.height = ah * faktor;
  const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
  bilder.forEach((i, k) => x.drawImage(i, (w - aw) / 2, (h - ah) / 2 - ah * 0.08, aw, ah, k * aw * faktor, 0, aw * faktor, ah * faktor));
  return c.toDataURL('image/png');
}, [id, lack, ansichten, aufl, faktor]);

if (NUR.includes('lanza')) {
  for (const [wurzel, wann] of [[ALT, 'vorher-08e'], [WURZEL, 'nachher-08f']]) {
    if (!wurzel) { console.log('   (vorher: nur mit --alt <ordner 0.8e>)'); continue; }
    const s = await labor(wurzel);
    speichere(`10-lanza-seite-hinten34-${wann}-480x270.png`, await reihe(s.page, 'l073', null, ['seite', 'hinten34'], 1, 2));
    speichere(`11-lanza-seite-hinten34-${wann}-320x180.png`, await reihe(s.page, 'l073', null, ['seite', 'hinten34'], 0, 3));
    if (wann.startsWith('nachher')) speichere(`12-lanza-vorne34-heck-oben-${wann}-480x270.png`, await reihe(s.page, 'l073', null, ['vorne34', 'heck', 'oben'], 1, 2));
    await s.schliessen();
  }
}

if (NUR.includes('garage')) {
  for (const [schritte, name] of [[['ArrowDown', 'ArrowDown', 'ArrowDown'], '20-garage-zeiger-lanza073'], [['ArrowDown', 'ArrowDown', 'ArrowDown', 'ArrowDown', 'Space'], '21-garage-subora-gewaehlt']]) {
    const s = await starteSpiel({ breite: 960, hoehe: 540, auto: '' });
    const p = s.page;
    await p.addInitScript(() => { try { localStorage.setItem('alpineRally.einstellungen', JSON.stringify({ sprache: 'de', aufloesung: 1 })); } catch { /* egal */ } });
    await p.goto(`${s.url}/index.html`);
    await p.waitForFunction(() => window.__alpineRally && window.__alpineRally.menue, null, { timeout: 120000 });
    for (const k of ['Enter', 'ArrowDown', 'Enter', ...schritte]) { await p.keyboard.press(k); await p.waitForTimeout(150); }
    await p.waitForFunction(() => window.__alpineRally.menue.einblendung >= 1, null, { timeout: 30000 });
    await p.waitForTimeout(1500);
    await p.screenshot({ path: path.join(ORDNER, `${name}-480x270.png`) }); console.log('  ', `${name}-480x270.png`);
    if (s.fehler.length) console.log('Fehler:', s.fehler.slice(0, 3).join(' | '));
    await s.schliessen();
  }
}

if (NUR.includes('subora')) {
  const s = await labor();
  for (const [aufl, n, f] of [[0, '320x180', 3], [1, '480x270', 2], [2, '640x360', 1]]) {
    speichere(`30-subora-blau-${n}.png`, await reihe(s.page, 'imprexa', 'imprexaWerk', ['vorne34', 'hinten34', 'seite'], aufl, f));
  }
  speichere('31-subora-vier-lacke-480x270.png', await s.page.evaluate(async (urls) => {
    const bilder = await Promise.all(urls.map((u) => new Promise((r) => { const b = new Image(); b.onload = () => r(b); b.src = u; })));
    const c = document.createElement('canvas'); c.width = bilder[0].width; c.height = bilder.reduce((s, b) => s + b.height, 0);
    const x = c.getContext('2d'); let y = 0; for (const b of bilder) { x.drawImage(b, 0, y); y += b.height; }
    return c.toDataURL('image/png');
  }, await Promise.all(['imprexaWerk', 'imprexaPolar', 'imprexaDunkel', 'imprexaRot'].map(async (l) => reihe(s.page, 'imprexa', l, ['vorne34', 'seite'], 1, 1)))));
  await s.schliessen();
}

if (NUR.includes('tacho')) {
  const s = await starteSpiel({ breite: 640, hoehe: 360 });
  const teile = [];
  for (const id of ['rt4', 'imprexa']) {
    await s.page.goto(`${s.url}/index.html?menue=aus&auto=${id}`);
    await s.page.waitForFunction(() => window.__alpineRally, null, { timeout: 120000 });
    teile.push(await s.page.evaluate(async () => {
      await new Promise((r) => setTimeout(r, 600));
      const c = document.getElementById('hud'), k = document.createElement('canvas'); k.width = 440; k.height = 240;
      const x = k.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(c, 210, 120, 110, 60, 0, 0, 440, 240);
      return k.toDataURL();
    }));
  }
  speichere('40-tacho-audan-subora-4fach.png', await s.page.evaluate(async (urls) => {
    const b = await Promise.all(urls.map((u) => new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.src = u; })));
    const c = document.createElement('canvas'); c.width = 880; c.height = 240; const x = c.getContext('2d');
    x.drawImage(b[0], 0, 0); x.drawImage(b[1], 440, 0); return c.toDataURL();
  }, teile));
  await s.schliessen();
}
