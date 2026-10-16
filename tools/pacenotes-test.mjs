// Pace-Notes prüfen (Meilenstein 4).
//
//   node tools/pacenotes-test.mjs             komplette Liste ausgeben, Grenztempo jeder Kurve mit der echten
//                                             Fahrphysik messen, Prüfungen (a) bis (f)
//   node tools/pacenotes-test.mjs --schreiben dazu js/pacenotes-tempo.js neu schreiben (nach Änderungen an
//                                             Strecke oder Fahrphysik)
//
// Prüft:
//   (a) jede Stelle, an der die Strasse auf 50 m mehr als pruefWinkel Grad die Richtung ändert, hat eine Kurven-Ansage
//   (b) jeder Eintrag in schneiden/nichtSchneiden steht genau einmal in den Ansagen (und keiner mehr)
//   (c) Stufen passen monoton zum gemessenen Kurventempo (schneller = gleiche oder höhere Stufe), mit Tabelle
//   (d) keine zwei Ansagen näher als 25 m (sonst müssen sie zusammengefasst sein)
//   (e) Abzweig/Einmündung stimmen mit "nebenwege" überein (Meter und Richtung aus dem Strassennetz)
//   (f) die Liste ist bei zwei Läufen (auch nach neuem Laden) genau gleich
//   (g) Anzeige während einer Testfahrt (Profil "mittel"): nie mehr als 3 Zeilen, nichts verschwindet vor dem
//       Passieren (kein Flackern), jede Ansage erscheint rechtzeitig (Vorlauf), nach dem Ziel keine, nach dem
//       Neustart wieder von vorn
//   Stichproben: jede Kurven-Ansage gegen die Testfahrt (gelenkte Richtung, Tempo in der Kurve)
// Dazu: Ladezeit der Berechnung, Fehler in der Browser-Konsole.

import fs from 'node:fs';
import path from 'node:path';
import { starteSpiel, WURZEL } from './spiel-browser.mjs';

const schreiben = process.argv.includes('--schreiben');
const PRUEF_WINKEL = 25;    // (a): Richtungsänderung (Grad) auf ...
const PRUEF_STRECKE = 50;   // ... so vielen Metern = muss angesagt sein
const MIN_ABSTAND = 25;     // (d)

const spiel = await starteSpiel();
await spiel.ladeSpiel();

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
  melde(ok, `(c) Stufen monoton zum gemessenen Kurventempo${fall ? ` – nicht bei ${fall}` : ''}`);
  melde(nichtGemessen === 0 && !veraltet.length, `(c) alle Kurven gemessen und js/pacenotes-tempo.js aktuell (ohne Messung: ${nichtGemessen}, abweichend: ${veraltet.length})`);
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
    const PN = A.paceNotes;
    if (!PN.anzeige.an) PN.umschalten();
    const notes = PN.notes, N = notes.length;
    const erst = new Array(N).fill(null), war = new Uint8Array(N), weg = new Uint8Array(N);
    const flackern = [];
    let maxZeilen = 0;
    const fahrt = notes.map(() => ({ vMin: Infinity, lenk: 0, n: 0 }));
    A.neustart();
    const ergebnis = f.fahreEtappe(A, 'mittel', (e) => {
      const s = A.rennen.letztesS, v = A.physik.tempo;
      const a = PN.aktualisiere(A.SCHRITT, s, v, A.rennen.zustand);
      if (a.anzahl > maxZeilen) maxZeilen = a.anzahl;
      const jetzt = new Uint8Array(N);
      for (let k = 0; k < a.anzahl; k++) jetzt[a.zeilen[k].nr] = 1;
      for (let j = 0; j < N; j++) {
        if (jetzt[j] && erst[j] == null) erst[j] = { d: notes[j].s - s, kmh: v * 3.6 };
        if (jetzt[j] && weg[j]) flackern.push(`${notes[j].text} bei ${Math.round(s)} m wieder da`);
        if (!jetzt[j] && war[j] && notes[j].s - s > 1) { weg[j] = 1; flackern.push(`${notes[j].text} bei ${Math.round(s)} m weg, ${Math.round(notes[j].s - s)} m vorher`); }
        war[j] = jetzt[j];
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
    // Neustart: wieder von vorn
    A.neustart();
    let nachNeustart = null;
    for (let t = 0; t < 0.5; t += A.SCHRITT) nachNeustart = PN.aktualisiere(A.SCHRITT, A.rennen.letztesS, 0, A.rennen.zustand);
    const ersteNachNeustart = nachNeustart.anzahl ? notes[nachNeustart.zeilen[0].nr].text : null;
    return {
      ziel: ergebnis.ziel, zeit: ergebnis.zeit, maxZeilen, flackern, nachZiel, ersteNachNeustart, ersteNote: notes[0].text,
      liste: notes.map((n, j) => ({
        s: n.s, text: n.text, stufe: n.stufe, erst: erst[j], ziel: n.arten.includes('ziel'),
        kurve: n.teile.find((t) => t.kurven && t.kurven.length) || null,
        vMin: fahrt[j].vMin, lenk: fahrt[j].n ? fahrt[j].lenk / fahrt[j].n : 0,
      })).map((x) => ({ ...x, richtung: x.kurve ? x.kurve.richtung : null, kurve: !!x.kurve })),
    };
  });
  const P = { min: 100, max: 350 };
  const zuSpaet = r.liste.filter((n) => !n.ziel && n.erst && n.erst.d < Math.min(P.min, n.s - 10) - 1);
  const nie = r.liste.filter((n) => !n.erst);
  console.log(`       Testfahrt "mittel": ${r.ziel ? 'im Ziel' : 'NICHT im Ziel'}, Zeit ${(r.zeit / 60 | 0)}:${(r.zeit % 60).toFixed(2).padStart(5, '0')}`);
  console.log('       Vorlauf (Distanz beim Erscheinen, Tempo dabei): ' + r.liste.map((n) => `${Math.round(n.s)} ${n.erst ? `${Math.round(n.erst.d)} m/${Math.round(n.erst.kmh)}` : 'nie'}`).join(', '));
  melde(r.maxZeilen <= 3, `(g) höchstens ${r.maxZeilen} Zeilen gleichzeitig`);
  melde(!r.flackern.length, `(g) nichts verschwindet vor dem Passieren${r.flackern.length ? ': ' + r.flackern.slice(0, 4).join('; ') : ''}`);
  melde(!nie.length && !zuSpaet.length, `(g) jede Ansage erscheint (nie: ${nie.length}) und rechtzeitig (mind. 100 m bzw. ab Start; zu spät: ${zuSpaet.map((n) => `${n.text} ${Math.round(n.erst.d)} m`).join(', ') || 'keine'})`);
  melde(r.nachZiel === 0, `(g) nach dem Ziel keine Ansage (${r.nachZiel} Zeilen nach 1 s)`);
  melde(r.ersteNachNeustart === r.ersteNote, `(g) nach dem Neustart wieder von vorn ("${r.ersteNachNeustart}")`);
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

melde(spiel.fehler.length === 0, `keine Fehler in der Browser-Konsole (${spiel.fehler.length})`);
console.log(fehler ? `\n${fehler} Prüfung(en) NICHT bestanden` : '\nAlle Prüfungen bestanden');
await spiel.schliessen();
process.exitCode = fehler ? 1 : 0;
