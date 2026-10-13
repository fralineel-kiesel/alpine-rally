// Automatischer Testfahrer (seit Meilenstein 1.2 als Werkzeug im Projekt).
//
//   node tools/testfahrer.mjs              ganze Etappe mit drei Fahrprofilen
//   node tools/testfahrer.mjs --schneiden  Zeitvergleich Ideallinie / geschnittene Linie je Kurve,
//                                          schreibt tools/schneiden-zeiten.json (für tools/abkuerzungen.mjs)
//   --wurzel <ordner>                      ein anderes Projekt fahren (z. B. alte Version zum Vergleich)
//
// Fährt mit der echten Fahrphysik im Headless-Browser (siehe tools/testfahrer-browser.js).

import fs from 'node:fs';
import path from 'node:path';
import { starteSpiel, WURZEL } from './spiel-browser.mjs';

const arg = (name) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : null; };
const wurzel = arg('--wurzel') ? path.resolve(arg('--wurzel')) : WURZEL;
const schneiden = process.argv.includes('--schneiden');
const fmtZeit = (t) => (t == null ? '--' : `${Math.floor(t / 60)}:${(t % 60).toFixed(2).padStart(5, '0')}`);

const spiel = await starteSpiel({ wurzel });
await spiel.ladeSpiel();
// Fahrer-Modul immer aus diesem Projekt (auch beim Fahren einer anderen Version)
const fahrerCode = fs.readFileSync(path.join(WURZEL, 'tools/testfahrer-browser.js'), 'utf8');
await spiel.page.evaluate((code) => { window.__fahrerUrl = URL.createObjectURL(new Blob([code], { type: 'text/javascript' })); }, fahrerCode);

if (!schneiden) {
  console.log(`Etappe (${wurzel === WURZEL ? 'dieses Projekt' : wurzel}):`);
  for (const profil of (arg('--profile') || 'vorsichtig,mittel,flott').split(',')) {
    const r = await spiel.page.evaluate(async (profil) => {
      const f = await import(window.__fahrerUrl);
      return f.fahreEtappe(window.__alpineRally, profil);
    }, profil);
    console.log(`  ${profil.padEnd(10)} ${r.ziel ? fmtZeit(r.zeit) : 'NICHT IM ZIEL'}  CPs ${r.cps.map(fmtZeit).join(' / ')}` +
      `  Aufpralle: ${r.aufpralle.length ? r.aufpralle.join(', ') : 'keine'}  hängen geblieben: ${r.haenger}` +
      `  max. neben der Mitte ${r.maxAbstand.toFixed(1)} m  nächste Sperre ${r.nahSperre.toFixed(1)} m` +
      (r.gangWechsel ? `  Gangwechsel ${r.gangWechsel} (davon Hin und Her: ${r.hinUndHer})` : ''));
  }
} else {
  // Für jede Kurvenzone (ohne Sperren gemessen): die besten Abkürzungen fahren
  const erg = await spiel.page.evaluate(async () => {
    const A = window.__alpineRally;
    const f = await import(window.__fahrerUrl);
    const m = await import('/tools/abkuerzungen-analyse.js');
    const { baueKollision } = await import('/js/kollision.js');
    const { ABKUERZUNGEN } = await import('/js/abkuerzungen.js');
    // ohne Sperren: Kollision nur mit den Bäumen und Steinen aus M1
    const basis = baueKollision(A.pflanzen.hindernisse.filter((h) => !h.sperre));
    const original = A.kollision.loese;
    A.kollision.loese = basis.loese.bind(basis);
    const linien = m.findeAbkuerzungen(A.strecke, A.welt, basis).concat(m.findeAbkuerzungen(A.strecke, A.welt, basis, { breite: 1.8 }));
    const { zonen } = m.kurvenZonen(A.strecke, linien);
    const gesperrt = (z) => ABKUERZUNGEN.nichtSchneiden.some((k) => k.sVon <= z.sBis && k.sBis >= z.sVon && (k.seite === 'rechts') === (z.seite > 0));
    const liste = [];
    for (const z of zonen) {
      // die Linien mit dem grössten Gewinn, aber an verschiedenen Stellen
      const kandidaten = [];
      for (const l of z.linien.slice().sort((a, b) => b.gewinn - a.gewinn)) {
        if (kandidaten.some((k) => Math.abs(k.i - l.i) < 6 && Math.abs(k.j - l.j) < 6)) continue;
        kandidaten.push(l);
        if (kandidaten.length >= 8) break;
      }
      let best = null;
      const alle = [];
      for (const l of kandidaten) {
        const r = f.vergleicheSchnitt(A, l, 'mittel');
        alle.push({ gewinnM: l.gewinn, ...r });
        if (r.ok && (!best || r.gewinn > best.gewinn)) best = { ...r, gewinnM: l.gewinn, sVon: l.sVon, sBis: l.sBis };
      }
      liste.push({ sVon: z.sVon, sBis: z.sBis, seite: z.seite > 0 ? 'rechts' : 'links', gewinnM: z.gewinn, gesperrt: gesperrt(z), best, versuche: alle.length, gescheitert: alle.filter((r) => !r.ok).length });
    }
    A.kollision.loese = original;
    return liste;
  });
  console.log('Zeitvergleich je Kurve (Profil "mittel", ohne Sperren): Ideallinie (höchstens 4.5 m neben der Mitte,');
  console.log('also Strasse und Bankett) gegen die beste geschnittene Linie über die Wiese.');
  console.log('| Kurve | Innenseite | heute | Weg-Gewinn | Ideallinie | geschnitten | Zeitgewinn Schneiden | Zeit auf Gras | Versuche |');
  console.log('|---|---|---|---|---|---|---|---|---|');
  const zeitGewinn = {};
  for (const z of erg) {
    const b = z.best;
    zeitGewinn[z.sVon] = b ? Math.round(b.gewinn * 100) / 100 : null;
    console.log(`| ${z.sVon} – ${z.sBis} | ${z.seite} | ${z.gesperrt ? 'gesperrt' : 'frei'} | ${z.gewinnM.toFixed(1)} m |` +
      (b ? ` ${b.ideal.toFixed(2)} s | ${b.schnitt.toFixed(2)} s | ${b.gewinn >= 0 ? '+' : ''}${b.gewinn.toFixed(2)} s | ${b.grasSchnitt.toFixed(2)} s |`
        : ' - | - | - | - |') + ` ${z.versuche} (${z.gescheitert} mit Aufprall) |`);
  }
  fs.writeFileSync(path.join(WURZEL, 'tools/schneiden-zeiten.json'), JSON.stringify({
    hinweis: 'Automatisch erzeugt von node tools/testfahrer.mjs --schneiden. Zeitgewinn (s) beim Schneiden je Kurve (Schlüssel = Streckenmeter Kurvenanfang).',
    zeitGewinn,
  }, null, 2) + '\n');
  console.log('-> tools/schneiden-zeiten.json geschrieben');
}
if (spiel.fehler.length) console.log(`Fehler im Spiel: ${spiel.fehler.length}`);
await spiel.schliessen();
