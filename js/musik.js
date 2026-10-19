// Menü-Musik (M7b): spielt das Stück aus js/musikstueck.js mit Web Audio, alles im Code erzeugt (keine Dateien).
// Vier Kanäle wie ein 80er-Computer: Melodie (Pulswelle 25 % / 12.5 %, Echo, Vibrato bei langen Noten), Arpeggio bzw.
// Gegenstimme (Pulswelle 50 %), Bass (Dreieck/Sägezahn mit Tiefpass), Schlagzeug (Kick als Sinus mit fallender
// Tonhöhe, Snare und Hi-Hat aus vorab berechneten Rausch-Puffern).
// Zeitgeber: Noten werden auf der Audio-Uhr (ctx.currentTime) im Voraus geplant (musik.vorlauf, alle musik.planenAlle ms
// und bei jedem ton.aktualisiere). Bleibt der Zeitgeber stehen (Seite im Hintergrund), wird nichts nachgeholt.
// Arten: 'menue' (vom Intro an, alle Kanäle), 'pause' (ab Abschnitt A, ohne Schlagzeug, dumpf, leise),
// 'ziel' (ruhiger Ausklang als Schleife, ohne Schlagzeug, leise).
// Schnittstelle: starte(art), stoppe(sekunden), pegel(p), status(), testRender(sekunden, abschnitt) – siehe unten.

import { CONFIG } from './config.js';
import { zufall } from './util.js';
import { ABSCHNITTE, AUSKLANG, AKKORDE, SCHLAGZEUG, notenNummer } from './musikstueck.js';

const ZWEI_PI = Math.PI * 2;
export const KANAELE = ['lead', 'arp', 'bass', 'schlagzeug'];
const K_LEAD = 0, K_ARP = 1, K_BASS = 2, K_KICK = 3, K_SNARE = 4, K_HAT = 5, K_OFFEN = 6, K_RISER = 7;
const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);

// --- Stück in eine Liste von Ereignissen übersetzen (einmal beim Laden des Moduls; nur Zahlen) -------------------------
// Ereignis: schritt (16tel ab Anfang), kanal, midi, dauer (16tel), staerke (0..1), art (Melodie: 0 = 25 %, 1 = 12.5 %,
// 2 = sanft; +4 = voll mit Oktave darunter; Arpeggio: 1 = Gegenstimme)
function teileTakt(text) {
  return text.trim().split(/\s+/).map((x) => { const [n, l] = x.split(':'); return [n, Number(l)]; });
}
function akkordToene(name, unten, oben) { // alle Töne des Akkords (MIDI) zwischen unten und oben
  const [g, t] = AKKORDE[name], aus = [];
  for (let m = unten; m <= oben; m++) if (t.includes(((m - g) % 12 + 12) % 12)) aus.push(m);
  return aus;
}
const bassGrund = (name) => 33 + ((AKKORDE[name][0] - 9) % 12 + 12) % 12; // A1 (33) .. G#2 (44)

export function kompiliere(abschnitte) {
  const ev = [];
  const starts = [];
  let takt = 0;
  for (const A of abschnitte) {
    starts.push({ name: A.name, kurz: A.kurz, takt, takte: A.akkorde.length, tonart: A.tonart });
    const ev0 = ev.length;
    for (let b = 0; b < A.akkorde.length; b++) {
      const s0 = (takt + b) * 16, akk = A.akkorde[b];
      // Melodie
      if (A.lead) {
        let p = 0;
        const art = (A.sanft ? 2 : A.duty === 0.125 ? 1 : 0) + (A.voll ? 4 : 0);
        for (const [n, l] of teileTakt(A.lead[b])) {
          if (n !== 'R') ev.push([s0 + p, K_LEAD, notenNummer(n), l, 1, art]);
          p += l;
        }
        if (p !== 16) throw new Error(`Takt ${takt + b + 1} (${A.name}): Melodie hat ${p} statt 16 16tel`);
      }
      // Arpeggio oder Gegenstimme
      if (A.arp === 'gegen') {
        let p = 0;
        for (const [n, l] of teileTakt(A.gegen[b])) { if (n !== 'R') ev.push([s0 + p, K_ARP, notenNummer(n), l, 0.85, 1]); p += l; }
        if (p !== 16) throw new Error(`Takt ${takt + b + 1} (${A.name}): Gegenstimme hat ${p} statt 16 16tel`);
      } else if (A.arp && b >= (A.arpAb || 0)) {
        const g = AKKORDE[akk][0];
        const unten = 52 + ((g - 4) % 12 + 12) % 12; // Grundton zwischen E3 und D#4
        const t = akkordToene(akk, unten, unten + 12); // Grundton, Terz, Quinte, Oktave
        const folge = [0, 1, 2, 3, 2, 1];
        for (let k = 0; k < 16; k++) ev.push([s0 + k, K_ARP, t[folge[k % 6]], 1, k % 4 === 0 ? 1 : 0.75, 0]);
      }
      // Bass
      const r = bassGrund(akk);
      if (A.bass === 'pump') {
        for (let k = 0; k < 8; k++) ev.push([s0 + 2 * k, K_BASS, k % 2 === 0 ? r : k === 7 ? r + 7 : r + 12, 2, k === 0 ? 1 : 0.8, 0]);
      } else if (A.bass === 'viertel') {
        for (let k = 0; k < 4; k++) ev.push([s0 + 4 * k, K_BASS, k === 3 ? r + 7 : r, 4, k === 0 ? 1 : 0.85, 0]);
      } else if (A.bass === 'halb') {
        ev.push([s0, K_BASS, r, 8, 0.9, 0], [s0 + 8, K_BASS, r + 7, 8, 0.8, 0]);
      }
      // Schlagzeug (Fill im letzten Takt jeder 8er-Gruppe bzw. kurzer Abschnitte)
      if (A.schlagzeug) {
        const letzter = b % 8 === 7 || (A.akkorde.length < 8 && b === A.akkorde.length - 1);
        const mu = SCHLAGZEUG[A.fill && letzter ? 'fill' : A.schlagzeug];
        for (const [taste, kanal] of [['k', K_KICK], ['s', K_SNARE], ['h', K_HAT], ['o', K_OFFEN]]) {
          for (let k = 0; k < 16; k++) {
            const c = mu[taste][k];
            if (c !== '.') ev.push([s0 + k, kanal, 0, 1, c === 'X' ? 1 : c === 'g' ? 0.35 : 0.75, 0]);
          }
        }
      }
      if (A.riser === b) ev.push([s0, K_RISER, 0, 16, 1, 0]); // Rauschen-Anstieg am Ende des Breaks
    }
    if (A.staerke) for (let i = ev0; i < ev.length; i++) ev[i][4] *= A.staerke; // ganzer Abschnitt lauter/leiser
    takt += A.akkorde.length;
  }
  ev.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const n = ev.length, schritte = takt * 16;
  const liste = {
    takte: takt, schritte, abschnitte: starts, anzahl: n,
    schritt: new Int32Array(n), kanal: new Uint8Array(n), midi: new Int16Array(n), dauer: new Float32Array(n),
    staerke: new Float32Array(n), art: new Uint8Array(n), ab: new Int32Array(schritte + 1),
  };
  ev.forEach((e, i) => { liste.schritt[i] = e[0]; liste.kanal[i] = e[1]; liste.midi[i] = e[2]; liste.dauer[i] = e[3]; liste.staerke[i] = e[4]; liste.art[i] = e[5]; });
  let i = 0;
  for (let s = 0; s <= schritte; s++) { while (i < n && liste.schritt[i] < s) i++; liste.ab[s] = i; }
  return liste;
}
// Erst bei Bedarf übersetzt (nach dem Entsperren), nicht beim Laden der Seite
let haupt = null, schleifeZiel = null;
export const HAUPT_STUECK = () => haupt || (haupt = kompiliere(ABSCHNITTE));
export const ZIEL_STUECK = () => schleifeZiel || (schleifeZiel = kompiliere([AUSKLANG]));
// Abschnitt (Name oder Kurzname) -> erster 16tel-Schritt
export function abschnittSchritt(name, liste = HAUPT_STUECK()) {
  const a = liste.abschnitte.find((x) => x.name === name || x.kurz === name);
  return a ? a.takt * 16 : 0;
}

// --- Puffer fürs Schlagzeug (nach dem Entsperren in Häppchen berechnet, wie die anderen Klänge) ----------------------
function fertigMachen(d) { // weicher Anfang (ca. 1.5 ms), Ende auf 0, Spitze auf 0.9
  const n = d.length, an = 66, aus = Math.min(n >> 2, 200);
  let sp = 0;
  for (let i = 0; i < n; i++) {
    if (i < an) d[i] *= i / an;
    if (i > n - aus) d[i] *= (n - i) / aus;
    sp = Math.max(sp, Math.abs(d[i]));
  }
  if (sp > 1e-6) for (let i = 0; i < n; i++) d[i] *= 0.9 / sp;
}
// Rauschen mit Hochpass (hell) und Abklingen; koerper = [Hz, Abklingen s, Pegel] Sinus darunter (Snare)
function trommelRezept(rate, sek, abkl, hoch, rnd, koerper = null) {
  let alt = 0, hp = 0, lp = 0, ph = 0;
  const k = Math.exp(-ZWEI_PI * hoch / rate);
  return {
    laenge: Math.round(rate * sek),
    fuelle(d, von, bis) {
      for (let i = von; i < bis; i++) {
        const t = i / rate, x = rnd() * 2 - 1;
        hp = k * (hp + x - alt); alt = x;
        lp += (hp - lp) * 0.7;
        let v = lp * Math.exp(-t / abkl);
        if (koerper) { ph += ZWEI_PI * koerper[0] * (1 + 0.5 * Math.exp(-t / 0.01)) / rate; v += koerper[2] * Math.sin(ph) * Math.exp(-t / koerper[1]); }
        d[i] = v;
      }
    },
    fertig: fertigMachen,
  };
}
// Rauschen-Anstieg (Break): Bandpass steigt von 300 auf 6000 Hz, wird lauter, am Ende kurz weg
function riserRezept(rate, rnd) {
  const n = Math.round(rate * 2.2); // reicht für einen Takt bis 110 BPM
  let lo = 0, band = 0, f = 0;
  return {
    laenge: n, rate,
    fuelle(d, von, bis) {
      for (let i = von; i < bis; i++) {
        const u = i / n;
        if ((i & 31) === 0) f = 2 * Math.sin(Math.PI * Math.min(300 * 20 ** u, rate / 6) / rate);
        lo += f * band; band += f * (rnd() * 2 - 1 - lo - 0.5 * band);
        d[i] = band * u * u;
      }
    },
    fertig: fertigMachen,
  };
}
export function musikRezepte(rate, rnd) {
  return [
    ['m-hat', () => trommelRezept(rate, 0.06, 0.012, 6500, rnd)],
    ['m-snare', () => trommelRezept(rate, 0.24, 0.055, 1200, rnd, [185, 0.045, 0.9])],
    ['m-offen', () => trommelRezept(rate, 0.3, 0.085, 6000, rnd)],
    ['m-riser', () => riserRezept(Math.round(rate / 2), rnd)], // (halbe Abtastrate: das Rauschen steigt nur bis 6 kHz)
  ];
}

// Pulswelle (Tastverhältnis duty) als Obertöne für createPeriodicWave
function pulsWelle(duty) {
  const N = 48, re = new Float32Array(N), im = new Float32Array(N);
  for (let n = 1; n < N; n++) re[n] = (2 / (n * Math.PI)) * Math.sin(n * Math.PI * duty);
  return [re, im];
}
function bassWelle() { // halb Dreieck, halb Sägezahn
  const N = 32, re = new Float32Array(N), im = new Float32Array(N);
  for (let n = 1; n < N; n++) {
    im[n] = 0.5 / n;
    if (n % 2) im[n] += 0.5 * (8 / (Math.PI * Math.PI * n * n)) * ((n - 1) / 2 % 2 ? -1 : 1);
  }
  return [re, im];
}

// --- Der Spieler ---------------------------------------------------------------------------------------------------
// ausgang: Knoten, an den die Musik geht (im Spiel die Schiene "musik"). puffer: Objekt mit den Schlagzeug-Puffern
// (kommen nach und nach; fehlt einer, fällt der Schlag aus). offline = true: kein setInterval (Tests)
export function bauePlayer(ctx, ausgang, puffer, { offline = false } = {}) {
  const C = CONFIG.audio.musik;
  const gain = (w, ziel) => { const g = ctx.createGain(); g.gain.value = w; if (ziel) g.connect(ziel); return g; };
  const duck = gain(1, ausgang);
  const blende = gain(0, duck);                 // Ein-/Ausblenden
  const artPegel = gain(1, blende);             // Menü 1, Pause pausePegel, Ziel zielPegel
  const pauseLp = ctx.createBiquadFilter(); pauseLp.type = 'lowpass'; pauseLp.frequency.value = 20000; pauseLp.Q.value = 0.7;
  pauseLp.connect(artPegel);
  // sanfter Kompressor auf der ganzen Musik: Spitzen (Kick + Bass + Melodie zugleich) bleiben unter musik.kompressor.schwelle
  const komp = ctx.createDynamicsCompressor();
  komp.threshold.value = C.kompressor.schwelle; komp.knee.value = C.kompressor.knie; komp.ratio.value = C.kompressor.verhaeltnis;
  komp.attack.value = 0.003; komp.release.value = 0.15;
  // Decke: bis decke.weich unverändert, darüber weich gerundet, nie über decke.max (seltene Spitzen, wenn alles zusammenfällt)
  const decke = ctx.createWaveShaper();
  {
    const k = C.decke.weich, m = C.decke.max, n = 2048, kurve = new Float32Array(n);
    for (let i = 0; i < n; i++) { const x = i / ((n - 1) / 2) - 1, a = Math.abs(x); kurve[i] = Math.sign(x) * (a <= k ? a : k + (m - k) * Math.tanh((a - k) / (m - k))); }
    decke.curve = kurve;
  }
  const nachKomp = gain(C.pegel, decke); // Pegel der ganzen Musik (nach dem Kompressor: wirkt gerade, wird nicht ausgeglichen)
  komp.connect(nachKomp); decke.connect(pauseLp);
  // sanfter Tiefpass auf der ganzen Musik (wie der Ausgang eines 80er-Computers): runde Flanken, keine Klicks
  const ausgangLp = ctx.createBiquadFilter(); ausgangLp.type = 'lowpass'; ausgangLp.frequency.value = C.tiefpass; ausgangLp.Q.value = 0.6;
  ausgangLp.connect(komp);
  const mix = gain(C.kompressor.eingang, ausgangLp);
  const kanal = KANAELE.map(() => gain(0, mix));
  const stumm = [false, false, false, false];   // Ton-Labor: Kanäle einzeln stumm
  // Melodie: trocken und Echo (3/16, Rückkopplung, Tiefpass)
  const leadIn = gain(1, kanal[K_LEAD]);
  const echoSend = gain(0, null), echo = ctx.createDelay(1.5), echoLp = ctx.createBiquadFilter(), echoRueck = gain(0, echo);
  echoLp.type = 'lowpass'; echoLp.frequency.value = C.echo.tiefpass;
  leadIn.connect(echoSend); echoSend.connect(echo); echo.connect(echoLp); echoLp.connect(echoRueck); echoLp.connect(kanal[K_LEAD]);
  // Bass mit Tiefpass
  const bassLp = ctx.createBiquadFilter(); bassLp.type = 'lowpass'; bassLp.frequency.value = 900; bassLp.Q.value = 1.6; bassLp.connect(kanal[K_BASS]);
  const welle = (w) => ctx.createPeriodicWave(w[0], w[1]);
  const W25 = welle(pulsWelle(0.25)), W125 = welle(pulsWelle(0.125)), W50 = welle(pulsWelle(0.5)), WBASS = welle(bassWelle());
  const ZIELE = [leadIn, kanal[K_ARP], bassLp];

  // Zustand (nur Zahlen)
  const z = {
    laeuft: false, art: '', liste: HAUPT_STUECK(), schritt: 0, naechste: 0, stoppAb: 0, ohneSchlagzeug: false,
    bpm: C.bpm, sech: 60 / C.bpm / 4, startZeit: 0, startSchritt: 0,
    fade: { t0: 0, v0: 0, t1: 0, v1: 0 }, artWert: 1, oszMax: 0,
    modus: 'aus', zielAb: 0, uhr: 0, erzeugt: 0, starts: 0,
  };
  // Geplante Klangquellen (Ring): zum Abbrechen beim Neustart und zum Zählen gleichzeitiger Töne
  const RING = 96;
  const ringQ = new Array(RING).fill(null), ringAb = new Float64Array(RING), ringBis = new Float64Array(RING), ringOsz = new Uint8Array(RING);
  let ringPos = 0;
  function merke(q, ab, bis, osz) {
    ringQ[ringPos] = q; ringAb[ringPos] = ab; ringBis[ringPos] = bis; ringOsz[ringPos] = osz ? 1 : 0;
    ringPos = (ringPos + 1) % RING; z.erzeugt++;
  }
  function oszBei(t) { let n = 0; for (let i = 0; i < RING; i++) if (ringOsz[i] && ringAb[i] <= t && t < ringBis[i]) n++; return n; }

  // Vibrato-Kurven je Notenlänge (16tel), Cent; werden bei Tempo-Änderung neu gerechnet
  let vib = [];
  const VIB_NACH = 0.14;
  function vibratoBauen() {
    vib = [];
    for (let k = 0; k <= 16; k++) {
      const dauer = k * z.sech - VIB_NACH;
      if (k < 4 || dauer <= 0.05) { vib.push(null); continue; }
      const n = Math.max(2, Math.ceil(dauer * 120)), c = new Float32Array(n);
      for (let i = 0; i < n; i++) { const t = i / 120; c[i] = 14 * Math.min(1, t / 0.18) * Math.sin(ZWEI_PI * 5.6 * t); }
      vib.push(c);
    }
  }
  function tempo(bpm) { z.bpm = bpm; z.sech = 60 / bpm / 4; echo.delayTime.value = Math.min(1.4, C.echo.zeit * 16 * z.sech); vibratoBauen(); }
  tempo(C.bpm);
  function pegelSetzen() {
    const P = [C.lead, C.arp, C.bass, C.schlagzeug];
    for (let k = 0; k < 4; k++) {
      const w = stumm[k] || (k === 3 && z.ohneSchlagzeug) ? 0 : P[k];
      kanal[k].gain.setTargetAtTime(w, ctx.currentTime, 0.02);
    }
    nachKomp.gain.setTargetAtTime(C.pegel, ctx.currentTime, 0.02);
    echoSend.gain.value = C.echo.pegel; echoRueck.gain.value = C.echo.rueck; echoLp.frequency.value = C.echo.tiefpass;
  }
  pegelSetzen();

  // --- Eine Note / ein Schlag ---
  function note(k, midi, t, dauer, st, art) {
    const ende = t + dauer;
    if (k === K_LEAD || k === K_ARP || k === K_BASS || k === K_KICK) {
      if (oszBei(t) >= C.maxOszillatoren) return; // Grenze: lieber eine Note auslassen
      const o = ctx.createOscillator(), g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      if (k === K_KICK) {
        o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(46, t + 0.09);
        g.gain.linearRampToValueAtTime(st * 0.7, t + 0.003); g.gain.setTargetAtTime(0, t + 0.02, 0.075);
        o.connect(g); g.connect(kanal[3]); o.start(t); o.stop(t + 0.42); merke(o, t, t + 0.42, true);
        return;
      }
      o.frequency.value = hz(midi);
      let halt;
      if (k === K_LEAD) {
        const a = art & 3;
        if (a === 2) o.type = 'triangle'; else o.setPeriodicWave(a === 1 ? W125 : W25);
        halt = ende - 0.012;
        const v = st * (a === 0 ? C.lead25 : a === 1 ? C.lead125 : 1); // je Pulsbreite so, dass die Melodie gleich laut wirkt
        g.gain.linearRampToValueAtTime(v, t + (a === 2 ? 0.03 : 0.005));
        g.gain.setTargetAtTime(v * 0.78, t + 0.01, 0.07);
        const nn = Math.round(dauer / z.sech);
        if (nn >= 4 && vib[Math.min(16, nn)]) o.detune.setValueCurveAtTime(vib[Math.min(16, nn)], t + VIB_NACH, nn * z.sech - VIB_NACH);
        if (art & 4) { // voll: Oktave darunter, leiser
          const o2 = ctx.createOscillator(), g2 = ctx.createGain();
          o2.setPeriodicWave(W25); o2.frequency.value = hz(midi - 12); g2.gain.value = 0.22;
          o2.connect(g2); g2.connect(g); o2.start(t); o2.stop(halt + 0.08); merke(o2, t, halt + 0.08, true);
        }
      } else if (k === K_ARP) {
        o.setPeriodicWave(W50);
        if (art === 1) { // Gegenstimme: gehalten
          halt = ende - 0.015;
          g.gain.linearRampToValueAtTime(st, t + 0.008); g.gain.setTargetAtTime(st * 0.7, t + 0.01, 0.1);
        } else { // Arpeggio: kurz gezupft
          halt = ende - 0.004;
          g.gain.linearRampToValueAtTime(st, t + 0.002); g.gain.setTargetAtTime(st * 0.25, t + 0.004, 0.045);
        }
      } else { // Bass: pumpend (kurz abgesetzt)
        o.setPeriodicWave(WBASS);
        halt = t + dauer * 0.82;
        g.gain.linearRampToValueAtTime(st, t + 0.003);
      }
      g.gain.setTargetAtTime(0, halt, 0.012);
      o.connect(g); g.connect(ZIELE[k]);
      o.start(t); o.stop(halt + 0.08); merke(o, t, halt + 0.08, true);
      return;
    }
    // Schlagzeug aus Puffern
    const name = k === K_SNARE ? 'm-snare' : k === K_HAT ? 'm-hat' : k === K_OFFEN ? 'm-offen' : 'm-riser';
    const b = puffer[name];
    if (!b) return;
    const q = ctx.createBufferSource(), g = ctx.createGain();
    q.buffer = b;
    g.gain.value = st * (k === K_HAT ? 0.38 : k === K_OFFEN ? 0.3 : k === K_RISER ? 0.5 : 0.85);
    q.connect(g); g.connect(kanal[3]);
    const lang = k === K_RISER ? Math.min(b.duration, dauer) : b.duration;
    if (k === K_RISER) { g.gain.setValueAtTime(g.gain.value, ende - 0.03); g.gain.linearRampToValueAtTime(0, ende); }
    q.start(t); q.stop(t + lang); merke(q, t, t + lang, false);
  }

  function schrittSpielen(s, t) {
    const L = z.liste;
    for (let i = L.ab[s]; i < L.ab[s + 1]; i++) {
      const k = L.kanal[i];
      if (k >= K_KICK && (z.ohneSchlagzeug || stumm[3])) continue;
      if (k < 3 && stumm[k]) continue;
      note(k, L.midi[i], t, L.dauer[i] * z.sech, L.staerke[i], L.art[i]);
    }
  }
  // Noten bis "bis" (Audio-Zeit) planen. Liegt die nächste Note schon in der Vergangenheit (Zeitgeber stand still),
  // geht es bei der aktuellen Zeit weiter: nichts wird nachgeholt
  function plane(bis) {
    if (!z.laeuft) return;
    const jetzt = ctx.currentTime;
    if (z.naechste < jetzt) { z.startSchritt = z.schritt; z.naechste = jetzt + 0.02; z.startZeit = z.naechste; }
    while (z.naechste < bis) {
      if (z.stoppAb && z.naechste >= z.stoppAb) { // nichts mehr planen; "läuft" bleibt bis zum Ende der Blende
        if (jetzt >= z.stoppAb) { z.laeuft = false; z.art = ''; z.stoppAb = 0; }
        return;
      }
      schrittSpielen(z.schritt, z.naechste);
      z.schritt = (z.schritt + 1) % z.liste.schritte;
      z.naechste += z.sech;
    }
    z.oszMax = Math.max(z.oszMax, oszBei(jetzt));
  }
  // Blende: lineare Rampe von jetzt (aktueller Wert) auf ziel in sek
  function fadeWert(t) {
    const f = z.fade;
    if (t >= f.t1) return f.v1;
    if (t <= f.t0) return f.v0;
    return f.v0 + (f.v1 - f.v0) * (t - f.t0) / (f.t1 - f.t0);
  }
  function blendeAuf(ziel, sek, ab = ctx.currentTime) {
    const v = fadeWert(ab);
    blende.gain.cancelScheduledValues(ab);
    blende.gain.setValueAtTime(v, ab);
    blende.gain.linearRampToValueAtTime(ziel, ab + Math.max(0.01, sek));
    z.fade.t0 = ab; z.fade.v0 = v; z.fade.t1 = ab + Math.max(0.01, sek); z.fade.v1 = ziel;
  }

  // --- Schnittstelle ---
  const ART = {
    menue: { liste: HAUPT_STUECK, ab: () => 0, ohne: false, filter: 20000, pegel: 1, ein: () => C.einblenden },
    pause: { liste: HAUPT_STUECK, ab: () => abschnittSchritt('A'), ohne: true, filter: C.pauseFilter, pegel: C.pausePegel, ein: () => C.pauseBlende },
    ziel: { liste: ZIEL_STUECK, ab: () => 0, ohne: true, filter: 20000, pegel: C.zielPegel, ein: () => C.einblenden },
  };
  // starte(art): läuft dieselbe Art schon (nicht am Ausblenden), passiert nichts (Menü-Seiten starten nie neu).
  // Sonst: was läuft, kurz weg, dann vom Anfang der Art an einblenden. ab: optional Abschnitt (Ton-Labor)
  function starte(art, ab = null) {
    if (!C.an || !ART[art]) return false;
    if (z.laeuft && z.art === art && !z.stoppAb && ab === null) return false;
    const a = ART[art];
    let t = ctx.currentTime + 0.03;
    if (z.laeuft) { // Neustart: alte Noten weich weg, geplante abbrechen
      blendeAuf(0, 0.05);
      t = ctx.currentTime + 0.07;
      for (let i = 0; i < RING; i++) if (ringQ[i] && ringBis[i] > t) { try { ringQ[i].stop(t); } catch { /* schon vorbei */ } ringBis[i] = Math.min(ringBis[i], t); }
    }
    z.art = art; z.liste = a.liste(); z.ohneSchlagzeug = a.ohne; z.artWert = art === 'pause' ? C.pausePegel : art === 'ziel' ? C.zielPegel : 1;
    z.schritt = ab === null ? a.ab() : abschnittSchritt(ab, z.liste);
    z.naechste = t; z.startZeit = t; z.startSchritt = z.schritt; z.stoppAb = 0; z.laeuft = true; z.starts++;
    pauseLp.frequency.setTargetAtTime(a.filter, ctx.currentTime, 0.02);
    artPegel.gain.setTargetAtTime(z.artWert, ctx.currentTime, 0.02);
    pegelSetzen();
    blendeAuf(1, a.ein(), t);
    plane(ctx.currentTime + C.vorlauf);
    return true;
  }
  function stoppe(sek = C.ausblenden) {
    if (!z.laeuft || z.stoppAb) return;
    blendeAuf(0, sek);
    z.stoppAb = ctx.currentTime + sek + 0.02;
  }
  function pegel(p) { C.pegel = p; pegelSetzen(); }
  // Ducking unter Menü-, Checkpoint- und Ziel-Signalen (Musik kurz leiser, damit Klicks nie untergehen)
  function ducke() {
    const t = ctx.currentTime;
    duck.gain.cancelScheduledValues(t);
    duck.gain.setTargetAtTime(10 ** (C.duckSignal / 20), t, 0.006);
    duck.gain.setTargetAtTime(1, t + C.duckDauer, 0.03);
  }
  // Welche Stelle ist gerade zu hören (nicht die geplante)?
  function status() {
    const t = ctx.currentTime, L = z.liste;
    let s = z.schritt;
    if (z.laeuft) s = t < z.startZeit ? z.startSchritt // (gerade neu gestartet: der erste Schritt kommt erst)
      : ((z.schritt - Math.ceil((z.naechste - t) / z.sech - 1e-6)) % L.schritte + L.schritte) % L.schritte;
    const takt = Math.floor(s / 16);
    let ab = L.abschnitte[0];
    for (const a of L.abschnitte) if (takt >= a.takt) ab = a;
    return {
      laeuft: z.laeuft, art: z.art, abschnitt: ab.name, takt: takt + 1, taktImAbschnitt: takt - ab.takt + 1, schritt: s,
      pegel: z.laeuft ? fadeWert(t) * z.artWert : 0, blende: fadeWert(t), ausblenden: !!z.stoppAb, bpm: z.bpm, starts: z.starts,
      zielIn: z.zielAb ? z.zielAb - z.uhr : null, ohneSchlagzeug: z.ohneSchlagzeug,
      zeit: t, blendeVon: z.fade.t0, blendeBis: z.fade.t1, blendeZiel: z.fade.v1, // (Audio-Uhr, für Tests)
      oszillatoren: oszBei(t), oszMax: z.oszMax, erzeugt: z.erzeugt, filter: pauseLp.frequency.value,
    };
  }
  // Jedes Bild (aus ton.aktualisiere): musikModus des Spiels -> starten, ausblenden; Zielbildschirm mit Verzögerung.
  // bestzeit: wurde gerade die lange Fanfare gespielt (dann beginnt die Ziel-Musik erst danach)?
  function folge(modus, dt, bestzeit = false) {
    z.uhr += dt;
    if (modus !== z.modus) {
      const vorher = z.modus;
      z.modus = modus;
      if (modus === 'menue') starte('menue');
      else if (modus === 'pause') starte('pause');
      else if (modus === 'ziel') { if (z.laeuft) stoppe(C.pauseBlende); z.zielAb = z.uhr + (bestzeit ? C.zielNachBestzeit : C.zielNach); }
      else if (z.laeuft) stoppe(vorher === 'pause' ? C.pauseBlende : C.ausblenden);
    }
    if (modus === 'ziel' && z.zielAb && z.uhr >= z.zielAb) { z.zielAb = 0; starte('ziel'); }
    if (modus !== 'ziel') z.zielAb = 0;
    if (z.laeuft) plane(ctx.currentTime + C.vorlauf); // (im Rennen läuft keine Musik: dann nichts zu tun)
  }
  let zeitgeber = null;
  if (!offline) zeitgeber = setInterval(() => { if (z.laeuft) plane(ctx.currentTime + C.vorlauf); }, C.planenAlle);

  return {
    starte, stoppe, pegel, status, folge, plane, ducke, tempo, pegelSetzen, zustand: z,
    stumm(k, an) { stumm[typeof k === 'number' ? k : KANAELE.indexOf(k)] = !!an; pegelSetzen(); },
    get stummListe() { return stumm.slice(); },
    knoten: { duck, blende, artPegel, pauseLp, komp, nachKomp, decke, ausgangLp, mix, kanal, echo, echoSend, bassLp },
    ende() { if (zeitgeber) clearInterval(zeitgeber); },
  };
}

// --- Offline rechnen (Tests, Messungen): sekunden ab Abschnitt (Name), Ergebnis Float32Array (mono).
// opt: { art: 'menue' | 'pause' | 'ziel', stumm: ['schlagzeug', ...], bpm, rate, seed, mitBlende: false }
export async function testRender(sekunden, abschnitt = 'Intro', opt = {}) {
  const rate = opt.rate || 44100;
  const ctx = new OfflineAudioContext(1, Math.round(rate * sekunden), rate);
  const puffer = {};
  const rnd = zufall(opt.seed ?? CONFIG.audio.seed + 3);
  for (const [name, f] of musikRezepte(rate, rnd)) {
    const r = f(), b = ctx.createBuffer(1, r.laenge, r.rate || rate), d = b.getChannelData(0);
    r.fuelle(d, 0, r.laenge); if (r.fertig) r.fertig(d);
    puffer[name] = b;
  }
  const p = bauePlayer(ctx, ctx.destination, puffer, { offline: true });
  if (opt.bpm) p.tempo(opt.bpm);
  for (const k of opt.stumm || []) p.stumm(k, true);
  p.starte(opt.art || 'menue', abschnitt);
  if (!opt.mitBlende) { p.knoten.blende.gain.cancelScheduledValues(0); p.knoten.blende.gain.setValueAtTime(1, 0); p.zustand.fade.v0 = p.zustand.fade.v1 = 1; }
  p.plane(sekunden);
  const buf = await ctx.startRendering();
  return { daten: buf.getChannelData(0), status: p.status(), erzeugt: p.zustand.erzeugt, oszMax: p.zustand.oszMax };
}
