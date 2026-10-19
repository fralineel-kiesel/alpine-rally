// Leistung für Meilenstein 7b:  node tools/m7b-leistung.mjs [ordner der alten Version]
//  - Zeichenaufrufe der 3D-Szene an drei Stellen (alt gegen neu)
//  - Audio-Knoten: dauerhaft angelegt (alt gegen neu) und in einem vollen Moment (Umgebung, Musik)
//  - Puffer-Aufbau nach dem Entsperren (alt gegen neu)
//  - Bildzeit mit Ton gegen ?ton=aus: im Rennen (Fan-Spot Kehre 3 mit Gemurmel, Vögeln, Motor) und im Menü (Musik)
//  - Rechenzeit von tonBild() und Speicher pro Bild (Heap, ohne einmalige Klänge)

import path from 'node:path';
import { starteSpiel } from './spiel-browser.mjs';

const ARGS = ['--autoplay-policy=no-user-gesture-required', '--js-flags=--expose-gc', '--enable-precise-memory-info'];
const alt = process.argv[2] ? path.resolve(process.argv[2]) : null;
const bilder = (p, n) => p.evaluate((n) => new Promise((r) => { let k = 0; const f = () => (++k >= n ? r() : requestAnimationFrame(f)); requestAnimationFrame(f); }), n);
const median = (a) => a.slice().sort((x, y) => x - y)[Math.floor(a.length / 2)];

async function zeichenaufrufe(wurzel) {
  const s = await starteSpiel({ wurzel, breite: 640, hoehe: 360 });
  await s.ladeSpiel(true);
  const erg = [];
  for (const m of [60, 1170, 2900]) {
    await s.page.evaluate((m) => { const A = window.__alpineRally; A.setzeAuf(m); A.kameraSofort(); }, m);
    await bilder(s.page, 4);
    erg.push(await s.page.evaluate(() => window.__alpineRally.renderer.info.render.calls));
  }
  await s.schliessen();
  return erg;
}
// Knoten zählen: alle create...-Aufrufe des AudioContext, beim Bau und beim Puffer-Aufbau
async function knotenUndAufbau(wurzel) {
  const s = await starteSpiel({ wurzel, breite: 640, hoehe: 360, args: ARGS });
  await s.page.addInitScript(() => {
    window.__knoten = {};
    const P = (window.AudioContext || window.webkitAudioContext).prototype;
    for (const n of Object.getOwnPropertyNames(BaseAudioContext.prototype)) {
      if (!/^create/.test(n) || n === 'createBuffer' || n === 'createPeriodicWave') continue;
      const orig = BaseAudioContext.prototype[n];
      BaseAudioContext.prototype[n] = function (...a) { window.__knoten[n] = (window.__knoten[n] || 0) + 1; return orig.apply(this, a); };
    }
    void P;
  });
  await s.page.goto(`${s.url}/index.html`);
  await s.page.waitForFunction(() => window.__alpineRally, null, { timeout: 120000 });
  await bilder(s.page, 3);
  await s.page.keyboard.press('Enter');
  await s.page.waitForFunction(() => window.__alpineRally.ton.werk && window.__alpineRally.ton.werk.aufbau.fertig, null, { timeout: 30000 });
  const r = await s.page.evaluate(() => {
    const k = { ...window.__knoten }, w = window.__alpineRally.ton.werk;
    return { knoten: k, aufbau: { ms: w.aufbau.ms, haeppchen: w.aufbau.haeppchen, laengstes: w.aufbau.laengstesMs, fertig: w.aufbau.ende - w.aufbau.start } };
  });
  await s.schliessen();
  return r;
}
const nZ = await zeichenaufrufe(undefined), aZ = alt ? await zeichenaufrufe(alt) : null;
console.log(`Zeichenaufrufe (60 m, 1170 m, 2900 m): neu ${nZ.join(' / ')}${aZ ? `, alt ${aZ.join(' / ')}` : ''}`);
const nK = await knotenUndAufbau(undefined), aK = alt ? await knotenUndAufbau(alt) : null;
const summe = (k) => Object.values(k).reduce((a, b) => a + b, 0);
// (Musik: im Menü entstehen laufend Notenknoten; gezählt wird nur, was beim Bau und Puffer-Aufbau entsteht, ohne die Noten)
console.log(`Audio-Knoten beim Entsperren (Bau + Puffer + erste Noten): neu ${summe(nK.knoten)} ${JSON.stringify(nK.knoten)}${aK ? `\n                                   alt ${summe(aK.knoten)} ${JSON.stringify(aK.knoten)}` : ''}`);
for (const [n, k] of [['neu', nK], ['alt', aK]]) if (k) console.log(`Puffer-Aufbau ${n}: ${k.aufbau.ms.toFixed(0)} ms Rechenzeit in ${k.aufbau.haeppchen} Häppchen, längstes ${k.aufbau.laengstes.toFixed(1)} ms, fertig nach ${k.aufbau.fertig.toFixed(0)} ms`);

// Dauerhafte Knoten genau (ohne Noten): Klangwerk auf einem OfflineAudioContext bauen und zählen
{
  const s = await starteSpiel({ args: ARGS });
  await s.page.goto(`${s.url}/ton-labor.html`);
  const r = await s.page.evaluate(async () => {
    const { baueKlangwerk } = await import('/js/audio.js');
    const ctx = new OfflineAudioContext(2, 44100, 44100), zahl = {};
    for (const n of Object.getOwnPropertyNames(BaseAudioContext.prototype)) {
      if (!/^create/.test(n) || n === 'createBuffer' || n === 'createPeriodicWave') continue;
      const orig = ctx[n].bind(ctx);
      ctx[n] = (...a) => { zahl[n] = (zahl[n] || 0) + 1; return orig(...a); };
    }
    const w = baueKlangwerk(ctx); w.puffernSofort();
    const t = Object.values(zahl).reduce((a, b) => a + b, 0);
    return { t, zahl };
  });
  console.log(`Audio-Knoten dauerhaft (neu, ohne Noten): ${r.t} ${JSON.stringify(r.zahl)}`);
  await s.schliessen();
}

// Bildzeit: Rennen am Fan-Spot Kehre 3 (Gemurmel, Vögel, Kühe in der Nähe, Motor Vollgas) und Menü (Musik), mit Ton / ?ton=aus
async function seite(adresse, wo) {
  const s = await starteSpiel({ breite: 640, hoehe: 360, args: ARGS });
  await s.page.goto(`${s.url}/index.html${adresse}`);
  await s.page.waitForFunction(() => window.__alpineRally, null, { timeout: 120000 });
  await bilder(s.page, 5);
  await s.page.keyboard.press('Enter');
  await s.page.waitForFunction(() => { const t = window.__alpineRally.ton; return !t.an || (t.werk && t.werk.aufbau.fertig); }, null, { timeout: 30000 });
  if (wo === 'rennen') {
    await s.page.evaluate(() => {
      const A = window.__alpineRally;
      A.start({ countdown: false }); A.anhalten = true; A.setzeAuf(1690);
      const halte = () => {
        A.getriebe.drehzahl = 5600; A.getriebe.gang = 3; A.tonEingabe.gas = 1;
        const p = A.physik; p.vx = Math.sin(p.richtung) * 8; p.vz = Math.cos(p.richtung) * 8;
        requestAnimationFrame(halte);
      };
      halte();
    });
    await new Promise((r) => setTimeout(r, 2000)); // (die Menü-Musik blendet erst aus)
  }
  return s;
}
async function bildzeit(s, sek = 6) {
  return s.page.evaluate((sek) => new Promise((r) => {
    const z = []; let t0 = performance.now(), vor = t0;
    const f = (jetzt) => { z.push(jetzt - vor); vor = jetzt; if (jetzt - t0 < sek * 1000) requestAnimationFrame(f); else r(z); };
    requestAnimationFrame(f);
  }), sek);
}
for (const wo of ['rennen', 'menue']) {
  const zm = [], zo = [];
  let info = null;
  for (let runde = 0; runde < 2; runde++) {
    for (const adresse of ['', '?ton=aus']) {
      const s = await seite(adresse, wo);
      await bilder(s.page, 10);
      (adresse ? zo : zm).push(...(await bildzeit(s, 8)));
      if (!adresse && !info) {
        info = await s.page.evaluate((wo) => {
          const A = window.__alpineRally, w = A.ton.werk, U = w.umgebung;
          const aktiv = { umgebungKnoten: U.zaehl.knotenAktiv, umgebungStimmen: U.stimmen, musik: w.musik.status().oszillatoren, signale: w.zaehl.knotenAktiv };
          // Rechenzeit tonBild()
          const n = 20000, t0 = performance.now();
          for (let k = 0; k < n; k++) A.tonBild(1 / 60);
          const us = (performance.now() - t0) / n * 1000;
          // Speicher pro Bild: ohne einmalige Klänge (Vögel, Glocken aus), nur die Bild-Rechnung
          const C = A.CONFIG.audio.umgebung, vf = C.voegel.dichteFaktor, kr = C.kuhglocken.radius;
          C.voegel.dichteFaktor = 0; C.kuhglocken.radius = 0;
          for (let k = 0; k < 2000; k++) A.tonBild(1 / 60);
          let heap = null;
          if (window.gc && performance.memory) {
            window.gc(); const h0 = performance.memory.usedJSHeapSize;
            for (let k = 0; k < 20000; k++) A.tonBild(1 / 60);
            const h1 = performance.memory.usedJSHeapSize;
            heap = (h1 - h0) / 20000;
          }
          C.voegel.dichteFaktor = vf; C.kuhglocken.radius = kr;
          return { us, heap, aktiv, modus: A.ablauf.zustand, murmel: [...U.zustand.murmelPegel] };
        }, wo);
      }
      await s.schliessen();
    }
  }
  console.log(`${wo === 'rennen' ? 'Rennen (Kehre 3, Gemurmel, Vögel, Motor)' : 'Menü (Musik)'}: Bildzeit mit Ton Median ${median(zm).toFixed(1)} ms, ohne Ton ${median(zo).toFixed(1)} ms (${zm.length} / ${zo.length} Bilder)`);
  console.log(`   tonBild(): ${info.us.toFixed(1)} µs pro Bild; Speicher pro Bild ${info.heap === null ? 'nicht messbar' : `${info.heap.toFixed(2)} Byte`}; aktiv ${JSON.stringify(info.aktiv)}, Zustand ${info.modus}, Gemurmel ${info.murmel.map((x) => x.toFixed(3)).join('/')}`);
}
