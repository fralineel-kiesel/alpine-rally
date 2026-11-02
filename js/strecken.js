// Strecken-Register (seit M10a): welche Strecken gibt es, und welche ist gerade dran?
// Eine neue Strecke: Datei unter strecken/ (Format: docs/strecken-format.md) und hier ein Eintrag.
// Seit M10b: Die gewählte Etappe (Menü ETAPPE) steht im Browser unter "alpineRally.etappe" (Strecken-Id); das Spiel
// baut beim Laden genau diese eine Strecke. Andere Strecken lädt es nur, wenn sie gebraucht werden (Etappenwahl).

export const STRECKEN = [
  { id: 'alpen', datei: 'alpen.js' },
];

export const SPEICHER_ETAPPE = 'alpineRally.etappe'; // gewählte Strecke (Id), Standard: die erste (Alpen)

// Gewählte Strecken-Id aus dem Speicher (fehlt, unbekannt oder kein Speicher: die erste)
export function gewaehlteId() {
  let id = null;
  try { id = globalThis.localStorage ? globalThis.localStorage.getItem(SPEICHER_ETAPPE) : null; } catch (e) { id = null; }
  return STRECKEN.some((e) => e.id === id) ? id : STRECKEN[0].id;
}
// Wahl merken (Menü ETAPPE)
export function merkeId(id) {
  try { globalThis.localStorage.setItem(SPEICHER_ETAPPE, id); } catch (e) { /* ohne Speicher: gilt nur bis zum Neuladen */ }
}

// Die Strecke, die beim Laden gebaut wird: ?strecke=<id> in der Adresse (Werkzeuge, Tests, Neuladen nach der
// Etappenwahl) geht vor, sonst die gespeicherte Wahl, sonst die erste.
export function aktuellerEintrag() {
  let id = null;
  try { id = new URLSearchParams(globalThis.location ? globalThis.location.search : '').get('strecke'); } catch (e) { id = null; }
  const ausAdresse = STRECKEN.find((e) => e.id === id);
  if (ausAdresse) return ausAdresse;
  const gewaehlt = gewaehlteId();
  return STRECKEN.find((e) => e.id === gewaehlt) || STRECKEN[0];
}

// Adresse der Streckendatei. Nur für Werkzeuge: window.__streckeAdresse (vor dem Laden gesetzt) lädt eine andere Datei
// (tools/strecke-abfahren.mjs); das Spiel selbst setzt das nie.
export function streckenAdresse(eintrag) {
  return globalThis.__streckeAdresse || new URL(`../strecken/${eintrag.datei}`, import.meta.url).href;
}
// Adresse einer Streckendatei ohne Werkzeug-Umleitung (Etappenwahl: Vorschau der anderen Strecken)
export function dateiAdresse(eintrag) {
  return new URL(`../strecken/${eintrag.datei}`, import.meta.url).href;
}
