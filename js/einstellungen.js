// Einstellungen (seit M5a): Werte, Standardwerte aus config.js (Block "menue"), im Browser gespeichert.
// Fehlt der Browser-Speicher (blockiert, privat), läuft alles mit den Standardwerten weiter.

import { CONFIG } from './config.js';

const M = CONFIG.menue;
const STANDARD = M.standard;
export const AKTIONEN = Object.keys(STANDARD.tasten); // gas, bremse, links, rechts, handbremse, zurueck, notes, hud (M6)

const kopieTasten = (q) => Object.fromEntries(AKTIONEN.map((a) => [a, [...q[a]]]));

// Aktuelle Werte (immer dasselbe Objekt)
export const einstellungen = { ...STANDARD, tasten: kopieTasten(STANDARD.tasten) };

const beobachter = [];
// f(name, wert) wird nach jeder Änderung aufgerufen
export function beiAenderung(f) { beobachter.push(f); }

let speicherOk = true;
export const speicherVorhanden = () => speicherOk;

// Gespeicherte Werte prüfen: nur bekannte Namen mit passendem Wert übernehmen
function uebernimm(d) {
  if (!d || typeof d !== 'object') return;
  const ganz = (w, n) => Number.isInteger(w) && w >= 0 && w < n;
  if (typeof d.vollbild === 'boolean') einstellungen.vollbild = d.vollbild;
  if (ganz(d.aufloesung, M.aufloesungen.length)) einstellungen.aufloesung = d.aufloesung;
  if (d.einheit === 'kmh' || d.einheit === 'mph') einstellungen.einheit = d.einheit;
  if (typeof d.fps === 'boolean') einstellungen.fps = d.fps;
  if (ganz(d.lenkStufe, M.lenkStufen.length)) einstellungen.lenkStufe = d.lenkStufe;
  if (ganz(d.totzoneStufe, M.totzonen.length)) einstellungen.totzoneStufe = d.totzoneStufe;
  if (Number.isFinite(d.lautstaerke)) einstellungen.lautstaerke = Math.max(0, Math.min(100, Math.round(d.lautstaerke)));
  if (d.sprache === 'de' || d.sprache === 'en') einstellungen.sprache = d.sprache;
  // M6: Anzeige
  if (typeof d.minimap === 'boolean') einstellungen.minimap = d.minimap;
  if (typeof d.vergleich === 'boolean') einstellungen.vergleich = d.vergleich;
  if (d.vergleichMit === 'best' || d.vergleichMit === 'letzter') einstellungen.vergleichMit = d.vergleichMit;
  if (d.tasten && typeof d.tasten === 'object') {
    const neu = kopieTasten(STANDARD.tasten);
    const gesehen = new Set();
    const fehlen = []; // Aktionen, die es beim Speichern noch nicht gab (z. B. "hud" seit M6)
    let ok = true;
    for (const a of AKTIONEN) {
      const w = d.tasten[a];
      if (!Array.isArray(w)) { fehlen.push(a); continue; }
      for (let k = 0; k < 2; k++) {
        const c = w[k] ?? null;
        if (c !== null && (typeof c !== 'string' || M.reserviert.includes(c))) ok = false;
        if (k === 0 && c === null) ok = false;
        neu[a][k] = c;
      }
    }
    // Neue Aktion, deren Standardtaste schon eine gespeicherte Aktion hat (z. B. H selbst belegt):
    // die gespeicherte Belegung bleibt, die neue Aktion bekommt die erste freie Buchstabentaste
    const belegt = new Set();
    for (const a of AKTIONEN) if (!fehlen.includes(a)) for (const c of neu[a]) if (c) belegt.add(c);
    for (const a of fehlen) {
      neu[a][1] = null;
      if (belegt.has(neu[a][0])) neu[a][0] = FREI.find((c) => !belegt.has(c)) || neu[a][0];
      belegt.add(neu[a][0]);
    }
    // nie doppelt: sonst lieber alles auf Standard
    for (const a of AKTIONEN) for (const c of neu[a]) { if (c === null) continue; if (gesehen.has(c)) ok = false; gesehen.add(c); }
    if (ok) einstellungen.tasten = neu;
  }
}

// Ersatztasten für neue Aktionen (nur wenn die Standardtaste schon vergeben ist)
const FREI = [...'HJKUIOPGFTYZXCVBMLQE'].map((b) => `Key${b}`);

export function ladeEinstellungen() {
  try {
    const roh = window.localStorage.getItem(M.speicherName);
    if (roh) uebernimm(JSON.parse(roh));
  } catch { speicherOk = false; /* kein Speicher oder kaputt: Standardwerte */ }
  return einstellungen;
}

export function speichere() {
  try {
    window.localStorage.setItem(M.speicherName, JSON.stringify(einstellungen));
  } catch { speicherOk = false; /* egal, Spiel läuft weiter */ }
}

// Einen Wert ändern, speichern und melden
export function setze(name, wert) {
  if (einstellungen[name] === wert && name !== 'tasten') return;
  einstellungen[name] = wert;
  speichere();
  for (const f of beobachter) f(name, wert);
}

// --- Tastenbelegung ---------------------------------------------------------------------------
export const istReserviert = (code) => M.reserviert.includes(code);

// Wo ist diese Taste belegt? Ergebnis { aktion, platz } oder null
export function findeTaste(code) {
  for (const a of AKTIONEN) for (let k = 0; k < 2; k++) if (einstellungen.tasten[a][k] === code) return { aktion: a, platz: k };
  return null;
}

// Taste code auf Aktion a, Platz k (0 = Taste 1, 1 = Taste 2) legen. Nie doppelt:
// Ist die Taste schon vergeben, wird getauscht (die andere Aktion bekommt die alte Taste von hier).
// Ergebnis: { ok, art: 'gesetzt' | 'gleich' | 'getauscht' | 'reserviert' | 'belegt' | 'nichtLeer', mit }
export function belegeTaste(a, k, code) {
  const T = einstellungen.tasten;
  if (code === null) {
    if (k === 0) return { ok: false, art: 'nichtLeer' };
    T[a][1] = null;
    setze('tasten', T);
    return { ok: true, art: 'gesetzt' };
  }
  if (istReserviert(code)) return { ok: false, art: 'reserviert' };
  const alt = T[a][k];
  if (alt === code) return { ok: true, art: 'gleich' };
  const da = findeTaste(code);
  if (da) {
    // tauschen: die andere Stelle bekommt die alte Taste von hier
    if (alt === null && da.platz === 0) {
      // die andere Aktion hätte keine Taste 1 mehr: ihre Taste 2 rückt nach, sonst geht es nicht
      const zweite = T[da.aktion][1];
      if (zweite === null || (da.aktion === a)) return { ok: false, art: 'belegt', mit: da.aktion };
      T[da.aktion][0] = zweite;
      T[da.aktion][1] = null;
    } else {
      T[da.aktion][da.platz] = alt;
    }
    T[a][k] = code;
    setze('tasten', T);
    return { ok: true, art: da.aktion === a ? 'gesetzt' : 'getauscht', mit: da.aktion };
  }
  T[a][k] = code;
  setze('tasten', T);
  return { ok: true, art: 'gesetzt' };
}

export function tastenStandard() {
  einstellungen.tasten = kopieTasten(STANDARD.tasten);
  setze('tasten', einstellungen.tasten);
}
