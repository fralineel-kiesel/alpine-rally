// Test für Meilenstein 7b (Umgebungsklänge mit Stereo und Abstand, Menü-Musik, Regler MUSIK):  node tools/ton-umgebung-test.mjs
// Playwright mit Chromium. Nicht gehört, sondern gemessen: Raum-Werte (Pan, Pegel, Tiefpass), Ereignisse (Glocken, Vögel,
// Jubel), offline gerechnete Klänge (OfflineAudioContext, Stereo: Spitze, RMS, Schwerpunkt, Ausklingen) und Zustände im Spiel.
//  (a) Quellen: Herden, Publikum (Start, Ziel, Fan-Spots), Brunnen, Vögel-Tabelle mit jedem Abschnitt aus track.js
//  (b) Raum: Pan links/rechts/vorne, Pegel und Tiefpass nach Abstand, hinten leiser und dumpfer, Vorbeifahrt stetig
//  (c) Kuhglocken  (d) Publikum  (e) Vögel  (f) Brunnen und Böen  (g) Pegel im Mix gegen den Motor
//  (h) Stimmen, Lecks, Pause, Menü still  (i) Musik: Aufbau  (j) Musik: Klang  (k) Musik: Zustände im Spiel
//  (l) Regler MUSIK  (m) Ducking der Musik  (n) Stabilität (Konsole, Bildzeit-Hinweis: tools/m7b-leistung.mjs)
// Dazu: Spektrogramme und Pan-Verlauf nach screenshots/m7b/ und die Messtabelle (tools/m7b-messung.json).

import fs from 'node:fs';
import path from 'node:path';
import { starteSpiel, WURZEL } from './spiel-browser.mjs';

let fehlerZahl = 0;
const pruefe = (ok, text, info = '') => {
  console.log(`  ${ok ? 'OK   ' : 'FEHLER'} ${text}${info ? `  (${info})` : ''}`);
  if (!ok) fehlerZahl++;
};
const AUTOPLAY = ['--autoplay-policy=no-user-gesture-required'];
const BILDER = path.join(WURZEL, 'screenshots/m7b');
fs.mkdirSync(BILDER, { recursive: true });
const A = (p, f, arg) => p.evaluate(f, arg);
const warte = (ms) => new Promise((r) => setTimeout(r, ms));
const r1 = (x) => Math.round(x * 10) / 10;
const messung = {}; // für STAND.md
const fahrerCode = fs.readFileSync(path.join(WURZEL, 'tools/testfahrer-browser.js'), 'utf8');
async function bilderAbwarten(p, n = 3) {
  await p.evaluate((n) => new Promise((r) => { let k = 0; const f = () => (++k >= n ? r() : requestAnimationFrame(f)); requestAnimationFrame(f); }), n);
}
function bildSpeichern(name, dataUrl) { fs.writeFileSync(path.join(BILDER, `${name}.png`), Buffer.from(dataUrl.split(',')[1], 'base64')); }

// Offline-Seite (Ton-Labor als leere Hülle) mit window.__P = tools/umgebung-pruefung.js
async function offlineSeite() {
  const s = await starteSpiel({ breite: 900, hoehe: 700, args: AUTOPLAY });
  await s.page.goto(`${s.url}/ton-labor.html`);
  await A(s.page, async () => { window.__P = await import('/tools/umgebung-pruefung.js'); });
  return s;
}
// Spiel mit Menü, entsperrt (Ton an)
async function ladeSpiel({ adresse = '', entsperren = true, speicher = null } = {}) {
  const spiel = await starteSpiel({ breite: 640, hoehe: 360, args: AUTOPLAY });
  const p = spiel.page;
  await p.addInitScript((sp) => {
    if (!sessionStorage.getItem('leer')) { localStorage.clear(); if (sp) localStorage.setItem('alpineRally.einstellungen', sp); sessionStorage.setItem('leer', '1'); }
  }, speicher);
  await p.goto(`${spiel.url}/index.html${adresse}`);
  await p.waitForFunction(() => window.__alpineRally, null, { timeout: 120000 });
  await bilderAbwarten(p, 3);
  if (entsperren) {
    await p.keyboard.press('Enter');
    await p.waitForFunction(() => { const t = window.__alpineRally.ton; return !t.an || (t.werk && t.werk.aufbau.fertig); }, null, { timeout: 30000 });
  }
  await A(p, (code) => {
    window.__fahrerUrl = URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
    const A = window.__alpineRally;
    const LEER = { gas: 0, bremse: 0, lenkung: 0, handbremse: false, reset: false, debug: false, notes: false, hud: false };
    window.__T = {
      LEER,
      ueberCountdown() { let n = 0; while (A.ablauf.zustand === 'countdown' && n < 2000) { A.rennSchritt(A.SCHRITT, LEER); n++; } return n; },
      bild(e = LEER) { A.rennSchritt(A.SCHRITT, e); A.rennSchritt(A.SCHRITT, e); A.tonBild(1 / 60); },
    };
  }, fahrerCode);
  return spiel;
}

// =====================================================================
console.log('(a) Quellen');
{
  const spiel = await ladeSpiel();
  const p = spiel.page;
  const q = await A(p, async () => {
    const A = window.__alpineRally, Q = A.tonQuellen, C = A.CONFIG;
    const kuehe = A.kuehe.kuehe;
    const herdenNr = new Set(kuehe.map((k) => k.herde));
    const ohneHerde = kuehe.filter((k) => k.herde == null).length;
    const herden = Q.herden.map((h) => {
      let naechste = Infinity;
      for (let i = 0; i < h.kuehe.length; i += 3) naechste = Math.min(naechste, Math.hypot(h.kuehe[i] - h.x, h.kuehe[i + 1] - h.z));
      return { nr: h.nr, anzahl: h.anzahl, r: h.r, naechste, x: h.x, z: h.z };
    });
    // erwartete Orte unabhängig nachgerechnet
    const S = A.strecke, N = A.netz;
    const lage = (s, lat) => { const p = N.etappePunkt(s); return [p.x - p.tz * lat, p.z + p.tx * lat]; };
    const abw = [];
    for (const o of Q.orte) {
      let soll;
      if (o.name === 'start' || o.name === 'ziel') { const m = o.name === 'start' ? S.startS : S.zielS; const pp = A.startZiel.ort(m + C.audio.umgebung.publikum.orte[o.name].von, 0); soll = [pp.x, pp.z]; }
      else { const sp = C.leben.fans.spots.find((x) => x.name === o.name); soll = lage(sp.s[0], sp.seite * (sp.lat[0] + sp.lat[1]) / 2); }
      abw.push({ name: o.name, d: Math.hypot(o.punkte[0] - soll[0], o.punkte[1] - soll[1]), punkte: o.punkte.length / 2, staerke: o.staerke });
    }
    const kreise = A.leben.hindernisse.filter((h) => h.rand === 'brunnen');
    const bruSoll = kreise.length ? [kreise.reduce((a, h) => a + h.x, 0) / kreise.length, kreise.reduce((a, h) => a + h.z, 0) / kreise.length] : null;
    const b = C.leben.wiesenweg.brunnen, bruCfg = lage(b.s, b.seite * b.lat);
    const { TONARTEN } = await import('/js/musikstueck.js');
    return {
      herden, herdenNr: herdenNr.size, ohneHerde, kuehe: kuehe.length, summe: Q.herden.reduce((a, h) => a + h.anzahl, 0), abw,
      brunnen: Q.brunnen, bruD: bruSoll ? Math.hypot(Q.brunnen.x - bruSoll[0], Q.brunnen.z - bruSoll[1]) : null, bruCfgD: Math.hypot(Q.brunnen.x - bruCfg[0], Q.brunnen.z - bruCfg[1]),
      bruStrasse: S.abfrage(Q.brunnen.x, Q.brunnen.z).abstand,
      namen: [...new Set(S.abschnitte.map((a) => a.name))], tabelle: Object.keys(C.audio.umgebung.voegel.dichte), fehlen: Q.voegel.fehlen,
      pass: Q.pass, passCfg: S.abschnitte.filter((a) => a.name === 'Passhöhe').map((a) => [a.von, a.bis]),
    };
  });
  pruefe(q.ohneHerde === 0 && q.summe === q.kuehe && q.herden.length === q.herdenNr, 'jede Kuh gehört zu einer Herde, jede Herde ist eine Quelle',
    `${q.kuehe} Kühe in ${q.herden.length} Herden`);
  pruefe(q.herden.every((h) => h.naechste <= 40 && h.r < 60 && Number.isFinite(h.x)), 'Herden-Mittelpunkt plausibel (nächste Kuh höchstens 40 m, Radius unter 60 m)',
    `Radius ${r1(Math.min(...q.herden.map((h) => h.r)))}–${r1(Math.max(...q.herden.map((h) => h.r)))} m, nächste Kuh höchstens ${r1(Math.max(...q.herden.map((h) => h.naechste)))} m`);
  pruefe(q.abw.length === 5 && q.abw.every((o) => o.d <= 1), 'Start, Ziel, Fan-Spots kehren/pass/alm: Klangpunkte liegen ±1 m an der Strecke',
    q.abw.map((o) => `${o.name} ${o.punkte} Punkte, Stärke ${o.staerke}, Abw. ${o.d.toFixed(2)} m`).join('; '));
  pruefe(q.bruD !== null && q.bruD <= 1, 'Brunnen: Quelle genau am gebauten Brunnen (±1 m)', `Abw. ${q.bruD?.toFixed(2)} m, gegen config.js ${q.bruCfgD.toFixed(2)} m, ${q.bruStrasse.toFixed(1)} m neben der Strasse`);
  pruefe(q.namen.every((n) => q.tabelle.includes(n)) && q.fehlen.length === 0, 'Vögel-Tabelle hat jeden Abschnitt aus track.js', q.namen.join(', '));
  pruefe(q.pass && q.passCfg.length && Math.abs(q.pass.von - q.passCfg[0][0]) < 1, 'Böen: Abschnitt Passhöhe gefunden', `${Math.round(q.pass.von)}–${Math.round(q.pass.bis)} m`);
  messung.quellen = { herden: q.herden.length, kuehe: q.kuehe, orte: q.abw, brunnen: q.brunnen, brunnenStrasse: r1(q.bruStrasse), pass: q.pass };
  pruefe(spiel.fehler.length === 0, 'keine Fehler in der Konsole', spiel.fehler.join(' | '));
  await spiel.schliessen();
}

const off = await offlineSeite();
const P = off.page;

// =====================================================================
console.log('(b) Raum');
{
  const r = await A(P, async () => {
    const { raumWerte, CONFIG } = window.__P;
    const typ = { referenz: 6, radius: 70 }, o = {};
    const w = (qx, qz, yaw = 0) => ({ ...raumWerte(0, 0, yaw, qx, qz, typ, o) });
    // Blick nach +z: rechts = -x
    const links = w(10, 0), rechts = w(-10, 0), vorne = w(0, 10), hinten = w(0, -10);
    const kette = []; for (let d = 0; d <= 80; d += 0.5) kette.push(w(0, d));
    let monoton = true, tpMonoton = true;
    for (let i = 1; i < kette.length; i++) { if (kette[i].gain > kette[i - 1].gain + 1e-9) monoton = false; if (kette[i].tiefpass > kette[i - 1].tiefpass + 1e-6) tpMonoton = false; }
    const bisRef = kette.filter((k) => k.d <= 6).every((k) => Math.abs(k.gain - 1) < 1e-9);
    const abRadius = kette.filter((k) => k.d >= 70).every((k) => k.gain === 0);
    // Vorbeifahrt: 15 m seitlich, 25 m/s, Blick in Fahrtrichtung, 60 Bilder pro Sekunde
    const vb = (seite) => { const z = []; for (let t = 0; t <= 8; t += 1 / 60) { const v = raumWerte(15 * seite, -100 + 25 * t, 0, 0, 0, typ, o); z.push([t, v.pan, v.gain, v.tiefpass]); } return z; };
    const vl = vb(-1), vr = vb(1);
    const sprung = (z) => Math.max(...z.slice(1).map((x, i) => Math.abs(x[1] - z[i][1])));
    const nan = [...vl, ...vr].some((x) => x.some((y) => !Number.isFinite(y)));
    return { links, rechts, vorne, hinten, monoton, tpMonoton, bisRef, abRadius, sprungL: sprung(vl), sprungR: sprung(vr), nan,
      panL: [Math.min(...vl.map((x) => x[1])), Math.max(...vl.map((x) => x[1]))], panR: [Math.min(...vr.map((x) => x[1])), Math.max(...vr.map((x) => x[1]))],
      vl, vr, panStaerke: CONFIG.audio.raum.pan };
  });
  pruefe(r.links.pan < -0.7 && r.rechts.pan > 0.7 && Math.abs(r.vorne.pan) < 1e-6, 'Quelle links: Pan < 0, rechts: Pan > 0, geradeaus 0', `${r.links.pan.toFixed(2)} / ${r.rechts.pan.toFixed(2)} / ${r.vorne.pan.toFixed(2)}`);
  pruefe(r.monoton && r.bisRef && r.abRadius, 'Pegel fällt monoton mit dem Abstand, 1.0 bis zur Referenz, 0 ab dem Radius');
  pruefe(r.tpMonoton && r.vorne.tiefpass > 8000, 'Tiefpass wird mit dem Abstand dumpfer', `10 m ${r.vorne.tiefpass.toFixed(0)} Hz`);
  pruefe(r.hinten.gain < r.vorne.gain * 0.75 && r.hinten.tiefpass <= 2500, 'Quelle hinten: leiser (x0.7) und dumpfer (höchstens 2500 Hz)', `Pegel ${r.hinten.gain.toFixed(2)} gegen ${r.vorne.gain.toFixed(2)}, ${r.hinten.tiefpass.toFixed(0)} Hz`);
  pruefe(!r.nan && r.sprungL < 0.03 && r.sprungR < 0.03 && r.panL[0] < -0.7 && r.panL[1] <= 0.001 && r.panR[1] > 0.7 && r.panR[0] >= -0.001,
    'Vorbeifahrt 15 m, 25 m/s: Pan stetig (kleiner Schritt pro Bild), Quelle links bleibt links (vorne Mitte -> ganz links -> hinten Mitte), rechts ebenso, kein NaN',
    `grösster Schritt ${r.sprungL.toFixed(3)} / ${r.sprungR.toFixed(3)} pro Bild, links ${r.panL.map((x) => x.toFixed(2)).join('..')}, rechts ${r.panR.map((x) => x.toFixed(2)).join('..')}`);
  // Pan-Verlauf als Bild
  const bild = await A(P, ({ vl, vr }) => {
    const c = document.createElement('canvas'); c.width = 760; c.height = 360;
    const x = c.getContext('2d');
    x.fillStyle = '#0d1218'; x.fillRect(0, 0, 760, 360);
    x.font = '13px monospace'; x.fillStyle = '#f4f4ee';
    x.fillText('Vorbeifahrt 90 km/h, 15 m seitlich (Quelle bei 4 s): Pan (oben) und Pegel/Tiefpass (unten)', 10, 18);
    const px = (t) => 50 + t / 8 * 680;
    const pan = (v) => 120 - v * 80, gain = (v) => 330 - v * 110;
    x.strokeStyle = '#44505c'; x.beginPath(); x.moveTo(50, 120); x.lineTo(730, 120); x.moveTo(50, 330); x.lineTo(730, 330); x.moveTo(px(4), 30); x.lineTo(px(4), 340); x.stroke();
    x.fillStyle = '#aab4be'; x.font = '11px monospace';
    x.fillText('rechts +1', 2, 44); x.fillText('Mitte 0', 2, 124); x.fillText('links -1', 2, 204); x.fillText('Pegel 1', 2, 224); x.fillText('0', 30, 334);
    for (let t = 0; t <= 8; t++) x.fillText(`${t} s`, px(t) - 8, 352);
    const linie = (z, i, f, farbe) => { x.strokeStyle = farbe; x.lineWidth = 2; x.beginPath(); z.forEach((p, k) => (k ? x.lineTo(px(p[0]), f(p[i])) : x.moveTo(px(p[0]), f(p[i])))); x.stroke(); };
    linie(vl, 1, pan, '#ff9a2e'); linie(vr, 1, pan, '#5fe35a'); linie(vl, 2, gain, '#ffd23c'); linie(vl, 3, (v) => 330 - v / 9000 * 110, '#8fb4d8');
    x.fillStyle = '#ff9a2e'; x.fillText('Pan, Quelle links', 560, 40); x.fillStyle = '#5fe35a'; x.fillText('Pan, Quelle rechts', 560, 54);
    x.fillStyle = '#ffd23c'; x.fillText('Pegel', 560, 230); x.fillStyle = '#8fb4d8'; x.fillText('Tiefpass (0-9 kHz)', 560, 244);
    return c.toDataURL('image/png');
  }, { vl: r.vl.filter((_, i) => i % 2 === 0), vr: r.vr.filter((_, i) => i % 2 === 0) });
  bildSpeichern('20-pan-verlauf-vorbeifahrt', bild);
  // gerechnet: Brunnen-Plätschern bei der Vorbeifahrt in Stereo (Energie links/rechts wechselt mit)
  const st = await A(P, async () => {
    const P = window.__P;
    const q = P.quellenTest({ brunnen: { x: 0, z: 0 } });
    const r = await P.rendereRaum({ dauer: 8, quellen: q, hoerer: { hx: -15, hz: -100, hyaw: 0 }, bild: (w, t, h) => { h.hz = -100 + 25 * t; } });
    const lr = []; for (let t = 0; t < 8; t += 1) lr.push([P.rmsDb(r.links, t, t + 1), P.rmsDb(r.rechts, t, t + 1)]);
    let sprung = 0; for (let i = 1; i < r.links.length; i++) sprung = Math.max(sprung, Math.abs(r.links[i] - r.links[i - 1]) - 0, Math.abs(r.rechts[i] - r.rechts[i - 1]));
    return { lr, nan: P.miss(r.links).nan + P.miss(r.rechts).nan, sprung };
  });
  // Hörer bei x = -15, Blick +z: rechts ist -x, die Quelle (0,0) liegt also links
  const mitte = st.lr[4];
  pruefe(st.nan === 0 && mitte[0] > mitte[1] + 6 && st.lr[1][0] < mitte[0] - 6, 'gerechnet (Stereo): beim Vorbeifahren links (Seite der Quelle) lauter als rechts, vorher/nachher leiser',
    `RMS links/rechts je Sekunde: ${st.lr.map((x) => `${x[0].toFixed(0)}/${x[1].toFixed(0)}`).join(' ')}`);
}

// =====================================================================
console.log('(c) Kuhglocken');
{
  const r = await A(P, async () => {
    const P = window.__P, G = P.CONFIG.audio.umgebung.kuhglocken;
    const aus = {};
    // Tonhöhen und Ausklingen je Puffer bei tiefster und höchster Tonhöhe (Abspieltempo)
    aus.ausklingen = [];
    for (let k = 0; k < G.klang.length; k++) for (const hz of G.grundton) {
      const r = await P.rendereRaum({ dauer: 1.6, kanaele: 1, quellen: P.quellenTest({}), hoerer: { hx: 0, hz: -6 }, aufbau: (w, c, h) => {
        w.umgebung.aktualisiere(0, 'rennen', h); P.raumWerte(0, -6, 0, 0, 0, G, w.umgebung.raum); w.umgebung.einmal('g', `u-glocke-${k}`, 0.01, hz / 300, G.pegel / 0.9, G);
      } });
      const h = P.huelle(r.mono, -40);
      aus.ausklingen.push({ k, hz, s: h.ausklingen, grund: P.staerksteFrequenz(r.mono, 0.02, 0.4, 150, 500, 1) });
    }
    // Spitze bei 6 m (vorne, ein Kanal) und Schwerpunkt
    const r6 = await P.rendereRaum({ dauer: 1.3, quellen: P.quellenTest({}), hoerer: { hx: 0, hz: -6 }, aufbau: (w, c, h) => {
      w.umgebung.aktualisiere(0, 'rennen', h); P.raumWerte(0, -6, 0, 0, 0, G, w.umgebung.raum); w.umgebung.einmal('g', 'u-glocke-0', 0.01, 1, G.pegel / 0.9, G);
    } });
    aus.spitze6 = P.spitzeDb(r6.links); aus.schwerpunkt = P.schwerpunkt(P.spektrum(r6.links, 0, 1)); aus.spektro = P.spektrogramm(r6.links, 'Kuhglocke (Treichel, 300 Hz) in 6 m', { fMax: 8000 });
    // Takt: 200 Schläge einer Herde (6 grasende Kühe) bei 40 m, ohne zu rechnen (nur Ereignisse)
    const zeit = async (posen, abstand, sek) => {
      const ctx = new OfflineAudioContext(2, 44100, 44100);
      const { baueKlangwerk } = await import('/js/audio.js');
      const w = baueKlangwerk(ctx); w.puffernSofort();
      const kuehe = posen.map((p, i) => [Math.cos(i) * 2, Math.sin(i) * 2, p]);
      w.setzeQuellen(P.quellenTest({ herden: [{ x: 0, z: 0, r: 2, kuehe }] }));
      const h = { hx: 0, hz: -(abstand + 2), hyaw: 0, s: 0, tempo: 0 };
      for (let t = 0; t < sek; t += 1 / 60) w.umgebung.aktualisiere(1 / 60, 'rennen', h);
      const z = w.umgebung.protokoll.filter((e) => e.art === 'glocke').map((e) => e.uhr);
      return { z, n: z.length, still: w.umgebung.zaehler['glocke-still'] || 0, doppel: w.umgebung.zaehler['glocke-doppel'] || 0 };
    };
    const t = await zeit([1, 1, 1, 1, 1, 1], 40, 300);
    const abst = t.z.slice(1).map((x, i) => x - t.z[i]);
    aus.takt = { n: t.n, min: Math.min(...abst), max: Math.max(...abst), mittel: abst.reduce((a, b) => a + b, 0) / abst.length, doppel: t.doppel };
    aus.nah = (await zeit([1, 1, 1, 1, 1, 1], 15, 120)).n / 120;
    aus.fern = (await zeit([1, 1, 1, 1, 1, 1], 40, 120)).n / 120;
    aus.liegend = (await zeit([2, 2, 2, 2, 2, 2], 40, 120)).n;
    aus.grasend = (await zeit([1, 1, 1, 1, 1, 1], 40, 120)).n;
    aus.ausserhalb = (await zeit([1, 1, 1, 1], 75, 60)).n;
    // nur die 2 nächsten Herden (drei Herden 20, 30, 40 m)
    {
      const ctx = new OfflineAudioContext(2, 44100, 44100);
      const { baueKlangwerk } = await import('/js/audio.js');
      const w = baueKlangwerk(ctx); w.puffernSofort();
      w.setzeQuellen(P.quellenTest({ herden: [20, 30, 40].map((d) => ({ x: d, z: 0, r: 0, kuehe: [[d, 0, 1], [d, 0.5, 1]] })) }));
      const h = { hx: 0, hz: 0, hyaw: 0, s: 0, tempo: 0 };
      let maxZugleich = 0;
      for (let t = 0; t < 120; t += 1 / 60) { w.umgebung.aktualisiere(1 / 60, 'rennen', h); maxZugleich = Math.max(maxZugleich, w.umgebung.zustand.herdenAktiv.filter((x) => x >= 0).length); }
      const herden = new Set(w.umgebung.protokoll.filter((e) => e.art === 'glocke').map((e) => Math.floor(e.wert)));
      aus.zweiHerden = { maxZugleich, herden: [...herden] };
    }
    return aus;
  });
  const tief = Math.min(...r.ausklingen.map((a) => a.s)), lang = Math.max(...r.ausklingen.map((a) => a.s));
  const spiel = await ladeSpiel({ entsperren: true });
  const hz = await A(spiel.page, () => window.__alpineRally.ton.werk.umgebung.herdVar.flat().map((v) => v.hz));
  await spiel.schliessen();
  pruefe(hz.every((f) => f >= 220 && f <= 420) && r.ausklingen.every((a) => Math.abs(a.grund - a.hz) / a.hz < 0.03), 'Tonhöhen 220–420 Hz (3 Varianten je Herde, gemessener Grundton = Soll)',
    `${hz.length} Varianten ${Math.round(Math.min(...hz))}–${Math.round(Math.max(...hz))} Hz, gemessen ${r.ausklingen.map((a) => Math.round(a.grund)).join('/')}`);
  pruefe(tief >= 0.5 && lang <= 0.9, 'Ausklingzeit (bis -40 dB) 0.5–0.9 s, alle Varianten bei tiefster und höchster Tonhöhe', `${tief.toFixed(2)}–${lang.toFixed(2)} s`);
  pruefe(r.takt.n >= 160 && r.takt.min >= 0.49 && r.takt.max <= 1.82, 'Abstände der Schläge 0.5–1.8 s (Verteilung über ca. 200 Schläge)',
    `${r.takt.n} Schläge in 300 s, ${r.takt.min.toFixed(2)}–${r.takt.max.toFixed(2)} s, Mittel ${r.takt.mittel.toFixed(2)} s, ${r.takt.doppel} Doppel ("bim-bom")`);
  pruefe(r.nah > r.fern * 1.25, 'näher als 25 m: aufgeschreckt, läutet dichter', `${r.nah.toFixed(2)} gegen ${r.fern.toFixed(2)} Schläge/s (x${(r.nah / r.fern).toFixed(2)})`);
  pruefe(r.ausserhalb === 0, 'ausserhalb des Radius (75 m vor der Herde) kein Schlag');
  pruefe(r.zweiHerden.maxZugleich <= 2 && r.zweiHerden.herden.length === 2 && !r.zweiHerden.herden.includes(2), 'höchstens 2 Herden zugleich (die nächsten)', `Herden ${r.zweiHerden.herden.join(', ')}`);
  pruefe(Math.abs(r.spitze6 + 20) <= 2, 'Spitze einer Glocke bei 6 m ca. -20 dBFS (LAUTSTÄRKE 100 %)', `${r.spitze6.toFixed(1)} dBFS`);
  pruefe(r.schwerpunkt < 1500, 'Spektralschwerpunkt tief (unter 1500 Hz): dumpf, kein Glöckchen', `${Math.round(r.schwerpunkt)} Hz`);
  pruefe(r.liegend < r.grasend * 0.25, 'liegende Kühe läuten kaum', `${r.liegend} gegen ${r.grasend} Schläge in 120 s`);
  messung.glocken = { spitze6: r1(r.spitze6), schwerpunkt: Math.round(r.schwerpunkt), ausklingen: [tief, lang].map((x) => Math.round(x * 100) / 100), mittelAbstand: Math.round(r.takt.mittel * 100) / 100 };
  bildSpeichern('10-kuhglocke', r.spektro);
}

// =====================================================================
console.log('(d) Publikum');
{
  const r = await A(P, async () => {
    const P = window.__P, Pu = P.CONFIG.audio.umgebung.publikum, aus = {};
    // Schleife nahtlos (Puffer), mit dem Pegel in 10 m
    const b = P.pufferDaten('u-gemurmel'), d = b.daten, k = Pu.gemurmel.pegel / P.SCHLEIFE_RMS * 0.7071;
    let nachbar = 0; for (let i = 1; i < b.ende; i++) nachbar = Math.max(nachbar, Math.abs(d[i] - d[i - 1]));
    aus.naht = Math.abs(d[0] - d[b.ende - 1]) * k; aus.nachbar = nachbar * k; aus.nahtRoh = Math.abs(d[0] - d[b.ende - 1]); aus.dauer = b.ende / b.rate;
    const o = { name: 'start', punkte: [0, 0] };
    const rm = await P.rendereRaum({ dauer: 6, quellen: P.quellenTest({ orte: [o] }), hoerer: { hx: 0, hz: -10 } });
    aus.rms10 = P.rmsDb(rm.links, 1, 6); aus.spektroMurmel = P.spektrogramm(rm.links.slice(0, 44100 * 5), 'Gemurmel (Publikum) in 10 m', { fMax: 8000 });
    const r79 = await P.rendereRaum({ dauer: 2, quellen: P.quellenTest({ orte: [o] }), hoerer: { hx: 0, hz: -70 } });
    const r81 = await P.rendereRaum({ dauer: 2, quellen: P.quellenTest({ orte: [o] }), hoerer: { hx: 0, hz: -81 } });
    aus.rms79 = P.rmsDb(r79.links, 1, 2); aus.rms81 = P.rmsDb(r81.links, 1, 2);
    // Jubel kurz / lang und Klatschen in 10 m (ohne Gemurmel)
    const ziel = { name: 'ziel', punkte: [0, 0], murmeln: false };
    for (const [art, sek] of [['kurz', 3], ['lang', 6]]) {
      const r = await P.rendereRaum({ dauer: sek, quellen: P.quellenTest({ orte: [ziel] }), hoerer: { hx: 0, hz: -10 }, aufbau: (w, c, h) => { w.umgebung.aktualisiere(0, 'rennen', h); w.umgebung.jubel('ziel', art); } });
      aus[`jubel_${art}`] = { spitze: P.spitzeDb(r.links), rms: P.rmsDb(r.links, 0.3, sek * 0.6), dauer: P.huelle(r.links, -30).ausklingen, schwer: P.schwerpunkt(P.spektrum(r.links)) };
      aus[`spektro_${art}`] = P.spektrogramm(r.links, `Jubel ${art} in 10 m (Rauschen mit Formanten, Rufe, Klatschen)`, { fMax: 8000 });
    }
    const rk = await P.rendereRaum({ dauer: 2.6, quellen: P.quellenTest({ orte: [ziel] }), hoerer: { hx: 0, hz: -10 }, aufbau: (w, c, h) => { w.umgebung.aktualisiere(0, 'rennen', h); w.umgebung.klatschen('ziel'); } });
    aus.klatschen = { spitze: P.spitzeDb(rk.links), rms: P.rmsDb(rk.links, 0.3, 1.2) };
    // Klatscher pro Sekunde: Puffer-Info und gezählte Einsätze (Hüllkurve je 2 ms steigt steil an)
    const kp = P.pufferDaten('u-klatschen'), kb = kp.daten, fen = Math.round(kp.rate * 0.002); // (Puffer mit eigener Abtastrate)
    let einsaetze = 0, vor = 0;
    for (let i = 0; i + fen < kb.length * 0.5; i += fen) { let q = 0; for (let j = i; j < i + fen; j++) q = Math.max(q, Math.abs(kb[j])); if (q > vor * 1.8 && q > 0.05) einsaetze++; vor = q; }
    aus.klatschRateGezaehlt = einsaetze / (kb.length * 0.5 / kp.rate);
    const ctx = new OfflineAudioContext(1, 44100, 44100);
    const { umgebungRezepte } = await import('/js/umgebung.js');
    const { zufall } = await import('/js/util.js');
    const rz = umgebungRezepte(44100, zufall(P.CONFIG.audio.umgebung.seed + 2));
    aus.klatschRaten = rz.filter(([n]) => n.startsWith('u-jubel') || n === 'u-klatschen').map(([n, f]) => { const x = f(); return [n, x.info.klatschRate, x.info.klatscher]; });
    return aus;
  });
  pruefe(r.naht < 0.01 && r.naht <= r.nachbar, 'Gemurmel-Schleife nahtlos (Sprung am Nahtpunkt unter 0.01, nicht grösser als zwischen zwei normalen Samples)',
    `${r.naht.toFixed(5)} bei 10 m (grösster normaler Sprung ${r.nachbar.toFixed(4)}), Schleife ${r.dauer.toFixed(2)} s`);
  pruefe(Math.abs(r.rms10 + 36) <= 2, 'Gemurmel in 10 m: RMS ca. -36 dBFS', `${r.rms10.toFixed(1)} dBFS`);
  pruefe(r.rms79 > -65 && r.rms81 < -110, 'Gemurmel hörbar bis ca. 80 m (70 m noch hörbar, die letzten 15 % weich aus), darüber still', `70 m ${r.rms79.toFixed(1)} dBFS, 81 m ${r.rms81 < -150 ? 'still' : r.rms81.toFixed(1)}`);
  pruefe(Math.abs(r.jubel_kurz.spitze + 18) <= 2, 'Jubel kurz: Spitze in 10 m ca. -18 dBFS, Dauer 1.5–3 s', `${r.jubel_kurz.spitze.toFixed(1)} dBFS, RMS ${r.jubel_kurz.rms.toFixed(1)}, ${r.jubel_kurz.dauer.toFixed(1)} s`);
  pruefe(r.jubel_kurz.dauer >= 1.5 && r.jubel_kurz.dauer <= 3.1 && r.jubel_lang.dauer >= 4 && r.jubel_lang.dauer <= 5.6, 'Jubel lang ca. 5 s', `${r.jubel_lang.dauer.toFixed(1)} s, Spitze ${r.jubel_lang.spitze.toFixed(1)} dBFS`);
  pruefe(Math.abs(r.klatschen.rms + 28) <= 2.5, 'Klatschen (eigener Ausbruch am Ziel): RMS ca. -28 dBFS in 10 m', `RMS ${r.klatschen.rms.toFixed(1)}, Spitze ${r.klatschen.spitze.toFixed(1)} dBFS`);
  pruefe(r.klatschRaten.every(([, k]) => k >= 25 && k <= 40) && r.klatschRateGezaehlt >= 20 && r.klatschRateGezaehlt <= 45, 'Klatschen: 25–40 Klatscher pro Sekunde (in jeder Jubel-Welle und im Ausbruch)',
    `${r.klatschRaten.map(([n, k]) => `${n} ${k.toFixed(1)}/s`).join(', ')}; gezählt ${r.klatschRateGezaehlt.toFixed(1)}/s`);
  messung.publikum = { gemurmel10: r1(r.rms10), jubelKurz: r1(r.jubel_kurz.spitze), jubelKurzRms: r1(r.jubel_kurz.rms), jubelLang: r1(r.jubel_lang.spitze), klatschenRms: r1(r.klatschen.rms), klatschenSpitze: r1(r.klatschen.spitze) };
  bildSpeichern('11-gemurmel', r.spektroMurmel); bildSpeichern('12-jubel-kurz', r.spektro_kurz); bildSpeichern('13-jubel-lang', r.spektro_lang);

  // im Spiel: GO, Fan-Spot einmal pro Durchfahrt, Ziellinie, neue Bestzeit
  const spiel = await ladeSpiel();
  const p = spiel.page;
  const g = await A(p, async () => {
    const A = window.__alpineRally, w = A.ton.werk, U = w.umgebung;
    A.anhalten = true;
    A.start();
    A.tonBild(1 / 60); // (im Spiel läuft der Countdown 3 s mit Ton; hier wird er übersprungen)
    const z = () => ({ ...U.zaehler });
    const vorGo = z();
    window.__T.ueberCountdown(); A.tonBild(1 / 60);
    const go = z();
    // Fan-Spot "kehren": Auto fährt durch (s steigt), einmal; zurück und gleich wieder (unter 20 s): kein zweites Mal; nach 20 s wieder
    const O = A.tonQuellen.orte.find((o) => o.name === 'kehren');
    const h = { hx: 0, hz: 0, hyaw: 0, s: O.sVon - 40, tempo: 25 };
    const fahre = (von, bis, sek) => { const n = Math.round(sek * 60); for (let k = 0; k <= n; k++) { h.s = von + (bis - von) * k / n; U.aktualisiere(1 / 60, 'rennen', h); } };
    fahre(O.sVon - 40, O.sBis + 20, 4); const eins = U.zaehler['jubel-kurz'] || 0;
    fahre(O.sBis + 20, O.sVon - 40, 0.1); fahre(O.sVon - 40, O.sBis + 20, 4); const zwei = U.zaehler['jubel-kurz'] || 0;
    fahre(O.sBis + 20, O.sBis + 21, 15); fahre(O.sVon - 40, O.sVon - 39, 0.2); fahre(O.sVon - 40, O.sBis + 20, 4); const drei = U.zaehler['jubel-kurz'] || 0;
    // Sprung (R) mitten in den Bereich: zählt nicht als Durchfahrt
    fahre(O.sBis + 200, O.sBis + 201, 25); h.s = O.sVon + 5; U.aktualisiere(1 / 60, 'rennen', h); const sprung = U.zaehler['jubel-kurz'] || 0;
    // Ziellinie: Auto 20 m davor, alle Checkpoints erledigt, mit Gas über die Linie
    const ziel = async (zeit) => {
      A.setzeAuf(A.strecke.zielS - 20);
      A.rennen.zustand = 'laeuft'; A.rennen.naechsterCp = A.checkpoints.length; A.rennen.zeit = zeit;
      const vor = z();
      let n = 0;
      while (A.rennen.zustand !== 'ziel' && n++ < 3000) window.__T.bild({ ...window.__T.LEER, gas: 1 });
      const linie = z();
      while (A.ablauf.zustand !== 'ziel' && n++ < 6000) window.__T.bild();
      A.tonBild(1 / 60);
      const schirm = z();
      return { vor, linie, schirm, neueBest: A.lauf.ergebnis && A.lauf.ergebnis.neueBest, musik: A.ton.werk.musik.status() };
    };
    const erst = await ziel(300);
    A.neuStarten(); window.__T.ueberCountdown();
    const zweit = await ziel(100);
    return { vorGo, go, eins, zwei, drei, sprung, erst, zweit };
  });
  const d = (a, b, k) => (b[k] || 0) - (a[k] || 0);
  pruefe(d(g.vorGo, g.go, 'jubel-go') === 1, 'Start: Jubel bei GO (genau einmal)');
  pruefe(g.eins === 1 && g.zwei === 1 && g.drei === 2 && g.sprung === 2, 'Fan-Spot: Jubel einmal pro Durchfahrt, nicht öfter als alle 20 s, kein Jubel bei einem Sprung (R) in den Bereich', `${g.eins} / ${g.zwei} / ${g.drei} / ${g.sprung}`);
  pruefe(d(g.erst.vor, g.erst.linie, 'jubel-ziel') === 1 && d(g.erst.vor, g.erst.linie, 'klatschen') === 1 && d(g.zweit.vor, g.zweit.linie, 'jubel-ziel') === 1,
    'Ziellinie: kräftiger Jubel und Klatschen (mit der kurzen Fanfare), bei jedem Lauf');
  pruefe(!g.erst.neueBest && d(g.erst.vor, g.erst.schirm, 'jubel-lang') === 0 && g.zweit.neueBest && d(g.zweit.vor, g.zweit.schirm, 'jubel-lang') === 1,
    'langer Jubel nur bei fanfare(true) (neue Bestzeit)', `1. Lauf neue Bestzeit ${g.erst.neueBest}, 2. Lauf ${g.zweit.neueBest}`);
  messung.zielMusik = { ohneBest: g.erst.musik.zielIn, mitBest: g.zweit.musik.zielIn };
  pruefe(spiel.fehler.length === 0, 'keine Fehler in der Konsole', spiel.fehler.join(' | '));
  await spiel.schliessen();
}

// =====================================================================
console.log('(e) Vögel');
{
  const spiel = await ladeSpiel({ entsperren: false });
  const q = await A(spiel.page, () => {
    const Q = window.__alpineRally.tonQuellen, S = window.__alpineRally.strecke;
    const ab = S.abschnitte.map((a) => ({ name: a.name, von: a.von, bis: a.bis }));
    let sprung = 0; for (let m = 1; m < Q.voegel.dichte.length; m++) sprung = Math.max(sprung, Math.abs(Q.voegel.dichte[m] - Q.voegel.dichte[m - 1]));
    return { dichte: Array.from(Q.voegel.dichte), ab, sprung };
  });
  await spiel.schliessen();
  const r = await A(P, async ({ dichte, ab }) => {
    const P = window.__P, V = P.CONFIG.audio.umgebung.voegel;
    const { baueKlangwerk } = await import('/js/audio.js');
    const zaehle = async (s, tempo, sek) => {
      const ctx = new OfflineAudioContext(2, 44100, 44100);
      const w = baueKlangwerk(ctx); w.puffernSofort();
      const q = P.quellenTest({}); q.voegel.dichte = Float32Array.from(dichte);
      w.setzeQuellen(q);
      const h = { hx: 0, hz: 0, hyaw: 0, s, tempo };
      for (let t = 0; t < sek; t += 1 / 60) w.umgebung.aktualisiere(1 / 60, tempo ? 'rennen' : 'countdown', h);
      return { n: w.umgebung.zaehler.vogel || 0, arten: new Set(w.umgebung.protokoll.filter((e) => e.art === 'vogel').map((e) => e.wert)).size };
    };
    const mittel = (V.abstand[0] + V.abstand[1]) / 2, je = [];
    for (const a of ab) {
      const s = (a.von + a.bis) / 2, soll = V.dichte[a.name], ist = await zaehle(s, 0, 600);
      je.push({ name: a.name, soll, ist: ist.n / 600 * mittel, n: ist.n });
    }
    const still = await zaehle((ab.find((a) => a.name === 'Talabschnitt').von + ab.find((a) => a.name === 'Talabschnitt').bis) / 2, 0, 300);
    const schnell = await zaehle((ab.find((a) => a.name === 'Talabschnitt').von + ab.find((a) => a.name === 'Talabschnitt').bis) / 2, 25, 300);
    // Tonhöhe und Dauer je Art (Puffer), Spitze bei 15 m
    const arten = [];
    for (let k = 0; k < 8; k++) {
      const b = P.pufferDaten(`u-vogel-${k}`), sp = P.spektrum(b.daten);
      arten.push({ k, dauer: P.VOGEL_DAUER[k], anteil: 1 - P.anteilUeber(sp, 5200) - (1 - P.anteilUeber(sp, 1900)), max: P.staerksteFrequenz(b.daten, 0, b.dauer, 1500, 6000, 25) });
    }
    const r15 = await P.rendereRaum({ dauer: 0.5, quellen: P.quellenTest({}), hoerer: { hx: 0, hz: -15 }, aufbau: (w, c, h) => {
      w.umgebung.aktualisiere(0, 'rennen', h); P.raumWerte(0, -15, 0, 0, 0, V, w.umgebung.raum); w.umgebung.einmal('v', 'u-vogel-0', 0.02, 1, V.pegel / 0.9, V);
    } });
    // Spektrogramm: alle 8 Rufe nacheinander in 15 m
    const rs = await P.rendereRaum({ dauer: 4.2, kanaele: 1, quellen: P.quellenTest({}), hoerer: { hx: 0, hz: -15 }, aufbau: (w, c, h) => {
      w.umgebung.aktualisiere(0, 'rennen', h); P.raumWerte(0, -15, 0, 0, 0, V, w.umgebung.raum);
      for (let k = 0; k < 8; k++) w.umgebung.einmal('v', `u-vogel-${k}`, 0.1 + k * 0.5, 1, V.pegel / 0.9, V);
    } });
    return { je, still: still.n, schnell: schnell.n, arten, spitze15: P.spitzeDb(r15.links), variantenGehoert: still.arten, spektro: P.spektrogramm(rs.mono, 'Vogelrufe: 8 Arten nacheinander in 15 m', { fMax: 8000 }) };
  }, { dichte: q.dichte, ab: q.ab });
  const ok = r.je.every((a) => (a.soll === 0 ? a.n === 0 : Math.abs(a.ist / a.soll - 1) <= 0.2));
  pruefe(ok, 'Dichte je Abschnitt wie in der Tabelle (600 s je Abschnitt, feste Zufallsfolge, ±20 %)', r.je.map((a) => `${a.name} ${a.soll} -> ${a.ist.toFixed(2)}`).join(', '));
  pruefe(r.je.filter((a) => a.name.startsWith('Felswand')).every((a) => a.n === 0), 'Felswand: keine Rufe');
  pruefe(q.sprung <= 1 / 40 + 1e-6, 'Übergänge an den Abschnittsgrenzen weich (40 m, kein Sprung)', `grösste Änderung ${q.sprung.toFixed(3)} pro Meter`);
  pruefe(r.arten.length === 8 && r.arten.every((a) => a.anteil > 0.9 && a.max >= 2000 && a.max <= 5000), '8 Arten, Tonhöhe 2–5 kHz', r.arten.map((a) => `${a.max} Hz`).join(', '));
  pruefe(r.arten.every((a) => a.dauer >= 0.06 && a.dauer <= 0.25), 'Dauer 60–250 ms', r.arten.map((a) => `${Math.round(a.dauer * 1000)}`).join('/') + ' ms');
  pruefe(r.schnell < r.still * 0.8, 'mit Tempo weniger Rufe (90 km/h)', `${r.still} im Stand gegen ${r.schnell} in 300 s`);
  pruefe(Math.abs(r.spitze15 + 26) <= 2, 'Spitze bei 15 m ca. -26 dBFS', `${r.spitze15.toFixed(1)} dBFS`);
  pruefe(r.variantenGehoert === 8, 'alle 8 Arten kommen im Spiel vor', `${r.variantenGehoert}`);
  messung.voegel = { spitze15: r1(r.spitze15), je: r.je.map((a) => [a.name, a.soll, Math.round(a.ist * 100) / 100]) };
  bildSpeichern('14-vogelrufe', r.spektro);
}

// =====================================================================
console.log('(f) Brunnen und Böen');
{
  const r = await A(P, async () => {
    const P = window.__P, B = P.CONFIG.audio.umgebung.brunnen, U = P.CONFIG.audio.umgebung;
    const q = P.quellenTest({ brunnen: { x: 0, z: 0 } });
    const bei = async (d) => P.rmsDb((await P.rendereRaum({ dauer: 1.5, quellen: q, hoerer: { hx: 0, hz: -d } })).links, 0.5, 1.5);
    const aus = { r4: await bei(4), r31: await bei(31), r59: await bei(59), r61: await bei(61) };
    const bb = P.pufferDaten('u-brunnen'), b = bb.daten;
    let nachbar = 0; for (let i = 1; i < bb.ende; i++) nachbar = Math.max(nachbar, Math.abs(b[i] - b[i - 1]));
    aus.naht = Math.abs(b[0] - b[bb.ende - 1]); aus.nachbar = nachbar; aus.nahtPegel = aus.naht * B.pegel / P.SCHLEIFE_RMS * 0.7071;
    const rb = await P.rendereRaum({ dauer: 4, kanaele: 1, quellen: q, hoerer: { hx: 0, hz: -4 } });
    aus.spektroB = P.spektrogramm(rb.mono, 'Brunnen (Plätschern und Tropfen) in 4 m', { fMax: 8000 });
    // Böen: Stärke nach Abschnitt, tempo-unabhängig, RMS
    const pass = { von: 1000, bis: 1300 };
    const ctx = new OfflineAudioContext(2, 44100, 44100);
    const { baueKlangwerk } = await import('/js/audio.js');
    const w = baueKlangwerk(ctx); w.puffernSofort(); w.setzeQuellen(P.quellenTest({ pass }));
    aus.staerke = [900, 919, 940, 960, 1000, 1150, 1300, 1340, 1380, 1400].map((s) => [s, w.umgebung.passStaerke(s)]);
    const h = { hx: 0, hz: 0, hyaw: 0, s: 1150, tempo: 0 };
    w.umgebung.aktualisiere(1 / 60, 'rennen', h); const p0 = w.umgebung.zustand.boePegel;
    h.tempo = 40; w.umgebung.aktualisiere(1 / 60, 'rennen', h); const p40 = w.umgebung.zustand.boePegel;
    aus.tempo = [p0, p40];
    const rw = await P.rendereRaum({ dauer: 60, quellen: P.quellenTest({ pass }), hoerer: { hx: 0, hz: 0, s: 1150 } });
    aus.boeRms = Math.max(P.rmsDb(rw.links, 1, 60), P.rmsDb(rw.rechts, 1, 60));
    const fen = []; for (let t = 1; t < 59; t += 0.5) fen.push(P.rmsDb(rw.links, t, t + 0.5));
    aus.boeSpanne = Math.max(...fen) - Math.min(...fen);
    // L/R unabhängig (Korrelation klein)
    let lr = 0, ll = 0, rr = 0; for (let i = 44100; i < rw.links.length; i += 3) { lr += rw.links[i] * rw.rechts[i]; ll += rw.links[i] ** 2; rr += rw.rechts[i] ** 2; }
    aus.korrelation = lr / Math.sqrt(ll * rr);
    aus.spektroW = P.spektrogramm(rw.links.slice(0, 44100 * 30), 'Windböen Passhöhe (30 s, linker Kanal)', { fMax: 4000 });
    const rauss = await P.rendereRaum({ dauer: 3, quellen: P.quellenTest({ pass }), hoerer: { hx: 0, hz: 0, s: 1500 } });
    aus.ausserhalb = P.rmsDb(rauss.links, 1, 3);
    return aus;
  });
  pruefe(Math.abs(r.r4 + 38) <= 2 && r.r59 > -90 && r.r61 < -110, 'Brunnen: RMS ca. -38 dBFS bei 4 m, hörbar bis 60 m, darüber still', `4 m ${r.r4.toFixed(1)}, 31 m (Strasse) ${r.r31.toFixed(1)}, 59 m ${r.r59.toFixed(1)}, 61 m ${r.r61 < -150 ? 'still' : r.r61.toFixed(1)} dBFS`);
  pruefe(r.nahtPegel < 0.01 && r.naht <= r.nachbar, 'Brunnen-Schleife nahtlos', `Sprung ${r.nahtPegel.toFixed(5)} (Puffer ${r.naht.toFixed(4)}, normal bis ${r.nachbar.toFixed(4)})`);
  const st = Object.fromEntries(r.staerke);
  pruefe(st[1000] === 1 && st[1150] === 1 && st[1300] === 1 && st[900] === 0 && st[919] < 0.01 && Math.abs(st[960] - 0.5) < 0.01 && st[1340] > 0.4 && st[1380] === 0 && st[1400] === 0,
    'Böen folgen dem Abschnitt Passhöhe: voll innen, 80 m weich ein und aus, ausserhalb 0', r.staerke.map(([s, w]) => `${s}:${w.toFixed(2)}`).join(' '));
  pruefe(r.tempo[0] === r.tempo[1] && r.tempo[0] > 0, 'Böen unabhängig vom Tempo (Stand = 40 m/s)');
  pruefe(Math.abs(r.boeRms + 30) <= 2 && r.boeSpanne > 6 && r.ausserhalb < -110, 'Böen: RMS ca. -30 dBFS bei voller Stärke, schwankt deutlich (Böen), ausserhalb still',
    `${r.boeRms.toFixed(1)} dBFS, Schwankung ${r.boeSpanne.toFixed(1)} dB, Korrelation L/R ${r.korrelation.toFixed(2)}`);
  pruefe(Math.abs(r.korrelation) < 0.3, 'Böen breit (links und rechts unabhängig, kein Pan)');
  messung.brunnen = { r4: r1(r.r4), r31: r1(r.r31) }; messung.boeen = { rms: r1(r.boeRms), spanne: r1(r.boeSpanne) };
  bildSpeichern('15-brunnen', r.spektroB); bildSpeichern('16-boeen', r.spektroW);
}

// =====================================================================
console.log('(g) Pegel im Mix gegen den Motor');
{
  const r = await A(P, async () => {
    const P = window.__P, U = P.CONFIG.audio.umgebung, aus = {};
    const motor = P.zustand({ drehzahl: 5000, gas: 1, gang: 3, tempo: 25, vVor: 25 });
    const quellen = () => P.quellenTest({ herden: [{ x: 0, z: 0, r: 0, kuehe: [[0, 0, 1], [0, 1, 1], [1, 0, 1], [1, 1, 1], [0, 2, 1], [2, 0, 1]] }],
      orte: [{ name: 'ziel', punkte: [0, 0] }], brunnen: { x: 0, z: 0 }, dichte: 2, pass: { von: 0, bis: 4000 } });
    const kanal = (r, a, b) => Math.max(P.rmsDb(r.links, a, b), P.rmsDb(r.rechts, a, b));
    const nur = await P.rendereRaum({ dauer: 3, zustand: motor, quellen: P.quellenTest({}), limiter: true });
    aus.motor = kanal(nur, 0.5, 3);
    // einzelne Klangarten an ihrer Referenz (ohne Motor): RMS über die aktive Zeit
    const einzel = {};
    const sp = (w, h, name, typ, pegel, tempo = 1) => { P.raumWerte(h.hx, h.hz, 0, 0, 0, typ, w.umgebung.raum); w.umgebung.einmal('x', name, 0.02, tempo, pegel, typ); };
    const fall = async (name, aufbau, dauer, abstand, q = P.quellenTest({})) => {
      const r = await P.rendereRaum({ dauer, quellen: q, hoerer: { hx: 0, hz: -abstand, s: 100 }, aufbau: (w, c, h) => { w.umgebung.aktualisiere(0, 'rennen', h); if (aufbau) aufbau(w, h); } });
      einzel[name] = { rms: kanal(r, 0.02, dauer), spitze: Math.max(P.spitzeDb(r.links), P.spitzeDb(r.rechts)) };
    };
    await fall('Kuhglocke (6 m)', (w, h) => sp(w, h, 'u-glocke-0', U.kuhglocken, U.kuhglocken.pegel / 0.9), 0.8, 6);
    await fall('Gemurmel (10 m)', null, 4, 10, P.quellenTest({ orte: [{ name: 'start', punkte: [0, 0] }] }));
    await fall('Jubel kurz (10 m)', (w) => w.umgebung.jubel('ziel', 'ziel'), 2.2, 10, P.quellenTest({ orte: [{ name: 'ziel', punkte: [0, 0], murmeln: false }] }));
    await fall('Jubel lang (10 m)', (w) => w.umgebung.jubel('ziel', 'lang'), 4, 10, P.quellenTest({ orte: [{ name: 'ziel', punkte: [0, 0], murmeln: false }] }));
    await fall('Klatschen (10 m)', (w) => w.umgebung.klatschen('ziel'), 1.4, 10, P.quellenTest({ orte: [{ name: 'ziel', punkte: [0, 0], murmeln: false }] }));
    await fall('Vogel (15 m)', (w, h) => sp(w, h, 'u-vogel-0', U.voegel, U.voegel.pegel / 0.9), 0.14, 15);
    await fall('Brunnen (4 m)', null, 3, 4, P.quellenTest({ brunnen: { x: 0, z: 0 } }));
    const bo = await P.rendereRaum({ dauer: 30, quellen: P.quellenTest({ pass: { von: 0, bis: 4000 } }), hoerer: { hx: 0, hz: 0, s: 100 } });
    einzel['Böen (voll)'] = { rms: kanal(bo, 1, 30), spitze: Math.max(P.spitzeDb(bo.links), P.spitzeDb(bo.rechts)) };
    aus.einzel = einzel;
    // alles zugleich mit dem Motor, Hörer nah an allem; Jubel, Klatschen, Glocken, Vögel ausgelöst
    const alle = await P.rendereRaum({ dauer: 6, zustand: motor, quellen: quellen(), limiter: true, hoerer: { hx: 0, hz: -5, s: 100 }, aufbau: (w, c, h) => {
      w.umgebung.aktualisiere(0, 'rennen', h); w.umgebung.jubel('ziel', 'lang'); w.umgebung.jubel('ziel', 'ziel'); w.umgebung.klatschen('ziel');
      w.aufprall(16, 1); w.fanfare(false);
    } });
    aus.spitzeAlle = Math.max(P.spitzeDb(alle.links), P.spitzeDb(alle.rechts));
    aus.reduktion = alle.werk.busse.limiter.reduction;
    // pumpt der Limiter dauerhaft? Motor-Fenster nach dem Aufprall (ab 1.5 s) gegen Motor allein
    const fen = []; for (let t = 1.5; t < 5.5; t += 0.5) fen.push(kanal(alle, t, t + 0.5) - aus.motor);
    aus.pumpen = Math.min(...fen);
    return aus;
  });
  const zuLaut = Object.entries(r.einzel).filter(([, v]) => v.rms > r.motor - 6);
  pruefe(zuLaut.length === 0, 'kein Umgebungsklang im RMS lauter als Motor - 6 dB (Motor 5000/min Vollgas)',
    `Motor ${r.motor.toFixed(1)} dBFS; ${Object.entries(r.einzel).map(([k, v]) => `${k} ${v.rms.toFixed(1)}`).join(', ')}`);
  pruefe(r.spitzeAlle < 20 * Math.log10(0.98), 'alles zugleich (Motor, alle Umgebungsklänge, harter Aufprall, Fanfare): Spitze unter 0.98', `${(10 ** (r.spitzeAlle / 20)).toFixed(3)}`);
  pruefe(r.pumpen > -1.5, 'Limiter pumpt nicht dauerhaft (Mix nach dem Aufprall nie mehr als 1.5 dB unter dem Motor allein)', `${r.pumpen.toFixed(2)} dB, Reduktion am Ende ${r.reduktion.toFixed(1)} dB`);
  messung.mix = { motor: r1(r.motor), einzel: Object.fromEntries(Object.entries(r.einzel).map(([k, v]) => [k, { rms: r1(v.rms), spitze: r1(v.spitze), gegenMotor: r1(v.rms - r.motor) }])), spitzeAlle: Math.round(10 ** (r.spitzeAlle / 20) * 1000) / 1000 };
}

// =====================================================================
console.log('(h) Stimmen, Lecks, Pause, Menü');
{
  const r = await A(P, async () => {
    const P = window.__P;
    const ctx = new AudioContext();
    const { baueKlangwerk } = await import('/js/audio.js');
    const w = baueKlangwerk(ctx); w.puffernSofort(); w.lautstaerke(0);
    w.setzeQuellen(P.quellenTest({ herden: [{ x: 0, z: 0, r: 0, kuehe: [[0, 0, 1], [1, 1, 1]] }], orte: [{ name: 'ziel', punkte: [0, 0] }], brunnen: { x: 0, z: 0 }, dichte: 50, pass: { von: 0, bis: 4000 } }));
    const h = { hx: 0, hz: -8, hyaw: 0, s: 100, tempo: 0 };
    let maxU = 0;
    for (let k = 0; k < 600; k++) {
      w.umgebung.aktualisiere(1 / 60, 'rennen', h);
      if (k % 10 === 0) { w.umgebung.jubel('ziel', 'lang'); w.umgebung.klatschen('ziel'); }
      maxU = Math.max(maxU, w.umgebung.stimmen);
    }
    // Aufprall und Fanfare mitten im Umgebungs-Stress: haben ihre eigenen Stimmen
    const vorher = w.stimmen;
    w.aufprall(16, 1); w.fanfare(false); w.checkpoint(-1);
    const nachher = w.stimmen, umgebungDabei = w.umgebung.stimmen;
    const belegt = w.stimmenListe.filter((s) => s.an).map((s) => s.art);
    // Pause: gedämpft (Tiefpass, leiser), nichts Neues
    const vorP = { ...w.umgebung.zaehler };
    const zP = { ...P.zustand({}), modus: 'pause', musikModus: 'pause', ...h };
    for (let k = 0; k < 120; k++) w.aktualisiere(1 / 60, zP);
    await new Promise((r) => setTimeout(r, 400));
    const pause = { filter: w.busse.umgFilter.frequency.value, pegel: w.busse.umgPause.gain.value, neu: Object.keys(w.umgebung.zaehler).filter((k) => w.umgebung.zaehler[k] !== vorP[k]), murmel: w.umgebung.zustand.murmelPegel[0] };
    // Menü / Titel / Demo: still
    const zM = { ...P.zustand({}), modus: 'aus', musikModus: 'menue', ...h };
    for (let k = 0; k < 120; k++) w.aktualisiere(1 / 60, zM);
    const vorM = { ...w.umgebung.zaehler };
    for (let k = 0; k < 600; k++) w.aktualisiere(1 / 60, zM);
    await new Promise((r) => setTimeout(r, 500));
    const menue = { neu: Object.keys(w.umgebung.zaehler).filter((k) => w.umgebung.zaehler[k] !== vorM[k]).length, stimmen: w.umgebung.stimmen,
      gains: [w.umgebung.knoten.murmel[0].g.gain.value, w.umgebung.knoten.murmel[1].g.gain.value, w.umgebung.knoten.brunnen.g.gain.value, w.umgebung.knoten.boeGain.gain.value] };
    await new Promise((r) => setTimeout(r, 6000));
    const leck = w.umgebung.zaehl.knotenAktiv;
    w.musik.ende(); ctx.close();
    return { maxU, vorher, nachher, umgebungDabei, belegt, pause, menue, leck, erzeugt: w.umgebung.zaehl.knotenErzeugt };
  });
  pruefe(r.maxU <= 8 && r.maxU >= 6, 'Umgebungs-Topf nie über umgebung.maxStimmen (8), auch bei Dauerbeschuss', `höchstens ${r.maxU}`);
  pruefe(r.nachher >= r.vorher + 3 && r.belegt.includes('aufprall') && r.belegt.includes('fanfare') && r.belegt.includes('checkpoint'),
    'Aufprall, Fanfare und Checkpoint bekommen ihre Stimmen, auch wenn die Umgebung voll ist (getrennte Töpfe)', `Signal/Aufprall-Stimmen ${r.vorher} -> ${r.nachher}, Umgebung ${r.umgebungDabei}`);
  pruefe(r.pause.filter < 1000 && r.pause.pegel < 0.6 && r.pause.neu.length === 0 && r.pause.murmel > 0, 'Pause: Umgebung läuft gedämpft (Tiefpass, leiser), nichts Neues wird ausgelöst',
    `Tiefpass ${Math.round(r.pause.filter)} Hz, Pegel ${r.pause.pegel.toFixed(2)}`);
  pruefe(r.menue.neu === 0 && r.menue.stimmen === 0 && r.menue.gains.every((g) => g < 1e-3), 'Menü/Titel/Demo: kein Umgebungsklang', `Dauerstimmen ${r.menue.gains.map((g) => g.toFixed(4)).join('/')}`);
  pruefe(r.leck === 0, 'keine hängenden Knoten nach dem Beschuss', `${r.erzeugt} erzeugt, danach ${r.leck} übrig`);

  // eine Minute Fahrt im Spiel (Testfahrer, mit Ton): Umgebungs-Knoten bleiben beschränkt und werden abgebaut
  const spiel = await ladeSpiel();
  const p = spiel.page;
  const f = await A(p, async () => {
    const A = window.__alpineRally, w = A.ton.werk;
    const f = await import(window.__fahrerUrl);
    A.anhalten = true;
    A.start({ countdown: false });
    let k = 0, maxU = 0, maxK = 0;
    f.fahreBis(A, 'flott', { maxSchritte: 120 * 60, proSchritt: () => { if (++k % 2 === 0) { A.tonBild(1 / 60); maxU = Math.max(maxU, w.umgebung.stimmen); maxK = Math.max(maxK, w.umgebung.zaehl.knotenAktiv); } } });
    const z = { ...w.umgebung.zaehler };
    A.anhalten = false;
    A.zumHauptmenue();
    await new Promise((r) => setTimeout(r, 6000));
    return { s: A.rennen.letztesS, maxU, maxK, nach: w.umgebung.zaehl.knotenAktiv, z, stimmen: w.umgebung.stimmen };
  });
  pruefe(f.maxU <= 8 && f.nach === 0 && f.stimmen === 0, 'eine Minute Fahrt: Umgebungs-Stimmen beschränkt, danach alle Knoten abgebaut', `höchstens ${f.maxU} Stimmen / ${f.maxK} Knoten; Ereignisse ${JSON.stringify(f.z)}`);
  pruefe(spiel.fehler.length === 0, 'keine Fehler in der Konsole', spiel.fehler.join(' | '));
  await spiel.schliessen();
}

// =====================================================================
console.log('(i) Musik: Aufbau');
{
  const r = await A(P, () => {
    const P = window.__P, L = P.HAUPT, C = P.CONFIG.audio.musik;
    const ab = L.abschnitte.map((a) => [a.name, a.takte]);
    const akk = []; for (const a of P.ABSCHNITTE) akk.push(...a.akkorde.map((c) => [c, a.tonart]));
    const fehler = [], lead = [];
    let leadMin = 1e9, leadMax = 0, bassMin = 1e9, bassMax = 0;
    const hz = (m) => 440 * 2 ** ((m - 69) / 12);
    for (let i = 0; i < L.anzahl; i++) {
      const k = L.kanal[i]; if (k > 2) continue;
      const m = L.midi[i], [c, ta] = akk[Math.floor(L.schritt[i] / 16)], T = P.TONARTEN[ta];
      if (!(T.leiter.includes(m % 12) || (T.ausnahmen[c] || []).includes(m % 12))) fehler.push(`${L.schritt[i]}:${m}`);
      if (k === 0) { leadMin = Math.min(leadMin, hz(m)); leadMax = Math.max(leadMax, hz(m)); lead.push([L.schritt[i], L.dauer[i], m, c, ta]); }
      if (k === 2) { bassMin = Math.min(bassMin, hz(m)); bassMax = Math.max(bassMax, hz(m)); }
    }
    const dMax = Math.max(...lead.filter((x) => x[4] === 'a').map((x) => hz(x[2])));
    // Phrasen: Note vor einer Pause (ab einem Achtel) oder am Schluss endet auf einem Akkordton
    const phrasen = [];
    for (let j = 0; j < lead.length; j++) {
      const [s, d, m, c] = lead[j], nx = lead[j + 1];
      if (nx && nx[0] - (s + d) < 2) continue;
      const [g, t] = P.AKKORDE[c];
      phrasen.push(t.includes(((m - g) % 12 + 12) % 12));
    }
    // gleichzeitige Oszillatoren (analytisch, mit Ausklingen und Oktave darunter)
    const sech = 60 / C.bpm / 4, iv = [];
    for (let i = 0; i < L.anzahl; i++) {
      const k = L.kanal[i]; if (k > 3) continue;
      const t = L.schritt[i] * sech, d = L.dauer[i] * sech;
      const ende = k === 3 ? t + 0.42 : k === 2 ? t + d * 0.82 + 0.08 : t + d + 0.08;
      iv.push([t, 1], [ende, -1]);
      if (k === 0 && (L.art[i] & 4)) iv.push([t, 1], [ende, -1]);
    }
    iv.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    let n = 0, max = 0; for (const [, x] of iv) { n += x; max = Math.max(max, n); }
    return { takte: L.takte, ab, laenge: L.schritte * sech, fehler, leadMin, leadMax, dMax, bassMin, bassMax, phrasen: [phrasen.filter(Boolean).length, phrasen.length], max,
      akkorde: P.ABSCHNITTE.map((a) => a.akkorde.join(' ')), ziel: P.SCHLEIFE_ZIEL.takte };
  });
  const SOLL = [['Intro', 4], ['A', 8], ['B', 8], ['C', 8], ["A'", 8], ['Break', 4], ["B'", 8], ["C'", 8], ['D', 8], ["C''", 8], ['Rückführung', 4]];
  pruefe(r.takte === 76 && JSON.stringify(r.ab) === JSON.stringify(SOLL), '76 ganze Takte, Abschnittstabelle in musikstueck.js wie geplant', r.ab.map((a) => `${a[0]} ${a[1]}`).join(', '));
  pruefe(Math.abs(r.laenge - 132.17) < 0.1, 'Länge ca. 132 s bei 138 BPM (2:12)', `${r.laenge.toFixed(2)} s`);
  pruefe(r.akkorde[8] === 'Bm A G F# Bm A G F#' && r.akkorde[10] === 'Em F E E' && r.akkorde[0] === 'Am Am F G', 'D ein Ganzton höher (h-Moll), Rückführung Em F E E', `D: ${r.akkorde[8]}`);
  pruefe(r.fehler.length === 0, 'alle Noten in der erlaubten Tonmenge (a-Moll + gis über E; in D h-Moll + ais über Fis)', r.fehler.slice(0, 5).join(', '));
  pruefe(r.leadMin >= 219.9 && r.dMax <= 880.1 && r.leadMax <= 988.0, 'Lead 220–880 Hz (in D bis 988 Hz)', `${r.leadMin.toFixed(0)}–${r.dMax.toFixed(0)} Hz, in D bis ${r.leadMax.toFixed(0)} Hz`);
  pruefe(r.bassMin >= 54.9 && r.bassMax <= 220.1, 'Bass 55–220 Hz', `${r.bassMin.toFixed(1)}–${r.bassMax.toFixed(1)} Hz`);
  pruefe(r.phrasen[0] === r.phrasen[1], 'jede Lead-Phrase endet auf einem Akkordton', `${r.phrasen[0]} von ${r.phrasen[1]}`);
  pruefe(r.max <= 14, 'höchstens 14 gleichzeitige Töne (Oszillatoren, mit Ausklingen)', `${r.max}`);
  // Naht: von der Rückführung über den Anfang (Intro) hinweg, ohne Klick und ohne Loch
  const n = await A(P, async () => {
    const P = window.__P, takt = 60 / 138 * 4;
    const r = await P.testRender(6 * takt, 'Rückführung', { stumm: ['schlagzeug'] }); // (Schlagzeug-Einsätze ausgenommen, wie in (j))
    const mit = await P.testRender(6 * takt, 'Rückführung');
    const naht = Math.round(4 * takt * 44100);
    let sprung = 0; for (let i = naht - 220; i < naht + 220; i++) sprung = Math.max(sprung, Math.abs(r.daten[i] - r.daten[i - 1]));
    return { sprung, vor: P.rmsDb(mit.daten, 4 * takt - 0.8, 4 * takt), nach: P.rmsDb(mit.daten, 4 * takt, 4 * takt + 0.8), status: r.status.abschnitt };
  });
  pruefe(n.sprung < 0.02 && n.vor > -40 && n.nach > -40 && n.status === 'Intro', 'Schleife nahtlos: Rückführung -> Intro ohne Klick (Sprung an der Naht unter 0.02, ohne Schlagzeug-Einsatz) und ohne Loch',
    `Sprung ${n.sprung.toFixed(4)}, RMS vor/nach ${n.vor.toFixed(1)} / ${n.nach.toFixed(1)} dBFS`);
}

// =====================================================================
console.log('(j) Musik: Klang (offline, je Abschnitt)');
{
  const r = await A(P, async () => {
    const P = window.__P, takt = 60 / 138 * 4, aus = [];
    for (const a of P.ABSCHNITTE) {
      const r = await P.testRender(a.akkorde.length * takt, a.name);
      const ohne = await P.testRender(a.akkorde.length * takt, a.name, { stumm: ['schlagzeug'] });
      let klick = 0; for (let i = 1; i < ohne.daten.length; i++) klick = Math.max(klick, Math.abs(ohne.daten[i] - ohne.daten[i - 1]));
      const sp = P.spektrum(r.daten), m = P.miss(r.daten);
      // Schlagzeug-Anteil = mit minus ohne Schlagzeug (alles andere ist gleich gerechnet)
      const sz = new Float32Array(r.daten.length); for (let i = 0; i < sz.length; i++) sz[i] = r.daten[i] - ohne.daten[i];
      aus.push({ name: a.name, rms: P.rmsDb(r.daten), spitze: P.spitzeDb(r.daten), schwer: P.schwerpunkt(sp), ueber2k: P.anteilUeber(sp, 2000), klick, dc: m.mittel, nan: m.nan,
        szTakt13: P.rmsDb(sz, 0, 3 * takt), szTakt4: P.rmsDb(sz, 3 * takt, 4 * takt), szAlles: P.rmsDb(sz) });
    }
    // Spektrogramme
    const bilder = {};
    for (const n of ['Intro', 'A', 'C', 'Break', 'D']) bilder[n] = P.spektrogramm((await P.testRender(4 * takt, n)).daten, `Musik: ${n} (4 Takte)`, { fMax: 8000 });
    // D ein Ganzton höher als C: Grundton des Basses im ersten Takt
    const c = await P.testRender(takt, 'C', { stumm: ['lead', 'arp', 'schlagzeug'] }), d = await P.testRender(takt, 'D', { stumm: ['lead', 'arp', 'schlagzeug'] });
    const fc = P.staerksteFrequenz(c.daten, 0, takt, 45, 75, 0.1), fd = P.staerksteFrequenz(d.daten, 0, takt, 45, 75, 0.1);
    return { aus, bilder, fc, fd };
  });
  for (const a of r.aus) {
    pruefe(a.spitze < -8 && Math.abs(a.rms + 20) <= 3 && a.klick < 0.1 && Math.abs(a.dc) < 0.002 && a.nan === 0,
      `${a.name}: Spitze unter -8 dBFS, RMS -20 ±3 dBFS, kein Klick (ohne Schlagzeug kein Sprung über 0.1), keine Gleichspannung`,
      `Spitze ${a.spitze.toFixed(1)}, RMS ${a.rms.toFixed(1)}, Schwerpunkt ${Math.round(a.schwer)} Hz, über 2 kHz ${(a.ueber2k * 100).toFixed(1)} %, Sprung ${a.klick.toFixed(3)}`);
  }
  const br = r.aus.find((a) => a.name === 'Break'), aa = r.aus.find((a) => a.name === 'A');
  pruefe(br.szTakt13 < -120 && br.szTakt4 > -45 && aa.szAlles > -40, 'Break ohne Schlagzeug (Takt 1–3 nichts, im 4. Takt nur der Rauschen-Anstieg)', `Schlagzeug-Anteil Takt 1–3 ${br.szTakt13 < -150 ? 'still' : br.szTakt13.toFixed(0)}, Takt 4 (Anstieg) ${br.szTakt4.toFixed(1)} dBFS; in A ${aa.szAlles.toFixed(1)} dBFS`);
  pruefe(Math.abs(r.fd / r.fc - 2 ** (2 / 12)) < 0.01, 'D ein Ganzton höher als C (Grundton des Basses)', `C ${r.fc.toFixed(1)} Hz, D ${r.fd.toFixed(1)} Hz, x${(r.fd / r.fc).toFixed(4)}`);
  messung.musik = r.aus.map((a) => ({ name: a.name, rms: r1(a.rms), spitze: r1(a.spitze), schwer: Math.round(a.schwer), ueber2k: r1(a.ueber2k * 100) }));
  for (const [n, b] of Object.entries(r.bilder)) bildSpeichern(`17-musik-${n.toLowerCase()}`, b);
}

// =====================================================================
console.log('(k) Musik: Zustände im Spiel');
{
  const spiel = await ladeSpiel({ entsperren: false });
  const p = spiel.page;
  const st = () => A(p, () => window.__alpineRally.ton.musikStatus());
  const vor = await st();
  await p.keyboard.press('Enter');
  await p.waitForFunction(() => window.__alpineRally.ton.werk && window.__alpineRally.ton.werk.aufbau.fertig, null, { timeout: 30000 });
  await warte(600);
  const nachEntsperren = await st();
  pruefe(!vor.laeuft && nachEntsperren.laeuft && nachEntsperren.art === 'menue' && nachEntsperren.abschnitt === 'Intro', 'Titel: keine Musik vor dem Entsperren, danach Menü-Musik vom Intro', `${nachEntsperren.abschnitt} Takt ${nachEntsperren.takt}, Pegel ${nachEntsperren.pegel.toFixed(2)}`);
  // Unterseiten: Einstellungen, Credits und zurück – kein Neustart
  const starts0 = nachEntsperren.starts;
  for (const k of ['ArrowDown', 'ArrowDown', 'ArrowDown', 'ArrowDown', 'Enter']) { await p.keyboard.press(k); await warte(120); }
  const seite = await A(p, () => window.__alpineRally.menue.seite && window.__alpineRally.menue.seite.id);
  await p.keyboard.press('Escape'); await warte(300);
  const nachSeiten = await st();
  pruefe(nachSeiten.laeuft && nachSeiten.starts === starts0 && nachSeiten.schritt > nachEntsperren.schritt - 1, 'Hauptmenü <-> Unterseiten: Musik läuft weiter, startet nicht neu', `Seite ${seite}, Starts ${starts0} -> ${nachSeiten.starts}`);
  // STARTEN: in 1.0 s auf 0, dann aus; im Countdown und Rennen nie Musik
  // (die Blende beginnt beim nächsten Bild; gemessen wird auf der Audio-Uhr ab Beginn der Blende)
  const aus = await A(p, async () => {
    const A = window.__alpineRally;
    A.start();
    let s = A.ton.musikStatus(), n = 0;
    while (!s.ausblenden && s.laeuft && n++ < 400) { await new Promise((r) => setTimeout(r, 5)); s = A.ton.musikStatus(); }
    const t0 = s.blendeVon, dauer = s.blendeBis - s.blendeVon, ziel = s.blendeZiel;
    let halb = null, ende = null;
    while (n++ < 2000) {
      await new Promise((r) => setTimeout(r, 10)); s = A.ton.musikStatus();
      if (halb === null && s.zeit >= t0 + 0.5) halb = s.pegel;
      if (!s.laeuft) { ende = s.zeit - t0; break; }
    }
    const z = [];
    for (let k = 0; k < 60; k++) { await new Promise((r) => setTimeout(r, 50)); z.push(A.ton.musikStatus().laeuft); }
    return { dauer, ziel, halb, ende, zustand: A.ablauf.zustand, jemals: z.some(Boolean) };
  });
  pruefe(Math.abs(aus.dauer - 1) < 0.02 && aus.ziel === 0 && aus.halb > 0.35 && aus.halb < 0.65 && aus.ende !== null && aus.ende < 1.25 && !aus.jemals,
    'STARTEN: Musik blendet in 1.0 s aus (gerade Rampe) und stoppt; im Countdown/Rennen keine Musik',
    `Blende ${aus.dauer.toFixed(2)} s, nach 0.5 s Pegel ${aus.halb?.toFixed(2)}, gestoppt nach ${aus.ende?.toFixed(2)} s (${aus.zustand})`);
  // Pause: leise Variante (ab A, ohne Schlagzeug, Tiefpass, halber Pegel), Weiter -> aus in 0.4 s
  await A(p, () => window.__alpineRally.pausieren());
  await warte(700);
  const pa = await st();
  pruefe(pa.laeuft && pa.art === 'pause' && pa.abschnitt === 'A' && pa.ohneSchlagzeug && Math.abs(pa.filter - 1200) < 5 && Math.abs(pa.pegel - 0.5) < 0.02, 'Pause: leise Variante (Abschnitt A, ohne Schlagzeug, Tiefpass 1200 Hz, Pegel 0.5)',
    `${pa.abschnitt}, Filter ${Math.round(pa.filter)} Hz, Pegel ${pa.pegel.toFixed(2)}`);
  const we = await A(p, async () => {
    const A = window.__alpineRally;
    A.weiter();
    let s = A.ton.musikStatus(), n = 0;
    while (!s.ausblenden && s.laeuft && n++ < 400) { await new Promise((r) => setTimeout(r, 5)); s = A.ton.musikStatus(); }
    const t0 = s.blendeVon, dauer = s.blendeBis - s.blendeVon;
    while (s.laeuft && n++ < 2000) { await new Promise((r) => setTimeout(r, 10)); s = A.ton.musikStatus(); }
    return { dauer, ende: s.zeit - t0 };
  });
  pruefe(Math.abs(we.dauer - 0.4) < 0.02 && we.ende < 0.6, 'Weiter: Musik blendet in 0.4 s aus', `Blende ${we.dauer.toFixed(2)} s, aus nach ${we.ende.toFixed(2)} s`);
  // Pause -> Hauptmenü: Musik wieder vom Intro
  await A(p, () => { window.__alpineRally.pausieren(); });
  await warte(300);
  await A(p, () => window.__alpineRally.zumHauptmenue());
  await warte(400);
  const hm = await st();
  pruefe(hm.laeuft && hm.art === 'menue' && hm.abschnitt === 'Intro' && hm.takt <= 2, 'aus der Pause zum Hauptmenü: Musik beginnt wieder am Intro', `${hm.abschnitt} Takt ${hm.takt}`);
  // Zielbildschirm: nach ca. 1 s (ohne neue Bestzeit), nach ca. 5 s mit neuer Bestzeit (aus (d))
  pruefe(Math.abs((messung.zielMusik.ohneBest ?? -1) - 1) < 0.1 && Math.abs((messung.zielMusik.mitBest ?? -1) - 5) < 0.1, 'Zielbildschirm: Musik nach ca. 1 s, bei neuer Bestzeit nach der langen Fanfare (ca. 5 s)',
    `${messung.zielMusik.ohneBest?.toFixed(2)} s / ${messung.zielMusik.mitBest?.toFixed(2)} s`);
  const zi = await A(p, async () => {
    const A = window.__alpineRally;
    A.anhalten = true; A.start(); window.__T.ueberCountdown();
    A.setzeAuf(A.strecke.zielS - 10); A.rennen.zustand = 'laeuft'; A.rennen.naechsterCp = A.checkpoints.length; A.rennen.zeit = 999;
    let n = 0; while (A.ablauf.zustand !== 'ziel' && n++ < 4000) window.__T.bild({ ...window.__T.LEER, gas: 1 });
    A.anhalten = false;
    // (in der Testumgebung laufen die Bilder langsam: warten, bis die Musik da und eingeblendet ist)
    let s = A.ton.musikStatus(), w = 0;
    while (!(s.laeuft && s.blende > 0.999) && w++ < 600) { await new Promise((r) => setTimeout(r, 50)); s = A.ton.musikStatus(); }
    A.zumHauptmenue();
    await new Promise((r) => setTimeout(r, 400));
    return { s, danach: A.ton.musikStatus() };
  });
  pruefe(zi.s.laeuft && zi.s.art === 'ziel' && zi.s.abschnitt === 'Ausklang' && zi.s.ohneSchlagzeug && Math.abs(zi.s.pegel - 0.7) < 0.05, 'Zielbildschirm: ruhiger Ausklang (ohne Schlagzeug, Pegel 0.7)', `${zi.s.abschnitt}, Pegel ${zi.s.pegel.toFixed(2)}`);
  pruefe(zi.danach.art === 'menue' && zi.danach.abschnitt === 'Intro', 'vom Zielbildschirm zum Hauptmenü: wieder Menü-Musik vom Intro');
  pruefe(spiel.fehler.length === 0, 'keine Fehler in der Konsole', spiel.fehler.join(' | '));
  await spiel.schliessen();
  for (const adresse of ['?ton=aus', '?menue=aus']) {
    const s = await ladeSpiel({ adresse, entsperren: false });
    await s.page.keyboard.press('Enter'); await warte(800);
    const x = await A(s.page, () => ({ an: window.__alpineRally.ton.an, st: window.__alpineRally.ton.musikStatus() }));
    pruefe(!x.an && !x.st.laeuft, `${adresse}: nie Musik (ganz stumm)`);
    await s.schliessen();
  }
}

// =====================================================================
console.log('(l) Regler MUSIK');
{
  const spiel = await ladeSpiel();
  const p = spiel.page;
  const r = await A(p, async () => {
    const A = window.__alpineRally, w = A.ton.werk;
    const { setze } = await import('/js/einstellungen.js');
    const std = A.einstellungen.musik;
    const g60 = w.busse.musikRegler.gain.value;
    setze('musik', 50);
    await new Promise((r) => setTimeout(r, 300));
    const g50 = w.busse.musikRegler.gain.value, sig = w.busse.signaleRegler.gain.value, master = w.busse.master.gain.value;
    setze('musik', 0);
    await new Promise((r) => setTimeout(r, 300));
    const g0 = w.busse.musikRegler.gain.value, sig0 = w.busse.signaleRegler.gain.value;
    setze('musik', 40);
    const eintraege = A.seiten.einstellungen.eintraege.map((e) => e.text).filter((x) => typeof x === 'string');
    const { TEXTE } = await import('/js/texte.js'), { SCHRIFT } = await import('/js/pixel.js');
    const zeichen = [];
    for (const k of ['einst.musik', 'einst.musikHinweis', 'einst.lautHinweis']) for (const s of ['de', 'en']) for (const c of TEXTE[k][s]) if (!SCHRIFT[c]) zeichen.push(c);
    return { std, g60, g50, g0, sig, sig0, master, eintraege, texte: ['einst.musik', 'einst.musikHinweis'].map((k) => TEXTE[k]), laut: TEXTE['einst.lautHinweis'], zeichen,
      gespeichert: JSON.parse(localStorage.getItem('alpineRally.einstellungen')).musik };
  });
  pruefe(r.std === 60 && Math.abs(r.g60 - 0.36) < 0.01, 'Standard 60 % (quadratisch = 0.36)', `${r.std} %, ${r.g60.toFixed(3)}`);
  pruefe(Math.abs(r.g50 - 0.25) < 0.01 && r.g0 < 1e-3 && Math.abs(r.sig - r.sig0) < 1e-6, 'quadratisch (50 % = 0.25), 0 % = Musik stumm, Signale bleiben', `${r.g50.toFixed(3)} / ${r.g0.toFixed(4)}, SIGNALTÖNE ${r.sig.toFixed(2)}`);
  const i = r.eintraege.indexOf('einst.musik');
  pruefe(i > 0 && r.eintraege[i - 1] === 'einst.signale' && r.eintraege[i - 2] === 'einst.lautstaerke', 'Regler MUSIK steht unter SIGNALTÖNE (unter LAUTSTÄRKE)');
  pruefe(r.texte.every((t) => t && t.de && t.en) && r.zeichen.length === 0, 'Texte de/en vorhanden, im Pixelfont darstellbar', r.texte.map((t) => `${t.de} / ${t.en}`).join('; '));
  pruefe(/MUSIK/.test(r.laut.de) && /UMGEBUNG/.test(r.laut.de) && /MOTOR/.test(r.laut.de) && /MUSIC/.test(r.laut.en), 'Hinweis unter LAUTSTÄRKE nennt alles (Motor, Umgebung, Musik, Signale)', `"${r.laut.de}"`);
  pruefe(r.gespeichert === 40, 'Wert wird gespeichert');
  await p.reload();
  await p.waitForFunction(() => window.__alpineRally, null, { timeout: 120000 });
  const geladen = await A(p, () => window.__alpineRally.einstellungen.musik);
  pruefe(geladen === 40, 'nach dem Neuladen gleich', `${geladen} %`);
  await spiel.schliessen();
  const alt = await ladeSpiel({ entsperren: false, speicher: JSON.stringify({ lautstaerke: 80, signale: 90, sprache: 'de' }) });
  const w = await A(alt.page, () => window.__alpineRally.einstellungen.musik);
  pruefe(w === 60, 'alter Speicher ohne den Wert: 60 %', `${w}`);
  await alt.schliessen();
  // weich, ohne Knacken (offline: Regler mitten in der Musik von 100 auf 0)
  const k = await A(P, async () => {
    const P = window.__P;
    const mach = (aendern) => P.rendereRaum({ dauer: 2, kanaele: 1, quellen: P.quellenTest({}), aufbau: (w) => { w.musik.starte('menue', 'C'); w.musik.knoten.blende.gain.cancelScheduledValues(0); w.musik.knoten.blende.gain.setValueAtTime(1, 0); },
      bild: (w, t) => { w.musik.plane(t + 0.4); if (aendern && Math.abs(t - 1) < 0.008) w.musikLautstaerke(0); } });
    const r = await mach(true), v = await mach(false);
    const a = Math.round(0.98 * 44100);
    return { sprung: P.groessterSprung(r.mono, a, a + 4410), vergleich: P.groessterSprung(v.mono, a, a + 4410), danach: P.rmsDb(r.mono, 1.3, 2) };
  });
  pruefe(k.sprung < 0.1 && k.sprung <= k.vergleich + 1e-6 && k.danach < -80, 'Regler wirkt weich (kein Knacken: kein grösserer Sprung als ohne Verstellen) und 0 % ist wirklich still',
    `grösster Sprung ${k.sprung.toFixed(4)} (ohne Verstellen ${k.vergleich.toFixed(4)}), danach ${k.danach < -150 ? 'still' : `${k.danach.toFixed(0)} dBFS`}`);
  const lab = await A(P, () => ({ regler: !!document.getElementById('mPegel'), fein: window.__tonLabor && window.__tonLabor.fein.FEIN.filter((f) => /umgebung|musik|raum/.test(f.pfad)).length }));
  pruefe(lab.regler && lab.fein >= 14, 'Ton-Labor hat den Regler Musik-Pegel und 15 neue Feinschliff-Regler', `${lab.fein} neue`);
}

// =====================================================================
console.log('(m) Ducking der Musik');
{
  const r = await A(P, async () => {
    const P = window.__P;
    const mach = (mitDuck, mitSignal) => P.rendereRaum({ dauer: 3, kanaele: 1, quellen: P.quellenTest({}), aufbau: (w) => { w.musik.starte('menue', 'C'); w.musik.knoten.blende.gain.cancelScheduledValues(0); w.musik.knoten.blende.gain.setValueAtTime(1, 0); },
      bild: (w, t) => { w.musik.plane(t + 0.4); if (Math.abs(t - 2) < 0.008) { if (mitDuck) w.musik.ducke(); if (mitSignal) w.menue('bestaetigen'); } } });
    const ohne = await mach(false, false), mit = await mach(true, false);
    const fen = (a, b) => P.rmsDb(mit.mono, a, b) - P.rmsDb(ohne.mono, a, b);
    const tiefe = fen(2.04, 2.15), zurueck = fen(2.4, 2.8);
    // Signal allein (Spitze) gegen die geduckte Musik (RMS)
    const sig = await P.rendereRaum({ dauer: 0.3, kanaele: 1, quellen: P.quellenTest({}), aufbau: (w) => w.menue('bestaetigen') });
    return { tiefe, zurueck, signal: P.spitzeDb(sig.mono), musik: P.rmsDb(mit.mono, 2.02, 2.15), musikNormal: P.rmsDb(ohne.mono, 0.5, 2) };
  });
  pruefe(Math.abs(r.tiefe + 4) <= 1 && Math.abs(r.zurueck) < 0.5, 'Menü-Signal senkt die Musik ca. 4 dB für ca. 150 ms, dann zurück', `${r.tiefe.toFixed(1)} dB, danach ${r.zurueck.toFixed(2)} dB`);
  pruefe(r.signal - r.musik >= 10 && r.signal - r.musikNormal >= 10, 'Menü-Signal mindestens 10 dB über der Musik (auch ohne Ducking)', `Signal-Spitze ${r.signal.toFixed(1)} dBFS, Musik ${r.musikNormal.toFixed(1)} / geduckt ${r.musik.toFixed(1)} dBFS RMS`);
  messung.ducking = { tiefe: r1(r.tiefe), signal: r1(r.signal), musikRms: r1(r.musikNormal), abstand: r1(r.signal - r.musikNormal) };
}

// =====================================================================
console.log('(n) Stabilität');
{
  pruefe(off.fehler.length === 0, 'Offline-Seite: keine Fehler in der Konsole', off.fehler.join(' | '));
  // Ton-Labor: neue Bereiche ohne Fehler, VORBEIFAHREN, Musik SPIELEN
  await P.reload();
  await P.waitForFunction(() => window.__tonLabor);
  await P.click('#tonStarten');
  await P.waitForFunction(() => window.__tonLabor.ton.werk && window.__tonLabor.ton.werk.aufbau.fertig, null, { timeout: 30000 });
  await P.selectOption('#uArt', 'glocken'); await P.click('#uVorbei'); await warte(1500);
  const lab = await A(P, () => ({ u: window.__tonLabor.ton.werk.umgebung.zaehler, text: document.getElementById('uAnzeige').textContent }));
  await P.selectOption('#mAbschnitt', 'C'); await P.click('#mSpielen'); await warte(1500);
  const mu = await A(P, () => window.__tonLabor.ton.werk.musik.status());
  pruefe(mu.laeuft && mu.abschnitt === 'C' && /VORBEIFAHREN/.test(lab.text), 'Ton-Labor: Umgebung mit VORBEIFAHREN und Musik (Abschnitt C) laufen', `${mu.abschnitt} Takt ${mu.taktImAbschnitt}; ${lab.text.split('\n')[1]}`);
  await P.screenshot({ path: path.join(BILDER, '30-ton-labor.png'), fullPage: true });
  pruefe(off.fehler.length === 0, 'Ton-Labor: keine Fehler in der Konsole', off.fehler.join(' | '));
}
await off.schliessen();

fs.writeFileSync(path.join(WURZEL, 'tools/m7b-messung.json'), JSON.stringify(messung, null, 1));
console.log(`\n${fehlerZahl === 0 ? 'ALLE PRÜFUNGEN BESTANDEN' : `${fehlerZahl} FEHLER`}`);
process.exit(fehlerZahl ? 1 : 0);
