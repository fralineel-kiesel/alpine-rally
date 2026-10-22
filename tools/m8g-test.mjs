// Meilenstein 8g prüfen:  node tools/m8g-test.mjs [--nur a,b,c,d,e,f,g,h,i] [--alt <ordner 0.8f>] [--lang]
//   (a) Tacho KLASSISCH pixelgleich zu 0.8f: fünf Autos (und Prototyp), km/h und mph, direkt gemalt in mehreren
//       Zuständen und im Spiel (HUD-Ausschnitt) in drei Auflösungen
//   (b) Skalen nach Messung: Regel (Begrenzer + 8 %, rot 500 darunter), Nadelstand bei Höchsttempo und Begrenzer,
//       Skalenzahlen ohne Überlappung (Pixelprüfung: jede Zahl vollständig, keine zwei Zahlen berühren sich), Kontraste
//   (c) Schaltlicht je Auto: Schwellen nach Regel, aus darunter, an, Blinken (Hz), aus in N, R und in der Schaltpause, 5. Gang
//   (d) Ladedruck-/Lader-Anzeige folgt dem Wert (Turbo: Ladedruck, Lanza 073: Drehzahl mal Gas), weich; Escorta ohne
//   (e) Gang-Anzeige: 1 bis 5, N, R in allen Stilen sichtbar, verschieden, nichts ausserhalb des Kastens; R rot
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

console.log(`\n${fehler === 0 ? 'Alle Prüfungen bestanden.' : `${fehler} Prüfung(en) NICHT bestanden.`}${kompromisse ? ` (${kompromisse} Kompromiss(e), siehe docs/meilensteine/m8g.md)` : ''}`);
process.exit(fehler === 0 ? 0 : 1);
