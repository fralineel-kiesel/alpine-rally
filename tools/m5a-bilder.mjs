// Bilder für Meilenstein 5a (Menüs): node tools/m5a-bilder.mjs
// Schreibt screenshots/m5a/: jede Menüseite in 1280x720 und in Originalgrösse 320x180 (…-320x180.png),
// Deutsch und Englisch, dazu die drei Pixelgrössen (320x180 / 480x270 / 640x360) im Rennen.
// Bedient wird alles mit der Tastatur (wie ein Spieler).

import fs from 'node:fs';
import path from 'node:path';
import { starteSpiel, WURZEL } from './spiel-browser.mjs';

const ORDNER = path.join(WURZEL, 'screenshots/m5a');
fs.mkdirSync(ORDNER, { recursive: true });

const spiel = await starteSpiel({ breite: 1280, hoehe: 720 });
const p = spiel.page;
// frischer Browser-Speicher, Standard-Einstellungen
await p.addInitScript(() => { if (!sessionStorage.getItem('m5a')) { localStorage.clear(); sessionStorage.setItem('m5a', '1'); } });
await spiel.ladeSpiel(false, { menue: true });
const A = (f, arg) => p.evaluate(f, arg);
// warten, bis das Spiel wirklich Bilder zeichnet (Software-Grafik ist am Anfang langsam)
const bilder = (n) => p.evaluate((n) => new Promise((r) => { let k = 0; const f = () => (++k >= n ? r() : requestAnimationFrame(f)); requestAnimationFrame(f); }), n);
await bilder(25);

const taste = async (code, n = 1) => { for (let i = 0; i < n; i++) { await p.keyboard.press(code); await p.waitForTimeout(120); } };
// warten: mindestens ms und ein paar Bilder (Seitenwechsel ausgeblendet)
const ruhe = async (ms = 700) => { await p.waitForTimeout(ms); await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(r))))); };
async function bild(name) {
  await ruhe();
  await p.screenshot({ path: path.join(ORDNER, `${name}.png`) });
  await p.setViewportSize({ width: 320, height: 180 });
  await ruhe(500);
  await p.screenshot({ path: path.join(ORDNER, `${name}-320x180.png`) });
  await p.setViewportSize({ width: 1280, height: 720 });
  await ruhe(300);
  console.log('  ', name);
}
const seite = () => A(() => window.__alpineRally.menue.seite.id);
// Pfeil runter drücken, bis Eintrag Nr. nr gewählt ist
async function zu(nr) {
  for (let i = 0; i < 30 && (await A(() => window.__alpineRally.menue.wahl)) !== nr; i++) await taste('ArrowDown');
}
// Eintrag Nr. nr wählen und bestätigen
const oeffne = async (nr) => { await zu(nr); await taste('Enter'); };

async function alleSeiten(spr) {
  // Hauptmenü: 0 STARTEN, 1 AUTO, 2 ETAPPE, 3 BESTZEITEN, 4 EINSTELLUNGEN, 5 STEUERUNG, 6 CREDITS
  await zu(0); await bild(`${spr}-02-hauptmenue`);
  await oeffne(2); await bild(`${spr}-03-etappe`); await taste('Escape');
  await oeffne(1); await bild(`${spr}-04-auto`); await taste('Escape');
  await oeffne(3); await bild(`${spr}-05-bestzeiten`); await taste('Escape');
  // Einstellungen: 1 Vollbild, 2 Pixelgrösse, 3 Pace-Notes, 4 Einheiten, 5 FPS, 7 Tasten, 8 Lenk, 9 Totzone, 11 Lautstärke, 13 Sprache
  await oeffne(4);
  await zu(2); await bild(`${spr}-06-einstellungen-grafik`);
  await zu(8); await bild(`${spr}-07-einstellungen-steuerung`);
  await zu(13); await bild(`${spr}-08-einstellungen-ton-sprache`);
  // Tastenbelegung (Gas, Taste 2 belegen)
  await oeffne(7);
  await bild(`${spr}-09-tastenbelegung`);
  await taste('ArrowRight'); await taste('Enter'); await bild(`${spr}-10-tastenbelegung-beim-belegen`);
  await taste('Escape'); await taste('Escape'); await taste('Escape');
  // Steuerung und Symbol-Legende
  await oeffne(5); await bild(`${spr}-11-steuerung`);
  await taste('Enter'); await bild(`${spr}-12-symbole`);
  await taste('ArrowDown', 12); await bild(`${spr}-13-symbole-weiter-unten`);
  await taste('Escape'); await taste('Escape');
  // Credits
  await oeffne(6); await bild(`${spr}-14-credits`); await taste('Escape');
  await zu(0);
}

// Titel
await bild('de-01-titel');
await taste('Enter');
await alleSeiten('de');
console.log('Seite jetzt:', await seite());

// Pause und Rückfrage (im Rennen)
await taste('Enter'); // STARTEN
await ruhe(1500);
await p.keyboard.down('ArrowUp'); await ruhe(2500); await p.keyboard.up('ArrowUp');
await taste('Escape'); await bild('de-15-pause');
await oeffne(3); await bild('de-16-rueckfrage');
await taste('Escape'); await taste('Escape'); await ruhe(500);

// Englisch: Sprache umstellen über die Einstellungen (aus der Pause)
await taste('Escape'); await oeffne(2);
await zu(13); await taste('ArrowRight'); // Sprache: English
await bild('en-08-einstellungen-ton-sprache');
await taste('Escape'); await zu(0); await bild('en-15-pause');
await oeffne(3); await bild('en-16-rueckfrage');
await zu(2); await taste('Enter'); // JA -> Hauptmenü
await ruhe(1000);
await alleSeiten('en');
// zurück auf Deutsch
await A(() => { const A = window.__alpineRally; A.seiten.einstellungen.eintraege.find((e) => e.text === 'einst.sprache' && e.typ === 'auswahl').setzen('de'); });

// Pixelgrössen im Rennen: gleiche Stelle (Kehren), angehalten
await A(() => window.__alpineRally.start());
await ruhe(500);
for (const [nr, name] of [[0, '320x180'], [1, '480x270'], [2, '640x360']]) {
  await A((nr) => {
    const A = window.__alpineRally;
    A.anhalten = true;
    A.seiten.einstellungen.eintraege.find((e) => e.text === 'einst.aufloesung').setzen(nr);
    A.setzeAuf(1520);
    for (let i = 0; i < 240; i++) A.physikSchritt(A.SCHRITT, { gas: 0.6, bremse: 0, lenkung: 0, handbremse: false });
  }, nr);
  await ruhe(1200);
  await p.screenshot({ path: path.join(ORDNER, `rennen-pixelgroesse-${name}.png`) });
  console.log('   rennen', name, await A(() => window.__alpineRally.renderer.info.render.calls));
}
await A(() => window.__alpineRally.seiten.einstellungen.eintraege.find((e) => e.text === 'einst.aufloesung').setzen(0));
if (spiel.fehler.length) console.log('Fehler im Spiel:', spiel.fehler);
await spiel.schliessen();
