// Haptik (Meilenstein 9a.1): kurzes Vibrieren bzw. ein Tick bei Knopfdruck und Spielereignissen, nur im Touch-Modus.
// Einstellung HAPTIK (einstellungen.haptik): 'aus', 'knoepfe' (nur beim Drücken eines Touch-Knopfs, auch im Menü) oder
// 'voll' (dazu Aufprall, Gangwechsel, Checkpoint, Ziel). Ausgabeweg mit Feature-Erkennung:
// - navigator.vibrate (Android-Chrome/-Firefox): Muster aus CONFIG.haptik, der Aufprall nach seiner Stärke.
// - sonst auf dem iPhone/iPad (Safari, Firefox, Web-App): ein einmal angelegter, versteckter Schalter
//   <input type="checkbox" switch> mit <label>; label.click() löst auf neueren iOS-Versionen einen leichten Tick aus.
//   Die Stärke ist dort nicht einstellbar. Ob das auch bei Spielereignissen (nicht direkt im Touch-Ereignis) tickt,
//   ist ungeprüft (iOS koppelt das teils an eine Berührung); die Knopf-Ticks kommen darum direkt aus dem Pointer-Down.
// - kein Weg: nichts passiert, kein Fehler.
// Rate-Limit: Knopf-Ticks höchstens alle knopfAbstand ms, Spielereignisse alle spielAbstand ms (kein Dauerbrummen).
// Nichts im Bildtakt, keine neuen Objekte je Auslösung (die Muster sind feste Listen aus config.js).

import { CONFIG } from './config.js';
import { einstellungen } from './einstellungen.js';

let aktiv = () => false; // Touch-Modus an? (setzt js/touch.js; am Desktop ohne Touch passiert nie etwas)
export function setzeHaptikAktiv(f) { aktiv = f; }
const letzte = { knopf: -1e9, spiel: -1e9 };
let label = null; // iOS-Schalter (einmal angelegt, nie pro Auslösung)
// für Tests: Anzahl Ausgaben je Weg, unterdrückt durch das Rate-Limit, zuletzt ausgegebenes Muster und Ereignis
export const haptikZaehler = { vibrate: 0, schalter: 0, unterdrueckt: 0, letztes: null, art: '' };

const istIos = () => typeof navigator !== 'undefined' && (/iPhone|iPad|iPod/.test(navigator.userAgent || '')
  || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)); // (iPad meldet sich als Mac)
// Welcher Weg geht hier? 'vibrate', 'schalter' (iPhone) oder 'keiner'
export function haptikWeg() {
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') return 'vibrate';
  return istIos() && typeof document !== 'undefined' ? 'schalter' : 'keiner';
}

function schalterKlick() {
  if (!label) {
    label = document.createElement('label');
    label.id = 'haptik';
    label.setAttribute('aria-hidden', 'true');
    label.style.display = 'none';
    const schalter = document.createElement('input');
    schalter.type = 'checkbox';
    schalter.setAttribute('switch', '');
    schalter.tabIndex = -1;
    label.appendChild(schalter);
    document.body.appendChild(label);
  }
  label.click();
}
function ausgeben(muster, art) {
  const weg = haptikWeg();
  haptikZaehler.letztes = muster; haptikZaehler.art = art;
  if (weg === 'vibrate') {
    try { navigator.vibrate(muster); } catch (e) { return; } // (manche Browser werfen ohne vorherige Berührung)
    haptikZaehler.vibrate++;
  } else if (weg === 'schalter') {
    schalterKlick();
    haptikZaehler.schalter++;
  }
}
function frei(welche, abstand) {
  const jetzt = performance.now();
  if (jetzt - letzte[welche] < abstand) { haptikZaehler.unterdrueckt++; return false; }
  letzte[welche] = jetzt;
  return true;
}

// Ein Touch-Knopf wurde gedrückt (aus dem Pointer-Down-Handler, also im Touch-Ereignis selbst)
export function knopfTick() {
  if (!aktiv() || einstellungen.haptik === 'aus') return;
  if (frei('knopf', CONFIG.haptik.knopfAbstand)) ausgeben(CONFIG.haptik.knopf, 'knopf');
}
// Spielereignis: art = 'aufprall' (staerke 0..1 wie im Ton), 'gang', 'checkpoint' oder 'ziel'
export function spielTick(art, staerke = 1) {
  if (!aktiv() || einstellungen.haptik !== 'voll') return;
  const H = CONFIG.haptik;
  if (!frei('spiel', H.spielAbstand)) return;
  const muster = art === 'aufprall' ? Math.round(H.aufprallLeicht + (H.aufprallHart - H.aufprallLeicht) * Math.max(0, Math.min(1, staerke))) : H[art];
  ausgeben(muster, art);
}
// Eintrag HAPTIK TESTEN: ein Tick (ohne Rate-Limit); liefert den Weg ('vibrate', 'schalter', 'keiner') oder 'aus'
export function testTick() {
  if (!aktiv() || einstellungen.haptik === 'aus') return 'aus';
  ausgeben(CONFIG.haptik.knopf, 'test');
  return haptikWeg();
}
