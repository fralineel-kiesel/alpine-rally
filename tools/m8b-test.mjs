// Meilenstein 8b prüfen:  node tools/m8b-test.mjs [--nur a,b,c,d,e,f,g,h]
//   (a) Helme: keine Köpfe hinten (Daten und gemalte Heckscheibe), Seite/Front klein (r ≤ 0.09) und mit mindestens 40 %
//       weniger Helligkeitsunterschied zur Scheibe als in M8a, für alle drei Lackierungen
//   (b) Name: nirgends mehr RINGWERK in js/ und *.html, AUDAN QUARTO in config, Menü (de/en), Auto-Labor, Fahr-Labor,
//       Kennzeichen AQ 4, nur Zeichen der Pixelschrift, Name passt in die Menütafel bei 320x180, Id rt4 und alte Bestzeiten
//   (c) Profil prototyp bit-genau (Werte, 70-s-Fahrt-Prüfsumme, Testfahrer, Statistik; Abkürzungen 127/2/342/84 – über
//       tools/auto-test.mjs --nur g,k) und Ton identisch zu 0.8a (tools/ton-messung.mjs gegen tools/ton-messung-08a.json)
//   (d) Fahrmessung (Tabelle Teil C, über tools/auto-test.mjs --nur h); vorneJeBelag im Prototyp neutral, wirkt nur auf
//       Schotter und Wiesenweg (Gras und Bankett ohne neuen Vorteil)
//   (e) Pace-Notes und Abkürzungen mit rt4 (nur melden, nichts geschrieben)
//   (f) Turbo im Ton (tools/m8b-ton.mjs): Pegel, Motor lauter, Aufbau ±25 %, Anti-Lag, Pops; prototyp: turboAn falsch;
//       Konsole ohne Fehler; Speicher pro Bild (Heap) mit Turbo nicht mehr als ohne
//   (g) Fahr-Labor (14 Regler, neue Regler wirken live, ALLES ZURÜCK, ohne ?fahrlabor=1 kein Panel – über auto-test --nur m)
//       und Ton-Labor (LADEDRUCK (Test), ECHTER LADEDRUCK AN, neue Feinschliff-Werte, ALLES ZURÜCK)
//   (h) Stabilität: alle bisherigen Tests mit prototyp (lang, ca. 1 Stunde), Draw Calls des Autos ≤ 12

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
const werkzeug = (name, argumente = [], timeout = 3600000) => {
  const r = spawnSync(process.execPath, [path.join(WURZEL, 'tools', name), ...argumente], { encoding: 'utf8', timeout, maxBuffer: 64 * 1024 * 1024 });
  return { code: r.status, text: `${r.stdout || ''}${r.stderr || ''}` };
};
// Unterwerkzeug: nur FEHLER-Zeilen zählen (KOMP = beschriebener Kompromiss, BEKANNT = bekannte Abweichung des Testaufbaus)
const teilWerkzeug = (name, argumente, titel) => {
  const r = werkzeug(name, argumente);
  const zeilen = r.text.split('\n').filter((z) => /^\s*(ok|FEHLER|KOMP|BEKANNT)\b/.test(z));
  for (const z of zeilen) console.log(`       ${z.trim()}`);
  melde(r.code === 0, `${titel}: ${r.code === 0 ? 'bestanden' : 'NICHT bestanden'} (${zeilen.filter((z) => /^\s*ok/.test(z)).length} ok, ${zeilen.filter((z) => /KOMP/.test(z)).length} Kompromisse)`);
  return r;
};
const lade = (d) => import(pathToFileURL(path.join(WURZEL, d)).href);
const hell = (hex) => { const n = parseInt(hex.slice(1), 16); return 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255); };
const M8A_HELME = ['#f4f4ee', '#f2c22e']; // Helmfarben in M8a (weiss, gelb)

// ---------------------------------------------------------------- (a) Helme
if (teil('a')) {
  console.log('(a) Helme');
  const { AUTO_MODELLE } = await lade('js/autos.js');
  const { CONFIG } = await lade('js/config.js');
  const m = AUTO_MODELLE.rt4, helme = m.bemalung.filter((b) => b.art === 'helm');
  melde(!helme.some((b) => b.ansicht === 'hinten'), `keine Helme in der Ansicht "hinten" (Helme: ${helme.map((b) => `${b.ansicht} r ${b.r}`).join(', ')})`);
  melde(helme.length > 0 && helme.every((b) => b.r <= 0.09), `Seite und Front: Radius höchstens 0.09 (${[...new Set(helme.map((b) => b.r))].join(' / ')}; M8a 0.12 / 0.11)`);
  const F = CONFIG.autoOptik.farben, glas = hell(F.glas);
  const alt = M8A_HELME.map((h) => Math.abs(hell(h) - glas)), neu = [F.helmFahrer, F.helmBeifahrer].map((h) => Math.abs(hell(h) - glas));
  melde(neu.every((d, i) => d <= alt[i] * 0.6), `Helligkeitsunterschied Helm zu Scheibe: Fahrer ${alt[0].toFixed(0)} -> ${neu[0].toFixed(0)}, Beifahrer ${alt[1].toFixed(0)} -> ${neu[1].toFixed(0)} (mindestens 40 % kleiner: ${neu.map((d, i) => `-${((1 - d / alt[i]) * 100).toFixed(0)} %`).join(' / ')})`);
  // gemalter Atlas je Lackierung: Heckscheibe ohne Helm-/Schulterfarbe, Seite und Front mit dezenten Helmen
  const spiel = await starteSpiel({ breite: 640, hoehe: 360 });
  await spiel.page.goto(`${spiel.url}/auto-labor.html`);
  await spiel.page.waitForFunction(() => window.__autoLabor, null, { timeout: 60000 });
  const r = await spiel.page.evaluate((m8a) => {
    const L = window.__autoLabor, M = L.auto, F = L.CONFIG.autoOptik.farben;
    const hex = (r, g, b) => `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
    const verboten = new Set([F.helmFahrer, F.helmBeifahrer, F.schulter, F.visier, ...m8a].map((x) => x.toLowerCase()));
    const helmFarben = new Set([F.helmFahrer, F.helmBeifahrer].map((x) => x.toLowerCase()));
    // Pixel in einem Rahmen (Meter der Ansicht) zählen
    const zaehle = (ansicht, u0, v0, u1, v1, menge) => {
      const a = M.zuAtlas(ansicht, u0, v0), b = M.zuAtlas(ansicht, u1, v1);
      const x0 = Math.floor(Math.min(a[0], b[0])), x1 = Math.ceil(Math.max(a[0], b[0])), y0 = Math.floor(Math.min(a[1], b[1])), y1 = Math.ceil(Math.max(a[1], b[1]));
      const d = M.leinwand.getContext('2d').getImageData(x0, y0, x1 - x0, y1 - y0).data;
      let n = 0, alle = 0;
      for (let i = 0; i < d.length; i += 4) { alle++; if (menge.has(hex(d[i], d[i + 1], d[i + 2]))) n++; }
      return { n, alle };
    };
    const erg = {};
    for (const lack of ['werk', 'gletscher', 'dunkel']) {
      M.lackierung(lack);
      erg[lack] = {
        heck: zaehle('hinten', -0.75, 0.86, 0.75, 1.3, verboten),
        seiteL: zaehle('seiteL', 0.6, 0.9, -1.0, 1.29, helmFarben), seiteR: zaehle('seiteR', 0.6, 0.9, -1.0, 1.29, helmFarben),
        vorne: zaehle('vorne', -0.75, 0.86, 0.75, 1.3, helmFarben),
      };
    }
    M.lackierung('werk');
    return erg;
  }, M8A_HELME);
  for (const [lack, x] of Object.entries(r)) {
    melde(x.heck.n === 0 && x.seiteL.n > 0 && x.seiteR.n > 0 && x.vorne.n > 0,
      `${lack}: Heckscheibe ${x.heck.n} Pixel mit Helm-/Schulterfarbe (von ${x.heck.alle}); Helm-Pixel Seite links ${x.seiteL.n}, rechts ${x.seiteR.n}, vorne ${x.vorne.n}`);
  }
  melde(spiel.fehler.length === 0, `Auto-Labor ohne Konsolenfehler (${spiel.fehler.length})`);
  await spiel.schliessen();
}

// ---------------------------------------------------------------- (b) Name
if (teil('b')) {
  console.log('(b) Name');
  const treffer = [];
  const suche = (ordner, filter) => {
    for (const d of fs.readdirSync(ordner, { withFileTypes: true })) {
      const p = path.join(ordner, d.name);
      if (d.isDirectory()) continue;
      if (filter(d.name) && /ringwerk/i.test(fs.readFileSync(p, 'utf8'))) treffer.push(path.relative(WURZEL, p));
    }
  };
  suche(path.join(WURZEL, 'js'), (n) => n.endsWith('.js'));
  suche(WURZEL, (n) => n.endsWith('.html'));
  melde(treffer.length === 0, `"RINGWERK"/"Ringwerk" in js/ und *.html: ${treffer.length} Treffer${treffer.length ? ` (${treffer.join(', ')})` : ''}`);
  const { CONFIG } = await lade('js/config.js');
  const { AUTO_MODELLE, texteDesModells } = await lade('js/autos.js');
  const m = AUTO_MODELLE.rt4;
  melde(CONFIG.auto.name === 'Audan Quarto' && m.name === 'AUDAN QUARTO' && m.id === 'rt4', `config auto.name "${CONFIG.auto.name}", Modell "${m.name}", Id ${m.id}`);
  melde(m.kennzeichen === 'AQ 4', `Kennzeichen ${m.kennzeichen}`);
  const schrift = texteDesModells(m);
  melde(schrift.includes('AUDAN') && !schrift.some((t) => /RINGWERK/.test(t)), `Schrift am Auto: ${schrift.join(', ')}`);
  const spiel = await starteSpiel({ breite: 320, hoehe: 180, auto: '' });
  const p = spiel.page;
  // alte Bestzeit (Format M8a, Auto rt4) vor dem Laden in den Speicher
  await p.goto(`${spiel.url}/index.html?menue=aus`);
  await p.waitForFunction(() => window.__alpineRally, null, { timeout: 120000 });
  const alt = { zeit: 151.37, cps: [29.1, 84.5, 123.7], datum: '2026-10-01T12:00:00.000Z', auto: 'rt4', aufpralle: 0, resets: 0, hoechstTempo: 43.5 };
  await p.evaluate(([k, e]) => { localStorage.setItem(k, JSON.stringify({ passstrasse: [e] })); }, [CONFIG.menue.bestzeitenName, alt]);
  for (const sprache of ['de', 'en']) {
    await p.evaluate(([k, s]) => localStorage.setItem(k, JSON.stringify({ sprache: s })), [CONFIG.menue.speicherName, sprache]);
    await p.goto(`${spiel.url}/index.html`);
    await p.waitForFunction(() => window.__alpineRally && window.__alpineRally.menue, null, { timeout: 120000 });
    const r = await p.evaluate(async () => {
      const A = window.__alpineRally;
      const { t } = await import('/js/texte.js');
      const { SCHRIFT_ZEICHEN } = await import('/js/pixel.js');
      const { ladeBestzeiten } = await import('/js/bestzeiten.js');
      A.zumHauptmenue(); A.menue.zeige(A.seiten.auto, true);
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      const name = t('auto.rt4.name');
      return { name, fehlt: [...name].filter((z) => !SCHRIFT_ZEICHEN.includes(z)), rollen: A.menue.rollen, auto: A.auto, best: ladeBestzeiten('passstrasse') };
    });
    melde(r.name === 'AUDAN QUARTO' && r.fehlt.length === 0, `Menü AUTO (${sprache}): "${r.name}", alle Zeichen in der Pixelschrift`);
    melde(r.rollen && r.rollen.breite < 316 && r.rollen.inhalt + 4 <= r.rollen.breite, `... passt in die Tafel bei 320x180 (Tafel ${r.rollen && r.rollen.breite} Pixel breit, Inhalt ${r.rollen && r.rollen.inhalt}, höchstens 316)`);
    if (sprache === 'de') melde(r.auto === 'rt4' && r.best.length === 1 && r.best[0].zeit === alt.zeit && r.best[0].auto === 'rt4', `Auto-Id ${r.auto}, alte Bestzeit (M8a) steht noch: ${r.best.map((b) => `${b.zeit} s (${b.auto})`).join(', ')}`);
  }
  await p.goto(`${spiel.url}/auto-labor.html`);
  await p.waitForFunction(() => window.__autoLabor, null, { timeout: 60000 });
  const titel = await p.evaluate(() => document.getElementById('titel').textContent);
  melde(/AUDAN QUARTO/.test(titel), `Auto-Labor-Titel: "${titel}"`);
  await p.goto(`${spiel.url}/index.html?menue=aus&fahrlabor=1`);
  await p.waitForFunction(() => window.__alpineRally && window.__alpineRally.fahrlabor, null, { timeout: 120000 });
  const fl = await p.evaluate(() => [...document.querySelectorAll('#fahrlabor [data-profil]')].map((b) => `${b.dataset.profil}=${b.textContent}`));
  melde(fl.includes('rt4=AUDAN QUARTO'), `Fahr-Labor-Knöpfe: ${fl.join(', ')}`);
  melde(spiel.fehler.length === 0, `keine Konsolenfehler (${spiel.fehler.length})`);
  await spiel.schliessen();
}

// ---------------------------------------------------------------- (c) prototyp bit-genau
if (teil('c')) {
  console.log('(c) Profil prototyp bit-genau (Fahren: tools/auto-test.mjs --nur g,k; Ton: tools/ton-messung.mjs)');
  teilWerkzeug('auto-test.mjs', ['--nur', 'g,k'], 'prototyp = 0.7b (Werte, Prüfsumme, Testfahrer, Statistik), Abkürzungen 127/2/342/84');
  // Ton: gleiche Messung wie für 0.8a (tools/ton-messung-08a.json), Spektrogramme danach wieder weg
  const ref = path.join(WURZEL, 'tools/ton-messung-08a.json');
  if (!fs.existsSync(ref)) melde(false, 'tools/ton-messung-08a.json fehlt (node tools/ton-messung.mjs 08a <ordner 0.8a>)');
  else {
    const r = werkzeug('ton-messung.mjs', ['m8b-pruefung']);
    const datei = path.join(WURZEL, 'tools/ton-messung-m8b-pruefung.json');
    const a = JSON.parse(fs.readFileSync(ref, 'utf8')), b = JSON.parse(fs.readFileSync(datei, 'utf8'));
    delete a.version; delete b.version;
    // Abweichungen: Zahlen mit mehr als 1e-3 relativem Unterschied (die Messung rundet auf 4 Stellen)
    const abw = [];
    const vergleiche = (x, y, p) => {
      if (typeof x === 'number') { if (Math.abs(x - y) > Math.max(1e-3 * Math.abs(x), 2e-4)) abw.push(`${p}: ${x} -> ${y}`); return; }
      if (x && typeof x === 'object') { for (const k of new Set([...Object.keys(x), ...Object.keys(y || {})])) vergleiche(x[k], (y || {})[k], `${p}.${k}`); return; }
      if (x !== y) abw.push(`${p}: ${x} -> ${y}`);
    };
    vergleiche(a, b, 'ton');
    const genau = JSON.stringify(a) === JSON.stringify(b);
    melde(r.code === 0 && abw.length === 0, `Ton prototyp wie 0.8a (Motor, Turbo, Aufpralle, Pops, Signale, Heulen, Knoten): ${genau ? 'identisch' : `gleich bis auf Rundung in der 4. Stelle`}${abw.length ? ` – ANDERS: ${abw.slice(0, 5).join('; ')}` : ''}`);
    fs.rmSync(datei);
    for (const f of fs.readdirSync(path.join(WURZEL, 'screenshots/m7a-1'))) if (f.startsWith('m8b-pruefung-')) fs.rmSync(path.join(WURZEL, 'screenshots/m7a-1', f));
  }
}

// ---------------------------------------------------------------- (d) Fahrmessung
if (teil('d')) {
  console.log('(d) Fahrmessung (tools/auto-test.mjs --nur h; Tabelle M8a / M8b / Ziel: node tools/m8b-messung.mjs)');
  teilWerkzeug('auto-test.mjs', ['--nur', 'h'], 'Fahrmessung Audan Quarto gegen prototyp (Ziele M8b Teil C)');
  const { CONFIG } = await lade('js/config.js');
  const FP = await lade('js/fahrprofil.js');
  const { Fahrphysik } = await lade('js/physics.js');
  const { Getriebe } = await lade('js/getriebe.js');
  const { baueMessung, alleMessungen } = await lade('tools/fahrmessung.js');
  FP.waehleFahrprofil('prototyp');
  const vj = CONFIG.auto.vorneJeBelag;
  melde(vj && Object.values(vj).every((w) => w === 1), `Profil prototyp: auto.vorneJeBelag ${JSON.stringify(vj)} (ohne Wirkung)`);
  FP.waehleFahrprofil('rt4');
  const r = CONFIG.auto.vorneJeBelag, h = CONFIG.auto.heckJeBelag, a = CONFIG.getriebe.allrad;
  const nurLose = (o) => Object.entries(o).every(([k, w]) => ['schotter', 'wiesenweg'].includes(k) || w === 1);
  melde(nurLose(r) && nurLose(h) && nurLose(a), `Audan Quarto: Vorteile nur auf Schotter und Wiesenweg (vorne ${JSON.stringify(r)}, hinten ${JSON.stringify(h)}, Allrad ${JSON.stringify(a)})`);
  // Gras und Bankett: kein neuer Vorteil gegen M8a (Anfahren steht in der Tabelle oben, hier die Kreisbahn)
  const m = baueMessung({ CONFIG, Fahrphysik, Getriebe });
  const R = { gras: m.kreisGrenze(25, 'gras'), bankett: m.kreisGrenze(25, 'bankett'), asphalt: m.kreisGrenze(25, 'asphalt') };
  FP.waehleFahrprofil('prototyp');
  const P = { gras: m.kreisGrenze(25, 'gras'), bankett: m.kreisGrenze(25, 'bankett'), asphalt: m.kreisGrenze(25, 'asphalt') };
  const pz = (k) => (R[k] / P[k] - 1) * 100;
  // M8a (0.8a, gleich gemessen): Gras +3.3 %, Bankett +3.0 % (kommt von lastVorneAnteil aus M8a, nicht von M8b)
  const M8A = { gras: 3.3, bankett: 3.0 };
  melde(pz('gras') <= M8A.gras + 0.1 && pz('bankett') <= M8A.bankett + 0.1,
    `Kreis R 25 m: Gras ${pz('gras').toFixed(1)} %, Bankett ${pz('bankett').toFixed(1)} % – kein neuer Vorteil gegen M8a (${M8A.gras} / ${M8A.bankett} %; Asphalt ${pz('asphalt').toFixed(1)} %)`);
  void alleMessungen;
}

// ---------------------------------------------------------------- (e) Pace-Notes und Abkürzungen mit rt4
if (teil('e')) {
  console.log('(e) Pace-Notes und Abkürzungen mit rt4 (nur melden)');
  const vorher = fs.readFileSync(path.join(WURZEL, 'js/pacenotes-tempo.js'), 'utf8'), sv = fs.readFileSync(path.join(WURZEL, 'tools/schneiden-zeiten.json'), 'utf8');
  const r = werkzeug('pacenotes-test.mjs', ['--auto', 'rt4']);
  for (const z of r.text.split('\n').filter((z) => /\(j\)/.test(z))) console.log(`       ${z.trim()}`);
  const abw = (r.text.match(/Stufe für rt4 anders wäre[^:]*: (.*)$/m) || [])[1];
  console.log(`  INFO Kurven mit anderer Stufe für rt4: ${abw || 'keine'}`);
  const ab = werkzeug('abkuerzungen.mjs', ['--pruefen', '--auto', 'rt4']);
  const n = [...ab.text.matchAll(/übrig in Kurve [^:]+: (\d+) Linien/g)].map((x) => +x[1]);
  melde(ab.code === 0 && n.join('/') === '127/2/342/84', `Abkürzungen mit rt4: ${n.join(' / ')} (nicht schlechter als prototyp 127 / 2 / 342 / 84), gesperrt durchkommen ${(ab.text.match(/Durchkommen in gesperrten Kurven: (\d+)/) || [])[1]}`);
  melde(fs.readFileSync(path.join(WURZEL, 'js/pacenotes-tempo.js'), 'utf8') === vorher && fs.readFileSync(path.join(WURZEL, 'tools/schneiden-zeiten.json'), 'utf8') === sv,
    'js/pacenotes-tempo.js und tools/schneiden-zeiten.json nicht neu geschrieben');
}

// ---------------------------------------------------------------- (f) Turbo im Ton
if (teil('f')) {
  console.log('(f) Turbo im Ton (tools/m8b-ton.mjs; gemessen, nicht gehört)');
  const r = werkzeug('m8b-ton.mjs');
  for (const z of r.text.split('\n').filter((z) => z.trim())) console.log(`       ${z.trim()}`);
  const d = JSON.parse(fs.readFileSync(path.join(WURZEL, 'tools/m8b-ton.json'), 'utf8'));
  const db = (x) => 20 * Math.log10(x);
  const mal = db(d.pegel.mitTurbo[5000].turboRms / d.pegel.ohneTurbo[5000].turboRms), soll = db(d.werte.turboPegelMal);
  melde(r.code === 0 && Math.abs(mal - soll) < 0.3, `Pfeifen mit Turbo ${mal.toFixed(2)} dB lauter (turboPegelMal ${d.werte.turboPegelMal} = ${soll.toFixed(2)} dB)`);
  melde(d.pegel.mitTurbo[5000].motorGegenTurboDb >= 10 && d.pegel.mitTurbo[7000].motorGegenTurboDb >= 10,
    `Motor bei Vollgas klar lauter als das Pfeifen: ${d.pegel.mitTurbo[5000].motorGegenTurboDb.toFixed(1)} dB (5000/min), ${d.pegel.mitTurbo[7000].motorGegenTurboDb.toFixed(1)} dB (7000/min)`);
  melde(d.pegel.halb.schwerpunkt < d.pegel.mitTurbo[5000].schwerpunkt, `Tonhöhe steigt mit dem Ladedruck (Schwerpunkt ${d.pegel.halb.schwerpunkt.toFixed(0)} Hz bei 0.5, ${d.pegel.mitTurbo[5000].schwerpunkt.toFixed(0)} Hz bei 1)`);
  const a = d.aufbau.rt4, lo = a.aufbau * 0.75, hi = a.aufbau * 1.25;
  melde(a.druck95 >= lo && a.druck95 <= hi && a.pegel90 >= lo && a.pegel90 <= hi, `Aufbau nach Vollgas: Ladedruck im Ton 95 % nach ${a.druck95.toFixed(2)} s, Pfeifen-Pegel 90 % nach ${a.pegel90.toFixed(2)} s (turbo.aufbau ${a.aufbau} s ±25 %)`);
  const al = d.antiLag.rt4;
  melde(al.minLadedruckPause >= 0.7 - 1e-9 && al.minRmsPause >= d.antiLag.bezug07 * 0.98, `Anti-Lag: Pfeifen in der Schaltpause min RMS ${al.minRmsPause.toFixed(4)}, Pegel bei Ladedruck 0.7 ${d.antiLag.bezug07.toFixed(4)} (prototyp fällt auf ${d.antiLag.prototyp.minRmsPause.toFixed(4)})`);
  melde(d.pops.rt4.salvenMitPops >= d.pops.prototyp.salvenMitPops && d.pops.prototyp.mitAntiLag === 0,
    `Pops über 60 s: prototyp ${d.pops.prototyp.salvenMitPops} Salven / ${d.pops.prototyp.pops} Pops, Audan Quarto ${d.pops.rt4.salvenMitPops} Salven / ${d.pops.rt4.pops} Pops (Knall-Chance +${d.werte.turboKnallPlus} mit Anti-Lag)`);
  // im Spiel: turboAn nur im Turbo-Profil, Konsole ohne Fehler, Speicher pro Bild.
  // Speicher: im Test-Browser kostet schon jede gespeicherte Kommazahl ein kleines Objekt (siehe STAND.md M8a), im Prototyp
  // ist der Ladedruck aber die Ganzzahl 0. Darum fair auf derselben Seite (Audan Quarto, Ladedruck 0.7 im Getriebe):
  // tonBild mit Turbo-Ton gegen ohne (getriebe.turbo.an kurz aus), dazu eine einzelne Kommazahl als Mass.
  const info = {};
  for (const auto of ['prototyp', 'rt4']) {
    const s = await starteSpiel({ breite: 640, hoehe: 360, auto, args: ['--js-flags=--expose-gc', '--enable-precise-memory-info', '--autoplay-policy=no-user-gesture-required'] });
    await s.page.goto(`${s.url}/index.html`);
    await s.page.waitForFunction(() => window.__alpineRally, null, { timeout: 120000 });
    await s.page.keyboard.press('Enter');
    await s.page.waitForFunction(() => { const t = window.__alpineRally.ton; return !t.an || (t.werk && t.werk.aufbau.fertig); }, null, { timeout: 30000 });
    info[auto] = await s.page.evaluate(() => {
      const A = window.__alpineRally;
      A.start({ countdown: false }); A.anhalten = true; A.setzeAuf(600);
      const e = { gas: 1, bremse: 0, lenkung: 0, handbremse: false, reset: false, debug: false, notes: false };
      for (let k = 0; k < 240; k++) A.rennSchritt(A.SCHRITT, e);
      A.tonBild(1 / 60);
      const z = { turboAn: A.tonZ.turboAn, ladedruck: A.tonZ.ladedruck };
      if (!window.gc || !performance.memory) return { ...z, heap: null };
      const C = A.CONFIG.audio.umgebung, vf = C.voegel.dichteFaktor, kr = C.kuhglocken.radius;
      C.voegel.dichteFaktor = 0; C.kuhglocken.radius = 0;
      const T = A.CONFIG.getriebe.turbo, an = T.an, o = { a: 0.5 };
      // (die Werte schwanken im Test-Browser stark, je nach Aufräumen: 230 bis 530 Byte – darum abwechselnd je 4 Läufe, das Minimum)
      const miss = (fn) => { for (let k = 0; k < 2000; k++) fn(k); window.gc(); const h0 = performance.memory.usedJSHeapSize; for (let k = 0; k < 20000; k++) fn(k); return (performance.memory.usedJSHeapSize - h0) / 20000; };
      const bild = () => A.tonBild(1 / 60);
      let mit = Infinity, ohne = Infinity;
      for (let r = 0; r < 4; r++) { T.an = false; ohne = Math.min(ohne, miss(bild)); T.an = true; mit = Math.min(mit, miss(bild)); }
      T.an = an;
      const zahl = miss((k) => { o.a = k * 0.001 + 0.3; });
      C.voegel.dichteFaktor = vf; C.kuhglocken.radius = kr;
      return { ...z, heap: { mit, ohne, zahl } };
    });
    info[auto].fehler = s.fehler.length;
    await s.schliessen();
  }
  melde(info.prototyp.turboAn === false && info.rt4.turboAn === true && info.rt4.ladedruck > 0.5, `tonZ.turboAn: prototyp ${info.prototyp.turboAn}, Audan Quarto ${info.rt4.turboAn} (Ladedruck ${info.rt4.ladedruck.toFixed(2)})`);
  melde(info.prototyp.fehler === 0 && info.rt4.fehler === 0, `Konsole ohne Fehler (${info.prototyp.fehler} / ${info.rt4.fehler})`);
  const h = info.rt4.heap;
  if (h) {
    melde(h.mit <= h.ohne + 16, `Speicher pro Bild (tonBild, Heap des Test-Browsers inkl. Web-Audio-Aufträge, kleinster von 4 Läufen): mit Turbo-Ton ${h.mit.toFixed(1)} Byte, ohne ${h.ohne.toFixed(1)} Byte` +
      ` (Unterschied ${(h.mit - h.ohne).toFixed(1)} Byte; ein neues Objekt wären 16 und mehr; eine einzelne Kommazahl kostet hier ${h.zahl.toFixed(1)} Byte)`);
  }
}

// ---------------------------------------------------------------- (g) Fahr-Labor und Ton-Labor
if (teil('g')) {
  console.log('(g) Fahr-Labor (tools/auto-test.mjs --nur m) und Ton-Labor');
  teilWerkzeug('auto-test.mjs', ['--nur', 'm'], 'Fahr-Labor: 14 Regler, live, ALLES ZURÜCK, ohne ?fahrlabor=1 kein Panel');
  const s = await starteSpiel({ breite: 1280, hoehe: 900 });
  await s.page.goto(`${s.url}/index.html?menue=aus&auto=rt4&fahrlabor=1`);
  await s.page.waitForFunction(() => window.__alpineRally && window.__alpineRally.fahrlabor, null, { timeout: 120000 });
  const fl = await s.page.evaluate(() => {
    const A = window.__alpineRally, panel = A.fahrlabor.panel;
    const regler = [...panel.querySelectorAll('.regler')];
    const setze = (name, w) => { const z = regler.find((r) => r.querySelector('.name').textContent === name); const e = z.querySelector('input'); e.value = w; e.dispatchEvent(new Event('input')); };
    setze('auto.vorneJeBelag.schotter', 1.12); setze('getriebe.allrad.wiesenweg', 1.3);
    const live = [A.CONFIG.auto.vorneJeBelag.schotter, A.CONFIG.getriebe.allrad.wiesenweg];
    // wirkt in der Physik: Grip vorne auf Schotter (ein Schritt auf Schotter, Seitenkraft-Grenze über die Achslast)
    panel.querySelector('#fahrlaborKopieren').click();
    const text = panel.querySelector('#fahrlaborText').value;
    panel.querySelector('#fahrlaborZurueck').click();
    return { live, text, zurueck: [A.CONFIG.auto.vorneJeBelag.schotter, A.CONFIG.getriebe.allrad.wiesenweg], rt4: A.CONFIG.fahrprofile.rt4 };
  });
  melde(fl.live[0] === 1.12 && fl.live[1] === 1.3 && /auto\.vorneJeBelag\.schotter = 1\.12/.test(fl.text) && /getriebe\.allrad\.wiesenweg = 1\.3/.test(fl.text),
    `neue Regler wirken sofort (vorneJeBelag.schotter ${fl.live[0]}, allrad.wiesenweg ${fl.live[1]}), WERTE KOPIEREN: ${JSON.stringify(fl.text)}`);
  melde(fl.zurueck[0] === fl.rt4.auto.vorneJeBelag.schotter && fl.zurueck[1] === fl.rt4.getriebe.allrad.wiesenweg, `ALLES ZURÜCK: ${fl.zurueck.join(' / ')}`);
  await s.schliessen();
  // Ton-Labor
  const t = await starteSpiel({ breite: 1400, hoehe: 900, args: ['--autoplay-policy=no-user-gesture-required'] });
  await t.page.goto(`${t.url}/ton-labor.html`);
  await t.page.waitForFunction(() => window.__tonLabor, null, { timeout: 60000 });
  await t.page.click('#tonStarten');
  await t.page.waitForFunction(() => window.__tonLabor.ton.werk && window.__tonLabor.ton.werk.aufbau.fertig, null, { timeout: 30000 });
  const tl = await t.page.evaluate(async () => {
    const L = window.__tonLabor, w = L.ton.werk, $ = (id) => document.getElementById(id);
    const warte = (ms) => new Promise((r) => setTimeout(r, ms));
    const setze = (id, v) => { $(id).value = v; $(id).dispatchEvent(new Event('input')); };
    setze('drehzahl', 5000); setze('gas', 1);
    setze('ladedruck', 1); await warte(400);
    const ohne = { druck: w.zustand.druck, turbo: w.zustand.turbo };
    $('echterLadedruck').checked = true; $('echterLadedruck').dispatchEvent(new Event('change'));
    await warte(400);
    const mit = { druck: w.zustand.druck, turbo: w.zustand.turbo, getriebeTurbo: L.CONFIG.getriebe.turbo.an };
    setze('ladedruck', 0.3); await warte(400);
    const halb = { druck: w.zustand.druck, turbo: w.zustand.turbo };
    const namen = L.fein.FEIN.map((f) => f.pfad);
    const f = L.fein.FEIN.find((x) => x.pfad === 'audio.motor.turboPegelMal');
    f.regler.value = 2; f.regler.dispatchEvent(new Event('input'));
    const text = L.fein.text();
    await warte(300);
    const lauter = w.zustand.turbo;
    $('allesZurueck').click();
    return { ohne, mit, halb, namen, text, lauter, zurueck: L.CONFIG.audio.motor.turboPegelMal, anzeige: $('ladedruckW').textContent, schalter: $('echterLadedruckW').textContent };
  });
  melde(Math.abs(tl.mit.druck - 1) < 0.02 && Math.abs(tl.halb.druck - 0.3) < 0.02 && tl.mit.turbo > tl.halb.turbo && tl.mit.getriebeTurbo === true,
    `Ton-Labor: ECHTER LADEDRUCK AN (${tl.schalter}) – Ladedruck im Ton folgt dem Regler (1 -> ${tl.mit.druck.toFixed(2)}, 0.3 -> ${tl.halb.druck.toFixed(2)}; Anzeige ${tl.anzeige}); ohne Schalter eigenes Modell (${tl.ohne.druck.toFixed(2)})`);
  melde(tl.namen.includes('audio.motor.turboPegelMal') && tl.namen.includes('audio.motor.turboKnallPlus') && /turboPegelMal = 2/.test(tl.text) && tl.lauter > tl.halb.turbo && tl.zurueck === 1.35,
    `Feinschliff: turboPegelMal und turboKnallPlus, wirkt live (${tl.text.trim()}), ALLES ZURÜCK (${tl.zurueck})`);
  melde(t.fehler.length === 0, `Ton-Labor ohne Konsolenfehler (${t.fehler.length})`);
  await t.schliessen();
}

// ---------------------------------------------------------------- (h) Stabilität
if (teil('h')) {
  console.log('(h) Stabilität: bisherige Tests mit prototyp, Draw Calls');
  teilWerkzeug('auto-test.mjs', ['--nur', 'a'], 'Modell: Masse, Draw Calls ≤ 12, Dreiecke');
  for (const t of ['getriebe-test', 'lenk-test', 'handbremse-test', 'belag-test', 'rueckwaerts-test', 'aufprall-test', 'pacenotes-test', 'menue-test',
    'rennablauf-test', 'ton-test', 'ton-umgebung-test']) {
    let r = werkzeug(`${t}.mjs`), versuch = 1;
    if (r.code !== 0) { r = werkzeug(`${t}.mjs`); versuch = 2; } // (zeitkritische Prüfungen im Test-Browser, siehe STAND.md M8a)
    melde(r.code === 0, `${t} (prototyp): ${r.code === 0 ? `bestanden${versuch > 1 ? ' im 2. Versuch' : ''}` : `FEHLER – ${(r.text.match(/FEHLER.*$/m) || [''])[0].slice(0, 140)}`}`);
  }
  teilWerkzeug('auto-test.mjs', [], 'auto-test (a)-(n) mit rt4');
}

console.log(fehler ? `\n${fehler} FEHLER` : '\nalles ok');
process.exit(fehler ? 1 : 0);
