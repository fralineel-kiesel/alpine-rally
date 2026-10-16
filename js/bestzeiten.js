// Bestzeiten (Seite im Hauptmenü seit M5a, gefüllt seit M5b beim Erreichen des Ziels).
// Gespeichert im Browser unter CONFIG.menue.bestzeitenName ("alpineRally.bestzeiten"),
// je Etappe eine Liste (Top 10, schnellste zuerst):
//   { [etappe]: [{ zeit, cps: [...], datum, auto, aufpralle, resets, hoechstTempo }] }
//   zeit, cps: Sekunden (cps: Zwischenzeiten der Checkpoints, null = verpasst), datum: Zeitpunkt (ISO-Text),
//   auto: Auto-Id aus js/inhalte.js, aufpralle/resets: Anzahl, hoechstTempo: m/s.
// Einträge im alten Format (nur zeit, cps, datum) werden genauso gelesen.
// Ohne Browser-Speicher (blockiert, privat) läuft alles weiter: Die Zeiten gelten dann nur bis zum Neuladen.

import { CONFIG } from './config.js';

export const BESTZEITEN_SCHLUESSEL = CONFIG.menue.bestzeitenName;
export const BESTZEITEN_ANZAHL = 10;

// Verglichen wird in Hundertstel, genau wie die Anzeige (formatZeit): was gleich aussieht, ist gleich schnell
export const hundertstel = (zeit) => Math.floor(zeit * 100);

let ersatz = {};          // ohne Browser-Speicher: Zeiten nur im Speicher dieser Sitzung
let speicherOk = true;    // hat das letzte Lesen/Schreiben geklappt?
export const speicherGeht = () => speicherOk;

function alleLesen() {
  try {
    const roh = window.localStorage.getItem(BESTZEITEN_SCHLUESSEL);
    speicherOk = true;
    const d = roh ? JSON.parse(roh) : {};
    return d && typeof d === 'object' && !Array.isArray(d) ? d : {};
  } catch (e) {
    // Speicher blockiert: Ersatz; Inhalt kaputt (kein JSON): wie leer
    if (!(e instanceof SyntaxError)) { speicherOk = false; return ersatz; }
    return {};
  }
}
function alleSchreiben(d) {
  try {
    window.localStorage.setItem(BESTZEITEN_SCHLUESSEL, JSON.stringify(d));
    speicherOk = true;
    return true;
  } catch {
    speicherOk = false;
    ersatz = d;
    return false;
  }
}

// Ein Eintrag (neu oder altes Format) mit allen Feldern; fehlende Werte = null
function sauber(e) {
  return {
    zeit: e.zeit,
    cps: Array.isArray(e.cps) ? e.cps.map((c) => (Number.isFinite(c) ? c : null)) : [],
    datum: e.datum ?? null,
    auto: e.auto ?? null,
    aufpralle: Number.isFinite(e.aufpralle) ? e.aufpralle : null,
    resets: Number.isFinite(e.resets) ? e.resets : null,
    hoechstTempo: Number.isFinite(e.hoechstTempo) ? e.hoechstTempo : null,
  };
}
// Sortiert (schnellste zuerst; bei gleicher Zeit bleibt die Reihenfolge, die ältere steht vorn), höchstens 10
function ordne(liste) {
  return liste.filter((e) => e && Number.isFinite(e.zeit)).map(sauber)
    .sort((a, b) => hundertstel(a.zeit) - hundertstel(b.zeit)).slice(0, BESTZEITEN_ANZAHL);
}

// Liste der Bestzeiten einer Etappe (schnellste zuerst). Ohne Einträge: leer.
export function ladeBestzeiten(etappe) {
  try {
    const d = alleLesen();
    return ordne(Array.isArray(d[etappe]) ? d[etappe] : []);
  } catch { return []; }
}

// Neue Zeit eintragen. eintrag: { zeit, cps, auto, aufpralle, resets, hoechstTempo } (datum kommt hier dazu)
// Ergebnis: { platz (1-10, 0 = nicht in den Top 10), bisher (Bestzeit vor diesem Lauf oder null),
//             anzahl (Einträge danach), gespeichert (false = kein Browser-Speicher), datum }
export function speichereBestzeit(etappe, eintrag) {
  try {
    const d = alleLesen();
    const liste = ordne(Array.isArray(d[etappe]) ? d[etappe] : []);
    const bisher = liste.length ? liste[0] : null;
    const neu = sauber({ ...eintrag, datum: new Date().toISOString() });
    // hinter alle gleich schnellen (die ältere steht vorn)
    let i = 0;
    while (i < liste.length && hundertstel(liste[i].zeit) <= hundertstel(neu.zeit)) i++;
    liste.splice(i, 0, neu);
    const top = liste.slice(0, BESTZEITEN_ANZAHL);
    d[etappe] = top;
    const gespeichert = alleSchreiben(d);
    return { platz: i < BESTZEITEN_ANZAHL ? i + 1 : 0, bisher, anzahl: top.length, gespeichert, datum: neu.datum };
  } catch {
    return { platz: 0, bisher: null, anzahl: 0, gespeichert: false, datum: null };
  }
}

// Alle Bestzeiten löschen (alle Etappen). Ergebnis: true = geklappt
export function loescheBestzeiten() {
  ersatz = {};
  try {
    window.localStorage.removeItem(BESTZEITEN_SCHLUESSEL);
    speicherOk = true;
    return true;
  } catch {
    speicherOk = false;
    return true; // ohne Browser-Speicher: die Zeiten dieser Sitzung sind weg
  }
}

// Datum für die Anzeige: Deutsch 16.10.26, Englisch 2026-10-16 (unbekannt: --)
export function formatDatum(datum, sprache) {
  const d = datum == null ? null : new Date(datum);
  if (!d || Number.isNaN(d.getTime())) return '--';
  const zwei = (n) => String(n).padStart(2, '0');
  return sprache === 'en'
    ? `${d.getFullYear()}-${zwei(d.getMonth() + 1)}-${zwei(d.getDate())}`
    : `${zwei(d.getDate())}.${zwei(d.getMonth() + 1)}.${zwei(d.getFullYear() % 100)}`;
}
