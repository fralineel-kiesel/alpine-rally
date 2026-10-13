// Kollisionen mit Bäumen, Steinen und Baumstämmen.
// Jedes Hindernis ist ein Kreis am Boden (bei Bäumen nur der Stamm,
// liegende Stämme sind eine Reihe Kreise).
// Das Auto ist ein Rechteck mit runden Ecken. Die Front ist flach: Fährt man
// gerade auf einen Baum zu, ist das ein frontaler Aufprall, auch wenn der Baum
// nicht genau mittig steht.
// Damit nicht jedes Mal alle Hindernisse geprüft werden müssen, liegen sie
// in einem Raster (Zellen von z. B. 8 m). Geprüft werden nur die Zellen um das Auto.
// Diese Datei kennt kein Three.js – reine Rechnerei.

import { CONFIG } from './config.js';

const begrenze = (w, min, max) => (w < min ? min : w > max ? max : w);

// hindernisse: Liste von { x, z, r }
export function baueKollision(hindernisse) {
  const k = CONFIG.kollision;
  const Z = k.zelle;
  const anzahl = hindernisse.length;
  // Float64, damit die Rasterzelle genau gleich gerechnet wird wie minX/minZ
  const hx = new Float64Array(anzahl), hz = new Float64Array(anzahl), hr = new Float64Array(anzahl);
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity, maxR = 0;
  hindernisse.forEach((h, i) => {
    hx[i] = h.x; hz[i] = h.z; hr[i] = h.r;
    minX = Math.min(minX, h.x); maxX = Math.max(maxX, h.x);
    minZ = Math.min(minZ, h.z); maxZ = Math.max(maxZ, h.z);
    maxR = Math.max(maxR, h.r);
  });
  if (!anzahl) { minX = maxX = minZ = maxZ = 0; }
  const NX = Math.floor((maxX - minX) / Z) + 1, NZ = Math.floor((maxZ - minZ) / Z) + 1;

  // Raster als zwei Listen: pro Zelle "ab wo" und "wie viele" in einer langen Liste
  const zelleVon = (x, z) =>
    begrenze(Math.floor((z - minZ) / Z), 0, NZ - 1) * NX + begrenze(Math.floor((x - minX) / Z), 0, NX - 1);
  const start = new Int32Array(NX * NZ + 1);
  for (let i = 0; i < anzahl; i++) start[zelleVon(hx[i], hz[i]) + 1]++;
  for (let c = 0; c < NX * NZ; c++) start[c + 1] += start[c];
  const fuell = start.slice(0, NX * NZ);
  const liste = new Int32Array(anzahl);
  for (let i = 0; i < anzahl; i++) liste[fuell[zelleVon(hx[i], hz[i])]++] = i;

  // Alle Hindernisse, die einen Kreis (x, z, r) berühren könnten
  function inDerNaehe(x, z, r, rueckruf) {
    const rr = r + maxR;
    if (x + rr < minX || x - rr > maxX + Z || z + rr < minZ || z - rr > maxZ + Z) return;
    const x0 = begrenze(Math.floor((x - rr - minX) / Z), 0, NX - 1), x1 = begrenze(Math.floor((x + rr - minX) / Z), 0, NX - 1);
    const z0 = begrenze(Math.floor((z - rr - minZ) / Z), 0, NZ - 1), z1 = begrenze(Math.floor((z + rr - minZ) / Z), 0, NZ - 1);
    for (let cz = z0; cz <= z1; cz++) {
      for (let cx = x0; cx <= x1; cx++) {
        const c = cz * NX + cx;
        for (let n = start[c]; n < start[c + 1]; n++) rueckruf(liste[n]);
      }
    }
  }

  // Auto-Rechteck: innerer Kern (ohne runde Ecken) und Eckradius
  const ecke = k.eckRadius;
  const kernL = k.autoLaenge / 2 - ecke, kernB = k.autoBreite / 2 - ecke;
  const umkreis = Math.hypot(k.autoLaenge / 2, k.autoBreite / 2);

  // Kontakt zwischen Auto und Hindernissen, wenn das Auto bei (x, z) mit
  // Blickrichtung w steht.
  // 1. das Hindernis finden, das am tiefsten im Auto steckt, und den Punkt am
  //    Auto, an dem es drückt;
  // 2. an diesem Punkt die Richtung der Hindernis-Oberfläche bestimmen. Dabei
  //    zählen auch Nachbarn mit (z. B. die Kreise eines liegenden Stamms) –
  //    so fühlt sich ein Stamm glatt an und nicht wie eine Perlenkette.
  const kontakt = { tiefe: 0, nx: 0, nz: 0 };
  const band = k.glaetten;
  function finde(x, z, w) {
    const fx = Math.sin(w), fz = Math.cos(w);   // vorne
    const lx = Math.cos(w), lz = -Math.sin(w);  // links
    let tiefe = 0, px = 0, pz = 0, nx = 0, nz = 0;
    inDerNaehe(x, z, umkreis, (i) => {
      // Hindernis im Auto-Koordinatensystem (v = vorne, s = links)
      const dx = hx[i] - x, dz = hz[i] - z;
      const v = dx * fx + dz * fz, s = dx * lx + dz * lz;
      // nächster Punkt auf dem Kern des Rechtecks
      const kv = begrenze(v, -kernL, kernL), ks = begrenze(s, -kernB, kernB);
      const ev = v - kv, es = s - ks;
      const d = Math.hypot(ev, es);
      const R = hr[i] + ecke;
      let t, nv, ns; // Tiefe und Richtung vom Hindernis zum Auto (Auto-Koordinaten)
      if (d > 1e-6) {
        t = R - d;
        nv = -ev / d; ns = -es / d;
      } else {
        // Mittelpunkt steckt im Kern (sehr selten): kürzester Weg hinaus
        const tv = kernL - Math.abs(v) + R, ts = kernB - Math.abs(s) + R;
        if (tv < ts) { t = tv; nv = -Math.sign(v || 1); ns = 0; } else { t = ts; nv = 0; ns = -Math.sign(s || 1); }
      }
      if (t <= tiefe) return;
      tiefe = t;
      px = x + kv * fx + ks * lx; pz = z + kv * fz + ks * lz;
      nx = nv * fx + ns * lx; nz = nv * fz + ns * lz;
    });
    if (tiefe <= 0) return null;
    // Oberflächen-Richtung am Druckpunkt (Mittel über die nahen Hindernisse)
    let sx = 0, sz = 0;
    inDerNaehe(px, pz, ecke + band, (i) => {
      const dx = px - hx[i], dz = pz - hz[i];
      const d = Math.hypot(dx, dz);
      const g = hr[i] + ecke + band - d; // Gewicht: je näher, desto wichtiger
      if (g <= 0 || d < 1e-6) return;
      sx += (g * dx) / d; sz += (g * dz) / d;
    });
    const l = Math.hypot(sx, sz);
    if (l > 1e-9 && (sx * nx + sz * nz) / l > 0.3) { nx = sx / l; nz = sz / l; }
    kontakt.tiefe = tiefe; kontakt.nx = nx; kontakt.nz = nz;
    return kontakt;
  }

  const kol = {
    anzahl,
    letzterAufprall: null, // { vorher, nachher } in m/s

    // Nach einem Physik-Schritt: Hat das Auto auf dem Weg von (xAlt, zAlt)
    // zur neuen Position ein Hindernis getroffen? Der Weg wird in kurzen
    // Stücken abgefahren, damit man auch bei Höchsttempo nicht durch einen
    // Stamm rutscht.
    loese(physik, xAlt, zAlt, wAlt) {
      if (!anzahl) return false;
      const weg = Math.hypot(physik.x - xAlt, physik.z - zAlt);
      const teile = Math.max(1, Math.ceil(weg / k.pruefSchritt));
      let dw = physik.richtung - wAlt;
      dw = Math.atan2(Math.sin(dw), Math.cos(dw));
      let treffer = null;
      for (let t = 1; t <= teile && !treffer; t++) {
        const f = t / teile;
        const x = xAlt + (physik.x - xAlt) * f, z = zAlt + (physik.z - zAlt) * f, w = wAlt + dw * f;
        treffer = finde(x, z, w);
        if (treffer) { physik.x = x; physik.z = z; physik.richtung = w; }
      }
      if (!treffer) return false;
      const vorher = physik.tempo;
      let wucht = 0, winkel = 0;
      // höchstens ein paar Runden, falls das Auto zwei Hindernisse zugleich berührt
      for (let runde = 0; runde < 4 && treffer; runde++) {
        const st = this.stoss(physik, treffer);
        if (runde === 0) winkel = st.winkel;
        wucht = Math.max(wucht, st.wucht);
        treffer = finde(physik.x, physik.z, physik.richtung);
      }
      // für F3: Tempo vor und nach dem Aufprall (winkel: 0° = frontal, 90° = streifend)
      if (wucht > 1.5) this.letzterAufprall = { vorher, nachher: physik.tempo, winkel };
      return true;
    },

    // Reaktion auf einen Kontakt (c.nx/c.nz zeigt vom Hindernis zum Auto).
    // Ergebnis: Wucht (Tempo Richtung Hindernis) und Aufprallwinkel (Grad)
    stoss(physik, c) {
      // 1. aus dem Hindernis schieben (ein Hauch mehr, damit nichts klebt)
      physik.x += c.nx * (c.tiefe + 0.002);
      physik.z += c.nz * (c.tiefe + 0.002);

      const vn = physik.vx * c.nx + physik.vz * c.nz; // < 0 = fährt aufs Hindernis zu
      if (vn >= 0) return { wucht: 0, winkel: 90 };
      const winkel = Math.acos(Math.min(1, -vn / physik.tempo)) * 180 / Math.PI;
      const tx = -c.nz, tz = c.nx; // entlang des Hindernisses
      const vt = physik.vx * tx + physik.vz * tz;
      const stossTempo = -vn;

      // 2. Tempo Richtung Hindernis ist weg, nur ein winziger Rückprall
      const vnNeu = stossTempo * k.rueckprall;
      // 3. Tempo entlang des Hindernisses: Reibung, die mit der Wucht des
      //    Aufpralls wächst. Frontal (viel Wucht, wenig Rutschen) bleibt
      //    nichts übrig, beim Streifschuss (wenig Wucht) fast alles.
      const vtNeu = Math.sign(vt) * Math.max(0, Math.abs(vt) - stossTempo * k.reibung);
      physik.vx = c.nx * vnNeu + tx * vtNeu;
      physik.vz = c.nz * vnNeu + tz * vtNeu;
      // Der Aufprall stoppt auch ein Drehen des Autos
      physik.drehrate *= k.drehBremse;
      // Rutscht das Auto am Hindernis entlang, drückt es die Schnauze (oder das
      // Heck) sanft parallel zum Hindernis. Frontal (kein Rutschen) dreht nichts.
      const rutschen = Math.abs(vtNeu) / Math.max(physik.tempo, 0.1);
      let alpha = Math.atan2(tx, tz) - physik.richtung; // Winkel Blickrichtung -> Hindernis-Linie
      alpha = Math.atan2(Math.sin(alpha), Math.cos(alpha));
      if (alpha > Math.PI / 2) alpha -= Math.PI; else if (alpha < -Math.PI / 2) alpha += Math.PI;
      const dreh = Math.min(Math.abs(alpha), k.ausrichten * stossTempo * rutschen);
      physik.richtung += Math.sign(alpha) * dreh;
      return { wucht: stossTempo, winkel };
    },
  };
  return kol;
}
