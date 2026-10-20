// Turbo im Ton messen (Meilenstein 8b):  node tools/m8b-ton.mjs
// Rechnet offline (OfflineAudioContext, wie tools/ton-messung.mjs) mit js/audio.js und dem echten Getriebe (js/getriebe.js):
//  (1) Pfeifen bei vollem Ladedruck: Pegel (RMS), Spitze, Spektralschwerpunkt – Profil ohne Turbo (eigenes Modell) gegen
//      mit Turbo (echter Ladedruck, mal turboPegelMal); Motor bei Vollgas gegen Pfeifen (Motor muss klar lauter sein);
//      Spitze der ganzen Mischung (Motor + Pfeifen) vor dem Limiter
//  (2) Aufbau des Pfeifens nach Vollgas (3. Gang, 4400 U/min, über kickdownUnter: kein Runterschalten dazwischen): Zeit, bis der Ladedruck im Ton 95 % hat und bis der
//      Pegel des Pfeifens 90 % hat – soll getriebe.turbo.aufbau ±25 % folgen
//  (3) Anti-Lag in der Schaltpause (Vollgas, Hochschalten 2 -> 3): Pfeifen in der Pause nie unter dem Pegel bei
//      Ladedruck 0.7
//  (4) Pops über eine feste Fahrt (60 s: Vollgas, Gas weg, wieder Gas ...) mit Profil prototyp und rt4 gezählt
// Ergebnis: tools/m8b-ton.json und eine Tabelle. Ich habe den Ton nicht gehört – das sind nur Zahlen.

import fs from 'node:fs';
import path from 'node:path';
import { starteSpiel, WURZEL } from './spiel-browser.mjs';

const spiel = await starteSpiel({ breite: 640, hoehe: 360, args: ['--autoplay-policy=no-user-gesture-required'], auto: 'prototyp' });
const p = spiel.page;
await p.goto(`${spiel.url}/index.html?menue=aus`);
await p.waitForFunction(() => window.__alpineRally, null, { timeout: 120000 });

const erg = await p.evaluate(async () => {
  const P = await import('/tools/ton-pruefung.js');
  const FP = await import('/js/fahrprofil.js');
  const { Getriebe } = await import('/js/getriebe.js');
  const M = P.CONFIG.audio.motor, T = () => P.CONFIG.getriebe.turbo;
  const out = {};
  const z = (t) => P.zustand({ gang: 3, zielGang: 3, ...t });
  // nur das Pfeifen hören: Motor und Heulen abhängen, Blow-off/Pops/Klack stumm
  const stumm = () => { const alt = [M.blowOffPegel, M.popPegel, M.klackPegel]; M.blowOffPegel = 0; M.popPegel = 0; M.klackPegel = 0; return () => { [M.blowOffPegel, M.popPegel, M.klackPegel] = alt; }; };
  const nurTurbo = (w) => { w.knoten.motorLast.disconnect(); w.knoten.heulenGain.disconnect(); };

  // --- (1) Pegel ---
  out.pegel = {};
  for (const [name, turboAn] of [['ohneTurbo', false], ['mitTurbo', true]]) {
    const r = {};
    for (const rpm of [5000, 7000]) {
      const zz = z({ drehzahl: rpm, gas: 1, turboAn, ladedruck: 1 });
      const t = await P.rendere((w) => { w.zustand.druck = 1; w.aktualisiere(1 / 60, zz); nurTurbo(w); }, 1.5, { limiter: false });
      const m = await P.rendere((w) => { w.zustand.druck = 1; w.aktualisiere(1 / 60, zz); w.knoten.turboGain.disconnect(); w.knoten.heulenGain.disconnect(); }, 1.5, { limiter: false });
      const g = await P.rendere((w) => { w.zustand.druck = 1; w.aktualisiere(1 / 60, zz); w.knoten.heulenGain.disconnect(); }, 1.5, { limiter: false });
      const mt = P.miss(t.daten, 0.5, 1.4), mm = P.miss(m.daten, 0.5, 1.4), mg = P.miss(g.daten, 0.5, 1.4);
      r[rpm] = { turboRms: mt.rms, turboSpitze: mt.spitze, schwerpunkt: P.schwerpunkt(P.spektrum(t.daten, 0.5, 1.4)), motorRms: mm.rms, motorGegenTurboDb: P.dB(mm.rms / mt.rms), mischungSpitze: mg.spitze, mischungRms: mg.rms };
    }
    out.pegel[name] = r;
  }
  // halber Ladedruck (Tonhöhe tiefer)
  const halb = await P.rendere((w) => { w.zustand.druck = 0.5; w.aktualisiere(1 / 60, z({ drehzahl: 5000, gas: 1, turboAn: true, ladedruck: 0.5 })); nurTurbo(w); }, 1.5, { limiter: false });
  out.pegel.halb = { turboRms: P.miss(halb.daten, 0.5, 1.4).rms, schwerpunkt: P.schwerpunkt(P.spektrum(halb.daten, 0.5, 1.4)) };

  // Fahrt mit dem echten Getriebe (einfaches Längsmodell wie tools/ton-messung.mjs), je Bild Getriebe -> Ton
  const fahrt = (v0, gang, eingabe, dauer, merke) => P.rendereVerlauf((w, t) => {
    const f = w.__f || (w.__f = { g: new Getriebe(), v: v0, liste: [] });
    if (t === 0 && gang) { f.g.gang = gang; f.g.zielGang = gang; f.g.sperre = 99; }
    const e = eingabe(t);
    for (let k = 0; k < 2; k++) {
      const m = f.g.schritt(1 / 120, e, f.v, f.v, 1, 'asphalt');
      f.v = Math.max(0, f.v + (m.beschl - m.motorbremse * (e.gas ? 0 : 1) - (e.bremse || 0) * 8 - 0.0004 * f.v * f.v - 0.15) / 120);
    }
    const G = f.g;
    w.aktualisiere(1 / 60, P.zustand({ drehzahl: G.drehzahl, gang: G.gang, zielGang: G.zielGang, schaltet: G.schaltet, gas: e.gas, bremse: e.bremse || 0, tempo: f.v, vVor: f.v, ladedruck: G.ladedruck, turboAn: !!P.CONFIG.getriebe.turbo.an }));
    if (merke) merke(t, f, w);
  }, dauer, { limiter: false, vorher: nurTurbo });
  // RMS in 20-ms-Fenstern
  const huelle = (d, fenster = 0.02) => { const n = Math.round(P.RATE * fenster), r = []; for (let i = 0; i + n <= d.length; i += n) { let q = 0; for (let k = i; k < i + n; k++) q += d[k] * d[k]; r.push(Math.sqrt(q / n)); } return r; };

  // --- (2) Aufbau nach Vollgas: 3. Gang bei 4400 U/min (über turbo.ab und getriebe.kickdownUnter), 0.5 s ohne Gas, dann Vollgas ---
  out.aufbau = {};
  for (const profil of ['prototyp', 'rt4']) {
    FP.waehleFahrprofil(profil);
    const zurueck = stumm();
    const v0 = 4400 / P.CONFIG.getriebe.nennDrehzahl * P.CONFIG.getriebe.gaenge[2] / 3.6;
    const druck = [];
    const x = await fahrt(v0, 3, (t) => ({ gas: t < 0.5 ? 0 : 1, bremse: 0 }), 2.0, (t, f, w) => druck.push([t, w.zustand.druck, f.g.ladedruck]));
    zurueck();
    const h = huelle(x.daten), ende = Math.max(...h.slice(h.length - 15));
    const t90 = h.findIndex((r, i) => i * 0.02 >= 0.5 && r >= 0.9 * ende);
    const d95 = druck.find(([t, d]) => t >= 0.5 && d >= 0.95 * druck[druck.length - 1][1]);
    out.aufbau[profil] = { pegel90: t90 < 0 ? null : t90 * 0.02 + 0.02 - 0.5, druck95: d95 ? d95[0] - 0.5 : null, druckEnde: druck[druck.length - 1][1], aufbau: T().aufbau };
  }

  // --- (3) Anti-Lag in der Schaltpause: Vollgas im 2. Gang knapp vor dem Hochschalten ---
  out.antiLag = {};
  for (const profil of ['prototyp', 'rt4']) {
    FP.waehleFahrprofil(profil);
    const zurueck = stumm();
    const v0 = 6200 / P.CONFIG.getriebe.nennDrehzahl * P.CONFIG.getriebe.gaenge[1] / 3.6;
    const schalt = [];
    const x = await fahrt(v0, 2, () => ({ gas: 1, bremse: 0 }), 2.0, (t, f, w) => schalt.push([t, f.g.schaltet, w.zustand.druck, f.g.ladedruck]));
    zurueck();
    const h = huelle(x.daten, 1 / 60);
    // Fenster der ersten Schaltpause (nach 0.4 s: Ladedruck ist dann aufgebaut)
    const i0 = schalt.findIndex(([t, s]) => t > 0.4 && s), i1 = i0 < 0 ? -1 : schalt.findIndex(([t, s], i) => i > i0 && !s);
    const pause = i0 < 0 ? [] : h.slice(i0 + 1, i1);
    out.antiLag[profil] = { pauseVon: i0 < 0 ? null : schalt[i0][0], pauseBis: i1 < 0 ? null : schalt[i1][0], minRmsPause: pause.length ? Math.min(...pause) : null, rmsVorher: i0 > 3 ? h[i0 - 2] : null, minDruckPause: i0 < 0 ? null : Math.min(...schalt.slice(i0, i1).map((s) => s[2])), minLadedruckPause: i0 < 0 ? null : Math.min(...schalt.slice(i0, i1).map((s) => s[3])) };
  }
  // Bezug: Pfeifen bei festem Ladedruck 0.7 (mit Turbo)
  FP.waehleFahrprofil('rt4');
  const b07 = await P.rendere((w) => { w.zustand.druck = 0.7; w.aktualisiere(1 / 60, z({ drehzahl: 4500, gas: 0, turboAn: true, ladedruck: 0.7 })); nurTurbo(w); }, 1.0, { limiter: false });
  out.antiLag.bezug07 = P.miss(b07.daten, 0.3, 0.9).rms;

  // --- (4) Pops über eine feste Fahrt (60 s): 1.6 s Vollgas, 0.9 s Gas weg, 0.5 s halb, ... (ohne Ton zu rechnen) ---
  out.pops = {};
  for (const profil of ['prototyp', 'rt4']) {
    FP.waehleFahrprofil(profil);
    const ctx = new OfflineAudioContext(1, P.RATE, P.RATE);
    const { baueKlangwerk } = await import('/js/audio.js');
    const w = baueKlangwerk(ctx);
    const g = new Getriebe();
    let v = 12, salven = 0, antiLag = 0;
    const takt = [[1.6, 1], [0.9, 0], [0.5, 0.5], [1.2, 1], [0.7, 0], [1.4, 1], [0.6, 0.2], [2.0, 1], [1.0, 0]];
    const dauer = takt.reduce((a, [d]) => a + d, 0);
    for (let k = 0; k < 60 * 60; k++) {
      const t = (k / 60) % dauer;
      let s = 0, gas = 0;
      for (const [d, x] of takt) { if (t < s + d) { gas = x; break; } s += d; }
      for (let i = 0; i < 2; i++) {
        const m = g.schritt(1 / 120, { gas, bremse: 0 }, v, v, 1, 'asphalt');
        v = Math.max(3, Math.min(48, v + (m.beschl - m.motorbremse * (gas ? 0 : 1) - 0.0004 * v * v - 0.15) / 120));
      }
      const vorher = w.zaehler.salve || 0;
      w.aktualisiere(1 / 60, P.zustand({ drehzahl: g.drehzahl, gang: g.gang, zielGang: g.zielGang, schaltet: g.schaltet, gas, tempo: v, vVor: v, ladedruck: g.ladedruck, turboAn: !!P.CONFIG.getriebe.turbo.an }));
      if ((w.zaehler.salve || 0) > vorher) { salven++; if (P.CONFIG.getriebe.turbo.an && g.drehzahl >= T().antiLagAb && g.ladedruck >= M.blowOffAb) antiLag++; }
    }
    out.pops[profil] = { salven, mitAntiLag: antiLag, pops: w.zaehler.knall || 0, salvenMitPops: w.protokoll.filter((e) => e.art === 'salve' && e.wert > 0).length, blowOff: w.zaehler.blowOff || 0 };
  }
  FP.waehleFahrprofil('prototyp');
  out.werte = { turboPegel: M.turboPegel, turboPegelMal: M.turboPegelMal, turboKnallPlus: M.turboKnallPlus, knallChance: M.knallChance, aufbau: P.CONFIG.fahrprofile.rt4.getriebe.turbo.aufbau ?? P.CONFIG.getriebe.turbo.aufbau };
  return out;
});

fs.writeFileSync(path.join(WURZEL, 'tools/m8b-ton.json'), `${JSON.stringify(erg, (k, v) => (typeof v === 'number' ? Math.round(v * 100000) / 100000 : v), 1)}\n`);
const db = (x) => (20 * Math.log10(x)).toFixed(1);
const f = (x, n = 3) => (x == null ? '--' : x.toFixed(n));
const o = erg.pegel.ohneTurbo, m = erg.pegel.mitTurbo;
console.log('(1) Pfeifen bei vollem Ladedruck (vor dem Limiter):');
for (const rpm of [5000, 7000]) {
  console.log(`  ${rpm}/min: ohne Turbo-Profil RMS ${f(o[rpm].turboRms, 4)} (${db(o[rpm].turboRms)} dBFS), mit Turbo ${f(m[rpm].turboRms, 4)} (${db(m[rpm].turboRms)} dBFS) = ${db(m[rpm].turboRms / o[rpm].turboRms)} dB lauter;` +
    ` Schwerpunkt ${f(m[rpm].schwerpunkt, 0)} Hz; Motor gegen Pfeifen ${f(m[rpm].motorGegenTurboDb, 1)} dB (ohne Turbo ${f(o[rpm].motorGegenTurboDb, 1)} dB);` +
    ` Spitze Mischung ${f(m[rpm].mischungSpitze)} (ohne ${f(o[rpm].mischungSpitze)})`);
}
console.log(`  halber Ladedruck: RMS ${f(erg.pegel.halb.turboRms, 4)}, Schwerpunkt ${f(erg.pegel.halb.schwerpunkt, 0)} Hz`);
console.log('(2) Aufbau nach Vollgas (3. Gang, 4400/min):');
for (const [k, a] of Object.entries(erg.aufbau)) console.log(`  ${k}: Ladedruck im Ton 95 % nach ${f(a.druck95, 2)} s, Pfeifen-Pegel 90 % nach ${f(a.pegel90, 2)} s (getriebe.turbo.aufbau ${a.aufbau} s, Ziel ±25 % = ${(a.aufbau * 0.75).toFixed(2)}-${(a.aufbau * 1.25).toFixed(2)} s)`);
console.log('(3) Schaltpause 2 -> 3 mit Vollgas:');
for (const k of ['prototyp', 'rt4']) { const a = erg.antiLag[k]; console.log(`  ${k}: Pause ${f(a.pauseVon, 2)}-${f(a.pauseBis, 2)} s, Pfeifen vorher RMS ${f(a.rmsVorher, 4)}, in der Pause min ${f(a.minRmsPause, 4)}, Ladedruck min ${f(a.minLadedruckPause, 2)} (im Ton ${f(a.minDruckPause, 2)})`); }
console.log(`  Bezug: Pfeifen bei Ladedruck 0.7: RMS ${f(erg.antiLag.bezug07, 4)}`);
console.log('(4) Pops über 60 s feste Fahrt:');
for (const [k, a] of Object.entries(erg.pops)) console.log(`  ${k}: ${a.salven} Mal Gas weg mit Poppen-Auslöser (${a.mitAntiLag} mit Anti-Lag), ${a.salvenMitPops} Salven mit Pops, ${a.pops} Pops, Blow-off ${a.blowOff}`);
if (spiel.fehler.length) console.log('FEHLER:', spiel.fehler.join(' | '));
await spiel.schliessen();
