// Bilder für Meilenstein 6 (Minimap, Live-Vergleich, Taste H, Einstellungen ANZEIGE): node tools/m6-bilder.mjs
// Schreibt screenshots/m6/: jedes Bild in 1280x720 und in Originalgrösse 320x180 (…-320x180.png).
// Gefahren wird echt (Testfahrer im Spiel, mit Countdown wie ein Spieler); für die Bilder hält die Physik an.

import fs from 'node:fs';
import path from 'node:path';
import { starteSpiel, WURZEL } from './spiel-browser.mjs';

const ORDNER = path.join(WURZEL, 'screenshots/m6');
fs.mkdirSync(ORDNER, { recursive: true });

const spiel = await starteSpiel({ breite: 1280, hoehe: 720 });
const p = spiel.page;
await p.addInitScript(() => { if (!sessionStorage.getItem('m6')) { localStorage.clear(); sessionStorage.setItem('m6', '1'); } });
await spiel.ladeSpiel(false, { menue: true });
const fahrerCode = fs.readFileSync(path.join(WURZEL, 'tools/testfahrer-browser.js'), 'utf8');
await p.evaluate((c) => { window.__fahrerUrl = URL.createObjectURL(new Blob([c], { type: 'text/javascript' })); }, fahrerCode);
const A = (f, arg) => p.evaluate(f, arg);
const bilder = (n) => p.evaluate((n) => new Promise((r) => { let k = 0; const f = () => (++k >= n ? r() : requestAnimationFrame(f)); requestAnimationFrame(f); }), n);
await bilder(25);
const ruhe = async (ms = 700) => { await p.waitForTimeout(ms); await bilder(3); };
// vorher: wird vor jedem der zwei Bilder aufgerufen (z. B. Hinweis "HUD AUS" neu zeigen)
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

// Lauf starten (mit Countdown, wie STARTEN im Menü) und mit dem Testfahrer bis zur Stelle bisS fahren
async function fahre(profil, bisS = Infinity, gas = 1) {
  return A(async ([profil, bisS, gas]) => {
    const f = await import(window.__fahrerUrl), A = window.__alpineRally;
    A.anhalten = true;
    if (A.ablauf.zustand !== 'rennen' || A.rennen.zustand === 'ziel') A.start();
    f.fahreBis(A, profil, { bisS, gas });
    A.kameraSofort(); // die Kamera folgt sonst erst in den nächsten Bildern
    // im Ziel: bis die Zeit eingetragen ist
    for (let n = 0; n < 10 && !A.lauf.zielErledigt && A.rennen.zustand === 'ziel'; n++) A.rennSchritt(A.SCHRITT, { gas: 0, bremse: 0, lenkung: 0 });
    return { s: A.rennen.letztesS, zeit: A.rennen.zeit, end: A.rennen.endZeit, v: A.vergleich.roh };
  }, [profil, bisS, gas]);
}
const setze = (name, wert) => A(async ([n, w]) => (await import('/js/einstellungen.js')).setze(n, w), [name, wert]);

// 1. Bestzeit fahren ("flott", Stehstart), danach ein langsamer Lauf als "letzter Lauf"
console.log('Bestzeit:', await fahre('flott'));
await A(() => { window.__alpineRally.anhalten = false; });

// 2. Countdown: Minimap zu Beginn (Strecke noch ganz blaugrau), kein Vergleich
await A(() => { const A = window.__alpineRally; A.anhalten = true; A.start(); A.lauf.countdown = 1.3; });
await bild('01-countdown-minimap-beginn');

// 3. Langsamer Lauf ("mittel", 90 % Gas) gegen die Bestzeit: rot, mitten in der Etappe
console.log('rot:', await fahre('mittel', 1650, 0.9));
await bild('02-vergleich-rot-minimap-mitte');
// direkt nach Checkpoint 2: Meldung und Vergleich gleichzeitig (Überlappung)
console.log('CP 2:', await fahre('mittel', 1880, 0.9));
await bild('03-vergleich-mit-checkpoint-meldung');
// Pause
await A(() => window.__alpineRally.pausieren());
await bild('04-pause');
await A(() => window.__alpineRally.weiter());
// kurz vor dem Ziel, dann ins Ziel (wird der letzte Lauf)
console.log('vor dem Ziel:', await fahre('mittel', 3560, 0.9));
await bild('05-minimap-kurz-vor-dem-ziel');
console.log('Ziel:', await fahre('mittel', Infinity, 0.9));

// 4. Vergleich mit dem letzten Lauf: "flott" ist schneller -> grün, Etikett LETZT
await setze('vergleichMit', 'letzter');
console.log('grün:', await fahre('flott', 1200));
await bild('06-vergleich-gruen-letzter-lauf');

// 5. HUD aus (Taste H): nur das Bild und kurz der Hinweis
await A(() => window.__alpineRally.hudUmschalten());
await bild('07-hud-aus', () => A(() => { window.__alpineRally.hudSchalter.hinweis = 1.5; }));
await A(() => { window.__alpineRally.hudSchalter.hinweis = 0; });
await bild('08-hud-aus-ohne-hinweis');
await A(() => window.__alpineRally.hudUmschalten());

// 6. Einstellungen mit der Gruppe ANZEIGE (aus der Pause)
async function einstellungenBild(name) {
  await A(() => {
    const A = window.__alpineRally;
    A.pausieren();
    A.menue.oeffne(A.seiten.einstellungen);
    const l = A.seiten.einstellungen.eintraege;
    A.menue.stapel[A.menue.stapel.length - 1].wahl = l.findIndex((e) => e.text === 'einst.vergleich');
    A.menue.neuZeichnen();
  });
  await bild(name);
  await A(() => { const A = window.__alpineRally; A.menue.schliesse(); A.weiter(); });
}
await einstellungenBild('09-einstellungen-anzeige');

// 7. Englisch: Rennen und Einstellungen
await A(async () => { (await import('/js/texte.js')).setzeSprache('en'); });
await setze('sprache', 'en');
await bild('10-englisch-rennen');
await einstellungenBild('11-englisch-einstellungen');
await A(async () => { (await import('/js/texte.js')).setzeSprache('de'); });
await setze('sprache', 'de');

console.log('Fehler:', spiel.fehler.length ? spiel.fehler.join(' | ') : 'keine');
await spiel.schliessen();
