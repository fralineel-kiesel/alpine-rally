// Test für den Start- und Zielbereich (Meilenstein 3c):  node tools/startziel-test.mjs [--details]
//
// Im Headless-Browser mit dem echten Spiel (Fahrphysik, Gelände, alle Hindernisse):
//   1. Etappe unverändert: Länge, Start- und Ziellinie, Checkpoints, Abkürzungs-Listen.
//   2. Rennlogik kennt die Verlängerungen nicht: Auto auf der Verlängerung hat das s der Etappe
//      (vor 0 bzw. nach dem Ende), "R" setzt auf die Etappe, vom Start rückwärts bis zur Absperrung
//      und wieder vor: die Zeit startet erst an der Startlinie; nach dem Ziel bleibt die Endzeit.
//   3. Ausrollen nach dem Ziel aus 120 und 180 km/h (mit und ohne Gas, das Auto bremst von selbst):
//      steht vor der Absperrung, kein Aufprall.
//   4. Rückwärts am Start: aus der Startaufstellung (verschiedene Winkel, Lenkung) voll rückwärts –
//      nie hinter die Absperrung; danach vorwärts wieder weg (steckt nicht fest).
//   5. Vorwärts in die Absperrung der Ausrollstrecke (ohne Bremshilfe, 40-100 km/h, 0°/±20°/±40°):
//      nie hindurch, frontal hart zum Halt, rückwärts raus.
//   6. Umfahren: aus einem Fächer von Startpunkten (Strasse, Wiese) und Zielen (hinter der Absperrung,
//      um beide Enden herum), 30/70 km/h, mit/ohne Handbremse – nie hinter die Absperrung.
//   7. Kein Hängenbleiben: in Bögen, Zuschauer, Strohballen, Band, Zelte, Container, Autos fahren
//      (von der Strasse und von der Wiese her): hart zum Halt, steckt nicht drin, rückwärts raus.
//   8. Regeln: Zuschauer mindestens 6 m (Wert: zuschauer.abstand) neben jeder Strassenmitte, 60-100
//      Stück, schauen zur Strasse; nichts auf Fahrbahn und Bankett; Banner hoch über der Strasse;
//      Boden auf den Verlängerungen ist Asphalt (keine Graslücke); gleicher seed = gleicher Aufbau.
//   9. Sichtlinien (tools/stummel-sicht.js): man sieht das Ende der Verlängerungen nie.
//  10. Keine Fehler in der Browser-Konsole.
// Das Spiel selbst lädt diese Datei nicht.

import { starteSpiel } from './spiel-browser.mjs';

const spiel = await starteSpiel();
await spiel.ladeSpiel();
const t0 = Date.now();

const erg = await spiel.page.evaluate(async () => {
  const A = window.__alpineRally, S = A.strecke, N = A.netz, C = A.CONFIG, SZ = A.startZiel;
  const sicht = await import('/tools/stummel-sicht.js');
  const { baueStartZiel } = await import('/js/startziel.js');
  const GRAD = Math.PI / 180;
  const LEER = { gas: 0, bremse: 0, lenkung: 0, handbremse: false, reset: false, debug: false };
  const q = {};
  const wn = (w) => Math.atan2(Math.sin(w), Math.cos(w));
  const START = N.ende('start'), ZIEL = N.ende('ziel');
  const hinter = (ast) => N.hinterSperre(ast, A.physik.x, A.physik.z, 1);
  function setze(x, z, w, v, zustand = 'bereit') {
    A.setzeAuf(Math.max(0, Math.min(S.laenge, S.abfrage(x, z, q).s)));
    A.physik.reset(x, z, w);
    A.physik.vx = Math.sin(w) * v; A.physik.vz = Math.cos(w) * v; A.physik.vVor = v;
    A.getriebe.reset();
    A.rennen.zustand = zustand;
    A.rennen.letztesS = S.abfrage(x, z, q).s;
    A.kollision.letzterAufprall = null;
  }
  function steuer(zx, zz, vSoll, handbremse) {
    const p = A.physik;
    const fehler = wn(Math.atan2(zx - p.x, zz - p.z) - p.richtung);
    const e = { ...LEER, lenkung: Math.max(-1, Math.min(1, -fehler * 2.5)) };
    if (p.tempo < vSoll) e.gas = 1; else e.bremse = 0.3;
    if (handbremse && Math.abs(fehler) > 0.5 && p.tempo > 8) { e.handbremse = true; e.gas = 0.4; }
    return e;
  }
  // Ort bei m (Etappen-Meter, auf den Verlängerungen weiter), lat (+ = rechts)
  const ort = SZ.ort;
  const ergebnis = {};

  // 1. Etappe
  ergebnis.etappe = { laenge: S.laenge, startS: S.startS, zielS: S.zielS, cps: C.checkpoints.beiMeter.join('/'),
    nichtSchneiden: S.nichtSchneiden.length, schneiden: S.schneiden.length };

  // 2. Rennlogik
  ergebnis.logik = [];
  for (const [ast, us] of [[START, [5, 15, 30]], [ZIEL, [10, 80, 150]]]) {
    for (const u of us) {
      const p = ast.punkt(u, 0);
      setze(p.x, p.z, Math.atan2(p.tx, p.tz), 0, ast === ZIEL ? 'ziel' : 'bereit');
      A.rennen.endZeit = 123.45;
      A.physikSchritt(A.SCHRITT, LEER);
      const sR = A.rennen.letztesS, nz = N.abfrage(A.physik.x, A.physik.z, {}).ast;
      const zustand = A.rennen.zustand, endZeit = A.rennen.endZeit;
      A.aufStrasse();
      const r = S.abfrage(A.physik.x, A.physik.z, {});
      const sollS = ast === START ? -u : S.laenge + u;
      ergebnis.logik.push({ ende: ast.ende, u, sRennen: Math.round(sR * 10) / 10, sollS: Math.round(sollS * 10) / 10, netzAst: nz, astNr: ast.nr, zustand, endZeit,
        resetS: Math.round(r.s * 10) / 10, resetAbstand: Math.round(r.abstand * 100) / 100 });
    }
  }
  // Start: rückwärts bis zur Absperrung, dann vorwärts über die Startlinie
  {
    A.neustart();
    const meldungen = new Set();
    let t = 0, maxU = 0, lief = false;
    while (t < 12) { A.physikSchritt(A.SCHRITT, { ...LEER, bremse: 1 }); t += A.SCHRITT; if (A.rennen.zustand !== 'bereit') lief = true; const w = N.stummelAbfrage(START, A.physik.x, A.physik.z, 60, {}); if (w && w.s > maxU) maxU = w.s; const m = A.hudMeldung(); if (m) meldungen.add(m); }
    const hinten = { u: Math.round(maxU * 10) / 10, sperre: START.sperre.aussen.u };
    let tStart = null;
    t = 0;
    while (t < 20 && A.rennen.zustand === 'bereit') {
      const p = ort(Math.max(A.rennen.letztesS, 0) + 15, 0);
      A.physikSchritt(A.SCHRITT, steuer(p.x, p.z, 20, false)); t += A.SCHRITT;
      const m = A.hudMeldung(); if (m) meldungen.add(m);
    }
    if (A.rennen.zustand === 'laeuft') tStart = { s: Math.round(S.abfrage(A.physik.x, A.physik.z, {}).s * 10) / 10, zeit: A.rennen.zeit };
    ergebnis.startLauf = { lief, hinten, tStart, meldungen: [...meldungen] };
    A.neustart();
  }

  // 3. Ausrollen nach dem Ziel
  ergebnis.ausrollen = [];
  for (const kmh of [120, 150, 180]) {
    for (const gas of [1, 0]) {
      const p = S.punktBei(S.zielS - 40);
      setze(p.x, p.z, Math.atan2(p.tx, p.tz), kmh / 3.6, 'laeuft');
      A.rennen.naechsterCp = A.checkpoints.length; A.rennen.zwischenzeiten = [60, 90, 120]; A.rennen.zeit = 150;
      let t = 0, endZeit = null, sZiel = null, aufprall = null, maxS = 0, vZiel = 0;
      while (t < 40) {
        const sNow = A.rennen.letztesS;
        const pz = ort(sNow + 20, 0);
        const e = steuer(pz.x, pz.z, 99, false);
        e.gas = gas; e.bremse = 0;
        const vor = A.physik.tempo;
        A.physikSchritt(A.SCHRITT, e); t += A.SCHRITT;
        if (A.rennen.zustand === 'ziel' && endZeit === null) { endZeit = A.rennen.endZeit; sZiel = A.rennen.letztesS; vZiel = vor; }
        if (A.kollision.letzterAufprall && !aufprall) aufprall = A.kollision.letzterAufprall;
        const w = N.stummelAbfrage(ZIEL, A.physik.x, A.physik.z, 60, {});
        if (w && w.s > maxS) maxS = w.s;
        if (A.rennen.zustand === 'ziel' && A.physik.tempo < 0.05) break;
      }
      const vorSperre = ZIEL.sperre.aussen.u - maxS - C.kollision.autoLaenge / 2;
      ergebnis.ausrollen.push({ kmh, gas, vZiel: Math.round(vZiel * 3.6), zustand: A.rennen.zustand, endZeitGleich: endZeit !== null && A.rennen.endZeit === endZeit,
        weg: Math.round((S.laenge + maxS - S.zielS) * 10) / 10, vorSperre: Math.round(vorSperre * 10) / 10, aufprall: !!aufprall, durch: hinter(ZIEL), tempo: A.physik.tempo });
    }
  }
  A.neustart();

  // 4. Rückwärts am Start
  ergebnis.rueckwaerts = [];
  for (const lat of [-2.5, 0, 2.5]) {
    for (const winkel of [0, 15, -15, 35, -35]) {
      for (const lenk of [0, 1, -1]) {
        const p = S.punktBei(C.strasse.spawnBeiMeter);
        setze(p.x - p.tz * lat, p.z + p.tx * lat, Math.atan2(p.tx, p.tz) + winkel * GRAD, 0);
        let durch = false, t = 0;
        while (t < 14) { A.physikSchritt(A.SCHRITT, { ...LEER, bremse: 1, lenkung: lenk }); t += A.SCHRITT; if (hinter(START)) durch = true; }
        const w = N.stummelAbfrage(START, A.physik.x, A.physik.z, 80, {});
        // danach wie ein Spieler: vorwärts weg; geht das nicht (Nase am Band), erst ein Stück rückwärts mit Gegenlenken
        const p0 = { x: A.physik.x, z: A.physik.z };
        for (let k = 0; k < 360; k++) A.physikSchritt(A.SCHRITT, { ...LEER, gas: 1 });
        let raus = Math.hypot(A.physik.x - p0.x, A.physik.z - p0.z);
        if (raus < 3) {
          for (let k = 0; k < 240; k++) A.physikSchritt(A.SCHRITT, { ...LEER, bremse: 1, lenkung: -lenk || 1 });
          for (let k = 0; k < 360; k++) A.physikSchritt(A.SCHRITT, { ...LEER, gas: 1, lenkung: lenk || -1 });
          raus = Math.hypot(A.physik.x - p0.x, A.physik.z - p0.z);
        }
        ergebnis.rueckwaerts.push({ lat, winkel, lenk, durch, u: w ? Math.round(w.s * 10) / 10 : null, raus: Math.round(raus * 10) / 10 });
      }
    }
  }

  // 5. Vorwärts in die Absperrung der Ausrollstrecke (Zustand "bereit": keine Bremshilfe)
  ergebnis.sperreZiel = [];
  {
    const li = ZIEL.sperre.linie;
    for (const anteil of [0.2, 0.5, 0.8]) {
      const p = li[Math.round((li.length - 1) * anteil)];
      for (const kmh of [40, 70, 100]) {
        for (const winkel of [0, 20, -20, 40, -40]) {
          const w = Math.atan2(-p.nx, -p.nz) + winkel * GRAD;
          setze(p.x - Math.sin(w) * 14, p.z - Math.cos(w) * 14, w, kmh / 3.6);
          let t = 0, getroffen = -1, durch = false, vorher = 0, halt = null, rest = null;
          while (t < 6) {
            const tv = A.physik.tempo;
            A.physikSchritt(A.SCHRITT, getroffen < 0 ? { ...LEER, gas: 1 } : LEER); t += A.SCHRITT;
            if (hinter(ZIEL)) durch = true;
            if (getroffen < 0 && A.kollision.letzterAufprall) { getroffen = t; vorher = tv; }
            if (getroffen >= 0 && rest === null && t - getroffen >= 0.3) rest = A.physik.tempo;
            if (getroffen >= 0 && halt === null && A.physik.tempo < 0.5) halt = t - getroffen;
            if (getroffen >= 0 && t - getroffen > 2.5) break;
          }
          const p0 = { x: A.physik.x, z: A.physik.z };
          for (let k = 0; k < 360; k++) { A.physikSchritt(A.SCHRITT, { ...LEER, bremse: 1 }); if (hinter(ZIEL)) durch = true; }
          ergebnis.sperreZiel.push({ anteil, kmh, winkel, getroffen: getroffen >= 0, durch, halt, rest: rest === null ? 0 : Math.round((rest / Math.max(0.1, vorher)) * 100),
            zurueck: Math.round(Math.hypot(A.physik.x - p0.x, A.physik.z - p0.z) * 10) / 10 });
        }
      }
    }
  }

  // 6. Umfahren
  ergebnis.umfahren = [];
  for (const ast of [START, ZIEL]) {
    const sp = ast.sperre;
    const starts = [];
    const mListe = ast.ende === 'start' ? [-20, 0, 30, 70, 110] : [S.zielS - 40, S.laenge + 20, S.laenge + 80, S.laenge + 130];
    for (const m of mListe) for (const lat of [-3, 3, -15, 15, -32, 32]) starts.push(ort(m, lat));
    const ziele = [];
    for (const u of [5, 15, 30]) for (const lat of [-3, 0, 3]) ziele.push([ast.punkt(ast.sperreU + u, lat)]);
    for (const aussen of [2, 5, 9]) {
      for (const sd of [-1, 1]) {
        const L = sp.breite + aussen;
        ziele.push([ast.punkt(sp.aussen.u - 4, sd * L), ast.punkt(sp.aussen.u + 10, sd * L), ast.punkt(ast.sperreU + 12, 0)]);
      }
    }
    let versuche = 0, durch = 0;
    const beispiele = [];
    for (const st of starts) {
      for (const zl of ziele) {
        for (const kmh of [30, 70]) {
          for (const hb of [false, true]) {
            const z0 = zl[0];
            setze(st.x, st.z, Math.atan2(z0.x - st.x, z0.z - st.z), (kmh / 3.6) * 0.6);
            let t = 0, k = 0, rein = false;
            while (t < 14) {
              const z = zl[k];
              A.physikSchritt(A.SCHRITT, steuer(z.x, z.z, kmh / 3.6, hb)); t += A.SCHRITT;
              if (k < zl.length - 1 && Math.hypot(A.physik.x - z.x, A.physik.z - z.z) < 5) k++;
              if (hinter(ast)) { rein = true; break; }
            }
            versuche++;
            if (rein) { durch++; if (beispiele.length < 5) beispiele.push({ x: Math.round(st.x), z: Math.round(st.z), kmh, hb, ziel: zl.length }); }
          }
        }
      }
    }
    ergebnis.umfahren.push({ ende: ast.ende, versuche, durch, beispiele });
  }

  // 7. Kein Hängenbleiben: Hindernisse des Aufbaus anfahren
  const alle = [...A.pflanzen.hindernisse, ...A.strassenrand.hindernisse, ...A.kuehe.hindernisse];
  const K = C.kollision;
  function eindringen() {
    const p = A.physik, kl = K.autoLaenge / 2 - K.eckRadius, kb = K.autoBreite / 2 - K.eckRadius;
    let tief = 0;
    for (const h of alle) {
      const dx = h.x - p.x, dz = h.z - p.z;
      if (dx * dx + dz * dz > 36) continue;
      const v = dx * Math.sin(p.richtung) + dz * Math.cos(p.richtung), s = dx * Math.cos(p.richtung) - dz * Math.sin(p.richtung);
      const ev = Math.abs(v) - kl, es = Math.abs(s) - kb;
      const d = ev > 0 || es > 0 ? Math.hypot(Math.max(ev, 0), Math.max(es, 0)) : Math.max(ev, es);
      tief = Math.max(tief, h.r + K.eckRadius - d);
    }
    return tief;
  }
  ergebnis.anfahrten = [];
  const arten = ['bogen', 'zuschauer', 'stroh', 'band', 'zelt', 'container', 'auto', 'bande', 'uhr', 'fahne'];
  for (const art of arten) {
    const liste = SZ.hindernisse.filter((h) => h.rand === art);
    // ein paar verteilt über die Liste
    const proben = [];
    const n = art === 'zuschauer' || art === 'stroh' || art === 'band' ? 8 : 4;
    for (let k = 0; k < n && liste.length; k++) proben.push(liste[Math.floor(((k + 0.5) / n) * liste.length)]);
    for (const h of proben) {
      for (const von of ['strasse', 'wiese']) {
        const w0 = N.abfrage(h.x, h.z, {});
        // Richtung von der nächsten Strasse zum Hindernis (von der Wiese her: umgekehrt)
        const pS = { x: h.x - Math.sign(w0.seite || 1) * -w0.tz * Math.abs(w0.seite), z: h.z - Math.sign(w0.seite || 1) * w0.tx * Math.abs(w0.seite) };
        let fx = h.x - pS.x, fz = h.z - pS.z;
        const fl = Math.hypot(fx, fz) || 1; fx /= fl; fz /= fl;
        if (von === 'wiese') { fx = -fx; fz = -fz; }
        const dist = 10;
        const x0 = h.x - fx * (dist + h.r + 2.2), z0 = h.z - fz * (dist + h.r + 2.2);
        // Weg frei bis zum ersten Hindernis? Gemessen wird, was zuerst getroffen wird (z. B. Band vor dem Zuschauer)
        let frei0 = true;
        for (const o of alle) if (Math.hypot(o.x - x0, o.z - z0) < o.r + 2.4) frei0 = false;
        if (!frei0) continue;
        setze(x0, z0, Math.atan2(fx, fz), 45 / 3.6);
        let t = 0, getroffen = -1, maxTief = 0, rest = null, vorher = 0;
        while (t < 4) {
          const tv = A.physik.tempo;
          A.physikSchritt(A.SCHRITT, getroffen < 0 ? { ...LEER, gas: 0.4 } : LEER); t += A.SCHRITT;
          if (getroffen < 0 && A.kollision.letzterAufprall) { getroffen = t; vorher = tv; }
          if (getroffen >= 0) { maxTief = Math.max(maxTief, eindringen()); if (rest === null && t - getroffen >= 0.4) rest = A.physik.tempo; if (t - getroffen > 1) break; }
        }
        if (getroffen < 0) continue;
        const p0 = { x: A.physik.x, z: A.physik.z };
        for (let k = 0; k < 360; k++) A.physikSchritt(A.SCHRITT, { ...LEER, bremse: 1 });
        const raus = Math.hypot(A.physik.x - p0.x, A.physik.z - p0.z);
        ergebnis.anfahrten.push({ art, von, getroffenArt: A.kollision.letzterAufprall ? 'ja' : 'nein', tief: Math.round(maxTief * 100) / 100,
          rest: Math.round(((rest ?? 0) / Math.max(0.1, vorher)) * 100), raus: Math.round(raus * 10) / 10 });
      }
    }
  }

  // 8. Regeln
  const ZF = C.startZiel.zuschauer;
  let minStrasse = Infinity, maxBlick = 0;
  for (const z of SZ.zuschauer) {
    const w = N.abfrage(z.x, z.z, {});
    minStrasse = Math.min(minStrasse, w.abstand);
    const zx = -(-w.tz) * Math.sign(w.seite), zz = -(w.tx) * Math.sign(w.seite); // zur Strasse
    const d = Math.abs(wn(z.blick - Math.atan2(zx, zz)));
    maxBlick = Math.max(maxBlick, d / GRAD);
  }
  // nichts auf Fahrbahn und Bankett (Kollisionskreise), ausser auf der Verlängerung hinter der Absperrung
  let minKreis = Infinity;
  for (const h of SZ.hindernisse) {
    const w = N.abfrage(h.x, h.z, {});
    const ende = N.enden.find((a) => a.nr === w.ast);
    if (ende && w.s > ende.sperreU) continue;
    minKreis = Math.min(minKreis, w.abstand - h.r);
  }
  // Geometrie über der Fahrbahn: tiefster Punkt über Asphalt+Bankett (Banner, Träger)
  let tiefUeber = Infinity, aufFahrbahn = 0;
  for (const m of SZ.meshes.filter((m) => m.name.startsWith('startziel'))) {
    const pos = m.geometry.attributes.position.array;
    for (let i = 0; i < pos.length; i += 3) {
      const w = N.abfrage(pos[i], pos[i + 2], {});
      const ende = N.enden.find((a) => a.nr === w.ast);
      if (ende && w.s > ende.sperreU - 0.5) continue;
      if (w.abstand > N.halbAsphalt + N.bankett) continue;
      const h = pos[i + 1] - w.h;
      if (h > 0.5) tiefUeber = Math.min(tiefUeber, h); else aufFahrbahn++;
    }
  }
  // Boden auf den Verlängerungen und an den Übergängen
  const boden = {};
  for (const ast of [START, ZIEL]) {
    let falsch = 0, n = 0;
    for (let u = 0; u <= ast.laenge; u += 0.5) {
      for (const lat of [-3, 0, 3]) { const p = ast.punkt(u, lat); n++; if (A.welt.bodenBei(p.x, p.z).art !== 'asphalt') falsch++; }
    }
    for (let d = -1.5; d <= 1.5; d += 0.1) {
      const m = ast === START ? d : S.laenge + d;
      for (const lat of [-3, 0, 3]) { const p = ort(m, lat); n++; if (A.welt.bodenBei(p.x, p.z).art !== 'asphalt') falsch++; }
    }
    boden[ast.ende] = { n, falsch };
  }
  // gleicher seed = gleicher Aufbau (zweimal aufbauen, ohne die eigenen Hindernisse)
  const eigene = new Set(SZ.hindernisse);
  const rand2 = { ...A.strassenrand, hindernisse: A.strassenrand.hindernisse.filter((h) => !eigene.has(h)) };
  const baeume = new Set([...SZ.tannen, ...SZ.laub]);
  const pfl2 = { ...A.pflanzen, tannen: A.pflanzen.tannen.filter((b) => !baeume.has(b)), laubbaeume: A.pflanzen.laubbaeume.filter((b) => !baeume.has(b)),
    hindernisse: A.pflanzen.hindernisse.filter((h) => !SZ.hindernisseBaeume.includes(h)) };
  const zweit = baueStartZiel(new A.THREE.Scene(), S, A.welt, { pflanzen: pfl2, rand: rand2, kuehe: A.kuehe });
  const gleich = zweit.zuschauer.length === SZ.zuschauer.length && zweit.zuschauer.every((z, i) => z.x === SZ.zuschauer[i].x && z.z === SZ.zuschauer[i].z && z.pose === SZ.zuschauer[i].pose)
    && zweit.tannen.length === SZ.tannen.length && zweit.hindernisse.length === SZ.hindernisse.length;
  ergebnis.regeln = {
    zuschauer: SZ.zuschauer.length, start: SZ.statistik.start, ziel: SZ.statistik.ziel, minStrasse: Math.round(minStrasse * 100) / 100, abstandSoll: ZF.abstand[0],
    maxBlick: Math.round(maxBlick), minKreis: Math.round(minKreis * 100) / 100, tiefUeber: Math.round(tiefUeber * 100) / 100, aufFahrbahn, boden, gleich,
    posen: Object.fromEntries(['stehend', 'winkend', 'jubelnd', 'fahneKreuz', 'fotograf', 'muetze', 'fahne'].map((n, i) => [n, SZ.zuschauer.filter((z) => z.pose === i).length])),
  };

  // 9. Sichtlinien
  ergebnis.sicht = sicht.pruefeSichtEnden(A).map((e) => ({ ende: e.ende, strahlen: e.strahlen, sichtbar: e.sichtbar, posten: e.posten }));
  A.neustart();
  return ergebnis;
});

let fehler = 0;
const melde = (ok, text) => { console.log(`${ok ? 'OK    ' : 'FEHLER'} ${text}`); if (!ok) fehler++; };
const details = process.argv.includes('--details');

console.log('1. Etappe');
const E = erg.etappe;
melde(Math.abs(E.laenge - 3667.5869) < 0.001 && E.startS === 25 && Math.abs(E.zielS - (E.laenge - 45)) < 1e-6 && E.cps === '900/1870/2880',
  `Länge ${E.laenge.toFixed(4)} m, Startlinie ${E.startS} m, Ziellinie ${E.zielS.toFixed(3)} m, Checkpoints ${E.cps}, gesperrte Kurven ${E.nichtSchneiden}, freie Kurven ${E.schneiden}`);

console.log('2. Rennlogik');
for (const l of erg.logik) {
  melde(Math.abs(l.sRennen - l.sollS) < 0.6 && l.netzAst === l.astNr && l.resetAbstand < 0.3 && l.resetS >= 1.9 && l.resetS <= E.laenge - 1 && (l.ende === 'start' ? l.zustand === 'bereit' : l.zustand === 'ziel' && l.endZeit === 123.45),
    `${l.ende}-Verlängerung ${l.u} m: Rennen-s ${l.sRennen} (Etappe ${l.sollS}), Zustand ${l.zustand}${l.ende === 'ziel' ? `, Endzeit bleibt ${l.endZeit}` : ''}, Netz: Ast ${l.netzAst}; "R" -> Etappe bei ${l.resetS} m (Abstand ${l.resetAbstand} m)`);
}
{
  const s = erg.startLauf;
  melde(!s.lief && s.tStart && s.tStart.s >= 25 && s.tStart.s < 26.5 && !s.meldungen.length && s.hinten.u <= s.hinten.sperre,
    `Start rückwärts bis ${s.hinten.u} m hinter den Strassenanfang (Absperrung bei ${s.hinten.sperre} m), Zeit läuft nicht; vorwärts: Zeit startet bei ${s.tStart ? s.tStart.s : '-'} m; Meldungen: ${s.meldungen.join(', ') || 'keine'}`);
}

console.log('3. Ausrollen nach dem Ziel (Bremshilfe startZiel.zielBremse)');
for (const a of erg.ausrollen) {
  melde(a.zustand === 'ziel' && a.endZeitGleich && !a.aufprall && !a.durch && a.vorSperre > 0 && a.tempo < 0.1,
    `${a.kmh} km/h, ${a.gas ? 'Gas gedrückt' : 'ohne Gas'} (im Ziel ${a.vZiel} km/h): steht nach ${a.weg} m hinter der Ziellinie, ${a.vorSperre} m vor der Absperrung, Aufprall: ${a.aufprall ? 'JA' : 'nein'}, Endzeit bleibt: ${a.endZeitGleich ? 'ja' : 'NEIN'}`);
}

console.log('4. Rückwärts am Start');
{
  const r = erg.rueckwaerts, durch = r.filter((x) => x.durch).length, stecken = r.filter((x) => x.raus < 3).length;
  if (details) for (const x of r) console.log('   ', JSON.stringify(x));
  melde(!durch && !stecken, `${r.length} Versuche (3 Spuren, 0°/±15°/±35°, Lenkung links/gerade/rechts, 14 s voll rückwärts): hinter die Absperrung ${durch}, ` +
    `am weitesten bis ${Math.max(...r.map((x) => x.u ?? 0))} m (Absperrung bei ${erg.startLauf.hinten.sperre} m), danach wieder weg (vorwärts, sonst kurz rückwärts und gegenlenken): ${r.length - stecken} (mind. ${Math.min(...r.map((x) => x.raus))} m)`);
}

console.log('5. Vorwärts in die Absperrung der Ausrollstrecke (ohne Bremshilfe)');
{
  const l = erg.sperreZiel, durch = l.filter((a) => a.durch).length, nicht = l.filter((a) => !a.getroffen).length;
  const frontal = l.filter((a) => a.winkel === 0), stecken = l.filter((a) => a.zurueck < 2).length;
  if (details) for (const a of l) console.log('   ', JSON.stringify(a));
  melde(!durch && !nicht && !stecken && frontal.every((a) => a.halt !== null && a.halt <= 0.3) && l.every((a) => a.halt !== null || a.rest <= 35),
    `${l.length} Anfahrten (3 Stellen, 40/70/100 km/h, 0°/±20°/±40°): durch ${durch}, getroffen ${l.length - nicht}, frontal Stillstand nach höchstens ` +
    `${Math.max(...frontal.map((a) => a.halt ?? 9)).toFixed(2)} s, schräg nach 0.3 s höchstens ${Math.max(...l.map((a) => a.rest))} % Tempo, rückwärts raus ${l.length - stecken} (mind. ${Math.min(...l.map((a) => a.zurueck))} m)`);
}

console.log('6. Umfahren');
for (const u of erg.umfahren) {
  melde(u.durch === 0, `${u.ende}: ${u.versuche} Versuche (Strasse und Wiese, hinter die Absperrung und um beide Enden herum, 30/70 km/h, mit/ohne Handbremse): ${u.durch} kamen hinter die Absperrung` +
    (u.beispiele.length ? ` z. B. ${JSON.stringify(u.beispiele)}` : ''));
}

console.log('7. Kein Hängenbleiben (45 km/h hinein, dann rückwärts)');
{
  const l = erg.anfahrten;
  const arten = [...new Set(l.map((a) => a.art))];
  for (const art of arten) {
    const a = l.filter((x) => x.art === art);
    if (details) for (const x of a) console.log('   ', JSON.stringify(x));
    const tief = Math.max(...a.map((x) => x.tief)), rest = Math.max(...a.map((x) => x.rest)), raus = Math.min(...a.map((x) => x.raus));
    melde(tief <= 0.1 && raus >= 1.5, `${art.padEnd(9)}: ${a.length} Anfahrten (Strasse/Wiese): steckt höchstens ${tief} m drin, nach 0.4 s höchstens ${rest} % Tempo, rückwärts raus mind. ${raus} m`);
  }
}

console.log('8. Regeln');
{
  const r = erg.regeln;
  melde(r.zuschauer >= 60 && r.zuschauer <= 100, `${r.zuschauer} Zuschauer (Start ${r.start}, Ziel ${r.ziel}), Posen ${JSON.stringify(r.posen)}`);
  melde(r.minStrasse >= 6 && r.minStrasse >= r.abstandSoll - 0.01, `Zuschauer mindestens ${r.minStrasse} m neben jeder Strassenmitte (verlangt ca. 6 m, eingestellt ${r.abstandSoll} m)`);
  melde(r.maxBlick <= 90, `Zuschauer schauen zur Strasse (höchstens ${r.maxBlick}° daneben)`);
  melde(r.minKreis >= 5.5 - 0.01, `Hindernisse nicht auf Fahrbahn und Bankett: nächster Kollisionskreis ${r.minKreis} m neben der Mitte (Bankett endet bei 5.5 m)`);
  melde(r.aufFahrbahn === 0 && r.tiefUeber >= 4, `über Fahrbahn und Bankett: tiefster Teil (Banner) ${r.tiefUeber} m hoch, ${r.aufFahrbahn} Punkte auf Fahrbahn/Bankett`);
  for (const [ende, b] of Object.entries(r.boden)) melde(b.falsch === 0, `Boden auf der ${ende}-Verlängerung und am Übergang: ${b.n - b.falsch} von ${b.n} Proben Asphalt`);
  melde(r.gleich, 'gleicher seed = gleicher Aufbau (zweimal aufgebaut)');
}
console.log('9. Sichtlinien');
for (const s of erg.sicht) melde(s.sichtbar === 0, `${s.ende}: ${s.posten} Fahrpositionen, ${s.strahlen} Strahlen, ${s.sichtbar} sehen das Ende`);
melde(!spiel.fehler.length, `Keine Fehler in der Browser-Konsole (${spiel.fehler.length})`);
console.log(`Dauer ${Math.round((Date.now() - t0) / 1000)} s`);
await spiel.schliessen();
process.exit(fehler ? 1 : 0);
