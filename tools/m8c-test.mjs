// Meilenstein 8c prüfen:  node tools/m8c-test.mjs [--nur a,b,c,d,e,f,g,h,i,j,k,l]
//   (a) Profil prototyp bit-genau (Testfahrer, Zwischenzeiten, Statistik, 70-s-Prüfsumme, Ton) und Abkürzungen
//       127 / 2 / 342 / 84 – über tools/m8b-test.mjs --nur c
//   (b) Audan Quarto unverändert: Fahrmessungen wie M8b (tools/m8b-messung.json, ±0.5 %), Draw Calls und Dreiecke wie
//       M8b (9 / 1306), Bilder im Auto-Labor gegen die Referenz aus 0.8b (tools/m8c-referenz-audan.json)
//   (c) Modelle: Masse, Radmitten, Radradius, Draw Calls ≤ 12, Dreiecke ≤ 1800, kein NaN, keine Helme hinten, Helme
//       klein und dunkel, alle Lackierungen, nur Pixelschrift, kein RINGWERK und kein echter Markenname in den Texten
//   (d) Wechsel im Menü (30 Mal): Profil, Modell, Masse, Räder, Staub, Dreck, Lichter, Federung folgen; Speicher
//       stabil; keine Konsolenfehler; im Rennen und in der Pause kein Wechsel; nach Neuladen erhalten; Rückfall
//   (e) Masse im Spiel: Felswand mit jedem Auto (tools/felswand-test.mjs --auto), Zäune und Bäume
//       (tools/aufprall-test.mjs --auto), Staub hinter den Hinterrädern
//   (f) Fahrmessungen (tools/m8c-ziele.js) und Testfahrer je Auto, Rückwärts identisch, Werte-Balken passen
//   (g) Bestzeiten: gemeinsame Top 10 mit Kurznamen, alte Einträge, Live-Vergleich, Format gleich
//   (h) Ton: Delto und Audan wie M8b, Escorta ohne Pfeifen und Blow-off, halb so viele Pops
//   (i) Demo-Fahrt mit jedem Auto ohne Aufprall und Hänger; menue-test und rennablauf-test mit jedem Auto (lang)
//   (j) Garage: öffnen/schliessen, dreht, ohne Seite kein Aufwand, Lack, Balken, Texte passen, Tastatur/Maus/Gamepad
//   (k) Fahr-Labor und Auto-Labor mit allen Autos, ohne ?fahrlabor=1 kein Panel
//   (l) Stabilität: alle bisherigen Tests mit prototyp (lang), Ladezeit (mit --alt <ordner 0.8b>)
// Ich habe weder das Fahrgefühl gespürt noch den Ton gehört: das sind Messungen.

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { starteSpiel, WURZEL } from './spiel-browser.mjs';

const arg = (name) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : null; };
const NUR = arg('--nur') ? arg('--nur').split(',') : null;
const teil = (k) => !NUR || NUR.includes(k);
let fehler = 0;
const melde = (ok, text) => { console.log(`${ok ? '  ok  ' : 'FEHLER'} ${text}`); if (!ok) fehler++; };
const komp = (text, grund) => console.log(`  KOMP ${text} – Kompromiss: ${grund}`);
const werkzeug = (name, argumente = [], timeout = 3600000) => {
  const r = spawnSync(process.execPath, [path.join(WURZEL, 'tools', name), ...argumente], { encoding: 'utf8', timeout, maxBuffer: 64 * 1024 * 1024 });
  return { code: r.status, text: `${r.stdout || ''}${r.stderr || ''}` };
};
const teilWerkzeug = (name, argumente, titel) => {
  const r = werkzeug(name, argumente);
  const zeilen = r.text.split('\n').filter((z) => /^\s*(ok|FEHLER|KOMP|BEKANNT)\b/i.test(z));
  for (const z of zeilen) console.log(`       ${z.trim()}`);
  melde(r.code === 0, `${titel}: ${r.code === 0 ? 'bestanden' : 'NICHT bestanden'} (${zeilen.filter((z) => /^\s*ok/i.test(z)).length} ok, ${zeilen.filter((z) => /KOMP/.test(z)).length} Kompromisse)`);
  return r;
};
const lade = (d) => import(pathToFileURL(path.join(WURZEL, d)).href);
const AUTOS = ['rt4', 'delto', 'escorta'];

// Physik ohne Browser (alle Profile), einmal gerechnet
let PHYSIK = null;
async function physik() {
  if (PHYSIK) return PHYSIK;
  const { CONFIG } = await lade('js/config.js');
  const { Fahrphysik } = await lade('js/physics.js');
  const { Getriebe } = await lade('js/getriebe.js');
  const FP = await lade('js/fahrprofil.js');
  const { baueMessung, alleMessungen } = await lade('tools/fahrmessung.js');
  const m = baueMessung({ CONFIG, Fahrphysik, Getriebe });
  PHYSIK = {};
  for (const id of ['prototyp', ...AUTOS]) { FP.waehleFahrprofil(id); PHYSIK[id] = alleMessungen(m); }
  FP.waehleFahrprofil('prototyp');
  return PHYSIK;
}

// ---------------------------------------------------------------- (a) prototyp bit-genau
if (teil('a')) {
  console.log('(a) Profil prototyp bit-genau (über tools/m8b-test.mjs --nur c)');
  teilWerkzeug('m8b-test.mjs', ['--nur', 'c'], 'prototyp = 0.7b (Testfahrer, Zwischenzeiten, Statistik, Prüfsumme, Abkürzungen 127/2/342/84), Ton wie 0.8a/0.8b');
}

// ---------------------------------------------------------------- (b) Audan Quarto unverändert
if (teil('b')) {
  console.log('(b) Audan Quarto unverändert');
  const P = await physik();
  const alt = JSON.parse(fs.readFileSync(path.join(WURZEL, 'tools/m8b-messung.json'), 'utf8')).m8b.physik.rt4;
  const abw = [];
  const vergleiche = (a, b, pfad) => {
    if (typeof a === 'number') { if (Math.abs(b - a) > Math.max(1e-9, Math.abs(a) * 0.005)) abw.push(`${pfad}: ${a} -> ${b}`); return; }
    if (a && typeof a === 'object') for (const k of Object.keys(a)) vergleiche(a[k], b ? b[k] : undefined, `${pfad}.${k}`);
  };
  vergleiche(alt, P.rt4, 'rt4');
  melde(abw.length === 0, `Fahrmessungen Audan gegen M8b (tools/m8b-messung.json, ±0.5 %): ${abw.length ? abw.slice(0, 5).join('; ') : `alle ${Object.keys(alt).length} Messungen gleich`}`);
  const s = await starteSpiel({ breite: 640, hoehe: 360 });
  await s.page.goto(`${s.url}/auto-labor.html`);
  await s.page.waitForFunction(() => window.__autoLabor, null, { timeout: 60000 });
  const ref = JSON.parse(fs.readFileSync(path.join(WURZEL, 'tools/m8c-referenz-audan.json'), 'utf8')).bilder;
  const r = await s.page.evaluate(async (ref) => {
    const L = window.__autoLabor;
    const ladeBild = (src) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.src = src; });
    const pixel = async (src) => { const i = await ladeBild(src); const c = document.createElement('canvas'); c.width = i.width; c.height = i.height; const x = c.getContext('2d'); x.drawImage(i, 0, 0); return x.getImageData(0, 0, i.width, i.height).data; };
    const out = {};
    for (const [name, alt] of Object.entries(ref)) {
      const [ansicht, aufl] = name.split('-');
      L.aufloesung(+aufl); L.modellWaehlen('rt4', 'werk'); L.auto.lackierung('werk'); L.ansicht(ansicht);
      const a = await pixel(alt), b = await pixel(L.bildDaten());
      let anders = 0;
      for (let i = 0; i < a.length; i += 4) if (Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]) > 6) anders++;
      out[name] = { anders, alle: a.length / 4 };
    }
    return out;
  }, ref);
  melde(Object.values(r).every((x) => x.anders === 0), `Bilder Auto-Labor gegen 0.8b: ${Object.entries(r).map(([k, x]) => `${k} ${x.anders} von ${x.alle} Pixeln anders`).join(', ')}`);
  await s.schliessen();
  const m = JSON.parse(fs.readFileSync(path.join(WURZEL, 'tools/auto-messung.json'), 'utf8'));
  const o = m.nachher && m.nachher.browser.rt4 && m.nachher.browser.rt4.optik;
  melde(o && o.nurAuto.calls === 9 && o.nurAuto.dreiecke === 1306, `Draw Calls / Dreiecke Audan (tools/auto-messung.json): ${o ? `${o.nurAuto.calls} / ${o.nurAuto.dreiecke}` : '--'} (M8b: 9 / 1306)`);
}

// ---------------------------------------------------------------- (c) Modelle
if (teil('c')) {
  console.log('(c) Modelle');
  const { AUTO_MODELLE, texteDesModells } = await lade('js/autos.js');
  const { CONFIG } = await lade('js/config.js');
  const VORGABE = {
    rt4: { laenge: [4.4, 4.48], breite: [1.8, 1.86], hoehe: [1.38, 1.42], radstand: 2.52, spur: [1.58, 1.62], radius: [0.33, 0.33] },
    delto: { laenge: [3.9, 4.05], breite: [1.74, 1.8], hoehe: [1.4, 1.45], radstand: 2.48, spur: [1.5, 1.54], radius: [0.32, 0.33] },
    escorta: { laenge: [4.0, 4.15], breite: [1.7, 1.76], hoehe: [1.3, 1.38], radstand: 2.4, spur: [1.46, 1.5], radius: [0.32, 0.33] },
  };
  const s = await starteSpiel({ breite: 640, hoehe: 360 });
  await s.page.goto(`${s.url}/auto-labor.html`);
  await s.page.waitForFunction(() => window.__autoLabor, null, { timeout: 60000 });
  const r = await s.page.evaluate((autos) => {
    const L = window.__autoLabor, THREE = L.THREE, out = {};
    for (const id of autos) {
      L.modellWaehlen(id);
      const a = L.auto;
      a.federung({ nicken: 0, rollen: 0, hub: 0 });
      a.objekt.updateMatrixWorld(true);
      const box = new THREE.Box3();
      let nan = false, dreiecke = 0, meshes = 0;
      a.objekt.traverse((o) => {
        if (!o.isMesh) return;
        meshes++;
        const p = o.geometry.attributes.position.array;
        for (let i = 0; i < p.length; i++) if (!Number.isFinite(p[i])) nan = true;
        dreiecke += o.geometry.attributes.position.count / 3;
        if (o.name !== 'auto-schatten') box.expandByObject(o);
      });
      // nur das Auto zeichnen: Draw Calls
      const sicht = L.szene.children.map((o) => o.visible);
      L.szene.children.forEach((o) => { o.visible = o === a.objekt; });
      L.renderer.render(L.szene, L.kamera);
      const calls = L.renderer.info.render.calls;
      L.szene.children.forEach((o, i) => { o.visible = sicht[i]; });
      const lacke = {};
      for (const n of a.modell.lackierungen) { try { lacke[n] = a.lackierung(n) === n; L.renderer.render(L.szene, L.kamera); } catch (e) { lacke[n] = String(e); } }
      a.lackierung(a.modell.lackierungen[0]);
      out[id] = {
        laenge: box.max.z - box.min.z, breite: box.max.x - box.min.x, hoehe: box.max.y - box.min.y,
        raeder: a.raeder.map((rd) => [rd.lenk.position.x, rd.lenk.position.y, rd.lenk.position.z]), radius: a.modell.raeder.radius,
        nan, dreiecke, meshes, calls, lacke,
      };
    }
    return out;
  }, AUTOS);
  const F = CONFIG.autoOptik.farben;
  const hell = (hex) => { const n = parseInt(hex.slice(1), 16); return 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255); };
  const { SCHRIFT_ZEICHEN } = await import(pathToFileURL(path.join(WURZEL, 'tools/node-three.mjs')).href).then(() => lade('js/pixel.js'));
  for (const id of AUTOS) {
    const x = r[id], v = VORGABE[id], m = AUTO_MODELLE[id];
    const drin = (w, [a, b]) => w >= a - 0.005 && w <= b + 0.005;
    const radstand = Math.abs(x.raeder[0][2] - x.raeder[2][2]), spur = Math.abs(x.raeder[0][0] - x.raeder[1][0]);
    melde(drin(x.laenge, v.laenge) && drin(x.breite, v.breite) && drin(x.hoehe, v.hoehe),
      `${m.name}: Länge ${x.laenge.toFixed(3)} m (${v.laenge.join('–')}), Breite ${x.breite.toFixed(3)} m (${v.breite.join('–')}), Höhe ${x.hoehe.toFixed(3)} m (${v.hoehe.join('–')})`);
    melde(Math.abs(radstand - v.radstand) < 0.005 && drin(spur, v.spur) && drin(x.radius, v.radius) && x.raeder.every((p) => Math.abs(p[1] - x.radius) < 1e-9),
      `${m.name}: Radstand ${radstand.toFixed(3)} m (${v.radstand}), Spur ${spur.toFixed(3)} m, Radradius ${x.radius} m, Radmitten auf Radhöhe`);
    melde(m.masse.radstand === v.radstand && m.masse.laenge >= x.laenge - 0.03 && m.masse.breite >= x.breite - 0.005,
      `${m.name}: Masse-Daten (Felswand-Hülle ${m.masse.laenge} x ${m.masse.breite} m, Kollision ${m.kollision.laenge} x ${m.kollision.breite} m) passen zum Modell`);
    melde(x.calls <= 12 && x.dreiecke <= 1800 && !x.nan, `${m.name}: ${x.calls} Draw Calls (höchstens 12), ${x.dreiecke} Dreiecke (höchstens 1800), kein NaN`);
    const helme = m.bemalung.filter((b) => b.art === 'helm');
    melde(helme.length > 0 && !helme.some((b) => b.ansicht === 'hinten') && helme.every((b) => b.r <= 0.09 && ['helmFahrer', 'helmBeifahrer'].includes(b.farbe)),
      `${m.name}: keine Helme hinten; Helme seitlich/vorne r ${[...new Set(helme.map((b) => b.r))].join(' / ')} (höchstens 0.09), dunkel (Helligkeit ${hell(F.helmFahrer).toFixed(0)} / ${hell(F.helmBeifahrer).toFixed(0)})`);
    melde(Object.values(x.lacke).every((w) => w === true) && m.lackierungen.length === 3, `${m.name}: alle drei Lackierungen malen ohne Fehler (${m.lackierungen.join(', ')})`);
    const texte = [...texteDesModells(m), m.name, m.kurz];
    const fehlt = texte.join('').split('').filter((z) => !SCHRIFT_ZEICHEN.includes(z));
    melde(fehlt.length === 0, `${m.name}: Texte nur in der Pixelschrift (${texte.join(', ')})`);
  }
  // Suche: kein RINGWERK, kein echter Markenname in den Texten (texte.js, Modelle, alle Texte in config.js)
  const T = await lade('js/texte.js');
  const alleTexte = [];
  const sammle = (o) => { if (typeof o === 'string') alleTexte.push(o); else if (o && typeof o === 'object') for (const w of Object.values(o)) sammle(w); };
  sammle(CONFIG);
  for (const v of Object.values(T.TEXTE)) alleTexte.push(v.de, v.en);
  for (const m of Object.values(AUTO_MODELLE)) alleTexte.push(...texteDesModells(m), m.name, m.kurz);
  const MARKEN = ['RINGWERK', 'AUDI', 'QUATTRO', 'LANCIA', 'DELTA', 'INTEGRALE', 'FORD', 'ESCORT', 'SUBARU', 'IMPREZA', 'MARTINI', 'ROTHMANS',
    'CASTROL', 'MARLBORO', 'PEUGEOT', 'TOYOTA', 'OPEL', 'MANTA', 'RENAULT', 'MITSUBISHI', 'PIRELLI', 'MICHELIN', 'ESSO', 'SHELL', 'TOTAL', 'FIAT', 'ABARTH'];
  const treffer = [];
  // (bekannt und erlaubt: "LIVE DELTA" = englisch für den Live-Vergleich, Delta als Zeitunterschied, keine Marke)
  const ERLAUBT = ['LIVE DELTA'];
  for (const text of alleTexte) {
    if (ERLAUBT.includes(text)) continue;
    for (const marke of MARKEN) if (new RegExp(`(^|[^A-ZÄÖÜ])${marke}($|[^A-ZÄÖÜ])`, 'i').test(text)) treffer.push(`${marke} in "${text}"`);
  }
  const ringwerkJs = fs.readdirSync(path.join(WURZEL, 'js')).filter((n) => /ringwerk/i.test(fs.readFileSync(path.join(WURZEL, 'js', n), 'utf8')));
  melde(treffer.length === 0 && ringwerkJs.length === 0, `Suche nach RINGWERK und echten Marken (${MARKEN.length} Namen) in ${alleTexte.length} Texten: ${treffer.length ? treffer.slice(0, 6).join('; ') : 'nichts gefunden'}${ringwerkJs.length ? `; RINGWERK in ${ringwerkJs.join(', ')}` : ''}`);
  melde(s.fehler.length === 0, `Auto-Labor ohne Konsolenfehler (${s.fehler.length})`);
  await s.schliessen();
}

// ---------------------------------------------------------------- (d) Wechsel im Menü
if (teil('d')) {
  console.log('(d) Wechsel im Menü (30 Mal), Speicher, Sperre im Rennen, Neuladen');
  const s = await starteSpiel({ breite: 320, hoehe: 180, auto: '' });
  const p = s.page;
  await p.goto(`${s.url}/index.html`);
  await p.waitForFunction(() => window.__alpineRally && window.__alpineRally.menue, null, { timeout: 120000 });
  const cdp = await p.context().newCDPSession(p);
  const heap = async () => { for (let i = 0; i < 3; i++) await cdp.send('HeapProfiler.collectGarbage'); return (await cdp.send('Runtime.getHeapUsage')).usedSize; };
  await p.evaluate(() => { const A = window.__alpineRally; A.zumMenue(); A.menue.oeffne(A.seiten.auto); });
  await p.waitForTimeout(500);
  // einmal alle Autos und Lacke durch (Shader kompiliert, Leinwände angelegt), dann messen
  const runde = async (n) => p.evaluate(async (n) => {
    const A = window.__alpineRally, C = A.CONFIG, fehlerListe = [];
    const { AUTO_MODELLE } = await import('/js/autos.js');
    const warte = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    let wechsel = 0;
    for (let k = 0; wechsel < n && k < n * 6; k++) {
      const vorher = A.autoWahl.auto;
      A.menue.taste('ArrowDown', false);
      const e = A.menue.seite.eintraege()[A.menue.wahl];
      if (e.lack) { A.menue.taste('ArrowRight', false); await warte(); continue; }
      if (!e.autoId || e.autoId === vorher) continue;
      wechsel++;
      await warte();
      const m = AUTO_MODELLE[e.autoId], M = A.autoModell;
      const pr = [];
      if (A.auto !== m.fahrprofil) pr.push(`Profil ${A.auto}`);
      if (M.modell.id !== e.autoId) pr.push(`Modell ${M.modell.id}`);
      if (C.kollision.autoLaenge !== m.kollision.laenge || C.kollision.autoBreite !== m.kollision.breite) pr.push('Kollision');
      if (C.grenze.wandHuelle.laenge !== m.masse.laenge || C.grenze.wandHuelle.breite !== m.masse.breite) pr.push('Felswand');
      if (C.auto.radstand !== m.masse.radstand) pr.push(`Radstand ${C.auto.radstand}`);
      if (Math.abs(M.raeder[0].lenk.position.x - m.raeder.x) > 1e-9 || Math.abs(M.raeder[0].lenk.position.z - m.raeder.z) > 1e-9) pr.push('Räder');
      if (A.staubAuto.hinten !== m.staub.hinten || A.staubAuto.seite !== m.staub.seite) pr.push('Staub');
      if (A.dreck.menge !== 0) pr.push('Dreck');
      if (!M.objekt.parent) pr.push('nicht in der Szene');
      if (A.szene.children.filter((o) => o.name === 'auto').length !== 1) pr.push(`${A.szene.children.filter((o) => o.name === 'auto').length} Autos in der Szene`);
      if (M.karosse.position.y - m.schwerpunktHoehe > 0.13) pr.push('Federung');
      if (pr.length) fehlerListe.push(`${e.autoId}: ${pr.join(', ')}`);
    }
    return { wechsel, fehlerListe, mem: { ...A.renderer.info.memory }, auto: A.autoWahl.auto };
  }, n);
  await runde(6);
  // zurück zum Audan, messen, 30 Wechsel, zurück zum Audan, messen
  const zumAudan = () => p.evaluate(async () => {
    const A = window.__alpineRally;
    for (let k = 0; k < 12 && A.autoWahl.auto !== 'rt4'; k++) { A.menue.taste('ArrowDown', false); await new Promise((r) => requestAnimationFrame(r)); }
    return { auto: A.autoWahl.auto, mem: { ...A.renderer.info.memory } };
  });
  const v0 = await zumAudan(); await p.waitForTimeout(300);
  const h0 = await heap();
  const r = await runde(30);
  const v1 = await zumAudan(); await p.waitForTimeout(300);
  const h1 = await heap();
  melde(r.wechsel === 30 && r.fehlerListe.length === 0, `30 Wechsel mit der Tastatur: Profil, Modell, Kollision, Felswand, Radstand, Räder, Staub, Dreck, Federung folgen${r.fehlerListe.length ? ` – ${r.fehlerListe.slice(0, 4).join('; ')}` : ''}`);
  melde(v0.mem.geometries === v1.mem.geometries && v0.mem.textures === v1.mem.textures && h1 - h0 < 1.5e6,
    `Speicher: Geometrien ${v0.mem.geometries} -> ${v1.mem.geometries}, Texturen ${v0.mem.textures} -> ${v1.mem.textures}, JS-Heap ${(h0 / 1e6).toFixed(2)} -> ${(h1 / 1e6).toFixed(2)} MB (Unterschied ${((h1 - h0) / 1e6).toFixed(2)} MB, höchstens 1.5)`);
  // Lichter am neuen Auto: Bremslicht folgt der Eingabe
  const licht = await p.evaluate(() => { const A = window.__alpineRally; A.lichtEin.bremse = 1; A.autoZeichnen(0.016, 0); const an = A.autoModell.lichtZustand[0]; A.lichtEin.bremse = 0; A.autoZeichnen(0.016, 0); return [an, A.autoModell.lichtZustand[0]]; });
  melde(licht[0] === true && licht[1] === false, `Bremslicht am gewechselten Auto folgt (${licht.join(' -> ')})`);
  // im Rennen, im Countdown und in der Pause kein Wechsel
  const sperre = await p.evaluate(async () => {
    const A = window.__alpineRally, erg = {};
    A.start(); erg.countdown = A.autoWechseln('delto');
    A.rennSchritt(4, {}); erg.rennen = [A.ablauf.zustand, A.autoWechseln('delto')];
    A.pausieren(); erg.pause = [A.ablauf.zustand, A.autoWechseln('escorta')];
    erg.auto = A.autoWahl.auto;
    A.weiter(); A.zumHauptmenue();
    erg.menue = A.autoWechseln('delto');
    return erg;
  });
  melde(sperre.countdown === false && sperre.rennen[1] === false && sperre.pause[1] === false && sperre.auto === 'rt4' && sperre.menue === true,
    `kein Wechsel im Countdown (${sperre.countdown}), im Rennen (${sperre.rennen.join(' ')}), in der Pause (${sperre.pause.join(' ')}); im Menü ja (${sperre.menue})`);
  // Lackierung wählen, neu laden: erhalten
  await p.evaluate(async () => { const A = window.__alpineRally; A.autoWechseln('delto', 'rosso'); A.autoWechseln('escorta', 'kanarie'); A.autoWechseln('delto'); });
  await p.goto(`${s.url}/index.html`);
  await p.waitForFunction(() => window.__alpineRally && window.__alpineRally.menue, null, { timeout: 120000 });
  const nach = await p.evaluate(() => { const A = window.__alpineRally; return { auto: A.autoWahl.auto, lack: A.autoModell.lackName, lacke: A.einstellungen.lacke, profil: A.auto }; });
  melde(nach.auto === 'delto' && nach.lack === 'rosso' && nach.lacke.escorta === 'kanarie' && nach.profil === 'delto',
    `nach Neuladen: Auto ${nach.auto} (Profil ${nach.profil}), Lackierung ${nach.lack}, gemerkt ${JSON.stringify(nach.lacke)}`);
  // unbekannte Werte: Audan, erste Lackierung, ohne Fehler
  await p.evaluate((k) => localStorage.setItem(k, JSON.stringify({ auto: 'quattro', lacke: { rt4: 'gold', delto: 42 } })), 'alpineRally.einstellungen');
  await p.goto(`${s.url}/index.html`);
  await p.waitForFunction(() => window.__alpineRally && window.__alpineRally.menue, null, { timeout: 120000 });
  const rueck = await p.evaluate(() => { const A = window.__alpineRally; return { auto: A.autoWahl.auto, lack: A.autoModell.lackName, profil: A.auto }; });
  melde(rueck.auto === 'rt4' && rueck.lack === 'werk' && rueck.profil === 'rt4', `unbekannte Werte (auto "quattro", Lack "gold"): ${rueck.auto} / ${rueck.lack} / Profil ${rueck.profil}`);
  // ?auto= setzt beide Ids (prototyp = Aussehen Audan mit Profil prototyp)
  const adr = {};
  for (const id of ['prototyp', 'rt4', 'delto', 'escorta']) {
    await p.goto(`${s.url}/index.html?menue=aus&auto=${id}`);
    await p.waitForFunction(() => window.__alpineRally, null, { timeout: 120000 });
    adr[id] = await p.evaluate(() => `${window.__alpineRally.autoModell.modell.id}/${window.__alpineRally.auto}`);
  }
  melde(adr.prototyp === 'rt4/prototyp' && adr.rt4 === 'rt4/rt4' && adr.delto === 'delto/delto' && adr.escorta === 'escorta/escorta', `?auto= setzt Modell/Profil: ${JSON.stringify(adr)}`);
  melde(s.fehler.length === 0, `keine Konsolenfehler (${s.fehler.length})`);
  await s.schliessen();
}

// ---------------------------------------------------------------- (e) Masse im Spiel
if (teil('e')) {
  console.log('(e) Masse im Spiel: Felswand, Zäune und Bäume, Staub');
  for (const id of AUTOS) {
    teilWerkzeug('felswand-test.mjs', ['--auto', id], `Felswand mit ${id} (stoppt an der sichtbaren Wand wie M3a.3)`);
    teilWerkzeug('aufprall-test.mjs', ['--auto', id], `Aufprall an Bäumen, Zäunen, Steinen mit ${id} (kein Hängenbleiben)`);
  }
  // Staub: neue Wölkchen entstehen hinter den Hinterrädern (Abstand zur Lage der Hinterräder im Auto)
  const s = await starteSpiel({ breite: 320, hoehe: 180 });
  for (const id of AUTOS) {
    await s.page.goto(`${s.url}/index.html?menue=aus&auto=${id}`);
    await s.page.waitForFunction(() => window.__alpineRally, null, { timeout: 120000 });
    const r = await s.page.evaluate(() => {
      const A = window.__alpineRally, m = A.autoModell.modell, st = A.staub;
      const sa = { x: 0, y: 0, z: 0, richtung: 0.3, vx: 0, vz: 0, tempo: 20, drift: 0, gas: 1, handbremse: true, schotter: true, belag: 'schotter', hinten: A.staubAuto.hinten, seite: A.staubAuto.seite };
      const w = st.mesh.geometry.getAttribute('aWolke');
      const abw = [];
      for (let k = 0; k < 120; k++) {
        const vorher = Array.from(w.array);
        st.aktualisiere(1 / 60, sa);
        for (let i = 0; i < w.count; i++) {
          if (w.array[i * 4 + 3] > 0 && vorher[i * 4 + 3] === 0) {
            const dx = w.array[i * 4], dz = w.array[i * 4 + 2], fx = Math.sin(sa.richtung), fz = Math.cos(sa.richtung);
            const laengs = dx * fx + dz * fz, quer = Math.abs(dx * fz - dz * fx);
            abw.push(Math.hypot(laengs + m.raeder.z, quer - m.raeder.x));
          }
        }
      }
      return { n: abw.length, max: Math.max(...abw), hinten: sa.hinten, seite: sa.seite, rad: [m.raeder.x, m.raeder.z] };
    });
    melde(r.n > 5 && r.max < 0.5, `Staub ${id}: ${r.n} neue Wölkchen, höchstens ${r.max.toFixed(2)} m von einem Hinterrad (Austritt ${r.hinten} m hinter der Mitte, ±${r.seite} m; Hinterräder ${-r.rad[1]} / ±${r.rad[0]} m)`);
  }
  melde(s.fehler.length === 0, `keine Konsolenfehler (${s.fehler.length})`);
  await s.schliessen();
}

// ---------------------------------------------------------------- (f) Fahrmessungen
if (teil('f')) {
  console.log('(f) Fahrmessungen (Ziele tools/m8c-ziele.js), Testfahrer, Werte-Balken');
  const P = await physik();
  const { ZEILEN, TESTFAHRER, KOMPROMISSE, pruefeZeile } = await lade('tools/m8c-ziele.js');
  for (const id of ['delto', 'escorta']) {
    for (const z of ZEILEN) {
      const e = pruefeZeile(z, P.prototyp, P[id], id);
      const t = `${id} ${z[0]}: ${Number(e.a).toFixed(2)} -> ${Number(e.b).toFixed(2)} ${z[5]}${e.art === 'prozent' ? ` (${e.d >= 0 ? '+' : ''}${e.d.toFixed(1)} %)` : e.art === 'diff' ? ` (${e.d >= 0 ? '+' : ''}${e.d.toFixed(2)}°)` : ''}, Ziel ${e.ziel}`;
      const k = KOMPROMISSE[id] && KOMPROMISSE[id][z[0]];
      if (e.ok) melde(true, t); else if (k) komp(t, k); else melde(false, t);
    }
    const h = P[id].heck90_r80, g = P[id].gas_r80;
    melde(!h.dreher && !P[id].heck90_r80_voll.dreher, `${id}: kein Dreher beim Bremsen in der Kurve (auch mit Vollbremsung +${P[id].heck90_r80_voll.zusatz.toFixed(1)}°), Vollgas in der Kurve ohne Dreher (${g.max.toFixed(1)}°)`);
  }
  // Werte-Balken aus den Messungen
  const { AUTO_MODELLE, werteAusMessung } = await lade('js/autos.js');
  for (const id of AUTOS) {
    const w = werteAusMessung(P.prototyp, P[id]);
    melde(JSON.stringify(w) === JSON.stringify(AUTO_MODELLE[id].werte), `Werte-Balken ${AUTO_MODELLE[id].name}: gemessen ${JSON.stringify(w)}, in js/autos.js ${JSON.stringify(AUTO_MODELLE[id].werte)}`);
  }
  // Testfahrer je Auto
  const zeit = (t) => { const [mm, ss] = t.split(':'); return +mm * 60 + +ss; };
  const tf = {};
  for (const id of ['prototyp', ...AUTOS]) {
    const r = werkzeug('testfahrer.mjs', ['--auto', id]);
    tf[id] = {};
    for (const prof of ['vorsichtig', 'mittel', 'flott']) {
      const zeile = r.text.split('\n').find((z) => z.trim().startsWith(prof)) || '';
      const t = (zeile.match(/(\d+:\d\d\.\d\d)/) || [])[1];
      tf[id][prof] = { t: t ? zeit(t) : NaN, text: t, sauber: zeile.includes('Aufpralle: keine') && zeile.includes('hängen geblieben: 0') };
    }
  }
  for (const id of ['delto', 'escorta']) {
    for (const prof of ['vorsichtig', 'mittel', 'flott']) {
      const x = tf[id][prof], d = (x.t / tf.prototyp[prof].t - 1) * 100, [lo, hi] = TESTFAHRER[id];
      const t = `Testfahrer ${id} ${prof}: ${x.text} (${d >= 0 ? '+' : ''}${d.toFixed(2)} % gegen prototyp ${tf.prototyp[prof].text}), Ziel ${lo} bis ${hi} %, ohne Aufprall/Hänger`;
      const k = KOMPROMISSE[id] && KOMPROMISSE[id][`Testfahrer ${prof}`];
      if (x.sauber && d >= lo - 1e-9 && d <= hi + 1e-9) melde(true, t); else if (x.sauber && k) komp(t, k); else melde(false, t);
      if (id === 'delto') {
        const a = tf.rt4[prof], ta = `Testfahrer delto ${prof} gegen Audan: ${x.text} / ${a.text} (${(x.t - a.t >= 0 ? '+' : '')}${(x.t - a.t).toFixed(2)} s), nicht schneller als der Audan`;
        const ka = KOMPROMISSE.delto[`Testfahrer ${prof} gegen Audan`];
        if (x.t >= a.t - 1e-9) melde(true, ta); else if (ka) komp(ta, ka); else melde(false, ta);
      }
    }
  }
}

// ---------------------------------------------------------------- (g) Bestzeiten
if (teil('g')) {
  console.log('(g) Bestzeiten: gemeinsame Top 10 mit Kurznamen');
  const s = await starteSpiel({ breite: 320, hoehe: 180, auto: '' });
  const p = s.page;
  await p.goto(`${s.url}/index.html?menue=aus`);
  await p.waitForFunction(() => window.__alpineRally, null, { timeout: 120000 });
  const alt = [
    { zeit: 200.11, cps: [40, 110, 160], datum: '2026-09-01T10:00:00.000Z' }, // M5b, ohne Auto
    { zeit: 201.22, cps: [40, 110, 160], datum: '2026-09-02T10:00:00.000Z', auto: 'rt4', aufpralle: 0, resets: 0, hoechstTempo: 40 },
    { zeit: 202.33, cps: [40, 110, 160], datum: '2026-09-03T10:00:00.000Z', auto: 'prototyp', aufpralle: 1, resets: 0, hoechstTempo: 41 },
  ];
  await p.evaluate((a) => { localStorage.clear(); localStorage.setItem('alpineRally.bestzeiten', JSON.stringify({ passstrasse: a })); }, alt);
  const fahrerCode = fs.readFileSync(path.join(WURZEL, 'tools/testfahrer-browser.js'), 'utf8');
  const laeufe = {};
  for (const id of ['delto', 'escorta', 'rt4']) {
    await p.goto(`${s.url}/index.html?menue=aus&auto=${id}`);
    await p.waitForFunction(() => window.__alpineRally, null, { timeout: 120000 });
    laeufe[id] = await p.evaluate(async ([code, id]) => {
      const A = window.__alpineRally; A.anhalten = true;
      const f = await import(URL.createObjectURL(new Blob([code], { type: 'text/javascript' })));
      const { ladeBestzeiten } = await import('/js/bestzeiten.js');
      const bestVorher = ladeBestzeiten('passstrasse')[0].zeit, refVorher = A.vergleich.referenzBei(A.strecke.zielS + 50);
      const r = f.fahreEtappe(A, id === 'rt4' ? 'vorsichtig' : 'mittel');
      for (let i = 0; i < 5 && !A.lauf.zielErledigt; i++) await new Promise((res) => requestAnimationFrame(res));
      return { zeit: r.zeit, ziel: r.ziel, auto: A.lauf.ergebnis && A.lauf.ergebnis.auto, platz: A.lauf.ergebnis && A.lauf.ergebnis.platz, refZeit: refVorher, bestVorher, quelle: A.vergleich.ref.quelle };
    }, [fahrerCode, id]);
  }
  const liste = await p.evaluate(async () => {
    const A = window.__alpineRally; A.anhalten = false;
    const { ladeBestzeiten } = await import('/js/bestzeiten.js');
    const roh = JSON.parse(localStorage.getItem('alpineRally.bestzeiten')).passstrasse;
    A.menue.zeige(A.seiten.bestzeiten, true);
    A.ablauf.wechsle('menue'); A.menue.zeige(A.seiten.bestzeiten, true);
    await new Promise((r) => setTimeout(r, 600));
    const zeilen = A.menue.seite.eintraege().filter((e) => e.autoKurz).map((e) => `${e.inhalt()} ${e.autoKurz()}`);
    return { zeilen, schluessel: [...new Set(roh.flatMap((e) => Object.keys(e)))].sort(), best: ladeBestzeiten('passstrasse').map((e) => e.auto), rollen: A.menue.rollen };
  });
  await p.screenshot({ path: path.join(WURZEL, 'screenshots/m8c/70-bestzeiten-320x180.png') });
  melde(Object.values(laeufe).every((l) => l.ziel) && laeufe.delto.auto === 'delto' && laeufe.escorta.auto === 'escorta' && laeufe.rt4.auto === 'rt4',
    `Lauf mit jedem Auto eingetragen: ${Object.entries(laeufe).map(([k, l]) => `${k} ${l.zeit.toFixed(2)} s -> Auto "${l.auto}", Platz ${l.platz}`).join('; ')}`);
  const kurz = liste.zeilen.map((z) => z.split(' ').pop());
  melde(kurz.includes('DELTO') && kurz.includes('ESCORTA') && kurz.filter((k) => k === 'QUARTO').length === 3 && kurz.includes('PROTO') && liste.zeilen.length === 6,
    `gemeinsame Liste mit Kurznamen: ${liste.zeilen.join(' | ')}`);
  melde(liste.rollen && liste.rollen.breite <= 316, `Liste passt bei 320x180 (Tafel ${liste.rollen && liste.rollen.breite} Pixel breit; Bild screenshots/m8c/70-bestzeiten-320x180.png)`);
  melde(Math.abs(laeufe.escorta.refZeit - laeufe.escorta.bestVorher) < 0.02 && Math.abs(laeufe.escorta.bestVorher - Math.min(laeufe.delto.zeit, 200.11)) < 0.02 && laeufe.escorta.quelle === 'best',
    `Live-Vergleich gegen die gemeinsame Bestzeit: vor dem Escorta-Lauf Referenz im Ziel ${laeufe.escorta.refZeit.toFixed(2)} s = Bestzeit aller Autos (${laeufe.escorta.bestVorher.toFixed(2)} s, vom Delto)`);
  melde(JSON.stringify(liste.schluessel) === JSON.stringify(['aufpralle', 'auto', 'cps', 'datum', 'hoechstTempo', 'resets', 'spur', 'zeit']),
    `Format unverändert (Felder der Einträge: ${liste.schluessel.join(', ')})`);
  melde(s.fehler.length === 0, `keine Konsolenfehler (${s.fehler.length})`);
  await s.schliessen();
}

// ---------------------------------------------------------------- (h) Ton
if (teil('h')) {
  console.log('(h) Ton (offline gerechnet, nicht gehört)');
  const s = await starteSpiel({ breite: 640, hoehe: 360, args: ['--autoplay-policy=no-user-gesture-required'], auto: 'prototyp' });
  await s.page.goto(`${s.url}/index.html?menue=aus`);
  await s.page.waitForFunction(() => window.__alpineRally, null, { timeout: 120000 });
  const r = await s.page.evaluate(async () => {
    const P = await import('/tools/ton-pruefung.js');
    const FP = await import('/js/fahrprofil.js');
    const { Getriebe } = await import('/js/getriebe.js');
    const { baueKlangwerk } = await import('/js/audio.js');
    const M = P.CONFIG.audio.motor;
    const nurTurbo = (w) => { w.knoten.motorLast.disconnect(); w.knoten.heulenGain.disconnect(); };
    const out = {};
    for (const id of ['prototyp', 'rt4', 'delto', 'escorta']) {
      FP.waehleFahrprofil(id);
      const T = FP.tonWerte;
      // Pfeif-Band: 2 s Vollgas im 3. Gang mit dem echten Getriebe, nur das Turbo-Pfeifen hören (Blow-off/Pops stumm)
      const alt = [M.blowOffPegel, M.popPegel, M.klackPegel]; M.blowOffPegel = 0; M.popPegel = 0; M.klackPegel = 0;
      const v0 = 4400 / P.CONFIG.getriebe.nennDrehzahl * P.CONFIG.getriebe.gaenge[2] / 3.6;
      // (zweimal gerechnet: mit und ohne den Pfeif-Oszillator; der Unterschied ist das Pfeifen allein)
      const fahrt = (ohnePfeifen) => P.rendereVerlauf((w, t) => {
        const f = w.__f || (w.__f = { g: new Getriebe(), v: v0 });
        if (t === 0) { f.g.gang = 3; f.g.zielGang = 3; f.g.sperre = 99; }
        for (let k = 0; k < 2; k++) { const m = f.g.schritt(1 / 120, { gas: 1, bremse: 0 }, f.v, f.v, 1, 'asphalt'); f.v += (m.beschl - 0.0004 * f.v * f.v - 0.15) / 120; }
        w.aktualisiere(1 / 60, P.zustand({ drehzahl: f.g.drehzahl, gang: f.g.gang, zielGang: f.g.zielGang, schaltet: f.g.schaltet, gas: 1, tempo: f.v, vVor: f.v, ladedruck: f.g.ladedruck, turboAn: !!P.CONFIG.getriebe.turbo.an, turboMal: T.turboMal, knallMal: T.knallMal }));
      }, 2.0, { limiter: false, vorher: (w) => { nurTurbo(w); if (ohnePfeifen) w.knoten.turboGain.disconnect(); } });
      const x = await fahrt(false), y = await fahrt(true);
      [M.blowOffPegel, M.popPegel, M.klackPegel] = alt;
      const mit = P.miss(x.daten, 1.0, 1.9).rms, ohne = P.miss(y.daten, 1.0, 1.9).rms;
      const pfeifen = Math.sqrt(Math.max(0, mit * mit - ohne * ohne));
      // Pops und Blow-off über eine feste 60-s-Fahrt (wie tools/m8b-ton.mjs)
      const ctx = new OfflineAudioContext(1, P.RATE, P.RATE);
      const w = baueKlangwerk(ctx);
      const g = new Getriebe();
      let v = 12;
      const takt = [[1.6, 1], [0.9, 0], [0.5, 0.5], [1.2, 1], [0.7, 0], [1.4, 1], [0.6, 0.2], [2.0, 1], [1.0, 0]];
      const dauer = takt.reduce((a, [d]) => a + d, 0);
      let maxDruck = 0;
      for (let k = 0; k < 60 * 60; k++) {
        const t = (k / 60) % dauer;
        let s0 = 0, gas = 0;
        for (const [d, xx] of takt) { if (t < s0 + d) { gas = xx; break; } s0 += d; }
        for (let i = 0; i < 2; i++) { const m = g.schritt(1 / 120, { gas, bremse: 0 }, v, v, 1, 'asphalt'); v = Math.max(3, Math.min(48, v + (m.beschl - m.motorbremse * (gas ? 0 : 1) - 0.0004 * v * v - 0.15) / 120)); }
        w.aktualisiere(1 / 60, P.zustand({ drehzahl: g.drehzahl, gang: g.gang, zielGang: g.zielGang, schaltet: g.schaltet, gas, tempo: v, vVor: v, ladedruck: g.ladedruck, turboAn: !!P.CONFIG.getriebe.turbo.an, turboMal: T.turboMal, knallMal: T.knallMal }));
        maxDruck = Math.max(maxDruck, w.zustand.turbo);
      }
      out[id] = { pfeifenDb: P.dB(pfeifen), pfeifen, salven: w.zaehler.salve || 0, pops: w.zaehler.knall || 0, salvenMitPops: w.protokoll.filter((e) => e.art === 'salve' && e.wert > 0).length, blowOff: w.zaehler.blowOff || 0, maxTurboPegel: maxDruck, turboAn: !!P.CONFIG.getriebe.turbo.an, ton: { ...T } };
    }
    FP.waehleFahrprofil('prototyp');
    return out;
  });
  const f = (x) => `Pfeifen (Anteil) ${Number.isFinite(x.pfeifenDb) ? x.pfeifenDb.toFixed(1) : '-∞'} dBFS, ${x.salvenMitPops} Salven mit ${x.pops} Pops, ${x.blowOff} Blow-off`;
  for (const id of ['prototyp', 'rt4', 'delto', 'escorta']) console.log(`       ${id.padEnd(9)} ${f(r[id])} (turboMal ${r[id].ton.turboMal}, knallMal ${r[id].ton.knallMal}, Turbo ${r[id].turboAn ? 'an' : 'aus'})`);
  melde(Math.abs(r.delto.pfeifenDb - r.rt4.pfeifenDb) < 1.5 && Math.abs(r.rt4.pfeifenDb - r.prototyp.pfeifenDb) > 1 && r.delto.blowOff > 0 && Math.abs(r.delto.salvenMitPops - r.rt4.salvenMitPops) <= 3,
    `Delto wie Audan (Pfeifen ${r.delto.pfeifenDb.toFixed(1)} / ${r.rt4.pfeifenDb.toFixed(1)} dBFS, Salven ${r.delto.salvenMitPops} / ${r.rt4.salvenMitPops}; der Turbo baut beim Delto 0.4 statt 0.35 s auf)`);
  melde(r.escorta.pfeifen < 1e-4 && r.escorta.maxTurboPegel === 0 && r.escorta.blowOff === 0 && r.prototyp.pfeifen > 1e-3,
    `Escorta: kein Turbo-Pfeifen (Anteil des Pfeifens RMS ${r.escorta.pfeifen.toExponential(1)} gegen prototyp ${r.prototyp.pfeifen.toExponential(1)}, höchster Turbo-Pegel ${r.escorta.maxTurboPegel}), kein Blow-off (${r.escorta.blowOff})`);
  const q = r.escorta.salvenMitPops / Math.max(1, r.prototyp.salvenMitPops);
  melde(q >= 0.3 && q <= 0.7, `Escorta: Pops über 60 s ${r.escorta.salvenMitPops} Salven (${r.escorta.pops} Pops) gegen prototyp ${r.prototyp.salvenMitPops} (${r.prototyp.pops} Pops): ${(q * 100).toFixed(0)} % (Ziel ca. halb so viele)`);
  melde(s.fehler.length === 0, `Konsole ohne Fehler (${s.fehler.length})`);
  await s.schliessen();
}

// ---------------------------------------------------------------- (i) Demo-Fahrt mit jedem Auto
if (teil('i')) {
  console.log('(i) Demo-Fahrt mit jedem Auto');
  const s = await starteSpiel({ breite: 320, hoehe: 180, auto: '' });
  for (const id of AUTOS) {
    await s.page.goto(`${s.url}/index.html?auto=${id}`);
    await s.page.waitForFunction(() => window.__alpineRally && window.__alpineRally.menue, null, { timeout: 120000 });
    const r = await s.page.evaluate(() => {
      const A = window.__alpineRally;
      A.anhalten = true; A.zumMenue(); A.demo.start();
      let t = 0, steh = 0, maxSteh = 0, kontakte = 0, stark = 0, letzter = A.kollision.letzterAufprall, idxMax = 0, neustart = false;
      while (t < 260) {
        const vorher = A.demo.index;
        A.demo.schritt(A.SCHRITT); A.demo.bild(A.SCHRITT, 0);
        t += A.SCHRITT;
        if (A.demo.index < vorher - 100) { neustart = true; break; }
        idxMax = Math.max(idxMax, A.demo.index);
        if (A.kollision.wucht > 0.5) kontakte++;
        if (A.kollision.letzterAufprall !== letzter) { letzter = A.kollision.letzterAufprall; stark++; }
        if (A.physik.tempo < 0.5) { steh += A.SCHRITT; maxSteh = Math.max(maxSteh, steh); } else steh = 0;
      }
      return { t, neustart, kontakte, stark, maxSteh, ziel: A.strecke.s[idxMax] > A.strecke.zielS, auto: A.auto };
    });
    melde(r.ziel && r.stark === 0 && r.maxSteh < 1 && r.auto === id,
      `Demo ${id}: ganze Etappe (${r.t.toFixed(0)} s bis zum Neubeginn), ${r.stark} Aufpralle, ${r.kontakte} Schritte mit Kontakt, längster Stand ${r.maxSteh.toFixed(1)} s`);
  }
  melde(s.fehler.length === 0, `keine Konsolenfehler (${s.fehler.length})`);
  await s.schliessen();
  if (!process.argv.includes('--kurz')) {
    for (const id of AUTOS) {
      for (const t of ['menue-test', 'rennablauf-test']) {
        let r = werkzeug(`${t}.mjs`, ['--auto', id]), versuch = 1;
        if (r.code !== 0) { r = werkzeug(`${t}.mjs`, ['--auto', id]); versuch = 2; }
        melde(r.code === 0, `${t} mit ${id}: ${r.code === 0 ? `bestanden${versuch > 1 ? ' im 2. Versuch' : ''}` : `FEHLER – ${(r.text.match(/FEHLER.*$/m) || [''])[0].slice(0, 160)}`}`);
      }
    }
  }
}

// ---------------------------------------------------------------- (j) Garage
if (teil('j')) {
  console.log('(j) Garage');
  const s = await starteSpiel({ breite: 320, hoehe: 180, auto: '' });
  const p = s.page;
  await p.goto(`${s.url}/index.html`);
  await p.waitForFunction(() => window.__alpineRally && window.__alpineRally.menue, null, { timeout: 120000 });
  await p.evaluate(() => window.__alpineRally.zumMenue());
  await p.waitForTimeout(800);
  const zu = await p.evaluate(async () => {
    const A = window.__alpineRally, warte = (ms) => new Promise((r) => setTimeout(r, ms));
    const b0 = A.garage.info.bilder; await warte(700);
    return { bilder: A.garage.info.bilder - b0, calls: A.renderer.info.render.calls, szene: A.szeneInfo.calls };
  });
  melde(zu.bilder === 0 && zu.calls === zu.szene, `ohne Seite AUTO: Garage zeichnet nichts (${zu.bilder} Bilder), Zeichenaufrufe des Bildes = nur die Szene (${zu.calls} / ${zu.szene})`);
  const auf = await p.evaluate(async () => {
    const A = window.__alpineRally, warte = (ms) => new Promise((r) => setTimeout(r, ms));
    A.menue.oeffne(A.seiten.auto); await warte(1500);
    const b0 = A.garage.info.bilder, w0 = A.garage.winkel; await warte(2000);
    return { seite: A.menue.seite.id, bilder: A.garage.info.bilder - b0, winkel: A.garage.winkel - w0, calls: A.garage.info.calls, rahmen: A.seiten.garage.rahmen, rollen: A.menue.rollen, szene: A.szeneInfo.calls };
  });
  melde(auf.seite === 'auto' && auf.bilder >= 2 && auf.winkel > 0 && auf.calls > 0 && auf.calls <= 14,
    `Seite AUTO offen: Vorschau dreht (${auf.bilder} Bilder in 2 s, Winkel +${(auf.winkel * 180 / Math.PI).toFixed(0)}°; 8 s pro Umdrehung = 45°/s, im Test-Browser mit wenigen Bildern pro Sekunde weniger, weil dt auf 0.1 s begrenzt ist), ${auf.calls} Zeichenaufrufe für Auto und Drehscheibe, Szene ${auf.szene}`);
  melde(auf.rahmen && auf.rollen.breite <= 316 && auf.rollen.y0 + auf.rollen.hoehe <= 180, `Tafel bei 320x180: ${auf.rollen.breite} x ${auf.rollen.hoehe} Pixel, Vorschau ${auf.rahmen.b} x ${auf.rahmen.h}`);
  // Tastatur, Lack, Maus, Gamepad
  const bed = await p.evaluate(async () => {
    const A = window.__alpineRally, warte = (ms) => new Promise((r) => setTimeout(r, ms)), erg = {};
    const a0 = A.autoWahl.auto;
    A.menue.taste('ArrowDown', false); await warte(100); erg.tastatur = [a0, A.autoWahl.auto];
    // zur LACK-Zeile
    for (let k = 0; k < 6 && !A.menue.seite.eintraege()[A.menue.wahl].lack; k++) A.menue.taste('ArrowDown', false);
    const l0 = A.autoModell.lackName; A.menue.taste('ArrowRight', false); await warte(100); erg.lack = [l0, A.autoModell.lackName];
    // Maus: auf die erste Auto-Zeile zeigen
    await warte(300);
    const h = A.menue.treffer.find((t) => A.menue.seite.eintraege()[t.nr].autoId === 'escorta');
    if (h) A.menue.maus(h.x + 5, h.y + 2, 'bewegen');
    await warte(100); erg.maus = A.autoWahl.auto;
    // Gamepad: Steuerkreuz hoch
    const G = A.CONFIG.menue.gamepad, gedrueckt = []; gedrueckt[G.hoch] = true;
    A.menue.gamepad(0.016, { da: true, neu: [], gedrueckt, achseX: 0, achseY: 0 });
    await warte(100); erg.gamepad = A.autoWahl.auto;
    A.menue.gamepad(0.016, { da: true, neu: [], gedrueckt: [], achseX: 0, achseY: 0 });
    // Balken: Werte des gewählten Autos, Texte
    const { AUTO_MODELLE } = await import('/js/autos.js');
    erg.werte = AUTO_MODELLE[A.autoWahl.modell].werte;
    return erg;
  });
  melde(bed.tastatur[0] !== bed.tastatur[1], `Tastatur: ${bed.tastatur.join(' -> ')}`);
  melde(bed.lack[0] !== bed.lack[1], `LACK mit Pfeil rechts: ${bed.lack.join(' -> ')}`);
  melde(bed.maus === 'escorta', `Maus auf FARD ESCORTA: ${bed.maus}`);
  melde(bed.gamepad === 'delto', `Gamepad Steuerkreuz hoch: ${bed.gamepad}`);
  // Texte de und en passen (Pixelbreiten)
  const { textBreite } = await import(pathToFileURL(path.join(WURZEL, 'tools/node-three.mjs')).href).then(() => lade('js/pixel.js'));
  const T = await lade('js/texte.js'), { CONFIG } = await lade('js/config.js'), { AUTO_MODELLE } = await lade('js/autos.js');
  const GA = CONFIG.garage, rechts = auf.rahmen.b, zuBreit = [];
  for (const sprache of ['de', 'en']) {
    T.setzeSprache(sprache);
    const lb = Math.max(...['garage.beschleunigung', 'garage.tempo', 'garage.grip', 'garage.drift'].map((k) => textBreite(T.t(k))));
    if (lb + 6 + 60 > rechts) zuBreit.push(`${sprache}: Balken ${lb + 66} > ${rechts}`);
    for (const id of AUTOS) {
      for (const k of ['daten1', 'daten2']) if (textBreite(T.t(`auto.${id}.${k}`)) > GA.tafelBreite - 2 * CONFIG.menue.innen - 2) zuBreit.push(`${sprache} ${id}.${k}`);
      if (10 + textBreite(T.t(`auto.${id}.name`)) > GA.spalte - 2 * CONFIG.menue.innen) zuBreit.push(`${sprache} ${id}.name`);
      for (const l of AUTO_MODELLE[id].lackierungen) if (10 + 10 + textBreite(T.t(`lack.${l}`)) + 16 + 10 > GA.spalte - 2 * CONFIG.menue.innen) zuBreit.push(`${sprache} lack.${l}`);
    }
  }
  melde(zuBreit.length === 0, `Texte de und en passen in die Tafeln bei 320x180${zuBreit.length ? `: ${zuBreit.join(', ')}` : ''}`);
  melde(bed.werte && Object.values(bed.werte).every((w) => w >= 1 && w <= 10), `Balken zeigen die Daten des gewählten Autos (${JSON.stringify(bed.werte)})`);
  // schliessen: wieder ohne Aufwand
  const nachher = await p.evaluate(async () => {
    const A = window.__alpineRally, warte = (ms) => new Promise((r) => setTimeout(r, ms));
    A.menue.zurueck(); await warte(600);
    const b0 = A.garage.info.bilder; await warte(600);
    return { seite: A.menue.seite.id, bilder: A.garage.info.bilder - b0 };
  });
  melde(nachher.seite === 'haupt' && nachher.bilder === 0, `Seite geschlossen (${nachher.seite}): Garage zeichnet nichts mehr (${nachher.bilder})`);
  melde(s.fehler.length === 0, `keine Konsolenfehler (${s.fehler.length})`);
  await s.schliessen();
}

// ---------------------------------------------------------------- (k) Fahr-Labor und Auto-Labor
if (teil('k')) {
  console.log('(k) Fahr-Labor und Auto-Labor');
  const s = await starteSpiel({ breite: 1280, hoehe: 720 });
  await s.page.goto(`${s.url}/index.html?menue=aus&fahrlabor=1&auto=delto`);
  await s.page.waitForFunction(() => window.__alpineRally && window.__alpineRally.fahrlabor, null, { timeout: 120000 });
  const fl = await s.page.evaluate(() => {
    const A = window.__alpineRally, panel = A.fahrlabor.panel, erg = { knoepfe: [...panel.querySelectorAll('[data-profil]')].map((b) => b.dataset.profil), profile: [] };
    for (const id of erg.knoepfe) { panel.querySelector(`[data-profil="${id}"]`).click(); erg.profile.push(`${id}:${A.auto}:${A.CONFIG.auto.radstand}`); }
    panel.querySelector('[data-profil="escorta"]').click();
    const r = [...panel.querySelectorAll('.regler input')][0]; r.value = 0.9; r.dispatchEvent(new Event('input'));
    erg.wirkt = A.CONFIG.auto.gripVorne;
    panel.querySelector('#fahrlaborKopieren').click();
    erg.text = panel.querySelector('#fahrlaborText').value;
    erg.modell = A.autoModell.modell.id;
    return erg;
  });
  melde(JSON.stringify(fl.knoepfe) === JSON.stringify(['prototyp', 'rt4', 'delto', 'escorta']) && fl.profile.every((x) => x.split(':')[0] === x.split(':')[1]),
    `Fahr-Labor: Knöpfe ${fl.knoepfe.join(' / ')} schalten live (${fl.profile.join(', ')}), Aussehen bleibt (${fl.modell})`);
  melde(fl.wirkt === 0.9 && fl.text.split('\n')[0] === 'profil = escorta' && /auto\.gripVorne = 0\.9/.test(fl.text), `Regler wirken auf das gewählte Profil, WERTE KOPIEREN: ${JSON.stringify(fl.text)}`);
  await s.page.goto(`${s.url}/index.html?menue=aus`);
  await s.page.waitForFunction(() => window.__alpineRally, null, { timeout: 120000 });
  melde(await s.page.evaluate(() => !document.getElementById('fahrlabor')), 'ohne ?fahrlabor=1 kein Panel');
  await s.page.goto(`${s.url}/auto-labor.html`);
  await s.page.waitForFunction(() => window.__autoLabor, null, { timeout: 60000 });
  const al = await s.page.evaluate(() => {
    const L = window.__autoLabor, $ = (id) => document.getElementById(id), out = [];
    for (const o of [...$('modell').options]) {
      $('modell').value = o.value; $('modell').dispatchEvent(new Event('change'));
      const lacke = [...$('lackierung').options].map((x) => x.value);
      for (const l of lacke) { $('lackierung').value = l; $('lackierung').dispatchEvent(new Event('change')); L.zeichne(0.016); }
      out.push(`${o.value}: ${lacke.join('/')} (${L.auto.modell.id}, Titel ${document.getElementById('titel').textContent.split(' · ').pop()})`);
    }
    return out;
  });
  melde(al.length === 3 && al.every((x) => x.split('/').length === 3), `Auto-Labor: ${al.join('; ')}`);
  melde(s.fehler.length === 0, `keine Konsolenfehler (${s.fehler.length})`);
  await s.schliessen();
}

// ---------------------------------------------------------------- (l) Stabilität
if (teil('l')) {
  console.log('(l) Stabilität: bisherige Tests mit prototyp (lang), Ladezeit');
  for (const t of ['getriebe-test', 'lenk-test', 'handbremse-test', 'belag-test', 'rueckwaerts-test', 'aufprall-test', 'pacenotes-test', 'menue-test',
    'rennablauf-test', 'ton-test', 'ton-umgebung-test']) {
    let r = werkzeug(`${t}.mjs`), versuch = 1;
    if (r.code !== 0) { r = werkzeug(`${t}.mjs`); versuch = 2; } // (zeitkritische Prüfungen im Test-Browser, siehe STAND.md M8a/M8b)
    melde(r.code === 0, `${t} (prototyp): ${r.code === 0 ? `bestanden${versuch > 1 ? ' im 2. Versuch' : ''}` : `FEHLER – ${(r.text.match(/FEHLER.*$/m) || [''])[0].slice(0, 160)}`}`);
  }
  teilWerkzeug('auto-test.mjs', [], 'auto-test (a)-(n)');
  teilWerkzeug('m8b-test.mjs', ['--nur', 'a,b,c,d,e,f,g'], 'm8b-test (a)-(g)');
  if (arg('--alt')) {
    const r = werkzeug('ladezeit.mjs', [arg('--alt'), '9']);
    const med = (n) => +((r.text.match(new RegExp(`${n} .*Median (\\d+)`)) || [])[1]);
    const a = med('alt'), b = med('neu');
    melde(b - a <= 30 || b - a <= 0.1 * a, `Ladezeit (Median aus 9, abwechselnd): 0.8b ${a} ms, 0.8c ${b} ms (${b - a >= 0 ? '+' : ''}${b - a} ms; Ziel höchstens +30 ms, Streuung im Test-Browser ca. ±200 ms)`);
  }
}

console.log(fehler ? `\n${fehler} FEHLER` : '\nalles ok');
process.exit(fehler ? 1 : 0);
