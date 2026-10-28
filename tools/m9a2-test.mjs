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


// ===================================================================== Teil B: KNOPFGRÖSSE und LAYOUT
const FAKTOR = { klein: 0.85, normal: 1, gross: 1.2 }; // (wie CONFIG.touch.knopfGroessen; geprüft in (e))
const VARIANTEN = [];
for (const knopfGroesse of ['klein', 'normal', 'gross']) for (const touchLayout of ['normal', 'gespiegelt']) VARIANTEN.push({ knopfGroesse, touchLayout });
const vName = (v) => `${v.knopfGroesse.toUpperCase()}${v.touchLayout === 'gespiegelt' ? ' GESPIEGELT' : ''}`;
// Prüfung der D-Pad-Zone (wie M9a.1 (e)), gespiegelt erst zurückgespiegelt
function pruefeZone(L0, W, H, safe0, gespiegelt) {
  const L = gespiegelt ? spiegelLayout(L0, W) : L0;
  const safe = gespiegelt ? { ...safe0, l: safe0.r, r: safe0.l } : safe0;
  const p = [];
  const d = L.el.dpad, z = d.zone;
  if (!innen(d, z)) p.push('Zone enthält das D-Pad nicht');
  if (schneiden(z, L.bild)) p.push('Zone überlappt das Bild');
  const inZone = ELEMENTE.filter((n) => n !== 'dpad' && schneiden(z, L.el[n]));
  if (inZone.some((n) => !['l', 'select', 'start', 'notes'].includes(n))) p.push(`Zone überlappt ${inZone.join(', ')}`);
  if (Math.min(d.y - z.y, z.y + z.h - d.y - d.h) < 0.35 * d.v.b - 0.5 && z.y > Math.max(L.flaeche ? L.flaeche.y : 0, safe.o) + 0.5 && z.y + z.h < H - safe.u - 0.5) p.push('Zone weniger als 35 % über/unter dem Kreuz');
  if (z.x < Math.max(24, safe.l) - 0.01) p.push('Zone am Rand');
  return p;
}
let layoutVarianten = null;
if (teil('e') || teil('i')) layoutVarianten = await layouts(WURZEL, VARIANTEN);
if (teil('e')) {
  console.log('(e) KNOPFGRÖSSE x LAYOUT in allen Fenstergrössen (sofort umgestellt, ohne Neuladen)');
  const cfg = await (async () => { const h = await handy(402, 874, { leicht: true }); const c = await h.ev(async () => (await import('/js/config.js')).CONFIG.touch.knopfGroessen); await h.zu(); return c; })();
  melde(JSON.stringify(cfg) === JSON.stringify(FAKTOR), `Faktoren in config.js: ${JSON.stringify(cfg)}`);
  const tab = [];
  const normal = new Map(layoutVarianten.filter((x) => x.v.touchLayout === 'normal').map((x) => [`${x.name}|${x.v.knopfGroesse}`, x.L]));
  for (const { name, W, H, safe, v, L, dom } of layoutVarianten) {
    const gesp = v.touchLayout === 'gespiegelt', f = FAKTOR[v.knopfGroesse];
    const p = pruefeLayout(L, W, H, safe, gesp, f);
    p.probleme.push(...pruefeZone(L, W, H, safe, gesp));
    if (!seiteWieRechnung(L, dom)) p.probleme.push('Seite liegt nicht wie berechnet (nicht sofort umgestellt?)');
    if (dom.sw > W || dom.sh > H) p.probleme.push(`Seite grösser als das Fenster (${dom.sw}x${dom.sh})`);
    // gespiegelt = genau das normale Layout, waagrecht gespiegelt (Safe-Area hier links/rechts gleich)
    if (gesp) {
      const n = normal.get(`${name}|${v.knopfGroesse}`), s = spiegelLayout(L, W);
      const anders = [...ELEMENTE.filter((e) => !nah(s.el[e], n.el[e], 0.01) || !nah(s.el[e].v, n.el[e].v, 0.01)), ...(nah(s.bild, n.bild, 0.01) ? [] : ['bild']), ...(nah(s.el.dpad.zone, n.el.dpad.zone, 0.01) ? [] : ['zone'])];
      if (anders.length) p.probleme.push(`nicht genau gespiegelt: ${anders.join(', ')}`);
      if (!(L.el.dpad.x > L.bild.x && L.el.a.x < L.bild.x + L.bild.b && L.el.dpad.x > L.el.a.x)) p.probleme.push('D-Pad nicht rechts / A nicht links');
    }
    const kEff = L.format === 'hoch' ? L.k : L.k / 0.9 / Math.min(1, H / 330);
    if (kEff > f + 1e-6) p.probleme.push(`Faktor ${kEff.toFixed(2)} grösser als ${f}`);
    tab.push({ name, W, H, variante: vName(v), format: L.format, faktorWirklich: +kEff.toFixed(2), bild: `${L.bild.b.toFixed(0)}x${L.bild.h.toFixed(0)}`, dpad: Math.round(L.el.dpad.v.b), ab: Math.round(L.el.a.v.b), r: `${L.el.r.v.b.toFixed(0)}x${L.el.r.v.h.toFixed(0)}`, klein: `${L.el.select.v.b.toFixed(0)}x${L.el.select.v.h.toFixed(0)}`, kleinLage: L.klein || 'unten', zone: `${L.el.dpad.zone.b.toFixed(0)}x${L.el.dpad.zone.h.toFixed(0)}` });
    melde(p.probleme.length === 0, `${name} ${vName(v)}: Bild ${tab.at(-1).bild}, D-Pad ${tab.at(-1).dpad}, A/B ${tab.at(-1).ab}, Faktor ${kEff.toFixed(2)}${p.probleme.length ? ` – ${p.probleme.slice(0, 4).join('; ')}` : ''}`);
  }
  fs.writeFileSync(path.join(LOG, 'varianten.json'), JSON.stringify(tab, null, 1));
  info(`Tabelle: ${path.join(LOG, 'varianten.json')}`);
}
const setzeE = (h, v) => h.ev((v) => import('/js/einstellungen.js').then((E) => { for (const [k, w] of Object.entries(v)) E.setze(k, w); }), v);
if (teil('f')) {
  console.log('(f) GESPIEGELT: jede Aktion auf dem gespiegelten Knopf');
  for (const [W, H] of [[874, 402], [402, 874]]) {
    const h = await rennenHandy(W, H);
    await setzeE(h, { touchLayout: 'gespiegelt' }); await h.bild();
    const L = await h.lay();
    await testZustand(h);
    const fehl = [];
    for (const [k, aktion, soll] of [['a', 'gas', 1], ['b', 'bremse', 1], ['r', 'handbremse', true]]) {
      await h.f.auf(1, await h.mitte(k)); await h.bild();
      const e = await lies(h); await h.f.ab(1); await h.bild(); const nach = await lies(h);
      const sonst = ['gas', 'bremse', 'handbremse', 'reset'].filter((x) => x !== aktion && e[x]);
      if (!(e[aktion] === soll && !nach[aktion] && !sonst.length)) fehl.push(`${k}: ${aktion} ${e[aktion]}${sonst.length ? ` + ${sonst}` : ''}`);
    }
    await h.f.auf(1, await h.mitte('l')); await h.bild(); const l1 = await lies(h); await h.f.ab(1); await h.bild();
    if (!l1.reset || l1.handbremse) fehl.push('L nicht zurück auf die Strasse');
    for (const [grad, feld] of [[0, 'gas'], [180, 'bremse']]) {
      await h.f.auf(1, await h.dpadPunkt(grad)); await h.bild(); const e = await lies(h); await h.f.ab(1); await h.bild();
      if (e[feld] !== 1) fehl.push(`D-Pad ${grad}°: ${feld} ${e[feld]}`);
    }
    // Mehrfinger: D-Pad → (lenken rechts) und A (Gas) gleichzeitig, dann ← und B
    const multi = [];
    for (const [grad, knopf, vz, feld] of [[90, 'a', 1, 'gas'], [270, 'b', -1, 'bremse']]) {
      await h.f.auf(1, await h.dpadPunkt(grad, 0.8)); await h.f.auf(2, await h.mitte(knopf)); await h.bild();
      let e; for (let i = 0; i < 20; i++) e = await lies(h);
      await h.f.ab(1); await h.f.ab(2); await h.bild(); for (let i = 0; i < 40; i++) await lies(h);
      multi.push(`${grad === 90 ? '→' : '←'}+${knopf.toUpperCase()}: Lenkung ${e.lenkung.toFixed(2)}, ${feld} ${e[feld]}`);
      if (!(Math.sign(e.lenkung) === vz && e[feld] === 1)) fehl.push(multi.at(-1));
    }
    // einmalige Aktionen im Rennen: SELECT, NOTES, START
    await h.ev(() => { window.__alpineRally.start({ countdown: false }); }); await h.bild();
    const vor = await h.ev(() => { const A = window.__alpineRally; return { hud: A.hudSchalter.an, notes: A.paceNotes.anzeige.an }; });
    await h.f.tippe(await h.mitte('select')); await h.f.tippe(await h.mitte('notes')); await h.bild();
    const nach = await h.ev(() => { const A = window.__alpineRally; return { hud: A.hudSchalter.an, notes: A.paceNotes.anzeige.an }; });
    if (nach.hud === vor.hud || nach.notes === vor.notes) fehl.push('SELECT/NOTES');
    await h.f.tippe(await h.mitte('select')); await h.f.tippe(await h.mitte('notes'));
    await h.f.tippe(await h.mitte('start')); await h.bild(); const p = await h.ev(() => window.__alpineRally.ablauf.zustand);
    // Menü (Pause): A = OK (WEITER), Menü-Belegung gleich
    await h.f.tippe(await h.mitte('a')); await h.bild(); const w = await h.ev(() => window.__alpineRally.ablauf.zustand);
    if (p !== 'pause' || w !== 'rennen') fehl.push(`START ${p}, A im Pausenmenü ${w}`);
    const seiten = `D-Pad bei x ${L.el.dpad.x.toFixed(0)} (rechts), A bei ${L.el.a.x.toFixed(0)}, R bei ${L.el.r.x.toFixed(0)},${L.el.r.y.toFixed(0)}, L bei ${L.el.l.x.toFixed(0)},${L.el.l.y.toFixed(0)}`;
    melde(fehl.length === 0 && L.gespiegelt, `${W}x${H} gespiegelt: A, B, R, L, ↑, ↓, ${multi.join(', ')}, SELECT, NOTES, START, A im Menü; ${seiten}${fehl.length ? ` – ${fehl.join('; ')}` : ''}`);
    await h.zu();
  }
  // Zielbildschirm gespiegelt: L = NEU STARTEN, R nichts
  const z = await handy(874, 402, { adresse: '?ton=aus', leicht: true, speicher: { 'alpineRally.einstellungen': JSON.stringify({ touchLayout: 'gespiegelt' }) } });
  await z.ev(() => { const A = window.__alpineRally; A.anhalten = true; A.start(); A.rennen.zustand = 'ziel'; A.rennen.endZeit = 160; A.ablauf.wechsle('ziel'); });
  await z.bild();
  await z.f.tippe(await z.mitte('r')); await z.bild(); const nR = await z.ev(() => window.__alpineRally.ablauf.zustand);
  await z.f.tippe(await z.mitte('l')); await z.bild(); const nL = await z.ev(() => window.__alpineRally.ablauf.zustand);
  melde(nR === 'ziel' && nL === 'countdown', `Zielbildschirm gespiegelt: R tut nichts (${nR}), L = NEU STARTEN (${nL})`);
  await z.zu();
}
const relP = (L, dx, dy) => { const v = L.el.dpad.v, r = v.b / 2; return { x: v.x + r + dx * r, y: v.y + r + dy * r }; };
const winkelP = (L, grad, anteil) => { const w = grad * Math.PI / 180; return relP(L, Math.sin(w) * anteil, -Math.cos(w) * anteil); };
const probe = (h, p, fahren) => h.ev(([p, f]) => window.__alpineRally.touch.probe(p.x, p.y, f), [p, fahren]);
if (teil('g')) {
  console.log('(g) D-Pad-Zonen bei jeder Grösse und gespiegelt');
  for (const [W, H] of [[874, 402], [402, 874]]) {
    const h = await rennenHandy(W, H);
    for (const v of VARIANTEN) {
      await setzeE(h, v); await h.bild();
      const L = await h.lay();
      const z = L.el.dpad.zone, d = L.el.dpad.v, r = d.b / 2, cx = d.x + r;
      // innen = Seite zum Bild (normal rechts, gespiegelt links); aussen = Fensterrand
      const gesp = v.touchLayout === 'gespiegelt', sInnen = gesp ? 7 : 3, sAussen = gesp ? 3 : 7;
      const innenX = gesp ? z.x + 3 : z.x + z.b - 3, aussenX = gesp ? z.x + z.b - 1 : z.x + 1;
      const faelle = [
        ['innen am Ende der Zone, Mitte', { x: innenX, y: d.y + r }, sInnen],
        ['innen, 35 % über dem Kreuz', { x: innenX, y: Math.max(z.y + 1, d.y - 0.35 * d.b + 2) }, sInnen],
        ['innen, 35 % unter dem Kreuz', { x: innenX, y: Math.min(z.y + z.h - 1, d.y + d.b + 0.35 * d.b - 2) }, sInnen],
        ['aussen am Rand, über dem Kreuz', { x: aussenX, y: Math.max(z.y + 1, d.y - 0.3 * d.b) }, sAussen],
        ['← am Kreuz', winkelP(L, 270, 0.9), 7], ['→ am Kreuz', winkelP(L, 90, 0.9), 3],
        ['10° von ↑', winkelP(L, 10, 0.7), 1], ['350° von ↑', winkelP(L, 350, 0.7), 1], ['10° neben ↓', winkelP(L, 170, 0.7), 5],
        ['↗ 25°', winkelP(L, 25, 0.7), 2], ['↘ 155°', winkelP(L, 155, 0.7), 4], ['↙ 205°', winkelP(L, 205, 0.7), 6], ['↖ 335°', winkelP(L, 335, 0.7), 8],
        ['↑ zu weit (1.3 Radien)', winkelP(L, 0, 1.3), 0], ['tote Mitte', winkelP(L, 90, 0.1), 0],
      ];
      const fehl = [];
      for (const [name, p, soll] of faelle) {
        const ist = await probe(h, p, true);
        if ((ist.el !== 'dpad' && soll !== 0) || ist.richtung !== soll) fehl.push(`${name}: ${ist.el} ${ist.richtung} (Soll ${soll})`);
      }
      const lp = await probe(h, { x: L.el.l.x + L.el.l.b / 2, y: L.el.l.y + L.el.l.h / 2 }, true);
      if (lp.el !== 'l') fehl.push(`auf L: ${lp.el}`);
      const aus = await probe(h, { x: gesp ? z.x - 6 : z.x + z.b + 6, y: d.y + r }, true);
      if (aus.el === 'dpad') fehl.push('neben der Zone (zum Bild hin): noch D-Pad');
      // Menü klassisch: 4 Richtungen je 90°
      const m = [];
      for (const [g, soll] of [[0, 1], [80, 3], [180, 5], [280, 7]]) { const ist = await probe(h, winkelP(L, g, 0.7), false); if (ist.r4 !== soll) m.push(`${g}°: ${ist.r4}`); }
      if (m.length) fehl.push(`Menü ${m.join(', ')}`);
      melde(fehl.length === 0, `${W}x${H} ${vName(v)}: ${faelle.length + 2} Punkte beim Fahren + 4 im Menü (D-Pad ${d.b.toFixed(0)}, Zone ${z.b.toFixed(0)}x${z.h.toFixed(0)}, ${gesp ? 'innen = links' : 'innen = rechts'})${fehl.length ? ` – ${fehl.join('; ')}` : ''}`);
    }
    await h.zu();
  }
}
if (teil('h')) {
  console.log('(h) KNOPFGRÖSSE und LAYOUT bleiben nach Neuladen; Unsinn = Standard');
  const h = await handy(874, 402, { leicht: true });
  await setzeE(h, { knopfGroesse: 'gross', touchLayout: 'gespiegelt' }); await h.bild();
  const vor = await h.lay();
  await h.page.reload(); await h.page.waitForFunction(() => window.__alpineRally && window.__alpineRally.touch, null, { timeout: 120000 });
  await h.bild();
  const nach = await h.ev(() => ({ g: window.__alpineRally.einstellungen.knopfGroesse, l: window.__alpineRally.einstellungen.touchLayout }));
  const L = await h.lay();
  melde(nach.g === 'gross' && nach.l === 'gespiegelt' && nah(L.el.dpad, vor.el.dpad, 0.01) && nah(L.bild, vor.bild, 0.01), `nach Neuladen: KNOPFGRÖSSE ${nach.g}, LAYOUT ${nach.l}, Lage gleich`);
  await h.zu();
  const u = await handy(874, 402, { leicht: true, speicher: { 'alpineRally.einstellungen': JSON.stringify({ knopfGroesse: 'riesig', touchLayout: 7, haptik: 'voll' }) } });
  const w = await u.ev(() => ({ g: window.__alpineRally.einstellungen.knopfGroesse, l: window.__alpineRally.einstellungen.touchLayout, hp: window.__alpineRally.einstellungen.haptik }));
  melde(w.g === 'normal' && w.l === 'normal' && w.hp === 'voll', `gespeicherter Unsinn (riesig, 7): KNOPFGRÖSSE ${w.g}, LAYOUT ${w.l}; HAPTIK aus M9a.1 (voll) bleibt ${w.hp}`);
  await u.zu();
  // Einträge nur im Touch-Modus (Desktop: nicht da; TOUCH-STEUERUNG = AN: da)
  const d = await handy(1280, 720, { leicht: true, geraet: {} });
  const lst = () => d.ev(() => window.__alpineRally.seiten.einstellungen.eintraege.map((e) => e.text));
  const l0 = await lst();
  await setzeE(d, { touch: 'an' }); await d.bild();
  const l1 = await lst();
  const i = l1.indexOf('einst.touch');
  melde(!l0.includes('einst.knopfGroesse') && !l0.includes('einst.touchLayout') && l1[i + 1] === 'einst.knopfGroesse' && l1[i + 2] === 'einst.touchLayout' && l1[i + 3] === 'einst.autoGas',
    `Desktop: KNOPFGRÖSSE/LAYOUT ${l0.includes('einst.knopfGroesse') ? 'da' : 'verborgen'}; TOUCH-STEUERUNG = AN: ${l1.slice(i, i + 4).join(', ')}`);
  await d.zu();
}
if (teil('i')) {
  console.log('(i) Standardwerte (NORMAL, NORMAL) wie 0.9a.1, ausser R (Teil A)');
  if (!ALT) info('nur mit --alt <ordner 0.9a.1>');
  else {
    const std = layoutVarianten.filter((x) => x.v.knopfGroesse === 'normal' && x.v.touchLayout === 'normal');
    for (const [i, x] of std.entries()) {
      const a = layoutAlt[i].L, ohne = layoutNeu[i].L;
      const gleichOhne = ELEMENTE.every((n) => nah(x.L.el[n], ohne.el[n], 0.001) && nah(x.L.el[n].v, ohne.el[n].v, 0.001)) && nah(x.L.bild, ohne.bild, 0.001);
      const anders = unterschiede(x.L, a);
      // erlaubt: R; NOTES im Querformat seitlich (rutscht unter R); im Hochformat Steuerfläche niedriger, weil über A kein R mehr Platz braucht
      const erklaert = anders.every((n) => n === 'r' || (n === 'notes' && x.L.klein === 'seitlich')) || (x.L.format === 'hoch' && anders.every((n) => n === 'r' || ELEMENTE.concat('bild').includes(n)) && ELEMENTE.filter((n) => n !== 'r').every((n) => Math.abs(x.L.el[n].x - a.el[n].x) < 0.01 && Math.abs(x.L.el[n].b - a.el[n].b) < 0.01));
      melde(gleichOhne && erklaert, `${x.name}: anders als 0.9a.1: ${anders.join(', ') || '–'}${anders.length > 1 && x.L.format === 'hoch' ? ` (nur senkrecht verschoben: Bild ${(x.L.bild.y - a.bild.y).toFixed(1)}, D-Pad ${(x.L.el.dpad.y - a.el.dpad.y).toFixed(1)} px)` : ''}; nach Umschalten zurück auf NORMAL gleich wie frisch geladen: ${gleichOhne}`);
    }
  }
}

// ===================================================================== Teil C: HUD-GRÖSSE
const AUTOS = arg('--autos') ? arg('--autos').split(',') : ['rt4', 'delto', 'escorta', 'l073', 'imprexa']; // (--autos rt4,l073: nur diese)
const AUFL = [[0, '320x180'], [1, '480x270'], [2, '640x360']];
// Rennen mit allen HUD-Teilen sichtbar und festen Werten (Physik angehalten): Zeit, Checkpoint-Punkte, Live-Vergleich
// (Anzeige fest), Meldung, Pace-Notes (Stelle 300 m), R-Countdown, Minimap, Tacho (Tempo, Drehzahl, Gang, Ladedruck)
const HUD_FEST = () => {
  const A = window.__alpineRally;
  A.anhalten = true;
  A.start({ countdown: false });
  A.rennen.zustand = 'laeuft'; A.ablauf.wechsle('rennen');
  A.setzeAuf(300);
  A.rennen.zeit = 61.23; A.rennen.zwischenzeiten[0] = 30.5;
  A.rennen.meldung = { text: 'CHECKPOINT VERPASST', farbe: 'rot', bis: 1e9, verpasstCp: 1 }; A.rennen.uhr = 0; // (längste echte Meldung)
  A.rueck.rest = 2.5;
  const fest = { sichtbar: true, wert: 8, stufe: -1, uhr: 0, version: 1 };
  A.vergleich.aktualisiere = () => fest;
  A.physik.tempo = 33; A.getriebe.drehzahl = 6100; A.getriebe.anzeige = '3'; A.getriebe.ladedruck = 0.7;
};
// Pixel-Abdruck der HUD-Leinwand und aller Ebenen (zusammen gerechnet, Reihenfolge wie auf dem Schirm)
const HUD_ABDRUCK = () => {
  const els = [...document.querySelectorAll('#buehne canvas.hud-ebene'), document.getElementById('hud')].filter((c) => c.style.display !== 'none');
  let h = 7, n = 0;
  for (const c of els) { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; for (let i = 0; i < d.length; i++) { h = (h * 31 + d[i] * (i % 7 + 1)) % 1000000007; if (i % 4 === 3 && d[i]) n++; } }
  return { h, n, ebenen: els.length };
};
async function hudSeite(wurzel, autoId, geraet = {}, W = 1280, H = 720, speicher = null) {
  // (leicht: 3D-Szene aus, das HUD hängt nicht von ihr ab; sonst ist der Test-Browser sehr langsam)
  const h = await handy(W, H, { wurzel, adresse: `?menue=aus&ton=aus&auto=${autoId}`, geraet, leicht: true, speicher });
  await h.ev(HUD_FEST);
  return h;
}
const warteBilder = async (h, n = 40) => { for (let i = 0; i < n; i++) await h.bild(); };
if (teil('j')) {
  console.log('(j) HUD-GRÖSSE MITTEL pixelgleich zu 0.9a.1 (Bild im Rennen, 5 Autos, 3 Pixelgrössen)');
  if (!ALT) info('nur mit --alt <ordner 0.9a.1>');
  else for (const id of AUTOS) {
    const erg = [];
    for (const w of [ALT, WURZEL]) {
      const h = await hudSeite(w, id);
      const r = [];
      for (const [i] of AUFL) {
        await h.ev((i) => import('/js/einstellungen.js').then((E) => E.setze('aufloesung', i)), i);
        await h.ev(HUD_FEST); await warteBilder(h, 60);
        r.push(await h.ev(HUD_ABDRUCK));
      }
      erg.push(r);
      await h.zu();
    }
    const gleich = erg[0].every((a, k) => a.h === erg[1][k].h);
    melde(gleich && erg[1].every((x) => x.ebenen === 1), `${id}: HUD in ${AUFL.map((a) => a[1]).join(', ')} gleich wie 0.9a.1 (${erg[1].map((x) => `${x.n} Pixel`).join(' / ')}; ${erg[1][0].ebenen} Leinwand)${gleich ? '' : ` – anders: ${erg[0].map((a, k) => a.h === erg[1][k].h ? '' : AUFL[k][1]).filter(Boolean).join(', ')}`}`);
  }
}
// Lage jedes HUD-Teils in Pixeln des 320x180-Bilds (Teil allein gemalt, Bounding-Box der deckenden Pixel)
const TEILE = ['zeit', 'meldung', 'notes', 'karte', 'tacho', 'haupt'];
// Dazu je Teil eine Maske im 320x180-Raster (window.__masken[name]: welche Bildpunkte er deckend bemalt), für die
// Prüfung auf Pixelebene: zwei Teile überlappen, wenn sie denselben Bildpunkt bemalen.
const teilBoxen = (h, praefix = '') => h.ev(async ([teile, praefix]) => {
  const A = window.__alpineRally, raf = () => new Promise((r) => requestAnimationFrame(r));
  const out = {};
  window.__masken = window.__masken || {};
  for (const n of teile) {
    A.hud.zeigeNur(n); await raf(); await raf(); await raf();
    const L = A.hud.teilLeinwand(n), d = L.c.getContext('2d').getImageData(0, 0, L.b, L.h).data;
    let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
    for (let y = 0; y < L.h; y++) for (let x = 0; x < L.b; x++) if (d[(y * L.b + x) * 4 + 3]) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    const fx = 320 / L.b, fy = 180 / L.h;
    out[n] = x1 < 0 ? null : { x: x0 * fx, y: y0 * fy, b: (x1 + 1 - x0) * fx, h: (y1 + 1 - y0) * fy, pixel: L.b };
    // Maske: Mitte jedes Bildpunkts (320x180) auf die Leinwand des Teils abgebildet
    const m = new Uint8Array(320 * 180);
    for (let y = 0; y < 180; y++) for (let x = 0; x < 320; x++) {
      const lx = Math.floor((x + 0.5) / fx), ly = Math.floor((y + 0.5) / fy);
      if (d[(ly * L.b + lx) * 4 + 3]) m[y * 320 + x] = 1;
    }
    window.__masken[praefix + n] = m;
  }
  A.hud.zeigeNur(null);
  return { boxen: out, ebenen: A.hud.ebenenAnzahl };
}, [TEILE, praefix]);
// Anzahl Bildpunkte, die zwei Teile beide bemalen
const pixelUeberlapp = (h, a, b) => h.ev(([a, b]) => { const p = window.__masken[a], q = window.__masken[b]; let n = 0; for (let i = 0; i < p.length; i++) if (p[i] && q[i]) n++; return n; }, [a, b]);
if (teil('k')) {
  console.log('(k) KLEIN und GROSS: HUD-Teile überlappen nicht und liegen im Bild (5 Autos, 3 Pixelgrössen, Desktop / Touch hoch / quer)');
  const tab = [];
  for (const [modus, geraet, W, H] of [['Desktop', {}, 1280, 720], ['Touch hoch', HANDY, 402, 874], ['Touch quer', HANDY, 874, 402]]) {
    for (const id of AUTOS) {
      const h = await hudSeite(WURZEL, id, geraet, W, H);
      // vor dem Start (Hilfezeilen) und im Rennen
      for (const g of ['klein', 'mittel', 'gross']) for (const [i, aufl] of AUFL) {
        await h.ev(([g, i]) => import('/js/einstellungen.js').then((E) => { E.setze('hudGroesse', g); E.setze('aufloesung', i); }), [g, i]);
        await h.ev(HUD_FEST); await warteBilder(h, 30);
        const { boxen, ebenen } = await teilBoxen(h);
        // Hilfezeilen vor dem Start (nicht skaliert) gegen den Tacho
        await h.ev(() => { const A = window.__alpineRally; A.rennen.zustand = 'bereit'; A.rennen.hilfe = true; });
        const vor = await teilBoxen(h, 'vor.');
        await h.ev(HUD_FEST);
        const p = [];
        const b = { ...boxen, hilfe: vor.boxen.haupt };
        delete b.haupt; // (im Rennen ist auf der HUD-Leinwand selbst nichts ausser Teilen mit Faktor 1)
        for (const [n, r] of Object.entries(b)) {
          if (!r) { p.push(`${n} fehlt`); continue; }
          if (r.x < -0.01 || r.y < -0.01 || r.x + r.b > 320.01 || r.y + r.h > 180.01) p.push(`${n} ausserhalb`);
        }
        const namen = Object.keys(b).filter((n) => b[n]);
        // (die Hilfe steht nur vor dem Start: verglichen mit den Teilen, wie sie vor dem Start liegen, ohne Live-Vergleich)
        const rechteck = [];
        for (let x = 0; x < namen.length; x++) for (let y = x + 1; y < namen.length; y++) {
          const [m, n] = [namen[x], namen[y]];
          const hilfe = m === 'hilfe' || n === 'hilfe';
          const [bm, bn] = hilfe ? [m === 'hilfe' ? b.hilfe : vor.boxen[m], n === 'hilfe' ? b.hilfe : vor.boxen[n]] : [b[m], b[n]];
          if (!bm || !bn || !schneiden(bm, bn)) continue;
          const px = await pixelUeberlapp(h, hilfe ? `vor.${m === 'hilfe' ? 'haupt' : m}` : m, hilfe ? `vor.${n === 'hilfe' ? 'haupt' : n}` : n);
          if (px) p.push(`${m} überlappt ${n} (${px} Bildpunkte)`); else rechteck.push(`${m}/${n}`);
        }
        const tachoAnteil = b.tacho ? b.tacho.b / 320 : 0;
        if (g !== 'mittel') tab.push({ modus, auto: id, groesse: g, aufl, ebenen, ...Object.fromEntries(Object.entries(b).map(([n, r]) => [n, r ? `${r.x.toFixed(0)},${r.y.toFixed(0)} ${r.b.toFixed(0)}x${r.h.toFixed(0)}` : '-'])), tachoAnteil: +tachoAnteil.toFixed(3) });
        if (g === 'mittel' && ebenen !== 0) p.push(`MITTEL mit ${ebenen} Ebenen`);
        if (p.length || aufl === '320x180') melde(p.length === 0, `${modus} ${id} ${g.toUpperCase()} ${aufl}: ${ebenen} Ebene(n)${rechteck.length ? ` (Rechtecke schneiden sich, Pixel nicht: ${rechteck.join(', ')})` : ''}, Tacho ${b.tacho ? `${b.tacho.b.toFixed(0)}x${b.tacho.h.toFixed(0)} (${(tachoAnteil * 100).toFixed(0)} % der Breite, links bei ${b.tacho.x.toFixed(0)})` : '-'}, Zeit ${b.zeit ? `${b.zeit.b.toFixed(0)}x${b.zeit.h.toFixed(0)}` : '-'}, Karte ${b.karte ? b.karte.b.toFixed(0) : '-'}${p.length ? ` – ${p.join('; ')}` : ''}`);
      }
      await h.zu();
    }
  }
  fs.writeFileSync(path.join(LOG, 'hud-boxen.json'), JSON.stringify(tab, null, 1));
  const breitest = tab.filter((x) => x.groesse === 'gross').reduce((m, x) => (x.tachoAnteil > m.tachoAnteil ? x : m), { tachoAnteil: 0 });
  info(`breitester Tacho bei GROSS: ${breitest.auto} ${(breitest.tachoAnteil * 100).toFixed(1)} % der Bildbreite (${breitest.tacho}); Tabelle ${path.join(LOG, 'hud-boxen.json')}`);
}
if (teil('l')) {
  console.log('(l) HUD-GRÖSSE bleibt nach Neuladen, wirkt in der Pause sofort, Demo-Fahrt im Menü ohne HUD-Reste');
  const h = await hudSeite(WURZEL, 'l073');
  await h.ev(() => import('/js/einstellungen.js').then((E) => E.setze('hudGroesse', 'gross'))); await warteBilder(h, 10);
  const a1 = await h.ev(HUD_ABDRUCK);
  await h.page.reload(); await h.page.waitForFunction(() => window.__alpineRally && window.__alpineRally.touch, null, { timeout: 120000 });
  await h.ev(HUD_FEST); await warteBilder(h, 30);
  const nach = await h.ev(() => ({ g: window.__alpineRally.einstellungen.hudGroesse, e: window.__alpineRally.hud.ebenenAnzahl, dom: document.querySelectorAll('canvas.hud-ebene').length }));
  melde(nach.g === 'gross' && nach.e === 2 && a1.ebenen === 3, `nach Neuladen: HUD-GRÖSSE ${nach.g}, ${nach.e} Ebenen (Zeit/Notes/Karte 1.43, Tacho 1.25)`);
  // Pause: Einstellung über das Menü ändern, das HUD dahinter folgt sofort
  await h.ev(() => { const A = window.__alpineRally; A.pausieren(); }); await warteBilder(h, 10);
  const p0 = await h.ev(HUD_ABDRUCK);
  const pz = await h.ev(async () => {
    const A = window.__alpineRally; A.menue.oeffne(A.seiten.einstellungen, true);
    const e = A.seiten.einstellungen.eintraege.find((x) => x.text === 'einst.hudGroesse');
    e.setzen('klein');
    return { zustand: A.ablauf.zustand, g: A.einstellungen.hudGroesse };
  });
  await warteBilder(h, 10);
  const p1 = await h.ev(HUD_ABDRUCK);
  const ebK = await h.ev(() => ({ e: window.__alpineRally.hud.ebenenAnzahl, sichtbar: [...document.querySelectorAll('canvas.hud-ebene')].filter((c) => c.style.display !== 'none').map((c) => `${c.width}x${c.height}`) }));
  melde(pz.zustand === 'pause' && pz.g === 'klein' && p1.h !== p0.h && ebK.e === 1 && ebK.sichtbar.join() === '400x225', `Pause: HUD-GRÖSSE auf KLEIN -> sofort neu (sichtbare Ebene ${ebK.sichtbar.join(', ')}), Zustand bleibt ${pz.zustand}`);
  // Hauptmenü mit Demo-Fahrt: Ebenen leer
  await h.ev(() => { const A = window.__alpineRally; A.zumMenue(); A.menue.zeige(A.seiten.haupt, true); }); await warteBilder(h, 20);
  const leer = await h.ev(() => [...document.querySelectorAll('canvas.hud-ebene')].map((c) => { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i]) n++; return n; }));
  melde(leer.every((n) => n === 0), `Hauptmenü (Demo-Fahrt dahinter): Ebenen leer (${leer.join(', ')} deckende Pixel)`);
  await h.zu();
  // Unsinn im Speicher = MITTEL; Desktop zeigt den Eintrag
  const u = await handy(1280, 720, { geraet: {}, leicht: true, speicher: { 'alpineRally.einstellungen': JSON.stringify({ hudGroesse: 'riesig' }) } });
  const uw = await u.ev(() => ({ g: window.__alpineRally.einstellungen.hudGroesse, e: window.__alpineRally.hud.ebenenAnzahl, da: window.__alpineRally.seiten.einstellungen.eintraege.some((x) => x.text === 'einst.hudGroesse'), dom: document.querySelectorAll('canvas.hud-ebene').length }));
  melde(uw.g === 'mittel' && uw.e === 0 && uw.dom === 0 && uw.da, `Unsinn im Speicher: HUD-GRÖSSE ${uw.g}, ${uw.dom} zusätzliche Leinwände; Eintrag am Desktop ${uw.da ? 'da' : 'fehlt'}`);
  await u.zu();
  // Bildzeit des HUD (hud.zeichne) MITTEL / KLEIN / GROSS gegen 0.9a.1
  const zeit = async (w, g) => {
    const s = await hudSeite(w, 'l073');
    if (g) await s.ev((g) => import('/js/einstellungen.js').then((E) => E.setze('hudGroesse', g)), g);
    await warteBilder(s, 20);
    const ms = await s.ev(async () => {
      const A = window.__alpineRally, alt = A.hud.zeichne.bind(A.hud); let summe = 0, n = 0;
      A.hud.zeichne = (z) => { const t0 = performance.now(); alt(z); summe += performance.now() - t0; n++; };
      await new Promise((r) => setTimeout(r, 4000));
      A.hud.zeichne = alt;
      return summe / Math.max(1, n);
    });
    await s.zu();
    return ms;
  };
  const t = { alt: await zeit(ALT || WURZEL, null), mittel: await zeit(WURZEL, 'mittel'), klein: await zeit(WURZEL, 'klein'), gross: await zeit(WURZEL, 'gross') };
  melde(t.mittel < t.alt * 1.3 + 0.05, `hud.zeichne je Bild: 0.9a.1 ${t.alt.toFixed(3)} ms, MITTEL ${t.mittel.toFixed(3)}, KLEIN ${t.klein.toFixed(3)}, GROSS ${t.gross.toFixed(3)} ms`);
}
if (teil('m')) {
  console.log('(m) neue Texte de/en in der Pixelschrift');
  const h = await handy(402, 874, { leicht: true });
  const r = await h.ev(async () => {
    const T = await import('/js/texte.js'), P = await import('/js/pixel.js');
    const neu = ['einst.haptikHinweis', 'einst.knopfGroesse', 'einst.knopfGroesseHinweis', 'einst.touchLayout', 'einst.touchLayoutHinweis', 'wert.klein', 'wert.normal', 'wert.gross', 'wert.gespiegelt',
      'einst.hudGroesse', 'einst.hudGroesseHinweis', 'wert.mittel'];
    const zeichen = new Set(P.SCHRIFT_ZEICHEN), fehlt = []; let breitest = 0;
    for (const k of neu) for (const sp of ['de', 'en']) {
      const tx = T.TEXTE[k] && T.TEXTE[k][sp];
      if (!tx) { fehlt.push(`${k}.${sp} leer`); continue; }
      if (tx !== tx.toUpperCase()) fehlt.push(`${k}.${sp} nicht gross`);
      for (const z of tx) if (!zeichen.has(z)) fehlt.push(`${k}.${sp}: "${z}"`);
      breitest = Math.max(breitest, P.textBreite(tx));
    }
    const tot = ['haptik.schalter', 'haptik.keiner'].filter((k) => T.TEXTE[k]);
    return { n: neu.length, fehlt, breitest, tot, iphone: Object.entries(T.TEXTE).filter(([k, v]) => /IPHONE/.test(v.de || '')).map(([k]) => k) };
  });
  melde(r.fehlt.length === 0 && r.breitest <= 298 && r.tot.length === 0 && r.iphone.length === 0, `${r.n} neue/geänderte Texte de + en: Grossbuchstaben, alle Zeichen in der Pixelschrift, längster ${r.breitest} Pixel; tote iPhone-Texte entfernt (${r.tot.length + r.iphone.length} übrig)${r.fehlt.length ? ` – ${r.fehlt.slice(0, 6).join(', ')}` : ''}`);
  await h.zu();
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
    // M9a.2: EINSTELLUNGEN hat neu die Zeile HUD-GRÖSSE (gilt auch am Desktop): ohne sie muss die Seite wie 0.9a.1 sein
    const E = A.seiten.einstellungen, alt = Object.getOwnPropertyDescriptor(E, 'eintraege');
    out.hudZeile = alt.get.call(E).map((e) => e.text).filter((x) => x === 'einst.hudGroesse' || x === 'einst.anzeige' || x === 'einst.minimap').join(',');
    Object.defineProperty(E, 'eintraege', { configurable: true, get() { return alt.get.call(E).filter((e) => e.text !== 'einst.hudGroesse'); } });
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
    Object.defineProperty(E, 'eintraege', alt);
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
  // M9a.2: Pixel des Bildschirmfotos vergleichen, nicht die PNG-Datei (deren Kodierung schwankt bei gleichen Pixeln)
  const png = await s.page.screenshot();
  fs.writeFileSync(path.join(LOG, `foto-${wurzel === WURZEL ? 'neu' : 'alt'}.png`), png); // (zum Nachprüfen)
  erg.ganz = await s.page.evaluate(async (b64) => {
    const bm = await createImageBitmap(await (await fetch(`data:image/png;base64,${b64}`)).blob());
    const c = new OffscreenCanvas(bm.width, bm.height), x = c.getContext('2d');
    x.drawImage(bm, 0, 0);
    const d = x.getImageData(0, 0, bm.width, bm.height).data;
    let h = 7; for (let i = 0; i < d.length; i++) h = (h * 31 + d[i] * (i % 7 + 1)) % 1000000007;
    return `${bm.width}x${bm.height}:${h}`;
  }, png.toString('base64'));
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
    melde(b.seiten.hudZeile === 'einst.anzeige,einst.hudGroesse,einst.minimap', `EINSTELLUNGEN am Desktop: neue Zeile HUD-GRÖSSE unter ANZEIGE (${b.seiten.hudZeile}); die Seite ohne sie wird verglichen`);
    delete a.seiten.hudZeile; delete b.seiten.hudZeile;
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
    melde(a.ganz === b.ganz, `ganzes Bild vor dem Start (Bildschirmfoto 640x360, Pixel verglichen) gleich wie 0.9a.1 (${a.ganz} / ${b.ganz})`);
    melde(!b.touch.an && b.touch.knoepfe === 0, `Desktop: Touch aus, ${b.touch.knoepfe} Knöpfe gebaut`);
  }
}

// ===================================================================== (u) Unveränderlich gegen 0.9a.1, (v) Tests von M9a und M9a.1
const BASIS = '4a265b2'; // 0.9a.1
if (teil('u')) {
  console.log('(u) Unveränderlich gegen 0.9a.1');
  if (!ALT) info(`nur mit --alt <ordner 0.9a.1> (git worktree add <ordner> ${BASIS})`);
  else {
    const dateien = ['js/audio.js', 'js/umgebung.js', 'js/musik.js', 'js/musikstueck.js', 'js/tonfahrt.js', 'js/physics.js', 'js/getriebe.js', 'js/fahrprofil.js',
      'js/autos.js', 'js/car.js', 'js/track.js', 'js/netz.js', 'js/tacho.js', 'js/minimap.js', 'js/pacenotes.js', 'js/pacenotesbild.js', 'js/vergleich.js', 'js/garage.js',
      'js/bestzeiten.js', 'js/menue.js', 'js/input.js', 'js/touchbild.js', 'js/rennablauf.js', 'js/pacenotes-tempo.js', 'js/abkuerzungen.js', 'tools/schneiden-zeiten.json',
      'index.html', 'css/style.css', 'manifest.webmanifest'];
    const geaendert = dateien.filter((d) => spawnSync('git', ['diff', '--quiet', BASIS, '--', d], { cwd: WURZEL }).status !== 0);
    melde(geaendert.length === 0, `${dateien.length} Dateien (Ton, Physik, Getriebe, Autos, Strecke, Tacho, Minimap, Pace-Notes, Menü-Baustein, Eingabe, Bestzeiten, Seite …) unverändert seit 0.9a.1${geaendert.length ? `; geändert: ${geaendert.join(', ')}` : ''}`);
    // config.js: geändert nur Version und Kommentare (schulterR, Haptik); alles andere nur neu dazu
    const diff = spawnSync('git', ['diff', '-U0', BASIS, '--', 'js/config.js'], { cwd: WURZEL, encoding: 'utf8' }).stdout;
    const entfernt = diff.split('\n').filter((z) => z.startsWith('-') && !z.startsWith('---'));
    const fremd = entfernt.filter((z) => !/VERSION|schulterR: \[80, 44\]|Haptik \(Meilenstein 9a\.1|Zahlen = Millisekunden vibrieren/.test(z));
    melde(fremd.length === 0, `js/config.js: ersetzt nur Version und 3 Kommentarzeilen (${entfernt.length} Zeilen), neu: knopfGroessen, hud.groesse, Standardwerte${fremd.length ? `; fremd: ${fremd.slice(0, 3).join(' | ')}` : ''}`);
    const args = ['--nur', 'a,h,i', '--alt', ALT, ...(process.argv.includes('--lang') ? ['--lang'] : [])];
    const geaenderteDateien = () => new Set(spawnSync('git', ['diff', '--name-only'], { cwd: WURZEL, encoding: 'utf8' }).stdout.split('\n').filter(Boolean));
    const vorher = geaenderteDateien();
    const r = werkzeug('m8g-test.mjs', args);
    fs.writeFileSync(path.join(LOG, 'm8g-test.log'), r.text);
    const z = r.text.split('\n').filter((x) => /^\s*(ok|FEHLER)\s/.test(x));
    for (const x of z) melde(/^\s*ok/.test(x), `m8g-test: ${x.replace(/^\s*(ok|FEHLER)\s+/, '').replace(/0\.8f/g, '0.9a.1 (--alt)').replace(/Bildzeit im Spiel 0\.8g/, 'Bildzeit im Spiel 0.9a.2')}`);
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
    melde(med('neu') - med('alt') <= 30, `Ladezeit (Median aus 9): 0.9a.1 ${med('alt')} ms, 0.9a.2 ${med('neu')} ms (${med('neu') - med('alt') >= 0 ? '+' : ''}${med('neu') - med('alt')} ms, höchstens +30; Streuung ca. ±100)`);
    const neuGeaendert = [...geaenderteDateien()].filter((d) => !vorher.has(d) && /^(screenshots|tools)\//.test(d));
    if (neuGeaendert.length) spawnSync('git', ['checkout', '--', ...neuGeaendert], { cwd: WURZEL });
    info(`von den alten Tests geänderte Messdateien zurückgesetzt: ${neuGeaendert.length}`);
  }
}
if (teil('v')) {
  console.log('(v) Tests von M9a und M9a.1 (Touch-Teile, ohne Vergleich gegen ältere Stände)');
  for (const [datei, nur] of [['m9a-test.mjs', 'a,b,c,d,e,f,g,h,i,j,k,m,n'], ['m9a1-test.mjs', 'a,b,c,e,f,g,h,i,j,k,m,n,o,p,r']]) {
    const r = werkzeug(datei, ['--nur', nur]);
    fs.writeFileSync(path.join(LOG, datei.replace('.mjs', '.log')), r.text);
    const z = r.text.split('\n').filter((x) => /^\s*(ok|FEHLER)\s/.test(x));
    const rot = z.filter((x) => /FEHLER/.test(x));
    melde(r.code === 0 && z.length > 20, `${datei} --nur ${nur}: ${z.length - rot.length} ok, ${rot.length} rot${rot.length ? ` – ${rot.slice(0, 3).map((x) => x.trim().slice(0, 160)).join(' | ')}` : ''}`);
  }
}


console.log(fehler ? `\n${fehler} FEHLER` : '\nalles ok');
process.exit(fehler ? 1 : 0);
