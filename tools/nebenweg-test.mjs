// Test für den Nebenweg (Meilenstein 3a):  node tools/nebenweg-test.mjs
//
// Im Headless-Browser mit dem echten Spiel (Fahrphysik, Gelände, alle Hindernisse):
//   1. Die Etappenlogik sieht die Stummel nicht: Fortschritt (s), Checkpoints und Zurücksetzen
//      arbeiten in der Nähe der Stummel nur mit der Etappe (Auto bei der Absperrung hat das s
//      der Etappe, "R" setzt auf die Etappe zurück, in den Stummel hinein und wieder heraus
//      kostet keinen Checkpoint).
//   2. Jede Absperrart (Band, Reifen, Heu, Holzbock): Auto fährt mit 40-100 km/h aus mehreren
//      Winkeln hinein, kommt hart zum Halt (nie hindurch), kommt rückwärts wieder heraus.
//   3. Umfahren unmöglich: aus einem Fächer von Startpunkten, Zielen (auch seitlich um die
//      Absperrung herum), Geschwindigkeiten, mit und ohne Handbremse kommt das Auto nie über die
//      Absperrlinie auf den Stummel.
//   4. Sichtlinien-Check (tools/stummel-sicht.js): von der Etappe aus sieht man kein Stummel-Ende.
//   5. Keine Fehler in der Browser-Konsole.
// Das Spiel selbst lädt diese Datei nicht.

import { starteSpiel } from './spiel-browser.mjs';

const spiel = await starteSpiel();
await spiel.ladeSpiel();
const t0 = Date.now();

const erg = await spiel.page.evaluate(async () => {
  const A = window.__alpineRally, S = A.strecke, N = A.netz, C = A.CONFIG;
  const { baueAbsperrungen } = await import('/js/absperrungen.js');
  const { baueKollision } = await import('/js/kollision.js');
  const sicht = await import('/tools/stummel-sicht.js');
  const GRAD = Math.PI / 180;
  const LEER = { gas: 0, bremse: 0, lenkung: 0, handbremse: false, reset: false, debug: false };
  const q = {}, qa = {};
  const wn = (w) => Math.atan2(Math.sin(w), Math.cos(w));
  const astPunkt = (ast, u, lat) => {
    const i = Math.max(0, Math.min(ast.anzahl - 1, Math.round(u)));
    return { x: ast.px[i] - ast.tz[i] * lat, z: ast.pz[i] + ast.tx[i] * lat, tx: ast.tx[i], tz: ast.tz[i] };
  };
  // Steht das Auto auf dem Stummel hinter der Absperrung? (Mitte über der Absperrlinie, auf Asphalt/Bankett)
  const imStummel = (ast) => {
    const w = N.stummelAbfrage(ast, A.physik.x, A.physik.z, 30, qa);
    return !!w && w.s > ast.sperreU + 0.3 && Math.abs(w.seite) < ast.halb + C.strasse.bankett;
  };
  // Auto an (x, z) mit Richtung w und Tempo v (m/s) setzen
  function setze(x, z, w, v) {
    A.setzeAuf(S.abfrage(x, z, q).s);
    A.physik.reset(x, z, w);
    A.physik.vx = Math.sin(w) * v; A.physik.vz = Math.cos(w) * v; A.physik.vVor = v;
    A.getriebe.reset();
    A.rennen.zustand = 'bereit';
  }
  // Lenken auf einen Punkt (wie der Testfahrer)
  function steuer(zx, zz, vSoll, handbremse) {
    const p = A.physik;
    const fehler = wn(Math.atan2(zx - p.x, zz - p.z) - p.richtung);
    const e = { ...LEER, lenkung: Math.max(-1, Math.min(1, -fehler * 2.5)) };
    if (p.tempo < vSoll) e.gas = 1; else e.bremse = 0.3;
    if (handbremse && Math.abs(fehler) > 0.5 && p.tempo > 8) { e.handbremse = true; e.gas = 0.4; }
    return e;
  }
  const ergebnis = { etappe: [], aufprall: [], umfahren: [], sicht: null };

  // =====================================================================
  // 1. Etappenlogik
  // =====================================================================
  for (const ast of N.aeste) {
    const vor = astPunkt(ast, ast.sperreU - 4, 0);
    // Auto steht 4 m vor der Absperrung: welche Meter zählen?
    setze(vor.x, vor.z, Math.atan2(vor.tx, vor.tz), 0);
    A.physikSchritt(A.SCHRITT, LEER);
    const sRennen = A.rennen.letztesS;
    const qs = S.abfrage(A.physik.x, A.physik.z, {});
    const sNetz = N.abfrage(A.physik.x, A.physik.z, {});
    // R (zurück auf die Strasse, wie die Taste im Spiel): landet auf der Etappe, nicht auf dem Stummel
    A.aufStrasse();
    const nachReset = S.abfrage(A.physik.x, A.physik.z, {});
    ergebnis.etappe.push({
      stummel: ast.nr, sJ: ast.sJ, sperreU: Math.round(ast.sperreU * 10) / 10,
      sEtappe: Math.round(qs.s * 10) / 10, sRennen: Math.round(sRennen * 10) / 10, netzAst: sNetz.ast,
      ok1: Math.abs(qs.s - sRennen) < 0.5 && Math.abs(qs.s - ast.sJ) < ast.sperreU + 10 && sNetz.ast === ast.nr,
      resetAbstand: Math.round(nachReset.abstand * 100) / 100, ok2: nachReset.abstand < 0.3,
    });
  }
  // Rennen läuft: vor dem Abzweig in den Stummel bis zur Absperrung, zurück, dann über den
  // Nebenweg durch CP1. Kein "CHECKPOINT VERPASST", CP1 zählt.
  {
    const ast = N.aeste[0];
    A.neustart();
    const p0 = S.punktBei(ast.sJ - 60);
    setze(p0.x, p0.z, Math.atan2(p0.tx, p0.tz), 15);
    A.rennen.zustand = 'laeuft'; A.rennen.zeit = 0; A.rennen.naechsterCp = 0; A.rennen.letztesS = ast.sJ - 60;
    A.kollision.letzterAufprall = null;
    const meldungen = new Set();
    let t = 0, phase = 0, maxS = 0;
    const ziel = astPunkt(ast, ast.sperreU - 3, 0);
    while (t < 60 && phase < 3) {
      let e;
      if (phase === 0) { e = steuer(ziel.x, ziel.z, 12, false); if (Math.hypot(A.physik.x - ziel.x, A.physik.z - ziel.z) < 4 || A.kollision.letzterAufprall) { phase = 1; t = Math.max(t, 0); } }
      else if (phase === 1) { e = { ...LEER, bremse: 1 }; if (Math.hypot(A.physik.x - ast.px[0], A.physik.z - ast.pz[0]) < 4) phase = 2; }
      else {
        const pZ = S.punktBei(Math.min(S.laenge - 1, Math.max(A.rennen.letztesS, ast.sJ) + 12));
        e = steuer(pZ.x, pZ.z, 12, false);
        if (A.rennen.letztesS > C.checkpoints.beiMeter[0] + 10) phase = 3;
      }
      A.physikSchritt(A.SCHRITT, e);
      t += A.SCHRITT;
      maxS = Math.max(maxS, A.rennen.letztesS);
      const m = A.hudMeldung();
      if (m) meldungen.add(m);
    }
    ergebnis.cpTest = { meldungen: [...meldungen], naechsterCp: A.rennen.naechsterCp, zustand: A.rennen.zustand, phase, zeit: Math.round(t * 10) / 10,
      ok: A.rennen.naechsterCp === 1 && ![...meldungen].some((m) => m.includes('VERPASST')) && phase === 3 };
    A.neustart();
  }

  // =====================================================================
  // 2. Jede Absperrart: hineinfahren, Halt, rückwärts raus
  // =====================================================================
  const basisHindernisse = [...A.pflanzen.hindernisse, ...A.strassenrand.hindernisse.filter((h) => h.rand !== 'absperrung'), ...A.kuehe.hindernisse];
  const originalLoese = A.kollision.loese;
  for (const art of ['band', 'reifen', 'heu', 'zaun']) {
    for (const ast of N.aeste) {
      const alt = ast.sperreArt;
      ast.sperreArt = art;
      const b = baueAbsperrungen(A.szene, { ...A.welt, netz: { ...N, aeste: [ast] } });
      ast.sperreArt = alt;
      A.szene.remove(b.mesh);
      // Kollision: alles ausser den Absperrungen, dazu nur diese
      const andere = A.absperrungen.hindernisse.filter((h) => Math.hypot(h.x - b.hindernisse[0].x, h.z - b.hindernisse[0].z) > 30);
      const kol = baueKollision([...basisHindernisse, ...andere, ...b.hindernisse]);
      A.kollision.loese = (...a) => { const r = kol.loese(...a); if (kol.letzterAufprall) A.kollision.letzterAufprall = kol.letzterAufprall; return r; };
      for (const kmh of [40, 70, 100]) {
        for (const winkel of [0, 20, -20, 40, -40]) {
          for (const zielLat of [-3.5, 0, 3.5]) {
            // Start auf dem Stummel (höchstens 2.5 m neben der Mitte), bis 20 m vor der Absperrung,
            // Richtung auf (zielLat) an der Absperrung, schräg um "winkel"
            const ziel = astPunkt(ast, ast.sperreU, zielLat);
            const w = Math.atan2(ziel.tx, ziel.tz) + winkel * GRAD;
            let dist = 20;
            for (; dist > 4; dist -= 0.5) {
              const x = ziel.x - Math.sin(w) * dist, z = ziel.z - Math.cos(w) * dist;
              const w0 = N.stummelAbfrage(ast, x, z, 60, {});
              if (w0 && Math.abs(w0.seite) <= 2.5) break;
            }
            const x0 = ziel.x - Math.sin(w) * dist, z0 = ziel.z - Math.cos(w) * dist;
            setze(x0, z0, w, kmh / 3.6);
            kol.letzterAufprall = null;
            let t = 0, getroffen = -1, durch = false, vorher = 0, haltNach = null, maxTempoNach = 0, tempo03 = null, artTreffer = null;
            while (t < 6) {
              const e = getroffen < 0 ? { ...LEER, gas: 1, lenkung: 0 } : LEER;
              const tv = A.physik.tempo;
              A.physikSchritt(A.SCHRITT, e);
              t += A.SCHRITT;
              if (imStummel(ast)) durch = true;
              if (getroffen < 0 && kol.letzterAufprall) {
                getroffen = t; vorher = tv;
                // was wurde getroffen? (nächstes Hindernis)
                let best = Infinity;
                for (const h of b.hindernisse) best = Math.min(best, Math.hypot(h.x - A.physik.x, h.z - A.physik.z));
                artTreffer = best < 3.5 ? 'absperrung' : 'anderes';
              }
              if (getroffen >= 0 && tempo03 === null && t - getroffen >= 0.3) tempo03 = A.physik.tempo;
              if (getroffen >= 0) {
                maxTempoNach = Math.max(maxTempoNach, t - getroffen > 0.05 ? A.physik.tempo : 0);
                if (haltNach === null && A.physik.tempo < 0.5) haltNach = t - getroffen;
                if (t - getroffen > 2.5) break;
              }
            }
            // rückwärts raus
            const p0 = { x: A.physik.x, z: A.physik.z };
            const wStart = N.stummelAbfrage(ast, p0.x, p0.z, 60, {});
            for (let k = 0; k < 360; k++) { A.physikSchritt(A.SCHRITT, { ...LEER, bremse: 1 }); if (imStummel(ast)) durch = true; }
            const wEnde = N.stummelAbfrage(ast, A.physik.x, A.physik.z, 60, {});
            const zurueck = wStart && wEnde ? wStart.s - wEnde.s : Math.hypot(A.physik.x - p0.x, A.physik.z - p0.z);
            ergebnis.aufprall.push({
              art, stummel: ast.nr, kmh, winkel, zielLat, getroffen: getroffen >= 0, durch,
              vorher: Math.round(vorher * 3.6), haltNach: haltNach === null ? null : Math.round(haltNach * 100) / 100,
              treffer: artTreffer, rest: tempo03 === null ? 0 : Math.round((tempo03 / Math.max(0.1, vorher)) * 100),
              zurueck: Math.round(zurueck * 10) / 10,
            });
          }
        }
      }
    }
  }
  A.kollision.loese = originalLoese;

  // =====================================================================
  // 3. Umfahren: Fächer aus Startpunkten, Zielen, Tempo, Handbremse
  // =====================================================================
  for (const ast of N.aeste) {
    const starts = [];
    for (const ds of [-60, -30, -12, 15, 35, 60]) {
      for (const lat of [-3, 3]) {
        // Start auf der Etappe (Hauptstrasse oder Nebenweg), Richtung zur Kreuzung
        const s = ast.sJ + ds;
        const p = S.punktBei(s);
        starts.push({ x: p.x - p.tz * lat, z: p.z + p.tx * lat, s });
      }
    }
    // Ziele: auf dem Stummel hinter der Absperrung, und Umwege links/rechts an ihr vorbei
    const zielListen = [];
    for (const u of [4, 14, 30]) for (const lat of [-4, 0, 4]) zielListen.push([astPunkt(ast, ast.sperreU + u, lat)]);
    for (const sd of [-1, 1]) {
      for (const aussen of [8, 12, 18]) {
        zielListen.push([astPunkt(ast, ast.sperreU - 4, sd * aussen), astPunkt(ast, ast.sperreU + 6, sd * aussen), astPunkt(ast, ast.sperreU + 14, 0)]);
      }
    }
    let versuche = 0, durch = 0, naechstes = Infinity;
    const durchListe = [];
    for (const st of starts) {
      for (const ziele of zielListen) {
        for (const kmh of [30, 70, 110]) {
          for (const hb of [false, true]) {
            const z0 = ziele[0];
            const w = Math.atan2(z0.x - st.x, z0.z - st.z);
            setze(st.x, st.z, w, kmh / 3.6 * 0.6);
            let t = 0, k = 0, rein = false;
            while (t < 14) {
              const z = ziele[k];
              A.physikSchritt(A.SCHRITT, steuer(z.x, z.z, kmh / 3.6, hb));
              t += A.SCHRITT;
              if (k < ziele.length - 1 && Math.hypot(A.physik.x - z.x, A.physik.z - z.z) < 5) k++;
              // wenn hängen geblieben: rückwärts und nochmal (ein paar Mal)
              if (imStummel(ast)) { rein = true; break; }
              const w2 = N.stummelAbfrage(ast, A.physik.x, A.physik.z, 60, qa);
              if (w2 && Math.abs(w2.seite) < 6) naechstes = Math.min(naechstes, ast.sperreU - w2.s);
            }
            versuche++;
            if (rein) { durch++; durchListe.push({ s: st.s, ziel: ziele.length, kmh, hb }); }
          }
        }
      }
    }
    ergebnis.umfahren.push({ stummel: ast.nr, art: ast.sperreArt, versuche, durch, beispiele: durchListe.slice(0, 5) });
  }

  // =====================================================================
  // 4. Sichtlinien
  // =====================================================================
  ergebnis.sicht = sicht.pruefeSicht(A).map((e) => ({ stummel: e.stummel, strahlen: e.strahlen, sichtbar: e.sichtbar }));
  A.neustart();
  return ergebnis;
});

let fehler = 0;
const melde = (ok, text) => { console.log(`${ok ? 'OK    ' : 'FEHLER'} ${text}`); if (!ok) fehler++; };
console.log('1. Etappenlogik');
for (const e of erg.etappe) {
  melde(e.ok1, `Stummel ${e.stummel}: Auto 4 m vor der Absperrung (Stummel-Meter ${Math.round((e.sperreU - 4) * 10) / 10}) hat Etappen-s ${e.sEtappe} (Rennen ${e.sRennen}, Kreuzung bei ${e.sJ}), Netz erkennt Stummel ${e.netzAst}`);
  melde(e.ok2, `Stummel ${e.stummel}: "R" setzt auf die Etappe zurück (Abstand zur Mitte ${e.resetAbstand} m)`);
}
melde(erg.cpTest.ok, `In den Stummel bis zur Absperrung und zurück, dann über den Nebenweg: CP1 erreicht (nächster CP ${erg.cpTest.naechsterCp + 1}), Meldungen: ${erg.cpTest.meldungen.join(', ') || 'keine'}`);

console.log('2. Absperrungen (hineinfahren, Halt, rückwärts raus)');
for (const art of ['band', 'reifen', 'heu', 'zaun']) {
  const l = erg.aufprall.filter((a) => a.art === art);
  const durch = l.filter((a) => a.durch).length, daneben = l.filter((a) => a.treffer !== 'absperrung').length;
  // Halt: steht nach spätestens 2.5 s, oder (schräg) hat nach 0.3 s höchstens noch 35 % Tempo und gleitet an der Absperrung entlang
  const hart = l.filter((a) => a.haltNach !== null || a.rest <= 35);
  const stecken = l.filter((a) => a.zurueck < 2).length;
  const frontal = l.filter((a) => a.winkel === 0);
  if (process.argv.includes('--details')) for (const a of l.filter((a) => a.durch || a.treffer !== 'absperrung' || !(a.haltNach !== null || a.rest <= 35) || a.zurueck < 2)) console.log('   ', JSON.stringify(a));
  melde(!durch && !daneben && hart.length === l.length && !stecken,
    `${art.padEnd(6)}: ${l.length} Anfahrten (40/70/100 km/h, 0°/±20°/±40°): durch ${durch}, Absperrung getroffen ${l.length - daneben}, ` +
    `frontal Stillstand nach höchstens ${Math.max(...frontal.map((a) => a.haltNach ?? 9)).toFixed(2)} s, schräg nach 0.3 s höchstens ${Math.max(...l.map((a) => a.rest))} % Tempo, ` +
    `rückwärts raus ${l.length - stecken} (mind. ${Math.min(...l.map((a) => a.zurueck))} m)`);
}
console.log('3. Umfahren');
for (const u of erg.umfahren) {
  melde(u.durch === 0, `Stummel ${u.stummel} (${u.art}): ${u.versuche} Versuche (Start auf Hauptstrasse und Nebenweg, Ziele hinter und seitlich um die Absperrung, 30/70/110 km/h, mit/ohne Handbremse): ${u.durch} kamen auf den Stummel` +
    (u.beispiele.length ? ` z. B. ${JSON.stringify(u.beispiele)}` : ''));
}
console.log('4. Sichtlinien');
for (const s of erg.sicht) melde(s.sichtbar === 0, `Stummel ${s.stummel}: ${s.strahlen} Strahlen, ${s.sichtbar} sehen das Ende`);
melde(!spiel.fehler.length, `Keine Fehler in der Browser-Konsole (${spiel.fehler.length})`);
console.log(`Dauer ${Math.round((Date.now() - t0) / 1000)} s`);
await spiel.schliessen();
process.exit(fehler ? 1 : 0);
