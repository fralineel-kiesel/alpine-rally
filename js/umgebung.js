// Umgebungsklänge (M7b): Kuhglocken, Publikum (Gemurmel, Jubel, Klatschen), Vögel, Brunnen und Windböen auf der
// Passhöhe – alles im Code erzeugt (Rauschen, Sinus, Filter), keine Dateien. Läuft auf der Schiene "umgebung" (wie der
// Fahrtwind: Pausen-Tiefpass und Ducking gelten mit).
//
// Raum: Hörer ist die Kamera (Ort und Blickrichtung aus main.js). Jede Quelle bekommt links/rechts (StereoPanner, aus
// dem Winkel zur Blickrichtung), Lautstärke nach Abstand und einen Tiefpass, der mit dem Abstand dumpfer wird; Quellen
// hinter dem Hörer sind leiser und dumpfer. Alles wird weich nachgeführt (setTargetAtTime), nie gesprungen.
//
// Stimmen: einmalige Klänge (Glocke, Vogel, Jubel, Klatschen) haben einen eigenen Topf (umgebung.maxStimmen), getrennt
// von den Aufprall- und Signal-Stimmen. Dauerklänge: höchstens 2 Gemurmel, 1 Brunnen, 1 Böen.
// Pro Bild: nur Zahlen in vorab angelegte Felder, keine neuen Objekte (Knoten entstehen nur beim Auslösen eines Klangs).
// Werte: config.js, audio.raum und audio.umgebung.

import { CONFIG } from './config.js';
import { zufall } from './util.js';

const ZWEI_PI = Math.PI * 2;
const begr = (w, a, b) => (w < a ? a : w > b ? b : w);
const glatt = (u) => u * u * (3 - 2 * u);
export const VOGEL_ARTEN = ['aufwärts', 'abwärts', 'triller', 'doppel', 'tü-tü-tü', 'triller schnell', 'schwung', 'zick'];

// --- Raum: Pan, Pegel und Tiefpass einer Quelle (qx, qz) für den Hörer (hx, hz, Blickrichtung yaw) ------------------
// typ: { referenz, radius, rolloff } (fehlt referenz/rolloff: audio.raum). Ergebnis in out (keine neuen Objekte)
// (Im Spiel gehen die Eingaben über RAUM_EIN, nicht als Zahlen-Argumente: das spart pro Bild Speicher im Browser)
const RAUM_EIN = new Float64Array(5); // hx, hz, yaw, qx, qz
export function raumWerte(hx, hz, yaw, qx, qz, typ, out) {
  RAUM_EIN[0] = hx; RAUM_EIN[1] = hz; RAUM_EIN[2] = yaw; RAUM_EIN[3] = qx; RAUM_EIN[4] = qz;
  return raumRechnen(typ, out);
}
function raumRechnen(typ, out) {
  const R = CONFIG.audio.raum;
  const hx = RAUM_EIN[0], hz = RAUM_EIN[1], yaw = RAUM_EIN[2], qx = RAUM_EIN[3], qz = RAUM_EIN[4];
  const dx = qx - hx, dz = qz - hz, d = Math.sqrt(dx * dx + dz * dz); // (nicht Math.hypot: legt im Browser Zahlen-Objekte an)
  const fx = Math.sin(yaw), fz = Math.cos(yaw);
  const vor = dx * fx + dz * fz, rechts = -dx * fz + dz * fx; // rechts = (-cos yaw, sin yaw), wie die Kamera
  const w = d > 1e-3 ? Math.atan2(rechts, vor) : 0;
  const ref = typ.referenz ?? R.referenz, rad = typ.radius, ro = typ.rolloff ?? R.rolloff;
  let g = d <= ref ? 1 : ref / (ref + ro * (d - ref));
  const aus = rad * (1 - R.auslauf);
  if (d >= rad) g = 0;
  else if (d > aus) g *= glatt((rad - d) / (rad - aus));
  const nah = Math.min(1, d / 2);                 // im Hörer selbst: Mitte, nicht hinten
  const h = Math.max(0, -Math.cos(w)) * nah;      // 0 = vorne/seitlich, 1 = genau hinten
  g *= 1 - (1 - R.hinten) * h;
  const u = begr((d - R.tiefpassAb) / (R.tiefpassBis - R.tiefpassAb), 0, 1);
  let tp = R.tiefpassNah * (R.tiefpassFern / R.tiefpassNah) ** u;
  tp += (Math.min(tp, R.hintenTiefpass) - tp) * h;
  out.d = d; out.winkel = w; out.pan = Math.sin(w) * R.pan * nah; out.gain = g; out.tiefpass = tp;
  return out;
}

// --- Quellen: einmal nach dem Aufbau der Welt aus Strecke, Kühen, Start/Ziel und Leben (nur gelesen) -----------------
export function umgebungsQuellen({ strecke, netz, kuehe, startZiel, leben }) {
  const U = CONFIG.audio.umgebung, P = U.publikum;
  const etappe = (s, lat) => { // Punkt der Etappe bei s, lat seitlich (+ = rechts)
    const p = netz ? netz.etappePunkt(s) : strecke.punktBei(s);
    return [p.x - p.tz * lat, p.z + p.tx * lat];
  };
  // Herden: Mittelpunkt, Radius (weiteste Kuh), Kühe mit Pose
  const herden = [];
  const nachNr = new Map();
  for (const k of (kuehe && kuehe.kuehe) || []) {
    if (k.herde == null) continue;
    if (!nachNr.has(k.herde)) { const h = { nr: k.herde, x: 0, z: 0, r: 0, anzahl: 0, posen: [0, 0, 0], kuehe: [] }; nachNr.set(k.herde, h); herden.push(h); }
    const h = nachNr.get(k.herde);
    h.x += k.x; h.z += k.z; h.anzahl++; h.posen[k.pose] = (h.posen[k.pose] || 0) + 1; h.kuehe.push(k.x, k.z, k.pose);
  }
  for (const h of herden) {
    h.x /= h.anzahl; h.z /= h.anzahl;
    for (let i = 0; i < h.kuehe.length; i += 3) h.r = Math.max(h.r, Math.hypot(h.kuehe[i] - h.x, h.kuehe[i + 1] - h.z));
    h.kuehe = Float32Array.from(h.kuehe);
  }
  herden.sort((a, b) => a.nr - b.nr);
  // Publikum: Start, Ziel (Meter ab der Linie, auch auf den Verlängerungen) und die Fan-Spots (Zuschauerseite)
  const orte = [];
  const linie = (m) => (startZiel && startZiel.ort ? startZiel.ort(m, 0) : null);
  for (const [name, mitte] of [['start', strecke.startS], ['ziel', strecke.zielS]]) {
    const o = P.orte[name];
    if (!o) continue;
    const pk = [];
    for (let m = o.von; m <= o.bis + 1e-6; m += P.punktAbstand) {
      const p = linie(mitte + m);
      if (p) pk.push(p.x, p.z); else pk.push(...etappe(Math.max(0, Math.min(strecke.laenge, mitte + m)), 0));
    }
    orte.push({ name, staerke: o.staerke, punkte: Float32Array.from(pk), sVon: mitte + o.von, sBis: mitte + o.bis, fan: false });
  }
  for (const sp of (CONFIG.leben && CONFIG.leben.fans && CONFIG.leben.fans.spots) || []) {
    const o = P.orte[sp.name];
    if (!o) continue;
    const lat = sp.seite * (sp.lat[0] + sp.lat[1]) / 2;
    const n = Math.max(2, Math.ceil((sp.s[1] - sp.s[0]) / P.punktAbstand) + 1), pk = [];
    for (let k = 0; k < n; k++) pk.push(...etappe(sp.s[0] + (sp.s[1] - sp.s[0]) * k / (n - 1), lat));
    orte.push({ name: sp.name, staerke: o.staerke, punkte: Float32Array.from(pk), sVon: sp.s[0] - P.jubel.vorlauf, sBis: sp.s[1], fan: true, lat });
  }
  // Brunnen: wo er wirklich steht (Kollisionskreise aus leben.js), sonst nach config.js
  let brunnen = null;
  const kreise = ((leben && leben.hindernisse) || []).filter((h) => h.rand === 'brunnen');
  if (kreise.length) brunnen = { x: kreise.reduce((a, h) => a + h.x, 0) / kreise.length, z: kreise.reduce((a, h) => a + h.z, 0) / kreise.length };
  else if (CONFIG.leben && CONFIG.leben.wiesenweg && CONFIG.leben.wiesenweg.brunnen) {
    const b = CONFIG.leben.wiesenweg.brunnen, [x, z] = etappe(b.s, b.seite * b.lat);
    brunnen = { x, z };
  }
  // Vögel: Dichte je Meter (aus den Abschnitten in track.js), an den Grenzen weich überblendet
  const V = U.voegel, L = Math.ceil(strecke.laenge) + 1, roh = new Float32Array(L), dichte = new Float32Array(L);
  const fehlen = [];
  const nrBei = (s) => strecke.abschnittNr[Math.max(0, Math.min(strecke.anzahl - 1, Math.round(s / strecke.laenge * (strecke.anzahl - 1))))];
  for (const a of strecke.abschnitte) if (!(a.name in V.dichte) && !fehlen.includes(a.name)) fehlen.push(a.name);
  for (let m = 0; m < L; m++) { const a = strecke.abschnitte[nrBei(m)]; roh[m] = a && a.name in V.dichte ? V.dichte[a.name] : 0.5; }
  const halb = Math.round(V.ueberblendung / 2);
  for (let m = 0; m < L; m++) {
    let s = 0, n = 0;
    for (let j = m - halb; j <= m + halb; j++) { s += roh[Math.max(0, Math.min(L - 1, j))]; n++; }
    dichte[m] = s / n;
  }
  // Böen: Abschnitt (Passhöhe) von ... bis
  const pa = strecke.abschnitte.filter((a) => a.name === U.boeen.abschnitt);
  const pass = pa.length ? { von: Math.min(...pa.map((a) => a.von)), bis: Math.max(...pa.map((a) => a.bis)) } : null;
  return { herden, orte, brunnen, voegel: { dichte, fehlen, namen: strecke.abschnitte.map((a) => a.name) }, pass, laenge: strecke.laenge };
}

// --- Puffer-Rezepte (nach dem Entsperren in Häppchen berechnet, siehe audio.js) ----------------------------------------
// Ein kleiner Zustandsfilter (Bandpass/Tiefpass), für die Rezepte
function filt(fc, q, rate) { return { lo: 0, band: 0, f: 2 * Math.sin(Math.PI * Math.min(fc, rate / 6) / rate), d: 1 / q }; }
function bp(F, x) { F.lo += F.f * F.band; F.band += F.f * (x - F.lo - F.d * F.band); return F.band; }
function fc(F, hz, rate) { F.f = 2 * Math.sin(Math.PI * Math.min(hz, rate / 6) / rate); }

// Einmaliger Klang: gen() liefert Sample für Sample; am Schluss ohne Gleichspannung, Spitze 0.9, Ende auf 0
function einmalRezept(rate, sek, gen, info = null) {
  const n = Math.round(rate * sek);
  return {
    laenge: n, info, rate,
    fuelle(d, von, bis) { for (let i = von; i < bis; i++) d[i] = gen(i / rate); },
    fertig(d) {
      let m = 0; for (let i = 0; i < n; i++) m += d[i]; m /= n;
      let sp = 0; const an = Math.round(rate * 0.002), aus = Math.round(rate * 0.01);
      for (let i = 0; i < n; i++) { d[i] -= m; if (i < an) d[i] *= i / an; if (i > n - aus) d[i] *= (n - i) / aus; sp = Math.max(sp, Math.abs(d[i])); }
      if (sp > 1e-9) for (let i = 0; i < n; i++) d[i] *= 0.9 / sp;
    },
  };
}
// Nahtlose Schleife: nach dem Ende werden "ueber" Sekunden weiter gerechnet (extra, auch in Häppchen). Das Ende der Schleife
// (schleifeEnde, kurz vor der Pufferlänge) liegt dort, wo zwei Nachbar-Samples fast gleich sind; was danach kommt, wird in
// den Anfang übergeblendet: das letzte gespielte Sample geht stetig ins erste über. Am Schluss RMS auf 0.25 (Pegel in
// config.js sind RMS-Werte)
export const SCHLEIFE_RMS = 0.25;
function schleifenRezept(rate, sek, ueber, gen) {
  const n = Math.round(rate * sek), x = Math.round(rate * ueber);
  const nach = new Float32Array(x);
  const rz = {
    laenge: n, extra: x, schleifeEnde: n, rate,
    fuelle(d, von, bis) { for (let i = von; i < bis; i++) { const v = gen(i / rate); if (i < n) d[i] = v; else nach[i - n] = v; } },
    fertig(d) {
      const s = (i) => (i < n ? d[i] : nach[i - n]);
      let e = n, best = Infinity;
      for (let i = n - (x >> 1); i <= n; i++) { const w = Math.abs(s(i) - s(i - 1)); if (w < best) { best = w; e = i; } }
      rz.schleifeEnde = e;
      const zu = new Float32Array(x); for (let j = 0; j < x; j++) zu[j] = s(e + j); // (s liest auch d: erst kopieren)
      for (let j = 0; j < x; j++) { const w = j / x; d[j] = zu[j] * Math.sqrt(1 - w) + d[j] * Math.sqrt(w); } // (gleiche Leistung)
      let m = 0, q = 0; for (let i = 0; i < n; i++) m += d[i]; m /= n;
      for (let i = 0; i < n; i++) { d[i] -= m; q += d[i] * d[i]; }
      const k = SCHLEIFE_RMS / Math.sqrt(q / n + 1e-20);
      for (let i = 0; i < n; i++) d[i] *= k;
    },
  };
  return rz;
}

// Kuhglocke (Treichel): 3 Teiltöne in unharmonischen Verhältnissen auf 300 Hz, dazu ein schwebender Zwilling des
// Grundtons (breit) und ein kurzes Rasseln; weicher Anschlag (4 ms)
function glockenRezept(rate, K, rnd) {
  // Teiltöne als gedämpfte Drehung (cos, sin) – schneller als Math.sin je Sample; dazu der schwebende Zwilling (301.7 Hz)
  const teile = [...K.teile, [301.7 / 300, 0.35, K.teile[0][2]]];
  const m = teile.length, re = new Float64Array(m), im = new Float64Array(m), c = new Float64Array(m), sn = new Float64Array(m), amp = new Float64Array(m);
  teile.forEach(([r, a, tau], j) => {
    const w = ZWEI_PI * 300 * r / rate, ab = Math.exp(-1 / (rate * tau)), p = rnd() * ZWEI_PI;
    c[j] = Math.cos(w) * ab; sn[j] = Math.sin(w) * ab; re[j] = Math.cos(p); im[j] = Math.sin(p); amp[j] = a;
  });
  const F = filt(900, 1.5, rate), rasAb = Math.exp(-1 / (rate * 0.05));
  let ras = 6 * K.rasseln;
  return einmalRezept(rate, 1.15, (t) => {
    let v = 0;
    for (let j = 0; j < m; j++) { const r = re[j] * c[j] - im[j] * sn[j]; im[j] = re[j] * sn[j] + im[j] * c[j]; re[j] = r; v += amp[j] * im[j]; }
    v += bp(F, rnd() * 2 - 1) * (0.6 + 0.4 * im[0]) * ras; ras *= rasAb;
    return v * (t < 0.004 ? 0.5 - 0.5 * Math.cos(Math.PI * t / 0.004) : 1);
  });
}

// Gemurmel: Rauschen durch drei "Stimmen"-Bänder, jedes mit eigenen langsamen Wellen und Silben-Flattern
function gemurmelRezept(rate, G, rnd) {
  const F = G.baender.map((hz) => filt(hz, 1.6, rate));
  const lfo = G.baender.map(() => [0, 1].map(() => [G.lfo[0] + rnd() * (G.lfo[1] - G.lfo[0]), rnd() * ZWEI_PI]));
  const silbe = G.baender.map(() => [3 + rnd() * 2.5, rnd() * ZWEI_PI]);
  const gew = [1, 0.8, 0.35], amp = new Float64Array(F.length);
  let k = 0;
  return schleifenRezept(rate, G.schleife, 0.3, (t) => {
    if ((k++ & 15) === 0) { // langsame Wellen und Silben-Flattern: alle 16 Samples neu (spart Rechenzeit)
      for (let b = 0; b < F.length; b++) {
        const l = lfo[b], s = silbe[b];
        const a = 0.65 + 0.2 * Math.sin(ZWEI_PI * l[0][0] * t + l[0][1]) + 0.15 * Math.sin(ZWEI_PI * l[1][0] * t + l[1][1]);
        const sil = b ? 0.75 + 0.25 * Math.sin(ZWEI_PI * s[0] * t + s[1] + 0.6 * Math.sin(ZWEI_PI * 0.7 * t)) : 1;
        amp[b] = gew[b] * a * sil;
      }
    }
    const x = rnd() * 2 - 1;
    return amp[0] * bp(F[0], x) + amp[1] * bp(F[1], x) + amp[2] * bp(F[2], x);
  });
}

// Klatscher: Zeiten mit rate pro Sekunde (zufällig), jeder ein kurzer Rauschstoss
function klatschZeiten(dauer, rate, rnd, von = 0, bis = dauer) {
  const z = [];
  for (let t = von + rnd() / rate; t < bis; t += (0.45 + 1.1 * rnd()) / rate) z.push(t);
  return z;
}
// Jubel-Welle: Rauschen mit wandernden Formanten (Vokale), "Ooh/Yeah"-Rufe (Sägezahn durch Formantfilter), Klatschen,
// zufälliges Anschwellen. dauer s, gleiter = Anzahl Rufe
function jubelRezept(rate, dauer, J, K, rnd) {
  const VOK = [[750, 1200, 2600], [500, 900, 2500], [480, 1850, 2600], [650, 1500, 2500]]; // a, o, e, ä
  const fo = [0, 1, 2].map((k) => filt(VOK[0][k], 4, rate));
  const wechsel = []; for (let t = 0; t < dauer; t += 0.35 + rnd() * 0.5) wechsel.push(VOK[Math.floor(rnd() * VOK.length)]);
  const n = Math.max(5, Math.round(J.gleiter * dauer / 5.2));
  const rufe = [];
  for (let k = 0; k < n; k++) {
    const ab = rnd() * dauer * 0.62, lang = 0.4 + rnd() * 0.6, f0 = 165 + rnd() * 250;
    rufe.push({ ab, lang, f0, ph: 0, F1: filt(500, 5, rate), F2: filt(900, 6, rate), pegel: 0.6 + 0.4 * rnd(), vib: 5 + rnd() * 2 });
  }
  const rateK = K.rate[0] + rnd() * (K.rate[1] - K.rate[0]);
  const zeiten = klatschZeiten(dauer, rateK, rnd, 0.15, dauer * 0.92);
  const fk = filt((K.band[0] + K.band[1]) / 2, 1.1, rate);
  let kNr = 0, kHuell = 0, kPegel = 0;
  const anschwellen = [rnd() * ZWEI_PI, 0.4 + rnd() * 0.5];
  const kAb = Math.exp(-1 / (rate * 0.007)), halten = dauer > 4 ? 0.7 : 0.6; // lange Welle hält länger
  let E = 0, zaehl = 0;
  return einmalRezept(rate, dauer, (t) => {
    const u = t / dauer;
    if ((zaehl & 15) === 0) E = Math.min(1, t / 0.28) * (0.85 + 0.15 * Math.sin(ZWEI_PI * anschwellen[1] * t + anschwellen[0])) * (u > halten ? Math.exp(-(u - halten) / 0.12) : 1);
    // Formant-Rauschen (Vokale wechseln weich)
    if ((zaehl++ & 31) === 0) {
      const w = t / dauer * wechsel.length, a = wechsel[Math.min(wechsel.length - 1, w | 0)], b = wechsel[Math.min(wechsel.length - 1, (w | 0) + 1)], m = glatt(w % 1);
      for (let k = 0; k < 3; k++) fc(fo[k], a[k] + (b[k] - a[k]) * m, rate);
    }
    const x = rnd() * 2 - 1;
    let v = 0.55 * bp(fo[0], x) + 0.4 * bp(fo[1], x) + 0.15 * bp(fo[2], x);
    // Rufe
    let r = 0;
    for (let j = 0; j < rufe.length; j++) {
      const R = rufe[j], s = t - R.ab;
      if (s < 0 || s > R.lang) continue;
      if ((zaehl & 15) === 1 || !R.f) { // Tonhöhe (Kontur, Vibrato), Formanten und Hüllkurve alle 16 Samples
        const q = s / R.lang, kontur = q < 0.4 ? 1 + 0.3 * q / 0.4 : 1.3 - 0.5 * (q - 0.4) / 0.6;
        R.f = R.f0 * kontur * (1 + 0.02 * Math.sin(ZWEI_PI * R.vib * s)) / rate;
        fc(R.F1, q < 0.5 ? 480 : 700, rate); fc(R.F2, q < 0.5 ? 850 : 1700, rate);
        R.hu = Math.min(1, s / 0.06) * Math.min(1, (R.lang - s) / 0.15) * R.pegel;
      }
      R.ph += R.f; if (R.ph >= 1) R.ph -= 1;
      const saege = 2 * R.ph - 1;
      r += R.hu * (bp(R.F1, saege) + 0.6 * bp(R.F2, saege));
    }
    // Klatschen
    while (kNr < zeiten.length && t >= zeiten[kNr]) { kHuell = 1; kPegel = 0.6 + 0.4 * rnd(); kNr++; }
    const kl = bp(fk, (rnd() * 2 - 1) * kHuell * kPegel); kHuell *= kAb;
    return E * (v + 0.9 * r) + E * 1.6 * kl;
  }, { klatscher: zeiten.length, klatschRate: rateK, rufe: n });
}
// Eigener Klatsch-Ausbruch (Ziel)
function klatschRezept(rate, K, rnd) {
  const rateK = K.rate[0] + rnd() * (K.rate[1] - K.rate[0]);
  const zeiten = klatschZeiten(K.dauer, rateK, rnd, 0.02, K.dauer - 0.1);
  const fk = filt((K.band[0] + K.band[1]) / 2, 1.1, rate), fk2 = filt(K.band[1], 1.4, rate);
  let nr = 0, h = 0, p = 0, E = 0, k = 0;
  const ab = Math.exp(-1 / (rate * 0.007));
  return einmalRezept(rate, K.dauer, (t) => {
    while (nr < zeiten.length && t >= zeiten[nr]) { h = 1; p = 0.6 + 0.4 * rnd(); nr++; }
    const x = (rnd() * 2 - 1) * h * p; h *= ab;
    if ((k++ & 15) === 0) E = Math.min(1, t / 0.12) * (t > K.dauer * 0.55 ? Math.exp(-(t - K.dauer * 0.55) / 0.3) : 1);
    return E * (bp(fk, x) + 0.5 * bp(fk2, x));
  }, { klatscher: zeiten.length, klatschRate: rateK, zeiten });
}

// Vogelrufe: Abschnitte [ab s, Dauer s, Hz Anfang, Hz Ende, Wackeln Hz]; Sinus mit schnellem Tonhöhenverlauf, scharfe Hüllkurve
const VOGEL_FORMEN = [
  [[0, 0.12, 2400, 4600]],                                                   // Aufwärts-Pfiff
  [[0, 0.11, 4800, 2600]],                                                   // Abwärts-Pfiff
  [0, 1, 2, 3, 4].map((k) => [k * 0.04, 0.03, 3200, 4200]),                  // Triller (5 Wiederholungen)
  [[0, 0.05, 3600, 3700], [0.08, 0.05, 2900, 2800]],                         // Doppel-Ton
  [0, 1, 2].map((k) => [k * 0.07, 0.045, 2800, 2850]),                       // tü-tü-tü
  [0, 1, 2, 3, 4, 5].map((k) => [k * 0.033, 0.025, 4500, 3500]),             // Triller schnell abwärts
  [[0, 0.08, 2500, 4500], [0.08, 0.08, 4500, 3000]],                         // Schwung auf und ab
  [[0, 0.065, 3800, 3800, 400]],                                             // Zick (schnell gewackelt)
];
export const VOGEL_DAUER = VOGEL_FORMEN.map((f) => Math.max(...f.map((a) => a[0] + a[1])));
function vogelRezept(rate, k, rnd) {
  const teile = VOGEL_FORMEN[k], dauer = VOGEL_DAUER[k] + 0.012;
  let ph = 0;
  return einmalRezept(rate, dauer, (t) => {
    for (const [ab, d, f0, f1, wack] of teile) {
      const s = t - ab;
      if (s < 0 || s > d) continue;
      const q = s / d, f = f0 * (f1 / f0) ** q + (wack ? wack * Math.sin(ZWEI_PI * 60 * s) : 0);
      ph += ZWEI_PI * f / rate;
      const hu = Math.min(1, s / 0.003) * Math.min(1, (d - s) / 0.008);
      return Math.sin(ph) * hu * hu;
    }
    return 0;
  }, { dauer: VOGEL_DAUER[k] });
}

// Brunnen: plätschernder Strahl (Rauschen 1-4 kHz mit schnellem, unregelmässigem Blubbern) und Tropfen (kurze Tonsprünge)
function brunnenRezept(rate, B, rnd) {
  const F = filt(2000, 0.8, rate), F2 = filt(3200, 1.2, rate);
  const mod = [0, 1, 2].map(() => [7 + rnd() * 16, rnd() * ZWEI_PI]);
  const tropfen = [];
  for (let t = 0; t < B.schleife + 0.3; t += 1 / (B.tropfen[0] + rnd() * (B.tropfen[1] - B.tropfen[0]))) tropfen.push([t - 0.3, 500 + rnd() * 700, 0.4 + 0.6 * rnd()]);
  let tr = 0, ph = 0, lp = 0, m = 0.55, k = 0;
  return schleifenRezept(rate, B.schleife, 0.3, (t) => {
    const x = rnd() * 2 - 1;
    if ((k++ & 7) === 0) { m = 0.55; for (let j = 0; j < 3; j++) m += 0.15 * Math.sin(ZWEI_PI * mod[j][0] * t + mod[j][1]); }
    lp += ((rnd() < 0.002 ? 1 : 0) - lp) * 0.002;
    let v = (bp(F, x) * 0.8 + bp(F2, x) * 0.4) * (m + 2 * lp);
    while (tr < tropfen.length - 1 && t >= tropfen[tr + 1][0]) tr++;
    const [t0, f0, a] = tropfen[tr], s = t - t0;
    if (s >= 0 && s < 0.03) { ph += ZWEI_PI * f0 * (1 + 1.2 * Math.min(1, s / 0.012)) / rate; v += a * 0.5 * Math.sin(ph) * Math.exp(-s / 0.008) * Math.min(1, s / 0.001); }
    return v;
  });
}

// Glocken, Publikum und Brunnen mit halber Abtastrate (ihr Klang liegt unter ca. 6 kHz, der Browser rechnet beim Abspielen
// um): halbe Rechenzeit beim Aufbau. Vögel (bis 5 kHz, sehr kurz) mit voller Rate
export function umgebungRezepte(rate, rnd) {
  const U = CONFIG.audio.umgebung, P = U.publikum, halb = Math.max(8000, Math.round(rate / 2));
  return [
    ...U.kuhglocken.klang.map((K, k) => [`u-glocke-${k}`, () => glockenRezept(halb, K, rnd)]),
    ...VOGEL_FORMEN.map((_, k) => [`u-vogel-${k}`, () => vogelRezept(rate, k, rnd)]),
    ['u-gemurmel', () => gemurmelRezept(halb, P.gemurmel, rnd)],
    ['u-brunnen', () => brunnenRezept(halb, U.brunnen, rnd)],
    ['u-jubel', () => jubelRezept(halb, P.jubel.kurz, P.jubel, P.klatschen, rnd)],
    ['u-jubel-lang', () => jubelRezept(halb, P.jubel.lang, P.jubel, P.klatschen, rnd)],
    ['u-klatschen', () => klatschRezept(halb, P.klatschen, rnd)],
  ];
}

// --- Die Umgebung im Klangwerk ---------------------------------------------------------------------------------------
// ausgang: Schiene "umgebung". puffer: alle Puffer (u-..., dazu 'rauschen' aus audio.js für die Böen).
// merke(art, wert): Ereignis zählen (Tests). rnd: eigene feste Zufallsfolge (umgebung.seed)
export function baueUmgebung(ctx, ausgang, puffer, merke = () => {}) {
  const U = CONFIG.audio.umgebung, R = CONFIG.audio.raum, P = U.publikum;
  const rnd = zufall(U.seed);
  const zw = (ab, u) => ab[0] + (ab[1] - ab[0]) * u;
  const gain = (w, ziel) => { const g = ctx.createGain(); g.gain.value = w; if (ziel) g.connect(ziel); return g; };
  const tief = (hz, ziel) => { const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = hz; f.Q.value = 0.7; if (ziel) f.connect(ziel); return f; };
  const panner = (ziel) => { const p = ctx.createStereoPanner(); p.pan.value = 0; p.connect(ziel); return p; };
  let Q = null; // Quellen (setzeQuellen)
  const ro = { d: 0, winkel: 0, pan: 0, gain: 0, tiefpass: 0 }; // Raum-Ergebnis (wiederverwendet)
  const zaehler = {}, zaehl = { knotenAktiv: 0, knotenErzeugt: 0 };
  const protokoll = []; // die letzten Ereignisse { art, uhr, wert } (Tests)
  const zuMerken = (art, wert = 0) => {
    zaehler[art] = (zaehler[art] || 0) + 1; merke(art, wert);
    protokoll.push({ art, uhr: z.uhr, wert }); if (protokoll.length > 600) protokoll.splice(0, 200);
  };

  // Werte weich nachführen. Neuer Auftrag nur bei einer Änderung über 0.4 % (unhörbar, die Glättung macht daraus eine
  // weiche Kurve): jeder Auftrag an den Browser kostet ein wenig Speicher. jetzt = Audio-Uhr, einmal pro Bild gelesen
  const letzte = new Float64Array(64).fill(NaN);
  let jetzt = 0;
  function setz(nr, param, w, tau = R.glaetten) {
    if (Math.abs(w - letzte[nr]) <= Math.abs(w) * 0.004 + 1e-6) return;
    letzte[nr] = w; param.setTargetAtTime(w, jetzt, tau);
  }
  function sofort(nr, param, w) { letzte[nr] = w; param.cancelScheduledValues(ctx.currentTime); param.setValueAtTime(w, ctx.currentTime); }

  // --- Dauerstimmen: Gemurmel (2), Brunnen (1), Böen (1) ---
  const dauer = [];
  // (Parameter vorab merken: jeder Zugriff wie knoten.gain kostet im Browser ein kleines Objekt)
  const dauerStimme = () => { const p = panner(ausgang), lp = tief(9000, p), g = gain(0, lp); const s = { g, lp, p, gP: g.gain, panP: p.pan, lpP: lp.frequency, quelle: null, ort: -1, frei: 0 }; dauer.push(s); return s; };
  const murmel = [dauerStimme(), dauerStimme()];
  const bru = dauerStimme();
  const boeGain = gain(0, ausgang);
  const merger = ctx.createChannelMerger(2); merger.connect(boeGain);
  const boeLp = [tief(500, null), tief(500, null)];
  boeLp[0].connect(merger, 0, 0); boeLp[1].connect(merger, 0, 1);
  const heulBp = ctx.createBiquadFilter(); heulBp.type = 'bandpass'; heulBp.frequency.value = 450; heulBp.Q.value = U.boeen.heulenGuete;
  const heulGain = gain(0, boeGain); heulBp.connect(heulGain);
  const BP = { gain: boeGain.gain, lp0: boeLp[0].frequency, lp1: boeLp[1].frequency, heulHz: heulBp.frequency, heul: heulGain.gain };
  const laeuft = { murmel: false, brunnen: false, boeen: false };
  const dauerQuellen = [];
  function loop(buf, ziel, versatz, rate = 1) {
    const q = ctx.createBufferSource(); q.buffer = buf; q.loop = true; q.playbackRate.value = rate; q.connect(ziel);
    const ende = buf.schleifeEnde ? buf.schleifeEnde / buf.sampleRate : buf.duration;
    if (buf.schleifeEnde) { q.loopStart = 0; q.loopEnd = ende; }
    q.start(0, versatz % ende); dauerQuellen.push(q); return q;
  }
  function dauerStarten() { // sobald die Puffer fertig sind
    if (!laeuft.murmel && puffer['u-gemurmel']) { laeuft.murmel = true; murmel[0].quelle = loop(puffer['u-gemurmel'], murmel[0].g, 0); murmel[1].quelle = loop(puffer['u-gemurmel'], murmel[1].g, 1.9, 0.97); }
    if (!laeuft.brunnen && puffer['u-brunnen']) { laeuft.brunnen = true; bru.quelle = loop(puffer['u-brunnen'], bru.g, 0); }
    if (!laeuft.boeen && puffer.rauschen) {
      laeuft.boeen = true;
      loop(puffer.rauschen, boeLp[0], 0.31); loop(puffer.rauschen, boeLp[1], 1.27, 0.93); loop(puffer.rauschen, heulBp, 0.77, 1.07);
    }
  }

  // --- Einmalige Klänge: eigener Topf ---
  const topf = [];
  for (let k = 0; k < U.maxStimmen; k++) topf.push({ an: false, gen: 0, start: 0, ende: 0, quelle: null, g: null, lp: null, p: null, gP: null, panP: null, lpP: null, ort: -1, pegel: 0, art: '', typ: null, nr: 40 + k });
  function abwuergen(s) {
    const t = ctx.currentTime;
    try { s.g.gain.cancelScheduledValues(t); s.g.gain.setTargetAtTime(0, t, 0.01); s.quelle.stop(t + 0.06); } catch { /* vorbei */ }
    s.an = false;
  }
  // Puffer "name" spielen: in wann s, Abspieltempo, Pegel (ohne Raum), Raum aus ro; ort >= 0: Jubel (Pan wird nachgeführt)
  function einmal(art, name, wann, tempo, pegel, typ, ort = -1) {
    const b = puffer[name];
    if (!b || !(pegel > 0) || !(ro.gain > 0)) return null;
    let s = null;
    for (const x of topf) if (!x.an) { s = x; break; }
    if (!s) { s = topf[0]; for (const x of topf) if (x.start < s.start) s = x; abwuergen(s); }
    const t = ctx.currentTime + wann;
    const q = ctx.createBufferSource(); q.buffer = b; q.playbackRate.value = tempo;
    const p = ctx.createStereoPanner(); p.pan.value = ro.pan; p.connect(ausgang);
    const lp = tief(ro.tiefpass, p);
    const g = gain(pegel * ro.gain, lp);
    q.connect(g); q.start(t);
    s.an = true; s.gen++; s.start = t; s.ende = t + b.duration / tempo; s.quelle = q; s.g = g; s.lp = lp; s.p = p; s.ort = ort; s.pegel = pegel; s.art = art; s.typ = typ;
    s.gP = g.gain; s.panP = p.pan; s.lpP = lp.frequency;
    letzte[s.nr] = NaN; letzte[s.nr + 8] = NaN; letzte[s.nr + 16] = NaN;
    zaehl.knotenAktiv += 4; zaehl.knotenErzeugt += 4;
    const gen = s.gen;
    let fertig = false;
    q.onended = () => {
      if (fertig) return; fertig = true;
      zaehl.knotenAktiv -= 4;
      try { q.disconnect(); g.disconnect(); lp.disconnect(); p.disconnect(); } catch { /* egal */ }
      if (s.gen === gen) { s.an = false; s.quelle = null; s.g = null; s.lp = null; s.p = null; s.gP = s.panP = s.lpP = null; s.ort = -1; }
    };
    return s;
  }

  // --- Zustand (nur Zahlen) ---
  const z = {
    uhr: 0, hx: 0, hz: 0, yaw: 0, s: 0, sVor: NaN, tempo: 0, aktiv: false, pause: false,
    vogelRest: 0, boePhase: 2, boeT: 0, boeDauer: 2, boeVon: U.boeen.grund, boeZu: U.boeen.grund, boeWert: U.boeen.grund,
    heulZiel: 450, heulHz: 450, heulUhr: 0, boeTakt: 0, passStaerke: 0, boePegel: 0, brunnenPegel: 0, murmelPegel: [0, 0], murmelOrt: [-1, -1],
    herdenAktiv: [-1, -1], vogelDichte: 0,
  };
  let herdNaechster = new Float64Array(0), herdDist = new Float64Array(0), herdVar = [], ortDist = new Float64Array(0), ortGain = new Float64Array(0);
  let ortPunkt = new Int32Array(0), ortDrin = new Uint8Array(0), ortLetzter = new Float64Array(0);
  function setzeQuellen(q) {
    Q = q;
    const n = q.herden.length;
    herdNaechster = new Float64Array(n).fill(-1); herdDist = new Float64Array(n);
    const rq = zufall(U.seed + 11);
    const G = U.kuhglocken;
    herdVar = q.herden.map(() => [0, 1, 2].map(() => ({ klang: Math.floor(rq() * G.klang.length), hz: zw(G.grundton, rq()) })));
    const m = q.orte.length;
    ortDist = new Float64Array(m); ortGain = new Float64Array(m); ortPunkt = new Int32Array(m); ortDrin = new Uint8Array(m); ortLetzter = new Float64Array(m).fill(-1e9);
    z.vogelRest = zw(U.voegel.abstand, rnd());
  }

  // Nächster Klangpunkt eines Ortes (Index), Abstand in ortDist
  function naechsterPunkt(o) {
    const pk = Q.orte[o].punkte;
    let best = 0, bd = Infinity;
    for (let i = 0; i < pk.length; i += 2) { const d = (pk[i] - z.hx) ** 2 + (pk[i + 1] - z.hz) ** 2; if (d < bd) { bd = d; best = i; } }
    ortPunkt[o] = best; ortDist[o] = Math.sqrt(bd);
    return best;
  }
  function ortRaum(o, typ) {
    const i = naechsterPunkt(o), pk = Q.orte[o].punkte;
    RAUM_EIN[0] = z.hx; RAUM_EIN[1] = z.hz; RAUM_EIN[2] = z.yaw; RAUM_EIN[3] = pk[i]; RAUM_EIN[4] = pk[i + 1];
    return raumRechnen(typ, ro);
  }

  // --- Glocken ---
  function glockenSchlag(h, versatz) {
    const H = Q.herden[h], G = U.kuhglocken;
    const k = Math.floor(rnd() * H.anzahl), x = H.kuehe[k * 3], zz = H.kuehe[k * 3 + 1], pose = H.kuehe[k * 3 + 2];
    if (rnd() >= G.pose[pose]) { zuMerken('glocke-still', pose); return; }
    raumWerte(z.hx, z.hz, z.yaw, x, zz, G, ro);
    const v = herdVar[h][Math.floor(rnd() * 3)];
    zuMerken('glocke', h + v.hz / 1000); // (Herde und Tonhöhe in einer Zahl, für die Tests)
    einmal('glocke', `u-glocke-${v.klang}`, versatz, v.hz / 300, G.pegel / 0.9, G);
    if (rnd() < G.doppel) {
      const w = herdVar[h][(herdVar[h].indexOf(v) + 1 + Math.floor(rnd() * 2)) % 3];
      zuMerken('glocke-doppel', w.hz);
      einmal('glocke', `u-glocke-${w.klang}`, versatz + zw(G.doppelAbstand, rnd()), w.hz / 300, G.pegel / 0.9 * 0.8, G);
    }
  }
  // Abstand bis zum nächsten Schlag einer Herde (s): je mehr Kühe und je näher der Hörer, desto dichter (im Bereich abstand)
  // (Verteilung a + (b - a) x u^k: Mittel a + (b - a) / (k + 1); aufgeschreckt: k so, dass das Mittel durch den Faktor geteilt wird)
  function glockenAbstand(h, nah) {
    const G = U.kuhglocken, H = Q.herden[h], [a, b] = G.abstand;
    let k = 1 + G.dichteKuehe * Math.max(0, H.anzahl - 1);
    if (nah) { const m = (a + (b - a) / (k + 1)) / G.aufgeschrecktFaktor; k = m > a + 0.01 ? (b - a) / (m - a) - 1 : 50; }
    return zw(G.abstand, rnd() ** k);
  }
  function glocken() {
    const G = U.kuhglocken, n = Q.herden.length;
    let a = -1, b = -1;
    for (let h = 0; h < n; h++) {
      const H = Q.herden[h];
      const dx = H.x - z.hx, dz = H.z - z.hz;
      herdDist[h] = Math.max(0, Math.sqrt(dx * dx + dz * dz) - H.r);
      if (herdDist[h] >= G.radius) continue;
      if (a < 0 || herdDist[h] < herdDist[a]) { b = a; a = h; } else if (b < 0 || herdDist[h] < herdDist[b]) b = h;
    }
    if (G.maxHerden < 2) b = -1;
    if (G.maxHerden < 1) a = -1;
    for (let h = 0; h < n; h++) if (h !== a && h !== b) herdNaechster[h] = -1;
    z.herdenAktiv[0] = a; z.herdenAktiv[1] = b;
    herdeLaeuten(a); herdeLaeuten(b);
  }
  function herdeLaeuten(h) {
    const G = U.kuhglocken;
    if (h < 0) return;
    if (herdNaechster[h] < 0) herdNaechster[h] = z.uhr + rnd() * zw(G.abstand, 0.5);
    if (z.uhr >= herdNaechster[h]) {
      glockenSchlag(h, 0);
      herdNaechster[h] = z.uhr + glockenAbstand(h, herdDist[h] < G.aufgeschreckt);
    }
  }

  // --- Publikum ---
  function gemurmel() {
    const Gm = P.gemurmel, m = Q.orte.length;
    let a = -1, b = -1;
    for (let o = 0; o < m; o++) {
      if (Q.orte[o].murmeln === false) { ortGain[o] = 0; continue; } // (Ton-Labor: nur Jubel)
      ortRaum(o, Gm);
      ortGain[o] = ro.gain * Q.orte[o].staerke;
      if (ortGain[o] <= 0) continue;
      if (a < 0 || ortGain[o] > ortGain[a]) { b = a; a = o; } else if (b < 0 || ortGain[o] > ortGain[b]) b = o;
    }
    if (Gm.maxOrte < 2) b = -1;
    // Stimmen behalten ihren Ort; ein Ort, der wegfällt, wird erst ausgeblendet, dann ist die Stimme frei
    for (let k = 0; k < 2; k++) {
      const S = murmel[k];
      if (S.ort >= 0 && S.ort !== a && S.ort !== b) {
        setz(k * 3, S.gP, 0);
        if (!S.frei) S.frei = z.uhr + 0.3; else if (z.uhr >= S.frei) { S.ort = -1; S.frei = 0; }
      }
    }
    murmelBelegen(a); murmelBelegen(b);
    for (let k = 0; k < 2; k++) {
      const S = murmel[k];
      z.murmelOrt[k] = S.ort;
      if (S.ort < 0 || S.frei) { if (S.ort < 0) z.murmelPegel[k] = 0; continue; }
      ortRaum(S.ort, Gm);
      z.murmelPegel[k] = Gm.pegel / SCHLEIFE_RMS * ro.gain * Q.orte[S.ort].staerke;
      setz(k * 3, S.gP, z.murmelPegel[k]); setz(k * 3 + 1, S.panP, ro.pan); setz(k * 3 + 2, S.lpP, ro.tiefpass);
    }
  }
  function murmelBelegen(o) {
    if (o < 0 || murmel[0].ort === o || murmel[1].ort === o) return;
    const k = murmel[0].ort < 0 ? 0 : murmel[1].ort < 0 ? 1 : -1;
    if (k < 0) return;
    const S = murmel[k];
    S.ort = o; S.frei = 0;
    ortRaum(o, P.gemurmel);
    sofort(k * 3 + 1, S.panP, ro.pan); sofort(k * 3 + 2, S.lpP, ro.tiefpass);
  }
  // Jubel an einem Ort (Name): art 'kurz' (Vorbeifahren), 'go', 'ziel', 'lang' (neue Bestzeit)
  function jubel(name, art = 'kurz') {
    if (!Q || !z.aktiv) return false;
    const o = Q.orte.findIndex((x) => x.name === name);
    if (o < 0) return false;
    const J = P.jubel;
    ortRaum(o, J);
    zuMerken(`jubel-${art}`, o);
    const f = art === 'go' ? J.go : art === 'ziel' ? J.ziel : art === 'lang' ? J.best : 1;
    const s = einmal(`jubel-${art}`, art === 'lang' ? 'u-jubel-lang' : 'u-jubel', 0, art === 'go' ? 1.05 : 0.96 + 0.08 * rnd(), J.pegel / 0.9 * f * Q.orte[o].staerke, J, o);
    ortLetzter[o] = z.uhr;
    return !!s;
  }
  function klatschen(name) {
    if (!Q || !z.aktiv) return false;
    const o = Q.orte.findIndex((x) => x.name === name);
    if (o < 0) return false;
    ortRaum(o, P.jubel);
    zuMerken('klatschen', o);
    return !!einmal('klatschen', 'u-klatschen', 0.15, 1, P.klatschen.pegel / 0.9 * Q.orte[o].staerke, P.jubel, o);
  }
  // Vorbeifahren an einem Fan-Spot: einmal pro Durchfahrt (Bereich ab s[0] - vorlauf), höchstens alle "sperre" s
  function fanSpots(rennen) {
    const ok = rennen && Number.isFinite(z.sVor) && Math.abs(z.s - z.sVor) < 5;
    for (let o = 0; o < Q.orte.length; o++) {
      const O = Q.orte[o];
      if (!O.fan) continue;
      const drin = z.s >= O.sVon && z.s <= O.sBis;
      if (drin && !ortDrin[o] && ok && z.uhr - ortLetzter[o] >= P.jubel.sperre) jubel(O.name, 'kurz');
      ortDrin[o] = drin ? 1 : 0;
    }
  }
  // laufende Jubel-Wellen: Pan, Pegel, Tiefpass folgen dem Hörer
  function jubelNachfuehren() {
    for (let k = 0; k < topf.length; k++) {
      const s = topf[k];
      if (!s.an || s.ort < 0) continue;
      ortRaum(s.ort, s.typ);
      setz(s.nr, s.gP, s.pegel * ro.gain); setz(s.nr + 8, s.panP, ro.pan); setz(s.nr + 16, s.lpP, ro.tiefpass);
    }
  }

  // --- Vögel ---
  function vogelDichte(s) {
    const D = Q.voegel.dichte;
    return D[Math.max(0, Math.min(D.length - 1, Math.round(s)))];
  }
  function voegel(dt) {
    const V = U.voegel;
    z.vogelDichte = vogelDichte(z.s) * (V.dichteFaktor ?? 1) * Math.max(0, 1 - Math.min(1, z.tempo / V.hoechstTempo) * V.tempoDaempfung);
    z.vogelRest -= dt * z.vogelDichte;
    if (z.vogelRest > 0) return;
    z.vogelRest += zw(V.abstand, rnd());
    const art = Math.floor(rnd() * VOGEL_FORMEN.length);
    const seite = rnd() < 0.5 ? -1 : 1, lat = zw(V.seitlich, rnd()), laengs = zw(V.laengs, rnd()) * (rnd() < 0.5 ? -1 : 1);
    const fx = Math.sin(z.yaw), fz = Math.cos(z.yaw);
    const qx = z.hx + fx * laengs - fz * lat * seite, qz = z.hz + fz * laengs + fx * lat * seite;
    raumWerte(z.hx, z.hz, z.yaw, qx, qz, V, ro);
    zuMerken('vogel', art);
    einmal('vogel', `u-vogel-${art}`, 0, 0.92 + 0.16 * rnd(), V.pegel / 0.9, V);
  }

  // --- Brunnen ---
  function brunnen() {
    const B = U.brunnen;
    if (!Q.brunnen) { z.brunnenPegel = 0; setz(10, bru.gP, 0); return; }
    RAUM_EIN[0] = z.hx; RAUM_EIN[1] = z.hz; RAUM_EIN[2] = z.yaw; RAUM_EIN[3] = Q.brunnen.x; RAUM_EIN[4] = Q.brunnen.z;
    raumRechnen(B, ro);
    z.brunnenPegel = B.pegel / SCHLEIFE_RMS * ro.gain;
    setz(10, bru.gP, z.brunnenPegel); setz(11, bru.panP, ro.pan); setz(12, bru.lpP, ro.tiefpass);
  }

  // --- Böen (Passhöhe) ---
  const BOE_EICH = 14.9; // Rauschen durch den Tiefpass -> RMS 1 bei Böen-Wert 1 (gemessen, tools/ton-umgebung-test.mjs)
  function passStaerke(s) {
    if (!Q.pass) return 0;
    const b = U.boeen.blende;
    if (s >= Q.pass.von && s <= Q.pass.bis) return 1;
    const aus = s < Q.pass.von ? Q.pass.von - s : s - Q.pass.bis;
    return aus >= b ? 0 : glatt(1 - aus / b);
  }
  function boeen(dt) {
    const B = U.boeen;
    z.boeT += dt;
    if (z.boeT >= z.boeDauer) { // nächste Phase: Anschwellen -> Abschwellen -> Pause -> ...
      z.boeT = 0; z.boePhase = (z.boePhase + 1) % 3;
      if (z.boePhase === 0) { z.boeVon = B.grund; z.boeZu = zw(B.spitze, rnd()); z.boeDauer = zw(B.rauf, rnd()); }
      else if (z.boePhase === 1) { z.boeVon = z.boeZu; z.boeZu = B.grund; z.boeDauer = zw(B.runter, rnd()); }
      else { z.boeVon = z.boeZu = B.grund; z.boeDauer = zw(B.pause, rnd()); }
    }
    z.boeWert = z.boeVon + (z.boeZu - z.boeVon) * glatt(Math.min(1, z.boeT / z.boeDauer));
    z.heulUhr -= dt;
    if (z.heulUhr <= 0) { z.heulZiel = zw(B.heulenTon, rnd()); z.heulUhr = 2 + rnd() * 2; }
    z.heulHz += (z.heulZiel - z.heulHz) * Math.min(1, dt / 1.5);
    z.passStaerke = passStaerke(z.s);
    z.boePegel = B.pegel * BOE_EICH * z.passStaerke;
    if ((z.boeTakt++ & 3) !== 0) return; // langsame Böen: nur jedes 4. Bild nachführen (die Glättung macht es weich)
    const hell = zw(B.tiefpass, begr((z.boeWert - B.grund) / (1 - B.grund), 0, 1));
    setz(20, BP.gain, z.boePegel * z.boeWert, 0.08);
    setz(21, BP.lp0, hell, 0.1); setz(22, BP.lp1, hell * 1.07, 0.1);
    setz(23, BP.heulHz, z.heulHz, 0.2); setz(24, BP.heul, B.heulen * 2.2 * z.boeWert, 0.1);
  }

  function stilleDauer(tau) {
    for (let k = 0; k < 2; k++) setz(k * 3, murmel[k].gP, 0, tau);
    setz(10, bru.gP, 0, tau); setz(20, BP.gain, 0, tau);
    z.murmelPegel[0] = z.murmelPegel[1] = 0; z.brunnenPegel = 0; z.boePegel = 0;
  }
  // Alles aus (Neustart, Hauptmenü): Dauerklänge weich weg, einmalige Klänge aus
  function allesAus() {
    jetzt = ctx.currentTime;
    stilleDauer(0.03);
    for (const s of topf) if (s.an) abwuergen(s);
    for (let o = 0; o < ortDrin.length; o++) ortDrin[o] = 0;
    z.sVor = NaN;
  }

  // Ein Bild. modus wie im Klangwerk; z: hx, hz, hyaw (Kamera), s (Streckenmeter), tempo
  function aktualisiere(dt, modus, h) {
    z.uhr += dt;
    if (!U.an || !Q) return;
    const aktiv = modus === 'countdown' || modus === 'rennen' || modus === 'ziel' || modus === 'pause';
    if (!aktiv && !z.aktiv) return; // Titel, Menü, Demo-Fahrt: still (und nichts zu tun)
    jetzt = ctx.currentTime;
    dauerStarten();
    if (!aktiv) { // Titel, Menü, Demo-Fahrt: still
      if (z.aktiv) allesAus();
      z.aktiv = false;
      return;
    }
    z.aktiv = true; z.pause = modus === 'pause';
    if (Number.isFinite(h.hx)) { z.hx = h.hx; z.hz = h.hz; z.yaw = h.hyaw || 0; }
    z.s = Number.isFinite(h.s) ? h.s : z.s;
    z.tempo = modus === 'countdown' ? 0 : Math.abs(h.tempo || 0);
    gemurmel();
    brunnen();
    boeen(dt);
    jubelNachfuehren();
    if (!z.pause) { // in der Pause steht die Welt: nichts Neues
      glocken();
      voegel(dt);
      fanSpots(modus === 'rennen');
    }
    z.sVor = z.s;
  }

  return {
    setzeQuellen, aktualisiere, allesAus, jubel, klatschen, zustand: z, zaehler, zaehl, topf, dauerQuellen, protokoll,
    get quellen() { return Q; },
    get stimmen() { let n = 0; for (const s of topf) if (s.an) n++; return n; },
    knoten: { murmel, brunnen: bru, boeGain, boeLp, heulBp, heulGain },
    // Tests und Ton-Labor: Hilfen
    glockenAbstand, glockenSchlag, vogelDichte, passStaerke, raum: ro, einmal, get herdVar() { return herdVar; },
  };
}
