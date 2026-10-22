// Meilenstein 8g prüfen:  node tools/m8g-test.mjs [--nur a,b,c,d,e,f,g,h,i] [--alt <ordner 0.8f>] [--lang]
//   (a) Tacho KLASSISCH pixelgleich zu 0.8f: fünf Autos (und Prototyp), km/h und mph, direkt gemalt in mehreren
//       Zuständen und im Spiel (HUD-Ausschnitt) in drei Auflösungen
//   (b) Skalen nach Messung: Regel (Begrenzer + 8 %, rot 500 darunter), Nadelstand bei Höchsttempo und Begrenzer,
//       Skalenzahlen ohne Überlappung (Pixelprüfung: jede Zahl vollständig, keine zwei Zahlen berühren sich), Kontraste
// --alt <ordner 0.8f>: der alte Stand zum Vergleich (git worktree add <ordner> <commit von 0.8f>); ohne --alt gelten
//   die Prüfsummen aus tools/m8g-referenz-08f.json (mit --referenz-schreiben neu schreiben)
// Ich sehe die Bilder, aber ich fahre nicht: ob ein Tacho im Fahren gut lesbar ist, beurteile ich nur an Bildern und Zahlen.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { starteSpiel, WURZEL } from './spiel-browser.mjs';
import { pathToFileURL } from 'node:url';

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
    const text = (tx, x, y, g = 1, f = 'weiss', a = 'links') => P.pixelText(ctx, tx, x, y, g, FARBEN[f] || f, a);
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

console.log(`\n${fehler === 0 ? 'Alle Prüfungen bestanden.' : `${fehler} Prüfung(en) NICHT bestanden.`}${kompromisse ? ` (${kompromisse} Kompromiss(e), siehe docs/meilensteine/m8g.md)` : ''}`);
process.exit(fehler === 0 ? 0 : 1);
