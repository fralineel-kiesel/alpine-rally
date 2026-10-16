// Bilder für Meilenstein 5b (Countdown, Zielbildschirm, Bestzeiten): node tools/m5b-bilder.mjs
// Schreibt screenshots/m5b/: jedes Bild in 1280x720 und in Originalgrösse 320x180 (…-320x180.png).
// Die Zielfahrten werden kurz vor dem Ziel aufgesetzt (Auto fährt echt über die Linie, Endzeit vorgegeben),
// die Bestzeiten-Liste wird vorher passend in den Browser-Speicher geschrieben.

import fs from 'node:fs';
import path from 'node:path';
import { starteSpiel, WURZEL } from './spiel-browser.mjs';

const ORDNER = path.join(WURZEL, 'screenshots/m5b');
fs.mkdirSync(ORDNER, { recursive: true });

const spiel = await starteSpiel({ breite: 1280, hoehe: 720 });
const p = spiel.page;
await p.addInitScript(() => { if (!sessionStorage.getItem('m5b')) { localStorage.clear(); sessionStorage.setItem('m5b', '1'); } });
await spiel.ladeSpiel(false, { menue: true });
const A = (f, arg) => p.evaluate(f, arg);
const bilder = (n) => p.evaluate((n) => new Promise((r) => { let k = 0; const f = () => (++k >= n ? r() : requestAnimationFrame(f)); requestAnimationFrame(f); }), n);
await bilder(25);
const taste = async (code, n = 1) => { for (let i = 0; i < n; i++) { await p.keyboard.press(code); await p.waitForTimeout(120); } };
const ruhe = async (ms = 700) => { await p.waitForTimeout(ms); await bilder(3); };
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
async function zu(nr) { for (let i = 0; i < 40 && (await A(() => window.__alpineRally.menue.wahl)) !== nr; i++) await taste('ArrowDown'); }
const nrVon = (s) => A((s) => { const se = window.__alpineRally.menue.seite; const l = typeof se.eintraege === 'function' ? se.eintraege() : se.eintraege; return l.findIndex((e) => e.text === s && e.typ !== 'gruppe'); }, s);

// Bestzeiten in den Speicher schreiben (Zeiten in Sekunden, Zwischenzeiten im gleichen Verhältnis)
const eintrag = (zeit, tageZurueck) => ({
  zeit, cps: [zeit * 0.205, zeit * 0.574, zeit * 0.885].map((c) => Math.round(c * 100) / 100),
  datum: new Date(Date.now() - tageZurueck * 86400000).toISOString(), auto: 'rt4', aufpralle: 1, resets: 0, hoechstTempo: 40,
});
const setzeListe = (liste) => A((l) => localStorage.setItem('alpineRally.bestzeiten', JSON.stringify({ passstrasse: l })), liste);

// Countdown: am Start, Countdown auf eine feste Stelle gestellt (die Physik wartet)
async function countdownBild(name, sek, go = 0) {
  await A(([sek, go]) => { const A = window.__alpineRally; A.lauf.countdown = sek; A.lauf.go = go; }, [sek, go]);
  await bild(name);
}

// Fahrt ins Ziel mit vorgegebener Endzeit; wartet auf den Zielbildschirm
async function zielFahrt(zeit, stat = { aufpralle: 2, resets: 1, kmh: 151 }) {
  await A(([zeit, stat]) => {
    const A = window.__alpineRally;
    A.start();
    A.anhalten = true;
    const LEER = { gas: 0, bremse: 0, lenkung: 0, handbremse: false };
    while (A.ablauf.zustand === 'countdown') A.rennSchritt(A.SCHRITT, LEER);
    A.setzeAuf(A.strecke.zielS - 35);
    const p = A.physik;
    p.vx = Math.sin(p.richtung) * 24; p.vz = Math.cos(p.richtung) * 24; p.vVor = 24;
    A.rennen.zwischenzeiten = [zeit * 0.207, zeit * 0.571, zeit * 0.884];
    A.rennen.naechsterCp = 3;
    A.stat.aufpralle = stat.aufpralle; A.stat.hoechstTempo = stat.kmh / 3.6; A.rueck.anzahl += stat.resets;
    // bis über die Linie nur fahren (physikSchritt trägt nichts ein), dann die Endzeit setzen und eintragen
    for (let n = 0; n < 1200 && A.rennen.zustand !== 'ziel'; n++) A.physikSchritt(A.SCHRITT, { ...LEER, gas: 0.6 });
    A.rennen.endZeit = zeit; A.rennen.zeit = zeit;
    A.rennSchritt(A.SCHRITT, LEER);
    A.anhalten = false;
  }, [zeit, stat]);
  await p.waitForFunction(() => window.__alpineRally.ablauf.zustand === 'ziel', null, { timeout: 120000 });
  await ruhe(1200);
}

// --- Countdown ---
await taste('Enter'); // Titel -> Hauptmenü
await taste('Enter'); // STARTEN
await ruhe(800);
await A(() => { window.__alpineRally.anhalten = true; });
await countdownBild('01-countdown-3', 0.3);
await countdownBild('02-countdown-2', 1.3);
await countdownBild('03-countdown-1', 2.3);
await countdownBild('04-countdown-go', 3, 0.5);
await A(() => { window.__alpineRally.anhalten = false; });

// --- Zielbildschirm ---
// neue Bestzeit (vorher 2:45.00, jetzt 2:41.37)
await setzeListe([eintrag(165.0, 3), eintrag(171.3, 5)]);
await zielFahrt(161.37);
await bild('05-ziel-neue-bestzeit');
// langsamer (Bestzeit 2:38.12, jetzt 2:41.37): rot
await setzeListe([eintrag(158.12, 3)]);
await zielFahrt(161.37, { aufpralle: 0, resets: 0, kmh: 147 });
await bild('06-ziel-langsamer');
// Platz 5 von 10
await setzeListe([152.4, 155.81, 157.3, 159.95, 162.5, 164.0, 166.66, 169.1, 172.3, 178.0].map((z, i) => eintrag(z, 20 - i)));
await zielFahrt(161.02, { aufpralle: 4, resets: 2, kmh: 139 });
await bild('07-ziel-platz-5-von-10');
// direkt danach: Hauptmenü -> Bestzeiten (der neue Lauf ist hervorgehoben)
await zu(await nrVon('ziel.hauptmenue')); await taste('Enter'); await ruhe(600);
await zu(3); await taste('Enter');
await bild('08-bestzeiten-10-hervorgehoben');
await taste('Escape');
// Einstellungen: Gruppe DATEN, Rückfrage
await zu(4); await taste('Enter');
await zu(await nrVon('einst.bestzeitenLoeschen'));
await bild('09-einstellungen-daten');
await taste('Enter');
await bild('10-rueckfrage-loeschen');
await zu(2); await taste('Enter'); // JA
await bild('11-einstellungen-geloescht');
await taste('Escape');
await zu(3); await taste('Enter');
await bild('12-bestzeiten-leer');
await taste('Escape');
// Englisch und mph
await A(async () => {
  const A = window.__alpineRally;
  const E = await import('/js/einstellungen.js'); const T = await import('/js/texte.js');
  E.setze('sprache', 'en'); T.setzeSprache('en'); E.setze('einheit', 'mph');
});
await setzeListe([eintrag(158.12, 3), eintrag(160.5, 2)]);
await zielFahrt(161.37, { aufpralle: 1, resets: 0, kmh: 150 });
await bild('13-ziel-englisch-mph');
await zu(await nrVon('ziel.hauptmenue')); await taste('Enter'); await ruhe(600);
await zu(3); await taste('Enter');
await bild('14-bestzeiten-englisch');
await taste('Escape');
await A(async () => {
  const E = await import('/js/einstellungen.js'); const T = await import('/js/texte.js');
  E.setze('sprache', 'de'); T.setzeSprache('de'); E.setze('einheit', 'kmh');
});
// erste Zeit überhaupt
await A(() => localStorage.removeItem('alpineRally.bestzeiten'));
await zielFahrt(161.37, { aufpralle: 0, resets: 0, kmh: 152 });
await bild('15-ziel-erste-zeit');
// "ZIEL!" in den ersten 3 Sekunden (vor dem Zielbildschirm)
await A(() => {
  const A = window.__alpineRally;
  A.start({ countdown: false });
  A.anhalten = true;
  A.setzeAuf(A.strecke.zielS - 30);
  const p = A.physik;
  p.vx = Math.sin(p.richtung) * 24; p.vz = Math.cos(p.richtung) * 24; p.vVor = 24;
  A.rennen.zustand = 'laeuft'; A.rennen.zeit = 160; A.rennen.zwischenzeiten = [33, 92, 142]; A.rennen.naechsterCp = 3;
  for (let n = 0; n < 1200 && A.rennen.zustand !== 'ziel'; n++) A.rennSchritt(A.SCHRITT, { gas: 0.6, bremse: 0, lenkung: 0, handbremse: false });
  for (let n = 0; n < 60; n++) A.rennSchritt(A.SCHRITT, { gas: 0, bremse: 0, lenkung: 0, handbremse: false });
});
await bild('16-ziel-vor-dem-zielbildschirm');
await A(() => { window.__alpineRally.anhalten = false; });

console.log(spiel.fehler.length ? `Fehler: ${spiel.fehler.join(' | ')}` : 'keine Fehler');
await spiel.schliessen();
