// Meilenstein 8d prüfen:  node tools/m8d-test.mjs [--nur a,b,c,d,e,f,g,h] [--alt <ordner 0.8c>]
//   (a) Profil prototyp bit-genau (über tools/m8b-test.mjs --nur c) und Ton wie 0.8c (tools/ton-messung-08c.json)
//   (b) Audan Quarto unverändert: Fahrmessungen, Ton-Messung, Bilder und Lack-Textur wie 0.8c
//   (c) Scheiben: jede Glas-Bemalung vorne/hinten liegt auf einer Fläche der Karosserie, die in diese Ansicht fällt, und
//       im Bild (Auto-Labor Front/Heck, 640x360) ist die Scheibenmitte dunkel – alle Autos, alle Lackierungen
//   (d) Garage mit Tastatur, Gamepad und Maus (Zeiger markiert, Bestätigen wählt), Esc, erneutes Öffnen, Rennstart
//   (e) Motorklang-Wechsel: 30 Wechsel, Werte, Audio-Knoten, Speicher, Knacken, kein Wechsel im Rennen, gemerktes Auto
//   (f) Ton-Messung Delto und Escorta gegen den Audan (Tabelle), Escorta ohne Pfeifen und Blow-off, Pops
//   (g) Ton-Labor: Feinschliff je Profil, WERTE KOPIEREN, ALLES ZURÜCK, VERGLEICH und Einzelknöpfe
//   (h) Stabilität: alle bisherigen Tests (lang), Draw Calls, Ladezeit (mit --alt)
// Ich habe den Ton nicht gehört und das Fahrgefühl nicht gespürt: das sind Messungen.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { starteSpiel, WURZEL } from './spiel-browser.mjs';

const arg = (name) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : null; };
const NUR = arg('--nur') ? arg('--nur').split(',') : null;
const ALT = arg('--alt') ? path.resolve(arg('--alt')) : null;
const teil = (k) => !NUR || NUR.includes(k);
let fehler = 0;
const melde = (ok, text) => { console.log(`${ok ? '  ok  ' : 'FEHLER'} ${text}`); if (!ok) fehler++; };
const komp = (text, grund) => console.log(`  KOMP ${text} – Kompromiss: ${grund}`);
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
const AUTOS = ['rt4', 'delto', 'escorta'];

// Audan: Lack-Textur (alle Lackierungen, drei Bildbreiten) und Geometrie als Prüfsumme – im Auto-Labor gerechnet
async function audanAbdruck(wurzel = WURZEL) {
  const s = await starteSpiel({ wurzel, breite: 640, hoehe: 360 });
  await s.page.goto(`${s.url}/auto-labor.html`);
  await s.page.waitForFunction(() => window.__autoLabor, null, { timeout: 60000 });
  const r = await s.page.evaluate(() => {
    const L = window.__autoLabor, out = {};
    L.modellWaehlen('rt4', 'werk');
    for (const b of [320, 480, 640]) {
      L.auto.detail(b);
      for (const lack of L.auto.modell.lackierungen) { L.auto.lackierung(lack); out[`textur-${lack}-${b}`] = L.auto.leinwand.toDataURL(); }
    }
    for (const m of L.auto.teilMeshes) {
      const g = m.geometry, a = [];
      for (const n of ['position', 'normal', 'uv', 'color']) if (g.attributes[n]) a.push(Array.from(g.attributes[n].array, (x) => x.toFixed(6)).join(','));
      out[`geo-${m.name}`] = a.join('|');
    }
    return out;
  });
  await s.schliessen();
  return Object.fromEntries(Object.entries(r).map(([k, v]) => [k, hash(v)]));
}

// ---------------------------------------------------------------- (c) Scheiben
if (teil('c')) {
  console.log('(c) Scheiben (Front- und Heckscheibe)');
  const s = await starteSpiel({ breite: 640, hoehe: 360 });
  await s.page.goto(`${s.url}/auto-labor.html`);
  await s.page.waitForFunction(() => window.__autoLabor, null, { timeout: 60000 });
  const r = await s.page.evaluate(async (autos) => {
    const L = window.__autoLabor, THREE = L.THREE, out = [];
    const ladeBild = (src) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.src = src; });
    const hell = (r, g, b) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    L.aufloesung(2); // 640x360
    for (const id of autos) {
      L.modellWaehlen(id);
      const m = L.auto.modell, T = m.textur;
      const glas = m.bemalung.filter((b) => b.farbe === 'glas' && (b.ansicht === 'vorne' || b.ansicht === 'hinten'));
      for (const b of glas) {
        const pts = b.art === 'rechteck' ? [b.von, [b.bis[0], b.von[1]], b.bis, [b.von[0], b.bis[1]]] : b.punkte;
        const mitte = [pts.reduce((s, p) => s + p[0], 0) / pts.length, pts.reduce((s, p) => s + p[1], 0) / pts.length];
        // 1) Baukasten: welche Dreiecke der Karosserie lesen diesen Punkt der Ansicht? (UV im Dreieck)
        const [px, py] = L.auto.zuAtlas(b.ansicht, mitte[0], mitte[1]);
        const uv = [px / T.breite, 1 - py / T.hoehe];
        const mesh = L.auto.teilMeshes.find((x) => x.name === 'auto-karosserie');
        const P = mesh.geometry.attributes.position.array, UV = mesh.geometry.attributes.uv.array, N = mesh.geometry.attributes.normal.array;
        let treffer = null;
        for (let t = 0; t < P.length / 9; t++) {
          const u = [0, 1, 2].map((k) => [UV[(t * 3 + k) * 2], UV[(t * 3 + k) * 2 + 1]]);
          const d = (u[1][1] - u[2][1]) * (u[0][0] - u[2][0]) + (u[2][0] - u[1][0]) * (u[0][1] - u[2][1]);
          if (Math.abs(d) < 1e-12) continue;
          const l0 = ((u[1][1] - u[2][1]) * (uv[0] - u[2][0]) + (u[2][0] - u[1][0]) * (uv[1] - u[2][1])) / d;
          const l1 = ((u[2][1] - u[0][1]) * (uv[0] - u[2][0]) + (u[0][0] - u[2][0]) * (uv[1] - u[2][1])) / d;
          const l2 = 1 - l0 - l1;
          if (l0 < -1e-6 || l1 < -1e-6 || l2 < -1e-6) continue;
          const nz = N[t * 9 + 2];
          if ((b.ansicht === 'vorne') !== (nz > 0)) continue; // muss auch wirklich nach vorne bzw. hinten schauen
          const p = [0, 1, 2].map((k) => l0 * P[t * 9 + k] + l1 * P[t * 9 + 3 + k] + l2 * P[t * 9 + 6 + k]);
          if (!treffer || (b.ansicht === 'vorne' ? p[2] > treffer[2] : p[2] < treffer[2])) treffer = p; // vorderste/hinterste
        }
        // 2) Bild: in jeder Lackierung die Scheibenmitte von vorne bzw. hinten anschauen
        const ergebnis = { id, ansicht: b.ansicht, mitte, flaeche: !!treffer, lacke: {} };
        if (treffer) {
          for (const lack of m.lackierungen) {
            L.auto.lackierung(lack); L.ansicht(b.ansicht === 'vorne' ? 'front' : 'heck');
            L.auto.federung({ nicken: 0, rollen: 0, hub: 0 });
            L.zeichne(0);
            mesh.updateMatrixWorld(true);
            const w = new THREE.Vector3(...treffer).applyMatrix4(mesh.matrixWorld).project(L.kamera);
            const i = await ladeBild(L.bildDaten());
            const c = document.createElement('canvas'); c.width = i.width; c.height = i.height;
            const x = c.getContext('2d'); x.drawImage(i, 0, 0);
            const sx = Math.round((w.x + 1) / 2 * i.width - 0.5), sy = Math.round((1 - w.y) / 2 * i.height - 0.5);
            const d = x.getImageData(sx - 1, sy - 1, 3, 3).data;
            let h = 0; for (let k = 0; k < 36; k += 4) h += hell(d[k], d[k + 1], d[k + 2]) / 9;
            const hex = parseInt(L.CONFIG.autoOptik.lackierungen[lack].lack.slice(1), 16);
            const lh = hell(hex >> 16, (hex >> 8) & 255, hex & 255); // (sRGB-Werte der Lackfarbe, wie im Bild)
            ergebnis.lacke[lack] = { hell: h, lack: lh, bildpunkt: [sx, sy] };
          }
          L.auto.lackierung(m.lackierungen[0]);
        }
        out.push(ergebnis);
      }
    }
    return out;
  }, AUTOS);
  const glasHell = 0x2a / 255; // glas #1c2834 = 0.15, mit Licht etwas heller
  for (const e of r) {
    melde(e.flaeche, `${e.id} ${e.ansicht}: Glas-Bemalung (Mitte ${e.mitte.map((x) => x.toFixed(2)).join(' / ')}) liegt auf einer Fläche der Karosserie in der Ansicht ${e.ansicht}`);
    for (const [lack, x] of Object.entries(e.lacke)) {
      // dunkel: absolut dunkel (wie Glas) und klar unter dem Lack (bei dunklem Lack wie Waldgrün mindestens 25 % dunkler)
      const ok = x.hell < 0.25 && x.hell < x.lack * 0.75;
      melde(ok, `  ${e.id} ${lack} ${e.ansicht === 'vorne' ? 'Front' : 'Heck'}: Scheibenmitte Helligkeit ${x.hell.toFixed(3)} (Lack ${x.lack.toFixed(3)}, Glas ca. ${glasHell.toFixed(2)}) bei Bildpunkt ${x.bildpunkt.join('/')}`);
    }
  }
  // Audan-Textur und Geometrie gleich wie 0.8c
  const refDatei = path.join(WURZEL, 'tools/m8d-referenz-audan.json');
  const ref = ALT ? await audanAbdruck(ALT) : JSON.parse(fs.readFileSync(refDatei, 'utf8'));
  if (ALT && process.argv.includes('--referenz-schreiben')) fs.writeFileSync(refDatei, `${JSON.stringify(ref, null, 1)}\n`);
  const jetzt = await audanAbdruck();
  const anders = Object.keys(ref).filter((k) => ref[k] !== jetzt[k]);
  melde(anders.length === 0 && Object.keys(ref).length === Object.keys(jetzt).length, `Audan: Lack-Textur (3 Lackierungen x 3 Bildbreiten) und Geometrie gleich wie 0.8c (${Object.keys(ref).length} Prüfsummen${anders.length ? `, anders: ${anders.join(', ')}` : ''})`);
  melde(s.fehler.length === 0, `Konsole ohne Fehler (${s.fehler.length})`);
  await s.schliessen();
}

console.log(fehler ? `\n${fehler} FEHLER` : '\nAlles bestanden.');
process.exit(fehler ? 1 : 0);
