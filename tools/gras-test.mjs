// Test „Raus aus dem Gras“ (Mini-Meilenstein 2c):  node tools/gras-test.mjs
//
// Im Headless-Browser mit dem echten Spiel (Fahrphysik, Gelände, alle Hindernisse):
//   0. Reine Fahrphysik: Auto steht im Gras genau so steil bergauf wie grenze.steilsterHang
//      (hinter dem Auto geht es hoch), Rückwärtsgang voll: es muss rückwärts losfahren.
//      Auf Asphalt muss der Rückwärtsgang genau gleich stark schieben wie vor 2c.
//   1. 20 Mal im echten Gelände ins Gras gestellt (eben in verschiedenen Winkeln und bergauf in
//      verschiedenen Steigungen bis steilsterHang), Rückwärtsgang voll: zurück auf den Asphalt.
//   2. 20 Mal von der Strasse seitlich mit 5–25 km/h übers Bankett ins Gras: nicht an der
//      Bankett-Kante hängen bleiben, dann Rückwärtsgang voll zurück auf den Asphalt.
//      Dazu dieselbe Fahrt an allen freien Stellen der ganzen Strecke (beide Seiten).
//   3. keine Fehler in der Browser-Konsole
// Das Spiel selbst lädt diese Datei nicht.

import { starteSpiel } from './spiel-browser.mjs';

const spiel = await starteSpiel();
await spiel.ladeSpiel();

const erg = await spiel.page.evaluate(async () => {
  const A = window.__alpineRally;
  const S = A.strecke, W = A.welt, C = A.CONFIG, q = {};
  const LEER = { gas: 0, bremse: 0, lenkung: 0, handbremse: false, reset: false, debug: false };
  const alle = [...A.pflanzen.hindernisse, ...A.strassenrand.hindernisse, ...A.kuehe.hindernisse];
  const GRAD = Math.PI / 180;
  const ergebnis = {};

  // --- 0. Reine Fahrphysik an der Grenze ---
  const { Fahrphysik } = await import('/js/physics.js');
  const motor = { beschl: 0, motorbremse: 0 };
  function rueckwaertsNach(untergrund, steigung, sekunden = 2) {
    const p = new Fahrphysik();
    const u = C.untergrund[untergrund];
    for (let t = 0; t < sekunden; t += A.SCHRITT) {
      p.schritt(A.SCHRITT, { ...LEER, bremse: 1 }, { grip: u.grip, rollen: u.rollen, rollenTempo: u.rollenTempo, steigung, rueckwaerts: u.rueckwaerts }, motor);
    }
    return -p.vVor * 3.6;
  }
  // Im Spiel wird die Steigung unter dem Auto auf 0.5 begrenzt (main.js); bergauf rückwärts = Heck höher
  const grenzSteigung = -Math.min(C.grenze.steilsterHang, 0.5);
  ergebnis.physik = {
    grasGrenze: rueckwaertsNach('gras', grenzSteigung),
    grasEben: rueckwaertsNach('gras', 0),
    bankettGrenze: rueckwaertsNach('bankett', grenzSteigung),
    asphaltEben: rueckwaertsNach('asphalt', 0),
    // Ohne Faktor (so war es vor 2c): Asphalt muss genau gleich bleiben
    asphaltOhneFaktor: (() => {
      const p = new Fahrphysik(), u = C.untergrund.asphalt;
      for (let t = 0; t < 2; t += A.SCHRITT) p.schritt(A.SCHRITT, { ...LEER, bremse: 1 }, { grip: u.grip, rollen: u.rollen, rollenTempo: u.rollenTempo, steigung: 0 }, motor);
      return -p.vVor * 3.6;
    })(),
  };

  // Hilfen
  const weg = (x0, z0, fx, fz, von, bis, rand) => {
    for (let t = von; t <= bis; t += 0.5) {
      const px = x0 + fx * t, pz = z0 + fz * t;
      for (const h of alle) if (Math.hypot(h.x - px, h.z - pz) < h.r + rand) return false;
    }
    return true;
  };
  // "auf der Strasse" = Asphalt, seit M3a/M3b auch der Belag der Nebenwege (Schotter, Wiesenweg)
  const aufAsphalt = () => !['gras', 'bankett'].includes(W.bodenBei(A.physik.x, A.physik.z).art);
  function stelleAuf(s, x, z, richtung, v = 0) {
    A.setzeAuf(s);
    A.physik.reset(x, z, richtung);
    A.physik.vx = Math.sin(richtung) * v; A.physik.vz = Math.cos(richtung) * v; A.physik.vVor = v;
    A.getriebe.reset();
    A.rennen.zustand = 'bereit';
  }
  // Rückwärtsgang voll, bis das Auto auf dem Asphalt ist (höchstens 15 s).
  // "Hängen geblieben" = ab der 2. Sekunde 1 s lang kaum bewegt, ohne auf dem Asphalt zu sein.
  function rueckwaertsRaus() {
    let t = 0, ruhe = 0, haenger = false, maxTempo = 0;
    while (t < 15) {
      const x0 = A.physik.x, z0 = A.physik.z;
      A.physikSchritt(A.SCHRITT, { ...LEER, bremse: 1 });
      t += A.SCHRITT;
      maxTempo = Math.max(maxTempo, A.physik.tempo);
      if (aufAsphalt()) return { raus: true, t, haenger, maxTempo: maxTempo * 3.6 };
      ruhe = Math.hypot(A.physik.x - x0, A.physik.z - z0) < 0.3 * A.SCHRITT ? ruhe + A.SCHRITT : 0;
      if (t > 2 && ruhe > 1) { haenger = true; break; }
    }
    return { raus: false, t, haenger, maxTempo: maxTempo * 3.6 };
  }

  // --- 1. Im Gras abgestellt ---
  // Kandidaten: Stellen neben der Strasse (beide Seiten, nicht an der Felswand), Auto schaut von der
  // Strasse weg (gerade oder schräg), der Weg rückwärts bis auf den Asphalt ist frei von Hindernissen.
  // Steigung = wie stark es hinter dem Auto auf den ersten 4 m bergauf geht. Steilste Stelle auf dem
  // ganzen Weg höchstens steilsterHang (steiler kommt das Auto absichtlich nicht hoch).
  const kandidaten = [];
  for (let s = 20; s < S.laenge - 20; s += 5) {
    for (const seite of [-1, 1]) {
      const p = S.punktBei(s);
      const i = S.abfrage(p.x, p.z, q).i;
      if (q.wandSeite === seite && q.wandStaerke > 0.05) continue;
      const nx = -S.tz[i] * seite, nz = S.tx[i] * seite; // von der Strasse weg
      for (const d of [8, 9, 10, 12, 14, 17, 20, 24, 28]) {
        for (const w of [0, 30, -30, 50, -50]) {
          const c = Math.cos(w * GRAD), sn = Math.sin(w * GRAD);
          const fx = nx * c - nz * sn, fz = nz * c + nx * sn; // Blickrichtung
          const x = p.x + nx * d, z = p.z + nz * d;
          const qq = S.abfrage(x, z, {});
          if (Math.abs(qq.s - s) > 4 || qq.abstand < d - 0.5 || qq.abstand > C.grenze.maxAbstand - 3) continue;
          if (W.bodenBei(x, z).art !== 'gras') continue;
          const lang = (d - 2) / c; // so weit rückwärts bis auf den Asphalt
          if (!weg(x, z, -fx, -fz, -3, lang, 2.4)) continue;
          const h = (t) => W.gelaendeHoehe(x - fx * t, z - fz * t);
          const steigung = (h(4) - h(0)) / 4;
          let steilste = 0;
          for (let t = 0; t < lang; t += 0.25) {
            if (W.bodenBei(x - fx * t, z - fz * t).art !== 'gras') break;
            steilste = Math.max(steilste, (h(t + 0.25) - h(t)) / 0.25);
          }
          if (steilste > C.grenze.steilsterHang) continue;
          kandidaten.push({ s, seite, d, w, x, z, richtung: Math.atan2(fx, fz), steigung, steilste });
        }
      }
    }
  }
  // 20 Stellen: 6 eben (verschiedene Winkel), 14 bergauf (von leicht bis zur steilsten möglichen)
  const auswahl = [];
  const eben = kandidaten.filter((k) => Math.abs(k.steigung) < 0.03);
  for (const w of [0, 30, -30, 50, -50, 0]) {
    const k = eben.filter((k) => k.w === w && !auswahl.includes(k));
    auswahl.push(k[Math.floor(k.length * (auswahl.length + 1) / 8)]);
  }
  const bergauf = kandidaten.filter((k) => k.steigung >= 0.05).sort((a, b) => a.steigung - b.steigung);
  ergebnis.steilsterKandidat = bergauf.length ? bergauf[bergauf.length - 1].steigung : 0;
  // gleichmässig über die Steigungen verteilt, die steilste Stelle immer dabei
  const stufen = [0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5];
  for (const st of stufen) {
    const k = bergauf.find((k) => k.steigung >= st && !auswahl.includes(k));
    if (k) auswahl.push(k);
  }
  for (let j = bergauf.length - 1; auswahl.length < 20 && j >= 0; j -= 3) if (!auswahl.includes(bergauf[j])) auswahl.push(bergauf[j]);
  ergebnis.kandidaten = { alle: kandidaten.length, eben: eben.length, bergauf: bergauf.length };
  ergebnis.gras = auswahl.filter(Boolean).map((k) => {
    stelleAuf(k.s, k.x, k.z, k.richtung);
    return { s: k.s, seite: k.seite, d: k.d, w: k.w, steigung: k.steigung, steilste: k.steilste, ...rueckwaertsRaus() };
  });

  // --- 2. Von der Strasse seitlich über die Bankett-Kante ---
  // Auto 2 m neben der Mitte, quer zur Strasse, mit kmh und etwas Gas Richtung Wiese. Sobald es
  // 7.5 m von der Mitte weg ist (2 m hinter der Bankett-Kante), Rückwärtsgang voll.
  function querAb(s, seite, kmh) {
    const p = S.punktBei(s);
    const i = S.abfrage(p.x, p.z, q).i;
    const nx = -S.tz[i] * seite, nz = S.tx[i] * seite;
    stelleAuf(s, p.x + nx * 2, p.z + nz * 2, Math.atan2(nx, nz), kmh / 3.6);
    let t = 0, maxD = 0;
    while (t < 4 && maxD < 7.5) {
      A.physikSchritt(A.SCHRITT, { ...LEER, gas: 0.3 });
      t += A.SCHRITT;
      maxD = Math.max(maxD, (A.physik.x - p.x) * nx + (A.physik.z - p.z) * nz);
    }
    const drueber = maxD >= 7.5;
    const r = drueber ? rueckwaertsRaus() : { raus: false };
    // Nicht zurück: Ist das Auto über eine Böschung gerollt, die steiler als steilsterHang ist
    // (z. B. zwischen zwei Kehren)? Dort kommt es absichtlich nicht mehr rückwärts hoch.
    const h = (d) => W.gelaendeHoehe(p.x + nx * d, p.z + nz * d);
    const bis = (A.physik.x - p.x) * nx + (A.physik.z - p.z) * nz;
    let steilste = 0;
    for (let d = 5.5; d < bis; d += 0.25) steilste = Math.max(steilste, (h(d) - h(d + 0.25)) / 0.25);
    const zuSteil = drueber && !r.raus && steilste > C.grenze.steilsterHang;
    return { s, seite, kmh, maxD, drueber, zuSteil, steilste, ...r };
  }
  // freie Stellen: nicht an der Felswand, 16 m quer zur Strasse kein Hindernis, kein anderer Ast
  const stellen = [];
  for (let s = 20; s < S.laenge - 20; s += 7) {
    for (const seite of [-1, 1]) {
      const p = S.punktBei(s);
      const i = S.abfrage(p.x, p.z, q).i;
      if (q.wandSeite && q.wandStaerke > 0.05) continue;
      const nx = -S.tz[i] * seite, nz = S.tx[i] * seite;
      if (!weg(p.x, p.z, nx, nz, 0, 16, 2.5)) continue;
      const qq = S.abfrage(p.x + nx * 8, p.z + nz * 8, {});
      if (Math.abs(qq.s - s) > 3) continue;
      stellen.push({ s, seite, stufe: W.bodenBei(p.x + nx * 5.51, p.z + nz * 5.51).h - W.bodenBei(p.x + nx * 5.49, p.z + nz * 5.49).h });
    }
  }
  // die 20 Haupt-Fahrten: 4 Stellen mit der grössten Stufe an der Kante, je 5, 10, 15, 20, 25 km/h
  const grossteStufe = [...stellen].sort((a, b) => b.stufe - a.stufe);
  ergebnis.kante = [];
  for (const st of grossteStufe.slice(0, 4)) for (const kmh of [5, 10, 15, 20, 25]) ergebnis.kante.push({ ...querAb(st.s, st.seite, kmh), stufe: st.stufe });
  // und alle freien Stellen der Strecke
  ergebnis.alleKante = { anzahl: 0, drueber: 0, raus: 0, zuSteil: [], beispiele: [] };
  for (const st of stellen) for (const kmh of [5, 10, 15, 20, 25]) {
    const r = querAb(st.s, st.seite, kmh);
    if (r.zuSteil) { ergebnis.alleKante.zuSteil.push(r); continue; }
    ergebnis.alleKante.anzahl++;
    if (r.drueber) ergebnis.alleKante.drueber++;
    if (r.raus) ergebnis.alleKante.raus++;
    else if (ergebnis.alleKante.beispiele.length < 5) ergebnis.alleKante.beispiele.push(r);
  }
  ergebnis.stufen = { min: Math.min(...stellen.map((x) => x.stufe)), max: Math.max(...stellen.map((x) => x.stufe)) };
  return ergebnis;
});

let fehler = 0;
const pruefe = (ok, text) => { console.log(`  ${ok ? 'OK   ' : 'FEHLT'} ${text}`); if (!ok) fehler++; };
const f = (n, d = 1) => (n == null ? '-' : n.toFixed(d));
const seite = (x) => (x > 0 ? 'rechts' : 'links');

console.log('0. Reine Fahrphysik (Rückwärtsgang voll, Tempo nach 2 s):');
const P = erg.physik;
pruefe(P.grasGrenze > 5, `Gras, bergauf so steil wie steilsterHang: ${f(P.grasGrenze)} km/h rückwärts`);
pruefe(P.bankettGrenze > 5, `Bankett, gleich steil: ${f(P.bankettGrenze)} km/h rückwärts`);
console.log(`        Gras eben: ${f(P.grasEben)} km/h`);
pruefe(P.asphaltEben === P.asphaltOhneFaktor, `Asphalt eben: ${f(P.asphaltEben, 3)} km/h, genau wie ohne Faktor (${f(P.asphaltOhneFaktor, 3)} km/h)`);

console.log(`\n1. Im Gras abgestellt, Rückwärtsgang voll (Kandidaten: ${erg.kandidaten.alle}, davon eben ${erg.kandidaten.eben}, bergauf ${erg.kandidaten.bergauf}; steilste mögliche Stelle ${f(erg.steilsterKandidat * 100, 0)} %):`);
for (const r of erg.gras) {
  console.log(`   ${String(r.s).padStart(4)} m ${seite(r.seite).padEnd(6)} ${String(r.d).padStart(2)} m neben der Mitte, Winkel ${String(r.w).padStart(3)}°,` +
    ` hinter dem Auto ${f(r.steigung * 100, 0).padStart(3)} % bergauf (steilste Stelle ${f(r.steilste * 100, 0)} %):` +
    ` ${r.raus ? `nach ${f(r.t)} s auf dem Asphalt` : r.haenger ? 'HÄNGT' : 'NICHT RAUS'}`);
}
const grasRaus = erg.gras.filter((r) => r.raus).length;
pruefe(erg.gras.length === 20 && grasRaus === 20, `zurück auf der Strasse: ${grasRaus} von ${erg.gras.length}`);
pruefe(erg.gras.some((r) => Math.abs(r.steigung) < 0.03) && erg.gras.some((r) => r.steigung > 0.4), 'eben und steil bergauf sind beide dabei');

console.log(`\n2. Seitlich von der Strasse übers Bankett (Stufe an der Kante ${f(erg.stufen.min * 100, 0)} bis ${f(erg.stufen.max * 100, 0)} cm):`);
for (const r of erg.kante) {
  console.log(`   ${String(r.s).padStart(4)} m ${seite(r.seite).padEnd(6)} Stufe ${f(r.stufe * 100, 0)} cm, ${String(r.kmh).padStart(2)} km/h:` +
    ` ${r.drueber ? 'über die Kante' : `HÄNGT bei ${f(r.maxD, 2)} m`}, ${r.raus ? `rückwärts nach ${f(r.t)} s auf dem Asphalt` : 'NICHT ZURÜCK'}`);
}
const kanteOk = erg.kante.filter((r) => r.drueber && r.raus).length;
pruefe(erg.kante.length === 20 && kanteOk === 20, `über die Kante und rückwärts zurück: ${kanteOk} von ${erg.kante.length}`);
const K = erg.alleKante;
for (const r of K.beispiele) console.log(`   Problem: ${r.s} m ${seite(r.seite)}, ${r.kmh} km/h, kam bis ${f(r.maxD, 2)} m`);
pruefe(K.drueber === K.anzahl, `ganze Strecke, alle freien Stellen: über die Kante ${K.drueber} von ${K.anzahl}`);
pruefe(K.raus === K.anzahl, `ganze Strecke: rückwärts zurück auf den Asphalt ${K.raus} von ${K.anzahl}`);
for (const r of K.zuSteil) {
  console.log(`   nicht gezählt: ${r.s} m ${seite(r.seite)}, ${r.kmh} km/h – über eine ${f(r.steilste * 100, 0)} % steile Böschung gerollt,` +
    ` dort kommt man absichtlich nicht mehr hoch (steilsterHang)`);
}

console.log('\n3. Sonstiges:');
pruefe(!spiel.fehler.length, `keine Fehler in der Browser-Konsole (${spiel.fehler.length})`);
console.log(fehler ? `\n${fehler} Prüfung(en) nicht erfüllt.` : '\nAlle Prüfungen erfüllt.');
await spiel.schliessen();
process.exit(fehler ? 1 : 0);
