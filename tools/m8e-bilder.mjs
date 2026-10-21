// Bilder für Meilenstein 8e:  node tools/m8e-bilder.mjs [--nur autos,fuenf,garage,flamme,tonlabor,spektro,tabellen]
// Schreibt screenshots/m8e/ (Originalgrösse 320x180 und 4-fach scharf hochskaliert = 1280x720 je Bild):
//  - autos:    Lanza 073 und Subora Imprexa in allen Lackierungen, sechs Ansichten (320x180 und 1280x720 je Auto)
//  - fuenf:    alle fünf Autos nebeneinander (Seite, schräg vorne, schräg hinten; Werk-Lackierung)
//  - garage:   Garage mit fünf Zeilen: Zeiger auf Lanza 073 (Hinweiszeile), Zeiger auf LACK, Englisch, Gamepad-Hinweis
//  - flamme:   Flamme in drei Stufen am Heck jedes Autos (Heck und schräg hinten)
//  - tonlabor: Ton-Labor mit fünf Autos (VERGLEICH läuft)
//  - spektro:  die fünf Vergleichsfahrten untereinander (aus den Spektrogrammen von tools/ton-messung.mjs)
//  - tabellen: die Mess-Tabellen (screenshots/m8e/*.md aus tools/m8e-test.mjs) als Bild
// Das Spiel selbst lädt diese Datei nicht.

import fs from 'node:fs';
import path from 'node:path';
import { starteSpiel, WURZEL } from './spiel-browser.mjs';

const arg = (name) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : null; };
const NUR = arg('--nur') ? arg('--nur').split(',') : ['autos', 'fuenf', 'garage', 'flamme', 'tonlabor', 'spektro', 'tabellen'];
const ORDNER = path.join(WURZEL, 'screenshots/m8e');
fs.mkdirSync(ORDNER, { recursive: true });
const speichere = (datei, dataUrl) => { fs.writeFileSync(path.join(ORDNER, datei), Buffer.from(dataUrl.split(',')[1], 'base64')); console.log('  ', datei); };
const ALLE = ['rt4', 'delto', 'escorta', 'l073', 'imprexa'];

async function labor() {
  const s = await starteSpiel({ breite: 640, hoehe: 360 });
  await s.page.goto(`${s.url}/auto-labor.html`);
  await s.page.waitForFunction(() => window.__autoLabor, null, { timeout: 60000 });
  return s;
}
// Sammelbild: zeilen = [[id, lack, flammeStufe?]], spalten = Ansichten; Ausschnitt um das Auto (aw x ah im 320x180-Raster),
// faktor = Vergrösserung (1 = Originalgrösse)
const sammel = (p, zeilen, ansichten, faktor, [aw, ah], aufl = 0) => p.evaluate(async ([zeilen, ansichten, faktor, aw, ah, aufl]) => {
  const L = window.__autoLabor;
  L.aufloesung(aufl);
  const c = document.createElement('canvas'); c.width = aw * faktor * ansichten.length; c.height = ah * faktor * zeilen.length;
  const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
  for (let z = 0; z < zeilen.length; z++) {
    const [id, lack, stufe] = zeilen[z];
    for (let s = 0; s < ansichten.length; s++) {
      L.modellWaehlen(id, lack); L.auto.lackierung(lack); L.ansicht(ansichten[s]);
      if (stufe != null) { L.auto.flammePlanen(10, 1); L.auto.flammeBild(10 + (stufe + 0.5) * 0.14 / 3); L.zeichne(0); }
      const i = await new Promise((r) => { const b = new Image(); b.onload = () => r(b); b.src = L.bildDaten(); });
      const k = i.width / 320;
      x.drawImage(i, (i.width - aw * k) / 2, (i.height - ah * k) / 2 - ah * k * 0.1, aw * k, ah * k, s * aw * faktor, z * ah * faktor, aw * faktor, ah * faktor);
      if (stufe != null) L.auto.flammeBild(99);
    }
  }
  return c.toDataURL('image/png');
}, [zeilen, ansichten, faktor, aw, ah, aufl]);

const SECHS = ['front', 'vorne34', 'heck', 'hinten34', 'seite', 'oben'];
if (NUR.includes('autos')) {
  const s = await labor();
  for (const id of ['l073', 'imprexa']) {
    const lacke = await s.page.evaluate((id) => { window.__autoLabor.modellWaehlen(id); return window.__autoLabor.auto.modell.lackierungen; }, id);
    const zeilen = lacke.map((l) => [id, l]);
    speichere(`10-${id}-lacke-ansichten-320x180.png`, await sammel(s.page, zeilen, SECHS, 1, [120, 68]));
    speichere(`11-${id}-lacke-ansichten-1280x720.png`, await sammel(s.page, zeilen, SECHS, 4, [120, 68]));
    // je Lackierung: Front und Heck gross (ab 480x270 mit Sponsor-Schrift), 640x360 Originalgrösse
    speichere(`12-${id}-front-heck-seite-640x360.png`, await sammel(s.page, zeilen, ['front', 'heck', 'seite', 'vorne34', 'hinten34'], 1, [120, 68], 2));
  }
  if (s.fehler.length) console.log('Fehler:', s.fehler.slice(0, 3).join(' | '));
  await s.schliessen();
}

if (NUR.includes('fuenf')) {
  const s = await labor();
  const zeilen = [];
  for (const id of ALLE) zeilen.push([id, await s.page.evaluate((id) => { window.__autoLabor.modellWaehlen(id); return window.__autoLabor.auto.modell.lackierungen[0]; }, id)]);
  // nebeneinander: je Ansicht eine Zeile, die Autos als Spalten (Silhouetten und Hauptfarben direkt vergleichbar)
  for (const [ansicht, n] of [['seite', 'seite'], ['vorne34', 'vorne34'], ['hinten34', 'hinten34']]) {
    const bild = await s.page.evaluate(async ([zeilen, ansicht]) => {
      const L = window.__autoLabor; L.aufloesung(0);
      const aw = 120, ah = 60, c = document.createElement('canvas'); c.width = aw * zeilen.length; c.height = ah;
      const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
      for (let k = 0; k < zeilen.length; k++) {
        L.modellWaehlen(zeilen[k][0], zeilen[k][1]); L.ansicht(ansicht);
        const i = await new Promise((r) => { const b = new Image(); b.onload = () => r(b); b.src = L.bildDaten(); });
        x.drawImage(i, (i.width - aw) / 2, (i.height - ah) / 2, aw, ah, k * aw, 0, aw, ah);
      }
      return c.toDataURL('image/png');
    }, [zeilen, ansicht]);
    speichere(`20-alle-fuenf-${n}-600x60.png`, bild);
    // 4-fach
    const gross = await s.page.evaluate(async (url) => {
      const i = await new Promise((r) => { const b = new Image(); b.onload = () => r(b); b.src = url; });
      const c = document.createElement('canvas'); c.width = i.width * 4; c.height = i.height * 4;
      const x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(i, 0, 0, c.width, c.height);
      return c.toDataURL('image/png');
    }, bild);
    speichere(`21-alle-fuenf-${n}-2400x240.png`, gross);
  }
  if (s.fehler.length) console.log('Fehler:', s.fehler.slice(0, 3).join(' | '));
  await s.schliessen();
}

if (NUR.includes('garage')) {
  for (const [b, h] of [[320, 180], [1280, 720]]) {
    for (const [sprache, schritte, name] of [
      ['de', ['ArrowDown', 'ArrowDown', 'ArrowDown'], '30-garage-zeiger-lanza073'],
      ['de', ['ArrowDown', 'ArrowDown', 'ArrowDown', 'Space', 'ArrowDown', 'ArrowDown'], '31-garage-lanza-gewaehlt-zeiger-lack'],
      ['en', ['ArrowDown', 'ArrowDown', 'ArrowDown', 'ArrowDown'], '32-garage-englisch-zeiger-subora'],
    ]) {
      const s = await starteSpiel({ breite: b, hoehe: h, auto: '' });
      const p = s.page;
      if (sprache === 'en') await p.addInitScript(() => { try { localStorage.setItem('alpineRally.einstellungen', JSON.stringify({ sprache: 'en' })); } catch { /* egal */ } });
      await p.goto(`${s.url}/index.html`);
      await p.waitForFunction(() => window.__alpineRally && window.__alpineRally.menue, null, { timeout: 120000 });
      for (const k of ['Enter', 'ArrowDown', 'Enter', ...schritte]) { await p.keyboard.press(k); await p.waitForTimeout(150); }
      await p.waitForFunction(() => window.__alpineRally.menue.einblendung >= 1, null, { timeout: 30000 });
      await p.waitForTimeout(1500);
      await p.screenshot({ path: path.join(ORDNER, `${name}-${b}x${h}.png`) }); console.log('  ', `${name}-${b}x${h}.png`);
      if (s.fehler.length) console.log('Fehler:', s.fehler.slice(0, 3).join(' | '));
      await s.schliessen();
    }
  }
}

if (NUR.includes('flamme')) {
  const s = await labor();
  const zeilen = [];
  for (const id of ALLE) {
    const lack = await s.page.evaluate((id) => { window.__autoLabor.modellWaehlen(id); return window.__autoLabor.auto.modell.lackierungen[0]; }, id);
    for (const stufe of [0, 1, 2]) zeilen.push([id, lack, stufe]);
  }
  // je Zeile: ein Auto in einer Stufe; Spalten: Heck und schräg hinten
  speichere('40-flamme-drei-stufen-320x180.png', await sammel(s.page, zeilen, ['heck', 'hinten34'], 1, [120, 68]));
  speichere('41-flamme-drei-stufen-1280x720.png', await sammel(s.page, zeilen, ['heck', 'hinten34'], 4, [120, 68]));
  // Stufen nebeneinander (je Auto eine Zeile), schräg hinten, 4-fach
  const neben = await s.page.evaluate(async (ALLE) => {
    const L = window.__autoLabor; L.aufloesung(0);
    const aw = 120, ah = 68, f = 4, c = document.createElement('canvas'); c.width = aw * f * 4; c.height = ah * f * ALLE.length;
    const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
    for (let z = 0; z < ALLE.length; z++) {
      L.modellWaehlen(ALLE[z]); L.ansicht('hinten34');
      for (let st = -1; st < 3; st++) {
        if (st >= 0) { L.auto.flammePlanen(10, 1); L.auto.flammeBild(10 + (st + 0.5) * 0.14 / 3); } else L.auto.flammeBild(99);
        L.zeichne(0);
        const i = await new Promise((r) => { const b = new Image(); b.onload = () => r(b); b.src = L.bildDaten(); });
        x.drawImage(i, (i.width - aw) / 2 + 20, (i.height - ah) / 2, aw, ah, (st + 1) * aw * f, z * ah * f, aw * f, ah * f);
      }
      L.auto.flammeBild(99);
    }
    return c.toDataURL('image/png');
  }, ALLE);
  speichere('42-flamme-ohne-und-drei-stufen-schraeg-hinten.png', neben);
  if (s.fehler.length) console.log('Fehler:', s.fehler.slice(0, 3).join(' | '));
  await s.schliessen();
}

if (NUR.includes('tonlabor')) {
  const s = await starteSpiel({ breite: 1280, hoehe: 900, args: ['--autoplay-policy=no-user-gesture-required'] });
  const p = s.page;
  await p.goto(`${s.url}/ton-labor.html`);
  await p.waitForFunction(() => window.__tonLabor && window.__tonLabor.vergleich, null, { timeout: 60000 });
  await p.click('#tonStarten');
  await p.waitForFunction(() => window.__tonLabor.ton.werk && window.__tonLabor.ton.werk.aufbau.fertig, null, { timeout: 30000 });
  await p.evaluate(() => { const $ = (id) => document.getElementById(id); $('tonProfil').value = 'l073'; $('tonProfil').dispatchEvent(new Event('change')); });
  await p.waitForTimeout(300);
  await p.screenshot({ path: path.join(ORDNER, '50-ton-labor-fuenf-autos.png'), fullPage: true }); console.log('   50-ton-labor-fuenf-autos.png');
  await p.click('#vergleich');
  await p.waitForFunction(() => /073$/.test(document.getElementById('vergleichName').textContent), null, { timeout: 180000 });
  await p.waitForTimeout(2500);
  await p.screenshot({ path: path.join(ORDNER, '51-ton-labor-vergleich-lanza073.png') }); console.log('   51-ton-labor-vergleich-lanza073.png');
  if (s.fehler.length) console.log('Fehler:', s.fehler.slice(0, 3).join(' | '));
  await s.schliessen();
}

if (NUR.includes('spektro')) {
  const bilder = ALLE.map((id) => path.join(ORDNER, `m8e-${id}-fahrt.png`)).filter((d) => fs.existsSync(d));
  if (bilder.length) {
    const s = await starteSpiel({ breite: 900, hoehe: 900 });
    await s.page.goto(`${s.url}/index.html?menue=aus`);
    const url = await s.page.evaluate(async (daten) => {
      const imgs = await Promise.all(daten.map((d) => new Promise((r) => { const b = new Image(); b.onload = () => r(b); b.src = d; })));
      const c = document.createElement('canvas'); c.width = Math.max(...imgs.map((i) => i.width)); c.height = imgs.reduce((a, i) => a + i.height, 0);
      const x = c.getContext('2d'); let y = 0;
      for (const i of imgs) { x.drawImage(i, 0, y); y += i.height; }
      return c.toDataURL('image/png');
    }, bilder.map((d) => `data:image/png;base64,${fs.readFileSync(d).toString('base64')}`));
    speichere('62-spektrogramme-fuenf-motoren.png', url);
    await s.schliessen();
  } else console.log('   (keine Spektrogramme: zuerst node tools/m8e-test.mjs --nur b,h)');
}

if (NUR.includes('tabellen')) {
  const s = await starteSpiel({ breite: 1400, hoehe: 900 });
  for (const datei of fs.readdirSync(ORDNER).filter((d) => /\.md$/.test(d))) {
    const zeilen = fs.readFileSync(path.join(ORDNER, datei), 'utf8').trim().split('\n').filter((z) => z.startsWith('|') && !/^\|-/.test(z.replace(/\s/g, '')));
    const zellen = zeilen.map((z) => z.slice(1, -1).split('|').map((c) => c.trim()));
    const titel = { '60-fahr-messtabelle.md': 'Fahrgefühl M8e – Messtabelle (gegen Prototyp, gerechnet, nicht gespürt)', '61-vergleich-fuenf.md': 'Die fünf Autos im Vergleich (Unterschied zum Prototyp)', '70-ton-messtabelle.md': 'Motorklang M8e – Messtabelle (gegen den Audan, offline gerechnet, nicht gehört)' }[datei] || datei;
    await s.page.setContent(`<html><body style="background:#0d1218;color:#f4f4ee;font:14px monospace;padding:16px"><h3 style="color:#ffd23c;margin:0 0 10px">${titel}</h3><table style="border-collapse:collapse">${zellen.map((z, i) => `<tr>${z.map((c) => `<${i ? 'td' : 'th'} style="border:1px solid #44505c;padding:4px 8px;text-align:left${i ? '' : ';color:#8fb4d8'}">${c}</${i ? 'td' : 'th'}>`).join('')}</tr>`).join('')}</table></body></html>`);
    await s.page.screenshot({ path: path.join(ORDNER, datei.replace(/\.md$/, '.png')), fullPage: true }); console.log('  ', datei.replace(/\.md$/, '.png'));
  }
  await s.schliessen();
}
