// Strecken-Register (seit M10a): welche Strecken gibt es, und welche ist gerade dran?
// Eine neue Strecke: Datei unter strecken/ (Format: docs/strecken-format.md) und hier ein Eintrag.
// Das Menü ETAPPE ändert sich dadurch noch nicht (Etappenwahl kommt mit M10b).

export const STRECKEN = [
  { id: 'alpen', datei: 'alpen.js' },
];

// Die Strecke, die beim Laden gebaut wird (heute immer die erste; M10b: gewählte Etappe)
export function aktuellerEintrag() {
  return STRECKEN[0];
}

// Adresse der Streckendatei. Nur für Werkzeuge: window.__streckeAdresse (vor dem Laden gesetzt) lädt eine andere Datei
// (tools/strecke-abfahren.mjs); das Spiel selbst setzt das nie.
export function streckenAdresse(eintrag) {
  return globalThis.__streckeAdresse || new URL(`../strecken/${eintrag.datei}`, import.meta.url).href;
}
