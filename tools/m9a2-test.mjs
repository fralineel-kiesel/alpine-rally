// Meilenstein 9a.2 prüfen:  node tools/m9a2-test.mjs [--nur a,b,c,...] [--alt <ordner 0.9a.1>] [--lang]
// (0.9a.1: git worktree add <ordner> 4a265b2). Alles läuft in Chromium (Playwright) mit Touch-Emulation (hasTouch,
// isMobile); Mehrfinger über CDP Input.dispatchTouchEvent. Kein echtes Handy, kein Safari, keine echte Vibration.
//   Teil A – R in der Ecke, Haptik nur Android:
//   (a) Knopf-Aktionen (R = Handbremse, L = zurück auf die Strasse) und Menü (L = bisheriges R, R tut nichts)
//   (b) Layout in allen Fenstergrössen: nichts überlappt, Treffer, Rand, 16:9, R und L oben in den Ecken; gegen 0.9a.1
//   (c) Haptik mit navigator.vibrate wie in M9a.1; ohne: Einträge verborgen, 0 Aufrufe, keine DOM-Elemente, kein Fehler
//   (d) Desktop ohne Touch pixelgleich gegen 0.9a.1
//   Teil B – KNOPFGRÖSSE und LAYOUT:
//   (e) 3 Grössen x 2 Layouts x alle Fenstergrössen; (f) GESPIEGELT: jede Aktion auf dem gespiegelten Knopf, Multi-Touch;
//   (g) D-Pad-Zonen gespiegelt und bei jeder Grösse; (h) Einstellungen bleiben nach Neuladen; (i) Standard = 0.9a.1
//   Teil C – HUD-GRÖSSE:
//   (j) MITTEL pixelgleich zu 0.9a.1; (k) KLEIN/GROSS: HUD-Teile überlappen nicht und liegen im Bild; (l) Neuladen,
//   Pause, Live-Demo; (m) Texte de/en in der Pixelschrift
//   Teil D – Unveränderlich:
//   (u) Quelltext Fahren/Ton/Autos seit 0.9a.1 gleich; über m8g-test: Tacho, Fahrmessung, Autos, Testfahrer, Ton,
//       Abkürzungen, Strecke, Bildzeit; Ladezeit; mit --lang alle bisherigen Tests
//   (v) die Tests von M9a und M9a.1 (Erwartungen an R und Haptik nachgezogen)

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
const LOG = '/tmp/m9a2';
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
  if (speicher) await s.page.addInitScript((sp) => { if (!sessionStorage.getItem('m9a2')) { localStorage.clear(); for (const [k, v] of Object.entries(sp)) localStorage.setItem(k, v); sessionStorage.setItem('m9a2', '1'); } }, speicher);
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
  console.log('(a) Knopf-Aktionen (Belegung wie M9a.1: R = Handbremse, L = zurück auf die Strasse; R jetzt in der Ecke)');
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

if (teil('a')) {
  console.log('(a) Menü: L = bisheriges R, R tut nichts');
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

// ===================================================================== Layout (b) (e) (i)
const GROESSEN = [
  ['iPhone 16 Pro hoch', 402, 874], ['kleines iPhone hoch', 375, 667], ['Pixel/Xiaomi hoch', 412, 915], ['kleines Android hoch', 360, 640],
  ['iPhone 16 Pro quer', 874, 402], ['iPhone quer mit Safari-Leisten', 874, 330], ['Pixel/Xiaomi quer', 915, 412], ['kleines iPhone quer', 667, 375],
  ['kleines Android quer', 640, 360], ['Tablet hoch', 820, 1180], ['Tablet quer', 1180, 820],
];
const SAFE_IPHONE = { hoch: { o: 62, r: 0, u: 34, l: 0 }, quer: { o: 0, r: 62, u: 21, l: 62 } };
const ELEMENTE = ['dpad', 'a', 'b', 'l', 'r', 'select', 'start', 'notes'];
const KLEINE = ['select', 'start', 'notes'];
const NULL_SAFE = { o: 0, r: 0, u: 0, l: 0 };
// Layout waagrecht spiegeln (für die Prüfung von GESPIEGELT: zurückgespiegelt gelten dieselben Regeln wie NORMAL)
const spiegelR = (r, W) => (r ? { ...r, x: W - r.x - r.b, v: r.v ? spiegelR(r.v, W) : undefined, zone: r.zone ? spiegelR(r.zone, W) : undefined } : r);
function spiegelLayout(L, W) {
  const el = {};
  for (const n of Object.keys(L.el)) el[n] = spiegelR(L.el[n], W);
  return { ...L, bild: spiegelR(L.bild, W), flaeche: spiegelR(L.flaeche, W), el };
}
const schneiden = (a, b) => a.x < b.x + b.b - 0.01 && b.x < a.x + a.b - 0.01 && a.y < b.y + b.h - 0.01 && b.y < a.y + a.h - 0.01;
const innen = (a, b) => a.x >= b.x - 0.01 && a.y >= b.y - 0.01 && a.x + a.b <= b.x + b.b + 0.01 && a.y + a.h <= b.y + b.h + 0.01;
// Regeln für ein Layout (gespiegelt: erst zurückspiegeln, Safe-Area links/rechts tauschen); f = Faktor der Knopfgrösse
function pruefeLayout(L0, W, H, safe0, gespiegelt = false, f = 1) {
  const L = gespiegelt ? spiegelLayout(L0, W) : L0;
  const safe = gespiegelt ? { ...safe0, l: safe0.r, r: safe0.l } : safe0;
  const probleme = [];
  const r2 = (r) => `${r.x.toFixed(0)},${r.y.toFixed(0)} ${r.b.toFixed(0)}x${r.h.toFixed(0)}`;
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
    // so gross wie erlaubt: Bild volle Höhe (bzw. bis zur Reihe der kleinen Knöpfe) oder eine Seite bis an die Knöpfe / Mindestzone
    const abstand = (seite) => Math.min(...ELEMENTE.map((n) => L.el[n]).filter((e) => e.y < L.bild.y + L.bild.h && e.y + e.h > L.bild.y)
      .map((e) => (seite < 0 ? (e.x + e.b <= L.bild.x + 0.01 ? L.bild.x - (e.x + e.b) : 1e9) : (e.x >= L.bild.x + L.bild.b - 0.01 ? e.x - (L.bild.x + L.bild.b) : 1e9))));
    const unten = KLEINE.every((n) => L.el[n].y >= L.bild.y + L.bild.h);
    const hoehe = L.bild.h >= H - safe.o - safe.u - (unten ? 12 + L.el.start.h + 8 : 0) - 0.5;
    const seiten = abstand(-1) <= 8.5 || abstand(1) <= 8.5 || Math.min(L.bild.x, W - L.bild.x - L.bild.b) <= 130 * f + 0.5;
    if (!hoehe && !seiten) probleme.push(`Querformat: Bild könnte grösser sein (Abstand links ${abstand(-1).toFixed(1)}, rechts ${abstand(1).toFixed(1)})`);
  }
  // M9a.2: L oben links, R oben rechts in der Ecke (gleiche Höhe, ganz oben in der Spalte, über A/B)
  const R = L.el.r, Lk = L.el.l, A = L.el.a;
  const obenY = (L.flaeche ? L.flaeche.y : safe.o) + 8;
  if (!(Math.abs(Lk.y - obenY) < 0.5 && Math.abs(R.y - obenY) < 0.5 && Math.abs(Lk.x - Math.max(24, safe.l)) < 0.5 && Math.abs(R.x + R.b - (W - Math.max(24, safe.r))) < 0.5 && R.y + R.h <= A.y))
    probleme.push(`L/R nicht in den Ecken (L ${r2(Lk)}, R ${r2(R)})`);
  const xs = ELEMENTE.map((n) => L.el[n]);
  const links = Math.min(...xs.map((e) => e.x)), rechts = W - Math.max(...xs.map((e) => e.x + e.b));
  if (links < Math.max(24, safe.l) - 0.01 || rechts < Math.max(24, safe.r) - 0.01) probleme.push(`Rand ${links.toFixed(0)} / ${rechts.toFixed(0)}`);
  return { probleme, links, rechts };
}
// Layout aller Grössen messen (wurzel: dieser Stand oder 0.9a.1); varianten: Einstellungen, die ohne Neuladen gesetzt werden
// (prüft dabei, dass eine Änderung sofort wirkt: die Seite liegt nach setze() wie berechnet)
async function layouts(wurzel = WURZEL, varianten = [null]) {
  const out = [];
  for (const [name, W, H] of GROESSEN) {
    const h = await handy(W, H, { wurzel, leicht: true });
    for (const v of varianten) {
      if (v) await h.ev((v) => import('/js/einstellungen.js').then((E) => { for (const [k, w] of Object.entries(v)) E.setze(k, w); }), v);
      for (const mitSafe of [false, true]) {
        if (mitSafe && !/iPhone/.test(name)) continue;
        const safe = mitSafe ? SAFE_IPHONE[H > W ? 'hoch' : 'quer'] : NULL_SAFE;
        await h.ev((s) => window.__alpineRally.touch.setzeSafeTest(s), safe);
        await h.bild();
        const L = await h.lay();
        const dom = await h.ev(() => {
          const r = (el) => { const b = el.getBoundingClientRect(); return { x: b.left, y: b.top, b: b.width, h: b.height }; };
          const k = {}; for (const n of ['dpad', 'a', 'b', 'l', 'r', 'select', 'start', 'notes']) k[n] = r(document.querySelector(`.touch-${n}`));
          return { buehne: r(document.getElementById('buehne')), k, sw: document.documentElement.scrollWidth, sh: document.documentElement.scrollHeight };
        });
        out.push({ name: `${name}${mitSafe ? ' + Safe-Area' : ''}`, W, H, safe, v, L, dom });
      }
    }
    await h.zu();
  }
  return out;
}
const nah = (a, b, e = 0.6) => Math.abs(a.x - b.x) < e && Math.abs(a.y - b.y) < e && Math.abs(a.b - b.b) < e && Math.abs(a.h - b.h) < e;
function seiteWieRechnung(L, dom) {
  if (!nah(dom.buehne, L.bild)) return false;
  return ELEMENTE.every((n) => nah(dom.k[n], L.el[n].v));
}
// Unterschiede zu 0.9a.1 (Standardwerte): welche Teile liegen anders (R ist die erwartete Ausnahme)
function unterschiede(L, A) {
  const d = [];
  if (!nah(L.bild, A.bild, 0.01)) d.push('bild');
  for (const n of ELEMENTE) if (!nah(L.el[n], A.el[n], 0.01) || !nah(L.el[n].v, A.el[n].v, 0.01)) d.push(n);
  return d;
}
let layoutNeu = null, layoutAlt = null;
if (teil('b') || teil('i')) layoutNeu = await layouts();
if ((teil('b') || teil('i')) && ALT) layoutAlt = await layouts(ALT);
if (teil('b')) {
  console.log('(b) Layout in allen Fenstergrössen (Standardwerte): R und L in den Ecken');
  if (!ALT) info('Vergleich gegen 0.9a.1 nur mit --alt <ordner 0.9a.1>');
  const tabelle = [];
  for (const [i, { name, W, H, safe, L, dom }] of layoutNeu.entries()) {
    const p = pruefeLayout(L, W, H, safe);
    if (!seiteWieRechnung(L, dom)) p.probleme.push('Seite liegt nicht wie berechnet');
    if (dom.sw > W || dom.sh > H) p.probleme.push(`Seite grösser als das Fenster (${dom.sw}x${dom.sh})`);
    const a = layoutAlt && layoutAlt[i].L;
    const zeile = {
      name, W, H, format: L.format, bild: `${L.bild.b.toFixed(0)}x${L.bild.h.toFixed(0)}`, dpad: Math.round(L.el.dpad.v.b), ab: Math.round(L.el.a.v.b),
      l: `${L.el.l.x.toFixed(0)},${L.el.l.y.toFixed(0)} ${L.el.l.v.b.toFixed(0)}x${L.el.l.v.h.toFixed(0)}`, r: `${L.el.r.x.toFixed(0)},${L.el.r.y.toFixed(0)} ${L.el.r.v.b.toFixed(0)}x${L.el.r.v.h.toFixed(0)}`,
      rAlt: a ? `${a.el.r.x.toFixed(0)},${a.el.r.y.toFixed(0)}` : null, klein: L.klein || 'unten', rand: `${p.links.toFixed(0)}/${p.rechts.toFixed(0)}`,
      anders: a ? unterschiede(L, a) : null,
    };
    tabelle.push(zeile);
    melde(p.probleme.length === 0, `${name} ${W}x${H}: ${L.format}, Bild ${zeile.bild}, L ${zeile.l}, R ${zeile.r}${a ? ` (0.9a.1 ${zeile.rAlt}), anders als 0.9a.1: ${zeile.anders.join(', ') || '–'}` : ''}${p.probleme.length ? ` – ${p.probleme.slice(0, 4).join('; ')}` : ''}`);
  }
  fs.writeFileSync(path.join(LOG, 'layout.json'), JSON.stringify(tabelle, null, 1));
  info(`Tabelle der Fenstergrössen: ${path.join(LOG, 'layout.json')}`);
}


// ===================================================================== Haptik (c)
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

if (teil('c')) {
  console.log('(c) Haptik: mit navigator.vibrate wie in M9a.1, ohne nichts');
  for (const [w, sollKnopf, sollSpiel] of [['aus', [], []], ['knoepfe', ['10', '10', '10'], []], ['voll', ['10', '10', '10'], ['26', '60', '12', '[15,30,15]']]]) {
    const h = await rennenHandy(402, 874, '?menue=aus&ton=aus', { vorher: VIB_ZAEHLER });
    await setzeHaptik(h, w);
    const r = await haptikRunde(h);
    melde(JSON.stringify(r.nachKnoepfen) === JSON.stringify(sollKnopf) && JSON.stringify(r.spiel) === JSON.stringify(sollSpiel) && r.cp === 1,
      `mit vibrate, HAPTIK ${w}: Knöpfe A, B, R -> [${r.nachKnoepfen.join(', ')}], Aufprall leicht/hart, Gang, Checkpoint -> [${r.spiel.join(', ')}]`);
    await h.zu();
  }
  // mit vibrate: Einträge da (nach AUTO-GAS), HAPTIK TESTEN, Knopf im Menü tickt beim Drücken; Rate-Limit zwei Finger
  {
    const h = await handy(402, 874, { adresse: '?ton=aus', leicht: true, vorher: VIB_ZAEHLER });
    await h.ev(() => { const A = window.__alpineRally; A.zumMenue(); A.menue.zeige(A.seiten.haupt, true); window.__vib = []; });
    await h.bild();
    await h.f.auf(1, await h.dpadPunkt(180)); await h.bild(); const beimDruck = (await hz(h)).vib.length;
    await warte(100); await h.f.ab(1); await h.bild(); const nachLos = (await hz(h)).vib.length;
    const t = await h.ev(() => {
      const A = window.__alpineRally; window.__meldung = [];
      const alt = A.menue.zeigeMeldung; A.menue.zeigeMeldung = (tx, f) => { window.__meldung.push(tx); return alt(tx, f); };
      const l = A.seiten.einstellungen.eintraege;
      const e = l.find((x) => x.text === 'einst.haptikTesten'), hp = l.find((x) => x.text === 'einst.haptik');
      window.__vib = [];
      e.aktion();
      return { meldung: window.__meldung.slice(), vib: window.__vib.slice(), optionen: hp.optionen().map((o) => o.wert), nach: l[l.indexOf(hp) - 1].text };
    });
    melde(beimDruck === 1 && nachLos === 1 && t.optionen.join() === 'aus,knoepfe,voll' && t.nach === 'einst.autoGas' && t.vib.length === 1 && t.meldung[0] === 'VIBRATION GESENDET',
      `mit vibrate: Menü-Knopf ${beimDruck} Tick beim Drücken (${nachLos - beimDruck} beim Loslassen); EINSTELLUNGEN: HAPTIK (${t.optionen.join(' / ')}) nach AUTO-GAS, HAPTIK TESTEN -> ${t.vib.length} Aufruf, "${t.meldung[0]}"`);
    await h.zu();
    const n = await rennenHandy(402, 874, '?menue=aus&ton=aus', { vorher: VIB_ZAEHLER });
    await n.ev(() => { const A = window.__alpineRally; A.anhalten = true; A.start({ countdown: false }); A.rennen.zustand = 'laeuft'; window.__vib = []; });
    await n.bild();
    await n.f.auf(1, await n.mitte('a')); await n.f.auf(2, await n.mitte('r')); await n.bild();
    const z1 = await hz(n);
    await n.f.ab(1); await n.f.ab(2);
    melde(z1.vib.length === 1, `mit vibrate, Rate-Limit: A und R gleichzeitig = ${z1.vib.length} Tick`);
    await n.zu();
  }
  // ohne navigator.vibrate (iPhone nachgestellt und anderes Gerät): keine Einträge, nichts ausgegeben, keine Elemente, kein Fehler
  for (const [name, geraet] of [['iPhone (nachgestellt)', { ...HANDY, userAgent: IPHONE_UA }], ['anderes Gerät ohne Vibration', HANDY]]) {
    const h = await rennenHandy(402, 874, '?menue=aus&ton=aus', { geraet, vorher: OHNE_VIB });
    await h.ev(() => { const A = window.__alpineRally; A.anhalten = true; A.start({ countdown: false }); A.rennen.zustand = 'laeuft'; });
    await h.bild();
    const z0 = await hz(h);
    for (const k of ['a', 'b', 'r', 'l', 'a']) { await h.f.tippe(await h.mitte(k)); await warte(80); }
    await h.ev(() => { window.__alpineRally.tonInfo.wucht = 20; }); await h.bild(); await warte(150);
    await h.ev(() => { window.__alpineRally.getriebe.schaltet = true; }); await h.bild();
    await h.ev(() => { window.__alpineRally.getriebe.schaltet = false; }); await h.bild();
    const z1 = await hz(h);
    const e = await h.ev(async () => {
      const A = window.__alpineRally, H = await import('/js/haptik.js');
      const l = A.seiten.einstellungen.eintraege.map((x) => x.text);
      return { touch: A.touch.an, haptik: l.includes('einst.haptik'), testen: l.includes('einst.haptikTesten'), autoGas: l.includes('einst.autoGas'), test: H.testTick() };
    });
    const fehler = h.s.fehler.length;
    melde(!z0.moeglich && e.touch && !e.haptik && !e.testen && e.autoGas && z1.vibrate === 0 && z1.elemente === z0.elemente && z1.labels === 0 && fehler === 0,
      `${name}: HAPTIK ${e.haptik ? 'da' : 'verborgen'}, HAPTIK TESTEN ${e.testen ? 'da' : 'verborgen'} (AUTO-GAS da), 5 Knöpfe + Aufprall + Gang -> ${z1.vibrate} Ausgaben, Elemente ${z0.elemente} -> ${z1.elemente}, ${z1.labels} Schalter, ${fehler} Fehler`);
    await h.zu();
  }
}

// ===================================================================== (d) Desktop unverändert gegen 0.9a.1
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
  console.log('(d) Desktop ohne Touch pixelgleich gegen 0.9a.1');
  if (!ALT) info('nur mit --alt <ordner 0.9a.1> (git worktree add <ordner> 4a265b2)');
  else {
    const [a, b] = [await desktopAbdruck(ALT), await desktopAbdruck(WURZEL)];
    const lage = Object.keys(a.buehne).filter((k) => a.buehne[k] !== b.buehne[k]);
    melde(lage.length === 0, `Lage und Grösse der Bühne in ${Object.keys(a.buehne).length} Fenstergrössen wie 0.9a.1${lage.length ? `; anders: ${lage.join(', ')}` : ''}`);
    const VERSION_SEITEN = ['titel', 'credits']; // zeigen die Versionsnummer
    for (const n of Object.keys(a.seiten)) {
      const A = a.seiten[n], Bn = b.seiten[n];
      const gleich = A.length === Bn.length && A.every((x, i) => x.h === Bn[i].h);
      if (gleich || !VERSION_SEITEN.includes(n)) { melde(gleich, `Menüseite ${n}: pixelgleich wie 0.9a.1 (${Bn.length} Bild${Bn.length > 1 ? 'er (Blinken)' : ''})`); continue; }
      let box = null;
      const ok = A.length === Bn.length && A.every((x, i) => {
        const p = x.d.split(',').map(Number), q = Bn[i].d.split(',').map(Number);
        for (let k = 0; k < p.length; k++) if (p[k] !== q[k]) { const px = (k >> 2) % 320, py = Math.floor((k >> 2) / 320); box = box ? [Math.min(box[0], px), Math.min(box[1], py), Math.max(box[2], px), Math.max(box[3], py)] : [px, py, px, py]; }
        return true;
      }) && box && box[3] - box[1] <= 8;
      melde(ok, `Menüseite ${n}: wie 0.9a.1 bis auf die Versionszeile (anders nur in x ${box ? box[0] : '-'}..${box ? box[2] : '-'}, y ${box ? box[1] : '-'}..${box ? box[3] : '-'})`);
    }
    melde(a.hud === b.hud, 'HUD vor dem Start (Hilfezeilen, Zeit, Tacho, Minimap) pixelgleich wie 0.9a.1');
    melde(a.ganz === b.ganz, `ganzes Bild vor dem Start (Bildschirmfoto 640x360) gleich wie 0.9a.1 (${a.ganz} / ${b.ganz})`);
    melde(!b.touch.an && b.touch.knoepfe === 0, `Desktop: Touch aus, ${b.touch.knoepfe} Knöpfe gebaut`);
  }
}

//@@ENDE@@

console.log(fehler ? `\n${fehler} FEHLER` : '\nalles ok');
process.exit(fehler ? 1 : 0);
