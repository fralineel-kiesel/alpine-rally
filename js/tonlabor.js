// Ton-Labor (M7a): Hilfsseite zum Anhören aller Töne, ohne zu fahren (ton-labor.html, nicht im Menü verlinkt).
// Benutzt dasselbe js/audio.js wie das Spiel. Die Schieberegler ersetzen die Zahlen, die sonst main.js liefert.
// M7a.1: Regler Signaltöne und Bereich "Feinschliff": Werte aus config.js live verstellen (nur auf dieser Seite, nur bis zum
// Neuladen; das Spiel lädt seine eigene config.js), WERTE KOPIEREN für den Chat, ALLES ZURÜCK.
// M7b: Bereich "Umgebung" (eine Quelle, Hörer im Abstand und Winkel daneben, VORBEIFAHREN mit 90 km/h in 15 m Abstand)
// und "Musik" (Abschnitte, Art, Tempo, Kanäle stumm, Regler Musik); Feinschliff um Umgebung und Musik erweitert.
// M8b: Schalter ECHTER LADEDRUCK AN (Ton wie im Audan Quarto: Pfeifen, Blow-off und Pops folgen dem Ladedruck des
// Getriebes) mit Regler LADEDRUCK (Test); beim Anfahren liefert das echte Getriebe mit Turbo den Ladedruck.
// M8c: Auswahl FAHRPROFIL (TON): dieselben Werte wie im Spiel (Turbo an/aus des Getriebes, turboMal, knallMal), z. B.
// Fard Escorta (kein Turbo: kein Pfeifen, kein Blow-off, halb so viele Pops) gegen Audan Quarto. Standard: prototyp.
// M8d: Motorklang je Auto. FAHRPROFIL (TON) schaltet auch den Motorklang um (Block ton.motor im Fahrprofil). Der
// Feinschliff der Motorwerte wirkt auf das gewählte Profil (Regler zeigen den Wert dieses Autos), WERTE KOPIEREN nennt das
// Profil in jeder Zeile (fahrprofile.delto.ton.motor.rauh = 0.45), ALLES ZURÜCK nur für das gewählte Profil.
// Knopf VERGLEICH: dieselbe kurze Fahrt (js/tonfahrt.js) nacheinander mit Audan, Delto, Escorta; je Auto ein Knopf.

import { CONFIG } from './config.js';
import { baueTon, materialNr } from './audio.js';
import { raumWerte } from './umgebung.js';
import { HAUPT_STUECK, KANAELE } from './musik.js';
import { Getriebe } from './getriebe.js';
import { waehleFahrprofil, waehleMotorTon, aktivesProfil, tonWerte, motorReferenz } from './fahrprofil.js';
import { AUTO_MODELLE } from './autos.js';
import { baueTonFahrt, TON_FAHRT } from './tonfahrt.js';

const G = CONFIG.getriebe, A = CONFIG.audio;
const $ = (id) => document.getElementById(id);
const ton = baueTon({ an: true });
window.__tonLabor = { ton, CONFIG }; // für tools/ton-test.mjs

// Zustand wie im Spiel (tonZ in main.js)
const z = {
  modus: 'rennen', drehzahl: G.leerlauf, gang: 1, zielGang: 1, schaltet: false, gas: 0, bremse: 0, tempo: 0, vVor: 0, untergrund: 'asphalt',
  drift: 0, handbremse: false, aufprall: 0, aufprallArt: 0, kontaktArt: -1, kontaktTempo: 0,
  musikModus: 'aus', hx: 0, hz: -10, hyaw: 0, s: 500, // M7b: Hörer (die Quelle steht im Ursprung)
  ladedruck: 0, turboAn: false, // M8b
  turboMal: 1, knallMal: 1, // M8c: aus dem gewählten Fahrprofil
};
// M8c: Fahrprofil für den Ton (Standard prototyp = wie bisher). Setzt das Getriebe (Turbo an/aus) und ECHTER LADEDRUCK.
waehleFahrprofil('prototyp');
for (const id of Object.keys(CONFIG.fahrprofile)) {
  $('tonProfil').insertAdjacentHTML('beforeend', `<option value="${id}">${AUTO_MODELLE[id] ? AUTO_MODELLE[id].name : id.toUpperCase()}</option>`);
}
function tonProfil(id) {
  waehleFahrprofil(id);
  ton.motorNeu(); // M8d: Motorklang dieses Autos (feste Teile, Motor-Puffer)
  $('tonProfil').value = aktivesProfil();
  $('echterLadedruck').checked = !!G.turbo.an;
  z.turboMal = tonWerte.turboMal; z.knallMal = tonWerte.knallMal;
  $('tonProfilW').textContent = `TURBO ${G.turbo.an ? 'AN' : 'AUS'} · turboMal ${z.turboMal} · knallMal ${z.knallMal}`;
  if (feinBereit) feinProfilZeigen();
}
let feinBereit = false; // (M8d: die Feinschliff-Regler gibt es erst weiter unten)
const autoName = (id) => (AUTO_MODELLE[id] ? AUTO_MODELLE[id].name : id.toUpperCase());
let schaltRest = 0, schaltVon = 0, schaltHoch = true, demo = null;

// --- Regler ---
const drehzahl = $('drehzahl');
drehzahl.min = G.leerlauf; drehzahl.max = A.motor.hoechstDrehzahl; drehzahl.value = G.leerlauf;
const anzeigen = () => {
  $('drehzahlW').textContent = `${Math.round(+drehzahl.value)} /min`;
  $('gasW').textContent = `${Math.round(+$('gas').value * 100)} %`;
  $('tempoW').textContent = `${$('tempo').value} km/h`;
  $('driftW').textContent = `${$('drift').value}°`;
  $('lautW').textContent = `${$('laut').value} %`;
  $('signaleW').textContent = `${$('signale').value} %`;
  $('ladedruckW').textContent = `${Math.round(+$('ladedruck').value * 100)} %`;
  $('echterLadedruckW').textContent = $('echterLadedruck').checked ? 'AN' : 'AUS';
};
for (const id of ['drehzahl', 'gas', 'tempo', 'drift', 'laut', 'signale', 'ladedruck']) $(id).addEventListener('input', () => { demo = null; anzeigen(); });
// M8b: Turbo wie im Fahrprofil des Audan Quarto (nur auf dieser Seite: das Getriebe fürs Anfahren baut dann Ladedruck auf)
$('echterLadedruck').addEventListener('change', () => { G.turbo.an = $('echterLadedruck').checked; anzeigen(); });
$('laut').addEventListener('input', () => ton.lautstaerke(+$('laut').value));
$('tonProfil').addEventListener('change', () => { tonProfil($('tonProfil').value); anzeigen(); });
tonProfil('prototyp');
// Regler Signaltöne (M7a.1, wie im Spiel): danach der Regler-Tick, damit man die neue Stärke hört
$('signale').addEventListener('input', () => { ton.signalLautstaerke(+$('signale').value); if (ton.werk) ton.werk.menue('regler', +$('signale').value / 100); });
anzeigen();
for (const [i, m] of A.aufprall.materialien.entries()) $('schleifen').insertAdjacentHTML('beforeend', `<option value="${i}">${m}</option>`);

// --- Aufprall-Knöpfe: je Material leicht / mittel / hart ---
const NAMEN = { baum: 'Baum', stein: 'Stein', holz: 'Holz (Zaun)', weich: 'Weich (Stroh, Reifen, Band)', metall: 'Metall (Leitplanke)', fels: 'Felswand' };
for (const m of A.aufprall.materialien) {
  const b = document.createElement('b'); b.textContent = NAMEN[m] || m; $('aufprallKnoepfe').append(b);
  for (const [text, wucht] of [['leicht', 2.5], ['mittel', 7], ['hart', 16]]) {
    const k = document.createElement('button'); k.textContent = text; k.dataset.tu = `aufprall:${m}:${wucht}`;
    $('aufprallKnoepfe').append(k);
  }
}

// --- Knöpfe ---
function tu(was) {
  const w = ton.werk;
  if (!w) return;
  if (was.startsWith('aufprall:')) { const [, m, wucht] = was.split(':'); w.zustand.letzterAufprall = -1e9; w.aufprall(+wucht, materialNr(m)); return; }
  if (was.startsWith('m-')) { w.menue(was.slice(2), was === 'm-regler' ? Math.random() : 0); return; }
  if (was.startsWith('cp')) { w.checkpoint(+was.slice(2)); return; }
  switch (was) {
    case 'blowOff': if (z.turboMal > 0) { w.zustand.druck = Math.max(w.zustand.druck, 0.9); w.blowOff(false, z.turboMal); } break; // M8c: ohne Turbo nichts
    case 'knall': w.knall(0, 1); break;
    case 'salve': w.salve(z.turboAn && z.ladedruck >= A.motor.blowOffAb, z.knallMal); break; // M8b: mit Anti-Lag etwas öfter (M8c: mal knallMal)
    case 'schalten': schaltRest = G.schaltDauerHoch; schaltVon = +drehzahl.value; schaltHoch = true; break;
    case 'runterschalten': schaltRest = G.schaltDauerRunter; schaltVon = +drehzahl.value; schaltHoch = false; break;
    case 'countdown': w.countdown(); break;
    case 'go': w.go(); break;
    case 'verpasst': w.verpasst(); break;
    case 'fanfareKurz': w.fanfare(false); break;
    case 'fanfareLang': w.fanfare(true); break;
    case 'paceNote': w.paceNote(1); break;
    case 'pause': w.pauseTon(true); break;
    case 'weiter': w.pauseTon(false); break;
    case 'beschleunigen': demo = { getriebe: new Getriebe(), v: 0, phase: 'gas', zeit: 0 }; $('modus').value = 'rennen'; break;
    case 'stopp':
      demo = null; drehzahl.value = G.leerlauf; $('gas').value = 0; $('tempo').value = 0; $('drift').value = 0; $('ladedruck').value = 0;
      $('handbremse').checked = false; $('rueckwaerts').checked = false; $('schleifen').value = -1; anzeigen(); w.allesAus(); break;
    default:
  }
}
document.body.addEventListener('click', (e) => { const k = e.target.closest('[data-tu]'); if (k) tu(k.dataset.tu); });

$('tonStarten').addEventListener('click', () => {
  ton.entsperren();
  ton.musikLautstaerke(+$('mPegel').value);
  umgebungSetzen();
  ton.lautstaerke(+$('laut').value);
  ton.signalLautstaerke(+$('signale').value);
  $('alles').classList.remove('aus');
  $('tonStarten').textContent = 'TON LÄUFT';
});

// --- Umgebung (M7b): eine Quelle im Ursprung, je nach Klangart; der Hörer steht im Abstand und Winkel daneben ---
const U = A.umgebung;
let vorbei = null; // VORBEIFAHREN: { t } (Sekunden seit Beginn)
function umgebungSetzen() {
  const art = $('uArt').value, q = { herden: [], orte: [], brunnen: null, voegel: { dichte: new Float32Array(1001).fill(art === 'voegel' ? 1 : 0), fehlen: [], namen: [] }, pass: null, laenge: 1000 };
  if (art === 'glocken') q.herden.push({ nr: 0, x: 0, z: 0, r: 3, anzahl: 6, posen: [0, 6, 0], kuehe: Float32Array.from([0, 0, 1, 2, 1, 1, -2, 1, 1, 1, -2, 1, -1, 2, 0, 2, -2, 1]) });
  if (art === 'gemurmel') q.orte.push({ name: 'ziel', staerke: 1, punkte: Float32Array.from([0, 0]), sVon: -1e9, sBis: -1e9, fan: false });
  if (art.startsWith('jubel') || art === 'klatschen') q.orte.push({ name: 'ziel', staerke: 1, punkte: Float32Array.from([0, 0]), sVon: -1e9, sBis: -1e9, fan: false, murmeln: false });
  if (art === 'brunnen') q.brunnen = { x: 0, z: 0 };
  if (art === 'boeen') q.pass = { von: 0, bis: 1000 };
  ton.quellen(q);
}
// Hörer aus Abstand und Seite: die Quelle liegt im Winkel "Seite" zur Blickrichtung (Blick nach +z)
function hoererSetzen() {
  const d = +$('uAbstand').value, w = +$('uSeite').value * Math.PI / 180;
  z.hyaw = 0;
  if (vorbei) { // 90 km/h (25 m/s) gerade vorbei, 15 m seitlich (Seite < 0: Quelle links, sonst rechts)
    const seite = +$('uSeite').value < 0 ? -1 : 1;
    z.hx = 15 * seite; z.hz = -100 + 25 * vorbei.t; z.tempo = 25;
  } else { z.hx = d * Math.sin(w); z.hz = -d * Math.cos(w); }
}
const uAnzeigen = () => { $('uAbstandW').textContent = `${$('uAbstand').value} m`; $('uSeiteW').textContent = `${$('uSeite').value}°`; };
for (const id of ['uAbstand', 'uSeite']) $(id).addEventListener('input', () => { vorbei = null; uAnzeigen(); });
$('uArt').addEventListener('change', () => { vorbei = null; umgebungSetzen(); });
uAnzeigen();
function einmalAbspielen() {
  const w = ton.werk, art = $('uArt').value;
  if (!w) return;
  if (art === 'jubelKurz') w.umgebung.jubel('ziel', 'kurz');
  else if (art === 'jubelLang') w.umgebung.jubel('ziel', 'lang');
  else if (art === 'klatschen') w.umgebung.klatschen('ziel');
  else if (art === 'glocken') w.umgebung.glockenSchlag(0, 0);
  else if (art === 'voegel') { // ein Vogel genau an der eingestellten Stelle (Quelle im Ursprung)
    raumWerte(z.hx, z.hz, z.hyaw, 0, 0, U.voegel, w.umgebung.raum);
    w.umgebung.einmal('vogel', `u-vogel-${Math.floor(Math.random() * 8)}`, 0, 1, U.voegel.pegel / 0.9, U.voegel);
  }
}
$('uSpielen').addEventListener('click', einmalAbspielen);
// VORBEIFAHREN: bei Jubel, Klatschen, Vögel kommt der Klang, wenn das Auto 25 m vor der Quelle ist
$('uVorbei').addEventListener('click', () => { vorbei = { t: 0, ausgeloest: false }; });
$('uStopp').addEventListener('click', () => { vorbei = null; $('uArt').value = 'aus'; umgebungSetzen(); if (ton.werk) ton.werk.umgebung.allesAus(); });
const raumAnzeige = { d: 0, pan: 0, gain: 0, tiefpass: 0, winkel: 0 };

// --- Musik (M7b) ---
for (const a of HAUPT_STUECK().abschnitte) $('mAbschnitt').insertAdjacentHTML('beforeend', `<option value="${a.name}">${a.name} (Takt ${a.takt + 1}-${a.takt + a.takte})</option>`);
for (const [k, name] of KANAELE.entries()) {
  $('mKanaele').insertAdjacentHTML('beforeend', `<label><input type="checkbox" id="mStumm${k}"> ${['Lead', 'Arpeggio', 'Bass', 'Schlagzeug'][k]}</label>`);
  $(`mStumm${k}`).addEventListener('change', (e) => { if (ton.werk) ton.werk.musik.stumm(name, e.target.checked); });
}
const mAnzeigen = () => { $('mTempoW').textContent = `${$('mTempo').value} BPM`; $('mPegelW').textContent = `${$('mPegel').value} %`; };
mAnzeigen();
function musikSpielen() {
  const w = ton.werk;
  if (!w) return;
  w.musik.tempo(+$('mTempo').value);
  for (let k = 0; k < 4; k++) w.musik.stumm(k, $(`mStumm${k}`).checked);
  const art = $('mArt').value;
  w.musik.starte(art, art === 'ziel' ? 'Ausklang' : $('mAbschnitt').value);
}
$('mSpielen').addEventListener('click', musikSpielen);
$('mAbschnitt').addEventListener('change', () => { if (ton.werk && ton.werk.musik.status().laeuft) musikSpielen(); });
$('mArt').addEventListener('change', () => { if (ton.werk && ton.werk.musik.status().laeuft) musikSpielen(); });
$('mStopp').addEventListener('click', () => { if (ton.werk) ton.werk.musik.stoppe(0.3); });
$('mTempo').addEventListener('input', () => { mAnzeigen(); if (ton.werk) ton.werk.musik.tempo(+$('mTempo').value); });
$('mPegel').addEventListener('input', () => { mAnzeigen(); ton.musikLautstaerke(+$('mPegel').value); if (ton.werk) ton.werk.menue('regler', +$('mPegel').value / 100); });

// --- Pegel-Anzeige ---
const BUSSE = ['master', 'fahrzeug', 'umgebung', 'signale', 'musik'];
for (const b of BUSSE) $('pegel').insertAdjacentHTML('beforeend', `<div class="pegel">${b}<div class="balken"><div id="p-${b}"></div></div><span id="pw-${b}">-</span></div>`);
const spitzen = {}, halten = {};

// --- M8d: VERGLEICH – dieselbe kurze Fahrt (js/tonfahrt.js) mit jedem Auto nacheinander (oder einem Auto allein) ---
// Vor jedem Auto 0.6 s Stille (Motor aus): dort wird der Motorklang umgeschaltet (wie im Spiel nur bei stillem Motor)
const VERGLEICH_AUTOS = ['rt4', 'delto', 'escorta'];
let vergleich = null; // { liste, i, phase: 'pause' | 'fahrt', t, fahrt, vorher (Profil vorher) }
function vergleichStarten(liste) {
  if (!ton.werk) return;
  demo = null; schaltRest = 0;
  vergleich = { liste, i: 0, phase: 'pause', t: 0, fahrt: null, vorher: aktivesProfil(), gehoert: [] };
  ton.werk.allesAus();
  tonProfil(liste[0]);
  $('vergleichName').textContent = `${autoName(liste[0])} …`;
}
function vergleichBild(dt) {
  const V = vergleich;
  V.t += dt;
  if (V.phase === 'pause') {
    if (V.t >= 0.6) { V.phase = 'fahrt'; V.t = 0; V.fahrt = baueTonFahrt(Getriebe); V.gehoert.push(V.liste[V.i]); $('vergleichName').textContent = autoName(V.liste[V.i]); }
    return;
  }
  const f = V.fahrt.schritt(dt);
  drehzahl.value = f.drehzahl; $('gas').value = f.gas; $('tempo').value = Math.round(f.tempo * 3.6); $('ladedruck').value = f.ladedruck;
  z.schaltet = f.schaltet; z.gang = f.gang; z.zielGang = f.zielGang;
  $('vergleichInfo').textContent = `${f.phase.toUpperCase()} · ${f.gang}. Gang · ${Math.round(f.drehzahl)} /min · ${Math.round(f.tempo * 3.6)} km/h`;
  anzeigen();
  if (V.t >= TON_FAHRT.dauer) {
    V.i++;
    if (V.i >= V.liste.length) {
      vergleich = null;
      drehzahl.value = G.leerlauf; $('gas').value = 0; $('tempo').value = 0; $('ladedruck').value = 0; anzeigen();
      $('vergleichName').textContent = `fertig (${V.liste.map(autoName).join(', ')})`; $('vergleichInfo').textContent = '';
      zuletzt = V;
      tonProfil(V.vorher);
      return;
    }
    V.phase = 'pause'; V.t = 0;
    tonProfil(V.liste[V.i]);
    $('vergleichName').textContent = `${autoName(V.liste[V.i])} …`;
  }
}
let zuletzt = null; // (für Tests: der letzte fertige Vergleich)
$('vergleich').addEventListener('click', () => vergleichStarten(VERGLEICH_AUTOS));
for (const id of VERGLEICH_AUTOS) {
  const k = document.createElement('button'); k.textContent = `NUR ${autoName(id)}`; k.dataset.vergleich = id;
  k.addEventListener('click', () => vergleichStarten([id]));
  $('vergleichKnoepfe').append(k);
}
$('vergleichStopp').addEventListener('click', () => {
  if (!vergleich) return;
  const vorher = vergleich.vorher; vergleich = null;
  drehzahl.value = G.leerlauf; $('gas').value = 0; $('tempo').value = 0; anzeigen();
  if (ton.werk) ton.werk.allesAus();
  tonProfil(vorher);
  $('vergleichName').textContent = 'gestoppt'; $('vergleichInfo').textContent = '';
});
window.__tonLabor.vergleich = { starten: vergleichStarten, get laeuft() { return vergleich; }, get zuletzt() { return zuletzt; }, AUTOS: VERGLEICH_AUTOS };

// --- Jedes Bild: Regler -> Zustand -> Ton ---
let letzte = performance.now();
function bild(jetzt) {
  requestAnimationFrame(bild);
  const dt = Math.min(0.1, (jetzt - letzte) / 1000);
  letzte = jetzt;
  const w = ton.werk;
  if (!w) return;
  z.modus = $('modus').value;
  if (vergleich) vergleichBild(dt);
  else if (demo) {
    // Anfahren mit dem echten Getriebe (Automatik, Schaltpausen) und einer einfachen Fahrt: Gas bis 160 km/h, dann ausrollen
    const e = { gas: demo.phase === 'gas' ? 1 : 0, bremse: 0 };
    const m = demo.getriebe.schritt(dt, e, demo.v, demo.v, 1);
    demo.v = Math.max(0, demo.v + (m.beschl - m.motorbremse * (e.gas ? 0 : 1) - 0.0004 * demo.v * demo.v - 0.15) * dt);
    if (demo.phase === 'gas' && demo.v * 3.6 >= 160) demo.phase = 'aus';
    if (demo.phase === 'aus' && demo.v < 2) demo = null;
    if (demo) {
      drehzahl.value = demo.getriebe.drehzahl; $('gas').value = e.gas; $('tempo').value = Math.round(demo.v * 3.6);
      $('ladedruck').value = demo.getriebe.ladedruck; // M8b: echter Ladedruck (0 ohne ECHTER LADEDRUCK AN)
      z.schaltet = demo.getriebe.schaltet; z.gang = demo.getriebe.gang; z.zielGang = demo.getriebe.zielGang;
      anzeigen();
    }
  } else {
    // "Hochschalten": Schaltpause mit Drehzahl-Abfall (wie vom 2. in den 3. Gang), danach wieder wie vorher.
    // "Runterschalten": Drehzahl steigt (wie vom 3. in den 2. Gang), beim Einlegen Zwischengas und Klack
    z.schaltet = schaltRest > 0;
    z.gang = $('rueckwaerts').checked ? -1 : schaltHoch ? 2 : 3;
    z.zielGang = $('rueckwaerts').checked ? -1 : schaltRest > 0 ? (schaltHoch ? 3 : 2) : z.gang;
    if (schaltRest > 0) {
      schaltRest -= dt;
      const ziel = schaltHoch ? schaltVon * G.gaenge[1] / G.gaenge[2] : Math.min(A.motor.hoechstDrehzahl, schaltVon * G.gaenge[2] / G.gaenge[1]);
      drehzahl.value = ziel + (+drehzahl.value - ziel) * Math.exp(-dt * G.drehzahlFolgenSchalten);
      if (schaltRest <= 0) drehzahl.value = schaltVon;
      anzeigen();
    }
  }
  if (vergleich) z.modus = vergleich.phase === 'fahrt' ? 'rennen' : 'aus';
  z.drehzahl = +drehzahl.value; z.gas = +$('gas').value; z.tempo = +$('tempo').value / 3.6;
  z.turboAn = $('echterLadedruck').checked; z.ladedruck = +$('ladedruck').value; // M8b
  z.vVor = $('rueckwaerts').checked ? -z.tempo : z.tempo;
  if ($('rueckwaerts').checked && !demo) { z.gang = -1; z.zielGang = -1; }
  z.untergrund = $('untergrund').value; z.drift = +$('drift').value; z.handbremse = $('handbremse').checked;
  z.kontaktArt = +$('schleifen').value; z.kontaktTempo = z.tempo;
  z.aufprall = 0;
  // Umgebung: Hörer setzen (VORBEIFAHREN dauert 8 s; einmalige Klänge 25 m vor der Quelle)
  if (vorbei) {
    vorbei.t += dt;
    if (!vorbei.ausgeloest && z.hz > -25) { vorbei.ausgeloest = true; einmalAbspielen(); }
    if (vorbei.t > 8) vorbei = null;
  }
  hoererSetzen();
  if (!vorbei && !demo && !vergleich) z.tempo = +$('tempo').value / 3.6;
  raumWerte(z.hx, z.hz, z.hyaw, 0, 0, uTyp(), raumAnzeige);
  ton.aktualisiere(dt, z);
  // Anzeige
  w.spitzen(spitzen);
  for (const b of BUSSE) {
    halten[b] = Math.max(spitzen[b], (halten[b] || 0) - dt * 0.6);
    const el = $(`p-${b}`);
    el.style.width = `${Math.min(100, halten[b] * 100)}%`;
    el.className = halten[b] > 0.95 ? 'rot' : '';
    $(`pw-${b}`).textContent = halten[b].toFixed(2);
  }
  const ms = w.musik.status(), uz = w.umgebung.zustand;
  $('mAnzeige').textContent = ms.laeuft
    ? `läuft: ${ms.abschnitt}, Takt ${ms.taktImAbschnitt} (gesamt ${ms.takt} von ${w.musik.zustand.liste.takte}), ${ms.bpm} BPM, Art ${ms.art}${ms.ausblenden ? ' (blendet aus)' : ''}`
    : 'Musik steht.';
  $('uAnzeige').textContent = [
    `Abstand ${raumAnzeige.d.toFixed(1)} m, Winkel ${(raumAnzeige.winkel * 180 / Math.PI).toFixed(0)}°${vorbei ? ' (VORBEIFAHREN)' : ''}`,
    `Pan ${raumAnzeige.pan.toFixed(2)} (- links, + rechts), Pegel ${(raumAnzeige.gain * 100).toFixed(0)} %, Tiefpass ${raumAnzeige.tiefpass.toFixed(0)} Hz`,
    `Umgebungs-Stimmen ${w.umgebung.stimmen} / ${U.maxStimmen}, Böen ${(uz.boeWert * 100).toFixed(0)} %`,
  ].join('\n');
  const s = w.zustand;
  $('anzeige').textContent = [
    `Grundton      ${s.f0.toFixed(1)} Hz`,
    `Heulen        ${s.heulen > 0 ? `${s.heulenHz.toFixed(0)} Hz` : '-'}`,
    `Ladedruck     ${(s.druck * 100).toFixed(0)} %${z.turboAn ? ' (echter Ladedruck, Pfeifen mal turboPegelMal)' : ' (eigenes Modell aus Gas und Drehzahl)'}`,
    `Begrenzer     ${s.begrenzer > 0 ? 'STOTTERT' : '-'}`,
    `Stimmen       ${w.stimmen} / ${A.maxStimmen}`,
    `Puffer        ${w.aufbau.fertig ? `fertig in ${w.aufbau.ms.toFixed(0)} ms (${w.aufbau.haeppchen} Häppchen, längstes ${w.aufbau.laengstesMs.toFixed(1)} ms)` : 'werden gebaut …'}`,
    `Ton-Zustand   ${ton.zustand}`,
  ].join('\n');
}
requestAnimationFrame(bild);
// Raum-Typ der gewählten Klangart (für die Anzeige)
function uTyp() {
  const art = $('uArt').value;
  return art === 'glocken' ? U.kuhglocken : art === 'gemurmel' ? U.publikum.gemurmel : art === 'voegel' ? U.voegel : art === 'brunnen' ? U.brunnen
    : art === 'boeen' ? { radius: 1e9, referenz: 1e9 } : U.publikum.jubel;
}

// --- Feinschliff (M7a.1): Werte aus config.js live verstellen. pfad = Name in config.js, neu = Teil, der dafür neu gebaut
// werden muss (Sättigungskurve, Stein-Puffer); alles andere liest der Ton ohnehin jedes Bild bzw. bei jedem Ereignis ---
// M8d: alle Werte unter audio.motor gehören zum gewählten Fahrprofil (FAHRPROFIL (TON)); neu: 'motor' = feste Teile des
// Motors neu setzen (Wellenform, Sättigung, Biss, Güten, Anteile, Pop-Puffer)
const FEIN = [
  { pfad: 'audio.motor.zuendFaktor', name: 'Zylinder: Grundton im Leerlauf (5 Zyl. 2.5, 4 Zyl. 2.0)', min: 1, max: 4, schritt: 0.05 },
  { pfad: 'audio.motor.hoechstTon', name: 'Tonlage bei Höchstdrehzahl (Hz)', min: 250, max: 750, schritt: 5 },
  { pfad: 'audio.motor.tonKurve', name: 'Ton-Kurve (mehr = Mitte tiefer, oben steiler)', min: 0.6, max: 2.5, schritt: 0.05 },
  { pfad: 'audio.motor.saege', name: 'Körper: Sägezahn', min: 0, max: 1, schritt: 0.01, neu: 'motor' },
  { pfad: 'audio.motor.puls', name: 'Körper: Impulswelle (Kanten)', min: 0, max: 1, schritt: 0.01, neu: 'motor' },
  { pfad: 'audio.motor.pulsBreite', name: 'Impulsbreite (kleiner = schärfer)', min: 0.04, max: 0.5, schritt: 0.01, neu: 'motor' },
  { pfad: 'audio.motor.unter', name: 'Anteil tiefes Brummen (unter)', min: 0, max: 0.6, schritt: 0.01 },
  { pfad: 'audio.motor.oberwelle', name: 'Brabbeln: 2. Oberwelle', min: 0, max: 0.5, schritt: 0.01, neu: 'motor' },
  { pfad: 'audio.motor.hoch', name: 'Oktav-Schicht (Höhe beim Hochdrehen)', min: 0, max: 1, schritt: 0.01 },
  { pfad: 'audio.motor.amTiefe', name: 'Brabbeln (amTiefe)', min: 0, max: 0.9, schritt: 0.01 },
  { pfad: 'audio.motor.rauh', name: 'Rauheit (heiser)', min: 0, max: 0.8, schritt: 0.01 },
  { pfad: 'audio.motor.rauhOberwelle', name: 'Rauheit: um welche Oberwelle (höher = heller)', min: 2, max: 12, schritt: 0.5, neu: 'motor' },
  { pfad: 'audio.motor.rauhGuete', name: 'Rauheit: Bündelung (kleiner = breiter, heiserer)', min: 0.5, max: 6, schritt: 0.1, neu: 'motor' },
  { pfad: 'audio.motor.verzerrung', name: 'Härte (Verzerrung)', min: 1, max: 14, schritt: 0.1, neu: 'motor' },
  { pfad: 'audio.motor.clip', name: 'Härte: abschneiden bei (kleiner = kantiger)', min: 0.3, max: 1, schritt: 0.01, neu: 'motor' },
  { pfad: 'audio.motor.filterGrund', name: 'Helligkeit im Leerlauf (Hz)', min: 100, max: 1500, schritt: 10 },
  { pfad: 'audio.motor.filterDrehzahl', name: 'Helligkeit pro U/min (Hz)', min: 0, max: 1.5, schritt: 0.01 },
  { pfad: 'audio.motor.filterGas', name: 'Helligkeit unter Gas (Hz)', min: 0, max: 9000, schritt: 100 },
  { pfad: 'audio.motor.bissHz', name: 'Biss: Frequenz (Hz)', min: 800, max: 5000, schritt: 50, neu: 'motor' },
  { pfad: 'audio.motor.bissDb', name: 'Biss: Anhebung (dB)', min: 0, max: 12, schritt: 0.5, neu: 'motor' },
  { pfad: 'audio.motor.pegel', name: 'Motor-Lautstärke', min: 0, max: 1, schritt: 0.01 },
  { pfad: 'audio.motor.turboTonMin', name: 'Turbo-Pfeifen: Tonhöhe bei wenig Ladedruck (Hz)', min: 1000, max: 5000, schritt: 50 },
  { pfad: 'audio.motor.turboTonMax', name: 'Turbo-Pfeifen: Tonhöhe bei vollem Ladedruck (Hz)', min: 2000, max: 9000, schritt: 50 },
  { pfad: 'audio.motor.turboPegel', name: 'Turbo-Pfeifen: Lautstärke', min: 0, max: 0.12, schritt: 0.001 },
  { pfad: 'audio.motor.knallChance', name: 'Knall-Chance (Poppen)', min: 0, max: 1, schritt: 0.05 },
  { pfad: 'audio.motor.pop.mitte', name: 'Pop: Helligkeit (Hz)', min: 800, max: 6000, schritt: 50, neu: 'motor' },
  { pfad: 'audio.motor.knisternChance', name: 'Knister-Chance (leise Mini-Pops)', min: 0, max: 1, schritt: 0.05 },
  { pfad: 'audio.motor.zwischengasKnallChance', name: 'Zwischengas-Knall-Chance', min: 0, max: 1, schritt: 0.05 },
  // M8b: Turbo im Audan Quarto (wirken nur mit ECHTER LADEDRUCK AN bzw. im Spiel mit Turbo-Profil)
  { pfad: 'audio.motor.turboPegelMal', name: 'Turbo-Pfeifen lauter (mal turboPegel)', min: 0, max: 3, schritt: 0.05 },
  { pfad: 'audio.motor.turboKnallPlus', name: 'Mehr Pops mit Anti-Lag (plus Knall-Chance)', min: 0, max: 0.3, schritt: 0.01 },
  { pfad: 'audio.motor.popPegel', name: 'Pop-Lautstärke', min: 0, max: 2, schritt: 0.05 },
  { pfad: 'audio.motor.schaltKnallChance', name: 'Schaltknall-Chance', min: 0, max: 1, schritt: 0.05 },
  { pfad: 'audio.motor.klackPegel', name: 'Klack-Lautstärke', min: 0, max: 1, schritt: 0.02 },
  { pfad: 'audio.aufprall.klang.stein.knall[2]', name: 'Aufprall Stein: Helligkeit (Hz)', min: 500, max: 8000, schritt: 100, neu: 'aufprall-stein' },
  { pfad: 'audio.aufprall.pegel', name: 'Aufprall-Lautstärke gesamt', min: 0, max: 3, schritt: 0.05 },
  { pfad: 'audio.motor.heulenFaktor', name: 'Heulen-Faktor (rückwärts)', min: 2, max: 10, schritt: 0.1 },
  { pfad: 'audio.signale.pegel', name: 'Signale-Pegel', min: 0, max: 2, schritt: 0.05 },
  // M7b: Umgebung und Musik
  { pfad: 'audio.umgebung.kuhglocken.radius', name: 'Glocken-Reichweite (m)', min: 20, max: 150, schritt: 5 },
  { pfad: 'audio.umgebung.kuhglocken.abstand[1]', name: 'Glocken-Dichte: längste Pause (s, kleiner = dichter)', min: 0.6, max: 4, schritt: 0.1 },
  { pfad: 'audio.umgebung.kuhglocken.pegel', name: 'Glocken-Pegel', min: 0, max: 0.5, schritt: 0.002 },
  { pfad: 'audio.umgebung.publikum.gemurmel.pegel', name: 'Gemurmel-Pegel', min: 0, max: 0.1, schritt: 0.0002 },
  { pfad: 'audio.umgebung.publikum.jubel.pegel', name: 'Jubel-Pegel', min: 0, max: 0.6, schritt: 0.002 },
  { pfad: 'audio.umgebung.voegel.dichteFaktor', name: 'Vögel-Dichte (Faktor)', min: 0, max: 3, schritt: 0.05 },
  { pfad: 'audio.umgebung.voegel.pegel', name: 'Vögel-Pegel', min: 0, max: 0.3, schritt: 0.002 },
  { pfad: 'audio.umgebung.brunnen.pegel', name: 'Brunnen-Pegel', min: 0, max: 0.1, schritt: 0.0002 },
  { pfad: 'audio.umgebung.boeen.pegel', name: 'Böen-Pegel', min: 0, max: 0.15, schritt: 0.001 },
  { pfad: 'audio.raum.pan', name: 'Pan-Stärke (links/rechts)', min: 0, max: 1, schritt: 0.05 },
  { pfad: 'audio.raum.tiefpassFern', name: 'Tiefpass in der Ferne (Hz)', min: 300, max: 9000, schritt: 100 },
  { pfad: 'audio.musik.echo.pegel', name: 'Musik: Echo-Pegel', min: 0, max: 0.8, schritt: 0.01, neu: 'musik' },
  { pfad: 'audio.musik.lead', name: 'Musik: Lead-Pegel', min: 0, max: 0.6, schritt: 0.005, neu: 'musik' },
  { pfad: 'audio.musik.bass', name: 'Musik: Bass-Pegel', min: 0, max: 0.3, schritt: 0.005, neu: 'musik' },
  { pfad: 'audio.musik.schlagzeug', name: 'Musik: Schlagzeug-Pegel', min: 0, max: 0.6, schritt: 0.005, neu: 'musik' },
];
// 'audio.aufprall.klang.stein.knall[2]' -> [Objekt, Schlüssel] in CONFIG
function stelle(pfad) {
  const teile = pfad.replace(/\[(\d+)\]/g, '.$1').split('.');
  let o = CONFIG;
  for (let i = 0; i < teile.length - 1; i++) o = o[teile[i]];
  return [o, teile[teile.length - 1]];
}
const stellen = (x) => Math.max(0, -Math.floor(Math.log10(x) + 1e-9));
// M8d: Motorwerte je Fahrprofil. ORIGINAL_PROFILE = die Profile aus config.js (beim Laden); Änderungen landen in
// CONFIG.fahrprofile[profil].ton.motor (nur auf dieser Seite) und werden über die Referenz gelegt (waehleMotorTon)
const kopie = (o) => JSON.parse(JSON.stringify(o));
const ORIGINAL_PROFILE = kopie(CONFIG.fahrprofile);
const lies = (o, pfad) => pfad.split('.').reduce((w, k) => (w == null ? undefined : w[k]), o);
const motorOriginal = (profil, m) => { const w = lies(((ORIGINAL_PROFILE[profil] || {}).ton || {}).motor, m); return w !== undefined ? w : motorReferenz(m); };
const motorJetzt = (profil, m) => { const w = lies(((CONFIG.fahrprofile[profil] || {}).ton || {}).motor, m); return w !== undefined ? w : motorReferenz(m); };
function motorSchreiben(profil, m, wert) {
  const p = CONFIG.fahrprofile[profil];
  if (!p.ton) p.ton = {};
  if (!p.ton.motor) p.ton.motor = {};
  const teile = m.split('.');
  let o = p.ton.motor;
  for (let i = 0; i < teile.length - 1; i++) { if (!o[teile[i]] || typeof o[teile[i]] !== 'object') o[teile[i]] = {}; o = o[teile[i]]; }
  o[teile[teile.length - 1]] = wert;
}
for (const f of FEIN) {
  const [o, k] = stelle(f.pfad);
  if (f.pfad.startsWith('audio.motor.')) f.motor = f.pfad.slice('audio.motor.'.length);
  f.original = o[k];
  f.zeige = (w) => w.toFixed(stellen(f.schritt));
  const id = f.pfad.replace(/[^a-z0-9]/gi, '_');
  $('fein').insertAdjacentHTML('beforeend', `<span>${f.name}</span><span class="pfad">${f.pfad}</span>`
    + `<input type="range" id="f_${id}" min="${f.min}" max="${f.max}" step="${f.schritt}" value="${f.original}">`
    + `<span class="wert" id="fw_${id}"></span><button title="zurück auf ${f.original}" id="fz_${id}">↺</button>`);
  f.regler = $(`f_${id}`); f.wert = $(`fw_${id}`); f.knopf = $(`fz_${id}`);
  f.regler.addEventListener('input', () => feinSetzen(f, +f.regler.value));
  f.knopf.addEventListener('click', () => feinSetzen(f, f.original));
  if (!f.motor) feinSetzen(f, f.original);
}
feinBereit = true;
feinProfilZeigen();
function feinSetzen(f, wert) {
  const [o, k] = stelle(f.pfad);
  if (f.motor) { // M8d: Wert des gewählten Profils (Überschreibung), dann das Profil neu über die Referenz legen
    const profil = aktivesProfil();
    motorSchreiben(profil, f.motor, wert);
    waehleMotorTon(profil);
    if (f.neu === 'motor' && ton.werk) ton.werk.motorNeu(false, true);
  } else o[k] = wert;
  f.regler.value = wert;
  f.wert.textContent = f.zeige(wert);
  f.wert.classList.toggle('geaendert', wert !== f.original);
  if (f.neu === 'musik') { if (ton.werk) ton.werk.musik.pegelSetzen(); } else if (f.neu && f.neu !== 'motor' && ton.werk) ton.werk.neuBauen(f.neu);
}
// M8d: Regler der Motorwerte auf das gewählte Profil stellen (Wert dieses Autos, "geändert" gegen config.js)
function feinProfilZeigen() {
  const profil = aktivesProfil();
  for (const f of FEIN) {
    if (!f.motor) continue;
    f.original = motorOriginal(profil, f.motor);
    const w = stelle(f.pfad)[0][stelle(f.pfad)[1]];
    f.regler.value = w; f.wert.textContent = f.zeige(w);
    f.wert.classList.toggle('geaendert', w !== f.original);
    f.knopf.title = `zurück auf ${f.original} (${autoName(profil)} in config.js)`;
  }
  $('feinProfil').textContent = `Motorwerte von: ${autoName(profil)} (Profil ${profil})`;
}
// Geänderte Werte als Text, eine Zeile pro Wert. Motorwerte mit dem Profil: "fahrprofile.delto.ton.motor.rauh = 0.45"
// (alle Profile, deren Motorwerte hier geändert wurden), sonst wie bisher: "audio.aufprall.pegel = 1.2"
function feinText() {
  const zeilen = [];
  for (const profil of Object.keys(CONFIG.fahrprofile)) {
    for (const f of FEIN) {
      if (!f.motor) continue;
      const w = motorJetzt(profil, f.motor);
      // (verglichen wird, was der Regler zeigt: ein Wert aus config.js zwischen zwei Reglerstufen zählt nicht als geändert)
      if (f.zeige(w) !== f.zeige(motorOriginal(profil, f.motor))) zeilen.push(`fahrprofile.${profil}.ton.motor.${f.motor} = ${f.zeige(w)}`);
    }
  }
  for (const f of FEIN) if (!f.motor && +f.zeige(stelle(f.pfad)[0][stelle(f.pfad)[1]]) !== f.original) zeilen.push(`${f.pfad} = ${f.zeige(stelle(f.pfad)[0][stelle(f.pfad)[1]])}`);
  return zeilen.join('\n');
}
$('kopieren').addEventListener('click', async () => {
  const text = feinText() || '(keine Werte geändert)';
  $('kopieText').value = text;
  $('kopieText').select();
  try { await navigator.clipboard.writeText(text); $('kopieInfo').textContent = 'KOPIERT – jetzt in den Chat einfügen.'; } catch {
    $('kopieInfo').textContent = 'Kopieren ging nicht automatisch: Text unten markieren und kopieren.';
  }
});
// ALLES ZURÜCK (M8d): Motorwerte nur des gewählten Profils auf config.js (die anderen Autos bleiben, wie sie sind), dazu
// die übrigen Werte (Aufprall, Signale, Umgebung, Musik: gehören keinem Auto)
$('allesZurueck').addEventListener('click', () => {
  const profil = aktivesProfil();
  const orig = ORIGINAL_PROFILE[profil] && ORIGINAL_PROFILE[profil].ton;
  if (CONFIG.fahrprofile[profil].ton) CONFIG.fahrprofile[profil].ton.motor = kopie((orig && orig.motor) || {});
  waehleMotorTon(profil);
  if (ton.werk) ton.werk.motorNeu(false, true);
  for (const f of FEIN) if (!f.motor) feinSetzen(f, f.original);
  feinProfilZeigen();
  $('kopieText').value = ''; $('kopieInfo').textContent = `${autoName(profil)}: MOTORWERTE WIE IN CONFIG.JS (übrige Werte auch)`;
});
// Nach TON STARTEN: geänderte Bau-Werte anwenden (vorher gibt es noch kein Klangwerk)
$('tonStarten').addEventListener('click', () => {
  const warte = () => { if (!ton.werk || !ton.werk.aufbau.fertig) { setTimeout(warte, 50); return; } for (const f of FEIN) if (f.neu && f.neu !== 'motor' && f.original !== stelle(f.pfad)[0][stelle(f.pfad)[1]]) { if (f.neu === 'musik') ton.werk.musik.pegelSetzen(); else ton.werk.neuBauen(f.neu); } };
  warte();
});
window.__tonLabor.fein = { FEIN, text: feinText, stelle, profilZeigen: feinProfilZeigen };
