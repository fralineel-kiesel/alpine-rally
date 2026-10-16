// Test für "Leben an der Strecke" (Meilenstein 3d):  node tools/leben-test.mjs
//
// Im Headless-Browser mit dem echten Spiel (Fahrphysik, Gelände, alle Hindernisse):
//   1. Auto fährt in beide Unfallautos, aus mehreren Winkeln (von der Strasse her gerade und schräg, auf Heck
//      und Seite) und mit 30 / 50 km/h: hart zum Halt, steckt nicht fest, kommt rückwärts wieder raus
//   2. Regeln für alles Neue (Fans, Streckenposten, Hütten, Details, Banner, Band, Wracks): nicht auf der
//      Fahrbahn oder dem Bankett, Fans hinter dem Band, nichts auf der Innenseite der Kurven aus
//      "nichtSchneiden"/"schneiden" (plus Puffer) und keiner engeren Kurve, Wracks 7–14 m neben der
//      Strassenmitte, weit weg von Start, Ziel und den Kreuzungen
//   3. nichts musste weggelassen oder verschoben werden, Kühe von vorher alle da, neue Kühe nicht auf dem Weg
//   4. Sichtlinien der Stummel und der Verlängerungen an Start und Ziel: man sieht nirgends ein Ende
//   5. gleicher seed = gleicher Aufbau, keine Fehler in der Browser-Konsole
// Das Spiel selbst lädt diese Datei nicht.

import { starteSpiel } from './spiel-browser.mjs';

const spiel = await starteSpiel();
await spiel.ladeSpiel();

const erg = await spiel.page.evaluate(async () => {
  const A = window.__alpineRally;
  const S = A.strecke, N = A.netz, L = A.CONFIG.leben, K = A.CONFIG.kollision, LB = A.leben;
  const LEER = { gas: 0, bremse: 0, lenkung: 0, handbremse: false, reset: false, debug: false };
  const alle = [...A.pflanzen.hindernisse, ...A.strassenrand.hindernisse, ...A.kuehe.hindernisse];
  const q = {};
  const ergebnis = { statistik: LB.statistik, fehler: [] };
  const fehler = ergebnis.fehler;

  // Wie tief steckt das tiefste Hindernis im Auto (Meter)?
  function eindringen() {
    const p = A.physik, kl = K.autoLaenge / 2 - K.eckRadius, kb = K.autoBreite / 2 - K.eckRadius;
    let tief = 0;
    for (const h of alle) {
      const dx = h.x - p.x, dz = h.z - p.z;
      if (dx * dx + dz * dz > 49) continue;
      const v = dx * Math.sin(p.richtung) + dz * Math.cos(p.richtung), s = dx * Math.cos(p.richtung) - dz * Math.sin(p.richtung);
      const ev = Math.abs(v) - kl, es = Math.abs(s) - kb;
      const d = ev > 0 || es > 0 ? Math.hypot(Math.max(ev, 0), Math.max(es, 0)) : Math.max(ev, es);
      tief = Math.max(tief, h.r + K.eckRadius - d);
    }
    return tief;
  }

  // 1. Anfahrten auf ein Wrack: Ziel (zx, zz), aus Richtung w (Winkel der Fahrtrichtung), Start 12 m davor
  function anfahrt(wr, zx, zz, w, kmh) {
    const fx = Math.sin(w), fz = Math.cos(w), dist = 12;
    const x0 = zx - fx * dist, z0 = zz - fz * dist;
    // Weg frei bis kurz vor dem Wrack? (sonst ist die Anfahrt nicht möglich: überspringen)
    for (let t = -2.5; t < dist - 3.2; t += 0.5) {
      const px = x0 + fx * t, pz = z0 + fz * t;
      for (const h of alle) if (!wr.kreise.some((k) => k.x === h.x && k.z === h.z) && Math.hypot(h.x - px, h.z - pz) < h.r + 1.4) return null;
    }
    A.setzeAuf(S.abfrage(x0, z0, q).s);
    A.physik.reset(x0, z0, w);
    const v = kmh / 3.6;
    A.physik.vx = fx * v; A.physik.vz = fz * v; A.physik.vVor = v;
    A.getriebe.reset();
    A.rennen.zustand = 'bereit';
    const vorher = A.kollision.letzterAufprall;
    let t = 0, aufprall = null, maxEin = 0, tAufprall = 0;
    while (t < 5) {
      A.physikSchritt(A.SCHRITT, aufprall ? LEER : { ...LEER, gas: 0.4 });
      t += A.SCHRITT;
      maxEin = Math.max(maxEin, eindringen());
      if (!aufprall && A.kollision.letzterAufprall !== vorher) { aufprall = A.kollision.letzterAufprall; tAufprall = t; }
      if (aufprall && t > tAufprall + 0.4) break;
    }
    const nach04 = A.physik.tempo * 3.6;
    // rückwärts raus (Bremse/Rückwärts halten)
    let still = null, rueck = 0;
    for (let t2 = 0; t2 < 6; t2 += A.SCHRITT) {
      A.physikSchritt(A.SCHRITT, { ...LEER, bremse: 1 });
      maxEin = Math.max(maxEin, eindringen());
      if (!still && A.physik.vVor < 0.05) still = { x: A.physik.x, z: A.physik.z, t: t2 };
      if (still && t2 - still.t > 4) break;
    }
    if (still) rueck = Math.hypot(A.physik.x - still.x, A.physik.z - still.z);
    return { aufprall: aufprall ? { vorher: aufprall.vorher * 3.6, nachher: aufprall.nachher * 3.6, winkel: aufprall.winkel } : null, nach04, rueck, maxEin };
  }
  ergebnis.anfahrten = [];
  for (const wr of LB.wracks) {
    const p = S.punktBei(wr.s);
    const zurStrasse = Math.atan2(wr.x - p.x, wr.z - p.z); // von der Strasse zum Wrack
    const achse = Math.atan2(wr.ux, wr.uz);
    const ziele = [
      ['von der Strasse, gerade', zurStrasse, 0], ['von der Strasse, 30° schräg', zurStrasse + 0.52, 0], ['von der Strasse, -30° schräg', zurStrasse - 0.52, 0],
      ['aufs Heck', achse, -1.1], ['von der Seite (links)', achse + Math.PI / 2, 0], ['von der Seite (rechts)', achse - Math.PI / 2, 0],
    ];
    for (const [name, w, b] of ziele) {
      for (const kmh of [30, 50]) {
        const zx = wr.x + wr.ux * b, zz = wr.z + wr.uz * b;
        const r = anfahrt(wr, zx, zz, w, kmh);
        if (r) ergebnis.anfahrten.push({ wrack: wr.name, name, kmh, ...r });
      }
    }
  }

  // 2. Regeln
  const innen = [...S.nichtSchneiden.map((k) => ({ ...k, puffer: L.pufferNichtSchneiden })), ...S.schneiden.map((k) => ({ ...k, puffer: L.pufferSchneiden }))];
  // Innenseite: bezogen auf das nächste Stück Etappe (und einen zweiten Ast in der Nähe, z. B. die Kehre daneben).
  // (Nicht "irgendein Kurvenpunkt in 45 m": In einer Haarnadel läge sonst alles neben dem Ausgangs-Ast auch
  // "links" vom Eingangs-Ast, obwohl es ausserhalb der Kehre steht.)
  const q2 = {};
  function aufInnenseite(x, z) {
    const stuecke = [S.abfrage(x, z, q)];
    const ast = S.andererAst(x, z, q.s, 30, 45, q2);
    if (ast) stuecke.push(ast);
    for (const st of stuecke) {
      for (const kv of innen) {
        const sd = kv.seite === 'rechts' ? 1 : -1;
        if (st.s >= kv.sVon - kv.puffer && st.s <= kv.sBis + kv.puffer && Math.sign(st.seite) === sd && st.abstand < 45) return `${kv.sVon}–${kv.sBis} ${kv.seite}`;
      }
    }
    return null;
  }
  const naechsteStrasse = (x, z) => N.abfrage(x, z, q).abstand; // Etappe und Stummel
  let minKante = Infinity, minFan = Infinity;
  const arten = {};
  for (const h of LB.hindernisse) {
    const d = naechsteStrasse(h.x, h.z);
    arten[h.rand] = (arten[h.rand] || 0) + 1;
    minKante = Math.min(minKante, d - h.r);
    if (d - h.r < 5.9) fehler.push(`${h.rand} bei ${Math.round(S.abfrage(h.x, h.z, q).s)} m: Kante nur ${(d - h.r).toFixed(2)} m neben der Strassenmitte`);
    const k = aufInnenseite(h.x, h.z);
    if (k) fehler.push(`${h.rand} bei ${Math.round(q.s)} m: auf der Innenseite der Kurve ${k}`);
    S.abfrage(h.x, h.z, q);
    if (LB.istInnen(q.s, Math.sign(q.seite), q.abstand)) fehler.push(`${h.rand} bei ${Math.round(q.s)} m: auf der Innenseite einer engen Kurve`);
  }
  for (const f of LB.figuren) {
    const d = naechsteStrasse(f.x, f.z);
    minFan = Math.min(minFan, d);
    if (d < L.fans.abstand - 0.01) fehler.push(`Figur (${f.ort}) nur ${d.toFixed(2)} m neben der Strassenmitte`);
    const k = aufInnenseite(f.x, f.z);
    if (k) fehler.push(`Figur (${f.ort}) bei ${Math.round(q.s)} m: auf der Innenseite der Kurve ${k}`);
  }
  // Fans hinter dem Band: Jeder Fan steht weiter weg von der Strasse als das Band seines Spots (mit 0.3 m Luft)
  for (const sp of L.fans.spots) {
    const bandLat = Math.min(...sp.band.map((b) => b[2]));
    const vorne = LB.figuren.filter((f) => f.ort === sp.name && S.abfrage(f.x, f.z, q).abstand < bandLat + 0.3 && Math.abs(q.s - (sp.s[0] + sp.s[1]) / 2) < 30);
    if (vorne.length) fehler.push(`${vorne.length} Fans am Spot ${sp.name} stehen vor dem Band`);
  }
  // Wracks
  ergebnis.wracks = LB.wracks.map((w) => ({ name: w.name, s: Math.round(w.s), abstand: +w.abstand.toFixed(1), baum: !!w.baum }));
  const kreuzungen = A.CONFIG.nebenwege.flatMap((n) => [n.abzweig, n.einmuendung]);
  for (const w of LB.wracks) {
    if (w.abstand < 7 || w.abstand > 14) fehler.push(`Wrack ${w.name}: ${w.abstand.toFixed(1)} m neben der Strassenmitte (soll 7–14 m)`);
    if (w.s - S.startS < 300 || S.zielS - w.s < 300) fehler.push(`Wrack ${w.name}: zu nah an Start/Ziel`);
    const k = Math.min(...kreuzungen.map((c) => Math.abs(c - w.s)));
    if (k < 70) fehler.push(`Wrack ${w.name}: nur ${k.toFixed(0)} m von einer Kreuzung`);
    ergebnis.wracks.find((x) => x.name === w.name).kreuzung = Math.round(k);
  }
  Object.assign(ergebnis, { minKante, minFan, arten });

  // 3. nichts weggelassen, Kühe
  if (LB.statistik.abgelehnt.length) fehler.push(`weggelassen: ${LB.statistik.abgelehnt.join(', ')}`);
  if (LB.statistik.verschoben.length) fehler.push(`verschoben: ${LB.statistik.verschoben.join(', ')}`);
  const { KUHFOLGE } = await import('/js/kuhfolge.js');
  const kst = A.kuehe.statistik;
  ergebnis.kuehe = { eingefroren: kst.eingefroren, alt: KUHFOLGE ? KUHFOLGE.kuehe.length : 0, weggefallen: kst.weggefallen, neu: kst.neu, anzahl: kst.anzahl };
  if (!kst.eingefroren || kst.weggefallen) fehler.push('nicht alle Kühe von vorher stehen noch da');
  const gleichAlt = KUHFOLGE && KUHFOLGE.kuehe.every((k) => A.kuehe.kuehe.some((x) => x.x === k[0] && x.z === k[1] && x.pose === k[3]));
  if (!gleichAlt) fehler.push('Kühe von vorher stehen anders');
  for (const k of A.kuehe.kuehe.filter((x) => x.leben)) {
    if (naechsteStrasse(k.x, k.z) < 8) fehler.push(`neue Kuh bei ${Math.round(k.s)} m: nur ${naechsteStrasse(k.x, k.z).toFixed(1)} m von der Strasse`);
  }

  // 4. Sichtlinien (wie tools/stummel-sicht.mjs)
  const m = await import('/tools/stummel-sicht.js');
  const st = m.pruefeSicht(A, { baeume: true }), en = m.pruefeSichtEnden(A, { baeume: true });
  ergebnis.sicht = { stummel: st.map((e) => `${e.stummel}: ${e.sichtbar}/${e.strahlen}`), enden: en.map((e) => `${e.ende}: ${e.sichtbar}/${e.strahlen}`) };
  if ([...st, ...en].some((e) => e.sichtbar)) fehler.push('Sichtlinien: ein Ende ist sichtbar');

  // 5. gleicher seed = gleicher Aufbau (ohne die eigenen Hindernisse noch einmal bauen)
  const { baueLeben } = await import('/js/leben.js');
  const eigene = new Set(LB.hindernisse);
  const rand = { ...A.strassenrand, hindernisse: A.strassenrand.hindernisse.filter((h) => !eigene.has(h)) };
  const nochmal = baueLeben(new A.THREE.Scene(), S, A.welt, { pflanzen: A.pflanzen, rand, kuehe: A.kuehe });
  ergebnis.gleich = nochmal.figuren.length === LB.figuren.length && nochmal.figuren.every((f, i) => f.x === LB.figuren[i].x && f.z === LB.figuren[i].z && f.pose === LB.figuren[i].pose)
    && nochmal.hindernisse.length === LB.hindernisse.length && nochmal.wracks.every((w, i) => w.x === LB.wracks[i].x && w.z === LB.wracks[i].z);
  return ergebnis;
});

let ok = true;
const pruefe = (bed, text) => { console.log(`${bed ? 'OK  ' : 'FEHLER'} ${text}`); if (!bed) ok = false; };
const st = erg.statistik;
console.log(`Figuren: ${st.figuren} (Fans ${JSON.stringify(st.fans)}, Streckenposten ${st.posten}), Wracks ${st.wracks}, Hindernis-Kreise ${st.hindernisse}, Band ${st.bandMeter} m, ${st.dreiecke} Dreiecke, ${st.meshes} Teile, ${st.ms} ms`);
console.log('Wracks:', erg.wracks.map((w) => `${w.name} bei ${w.s} m, ${w.abstand} m neben der Mitte${w.baum ? ', am Baum' : ''}, ${w.kreuzung} m bis zur nächsten Kreuzung`).join(' | '));
console.log('Kühe:', JSON.stringify(erg.kuehe));
console.log('Sichtlinien:', erg.sicht.stummel.join(', '), '|', erg.sicht.enden.join(', '));
console.log(`\nAnfahrten auf die Wracks (${erg.anfahrten.length}):`);
for (const a of erg.anfahrten) {
  const au = a.aufprall;
  console.log(`  ${a.wrack.padEnd(8)} ${a.name.padEnd(28)} ${String(a.kmh).padStart(2)} km/h: ${au ? `Aufprall ${au.vorher.toFixed(0)} -> ${au.nachher.toFixed(0)} km/h (${au.winkel.toFixed(0)}°), nach 0.4 s ${a.nach04.toFixed(1)} km/h` : 'KEIN AUFPRALL'}, rückwärts ${a.rueck.toFixed(1)} m, steckte max. ${(a.maxEin * 100).toFixed(1)} cm drin`);
}
const an = erg.anfahrten;
pruefe(an.filter((a) => a.wrack === 'tal').length >= 6 && an.filter((a) => a.wrack === 'abfahrt').length >= 6, 'je Wrack mindestens 6 Anfahrten möglich');
pruefe(an.every((a) => a.aufprall), 'jede Anfahrt endet mit einem Aufprall');
pruefe(an.filter((a) => a.aufprall && a.aufprall.winkel < 35).every((a) => a.nach04 < 5), 'gerade/leicht schräg: hart zum Halt (nach 0.4 s unter 5 km/h)');
pruefe(an.every((a) => a.maxEin < 0.06), 'steckt nie im Wrack fest (höchstens 6 cm Kontakt)');
pruefe(an.every((a) => a.rueck > 2), 'kommt immer rückwärts wieder raus (mehr als 2 m)');
console.log(`\nnächste Kante eines neuen Hindernisses: ${erg.minKante.toFixed(2)} m neben einer Strassenmitte (Bankett endet bei 5.5 m); nächster Fan/Posten: ${erg.minFan.toFixed(2)} m`);
console.log('Hindernis-Kreise je Art:', JSON.stringify(erg.arten));
for (const f of erg.fehler) console.log('   ', f);
pruefe(!erg.fehler.length, 'Regeln: Strasse, Innenseiten, Band, Wracks, nichts weggelassen, Kühe, Sichtlinien');
pruefe(erg.gleich, 'gleicher seed = gleicher Aufbau');
pruefe(!spiel.fehler.length, 'keine Fehler in der Browser-Konsole');
await spiel.schliessen();
console.log(ok ? '\nAlles bestanden.' : '\nNICHT bestanden.');
process.exit(ok ? 0 : 1);
