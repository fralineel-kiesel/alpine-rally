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

// ---------------------------------------------------------------- (e) Motorklang-Wechsel
// Erwartete Motorwerte eines Profils: Referenz (audio.motor aus config.js) mit ton.motor darüber (unabhängig gerechnet)
const mische = (ziel, profil) => {
  for (const [k, w] of Object.entries(profil || {})) {
    if (w && typeof w === 'object' && !Array.isArray(w)) { if (!ziel[k] || typeof ziel[k] !== 'object') ziel[k] = {}; mische(ziel[k], w); } else ziel[k] = Array.isArray(w) ? [...w] : w;
  }
  return ziel;
};
if (teil('e')) {
  console.log('(e) Motorklang-Wechsel (30 Wechsel im Menü), Knoten, Speicher, Knacken, Sperre, gemerktes Auto');
  const { CONFIG } = await import(new URL('../js/config.js', import.meta.url).href);
  const REF = JSON.parse(JSON.stringify(CONFIG.audio.motor));
  const erwartet = Object.fromEntries(['prototyp', ...AUTOS].map((id) => [id, mische(JSON.parse(JSON.stringify(REF)), CONFIG.fahrprofile[id].ton.motor)]));
  const s = await starteSpiel({ breite: 640, hoehe: 360, auto: '', args: ['--autoplay-policy=no-user-gesture-required'] });
  const p = s.page;
  // Audio-Knoten zählen: jede create...-Funktion des AudioContext (dauerhafte und einmalige Knoten)
  await p.addInitScript(() => {
    window.__knoten = {};
    const P = (window.AudioContext || window.webkitAudioContext).prototype, B = BaseAudioContext.prototype;
    for (const n of ['createGain', 'createBiquadFilter', 'createOscillator', 'createConstantSource', 'createWaveShaper', 'createDynamicsCompressor', 'createBufferSource', 'createAnalyser', 'createStereoPanner', 'createDelay', 'createPanner']) {
      const ziel = B[n] ? B : P;
      const orig = ziel[n];
      if (!orig) continue;
      // (gezählt: alle Knoten, und extra die, die beim Umschalten des Motorklangs entstehen – Musik und Menü-Töne legen
      // laufend eigene, kurzlebige Knoten an)
      ziel[n] = function (...a) {
        if (!(this instanceof OfflineAudioContext)) {
          window.__knoten[n] = (window.__knoten[n] || 0) + 1;
          if (/autoWechseln|waehleFahrprofil|motorNeu|motorFestSetzen|motorPuffer(Neu|Happen|Weiter)/.test(new Error().stack)) window.__knotenWechsel = (window.__knotenWechsel || 0) + 1;
        }
        return orig.apply(this, a);
      };
    }
  });
  await p.goto(`${s.url}/index.html`);
  await p.waitForFunction(() => window.__alpineRally && window.__alpineRally.menue, null, { timeout: 120000 });
  await p.keyboard.press('Enter'); // Titel: Ton entsperren
  await p.waitForFunction(() => window.__alpineRally.ton.werk && window.__alpineRally.ton.werk.aufbau.fertig, null, { timeout: 60000 });
  await p.waitForTimeout(500);
  const cdp = await p.context().newCDPSession(p);
  const heap = async () => { for (let i = 0; i < 3; i++) await cdp.send('HeapProfiler.collectGarbage'); return (await cdp.send('Runtime.getHeapUsage')).usedSize; };
  const stand = () => p.evaluate(() => {
    const A = window.__alpineRally, w = A.ton.werk;
    const dauerhaft = ['createConstantSource', 'createWaveShaper', 'createDynamicsCompressor', 'createAnalyser'].reduce((a, n) => a + (window.__knoten[n] || 0), 0);
    return { knoten: window.__knotenWechsel || 0, alle: Object.values(window.__knoten).reduce((a, b) => a + b, 0), dauerhaft, stimmen: w.stimmen, aktiv: w.zaehl.knotenAktiv, quellen: w.quellen.length };
  });
  // einmal alle Autos durch (Puffer gebaut), dann messen
  const wechsel = (liste) => p.evaluate(async ({ liste, erwartet }) => {
    const A = window.__alpineRally, w = A.ton.werk, K = w.knoten, M = A.CONFIG.audio.motor;
    const { saettigungsKurve } = await import('/js/audio.js');
    const FP = await import('/js/fahrprofil.js');
    const warte = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const probleme = [];
    const gleich = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    for (const id of liste) {
      A.autoWechseln(id);
      await warte(); await new Promise((r) => setTimeout(r, 30)); await warte();
      const pr = [];
      if (FP.aktivesTonProfil() !== id) pr.push(`Ton-Profil ${FP.aktivesTonProfil()}`);
      if (!gleich(M, erwartet[id])) {
        const anders = Object.keys(erwartet[id]).filter((k) => !gleich(M[k], erwartet[id][k]));
        pr.push(`Werte anders: ${anders.join(', ')}`);
      }
      const kurve = saettigungsKurve(M);
      if (K.saettigung.curve.length !== kurve.length || [100, 400, 600, 900].some((i) => Math.abs(K.saettigung.curve[i] - kurve[i]) > 1e-6)) pr.push('Sättigung');
      if (Math.abs(K.biss.gain.value - M.bissDb) > 1e-4 || Math.abs(K.biss.frequency.value - M.bissHz) > 1e-2) pr.push('Biss');
      if (Math.abs(K.motorLp.Q.value - M.filterQ) > 1e-4 || Math.abs(K.rauhBp.Q.value - M.rauhGuete) > 1e-4) pr.push('Güten');
      if (K.rauhF && Math.abs(K.rauhF.gain.value - M.rauhOberwelle) > 1e-4) pr.push('rauhOberwelle');
      if (Math.abs(K.saegeGain.gain.value - M.saege) > 1e-4 || Math.abs(K.pulsGain.gain.value - M.puls) > 1e-4 || Math.abs(K.oberGain.gain.value - M.oberwelle) > 1e-4) pr.push('Anteile');
      const von = w.motorPufferVon;
      for (const n of ['pop', 'klack', 'blowOff']) if (von[n] !== w.motorSchluessel(n)) pr.push(`Puffer ${n}`);
      if (pr.length) probleme.push(`${id}: ${pr.join(', ')}`);
    }
    return { probleme, wechsel: w.motorWechsel.anzahl, laengstesMs: w.motorWechsel.laengstesMs, gerechnet: w.motorWechsel.gerechnet, ausLager: w.motorWechsel.ausLager, pop: w.puffer.pop };
  }, { liste, erwartet });
  await wechsel(['delto', 'escorta', 'rt4']);
  const v0 = await stand(), h0 = await heap();
  const liste = Array.from({ length: 30 }, (_, i) => AUTOS[(i + 1) % 3]); // delto, escorta, rt4, delto, ...
  const r = await wechsel(liste);
  await p.waitForTimeout(400);
  const v1 = await stand(), h1 = await heap();
  melde(r.probleme.length === 0, `30 Wechsel: Ton-Profil, Motorwerte (${Object.keys(REF).length} Werte, gegen Referenz + ton.motor), Sättigung, Biss, Güten, Anteile und Motor-Puffer stimmen nach jedem Wechsel${r.probleme.length ? `: ${r.probleme.slice(0, 4).join(' | ')}` : ''}`);
  melde(v1.knoten === 0 && v1.dauerhaft === v0.dauerhaft && v1.stimmen === 0 && v1.aktiv === 0 && v1.quellen === v0.quellen,
    `Audio-Knoten: beim Umschalten angelegt ${v0.knoten} -> ${v1.knoten} (keine), dauerhafte Knoten (Grundton, Sättigung, Limiter) ${v0.dauerhaft} -> ${v1.dauerhaft}, Stimmen ${v1.stimmen}, aktive Einmal-Knoten ${v1.aktiv}, Dauer-Quellen ${v0.quellen} -> ${v1.quellen} (insgesamt angelegt ${v0.alle} -> ${v1.alle}: Menü-Musik, Note für Note)`);
  melde((h1 - h0) / 1e6 < 1.0, `Speicher (JS-Heap nach Aufräumen): ${(h0 / 1e6).toFixed(2)} -> ${(h1 / 1e6).toFixed(2)} MB (Unterschied ${((h1 - h0) / 1e6).toFixed(2)} MB, höchstens 1.0)`);
  melde(r.laengstesMs < 8.5, `Motor-Puffer: ${r.gerechnet} neu gerechnet (nur beim ersten Mal je Auto), ${r.ausLager} aus dem Lager; längstes Häppchen ${r.laengstesMs.toFixed(1)} ms (audio.pufferSchritt 8 ms)`);
  // Sperre: kein Wechsel im Countdown, Rennen, in der Pause
  const sperre = await p.evaluate(async () => {
    const A = window.__alpineRally, w = A.ton.werk, FP = await import('/js/fahrprofil.js');
    const n0 = w.motorWechsel.anzahl, t0 = FP.aktivesTonProfil();
    const erg = {};
    A.start(); erg.countdown = A.autoWechseln('delto');
    A.anhalten = true; A.rennSchritt(4, {}); erg.rennen = [A.ablauf.zustand, A.autoWechseln('escorta')];
    A.pausieren(); erg.pause = [A.ablauf.zustand, A.autoWechseln('delto')];
    erg.ton = [t0, FP.aktivesTonProfil()]; erg.wechsel = w.motorWechsel.anzahl - n0;
    A.anhalten = false; A.zumHauptmenue();
    return erg;
  });
  melde(sperre.countdown === false && sperre.rennen[1] === false && sperre.pause[1] === false && sperre.ton[0] === sperre.ton[1] && sperre.wechsel === 0,
    `kein Wechsel im Countdown (${sperre.countdown}), Rennen (${sperre.rennen.join(' ')}), Pause (${sperre.pause.join(' ')}): Motorklang bleibt ${sperre.ton[1]}, ${sperre.wechsel} Umschaltungen`);
  melde(s.fehler.length === 0, `Konsole ohne Fehler (${s.fehler.length})`);
  await s.schliessen();

  // Knacken: offline (gleicher Code), Menü (Motor aus) mit Musik, Wechsel bei 1.0 s – Sprung von Sample zu Sample
  const k = await starteSpiel({ breite: 640, hoehe: 360 });
  await k.page.goto(`${k.url}/index.html?menue=aus`);
  await k.page.waitForFunction(() => window.__alpineRally, null, { timeout: 120000 });
  const kn = await k.page.evaluate(async () => {
    const P = await import('/tools/ton-pruefung.js');
    const FP = await import('/js/fahrprofil.js');
    const out = {};
    for (const [von, nach] of [['rt4', 'delto'], ['delto', 'escorta'], ['escorta', 'rt4']]) {
      FP.waehleFahrprofil(von);
      const x = await P.rendereVerlauf((w, t) => {
        if (Math.abs(t - 1.0) < 1e-6) { FP.waehleFahrprofil(nach); w.motorNeu(true); }
        w.aktualisiere(1 / 60, P.zustand({ modus: 'aus', musikModus: 'menue' }));
      }, 2, { limiter: false });
      const d = x.daten, R = P.RATE;
      const sprung = (a, b) => { let m = 0; for (let i = Math.round(a * R) + 1; i < Math.round(b * R); i++) m = Math.max(m, Math.abs(d[i] - d[i - 1])); return m; };
      out[`${von}->${nach}`] = { davor: sprung(0.3, 0.95), wechsel: sprung(0.98, 1.12), spitze: P.miss(d, 0.98, 1.12).spitze };
    }
    FP.waehleFahrprofil('prototyp');
    return out;
  });
  const knOk = Object.values(kn).every((x) => x.wechsel <= Math.max(0.02, x.davor * 1.5));
  melde(knOk, `kein Knacken beim Wechsel (Menü mit Musik, offline): grösster Sprung von Sample zu Sample beim Wechsel / davor: ${Object.entries(kn).map(([n, x]) => `${n} ${x.wechsel.toFixed(4)} / ${x.davor.toFixed(4)}`).join(', ')} (Grenze: 1.5 x davor, mindestens 0.02)`);
  await k.schliessen();

  // Gemerktes Auto: klingt schon beim ersten Entsperren richtig (ohne Umschalten)
  for (const id of ['escorta', 'delto']) {
    const g = await starteSpiel({ breite: 640, hoehe: 360, auto: '', args: ['--autoplay-policy=no-user-gesture-required'] });
    const name = await g.page.evaluate(() => 0).then(() => null);
    void name;
    await g.page.goto(`${g.url}/index.html`);
    await g.page.waitForFunction(() => window.__alpineRally && window.__alpineRally.menue, null, { timeout: 120000 });
    await g.page.evaluate((id) => { window.__alpineRally.autoWechseln(id); }, id); // (merkt das Auto im Browser)
    await g.page.reload();
    await g.page.waitForFunction(() => window.__alpineRally && window.__alpineRally.menue, null, { timeout: 120000 });
    await g.page.keyboard.press('Enter');
    await g.page.waitForFunction(() => window.__alpineRally.ton.werk && window.__alpineRally.ton.werk.aufbau.fertig, null, { timeout: 60000 });
    const x = await g.page.evaluate(async (erw) => {
      const A = window.__alpineRally, w = A.ton.werk, M = A.CONFIG.audio.motor, FP = await import('/js/fahrprofil.js');
      const { saettigungsKurve } = await import('/js/audio.js');
      const kurve = saettigungsKurve(M);
      return { auto: A.autoWahl.auto, ton: FP.aktivesTonProfil(), werte: JSON.stringify(M) === JSON.stringify(erw), wechsel: w.motorWechsel.anzahl,
        kurve: [300, 700].every((i) => Math.abs(w.knoten.saettigung.curve[i] - kurve[i]) < 1e-6), biss: w.knoten.biss.gain.value, bissSoll: M.bissDb,
        puffer: ['pop', 'klack', 'blowOff'].every((n) => w.motorPufferVon[n] === w.motorSchluessel(n)) };
    }, erwartet[id]);
    melde(x.auto === id && x.ton === id && x.werte && x.kurve && Math.abs(x.biss - x.bissSoll) < 1e-4 && x.puffer && x.wechsel === 0,
      `gemerktes Auto ${id}: beim ersten Entsperren gleich mit seinem Klang gebaut (Profil ${x.ton}, Werte ${x.werte ? 'ok' : 'FALSCH'}, Sättigung ${x.kurve ? 'ok' : 'FALSCH'}, Biss ${x.biss} dB, Puffer ${x.puffer ? 'ok' : 'FALSCH'}, ${x.wechsel} Umschaltungen nötig)`);
    melde(g.fehler.length === 0, `  Konsole ohne Fehler (${g.fehler.length})`);
    await g.schliessen();
  }
}

// ---------------------------------------------------------------- (f) Ton-Messung: Delto und Escorta gegen den Audan
// Rechnet tools/ton-messung.mjs m8d-<id> --profil <id> für die drei Autos (ausser mit --ton-alt: vorhandene JSON-Dateien),
// vergleicht nach der Tabelle in STAND.md (Meilenstein 8d) und schreibt die Messtabelle (screenshots/m8d/60-messtabelle.md/png)
const ZIELE_TON = [
  // [Schlüssel, Text, Delto [von, bis], Escorta [von, bis], Art]  Art: 'pz' = Prozent gegen den Audan, 'db' = dB, 'x' = Faktor
  ['leerlauf', 'Grundton Leerlauf (Hz)', [-23, -17], [-23, -17], 'pz'],
  ['f7000', 'Grundton bei 7000 U/min (Hz)', [5, 15], [-12, -5], 'pz'],
  ['schwerpunkt', 'Spektralschwerpunkt Vollgas 5000 U/min (Hz)', [10, 25], [-25, -10], 'pz'],
  ['ueber2k5', 'Energie über 2.5 kHz Vollgas (Mittel 3000/5000/7000)', [15, 40], [-45, -20], 'pz'],
  ['rauschen', 'Rauschanteil 2-6 kHz (Energie ausserhalb der Obertöne)', [-10, 10], [40, 100], 'pz'],
  ['turboTon', 'Turbo-Pfeifen: Tonhöhe (Hz)', [10, 20], null, 'pz'],
  ['rms', 'Lautstärke Motor Vollgas 5000 (RMS, dB)', [-1.5, 1.5], [-1.5, 1.5], 'db'],
  ['spitze', 'Spitze vor dem Limiter (dB gegen Audan, höchstens 0)', [-99, 0.05], [-99, 0.05], 'db'],
  ['salven', 'Grosse Pops je Minute (Salven mit Pops, feste Fahrt)', [-20, 20], [-65, -35], 'pz'],
  ['knistern', 'Knistern je Minute (Faktor)', null, [1.5, 3], 'x'],
];
function tonKennzahlen(j) {
  const m = (rpm) => j.motor.find((x) => x.rpm === rpm);
  return {
    leerlauf: j.profil.leerlauf.f0, f7000: m(7000).f0, schwerpunkt: m(5000).schwerpunkt,
    ueber2k5: (m(3000).ueber2k5 + m(5000).ueber2k5 + m(7000).ueber2k5) / 3, rauschen: j.profil.rauschen.ausserhalbObertoene,
    turboTon: j.profil.turbo.ton, turboRms: j.profil.turbo.rms, turboBand: [j.profil.turbo.bandMitDb, j.profil.turbo.bandOhneDb],
    rms: m(5000).rms, spitze: j.profil.spitze, salven: j.profil.pops.salvenMitPops, pops: j.profil.pops.pops, knistern: j.profil.pops.knistern,
    blowOff: j.profil.pops.blowOff, turboVerhaeltnisDb: j.profil.turbo.verhaeltnisDb, flachheit: j.profil.rauschen.flachheit,
    fahrtRms: j.profil.fahrt.rmsVollgas,
  };
}
if (teil('f')) {
  console.log('(f) Ton-Messung: Delto und Escorta gegen den Audan (offline gerechnet, nicht gehört)');
  const K = {};
  for (const id of AUTOS) {
    const datei = path.join(WURZEL, `tools/ton-messung-m8d-${id}.json`);
    if (!process.argv.includes('--ton-alt') || !fs.existsSync(datei)) {
      const r = werkzeug('ton-messung.mjs', [`m8d-${id}`, '--profil', id]);
      if (r.code !== 0) { melde(false, `ton-messung --profil ${id}: ${r.text.split('\n').slice(-5).join(' ')}`); continue; }
    }
    K[id] = tonKennzahlen(JSON.parse(fs.readFileSync(datei, 'utf8')));
  }
  const A = K.rt4;
  const wert = (id, k, art) => (art === 'pz' ? (K[id][k] / A[k] - 1) * 100 : art === 'db' ? 20 * Math.log10(K[id][k] / A[k]) : K[id][k] / A[k]);
  const zeile = [];
  const fmt = (x, art) => (art === 'pz' ? `${x >= 0 ? '+' : ''}${x.toFixed(1)} %` : art === 'db' ? `${x >= 0 ? '+' : ''}${x.toFixed(2)} dB` : `x${x.toFixed(2)}`);
  const roh = (id, k) => { const x = K[id][k]; return k === 'rms' || k === 'spitze' ? x.toFixed(3) : k === 'ueber2k5' || k === 'rauschen' ? `${(x * 100).toFixed(2)} %` : x.toFixed(x < 10 ? 2 : 0); };
  for (const [k, text, zd, ze, art] of ZIELE_TON) {
    const teile = [text, roh('rt4', k)];
    for (const [id, ziel] of [['delto', zd], ['escorta', ze]]) {
      const x = wert(id, k, art);
      if (!ziel) {
        if (k === 'turboTon') { // Escorta: kein Pfeifen – Pegel des Bandes mit und ohne Pfeif-Oszillator gleich (Rauschboden)
          const [mit, ohne] = K.escorta.turboBand;
          const ok = K.escorta.turboRms === 0 && Math.abs(mit - ohne) < 0.01;
          melde(ok, `escorta ${text}: kein Pfeifen (Turbo-RMS ${K.escorta.turboRms}, Band mit/ohne Pfeifen ${mit.toFixed(2)} / ${ohne.toFixed(2)} dB = Rauschboden)`);
          teile.push(`kein Pfeifen ${ok ? '✅' : '❌'}`, 'kein Pfeifen');
        } else { teile.push(`${roh(id, k)} (${fmt(x, art)})`, '–'); }
        continue;
      }
      const ok = x >= ziel[0] && x <= ziel[1];
      const zt = art === 'x' ? `x${ziel[0]} bis x${ziel[1]}` : k === 'spitze' ? 'nicht höher' : `${ziel[0]} bis ${ziel[1]}${art === 'db' ? ' dB' : ' %'}`;
      melde(ok, `${id} ${text}: ${roh(id, k)} gegen Audan ${roh('rt4', k)} = ${fmt(x, art)} (Ziel ${zt})`);
      teile.push(`${roh(id, k)} (${fmt(x, art)}) ${ok ? '✅' : '❌'}`, zt);
    }
    zeile.push(teile);
  }
  // Zusätze: Escorta ohne Blow-off, Motor bei Vollgas lauter als das Turbo-Pfeifen, Pops-Zählung
  melde(K.escorta.blowOff === 0 && K.delto.blowOff > 0, `Blow-off auf der 60-s-Fahrt: Audan ${A.blowOff}, Delto ${K.delto.blowOff}, Escorta ${K.escorta.blowOff} (kein Blow-off)`);
  melde(K.delto.turboVerhaeltnisDb < -12 && A.turboVerhaeltnisDb < -12, `Pfeifen bleibt unter dem Motor (Turbo gegen Motor bei 5000/min: Audan ${A.turboVerhaeltnisDb.toFixed(1)} dB, Delto ${K.delto.turboVerhaeltnisDb.toFixed(1)} dB)`);
  console.log(`       Pops je Minute (feste Fahrt): Audan ${A.salven} Salven / ${A.pops} Pops / ${A.knistern} Knistern, Delto ${K.delto.salven} / ${K.delto.pops} / ${K.delto.knistern}, Escorta ${K.escorta.salven} / ${K.escorta.pops} / ${K.escorta.knistern}`);
  // Messtabelle als Text und Bild
  const kopf = ['Messung', 'Audan Quarto', 'Lanza Delto', 'Ziel Delto', 'Fard Escorta', 'Ziel Escorta'];
  const md = [`| ${kopf.join(' | ')} |`, `|${kopf.map(() => '---').join('|')}|`, ...zeile.map((z) => `| ${z.join(' | ')} |`)].join('\n');
  fs.mkdirSync(path.join(WURZEL, 'screenshots/m8d'), { recursive: true });
  fs.writeFileSync(path.join(WURZEL, 'screenshots/m8d/60-messtabelle.md'), `# Motorklang M8d: Messtabelle (offline gerechnet, nicht gehört)\n\n${md}\n`);
  const b = await starteSpiel({ breite: 1500, hoehe: 520 });
  await b.page.setContent(`<html><body style="background:#0d1218;color:#f4f4ee;font:15px monospace;padding:16px"><h3 style="color:#ffd23c;margin:0 0 10px">Motorklang M8d – Messtabelle (offline gerechnet, nicht gehört)</h3><table style="border-collapse:collapse">${[kopf, ...zeile].map((z, i) => `<tr>${z.map((c) => `<${i ? 'td' : 'th'} style="border:1px solid #44505c;padding:4px 8px;text-align:left${i ? '' : ';color:#8fb4d8'}">${c}</${i ? 'td' : 'th'}>`).join('')}</tr>`).join('')}</table></body></html>`);
  await b.page.screenshot({ path: path.join(WURZEL, 'screenshots/m8d/60-messtabelle.png'), fullPage: true });
  await b.schliessen();
  console.log(md);
}

// ---------------------------------------------------------------- (g) Ton-Labor
if (teil('g')) {
  console.log('(g) Ton-Labor: Feinschliff je Profil, WERTE KOPIEREN, ALLES ZURÜCK, VERGLEICH');
  const s = await starteSpiel({ breite: 1400, hoehe: 900, args: ['--autoplay-policy=no-user-gesture-required'] });
  const p = s.page;
  await p.goto(`${s.url}/ton-labor.html`);
  await p.waitForFunction(() => window.__tonLabor && window.__tonLabor.fein && window.__tonLabor.vergleich, null, { timeout: 60000 });
  await p.click('#tonStarten');
  await p.waitForFunction(() => window.__tonLabor.ton.werk && window.__tonLabor.ton.werk.aufbau.fertig, null, { timeout: 30000 });
  const r = await p.evaluate(async () => {
    const L = window.__tonLabor, F = L.fein.FEIN, C = L.CONFIG, M = C.audio.motor, $ = (id) => document.getElementById(id);
    const warte = (ms) => new Promise((x) => setTimeout(x, ms));
    const profil = async (id) => { $('tonProfil').value = id; $('tonProfil').dispatchEvent(new Event('change')); await warte(150); };
    const regler = (pfad, v) => { const f = F.find((x) => x.pfad === pfad); f.regler.value = v; f.regler.dispatchEvent(new Event('input')); return f; };
    const zeigt = (pfad) => +F.find((x) => x.pfad === pfad).regler.value;
    const erg = { neu: ['zuendFaktor', 'hoechstTon', 'tonKurve', 'saege', 'puls', 'pulsBreite', 'unter', 'oberwelle', 'hoch', 'amTiefe', 'rauh', 'rauhOberwelle', 'verzerrung', 'clip', 'filterGrund', 'filterDrehzahl', 'filterGas', 'bissHz', 'bissDb', 'turboTonMin', 'turboTonMax', 'turboPegel'].filter((n) => !F.some((f) => f.pfad === `audio.motor.${n}`)) };
    await profil('delto');
    erg.deltoZeigt = { rauh: zeigt('audio.motor.rauh'), M: M.rauh, zuend: zeigt('audio.motor.zuendFaktor'), Mz: M.zuendFaktor };
    regler('audio.motor.rauh', 0.45); regler('audio.motor.verzerrung', 7.2); await warte(100);
    erg.deltoWirkt = { rauh: M.rauh, kurve: L.ton.werk.knoten.saettigung.curve[600], verzerrung: M.verzerrung };
    await profil('escorta');
    erg.escortaZeigt = { rauh: zeigt('audio.motor.rauh'), M: M.rauh };
    regler('audio.motor.filterGas', 3000); await warte(50);
    await profil('rt4');
    erg.audanZeigt = { rauh: zeigt('audio.motor.rauh'), M: M.rauh, ref: L.CONFIG.fahrprofile.prototyp && M.rauh };
    $('kopieren').click(); await warte(100);
    erg.text = $('kopieText').value;
    await profil('delto');
    erg.deltoNochmal = M.rauh;
    $('allesZurueck').click(); await warte(150);
    erg.nachZurueck = { delto: M.rauh, deltoVerz: M.verzerrung };
    $('kopieren').click(); await warte(100);
    erg.textNach = $('kopieText').value;
    await profil('escorta');
    erg.escortaBleibt = M.filterGas;
    $('allesZurueck').click(); await warte(100);
    // VERGLEICH (alle drei) und Einzelknöpfe
    L.vergleich.starten(L.vergleich.AUTOS);
    const namen = new Set();
    const t0 = performance.now();
    while (L.vergleich.laeuft && performance.now() - t0 < 60000) { namen.add($('vergleichName').textContent); await warte(200); }
    erg.vergleich = { gehoert: L.vergleich.zuletzt ? L.vergleich.zuletzt.gehoert : [], namen: [...namen], dauer: (performance.now() - t0) / 1000, pops: L.ton.werk.zaehler.knall || 0 };
    erg.einzeln = [];
    for (const k of document.querySelectorAll('[data-vergleich]')) {
      k.click();
      const t1 = performance.now();
      while (L.vergleich.laeuft && performance.now() - t1 < 20000) await warte(200);
      erg.einzeln.push([k.dataset.vergleich, k.textContent, L.vergleich.zuletzt.gehoert.join()]);
    }
    erg.knoepfe = { vergleich: !!$('vergleich'), stopp: !!$('vergleichStopp') };
    return erg;
  });
  melde(r.neu.length === 0, `Feinschliff hat die neuen Werte (zuendFaktor … turboPegel)${r.neu.length ? `, es fehlen: ${r.neu.join(', ')}` : ''}`);
  melde(r.deltoZeigt.rauh === r.deltoZeigt.M && r.deltoZeigt.zuend === r.deltoZeigt.Mz && r.deltoWirkt.rauh === 0.45 && r.deltoWirkt.verzerrung === 7.2 && r.escortaZeigt.rauh === r.escortaZeigt.M && r.escortaZeigt.M !== 0.45,
    `Feinschliff je Profil: Regler zeigen den Wert des Autos (Delto rauh ${r.deltoZeigt.rauh}, Escorta ${r.escortaZeigt.rauh}, Audan ${r.audanZeigt.rauh}), Änderung wirkt nur dort (Delto 0.45, Escorta ${r.escortaZeigt.M})`);
  const zeilen = r.text.split('\n');
  melde(zeilen.length === 3 && zeilen.every((z) => /^fahrprofile\.(delto|escorta)\.ton\.motor\.[\w.]+ = -?[\d.]+$/.test(z)) && zeilen.includes('fahrprofile.delto.ton.motor.rauh = 0.45') && zeilen.includes('fahrprofile.escorta.ton.motor.filterGas = 3000'),
    `WERTE KOPIEREN nennt das Profil in jeder Zeile: ${zeilen.join(' | ')}`);
  melde(r.nachZurueck.delto !== 0.45 && r.textNach === 'fahrprofile.escorta.ton.motor.filterGas = 3000' && r.escortaBleibt === 3000,
    `ALLES ZURÜCK nur für das gewählte Profil (Delto zurück auf rauh ${r.nachZurueck.delto}; Escorta bleibt filterGas ${r.escortaBleibt}: "${r.textNach}")`);
  melde(r.vergleich.gehoert.join() === 'rt4,delto,escorta' && ['AUDAN QUARTO', 'LANZA DELTO', 'FARD ESCORTA'].every((n) => r.vergleich.namen.includes(n)) && r.vergleich.pops > 0,
    `VERGLEICH spielt Audan, Delto, Escorta nacheinander (${r.vergleich.gehoert.join(', ')}; angezeigt: ${r.vergleich.namen.join(' / ')}; ${r.vergleich.dauer.toFixed(1)} s, ${r.vergleich.pops} Pops)`);
  melde(r.einzeln.length === 3 && r.einzeln.every(([id, , g]) => g === id), `Einzelknöpfe: ${r.einzeln.map(([, t, g]) => `${t} -> ${g}`).join(', ')}`);
  melde(s.fehler.length === 0, `Ton-Labor ohne Konsolenfehler (${s.fehler.length})`);
  await s.page.screenshot({ path: path.join(WURZEL, 'screenshots/m8d/50-ton-labor.png'), fullPage: false });
  await s.schliessen();
}

console.log(fehler ? `\n${fehler} FEHLER` : '\nAlles bestanden.');
process.exit(fehler ? 1 : 0);
