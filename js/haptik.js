// Haptik (Meilenstein 9a.1): kurzes Vibrieren bei Knopfdruck und Spielereignissen, nur im Touch-Modus.
// Einstellung HAPTIK (einstellungen.haptik): 'aus', 'knoepfe' (nur beim Drücken eines Touch-Knopfs, auch im Menü) oder
// 'voll' (dazu Aufprall, Gangwechsel, Checkpoint, Ziel). Nur über navigator.vibrate (Android-Chrome/-Firefox): Muster aus
// CONFIG.haptik, der Aufprall nach seiner Stärke. Die Knopf-Ticks kommen direkt aus dem Pointer-Down.
// M9a.2: ohne navigator.vibrate (iPhone) passiert nichts, ohne Fehler; die Einträge HAPTIK und HAPTIK TESTEN fehlen dort
// (haptikMoeglich). Der iPhone-Schalter-Trick aus M9a.1 ist entfernt (tickte auf Linos iPhone nicht).
// Rate-Limit: Knopf-Ticks höchstens alle knopfAbstand ms, Spielereignisse alle spielAbstand ms (kein Dauerbrummen).
// Nichts im Bildtakt, keine neuen Objekte je Auslösung (die Muster sind feste Listen aus config.js).

import { CONFIG } from './config.js';
import { einstellungen } from './einstellungen.js';

let aktiv = () => false; // Touch-Modus an? (setzt js/touch.js; am Desktop ohne Touch passiert nie etwas)
export function setzeHaptikAktiv(f) { aktiv = f; }
const letzte = { knopf: -1e9, spiel: -1e9 };
// für Tests: Anzahl Ausgaben, unterdrückt durch das Rate-Limit, zuletzt ausgegebenes Muster und Ereignis
export const haptikZaehler = { vibrate: 0, unterdrueckt: 0, letztes: null, art: '' };

// Kann dieses Gerät vibrieren? (Android ja, iPhone nein)
export const haptikMoeglich = () => typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';

function ausgeben(muster, art) {
  if (!haptikMoeglich()) return;
  haptikZaehler.letztes = muster; haptikZaehler.art = art;
  try { navigator.vibrate(muster); } catch (e) { return; } // (manche Browser werfen ohne vorherige Berührung)
  haptikZaehler.vibrate++;
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
// Eintrag HAPTIK TESTEN (nur wo haptikMoeglich): ein Tick (ohne Rate-Limit); liefert 'vibrate' oder 'aus'
export function testTick() {
  if (!aktiv() || einstellungen.haptik === 'aus') return 'aus';
  ausgeben(CONFIG.haptik.knopf, 'test');
  return 'vibrate';
}
