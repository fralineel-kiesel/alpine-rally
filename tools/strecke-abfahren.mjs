// Strecke mit dem Testfahrer abfahren (M10a):  node tools/strecke-abfahren.mjs [<datei> | --strecke <id>] [--auto <id>] [--aus <datei.txt>] [--stil digital]
// M10c: --json <datei> schreibt die Sprünge je Stil (Flugweite, Zeit, Höhe, Verlust, Tempo an Kuppen/Kanten) als JSON.
// Lädt das Spiel im Headless-Chromium mit dieser Streckendatei (statt strecken/alpen.js) und lässt den vorhandenen
// Testfahrer (tools/testfahrer-browser.js, fahreEtappe – nicht neu geschrieben) die Etappe in der echten Physik fahren,
// in den drei Stilen vorsichtig / mittel / flott wie tools/testfahrer.mjs. Meldet Gesamtzeit, Zwischenzeiten, Aufpralle,
// Stellen mit Abkommen (Gras), Wandnähe (Felswand) und Stillstand, höchstes Tempo je Abschnitt.
// Ganze Ausgabe in die Datei (Standard /tmp/strecke-abfahren-<id>-<auto>.txt), im Terminal nur die Zusammenfassung.
// Für die Alpen muss es die Zeiten von tools/testfahrer.mjs treffen (Beleg, Test (l) in tools/m10a-test.mjs).

import fs from 'node:fs';
import path from 'node:path';
import { streckenWahl } from './strecke-erzeugt.mjs';
import { starteSpiel, WURZEL, AUTO } from './spiel-browser.mjs';

const arg = (name) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : null; };
// Strecke: Datei als Argument oder (seit M10b) --strecke <id oder Datei>, Standard alpen
const datei = process.argv.slice(2).find((a, i, l) => !a.startsWith('--') && !(l[i - 1] || '').startsWith('--')) || streckenWahl().datei;
if (!datei || !fs.existsSync(datei)) { console.log('Aufruf: node tools/strecke-abfahren.mjs [<datei> | --strecke <id>] [--auto <id>] [--aus <datei.txt>]'); process.exit(1); }
const inhalt = fs.readFileSync(datei, 'utf8');
const id = (/id: '([^']+)'/.exec(inhalt) || [])[1] || path.basename(datei, '.js');
const aus = arg('--aus') || `/tmp/strecke-abfahren-${id}-${AUTO}.txt`;
const fmt = (t) => (t == null ? '--' : `${Math.floor(t / 60)}:${(t % 60).toFixed(2).padStart(5, '0')}`);

// M10b.2: --wurzel <ordner>: Spiel aus einem anderen Stand (z. B. 0.10b.1 zum Vergleich), Testfahrer aus diesem Stand
const spiel = await starteSpiel(arg('--wurzel') ? { wurzel: path.resolve(arg('--wurzel')) } : {});
// Streckendatei unterschieben: das Spiel lädt sie über window.__streckeAdresse (js/strecken.js, nur für Werkzeuge)
await spiel.page.route('**/__strecke/**', (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: inhalt }));
await spiel.page.addInitScript((n) => { window.__streckeAdresse = `${location.origin}/__strecke/${n}`; }, path.basename(datei));
const fehlerSeite = [];
spiel.page.on('pageerror', (e) => fehlerSeite.push(String(e.message || e)));
await spiel.page.goto(`${spiel.url}/index.html?menue=aus&ton=aus`);
await spiel.page.waitForFunction(() => window.__alpineRally || window.__fehlerseite, null, { timeout: 180000, polling: 100 });
const fs0 = await spiel.page.evaluate(() => window.__fehlerseite || null);
if (fs0) { console.log(`FEHLER: Strecke lässt sich nicht laden (${fs0.grund}): ${fs0.mehr}`); await spiel.schliessen(); process.exit(1); }
const fahrerCode = fs.readFileSync(path.join(WURZEL, 'tools/testfahrer-browser.js'), 'utf8');
await spiel.page.evaluate((code) => { window.__fahrerUrl = URL.createObjectURL(new Blob([code], { type: 'text/javascript' })); }, fahrerCode);

const zeilen = [`Strecke ${id} (${datei}), Fahrprofil ${AUTO}`];
// M10c: markierte Kuppen (Feld sprung, s) aus der Datei – Tempo dort wird gemeldet (auch ohne Sprungzone)
const sprungBlock = (/\n  sprung: \[([\s\S]*?)\n  \],/.exec(inhalt) || [])[1] || '';
const MARKEN = [...sprungBlock.matchAll(/\{ s: ([\d.]+), name: '([^']+)'/g)].map((m) => ({ s: +m[1], name: m[2] }));
const sprungStat = []; // je Stil: Sprünge (für --json)
const zeiten = [];
let probleme = 0;
// M10b.2: --stil <name[,name]> wählt die Stile (z. B. digital = Tastatur/Controller wie Lino), Standard die drei bisherigen
const STILE = arg('--stil') ? arg('--stil').split(',') : ['vorsichtig', 'mittel', 'flott'];
for (const profil of STILE) {
  const r = await spiel.page.evaluate(async ([profil, MARKEN]) => {
    const f = await import(window.__fahrerUrl);
    const A = window.__alpineRally, S = A.strecke, C = A.CONFIG, q = {};
    const ab = S.abschnitte.map((a) => ({ name: a.name, von: a.von, bis: a.bis, max: 0 }));
    const gras = [], wand = [], stand = [];
    let grasAn = null, wandAn = null, standT = 0, standS = null;
    // Tempoprofil (M10b.1): Tempo je Streckenmeter (höchstes Tempo, das dort gefahren wurde)
    const tempo = new Float32Array(Math.ceil(S.laenge) + 2);
    // Aufprall-Stellen (M10b.1): seitlicher Abstand zur Mitte und Material (nur lesen)
    const stellen = [];
    let aufLetzt = A.kollision.letzterAufprall;
    // M10c: Sprünge (nur lesen): je Landung Flugweite, Flugzeit, Höhe, Tempoverlust; Flug ausserhalb einer Zone = Fehler
    const F = A.flug, Z = S.sprungZonen || [], spruenge = [];
    let landLetzt = F ? F.ereignis.landung : 0, ausserhalb = 0, luftSchritte = 0;
    const inZone = (s) => Z.some((z) => s >= z.von && s <= z.bis);
    // M10c.1: Wandkontakte (Leitplanke, Zaun, Geländer, Absperr-Wand, Felswand) als Episoden (neu, wenn 0.25 s keiner war):
    // ab 0.10c.1 aus A.wand, in älteren Ständen aus dem Material des Kontakts (Metall/Holz) und der Felswand-Nähe.
    // zeitBei: Rennuhr beim ersten Erreichen jedes 10. Meters (für den Zeitvergleich je Kurve)
    const MAT = (C.audio && C.audio.aufprall && C.audio.aufprall.materialien) || [];
    const wandMat = new Set(['metall', 'holz'].map((m) => MAT.indexOf(m)));
    const wandKontakte = []; let wandLetzt = -99, wandEp = null;
    const zeitBei = new Float64Array(Math.ceil(S.laenge / 10) + 2).fill(-1);
    // je Schritt nur lesen (die Physik merkt nichts davon)
    const proSchritt = () => {
      if (A.rennen.zustand !== 'laeuft') return;
      const p = A.physik, s = A.rennen.letztesS;
      S.abfrage(p.x, p.z, q);
      const a = ab[S.abschnittNr[Math.max(0, Math.min(S.anzahl - 1, Math.round(q.s)))]];
      if (a) a.max = Math.max(a.max, p.tempo * 3.6);
      if (A.kollision.letzterAufprall !== aufLetzt) {
        aufLetzt = A.kollision.letzterAufprall;
        const mat = (C.audio && C.audio.aufprall && C.audio.aufprall.materialien) || [];
        const m = mat[A.kollision.wuchtArt];
        stellen.push(`${Math.round(s)} m (${q.seite >= 0 ? 'rechts' : 'links'} ${Math.abs(q.seite).toFixed(1)} m, ${m || A.kollision.wuchtArt})`);
      }
      const iT = Math.round(s);
      if (iT >= 0 && iT < tempo.length) tempo[iT] = Math.max(tempo[iT], p.tempo * 3.6);
      const art = A.welt.bodenBei(p.x, p.z, q).art; // (q: Ergebnis der Streckenabfrage, wie im Testfahrer)
      if (art === 'gras') { if (grasAn == null) grasAn = s; } else if (grasAn != null) { gras.push([grasAn, s]); grasAn = null; }
      const anWand = q.wandSeite !== 0 && q.wandStaerke > 0.5 && Math.sign(q.seite) === q.wandSeite && Math.abs(q.seite) > C.grenze.wandGrenze - 0.3;
      const iz = Math.floor(s / 10); if (iz >= 0 && iz < zeitBei.length && zeitBei[iz] < 0) zeitBei[iz] = A.rennen.uhr;
      const wk = A.wand ? A.wand.kontakt : (wandMat.has(A.kollision.kontaktArt) || anWand);
      if (wk) {
        if (A.rennen.uhr - wandLetzt > 0.25) { wandEp = { s: Math.round(s), kmh: Math.round(p.tempo * 3.6), strafen: 0 }; wandKontakte.push(wandEp); }
        if (A.wand && A.wand.strafe) wandEp.strafen++;
        wandLetzt = A.rennen.uhr;
      }
      if (anWand) { if (wandAn == null) wandAn = s; } else if (wandAn != null) { wand.push([wandAn, s]); wandAn = null; }
      if (F) {
        if (F.inLuft) { luftSchritte++; if (!inZone(F.startS)) ausserhalb++; }
        if (F.ereignis.landung !== landLetzt) {
          landLetzt = F.ereignis.landung;
          const L = F.letzteLandung, z = Z[L.zone];
          spruenge.push({ zone: L.zone, name: z ? z.name : '?', startS: L.startS, s: L.s, seite: L.seite, weite: L.weite, zeit: L.zeit, hoehe: L.hoehe,
            verlust: L.verlust, abTempo: L.abTempo * 3.6, vSenk: L.vSenk, nase: L.winkel, gier: L.gier, klasse: L.klasse, inLandezone: z ? L.s >= z.landeVon && L.s <= z.landeBis : false,
            aufStrasse: Math.abs(L.seite) <= C.strasse.breite / 2 + C.strasse.bankett + 2.5 });
        }
      }
      if (p.tempo < 0.5) { standT += A.SCHRITT; if (standS == null) standS = s; } else { if (standT > 1 && standS != null) stand.push([standS, standT]); standT = 0; standS = null; }
    };
    const wb0 = A.wasserBad ? A.wasserBad.anzahl : 0; // M10c.1: Wasserbäder in diesem Lauf
    const e = f.fahreEtappe(A, profil, proSchritt);
    const wasserBad = A.wasserBad ? A.wasserBad.anzahl - wb0 : 0;
    if (grasAn != null) gras.push([grasAn, A.rennen.letztesS]);
    if (wandAn != null) wand.push([wandAn, A.rennen.letztesS]);
    // Tempoprofil: Anteil der gefahrenen Meter (Start bis Ziel) nahe dem Höchsttempo des Laufs (ab 90 %), Schnitt
    const sA = Math.ceil(C.strasse.startBeiMeter), sZ = Math.floor(A.rennen.zielS || (S.laenge - C.strasse.zielVorEnde));
    let vMax = 0, nah = 0, n = 0;
    for (let i = sA; i < sZ; i++) vMax = Math.max(vMax, tempo[i]);
    for (let i = sA; i < sZ; i++) { if (tempo[i] > 0) { n++; if (tempo[i] >= 0.9 * vMax) nah++; } }
    const profil100 = [];
    const zeit100 = []; // Sekunden je 100 m (aus dem Tempo je Meter)
    for (let i = sA; i < sZ; i += 100) {
      let m = 0, t = 0;
      for (let j = i; j < Math.min(sZ, i + 100); j++) { m = Math.max(m, tempo[j]); t += tempo[j] > 0 ? 3.6 / tempo[j] : 0; }
      profil100.push(Math.round(m)); zeit100.push(t.toFixed(1));
    }
    const tempoMarken = MARKEN.map((m) => ({ ...m, kmh: tempo[Math.round(m.s)] || 0 }));
    const tempoKanten = Z.map((z) => ({ name: z.name, s: z.kante, kmh: Math.max(...[-3, -2, -1, 0].map((d) => tempo[Math.round(z.kante) + d] || 0)) }));
    return { ...e, ab, gras, wand, stand, wandKontakte, wasserBad, zeitBei: Array.from(zeitBei), stellen, spruenge, ausserhalb, luftSchritte, tempoMarken, tempoKanten, checkpoints: A.checkpoints.map((c) => c.s), wandGrenze: C.grenze.wandGrenze,
      tempoProfil: { vMax, nahAnteil: n ? nah / n : 0, gefahren: sZ - sA, profil100, zeit100 } };
  }, [profil, MARKEN]);
  sprungStat.push({ stil: profil, zeit: r.ziel ? r.zeit : null, cps: r.cps, aufpralle: r.aufpralle.length, aufprallListe: r.aufpralle, wandKontakte: r.wandKontakte, zeitBei: r.zeitBei, wasserBad: r.wasserBad, gras: r.gras, spruenge: r.spruenge, ausserhalb: r.ausserhalb, luftSchritte: r.luftSchritte, tempoMarken: r.tempoMarken, tempoKanten: r.tempoKanten });
  zeiten.push(r.ziel ? fmt(r.zeit) : 'NICHT IM ZIEL');
  const m = (l) => l.map(([a, b]) => `${Math.round(a)}–${Math.round(b)} m`).join(', ') || 'keine';
  zeilen.push('', `${profil}: ${r.ziel ? fmt(r.zeit) : 'NICHT IM ZIEL'}`,
    `  Zwischenzeiten: ${r.cps.map((t, i) => `CP${i + 1} (${r.checkpoints[i]} m) ${fmt(t)}`).join(', ')}`,
    `  Aufpralle: ${r.aufpralle.length ? r.aufpralle.join(', ') : 'keine'}; hängen geblieben: ${r.haenger}; max. ${r.maxAbstand.toFixed(1)} m neben der Mitte`,
    `  Aufprall-Stellen: ${r.stellen.join(', ') || 'keine'}`,
    `  Wandkontakte (M10c.1): ${r.wandKontakte.length}${r.wandKontakte.length ? ` – ${r.wandKontakte.map((k) => `${k.s} m (${k.kmh} km/h${k.strafen ? `, ${k.strafen} Strafe${k.strafen > 1 ? 'n' : ''}` : ''})`).join(', ')}` : ''}`,
    `  Abkommen (Gras): ${m(r.gras)}`,
    `  Wandnähe (Felswand: Automitte mehr als ${(r.wandGrenze - 0.3).toFixed(1)} m neben der Mitte auf der Wandseite): ${m(r.wand)}`,
    `  Stillstand über 1 s: ${r.stand.map(([s, t]) => `${Math.round(s)} m (${t.toFixed(1)} s)`).join(', ') || 'keiner'}`,
    `  Tempoprofil: Schnitt ${r.ziel ? ((r.tempoProfil.gefahren / r.zeit) * 3.6).toFixed(1) : '--'} km/h, Höchsttempo ${Math.round(r.tempoProfil.vMax)} km/h, nahe Höchsttempo (ab 90 %) auf ${(r.tempoProfil.nahAnteil * 100).toFixed(1)} % der Strecke`,
    `  Höchstes Tempo je 100 m: ${r.tempoProfil.profil100.join(' ')}`,
    `  Sekunden je 100 m: ${r.tempoProfil.zeit100.join(' ')}`,
    '  Höchstes Tempo je Abschnitt:',
    ...r.ab.map((a) => `    ${a.name.padEnd(16)} ${Math.round(a.von)}–${Math.round(a.bis)} m: ${Math.round(a.max)} km/h`));
  // M10c: Sprünge
  if (r.tempoMarken.length) zeilen.push(`  Tempo an den markierten Kuppen: ${r.tempoMarken.map((m) => `${m.name} ${m.s} m ${Math.round(m.kmh)} km/h`).join(', ')}`);
  if (r.tempoKanten.length) zeilen.push(`  Tempo an den Kanten: ${r.tempoKanten.map((m) => `${m.name} ${Math.round(m.s)} m ${Math.round(m.kmh)} km/h`).join(', ')}`);
  zeilen.push(`  Sprünge: ${r.spruenge.length}${r.ausserhalb ? `, FLUG AUSSERHALB EINER ZONE: ${r.ausserhalb} Schritte` : ''}`);
  for (const j of r.spruenge) zeilen.push(`    ${j.name.padEnd(14)} ab ${Math.round(j.startS)} m mit ${Math.round(j.abTempo)} km/h: Weite ${j.weite.toFixed(1)} m, Zeit ${j.zeit.toFixed(2)} s, Höhe ${j.hoehe.toFixed(2)} m, gelandet ${Math.round(j.s)} m (${j.inLandezone ? 'Landezone' : 'AUSSERHALB'}, ${j.seite.toFixed(1)} m neben der Mitte), Verlust ${(j.verlust * 100).toFixed(1)} % (${j.klasse}, senkrecht ${j.vSenk.toFixed(1)} m/s, Nase ${j.nase.toFixed(1)}°, Gier ${j.gier.toFixed(1)}°)`);
  for (const w of r.wege || []) zeilen.push(`  Nebenweg ${w.name} (${w.belag}): ${w.zeit.toFixed(2)} s, max. ${w.maxAbstand.toFixed(1)} m neben der Mitte, neben dem Weg ${w.daneben.toFixed(2)} s`);
  if (!r.ziel) probleme++;
  console.log(`${profil.padEnd(10)} ${r.ziel ? fmt(r.zeit) : 'NICHT IM ZIEL'}  CPs ${r.cps.map(fmt).join(' / ')}  Aufpralle ${r.aufpralle.length}, Wand ${r.wandKontakte.length}x, Wasser ${r.wasserBad}x, Gras ${r.gras.length}x, Wandnähe ${r.wand.length}x, Stillstand ${r.stand.length}x${r.spruenge.length ? `, Sprünge ${r.spruenge.map((j) => `${j.weite.toFixed(0)} m/${(j.verlust * 100).toFixed(0)} %`).join(' ')}` : ''}${r.ausserhalb ? ' FLUG AUSSERHALB!' : ''}`);
  if (process.argv.includes('--tempo')) console.log(`           Schnitt ${r.ziel ? ((r.tempoProfil.gefahren / r.zeit) * 3.6).toFixed(1) : '--'} km/h, nahe Höchsttempo ${(r.tempoProfil.nahAnteil * 100).toFixed(1)} % (Höchsttempo ${Math.round(r.tempoProfil.vMax)} km/h)`);
}
if (fehlerSeite.length) zeilen.push('', `Konsole: ${fehlerSeite.join(' | ')}`);
fs.writeFileSync(aus, `${zeilen.join('\n')}\n`);
if (arg('--json')) fs.writeFileSync(arg('--json'), JSON.stringify({ strecke: id, auto: AUTO, stile: sprungStat }, null, 1)); // M10c
console.log(`Gesamtzeiten: ${zeiten.join(' / ')}`);
console.log(`Bericht: ${aus}`);
await spiel.schliessen();
process.exit(probleme ? 1 : 0); // 1 = nicht ins Ziel gekommen (Aufpralle usw. stehen nur im Bericht)
