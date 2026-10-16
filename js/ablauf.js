// Ablauf des Spiels (seit M5a): eine kleine Zustandsmaschine.
//   titel    Titelbildschirm ("TASTE DRÜCKEN"), dahinter die Demo-Fahrt
//   menue    Hauptmenü und seine Seiten, dahinter die Demo-Fahrt
//   rennen   die Etappe läuft (wie bisher)
//   pause    alles eingefroren, Pausenmenü
// Später (M5b) kommen dazu: countdown (vor dem Start) und ziel (Zielbildschirm).
// Jeder Zustand sagt, was in jedem Bild passiert:
//   welt: 'rennen' (Rennen mit Zeitmessung), 'demo' (Testfahrer fährt, kein Rennstand) oder null (eingefroren)
//   hud: HUD zeigen, menue: Menü zeigen, abdunkeln: so stark die Szene dahinter abdunkeln (0..1)
// M5b hängt neue Zustände mit registriere() ein, z. B.
//   ablauf.registriere('countdown', { welt: null, hud: true, menue: false, abdunkeln: 0, betreten() {...} })

export function baueAblauf() {
  const zustaende = {};
  const beobachter = [];
  let aktuell = null;
  return {
    registriere(name, def) { zustaende[name] = { welt: null, hud: false, menue: false, abdunkeln: 0, ...def }; },
    get zustand() { return aktuell; },
    get def() { return zustaende[aktuell]; },
    ist(...namen) { return namen.includes(aktuell); },
    // In einen anderen Zustand wechseln (verlassen() des alten, betreten() des neuen wird aufgerufen)
    wechsle(name, info) {
      if (!zustaende[name]) throw new Error(`Unbekannter Zustand: ${name}`);
      const alt = aktuell;
      if (alt && zustaende[alt].verlassen) zustaende[alt].verlassen(name);
      aktuell = name;
      if (zustaende[name].betreten) zustaende[name].betreten(alt, info);
      for (const f of beobachter) f(name, alt);
    },
    beiWechsel(f) { beobachter.push(f); },
  };
}
