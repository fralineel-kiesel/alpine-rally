// Bestzeiten (Seite im Hauptmenü seit M5a, gefüllt seit M5b beim Erreichen des Ziels).
// Seit M8h je Auto getrennt, gespeichert im Browser unter CONFIG.menue.bestzeitenNameV2 ("alpineRally.bestzeiten2"):
//   { [etappe]: { [auto]: [{ zeit, cps: [...], datum, auto, aufpralle, resets, hoechstTempo, spur }] } }
//   je Etappe und Auto eine Liste (Top 10, schnellste zuerst). auto = Id eines der fünf Autos aus js/inhalte.js;
//   Einträge ohne gültige Id (fehlt, "prototyp", unbekannt) liegen im Behälter "_ohne" (auch Top 10) und zählen
//   nur in der Gesamtwertung. Die Gesamtliste wird nicht gespeichert, sondern aus allen Behältern abgeleitet.
//   zeit, cps: Sekunden (cps: Zwischenzeiten der Checkpoints, null = verpasst), datum: Zeitpunkt (ISO-Text),
//   aufpralle/resets: Anzahl, hoechstTempo: m/s.
//   spur (seit M6): Fahrspur für den Live-Vergleich, Rennzeit alle 10 Streckenmeter (js/vergleich.js), auf 0.01 s.
// Einträge im alten Format (nur zeit, cps, datum; oder ohne spur, ohne auto) werden genauso gelesen.
// Übernahme (M8h): Fehlt der neue Schlüssel (oder ist er kaputt), werden die Zeiten des alten Schlüssels
// CONFIG.menue.bestzeitenName ("alpineRally.bestzeiten", bis 0.8g eine gemeinsame Liste) nach Auto-Id kopiert.
// Der alte Schlüssel wird nur gelesen, nie verändert (gelöscht nur mit BESTZEITEN LÖSCHEN).
// Seit M6 auch der letzte fertige Lauf je Etappe (CONFIG.menue.letzterLaufName, "alpineRally.letzterLauf"):
//   { [etappe]: { zeit, cps, spur, datum } } – jeder Lauf, der ins Ziel kommt, auch ausserhalb der Top 10, egal welches Auto.
// Ohne Browser-Speicher (blockiert, privat, voll) läuft alles weiter: Die Zeiten gelten dann nur bis zum Neuladen.

import { CONFIG } from './config.js';
import { AUTOS } from './inhalte.js';

export const BESTZEITEN_SCHLUESSEL = CONFIG.menue.bestzeitenNameV2;
export const BESTZEITEN_SCHLUESSEL_ALT = CONFIG.menue.bestzeitenName;
export const BESTZEITEN_ANZAHL = 10;   // je Auto (und im Behälter "_ohne")
export const GESAMT_ANZAHL = 3;        // Gesamtwertung (alle Autos)
export const OHNE_AUTO = '_ohne';      // Behälter für Einträge ohne gültige Auto-Id

// Verglichen wird in Hundertstel, genau wie die Anzeige (formatZeit): was gleich aussieht, ist gleich schnell
export const hundertstel = (zeit) => Math.floor(zeit * 100);

// In welchen Behälter gehört ein Eintrag mit dieser Auto-Id? (nur die fünf Autos haben eine eigene Liste)
export const behaelter = (auto) => (AUTOS.some((a) => a.id === auto) ? auto : OHNE_AUTO);

let ersatz = null;        // Zeiten dieser Sitzung, wenn der Browser-Speicher nicht geht (blockiert oder voll)
let speicherOk = true;    // hat das letzte Lesen/Schreiben geklappt?
export const speicherGeht = () => speicherOk;

const istObjekt = (d) => !!d && typeof d === 'object' && !Array.isArray(d);
// Text aus dem Speicher -> Objekt; fehlt oder kaputt (kein JSON, kein Objekt): null
function objektAus(roh) {
  if (roh == null) return null;
  try { const d = JSON.parse(roh); return istObjekt(d) ? d : null; } catch { return null; }
}

function alleLesen() {
  let roh;
  try {
    roh = window.localStorage.getItem(BESTZEITEN_SCHLUESSEL);
  } catch {
    // Speicher blockiert: Zeiten nur in dieser Sitzung
    speicherOk = false;
    return ersatz || (ersatz = {});
  }
  if (ersatz) return ersatz; // Speicher war voll: bis zum Neuladen gelten die Zeiten dieser Sitzung
  speicherOk = true;
  return objektAus(roh) || uebernimmAlte();
}
function alleSchreiben(d) {
  try {
    window.localStorage.setItem(BESTZEITEN_SCHLUESSEL, JSON.stringify(d));
    speicherOk = true;
    ersatz = null;
    return true;
  } catch {
    speicherOk = false;
    ersatz = d;
    return false;
  }
}

// Übernahme der alten gemeinsamen Liste (bis 0.8g): je Eintrag in den Behälter seines Autos (je Behälter Top 10).
// Läuft nur, solange es den neuen Schlüssel nicht gibt; gleiches Ergebnis bei jedem Lauf (keine Doppelungen).
// Der alte Schlüssel bleibt, wie er ist. Ohne alte Zeiten wird nichts geschrieben.
function uebernimmAlte() {
  let alt = null;
  try { alt = objektAus(window.localStorage.getItem(BESTZEITEN_SCHLUESSEL_ALT)); } catch { /* blockiert: nichts */ }
  const d = {};
  for (const [etappe, liste] of Object.entries(alt || {})) {
    if (!Array.isArray(liste)) continue;
    const je = {};
    for (const e of liste) {
      if (!e || !Number.isFinite(e.zeit)) continue;
      const b = behaelter(e.auto);
      (je[b] || (je[b] = [])).push(e);
    }
    for (const b of Object.keys(je)) je[b] = ordne(je[b]);
    if (Object.keys(je).length) d[etappe] = je;
  }
  if (Object.keys(d).length) alleSchreiben(d); // ab jetzt gilt der neue Schlüssel
  return d;
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
    spur: sauberSpur(e.spur),
  };
}
// Fahrspur nur, wenn sie aus lauter Zahlen besteht (sonst null = keine, der Vergleich nähert dann)
function sauberSpur(sp) {
  return Array.isArray(sp) && sp.length > 1 && sp.every(Number.isFinite) ? sp : null;
}
// Sortiert (schnellste zuerst; bei gleicher Zeit bleibt die Reihenfolge, die ältere steht vorn), höchstens 10
function ordne(liste) {
  return liste.filter((e) => e && Number.isFinite(e.zeit)).map(sauber)
    .sort((a, b) => hundertstel(a.zeit) - hundertstel(b.zeit)).slice(0, BESTZEITEN_ANZAHL);
}
// Behälter einer Etappe ({ auto: [...] }); fehlt oder falsches Format: leer
const etappeVon = (d, etappe) => (istObjekt(d[etappe]) ? d[etappe] : {});
const listeVon = (d, etappe, b) => { const l = etappeVon(d, etappe)[b]; return ordne(Array.isArray(l) ? l : []); };
// Zeitpunkt für Gleichstand über mehrere Autos (ohne Datum = ganz alt)
const zeitpunkt = (e) => { const z = e.datum == null ? NaN : Date.parse(e.datum); return Number.isNaN(z) ? -Infinity : z; };
// Gesamtliste einer Etappe: alle Behälter zusammen, schnellste zuerst, bei Gleichstand die ältere vorn
function gesamtVon(d, etappe) {
  const je = etappeVon(d, etappe), alle = [];
  for (const b of Object.keys(je)) if (Array.isArray(je[b])) alle.push(...ordne(je[b]));
  return alle.sort((a, b) => hundertstel(a.zeit) - hundertstel(b.zeit) || zeitpunkt(a) - zeitpunkt(b) || 0);
}

// Bestzeiten einer Etappe (schnellste zuerst). Mit auto: die Top 10 dieses Autos (andere Id: Behälter "_ohne");
// ohne auto: die schnellsten 10 über alle Autos (wie bis 0.8g). Ohne Einträge: leer.
export function ladeBestzeiten(etappe, auto = null) {
  try {
    const d = alleLesen();
    return auto == null ? gesamtVon(d, etappe).slice(0, BESTZEITEN_ANZAHL) : listeVon(d, etappe, behaelter(auto));
  } catch { return []; }
}
// Gesamtwertung: die schnellsten n Zeiten einer Etappe, egal mit welchem Auto (ein Auto darf alle Plätze haben)
export function ladeGesamtTop(etappe, n = GESAMT_ANZAHL) {
  try { return gesamtVon(alleLesen(), etappe).slice(0, n); } catch { return []; }
}

// Neue Zeit eintragen (in die Liste von eintrag.auto). eintrag: { zeit, cps, auto, aufpralle, resets, hoechstTempo, spur }
// (datum kommt hier dazu). Ergebnis: { platz (1-10 in der Liste dieses Autos, 0 = nicht drin), bisher (Bestzeit dieses
// Autos vor dem Lauf oder null), anzahl (Einträge dieser Liste danach), gespeichert (false = kein Browser-Speicher), datum,
// gesamtPlatz (1-3, 0 = nicht in der Gesamt-Top-3), gesamtBisher (gesamtbeste Zeit vor dem Lauf oder null) }
export function speichereBestzeit(etappe, eintrag) {
  try {
    const d = alleLesen();
    const b = behaelter(eintrag.auto);
    const je = etappeVon(d, etappe);
    d[etappe] = je;
    const liste = listeVon(d, etappe, b);
    const bisher = liste.length ? liste[0] : null;
    const gesamt = gesamtVon(d, etappe);
    const gesamtBisher = gesamt.length ? gesamt[0] : null;
    const neu = sauber({ ...eintrag, datum: new Date().toISOString() });
    // hinter alle gleich schnellen (die ältere steht vorn)
    let i = 0;
    while (i < liste.length && hundertstel(liste[i].zeit) <= hundertstel(neu.zeit)) i++;
    liste.splice(i, 0, neu);
    const top = liste.slice(0, BESTZEITEN_ANZAHL);
    je[b] = top;
    const platz = i < BESTZEITEN_ANZAHL ? i + 1 : 0;
    // Gesamtplatz: der neue Lauf ist der jüngste, steht also hinter allen gleich schnellen aller Autos
    const g = platz ? gesamt.filter((e) => hundertstel(e.zeit) <= hundertstel(neu.zeit)).length + 1 : 0;
    const gespeichert = alleSchreiben(d);
    return {
      platz, bisher, anzahl: top.length, gespeichert, datum: neu.datum,
      gesamtPlatz: g > 0 && g <= GESAMT_ANZAHL ? g : 0, gesamtBisher,
    };
  } catch {
    return { platz: 0, bisher: null, anzahl: 0, gespeichert: false, datum: null, gesamtPlatz: 0, gesamtBisher: null };
  }
}

// Alle Bestzeiten löschen (alle Etappen, alle Autos, auch der alte Schlüssel bis 0.8g). Ergebnis: true = geklappt
export function loescheBestzeiten() {
  ersatz = null;
  try {
    window.localStorage.removeItem(BESTZEITEN_SCHLUESSEL);
    window.localStorage.removeItem(BESTZEITEN_SCHLUESSEL_ALT);
    speicherOk = true;
    return true;
  } catch {
    speicherOk = false;
    return true; // ohne Browser-Speicher: die Zeiten dieser Sitzung sind weg
  }
}

// --- Letzter Lauf (M6) ---------------------------------------------------------------------------
// Eigener Schlüssel, gleiche Vorsicht wie bei den Bestzeiten: ohne Browser-Speicher gilt er bis zum Neuladen.
const LETZTER_SCHLUESSEL = CONFIG.menue.letzterLaufName;
let ersatzLetzter = {};
function letzteLesen() {
  try {
    const roh = window.localStorage.getItem(LETZTER_SCHLUESSEL);
    const d = roh ? JSON.parse(roh) : {};
    return d && typeof d === 'object' && !Array.isArray(d) ? d : {};
  } catch (e) {
    return e instanceof SyntaxError ? {} : ersatzLetzter;
  }
}
// eintrag: { zeit, cps, spur }; Ergebnis: true = im Browser gespeichert
export function speichereLetztenLauf(etappe, eintrag) {
  const d = letzteLesen();
  d[etappe] = { zeit: eintrag.zeit, cps: Array.isArray(eintrag.cps) ? eintrag.cps.slice() : [], spur: sauberSpur(eintrag.spur), datum: new Date().toISOString() };
  try {
    window.localStorage.setItem(LETZTER_SCHLUESSEL, JSON.stringify(d));
    return true;
  } catch {
    ersatzLetzter = d;
    return false;
  }
}
// Der letzte fertige Lauf dieser Etappe { zeit, cps, spur, datum } oder null
export function ladeLetztenLauf(etappe) {
  try {
    const e = letzteLesen()[etappe];
    if (!e || !Number.isFinite(e.zeit)) return null;
    return { zeit: e.zeit, cps: Array.isArray(e.cps) ? e.cps.map((c) => (Number.isFinite(c) ? c : null)) : [], spur: sauberSpur(e.spur), datum: e.datum ?? null };
  } catch { return null; }
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
