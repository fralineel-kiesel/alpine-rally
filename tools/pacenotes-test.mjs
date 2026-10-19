// Pace-Notes prüfen (Meilenstein 4, Anzeige seit M4.1 als Kacheln).
//
//   node tools/pacenotes-test.mjs             komplette Liste ausgeben, Grenztempo jeder Kurve mit der echten
//                                             Fahrphysik messen, Prüfungen (a) bis (f)
//   node tools/pacenotes-test.mjs --schreiben dazu js/pacenotes-tempo.js neu schreiben (nach Änderungen an
//                                             Strecke oder Fahrphysik) – nur mit dem Referenzprofil "prototyp"
//   node tools/pacenotes-test.mjs --auto rt4  (seit M8a) Grenztempo mit einem anderen Fahrprofil messen und mit der
//                                             Referenz vergleichen: welche Stufe hätte dieses Auto? (nur melden; die
//                                             Pace-Notes und js/pacenotes-tempo.js bleiben auf der Referenz)
//
// Prüft:
//   (a) jede Stelle, an der die Strasse auf 50 m mehr als pruefWinkel Grad die Richtung ändert, hat eine Kurven-Ansage
//   (b) jeder Eintrag in schneiden/nichtSchneiden steht genau einmal in den Ansagen (und keiner mehr)
//   (c) Stufen passen monoton zum gemessenen Kurventempo (schneller = gleiche oder höhere Stufe), mit Tabelle
//   (d) keine zwei Ansagen näher als 25 m (sonst müssen sie zusammengefasst sein)
//   (e) Abzweig/Einmündung stimmen mit "nebenwege" überein (Meter und Richtung aus dem Strassennetz)
//   (f) die Liste ist bei zwei Läufen (auch nach neuem Laden) genau gleich
//   (a)-(f) laufen auf der internen Liste (mit Texten), die Anzeige zeigt seit M4.1 nur Symbole.
//   (g) Anzeige während einer Testfahrt (Profil "mittel", ganze Etappe): nie mehr als maxKacheln (2) Kacheln
//       gleichzeitig, nichts verschwindet vor der Kurvenmitte (kein Flackern), jede Kachel erscheint, nach dem
//       Ziel keine, nach dem Neustart wieder von vorn; dazu: wie oft 1 bzw. 2 Kacheln zu sehen waren
//   (h) keine Kachel erscheint weiter als 160 m (Kehre/Abzweig/Einmündung: 200 m) vor ihrer Stelle – in der
//       Testfahrt und bei festem Tempo 50, 90 und 140 km/h; und keine erscheint vor ihrem eigenen Zeitfenster
//   (i) Taste R im Rennen: Reset erst nach der Wartezeit (zurueck.wartezeit), nicht früher, nicht doppelt;
//       Auto ist dabei gesperrt (bremst bis zum Stand), Rennzeit läuft weiter; vor dem Start sofort, nach dem
//       Ziel Neustart
//   Stichproben: jede Kurven-Ansage gegen die Testfahrt (gelenkte Richtung, Tempo in der Kurve)
// Dazu: Ladezeit der Berechnung, Fehler in der Browser-Konsole.

import fs from 'node:fs';
import path from 'node:path';
import { starteSpiel, WURZEL, AUTO } from './spiel-browser.mjs';
import { pathToFileURL } from 'node:url';

const schreiben = process.argv.includes('--schreiben');
const PRUEF_WINKEL = 25;    // (a): Richtungsänderung (Grad) auf ...
const PRUEF_STRECKE = 50;   // ... so vielen Metern = muss angesagt sein
const MIN_ABSTAND = 25;     // (d)

const REFERENZ = AUTO === 'prototyp'; // M8a: die Pace-Notes gelten für das Referenzprofil
if (schreiben && !REFERENZ) {
  console.log(`FEHLER --schreiben nur mit dem Referenzprofil "prototyp" (nicht --auto ${AUTO}): die Pace-Notes sagen die Kurve an, nicht das Auto.`);
  process.exit(1);
}
const spiel = await starteSpiel();
await spiel.ladeSpiel();
console.log(`Fahrprofil: ${AUTO}${REFERENZ ? ' (Referenz)' : ' (Vergleich mit der Referenz in js/pacenotes-tempo.js)'}`);

// --- Grenztempo jeder Kurve messen (echte Fahrphysik) ---
const messung = await spiel.page.evaluate(async () => {
  const A = window.__alpineRally;
  const pn = await import('/js/pacenotes.js');
  const m = await import('/tools/pacenotes-browser.js');
  const kurven = pn.findeKurven(A.strecke, A.netz);
  const aus = [];
  kurven.forEach((c, j) => {
    const p = j ? kurven[j - 1] : null;
    const vorher = p && p.bis > c.von - 40 ? { bis: p.bis, grenze: aus[j - 1].grenzeMs } : null;
    const g = m.grenzTempo(A, c, { vorher });
    aus.push({
      von: c.von, bis: c.bis, richtung: c.richtung, winkel: c.winkel, rMin: c.rMin, belag: c.belag, kehre: c.kehre,
      grenzeMs: g.grenze, kmh: g.vollgas ? null : Math.round(g.grenze * 3.6 * 10) / 10, schaetzung: c.kmh, gemessenVorher: c.gemessen,
    });
  });
  A.neustart();
  return aus;
});

if (schreiben) {
  const zeilen = messung.map((k) => `    { von: ${k.von}, bis: ${k.bis}, kmh: ${k.kmh == null ? 'null' : k.kmh} }, // ${k.richtung > 0 ? 'rechts' : 'links'} ${k.winkel.toFixed(0)}°, Radius ${k.rMin.toFixed(0)} m, ${k.belag}${k.kehre ? ', Kehre' : ''}${k.kmh == null ? ', Vollgas' : ''}`);
  fs.writeFileSync(path.join(WURZEL, 'js/pacenotes-tempo.js'), `// Automatisch erzeugt von tools/pacenotes-test.mjs --schreiben – bitte nicht von Hand ändern.
// Neu erzeugen nach Änderungen an Strecke, Belägen oder Fahrphysik: node tools/pacenotes-test.mjs --schreiben
//
// Grenztempo jeder Kurve (km/h), gemessen mit der echten Fahrphysik: Der Testfahrer hält ein festes Tempo
// und folgt der Strassenmitte; das grösste Tempo, bei dem er ohne Aufprall und höchstens 1 m auf dem
// Bankett durchkommt. Gilt für den Belag der Kurve (Schotter, Wiesenweg). kmh: null = Vollgas (die Kurve
// bremst nicht). von/bis = Streckenmeter (so findet js/pacenotes.js die Kurve wieder).
// Daraus macht js/pacenotes.js die Stufe 1-6 (Grenzen: config.js, pacenotes.stufenGrenzen).

export const KURVEN_TEMPO = {
  kurven: [
${zeilen.join('\n')}
  ],
};
`);
  console.log(`-> js/pacenotes-tempo.js geschrieben (${messung.length} Kurven). Für die Prüfung neu laden ...`);
  await spiel.ladeSpiel();
}

// --- Ansagen berechnen (zweimal) und alles für die Prüfungen holen ---
async function hole() {
  return spiel.page.evaluate(async () => {
    const A = window.__alpineRally;
    const pn = await import('/js/pacenotes.js');
    const t0 = performance.now();
    const r = pn.berechnePaceNotes(A.strecke, A.netz);
    const ms = performance.now() - t0;
    const r2 = pn.berechnePaceNotes(A.strecke, A.netz);
    const flach = (x) => x.notes.map((n) => ({
      s: n.s, text: n.text, stufe: n.stufe, arten: n.arten, zusatz: n.zusatz,
      stuecke: n.stuecke.map((t) => `${t.symbol}/${t.farbe}/${t.richtung}`),
      teile: n.teile.map((t) => ({
        art: t.art, s: t.s, sEnde: t.sEnde, sKreuzung: t.sKreuzung, richtung: t.richtung, stufe: t.stufe, schneiden: t.schneiden || null,
        abkuerzung: t.abkuerzung || null, kurven: (t.kurven || []).map((c) => ({ von: c.von, bis: c.bis, richtung: c.richtung, kmh: c.kmh, stufe: c.stufe, gemessen: c.gemessen })),
      })),
    }));
    // (a) Richtungsänderung auf 50 m
    const S = A.strecke, n = S.anzahl;
    const winkel = [];
    for (let i = 0; i + 50 < n; i++) {
      const a1 = Math.atan2(S.tx[i], S.tz[i]), a2 = Math.atan2(S.tx[i + 50], S.tz[i + 50]);
      winkel.push(Math.abs(Math.atan2(Math.sin(a2 - a1), Math.cos(a2 - a1))) * 180 / Math.PI);
    }
    return {
      notes: flach(r), json: JSON.stringify(flach(r)), json2: JSON.stringify(flach(r2)), ms,
      ms2: (window.__alpineRally.paceNotes || {}).ms,
      winkel, startS: S.startS, zielS: S.zielS,
      nebenwege: A.CONFIG.nebenwege.map((w) => ({ name: w.name, abzweig: w.abzweig, einmuendung: w.einmuendung })),
      stummel: A.netz.stummel.map((a) => ({ art: a.art, sJ: a.sJ, name: a.nebenweg.name, richtung: Math.sign(a.seiteN * a.richtung) })),
      schneiden: S.schneiden, nichtSchneiden: S.nichtSchneiden, stufenGrenzen: A.CONFIG.pacenotes.stufenGrenzen,
      maxZeilen: A.CONFIG.pacenotes.maxZeilen, maxZeichen: A.CONFIG.pacenotes.maxZeichen,
    };
  });
}
const d = await hole();
await spiel.ladeSpiel();
const dNeu = await hole();

let fehler = 0;
const melde = (ok, text) => { console.log(`${ok ? '  ok  ' : 'FEHLER'} ${text}`); if (!ok) fehler++; };

// --- Liste ---
console.log(`Pace-Notes: ${d.notes.length} Ansagen (Berechnung ${d.ms.toFixed(1)} ms, im Spiel beim Laden ${d.ms2 != null ? d.ms2.toFixed(1) + ' ms' : '?'})`);
console.log('| Meter | Text | Stufe | Symbol(e) | Zusatz |');
console.log('|---|---|---|---|---|');
for (const n of d.notes) {
  console.log(`| ${Math.round(n.s)} | ${n.text} | ${n.stufe ?? '-'} | ${n.stuecke.map((t) => t.split('/')[0]).join(' + ')} | ${n.zusatz.join(', ') || '-'} |`);
}
const proArt = {};
for (const n of d.notes) for (const t of n.teile) proArt[t.art] = (proArt[t.art] || 0) + 1;
console.log(`Ansagen nach Art (Teile): ${Object.entries(proArt).map(([a, z]) => `${a} ${z}`).join(', ')}`);
console.log(`Zusammengefasst ("UND"): ${d.notes.filter((n) => n.text.includes(' UND ')).length}, längster Text: ${Math.max(...d.notes.map((n) => n.text.length))} Zeichen`);

// --- (a) Richtungswechsel ---
{
  const kurvenTeile = d.notes.flatMap((n) => n.teile).filter((t) => t.kurven.length);
  let fehlt = 0, beispiel = null, gepr = 0;
  for (let i = Math.ceil(d.startS); i + PRUEF_STRECKE <= d.zielS; i++) {
    if (d.winkel[i] < PRUEF_WINKEL) continue;
    gepr++;
    const ok = kurvenTeile.some((t) => t.kurven.some((c) => c.von <= i + PRUEF_STRECKE && c.bis >= i));
    if (!ok) { fehlt++; beispiel = beispiel ?? i; }
  }
  melde(fehlt === 0, `(a) ${gepr} Stellen mit mehr als ${PRUEF_WINKEL}° auf ${PRUEF_STRECKE} m, ohne Kurven-Ansage: ${fehlt}${beispiel != null ? ` (z. B. bei ${beispiel} m)` : ''}`);
}

// --- (b) schneiden / nicht schneiden eins zu eins ---
{
  const alle = [...d.nichtSchneiden.map((e) => ({ ...e, art: 'nichtSchneiden' })), ...d.schneiden.map((e) => ({ ...e, art: 'schneiden' }))];
  const teile = d.notes.flatMap((n) => n.teile.map((t) => ({ ...t, note: n })));
  let ok = true;
  for (const e of alle) {
    const treffer = teile.filter((t) => t.abkuerzung && t.abkuerzung.sVon === e.sVon && t.abkuerzung.sBis === e.sBis && t.abkuerzung.seite === e.seite);
    const t = treffer[0];
    let wie = 'fehlt';
    if (treffer.length === 1 && t.schneiden === e.art) {
      if (t.kurven.length) {
        const seite = e.seite === 'rechts' ? 1 : -1;
        const passt = t.kurven.some((c) => c.richtung === seite && Math.min(c.bis, e.sBis) > Math.max(c.von, e.sVon));
        wie = passt ? `an "${t.note.text}" (${Math.round(t.note.s)} m)` : `FALSCHE Kurve "${t.note.text}"`;
        if (!passt) ok = false;
      } else wie = `eigene Ansage "${t.note.text}"`;
    } else ok = false;
    console.log(`       ${e.art.padEnd(14)} ${e.sVon}-${e.sBis} ${e.seite.padEnd(6)} -> ${wie}`);
  }
  const anzahl = teile.filter((t) => t.schneiden).length;
  melde(ok && anzahl === alle.length, `(b) ${alle.length} Einträge in schneiden/nichtSchneiden, in den Ansagen: ${anzahl}`);
}

// --- (c) Stufen monoton zum gemessenen Kurventempo ---
{
  const tempo = (c) => {
    const m = messung.find((k) => k.von === c.von && k.bis === c.bis);
    return m ? (m.kmh == null ? Infinity : m.kmh) : null;
  };
  // Einheiten mit Stufe: Kurve, Kehre, Schikane (langsamere Teilkurve), Kreuzung mit Kurve
  const einheiten = d.notes.flatMap((n) => n.teile).filter((t) => t.stufe != null && t.kurven.length).map((t) => {
    const v = Math.min(...t.kurven.map(tempo).filter((x) => x != null));
    return { art: t.art, s: t.s, stufe: t.stufe, kmh: v };
  });
  einheiten.sort((a, b) => a.kmh - b.kmh || a.stufe - b.stufe);
  let ok = true, fall = null;
  for (let i = 1; i < einheiten.length; i++) {
    if (einheiten[i].stufe < einheiten[i - 1].stufe) { ok = false; fall = fall || `${Math.round(einheiten[i - 1].s)} m (Stufe ${einheiten[i - 1].stufe}, ${einheiten[i - 1].kmh} km/h) vor ${Math.round(einheiten[i].s)} m (Stufe ${einheiten[i].stufe}, ${einheiten[i].kmh} km/h)`; }
  }
  const nichtGemessen = d.notes.flatMap((n) => n.teile).flatMap((t) => t.kurven).filter((c) => !c.gemessen).length;
  console.log('       Kalibrierung (gemessenes Grenztempo, echte Fahrphysik):');
  console.log('       | Stufe | Grenzen (config) | gemessen (km/h) | Kurven |');
  console.log('       |---|---|---|---|');
  const g = d.stufenGrenzen;
  for (let st = 1; st <= 6; st++) {
    const e = einheiten.filter((x) => x.stufe === st);
    const grenz = st === 1 ? `unter ${g[0]}` : st === 6 ? `ab ${g[4]} (Vollgas)` : `${g[st - 2]}-${g[st - 1]}`;
    const fmt = (x) => (x === Infinity ? 'Vollgas' : Math.round(x));
    const bereich = e.length ? `${fmt(e[0].kmh)}-${fmt(e[e.length - 1].kmh)}` : '-';
    console.log(`       | ${st} | ${grenz} | ${bereich} | ${e.length} (${e.map((x) => `${Math.round(x.s)}${x.art === 'kurve' ? '' : ' ' + x.art}`).join(', ')}) |`);
  }
  // Steht in js/pacenotes-tempo.js noch das, was die Physik heute misst?
  const alsZahl = (x) => (x == null ? Infinity : x);
  const imSpiel = d.notes.flatMap((n) => n.teile).flatMap((t) => t.kurven);
  const veraltet = messung.filter((k) => imSpiel.some((c) => c.von === k.von && c.bis === k.bis && c.gemessen
    && alsZahl(c.kmh) !== alsZahl(k.kmh) && !(Math.abs(alsZahl(c.kmh) - alsZahl(k.kmh)) <= 0.11)));
  if (REFERENZ) {
    melde(ok, `(c) Stufen monoton zum gemessenen Kurventempo${fall ? ` – nicht bei ${fall}` : ''}`);
    melde(nichtGemessen === 0 && !veraltet.length, `(c) alle Kurven gemessen und js/pacenotes-tempo.js aktuell (ohne Messung: ${nichtGemessen}, abweichend: ${veraltet.length})`);
  } else {
    // M8a (j): anderes Profil gegen die Referenz – Asphalt höchstens ±5 %, Schotter/Wiesenweg bis +10 %; Stufe nur melden
    const { KURVEN_TEMPO } = await import(pathToFileURL(path.join(WURZEL, 'js/pacenotes-tempo.js')).href);
    const { CONFIG } = await import(pathToFileURL(path.join(WURZEL, 'js/config.js')).href);
    const stufe = (kmh) => { let st = 1; for (const gr of CONFIG.pacenotes.stufenGrenzen) if (kmh >= gr) st++; return st; };
    console.log(`       (j) Grenztempo ${AUTO} gegen die Referenz (js/pacenotes-tempo.js), Stufe 1-6 (Grenzen ${CONFIG.pacenotes.stufenGrenzen.join('/')} km/h):`);
    console.log('       | Kurve | Belag | Referenz | ' + AUTO + ' | Unterschied | Stufe Referenz | Stufe ' + AUTO + ' |');
    console.log('       |---|---|---|---|---|---|---|');
    let aussen = 0;
    const anders = [];
    for (const k of messung) {
      const ref = KURVEN_TEMPO.kurven.find((r) => Math.abs(r.von - k.von) <= 3 && Math.abs(r.bis - k.bis) <= 3);
      const a = ref ? (ref.kmh == null ? Infinity : ref.kmh) : null, b = k.kmh == null ? Infinity : k.kmh;
      const pz = a === Infinity && b === Infinity ? 0 : a === Infinity || b === Infinity || a == null ? null : (b / a - 1) * 100;
      const asphalt = k.belag === 'asphalt';
      const ok = pz !== null && (asphalt ? Math.abs(pz) <= 5 : pz <= 10 && pz >= -5);
      if (!ok) aussen++;
      const sa = a == null ? '-' : stufe(a), sb = stufe(b);
      if (sa !== sb) anders.push(`${k.von}-${k.bis} (${k.belag}): Stufe ${sa} -> ${sb}`);
      const fmt = (x) => (x === Infinity ? 'Vollgas' : x == null ? '-' : x.toFixed(1));
      console.log(`       | ${k.von}-${k.bis} ${k.richtung > 0 ? 'rechts' : 'links'}${k.kehre ? ' Kehre' : ''} | ${k.belag} | ${fmt(a)} | ${fmt(b)} | ${pz == null ? '-' : `${pz >= 0 ? '+' : ''}${pz.toFixed(1)} %`}${ok ? '' : ' (ausserhalb)'} | ${sa} | ${sb} |`);
    }
    melde(aussen === 0, `(j) ${messung.length} Kurven gemessen: Asphalt höchstens ±5 %, Schotter/Wiesenweg -5 bis +10 % (ausserhalb: ${aussen})`);
    console.log(`       (j) Kurven, bei denen die Stufe für ${AUTO} anders wäre (nur gemeldet, Pace-Notes bleiben auf der Referenz): ${anders.length ? anders.join('; ') : 'keine'}`);
  }
  console.log('       Je Kurve: | Meter | Richtung | Winkel | Radius | Belag | gemessen | geschätzt (Reserve-Formel) |');
  for (const k of messung) {
    console.log(`         ${k.von}-${k.bis} ${k.richtung > 0 ? 'rechts' : 'links '} ${k.winkel.toFixed(0).padStart(3)}° R${k.rMin.toFixed(0).padStart(3)} ${k.belag.padEnd(9)} ${k.kmh == null ? 'Vollgas' : k.kmh.toFixed(0) + ' km/h'}  (Formel ${Math.round(k.schaetzung)} km/h)`);
  }
}

// --- (d) Abstand ---
{
  let min = Infinity, wo = null;
  for (let i = 1; i < d.notes.length; i++) {
    const a = d.notes[i].s - d.notes[i - 1].s;
    if (a < min) { min = a; wo = `${Math.round(d.notes[i - 1].s)} / ${Math.round(d.notes[i].s)} m`; }
  }
  melde(min >= MIN_ABSTAND, `(d) kleinster Abstand zwischen zwei Ansagen: ${min.toFixed(0)} m (${wo}), Texte höchstens ${Math.max(...d.notes.map((n) => n.text.length))} Zeichen (erlaubt ${d.maxZeichen})`);
  melde(d.notes.every((n) => n.text.length <= d.maxZeichen), '(d) alle Texte passen in eine Zeile');
}

// --- (e) Abzweig/Einmündung ---
{
  let ok = true;
  for (const w of d.nebenwege) {
    for (const art of ['abzweig', 'einmuendung']) {
      const sK = w[art];
      const st = d.stummel.find((a) => a.name === w.name && a.art === art);
      const treffer = d.notes.flatMap((n) => n.teile.map((t) => ({ ...t, note: n }))).filter((t) => t.art === art && t.sKreuzung === sK);
      const t = treffer[0];
      const gut = treffer.length === 1 && t.richtung === st.richtung && t.note.s <= sK + 0.5 && sK - t.note.s <= 40;
      if (!gut) ok = false;
      console.log(`       ${w.name.padEnd(11)} ${art.padEnd(11)} ${sK} m, Richtung laut Netz ${st.richtung > 0 ? 'rechts' : 'links'} -> ${t ? `"${t.note.text}" ab ${Math.round(t.note.s)} m (${(sK - t.note.s).toFixed(0)} m vor der Kreuzung)` : 'FEHLT'}${gut ? '' : '  <- passt nicht'}`);
    }
  }
  melde(ok, '(e) Abzweige und Einmündungen stimmen mit "nebenwege" überein (Meter, Richtung)');
}

// --- (f) gleich bei zwei Läufen ---
melde(d.json === d.json2 && d.json === dNeu.json, `(f) Liste bei zwei Läufen gleich (auch nach neuem Laden): ${d.json === d.json2 && d.json === dNeu.json ? 'ja' : 'nein'}`);

// --- (g) Anzeige während einer Testfahrt, Stichproben ---
{
  const r = await spiel.page.evaluate(async () => {
    const A = window.__alpineRally;
    const f = await import('/tools/testfahrer-browser.js');
    const PN = A.paceNotes, P = A.CONFIG.pacenotes;
    if (!PN.anzeige.an) PN.umschalten();
    const notes = PN.notes, N = notes.length, kacheln = PN.kacheln, K = kacheln.length;
    const gruppeVon = new Array(K);
    PN.gruppen.forEach((g, n) => { for (let i = g.von; i <= g.bis; i++) gruppeVon[i] = g; });
    const erst = new Array(K).fill(null), war = new Uint8Array(K), weg = new Uint8Array(K);
    const flackern = [], zuFrueh = [];
    let maxK = 0, vorher = 0;
    const episoden = { 1: 0, 2: 0 }, zeit = { 0: 0, 1: 0, 2: 0 };
    const fahrt = notes.map(() => ({ vMin: Infinity, lenk: 0, n: 0 }));
    A.neustart();
    const ergebnis = f.fahreEtappe(A, 'mittel', (e) => {
      const s = A.rennen.letztesS, v = A.physik.tempo;
      const a = PN.aktualisiere(A.SCHRITT, s, v, A.rennen.zustand);
      if (a.anzahl > maxK) maxK = a.anzahl;
      if (a.anzahl !== vorher && a.anzahl > 0) episoden[a.anzahl] = (episoden[a.anzahl] || 0) + 1;
      vorher = a.anzahl;
      zeit[Math.min(2, a.anzahl)] += A.SCHRITT;
      const jetzt = new Uint8Array(K);
      for (let k = 0; k < a.anzahl; k++) jetzt[a.kacheln[k].nr] = 1;
      for (let i = 0; i < K; i++) {
        const kk = kacheln[i];
        if (jetzt[i] && erst[i] == null) {
          erst[i] = { d: kk.s - s, kmh: v * 3.6 };
          // eigenes Zeitfenster (Gruppe): die hinterste Kachel der Gruppe muss im Fenster sein
          const g = gruppeVon[i];
          const fenster = Math.min(P.vorlaufMax, Math.max(P.vorlaufMin, v * P.vorlaufZeit)) * (g.bremsen ? P.vorlaufBremsen : 1);
          if (g.anker - s > fenster + 1) zuFrueh.push(`${notes[kk.note].text} ${Math.round(g.anker - s)} m (Fenster ${Math.round(fenster)} m)`);
        }
        if (jetzt[i] && weg[i]) flackern.push(`${notes[kk.note].text} bei ${Math.round(s)} m wieder da`);
        // nicht mehr ganz sichtbar (blendet aus), obwohl die Kurvenmitte noch nicht erreicht ist
        const steht = jetzt[i] && a.kacheln.slice(0, a.anzahl).some((x) => x.nr === i && x.alpha >= 0.999);
        if (war[i] === 2 && !steht && kk.mitte - s > 1 && !weg[i]) { weg[i] = 1; flackern.push(`${notes[kk.note].text} bei ${Math.round(s)} m weg, ${Math.round(kk.mitte - s)} m vor der Mitte`); }
        war[i] = steht ? 2 : jetzt[i];
      }
      for (let j = 0; j < N; j++) {
        // Stichprobe: in der (ersten) Kurve dieser Ansage
        const c = notes[j].teile.find((t) => t.kurven && t.kurven.length);
        if (c && s >= c.kurven[0].von && s <= c.kurven[c.kurven.length - 1].bis) {
          const fj = fahrt[j];
          fj.vMin = Math.min(fj.vMin, v * 3.6);
          if (s <= c.kurven[0].bis) { fj.lenk += e.lenkung; fj.n++; }
        }
      }
    });
    // nach dem Ziel: 1 s weiter
    let nachZiel = 0;
    for (let t = 0; t < 1; t += A.SCHRITT) nachZiel = PN.aktualisiere(A.SCHRITT, A.rennen.letztesS, A.physik.tempo, A.rennen.zustand).anzahl;
    // Neustart: wieder von vorn (kurz vor der ersten Kachel, 70 km/h)
    A.neustart();
    let nachNeustart = null;
    for (let t = 0; t < 0.5; t += A.SCHRITT) nachNeustart = PN.aktualisiere(A.SCHRITT, kacheln[0].s - 40, 20, 'laeuft');
    const ersteNachNeustart = nachNeustart.anzahl ? nachNeustart.kacheln[0].nr : null;
    // (h) festes Tempo: Etappe "abfahren" (nur Anzeige)
    const festeFahrt = {};
    for (const kmh of [50, 90, 140]) {
      PN.zuruecksetzen();
      const d = new Array(K).fill(null);
      let mk = 0;
      for (let s = A.strecke.startS - 50; s <= A.strecke.zielS + 5; s += kmh / 3.6 / 60) {
        const a = PN.aktualisiere(1 / 60, s, kmh / 3.6, 'laeuft');
        mk = Math.max(mk, a.anzahl);
        for (let k = 0; k < a.anzahl; k++) { const i = a.kacheln[k].nr; if (d[i] == null) d[i] = kacheln[i].s - s; }
      }
      festeFahrt[kmh] = { d, maxK: mk };
    }
    PN.zuruecksetzen();
    return {
      ziel: ergebnis.ziel, zeit: ergebnis.zeit, maxK, maxKacheln: P.maxKacheln, flackern, zuFrueh, nachZiel, ersteNachNeustart, episoden, zeitAnteil: zeit,
      festeFahrt, vorlaufMax: P.vorlaufMax,
      kacheln: kacheln.map((k, i) => ({ s: k.s, art: k.art, text: notes[k.note].text, erst: erst[i], bremsen: gruppeVon[i].bremsen })),
      liste: notes.map((n, j) => ({
        s: n.s, text: n.text, kurve: n.teile.find((t) => t.kurven && t.kurven.length) || null,
        vMin: fahrt[j].vMin, lenk: fahrt[j].n ? fahrt[j].lenk / fahrt[j].n : 0,
      })).map((x) => ({ ...x, richtung: x.kurve ? x.kurve.richtung : null, kurve: !!x.kurve })),
    };
  });
  const nie = r.kacheln.filter((k) => !k.erst);
  console.log(`       Testfahrt "mittel": ${r.ziel ? 'im Ziel' : 'NICHT im Ziel'}, Zeit ${(r.zeit / 60 | 0)}:${(r.zeit % 60).toFixed(2).padStart(5, '0')}`);
  console.log(`       ${r.kacheln.length} Kacheln. Erscheinen (Meter vor der Stelle / Tempo): ` + r.kacheln.map((k) => `${Math.round(k.s)} ${k.art} ${k.erst ? `${Math.round(k.erst.d)} m/${Math.round(k.erst.kmh)}` : 'nie'}`).join(', '));
  console.log(`       Gezählt: ${r.episoden[1] || 0}x eine Kachel, ${r.episoden[2] || 0}x zwei Kacheln gleichzeitig (Zeitanteil: keine ${r.zeitAnteil[0].toFixed(0)} s, eine ${r.zeitAnteil[1].toFixed(0)} s, zwei ${r.zeitAnteil[2].toFixed(0)} s)`);
  melde(r.maxK <= r.maxKacheln, `(g) höchstens ${r.maxK} Kacheln gleichzeitig (erlaubt ${r.maxKacheln}), ganze Etappe`);
  melde(!r.flackern.length, `(g) nichts verschwindet vor der Kurvenmitte, nichts kommt wieder${r.flackern.length ? ': ' + r.flackern.slice(0, 4).join('; ') : ''}`);
  melde(!nie.length, `(g) jede Kachel erscheint (nie: ${nie.map((k) => `${Math.round(k.s)} ${k.art}`).join(', ') || 'keine'})`);
  melde(r.nachZiel === 0, `(g) nach dem Ziel keine Kachel (${r.nachZiel} nach 1 s)`);
  melde(r.ersteNachNeustart === 0, `(g) nach dem Neustart wieder von vorn (erste Kachel: ${r.ersteNachNeustart})`);
  // (h)
  const grenze = (k) => (k.bremsen ? 200 : 160);
  const zuWeit = r.kacheln.filter((k) => k.erst && k.erst.d > grenze(k) + 0.5).map((k) => `${Math.round(k.s)} ${k.art} ${Math.round(k.erst.d)} m`);
  for (const [kmh, ff] of Object.entries(r.festeFahrt)) {
    const max = Math.max(...ff.d.filter((x) => x != null));
    const maxB = Math.max(...ff.d.filter((x, i) => x != null && r.kacheln[i].bremsen));
    ff.d.forEach((x, i) => { if (x != null && x > grenze(r.kacheln[i]) + 0.5) zuWeit.push(`${kmh} km/h: ${Math.round(r.kacheln[i].s)} ${r.kacheln[i].art} ${Math.round(x)} m`); });
    console.log(`       Festes Tempo ${kmh} km/h: weitester Vorlauf ${Math.round(max)} m (Kehre/Abzweig/Einmündung ${Math.round(maxB)} m), höchstens ${ff.maxK} Kacheln, nie gezeigt: ${ff.d.filter((x) => x == null).length}`);
    if (ff.maxK > r.maxKacheln) zuWeit.push(`${kmh} km/h: ${ff.maxK} Kacheln`);
  }
  melde(!zuWeit.length, `(h) keine Kachel weiter als 160 m (Kehre/Abzweig/Einmündung 200 m) vor der Stelle${zuWeit.length ? ': ' + zuWeit.slice(0, 5).join('; ') : ''}`);
  melde(!r.zuFrueh.length, `(h) keine Kachel vor ihrem eigenen Zeitfenster (nie "weil Platz ist")${r.zuFrueh.length ? ': ' + r.zuFrueh.slice(0, 4).join('; ') : ''}`);
  // Stichproben
  console.log('       Stichproben (Testfahrt "mittel"): | Ansage | gelenkt | Tempo in der Kurve |');
  let falsch = 0;
  for (const n of r.liste.filter((x) => x.kurve)) {
    const gelenkt = n.lenk > 0.02 ? 1 : n.lenk < -0.02 ? -1 : 0;
    if (gelenkt !== n.richtung) falsch++;
    console.log(`         ${String(Math.round(n.s)).padStart(4)} m  ${n.text.padEnd(25)} ${gelenkt > 0 ? 'rechts' : gelenkt < 0 ? 'links ' : 'gerade'} ${gelenkt === n.richtung ? 'ok' : 'FALSCH'}  ${Number.isFinite(n.vMin) ? Math.round(n.vMin) + ' km/h' : '-'}`);
  }
  melde(falsch === 0, `Stichproben: Richtung der Ansage = gelenkte Richtung bei allen ${r.liste.filter((x) => x.kurve).length} Kurven-Ansagen (falsch: ${falsch})`);
}

// --- (i) Taste R mit Wartezeit ---
{
  const r = await spiel.page.evaluate(() => {
    const A = window.__alpineRally, p = A.physik, W = A.CONFIG.zurueck.wartezeit, dt = A.SCHRITT;
    const q = {};
    A.neustart();
    // Auto im Rennen bei 1250 m, 6 m neben der Strassenmitte, 15 m/s
    A.setzeAuf(1250, 6);
    A.rennen.zustand = 'laeuft'; A.rennen.zeit = 60;
    A.rennen.zwischenzeiten = A.checkpoints.filter((c) => c.s < 1250).map(() => 30);
    A.rennen.naechsterCp = A.rennen.zwischenzeiten.length;
    p.vx = Math.sin(p.richtung) * 15; p.vz = Math.cos(p.richtung) * 15; p.vVor = 15;
    const anzahl0 = A.rueck.anzahl, zeit0 = A.rennen.zeit;
    const erster = A.rTaste();
    const spieler = { gas: 1, bremse: 0, lenkung: 1, handbremse: false, reset: false, debug: false };
    let t = 0, resetBei = null, nochmal = null, restNachNochmal = null, vorReset = null, maxTempoSpaeter = 0;
    while (t < W + 2) {
      if (Math.abs(t - W / 2) < dt / 2) { const rest = A.rueck.rest; nochmal = A.rTaste(); restNachNochmal = [rest, A.rueck.rest]; }
      const vorher = A.rueck.anzahl;
      if (resetBei == null) vorReset = { tempo: p.tempo, abstand: A.strecke.abfrage(p.x, p.z, q).abstand };
      A.physikSchritt(dt, spieler);
      t += dt;
      if (A.rueck.anzahl !== vorher && resetBei == null) {
        resetBei = t;
        const a = A.strecke.abfrage(p.x, p.z, q);
        var nachReset = { tempo: p.tempo, abstand: a.abstand, richtung: Math.abs(Math.atan2(Math.sin(p.richtung - Math.atan2(a.tx, a.tz)), Math.cos(p.richtung - Math.atan2(a.tx, a.tz)))) };
      }
      if (resetBei != null && t > resetBei + 0.5) maxTempoSpaeter = Math.max(maxTempoSpaeter, p.tempo); // danach wieder frei
    }
    const ergebnis = {
      W, erster, nochmal, restNachNochmal, resetBei, anzahl: A.rueck.anzahl - anzahl0, vorReset, nachReset,
      zeitGelaufen: A.rennen.zeit - zeit0, freiDanach: maxTempoSpaeter,
    };
    // vor dem Start: sofort; nach dem Ziel: Neustart
    A.neustart();
    A.setzeAuf(A.rennen.letztesS, 4);
    ergebnis.bereit = A.rTaste();
    ergebnis.bereitAbstand = A.strecke.abfrage(p.x, p.z, q).abstand;
    A.rennen.zustand = 'ziel';
    ergebnis.ziel = A.rTaste();
    ergebnis.zielZustand = A.rennen.zustand;
    A.neustart();
    return ergebnis;
  });
  console.log(`       R im Rennen (Wartezeit ${r.W} s): "${r.erster}", nochmal R nach ${r.W / 2} s: "${r.nochmal}" (Rest ${r.restNachNochmal.map((x) => x.toFixed(2)).join(' -> ')} s), Reset nach ${r.resetBei?.toFixed(3)} s, Anzahl Resets ${r.anzahl}`);
  console.log(`       kurz vor dem Reset: ${(r.vorReset.tempo * 3.6).toFixed(1)} km/h (Spieler gibt Vollgas und lenkt), ${r.vorReset.abstand.toFixed(1)} m neben der Mitte; danach: ${(r.nachReset.tempo * 3.6).toFixed(1)} km/h, ${r.nachReset.abstand.toFixed(2)} m neben der Mitte, Blickrichtung ${(r.nachReset.richtung * 180 / Math.PI).toFixed(1)}° neben der Strasse; Rennzeit lief ${r.zeitGelaufen.toFixed(2)} s`);
  const SCHRITT = 1 / 120;
  melde(r.erster === 'countdown' && r.resetBei != null && r.resetBei >= r.W - SCHRITT / 2 && r.resetBei <= r.W + SCHRITT * 1.5, `(i) Reset nach der Wartezeit (${r.resetBei?.toFixed(3)} s, eingestellt ${r.W} s), nicht früher`);
  melde(r.anzahl === 1 && r.nochmal === 'laeuft schon' && Math.abs(r.restNachNochmal[0] - r.restNachNochmal[1]) < 1e-9, '(i) nicht doppelt: genau ein Reset, zweites R startet den Countdown nicht neu');
  melde(r.vorReset.tempo < 0.6 && r.vorReset.abstand > 3, `(i) während der Wartezeit gesperrt: steht (${(r.vorReset.tempo * 3.6).toFixed(1)} km/h) trotz Vollgas, noch neben der Strasse`);
  melde(r.nachReset.abstand < 0.3 && r.nachReset.tempo < 0.01 && r.nachReset.richtung < 0.05, '(i) danach auf der Strassenmitte, Tempo 0, Blickrichtung der Strasse');
  melde(Math.abs(r.zeitGelaufen - (r.W + 2)) < 0.02 && r.freiDanach > 1, `(i) Rennzeit läuft weiter (${r.zeitGelaufen.toFixed(2)} s), danach fährt das Auto wieder (${(r.freiDanach * 3.6).toFixed(0)} km/h)`);
  melde(r.bereit === 'sofort' && r.bereitAbstand < 0.3 && r.ziel === 'neustart' && r.zielZustand === 'bereit', `(i) vor dem Start sofort zurück ("${r.bereit}"), nach dem Ziel Neustart ("${r.ziel}")`);
}

melde(spiel.fehler.length === 0, `keine Fehler in der Browser-Konsole (${spiel.fehler.length})`);
console.log(fehler ? `\n${fehler} Prüfung(en) NICHT bestanden` : '\nAlle Prüfungen bestanden');
await spiel.schliessen();
process.exitCode = fehler ? 1 : 0;
