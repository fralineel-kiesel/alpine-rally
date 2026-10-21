// Ton (Meilenstein 7a, M7a.1): Motor, Reifen, Wind, Aufprall und Signale – alles im Code erzeugt (Web Audio).
// Keine Dateien, keine Samples: nur Oszillatoren, Rauschen-Puffer, Filter und Verstärker (laufen im Audio-Thread
// des Browsers). Einmalige Klänge (Aufprall, Knall, Zischen, Ratschen, Fanfaren) und das Rauschen werden nach dem
// Entsperren einmal als kleine Puffer berechnet – in Häppchen, damit das Spiel nicht ruckelt – und dann wiederverwendet.
//
// Schienen (Busse):
//   master (Regler LAUTSTÄRKE, quadratisch) -> Limiter -> Lautsprecher
//     fahrzeug: Motor und Reifen (beide über das Ducking), Aufprall, Schleifen
//     umgebung: Fahrtwind; seit M7b Kuhglocken, Publikum, Vögel, Brunnen, Böen (js/umgebung.js); mit Pausen-Tiefpass und Ducking
//     signale:  Menü, Pause, Countdown, Checkpoint, Ziel, Pace-Notes (M7a.1: dazu Regler SIGNALTÖNE, quadratisch)
//     musik:    Menü-Musik (M7b, js/musik.js), mit Regler MUSIK (quadratisch) und Ducking unter den Signalen
// Der Ton liest nur Zahlen aus dem Spiel (aktualisiere() einmal pro Bild, Ereignisse einzeln) und ändert nie etwas daran.
// Gibt es kein Web Audio (oder ?ton=aus, ?menue=aus, audio.an = false), tun alle Aufrufe nichts: das Spiel läuft stumm.
// Alle Werte: config.js, Block "audio". Probehören: ton-labor.html (gleicher Code).

import { CONFIG } from './config.js';
import { zufall } from './util.js';
import { baueUmgebung, umgebungRezepte } from './umgebung.js';
import { bauePlayer, musikRezepte } from './musik.js';

const begr = (w, a, b) => (w < a ? a : w > b ? b : w);
const mische = (a, b, t) => a + (b - a) * t;
const ZWEI_PI = Math.PI * 2;

// Notenname ('C5', 'F#4', 'Bb3') -> Hz (A4 = 440). 'R' = Pause (0)
const NOTEN = { C: -9, D: -7, E: -5, F: -4, G: -2, A: 0, B: 2 };
export function noteHz(n) {
  const m = /^([A-G])(#|b)?(-?\d)$/.exec(n);
  if (!m) return 0;
  return 440 * 2 ** ((NOTEN[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + (Number(m[3]) - 4) * 12) / 12);
}

// Material eines Hindernisses (Nummer in audio.aufprall.materialien) aus seiner Art (nur für den Ton)
export function materialVon(h) {
  const A = CONFIG.audio.aufprall;
  const art = h.ton || h.rand || (h.kuh ? 'kuh' : null);
  return Math.max(0, A.materialien.indexOf((art && A.artVon[art]) || 'stein'));
}
export const materialNr = (name) => CONFIG.audio.aufprall.materialien.indexOf(name);

// Grundton des Motors (Hz) bei einer Drehzahl (M7a.1): im Leerlauf Drehzahl / 60 x zuendFaktor (ca. 42 Hz), darüber eine
// leicht nach oben gebogene Kurve bis hoechstTon bei hoechstDrehzahl (steigt immer mit der Drehzahl)
export function motorTon(rpm) {
  const M = CONFIG.audio.motor, leer = CONFIG.getriebe.leerlauf, fL = leer / 60 * M.zuendFaktor;
  if (rpm <= leer) return Math.max(0, rpm) / 60 * M.zuendFaktor;
  return fL + (M.hoechstTon - fL) * ((rpm - leer) / (M.hoechstDrehzahl - leer)) ** M.tonKurve;
}

// Wellenformen (M7a.1) als Obertöne: Impulswelle mit schmalem Zacken (Motor), Oktav-Schicht (2. und 4. Oberwelle),
// Heulen (Sinus plus etwas 2. Oberwelle). Ergebnis: [Kosinus-, Sinus-Anteile] für createPeriodicWave
export function wellen(M) {
  const N = 64, pr = new Float32Array(N), pi = new Float32Array(N);
  for (let n = 1; n < N; n++) pr[n] = Math.sin(Math.PI * n * M.pulsBreite) / n;
  const hr = new Float32Array(9), hi = new Float32Array(9);
  hi[2] = 1; hi[4] = 0.6; hi[6] = 0.28; hi[8] = 0.12;
  const wr = new Float32Array(3), wi = new Float32Array(3);
  wi[1] = 1; wi[2] = M.heulenOberwelle;
  return { puls: [pr, pi], hoch: [hr, hi], heulen: [wr, wi] };
}
// Sättigungskurve des Motors: weich (tanh, verzerrung) und darüber hart abgeschnitten (clip)
export function saettigungsKurve(M) {
  const kurve = new Float32Array(1024), k = M.verzerrung, c = M.clip;
  for (let i = 0; i < 1024; i++) { const x = i / 511.5 - 1; kurve[i] = begr(Math.tanh(k * x) / Math.tanh(k), -c, c); }
  return kurve;
}

// --- Puffer-Rezepte -------------------------------------------------------------------------------------------
// Fertig machen: Gleichspannung weg (Mittelwert mit einem weichen Fenster abziehen, Anfang und Ende bleiben 0),
// dann die Spitze auf 0.9 bringen
function normalisiere(d) {
  const n = d.length;
  let summe = 0;
  for (let i = 0; i < n; i++) summe += d[i];
  const k = 2 * summe / n; // Hann-Fenster hat den Mittelwert 0.5
  let spitze = 0;
  for (let i = 0; i < n; i++) { d[i] -= k * (0.5 - 0.5 * Math.cos(ZWEI_PI * i / n)); spitze = Math.max(spitze, Math.abs(d[i])); }
  if (spitze > 1e-6) for (let i = 0; i < n; i++) d[i] *= 0.9 / spitze;
}

// Jedes Rezept: { laenge (Samples), fuelle(daten, von, bis), fertig?(daten) }. fuelle wird in Häppchen aufgerufen,
// der Zustand (Phasen, Filter, Zufall) bleibt dazwischen erhalten. fertig() läuft am Schluss (z. B. Normalisieren).

// Weisses Rauschen (Grundlage für Reifen, Wind, Schleifen, rauhen Motor)
function rauschRezept(rate, sek, rnd) {
  return { laenge: Math.round(rate * sek), fuelle(d, von, bis) { for (let i = von; i < bis; i++) d[i] = rnd() * 2 - 1; } };
}

// Kies: dumpferes Rauschen plus viele kleine Knackser
function kiesRezept(rate, sek, rnd, klicks) {
  let knack = 0, tief = 0;
  const p = klicks / rate, ab = Math.exp(-1 / (rate * 0.0006));
  return {
    laenge: Math.round(rate * sek),
    fuelle(d, von, bis) {
      for (let i = von; i < bis; i++) {
        if (rnd() < p) knack += (rnd() * 2 - 1) * (0.6 + rnd());
        knack *= ab;
        tief += (rnd() * 2 - 1 - tief) * 0.35;
        d[i] = begr(tief * 0.55 + knack * 0.8, -1, 1);
      }
    },
  };
}

// Einmaliger Klang aus Bausteinen (Aufprall je Material, Knall, tiefer Schlag), siehe config.js audio.aufprall.klang.
// Weicher Anfang (3 ms, kein Knacken), Ende auf 0, ohne Gleichspannung, Spitze auf 0.9 gebracht.
function klangRezept(rate, rz, rnd) {
  const n = Math.max(1, Math.round(rate * rz.laenge));
  const an = Math.max(1, Math.round(rate * 0.003)), aus = Math.max(1, Math.round(rate * Math.min(0.06, rz.laenge * 0.25)));
  const k = rz.knall || [0, 1, 1000], s = rz.schlag || [0, 0, 1, 0], r = rz.rascheln || [0, 1, 0];
  const kK = 1 - Math.exp(-ZWEI_PI * k[2] / rate);
  const md = rz.moden || [];
  const mf = new Float64Array(md.length), ma = new Float64Array(md.length), mp = new Float64Array(md.length);
  md.forEach((m, j) => { mf[j] = ZWEI_PI * m[0] / rate; ma[j] = Math.exp(-1 / (rate * m[1])); mp[j] = m[2]; });
  const mPh = new Float64Array(md.length), mHuell = new Float64Array(md.length).fill(1);
  const rAb = Math.exp(-1 / (rate * 0.0008));
  const rBp = r[3] ? 2 * Math.sin(Math.PI * r[3] / rate) : 0; // Rascheln um diese Mitte (M7a.1, Stein: Gruss statt Klingeln)
  let lp = 0, kH = 1, sPh = 0, sH = 1, rasch = 0, raschF = 0, rLo = 0, rBand = 0, dcX = 0, dcY = 0;
  const kAb = Math.exp(-1 / (rate * k[1])), sAb = Math.exp(-1 / (rate * s[2])), rDichte = r[2] / rate;
  return {
    laenge: n,
    fuelle(d, von, bis) {
      for (let i = von; i < bis; i++) {
        const t = i / rate;
        lp += (rnd() * 2 - 1 - lp) * kK;
        let v = k[0] * lp * kH; kH *= kAb;
        for (let j = 0; j < mf.length; j++) { mPh[j] += mf[j]; v += mp[j] * Math.sin(mPh[j]) * mHuell[j]; mHuell[j] *= ma[j]; }
        if (s[3]) {
          const f = s[1] + (s[0] - s[1]) * Math.exp(-t / 0.04);
          sPh += ZWEI_PI * f / rate;
          v += s[3] * Math.sin(sPh) * sH; sH *= sAb;
        }
        if (r[0]) {
          if (rnd() < rDichte) rasch += rnd() * 2 - 1;
          rasch *= rAb;
          raschF += (rasch - raschF) * 0.5;
          let rv = raschF;
          if (rBp) { rLo += rBp * rBand; rBand += rBp * (rv - rLo - rBand); rv = rBand * 3; }
          v += r[0] * rv * Math.exp(-t * 3 / r[1]) * Math.min(1, t / 0.008);
        }
        let y = v - dcX + 0.995 * dcY; dcX = v; dcY = y; // Gleichspannung (grob) weg
        if (i < an) y *= i / an;                       // weicher Anfang ...
        if (i > n - aus) y *= (n - i) / aus;           // ... und Ende auf 0
        d[i] = y;
      }
    },
    fertig: normalisiere,
  };
}

// Blow-off: Rauschen durch einen Bandpass, der von blowOffTon auf die Hälfte fällt
function blowOffRezept(rate, M, rnd) {
  const n = Math.round(rate * (M.blowOffDauer + 0.05));
  let lo = 0, band = 0;
  return {
    laenge: n,
    fuelle(d, von, bis) {
      for (let i = von; i < bis; i++) {
        const t = i / rate;
        const fc = M.blowOffTon * (1 - 0.5 * Math.min(1, t / M.blowOffDauer));
        const f = 2 * Math.sin(Math.PI * fc / rate);
        const x = rnd() * 2 - 1;
        lo += f * band; const hi = x - lo - 0.6 * band; band += f * hi;
        const huell = Math.min(1, t / 0.012) * Math.exp(-t / (M.blowOffDauer * 0.4)) * (i > n - 200 ? (n - i) / 200 : 1);
        d[i] = band * huell;
      }
    },
    fertig: normalisiere,
  };
}

// Pop (Auspuff) und Getriebe-Klack (M7a.1): kurzer Rauschstoss durch einen Bandpass um "mitte" Hz, darunter ein kurzer
// tiefer Schlag (tief: [Hz Anfang, Hz Ende, Abklingen s, Pegel]). Sehr kurz, Anfang in 2 ms (knackig, aber kein Knacken), Ende auf 0
function popRezept(rate, P, rnd) {
  const n = Math.round(rate * P.laenge);
  const f = 2 * Math.sin(Math.PI * Math.min(P.mitte, rate / 6) / rate), daempf = 1 / P.guete;
  const [t0, t1, tAb, tPegel] = P.tief;
  const aus = Math.max(1, Math.round(rate * 0.004));
  let lo = 0, band = 0, ph = 0;
  return {
    laenge: n,
    fuelle(d, von, bis) {
      for (let i = von; i < bis; i++) {
        const t = i / rate;
        lo += f * band; band += f * (rnd() * 2 - 1 - lo - daempf * band);
        ph += ZWEI_PI * (t1 + (t0 - t1) * Math.exp(-t / 0.01)) / rate;
        let v = (band * Math.exp(-t / P.abklingen) + tPegel * Math.sin(ph) * Math.exp(-t / tAb)) * Math.min(1, t / 0.002);
        if (i > n - aus) v *= (n - i) / aus;
        d[i] = v;
      }
    },
    fertig: normalisiere,
  };
}

// Handbremse: kurze Klack-Folge (Rauschstoss plus kleiner metallischer Ring)
function ratschRezept(rate, R, rnd) {
  const n = Math.round(rate * (R.ratschDauer + 0.04));
  const zeiten = [];
  for (let k = 0; k < R.ratschKlacks; k++) zeiten.push(Math.round(rate * (k * R.ratschDauer / R.ratschKlacks + rnd() * 0.006)));
  let hp = 0, alt = 0, ph = 0;
  return {
    laenge: n,
    fuelle(d, von, bis) {
      for (let i = von; i < bis; i++) {
        let huell = 0;
        for (let k = 0; k < zeiten.length; k++) {
          const dt = (i - zeiten[k]) / rate;
          if (dt >= 0 && dt < 0.03) huell += Math.min(1, dt / 0.0004) * Math.exp(-dt / 0.004) * (1 - 0.1 * k);
        }
        const x = rnd() * 2 - 1;
        hp = 0.9 * (hp + x - alt); alt = x; // Hochpass: hell und klickend
        ph += ZWEI_PI * 3200 / rate;
        d[i] = huell * (hp * 0.8 + 0.4 * Math.sin(ph));
      }
    },
    fertig: normalisiere,
  };
}

// Fanfare im 80er-Stil: Rechteck-Melodie (bandbegrenzt, kein Klirren), zweite Stimme, Dreieck-Bass
function fanfareRezept(rate, F, stueck) {
  const schlag = 60 / F.tempo;
  const stimme = (liste) => {
    const ab = [], bis = [], hz = [];
    let t = 0;
    for (const [note, laenge] of liste) { const f = noteHz(note); if (f > 0) { ab.push(t); bis.push(t + laenge * schlag); hz.push(f); } t += laenge * schlag; }
    return { ab, bis, hz, ende: t, nr: 0, ph: 0 };
  };
  const st = [stimme(stueck.melodie), stimme(stueck.zweite || []), stimme(stueck.bass || [])];
  const ende = Math.max(...st.map((s) => s.ende)) + 0.3;
  const n = Math.round(rate * ende);
  const blep = (t, dt) => {
    if (t < dt) { t /= dt; return t + t - t * t - 1; }
    if (t > 1 - dt) { t = (t - 1) / dt; return t * t + t + t + 1; }
    return 0;
  };
  let lp = 0;
  return {
    laenge: n,
    fuelle(d, von, bis) {
      for (let i = von; i < bis; i++) {
        const t = i / rate;
        let v = 0;
        for (let s = 0; s < 3; s++) {
          const S = st[s];
          while (S.nr < S.ab.length && t >= S.bis[S.nr]) S.nr++;
          if (S.nr >= S.ab.length || t < S.ab[S.nr]) continue;
          const seit = t - S.ab[S.nr], rest = S.bis[S.nr] - t, dauer = S.bis[S.nr] - S.ab[S.nr];
          const vib = dauer > 0.5 && seit > 0.25 ? 1 + 0.006 * Math.sin(ZWEI_PI * 5.5 * seit) : 1;
          const f = S.hz[S.nr] * vib, dt = f / rate;
          S.ph += dt; if (S.ph >= 1) S.ph -= 1;
          // Hüllkurve: kurzer Anschlag, fällt auf 0.7, vor dem Ende kurz absetzen (am Schluss länger ausklingen)
          const letzte = S.nr === S.ab.length - 1;
          const huell = Math.min(1, seit / 0.005) * (0.7 + 0.3 * Math.exp(-seit / 0.08))
            * Math.min(1, rest / (letzte ? Math.min(0.35, dauer * 0.5) : 0.03));
          let w;
          if (s === 2) w = 4 * Math.abs(S.ph - 0.5) - 1; // Dreieck (Bass)
          else { w = S.ph < 0.5 ? 1 : -1; w += blep(S.ph, dt); w -= blep((S.ph + 0.5) % 1, dt); }
          v += w * huell * (s === 0 ? 0.5 : s === 1 ? 0.28 : 0.45);
        }
        lp += (v - lp) * 0.55; // etwas weicher (80er-Chip, aber nicht schrill)
        d[i] = lp;
      }
    },
    fertig: normalisiere,
  };
}

// --- Das Klangwerk: alle Knoten auf einem AudioContext (im Spiel) oder OfflineAudioContext (nur Tests) -----------
export function baueKlangwerk(ctx) {
  const C = CONFIG.audio, M = C.motor, R = C.reifen, WI = C.wind, AU = C.aufprall, S = C.signale;
  const G = CONFIG.getriebe;
  const rate = ctx.sampleRate;
  const rnd = zufall(C.seed);          // Ereignisse (Poppen, Aufprall-Varianten): gleiches Fahren = gleiche Töne
  const rndP = zufall(C.seed + 1);     // Puffer (M7a.1 eigene Folge: die Ereignisse hängen nicht davon ab, wann gerechnet wird)
  const zaehl = { knotenAktiv: 0, knotenErzeugt: 0 };
  const gain = (wert, ziel) => { const g = ctx.createGain(); g.gain.value = wert; if (ziel) g.connect(ziel); return g; };
  const filter = (typ, hz, q, ziel) => {
    const f = ctx.createBiquadFilter(); f.type = typ; f.frequency.value = hz; if (q != null) f.Q.value = q; if (ziel) f.connect(ziel); return f;
  };
  const osz = (typ, hz, ziel) => { const o = ctx.createOscillator(); o.type = typ; o.frequency.value = hz; if (ziel) o.connect(ziel); o.start(); return o; };

  // --- Schienen ---
  const master = gain(0);
  const limiter = ctx.createDynamicsCompressor();
  limiter.threshold.value = C.limiter.schwelle; limiter.knee.value = C.limiter.knie; limiter.ratio.value = C.limiter.verhaeltnis;
  limiter.attack.value = C.limiter.angriff; limiter.release.value = C.limiter.loslassen;
  const decke = ctx.createWaveShaper(); // Sicherheits-Decke (M7a.1): nichts geht über C.decke.max
  {
    const k = C.decke.weich, d = C.decke.max, n = 4096, kurve = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const x = i / ((n - 1) / 2) - 1, a = Math.abs(x);
      kurve[i] = Math.sign(x) * (a <= k ? a : k + (d - k) * Math.tanh((a - k) / (d - k)));
    }
    decke.curve = kurve;
  }
  master.connect(limiter); limiter.connect(decke); decke.connect(ctx.destination);
  const fahrzeug = gain(C.busse.fahrzeug, master);
  const signaleRegler = gain(1, master);           // Regler SIGNALTÖNE (M7a.1)
  const signale = gain(C.busse.signale, signaleRegler);
  const musikRegler = gain(1, master);              // Regler MUSIK (M7b)
  const musik = gain(C.busse.musik, musikRegler);
  const umgDuck = gain(1, master), umgPause = gain(1, umgDuck);
  const umgFilter = filter('lowpass', 20000, 0.7, umgPause);
  const umgebung = gain(C.busse.umgebung, umgFilter);
  const duck = gain(1, fahrzeug); // Ducking für Motor und Reifen

  // --- Motor ---
  // Grundton f0 (ConstantSource) -> Sägezahn + Impulswelle + Dreieck (halber Ton) + Oktav-Schicht + Brabbeln + rauhes,
  // im Zündtakt pulsierendes Rauschen -> Lautstärke-Schwanken (AM) -> Sättigung -> Tiefpass -> Biss -> Last -> Begrenzer -> aus
  const W = wellen(M);
  const welle = (w) => ctx.createPeriodicWave(w[0], w[1]);
  const motorAus = gain(0, duck);                 // Pause / Menü / Ziel-Stand: weich ein und aus
  const begrenzer = gain(1, motorAus);           // Drehzahlbegrenzer: schnelles Ein/Aus
  const motorLast = gain(0, begrenzer);          // Lautstärke je Last und Drehzahl
  const motorHp = filter('highpass', 16, 0.7, motorLast); // keine Gleichspannung, kein Rumpeln unter dem Halbton
  const biss = filter('peaking', M.bissHz, M.bissGuete, motorHp); biss.gain.value = M.bissDb; // Biss bei 1.5-3 kHz
  const motorLp = filter('lowpass', 600, M.filterQ, biss);
  const saettigung = ctx.createWaveShaper();
  saettigung.curve = saettigungsKurve(M);
  saettigung.connect(motorLp);
  const amGain = gain(1 - M.amTiefe, saettigung);
  const summe = gain(1, amGain);
  const f0 = ctx.createConstantSource ? ctx.createConstantSource() : null; // Grundton als ein Wert für alle Oszillatoren
  const saegeGain = gain(M.saege, summe), pulsGain = gain(M.puls, summe);
  const saege = osz('sawtooth', f0 ? 0 : 50, saegeGain);
  const puls = osz('sine', f0 ? 0 : 50, pulsGain); puls.setPeriodicWave(welle(W.puls));
  const unterGain = gain(M.unter, summe);
  const unter = osz('triangle', f0 ? 0 : 25, unterGain);
  const oberGain = gain(M.oberwelle, summe);
  const ober = osz('sine', M.schwebung, oberGain);
  const hochGain = gain(0, summe);
  const hoch = osz('sine', f0 ? 0 : 50, hochGain); hoch.setPeriodicWave(welle(W.hoch));
  const amOsz = osz('sine', f0 ? 0 : 25);
  const amTiefe = gain(M.amTiefe, amGain.gain); amOsz.connect(amTiefe);
  const rauhBp = filter('bandpass', 0, M.rauhGuete, null);
  const rauhGain = gain(0, summe);
  const rauhPuls = gain(1 - M.rauhPuls, rauhGain); rauhBp.connect(rauhPuls); // pulsiert im Takt der Zündungen ...
  const rauhPulsTiefe = gain(M.rauhPuls, rauhPuls.gain); puls.connect(rauhPulsTiefe); // ... (die Impulswelle steuert die Lautstärke)
  let rauhF = null;
  if (f0) {
    f0.offset.value = G.leerlauf / 60 * M.zuendFaktor;
    f0.connect(saege.frequency); f0.connect(puls.frequency); f0.connect(hoch.frequency);
    const halb = gain(0.5); f0.connect(halb); halb.connect(unter.frequency); halb.connect(amOsz.frequency);
    const doppelt = gain(2); f0.connect(doppelt); doppelt.connect(ober.frequency);
    rauhF = gain(M.rauhOberwelle); f0.connect(rauhF); rauhF.connect(rauhBp.frequency);
    f0.start();
  } else rauhBp.frequency.value = 300;
  const turboGain = gain(0, motorAus);
  const turbo = osz('sine', M.turboTonMin, turboGain);
  const heulenGain = gain(0, motorAus);
  const heulenLp = filter('lowpass', M.heulenFilter, 0.7, heulenGain);
  const heulen = osz('sine', 200, heulenLp); heulen.setPeriodicWave(welle(W.heulen));
  const begrenzerTiefe = gain(0, begrenzer.gain);
  const begrenzerOsz = osz('square', M.begrenzerHz, begrenzerTiefe);

  // --- Reifen (über Pausen-Dämpfung und Ducking) ---
  const reifenPause = gain(1, duck);
  const reifenFilter = filter('lowpass', 20000, 0.7, reifenPause);
  const surrenGain = gain(0, reifenFilter), surrenLp = filter('lowpass', 300, 0.8, surrenGain);
  const weichGain = gain(0, reifenFilter), weichLp = filter('lowpass', 300, 0.6, weichGain);
  const kiesGain = gain(0, reifenFilter), kiesBp = filter('bandpass', 2000, 0.6, kiesGain);
  const quietschGain = gain(0, reifenFilter);
  const quietschBp = filter('bandpass', 1100, 8, gain(0.7, quietschGain));
  const quietschOsz = osz('sine', 1100, gain(0.35, quietschGain));
  const qWackeln = gain(R.quietschWackeln, quietschOsz.frequency);
  osz('sine', R.quietschWackelnHz, qWackeln);
  const rutschGain = gain(0, reifenFilter), rutschBp = filter('bandpass', R.rutschGrenze, 0.8, rutschGain);
  const schleifenGain = gain(0, fahrzeug), schleifenBp = filter('bandpass', 1200, 2, schleifenGain);
  // --- Wind (Schiene umgebung) ---
  const windGain = gain(0, umgebung), windLp = filter('lowpass', C.wind.grenze, 0.5, windGain);

  // --- Puffer (nach dem Entsperren in Häppchen berechnet) ---
  const puffer = {};
  // M8d: Motor-Puffer (Pop, Klack, Blow-off) hängen am Motorklang des Autos. Schlüssel = die Werte, aus denen sie gerechnet
  // werden; gebaute Puffer bleiben gemerkt (zurück zum Audan = wieder genau seine Puffer, nichts wird doppelt gerechnet)
  const MOTOR_PUFFER = ['pop', 'klack', 'blowOff'];
  const motorSchluessel = (name) => JSON.stringify(name === 'blowOff' ? [M.blowOffDauer, M.blowOffTon] : M[name]);
  const pufferVon = {};            // Schlüssel des Puffers, der gerade in puffer[name] liegt
  const pufferLager = new Map();   // `${name}|${Schlüssel}` -> Puffer
  const quellen = []; // Dauer-Rauschquellen (für Tests und zum Aufräumen)
  let kiesQuelle = null, rutschQuelle = null;
  function dauerQuelle(buf, ziel, versatz) {
    const q = ctx.createBufferSource(); q.buffer = buf; q.loop = true; q.connect(ziel);
    q.start(0, versatz % buf.duration); quellen.push(q);
    return q;
  }
  const auftraege = [
    ...musikRezepte(rate, zufall(C.seed + 3)), // M7b: Schlagzeug der Musik zuerst (die Musik beginnt gleich nach dem Entsperren)
    ['rauschen', () => rauschRezept(rate, 2, rndP), (b) => {
      dauerQuelle(b, rauhBp, 0.1); dauerQuelle(b, surrenLp, 0.37); dauerQuelle(b, weichLp, 0.81);
      dauerQuelle(b, quietschBp, 1.13); dauerQuelle(b, schleifenBp, 1.41); dauerQuelle(b, windLp, 1.77);
    }],
    ['kies', () => kiesRezept(rate, 1.5, rndP, R.kiesKlicks), (b) => {
      kiesQuelle = dauerQuelle(b, kiesBp, 0.2); rutschQuelle = dauerQuelle(b, rutschBp, 0.9);
      rutschQuelle.playbackRate.value = 1.35;
    }],
    ['pop', () => { pufferVon.pop = motorSchluessel('pop'); return popRezept(rate, M.pop, rndP); }],
    ['klack', () => { pufferVon.klack = motorSchluessel('klack'); return popRezept(rate, M.klack, rndP); }],
    ['blowOff', () => { pufferVon.blowOff = motorSchluessel('blowOff'); return blowOffRezept(rate, M, rndP); }],
    ['ratsch', () => ratschRezept(rate, R, rndP)],
    ['schlag', () => klangRezept(rate, AU.schlag, rndP)],
    ...AU.materialien.map((m) => [`aufprall-${m}`, () => klangRezept(rate, AU.klang[m], rndP)]),
    ['fanfareKurz', () => fanfareRezept(rate, S.fanfare, S.fanfare.kurz)],
    ['fanfareLang', () => fanfareRezept(rate, S.fanfare, S.fanfare.lang)],
    ...umgebungRezepte(rate, zufall(C.umgebung.seed + 2)), // M7b: Glocken, Vögel, Gemurmel, Brunnen, Jubel, Klatschen
  ];
  const aufbau = { fertig: false, ms: 0, haeppchen: 0, laengstesMs: 0, start: 0, ende: 0 };
  let auftrag = 0, rezept = null, buf = null, daten = null, pos = 0;
  // Ein Häppchen: rechnet höchstens budgetMs lang. Ergebnis: true = alles fertig
  function rechne(budgetMs) {
    const t0 = performance.now();
    while (auftrag < auftraege.length) {
      if (!rezept) {
        rezept = auftraege[auftrag][1]();
        buf = ctx.createBuffer(1, rezept.laenge, rezept.rate || rate); // (M7b: manche Klänge mit halber Abtastrate)
        daten = buf.getChannelData(0); pos = 0;
      }
      const ende = rezept.laenge + (rezept.extra || 0); // extra (M7b): Nachlauf einer Schleife, auch in Häppchen
      if (pos < ende) { // (M7b: Blöcke von 512 Samples, "fertig" in einem eigenen Schritt – jedes Häppchen bleibt kurz)
        const bis = Math.min(ende, pos + 512);
        rezept.fuelle(daten, pos, bis);
        pos = bis;
      } else {
        if (rezept.fertig) rezept.fertig(daten);
        if (rezept.schleifeEnde) buf.schleifeEnde = rezept.schleifeEnde; // M7b: Ende einer nahtlosen Schleife (Sample)
        const [name, , dann] = auftraege[auftrag];
        puffer[name] = buf;
        if (dann) dann(buf);
        rezept = null; auftrag++;
      }
      if (performance.now() - t0 >= budgetMs) break;
    }
    const ms = performance.now() - t0;
    aufbau.ms += ms; aufbau.haeppchen++; aufbau.laengstesMs = Math.max(aufbau.laengstesMs, ms);
    if (auftrag >= auftraege.length && !aufbau.fertig) {
      aufbau.fertig = true; aufbau.ende = performance.now();
      for (const n of MOTOR_PUFFER) pufferLager.set(`${n}|${pufferVon[n]}`, puffer[n]);
      if (motorWechsel.offen) motorPufferNeu(motorWechsel.sofort); // (M8d: Auto gewechselt, während noch gebaut wurde)
    }
    return aufbau.fertig;
  }
  // Im Spiel: Häppchen mit Pausen dazwischen (setTimeout), das Spiel bleibt flüssig
  function puffernStarten() {
    aufbau.start = performance.now();
    const weiter = () => { if (!rechne(C.pufferSchritt)) setTimeout(weiter, 0); };
    setTimeout(weiter, 0);
  }
  // Tests (OfflineAudioContext): alles sofort
  function puffernSofort() { aufbau.start = performance.now(); while (!rechne(1e9)); }
  // Ton-Labor (M7a.1, Feinschliff): einen Teil mit den aktuellen Werten aus CONFIG neu bauen ('saettigung' oder ein Puffername)
  function neuBauen(was) {
    if (was === 'saettigung') { saettigung.curve = saettigungsKurve(M); return true; }
    const a = auftraege.find((x) => x[0] === was);
    if (!a || !aufbau.fertig) return false;
    const rz = a[1](), b = ctx.createBuffer(1, rz.laenge, rz.rate || rate), d = b.getChannelData(0);
    rz.fuelle(d, 0, rz.laenge + (rz.extra || 0));
    if (rz.fertig) rz.fertig(d);
    if (rz.schleifeEnde) b.schleifeEnde = rz.schleifeEnde;
    puffer[was] = b;
    return true;
  }

  // --- M8d: Motorklang eines anderen Autos (die Werte in CONFIG.audio.motor sind schon umgeschaltet, js/fahrprofil.js) ---
  // Was der Ton jedes Bild liest, wirkt sofort. Hier wird nur neu gesetzt, was beim Bau fest ist: Wellenformen,
  // Sättigungskurve, Biss-Filter, Güten, Anteile der Schichten, Begrenzer- und Heulen-Werte (an denselben Knoten: keine
  // neuen Knoten, nichts zu trennen) und die Motor-Puffer (gemerkt oder in Häppchen neu gerechnet wie beim Laden).
  // Im Spiel nur im Menü (Motor aus). Ist der Motor gerade zu hören (Ton-Labor), wird er dafür 60 ms weich stumm.
  // sofort = true: Puffer gleich rechnen (Tests mit OfflineAudioContext)
  const motorWechsel = { offen: false, sofort: false, anzahl: 0, haeppchen: 0, laengstesMs: 0, gerechnet: 0, ausLager: 0, stummBis: -1 };
  function motorFestSetzen() {
    const w = wellen(M);
    puls.setPeriodicWave(welle(w.puls)); hoch.setPeriodicWave(welle(w.hoch)); heulen.setPeriodicWave(welle(w.heulen));
    saettigung.curve = saettigungsKurve(M);
    biss.frequency.value = M.bissHz; biss.Q.value = M.bissGuete; biss.gain.value = M.bissDb;
    motorLp.Q.value = M.filterQ; rauhBp.Q.value = M.rauhGuete;
    if (rauhF) rauhF.gain.value = M.rauhOberwelle;
    saegeGain.gain.value = M.saege; pulsGain.gain.value = M.puls; oberGain.gain.value = M.oberwelle; ober.frequency.value = M.schwebung;
    rauhPuls.gain.value = 1 - M.rauhPuls; rauhPulsTiefe.gain.value = M.rauhPuls;
    heulenLp.frequency.value = M.heulenFilter; begrenzerOsz.frequency.value = M.begrenzerHz;
    if (!f0) rauhBp.frequency.value = 300;
  }
  // Motor-Puffer zum aktuellen Motorklang: aus dem Lager oder neu (eigene feste Zufallsfolge je Schlüssel)
  function motorPufferNeu(sofort) {
    motorWechsel.offen = false;
    const fehlend = [];
    for (const n of MOTOR_PUFFER) {
      const k = motorSchluessel(n);
      if (pufferVon[n] === k) continue;
      const alt = pufferLager.get(`${n}|${k}`);
      if (alt) { puffer[n] = alt; pufferVon[n] = k; motorWechsel.ausLager++; } else fehlend.push([n, k]);
    }
    if (!fehlend.length) return;
    // Häppchen wie beim Laden (512 Samples, höchstens pufferSchritt ms am Stück); der alte Puffer klingt bis dahin weiter
    const job = fehlend.map(([n, k]) => {
      let h = 0; for (let i = 0; i < k.length; i++) h = (h * 31 + k.charCodeAt(i)) >>> 0;
      const r = zufall(C.seed + 11 + (h % 100000));
      const rz = n === 'blowOff' ? blowOffRezept(rate, M, r) : popRezept(rate, M[n], r);
      const b = ctx.createBuffer(1, rz.laenge, rate);
      return { n, k, rz, b, d: b.getChannelData(0), pos: 0 };
    });
    let j = 0;
    const motorPufferHappen = (budget) => {
      const t0 = performance.now();
      while (j < job.length) {
        const x = job[j];
        if (x.pos < x.rz.laenge) { const bis = Math.min(x.rz.laenge, x.pos + 512); x.rz.fuelle(x.d, x.pos, bis); x.pos = bis; } else {
          if (x.rz.fertig) x.rz.fertig(x.d);
          pufferLager.set(`${x.n}|${x.k}`, x.b);
          if (motorSchluessel(x.n) === x.k) { puffer[x.n] = x.b; pufferVon[x.n] = x.k; } // (inzwischen wieder gewechselt: nur ins Lager)
          motorWechsel.gerechnet++; j++;
        }
        if (performance.now() - t0 >= budget) break;
      }
      const ms = performance.now() - t0;
      motorWechsel.haeppchen++; motorWechsel.laengstesMs = Math.max(motorWechsel.laengstesMs, ms);
      return j >= job.length;
    };
    if (sofort) { while (!motorPufferHappen(1e9)); return; }
    const motorPufferWeiter = () => { if (!motorPufferHappen(C.pufferSchritt)) setTimeout(motorPufferWeiter, 0); };
    setTimeout(motorPufferWeiter, 0);
  }
  // ohneBlende (Ton-Labor, Feinschliff-Regler): sofort umstellen, auch wenn der Motor läuft (sonst stottert er beim Ziehen)
  function motorNeu(sofort = false, ohneBlende = false) {
    motorWechsel.anzahl++;
    const anwenden = () => {
      motorFestSetzen();
      if (aufbau.fertig) motorPufferNeu(sofort); else { motorWechsel.offen = true; motorWechsel.sofort = sofort; }
    };
    const hoerbar = zu.motorAn > 0 && zu.modus !== 'aus' && zu.modus !== 'pause';
    if (!hoerbar || sofort || ohneBlende) { anwenden(); return; }
    // (Labor: Motor kurz weich aus, umstellen, im nächsten Bild blendet aktualisiere() ihn wieder ein)
    motorWechsel.stummBis = ctx.currentTime + 0.12;
    setze(W_AUS, motorAus.gain, 0, 0.01);
    setTimeout(anwenden, 60);
  }

  // --- Weiche Änderungen: jeder Wert wird nachgeführt, nie gesprungen. Gleicher Wert = kein neuer Auftrag ---
  const N_WERTE = 40;
  const letzte = new Float64Array(N_WERTE).fill(NaN);
  function setze(nr, param, wert, tau = C.glaetten) {
    if (Math.abs(wert - letzte[nr]) <= Math.abs(wert) * 1e-4 + 1e-6) return;
    letzte[nr] = wert;
    param.setTargetAtTime(wert, ctx.currentTime, tau);
  }
  // Nummern der nachgeführten Werte
  const W_F0 = 0, W_LP = 1, W_LAST = 2, W_AM = 3, W_AMG = 4, W_RAUH = 5, W_AUS = 6, W_TURBO = 7, W_TURBOHZ = 8,
    W_BEGR = 9, W_BEGRG = 10, W_HEUL = 11, W_HEULHZ = 12, W_SURR = 13, W_SURRLP = 14, W_WEICH = 15, W_WEICHLP = 16,
    W_KIES = 17, W_KIESRATE = 18, W_KIESBP = 19, W_QUIETSCH = 20, W_QHZ = 21, W_QBP = 22, W_RUTSCH = 23, W_WIND = 24,
    W_WINDLP = 25, W_SCHL = 26, W_SCHLHZ = 27, W_SCHLQ = 28, W_RFILTER = 29, W_RPAUSE = 30, W_UFILTER = 31, W_UPAUSE = 32,
    W_MASTER = 33, W_HOCH = 34, W_UNTER = 35, W_SIGNALE = 36, W_MUSIK = 37;

  // --- Einmalige Klänge: Stimmen (höchstens maxStimmen gleichzeitig, die älteste wird ausgeblendet) ---
  const stimmen = [];
  for (let k = 0; k < C.maxStimmen; k++) stimmen.push({ an: false, gen: 0, start: 0, art: '', quelle: null, g: null, extra: null });
  const zaehler = {}; // Ereignisse je Art (für Tests und das Labor)
  const protokoll = []; // die letzten Ereignisse { art, t, wert }
  function merke(art, wert = 0) {
    zaehler[art] = (zaehler[art] || 0) + 1;
    protokoll.push({ art, t: ctx.currentTime, wert });
    if (protokoll.length > 300) protokoll.splice(0, 100);
  }
  function abwuergen(s) {
    const t = ctx.currentTime;
    try { s.g.gain.setTargetAtTime(0, t, 0.008); s.quelle.stop(t + 0.05); } catch { /* schon vorbei */ }
    s.an = false;
  }
  function belege(art, quelle, g, extra, wann) {
    let s = null;
    for (const x of stimmen) if (!x.an) { s = x; break; }
    if (!s) { s = stimmen[0]; for (const x of stimmen) if (x.start < s.start) s = x; abwuergen(s); }
    s.an = true; s.gen++; s.start = ctx.currentTime + wann; s.art = art; s.quelle = quelle; s.g = g; s.extra = extra;
    const gen = s.gen, knoten = extra ? 3 : 2;
    zaehl.knotenAktiv += knoten; zaehl.knotenErzeugt += knoten;
    let fertig = false;
    quelle.onended = () => {
      if (fertig) return; // (Chrome meldet "ended" manchmal doppelt, wenn eine Stimme abgewürgt wird)
      fertig = true;
      zaehl.knotenAktiv -= knoten;
      try { quelle.disconnect(); g.disconnect(); if (extra) extra.disconnect(); } catch { /* egal */ }
      if (s.gen === gen) { s.an = false; s.quelle = null; s.g = null; s.extra = null; }
    };
    return s;
  }
  // Puffer abspielen: pegel, wann (s ab jetzt), rate (Abspieltempo), grenze (Tiefpass Hz, 0 = keiner)
  function spiele(art, name, ziel, pegel, wann = 0, abspiel = 1, grenze = 0) {
    const b = puffer[name];
    if (!b || pegel <= 0) return null;
    const t = ctx.currentTime + wann;
    const q = ctx.createBufferSource(); q.buffer = b; q.playbackRate.value = abspiel;
    const g = gain(pegel, ziel);
    let f = null;
    if (grenze > 0) { f = filter('lowpass', grenze, 0.7, g); q.connect(f); } else q.connect(g);
    q.start(t);
    return belege(art, q, g, f, wann);
  }
  // Kurzer Ton (Signale): form, Tonhöhe (Zahl oder [Anfang, Ende]), Dauer, Pegel
  function piep(art, p, wann = 0, tonhoehe = 0, ziel = signale) {
    const t = ctx.currentTime + wann;
    const a = tonhoehe || (Array.isArray(p.ton) ? p.ton[0] : p.ton), b = tonhoehe || (Array.isArray(p.ton) ? p.ton[1] : p.ton);
    const o = ctx.createOscillator(); o.type = p.form;
    o.frequency.setValueAtTime(a, t);
    if (b !== a) o.frequency.exponentialRampToValueAtTime(b, t + p.dauer);
    const g = ctx.createGain();
    const pegel = p.pegel * S.pegel;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(pegel, t + 0.004);
    g.gain.setTargetAtTime(0, t + p.dauer * 0.7, p.dauer * 0.12);
    o.connect(g); g.connect(ziel);
    o.start(t); o.stop(t + p.dauer + 0.1);
    return belege(art, o, g, null, wann);
  }

  // --- M7b: Umgebung (eigener Stimmen-Topf) und Musik ---
  const umgebungWerk = baueUmgebung(ctx, umgebung, puffer, merke);
  const musikWerk = bauePlayer(ctx, musik, puffer, { offline: typeof OfflineAudioContext !== 'undefined' && ctx instanceof OfflineAudioContext });

  // --- Zustand (nur Zahlen, im Bildtakt keine neuen Objekte) ---
  const z0 = {
    uhr: 0, druck: 0, gasLangsam: 0, pedalLangsam: 0, blowOffBereit: true, knallBereit: true, knallSperre: -1e9,
    begrenzerZeit: 0, zitter: 0, zitterZiel: 0, zitterUhr: 0, hbVorher: false, letzterAufprall: -1e9,
    // Schalten (M7a.1): läuft eine Schaltpause, rauf oder runter, wie viel Gas davor, Gasstoss bis, eigene Sperre
    schaltetVor: false, schaltHoch: false, schaltLast: 0, zwischengasBis: -1e9, schaltTonSperre: -1e9,
    duckEnde: -1e9, duckTiefe: 1, // laufendes Ducking (bis wann, wie tief)
    // Ziele (was zuletzt gesetzt wurde), für Tests und das Labor
    f0: 0, filter: 0, motorPegel: 0, motorAn: 0, turbo: 0, begrenzer: 0, heulen: 0, heulenHz: 0, hoch: 0, surren: 0, weich: 0, kies: 0,
    quietschen: 0, rutschen: 0, wind: 0, schleifen: 0, pause: false, modus: 'aus', duck: 1,
    bestzeitUhr: -1e9, // M7b: wann zuletzt die lange Fanfare kam (Ziel-Musik wartet dann)
  };
  const zu = { ...z0 };
  let countdownStimme = null;
  let menueSperre = null;

  function allesNull(tau) {
    setze(W_AUS, motorAus.gain, 0, tau); setze(W_TURBO, turboGain.gain, 0, tau); setze(W_HEUL, heulenGain.gain, 0, tau);
    setze(W_LAST, motorLast.gain, 0, tau);
    setze(W_SURR, surrenGain.gain, 0, tau); setze(W_WEICH, weichGain.gain, 0, tau); setze(W_KIES, kiesGain.gain, 0, tau);
    setze(W_QUIETSCH, quietschGain.gain, 0, tau); setze(W_RUTSCH, rutschGain.gain, 0, tau);
    setze(W_WIND, windGain.gain, 0, tau); setze(W_SCHL, schleifenGain.gain, 0, tau);
    setze(W_BEGR, begrenzerTiefe.gain, 0, tau); setze(W_BEGRG, begrenzer.gain, 1, tau);
    zu.motorAn = 0; zu.motorPegel = 0; zu.turbo = 0; zu.heulen = 0; zu.surren = 0; zu.weich = 0; zu.kies = 0;
    zu.quietschen = 0; zu.rutschen = 0; zu.wind = 0; zu.schleifen = 0; zu.begrenzer = 0;
  }
  function pauseMix(an) {
    const P = C.pause, tau = P.blende / 3;
    setze(W_RFILTER, reifenFilter.frequency, an ? P.filter : 20000, tau); setze(W_RPAUSE, reifenPause.gain, an ? P.pegel : 1, tau);
    setze(W_UFILTER, umgFilter.frequency, an ? P.filter : 20000, tau); setze(W_UPAUSE, umgPause.gain, an ? P.pegel : 1, tau);
    zu.pause = an;
  }

  // Ein Bild. z: { modus ('aus' | 'countdown' | 'rennen' | 'ziel' | 'pause' | M8e: 'garage' = nur der Motor, das Auto
  //   steht: Aufheulen in der Garage, ohne Reifen, Wind und Umgebung), drehzahl, gang, schaltet, gas, bremse,
  //   tempo, vVor, untergrund, drift (Grad), handbremse, aufprall (Wucht m/s in diesem Bild), aufprallArt (Material),
  //   kontaktArt (-1 = kein Kontakt), kontaktTempo, M8b: ladedruck (0..1, echter Ladedruck des Getriebes),
  //   turboAn (Fahrprofil mit Turbo; fehlt/false = eigenes Turbo-Modell wie bis 0.8a),
  //   M8c: turboMal (Pfeifen und Blow-off mal diesem Wert, 0 = kein Turbo-Geräusch; fehlt = 1),
  //   knallMal (Knall-Chance mal diesem Wert; fehlt = 1) – aus dem Fahrprofil (Block "ton") }
  function aktualisiere(dt, z) {
    zu.uhr += dt;
    zu.modus = z.modus;
    // M7b: Musik folgt dem musikModus (Menü, Pause, Ziel; aus im Countdown und Rennen), Umgebung dem Modus und der Kamera
    musikWerk.folge(z.musikModus || 'aus', dt, zu.uhr - zu.bestzeitUhr < 0.5);
    umgebungWerk.aktualisiere(dt, z.modus, z);
    if (z.modus === 'pause') {
      // Pause: Motor stumm, Reifen und Umgebung gedämpft; nichts Neues auslösen (die Welt steht)
      setze(W_AUS, motorAus.gain, 0, C.pause.motorAus / 3); zu.motorAn = 0;
      setze(W_SCHL, schleifenGain.gain, 0, 0.05); zu.schleifen = 0;
      pauseMix(true);
      return;
    }
    pauseMix(false);
    if (z.modus === 'aus') {
      allesNull(0.08);
      zu.druck = 0; zu.begrenzerZeit = 0; zu.hbVorher = false; zu.schaltetVor = false;
      return;
    }
    const faehrt = z.modus === 'rennen' || z.modus === 'ziel';
    // --- Motor ---
    const leer = G.leerlauf, maxD = M.hoechstDrehzahl;
    const rpm = begr(z.drehzahl, 0, maxD * 1.1);
    const pedal = z.modus === 'countdown' ? 0 : z.gas; // Countdown: Auto gesperrt, Gas ändert nichts
    const gas = z.schaltet ? 0 : pedal;                  // Schaltpause: Kupplung offen, keine Last
    // Schalten (M7a.1): Beginn der Schaltpause merken (rauf/runter, wie viel Gas), am Ende Klack, Knall, Zwischengas
    const zielGang = z.zielGang ?? z.gang;
    if (z.schaltet && !zu.schaltetVor) { zu.schaltHoch = zielGang > z.gang; zu.schaltLast = pedal; }
    if (!z.schaltet && zu.schaltetVor) schaltEnde();
    zu.schaltetVor = !!z.schaltet;
    // Zwischengas (Runterschalten): kurz wie Gas für Lautstärke und Helligkeit; der Turbo folgt nur dem echten Gas
    const gasTon = Math.max(gas, zu.uhr < zu.zwischengasBis ? M.zwischengasStaerke : 0);
    // Zünd-Unterbrechung: Hochschalten unter Last -> Motor fällt in der Schaltpause schnell auf schaltDip
    const dip = z.schaltet && zu.schaltHoch && zu.schaltLast > M.schaltLastAb;
    const anteil = begr((rpm - leer) / (maxD - leer), 0, 1);
    const leerlaufig = (1 - begr(anteil * 5, 0, 1)) * (1 - gasTon);
    zu.zitterUhr -= dt;
    if (zu.zitterUhr <= 0) { zu.zitterZiel = rnd() * 2 - 1; zu.zitterUhr = 0.1 + rnd() * 0.12; }
    zu.zitter += (zu.zitterZiel - zu.zitter) * Math.min(1, dt * 10);
    const f = motorTon(rpm) * (1 + M.leerlaufZittern * leerlaufig * zu.zitter);
    zu.f0 = f;
    if (f0) setze(W_F0, f0.offset, f, 0.02);
    else {
      setze(W_F0, saege.frequency, f, 0.02);
      for (const o of [puls, hoch]) o.frequency.setTargetAtTime(f, ctx.currentTime, 0.02);
      for (const o of [unter, amOsz]) o.frequency.setTargetAtTime(f / 2, ctx.currentTime, 0.02);
    }
    zu.filter = M.filterGrund + M.filterDrehzahl * rpm + M.filterGas * gasTon;
    setze(W_LP, motorLp.frequency, zu.filter);
    let last = mische(M.schubPegel, M.lastPegel, dip ? zu.schaltLast : gasTon);
    last = mische(last, M.leerlaufPegel, leerlaufig);
    zu.motorPegel = M.pegel * last * (1 + M.drehzahlPegel * anteil) / (1 + M.drehzahlPegel) * (dip ? M.schaltDip : 1);
    setze(W_LAST, motorLast.gain, zu.motorPegel, dip ? M.schaltDipZeit : C.glaetten);
    const am = mische(M.amTiefe, M.amTiefeLeerlauf, leerlaufig);
    setze(W_AM, amTiefe.gain, am); setze(W_AMG, amGain.gain, 1 - am);
    setze(W_RAUH, rauhGain.gain, M.rauh * (0.3 + 0.7 * gasTon));
    setze(W_UNTER, unterGain.gain, M.unter);
    // Oktav-Schicht: blendet mit steigender Drehzahl ein (ohne Gas schwächer)
    zu.hoch = M.hoch * begr((anteil - M.hochAb) / (1 - M.hochAb), 0, 1) * mische(M.hochSchub, 1, gasTon);
    setze(W_HOCH, hochGain.gain, zu.hoch);
    // Zielbildschirm: steht das Auto, blendet der Motor aus
    const steht = z.modus === 'ziel' && z.tempo < C.zielStand.ab;
    zu.motorAn = steht ? 0 : 1;
    setze(W_AUS, motorAus.gain, ctx.currentTime < motorWechsel.stummBis ? 0 : zu.motorAn, steht ? C.zielStand.blende / 3 : 0.05); // (M8d: stumm beim Umschalten)
    // Turbo: Ladedruck läuft Gas und Drehzahl träge hinterher (eigenes Modell, Profil ohne Turbo wie bis 0.8a).
    // M8b: Mit Turbo im Fahrprofil (z.turboAn) folgt er dem echten Ladedruck des Getriebes (z.ladedruck, nur kurz
    // geglättet): das Pfeifen steigt mit dem Aufbau nach dem Gasgeben und reisst mit Anti-Lag in der Schaltpause nicht ab
    // M8c: turboMal (Fahrprofil) = 0: Auto ohne Turbo (Fard Escorta): kein Pfeifen, kein Blow-off, auch nicht aus dem
    // eigenen Modell (Ladedruck im Ton bleibt 0)
    const turboMal = z.turboMal ?? 1;
    if (!(turboMal > 0)) {
      zu.druck = 0;
      zu.turbo = 0;
    } else if (z.turboAn) {
      zu.druck += (begr(z.ladedruck || 0, 0, 1) - zu.druck) * (1 - Math.exp(-dt / M.turboEchtGlaetten));
      zu.turbo = M.turboPegel * M.turboPegelMal * zu.druck * zu.druck * turboMal;
    } else {
      const druckZiel = gas * begr((rpm - M.turboAb) / (M.turboVoll - M.turboAb), 0, 1);
      zu.druck += (druckZiel - zu.druck) * (1 - Math.exp(-dt / (druckZiel > zu.druck ? M.turboRauf : M.turboRunter)));
      zu.turbo = M.turboPegel * zu.druck * zu.druck * turboMal;
    }
    setze(W_TURBO, turboGain.gain, zu.turbo);
    setze(W_TURBOHZ, turbo.frequency, mische(M.turboTonMin, M.turboTonMax, zu.druck));
    // Blow-off: Gas (inkl. Schaltpause) schnell gefallen bei Ladedruck; beim Schalten unter Last lauter
    zu.gasLangsam += (gas - zu.gasLangsam) * (1 - Math.exp(-dt / M.blowOffZeit));
    if (zu.blowOffBereit && zu.gasLangsam - gas > M.blowOffGasFall && zu.druck > M.blowOffAb) {
      zu.blowOffBereit = false;
      blowOff(z.schaltet && zu.schaltLast > M.schaltLastAb, turboMal);
    }
    if (gas > 0.6) zu.blowOffBereit = true;
    // Poppen: Pedal schnell weg aus hoher Last über knallAb (Zufall aus fester Folge, danach Sperre).
    // M8b: mit Turbo und aktivem Anti-Lag (Drehzahl über turbo.antiLagAb, Ladedruck hoch) etwas öfter (turboKnallPlus)
    zu.pedalLangsam += (pedal - zu.pedalLangsam) * (1 - Math.exp(-dt / M.blowOffZeit));
    if (zu.knallBereit && zu.pedalLangsam - pedal > 0.5 && rpm > M.knallAb && zu.uhr > zu.knallSperre) {
      zu.knallBereit = false;
      zu.knallSperre = zu.uhr + M.knallSperre;
      salve(!!z.turboAn && rpm >= G.turbo.antiLagAb && (z.ladedruck || 0) >= M.blowOffAb, z.knallMal ?? 1);
    }
    if (pedal > 0.6) zu.knallBereit = true;
    // Drehzahlbegrenzer
    zu.begrenzerZeit = gas > 0.9 && rpm >= M.begrenzerAb ? zu.begrenzerZeit + dt : 0;
    zu.begrenzer = zu.begrenzerZeit > M.begrenzerNach ? M.begrenzerTiefe / 2 : 0;
    setze(W_BEGR, begrenzerTiefe.gain, zu.begrenzer, 0.01); setze(W_BEGRG, begrenzer.gain, 1 - zu.begrenzer, 0.01);
    // Rückwärts: Getriebeheulen, Tonhöhe folgt der Motordrehzahl (wie ein Zahnrad), Lautstärke dem Tempo
    const vr = Math.abs(z.vVor);
    zu.heulen = z.gang < 0 ? M.heulenPegel * begr(vr / 2, 0, 1) : 0;
    zu.heulenHz = rpm / 60 * M.heulenFaktor;
    setze(W_HEUL, heulenGain.gain, zu.heulen);
    setze(W_HEULHZ, heulen.frequency, zu.heulenHz);

    // --- Reifen und Untergrund (nur wenn das Auto fährt) ---
    const v = faehrt ? z.tempo : 0;
    const b = R.belaege[z.untergrund] || R.belaege.asphalt;
    const st = begr(v / R.bezugTempo, 0, 1.3) ** 0.85 * begr(v / 0.8, 0, 1);
    zu.surren = b.art === 'surren' ? b.pegel * st : 0;
    zu.weich = b.art === 'weich' ? b.pegel * st : 0;
    zu.kies = b.art === 'kies' ? b.pegel * st : 0;
    setze(W_SURR, surrenGain.gain, zu.surren, R.wechsel); setze(W_WEICH, weichGain.gain, zu.weich, R.wechsel);
    setze(W_KIES, kiesGain.gain, zu.kies, R.wechsel);
    const hell = b.grenze + b.grenzeTempo * v;
    if (b.art === 'surren') setze(W_SURRLP, surrenLp.frequency, hell, R.wechsel);
    if (b.art === 'weich') setze(W_WEICHLP, weichLp.frequency, hell, R.wechsel);
    if (b.art === 'kies') setze(W_KIESBP, kiesBp.frequency, hell, R.wechsel);
    if (kiesQuelle) setze(W_KIESRATE, kiesQuelle.playbackRate, R.kiesRate + v * R.kiesRateTempo);
    // Quietschen (Asphalt) bzw. Rutschen (loser Untergrund)
    const t0 = R.quietschTempo[0], t1 = R.quietschTempo[1];
    const tq = begr((v - t0) / (t1 - t0), 0, 1);
    let q = begr((Math.abs(z.drift) - R.quietschAb) / (R.quietschVoll - R.quietschAb), 0, 1) * tq;
    if (z.handbremse && v > t0) q = Math.max(q, R.handbremseQuietschen * tq);
    const asphalt = z.untergrund === 'asphalt';
    zu.quietschen = asphalt ? R.quietschPegel * q : 0;
    zu.rutschen = asphalt ? 0 : R.rutschPegel * q;
    setze(W_QUIETSCH, quietschGain.gain, zu.quietschen, 0.04); setze(W_RUTSCH, rutschGain.gain, zu.rutschen, 0.04);
    const qhz = mische(R.quietschTon[0], R.quietschTon[1], q);
    setze(W_QHZ, quietschOsz.frequency, qhz, 0.08); setze(W_QBP, quietschBp.frequency, qhz, 0.08);
    // Handbremse ziehen: Ratschen
    if (faehrt && z.handbremse && !zu.hbVorher) { merke('ratsch'); spiele('ratsch', 'ratsch', fahrzeug, R.ratschPegel); }
    zu.hbVorher = !!z.handbremse;
    // --- Wind (umgebung): mit dem Quadrat des Tempos, ab hellAb heller ---
    zu.wind = Math.min(1.6, (v / WI.bezugTempo) ** 2) * WI.pegel;
    setze(W_WIND, windGain.gain, zu.wind, 0.1);
    setze(W_WINDLP, windLp.frequency, WI.grenze + Math.max(0, v - WI.hellAb) * WI.hellProMs, 0.1);
    // --- Aufprall und Schleifen ---
    if (faehrt && z.aufprall >= AU.ab) aufprall(z.aufprall, z.aufprallArt);
    const schl = faehrt && z.kontaktArt >= 0 && z.kontaktTempo > AU.schleifenAb
      ? AU.schleifenPegel * begr((z.kontaktTempo - AU.schleifenAb) / (AU.schleifenVoll - AU.schleifenAb), 0.15, 1) : 0;
    if (schl > 0) {
      const sp = AU.schleifen[AU.materialien[z.kontaktArt]] || AU.schleifen.stein;
      setze(W_SCHLHZ, schleifenBp.frequency, sp[0], 0.02); setze(W_SCHLQ, schleifenBp.Q, sp[1], 0.02);
    }
    zu.schleifen = schl;
    setze(W_SCHL, schleifenGain.gain, schl, schl > 0 ? 0.02 : 0.06);
  }

  // --- Ereignisse ---
  const zwischen = (ab, t) => ab[0] + (ab[1] - ab[0]) * t;
  const ganzZwischen = (ab) => ab[0] + Math.min(ab[1] - ab[0], Math.floor(rnd() * (ab[1] - ab[0] + 1)));
  // (M8c: mal turboMal des Fahrprofils; ohne Turbo kommt es gar nicht so weit, der Ladedruck im Ton bleibt 0)
  function blowOff(schalten = false, turboMal = 1) {
    merke('blowOff', zu.druck);
    spiele('blowOff', 'blowOff', motorAus, M.blowOffPegel * (0.6 + 0.4 * zu.druck) * (schalten ? M.schaltBlowOff : 1) * turboMal);
  }
  // Ein Pop (Auspuff) in wann Sekunden, staerke 0..1 (mal popPegel); art: 'knall', 'knistern' oder 'schaltknall'
  // M8e: knallHoerer(art, zeit, staerke) bekommt jeden Pop mit seiner geplanten Zeit (ctx.currentTime + wann), z. B. für
  // die Flamme aus dem Auspuff. Nur Lesen: keine Zufallszahl, kein Knoten (Ton bleibt bit-gleich)
  let knallHoerer = null;
  function knall(wann = 0, staerke = 1, art = 'knall') {
    merke(art, wann);
    spiele(art, 'pop', motorAus, M.popPegel * staerke, wann, zwischen(M.popTempo, rnd()));
    if (knallHoerer) knallHoerer(art, ctx.currentTime + wann, staerke);
  }
  // Gaswegnehmen aus hoher Last: mit knallChance eine Salve (1-4 Pops), dazu manchmal leises Knistern. Ergebnis: Anzahl Pops.
  // antiLag (M8b): Turbo mit Anti-Lag aktiv -> Chance plus turboKnallPlus (gleich viele Zufallszahlen wie ohne)
  // knallMal (M8c): Knall-Chance mal diesem Wert (Fahrprofil; Fard Escorta 0.5 = etwa halb so oft)
  function salve(antiLag = false, knallMal = 1) {
    let t = zwischen(M.knallFenster, rnd());
    const n = rnd() < M.knallChance * knallMal + (antiLag ? M.turboKnallPlus : 0) ? ganzZwischen(M.popAnzahl) : 0;
    for (let k = 0; k < n; k++) { knall(t, zwischen(M.popStaerke, rnd())); t += zwischen(M.popAbstand, rnd()); }
    if (rnd() < M.knisternChance) {
      const m = ganzZwischen(M.knisternAnzahl);
      for (let k = 0; k < m; k++) knall(rnd() * M.knisternFenster, M.knisternPegel * (0.6 + 0.4 * rnd()), 'knistern');
    }
    merke('salve', n);
    return n;
  }
  // Ende der Schaltpause (Gang eingelegt): Zwischengas beim Runterschalten, Klack, Schaltknall (eigene kurze Sperre)
  function schaltEnde() {
    const last = zu.schaltLast, ohne = last < M.schaltOhneLast, voll = last > M.schaltLastAb;
    merke(zu.schaltHoch ? 'schalten-hoch' : 'schalten-runter', last);
    if (!zu.schaltHoch && (!ohne || M.zwischengasOhneLast)) { zu.zwischengasBis = zu.uhr + M.zwischengasDauer; merke('zwischengas', last); }
    if (zu.uhr < zu.schaltTonSperre) return;
    zu.schaltTonSperre = zu.uhr + M.schaltTonSperre;
    merke('klack', ohne ? M.klackLeise : 1);
    spiele('klack', 'klack', motorAus, M.klackPegel * (ohne ? M.klackLeise : 1));
    const r = rnd();
    if (zu.schaltHoch && voll && r < M.schaltKnallChance) knall(0.005, M.schaltKnallPegel, 'schaltknall');
    if (!zu.schaltHoch && !ohne && r < M.zwischengasKnallChance) knall(0.03, 0.8, 'schaltknall');
  }
  const dbZuFaktor = (db) => 10 ** (db / 20);
  // Ducking: Motor und Reifen (mitUmgebung: auch die Umgebung) kurz um db leiser, nach dauer weich zurück.
  // Ein laufendes tieferes Ducking (harter Aufprall) wird nicht abgeschwächt
  function ducke(db, dauer, zurueck, mitUmgebung) {
    const t = ctx.currentTime, d = dbZuFaktor(db);
    if (t < zu.duckEnde && zu.duckTiefe < d) return;
    zu.duck = d; zu.duckTiefe = d; zu.duckEnde = t + dauer;
    for (const p of mitUmgebung ? [duck.gain, umgDuck.gain] : [duck.gain]) {
      p.cancelScheduledValues(t); p.setTargetAtTime(d, t, 0.01); p.setTargetAtTime(1, t + dauer, zurueck);
    }
  }
  // Aufprall mit Wucht (m/s Richtung Hindernis) und Material (Nummer). Eigene kurze Sperrzeit gegen Rattern
  function aufprall(wucht, art) {
    if (wucht < AU.ab || zu.uhr - zu.letzterAufprall < AU.sperre) return false;
    zu.letzterAufprall = zu.uhr;
    const st = begr(wucht / AU.voll, 0, 1);
    const name = AU.materialien[art] || 'stein', kl = AU.klang[name];
    const pegel = AU.pegel * (kl.pegel ?? 1) * st ** (kl.kurve ?? AU.kurve);
    merke('aufprall', wucht);
    merke(`aufprall-${name}`, pegel);
    spiele('aufprall', `aufprall-${name}`, fahrzeug, pegel, 0, 0.92 + rnd() * 0.16, mische(AU.grenzeLeicht, AU.grenzeHart, st));
    const sm = kl.schlagMit ?? 1; // Stein hat seinen eigenen tiefen Schlag (sonst klingt er zu lange nach)
    if (wucht >= AU.schlagAb && sm > 0) spiele('schlag', 'schlag', fahrzeug, AU.schlagPegel * st * sm, 0, 0.9 + 0.2 * rnd());
    if (wucht >= AU.duckAb) ducke(AU.duckDb, AU.duckDauer, AU.duckZurueck, true);
    return true;
  }
  // Menü: tick, bestaetigen, zurueck, regler (wert 0..1), fehler. Derselbe Ton kurz hintereinander nur einmal
  const menueZeit = {};
  function menue(art, wert = 0) {
    const p = S.menue[art];
    if (!p) return;
    if (art === 'bestaetigen' || art === 'zurueck' || art === 'fehler') musikWerk.ducke(); // M7b
    const jetzt = performance.now() / 1000;
    if (menueSperre !== null && jetzt < menueSperre) return; // gerade kam ein Pausenton (WEITER): kein Blip dazu
    if (jetzt - (menueZeit[art] ?? -1) < S.menue.sperre) return;
    menueZeit[art] = jetzt;
    merke(`menue-${art}`, wert);
    piep(`menue-${art}`, p, 0, art === 'regler' ? mische(p.ton[0], p.ton[1], begr(wert, 0, 1)) : 0);
  }
  function pauseTon(an) {
    merke(an ? 'pause' : 'weiter');
    piep(an ? 'pause' : 'weiter', an ? S.pause : S.weiter);
    if (an && countdownStimme && countdownStimme.an && countdownStimme.art === 'countdown') abwuergen(countdownStimme);
    menueSperre = performance.now() / 1000 + 0.08;
  }
  // Signale im Rennen: der Motor wird kurz leiser (Ducking), damit sie durchkommen
  const signalDuck = () => ducke(S.duckDb, S.duckDauer, S.duckZurueck, false);
  function countdown() { merke('countdown'); countdownStimme = piep('countdown', S.countdown); signalDuck(); }
  function go() { merke('go'); countdownStimme = piep('countdown', S.go); signalDuck(); umgebungWerk.jubel('start', 'go'); } // M7b: Jubel bei GO
  // Checkpoint: u < 0 schneller, u > 0 langsamer, 0 gleich / keine Referenz (dieselbe Entscheidung wie Meldung und Punkte)
  function checkpoint(u) {
    const p = S.checkpoint, toene = u < 0 ? p.schneller : u > 0 ? p.langsamer : p.neutral;
    merke(u < 0 ? 'cp-schneller' : u > 0 ? 'cp-langsamer' : 'cp-neutral', toene[1] - toene[0]);
    piep('checkpoint', p, 0, toene[0]);
    piep('checkpoint', p, p.dauer + p.luecke, toene[1]);
    signalDuck(); musikWerk.ducke();
  }
  function verpasst() { merke('cp-verpasst'); piep('verpasst', S.verpasst); signalDuck(); }
  function fanfare(lang) {
    merke(lang ? 'fanfare-lang' : 'fanfare-kurz');
    spiele('fanfare', lang ? 'fanfareLang' : 'fanfareKurz', signale, S.fanfare.pegel * S.pegel);
    signalDuck(); musikWerk.ducke();
    // M7b: Publikum am Ziel – an der Linie Jubel und Klatschen, bei neuer Bestzeit der lange Jubel (Ziel-Musik wartet)
    if (lang) { zu.bestzeitUhr = zu.uhr; umgebungWerk.jubel('ziel', 'lang'); } else { umgebungWerk.jubel('ziel', 'ziel'); umgebungWerk.klatschen('ziel'); }
  }
  function paceNote(anzahl = 1) {
    for (let k = 0; k < anzahl; k++) { merke('paceNote'); piep('paceNote', S.paceNote, k * S.paceNote.abstand); }
  }
  // Neustart / Hauptmenü: alle Schichten weich auf 0, alle einmaligen Klänge aus, Zustand zurück
  function allesAus() {
    allesNull(0.03);
    for (const s of stimmen) if (s.an) abwuergen(s);
    umgebungWerk.allesAus(); // M7b
    const uhr = zu.uhr;
    Object.assign(zu, z0);
    zu.uhr = uhr;
    for (const p of [duck.gain, umgDuck.gain]) p.setTargetAtTime(1, ctx.currentTime, 0.02);
  }
  function lautstaerke(prozent) { setze(W_MASTER, master.gain, (begr(prozent, 0, 100) / 100) ** C.lautKurve, 0.02); }
  // Regler SIGNALTÖNE (M7a.1): wirkt zusätzlich auf die Schiene signale, gleiche Kurve wie LAUTSTÄRKE
  function signalLautstaerke(prozent) { setze(W_SIGNALE, signaleRegler.gain, (begr(prozent, 0, 100) / 100) ** C.lautKurve, 0.02); }
  // Regler MUSIK (M7b): wirkt zusätzlich auf die Schiene musik, gleiche Kurve wie LAUTSTÄRKE
  function musikLautstaerke(prozent) { setze(W_MUSIK, musikRegler.gain, (begr(prozent, 0, 100) / 100) ** C.lautKurve, 0.02); }

  // Pegelmesser für das Labor: Analyser an master und den Schienen (nur auf Wunsch, im Spiel nicht)
  let messer = null;
  function messerBauen() {
    if (messer) return messer;
    const an = (knoten) => { const a = ctx.createAnalyser(); a.fftSize = 1024; knoten.connect(a); return { a, d: new Float32Array(1024) }; };
    messer = { master: an(decke), fahrzeug: an(fahrzeug), umgebung: an(umgDuck), signale: an(signale), musik: an(musik) };
    return messer;
  }
  function spitzen(ziel) {
    const m = messerBauen();
    for (const k in m) {
      m[k].a.getFloatTimeDomainData(m[k].d);
      let s = 0; for (let i = 0; i < m[k].d.length; i++) s = Math.max(s, Math.abs(m[k].d[i]));
      ziel[k] = s;
    }
    return ziel;
  }

  return {
    ctx, aufbau, puffer, zaehler, protokoll, zustand: zu, zaehl, quellen,
    busse: { master, limiter, decke, fahrzeug, umgebung, signale, signaleRegler, musik, musikRegler, duck, umgDuck, umgFilter, umgPause, reifenFilter, reifenPause },
    // Werte der Knoten (für Tests: echte Parameter)
    knoten: { surrenLp, weichLp, kiesBp, rutschBp, quietschBp, f0, saege, motorAus, motorLast, motorLp, turboGain, turbo, heulenGain, heulen, begrenzerTiefe, begrenzer, surrenGain, weichGain, kiesGain, quietschGain, quietschOsz, rutschGain, windGain, windLp, schleifenGain, schleifenBp, amTiefe, rauhGain, unterGain, hochGain, saettigung,
      biss, rauhBp, saegeGain, pulsGain, oberGain, ober, rauhPuls, rauhPulsTiefe, heulenLp, begrenzerOsz, get rauhF() { return rauhF; } }, // (M8d: feste Teile des Motors)
    get motorPufferVon() { return { ...pufferVon }; }, motorSchluessel, // M8d (Tests): zu welchem Motorklang die Puffer gehören
    get stimmen() { let n = 0; for (const s of stimmen) if (s.an) n++; return n; },
    stimmenListe: stimmen,
    puffernStarten, puffernSofort, neuBauen, motorNeu, motorWechsel, aktualisiere, allesAus, lautstaerke, signalLautstaerke, musikLautstaerke, spitzen,
    musik: musikWerk, umgebung: umgebungWerk, setzeQuellen: (q) => umgebungWerk.setzeQuellen(q), // M7b
    blowOff, knall, salve, aufprall, menue, pauseTon, countdown, go, checkpoint, verpasst, fanfare, paceNote,
    setzeKnallHoerer: (f) => { knallHoerer = f; }, // M8e
  };
}

// --- Ton fürs Spiel: AudioContext erst nach dem ersten Tastendruck, Mausklick oder Gamepad-Knopf auf dem Titel ----
// an = false: alles stumm (Tests mit ?menue=aus, ?ton=aus, audio.an = false). Fehlt Web Audio: ebenso, ohne Fehler.
export function baueTon({ an = true } = {}) {
  const Klasse = typeof window !== 'undefined' ? (window.AudioContext || window.webkitAudioContext) : null;
  let ctx = null, werk = null, laut = 70, sig = 100, mus = 60, quellen = null, knallHoerer = null;
  const ton = {
    an: !!(an && Klasse),
    get ctx() { return ctx; },
    get werk() { return werk; },
    get zustand() { return ctx ? ctx.state : 'keiner'; },
    // Entsperren (beim ersten Tastendruck / Klick): Kontext erzeugen bzw. fortsetzen, Puffer im Hintergrund bauen
    entsperren() {
      if (!ton.an) return;
      try {
        if (!ctx) {
          ctx = new Klasse();
          werk = baueKlangwerk(ctx);
          werk.lautstaerke(laut);
          werk.signalLautstaerke(sig);
          werk.musikLautstaerke(mus);
          if (quellen) werk.setzeQuellen(typeof quellen === 'function' ? quellen() : quellen);
          if (knallHoerer) werk.setzeKnallHoerer(knallHoerer);
          werk.puffernStarten();
        }
        if (ctx.state === 'suspended' && !document.hidden) ctx.resume().catch(() => {});
      } catch { ton.an = false; ctx = null; werk = null; }
    },
    // Tab versteckt / Fenster ohne Fokus: anhalten; zurück: weiter
    anhalten() { if (ctx && ctx.state === 'running') ctx.suspend().catch(() => {}); },
    fortsetzen() { if (ctx && ctx.state === 'suspended' && !document.hidden) ctx.resume().catch(() => {}); },
    lautstaerke(prozent) { laut = prozent; if (werk) werk.lautstaerke(prozent); },
    signalLautstaerke(prozent) { sig = prozent; if (werk) werk.signalLautstaerke(prozent); }, // Regler SIGNALTÖNE (M7a.1)
    musikLautstaerke(prozent) { mus = prozent; if (werk) werk.musikLautstaerke(prozent); }, // Regler MUSIK (M7b)
    // Quellen der Umgebung (M7b): einmal nach dem Aufbau der Welt; q darf eine Funktion sein (wird erst beim Entsperren gerechnet)
    quellen(q) { quellen = q; if (werk) werk.setzeQuellen(typeof q === 'function' ? q() : q); },
    // M8e: wer soll von jedem Pop erfahren (Flamme)? f(art, zeit in ctx.currentTime, staerke)
    beiKnall(f) { knallHoerer = f; if (werk) werk.setzeKnallHoerer(f); },
    // M8e: Zeit des Tons, die man gerade hört (ctx.currentTime minus Ausgabe-Verzögerung); ohne Ton null
    hoerZeit() { return ctx && ctx.state === 'running' ? ctx.currentTime - (ctx.outputLatency || ctx.baseLatency || 0) : null; },
    // M8d: Motorklang des gerade gewählten Fahrprofils übernehmen (nach waehleFahrprofil; im Spiel nur im Menü).
    // Ohne Klangwerk nichts zu tun: beim Entsperren wird ohnehin mit den aktuellen Werten gebaut
    motorNeu() { if (werk) { try { werk.motorNeu(); } catch { /* Ton ist nie wichtiger als das Spiel */ } } },
    // Musik-Zustand für Tests (M7b): ohne Ton { laeuft: false }
    musikStatus() { return werk ? werk.musik.status() : { laeuft: false, art: '', pegel: 0 }; },
  };
  // Alle Ereignisse: ohne Ton leer, Fehler im Ton stören das Spiel nie
  for (const name of ['aktualisiere', 'allesAus', 'blowOff', 'knall', 'aufprall', 'menue', 'pauseTon', 'countdown', 'go', 'checkpoint', 'verpasst', 'fanfare', 'paceNote']) {
    ton[name] = (a, b) => { if (!werk) return; try { werk[name](a, b); } catch { /* Ton ist nie wichtiger als das Spiel */ } };
  }
  if (ton.an) {
    document.addEventListener('visibilitychange', () => { if (document.hidden) ton.anhalten(); else ton.fortsetzen(); });
    window.addEventListener('blur', () => ton.anhalten());
    window.addEventListener('focus', () => ton.fortsetzen());
    // Ein Gamepad-Knopf zählt im Browser nicht als "Benutzer hat etwas getan": der nächste Tastendruck oder Klick weckt den Ton
    for (const ev of ['keydown', 'mousedown', 'pointerdown', 'touchstart']) window.addEventListener(ev, () => { if (ctx) ton.fortsetzen(); }, true);
  }
  return ton;
}
