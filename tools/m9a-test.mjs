// Meilenstein 9a prüfen:  node tools/m9a-test.mjs [--nur a,b,c,...] [--alt <ordner 0.8h>] [--lang]
// Alles läuft in Chromium (Playwright) mit Touch-Emulation (hasTouch, isMobile); Mehrfinger über CDP
// Input.dispatchTouchEvent mit mehreren Kontaktpunkten. Kein echtes Handy, kein Safari, kein Firefox.
//   Teil B – Eingabe:
//   (a) jede Knopf-Aktion der Tabelle (Rennen, vor dem Start, Zielbildschirm)
//   (b) D-Pad: 8 Richtungen, Totzone, Gleiten von ← auf ↖ auf ↑; Lenkung genau wie die Pfeiltasten (gleicher Verlauf)
//   (c) Mehrfinger: D-Pad ← + A = Lenkung links und Gas, dazu L; einzeln loslassen
//   (d) Menü: Titel antippen, D-Pad wählen, gehalten = Wiederholen (Regler), A/B/START/R, Garage markieren/bestätigen,
//       Bestzeiten-Seite Auto wechseln, Eintrag direkt antippen
//   (e) keine Doppelauslösung durch nachgemachte Mausereignisse
//   (f) nichts hängt: pointercancel, Drehen (keine Pause), Fokusverlust, Pause mit gehaltenem Gas
//   (g) im Rennen löst Tippen aufs Bild nichts aus
//   (h) Tastatur und Gamepad unverändert (bestehende Tests: menue-test, rennablauf-test, m8h-test k)
//   Teil A/C – Layout und Aussehen:
//   (i) Erkennung (AUTO/AN/AUS, erste Berührung, Laden der Einstellung) und Layout in allen Fenstergrössen des Auftrags,
//       mit und ohne Safe-Area-Ränder: nichts überlappt, alles sichtbar, Treffer ≥ 44, Rand ≥ 24, 16:9, Bild maximal
//   (j) Texte de/en: alle Zeichen in der Pixelschrift
//   (k) Hilfezeilen vor dem Start (Touch) ohne Überlappung, Steuerungs-Seite mit TOUCH-Abschnitt (de/en, rollen)
//   (l) Desktop ohne Touch unverändert gegen 0.8h (mit --alt): Lage der Bühne, Menüseiten, HUD, ganzes Bild
//   Teil D – Web-App:
//   (m) Manifest gültig, Pfade vorhanden, Icon-Grössen aus den PNG-Köpfen, Meta-Zeilen in index.html
//   (n) Spiel lädt mit Manifest ohne Konsolenfehler, Ladezeit (mit --alt)
//   Teil E – Unveränderlich:
//   (u) über m8g-test --nur a,h,i --alt <0.8h>: Tacho, Fahrmessung, Autos, Testfahrer, Ton, Abkürzungen, Strecke,
//       Bildzeit, Ladezeit; mit --lang dazu alle bisherigen Tests (einmal, dauert Stunden)

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { starteSpiel, WURZEL } from './spiel-browser.mjs';

const arg = (name) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : null; };
const NUR = arg('--nur') ? arg('--nur').split(',') : null;
const teil = (k) => !NUR || NUR.includes(k);
const ALT = arg('--alt') ? path.resolve(arg('--alt')) : null;
const hash = (x) => crypto.createHash('sha1').update(x).digest('hex').slice(0, 12);
let fehler = 0;
const melde = (ok, text) => { console.log(`${ok ? '  ok  ' : 'FEHLER'} ${text}`); if (!ok) fehler++; };
const info = (text) => console.log(`       ${text}`);
const LOG = '/tmp/m9a';
fs.mkdirSync(LOG, { recursive: true });
const werkzeug = (name, argumente = [], timeout = 6 * 3600000, wurzel = WURZEL) => {
  const r = spawnSync(process.execPath, [path.join(wurzel, 'tools', name), ...argumente], { encoding: 'utf8', timeout, maxBuffer: 64 * 1024 * 1024, cwd: wurzel });
  return { code: r.status, text: `${r.stdout || ''}${r.stderr || ''}` };
};
const HANDY = { hasTouch: true, isMobile: true, deviceScaleFactor: 1 };
const warte = (ms) => new Promise((r) => setTimeout(r, ms));

// Spiel im Handy-Browser laden. adresse: Teil hinter index.html (z. B. '?menue=aus'); speicher: localStorage vorher
// leicht: 3D-Szene ausblenden (nur Test): Software-Grafik schafft im Menü sonst teils nur 3 Bilder pro Sekunde, und
// Finger-Ereignisse kämen bis zu 0.5 s verspätet an (dann greift z. B. die Menü-Wiederholung schon beim Tippen)
async function handy(breite, hoehe, { adresse = '', speicher = null, geraet = HANDY, wurzel = WURZEL, leicht = false } = {}) {
  const s = await starteSpiel({ wurzel, breite, hoehe, geraet });
  await s.page.addInitScript(() => { window.__bilder = 0; const f = () => { window.__bilder++; requestAnimationFrame(f); }; requestAnimationFrame(f); });
  if (speicher) await s.page.addInitScript((sp) => { if (!sessionStorage.getItem('m9a')) { localStorage.clear(); for (const [k, v] of Object.entries(sp)) localStorage.setItem(k, v); sessionStorage.setItem('m9a', '1'); } }, speicher);
  await s.page.goto(`${s.url}/index.html${adresse}`);
  await s.page.waitForFunction(() => window.__alpineRally && window.__alpineRally.touch, null, { timeout: 120000 });
  if (leicht) await s.page.evaluate(() => { window.__alpineRally.szene.visible = false; });
  const cdp = await s.page.context().newCDPSession(s.page);
  const aktiv = new Map(); // id -> { x, y }
  const sende = (type) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: [...aktiv].map(([id, p]) => ({ x: p.x, y: p.y, id })) });
  const f = {
    // Finger id auf Punkt p setzen, bewegen, heben (mehrere Finger gleichzeitig möglich)
    async auf(id, p) { aktiv.set(id, p); await sende('touchStart'); },
    async zu(id, p) { aktiv.set(id, p); await sende('touchMove'); },
    async ab(id) { const p = aktiv.get(id); aktiv.delete(id); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [{ x: p.x, y: p.y, id }] }); },
    async abbrechen() { aktiv.clear(); await cdp.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] }); },
    async tippe(p, ms = 60) { await this.auf(99, p); await warte(ms); await this.ab(99); },
  };
  const ev = (fn, a) => s.page.evaluate(fn, a);
  // Mitte eines Knopfs (CSS-Pixel), dazu Punkte im D-Pad nach Winkel (0 = hoch) und Anteil des Radius
  const lay = () => ev(() => window.__alpineRally.touch.layoutJetzt);
  const mitte = async (n) => { const L = await lay(); const r = L.el[n].v; return { x: r.x + r.b / 2, y: r.y + r.h / 2 }; };
  const dpadPunkt = async (grad, anteil = 0.7) => {
    const L = await lay(); const v = L.el.dpad.v; const r = v.b / 2; const w = grad * Math.PI / 180;
    return { x: v.x + r + Math.sin(w) * r * anteil, y: v.y + r - Math.cos(w) * r * anteil };
  };
  // Punkt im 320x180-Raster des Bilds -> CSS-Pixel
  const bildPunkt = (x, y) => ev(([x, y]) => { const r = document.getElementById('hud').getBoundingClientRect(); return { x: r.left + x / 320 * r.width, y: r.top + y / 180 * r.height }; }, [x, y]);
  // zwei Bilder der Spielschleife abwarten (die Bildrate im Test-Browser schwankt stark)
  const bilder = () => s.page.evaluate(() => window.__bilder);
  const bild = async () => { const n = await bilder(); for (let i = 0; i < 500 && (await bilder()) < n + 2; i++) await warte(10); };
  // Trefferfläche eines Eintrags der gerade gezeigten Seite (wartet, bis die Seite gezeichnet ist)
  const treffer = async (text) => { await s.page.waitForFunction((tx) => { const m = window.__alpineRally.menue; const l = typeof m.seite.eintraege === 'function' ? m.seite.eintraege() : m.seite.eintraege; const nr = l.findIndex((e) => e.text === tx); return m.treffer.some((t) => t.nr === nr); }, text); return s.page.evaluate((tx) => { const m = window.__alpineRally.menue; const l = typeof m.seite.eintraege === 'function' ? m.seite.eintraege() : m.seite.eintraege; const nr = l.findIndex((e) => e.text === tx); return m.treffer.find((t) => t.nr === nr); }, text); };
  // warten, bis die Seite flüssig läuft (5 Bilder hintereinander mit weniger als 150 ms Abstand): sonst kommt im
  // langsamen Test-Browser das Loslassen eines Fingers so spät an, dass die Menü-Wiederholung schon greift
  const ruhig = async () => { for (let i = 0; i < 100; i++) { const n = await bilder(); await warte(300); if ((await bilder()) - n >= 6) return; } };
  return { s, page: s.page, cdp, f, ev, lay, mitte, dpadPunkt, bildPunkt, bild, treffer, ruhig, async zu() { await s.schliessen(); } };
}

// ===================================================================== Teil B: Eingabe
// Rennen ohne Menü (wie die alten Tests), Handy hoch; Hilfen im Browser
async function rennenHandy(W = 402, H = 874, adresse = '?menue=aus') {
  const h = await handy(W, H, { adresse, leicht: true });
  await h.ev(() => { window.__alpineRally.anhalten = true; });
  await h.bild();
  return h;
}
const halten = (h) => h.ev(() => ({ ...window.__alpineRally.touch.halten }));
const tein = (h) => h.ev(() => ({ ...window.__alpineRally.touch.eingabe }));
// Zustand ohne Eingabe-Abfrage durch die Spielschleife (Prüfung der Lenkung Bild für Bild)
const testZustand = (h) => h.ev(() => { const A = window.__alpineRally; if (!A.ablauf.def || A.ablauf.zustand !== 'test') { A.ablauf.registriere('test', { welt: null }); A.ablauf.wechsle('test'); } });
const lies = (h, dt = 1 / 60) => h.ev(async (dt) => { const I = await import('/js/input.js'); const e = I.leseEingabe(dt); return { ...e }; }, dt);

if (teil('a')) {
  console.log('(a) jede Knopf-Aktion');
  const h = await rennenHandy();
  // gehaltene Aktionen (über die echte Abfrage leseEingabe, wie im Spiel)
  await testZustand(h);
  const proben = [['a', 'gas', 1], ['b', 'bremse', 1], ['l', 'handbremse', true]];
  for (const [k, aktion, soll] of proben) {
    await h.f.auf(1, await h.mitte(k)); await h.bild();
    const e = await lies(h);
    await h.f.ab(1); await h.bild();
    const nach = await lies(h);
    melde(e[aktion] === soll && !nach[aktion], `${k.toUpperCase()}: ${aktion} = ${e[aktion]} beim Halten, nach dem Loslassen ${nach[aktion]}`);
  }
  for (const [grad, name, feld] of [[0, '↑', 'gas'], [180, '↓', 'bremse']]) {
    await h.f.auf(1, await h.dpadPunkt(grad)); await h.bild();
    const e = await lies(h); await h.f.ab(1); await h.bild(); const nach = await lies(h);
    melde(e[feld] === 1 && !nach[feld], `D-Pad ${name}: ${feld} = ${e[feld]} beim Halten, danach ${nach[feld]}`);
  }
  for (const [grad, name, vz] of [[270, '←', -1], [90, '→', 1]]) {
    await h.f.auf(1, await h.dpadPunkt(grad)); await h.bild();
    let e; for (let i = 0; i < 20; i++) e = await lies(h);
    await h.f.ab(1); await h.bild();
    melde(Math.sign(e.lenkung) === vz && e.gas === 0, `D-Pad ${name}: Lenkung ${e.lenkung.toFixed(2)} nach 20 Bildern`);
    for (let i = 0; i < 40; i++) await lies(h); // zurück auf 0
  }
  // A und D-Pad ↑ zusammen = Gas, nicht doppelt
  await h.f.auf(1, await h.mitte('a')); await h.f.auf(2, await h.dpadPunkt(0)); await h.bild();
  const beide = await lies(h); await h.f.ab(1); await h.f.ab(2); await h.bild();
  melde(beide.gas === 1, `A und D-Pad ↑ zusammen: Gas ${beide.gas} (nicht doppelt)`);
  // einmalige Aktionen im Rennen: START = Pause, SELECT = HUD, NOTES = Pace-Notes, R = zurück auf die Strasse
  await h.ev(() => { const A = window.__alpineRally; A.start({ countdown: false }); });
  await h.bild();
  const vor = await h.ev(() => { const A = window.__alpineRally; return { hud: A.hudSchalter.an, notes: A.paceNotes.anzeige.an, rennen: A.rennen.zustand }; });
  await h.f.tippe(await h.mitte('select')); await h.bild();
  await h.f.tippe(await h.mitte('notes')); await h.bild();
  const nach = await h.ev(() => { const A = window.__alpineRally; return { hud: A.hudSchalter.an, notes: A.paceNotes.anzeige.an }; });
  melde(nach.hud !== vor.hud, `SELECT: HUD ${vor.hud ? 'an' : 'aus'} -> ${nach.hud ? 'an' : 'aus'} (wie Taste H)`);
  melde(nach.notes !== vor.notes, `NOTES: Pace-Notes ${vor.notes ? 'an' : 'aus'} -> ${nach.notes ? 'an' : 'aus'} (wie Taste N)`);
  await h.f.tippe(await h.mitte('select')); await h.f.tippe(await h.mitte('notes')); await h.bild(); // (wieder wie vorher)
  // R vor dem Start (Auto steht, Rennen 'bereit'): sofort auf die Strasse; im laufenden Rennen mit Wartezeit
  const r1 = await h.ev(() => { const A = window.__alpineRally; A.physik.x += 6; return { z: A.rennen.zustand, x: A.physik.x }; });
  await h.f.tippe(await h.mitte('r')); await h.bild();
  const r2 = await h.ev(() => { const A = window.__alpineRally; return { x: A.physik.x, rest: A.rueck.rest }; });
  melde(Math.abs(r2.x - r1.x) > 1 && !(r2.rest > 0), `R vor dem Start (Rennen ${r1.z}): sofort zurück auf die Strasse (x ${r1.x.toFixed(1)} -> ${r2.x.toFixed(1)})`);
  await h.ev(() => { const A = window.__alpineRally; A.rennen.zustand = 'laeuft'; });
  await h.f.tippe(await h.mitte('r')); await h.bild();
  const r3 = await h.ev(() => window.__alpineRally.rueck.rest);
  melde(r3 > 0, `R im laufenden Rennen: Wartezeit läuft (${r3.toFixed(2)} s, wie Taste R)`);
  await h.f.tippe(await h.mitte('start')); await h.bild();
  const p = await h.ev(() => window.__alpineRally.ablauf.zustand);
  melde(p === 'pause', `START im Rennen: ${p} (wie Esc)`);
  await h.f.tippe(await h.mitte('start')); await h.bild();
  const w = await h.ev(() => window.__alpineRally.ablauf.zustand);
  melde(w === 'rennen', `START in der Pause: weiter (${w})`);
  await h.zu();
  // Zielbildschirm: R = NEU STARTEN (Countdown)
  const z = await handy(402, 874);
  await z.ev(async () => {
    const A = window.__alpineRally;
    A.anhalten = true; A.start(); // (mit Countdown: NEU STARTEN fährt wieder mit Countdown)
    A.rennen.zustand = 'ziel'; A.rennen.endZeit = 160; A.ablauf.wechsle('ziel');
  });
  await z.bild();
  const vorZ = await z.ev(() => window.__alpineRally.ablauf.zustand);
  await z.f.tippe(await z.mitte('r')); await z.bild();
  const nachZ = await z.ev(() => window.__alpineRally.ablauf.zustand);
  melde(vorZ === 'ziel' && nachZ === 'countdown', `R auf dem Zielbildschirm: ${vorZ} -> ${nachZ} (NEU STARTEN)`);
  await z.zu();
}

if (teil('b')) {
  console.log('(b) D-Pad: Richtungen, Totzone, Gleiten, Lenkung wie die Pfeiltasten');
  const h = await rennenHandy();
  await testZustand(h);
  const soll = [[0, 1], [45, 2], [90, 3], [135, 4], [180, 5], [225, 6], [270, 7], [315, 8], [20, 1], [70, 3], [30, 2]];
  const ist = [];
  for (const [grad, r] of soll) { await h.f.auf(1, await h.dpadPunkt(grad, 0.75)); await h.bild(); ist.push([(await halten(h)).dpad, r]); await h.f.ab(1); }
  melde(ist.every(([a, b]) => a === b), `8 Richtungen (und Grenzen 20°/70°/30°): ${ist.map(([a]) => a).join(' ')} (Soll ${soll.map(([, r]) => r).join(' ')})`);
  await h.f.auf(1, await h.dpadPunkt(90, 0.1)); await h.bild();
  const tz = await halten(h); const tze = await tein(h); await h.f.ab(1);
  melde(tz.dpad === 0 && !tze.rechts && !tze.gas, `Totzone in der Mitte: keine Richtung (${tz.dpad})`);
  // Gleiten: ← -> ↖ -> ↑ mit demselben Finger
  const folge = [];
  await h.f.auf(1, await h.dpadPunkt(270)); await h.bild(); folge.push({ ...(await halten(h)), e: await tein(h) });
  await h.f.zu(1, await h.dpadPunkt(315)); await h.bild(); folge.push({ ...(await halten(h)), e: await tein(h) });
  await h.f.zu(1, await h.dpadPunkt(0)); await h.bild(); folge.push({ ...(await halten(h)), e: await tein(h) });
  await h.f.ab(1); await h.bild(); folge.push({ ...(await halten(h)), e: await tein(h) });
  const ok = folge[0].dpad === 7 && folge[0].e.links && !folge[0].e.gas && folge[1].dpad === 8 && folge[1].e.links && folge[1].e.gas
    && folge[2].dpad === 1 && !folge[2].e.links && folge[2].e.gas && folge[3].dpad === 0 && !folge[3].e.gas;
  melde(ok, `Gleiten ← ↖ ↑ und loslassen: ${folge.map((f) => `${f.dpad}${f.e.links ? 'L' : ''}${f.e.gas ? 'G' : ''}`).join(' -> ')}`);
  // Gleiten vom D-Pad auf A: D-Pad lässt los, A drückt
  await h.f.auf(1, await h.dpadPunkt(90)); await h.bild();
  await h.f.zu(1, await h.mitte('b')); await h.bild(); const aufB = await halten(h);
  await h.f.zu(1, await h.mitte('a')); await h.bild(); const aufA = await halten(h);
  await h.f.ab(1); await h.bild(); const leer = await halten(h);
  melde(aufB.dpad === 0 && aufB.b && aufA.a && !aufA.b && !leer.a, `Gleiten D-Pad -> B -> A: ${aufB.b ? 'B' : '-'} ${aufA.a ? 'A' : '-'} (Auslösung wechselt), danach frei`);
  // Lenkung Bild für Bild: D-Pad ← gegen Pfeiltaste ←, gleicher weicher Aufbau (tastaturLenkung) und Rücklauf
  const verlauf = async (art) => {
    const out = [];
    if (art === 'touch') { await h.f.auf(1, await h.dpadPunkt(270)); await h.bild(); } else await h.page.keyboard.down('ArrowLeft');
    for (let i = 0; i < 30; i++) out.push((await lies(h)).lenkung);
    if (art === 'touch') { await h.f.ab(1); await h.bild(); } else await h.page.keyboard.up('ArrowLeft');
    for (let i = 0; i < 30; i++) out.push((await lies(h)).lenkung);
    return out;
  };
  for (const stufe of [2, 0, 4]) {
    await h.ev((w) => import('/js/einstellungen.js').then((E) => E.setze('lenkStufe', w)), stufe);
    const [t, k] = [await verlauf('touch'), await verlauf('taste')];
    melde(JSON.stringify(t) === JSON.stringify(k), `Lenkempfindlichkeit Stufe ${stufe}: Verlauf D-Pad ← gleich wie Pfeiltaste ← (60 Bilder, nach 10 Bildern ${t[9].toFixed(3)}, Rücklauf bis ${t[59].toFixed(3)})`);
  }
  await h.ev(() => import('/js/einstellungen.js').then((E) => E.setze('lenkStufe', 2)));
  await h.zu();
}

if (teil('c')) {
  console.log('(c) Mehrfinger');
  const h = await rennenHandy();
  await testZustand(h);
  await h.f.auf(1, await h.dpadPunkt(270));
  await h.f.auf(2, await h.mitte('a'));
  await h.bild();
  let e; for (let i = 0; i < 20; i++) e = await lies(h);
  melde(e.lenkung < -0.5 && e.gas === 1 && !e.handbremse, `D-Pad ← + A gleichzeitig: Lenkung ${e.lenkung.toFixed(2)}, Gas ${e.gas}`);
  await h.f.auf(3, await h.mitte('l')); await h.bild();
  e = await lies(h);
  melde(e.lenkung < -0.5 && e.gas === 1 && e.handbremse, `dazu L (dritter Finger): Handbremse ${e.handbremse}, Lenkung und Gas bleiben`);
  await h.f.ab(2); await h.bild(); e = await lies(h);
  melde(e.gas === 0 && e.handbremse && e.lenkung < -0.5, `A losgelassen: Gas ${e.gas}, Handbremse und Lenkung bleiben`);
  await h.f.ab(3); await h.bild(); e = await lies(h);
  melde(!e.handbremse && e.lenkung < -0.5, `L losgelassen: Handbremse ${e.handbremse}, Lenkung bleibt`);
  await h.f.ab(1); await h.bild();
  for (let i = 0; i < 40; i++) e = await lies(h);
  melde(e.lenkung === 0 && (await h.ev(() => window.__alpineRally.touch.zeigerAnzahl)) === 0, `D-Pad losgelassen: Lenkung zurück auf ${e.lenkung}, keine Finger mehr`);
  // vier Finger: D-Pad ↗ (lenken + Gas), B, L, R gleichzeitig
  await h.f.auf(1, await h.dpadPunkt(45)); await h.f.auf(2, await h.mitte('b')); await h.f.auf(3, await h.mitte('l')); await h.bild();
  const hv = await halten(h); e = await lies(h);
  melde(hv.dpad === 2 && hv.b && hv.l && e.gas === 1 && e.bremse === 1 && e.handbremse, `drei Finger (↗, B, L): Gas ${e.gas}, Bremse ${e.bremse}, Handbremse ${e.handbremse}`);
  await h.f.ab(1); await h.f.ab(2); await h.f.ab(3); await h.bild();
  await h.zu();
}

if (teil('d')) {
  console.log('(d) Menü mit Touch');
  const h0 = await handy(402, 874);
  await h0.bild();
  const t0 = await h0.ev(() => window.__alpineRally.ablauf.zustand);
  await h0.f.auf(1, await h0.bildPunkt(160, 90)); await h0.bild();
  const t1 = await h0.ev(() => window.__alpineRally.ablauf.zustand);
  await h0.f.ab(1); await h0.bild();
  const t2 = await h0.ev(() => ({ z: window.__alpineRally.ablauf.zustand, ton: window.__alpineRally.ton.zustand }));
  melde(t0 === 'titel' && t1 === 'titel' && t2.z === 'menue', `Titel: beim Aufsetzen noch ${t1}, beim Loslassen (touchend) ${t2.z}; Ton-Kontext ${t2.ton}`);
  await h0.zu();
  // weiter ohne Ton: das Klangwerk baut nach dem Entsperren seine Puffer und hält dabei im Test-Browser die Bilder an
  const h = await handy(402, 874, { adresse: '?ton=aus', leicht: true });
  await h.f.tippe(await h.bildPunkt(160, 90)); await h.bild();
  const M = () => h.ev(() => ({ seite: window.__alpineRally.menue.seite.id, wahl: window.__alpineRally.menue.wahl, tiefe: window.__alpineRally.menue.stapel.length }));
  // Spur im Browser: wann kam das Aufsetzen/Loslassen an, wann ging eine Taste ans Menü
  await h.ev(() => {
    const A = window.__alpineRally; window.__tr = [];
    const alt = A.menue.taste; A.menue.taste = (...a) => { window.__tr.push({ art: 'taste', w: !!a[1], t: performance.now() }); return alt(...a); };
    for (const t of ['pointerdown', 'pointerup']) window.addEventListener(t, () => window.__tr.push({ art: t, t: performance.now() }), true);
    const f = () => { window.__tr.push({ art: 'bild', t: performance.now() }); requestAnimationFrame(f); }; requestAnimationFrame(f); // (Bilder mitschreiben)
  });
  // erwartete Schritte für die Zeit, die der Finger aus Sicht der Seite lag (wie eine gehaltene Taste: 0.4 s, dann alle 0.12 s)
  const tippen = async (grad, ms = 60) => {
    await h.ruhig();
    await h.ev(() => { window.__tr.length = 0; });
    await h.f.auf(1, await h.dpadPunkt(grad)); await warte(ms); await h.f.ab(1); await h.bild();
    const tr = await h.ev(() => window.__tr);
    const tasten = tr.filter((x) => x.art === 'taste'), auf = tr.find((x) => x.art === 'pointerdown'), ab = tr.find((x) => x.art === 'pointerup');
    const dauer = ab && tasten.length ? ab.t - tasten[0].t : 0;
    const soll = dauer < 400 ? 1 : 2 + Math.floor((dauer - 400) / 120);
    return { n: tasten.length, soll, dauer, verspaetet: auf && ab ? ab.t - auf.t - ms : 0, tr };
  };
  // ein kurzer Tipp = genau ein Schritt; zählt nur, wenn das Loslassen rechtzeitig ankam (der Test-Browser blockiert die
  // Seite manchmal über 1 s), höchstens 4 Versuche je Richtung
  const kurz = async (grad, zurueck) => {
    let letzter = null;
    for (let v = 1; v <= 4; v++) {
      const vor = await M(); const k = await tippen(grad); const nach = await M();
      letzter = { ...k, vor: vor.wahl, nach: nach.wahl, versuch: v };
      if (k.verspaetet < 250) return letzter;
      await h.ev((w) => { const A = window.__alpineRally; A.menue.zeige(A.seiten.haupt, true); for (let i = 0; i < w; i++) A.menue.runter(); }, zurueck);
    }
    return letzter;
  };
  const m0 = await M();
  const k1 = await kurz(180, m0.wahl); const k2 = await kurz(0, m0.wahl + 1);
  melde(k1.n === 1 && k2.n === 1 && k1.nach === k1.vor + 1 && k2.nach === k2.vor - 1 && k1.verspaetet < 250 && k2.verspaetet < 250,
    `D-Pad ↓ / ↑ kurz getippt im Hauptmenü: Wahl ${k1.vor} -> ${k1.nach}, ${k2.vor} -> ${k2.nach} (${k1.n} und ${k2.n} Schritt; Versuch ${k1.versuch} / ${k2.versuch})`);
  // gehalten: Wiederholung
  const k3 = await tippen(180, 1000); const m3 = await M();
  melde(k3.n >= 5 && Math.abs(k3.n - k3.soll) <= 1, `D-Pad ↓ 1 s gehalten: ${k3.n} Schritte (aus Sicht der Seite ${(k3.dauer / 1000).toFixed(2)} s gehalten, Soll ${k3.soll})`);
  for (const [n, t] of [['kurz ↓', k1], ['kurz ↑', k2], ['1 s', k3]]) if (t.verspaetet > 150 || t.versuch > 1) info(`(${n}: Loslassen kam ${t.verspaetet.toFixed(0)} ms verspätet an${t.versuch > 1 ? `, Versuch ${t.versuch}` : ''} – langsamer Test-Browser)`);
  // Einstellungen: A öffnet, D-Pad zum Regler LAUTSTÄRKE, → gehalten erhöht in mehreren Schritten, B zurück
  await h.ev(() => { const A = window.__alpineRally; A.menue.zeige(A.seiten.haupt, true); });
  await h.ruhig();
  for (let i = 0; i < 4; i++) { await h.f.tippe(await h.dpadPunkt(180)); await h.ruhig(); }
  await h.f.tippe(await h.mitte('a')); await h.bild();
  const e0 = await M();
  const ziel = await h.ev(() => { const s = window.__alpineRally.menue.seite; return (typeof s.eintraege === 'function' ? s.eintraege() : s.eintraege).findIndex((e) => e.text === 'einst.lautstaerke'); });
  await h.ruhig();
  for (let n = 0; n < 40 && (await M()).wahl !== ziel; n++) { await h.f.tippe(await h.dpadPunkt((await M()).wahl < ziel ? 180 : 0)); await h.ruhig(); }
  const laut0 = await h.ev(() => window.__alpineRally.einstellungen.lautstaerke);
  await h.f.auf(1, await h.dpadPunkt(270)); await warte(900); await h.f.ab(1); await h.bild();
  const laut1 = await h.ev(() => window.__alpineRally.einstellungen.lautstaerke);
  await h.f.auf(1, await h.dpadPunkt(90)); await warte(900); await h.f.ab(1); await h.bild();
  const laut2 = await h.ev(() => window.__alpineRally.einstellungen.lautstaerke);
  melde(e0.seite === 'einstellungen' && laut0 - laut1 >= 15 && laut2 - laut1 >= 15, `A öffnet EINSTELLUNGEN, Regler LAUTSTÄRKE gehalten: ${laut0} -> ${laut1} (←) -> ${laut2} (→)`);
  await h.f.tippe(await h.mitte('b')); await h.bild();
  const e1 = await M();
  melde(e1.seite === 'haupt', `B = zurück: ${e0.seite} -> ${e1.seite}`);
  // Garage: D-Pad markiert (Vorschau), A bestätigt das Auto
  await h.ev(() => { const A = window.__alpineRally; A.menue.zeige(A.seiten.haupt, true); A.menue.oeffne(A.seiten.auto, true); });
  await h.ruhig();
  const g0 = await h.ev(() => ({ wahl: window.__alpineRally.menue.wahl, auto: window.__alpineRally.autoWahl.auto }));
  await h.f.tippe(await h.dpadPunkt(180)); await h.bild();
  const g1 = await h.ev(() => ({ wahl: window.__alpineRally.menue.wahl, auto: window.__alpineRally.autoWahl.auto, vorschau: window.__alpineRally.seiten.garage.vorschauId(), hinweis: window.__alpineRally.menue.seite.hinweis() }));
  await h.f.tippe(await h.mitte('a')); await h.bild();
  const g2 = await h.ev(() => ({ auto: window.__alpineRally.autoWahl.auto }));
  melde(g1.wahl === g0.wahl + 1 && g1.auto === g0.auto && g2.auto !== g0.auto && g2.auto === g1.vorschau, `Garage: D-Pad ↓ markiert ${g1.vorschau} (gewählt bleibt ${g1.auto}), A wählt -> ${g2.auto}; Hinweis "${g1.hinweis}"`);
  await h.ev(() => window.__alpineRally.autoWechseln('rt4'));
  // Bestzeiten: D-Pad ← → wechselt das Auto
  await h.ev(() => { const A = window.__alpineRally; A.menue.zeige(A.seiten.haupt, true); A.menue.oeffne(A.seiten.bestzeiten, true); });
  await h.ruhig();
  const autoBz = () => h.ev(() => { const s = window.__alpineRally.menue.seite; const l = typeof s.eintraege === 'function' ? s.eintraege() : s.eintraege; const e = l.find((x) => x.typ === 'auswahl'); return e ? e.lesen() : null; });
  const b0 = await autoBz();
  await h.f.tippe(await h.dpadPunkt(90)); await h.ruhig();
  const b1 = await autoBz();
  await h.f.tippe(await h.dpadPunkt(270)); await h.bild();
  const b2 = await autoBz();
  melde(b0 !== null && b1 !== b0 && b2 === b0, `Bestzeiten-Seite: D-Pad → / ← wechselt das Auto (${b0} -> ${b1} -> ${b2})`);
  // Eintrag direkt antippen (Hauptmenü: ETAPPE)
  await h.ev(() => { const A = window.__alpineRally; A.menue.zeige(A.seiten.haupt, true); });
  await h.bild();
  const hit = await h.treffer('menue.etappe');
  await h.f.tippe(await h.bildPunkt(hit.x + hit.b / 2, hit.y + hit.h / 2)); await h.bild();
  const d1 = await M();
  melde(d1.seite === 'etappe', `ETAPPE direkt angetippt: Seite ${d1.seite}`);
  // Pause: START = weiter, B = weiter
  await h.ev(() => { const A = window.__alpineRally; A.anhalten = true; A.start({ countdown: false }); A.pausieren(); });
  await h.bild();
  await h.f.tippe(await h.mitte('start')); await h.bild();
  const p1 = await h.ev(() => window.__alpineRally.ablauf.zustand);
  await h.ev(() => window.__alpineRally.pausieren()); await h.bild();
  await h.f.tippe(await h.mitte('b')); await h.bild();
  const p2 = await h.ev(() => window.__alpineRally.ablauf.zustand);
  melde(p1 === 'rennen' && p2 === 'rennen', `Pause: START = weiter (${p1}), B = weiter (${p2})`);
  await h.zu();
}

if (teil('e')) {
  console.log('(e) keine Doppelauslösung');
  const h = await handy(402, 874, { leicht: true });
  await h.ev(() => {
    window.__m9a = { maus: 0, wechsel: [] };
    for (const t of ['mousedown', 'mouseup', 'click']) window.addEventListener(t, () => window.__m9a.maus++, true);
    window.__alpineRally.ablauf.beiWechsel((n) => window.__m9a.wechsel.push(n));
  });
  await h.f.tippe(await h.bildPunkt(160, 90)); await h.bild(); await warte(400);
  const r1 = await h.ev(() => ({ ...window.__m9a, z: window.__alpineRally.ablauf.zustand, tiefe: window.__alpineRally.menue.stapel.length }));
  melde(r1.wechsel.join() === 'menue' && r1.maus === 0, `Titel antippen: Wechsel ${r1.wechsel.join(',')} (genau einmal), ${r1.maus} Mausereignisse`);
  // Eintrag antippen öffnet genau eine Seite
  const hit = await h.treffer('menue.steuerung');
  await h.f.tippe(await h.bildPunkt(hit.x + hit.b / 2, hit.y + hit.h / 2)); await h.bild(); await warte(400);
  const r2 = await h.ev(() => ({ tiefe: window.__alpineRally.menue.stapel.length, seite: window.__alpineRally.menue.seite.id, maus: window.__m9a.maus }));
  melde(r2.tiefe === r1.tiefe + 1 && r2.seite === 'steuerung' && r2.maus === 0, `STEUERUNG antippen: ${r2.tiefe - r1.tiefe} Seite geöffnet (${r2.seite}), ${r2.maus} Mausereignisse`);
  // A: ein Druck = ein Bestätigen (Steuerung -> Symbole)
  await h.f.tippe(await h.mitte('a')); await h.bild(); await warte(400);
  const r3 = await h.ev(() => ({ tiefe: window.__alpineRally.menue.stapel.length, seite: window.__alpineRally.menue.seite.id }));
  melde(r3.tiefe === r2.tiefe + 1 && r3.seite === 'symbole', `A auf PACE-NOTES-SYMBOLE: ${r3.tiefe - r2.tiefe} Seite geöffnet (${r3.seite})`);
  // Mausklick nach einer Berührung (vom Browser nachgemacht) wird verworfen; nach der Sperre gilt die Maus wieder
  const r4 = await h.ev(async () => {
    const A = window.__alpineRally; A.menue.zeige(A.seiten.haupt, true);
    await new Promise((r) => setTimeout(r, 50));
    const t = A.menue.treffer.find((x) => x.nr === A.seiten.haupt.eintraege.findIndex((e) => e.text === 'menue.credits'));
    const hud = document.getElementById('hud').getBoundingClientRect();
    const x = hud.left + (t.x + t.b / 2) / 320 * hud.width, y = hud.top + (t.y + t.h / 2) / 180 * hud.height;
    const klick = () => { for (const art of ['mousedown', 'mouseup']) window.dispatchEvent(new MouseEvent(art, { clientX: x, clientY: y, button: 0, bubbles: true })); };
    document.dispatchEvent(new TouchEvent('touchend', { changedTouches: [], bubbles: true, cancelable: true }));
    klick();
    const sofort = A.menue.seite.id;
    await new Promise((r) => setTimeout(r, 1100));
    klick();
    return { sofort, spaeter: A.menue.seite.id };
  });
  melde(r4.sofort === 'haupt' && r4.spaeter === 'credits', `Mausklick direkt nach einer Berührung: verworfen (${r4.sofort}); 1.1 s später zählt er (${r4.spaeter})`);
  await h.zu();
}

if (teil('f')) {
  console.log('(f) nichts hängt');
  const h = await rennenHandy();
  await h.ev(() => window.__alpineRally.start({ countdown: false }));
  await h.bild();
  const alles = async () => { const e = await tein(h); return e.gas || e.bremse || e.links || e.rechts || e.handbremse; };
  // pointercancel
  await h.f.auf(1, await h.dpadPunkt(270)); await h.f.auf(2, await h.mitte('a')); await h.bild();
  const vor = await alles();
  await h.f.abbrechen(); await h.bild();
  melde(vor && !(await alles()) && (await h.ev(() => window.__alpineRally.touch.zeigerAnzahl)) === 0, 'touchcancel / pointercancel: Gas und Lenkung los, keine Finger mehr');
  // Drehen im Rennen: Finger lösen, keine Pause
  await h.f.auf(1, await h.dpadPunkt(270)); await h.f.auf(2, await h.mitte('a')); await h.bild();
  await h.page.setViewportSize({ width: 874, height: 402 }); await h.ev(() => window.dispatchEvent(new Event('orientationchange'))); await h.bild(); await warte(200);
  const d = await h.ev(() => ({ z: window.__alpineRally.ablauf.zustand, format: window.__alpineRally.touch.layoutJetzt.format }));
  melde(!(await alles()) && d.z === 'rennen' && d.format === 'quer', `Drehen im Rennen (402x874 -> 874x402): Knöpfe los, ${d.z} (keine Pause), Layout ${d.format}`);
  // der alte Finger bewegt sich weiter: zählt nicht, bis er neu aufgesetzt wird
  await h.f.zu(2, await h.mitte('a')); await h.bild();
  melde(!(await alles()), 'gelöster Finger bewegt sich auf A: zählt nicht (erst nach neuem Aufsetzen)');
  await h.f.ab(1); await h.f.ab(2); await h.bild();
  await h.f.auf(3, await h.mitte('a')); await h.bild();
  const neu = await tein(h); await h.f.ab(3); await h.bild();
  melde(neu.gas, 'neu aufgesetzt: A gibt wieder Gas');
  // Fokusverlust (blur): Finger los (und wie bisher Pause)
  await h.f.auf(1, await h.mitte('a')); await h.bild();
  await h.ev(() => window.dispatchEvent(new Event('blur'))); await h.bild();
  const b = await h.ev(() => window.__alpineRally.ablauf.zustand);
  melde(!(await alles()), `Fenster verliert den Fokus: Gas los (Zustand ${b}, wie bisher Pause)`);
  await h.f.ab(1); await h.ev(() => window.__alpineRally.weiter()); await h.bild();
  // Pause mit gehaltenem Gas: START drücken, A bleibt liegen -> nach WEITER kein Gas, bis A neu gedrückt wird
  await h.f.auf(1, await h.mitte('a')); await h.bild();
  await h.f.tippe(await h.mitte('start')); await h.bild();
  const pz = await h.ev(() => window.__alpineRally.ablauf.zustand);
  const imPause = await alles();
  await h.ev(() => window.__alpineRally.weiter()); await h.bild();
  const nachWeiter = await alles();
  await h.f.ab(1); await h.bild();
  melde(pz === 'pause' && !imPause && !nachWeiter, `Pause mit gehaltenem A: in der Pause kein Gas, nach WEITER kein Gas (${pz})`);
  // Tab versteckt (visibilitychange)
  await h.f.auf(1, await h.dpadPunkt(90)); await h.bild();
  await h.ev(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange')); delete document.hidden; });
  await h.bild();
  melde(!(await alles()), 'Tab versteckt: Lenkung los');
  await h.f.ab(1);
  await h.zu();
}

if (teil('g')) {
  console.log('(g) im Rennen löst Tippen aufs Bild nichts aus');
  const h = await rennenHandy();
  await h.ev(() => window.__alpineRally.start({ countdown: false }));
  await h.bild();
  await h.ev(() => { const A = window.__alpineRally; window.__m9a = { maus: 0 }; const alt = A.menue.maus; A.menue.maus = (...a) => { window.__m9a.maus++; return alt(...a); }; });
  for (const [x, y] of [[160, 90], [20, 20], [300, 160], [160, 170]]) { await h.f.auf(1, await h.bildPunkt(x, y)); await h.bild(); await h.f.zu(1, await h.bildPunkt(x + 30, y)); await h.f.ab(1); await h.bild(); }
  const r = await h.ev(async () => { const I = await import('/js/input.js'); const e = I.leseEingabe(0); return { z: window.__alpineRally.ablauf.zustand, maus: window.__m9a.maus, e }; });
  melde(r.z === 'rennen' && r.maus === 0 && !r.e.gas && !r.e.bremse && r.e.lenkung === 0 && !r.e.pause && !r.e.reset, `4 Mal aufs Bild getippt und gezogen: ${r.z}, Menü ${r.maus} Mal gefragt, keine Eingabe`);
  await h.zu();
}

if (teil('h')) {
  console.log('(h) Tastatur und Gamepad unverändert (bestehende Tests)');
  for (const [t, a] of [['menue-test.mjs', []], ['rennablauf-test.mjs', []], ['m8h-test.mjs', ['--nur', 'k']], ['lenk-test.mjs', []]]) {
    const r = werkzeug(t, a);
    const alle = r.text.split('\n').filter((z) => /^\s*FEHLER|Fehler im Spiel/.test(z));
    const bekannt = alle.filter((z) => /SHAI-RON|menue-test \(alle Menüseiten\)/.test(z)); // bekannt seit 0.8e (Credits)
    const rest = alle.filter((z) => !bekannt.includes(z));
    fs.writeFileSync(path.join(LOG, `${t.replace('.mjs', '')}.log`), r.text);
    melde((r.code === 0 || bekannt.length) && !rest.length, `${t} ${a.join(' ')}: ${r.code === 0 ? 'grün' : bekannt.length && !rest.length ? `grün bis auf ${bekannt.length} bekannte Fehler (Credits, seit 0.8e)` : `Code ${r.code}`}${rest.length ? ` – ${rest.slice(0, 3).join(' | ')}` : ''}`);
  }
}

// ===================================================================== (i) Erkennung und Layout
const GROESSEN = [
  ['iPhone 16 Pro hoch', 402, 874], ['kleines iPhone hoch', 375, 667], ['Pixel/Xiaomi hoch', 412, 915], ['kleines Android hoch', 360, 640],
  ['iPhone 16 Pro quer', 874, 402], ['iPhone quer mit Safari-Leisten', 874, 330], ['Pixel/Xiaomi quer', 915, 412], ['kleines iPhone quer', 667, 375],
  ['kleines Android quer', 640, 360], ['Tablet hoch', 820, 1180], ['Tablet quer', 1180, 820],
];
// geschätzte Safe-Area-Ränder eines iPhone 16 Pro (nicht gemessen: Chromium kennt keine Notch)
const SAFE_IPHONE = { hoch: { o: 62, r: 0, u: 34, l: 0 }, quer: { o: 0, r: 62, u: 21, l: 62 } };
const ELEMENTE = ['dpad', 'a', 'b', 'l', 'r', 'select', 'start', 'notes'];
function pruefeLayout(L, W, H, safe) {
  const T = { rand: 24, treffer: 44 };
  const probleme = [];
  const r2 = (r) => `${r.x.toFixed(0)},${r.y.toFixed(0)} ${r.b.toFixed(0)}x${r.h.toFixed(0)}`;
  const schneiden = (a, b) => a.x < b.x + b.b - 0.01 && b.x < a.x + a.b - 0.01 && a.y < b.y + b.h - 0.01 && b.y < a.y + a.h - 0.01;
  const innen = (a, b) => a.x >= b.x - 0.01 && a.y >= b.y - 0.01 && a.x + a.b <= b.x + b.b + 0.01 && a.y + a.h <= b.y + b.h + 0.01;
  const sicht = { x: Math.max(T.rand, safe.l), y: safe.o, b: W - Math.max(T.rand, safe.l) - Math.max(T.rand, safe.r), h: H - safe.o - safe.u };
  for (let i = 0; i < ELEMENTE.length; i++) {
    const e = L.el[ELEMENTE[i]];
    if (e.b < T.treffer - 0.01 || e.h < T.treffer - 0.01) probleme.push(`${ELEMENTE[i]} Treffer ${e.b.toFixed(0)}x${e.h.toFixed(0)}`);
    if (!innen(e.v, e)) probleme.push(`${ELEMENTE[i]} sichtbar ausserhalb der Trefferfläche`);
    if (e.s && !innen(e.s, e)) probleme.push(`${ELEMENTE[i]} Beschriftung ausserhalb`);
    if (!innen(e, sicht)) probleme.push(`${ELEMENTE[i]} ausserhalb des sicheren Bereichs (${r2(e)})`);
    if (schneiden(e, L.bild)) probleme.push(`${ELEMENTE[i]} überlappt das Bild`);
    if (L.flaeche && !innen(e, L.flaeche)) probleme.push(`${ELEMENTE[i]} nicht auf der Steuerfläche`);
    for (let j = i + 1; j < ELEMENTE.length; j++) if (schneiden(e, L.el[ELEMENTE[j]])) probleme.push(`${ELEMENTE[i]} überlappt ${ELEMENTE[j]}`);
  }
  if (Math.abs(L.bild.b * 9 - L.bild.h * 16) > 1e-6) probleme.push('Bild nicht 16:9');
  if (L.bild.y < safe.o - 0.01 || L.bild.y + L.bild.h > H - safe.u + 0.01 || L.bild.x < safe.l - 0.01 || L.bild.x + L.bild.b > W - safe.r + 0.01) probleme.push('Bild im Safe-Area-Rand');
  if (L.flaeche && schneiden(L.flaeche, L.bild)) probleme.push('Steuerfläche überlappt das Bild');
  // so gross wie die Regeln erlauben: Hochformat volle Breite; Querformat volle Höhe oder Zone an ihrer Grenze
  if (L.format === 'hoch' && Math.abs(L.bild.b - (W - safe.l - safe.r)) > 0.01) probleme.push('Hochformat: Bild nicht volle Breite');
  if (L.format === 'quer') {
    const naechste = Math.min(...ELEMENTE.map((n) => L.el[n]).filter((e) => e.y < L.bild.y + L.bild.h && e.y + e.h > L.bild.y)
      .map((e) => (e.x + e.b <= L.bild.x ? L.bild.x - (e.x + e.b) : e.x >= L.bild.x + L.bild.b ? e.x - (L.bild.x + L.bild.b) : 0)));
    const unten = ['select', 'start', 'notes'].every((n) => L.el[n].y >= L.bild.y + L.bild.h);
    const hoehe = L.bild.h >= H - safe.o - safe.u - (unten ? 12 + L.el.start.h + 8 : 0) - 0.5;
    const zone = L.bild.x - 0.5 <= Math.max(130, 0) || naechste <= 8.5;
    if (!hoehe && !zone) probleme.push(`Querformat: Bild könnte grösser sein (Abstand zum nächsten Knopf ${naechste.toFixed(1)})`);
  }
  // Abstand zum Rand
  const xs = ELEMENTE.map((n) => L.el[n]);
  const links = Math.min(...xs.map((e) => e.x)), rechts = W - Math.max(...xs.map((e) => e.x + e.b));
  if (links < Math.max(T.rand, safe.l) - 0.01 || rechts < Math.max(T.rand, safe.r) - 0.01) probleme.push(`Rand ${links.toFixed(0)} / ${rechts.toFixed(0)}`);
  return { probleme, links, rechts };
}

if (teil('i')) {
  console.log('(i) Erkennung und Layout');
  // Erkennung: Handy mit AUTO = an; Desktop mit AUTO = aus; AN am Desktop; AUS am Handy; erste Berührung schaltet ein
  const proben = [
    ['Handy, AUTO', HANDY, null, true], ['Handy, AUS', HANDY, 'aus', false], ['Desktop, AUTO', {}, null, false], ['Desktop, AN', {}, 'an', true],
    ['Handy, gespeicherter Unsinn (= AUTO)', HANDY, 'quatsch', true],
  ];
  for (const [name, geraet, wert, soll] of proben) {
    const h = await handy(640, 360, { geraet, speicher: wert ? { 'alpineRally.einstellungen': JSON.stringify({ touch: wert }) } : null });
    const r = await h.ev(() => ({ an: window.__alpineRally.touch.an, wert: window.__alpineRally.einstellungen.touch, knoepfe: !!document.querySelector('#touch canvas') && getComputedStyle(document.getElementById('touch')).display !== 'none', klasse: document.documentElement.classList.contains('touch'), tp: navigator.maxTouchPoints }));
    melde(r.an === soll && r.knoepfe === soll && r.klasse === soll && (wert !== 'quatsch' || r.wert === 'auto'), `Erkennung ${name}: Touch ${r.an ? 'an' : 'aus'}, Knöpfe ${r.knoepfe ? 'sichtbar' : 'keine'}, Einstellung ${r.wert} (maxTouchPoints ${r.tp})`);
    await h.zu();
  }
  {
    // Desktop mit AUTO: ein echter Touch-Kontakt (CDP) schaltet die Knöpfe sofort ein
    const h = await handy(874, 402, { geraet: {} });
    const vor = await h.ev(() => window.__alpineRally.touch.an);
    await h.f.tippe({ x: 400, y: 200 });
    await h.bild();
    const nach = await h.ev(() => ({ an: window.__alpineRally.touch.an, erst: window.__alpineRally.touch.erstKontakt }));
    melde(!vor && nach.an && nach.erst, `AUTO ohne gemeldetes Touch: erste Berührung schaltet ein (vorher ${vor ? 'an' : 'aus'}, nachher ${nach.an ? 'an' : 'aus'})`);
    // Einstellung im Menü umschalten wirkt sofort (AUS -> Knöpfe weg, Bühne wie am Desktop)
    const r = await h.ev(() => {
      const A = window.__alpineRally; A.touch.setzeSafeTest(null);
      const v = (n) => getComputedStyle(document.getElementById('touch')).display;
      A.einstellungen.touch; // (lesen)
      return import('/js/einstellungen.js').then((E) => { E.setze('touch', 'aus'); const aus = [A.touch.an, v(), document.getElementById('buehne').style.left]; E.setze('touch', 'an'); const an = [A.touch.an, v()]; E.setze('touch', 'auto'); return { aus, an }; });
    });
    melde(!r.aus[0] && r.aus[1] === 'none' && r.aus[2] === '' && r.an[0] && r.an[1] !== 'none', `Einstellung wirkt sofort: AUS = keine Knöpfe, Bühne wie am Desktop; AN = Knöpfe`);
    await h.zu();
  }
  // Layout in allen Grössen, ohne und mit (geschätzten) Safe-Area-Rändern; DOM-Lage gegen die Rechnung
  const tabelle = [];
  for (const [name, W, H] of GROESSEN) {
    const h = await handy(W, H);
    for (const mitSafe of [false, true]) {
      const safe = mitSafe ? SAFE_IPHONE[H > W ? 'hoch' : 'quer'] : { o: 0, r: 0, u: 0, l: 0 };
      if (mitSafe && !/iPhone/.test(name)) continue;
      await h.ev((s) => window.__alpineRally.touch.setzeSafeTest(s), safe);
      await h.bild();
      const L = await h.lay();
      const dom = await h.ev(() => {
        const r = (el) => { const b = el.getBoundingClientRect(); return { x: b.left, y: b.top, b: b.width, h: b.height }; };
        return { buehne: r(document.getElementById('buehne')), hud: r(document.getElementById('hud')), dpad: r(document.querySelector('.touch-dpad')), a: r(document.querySelector('.touch-a')), sw: document.documentElement.scrollWidth, sh: document.documentElement.scrollHeight };
      });
      const p = pruefeLayout(L, W, H, safe);
      const nah = (a, b) => Math.abs(a.x - b.x) < 0.6 && Math.abs(a.y - b.y) < 0.6 && Math.abs(a.b - b.b) < 0.6 && Math.abs(a.h - b.h) < 0.6;
      if (!nah(dom.buehne, L.bild) || !nah(dom.hud, L.bild)) p.probleme.push('Bühne liegt nicht wie berechnet');
      if (!nah(dom.dpad, L.el.dpad.v) || !nah(dom.a, L.el.a.v)) p.probleme.push('Knöpfe liegen nicht wie berechnet');
      if (dom.sw > W || dom.sh > H) p.probleme.push(`Seite grösser als das Fenster (${dom.sw}x${dom.sh})`);
      const zone = L.format === 'quer' ? Math.min(L.bild.x, W - L.bild.x - L.bild.b) : null;
      tabelle.push({ name: `${name}${mitSafe ? ' + Safe-Area' : ''}`, W, H, format: L.format, bild: `${L.bild.b.toFixed(0)}x${L.bild.h.toFixed(0)}`, k: L.k, dpad: L.el.dpad.v.b, ab: L.el.a.v.b, lr: `${L.el.l.v.b.toFixed(0)}x${L.el.l.v.h.toFixed(0)}`, klein: L.el.start.v.b, zone, kleinLage: L.klein || 'unten', rand: `${p.links.toFixed(0)}/${p.rechts.toFixed(0)}` });
      melde(p.probleme.length === 0, `${name} ${W}x${H}${mitSafe ? ` mit Safe-Area ${JSON.stringify(safe)}` : ''}: ${L.format}, Bild ${L.bild.b.toFixed(1)}x${L.bild.h.toFixed(1)}, D-Pad ${L.el.dpad.v.b.toFixed(0)}, A/B ${L.el.a.v.b.toFixed(0)}${p.probleme.length ? ` – ${p.probleme.slice(0, 4).join('; ')}` : ''}`);
    }
    await h.zu();
  }
  fs.writeFileSync(path.join(LOG, 'layout.json'), JSON.stringify(tabelle, null, 1));
  info(`Tabelle der Fenstergrössen: ${path.join(LOG, 'layout.json')}`);
}

// ===================================================================== (j) Texte, (k) Hilfezeilen und Steuerungs-Seite
if (teil('j')) {
  console.log('(j) Texte de/en in der Pixelschrift');
  const h = await handy(402, 874, { leicht: true });
  const r = await h.ev(async () => {
    const T = await import('/js/texte.js'), P = await import('/js/pixel.js');
    const neu = Object.keys(T.TEXTE).filter((k) => /touch|Touch|tippen|vollbildHome|vollbildWebApp|homeBildschirm|webApp|^wert\.auto$/.test(k));
    const zeichen = new Set(P.SCHRIFT_ZEICHEN);
    const fehlt = [];
    let breitest = 0;
    for (const k of neu) for (const sp of ['de', 'en']) {
      const tx = String(T.TEXTE[k][sp] || '').toUpperCase();
      if (!T.TEXTE[k][sp]) fehlt.push(`${k}.${sp} leer`);
      for (const z of tx) if (!zeichen.has(z)) fehlt.push(`${k}.${sp}: "${z}"`);
      breitest = Math.max(breitest, P.textBreite(tx));
    }
    return { n: neu.length, fehlt, breitest };
  });
  melde(r.fehlt.length === 0 && r.n >= 25, `${r.n} neue Texte, de und en: alle Zeichen in der Pixelschrift${r.fehlt.length ? ` – fehlt: ${r.fehlt.slice(0, 6).join(', ')}` : ''}`);
  melde(r.breitest <= 300, `längster neuer Text ${r.breitest} Pixel (Tafel 312, innen ca. 298)`);
  await h.zu();
}

if (teil('k')) {
  console.log('(k) Hilfezeilen vor dem Start und Steuerungs-Seite');
  for (const sprache of ['de', 'en']) {
    const h = await handy(402, 874, { adresse: '?menue=aus', leicht: true });
    const r = await h.ev(async (sp) => {
      const A = window.__alpineRally, T = await import('/js/texte.js'), E = await import('/js/einstellungen.js');
      E.setze('sprache', sp); T.setzeSprache(sp);
      A.anhalten = true;
      const c = document.getElementById('hud');
      const warte = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      const lese = () => c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
      A.rennen.hilfe = true; await warte(); await warte(); const mit = lese();
      A.rennen.hilfe = false; await warte(); await warte(); const ohne = lese();
      // Hilfe-Pixel = was sich ändert; sie dürfen keine sonst gemalten Pixel treffen, und alles liegt im Bild
      let n = 0, treffer = 0, x0 = 1e9, x1 = -1, y0 = 1e9, y1 = -1;
      for (let i = 0; i < mit.length; i += 4) {
        if (mit[i] === ohne[i] && mit[i + 1] === ohne[i + 1] && mit[i + 2] === ohne[i + 2] && mit[i + 3] === ohne[i + 3]) continue;
        n++; const p = i / 4, x = p % c.width, y = Math.floor(p / c.width);
        x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
        if (ohne[i + 3] > 0) treffer++;
      }
      const zeilen = [T.t('hud.touchFahren'), T.t('hud.touchHandbremse'), T.t('hud.touchPause'), T.t('hud.touchNotes')];
      return { n, treffer, box: [x0, y0, x1, y1], zeilen, touch: A.touch.an };
    }, sprache);
    melde(r.touch && r.n > 200 && r.treffer === 0 && r.box[2] < 320 && r.box[3] < 180, `Hilfezeilen Touch (${sprache}): "${r.zeilen.join(' / ')}" – ${r.n} Pixel in ${r.box.join(',')}, berühren nichts anderes im HUD (${r.treffer} Treffer)`);
    await h.zu();
  }
  // Steuerungs-Seite: Touch-Modus (TOUCH oben) und Desktop (TOUCH nach SYMBOLE), de und en; alles erreichbar
  for (const [name, geraet] of [['Touch', HANDY], ['Desktop', {}]]) for (const sprache of ['de', 'en']) {
    const h = await handy(640, 360, { geraet, adresse: '?ton=aus', leicht: true });
    const r = await h.ev(async (sp) => {
      const A = window.__alpineRally, T = await import('/js/texte.js'), E = await import('/js/einstellungen.js');
      E.setze('sprache', sp); T.setzeSprache(sp);
      const warte = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      A.menue.zeige(A.seiten.haupt, true); A.menue.oeffne(A.seiten.steuerung, true); await warte();
      const l = A.seiten.steuerung.eintraege();
      const m0 = { ...A.menue.rollen };
      const innen = m0.breite - 2 * 7;
      const zuBreit = l.filter((e) => e.typ === 'info' && (typeof e.breite === 'function' ? e.breite() : e.breite) > innen).map((e) => (e.inhalt ? e.inhalt() : '?'));
      const ersteGruppe = l.find((e) => e.typ === 'gruppe');
      // Zeilen-Lagen, dann alles mit ↓ durchgehen: jede Zeile muss einmal ganz zu sehen sein
      let y = 0; const lage = l.map((e) => { const h = e.hoehe || (e.typ === 'gruppe' ? 10 : 11); const r = [y, y + h]; y += h; return r; });
      const gesehen = new Set(), gewaehlt = new Set();
      const merke = () => { const ro = A.menue.rollen; lage.forEach(([a, b], i) => { if (a >= ro.scroll && b <= ro.scroll + ro.sichtH) gesehen.add(i); }); gewaehlt.add(A.menue.wahl); };
      merke();
      for (let i = 0; i < 40; i++) { A.menue.taste('ArrowDown', false); await warte(); merke(); }
      const unten = A.menue.rollen.scroll;
      for (let i = 0; i < 40; i++) { A.menue.taste('ArrowUp', false); await warte(); merke(); }
      const namen = l.map((e) => e.text || (e.typ === 'zurueck' ? 'zurueck' : ''));
      return {
        start: m0.scroll, max: m0.max, zuBreit, ersteGruppe: ersteGruppe && ersteGruppe.text, unten,
        ungesehen: l.map((_, i) => i).filter((i) => !gesehen.has(i) && (l[i].hoehe || 11) > 6).length, // (leere Abstände zählen nicht)
        symbole: gewaehlt.has(namen.indexOf('steuerung.symbole')), zurueck: gewaehlt.has(namen.indexOf('zurueck')), touch: A.touch.an,
        oben: namen.indexOf('steuerung.touch') < namen.indexOf('steuerung.symbole'),
      };
    }, sprache);
    const ok = r.zuBreit.length === 0 && r.start === 0 && r.ungesehen === 0 && r.symbole && r.zurueck && r.unten === r.max && r.oben === (name === 'Touch');
    melde(ok, `Steuerungs-Seite ${name} (${sprache}): TOUCH ${r.oben ? 'oben' : 'nach SYMBOLE'}, rollt 0..${r.max}, alle Zeilen einmal ganz zu sehen (${r.ungesehen} nicht), SYMBOLE und ZURÜCK wählbar${r.zuBreit.length ? `; zu breit: ${r.zuBreit.join(' | ')}` : ''}`);
    await h.zu();
  }
  // Garage-Hinweis und Pace-Notes-Hinweis im Touch-Modus
  const h = await handy(640, 360, { adresse: '?ton=aus', leicht: true });
  await h.f.tippe(await h.bildPunkt(160, 90)); await h.bild();
  const r = await h.ev(async () => {
    const A = window.__alpineRally, T = await import('/js/texte.js');
    A.menue.oeffne(A.seiten.auto, true);
    const garage = A.menue.seite.hinweis();
    const pn = A.seiten.einstellungen.eintraege.find((e) => e.text === 'einst.paceNotes').hinweis();
    return { garage, pn, soll: [T.t('garage.hinweisTouch'), T.t('einst.paceNotesHinweisTouch')] };
  });
  melde(r.garage === r.soll[0] && r.pn === r.soll[1], `Hinweise im Touch-Modus: Garage "${r.garage}", Pace-Notes "${r.pn}"`);
  await h.zu();
}

// ===================================================================== (l) Desktop unverändert gegen 0.8h
async function desktopAbdruck(wurzel) {
  const erg = { buehne: {}, seiten: {}, hud: null, ganz: null };
  const s = await starteSpiel({ wurzel, breite: 640, hoehe: 360 });
  // Lage der Bühne bei verschiedenen Fenstergrössen
  for (const [W, H] of [[640, 360], [1280, 720], [1000, 700], [800, 900], [1920, 1080], [500, 1000], [1366, 768]]) {
    await s.page.setViewportSize({ width: W, height: H });
    if (!erg.geladen) { await s.page.goto(`${s.url}/index.html`); await s.page.waitForFunction(() => window.__alpineRally, null, { timeout: 120000 }); erg.geladen = true; }
    await warte(150);
    erg.buehne[`${W}x${H}`] = await s.page.evaluate(() => { const b = document.getElementById('buehne').getBoundingClientRect(); return `${b.left},${b.top},${b.width},${b.height}`; });
  }
  await s.page.setViewportSize({ width: 640, height: 360 });
  // Menüseiten direkt auf eine eigene Leinwand gemalt (jede Seite 25 Mal über 1.5 s: Blinken ergibt eine Menge von Bildern)
  const bestzeiten = { passstrasse: { rt4: [{ zeit: 151.23, cps: [30, 80, 120], datum: '2026-10-01T10:00:00.000Z', auto: 'rt4', aufpralle: 1, resets: 0, hoechstTempo: 50 }], delto: [{ zeit: 149.5, cps: [29, 79, 119], datum: '2026-10-02T10:00:00.000Z', auto: 'delto', aufpralle: 0, resets: 0, hoechstTempo: 49 }] } };
  erg.seiten = await s.page.evaluate(async (bz) => {
    localStorage.setItem('alpineRally.bestzeiten2', JSON.stringify(bz));
    const A = window.__alpineRally;
    const c = document.createElement('canvas'); c.width = 320; c.height = 180;
    const x = c.getContext('2d');
    const out = {};
    for (const n of ['titel', 'haupt', 'auto', 'etappe', 'bestzeiten', 'symbole', 'credits', 'pause', 'frage', 'tasten']) {
      A.menue.zeige(A.seiten[n], true);
      const set = new Set();
      for (let i = 0; i < 25; i++) {
        await new Promise((r) => setTimeout(r, 60));
        x.clearRect(0, 0, 320, 180); A.menue.zeichne(x, 0, 1);
        const d = x.getImageData(0, 0, 320, 180).data;
        let h = 7; for (let i = 0; i < d.length; i++) h = (h * 31 + d[i] * (i % 7 + 1)) % 1000000007;
        set.add(h);
      }
      out[n] = [...set].sort();
    }
    A.menue.zeige(A.seiten.titel, true);
    return out;
  }, bestzeiten);
  // Rennen (ohne Menü) vor dem Start: HUD mit Hilfezeilen und das ganze Bild (3D + HUD) als Bildschirmfoto
  await s.page.goto(`${s.url}/index.html?menue=aus`);
  await s.page.waitForFunction(() => window.__alpineRally, null, { timeout: 120000 });
  await s.page.evaluate(() => { window.__alpineRally.anhalten = true; });
  await warte(800);
  erg.hud = await s.page.evaluate(() => {
    const c = document.getElementById('hud'), d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
    let h = 7; for (let i = 0; i < d.length; i++) h = (h * 31 + d[i] * (i % 7 + 1)) % 1000000007;
    return h;
  });
  erg.ganz = hash(await s.page.screenshot());
  await s.schliessen();
  return erg;
}
if (teil('l')) {
  console.log('(l) Desktop ohne Touch unverändert gegen 0.8h');
  if (!ALT) info('nur mit --alt <ordner 0.8h> (git worktree add <ordner> b796508)');
  else {
    const [a, b] = [await desktopAbdruck(ALT), await desktopAbdruck(WURZEL)];
    const lage = Object.keys(a.buehne).filter((k) => a.buehne[k] !== b.buehne[k]);
    melde(lage.length === 0, `Lage und Grösse der Bühne in ${Object.keys(a.buehne).length} Fenstergrössen wie 0.8h${lage.length ? `; anders: ${lage.join(', ')}` : ''}`);
    for (const n of Object.keys(a.seiten)) {
      const gleich = JSON.stringify(a.seiten[n]) === JSON.stringify(b.seiten[n]);
      melde(gleich, `Menüseite ${n}: pixelgleich wie 0.8h (${b.seiten[n].length} Bild${b.seiten[n].length > 1 ? 'er (Blinken)' : ''})`);
    }
    melde(a.hud === b.hud, 'HUD vor dem Start (Hilfezeilen, Zeit, Tacho, Minimap) pixelgleich wie 0.8h');
    melde(a.ganz === b.ganz, `ganzes Bild vor dem Start (3D und HUD, Bildschirmfoto 640x360) gleich wie 0.8h (${a.ganz} / ${b.ganz})`);
  }
}

// ===================================================================== (m) (n) Web-App
if (teil('m')) {
  console.log('(m) Manifest, Icons, Meta-Zeilen');
  let m = null;
  try { m = JSON.parse(fs.readFileSync(path.join(WURZEL, 'manifest.webmanifest'), 'utf8')); } catch (e) { melde(false, `manifest.webmanifest ist kein gültiges JSON: ${e.message}`); }
  if (m) {
    melde(m.name === 'ALPINE RALLY' && m.short_name && m.start_url === './' && m.scope === './' && m.display === 'fullscreen' && m.orientation === 'any' && m.background_color && m.theme_color,
      `Manifest: name ${m.name}, short_name ${m.short_name}, start_url ${m.start_url}, scope ${m.scope}, display ${m.display} (${(m.display_override || []).join(' > ')}), orientation ${m.orientation}`);
    const relativ = [m.start_url, m.scope, ...m.icons.map((i) => i.src)].every((p) => !/^\/|^https?:/.test(p));
    melde(relativ, 'alle Pfade relativ (geht unter /alpine-rally/ auf GitHub Pages)');
    // PNG-Kopf: Breite und Höhe ab Byte 16
    const png = (d) => { const b = fs.readFileSync(path.join(WURZEL, d)); return b.slice(1, 4).toString() === 'PNG' ? [b.readUInt32BE(16), b.readUInt32BE(20)] : null; };
    for (const i of m.icons) {
      const g = fs.existsSync(path.join(WURZEL, i.src)) ? png(i.src) : null;
      melde(g && `${g[0]}x${g[1]}` === i.sizes, `${i.src}: ${g ? `${g[0]}x${g[1]}` : 'fehlt'} (Soll ${i.sizes}, ${i.purpose})`);
    }
    melde(m.icons.some((i) => i.purpose === 'maskable') && ['192x192', '512x512'].every((g) => m.icons.some((i) => i.sizes === g)), 'Icons 192, 512 und ein maskable');
  }
  const html = fs.readFileSync(path.join(WURZEL, 'index.html'), 'utf8');
  const apple = /<link rel="apple-touch-icon" href="([^"]+)"/.exec(html);
  const ag = apple && fs.existsSync(path.join(WURZEL, apple[1])) ? (() => { const b = fs.readFileSync(path.join(WURZEL, apple[1])); return `${b.readUInt32BE(16)}x${b.readUInt32BE(20)}`; })() : null;
  melde(ag === '180x180', `apple-touch-icon ${apple ? apple[1] : 'fehlt'}: ${ag}`);
  const meta = ['<link rel="manifest" href="manifest.webmanifest">', 'name="apple-mobile-web-app-capable" content="yes"', 'name="mobile-web-app-capable" content="yes"',
    'name="apple-mobile-web-app-status-bar-style" content="black-translucent"', 'name="apple-mobile-web-app-title"', 'name="theme-color"', 'viewport-fit=cover'];
  const fehlt = meta.filter((z) => !html.includes(z));
  melde(fehlt.length === 0, `index.html: ${meta.length} Meta-/Link-Zeilen da${fehlt.length ? `; fehlt: ${fehlt.join(', ')}` : ''}`);
  const sw = ['js', '.'].flatMap((d) => fs.readdirSync(path.join(WURZEL, d)).filter((f) => /\.(js|html)$/.test(f)).map((f) => path.join(WURZEL, d, f)))
    .filter((f) => /serviceWorker\s*\.\s*register/.test(fs.readFileSync(f, 'utf8')));
  melde(sw.length === 0, `kein Service Worker (${sw.length} Dateien registrieren einen)`);
}

if (teil('n')) {
  console.log('(n) Spiel lädt mit Manifest');
  for (const [name, geraet, W, H] of [['Desktop', {}, 640, 360], ['Handy', HANDY, 402, 874]]) {
    const s = await starteSpiel({ breite: W, hoehe: H, geraet });
    const fehlend = [];
    s.page.on('response', (r) => { if (r.status() >= 400) fehlend.push(`${r.status()} ${r.url()}`); });
    const t0 = Date.now();
    await s.page.goto(`${s.url}/index.html`);
    await s.page.waitForFunction(() => window.__alpineRally, null, { timeout: 120000 });
    const ms = Date.now() - t0;
    await warte(1500);
    const mf = await s.page.evaluate(async () => { const l = document.querySelector('link[rel=manifest]'); if (!l) return null; const r = await fetch(l.href); return { ok: r.ok, typ: r.headers.get('content-type') }; });
    melde(s.fehler.length === 0 && fehlend.length === 0 && mf && mf.ok, `${name}: geladen in ${ms} ms, Manifest abrufbar, ${s.fehler.length} Konsolenfehler, ${fehlend.length} fehlende Dateien${fehlend.length ? ` (${fehlend.join(', ')})` : ''}`);
    await s.schliessen();
  }
  if (ALT) {
    const r = werkzeug('ladezeit.mjs', [ALT, '9']);
    fs.writeFileSync(path.join(LOG, 'ladezeit.log'), r.text);
    const med = (n) => +((new RegExp(`${n} .*Median (\\d+)`).exec(r.text) || [])[1]);
    const a = med('alt'), b = med('neu');
    melde(b - a <= 30, `Ladezeit (Median aus 9): 0.8h ${a} ms, 0.9a ${b} ms (${b - a >= 0 ? '+' : ''}${b - a} ms, höchstens +30; Streuung im Test-Browser ca. ±100 ms)`);
  } else info('Ladezeit gegen 0.8h: nur mit --alt <ordner 0.8h>');
}

// ===================================================================== (u) Unveränderlich gegen 0.8h
if (teil('u')) {
  console.log('(u) Unveränderlich gegen 0.8h');
  if (!ALT) info('nur mit --alt <ordner 0.8h> (git worktree add <ordner> b796508)');
  else {
    // Quelltext von Fahren, Ton, Autos, Tacho, Strecke, Garage unverändert seit 0.8h
    const dateien = ['js/audio.js', 'js/umgebung.js', 'js/musik.js', 'js/musikstueck.js', 'js/tonfahrt.js', 'js/physics.js', 'js/getriebe.js', 'js/fahrprofil.js',
      'js/autos.js', 'js/car.js', 'js/track.js', 'js/netz.js', 'js/tacho.js', 'js/vergleich.js', 'js/garage.js', 'js/bestzeiten.js', 'js/pacenotes-tempo.js', 'js/abkuerzungen.js', 'tools/schneiden-zeiten.json'];
    const geaendert = dateien.filter((d) => spawnSync('git', ['diff', '--quiet', 'b796508', '--', d], { cwd: WURZEL }).status !== 0);
    melde(geaendert.length === 0, `${dateien.length} Dateien (Ton, Physik, Getriebe, Fahrprofil, Autos, Strecke, Tacho, Live-Vergleich, Garage, Bestzeiten, Pace-Notes-Tabelle, Abkürzungen) unverändert seit 0.8h${geaendert.length ? `; geändert: ${geaendert.join(', ')}` : ''}`);
    // config.js: nur Version, Standardwert touch und der neue Block touch
    const diff = spawnSync('git', ['diff', '-U0', 'b796508', '--', 'js/config.js'], { cwd: WURZEL, encoding: 'utf8' }).stdout;
    const zeilen = diff.split('\n').filter((z) => /^[+-]/.test(z) && !/^(\+\+\+|---)/.test(z));
    const entfernt = zeilen.filter((z) => z.startsWith('-'));
    melde(entfernt.every((z) => /VERSION/.test(z)), `js/config.js: nur hinzugefügt (Block touch, Standard touch: 'auto') und die Version geändert (${zeilen.length} Zeilen, ${entfernt.length} entfernt)`);
    // der Rest über m8g-test (Tacho, Fahrmessung, Aussehen, Testfahrer, Ton, Abkürzungen, Strecke, Bildzeit, Ladezeit)
    const args = ['--nur', 'a,h,i', '--alt', ALT, ...(process.argv.includes('--lang') ? ['--lang'] : [])];
    const geaenderteDateien = () => new Set(spawnSync('git', ['diff', '--name-only'], { cwd: WURZEL, encoding: 'utf8' }).stdout.split('\n').filter(Boolean));
    const vorher = geaenderteDateien();
    const r = werkzeug('m8g-test.mjs', args);
    fs.writeFileSync(path.join(LOG, 'm8g-test.log'), r.text);
    const z = r.text.split('\n').filter((x) => /^\s*(ok|FEHLER)\s/.test(x));
    for (const x of z) melde(/^\s*ok/.test(x), `m8g-test: ${x.replace(/^\s*(ok|FEHLER)\s+/, '').replace(/0\.8f/g, '0.8h (--alt)').replace(/Bildzeit im Spiel 0\.8g/, 'Bildzeit im Spiel 0.9a')}`);
    melde(z.length > 0, `m8g-test ${args.join(' ')} ausgeführt (${z.length} Prüfungen, Ausgabe ${LOG}/m8g-test.log)`);
    const neuGeaendert = [...geaenderteDateien()].filter((d) => !vorher.has(d) && /^(screenshots|tools)\//.test(d));
    if (neuGeaendert.length) spawnSync('git', ['checkout', '--', ...neuGeaendert], { cwd: WURZEL });
    info(`von den alten Tests geänderte Messdateien zurückgesetzt: ${neuGeaendert.length}`);
  }
}

console.log(fehler ? `\n${fehler} FEHLER` : '\nalles ok');
process.exit(fehler ? 1 : 0);
