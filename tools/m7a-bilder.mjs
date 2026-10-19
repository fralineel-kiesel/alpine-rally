// Bilder für Meilenstein 7a (kleinere Minimap, farbige Checkpoint-Punkte, Einstellungen LAUTSTÄRKE, Ton-Labor):
//   node tools/m7a-bilder.mjs
// Schreibt screenshots/m7a/: Spielbilder in 1280x720 und in Originalgrösse 320x180 (…-320x180.png), das Ton-Labor in
// 1280x720 (ganze Seite), dazu 00-minimap-alt-neu.png (Minimap M6.1 gegen M7a an Kehre und Gerade, 4fach vergrössert).
// Die Spektrogramme (10-… bis 16-…) schreibt tools/ton-test.mjs.
// Gefahren wird echt (Testfahrer im Spiel, mit Countdown wie ein Spieler); für die Bilder hält die Physik an.

import fs from 'node:fs';
import path from 'node:path';
import { starteSpiel, WURZEL } from './spiel-browser.mjs';

const ORDNER = path.join(WURZEL, 'screenshots/m7a');
fs.mkdirSync(ORDNER, { recursive: true });

const spiel = await starteSpiel({ breite: 1280, hoehe: 720, args: ['--autoplay-policy=no-user-gesture-required'] });
const p = spiel.page;
await p.addInitScript(() => { if (!sessionStorage.getItem('m7a')) { localStorage.clear(); sessionStorage.setItem('m7a', '1'); } });
await spiel.ladeSpiel(false, { menue: true });
const fahrerCode = fs.readFileSync(path.join(WURZEL, 'tools/testfahrer-browser.js'), 'utf8');
await p.evaluate((c) => { window.__fahrerUrl = URL.createObjectURL(new Blob([c], { type: 'text/javascript' })); }, fahrerCode);
const A = (f, arg) => p.evaluate(f, arg);
const bilder = (n) => p.evaluate((n) => new Promise((r) => { let k = 0; const f = () => (++k >= n ? r() : requestAnimationFrame(f)); requestAnimationFrame(f); }), n);
await bilder(25);
await p.keyboard.press('Enter'); // Titel -> Hauptmenü (Ton entsperrt)
await bilder(10);
const ruhe = async (ms = 700) => { await p.waitForTimeout(ms); await bilder(3); };
async function bild(name, vorher = null) {
  if (vorher) await vorher();
  await ruhe();
  await p.screenshot({ path: path.join(ORDNER, `${name}.png`) });
  await p.setViewportSize({ width: 320, height: 180 });
  if (vorher) await vorher();
  await ruhe(500);
  await p.screenshot({ path: path.join(ORDNER, `${name}-320x180.png`) });
  await p.setViewportSize({ width: 1280, height: 720 });
  await ruhe(300);
  console.log('  ', name);
}
// Testfahrer bis bisS (gas: Faktor fürs Gaspedal); neu = neuer Lauf mit Countdown
async function fahre(bisS = Infinity, gas = 1, neu = false) {
  return A(async ([bisS, gas, neu]) => {
    const f = await import(window.__fahrerUrl), A = window.__alpineRally;
    A.anhalten = true;
    if (neu || A.ablauf.zustand !== 'rennen' || A.rennen.zustand === 'ziel') { A.start(); while (A.ablauf.zustand === 'countdown') A.rennSchritt(A.SCHRITT, { gas: 0, bremse: 0, lenkung: 0 }); }
    f.fahreBis(A, 'flott', { bisS, gas });
    A.kameraSofort();
    for (let n = 0; n < 10 && !A.lauf.zielErledigt && A.rennen.zustand === 'ziel'; n++) A.rennSchritt(A.SCHRITT, { gas: 0, bremse: 0, lenkung: 0 });
    return { s: Math.round(A.rennen.letztesS), zeit: +A.rennen.zeit.toFixed(2), cps: A.rennen.zwischenzeiten.slice(), punkte: A.rennen.cpVergleich.slice() };
  }, [bisS, gas, neu]);
}

// 1. Referenz: ganzer Lauf mit 92 % Gas (wird Bestzeit). Dann: bis CP 1 voll (schneller = grün), bis CP 2 langsam (rot)
const ref = await fahre(Infinity, 0.92, true);
console.log('   Referenz', ref.zeit, ref.cps.join(' / '));
const cp = await A(() => window.__alpineRally.checkpoints.map((c) => c.s));
await A(() => { const A = window.__alpineRally; A.ablauf.wechsle('rennen'); });
const a = await fahre(cp[0] + 20, 1, true);
await bild('01-hud-punkt-gruen');
const b = await fahre(cp[1] + 30, 0.6);
console.log('   Lauf', a.cps.join(' / '), '->', b.cps.join(' / '), 'Punkte', b.punkte.join(' '));
await bild('02-hud-punkte-gruen-rot');
// 2. Kehren in der kleineren Minimap
await fahre(1150, 1, true);
await bild('03-minimap-kehren');

// 3. Minimap alt (M6.1: 61 x 61, 120 m) gegen neu (M7a), 4fach vergrössert, an zwei Stellen
const orte = [1150, 2150];
const teile = [];
for (const s of orte) {
  await fahre(s, 1, true);
  for (const [g, m] of [[61, 120], [49, 95.6]]) {
    await A(([g, m]) => { const A = window.__alpineRally; A.CONFIG.hud.minimap.groesse = g; A.CONFIG.hud.minimap.sichtMeter = m; A.hud.minimapNeuBauen(); }, [g, m]);
    await ruhe(300);
    teile.push(await A(() => {
      const A = window.__alpineRally, m = A.hud.minimap, h = document.getElementById('hud');
      const c = document.createElement('canvas'); c.width = m.breite; c.height = m.hoehe;
      c.getContext('2d').drawImage(h, m.x, m.y, m.breite, m.hoehe, 0, 0, m.breite, m.hoehe);
      return { url: c.toDataURL(), b: m.breite };
    }));
  }
}
await A(() => { const A = window.__alpineRally; A.CONFIG.hud.minimap.groesse = 49; A.CONFIG.hud.minimap.sichtMeter = 95.6; A.hud.minimapNeuBauen(); });
const vergleich = await A(async (teile) => {
  const c = document.createElement('canvas'), z = 4, rand = 20, kopf = 26;
  c.width = rand + 2 * (61 * z + rand); c.height = kopf + 2 * (61 * z + rand + 14);
  const x = c.getContext('2d');
  x.fillStyle = '#0d1218'; x.fillRect(0, 0, c.width, c.height); x.imageSmoothingEnabled = false;
  x.fillStyle = '#f4f4ee'; x.font = '14px monospace';
  x.fillText('M6.1: 61 x 61, 120 m', rand, 18); x.fillText('M7a: 49 x 49, 95.6 m', rand + 61 * z + rand, 18);
  for (let i = 0; i < teile.length; i++) {
    const img = new Image(); img.src = teile[i].url; await img.decode();
    const sp = i % 2, ze = Math.floor(i / 2);
    x.drawImage(img, rand + sp * (61 * z + rand), kopf + ze * (61 * z + rand + 14), teile[i].b * z, teile[i].b * z);
    x.fillStyle = '#aab4be'; x.font = '11px monospace';
    x.fillText(ze === 0 ? 'Kehren (1150 m)' : 'Almweg (2150 m)', rand + sp * (61 * z + rand), kopf + ze * (61 * z + rand + 14) + 61 * z + 12);
  }
  x.fillStyle = '#aab4be'; x.font = '11px monospace';
  x.fillText('gleich viele Pixel pro Meter, 4fach vergrössert', rand + 61 * z + rand, c.height - 6);
  return c.toDataURL('image/png');
}, teile);
fs.writeFileSync(path.join(ORDNER, '00-minimap-alt-neu.png'), Buffer.from(vergleich.split(',')[1], 'base64'));
console.log('   00-minimap-alt-neu');

// 4. Einstellungen, LAUTSTÄRKE gewählt (Hinweis darunter)
await A(() => { const A = window.__alpineRally; A.anhalten = false; A.zumHauptmenue(); });
await ruhe(800);
const zuLaut = () => A(() => {
  const A = window.__alpineRally, m = A.menue;
  if (!m.seite || m.seite.id !== 'einstellungen') m.oeffne(A.seiten.einstellungen, true);
  const n = m.seite.eintraege.findIndex((e) => e.text === 'einst.lautstaerke');
  for (let k = 0; k < 40 && m.wahl !== n; k++) m.runter();
});
await bild('04-einstellungen-lautstaerke', zuLaut);
await A(async () => { (await import('/js/texte.js')).setzeSprache('en'); });
await bild('05-einstellungen-lautstaerke-englisch', zuLaut);
await A(async () => { (await import('/js/texte.js')).setzeSprache('de'); });

// 5. Ton-Labor (ganze Seite), nach TON STARTEN mit etwas Motor und einem Aufprall
const labor = p; // (das Spiel ist fertig, dieselbe Seite lädt jetzt das Labor)
await labor.goto(`${spiel.url}/ton-labor.html`);
await labor.click('#tonStarten');
await labor.waitForFunction(() => window.__tonLabor.ton.werk && window.__tonLabor.ton.werk.aufbau.fertig);
await labor.fill('#drehzahl', '5200'); await labor.dispatchEvent('#drehzahl', 'input');
await labor.fill('#gas', '0.8'); await labor.dispatchEvent('#gas', 'input');
await labor.fill('#tempo', '110'); await labor.dispatchEvent('#tempo', 'input');
await labor.waitForTimeout(600);
await labor.click('button[data-tu="aufprall:metall:16"]');
await labor.waitForTimeout(120);
await labor.screenshot({ path: path.join(ORDNER, '06-ton-labor.png'), fullPage: true });
console.log('   06-ton-labor');
if (spiel.fehler.length) console.log('Fehler:', spiel.fehler.join(' | '));
await spiel.schliessen();
