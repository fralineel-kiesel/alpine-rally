// Kollisionen mit Bäumen und Steinen.
// Jedes Hindernis ist ein Kreis am Boden (bei Bäumen nur der Stamm).
// Das Auto wird durch 3 Kreise angenähert (vorne, Mitte, hinten).
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
  const hx = new Float32Array(anzahl), hz = new Float32Array(anzahl), hr = new Float32Array(anzahl);
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
  const zelleVon = (x, z) => Math.floor((z - minZ) / Z) * NX + Math.floor((x - minX) / Z);
  const start = new Int32Array(NX * NZ + 1);
  for (let i = 0; i < anzahl; i++) start[zelleVon(hx[i], hz[i]) + 1]++;
  for (let c = 0; c < NX * NZ; c++) start[c + 1] += start[c];
  const fuell = start.slice(0, NX * NZ);
  const liste = new Int32Array(anzahl);
  for (let i = 0; i < anzahl; i++) liste[fuell[zelleVon(hx[i], hz[i])]++] = i;

  // Alle Hindernisse, die einen Kreis (x, z, r) berühren könnten
  function inDerNaehe(x, z, r, rueckruf) {
    const rr = r + maxR;
    const x0 = begrenze(Math.floor((x - rr - minX) / Z), 0, NX - 1), x1 = begrenze(Math.floor((x + rr - minX) / Z), 0, NX - 1);
    const z0 = begrenze(Math.floor((z - rr - minZ) / Z), 0, NZ - 1), z1 = begrenze(Math.floor((z + rr - minZ) / Z), 0, NZ - 1);
    if (x + rr < minX || x - rr > maxX + Z || z + rr < minZ || z - rr > maxZ + Z) return;
    for (let cz = z0; cz <= z1; cz++) {
      for (let cx = x0; cx <= x1; cx++) {
        const c = cz * NX + cx;
        for (let n = start[c]; n < start[c + 1]; n++) rueckruf(liste[n]);
      }
    }
  }

  // Tiefster Kontakt zwischen den Auto-Kreisen und den Hindernissen,
  // wenn das Auto bei (x, z) mit Blickrichtung w steht.
  const kontakt = { tiefe: 0, nx: 0, nz: 0, px: 0, pz: 0, i: -1 };
  function finde(x, z, w) {
    const fx = Math.sin(w), fz = Math.cos(w);
    kontakt.tiefe = 0; kontakt.i = -1;
    for (const kreis of k.autoKreise) {
      const cx = x + fx * kreis.versatz, cz = z + fz * kreis.versatz;
      inDerNaehe(cx, cz, kreis.r, (i) => {
        const dx = cx - hx[i], dz = cz - hz[i];
        const d = Math.hypot(dx, dz);
        const tiefe = kreis.r + hr[i] - d;
        if (tiefe <= kontakt.tiefe) return;
        // Richtung vom Hindernis zum Auto-Kreis (bei genau gleichem Punkt: nach hinten)
        const nx = d > 1e-6 ? dx / d : -fx, nz = d > 1e-6 ? dz / d : -fz;
        kontakt.tiefe = tiefe; kontakt.i = i;
        kontakt.nx = nx; kontakt.nz = nz;
        // Berührpunkt am Rand des Hindernisses
        kontakt.px = hx[i] + nx * hr[i]; kontakt.pz = hz[i] + nz * hr[i];
      });
    }
    return kontakt.i >= 0 ? kontakt : null;
  }

  const kol = {
    anzahl,
    letzterAufprall: null, // { vorher, nachher } in m/s
    restRuck: 0,           // noch zu drehender Teil des Aufprall-Rucks (rad)
    ruhigZeit: 0,          // so lange wird die Drehung nach dem Aufprall noch gedämpft (s)

    // Nach einem Physik-Schritt: Hat das Auto auf dem Weg von (xAlt, zAlt)
    // zur neuen Position ein Hindernis getroffen? Der Weg wird in kurzen
    // Stücken abgefahren, damit man auch bei Höchsttempo nicht durch einen
    // Stamm rutscht.
    loese(physik, xAlt, zAlt, wAlt, dt) {
      if (!anzahl) return false;
      // Ruck vom letzten Aufprall: Auto dreht sich schnell, aber nicht in einem Bild
      if (this.restRuck) {
        const d = Math.sign(this.restRuck) * Math.min(Math.abs(this.restRuck), k.ruckTempo * dt);
        physik.richtung += d;
        wAlt += d;
        this.restRuck -= d;
      }
      // Kurz nach dem Aufprall: Drehung dämpfen, damit das Auto nicht überdreht
      if (this.ruhigZeit > 0) {
        this.ruhigZeit -= dt;
        physik.drehrate *= Math.exp(-k.drehDaempfung * dt);
      }
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
      // höchstens ein paar Runden, falls das Auto zwei Hindernisse zugleich berührt
      for (let runde = 0; runde < 3 && treffer; runde++) {
        this.stoss(physik, treffer);
        treffer = finde(physik.x, physik.z, physik.richtung);
      }
      return true;
    },

    // Reaktion auf einen Kontakt
    stoss(physik, c) {
      // 1. aus dem Hindernis schieben (ein Hauch mehr, damit nichts klebt)
      physik.x += c.nx * (c.tiefe + 0.002);
      physik.z += c.nz * (c.tiefe + 0.002);

      // Schaut das Auto ins Hindernis, dreht es sich langsam davon weg
      // (sonst bleibt es mit Gas frontal am Baum kleben)
      const fx = Math.sin(physik.richtung), fz = Math.cos(physik.richtung);
      if (fx * -c.nx + fz * -c.nz > 0.3) {
        const links = (c.px - physik.x) * fz - (c.pz - physik.z) * fx; // + = Hindernis links
        physik.richtung += (links >= 0 ? -1 : 1) * k.wegDrehen; // + = nach links drehen
      }

      const vn = physik.vx * c.nx + physik.vz * c.nz; // < 0 = fährt aufs Hindernis zu
      if (vn >= 0) return;
      const vorher = physik.tempo;

      // Seitliche Richtung am Hindernis (entlang der "Oberfläche")
      let tx = -c.nz, tz = c.nx;
      let vt = physik.vx * tx + physik.vz * tz;
      if (Math.abs(vt) < 0.05) {
        // Fast genau frontal: das Auto rutscht zur Seite, auf der das
        // Hindernis weniger im Weg ist (Hindernis links der Automitte -> nach rechts)
        const lx = Math.cos(physik.richtung), lz = -Math.sin(physik.richtung); // "links" vom Auto
        const links = (c.px - physik.x) * lx + (c.pz - physik.z) * lz; // + = Hindernis links
        const wunsch = links >= 0 ? -1 : 1; // weg vom Hindernis
        if ((tx * lx + tz * lz) * wunsch < 0) { tx = -tx; tz = -tz; }
        vt = 0;
      } else if (vt < 0) {
        tx = -tx; tz = -tz; vt = -vt;
      }
      const stossTempo = -vn;
      // Wie frontal war der Aufprall? 1 = genau frontal, 0 = streifend
      const frontal = vorher > 0.1 ? stossTempo / vorher : 1;

      // 2. Tempo Richtung Hindernis fast ganz weg, kleiner Rückprall
      const vnNeu = stossTempo * k.rueckprall;
      // 3. seitlich: etwas Reibung, bei frontalem Aufprall wird das Auto
      //    zusätzlich zur Seite abgelenkt (es "dreht sich um den Baum")
      let vtNeu = Math.max(0, vt - stossTempo * k.reibung) + stossTempo * k.ablenkung * frontal;
      const dvx = c.nx * (vnNeu - vn) + tx * (vtNeu - vt);
      const dvz = c.nz * (vnNeu - vn) + tz * (vtNeu - vt);
      physik.vx += dvx;
      physik.vz += dvz;

      // 4. Drehung: Der Stoss trifft das Auto nicht im Schwerpunkt -> es dreht sich.
      //    Ein Teil passiert sofort (Ruck): Die Schnauze dreht in die Richtung,
      //    in die das Auto am Hindernis vorbeirutscht.
      const fwd = physik.vx * fx + physik.vz * fz;
      const zielX = vtNeu > 0.5 ? tx : physik.vx, zielZ = vtNeu > 0.5 ? tz : physik.vz;
      let alpha = Math.atan2(zielX, zielZ) - physik.richtung;
      alpha = Math.atan2(Math.sin(alpha), Math.cos(alpha));
      // fährt das Auto rückwärts, richtet sich das Heck aus
      if (fwd < 0 && Math.abs(alpha) > Math.PI / 2) alpha -= Math.sign(alpha) * Math.PI;
      const staerke = Math.min(1, stossTempo / k.drehAbTempo);
      const ruck = Math.sign(alpha) * Math.min(Math.abs(alpha) * k.drehRuck, (k.maxRuck * Math.PI) / 180) * staerke;
      // Ein Teil sofort (sonst steht das Auto quer zur Fahrt und die Reifen
      // bremsen es abrupt), der Rest weich in den nächsten Schritten
      const sofort = Math.sign(ruck) * Math.min(Math.abs(ruck), (k.ruckSofort * Math.PI) / 180);
      physik.richtung += sofort;
      this.restRuck = ruck - sofort;
      if (staerke > 0.3) this.ruhigZeit = k.ruhigNach;
      const rx = c.px - physik.x, rz = c.pz - physik.z;
      const hebel = rz * dvx - rx * dvz; // + = dreht wie drehrate
      const dreh = begrenze((k.drehStoss * hebel) / CONFIG.auto.traegheit + ruck * k.drehNachlauf,
        -k.maxDrehung, k.maxDrehung);
      physik.drehrate = physik.drehrate * 0.3 + dreh;

      if (stossTempo > 1.5) this.letzterAufprall = { vorher, nachher: physik.tempo };
    },
  };
  return kol;
}
