// Auto messen (Meilenstein 8a): Optik (Draw Calls, Dreiecke) und Fahrgefühl (Tabelle B3) für jedes Fahrprofil.
//
//   node tools/auto-messung.mjs                 dieses Projekt messen (Profile prototyp und rt4), Ergebnis als
//                                               "nachher" in tools/auto-messung.json (der Eintrag "vorher" bleibt)
//   node tools/auto-messung.mjs --alt <ordner>  dazu eine alte Version (z. B. 0.7b) als "vorher" messen
//   node tools/auto-messung.mjs --nur-alt <ordner>   nur die alte Version messen ("vorher")
//   --schnell                                   ohne Testfahrer (nur Physik und Optik)
//
// Physik: ohne Browser mit js/physics.js und js/getriebe.js (tools/fahrmessung.js), je Profil.
// Testfahrer und Optik: im Headless-Browser (tools/testfahrer-browser.js, renderer.info).
// Ältere Versionen ohne js/fahrprofil.js kennen nur das heutige Verhalten: das gilt dort als "prototyp".

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { starteSpiel, WURZEL } from './spiel-browser.mjs';
import { baueMessung, alleMessungen } from './fahrmessung.js';

const arg = (name) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : null; };
const schnell = process.argv.includes('--schnell');
const DATEI = path.join(WURZEL, 'tools/auto-messung.json');
const fmtZeit = (t) => (t == null ? '--' : `${Math.floor(t / 60)}:${(t % 60).toFixed(2).padStart(5, '0')}`);

// --- Physik je Profil (ohne Browser) ---
async function physik(wurzel) {
  const lade = (datei) => import(pathToFileURL(path.join(wurzel, 'js', datei)).href);
  const { CONFIG, VERSION } = await lade('config.js');
  const { Fahrphysik } = await lade('physics.js');
  const { Getriebe } = await lade('getriebe.js');
  const mitProfilen = fs.existsSync(path.join(wurzel, 'js/fahrprofil.js'));
  const fp = mitProfilen ? await lade('fahrprofil.js') : null;
  const m = baueMessung({ CONFIG, Fahrphysik, Getriebe });
  const erg = {};
  for (const id of mitProfilen ? ['prototyp', 'rt4'] : ['prototyp']) {
    if (fp) fp.waehleFahrprofil(id);
    erg[id] = alleMessungen(m);
  }
  if (fp) fp.waehleFahrprofil(fp.STANDARD_PROFIL);
  return { version: VERSION, profile: Object.keys(erg), physik: erg };
}

// --- Testfahrer und Optik je Profil (im Browser) ---
async function browser(wurzel, profile) {
  const spiel = await starteSpiel({ wurzel, breite: 640, hoehe: 360 });
  const fahrerCode = fs.readFileSync(path.join(WURZEL, 'tools/testfahrer-browser.js'), 'utf8');
  const erg = {};
  for (const id of profile) {
    await spiel.page.goto(`${spiel.url}/index.html?menue=aus&auto=${id}`);
    await spiel.page.waitForFunction(() => window.__alpineRally, null, { timeout: 120000 });
    await spiel.page.evaluate((code) => { window.__alpineRally.anhalten = true; window.__fahrerUrl = URL.createObjectURL(new Blob([code], { type: 'text/javascript' })); }, fahrerCode);
    const r = { profil: await spiel.page.evaluate(() => window.__alpineRally.auto || 'prototyp (0.7b)') };
    // Optik: das Auto allein zeichnen (alles andere kurz unsichtbar), Kamera wie im Spiel hinter dem Auto
    r.optik = await spiel.page.evaluate(async () => {
      const A = window.__alpineRally;
      const bild = () => new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res)));
      A.setzeAuf(60); A.kameraSofort(); await bild();
      // (0.7b kennt A.autoModell nicht: dort ist es die Gruppe, die genau beim Auto steht)
      const objekt = A.autoModell ? A.autoModell.objekt
        : A.szene.children.find((o) => o.isGroup && Math.abs(o.position.x - A.physik.x) < 1e-6 && Math.abs(o.position.z - A.physik.z) < 1e-6);
      const sichtbar = A.szene.children.map((o) => o.visible);
      A.szene.children.forEach((o) => { o.visible = o === objekt; });
      A.renderer.render(A.szene, A.kamera);
      const nurAuto = { calls: A.renderer.info.render.calls, dreiecke: A.renderer.info.render.triangles };
      A.szene.children.forEach((o, i) => { o.visible = sichtbar[i]; });
      // Meshes des Autos statisch zählen
      let meshes = 0, dreieckeStatisch = 0;
      objekt.traverse((o) => {
        if (!o.isMesh || !o.visible) return;
        meshes++;
        const g = o.geometry;
        dreieckeStatisch += (g.index ? g.index.count : g.attributes.position.count) / 3;
      });
      // ganze Szene an drei Stellen
      const szene = [];
      for (const s of [60, 1170, 2900]) {
        A.setzeAuf(s); A.kameraSofort(); await bild();
        A.renderer.render(A.szene, A.kamera);
        szene.push({ s, calls: A.renderer.info.render.calls, dreiecke: A.renderer.info.render.triangles });
      }
      A.setzeAuf(60); A.kameraSofort();
      return { nurAuto, meshes, dreieckeStatisch, szene };
    });
    if (!schnell) {
      r.testfahrer = {};
      for (const profil of ['vorsichtig', 'mittel', 'flott']) {
        r.testfahrer[profil] = await spiel.page.evaluate(async (profil) => {
          const A = window.__alpineRally;
          const f = await import(window.__fahrerUrl);
          // Zeit je Belag der Strecke (Hauptstrecke und Nebenwege, nach dem Belag am Streckenmeter)
          const jeBelag = {};
          const r = f.fahreEtappe(A, profil, () => {
            if (A.rennen.zustand !== 'laeuft') return;
            const i = Math.max(0, Math.min(A.strecke.anzahl - 1, Math.round(A.rennen.letztesS)));
            const b = A.netz.belag ? A.netz.belag[i] : 'asphalt';
            jeBelag[b] = (jeBelag[b] || 0) + A.SCHRITT;
          });
          return {
            zeit: r.zeit, ziel: r.ziel, cps: r.cps, aufpralle: r.aufpralle, haenger: r.haenger, maxAbstand: r.maxAbstand,
            wege: r.wege.map((w) => ({ name: w.name, belag: w.belag, zeit: w.zeit, daneben: w.daneben, maxAbstand: w.maxAbstand })),
            jeBelag, aufpralleStat: A.stat.aufpralle, hoechstTempo: A.stat.hoechstTempo, resets: A.statResets(),
          };
        }, profil);
      }
    }
    erg[id] = r;
  }
  if (spiel.fehler.length) erg.fehler = spiel.fehler.slice(0, 10);
  await spiel.schliessen();
  return erg;
}

async function miss(wurzel) {
  const p = await physik(wurzel);
  const b = await browser(wurzel, p.profile);
  return { version: p.version, wurzel: wurzel === WURZEL ? '.' : wurzel, physik: p.physik, browser: b };
}

const alt = arg('--alt') || arg('--nur-alt');
let daten = fs.existsSync(DATEI) ? JSON.parse(fs.readFileSync(DATEI, 'utf8')) : {};
daten.hinweis = 'Automatisch erzeugt von node tools/auto-messung.mjs (Meilenstein 8a). vorher = Version vor M8a (nur Profil prototyp), nachher = jetzt (prototyp und rt4).';
if (alt) daten.vorher = await miss(path.resolve(alt));
if (!arg('--nur-alt')) daten.nachher = await miss(WURZEL);
fs.writeFileSync(DATEI, JSON.stringify(daten, null, 1) + '\n');
console.log(`-> ${path.relative(WURZEL, DATEI)} geschrieben`);

// --- Tabellen ---
const pz = (neu, alt) => (neu == null || alt == null ? '--' : `${neu >= alt ? '+' : ''}${((neu / alt - 1) * 100).toFixed(1)} %`);
const f = (n, d = 2) => (n == null ? '--' : Number(n).toFixed(d));
for (const [name, d] of [['vorher', daten.vorher], ['nachher', daten.nachher]]) {
  if (!d) continue;
  console.log(`\n=== ${name}: Version ${d.version} ===`);
  for (const [id, b] of Object.entries(d.browser)) {
    if (id === 'fehler') continue;
    const o = b.optik;
    console.log(`Profil ${id}: Auto ${o.nurAuto.calls} Draw Calls, ${o.nurAuto.dreiecke} Dreiecke (statisch ${o.meshes} Meshes, ${o.dreieckeStatisch} Dreiecke);` +
      ` Szene ${o.szene.map((s) => `${s.s} m: ${s.calls} Calls / ${s.dreiecke} Dreiecke`).join(', ')}`);
    if (b.testfahrer) {
      for (const [prof, t] of Object.entries(b.testfahrer)) {
        console.log(`  Testfahrer ${prof.padEnd(10)} ${t.ziel ? fmtZeit(t.zeit) : 'NICHT IM ZIEL'}  CPs ${t.cps.map(fmtZeit).join(' / ')}  Aufpralle ${t.aufpralleStat} (${t.aufpralle.length})` +
          `  Hänger ${t.haenger}  Höchsttempo ${(t.hoechstTempo * 3.6).toFixed(1)} km/h  Resets ${t.resets}` +
          `  | ${t.wege.map((w) => `${w.name} ${w.zeit.toFixed(2)} s`).join(', ')} | je Belag ${Object.entries(t.jeBelag).map(([k, v]) => `${k} ${v.toFixed(2)} s`).join(', ')}`);
      }
    }
  }
}
const n = daten.nachher;
if (n && n.physik.rt4) {
  const P = n.physik.prototyp, R = n.physik.rt4;
  console.log('\n=== Tabelle B3: RT4 gegen prototyp (Physik ohne Browser) ===');
  console.log('| Messung | prototyp | RT4 | Unterschied | Ziel |');
  console.log('|---|---|---|---|---|');
  const z = (t, a, b, d, ziel, einheit = '') => console.log(`| ${t} | ${f(a, d)}${einheit} | ${f(b, d)}${einheit} | ${pz(b, a)} | ${ziel} |`);
  z('0–100 km/h Asphalt', P.beschl100_asphalt, R.beschl100_asphalt, 2, '±3 %', ' s');
  z('0–100 km/h Schotter', P.beschl100_schotter, R.beschl100_schotter, 2, '5–12 % schneller', ' s');
  z('0–100 km/h Wiesenweg', P.beschl100_wiesenweg, R.beschl100_wiesenweg, 2, '5–12 % schneller', ' s');
  z('0–60 km/h Gras', P.beschl60_gras, R.beschl60_gras, 2, 'gleich oder langsamer', ' s');
  z('0–100 km/h Bankett', P.beschl100_bankett, R.beschl100_bankett, 2, 'gleich oder langsamer', ' s');
  z('Bremsweg 100–0 Asphalt', P.bremsweg100_asphalt, R.bremsweg100_asphalt, 1, '±5 %', ' m');
  z('Kreis R 25 m Grenztempo Asphalt', P.kreis25_asphalt, R.kreis25_asphalt, 1, '±3 %', ' km/h');
  z('Kreis R 25 m Grenztempo Schotter', P.kreis25_schotter, R.kreis25_schotter, 1, '+4 bis +10 %', ' km/h');
  z('Kreis R 25 m Grenztempo Wiesenweg (Info)', P.kreis25_wiesenweg, R.kreis25_wiesenweg, 1, '–', ' km/h');
  z('Lenkwinkel 80 km/h auf R 60 m', P.lenk80_r60.grad, R.lenk80_r60.grad, 2, '+8 bis +20 %', '°');
  console.log(`| Heck: 90 km/h R 80 m, Gas weg + Bremse 60 %: Zusatz-Schwimmwinkel nach 0.5 s | ${f(P.heck90_r80.zusatz, 1)}° | ${f(R.heck90_r80.zusatz, 1)}° | ${f(R.heck90_r80.zusatz - P.heck90_r80.zusatz, 1)}° | +2 bis +5° |`);
  console.log(`| ... eingefangen nach (s) | ${f(P.heck90_r80.einfangen, 2)} | ${f(R.heck90_r80.einfangen, 2)} | | unter ca. 1 s |`);
  console.log(`| Heck: dasselbe mit Vollbremsung (Info) | ${f(P.heck90_r80_voll.zusatz, 1)}° | ${f(R.heck90_r80_voll.zusatz, 1)}° | ${f(R.heck90_r80_voll.zusatz - P.heck90_r80_voll.zusatz, 1)}° | – |`);
  z('Vollgas in der Kurve R 80 m: Schwimmwinkel max', P.gas_r80.max, R.gas_r80.max, 1, 'kleiner oder gleich', '°');
  z('... auf Schotter (Info)', P.gas_r80_schotter.max, R.gas_r80_schotter.max, 1, '–', '°');
  z('Handbremsen-Drift Asphalt: Driftwinkel nach 0.5 s', P.hb_asphalt.nach05, R.hb_asphalt.nach05, 1, '±20 %', '°');
  z('Handbremsen-Drift Schotter: nach 0.5 s (Info)', P.hb_schotter.nach05, R.hb_schotter.nach05, 1, '–', '°');
  z('Rückwärts Asphalt: Höchsttempo', P.rueck_asphalt.max, R.rueck_asphalt.max, 1, 'identisch', ' km/h');
  z('Rückwärts Asphalt: Tempo nach 1 s', P.rueck_asphalt.nach1s, R.rueck_asphalt.nach1s, 2, 'identisch', ' km/h');
  z('Rückwärts Gras: Tempo nach 1 s', P.rueck_gras.nach1s, R.rueck_gras.nach1s, 2, 'identisch', ' km/h');
  const bp = n.browser.prototyp && n.browser.prototyp.testfahrer, br = n.browser.rt4 && n.browser.rt4.testfahrer;
  if (bp && br) {
    console.log('\n=== Testfahrer: RT4 gegen prototyp ===');
    console.log('| Profil | prototyp | RT4 | Unterschied | Almweg | Wiesenweg | Talschleife | Asphalt (Summe) | Aufpralle / Hänger RT4 |');
    console.log('|---|---|---|---|---|---|---|---|---|');
    for (const prof of Object.keys(bp)) {
      const a = bp[prof], b = br[prof];
      const weg = (t, name) => t.wege.find((w) => w.name === name);
      const wz = (name) => { const x = weg(a, name), y = weg(b, name); return x && y ? `${f(x.zeit)} → ${f(y.zeit)} s (${pz(y.zeit, x.zeit)})` : '--'; };
      console.log(`| ${prof} | ${fmtZeit(a.zeit)} | ${fmtZeit(b.zeit)} | ${pz(b.zeit, a.zeit)} | ${wz('Almweg')} | ${wz('Wiesenweg')} | ${wz('Talschleife')} |` +
        ` ${f(a.jeBelag.asphalt)} → ${f(b.jeBelag.asphalt)} s (${pz(b.jeBelag.asphalt, a.jeBelag.asphalt)}) | ${b.aufpralleStat} / ${b.haenger} |`);
    }
  }
}
if (daten.vorher && n) {
  const v = daten.vorher.browser.prototyp, w = n.browser.prototyp;
  console.log('\n=== vorher (0.7b) gegen nachher, Profil prototyp ===');
  console.log(`Auto: ${v.optik.nurAuto.calls} -> ${w.optik.nurAuto.calls} Draw Calls, ${v.optik.nurAuto.dreiecke} -> ${w.optik.nurAuto.dreiecke} Dreiecke`);
  console.log(`Szene: ${v.optik.szene.map((s) => s.calls).join(' / ')} -> ${w.optik.szene.map((s) => s.calls).join(' / ')} Draw Calls (60 / 1170 / 2900 m)`);
  if (v.testfahrer && w.testfahrer) {
    for (const prof of Object.keys(v.testfahrer)) {
      const a = v.testfahrer[prof], b = w.testfahrer[prof];
      const gleich = fmtZeit(a.zeit) === fmtZeit(b.zeit) && a.cps.map(fmtZeit).join() === b.cps.map(fmtZeit).join() && a.aufpralleStat === b.aufpralleStat &&
        a.haenger === b.haenger && Math.abs(a.hoechstTempo - b.hoechstTempo) < 1e-9 && a.resets === b.resets;
      console.log(`  ${prof}: ${fmtZeit(a.zeit)} -> ${fmtZeit(b.zeit)} ${gleich ? '(identisch, auch Zwischenzeiten und Statistik)' : 'ANDERS!'}`);
    }
  }
  const pv = daten.vorher.physik.prototyp, pn = n.physik.prototyp;
  console.log(`  Physik-Messungen prototyp: ${JSON.stringify(pv) === JSON.stringify(pn) ? 'bit-genau identisch' : 'ANDERS!'}`);
}
