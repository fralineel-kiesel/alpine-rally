// Strecken-Lader (seit M10a): liest die Streckendatei, prüft sie schnell und baut daraus die Werte, die der Spielcode
// braucht. STRECKE ist die geladene Strecke (wartet beim Laden der Module mit "await", bis die Datei da ist).
// config.js bindet ihre Werte unter den alten Namen ein (z. B. CONFIG.nebenwege), track.js baut aus "stuetzpunkte".
// Fehlt die Datei oder ist sie ungültig, wirft der Lader einen StreckenFehler: js/start.js zeigt dann die Fehlerseite.

import { aktuellerEintrag, streckenAdresse } from './strecken.js';
import { pruefeStrecke } from './streckenpruefung.js';
import { TEXTE } from './texte.js';

// Fehler beim Laden der Strecke. grund: 'datei' (fehlt/kaputt), 'ungueltig' (Prüfung), 'laenge' (track.js rechnet nach)
export class StreckenFehler extends Error {
  constructor(grund, mehr = '') {
    super(`Strecke konnte nicht geladen werden (${grund}): ${mehr}`);
    this.name = 'StreckenFehler';
    this.grund = grund;
    this.mehr = mehr;
  }
}

export async function ladeStrecke(eintrag) {
  let modul;
  try {
    modul = await import(streckenAdresse(eintrag));
  } catch (e) {
    throw new StreckenFehler('datei', `strecken/${eintrag.datei} (${String(e && e.message || e).split('\n')[0]})`);
  }
  const d = modul.default;
  const fehler = pruefeStrecke(d); // schnell: Version und Pflichtfelder (alles: tools/strecke-pruefen.mjs)
  if (fehler.length) throw new StreckenFehler('ungueltig', `strecken/${eintrag.datei}: ${fehler[0]}${fehler.length > 1 ? ` (+${fehler.length - 1})` : ''}`);
  return bereite(d);
}

// Aus den Daten die Laufzeit-Werte bauen (die Datei selbst bleibt, wie sie ist; hier kommen nur Felder dazu)
function bereite(d) {
  // Stützpunkte so, wie track.js sie liest: Abschnitts-Zeilen { abschnitt, baeume, ... } und Punkte { x, z, h }
  d.stuetzpunkte = d.punkte.map((e) => (typeof e === 'string' ? { abschnitt: e, ...d.abschnitte[e] } : { x: e[0], z: e[1], h: e[2] }));
  // Seeds an die Blöcke, die sie als eigenes Feld lesen
  d.leben.seed = d.seeds.leben;
  d.leben.zaunSeed = d.seeds.lebenZaun;
  if (d.leben.kuehe) d.leben.kuehe.seed = d.seeds.lebenKuehe;
  d.umgebung.berge.seed = d.seeds.berge;
  // Vogel-Dichte je Abschnitts-Name (Umgebungsklang)
  d.klang.voegelDichte = {};
  for (const [name, a] of Object.entries(d.abschnitte)) if (a.voegel != null) d.klang.voegelDichte[name] = a.voegel;
  // Name und Beschreibung als Texte (Menü ETAPPE, Bestzeiten): strecke.<id>.name / .beschreibung
  TEXTE[`strecke.${d.id}.name`] = d.name;
  TEXTE[`strecke.${d.id}.beschreibung`] = d.beschreibung;
  return d;
}

// Die Strecke dieses Spiels
export const STRECKE = await ladeStrecke(aktuellerEintrag());
