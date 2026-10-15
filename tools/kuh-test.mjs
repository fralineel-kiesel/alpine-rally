// Test für Kühe, Büsche und Fernwald (Meilenstein 2b):  node tools/kuh-test.mjs
//
// Im Headless-Browser mit dem echten Spiel (Fahrphysik, Gelände, alle Hindernisse):
//   1. Auto fährt von der Strasse her in jede Kuh (frontal und etwas versetzt): hart zum Halt,
//      steckt nicht fest; danach rückwärts raus (seit 2c auch bergauf im Gras, siehe gras-test.mjs);
//      klappt das nicht, vorwärts mit Lenken
//   2. Regeln für jede Kuh: Abstand zur Strasse, zu Zaun/Planke/Schild, zu Weidetoren, nicht auf
//      der Innenseite der Abkürzungs-Kurven, flach, Füsse auf dem Boden (schwebt nicht)
//   3. Büsche: keine Hindernisse, nicht zu nah an der Strasse, nicht zu hoch;
//      Fernbäume weit genug weg von jeder Strasse
//   4. gleicher seed = gleiche Kühe (zweimal planen), keine Fehler in der Browser-Konsole
// Das Spiel selbst lädt diese Datei nicht.

import { starteSpiel } from './spiel-browser.mjs';

const spiel = await starteSpiel();
await spiel.ladeSpiel();

const erg = await spiel.page.evaluate(async () => {
  const A = window.__alpineRally;
  const S = A.strecke, K = A.CONFIG.kollision, C = A.CONFIG.kuehe;
  const R = A.strassenrand, KU = A.kuehe;
  const alle = [...A.pflanzen.hindernisse, ...R.hindernisse, ...KU.hindernisse];
  const q = {};
  const LEER = { gas: 0, bremse: 0, lenkung: 0, handbremse: false, reset: false, debug: false };

  // Wie tief steckt das tiefste Hindernis im Auto (Meter)? Und welches berührt das Auto?
  function kontakt() {
    const p = A.physik, kl = K.autoLaenge / 2 - K.eckRadius, kb = K.autoBreite / 2 - K.eckRadius;
    let tief = 0, best = Infinity, art = null;
    for (const h of alle) {
      const dx = h.x - p.x, dz = h.z - p.z;
      if (dx * dx + dz * dz > 36) continue;
      const v = dx * Math.sin(p.richtung) + dz * Math.cos(p.richtung), s = dx * Math.cos(p.richtung) - dz * Math.sin(p.richtung);
      const ev = Math.abs(v) - kl, es = Math.abs(s) - kb;
      const d = ev > 0 || es > 0 ? Math.hypot(Math.max(ev, 0), Math.max(es, 0)) : Math.max(ev, es);
      tief = Math.max(tief, h.r + K.eckRadius - d);
      const abst = d - K.eckRadius - h.r;
      if (abst < best) { best = abst; art = h.kuh ? 'kuh' : h.rand || (h.sperre ? 'sperre' : 'baum/stein'); }
    }
    return { tief, art };
  }
  // Auto fährt von der Strasse her auf die Kuh zu (Start dist Meter davor, seitlich um "versatz"
  // Meter verschoben, gerade drauf zu), mit kmh und etwas Gas. Nach dem Aufprall 0.4 s weiter,
  // dann wie ein Spieler: Bremse/Rückwärts halten. Klappt das nicht (bergauf im Gras), vorwärts
  // mit voll eingeschlagener Lenkung.
  function anfahrt(kuh, versatz, kmh, dist = 12) {
    const p = S.punktBei(kuh.s);
    const dx = kuh.x - p.x, dz = kuh.z - p.z, l = Math.hypot(dx, dz);
    const fx = dx / l, fz = dz / l, sx = fz, sz = -fx;
    const x0 = kuh.x - fx * dist + sx * versatz, z0 = kuh.z - fz * dist + sz * versatz, richtung = Math.atan2(fx, fz);
    // Weg frei (ausser der Kuh selbst)?
    for (let t = -2; t < dist + 3; t += 0.5) {
      const px = x0 + fx * t, pz = z0 + fz * t;
      for (const h of alle) if (h !== kuh.h && Math.hypot(h.x - px, h.z - pz) < h.r + 1.6) return null;
    }
    A.setzeAuf(S.abfrage(x0, z0, q).s);
    A.physik.reset(x0, z0, richtung);
    const v = kmh / 3.6;
    A.physik.vx = fx * v; A.physik.vz = fz * v; A.physik.vVor = v;
    A.getriebe.reset();
    A.rennen.zustand = 'bereit';
    const vorher = A.kollision.letzterAufprall;
    let t = 0, aufprall = null, maxEin = 0, getroffen = null;
    while (t < 4) {
      A.physikSchritt(A.SCHRITT, aufprall ? LEER : { ...LEER, gas: 0.5 });
      t += A.SCHRITT;
      maxEin = Math.max(maxEin, kontakt().tief);
      if (!aufprall && A.kollision.letzterAufprall !== vorher) { aufprall = A.kollision.letzterAufprall; getroffen = kontakt().art; t = 3.6; }
    }
    const standTempo = A.physik.tempo;
    const hx = A.physik.x, hz = A.physik.z, rr = A.physik.richtung;
    const bergauf = (A.welt.gelaendeHoehe(hx - Math.sin(rr) * 3, hz - Math.cos(rr) * 3) - A.welt.gelaendeHoehe(hx, hz)) / 3;
    let rueck = 0, vorwaerts = 0;
    if (aufprall) {
      let still = null;
      for (let t2 = 0; t2 < 6; t2 += A.SCHRITT) {
        A.physikSchritt(A.SCHRITT, { ...LEER, bremse: 1 });
        maxEin = Math.max(maxEin, kontakt().tief);
        if (!still && A.physik.vVor < 0.05) still = { x: A.physik.x, z: A.physik.z, t: t2 };
        if (still && t2 - still.t > 4) break;
      }
      if (still) rueck = Math.hypot(A.physik.x - still.x, A.physik.z - still.z);
      if (rueck < 2) {
        // vorwärts mit Lenkung (wie ein Spieler, der um die Kuh herum will)
        const x1 = A.physik.x, z1 = A.physik.z;
        for (let t2 = 0; t2 < 4; t2 += A.SCHRITT) {
          A.physikSchritt(A.SCHRITT, { ...LEER, gas: 0.7, lenkung: 1 });
          maxEin = Math.max(maxEin, kontakt().tief);
        }
        vorwaerts = Math.hypot(A.physik.x - x1, A.physik.z - z1);
      }
    }
    return {
      aufprall: aufprall ? { vorher: aufprall.vorher * 3.6, nachher: aufprall.nachher * 3.6 } : null,
      standTempo: standTempo * 3.6, rueck, vorwaerts, maxEin, getroffen, bergauf,
    };
  }

  const ergebnis = { statistik: KU.statistik, deko: A.deko.statistik };
  const kuehe = KU.kuehe.map((k, i) => ({ ...k, h: KU.hindernisse[i], r: KU.hindernisse[i].r }));
  // 1. Aufprall: jede Kuh von der Strasse her, frontal (mittig) und 0.6 m versetzt.
  // Nur Kühe, die man erreichen kann (weiter als grenze.maxAbstand von der Strasse geht es nicht).
  ergebnis.aufprall = [];
  const erreichbar = kuehe.filter((k) => k.abstand + 1 < A.CONFIG.grenze.maxAbstand);
  ergebnis.erreichbar = erreichbar.length;
  for (const kuh of erreichbar) {
    for (const versatz of [0, 0.6]) {
      const r = anfahrt(kuh, versatz, 40);
      if (r) ergebnis.aufprall.push({ kuhNr: kuehe.indexOf(kuh), name: `${['stehende', 'grasende', 'liegende'][kuh.pose]} Kuh bei ${Math.round(kuh.s)} m ${kuh.seite > 0 ? 'rechts' : 'links'} (${kuh.abstand.toFixed(0)} m neben der Strasse), ${versatz ? 'versetzt' : 'mittig'}`, pose: kuh.pose, ...r });
    }
  }

  // 2. Regeln für jede Kuh
  const { baueKollision } = await import('/js/kollision.js');
  const kolRand = baueKollision(R.hindernisse);
  const innen = [...S.nichtSchneiden.map((k) => ({ ...k, puffer: C.pufferNichtSchneiden })), ...S.schneiden.map((k) => ({ ...k, puffer: C.pufferSchneiden }))];
  const fehler = [];
  let minStrasse = Infinity, minRand = Infinity, minTor = Infinity, maxSchweben = -Infinity, maxSinken = 0;
  const tore = R.plan.tore.map((t) => R.plan.punkt((t.von + t.bis) / 2, t.seite * 6.35));
  for (const k of kuehe) {
    S.abfrage(k.x, k.z, q);
    // Abstand zu jeder Strassenmitte (auch andere Äste): ganze Strecke absuchen
    let dMin = Infinity;
    for (let i = 0; i < S.anzahl; i++) dMin = Math.min(dMin, Math.hypot(S.px[i] - k.x, S.pz[i] - k.z));
    minStrasse = Math.min(minStrasse, dMin);
    if (dMin < C.abstandStrasse) fehler.push(`Kuh ${Math.round(k.s)} m: nur ${dMin.toFixed(1)} m von der Strasse`);
    if (!kolRand.frei(k.x, k.z, k.r + C.abstandZaun - 0.01)) fehler.push(`Kuh ${Math.round(k.s)} m: zu nah an Zaun/Planke/Schild`);
    for (const h of R.hindernisse) minRand = Math.min(minRand, Math.hypot(h.x - k.x, h.z - k.z) - h.r - k.r);
    for (const t of tore) minTor = Math.min(minTor, Math.hypot(t.x - k.x, t.z - k.z));
    // Innenseite der Abkürzungs-Kurven: liegt die Kuh bis 45 m neben einem Streckenpunkt im Kurvenbereich auf der Innenseite?
    for (const kv of innen) {
      const sd = kv.seite === 'rechts' ? 1 : -1;
      for (let s = Math.max(0, Math.round(kv.sVon - kv.puffer)); s <= Math.min(S.anzahl - 1, Math.round(kv.sBis + kv.puffer)); s++) {
        const dx = k.x - S.px[s], dz = k.z - S.pz[s];
        const quer = dx * -S.tz[s] + dz * S.tx[s], laengs = dx * S.tx[s] + dz * S.tz[s];
        if (Math.sign(quer) === sd && Math.abs(laengs) < 1 && Math.abs(quer) < 45) {
          fehler.push(`Kuh ${Math.round(k.s)} m: auf der Innenseite der Kurve ${kv.sVon}–${kv.sBis} ${kv.seite}`); break;
        }
      }
    }
    // Füsse: nicht über dem tiefsten Punkt unter dem Körper, nicht tief im Boden
    const fx = Math.sin(k.blick), fz = Math.cos(k.blick);
    let hMin = Infinity;
    for (let a = -1; a <= 1; a += 0.25) for (const b of [-0.3, 0, 0.3]) hMin = Math.min(hMin, A.welt.gelaendeHoehe(k.x + fx * a * k.groesse + fz * b, k.z + fz * a * k.groesse - fx * b));
    maxSchweben = Math.max(maxSchweben, k.y - hMin);
    maxSinken = Math.max(maxSinken, A.welt.gelaendeHoehe(k.x, k.z) - k.y);
  }
  Object.assign(ergebnis, { fehler, minStrasse, minRand, minTor, maxSchweben, maxSinken, anzahl: kuehe.length });

  // 3. Büsche, Jungtannen, Fernbäume
  const D = A.deko;
  const kreise = A.pflanzen.hindernisse.length + R.hindernisse.length + KU.hindernisse.length;
  ergebnis.kollisionOhneBuesche = A.kollision.anzahl === kreise;
  ergebnis.buschMinStrasse = Math.min(...D.buesche.map((b) => S.abfrage(b.x, b.z, q).abstand));
  ergebnis.buschMaxHoehe = Math.max(...D.buesche.map((b) => b.h));
  ergebnis.jungMaxHoehe = Math.max(...D.jungTannen.map((b) => b.h));
  ergebnis.fernMinStrasse = Math.min(...D.fernbaeume.map((b) => S.abfrage(b.x, b.z, q).abstand));

  // 4. gleicher seed = gleiche Kühe
  const { planeKuehe } = await import('/js/kuehe.js');
  // (M3c: mit denselben Eingaben wie im Spiel – der Start- und Zielbereich kommt erst nach den Kühen dazu)
  const SZ = A.startZiel, eigene = new Set(SZ ? [...SZ.hindernisse, ...SZ.hindernisseBaeume, ...SZ.tannen, ...SZ.laub] : []);
  const ohne = (l) => l.filter((h) => !eigene.has(h));
  const pfl = { ...A.pflanzen, tannen: ohne(A.pflanzen.tannen), laubbaeume: ohne(A.pflanzen.laubbaeume), hindernisse: ohne(A.pflanzen.hindernisse) };
  const nochmal = planeKuehe(S, A.welt, pfl, { ...R, hindernisse: ohne(R.hindernisse) }).kuehe;
  ergebnis.gleich = nochmal.length === kuehe.length && nochmal.every((k, i) => k.x === kuehe[i].x && k.z === kuehe[i].z && k.pose === kuehe[i].pose && k.art === kuehe[i].art);
  return ergebnis;
});

let fehler = 0;
const pruefe = (ok, text) => { console.log(`  ${ok ? 'OK   ' : 'FEHLT'} ${text}`); if (!ok) fehler++; };
const f = (n, d = 1) => (n == null ? '-' : n.toFixed(d));

console.log('Kühe:', JSON.stringify(erg.statistik));
console.log('\n1. Aufprall: Auto fährt von der Strasse her mit 40 km/h in jede Kuh (Fahrer gibt etwas Gas):');
const A1 = erg.aufprall;
const getroffen = A1.filter((r) => r.aufprall && r.getroffen === 'kuh');
const getesteteKuehe = new Set(A1.map((r) => r.kuhNr)).size;
// Viele Wege sind verstellt (andere Kühe der Herde, Zaun dazwischen): getestet wird, wo der Weg frei ist
pruefe(getesteteKuehe >= 10 && A1.some((r) => r.pose === 2), `${A1.length} Anfahrten an ${getesteteKuehe} verschiedenen Kühen, auch liegende (${erg.erreichbar} von ${erg.anzahl} Kühen sind mit dem Auto erreichbar, die anderen stehen hinter der Grenze bei 45 m)`);
pruefe(getroffen.length === A1.length, `jedes Mal die Kuh getroffen (${getroffen.length} von ${A1.length})`);
const hart = getroffen.filter((r) => r.standTempo < 0.1 * r.aufprall.vorher);
pruefe(hart.length === getroffen.length, `hart zum Halt, 0.4 s danach unter 10 % vom Tempo (${hart.length} von ${getroffen.length})`);
const maxEin = Math.max(...A1.map((r) => r.maxEin));
pruefe(maxEin < 0.15, `steckt nie fest (höchstens ${f(maxEin, 2)} m in der Kuh)`);
const rueck = getroffen.filter((r) => r.rueck > 2), flach = getroffen.filter((r) => r.bergauf < 0.04);
pruefe(flach.length > 0 && flach.every((r) => r.rueck > 2), `rückwärts raus, wo es hinter dem Auto nicht bergauf geht (${flach.filter((r) => r.rueck > 2).length} von ${flach.length}, je mehr als 2 m in 4 s ab Stillstand)`);
const nichtRueck = getroffen.filter((r) => r.rueck <= 2);
pruefe(nichtRueck.every((r) => r.vorwaerts > 3), `sonst (bergauf im Gras) vorwärts mit Lenken frei (${nichtRueck.filter((r) => r.vorwaerts > 3).length} von ${nichtRueck.length})`);
console.log(`  rückwärts raus insgesamt: ${rueck.length} von ${getroffen.length}`);
for (const r of [...A1.filter((r) => r.pose === 0).slice(0, 2), ...A1.filter((r) => r.pose === 2).slice(0, 2), ...nichtRueck.slice(0, 3)]) {
  console.log(`   ${r.name}: ${r.aufprall ? `${f(r.aufprall.vorher, 0)} -> ${f(r.aufprall.nachher, 0)} km/h` : 'kein Aufprall'}, 0.4 s danach ${f(r.standTempo)} km/h,` +
    ` hinter dem Auto ${f(r.bergauf * 100, 0)} % bergauf, rückwärts ${f(r.rueck)} m${r.rueck <= 2 ? `, vorwärts mit Lenken ${f(r.vorwaerts)} m` : ''}`);
}
console.log(`\n2. Regeln für alle ${erg.anzahl} Kühe:`);
for (const t of erg.fehler.slice(0, 10)) console.log('   ', t);
pruefe(!erg.fehler.length, `keine Regel verletzt (${erg.fehler.length})`);
console.log(`  nächste Strassenmitte ${f(erg.minStrasse)} m, nächster Zaun/Planke/Schild (Kante zu Kante) ${f(erg.minRand)} m, nächste Tor-Mitte ${f(erg.minTor)} m`);
pruefe(erg.maxSchweben <= 0.001, `Füsse auf dem Boden: höchstens ${f(erg.maxSchweben, 3)} m über dem tiefsten Punkt unter dem Körper`);
pruefe(erg.maxSinken < 0.6, `nicht im Boden versunken: höchstens ${f(erg.maxSinken, 2)} m unter der Mitte`);
console.log('\n3. Büsche, Jungtannen, Fernbäume:', JSON.stringify(erg.deko));
pruefe(erg.kollisionOhneBuesche, 'Büsche, Jungtannen und Fernbäume sind keine Hindernisse');
pruefe(erg.buschMinStrasse >= 6, `Büsche mindestens 6 m von der Strassenmitte (nächster ${f(erg.buschMinStrasse)} m)`);
pruefe(erg.buschMaxHoehe <= 1.2, `Büsche höchstens 1.2 m (höchster ${f(erg.buschMaxHoehe, 2)} m)`);
pruefe(erg.jungMaxHoehe < 2, `Jungtannen unter 2 m (höchste ${f(erg.jungMaxHoehe, 2)} m)`);
pruefe(erg.fernMinStrasse > 180, `Fernbäume weit weg von jeder Strasse (nächster ${f(erg.fernMinStrasse, 0)} m)`);
console.log('\n4. Sonstiges:');
pruefe(erg.gleich, 'gleicher seed = gleiche Kühe');
pruefe(!spiel.fehler.length, `keine Fehler in der Browser-Konsole (${spiel.fehler.length})`);
console.log(fehler ? `\n${fehler} Prüfung(en) nicht erfüllt.` : '\nAlle Prüfungen erfüllt.');
await spiel.schliessen();
process.exit(fehler ? 1 : 0);
