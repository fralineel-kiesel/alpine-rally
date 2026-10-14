// Test für den Strassenrand (Meilenstein 2a):  node tools/strassenrand-test.mjs
//
// Im Headless-Browser mit dem echten Spiel (Fahrphysik, Gelände, alle Hindernisse):
//   1. Auto fährt schräg in eine Leitplanke, einen Zaun und ein Schild: hart zum Halt,
//      danach rückwärts raus, steckt nicht fest
//   2. durch ein Weidetor und durch eine Zufahrt (Lücke in der Planke) kommt man durch
//   3. Innenseite der Abkürzungs-Kurven ("nicht schneiden" / "schneiden"): keine Planke, kein Zaun
//   4. keine Fehler in der Browser-Konsole
// Das Spiel selbst lädt diese Datei nicht.

import { starteSpiel } from './spiel-browser.mjs';

const spiel = await starteSpiel();
await spiel.ladeSpiel();

const erg = await spiel.page.evaluate(() => {
  const A = window.__alpineRally;
  const R = A.strassenrand, P = R.plan, S = A.strecke, K = A.CONFIG.kollision;
  const alle = [...A.pflanzen.hindernisse, ...R.hindernisse];
  const GRAD = Math.PI / 180;
  const q = {};

  // Wie tief steckt das tiefste Hindernis im Auto (Meter)?
  function eindringen() {
    const p = A.physik, kl = K.autoLaenge / 2 - K.eckRadius, kb = K.autoBreite / 2 - K.eckRadius;
    let max = 0;
    for (const h of alle) {
      const dx = h.x - p.x, dz = h.z - p.z;
      if (dx * dx + dz * dz > 25) continue;
      const v = dx * Math.sin(p.richtung) + dz * Math.cos(p.richtung), s = dx * Math.cos(p.richtung) - dz * Math.sin(p.richtung);
      const ev = Math.abs(v) - kl, es = Math.abs(s) - kb;
      const d = ev > 0 || es > 0 ? Math.hypot(Math.max(ev, 0), Math.max(es, 0)) : Math.max(ev, es);
      max = Math.max(max, h.r + K.eckRadius - d);
    }
    return max;
  }
  // Welches Hindernis berührt das Auto gerade (kleinster Abstand zum Auto-Rechteck)?
  function welchesHindernis() {
    const p = A.physik, kl = K.autoLaenge / 2 - K.eckRadius, kb = K.autoBreite / 2 - K.eckRadius;
    let best = Infinity, art = null;
    for (const h of alle) {
      const dx = h.x - p.x, dz = h.z - p.z;
      if (dx * dx + dz * dz > 25) continue;
      const v = dx * Math.sin(p.richtung) + dz * Math.cos(p.richtung), s = dx * Math.cos(p.richtung) - dz * Math.sin(p.richtung);
      const d = Math.hypot(Math.max(Math.abs(v) - kl, 0), Math.max(Math.abs(s) - kb, 0)) - K.eckRadius - h.r;
      if (d < best) { best = d; art = h.rand || (h.sperre ? 'sperre' : 'baum/stein'); }
    }
    return art;
  }
  const LEER = { gas: 0, bremse: 0, lenkung: 0, handbremse: false, reset: false, debug: false };
  // Auto auf Ziel (tx, tz) zufahren lassen: Start dist Meter davor, Richtung = winkel Grad
  // gegen die Strasse (zur Seite seite), Tempo kmh. Danach rückwärts.
  function anfahrt(sZiel, seite, tx, tz, winkel, kmh, eingabe = LEER, dauer = 3) {
    const p0 = P.punkt(sZiel, 0);
    const lat = Math.abs((tx - p0.x) * -p0.tz + (tz - p0.z) * p0.tx);
    const dist = Math.max(4, (lat - 0.2) / Math.sin(winkel * GRAD));
    // Richtung: entlang der Strasse und um "winkel" zur Seite gedreht
    const fx = p0.tx * Math.cos(winkel * GRAD) + -p0.tz * seite * Math.sin(winkel * GRAD);
    const fz = p0.tz * Math.cos(winkel * GRAD) + p0.tx * seite * Math.sin(winkel * GRAD);
    const x0 = tx - fx * dist, z0 = tz - fz * dist, w = Math.atan2(fx, fz);
    A.setzeAuf(S.abfrage(x0, z0, q).s);
    A.physik.reset(x0, z0, w);
    const v = kmh / 3.6;
    A.physik.vx = fx * v; A.physik.vz = fz * v; A.physik.vVor = v;
    A.getriebe.reset();
    A.rennen.zustand = 'bereit';
    const vorher = A.kollision.letzterAufprall;
    let t = 0, aufprall = null, tempoVor = v, maxEin = 0, getroffen = null;
    while (t < dauer) {
      const tv = A.physik.tempo;
      A.physikSchritt(A.SCHRITT, eingabe);
      t += A.SCHRITT;
      maxEin = Math.max(maxEin, eindringen());
      if (!aufprall && A.kollision.letzterAufprall !== vorher) {
        aufprall = A.kollision.letzterAufprall; tempoVor = tv;
        getroffen = welchesHindernis();
        if (eingabe === LEER) { t = dauer - 0.4; } // nach dem Aufprall noch 0.4 s laufen lassen
      }
    }
    const stand = { x: A.physik.x, z: A.physik.z, tempo: A.physik.tempo };
    // wie ein Spieler: Bremse/Rückwärts halten (erst bremsen, dann rückwärts), höchstens 5 s.
    // Gemessen wird, wie weit das Auto ab dem Stillstand rückwärts gekommen ist.
    let rueck = 0;
    if (aufprall) {
      let still = null;
      for (let t2 = 0; t2 < 5; t2 += A.SCHRITT) {
        A.physikSchritt(A.SCHRITT, { ...LEER, bremse: 1 });
        maxEin = Math.max(maxEin, eindringen());
        if (!still && A.physik.vVor < 0.05) still = { x: A.physik.x, z: A.physik.z, t: t2 };
        if (still && t2 - still.t > 2.5) break;
      }
      if (still) rueck = Math.hypot(A.physik.x - still.x, A.physik.z - still.z);
    }
    const qq = S.abfrage(A.physik.x, A.physik.z, {});
    return {
      aufprall: aufprall ? { vorher: aufprall.vorher * 3.6, nachher: aufprall.nachher * 3.6, winkel: aufprall.winkel } : null,
      tempoVor: tempoVor * 3.6, standTempo: stand.tempo * 3.6, rueck, maxEin, getroffen,
      endeLat: Math.abs(qq.seite), endeS: qq.s,
    };
  }

  const ergebnis = {};
  // --- 1a. Leitplanke: ein langes Stück, Mitte
  const planke = P.plankenLaeufe.slice().sort((a, b) => (b.bis - b.von) - (a.bis - a.von))[0];
  {
    const s = (planke.von + planke.bis) / 2, L = 6.0;
    const t = P.punkt(s, planke.seite * L);
    ergebnis.planke = { wo: `${planke.seite > 0 ? 'rechts' : 'links'} bei ${Math.round(s)} m`, laeufe: {} };
    for (const w of [15, 30, 45, 60, 75]) ergebnis.planke.laeufe[w] = anfahrt(s, planke.seite, t.x, t.z, w, 80);
  }
  // --- 1b. Zaun: längstes Stück, Mitte
  const zaun = P.zaunLaeufe.slice().sort((a, b) => (b.bis - b.von) - (a.bis - a.von))[0];
  {
    const s = (zaun.von + zaun.bis) / 2;
    const t = P.punkt(s, zaun.seite * 6.3);
    ergebnis.zaun = { wo: `${zaun.seite > 0 ? 'rechts' : 'links'} bei ${Math.round(s)} m`, laeufe: {} };
    for (const w of [30, 60]) ergebnis.zaun.laeufe[w] = anfahrt(s, zaun.seite, t.x, t.z, w, 70);
  }
  // --- 1c. Schild: eine Kilometertafel, die frei steht (keine Planke/kein Zaun davor)
  {
    const frei = P.schilder.filter((sch) => sch.art === 'km' &&
      !P.plankenLaeufe.some((l) => l.seite === sch.seite && sch.s > l.von - 5 && sch.s < l.bis + 5) &&
      !P.zaunLaeufe.some((l) => l.seite === sch.seite && sch.s > l.von - 5 && sch.s < l.bis + 5));
    const sch = frei[0];
    ergebnis.schild = { wo: `Kilometertafel ${sch.tafeln[0].zahl} (${sch.seite > 0 ? 'rechts' : 'links'} bei ${Math.round(sch.s)} m)`, laeufe: {} };
    for (const w of [30, 60]) ergebnis.schild.laeufe[w] = anfahrt(sch.s, sch.seite, sch.x, sch.z, w, 60);
  }
  // --- 2a. Weidetor: quer durch die Lücke (Mitte), mit etwas Gas
  {
    const t = P.tore.find((x) => x.offen) || P.tore[0];
    const s = (t.von + t.bis) / 2;
    const ziel = P.punkt(s, t.seite * 10);
    // 40 km/h: langsamer kommt man auch ohne Zaun nicht vom Bankett aufs Gras (alte Bankett-Kante, siehe STAND.md)
    const r = anfahrt(s, t.seite, ziel.x, ziel.z, 90, 40, { ...LEER, gas: 0.4 }, 3);
    ergebnis.tor = { wo: `${t.offen ? 'offenes' : 'geschlossenes'} Tor ${t.seite > 0 ? 'rechts' : 'links'} bei ${Math.round(t.von)}–${Math.round(t.bis)} m (${(t.bis - t.von).toFixed(1)} m breit)`, ...r };
  }
  // --- 2b. Zufahrt: Lücke zwischen zwei Planken-Stücken auf derselben Seite
  {
    let gefunden = null;
    const L = P.plankenLaeufe;
    for (const a of L) for (const b of L) if (a !== b && a.seite === b.seite && b.von - a.bis > 3 && b.von - a.bis < 15) gefunden = { seite: a.seite, von: a.bis, bis: b.von };
    if (gefunden) {
      const s = (gefunden.von + gefunden.bis) / 2;
      const ziel = P.punkt(s, gefunden.seite * 9);
      const r = anfahrt(s, gefunden.seite, ziel.x, ziel.z, 90, 40, { ...LEER, gas: 0.3 }, 3);
      ergebnis.zufahrt = { wo: `${gefunden.seite > 0 ? 'rechts' : 'links'} bei ${Math.round(gefunden.von)}–${Math.round(gefunden.bis)} m (${(gefunden.bis - gefunden.von).toFixed(1)} m breit)`, ...r };
    }
  }
  // --- 3. Innenseite der Abkürzungs-Kurven
  ergebnis.innen = [...S.nichtSchneiden.map((k) => ({ ...k, liste: 'nicht schneiden' })), ...S.schneiden.map((k) => ({ ...k, liste: 'schneiden' }))]
    .map((k) => {
      const puffer = k.liste === 'schneiden' ? A.CONFIG.strassenrand.pufferSchneiden : A.CONFIG.strassenrand.puffer;
      const sd = k.seite === 'rechts' ? 1 : -1, von = k.sVon - puffer, bis = k.sBis + puffer;
      const ueber = (l) => l.seite === sd && l.von < bis && l.bis > von;
      // auch nachrechnen: Kollisionskreise von Planke/Zaun auf der Innenseite im Kurvenbereich?
      let kreise = 0;
      for (const h of R.hindernisse) {
        if (h.rand === 'schild') continue;
        // Absperrung und Seitenschutz der Stummel gehören zur Kreuzung, nicht zur Kurve davor (M3a.1:
        // die Leitwand beginnt direkt am Abzweig, 48 m nach dem Ende der freien Kurve 482-752, aber im Puffer)
        if (h.rand === 'absperrung' || (A.netz && A.netz.stummelAbstand(h.x, h.z, 10) < 7.5)) continue;
        S.abfrage(h.x, h.z, q);
        if (q.s > von && q.s < bis && Math.sign(q.seite) === sd && q.abstand < 25) kreise++;
      }
      const aussen = P.plankenLaeufe.filter((l) => l.seite === -sd && l.von < bis && l.bis > von).length +
        P.zaunLaeufe.filter((l) => l.seite === -sd && l.von < bis && l.bis > von).length;
      return {
        kurve: `${k.sVon}–${k.sBis} ${k.seite} (${k.liste})`,
        planken: P.plankenLaeufe.filter(ueber).length, zaeune: P.zaunLaeufe.filter(ueber).length,
        schilder: P.schilder.filter((x) => x.seite === sd && x.s > von && x.s < bis).length, kreise, aussen,
      };
    });
  ergebnis.statistik = R.statistik;
  return ergebnis;
});

let fehler = 0;
const pruefe = (ok, text) => { console.log(`  ${ok ? 'OK   ' : 'FEHLT'} ${text}`); if (!ok) fehler++; };
const f = (n, d = 1) => (n == null ? '-' : n.toFixed(d));
const zeile = (w, r) => `${w}°: ${r.aufprall ? `${f(r.aufprall.vorher, 0)} -> ${f(r.aufprall.nachher, 0)} km/h (getroffen: ${r.getroffen})` : 'kein Aufprall'},` +
  ` 0.4 s danach ${f(r.standTempo)} km/h, rückwärts ${f(r.rueck)} m, max. eingedrungen ${f(r.maxEin, 2)} m`;

for (const [name, art] of [['planke', 'planke'], ['zaun', 'zaun'], ['schild', 'schild']]) {
  const e = erg[name];
  console.log(`\n${name === 'planke' ? 'Leitplanke' : name === 'zaun' ? 'Holzzaun' : 'Schild'}: ${e.wo}`);
  for (const [w, r] of Object.entries(e.laeufe)) {
    console.log('  ' + zeile(w, r));
    pruefe(r.aufprall && r.getroffen === art, `${w}°: trifft ${art}`);
    // Winkel hier = gegen die Strasse (0° = parallel). Ab 60° (= höchstens 30° von frontal) ist das
    // nach der bestehenden Aufprall-Physik ein harter Stopp, flacher rutscht man entlang (wie an Stämmen).
    if (+w >= 60) pruefe(r.aufprall && r.standTempo < 0.1 * r.aufprall.vorher, `${w}°: hart zum Halt (0.4 s nach dem Aufprall unter 10 % vom Tempo)`);
    if (+w === 45) pruefe(r.aufprall && r.aufprall.nachher < 0.35 * r.aufprall.vorher, `${w}°: wie ein Stamm unter 45° (höchstens 35 % bleiben)`);
    pruefe(r.rueck > 2, `${w}°: kommt rückwärts raus (${f(r.rueck)} m in 2.5 s ab Stillstand)`);
    pruefe(r.maxEin < 0.15, `${w}°: steckt nicht fest (max. ${f(r.maxEin, 2)} m im Hindernis)`);
  }
}
for (const name of ['tor', 'zufahrt']) {
  const e = erg[name];
  if (!e) { console.log(`\n${name}: keine gefunden`); continue; }
  console.log(`\n${name === 'tor' ? 'Weidetor' : 'Zufahrt in der Planke'}: ${e.wo}`);
  console.log(`  Aufprall: ${e.aufprall ? `${f(e.aufprall.vorher, 0)} -> ${f(e.aufprall.nachher, 0)} km/h (${e.getroffen})` : 'keiner'}, am Ende ${f(e.endeLat)} m neben der Strassenmitte`);
  if (name === 'tor') pruefe(!e.aufprall && e.endeLat > 8, 'kommt durch die Lücke');
  else {
    // An Felswand-Strecken stoppt dahinter die unsichtbare Abhang-Grenze bei 6.6 m (grenze.abhangGrenze, gab es
    // schon vor M2a). Geprüft wird: kein Aufprall an der Planke, das Auto kommt über die Planken-Linie (6 m) hinaus.
    pruefe(!e.aufprall && e.endeLat > 6.2, `fährt ohne Aufprall in die Lücke der Planke (bis ${f(e.endeLat)} m neben der Mitte)`);
  }
}
console.log('\nInnenseite der Abkürzungs-Kurven (Bereich sVon–sBis plus Puffer: 20 m bei "nicht schneiden", 50 m bei "schneiden"):');
console.log('| Kurve | Planken innen | Zäune innen | Schilder innen | Kollisionskreise innen | Planke/Zaun aussen |');
console.log('|---|---|---|---|---|---|');
for (const k of erg.innen) {
  console.log(`| ${k.kurve} | ${k.planken} | ${k.zaeune} | ${k.schilder} | ${k.kreise} | ${k.aussen} |`);
  pruefe(!k.planken && !k.zaeune && !k.schilder && !k.kreise, `${k.kurve}: innen frei`);
}
console.log('\nStrassenrand:', JSON.stringify(erg.statistik));
pruefe(!spiel.fehler.length, `keine Fehler in der Browser-Konsole (${spiel.fehler.length})`);
console.log(fehler ? `\n${fehler} Prüfung(en) nicht erfüllt.` : '\nAlle Prüfungen erfüllt.');
await spiel.schliessen();
process.exit(fehler ? 1 : 0);
