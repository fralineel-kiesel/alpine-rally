// Ziele für Meilenstein 8f: Fahrmessung Lanza 073 (fangbar statt Seife) und Subora Imprexa (höhere Drehzahl), dazu die
// Kontrolltests K1 bis K4 („Seifen-Test“ mit der Tastatur-Lenkung wie im Spiel). Benutzt von tools/m8f-test.mjs.
// Das Spiel lädt diese Datei nicht.
//
// Fahrmessung: dieselben Zeilen wie in M8e (tools/m8e-ziele.js); geändert sind nur die drei Lanza-Ziele beim Heck
// (Bremsen in der Kurve, Einfangen, Vollgas in der Kurve) und der Handbremsen-Drift. Alles andere bleibt im Ziel von M8e.
import * as M8E from './m8e-ziele.js';

const I = Infinity;
export const AUTOS_M8F = ['l073', 'imprexa'];
const NEU_L073 = {
  'Heck: Gas weg + Bremse 60 %: Zusatz-Schwimmwinkel nach 0.5 s': [4, 6.5],
  '... wieder eingefangen nach': [0.3, 0.8],
  'Vollgas in der Kurve R 80 m: Schwimmwinkel': [0.5, 2.0],
  'Handbremsen-Drift Asphalt nach 0.5 s': [15, 35],
};
export const ZEILEN = M8E.ZEILEN.map((z) => (NEU_L073[z[0]] ? [z[0], z[1], z[2], NEU_L073[z[0]], z[4], z[5]] : z));
export const pruefeZeile = M8E.pruefeZeile;
export const TESTFAHRER = M8E.TESTFAHRER;

// Kontrolltests mit der Tastatur-Lenkung (Einschlag baut mit steuerung.tastaturLenkTempo auf und geht mit
// tastaturRueckTempo zurück, wie js/input.js). m = baueMessung(...) aus tools/fahrmessung.js, CONFIG = die Einstellungen.
// Schwimmwinkel = p.driftWinkel (Grad), Gierwinkel = Drehung der Blickrichtung gegen den Start (Grad).
const KMH = 1 / 3.6, GRAD = 180 / Math.PI;
function tastatur(CONFIG) {
  const s = CONFIG.steuerung;
  let l = 0;
  // ziel: -1 links, +1 rechts, 0 los (wie input.js)
  return (ziel, dt) => {
    if (ziel !== 0) {
      l += ziel * (Math.sign(ziel) !== Math.sign(l) && l !== 0 ? s.tastaturRueckTempo : s.tastaturLenkTempo) * dt;
      l = Math.max(-1, Math.min(1, l));
    } else {
      const r = s.tastaturRueckTempo * dt;
      l = Math.abs(l) <= r ? 0 : l - Math.sign(l) * r;
    }
    return l;
  };
}

// „Gas gehalten“: das Gas, mit dem das Auto auf diesem Belag geradeaus das Tempo hält (3 s eingeregelt, dann fest)
export function haltegas(m, art, kmh) {
  const b = m.boden(art), p = m.auto(kmh * KMH), DT = m.DT;
  let gas = 0.5, summe = 0, n = 0;
  for (let t = 0; t < 4; t += DT) {
    gas = Math.max(0, Math.min(1, gas + (kmh * KMH - p.vVor) * 0.5 * DT));
    m.schritt(p, { gas, bremse: 0, lenkung: 0, handbremse: false }, b);
    if (t > 3) { summe += gas; n++; }
  }
  return summe / n;
}

// K1/K2: Schotter, 90 km/h, Gas gehalten (haltegas), Tastatur voll links 1.0 s, dann los. K2: ab 0.4 s nach dem
// Loslassen sanft gegenlenken: Taste rechts 0.2 s antippen (der Einschlag baut mit der Tastatur-Rampe nur bis ca.
// 60 % auf; voll gehalten pendeln alle Autos auf die andere Seite). Gemessen: grösster
// Schwimmwinkel und die Zeit ab dem Loslassen, bis der Schwimmwinkel unter 5° fällt und 0.3 s darunter bleibt.
export function kEinlenken(m, CONFIG, { gegen = false, art = 'schotter', kmh = 90, gas = null } = {}) {
  const g = gas ?? haltegas(m, art, kmh);
  const b = m.boden(art), p = m.auto(kmh * KMH), DT = m.DT, lenk = tastatur(CONFIG);
  let max = 0, gerade = null, unterSeit = null, dreher = false;
  for (let t = 0; t < 6; t += DT) {
    // gegenlenken: Heck aussen in der Linkskurve = Schwimmwinkel negativ -> Taste rechts (+1)
    const taste = t < 1.0 ? -1 : (gegen && t >= 1.4 && t < 1.6 ? 1 : 0);
    const l = lenk(taste, DT);
    m.schritt(p, { gas: g, bremse: 0, lenkung: l, handbremse: false }, b);
    const d = Math.abs(p.driftWinkel);
    max = Math.max(max, d);
    if (d > 60) dreher = true;
    if (t >= 1.0) {
      if (d < 5) { if (unterSeit === null) unterSeit = t; if (gerade === null && t - unterSeit >= 0.3) gerade = unterSeit - 1.0; }
      else unterSeit = null;
    }
  }
  return { max, gerade, dreher, gas: g };
}

// K3: Asphalt, 120 km/h, Gas gehalten, Slalom mit der Tastatur: je 1 s links, rechts, links ... (6 s). Grösster
// Gierwinkel gegen die Startrichtung und grösster Schwimmwinkel.
export function kSlalom(m, CONFIG, { art = 'asphalt', kmh = 120 } = {}) {
  const g = haltegas(m, art, kmh);
  const b = m.boden(art), p = m.auto(kmh * KMH), DT = m.DT, lenk = tastatur(CONFIG), r0 = p.richtung;
  let gier = 0, schwimm = 0;
  for (let t = 0; t < 6; t += DT) {
    const l = lenk(Math.floor(t) % 2 === 0 ? -1 : 1, DT);
    m.schritt(p, { gas: g, bremse: 0, lenkung: l, handbremse: false }, b);
    gier = Math.max(gier, Math.abs(p.richtung - r0) * GRAD);
    schwimm = Math.max(schwimm, Math.abs(p.driftWinkel));
  }
  return { gier, schwimm, tempoEnde: p.tempo / KMH };
}

// K4: Wiesenweg, 60 km/h, Vollgas, leichter Einschlag (Stick 25 % links) 3 s. Gemessen: wie weit das Auto in dieser
// Zeit seitlich wegrutscht (Weg quer zur eigenen Blickrichtung, aufsummiert) und der grösste Schwimmwinkel.
export function kWiese(m, CONFIG, { art = 'wiesenweg', kmh = 60, einschlag = 0.25 } = {}) {
  const b = m.boden(art), p = m.auto(kmh * KMH), DT = m.DT;
  let quer = 0, schwimm = 0;
  for (let t = 0; t < 3; t += DT) {
    m.schritt(p, { gas: 1, bremse: 0, lenkung: -einschlag, handbremse: false }, b);
    quer += Math.abs(p.vSeit) * DT;
    schwimm = Math.max(schwimm, Math.abs(p.driftWinkel));
  }
  return { quer, schwimm };
}

export function kontrollMessungen(m, CONFIG) {
  return { k1: kEinlenken(m, CONFIG), k2: kEinlenken(m, CONFIG, { gegen: true }), k3: kSlalom(m, CONFIG), k4: kWiese(m, CONFIG) };
}
// [Text, Wert(k), Ziel Lanza [min, max], Einheit]
export const K_ZEILEN = [
  ['K1 Schotter 90 km/h, voll links 1 s, dann los: grösster Schwimmwinkel', (k) => k.k1.max, [-I, 25], '°'],
  ['K1 ... gerade (unter 5°) nach dem Loslassen, ohne Gegenlenken', (k) => k.k1.gerade, [0, 1.2], 's'],
  ['K2 wie K1, 0.4 s nach dem Loslassen 0.2 s gegenlenken (Taste): gefangen nach', (k) => k.k2.gerade, [0, 0.8], 's'],
  ['K3 Slalom Asphalt 120 km/h (je 1 s): grösster Gierwinkel', (k) => k.k3.gier, [-I, 60], '°'],
  ['K4 Wiesenweg 60 km/h, Vollgas, leichter Einschlag 3 s: seitlich gerutscht', (k) => k.k4.quer, [-I, 4], 'm'],
];
