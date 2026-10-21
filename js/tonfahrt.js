// Feste kurze Fahrt für den Motor-Vergleich (Meilenstein 8d): Ton-Labor (Knopf VERGLEICH und je Auto ein Knopf) und
// tools/ton-messung.mjs (Spektrogramm je Auto) fahren genau dieselbe Fahrt, damit man die Autos direkt vergleichen kann.
// Mit dem echten Getriebe des gewählten Fahrprofils (Gänge, Schaltpausen, Turbo) und einer einfachen Fahrt geradeaus:
//   Leerlauf -> Vollgas aus dem Stand durch zwei Gänge (1. -> 2. -> 3., mit Schalten) -> Gas weg (Pops) -> Bremsen, Leerlauf
// Ergebnis jedes Schritts: die Zahlen, die der Ton braucht (wie tonZ in main.js). Diese Datei kennt kein Three.js.

export const TON_FAHRT = {
  // [bis Sekunde, was]: leerlauf (steht), gas (Vollgas), schub (Gas weg, rollt), bremsen (bis zum Stand), dann Leerlauf
  phasen: [[1.5, 'leerlauf'], [5.8, 'gas'], [6.5, 'schub'], [7.6, 'bremsen'], [8.0, 'leerlauf']],
  dauer: 8,
  schritt: 1 / 120,          // Physik-Schritt (wie im Spiel)
  luft: 0.0004, rollen: 0.15, // einfache Fahrwiderstände (wie die Anfahr-Demo im Ton-Labor)
  bremse: 20,                // Bremsen: m/s² (bis zum Stand)
};

// Getriebe: die Klasse aus js/getriebe.js (für das gerade gewählte Fahrprofil gebaut)
export function baueTonFahrt(Getriebe) {
  const F = TON_FAHRT, g = new Getriebe();
  const z = { t: 0, phase: 'leerlauf', gas: 0, drehzahl: 0, gang: 1, zielGang: 1, schaltet: false, tempo: 0, ladedruck: 0, fertig: false };
  let v = 0, rest = 0;
  return {
    zustand: z, getriebe: g,
    // dt Sekunden weiter (beliebig, intern in festen Schritten)
    schritt(dt) {
      rest += dt;
      while (rest >= F.schritt) {
        rest -= F.schritt;
        z.t += F.schritt;
        const p = F.phasen.find(([bis]) => z.t < bis);
        z.phase = p ? p[1] : 'leerlauf';
        z.fertig = z.t >= F.dauer;
        const gas = z.phase === 'gas' ? 1 : 0;
        const m = g.schritt(F.schritt, { gas, bremse: 0 }, v, v, 1, 'asphalt');
        let a = m.beschl - m.motorbremse * (gas ? 0 : 1) - F.luft * v * v - (v > 0 ? F.rollen : 0);
        if (z.phase === 'bremsen') a -= F.bremse;
        v = Math.max(0, v + a * F.schritt);
        if (z.phase === 'leerlauf' && z.t > 1) v = 0;
        z.gas = gas;
      }
      z.drehzahl = g.drehzahl; z.gang = g.gang; z.zielGang = g.zielGang; z.schaltet = g.schaltet; z.tempo = v; z.ladedruck = g.ladedruck;
      return z;
    },
  };
}
