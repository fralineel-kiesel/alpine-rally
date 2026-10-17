// Bilder für Meilenstein 6.1 (Minimap als Ausschnitt, Vergleich klein, Meldung mit Tafel, Hinweis H): node tools/m61-bilder.mjs
// Schreibt screenshots/m6-1/: jedes Bild in 1280x720 und in Originalgrösse 320x180 (…-320x180.png),
// dazu 00-zoom-vergleich.png (die Minimap aller Zoomwerte an allen Prüfstellen, 4fach vergrössert, nebeneinander).
// Gefahren wird echt (Testfahrer im Spiel, mit Countdown wie ein Spieler); für die Bilder hält die Physik an.

import fs from 'node:fs';
import path from 'node:path';
import { starteSpiel, WURZEL } from './spiel-browser.mjs';

const ORDNER = path.join(WURZEL, 'screenshots/m6-1');
fs.mkdirSync(ORDNER, { recursive: true });
const ZOOMS = [80, 120, 180]; // getestete Werte für hud.minimap.sichtMeter

const spiel = await starteSpiel({ breite: 1280, hoehe: 720 });
const p = spiel.page;
await p.addInitScript(() => { if (!sessionStorage.getItem('m61')) { localStorage.clear(); sessionStorage.setItem('m61', '1'); } });
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

// Lauf starten (mit Countdown, wie STARTEN im Menü) bzw. weiterfahren, mit dem Testfahrer bis zur Stelle bisS
async function fahre(profil, bisS = Infinity, gas = 1) {
  return A(async ([profil, bisS, gas]) => {
    const f = await import(window.__fahrerUrl), A = window.__alpineRally;
    A.anhalten = true;
    if (A.ablauf.zustand !== 'rennen' || A.rennen.zustand === 'ziel') A.start();
    f.fahreBis(A, profil, { bisS, gas });
    A.kameraSofort();
    for (let n = 0; n < 10 && !A.lauf.zielErledigt && A.rennen.zustand === 'ziel'; n++) A.rennSchritt(A.SCHRITT, { gas: 0, bremse: 0, lenkung: 0 });
    return { s: Math.round(A.rennen.letztesS), zeit: +A.rennen.zeit.toFixed(2), meldung: A.hudMeldung(), farbe: A.rennen.meldung && A.rennen.meldung.farbe, v: A.vergleich.roh };
  }, [profil, bisS, gas]);
}
const setze = (name, wert) => A(async ([n, w]) => (await import('/js/einstellungen.js')).setze(n, w), [name, wert]);
const zoom = (m) => A((m) => { const A = window.__alpineRally; A.CONFIG.hud.minimap.sichtMeter = m; A.hud.minimapNeuBauen(); }, m);
const gewaehlt = await A(() => window.__alpineRally.CONFIG.hud.minimap.sichtMeter);

// Prüfstellen: Kehre 1, Schikane, längste Gerade, Almweg-Abzweig (Auto kurz davor, damit man sieht, was kommt)
const orte = await A(() => {
  const A = window.__alpineRally, notes = A.paceNotes.anzeige.notes;
  const teil = (art) => notes.map((n) => n.teile.find((t) => t.art === art)).filter(Boolean);
  const schikane = teil('schikane')[0];
  // lange Gerade: die längste nach den Kehren (die Gerade über die Alp auf dem Almweg), nicht die Startgerade
  const gerade = teil('gerade').filter((g) => g.s > 1500).sort((a, b) => b.laenge - a.laenge)[0];
  return [['kehre', 1170], ['schikane', Math.round(schikane.s - 50)], ['gerade', Math.round(gerade.s + gerade.laenge * 0.35)], ['almweg-abzweig', 1965]]
    .sort((a, b) => a[1] - b[1]);
});
console.log('Prüfstellen:', orte.map(([n, s]) => `${n} ${s} m`).join(', '));

// 1. Bestzeit fahren ("flott", Stehstart)
console.log('Bestzeit:', await fahre('flott'));

// 2. Zoom-Vergleich: an jeder Prüfstelle alle drei Werte
const zoomBilder = [];
for (const [ort, s] of orte) {
  console.log(ort, await fahre('flott', s));
  for (const m of ZOOMS) {
    await zoom(m);
    const name = `01-zoom-${m}m-${ort}`;
    await bild(name);
    zoomBilder.push([ort, m, `${name}-320x180.png`]);
  }
}
await zoom(gewaehlt);

// Vergleichsbild: Minimap-Ausschnitt jeder Aufnahme, 4fach vergrössert (Zeilen = Prüfstellen, Spalten = Zoom)
{
  const daten = zoomBilder.map(([ort, m, datei]) => [ort, m, `data:image/png;base64,${fs.readFileSync(path.join(ORDNER, datei)).toString('base64')}`]);
  const png = await A(async ([daten, zooms]) => {
    const A = window.__alpineRally, mm = A.hud.minimap, k = 4, rand = 4, kopf = 18, links = 140;
    const orteListe = [...new Set(daten.map((d) => d[0]))];
    const b = mm.breite * k, h = mm.hoehe * k;
    const c = document.createElement('canvas');
    c.width = links + zooms.length * (b + rand); c.height = kopf + orteListe.length * (h + rand);
    const x = c.getContext('2d');
    x.fillStyle = '#20242c'; x.fillRect(0, 0, c.width, c.height);
    x.imageSmoothingEnabled = false;
    x.fillStyle = '#f4f4ee'; x.font = '14px monospace';
    zooms.forEach((z, i) => x.fillText(`${z} m`, links + i * (b + rand) + b / 2 - 16, 14));
    for (const [ort, m, url] of daten) {
      const img = new Image(); img.src = url; await img.decode();
      const zeile = orteListe.indexOf(ort), spalte = zooms.indexOf(m);
      if (spalte === 0) x.fillText(ort, 4, kopf + zeile * (h + rand) + h / 2);
      x.drawImage(img, mm.x, mm.y, mm.breite, mm.hoehe, links + spalte * (b + rand), kopf + zeile * (h + rand), b, h);
    }
    return c.toDataURL('image/png');
  }, [daten, ZOOMS]);
  fs.writeFileSync(path.join(ORDNER, '00-zoom-vergleich.png'), Buffer.from(png.split(',')[1], 'base64'));
  console.log('   00-zoom-vergleich');
}

// 3. Langsamer Lauf ("mittel", 90 % Gas) gegen die Bestzeit: rot
await A(() => { const A = window.__alpineRally; A.anhalten = true; A.start(); }); // neuer Lauf mit Countdown
console.log('nach dem Start:', await fahre('mittel', 50, 0.9)); // ca. 28 m nach der Startlinie: Start-Zeichen hinter dem Auto
await bild('02-minimap-start');
console.log('CP 1:', await fahre('mittel', 905, 0.9));
await bild('03-meldung-rot-vergleich-rot');
console.log('Kehre:', await fahre('mittel', 1205, 0.9));
await bild('04-minimap-kurve');
// Checkpoint 2 auslassen (Sprung hinter das Tor)
await A(() => { const A = window.__alpineRally; A.setzeAuf(A.checkpoints[1].s + 10); A.rennSchritt(A.SCHRITT, { gas: 0, bremse: 0, lenkung: 0 }); A.kameraSofort(); });
await bild('05-checkpoint-verpasst');
console.log('vor dem Ziel:', await fahre('mittel', 3590, 0.9));
await bild('06-minimap-kurz-vor-dem-ziel');
console.log('Ziel:', await fahre('mittel', Infinity, 0.9)); // wird der letzte Lauf

// 4. Gegen den letzten (langsamen) Lauf: "flott" ist schneller -> grün, Etikett LETZT
await setze('vergleichMit', 'letzter');
console.log('grün:', await fahre('flott', 905));
await bild('07-meldung-gruen-vergleich-gruen');

// 5. Taste H: Hinweis "HUD AUS", dann "HUD AN"
await A(() => window.__alpineRally.hudUmschalten());
await bild('08-hud-aus', () => A(() => { window.__alpineRally.hudSchalter.hinweis = 1.5; }));
await A(() => window.__alpineRally.hudUmschalten());
await bild('09-hud-an', () => A(() => { window.__alpineRally.hudSchalter.hinweis = 1.5; }));
await A(() => { window.__alpineRally.hudSchalter.hinweis = 0; });

// 6. Englisch: Checkpoint 2 (grün, LAST), dann "HUD OFF"
await A(async () => { (await import('/js/texte.js')).setzeSprache('en'); });
await setze('sprache', 'en');
console.log('englisch:', await fahre('flott', 1875));
await bild('10-englisch-meldung-gruen');
await A(() => window.__alpineRally.hudUmschalten());
await bild('11-englisch-hud-off', () => A(() => { window.__alpineRally.hudSchalter.hinweis = 1.5; }));
await A(() => window.__alpineRally.hudUmschalten());
await A(async () => { (await import('/js/texte.js')).setzeSprache('de'); });
await setze('sprache', 'de');

console.log('Fehler:', spiel.fehler.length ? spiel.fehler.join(' | ') : 'keine');
await spiel.schliessen();
