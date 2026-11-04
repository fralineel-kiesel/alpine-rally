// Karte, Höhenprofil und Bericht einer Strecke (M10a):  node tools/strecke-karte.mjs [<datei> | --strecke <id>] [--aus <ordner>]
// Lädt das Spiel im Headless-Chromium mit dieser Streckendatei (wie tools/strecke-abfahren.mjs) und zeichnet mit den
// echten Bauteilen des Spiels (Spline, Netz mit Stummeln, Pace-Notes, Abkürzungen), Pixel im Code, keine Bibliothek:
//   <id>-karte.png   Draufsicht: Strasse mit Breite und Belag, Stummel, Felswände, Start/Ziel, Checkpoints mit Nummer,
//                    Pace-Notes (Punkt + Kürzel), Abkürzungen (rot = gesperrt, grün = schneiden), enge Kurven rot
//   <id>-profil.png  Höhenprofil über die Strecke, gefärbt nach Steigung, Kuppen und Senken, Checkpoints, Belag, Sprünge (M10c)
//   <id>-bericht.txt Länge, Höhenmeter, Steigung/Gefälle, engster Radius, Anteile je Belag, Pace-Notes, Checkpoints
// Standard-Ordner: /tmp/strecke-karte. Format der Datei: docs/strecken-format.md

import fs from 'node:fs';
import path from 'node:path';
import { streckenWahl } from './strecke-erzeugt.mjs';
import { starteSpiel } from './spiel-browser.mjs';

const arg = (name) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : null; };
// Strecke: Datei als Argument oder (seit M10b) --strecke <id oder Datei>, Standard alpen
const datei = process.argv.slice(2).find((a, i, l) => !a.startsWith('--') && !(l[i - 1] || '').startsWith('--')) || streckenWahl().datei;
if (!datei || !fs.existsSync(datei)) { console.log('Aufruf: node tools/strecke-karte.mjs [<datei> | --strecke <id>] [--aus <ordner>]'); process.exit(1); }
const ordner = arg('--aus') || '/tmp/strecke-karte';
fs.mkdirSync(ordner, { recursive: true });
const inhalt = fs.readFileSync(datei, 'utf8');

const spiel = await starteSpiel({ breite: 640, hoehe: 360 });
await spiel.page.route('**/__strecke/**', (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: inhalt }));
await spiel.page.addInitScript((n) => { window.__streckeAdresse = `${location.origin}/__strecke/${n}`; }, path.basename(datei));
await spiel.page.goto(`${spiel.url}/index.html?menue=aus&ton=aus`);
await spiel.page.waitForFunction(() => window.__alpineRally || window.__fehlerseite, null, { timeout: 180000, polling: 100 });
const fs0 = await spiel.page.evaluate(() => window.__fehlerseite || null);
if (fs0) { console.log(`FEHLER: Strecke lässt sich nicht laden (${fs0.grund}): ${fs0.mehr}`); await spiel.schliessen(); process.exit(1); }

const erg = await spiel.page.evaluate(async () => {
  const A = window.__alpineRally, S = A.strecke, N = A.netz, C = A.CONFIG;
  const { pixelText } = await import('/js/pixel.js');
  const { STRECKE } = await import('/js/streckenlader.js');
  const P = A.paceNotes, k = P.daten.kruemmung, n = S.anzahl;
  const BELAG_FARBE = { asphalt: '#9aa0a6', schotter: '#d8c79a', wiesenweg: '#8fbf5a' };
  const r1 = (x) => Math.round(x * 10) / 10;

  // ---------------- Zahlen ----------------
  let hoch = 0, runter = 0;
  for (let i = 1; i < n; i++) { const d = S.py[i] - S.py[i - 1]; if (d > 0) hoch += d; else runter -= d; }
  const F = 25; // Steigung über 25 m
  let maxSt = 0, maxStS = 0, maxGef = 0, maxGefS = 0;
  const steigung = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const a = Math.max(0, i - F / 2 | 0), b = Math.min(n - 1, i + F / 2 | 0);
    const g = (S.py[b] - S.py[a]) / Math.max(1, S.s[b] - S.s[a]);
    steigung[i] = g;
    if (g > maxSt) { maxSt = g; maxStS = i; }
    if (-g > maxGef) { maxGef = -g; maxGefS = i; }
  }
  let rMin = Infinity, rMinS = 0;
  for (let i = 5; i < n - 5; i++) { const r = 1 / Math.max(1e-6, Math.abs(k[i])); if (r < rMin) { rMin = r; rMinS = i; } }
  const ENG = 30; // enger als 30 m = enge Kurve (Kehren um 13 m)
  const engeKurven = [];
  for (let i = 0; i < n; i++) {
    const eng = Math.abs(k[i]) > 1 / ENG;
    const l = engeKurven[engeKurven.length - 1];
    if (eng) { if (l && i - l.bis <= 3) l.bis = i; else engeKurven.push({ von: i, bis: i }); }
  }
  // Kuppen und Senken: wie die Pace-Notes des Spiels sie finden (gleiche Regel, keine zweite)
  const teile = P.notes.flatMap((nt) => nt.teile);
  const kuppen = teile.filter((t) => t.art === 'kuppe').map((t) => Math.round(t.s));
  const senken = teile.filter((t) => t.art === 'senke').map((t) => Math.round(t.s));
  const anteile = {};
  const von = Math.round(S.startS), bis = Math.round(S.zielS);
  for (let i = von; i <= bis; i++) anteile[N.belag[i]] = (anteile[N.belag[i]] || 0) + 1;
  let wandM = 0; for (let i = 0; i < n; i++) if (S.wandSeite[i] && S.wandStaerke[i] > 0.5) wandM++;
  const notizen = P.notes.map((nt) => {
    const t = nt.teile[0];
    const kurz = t.art === 'kurve' ? `${t.stufe}${t.richtung > 0 ? 'R' : 'L'}` : t.art === 'kehre' ? `KE${t.richtung > 0 ? 'R' : 'L'}`
      : t.art === 'schikane' ? 'SCH' : t.art === 'gerade' ? 'GER' : t.art === 'ziel' ? 'ZIEL' : t.art === 'felswand' ? 'WAND' : t.art.slice(0, 4).toUpperCase();
    return { s: nt.s, kurz, farbe: t.farbe, arten: nt.teile.map((x) => x.art) };
  });

  // ---------------- Karte ----------------
  const box = { ...S.box };
  for (const a of N.aeste) for (let i = 0; i < a.anzahl; i++) { box.minX = Math.min(box.minX, a.px[i]); box.maxX = Math.max(box.maxX, a.px[i]); box.minZ = Math.min(box.minZ, a.pz[i]); box.maxZ = Math.max(box.maxZ, a.pz[i]); }
  const RAND = 40, MAX = 1100;
  const m = Math.min((MAX - 2 * RAND) / (box.maxX - box.minX), (MAX - 2 * RAND) / (box.maxZ - box.minZ));
  const W = Math.ceil((box.maxX - box.minX) * m + 2 * RAND), H = Math.ceil((box.maxZ - box.minZ) * m + 2 * RAND) + 70;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const x = c.getContext('2d');
  const X = (wx) => RAND + (wx - box.minX) * m, Z = (wz) => RAND + (wz - box.minZ) * m;
  x.fillStyle = '#1b2129'; x.fillRect(0, 0, W, H);
  // Raster alle 250 m
  x.strokeStyle = '#262e38'; x.lineWidth = 1;
  for (let g = Math.ceil(box.minX / 250) * 250; g <= box.maxX; g += 250) { x.beginPath(); x.moveTo(X(g) + 0.5, 0); x.lineTo(X(g) + 0.5, H - 70); x.stroke(); }
  for (let g = Math.ceil(box.minZ / 250) * 250; g <= box.maxZ; g += 250) { x.beginPath(); x.moveTo(0, Z(g) + 0.5); x.lineTo(W, Z(g) + 0.5); x.stroke(); }
  const breite = (b) => Math.max(2, (C.belaege[b] || C.belaege.asphalt).breite * m);
  // Stummel und Verlängerungen (grau)
  for (const a of N.aeste) {
    x.strokeStyle = '#59606a'; x.lineWidth = breite('asphalt'); x.lineCap = 'round';
    x.beginPath(); for (let i = 0; i < a.anzahl; i++) (i ? x.lineTo : x.moveTo).call(x, X(a.px[i]), Z(a.pz[i])); x.stroke();
  }
  // Etappe nach Belag
  for (let i = 1; i < n; i++) {
    x.strokeStyle = BELAG_FARBE[N.belag[i]] || '#ffffff'; x.lineWidth = breite(N.belag[i]); x.lineCap = 'round';
    x.beginPath(); x.moveTo(X(S.px[i - 1]), Z(S.pz[i - 1])); x.lineTo(X(S.px[i]), Z(S.pz[i])); x.stroke();
  }
  // Felswand (braun, auf ihrer Seite)
  x.fillStyle = '#a0612f';
  for (let i = 0; i < n; i += 2) if (S.wandSeite[i] && S.wandStaerke[i] > 0.5) {
    const rx = -S.tz[i] * S.wandSeite[i], rz = S.tx[i] * S.wandSeite[i], d = 6 + 3 / m;
    x.fillRect(X(S.px[i] + rx * d) - 1, Z(S.pz[i] + rz * d) - 1, 2, 2);
  }
  // enge Kurven (rot)
  x.fillStyle = '#e8402a';
  for (const e of engeKurven) for (let i = e.von; i <= e.bis; i++) x.fillRect(X(S.px[i]) - 1, Z(S.pz[i]) - 1, 3, 3);
  // Abkürzungen: Innenseite markieren (rot = gesperrt, grün = schneiden erlaubt)
  const kurvenSeite = (liste, farbe) => {
    x.fillStyle = farbe;
    for (const a of liste) {
      const sd = a.seite === 'rechts' ? 1 : -1;
      for (let i = Math.round(a.sVon); i <= Math.round(a.sBis); i += 3) {
        const rx = -S.tz[i] * sd, rz = S.tx[i] * sd, d = 9 + 3 / m;
        x.fillRect(X(S.px[i] + rx * d) - 1, Z(S.pz[i] + rz * d) - 1, 3, 3);
      }
    }
  };
  kurvenSeite(S.nichtSchneiden || [], '#ff5a5a');
  kurvenSeite(S.schneiden || [], '#4fd06a');
  // Pace-Notes: Punkt und Kürzel (links der Strasse)
  for (const nt of notizen) {
    const i = Math.max(0, Math.min(n - 1, Math.round(nt.s)));
    const rx = S.tz[i], rz = -S.tx[i];
    const px = X(S.px[i] + rx * (8 + 4 / m)), pz = Z(S.pz[i] + rz * (8 + 4 / m));
    x.fillStyle = { gruen: '#5bd16b', gelb: '#f0c020', rot: '#ff5a5a', orange: '#f08a2a', weiss: '#f4f4ee' }[nt.farbe] || '#c9c9bd';
    x.fillRect(Math.round(px) - 2, Math.round(pz) - 2, 4, 4);
    pixelText(x, nt.kurz, Math.round(px) + 4, Math.round(pz) - 3, 1, x.fillStyle, 'links', '#101418');
  }
  // Start, Ziel, Checkpoints
  const marke = (sM, text, farbe) => {
    const p = S.punktBei(sM), rx = -p.tz, rz = p.tx, d = 9 + 2 / m;
    x.strokeStyle = farbe; x.lineWidth = 3;
    x.beginPath(); x.moveTo(X(p.x - rx * d), Z(p.z - rz * d)); x.lineTo(X(p.x + rx * d), Z(p.z + rz * d)); x.stroke();
    pixelText(x, text, Math.round(X(p.x + rx * (d + 4))) + 2, Math.round(Z(p.z + rz * (d + 4))) - 6, 2, farbe, 'links', '#101418');
  };
  marke(S.startS, 'START', '#5bd16b');
  marke(S.zielS, 'ZIEL', '#f4f4ee');
  A.checkpoints.forEach((cp) => marke(cp.s, `CP${cp.nummer}`, '#f0c020'));
  // Legende
  const ly = H - 60;
  pixelText(x, `${STRECKE.name.de}  ${r1(S.laenge)} M  (RASTER 250 M, NORDEN OBEN)`, 12, ly, 2, '#f4f4ee', 'links', null);
  let lx = 12;
  for (const [t, f] of [['ASPHALT', BELAG_FARBE.asphalt], ['SCHOTTER', BELAG_FARBE.schotter], ['WIESENWEG', BELAG_FARBE.wiesenweg], ['STUMMEL', '#59606a'], ['FELSWAND', '#a0612f'],
    [`ENG < ${ENG} M`, '#e8402a'], ['NICHT SCHNEIDEN', '#ff5a5a'], ['SCHNEIDEN', '#4fd06a'], ['PACE-NOTE', '#f0c020']]) {
    x.fillStyle = f; x.fillRect(lx, ly + 26, 10, 10);
    lx += 14 + pixelText(x, t, lx + 14, ly + 28, 1, '#c9c9bd', 'links', null) + 12;
  }
  const karte = c.toDataURL();

  // ---------------- Höhenprofil ----------------
  const PW = 1200, PH = 360, L = 50, R = 20, O = 36, U = 64;
  const p = document.createElement('canvas'); p.width = PW; p.height = PH;
  const y = p.getContext('2d');
  y.fillStyle = '#1b2129'; y.fillRect(0, 0, PW, PH);
  let hMin = Infinity, hMax = -Infinity; for (let i = 0; i < n; i++) { hMin = Math.min(hMin, S.py[i]); hMax = Math.max(hMax, S.py[i]); }
  hMin = Math.floor(hMin / 10) * 10 - 10; hMax = Math.ceil(hMax / 10) * 10 + 10;
  const SX = (sM) => L + (sM / S.laenge) * (PW - L - R), HY = (h) => PH - U - ((h - hMin) / (hMax - hMin)) * (PH - O - U);
  y.strokeStyle = '#262e38'; y.lineWidth = 1;
  for (let h = hMin; h <= hMax; h += 20) { y.beginPath(); y.moveTo(L, Math.round(HY(h)) + 0.5); y.lineTo(PW - R, Math.round(HY(h)) + 0.5); y.stroke(); pixelText(y, `${h}`, L - 4, Math.round(HY(h)) - 3, 1, '#8a9096', 'rechts', null); }
  for (let sM = 0; sM <= S.laenge; sM += 500) { y.beginPath(); y.moveTo(Math.round(SX(sM)) + 0.5, O); y.lineTo(Math.round(SX(sM)) + 0.5, PH - U); y.stroke(); pixelText(y, `${sM}`, Math.round(SX(sM)), PH - U + 4, 1, '#8a9096', 'mitte', null); }
  const farbeSt = (g) => { const a = Math.abs(g); return a < 0.04 ? '#4fa84a' : a < 0.08 ? '#c9b83a' : a < 0.12 ? '#e0822a' : '#e0402a'; };
  for (let px = L; px < PW - R; px++) {
    const sM = ((px - L) / (PW - L - R)) * S.laenge, i = Math.max(0, Math.min(n - 1, Math.round(sM)));
    y.fillStyle = farbeSt(steigung[i]); y.fillRect(px, Math.round(HY(S.py[i])), 1, PH - U - Math.round(HY(S.py[i])));
    y.fillStyle = '#f4f4ee'; y.fillRect(px, Math.round(HY(S.py[i])) - 1, 1, 2);
    y.fillStyle = BELAG_FARBE[N.belag[i]] || '#fff'; y.fillRect(px, PH - U + 14, 1, 6);
  }
  for (const i of kuppen) { pixelText(y, 'KUPPE', Math.round(SX(i)), Math.round(HY(S.py[i])) - 18, 1, '#f4f4ee', 'mitte'); y.fillStyle = '#f4f4ee'; y.fillRect(Math.round(SX(i)) - 1, Math.round(HY(S.py[i])) - 9, 3, 6); }
  for (const i of senken) { pixelText(y, 'SENKE', Math.round(SX(i)), Math.round(HY(S.py[i])) + 8, 1, '#9be0ff', 'mitte'); }
  // M10c: Sprünge – Kante (Pfeil und Name) und Landezone (oranger Balken unter dem Profil)
  for (const z of S.sprungZonen || []) {
    const k = Math.round(z.kante), xk = Math.round(SX(k)), yk = Math.round(HY(S.py[k]));
    y.fillStyle = '#ff9a3a'; y.fillRect(xk - 1, yk - 16, 3, 12); y.fillRect(xk - 3, yk - 14, 7, 2);
    pixelText(y, `SPRUNG ${z.name}`, xk, yk - 26, 1, '#ff9a3a', 'mitte');
    y.fillRect(Math.round(SX(z.landeVon)), Math.round(HY(S.py[Math.round(z.landeVon)])) + 3, Math.max(2, Math.round(SX(z.landeBis) - SX(z.landeVon))), 3);
  }
  const linie = (sM, t, f) => { y.fillStyle = f; for (let yy = O; yy < PH - U; yy += 4) y.fillRect(Math.round(SX(sM)), yy, 1, 2); pixelText(y, t, Math.round(SX(sM)), O - 12, 1, f, 'mitte'); };
  linie(S.startS, 'START', '#5bd16b'); linie(S.zielS, 'ZIEL', '#f4f4ee');
  A.checkpoints.forEach((cp) => linie(cp.s, `CP${cp.nummer}`, '#f0c020'));
  pixelText(y, `HÖHENPROFIL ${STRECKE.name.de}: ${Math.round(hoch)} M HOCH, ${Math.round(runter)} M RUNTER, MAX. +${r1(maxSt * 100)} % / -${r1(maxGef * 100)} %`, L, 8, 1, '#f4f4ee', 'links', null);
  let qx = L;
  for (const [t, f] of [['UNTER 4 %', '#4fa84a'], ['4-8 %', '#c9b83a'], ['8-12 %', '#e0822a'], ['ÜBER 12 %', '#e0402a'], ['ASPHALT', BELAG_FARBE.asphalt], ['SCHOTTER', BELAG_FARBE.schotter], ['WIESENWEG', BELAG_FARBE.wiesenweg]]) {
    y.fillStyle = f; y.fillRect(qx, PH - 22, 10, 10);
    qx += 14 + pixelText(y, t, qx + 14, PH - 20, 1, '#c9c9bd', 'links', null) + 14;
  }
  pixelText(y, 'METER', PW - R, PH - U + 4, 1, '#8a9096', 'rechts', null);
  const profil = p.toDataURL();

  const bericht = [
    `Strecke: ${STRECKE.id} (${STRECKE.name.de} / ${STRECKE.name.en}), Etappe ${STRECKE.etappe}`,
    `Länge: ${S.laenge.toFixed(3)} m (Start ${S.startS} m, Ziel ${S.zielS.toFixed(1)} m, gefahren ${(S.zielS - S.startS).toFixed(1)} m)`,
    `Höhenmeter: ${Math.round(hoch)} m hoch, ${Math.round(runter)} m runter (tiefster Punkt ${r1(Math.min(...S.py))} m, höchster ${r1(Math.max(...S.py))} m)`,
    `Steigung (über ${F} m): max. +${r1(maxSt * 100)} % bei ${maxStS} m, Gefälle max. -${r1(maxGef * 100)} % bei ${maxGefS} m`,
    `Engster Kurvenradius: ${r1(rMin)} m bei ${rMinS} m; enge Kurven (Radius unter ${ENG} m): ${engeKurven.length} (${engeKurven.map((e) => `${e.von}–${e.bis}`).join(', ')})`,
    `Kuppen: ${kuppen.length}${kuppen.length ? ` (${kuppen.join(', ')} m)` : ''}, Senken: ${senken.length}${senken.length ? ` (${senken.join(', ')} m)` : ''} (wie die Pace-Notes sie ansagen)`,
    `Belag zwischen Start und Ziel: ${Object.entries(anteile).map(([b, z]) => `${b} ${(z / (bis - von + 1) * 100).toFixed(1)} %`).join(', ')}`,
    `Felswand: ${wandM} m`,
    `Nebenwege: ${N.nebenwege.map((w) => `${w.name} (${w.belag}, ${w.abzweig}–${w.einmuendung} m)`).join(', ') || 'keine'}`,
    `Abkürzungen: nicht schneiden ${(S.nichtSchneiden || []).length}, schneiden ${(S.schneiden || []).length}`,
    `Pace-Notes: ${P.notes.length} (${Object.entries(notizen.flatMap((nt) => nt.arten).reduce((o, a) => ({ ...o, [a]: (o[a] || 0) + 1 }), {})).map(([a, z]) => `${a} ${z}`).join(', ')})`,
    `Checkpoints: ${A.checkpoints.length} (${A.checkpoints.map((cp) => `${cp.s} m`).join(', ')})`,
    `Sprünge: ${(S.sprungZonen || []).length}${(S.sprungZonen || []).length ? ` (${S.sprungZonen.map((z) => `${z.name} Kante ${z.kante} m, Landezone ${z.landeVon}–${z.landeBis} m`).join('; ')})` : ''}`,
    `Abschnitte: ${S.abschnitte.map((a) => `${a.name} ${Math.round(a.von)}–${Math.round(a.bis)}`).join(', ')}`,
  ];
  return { karte, profil, bericht, id: STRECKE.id };
});
await spiel.schliessen();
const schreibe = (name, url) => fs.writeFileSync(path.join(ordner, name), Buffer.from(url.split(',')[1], 'base64'));
schreibe(`${erg.id}-karte.png`, erg.karte);
schreibe(`${erg.id}-profil.png`, erg.profil);
fs.writeFileSync(path.join(ordner, `${erg.id}-bericht.txt`), `${erg.bericht.join('\n')}\n`);
console.log(erg.bericht.join('\n'));
console.log(`Bilder und Bericht: ${ordner}/${erg.id}-karte.png, ${erg.id}-profil.png, ${erg.id}-bericht.txt`);
