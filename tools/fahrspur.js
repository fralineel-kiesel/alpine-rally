// Prüfsumme einer festen Fahrt (Meilenstein 8a), ohne Browser. Benutzt von tools/auto-test.mjs (g)/(i):
// Physik und Getriebe fahren 70 s ein festes Programm (Anfahren, Schalten, Kurven, Bremsen, Handbremse, Rückwärts,
// alle Beläge, Steigung). Jeder Zustand (Ort, Tempo, Drehung, Gang, Drehzahl, Antrieb) geht in die Prüfsumme.
// Gleiche Summe = bit-genau gleiches Fahrverhalten. Das Spiel selbst lädt diese Datei nicht.

export function fahrspurPruefsumme({ CONFIG, Fahrphysik, Getriebe }) {
  const DT = 1 / 120;
  const p = new Fahrphysik(), g = new Getriebe();
  p.reset(0, 0, 0);
  const zahlen = new Float64Array(1);
  const bytes = new Uint8Array(zahlen.buffer);
  let h = 0x811c9dc5 >>> 0, ladedruckMax = 0, n = 0;
  const misch = (w) => { zahlen[0] = w; for (let i = 0; i < 8; i++) { h ^= bytes[i]; h = Math.imul(h, 0x01000193) >>> 0; } };
  const ARTEN = ['asphalt', 'bankett', 'gras', 'schotter', 'wiesenweg'];
  for (let t = 0; t < 70; t += DT) {
    const abschnitt = Math.floor(t / 7) % 10;
    const art = ARTEN[Math.floor(t / 3.5) % ARTEN.length];
    const u = CONFIG.untergrund[art];
    const e = { gas: 0, bremse: 0, lenkung: 0, handbremse: false };
    if (abschnitt === 0) e.gas = 1;
    else if (abschnitt === 1) { e.gas = 1; e.lenkung = Math.sin(t * 1.3) * 0.8; }
    else if (abschnitt === 2) { e.gas = 0.4; e.lenkung = 0.6; }
    else if (abschnitt === 3) { e.bremse = 0.7; e.lenkung = -0.4; }
    else if (abschnitt === 4) { e.gas = 0.3; e.lenkung = 1; e.handbremse = (t % 7) < 1.2; }
    else if (abschnitt === 5) { e.gas = (t % 2) < 1 ? 1 : 0; e.lenkung = -0.3; }
    else if (abschnitt === 6) { e.bremse = 1; }
    else if (abschnitt === 7) { e.bremse = 1; e.lenkung = 0.5; } // im Stand: rückwärts
    else if (abschnitt === 8) { e.gas = 1; e.lenkung = -1; }
    else { e.gas = 0.7; e.lenkung = Math.sin(t * 0.7); }
    const boden = {
      grip: u.grip, rollen: u.rollen, rollenTempo: u.rollenTempo, steigung: Math.sin(t * 0.21) * 0.08,
      rueckwaerts: u.rueckwaerts ?? 1, heck: u.heck ?? 1, stabilitaet: u.stabilitaet ?? 1, geradeaus: u.geradeaus ?? 1,
      rueckwaertsMax: u.rueckwaertsMax ?? 1, belag: art,
    };
    const m = g.schritt(DT, e, p.vVor, p.tempo, u.grip, art);
    p.schritt(DT, e, boden, m);
    for (const w of [p.x, p.z, p.vx, p.vz, p.richtung, p.drehrate, p.lenkwinkel, g.gang, g.drehzahl, m.beschl, m.motorbremse]) misch(w);
    ladedruckMax = Math.max(ladedruckMax, g.ladedruck || 0);
    n++;
  }
  return { summe: h.toString(16).padStart(8, '0'), schritte: n, ladedruckMax, ende: { x: p.x, z: p.z } };
}
