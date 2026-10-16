// Bestzeiten (Seite im Hauptmenü seit M5a). Gefüllt werden sie ab M5b (Zielbildschirm).
// Gespeichert im Browser unter CONFIG.menue.bestzeitenName ("alpineRally.bestzeiten"),
// je Etappe eine Liste (Top 10): { [etappe]: [{ zeit, cps: [...], datum }] }.

import { CONFIG } from './config.js';

export const BESTZEITEN_SCHLUESSEL = CONFIG.menue.bestzeitenName;
export const BESTZEITEN_ANZAHL = 10;

// Liste der Bestzeiten einer Etappe (schnellste zuerst). Ohne Speicher: leer.
export function ladeBestzeiten(etappe) {
  try {
    const d = JSON.parse(window.localStorage.getItem(BESTZEITEN_SCHLUESSEL) || '{}');
    const liste = Array.isArray(d[etappe]) ? d[etappe] : [];
    return liste.filter((e) => e && Number.isFinite(e.zeit)).sort((a, b) => a.zeit - b.zeit).slice(0, BESTZEITEN_ANZAHL);
  } catch { return []; }
}
