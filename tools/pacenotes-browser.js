// Grenztempo je Kurve messen (läuft im Browser, gestartet von tools/pacenotes-test.mjs).
// Das Spiel selbst lädt diese Datei nicht.
//
// Für jede Kurve: Das Auto startet kurz vor der Kurve auf der Strassenmitte mit Tempo v, hält dieses
// Tempo (Gas/Bremse) und folgt der Strassenmitte mit dem Lenk-Regler des Testfahrers. Geschafft,
// wenn es ohne Aufprall durchkommt und die Automitte höchstens "spielraum" Meter neben der
// Fahrbahn (also auf dem Bankett) war. Das grösste geschaffte v (Halbierungssuche) ist das Grenztempo.
// Gefahren wird mit der echten Fahrphysik des Spiels (physikSchritt in main.js, mit Getriebe,
// Untergrund, Steigung, Kollisionen).

const winkelNorm = (w) => Math.atan2(Math.sin(w), Math.cos(w));
const begrenze = (w, a, b) => Math.max(a, Math.min(b, w));

// Ein Versuch mit Tempo v. Ergebnis: { ok, grund, maxNeben, vMin (kleinstes Tempo in der Kurve, m/s) }
// vorher = { bis, grenze }: Kurve direkt davor (Ende in Metern, ihr Grenztempo in m/s). Im Anlauf durch
// diese Kurve wird höchstens ihr Grenztempo gefahren, danach v. So zählt nur DIESE Kurve, und bei
// Kurven direkt hintereinander misst man das Tempo, das man wirklich durch die Kurve mitnimmt.
export function fahreKurve(A, kurve, v, spielraum = 1.0, vorher = null) {
  const S = A.strecke, p = A.physik;
  const i0 = Math.max(2, kurve.von - 40), i1 = Math.min(S.anzahl - 3, kurve.bis + 40);
  const vStart = vorher && vorher.bis > i0 ? Math.min(v, vorher.grenze) : v;
  const pruefVon = kurve.von - 5, pruefBis = kurve.bis + 15;
  const w = Math.atan2(S.tx[i0], S.tz[i0]);
  p.reset(S.px[i0], S.pz[i0], w);
  p.vx = Math.sin(w) * vStart; p.vz = Math.cos(w) * vStart; p.vVor = vStart;
  A.getriebe.reset();
  A.rennen.zustand = 'messung'; // keine Zeitmessung, keine Checkpoints
  A.rennen.letztesS = i0;
  let idx = i0, t = 0, letzter = A.kollision.letzterAufprall, maxNeben = -9, vMin = 1e9;
  const q = {};
  while (idx < i1 - 20 && t < 40) {
    // nächster Punkt der Strassenmitte (in der Nähe des letzten)
    let best = idx, bestD = Infinity;
    for (let i = Math.max(i0, idx - 5); i <= Math.min(i1, idx + 20); i++) {
      const d = (S.px[i] - p.x) ** 2 + (S.pz[i] - p.z) ** 2;
      if (d < bestD) { bestD = d; best = i; }
    }
    idx = best;
    const vv = Math.max(0, p.vVor);
    // Lenken wie der Testfahrer: auf einen Punkt etwas voraus zielen
    const voraus = Math.min(i1, idx + Math.round(5 + vv * 0.35));
    const ziel = Math.atan2(S.px[voraus] - p.x, S.pz[voraus] - p.z);
    const lenkung = begrenze(-winkelNorm(ziel - p.richtung) * 2.5, -1, 1);
    const dv = (vorher && idx < vorher.bis ? Math.min(v, vorher.grenze) : v) - vv;
    A.physikSchritt(A.SCHRITT, {
      gas: dv > 0 ? begrenze(dv * 1.0, 0, 1) : 0, bremse: dv < -0.3 ? begrenze(-dv * 0.5, 0, 1) : 0,
      lenkung, handbremse: false, reset: false, debug: false,
    });
    t += A.SCHRITT;
    if (A.kollision.letzterAufprall !== letzter) return { ok: false, grund: 'aufprall', maxNeben, vMin };
    if (idx >= pruefVon && idx <= pruefBis) {
      S.abfrage(p.x, p.z, q);
      const halb = A.CONFIG.belaege[A.netz.belag[idx]].breite / 2;
      const neben = Math.abs(q.seite) - halb;
      if (Math.abs(q.s - idx) < 8) maxNeben = Math.max(maxNeben, neben);
      if (idx >= kurve.von && idx <= kurve.bis) vMin = Math.min(vMin, p.tempo);
      if (neben > spielraum) return { ok: false, grund: 'neben', maxNeben, vMin };
      if (A.welt.bodenBei(p.x, p.z, q).art === 'gras') return { ok: false, grund: 'gras', maxNeben, vMin };
    }
  }
  if (t >= 40) return { ok: false, grund: 'zeit', maxNeben, vMin };
  return { ok: true, maxNeben, vMin };
}

// Grenztempo einer Kurve: Halbierungssuche nach dem grössten v, das noch klappt.
// Ergebnis: grenze (dieses v, m/s), kurve (kleinstes Tempo in der Kurve dabei, m/s = gemessenes Kurventempo),
// vollgas (true = klappt sogar mit vMax)
export function grenzTempo(A, kurve, { vMin = 4, vMax = 55, schritte = 9, spielraum = 1.0, vorher = null } = {}) {
  const oben = fahreKurve(A, kurve, vMax, spielraum, vorher);
  if (oben.ok) return { grenze: vMax, kurve: oben.vMin, vollgas: true, versuche: 1 };
  let lo = vMin, hi = vMax, best = null;
  for (let k = 0; k < schritte; k++) {
    const m = (lo + hi) / 2;
    const r = fahreKurve(A, kurve, m, spielraum, vorher);
    if (r.ok) { lo = m; best = r; } else hi = m;
  }
  return { grenze: lo, kurve: best ? best.vMin : lo, vollgas: false, versuche: schritte + 1 };
}
