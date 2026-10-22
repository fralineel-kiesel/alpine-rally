// Meilenstein 8g prüfen:  node tools/m8g-test.mjs [--nur a,b,c,d,e,f,g,h,i] [--alt <ordner 0.8f>] [--lang]
//   (a) Tacho KLASSISCH pixelgleich zu 0.8f: fünf Autos (und Prototyp), km/h und mph, direkt gemalt in mehreren
//       Zuständen und im Spiel (HUD-Ausschnitt) in drei Auflösungen
//   (b) Skalen nach Messung: Regel (Begrenzer + 8 %, rot 500 darunter), Nadelstand bei Höchsttempo und Begrenzer,
//       Skalenzahlen ohne Überlappung (Pixelprüfung: jede Zahl vollständig, keine zwei Zahlen berühren sich), Kontraste
//   (c) Schaltlicht je Auto: Schwellen nach Regel, aus darunter, an, Blinken (Hz), aus in N, R und in der Schaltpause, 5. Gang
//   (d) Ladedruck-/Lader-Anzeige folgt dem Wert (Turbo: Ladedruck, Lanza 073: Drehzahl mal Gas), weich; Escorta ohne;
//       Speicher pro Bild; Datenweg im Spiel; Platz im HUD (Tacho-Gruppe höchstens 8 Pixel höher, nicht breiter, berührt nichts)
//   (e) Gang-Anzeige: 1 bis 5, N, R in allen Stilen sichtbar, verschieden, nichts ausserhalb des Kastens; R rot
//   (f) Garage: Tacho-Vorschau in drei Auflösungen, de und en (nichts überlappt, nichts abgeschnitten), 20 Wechsel ohne
//       Leck, Vorschau folgt dem Aufheulen, Schaltlicht blitzt mit, KLASSISCH zeigt den klassischen Tacho
//   (g) Einstellung TACHO: wird gemerkt, wirkt sofort (Rennen und Pause), Menütexte de/en passen
//   (h) Unveränderlich gegen 0.8f: Fahrmessung und Motorwerte aller Profile, Ton je Auto (Messung, im Rechenrauschen),
//       Testfahrer (Prototyp und fünf Autos, drei Stile), Abkürzungen 127/2/342/84, Strecke, Aussehen der Autos
//       (Textur, Geometrie, Räder), Garage-Werte
//   (i) Regression (alle bisherigen Tests, nur mit --lang), Bildzeit (gegen den Audan und gegen 0.8f), Ladezeit (mit --alt)
// --alt <ordner 0.8f>: der alte Stand zum Vergleich (git worktree add <ordner> <commit von 0.8f>); ohne --alt gelten
//   die Prüfsummen aus tools/m8g-referenz-08f.json (mit --referenz-schreiben neu schreiben)
// Ich sehe die Bilder, aber ich fahre nicht: ob ein Tacho im Fahren gut lesbar ist, beurteile ich nur an Bildern und Zahlen.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { starteSpiel, WURZEL } from './spiel-browser.mjs';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

const arg = (name) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : null; };
const NUR = arg('--nur') ? arg('--nur').split(',') : null;
const ALT = arg('--alt') ? path.resolve(arg('--alt')) : null;
const teil = (k) => !NUR || NUR.includes(k);
let fehler = 0, kompromisse = 0;
const melde = (ok, text) => { console.log(`${ok ? '  ok  ' : 'FEHLER'} ${text}`); if (!ok) fehler++; };
const info = (text) => console.log(`       ${text}`);
const hash = (s) => crypto.createHash('sha1').update(s).digest('hex').slice(0, 12);
const ALLE = ['rt4', 'delto', 'escorta', 'l073', 'imprexa'];
const ORDNER = path.join(WURZEL, 'screenshots/m8g');
fs.mkdirSync(ORDNER, { recursive: true });

// Ausschnitt der Tacho-Gruppe im 320x180-HUD (mit Rand für "höchstens 8 Pixel höher")
const AUSSCHNITT = [205, 110, 115, 70];
// Zustände für das direkte Malen: [km/h, U/min, Gang]
const ZUSTAENDE = [[0, 1000, 'N'], [95, 5200, '3'], [189, 6820, '5'], [20, 2200, 'R'], [230, 9400, '4']];

// Tacho direkt aus js/tacho.js malen (wie hud.js), je Profil, Einheit und Zustand; Ergebnis: Prüfsumme je Fall
async function tachoDirekt(wurzel, modus) {
  const s = await starteSpiel({ wurzel, breite: 640, hoehe: 360 });
  await s.page.goto(`${s.url}/index.html?menue=aus&auto=rt4`);
  await s.page.waitForFunction(() => window.__alpineRally, null, { timeout: 120000 });
  const r = await s.page.evaluate(async ([ids, zustaende, aus, modus]) => {
    const T = await import('/js/tacho.js'), P = await import('/js/pixel.js');
    const c = document.createElement('canvas'); c.width = 320; c.height = 180;
    const ctx = c.getContext('2d');
    const FARBEN = { weiss: '#f4f4ee', gelb: '#ffd23c', rot: '#ff4a3a' };
    const text = (tx, x, y, g = 1, f = 'weiss', a = 'links', sch) => P.pixelText(ctx, tx, x, y, g, FARBEN[f] || f, a, sch);
    const tachos = T.baueTachos(ctx, text);
    if (tachos.setzeModus) tachos.setzeModus(modus);
    const out = {};
    for (const id of ids) {
      for (const e of ['kmh', 'mph']) {
        tachos.setzeEinheit(e);
        tachos.setzeSkala(id);
        zustaende.forEach(([kmh, rpm, gang], i) => {
          for (let n = 0; n < 80; n++) { ctx.clearRect(0, 0, 320, 180); tachos.zeichne(1, kmh, rpm, gang); }
          out[`${id}-${e}-${i}`] = Array.from(ctx.getImageData(...aus).data).join(',');
        });
      }
    }
    return out;
  }, [['prototyp', ...ALLE], ZUSTAENDE, AUSSCHNITT, modus]);
  await s.schliessen();
  return Object.fromEntries(Object.entries(r).map(([k, v]) => [k, hash(v)]));
}
// Tacho im Spiel (HUD-Ausschnitt) je Auto, Einheit und Auflösung (Leerlauf im Stand)
async function tachoImSpiel(wurzel, modus) {
  const s = await starteSpiel({ wurzel, breite: 640, hoehe: 360 });
  const out = {};
  for (const id of ALLE) {
    await s.page.goto(`${s.url}/index.html?menue=aus&auto=${id}`);
    await s.page.waitForFunction(() => window.__alpineRally, null, { timeout: 120000 });
    Object.assign(out, await s.page.evaluate(async ([id, aus, modus]) => {
      const E = await import('/js/einstellungen.js');
      const warte = (ms) => new Promise((r) => setTimeout(r, ms));
      E.setze('tacho', modus);
      const o = {};
      for (const a of [0, 1, 2]) {
        for (const e of ['kmh', 'mph']) {
          E.setze('aufloesung', a); E.setze('einheit', e);
          await warte(700);
          o[`${id}-${e}-${a}`] = Array.from(document.getElementById('hud').getContext('2d').getImageData(...aus).data).join(',');
        }
      }
      E.setze('einheit', 'kmh'); E.setze('aufloesung', 0);
      return o;
    }, [id, AUSSCHNITT, modus]));
  }
  await s.schliessen();
  return Object.fromEntries(Object.entries(out).map(([k, v]) => [k, hash(v)]));
}

// Referenz 0.8f: aus --alt gerechnet (und mit --referenz-schreiben gespeichert) oder aus tools/m8g-referenz-08f.json
let REF = null;
async function referenz() {
  if (REF) return REF;
  const datei = path.join(WURZEL, 'tools/m8g-referenz-08f.json');
  if (ALT) {
    REF = { tachoDirekt: await tachoDirekt(ALT, 'klassisch'), tachoSpiel: await tachoImSpiel(ALT, 'klassisch') };
    if (process.argv.includes('--referenz-schreiben')) fs.writeFileSync(datei, `${JSON.stringify(REF, null, 1)}\n`);
  } else REF = JSON.parse(fs.readFileSync(datei, 'utf8'));
  return REF;
}

// ---------------------------------------------------------------- (a) klassisch pixelgleich zu 0.8f
if (teil('a')) {
  console.log('(a) Tacho KLASSISCH pixelgleich zu 0.8f');
  const R = await referenz();
  const d = await tachoDirekt(WURZEL, 'klassisch');
  const andersD = Object.keys(R.tachoDirekt).filter((k) => R.tachoDirekt[k] !== d[k]);
  melde(andersD.length === 0, `direkt gemalt: ${Object.keys(R.tachoDirekt).length} Fälle (Prototyp + 5 Autos, km/h und mph, ${ZUSTAENDE.length} Zustände) gleich wie 0.8f${andersD.length ? `; anders: ${andersD.slice(0, 8).join(', ')}` : ''}`);
  const sp = await tachoImSpiel(WURZEL, 'klassisch');
  const andersS = Object.keys(R.tachoSpiel).filter((k) => R.tachoSpiel[k] !== sp[k]);
  melde(andersS.length === 0, `im Spiel: ${Object.keys(R.tachoSpiel).length} Ausschnitte (5 Autos, km/h und mph, 320x180 / 480x270 / 640x360) gleich wie 0.8f${andersS.length ? `; anders: ${andersS.slice(0, 8).join(', ')}` : ''}`);
}

// ---------------------------------------------------------------- (b) Skalen und Ziffern
const lade = (wurzel, d) => import(pathToFileURL(path.join(wurzel, d)).href);
// Kontrast nach WCAG (1 bis 21) zwischen zwei Farben; halbtransparente Farben über grund gemischt
function rgb(f, grund = [111, 143, 106]) {
  let m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(f);
  if (m) return [1, 2, 3].map((i) => parseInt(m[i], 16));
  m = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/.exec(f);
  const a = m[4] === undefined ? 1 : +m[4];
  return [1, 2, 3].map((i, k) => +m[i] * a + grund[k] * (1 - a));
}
const lum = (c) => { const l = c.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * l[0] + 0.7152 * l[1] + 0.0722 * l[2]; };
const kontrast = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
const NAMEN = { prototyp: 'Prototyp', rt4: 'Audan Quarto', delto: 'Lanza Delto', escorta: 'Fard Escorta', l073: 'Lanza 073', imprexa: 'Subora Imprexa' };

if (teil('b')) {
  console.log('(b) Skalen nach Messung, Skalenzahlen ohne Überlappung, Kontraste');
  const { CONFIG } = await lade(WURZEL, 'js/config.js');
  const { Fahrphysik } = await lade(WURZEL, 'js/physics.js');
  const { Getriebe } = await lade(WURZEL, 'js/getriebe.js');
  const FP = await lade(WURZEL, 'js/fahrprofil.js');
  const { baueMessung } = await lade(WURZEL, 'tools/fahrmessung.js');
  const mess = baueMessung({ CONFIG, Fahrphysik, Getriebe });
  const zeilen = ['| Auto | Begrenzer | Schalten (Vollgas) | drehzahlMax | Rot ab | Höchsttempo | Drehzahl dort | Tempo-Nadel km/h (200) | mph (Skala) | Drehzahl-Nadel bei Höchsttempo | ... beim Begrenzer |', '|---|---|---|---|---|---|---|---|---|---|---|'];
  for (const id of ALLE) {
    FP.waehleFahrprofil(id);
    const g = CONFIG.getriebe, begr = CONFIG.audio.motor.begrenzerAb, T = CONFIG.fahrprofile[id].tacho;
    const vmax = mess.hoechstTempo('asphalt'), rpm = vmax / g.gaenge[g.gaenge.length - 1] * g.nennDrehzahl;
    const maxRegel = Math.ceil(begr * 1.08 / 1000), rotRegel = Math.round((begr - 500) / 500) * 0.5;
    const pT = vmax / T.tempoMax * 100, pM = vmax / 1.609344 / T.tempoMaxMph * 100, pD = rpm / (T.drehzahlMax * 1000) * 100, pB = begr / (T.drehzahlMax * 1000) * 100;
    zeilen.push(`| ${NAMEN[id]} | ${begr} | ${g.hochVollgas} | ${T.drehzahlMax * 1000} | ${T.drehzahlRotAb * 1000} | ${vmax.toFixed(1)} km/h (${(vmax / 1.609344).toFixed(1)} mph) | ${rpm.toFixed(0)} | ${pT.toFixed(1)} % | ${pM.toFixed(1)} % (${T.tempoMaxMph}) | ${pD.toFixed(1)} % | ${pB.toFixed(1)} % |`);
    const ausnahme = id === 'imprexa'; // Auftrag: der Subora bleibt bei 9 / 8 (Regel gäbe rot ab 7500)
    melde(T.drehzahlMax === maxRegel && (ausnahme ? T.drehzahlRotAb === 8 : T.drehzahlRotAb === rotRegel),
      `${NAMEN[id]}: Skala bis ${T.drehzahlMax * 1000} (Regel: nächste Tausend über ${begr} + 8 % = ${maxRegel * 1000}), rot ab ${T.drehzahlRotAb * 1000}${ausnahme ? ` (Subora bleibt 8000; Regel gäbe ${rotRegel * 1000})` : ` (Regel ${rotRegel * 1000})`}`);
    melde(pT >= 85 && pT <= 95.5 && T.tempoMax === 200, `${NAMEN[id]}: Tempo-Nadel bei Höchsttempo ${pT.toFixed(1)} % von 200 km/h (Ziel ca. 85 bis 95 %; 180 hätte ${(vmax / 180 * 100).toFixed(1)} % gegeben), mph ${pM.toFixed(1)} % von ${T.tempoMaxMph}`);
  }
  FP.waehleFahrprofil('prototyp');
  fs.writeFileSync(path.join(ORDNER, 'skalen.md'), `${zeilen.join('\n')}\n`);
  info('Tabelle: screenshots/m8g/skalen.md');
  // Kontraste (WCAG) je Stil: Zahlen und Nadel auf dem Blatt (Blatt halbtransparent: über Gras-Grün gemischt)
  const T = CONFIG.hud.tacho, S = CONFIG.hud.tachoStile;
  for (const st of ['klassisch', 'audan', 'delto', 'escorta', 'l073', 'imprexa']) {
    const x = { ...T, ...S.klassisch, ...S[st] };
    const blatt = rgb(x.farbeBlatt), unterStrich = x.muster === 'innenring' && x.musterBreite > 2 ? rgb(x.farbeMuster) : blatt;
    const kz = kontrast(rgb(x.farbeZahlen), blatt), kn = kontrast(rgb(x.farbeNadel), blatt), ks = kontrast(rgb(x.farbeStriche), unterStrich);
    const kd = kontrast(rgb(x.farbeDigital), x.digitalFenster ? rgb(x.digitalFenster) : blatt);
    melde(kz >= 4.5 && kn >= 3 && ks >= 3 && kd >= 4.5, `Kontrast ${st}: Zahlen ${kz.toFixed(1)}, Nadel ${kn.toFixed(1)}, Striche ${ks.toFixed(1)}, Digital ${kd.toFixed(1)} (mindestens 4.5 / 3 / 3 / 4.5)`);
  }
  // Skalenzahlen im Auto-Stil: aus dem gemalten Zifferblatt nachgezählt
  const s = await starteSpiel({ breite: 640, hoehe: 360 });
  await s.page.goto(`${s.url}/index.html?menue=aus&auto=rt4`);
  await s.page.waitForFunction(() => window.__alpineRally, null, { timeout: 120000 });
  const z = await s.page.evaluate(async (ids) => {
    const Tm = await import('/js/tacho.js');
    const c = document.createElement('canvas'); c.width = 320; c.height = 180;
    const tachos = Tm.baueTachos(c.getContext('2d'), () => {});
    tachos.setzeModus('auto');
    const MINI = Tm.MINI, out = {};
    const pruefe = (b, farbe) => {
      const ctx = b.bild.getContext('2d'), d = ctx.getImageData(0, 0, b.bild.width, b.bild.height).data, w = b.bild.width;
      const f = farbe.match(/[0-9a-f]{2}/gi).map((h) => parseInt(h, 16));
      const fehler = [];
      for (const n of b.zahlen) {
        let soll = 0, ist = 0;
        for (let i = 0; i < n.text.length; i++) for (let yy = 0; yy < 5; yy++) for (let xx = 0; xx < 3; xx++) {
          if (MINI[n.text[i]][yy][xx] !== '#') continue;
          soll++;
          const k = ((b.m + n.y + yy) * w + b.m + n.x + i * 4 + xx) * 4;
          if (Math.abs(d[k] - f[0]) < 3 && Math.abs(d[k + 1] - f[1]) < 3 && Math.abs(d[k + 2] - f[2]) < 3) ist++;
        }
        if (ist !== soll) fehler.push(`${n.text} ${ist}/${soll}`);
      }
      const paare = [];
      b.zahlen.forEach((a, i) => b.zahlen.forEach((o, j) => {
        if (j > i && !(a.x + a.b < o.x || o.x + o.b < a.x || a.y + 5 < o.y || o.y + 5 < a.y)) paare.push(`${a.text}/${o.text}`);
      }));
      return { zahlen: b.zahlen.map((n) => n.text).join(' '), fehler, paare, weg: b.weggelassen };
    };
    for (const id of ids) {
      for (const e of ['kmh', 'mph']) {
        tachos.setzeEinheit(e); tachos.setzeSkala(id);
        const B = tachos.blaetter(), farbe = window.__alpineRally.CONFIG.hud.tachoStile[tachos.skala().stil].farbeZahlen || window.__alpineRally.CONFIG.hud.tacho.farbeZahlen;
        out[`${id}-${e}`] = { dreh: pruefe(B.dreh, farbe), tempo: pruefe(B.tempo, farbe) };
      }
    }
    return out;
  }, ALLE);
  await s.schliessen();
  for (const [k, v] of Object.entries(z)) {
    for (const art of ['dreh', 'tempo']) {
      const x = v[art];
      if (art === 'dreh' && k.endsWith('mph')) continue; // (Drehzahl ist in beiden Einheiten dasselbe Blatt)
      melde(x.fehler.length === 0 && x.paare.length === 0 && !x.weg.includes('jede zweite'),
        `${k} ${art === 'dreh' ? 'Drehzahl' : 'Tempo'}: Zahlen ${x.zahlen}${x.weg.length ? ` (weggelassen: ${x.weg.join(', ')})` : ''}; alle Pixel jeder Zahl da${x.fehler.length ? ` NEIN: ${x.fehler.join(', ')}` : ''}, sich berührende Zahlen: ${x.paare.length ? x.paare.join(', ') : 'keine'}`);
    }
  }
}

// ---------------------------------------------------------------- Hilfe: Tacho im Test-Browser direkt malen
// fn(window-Umgebung) läuft im Browser mit { T (tacho.js), C (CONFIG), neu(id, modus) -> { tachos, ctx, dreh, stil, male } }
async function imTacho(fn, arg, args = []) {
  const s = await starteSpiel({ breite: 640, hoehe: 360, args });
  await s.page.goto(`${s.url}/index.html?menue=aus&auto=rt4`);
  await s.page.waitForFunction(() => window.__alpineRally, null, { timeout: 120000 });
  await s.page.evaluate(async () => {
    const T = await import('/js/tacho.js'), P = await import('/js/pixel.js'), C = window.__alpineRally.CONFIG;
    window.__m8g = {
      T, C,
      neu(id, modus = 'auto') {
        const c = document.createElement('canvas'); c.width = 320; c.height = 180;
        const ctx = c.getContext('2d');
        const FARBEN = { weiss: '#f4f4ee', gelb: '#ffd23c', rot: '#ff4a3a' };
        const text = (tx, x, y, g = 1, f = 'weiss', a = 'links', sch) => P.pixelText(ctx, tx, x, y, g, FARBEN[f] || f, a, sch);
        const tachos = T.baueTachos(ctx, text);
        tachos.setzeModus(modus); tachos.setzeSkala(id);
        const dreh = tachos.blaetter().dreh, stil = T.tachoStil(tachos.skala().stil);
        // n Bilder mit dt malen (dt = 1: Nadeln ganz nachgeführt)
        const male = (n, dt, kmh, rpm, gang, extra) => { for (let i = 0; i < n; i++) { ctx.clearRect(0, 0, 320, 180); tachos.zeichne(dt, kmh, rpm, gang, extra); } };
        const pixel = (x, y) => Array.from(ctx.getImageData(x, y, 1, 1).data);
        return { tachos, ctx, dreh, stil, male, pixel };
      },
      gleich: (a, f) => { const h = f.match(/[0-9a-f]{2}/gi).map((x) => parseInt(x, 16)); return a[3] > 200 && Math.abs(a[0] - h[0]) < 3 && Math.abs(a[1] - h[1]) < 3 && Math.abs(a[2] - h[2]) < 3; },
    };
  });
  const r = await s.page.evaluate(fn, arg);
  const fehlerKonsole = s.fehler.length;
  await s.schliessen();
  return { ...r, fehlerKonsole };
}

// ---------------------------------------------------------------- (c) Schaltlicht
if (teil('c')) {
  console.log('(c) Schaltlicht je Auto (nur Anzeige)');
  const { CONFIG } = await lade(WURZEL, 'js/config.js');
  const FP = await lade(WURZEL, 'js/fahrprofil.js');
  const zeilen = ['| Auto | Bauform | Schalten Vollgas | an ab (95 %) | Reihe füllt ab | Begrenzer | blinkt ab (−250) | gemessen: Blinken |', '|---|---|---|---|---|---|---|---|'];
  const regel = {};
  for (const id of ALLE) {
    FP.waehleFahrprofil(id);
    const S = CONFIG.fahrprofile[id].tacho.schaltlicht, hoch = CONFIG.getriebe.hochVollgas, begr = CONFIG.audio.motor.begrenzerAb;
    regel[id] = { an: Math.round(hoch * 0.95 / 50) * 50, blinken: begr - 250, hoch, begr };
    melde(S.an === regel[id].an && S.blinken === regel[id].blinken, `${NAMEN[id]}: Schwellen in config.js an ${S.an} (95 % von ${hoch} = ${regel[id].an}), blinken ${S.blinken} (${begr} − 250 = ${regel[id].blinken})${S.fuellenAb ? `, Reihe füllt ab ${S.fuellenAb}` : ''}`);
  }
  FP.waehleFahrprofil('prototyp');
  const r = await imTacho(async (ids) => {
    const { neu, gleich, T } = window.__m8g, out = {};
    for (const id of ids) {
      const x = neu(id), L = x.stil.schaltlicht, S = window.__m8g.C.fahrprofile[id].tacho.schaltlicht;
      const [fx0, fy0] = T.lichtFeld(x.stil), cx = x.dreh.cx, cy = x.dreh.cy;
      // Zustand lesen: Lampe an (Farbe an/blinken) bzw. Anzahl leuchtender Punkte der Reihe
      const lies = () => {
        if (L.form === 'reihe') return L.farben.reduce((n, f, i) => n + (gleich(x.pixel(cx + fx0 + i * 3, cy + fy0), f) ? 1 : 0), 0);
        const p = x.pixel(cx, cy + L.y + Math.floor(L.groesse / 2));
        return gleich(p, L.farbeAn) ? 1 : L.farbeBlinken && gleich(p, L.farbeBlinken) ? 2 : 0;
      };
      const voll = L.form === 'reihe' ? L.farben.length : 1;
      const fall = (rpm, gang, schaltet) => { x.male(30, 1, 120, rpm, gang, { schaltet, ladedruck: 0, gas: 1 }); return lies(); };
      // Blinken: 2 s mit 60 Bildern pro Sekunde, Wechsel zählen
      const blinken = (rpm, gang) => {
        x.male(30, 1, 150, rpm, gang, { schaltet: false });
        let wechsel = 0, vor = lies(), farben = new Set([vor]);
        for (let i = 0; i < 120; i++) { x.male(1, 1 / 60, 150, rpm, gang, { schaltet: false }); const z = lies(); if (z !== vor) wechsel++; vor = z; farben.add(z); }
        return { hz: wechsel / 2 / 2, zustaende: [...farben] };
      };
      out[id] = {
        form: L.form, voll,
        unter: fall(S.an - 150, '3', false),
        anMitte: fall(Math.round((S.an + S.blinken) / 2), '3', false),
        ersteLed: L.form === 'reihe' ? fall(S.fuellenAb + 20, '3', false) : null,
        blink: blinken(S.blinken + 120, '3'),
        blink5: blinken(S.blinken + 120, '5'),
        n: fall(7000, 'N', false), rw: fall(7000, 'R', false), schalt: fall(S.blinken + 120, '3', true),
      };
    }
    return out;
  }, ALLE);
  for (const id of ALLE) {
    const x = r[id], ok = (v) => (x.form === 'reihe' ? v === x.voll : v >= 1);
    const unterOk = x.form === 'reihe' ? x.unter < x.voll : x.unter === 0;
    melde(unterOk && ok(x.anMitte) && (x.ersteLed === null || x.ersteLed >= 1) && x.n === 0 && x.rw === 0 && x.schalt === 0,
      `${NAMEN[id]} (${x.form}): unter der Schwelle ${x.form === 'reihe' ? `${x.unter} von ${x.voll} Punkten` : x.unter ? 'AN' : 'aus'}, dazwischen ${x.form === 'reihe' ? `${x.anMitte} von ${x.voll}` : x.anMitte ? 'an' : 'AUS'}${x.ersteLed !== null ? `, erster Punkt ab "füllt ab" ${x.ersteLed ? 'an' : 'AUS'}` : ''}; in N ${x.n ? 'AN' : 'aus'}, R ${x.rw ? 'AN' : 'aus'}, Schaltpause ${x.schalt ? 'AN' : 'aus'}`);
    melde(x.blink.hz >= 6 && x.blink.hz <= 8 && x.blink5.hz >= 6 && x.blink5.hz <= 8 && (id !== 'imprexa' || x.blink.zustaende.includes(2)),
      `${NAMEN[id]}: blinkt am Begrenzer mit ${x.blink.hz.toFixed(1)} Hz (Ziel 6 bis 8), im 5. Gang ${x.blink5.hz.toFixed(1)} Hz${id === 'imprexa' ? `, Farbe beim Blinken ${x.blink.zustaende.includes(2) ? 'rot' : 'NICHT rot'}` : ''}`);
    const S = CONFIG.fahrprofile[id].tacho.schaltlicht;
    zeilen.push(`| ${NAMEN[id]} | ${x.form === 'reihe' ? `Reihe aus ${x.voll}` : 'Lampe'} | ${regel[id].hoch} | ${S.an} | ${S.fuellenAb ?? '–'} | ${regel[id].begr} | ${S.blinken} | ${x.blink.hz.toFixed(1)} Hz |`);
  }
  melde(r.fehlerKonsole === 0, 'Konsole ohne Fehler');
  fs.writeFileSync(path.join(ORDNER, 'schaltlicht.md'), `${zeilen.join('\n')}\n`);
  info('Tabelle: screenshots/m8g/schaltlicht.md');
}

// ---------------------------------------------------------------- (d) Ladedruck- / Lader-Anzeige
if (teil('d')) {
  console.log('(d) Ladedruck-/Lader-Anzeige');
  const r = await imTacho(async (ids) => {
    const { neu, gleich } = window.__m8g, out = {};
    for (const id of ids) {
      const x = neu(id), A = x.stil.ladeAnzeige, cx = x.dreh.cx, cy = x.dreh.cy;
      // Tafel über dem Drehzahlmesser: x -23..23, y -(r+11) .. -(r+3)
      const y0 = cy - (x.dreh.r + 11), xa = cx - 23;
      const tafelPixel = () => { const d = x.ctx.getImageData(xa, y0, 47, 9).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 0) n++; return n; };
      // Füllung: Anteil der Balken-Pixel (mittlere Zeile) in der Füllfarbe
      const fuellung = () => {
        if (!A) return null;
        const d = x.ctx.getImageData(xa, y0 + 4, 47, 1).data;
        let voll = 0, leer = 0;
        for (let i = 1; i < 46; i++) { const p = Array.from(d.slice(i * 4, i * 4 + 4)); if (gleich(p, A.farbe)) voll++; else if (gleich(p, A.farbeLeer)) leer++; } // (ohne den Rand der Tafel)
        return voll / Math.max(1, voll + leer);
      };
      const art = window.__m8g.C.fahrprofile[id].tacho.lader || null;
      const o = { art, segmente: A ? A.segmente : 0 };
      x.male(40, 1, 100, 4000, '3', { ladedruck: 0, gas: 0 }); o.null = fuellung(); o.tafel = tafelPixel();
      if (art === 'turbo') {
        x.male(40, 1, 100, 5000, '3', { ladedruck: 0.5, gas: 1 }); o.halb = fuellung();
        x.male(40, 1, 100, 6000, '3', { ladedruck: 1, gas: 1 }); o.voll = fuellung();
        x.male(40, 1, 100, 4000, '3', { ladedruck: 0, gas: 0 });
        x.male(6, 1 / 60, 100, 6000, '3', { ladedruck: 1, gas: 1 }); o.nach01 = fuellung(); // nach 0.1 s
      } else if (art === 'kompressor') {
        x.male(40, 1, 100, 6000, '3', { ladedruck: 0, gas: 1 }); o.voll = fuellung(); // 6000 von 8000 mal Gas 1
        x.male(40, 1, 100, 6000, '3', { ladedruck: 0, gas: 0 }); o.gasWeg = fuellung();
        x.male(40, 1, 100, 3000, '3', { ladedruck: 0, gas: 1 }); o.halb = fuellung(); // 3000 von 8000
      }
      out[id] = o;
    }
    return out;
  }, ALLE);
  for (const id of ALLE) {
    const x = r[id];
    if (x.art === 'turbo') {
      melde(x.null < 0.06 && Math.abs(x.halb - 0.5) <= 0.06 && x.voll > 0.94 && x.nach01 > 0.3 && x.nach01 < 0.85,
        `${NAMEN[id]} (Turbo, BOOST): Ladedruck 0 → ${(x.null * 100).toFixed(0)} %, 0.5 → ${(x.halb * 100).toFixed(0)} %, 1 → ${(x.voll * 100).toFixed(0)} % gefüllt; weich: 0.1 s nach dem Sprung auf 1 erst ${(x.nach01 * 100).toFixed(0)} %`);
    } else if (x.art === 'kompressor') {
      melde(Math.abs(x.voll - 0.8) <= 0.21 && x.gasWeg < 0.05 && Math.abs(x.halb - 0.4) <= 0.21 && x.segmente > 0,
        `${NAMEN[id]} (Kompressor, LADER, ${x.segmente} Segmente): 6000/min mit Gas ${(x.voll * 100).toFixed(0)} % (Soll 75 %), ohne Gas ${(x.gasWeg * 100).toFixed(0)} %, 3000/min mit Gas ${(x.halb * 100).toFixed(0)} % (Soll 37.5 %)`);
    } else melde(x.tafel === 0, `${NAMEN[id]} (Sauger): keine Ladedruck-Anzeige (${x.tafel} Pixel über dem Drehzahlmesser)`);
  }
  // Speicher pro Bild: Auto-Stil (Schaltlicht blinkt, Lader-Leiste) gegen klassisch, je 4 Läufe, das Minimum
  const sp = await imTacho(async (ids) => {
    const { neu } = window.__m8g, out = {};
    const miss = (fn) => { for (let k = 0; k < 2000; k++) fn(k); window.gc(); const h0 = performance.memory.usedJSHeapSize; for (let k = 0; k < 8000; k++) fn(k); return (performance.memory.usedJSHeapSize - h0) / 8000; };
    for (const id of ids) {
      const a = neu(id, 'auto'), k = neu(id, 'klassisch'), e = { ladedruck: 0.5, gas: 1, schaltet: false };
      const bild = (x) => (n) => { e.ladedruck = (n % 100) / 100; x.tachos.zeichne(1 / 60, 120 + (n % 50), 6000 + (n % 900), '3', e); };
      let mitStil = Infinity, ohne = Infinity;
      for (let r = 0; r < 4; r++) { ohne = Math.min(ohne, miss(bild(k))); mitStil = Math.min(mitStil, miss(bild(a))); }
      out[id] = { mitStil, ohne };
    }
    return out;
  }, ['delto', 'l073'], ['--js-flags=--expose-gc', '--enable-precise-memory-info']);
  for (const id of ['delto', 'l073']) {
    const h = sp[id];
    melde(h.mitStil <= h.ohne + 16, `${NAMEN[id]}: Speicher pro Bild (Tacho zeichnen, Heap des Test-Browsers): Auto-Stil ${h.mitStil.toFixed(1)} Byte, klassisch ${h.ohne.toFixed(1)} Byte (ein neues Objekt wären 16 und mehr)`);
  }
  // Datenweg im Spiel: Delto fährt 4 s Vollgas, das HUD zeigt den echten Ladedruck
  const s = await starteSpiel({ breite: 640, hoehe: 360 });
  await s.page.goto(`${s.url}/index.html?menue=aus&auto=delto`);
  await s.page.waitForFunction(() => window.__alpineRally, null, { timeout: 120000 });
  const w = await s.page.evaluate(async () => {
    const A = window.__alpineRally;
    A.start({ countdown: false }); A.anhalten = true; A.setzeAuf(600);
    const e = { gas: 1, bremse: 0, lenkung: 0, handbremse: false, reset: false, debug: false, notes: false };
    for (let k = 0; k < 240; k++) A.rennSchritt(A.SCHRITT, e);
    await new Promise((r) => setTimeout(r, 1200));
    const T = A.hud.tachos.blaetter().dreh, A2 = A.CONFIG.hud.tachoStile.delto.ladeAnzeige;
    const d = document.getElementById('hud').getContext('2d').getImageData(T.cx - 22, T.cy - (T.r + 11) + 4, 45, 1).data;
    const h = A2.farbe.match(/[0-9a-f]{2}/gi).map((x) => parseInt(x, 16));
    let voll = 0; for (let i = 0; i < d.length; i += 4) if (Math.abs(d[i] - h[0]) < 3 && Math.abs(d[i + 1] - h[1]) < 3 && Math.abs(d[i + 2] - h[2]) < 3) voll++;
    return { ladedruck: A.getriebe.ladedruck, voll, kmh: A.physik.tempo * 3.6 };
  });
  await s.schliessen();
  melde(w.ladedruck > 0.5 && w.voll >= 8, `im Spiel (Delto, 4 s Vollgas, ${w.kmh.toFixed(0)} km/h): Ladedruck ${w.ladedruck.toFixed(2)}, BOOST-Leiste ${w.voll} Pixel gefüllt (main.js reicht ladedruck, gas, schaltet an das HUD)`);
  // Platz im HUD: Tacho-Gruppe (alles ab x 200 unten rechts) klassisch gegen Auto-Stil; berührt nichts
  {
    const s = await starteSpiel({ breite: 640, hoehe: 360 });
    await s.page.goto(`${s.url}/index.html?menue=aus&auto=delto`);
    await s.page.waitForFunction(() => window.__alpineRally, null, { timeout: 120000 });
    const platz = await s.page.evaluate(async () => {
      const A = window.__alpineRally, E = await import('/js/einstellungen.js');
      const warte = (n) => new Promise((r) => { let k = 0; const f = () => (++k >= n ? r() : requestAnimationFrame(f)); requestAnimationFrame(f); });
      const kasten = (bx, by, bb, bh) => {
        const d = document.getElementById('hud').getContext('2d').getImageData(bx, by, bb, bh).data;
        let x0 = 999, y0 = 999, x1 = -1, y1 = -1;
        for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 0) { const x = bx + (i / 4) % bb, y = by + Math.floor(i / 4 / bb); x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
        return { x0, y0, x1, y1 };
      };
      A.rennen.hilfe = true; // Hilfezeilen vor dem Start (links unten) sichtbar
      E.setze('tacho', 'klassisch'); await warte(4); const k = kasten(200, 90, 120, 90);
      E.setze('tacho', 'auto'); await warte(4); const a = kasten(200, 90, 120, 90);
      const hilfe = kasten(0, 120, 200, 60);
      const m = A.hud.minimap, L = A.hud.lage;
      return { k, a, rechtecke: { minimap: { x0: m.x, y0: m.y, x1: m.x + m.breite - 1, y1: m.y + m.hoehe - 1 }, zeit: { x0: L.zeit.x, y0: L.zeit.y, x1: L.zeit.x + L.zeit.b - 1, y1: L.zeit.y + L.zeit.h - 1 },
        notes: { x0: L.notes.x, y0: L.notes.y, x1: L.notes.x + L.notes.b - 1, y1: L.notes.y + L.notes.h - 1 }, hilfe } };
    });
    await s.schliessen();
    // (mit einem Pixel Abstand: aneinanderstossen zählt als berühren)
    const ueber = (a, b) => a.x0 <= b.x1 + 1 && b.x0 <= a.x1 + 1 && a.y0 <= b.y1 + 1 && b.y0 <= a.y1 + 1;
    const beruehrt = Object.entries(platz.rechtecke).filter(([, r]) => r.x1 >= 0 && ueber(platz.a, r)).map(([n]) => n);
    melde(platz.k.y0 - platz.a.y0 <= 8 && platz.a.x0 >= platz.k.x0 && platz.a.x1 <= platz.k.x1 && beruehrt.length === 0 && platz.rechtecke.hilfe.x1 > 0,
      `Platz im HUD (Delto, Auto-Stil): Tacho-Gruppe x ${platz.a.x0}–${platz.a.x1}, y ${platz.a.y0}–${platz.a.y1} (klassisch x ${platz.k.x0}–${platz.k.x1}, y ${platz.k.y0}–${platz.k.y1}): ${platz.k.y0 - platz.a.y0} Pixel höher (höchstens 8), ${platz.a.x0 >= platz.k.x0 && platz.a.x1 <= platz.k.x1 ? 'nicht breiter' : 'BREITER'}; berührt ${beruehrt.length ? beruehrt.join(', ') : 'nichts'} (Minimap, Zeit-Tafel, Pace-Notes; Hilfezeilen x ${platz.rechtecke.hilfe.x0}–${platz.rechtecke.hilfe.x1}, y ${platz.rechtecke.hilfe.y0}–${platz.rechtecke.hilfe.y1})`);
  }
}

// ---------------------------------------------------------------- (e) Gang-Anzeige
if (teil('e')) {
  console.log('(e) Gang-Anzeige: 1 bis 5, N, R in allen Stilen');
  const r = await imTacho(async (ids) => {
    const { neu } = window.__m8g, out = {};
    for (const [id, modus] of ids) {
      const x = neu(id, modus), cx = x.dreh.cx, cy = x.dreh.cy;
      const bild = (g) => { x.male(20, 1, 0, 1000, g, null); return x.ctx.getImageData(cx - 12, cy - 4, 25, 22).data; };
      const leer = bild(' ');
      const o = {};
      for (const g of ['1', '2', '3', '4', '5', 'N', 'R']) {
        const d = bild(g);
        let n = 0, aussen = 0, rot = 0; const muster = [];
        for (let i = 0; i < d.length; i += 4) {
          if (d[i] === leer[i] && d[i + 1] === leer[i + 1] && d[i + 2] === leer[i + 2] && d[i + 3] === leer[i + 3]) continue;
          const px = (i / 4) % 25 - 12, py = Math.floor(i / 4 / 25) - 4;
          n++; muster.push(`${px},${py}`);
          if (px < -5 || px > 5 || py < 2 || py > 13) aussen++;
          if (d[i] > 200 && d[i + 1] < 110 && d[i + 2] < 110) rot++;
        }
        o[g] = { n, aussen, rot, muster: muster.join(';') };
      }
      out[`${id}-${modus}`] = { stil: x.stil.id, form: x.stil.gang.form, gaenge: o };
    }
    return out;
  }, [...ALLE.map((id) => [id, 'auto']), ['rt4', 'klassisch']]);
  for (const [k, v] of Object.entries(r)) {
    if (k === 'fehlerKonsole') continue;
    const g = v.gaenge, alle = Object.keys(g);
    const verschieden = new Set(alle.map((x) => g[x].muster)).size === alle.length;
    melde(alle.every((x) => g[x].n > 0 && g[x].aussen === 0) && verschieden && g.R.rot > 0,
      `${v.stil} (${v.form}): ${alle.map((x) => `${x} ${g[x].n}`).join(', ')} Pixel; ausserhalb des Kastens ${alle.reduce((a, x) => a + g[x].aussen, 0)}; alle verschieden ${verschieden ? 'ja' : 'NEIN'}; R rot ${g.R.rot > 0 ? 'ja' : 'NEIN'}`);
  }
}

// ---------------------------------------------------------------- Hilfe: Spiel mit Menü, gemerkte Einstellungen
async function spielMitMenue({ aufl = 1, sprache = 'de', tacho = 'auto', args = [] } = {}) {
  const s = await starteSpiel({ breite: [640, 960, 1280][aufl], hoehe: [360, 540, 720][aufl], auto: '', args });
  await s.page.addInitScript(([sprache, aufl, tacho]) => {
    try { if (!sessionStorage.getItem('m8g')) { localStorage.setItem('alpineRally.einstellungen', JSON.stringify({ sprache, aufloesung: aufl, tacho, auto: 'rt4' })); sessionStorage.setItem('m8g', '1'); } } catch { /* egal */ }
  }, [sprache, aufl, tacho]);
  await s.page.goto(`${s.url}/index.html`);
  await s.page.waitForFunction(() => window.__alpineRally && window.__alpineRally.menue, null, { timeout: 120000 });
  return s;
}
// Garage öffnen (Titel -> Hauptmenü -> AUTO), runter = Zeiger so viele Autos tiefer (vom gewählten Audan aus)
async function garageOeffnen(p, runter = 0) {
  for (const k of ['Enter', 'ArrowDown', 'Enter']) { await p.keyboard.press(k); await p.waitForTimeout(150); }
  for (let i = 0; i < runter; i++) { await p.keyboard.press('ArrowDown'); await p.waitForTimeout(120); }
  await p.waitForFunction(() => window.__alpineRally.menue.einblendung >= 1, null, { timeout: 30000 });
  await p.waitForTimeout(800);
}

// ---------------------------------------------------------------- (f) Garage
if (teil('f')) {
  console.log('(f) Garage: Tacho-Vorschau');
  for (const aufl of [0, 1, 2]) {
    for (const sprache of ['de', 'en']) {
      const s = await spielMitMenue({ aufl, sprache });
      await garageOeffnen(s.page, 1);
      // (der Test-Browser malt in der Garage nur 3 bis 5 Bilder pro Sekunde: warten, bis die Nadel im Leerlauf steht)
      await s.page.waitForFunction(() => Math.abs(window.__alpineRally.garageTacho.anzeige.drehzahl - 1000) < 1, null, { timeout: 30000 }).catch(() => {});
      const r = await s.page.evaluate(() => {
        const A = window.__alpineRally, g = A.seiten.garage, M = A.menue.rollen, T = g.tacho, R = g.rahmen;
        const innen = A.CONFIG.menue.innen;
        // Tacho-Feld: Lader-Tafel oben (Mitte − 33) bis Unterkante des Rings (Mitte + 24), Breite ±24
        const feld = { x0: T.cx - 24, x1: T.cx + 24, y0: T.cy - 33, y1: T.cy + 24 };
        const tafel = { x0: (320 - M.breite) / 2 + innen, x1: (320 + M.breite) / 2 - innen - 1, y0: M.y0, y1: M.y0 + M.hoehe - 1 };
        const vorschau = { x0: R.x - 1, x1: R.x + R.b, y0: R.y - 1, y1: R.y + R.h };
        const ueber = (a, b) => a.x0 <= b.x1 && b.x0 <= a.x1 && a.y0 <= b.y1 && b.y0 <= a.y1;
        // Werte-Balken beginnen 5 Pixel unter der Vorschau
        const balken = { x0: R.x, x1: tafel.x1, y0: R.y + R.h + 5, y1: R.y + R.h + 5 + 4 * 9 };
        // gezeichnete Pixel des Tachos auf der HUD-Leinwand
        const d = document.getElementById('hud').getContext('2d').getImageData(feld.x0, feld.y0, 49, 58).data;
        let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 200) n++;
        return { feld, tafel, vorschau, innen: feld.x0 >= tafel.x0 && feld.x1 <= tafel.x1 && feld.y0 >= tafel.y0 && feld.y1 <= tafel.y1,
          ueberVorschau: ueber(feld, vorschau), ueberBalken: ueber(feld, balken), pixel: n, vorschauB: R.b, vorschauH: R.h,
          stil: A.garageTacho.skala().stil, nadel: A.garageTacho.anzeige.drehzahl };
      });
      melde(r.innen && !r.ueberVorschau && !r.ueberBalken && r.pixel > 900 && r.stil === 'delto' && Math.abs(r.nadel - 1000) < 1 && s.fehler.length === 0,
        `${['320x180', '480x270', '640x360'][aufl]} ${sprache}: Tacho (Delto-Stil ${r.stil}) bei x ${r.feld.x0}–${r.feld.x1}, y ${r.feld.y0}–${r.feld.y1} in der Tafel ${r.innen ? 'ja' : 'NEIN'}, über der 3D-Vorschau (${r.vorschauB}x${r.vorschauH}) ${r.ueberVorschau ? 'JA' : 'nein'}, über den Werte-Balken ${r.ueberBalken ? 'JA' : 'nein'}, ${r.pixel} Pixel gezeichnet, Nadel ${r.nadel.toFixed(0)}/min (Leerlauf)`);
      if (aufl === 1 && sprache === 'de') {
        await s.page.screenshot({ path: path.join(ORDNER, '40-garage-tacho-480x270.png') });
        info('Bild: screenshots/m8g/40-garage-tacho-480x270.png');
      }
      await s.schliessen();
    }
  }
  // 20 Wechsel (runter und rauf): Vorrat der Zifferblätter wächst nicht, Speicher, Zeit für ein neues Zifferblatt
  {
    const s = await spielMitMenue({ aufl: 0 });
    const p = s.page;
    await garageOeffnen(p, 0);
    const cdp = await p.context().newCDPSession(p);
    const heap = async () => { for (let i = 0; i < 3; i++) await cdp.send('HeapProfiler.collectGarbage'); return (await cdp.send('Runtime.getHeapUsage')).usedSize; };
    // (je Wechsel warten, bis ein Bild mit dem neu markierten Auto gemalt ist: der Test-Browser ist langsam)
    const bilder = (n) => p.evaluate((n) => new Promise((r) => { let k = 0; const f = () => (++k >= n ? r() : requestAnimationFrame(f)); requestAnimationFrame(f); }), n);
    const runde = async () => { for (let k = 0; k < 20; k++) { await p.keyboard.press(k % 8 < 4 ? 'ArrowDown' : 'ArrowUp'); await bilder(2); } await bilder(3); };
    await runde();
    const v0 = await p.evaluate(() => window.__alpineRally.garageTacho.vorrat()), h0 = await heap();
    await runde(); await runde();
    const v1 = await p.evaluate(() => window.__alpineRally.garageTacho.vorrat()), h1 = await heap();
    // Zeit: ein Zifferblatt neu malen (kalt) und aus dem Vorrat holen (warm)
    const ms = await p.evaluate(async () => {
      const T = await import('/js/tacho.js'), c = document.createElement('canvas'); c.width = 320; c.height = 180;
      const t = T.baueTachos(c.getContext('2d'), () => {});
      t.setzeModus('auto');
      t.setzeEinheit('mph'); // (mph-Blätter sind noch nicht gemalt: kalt)
      let t0 = performance.now(); t.setzeSkala('l073'); const kalt = performance.now() - t0;
      t0 = performance.now(); for (let i = 0; i < 20; i++) { t.setzeSkala(i % 2 ? 'delto' : 'l073'); } const warm = (performance.now() - t0) / 20;
      return { kalt, warm };
    });
    melde(v1 === v0 && h1 - h0 < 300000 && s.fehler.length === 0,
      `20 Wechsel in der Garage (dreimal): Zifferblätter im Vorrat ${v0} -> ${v1} (kein Leck), Speicher ${((h1 - h0) / 1024).toFixed(0)} KB (Grenze 300 KB), Konsole ohne Fehler`);
    melde(ms.kalt < 25 && ms.warm < 2, `Autowechsel: ein Satz Zifferblätter neu malen ${ms.kalt.toFixed(1)} ms (einmal je Auto und Einheit), aus dem Vorrat ${ms.warm.toFixed(2)} ms (ruckelfrei)`);
    await s.schliessen();
  }
  // Aufheulen: Nadel folgt, Schaltlicht blitzt mit; danach wieder Leerlauf
  {
    const s = await spielMitMenue({ aufl: 0, args: ['--autoplay-policy=no-user-gesture-required'] });
    const p = s.page;
    await p.keyboard.press('Enter');
    await p.waitForFunction(() => window.__alpineRally.ton.werk && window.__alpineRally.ton.werk.aufbau.fertig, null, { timeout: 60000 });
    await p.keyboard.press('ArrowDown'); await p.keyboard.press('Enter');
    await p.waitForFunction(() => window.__alpineRally.menue.einblendung >= 1, null, { timeout: 30000 });
    await p.waitForFunction(() => Math.abs(window.__alpineRally.garageTacho.anzeige.drehzahl - 1000) < 1, null, { timeout: 30000 }).catch(() => {});
    const r = await p.evaluate(async () => {
      const A = window.__alpineRally, G = A.garageTacho, T = A.seiten.garage.tacho, L = A.CONFIG.hud.tachoStile.audan.schaltlicht;
      const lampe = () => { const d = document.getElementById('hud').getContext('2d').getImageData(T.cx, T.cy + L.y + 2, 1, 1).data; return d[0] > 200 && d[1] < 110; };
      const vorher = G.anzeige.drehzahl;
      A.menue.taste('Space');
      const proben = [];
      const t0 = performance.now();
      // (bis das Aufheulen vorbei ist und die Nadel wieder steht; der Test-Browser malt nur wenige Bilder pro Sekunde)
      while (performance.now() - t0 < 30000 && (proben.length < 5 || A.aufheulen || Math.abs(G.anzeige.drehzahl - 1000) > 20)) {
        await new Promise((r) => requestAnimationFrame(r));
        proben.push({ t: performance.now() - t0, heult: !!A.aufheulen, motor: A.aufheulen ? A.aufheulen.zustand.drehzahl : 1000, nadel: G.anzeige.drehzahl, licht: lampe() });
      }
      return { vorher, proben, gestartet: proben.some((x) => x.heult) };
    });
    const max = Math.max(...r.proben.map((x) => x.nadel)), maxMotor = Math.max(...r.proben.map((x) => x.motor));
    const licht = r.proben.filter((x) => x.licht).length, ende = r.proben[r.proben.length - 1];
    // folgt: in den Bildern, in denen der Motor über 3000/min dreht, steht die Nadel meist über 2500 (bei 3 bis 5 Bildern pro
    // Sekunde im Test-Browser hinkt sie ein Bild nach)
    const hoch = r.proben.filter((x) => x.motor > 3000), folgt = hoch.length > 0 && hoch.filter((x) => x.nadel > 2500).length >= 0.6 * hoch.length;
    if (r.gestartet) {
      melde(Math.abs(r.vorher - 1000) < 1 && max > 4000 && max >= maxMotor * 0.9 && folgt && licht > 0 && Math.abs(ende.nadel - 1000) < 150,
        `Aufheulen (Audan): Nadel vorher ${r.vorher.toFixed(0)}/min, Spitze ${max.toFixed(0)}/min (Motor ${maxMotor.toFixed(0)}), folgt ${folgt ? 'ja' : 'NEIN'}, Schaltlicht an in ${licht} von ${r.proben.length} Bildern, am Ende ${ende.nadel.toFixed(0)}/min`);
    } else melde(false, 'Aufheulen startete im Test-Browser nicht (Ton gesperrt?)');
    await s.schliessen();
  }
  // KLASSISCH: die Vorschau zeigt den klassischen Tacho (ohne Schaltlicht und Lader)
  {
    const s = await spielMitMenue({ aufl: 1, tacho: 'klassisch' });
    await garageOeffnen(s.page, 1);
    const r = await s.page.evaluate(() => { const A = window.__alpineRally, T = A.seiten.garage.tacho; const d = document.getElementById('hud').getContext('2d').getImageData(T.cx - 23, T.cy - 33, 47, 9).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 200) n++; return { stil: A.garageTacho.skala().stil, tafel: n }; });
    melde(r.stil === 'klassisch', `TACHO = KLASSISCH: Vorschau im Stil ${r.stil}, ohne BOOST-Tafel (${r.tafel} helle Pixel im Feld der Tafel: Menü-Hintergrund)`);
    await s.schliessen();
  }
}

// ---------------------------------------------------------------- (g) Einstellung TACHO
if (teil('g')) {
  console.log('(g) Einstellung TACHO');
  const s = await spielMitMenue({ aufl: 0 });
  const p = s.page;
  const r = await p.evaluate(async () => {
    const A = window.__alpineRally, E = await import('/js/einstellungen.js'), P = await import('/js/pixel.js'), X = await import('/js/texte.js');
    const out = { standard: A.einstellungen.tacho };
    const breite = {};
    for (const sp of ['de', 'en']) {
      X.setzeSprache(sp);
      breite[sp] = ['einst.tacho', 'einst.tachoHinweis', 'wert.tachoAuto', 'wert.tachoKlassisch'].map((k) => [X.t(k), P.textBreite(X.t(k))]);
    }
    X.setzeSprache('de');
    out.breite = breite;
    // im Rennen und in der Pause: Wechsel wirkt im nächsten Bild
    A.start({ countdown: false });
    const bild = () => document.getElementById('hud').getContext('2d').getImageData(205, 110, 115, 70).data.join(',');
    const warte = (n) => new Promise((r) => { let k = 0; const f = () => (++k >= n ? r() : requestAnimationFrame(f)); requestAnimationFrame(f); });
    await warte(10);
    const auto = bild(); E.setze('tacho', 'klassisch'); await warte(2);
    const klassisch = bild();
    out.rennen = { anders: auto !== klassisch, modus: A.hud.tachos.modus, stil: A.hud.tachos.skala().stil };
    A.pausieren(); await warte(10);
    const p1 = bild(); E.setze('tacho', 'auto'); await warte(2);
    out.pause = { anders: p1 !== bild(), stil: A.hud.tachos.skala().stil };
    E.setze('tacho', 'klassisch');
    out.gespeichert = JSON.parse(localStorage.getItem('alpineRally.einstellungen')).tacho;
    return out;
  });
  await p.reload();
  await p.waitForFunction(() => window.__alpineRally && window.__alpineRally.menue, null, { timeout: 120000 });
  const nachLaden = await p.evaluate(() => ({ wert: window.__alpineRally.einstellungen.tacho, modus: window.__alpineRally.hud.tachos.modus }));
  await s.schliessen();
  melde(r.standard === 'auto', `Standard beim ersten Start: ${r.standard}`);
  melde(r.rennen.anders && r.rennen.stil === 'klassisch' && r.pause.anders && r.pause.stil === 'audan', `wirkt sofort: im Rennen ${r.rennen.anders ? 'anders' : 'GLEICH'} (Stil ${r.rennen.stil}), in der Pause ${r.pause.anders ? 'anders' : 'GLEICH'} (Stil ${r.pause.stil})`);
  melde(r.gespeichert === 'klassisch' && nachLaden.wert === 'klassisch' && nachLaden.modus === 'klassisch', `gemerkt im Browser: ${r.gespeichert}, nach neuem Laden ${nachLaden.wert} (HUD ${nachLaden.modus})`);
  for (const sp of ['de', 'en']) {
    const b = r.breite[sp];
    melde(b.every(([, w]) => w > 0 && w <= 300), `Menütexte ${sp}: ${b.map(([x, w]) => `${x} (${w} px)`).join(', ')} (höchstens 300 px)`);
  }
}

// ---------------------------------------------------------------- Hilfen für (h) und (i)
const werkzeug = (name, argumente = [], timeout = 6 * 3600000, wurzel = WURZEL) => {
  const r = spawnSync(process.execPath, [path.join(wurzel, 'tools', name), ...argumente], { encoding: 'utf8', timeout, maxBuffer: 64 * 1024 * 1024, cwd: wurzel });
  return { code: r.status, text: `${r.stdout || ''}${r.stderr || ''}` };
};
const fmtZeit = (t) => `${Math.floor(t / 60)}:${(t % 60).toFixed(2).padStart(5, '0')}`;
// Fahrmessungen (ohne Browser) einer Version: alle Profile und die Motorwerte je Profil
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
  return { physik: out, motor };
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
// Testfahrer drei Stile je Profil im Spiel (einer Version)
async function testfahrer(ids, wurzel = WURZEL) {
  const s = await starteSpiel({ wurzel, breite: 640, hoehe: 360 });
  const fahrerCode = fs.readFileSync(path.join(WURZEL, 'tools/testfahrer-browser.js'), 'utf8');
  const TF = {};
  for (const id of ids) {
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
  return TF;
}
// Ton-Messung eines Profils (tools/ton-messung.mjs) gegen die gespeicherte Messung von 0.8f (tools/ton-messung-m8f-<id>.json)
function tonVergleich(id) {
  const name = `m8g-${id}`;
  const r = werkzeug('ton-messung.mjs', id === 'prototyp' ? [name, '--bilder', 'screenshots/m8g/ton'] : [name, '--profil', id, '--bilder', 'screenshots/m8g/ton']);
  if (r.code !== 0) return { fehler: r.text.split('\n').slice(-3).join(' ') };
  const a = JSON.parse(fs.readFileSync(path.join(WURZEL, `tools/ton-messung-m8f-${id}.json`), 'utf8'));
  const b = JSON.parse(fs.readFileSync(path.join(WURZEL, `tools/${`ton-messung-${name}`}.json`), 'utf8'));
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
  vergleiche(a, b, '');
  fs.rmSync(path.join(WURZEL, `tools/ton-messung-${name}.json`), { force: true }); // (nur zum Vergleich, nicht ins Repo)
  return { gleich, rauschen, anders };
}

// ---------------------------------------------------------------- (h) Unveränderlich
if (teil('h')) {
  console.log('(h) Unveränderlich gegen 0.8f');
  const ALT_ORDNER = ALT;
  if (!ALT_ORDNER) info('Fahrmessung, Aussehen und Testfahrer vergleichen: nur mit --alt <ordner 0.8f>');
  const IDS = ['prototyp', ...ALLE];
  if (ALT_ORDNER) {
    const [a, b] = [await physikVon(ALT_ORDNER), await physikVon(WURZEL)];
    for (const id of IDS) {
      melde(JSON.stringify(a.physik[id]) === JSON.stringify(b.physik[id]) && JSON.stringify(a.motor[id]) === JSON.stringify(b.motor[id]),
        `${NAMEN[id]}: alle ${Object.keys(a.physik[id]).length} Fahrmessungen und die Motorwerte (audio.motor mit Profil) bit-genau wie 0.8f`);
    }
    const [x, y] = [await abdruck(ALLE, ALT_ORDNER), await abdruck(ALLE, WURZEL)];
    const anders = Object.keys(x).filter((k) => x[k] !== y[k]);
    melde(anders.length === 0 && Object.keys(x).length === Object.keys(y).length, `Aussehen der fünf Autos (Lack-Texturen 320/480/640, Geometrie, Räder): ${Object.keys(x).length} Prüfsummen wie 0.8f${anders.length ? `; anders: ${anders.slice(0, 6).join(', ')}` : ''}`);
    const { AUTO_MODELLE: MA } = await lade(ALT_ORDNER, 'js/autos.js'), { AUTO_MODELLE: MN } = await lade(WURZEL, 'js/autos.js');
    melde(ALLE.every((id) => JSON.stringify(MA[id].werte) === JSON.stringify(MN[id].werte)), `Garage-Werte-Balken: ${ALLE.map((id) => `${id} ${Object.values(MN[id].werte).join('/')}`).join(', ')} (wie 0.8f)`);
    // Testfahrer: neu gegen 0.8f (gespeichert in tools/m8f-testfahrer.json; der Escorta dort nicht, er fährt in 0.8f neu)
    const neu = await testfahrer(IDS);
    const alt = JSON.parse(fs.readFileSync(path.join(WURZEL, 'tools/m8f-testfahrer.json'), 'utf8'));
    Object.assign(alt, await testfahrer(IDS.filter((id) => !alt[id]), ALT_ORDNER));
    for (const id of IDS) {
      const gleich = ['vorsichtig', 'mittel', 'flott'].every((st) => JSON.stringify(alt[id][st]) === JSON.stringify(neu[id][st]));
      melde(gleich, `Testfahrer ${NAMEN[id]}: ${['vorsichtig', 'mittel', 'flott'].map((st) => `${fmtZeit(neu[id][st].zeit)}${neu[id][st].kontakte ? ` (${neu[id][st].kontakte} Kontakte)` : ''}`).join(' / ')} – Zeiten, Zwischenzeiten, Aufpralle ${gleich ? 'gleich wie 0.8f' : 'ANDERS als 0.8f'}`);
    }
    melde(['2:59.33', '2:42.35', '2:31.92'].join() === ['vorsichtig', 'mittel', 'flott'].map((st) => fmtZeit(neu.prototyp[st].zeit)).join(), `Testfahrer Prototyp ${['vorsichtig', 'mittel', 'flott'].map((st) => fmtZeit(neu.prototyp[st].zeit)).join(' / ')} (Soll 2:59.33 / 2:42.35 / 2:31.92)`);
  }
  // Ton je Auto: Messung gegen 0.8f
  for (const id of IDS) {
    const t = tonVergleich(id);
    melde(!t.fehler && t.anders.length === 0, `${NAMEN[id]}: Ton wie 0.8f ${t.fehler ? `(Messung fehlgeschlagen: ${t.fehler})` : `(${t.gleich} Zahlen gleich, ${t.rauschen} nur in der 5. bis 7. Stelle anders = Rechenrauschen des Test-Browsers, ${t.anders.length} anders${t.anders.length ? `: ${t.anders.slice(0, 3).join('; ')}` : ''})`}`);
  }
  fs.rmSync(path.join(WURZEL, 'screenshots/m8g/ton'), { recursive: true, force: true }); // (Spektrogramme nur für die Messung)
  // Ton-Quelltext: keine Datei des Tons geändert
  const tonDateien = ['js/audio.js', 'js/umgebung.js', 'js/musik.js', 'js/musikstueck.js', 'js/tonfahrt.js', 'js/physics.js', 'js/getriebe.js', 'js/fahrprofil.js', 'js/autos.js', 'js/car.js', 'js/track.js', 'js/netz.js'];
  const geaendert = tonDateien.filter((d) => spawnSync('git', ['diff', '--quiet', '3ed7aae', '--', d], { cwd: WURZEL }).status !== 0);
  melde(geaendert.length === 0, `Ton, Physik, Getriebe, Fahrprofil-Mechanik, Autos und Strecke: ${tonDateien.length} Dateien unverändert seit 0.8f${geaendert.length ? `; geändert: ${geaendert.join(', ')}` : ''}`);
  for (const d of ['js/pacenotes-tempo.js', 'js/abkuerzungen.js', 'tools/schneiden-zeiten.json']) {
    melde(spawnSync('git', ['diff', '--quiet', '3ed7aae', '--', d], { cwd: WURZEL }).status === 0, `${d} nicht neu geschrieben (gleich wie 0.8f)`);
  }
  const ab = werkzeug('abkuerzungen.mjs', ['--pruefen']);
  const n = [...ab.text.matchAll(/übrig in Kurve [^:]+: (\d+) Linien/g)].map((x) => +x[1]);
  melde(n.join(' / ') === '127 / 2 / 342 / 84', `Abkürzungen: ${n.join(' / ')} (Soll 127 / 2 / 342 / 84)`);
  // Strecke
  const s = await starteSpiel({ breite: 640, hoehe: 360 });
  await s.page.goto(`${s.url}/index.html?menue=aus`);
  await s.page.waitForFunction(() => window.__alpineRally, null, { timeout: 120000 });
  const platz = { laenge: await s.page.evaluate(() => window.__alpineRally.strecke.laenge) };
  await s.schliessen();
  melde(Math.abs(platz.laenge - 3667.587) <= 0.5, `Strecke ${platz.laenge.toFixed(3)} m (3667.587 ±0.5)`);
}

// ---------------------------------------------------------------- (i) Regression, Bildzeit, Ladezeit
if (teil('i')) {
  console.log('(i) Regression, Bildzeit, Ladezeit');
  if (process.argv.includes('--lang')) {
    // m8f-test ohne (e) (Tacho gegen 0.8e: der Auto-Stil ändert ihn absichtlich; klassisch prüft hier (a)) und ohne (g) (eigene Regression)
    for (const [t, a] of [['getriebe-test.mjs', []], ['lenk-test.mjs', []], ['handbremse-test.mjs', []], ['belag-test.mjs', []], ['rueckwaerts-test.mjs', []],
      ['aufprall-test.mjs', []], ['pacenotes-test.mjs', []], ['menue-test.mjs', []], ['rennablauf-test.mjs', []], ['overlay-test.mjs', []], ['ton-test.mjs', []], ['ton-umgebung-test.mjs', []],
      ['auto-test.mjs', []], ['m8b-test.mjs', []], ['m8c-test.mjs', ['--nur', 'a,b,c,d,e,f,g,h,i,j,k']], ['m8d-test.mjs', []], ['m8e-test.mjs', ['--nur', 'a,b,c,e,f,g,i']],
      ['m8f-test.mjs', ['--nur', 'a,b,c,d,f']]]) {
      const t0 = Date.now(), r = werkzeug(t, a);
      fs.mkdirSync(path.join(os.tmpdir(), 'm8g-regression'), { recursive: true });
      fs.writeFileSync(path.join(os.tmpdir(), 'm8g-regression', `${t.replace('.mjs', '')}.log`), r.text); // (ganze Ausgabe, nicht im Repo)
      melde(r.code === 0, `${t}${a.length ? ` ${a.join(' ')}` : ''}: ${r.code === 0 ? 'bestanden' : `NICHT bestanden: ${r.text.split('\n').filter((z) => /^\s*FEHLER/.test(z)).slice(0, 3).map((z) => z.trim().slice(0, 160)).join(' | ')}`} (${((Date.now() - t0) / 60000).toFixed(1)} min)`);
    }
  } else info('alle bisherigen Tests: nur mit --lang');
  // Bildzeit im Rennen je Auto (kopflos, Software-Grafik), neu und (mit --alt) 0.8f
  const bildzeit = async (wurzel) => {
    const s = await starteSpiel({ wurzel, breite: 640, hoehe: 360 });
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
    await s.schliessen();
    return bz;
  };
  const bz = await bildzeit(WURZEL), basis = bz.rt4.ms;
  melde(Object.values(bz).every((x) => x.calls <= 12 && x.ms < basis * 1.2), `Bildzeit im Spiel 0.8g: ${Object.entries(bz).map(([id, x]) => `${id} ${x.ms.toFixed(0)} ms / ${x.calls} Calls`).join(', ')} (Audan als Bezug, höchstens +20 %)`);
  if (ALT) {
    const ba = await bildzeit(ALT);
    const sa = ALLE.reduce((a, id) => a + ba[id].ms, 0), sn = ALLE.reduce((a, id) => a + bz[id].ms, 0);
    melde(sn <= sa * 1.2, `Bildzeit gegen 0.8f (Summe der fünf Autos): 0.8f ${sa.toFixed(0)} ms, 0.8g ${sn.toFixed(0)} ms (${((sn / sa - 1) * 100).toFixed(1)} %, höchstens +20 %; Streuung im Test-Browser gross)`);
    const r = werkzeug('ladezeit.mjs', [ALT, '9']);
    const med = (n) => +((new RegExp(`${n} .*Median (\\d+)`).exec(r.text) || [])[1]);
    const a = med('alt'), b = med('neu');
    melde(b - a <= 30, `Ladezeit (Median aus 9): 0.8f ${a} ms, 0.8g ${b} ms (${b - a >= 0 ? '+' : ''}${b - a} ms, höchstens +30; Streuung im Test-Browser ca. ±100 ms)`);
  } else info('Ladezeit und Bildzeit gegen 0.8f: nur mit --alt <ordner 0.8f>');
}

console.log(`\n${fehler === 0 ? 'Alle Prüfungen bestanden.' : `${fehler} Prüfung(en) NICHT bestanden.`}${kompromisse ? ` (${kompromisse} Kompromiss(e), siehe docs/meilensteine/m8g.md)` : ''}`);
process.exit(fehler === 0 ? 0 : 1);
