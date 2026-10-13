// Automatischer Testfahrer (läuft im Browser, gestartet von tools/testfahrer.mjs).
// Das Spiel selbst lädt diese Datei nicht.
//
// Der Fahrer folgt einem Pfad (Punkte im Abstand von ca. 1 m): der Strassenmitte
// oder einer selbst gebauten Linie (z. B. quer über die Wiese beim Kurvenschneiden).
// Lenken: zielt auf einen Punkt etwas voraus. Tempo: aus der Krümmung des Pfads
// und dem Grip des Untergrunds (Gras = langsamer), rechtzeitig bremsen.
// Gefahren wird mit der echten Fahrphysik des Spiels (physikSchritt in main.js,
// inkl. Getriebe, Kollisionen, Gelände, Checkpoints). Ohne Handbremse.

const winkelNorm = (w) => Math.atan2(Math.sin(w), Math.cos(w));
const begrenze = (w, a, b) => Math.max(a, Math.min(b, w));

// Fahrprofile: Querbeschleunigung (m/s²) in Kurven und Bremsverzögerung (m/s²)
export const PROFILE = {
  vorsichtig: { quer: 4.5, bremsen: 5.5 },
  mittel: { quer: 6, bremsen: 6.5 },
  flott: { quer: 7.5, bremsen: 7.5 },
};

// Pfad aus Punktlisten, mit Zieltempo für jeden Punkt
export function bauePfad(A, xs, zs, profil) {
  const n = xs.length, vZiel = new Float64Array(n);
  const q = {};
  for (let i = 0; i < n; i++) {
    const a = Math.max(0, i - 4), b = Math.min(n - 1, i + 4);
    const w1 = Math.atan2(xs[i] - xs[a], zs[i] - zs[a]), w2 = Math.atan2(xs[b] - xs[i], zs[b] - zs[i]);
    const lang = Math.hypot(xs[b] - xs[a], zs[b] - zs[a]) || 1;
    const kappa = Math.abs(winkelNorm(w2 - w1)) / (lang / 2); // Richtungswechsel zwischen den Mitten der beiden Stücke
    const art = A.welt.bodenBei(xs[i], zs[i], A.strecke.abfrage(xs[i], zs[i], q)).art;
    const grip = A.CONFIG.untergrund[art].grip;
    vZiel[i] = Math.min(60, Math.sqrt((profil.quer * grip) / Math.max(kappa, 1e-4)));
  }
  // rechtzeitig bremsen: vom Ende her
  for (let i = n - 2; i >= 0; i--) {
    const ds = Math.hypot(xs[i + 1] - xs[i], zs[i + 1] - zs[i]);
    vZiel[i] = Math.min(vZiel[i], Math.sqrt(vZiel[i + 1] ** 2 + 2 * profil.bremsen * ds));
  }
  return { xs, zs, vZiel, n };
}

// Nächster Pfadpunkt (in der Nähe des letzten)
function naechster(pfad, x, z, ab) {
  let best = ab, bestD = Infinity;
  const von = Math.max(0, ab - 10), bis = Math.min(pfad.n - 1, ab + 40);
  for (let i = von; i <= bis; i++) {
    const d = (pfad.xs[i] - x) ** 2 + (pfad.zs[i] - z) ** 2;
    if (d < bestD) { bestD = d; best = i; }
  }
  if (bestD > 400) { // weit weg (z. B. zurückgesetzt): ganz suchen
    for (let i = 0; i < pfad.n; i++) {
      const d = (pfad.xs[i] - x) ** 2 + (pfad.zs[i] - z) ** 2;
      if (d < bestD) { bestD = d; best = i; }
    }
  }
  return best;
}

// Eingabe für einen Schritt
function steuere(A, pfad, idx) {
  const p = A.physik;
  const v = Math.max(0, p.vVor);
  const voraus = Math.min(pfad.n - 1, idx + Math.round(5 + v * 0.35));
  const ziel = Math.atan2(pfad.xs[voraus] - p.x, pfad.zs[voraus] - p.z);
  const fehler = winkelNorm(ziel - p.richtung);
  const lenkung = begrenze(-fehler * 2.5, -1, 1);
  const vz = pfad.vZiel[Math.min(pfad.n - 1, idx + 2)];
  const dv = vz - v;
  return {
    gas: dv > 0 ? begrenze(dv * 1.0, 0, 1) : 0,
    bremse: dv < -0.3 ? begrenze(-dv * 0.5, 0, 1) : 0,
    lenkung, handbremse: false, reset: false, debug: false,
  };
}

// Die ganze Etappe fahren. Ergebnis: Zeit, Zwischenzeiten, Aufpralle, ...
export function fahreEtappe(A, profilName) {
  const profil = PROFILE[profilName];
  const S = A.strecke;
  const pfad = bauePfad(A, Array.from(S.px), Array.from(S.pz), profil);
  A.neustart();
  const sperrH = A.pflanzen.hindernisse.filter((h) => h.sperre);
  let idx = 0, t = 0, steh = 0, haenger = 0, aufpralle = [], letzter = A.kollision.letzterAufprall;
  let maxAbstand = 0, nahSperre = Infinity, schritte = 0, gangWechsel = 0, letzterGang = null, hinUndHer = 0;
  const wechselListe = [], hinUndHerListe = [];
  const q = {};
  while (A.rennen.zustand !== 'ziel' && t < 600) {
    idx = naechster(pfad, A.physik.x, A.physik.z, idx);
    const e = steuere(A, pfad, idx);
    A.physikSchritt(A.SCHRITT, e);
    t += A.SCHRITT; schritte++;
    if (A.getriebe && A.rennen.zustand === 'laeuft') {
      const g = A.getriebe.anzeige;
      if (g !== letzterGang) {
        // Hin und Her: zurück in den Gang von vorhin, keine 1.5 s später
        const info = { t, von: letzterGang, nach: g, s: Math.round(A.rennen.letztesS), kmh: Math.round(A.physik.tempo * 3.6), gas: e.gas.toFixed(2), bremse: e.bremse.toFixed(2) };
        // (nicht gezählt: Kickdown und danach wieder hoch, weil das Auto schneller geworden ist)
        const vorher = wechselListe[wechselListe.length - 1];
        if (vorher && vorher.von === g && t - vorher.t < 1.5 && Math.abs(info.kmh - vorher.kmh) < 8) {
          hinUndHer++;
          hinUndHerListe.push(`${wechselListe[wechselListe.length - 1].von}->${wechselListe[wechselListe.length - 1].nach} (${wechselListe[wechselListe.length - 1].kmh} km/h, Gas ${wechselListe[wechselListe.length - 1].gas}) ->${g} bei ${info.s} m (Gas ${info.gas}, Bremse ${info.bremse})`);
        }
        wechselListe.push(info);
        gangWechsel++; letzterGang = g;
      }
    }
    if (A.kollision.letzterAufprall !== letzter) {
      letzter = A.kollision.letzterAufprall;
      aufpralle.push(`${Math.round(A.rennen.letztesS)} m (${Math.round(letzter.vorher * 3.6)} -> ${Math.round(letzter.nachher * 3.6)} km/h)`);
    }
    if (A.rennen.zustand === 'laeuft') maxAbstand = Math.max(maxAbstand, S.abfrage(A.physik.x, A.physik.z, q).abstand);
    if (schritte % 6 === 0) {
      for (const h of sperrH) {
        const d = Math.hypot(h.x - A.physik.x, h.z - A.physik.z) - h.r;
        if (d < nahSperre) nahSperre = d;
      }
    }
    // hängen geblieben? (fast kein Tempo, obwohl gefahren werden soll)
    if (A.physik.tempo < 0.5 && A.rennen.zustand === 'laeuft') steh += A.SCHRITT; else steh = 0;
    if (steh > 3) { haenger++; steh = 0; A.setzeAuf(A.rennen.letztesS + 2); }
  }
  return {
    profil: profilName, zeit: A.rennen.endZeit, ziel: A.rennen.zustand === 'ziel',
    cps: A.rennen.zwischenzeiten.slice(), aufpralle, haenger, maxAbstand, nahSperre: nahSperre - 0.9, gangWechsel, hinUndHer, hinUndHerListe,
  };
}

// Ein Stück Pfad fahren (für den Zeitvergleich beim Schneiden).
// Start bei Pfadpunkt 0 mit dem Zieltempo dort, Ende bei Pfadpunkt "ende".
export function fahreStueck(A, pfad, ende) {
  const p = A.physik;
  const w = Math.atan2(pfad.xs[1] - pfad.xs[0], pfad.zs[1] - pfad.zs[0]);
  A.setzeAuf(A.strecke.abfrage(pfad.xs[0], pfad.zs[0]).s);
  p.reset(pfad.xs[0], pfad.zs[0], w);
  const v0 = pfad.vZiel[0];
  p.vx = Math.sin(w) * v0; p.vz = Math.cos(w) * v0; p.vVor = v0;
  if (A.getriebe) A.getriebe.reset();
  A.rennen.zustand = 'bereit';
  let idx = 0, t = 0, letzter = A.kollision.letzterAufprall, aufprall = false, gras = 0;
  while (idx < ende && t < 60) {
    idx = naechster(pfad, p.x, p.z, idx);
    A.physikSchritt(A.SCHRITT, steuere(A, pfad, idx));
    t += A.SCHRITT;
    if (A.kollision.letzterAufprall !== letzter) { aufprall = true; letzter = A.kollision.letzterAufprall; }
    if (A.welt.bodenBei(p.x, p.z).art === 'gras') gras += A.SCHRITT;
  }
  return { zeit: t, aufprall, gras, fertig: idx >= ende };
}

// Pfad glätten (gleitender Mittelwert), Enden bleiben
function glaette(xs, zs, halb, runden) {
  for (let r = 0; r < runden; r++) {
    const nx = xs.slice(), nz = zs.slice();
    for (let i = halb; i < xs.length - halb; i++) {
      let sx = 0, sz = 0;
      for (let k = -halb; k <= halb; k++) { sx += xs[i + k]; sz += zs[i + k]; }
      nx[i] = sx / (2 * halb + 1); nz[i] = sz / (2 * halb + 1);
    }
    xs.splice(0, xs.length, ...nx); zs.splice(0, zs.length, ...nz);
  }
}

// Zeitvergleich in einer Kurve: Ideallinie (bleibt auf Strasse und Bankett) gegen
// geschnittene Linie (die Abkürzung l quer über die Wiese).
// Ergebnis: { ideal, schnitt, gewinn (s, + = Schneiden schneller), ... }
export function vergleicheSchnitt(A, l, profilName = 'mittel', grenze = 4.5) {
  const profil = PROFILE[profilName];
  const S = A.strecke;
  const vor = 90, nach = 60;
  const i0 = Math.max(1, l.i - vor), i1 = Math.min(S.anzahl - 2, l.j + nach);
  // geschnittene Linie: Strasse bis i, gerade Linie bis j, dann Strasse
  const xs = [], zs = [];
  for (let i = i0; i < l.i; i++) { xs.push(S.px[i]); zs.push(S.pz[i]); }
  const lang = Math.hypot(l.bx - l.ax, l.bz - l.az), n = Math.ceil(lang);
  for (let k = 0; k < n; k++) { xs.push(l.ax + (l.bx - l.ax) * (k / n)); zs.push(l.az + (l.bz - l.az) * (k / n)); }
  for (let i = l.j; i <= i1; i++) { xs.push(S.px[i]); zs.push(S.pz[i]); }
  glaette(xs, zs, 4, 2);
  // Ideallinie: bleibt auf Strasse und Bankett. Zwei Varianten, die schnellere zählt:
  // Strassenmitte, und eine Linie, die in der Kurve bis "grenze" Meter nach innen geht
  // (weich hinein und wieder hinaus, in Strassen-Koordinaten gebaut, damit sie in
  // Kehren nicht auf den anderen Ast springt).
  const rampe = 25;
  const linieInnen = (off) => {
    const ix = [], iz = [];
    for (let i = i0; i <= i1; i++) {
      let f = 1;
      if (i < l.i) f = Math.max(0, 1 - (l.i - i) / rampe);
      if (i > l.j) f = Math.max(0, 1 - (i - l.j) / rampe);
      f = f * f * (3 - 2 * f);
      ix.push(S.px[i] - S.tz[i] * l.seite * off * f); iz.push(S.pz[i] + S.tx[i] * l.seite * off * f);
    }
    return [ix, iz];
  };
  const pSchnitt = bauePfad(A, xs, zs, profil);
  const rSchnitt = fahreStueck(A, pSchnitt, pSchnitt.n - 25);
  let rIdeal = null, pIdeal = null;
  for (const off of [0, grenze * 0.5, grenze]) {
    const [ix, iz] = linieInnen(off);
    glaette(ix, iz, 4, 2); // gleich geglättet wie die geschnittene Linie (faire Kurvenlinie)
    const pf = bauePfad(A, ix, iz, profil);
    const r = fahreStueck(A, pf, pf.n - 25);
    if (r.fertig && !r.aufprall && (!rIdeal || r.zeit < rIdeal.zeit)) { rIdeal = r; pIdeal = pf; rIdeal.innen = off; }
  }
  if (!rIdeal) { rIdeal = { zeit: NaN, fertig: false, aufprall: true, gras: 0 }; pIdeal = { n: 0 }; }
  return {
    ideal: rIdeal.zeit, schnitt: rSchnitt.zeit, gewinn: rIdeal.zeit - rSchnitt.zeit,
    ok: rSchnitt.fertig && rIdeal.fertig && !rSchnitt.aufprall && !rIdeal.aufprall,
    aufprall: rSchnitt.aufprall || rIdeal.aufprall, grasSchnitt: rSchnitt.gras, grasIdeal: rIdeal.gras,
    laengeSchnitt: pSchnitt.n, laengeIdeal: pIdeal.n, innen: rIdeal.innen,
  };
}
