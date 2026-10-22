// Meilenstein 8g: Bilder nach screenshots/m8g/   node tools/m8g-bilder.mjs [--nur tacho,klassisch,layout,garage,rennen,einstellung]
//   tacho:       je Auto Tempo + Drehzahl im Auto-Stil, 4-fach (Zustand: 4. Gang, Schaltlicht an, Ladedruck 70 %)
//   klassisch:   TACHO = KLASSISCH (3. Gang, 5200/min, 95 km/h), zum Vergleich
//   layout:      die zwei Layouts der Tacho-Vorschau in der Garage (rechts neben dem Auto / Ecke über dem Auto)
//   garage:      Garage mit Tacho-Vorschau (de, 480x270), Zeiger auf Delto und auf Lanza 073
//   rennen:      HUD im Rennen (480x270), Lanza 073 mit Vollgas und Schaltlicht an
//   einstellung: EINSTELLUNGEN mit TACHO (de, 480x270)
// Die Bilder sind für Lino und für mich; ob ein Tacho im Fahren gut lesbar ist, zeigen sie nur bedingt.

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { starteSpiel, WURZEL } from './spiel-browser.mjs';

const arg = (name) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : null; };
const NUR = arg('--nur') ? arg('--nur').split(',') : null;
const teil = (k) => !NUR || NUR.includes(k);
const ORDNER = path.join(WURZEL, 'screenshots/m8g');
fs.mkdirSync(ORDNER, { recursive: true });
const ALLE = ['rt4', 'delto', 'escorta', 'l073', 'imprexa'];
const NAMEN = { rt4: 'audan', delto: 'delto', escorta: 'escorta', l073: 'lanza073', imprexa: 'subora' };
const speichere = (datei, daten) => { fs.writeFileSync(path.join(ORDNER, datei), Buffer.from(daten.split(',')[1], 'base64')); console.log(`screenshots/m8g/${datei}`); };

// Tacho direkt gemalt (wie hud.js), Ausschnitt vergrössert; zustand = { kmh, drehzahl, gang, ladedruck, gas, schaltet }
async function tachoBild(s, id, modus, zustand, faktor = 4, hintergrund = '#6f8f6a') {
  return s.page.evaluate(async ([id, modus, z, faktor, hintergrund]) => {
    const T = await import('/js/tacho.js'), P = await import('/js/pixel.js');
    const c = document.createElement('canvas'); c.width = 320; c.height = 180;
    const ctx = c.getContext('2d');
    const FARBEN = { weiss: '#f4f4ee', gelb: '#ffd23c', rot: '#ff4a3a' };
    const text = (tx, x, y, g = 1, f = 'weiss', a = 'links', sch) => P.pixelText(ctx, tx, x, y, g, FARBEN[f] || f, a, sch);
    const tachos = T.baueTachos(ctx, text);
    tachos.setzeModus(modus);
    tachos.setzeSkala(id);
    for (let n = 0; n < 80; n++) { ctx.clearRect(0, 0, 320, 180); tachos.zeichne(1, z.kmh, z.drehzahl, z.gang, z); }
    // Ausschnitt auf ruhigem Grund (wie Gras/Strasse dahinter), vergrössert ohne Glättung
    const [x, y, b, h] = [205, 110, 115, 70];
    const k = document.createElement('canvas'); k.width = b * faktor; k.height = h * faktor;
    const kc = k.getContext('2d'); kc.imageSmoothingEnabled = false;
    kc.fillStyle = hintergrund; kc.fillRect(0, 0, k.width, k.height);
    kc.drawImage(c, x, y, b, h, 0, 0, b * faktor, h * faktor);
    return k.toDataURL();
  }, [id, modus, zustand, faktor, hintergrund]);
}

const s = await starteSpiel({ breite: 640, hoehe: 360 });
await s.page.goto(`${s.url}/index.html?menue=aus&auto=rt4`);
await s.page.waitForFunction(() => window.__alpineRally, null, { timeout: 120000 });
const FAHRT = { kmh: 95, drehzahl: 5200, gang: '3', ladedruck: 0.5, gas: 1, schaltet: false };
// Schaltlicht an (Mitte zwischen "an" und "blinken" des Autos), 4. Gang, Ladedruck 70 %
const { CONFIG } = await import(pathToFileURL(path.join(WURZEL, 'js/config.js')).href);
const LICHT = (id) => { const S = CONFIG.fahrprofile[id].tacho.schaltlicht; return { kmh: 132, drehzahl: Math.round((S.an + S.blinken) / 2), gang: '4', ladedruck: 0.7, gas: 1, schaltet: false }; };
if (teil('tacho')) for (const [i, id] of ALLE.entries()) speichere(`1${i}-tacho-${NAMEN[id]}-4fach.png`, await tachoBild(s, id, 'auto', LICHT(id)));
if (teil('klassisch')) for (const [i, id] of ALLE.entries()) speichere(`2${i}-tacho-${NAMEN[id]}-klassisch-4fach.png`, await tachoBild(s, id, 'klassisch', FAHRT));
await s.schliessen();

// Garage (de, 480x270): öffnen, Zeiger auf ein Auto (Anzahl Pfeil runter vom Audan aus), optional Layout und Aufheulen
async function garageBild(datei, { runter = 1, lage = null, sprache = 'de', aufl = 1, heulen = false, tacho = 'auto' } = {}) {
  const g = await starteSpiel({ breite: [640, 960, 1280][aufl], hoehe: [360, 540, 720][aufl], auto: '' });
  const p = g.page;
  await p.addInitScript(([sprache, aufl, tacho]) => { try { localStorage.setItem('alpineRally.einstellungen', JSON.stringify({ sprache, aufloesung: aufl, tacho })); } catch { /* egal */ } }, [sprache, aufl, tacho]);
  await p.goto(`${g.url}/index.html`);
  await p.waitForFunction(() => window.__alpineRally && window.__alpineRally.menue, null, { timeout: 120000 });
  for (const k of ['Enter', 'ArrowDown', 'Enter']) { await p.keyboard.press(k); await p.waitForTimeout(150); }
  if (lage) await p.evaluate((l) => { window.__alpineRally.CONFIG.garage.tacho.lage = l; window.__alpineRally.menue.neuZeichnen(); }, lage);
  for (let i = 0; i < runter; i++) { await p.keyboard.press('ArrowDown'); await p.waitForTimeout(150); }
  if (heulen) { await p.keyboard.press('Space'); await p.waitForTimeout(150); }
  await p.waitForFunction(() => window.__alpineRally.menue.einblendung >= 1, null, { timeout: 30000 });
  await p.waitForTimeout(heulen ? 520 : 1500);
  await p.screenshot({ path: path.join(ORDNER, datei) }); console.log(`screenshots/m8g/${datei}`);
  if (g.fehler.length) console.log('Fehler:', g.fehler.slice(0, 3).join(' | '));
  await g.schliessen();
}
if (teil('layout')) {
  await garageBild('30-garage-layout-rechts-480x270.png', { lage: 'rechts' });
  await garageBild('31-garage-layout-ecke-480x270.png', { lage: 'ecke' });
}
if (teil('garage')) {
  await garageBild('40-garage-tacho-480x270.png', { runter: 1 });
  await garageBild('41-garage-lanza073-480x270.png', { runter: 3 });
}

// HUD im Rennen (480x270): Lanza 073 mit Vollgas (Startgerade ab 60 m), angehalten im 2. Gang, wenn das Schaltlicht steht (zwischen "an" und
// "blinken", nicht in der Schaltpause)
if (teil('rennen')) {
  const g = await starteSpiel({ breite: 960, hoehe: 540, auto: '' });
  const p = g.page;
  await p.addInitScript(() => { try { localStorage.setItem('alpineRally.einstellungen', JSON.stringify({ sprache: 'de', aufloesung: 1 })); } catch { /* egal */ } });
  await p.goto(`${g.url}/index.html?menue=aus&auto=l073`);
  await p.waitForFunction(() => window.__alpineRally, null, { timeout: 120000 });
  const z = await p.evaluate(async () => {
    const A = window.__alpineRally, S = A.CONFIG.fahrprofile.l073.tacho.schaltlicht;
    A.start({ countdown: false }); A.anhalten = true; A.setzeAuf(60);
    const e = { gas: 1, bremse: 0, lenkung: 0, handbremse: false, reset: false, debug: false, notes: false };
    let k = 0;
    for (; k < 4000; k++) {
      A.rennSchritt(A.SCHRITT, e);
      const G = A.getriebe;
      if (G.gang >= 2 && !G.schaltet && G.drehzahl > S.an + 60 && G.drehzahl < S.blinken - 60) break;
    }
    const nachSchleife = { k, gang: A.getriebe.anzeige, drehzahl: Math.round(A.getriebe.drehzahl), zustand: A.rennen.zustand };
    A.kameraSofort();
    await new Promise((r) => setTimeout(r, 2500));
    return { nachSchleife, gang: A.getriebe.anzeige, drehzahl: Math.round(A.getriebe.drehzahl), kmh: Math.round(A.physik.tempo * 3.6), lader: A.hud.tachos.anzeige.lade.toFixed(2) };
  });
  console.log('Zustand', JSON.stringify(z));
  await p.screenshot({ path: path.join(ORDNER, '50-rennen-lanza073-schaltlicht-480x270.png') }); console.log('screenshots/m8g/50-rennen-lanza073-schaltlicht-480x270.png');
  if (g.fehler.length) console.log('Fehler:', g.fehler.slice(0, 3).join(' | '));
  await g.schliessen();
}

// EINSTELLUNGEN mit dem Zeiger auf TACHO (de, 480x270)
if (teil('einstellung')) {
  const g = await starteSpiel({ breite: 960, hoehe: 540, auto: '' });
  const p = g.page;
  await p.addInitScript(() => { try { localStorage.setItem('alpineRally.einstellungen', JSON.stringify({ sprache: 'de', aufloesung: 1 })); } catch { /* egal */ } });
  await p.goto(`${g.url}/index.html`);
  await p.waitForFunction(() => window.__alpineRally && window.__alpineRally.menue, null, { timeout: 120000 });
  await p.keyboard.press('Enter'); await p.waitForTimeout(200);
  await p.evaluate(() => { const A = window.__alpineRally; A.menue.oeffne(A.seiten.einstellungen); });
  // Zeiger mit der Tastatur bis TACHO
  for (let i = 0; i < 12; i++) {
    const t = await p.evaluate(() => { const A = window.__alpineRally, o = A.menue.stapel[A.menue.stapel.length - 1]; const e = A.seiten.einstellungen.eintraege[o.wahl]; return e && e.text; });
    if (t === 'einst.tacho') break;
    await p.keyboard.press('ArrowDown'); await p.waitForTimeout(120);
  }
  await p.waitForFunction(() => window.__alpineRally.menue.einblendung >= 1, null, { timeout: 30000 });
  await p.waitForTimeout(800);
  await p.screenshot({ path: path.join(ORDNER, '60-einstellung-tacho-480x270.png') }); console.log('screenshots/m8g/60-einstellung-tacho-480x270.png');
  await g.schliessen();
}

