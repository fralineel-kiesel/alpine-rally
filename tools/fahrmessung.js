// Fahrmessungen für Meilenstein 8a (Tabelle B3), ohne Browser.
// Benutzt von tools/auto-messung.mjs und tools/auto-test.mjs. Das Spiel selbst lädt diese Datei nicht.
//
// Gerechnet wird mit der echten Fahrphysik (js/physics.js) und dem Getriebe (js/getriebe.js), auf flachem Boden,
// jeder Schritt genau wie in main.js (physikSchritt): Getriebe liefert Antrieb und Motorbremse, dann ein
// Physik-Schritt mit dem Untergrund. Seit M8a bekommt das Getriebe auch den Belag (Allrad je Belag) und der
// Untergrund den Namen des Belags (Heck-Grip je Belag); ältere Versionen (z. B. 0.7b) übersehen das einfach.
//
// baueMessung({ CONFIG, Fahrphysik, Getriebe }) gibt alle Messungen zurück. Alle Werte gelten für das Profil,
// das gerade in CONFIG steht (vorher mit js/fahrprofil.js wählen).

const DT = 1 / 120;
const GRAD = 180 / Math.PI;
const KMH = 1 / 3.6;
const begrenze = (w, a, b) => Math.max(a, Math.min(b, w));

export function baueMessung({ CONFIG, Fahrphysik, Getriebe }) {
  // Untergrund wie in main.js an die Physik gegeben
  function boden(art) {
    const u = CONFIG.untergrund[art];
    return {
      grip: u.grip, rollen: u.rollen, rollenTempo: u.rollenTempo, steigung: 0,
      rueckwaerts: u.rueckwaerts ?? 1, heck: u.heck ?? 1, stabilitaet: u.stabilitaet ?? 1, geradeaus: u.geradeaus ?? 1,
      rueckwaertsMax: u.rueckwaertsMax ?? 1, belag: art,
    };
  }
  // Auto bei (0, 0), Blick +z, Tempo v (m/s), Getriebe eingeschwungen (wie belag-test)
  function auto(v = 0) {
    const p = new Fahrphysik();
    p.reset(0, 0, 0);
    p.vz = v; p.vVor = v;
    p.g = new Getriebe();
    if (v > 0) for (let i = 0; i < 240; i++) p.g.schritt(DT, { gas: 0.5, bremse: 0, lenkung: 0, handbremse: false }, p.vVor, p.tempo, 1, 'asphalt');
    return p;
  }
  const schritt = (p, e, b) => p.schritt(DT, e, b, p.g.schritt(DT, e, p.vVor, p.tempo, b.grip, b.belag));
  const VOLLGAS = { gas: 1, bremse: 0, lenkung: 0, handbremse: false };

  // 0 auf ziel km/h geradeaus mit Vollgas (Sekunden, null = nicht erreicht in 40 s)
  function beschleunigung(art, zielKmh = 100) {
    const b = boden(art), p = auto(0);
    for (let t = 0; t < 40; t += DT) {
      schritt(p, VOLLGAS, b);
      if (p.vVor >= zielKmh * KMH) return t + DT;
    }
    return null;
  }

  // Bremsweg von km/h auf 0 (Vollbremsung geradeaus, Meter)
  function bremsweg(art, vonKmh = 100) {
    const b = boden(art), p = auto(vonKmh * KMH);
    let weg = 0;
    for (let t = 0; t < 15 && p.vVor > 0.5; t += DT) { schritt(p, { gas: 0, bremse: 1, lenkung: 0, handbremse: false }, b); weg += Math.max(0, p.vVor) * DT; }
    return weg;
  }

  // Grösster Radeinschlag bei Tempo v (m/s), genau wie in js/physics.js gerechnet (für den Kreis-Regler)
  function maxLenk(v) {
    const c = CONFIG.auto;
    const tA = Math.sqrt(begrenze(Math.abs(v) / c.lenkReferenzTempo, 0, 1));
    let m = (c.lenkwinkelLangsam + (c.lenkwinkelSchnell - c.lenkwinkelLangsam) * tA) / GRAD;
    if (c.lenkwinkelStand > 0) {
      const x = begrenze((Math.abs(v) - c.lenkStandBisTempo * 0.25) / (c.lenkStandBisTempo * 0.75), 0, 1);
      const stand = 1 - x * x * (3 - 2 * x);
      m += (c.lenkwinkelStand / GRAD - m) * stand;
    }
    return m;
  }

  // Kreisfahrt: Linkskurve um den Mittelpunkt (R, 0), Start bei (0, 0) mit Blick +z.
  // Lenk-Regler: Radeinschlag = Geometrie (Radstand / R) + PD-Regler auf den Abstand zum Kreis und wie schnell er
  // sich ändert + kleiner I-Anteil (gedämpft, schwingt nicht). Tempo-Regler P+I mit Gas und Bremse.
  // eingriff(t, p, e): darf die Eingabe in einem Abschnitt ersetzen (Bremsen, Vollgas). messe(t, p, e, versatz) je Schritt.
  function kreisFahrt({ R, v, art, dauer, eingriff = null, messe = null }) {
    const b = boden(art), p = auto(v);
    const cx = R, cz = 0, L = CONFIG.auto.radstand;
    p.drehrate = v / R;
    let iRad = 0, iV = 0;
    const e = { gas: 0, bremse: 0, lenkung: 0, handbremse: false };
    for (let t = 0; t < dauer; t += DT) {
      const dx = p.x - cx, dz = p.z - cz, d = Math.hypot(dx, dz);
      const fehlerRad = d - R; // > 0 = aussen
      const radialTempo = (p.vx * dx + p.vz * dz) / d; // > 0 = nach aussen
      const vv = Math.max(4, p.tempo);
      const G = vv * vv / 4; // wie stark der Einschlag die Bahn krümmt (grob, Meter Radstand mit Untersteuern)
      const kp = 2.25 / G, kd = 2 * 0.9 * 1.5 / G, ki = 0.4 / G;
      iRad = begrenze(iRad + fehlerRad * DT, -20, 20);
      const delta = Math.atan(L / R) + kp * fehlerRad + kd * radialTempo + ki * iRad;
      e.lenkung = begrenze(-delta / maxLenk(p.vVor), -1, 1);
      const fv = v - p.tempo;
      iV = begrenze(iV + fv * DT, -2, 2);
      const f = fv * 3 + iV * 2;
      e.gas = begrenze(f, 0, 1); e.bremse = begrenze(-f, 0, 1);
      e.handbremse = false;
      if (eingriff) eingriff(t, p, e);
      schritt(p, e, b);
      if (messe) messe(t, p, e, fehlerRad);
    }
    return p;
  }
  // "Heck aussen" in Grad (Linkskurve: Heck aussen = Fahrtrichtung zeigt rechts der Blickrichtung)
  const heckAussen = (p) => -p.driftWinkel;

  // Grösstes Tempo, bei dem das Auto den Kreis R hält (Halbierungssuche): nach 3 s Einschwingen höchstens 1 m
  // neben dem Kreis, Schwimmwinkel unter 12°, Tempo höchstens 3 % unter dem Ziel. (km/h)
  function kreisGrenze(R, art) {
    const haelt = (v) => {
      let ok = true, vSumme = 0, n = 0;
      kreisFahrt({
        R, v, art, dauer: 8,
        messe: (t, p, e, fr) => {
          if (Math.abs(p.driftWinkel) > 12 || !Number.isFinite(p.x)) ok = false;
          if (t > 3 && Math.abs(fr) > 1.0) ok = false;
          if (t > 6) { vSumme += p.tempo; n++; }
        },
      });
      return ok && vSumme / n > v * 0.97;
    };
    let lo = 4, hi = 30;
    for (let k = 0; k < 14; k++) { const m = (lo + hi) / 2; if (haelt(m)) lo = m; else hi = m; }
    return lo / KMH;
  }

  // Lenkwinkel (Radeinschlag, Grad), den das Auto bei kmh auf dem Kreis R braucht (Mittel über die letzten 2 s)
  function lenkBedarf(kmh, R, art = 'asphalt') {
    let summe = 0, n = 0, rSumme = 0, beta = 0;
    kreisFahrt({
      R, v: kmh * KMH, art, dauer: 8,
      messe: (t, p, e, fr) => { if (t > 6) { summe += p.lenkwinkel * GRAD; rSumme += fr; beta += heckAussen(p); n++; } },
    });
    return { grad: summe / n, kinematisch: Math.atan(CONFIG.auto.radstand / R) * GRAD, versatz: rSumme / n, schwimm: beta / n };
  }

  // Heck-Reaktion: auf dem Kreis R mit kmh eingeschwungen (6 s), dann Gas weg und bremsen (Pedal "bremse"),
  // Lenkung festgehalten. Zusätzlicher Schwimmwinkel (Heck aussen, Grad) nach 0.5 s; danach Bremse los, der Regler
  // fährt weiter: wie lange, bis das Heck wieder höchstens so weit draussen ist wie vorher (+0.5°)?
  function heckReaktion(kmh, R, art = 'asphalt', bremse = 0.6) {
    let b0 = null, b05 = null, max = -99, lenkFest = 0, zurueck = null, dreher = false;
    const T0 = 6;
    kreisFahrt({
      R, v: kmh * KMH, art, dauer: T0 + 3,
      eingriff: (t, p, e) => {
        if (t < T0) { lenkFest = e.lenkung; return; }
        if (t < T0 + 0.5) { e.gas = 0; e.bremse = bremse; e.lenkung = lenkFest; }
        else { e.gas = 0; e.bremse = 0; }
      },
      messe: (t, p) => {
        const h = heckAussen(p);
        if (Math.abs(p.driftWinkel) > 60) dreher = true;
        if (t < T0) { b0 = h; return; }
        if (t < T0 + 0.5) { max = Math.max(max, h); b05 = h; return; }
        max = Math.max(max, h);
        if (zurueck === null && h <= b0 + 0.5) zurueck = t - (T0 + 0.5);
      },
    });
    return { vorher: b0, nach05: b05, zusatz: b05 - b0, max, einfangen: zurueck, dreher };
  }

  // Vollgas in der Kurve: auf dem Kreis R mit vonKmh eingeschwungen, dann 3 s Vollgas (Regler lenkt weiter).
  // Grösster Schwimmwinkel (Heck aussen, Grad) und Tempo am Ende.
  function gasInKurve(R, vonKmh, art = 'asphalt') {
    let max = -99, ende = 0;
    const T0 = 5;
    const p = kreisFahrt({
      R, v: vonKmh * KMH, art, dauer: T0 + 3,
      eingriff: (t, p, e) => { if (t >= T0) { e.gas = 1; e.bremse = 0; } },
      messe: (t, p) => { if (t >= T0) { max = Math.max(max, heckAussen(p)); ende = p.tempo; } },
    });
    return { max, tempoEnde: ende / KMH, versatzEnde: Math.hypot(p.x - R, p.z) - R };
  }

  // Handbremsen-Drift wie tools/belag-test.mjs: 80 km/h, Handbremse 0.6 s und Tastatur voll eingelenkt.
  // Driftwinkel nach 0.5 s und grösster Driftwinkel, Zeit bis wieder gerade (gegenlenken)
  function handbremsDrift(art = 'asphalt') {
    const b = boden(art), p = auto(80 * KMH), s = CONFIG.steuerung;
    let lenk = 0, nach05 = null, max = 0, gerade = null;
    for (let t = 0; t < 6; t += DT) {
      const an = t < 0.6;
      if (an) lenk = Math.min(1, lenk + s.tastaturLenkTempo * DT);
      else lenk = begrenze(-p.driftWinkel / 12, -1, 1);
      schritt(p, { gas: an ? 0.2 : 0.5, bremse: 0, lenkung: lenk, handbremse: an }, b);
      if (nach05 === null && t + DT >= 0.5 - 1e-9) nach05 = Math.abs(p.driftWinkel);
      max = Math.max(max, Math.abs(p.driftWinkel));
      if (!an && gerade === null && Math.abs(p.driftWinkel) < 3 && t > 0.7) gerade = t - 0.6;
    }
    return { nach05, max, gerade };
  }

  // Rückwärts aus dem Stand (Bremse voll): Höchsttempo (km/h) und Zeit bis 95 % davon
  function rueckwaerts(art = 'asphalt') {
    const b = boden(art), p = auto(0);
    let max = 0, t95 = null;
    const verlauf = [];
    for (let t = 0; t < 8; t += DT) {
      schritt(p, { gas: 0, bremse: 1, lenkung: 0, handbremse: false }, b);
      verlauf.push(-p.vVor);
      max = Math.max(max, -p.vVor);
    }
    for (let i = 0; i < verlauf.length; i++) if (verlauf[i] >= max * 0.95) { t95 = (i + 1) * DT; break; }
    return { max: max / KMH, t95, nach1s: verlauf[119] / KMH };
  }

  return { boden, auto, schritt, maxLenk, beschleunigung, bremsweg, kreisFahrt, kreisGrenze, lenkBedarf, heckReaktion, gasInKurve, handbremsDrift, rueckwaerts, DT };
}

// Alle Messungen der Tabelle B3 (ohne Testfahrer) für das Profil, das gerade in CONFIG steht
export function alleMessungen(m) {
  const r = {};
  for (const art of ['asphalt', 'schotter', 'wiesenweg', 'bankett']) r[`beschl100_${art}`] = m.beschleunigung(art, 100);
  // Gras: 100 km/h erreicht das Auto auf der Wiese nie (Rollwiderstand), darum 0 auf 60
  r.beschl60_gras = m.beschleunigung('gras', 60);
  r.beschl60_asphalt = m.beschleunigung('asphalt', 60);
  r.beschl60_schotter = m.beschleunigung('schotter', 60); // M8b (Info): Anfahren auf Schotter, z. B. aus einer Kehre
  r.bremsweg100_asphalt = m.bremsweg('asphalt', 100);
  r.kreis25_asphalt = m.kreisGrenze(25, 'asphalt');
  r.kreis25_schotter = m.kreisGrenze(25, 'schotter');
  r.kreis25_wiesenweg = m.kreisGrenze(25, 'wiesenweg');
  r.lenk80_r60 = m.lenkBedarf(80, 60, 'asphalt');
  r.heck90_r80 = m.heckReaktion(90, 80, 'asphalt', 0.6);
  r.heck90_r80_voll = m.heckReaktion(90, 80, 'asphalt', 1.0);
  r.gas_r80 = m.gasInKurve(80, 60, 'asphalt');
  r.gas_r80_schotter = m.gasInKurve(80, 50, 'schotter');
  r.hb_asphalt = m.handbremsDrift('asphalt');
  r.hb_schotter = m.handbremsDrift('schotter');
  r.rueck_asphalt = m.rueckwaerts('asphalt');
  r.rueck_gras = m.rueckwaerts('gras');
  return r;
}
