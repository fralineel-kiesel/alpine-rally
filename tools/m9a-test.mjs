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
async function handy(breite, hoehe, { adresse = '', speicher = null, geraet = HANDY, wurzel = WURZEL } = {}) {
  const s = await starteSpiel({ wurzel, breite, hoehe, geraet });
  if (speicher) await s.page.addInitScript((sp) => { if (!sessionStorage.getItem('m9a')) { localStorage.clear(); for (const [k, v] of Object.entries(sp)) localStorage.setItem(k, v); sessionStorage.setItem('m9a', '1'); } }, speicher);
  await s.page.goto(`${s.url}/index.html${adresse}`);
  await s.page.waitForFunction(() => window.__alpineRally && window.__alpineRally.touch, null, { timeout: 120000 });
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
  const bild = () => warte(80); // ein paar Bilder laufen lassen
  return { s, page: s.page, cdp, f, ev, lay, mitte, dpadPunkt, bildPunkt, bild, async zu() { await s.schliessen(); } };
}

// ===================================================================== Teil B: Eingabe
// Rennen ohne Menü (wie die alten Tests), Handy hoch; Hilfen im Browser
async function rennenHandy(W = 402, H = 874, adresse = '?menue=aus') {
  const h = await handy(W, H, { adresse });
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
    A.anhalten = true; A.start({ countdown: false });
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
  const h = await handy(402, 874);
  await h.bild();
  const t0 = await h.ev(() => window.__alpineRally.ablauf.zustand);
  await h.f.auf(1, await h.bildPunkt(160, 90)); await h.bild();
  const t1 = await h.ev(() => window.__alpineRally.ablauf.zustand);
  await h.f.ab(1); await h.bild();
  const t2 = await h.ev(() => ({ z: window.__alpineRally.ablauf.zustand, ton: window.__alpineRally.ton.zustand }));
  melde(t0 === 'titel' && t1 === 'titel' && t2.z === 'menue', `Titel: beim Aufsetzen noch ${t1}, beim Loslassen (touchend) ${t2.z}; Ton-Kontext ${t2.ton}`);
  const M = () => h.ev(() => ({ seite: window.__alpineRally.menue.seite.id, wahl: window.__alpineRally.menue.wahl, tiefe: window.__alpineRally.menue.stapel.length }));
  const m0 = await M();
  await h.f.tippe(await h.dpadPunkt(180)); await h.bild();
  const m1 = await M();
  await h.f.tippe(await h.dpadPunkt(0)); await h.bild();
  const m2 = await M();
  melde(m1.wahl === m0.wahl + 1 && m2.wahl === m0.wahl, `D-Pad ↓ / ↑ im Hauptmenü: Wahl ${m0.wahl} -> ${m1.wahl} -> ${m2.wahl}`);
  // gehalten: Wiederholung (0.4 s, dann alle 0.12 s)
  await h.f.auf(1, await h.dpadPunkt(180)); await warte(1000);
  const m3 = await M(); await h.f.ab(1); await h.bild();
  const schritte = (m3.wahl - m0.wahl + 7 * 10) % 7;
  melde(schritte >= 4, `D-Pad ↓ 1 s gehalten: wiederholt (${schritte} Schritte in 7 Einträgen, Soll ca. 1 + 5)`);
  // Einstellungen: A öffnet, D-Pad zum Regler LAUTSTÄRKE, → gehalten erhöht in mehreren Schritten, B zurück
  await h.ev(() => { const A = window.__alpineRally; A.menue.zeige(A.seiten.haupt, true); });
  await h.bild();
  for (let i = 0; i < 4; i++) { await h.f.tippe(await h.dpadPunkt(180)); await h.bild(); }
  await h.f.tippe(await h.mitte('a')); await h.bild();
  const e0 = await M();
  const ziel = await h.ev(() => window.__alpineRally.menue.seite.eintraege.findIndex((e) => e.text === 'einst.lautstaerke'));
  for (let n = 0; n < 40 && (await M()).wahl !== ziel; n++) { await h.f.tippe(await h.dpadPunkt(180)); await h.bild(); }
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
  await h.bild();
  const g0 = await h.ev(() => ({ wahl: window.__alpineRally.menue.wahl, auto: window.__alpineRally.autoWahl.auto }));
  await h.f.tippe(await h.dpadPunkt(180)); await h.bild();
  const g1 = await h.ev(() => ({ wahl: window.__alpineRally.menue.wahl, auto: window.__alpineRally.autoWahl.auto, vorschau: window.__alpineRally.seiten.garage.vorschauId(), hinweis: window.__alpineRally.menue.seite.hinweis() }));
  await h.f.tippe(await h.mitte('a')); await h.bild();
  const g2 = await h.ev(() => ({ auto: window.__alpineRally.autoWahl.auto }));
  melde(g1.wahl === g0.wahl + 1 && g1.auto === g0.auto && g2.auto !== g0.auto && g2.auto === g1.vorschau, `Garage: D-Pad ↓ markiert ${g1.vorschau} (gewählt bleibt ${g1.auto}), A wählt -> ${g2.auto}; Hinweis "${g1.hinweis}"`);
  await h.ev(() => window.__alpineRally.autoWechseln('rt4'));
  // Bestzeiten: D-Pad ← → wechselt das Auto
  await h.ev(() => { const A = window.__alpineRally; A.menue.zeige(A.seiten.haupt, true); A.menue.oeffne(A.seiten.bestzeiten, true); });
  await h.bild();
  const autoBz = () => h.ev(() => { const s = window.__alpineRally.menue.seite; const l = typeof s.eintraege === 'function' ? s.eintraege() : s.eintraege; const e = l.find((x) => x.typ === 'auswahl'); return e ? e.lesen() : null; });
  const b0 = await autoBz();
  await h.f.tippe(await h.dpadPunkt(90)); await h.bild();
  const b1 = await autoBz();
  await h.f.tippe(await h.dpadPunkt(270)); await h.bild();
  const b2 = await autoBz();
  melde(b0 !== null && b1 !== b0 && b2 === b0, `Bestzeiten-Seite: D-Pad → / ← wechselt das Auto (${b0} -> ${b1} -> ${b2})`);
  // Eintrag direkt antippen (Hauptmenü: ETAPPE)
  await h.ev(() => { const A = window.__alpineRally; A.menue.zeige(A.seiten.haupt, true); });
  await h.bild();
  const hit = await h.ev(() => { const A = window.__alpineRally; const l = A.seiten.haupt.eintraege; const nr = l.findIndex((e) => e.text === 'menue.etappe'); return A.menue.treffer.find((t) => t.nr === nr); });
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
  const h = await handy(402, 874);
  await h.ev(() => {
    window.__m9a = { maus: 0, wechsel: [] };
    for (const t of ['mousedown', 'mouseup', 'click']) window.addEventListener(t, () => window.__m9a.maus++, true);
    window.__alpineRally.ablauf.beiWechsel((n) => window.__m9a.wechsel.push(n));
  });
  await h.f.tippe(await h.bildPunkt(160, 90)); await h.bild(); await warte(400);
  const r1 = await h.ev(() => ({ ...window.__m9a, z: window.__alpineRally.ablauf.zustand, tiefe: window.__alpineRally.menue.stapel.length }));
  melde(r1.wechsel.join() === 'menue' && r1.maus === 0, `Titel antippen: Wechsel ${r1.wechsel.join(',')} (genau einmal), ${r1.maus} Mausereignisse`);
  // Eintrag antippen öffnet genau eine Seite
  const hit = await h.ev(() => { const A = window.__alpineRally; const nr = A.seiten.haupt.eintraege.findIndex((e) => e.text === 'menue.steuerung'); return A.menue.treffer.find((t) => t.nr === nr); });
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

console.log(fehler ? `\n${fehler} FEHLER` : '\nalles ok');
process.exit(fehler ? 1 : 0);
