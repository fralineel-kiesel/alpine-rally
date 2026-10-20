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

// ---------------------------------------------------------------- (d) Garage mit Tastatur, Gamepad und Maus
// Ein Durchgang: Spiel frisch laden (ohne gemerkte Werte), Titel -> Hauptmenü -> AUTO, dann die Schritte von Teil B.7.
// eingabe: { runter(), hoch(), rechts(), bestaetigen(), zurueck() } – Tastatur, Gamepad (simuliert) oder gemischt mit Maus
async function garageDurchgang(art) {
  const s = await starteSpiel({ breite: 640, hoehe: 360, auto: '' });
  const p = s.page;
  // simuliertes Gamepad (navigator.getGamepads): Knöpfe und Achsen setzt der Test
  await p.addInitScript(() => {
    const knopf = () => ({ pressed: false, value: 0 });
    window.__testPad = { id: 'Testpad', index: 0, connected: true, mapping: 'standard', buttons: Array.from({ length: 17 }, knopf), axes: [0, 0, 0, 0], timestamp: 0 };
    window.__padAn = false;
    navigator.getGamepads = () => (window.__padAn ? [window.__testPad] : []);
  });
  await p.goto(`${s.url}/index.html`);
  await p.waitForFunction(() => window.__alpineRally && window.__alpineRally.menue, null, { timeout: 120000 });
  const bilder = (n = 3) => p.evaluate((n) => new Promise((r) => { let k = 0; const f = () => (++k >= n ? r() : requestAnimationFrame(f)); requestAnimationFrame(f); }), n);
  const G = await p.evaluate(() => window.__alpineRally.CONFIG.menue.gamepad);
  const padKnopf = async (nr) => {
    await p.evaluate((nr) => { window.__padAn = true; Object.assign(window.__testPad.buttons[nr], { pressed: true, value: 1 }); }, nr); await bilder(3);
    await p.evaluate((nr) => { Object.assign(window.__testPad.buttons[nr], { pressed: false, value: 0 }); }, nr); await bilder(3);
  };
  const padStick = async (achse, wert) => {
    await p.evaluate(([a, w]) => { window.__padAn = true; window.__testPad.axes[a] = w; }, [achse, wert]); await bilder(2);
    await p.evaluate((a) => { window.__testPad.axes[a] = 0; }, achse); await bilder(3);
  };
  const E = art === 'gamepad'
    ? { runter: () => padStick(1, 1), hoch: () => padStick(1, -1), rechts: () => padStick(0, 1), bestaetigen: () => padKnopf(G.bestaetigen), zurueck: () => padKnopf(G.abbrechen) }
    : { runter: () => p.keyboard.press('ArrowDown'), hoch: () => p.keyboard.press('ArrowUp'), rechts: () => p.keyboard.press('ArrowRight'), bestaetigen: () => p.keyboard.press(art === 'leertaste' ? 'Space' : 'Enter'), zurueck: () => p.keyboard.press('Escape') };
  const z = () => p.evaluate(() => {
    const A = window.__alpineRally, m = A.menue, l = m.seite.eintraege ? (typeof m.seite.eintraege === 'function' ? m.seite.eintraege() : m.seite.eintraege) : [];
    const e = l[m.wahl] || {};
    const gelb = l.filter((x) => x.autoId && x.farbeText && x.farbeText() === A.CONFIG.menue.farbeWert).map((x) => x.autoId);
    return {
      seite: m.seite.id, zeiger: e.autoId || (e.lack ? 'LACK' : e.typ === 'zurueck' ? 'ZURUECK' : e.text), auto: A.autoWahl.auto, profil: A.auto, modell: A.autoModell.modell.id,
      lack: A.autoModell.lackName, lacke: { ...A.einstellungen.lacke }, gelb, vorschau: A.seiten.garage.vorschauId ? A.seiten.garage.vorschauId() : null,
      vorschauModelle: [...A.vorschauModelle.keys()], zustand: A.ablauf.zustand,
    };
  });
  const pr = (bed, text) => melde(bed, `${art}: ${text}`);
  // Titel -> Hauptmenü -> AUTO (gleiche Eingabeart)
  if (art === 'gamepad') await padKnopf(G.bestaetigen); else await p.keyboard.press('Enter');
  await bilder(5);
  await E.runter(); await E.bestaetigen(); await p.waitForTimeout(400); await bilder(3);
  let x = await z();
  pr(x.seite === 'auto' && x.zeiger === 'rt4' && x.auto === 'rt4', `Garage offen, Zeiger auf ${x.zeiger}, gewählt ${x.auto}`);
  const lackAudan = x.lacke.rt4 || 'werk';
  // [unten] markiert Delto: nichts gewählt, Vorschau zeigt Delto
  await E.runter(); await bilder(3); x = await z();
  pr(x.zeiger === 'delto' && x.auto === 'rt4' && x.profil === 'rt4' && x.modell === 'rt4' && x.vorschau === 'delto' && x.gelb.join() === 'rt4',
    `[unten]: Zeiger ${x.zeiger}, gewählt bleibt ${x.auto} (Profil ${x.profil}, Modell ${x.modell}), Vorschau ${x.vorschau}, gelb ${x.gelb}`);
  // [bestätigen] wählt Delto, Garage bleibt offen, Delto gelb
  await E.bestaetigen(); await bilder(3); x = await z();
  pr(x.seite === 'auto' && x.zeiger === 'delto' && x.auto === 'delto' && x.profil === 'delto' && x.modell === 'delto' && x.gelb.join() === 'delto',
    `[${art === 'gamepad' ? 'A' : art === 'leertaste' ? 'Leertaste' : 'Enter'}]: gewählt ${x.auto} (Profil ${x.profil}, Modell ${x.modell}), Seite ${x.seite} bleibt offen, gelb ${x.gelb}`);
  const lackDelto0 = x.lack;
  // [unten, unten] über Escorta nach LACK: nichts ändert sich
  await E.runter(); await bilder(2); const ueber = await z();
  await E.runter(); await bilder(2); x = await z();
  pr(ueber.zeiger === 'escorta' && ueber.auto === 'delto' && ueber.vorschau === 'escorta' && x.zeiger === 'LACK' && x.auto === 'delto' && x.profil === 'delto' && x.modell === 'delto' && x.vorschau === 'delto',
    `[unten, unten]: über ${ueber.zeiger} (Vorschau ${ueber.vorschau}) nach ${x.zeiger}, gewählt bleibt ${x.auto} / ${x.profil} / ${x.modell}, Vorschau wieder ${x.vorschau}`);
  // [rechts] wechselt die Lackierung des Delto, Escorta unberührt
  const lackEscorta0 = x.lacke.escorta;
  await E.rechts(); await bilder(2); x = await z();
  pr(x.lack !== lackDelto0 && x.lacke.delto === x.lack && x.lacke.escorta === lackEscorta0 && x.modell === 'delto',
    `[rechts]: Lackierung Delto ${lackDelto0} -> ${x.lack} (gemerkt ${x.lacke.delto}), Escorta unberührt (${lackEscorta0 ?? 'keine'})`);
  const lackDelto = x.lack;
  // frei hoch und runter, ohne dass sich etwas ändert
  for (const r of ['hoch', 'hoch', 'hoch', 'runter', 'runter', 'runter']) await E[r]();
  await bilder(2); x = await z();
  pr(x.zeiger === 'LACK' && x.auto === 'delto' && x.lack === lackDelto, `frei hoch/runter (3x hoch über alle Autos, 3x runter): gewählt ${x.auto}, Lack ${x.lack}`);
  // schon gewähltes Auto bestätigen: kein Fehler
  await E.hoch(); await E.hoch(); await bilder(2);
  const vor = await z(); await E.bestaetigen(); await bilder(2); x = await z();
  pr(vor.zeiger === 'delto' && x.auto === 'delto' && x.lack === lackDelto && x.seite === 'auto', `gewähltes Auto nochmals bestätigt: bleibt ${x.auto}, Lack ${x.lack}, Garage offen`);
  // markiert (Escorta), dann Esc: das bestätigte Auto bleibt
  await E.runter(); await bilder(2);
  await E.zurueck(); await p.waitForTimeout(400); await bilder(3); x = await z();
  pr(x.seite === 'haupt' && x.auto === 'delto' && x.vorschauModelle.length === 0, `Escorta markiert, ${art === 'gamepad' ? 'B' : 'Esc'}: Hauptmenü, gewählt bleibt ${x.auto}, Vorschau-Modelle freigegeben (${x.vorschauModelle.length})`);
  // erneut öffnen: Zeiger auf Delto, Delto gelb
  await E.bestaetigen(); await p.waitForTimeout(400); await bilder(3); x = await z();
  pr(x.seite === 'auto' && x.zeiger === 'delto' && x.gelb.join() === 'delto', `erneut geöffnet: Zeiger auf ${x.zeiger}, gelb ${x.gelb}`);
  // Rennen starten: zurück, STARTEN
  await E.zurueck(); await p.waitForTimeout(400); await E.hoch(); await E.bestaetigen(); await p.waitForTimeout(1500); await bilder(3); x = await z();
  pr(['countdown', 'rennen'].includes(x.zustand) && x.auto === 'delto' && x.profil === 'delto' && x.modell === 'delto' && x.lack === lackDelto,
    `Rennen (${x.zustand}): ${x.modell} fährt mit Profil ${x.profil} und Lackierung ${x.lack}`);
  pr(s.fehler.length === 0, `Konsole ohne Fehler (${s.fehler.length})`);
  void lackAudan;
  await s.schliessen();
}

async function garageMaus() {
  const s = await starteSpiel({ breite: 640, hoehe: 360, auto: '' });
  const p = s.page;
  await p.goto(`${s.url}/index.html`);
  await p.waitForFunction(() => window.__alpineRally && window.__alpineRally.menue, null, { timeout: 120000 });
  await p.keyboard.press('Enter'); await p.waitForTimeout(300);
  await p.evaluate(() => { const A = window.__alpineRally; A.menue.oeffne(A.seiten.auto); });
  await p.waitForFunction(() => window.__alpineRally.menue.treffer.length > 0 && window.__alpineRally.menue.einblendung >= 1, null, { timeout: 30000 });
  // Bildschirm-Punkt einer Zeile (Trefferfläche im 320x180-Raster -> Seite)
  const punkt = (pruef) => p.evaluate((pruef) => {
    const A = window.__alpineRally, l = A.menue.seite.eintraege(), r = document.getElementById('hud').getBoundingClientRect();
    const h = A.menue.treffer.find((t) => (pruef === 'LACK' ? l[t.nr].lack : l[t.nr].autoId === pruef));
    return h ? [r.left + (h.x + 12) / 320 * r.width, r.top + (h.y + h.h / 2) / 180 * r.height] : null;
  }, pruef);
  const z = () => p.evaluate(() => { const A = window.__alpineRally; return { auto: A.autoWahl.auto, vorschau: A.seiten.garage.vorschauId(), lack: A.autoModell.lackName, wahl: A.menue.wahl }; });
  let q = await punkt('escorta');
  await p.mouse.move(q[0], q[1]); await p.waitForTimeout(200);
  let x = await z();
  melde(x.auto === 'rt4' && x.vorschau === 'escorta', `Maus: Zeigen auf ESCORTA markiert (Vorschau ${x.vorschau}), gewählt bleibt ${x.auto}`);
  await p.mouse.click(q[0], q[1]); await p.waitForTimeout(200);
  x = await z();
  melde(x.auto === 'escorta', `Maus: Klick auf ESCORTA bestätigt (${x.auto})`);
  q = await punkt('delto'); await p.mouse.move(q[0], q[1]); await p.waitForTimeout(100);
  const l = await punkt('LACK'); await p.mouse.move(l[0], l[1]); await p.waitForTimeout(100);
  x = await z();
  melde(x.auto === 'escorta' && x.vorschau === 'escorta', `Maus: über DELTO zu LACK gezogen: gewählt ${x.auto}, Vorschau ${x.vorschau}`);
  const lack0 = x.lack;
  // Lack-Pfeil rechts: Klick rechts auf der Zeile (rechte Hälfte des Werts)
  const pr = await p.evaluate(() => { const A = window.__alpineRally, l = A.menue.seite.eintraege(), r = document.getElementById('hud').getBoundingClientRect(); const h = A.menue.treffer.find((t) => l[t.nr].lack); return [r.left + (h.mitte + 8) / 320 * r.width, r.top + (h.y + h.h / 2) / 180 * r.height]; });
  await p.mouse.click(pr[0], pr[1]); await p.waitForTimeout(200);
  x = await z();
  melde(x.auto === 'escorta' && x.lack !== lack0, `Maus: Lack-Pfeil per Klick wechselt die Lackierung des Escorta (${lack0} -> ${x.lack})`);
  melde(s.fehler.length === 0, `Maus: Konsole ohne Fehler (${s.fehler.length})`);
  await s.schliessen();
}

if (teil('d')) {
  console.log('(d) Garage mit Tastatur, Gamepad und Maus');
  for (const art of ['enter', 'leertaste', 'gamepad']) await garageDurchgang(art);
  await garageMaus();
}

console.log(fehler ? `\n${fehler} FEHLER` : '\nAlles bestanden.');
process.exit(fehler ? 1 : 0);
