// Getriebe und Motor (Meilenstein 1.2): 5 Gänge plus Rückwärts, Automatik mit
// kurzer Schaltpause wie bei einem Handschalter.
// Rechnet pro Physik-Schritt aus, wie stark der Motor gerade antreibt (m/s²) und
// wie stark er ohne Gas bremst (Motorbremse, m/s²). Das gibt main.js an die
// Fahrphysik weiter. Dazu Gang und Drehzahl für die Anzeige.
// Diese Datei kennt kein Three.js – reine Rechnerei. Alle Werte: config.js "getriebe".
//
// Gang: -1 = Rückwärts (R), 0 = Leerlauf (N), 1 bis 5 = Vorwärtsgänge.

import { CONFIG } from './config.js';

const begrenze = (w, min, max) => (w < min ? min : w > max ? max : w);
const mische = (a, b, t) => a + (b - a) * t;

// Drehmoment-Anteil (0..1) bei einer Drehzahl, aus der Kurve in config.js
export function drehmoment(drehzahl) {
  const k = CONFIG.getriebe.drehmoment;
  if (drehzahl <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) {
    if (drehzahl <= k[i][0]) {
      const [d0, m0] = k[i - 1], [d1, m1] = k[i];
      return mische(m0, m1, (drehzahl - d0) / (d1 - d0));
    }
  }
  return k[k.length - 1][1];
}

// Drehzahl in einem Gang bei Tempo v (m/s)
export function drehzahlBei(v, gang) {
  const g = CONFIG.getriebe;
  return (Math.max(0, v) * 3.6 / g.gaenge[gang - 1]) * g.nennDrehzahl;
}

// Passender Gang für ein Tempo (z. B. wenn das Auto schon rollt): der tiefste,
// in dem die Drehzahl nicht über 85 % der Vollgas-Schaltdrehzahl liegt
export function gangFuer(v) {
  const g = CONFIG.getriebe;
  for (let n = 1; n < g.gaenge.length; n++) if (drehzahlBei(v, n) <= g.hochVollgas * 0.85) return n;
  return g.gaenge.length;
}

export class Getriebe {
  constructor() {
    this.reset();
  }

  // Stillstand, Leerlauf
  reset() {
    this.gang = 0;            // eingelegter Gang (während der Schaltpause noch der alte)
    this.zielGang = 0;        // in diesen Gang wird gerade geschaltet
    this.schaltet = false;    // läuft gerade eine Schaltpause?
    this.schaltRest = 0;      // so viele Sekunden dauert die Schaltpause noch
    this.sperre = 99;         // Sekunden seit dem letzten Schaltvorgang
    this.drehzahl = CONFIG.getriebe.leerlauf; // angezeigte Drehzahl (weich nachgeführt)
    this.standZeit = 0;       // wie lange das Auto schon ohne Gas und Bremse steht
    this.gasGlatt = 0;        // geglättetes Gaspedal (für die Schaltpunkte)
    this.letzteSchaltung = null; // { von, nach, tempo } für Tests
  }

  // Für die Anzeige: 'R', 'N' oder '1' bis '5'
  get anzeige() {
    return this.gang < 0 ? 'R' : this.gang === 0 ? 'N' : String(this.gang);
  }

  // Schaltpause beginnen
  schalte(nach, v) {
    const g = CONFIG.getriebe;
    this.zielGang = nach;
    this.schaltet = true;
    this.schaltRest = nach > this.gang ? g.schaltDauerHoch : g.schaltDauerRunter;
    this.letzteSchaltung = { von: this.gang, nach, tempo: v };
  }

  // Ein Schritt. eingabe: { gas, bremse } (0..1), vVor: Tempo in Blickrichtung (m/s),
  // tempo: Gesamttempo (m/s, beim Driften grösser als vVor), grip: Haftung des Bodens.
  // Ergebnis: { beschl: Antrieb in m/s², motorbremse: Motorbremse in m/s² }
  schritt(dt, eingabe, vVor, tempo, grip) {
    const g = CONFIG.getriebe;
    const gas = eingabe.gas, bremse = eingabe.bremse;
    this.sperre += dt;
    // Gaspedal geglättet (schnell rauf, langsam runter): kurzes Lupfen oder Zucken am
    // Gas soll nicht gleich hoch- oder runterschalten
    const tau = gas > this.gasGlatt ? g.gasGlattRauf : g.gasGlattRunter;
    this.gasGlatt += (gas - this.gasGlatt) * (1 - Math.exp(-dt / tau));
    // Tempo der Räder vorwärts (beim Driften zählt das ganze Tempo)
    const v = vVor > 0 ? Math.max(vVor, tempo) : 0;

    // --- Schaltpause läuft ---
    if (this.schaltet) {
      this.schaltRest -= dt;
      if (this.schaltRest <= 0) {
        this.gang = this.zielGang;
        this.schaltet = false;
        this.schaltRest = 0;
        this.sperre = 0;
      }
    }

    // --- Rückwärts und Leerlauf (ohne Schaltpause) ---
    // (gleiche Bedingungen wie in der Fahrphysik: Bremse im Stand = rückwärts, Gas ab -0.5 m/s = vorwärts)
    const vorwaerts = gas > 0.05 && vVor > -0.5;
    const rueckwaerts = !vorwaerts && (vVor < -0.3 || (bremse > 0 && vVor <= 0.5 && gas < 0.1));
    if (rueckwaerts) {
      this.gang = -1; this.zielGang = -1; this.schaltet = false; this.schaltRest = 0;
    } else if (this.gang <= 0) {
      if (vorwaerts || vVor > 0.3) { this.gang = gangFuer(v); this.zielGang = this.gang; this.sperre = 0; }
    }
    if (!rueckwaerts && Math.abs(vVor) < 0.3 && gas < 0.05 && bremse < 0.05) {
      this.standZeit += dt;
      if (this.standZeit > g.leerlaufNach && !this.schaltet) { this.gang = 0; this.zielGang = 0; }
    } else {
      this.standZeit = 0;
    }

    let beschl = 0, motorbremse = 0, ziel;
    if (this.gang <= 0) {
      // R oder N: Antrieb rückwärts rechnet die Fahrphysik wie bisher
      motorbremse = gas < 0.05 ? CONFIG.auto.motorbremse : 0;
      const rpmR = this.gang < 0 ? drehzahlBei(-vVor, 1) : 0;
      ziel = Math.max(g.leerlauf + (this.gang < 0 ? bremse : 0) * (g.kupplungDrehzahl - g.leerlauf), rpmR);
    } else {
      const rpm = drehzahlBei(v, this.gang);

      // --- Automatik: Schaltpunkte ---
      if (!this.schaltet && this.sperre >= g.schaltSperre && g.modus === 'automatik') {
        const bremsen = bremse > 0.1;
        // ohne Gas erst spät hochschalten (beim Rollen kein Hin und Her), beim Bremsen gar nicht
        const hoch = bremsen ? Infinity : gas < 0.05 ? g.hochVollgas : mische(g.hochWenigGas, g.hochVollgas, Math.max(gas, this.gasGlatt));
        // beim Bremsen früher runterschalten (Motorbremse hilft mit)
        const runter = bremsen ? g.runterBremsen : mische(g.runterWenigGas, g.runterVollgas, gas);
        if (this.gang < g.gaenge.length && rpm > hoch) {
          this.schalte(this.gang + 1, v);
        } else if (this.gang > 1 && rpm < runter) {
          // so weit runter, dass die Drehzahl wieder genug hoch ist (beim harten Bremsen auch zwei Gänge)
          let nach = this.gang - 1;
          while (nach > 1 && drehzahlBei(v, nach) < runter * g.runterReserve) nach--;
          this.schalte(nach, v);
        } else if (this.gang > 1 && gas >= g.kickdownGas && this.gasGlatt < g.kickdownGas && rpm < g.kickdownUnter) {
          // Kickdown: tiefster Gang (höchstens zwei tiefer), in dem die Drehzahl unter kickdownMax bleibt
          let nach = 0;
          for (let n = this.gang - 1; n >= Math.max(1, this.gang - 2); n--) if (drehzahlBei(v, n) < g.kickdownMax) nach = n;
          if (nach) this.schalte(nach, v);
        }
      }

      if (this.schaltet) {
        // Kupplung offen: kein Antrieb, keine Motorbremse. Drehzahl geht auf den neuen Gang.
        ziel = Math.max(g.leerlauf, drehzahlBei(v, this.zielGang));
      } else {
        // Anfahren im 1. Gang: Kupplung schleift, das Drehmoment zählt mindestens bei kupplungDrehzahl
        const rpmMotor = Math.max(rpm, g.leerlauf, this.gang === 1 && gas > 0 ? g.kupplungDrehzahl : 0);
        if (gas > 0) {
          beschl = gas * g.zugkraft[this.gang - 1] * drehmoment(rpmMotor);
          beschl = Math.min(beschl, g.traktion * grip); // auf Gras drehen die Räder durch
        }
        if (gas < 0.05) {
          // Motorbremse: niedriger Gang und hohe Drehzahl bremsen mehr (Mittelwert = auto.motorbremse)
          motorbremse = CONFIG.auto.motorbremse * (g.zugkraft[this.gang - 1] / g.zugkraft[g.motorbremseBezugGang - 1]) *
            (Math.max(rpm, g.leerlauf * 1.5) / g.motorbremseBezugDrehzahl);
        }
        ziel = Math.max(rpm, g.leerlauf);
        if (this.gang === 1) ziel = Math.max(ziel, mische(g.leerlauf, g.standgas, gas));
      }
    }

    // Angezeigte Drehzahl weich nachführen (in der Schaltpause etwas langsamer)
    const folgen = this.schaltet ? g.drehzahlFolgenSchalten : g.drehzahlFolgen;
    this.drehzahl += (ziel - this.drehzahl) * (1 - Math.exp(-folgen * dt));
    return { beschl, motorbremse };
  }
}
