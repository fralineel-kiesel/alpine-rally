// Test für Meilenstein 7a (Ton plus zwei HUD-Korrekturen) und 7a.1 (Motor härter, Poppen, Schalten, Signale, Aufprall,
// Heulen, Ton-Labor-Feinschliff):  node tools/ton-test.mjs
// Teil 1 = die Tests (a)-(k) aus M7a (angepasst, wo sich in M7a.1 Werte geändert haben: Grundton-Kurve, Poppen statt Knall,
// Heulen nach Drehzahl, Ducking -7 dB, Stein ohne grossen Schlag, Spektrogramme nach screenshots/m7a-1/).
// Teil 2 = neue Tests M7a.1 (a)-(l); Vergleichswerte von M7a aus tools/ton-messung-vorher.json (node tools/ton-messung.mjs).
// Playwright mit Chromium. Der Ton wird nicht gehört, sondern gemessen: Parameter der Knoten (Tonhöhe, Pegel, Filter),
// Ereignisse (welcher Klang wann), offline gerechnete Klänge (OfflineAudioContext: Spitze, RMS, Anfang, Ausklingen).
//  (a) Entsperren: kein AudioContext vor dem ersten Tastendruck, danach "running"; ?ton=aus und ?menue=aus nie Ton;
//      ohne Web Audio läuft das Spiel (keine Fehler)
//  (b) Motor: Grundton folgt der Drehzahl (±2 %), Turbo mit Last, Blow-off, Knallen (feste Zufallsfolge), Begrenzer,
//      Schaltpause, Rückwärts-Heulen, Countdown: Gas ändert nichts
//  (c) Untergrund: Rollgeräusch je Belag mit Überblendung, Quietschen nur auf Asphalt, sonst Rutschen, Schwelle, Ratschen
//  (d) Aufprall: Material, Lautstärke nach Wucht, Sperrzeit, Ducking, unsichtbare Grenze stumm, Felswand = Fels,
//      Statistik (Aufpralle, Resets, Höchsttempo) mit und ohne Ton gleich
//  (e) Signale: Menü-Töne (ohne Doppelton), Pause/Weiter, Countdown genau zu den Zahlen, Pause im Countdown,
//      Checkpoint-Töne passend zu Meldung und Punkt, Verpasst, Fanfaren, Pace-Notes-Signal
//  (f) Mix und Zustände: Pause, Menü/Demo stumm, Neustart/Hauptmenü ohne hängende Töne, Tab versteckt
//  (g) Regler LAUTSTÄRKE: 0 = stumm, 100 = voll, quadratisch, weich
//  (h) Stimmen-Limit, keine Knoten-Lecks nach einer Minute Fahrt
//  (i) Offline gerechnet: kein NaN, Spitze < 0.98 (auch alles zugleich), keine Gleichspannung, RMS, sauberer Anfang,
//      Ausklingzeit; Spektrogramme nach screenshots/m7a/
//  (j) HUD: Minimap 49 x 49, Auto in der Mitte, Kehren als Zickzack; Checkpoint-Punkte grün / rot / gelb
//  (k) Texte de/en, Pixelschrift; keine Konsolenfehler
// Dazu: Zahlen für STAND.md (Puffer-Aufbau, Bildzeit mit/ohne Ton).

import fs from 'node:fs';
import path from 'node:path';
import { starteSpiel, WURZEL } from './spiel-browser.mjs';

let fehlerZahl = 0;
const pruefe = (ok, text, info = '') => {
  console.log(`  ${ok ? 'OK   ' : 'FEHLER'} ${text}${info ? `  (${info})` : ''}`);
  if (!ok) fehlerZahl++;
};
const AUTOPLAY = ['--autoplay-policy=no-user-gesture-required'];
const fahrerCode = fs.readFileSync(path.join(WURZEL, 'tools/testfahrer-browser.js'), 'utf8');
const BILDER = path.join(WURZEL, 'screenshots/m7a-1');
const VORHER = JSON.parse(fs.readFileSync(path.join(WURZEL, 'tools/ton-messung-vorher.json'), 'utf8')); // M7a gemessen
fs.mkdirSync(BILDER, { recursive: true });
const A = (p, f, arg) => p.evaluate(f, arg);
const warte = (ms) => new Promise((r) => setTimeout(r, ms));
async function bilderAbwarten(p, n = 3) {
  await p.evaluate((n) => new Promise((r) => { let k = 0; const f = () => (++k >= n ? r() : requestAnimationFrame(f)); requestAnimationFrame(f); }), n);
}
const r2 = (x) => Math.round(x * 100) / 100;

// Spiel mit Menü laden; entsperren = Taste auf dem Titel (Ton an). Hilfen window.__T wie in den anderen Tests
async function lade({ entsperren = true, args = AUTOPLAY, adresse = '', initScript = null, speicherLeeren = true } = {}) {
  const spiel = await starteSpiel({ breite: 640, hoehe: 360, args });
  const p = spiel.page;
  if (speicherLeeren) await p.addInitScript(() => { if (!sessionStorage.getItem('leer')) { localStorage.clear(); sessionStorage.setItem('leer', '1'); } });
  if (initScript) await p.addInitScript(initScript);
  await p.goto(`${spiel.url}/index.html${adresse}`);
  await p.waitForFunction(() => window.__alpineRally, null, { timeout: 120000 });
  await bilderAbwarten(p, 3);
  if (entsperren) {
    await p.keyboard.press('Enter');
    await p.waitForFunction(() => { const t = window.__alpineRally.ton; return !t.an || (t.werk && t.werk.aufbau.fertig); }, null, { timeout: 30000 });
  }
  await A(p, (code) => {
    window.__fahrerUrl = URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
    const A = window.__alpineRally;
    const LEER = { gas: 0, bremse: 0, lenkung: 0, handbremse: false, reset: false, debug: false, notes: false, hud: false };
    window.__T = {
      LEER,
      ueberCountdown() { let n = 0; while (A.ablauf.zustand === 'countdown' && n < 2000) { A.rennSchritt(A.SCHRITT, LEER); n++; } return n; },
      // ein Bild wie in der Spielschleife: zwei Schritte (1/120 s), dann der Ton (1/60 s)
      bild(e = LEER) { A.rennSchritt(A.SCHRITT, e); A.rennSchritt(A.SCHRITT, e); A.tonBild(1 / 60); },
      zaehler: (art) => (A.ton.werk ? A.ton.werk.zaehler[art] || 0 : 0),
    };
  }, fahrerCode);
  return spiel;
}

// Eigenes Klangwerk auf eigenem AudioContext (für Messungen ohne die Spielschleife); schritte(z, sek) wie Bilder
const WERK = async () => {
  const { baueKlangwerk } = await import('/js/audio.js');
  const P = await import('/tools/ton-pruefung.js');
  const ctx = new AudioContext();
  const w = baueKlangwerk(ctx);
  w.puffernSofort();
  w.lautstaerke(70);
  window.__W = w; window.__P = P;
  window.__schritte = (z, sek, dt = 1 / 60) => { for (let t = 0; t < sek - 1e-9; t += dt) w.aktualisiere(dt, z); };
  window.__warte = (ms) => new Promise((r) => setTimeout(r, ms));
  return ctx.state;
};

// =====================================================================
console.log('(a) Entsperren, ?ton=aus, ?menue=aus, ohne Web Audio');
{
  // echte Browser-Regel (ohne Autoplay-Schalter): erst nach dem Tastendruck
  const spiel = await lade({ entsperren: false, args: [] });
  const p = spiel.page;
  const vor = await A(p, () => ({ an: window.__alpineRally.ton.an, z: window.__alpineRally.ton.zustand, ab: window.__alpineRally.ablauf.zustand }));
  await bilderAbwarten(p, 10);
  const vor2 = await A(p, () => window.__alpineRally.ton.zustand);
  await p.keyboard.press('Enter');
  await warte(300);
  const nach = await A(p, () => ({ z: window.__alpineRally.ton.zustand, ab: window.__alpineRally.ablauf.zustand, blip: window.__alpineRally.ton.werk.zaehler['menue-bestaetigen'] || 0 }));
  await p.waitForFunction(() => window.__alpineRally.ton.werk.aufbau.fertig, null, { timeout: 30000 });
  const aufbau = await A(p, () => window.__alpineRally.ton.werk.aufbau);
  pruefe(vor.an && vor.z === 'keiner' && vor2 === 'keiner' && vor.ab === 'titel', 'Titel: noch kein AudioContext (auch nach ein paar Bildern)', `${vor.z}`);
  pruefe(nach.z === 'running' && nach.ab === 'menue' && nach.blip === 1, 'nach dem ersten Tastendruck: AudioContext läuft, ein Blip', `${nach.z}, Blip ${nach.blip}`);
  pruefe(aufbau.fertig && aufbau.laengstesMs < 15 && aufbau.ms < 300, 'Puffer nach dem Entsperren in Häppchen gebaut (jedes < 15 ms, zusammen < 300 ms)',
    `${aufbau.ms.toFixed(0)} ms Rechenzeit in ${aufbau.haeppchen} Häppchen, längstes ${aufbau.laengstesMs.toFixed(1)} ms, fertig ${(aufbau.ende - aufbau.start).toFixed(0)} ms nach dem Tastendruck`);
  console.log(`  ZAHL Puffer-Aufbau: ${aufbau.ms.toFixed(0)} ms Rechenzeit, ${aufbau.haeppchen} Häppchen, längstes ${aufbau.laengstesMs.toFixed(1)} ms`);
  pruefe(spiel.fehler.length === 0, 'keine Fehler in der Konsole', spiel.fehler.join(' | '));
  await spiel.schliessen();

  for (const [adresse, text] of [['?ton=aus', '?ton=aus'], ['?menue=aus', '?menue=aus (alle alten Tests)']]) {
    const s = await lade({ entsperren: false, adresse });
    const q = s.page;
    await q.keyboard.press('Enter'); await bilderAbwarten(q, 5);
    await A(q, () => { const A = window.__alpineRally; if (A.ablauf.zustand !== 'rennen') A.start({ countdown: false }); A.testEingabe = { gas: 1 }; });
    await warte(800);
    const r = await A(q, () => ({ an: window.__alpineRally.ton.an, z: window.__alpineRally.ton.zustand, v: window.__alpineRally.physik.tempo }));
    pruefe(!r.an && r.z === 'keiner' && r.v > 0.5, `${text}: nie ein AudioContext, das Spiel läuft`, `Tempo ${r.v.toFixed(1)} m/s`);
    pruefe(s.fehler.length === 0, '... keine Fehler in der Konsole', s.fehler.join(' | '));
    await s.schliessen();
  }

  // Browser ohne Web Audio
  const s = await lade({ entsperren: false, initScript: () => { window.AudioContext = undefined; window.webkitAudioContext = undefined; } });
  const q = s.page;
  await q.keyboard.press('Enter'); await bilderAbwarten(q, 3);
  await q.keyboard.press('Enter'); // STARTEN
  await q.waitForFunction(() => window.__alpineRally.ablauf.zustand === 'rennen', null, { timeout: 60000 });
  await A(q, () => { window.__alpineRally.testEingabe = { gas: 1 }; });
  await warte(800);
  await q.keyboard.press('Escape'); await bilderAbwarten(q, 3); await q.keyboard.press('Escape'); await bilderAbwarten(q, 3);
  const r = await A(q, () => ({ an: window.__alpineRally.ton.an, z: window.__alpineRally.ton.zustand, v: window.__alpineRally.physik.tempo, ab: window.__alpineRally.ablauf.zustand }));
  pruefe(!r.an && r.z === 'keiner' && r.v > 0.5 && r.ab === 'rennen', 'ohne Web Audio: Menü, Countdown, Rennen, Pause gehen stumm', `Tempo ${r.v.toFixed(1)} m/s, Zustand ${r.ab}`);
  pruefe(s.fehler.length === 0, '... keine Fehler in der Konsole', s.fehler.join(' | '));
  await s.schliessen();
}

// =====================================================================
console.log('(b) Motor');
{
  const spiel = await lade({ entsperren: false });
  const p = spiel.page;
  await A(p, WERK);
  const r = await A(p, async () => {
    const w = window.__W, P = window.__P, s = window.__schritte, warte = window.__warte, C = P.CONFIG, M = C.audio.motor;
    const erg = {};
    // Grundton nach der Kurve motorTon (M7a.1; Parameter des Knotens nach dem Einschwingen)
    const { motorTon } = await import('/js/audio.js');
    erg.f0 = [];
    for (const rpm of [C.getriebe.leerlauf, 3000, 6000]) {
      const z = P.zustand({ drehzahl: rpm, gas: 0.5 });
      s(z, 0.2); await warte(300); s(z, 1 / 60);
      erg.f0.push({ rpm, ist: w.knoten.f0.offset.value, soll: motorTon(rpm) });
    }
    // Turbo: Ladedruck nach 2 s bei 5000/min mit wenig / viel Gas
    w.allesAus();
    s(P.zustand({ drehzahl: 5000, gas: 0.25 }), 2); const wenig = w.zustand.turbo;
    s(P.zustand({ drehzahl: 5000, gas: 1 }), 0.4); const nach04 = w.zustand.druck;
    s(P.zustand({ drehzahl: 5000, gas: 1 }), 2); const viel = w.zustand.turbo, druckVoll = w.zustand.druck;
    w.allesAus(); s(P.zustand({ drehzahl: 2000, gas: 1 }), 2); const unten = w.zustand.turbo;
    erg.turbo = { wenig, viel, unten, nach04, druckVoll };
    // Blow-off: schnell vom Gas bei Ladedruck -> 1; ein bisschen weniger Gas / langsam weg / ohne Ladedruck -> 0
    const bo = () => w.zaehler.blowOff || 0;
    const voll = () => s(P.zustand({ drehzahl: 5500, gas: 1 }), 2.5);
    voll(); let b0 = bo(); s(P.zustand({ drehzahl: 5500, gas: 0 }), 0.4); const schnell = bo() - b0;
    voll(); b0 = bo(); s(P.zustand({ drehzahl: 5500, gas: 0.7 }), 0.6); const klein = bo() - b0;
    voll(); b0 = bo(); for (let k = 0; k <= 90; k++) s(P.zustand({ drehzahl: 5500, gas: 1 - k / 90 }), 1 / 60); s(P.zustand({ drehzahl: 5500, gas: 0 }), 0.3); const langsam = bo() - b0;
    s(P.zustand({ drehzahl: 2500, gas: 1 }), 2.5); b0 = bo(); s(P.zustand({ drehzahl: 2500, gas: 0 }), 0.4); const ohneDruck = bo() - b0;
    voll(); b0 = bo(); s(P.zustand({ drehzahl: 5500, gas: 1, schaltet: true }), 0.25); const schalten = bo() - b0;
    erg.blowOff = { schnell, klein, langsam, ohneDruck, schalten };
    // Knallen: 40 Mal Gas weg bei 5500/min (dazwischen 1.8 s, länger als die Sperre); dann dasselbe nochmal mit neuem Werk
    const knallFolge = (werk) => {
      const liste = [];
      for (let k = 0; k < 40; k++) {
        for (let t = 0; t < 0.8; t += 1 / 60) werk.aktualisiere(1 / 60, P.zustand({ drehzahl: 5500, gas: 1 }));
        const vor = werk.zaehler.knall || 0;
        for (let t = 0; t < 1.0; t += 1 / 60) werk.aktualisiere(1 / 60, P.zustand({ drehzahl: 5500, gas: 0 }));
        liste.push((werk.zaehler.knall || 0) - vor);
      }
      return liste;
    };
    const { baueKlangwerk } = await import('/js/audio.js');
    const w2 = baueKlangwerk(new AudioContext()); w2.puffernSofort();
    const w3 = baueKlangwerk(new AudioContext()); w3.puffernSofort();
    const k1 = knallFolge(w2), k2 = knallFolge(w3);
    let unterAb = 0;
    for (let k = 0; k < 20; k++) {
      s(P.zustand({ drehzahl: M.knallAb - 300, gas: 1 }), 0.8);
      const vor = w.zaehler.knall || 0; s(P.zustand({ drehzahl: M.knallAb - 300, gas: 0 }), 1.0); unterAb += (w.zaehler.knall || 0) - vor;
    }
    erg.knall = { k1, k2, unterAb };
    // Begrenzer
    w.allesAus();
    s(P.zustand({ drehzahl: 6950, gas: 1 }), 0.06); const kurz = w.zustand.begrenzer;
    s(P.zustand({ drehzahl: 6950, gas: 1 }), 0.3); const lang = w.zustand.begrenzer;
    await warte(150); const param = w.knoten.begrenzerTiefe.gain.value;
    s(P.zustand({ drehzahl: 6000, gas: 1 }), 0.3); const tiefer = w.zustand.begrenzer;
    s(P.zustand({ drehzahl: 6950, gas: 0.5 }), 0.5); const halbGas = w.zustand.begrenzer;
    erg.begrenzer = { kurz, lang, param, tiefer, halbGas, hz: M.begrenzerHz };
    // Schaltpause: echtes Getriebe, Vollgas aus dem Stand; Grundton vor dem 1. Schalten und tiefster Wert in der Pause
    const { Getriebe } = await import('/js/getriebe.js');
    w.allesAus();
    const g = new Getriebe();
    let v = 0, vorF = 0, minF = Infinity, schaltZeit = 0, nachF = 0, phase = 0, motorPegelPause = 1, motorPegelVor = 0;
    for (let k = 0; k < 120 * 8 && phase < 2; k++) {
      const m = g.schritt(1 / 120, { gas: 1, bremse: 0 }, v, v, 1);
      v += (m.beschl - 0.0004 * v * v - 0.15) / 120;
      if (k % 2) {
        w.aktualisiere(1 / 60, P.zustand({ drehzahl: g.drehzahl, gas: 1, schaltet: g.schaltet, gang: g.gang, zielGang: g.zielGang, tempo: v, vVor: v }));
        if (phase === 0 && g.schaltet) phase = 1;
        if (phase === 0) { vorF = w.zustand.f0; motorPegelVor = w.zustand.motorPegel; }
        if (phase === 1) { minF = Math.min(minF, w.zustand.f0); schaltZeit += 1 / 60; motorPegelPause = Math.min(motorPegelPause, w.zustand.motorPegel); if (!g.schaltet) { phase = 2; nachF = w.zustand.f0; } }
      }
    }
    erg.schalten = { vorF, minF, nachF, schaltZeit, motorPegelVor, motorPegelPause };
    // Rückwärts
    w.allesAus();
    s(P.zustand({ drehzahl: 2500, gang: -1, tempo: 5, vVor: -5, bremse: 1 }), 0.3); const rueck = w.zustand.heulen;
    await warte(150); const heulHz = w.knoten.heulen.frequency.value;
    s(P.zustand({ drehzahl: 2500, gang: 1, tempo: 5, vVor: 5, gas: 0.5 }), 0.3); const vor = w.zustand.heulen;
    erg.rueck = { rueck, vor, heulHz, soll: 2500 / 60 * M.heulenFaktor };
    // Countdown: Auto gesperrt, Gas ändert den Ton nicht
    w.allesAus();
    const bo0 = w.zaehler.blowOff || 0, kn0 = w.zaehler.knall || 0;
    s(P.zustand({ modus: 'countdown', drehzahl: 1000, gas: 0 }), 1); const ohne = { f: w.zustand.filter, p: w.zustand.motorPegel, d: w.zustand.druck };
    s(P.zustand({ modus: 'countdown', drehzahl: 1000, gas: 1 }), 1); const mit = { f: w.zustand.filter, p: w.zustand.motorPegel, d: w.zustand.druck, bo: (w.zaehler.blowOff || 0) - bo0 };
    s(P.zustand({ modus: 'countdown', drehzahl: 1000, gas: 0 }), 0.5); const loslassen = { bo: (w.zaehler.blowOff || 0) - bo0, kn: (w.zaehler.knall || 0) - kn0 };
    erg.countdown = { ohne, mit, loslassen };
    return erg;
  });
  for (const f of r.f0) {
    const ab = Math.abs(f.ist / f.soll - 1);
    pruefe(ab <= 0.02, `Grundton bei ${f.rpm}/min: ${f.ist.toFixed(1)} Hz (soll ${f.soll.toFixed(1)} Hz)`, `Abweichung ${(ab * 100).toFixed(2)} %`);
  }
  const t = r.turbo;
  pruefe(t.viel > 4 * t.wenig && t.viel > 0 && t.unten === 0 && t.nach04 > 0.5 && t.nach04 < 0.8, 'Turbo-Pfeifen steigt mit Last (erst ab mittlerer Drehzahl, Ladedruck läuft ca. 0.4 s hinterher)',
    `Pegel wenig Gas ${t.wenig.toFixed(4)}, Vollgas ${t.viel.toFixed(4)}, bei 2000/min ${t.unten}; Ladedruck nach 0.4 s ${(t.nach04 * 100).toFixed(0)} %`);
  const b = r.blowOff;
  pruefe(b.schnell === 1 && b.klein === 0 && b.langsam === 0 && b.ohneDruck === 0 && b.schalten === 1, 'Blow-off: schnell vom Gas bei Ladedruck und beim Schalten unter Last, nicht bei wenig weniger Gas, langsamem Lösen oder ohne Ladedruck',
    JSON.stringify(b));
  const sum = (l) => l.reduce((a, x) => a + x, 0);
  const k = r.knall;
  // M7a.1: Salven aus 1-4 Pops mit Chance 0.7 (M7a: höchstens 2, Chance 0.45); genau geprüft in M7a.1 (d)
  const erwartet = 40 * 0.7 * 2.5;
  pruefe(JSON.stringify(k.k1) === JSON.stringify(k.k2), 'Poppen: feste Zufallsfolge (gleiches Fahren = gleiches Poppen)');
  pruefe(sum(k.k1) >= erwartet * 0.6 && sum(k.k1) <= erwartet * 1.4 && Math.max(...k.k1) <= 4 && k.k1.filter((x) => x === 0).length >= 4, 'Poppen: meistens eine Salve (1-4 Pops), manchmal keine',
    `${sum(k.k1)} Pops bei 40 Mal Gas weg (erwartet ca. ${erwartet.toFixed(0)}), ${k.k1.filter((x) => x === 0).length} Mal keine, Folge ${k.k1.join('')}`);
  pruefe(k.unterAb === 0, `Poppen nur über ${3500}/min (darunter 20 Mal Gas weg: ${k.unterAb})`);
  const g = r.begrenzer;
  pruefe(g.kurz === 0 && g.lang > 0.3 && g.param > 0.3 && g.tiefer === 0 && g.halbGas === 0, `Drehzahlbegrenzer: Stottern (${g.hz} Hz) nahe Höchstdrehzahl mit Vollgas nach kurzer Zeit, sonst nicht`,
    `Tiefe ${g.lang}, Knoten ${g.param.toFixed(2)}; nach 0.06 s ${g.kurz}, bei 6000/min ${g.tiefer}, halbes Gas ${g.halbGas}`);
  const sc = r.schalten;
  pruefe(sc.minF < sc.vorF * 0.8 && sc.nachF < sc.vorF && sc.motorPegelPause < sc.motorPegelVor * 0.7, 'Schaltpause: Grundton fällt hörbar, Motor ohne Last leiser, im neuen Gang steigt er wieder',
    `vor dem Schalten ${sc.vorF.toFixed(0)} Hz, tiefster Wert ${sc.minF.toFixed(0)} Hz (${((1 - sc.minF / sc.vorF) * 100).toFixed(0)} % tiefer), Pause ${(sc.schaltZeit * 1000).toFixed(0)} ms; Pegel ${sc.motorPegelVor.toFixed(2)} -> ${sc.motorPegelPause.toFixed(2)}`);
  pruefe(r.rueck.rueck > 0 && r.rueck.vor === 0 && Math.abs(r.rueck.heulHz - r.rueck.soll) < 5, 'Rückwärts: Getriebeheulen dazu (M7a.1: Tonhöhe nach Drehzahl), vorwärts nicht',
    `${r.rueck.heulHz.toFixed(0)} Hz bei 2500/min (soll ${r.rueck.soll.toFixed(0)})`);
  const c = r.countdown;
  pruefe(c.ohne.f === c.mit.f && c.ohne.p === c.mit.p && c.mit.d === 0 && !c.mit.bo && !c.loslassen.kn, 'Countdown: Gas ändert den Motorton nicht (Leerlauf, kein Ladedruck, kein Zischen, kein Knall)',
    `Filter ${c.ohne.f} / ${c.mit.f} Hz, Pegel ${c.ohne.p.toFixed(3)} / ${c.mit.p.toFixed(3)}`);
  pruefe(spiel.fehler.length === 0, 'keine Fehler in der Konsole', spiel.fehler.join(' | '));
  await spiel.schliessen();
}

// =====================================================================
console.log('(c) Reifen, Untergrund, Handbremse');
{
  const spiel = await lade({ entsperren: false });
  const p = spiel.page;
  await A(p, WERK);
  const r = await A(p, async () => {
    const w = window.__W, P = window.__P, s = window.__schritte, warte = window.__warte;
    const erg = { belag: {} };
    for (const u of ['asphalt', 'bankett', 'gras', 'schotter', 'wiesenweg']) {
      w.allesAus(); s(P.zustand({ tempo: 20, untergrund: u }), 0.5); await warte(250); s(P.zustand({ tempo: 20, untergrund: u }), 1 / 60);
      const z = w.zustand;
      erg.belag[u] = { surren: z.surren, weich: z.weich, kies: z.kies, weichHz: w.knoten.weichLp.frequency.value, surrenHz: w.knoten.surrenLp.frequency.value };
    }
    // Tempo: lauter und heller
    w.allesAus(); s(P.zustand({ tempo: 8 }), 0.3); await warte(200); s(P.zustand({ tempo: 8 }), 1 / 60);
    const langsam = { p: w.zustand.surren, hz: w.knoten.surrenLp.frequency.value };
    s(P.zustand({ tempo: 35 }), 0.3); await warte(200); s(P.zustand({ tempo: 35 }), 1 / 60);
    const schnell = { p: w.zustand.surren, hz: w.knoten.surrenLp.frequency.value };
    erg.tempo = { langsam, schnell };
    // Überblendung Asphalt -> Schotter, Werte der Knoten alle ca. 25 ms
    w.allesAus(); s(P.zustand({ tempo: 20 }), 0.3); await warte(400);
    const verlauf = [];
    const z2 = P.zustand({ tempo: 20, untergrund: 'schotter' });
    const t0 = performance.now();
    verlauf.push({ t: 0, a: w.knoten.surrenGain.gain.value, k: w.knoten.kiesGain.gain.value });
    while (performance.now() - t0 < 400) {
      w.aktualisiere(1 / 60, z2);
      await warte(25);
      verlauf.push({ t: performance.now() - t0, a: w.knoten.surrenGain.gain.value, k: w.knoten.kiesGain.gain.value });
    }
    erg.verlauf = verlauf;
    // Quietschen / Rutschen
    const q = (u, drift, hb = false, tempo = 20) => { w.allesAus(); s(P.zustand({ tempo, untergrund: u, drift, handbremse: hb }), 0.3); return { q: w.zustand.quietschen, r: w.zustand.rutschen }; };
    erg.quietschen = {
      asphalt20: q('asphalt', 20), asphalt5: q('asphalt', 5), asphalt9: q('asphalt', 9), schotter20: q('schotter', 20), schotter5: q('schotter', 5),
      gras20: q('gras', 20), wiesenweg20: q('wiesenweg', 20), bankett20: q('bankett', 20), hbAsphalt: q('asphalt', 0, true), hbSchotter: q('schotter', 0, true),
      hbStand: q('asphalt', 0, true, 0.5), langsam: q('asphalt', 30, false, 2),
    };
    // Handbremse ziehen: Ratschen (einmal pro Ziehen, nicht im Countdown)
    w.allesAus();
    const r0 = w.zaehler.ratsch || 0;
    s(P.zustand({ tempo: 15, handbremse: true }), 0.5);
    s(P.zustand({ tempo: 15, handbremse: false }), 0.2);
    s(P.zustand({ tempo: 15, handbremse: true }), 0.2);
    const zwei = (w.zaehler.ratsch || 0) - r0;
    s(P.zustand({ modus: 'countdown', handbremse: false }), 0.2); s(P.zustand({ modus: 'countdown', handbremse: true }), 0.2);
    erg.ratsch = { zwei, countdown: (w.zaehler.ratsch || 0) - r0 - zwei };
    return erg;
  });
  const B = r.belag;
  pruefe(B.asphalt.surren > 0 && !B.asphalt.weich && !B.asphalt.kies && B.schotter.kies > 0 && !B.schotter.surren && !B.schotter.weich
    && ['bankett', 'gras', 'wiesenweg'].every((u) => B[u].weich > 0 && !B[u].surren && !B[u].kies), 'Rollgeräusch je Untergrund: Asphalt Surren, Schotter Knirschen, Bankett/Gras/Wiesenweg weich',
    Object.entries(B).map(([u, x]) => `${u} ${(x.surren || x.weich || x.kies).toFixed(3)}`).join(', '));
  pruefe(B.gras.weichHz < B.wiesenweg.weichHz && B.wiesenweg.weichHz < B.bankett.weichHz && B.gras.weich < B.bankett.weich, 'Gras am dumpfsten und leisesten',
    `Helligkeit Gras ${B.gras.weichHz.toFixed(0)} Hz, Wiesenweg ${B.wiesenweg.weichHz.toFixed(0)} Hz, Bankett ${B.bankett.weichHz.toFixed(0)} Hz`);
  pruefe(r.tempo.schnell.p > r.tempo.langsam.p * 2 && r.tempo.schnell.hz > r.tempo.langsam.hz + 300, 'Asphalt-Surren mit dem Tempo lauter und heller',
    `8 m/s: ${r.tempo.langsam.p.toFixed(3)} / ${r.tempo.langsam.hz.toFixed(0)} Hz; 35 m/s: ${r.tempo.schnell.p.toFixed(3)} / ${r.tempo.schnell.hz.toFixed(0)} Hz`);
  const v = r.verlauf, a0 = v[0].a;
  const mitte = v.find((x) => x.t > 40 && x.t < 120);
  const ende = v[v.length - 1];
  let maxSprung = 0;
  for (let i = 1; i < v.length; i++) maxSprung = Math.max(maxSprung, Math.abs(v[i].a - v[i - 1].a) / a0, Math.abs(v[i].k - v[i - 1].k) / Math.max(ende.k, 1e-6));
  pruefe(mitte && mitte.a > a0 * 0.05 && mitte.a < a0 * 0.95 && mitte.k > 0 && ende.a < a0 * 0.02 && ende.k > 0, 'Untergrundwechsel Asphalt -> Schotter: weiche Überblendung (nach ca. 0.15 s fertig)',
    `nach ${mitte ? mitte.t.toFixed(0) : '?'} ms Asphalt ${mitte ? (mitte.a / a0 * 100).toFixed(0) : '?'} %, nach ${ende.t.toFixed(0)} ms ${(ende.a / a0 * 100).toFixed(1)} %; grösster Schritt pro 25 ms ${(maxSprung * 100).toFixed(0)} %`);
  const Q = r.quietschen;
  pruefe(Q.asphalt20.q > 0 && Q.asphalt20.r === 0 && Q.asphalt5.q === 0 && Q.asphalt9.q > 0, 'Quietschen auf Asphalt ab ca. 8° Drift, darunter nicht',
    `20°: ${Q.asphalt20.q.toFixed(3)}, 9°: ${Q.asphalt9.q.toFixed(3)}, 5°: ${Q.asphalt5.q}`);
  pruefe(['schotter20', 'gras20', 'wiesenweg20', 'bankett20'].every((k) => Q[k].q === 0 && Q[k].r > 0) && Q.schotter5.r === 0, 'Schotter, Gras, Wiesenweg, Bankett: kein Quietschen, sondern Rutschen/Kies (auch erst über der Schwelle)',
    `Schotter ${Q.schotter20.r.toFixed(3)}, Gras ${Q.gras20.r.toFixed(3)}, Wiesenweg ${Q.wiesenweg20.r.toFixed(3)}`);
  pruefe(Q.hbAsphalt.q > 0 && Q.hbSchotter.r > 0 && Q.hbStand.q === 0 && Q.langsam.q === 0, 'Handbremse bei Tempo: Quietschen (Asphalt) bzw. Rutschen (Schotter); im Stand und im Schritttempo nicht');
  pruefe(r.ratsch.zwei === 2 && r.ratsch.countdown === 0, 'Handbremse ziehen: Ratschen einmal pro Ziehen (nicht beim Halten, nicht im Countdown)', JSON.stringify(r.ratsch));
  pruefe(spiel.fehler.length === 0, 'keine Fehler in der Konsole', spiel.fehler.join(' | '));
  await spiel.schliessen();
}

// =====================================================================
console.log('(d) Aufprall, Ducking, Statistik mit und ohne Ton');
{
  const spiel = await lade({ entsperren: false });
  const p = spiel.page;
  await A(p, WERK);
  const r = await A(p, async () => {
    const w = window.__W, P = window.__P, s = window.__schritte, warte = window.__warte, AU = P.CONFIG.audio.aufprall;
    const erg = { material: {} };
    for (const m of AU.materialien) {
      w.allesAus(); w.zustand.letzterAufprall = -1e9;
      const vor = w.zaehler[`aufprall-${m}`] || 0;
      w.aufprall(10, P.materialNr(m));
      const st = w.stimmenListe.find((x) => x.an && x.art === 'aufprall');
      erg.material[m] = { n: (w.zaehler[`aufprall-${m}`] || 0) - vor, puffer: !!st && st.quelle.buffer === w.puffer[`aufprall-${m}`] };
    }
    // Lautstärke und Helligkeit nach Wucht
    erg.wucht = [];
    for (const v of [1.2, 2, 5, 9, 14, 25]) {
      w.allesAus(); w.zustand.letzterAufprall = -1e9;
      const ok = w.aufprall(v, P.materialNr('baum')); // (M7a: Stein; der hat seit M7a.1 keinen grossen tiefen Schlag mehr)
      const st = w.stimmenListe.find((x) => x.an && x.art === 'aufprall');
      erg.wucht.push({ v, ok, pegel: st ? st.g.gain.value : 0, hz: st && st.extra ? st.extra.frequency.value : 0, schlag: !!w.stimmenListe.find((x) => x.an && x.art === 'schlag') });
    }
    // Sperrzeit (0.1 s): Kontakte direkt hintereinander rattern nicht
    w.allesAus(); w.zustand.letzterAufprall = -1e9;
    const sp = [w.aufprall(8, 0)];
    s(P.zustand({ modus: 'aus' }), 0.05); sp.push(w.aufprall(8, 0));
    s(P.zustand({ modus: 'aus' }), 0.06); sp.push(w.aufprall(8, 0));
    // über aktualisiere (wie im Spiel): 30 Bilder mit Kontakt -> höchstens alle 0.1 s ein Ton
    w.allesAus(); const a0 = w.zaehler.aufprall || 0;
    for (let k = 0; k < 30; k++) w.aktualisiere(1 / 60, P.zustand({ tempo: 8, aufprall: 6, aufprallArt: 4 }));
    erg.sperre = { sp, rattern: (w.zaehler.aufprall || 0) - a0 };
    // Ducking: hart -> Motor/Reifen und Umgebung um audio.aufprall.duckDb (M7a.1: -7 dB) für 0.3 s, dann zurück; leicht -> nichts
    w.allesAus(); await warte(200); w.zustand.letzterAufprall = -1e9;
    w.aufprall(12, 4);
    await warte(90); const d1 = { fz: w.busse.duck.gain.value, um: w.busse.umgDuck.gain.value };
    await warte(800); const d2 = { fz: w.busse.duck.gain.value, um: w.busse.umgDuck.gain.value };
    w.zustand.letzterAufprall = -1e9; w.aufprall(4, 4); await warte(90); const d3 = w.busse.duck.gain.value;
    erg.duck = { d1, d2, d3, db: AU.duckDb };
    // Schleifen: Kontakt und Tempo > 2 m/s
    const sch = (art, v) => { w.allesAus(); s(P.zustand({ tempo: v, kontaktArt: art, kontaktTempo: v }), 0.2); return w.zustand.schleifen; };
    erg.schleifen = { metall8: sch(4, 8), fels8: sch(5, 8), metall1: sch(4, 1.5), keins: sch(-1, 8) };
    return erg;
  });
  pruefe(Object.values(r.material).every((x) => x.n === 1 && x.puffer), 'jedes Material löst seinen eigenen Klang aus (Baum, Stein, Holz, Weich, Metall, Fels)',
    Object.entries(r.material).map(([m, x]) => `${m} ${x.n}${x.puffer ? '' : ' (falscher Puffer!)'}`).join(', '));
  const W = r.wucht;
  const steigend = W.slice(1).every((x, i) => !W[i].ok || (x.pegel >= W[i].pegel && x.hz >= W[i].hz));
  // (M7a: hart > 3 x leicht; seit M7a.1 sind leichte Kontakte lauter (aufprall.kurve 0.55), darum hart > 2.5 x leicht)
  pruefe(!W[0].ok && W[1].ok && steigend && W[W.length - 1].pegel > W[1].pegel * 2.5 && !W[2].schlag && W[3].schlag, 'Lautstärke und Härte wachsen mit der Wucht (ab 1.5 m/s; ab 6 m/s mit tiefem Schlag)',
    W.map((x) => `${x.v} m/s: ${x.ok ? `${x.pegel.toFixed(2)} / ${x.hz.toFixed(0)} Hz${x.schlag ? ' + Schlag' : ''}` : 'kein Ton'}`).join('; '));
  pruefe(JSON.stringify(r.sperre.sp) === '[true,false,true]' && r.sperre.rattern <= 5 && r.sperre.rattern >= 4, 'eigene Sperrzeit 0.1 s: kein Rattern bei Dauerkontakt',
    `${r.sperre.rattern} Töne in 0.5 s Dauerkontakt`);
  const dz = 10 ** (r.duck.db / 20);
  pruefe(Math.abs(r.duck.d1.fz - dz) < 0.08 && Math.abs(r.duck.d1.um - dz) < 0.08 && r.duck.d2.fz > 0.97 && r.duck.d2.um > 0.97 && r.duck.d3 > 0.97,
    `Ducking: harter Aufprall senkt Motor/Reifen und Umgebung kurz um ${-r.duck.db} dB, dann zurück; leichter nicht`,
    `nach 90 ms ${r.duck.d1.fz.toFixed(2)} / ${r.duck.d1.um.toFixed(2)} (soll ${dz.toFixed(2)}), nach 0.9 s ${r.duck.d2.fz.toFixed(2)}; leicht ${r.duck.d3.toFixed(2)}`);
  pruefe(r.schleifen.metall8 > 0 && r.schleifen.fels8 > 0 && r.schleifen.metall1 === 0 && r.schleifen.keins === 0, 'Schleifen: bei Kontakt über 2 m/s, sonst nicht', JSON.stringify(r.schleifen));
  await spiel.schliessen();

  // Statistik wie in M5b (Baum, unsichtbare Grenze, R-Reset, Höchsttempo) – einmal mit Ton, einmal ohne (?menue=aus).
  // Danach mit Ton: Felswand (Fels-Ton). Gefahren mit A.rennSchritt, der Ton bekommt jedes Bild (2 Schritte) tonBild.
  const szenario = (mitTon) => {
    const A = window.__alpineRally, T = window.__T, S = A.strecke, q = {};
    const tonZ = (art) => (A.ton.werk ? A.ton.werk.zaehler[art] || 0 : 0);
    let k2 = 0;
    const schritt = (e) => { A.rennSchritt(A.SCHRITT, e); if (++k2 % 2 === 0) A.tonBild(1 / 60); };
    A.anhalten = true;
    if (mitTon) A.start(); else A.start();
    T.ueberCountdown();
    const alle = [...A.pflanzen.hindernisse, ...A.strassenrand.hindernisse, ...A.kuehe.hindernisse];
    let baum = null;
    for (const h of A.pflanzen.hindernisse) {
      if (h.sperre || Math.abs(h.r - A.CONFIG.kollision.stammRadius) > 0.01) continue;
      const a = S.abfrage(h.x, h.z, q);
      if (a.s < 150 || a.s > 800 || a.abstand < 8 || a.abstand > 20 || a.wandSeite) continue;
      if (alle.some((o) => o !== h && Math.hypot(o.x - h.x, o.z - h.z) < 9)) continue;
      baum = { x: h.x, z: h.z, s: a.s }; break;
    }
    const p = A.physik;
    const lage = S.punktBei(baum.s);
    const dx = baum.x - lage.x, dz = baum.z - lage.z, l = Math.hypot(dx, dz);
    const sx = baum.x - (dx / l) * 9, sz = baum.z - (dz / l) * 9;
    A.rennen.letztesS = S.abfrage(sx, sz, q).s;
    p.reset(sx, sz, Math.atan2(dx, dz));
    p.vx = (dx / l) * 15; p.vz = (dz / l) * 15; p.vVor = 15;
    const gas = { ...T.LEER, gas: 1 };
    const tonBaum0 = tonZ('aufprall-baum');
    for (let k = 0; k < 120 * 2; k++) schritt(gas);
    const tonBaum = tonZ('aufprall-baum') - tonBaum0;
    const G = A.CONFIG.grenze.maxAbstand;
    let grenze = null;
    for (let s = 150; s < 3500 && !grenze; s += 37) {
      for (const seite of [1, -1]) {
        const lp = S.punktBei(s);
        if (S.abfrage(lp.x, lp.z, q).wandSeite) continue;
        const rx = -lp.tz * seite, rz = lp.tx * seite;
        let frei = true;
        for (let d = 39; d <= G + 3 && frei; d += 0.5) if (!A.kollision.frei(lp.x + rx * d, lp.z + rz * d, 3)) frei = false;
        if (!frei) continue;
        const vor = A.stat.aufpralle, tonVor = tonZ('aufprall');
        p.reset(lp.x + rx * 41, lp.z + rz * 41, Math.atan2(rx, rz));
        A.rennen.letztesS = s;
        p.vx = rx * 20; p.vz = rz * 20; p.vVor = 20;
        let maxAb = 0;
        for (let k = 0; k < 120; k++) { schritt(gas); maxAb = Math.max(maxAb, S.abfrage(p.x, p.z, q).abstand); }
        if (maxAb > G - 0.2 && A.rennen.zustand === 'laeuft') grenze = { s, maxAb, gezaehlt: A.stat.aufpralle - vor, ton: tonZ('aufprall') - tonVor };
      }
    }
    const r0 = A.statResets();
    A.rTaste();
    for (let k = 0; k < 120 * (A.CONFIG.zurueck.wartezeit + 0.5); k++) schritt(T.LEER);
    const resets = A.statResets() - r0;
    A.setzeAuf(1250);
    A.rennen.zwischenzeiten = [30]; A.rennen.naechsterCp = 1;
    for (let k = 0; k < 120 * 6; k++) schritt(gas);
    const stat = { aufpralle: A.stat.aufpralle, resets: A.statResets(), hoechst: A.stat.hoechstTempo, zeit: A.rennen.zeit, x: p.x, z: p.z };
    // Felswand: an einer Stelle mit Wand quer hinein fahren (alle Checkpoints als passiert, sonst setzt "verpasst" zurück)
    A.rennen.naechsterCp = A.checkpoints.length;
    let fels = null;
    for (let i = 0; i < S.anzahl && !fels; i += 7) {
      if (!S.wandSeite[i]) continue;
      const sw = S.s[i], lp = S.punktBei(sw);
      const qq = S.abfrage(lp.x, lp.z, {});
      if (!(qq.wandStaerke > 0.8)) continue;
      const rx = -lp.tz * S.wandSeite[i], rz = lp.tx * S.wandSeite[i];
      const tonVor = tonZ('aufprall-fels'), schlVor = tonZ('aufprall');
      p.reset(lp.x + rx * 1, lp.z + rz * 1, Math.atan2(rx + lp.tx, rz + lp.tz));
      A.rennen.letztesS = sw;
      p.vx = (rx + lp.tx) / Math.SQRT2 * 12; p.vz = (rz + lp.tz) / Math.SQRT2 * 12; p.vVor = 12;
      let kontakt = 0;
      for (let k = 0; k < 120; k++) { schritt(gas); if (A.tonInfo.kontaktArt >= 0 || A.ton.werk && A.ton.werk.zustand.schleifen > 0) kontakt++; }
      fels = { s: sw, ton: tonZ('aufprall-fels') - tonVor, alle: tonZ('aufprall') - schlVor, schleifen: A.ton.werk ? A.ton.werk.zaehler : null };
    }
    A.anhalten = false;
    return { baum: baum.s, tonBaum, grenze, resets, stat, fels: fels ? { s: fels.s, ton: fels.ton, alle: fels.alle } : null };
  };
  const mit = await lade();
  const ohne = await lade({ entsperren: false, adresse: '?menue=aus' });
  const rm = await A(mit.page, szenario, true);
  const ro = await A(ohne.page, szenario, false);
  pruefe(rm.stat.aufpralle === 1 && rm.stat.resets === 1 && rm.stat.hoechst > 20 && ro.stat.aufpralle === 1 && ro.stat.resets === 1, 'Statistik wie in M5b: Baum 1 Aufprall, R 1 Reset, Höchsttempo',
    `mit Ton ${rm.stat.aufpralle} / ${rm.stat.resets} / ${(rm.stat.hoechst * 3.6).toFixed(1)} km/h; ohne Ton ${ro.stat.aufpralle} / ${ro.stat.resets} / ${(ro.stat.hoechst * 3.6).toFixed(1)} km/h`);
  pruefe(JSON.stringify(rm.stat) === JSON.stringify(ro.stat) && rm.baum === ro.baum, 'mit und ohne Ton genau gleich (Aufpralle, Resets, Höchsttempo, Rennzeit, Lage auf den Millimeter)');
  pruefe(rm.tonBaum === 1, `Baumaufprall: Baum-Ton (${rm.tonBaum} Mal)`);
  pruefe(rm.grenze && rm.grenze.gezaehlt === 0 && rm.grenze.ton === 0, 'unsichtbare Grenze (45 m neben der Strasse): kein Aufprallton (zählt auch nicht)', rm.grenze ? `bei ${rm.grenze.s} m, ${rm.grenze.maxAb.toFixed(1)} m neben der Strasse` : 'keine Stelle');
  pruefe(rm.fels && rm.fels.ton >= 1 && rm.fels.ton === rm.fels.alle, 'Felswand: Fels-Ton (dumpfer Schlag)', rm.fels ? `bei ${Math.round(rm.fels.s)} m: ${rm.fels.ton} Fels-Ton(e)` : 'keine Wand gefunden');
  pruefe(mit.fehler.length === 0 && ohne.fehler.length === 0, 'keine Fehler in der Konsole', [...mit.fehler, ...ohne.fehler].join(' | '));
  await mit.schliessen(); await ohne.schliessen();
}

// =====================================================================
console.log('(e) Signale');
{
  const spiel = await lade();
  const p = spiel.page;
  const Z = (art) => A(p, (art) => window.__T.zaehler(art), art);
  // Menü: Hauptmenü -> runter (Tick), EINSTELLUNGEN (Blip), LAUTSTÄRKE rechts (Regler-Tick), Esc (zurück), Fehler (reservierte Taste)
  const m0 = await A(p, () => ({ ...window.__alpineRally.ton.werk.zaehler }));
  await p.keyboard.press('ArrowDown'); await bilderAbwarten(p, 2);
  const tick = await Z('menue-tick');
  await A(p, () => { const m = window.__alpineRally.menue; while (m.wahl !== 4) m.runter(); });
  await warte(80);
  await p.keyboard.press('Enter'); await bilderAbwarten(p, 2);
  const seiteE = await A(p, () => window.__alpineRally.menue.seite.id);
  const lautNr = await A(p, () => window.__alpineRally.menue.seite.eintraege.findIndex((e) => e.text === 'einst.lautstaerke'));
  await A(p, (n) => { const m = window.__alpineRally.menue; while (m.wahl !== n) m.runter(); }, lautNr);
  await warte(80);
  const reglerVor = await Z('menue-regler');
  await p.keyboard.press('ArrowLeft'); await bilderAbwarten(p, 2);
  const reglerWert = await A(p, () => window.__alpineRally.ton.werk.protokoll.filter((x) => x.art === 'menue-regler').pop());
  await p.keyboard.press('ArrowRight'); await bilderAbwarten(p, 2);
  const regler = (await Z('menue-regler')) - reglerVor;
  // Tasten belegen: reservierte Taste -> Fehler-Buzz
  await A(p, () => { const A = window.__alpineRally; A.menue.oeffne(A.seiten.tasten); });
  await warte(80);
  await A(p, () => { const m = window.__alpineRally.menue; m.runter(); });
  await warte(80);
  await p.keyboard.press('Enter'); await bilderAbwarten(p, 2);
  await p.keyboard.press('F3'); await bilderAbwarten(p, 2);
  const fehler = await Z('menue-fehler');
  await warte(80);
  const zurueckVor = await Z('menue-zurueck');
  await p.keyboard.press('Escape'); await bilderAbwarten(p, 2);
  const zurueck = (await Z('menue-zurueck')) - zurueckVor;
  // Doppelton: Maus zeigt auf denselben Eintrag, den die Tastatur im selben Moment wählt -> ein Tick
  await warte(80);
  await A(p, () => { const A = window.__alpineRally; A.menue.zeige(A.seiten.haupt, true); });
  await bilderAbwarten(p, 3); await warte(80);
  const doppel = await A(p, () => {
    const A = window.__alpineRally, m = A.menue, w = A.ton.werk;
    const vor = w.zaehler['menue-tick'] || 0;
    const ziel = m.wahl + 1;
    const h = m.treffer.find((x) => x.nr === ziel);
    m.runter();
    if (h) m.maus(h.x + 5, h.y + 2, 'bewegen');
    const vorB = w.zaehler['menue-zurueck'] || 0;
    return { tick: (w.zaehler['menue-tick'] || 0) - vor, h: !!h, vorB };
  });
  // Maus-Klick und Esc gleichzeitig zurück (zwei Seiten zu): nur ein Zurück-Ton
  const doppelZurueck = await A(p, () => {
    const A = window.__alpineRally, m = A.menue, w = A.ton.werk;
    m.oeffne(A.seiten.steuerung);
    const vor = w.zaehler['menue-zurueck'] || 0;
    m.zurueck(); m.zurueck();
    return (w.zaehler['menue-zurueck'] || 0) - vor;
  });
  pruefe(tick >= 1 && (m0['menue-tick'] || 0) === 0, 'Menü: Auswahl bewegen = Tick');
  pruefe(seiteE === 'einstellungen' && (await Z('menue-bestaetigen')) >= 2, 'Menü: Bestätigen = Blip (Titel und EINSTELLUNGEN)');
  pruefe(regler === 2 && reglerWert && Math.abs(reglerWert.wert - 0.65) < 0.01, 'Menü: Regler LAUTSTÄRKE = Tick mit Tonhöhe je nach Wert', `Wert ${reglerWert ? reglerWert.wert : '?'} bei 65 %`);
  pruefe(fehler === 1, 'Menü: reservierte Taste (F3) = Fehler-Buzz');
  pruefe(zurueck === 1, 'Menü: Zurück = tiefer Blip');
  pruefe(doppel.h && doppel.tick === 1, 'kein Doppelton: Maus und Tastatur wählen im selben Moment denselben Eintrag = ein Tick');
  pruefe(doppelZurueck === 1, 'kein Doppelton: zweimal Zurück im selben Moment = ein Ton');

  // Pause und Weiter (Esc im Rennen, Esc in der Pause): je ein Ton, kein Menü-Blip dazu
  await A(p, () => { const A = window.__alpineRally; A.start({ countdown: false }); });
  await bilderAbwarten(p, 3);
  const pv = await A(p, () => ({ ...window.__alpineRally.ton.werk.zaehler }));
  await p.keyboard.press('Escape'); await bilderAbwarten(p, 3);
  const inPause = await A(p, () => window.__alpineRally.ablauf.zustand);
  await warte(100);
  await p.keyboard.press('Escape'); await bilderAbwarten(p, 3);
  const pn = await A(p, () => ({ z: { ...window.__alpineRally.ton.werk.zaehler }, ab: window.__alpineRally.ablauf.zustand }));
  const d = (k) => (pn.z[k] || 0) - (pv[k] || 0);
  pruefe(inPause === 'pause' && pn.ab === 'rennen' && d('pause') === 1 && d('weiter') === 1 && d('menue-zurueck') === 0, 'Pause: kurzer tiefer Ton, Weiter: kurzer hoher Ton (kein Blip dazu)',
    `Pause ${d('pause')}, Weiter ${d('weiter')}, Zurück-Blip ${d('menue-zurueck')}`);

  // Countdown: Pieps genau bei den Zahlen, GO-Ton genau mit GO (Schritt für Schritt)
  const cd = await A(p, async () => {
    const A = window.__alpineRally, w = A.ton.werk, { countdownNummer } = await import('/js/rennablauf.js');
    A.anhalten = true;
    A.start();
    const liste = [];
    let nrVor = -2, cdVor = w.zaehler.countdown || 0, goVor = w.zaehler.go || 0, schritt = 0;
    while (schritt < 120 * 5 && (A.ablauf.zustand === 'countdown' || schritt < 3)) {
      A.rennSchritt(A.SCHRITT, window.__T.LEER); schritt++;
      const nr = countdownNummer(A.lauf.countdown, A.lauf.go);
      const c = w.zaehler.countdown || 0, g = w.zaehler.go || 0;
      if (nr !== nrVor || c !== cdVor || g !== goVor) liste.push({ schritt, nr, piep: c - cdVor, go: g - goVor });
      nrVor = nr; cdVor = c; goVor = g;
    }
    A.anhalten = false;
    return liste;
  });
  const passt = cd.every((x) => (x.nr >= 1 ? x.piep === 1 && x.go === 0 : x.nr === 0 ? x.go === 1 && x.piep === 0 : false));
  pruefe(passt && cd.length === 4 && cd.filter((x) => x.piep).length === 3, 'Countdown: drei Pieps genau beim Erscheinen von 3, 2, 1 und ein GO-Ton genau mit GO (auf den Schritt genau)',
    cd.map((x) => `${x.nr === 0 ? 'GO' : x.nr} bei Schritt ${x.schritt}: ${x.piep ? 'Piep' : ''}${x.go ? 'GO-Ton' : ''}`).join(', '));

  // Pause im Countdown (echte Spielschleife): Pieps stoppt, nichts wird nachgeholt, nichts doppelt
  await A(p, () => { window.__alpineRally.start(); });
  await p.waitForFunction(() => window.__alpineRally.lauf.countdown > 1.03, null, { timeout: 60000 });
  const vorP = await A(p, () => { const A = window.__alpineRally; A.pausieren(); return { c: A.ton.werk.zaehler.countdown, cd: A.lauf.countdown }; });
  await warte(250);
  const inP = await A(p, () => { const A = window.__alpineRally, w = A.ton.werk; return { c: w.zaehler.countdown, cd: A.lauf.countdown, an: w.stimmenListe.some((s) => s.an && s.art === 'countdown') }; });
  await warte(1300);
  const inP2 = await A(p, () => ({ c: window.__alpineRally.ton.werk.zaehler.countdown, cd: window.__alpineRally.lauf.countdown }));
  await A(p, () => window.__alpineRally.weiter());
  await p.waitForFunction(() => window.__alpineRally.ablauf.zustand === 'rennen', null, { timeout: 60000 });
  const nachP = await A(p, () => ({ c: window.__alpineRally.ton.werk.zaehler.countdown, go: window.__alpineRally.ton.werk.zaehler.go }));
  pruefe(!inP.an && inP.c === vorP.c && inP2.c === vorP.c && inP2.cd === vorP.cd && nachP.c - vorP.c === 1,
    'Pause im Countdown: Pieps hört auf, in der Pause kein Ton, danach geht es nahtlos weiter (nur die fehlende Zahl piept)',
    `vor der Pause ${vorP.c} Pieps bei ${vorP.cd.toFixed(2)} s, in der Pause ${inP2.c}, danach ${nachP.c}, GO ${nachP.go}`);

  // Checkpoint-Töne: dieselbe Entscheidung wie Meldung und Punkt (keine Referenz, schneller, langsamer, gleich)
  const cpLauf = (art) => A(p, async (art) => {
    const A = window.__alpineRally, w = A.ton.werk, f = await import(window.__fahrerUrl);
    A.anhalten = true;
    A.start({ countdown: false });
    const cp = A.checkpoints[0];
    // Messfahrt ohne Referenz, dann gleiche Fahrt gegen eine passende Referenz (Testfahrer ab dem Start, immer gleich)
    const fahre = () => {
      A.start({ countdown: false });
      if (ref !== null && tCp != null) A.vergleich.setzeReferenz({ zeit: 200, cps: [Math.round((tCp + ref) * 100) / 100, null, null], spur: null }, 'best');
      f.fahreBis(A, 'flott', { bisS: cp.s + 3 });
      return A.rennen.zwischenzeiten[0];
    };
    let tCp = null;
    const ref = { keine: null, schneller: 1, langsamer: -1, gleich: 0 }[art];
    localStorage.removeItem('alpineRally.bestzeiten'); localStorage.removeItem('alpineRally.letzterLauf');
    tCp = fahre();
    const vor = { ...w.zaehler };
    const t2 = fahre();
    const nach = w.zaehler;
    const ton = ['cp-schneller', 'cp-langsamer', 'cp-neutral'].find((k) => (nach[k] || 0) > (vor[k] || 0));
    const eintrag = w.protokoll.filter((x) => x.art === ton).pop();
    A.anhalten = false;
    return { art, t: tCp, t2, ton, richtung: eintrag ? eintrag.wert : null, farbe: A.rennen.meldung.farbe, punkt: A.rennen.cpVergleich[0] };
  }, art);
  const V = await A(p, () => window.__alpineRally.CONFIG.hud.vergleich);
  for (const [art, ton, farbe, punkt, richtung] of [['keine', 'cp-neutral', 'gelb', 0, 0], ['schneller', 'cp-schneller', V.farbeSchneller, -1, 1], ['langsamer', 'cp-langsamer', V.farbeLangsamer, 1, -1], ['gleich', 'cp-neutral', 'gelb', 0, 0]]) {
    const c = await cpLauf(art);
    pruefe(c.ton === ton && c.farbe === farbe && c.punkt === punkt && Math.sign(c.richtung) === richtung && c.t === c.t2,
      `Checkpoint ${art === 'keine' ? 'ohne Referenz' : art}: Ton ${ton.slice(3)} (${richtung > 0 ? 'aufsteigend' : richtung < 0 ? 'absteigend' : 'gleich hoch'}), Meldung und Punkt passen`,
      `Zwischenzeit ${c.t}, Ton ${c.ton}, Meldung ${c.farbe}, Punkt ${c.punkt}`);
  }
  const verp = await A(p, () => {
    const A = window.__alpineRally, w = A.ton.werk;
    A.anhalten = true; A.start({ countdown: false }); A.rennen.zustand = 'laeuft';
    const vor = w.zaehler['cp-verpasst'] || 0;
    A.setzeAuf(A.checkpoints[0].s + 10); A.rennSchritt(A.SCHRITT, window.__T.LEER);
    A.anhalten = false;
    return { n: (w.zaehler['cp-verpasst'] || 0) - vor, m: A.rennen.meldung && A.rennen.meldung.text };
  });
  pruefe(verp.n === 1 && /VERPASST/.test(verp.m), 'CHECKPOINT VERPASST: tiefer Buzz');

  // Fanfaren: Platz 2 = nur die kurze (an der Ziellinie); neue Bestzeit = kurze an der Ziellinie, lange zum Zielbildschirm
  const insZiel = (zeit) => A(p, (zeit) => {
    const A = window.__alpineRally, w = A.ton.werk, T = window.__T;
    const vor = { k: w.zaehler['fanfare-kurz'] || 0, l: w.zaehler['fanfare-lang'] || 0 };
    A.anhalten = true;
    A.start(); T.ueberCountdown();
    A.setzeAuf(A.strecke.zielS - 30);
    const ph = A.physik; ph.vx = Math.sin(ph.richtung) * 20; ph.vz = Math.cos(ph.richtung) * 20; ph.vVor = 20;
    A.rennen.zustand = 'laeuft'; A.rennen.zwischenzeiten = [30, 60, 90]; A.rennen.naechsterCp = A.checkpoints.length;
    for (let n = 0; n < 2000 && A.rennen.zustand !== 'ziel'; n++) A.physikSchritt(A.SCHRITT, { ...T.LEER, gas: 0.5 });
    A.rennen.endZeit = zeit; A.rennen.zeit = zeit;
    A.rennSchritt(A.SCHRITT, T.LEER);
    const ander = { k: (w.zaehler['fanfare-kurz'] || 0) - vor.k, l: (w.zaehler['fanfare-lang'] || 0) - vor.l };
    let n = 0; while (A.ablauf.zustand !== 'ziel' && n < 5000) { A.rennSchritt(A.SCHRITT, T.LEER); n++; }
    const schirm = { k: (w.zaehler['fanfare-kurz'] || 0) - vor.k, l: (w.zaehler['fanfare-lang'] || 0) - vor.l };
    A.anhalten = false;
    return { linie: ander, schirm, platz: A.lauf.ergebnis.platz, neu: A.lauf.ergebnis.neueBest };
  }, zeit);
  await A(p, () => localStorage.removeItem('alpineRally.bestzeiten'));
  const f1 = await insZiel(150);
  const f2 = await insZiel(160);
  const f3 = await insZiel(140);
  pruefe(f1.linie.k === 1 && f1.schirm.l === 0, 'erste Zeit (Platz 1 ohne Vergleich): kurze Fanfare an der Ziellinie', JSON.stringify(f1));
  pruefe(f2.platz === 2 && f2.linie.k === 1 && f2.schirm.k === 1 && f2.schirm.l === 0, 'Platz 2: nur die kurze Fanfare', JSON.stringify(f2));
  pruefe(f3.neu && f3.linie.k === 1 && f3.linie.l === 0 && f3.schirm.l === 1, 'NEUE BESTZEIT: kurze an der Ziellinie, lange (festliche) zum Zielbildschirm', JSON.stringify(f3));

  // Pace-Notes-Signal: einmal pro neuer Kachel (gefahren mit dem Testfahrer, Ansagen an / aus), auch im Countdown
  const pnLauf = (an) => A(p, async (an) => {
    const A = window.__alpineRally, w = A.ton.werk, T = window.__T, PN = A.paceNotes;
    if (PN.anzeige.an !== an) PN.umschalten();
    const f = await import(window.__fahrerUrl);
    A.anhalten = true;
    A.start();
    const e0 = PN.anzeige.erschienen, s0 = w.zaehler.paceNote || 0;
    let k = 0, imCountdown = 0;
    const bild = () => { PN.aktualisiere(1 / 60, A.rennen.letztesS, A.physik.tempo, A.rennen.zustand); A.paceSignal(PN.anzeige, true); };
    while (A.ablauf.zustand === 'countdown') { A.rennSchritt(A.SCHRITT, T.LEER); if (++k % 2 === 0) bild(); }
    imCountdown = PN.anzeige.erschienen - e0;
    const sigCountdown = (w.zaehler.paceNote || 0) - s0;
    f.fahreBis(A, 'flott', { bisS: 1800, proSchritt: () => { if (++k % 2 === 0) bild(); } });
    A.anhalten = false;
    if (!PN.anzeige.an) PN.umschalten();
    return { kacheln: PN.anzeige.erschienen - e0, signale: (w.zaehler.paceNote || 0) - s0, imCountdown, sigCountdown };
  }, an);
  const pa = await pnLauf(true), pb = await pnLauf(false);
  pruefe(pa.kacheln > 10 && pa.signale === pa.kacheln && pa.sigCountdown === pa.imCountdown, 'Pace-Notes-Signal: genau eins pro neuer Kachel (im Countdown gleich viele Signale wie Kacheln, nichts doppelt)',
    `${pa.kacheln} Kacheln bis 1800 m, ${pa.signale} Signale; im Countdown ${pa.imCountdown} / ${pa.sigCountdown}`);
  pruefe(pb.kacheln === 0 && pb.signale === 0, 'Ansagen aus (Taste N): kein Signal');
  const demo = await A(p, async () => {
    const A = window.__alpineRally, w = A.ton.werk;
    A.zumHauptmenue();
    const vor = w.zaehler.paceNote || 0;
    await new Promise((r) => setTimeout(r, 2500));
    return { n: (w.zaehler.paceNote || 0) - vor, ab: A.ablauf.zustand };
  });
  pruefe(demo.n === 0 && demo.ab === 'menue', 'Demo-Fahrt im Menü: kein Pace-Notes-Signal');
  pruefe(spiel.fehler.length === 0, 'keine Fehler in der Konsole', spiel.fehler.join(' | '));
  await spiel.schliessen();
}

// =====================================================================
console.log('(f) Mix und Zustände: Pause, Menü, Neustart, Hauptmenü, Tab versteckt');
{
  const spiel = await lade();
  const p = spiel.page;
  // Rennen: Vollgas über die echte Spielschleife
  await A(p, () => { const A = window.__alpineRally; A.start({ countdown: false }); A.testEingabe = { gas: 1, handbremse: false }; });
  await p.waitForFunction(() => window.__alpineRally.physik.tempo > 14, null, { timeout: 60000 });
  const lauf = await A(p, () => { const k = window.__alpineRally.ton.werk.knoten, b = window.__alpineRally.ton.werk.busse; return { motor: k.motorAus.gain.value, uf: b.umgFilter.frequency.value, wind: k.windGain.gain.value, surr: k.surrenGain.gain.value }; });
  await A(p, () => window.__alpineRally.pausieren());
  await bilderAbwarten(p, 3); await warte(450);
  const pause = await A(p, () => { const w = window.__alpineRally.ton.werk, k = w.knoten, b = w.busse; return { motor: k.motorAus.gain.value, uf: b.umgFilter.frequency.value, up: b.umgPause.gain.value, rf: b.reifenFilter.frequency.value, rp: b.reifenPause.gain.value, wind: k.windGain.gain.value }; });
  await A(p, () => window.__alpineRally.weiter());
  await bilderAbwarten(p, 3); await warte(450);
  const weiter = await A(p, () => { const w = window.__alpineRally.ton.werk, k = w.knoten, b = w.busse; return { motor: k.motorAus.gain.value, uf: b.umgFilter.frequency.value, up: b.umgPause.gain.value }; });
  const P = (await A(p, () => window.__alpineRally.CONFIG.audio.pause));
  pruefe(lauf.motor > 0.95 && lauf.surr > 0 && lauf.wind > 0 && pause.motor < 0.02 && Math.abs(pause.uf - P.filter) < 30 && Math.abs(pause.up - P.pegel) < 0.03 && Math.abs(pause.rf - P.filter) < 30 && pause.wind > 0,
    'Pause: Motor stumm, Reifen und Wind dumpf (Tiefpass) und leiser', `Motor ${lauf.motor.toFixed(2)} -> ${pause.motor.toFixed(3)}, Umgebung ${pause.uf.toFixed(0)} Hz / ${pause.up.toFixed(2)}, Reifen ${pause.rf.toFixed(0)} Hz / ${pause.rp.toFixed(2)}`);
  pruefe(weiter.motor > 0.95 && weiter.uf > 15000 && weiter.up > 0.97, 'Weiter: alles weich zurück', `Motor ${weiter.motor.toFixed(2)}, Umgebung ${weiter.uf.toFixed(0)} Hz`);
  // Neustart (aus dem Rennen mit Drift, Turbo): danach keine hängenden Töne
  await A(p, () => { window.__alpineRally.testEingabe = { gas: 1, handbremse: true, lenkung: 1 }; });
  await warte(700);
  const vorNeu = await A(p, () => { const z = window.__alpineRally.ton.werk.zustand; return { turbo: z.turbo, q: z.quietschen + z.rutschen, wind: z.wind }; });
  const neu = await A(p, async () => {
    const A = window.__alpineRally, w = A.ton.werk;
    A.testEingabe = null;
    const quellen = w.quellen.length;
    w.aufprall(12, 4); w.fanfare(true);
    A.anhalten = true;
    A.neuStarten();
    await new Promise((r) => setTimeout(r, 400));
    const k = w.knoten;
    const erg = { stimmen: w.stimmen, turbo: k.turboGain.gain.value, q: k.quietschGain.gain.value + k.rutschGain.gain.value, wind: k.windGain.gain.value, reifen: k.surrenGain.gain.value + k.weichGain.gain.value + k.kiesGain.gain.value,
      schleifen: k.schleifenGain.gain.value, motor: k.motorAus.gain.value, ab: A.ablauf.zustand, quellen, quellenNach: w.quellen.length, gleich: A.ton.werk === w };
    A.anhalten = false;
    return erg;
  });
  pruefe(vorNeu.turbo > 0 && vorNeu.wind > 0 && neu.stimmen === 0 && neu.turbo < 1e-3 && neu.q < 1e-3 && neu.wind < 1e-3 && neu.reifen < 1e-3 && neu.schleifen < 1e-3 && (neu.ab === 'countdown' || neu.ab === 'rennen'),
    'Neustart: alle Schichten weich auf 0, keine Stimme hängt (auch nicht Aufprall und Fanfare)', `vorher Turbo ${vorNeu.turbo.toFixed(3)}, Rutschen ${vorNeu.q.toFixed(3)}; nachher ${JSON.stringify(neu)}`);
  pruefe(neu.motor > 0.9 && neu.gleich && neu.quellen === neu.quellenNach, 'Neustart: Countdown mit genau einem Motor im Leerlauf (kein doppelter Motor, keine neuen Dauerquellen)', `${neu.quellenNach} Rauschquellen`);
  const menu = await A(p, async () => {
    const A = window.__alpineRally, w = A.ton.werk;
    A.zumHauptmenue();
    await new Promise((r) => setTimeout(r, 1200));
    const k = w.knoten;
    return { ab: A.ablauf.zustand, modus: w.zustand.modus, motor: k.motorAus.gain.value, last: k.motorLast.gain.value, wind: k.windGain.gain.value, reifen: k.surrenGain.gain.value + k.weichGain.gain.value + k.kiesGain.gain.value, stimmen: w.stimmen, v: A.physik.tempo };
  });
  pruefe(menu.ab === 'menue' && menu.modus === 'aus' && menu.motor < 1e-3 && menu.wind < 1e-3 && menu.reifen < 1e-3 && menu.stimmen === 0 && menu.v > 0.5,
    'Hauptmenü mit Demo-Fahrt: kein Motor, kein Wind, keine Reifen (die Demo fährt stumm)', `Demo ${(menu.v * 3.6).toFixed(0)} km/h, Motor ${menu.motor.toFixed(4)}`);
  // Tab versteckt -> suspended, zurück -> running
  const tab = await A(p, async () => {
    const A = window.__alpineRally, t = A.ton;
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
    document.dispatchEvent(new Event('visibilitychange'));
    await new Promise((r) => setTimeout(r, 300));
    const weg = t.ctx.state;
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
    document.dispatchEvent(new Event('visibilitychange'));
    await new Promise((r) => setTimeout(r, 300));
    return { weg, zurueck: t.ctx.state };
  });
  pruefe(tab.weg === 'suspended' && tab.zurueck === 'running', 'Tab versteckt: Ton angehalten (suspended), zurück: läuft wieder', JSON.stringify(tab));
  // Countdown im Spiel: Gas gedrückt -> Motor bleibt im Leerlauf
  const cdGas = await A(p, async () => {
    const A = window.__alpineRally, w = A.ton.werk;
    A.start();
    A.testEingabe = { gas: 1 };
    await new Promise((r) => setTimeout(r, 600));
    const erg = { ab: A.ablauf.zustand, gas: A.tonZ.gas, filter: w.zustand.filter, druck: w.zustand.druck, soll: A.CONFIG.audio.motor.filterGrund + A.CONFIG.audio.motor.filterDrehzahl * A.CONFIG.getriebe.leerlauf };
    A.testEingabe = null;
    return erg;
  });
  pruefe(cdGas.ab === 'countdown' && cdGas.gas === 0 && Math.abs(cdGas.filter - cdGas.soll) < 1 && cdGas.druck === 0, 'Countdown im Spiel: Gas gedrückt, Motor bleibt im Leerlauf', JSON.stringify(cdGas));
  pruefe(spiel.fehler.length === 0, 'keine Fehler in der Konsole', spiel.fehler.join(' | '));
  await spiel.schliessen();
}

// =====================================================================
console.log('(g) Regler LAUTSTÄRKE');
{
  const spiel = await lade();
  const p = spiel.page;
  const r = await A(p, async () => {
    const A = window.__alpineRally, w = A.ton.werk, E = await import('/js/einstellungen.js');
    const warte = (ms) => new Promise((r) => setTimeout(r, ms));
    const erg = {};
    for (const v of [0, 30, 50, 100, 70]) { E.setze('lautstaerke', v); await warte(250); erg[v] = w.busse.master.gain.value; }
    // Rampe: 100 -> 0, alle 4 ms messen
    E.setze('lautstaerke', 100); await warte(250);
    E.setze('lautstaerke', 0);
    const verlauf = [];
    const t0 = performance.now();
    while (performance.now() - t0 < 80) { verlauf.push(w.busse.master.gain.value); await warte(4); }
    E.setze('lautstaerke', 70);
    return { erg, verlauf };
  });
  const e = r.erg;
  pruefe(e[0] < 1e-3 && Math.abs(e[100] - 1) < 0.01 && Math.abs(e[50] - 0.25) < 0.01 && Math.abs(e[30] - 0.09) < 0.01 && Math.abs(e[70] - 0.49) < 0.01,
    'LAUTSTÄRKE wirkt quadratisch auf den Master: 0 % = stumm, 30 % = 0.09, 50 % = 0.25, 100 % = 1', JSON.stringify(Object.fromEntries(Object.entries(e).map(([k, v]) => [k, r2(v)]))));
  const zwischen = r.verlauf.filter((x) => x > 0.05 && x < 0.95).length;
  pruefe(r.verlauf[0] > 0.5 && zwischen >= 2, 'Änderung ohne Knacken: der Wert gleitet (keine Sprünge)', `${r.verlauf.slice(0, 8).map((x) => x.toFixed(2)).join(' ')} …`);
  await spiel.schliessen();
}

// =====================================================================
console.log('(h) Stimmen-Limit, keine Lecks');
{
  const spiel = await lade();
  const p = spiel.page;
  await A(p, WERK);
  const r = await A(p, async () => {
    const w = window.__W, P = window.__P, s = window.__schritte;
    let max = 0;
    for (let k = 0; k < 200; k++) {
      s(P.zustand({ modus: 'aus' }), 0.11);
      w.aufprall(5 + (k % 15), k % 6);
      if (k % 4 === 0) { w.menue('tick'); w.paceNote(2); w.checkpoint(-1); }
      max = Math.max(max, w.stimmen);
    }
    const knotenSpitze = w.zaehl.knotenAktiv;
    await new Promise((r) => setTimeout(r, 2500));
    return { max, knotenSpitze, nach: w.stimmen, knotenNach: w.zaehl.knotenAktiv, erzeugt: w.zaehl.knotenErzeugt };
  });
  pruefe(r.max <= 16 && r.max >= 14, 'Dauerbeschuss (200 Aufpralle plus Signale): nie mehr als maxStimmen (16) gleichzeitig', `höchstens ${r.max}`);
  pruefe(r.nach === 0 && r.knotenNach === 0, 'danach alle Stimmen frei, alle Knoten wieder abgebaut', `${r.erzeugt} Knoten erzeugt, ${r.knotenSpitze} gleichzeitig, danach ${r.knotenNach}`);
  // eine Minute Fahrt im Spiel (Testfahrer, mit Ton): Knoten bleiben beschränkt
  const fahrt = await A(p, async () => {
    const A = window.__alpineRally, w = A.ton.werk, T = window.__T;
    const f = await import(window.__fahrerUrl);
    A.anhalten = true; A.start({ countdown: false });
    let k = 0, maxStimmen = 0, maxKnoten = 0;
    const e0 = w.zaehl.knotenErzeugt;
    const t0 = performance.now();
    f.fahreBis(A, 'flott', { maxSchritte: 120 * 60, proSchritt: () => { if (++k % 2 === 0) { A.tonBild(1 / 60); maxStimmen = Math.max(maxStimmen, w.stimmen); maxKnoten = Math.max(maxKnoten, w.zaehl.knotenAktiv); } } });
    const ms = performance.now() - t0;
    A.anhalten = false;
    await new Promise((r) => setTimeout(r, 2500));
    return { s: A.rennen.letztesS, maxStimmen, maxKnoten, nach: w.zaehl.knotenAktiv, erzeugt: w.zaehl.knotenErzeugt - e0, ms, ereignisse: { ...w.zaehler } };
  });
  pruefe(fahrt.maxStimmen <= 16 && fahrt.nach === 0, 'eine Minute Fahrt: Stimmen und Knoten bleiben beschränkt, danach abgebaut (keine Lecks)',
    `bis ${Math.round(fahrt.s)} m; höchstens ${fahrt.maxStimmen} Stimmen, ${fahrt.erzeugt} Knoten erzeugt, danach ${fahrt.nach} übrig`);
  await spiel.schliessen();
}

// =====================================================================
console.log('(i) Offline gerechnet: Pegel, NaN, Gleichspannung, Anfang, Ausklingen, Spektrogramme');
{
  const spiel = await lade({ entsperren: false });
  const p = spiel.page;
  const r = await A(p, async () => {
    const P = await import('/tools/ton-pruefung.js'), C = P.CONFIG.audio, { motorTon } = await import('/js/audio.js');
    const erg = { motor: [], einmal: [], bilder: {} };
    for (const rpm of [1000, 3000, 6000]) {
      const x = await P.rendere((w) => w.aktualisiere(0.016, P.zustand({ drehzahl: rpm, gas: 0.6 })), 2);
      const soll = motorTon(rpm); // (M7a.1: Kurve statt Drehzahl / 60 x 2.5)
      erg.motor.push({ rpm, m: P.miss(x.daten, 0.5), f: P.staerksteFrequenz(x.daten, 0.5, 1.5, soll * 0.94, soll * 1.06, 0.25), soll });
      erg.bilder[`10-spektrogramm-motor-${rpm}`] = P.spektrogramm(x.daten, `Motor ${rpm}/min, 60 % Gas (Grundton ${soll.toFixed(0)} Hz)`);
    }
    // einmalige Klänge: Puffer direkt und durch die Schienen gerechnet
    const an = (w) => { w.aktualisiere(0.016, P.zustand({ modus: 'rennen', drehzahl: 1000 })); w.knoten.motorLast.gain.value = 0; };
    const ereignisse = {
      pop: [(w) => { an(w); w.knall(0.4, 1); }, M => M.pop.laenge],
      klack: [(w) => { an(w); w.zustand.schaltetVor = true; w.zustand.schaltLast = 0; w.aktualisiere(0.016, P.zustand({ modus: 'rennen', drehzahl: 1000 })); }, M => M.klack.laenge],
      blowOff: [(w) => { an(w); w.zustand.druck = 1; w.blowOff(); }, () => C.motor.blowOffDauer + 0.05],
      ratsch: [(w) => { w.aktualisiere(0.016, P.zustand({ tempo: 10, handbremse: true })); }, () => C.reifen.ratschDauer + 0.04],
      schlag: [(w) => { w.aufprall(20, 0); }, () => C.aufprall.schlag.laenge],
      ...Object.fromEntries(C.aufprall.materialien.map((m) => [`aufprall-${m}`, [(w) => { w.aufprall(14, P.materialNr(m)); }, () => C.aufprall.klang[m].laenge]])),
      fanfareKurz: [(w) => w.fanfare(false), null],
      fanfareLang: [(w) => w.fanfare(true), null],
    };
    for (const [name, [aufbau, laenge]] of Object.entries(ereignisse)) {
      const x = await P.rendere(aufbau, name.startsWith('fanfare') ? 4.5 : 1.8);
      const pm = P.pufferMessen(x.werk.puffer[name]);
      erg.einmal.push({ name, m: P.miss(x.daten), puffer: pm, soll: laenge ? laenge(C.motor) : null });
      if (name === 'blowOff') erg.bilder['11-spektrogramm-blowoff'] = P.spektrogramm(x.daten.subarray(0, P.RATE * 0.8), 'Blow-off (Zischen beim Gaswegnehmen)');
      if (name === 'aufprall-baum') erg.bilder['12-spektrogramm-aufprall-baum'] = P.spektrogramm(x.daten.subarray(0, P.RATE * 1.2), 'Aufprall Baum, 14 m/s (mit tiefem Schlag)');
      if (name === 'aufprall-metall') erg.bilder['13-spektrogramm-aufprall-metall'] = P.spektrogramm(x.daten.subarray(0, P.RATE * 1.5), 'Aufprall Leitplanke (Metall), 14 m/s');
      if (name === 'fanfareLang') erg.bilder['14-spektrogramm-fanfare-lang'] = P.spektrogramm(x.daten, 'Ziel-Fanfare lang (neue Bestzeit)');
      if (name === 'fanfareKurz') erg.bilder['15-spektrogramm-fanfare-kurz'] = P.spektrogramm(x.daten.subarray(0, P.RATE * 3), 'Ziel-Fanfare kurz');
    }
    // alles zugleich: Vollgas am Begrenzer, Drift, Schleifen an der Leitplanke, harter Aufprall, Fanfare, Signale, Knall, Blow-off
    const alles = await P.rendere((w) => {
      w.busse.master.gain.value = 1;
      for (let k = 0; k < 30; k++) w.aktualisiere(1 / 60, P.zustand({ drehzahl: 6950, gas: 1, tempo: 45, drift: 30, handbremse: true, untergrund: 'asphalt', kontaktArt: 4, kontaktTempo: 30 }));
      w.zustand.letzterAufprall = -1e9; w.aufprall(30, 4); w.zustand.letzterAufprall = -1e9; w.aufprall(30, 5);
      w.fanfare(true); w.fanfare(false); w.go(); w.checkpoint(-1); w.paceNote(2); w.verpasst(); w.knall(0.05, 1); w.zustand.druck = 1; w.blowOff();
      for (const m of ['tick', 'bestaetigen', 'fehler']) w.menue(m);
    }, 3);
    erg.alles = P.miss(alles.daten);
    erg.bilder['16-spektrogramm-alles-zugleich'] = P.spektrogramm(alles.daten, 'Alles zugleich (Vollgas, Drift, Schleifen, 2 harte Aufpralle, Fanfaren, Signale)');
    return erg;
  });
  const C = await A(p, () => window.__alpineRally.CONFIG.audio);
  const [rMin, rMax] = C.pruefung.rmsMotor;
  for (const m of r.motor) {
    pruefe(m.m.nan === 0 && m.m.spitze < 0.98 && Math.abs(m.m.mittel) < 0.005 && m.m.rms >= rMin && m.m.rms <= rMax && Math.abs(m.f / m.soll - 1) <= 0.02,
      `Motor ${m.rpm}/min: kein NaN, Spitze unter 0.98, keine Gleichspannung, Lautstärke im Bereich, Grundton im Spektrum ±2 %`,
      `Spitze ${m.m.spitze.toFixed(2)}, RMS ${m.m.rms.toFixed(3)}, Mittel ${m.m.mittel.toFixed(4)}, Grundton ${m.f.toFixed(1)} Hz (soll ${m.soll.toFixed(1)})`);
  }
  const [kMin, kMax] = C.pruefung.rmsKlang;
  for (const e of r.einmal) {
    const pm = e.puffer;
    const lOk = e.soll == null ? (pm.laenge > 1.5 && pm.laenge < 4.5) : Math.abs(pm.laenge - e.soll) < 0.002 && pm.ausklingen <= e.soll + 1e-3;
    const rms = e.m.rms; // ganzer Ausschnitt (mit Stille danach)
    pruefe(e.m.nan === 0 && pm.nan === 0 && e.m.spitze < 0.98 && e.m.spitze > 0.01 && pm.erstes < 0.01 && pm.anfang < 0.25 && pm.ende < 1e-3 && Math.abs(pm.mittel) < 0.01 && lOk && rms >= kMin * 0.2 && rms <= kMax,
      `${e.name}: sauberer Anfang (kein Knacken), klingt bis zum Ende auf 0 aus, kein NaN, Spitze < 0.98`,
      `Länge ${pm.laenge.toFixed(2)} s${e.soll != null ? ` (soll ${e.soll.toFixed(2)})` : ''}, hörbar bis ${pm.ausklingen.toFixed(2)} s, erstes Sample ${(pm.erstes * 100).toFixed(1)} %, erste 0.5 ms höchstens ${(pm.anfang * 100).toFixed(0)} % der Spitze, Spitze gerechnet ${e.m.spitze.toFixed(2)}, RMS ${rms.toFixed(3)}`);
  }
  pruefe(r.alles.nan === 0 && r.alles.spitze < 0.98, 'alles zugleich (Vollgas, Begrenzer, Drift, Schleifen, 2 harte Aufpralle, Fanfaren, Signale): der Limiter hält, nichts übersteuert',
    `Spitze ${r.alles.spitze.toFixed(3)}, RMS ${r.alles.rms.toFixed(3)}`);
  console.log(`  ZAHL Spitzenpegel alles zugleich: ${r.alles.spitze.toFixed(3)}`);
  for (const [name, url] of Object.entries(r.bilder)) fs.writeFileSync(path.join(BILDER, `${name}.png`), Buffer.from(url.split(',')[1], 'base64'));
  console.log(`  (Spektrogramme: ${Object.keys(r.bilder).length} Bilder in screenshots/m7a-1/)`);
  await spiel.schliessen();
}

// =====================================================================
console.log('(j) HUD: kleinere Minimap, farbige Checkpoint-Punkte');
{
  const spiel = await lade({ entsperren: false, adresse: '?menue=aus' });
  const p = spiel.page;
  await A(p, () => { window.__alpineRally.anhalten = true; });
  const mm = await A(p, () => {
    const A = window.__alpineRally, m = A.hud.minimap, c = A.CONFIG.hud.minimap;
    return { b: m.breite, h: m.hoehe, x: m.x, y: m.y, mx: m.mitteX, my: m.mitteY, mass: m.mass, sicht: c.sichtMeter, rechts: c.rechts, oben: c.oben };
  });
  const altMass = (Math.floor((61 - 3) / 2) + 0.5) / 120;
  pruefe(Math.abs(mm.b - 48) <= 1 && Math.abs(mm.h - 48) <= 1 && mm.x + mm.b === 320 - mm.rechts && mm.y === mm.oben && mm.mx - mm.x === (mm.b - 1) / 2 && mm.my - mm.y === (mm.h - 1) / 2,
    `Minimap ${mm.b} x ${mm.h} Pixel (vorher 61 x 61), oben rechts, Auto genau in der Mitte`, `x ${mm.x}, y ${mm.y}, Mitte ${mm.mx} / ${mm.my}`);
  pruefe(Math.abs(mm.mass / altMass - 1) < 0.002, `gleicher Detailgrad: ${(mm.mass * 1000).toFixed(1)} Pixel pro km (vorher ${(altMass * 1000).toFixed(1)}), Zoom ${mm.sicht} m statt 120 m`);
  // Kehren als Zickzack: in der Minimap (HUD-Pixel) Zeilen mit mehreren Strassenstücken zählen, an den Kehren
  const zick = await A(p, async () => {
    const A = window.__alpineRally, m = A.hud.minimap, c = A.CONFIG.hud.minimap;
    const zaehle = () => {
      const d = document.getElementById('hud').getContext('2d').getImageData(m.x + 1, m.y + 1, m.innen, m.innen).data;
      const hex = (f) => [parseInt(f.slice(1, 3), 16), parseInt(f.slice(3, 5), 16), parseInt(f.slice(5, 7), 16)];
      const farben = [hex(c.farbeOffen), hex(c.farbeGefahren)];
      let maxStuecke = 0, zeilen3 = 0;
      for (let y = 0; y < m.innen; y++) {
        let stuecke = 0, drin = false;
        for (let x = 0; x < m.innen; x++) {
          const o = (y * m.innen + x) * 4;
          const strasse = farben.some((f) => Math.abs(d[o] - f[0]) < 10 && Math.abs(d[o + 1] - f[1]) < 10 && Math.abs(d[o + 2] - f[2]) < 10);
          if (strasse && !drin) stuecke++;
          drin = strasse;
        }
        maxStuecke = Math.max(maxStuecke, stuecke);
        if (stuecke >= 3) zeilen3++;
      }
      // dasselbe senkrecht (die Kehren liegen nicht alle waagrecht)
      let maxSp = 0;
      for (let x = 0; x < m.innen; x++) {
        let stuecke = 0, drin = false;
        for (let y = 0; y < m.innen; y++) {
          const o = (y * m.innen + x) * 4;
          const strasse = farben.some((f) => Math.abs(d[o] - f[0]) < 10 && Math.abs(d[o + 1] - f[1]) < 10 && Math.abs(d[o + 2] - f[2]) < 10);
          if (strasse && !drin) stuecke++;
          drin = strasse;
        }
        maxSp = Math.max(maxSp, stuecke);
      }
      return { maxStuecke: Math.max(maxStuecke, maxSp), zeilen3 };
    };
    const bild = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const erg = [];
    for (const s of [1170, 1260, 1350]) { A.setzeAuf(s); await bild(); await bild(); erg.push({ s, ...zaehle() }); }
    return erg;
  });
  pruefe(zick.some((z) => z.maxStuecke >= 3), 'Kehren im kleineren Ausschnitt noch als Zickzack (eine Bildzeile schneidet die Strasse mindestens 3 Mal)',
    zick.map((z) => `${z.s} m: bis ${z.maxStuecke} Strassenstücke pro Zeile`).join(', '));
  // Checkpoint-Punkte: Farbe je Ergebnis, bleibt, auch mit Live-Vergleich aus, nach Neustart wieder leer
  const punkte = await A(p, async () => {
    const A = window.__alpineRally, T = window.__T, Z = A.CONFIG.hud.zeit, V = A.CONFIG.hud.vergleich, E = await import('/js/einstellungen.js');
    const bild = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const farbeBei = (i) => {
      const L = A.hud.lage.zeit, n = A.checkpoints.length, g = Z.cpGroesse;
      const bP = n * g + (n - 1) * Z.cpAbstand;
      const x = Math.round(L.x + L.b / 2 - bP / 2) + i * (g + Z.cpAbstand) + 1, y = L.y + L.h + Z.cpUnter + 1;
      const d = document.getElementById('hud').getContext('2d').getImageData(x, y, 1, 1).data;
      return `#${[d[0], d[1], d[2]].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
    };
    const f = await import(window.__fahrerUrl);
    const fahreCp = (n) => { f.fahreBis(A, 'flott', { bisS: A.checkpoints[n].s + 3 }); return A.rennen.zwischenzeiten[n]; };
    const erg = {};
    // Referenz-Zeiten messen (ohne Referenz)
    localStorage.removeItem('alpineRally.bestzeiten'); localStorage.removeItem('alpineRally.letzterLauf');
    A.start({ countdown: false }); A.vergleich.setzeReferenz(null, 'best');
    const t0 = fahreCp(0); const t1 = fahreCp(1); const t2 = fahreCp(2);
    await bild(); erg.ohneRef = [farbeBei(0), farbeBei(1), farbeBei(2)];
    // CP1 schneller, CP2 langsamer, CP3 gleich
    A.start({ countdown: false });
    A.vergleich.setzeReferenz({ zeit: 500, cps: [Math.round((t0 + 1) * 100) / 100, Math.round((t1 - 1) * 100) / 100, Math.round(t2 * 100) / 100], spur: null }, 'best');
    fahreCp(0); await bild(); erg.nachCp1 = [farbeBei(0), farbeBei(1), farbeBei(2)];
    fahreCp(1); fahreCp(2); await bild(); erg.alle = [farbeBei(0), farbeBei(1), farbeBei(2)];
    // stehen bleiben bis zum Ende (Meldung weg, weiter fahren)
    for (let k = 0; k < 120 * 4; k++) A.rennSchritt(A.SCHRITT, T.LEER);
    await bild(); erg.spaeter = [farbeBei(0), farbeBei(1), farbeBei(2)];
    // Live-Vergleich aus: gleiche Farben
    E.setze('vergleich', false);
    A.start({ countdown: false });
    A.vergleich.setzeReferenz({ zeit: 500, cps: [Math.round((t0 + 1) * 100) / 100, Math.round((t1 - 1) * 100) / 100, Math.round(t2 * 100) / 100], spur: null }, 'best');
    fahreCp(0); fahreCp(1); fahreCp(2); await bild(); erg.ohneVergleich = [farbeBei(0), farbeBei(1), farbeBei(2)];
    E.setze('vergleich', true);
    A.neuStarten(); await bild(); erg.neustart = [farbeBei(0), farbeBei(1), farbeBei(2)];
    erg.soll = { gruen: V.farbeSchneller, rot: V.farbeLangsamer, gelb: Z.farbeCpErreicht, leer: A.CONFIG.hud.tacho.farbeBlatt };
    return erg;
  });
  const S = punkte.soll;
  const gleich = (a, b) => a.toLowerCase() === b.toLowerCase();
  pruefe(punkte.ohneRef.every((f) => gleich(f, S.gelb)), 'ohne Referenz (erste Fahrt): Punkte gelb wie bisher', punkte.ohneRef.join(' '));
  pruefe(gleich(punkte.nachCp1[0], S.gruen) && !gleich(punkte.nachCp1[1], S.gruen) && !gleich(punkte.nachCp1[1], S.rot), 'schneller an CP 1: Punkt 1 grün (die anderen noch leer)', punkte.nachCp1.join(' '));
  pruefe(gleich(punkte.alle[0], S.gruen) && gleich(punkte.alle[1], S.rot) && gleich(punkte.alle[2], S.gelb), 'CP 1 schneller = grün, CP 2 langsamer = rot, CP 3 gleich = gelb', punkte.alle.join(' '));
  pruefe(JSON.stringify(punkte.spaeter) === JSON.stringify(punkte.alle), 'die Farben bleiben stehen (auch wenn die Meldung weg ist)');
  pruefe(JSON.stringify(punkte.ohneVergleich) === JSON.stringify(punkte.alle), 'auch mit ausgeschaltetem Live-Vergleich dieselben Farben');
  pruefe(punkte.neustart.every((f) => !gleich(f, S.gruen) && !gleich(f, S.rot) && !gleich(f, S.gelb)), 'nach Neustart wieder leer', punkte.neustart.join(' '));
  pruefe(spiel.fehler.length === 0, 'keine Fehler in der Konsole', spiel.fehler.join(' | '));
  await spiel.schliessen();
}

// =====================================================================
console.log('(k) Texte');
{
  const spiel = await lade({ entsperren: false, adresse: '?menue=aus' });
  const p = spiel.page;
  const erg = await A(p, async () => {
    const { TEXTE } = await import('/js/texte.js');
    const { SCHRIFT } = await import('/js/pixel.js');
    const neu = ['einst.lautHinweis', 'einst.lautstaerke', 'einst.ton', 'einst.signale', 'einst.signaleHinweis'];
    const fehlt = neu.filter((k) => !(TEXTE[k] && TEXTE[k].de && TEXTE[k].en) || /ß/.test(TEXTE[k].de));
    const zeichen = new Set();
    for (const k of neu) for (const s of ['de', 'en']) for (const c of (TEXTE[k] && TEXTE[k][s] || '').toUpperCase()) if (!SCHRIFT[c]) zeichen.add(`${c} (${k})`);
    return { fehlt, zeichen: [...zeichen], hinweis: TEXTE['einst.lautHinweis'] };
  });
  pruefe(erg.fehlt.length === 0 && !/WIRKT ERST/.test(erg.hinweis.de) && !/ONCE THERE IS/.test(erg.hinweis.en), 'Hinweis unter LAUTSTÄRKE angepasst (de und en)', `"${erg.hinweis.de}" / "${erg.hinweis.en}"`);
  pruefe(erg.zeichen.length === 0, 'alle Zeichen gibt es in der Pixelschrift', erg.zeichen.join(', '));
  await spiel.schliessen();
}

// =====================================================================
// Teil 2: neue Tests für M7a.1 (Vergleich mit M7a: tools/ton-messung-vorher.json)
// =====================================================================
console.log('\n===== M7a.1 =====');
const db = (x) => 20 * Math.log10(Math.max(1e-9, x));
const f1 = (x) => x.toFixed(1);

console.log('M7a.1 (a) Motor-Tonlage');
{
  const spiel = await lade({ entsperren: false });
  const p = spiel.page;
  await A(p, WERK);
  const r = await A(p, async () => {
    const w = window.__W, P = window.__P, s = window.__schritte, warte = window.__warte, C = P.CONFIG, M = C.audio.motor;
    const { motorTon } = await import('/js/audio.js');
    const erg = { punkte: [], hoechstTon: M.hoechstTon, maxRpm: M.hoechstDrehzahl, leer: C.getriebe.leerlauf };
    for (const rpm of [C.getriebe.leerlauf, 1500, 3000, 5000, 7000, M.hoechstDrehzahl]) {
      const z = P.zustand({ drehzahl: rpm, gas: 1 });
      w.allesAus(); s(z, 0.1); await warte(250); s(z, 1 / 60);
      erg.punkte.push({ rpm, ist: w.knoten.f0.offset.value, soll: motorTon(rpm) });
    }
    // steigt immer mit der Drehzahl (Kurve von 600 bis 7900/min in 10er-Schritten)
    let monoton = true, vor = -1;
    for (let rpm = 600; rpm <= 7900; rpm += 10) { const f = motorTon(rpm); if (!(f > vor)) monoton = false; vor = f; }
    erg.monoton = monoton;
    erg.leerSoll = C.getriebe.leerlauf / 60 * M.zuendFaktor;
    return erg;
  });
  for (const pt of r.punkte) {
    const ab = Math.abs(pt.ist / pt.soll - 1);
    pruefe(ab <= 0.02, `Grundton bei ${pt.rpm}/min: ${f1(pt.ist)} Hz (Soll-Kurve ${f1(pt.soll)} Hz)`, `Abweichung ${(ab * 100).toFixed(2)} %`);
  }
  const top = r.punkte[r.punkte.length - 1], idle = r.punkte[0];
  pruefe(r.hoechstTon >= 450 && r.hoechstTon <= 500 && Math.abs(top.ist / r.hoechstTon - 1) < 0.02, `Höchstdrehzahl ${r.maxRpm}/min: Grundton ${f1(top.ist)} Hz (hoechstTon ${r.hoechstTon}, Ziel 450-500; M7a: 300 Hz)`);
  pruefe(Math.abs(idle.ist / 42 - 1) < 0.03 && Math.abs(r.leerSoll - 41.67) < 0.1, `Leerlauf weiter ca. 42 Hz (${f1(idle.ist)} Hz)`);
  pruefe(r.monoton, 'Tonhöhe steigt bei jeder Drehzahl mit der Drehzahl (600-7900/min, 10er-Schritte)');
  pruefe(spiel.fehler.length === 0, 'keine Fehler in der Konsole', spiel.fehler.join(' | '));
  await spiel.schliessen();
}

console.log('M7a.1 (b) Motor-Härte (offline, Vollgas) und (c) Turbo');
{
  const spiel = await lade({ entsperren: false });
  const p = spiel.page;
  const r = await A(p, async () => {
    const P = await import('/tools/ton-pruefung.js'), M = P.CONFIG.audio.motor;
    const erg = { motor: [], turbo: [], turboWerte: {} };
    const z = (rpm) => P.zustand({ drehzahl: rpm, gas: 1, gang: 3, zielGang: 3 });
    for (const rpm of [1500, 3000, 5000, 7000]) {
      let f0 = 0;
      const x = await P.rendere((w) => { w.aktualisiere(1 / 60, z(rpm)); f0 = w.zustand.f0; w.knoten.turboGain.disconnect(); w.knoten.heulenGain.disconnect(); }, 2, { limiter: false });
      const s = P.spektrum(x.daten, 0.5, 1.9), m = P.miss(x.daten, 0.5, 1.9);
      erg.motor.push({ rpm, f0, fGemessen: P.staerksteFrequenz(x.daten, 0.5, 1.5, f0 * 0.92, f0 * 1.08, 0.25), schwerpunkt: P.schwerpunkt(s), ueber1k: P.anteilUeber(s, 1000), ueber2k5: P.anteilUeber(s, 2500), pegelA: P.pegelA(s), ...m });
      if (rpm >= 5000) {
        const t = await P.rendere((w) => { w.zustand.druck = 1; w.aktualisiere(1 / 60, z(rpm)); w.knoten.motorLast.disconnect(); w.knoten.heulenGain.disconnect(); }, 1.5, { limiter: false });
        const tr = P.miss(t.daten, 0.5, 1.4).rms;
        erg.turbo.push({ rpm, turboRms: tr, motorRms: m.rms, verhaeltnisDb: P.dB(tr / m.rms) });
      }
    }
    // alle Schichten zugleich (mit Limiter): Vollgas am Begrenzer, Turbo, Salve, Schaltknall, Klack, Blow-off, Heulen
    const alles = await P.rendereVerlauf((w, t) => {
      w.zustand.druck = Math.max(w.zustand.druck, 0.95);
      w.aktualisiere(1 / 60, P.zustand({ drehzahl: 7100, gas: t < 0.8 ? 1 : 0, gang: 3, zielGang: 3, tempo: 40, vVor: 40 }));
      if (Math.abs(t - 0.5) < 0.008) { w.knall(0, 1, 'schaltknall'); w.knall(0.01, 1); w.blowOff(true); w.salve(); }
    }, 2);
    erg.alles = P.miss(alles.daten);
    for (const k of ['turboAb', 'turboVoll', 'turboRauf', 'turboRunter', 'turboTonMin', 'turboTonMax', 'turboPegel']) erg.turboWerte[k] = M[k];
    return erg;
  });
  for (const m of r.motor) {
    const v = VORHER.motor.find((x) => x.rpm === m.rpm);
    const ok = m.nan === 0 && m.spitze < 0.98 && Math.abs(m.mittel) < 0.005 && m.rms <= v.rms * 10 ** (1 / 20) && Math.abs(m.fGemessen / m.f0 - 1) < 0.02;
    pruefe(ok && (m.rpm !== 5000 || m.schwerpunkt >= 2 * v.schwerpunkt) && m.ueber2k5 >= 2 * v.ueber2k5,
      `Motor ${m.rpm}/min Vollgas: härter (Schwerpunkt${m.rpm === 5000 ? ' mind. doppelt' : ''}, Anteil über 2.5 kHz mind. doppelt), RMS höchstens +1 dB, Spitze < 0.98, kein NaN, keine Gleichspannung`,
      `Schwerpunkt ${v.schwerpunkt.toFixed(0)} -> ${m.schwerpunkt.toFixed(0)} Hz (x${(m.schwerpunkt / v.schwerpunkt).toFixed(2)}), über 2.5 kHz ${(v.ueber2k5 * 100).toFixed(1)} -> ${(m.ueber2k5 * 100).toFixed(1)} %, `
      + `über 1 kHz ${(v.ueber1k * 100).toFixed(1)} -> ${(m.ueber1k * 100).toFixed(1)} %, RMS ${f1(db(v.rms))} -> ${f1(db(m.rms))} dBFS (A-bewertet ${f1(m.pegelA - v.pegelA)} dB), Spitze ${m.spitze.toFixed(2)}, Mittel ${m.mittel.toFixed(4)}`);
  }
  pruefe(r.alles.nan === 0 && r.alles.spitze < 0.98, 'alle Motor-Schichten zugleich (Begrenzer, Turbo, Salve, Schaltknall, Blow-off): Spitze < 0.98', `Spitze ${r.alles.spitze.toFixed(3)}`);
  const turboM7a = { turboAb: 3000, turboVoll: 5500, turboRauf: 0.4, turboRunter: 0.6, turboTonMin: 2200, turboTonMax: 5200, turboPegel: 0.035 };
  pruefe(JSON.stringify(r.turboWerte) === JSON.stringify(turboM7a), '(c) Turbo-Werte (Pegel, Tonhöhe, Zeiten) genau wie in M7a', JSON.stringify(r.turboWerte));
  for (const t of r.turbo) {
    const v = VORHER.turbo.find((x) => x.rpm === t.rpm);
    pruefe(t.verhaeltnisDb >= v.verhaeltnisDb - 3, `(c) Turbo gegen Motor bei ${t.rpm}/min nicht schlechter als -3 dB gegenüber M7a`,
      `Turbo/Motor ${f1(v.verhaeltnisDb)} -> ${f1(t.verhaeltnisDb)} dB (Turbo-RMS ${v.turboRms.toFixed(4)} -> ${t.turboRms.toFixed(4)})`);
  }
  pruefe(spiel.fehler.length === 0, 'keine Fehler in der Konsole', spiel.fehler.join(' | '));
  await spiel.schliessen();
}

console.log('M7a.1 (d) Poppen');
{
  const spiel = await lade({ entsperren: false });
  const p = spiel.page;
  await A(p, WERK);
  const r = await A(p, async () => {
    const w = window.__W, P = window.__P, s = window.__schritte, M = P.CONFIG.audio.motor;
    const { baueKlangwerk } = await import('/js/audio.js');
    const Z = (art) => w.zaehler[art] || 0;
    const versuch = (werk, rpm) => {
      const z = (a) => werk.zaehler[a] || 0;
      for (let t = 0; t < 0.8; t += 1 / 60) werk.aktualisiere(1 / 60, P.zustand({ drehzahl: rpm, gas: 1 }));
      const k0 = z('knall'), n0 = z('knistern'), s0 = z('salve');
      for (let t = 0; t < 1.1; t += 1 / 60) werk.aktualisiere(1 / 60, P.zustand({ drehzahl: rpm, gas: 0 }));
      const pops = z('knall') - k0, kn = z('knistern') - n0;
      const wann = pops ? werk.protokoll.filter((x) => x.art === 'knall').slice(-pops).map((x) => x.wert).sort((a, b) => a - b) : [];
      const knWann = werk.protokoll.filter((x) => x.art === 'knistern').slice(kn ? -kn : werk.protokoll.length).map((x) => x.wert);
      return { pops, kn, salven: z('salve') - s0, abst: wann.slice(1).map((x, i) => x - wann[i]), knWann };
    };
    const liste = [];
    for (let k = 0; k < 200; k++) liste.push(versuch(w, 5500));
    // gleiche Folge mit einem neuen Werk: gleiches Poppen
    const w2 = baueKlangwerk(new AudioContext()); w2.puffernSofort();
    const w3 = baueKlangwerk(new AudioContext()); w3.puffernSofort();
    const fa = [], fb = [];
    for (let k = 0; k < 30; k++) { fa.push(versuch(w2, 5500).pops); fb.push(versuch(w3, 5500).pops); }
    // unter knallAb: nie
    let unten = 0;
    for (let k = 0; k < 30; k++) { const v = versuch(w, M.knallAb - 300); unten += v.pops + v.kn; }
    // Sperre: Gas weg (Salve), nach 0.3 s wieder Vollgas und nach 0.6 s wieder weg -> keine zweite Salve; nach > 1 s wieder
    w.allesAus();
    const sv = () => Z('salve');
    s(P.zustand({ drehzahl: 5500, gas: 1 }), 0.8); const a0 = sv();
    s(P.zustand({ drehzahl: 5500, gas: 0 }), 0.3); const a1 = sv();
    s(P.zustand({ drehzahl: 5500, gas: 1 }), 0.3); s(P.zustand({ drehzahl: 5500, gas: 0 }), 0.3); const a2 = sv();
    s(P.zustand({ drehzahl: 5500, gas: 1 }), 0.5); s(P.zustand({ drehzahl: 5500, gas: 0 }), 0.3); const a3 = sv();
    // ohne Last vorher: 3 s ohne Gas bei hoher Drehzahl, oder nur wenig Gas weg -> kein Poppen, kein Knistern
    w.allesAus();
    const o0 = Z('knall') + Z('knistern') + Z('salve');
    s(P.zustand({ drehzahl: 5500, gas: 0 }), 3);
    s(P.zustand({ drehzahl: 5500, gas: 0.4 }), 1); s(P.zustand({ drehzahl: 5500, gas: 0 }), 1.2);
    const ohneLast = Z('knall') + Z('knistern') + Z('salve') - o0;
    // Pegel: ein Pop (offline, vor dem Limiter) gegen Stein mittel / hart
    const an = (x) => { x.aktualisiere(1 / 60, P.zustand({ drehzahl: 1000 })); x.knoten.motorLast.disconnect(); };
    const pop = await P.rendere((x) => { an(x); x.knall(0.4, 1); }, 0.8, { limiter: false });
    const sk = await P.rendere((x) => { an(x); x.knall(0.4, M.schaltKnallPegel, 'schaltknall'); }, 0.8, { limiter: false });
    const st = {};
    for (const [n, v] of [['mittel', 7], ['hart', 16]]) st[n] = P.miss((await P.rendere((x) => x.aufprall(v, P.materialNr('stein')), 1, { limiter: false })).daten).spitze;
    const pd = pop.daten.subarray(Math.round(P.RATE * 0.39));
    return { liste, fa, fb, unten, sperre: [a1 - a0, a2 - a1, a3 - a2], ohneLast, pop: P.miss(pd).spitze, popDauer: P.huelle(pd, -40).ausklingen, popSchwerpunkt: P.schwerpunkt(P.spektrum(pd, 0, 0.1)), schaltknall: P.miss(sk.daten).spitze, stein: st, M: { chance: M.knallChance, kn: M.knisternChance, abstand: M.popAbstand, anzahl: M.popAnzahl, fenster: M.knisternFenster, ab: M.knallAb } };
  });
  const L = r.liste, mit = L.filter((x) => x.pops > 0);
  const anteil = mit.length / L.length;
  pruefe(Math.abs(anteil - r.M.chance) <= 0.08 && mit.every((x) => x.pops >= r.M.anzahl[0] && x.pops <= r.M.anzahl[1]) && L.every((x) => x.salven === 1),
    `200 Mal Gas weg aus Vollgas bei 5500/min: Salve in ${(anteil * 100).toFixed(0)} % (Chance ${r.M.chance * 100} % ±8), je ${r.M.anzahl.join('-')} Pops`,
    `Verteilung 1/2/3/4 Pops: ${[1, 2, 3, 4].map((n) => mit.filter((x) => x.pops === n).length).join(' / ')}`);
  const abst = L.flatMap((x) => x.abst);
  pruefe(abst.length > 50 && abst.every((a) => a >= r.M.abstand[0] - 1e-9 && a <= r.M.abstand[1] + 1e-9), `Abstände in einer Salve ${r.M.abstand[0] * 1000}-${r.M.abstand[1] * 1000} ms`, `${abst.length} Abstände, ${(Math.min(...abst) * 1000).toFixed(0)}-${(Math.max(...abst) * 1000).toFixed(0)} ms`);
  const knAnteil = L.filter((x) => x.kn > 0).length / L.length;
  pruefe(Math.abs(knAnteil - r.M.kn) <= 0.1 && L.every((x) => x.knWann.every((t) => t <= r.M.fenster)), `Knistern bei ${(knAnteil * 100).toFixed(0)} % (Chance ${r.M.kn * 100} %), immer in den ersten ${r.M.fenster} s`);
  pruefe(JSON.stringify(r.fa) === JSON.stringify(r.fb), 'feste Zufallsfolge: zweimal gleich gefahren = gleich gepoppt', r.fa.join(''));
  pruefe(r.unten === 0, `unter ${r.M.ab}/min kein Poppen und kein Knistern (30 Mal Gas weg bei ${r.M.ab - 300}/min)`);
  pruefe(JSON.stringify(r.sperre) === '[1,0,1]', 'Sperre: in der Sperrzeit (1.0 s) keine zweite Salve, danach wieder', JSON.stringify(r.sperre));
  pruefe(r.ohneLast === 0, 'ohne Last vorher (rollen ohne Gas, wenig Gas weg): kein Poppen, kein Knistern');
  const verh = r.pop / r.stein.mittel;
  pruefe(verh >= 0.65 && verh <= 0.9 && r.schaltknall < r.stein.hart && r.popDauer >= 0.012 && r.popDauer <= 0.04 && r.popSchwerpunkt >= 1500 && r.popSchwerpunkt <= 3000,
    'Pop: kurz, hell, klar hörbar (Spitze ca. 80 % eines mittleren Aufpralls), Schaltknall leiser als ein harter Aufprall',
    `Pop-Spitze ${r.pop.toFixed(2)} = ${(verh * 100).toFixed(0)} % von Stein mittel (${r.stein.mittel.toFixed(2)}), Dauer ${(r.popDauer * 1000).toFixed(0)} ms, Schwerpunkt ${r.popSchwerpunkt.toFixed(0)} Hz; Schaltknall ${r.schaltknall.toFixed(2)} < Stein hart ${r.stein.hart.toFixed(2)}`);
  pruefe(spiel.fehler.length === 0, 'keine Fehler in der Konsole', spiel.fehler.join(' | '));
  await spiel.schliessen();
}

console.log('M7a.1 (e) Schalten');
{
  const spiel = await lade({ entsperren: false });
  const p = spiel.page;
  await A(p, WERK);
  const r = await A(p, async () => {
    const w = window.__W, P = window.__P, s = window.__schritte, C = P.CONFIG, M = C.audio.motor, G = C.getriebe;
    const Z = (art) => w.zaehler[art] || 0;
    // Ein Schaltvorgang als Folge von Bildern: vorher im alten Gang, Schaltpause (Dauer wie im Getriebe), danach im neuen
    const schalt = (werk, hoch, gas, druck = null) => {
      const g0 = hoch ? 2 : 3, g1 = hoch ? 3 : 2, dauer = hoch ? G.schaltDauerHoch : G.schaltDauerRunter;
      const r0 = hoch ? 6800 : 3000, r1 = hoch ? 6800 * G.gaenge[1] / G.gaenge[2] : 3000 * G.gaenge[2] / G.gaenge[1];
      const dt = 1 / 60, z = (a) => werk.zaehler[a] || 0, vor = { ...werk.zaehler };
      for (let t = 0; t < 0.6; t += dt) werk.aktualisiere(dt, P.zustand({ drehzahl: r0, gas, gang: g0, zielGang: g0 }));
      if (druck != null) werk.zustand.druck = druck;
      const pegelVor = werk.zustand.motorPegel, filterVor = werk.zustand.filter;
      let minPegel = Infinity, klackInPause = 0, n = 0;
      for (let t = 0; t < dauer - 1e-9; t += dt, n++) {
        werk.aktualisiere(dt, P.zustand({ drehzahl: r0 + (r1 - r0) * Math.min(1, t / dauer * 1.5), gas, gang: g0, zielGang: g1, schaltet: true }));
        minPegel = Math.min(minPegel, werk.zustand.motorPegel);
        klackInPause += z('klack') - (vor.klack || 0);
      }
      const kv = z('klack');
      werk.aktualisiere(dt, P.zustand({ drehzahl: r1, gas, gang: g1, zielGang: g1 }));
      const klackErstesBild = z('klack') - kv, filterNach1 = werk.zustand.filter, pegelNach1 = werk.zustand.motorPegel;
      for (let t = 0; t < 0.5; t += dt) werk.aktualisiere(dt, P.zustand({ drehzahl: r1, gas, gang: g1, zielGang: g1 }));
      const d = (a) => z(a) - (vor[a] || 0);
      const kl = werk.protokoll.filter((x) => x.art === 'klack').pop();
      return { pegelVor, minPegel, pegelNach: werk.zustand.motorPegel, filterVor, filterNach1, filterSpaeter: werk.zustand.filter, pegelNach1, klackInPause, klackErstesBild, klack: d('klack'), klackWert: kl ? kl.wert : null,
        knall: d('schaltknall'), blowOff: d('blowOff'), zwischengas: d('zwischengas'), pops: d('knall') };
    };
    const erg = {};
    w.allesAus(); erg.hochLast = schalt(w, true, 1);
    w.allesAus(); erg.hochOhne = schalt(w, true, 0.1, 0);
    w.allesAus(); erg.runterBremsen = schalt(w, false, 0);
    w.allesAus(); erg.runterTeil = schalt(w, false, 0.35);
    // Schaltknall-Chance und Klack über 120 Hochschaltungen unter Last
    let knaelle = 0, klacks = 0;
    for (let k = 0; k < 120; k++) { w.allesAus(); const x = schalt(w, true, 1); knaelle += x.knall; klacks += x.klack; }
    erg.chance = { knaelle, klacks, soll: M.schaltKnallChance };
    // Blow-off beim Schalten unter Last lauter als beim normalen Gaswegnehmen (Pegel der Stimme / Ladedruck-Anteil)
    const boPegel = () => { const st = w.stimmenListe.filter((x) => x.an && x.art === 'blowOff').sort((a, b) => b.start - a.start)[0]; const e = w.protokoll.filter((x) => x.art === 'blowOff').pop(); return st.g.gain.value / (0.6 + 0.4 * e.wert); };
    w.allesAus(); s(P.zustand({ drehzahl: 6000, gas: 1, gang: 2, zielGang: 2 }), 2.5); s(P.zustand({ drehzahl: 6000, gas: 0, gang: 2, zielGang: 2 }), 0.1); const boNormal = boPegel();
    w.allesAus(); s(P.zustand({ drehzahl: 6000, gas: 1, gang: 2, zielGang: 2 }), 2.5); s(P.zustand({ drehzahl: 6000, gas: 1, gang: 2, zielGang: 3, schaltet: true }), 0.1); const boSchalt = boPegel();
    erg.blowOff = { normal: boNormal, schalt: boSchalt, soll: M.schaltBlowOff };
    // echtes Getriebe: Vollgas 0 -> 160 km/h, dann bremsen bis 20 km/h: genau ein Klack pro Gangwechsel
    const { Getriebe } = await import('/js/getriebe.js');
    w.allesAus();
    const g = new Getriebe();
    let v = 0, phase = 'gas', wechsel = 0, schaltetVor = false;
    const k0 = Z('klack');
    for (let k = 0; k < 120 * 40; k++) {
      const e = phase === 'gas' ? { gas: 1, bremse: 0 } : { gas: 0, bremse: 1 };
      const m = g.schritt(1 / 120, e, v, v, 1);
      v = Math.max(0, v + (m.beschl - (e.gas ? 0 : m.motorbremse) - e.bremse * 7 - 0.0004 * v * v - 0.15) / 120);
      if (g.schaltet && !schaltetVor) wechsel++;
      schaltetVor = g.schaltet;
      if (k % 2) w.aktualisiere(1 / 60, P.zustand({ drehzahl: g.drehzahl, gas: e.gas, bremse: e.bremse, gang: g.gang, zielGang: g.zielGang, schaltet: g.schaltet, tempo: v, vVor: v }));
      if (phase === 'gas' && v * 3.6 > 160) phase = 'bremsen';
      if (phase === 'bremsen' && v * 3.6 < 20) break;
    }
    erg.fahrt = { wechsel, klacks: Z('klack') - k0 };
    // Dip-Geschwindigkeit offline: Pegel des Motors 2 Bilder (33 ms) nach Beginn der Schaltpause
    const dip = [];
    await P.rendereVerlauf((x, t) => {
      const sch = t >= 0.5 && t < 0.5 + G.schaltDauerHoch;
      x.aktualisiere(1 / 60, P.zustand({ drehzahl: 6800, gas: 1, gang: 2, zielGang: sch ? 3 : 2, schaltet: sch }));
      dip.push([t, x.knoten.motorLast.gain.value]);
    }, 1.2);
    erg.dip = dip;
    erg.klackLeise = M.klackLeise; erg.schaltDip = M.schaltDip;
    return erg;
  });
  const h = r.hochLast;
  pruefe(h.minPegel < 0.3 * h.pegelVor && h.pegelNach > 0.85 * h.pegelVor, 'Hochschalten unter Last: Zünd-Unterbrechung, Motor fällt in der Schaltpause unter 30 % und kommt danach zurück',
    `Pegel ${h.pegelVor.toFixed(3)} -> ${h.minPegel.toFixed(3)} (${(h.minPegel / h.pegelVor * 100).toFixed(0)} %) -> ${h.pegelNach.toFixed(3)}`);
  const d0 = r.dip.filter((x) => x[0] < 0.5).pop()[1], d2 = r.dip.find((x) => x[0] >= 0.5 + 0.03)[1];
  pruefe(d2 < 0.3 * d0, 'Zünd-Unterbrechung schnell: nach ca. 33 ms schon unter 30 % (Knoten, offline)', `${d0.toFixed(3)} -> ${d2.toFixed(3)}`);
  pruefe(h.klackInPause === 0 && h.klackErstesBild === 1 && h.klack === 1, 'Klack genau einmal, am Ende der Schaltpause (im ersten Bild mit eingelegtem Gang)', JSON.stringify({ inPause: h.klackInPause, erstesBild: h.klackErstesBild }));
  const ch = r.chance.knaelle / 120;
  pruefe(Math.abs(ch - r.chance.soll) <= 0.12 && r.chance.klacks === 120, `Schaltknall beim Hochschalten unter Last: ${(ch * 100).toFixed(0)} % (Chance ${r.chance.soll * 100} %), 120 Klacks bei 120 Schaltungen`);
  const bf = r.blowOff.schalt / r.blowOff.normal;
  pruefe(Math.abs(bf - r.blowOff.soll) < 0.05, `Blow-off beim Schalten unter Last ${bf.toFixed(2)} Mal so laut wie beim normalen Gaswegnehmen (soll ${r.blowOff.soll})`);
  const o = r.hochOhne;
  pruefe(o.klack === 1 && Math.abs(o.klackWert - r.klackLeise) < 1e-9 && o.knall === 0 && o.blowOff === 0 && o.pops === 0 && o.minPegel > 0.9 * o.pegelVor * 0.5,
    'Hochschalten ohne Last: nur das leise Klack (kein Knall, kein Zischen, keine Zünd-Unterbrechung)', JSON.stringify({ klack: o.klack, leise: o.klackWert, knall: o.knall, blowOff: o.blowOff, pegel: `${o.pegelVor.toFixed(3)} -> ${o.minPegel.toFixed(3)}` }));
  const b = r.runterBremsen, t2 = r.runterTeil;
  pruefe(b.zwischengas === 1 && b.filterNach1 > b.filterSpaeter + 1500 && b.pegelNach1 > 0 && b.klack === 1 && b.klackWert === r.klackLeise && b.knall === 0,
    'Runterschalten beim Bremsen: Zwischengas (kurz heller und lauter), leises Klack, kein Pop',
    `Helligkeit direkt danach ${b.filterNach1.toFixed(0)} Hz, 0.5 s später ${b.filterSpaeter.toFixed(0)} Hz`);
  pruefe(t2.zwischengas === 1 && t2.filterNach1 > t2.filterSpaeter + 1500 && t2.klack === 1 && t2.klackWert === 1,
    'Runterschalten mit etwas Gas: Zwischengas und normales Klack (Pop mit Chance 0.35)', `Helligkeit ${t2.filterNach1.toFixed(0)} -> ${t2.filterSpaeter.toFixed(0)} Hz, Pop ${t2.knall}`);
  pruefe(r.fahrt.wechsel >= 7 && r.fahrt.klacks === r.fahrt.wechsel, 'echtes Getriebe (Vollgas bis 160 km/h, dann bremsen): genau ein Klack pro Gangwechsel, kein Doppel-Klack',
    `${r.fahrt.wechsel} Gangwechsel, ${r.fahrt.klacks} Klacks`);
  pruefe(spiel.fehler.length === 0, 'keine Fehler in der Konsole', spiel.fehler.join(' | '));
  await spiel.schliessen();
}

console.log('M7a.1 (f) Signale');
{
  const spiel = await lade({ entsperren: false });
  const p = spiel.page;
  await A(p, WERK);
  const r = await A(p, async () => {
    const w = window.__W, P = window.__P, S = P.CONFIG.audio.signale;
    const SIG = {
      'menue-tick': (x) => x.menue('tick'), 'menue-regler': (x) => x.menue('regler', 1), 'menue-bestaetigen': (x) => x.menue('bestaetigen'),
      'menue-zurueck': (x) => x.menue('zurueck'), 'menue-fehler': (x) => x.menue('fehler'), paceNote: (x) => x.paceNote(1),
      countdown: (x) => x.countdown(), go: (x) => x.go(), 'cp-schneller': (x) => x.checkpoint(-1), 'cp-langsamer': (x) => x.checkpoint(1), 'cp-neutral': (x) => x.checkpoint(0),
      verpasst: (x) => x.verpasst(), pause: (x) => x.pauseTon(true), weiter: (x) => x.pauseTon(false), 'fanfare-kurz': (x) => x.fanfare(false), 'fanfare-lang': (x) => x.fanfare(true),
    };
    const erg = { spitze: {}, mix: {} };
    for (const [n, f] of Object.entries(SIG)) erg.spitze[n] = P.miss((await P.rendere((x) => f(x), n.startsWith('fanfare') ? 4.5 : 1, { limiter: false })).daten).spitze;
    // Im Mix: Motor bei 5000/min Vollgas (voller Ladedruck); das Signal kommt nach 0.5 s. Signal allein (Motor abgehängt) gegen
    // Motor allein (Signal-Schiene abgehängt, Ducking wirkt trotzdem), RMS im selben Fenster (aktiver Teil des Signals)
    const rennen = ['countdown', 'go', 'cp-schneller', 'cp-langsamer', 'cp-neutral', 'verpasst', 'pause', 'weiter', 'fanfare-kurz', 'fanfare-lang'];
    for (const n of rennen) {
      for (const motorZ of [P.zustand({ drehzahl: 5000, gas: 1, gang: 3, zielGang: 3 }), P.zustand({ modus: 'ziel', drehzahl: 2500, gas: 0, tempo: 10, vVor: 10, gang: 2, zielGang: 2 })]) {
        if (motorZ.modus === 'ziel' && n !== 'fanfare-lang') continue;
        const lauf = (welche) => P.rendereVerlauf((x, t) => {
          if (t === 0) { x.zustand.druck = motorZ.gas; if (welche === 'signal') x.busse.duck.disconnect(); else x.busse.signale.disconnect(); }
          x.aktualisiere(1 / 60, motorZ);
          if (Math.abs(t - 0.5) < 0.008) SIG[n](x);
        }, n.startsWith('fanfare') ? 5 : 1.5, { limiter: false });
        const sig = (await lauf('signal')).daten, mot = (await lauf('motor')).daten;
        const h = P.huelle(sig.subarray(Math.round(P.RATE * 0.5)), -40);
        const von = 0.5, bis = 0.5 + Math.max(0.05, h.aktivDauer + 0.0);
        const rs = P.miss(sig, von, bis).rms, rm = P.miss(mot, von, bis).rms;
        erg.mix[`${n}${motorZ.modus === 'ziel' ? '-zielschirm' : ''}`] = { signal: rs, motor: rm, db: P.dB(rs / rm), fenster: bis - von };
      }
    }
    // Ducking: Motor (Schiene duck) nach 90 ms und 200 ms um ca. 3.5 dB leiser, nach 0.8 s zurück; Menü-Töne: kein Ducking
    const warte = window.__warte;
    erg.duck = {};
    for (const n of [...rennen.filter((x) => !['pause', 'weiter', 'cp-langsamer', 'cp-neutral', 'fanfare-lang'].includes(x)), 'menue-bestaetigen', 'menue-tick', 'paceNote', 'pause']) {
      w.allesAus(); await warte(400);
      SIG[n](w);
      await warte(90); const a = w.busse.duck.gain.value, u = w.busse.umgDuck.gain.value;
      await warte(110); const b = w.busse.duck.gain.value;
      await warte(650); const c = w.busse.duck.gain.value;
      erg.duck[n] = { a, b, c, u };
    }
    erg.duckDb = S.duckDb;
    return erg;
  });
  const bereich = { 'menue-tick': [0.2, 0.25], 'menue-regler': [0.2, 0.25], paceNote: [0.2, 0.25], 'menue-bestaetigen': [0.35, 0.4], 'menue-zurueck': [0.35, 0.4], 'menue-fehler': [0.35, 0.4] };
  for (const [n, sp] of Object.entries(r.spitze)) {
    const [a, b] = bereich[n] || [0.5, 0.6];
    const v = VORHER.signale[n];
    pruefe(sp >= a && sp <= b, `${n}: Spitze ${sp.toFixed(3)} im Zielbereich ${a}-${b} (LAUTSTÄRKE und SIGNALTÖNE 100 %, vor dem Limiter)`, `M7a: ${v.spitze.toFixed(3)} (x${(sp / v.spitze).toFixed(1)})`);
  }
  for (const [n, m] of Object.entries(r.mix)) {
    if (n === 'fanfare-lang') { console.log(`  INFO fanfare-lang bei Vollgas: ${f1(m.db)} dB gegen den Motor (sie kommt aber erst auf dem Zielbildschirm, siehe nächste Zeile)`); continue; }
    pruefe(m.db >= 0, `${n}: im Mix mit dem Motor ${n.endsWith('zielschirm') ? '(Zielbildschirm, Auto rollt aus)' : 'bei 5000/min Vollgas'} mindestens so laut wie der Motor`,
      `Signal ${f1(db(m.signal))} dBFS, Motor ${f1(db(m.motor))} dBFS (mit Ducking) -> ${m.db >= 0 ? '+' : ''}${f1(m.db)} dB, Fenster ${(m.fenster * 1000).toFixed(0)} ms`);
  }
  const dz = 10 ** (r.duckDb / 20);
  for (const [n, d] of Object.entries(r.duck)) {
    const soll = !/menue|paceNote|pause/.test(n);
    const ok = soll ? d.a < 10 ** (-3 / 20) && d.a > 10 ** (-4 / 20) && d.b < 0.75 && d.c > 0.97 && d.u > 0.99 : d.a > 0.99 && d.b > 0.99 && d.c > 0.99;
    pruefe(ok, soll ? `Ducking bei ${n}: Motor ${f1(-db(d.a))} dB leiser (3-4 dB, ca. 0.25 s), dann zurück; Umgebung bleibt` : `kein Ducking bei ${n}`,
      `nach 90 ms ${d.a.toFixed(2)} (soll ${dz.toFixed(2)}), 200 ms ${d.b.toFixed(2)}, 850 ms ${d.c.toFixed(2)}`);
  }
  pruefe(spiel.fehler.length === 0, 'keine Fehler in der Konsole', spiel.fehler.join(' | '));
  await spiel.schliessen();
}

console.log('M7a.1 (g) Regler SIGNALTÖNE');
{
  const spiel = await lade();
  const p = spiel.page;
  const r = await A(p, async () => {
    const A = window.__alpineRally, w = A.ton.werk, E = await import('/js/einstellungen.js');
    const warte = (ms) => new Promise((r) => setTimeout(r, ms));
    const erg = { werte: {} };
    erg.standard = E.einstellungen.signale;
    E.setze('lautstaerke', 70);
    // (Chrome rechnet eine Schiene nur, solange darauf etwas klingt: darum läuft dabei die Fanfare)
    for (const v of [0, 30, 50, 100, 70]) { E.setze('signale', v); w.fanfare(false); await warte(250); erg.werte[v] = { sig: w.busse.signaleRegler.gain.value, master: w.busse.master.gain.value }; w.allesAus(); }
    erg.gespeichert = JSON.parse(localStorage.getItem(A.CONFIG.menue.speicherName)).signale;
    // Menü: Eintrag direkt unter LAUTSTÄRKE, Pfeil links = 65 % mit Regler-Tick
    A.menue.oeffne(A.seiten.einstellungen, true);
    const ein = A.menue.seite.eintraege;
    erg.reihe = [ein.findIndex((e) => e.text === 'einst.lautstaerke'), ein.findIndex((e) => e.text === 'einst.signale')];
    while (A.menue.wahl !== erg.reihe[1]) A.menue.runter();
    await warte(80);
    erg.tickVor = w.zaehler['menue-regler'] || 0;
    return erg;
  });
  await p.keyboard.press('ArrowLeft'); await bilderAbwarten(p, 2);
  const nachTick = await A(p, () => ({ n: window.__alpineRally.ton.werk.zaehler['menue-regler'] || 0, wert: (window.__alpineRally.ton.werk.protokoll.filter((x) => x.art === 'menue-regler').pop() || {}).wert, sig: window.__alpineRally.ton.werk.busse.signaleRegler.gain.value }));
  const wv = r.werte;
  pruefe(wv[0].sig < 1e-3 && Math.abs(wv[30].sig - 0.09) < 0.01 && Math.abs(wv[50].sig - 0.25) < 0.01 && Math.abs(wv[100].sig - 1) < 0.01 && Object.values(wv).every((x) => Math.abs(x.master - 0.49) < 0.01),
    'SIGNALTÖNE wirkt quadratisch auf die Signale (0 % = stumm, 50 % = 0.25), LAUTSTÄRKE (Master) bleibt', JSON.stringify(Object.fromEntries(Object.entries(wv).map(([k, x]) => [k, r2(x.sig)]))));
  pruefe(r.standard === 100 && r.gespeichert === 70, 'Standard 100 %, wird gespeichert', `Standard ${r.standard}, gespeichert ${r.gespeichert}`);
  pruefe(r.reihe[1] === r.reihe[0] + 1, 'Regler SIGNALTÖNE steht direkt unter LAUTSTÄRKE (Gruppe TON)', JSON.stringify(r.reihe));
  pruefe(nachTick.n === r.tickVor + 1 && Math.abs(nachTick.wert - 0.65) < 0.01 && Math.abs(nachTick.sig - 0.65 ** 2) < 0.05, 'Pfeil links: 65 %, Regler-Tick auf der Signal-Schiene (schon mit der neuen Stärke)', JSON.stringify(nachTick));
  // Neu laden: Wert bleibt; alter Speicher ohne "signale" -> 100
  await p.reload();
  await p.waitForFunction(() => window.__alpineRally, null, { timeout: 120000 });
  const geladen = await A(p, async () => (await import('/js/einstellungen.js')).einstellungen.signale);
  await A(p, () => { const k = window.__alpineRally.CONFIG.menue.speicherName, d = JSON.parse(localStorage.getItem(k)); delete d.signale; localStorage.setItem(k, JSON.stringify(d)); });
  await p.reload();
  await p.waitForFunction(() => window.__alpineRally, null, { timeout: 120000 });
  const alt = await A(p, async () => (await import('/js/einstellungen.js')).einstellungen.signale);
  pruefe(geladen === 65 && alt === 100, 'nach dem Neuladen gleich; alter Speicher ohne den Wert = 100 %', `neu geladen ${geladen}, alter Speicher ${alt}`);
  // Wert 0: alle Signale stumm (offline gerechnet)
  const stumm = await A(p, async () => {
    const P = await import('/tools/ton-pruefung.js');
    const x = await P.rendere((w) => { w.busse.signaleRegler.gain.value = 0; w.signalLautstaerke(0); w.countdown(); w.checkpoint(-1); w.menue('bestaetigen'); w.fanfare(false); }, 1);
    return P.miss(x.daten).spitze;
  });
  pruefe(stumm < 1e-4, 'SIGNALTÖNE 0 %: Countdown, Checkpoint, Menü, Fanfare stumm', `Spitze ${stumm.toExponential(1)}`);
  pruefe(spiel.fehler.length === 0, 'keine Fehler in der Konsole', spiel.fehler.join(' | '));
  await spiel.schliessen();
}

console.log('M7a.1 (h) Aufprall');
{
  const spiel = await lade({ entsperren: false });
  const p = spiel.page;
  const r = await A(p, async () => {
    const P = await import('/tools/ton-pruefung.js'), AU = P.CONFIG.audio.aufprall;
    const erg = { mat: {} };
    for (const mat of AU.materialien) {
      erg.mat[mat] = {};
      for (const [stufe, v] of [['leicht', 1.5], ['mittel', 7], ['hart', 16]]) {
        const x = await P.rendere((w) => w.aufprall(v, P.materialNr(mat)), 1.6, { limiter: false });
        const h = P.huelle(x.daten, -40), s = P.spektrum(x.daten, 0, Math.max(0.1, h.anfang + h.ausklingen));
        const schlagAb = AU.schlagAb; AU.schlagAb = 1e9;
        const y = await P.rendere((w) => w.aufprall(v, P.materialNr(mat)), 1.6, { limiter: false });
        AU.schlagAb = schlagAb;
        const pegel = AU.pegel; AU.pegel = 0;
        const sch = await P.rendere((w) => w.aufprall(v, P.materialNr(mat)), 0.5, { limiter: false });
        AU.pegel = pegel;
        const sy = P.spektrum(y.daten, 0, Math.max(0.1, h.anfang + h.ausklingen));
        erg.mat[mat][stufe] = { spitze: P.miss(x.daten).spitze, ausklingen40: h.ausklingen, schwerpunkt: P.schwerpunkt(s), schwerpunktAllein: P.schwerpunkt(sy), spitzeUeber1k: P.spitzeUeber(s, 1000),
          pegelRms: Math.hypot(P.miss(y.daten, 0, 0.15).rms, P.miss(sch.daten, 0, 0.15).rms) };
      }
    }
    // Motor bei Vollgas (mit Turbo) und lautestes Signal, zum Vergleich
    const mot = await P.rendere((w) => { w.zustand.druck = 1; w.aktualisiere(1 / 60, P.zustand({ drehzahl: 5000, gas: 1, gang: 3, zielGang: 3 })); }, 1.5, { limiter: false });
    erg.motor = P.miss(mot.daten, 0.5, 1.4);
    // Aufprall + Vollgas + Drift zugleich (mit Limiter): Spitze, Absenkung des Limiters, Ducking
    erg.zugleich = {};
    for (const mat of AU.materialien) {
      const red = [];
      const z = P.zustand({ drehzahl: 6000, gas: 1, tempo: 30, vVor: 30, drift: 20, untergrund: 'asphalt', gang: 3, zielGang: 3, kontaktArt: -1 });
      const x = await P.rendereVerlauf((w, t) => {
        w.aktualisiere(1 / 60, z);
        if (Math.abs(t - 0.6) < 0.008) { w.zustand.letzterAufprall = -1e9; w.aufprall(16, P.materialNr(mat)); }
        red.push([t, w.busse.limiter.reduction, w.busse.duck.gain.value]);
      }, 2);
      const vor = red.filter((q) => q[0] > 0.4 && q[0] < 0.58).reduce((a, q) => Math.min(a, q[1]), 0);
      const zurueck = red.find((q) => q[0] > 0.62 && q[1] > vor - 1);
      const duck90 = red.find((q) => q[0] >= 0.69)[2];
      const duckZurueck = red.find((q) => q[0] > 0.62 && q[2] > 0.97);
      erg.zugleich[mat] = { spitze: P.miss(x.daten).spitze, zurueck: zurueck ? zurueck[0] - 0.6 : 9, duck90, duckZurueck: duckZurueck ? duckZurueck[0] - 0.6 : 9 };
    }
    erg.duckDb = AU.duckDb; erg.duckDauer = AU.duckDauer;
    return erg;
  });
  const V = VORHER.aufprall;
  for (const st of ['mittel', 'hart']) {
    const a = r.mat.stein[st], v = V.stein[st];
    pruefe(a.schwerpunkt < 1200 && a.schwerpunktAllein < 1200 && a.ausklingen40 < 0.25 && a.spitzeUeber1k < -30, `Stein ${st}: dumpf (Schwerpunkt < 1200 Hz), kurz (Ausklingen bis -40 dB < 0.25 s), keine Eigentöne über 1 kHz über -30 dB`,
      `Schwerpunkt Material ${v.schwerpunktAllein.toFixed(0)} -> ${a.schwerpunktAllein.toFixed(0)} Hz (gesamt ${a.schwerpunkt.toFixed(0)}), Ausklingen ${v.ausklingen40.toFixed(2)} -> ${a.ausklingen40.toFixed(2)} s, stärkste Spitze über 1 kHz ${f1(v.spitzeUeber1kAllein)} -> ${f1(a.spitzeUeber1k)} dB`);
    const m = r.mat.metall[st], vm = V.metall[st];
    pruefe(Math.abs(m.schwerpunktAllein / vm.schwerpunktAllein - 1) <= 0.15 && Math.abs(m.ausklingen40 / vm.ausklingen40 - 1) <= 0.15, `Metall ${st} bleibt hell und klingt nach (wie M7a ±15 %)`,
      `Schwerpunkt ${vm.schwerpunktAllein.toFixed(0)} -> ${m.schwerpunktAllein.toFixed(0)} Hz, Ausklingen ${vm.ausklingen40.toFixed(2)} -> ${m.ausklingen40.toFixed(2)} s`);
  }
  const zeilen = [];
  let alleOk = true;
  for (const mat of Object.keys(r.mat)) for (const st of ['mittel', 'hart']) {
    const d = db(r.mat[mat][st].pegelRms) - db(V[mat][st].pegelRms);
    if (d < 4 || d > 6) alleOk = false;
    zeilen.push(`${mat} ${st} ${d >= 0 ? '+' : ''}${f1(d)}`);
  }
  pruefe(alleOk, 'alle Materialien +4 bis +6 dB lauter als in M7a (RMS der ersten 0.15 s, Material und Schlag)', zeilen.join(', '));
  const maxSignal = Math.max(...Object.values(VORHER.signale).map(() => 0), ...Object.keys(r.mat).map(() => 0));
  void maxSignal;
  const sigSpitze = 0.6, sigRms = 0.42; // obere Grenzen aus (f): Spitze aller Signale <= 0.6, RMS (aktiv) höchstens ca. 0.4
  const hartOk = Object.entries(r.mat).every(([, x]) => x.hart.spitze > Math.max(r.motor.spitze, sigSpitze) && x.hart.pegelRms > Math.max(r.motor.rms, sigRms));
  pruefe(hartOk, 'harter Aufprall ist der lauteste Klang: Spitze und Pegel über Motor (Vollgas) und jedem Signal',
    `Motor Spitze ${r.motor.spitze.toFixed(2)} / RMS ${r.motor.rms.toFixed(2)}; hart: ${Object.entries(r.mat).map(([m, x]) => `${m} ${x.hart.spitze.toFixed(2)} / ${x.hart.pegelRms.toFixed(2)}`).join(', ')}`);
  pruefe(Object.values(r.mat).every((x) => db(x.leicht.pegelRms) > -24), 'leichter Kontakt (1.5 m/s) klar hörbar: RMS über -24 dBFS',
    Object.entries(r.mat).map(([m, x]) => `${m} ${f1(db(x.leicht.pegelRms))}`).join(', '));
  const Zg = r.zugleich;
  pruefe(Object.values(Zg).every((x) => x.spitze < 0.98), 'Aufprall (hart) + Vollgas + Drift zugleich: Spitze < 0.98', Object.entries(Zg).map(([m, x]) => `${m} ${x.spitze.toFixed(3)}`).join(', '));
  const dz = 10 ** (r.duckDb / 20);
  pruefe(Object.values(Zg).every((x) => Math.abs(db(x.duck90) - r.duckDb) <= 1 && x.zurueck <= x.duckZurueck), `Ducking ${r.duckDb} dB (±1); der Limiter ist wieder auf dem Stand von vorher, bevor das Ducking zurück ist (kein längeres Einbrechen)`,
    Object.entries(Zg).map(([m, x]) => `${m}: Ducking ${f1(db(x.duck90))} dB, Limiter zurück nach ${(x.zurueck * 1000).toFixed(0)} ms, Ducking zurück nach ${(x.duckZurueck * 1000).toFixed(0)} ms`).join('; ') + ` (soll ${dz.toFixed(2)})`);
  pruefe(spiel.fehler.length === 0, 'keine Fehler in der Konsole', spiel.fehler.join(' | '));
  await spiel.schliessen();
}

console.log('M7a.1 (i) Rückwärts-Heulen');
{
  const spiel = await lade({ entsperren: false, adresse: '?menue=aus' });
  const p = spiel.page;
  // echte Rückwärts-Drehzahlen: im Spiel Bremse halten (Asphalt, 600 m), 5 s
  const rueck = await A(p, () => {
    const A = window.__alpineRally;
    A.anhalten = true; A.start({ countdown: false }); A.setzeAuf(600);
    const e = { ...window.__T.LEER, bremse: 1 }, liste = [];
    for (let k = 0; k < 120 * 5; k++) { A.rennSchritt(A.SCHRITT, e); if (k % 12 === 11) liste.push({ rpm: A.getriebe.drehzahl, v: A.physik.vVor, gang: A.getriebe.gang }); }
    return liste;
  });
  await A(p, WERK);
  const r = await A(p, async (rueck) => {
    const w = window.__W, P = window.__P, s = window.__schritte, warte = window.__warte, M = P.CONFIG.audio.motor;
    const erg = { stich: [] };
    for (const [rpm, v] of [[2000, 3], [3500, 3], [3500, 8], [4724, 9]]) {
      w.allesAus(); s(P.zustand({ drehzahl: rpm, gang: -1, zielGang: -1, tempo: v, vVor: -v, bremse: 1 }), 0.1); await warte(200);
      erg.stich.push({ rpm, v, hz: w.knoten.heulen.frequency.value, soll: rpm / 60 * M.heulenFaktor, pegel: w.zustand.heulen });
    }
    w.allesAus(); s(P.zustand({ drehzahl: 3500, gang: 2, zielGang: 2, tempo: 8, vVor: 8, gas: 0.5 }), 0.3); erg.vorwaerts = w.zustand.heulen;
    // echte Rückwärtsfahrt: Tonhöhe und Pegel gegen den Motor (offline, Heulen allein / Motor allein)
    erg.real = [];
    for (const q of rueck.filter((x, i) => x.gang === -1 && i % 4 === 3)) {
      const z = P.zustand({ drehzahl: q.rpm, gang: -1, zielGang: -1, tempo: Math.abs(q.v), vVor: q.v, bremse: 1 });
      const x = await P.rendere((u) => { u.aktualisiere(1 / 60, z); u.knoten.motorLast.disconnect(); u.knoten.turboGain.disconnect(); }, 0.6, { limiter: false });
      const m = await P.rendere((u) => { u.aktualisiere(1 / 60, z); u.knoten.heulenGain.disconnect(); u.knoten.turboGain.disconnect(); }, 0.6, { limiter: false });
      erg.real.push({ rpm: q.rpm, v: q.v, hz: P.staerksteFrequenz(x.daten, 0.25, 0.55, 80, 2500, 2), rms: P.miss(x.daten, 0.25, 0.55).rms, motor: P.miss(m.daten, 0.25, 0.55).rms });
    }
    return erg;
  }, rueck);
  pruefe(r.stich.every((x) => Math.abs(x.hz / x.soll - 1) <= 0.02), 'Tonhöhe = Drehzahl / 60 x heulenFaktor (±2 %)', r.stich.map((x) => `${x.rpm}/min ${x.v} m/s: ${x.hz.toFixed(0)} Hz (soll ${x.soll.toFixed(0)})`).join(', '));
  pruefe(Math.abs(r.stich[1].hz - r.stich[2].hz) < 1, 'folgt der Drehzahl: gleiche Drehzahl, anderes Tempo = gleiche Tonhöhe', `${r.stich[1].hz.toFixed(1)} / ${r.stich[2].hz.toFixed(1)} Hz`);
  const maxHz = Math.max(...r.real.map((x) => x.hz)), maxRpm = Math.max(...rueck.map((x) => x.rpm));
  pruefe(maxHz < 520 && maxHz > 350, `echte Rückwärtsfahrt (bis ${Math.round(maxRpm)}/min, ${Math.abs(Math.min(...rueck.map((x) => x.v))).toFixed(1)} m/s): höchstens ${maxHz.toFixed(0)} Hz (unter 520; M7a: 1360 Hz)`,
    r.real.map((x) => `${Math.round(x.rpm)}/min ${x.hz.toFixed(0)} Hz`).join(', '));
  pruefe(r.vorwaerts === 0 && r.real.every((x) => x.rms < x.motor), 'nur im Rückwärtsgang, nie lauter als der Motor', r.real.map((x) => `${f1(db(x.rms))} / ${f1(db(x.motor))} dB`).join(', '));
  pruefe(spiel.fehler.length === 0, 'keine Fehler in der Konsole', spiel.fehler.join(' | '));
  await spiel.schliessen();
}

console.log('M7a.1 (j) Ton-Labor: Feinschliff');
{
  const spiel = await starteSpiel({ breite: 1100, hoehe: 900, args: AUTOPLAY });
  const p = spiel.page;
  await p.goto(`${spiel.url}/ton-labor.html`);
  await p.waitForFunction(() => window.__tonLabor && window.__tonLabor.fein);
  await p.click('#tonStarten');
  await p.waitForFunction(() => window.__tonLabor.ton.werk && window.__tonLabor.ton.werk.aufbau.fertig);
  const r = await A(p, async () => {
    const L = window.__tonLabor, F = L.fein.FEIN, w = L.ton.werk, C = L.CONFIG;
    const warte = (ms) => new Promise((r) => setTimeout(r, ms));
    const setze = (pfad, v) => { const f = F.find((x) => x.pfad === pfad); f.regler.value = v; f.regler.dispatchEvent(new Event('input')); };
    const regler = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input')); };
    const erg = { anzahl: F.length, signalRegler: !!document.getElementById('signale') };
    regler('drehzahl', C.audio.motor.hoechstDrehzahl); regler('gas', 0.5);
    await warte(200); erg.f0Vor = w.zustand.f0;
    const kurveVor = w.knoten.saettigung.curve[560], steinVor = w.puffer['aufprall-stein'];
    setze('audio.motor.hoechstTon', 560); setze('audio.motor.verzerrung', 9.5); setze('audio.aufprall.klang.stein.knall[2]', 3000);
    setze('audio.motor.rauh', 0.5); setze('audio.motor.unter', 0.3); setze('audio.motor.filterGas', 6000);
    await warte(250);
    erg.f0Nach = w.zustand.f0; erg.kurve = [kurveVor, w.knoten.saettigung.curve[560]]; erg.steinNeu = steinVor !== w.puffer['aufprall-stein'];
    erg.rauh = w.knoten.rauhGain.gain.value; erg.unter = w.knoten.unterGain.gain.value; erg.filter = w.zustand.filter;
    document.getElementById('kopieren').click(); await warte(150);
    erg.text = document.getElementById('kopieText').value;
    document.getElementById('allesZurueck').click(); await warte(250);
    erg.zurueck = F.map((f) => { const [o, k] = L.fein.stelle(f.pfad); return o[k] === f.original; });
    erg.f0Zurueck = w.zustand.f0;
    erg.audio = JSON.stringify(C.audio);
    erg.hinweis = /nur hier auf dieser Seite/.test(document.getElementById('feinschliff').textContent);
    return erg;
  });
  // Bild der Seite mit geänderten Werten
  await A(p, () => { const F = window.__tonLabor.fein.FEIN; for (const [pfad, v] of [['audio.motor.verzerrung', 7.5], ['audio.motor.popPegel', 1.0]]) { const f = F.find((x) => x.pfad === pfad); f.regler.value = v; f.regler.dispatchEvent(new Event('input')); } document.getElementById('kopieren').click(); });
  await warte(300);
  await p.screenshot({ path: path.join(BILDER, '21-ton-labor-feinschliff.png'), fullPage: true });
  await A(p, () => document.getElementById('allesZurueck').click());
  const zeilen = r.text.split('\n');
  pruefe(r.anzahl >= 12 && r.signalRegler && r.hinweis, `Feinschliff mit ${r.anzahl} Reglern (Name, Wert, Rücksetz-Knopf), Regler Signaltöne, Hinweis "nur auf dieser Seite"`);
  pruefe(r.f0Nach > r.f0Vor * 1.1 && r.kurve[0] !== r.kurve[1] && r.steinNeu && Math.abs(r.rauh - 0.5 * 0.65) < 0.05 && Math.abs(r.unter - 0.3) < 0.02,
    'die Regler wirken sofort (Tonlage, Härte baut die Sättigung neu, Stein-Puffer neu, Rauheit, Brummen, Helligkeit)',
    `Grundton ${r.f0Vor.toFixed(0)} -> ${r.f0Nach.toFixed(0)} Hz, Kurve ${r.kurve.map((x) => x.toFixed(3)).join(' -> ')}, Rauheit ${r.rauh.toFixed(3)}, Brummen ${r.unter.toFixed(2)}, Tiefpass ${r.filter.toFixed(0)} Hz`);
  pruefe(zeilen.length === 6 && zeilen.every((z) => /^audio\.[\w.]+(\[\d+\])? = -?\d+(\.\d+)?$/.test(z)) && zeilen.includes('audio.motor.verzerrung = 9.5') && zeilen.includes('audio.aufprall.klang.stein.knall[2] = 3000'),
    'WERTE KOPIEREN: eine Zeile pro geändertem Wert im Format audio.motor.verzerrung = 9.5', zeilen.join(' | '));
  pruefe(r.zurueck.every(Boolean) && Math.abs(r.f0Zurueck - r.f0Vor) < 2, 'ALLES ZURÜCK: alle Werte wie in config.js');
  // Spielseite unberührt: CONFIG.audio im Spiel = config.js
  const spielSeite = await spiel.page.context().browser().newPage();
  await spielSeite.goto(`${spiel.url}/index.html?menue=aus`);
  await spielSeite.waitForFunction(() => window.__alpineRally, null, { timeout: 120000 });
  const imSpiel = await spielSeite.evaluate(() => JSON.stringify(window.__alpineRally.CONFIG.audio));
  const { CONFIG: ORIGINAL } = await import(path.join(WURZEL, 'js/config.js'));
  pruefe(imSpiel === JSON.stringify(ORIGINAL.audio) && r.audio === JSON.stringify(ORIGINAL.audio), 'Spielseite unberührt: CONFIG.audio im Spiel = config.js (auch das Labor nach ALLES ZURÜCK)');
  pruefe(spiel.fehler.length === 0, 'keine Fehler in der Konsole', spiel.fehler.join(' | '));
  await spiel.schliessen();
}

console.log('M7a.1 (k) Pause und Menü (dazu Teil 1 (f)), (l) Stimmen, Lecks, Texte (Teil 1 (h), (k))');
{
  const spiel = await lade();
  const p = spiel.page;
  await A(p, () => { const A = window.__alpineRally; A.start({ countdown: false }); A.testEingabe = { gas: 1 }; });
  await p.waitForFunction(() => window.__alpineRally.getriebe.drehzahl > 4500, null, { timeout: 60000 });
  await A(p, () => { const A = window.__alpineRally, w = A.ton.werk; w.salve(); w.knall(0.05, 1); A.pausieren(); });
  await bilderAbwarten(p, 3); await warte(450); // (wie Teil 1 (f): die Spielschleife meldet die Pause im nächsten Bild)
  const r = await A(p, async () => {
    const A = window.__alpineRally, w = A.ton.werk;
    const pause = { motor: w.knoten.motorAus.gain.value };
    A.weiter(); A.testEingabe = null;
    await new Promise((r) => setTimeout(r, 450));
    A.zumHauptmenue();
    await new Promise((r) => setTimeout(r, 1500));
    return { pause, menue: { motor: w.knoten.motorAus.gain.value, stimmen: w.stimmen, modus: w.zustand.modus } };
  });
  pruefe(r.pause.motor < 0.02, 'Pause während einer Pop-Salve: Motor und Pops stumm (laufen über den Motor-Ausgang)', `Motor-Ausgang ${r.pause.motor.toFixed(3)}`);
  pruefe(r.menue.motor < 1e-3 && r.menue.stimmen === 0 && r.menue.modus === 'aus', 'Hauptmenü (Demo-Fahrt): stumm, keine Stimme hängt');
  pruefe(spiel.fehler.length === 0, 'keine Fehler in der Konsole', spiel.fehler.join(' | '));
  await spiel.schliessen();
}

console.log(fehlerZahl ? `\n${fehlerZahl} Prüfung(en) FEHLGESCHLAGEN` : '\nAlle Prüfungen bestanden.');
process.exit(fehlerZahl ? 1 : 0);
