// Meilenstein 9a.1 prüfen:  node tools/m9a1-test.mjs [--nur a,b,c,...] [--alt <ordner 0.9a>] [--lang]
// Alles läuft in Chromium (Playwright) mit Touch-Emulation (hasTouch, isMobile); Mehrfinger über CDP
// Input.dispatchTouchEvent. Kein echtes Handy, kein Safari, kein Firefox, keine echte Vibration.
//   Teil A – Belegung, kleine Knöpfe, Texte:
//   (a) Knopf-Aktionen mit der neuen Belegung (R = Handbremse, L = zurück auf die Strasse)
//   (b) Menü: L = bisheriges R (Zielbildschirm: NEU STARTEN), R tut nichts
//   (c) Layout in allen Fenstergrössen aus M9a (mit Safe-Area beim iPhone): nichts überlappt, Treffer ≥ 44 (kleine ≥ 36),
//       Rand ≥ 24, Bild 16:9, R über A/B, kleine Knöpfe kleiner als in 0.9a (mit --alt)
//   (d) Desktop ohne Touch pixelgleich gegen 0.9a (mit --alt): Lage der Bühne, Menüseiten, HUD, ganzes Bild
//   Teil B – D-Pad:
//   (e) Grösse des D-Pads im Querformat in allen Fenstergrössen (Hochformat unverändert), nichts überlappt
//   (f) Trefferzonen beim Fahren: weit neben dem Kreuz = ← / →, knapp neben der Senkrechten = ↑, Schrägen, tote Mitte,
//       Gleiten ← → ← ↖, Gesamtzone verlassen = los
//   (g) im Menü klassisch: ↑ ↓ ← → je 90° breit, keine grosse Zone
//   (h) Lenken über denselben weichen Aufbau wie die Pfeiltaste (auch aus der grossen Zone)
//   Teil C – AUTO-GAS:
//   (i) AUS: wie bisher; (j) AN: Gas nach dem Start, B = kein Gas, R = Gas bleibt, Pause/Menü/Countdown/Ziel kein Gas;
//   (k) Einstellung bleibt nach Neuladen; (l) Physik unverändert (Tastatur, über (u))
//   Teil D – Haptik:
//   (m) aus / knoepfe / voll mit Zähler an navigator.vibrate; (n) Rate-Limit; (o) ohne navigator.vibrate: iOS-Schalter,
//   keine neuen Elemente; (p) Desktop 0 Aufrufe; (q) Bildzeit, Garbage (über (u))
//   Teil E – Unveränderlich:
//   (u) Quelltext Fahren/Ton/Autos unverändert seit 0.9a, über m8g-test --nur a,h,i --alt <0.9a>: Tacho, Fahrmessung,
//       Autos, Testfahrer, Ton, Abkürzungen, Strecke, Bildzeit, Ladezeit; mit --lang dazu alle bisherigen Tests
//   (v) die Tests von M9a (tools/m9a-test.mjs, angepasst an R/L und die neuen Zonen)

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
const LOG = '/tmp/m9a1';
fs.mkdirSync(LOG, { recursive: true });
const werkzeug = (name, argumente = [], timeout = 6 * 3600000, wurzel = WURZEL) => {
  const r = spawnSync(process.execPath, [path.join(wurzel, 'tools', name), ...argumente], { encoding: 'utf8', timeout, maxBuffer: 64 * 1024 * 1024, cwd: wurzel });
  return { code: r.status, text: `${r.stdout || ''}${r.stderr || ''}` };
};
const HANDY = { hasTouch: true, isMobile: true, deviceScaleFactor: 1 };
const warte = (ms) => new Promise((r) => setTimeout(r, ms));

// Spiel im Handy-Browser laden (wie tools/m9a-test.mjs). adresse: Teil hinter index.html; speicher: localStorage vorher;
// leicht: 3D-Szene ausblenden (nur Test, der Test-Browser ist sonst im Menü sehr langsam); vorher: Skript vor dem Laden
async function handy(breite, hoehe, { adresse = '', speicher = null, geraet = HANDY, wurzel = WURZEL, leicht = false, vorher = null } = {}) {
  const s = await starteSpiel({ wurzel, breite, hoehe, geraet });
  await s.page.addInitScript(() => { window.__bilder = 0; const f = () => { window.__bilder++; requestAnimationFrame(f); }; requestAnimationFrame(f); });
  if (speicher) await s.page.addInitScript((sp) => { if (!sessionStorage.getItem('m9a1')) { localStorage.clear(); for (const [k, v] of Object.entries(sp)) localStorage.setItem(k, v); sessionStorage.setItem('m9a1', '1'); } }, speicher);
  if (vorher) await s.page.addInitScript(vorher);
  await s.page.goto(`${s.url}/index.html${adresse}`);
  await s.page.waitForFunction(() => window.__alpineRally && window.__alpineRally.touch, null, { timeout: 120000 });
  if (leicht) await s.page.evaluate(() => { window.__alpineRally.szene.visible = false; });
  const cdp = await s.page.context().newCDPSession(s.page);
  const aktiv = new Map(); // id -> { x, y }
  const sende = (type) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: [...aktiv].map(([id, p]) => ({ x: p.x, y: p.y, id })) });
  const f = {
    async auf(id, p) { aktiv.set(id, p); await sende('touchStart'); },
    async zu(id, p) { aktiv.set(id, p); await sende('touchMove'); },
    async ab(id) { const p = aktiv.get(id); aktiv.delete(id); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [{ x: p.x, y: p.y, id }] }); },
    async abbrechen() { aktiv.clear(); await cdp.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] }); },
    async tippe(p, ms = 60) { await this.auf(99, p); await warte(ms); await this.ab(99); },
  };
  const ev = (fn, a) => s.page.evaluate(fn, a);
  const lay = () => ev(() => window.__alpineRally.touch.layoutJetzt);
  const mitte = async (n) => { const L = await lay(); const r = L.el[n].v; return { x: r.x + r.b / 2, y: r.y + r.h / 2 }; };
  // Punkt um die Mitte des D-Pads: Winkel (0 = hoch, im Uhrzeigersinn) und Abstand als Anteil des Radius
  const dpadPunkt = async (grad, anteil = 0.7) => {
    const L = await lay(); const v = L.el.dpad.v; const r = v.b / 2; const w = grad * Math.PI / 180;
    return { x: v.x + r + Math.sin(w) * r * anteil, y: v.y + r - Math.cos(w) * r * anteil };
  };
  const bildPunkt = (x, y) => ev(([x, y]) => { const r = document.getElementById('hud').getBoundingClientRect(); return { x: r.left + x / 320 * r.width, y: r.top + y / 180 * r.height }; }, [x, y]);
  const bilder = () => s.page.evaluate(() => window.__bilder);
  const bild = async () => { const n = await bilder(); for (let i = 0; i < 500 && (await bilder()) < n + 2; i++) await warte(10); };
  const ruhig = async () => { for (let i = 0; i < 100; i++) { const n = await bilder(); await warte(300); if ((await bilder()) - n >= 6) return; } };
  return { s, page: s.page, cdp, f, ev, lay, mitte, dpadPunkt, bildPunkt, bild, ruhig, async zu() { await s.schliessen(); } };
}
// Rennen ohne Menü (wie die alten Tests), Handy hoch; Physik von aussen angehalten
async function rennenHandy(W = 402, H = 874, adresse = '?menue=aus', opt = {}) {
  const h = await handy(W, H, { adresse, leicht: true, ...opt });
  await h.ev(() => { window.__alpineRally.anhalten = true; });
  await h.bild();
  return h;
}
const halten = (h) => h.ev(() => ({ ...window.__alpineRally.touch.halten }));
const tein = (h) => h.ev(() => ({ ...window.__alpineRally.touch.eingabe }));
const testZustand = (h) => h.ev(() => { const A = window.__alpineRally; if (!A.ablauf.def || A.ablauf.zustand !== 'test') { A.ablauf.registriere('test', { welt: null }); A.ablauf.wechsle('test'); } });
const lies = (h, dt = 1 / 60) => h.ev(async (dt) => { const I = await import('/js/input.js'); const e = I.leseEingabe(dt); return { ...e }; }, dt);

// ===================================================================== Teil A
if (teil('a')) {
  console.log('(a) Knopf-Aktionen mit der neuen Belegung (R = Handbremse, L = zurück auf die Strasse)');
  const h = await rennenHandy();
  await testZustand(h);
  // gehaltene Aktionen über die echte Abfrage leseEingabe (wie im Spiel); dazu: was der Knopf NICHT tun darf
  const proben = [['a', 'gas', 1], ['b', 'bremse', 1], ['r', 'handbremse', true]];
  for (const [k, aktion, soll] of proben) {
    await h.f.auf(1, await h.mitte(k)); await h.bild();
    const e = await lies(h);
    await h.f.ab(1); await h.bild();
    const nach = await lies(h);
    const sonst = ['gas', 'bremse', 'handbremse', 'reset'].filter((x) => x !== aktion && e[x]);
    melde(e[aktion] === soll && !nach[aktion] && sonst.length === 0, `${k.toUpperCase()}: ${aktion} = ${e[aktion]} beim Halten, nach dem Loslassen ${nach[aktion]}${sonst.length ? `; auch ${sonst.join(', ')}` : ''}`);
  }
  // L gehalten: keine Handbremse mehr (nur einmal "zurück auf die Strasse")
  await h.f.auf(1, await h.mitte('l')); await h.bild();
  const l1 = await lies(h); const l2 = await lies(h);
  await h.f.ab(1); await h.bild();
  melde(!l1.handbremse && !l2.handbremse && l1.reset && !l2.reset, `L gehalten: Handbremse ${l1.handbremse} (nicht mehr), zurück auf die Strasse einmal (${l1.reset} / ${l2.reset})`);
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
    for (let i = 0; i < 40; i++) await lies(h);
  }
  // einmalige Aktionen im Rennen
  await h.ev(() => { const A = window.__alpineRally; A.start({ countdown: false }); });
  await h.bild();
  const vor = await h.ev(() => { const A = window.__alpineRally; return { hud: A.hudSchalter.an, notes: A.paceNotes.anzeige.an }; });
  await h.f.tippe(await h.mitte('select')); await h.bild();
  await h.f.tippe(await h.mitte('notes')); await h.bild();
  const nach = await h.ev(() => { const A = window.__alpineRally; return { hud: A.hudSchalter.an, notes: A.paceNotes.anzeige.an }; });
  melde(nach.hud !== vor.hud && nach.notes !== vor.notes, `SELECT: HUD ${vor.hud ? 'an' : 'aus'} -> ${nach.hud ? 'an' : 'aus'}, NOTES: Pace-Notes ${vor.notes ? 'an' : 'aus'} -> ${nach.notes ? 'an' : 'aus'}`);
  await h.f.tippe(await h.mitte('select')); await h.f.tippe(await h.mitte('notes')); await h.bild();
  // R vor dem Start: nichts (nur Handbremse); L vor dem Start: sofort auf die Strasse; L im Rennen: mit Wartezeit
  const r0 = await h.ev(() => { const A = window.__alpineRally; A.physik.x += 6; return { z: A.rennen.zustand, x: A.physik.x }; });
  await h.f.tippe(await h.mitte('r')); await h.bild();
  const r1 = await h.ev(() => { const A = window.__alpineRally; return { x: A.physik.x, rest: A.rueck.rest }; });
  melde(Math.abs(r1.x - r0.x) < 1e-9 && !(r1.rest > 0), `R vor dem Start (Rennen ${r0.z}): kein Zurücksetzen (x ${r0.x.toFixed(1)} bleibt ${r1.x.toFixed(1)})`);
  await h.f.tippe(await h.mitte('l')); await h.bild();
  const r2 = await h.ev(() => { const A = window.__alpineRally; return { x: A.physik.x, rest: A.rueck.rest }; });
  melde(Math.abs(r2.x - r0.x) > 1 && !(r2.rest > 0), `L vor dem Start: sofort zurück auf die Strasse (x ${r0.x.toFixed(1)} -> ${r2.x.toFixed(1)})`);
  await h.ev(() => { const A = window.__alpineRally; A.rennen.zustand = 'laeuft'; });
  await h.f.tippe(await h.mitte('l')); await h.bild();
  const r3 = await h.ev(() => window.__alpineRally.rueck.rest);
  melde(r3 > 0, `L im laufenden Rennen: Wartezeit läuft (${r3.toFixed(2)} s, wie Taste R)`);
  await h.f.tippe(await h.mitte('start')); await h.bild();
  const p = await h.ev(() => window.__alpineRally.ablauf.zustand);
  await h.f.tippe(await h.mitte('start')); await h.bild();
  const w = await h.ev(() => window.__alpineRally.ablauf.zustand);
  melde(p === 'pause' && w === 'rennen', `START: Pause (${p}), noch einmal: weiter (${w})`);
  // Hilfezeile vor dem Start und Steuerungs-Seite (de + en)
  const tx = await h.ev(async () => {
    const T = await import('/js/texte.js');
    const A = window.__alpineRally;
    const zeilen = (A.seiten.steuerung.eintraege || []).filter((e) => e.typ === 'info' && e.inhalt).map((e) => e.inhalt());
    return { de: T.TEXTE['hud.touchHandbremse'].de, en: T.TEXTE['hud.touchHandbremse'].en, zeilen: zeilen.filter((z) => /^[RL] \|/.test(z)) };
  });
  melde(tx.de === 'R: HANDBREMSE  L: AUF STRASSE' && tx.en === 'R: HANDBRAKE  L: BACK ON ROAD' && tx.zeilen.length === 2 && /^R \| HANDBREMSE/.test(tx.zeilen[0]) && /^L \| ZURÜCK AUF STRASSE/.test(tx.zeilen[1]),
    `Texte: Hilfezeile "${tx.de}" / "${tx.en}", Steuerungs-Seite ${tx.zeilen.join(' · ')}`);
  await h.zu();
}

if (teil('b')) {
  console.log('(b) Menü: L = bisheriges R, R tut nichts');
  const z = await handy(402, 874, { adresse: '?ton=aus', leicht: true });
  const ziel = () => z.ev(() => {
    const A = window.__alpineRally;
    A.anhalten = true; A.start();
    A.rennen.zustand = 'ziel'; A.rennen.endZeit = 160; A.ablauf.wechsle('ziel');
  });
  await ziel(); await z.bild();
  const vorZ = await z.ev(() => ({ z: window.__alpineRally.ablauf.zustand, wahl: window.__alpineRally.menue.wahl }));
  await z.f.tippe(await z.mitte('r')); await z.bild();
  const nachR = await z.ev(() => ({ z: window.__alpineRally.ablauf.zustand, wahl: window.__alpineRally.menue.wahl }));
  await z.f.tippe(await z.mitte('l')); await z.bild();
  const nachL = await z.ev(() => window.__alpineRally.ablauf.zustand);
  melde(vorZ.z === 'ziel' && nachR.z === 'ziel' && nachR.wahl === vorZ.wahl && nachL === 'countdown', `Zielbildschirm: R tut nichts (${nachR.z}), L = NEU STARTEN (${vorZ.z} -> ${nachL})`);
  // Hauptmenü und Pause: R und L ändern Seite und Auswahl nicht
  for (const [name, f] of [['Hauptmenü', () => { const A = window.__alpineRally; A.zumMenue(); A.menue.zeige(A.seiten.haupt, true); }], ['Pause', () => { const A = window.__alpineRally; A.start({ countdown: false }); A.pausieren(); }]]) {
    await z.ev(f); await z.bild();
    const m = () => z.ev(() => ({ z: window.__alpineRally.ablauf.zustand, seite: window.__alpineRally.menue.seite.id, wahl: window.__alpineRally.menue.wahl, tiefe: window.__alpineRally.menue.stapel.length }));
    const m0 = await m();
    await z.f.tippe(await z.mitte('r')); await z.bild(); const m1 = await m();
    await z.f.tippe(await z.mitte('l')); await z.bild(); const m2 = await m();
    melde(JSON.stringify(m0) === JSON.stringify(m1) && JSON.stringify(m0) === JSON.stringify(m2), `${name}: R und L ändern nichts (${m0.z}/${m0.seite}, Wahl ${m0.wahl})`);
  }
  // Rennen: R hält die Handbremse nicht im Menü (Pause) fest
  const e = await tein(z);
  melde(!e.handbremse && !e.reset, `in der Pause: Handbremse ${e.handbremse}, zurück ${e.reset}`);
  await z.zu();
}

// ===================================================================== Layout (c) (e)
const GROESSEN = [
  ['iPhone 16 Pro hoch', 402, 874], ['kleines iPhone hoch', 375, 667], ['Pixel/Xiaomi hoch', 412, 915], ['kleines Android hoch', 360, 640],
  ['iPhone 16 Pro quer', 874, 402], ['iPhone quer mit Safari-Leisten', 874, 330], ['Pixel/Xiaomi quer', 915, 412], ['kleines iPhone quer', 667, 375],
  ['kleines Android quer', 640, 360], ['Tablet hoch', 820, 1180], ['Tablet quer', 1180, 820],
];
const SAFE_IPHONE = { hoch: { o: 62, r: 0, u: 34, l: 0 }, quer: { o: 0, r: 62, u: 21, l: 62 } };
const ELEMENTE = ['dpad', 'a', 'b', 'l', 'r', 'select', 'start', 'notes'];
const KLEINE = ['select', 'start', 'notes'];
function pruefeLayout(L, W, H, safe) {
  const probleme = [];
  const r2 = (r) => `${r.x.toFixed(0)},${r.y.toFixed(0)} ${r.b.toFixed(0)}x${r.h.toFixed(0)}`;
  const schneiden = (a, b) => a.x < b.x + b.b - 0.01 && b.x < a.x + a.b - 0.01 && a.y < b.y + b.h - 0.01 && b.y < a.y + a.h - 0.01;
  const innen = (a, b) => a.x >= b.x - 0.01 && a.y >= b.y - 0.01 && a.x + a.b <= b.x + b.b + 0.01 && a.y + a.h <= b.y + b.h + 0.01;
  const sicht = { x: Math.max(24, safe.l), y: safe.o, b: W - Math.max(24, safe.l) - Math.max(24, safe.r), h: H - safe.o - safe.u };
  for (let i = 0; i < ELEMENTE.length; i++) {
    const n = ELEMENTE[i], e = L.el[n];
    const min = KLEINE.includes(n) ? (L.format === 'hoch' ? 44 : 36) : 44;
    if (e.b < min - 0.01 || e.h < min - 0.01) probleme.push(`${n} Treffer ${e.b.toFixed(0)}x${e.h.toFixed(0)} (< ${min})`);
    if (!innen(e.v, e)) probleme.push(`${n} sichtbar ausserhalb der Trefferfläche`);
    if (!innen(e, sicht)) probleme.push(`${n} ausserhalb des sicheren Bereichs (${r2(e)})`);
    if (schneiden(e, L.bild)) probleme.push(`${n} überlappt das Bild`);
    if (L.flaeche && !innen(e, L.flaeche)) probleme.push(`${n} nicht auf der Steuerfläche`);
    for (let j = i + 1; j < ELEMENTE.length; j++) if (schneiden(e, L.el[ELEMENTE[j]])) probleme.push(`${n} überlappt ${ELEMENTE[j]}`);
  }
  if (Math.abs(L.bild.b * 9 - L.bild.h * 16) > 1e-6) probleme.push('Bild nicht 16:9');
  if (L.bild.y < safe.o - 0.01 || L.bild.y + L.bild.h > H - safe.u + 0.01 || L.bild.x < safe.l - 0.01 || L.bild.x + L.bild.b > W - safe.r + 0.01) probleme.push('Bild im Safe-Area-Rand');
  if (L.flaeche && schneiden(L.flaeche, L.bild)) probleme.push('Steuerfläche überlappt das Bild');
  if (L.format === 'hoch' && Math.abs(L.bild.b - (W - safe.l - safe.r)) > 0.01) probleme.push('Hochformat: Bild nicht volle Breite');
  if (L.format === 'quer') {
    // so gross wie erlaubt: Bild volle Höhe (bzw. bis zur Reihe der kleinen Knöpfe) oder beide Seiten bis an die Knöpfe
    const abstand = (seite) => Math.min(...ELEMENTE.map((n) => L.el[n]).filter((e) => e.y < L.bild.y + L.bild.h && e.y + e.h > L.bild.y)
      .map((e) => (seite < 0 ? (e.x + e.b <= L.bild.x + 0.01 ? L.bild.x - (e.x + e.b) : 1e9) : (e.x >= L.bild.x + L.bild.b - 0.01 ? e.x - (L.bild.x + L.bild.b) : 1e9))));
    const unten = KLEINE.every((n) => L.el[n].y >= L.bild.y + L.bild.h);
    const hoehe = L.bild.h >= H - safe.o - safe.u - (unten ? 12 + L.el.start.h + 8 : 0) - 0.5;
    // (mittiges Bild: eine Seite reicht bis an die Knöpfe oder an die Mindestzone)
    const seiten = abstand(-1) <= 8.5 || abstand(1) <= 8.5 || Math.min(L.bild.x, W - L.bild.x - L.bild.b) <= 130.5;
    if (!hoehe && !seiten) probleme.push(`Querformat: Bild könnte grösser sein (Abstand links ${abstand(-1).toFixed(1)}, rechts ${abstand(1).toFixed(1)})`);
  }
  // M9a.2: R wieder oben in der rechten Ecke (gleiche Höhe wie L, rechte Kante wie A) statt direkt über A
  const R = L.el.r, A = L.el.a;
  if (!(Math.abs(R.y - L.el.l.y) < 0.5 && Math.abs(R.x + R.b - (A.x + A.b)) < 0.5 && R.y + R.h <= A.y)) probleme.push(`R nicht oben in der Ecke (${R.y.toFixed(1)} statt ${L.el.l.y.toFixed(1)})`);
  const xs = ELEMENTE.map((n) => L.el[n]);
  const links = Math.min(...xs.map((e) => e.x)), rechts = W - Math.max(...xs.map((e) => e.x + e.b));
  if (links < Math.max(24, safe.l) - 0.01 || rechts < Math.max(24, safe.r) - 0.01) probleme.push(`Rand ${links.toFixed(0)} / ${rechts.toFixed(0)}`);
  return { probleme, links, rechts };
}
// Layout aller Grössen in einem Browser messen (wurzel: dieser Stand oder 0.9a)
async function layouts(wurzel = WURZEL) {
  const out = [];
  for (const [name, W, H] of GROESSEN) {
    const h = await handy(W, H, { wurzel });
    for (const mitSafe of [false, true]) {
      if (mitSafe && !/iPhone/.test(name)) continue;
      const safe = mitSafe ? SAFE_IPHONE[H > W ? 'hoch' : 'quer'] : { o: 0, r: 0, u: 0, l: 0 };
      await h.ev((s) => window.__alpineRally.touch.setzeSafeTest(s), safe);
      await h.bild();
      const L = await h.lay();
      const dom = await h.ev(() => {
        const r = (el) => { const b = el.getBoundingClientRect(); return { x: b.left, y: b.top, b: b.width, h: b.height }; };
        return { buehne: r(document.getElementById('buehne')), dpad: r(document.querySelector('.touch-dpad')), rr: r(document.querySelector('.touch-r')), start: r(document.querySelector('.touch-start')), sw: document.documentElement.scrollWidth, sh: document.documentElement.scrollHeight };
      });
      out.push({ name: `${name}${mitSafe ? ' + Safe-Area' : ''}`, W, H, safe, L, dom });
    }
    await h.zu();
  }
  return out;
}
const flaecheKlein = (L) => KLEINE.reduce((s, n) => s + L.el[n].b * L.el[n].h, 0);
let layoutNeu = null;
if (teil('c') || teil('e')) layoutNeu = await layouts();
if (teil('c')) {
  console.log('(c) Layout in allen Fenstergrössen');
  const alt = ALT ? await layouts(ALT) : null;
  const tabelle = [];
  for (const [i, { name, W, H, safe, L, dom }] of layoutNeu.entries()) {
    const p = pruefeLayout(L, W, H, safe);
    const nah = (a, b) => Math.abs(a.x - b.x) < 0.6 && Math.abs(a.y - b.y) < 0.6 && Math.abs(a.b - b.b) < 0.6 && Math.abs(a.h - b.h) < 0.6;
    if (!nah(dom.buehne, L.bild) || !nah(dom.dpad, L.el.dpad.v) || !nah(dom.rr, L.el.r.v) || !nah(dom.start, L.el.start.v)) p.probleme.push('Seite liegt nicht wie berechnet');
    if (dom.sw > W || dom.sh > H) p.probleme.push(`Seite grösser als das Fenster (${dom.sw}x${dom.sh})`);
    const a = alt && alt[i].L;
    const zeile = {
      name, W, H, format: L.format, bild: `${L.bild.b.toFixed(0)}x${L.bild.h.toFixed(0)}`, bildAlt: a ? `${a.bild.b.toFixed(0)}x${a.bild.h.toFixed(0)}` : null,
      dpad: Math.round(L.el.dpad.v.b), ab: Math.round(L.el.a.v.b), l: `${L.el.l.v.b.toFixed(0)}x${L.el.l.v.h.toFixed(0)}`, r: `${L.el.r.v.b.toFixed(0)}x${L.el.r.v.h.toFixed(0)}`,
      klein: `${L.el.select.v.b.toFixed(0)}x${L.el.select.v.h.toFixed(0)} (Treffer ${L.el.select.b.toFixed(0)}x${L.el.select.h.toFixed(0)})`,
      kleinFlaeche: Math.round(flaecheKlein(L)), kleinFlaecheAlt: a ? Math.round(flaecheKlein(a)) : null, kleinLage: L.klein || 'unten',
      zone: L.format === 'quer' ? `${L.bild.x.toFixed(0)}/${(W - L.bild.x - L.bild.b).toFixed(0)}` : '–', rand: `${p.links.toFixed(0)}/${p.rechts.toFixed(0)}`,
    };
    tabelle.push(zeile);
    const kleiner = !a || flaecheKlein(L) < flaecheKlein(a);
    melde(p.probleme.length === 0 && kleiner, `${name} ${W}x${H}: ${L.format}, Bild ${zeile.bild}${a ? ` (0.9a ${zeile.bildAlt})` : ''}, R ${zeile.r} über A, kleine ${zeile.klein}${a ? `, Fläche ${zeile.kleinFlaeche} statt ${zeile.kleinFlaecheAlt}` : ''}${p.probleme.length ? ` – ${p.probleme.slice(0, 4).join('; ')}` : ''}`);
  }
  fs.writeFileSync(path.join(LOG, 'layout.json'), JSON.stringify(tabelle, null, 1));
  info(`Tabelle der Fenstergrössen: ${path.join(LOG, 'layout.json')}`);
}

// ===================================================================== Teil B: D-Pad
if (teil('e')) {
  console.log('(e) Grösse des D-Pads (quer grösser, hoch unverändert) und Fahr-Zone');
  const alt = ALT ? await layouts(ALT) : null;
  const tab = [];
  for (const [i, { name, W, H, safe, L }] of layoutNeu.entries()) {
    const p = pruefeLayout(L, W, H, safe);
    const d = L.el.dpad, z = d.zone, a = alt && alt[i].L;
    const schneiden = (q, b) => q.x < b.x + b.b - 0.01 && b.x < q.x + q.b - 0.01 && q.y < b.y + b.h - 0.01 && b.y < q.y + q.h - 0.01;
    const innen = (q, b) => q.x >= b.x - 0.01 && q.y >= b.y - 0.01 && q.x + q.b <= b.x + b.b + 0.01 && q.y + q.h <= b.y + b.h + 0.01;
    if (!innen(d, z)) p.probleme.push('Zone enthält das D-Pad nicht');
    if (schneiden(z, L.bild)) p.probleme.push('Zone überlappt das Bild');
    // (andere Knöpfe dürfen in der Zone liegen, sie haben Vorrang: siehe (f))
    const inZone = ELEMENTE.filter((n) => n !== 'dpad' && schneiden(z, L.el[n]));
    if (inZone.some((n) => !['l', 'select', 'start', 'notes'].includes(n))) p.probleme.push(`Zone überlappt ${inZone.join(', ')}`);
    if (Math.min(d.y - z.y, z.y + z.h - d.y - d.h) < 0.35 * d.v.b - 0.5 && z.y > Math.max(L.flaeche ? L.flaeche.y : 0, safe.o) + 0.5 && z.y + z.h < H - safe.u - 0.5) p.probleme.push('Zone weniger als 35 % über/unter dem Kreuz');
    if (z.x < Math.max(24, safe.l) - 0.01) p.probleme.push('Zone am Rand');
    const oben = d.y - z.y, unten = z.y + z.h - d.y - d.h; // so weit reicht die Zone über / unter das Kreuz
    const grenze = L.format === 'quer' ? 'quer' : 'hoch';
    let ok = p.probleme.length === 0;
    if (a) ok = ok && (grenze === 'quer' ? d.v.b > a.el.dpad.v.b + 0.5 : Math.abs(d.v.b - a.el.dpad.v.b) < 0.01);
    tab.push({ name, W, H, dpad: Math.round(d.v.b), alt: a ? Math.round(a.el.dpad.v.b) : null, zone: `${z.b.toFixed(0)}x${z.h.toFixed(0)}`, ueber: Math.round(oben), unter: Math.round(unten), bild: `${L.bild.b.toFixed(0)}x${L.bild.h.toFixed(0)}`, bildAlt: a ? `${a.bild.b.toFixed(0)}x${a.bild.h.toFixed(0)}` : null, bildX: `${L.bild.x.toFixed(0)}/${(W - L.bild.x - L.bild.b).toFixed(0)}` });
    melde(ok, `${name}: D-Pad ${Math.round(d.v.b)}${a ? ` (0.9a ${Math.round(a.el.dpad.v.b)})` : ''}, Zone ${z.b.toFixed(0)}x${z.h.toFixed(0)} (über/unter dem Kreuz ${oben.toFixed(0)}/${unten.toFixed(0)} = ${(oben / d.v.b * 100).toFixed(0)}/${(unten / d.v.b * 100).toFixed(0)} %), Bild ${L.bild.b.toFixed(0)}x${L.bild.h.toFixed(0)}${a ? ` (0.9a ${a.bild.b.toFixed(0)}x${a.bild.h.toFixed(0)})` : ''}${p.probleme.length ? ` – ${p.probleme.slice(0, 4).join('; ')}` : ''}`);
  }
  fs.writeFileSync(path.join(LOG, 'dpad.json'), JSON.stringify(tab, null, 1));
}

// Punkt relativ zum D-Pad: dx, dy in Radien (+x rechts, +y unten)
const rel = (L, dx, dy) => { const v = L.el.dpad.v, r = v.b / 2; return { x: v.x + r + dx * r, y: v.y + r + dy * r }; };
const winkel = (L, grad, anteil) => { const w = grad * Math.PI / 180; return rel(L, Math.sin(w) * anteil, -Math.cos(w) * anteil); };
const probe = (h, p, fahren) => h.ev(([p, f]) => window.__alpineRally.touch.probe(p.x, p.y, f), [p, fahren]);
if (teil('f')) {
  console.log('(f) Trefferzonen beim Fahren');
  for (const [W, H] of [[874, 402], [402, 874], [874, 330]]) {
    const h = await rennenHandy(W, H);
    const L = await h.lay();
    const z = L.el.dpad.zone, v = L.el.dpad.v, r = v.b / 2, cy = v.y + r;
    const rechtsAussen = (z.x + z.b - 3 - (v.x + r)) / r; // fast am Ende der Zone (Querformat: fast am Bild)
    const faelle = [
      ['weit rechts neben dem Kreuz, auf der Höhe der Mitte', rel(L, rechtsAussen, 0), 3],
      ['weit rechts, 35 % der Kreuzhöhe über dem Kreuz', { x: v.x + r + rechtsAussen * r, y: Math.max(z.y + 1, v.y - 0.35 * v.b + 2) }, 3],
      ['weit rechts, 35 % unter dem Kreuz', { x: v.x + r + rechtsAussen * r, y: Math.min(z.y + z.h - 1, v.y + v.b + 0.35 * v.b - 2) }, 3],
      ['links aussen am Rand, über dem Kreuz', { x: z.x + 1, y: Math.max(z.y + 1, v.y - 0.3 * v.b) }, 7],
      ['links am Kreuz', winkel(L, 270, 0.9), 7],
      ['knapp neben der Senkrechten (10° von ↑)', winkel(L, 10, 0.7), 1],
      ['knapp neben der Senkrechten (350° von ↑)', winkel(L, 350, 0.7), 1],
      ['10° neben ↓', winkel(L, 170, 0.7), 5],
      ['↗ (25° von ↑)', winkel(L, 25, 0.7), 2], ['↘ (155°)', winkel(L, 155, 0.7), 4], ['↙ (205°)', winkel(L, 205, 0.7), 6], ['↖ (335°)', winkel(L, 335, 0.7), 8],
      ['45° (früher Schräge, jetzt → )', winkel(L, 45, 0.7), 3], ['60° von ↑ = 30° über der Waagerechten', winkel(L, 60, 0.9), 3],
      ['↑ weit über dem Kreuz (1.3 Radien)', winkel(L, 0, 1.3), 0], ['↗ weit weg (1.4 Radien) = nur →', winkel(L, 25, 1.4), 3],
      ['tote Mitte (0.1 Radien)', winkel(L, 90, 0.1), 0],
    ];
    const fehl = [];
    for (const [name, p, soll] of faelle) {
      const ist = await probe(h, p, true);
      if (ist.el !== 'dpad' && soll !== 0 || ist.richtung !== soll) fehl.push(`${name}: ${ist.el} ${ist.richtung} (Soll ${soll})`);
    }
    // andere Knöpfe in oder neben der Zone haben Vorrang (L oben links)
    const lMitte = { x: L.el.l.x + L.el.l.b / 2, y: L.el.l.y + L.el.l.h / 2 };
    const lp = await probe(h, lMitte, true);
    if (lp.el !== 'l') fehl.push(`auf L: ${lp.el}`);
    // ausserhalb der Zone: nichts
    const aus = await probe(h, { x: z.x + z.b + 6, y: cy }, true);
    if (aus.el) fehl.push(`rechts ausserhalb der Zone: ${aus.el}`);
    melde(fehl.length === 0, `${W}x${H}: ${faelle.length + 1} Punkte (Zone ${z.b.toFixed(0)}x${z.h.toFixed(0)}, weit rechts = ${(rechtsAussen).toFixed(2)} Radien)${fehl.length ? ` – ${fehl.join('; ')}` : ''}`);
    // Gleiten mit echtem Finger: ← über die Mitte nach →, zurück ←, dann ↖, dann ganz aus der Zone (ins Bild)
    await testZustand(h);
    const folge = [];
    const merk = async () => { await h.bild(); const t = await tein(h), hv = await halten(h); folge.push(`${hv.dpad}${t.links ? 'L' : ''}${t.rechts ? 'R' : ''}${t.gas ? 'G' : ''}`); };
    await h.f.auf(1, winkel(L, 270, 0.8)); await merk();
    await h.f.zu(1, winkel(L, 270, 0.05)); await merk();
    await h.f.zu(1, rel(L, rechtsAussen, 0.2)); await merk();
    await h.f.zu(1, winkel(L, 270, 0.8)); await merk();
    await h.f.zu(1, winkel(L, 335, 0.7)); await merk();
    await h.f.zu(1, { x: L.bild.x + L.bild.b / 2, y: L.bild.y + L.bild.h / 2 }); await merk();
    await h.f.ab(1); await merk();
    const soll = ['7L', '0', '3R', '7L', '8LG', '0', '0'];
    melde(folge.join() === soll.join(), `${W}x${H} Gleiten ← Mitte → ← ↖ ins Bild, loslassen: ${folge.join(' -> ')} (Soll ${soll.join(' -> ')})`);
    await h.zu();
  }
}

if (teil('g')) {
  console.log('(g) im Menü klassisch');
  const h = await handy(874, 402, { adresse: '?ton=aus', leicht: true });
  await h.ev(() => { const A = window.__alpineRally; A.zumMenue(); A.menue.zeige(A.seiten.haupt, true); });
  await h.bild();
  const L = await h.lay();
  const soll = [[30, 1], [44, 1], [46, 3], [60, 3], [120, 3], [134, 3], [136, 5], [170, 5], [200, 5], [240, 7], [300, 7], [320, 1], [350, 1]];
  const ist = [];
  for (const [g, r] of soll) ist.push([(await probe(h, winkel(L, g, 0.7), false)).r4, r]);
  const v = L.el.dpad.v;
  const weit = await probe(h, { x: v.x + v.b + 20, y: v.y + v.b / 2 }, false);
  melde(ist.every(([a, b]) => a === b) && weit.el === null, `Menü: Richtungen bei ${soll.map(([g]) => `${g}°`).join(' ')} = ${ist.map(([a]) => a).join(' ')} (je 90° breit), neben dem Kreuz: ${weit.el}`);
  // echter Finger: D-Pad ↓ (bei 150°, beim Fahren wäre das eine Schräge) wählt den nächsten Eintrag; neben dem Kreuz nichts
  await h.ruhig();
  const w0 = await h.ev(() => window.__alpineRally.menue.wahl);
  await h.f.tippe(winkel(L, 150, 0.7)); await h.bild();
  const w1 = await h.ev(() => window.__alpineRally.menue.wahl);
  await h.ruhig();
  await h.f.tippe({ x: v.x + v.b + 20, y: v.y + v.b / 2 }); await h.bild();
  const w2 = await h.ev(() => window.__alpineRally.menue.wahl);
  melde(w1 === w0 + 1 && w2 === w1, `Menü mit dem Finger: 150° = ↓ (Wahl ${w0} -> ${w1}), neben dem Kreuz (in der Fahr-Zone) nichts (${w2})`);
  await h.zu();
}

if (teil('h')) {
  console.log('(h) Lenken wie die Pfeiltasten (weicher Aufbau tastaturLenkung)');
  const h = await rennenHandy(874, 402);
  await testZustand(h);
  const L = await h.lay();
  const z = L.el.dpad.zone, v = L.el.dpad.v;
  const punkte = { links: winkel(L, 270, 0.7), rechtsWeit: { x: z.x + z.b - 3, y: v.y + v.b / 2 + v.b * 0.3 } };
  const verlauf = async (art, taste, p) => {
    const out = [];
    if (art === 'touch') { await h.f.auf(1, p); await h.bild(); } else await h.page.keyboard.down(taste);
    for (let i = 0; i < 30; i++) out.push((await lies(h)).lenkung);
    if (art === 'touch') { await h.f.ab(1); await h.bild(); } else await h.page.keyboard.up(taste);
    for (let i = 0; i < 30; i++) out.push((await lies(h)).lenkung);
    return out;
  };
  for (const stufe of [2, 0, 4]) {
    await h.ev((w) => import('/js/einstellungen.js').then((E) => E.setze('lenkStufe', w)), stufe);
    const [t1, k1] = [await verlauf('touch', null, punkte.links), await verlauf('taste', 'ArrowLeft')];
    const [t2, k2] = [await verlauf('touch', null, punkte.rechtsWeit), await verlauf('taste', 'ArrowRight')];
    melde(JSON.stringify(t1) === JSON.stringify(k1) && JSON.stringify(t2) === JSON.stringify(k2), `Stufe ${stufe}: D-Pad ← gleich Pfeiltaste ←, Finger weit rechts in der Zone gleich Pfeiltaste → (60 Bilder, nach 10 Bildern ${t2[9].toFixed(3)})`);
  }
  await h.ev(() => import('/js/einstellungen.js').then((E) => E.setze('lenkStufe', 2)));
  await h.zu();
}

// ===================================================================== Teil C: AUTO-GAS
// Rennen mit Countdown starten (Physik angehalten), Countdown von Hand beenden (wie bei GO: rennen 'laeuft', Zustand 'rennen')
const startMitCountdown = (h) => h.ev(() => { const A = window.__alpineRally; A.anhalten = true; A.start(); });
const go = (h) => h.ev(() => { const A = window.__alpineRally; A.rennen.zustand = 'laeuft'; A.rennen.zeit = 0; A.ablauf.wechsle('rennen'); });
const autoGas = (h, an) => h.ev((b) => import('/js/einstellungen.js').then((E) => E.setze('touchAutoGas', b)), an);
const gasJetzt = async (h) => { await h.bild(); const e = await lies(h); return e; };
if (teil('i')) {
  console.log('(i) AUTO-GAS aus: wie bisher');
  const h = await handy(402, 874, { adresse: '?ton=aus', leicht: true });
  const std = await h.ev(() => window.__alpineRally.einstellungen.touchAutoGas);
  await startMitCountdown(h); await go(h);
  const ohne = await gasJetzt(h);
  await h.f.auf(1, await h.mitte('a')); const mitA = await gasJetzt(h); await h.f.ab(1);
  await h.f.auf(1, await h.mitte('b')); const mitB = await gasJetzt(h); await h.f.ab(1);
  const a = await h.ev(() => window.__alpineRally.touch.gezeigt.a);
  melde(std === false && ohne.gas === 0 && mitA.gas === 1 && mitB.gas === 0 && mitB.bremse === 1 && a < 2, `Standard AUS (${std}): ohne Finger Gas ${ohne.gas}, A ${mitA.gas}, B Gas ${mitB.gas} / Bremse ${mitB.bremse}, A ohne "AUTO" (Bild ${a})`);
  await h.zu();
}
if (teil('j')) {
  console.log('(j) AUTO-GAS an');
  const h = await handy(402, 874, { adresse: '?ton=aus', leicht: true });
  await autoGas(h, true);
  await startMitCountdown(h);
  const imCountdown = await gasJetzt(h);
  const z0 = await h.ev(() => window.__alpineRally.ablauf.zustand);
  await go(h);
  const ohne = await gasJetzt(h);
  const bildA = await h.ev(() => window.__alpineRally.touch.gezeigt.a);
  await h.f.auf(1, await h.mitte('b')); const mitB = await gasJetzt(h); await h.f.ab(1);
  await h.f.auf(1, await h.mitte('r')); const mitR = await gasJetzt(h);
  await h.f.auf(2, await h.dpadPunkt(270)); const mitRLinks = await gasJetzt(h); await h.f.ab(2); await h.f.ab(1);
  await h.f.auf(1, await h.mitte('a')); const mitA = await gasJetzt(h); await h.f.ab(1);
  await h.f.auf(1, await h.dpadPunkt(180)); const mitUnten = await gasJetzt(h); await h.f.ab(1);
  const nachher = await gasJetzt(h);
  melde(z0 === 'countdown' && imCountdown.gas === 0, `Countdown: Gas ${imCountdown.gas}`);
  melde(ohne.gas === 1 && ohne.bremse === 0, `nach GO ohne Finger: Gas ${ohne.gas}`);
  melde(mitB.gas === 0 && mitB.bremse === 1, `B gedrückt: Gas ${mitB.gas}, Bremse ${mitB.bremse} (bremst / rückwärts wie bisher)`);
  melde(mitR.gas === 1 && mitR.handbremse && mitRLinks.gas === 1 && mitRLinks.handbremse && mitRLinks.lenkung < 0, `R (Handbremse): Gas bleibt ${mitR.gas}; R + ←: Gas ${mitRLinks.gas}, Lenkung ${mitRLinks.lenkung.toFixed(2)} (driften)`);
  melde(mitA.gas === 1 && mitUnten.gas === 0 && mitUnten.bremse === 1 && nachher.gas === 1, `A ändert nichts (Gas ${mitA.gas}); D-Pad ↓ bremst ohne Gas (${mitUnten.gas}/${mitUnten.bremse}); danach wieder Gas ${nachher.gas}`);
  melde(bildA === 2, `A zeigt "AUTO" im Rennen (Bild ${bildA})`);
  // Pause, Ziel, Menü: kein Gas (Pause: die Spielschleife fragt nicht ab, autoGas ist aus)
  await h.ev(() => window.__alpineRally.pausieren()); await h.bild();
  const pause = await h.ev(() => ({ auto: window.__alpineRally.touch.eingabe.autoGas, a: window.__alpineRally.touch.gezeigt.a }));
  const pauseE = await lies(h);
  await h.ev(() => window.__alpineRally.weiter()); await h.bild();
  await h.ev(() => { const A = window.__alpineRally; A.rennen.zustand = 'ziel'; A.rennen.endZeit = 160; }); const ziel = await gasJetzt(h);
  await h.ev(() => { const A = window.__alpineRally; A.ablauf.wechsle('ziel'); }); await h.bild();
  const zielSchirm = await h.ev(() => window.__alpineRally.touch.eingabe.autoGas);
  await h.ev(() => { const A = window.__alpineRally; A.zumMenue(); }); await h.bild();
  const menue = await h.ev(() => ({ auto: window.__alpineRally.touch.eingabe.autoGas, a: window.__alpineRally.touch.gezeigt.a, z: window.__alpineRally.ablauf.zustand }));
  melde(!pause.auto && pauseE.gas === 0 && pause.a < 2 && ziel.gas === 0 && !zielSchirm && !menue.auto && menue.a < 2,
    `Pause: Gas ${pauseE.gas} (A ohne AUTO), Ziel überfahren: Gas ${ziel.gas}, Zielbildschirm aus, ${menue.z}: aus (A ohne AUTO)`);
  // Tastatur mischt weiter ein: Pfeil runter mit AUTO-GAS = Bremse (Touch-Gas bleibt, wie zwei Quellen bisher)
  await startMitCountdown(h); await go(h);
  await h.page.keyboard.down('ArrowDown'); const taste = await gasJetzt(h); await h.page.keyboard.up('ArrowDown');
  melde(taste.bremse === 1, `Tastatur ↓ während AUTO-GAS: Bremse ${taste.bremse}, Gas ${taste.gas} (Quellen mischen wie bisher)`);
  await h.zu();
}
if (teil('k')) {
  console.log('(k) AUTO-GAS bleibt nach Neuladen, Eintrag nur im Touch-Modus');
  const h = await handy(402, 874, { adresse: '?ton=aus', leicht: true });
  await autoGas(h, true);
  await h.page.reload();
  await h.page.waitForFunction(() => window.__alpineRally && window.__alpineRally.touch, null, { timeout: 120000 });
  const r = await h.ev(() => { const A = window.__alpineRally; const l = A.seiten.einstellungen.eintraege; const e = l.find((x) => x.text === 'einst.autoGas'); return { wert: A.einstellungen.touchAutoGas, da: !!e, lesen: e && e.lesen(), nach: l[l.indexOf(e) - 1] && l[l.indexOf(e) - 1].text, speicher: JSON.parse(localStorage.getItem('alpineRally.einstellungen')).touchAutoGas }; });
  melde(r.wert === true && r.speicher === true && r.da && r.lesen === true && r.nach === 'einst.touch', `nach Neuladen: AUTO-GAS ${r.wert ? 'AN' : 'AUS'} (gespeichert ${r.speicher}), Eintrag nach ${r.nach}`);
  // Unsinn im Speicher = AUS
  await h.ev(() => { const d = JSON.parse(localStorage.getItem('alpineRally.einstellungen')); d.touchAutoGas = 'ja'; localStorage.setItem('alpineRally.einstellungen', JSON.stringify(d)); });
  await h.page.reload();
  await h.page.waitForFunction(() => window.__alpineRally && window.__alpineRally.touch, null, { timeout: 120000 });
  const u = await h.ev(() => window.__alpineRally.einstellungen.touchAutoGas);
  melde(u === false, `gespeicherter Unsinn ("ja"): AUTO-GAS ${u}`);
  await h.zu();
  const d = await handy(640, 360, { geraet: {}, adresse: '?ton=aus', leicht: true });
  const dd = await d.ev(() => ({ an: window.__alpineRally.touch.an, da: window.__alpineRally.seiten.einstellungen.eintraege.some((x) => x.text === 'einst.autoGas') }));
  melde(!dd.an && !dd.da, `Desktop ohne Touch: kein Eintrag AUTO-GAS (${dd.da})`);
  await d.zu();
}

// ===================================================================== Teil D: Haptik
// Zähler statt Vibration: navigator.vibrate wird vor dem Laden ersetzt (Chromium hat es, vibriert aber nicht)
const VIB_ZAEHLER = () => { window.__vib = []; Navigator.prototype.vibrate = function (m) { window.__vib.push(JSON.stringify(m)); return true; }; };
const OHNE_VIB = () => { delete Navigator.prototype.vibrate; };
const IPHONE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
const hz = (h) => h.ev(async () => { const H = await import('/js/haptik.js'); return { ...H.haptikZaehler, vib: window.__vib ? [...window.__vib] : null, weg: H.haptikMoeglich() ? 'vibrate' : 'keiner', schalter: 0, elemente: document.getElementsByTagName('*').length, labels: document.querySelectorAll('#haptik').length }; });
const setzeHaptik = (h, w) => h.ev((w) => import('/js/einstellungen.js').then((E) => E.setze('haptik', w)), w);
// im Rennen (Physik angehalten): drei Knöpfe nacheinander, dann Aufprall leicht (Wucht 2 von 14: 20 + 40 · 2/14 = 26 ms), hart, Gangwechsel, Checkpoint
async function haptikRunde(h) {
  await h.ev(() => { const A = window.__alpineRally; A.anhalten = true; A.start({ countdown: false }); A.rennen.zustand = 'laeuft'; window.__vib = []; });
  await h.bild();
  const v0 = (await hz(h)).vibrate;
  for (const k of ['a', 'b', 'r']) { await h.f.tippe(await h.mitte(k)); await warte(80); }
  await h.bild();
  const nachKnoepfen = (await hz(h)).vib.slice();
  await h.ev(() => { window.__alpineRally.tonInfo.wucht = 2; }); await h.bild(); await warte(150);
  await h.ev(() => { window.__alpineRally.tonInfo.wucht = 20; }); await h.bild(); await warte(150);
  await h.ev(() => { window.__alpineRally.getriebe.schaltet = true; }); await h.bild();
  await h.ev(() => { window.__alpineRally.getriebe.schaltet = false; }); await h.bild(); await warte(150);
  // Checkpoint über den echten Weg (physikSchritt fährt durchs erste Tor)
  const cp = await h.ev(() => {
    const A = window.__alpineRally, cpS = A.checkpoints[0].s;
    A.setzeAuf(cpS - 2); A.rennen.zustand = 'laeuft'; A.rennen.naechsterCp = 0;
    const e = { gas: 1, bremse: 0, lenkung: 0, handbremse: false, reset: false, debug: false, notes: false, pause: false, hud: false };
    for (let i = 0; i < 1200 && A.rennen.naechsterCp === 0; i++) A.physikSchritt(A.SCHRITT, e);
    return A.rennen.naechsterCp;
  });
  await h.bild();
  const alle = (await hz(h)).vib;
  return { nachKnoepfen, spiel: alle.slice(nachKnoepfen.length), cp, v0 };
}
if (teil('m')) {
  console.log('(m) HAPTIK aus / nur Knöpfe / voll (Zähler an navigator.vibrate)');
  for (const [w, sollKnopf, sollSpiel] of [['aus', [], []], ['knoepfe', ['10', '10', '10'], []], ['voll', ['10', '10', '10'], ['26', '60', '12', '[15,30,15]']]]) {
    const h = await rennenHandy(402, 874, '?menue=aus&ton=aus', { vorher: VIB_ZAEHLER });
    await setzeHaptik(h, w);
    const r = await haptikRunde(h);
    melde(JSON.stringify(r.nachKnoepfen) === JSON.stringify(sollKnopf) && JSON.stringify(r.spiel) === JSON.stringify(sollSpiel) && r.cp === 1,
      `HAPTIK ${w}: Knöpfe A, B, R -> [${r.nachKnoepfen.join(', ')}], Aufprall leicht/hart, Gang, Checkpoint -> [${r.spiel.join(', ')}] (Soll [${sollKnopf.join(', ')}] / [${sollSpiel.join(', ')}])`);
    await h.zu();
  }
  // Standard voll, Knopf im Menü (Down), Loslassen tickt nicht; HAPTIK TESTEN
  const h = await handy(402, 874, { adresse: '?ton=aus', leicht: true, vorher: VIB_ZAEHLER });
  const std = await h.ev(() => window.__alpineRally.einstellungen.haptik);
  await h.ev(() => { const A = window.__alpineRally; A.zumMenue(); A.menue.zeige(A.seiten.haupt, true); window.__vib = []; });
  await h.bild();
  await h.f.auf(1, await h.dpadPunkt(180)); await h.bild(); const beimDruck = (await hz(h)).vib.length;
  await warte(100); await h.f.ab(1); await h.bild(); const nachLos = (await hz(h)).vib.length;
  const t = await h.ev(() => {
    const A = window.__alpineRally; window.__meldung = [];
    const alt = A.menue.zeigeMeldung; A.menue.zeigeMeldung = (tx, f) => { window.__meldung.push(tx); return alt(tx, f); };
    A.menue.oeffne(A.seiten.einstellungen, true);
    const l = A.seiten.einstellungen.eintraege;
    const e = l.find((x) => x.text === 'einst.haptikTesten'), hp = l.find((x) => x.text === 'einst.haptik');
    window.__vib = [];
    e.aktion();
    return { meldung: window.__meldung.slice(), vib: window.__vib.slice(), da: !!hp, optionen: hp.optionen().map((o) => o.wert), nach: l[l.indexOf(hp) - 1].text };
  });
  melde(std === 'voll' && beimDruck === 1 && nachLos === 1, `Standard ${std}; Menü: D-Pad gedrückt = ${beimDruck} Tick, beim Loslassen keiner (${nachLos})`);
  melde(t.da && t.optionen.join() === 'aus,knoepfe,voll' && t.nach === 'einst.autoGas' && t.vib.length === 1 && t.meldung[0] === 'VIBRATION GESENDET', `EINSTELLUNGEN: HAPTIK (${t.optionen.join(' / ')}) nach AUTO-GAS; HAPTIK TESTEN -> ${t.vib.length} Aufruf, Meldung "${t.meldung[0]}"`);
  await h.zu();
}
if (teil('n')) {
  console.log('(n) Rate-Limit');
  const h = await rennenHandy(402, 874, '?menue=aus&ton=aus', { vorher: VIB_ZAEHLER });
  await h.ev(() => { const A = window.__alpineRally; A.anhalten = true; A.start({ countdown: false }); A.rennen.zustand = 'laeuft'; window.__vib = []; });
  await h.bild();
  // zwei Finger gleichzeitig (A und B innert weniger Millisekunden): ein Tick
  const z0 = await hz(h);
  await h.f.auf(1, await h.mitte('a')); await h.f.auf(2, await h.mitte('b')); await h.bild();
  const z1 = await hz(h);
  await h.f.ab(1); await h.f.ab(2); await warte(60);
  await h.f.tippe(await h.mitte('a')); await h.bild();
  const z2 = await hz(h);
  melde(z1.vib.length === 1 && z1.unterdrueckt === z0.unterdrueckt + 1 && z2.vib.length === 2, `A und B gleichzeitig: ${z1.vib.length} Tick (1 unterdrückt), 60 ms später wieder einer (${z2.vib.length})`);
  // Spielereignisse: Aufprall in drei Bildern hintereinander (Schleifen an der Leitplanke) + Gangwechsel gleich danach
  await warte(200);
  const vor = (await hz(h)).vib.length;
  const r = await h.ev(async () => {
    const A = window.__alpineRally; const b = () => new Promise((r) => requestAnimationFrame(r));
    const t0 = performance.now();
    for (let i = 0; i < 3; i++) { A.tonInfo.wucht = 10; await b(); }
    A.getriebe.schaltet = true; await b(); A.getriebe.schaltet = false; await b();
    return performance.now() - t0;
  });
  const nach = (await hz(h)).vib.length;
  melde(nach - vor === 1 || (r > 120 && nach - vor <= Math.ceil(r / 120)), `Aufprall in 3 Bildern + Gangwechsel (${r.toFixed(0)} ms): ${nach - vor} Ausgabe(n) (höchstens 1 je 120 ms)`);
  await h.zu();
}
if (teil('o')) {
  console.log('(o) ohne navigator.vibrate: iPhone-Schalter, sonst nichts');
  // M9a.2: kein iPhone-Schalter mehr, ohne navigator.vibrate passiert überall nichts
  for (const [name, geraet, weg] of [['iPhone (nachgestellt)', { ...HANDY, userAgent: IPHONE_UA }, 'keiner'], ['anderes Gerät ohne Vibration', HANDY, 'keiner']]) {
    const h = await rennenHandy(402, 874, '?menue=aus&ton=aus', { geraet, vorher: OHNE_VIB });
    await h.ev(() => { const A = window.__alpineRally; A.anhalten = true; A.start({ countdown: false }); A.rennen.zustand = 'laeuft'; });
    await h.bild();
    const z0 = await hz(h);
    await h.f.tippe(await h.mitte('a')); await warte(80); await h.bild();
    const z1 = await hz(h);
    for (const k of ['b', 'r', 'a']) { await h.f.tippe(await h.mitte(k)); await warte(80); }
    await h.ev(() => { window.__alpineRally.tonInfo.wucht = 20; }); await h.bild();
    const z2 = await hz(h);
    const input = await h.ev(() => { const l = document.getElementById('haptik'); const i = l && l.querySelector('input'); return i ? { typ: i.type, switch: i.hasAttribute('switch'), display: l.style.display } : null; });
    const fehler = h.s.fehler.length;
    if (weg === 'schalter') melde(z0.weg === 'schalter' && z2.schalter === 5 && z2.vibrate === 0 && z2.elemente === z1.elemente && z2.labels === 1 && input && input.typ === 'checkbox' && input.switch && z1.elemente === z0.elemente + 2 && fehler === 0,
      `${name}: Weg ${z0.weg}, 4 Knöpfe + Aufprall = ${z2.schalter} Klicks am Schalter (${z2.labels} Schalter im DOM), Elemente ${z0.elemente} -> ${z1.elemente} (einmal Label + Schalter) -> ${z2.elemente}, <input ${input && input.typ} switch=${input && input.switch}> ${input && input.display}, ${fehler} Fehler`);
    else melde(z0.weg === 'keiner' && z2.schalter === 0 && z2.vibrate === 0 && z2.elemente === z0.elemente && fehler === 0, `${name}: Weg ${z0.weg}, nichts ausgegeben, keine neuen Elemente, ${fehler} Fehler`);
    await h.zu();
  }
}
if (teil('p')) {
  console.log('(p) Desktop ohne Touch: keine Haptik');
  const h = await rennenHandy(640, 360, '?menue=aus&ton=aus', { geraet: {}, vorher: VIB_ZAEHLER });
  await h.ev(() => { const A = window.__alpineRally; A.anhalten = true; A.start({ countdown: false }); A.rennen.zustand = 'laeuft'; window.__vib = []; });
  for (const k of ['ArrowUp', 'Space', 'ArrowLeft']) { await h.page.keyboard.down(k); await warte(50); await h.page.keyboard.up(k); }
  await h.page.mouse.click(320, 180);
  await h.ev(() => { window.__alpineRally.tonInfo.wucht = 20; }); await h.bild(); await warte(150);
  await h.ev(() => { window.__alpineRally.getriebe.schaltet = true; }); await h.bild();
  await h.ev(() => { window.__alpineRally.getriebe.schaltet = false; }); await h.bild();
  const z = await hz(h);
  const an = await h.ev(() => window.__alpineRally.touch.an);
  melde(!an && z.vib.length === 0 && z.schalter === 0 && z.labels === 0, `Desktop (Touch ${an ? 'an' : 'aus'}): Tasten, Maus, Aufprall, Gangwechsel -> ${z.vib.length} Aufrufe von navigator.vibrate, ${z.schalter} Schalter`);
  await h.zu();
}

// ===================================================================== (d) Desktop unverändert gegen 0.9a
async function desktopAbdruck(wurzel) {
  const erg = { buehne: {}, seiten: {}, hud: null, ganz: null };
  const s = await starteSpiel({ wurzel, breite: 640, hoehe: 360 });
  for (const [W, H] of [[640, 360], [1280, 720], [1000, 700], [800, 900], [1920, 1080], [500, 1000], [1366, 768]]) {
    if (erg.geladen) await s.page.evaluate(() => { window.__resize = 0; window.addEventListener('resize', () => { window.__resize++; }); });
    await s.page.setViewportSize({ width: W, height: H });
    if (erg.geladen) await s.page.waitForFunction(() => window.__resize > 0, null, { timeout: 30000 }).catch(() => {});
    if (!erg.geladen) { await s.page.goto(`${s.url}/index.html`); await s.page.waitForFunction(() => window.__alpineRally, null, { timeout: 120000 }); erg.geladen = true; }
    const lage = () => s.page.evaluate(() => { const b = document.getElementById('buehne').getBoundingClientRect(); return `${b.left},${b.top},${b.width},${b.height},${window.innerWidth}`; });
    let vorher = '';
    for (let i = 0; i < 50; i++) { await warte(200); const l = await lage(); if (l === vorher && l.endsWith(`,${W}`)) break; vorher = l; }
    erg.buehne[`${W}x${H}`] = vorher;
  }
  await s.page.setViewportSize({ width: 640, height: 360 });
  const bestzeiten = { passstrasse: { rt4: [{ zeit: 151.23, cps: [30, 80, 120], datum: '2026-10-01T10:00:00.000Z', auto: 'rt4', aufpralle: 1, resets: 0, hoechstTempo: 50 }] } };
  erg.seiten = await s.page.evaluate(async (bz) => {
    localStorage.setItem('alpineRally.bestzeiten2', JSON.stringify(bz));
    const A = window.__alpineRally;
    const c = document.createElement('canvas'); c.width = 320; c.height = 180;
    const x = c.getContext('2d');
    const out = {};
    // (EINSTELLUNGEN dazu: am Desktop ohne Touch dürfen AUTO-GAS und HAPTIK nicht erscheinen)
    for (const n of ['titel', 'haupt', 'auto', 'etappe', 'bestzeiten', 'symbole', 'credits', 'pause', 'frage', 'tasten', 'einstellungen', 'steuerung']) {
      if (!A.seiten[n]) continue;
      A.menue.zeige(A.seiten[n], true);
      const set = new Set(); const bilder = [];
      for (let i = 0; i < 25; i++) {
        await new Promise((r) => setTimeout(r, 60));
        x.clearRect(0, 0, 320, 180); A.menue.zeichne(x, 0, 1);
        const d = x.getImageData(0, 0, 320, 180).data;
        let h = 7, deckend = 0; for (let i = 0; i < d.length; i++) { h = (h * 31 + d[i] * (i % 7 + 1)) % 1000000007; if (i % 4 === 3 && d[i]) deckend++; }
        if (!set.has(h)) { set.add(h); bilder.push({ h, deckend, d: Array.from(d).join(',') }); }
      }
      out[n] = bilder.sort((a, b) => a.deckend - b.deckend);
    }
    A.menue.zeige(A.seiten.titel, true);
    return out;
  }, bestzeiten);
  await s.page.goto(`${s.url}/index.html?menue=aus`);
  await s.page.waitForFunction(() => window.__alpineRally, null, { timeout: 120000 });
  await s.page.evaluate(() => { window.__alpineRally.anhalten = true; });
  await warte(800);
  erg.hud = await s.page.evaluate(() => {
    const c = document.getElementById('hud'), d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
    let h = 7; for (let i = 0; i < d.length; i++) h = (h * 31 + d[i] * (i % 7 + 1)) % 1000000007;
    return h;
  });
  erg.touch = await s.page.evaluate(() => ({ an: window.__alpineRally.touch.an, knoepfe: document.querySelectorAll('#touch canvas').length }));
  erg.ganz = hash(await s.page.screenshot());
  await s.schliessen();
  return erg;
}
if (teil('d')) {
  console.log('(d) Desktop ohne Touch pixelgleich gegen 0.9a');
  if (!ALT) info('nur mit --alt <ordner 0.9a> (git worktree add <ordner> 12de5b8)');
  else {
    const [a, b] = [await desktopAbdruck(ALT), await desktopAbdruck(WURZEL)];
    const lage = Object.keys(a.buehne).filter((k) => a.buehne[k] !== b.buehne[k]);
    melde(lage.length === 0, `Lage und Grösse der Bühne in ${Object.keys(a.buehne).length} Fenstergrössen wie 0.9a${lage.length ? `; anders: ${lage.join(', ')}` : ''}`);
    const VERSION_SEITEN = ['titel', 'credits']; // zeigen die Versionsnummer (0.9A -> 0.9A.1)
    for (const n of Object.keys(a.seiten)) {
      const A = a.seiten[n], Bn = b.seiten[n];
      const gleich = A.length === Bn.length && A.every((x, i) => x.h === Bn[i].h);
      if (gleich || !VERSION_SEITEN.includes(n)) { melde(gleich, `Menüseite ${n}: pixelgleich wie 0.9a (${Bn.length} Bild${Bn.length > 1 ? 'er (Blinken)' : ''})`); continue; }
      let box = null;
      const ok = A.length === Bn.length && A.every((x, i) => {
        const p = x.d.split(',').map(Number), q = Bn[i].d.split(',').map(Number);
        for (let k = 0; k < p.length; k++) if (p[k] !== q[k]) { const px = (k >> 2) % 320, py = Math.floor((k >> 2) / 320); box = box ? [Math.min(box[0], px), Math.min(box[1], py), Math.max(box[2], px), Math.max(box[3], py)] : [px, py, px, py]; }
        return true;
      }) && box && box[3] - box[1] <= 8;
      melde(ok, `Menüseite ${n}: wie 0.9a bis auf die Versionszeile (anders nur in x ${box ? box[0] : '-'}..${box ? box[2] : '-'}, y ${box ? box[1] : '-'}..${box ? box[3] : '-'})`);
    }
    melde(a.hud === b.hud, 'HUD vor dem Start (Hilfezeilen, Zeit, Tacho, Minimap) pixelgleich wie 0.9a');
    melde(a.ganz === b.ganz, `ganzes Bild vor dem Start (Bildschirmfoto 640x360) gleich wie 0.9a (${a.ganz} / ${b.ganz})`);
    melde(!b.touch.an && b.touch.knoepfe === 0, `Desktop: Touch aus, ${b.touch.knoepfe} Knöpfe gebaut`);
  }
}

// ===================================================================== (r) Texte
if (teil('r')) {
  console.log('(r) neue Texte de/en in der Pixelschrift');
  const h = await handy(402, 874, { leicht: true });
  const r = await h.ev(async () => {
    const T = await import('/js/texte.js'), P = await import('/js/pixel.js');
    const neu = ['hud.touchHandbremse', 'einst.autoGas', 'einst.autoGasHinweis', 'einst.haptik', 'einst.haptikHinweis', 'wert.knoepfe', 'wert.voll',
      'einst.haptikTesten', 'einst.haptikTestenHinweis', 'haptik.vibrate', 'haptik.aus', 'touch.auto'];
    const zeichen = new Set(P.SCHRIFT_ZEICHEN), fehlt = []; let breitest = 0;
    for (const k of neu) for (const sp of ['de', 'en']) {
      const tx = T.TEXTE[k] && T.TEXTE[k][sp];
      if (!tx) { fehlt.push(`${k}.${sp} leer`); continue; }
      if (tx !== tx.toUpperCase()) fehlt.push(`${k}.${sp} nicht gross`);
      for (const z of tx) if (!zeichen.has(z)) fehlt.push(`${k}.${sp}: "${z}"`);
      breitest = Math.max(breitest, P.textBreite(tx));
    }
    return { n: neu.length, fehlt, breitest, auto: T.TEXTE['touch.auto'] };
  });
  melde(r.fehlt.length === 0 && r.breitest <= 298 && /^[AUTO]+$/.test(r.auto.de + r.auto.en), `${r.n} neue/geänderte Texte de + en: Grossbuchstaben, alle Zeichen in der Pixelschrift, längster ${r.breitest} Pixel, "AUTO" nur aus Zeichen der Mini-Schrift${r.fehlt.length ? ` – ${r.fehlt.slice(0, 6).join(', ')}` : ''}`);
  await h.zu();
}

// ===================================================================== (u) Unveränderlich gegen 0.9a, (v) Tests von M9a
if (teil('u')) {
  console.log('(u) Unveränderlich gegen 0.9a');
  if (!ALT) info('nur mit --alt <ordner 0.9a> (git worktree add <ordner> 12de5b8)');
  else {
    const dateien = ['js/audio.js', 'js/umgebung.js', 'js/musik.js', 'js/musikstueck.js', 'js/tonfahrt.js', 'js/physics.js', 'js/getriebe.js', 'js/fahrprofil.js',
      'js/autos.js', 'js/car.js', 'js/track.js', 'js/netz.js', 'js/tacho.js', 'js/vergleich.js', 'js/garage.js', 'js/bestzeiten.js', 'js/hud.js', 'js/menue.js',
      'js/pacenotes-tempo.js', 'js/abkuerzungen.js', 'tools/schneiden-zeiten.json', 'index.html', 'css/style.css', 'manifest.webmanifest'];
    const geaendert = dateien.filter((d) => spawnSync('git', ['diff', '--quiet', '12de5b8', '--', d], { cwd: WURZEL }).status !== 0);
    melde(geaendert.length === 0, `${dateien.length} Dateien (Ton, Physik, Getriebe, Autos, Strecke, Tacho, HUD, Menü-Baustein, Bestzeiten, Seite, Manifest …) unverändert seit 0.9a${geaendert.length ? `; geändert: ${geaendert.join(', ')}` : ''}`);
    // config.js: entfernt/geändert nur Version und Zeilen im Block touch
    const diff = spawnSync('git', ['diff', '-U0', '12de5b8', '--', 'js/config.js'], { cwd: WURZEL, encoding: 'utf8' }).stdout;
    const entfernt = diff.split('\n').filter((z) => z.startsWith('-') && !z.startsWith('---'));
    const fremd = entfernt.filter((z) => !/VERSION|schulter|klein|schriftGroesse|dpadDiagonal|farbeSchrift|bildLuecke|^-\s+\},?$/.test(z));
    melde(fremd.length === 0, `js/config.js: ausser Version nur der Block touch geändert (${entfernt.length} Zeilen ersetzt), neu: haptik, touchAutoGas, haptik-Standard${fremd.length ? `; fremd: ${fremd.slice(0, 3).join(' | ')}` : ''}`);
    const args = ['--nur', 'a,h,i', '--alt', ALT, ...(process.argv.includes('--lang') ? ['--lang'] : [])];
    const geaenderteDateien = () => new Set(spawnSync('git', ['diff', '--name-only'], { cwd: WURZEL, encoding: 'utf8' }).stdout.split('\n').filter(Boolean));
    const vorher = geaenderteDateien();
    const r = werkzeug('m8g-test.mjs', args);
    fs.writeFileSync(path.join(LOG, 'm8g-test.log'), r.text);
    const z = r.text.split('\n').filter((x) => /^\s*(ok|FEHLER)\s/.test(x));
    for (const x of z) melde(/^\s*ok/.test(x), `m8g-test: ${x.replace(/^\s*(ok|FEHLER)\s+/, '').replace(/0\.8f/g, '0.9a (--alt)').replace(/Bildzeit im Spiel 0\.8g/, 'Bildzeit im Spiel 0.9a.1')}`);
    melde(z.length > 0, `m8g-test ${args.join(' ')} ausgeführt (${z.length} Prüfungen, Ausgabe ${LOG}/m8g-test.log)`);
    if (process.argv.includes('--lang')) {
      const m = werkzeug('m8h-test.mjs', []);
      fs.writeFileSync(path.join(LOG, 'm8h-test.log'), m.text);
      const zm = m.text.split('\n').filter((x) => /^\s*(ok|FEHLER)\s/.test(x));
      melde(m.code === 0, `m8h-test (ohne --alt): ${zm.filter((x) => /^\s*ok/.test(x)).length} ok, ${zm.filter((x) => /FEHLER/.test(x)).length} rot${m.code ? ` – ${zm.filter((x) => /FEHLER/.test(x)).slice(0, 3).map((x) => x.trim().slice(0, 140)).join(' | ')}` : ''}`);
    }
    const lz = werkzeug('ladezeit.mjs', [ALT, '9']);
    fs.writeFileSync(path.join(LOG, 'ladezeit.log'), lz.text);
    const med = (n) => +((new RegExp(`${n} .*Median (\\d+)`).exec(lz.text) || [])[1]);
    melde(med('neu') - med('alt') <= 30, `Ladezeit (Median aus 9): 0.9a ${med('alt')} ms, 0.9a.1 ${med('neu')} ms (${med('neu') - med('alt') >= 0 ? '+' : ''}${med('neu') - med('alt')} ms, höchstens +30; Streuung ca. ±100)`);
    const neuGeaendert = [...geaenderteDateien()].filter((d) => !vorher.has(d) && /^(screenshots|tools)\//.test(d));
    if (neuGeaendert.length) spawnSync('git', ['checkout', '--', ...neuGeaendert], { cwd: WURZEL });
    info(`von den alten Tests geänderte Messdateien zurückgesetzt: ${neuGeaendert.length}`);
  }
}
if (teil('v')) {
  console.log('(v) Tests von M9a (Touch-Teile, ohne den Vergleich gegen 0.8h)');
  const r = werkzeug('m9a-test.mjs', ['--nur', 'a,b,c,d,e,f,g,h,i,j,k,m,n']);
  fs.writeFileSync(path.join(LOG, 'm9a-test.log'), r.text);
  const z = r.text.split('\n').filter((x) => /^\s*(ok|FEHLER)\s/.test(x));
  const rot = z.filter((x) => /FEHLER/.test(x));
  melde(r.code === 0 && z.length > 50, `m9a-test --nur a-k,m,n: ${z.length - rot.length} ok, ${rot.length} rot${rot.length ? ` – ${rot.slice(0, 3).map((x) => x.trim().slice(0, 160)).join(' | ')}` : ''}`);
}

console.log(fehler ? `\n${fehler} FEHLER` : '\nalles ok');
process.exit(fehler ? 1 : 0);
