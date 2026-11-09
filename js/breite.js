// Strassenbreite je Abschnitt (Meilenstein 11b, Streckendatei "strassenBreite", z. B. die schmale Pistenzufahrt im
// Skigebiet). Ohne das Feld (Alpen, Finnland) gilt wie bisher nur die Breite je Belag (config.js, belaege) – dann
// rechnet hier nichts, und alle Zahlen bleiben Bit für Bit gleich.
// Eintrag: { von, bis, breite } (Meter Fahrbahn ohne Bankett). Vor "von" und nach "bis" geht die Breite über
// CONFIG.strassenBreiteRampe Meter weich (linear) von der normalen Belag-Breite zur neuen über (kein Sprung im Rand).
import { CONFIG } from './config.js';
import { STRECKE } from './streckenlader.js';

const LISTE = (STRECKE && STRECKE.strassenBreite) || [];
export const breiteAn = LISTE.length > 0;

// Fahrbahnbreite bei Streckenmeter s; "normal" = Breite des Belags dort. Ohne Eintrag: normal (unverändert).
export function breiteBei(s, normal) {
  if (!breiteAn) return normal;
  const R = CONFIG.strassenBreiteRampe;
  for (const e of LISTE) {
    if (s < e.von - R || s > e.bis + R) continue;
    const t = s < e.von ? (s - (e.von - R)) / R : s > e.bis ? ((e.bis + R) - s) / R : 1;
    return normal + (e.breite - normal) * t;
  }
  return normal;
}
