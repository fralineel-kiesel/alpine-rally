// Ablauf des Spiels (seit M5a): eine kleine Zustandsmaschine.
//   titel    Titelbildschirm ("TASTE DRÜCKEN"), dahinter die Demo-Fahrt
//   menue    Hauptmenü und seine Seiten, dahinter die Demo-Fahrt
//   rennen   die Etappe läuft (wie bisher)
//   pause    alles eingefroren, Pausenmenü
//   countdown (seit M5b) 3 - 2 - 1 - GO vor dem Start: Welt läuft, Auto gesperrt, HUD ohne Menü
//   ziel     (seit M5b) Zielbildschirm: Welt läuft weiter (Auto rollt aus), abgedunkelt, Menü-Tafel
// Die Zustände werden in main.js eingehängt (registriere). Jeder Zustand sagt, was in jedem Bild passiert:
//   welt: 'rennen' (Rennen mit Zeitmessung), 'demo' (Testfahrer fährt, kein Rennstand) oder null (eingefroren)
//   hud: HUD zeigen, menue: Menü zeigen, abdunkeln: so stark die Szene dahinter abdunkeln (0..1)
// Beispiel: ablauf.registriere('countdown', { welt: 'rennen', hud: true, betreten() {...} })

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
