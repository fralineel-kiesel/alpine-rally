// Steuerung: Tastatur und Gamepad gleichzeitig.
// Liefert pro Bild: gas, bremse (0..1), lenkung (-1..1, + = rechts),
// handbremse, und einmalige Tasten-Ereignisse (reset, debug, notes = Pace-Notes an/aus, pause, hud = HUD aus/an seit M6).
// Seit M5a: Tasten frei belegbar (einstellungen.tasten), Lenkempfindlichkeit und Totzone einstellbar,
// Gamepad-Start = Pause (zurück auf die Strasse: Y / Dreieck). Das Menü kann Tasten abfangen.
// Seit M9a: dritte Quelle Touch (js/touch.js schreibt in touchEingabe), wird wie die Tastatur eingemischt.

import { CONFIG } from './config.js';
import { einstellungen, AKTIONEN, beiAenderung } from './einstellungen.js';
import { t } from './texte.js';

const gedrueckt = new Set();
const einmal = new Set(); // Tasten, die seit dem letzten Abfragen neu gedrückt wurden

// Diese Tasten lösen im Browser nichts aus (kein Scrollen, keine Suche bei F3)
const SPIELTASTEN = new Set();
function spieltastenNeu() {
  SPIELTASTEN.clear();
  for (const c of ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'F3', 'Enter', 'Backspace']) SPIELTASTEN.add(c);
  for (const a of AKTIONEN) for (const c of einstellungen.tasten[a]) if (c) SPIELTASTEN.add(c);
}
spieltastenNeu();
beiAenderung((name) => { if (name === 'tasten') spieltastenNeu(); });

// Das Menü kann Tastendrücke abfangen: f(code, wiederholt) gibt true zurück = erledigt (zählt nicht fürs Fahren)
let abfangen = null;
export function setzeAbfangen(f) { abfangen = f; }

window.addEventListener('keydown', (e) => {
  if (SPIELTASTEN.has(e.code) || (abfangen && e.code === 'Tab')) e.preventDefault();
  if (abfangen && abfangen(e.code, e.repeat)) return; // vom Menü erledigt
  if (!e.repeat) einmal.add(e.code);
  gedrueckt.add(e.code);
});
window.addEventListener('keyup', (e) => gedrueckt.delete(e.code));
window.addEventListener('blur', () => gedrueckt.clear());

// Touch-Knöpfe (M9a): js/touch.js setzt die gehaltenen Werte und die einmaligen Ereignisse (immer dasselbe Objekt)
export const touchEingabe = {
  gas: false, bremse: false, links: false, rechts: false, handbremse: false, // gehalten
  reset: false, pause: false, hud: false, notes: false,                       // einmalig (bis zum nächsten Abfragen)
};
function touchEreignisseLeeren() {
  touchEingabe.reset = false; touchEingabe.pause = false; touchEingabe.hud = false; touchEingabe.notes = false;
}

// Beim Wechsel ins Rennen: alte Tastendrücke vergessen
export function eingabeLeeren() {
  einmal.clear();
  touchEreignisseLeeren();
  tastaturLenkung = 0;
}

// --- Gamepad: einmal pro Bild abfragen (aktualisierePad), für Rennen und Menü ---
const PAD_N = 17;
export const pad = {
  da: false, gedrueckt: new Uint8Array(PAD_N), neu: new Uint8Array(PAD_N), wert: new Float32Array(PAD_N),
  achseX: 0, achseY: 0, irgendeinNeu: false,
};
const padVorher = new Uint8Array(PAD_N);
export function aktualisierePad() {
  pad.gedrueckt.fill(0); pad.wert.fill(0);
  pad.achseX = 0; pad.achseY = 0; pad.da = false;
  const pads = navigator.getGamepads ? navigator.getGamepads() : [];
  for (const p of pads) {
    if (!p || !p.connected) continue;
    pad.da = true;
    for (let i = 0; i < PAD_N && i < p.buttons.length; i++) {
      const b = p.buttons[i];
      const v = b ? b.value || (b.pressed ? 1 : 0) : 0;
      if (v > pad.wert[i]) pad.wert[i] = v;
      if (v > 0.5) pad.gedrueckt[i] = 1;
    }
    const ax = p.axes[0] || 0, ay = p.axes[1] || 0;
    if (Math.abs(ax) > Math.abs(pad.achseX)) pad.achseX = ax;
    if (Math.abs(ay) > Math.abs(pad.achseY)) pad.achseY = ay;
  }
  pad.irgendeinNeu = false;
  for (let i = 0; i < PAD_N; i++) {
    pad.neu[i] = pad.gedrueckt[i] && !padVorher[i] ? 1 : 0;
    if (pad.neu[i]) pad.irgendeinNeu = true;
    padVorher[i] = pad.gedrueckt[i];
  }
}

let tastaturLenkung = 0;

function totzone(w, tz) {
  const a = Math.abs(w);
  if (a < tz) return 0;
  return Math.sign(w) * Math.min(1, (a - tz) / (1 - tz));
}

export function leseEingabe(dt) {
  const s = CONFIG.steuerung;
  const M = CONFIG.menue;
  const T = einstellungen.tasten;
  const lenkFaktor = M.lenkStufen[einstellungen.lenkStufe] ?? 1;
  const taste = (a) => gedrueckt.has(T[a][0]) || (T[a][1] !== null && gedrueckt.has(T[a][1]));
  const neu = (a) => einmal.has(T[a][0]) || (T[a][1] !== null && einmal.has(T[a][1]));

  // Tastatur (M9a: Touch-Knöpfe zählen wie Tasten, A und D-Pad hoch zusammen sind einfach Gas)
  const tz = touchEingabe;
  let gas = taste('gas') || tz.gas ? 1 : 0;
  let bremse = taste('bremse') || tz.bremse ? 1 : 0;
  const ziel = (taste('rechts') || tz.rechts ? 1 : 0) - (taste('links') || tz.links ? 1 : 0);
  // Tastatur-Lenkung baut sich weich auf (sonst zu ruckartig); Lenkempfindlichkeit = wie schnell
  // (M9a: das D-Pad lenkt über genau denselben weichen Aufbau)
  if (ziel !== 0) {
    if (Math.sign(ziel) !== Math.sign(tastaturLenkung) && tastaturLenkung !== 0) {
      tastaturLenkung += ziel * s.tastaturRueckTempo * dt;
    } else {
      tastaturLenkung += ziel * s.tastaturLenkTempo * lenkFaktor * dt;
    }
    tastaturLenkung = Math.max(-1, Math.min(1, tastaturLenkung));
  } else {
    const r = s.tastaturRueckTempo * dt;
    tastaturLenkung = Math.abs(tastaturLenkung) <= r ? 0 : tastaturLenkung - Math.sign(tastaturLenkung) * r;
  }
  let lenkung = tastaturLenkung;
  let handbremse = taste('handbremse') || tz.handbremse;
  let reset = neu('zurueck') || tz.reset;
  const debug = einmal.has('F3');
  const notes = neu('notes') || tz.notes; // Pace-Notes an/aus (M4)
  const hud = neu('hud') || tz.hud; // ganzes HUD aus/an (M6: Tastatur, M9a: SELECT)
  let pause = einmal.has('Escape') || tz.pause;
  einmal.clear();
  touchEreignisseLeeren();

  // Gamepad (Standard-Belegung, Xbox/PlayStation; Knöpfe in config.js, menue.gamepad)
  if (pad.da) {
    const G = M.gamepad;
    let stick = totzone(pad.achseX, M.totzonen[einstellungen.totzoneStufe] ?? s.totzone);
    // Lenkempfindlichkeit: Kurve des Sticks (1 = gerade wie bisher, mehr = schon bei wenig Ausschlag stärker)
    if (lenkFaktor !== 1 && stick !== 0) stick = Math.sign(stick) * Math.abs(stick) ** (1 / lenkFaktor);
    if (Math.abs(stick) > Math.abs(lenkung)) lenkung = stick;
    gas = Math.max(gas, pad.wert[G.gas]);
    bremse = Math.max(bremse, pad.wert[G.bremse]);
    if (pad.gedrueckt[G.handbremse]) handbremse = true;
    if (pad.neu[G.zurueck]) reset = true;
    if (pad.neu[G.pause]) pause = true;
  }

  return { gas, bremse, lenkung, handbremse, reset, debug, notes, pause, hud };
}

// --- Namen für die Anzeige ---------------------------------------------------------------------
const PFEILE = { ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→' };
export function tastenName(code) {
  if (!code) return t('tasten.leer');
  if (PFEILE[code]) return PFEILE[code];
  if (/^Key[A-Z]$/.test(code)) return code.slice(3);
  if (/^Digit\d$/.test(code)) return code.slice(5);
  if (/^Numpad\d$/.test(code)) return `NUM ${code.slice(6)}`;
  if (/^F\d+$/.test(code)) return code;
  const n = t(`taste.${code}`);
  if (n !== `taste.${code}`) return n;
  return code.replace(/([a-z])([A-Z])/g, '$1 $2').toUpperCase().slice(0, 10);
}
// Tasten einer Aktion, z. B. "↑ / W"
export function tastenVon(aktion) {
  const [a, b] = einstellungen.tasten[aktion];
  return b ? `${tastenName(a)} / ${tastenName(b)}` : tastenName(a);
}
export function knopfName(nr) {
  const n = t(`pad.${nr}`);
  return n === `pad.${nr}` ? `${nr}` : n;
}
