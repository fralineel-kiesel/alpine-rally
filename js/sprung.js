// Sprünge mit Flugphase (M10c).
// Drei Teile, alle ohne Three.js (auch für Werkzeuge und Prüfer in Node):
//  1. sprungZonen / profilZusatz: aus dem Streckenfeld "sprung" (docs/strecken-format.md) die Sprungzonen und den
//     Höhen-Zusatz der Strasse (Anlauf, Absprungkante, Landehang, Auslauf). Der Zusatz kommt auf die Höhe der Strasse
//     (track.js), die Draufsicht, die Länge und alle Streckenmeter bleiben gleich.
//  2. pruefeSprung: Regeln für den Prüfer (js/streckenpruefung.js).
//  3. Flugphase: der Zustand "in der Luft" neben der 2D-Fahrphysik (js/physics.js). Abheben nur in einer Sprungzone,
//     echte Ballistik (Tempo und Steigung an der Kante), Landung mit Tempoverlust. Ausserhalb der Zonen rechnet sie
//     nichts und ändert nichts: das Auto am Boden fährt Bit für Bit wie vorher.

const GRAD = Math.PI / 180;
const begrenze = (w, min, max) => (w < min ? min : w > max ? max : w);
const istZahl = (v) => typeof v === 'number' && Number.isFinite(v);

// Standard-Form einer Sprungstelle (Meter bzw. Steigung als Verhältnis, 0.1 = 10 %)
export const FORM_STANDARD = {
  anlauf: 40,     // so lang steigt die Rampe vor der Kante an (Steigung wächst bis "rampe")
  rampe: 0.1,     // Steigung der Rampe an der Kante (mal staerke)
  kante: 4,       // so lang ist die Kante selbst (von der Rampe auf den Landehang)
  gefaelle: 0.15, // Gefälle des Landehangs (bis landeBis)
  auslauf: 30,    // so lang wird der Landehang danach flach
  weich: 20,      // weicher Übergang am Anfang und Ende der Zone (Ausgleich)
};

// Sprungzonen aus dem Streckenfeld: nur Einträge mit von/bis (alte Markierungen { s, name } sind ohne Wirkung)
export function sprungZonen(liste) {
  if (!Array.isArray(liste)) return [];
  const zonen = [];
  for (const sp of liste) {
    if (!sp || !istZahl(sp.von) || !istZahl(sp.bis)) continue;
    const form = { ...FORM_STANDARD, ...(sp.form || {}) };
    zonen.push({
      name: sp.name, s: sp.s, von: sp.von, bis: sp.bis, kante: istZahl(sp.kante) ? sp.kante : sp.s,
      landeVon: sp.landeVon, landeBis: sp.landeBis, staerke: istZahl(sp.staerke) ? sp.staerke : 1, form,
    });
  }
  return zonen;
}

// Höhen-Zusatz einer Zone: Steigung des Zusatzes stückweise linear über u = s - kante, Höhe = Integral davon.
// Damit die Strasse hinter der Zone wieder auf ihrer alten Höhe ist, steigt sie vor der Rampe und nach dem Auslauf
// gleichmässig um "c" (der Ausgleich, aus der Form gerechnet).
function knoten(z, c) {
  const f = z.form, r = f.rampe * z.staerke, b = f.gefaelle;
  const A = z.von - z.kante, E = z.bis - z.kante, L1 = z.landeBis - z.kante, L2 = L1 + f.auslauf;
  const k = [[A, 0], [A + f.weich, c], [-f.anlauf, c], [0, r], [f.kante, -b], [L1, -b], [L2, 0]];
  if (E - L2 > 2 * f.weich) k.push([L2 + f.weich, c], [E - f.weich, c]);
  k.push([E, 0]);
  return k;
}
function hoeheAus(k, u) {
  let h = 0;
  for (let i = 0; i < k.length - 1; i++) {
    const [u0, g0] = k[i], [u1, g1] = k[i + 1];
    if (u <= u0) break;
    const d = Math.min(u, u1) - u0, l = u1 - u0;
    if (l > 0) h += g0 * d + ((g1 - g0) * d * d) / (2 * l);
  }
  return h;
}
export function profilZusatz(z) {
  const E = z.bis - z.kante;
  const h0 = hoeheAus(knoten(z, 0), E), h1 = hoeheAus(knoten(z, 1), E);
  const c = Math.abs(h1 - h0) > 1e-9 ? -h0 / (h1 - h0) : 0;
  const k = knoten(z, c);
  return { von: z.von, bis: z.bis, ausgleich: c, hoehe: (s) => (s <= z.von || s >= z.bis ? 0 : hoeheAus(k, s - z.kante)) };
}

// Zusatz auf die Strassenhöhen legen (py: Höhen je Streckenpunkt, sArr: Streckenmeter je Punkt)
export function wendeProfilAn(py, sArr, zonen) {
  for (const z of zonen) {
    const p = profilZusatz(z);
    for (let i = 0; i < py.length; i++) if (sArr[i] > p.von && sArr[i] < p.bis) py[i] += p.hoehe(sArr[i]);
  }
}

// ---------------------------------------------------------------------------------------------------------------
// Prüfer-Regeln (d = ganze Streckendatei, fehler(pfad, text)). Alte Markierungen { s, name } prüft streckenpruefung.js.
export const CHECKPOINT_ABSTAND = 60; // kein Checkpoint-Bogen in der Zone oder so viele Meter davor/danach
export function pruefeSprung(d, fehler) {
  if (!Array.isArray(d.sprung)) return;
  let vorher = null;
  d.sprung.forEach((sp, i) => {
    if (!sp || typeof sp !== 'object') return;
    const felder = ['von', 'bis', 'landeVon', 'landeBis'];
    const da = felder.filter((k) => k in sp);
    if (!da.length && !('kante' in sp) && !('staerke' in sp) && !('form' in sp)) return; // nur Markierung
    const p = `sprung[${i}]`;
    if (da.length < felder.length || !felder.every((k) => istZahl(sp[k]))) { fehler(p, 'Sprungzone braucht von, bis, landeVon, landeBis (Meter)'); return; }
    const kante = 'kante' in sp ? sp.kante : sp.s;
    if (!istZahl(kante)) { fehler(`${p}.kante`, 'Zahl erwartet (Meter der Absprungkante)'); return; }
    if (!(sp.von >= 0 && sp.bis <= d.laenge)) fehler(p, `Zone ${sp.von}–${sp.bis} liegt nicht auf der Strecke (0 bis ${d.laenge})`);
    if (!(sp.von < kante && kante < sp.bis)) fehler(`${p}.kante`, `${kante} liegt nicht in der Zone ${sp.von}–${sp.bis}`);
    if (!(sp.landeVon > kante)) fehler(`${p}.landeVon`, `Landezone (${sp.landeVon}) liegt nicht hinter der Kante (${kante})`);
    if (!(sp.landeBis > sp.landeVon)) fehler(`${p}.landeBis`, `${sp.landeBis} nicht hinter landeVon (${sp.landeVon})`);
    if ('staerke' in sp && !(istZahl(sp.staerke) && sp.staerke >= 0.2 && sp.staerke <= 3)) fehler(`${p}.staerke`, 'Zahl von 0.2 bis 3 erwartet');
    const f = { ...FORM_STANDARD, ...(sp.form || {}) };
    const bereich = { anlauf: [5, 150], rampe: [0, 0.4], kante: [1, 15], gefaelle: [0, 0.4], auslauf: [5, 120], weich: [2, 60] };
    for (const [k, [a, b]] of Object.entries(bereich)) if (!(istZahl(f[k]) && f[k] >= a && f[k] <= b)) fehler(`${p}.form.${k}`, `Zahl von ${a} bis ${b} erwartet`);
    if (istZahl(kante) && sp.von + f.weich > kante - f.anlauf) fehler(`${p}.von`, `Anlauf zu kurz: von + weich (${sp.von + f.weich}) muss vor kante - anlauf (${kante - f.anlauf}) liegen`);
    if (sp.landeBis + f.auslauf > sp.bis) fehler(`${p}.bis`, `Zone endet vor dem Auslauf (landeBis + auslauf = ${sp.landeBis + f.auslauf})`);
    if (vorher && sp.von <= vorher.bis) fehler(`${p}.von`, `Zone überlappt sprung[${i - 1}] (endet bei ${vorher.bis})`);
    vorher = sp;
    for (const [j, cp] of (Array.isArray(d.checkpoints) ? d.checkpoints : []).entries()) {
      if (istZahl(cp) && cp > sp.von - CHECKPOINT_ABSTAND && cp < sp.bis + CHECKPOINT_ABSTAND) fehler(p, `Checkpoint ${j + 1} (${cp} m) liegt in der Zone oder weniger als ${CHECKPOINT_ABSTAND} m davor/danach`);
    }
    // Landezone nicht im Wasser: Strasse ±8 m (Fahrbahn, Bankett, Schulter) über der ganzen Landezone (grob, sicher)
    const w = d.wasser || {};
    for (const [j, see] of (Array.isArray(w.seen) ? w.seen : []).entries()) {
      const r = Math.max(see.rx || 0, see.rz || 0);
      if (istZahl(see.s) && (see.lat || 0) - r < 8 && see.s + r > sp.landeVon && see.s - r < sp.landeBis) fehler(p, `Landezone ${sp.landeVon}–${sp.landeBis} liegt im See ${j + 1} (bei ${see.s} m)`);
    }
    for (const [j, fl] of (Array.isArray(w.fluesse) ? w.fluesse : []).entries()) {
      const r = (fl.breite || 0) + 8;
      if (istZahl(fl.s) && fl.s + r > sp.landeVon && fl.s - r < sp.landeBis) fehler(p, `Landezone ${sp.landeVon}–${sp.landeBis} liegt am Fluss ${j + 1} (bei ${fl.s} m)`);
    }
  });
}

// ---------------------------------------------------------------------------------------------------------------
// Flugphase. W = Werte (CONFIG.sprung), boden(x, z) = Höhe der gezeichneten Fläche unter dem Punkt.
// Ablauf je Physikschritt (main.js): vorher() sagt, ob das Auto in der Luft ist (dann rechnet physics.luftSchritt
// statt schritt); nachher() führt die Höhe nach: am Boden in der Abhebe-Strecke einer Zone als "angedrückter"
// Körper (folgt dem Boden, solange der Boden nicht schneller fällt als die Flugbahn), in der Luft als Wurfparabel
// mit Teilschritten bis zum Aufsetzen.
export class Flugphase {
  constructor(W, zonen = []) {
    this.W = W;
    this.zonen = zonen;
    this.ereignis = { abheben: 0, landung: 0 }; // Zähler (für Ton, Staub, Haptik, Statistik: "ist etwas Neues passiert?")
    this.letzteLandung = { weite: 0, zeit: 0, hoehe: 0, verlust: 0, haerte: 0, klasse: 'sauber', vSenk: 0, winkel: 0, gier: 0, s: 0, seite: 0, zone: -1, tempo: 0, abTempo: 0 };
    this.reset();
  }

  get g() { return this.W.schwerkraft * this.W.SCHWERKRAFT_FAKTOR; }

  // Zurück auf den Boden (R, Wasser, Neustart, Checkpoint verpasst): kein Flug, keine angefangene Messung
  reset() {
    this.inLuft = false;
    this.zone = -1;          // Zone, in der das Auto gerade ist (Abhebe-Strecke) oder abgehoben hat
    this.y = 0; this.vy = 0; // Höhe und Senkrecht-Tempo des Körpers (nur in der Zone oder in der Luft gültig)
    this.bereit = false;     // y/vy laufen mit (in der Abhebe-Strecke)
    this.hAlt = 0;
    this.nick = 0;           // Neigung längs aus der Flugbahn (rad, + = Nase hoch), geglättet und begrenzt
    this.flugZeit = 0; this.hoeheMax = 0; this.startX = 0; this.startZ = 0; this.startS = 0; this.abTempo = 0;
    this.ueberBoden = 0;     // Höhe über dem Boden (m), für Schatten und Kamera
    this.xLetzt = 0; this.zLetzt = 0;
  }

  // Abhebe-Strecke: in der Zone ab kurz vor der Kante bis zum Ende der Landezone, nahe an der Strasse
  zoneBei(s, seite) {
    for (let i = 0; i < this.zonen.length; i++) {
      const z = this.zonen[i];
      if (s >= z.kante - 3 && s <= z.landeBis && Math.abs(seite) <= this.W.abhebeBreite) return i;
    }
    return -1;
  }

  // Nach dem horizontalen Schritt. p = Fahrphysik (x, z, vx, vz, richtung), xa/za = Position vor dem Schritt,
  // q = Streckenabfrage der neuen Position (s, seite, tx, tz). Rückgabe: true, wenn das Auto in diesem Schritt landet.
  nachher(dt, p, xa, za, q, boden) {
    const W = this.W, g = this.g;
    // umgesetzt worden (Demo-Fahrt, Werkzeuge: physik.reset ohne flug.reset)? Dann gilt kein angefangener Flug
    if ((this.inLuft || this.bereit) && Math.abs(xa - this.xLetzt) + Math.abs(za - this.zLetzt) > 1) this.reset();
    this.xLetzt = p.x; this.zLetzt = p.z;
    if (!this.inLuft) {
      const zi = this.zonen.length ? this.zoneBei(q.s, q.seite) : -1;
      if (zi < 0) { this.bereit = false; this.zone = -1; return false; }
      const h = boden(p.x, p.z);
      if (!this.bereit || zi !== this.zone) {
        // Einstieg: Körper liegt auf dem Boden und hat dessen Senkrecht-Tempo (auch mitten auf einem Hang)
        const ha = boden(xa, za);
        this.bereit = true; this.zone = zi; this.y = h; this.vy = dt > 0 ? (h - ha) / dt : 0; this.hAlt = h; return false;
      }
      // angedrückter Körper: frei fallen, aber nie unter den Boden
      const yFrei = this.y + this.vy * dt - 0.5 * g * dt * dt;
      if (yFrei <= h) { this.y = h; this.vy = (h - this.hAlt) / dt; } else { this.y = yFrei; this.vy -= g * dt; }
      this.hAlt = h;
      this.nick = Math.atan2(this.vy, Math.max(1, Math.hypot(p.vx, p.vz)));
      if (this.y - h > W.abhebeSchwelle) {
        // abgehoben
        this.inLuft = true;
        this.flugZeit = 0; this.hoeheMax = this.y - h; this.ueberBoden = this.y - h;
        this.startX = xa; this.startZ = za; this.startS = q.s; this.abTempo = Math.hypot(p.vx, p.vz);
        this.ereignis.abheben++;
      }
      return false;
    }
    // in der Luft: Wurfparabel, Boden in Teilschritten prüfen (auch bei grossem Senkrecht-Tempo nie durch den Boden)
    const dy = Math.abs(this.vy) * dt + g * dt * dt, dh = Math.hypot(p.x - xa, p.z - za);
    const n = Math.min(64, Math.max(1, Math.ceil(Math.max(dy, dh) / W.teilschritt)));
    const y0 = this.y, vy0 = this.vy;
    for (let k = 1; k <= n; k++) {
      const t = (dt * k) / n, x = xa + ((p.x - xa) * k) / n, z = za + ((p.z - za) * k) / n;
      const y = y0 + vy0 * t - 0.5 * g * t * t, h = boden(x, z);
      if (!(y > h)) {
        // aufgesetzt: Rest des Schritts rollt am Boden (Position bleibt, wo die Physik sie hat; Höhe = Boden)
        this.vy = vy0 - g * t; this.flugZeit += t;
        this.y = boden(p.x, p.z);
        this.landen(p, q, boden);
        return true;
      }
      if (y - h > this.hoeheMax) this.hoeheMax = y - h;
      this.ueberBoden = y - h;
    }
    this.y = y0 + vy0 * dt - 0.5 * g * dt * dt; this.vy = vy0 - g * dt; this.flugZeit += dt;
    // Nase folgt der Flugbahn, geglättet und begrenzt (kein Überschlag)
    const ziel = begrenze(Math.atan2(this.vy, Math.max(1, Math.hypot(p.vx, p.vz))), -W.nickMax * GRAD, W.nickMax * GRAD);
    this.nick += (ziel - this.nick) * (1 - Math.exp(-dt / W.nickGlaetten));
    if (this.flugZeit > W.maxFlugZeit) { this.y = boden(p.x, p.z); this.landen(p, q, boden); return true; } // Notbremse
    return false;
  }

  // Aufsetzen: Tempoverlust aus Aufprall senkrecht zum Boden, Nase voran und schräger Landung
  landen(p, q, boden) {
    const W = this.W, L = this.letzteLandung;
    const vh = Math.hypot(p.vx, p.vz);
    // Bodenneigung in Flugrichtung (± 1.3 m wie die Physik)
    const ux = vh > 0.1 ? p.vx / vh : Math.sin(p.richtung), uz = vh > 0.1 ? p.vz / vh : Math.cos(p.richtung);
    const hv = boden(p.x + ux * 1.3, p.z + uz * 1.3), hh = boden(p.x - ux * 1.3, p.z - uz * 1.3);
    const gamma = Math.atan2(hv - hh, 2.6);
    const vSenk = Math.max(0, vh * Math.sin(gamma) - this.vy * Math.cos(gamma)); // Aufprall senkrecht zum Boden
    const nase = (gamma - this.nick) / GRAD; // + = Nase tiefer als der Boden
    // Gierwinkel zur Strasse (vorwärts oder rückwärts, 0..90°)
    const fx = Math.sin(p.richtung), fz = Math.cos(p.richtung);
    const gier = Math.acos(begrenze(Math.abs(fx * q.tx + fz * q.tz), 0, 1)) / GRAD;
    const V = W.verlust;
    const hart = begrenze((vSenk - V.senkFrei) / (V.senkHart - V.senkFrei), 0, 1) * V.hartMax
      + begrenze((vSenk - V.senkHart) / (V.senkSehrHart - V.senkHart), 0, 1) * (V.max - V.hartMax);
    const nv = begrenze((nase - V.naseFrei) / (V.naseVoll - V.naseFrei), 0, 1) * V.naseMax;
    const gv = begrenze((gier - V.gierFrei) / (V.gierVoll - V.gierFrei), 0, 1) * V.gierMax;
    const verlust = Math.min(V.max, hart + nv + gv);
    p.vx *= 1 - verlust; p.vz *= 1 - verlust;
    // Messwerte der Landung
    L.weite = Math.hypot(p.x - this.startX, p.z - this.startZ);
    L.zeit = this.flugZeit; L.hoehe = this.hoeheMax; L.verlust = verlust; L.vSenk = vSenk; L.winkel = nase; L.gier = gier;
    L.haerte = begrenze(vSenk / V.senkSehrHart, 0, 1);
    L.klasse = vSenk < V.senkFrei && verlust < 0.02 ? 'sauber' : vSenk < V.senkHart ? 'hart' : 'sehrHart';
    L.s = q.s; L.seite = q.seite; L.zone = this.zone; L.tempo = vh * (1 - verlust); L.abTempo = this.abTempo; L.startS = this.startS;
    this.inLuft = false; this.bereit = false; this.vy = 0; this.ueberBoden = 0;
    this.ereignis.landung++;
  }
}
