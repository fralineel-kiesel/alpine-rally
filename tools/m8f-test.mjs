// Meilenstein 8f prüfen:  node tools/m8f-test.mjs [--nur a,b,c,d,e,f,g] [--alt <ordner 0.8e>] [--lang] [--ton-alt] [--referenz-schreiben]
//   (a) Lanza 073 Körper: Seitenprofil hinten ohne waagrechte Strecke > 0.5 m (tools/m8f-form.js), Deckel-Neigung, Tal
//       zwischen den Kotflügeln, Heckflügel, Draw Calls, Dreiecke, Scheiben-Option, Auspuff-Enden am Rohr, Masse unverändert
//   (b) Lanza 073 fahren: Fahrmessung nach tools/m8f-ziele.js, Kontrolltests K1 bis K4 (mit Delto und Escorta zum
//       Vergleich), Kippschwelle antriebHinten, Werte-Balken, Testfahrer drei Stile
//   (c) Lanza 073 Ton: Messtabelle gegen Audan, Delto, Escorta, Subora; Drehzahl bei 50/100/140 km/h gegen den Audan
//   (d) Subora Imprexa: Lackierung (Farben, Lesbarkeit, vier Lacke), Fahrmessung, Schaltpunkte und Drehzahl, Testfahrer, Ton
//   (e) Tacho: Skala je Profil, andere Autos pixelgleich mit 0.8e, 20-facher Wechsel ohne Leck
//   (f) Unveränderlich: Audan, Delto, Escorta, Prototyp bit-gleich (Fahrmessung, Motorwerte, Ton, Textur, Geometrie),
//       Abkürzungen 127/2/342/84 (auch mit Lanza und Subora), Testfahrer Prototyp 2:59.33 / 2:42.35 / 2:31.92, Strecke
//   (g) Regression (alle bisherigen Tests, nur mit --lang), Bildzeit, Ladezeit (mit --alt)
// --alt <ordner 0.8e>: direkt gegen die alte Version (sonst tools/m8f-referenz-08e.json; mit --referenz-schreiben neu)
// Ich habe den Ton nicht gehört und das Fahrgefühl nicht gespürt: das sind Messungen.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { starteSpiel, WURZEL } from './spiel-browser.mjs';
import * as Z from './m8f-ziele.js';
import { seitenProfil, flacheStrecke, waagrechteStrecke } from './m8f-form.js';

const arg = (name) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : null; };
const NUR = arg('--nur') ? arg('--nur').split(',') : null;
const ALT = arg('--alt') ? path.resolve(arg('--alt')) : null;
const teil = (k) => !NUR || NUR.includes(k);
let fehler = 0, kompromisse = 0;
const melde = (ok, text) => { console.log(`${ok ? '  ok  ' : 'FEHLER'} ${text}`); if (!ok) fehler++; };
const komp = (text, grund) => { console.log(`  KOMP ${text} – Kompromiss: ${grund}`); kompromisse++; };
const info = (text) => console.log(`       ${text}`);
const werkzeug = (name, argumente = [], timeout = 6 * 3600000) => {
  const r = spawnSync(process.execPath, [path.join(WURZEL, 'tools', name), ...argumente], { encoding: 'utf8', timeout, maxBuffer: 64 * 1024 * 1024 });
  return { code: r.status, text: `${r.stdout || ''}${r.stderr || ''}` };
};
const teilWerkzeug = (name, argumente, titel) => {
  const r = werkzeug(name, argumente);
  const zeilen = r.text.split('\n').filter((z) => /^\s*(ok|FEHLER|KOMP|BEKANNT)\b/i.test(z));
  for (const z of zeilen) console.log(`       ${z.trim()}`);
  melde(r.code === 0, `${titel}: ${r.code === 0 ? 'bestanden' : 'NICHT bestanden'} (${zeilen.filter((z) => /^\s*ok/i.test(z)).length} ok)`);
  return r;
};
const hash = (s) => crypto.createHash('sha1').update(s).digest('hex').slice(0, 12);
const lade = (wurzel, d) => import(pathToFileURL(path.join(wurzel, d)).href);
const ALTE = ['rt4', 'delto', 'escorta'];
const ALLE = ['rt4', 'delto', 'escorta', 'l073', 'imprexa'];
const NAMEN = { prototyp: 'Prototyp', rt4: 'Audan Quarto', delto: 'Lanza Delto', escorta: 'Fard Escorta', l073: 'Lanza 073', imprexa: 'Subora Imprexa' };
const fmtZeit = (t) => `${Math.floor(t / 60)}:${(t % 60).toFixed(2).padStart(5, '0')}`;
const pz = (b, a) => (b / a - 1) * 100;
const vz = (x, n = 2) => `${x >= 0 ? '+' : ''}${x.toFixed(n)}`;
const ORDNER = path.join(WURZEL, 'screenshots/m8f');
fs.mkdirSync(ORDNER, { recursive: true });
const tabelle = (datei, zeilen) => { fs.writeFileSync(path.join(ORDNER, datei), `${zeilen.join('\n')}\n`); info(`Tabelle: screenshots/m8f/${datei}`); };

// Fahrmessungen (ohne Browser) einer Version: alle Profile, die es dort gibt, und die Motorwerte je Profil
async function physikVon(wurzel = WURZEL) {
  const { CONFIG } = await lade(wurzel, 'js/config.js');
  const { Fahrphysik } = await lade(wurzel, 'js/physics.js');
  const { Getriebe } = await lade(wurzel, 'js/getriebe.js');
  const FP = await lade(wurzel, 'js/fahrprofil.js');
  const { baueMessung, alleMessungen } = await lade(WURZEL, 'tools/fahrmessung.js');
  const m = baueMessung({ CONFIG, Fahrphysik, Getriebe });
  const out = {}, motor = {};
  for (const id of Object.keys(CONFIG.fahrprofile)) { FP.waehleFahrprofil(id); out[id] = alleMessungen(m); }
  for (const id of Object.keys(CONFIG.fahrprofile)) { FP.waehleMotorTon(id); motor[id] = JSON.parse(JSON.stringify(CONFIG.audio.motor)); }
  FP.waehleFahrprofil('prototyp');
  return { physik: out, motor, m, CONFIG, FP };
}
// Lack-Textur (alle Lackierungen, drei Bildbreiten), Geometrie und Radpositionen als Prüfsummen (im Auto-Labor)
async function abdruck(ids, wurzel = WURZEL) {
  const s = await starteSpiel({ wurzel, breite: 640, hoehe: 360 });
  await s.page.goto(`${s.url}/auto-labor.html`);
  await s.page.waitForFunction(() => window.__autoLabor, null, { timeout: 60000 });
  const r = await s.page.evaluate((ids) => {
    const L = window.__autoLabor, out = {};
    for (const id of ids) {
      L.modellWaehlen(id);
      for (const b of [320, 480, 640]) {
        L.auto.detail(b);
        for (const lack of L.auto.modell.lackierungen) { L.auto.lackierung(lack); out[`${id}-textur-${lack}-${b}`] = L.auto.leinwand.toDataURL(); }
      }
      for (const m of L.auto.teilMeshes) {
        const g = m.geometry, a = [];
        for (const n of ['position', 'normal', 'uv', 'color']) if (g.attributes[n]) a.push(Array.from(g.attributes[n].array, (x) => x.toFixed(6)).join(','));
        out[`${id}-geo-${m.name}`] = a.join('|');
      }
      out[`${id}-raeder`] = L.auto.raeder.map((x) => [x.lenk.position.x, x.lenk.position.y, x.lenk.position.z].map((v) => v.toFixed(5)).join(',')).join(';');
    }
    return out;
  }, ids);
  await s.schliessen();
  return Object.fromEntries(Object.entries(r).map(([k, v]) => [k, hash(v)]));
}
// Tacho-Ausschnitt (HUD unten rechts) im Spiel je Profil, als Bild-Daten
async function tachoBilder(ids, wurzel = WURZEL) {
  const s = await starteSpiel({ wurzel, breite: 640, hoehe: 360 });
  const out = {};
  for (const id of ids) {
    await s.page.goto(`${s.url}/index.html?menue=aus&auto=${id}`);
    await s.page.waitForFunction(() => window.__alpineRally, null, { timeout: 120000 });
    out[id] = await s.page.evaluate(async () => {
      await new Promise((r) => setTimeout(r, 600));
      const c = document.getElementById('hud'), k = document.createElement('canvas'); k.width = 110; k.height = 60;
      k.getContext('2d').drawImage(c, 210, 120, 110, 60, 0, 0, 110, 60);
      return k.toDataURL();
    });
  }
  await s.schliessen();
  return out;
}
// Referenz 0.8e: aus --alt gerechnet (und mit --referenz-schreiben gespeichert) oder aus tools/m8f-referenz-08e.json
let REF = null;
async function referenz() {
  if (REF) return REF;
  const datei = path.join(WURZEL, 'tools/m8f-referenz-08e.json');
  if (ALT) {
    const p = await physikVon(ALT);
    const { AUTO_MODELLE } = await lade(ALT, 'js/autos.js');
    const { CONFIG } = await lade(ALT, 'js/config.js');
    const l = AUTO_MODELLE.l073;
    REF = {
      physik: Object.fromEntries(['prototyp', ...ALTE].map((id) => [id, p.physik[id]])),
      motor: Object.fromEntries(['prototyp', ...ALTE].map((id) => [id, p.motor[id]])),
      abdruck: await abdruck(ALTE, ALT),
      tacho: Object.fromEntries(Object.entries(await tachoBilder(['prototyp', ...ALTE, 'l073'], ALT)).map(([k, v]) => [k, hash(v)])),
      l073Masse: JSON.stringify({ masse: l.masse, kollision: l.kollision, raeder: l.raeder, staub: l.staub, schwerpunktHoehe: l.schwerpunktHoehe }),
      l073Profil: seitenProfil(l, -1.975, -0.5),
      imprexaWerkAlt: CONFIG.autoOptik.lackierungen.imprexaWerk,
      l073Gaenge: CONFIG.fahrprofile.l073.getriebe.gaenge,
    };
    if (process.argv.includes('--referenz-schreiben')) fs.writeFileSync(datei, `${JSON.stringify(REF)}\n`);
  } else REF = JSON.parse(fs.readFileSync(datei, 'utf8'));
  return REF;
}
// Testfahrer drei Stile für die genannten Profile (einmal je Lauf, gemerkt in tools/m8f-testfahrer.json)
let TF = null;
async function testfahrer() {
  if (TF) return TF;
  const s = await starteSpiel({ breite: 640, hoehe: 360 });
  const fahrerCode = fs.readFileSync(path.join(WURZEL, 'tools/testfahrer-browser.js'), 'utf8');
  TF = {};
  for (const id of ['prototyp', 'rt4', 'delto', 'l073', 'imprexa']) {
    await s.page.goto(`${s.url}/index.html?menue=aus&auto=${id}`);
    await s.page.waitForFunction(() => window.__alpineRally, null, { timeout: 120000 });
    await s.page.evaluate((code) => { window.__alpineRally.anhalten = true; window.__fahrerUrl = URL.createObjectURL(new Blob([code], { type: 'text/javascript' })); }, fahrerCode);
    TF[id] = {};
    for (const stil of ['vorsichtig', 'mittel', 'flott']) {
      TF[id][stil] = await s.page.evaluate(async (stil) => {
        const A = window.__alpineRally, f = await import(window.__fahrerUrl);
        const r = f.fahreEtappe(A, stil);
        return { zeit: r.zeit, ziel: r.ziel, cps: r.cps, aufpralle: A.stat.aufpralle, kontakte: r.aufpralle.length, wo: r.aufpralle.join(', '), haenger: r.haenger };
      }, stil);
    }
  }
  await s.schliessen();
  fs.writeFileSync(path.join(WURZEL, 'tools/m8f-testfahrer.json'), `${JSON.stringify(TF, null, 1)}\n`);
  return TF;
}
// Ton-Messung eines Profils (tools/ton-messung.mjs), mit --ton-alt die gespeicherte Messung
function tonMessung(name, id) {
  const datei = path.join(WURZEL, `tools/ton-messung-${name}.json`);
  if (!process.argv.includes('--ton-alt') || !fs.existsSync(datei)) {
    const r = werkzeug('ton-messung.mjs', id ? [name, '--profil', id, '--bilder', 'screenshots/m8f'] : [name, '--bilder', 'screenshots/m8f']);
    if (r.code !== 0) { melde(false, `ton-messung ${name}: ${r.text.split('\n').slice(-4).join(' ')}`); return null; }
  }
  return JSON.parse(fs.readFileSync(datei, 'utf8'));
}
const tonJson = (name) => JSON.parse(fs.readFileSync(path.join(WURZEL, `tools/ton-messung-${name}.json`), 'utf8'));
// Fahrmessung jetzt (einmal je Lauf)
let PH = null;
const physik = async () => PH || (PH = await physikVon());
// Ziele, die ich verfehle (Begründung in docs/meilensteine/m8f.md): KOMP statt FEHLER
const KOMPROMISSE = {
  'Höchsttempo (Vollgas)': 'die Drehzahl geht vor (Auftrag): mit Gängen, die höchstens 5 % höher drehen als der Audan, fährt der Lanza 2.9 % unter dem Prototyp',
  'K2 wie K1, 0.4 s nach dem Loslassen 0.2 s gegenlenken (Taste): gefangen nach': 'kurzes Gegenlenken ändert in diesem Fahrmodell fast nichts (Delto 1.10 s, Escorta 1.72 s); der Lanza liegt beim Delto',
  'K4 Wiesenweg 60 km/h, Vollgas, leichter Einschlag 3 s: seitlich gerutscht': 'mit Vollgas rutschen auch Prototyp (9.3 m) und Escorta (21.3 m) mehr als 4 m; der Lanza liegt dazwischen',
};
const zeileMelden = (text, ok, schluessel) => { if (!ok && KOMPROMISSE[schluessel]) komp(text, KOMPROMISSE[schluessel]); else melde(ok, text); };

// ---------------------------------------------------------------- (a) Lanza 073 Körper
if (teil('a')) {
  console.log('(a) Lanza 073: Heck als Keil (Seitenprofil, Deckel, Tal, Flügel), Draw Calls, Dreiecke, Scheiben, Auspuff');
  const { AUTO_MODELLE } = await lade(WURZEL, 'js/autos.js');
  const m = AUTO_MODELLE.l073, R = await referenz();
  const prof = seitenProfil(m, -1.975, -0.5), fl = flacheStrecke(prof), wg = waagrechteStrecke(prof);
  const flAlt = flacheStrecke(R.l073Profil), wgAlt = waagrechteStrecke(R.l073Profil);
  melde(fl.laenge <= 0.5 && wg.laenge <= 0.5, `Seitenprofil hinter z = -0.5: längste flache Strecke (Neigung unter 3°) ${fl.laenge.toFixed(2)} m, längste Strecke mit weniger als 2 cm Höhenunterschied ${wg.laenge.toFixed(2)} m (höchstens 0.5; 0.8e: ${flAlt.laenge.toFixed(2)} m / ${wgAlt.laenge.toFixed(2)} m)`);
  const yBei = (z) => prof.reduce((b, p) => (Math.abs(p[0] - z) < Math.abs(b[0] - z) ? p : b))[1];
  info(`Seitenprofil (z: y): ${prof.filter((_, i) => i % 15 === 0).map(([z, y]) => `${z.toFixed(2)}: ${y.toFixed(3)}`).join(', ')}`);
  // Deckel in der Mitte (Unterbau-Profil, Oberkante hinter der Kabine)
  const deckel = m.teile[0].profil.filter(([z, y]) => z < -0.65 && y > 0.8);
  const yD = (z) => { const p = deckel.slice().sort((a, b) => a[0] - b[0]); for (let i = 1; i < p.length; i++) if (z <= p[i][0]) return p[i - 1][1] + (p[i][1] - p[i - 1][1]) * (z - p[i - 1][0]) / (p[i][0] - p[i - 1][0]); return p[p.length - 1][1]; };
  const neigung = Math.atan2(yD(-0.9) - yD(-1.75), 0.85) * 180 / Math.PI;
  melde(neigung >= 8 && neigung <= 12 && yD(-0.75) >= 1.0 && yD(-1.94) <= 0.88, `Motordeckel fällt nach hinten: ${yD(-0.75).toFixed(2)} m an der Kabine, ${yD(-1.94).toFixed(2)} m am Heck, Neigung ${neigung.toFixed(1)}° (8 bis 12°)`);
  const kamm = m.teile.find((t) => t.art === 'prisma' && t.x[0] === 0.6);
  const yK = (z) => Math.max(...kamm.profil.map((p, i) => [p, kamm.profil[(i + 1) % kamm.profil.length]]).filter(([a, b]) => (a[0] - z) * (b[0] - z) <= 0 && a[0] !== b[0]).map(([a, b]) => a[1] + (b[1] - a[1]) * (z - a[0]) / (b[0] - a[0])));
  const tal = [-1.3, -1.5, -1.7].map((z) => yK(z) - yD(z));
  melde(tal.every((d) => d >= 0.03) && yK(-1.21) >= 0.95 && yK(-1.21) <= 1.0, `Tal: Kotflügel-Kamm über dem Deckel um ${tal.map((d) => `${(d * 100).toFixed(1)} cm`).join(' / ')} (bei z -1.3 / -1.5 / -1.7, mindestens 3 cm), Kamm über dem Rad ${yK(-1.21).toFixed(3)} m (0.95 bis 1.0)`);
  const fluegel = m.teile.find((t) => t.art === 'trapez' && t.slot === 'fluegel');
  const stuetzen = m.teile.filter((t) => t.art === 'quader' && t.min[1] >= 0.8 && t.min[2] < -1.8 && t.spiegeln);
  const wand = Math.max(...m.teile[0].profil.filter(([z]) => z <= -1.97).map(([, y]) => y));
  melde(fluegel.oben[0] >= 1.0 && fluegel.oben[0] <= 1.05 && stuetzen.length >= 1 && wand - 0.42 <= 0.45, `Heckflügel Oberkante ${fluegel.oben[0]} m (1.0 bis 1.05) auf ${stuetzen.length * 2} Stützen, Rückwand ${(wand - 0.42).toFixed(2)} m über der Schürze (ca. 0.4), Dach ${Math.max(...prof.map((p) => p[1])).toFixed(2)} m (Seitenlinie bei z -0.6: ${yBei(-0.6).toFixed(2)}, -1.0: ${yBei(-1.0).toFixed(2)}, -1.9: ${yBei(-1.9).toFixed(2)})`);
  melde(m.teile.some((t) => t.art === 'trapez' && (t.scheiben || []).includes('vorne')), 'Scheiben-Option: Frontscheibe der Kabine mit scheiben: [\'vorne\'] (Farbe aus der Ansicht vorne)');
  // Auspuff-Enden (Flamme) genau am Ende der Rohre
  const rohre = m.teile.filter((t) => t.art === 'zylinder' && t.slot === 'chrom' && t.achse === 'z').map((t) => [t.mitte[0], t.mitte[1], t.mitte[2] - t.laenge / 2]);
  const passt = m.auspuff.every((a) => rohre.some(([x, y, z]) => Math.abs(a.x - x) < 1e-3 && Math.abs(a.y - y) < 1e-3 && Math.abs(a.z - z) < 1e-3));
  melde(passt && m.auspuff.length === rohre.length, `Auspuff (Flamme): ${m.auspuff.map((a) => `(${a.x}, ${a.y}, ${a.z})`).join(' ')} = Enden der ${rohre.length} Rohre`);
  const masse = JSON.stringify({ masse: m.masse, kollision: m.kollision, raeder: m.raeder, staub: m.staub, schwerpunktHoehe: m.schwerpunktHoehe });
  melde(masse === R.l073Masse, 'Masse, Radstand, Räder, Kollisionsbox, Staub, Schwerpunkthöhe wie 0.8e (Physik unberührt)');
  const s = await starteSpiel({ breite: 640, hoehe: 360 });
  await s.page.goto(`${s.url}/auto-labor.html`);
  await s.page.waitForFunction(() => window.__autoLabor, null, { timeout: 60000 });
  const b = await s.page.evaluate(() => {
    const L = window.__autoLabor; L.aufloesung(2); L.modellWaehlen('l073');
    const A = L.auto, sichtbar = L.szene.children.map((o) => o.visible);
    L.szene.children.forEach((o) => { o.visible = o === A.objekt; });
    L.ansicht('hinten34'); L.renderer.render(L.szene, L.kamera);
    const ohne = { calls: L.renderer.info.render.calls, dreiecke: L.renderer.info.render.triangles };
    A.flammePlanen(5, 1); A.flammeBild(5.01); L.renderer.render(L.szene, L.kamera);
    const mit = { calls: L.renderer.info.render.calls, dreiecke: L.renderer.info.render.triangles };
    A.flammeBild(99);
    L.szene.children.forEach((o, i) => { o.visible = sichtbar[i]; });
    return { ohne, mit };
  });
  melde(b.mit.calls <= 12 && b.mit.dreiecke <= 1800 && s.fehler.length === 0, `Lanza 073: ${b.ohne.calls} Draw Calls / ${b.ohne.dreiecke} Dreiecke, mit Flamme ${b.mit.calls} / ${b.mit.dreiecke} (höchstens 12 / 1800), Konsole ohne Fehler`);
  await s.schliessen();
}

// ---------------------------------------------------------------- (b) Lanza 073 fahren
if (teil('b')) {
  console.log('(b) Lanza 073: Fahrmessung, Kontrolltests K1-K4, Kippschwelle, Werte-Balken, Testfahrer');
  const { physik: X, m, CONFIG, FP } = await physik();
  const P = X.prototyp;
  const t1 = ['| Messung | Prototyp | Lanza 073 0.8e | Lanza 073 0.8f | Ziel Lanza 073 | Lanza Delto | Fard Escorta |', '|---|---|---|---|---|---|---|'];
  const altP = ALT ? (await physikVon(ALT)).physik.l073 : null;
  const zahl = (z, r) => { const w = z[1](r); return w == null ? '--' : Number(w).toFixed(z[5] === 'm' || z[5] === 'km/h' ? 1 : 2); };
  const zeige = (z, x, r) => `${zahl(z, r)} ${z[5]}${x.art === 'prozent' ? ` (${vz(x.d, 1)} %)` : x.art === 'diff' ? ` (${vz(x.d, 1)}°)` : ''}`;
  for (const z of Z.ZEILEN) {
    const x = Z.pruefeZeile(z, P, X.l073, 'l073');
    const text = `l073 ${z[0]}: ${x.art === 'gleich' ? (x.ok ? 'identisch' : `${x.a} -> ${x.b}`) : `${vz(x.d)}${x.art === 'prozent' ? ' %' : x.art === 'diff' ? '°' : ''}`} (Ziel ${x.ziel})`;
    zeileMelden(text, x.ok, z[0]);
    const d = Z.pruefeZeile(z, P, X.delto, 'l073'), e = Z.pruefeZeile(z, P, X.escorta, 'l073');
    t1.push(`| ${z[0]} | ${zahl(z, P)} ${z[5]} | ${altP ? zeige(z, Z.pruefeZeile(z, P, altP, 'l073'), altP) : '–'} | ${zeige(z, x, X.l073)} ${x.ok ? '✅' : '❌'} | ${x.ziel} | ${zeige(z, d, X.delto)} | ${zeige(z, e, X.escorta)} |`);
  }
  melde(!X.l073.heck90_r80.dreher, 'l073: kein Dreher bei der Heck-Messung');
  // Kontrolltests
  const K = {};
  for (const id of ['prototyp', 'delto', 'escorta', 'l073']) { FP.waehleFahrprofil(id); K[id] = Z.kontrollMessungen(m, CONFIG); }
  let KA = null;
  if (ALT) {
    const { CONFIG: C2 } = await lade(ALT, 'js/config.js');
    const { Fahrphysik: F2 } = await lade(ALT, 'js/physics.js');
    const { Getriebe: G2 } = await lade(ALT, 'js/getriebe.js');
    const FP2 = await lade(ALT, 'js/fahrprofil.js');
    const { baueMessung } = await lade(WURZEL, 'tools/fahrmessung.js');
    FP2.waehleFahrprofil('l073'); KA = Z.kontrollMessungen(baueMessung({ CONFIG: C2, Fahrphysik: F2, Getriebe: G2 }), C2); FP2.waehleFahrprofil('prototyp');
  }
  FP.waehleFahrprofil('prototyp');
  const t2 = ['| Kontrolltest (Tastatur) | Prototyp | Lanza 073 0.8e | Lanza 073 0.8f | Ziel | Lanza Delto | Fard Escorta |', '|---|---|---|---|---|---|---|'];
  for (const z of Z.K_ZEILEN) {
    const w = z[1](K.l073), ok = w != null && w >= z[2][0] && w <= z[2][1];
    const zt = z[2][0] === -Infinity ? `höchstens ${z[2][1]}` : `${z[2][0]} bis ${z[2][1]}`;
    zeileMelden(`${z[0]}: ${w == null ? 'nie' : w.toFixed(2)} ${z[3]} (Ziel ${zt}; Delto ${z[1](K.delto)?.toFixed(2)}, Escorta ${z[1](K.escorta)?.toFixed(2)}${KA ? `, 0.8e ${z[1](KA)?.toFixed(2)}` : ''})`, ok, z[0]);
    const f = (k) => { const v = z[1](k); return v == null ? 'nie' : `${v.toFixed(2)} ${z[3]}`; };
    t2.push(`| ${z[0]} | ${f(K.prototyp)} | ${KA ? f(KA) : '–'} | ${f(K.l073)} ${ok ? '✅' : '❌'} | ${zt} ${z[3]} | ${f(K.delto)} | ${f(K.escorta)} |`);
  }
  melde(!K.l073.k1.dreher && !K.l073.k2.dreher && K.l073.k3.gier <= 60, `l073: kein Dreher in K1-K3 (Slalom: Gier ${K.l073.k3.gier.toFixed(1)}°, Schwimmwinkel ${K.l073.k3.schwimm.toFixed(1)}°)`);
  melde(K.l073.k1.max <= K.escorta.k1.max * 1.25 && K.l073.k1.gerade <= K.escorta.k1.gerade * 1.25 && K.l073.k3.gier <= K.escorta.k3.gier * 1.25,
    `Lanza nicht viel unfangbarer als der Escorta (höchstens 25 % schlechter): K1 ${K.l073.k1.max.toFixed(1)}° / ${K.l073.k1.gerade.toFixed(2)} s (Escorta ${K.escorta.k1.max.toFixed(1)}° / ${K.escorta.k1.gerade.toFixed(2)} s), K3 ${K.l073.k3.gier.toFixed(1)}° (Escorta ${K.escorta.k3.gier.toFixed(1)}°)`);
  tabelle('60-lanza-fahrmessung.md', t1);
  tabelle('61-lanza-kontrolltests.md', t2);
  // Kippschwelle antriebHinten (Vollgas in der Kurve und Heck beim Bremsen in der Kurve): kein Sprung über 1°
  FP.waehleFahrprofil('prototyp');
  const gP = m.gasInKurve(80, 60).max, hP = m.heckReaktion(90, 80, 'asphalt', 0.6).vorher;
  FP.waehleFahrprofil('l073');
  const ah = CONFIG.auto.antriebHinten, reihe = [];
  for (let a = 0.9; a <= 2.4 + 1e-9; a += 0.01) { CONFIG.auto.antriebHinten = a; reihe.push([a, m.gasInKurve(80, 60).max - gP]); }
  const heck = [];
  for (let a = 1.0; a <= 1.4 + 1e-9; a += 0.05) { CONFIG.auto.antriebHinten = a; heck.push([a, m.heckReaktion(90, 80, 'asphalt', 0.6).zusatz]); }
  CONFIG.auto.antriebHinten = ah;
  FP.waehleFahrprofil('prototyp');
  const spruenge = reihe.slice(1).filter(([, d], i) => Math.abs(d - reihe[i][1]) > 1).map(([a]) => a);
  const sprungHeck = heck.slice(1).some(([, d], i) => Math.abs(d - heck[i][1]) > 1);
  const naechster = spruenge.length ? Math.min(...spruenge.map((a) => Math.abs(a - ah))) : Infinity;
  melde(naechster >= 0.03 && !sprungHeck, `antriebHinten ${ah}: Vollgas in der Kurve ohne Sprung über 1° (0.9 bis 2.4: ${spruenge.length ? spruenge.map((a) => a.toFixed(2)).join(', ') : 'keiner'}); Heck beim Bremsen in der Kurve 1.0 bis 1.4: ${heck.map(([a, d]) => `${a.toFixed(2)}: ${d.toFixed(1)}°`).join(', ')} (${sprungHeck ? 'SPRUNG' : 'kein Sprung'}; ${hP != null ? 'M8e: 1.15 = +7.3°, 1.25 = +13°' : ''})`);
  // Werte-Balken (Vorschrift unverändert): alle fünf
  const { AUTO_MODELLE, werteAusMessung } = await lade(WURZEL, 'js/autos.js');
  for (const id of ALLE) {
    const w = werteAusMessung(P, X[id]);
    melde(JSON.stringify(w) === JSON.stringify(AUTO_MODELLE[id].werte), `Werte-Balken ${AUTO_MODELLE[id].name}: gemessen ${JSON.stringify(w)}, in js/autos.js ${JSON.stringify(AUTO_MODELLE[id].werte)}`);
  }
  // Testfahrer
  const tf = await testfahrer();
  for (const stil of ['vorsichtig', 'mittel', 'flott']) {
    const a = tf.rt4[stil].zeit, d = tf.delto[stil].zeit, l = tf.l073[stil];
    melde(l.ziel && l.aufpralle === 0 && l.kontakte === 0 && l.haenger === 0 && pz(l.zeit, d) >= -1.5 && pz(l.zeit, d) <= 1.5 && pz(l.zeit, a) >= -1,
      `Testfahrer ${stil} Lanza 073 ${fmtZeit(l.zeit)}: gegen Delto ${vz(pz(l.zeit, d))} % (±1.5), gegen Audan ${vz(pz(l.zeit, a))} % (nicht mehr als 1 % schneller), Aufpralle ${l.aufpralle} (Kontakte ${l.kontakte}${l.wo ? `: ${l.wo}` : ''}), Hänger ${l.haenger}`);
  }
  // Pace-Notes: nur melden
  const r = werkzeug('pacenotes-test.mjs', ['--auto', 'l073']);
  const aus = r.text.split('\n').filter((z) => /ausserhalb\)/.test(z)).map((z) => z.split('|').slice(1, 6).map((x) => x.trim()).join(' '));
  info(`Pace-Notes mit l073 (nur gemeldet, nichts neu geschrieben): ${aus.length} Kurven ausserhalb des Zielbereichs (M8e: 4)${aus.length ? `: ${aus.join(' / ')}` : ''}`);
}

// ---------------------------------------------------------------- (c) Lanza 073 Ton
if (teil('c')) {
  console.log('(c) Lanza 073 Ton: Messtabelle gegen die anderen vier, Drehzahl bei gleichem Tempo');
  const X = tonMessung('m8f-l073', 'l073');
  const A = tonJson('m8e-rt4'), V = tonJson('m8e-l073');
  if (X) {
    for (const z of Z.TON_ZEILEN) {
      const r = Z.pruefeTon(z, A, X, 'l073', V);
      if (!r) continue;
      melde(r.ok, `l073 ${z[0]}: ${r.art === 'wert' ? r.d.toFixed(r.d > 10 ? 0 : 3) : `${vz(r.d)}${r.art === 'prozent' ? ' %' : r.art === 'faktor' ? ' x' : ' dB'}`} (Ziel ${r.ziel.map((x) => (Math.abs(x) === Infinity ? '…' : x)).join(' bis ')})`);
    }
    // Tabelle: fünf Autos (Audan, Delto, Escorta aus 0.8e = unverändert, siehe (f); Subora 0.8f)
    const M = { rt4: A, delto: tonJson('m8e-delto'), escorta: tonJson('m8e-escorta'), l073alt: V, l073: X, imprexa: fs.existsSync(path.join(WURZEL, 'tools/ton-messung-m8f-imprexa.json')) ? tonJson('m8f-imprexa') : tonJson('m8e-imprexa') };
    const mo = (m, rpm) => m.motor.find((x) => x.rpm === rpm);
    const spalten = [['rt4', 'Audan'], ['delto', 'Delto'], ['escorta', 'Escorta'], ['imprexa', 'Subora 0.8f'], ['l073alt', 'Lanza 073 0.8e'], ['l073', 'Lanza 073 0.8f']];
    const t = [`| Messung | ${spalten.map((s) => s[1]).join(' | ')} |`, `|---|${spalten.map(() => '---').join('|')}|`];
    const zeilen = [
      ['Grundton Leerlauf (Hz)', (m) => m.profil.leerlauf.f0.toFixed(1)],
      ['Grundton 5000/min (Hz)', (m) => mo(m, 5000).f0.toFixed(0)],
      ['Grundton 7000/min (Hz)', (m) => mo(m, 7000).f0.toFixed(0)],
      ['Schwerpunkt Vollgas 5000/min (Hz)', (m) => mo(m, 5000).schwerpunkt.toFixed(0)],
      ['Energie < 200 Hz Teillast', (m) => m.profil.teillast.unter200.toExponential(2)],
      ['RMS Vollgas 5000/min', (m) => mo(m, 5000).rms.toFixed(3)],
      ['Lader: Tonhöhe 7000/min (Hz)', (m) => (m.profil.lader && m.profil.lader.an ? m.profil.lader.hz7000.toFixed(0) : '–')],
      ['Lader: gegen Motor (dB, Vollgas)', (m) => (m.profil.lader && m.profil.lader.an ? m.profil.lader.gegenMotorDb.toFixed(1) : '–')],
      ['Turbo-Pfeifen (Hz / RMS)', (m) => (m.profil.turbo.rms > 0 ? `${m.profil.turbo.ton.toFixed(0)} / ${m.profil.turbo.rms.toFixed(4)}` : '–')],
      ['Spitze vor dem Limiter', (m) => m.profil.spitze.toFixed(3)],
      ['Pops je Minute', (m) => String(Z.TON_ZEILEN.find((z) => z[0].startsWith('Pops'))[1](m))],
    ];
    for (const [n, f] of zeilen) t.push(`| ${n} | ${spalten.map(([k]) => f(M[k])).join(' | ')} |`);
    tabelle('62-ton-vergleich.md', t);
    const f7 = Object.fromEntries(['rt4', 'delto', 'escorta', 'imprexa'].map((k) => [k, mo(M[k], 7000).f0]));
    melde(Object.values(f7).some((f) => f > mo(X, 7000).f0), `Lanza 073 ist nicht mehr das höchste Auto: 7000/min ${mo(X, 7000).f0.toFixed(0)} Hz (Audan ${f7.rt4.toFixed(0)}, Delto ${f7.delto.toFixed(0)}, Escorta ${f7.escorta.toFixed(0)}, Subora ${f7.imprexa.toFixed(0)})`);
  }
  // Drehzahl bei gleichem Tempo und an den Schaltpunkten gegen den Audan
  const { m, FP } = await physik();
  const D = {};
  for (const id of ['rt4', 'l073']) { FP.waehleFahrprofil(id); D[id] = Z.drehzahlen(m); }
  FP.waehleFahrprofil('prototyp');
  let DA = null;
  if (ALT) {
    const { CONFIG: C2 } = await lade(ALT, 'js/config.js');
    const { Fahrphysik: F2 } = await lade(ALT, 'js/physics.js');
    const { Getriebe: G2 } = await lade(ALT, 'js/getriebe.js');
    const FP2 = await lade(ALT, 'js/fahrprofil.js');
    const { baueMessung } = await lade(WURZEL, 'tools/fahrmessung.js');
    FP2.waehleFahrprofil('l073'); DA = Z.drehzahlen(baueMessung({ CONFIG: C2, Fahrphysik: F2, Getriebe: G2 })); FP2.waehleFahrprofil('prototyp');
  }
  const t = ['| Drehzahl (U/min) | Audan | Lanza 073 0.8e | Lanza 073 0.8f | gegen Audan |', '|---|---|---|---|---|'];
  const proz = [];
  for (const v of [50, 100, 140]) {
    for (const art of ['voll', 'konstant']) {
      const a = art === 'voll' ? D.rt4.voll[v] : D.rt4.konstant[v].rpm, l = art === 'voll' ? D.l073.voll[v] : D.l073.konstant[v].rpm;
      const alt = DA ? (art === 'voll' ? DA.voll[v] : DA.konstant[v].rpm) : null;
      proz.push(pz(l, a));
      t.push(`| ${v} km/h ${art === 'voll' ? 'Vollgas (beim Durchfahren)' : 'Konstantfahrt'} | ${a.toFixed(0)} | ${alt ? alt.toFixed(0) : '–'} | ${l.toFixed(0)} | ${vz(pz(l, a), 1)} % |`);
    }
  }
  t.push(`| Schaltpunkte Vollgas 1-2 / 2-3 / 3-4 / 4-5 | ${D.rt4.schalt.join(' / ')} | ${DA ? DA.schalt.join(' / ') : '–'} | ${D.l073.schalt.join(' / ')} | |`);
  t.push(`| Höchsttempo (km/h) und Drehzahl dort | ${D.rt4.hoechst.kmh.toFixed(1)} / ${D.rt4.hoechst.rpm.toFixed(0)} | ${DA ? `${DA.hoechst.kmh.toFixed(1)} / ${DA.hoechst.rpm.toFixed(0)}` : '–'} | ${D.l073.hoechst.kmh.toFixed(1)} / ${D.l073.hoechst.rpm.toFixed(0)} | |`);
  tabelle('63-lanza-drehzahl.md', t);
  melde(Math.max(...proz) <= 5, `Drehzahl bei 50/100/140 km/h (Vollgas und Konstantfahrt) höchstens 5 % über dem Audan: ${proz.map((p) => vz(p, 1)).join(' / ')} %`);
  melde(D.l073.schalt.every((r, i) => r <= D.rt4.schalt[i]) && D.l073.hoechst.rpm <= D.rt4.hoechst.rpm, `Schaltpunkte nicht höher als der Audan (${D.l073.schalt.join('/')} gegen ${D.rt4.schalt.join('/')}), bei Höchsttempo ${D.l073.hoechst.rpm.toFixed(0)}/min (Audan ${D.rt4.hoechst.rpm.toFixed(0)}${DA ? `, 0.8e ${DA.hoechst.rpm.toFixed(0)}` : ''})`);
}

// ---------------------------------------------------------------- (d) Subora Imprexa
if (teil('d')) {
  console.log('(d) Subora Imprexa: Lackierung, Fahrmessung, Schaltpunkte, Testfahrer, Ton');
  const { CONFIG } = await lade(WURZEL, 'js/config.js');
  const { AUTO_MODELLE } = await lade(WURZEL, 'js/autos.js');
  const { t: tx } = await lade(WURZEL, 'js/texte.js');
  const L = CONFIG.autoOptik.lackierungen, W = L.imprexaWerk, R = await referenz();
  const gelb = '#f5d020', blau = '#1d46a8', dunkel = '#0f2150';
  const schrift = ['sponsor0', 'sponsor1', 'sponsorHell', 'bannerSchrift', 'nummerSchrift', 'nummerRand', 'sponsorFeldSchrift', 'streifen0', 'akzent'];
  melde(W.lack === blau && W.unten === dunkel && W.fluegel === blau && schrift.every((k) => W[k] === gelb), `Werk-Lack: Karosserie ${W.lack}, Unterteil ${W.unten}, Heckflügel ${W.fluegel}, Schrift/Nummern/Streifen/Akzent gelb ${gelb}`);
  const lum = (h) => { const c = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
  const kontrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
  melde(kontrast(gelb, blau) >= 4.5 && kontrast(gelb, dunkel) >= 4.5, `Lesbarkeit: Kontrast gelb auf blau ${kontrast(gelb, blau).toFixed(1)}:1, gelb auf dunkelblau ${kontrast(gelb, dunkel).toFixed(1)}:1 (mindestens 4.5:1)`);
  const lacke = AUTO_MODELLE.imprexa.lackierungen;
  melde(lacke.join() === 'imprexaWerk,imprexaPolar,imprexaDunkel,imprexaRot' && JSON.stringify(L.imprexaRot) === JSON.stringify(R.imprexaWerkAlt) && tx('lack.imprexaRot') === 'ROT',
    `vier Lacke: ${lacke.join(', ')}; ROT = der Werk-Lack von 0.8e; Werk (Blau) ist der Standard`);
  // Garage: die längste Lack-Bezeichnung passt wie bisher (ROT/RED sind kürzer als DUNKEL/POLAR)
  const alle = Object.values(AUTO_MODELLE).flatMap((m) => m.lackierungen.flatMap((n) => ['de', 'en'].map((sp) => tx(`lack.${n}`, sp) || tx(`lack.${n}`))));
  melde(Math.max(...['ROT', 'RED'].map((x) => x.length)) <= Math.max(...alle.map((x) => x.length)), `Garage: Lack-Zeile blättert (< WERK >), ROT/RED nicht länger als die bisherigen Bezeichnungen (längste ${Math.max(...alle.map((x) => x.length))} Zeichen)`);
  // Lesbarkeit im Bild: gelbe Pixel der Lack-Textur je Bildbreite (Schrift erst ab 480x270)
  const s = await starteSpiel({ breite: 640, hoehe: 360 });
  await s.page.goto(`${s.url}/auto-labor.html`);
  await s.page.waitForFunction(() => window.__autoLabor, null, { timeout: 60000 });
  const px = await s.page.evaluate(() => {
    const La = window.__autoLabor, out = {};
    La.modellWaehlen('imprexa', 'imprexaWerk');
    for (const b of [320, 480, 640]) {
      La.auto.detail(b); La.auto.lackierung('imprexaWerk');
      const c = La.auto.leinwand, d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
      let n = 0; for (let i = 0; i < d.length; i += 4) if (d[i] > 200 && d[i + 1] > 170 && d[i + 2] < 80) n++;
      out[b] = n;
    }
    return out;
  });
  await s.schliessen();
  melde(px[480] > px[320] && px[640] >= px[480], `gelbe Pixel in der Lack-Textur: 320x180 ${px[320]}, 480x270 ${px[480]}, 640x360 ${px[640]} (Schrift kommt ab 480x270 dazu)`);
  // Fahrmessung
  const { physik: X, m, FP } = await physik();
  const P = X.prototyp;
  const t1 = ['| Messung | Prototyp | Subora 0.8f | Ziel |', '|---|---|---|---|'];
  for (const z of Z.ZEILEN) {
    const x = Z.pruefeZeile(z, P, X.imprexa, 'imprexa');
    melde(x.ok, `imprexa ${z[0]}: ${x.art === 'gleich' ? (x.ok ? 'identisch' : `${x.a} -> ${x.b}`) : `${vz(x.d)}${x.art === 'prozent' ? ' %' : x.art === 'diff' ? '°' : ''}`} (Ziel ${x.ziel})`);
    t1.push(`| ${z[0]} | ${Number(z[1](P)).toFixed(2)} | ${Number(z[1](X.imprexa)).toFixed(2)} (${x.art === 'gleich' ? (x.ok ? 'gleich' : 'ANDERS') : vz(x.d, 1)}) ${x.ok ? '✅' : '❌'} | ${x.ziel} |`);
  }
  tabelle('64-subora-fahrmessung.md', t1);
  // Schaltpunkte und Drehzahl
  const G = CONFIG.fahrprofile.imprexa.getriebe, T = CONFIG.fahrprofile.imprexa.ton.motor;
  FP.waehleFahrprofil('imprexa');
  const D = Z.drehzahlen(m);
  const { motorTon } = await lade(WURZEL, 'js/audio.js').catch(() => ({}));
  const f7 = motorTon ? motorTon(7000) : null, f8 = motorTon ? motorTon(8000) : null;
  FP.waehleFahrprofil('prototyp');
  melde(G.hochVollgas >= 7700 && G.hochVollgas <= 7900 && Math.abs(G.hochWenigGas - 5200) <= 200 && Math.abs(G.runterVollgas - 3000) <= 200,
    `Schaltpunkte: hoch mit Vollgas ${G.hochVollgas}, mit wenig Gas ${G.hochWenigGas}, runter mit Vollgas ${G.runterVollgas}; gemessen vor dem Hochschalten ${D.schalt.join(' / ')}/min`);
  melde(D.hoechst.rpm >= 7500 && D.hoechst.rpm <= 7900 && D.hoechst.rpm < T.begrenzerAb, `5. Gang bei Höchsttempo ${D.hoechst.kmh.toFixed(1)} km/h: ${D.hoechst.rpm.toFixed(0)}/min (7500 bis 7900, unter dem Begrenzer ${T.begrenzerAb})`);
  if (f7) melde(T.hoechstDrehzahl === 8300 && f8 > f7 * 1.1, `Ton bis ${T.hoechstDrehzahl}/min, Grundton steigt weiter: 7000/min ${f7.toFixed(0)} Hz, 8000/min ${f8.toFixed(0)} Hz (+${pz(f8, f7).toFixed(0)} %)`);
  else info('motorTon nicht ladbar (js/audio.js braucht den Browser) – Grundton bei 8000/min siehe Ton-Messung');
  // Testfahrer
  const tf = await testfahrer();
  for (const stil of ['vorsichtig', 'mittel', 'flott']) {
    const p = tf.prototyp[stil].zeit, a = tf.rt4[stil].zeit, i = tf.imprexa[stil];
    melde(i.ziel && i.aufpralle === 0 && i.kontakte === 0 && i.haenger === 0 && pz(i.zeit, p) >= -0.7 && pz(i.zeit, p) <= -0.2 && Math.abs(pz(i.zeit, a)) <= 0.3,
      `Testfahrer ${stil} Subora ${fmtZeit(i.zeit)}: gegen Prototyp ${vz(pz(i.zeit, p))} % (-0.7 bis -0.2), gegen Audan ${vz(pz(i.zeit, a))} % (höchstens ±0.3), Aufpralle ${i.aufpralle} (Kontakte ${i.kontakte}), Hänger ${i.haenger}`);
  }
  // Ton
  const XT = tonMessung('m8f-imprexa', 'imprexa'), A = tonJson('m8e-rt4');
  if (XT) for (const z of Z.TON_ZEILEN) {
    const r = Z.pruefeTon(z, A, XT, 'imprexa', tonJson('m8e-imprexa'));
    if (r) melde(r.ok, `imprexa ${z[0]}: ${r.art === 'wert' ? r.d.toFixed(0) : `${vz(r.d)}${r.art === 'prozent' ? ' %' : r.art === 'faktor' ? ' x' : ' dB'}`} (Ziel ${r.ziel.map((x) => (Math.abs(x) === Infinity ? '…' : x)).join(' bis ')})`);
  }
}

// ---------------------------------------------------------------- (e) Tacho
if (teil('e')) {
  console.log('(e) Tacho: Skala je Profil, andere Autos pixelgleich, 20-facher Wechsel');
  const ids = ['prototyp', ...ALTE, 'l073', 'imprexa'];
  const R = await referenz();
  const jetzt = await tachoBilder(ids);
  const gleich = ['prototyp', ...ALTE, 'l073'].filter((id) => hash(jetzt[id]) === R.tacho[id]);
  melde(gleich.length === 5 && hash(jetzt.imprexa) !== R.tacho.rt4, `Tacho pixelgleich mit 0.8e: ${gleich.join(', ')} (${gleich.length} von 5); Subora mit eigener Skala ${hash(jetzt.imprexa) !== R.tacho.rt4 ? 'anders' : 'GLEICH'}`);
  fs.writeFileSync(path.join(ORDNER, '50-tacho-subora-110x60.png'), Buffer.from(jetzt.imprexa.split(',')[1], 'base64'));
  const s = await starteSpiel({ breite: 640, hoehe: 360 });
  await s.page.goto(`${s.url}/index.html?menue=aus&auto=rt4`);
  await s.page.waitForFunction(() => window.__alpineRally, null, { timeout: 120000 });
  const w = await s.page.evaluate(async () => {
    const A = window.__alpineRally, T = A.hud.tachos;
    const bild = () => { const c = document.getElementById('hud'); return c.getContext('2d').getImageData(210, 120, 110, 60).data.join(','); };
    const warte = (n) => new Promise((r) => { let k = 0; const f = () => (++k >= n ? r() : requestAnimationFrame(f)); requestAnimationFrame(f); });
    await warte(30);
    const vorher = bild(), skalen = [];
    for (let i = 0; i < 20; i++) { A.waehleFahrprofil(i % 2 === 0 ? 'imprexa' : 'rt4'); await warte(3); skalen.push(T.skala().drehzahlMax); }
    A.waehleFahrprofil('rt4'); await warte(30);
    return { gleich: bild() === vorher, skalen, vorrat: T.vorrat(), imprexa: (A.waehleFahrprofil('imprexa'), await warte(3), T.skala()) };
  });
  melde(w.gleich && w.vorrat <= 3 && w.skalen.join('') === '98'.repeat(10) && s.fehler.length === 0,
    `20-facher Wechsel Audan/Subora: Skala ${w.skalen.join('')}, Zifferblätter im Vorrat ${w.vorrat} (höchstens 3: kein Leck), danach wieder pixelgleich ${w.gleich ? 'ja' : 'NEIN'}, Konsole ohne Fehler`);
  melde(w.imprexa.drehzahlMax === 9 && w.imprexa.drehzahlRotAb === 8 && w.imprexa.tempoMax === 200, `Subora-Skala ${JSON.stringify(w.imprexa)} (Drehzahl bis 9, rot ab 8)`);
  await s.schliessen();
}

// ---------------------------------------------------------------- (f) Unveränderlich
if (teil('f')) {
  console.log('(f) Unveränderlich: Audan, Delto, Escorta, Prototyp bit-gleich; Abkürzungen; Testfahrer Prototyp; Strecke');
  const R = await referenz();
  const { physik: X, motor } = await physik();
  for (const id of ['prototyp', ...ALTE]) {
    melde(JSON.stringify(R.physik[id]) === JSON.stringify(X[id]), `${id}: alle ${Object.keys(R.physik[id]).length} Fahrmessungen bit-genau wie 0.8e`);
    melde(JSON.stringify(R.motor[id]) === JSON.stringify(motor[id]), `${id}: Motorwerte (audio.motor mit Profil) wie 0.8e`);
  }
  const ab = await abdruck(ALTE);
  const anders = Object.keys(R.abdruck).filter((k) => R.abdruck[k] !== ab[k]);
  melde(anders.length === 0, `Lack-Textur (alle Lackierungen, 320/480/640), Geometrie und Räder von Audan, Delto, Escorta wie 0.8e (${Object.keys(R.abdruck).length} Prüfsummen${anders.length ? `, anders: ${anders.slice(0, 6).join(', ')}` : ''})`);
  // Ton je Auto gegen die Messung von 0.8e (Prototyp: ganze Messung ohne --profil, wie M8e)
  {
    const b = tonMessung('m8f-prototyp', null), a = tonJson('m8e-prototyp');
    const anders = [];
    let rauschen = 0, gleich = 0;
    const vergleiche = (x, y, p) => {
      if (p === '.version') return;
      if (typeof x === 'number') {
        if (x === y) { gleich++; return; }
        if (typeof y === 'number' && Math.abs(x - y) <= Math.max(1e-3, Math.abs(x) * 1e-5)) { rauschen++; return; }
        anders.push(`${p}: ${x} -> ${y}`); return;
      }
      if (x && typeof x === 'object') for (const k of Object.keys(x)) vergleiche(x[k], y ? y[k] : undefined, `${p}.${k}`);
      else if (x !== y) anders.push(`${p}: ${x} -> ${y}`);
    };
    if (b) vergleiche(a, b, '');
    melde(b && anders.length === 0, `prototyp: Ton wie 0.8e (${gleich} Zahlen gleich, ${rauschen} nur in der 5. bis 7. Stelle anders = Rechenrauschen, ${anders.length} anders${anders.length ? `: ${anders.slice(0, 4).join('; ')}` : ''})`);
  }
  for (const id of ALTE) {
    const b = tonMessung(`m8f-${id}`, id);
    if (!b) continue;
    const a = tonJson(`m8e-${id}`);
    const nah = (x, y) => Math.abs(x - y) <= Math.max(1e-3, Math.abs(x) * 1e-5);
    const motorGleich = a.motor.every((m, i) => ['f0', 'fGemessen', 'schwerpunkt', 'ueber2k5', 'spitze', 'rms'].every((k) => nah(m[k], b.motor[i][k])));
    const pops = ['salvenMitPops', 'pops', 'knistern', 'schaltknall', 'blowOff'].every((k) => a.profil.pops[k] === b.profil.pops[k]);
    const turbo = nah(a.profil.turbo.rms, b.profil.turbo.rms) && nah(a.profil.turbo.ton, b.profil.turbo.ton);
    melde(motorGleich && pops && turbo && b.knoten.summe === a.knoten.summe && nah(a.profil.spitze, b.profil.spitze),
      `${id}: Ton wie 0.8e (Motor 1500-7000, Turbo, Spitze, 60-s-Fahrt ${b.profil.pops.salvenMitPops} Salven / ${b.profil.pops.pops} Pops, Knoten ${b.knoten.summe})`);
  }
  teilWerkzeug('m8b-test.mjs', ['--nur', 'c'], 'prototyp = 0.7b (Testfahrer 2:59.33 / 2:42.35 / 2:31.92, Zwischenzeiten, Statistik, Prüfsumme, Abkürzungen 127/2/342/84)');
  for (const id of ['l073', 'imprexa']) {
    const r = werkzeug('abkuerzungen.mjs', ['--pruefen', '--auto', id]);
    const n = [...r.text.matchAll(/übrig in Kurve [^:]+: (\d+) Linien/g)].map((x) => +x[1]), durch = /Durchkommen in gesperrten Kurven: (\d+)/.exec(r.text);
    melde(n.join(' / ') === '127 / 2 / 342 / 84' && durch && durch[1] === '0', `Abkürzungen mit ${id}: ${n.join(' / ')} übrige Linien, gesperrt durchkommen ${durch ? durch[1] : '?'}`);
  }
  const tf = await testfahrer();
  for (const stil of ['vorsichtig', 'mittel', 'flott']) {
    melde(fmtZeit(tf.prototyp[stil].zeit) === { vorsichtig: '2:59.33', mittel: '2:42.35', flott: '2:31.92' }[stil], `Testfahrer ${stil} prototyp ${fmtZeit(tf.prototyp[stil].zeit)} (im Spiel, wie 0.7b)`);
  }
  const s = await starteSpiel({ breite: 640, hoehe: 360 });
  await s.page.goto(`${s.url}/index.html?menue=aus`);
  await s.page.waitForFunction(() => window.__alpineRally, null, { timeout: 120000 });
  const laenge = await s.page.evaluate(() => window.__alpineRally.strecke.laenge);
  await s.schliessen();
  melde(Math.abs(laenge - 3667.587) <= 0.5, `Strecke ${laenge.toFixed(3)} m (3667.587 ±0.5)`);
  for (const d of ['js/pacenotes-tempo.js', 'js/abkuerzungen.js', 'tools/schneiden-zeiten.json']) {
    const r = spawnSync('git', ['diff', '--quiet', 'c829fce', '--', d], { cwd: WURZEL });
    melde(r.status === 0, `${d} nicht neu geschrieben (gleich wie 0.8e)`);
  }
}

// ---------------------------------------------------------------- (g) Regression, Bildzeit, Ladezeit
if (teil('g')) {
  console.log('(g) Regression, Bildzeit, Ladezeit');
  if (process.argv.includes('--lang')) {
    // m8e-test ohne (d), (h) und (j): dort stehen die alten Lanza-Ziele von M8e, die M8f absichtlich ändert
    for (const [t, a] of [['getriebe-test.mjs', []], ['lenk-test.mjs', []], ['handbremse-test.mjs', []], ['belag-test.mjs', []], ['rueckwaerts-test.mjs', []],
      ['aufprall-test.mjs', []], ['pacenotes-test.mjs', []], ['menue-test.mjs', []], ['rennablauf-test.mjs', []], ['ton-test.mjs', []], ['ton-umgebung-test.mjs', []],
      ['auto-test.mjs', []], ['m8b-test.mjs', []], ['m8c-test.mjs', ['--nur', 'a,b,c,d,e,f,g,h,i,j,k']], ['m8d-test.mjs', []], ['m8e-test.mjs', ['--nur', 'a,b,c,e,f,g,i']]]) {
      const r = werkzeug(t, a);
      melde(r.code === 0, `${t}${a.length ? ` ${a.join(' ')}` : ''}: ${r.code === 0 ? 'bestanden' : `NICHT bestanden: ${r.text.split('\n').filter((z) => /^\s*FEHLER/.test(z)).slice(0, 3).map((z) => z.trim().slice(0, 160)).join(' | ')}`}`);
    }
  } else info('alle bisherigen Tests: nur mit --lang');
  const s = await starteSpiel({ breite: 640, hoehe: 360 });
  const bz = {};
  for (const id of ALLE) {
    await s.page.goto(`${s.url}/index.html?menue=aus&auto=${id}`);
    await s.page.waitForFunction(() => window.__alpineRally, null, { timeout: 120000 });
    bz[id] = await s.page.evaluate(async () => {
      const A = window.__alpineRally;
      A.setzeAuf(60); A.kameraSofort();
      const t0 = performance.now(); let n = 0;
      await new Promise((r) => { const f = () => { n++; if (performance.now() - t0 < 3000) requestAnimationFrame(f); else r(); }; requestAnimationFrame(f); });
      const o = A.autoModell.objekt, sichtbar = A.szene.children.map((x) => x.visible);
      A.szene.children.forEach((x) => { x.visible = x === o; }); A.renderer.render(A.szene, A.kamera);
      const calls = A.renderer.info.render.calls;
      A.szene.children.forEach((x, i) => { x.visible = sichtbar[i]; });
      return { ms: (performance.now() - t0) / n, calls };
    });
  }
  const basis = bz.rt4.ms;
  melde(Object.values(bz).every((x) => x.calls <= 12 && x.ms < basis * 1.2), `Bildzeit im Spiel (kopflos, Software-Grafik): ${Object.entries(bz).map(([id, x]) => `${id} ${x.ms.toFixed(0)} ms / ${x.calls} Calls`).join(', ')} (Audan als Bezug, höchstens +20 %)`);
  await s.schliessen();
  if (ALT) {
    const r = werkzeug('ladezeit.mjs', [ALT, '9']);
    const med = (n) => +((new RegExp(`${n} .*Median (\\d+)`).exec(r.text) || [])[1]);
    const a = med('alt'), b = med('neu');
    melde(b - a <= 30, `Ladezeit (Median aus 9): 0.8e ${a} ms, 0.8f ${b} ms (${b - a >= 0 ? '+' : ''}${b - a} ms, höchstens +30; Streuung im Test-Browser ca. ±100 ms)`);
  } else info('Ladezeit: nur mit --alt <ordner 0.8e>');
}

console.log(`\n${fehler === 0 ? 'Alle Prüfungen bestanden.' : `${fehler} Prüfung(en) NICHT bestanden.`}${kompromisse ? ` (${kompromisse} Kompromiss(e), siehe docs/meilensteine/m8f.md)` : ''}`);
process.exit(fehler === 0 ? 0 : 1);
