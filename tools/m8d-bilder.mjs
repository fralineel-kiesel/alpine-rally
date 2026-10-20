// Bilder für Meilenstein 8d:  node tools/m8d-bilder.mjs [--nur scheiben,lacke,garage,tonlabor] [--name vorher|nachher]
// Schreibt screenshots/m8d/ (Originalgrösse 320x180 und 1280x720 = 4-fach scharf hochskaliert):
//  - scheiben: Frontscheibe von Delto und Escorta (Front, Drei-Viertel vorne, Heck) – mit --name vorher/nachher
//  - lacke:    Front und Heck aller drei Autos in allen Lackierungen (ein Sammelbild je Grösse)
//  - garage:   Garage: Zeiger auf einer Auto-Zeile, bestätigtes Auto gelb, Zeiger auf LACK
//  - tonlabor: Ton-Labor mit den neuen Knöpfen (VERGLEICH, je Auto)
// Spektrogramme und Messtabelle schreibt tools/ton-messung.mjs --profil <id> (siehe dort).
// Das Spiel selbst lädt diese Datei nicht.

import fs from 'node:fs';
import path from 'node:path';
import { starteSpiel, WURZEL } from './spiel-browser.mjs';

const arg = (name) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : null; };
const NUR = arg('--nur') ? arg('--nur').split(',') : ['scheiben', 'lacke', 'garage', 'tonlabor'];
const NAME = arg('--name') || 'nachher';
const ORDNER = path.join(WURZEL, 'screenshots/m8d');
fs.mkdirSync(ORDNER, { recursive: true });
const speichere = (datei, dataUrl) => { fs.writeFileSync(path.join(ORDNER, datei), Buffer.from(dataUrl.split(',')[1], 'base64')); console.log('  ', datei); };

// Auto-Labor: Bild in 320x180 und 4-fach scharf (1280x720) als Daten-URL
async function labor() {
  const s = await starteSpiel({ breite: 640, hoehe: 360 });
  await s.page.goto(`${s.url}/auto-labor.html`);
  await s.page.waitForFunction(() => window.__autoLabor, null, { timeout: 60000 });
  return s;
}
const laborBild = (p, id, lack, ansicht) => p.evaluate(async ([id, lack, ansicht]) => {
  const L = window.__autoLabor;
  L.aufloesung(0); L.modellWaehlen(id, lack); L.auto.lackierung(lack); L.ansicht(ansicht);
  const klein = L.bildDaten();
  const i = await new Promise((r) => { const b = new Image(); b.onload = () => r(b); b.src = klein; });
  const c = document.createElement('canvas'); c.width = i.width * 4; c.height = i.height * 4;
  const x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(i, 0, 0, c.width, c.height);
  return [klein, c.toDataURL('image/png')];
}, [id, lack, ansicht]);

if (NUR.includes('scheiben')) {
  const s = await labor();
  for (const id of ['delto', 'escorta']) {
    for (const ansicht of ['front', 'vorne34', 'heck', 'hinten34']) {
      const [k, g] = await laborBild(s.page, id, id === 'delto' ? 'deltoWerk' : 'escortaWerk', ansicht);
      speichere(`10-scheibe-${NAME}-${id}-${ansicht}-320x180.png`, k);
      speichere(`10-scheibe-${NAME}-${id}-${ansicht}-1280x720.png`, g);
    }
  }
  if (s.fehler.length) console.log('Fehler:', s.fehler.slice(0, 3).join(' | '));
  await s.schliessen();
}

// Sammelbild: Zeilen = Auto x Lackierung, Spalten = Ansichten; tile = Ausschnitt um das Auto, scharf vergrössert
const sammelBild = (p, autos, ansichten, aufl, faktor, ausschnitt) => p.evaluate(async ([autos, ansichten, aufl, faktor, ausschnitt]) => {
  const L = window.__autoLabor;
  L.aufloesung(aufl);
  const zeilen = [];
  for (const id of autos) { L.modellWaehlen(id); for (const lack of L.auto.modell.lackierungen) zeilen.push([id, lack]); }
  const [aw, ah] = ausschnitt; // Ausschnitt in Bildpixeln (Mitte des Bildes)
  const c = document.createElement('canvas'); c.width = aw * faktor * ansichten.length; c.height = ah * faktor * zeilen.length;
  const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
  for (let z = 0; z < zeilen.length; z++) {
    const [id, lack] = zeilen[z];
    for (let s = 0; s < ansichten.length; s++) {
      L.modellWaehlen(id, lack); L.auto.lackierung(lack); L.ansicht(ansichten[s]);
      const i = await new Promise((r) => { const b = new Image(); b.onload = () => r(b); b.src = L.bildDaten(); });
      x.drawImage(i, (i.width - aw) / 2, (i.height - ah) / 2 - ah * 0.1, aw, ah, s * aw * faktor, z * ah * faktor, aw * faktor, ah * faktor);
    }
  }
  return c.toDataURL('image/png');
}, [autos, ansichten, aufl, faktor, ausschnitt]);

if (NUR.includes('lacke')) {
  const s = await labor();
  const alle = ['rt4', 'delto', 'escorta'];
  // Originalgrösse 320x180: Ausschnitt 120x68 Pixel um das Auto, alle sechs Ansichten
  speichere('20-alle-lacke-ansichten-320x180.png', await sammelBild(s.page, alle, ['front', 'vorne34', 'heck', 'hinten34', 'seite', 'oben'], 0, 1, [120, 68]));
  // gross: Front und Heck (je 4-fach), ein Bild je Auto (1280 breit)
  for (const id of alle) speichere(`21-${id}-front-heck-lacke-1280.png`, await sammelBild(s.page, [id], ['front', 'heck'], 0, 4, [160, 68]));
  // 640x360 (Originalgrösse): Front und Heck aller Autos
  speichere('22-alle-front-heck-640x360.png', await sammelBild(s.page, alle, ['front', 'heck', 'vorne34', 'hinten34'], 2, 1, [240, 136]));
  if (s.fehler.length) console.log('Fehler:', s.fehler.slice(0, 3).join(' | '));
  await s.schliessen();
}
