// Messung für Meilenstein 7a.1 (vorher / nachher):  node tools/ton-messung.mjs <name> [ordner einer anderen Version]
//   z. B. node tools/ton-messung.mjs vorher /pfad/zur/m7a-version   und   node tools/ton-messung.mjs nachher
// Rechnet die Klänge offline (OfflineAudioContext, wie tools/ton-test.mjs (i)) und misst:
//  - Motor bei 1500 / 3000 / 5000 / 7000 U/min mit Vollgas: Grundton, Spektralschwerpunkt, Energie über 1 kHz und
//    über 2.5 kHz, Spitze, RMS (nur Motor; Turbo getrennt: Verhältnis Turbo zu Motor)
//  - Aufprall je Material (leicht 1.5, mittel 7, hart 16 m/s): Schwerpunkt, Ausklingzeit bis -40 dB, Spitze, RMS
//  - Signale bei Regler 100 %: Spitze und RMS (vor dem Limiter) und gegen den Motor bei Vollgas
//  - Rückwärts-Heulen: Tonhöhe bei den echten Rückwärts-Drehzahlen (Getriebe und Physik aus dem Spiel)
//  - Audio-Knoten (dauerhaft angelegt)
// Ergebnis: tools/ton-messung-<name>.json (für den Vergleich in tools/ton-test.mjs) und Spektrogramme in
// screenshots/m7a-1/<name>-*.png. Für die alte Version wird diese Mess-Hilfe (tools/ton-pruefung.js) dorthin kopiert.
// M8d: --profil <id> (rt4, delto, escorta, prototyp): Motorklang dieses Fahrprofils (Block ton.motor, turboMal, knallMal);
//   zusätzlich Block "profil": Grundton im Leerlauf, Rauschanteil (Energie ausserhalb der Obertöne und spektrale Flachheit
//   2-6 kHz bei Vollgas 5000/min), Tonhöhe und Pegel des Turbo-Pfeifens, Spitze, Pops auf einer festen 60-s-Fahrt (grosse
//   Pops und Knistern je Minute) und die Vergleichsfahrt des Ton-Labors (js/tonfahrt.js) als Spektrogramm.
//   Bilder dann nach screenshots/m8d/<name>-*.png. Ohne --profil alles wie bisher (Profil prototyp der Seite).

import fs from 'node:fs';
import path from 'node:path';
import { starteSpiel, WURZEL } from './spiel-browser.mjs';

const arg = (n) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null; };
const PROFIL = arg('--profil');
const frei = process.argv.slice(2).filter((a, i, l) => !a.startsWith('--') && !(i > 0 && l[i - 1].startsWith('--')));
const name = frei[0] || 'nachher';
const wurzel = frei[1] ? path.resolve(frei[1]) : WURZEL;
if (wurzel !== WURZEL) fs.copyFileSync(path.join(WURZEL, 'tools/ton-pruefung.js'), path.join(wurzel, 'tools/ton-pruefung.js'));
// (M8e: --bilder <ordner>, z. B. screenshots/m8e; sonst wie bisher)
const BILDER = path.join(WURZEL, arg('--bilder') || (PROFIL ? 'screenshots/m8d' : 'screenshots/m7a-1'));
fs.mkdirSync(BILDER, { recursive: true });

const spiel = await starteSpiel({ wurzel, breite: 640, hoehe: 360, args: ['--autoplay-policy=no-user-gesture-required'] });
const p = spiel.page;
await p.goto(`${spiel.url}/index.html?menue=aus`);
await p.waitForFunction(() => window.__alpineRally, null, { timeout: 120000 });

// Echte Rückwärts-Drehzahlen: im Spiel auf Asphalt stehen, Bremse halten (= rückwärts), 5 s aufzeichnen
const rueck = await p.evaluate(() => {
  const A = window.__alpineRally;
  A.anhalten = true;
  A.start({ countdown: false });
  A.setzeAuf(600);
  const e = { gas: 0, bremse: 1, lenkung: 0, handbremse: false, reset: false, debug: false, notes: false, hud: false };
  const liste = [];
  for (let k = 0; k < 120 * 5; k++) {
    A.rennSchritt(A.SCHRITT, e);
    if (k % 30 === 29) liste.push({ t: (k + 1) / 120, rpm: A.getriebe.drehzahl, v: A.physik.vVor, gang: A.getriebe.gang, untergrund: A.tonZ ? A.tonZ.untergrund : '' });
  }
  return liste;
});

const erg = await p.evaluate(async ({ rueck, profil }) => {
  const P = await import('/tools/ton-pruefung.js');
  // M8d: Motorklang eines Fahrprofils (vor allem anderen: alle Klangwerke werden mit diesen Werten gebaut)
  const FP = profil ? await import('/js/fahrprofil.js') : null;
  if (FP) FP.waehleFahrprofil(profil);
  const TW = FP ? { turboMal: FP.tonWerte.turboMal, knallMal: FP.tonWerte.knallMal } : {};
  const C = P.CONFIG.audio, M = C.motor, AU = C.aufprall;
  const { VERSION } = await import('/js/config.js');
  P.CONFIG.version = VERSION;
  const out = { version: VERSION, motor: [], turbo: [], aufprall: {}, signale: {}, heulen: [], bilder: {} };
  out.knoten = P.zaehleKnoten();
  // --- Motor: nur der Motorkörper (Turbo und Heulen abgehängt), Vollgas, ein Bild (Begrenzer noch nicht aktiv) ---
  const motorZ = (rpm) => P.zustand({ drehzahl: rpm, gas: 1, gang: 3, zielGang: 3, ...TW });
  for (const rpm of [1500, 3000, 5000, 7000]) {
    let f0 = 0;
    // (M8e: auch ohne Lader-Heulen; das misst der Block "profil" getrennt)
    const x = await P.rendere((w) => { w.aktualisiere(1 / 60, motorZ(rpm)); f0 = w.zustand.f0; w.knoten.turboGain.disconnect(); w.knoten.heulenGain.disconnect(); if (w.lader) w.lader.gain.disconnect(); }, 2, { limiter: false });
    const s = P.spektrum(x.daten, 0.5, 1.9), m = P.miss(x.daten, 0.5, 1.9);
    const fGemessen = P.staerksteFrequenz(x.daten, 0.5, 1.5, f0 * 0.92, f0 * 1.08, 0.25);
    const sRoh = P.spektrum(x.daten, 0.5, 1.9);
    out.motor.push({ rpm, f0, fGemessen, pegelA: P.pegelA(sRoh), schwerpunkt: P.schwerpunkt(s), ueber1k: P.anteilUeber(s, 1000), ueber2k5: P.anteilUeber(s, 2500), spitze: m.spitze, rms: m.rms, mittel: m.mittel, nan: m.nan });
    // mit Turbo (voller Ladedruck): Motor + Turbo, und Turbo allein
    if (rpm >= 5000) {
      const nurTurbo = await P.rendere((w) => { w.zustand.druck = 1; w.aktualisiere(1 / 60, motorZ(rpm)); w.knoten.motorLast.disconnect(); w.knoten.heulenGain.disconnect(); }, 1.5, { limiter: false });
      const mitTurbo = await P.rendere((w) => { w.zustand.druck = 1; w.aktualisiere(1 / 60, motorZ(rpm)); w.knoten.heulenGain.disconnect(); }, 1.5, { limiter: false });
      const t = P.miss(nurTurbo.daten, 0.5, 1.4).rms, g = P.miss(mitTurbo.daten, 0.5, 1.4).rms;
      out.turbo.push({ rpm, turboRms: t, motorRms: m.rms, gesamtRms: g, verhaeltnisDb: P.dB(t / m.rms) });
    }
    if (rpm >= 3000) out.bilder[`motor-${rpm}`] = P.spektrogramm(x.daten.subarray(0, P.RATE * 1.5), `${P.CONFIG.version}: Motor ${rpm}/min Vollgas (Grundton ${f0.toFixed(0)} Hz), ohne Turbo`);
  }
  // Bezug für die Signale: Motor bei 5000/min Vollgas mit Turbo (vor dem Limiter)
  const bezug = out.turbo.find((t) => t.rpm === 5000).gesamtRms;
  out.motorBezugRms = bezug;

  // --- Aufprall je Material ---
  for (const mat of AU.materialien) {
    out.aufprall[mat] = {};
    for (const [stufe, v] of [['leicht', 1.5], ['mittel', 7], ['hart', 16]]) {
      const x = await P.rendere((w) => { w.aufprall(v, P.materialNr(mat)); }, 1.6, { limiter: false });
      const h = P.huelle(x.daten, -40), s = P.spektrum(x.daten, 0, Math.max(0.1, h.anfang + h.ausklingen)), m = P.miss(x.daten);
      // Material-Klang allein (ohne den tiefen Schlag, der ab aufprall.schlagAb dazukommt): dort sitzt das "Klirren"
      const schlagAb = AU.schlagAb; AU.schlagAb = 1e9;
      const y = await P.rendere((w) => { w.aufprall(v, P.materialNr(mat)); }, 1.6, { limiter: false });
      AU.schlagAb = schlagAb;
      const sy = P.spektrum(y.daten, 0, Math.max(0.1, h.anfang + h.ausklingen));
      // Pegel robust gegen die Zufalls-Varianten: Material und tiefer Schlag je allein (RMS 0.15 s), Energie addiert
      const pegel = AU.pegel; AU.pegel = 0;
      const sch = await P.rendere((w) => { w.aufprall(v, P.materialNr(mat)); }, 0.5, { limiter: false });
      AU.pegel = pegel;
      const rmsMat = P.miss(y.daten, 0, 0.15).rms, rmsSchlag = P.miss(sch.daten, 0, 0.15).rms;
      out.aufprall[mat][stufe] = { v, pegelRms: Math.hypot(rmsMat, rmsSchlag), rmsMat, rmsSchlag, spitze: m.spitze, rms100: P.miss(x.daten, 0, 0.1).rms, rmsAktiv: h.rmsAktiv, ausklingen40: h.ausklingen, schwerpunkt: P.schwerpunkt(s), spitzeUeber1k: P.spitzeUeber(s, 1000),
        schwerpunktAllein: P.schwerpunkt(sy), spitzeUeber1kAllein: P.spitzeUeber(sy, 1000) };
      if (mat === 'stein' && stufe !== 'leicht') out.bilder[`stein-${stufe}`] = P.spektrogramm(x.daten.subarray(0, P.RATE * 0.8), `${P.CONFIG.version}: Aufprall Stein ${stufe} (${v} m/s)`);
    }
  }

  // --- Pops, Schaltknall, Klack (Spitze vor dem Limiter) ---
  {
    const an = (w) => { w.aktualisiere(1 / 60, P.zustand({ drehzahl: 1000 })); w.knoten.motorLast.disconnect(); if (w.lader) w.lader.gain.disconnect(); };
    // (erst nach 0.4 s: dann ist der Motor-Ausgang ganz offen)
    const pop = await P.rendere((w) => { an(w); w.knall(0.4, 1); }, 0.8, { limiter: false });
    const pd = pop.daten.subarray(Math.round(P.RATE * 0.38));
    out.pop = { spitze: P.miss(pd).spitze, dauer: P.huelle(pd, -40).ausklingen, schwerpunkt: P.schwerpunkt(P.spektrum(pd, 0, 0.1)) };
    if (M.klackPegel != null) {
      const k = await P.rendere((w, ctx) => { an(w); const g = ctx.createGain(); g.gain.value = M.klackPegel; const q = ctx.createBufferSource(); q.buffer = w.puffer.klack; q.connect(g); g.connect(w.knoten.motorAus); q.start(0.4); }, 0.8, { limiter: false });
      const kd = k.daten.subarray(Math.round(P.RATE * 0.38));
      out.klack = { spitze: P.miss(kd).spitze, dauer: P.huelle(kd, -40).ausklingen, schwerpunkt: P.schwerpunkt(P.spektrum(kd, 0, 0.1)) };
    }
  }

  // --- Signale (vor dem Limiter, Regler 100 %) ---
  const signale = {
    'menue-tick': (w) => w.menue('tick'), 'menue-bestaetigen': (w) => w.menue('bestaetigen'), 'menue-zurueck': (w) => w.menue('zurueck'),
    'menue-fehler': (w) => w.menue('fehler'), 'menue-regler': (w) => w.menue('regler', 1),
    countdown: (w) => w.countdown(), go: (w) => w.go(),
    'cp-schneller': (w) => w.checkpoint(-1), 'cp-langsamer': (w) => w.checkpoint(1), 'cp-neutral': (w) => w.checkpoint(0),
    verpasst: (w) => w.verpasst(), pause: (w) => w.pauseTon(true), weiter: (w) => w.pauseTon(false), paceNote: (w) => w.paceNote(1),
    'fanfare-kurz': (w) => w.fanfare(false), 'fanfare-lang': (w) => w.fanfare(true),
  };
  for (const [n, f] of Object.entries(signale)) {
    const x = await P.rendere((w) => f(w), n.startsWith('fanfare') ? 4.5 : 1, { limiter: false });
    const h = P.huelle(x.daten, -40), m = P.miss(x.daten);
    out.signale[n] = { spitze: m.spitze, rmsAktiv: h.rmsAktiv, dauer: h.aktivDauer, gegenMotorDb: P.dB(h.rmsAktiv / bezug) };
  }

  // --- Rückwärts-Heulen: echte Drehzahlen aus dem Spiel (nur das Heulen, Motor abgehängt) ---
  for (const r of rueck) {
    if (r.gang !== -1) continue;
    const z = P.zustand({ drehzahl: r.rpm, gang: -1, zielGang: -1, tempo: Math.abs(r.v), vVor: r.v, bremse: 1 });
    const x = await P.rendere((w) => { w.aktualisiere(1 / 60, z); w.knoten.motorLast.disconnect(); w.knoten.turboGain.disconnect(); }, 0.8, { limiter: false });
    const mot = await P.rendere((w) => { w.aktualisiere(1 / 60, z); w.knoten.heulenGain.disconnect(); w.knoten.turboGain.disconnect(); }, 0.8, { limiter: false });
    out.heulen.push({ ...r, hz: P.staerksteFrequenz(x.daten, 0.3, 0.7, 80, 2500, 2), rms: P.miss(x.daten, 0.3, 0.7).rms, motorRms: P.miss(mot.daten, 0.3, 0.7).rms });
  }

  // --- Spektrogramme mit Verlauf: Pop-Salve, Schalten hoch (unter Last) und runter (beim Bremsen), Heulen ---
  const { Getriebe } = await import('/js/getriebe.js');
  const { baueKlangwerk } = await import('/js/audio.js');
  // Pop-Salve: 0.6 s Vollgas bei 5500/min, dann Gas weg (Knall-Chance für das Bild auf 1)
  const altChance = M.knallChance, altZweiter = M.knallZweiter;
  M.knallChance = 1; if (altZweiter != null) M.knallZweiter = 1;
  const pop = await P.rendereVerlauf((w, t) => w.aktualisiere(1 / 60, P.zustand({ drehzahl: t < 0.6 ? 5500 : 5500 - (t - 0.6) * 3000, gas: t < 0.6 ? 1 : 0, gang: 3, zielGang: 3 })), 1.8);
  M.knallChance = altChance; if (altZweiter != null) M.knallZweiter = altZweiter;
  out.bilder['pop-salve'] = P.spektrogramm(pop.daten, `${P.CONFIG.version}: Gas weg bei 5500/min nach 0.6 s (Knallen / Poppen)`);
  // Schalten: echtes Getriebe, einfache Fahrt
  const fahrt = (v0, eingabe, dauer) => P.rendereVerlauf((w) => {
    const g = w.__g || (w.__g = { getriebe: new Getriebe(), v: v0 });
    for (let k = 0; k < 2; k++) {
      const m = g.getriebe.schritt(1 / 120, eingabe, g.v, g.v, 1);
      g.v = Math.max(0, g.v + (m.beschl - m.motorbremse * (eingabe.gas ? 0 : 1) - eingabe.bremse * 8 - 0.0004 * g.v * g.v - 0.15) / 120);
    }
    const G = g.getriebe;
    w.aktualisiere(1 / 60, P.zustand({ drehzahl: G.drehzahl, gang: G.gang, zielGang: G.zielGang, schaltet: G.schaltet, gas: eingabe.gas, bremse: eingabe.bremse, tempo: 0, vVor: g.v }));
  }, dauer);
  const hoch = await fahrt(18.87, { gas: 1, bremse: 0 }, 1.6);
  out.bilder['schalten-hoch'] = P.spektrogramm(hoch.daten, `${P.CONFIG.version}: Hochschalten 2 -> 3 mit Vollgas`);
  const runter = await fahrt(26, { gas: 0, bremse: 1 }, 2.2);
  out.bilder['schalten-runter'] = P.spektrogramm(runter.daten, `${P.CONFIG.version}: Bremsen im 3. Gang, Runterschalten 3 -> 2`);
  // Heulen: aufgezeichnete Rückwärtsfahrt (Drehzahl und Tempo wie im Spiel), mit Motor
  const heul = await P.rendereVerlauf((w, t) => {
    const r = rueck[Math.min(rueck.length - 1, Math.floor(t / 0.25))];
    w.aktualisiere(1 / 60, P.zustand({ drehzahl: r.rpm, gang: r.gang, zielGang: r.gang, tempo: Math.abs(r.v), vVor: r.v, bremse: 1 }));
  }, 5);
  out.bilder.heulen = P.spektrogramm(heul.daten, `${P.CONFIG.version}: Rückwärts anfahren bis 9 m/s (Motor + Getriebeheulen)`);

  // --- M8d: Messungen je Auto (nur mit --profil) ---
  if (profil) {
    const pr = out.profil = { id: profil, ton: { ...TW }, motorWerte: JSON.parse(JSON.stringify(M)) };
    // Grundton im Leerlauf (Gas 0, Leerlaufdrehzahl; das leichte Zittern stört die Messung nicht)
    const leer = P.CONFIG.getriebe.leerlauf;
    let f0L = 0;
    const xl = await P.rendere((w) => { w.aktualisiere(1 / 60, P.zustand({ drehzahl: leer, gas: 0, gang: 0, zielGang: 0, ...TW })); f0L = w.zustand.f0; w.knoten.turboGain.disconnect(); }, 2, { limiter: false });
    pr.leerlauf = { f0: f0L, fGemessen: P.staerksteFrequenz(xl.daten, 0.5, 1.9, f0L * 0.9, f0L * 1.1, 0.1), rms: P.miss(xl.daten, 0.5, 1.9).rms };
    // Rauschanteil bei Vollgas 5000/min (nur Motor): Energie ausserhalb der Obertöne des halben Grundtons (das tiefste
    // Brummen liegt auf f0/2) im Band 2-6 kHz, und die spektrale Flachheit dort (1 = Rauschen, 0 = reine Töne)
    const m5 = out.motor.find((m) => m.rpm === 5000);
    const x5 = await P.rendere((w) => { w.aktualisiere(1 / 60, motorZ(5000)); w.knoten.turboGain.disconnect(); w.knoten.heulenGain.disconnect(); if (w.lader) w.lader.gain.disconnect(); }, 2, { limiter: false });
    const s5 = P.spektrum(x5.daten, 0.5, 1.9), halb = m5.f0 / 2;
    let innen = 0, aussen = 0, logSumme = 0, summe = 0, n = 0;
    for (let k = 1; k < s5.p.length; k++) {
      const f = k * s5.df;
      if (f < 2000 || f > 6000) continue;
      const naechste = Math.round(f / halb) * halb;
      if (Math.abs(f - naechste) <= 1.5 * s5.df + naechste * 0.004) innen += s5.p[k]; else aussen += s5.p[k];
      logSumme += Math.log(s5.p[k] + 1e-30); summe += s5.p[k]; n++;
    }
    pr.rauschen = { ausserhalbObertoene: aussen / (innen + aussen), flachheit: Math.exp(logSumme / n) / (summe / n), f0: m5.f0 };
    // Turbo-Pfeifen bei vollem Ladedruck (eigenes Modell, wie oben): Tonhöhe und Pegel; ohne Turbo: Pegel des Bandes
    // um die Pfeif-Tonhöhe des Audan (Referenzwerte) mit und ohne Pfeif-Oszillator = Rauschboden
    const t5 = out.turbo.find((t) => t.rpm === 5000);
    const nurTurbo = await P.rendere((w) => { w.zustand.druck = 1; w.aktualisiere(1 / 60, motorZ(5000)); w.knoten.motorLast.disconnect(); w.knoten.heulenGain.disconnect(); if (w.lader) w.lader.gain.disconnect(); }, 1.5, { limiter: false });
    const tRms = P.miss(nurTurbo.daten, 0.5, 1.4).rms;
    pr.turbo = { rms: tRms, verhaeltnisDb: t5.verhaeltnisDb, ton: tRms > 1e-6 ? P.staerksteFrequenz(nurTurbo.daten, 0.5, 1.0, 1000, 9000, 5) : 0, tonSoll: M.turboTonMax };
    const ref = FP.motorReferenz('turboTonMax');
    const band = (d) => { const sp = P.spektrum(d, 0.5, 1.4); let e = 0; for (let k = 1; k < sp.p.length; k++) { const f = k * sp.df; if (Math.abs(f - ref) < ref * 0.12) e += sp.p[k]; } return e; };
    const mit = await P.rendere((w) => { w.zustand.druck = 1; w.aktualisiere(1 / 60, motorZ(5000)); w.knoten.heulenGain.disconnect(); }, 1.5, { limiter: false });
    const ohne = await P.rendere((w) => { w.zustand.druck = 1; w.aktualisiere(1 / 60, motorZ(5000)); w.knoten.heulenGain.disconnect(); w.knoten.turboGain.disconnect(); }, 1.5, { limiter: false });
    pr.turbo.bandMitDb = 10 * Math.log10(band(mit.daten) + 1e-30); pr.turbo.bandOhneDb = 10 * Math.log10(band(ohne.daten) + 1e-30);
    // Pops und Blow-off über eine feste 60-s-Fahrt (dieselbe wie in tools/m8c-test.mjs (h)), mit echtem Getriebe
    {
      const ctx = new OfflineAudioContext(1, P.RATE, P.RATE);
      const w = baueKlangwerk(ctx);
      const g = new Getriebe();
      let v = 12;
      const takt = [[1.6, 1], [0.9, 0], [0.5, 0.5], [1.2, 1], [0.7, 0], [1.4, 1], [0.6, 0.2], [2.0, 1], [1.0, 0]];
      const dauer = takt.reduce((a, [d]) => a + d, 0);
      for (let k = 0; k < 60 * 60; k++) {
        const t = (k / 60) % dauer;
        let s0 = 0, gas = 0;
        for (const [d, xx] of takt) { if (t < s0 + d) { gas = xx; break; } s0 += d; }
        for (let i = 0; i < 2; i++) { const m = g.schritt(1 / 120, { gas, bremse: 0 }, v, v, 1, 'asphalt'); v = Math.max(3, Math.min(48, v + (m.beschl - m.motorbremse * (gas ? 0 : 1) - 0.0004 * v * v - 0.15) / 120)); }
        w.aktualisiere(1 / 60, P.zustand({ drehzahl: g.drehzahl, gang: g.gang, zielGang: g.zielGang, schaltet: g.schaltet, gas, tempo: v, vVor: v, ladedruck: g.ladedruck, turboAn: !!P.CONFIG.getriebe.turbo.an, ...TW }));
      }
      pr.pops = { salvenMitPops: w.protokoll.filter((e) => e.art === 'salve' && e.wert > 0).length, pops: w.zaehler.knall || 0, knistern: w.zaehler.knistern || 0, schaltknall: w.zaehler.schaltknall || 0, blowOff: w.zaehler.blowOff || 0, minuten: 1 };
    }
    // --- M8e: Bass bei Teillast, Unregelmässigkeit (Blubbern), Lader-Heulen ---
    // Teillast: 2500/min, Gas 0.4 (nur Motor). Energie unter 200 Hz (Band 20-200 Hz) und Schwankung der Kurzzeit-Energie
    // (20-ms-Fenster, Band 20-200 Hz) im Leerlauf und bei Teillast
    {
      const nurMotor = (w) => { w.knoten.turboGain.disconnect(); w.knoten.heulenGain.disconnect(); if (w.lader) w.lader.gain.disconnect(); };
      const tl = await P.rendere((w) => { w.aktualisiere(1 / 60, P.zustand({ drehzahl: 2500, gas: 0.4, gang: 3, zielGang: 3, ...TW })); nurMotor(w); }, 2.5, { limiter: false });
      const bTl = P.band(tl.daten, 20, 200), bL = P.band(xl.daten, 20, 200);
      const sTl = P.schwankung(bTl, 0.5, 2.4), sL = P.schwankung(bL, 0.5, 1.9);
      pr.teillast = { unter200: sTl.energie, gesamt: P.miss(tl.daten, 0.5, 2.4).rms ** 2, schwankung: sTl.cv };
      pr.unrund = { leerlauf: sL.cv, teillast: sTl.cv, mittel: (sL.cv + sTl.cv) / 2 };
    }
    // Lader (nur mit lader.an): Tonhöhe bei 7000/min, Pegel gegen den Motor bei Vollgas 5000/min, Anstieg nach einem
    // Gasstoss (Zeit bis 90 % des Endpegels), Korrelation Tonhöhe/Drehzahl über die Vergleichsfahrt (weiter unten)
    pr.lader = { an: !!(M.lader && M.lader.an) };
    if (pr.lader.an) {
      const nurLader = (w) => { w.knoten.motorLast.disconnect(); w.knoten.turboGain.disconnect(); w.knoten.heulenGain.disconnect(); };
      const l7 = await P.rendere((w) => { w.aktualisiere(1 / 60, motorZ(7000)); nurLader(w); }, 1.5, { limiter: false });
      const l5 = await P.rendere((w) => { w.aktualisiere(1 / 60, motorZ(5000)); nurLader(w); }, 1.5, { limiter: false });
      pr.lader.hz7000 = P.staerksteFrequenz(l7.daten, 0.5, 1.4, 1000, 8000, 2);
      pr.lader.rms5000 = P.miss(l5.daten, 0.5, 1.4).rms;
      pr.lader.gegenMotorDb = P.dB(pr.lader.rms5000 / m5.rms);
      // Gasstoss bei 4000/min: 0.5 s ohne Gas, dann Vollgas; Pegel in 5-ms-Fenstern
      const st = await P.rendereVerlauf((w, t) => { w.aktualisiere(1 / 60, P.zustand({ drehzahl: 4000, gas: t < 0.5 ? 0 : 1, gang: 3, zielGang: 3, ...TW })); if (t === 0) nurLader(w); }, 1.2, { limiter: false });
      const fen = (a) => P.miss(st.daten, a, a + 0.005).rms;
      const vor = fen(0.4), end = fen(1.0);
      let t90 = null;
      for (let a = 0.5; a < 1.0; a += 0.0025) if (fen(a) >= vor + 0.9 * (end - vor)) { t90 = a - 0.5; break; }
      pr.lader.anstieg = t90; pr.lader.ohneGas = vor / end;
      // (Bezug: Turbo des Audan baut den Ladedruck in getriebe.turbo.aufbau = 0.35 s auf)
    }
    // Vergleichsfahrt (js/tonfahrt.js, wie VERGLEICH im Ton-Labor): Spektrogramm, Spitze vor dem Limiter, RMS unter Vollgas
    const { baueTonFahrt, TON_FAHRT } = await import('/js/tonfahrt.js');
    // M8e: Lader allein auf derselben Fahrt: Tonhöhe je 40 ms gegen die Drehzahl (Korrelation)
    if (pr.lader.an) {
      let fa = null; const rpmT = [];
      const lf = await P.rendereVerlauf((w, t) => {
        if (!fa) fa = baueTonFahrt(Getriebe);
        const f = t === 0 ? fa.zustand : fa.schritt(1 / 60);
        rpmT.push(f.drehzahl || leer);
        w.aktualisiere(1 / 60, P.zustand({ drehzahl: f.drehzahl || leer, gang: f.gang, zielGang: f.zielGang, schaltet: f.schaltet, gas: f.gas, tempo: f.tempo, vVor: f.tempo, ladedruck: f.ladedruck, turboAn: !!P.CONFIG.getriebe.turbo.an, ...TW }));
        if (t === 0) { w.knoten.motorLast.disconnect(); w.knoten.turboGain.disconnect(); w.knoten.heulenGain.disconnect(); }
      }, TON_FAHRT.dauer, { limiter: false });
      const xs = [], ys = [];
      for (let a = 0.2; a < TON_FAHRT.dauer - 0.1; a += 0.1) {
        const rpm = rpmT[Math.min(rpmT.length - 1, Math.round((a + 0.02) * 60))];
        const soll = rpm / 60 * M.zuendFaktor * M.lader.faktor;
        xs.push(rpm); ys.push(P.staerksteFrequenz(lf.daten, a, a + 0.04, soll * 0.7, soll * 1.3, 4));
      }
      const mw = (v) => v.reduce((x, y) => x + y, 0) / v.length, mx = mw(xs), my = mw(ys);
      let sxy = 0, sxx = 0, syy = 0;
      for (let i = 0; i < xs.length; i++) { sxy += (xs[i] - mx) * (ys[i] - my); sxx += (xs[i] - mx) ** 2; syy += (ys[i] - my) ** 2; }
      pr.lader.korrelation = sxy / Math.sqrt(sxx * syy); pr.lader.punkte = xs.length;
    }
    let fahrt = null;
    const fx = await P.rendereVerlauf((w, t) => {
      if (!fahrt) fahrt = baueTonFahrt(Getriebe);
      const f = t === 0 ? fahrt.zustand : fahrt.schritt(1 / 60);
      w.aktualisiere(1 / 60, P.zustand({ drehzahl: f.drehzahl || leer, gang: f.gang, zielGang: f.zielGang, schaltet: f.schaltet, gas: f.gas, tempo: f.tempo, vVor: f.tempo, ladedruck: f.ladedruck, turboAn: !!P.CONFIG.getriebe.turbo.an, ...TW }));
    }, TON_FAHRT.dauer, { limiter: false });
    pr.fahrt = { spitze: P.miss(fx.daten).spitze, rmsVollgas: P.miss(fx.daten, 3.6, 5.0).rms, pops: fx.werk.zaehler.knall || 0, knistern: fx.werk.zaehler.knistern || 0, blowOff: fx.werk.zaehler.blowOff || 0 };
    pr.spitze = Math.max(pr.fahrt.spitze, ...out.motor.map((m) => m.spitze));
    const AUTO = { rt4: 'Audan Quarto', delto: 'Lanza Delto', escorta: 'Fard Escorta', l073: 'Lanza 073', imprexa: 'Subora Imprexa', prototyp: 'Prototyp' }[profil] || profil;
    out.bilder.fahrt = P.spektrogramm(fx.daten, `${P.CONFIG.version} ${AUTO}: Leerlauf, Vollgas 1.-3. Gang, Gas weg, Bremsen (Vergleichsfahrt)`, { breite: 800 });
    FP.waehleFahrprofil('prototyp');
  }
  return out;
}, { rueck, profil: PROFIL });

// (mit --profil nur die Motor-Bilder: Motor, Pop-Salve, Hochschalten, Vergleichsfahrt)
for (const [n, url] of Object.entries(erg.bilder)) if (!PROFIL || /^(motor|pop|schalten-hoch|fahrt)/.test(n)) fs.writeFileSync(path.join(BILDER, `${name}-${n}.png`), Buffer.from(url.split(',')[1], 'base64'));
delete erg.bilder;
erg.rueckFahrt = rueck;
fs.writeFileSync(path.join(WURZEL, `tools/ton-messung-${name}.json`), `${JSON.stringify(erg, (k, v) => (typeof v === 'number' ? Math.round(v * 10000) / 10000 : v), 1)}\n`);

// Tabelle
const f = (x, n = 0) => x.toFixed(n);
const db = (x) => (20 * Math.log10(x)).toFixed(1);
console.log(`Version ${erg.version}, Audio-Knoten ${erg.knoten.summe} ${JSON.stringify(erg.knoten.je)}`);
console.log('Motor Vollgas (ohne Turbo):  U/min | Grundton | gemessen | Schwerpunkt | >1k | >2.5k | Spitze | RMS (dBFS) | A-Pegel');
for (const m of erg.motor) console.log(`  ${m.rpm} | ${f(m.f0, 1)} | ${f(m.fGemessen, 1)} | ${f(m.schwerpunkt)} Hz | ${f(m.ueber1k * 100, 1)} % | ${f(m.ueber2k5 * 100, 1)} % | ${f(m.spitze, 3)} | ${f(m.rms, 3)} (${db(m.rms)}) | ${f(m.pegelA, 1)} dB`);
console.log(`Pop: Spitze ${f(erg.pop.spitze, 3)}, Dauer ${f(erg.pop.dauer, 3)} s, Schwerpunkt ${f(erg.pop.schwerpunkt)} Hz${erg.klack ? `; Klack: Spitze ${f(erg.klack.spitze, 3)}, Dauer ${f(erg.klack.dauer, 3)} s, Schwerpunkt ${f(erg.klack.schwerpunkt)} Hz` : ''}`);
for (const t of erg.turbo) console.log(`Turbo ${t.rpm}: Turbo-RMS ${f(t.turboRms, 4)}, Motor ${f(t.motorRms, 3)}, Verhältnis ${f(t.verhaeltnisDb, 1)} dB, Motor+Turbo ${f(t.gesamtRms, 3)}`);
console.log(`Aufprall-Pegel (RMS 0.15 s, Material + Schlag):  ${Object.entries(erg.aufprall).map(([m, x]) => `${m} ${Object.values(x).map((a) => db(a.pegelRms)).join(' / ')}`).join(', ')}`);
console.log(`Aufprall:  Material Stufe | Spitze (dBFS) | RMS 0.1 s | Schwerpunkt gesamt / Material allein | Ausklingen -40 dB | Spitze >1 kHz gesamt / allein`);
for (const [m, x] of Object.entries(erg.aufprall)) for (const [s, a] of Object.entries(x)) console.log(`  ${m} ${s} | ${f(a.spitze, 3)} (${db(a.spitze)}) | ${f(a.rms100, 3)} (${db(a.rms100)}) | ${f(a.schwerpunkt)} / ${f(a.schwerpunktAllein)} Hz | ${f(a.ausklingen40, 3)} s | ${f(a.spitzeUeber1k, 1)} / ${f(a.spitzeUeber1kAllein, 1)} dB`);
console.log(`Signale (Motor-Bezug 5000/min Vollgas mit Turbo, RMS ${f(erg.motorBezugRms, 3)} = ${db(erg.motorBezugRms)} dBFS):  Spitze | RMS aktiv | gegen Motor`);
for (const [n, s] of Object.entries(erg.signale)) console.log(`  ${n} | ${f(s.spitze, 3)} | ${f(s.rmsAktiv, 3)} | ${f(s.gegenMotorDb, 1)} dB`);
console.log('Heulen rückwärts:  t | U/min | m/s | Tonhöhe | RMS | Motor-RMS');
for (const h of erg.heulen) console.log(`  ${f(h.t, 2)} | ${f(h.rpm)} | ${f(h.v, 2)} | ${f(h.hz)} Hz | ${f(h.rms, 4)} | ${f(h.motorRms, 3)}`);
if (erg.profil) {
  const q = erg.profil;
  console.log(`Profil ${q.id} (turboMal ${q.ton.turboMal}, knallMal ${q.ton.knallMal}): Leerlauf ${f(q.leerlauf.f0, 1)} Hz (gemessen ${f(q.leerlauf.fGemessen, 1)}), Rauschen ausserhalb der Obertöne 2-6 kHz ${f(q.rauschen.ausserhalbObertoene * 100, 1)} %, Flachheit ${f(q.rauschen.flachheit, 3)}`);
  console.log(`  Turbo: Tonhöhe ${f(q.turbo.ton)} Hz (Soll ${f(q.turbo.tonSoll)}), RMS ${f(q.turbo.rms, 4)}, Band um ${f(q.turbo.tonSoll)} Hz mit/ohne Pfeifen ${f(q.turbo.bandMitDb, 1)} / ${f(q.turbo.bandOhneDb, 1)} dB`);
  console.log(`  M8e: Teillast 2500 Energie <200 Hz ${q.teillast.unter200.toExponential(3)}, Unregelmässigkeit Leerlauf ${f(q.unrund.leerlauf, 3)} / Teillast ${f(q.unrund.teillast, 3)}` +
    (q.lader.an ? `; Lader ${f(q.lader.hz7000)} Hz bei 7000, ${f(q.lader.gegenMotorDb, 1)} dB gegen Motor, Anstieg ${q.lader.anstieg == null ? '--' : f(q.lader.anstieg * 1000)} ms, Korrelation ${f(q.lader.korrelation, 4)}` : '; kein Lader'));
  console.log(`  60-s-Fahrt: ${q.pops.salvenMitPops} Salven mit ${q.pops.pops} Pops, ${q.pops.knistern} Knistern, ${q.pops.schaltknall} Schaltknall, ${q.pops.blowOff} Blow-off; Spitze ${f(q.spitze, 3)}; Vergleichsfahrt Spitze ${f(q.fahrt.spitze, 3)}, RMS Vollgas ${f(q.fahrt.rmsVollgas, 3)}`);
}
if (spiel.fehler.length) console.log('FEHLER:', spiel.fehler.join(' | '));
await spiel.schliessen();
