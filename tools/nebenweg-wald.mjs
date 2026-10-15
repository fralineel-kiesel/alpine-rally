// Waldrand am Nebenweg prüfen (Meilenstein 3a.1):  node tools/nebenweg-wald.mjs [--wurzel <ordner>] [--profile mittel,flott] [--weg Name]
// Seit M3b für jeden Nebenweg (Bereich: 65 m vor dem Abzweig bis 90 m nach der Einmündung), --weg: nur diesen.
//
// Lohnt sich Abkürzen am Nebenweg (über die Kreuzungsecken, durch den Wald auf Gras)?
//   1. Alle geraden Abkürzungs-Linien im Bereich des Nebenwegs (wie tools/abkuerzungen.mjs: spart
//      mindestens abkuerzung.minGewinn Meter, Auto 2.2 m bzw. 1.8 m breit kommt durch, führt aufs Gras),
//      mit allen Hindernissen des Spiels (Bäume, Steine, Zäune, Absperrungen ...).
//   2. Pro Kurve die besten Linien mit der echten Fahrphysik fahren (tools/testfahrer-browser.js,
//      vergleicheSchnitt): Ideallinie auf Strasse/Bankett gegen die geschnittene Linie übers Gras.
//      Zeitgewinn > 0 = Abkürzen ist schneller -> dort braucht es mehr Hindernisse.
//   3. Wie viele Bäume, Steine stehen am Nebenweg (Waldrand), wie viele insgesamt im Bereich.
// Das Spiel selbst lädt diese Datei nicht.

import fs from 'node:fs';
import path from 'node:path';
import { starteSpiel, WURZEL } from './spiel-browser.mjs';

const arg = (name) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : null; };
const wurzel = arg('--wurzel') ? path.resolve(arg('--wurzel')) : WURZEL;
const profile = (arg('--profile') || 'mittel,flott').split(',');
const nurWeg = arg('--weg');

const spiel = await starteSpiel({ wurzel });
await spiel.ladeSpiel();
const fahrerCode = fs.readFileSync(path.join(WURZEL, 'tools/testfahrer-browser.js'), 'utf8');
const analyseCode = fs.readFileSync(path.join(WURZEL, 'tools/abkuerzungen-analyse.js'), 'utf8');
await spiel.page.evaluate(([f]) => { window.__fahrerUrl = URL.createObjectURL(new Blob([f], { type: 'text/javascript' })); }, [fahrerCode, analyseCode]);

const wege = await spiel.page.evaluate(() => window.__alpineRally.netz.nebenwege.map((w) => ({ name: w.name, von: w.abzweig, bis: w.einmuendung })));
let schneller = 0;
for (const weg of wege) {
if (nurWeg && weg.name !== nurWeg) continue;
const VON = Math.round(weg.von - 65), BIS = Math.round(weg.bis + 90);
const erg = await spiel.page.evaluate(async ({ VON, BIS, profile }) => {
  const A = window.__alpineRally, S = A.strecke;
  const f = await import(window.__fahrerUrl);
  const m = await import('/tools/abkuerzungen-analyse.js');
  // nur Linien, die im Bereich anfangen und aufhören (Analyse über die ganze Strecke, dann filtern)
  // (M3b: auch Linien, die vor dem Bereich anfangen und in ihm enden, z. B. aus einer freien Kurve davor
  // über die Ecke des Abzweigs – sie müssen am Nebenweg liegen: Ende nach dem Abzweig bzw. Anfang vor der Einmündung)
  const imBereich = (l) => (l.sVon >= VON && l.sBis <= BIS) || (l.sBis > VON + 65 && l.sVon < BIS - 90);
  const linien = m.findeAbkuerzungen(S, A.welt, A.kollision).filter(imBereich)
    .concat(m.findeAbkuerzungen(S, A.welt, A.kollision, { breite: 1.8 }).filter(imBereich));
  const { zonen } = m.kurvenZonen(S, linien);
  const ergebnis = [];
  for (const z of zonen) {
    const kandidaten = [];
    for (const l of z.linien.slice().sort((a, b) => b.gewinn - a.gewinn)) {
      if (kandidaten.some((k) => Math.abs(k.i - l.i) < 6 && Math.abs(k.j - l.j) < 6)) continue;
      kandidaten.push(l);
      if (kandidaten.length >= 8) break;
    }
    let best = null;
    for (const l of kandidaten) {
      for (const p of profile) {
        const r = f.vergleicheSchnitt(A, l, p);
        if (r.ok && (!best || r.gewinn > best.gewinn)) best = { ...r, profil: p, gewinnM: l.gewinn, sVon: l.sVon, sBis: l.sBis };
      }
    }
    ergebnis.push({ sVon: z.sVon, sBis: z.sBis, seite: z.seite > 0 ? 'rechts' : 'links', gewinnM: z.gewinn, linien: z.linien.length, best });
  }
  // Bäume und Steine im Bereich (bis 40 m neben der Etappe)
  const q = {};
  const imFeld = (t) => { S.abfrage(t.x, t.z, q); return q.s >= VON && q.s <= BIS && q.abstand < 40; };
  const P = A.pflanzen;
  const zaehl = {
    waldrand: P.tannen.filter((t) => t.nebenwegWald && imFeld(t)).length,
    waldrandSteine: P.steine.filter((t) => t.nebenwegWald && imFeld(t)).length,
    tannen: P.tannen.filter(imFeld).length, laub: P.laubbaeume.filter(imFeld).length, steine: P.steine.filter(imFeld).length,
  };
  return { linien: linien.length, zonen: ergebnis, zaehl };
}, { VON, BIS, profile });

console.log(`Nebenweg "${weg.name}" – Version: ${wurzel === WURZEL ? 'dieses Projekt' : wurzel}`);
console.log(`Bäume/Steine ${VON}-${BIS} m (bis 40 m neben der Strasse): Waldrand-Tannen ${erg.zaehl.waldrand}, Waldrand-Steine ${erg.zaehl.waldrandSteine}; ` +
  `alle Tannen ${erg.zaehl.tannen}, Laubbäume ${erg.zaehl.laub}, Steine ${erg.zaehl.steine}`);
console.log(`Abkürzungs-Linien (>= minGewinn, 2.2 m und 1.8 m breit): ${erg.linien}`);
for (const z of erg.zonen) {
  const b = z.best;
  if (b && b.gewinn > 0) schneller++;
  console.log(`  Kurve ${z.sVon} – ${z.sBis} (${z.seite}): ${z.linien} Linien, Weg-Gewinn bis ${z.gewinnM.toFixed(1)} m; ` +
    (b ? `beste Linie ${Math.round(b.sVon)}–${Math.round(b.sBis)} (${b.profil}): Ideallinie ${b.ideal.toFixed(2)} s, geschnitten ${b.schnitt.toFixed(2)} s, ` +
      `Zeitgewinn ${b.gewinn >= 0 ? '+' : ''}${b.gewinn.toFixed(2)} s, davon auf Gras ${b.grasSchnitt.toFixed(2)} s` : 'keine Linie fahrbar (Aufprall)') +
    (b && b.gewinn > 0 ? '  <- SCHNELLER' : ''));
}
}
console.log(schneller ? `ERGEBNIS: ${schneller} Kurve(n), in denen Abkürzen schneller ist` : 'ERGEBNIS: Abkürzen ist nirgends schneller als die Strasse');
if (spiel.fehler.length) console.log('Fehler im Spiel:', spiel.fehler);
await spiel.schliessen();
process.exit(schneller ? 1 : 0);
