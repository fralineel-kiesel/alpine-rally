// Meilenstein 8e prüfen:  node tools/m8e-test.mjs [--nur a,b,c,d,e,f,g,h,i,j] [--alt <ordner 0.8d>] [--lang] [--ton-alt]
//   (a) Profil prototyp bit-genau (über tools/m8b-test.mjs --nur c: Testfahrer, Zwischenzeiten, Statistik, 70-s-Prüfsumme,
//       Abkürzungen 127/2/342/84) und Ton gegen 0.8d (tools/ton-messung-m8d-prototyp.json)
//   (b) Audan, Delto, Escorta unverändert: Fahrmessung, Motorwerte, Ton-Messung, Lack-Textur und Geometrie gegen 0.8d
//       (tools/m8e-referenz-08d.json; mit --alt <ordner 0.8d> direkt gegen die alte Version, --referenz-schreiben)
//   (c) Modelle Lanza 073 und Subora: Baukasten-Test (Scheiben), Draw Calls, Dreiecke, Masse, Räder, Federung, Lichter,
//       Dreck, Staub, keine Helme hinten
//   (d) Fahrmessung nach tools/m8e-ziele.js, Kippschwelle antriebHinten (Lanza), Testfahrer drei Stile, Pace-Notes
//       (nur gemeldet), Werte-Balken, Vergleichstabelle der fünf Autos
//   (e) Garage mit fünf Autos: Tastatur, Gamepad, Maus; Layout ohne Abschneiden (de/en, alle Auflösungen), Hinweiszeile,
//       Bestzeiten mit IMPREXA und 073
//   (f) Aufheulen: Klang je Auto (offline), endet sauber, 20-fach schnell bestätigen (Knoten, Knacken), nur in der Garage,
//       ohne Ton keine Fehler
//   (g) Flamme: bei Pops, gleichzeitig mit dem Ton, nie ohne Pop, an den Rohren jedes Autos, Draw Calls; Physik und Ton
//       bit-gleich mit und ohne Flamme
//   (h) Ton-Messung Lanza 073 und Subora gegen den Audan (Tabelle), Wechsel-Test (30 Wechsel über alle fünf Autos)
//   (i) Ton-Labor (Feinschliff Lader/unrund, WERTE KOPIEREN, ALLES ZURÜCK, VERGLEICH mit fünf Autos), Fahr-Labor, Auto-Labor
//   (j) Stabilität: alle bisherigen Tests (nur mit --lang), Bildzeit, Ladezeit (mit --alt)
// Ich habe den Ton nicht gehört und das Fahrgefühl nicht gespürt: das sind Messungen.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { starteSpiel, WURZEL } from './spiel-browser.mjs';
import * as Z from './m8e-ziele.js';

const arg = (name) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : null; };
const NUR = arg('--nur') ? arg('--nur').split(',') : null;
const ALT = arg('--alt') ? path.resolve(arg('--alt')) : null;
const teil = (k) => !NUR || NUR.includes(k);
let fehler = 0, kompromisse = 0;
const melde = (ok, text) => { console.log(`${ok ? '  ok  ' : 'FEHLER'} ${text}`); if (!ok) fehler++; };
const komp = (text, grund) => { console.log(`  KOMP ${text} – Kompromiss: ${grund}`); kompromisse++; };
const info = (text) => console.log(`       ${text}`);
const werkzeug = (name, argumente = [], timeout = 4 * 3600000) => {
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
const NEUE = Z.AUTOS_M8E;
const ALLE = [...ALTE, ...NEUE];
const fmtZeit = (t) => `${Math.floor(t / 60)}:${(t % 60).toFixed(2).padStart(5, '0')}`;
const pz = (b, a) => (b / a - 1) * 100;
const bilder = (p, n = 3) => p.evaluate((n) => new Promise((r) => { let k = 0; const f = () => (++k >= n ? r() : requestAnimationFrame(f)); requestAnimationFrame(f); }), n);

// Fahrmessungen (ohne Browser) einer Version: alle Profile, die es dort gibt
async function physikVon(wurzel = WURZEL) {
  const { CONFIG } = await lade(wurzel, 'js/config.js');
  const { Fahrphysik } = await lade(wurzel, 'js/physics.js');
  const { Getriebe } = await lade(wurzel, 'js/getriebe.js');
  const FP = await lade(wurzel, 'js/fahrprofil.js');
  const { baueMessung, alleMessungen } = await lade(WURZEL, 'tools/fahrmessung.js');
  const m = baueMessung({ CONFIG, Fahrphysik, Getriebe });
  const out = {};
  for (const id of Object.keys(CONFIG.fahrprofile)) { FP.waehleFahrprofil(id); out[id] = alleMessungen(m); }
  const motor = {};
  for (const id of Object.keys(CONFIG.fahrprofile)) { FP.waehleMotorTon(id); motor[id] = JSON.parse(JSON.stringify(CONFIG.audio.motor)); }
  FP.waehleFahrprofil('prototyp');
  return { physik: out, motor, m, CONFIG, FP };
}
// Lack-Textur (alle Lackierungen, drei Bildbreiten) und Geometrie eines Autos als Prüfsummen (im Auto-Labor)
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
      const r = L.auto.raeder.map((x) => [x.lenk.position.x, x.lenk.position.y, x.lenk.position.z].map((v) => v.toFixed(5)).join(',')).join(';');
      out[`${id}-raeder`] = r;
    }
    return out;
  }, ids);
  await s.schliessen();
  return Object.fromEntries(Object.entries(r).map(([k, v]) => [k, hash(v)]));
}

// ---------------------------------------------------------------- (a) prototyp bit-genau
if (teil('a')) {
  console.log('(a) Profil prototyp bit-genau (über tools/m8b-test.mjs --nur c) und Ton wie 0.8d');
  teilWerkzeug('m8b-test.mjs', ['--nur', 'c'], 'prototyp = 0.7b (Testfahrer, Zwischenzeiten, Statistik, Prüfsumme, Abkürzungen 127/2/342/84)');
  const r = werkzeug('ton-messung.mjs', ['m8e-prototyp']);
  const alt = JSON.parse(fs.readFileSync(path.join(WURZEL, 'tools/ton-messung-m8d-prototyp.json'), 'utf8'));
  const neu = JSON.parse(fs.readFileSync(path.join(WURZEL, 'tools/ton-messung-m8e-prototyp.json'), 'utf8'));
  const anders = [];
  let rauschen = 0, gleich = 0;
  const vergleiche = (a, b, p) => {
    if (p === '.version') return;
    if (typeof a === 'number') {
      if (a === b) { gleich++; return; }
      if (typeof b === 'number' && Math.abs(a - b) <= Math.max(1e-3, Math.abs(a) * 1e-5)) { rauschen++; return; }
      anders.push(`${p}: ${a} -> ${b}`); return;
    }
    if (a && typeof a === 'object') for (const k of Object.keys(a)) vergleiche(a[k], b ? b[k] : undefined, `${p}.${k}`);
    else if (a !== b) anders.push(`${p}: ${a} -> ${b}`);
  };
  vergleiche(alt, neu, '');
  melde(r.code === 0 && anders.length === 0, `Ton prototyp (tools/ton-messung.mjs) gegen 0.8d: ${gleich} Zahlen gleich, ${rauschen} nur in der 5. bis 7. Stelle anders (Rechenrauschen), ${anders.length} anders${anders.length ? `: ${anders.slice(0, 4).join('; ')}` : ''}; Audio-Knoten ${neu.knoten.summe} (0.8d ${alt.knoten.summe})`);
}

// ---------------------------------------------------------------- (b) Audan, Delto, Escorta unverändert
if (teil('b')) {
  console.log('(b) Audan Quarto, Lanza Delto, Fard Escorta unverändert gegen 0.8d (Fahrmessung, Motorwerte, Ton, Textur, Geometrie)');
  const refDatei = path.join(WURZEL, 'tools/m8e-referenz-08d.json');
  let ref;
  if (ALT) {
    const p = await physikVon(ALT);
    ref = { physik: Object.fromEntries(['prototyp', ...ALTE].map((id) => [id, p.physik[id]])), motor: Object.fromEntries(['prototyp', ...ALTE].map((id) => [id, p.motor[id]])), abdruck: await abdruck(ALTE, ALT) };
    if (process.argv.includes('--referenz-schreiben')) fs.writeFileSync(refDatei, `${JSON.stringify(ref, null, 1)}\n`);
  } else ref = JSON.parse(fs.readFileSync(refDatei, 'utf8'));
  const jetzt = await physikVon();
  for (const id of ['prototyp', ...ALTE]) {
    const a = JSON.stringify(ref.physik[id]), b = JSON.stringify(jetzt.physik[id]);
    melde(a === b, `${id}: alle ${Object.keys(ref.physik[id]).length} Fahrmessungen bit-genau wie 0.8d`);
    // (neue Schrauben lader und unrund: Standard aus, sonst gleich)
    const m = { ...jetzt.motor[id] }; delete m.lader; delete m.unrund;
    melde(JSON.stringify(m) === JSON.stringify(ref.motor[id]) && jetzt.motor[id].lader.an === false && jetzt.motor[id].unrund === 0,
      `${id}: Motorwerte wie 0.8d (lader aus, unrund 0)`);
  }
  const ab = await abdruck(ALTE);
  const anders = Object.keys(ref.abdruck).filter((k) => ref.abdruck[k] !== ab[k]);
  melde(anders.length === 0, `Lack-Textur (alle Lackierungen, 320/480/640) , Geometrie und Radpositionen von Audan, Delto, Escorta gleich wie 0.8d (${Object.keys(ref.abdruck).length} Prüfsummen${anders.length ? `, anders: ${anders.slice(0, 6).join(', ')}` : ''})`);
  // Ton-Messung je Auto gegen die Messung von 0.8d (Motor bei 1500/3000/5000/7000, Pops, Turbo)
  for (const id of ALTE) {
    const datei = path.join(WURZEL, `tools/ton-messung-m8e-${id}.json`);
    if (!process.argv.includes('--ton-alt') || !fs.existsSync(datei)) {
      const r = werkzeug('ton-messung.mjs', [`m8e-${id}`, '--profil', id, '--bilder', 'screenshots/m8e']);
      if (r.code !== 0) { melde(false, `ton-messung --profil ${id}: ${r.text.split('\n').slice(-4).join(' ')}`); continue; }
    }
    const a = JSON.parse(fs.readFileSync(path.join(WURZEL, `tools/ton-messung-m8d-${id}.json`), 'utf8')), b = JSON.parse(fs.readFileSync(datei, 'utf8'));
    const nah = (x, y) => Math.abs(x - y) <= Math.max(1e-3, Math.abs(x) * 1e-5);
    const motorGleich = a.motor.every((m, i) => ['f0', 'fGemessen', 'schwerpunkt', 'ueber2k5', 'spitze', 'rms'].every((k) => nah(m[k], b.motor[i][k])));
    const pops = ['salvenMitPops', 'pops', 'knistern', 'schaltknall', 'blowOff'].every((k) => a.profil.pops[k] === b.profil.pops[k]);
    const turbo = nah(a.profil.turbo.rms, b.profil.turbo.rms) && nah(a.profil.turbo.ton, b.profil.turbo.ton);
    melde(motorGleich && pops && turbo && b.knoten.summe === a.knoten.summe && nah(a.profil.spitze, b.profil.spitze),
      `${id}: Ton wie 0.8d (Motor 1500-7000, Turbo, Spitze, 60-s-Fahrt ${b.profil.pops.salvenMitPops} Salven / ${b.profil.pops.pops} Pops / ${b.profil.pops.blowOff} Blow-off, Knoten ${b.knoten.summe})`);
  }
}

// ---------------------------------------------------------------- (c) Modelle Lanza 073 und Subora
if (teil('c')) {
  console.log('(c) Modelle Lanza 073 und Subora Imprexa');
  const { AUTO_MODELLE } = await lade(WURZEL, 'js/autos.js');
  for (const id of NEUE) {
    const m = AUTO_MODELLE[id], r = m.raeder, M = m.masse;
    const rx = Math.max(r.x + r.breite / 2, (r.xHinten ?? r.x) + (r.breiteHinten ?? r.breite) / 2);
    melde(Math.abs(2 * r.z - M.radstand) < 1e-9 && r.radius === M.radRadius && rx <= M.breite / 2 + 1e-9 && m.kollision.laenge <= M.laenge && m.kollision.breite <= M.breite
      && m.staub.hinten <= M.laenge / 2 && m.staub.seite <= M.breite / 2 && m.schatten.laenge >= M.laenge - 0.1,
      `${m.name}: Masse ${M.laenge} x ${M.breite} m, Radstand ${M.radstand} = 2 x ${r.z}, Räder aussen ${rx.toFixed(3)} m ≤ ${M.breite / 2}, Kollision ${m.kollision.laenge} x ${m.kollision.breite}, Staub, Schatten passend`);
    // Räder nicht in der Karosserie: der Radlauf-Bogen des Unterbaus ist grösser als das Rad (mit radlaufLuft)
    const unterbau = m.teile[0].profil, bogen = (z0) => Math.min(...unterbau.filter(([z, y]) => y > 0.33 && Math.abs(z - z0) < 0.6).map(([z, y]) => Math.hypot(z - z0, y - 0.33)));
    const luftV = bogen(r.z) - r.radius, luftH = bogen(-r.z) - r.radius;
    melde(luftV >= r.radlaufLuft && luftH >= r.radlaufLuft, `${m.name}: Radlauf über dem Rad vorne ${luftV.toFixed(3)} m, hinten ${luftH.toFixed(3)} m (mindestens radlaufLuft ${r.radlaufLuft})`);
    melde(!m.bemalung.some((b) => b.art === 'helm' && b.ansicht === 'hinten'), `${m.name}: kein Fahrer durch die Heckscheibe (keine Helme in der Ansicht hinten)`);
    melde(Array.isArray(m.auspuff) && m.auspuff.length === (id === 'l073' ? 2 : 1), `${m.name}: ${m.auspuff.length} Auspuffrohr(e) für die Flamme`);
  }
  const s = await starteSpiel({ breite: 640, hoehe: 360 });
  await s.page.goto(`${s.url}/auto-labor.html`);
  await s.page.waitForFunction(() => window.__autoLabor, null, { timeout: 60000 });
  const r = await s.page.evaluate(async (ids) => {
    const L = window.__autoLabor, THREE = L.THREE, out = { budget: {}, scheiben: [], funktionen: {} };
    const ladeBild = (src) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.src = src; });
    const hell = (r, g, b) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    L.aufloesung(2);
    for (const id of ids) {
      L.modellWaehlen(id);
      // Draw Calls und Dreiecke: nur das Auto (ohne Flamme und mit Flamme)
      const A = L.auto, sichtbar = L.szene.children.map((o) => o.visible);
      L.szene.children.forEach((o) => { o.visible = o === A.objekt; });
      L.ansicht('hinten34'); L.renderer.render(L.szene, L.kamera);
      const ohne = { calls: L.renderer.info.render.calls, dreiecke: L.renderer.info.render.triangles };
      A.flammePlanen(5, 1); A.flammeBild(5.01); L.renderer.render(L.szene, L.kamera);
      const mit = { calls: L.renderer.info.render.calls, dreiecke: L.renderer.info.render.triangles };
      A.flammeBild(99);
      L.szene.children.forEach((o, i) => { o.visible = sichtbar[i]; });
      out.budget[id] = { ohne, mit };
      // Federung, Lichter, Dreck, Staub-Punkte
      const k = A.karosse, y0 = k.position.y;
      A.federung({ nicken: 0.05, rollen: 0.04, hub: 0.03 });
      const feder = k.rotation.x !== 0 && k.rotation.z !== 0 && k.position.y !== y0;
      A.federung({ nicken: 0, rollen: 0, hub: 0 });
      const hinten = A.teilMeshes.find((x) => x.name === 'auto-ruecklicht').material.color.getHex();
      A.lichter(true, true);
      const an = [A.teilMeshes.find((x) => x.name === 'auto-ruecklicht').material.color.getHex(), A.teilMeshes.find((x) => x.name === 'auto-rueckfahrlicht').material.color.getHex()];
      A.lichter(false, false);
      A.dreck({ menge: 0.5, r: 0.5, g: 0.4, b: 0.3 });
      const dreck = A.uniforms.dreck.value;
      A.dreck({ menge: 0, r: 0, g: 0, b: 0 });
      out.funktionen[id] = { feder, licht: an[0] !== hinten && an[1] === 0xffffff, dreck, staub: !!L.staub };
      // Scheiben (wie M8d (c)): jede Glas-Bemalung vorne/hinten liegt auf einer Fläche dieser Ansicht, Mitte im Bild dunkel
      const m = A.modell, T = m.textur;
      for (const b of m.bemalung.filter((x) => x.farbe === 'glas' && (x.ansicht === 'vorne' || x.ansicht === 'hinten'))) {
        const pts = b.art === 'rechteck' ? [b.von, [b.bis[0], b.von[1]], b.bis, [b.von[0], b.bis[1]]] : b.punkte;
        const mitte = [pts.reduce((s, p) => s + p[0], 0) / pts.length, pts.reduce((s, p) => s + p[1], 0) / pts.length];
        const [px, py] = A.zuAtlas(b.ansicht, mitte[0], mitte[1]);
        const uv = [px / T.breite, 1 - py / T.hoehe];
        const mesh = A.teilMeshes.find((x) => x.name === 'auto-karosserie');
        const P = mesh.geometry.attributes.position.array, UV = mesh.geometry.attributes.uv.array, N = mesh.geometry.attributes.normal.array;
        let treffer = null;
        for (let t = 0; t < P.length / 9; t++) {
          const u = [0, 1, 2].map((q) => [UV[(t * 3 + q) * 2], UV[(t * 3 + q) * 2 + 1]]);
          const d = (u[1][1] - u[2][1]) * (u[0][0] - u[2][0]) + (u[2][0] - u[1][0]) * (u[0][1] - u[2][1]);
          if (Math.abs(d) < 1e-12) continue;
          const l0 = ((u[1][1] - u[2][1]) * (uv[0] - u[2][0]) + (u[2][0] - u[1][0]) * (uv[1] - u[2][1])) / d;
          const l1 = ((u[2][1] - u[0][1]) * (uv[0] - u[2][0]) + (u[0][0] - u[2][0]) * (uv[1] - u[2][1])) / d;
          const l2 = 1 - l0 - l1;
          if (l0 < -1e-6 || l1 < -1e-6 || l2 < -1e-6) continue;
          if ((b.ansicht === 'vorne') !== (N[t * 9 + 2] > 0)) continue;
          const p = [0, 1, 2].map((q) => l0 * P[t * 9 + q] + l1 * P[t * 9 + 3 + q] + l2 * P[t * 9 + 6 + q]);
          if (!treffer || (b.ansicht === 'vorne' ? p[2] > treffer[2] : p[2] < treffer[2])) treffer = p;
        }
        const e = { id, ansicht: b.ansicht, flaeche: !!treffer, lacke: {} };
        if (treffer) {
          for (const lack of m.lackierungen) {
            A.lackierung(lack); L.ansicht(b.ansicht === 'vorne' ? 'front' : 'heck');
            A.federung({ nicken: 0, rollen: 0, hub: 0 }); L.zeichne(0); mesh.updateMatrixWorld(true);
            const w = new THREE.Vector3(...treffer).applyMatrix4(mesh.matrixWorld).project(L.kamera);
            const i = await ladeBild(L.bildDaten());
            const c = document.createElement('canvas'); c.width = i.width; c.height = i.height;
            const x = c.getContext('2d'); x.drawImage(i, 0, 0);
            const sx = Math.round((w.x + 1) / 2 * i.width - 0.5), sy = Math.round((1 - w.y) / 2 * i.height - 0.5);
            const dd = x.getImageData(sx - 1, sy - 1, 3, 3).data;
            let h = 0; for (let q = 0; q < 36; q += 4) h += hell(dd[q], dd[q + 1], dd[q + 2]) / 9;
            const hex = parseInt(L.CONFIG.autoOptik.lackierungen[lack].lack.slice(1), 16);
            e.lacke[lack] = { hell: h, lack: hell(hex >> 16, (hex >> 8) & 255, hex & 255) };
          }
          A.lackierung(m.lackierungen[0]);
        }
        out.scheiben.push(e);
      }
    }
    return out;
  }, NEUE);
  for (const id of NEUE) {
    const b = r.budget[id], f = r.funktionen[id];
    melde(b.ohne.calls <= 12 && b.ohne.dreiecke <= 1800 && b.mit.calls <= 12 && b.mit.calls === b.ohne.calls + 1,
      `${id}: ${b.ohne.calls} Draw Calls / ${b.ohne.dreiecke} Dreiecke ohne Flamme, mit Flamme ${b.mit.calls} / ${b.mit.dreiecke} (höchstens 12 / 1800)`);
    melde(f.feder && f.licht && f.dreck > 0 && f.staub, `${id}: Federung neigt und hebt, Brems- und Rückfahrlicht schalten, Dreck wirkt, Staub da`);
  }
  for (const e of r.scheiben) {
    melde(e.flaeche, `${e.id} ${e.ansicht}: Glas-Bemalung liegt auf einer Fläche der Karosserie in dieser Ansicht`);
    for (const [lack, x] of Object.entries(e.lacke)) melde(x.hell < 0.25 && x.hell < x.lack * 0.75, `  ${e.id} ${lack} ${e.ansicht}: Scheibenmitte Helligkeit ${x.hell.toFixed(3)} (Lack ${x.lack.toFixed(3)})`);
  }
  melde(r.scheiben.filter((e) => e.id === 'l073').every((e) => e.ansicht === 'vorne'), 'Lanza 073: keine Heckscheibe (Motordeckel), nur die Frontscheibe wird geprüft');
  melde(s.fehler.length === 0, `Konsole ohne Fehler (${s.fehler.length})`);
  await s.schliessen();
}

// ---------------------------------------------------------------- (d) Fahrmessung, Testfahrer, Werte-Balken
if (teil('d')) {
  console.log('(d) Fahrmessung (Physik ohne Browser), Kippschwelle, Testfahrer, Pace-Notes, Werte-Balken, Vergleich der fünf Autos');
  const { physik: X, m, CONFIG, FP } = await physikVon();
  const P = X.prototyp;
  for (const id of NEUE) {
    for (const z of Z.ZEILEN) {
      const x = Z.pruefeZeile(z, P, X[id], id);
      const text = `${id} ${z[0]}: ${x.art === 'gleich' ? (x.ok ? 'identisch' : `${x.a} -> ${x.b}`) : `${x.d >= 0 ? '+' : ''}${x.d.toFixed(2)}${x.art === 'prozent' ? ' %' : x.art === 'diff' ? '°' : ''}`} (Ziel ${x.ziel})`;
      if (!x.ok && Z.KOMPROMISSE[id][z[0]]) komp(text, Z.KOMPROMISSE[id][z[0]]); else melde(x.ok, text);
    }
    melde(!X[id].heck90_r80.dreher, `${id}: kein Dreher bei der Heck-Messung (der Regler lenkt gegen)`);
  }
  // Tabellen für STAND.md und die Bilder (screenshots/m8e/60-fahr-messtabelle.md, 61-vergleich-fuenf.md)
  {
    const zahl = (z, r) => { const w = z[1](r); return w == null ? '--' : Number(w).toFixed(z[5] === 'm' || z[5] === 'km/h' ? 1 : 2); };
    const zeige = (z, x, r) => `${zahl(z, r)} ${z[5]}${x.art === 'prozent' ? ` (${x.d >= 0 ? '+' : ''}${x.d.toFixed(1)} %)` : x.art === 'diff' ? ` (${x.d >= 0 ? '+' : ''}${x.d.toFixed(1)}°)` : ''}`;
    const t1 = ['| Messung | Prototyp | Lanza 073 | Ziel Lanza 073 | Subora Imprexa | Ziel Subora |', '|---|---|---|---|---|---|'];
    for (const z of Z.ZEILEN) {
      const l = Z.pruefeZeile(z, P, X.l073, 'l073'), i = Z.pruefeZeile(z, P, X.imprexa, 'imprexa');
      t1.push(`| ${z[0]} | ${zahl(z, P)} ${z[5]} | ${zeige(z, l, X.l073)} ${l.ok ? '✅' : '❌'} | ${l.ziel} | ${zeige(z, i, X.imprexa)} ${i.ok ? '✅' : '❌'} | ${i.ziel} |`);
    }
    const namen = { rt4: 'Audan Quarto', delto: 'Lanza Delto', escorta: 'Fard Escorta', l073: 'Lanza 073', imprexa: 'Subora Imprexa' };
    const t2 = [`| Messung (gegen Prototyp) | ${ALLE.map((id) => namen[id]).join(' | ')} |`, `|---|${ALLE.map(() => '---').join('|')}|`];
    for (const z of Z.ZEILEN) {
      t2.push(`| ${z[0]} | ${ALLE.map((id) => { const x = Z.pruefeZeile(z, P, X[id], 'l073'); return x.art === 'gleich' ? (x.ok ? 'gleich' : 'ANDERS') : x.art === 'prozent' ? `${x.d >= 0 ? '+' : ''}${x.d.toFixed(1)} %` : x.art === 'diff' ? `${x.d >= 0 ? '+' : ''}${x.d.toFixed(1)}°` : `${x.d.toFixed(2)}${z[5] === 's' ? ' s' : '°'}`; }).join(' | ')} |`);
    }
    fs.mkdirSync(path.join(WURZEL, 'screenshots/m8e'), { recursive: true });
    fs.writeFileSync(path.join(WURZEL, 'screenshots/m8e/60-fahr-messtabelle.md'), `${t1.join('\n')}\n`);
    fs.writeFileSync(path.join(WURZEL, 'screenshots/m8e/61-vergleich-fuenf.md'), `${t2.join('\n')}\n`);
    info('Tabellen: screenshots/m8e/60-fahr-messtabelle.md, 61-vergleich-fuenf.md');
  }
  // Kippschwelle antriebHinten (Lanza): Vollgas in der Kurve über einen Bereich; ein Sprung > 1° zwischen zwei Stufen
  // (0.01) gilt als Kippen. Abstand vom eingestellten Wert mindestens 0.03
  FP.waehleFahrprofil('prototyp');
  const gP = m.gasInKurve(80, 60).max;
  FP.waehleFahrprofil('l073');
  const ah = CONFIG.auto.antriebHinten, reihe = [];
  for (let a = 0.9; a <= 2.4 + 1e-9; a += 0.01) { CONFIG.auto.antriebHinten = a; reihe.push([a, m.gasInKurve(80, 60).max - gP]); }
  CONFIG.auto.antriebHinten = ah;
  const spruenge = reihe.slice(1).filter(([, d], i) => Math.abs(d - reihe[i][1]) > 1).map(([a]) => a);
  const naechster = spruenge.length ? Math.min(...spruenge.map((a) => Math.abs(a - ah))) : Infinity;
  melde(naechster >= 0.03, `Lanza 073 antriebHinten ${ah}: Sprünge über 1° zwischen 0.9 und 2.4 bei ${spruenge.length ? spruenge.map((a) => a.toFixed(2)).join(', ') : 'keinem Wert'}; Abstand ${naechster === Infinity ? 'kein Kippen' : naechster.toFixed(2)} (mindestens 0.03)`);
  info(`Verlauf: ${reihe.filter((_, i) => i % 10 === 0).map(([a, d]) => `${a.toFixed(1)}: +${d.toFixed(2)}°`).join(', ')}`);
  FP.waehleFahrprofil('prototyp');
  // Werte-Balken (Vorschrift unverändert): alle fünf
  const { AUTO_MODELLE, werteAusMessung } = await lade(WURZEL, 'js/autos.js');
  for (const id of ALLE) {
    const w = werteAusMessung(P, X[id]);
    melde(JSON.stringify(w) === JSON.stringify(AUTO_MODELLE[id].werte), `Werte-Balken ${AUTO_MODELLE[id].name}: gemessen ${JSON.stringify(w)}, in js/autos.js ${JSON.stringify(AUTO_MODELLE[id].werte)}`);
  }
  const drift = (id) => 2 + X[id].heck90_r80.zusatz + 10 * (X[id].hb_asphalt.nach05 / P.hb_asphalt.nach05 - 1);
  info(`Drift-Balken ungerundet: ${ALLE.map((id) => `${id} ${drift(id).toFixed(1)}`).join(', ')} (über 10 = auf 10 begrenzt)`);
  // Vergleich der fünf: in wie vielen Zeilen liegen zwei Autos weniger als 3 Prozentpunkte (bzw. 1°) auseinander?
  const vergleichbar = Z.ZEILEN.filter((z) => z[2] !== 'gleich' && !['0-60 km/h Gras', '0-100 km/h Bankett', 'Bremsweg 100-0 Asphalt'].includes(z[0]));
  for (let i = 0; i < ALLE.length; i++) {
    for (let j = i + 1; j < ALLE.length; j++) {
      const nah = vergleichbar.filter((z) => {
        const a = Z.pruefeZeile(z, P, X[ALLE[i]], 'l073').d, b = Z.pruefeZeile(z, P, X[ALLE[j]], 'l073').d;
        return Math.abs(a - b) < (z[2] === 'prozent' ? 3 : z[0].startsWith('...') ? 0.15 : 1);
      }).map((z) => z[0]);
      const t = `${ALLE[i]} / ${ALLE[j]}: ${nah.length} von ${vergleichbar.length} Zeilen nah beieinander${nah.length ? ` (${nah.map((x) => x.replace(/ \(.*$/, '').slice(0, 26)).join('; ')})` : ''}`;
      if (nah.length <= 2) melde(true, t); else info(`ZU ÄHNLICH? ${t}`);
    }
  }
  // Testfahrer: drei Stile für Prototyp, Audan, Delto und die zwei neuen
  const s = await starteSpiel({ breite: 640, hoehe: 360 });
  const fahrerCode = fs.readFileSync(path.join(WURZEL, 'tools/testfahrer-browser.js'), 'utf8');
  const tf = {};
  for (const id of ['prototyp', 'rt4', 'delto', ...NEUE]) {
    await s.page.goto(`${s.url}/index.html?menue=aus&auto=${id}`);
    await s.page.waitForFunction(() => window.__alpineRally, null, { timeout: 120000 });
    await s.page.evaluate((code) => { window.__alpineRally.anhalten = true; window.__fahrerUrl = URL.createObjectURL(new Blob([code], { type: 'text/javascript' })); }, fahrerCode);
    tf[id] = {};
    for (const stil of ['vorsichtig', 'mittel', 'flott']) {
      tf[id][stil] = await s.page.evaluate(async (stil) => {
        const A = window.__alpineRally, f = await import(window.__fahrerUrl);
        const r = f.fahreEtappe(A, stil);
        return { zeit: r.zeit, ziel: r.ziel, cps: r.cps, aufpralle: A.stat.aufpralle, kontakte: r.aufpralle.length, haenger: r.haenger };
      }, stil);
    }
  }
  await s.schliessen();
  for (const stil of ['vorsichtig', 'mittel', 'flott']) {
    const p = tf.prototyp[stil].zeit, a = tf.rt4[stil].zeit, d = tf.delto[stil].zeit;
    melde(fmtZeit(p) === { vorsichtig: '2:59.33', mittel: '2:42.35', flott: '2:31.92' }[stil], `Testfahrer ${stil} prototyp ${fmtZeit(p)} (wie 0.7b)`);
    const l = tf.l073[stil], i = tf.imprexa[stil];
    melde(l.ziel && l.aufpralle === 0 && l.kontakte === 0 && l.haenger === 0 && pz(l.zeit, d) >= -1.5 && pz(l.zeit, d) <= 1.5 && pz(l.zeit, a) >= -1,
      `Testfahrer ${stil} Lanza 073 ${fmtZeit(l.zeit)}: gegen Delto ${pz(l.zeit, d).toFixed(2)} % (±1.5), gegen Audan ${pz(l.zeit, a).toFixed(2)} % (nicht mehr als 1 % schneller), Aufpralle ${l.aufpralle} (Kontakte ${l.kontakte}), Hänger ${l.haenger}`);
    melde(i.ziel && i.aufpralle === 0 && i.kontakte === 0 && i.haenger === 0 && pz(i.zeit, p) >= -0.7 && pz(i.zeit, p) <= -0.2 && Math.abs(pz(i.zeit, a)) <= 0.3,
      `Testfahrer ${stil} Subora ${fmtZeit(i.zeit)}: gegen Prototyp ${pz(i.zeit, p).toFixed(2)} % (-0.7 bis -0.2), gegen Audan ${pz(i.zeit, a).toFixed(2)} % (höchstens ±0.3), Aufpralle ${i.aufpralle} (Kontakte ${i.kontakte}), Hänger ${i.haenger}`);
  }
  fs.writeFileSync(path.join(WURZEL, 'tools/m8e-testfahrer.json'), `${JSON.stringify(tf, null, 1)}\n`);
  // Pace-Notes: nur melden (nichts neu schreiben)
  for (const id of NEUE) {
    const r = werkzeug('pacenotes-test.mjs', ['--auto', id]);
    const aus = r.text.split('\n').filter((z) => /ausserhalb\)/.test(z)).map((z) => z.split('|').slice(1, 6).map((x) => x.trim()).join(' '));
    info(`Pace-Notes mit ${id} (nur gemeldet, nichts neu geschrieben): ${aus.length} Kurven ausserhalb des Zielbereichs${aus.length ? `: ${aus.join(' / ')}` : ''}`);
  }
  // Abkürzungen mit den neuen Autos
  for (const id of NEUE) {
    const r = werkzeug('abkuerzungen.mjs', ['--pruefen', '--auto', id]);
    const n = [...r.text.matchAll(/übrig in Kurve [^:]+: (\d+) Linien/g)].map((x) => +x[1]), durch = /Durchkommen in gesperrten Kurven: (\d+)/.exec(r.text);
    melde(n.join(' / ') === '127 / 2 / 342 / 84' && durch && durch[1] === '0', `Abkürzungen mit ${id}: ${n.join(' / ')} übrige Linien, gesperrt durchkommen ${durch ? durch[1] : '?'}`);
  }
}

// ---------------------------------------------------------------- (e) Garage mit fünf Autos
async function garageSpiel(extra = {}) {
  const s = await starteSpiel({ breite: 640, hoehe: 360, auto: '', ...extra });
  const p = s.page;
  await p.addInitScript(() => {
    const knopf = () => ({ pressed: false, value: 0 });
    window.__testPad = { id: 'Testpad', index: 0, connected: true, mapping: 'standard', buttons: Array.from({ length: 17 }, knopf), axes: [0, 0, 0, 0], timestamp: 0 };
    window.__padAn = false;
    navigator.getGamepads = () => (window.__padAn ? [window.__testPad] : []);
  });
  await p.goto(`${s.url}/index.html`);
  await p.waitForFunction(() => window.__alpineRally && window.__alpineRally.menue, null, { timeout: 120000 });
  return s;
}
const garageZustand = (p) => p.evaluate(() => {
  const A = window.__alpineRally, m = A.menue, l = m.seite.eintraege ? (typeof m.seite.eintraege === 'function' ? m.seite.eintraege() : m.seite.eintraege) : [];
  const e = l[m.wahl] || {};
  return {
    seite: m.seite.id, zeiger: e.autoId || (e.lack ? 'LACK' : e.typ === 'zurueck' ? 'ZURUECK' : e.text), auto: A.autoWahl.auto, profil: A.auto, modell: A.autoModell.modell.id,
    lack: A.autoModell.lackName, lacke: { ...A.einstellungen.lacke }, vorschau: A.seiten.garage.vorschauId ? A.seiten.garage.vorschauId() : null,
    vorschauModelle: [...A.vorschauModelle.keys()], zustand: A.ablauf.zustand, hinweis: m.seite.hinweis ? m.seite.hinweis() : '', eingabe: m.letzteEingabe,
  };
});
if (teil('e')) {
  console.log('(e) Garage mit fünf Autos: Tastatur, Gamepad, Maus, Layout, Hinweiszeile, Bestzeiten');
  for (const art of ['tastatur', 'gamepad']) {
    const s = await garageSpiel();
    const p = s.page;
    const G = await p.evaluate(() => window.__alpineRally.CONFIG.menue.gamepad);
    const padKnopf = async (nr) => {
      await p.evaluate((nr) => { window.__padAn = true; Object.assign(window.__testPad.buttons[nr], { pressed: true, value: 1 }); }, nr); await bilder(p, 3);
      await p.evaluate((nr) => { Object.assign(window.__testPad.buttons[nr], { pressed: false, value: 0 }); }, nr); await bilder(p, 3);
    };
    const padStick = async (achse, wert) => {
      await p.evaluate(([a, w]) => { window.__padAn = true; window.__testPad.axes[a] = w; }, [achse, wert]); await bilder(p, 2);
      await p.evaluate((a) => { window.__testPad.axes[a] = 0; }, achse); await bilder(p, 3);
    };
    const E = art === 'gamepad'
      ? { runter: () => padStick(1, 1), hoch: () => padStick(1, -1), rechts: () => padStick(0, 1), ok: () => padKnopf(G.bestaetigen), zurueck: () => padKnopf(G.abbrechen) }
      : { runter: () => p.keyboard.press('ArrowDown'), hoch: () => p.keyboard.press('ArrowUp'), rechts: () => p.keyboard.press('ArrowRight'), ok: () => p.keyboard.press('Space'), zurueck: () => p.keyboard.press('Escape') };
    const pr = (b, t) => melde(b, `${art}: ${t}`);
    if (art === 'gamepad') await padKnopf(G.bestaetigen); else await p.keyboard.press('Enter');
    await bilder(p, 5);
    await E.runter(); await E.ok(); await p.waitForTimeout(400); await bilder(p, 3);
    let x = await garageZustand(p);
    pr(x.seite === 'auto' && x.zeiger === 'rt4', `Garage offen, Zeiger auf ${x.zeiger}; Hinweis "${x.hinweis}" (Eingabe ${x.eingabe})`);
    pr(x.hinweis === (art === 'gamepad' ? 'A = WÄHLEN' : 'LEERTASTE ODER ENTER = WÄHLEN'), `Hinweiszeile passt zur Eingabe (${art}): "${x.hinweis}"`);
    // durch alle fünf Zeilen: die Vorschau folgt dem Zeiger, gewählt bleibt der Audan
    const gesehen = [x.vorschau];
    for (let k = 0; k < 4; k++) { await E.runter(); await bilder(p, 2); x = await garageZustand(p); gesehen.push(x.vorschau); }
    pr(gesehen.join() === ALLE.join() && x.auto === 'rt4', `durch alle fünf Zeilen: Vorschau ${gesehen.join(', ')}, gewählt bleibt ${x.auto}`);
    // hoch zum Lanza 073 und bestätigen
    await E.hoch(); await bilder(p, 2); await E.ok(); await bilder(p, 3); x = await garageZustand(p);
    pr(x.auto === 'l073' && x.profil === 'l073' && x.modell === 'l073' && x.seite === 'auto', `Lanza 073 bestätigt: Auto ${x.auto}, Profil ${x.profil}, Modell ${x.modell}, Garage bleibt offen`);
    const lackL0 = x.lack, lackI0 = x.lacke.imprexa;
    // hinunter zu LACK (über Subora: nur markiert), Lackierung des Lanza wechseln
    await E.runter(); await bilder(p, 2); const ueber = await garageZustand(p);
    await E.runter(); await bilder(p, 2); x = await garageZustand(p);
    pr(ueber.zeiger === 'imprexa' && ueber.auto === 'l073' && x.zeiger === 'LACK' && x.vorschau === 'l073', `über ${ueber.zeiger} (Vorschau ${ueber.vorschau}) zu ${x.zeiger}: gewählt ${x.auto}, Vorschau ${x.vorschau}`);
    await E.rechts(); await bilder(p, 2); x = await garageZustand(p);
    pr(x.lack !== lackL0 && x.lacke.l073 === x.lack && x.lacke.imprexa === lackI0 && x.auto === 'l073', `Lackierung Lanza ${lackL0} -> ${x.lack}, Subora unberührt (${lackI0 ?? 'keine'})`);
    const lackL = x.lack;
    await E.zurueck(); await p.waitForTimeout(400); await bilder(p, 3); x = await garageZustand(p);
    pr(x.seite === 'haupt' && x.auto === 'l073' && x.vorschauModelle.length === 0, `Esc/B: Hauptmenü, Lanza bleibt, Vorschau-Modelle freigegeben (${x.vorschauModelle.length})`);
    await E.ok(); await p.waitForTimeout(400); await bilder(p, 3); x = await garageZustand(p);
    pr(x.seite === 'auto' && x.zeiger === 'l073', `erneut geöffnet: Zeiger auf ${x.zeiger}`);
    await E.zurueck(); await p.waitForTimeout(400); await E.hoch(); await E.ok(); await p.waitForTimeout(1500); await bilder(p, 3); x = await garageZustand(p);
    pr(['countdown', 'rennen'].includes(x.zustand) && x.modell === 'l073' && x.profil === 'l073' && x.lack === lackL, `Rennstart: ${x.modell} mit Profil ${x.profil} und Lackierung ${x.lack}`);
    pr(s.fehler.length === 0, `Konsole ohne Fehler (${s.fehler.length})`);
    await s.schliessen();
  }
  // Maus: zeigen markiert, Klick bestätigt
  {
    const s = await garageSpiel();
    const p = s.page;
    await p.keyboard.press('Enter'); await bilder(p, 5);
    await p.evaluate(() => { const A = window.__alpineRally; A.menue.oeffne(A.seiten.auto); });
    await p.waitForFunction(() => window.__alpineRally.menue.treffer.length > 0 && window.__alpineRally.menue.einblendung >= 1, null, { timeout: 30000 });
    const punkt = (id) => p.evaluate((id) => {
      const A = window.__alpineRally, l = A.menue.seite.eintraege(), r = document.getElementById('hud').getBoundingClientRect();
      const h = A.menue.treffer.find((t) => l[t.nr].autoId === id);
      return h ? [r.left + (h.x + 12) / 320 * r.width, r.top + (h.y + h.h / 2) / 180 * r.height] : null;
    }, id);
    const q = await punkt('imprexa');
    await p.mouse.move(q[0], q[1]); await p.waitForTimeout(200);
    let x = await garageZustand(p);
    melde(x.auto === 'rt4' && x.vorschau === 'imprexa', `Maus: zeigen auf SUBORA markiert (Vorschau ${x.vorschau}), gewählt bleibt ${x.auto}`);
    await p.mouse.click(q[0], q[1]); await p.waitForTimeout(200); x = await garageZustand(p);
    melde(x.auto === 'imprexa', `Maus: Klick bestätigt (${x.auto})`);
    melde(s.fehler.length === 0, `Maus: Konsole ohne Fehler (${s.fehler.length})`);
    await s.schliessen();
  }
  // Layout: Garage (jede Zeile markiert) und Bestzeiten mit allen Kurznamen, de und en, alle Auflösungen
  {
    const s = await garageSpiel();
    const p = s.page;
    await p.keyboard.press('Enter'); await bilder(p, 5);
    const r = await p.evaluate(async () => {
      const A = window.__alpineRally, M = A.CONFIG.menue, GA = A.CONFIG.garage;
      const { textBreite } = await import('/js/pixel.js');
      const T = await import('/js/texte.js');
      const { AUTO_MODELLE } = await import('/js/autos.js');
      const out = [];
      const warte = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      for (const sprache of ['de', 'en']) {
        T.setzeSprache(sprache);
        for (let aufl = 0; aufl < M.aufloesungen.length; aufl++) {
          A.einstellungen.aufloesung = aufl;
          A.menue.oeffne(A.seiten.auto); await warte(); await warte();
          const o = A.menue.rollen;
          const daten = Object.keys(AUTO_MODELLE).flatMap((id) => [T.t(`auto.${id}.daten1`), T.t(`auto.${id}.daten2`)].map((x) => textBreite(x)));
          out.push({ sprache, aufl, gesamt: o.gesamt, sichtH: o.sichtH, hoehe: o.hoehe, y0: o.y0, breite: o.breite, daten: Math.max(...daten),
            hinweis: Math.max(textBreite(T.t('garage.hinweis')), textBreite(T.t('garage.hinweisPad'))), namen: Math.max(...Object.values(AUTO_MODELLE).map((m) => textBreite(m.name))) });
          A.menue.schliesse();
        }
      }
      // Bestzeiten: eine Liste mit allen Kurznamen (alte Einträge ohne Auto, PROTO, alle fünf)
      const B = await import('/js/bestzeiten.js');
      const liste = ['rt4', 'delto', 'escorta', 'l073', 'imprexa', 'prototyp', null].map((auto, i) => ({ zeit: 150 + i * 1.37, datum: '2026-10-21T10:00:00Z', auto }));
      localStorage.setItem(A.CONFIG.menue.bestzeitenName, JSON.stringify({ passstrasse: liste }));
      const best = [];
      for (const sprache of ['de', 'en']) {
        T.setzeSprache(sprache);
        A.menue.oeffne(A.seiten.bestzeiten); await warte(); await warte();
        const z = A.menue.seite.eintraege().filter((e) => e.autoKurz);
        best.push({ sprache, kurz: z.map((e) => e.autoKurz()), breite: A.menue.rollen.breite, inhalt: A.menue.rollen.inhalt, gesamt: A.menue.rollen.gesamt, sichtH: A.menue.rollen.sichtH });
        A.menue.schliesse();
      }
      void B;
      T.setzeSprache('de');
      return { out, best, tafel: GA.tafelBreite, innen: M.innen, spalte: GA.spalte, tafelHoehe: GA.tafelHoehe };
    });
    for (const x of r.out) {
      melde(x.gesamt <= x.sichtH && x.hoehe <= 176 && x.y0 >= 0 && x.y0 + x.hoehe <= 180 && x.daten <= r.tafel - 2 * r.innen && x.hinweis <= r.tafel - 2 * r.innen && x.namen + 10 <= r.spalte - 2 * r.innen,
        `Garage ${x.sprache} Auflösung ${x.aufl}: Einträge ${x.gesamt} von ${x.sichtH} Pixeln (ohne Rollen), Tafel ${x.hoehe} Pixel hoch (höchstens 176), Daten ${x.daten} / Hinweis ${x.hinweis} Pixel breit (Platz ${r.tafel - 2 * r.innen}), Namen ${x.namen} (Spalte ${r.spalte})`);
    }
    for (const b of r.best) {
      melde(b.kurz.join() === 'QUARTO,DELTO,ESCORTA,073,IMPREXA,PROTO,QUARTO' && b.inhalt <= b.breite && b.gesamt <= b.sichtH,
        `Bestzeiten ${b.sprache}: Kurznamen ${b.kurz.join(', ')}; Tabelle ${b.inhalt} Pixel breit (Tafel ${b.breite}), ohne Rollen`);
    }
    melde(s.fehler.length === 0, `Layout: Konsole ohne Fehler (${s.fehler.length})`);
    await s.schliessen();
  }
  teilWerkzeug('menue-test.mjs', [], 'menue-test (alle Menüseiten)');
}

// ---------------------------------------------------------------- (f) Aufheulen
if (teil('f')) {
  console.log('(f) Aufheulen in der Garage');
  // offline (gleicher Code): je Auto ein Aufheulen wie in main.js (Modus 'garage', danach 'aus')
  const s = await starteSpiel({ breite: 320, hoehe: 180 });
  await s.page.goto(`${s.url}/index.html?menue=aus`);
  await s.page.waitForFunction(() => window.__alpineRally, null, { timeout: 120000 });
  const r = await s.page.evaluate(async (ids) => {
    const P = await import('/tools/ton-pruefung.js'), FP = await import('/js/fahrprofil.js');
    const { baueAufheulen } = await import('/js/tonfahrt.js'), { Getriebe } = await import('/js/getriebe.js');
    const C = P.CONFIG, out = {};
    const fahre = async (id, neuStarts = []) => {
      FP.waehleFahrprofil(id);
      const TW = { turboMal: FP.tonWerte.turboMal, knallMal: FP.tonWerte.knallMal };
      let a = null, max = { turbo: 0, lader: 0, pegel: 0, f0: 0 }, ende = null;
      const neu = (von) => baueAufheulen(Getriebe, C.garage.aufheulen, C.getriebe.leerlauf, C.audio.motor.hoechstDrehzahl, !!C.getriebe.turbo.an, von);
      const x = await P.rendereVerlauf((w, t) => {
        if (t === 0 || neuStarts.some((n) => Math.abs(n - t) < 1e-6)) a = neu(a ? a.zustand.drehzahl : C.getriebe.leerlauf);
        let z;
        if (a) {
          const f = a.schritt(1 / 60);
          z = P.zustand({ modus: 'garage', drehzahl: f.drehzahl, gang: 0, zielGang: 0, gas: f.gas, ladedruck: f.ladedruck, turboAn: !!C.getriebe.turbo.an, ...TW });
          if (f.fertig) { a = null; ende = t; }
        } else z = P.zustand({ modus: 'aus' });
        w.aktualisiere(1 / 60, z);
        const u = w.zustand;
        max.turbo = Math.max(max.turbo, u.turbo); max.lader = Math.max(max.lader, u.lader || 0); max.pegel = Math.max(max.pegel, u.motorPegel); max.f0 = Math.max(max.f0, u.f0);
      }, (neuStarts.length ? neuStarts[neuStarts.length - 1] : 0) + 2.4, { limiter: false });
      const d = x.daten, R = P.RATE, dauer = d.length / R;
      let sprung = 0; for (let i = 1; i < d.length; i++) sprung = Math.max(sprung, Math.abs(d[i] - d[i - 1]));
      const blowOff = x.werk.zaehler.blowOff || 0, pops = (x.werk.zaehler.knall || 0) + (x.werk.zaehler.knistern || 0);
      return { max, ende, spitze: P.miss(d).spitze, rmsSpitze: P.miss(d, 0.3, 0.7).rms, rmsEnde: P.miss(d, dauer - 0.3, dauer).rms, sprung, blowOff, pops, nan: P.miss(d).nan, lader: !!x.werk.lader };
    };
    for (const id of ids) out[id] = await fahre(id);
    out.schnell = await fahre('l073', Array.from({ length: 20 }, (_, i) => 0.1 * (i + 1)));
    FP.waehleFahrprofil('prototyp');
    return out;
  }, ALLE);
  for (const id of ALLE) {
    const x = r[id];
    const turbo = { rt4: true, delto: true, imprexa: true }[id] || false, lader = id === 'l073';
    melde(x.ende != null && x.ende <= 1.6 && x.rmsSpitze > 0.05 && x.rmsEnde < 0.003 && !x.nan && (x.max.turbo > 0) === turbo && (x.max.lader > 0) === lader && x.lader === lader,
      `${id}: Aufheulen ${x.ende.toFixed(2)} s, Grundton bis ${x.max.f0.toFixed(0)} Hz, Motorpegel bis ${x.max.pegel.toFixed(3)} (wie im Spiel), RMS oben ${x.rmsSpitze.toFixed(3)}, am Ende ${x.rmsEnde.toFixed(4)} (still); Turbo-Pfeifen ${x.max.turbo > 0 ? 'ja' : 'nein'}, Lader ${x.max.lader > 0 ? 'ja' : 'nein'}, Blow-off ${x.blowOff}, Pops ${x.pops}`);
  }
  const grenze = Math.max(...ALLE.map((id) => r[id].sprung)) * 1.5;
  melde(r.schnell.sprung <= grenze && r.schnell.rmsEnde < 0.003, `20-fach schnell bestätigt (alle 0.1 s neu, Lanza): grösster Sprung von Sample zu Sample ${r.schnell.sprung.toFixed(4)} (einzeln höchstens ${(grenze / 1.5).toFixed(4)}, Grenze ${grenze.toFixed(4)}), am Ende still (${r.schnell.rmsEnde.toFixed(4)})`);
  await s.schliessen();
  // im Spiel: echtes Bestätigen in der Garage (20 Mal in 2 s), Knoten danach wie vorher, nur in der Garage
  const g = await garageSpiel({ breite: 320, hoehe: 180, args: ['--autoplay-policy=no-user-gesture-required'] });
  const p = g.page;
  await p.keyboard.press('Enter');
  await p.waitForFunction(() => window.__alpineRally.ton.werk && window.__alpineRally.ton.werk.aufbau.fertig, null, { timeout: 60000 });
  await p.keyboard.press('ArrowDown'); await p.keyboard.press('Enter'); await p.waitForTimeout(500);
  for (let k = 0; k < 3; k++) await p.keyboard.press('ArrowDown'); // Zeiger auf Lanza 073
  await p.keyboard.press('Space'); await p.waitForTimeout(300);
  const stand = () => p.evaluate(() => { const w = window.__alpineRally.ton.werk; return { stimmen: w.stimmen, aktiv: w.zaehl.knotenAktiv, quellen: w.quellen.length, lader: (w.zaehl.laderGebaut || 0) - (w.zaehl.laderGetrennt || 0), bestaetigen: w.zaehler['menue-bestaetigen'] || 0, laeuft: !!window.__alpineRally.aufheulen }; });
  const v0 = await stand();
  await p.waitForFunction(() => !window.__alpineRally.aufheulen, null, { timeout: 30000 }); await p.waitForTimeout(500);
  const v1 = await stand();
  for (let k = 0; k < 20; k++) { await p.keyboard.press('Space'); await p.waitForTimeout(100); }
  const laeuft = await stand();
  await p.waitForFunction(() => !window.__alpineRally.aufheulen, null, { timeout: 60000 }); await p.waitForTimeout(800);
  const v2 = await stand();
  melde(v0.laeuft && v0.bestaetigen === v1.bestaetigen, `Bestätigen (Leertaste) startet das Aufheulen, statt des Bestätigungstons (Bestätigungstöne ${v0.bestaetigen} -> ${v1.bestaetigen})`);
  melde(laeuft.laeuft && v2.stimmen === 0 && v2.aktiv === 0 && v2.quellen === v1.quellen && v2.lader === 1 && v1.lader === 1,
    `20 Mal in 2 s bestätigt: danach Stimmen ${v2.stimmen}, aktive Einmal-Knoten ${v2.aktiv}, Dauer-Quellen ${v1.quellen} -> ${v2.quellen}, Lader-Knoten ${v1.lader} -> ${v2.lader} (keine hängenden Knoten)`);
  // nicht im Rennen, Countdown, Pause, Zielbildschirm; Verlassen der Garage beendet es
  const sperre = await p.evaluate(async () => {
    const A = window.__alpineRally, erg = {};
    A.aufheulenStarten(); erg.garage = !!A.aufheulen;
    A.menue.zurueck();
    for (let k = 0; k < 4; k++) await new Promise((r) => requestAnimationFrame(r)); // (ein paar Bilder: tonBild beendet es)
    erg.nachZurueck = !!A.aufheulen;
    A.start(); erg.countdown = A.aufheulenStarten();
    A.anhalten = true; A.rennSchritt(4, {}); erg.rennen = A.aufheulenStarten();
    A.pausieren(); erg.pause = A.aufheulenStarten();
    A.anhalten = false; A.zumHauptmenue();
    return erg;
  });
  melde(sperre.garage && !sperre.nachZurueck && sperre.countdown === false && sperre.rennen === false && sperre.pause === false,
    `nur in der Garage: ${JSON.stringify(sperre)} (Zurück beendet es, im Countdown/Rennen/Pause kein Aufheulen)`);
  melde(g.fehler.length === 0, `Konsole ohne Fehler (${g.fehler.length})`);
  await g.schliessen();
  // ohne Ton (?ton=aus): Bestätigen wählt, keine Fehler
  const o = await starteSpiel({ breite: 320, hoehe: 180, auto: '' });
  await o.page.goto(`${o.url}/index.html?ton=aus`);
  await o.page.waitForFunction(() => window.__alpineRally && window.__alpineRally.menue, null, { timeout: 120000 });
  for (const k of ['Enter', 'ArrowDown', 'Enter', 'ArrowDown', 'ArrowDown', 'ArrowDown', 'ArrowDown', 'Space']) { await o.page.keyboard.press(k); await o.page.waitForTimeout(150); }
  const oz = await garageZustand(o.page);
  melde(oz.auto === 'imprexa' && o.fehler.length === 0, `ohne Ton: Subora gewählt (${oz.auto}), kein Aufheulen, keine Fehler (${o.fehler.length})`);
  await o.schliessen();
}

// ---------------------------------------------------------------- (g) Flamme
if (teil('g')) {
  console.log('(g) Flamme aus dem Auspuff');
  const s = await starteSpiel({ breite: 320, hoehe: 180, args: ['--autoplay-policy=no-user-gesture-required'] });
  await s.page.goto(`${s.url}/index.html?menue=aus`);
  await s.page.waitForFunction(() => window.__alpineRally, null, { timeout: 120000 });
  const r = await s.page.evaluate(async (ids) => {
    const A = window.__alpineRally, out = { autos: {} };
    const { baueAuto } = await import('/js/car.js');
    // je Auto: Flamme an den Rohren, drei Stufen, Dauer, unsichtbar ohne Pop (logisch, 60 Bilder/s)
    for (const id of ids) {
      const auto = baueAuto(id, null, 320);
      const f = auto.flamme, pos = f.geometry.attributes.position.array, rohre = auto.modell.auspuff;
      const stufen = new Set();
      let sichtbarOhne = 0, sichtbar = 0;
      for (let k = 0; k < 120; k++) { auto.flammeBild(k / 60); if (auto.flammeSichtbar) sichtbarOhne++; }
      auto.flammePlanen(3, 1);
      for (let k = 0; k < 90; k++) { const t = 2.9 + k / 300; auto.flammeBild(t); if (auto.flammeSichtbar) { sichtbar++; stufen.add(auto.flammeStufeJetzt); } }
      auto.flammePlanen(3, 1); auto.flammeBild(3.01);
      const anRohr = rohre.every((r, i) => Math.abs(pos[i * 18] - r.x) < 1e-6 && Math.abs(pos[i * 18 + 1] - r.y) < 0.2 && Math.abs(pos[i * 18 + 2] - r.z) < 1e-6);
      const laenge = Math.abs(pos[8] - pos[2]);
      out.autos[id] = { sichtbarOhne, stufen: [...stufen].sort().join(','), dauer: sichtbar / 300, anRohr, laenge, rohre: rohre.length, mat: { blend: f.material.blending, fog: f.material.fog, licht: f.material.type } };
      auto.dispose();
    }
    return out;
  }, ALLE);
  for (const id of ALLE) {
    const x = r.autos[id];
    melde(x.sichtbarOhne === 0 && x.stufen === '0,1,2' && x.dauer >= 0.07 && x.dauer <= 0.15 && x.anRohr && x.laenge > 0.6 && x.laenge <= 0.7 + 1e-6 && x.mat.blend === 2 && x.mat.fog === false && x.mat.licht === 'MeshBasicMaterial',
      `${id}: ${x.rohre} Rohr(e), Flamme am Rohrende, Länge ${x.laenge.toFixed(2)} m (stärkster Pop), drei Stufen (${x.stufen}), ${x.dauer.toFixed(3)} s sichtbar, ohne Pop nie sichtbar, additiv und unbeleuchtet, ohne Nebel`);
  }
  await s.schliessen();
  // Gleichzeitig mit dem Ton: echter AudioContext (echte Audio-Uhr mit Ausgabe-Verzögerung), Klangwerk und Auto aus dem
  // Spiel, verdrahtet wie in main.js (Knall-Hörer -> flammePlanen, jedes Bild flammeBild(hoerZeit)), Bildtakt 60 Hz.
  // (Im kopflosen Test-Browser zeichnet das ganze Spiel nur ca. 2 Bilder/s: dort entstehen gar keine Pops, darum hier ohne
  // Spielwelt.) Für jeden Pop: Bild, in dem der Ton die geplante Zeit erreicht, gegen das erste Bild mit Flamme
  {
    const s2 = await starteSpiel({ breite: 320, hoehe: 180, args: ['--autoplay-policy=no-user-gesture-required'] });
    const p = s2.page;
    await p.goto(`${s2.url}/index.html?menue=aus`);
    await p.waitForFunction(() => window.__alpineRally, null, { timeout: 120000 });
    const q = await p.evaluate(async () => {
      const { baueKlangwerk } = await import('/js/audio.js'), { baueAuto } = await import('/js/car.js'), { CONFIG } = await import('/js/config.js');
      const P = await import('/tools/ton-pruefung.js');
      CONFIG.audio.motor.knallChance = 1; // (nur für den Test: jedes Gaswegnehmen eine Salve)
      const ctx = new AudioContext(); await ctx.resume();
      const w = baueKlangwerk(ctx); w.puffernSofort(); w.lautstaerke(0);
      const auto = baueAuto('rt4', null, 320), F = CONFIG.auspuffFlamme, plan = [];
      let knisterNr = 0;
      w.setzeKnallHoerer((art, zeit, staerke) => { // (wie in main.js)
        if (art === 'knistern') { knisterNr++; if ((knisterNr * 0.6180339887) % 1 >= F.knisternAnteil) return; if (auto.flammePlanen(zeit, 0)) plan.push(zeit); }
        else if (auto.flammePlanen(zeit, Math.max(0, Math.min(1, (staerke - 0.1) / 1.15)))) plan.push(zeit);
      });
      const hoerZeit = () => ctx.currentTime - (ctx.outputLatency || ctx.baseLatency || 0);
      const log = [];
      const t0 = performance.now();
      let vor = t0;
      while (performance.now() - t0 < 7000) {
        await new Promise((r) => setTimeout(r, 16));
        const jetzt = performance.now(), t = (jetzt - t0) / 1000;
        w.aktualisiere((jetzt - vor) / 1000, P.zustand({ drehzahl: 5500, gas: t % 1.2 < 0.7 ? 1 : 0, gang: 3, zielGang: 3, tempo: 30, vVor: 30 }));
        vor = jetzt;
        const hz = hoerZeit();
        auto.flammeBild(hz);
        log.push({ hz, sichtbar: auto.flammeSichtbar });
      }
      await ctx.close();
      return { plan, bildLog: log, bilder: log.length, latenz: ctx.outputLatency || ctx.baseLatency || 0 };
    });
    // nur Pops werten, die nicht in den letzten 0.2 s liegen; gesucht wird ab dem Bild des Pops
    // (eine noch brennende Flamme aus derselben Salve davor zählt nicht als "zu früh")
    const ende = q.bildLog.length ? q.bildLog[q.bildLog.length - 1].hz - 0.2 : 0;
    const plan = q.plan.filter((t) => t < ende);
    let versatzMax = 0, gesehen = 0;
    for (const t of plan) {
      const a = q.bildLog.findIndex((b) => b.hz >= t);
      if (a < 0) continue;
      const v = q.bildLog.slice(a).findIndex((b) => b.sichtbar);
      if (v < 0) continue;
      gesehen++;
      versatzMax = Math.max(versatzMax, v);
    }
    const ohnePop = q.bildLog.filter((b) => b.sichtbar && !q.plan.some((t) => b.hz >= t - 0.001 && b.hz <= t + 0.2)).length;
    info(`echte Audio-Uhr: ${q.bilder} Bilder in 7 s, Ausgabe-Verzögerung ${(q.latenz * 1000).toFixed(1)} ms, ${plan.length} Flammen geplant (gewertet), ${gesehen} gesehen`);
    melde(plan.length >= 5 && gesehen >= plan.length - 1 && versatzMax <= 1 && ohnePop === 0, `Flamme gleichzeitig mit dem Ton: grösster Versatz ${versatzMax} Bild(er) (höchstens 1), Bilder mit Flamme ohne Pop: ${ohnePop}`);
    melde(s2.fehler.length === 0, `Konsole ohne Fehler (${s2.fehler.length})`);
    await s2.schliessen();
  }
  // Physik und Ton bit-gleich mit und ohne Flamme: dieselbe Fahrt (rennSchritt), Zustand und Ton-Protokoll vergleichen;
  // dazu offline: Ton mit und ohne Knall-Hörer. Zwei gleiche Offline-Renderings sind im Browser nicht bit-gleich
  // (Rechenrauschen ~1e-4), darum: Ereignis-Protokoll identisch und Sample-Abstand nicht grösser als dieses Rauschen
  {
    const s3 = await starteSpiel({ breite: 320, hoehe: 180 });
    await s3.page.goto(`${s3.url}/index.html?menue=aus&auto=rt4`);
    await s3.page.waitForFunction(() => window.__alpineRally, null, { timeout: 120000 });
    const v = await s3.page.evaluate(async () => {
      const A = window.__alpineRally;
      const fahrt = () => {
        A.anhalten = true; A.start({ countdown: false });
        const zahlen = [];
        for (let k = 0; k < 120 * 30; k++) {
          const e = { gas: (k % 240) < 150 ? 1 : 0, bremse: 0, lenkung: Math.sin(k / 200) * 0.4, handbremse: false, reset: false, debug: false, notes: false, hud: false };
          A.rennSchritt(A.SCHRITT, e);
          if (k % 60 === 0) zahlen.push(A.physik.x, A.physik.z, A.physik.vx, A.physik.vz, A.getriebe.drehzahl);
        }
        return zahlen.join(',');
      };
      A.CONFIG.auspuffFlamme.an = true; const mit = fahrt();
      A.CONFIG.auspuffFlamme.an = false; const ohne = fahrt();
      A.CONFIG.auspuffFlamme.an = true;
      const P = await import('/tools/ton-pruefung.js');
      const ton = async (hoerer) => {
        const x = await P.rendereVerlauf((w, t) => {
          if (t === 0 && hoerer) w.setzeKnallHoerer(() => {});
          w.aktualisiere(1 / 60, P.zustand({ drehzahl: 5500, gas: t % 1 < 0.6 ? 1 : 0, gang: 3, zielGang: 3 }));
        }, 4, { limiter: false });
        return { d: x.daten, prot: JSON.stringify(x.werk.protokoll.map((e) => [e.art, e.t.toFixed(5), e.wert])), pops: x.werk.zaehler.knall || 0 };
      };
      const o1 = await ton(false), o2 = await ton(false), m = await ton(true);
      let rauschen = 0, abstand = 0;
      for (let i = 0; i < o1.d.length; i++) {
        rauschen = Math.max(rauschen, Math.abs(o1.d[i] - o2.d[i]));
        abstand = Math.max(abstand, Math.abs(m.d[i] - o1.d[i]));
      }
      return { physik: mit === ohne, prot: m.prot === o1.prot && o1.prot === o2.prot, rauschen, abstand, pops: m.pops };
    });
    melde(v.physik, 'Physik mit und ohne Flamme bit-gleich (30 s Fahrt im Spiel, Ort, Tempo, Drehzahl)');
    melde(v.prot && v.pops > 0 && v.abstand <= Math.max(2 * v.rauschen, 1e-3),
      `Ton mit und ohne Flamme gleich: Ereignisse identisch, Samples im Rechenrauschen (${v.pops} Pops, Abstand ${v.abstand.toExponential(1)}, Rauschen ${v.rauschen.toExponential(1)})`);
    await s3.schliessen();
  }
  teilWerkzeug('auto-test.mjs', ['--nur', 'g'], 'auto-test (g): 70-s-Prüfsumme prototyp = 0.7b');
}

// ---------------------------------------------------------------- (h) Ton-Messung und Wechsel-Test
if (teil('h')) {
  console.log('(h) Ton-Messung Lanza 073 und Subora gegen den Audan, Wechsel-Test mit allen fünf Autos');
  const M = {};
  for (const id of ['rt4', ...NEUE]) {
    const datei = path.join(WURZEL, `tools/ton-messung-m8e-${id}.json`);
    if (!process.argv.includes('--ton-alt') || !fs.existsSync(datei)) {
      const r = werkzeug('ton-messung.mjs', [`m8e-${id}`, '--profil', id, '--bilder', 'screenshots/m8e']);
      if (r.code !== 0) { melde(false, `ton-messung --profil ${id}: ${r.text.split('\n').slice(-4).join(' ')}`); continue; }
    }
    M[id] = JSON.parse(fs.readFileSync(datei, 'utf8'));
  }
  const tabelle = ['| Messung | Audan Quarto | Lanza 073 | Ziel Lanza 073 | Subora Imprexa | Ziel Subora |', '|---|---|---|---|---|---|'];
  const zahl = (w) => (w == null ? '--' : Math.abs(w) >= 100 ? w.toFixed(0) : Math.abs(w) >= 1 ? w.toFixed(2) : w.toPrecision(3));
  const zt = (x) => (!x ? '–' : x.art === 'hoechstens' ? 'nicht höher' : `${x.ziel[0]} bis ${x.ziel[1]}${x.art === 'prozent' ? ' %' : x.art === 'db' ? ' dB' : x.art === 'faktor' ? ' (mal)' : ''}`);
  const dt = (x) => (!x ? '' : x.art === 'prozent' ? ` (${x.d >= 0 ? '+' : ''}${x.d.toFixed(1)} %)` : x.art === 'db' || x.art === 'hoechstens' ? ` (${x.d >= 0 ? '+' : ''}${x.d.toFixed(2)} dB)` : x.art === 'faktor' ? ` (x${x.d.toFixed(2)})` : '');
  for (const z of Z.TON_ZEILEN) {
    const l = Z.pruefeTon(z, M.rt4, M.l073, 'l073'), i = Z.pruefeTon(z, M.rt4, M.imprexa, 'imprexa');
    for (const [id, x] of [['l073', l], ['imprexa', i]]) if (x) melde(x.ok, `${id} ${z[0]}: ${zahl(x.b)}${dt(x)} gegen Audan ${zahl(x.a)} (Ziel ${zt(x)})`);
    const a = z[1](M.rt4);
    tabelle.push(`| ${z[0]} | ${zahl(a)} | ${l ? `${zahl(l.b)}${dt(l)} ${l.ok ? '✅' : '❌'}` : (z[1](M.l073) == null ? 'kein Lader' : zahl(z[1](M.l073)))} | ${zt(l)} | ${i ? `${zahl(i.b)}${dt(i)} ${i.ok ? '✅' : '❌'}` : (z[1](M.imprexa) == null ? 'kein Lader' : zahl(z[1](M.imprexa)))} | ${zt(i)} |`);
  }
  // Lanza: kein Turbo-Pfeifen, kein Blow-off
  melde(M.l073.profil.turbo.rms === 0 && Math.abs(M.l073.profil.turbo.bandMitDb - M.l073.profil.turbo.bandOhneDb) < 0.01 && M.l073.profil.pops.blowOff === 0,
    `l073: kein Turbo-Pfeifen (RMS ${M.l073.profil.turbo.rms}, Band mit/ohne ${M.l073.profil.turbo.bandMitDb} / ${M.l073.profil.turbo.bandOhneDb} dB), kein Blow-off (${M.l073.profil.pops.blowOff})`);
  // Motor bei Vollgas lauter als Lader und Turbo
  melde(M.l073.profil.lader.gegenMotorDb < -6 && M.imprexa.profil.turbo.verhaeltnisDb < -12, `Motor bleibt lauter: Lader ${M.l073.profil.lader.gegenMotorDb.toFixed(1)} dB, Subora-Turbo ${M.imprexa.profil.turbo.verhaeltnisDb.toFixed(1)} dB unter dem Motor`);
  for (const id of ['rt4', ...NEUE]) info(`${id}: Unregelmässigkeit Leerlauf ${M[id].profil.unrund.leerlauf.toFixed(3)} / Teillast ${M[id].profil.unrund.teillast.toFixed(3)}; Pops ${M[id].profil.pops.pops} + Knistern ${M[id].profil.pops.knistern} + Schaltknall ${M[id].profil.pops.schaltknall} = ${Z.POPS(M[id])} je Minute, Salven ${M[id].profil.pops.salvenMitPops}`);
  fs.mkdirSync(path.join(WURZEL, 'screenshots/m8e'), { recursive: true });
  fs.writeFileSync(path.join(WURZEL, 'screenshots/m8e/70-ton-messtabelle.md'), `${tabelle.join('\n')}\n`);
  info('Tabelle: screenshots/m8e/70-ton-messtabelle.md');

  // Wechsel-Test: 30 Wechsel über alle fünf Autos im Menü
  const { CONFIG } = await lade(WURZEL, 'js/config.js');
  const REF = JSON.parse(JSON.stringify(CONFIG.audio.motor));
  const mische = (ziel, pr) => { for (const [k, w] of Object.entries(pr || {})) { if (w && typeof w === 'object' && !Array.isArray(w)) { if (!ziel[k] || typeof ziel[k] !== 'object') ziel[k] = {}; mische(ziel[k], w); } else ziel[k] = Array.isArray(w) ? [...w] : w; } return ziel; };
  const erwartet = Object.fromEntries(ALLE.map((id) => [id, mische(JSON.parse(JSON.stringify(REF)), CONFIG.fahrprofile[id].ton.motor)]));
  const s = await starteSpiel({ breite: 320, hoehe: 180, auto: '', args: ['--autoplay-policy=no-user-gesture-required'] });
  const p = s.page;
  await p.goto(`${s.url}/index.html`);
  await p.waitForFunction(() => window.__alpineRally && window.__alpineRally.menue, null, { timeout: 120000 });
  await p.keyboard.press('Enter');
  await p.waitForFunction(() => window.__alpineRally.ton.werk && window.__alpineRally.ton.werk.aufbau.fertig, null, { timeout: 60000 });
  const cdp = await p.context().newCDPSession(p);
  const heap = async () => { for (let i = 0; i < 3; i++) await cdp.send('HeapProfiler.collectGarbage'); return (await cdp.send('Runtime.getHeapUsage')).usedSize; };
  const wechsel = (liste) => p.evaluate(async ({ liste, erwartet }) => {
    const A = window.__alpineRally, w = A.ton.werk, M = A.CONFIG.audio.motor, FP = await import('/js/fahrprofil.js');
    const warte = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const probleme = [];
    for (const id of liste) {
      A.autoWechseln(id);
      await warte(); await new Promise((r) => setTimeout(r, 30)); await warte();
      const pr = [];
      if (FP.aktivesTonProfil() !== id) pr.push('Ton-Profil');
      if (JSON.stringify(M) !== JSON.stringify(erwartet[id])) pr.push('Werte');
      if (!!w.lader !== !!(M.lader && M.lader.an)) pr.push('Lader-Knoten');
      if (!!w.unrund !== (M.unrund > 0)) pr.push('unrund-Knoten');
      for (const n of ['pop', 'klack', 'blowOff']) if (w.motorPufferVon[n] !== w.motorSchluessel(n)) pr.push(`Puffer ${n}`);
      if (pr.length) probleme.push(`${id}: ${pr.join(', ')}`);
    }
    const z = w.zaehl;
    return { probleme, stimmen: w.stimmen, aktiv: z.knotenAktiv, quellen: w.quellen.length, lader: (z.laderGebaut || 0) - (z.laderGetrennt || 0), unrund: (z.unrundGebaut || 0) - (z.unrundGetrennt || 0), laderGebaut: z.laderGebaut || 0, unrundGebaut: z.unrundGebaut || 0 };
  }, { liste, erwartet });
  await wechsel(['delto', 'escorta', 'l073', 'imprexa', 'rt4']);
  await p.waitForTimeout(300);
  const h0 = await heap(), v0 = await wechsel([]);
  const liste = Array.from({ length: 30 }, (_, i) => ALLE[(i + 1) % ALLE.length]);
  const r = await wechsel(liste);
  await p.waitForTimeout(400);
  const h1 = await heap(), v1 = await wechsel([]);
  melde(r.probleme.length === 0, `30 Wechsel über alle fünf Autos: Ton-Profil, Motorwerte, Lader- und unrund-Knoten, Motor-Puffer stimmen jedes Mal${r.probleme.length ? `: ${r.probleme.slice(0, 4).join(' | ')}` : ''}`);
  melde(v1.stimmen === 0 && v1.aktiv === 0 && v1.quellen === v0.quellen && v1.lader === v0.lader && v1.unrund === v0.unrund,
    `Audio-Knoten danach wie vorher: Stimmen ${v1.stimmen}, aktive Einmal-Knoten ${v1.aktiv}, Dauer-Quellen ${v0.quellen} -> ${v1.quellen}, Lader ${v0.lader} -> ${v1.lader}, unrund ${v0.unrund} -> ${v1.unrund} (gebaut und wieder getrennt: Lader ${r.laderGebaut}, unrund ${r.unrundGebaut} Mal)`);
  melde((h1 - h0) / 1e6 < 1.0, `Speicher (JS-Heap): ${(h0 / 1e6).toFixed(2)} -> ${(h1 / 1e6).toFixed(2)} MB (Unterschied ${((h1 - h0) / 1e6).toFixed(2)} MB, höchstens 1.0)`);
  const sperre = await p.evaluate(async () => {
    const A = window.__alpineRally, FP = await import('/js/fahrprofil.js'), t0 = FP.aktivesTonProfil(), erg = {};
    A.start(); erg.countdown = A.autoWechseln('l073');
    A.anhalten = true; A.rennSchritt(4, {}); erg.rennen = A.autoWechseln('imprexa');
    A.pausieren(); erg.pause = A.autoWechseln('l073');
    erg.ton = [t0, FP.aktivesTonProfil()];
    A.anhalten = false; A.zumHauptmenue();
    return erg;
  });
  melde(!sperre.countdown && !sperre.rennen && !sperre.pause && sperre.ton[0] === sperre.ton[1], `kein Wechsel im Countdown, Rennen, in der Pause: ${JSON.stringify(sperre)}`);
  melde(s.fehler.length === 0, `Konsole ohne Fehler (${s.fehler.length})`);
  await s.schliessen();
  // Knacken beim Wechsel (offline, Menü mit Musik): auch zu und von den zwei neuen Autos
  const k = await starteSpiel({ breite: 320, hoehe: 180 });
  await k.page.goto(`${k.url}/index.html?menue=aus`);
  await k.page.waitForFunction(() => window.__alpineRally, null, { timeout: 120000 });
  const kn = await k.page.evaluate(async () => {
    const P = await import('/tools/ton-pruefung.js'), FP = await import('/js/fahrprofil.js'), out = {};
    for (const [von, nach] of [['rt4', 'l073'], ['l073', 'imprexa'], ['imprexa', 'escorta'], ['delto', 'l073'], ['l073', 'rt4']]) {
      FP.waehleFahrprofil(von);
      const x = await P.rendereVerlauf((w, t) => {
        if (Math.abs(t - 1.0) < 1e-6) { FP.waehleFahrprofil(nach); w.motorNeu(true); }
        w.aktualisiere(1 / 60, P.zustand({ modus: 'aus', musikModus: 'menue' }));
      }, 2, { limiter: false });
      const d = x.daten, R = P.RATE;
      const sprung = (a, b) => { let m = 0; for (let i = Math.round(a * R) + 1; i < Math.round(b * R); i++) m = Math.max(m, Math.abs(d[i] - d[i - 1])); return m; };
      out[`${von}->${nach}`] = { davor: sprung(0.3, 0.95), wechsel: sprung(0.98, 1.12) };
    }
    FP.waehleFahrprofil('prototyp');
    return out;
  });
  melde(Object.values(kn).every((x) => x.wechsel <= Math.max(0.02, x.davor * 1.5)), `kein Knacken beim Wechsel: ${Object.entries(kn).map(([n, x]) => `${n} ${x.wechsel.toFixed(4)} / ${x.davor.toFixed(4)}`).join(', ')}`);
  await k.schliessen();
  // gemerktes Auto klingt beim ersten Entsperren richtig
  for (const id of NEUE) {
    const g = await starteSpiel({ breite: 320, hoehe: 180, auto: '', args: ['--autoplay-policy=no-user-gesture-required'] });
    await g.page.goto(`${g.url}/index.html`);
    await g.page.waitForFunction(() => window.__alpineRally && window.__alpineRally.menue, null, { timeout: 120000 });
    await g.page.evaluate((id) => { window.__alpineRally.autoWechseln(id); }, id);
    await g.page.reload();
    await g.page.waitForFunction(() => window.__alpineRally && window.__alpineRally.menue, null, { timeout: 120000 });
    await g.page.keyboard.press('Enter');
    await g.page.waitForFunction(() => window.__alpineRally.ton.werk && window.__alpineRally.ton.werk.aufbau.fertig, null, { timeout: 60000 });
    const x = await g.page.evaluate(async (erw) => {
      const A = window.__alpineRally, w = A.ton.werk, M = A.CONFIG.audio.motor, FP = await import('/js/fahrprofil.js');
      return { ton: FP.aktivesTonProfil(), werte: JSON.stringify(M) === JSON.stringify(erw), lader: !!w.lader, unrund: !!w.unrund, wechsel: w.motorWechsel.anzahl, puffer: ['pop', 'klack', 'blowOff'].every((n) => w.motorPufferVon[n] === w.motorSchluessel(n)) };
    }, erwartet[id]);
    melde(x.ton === id && x.werte && x.lader === (id === 'l073') && x.unrund === (id === 'imprexa') && x.puffer && x.wechsel === 0,
      `gemerktes Auto ${id}: beim ersten Entsperren mit seinem Klang gebaut (Werte ${x.werte ? 'ok' : 'FALSCH'}, Lader ${x.lader}, unrund ${x.unrund}, Puffer ${x.puffer ? 'ok' : 'FALSCH'}, ${x.wechsel} Umschaltungen)`);
    await g.schliessen();
  }
}

// ---------------------------------------------------------------- (i) Ton-Labor, Fahr-Labor, Auto-Labor
if (teil('i')) {
  console.log('(i) Ton-Labor, Fahr-Labor, Auto-Labor');
  const s = await starteSpiel({ breite: 1280, hoehe: 900, args: ['--autoplay-policy=no-user-gesture-required'] });
  const p = s.page;
  await p.goto(`${s.url}/ton-labor.html`);
  await p.waitForFunction(() => window.__tonLabor && window.__tonLabor.vergleich, null, { timeout: 60000 });
  await p.click('#tonStarten');
  await p.waitForFunction(() => window.__tonLabor.ton.werk && window.__tonLabor.ton.werk.aufbau.fertig, null, { timeout: 60000 });
  const r = await p.evaluate(async () => {
    const $ = (id) => document.getElementById(id), L = window.__tonLabor, out = {};
    const waehle = (id) => { $('tonProfil').value = id; $('tonProfil').dispatchEvent(new Event('change')); };
    out.profile = [...$('tonProfil').options].map((o) => o.value);
    out.knoepfe = [...document.querySelectorAll('[data-vergleich]')].map((b) => b.dataset.vergleich);
    out.vergleichAutos = L.vergleich.AUTOS;
    const regler = (pfad) => document.getElementById(`f_${pfad.replace(/[^a-z0-9]/gi, '_')}`);
    const setze = (pfad, w) => { const r = regler(pfad); r.value = w; r.dispatchEvent(new Event('input')); };
    out.regler = ['audio.motor.lader.pegel', 'audio.motor.lader.faktor', 'audio.motor.lader.gasAnteil', 'audio.motor.lader.ansprechen', 'audio.motor.unrund'].every((x) => !!regler(x));
    waehle('l073'); await new Promise((r) => setTimeout(r, 200));
    setze('audio.motor.lader.pegel', 0.1);
    waehle('imprexa'); await new Promise((r) => setTimeout(r, 200));
    setze('audio.motor.unrund', 0.5);
    out.unrundKnoten = !!L.ton.werk.unrund;
    $('kopieren').click(); await new Promise((r) => setTimeout(r, 100));
    out.kopie = $('kopieText') ? $('kopieText').value : '';
    $('allesZurueck').click(); await new Promise((r) => setTimeout(r, 100));
    out.nachZurueck = { imprexa: L.CONFIG.fahrprofile.imprexa.ton.motor.unrund, l073: L.CONFIG.fahrprofile.l073.ton.motor.lader.pegel };
    return out;
  }).catch((e) => ({ fehler: String(e) }));
  melde(!r.fehler && r.profile.includes('l073') && r.profile.includes('imprexa') && r.knoepfe.length === 5 && r.vergleichAutos.length === 5 && r.regler,
    `Ton-Labor: FAHRPROFIL (TON) mit ${r.profile ? r.profile.join(', ') : '?'}; ${r.knoepfe ? r.knoepfe.length : '?'} Einzelknöpfe, VERGLEICH mit ${r.vergleichAutos ? r.vergleichAutos.length : '?'} Autos; Regler Lader und unrund ${r.regler ? 'da' : 'FEHLEN'}${r.fehler ? ` (${r.fehler})` : ''}`);
  if (!r.fehler) {
    melde(/fahrprofile\.l073\.ton\.motor\.lader\.pegel = 0\.1/.test(r.kopie) && /fahrprofile\.imprexa\.ton\.motor\.unrund = 0\.5/.test(r.kopie) && r.unrundKnoten,
      `WERTE KOPIEREN nennt das Profil in jeder Zeile (${r.kopie.split('\n').filter((z) => /lader|unrund/.test(z)).join(' | ')})`);
    melde(r.nachZurueck.imprexa === 0.35 && r.nachZurueck.l073 === 0.1, `ALLES ZURÜCK nur für das gewählte Profil (Subora unrund ${r.nachZurueck.imprexa}, Lanza Lader-Pegel bleibt ${r.nachZurueck.l073})`);
  }
  // VERGLEICH mit allen fünf und ein Einzelknopf
  await p.click('#vergleich');
  await p.waitForFunction(() => window.__tonLabor.vergleich.zuletzt && !window.__tonLabor.vergleich.laeuft, null, { timeout: 240000 }).catch(() => {});
  const v = await p.evaluate(() => ({ gehoert: window.__tonLabor.vergleich.zuletzt ? window.__tonLabor.vergleich.zuletzt.gehoert : [] }));
  melde(v.gehoert.join() === ALLE.join(), `VERGLEICH spielt ${v.gehoert.join(', ')}`);
  await p.click('[data-vergleich="l073"]');
  await p.waitForFunction(() => !window.__tonLabor.vergleich.laeuft, null, { timeout: 120000 }).catch(() => {});
  melde(s.fehler.length === 0, `Ton-Labor: Konsole ohne Fehler (${s.fehler.length})`);
  await s.schliessen();
  // Fahr-Labor: ein Knopf je Profil
  const f = await starteSpiel({ breite: 1280, hoehe: 720 });
  await f.page.goto(`${f.url}/index.html?menue=aus&fahrlabor=1&auto=l073`);
  await f.page.waitForFunction(() => window.__alpineRally && window.__alpineRally.fahrlabor, null, { timeout: 120000 });
  const fl = await f.page.evaluate(() => [...document.querySelectorAll('#fahrlabor [data-profil]')].map((b) => b.dataset.profil));
  melde(fl.join() === ['prototyp', ...ALLE].join(), `Fahr-Labor: Knöpfe ${fl.join(', ')}`);
  melde(f.fehler.length === 0, `Fahr-Labor: Konsole ohne Fehler (${f.fehler.length})`);
  await f.schliessen();
  // Auto-Labor: alle fünf Autos mit ihren Lackierungen
  const a = await starteSpiel({ breite: 1280, hoehe: 720 });
  await a.page.goto(`${a.url}/auto-labor.html`);
  await a.page.waitForFunction(() => window.__autoLabor, null, { timeout: 60000 });
  const al = await a.page.evaluate(() => {
    const L = window.__autoLabor, out = {};
    for (const o of document.getElementById('modell').options) { L.modellWaehlen(o.value); out[o.value] = [...document.getElementById('lackierung').options].map((x) => x.value); }
    return out;
  });
  // (M8f: der Subora hat seit M8f vier Lackierungen, alle anderen drei)
  melde(Object.keys(al).join() === ALLE.join() && Object.entries(al).every(([id, l]) => l.length === (id === 'imprexa' ? 4 : 3)), `Auto-Labor: ${Object.entries(al).map(([id, l]) => `${id} (${l.join(', ')})`).join('; ')}`);
  melde(a.fehler.length === 0, `Auto-Labor: Konsole ohne Fehler (${a.fehler.length})`);
  await a.schliessen();
}

// ---------------------------------------------------------------- (j) Stabilität
if (teil('j')) {
  console.log('(j) Stabilität');
  if (process.argv.includes('--lang')) {
    for (const t of ['getriebe-test.mjs', 'lenk-test.mjs', 'handbremse-test.mjs', 'belag-test.mjs', 'rueckwaerts-test.mjs', 'aufprall-test.mjs', 'pacenotes-test.mjs',
      'menue-test.mjs', 'rennablauf-test.mjs', 'ton-test.mjs', 'ton-umgebung-test.mjs', 'auto-test.mjs', 'm8b-test.mjs', 'm8c-test.mjs', 'm8d-test.mjs']) {
      const r = werkzeug(t, t === 'm8c-test.mjs' ? ['--nur', 'a,b,c,d,e,f,g,h,i,j,k'] : []);
      melde(r.code === 0, `${t}: ${r.code === 0 ? 'bestanden' : `NICHT bestanden: ${r.text.split('\n').filter((z) => /FEHLER/.test(z)).slice(0, 3).join(' | ')}`}`);
    }
  } else info('alle bisherigen Tests: nur mit --lang');
  // Bildzeit im Rennen: Durchschnitt der Bildzeit (ms) mit jedem Auto, Draw Calls des Autos im Spiel
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
    melde(b - a <= 30, `Ladezeit (Median aus 9): 0.8d ${a} ms, 0.8e ${b} ms (${b - a >= 0 ? '+' : ''}${b - a} ms, höchstens +30; Streuung im Test-Browser ca. ±100 ms)`);
  } else info('Ladezeit: nur mit --alt <ordner 0.8d>');
}

console.log(`\n${fehler === 0 ? 'Alle Prüfungen bestanden.' : `${fehler} Prüfung(en) NICHT bestanden.`}${kompromisse ? ` (${kompromisse} Kompromiss(e), siehe STAND.md)` : ''}`);
process.exit(fehler === 0 ? 0 : 1);
