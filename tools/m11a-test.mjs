// Meilenstein 11a prüfen:  node tools/m11a-test.mjs [--alt <ordner 0.10d>] [--nur a,b,...] [--lang]
// (0.10d: git worktree add <ordner> 40c41f3). Alles in Chromium (Playwright, Software-Grafik), kein echtes Handy, kein
// Gamepad, Ton nur gemessen (nicht gehört). Vorlage: tools/m10d-test.mjs.
//   Teil A – Kleinigkeiten aus M10d: (a) Zielbildschirm passt ohne Rollen (alle Fenstergrössen, Alpen und Finnland, Reserve),
//       (b) die zwei umgestellten Alt-Tests (pacenotes 981 m, menue Credits) sind grün
//   Teil B – Schnee und Eis: (d) Bremsweg, (e) Allrad vorn, (f) kein Escorta-Bonus, (g) Schotter/Asphalt bit-gleich,
//       (h) Schneewall, (i) Kurven-Vergleich Schneewall, (j) Ton
//   Teil C – Gletscher: (k) Prüfer, (l) Länge/Anteile, (m) Testfahrer, (n) Abkürzung/Hang, (o) Kontrast, (p) Kurven-Vergleich,
//       (q) Sprünge, (r) nicht beim Start geladen, (s) Bildzeit
//   Teil D – (t) Etappenwahl, (u) Bestzeiten, (v) Demo, Unveränderlich (x), (zz) nur mit --lang: frühere Tests (einmal)

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { starteSpiel, WURZEL } from './spiel-browser.mjs';

const arg = (name) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : null; };
const NUR = arg('--nur') ? arg('--nur').split(',') : null;
const teil = (k) => !NUR || NUR.includes(k);
const ALT = arg('--alt') ? path.resolve(arg('--alt')) : null; // 0.10d
let fehler = 0;
const ergebnisse = [];
let aktuell = null;
const titel = (t) => { console.log(t); aktuell = { titel: t, ok: 0, rot: 0 }; ergebnisse.push(aktuell); };
const melde = (ok, text) => { console.log(`${ok ? '  ok  ' : 'FEHLER'} ${text}`); if (!ok) fehler++; if (aktuell) aktuell[ok ? 'ok' : 'rot']++; };
const info = (text) => console.log(`       ${text}`);
const LOG = '/tmp/m11a';
fs.mkdirSync(LOG, { recursive: true });
const werkzeug = (name, argumente = [], wurzel = WURZEL, timeout = 3 * 3600000) => {
  const r = spawnSync(process.execPath, [path.join(wurzel, 'tools', name), ...argumente], { encoding: 'utf8', timeout, maxBuffer: 64 * 1024 * 1024, cwd: wurzel });
  return { code: r.status, text: `${r.stdout || ''}${r.stderr || ''}` };
};
const AUTOS = process.env.M11A_AUTOS ? process.env.M11A_AUTOS.split(',') : ['rt4', 'delto', 'escorta', 'l073', 'imprexa'];
if (!ALT) info('Vergleiche gegen 0.10d nur mit --alt <ordner> (git worktree add <ordner> 40c41f3)');

// Spiel öffnen
async function oeffne(wurzel, adresse = '', { auto, breite = 640, hoehe = 360, geraet, speicher = null } = {}) {
  const s = await starteSpiel({ wurzel, breite, hoehe, ...(auto ? { auto } : {}), ...(geraet ? { geraet } : {}) });
  s.fehler = [];
  s.page.on('pageerror', (e) => s.fehler.push(String(e.message || e)));
  if (speicher) await s.page.addInitScript((sp) => { localStorage.clear(); for (const [k, v] of Object.entries(sp)) localStorage.setItem(k, v); }, speicher);
  await s.page.goto(`${s.url}/index.html${adresse}`);
  await s.page.waitForFunction(() => window.__alpineRally || window.__fehlerseite, null, { timeout: 120000, polling: 100 });
  return s;
}
// höchstens n Aufgaben gleichzeitig (Browser je Aufgabe)
async function parallel(aufgaben, n = 3) {
  const out = new Array(aufgaben.length); let i = 0;
  await Promise.all(Array.from({ length: n }, async () => { while (i < aufgaben.length) { const k = i++; out[k] = await aufgaben[k](); } }));
  return out;
}
const FENSTER = [[402, 874, true], [874, 402, true], [640, 360, false], [640, 360, true], [1280, 720, false]];
const TOUCH = { hasTouch: true, isMobile: true, deviceScaleFactor: 1 };

// ===================================================================== Teil A
// (a) Zielbildschirm im ungünstigsten Fall: beide Platz-Zeilen, NICHT GESPEICHERT, Sprung-Zeilen mit REKORD, alle
// Zwischenzeiten mit Unterschied; dazu "vorsorglich": so viele Pixel bleiben frei (Ziel: 2 bis 3 Zeilen à 9 Pixel)
const ZIEL_VOLL = async ([sprache, mehrCps]) => {
  const A = window.__alpineRally, TX = await import('/js/texte.js');
  TX.setzeSprache(sprache);
  const n = A.checkpoints.length + mehrCps, cps = Array.from({ length: n }, (_, i) => 30 + 40 * i);
  const voll = {
    zeit: 199.99, cps, auto: 'imprexa', aufpralle: 12, resets: 3, hoechstTempo: 52.7,
    platz: 2, anzahl: 2, bisher: { zeit: 188.88, cps: cps.map((c) => c - 0.5) }, gespeichert: false, neueBest: false,
    gesamtPlatz: 3, gesamtBisher: { zeit: 150 }, gesamtRekord: false,
    spruenge: { anzahl: 4, weitester: 38.4, hoechster: 3.2, laengste: 1.8, rekord: true, ersterRekord: false, rekordBisher: 30 },
  };
  A.lauf.ergebnis = voll;
  if (A.ablauf.zustand !== 'ziel') {
    // wie m8h-test: kurz vor dem Ziel einsetzen, über die Linie rollen, bis der Zielbildschirm kommt
    const L = { gas: 0, bremse: 0, lenkung: 0, handbremse: false, reset: false, debug: false, notes: false };
    const erg = A.lauf.ergebnis;
    A.anhalten = true; A.start({ countdown: false }); A.setzeAuf(A.strecke.zielS - 30);
    const p = A.physik; p.vx = Math.sin(p.richtung) * 20; p.vz = Math.cos(p.richtung) * 20; p.vVor = 20;
    A.rennen.zustand = 'laeuft'; A.rennen.zwischenzeiten = cps.slice(); A.rennen.naechsterCp = A.checkpoints.length;
    for (let k = 0; k < 2000 && A.rennen.zustand !== 'ziel'; k++) A.physikSchritt(A.SCHRITT, { ...L, gas: 0.5 });
    A.rennen.endZeit = 199.99; A.rennen.zeit = 199.99; A.rennSchritt(A.SCHRITT, L);
    for (let k = 0; A.ablauf.zustand !== 'ziel' && k < 5000; k++) A.rennSchritt(A.SCHRITT, L);
    A.lauf.ergebnis = erg;
  }
  A.menue.neuZeichnen();
  await new Promise((ok) => requestAnimationFrame(() => requestAnimationFrame(ok)));
  const m = A.menue.rollen, tr = A.menue.treffer.map((t) => [t.x, t.y, t.b, t.h]);
  let ueber = 0;
  for (let i = 0; i < tr.length; i++) for (let j = i + 1; j < tr.length; j++) { const [ax, ay, ab, ah] = tr[i], [bx, by, bb, bh] = tr[j]; if (ax < bx + bb && bx < ax + ab && ay < by + bh && by < ay + ah) ueber++; }
  const out = { cps: n, x: Math.round((320 - m.breite) / 2), y: m.y0, b: m.breite, h: m.hoehe, rollen: m.max, gesamt: m.gesamt, sichtH: m.sichtH, ueber };
  TX.setzeSprache('de');
  return out;
};

if (teil('a')) {
  titel('(a) Zielbildschirm passt ohne Rollen (ungünstigster Fall, alle Fenstergrössen, Alpen und Finnland, de/en)');
  for (const strecke of ['alpen', 'finnland']) {
    const zeilen = [];
    let ok = true, reserve = Infinity;
    for (const [b, h, touch] of FENSTER) {
      const s = await oeffne(WURZEL, `?strecke=${strecke}&menue=aus`, { breite: b, hoehe: h, ...(touch ? { geraet: TOUCH } : {}) });
      for (const sp of ['de', 'en']) {
        const r = await s.page.evaluate(ZIEL_VOLL, [sp, 0]);
        const passt = r.rollen === 0 && r.x >= 0 && r.y >= 0 && r.x + r.b <= 320 && r.y + r.h <= 180 && r.ueber === 0;
        ok = ok && passt; reserve = Math.min(reserve, r.sichtH - r.gesamt + (180 - 8 - r.h));
        if (!passt || (sp === 'de' && b === 640 && !touch)) zeilen.push(`${b}x${h}${touch ? ' Touch' : ''} ${sp}: ${r.cps} CP, Tafel ${r.b}x${r.h} bei ${r.x},${r.y}, Inhalt ${r.gesamt} px${r.rollen ? `, ROLLT ${r.rollen}` : ''}${r.ueber ? `, ${r.ueber} Überlappungen` : ''}`);
      }
      // ein Bild (Alpen, 640x360, deutsch, nur die Tafel) zur Sichtprüfung
      if (strecke === 'alpen' && b === 640 && !touch) {
        const r = await s.page.evaluate(ZIEL_VOLL, ['de', 0]);
        fs.mkdirSync(path.join(WURZEL, 'screenshots/m11a'), { recursive: true });
        await s.page.screenshot({ path: path.join(WURZEL, 'screenshots/m11a/04-zielbildschirm.png'), clip: { x: r.x * 2, y: r.y * 2, width: r.b * 2, height: r.h * 2 } });
      }
      // vorsorglich: mit 2 Zwischenzeiten mehr (= 1 Zeile, zweispaltig) passt es noch?
      if (b === 640 && !touch) {
        const r = await s.page.evaluate(ZIEL_VOLL, ['de', 2]);
        zeilen.push(`mit ${r.cps} CP (vorsorglich): Inhalt ${r.gesamt} px${r.rollen ? `, ROLLT ${r.rollen}` : ', rollt nicht'}`);
        ok = ok && r.rollen === 0;
      }
      melde(s.fehler.length === 0, `${strecke} ${b}x${h}: Konsole ohne Fehler (${s.fehler.join(' | ').slice(0, 200)})`);
      await s.schliessen();
    }
    melde(ok && reserve >= 18, `${strecke}: nirgends gerollt, Tafel im Bild, nichts überlappt; frei im ungünstigsten Fall ${reserve} px (Ziel ≥ 18 = 2 Zeilen); ${zeilen.join('; ')}`);
  }
}

// (b) die zwei umgestellten Alt-Tests (begründet im Bericht): pacenotes-test (c) und menue-test (j)
if (teil('b')) {
  titel('(b) umgestellte Alt-Tests: pacenotes-test (Messfahrt ohne Wand-Strafe), menue-test (Credits aus config.js)');
  for (const [datei, muster] of [['pacenotes-test.mjs', /\(c\)/], ['menue-test.mjs', /Deutsch: MITWIRKENDE|Englisch: CONTRIBUTORS/]]) {
    const r = werkzeug(datei);
    fs.writeFileSync(path.join(LOG, datei.replace('.mjs', '.log')), r.text);
    const z = r.text.split('\n').filter((x) => muster.test(x));
    const rot = r.text.split('\n').filter((x) => /^\s*FEHLER/.test(x));
    melde(z.length >= 2 && z.every((x) => /^\s*(ok|OK)\s/.test(x)) && rot.length === 0, `${datei}: ${z.map((x) => x.trim().slice(0, 110)).join(' | ')}; rot insgesamt ${rot.length}`);
  }
}

// ===================================================================== Zusammenfassung
console.log('\n| Test | Ergebnis |\n|---|---|');
for (const e of ergebnisse) console.log(`| ${e.titel.slice(0, 120)} | ${e.rot ? `**${e.rot} rot**, ${e.ok} ok` : `grün (${e.ok} ok)`} |`);
console.log(fehler ? `\n${fehler} FEHLER` : '\nAlle Prüfungen bestanden.');
process.exit(fehler ? 1 : 0);
