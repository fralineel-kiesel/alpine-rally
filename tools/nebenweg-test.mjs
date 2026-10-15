// Test für die Nebenwege (Meilenstein 3a, erweitert in M3a.1, seit M3b für alle Nebenwege):
//   node tools/nebenweg-test.mjs [--details]
//
// Im Headless-Browser mit dem echten Spiel (Fahrphysik, Gelände, alle Hindernisse):
//   1. Die Etappenlogik sieht die Stummel nicht: Fortschritt (s), Checkpoints und Zurücksetzen
//      arbeiten in der Nähe der Stummel nur mit der Etappe (Auto vor der Absperrung hat das s
//      der Etappe, "R" setzt auf die Etappe zurück, in den Stummel hinein und wieder heraus
//      kostet keinen Checkpoint).
//   2. Jede Absperrart (Band, Reifen, Heu, Holzbock) als gebogene Leitwand: Auto fährt mit 40-100 km/h
//      an mehreren Stellen und aus mehreren Winkeln hinein, kommt nie hindurch, frontal hart zum Halt,
//      schräg gleitet es an der Leitwand entlang (wie an einem Zaun), rückwärts kommt es wieder heraus.
//   3. Umfahren unmöglich: aus einem Fächer von Startpunkten, Zielen (auch um beide Enden der
//      Leitwand herum), Geschwindigkeiten, mit und ohne Handbremse kommt das Auto nie hinter die
//      Absperrung auf den Stummel.
//   4. Sichtlinien-Check (tools/stummel-sicht.js): von der Etappe aus sieht man kein Stummel-Ende.
//   5. (M3a.1) Leitwand lässt die Fahrbahn frei: kein Teil näher an der Etappe als Weg + Bankett,
//      Verbots-Symbol und Richtungstafel stehen.
//   6. (M3a.1) Höhenprofil je Nebenweg (30 m vor dem Abzweig bis 60 m nach der Einmündung) in
//      0.5-m-Schritten (Mitte und 2.5 m daneben): grösste Stufe und grösste Steigungsänderung,
//      verglichen mit der Strecke ohne Nebenwege.
//   7. (M3a.1) Fahrtest über Abzweig und Einmündung jedes Nebenwegs: senkrechte Beschleunigung und
//      Nicken des Autos nicht stärker als auf der übrigen Strecke (kein Hupfer).
//   8. (M3a.1) Staub bei normaler Fahrt auf jedem Belag (Schotter, Wiesenweg): beide Hinterräder gleich viel.
//   9. Keine Fehler in der Browser-Konsole.
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
  const fahrer = await import('/tools/testfahrer-browser.js');
  const GRAD = Math.PI / 180;
  const LEER = { gas: 0, bremse: 0, lenkung: 0, handbremse: false, reset: false, debug: false };
  const q = {}, qa = {};
  const wn = (w) => Math.atan2(Math.sin(w), Math.cos(w));
  const astPunkt = (ast, u, lat) => {
    const i = Math.max(0, Math.min(ast.anzahl - 1, Math.round(u)));
    return { x: ast.px[i] - ast.tz[i] * lat, z: ast.pz[i] + ast.tx[i] * lat, tx: ast.tx[i], tz: ast.tz[i] };
  };
  // Steht das Auto auf dem Stummel hinter der Absperrung? (Mitte hinter der Leitwand, auf Asphalt/Bankett)
  const imStummel = (ast) => N.hinterSperre(ast, A.physik.x, A.physik.z);
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
  for (const ast of N.stummel) {
    const vor = astPunkt(ast, ast.sperre.mitte.u - 4, 0);
    // Auto steht 4 m vor der Absperrung (Mitte des Stummels): welche Meter zählen?
    setze(vor.x, vor.z, Math.atan2(vor.tx, vor.tz), 0);
    A.physikSchritt(A.SCHRITT, LEER);
    const sRennen = A.rennen.letztesS;
    const qs = S.abfrage(A.physik.x, A.physik.z, {});
    const sNetz = N.abfrage(A.physik.x, A.physik.z, {});
    // R (zurück auf die Strasse, wie die Taste im Spiel): landet auf der Etappe, nicht auf dem Stummel
    A.aufStrasse();
    const nachReset = S.abfrage(A.physik.x, A.physik.z, {});
    ergebnis.etappe.push({
      stummel: ast.nr, sJ: ast.sJ, sperreU: Math.round(ast.sperre.mitte.u * 10) / 10,
      sEtappe: Math.round(qs.s * 10) / 10, sRennen: Math.round(sRennen * 10) / 10, netzAst: sNetz.ast,
      ok1: Math.abs(qs.s - sRennen) < 0.5 && Math.abs(qs.s - ast.sJ) < ast.sperreU + 10 && sNetz.ast === ast.nr,
      resetAbstand: Math.round(nachReset.abstand * 100) / 100, ok2: nachReset.abstand < 0.3,
    });
  }
  // Rennen läuft: vor dem Abzweig in den Stummel bis zur Absperrung, zurück, dann über den
  // Nebenweg (und durch den Checkpoint darauf, falls einer dort steht) bis nach der Einmündung.
  // Kein "CHECKPOINT VERPASST", der Checkpoint zählt. (Seit M3b für jeden Nebenweg.)
  ergebnis.cpTests = [];
  for (const ast of N.stummel.filter((a) => a.art === 'abzweig')) {
    const weg = ast.nebenweg, cps = C.checkpoints.beiMeter;
    const cpVor = cps.filter((c) => c < ast.sJ - 60).length;            // so viele CPs liegen schon hinter uns
    const cpAuf = cps.filter((c) => c > ast.sJ && c < weg.einmuendung).length; // so viele auf dem Nebenweg
    const sZiel = Math.max(weg.einmuendung + 10, ...cps.filter((c) => c > ast.sJ && c < weg.einmuendung).map((c) => c + 10));
    A.neustart();
    const p0 = S.punktBei(ast.sJ - 60);
    setze(p0.x, p0.z, Math.atan2(p0.tx, p0.tz), 15);
    A.rennen.zustand = 'laeuft'; A.rennen.zeit = 0; A.rennen.naechsterCp = cpVor; A.rennen.letztesS = ast.sJ - 60;
    A.kollision.letzterAufprall = null;
    const meldungen = new Set();
    let t = 0, phase = 0;
    const ziel = astPunkt(ast, ast.sperre.mitte.u - 3, 0);
    while (t < 90 && phase < 3) {
      let e;
      if (phase === 0) { e = steuer(ziel.x, ziel.z, 12, false); if (Math.hypot(A.physik.x - ziel.x, A.physik.z - ziel.z) < 4 || A.kollision.letzterAufprall) phase = 1; }
      else if (phase === 1) { e = { ...LEER, bremse: 1 }; if (Math.hypot(A.physik.x - ast.px[0], A.physik.z - ast.pz[0]) < 4) phase = 2; }
      else {
        const pZ = S.punktBei(Math.min(S.laenge - 1, Math.max(A.rennen.letztesS, ast.sJ) + 12));
        e = steuer(pZ.x, pZ.z, 12, false);
        if (A.rennen.letztesS > sZiel) phase = 3;
      }
      A.physikSchritt(A.SCHRITT, e);
      t += A.SCHRITT;
      const m = A.hudMeldung();
      if (m) meldungen.add(m);
    }
    ergebnis.cpTests.push({ weg: weg.name, cpAuf, meldungen: [...meldungen], naechsterCp: A.rennen.naechsterCp, zustand: A.rennen.zustand, phase, zeit: Math.round(t * 10) / 10,
      ok: A.rennen.naechsterCp === cpVor + cpAuf && ![...meldungen].some((m) => m.includes('VERPASST')) && phase === 3 });
    A.neustart();
  }

  // =====================================================================
  // 2. Jede Absperrart: an mehreren Stellen der Leitwand hineinfahren, Halt, rückwärts raus.
  //    Kollision: nur diese Absperrung und der Seitenschutz (dann trifft man sicher die Absperrung)
  // =====================================================================
  const originalLoese = A.kollision.loese;
  const schutz = A.strassenrand.hindernisse.filter((h) => h.rand === 'planke' || h.rand === 'zaun');
  for (const art of ['band', 'reifen', 'heu', 'zaun']) {
    for (const ast of N.stummel) {
      const alt = ast.sperreArt;
      ast.sperreArt = art;
      const b = baueAbsperrungen(A.szene, { ...A.welt, netz: { ...N, aeste: [ast] } });
      ast.sperreArt = alt;
      A.szene.remove(b.mesh);
      const sperrKreise = b.hindernisse.filter((h) => h.rand === 'absperrung');
      const kol = baueKollision([...schutz, ...sperrKreise]);
      A.kollision.loese = (...a) => { const r = kol.loese(...a); if (kol.letzterAufprall) A.kollision.letzterAufprall = kol.letzterAufprall; return r; };
      const li = ast.sperre.linie;
      for (const anteil of [0.2, 0.5, 0.8]) {
        const p = li[Math.round((li.length - 1) * anteil)];
        for (const kmh of [40, 70, 100]) {
          for (const winkel of [0, 20, -20, 40, -40]) {
            // Anfahrt von der Etappe her (gegen die Normale n der Leitwand), schräg um "winkel"
            const w = Math.atan2(-p.nx, -p.nz) + winkel * GRAD;
            // M3b: Anlauf muss frei sein (bei flachen Kreuzungen steht dort sonst z. B. der Weidezaun des
            // Nebenwegs: dann prallt das Auto schon dort ab). Erst 12 m, sonst 9 / 7 m; geht keiner, zählt
            // die Stelle als "nicht anfahrbar" (der Zaun schützt die Leitwand dort zusätzlich).
            const anlaufFrei = (d) => {
              // (vom Heck des Autos beim Start bis kurz vor die Leitwand, Autobreite und etwas Luft)
              for (let f = -2.4; f <= d - 2.6; f += 0.5) if (!kol.frei(p.x - Math.sin(w) * (d - f), p.z - Math.cos(w) * (d - f), 1.3)) return false;
              return true;
            };
            const dist = [12, 9, 7].find(anlaufFrei);
            if (!dist) { ergebnis.aufprall.push({ art, stummel: ast.nr, anteil, kmh, winkel, nichtAnfahrbar: true }); continue; }
            const x0 = p.x - Math.sin(w) * dist, z0 = p.z - Math.cos(w) * dist;
            setze(x0, z0, w, kmh / 3.6);
            kol.letzterAufprall = null; A.kollision.letzterAufprall = null;
            let t = 0, getroffen = -1, durch = false, vorher = 0, haltNach = null, tempo03 = null;
            while (t < 6) {
              const e = getroffen < 0 ? { ...LEER, gas: 1, lenkung: 0 } : LEER;
              const tv = A.physik.tempo;
              A.physikSchritt(A.SCHRITT, e);
              t += A.SCHRITT;
              if (imStummel(ast)) durch = true;
              if (getroffen < 0 && kol.letzterAufprall) { getroffen = t; vorher = tv; }
              if (getroffen >= 0 && tempo03 === null && t - getroffen >= 0.3) tempo03 = A.physik.tempo;
              if (getroffen >= 0) {
                if (haltNach === null && A.physik.tempo < 0.5) haltNach = t - getroffen;
                if (t - getroffen > 2.5) break;
              }
            }
            // rückwärts raus
            const p0 = { x: A.physik.x, z: A.physik.z };
            for (let k = 0; k < 360; k++) { A.physikSchritt(A.SCHRITT, { ...LEER, bremse: 1 }); if (imStummel(ast)) durch = true; }
            const zurueck = Math.hypot(A.physik.x - p0.x, A.physik.z - p0.z);
            ergebnis.aufprall.push({
              art, stummel: ast.nr, anteil, kmh, winkel, getroffen: getroffen >= 0, durch,
              vorher: Math.round(vorher * 3.6), haltNach: haltNach === null ? null : Math.round(haltNach * 100) / 100,
              rest: tempo03 === null ? 0 : Math.round((tempo03 / Math.max(0.1, vorher)) * 100),
              zurueck: Math.round(zurueck * 10) / 10,
            });
          }
        }
      }
    }
  }
  A.kollision.loese = originalLoese;

  // =====================================================================
  // 3. Umfahren: Fächer aus Startpunkten, Zielen, Tempo, Handbremse (echte Kollision)
  // =====================================================================
  for (const ast of N.stummel) {
    const sp = ast.sperre;
    const starts = [];
    for (const ds of [-60, -30, -12, 15, 35, 60]) {
      for (const lat of [-3, 3]) {
        // Start auf der Etappe (Hauptstrasse oder Nebenweg), Richtung zur Kreuzung
        const s = ast.sJ + ds;
        const p = S.punktBei(s);
        starts.push({ x: p.x - p.tz * lat, z: p.z + p.tx * lat, s });
      }
    }
    // Ziele: auf dem Stummel hinter der Absperrung, und Umwege um beide Enden der Leitwand
    const zielListen = [];
    for (const u of [4, 14, 30]) for (const lat of [-4, 0, 4]) zielListen.push([astPunkt(ast, ast.sperreU + u, lat)]);
    for (const aussen of [2, 5, 9]) {
      const sa = Math.sign(sp.aussen.l), si = Math.sign(sp.innen.l);
      // um den Anfang (Aussenseite der Kurve) herum
      zielListen.push([astPunkt(ast, sp.aussen.u + 3, sa * (Math.abs(sp.aussen.l) + aussen)), astPunkt(ast, sp.aussen.u + 14, sa * (Math.abs(sp.aussen.l) + aussen)), astPunkt(ast, ast.sperreU + 10, 0)]);
      // um das Ende (Seite des Nebenwegs) herum
      zielListen.push([astPunkt(ast, sp.innen.u - 3, si * (Math.abs(sp.innen.l) + aussen)), astPunkt(ast, sp.innen.u + 8, si * (Math.abs(sp.innen.l) + aussen)), astPunkt(ast, ast.sperreU + 10, 0)]);
    }
    let versuche = 0, durch = 0;
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
              if (imStummel(ast)) { rein = true; break; }
            }
            versuche++;
            if (rein) { durch++; durchListe.push({ s: st.s, ziel: ziele.length, kmh, hb, x: Math.round(A.physik.x), z: Math.round(A.physik.z) }); }
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

  // =====================================================================
  // 5. Leitwand lässt die Fahrbahn frei, Symbol und Richtungstafel stehen
  // =====================================================================
  ergebnis.frei = N.stummel.map((ast) => {
    let naechst = Infinity;
    for (const h of A.absperrungen.hindernisse) {
      if (Math.hypot(h.x - ast.px[0], h.z - ast.pz[0]) > 80) continue;
      const w = S.abfrage(h.x, h.z, {});
      const frei = w.abstand - h.r - N.halbBei(w.s) - C.strasse.bankett;
      if (frei < naechst) naechst = frei;
    }
    const tafel = A.absperrungen.tafeln.find((t) => t.ast === ast.nr);
    return { stummel: ast.nr, art: ast.sperreArt, naechst: Math.round(naechst * 100) / 100, tafel: tafel ? Math.round(tafel.s) : null, tafelLinks: tafel ? tafel.links : null,
      laenge: Math.round(ast.sperre.linie.length * 0.25 * 10) / 10 };
  });

  // =====================================================================
  // 6. Höhenprofil (Boden, wie die Fahrphysik ihn sieht)
  // =====================================================================
  function profil(bereiche, lat) {
    let stufe = { v: 0, s: 0 }, knick = { v: 0, s: 0 };
    for (const [von, bis] of bereiche) {
    const h = [];
    for (let s = von; s <= bis; s += 0.5) {
      const p = S.punktBei(s), f = s - p.i, j = Math.min(S.anzahl - 1, p.i + 1);
      const x0 = p.x + (S.px[j] - p.x) * f, z0 = p.z + (S.pz[j] - p.z) * f;
      h.push(A.welt.bodenBei(x0 - p.tz * lat, z0 + p.tx * lat).h);
    }
    for (let n = 1; n < h.length - 1; n++) {
      const d2 = Math.abs(h[n + 1] - 2 * h[n] + h[n - 1]);
      if (d2 > stufe.v) stufe = { v: d2, s: von + n * 0.5 };
    }
    for (let n = 4; n < h.length - 4; n++) {
      const g = Math.abs((h[n + 4] - h[n]) / 2 - (h[n] - h[n - 4]) / 2);
      if (g > knick.v) knick = { v: g, s: von + n * 0.5 };
    }
    }
    return { stufe, knick };
  }
  // Vergleich: die Strecke ohne Nebenwege (je 100 m Abstand), ohne Start- und Zielbereich
  const wege = N.nebenwege.map((w) => [w.abzweig - 30, w.einmuendung + 60]);
  const rest = [];
  let r0 = 100;
  for (const w of N.nebenwege) { if (w.abzweig - 100 > r0) rest.push([r0, w.abzweig - 100]); r0 = w.einmuendung + 100; }
  rest.push([r0, S.laenge - 100]);
  ergebnis.restBereiche = rest.map(([a, b]) => `${Math.round(a)}-${Math.round(b)}`).join(', ');
  ergebnis.hoehe = [];
  for (let k = 0; k < wege.length; k++) {
    for (const lat of [-2.5, 0, 2.5]) ergebnis.hoehe.push({ weg: N.nebenwege[k].name, von: Math.round(wege[k][0]), bis: Math.round(wege[k][1]), lat, nebenweg: profil([wege[k]], lat), rest: profil(rest, lat) });
  }

  // =====================================================================
  // 7. Fahrtest: senkrechte Beschleunigung und Nicken (wie autoZeichnen in main.js)
  // =====================================================================
  function fahreUndMiss(von, bis) {
    const xs = [], zs = [];
    for (let i = von; i <= bis; i++) { xs.push(S.px[i]); zs.push(S.pz[i]); }
    const pfad = fahrer.bauePfad(A, xs, zs, fahrer.PROFILE.mittel);
    const p = A.physik;
    setze(xs[0], zs[0], Math.atan2(xs[1] - xs[0], zs[1] - zs[0]), pfad.vZiel[0]);
    const proben = [];
    let t = 0, idx = 0, naechsteProbe = 0;
    while (idx < pfad.n - 12 && t < 60) {
      let best = idx, bestD = Infinity;
      for (let i = idx; i < Math.min(pfad.n, idx + 30); i++) { const d = (xs[i] - p.x) ** 2 + (zs[i] - p.z) ** 2; if (d < bestD) { bestD = d; best = i; } }
      idx = best;
      const v = Math.max(0, p.vVor), vor = Math.min(pfad.n - 1, idx + Math.round(5 + v * 0.35));
      const e = steuer(xs[vor], zs[vor], pfad.vZiel[Math.min(pfad.n - 1, idx + 2)], false);
      if (p.tempo > pfad.vZiel[Math.min(pfad.n - 1, idx + 2)] + 0.3) { e.gas = 0; e.bremse = 0.4; }
      A.physikSchritt(A.SCHRITT, e);
      t += A.SCHRITT;
      if (t >= naechsteProbe) {
        naechsteProbe += 0.05;
        const fx = Math.sin(p.richtung), fz = Math.cos(p.richtung);
        const hv = A.welt.bodenBei(p.x + fx * 1.3, p.z + fz * 1.3).h, hh = A.welt.bodenBei(p.x - fx * 1.3, p.z - fz * 1.3).h;
        proben.push({ y: Math.max(A.welt.bodenBei(p.x, p.z).h, (hv + hh) / 2), nick: Math.atan2(hv - hh, 2.6), s: S.abfrage(p.x, p.z, q).s });
      }
    }
    let beschl = { v: 0 }, nickRate = { v: 0 };
    for (let n = 1; n < proben.length - 1; n++) {
      const a = Math.abs(proben[n + 1].y - 2 * proben[n].y + proben[n - 1].y) / 0.0025;      // m/s²
      const r = Math.abs(proben[n + 1].nick - proben[n].nick) / 0.05 / GRAD;                // Grad/s
      if (a > beschl.v) beschl = { v: a, s: proben[n].s };
      if (r > nickRate.v) nickRate = { v: r, s: proben[n].s };
    }
    return { beschl, nickRate, zeit: t };
  }
  const fahrtRest = fahreUndMiss(1100, 1700);
  ergebnis.fahrt = N.nebenwege.map((w) => ({ weg: w.name, von: Math.round(w.abzweig - 60), bis: Math.round(w.einmuendung + 80),
    nebenweg: fahreUndMiss(Math.round(w.abzweig - 60), Math.round(w.einmuendung + 80)), rest: fahrtRest }));

  // =====================================================================
  // 8. Staub: geradeaus auf dem Schotter, ruhig (kein Drift, keine Handbremse)
  // =====================================================================
  ergebnis.staub = [];
  for (const [belag, sMess] of [['schotter', 842], ['wiesenweg', 2920]]) {
    const p = S.punktBei(sMess);
    setze(p.x, p.z, Math.atan2(p.tx, p.tz), 16);
    const z0 = { l: A.staub.zustand.links, r: A.staub.zustand.rechts };
    let maxDrift = 0;
    for (let k = 0; k < 300; k++) {
      const pz = S.punktBei(Math.min(S.laenge - 1, S.abfrage(A.physik.x, A.physik.z, q).s + 12));
      const e = steuer(pz.x, pz.z, 16, false);
      e.gas = Math.min(e.gas, 0.5);
      A.physikSchritt(A.SCHRITT, e);
      if (k % 2 === 0) {
        A.staub.aktualisiere(A.SCHRITT * 2, { x: A.physik.x, y: 0, z: A.physik.z, richtung: A.physik.richtung, vx: A.physik.vx, vz: A.physik.vz,
          tempo: A.physik.tempo, drift: A.physik.driftWinkel, gas: e.gas, handbremse: false, schotter: true, belag });
      }
      maxDrift = Math.max(maxDrift, Math.abs(A.physik.driftWinkel));
    }
    ergebnis.staub.push({ belag, s: sMess, boden: A.welt.bodenBei(A.physik.x, A.physik.z).art, links: A.staub.zustand.links - z0.l, rechts: A.staub.zustand.rechts - z0.r, maxDrift: Math.round(maxDrift * 10) / 10 });
  }
  A.neustart();
  return ergebnis;
});

let fehler = 0;
const melde = (ok, text) => { console.log(`${ok ? 'OK    ' : 'FEHLER'} ${text}`); if (!ok) fehler++; };
const cm = (v) => (v * 100).toFixed(1);
console.log('1. Etappenlogik');
for (const e of erg.etappe) {
  melde(e.ok1, `Stummel ${e.stummel}: Auto 4 m vor der Absperrung (Stummel-Meter ${Math.round((e.sperreU - 4) * 10) / 10}) hat Etappen-s ${e.sEtappe} (Rennen ${e.sRennen}, Kreuzung bei ${e.sJ}), Netz erkennt Stummel ${e.netzAst}`);
  melde(e.ok2, `Stummel ${e.stummel}: "R" setzt auf die Etappe zurück (Abstand zur Mitte ${e.resetAbstand} m)`);
}
for (const c of erg.cpTests) {
  melde(c.ok, `${c.weg}: in den Stummel bis zur Absperrung und zurück, dann über den Nebenweg bis nach der Einmündung` +
    `${c.cpAuf ? ' (mit Checkpoint)' : ''}: nächster CP ${c.naechsterCp + 1}, Meldungen: ${c.meldungen.join(', ') || 'keine'}`);
}

console.log('2. Absperrungen als Leitwand (hineinfahren, Halt, rückwärts raus)');
for (const art of ['band', 'reifen', 'heu', 'zaun']) {
  const alle = erg.aufprall.filter((a) => a.art === art);
  const l = alle.filter((a) => !a.nichtAnfahrbar);
  const durch = l.filter((a) => a.durch).length, nicht = l.filter((a) => !a.getroffen).length;
  // Halt: steht nach spätestens 2.5 s, oder (schräg) hat nach 0.3 s höchstens noch 35 % Tempo und gleitet an der Leitwand entlang
  const hart = l.filter((a) => a.haltNach !== null || a.rest <= 35);
  const stecken = l.filter((a) => a.zurueck < 2).length;
  const frontal = l.filter((a) => a.winkel === 0);
  if (process.argv.includes('--details')) for (const a of l.filter((a) => a.durch || !a.getroffen || !(a.haltNach !== null || a.rest <= 35) || a.zurueck < 2 || (a.winkel === 0 && !(a.haltNach <= 0.3)))) console.log('   ', JSON.stringify(a));
  melde(!durch && !nicht && hart.length === l.length && !stecken && frontal.every((a) => a.haltNach !== null && a.haltNach <= 0.3),
    `${art.padEnd(6)}: ${l.length} Anfahrten (3 Stellen der Leitwand, 40/70/100 km/h, 0°/±20°/±40°; ${alle.length - l.length} nicht anfahrbar, Zaun davor): durch ${durch}, getroffen ${l.length - nicht}, ` +
    `frontal Stillstand nach höchstens ${Math.max(...frontal.map((a) => a.haltNach ?? 9)).toFixed(2)} s, schräg nach 0.3 s höchstens ${Math.max(...l.map((a) => a.rest))} % Tempo, ` +
    `rückwärts raus ${l.length - stecken} (mind. ${Math.min(...l.map((a) => a.zurueck))} m)`);
}
console.log('3. Umfahren');
for (const u of erg.umfahren) {
  melde(u.durch === 0, `Stummel ${u.stummel} (${u.art}): ${u.versuche} Versuche (Start auf Hauptstrasse und Nebenweg, Ziele hinter der Leitwand und um beide Enden herum, 30/70/110 km/h, mit/ohne Handbremse): ${u.durch} kamen auf den Stummel` +
    (u.beispiele.length ? ` z. B. ${JSON.stringify(u.beispiele)}` : ''));
}
console.log('4. Sichtlinien');
for (const s of erg.sicht) melde(s.sichtbar === 0, `Stummel ${s.stummel}: ${s.strahlen} Strahlen, ${s.sichtbar} sehen das Ende`);
console.log('5. Leitwand lässt die Fahrbahn frei');
for (const f of erg.frei) {
  melde(f.naechst >= 0.2 && f.tafel !== null, `Stummel ${f.stummel} (${f.art}): Leitwand ${f.laenge} m lang, nächster Kollisionskreis ${f.naechst} m ausserhalb von Weg + Bankett; ` +
    `Richtungstafel bei ${f.tafel ?? '-'} m (Pfeil ${f.tafelLinks ? 'links' : 'rechts'})`);
}
console.log(`6. Höhenprofil je Nebenweg (0.5-m-Schritte), verglichen mit der Strecke ohne Nebenwege (${erg.restBereiche} m)`);
for (const h of erg.hoehe) {
  const n = h.nebenweg, r = h.rest;
  melde(n.stufe.v <= Math.max(0.04, r.stufe.v) && n.knick.v <= Math.max(0.04, r.knick.v * 1.25),
    `${h.weg.padEnd(11)} ${h.von}-${h.bis} m, ${String(h.lat).padStart(4)} m neben der Mitte: grösste Stufe ${cm(n.stufe.v)} cm bei ${n.stufe.s} m (übrige Strecke ${cm(r.stufe.v)} cm), ` +
    `grösste Steigungsänderung ${cm(n.knick.v)} % auf 2 m bei ${n.knick.s} m (übrige Strecke ${cm(r.knick.v)} %)`);
}
console.log('7. Fahrtest (Profil "mittel"): Auto über Abzweig und Einmündung');
for (const f of erg.fahrt) {
  const n = f.nebenweg, r = f.rest;
  melde(n.beschl.v <= r.beschl.v * 1.25 + 0.5 && n.nickRate.v <= r.nickRate.v * 1.25 + 1,
    `${f.weg.padEnd(11)} ${f.von}-${f.bis} m: senkrechte Beschleunigung höchstens ${n.beschl.v.toFixed(1)} m/s² bei ${Math.round(n.beschl.s)} m, Nicken höchstens ${n.nickRate.v.toFixed(1)} °/s bei ${Math.round(n.nickRate.s)} m ` +
    `(1100-1700 m zum Vergleich: ${r.beschl.v.toFixed(1)} m/s², ${r.nickRate.v.toFixed(1)} °/s)`);
}
console.log('8. Staub bei normaler Fahrt');
for (const st of erg.staub) {
  const sum = st.links + st.rechts;
  melde(sum >= 3 && Math.abs(st.links - st.rechts) <= 1 && st.boden === st.belag,
    `geradeaus auf ${st.belag} bei ${st.s} m (Boden: ${st.boden}, Drift höchstens ${st.maxDrift}°): links ${st.links}, rechts ${st.rechts} Wölkchen`);
}
melde(!spiel.fehler.length, `Keine Fehler in der Browser-Konsole (${spiel.fehler.length})`);
console.log(`Dauer ${Math.round((Date.now() - t0) / 1000)} s`);
await spiel.schliessen();
process.exit(fehler ? 1 : 0);
