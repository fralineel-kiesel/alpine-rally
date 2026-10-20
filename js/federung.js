// Federung der Karosserie (Meilenstein 8a): Feder und Dämpfer (zweiter Ordnung) für Nicken, Rollen und Hub.
// Nur Optik: liest Beschleunigungen aus der Physik, ändert aber nie etwas daran. Die Kamera folgt dem Auto, nicht der
// Karosserie, und wird darum nicht mitgeschüttelt. Werte: config.js, autoOptik.feder.
//
//   Nicken: Längsbeschleunigung (Bremsen = Nase taucht, Gas = Heck setzt sich)
//   Rollen: Querbeschleunigung (in der Kurve lehnt die Karosserie nach aussen)
//   Hub:    Senkrechtbeschleunigung aus dem Gelände (Senke = federt ein, Kuppe = federt aus)
//   Stoss:  ein Aufprall gibt der Karosserie einen Schwung (einmal, dann schwingt sie aus)
// Jede Achse folgt ihrem Ziel wie eine gedämpfte Feder: x'' = -w² (x - Ziel) - 2 d w x' (w = 2 pi Frequenz).
// Kein Abfall pro Bild: der Zustand liegt in vorab angelegten Zahlenfeldern. Diese Datei kennt kein Three.js.

import { CONFIG } from './config.js';

const GRAD = Math.PI / 180;
const UNTERSCHRITT = 1 / 240; // so fein wird gerechnet (stabil auch bei langsamen Bildern)

export function baueFederung() {
  const x = new Float64Array(3);   // Nicken (rad), Rollen (rad), Hub (m)
  const v = new Float64Array(3);   // ... und wie schnell sie sich ändern
  const ziel = new Float64Array(3);
  const grenze = new Float64Array(3);
  const schwung = new Float64Array(3); // gesammelte Stösse bis zum nächsten Schritt

  const f = {
    nicken: 0, rollen: 0, hub: 0, x, v,
    // dt: Sekunden seit dem letzten Bild; beschlVor/beschlSeit (m/s², aus physics.js), beschlSenk (m/s², Gelände)
    schritt(dt, beschlVor, beschlSeit, beschlSenk) {
      const F = CONFIG.autoOptik.feder;
      if (!F || !F.an) { f.reset(); return f; }
      grenze[0] = F.nickenMax * GRAD; grenze[1] = F.rollenMax * GRAD; grenze[2] = F.hubMax;
      ziel[0] = -beschlVor * F.nicken;
      ziel[1] = beschlSeit * F.rollen;
      ziel[2] = -beschlSenk * F.hub;
      for (let k = 0; k < 3; k++) {
        if (!Number.isFinite(ziel[k])) ziel[k] = 0;
        ziel[k] = Math.max(-grenze[k], Math.min(grenze[k], ziel[k]));
        v[k] += schwung[k];
        schwung[k] = 0;
      }
      const w = 2 * Math.PI * F.frequenz, d = 2 * F.daempfung * w, w2 = w * w;
      let rest = Math.min(dt, 0.25);
      while (rest > 1e-9) {
        const h = Math.min(UNTERSCHRITT, rest);
        rest -= h;
        for (let k = 0; k < 3; k++) {
          v[k] += (-w2 * (x[k] - ziel[k]) - d * v[k]) * h;
          x[k] += v[k] * h;
          // Anschlag: nie über die Grenze, dort bleibt die Bewegung stehen
          if (x[k] > grenze[k]) { x[k] = grenze[k]; if (v[k] > 0) v[k] = 0; }
          else if (x[k] < -grenze[k]) { x[k] = -grenze[k]; if (v[k] < 0) v[k] = 0; }
        }
      }
      f.nicken = x[0]; f.rollen = x[1]; f.hub = x[2];
      return f;
    },
    // Aufprall: dLaengs/dQuer = Tempoänderung durch den Aufprall im Auto (m/s; frontal = negativ längs)
    stoss(dLaengs, dQuer = 0) {
      const F = CONFIG.autoOptik.feder;
      if (!F || !F.an || !Number.isFinite(dLaengs) || !Number.isFinite(dQuer)) return;
      const staerke = Math.sqrt(dLaengs * dLaengs + dQuer * dQuer);
      if (!(staerke >= F.stossAb)) return;
      schwung[0] += -dLaengs * F.stossNicken;
      schwung[1] += dQuer * F.stossRollen;
      schwung[2] += staerke * F.stossHub;
    },
    reset() {
      x.fill(0); v.fill(0); schwung.fill(0);
      f.nicken = 0; f.rollen = 0; f.hub = 0;
    },
  };
  return f;
}
