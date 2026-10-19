// Ton-Labor (M7a): Hilfsseite zum Anhören aller Töne, ohne zu fahren (ton-labor.html, nicht im Menü verlinkt).
// Benutzt dasselbe js/audio.js wie das Spiel. Die Schieberegler ersetzen die Zahlen, die sonst main.js liefert.

import { CONFIG } from './config.js';
import { baueTon, materialNr } from './audio.js';
import { Getriebe } from './getriebe.js';

const G = CONFIG.getriebe, A = CONFIG.audio;
const $ = (id) => document.getElementById(id);
const ton = baueTon({ an: true });
window.__tonLabor = { ton }; // für tools/ton-test.mjs (Bild der Seite)

// Zustand wie im Spiel (tonZ in main.js)
const z = {
  modus: 'rennen', drehzahl: G.leerlauf, gang: 1, schaltet: false, gas: 0, bremse: 0, tempo: 0, vVor: 0, untergrund: 'asphalt',
  drift: 0, handbremse: false, aufprall: 0, aufprallArt: 0, kontaktArt: -1, kontaktTempo: 0,
};
let schaltRest = 0, schaltVon = 0, demo = null;

// --- Regler ---
const drehzahl = $('drehzahl');
drehzahl.min = G.leerlauf; drehzahl.max = A.motor.hoechstDrehzahl; drehzahl.value = G.leerlauf;
const anzeigen = () => {
  $('drehzahlW').textContent = `${Math.round(+drehzahl.value)} /min`;
  $('gasW').textContent = `${Math.round(+$('gas').value * 100)} %`;
  $('tempoW').textContent = `${$('tempo').value} km/h`;
  $('driftW').textContent = `${$('drift').value}°`;
  $('lautW').textContent = `${$('laut').value} %`;
};
for (const id of ['drehzahl', 'gas', 'tempo', 'drift', 'laut']) $(id).addEventListener('input', () => { demo = null; anzeigen(); });
$('laut').addEventListener('input', () => ton.lautstaerke(+$('laut').value));
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
    case 'schalten': schaltRest = G.schaltDauerHoch; schaltVon = +drehzahl.value; break;
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
      z.schaltet = demo.getriebe.schaltet; z.gang = demo.getriebe.gang;
      anzeigen();
    }
  } else {
    // "Schalten": Schaltpause mit Drehzahl-Abfall (wie vom 2. in den 3. Gang), danach wieder hoch
    z.schaltet = schaltRest > 0;
    if (schaltRest > 0) {
      schaltRest -= dt;
      const ziel = schaltVon * G.gaenge[1] / G.gaenge[2];
      drehzahl.value = ziel + (+drehzahl.value - ziel) * Math.exp(-dt * G.drehzahlFolgenSchalten);
      if (schaltRest <= 0) drehzahl.value = schaltVon;
      anzeigen();
    }
    z.gang = $('rueckwaerts').checked ? -1 : 1;
  }
  z.drehzahl = +drehzahl.value; z.gas = +$('gas').value; z.tempo = +$('tempo').value / 3.6;
  z.vVor = $('rueckwaerts').checked ? -z.tempo : z.tempo;
  if ($('rueckwaerts').checked && !demo) z.gang = -1;
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
    `Ladedruck     ${(s.druck * 100).toFixed(0)} %`,
    `Begrenzer     ${s.begrenzer > 0 ? 'STOTTERT' : '-'}`,
    `Stimmen       ${w.stimmen} / ${A.maxStimmen}`,
    `Puffer        ${w.aufbau.fertig ? `fertig in ${w.aufbau.ms.toFixed(0)} ms (${w.aufbau.haeppchen} Häppchen, längstes ${w.aufbau.laengstesMs.toFixed(1)} ms)` : 'werden gebaut …'}`,
    `Ton-Zustand   ${ton.zustand}`,
  ].join('\n');
}
requestAnimationFrame(bild);
