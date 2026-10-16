// Steuerung: Tastatur und Gamepad gleichzeitig.
// Liefert pro Bild: gas, bremse (0..1), lenkung (-1..1, + = rechts),
// handbremse, und einmalige Tasten-Ereignisse (reset, debug, notes = Pace-Notes an/aus).

import { CONFIG } from './config.js';

const gedrueckt = new Set();
const einmal = new Set(); // Tasten, die seit dem letzten Abfragen neu gedrückt wurden

const SPIELTASTEN = new Set([
  'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyR', 'F3',
  CONFIG.pacenotes.taste,
]);

window.addEventListener('keydown', (e) => {
  if (SPIELTASTEN.has(e.code)) e.preventDefault(); // kein Scrollen, keine Browser-Suche bei F3
  if (!e.repeat) einmal.add(e.code);
  gedrueckt.add(e.code);
});
window.addEventListener('keyup', (e) => gedrueckt.delete(e.code));
window.addEventListener('blur', () => gedrueckt.clear());

let tastaturLenkung = 0;
let startVorher = false;

function totzone(w, tz) {
  const a = Math.abs(w);
  if (a < tz) return 0;
  return Math.sign(w) * Math.min(1, (a - tz) / (1 - tz));
}

export function leseEingabe(dt) {
  const s = CONFIG.steuerung;
  const t = (c) => gedrueckt.has(c);

  // Tastatur
  let gas = t('ArrowUp') || t('KeyW') ? 1 : 0;
  let bremse = t('ArrowDown') || t('KeyS') ? 1 : 0;
  const ziel = (t('ArrowRight') || t('KeyD') ? 1 : 0) - (t('ArrowLeft') || t('KeyA') ? 1 : 0);
  // Tastatur-Lenkung baut sich weich auf (sonst zu ruckartig)
  if (ziel !== 0) {
    if (Math.sign(ziel) !== Math.sign(tastaturLenkung) && tastaturLenkung !== 0) {
      tastaturLenkung += ziel * s.tastaturRueckTempo * dt;
    } else {
      tastaturLenkung += ziel * s.tastaturLenkTempo * dt;
    }
    tastaturLenkung = Math.max(-1, Math.min(1, tastaturLenkung));
  } else {
    const r = s.tastaturRueckTempo * dt;
    tastaturLenkung = Math.abs(tastaturLenkung) <= r ? 0 : tastaturLenkung - Math.sign(tastaturLenkung) * r;
  }
  let lenkung = tastaturLenkung;
  let handbremse = t('Space');
  let reset = einmal.has('KeyR');
  const debug = einmal.has('F3');
  const notes = einmal.has(CONFIG.pacenotes.taste); // Pace-Notes an/aus (M4)
  einmal.clear();

  // Gamepad (Standard-Belegung, Xbox/PlayStation)
  const pads = navigator.getGamepads ? navigator.getGamepads() : [];
  let startJetzt = false;
  for (const p of pads) {
    if (!p || !p.connected) continue;
    const knopf = (i) => (p.buttons[i] ? p.buttons[i].value || (p.buttons[i].pressed ? 1 : 0) : 0);
    const stick = totzone(p.axes[0] || 0, s.totzone);
    if (Math.abs(stick) > Math.abs(lenkung)) lenkung = stick;
    gas = Math.max(gas, knopf(7));           // RT / R2
    bremse = Math.max(bremse, knopf(6));     // LT / L2
    if (knopf(0) > 0.5) handbremse = true;   // A / Kreuz
    if (knopf(9) > 0.5) startJetzt = true;   // Start / Options
  }
  if (startJetzt && !startVorher) reset = true;
  startVorher = startJetzt;

  return { gas, bremse, lenkung, handbremse, reset, debug, notes };
}
