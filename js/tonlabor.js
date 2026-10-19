// Ton-Labor (M7a): Hilfsseite zum Anhören aller Töne, ohne zu fahren (ton-labor.html, nicht im Menü verlinkt).
// Benutzt dasselbe js/audio.js wie das Spiel. Die Schieberegler ersetzen die Zahlen, die sonst main.js liefert.
// M7a.1: Regler Signaltöne und Bereich "Feinschliff": Werte aus config.js live verstellen (nur auf dieser Seite, nur bis zum
// Neuladen; das Spiel lädt seine eigene config.js), WERTE KOPIEREN für den Chat, ALLES ZURÜCK.

import { CONFIG } from './config.js';
import { baueTon, materialNr } from './audio.js';
import { Getriebe } from './getriebe.js';

const G = CONFIG.getriebe, A = CONFIG.audio;
const $ = (id) => document.getElementById(id);
const ton = baueTon({ an: true });
window.__tonLabor = { ton, CONFIG }; // für tools/ton-test.mjs

// Zustand wie im Spiel (tonZ in main.js)
const z = {
  modus: 'rennen', drehzahl: G.leerlauf, gang: 1, zielGang: 1, schaltet: false, gas: 0, bremse: 0, tempo: 0, vVor: 0, untergrund: 'asphalt',
  drift: 0, handbremse: false, aufprall: 0, aufprallArt: 0, kontaktArt: -1, kontaktTempo: 0,
};
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
};
for (const id of ['drehzahl', 'gas', 'tempo', 'drift', 'laut', 'signale']) $(id).addEventListener('input', () => { demo = null; anzeigen(); });
$('laut').addEventListener('input', () => ton.lautstaerke(+$('laut').value));
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
    case 'blowOff': w.zustand.druck = Math.max(w.zustand.druck, 0.9); w.blowOff(); break;
    case 'knall': w.knall(0, 1); break;
    case 'salve': w.salve(); break;
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
      demo = null; drehzahl.value = G.leerlauf; $('gas').value = 0; $('tempo').value = 0; $('drift').value = 0;
      $('handbremse').checked = false; $('rueckwaerts').checked = false; $('schleifen').value = -1; anzeigen(); w.allesAus(); break;
    default:
  }
}
document.body.addEventListener('click', (e) => { const k = e.target.closest('[data-tu]'); if (k) tu(k.dataset.tu); });

$('tonStarten').addEventListener('click', () => {
  ton.entsperren();
  ton.lautstaerke(+$('laut').value);
  ton.signalLautstaerke(+$('signale').value);
  $('alles').classList.remove('aus');
  $('tonStarten').textContent = 'TON LÄUFT';
});

// --- Pegel-Anzeige ---
const BUSSE = ['master', 'fahrzeug', 'umgebung', 'signale', 'musik'];
for (const b of BUSSE) $('pegel').insertAdjacentHTML('beforeend', `<div class="pegel">${b}<div class="balken"><div id="p-${b}"></div></div><span id="pw-${b}">-</span></div>`);
const spitzen = {}, halten = {};

// --- Jedes Bild: Regler -> Zustand -> Ton ---
let letzte = performance.now();
function bild(jetzt) {
  requestAnimationFrame(bild);
  const dt = Math.min(0.1, (jetzt - letzte) / 1000);
  letzte = jetzt;
  const w = ton.werk;
  if (!w) return;
  z.modus = $('modus').value;
  if (demo) {
    // Anfahren mit dem echten Getriebe (Automatik, Schaltpausen) und einer einfachen Fahrt: Gas bis 160 km/h, dann ausrollen
    const e = { gas: demo.phase === 'gas' ? 1 : 0, bremse: 0 };
    const m = demo.getriebe.schritt(dt, e, demo.v, demo.v, 1);
    demo.v = Math.max(0, demo.v + (m.beschl - m.motorbremse * (e.gas ? 0 : 1) - 0.0004 * demo.v * demo.v - 0.15) * dt);
    if (demo.phase === 'gas' && demo.v * 3.6 >= 160) demo.phase = 'aus';
    if (demo.phase === 'aus' && demo.v < 2) demo = null;
    if (demo) {
      drehzahl.value = demo.getriebe.drehzahl; $('gas').value = e.gas; $('tempo').value = Math.round(demo.v * 3.6);
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
  z.drehzahl = +drehzahl.value; z.gas = +$('gas').value; z.tempo = +$('tempo').value / 3.6;
  z.vVor = $('rueckwaerts').checked ? -z.tempo : z.tempo;
  if ($('rueckwaerts').checked && !demo) { z.gang = -1; z.zielGang = -1; }
  z.untergrund = $('untergrund').value; z.drift = +$('drift').value; z.handbremse = $('handbremse').checked;
  z.kontaktArt = +$('schleifen').value; z.kontaktTempo = z.tempo;
  z.aufprall = 0;
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
  const s = w.zustand;
  $('anzeige').textContent = [
    `Grundton      ${s.f0.toFixed(1)} Hz`,
    `Heulen        ${s.heulen > 0 ? `${s.heulenHz.toFixed(0)} Hz` : '-'}`,
    `Ladedruck     ${(s.druck * 100).toFixed(0)} %`,
    `Begrenzer     ${s.begrenzer > 0 ? 'STOTTERT' : '-'}`,
    `Stimmen       ${w.stimmen} / ${A.maxStimmen}`,
    `Puffer        ${w.aufbau.fertig ? `fertig in ${w.aufbau.ms.toFixed(0)} ms (${w.aufbau.haeppchen} Häppchen, längstes ${w.aufbau.laengstesMs.toFixed(1)} ms)` : 'werden gebaut …'}`,
    `Ton-Zustand   ${ton.zustand}`,
  ].join('\n');
}
requestAnimationFrame(bild);

// --- Feinschliff (M7a.1): Werte aus config.js live verstellen. pfad = Name in config.js, neu = Teil, der dafür neu gebaut
// werden muss (Sättigungskurve, Stein-Puffer); alles andere liest der Ton ohnehin jedes Bild bzw. bei jedem Ereignis ---
const FEIN = [
  { pfad: 'audio.motor.hoechstTon', name: 'Tonlage bei Höchstdrehzahl (Hz)', min: 250, max: 750, schritt: 5 },
  { pfad: 'audio.motor.verzerrung', name: 'Härte (Verzerrung)', min: 1, max: 14, schritt: 0.1, neu: 'saettigung' },
  { pfad: 'audio.motor.rauh', name: 'Rauheit', min: 0, max: 0.8, schritt: 0.01 },
  { pfad: 'audio.motor.amTiefe', name: 'Brabbeln (amTiefe)', min: 0, max: 0.9, schritt: 0.01 },
  { pfad: 'audio.motor.filterGas', name: 'Helligkeit unter Gas (Hz)', min: 0, max: 9000, schritt: 100 },
  { pfad: 'audio.motor.unter', name: 'Anteil tiefes Brummen (unter)', min: 0, max: 0.6, schritt: 0.01 },
  { pfad: 'audio.motor.pegel', name: 'Motor-Lautstärke', min: 0, max: 1, schritt: 0.01 },
  { pfad: 'audio.motor.knallChance', name: 'Knall-Chance (Poppen)', min: 0, max: 1, schritt: 0.05 },
  { pfad: 'audio.motor.popPegel', name: 'Pop-Lautstärke', min: 0, max: 2, schritt: 0.05 },
  { pfad: 'audio.motor.schaltKnallChance', name: 'Schaltknall-Chance', min: 0, max: 1, schritt: 0.05 },
  { pfad: 'audio.motor.klackPegel', name: 'Klack-Lautstärke', min: 0, max: 1, schritt: 0.02 },
  { pfad: 'audio.aufprall.klang.stein.knall[2]', name: 'Aufprall Stein: Helligkeit (Hz)', min: 500, max: 8000, schritt: 100, neu: 'aufprall-stein' },
  { pfad: 'audio.aufprall.pegel', name: 'Aufprall-Lautstärke gesamt', min: 0, max: 3, schritt: 0.05 },
  { pfad: 'audio.motor.heulenFaktor', name: 'Heulen-Faktor (rückwärts)', min: 2, max: 10, schritt: 0.1 },
  { pfad: 'audio.signale.pegel', name: 'Signale-Pegel', min: 0, max: 2, schritt: 0.05 },
];
// 'audio.aufprall.klang.stein.knall[2]' -> [Objekt, Schlüssel] in CONFIG
function stelle(pfad) {
  const teile = pfad.replace(/\[(\d+)\]/g, '.$1').split('.');
  let o = CONFIG;
  for (let i = 0; i < teile.length - 1; i++) o = o[teile[i]];
  return [o, teile[teile.length - 1]];
}
const stellen = (x) => Math.max(0, -Math.floor(Math.log10(x) + 1e-9));
for (const f of FEIN) {
  const [o, k] = stelle(f.pfad);
  f.original = o[k];
  f.zeige = (w) => w.toFixed(stellen(f.schritt));
  const id = f.pfad.replace(/[^a-z0-9]/gi, '_');
  $('fein').insertAdjacentHTML('beforeend', `<span>${f.name}</span><span class="pfad">${f.pfad}</span>`
    + `<input type="range" id="f_${id}" min="${f.min}" max="${f.max}" step="${f.schritt}" value="${f.original}">`
    + `<span class="wert" id="fw_${id}"></span><button title="zurück auf ${f.original}" id="fz_${id}">↺</button>`);
  f.regler = $(`f_${id}`); f.wert = $(`fw_${id}`);
  f.regler.addEventListener('input', () => feinSetzen(f, +f.regler.value));
  $(`fz_${id}`).addEventListener('click', () => feinSetzen(f, f.original));
  feinSetzen(f, f.original);
}
function feinSetzen(f, wert) {
  const [o, k] = stelle(f.pfad);
  o[k] = wert;
  f.regler.value = wert;
  f.wert.textContent = f.zeige(wert);
  f.wert.classList.toggle('geaendert', wert !== f.original);
  if (f.neu && ton.werk) ton.werk.neuBauen(f.neu);
}
// Geänderte Werte als Text, eine Zeile pro Wert: "audio.motor.verzerrung = 6.2"
function feinText() {
  return FEIN.filter((f) => +f.zeige(stelle(f.pfad)[0][stelle(f.pfad)[1]]) !== f.original)
    .map((f) => `${f.pfad} = ${f.zeige(stelle(f.pfad)[0][stelle(f.pfad)[1]])}`).join('\n');
}
$('kopieren').addEventListener('click', async () => {
  const text = feinText() || '(keine Werte geändert)';
  $('kopieText').value = text;
  $('kopieText').select();
  try { await navigator.clipboard.writeText(text); $('kopieInfo').textContent = 'KOPIERT – jetzt in den Chat einfügen.'; } catch {
    $('kopieInfo').textContent = 'Kopieren ging nicht automatisch: Text unten markieren und kopieren.';
  }
});
$('allesZurueck').addEventListener('click', () => { for (const f of FEIN) feinSetzen(f, f.original); $('kopieText').value = ''; $('kopieInfo').textContent = 'ALLE WERTE WIE IN CONFIG.JS'; });
// Nach TON STARTEN: geänderte Bau-Werte anwenden (vorher gibt es noch kein Klangwerk)
$('tonStarten').addEventListener('click', () => {
  const warte = () => { if (!ton.werk || !ton.werk.aufbau.fertig) { setTimeout(warte, 50); return; } for (const f of FEIN) if (f.neu && f.original !== stelle(f.pfad)[0][stelle(f.pfad)[1]]) ton.werk.neuBauen(f.neu); };
  warte();
});
window.__tonLabor.fein = { FEIN, text: feinText, stelle };
