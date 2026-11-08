// Hohlwege (Meilenstein 11a.1): eingesenkte Schneestrasse der Gletscher-Etappe (Streckendatei "hohlwege").
// Die Strasse liegt im Hohlweg CONFIG.hohlweg.tiefe Meter tiefer (wie eine runtergefahrene Schneepiste), links und
// rechts steigt eine breite, schräge Schneebank an (js/schneewall.js baut sie dort statt des niedrigen Walls; sie wirkt
// wie der Schneewall: bremst, schiebt heraus, keine Strafe). Ein- und Ausfahrt über eine sanfte Rampe.
// Wie bei den Sprüngen ändert sich nur die Höhe der Strasse: Draufsicht, Länge und Streckenmeter bleiben gleich, das
// Gelände nahe der Strasse folgt von selbst. Ohne "hohlwege" (Alpen, Finnland) passiert hier nichts.
import { CONFIG } from './config.js';
import { STRECKE } from './streckenlader.js';
import { glatt } from './util.js';

// Liste der Hohlwege [{ von, bis, tiefe, rampe }] (Werte aus config.js, falls in der Streckendatei nicht angegeben)
export function hohlwege() {
  const C = CONFIG.hohlweg || { tiefe: 0.8, rampe: 35 };
  return ((STRECKE && STRECKE.hohlwege) || []).map((h) => ({ von: h.von, bis: h.bis, tiefe: h.tiefe ?? C.tiefe, rampe: h.rampe ?? C.rampe }));
}

// Anteil 0..1 bei Streckenmeter s: 0 = normale Strasse, 1 = ganz eingesenkt (dazwischen die Rampe, weich)
export function hohlwegAnteil(liste, s) {
  for (const h of liste) {
    if (s <= h.von || s >= h.bis) continue;
    return Math.min(glatt(h.von, h.von + h.rampe, s), 1 - glatt(h.bis - h.rampe, h.bis, s));
  }
  return 0;
}

// Strasse absenken (py: Höhen je Streckenpunkt, sArr: Streckenmeter je Punkt)
export function wendeHohlwegAn(py, sArr, liste) {
  for (const h of liste) for (let i = 0; i < py.length; i++) if (sArr[i] > h.von && sArr[i] < h.bis) py[i] -= h.tiefe * hohlwegAnteil([h], sArr[i]);
}
