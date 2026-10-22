// Test für Meilenstein 5b (Countdown, Zielbildschirm, Bestzeiten, Statistik):  node tools/rennablauf-test.mjs
//  (a) Countdown: Auto bewegt sich bei Gas nicht (auch am Hang), Zeit bleibt 0, Dauer stimmt, bei GO Zeit ab 0
//  (b) Pause im Countdown friert ein und läuft nahtlos weiter
//  (c) Testfahrer bis ins Ziel: Zielbildschirm nach der eingestellten Zeit, richtige Endzeit
//  (d) Speichern: Zwischenzeiten, sortiert, nie mehr als 10, Verdrängen, Platz, "neue Bestzeit" nur bei Verbesserung
//  (e) Vergleich: Plus/Minus und Farbe, Zwischenzeit-Unterschiede, erster Lauf = ERSTE ZEIT
//  (f) ohne Browser-Speicher: kein Fehler, Hinweis, Spiel läuft weiter
//  (g) Statistik: Baumaufprall zählt 1, R-Reset zählt 1, Höchsttempo, alles 0 bei Neustart, Demo zählt nichts
//  (h) NEU STARTEN aus dem Zielbildschirm (Countdown, Zeit 0, Checkpoints zurück), HAUPTMENÜ (Demo fährt);
//      dazu mit simuliertem Gamepad: A = STARTEN / NEU STARTEN, Y = Neu starten, B und Start tun im Zielbildschirm nichts
//  (i) BESTZEITEN-Seite zeigt Zeilen; Löschen mit Rückfrage (NEIN löscht nichts, JA alles)
//  (j) neue Texte in de und en, alle Zeichen in der Pixelschrift
//  (k) alte Bestzeiten (nur zeit, cps, datum) werden gelesen
// Dazu: keine Fehler in der Konsole.

import fs from 'node:fs';
import path from 'node:path';
import { starteSpiel, WURZEL, AUTO } from './spiel-browser.mjs';

let fehlerZahl = 0;
const pruefe = (ok, text, info = '') => {
  console.log(`  ${ok ? 'OK   ' : 'FEHLER'} ${text}${info ? `  (${info})` : ''}`);
  if (!ok) fehlerZahl++;
};
const fahrerCode = fs.readFileSync(path.join(WURZEL, 'tools/testfahrer-browser.js'), 'utf8');

async function lade(opt = {}) {
  const spiel = await starteSpiel({ breite: 640, hoehe: 360 });
  if (opt.gamepad) {
    // simuliertes Gamepad (Standard-Belegung): window.__knopf = Nummer des gedrückten Knopfs, -1 = keiner
    await spiel.page.addInitScript(() => {
      window.__knopf = -1;
      navigator.getGamepads = () => [{ connected: true, axes: [0, 0], buttons: Array.from({ length: 17 }, (_, i) => ({ pressed: i === window.__knopf, value: i === window.__knopf ? 1 : 0 })) }];
    });
  }
  if (opt.ohneSpeicher) {
    await spiel.page.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', { configurable: true, get() { throw new DOMException('blockiert', 'SecurityError'); } });
    });
  }
  await spiel.ladeSpiel(false, { menue: true });
  await bilderAbwarten(spiel.page);
  // Hilfen im Spiel (nur für diesen Test)
  await spiel.page.evaluate((code) => {
    window.__fahrerUrl = URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
    const A = window.__alpineRally;
    const LEER = { gas: 0, bremse: 0, lenkung: 0, handbremse: false, reset: false, debug: false, notes: false };
    window.__T = {
      LEER,
      // Countdown im Zeitraffer überspringen (Physik von aussen)
      ueberCountdown() { let n = 0; while (A.ablauf.zustand === 'countdown' && n < 2000) { A.rennSchritt(A.SCHRITT, LEER); n++; } return n; },
      // Fahrt über die Ziellinie mit vorgegebener Endzeit und Zwischenzeiten (alle CPs passiert).
      // Gefahren wird mit physikSchritt (ohne Eintragen), dann die Zeit gesetzt, dann ein rennSchritt (trägt ein)
      insZiel(zeit, cps, { countdown = true } = {}) {
        A.anhalten = true;
        A.start({ countdown });
        this.ueberCountdown();
        A.setzeAuf(A.strecke.zielS - 30);
        const p = A.physik;
        p.vx = Math.sin(p.richtung) * 20; p.vz = Math.cos(p.richtung) * 20; p.vVor = 20;
        A.rennen.zustand = 'laeuft';
        A.rennen.zwischenzeiten = cps.slice(); A.rennen.naechsterCp = A.checkpoints.length;
        for (let n = 0; n < 2000 && A.rennen.zustand !== 'ziel'; n++) A.physikSchritt(A.SCHRITT, { ...LEER, gas: 0.5 });
        A.rennen.endZeit = zeit; A.rennen.zeit = zeit;
        A.rennSchritt(A.SCHRITT, LEER);
        return A.lauf.ergebnis;
      },
      // bis der Zielbildschirm da ist (Schritte zählen)
      bisZielschirm() { let n = 0; while (A.ablauf.zustand !== 'ziel' && n < 5000) { A.rennSchritt(A.SCHRITT, LEER); n++; } return n; },
      // Zeilen des Zielbildschirms (Text und Farbe)
      zielZeilen() {
        return A.seiten.ziel.eintraege().map((e) => ({ typ: e.typ, text: e.inhalt ? e.inhalt() : e.text, farbe: e.farbe || null }));
      },
      // M8h: Bestzeiten liegen je Auto unter "alpineRally.bestzeiten2"; hier wie früher als eine Liste je Etappe (alle Autos)
      speicher() {
        try {
          const d = JSON.parse(localStorage.getItem('alpineRally.bestzeiten2') || 'null');
          return d && Object.fromEntries(Object.entries(d).map(([k, je]) => [k, Object.values(je).flat()]));
        } catch { return 'blockiert'; }
      },
    };
  }, fahrerCode);
  return spiel;
}
async function bilderAbwarten(p, n = 3) {
  await p.evaluate((n) => new Promise((r) => { let k = 0; const f = () => (++k >= n ? r() : requestAnimationFrame(f)); requestAnimationFrame(f); }), n);
}
const A = (p, f, arg) => p.evaluate(f, arg);
const zustand = (p) => A(p, () => window.__alpineRally.ablauf.zustand);
const seite = (p) => A(p, () => window.__alpineRally.menue.seite && window.__alpineRally.menue.seite.id);
const wahl = (p) => A(p, () => window.__alpineRally.menue.wahl);
async function taste(p, code, n = 1) { for (let i = 0; i < n; i++) await p.keyboard.press(code); }
async function zu(p, nr) { for (let i = 0; i < 40 && (await wahl(p)) !== nr; i++) await taste(p, 'ArrowDown'); return (await wahl(p)) === nr; }
const nrVon = (p, schluessel) => A(p, (s) => {
  const se = window.__alpineRally.menue.seite;
  const l = typeof se.eintraege === 'function' ? se.eintraege() : se.eintraege;
  return l.findIndex((e) => (e.text === s || e.typ === s) && e.typ !== 'gruppe');
}, schluessel);
const fmt = (s) => `${Math.floor(s / 60)}:${(s % 60).toFixed(2).padStart(5, '0')}`;

// =====================================================================
console.log('(a) Countdown');
{
  const spiel = await lade();
  const p = spiel.page;
  // echte Spielschleife: STARTEN mit der Tastatur, Vollgas, Lenken, Handbremse, Rückwärts gehalten
  await taste(p, 'Enter'); await zu(p, 0); await taste(p, 'Enter');
  const z0 = await zustand(p);
  const pos0 = await A(p, () => { const A = window.__alpineRally; return { x: A.physik.x, z: A.physik.z, w: A.physik.richtung, s: A.rennen.letztesS }; });
  await p.keyboard.down('ArrowUp'); await p.keyboard.down('ArrowLeft'); await p.keyboard.down('Space');
  await A(p, () => { window.__alpineRally.testEingabe = { gas: 1, bremse: 1, lenkung: -1, handbremse: true }; });
  await p.waitForFunction(() => window.__alpineRally.lauf.countdown > 1.2, null, { timeout: 120000 });
  // R und N tun nichts
  const notesVor = await A(p, () => window.__alpineRally.paceNotes.anzeige.an);
  await taste(p, 'KeyR'); await taste(p, 'KeyN'); await bilderAbwarten(p, 3);
  const mitte = await A(p, () => {
    const A = window.__alpineRally;
    return { x: A.physik.x, z: A.physik.z, w: A.physik.richtung, v: A.physik.tempo, zeit: A.rennen.zeit, rz: A.rennen.zustand, cd: A.lauf.countdown,
      rueck: A.rueck.rest, notes: A.paceNotes.anzeige.an, kacheln: A.paceNotes.anzeige.anzahl, zust: A.ablauf.zustand, r: A.rTaste() };
  });
  // Pace-Notes: gleiche Anzeige wie früher vor dem Start an derselben Stelle (stehend, Zustand "bereit")
  const pnFrueher = await A(p, () => {
    const A = window.__alpineRally, PN = A.paceNotes, s = A.rennen.letztesS;
    const sicher = JSON.stringify(PN.anzeige.kacheln.slice(0, PN.anzeige.anzahl));
    PN.zuruecksetzen();
    for (let k = 0; k < 120; k++) PN.aktualisiere(A.SCHRITT, s, 0, 'bereit');
    return { n: PN.anzeige.anzahl, gleich: sicher === JSON.stringify(PN.anzeige.kacheln.slice(0, PN.anzeige.anzahl)) };
  });
  await A(p, () => { window.__alpineRally.testEingabe = null; });
  await p.keyboard.up('ArrowUp'); await p.keyboard.up('ArrowLeft'); await p.keyboard.up('Space');
  const C = await A(p, () => ({ start: window.__alpineRally.strecke.startS, halb: window.__alpineRally.CONFIG.grenze.wandHuelle.laenge / 2, vor: window.__alpineRally.CONFIG.rennablauf.schnauzeVorLinie }));
  pruefe(z0 === 'countdown', 'STARTEN führt in den Countdown');
  pruefe(Math.abs(pos0.s - (C.start - C.halb - C.vor)) < 0.05, 'Auto steht mit der Schnauze an der Startlinie',
    `Mitte bei ${pos0.s.toFixed(2)} m, Schnauze ${(pos0.s + C.halb).toFixed(2)} m, Startlinie ${C.start} m`);
  pruefe(mitte.x === pos0.x && mitte.z === pos0.z && mitte.w === pos0.w && mitte.v === 0, 'Gas, Lenken, Handbremse, Bremse gehalten: Auto bewegt sich keinen Millimeter',
    `nach ${mitte.cd.toFixed(2)} s Countdown, Tempo ${mitte.v}`);
  pruefe(mitte.zeit === 0 && mitte.rz === 'bereit' && mitte.zust === 'countdown', 'Rennzeit bleibt 0 im Countdown');
  pruefe(mitte.rueck === 0 && mitte.r === 'gesperrt' && mitte.notes === notesVor, 'R und Pace-Notes-Taste tun im Countdown nichts', `rTaste() = "${mitte.r}"`);
  pruefe(mitte.kacheln === pnFrueher.n && pnFrueher.gleich, 'Pace-Notes im Countdown wie früher vor dem Start (stehend: erste Kurve noch über 50 m weit weg)',
    `${mitte.kacheln} Kachel(n), früher an derselben Stelle ${pnFrueher.n}`);
  // genaue Dauer im Zeitraffer (feste Schritte wie in der Spielschleife)
  const d = await A(p, () => {
    const A = window.__alpineRally, T = window.__T;
    A.anhalten = true;
    A.start();
    const gas = { ...T.LEER, gas: 1, lenkung: 1 };
    let n = 0;
    const x0 = A.physik.x, z0 = A.physik.z;
    let bewegt = false, zeitVorher = 0;
    while (A.rennen.zustand !== 'laeuft' && n < 2000) {
      A.rennSchritt(A.SCHRITT, gas); n++;
      if (A.physik.x !== x0 || A.physik.z !== z0) bewegt = true;
      if (A.rennen.zustand !== 'laeuft') zeitVorher = Math.max(zeitVorher, A.rennen.zeit);
    }
    const zeitBeiGo = A.rennen.zeit, zustBeiGo = A.ablauf.zustand, go = A.lauf.go;
    let m = 0;
    while (m < 120) { A.rennSchritt(A.SCHRITT, gas); m++; }
    const nach1s = { zeit: A.rennen.zeit, v: A.physik.tempo, weg: Math.hypot(A.physik.x - x0, A.physik.z - z0) };
    // am Hang: steilste Stelle der Strasse in den ersten 800 m suchen, dort Countdown
    let best = 0, sBest = 0;
    for (let s = 30; s < 800; s += 2) { const a = A.strecke.punktBei(s), b = A.strecke.punktBei(s + 4); const g = Math.abs(b.h - a.h) / 4; if (g > best) { best = g; sBest = s; } }
    A.start();
    A.setzeAuf(sBest);
    const xh = A.physik.x, zh = A.physik.z;
    for (let k = 0; k < 300; k++) A.rennSchritt(A.SCHRITT, T.LEER);
    const hang = { s: sBest, gefaelle: best, weg: Math.hypot(A.physik.x - xh, A.physik.z - zh) };
    return { n, dauer: 3 * A.CONFIG.rennablauf.zahlDauer, schritt: A.SCHRITT, bewegt, zeitVorher, zeitBeiGo, zustBeiGo, go, nach1s, hang };
  });
  const soll = Math.round(d.dauer / d.schritt);
  pruefe(Math.abs(d.n - soll) <= 1 && !d.bewegt && d.zeitVorher === 0, `Countdown dauert ${(d.n * d.schritt).toFixed(3)} s (eingestellt ${d.dauer} s, ±1 Bild), Auto steht bis GO`,
    `${d.n} Schritte, soll ${soll}`);
  pruefe(d.zeitBeiGo === 0 && d.zustBeiGo === 'rennen' && d.go > 0, 'bei GO: Zeit beginnt bei 0, Zustand Rennen, GO! wird angezeigt');
  pruefe(Math.abs(d.nach1s.zeit - 1) < 0.005 && d.nach1s.v > 2 && d.nach1s.weg > 1, 'nach GO läuft die Zeit ab 0 und das Auto fährt los',
    `1 s nach GO: Zeit ${d.nach1s.zeit.toFixed(3)} s, ${(d.nach1s.v * 3.6).toFixed(0)} km/h, ${d.nach1s.weg.toFixed(1)} m`);
  pruefe(d.hang.weg === 0, 'am Hang: Auto bleibt im Countdown stehen (kein Verrutschen)', `${d.hang.s} m, Gefälle ${(d.hang.gefaelle * 100).toFixed(1)} %`);
  // Testweg: ohne Countdown wie vor M5b
  const t = await A(p, () => {
    const A = window.__alpineRally, s = A.strecke.punktBei(A.CONFIG.strasse.spawnBeiMeter);
    A.start({ countdown: false });
    return { zust: A.ablauf.zustand, d: Math.hypot(A.physik.x - s.x, A.physik.z - s.z), rz: A.rennen.zustand };
  });
  pruefe(t.zust === 'rennen' && t.d < 0.01 && t.rz === 'bereit', 'start({ countdown: false }): ohne Countdown, Auto bei spawnBeiMeter (Testweg wie vor M5b)');
  await A(p, () => { window.__alpineRally.anhalten = false; });
  pruefe(spiel.fehler.length === 0, 'keine Fehler in der Konsole', spiel.fehler.join(' | '));
  await spiel.schliessen();
}

// =====================================================================
console.log('(b) Pause im Countdown');
{
  const spiel = await lade();
  const p = spiel.page;
  await taste(p, 'Enter'); await zu(p, 0); await taste(p, 'Enter');
  await p.waitForFunction(() => window.__alpineRally.lauf.countdown > 0.6, null, { timeout: 120000 });
  await taste(p, 'Escape'); await bilderAbwarten(p, 2);
  const c1 = await A(p, () => ({ z: window.__alpineRally.ablauf.zustand, cd: window.__alpineRally.lauf.countdown, s: window.__alpineRally.menue.seite.id }));
  await p.waitForTimeout(2500);
  const c2 = await A(p, () => window.__alpineRally.lauf.countdown);
  await taste(p, 'Escape'); // WEITER
  await bilderAbwarten(p, 1);
  const c3 = await A(p, () => ({ z: window.__alpineRally.ablauf.zustand, cd: window.__alpineRally.lauf.countdown }));
  await bilderAbwarten(p, 4);
  const c4 = await A(p, () => window.__alpineRally.lauf.countdown);
  pruefe(c1.z === 'pause' && c1.s === 'pause' && c2 === c1.cd, 'Esc im Countdown: Pause, Countdown steht', `${c1.cd.toFixed(3)} s -> nach 2.5 s ${c2.toFixed(3)} s`);
  pruefe(c3.z === 'countdown' && c3.cd - c2 <= 0.11 && c4 > c3.cd, 'WEITER: Countdown läuft nahtlos weiter', `+${(c3.cd - c2).toFixed(3)} s im ersten Bild, dann ${c4.toFixed(2)} s`);
  // Fokusverlust
  await A(p, () => window.dispatchEvent(new Event('blur')));
  const f = await A(p, () => ({ z: window.__alpineRally.ablauf.zustand, cd: window.__alpineRally.lauf.countdown }));
  await p.waitForTimeout(800);
  const f2 = await A(p, () => window.__alpineRally.lauf.countdown);
  await taste(p, 'Escape');
  await p.waitForFunction(() => window.__alpineRally.ablauf.zustand === 'rennen', null, { timeout: 120000 });
  const go = await A(p, () => ({ zeit: window.__alpineRally.rennen.zeit, rz: window.__alpineRally.rennen.zustand }));
  pruefe(f.z === 'pause' && f2 === f.cd, 'Fokusverlust im Countdown: Pause, eingefroren');
  pruefe(go.rz === 'laeuft' && go.zeit < 1, 'danach weiter bis GO, Rennen läuft', `Zeit ${go.zeit.toFixed(2)} s kurz nach GO`);
  // Neustart der Etappe aus der Pause im Countdown: Countdown von vorn
  await p.waitForFunction(() => window.__alpineRally.rennen.zeit > 0.3, null, { timeout: 120000 });
  await taste(p, 'Escape'); await bilderAbwarten(p, 2);
  await zu(p, 1); await taste(p, 'Enter');
  const n = await A(p, () => ({ z: window.__alpineRally.ablauf.zustand, cd: window.__alpineRally.lauf.countdown, zeit: window.__alpineRally.rennen.zeit }));
  pruefe(n.z === 'countdown' && n.cd < 0.2 && n.zeit === 0, 'Pause -> NEUSTART DER ETAPPE beginnt mit dem Countdown');
  pruefe(spiel.fehler.length === 0, 'keine Fehler in der Konsole', spiel.fehler.join(' | '));
  await spiel.schliessen();
}

// =====================================================================
console.log('(c) Testfahrer bis ins Ziel, Zielbildschirm');
{
  const spiel = await lade();
  const p = spiel.page;
  await taste(p, 'Enter');
  const r = await A(p, async () => {
    const A = window.__alpineRally;
    const f = await import(window.__fahrerUrl);
    A.anhalten = true;
    A.start({ countdown: false });
    const fahrt = f.fahreEtappe(A, 'flott');
    const vorher = { zust: A.ablauf.zustand, rz: A.rennen.zustand, end: A.rennen.endZeit };
    const n = window.__T.bisZielschirm();
    return { fahrt, vorher, n, nach: A.ablauf.zustand, erg: A.lauf.ergebnis, soll: A.CONFIG.rennablauf.zielSchirmNach, schritt: A.SCHRITT, seite: A.menue.seite.id, zeilen: window.__T.zielZeilen() };
  });
  const soll = Math.round(r.soll / r.schritt);
  pruefe(r.fahrt.ziel && r.vorher.zust === 'rennen' && r.vorher.rz === 'ziel', `Testfahrer "flott" im Ziel: ${fmt(r.fahrt.zeit)}`);
  pruefe(Math.abs(r.n - soll) <= 1 && r.nach === 'ziel' && r.seite === 'ziel', `Zielbildschirm erscheint nach ${(r.n * r.schritt).toFixed(3)} s (eingestellt ${r.soll} s)`, `${r.n} Schritte`);
  const gross = r.zeilen.find((z) => /^\d\d:\d\d\.\d\d$/.test(z.text));
  const zeitText = await A(p, async (z) => (await import('/js/hud.js')).formatZeit(z), r.fahrt.zeit);
  pruefe(r.erg && r.erg.zeit === r.fahrt.zeit && gross && gross.text === zeitText, 'Zielbildschirm zeigt die richtige Endzeit', `${gross && gross.text}`);
  pruefe(r.zeilen.some((z) => z.text === 'ERSTE ZEIT') && !r.erg.neueBest, 'erster Lauf: "ERSTE ZEIT", keine "neue Bestzeit"');
  // der Testweg (ohne Countdown) ändert die Testfahrer-Zeit nicht
  // (M8c: mit --auto die Zeit des Testfahrers mit diesem Auto, siehe STAND.md M8c; Standard prototyp: 2:31.92 wie bisher)
  const sollZeit = { prototyp: '2:31.92', rt4: '2:31.22', delto: '2:31.22', escorta: '2:34.68' }[AUTO] || '2:31.92';
  pruefe(fmt(r.fahrt.zeit) === sollZeit, `Testfahrer-Zeit "flott" unverändert ${sollZeit}`, fmt(r.fahrt.zeit));
  // Esc tut im Zielbildschirm nichts
  await A(p, () => { window.__alpineRally.anhalten = false; });
  await bilderAbwarten(p, 3);
  await taste(p, 'Escape'); await taste(p, 'Backspace'); await bilderAbwarten(p, 3);
  pruefe((await zustand(p)) === 'ziel' && (await seite(p)) === 'ziel' && (await wahl(p)) === (await nrVon(p, 'ziel.neuStarten')),
    'Esc / Rücktaste tun im Zielbildschirm nichts; NEU STARTEN ist vorgewählt');
  await A(p, () => window.dispatchEvent(new Event('blur')));
  pruefe((await zustand(p)) === 'ziel', 'keine Pause im Zielbildschirm (auch nicht bei Fokusverlust)');
  pruefe(spiel.fehler.length === 0, 'keine Fehler in der Konsole', spiel.fehler.join(' | '));
  await spiel.schliessen();
}

// =====================================================================
console.log('(d) Speichern, (e) Vergleich');
{
  const spiel = await lade();
  const p = spiel.page;
  // (d) direkt mit bestzeiten.js
  const d = await A(p, async () => {
    const B = await import('/js/bestzeiten.js');
    localStorage.removeItem('alpineRally.bestzeiten'); localStorage.removeItem('alpineRally.bestzeiten2'); // (M8h: beide Schlüssel)
    const cps = (z) => [z * 0.2, z * 0.5, z * 0.9];
    const plaetze = [];
    for (const z of [170, 160, 180, 165, 175, 150, 185, 155, 190, 162]) plaetze.push(B.speichereBestzeit('passstrasse', { zeit: z, cps: cps(z), auto: 'rt4', aufpralle: 1, resets: 2, hoechstTempo: 40 }).platz);
    const voll = B.ladeBestzeiten('passstrasse').map((e) => e.zeit);
    const elf = B.speichereBestzeit('passstrasse', { zeit: 158, cps: cps(158), auto: 'rt4', aufpralle: 0, resets: 0, hoechstTempo: 41 });
    const nachElf = B.ladeBestzeiten('passstrasse').map((e) => e.zeit);
    const langsam = B.speichereBestzeit('passstrasse', { zeit: 200, cps: cps(200), auto: 'rt4', aufpralle: 0, resets: 0, hoechstTempo: 30 });
    const nachLangsam = B.ladeBestzeiten('passstrasse').map((e) => e.zeit);
    // gleiche Zeit wie Platz 3: kommt dahinter (die ältere steht vorn)
    const gleich = B.speichereBestzeit('passstrasse', { zeit: 158.004, cps: cps(158), auto: 'rt4', aufpralle: 0, resets: 0, hoechstTempo: 41 });
    const liste = B.ladeBestzeiten('passstrasse');
    const roh = JSON.parse(localStorage.getItem('alpineRally.bestzeiten2')).passstrasse.rt4; // (M8h: Liste des Autos)
    return { plaetze, voll, elf, nachElf, langsam, nachLangsam, gleich, liste, rohAnzahl: roh.length, ersterRoh: roh[0] };
  });
  const sortiert = (l) => l.every((z, i) => i === 0 || l[i - 1] <= z);
  pruefe(d.voll.length === 10 && sortiert(d.voll) && d.plaetze.join() === '1,1,3,2,4,1,7,2,9,4', '10 Läufe: sortiert, Platz beim Eintragen stimmt', `Plätze ${d.plaetze.join(', ')}`);
  pruefe(d.elf.platz === 3 && d.nachElf.length === 10 && !d.nachElf.includes(190) && d.nachElf.includes(158) && sortiert(d.nachElf),
    'elfter schnellerer Lauf (2:38.00) verdrängt den langsamsten (3:10.00), nie mehr als 10', `Platz ${d.elf.platz}`);
  pruefe(d.langsam.platz === 0 && JSON.stringify(d.nachLangsam) === JSON.stringify(d.nachElf), 'langsamerer Lauf bei vollen 10 kommt nicht hinein (Platz 0)');
  pruefe(d.gleich.platz === 4 && d.liste[2].zeit === 158 && d.liste[3].zeit === 158.004 && d.rohAnzahl === 10, 'gleiche Zeit (in Hundertsteln): die ältere steht vorn', `Platz ${d.gleich.platz}`);
  const e0 = d.ersterRoh;
  pruefe(e0.zeit === 150 && e0.cps.length === 3 && e0.cps[1] === 75 && e0.auto === 'rt4' && e0.aufpralle === 1 && e0.resets === 2 && e0.hoechstTempo === 40 && !Number.isNaN(Date.parse(e0.datum)),
    'Eintrag mit Zwischenzeiten, Auto, Aufprallen, Resets, Höchsttempo, Datum', JSON.stringify(e0).slice(0, 110));
  // (d)+(e) über echte Zielfahrten: neue Bestzeit nur bei echter Verbesserung, Vergleich mit der Bestzeit vor dem Lauf
  const e = await A(p, () => {
    const A = window.__alpineRally, T = window.__T;
    localStorage.removeItem('alpineRally.bestzeiten'); localStorage.removeItem('alpineRally.bestzeiten2');
    const lauf = (zeit, cps) => { const erg = T.insZiel(zeit, cps); return { erg: JSON.parse(JSON.stringify(erg)), zeilen: T.zielZeilen(), titel: A.seiten.ziel.titel() }; };
    return {
      erst: lauf(160.5, [33.2, 92.1, 141.0]),
      // (Zeiten so gewählt, dass x * 100 nicht knapp unter einer ganzen Zahl liegt: 161.73 * 100 = 16172.99..., das Spiel
      //  schneidet wie die HUD-Anzeige ab und zeigt 02:41.72)
      langsamer: lauf(161.735, [33.0, 93.33, 141.0]),    // +1.23, CPs -0.20 / +1.23 / 0.00
      gleich: lauf(160.509, [33.2, 92.1, 141.0]),        // gleich (in Hundertsteln)
      schneller: lauf(159.705, [32.9, 91.5, 140.2]),     // -0.80
      C: A.CONFIG.rennablauf,
    };
  });
  const diff = (l) => l.zeilen.find((z) => /^[+-]?\d+\.\d\d$/.test(z.text));
  const cpZ = (l) => l.zeilen.filter((z) => /^CP \d/.test(z.text));
  pruefe(e.erst.zeilen.some((z) => z.text === 'ERSTE ZEIT') && !e.erst.erg.neueBest && e.erst.titel === 'ZIEL!' && !diff(e.erst)
    && cpZ(e.erst).every((z) => z.farbe === null && !/[+-]\d/.test(z.text)), '(e) erster Lauf: ERSTE ZEIT, Titel ZIEL!, keine Unterschiede');
  const dl = diff(e.langsamer);
  pruefe(dl && dl.text === '+1.23' && dl.farbe === e.C.farbeLangsamer && !e.langsamer.erg.neueBest && e.langsamer.titel === 'ZIEL!',
    '(e) langsamer: rot "+1.23", keine neue Bestzeit', dl && dl.text);
  // (M8h: in derselben Zeile steht "· GESAMT PLATZ 2", hier gibt es nur ein Auto)
  pruefe(e.langsamer.zeilen.some((z) => String(z.text).startsWith('PLATZ 2 VON 2')), '(d) Platzangabe "PLATZ 2 VON 2"');
  const cl = cpZ(e.langsamer);
  pruefe(cl[0].text.endsWith('-0.20') && cl[0].farbe === e.C.farbeSchneller && cl[1].text.endsWith('+1.23') && cl[1].farbe === e.C.farbeLangsamer
    && cl[2].text.endsWith(' 0.00') && cl[2].farbe === e.C.farbeGleich, '(e) Zwischenzeit-Unterschiede mit Farbe (-0.20 grün, +1.23 rot, 0.00)', cl.map((z) => z.text).join(' | '));
  const dg = diff(e.gleich);
  pruefe(dg && dg.text === '0.00' && !e.gleich.erg.neueBest && e.gleich.erg.platz === 2, '(d) gleich schnell: keine neue Bestzeit, hinter der älteren Zeit', `${dg && dg.text}, Platz ${e.gleich.erg.platz}`);
  const ds = diff(e.schneller);
  // (M8h: die schnellste Zeit überhaupt heisst GESAMTREKORD!, das geht NEUE BESTZEIT! vor; hier gibt es nur ein Auto)
  pruefe(ds && ds.text === '-0.80' && ds.farbe === e.C.farbeSchneller && e.schneller.erg.neueBest && e.schneller.titel === 'GESAMTREKORD!' && e.schneller.erg.platz === 1
    && !e.schneller.zeilen.some((z) => /^PLATZ/.test(z.text)), '(d)(e) schneller: grün "-0.80", GESAMTREKORD! (neue Bestzeit), Platz 1 (statt Platzangabe)', ds && ds.text);
  pruefe(e.schneller.erg.bisher.zeit === 160.5, '(e) verglichen wird mit der Bestzeit VOR diesem Lauf', `bisher ${e.schneller.erg.bisher.zeit}`);
  // blinkender Titel nur bei neuer Bestzeit
  const blink = await A(p, () => { const z = window.__alpineRally.seiten.ziel; return [z.blinkt, z.titelFarbe(true), z.titelFarbe(false)]; });
  pruefe(blink[0] === true && blink[1] !== blink[2], 'NEUE BESTZEIT! blinkt (zwei Farben)', blink.join(' / '));
  // Höchsttempo in km/h und mph
  const tempo = await A(p, async () => {
    const A = window.__alpineRally, E = await import('/js/einstellungen.js');
    A.lauf.ergebnis.hoechstTempo = 40; // 144 km/h = 89 mph
    const kmh = window.__T.zielZeilen().find((z) => /HÖCHSTTEMPO/.test(z.text)).text;
    E.setze('einheit', 'mph');
    const mph = window.__T.zielZeilen().find((z) => /HÖCHSTTEMPO/.test(z.text)).text;
    E.setze('einheit', 'kmh');
    return { kmh, mph };
  });
  pruefe(tempo.kmh.includes('HÖCHSTTEMPO 144 KM/H') && tempo.mph.includes('HÖCHSTTEMPO 89 MPH'), 'Höchsttempo in km/h oder mph je nach Einstellung', `${tempo.kmh} | ${tempo.mph}`);
  pruefe(spiel.fehler.length === 0, 'keine Fehler in der Konsole', spiel.fehler.join(' | '));
  await spiel.schliessen();
}

// =====================================================================
console.log('(f) ohne Browser-Speicher');
{
  const spiel = await lade({ ohneSpeicher: true });
  const p = spiel.page;
  await taste(p, 'Enter');
  const r = await A(p, () => {
    const A = window.__alpineRally, T = window.__T;
    const erg1 = JSON.parse(JSON.stringify(T.insZiel(161, [33, 92, 141])));
    const zeilen = T.zielZeilen();
    T.bisZielschirm();
    const erg2 = JSON.parse(JSON.stringify(T.insZiel(160, [33, 92, 141])));
    T.bisZielschirm();
    A.anhalten = false;
    return { erg1, erg2, zeilen, zust: A.ablauf.zustand };
  });
  pruefe(r.erg1.gespeichert === false && r.zeilen.some((z) => z.text === 'ZEIT WIRD NICHT GESPEICHERT'), 'Hinweis "ZEIT WIRD NICHT GESPEICHERT"');
  pruefe(r.erg2.neueBest && r.erg2.bisher && r.erg2.bisher.zeit === 161, 'Vergleich innerhalb der Sitzung geht trotzdem (bis zum Neuladen)');
  await bilderAbwarten(p, 3);
  await taste(p, 'Enter'); // NEU STARTEN
  await bilderAbwarten(p, 3);
  pruefe(r.zust === 'ziel' && (await zustand(p)) === 'countdown', 'Zielbildschirm erscheint, NEU STARTEN geht, Spiel läuft weiter');
  await taste(p, 'Escape'); await bilderAbwarten(p, 2);
  await zu(p, 3); await taste(p, 'Enter'); await zu(p, 2); await taste(p, 'Enter'); // Hauptmenü (JA)
  await bilderAbwarten(p, 3);
  await zu(p, 3); await taste(p, 'Enter');
  // (M8h: Zeit-Zeilen der Gesamt-Top-3)
  const z = await A(p, () => { const se = window.__alpineRally.menue.seite; return se.eintraege().filter((e) => e.autoKurz).map((e) => e.inhalt()); });
  pruefe((await seite(p)) === 'bestzeiten' && z.length === 2, 'BESTZEITEN-Seite ohne Speicher: zeigt die Zeiten dieser Sitzung', z.join(' | '));
  pruefe(spiel.fehler.length === 0, 'keine Fehler in der Konsole', spiel.fehler.join(' | '));
  await spiel.schliessen();
}

// =====================================================================
console.log('(g) Statistik');
{
  const spiel = await lade();
  const p = spiel.page;
  await taste(p, 'Enter');
  const g = await A(p, () => {
    const A = window.__alpineRally, T = window.__T, S = A.strecke, q = {};
    A.anhalten = true;
    A.start(); T.ueberCountdown();
    // Baum suchen: einzeln (nichts anderes im Umkreis von 9 m), 8–20 m neben der Strasse, vor Checkpoint 1, flach
    const alle = [...A.pflanzen.hindernisse, ...A.strassenrand.hindernisse, ...A.kuehe.hindernisse];
    let baum = null;
    for (const h of A.pflanzen.hindernisse) {
      if (h.sperre || Math.abs(h.r - A.CONFIG.kollision.stammRadius) > 0.01) continue;
      const a = S.abfrage(h.x, h.z, q);
      if (a.s < 150 || a.s > 800 || a.abstand < 8 || a.abstand > 20 || a.wandSeite) continue;
      if (alle.some((o) => o !== h && Math.hypot(o.x - h.x, o.z - h.z) < 9)) continue;
      baum = { x: h.x, z: h.z, s: a.s, abstand: a.abstand }; break;
    }
    // Auto 9 m vor dem Baum, Blick auf den Baum, 15 m/s; nach dem Aufprall noch gut 1 s Vollgas gegen den Baum (klebt)
    const p = A.physik;
    const lage = S.punktBei(baum.s);
    const dx = baum.x - lage.x, dz = baum.z - lage.z, l = Math.hypot(dx, dz);
    const sx = baum.x - (dx / l) * 9, sz = baum.z - (dz / l) * 9;
    A.rennen.letztesS = S.abfrage(sx, sz, q).s;
    p.reset(sx, sz, Math.atan2(dx, dz));
    p.vx = (dx / l) * 15; p.vz = (dz / l) * 15; p.vVor = 15;
    const gas = { ...T.LEER, gas: 1 };
    let maxV = 0;
    for (let k = 0; k < 120 * 2; k++) { A.rennSchritt(A.SCHRITT, gas); if (A.rennen.zustand === 'laeuft') maxV = Math.max(maxV, p.tempo); }
    const nachBaum = { aufpralle: A.stat.aufpralle, auf: A.kollision.letzterAufprall, v: p.tempo };
    // Unsichtbare Grenze (45 m neben der Strasse): 41 m neben der Strasse mit 20 m/s quer nach aussen -> zählt nicht.
    // Stelle suchen: keine Felswand, auf dem Weg nichts im Weg, die Grenze wird wirklich erreicht
    const G = A.CONFIG.grenze.maxAbstand;
    let grenze = null;
    for (let s = 150; s < 3500 && !grenze; s += 37) {
      for (const seite of [1, -1]) {
        const lp = S.punktBei(s);
        if (S.abfrage(lp.x, lp.z, q).wandSeite) continue;
        const rx = -lp.tz * seite, rz = lp.tx * seite; // nach aussen
        let frei = true;
        for (let d = 39; d <= G + 3 && frei; d += 0.5) if (!A.kollision.frei(lp.x + rx * d, lp.z + rz * d, 3)) frei = false;
        if (!frei) continue;
        const vor = A.stat.aufpralle;
        p.reset(lp.x + rx * 41, lp.z + rz * 41, Math.atan2(rx, rz));
        A.rennen.letztesS = s;
        p.vx = rx * 20; p.vz = rz * 20; p.vVor = 20;
        let maxAb = 0, wucht = 0;
        for (let k = 0; k < 120; k++) {
          const vn = p.vx * rx + p.vz * rz;
          A.rennSchritt(A.SCHRITT, gas);
          const ab = S.abfrage(p.x, p.z, q).abstand;
          if (ab > maxAb) { maxAb = ab; wucht = Math.max(wucht, vn); }
        }
        if (maxAb > G - 0.2 && A.rennen.zustand === 'laeuft') grenze = { s, maxAb, wucht, gezaehlt: A.stat.aufpralle - vor };
      }
    }
    // R-Reset (Wartezeit ganz abwarten)
    const r0 = A.statResets();
    A.rTaste();
    for (let k = 0; k < 120 * (A.CONFIG.zurueck.wartezeit + 0.5); k++) A.rennSchritt(A.SCHRITT, T.LEER);
    const resets = A.statResets() - r0;
    // Höchsttempo: 6 s Vollgas auf der Strasse
    A.setzeAuf(1250);
    A.rennen.zwischenzeiten = [30]; A.rennen.naechsterCp = 1;
    for (let k = 0; k < 120 * 6; k++) { A.rennSchritt(A.SCHRITT, gas); if (A.rennen.zustand === 'laeuft') maxV = Math.max(maxV, p.tempo); }
    const stat = { aufpralle: A.stat.aufpralle, resets: A.statResets(), hoechst: A.stat.hoechstTempo, maxV };
    // Neustart (wie aus der Pause): alles 0
    A.neuStarten();
    const neu = { aufpralle: A.stat.aufpralle, resets: A.statResets(), hoechst: A.stat.hoechstTempo };
    // Demo-Fahrt: 60 s Zeitraffer (auch wenn der Rennstand "läuft" wäre), nichts wird gezählt
    A.zumHauptmenue();
    A.rennen.zustand = 'laeuft';
    let demoAuf = 0, letzter = A.kollision.letzterAufprall;
    for (let k = 0; k < 120 * 60; k++) { A.demo.schritt(A.SCHRITT); if (A.kollision.letzterAufprall !== letzter) { demoAuf++; letzter = A.kollision.letzterAufprall; } }
    // (für den Test eine Demo-Kollision erzwingen: Auto auf den Baum)
    p.reset(sx, sz, Math.atan2(dx, dz)); p.vx = (dx / l) * 15; p.vz = (dz / l) * 15; p.vVor = 15;
    for (let k = 0; k < 120; k++) A.physikSchritt(A.SCHRITT, gas, true);
    const demo = { aufpralle: A.stat.aufpralle, resets: A.statResets(), hoechst: A.stat.hoechstTempo, demoAuf, erzwungen: A.kollision.letzterAufprall !== letzter };
    A.rennen.zustand = 'bereit';
    A.anhalten = false;
    return { baum, nachBaum, grenze, resets, stat, neu, demo };
  });
  pruefe(g.baum && g.nachBaum.auf && g.nachBaum.aufpralle === 1, 'Baumaufprall (54 km/h, danach gut 1 s Vollgas am Baum) zählt genau 1',
    g.baum ? `Baum bei ${Math.round(g.baum.s)} m, ${g.baum.abstand.toFixed(1)} m neben der Strasse, ${(g.nachBaum.auf.vorher * 3.6).toFixed(0)} -> ${(g.nachBaum.auf.nachher * 3.6).toFixed(0)} km/h, Zähler ${g.nachBaum.aufpralle}` : 'kein Baum gefunden');
  pruefe(g.grenze && g.grenze.gezaehlt === 0 && g.grenze.wucht > 10, 'unsichtbare Grenze (45 m neben der Strasse) mit Tempo: zählt NICHT als Aufprall',
    g.grenze ? `bei ${g.grenze.s} m, ${(g.grenze.wucht * 3.6).toFixed(0)} km/h hinein, bis ${g.grenze.maxAb.toFixed(1)} m neben der Strasse` : 'keine freie Stelle gefunden');
  pruefe(g.resets === 1 && g.stat.resets === 1, 'R-Reset zählt 1 (nach der Wartezeit)');
  pruefe(g.stat.hoechst > 20 && Math.abs(g.stat.hoechst - g.stat.maxV) < 1e-9, 'Höchsttempo = höchstes physik.tempo zwischen GO und Ziel', `${(g.stat.hoechst * 3.6).toFixed(1)} km/h`);
  pruefe(g.stat.aufpralle === 1, 'Vollgas auf der Strasse: kein weiterer Aufprall');
  pruefe(g.neu.aufpralle === 0 && g.neu.resets === 0 && g.neu.hoechst === 0, 'Neustart: Aufpralle, Resets, Höchsttempo wieder 0');
  pruefe(g.demo.aufpralle === 0 && g.demo.resets === 0 && g.demo.hoechst === 0 && g.demo.erzwungen, 'Demo-Fahrt zählt nichts (auch eine erzwungene Demo-Kollision nicht)',
    `${g.demo.demoAuf} Demo-Kontakte in 60 s`);
  pruefe(spiel.fehler.length === 0, 'keine Fehler in der Konsole', spiel.fehler.join(' | '));
  await spiel.schliessen();
}

// =====================================================================
console.log('(h) NEU STARTEN und HAUPTMENÜ aus dem Zielbildschirm');
{
  const spiel = await lade();
  const p = spiel.page;
  await taste(p, 'Enter');
  const neustartMit = async (wie) => {
    await A(p, () => { window.__T.insZiel(161, [33, 92, 141]); window.__T.bisZielschirm(); window.__alpineRally.anhalten = false; });
    await bilderAbwarten(p, 4);
    const vor = await A(p, () => ({ z: window.__alpineRally.ablauf.zustand, cp: window.__alpineRally.rennen.naechsterCp }));
    if (wie === 'enter') await taste(p, 'Enter');
    else if (wie === 'r') await taste(p, 'KeyR');
    else if (wie === 'maus') {
      await p.waitForFunction(() => window.__alpineRally.menue.treffer.length > 0, null, { timeout: 60000 });
      const nr = await nrVon(p, 'ziel.neuStarten');
      const h = await A(p, (nr) => window.__alpineRally.menue.treffer.find((x) => x.nr === nr), nr);
      await p.mouse.move((h.x + h.b / 2) / 320 * 640, (h.y + h.h / 2) / 180 * 360); await p.mouse.down(); await p.mouse.up();
    }
    await bilderAbwarten(p, 2);
    return { vor, nach: await A(p, () => {
      const A = window.__alpineRally;
      return { z: A.ablauf.zustand, zeit: A.rennen.zeit, cp: A.rennen.naechsterCp, zz: A.rennen.zwischenzeiten.length, rz: A.rennen.zustand, s: A.rennen.letztesS, ziel: A.lauf.ergebnis };
    }) };
  };
  for (const wie of ['enter', 'r', 'maus']) {
    const r = await neustartMit(wie);
    pruefe(r.vor.z === 'ziel' && r.vor.cp === 3 && r.nach.z === 'countdown' && r.nach.zeit === 0 && r.nach.cp === 0 && r.nach.zz === 0 && r.nach.rz === 'bereit' && r.nach.s < 25 && r.nach.ziel === null,
      `NEU STARTEN (${wie === 'enter' ? 'Enter' : wie === 'r' ? 'Taste R' : 'Maus'}): Countdown, Zeit 0, Checkpoints zurück`, `${r.vor.z} -> ${r.nach.z}`);
  }
  // HAUPTMENÜ ohne Rückfrage, Demo fährt wieder
  await A(p, () => { window.__T.insZiel(161, [33, 92, 141]); window.__T.bisZielschirm(); window.__alpineRally.anhalten = false; });
  await bilderAbwarten(p, 4);
  await zu(p, await nrVon(p, 'ziel.hauptmenue')); await taste(p, 'Enter');
  await bilderAbwarten(p, 2);
  const m = await A(p, () => ({ z: window.__alpineRally.ablauf.zustand, s: window.__alpineRally.menue.seite.id, x: window.__alpineRally.physik.x, zz: window.__alpineRally.physik.z }));
  await p.waitForFunction((m) => Math.hypot(window.__alpineRally.physik.x - m.x, window.__alpineRally.physik.z - m.zz) > 3, m, { timeout: 120000 }).catch(() => {});
  const weg = await A(p, (m) => Math.hypot(window.__alpineRally.physik.x - m.x, window.__alpineRally.physik.z - m.zz), m);
  pruefe(m.z === 'menue' && m.s === 'haupt' && weg > 3, 'HAUPTMENÜ: direkt ins Hauptmenü (ohne Rückfrage), Demo-Fahrt läuft wieder', `${weg.toFixed(1)} m gefahren`);
  pruefe(spiel.fehler.length === 0, 'keine Fehler in der Konsole', spiel.fehler.join(' | '));
  await spiel.schliessen();
}

// =====================================================================
console.log('(h) Gamepad');
{
  const spiel = await lade({ gamepad: true });
  const p = spiel.page;
  const knopf = async (k) => { await A(p, (k) => { window.__knopf = k; }, k); await bilderAbwarten(p, 2); await A(p, () => { window.__knopf = -1; }); await bilderAbwarten(p, 2); };
  const G = await A(p, () => window.__alpineRally.CONFIG.menue.gamepad);
  await knopf(G.bestaetigen); // Titel -> Hauptmenü
  await knopf(G.bestaetigen); // STARTEN
  const z1 = await zustand(p);
  const fehlerBild = () => A(p, () => document.getElementById('lade').style.display);
  pruefe(z1 === 'countdown' && (await fehlerBild()) === 'none' && spiel.fehler.length === 0,
    'A auf STARTEN: Countdown, kein Fehler (vorher: Fehlerbildschirm, wenn das Gamepad den Zustand mitten im Bild wechselte)');
  const zielschirm = () => A(p, () => { window.__T.insZiel(161, [33, 92, 141]); window.__T.bisZielschirm(); window.__alpineRally.anhalten = false; });
  await zielschirm(); await bilderAbwarten(p, 3);
  await knopf(G.abbrechen); await knopf(G.pause);
  const z2 = await zustand(p);
  await knopf(G.bestaetigen);
  const z3 = await zustand(p);
  await zielschirm(); await bilderAbwarten(p, 3);
  await knopf(G.zurueck); // Y
  const z4 = await zustand(p);
  pruefe(z2 === 'ziel' && z3 === 'countdown' && z4 === 'countdown' && (await fehlerBild()) === 'none',
    'Zielbildschirm: B und Start tun nichts, A = NEU STARTEN, Y = Neu starten', `${z2} / ${z3} / ${z4}`);
  pruefe(spiel.fehler.length === 0, 'keine Fehler in der Konsole', spiel.fehler.join(' | '));
  await spiel.schliessen();
}

// =====================================================================
console.log('(i) BESTZEITEN-Seite und Löschen, (k) altes Format');
{
  const spiel = await lade();
  const p = spiel.page;
  // (k) altes Format aus M5a (nur zeit, cps, datum), absichtlich unsortiert
  const alt = { passstrasse: [{ zeit: 170.25, cps: [35, 97, 150], datum: '2026-10-01T10:00:00.000Z' }, { zeit: 165.5, cps: [34, 95, 147], datum: '2026-10-02T10:00:00.000Z' }] };
  await A(p, (alt) => localStorage.setItem('alpineRally.bestzeiten', JSON.stringify(alt)), alt);
  await taste(p, 'Enter');
  await zu(p, 3); await taste(p, 'Enter');
  // (M8h: Zeit-Zeilen der Gesamt-Top-3; Zeiten ohne Auto-Id stehen nur dort, nicht in den Listen je Auto)
  const zeilen = () => A(p, () => window.__alpineRally.menue.seite.eintraege().filter((e) => e.autoKurz).map((e) => ({ t: e.inhalt(), neu: !!e.neu })));
  const z1 = await zeilen();
  pruefe((await seite(p)) === 'bestzeiten' && z1.length === 2 && z1[0].t === '1. 02:45.50 02.10.26' && z1[1].t === '2. 02:50.25 01.10.26',
    '(k) alte Bestzeiten werden gelesen und sortiert angezeigt (Platz, Zeit, Datum)', z1.map((z) => z.t).join(' | '));
  // neuer Lauf dazwischen: verglichen mit der alten Bestzeit, danach hervorgehoben
  await taste(p, 'Escape');
  const r = await A(p, () => { const e = window.__T.insZiel(168, [34.5, 96, 149]); window.__T.bisZielschirm(); window.__alpineRally.anhalten = false; return JSON.parse(JSON.stringify(e)); });
  pruefe(r.platz === 2 && r.bisher.zeit === 165.5 && r.bisher.aufpralle === null && !r.neueBest, '(k) neuer Lauf wird neben alten Einträgen eingetragen und verglichen', `Platz ${r.platz}`);
  await bilderAbwarten(p, 4);
  await zu(p, await nrVon(p, 'ziel.hauptmenue')); await taste(p, 'Enter'); await bilderAbwarten(p, 2);
  await zu(p, 3); await taste(p, 'Enter');
  const z2 = await zeilen();
  const en = await A(p, async () => {
    const T = await import('/js/texte.js'); T.setzeSprache('en');
    const z = window.__alpineRally.menue.seite.eintraege().filter((e) => e.autoKurz).map((e) => e.inhalt());
    T.setzeSprache('de');
    return z;
  });
  pruefe(z2.length === 3 && z2[1].neu && !z2[0].neu && !z2[2].neu && z2[1].t.startsWith('2. 02:48.00'), '(i) BESTZEITEN zeigt die Zeilen, der neue Lauf ist hervorgehoben', z2.map((z) => `${z.t}${z.neu ? ' (neu)' : ''}`).join(' | '));
  pruefe(/^1\. 02:45\.50 2026-10-02$/.test(en[0]), '(i) Datum auf Englisch 2026-10-02', en[0]);
  // nach einem neuen Start ist nichts mehr hervorgehoben
  await taste(p, 'Escape'); await zu(p, 0); await taste(p, 'Enter'); await bilderAbwarten(p, 2);
  await taste(p, 'Escape'); await bilderAbwarten(p, 2); await zu(p, 3); await taste(p, 'Enter'); await zu(p, 2); await taste(p, 'Enter'); await bilderAbwarten(p, 2);
  await zu(p, 3); await taste(p, 'Enter');
  const z3 = await zeilen();
  pruefe(z3.length === 3 && !z3.some((z) => z.neu), '(i) nach dem nächsten Start ist nichts mehr hervorgehoben');
  await taste(p, 'Escape');
  // Löschen: Einstellungen -> DATEN -> BESTZEITEN LÖSCHEN -> SICHER? (NEIN vorgewählt)
  await zu(p, 4); await taste(p, 'Enter');
  const gruppe = await A(p, () => window.__alpineRally.menue.seite.eintraege.some((e) => e.typ === 'gruppe' && e.text === 'einst.daten'));
  await zu(p, await nrVon(p, 'einst.bestzeitenLoeschen')); await taste(p, 'Enter');
  const frage = { s: await seite(p), w: await wahl(p), text: await A(p, () => window.__alpineRally.menue.seite.eintraege[0].inhalt()) };
  await taste(p, 'Enter'); // NEIN
  const nachNein = { s: await seite(p), n: (await A(p, () => window.__T.speicher())).passstrasse.length };
  await taste(p, 'Enter'); // wieder BESTZEITEN LÖSCHEN
  await zu(p, 2); await taste(p, 'Enter'); // JA
  await bilderAbwarten(p, 3);
  const nachJa = { s: await seite(p), sp: await A(p, () => window.__T.speicher()) };
  pruefe(gruppe && frage.s === 'frage' && frage.w === 3 && frage.text === 'ALLE BESTZEITEN ALLER AUTOS WERDEN GELÖSCHT.', '(i) Einstellungen: Gruppe DATEN, Rückfrage SICHER? mit NEIN vorgewählt', frage.text);
  pruefe(nachNein.s === 'einstellungen' && nachNein.n === 3, '(i) NEIN löscht nichts');
  pruefe(nachJa.s === 'einstellungen' && nachJa.sp === null, '(i) JA löscht alle Bestzeiten (alle Etappen)');
  await taste(p, 'Escape'); await zu(p, 3); await taste(p, 'Enter');
  const leer = await A(p, () => window.__alpineRally.menue.seite.eintraege().filter((e) => e.inhalt).map((e) => e.inhalt()));
  pruefe(leer.includes('NOCH KEINE ZEITEN'), '(i) danach: "NOCH KEINE ZEITEN"');
  pruefe(spiel.fehler.length === 0, 'keine Fehler in der Konsole', spiel.fehler.join(' | '));
  await spiel.schliessen();
}

// =====================================================================
console.log('(j) Texte');
{
  const spiel = await starteSpiel();
  const p = spiel.page;
  await spiel.ladeSpiel(true);
  const erg = await A(p, async () => {
    const { TEXTE } = await import('/js/texte.js');
    const { SCHRIFT } = await import('/js/pixel.js');
    const neu = ['bestzeiten.platz', 'bestzeiten.zeit', 'bestzeiten.datum', 'einst.daten', 'einst.bestzeitenLoeschen', 'einst.loeschenHinweis', 'einst.geloescht',
      'frage.loeschen', 'ziel.titel', 'ziel.neueBestzeit', 'ziel.platz', 'ziel.ersteZeit', 'ziel.cp', 'ziel.aufpralle', 'ziel.resets', 'ziel.hoechstTempo',
      'ziel.neuStarten', 'ziel.hauptmenue', 'ziel.nichtGespeichert'];
    const fehlt = neu.filter((k) => !(TEXTE[k] && TEXTE[k].de && TEXTE[k].en && TEXTE[k].de.trim() && TEXTE[k].en.trim()) || /ß/.test(TEXTE[k].de));
    const zeichen = new Set();
    for (const k of neu) for (const s of ['de', 'en']) for (const c of (TEXTE[k] && TEXTE[k][s] || '').replace(/\{\w+\}/g, '').toUpperCase()) if (!SCHRIFT[c]) zeichen.add(`${c} (${k})`);
    // Zeichen, die der Zielbildschirm sonst noch zeigt (Zeiten, Unterschiede, Daten)
    for (const c of '0123456789:.+-!') if (!SCHRIFT[c]) zeichen.add(c);
    return { n: neu.length, fehlt, zeichen: [...zeichen], alt: 'hud.zielNeustart' in TEXTE };
  });
  pruefe(erg.fehlt.length === 0, `alle ${erg.n} neuen Schlüssel in de und en (kein ß)`, erg.fehlt.join(', '));
  pruefe(erg.zeichen.length === 0, 'alle Zeichen gibt es in der Pixelschrift', erg.zeichen.join(', '));
  pruefe(!erg.alt, 'alter Hinweis "R = Neustart" (hud.zielNeustart) ist weg');
  await spiel.schliessen();
}

console.log(fehlerZahl ? `\n${fehlerZahl} Prüfung(en) FEHLGESCHLAGEN` : '\nAlle Prüfungen bestanden.');
process.exit(fehlerZahl ? 1 : 0);
