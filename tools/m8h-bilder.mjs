// Bilder für Meilenstein 8h:  node tools/m8h-bilder.mjs [--nur bestzeiten,klein,ziel,einstellung,leer]
//   bestzeiten  Bestzeiten-Seite (de, 480x270) mit Testdaten aus drei Autos, der letzte Lauf markiert; dazu en
//   klein       dieselbe in 320x180 (das Menü ist in jeder Pixelgrösse 320x180, nur das 3D-Bild dahinter ändert sich)
//   ziel        Zielbildschirm "GESAMTREKORD!" und "NEUE BESTZEIT!" (mit GESAMT PLATZ 2)
//   einstellung EINSTELLUNGEN mit VERGLEICH MIT = BESTZEIT AUTO
//   leer        Bestzeiten-Seite mit einem Auto ohne Zeiten
// Alle Bilder 640x360 (Menü zweifach vergrössert), nach screenshots/m8h/. Testdaten sind erfunden.

import fs from 'node:fs';
import path from 'node:path';
import { starteSpiel, WURZEL } from './spiel-browser.mjs';

const arg = (name) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : null; };
const NUR = arg('--nur') ? arg('--nur').split(',') : null;
const teil = (k) => !NUR || NUR.includes(k);
const ORDNER = path.join(WURZEL, 'screenshots/m8h');
fs.mkdirSync(ORDNER, { recursive: true });

// Testdaten: drei Autos (Zeit, Tag im Oktober)
const DATEN = [
  [152.41, 'rt4', 3], [158.12, 'rt4', 4], [163.95, 'rt4', 6], [155.3, 'rt4', 9], [171.02, 'rt4', 11],
  [150.87, 'delto', 5], [156.2, 'delto', 8],
  [149.62, 'l073', 12], [151.06, 'l073', 14], [153.77, 'l073', 15], [160.4, 'l073', 16], [166.8, 'l073', 17],
  [158.9, 'l073', 18], [162.25, 'l073', 19], [169.5, 'l073', 20], [172.33, 'l073', 21],
];

async function spiel(auto, { aufl = 1, sprache = 'de' } = {}) {
  const s = await starteSpiel({ breite: 640, hoehe: 360, auto });
  await s.page.addInitScript(([aufl, sprache]) => {
    if (!sessionStorage.getItem('m8h')) {
      localStorage.clear();
      localStorage.setItem('alpineRally.einstellungen', JSON.stringify({ aufloesung: aufl, sprache }));
      sessionStorage.setItem('m8h', '1');
    }
  }, [aufl, sprache]);
  await s.page.goto(`${s.url}/index.html`);
  await s.page.waitForFunction(() => window.__alpineRally, null, { timeout: 120000 });
  await s.page.evaluate(async (daten) => {
    const B = await import('/js/bestzeiten.js');
    B.loescheBestzeiten();
    for (const [z, a, tag] of daten) {
      B.speichereBestzeit('passstrasse', { zeit: z, cps: [z * 0.2, z * 0.55, z * 0.9], auto: a, aufpralle: 0, resets: 0, hoechstTempo: 50 });
    }
    // Datum je Eintrag setzen (sonst alle "heute")
    const d = JSON.parse(localStorage.getItem('alpineRally.bestzeiten2'));
    for (const liste of Object.values(d.passstrasse)) for (const e of liste) {
      const x = daten.find(([z, a]) => z === e.zeit && a === e.auto);
      if (x) e.datum = `2026-10-${String(x[2]).padStart(2, '0')}T12:00:00.000Z`;
    }
    localStorage.setItem('alpineRally.bestzeiten2', JSON.stringify(d));
  }, DATEN);
  return s;
}
// Fahrt über die Ziellinie mit vorgegebener Zeit (wie rennablauf-test), dann bis zum Zielbildschirm
async function insZiel(s, zeit) {
  await s.page.evaluate((zeit) => {
    const A = window.__alpineRally;
    const LEER = { gas: 0, bremse: 0, lenkung: 0, handbremse: false, reset: false, debug: false, notes: false };
    A.anhalten = true;
    A.start({ countdown: false });
    A.setzeAuf(A.strecke.zielS - 30);
    const p = A.physik;
    p.vx = Math.sin(p.richtung) * 20; p.vz = Math.cos(p.richtung) * 20; p.vVor = 20;
    A.rennen.zustand = 'laeuft';
    A.rennen.zwischenzeiten = [zeit * 0.2, zeit * 0.55, zeit * 0.9]; A.rennen.naechsterCp = A.checkpoints.length;
    for (let n = 0; n < 2000 && A.rennen.zustand !== 'ziel'; n++) A.physikSchritt(A.SCHRITT, { ...LEER, gas: 0.5 });
    A.rennen.endZeit = zeit; A.rennen.zeit = zeit;
    A.rennSchritt(A.SCHRITT, LEER);
    let n = 0; while (A.ablauf.zustand !== 'ziel' && n < 5000) { A.rennSchritt(A.SCHRITT, LEER); n++; }
    A.anhalten = false;
  }, zeit);
}
const warte = (s, ms = 900) => s.page.waitForTimeout(ms);
async function bild(s, datei) { await s.page.screenshot({ path: path.join(ORDNER, datei) }); console.log(`screenshots/m8h/${datei}`); }
async function bestzeitenOeffnen(s) {
  await s.page.evaluate(() => {
    const A = window.__alpineRally;
    if (A.ablauf.zustand !== 'menue') A.zumHauptmenue();
    A.menue.zeige(A.seiten.haupt, true);
    A.menue.oeffne(A.seiten.bestzeiten, true);
  });
  await warte(s);
}

if (teil('bestzeiten') || teil('klein')) {
  for (const [name, aufl, sprache] of [['bestzeiten', 1, 'de'], ['bestzeiten', 1, 'en'], ['klein', 0, 'de']]) {
    if (!teil(name)) continue;
    const s = await spiel('l073', { aufl, sprache });
    await insZiel(s, 150.12); // Lanza 073: neuer Lauf, Gesamtplatz 2, markiert
    await bestzeitenOeffnen(s);
    await bild(s, `${name === 'klein' ? '02-bestzeiten-320x180' : '01-bestzeiten-480x270'}-${sprache}.png`);
    if (name === 'bestzeiten' && sprache === 'de') {
      await s.page.keyboard.press('ArrowLeft'); await warte(s, 500);
      await bild(s, '03-bestzeiten-delto-480x270-de.png');
    }
    await s.schliessen();
  }
}
if (teil('leer')) {
  const s = await spiel('escorta');
  await bestzeitenOeffnen(s);
  await bild(s, '04-bestzeiten-ohne-zeiten-de.png');
  await s.schliessen();
}
if (teil('ziel')) {
  let s = await spiel('l073');
  await insZiel(s, 147.85);
  await warte(s, 1200);
  await bild(s, '05-ziel-gesamtrekord-de.png');
  await s.schliessen();
  s = await spiel('delto');
  await insZiel(s, 150.31);
  await warte(s, 1200);
  await bild(s, '06-ziel-neue-bestzeit-de.png');
  await s.schliessen();
}
if (teil('einstellung')) {
  const s = await spiel('rt4');
  await s.page.evaluate(() => {
    const A = window.__alpineRally;
    A.ablauf.wechsle('menue');
    A.menue.zeige(A.seiten.haupt, true);
    A.menue.oeffne(A.seiten.einstellungen, true);
  });
  // bis VERGLEICH MIT
  const nr = await s.page.evaluate(() => window.__alpineRally.menue.seite.eintraege.findIndex((e) => e.text === 'einst.vergleichMit'));
  for (let i = 0; i < nr; i++) await s.page.keyboard.press('ArrowDown');
  await warte(s);
  await bild(s, '07-einstellung-vergleich-de.png');
  await s.schliessen();
}
