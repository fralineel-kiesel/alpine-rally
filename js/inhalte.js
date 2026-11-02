// Autos und Etappen für die Menüseiten AUTO und ETAPPE (seit M5a).
// Weitere Autos: einfach einen Eintrag in js/autos.js (Texte in js/texte.js); Etappen: js/strecken.js,
// das Menü zeigt dann alle untereinander.

// M8c: die Autos kommen aus js/autos.js (Reihenfolge wie dort), Texte je Id in js/texte.js (auto.<id>.name, .daten1/2)
import { AUTO_MODELLE } from './autos.js';
import { STRECKE } from './streckenlader.js';

export const AUTOS = Object.keys(AUTO_MODELLE).map((id) => ({ id, name: `auto.${id}.name`, daten: [`auto.${id}.daten1`, `auto.${id}.daten2`] }));

// Seit M10a aus der Streckendatei (js/streckenlader.js): Kennung (für die Bestzeiten), Name und Beschreibung.
// laenge (km) und checkpoints werden beim Laden aus der Strecke gesetzt (main.js)
export const ETAPPEN = [
  { id: STRECKE.etappe, name: `strecke.${STRECKE.id}.name`, daten: [`strecke.${STRECKE.id}.beschreibung`], laenge: 0, checkpoints: 0 },
];

// Was ist gewählt? (Nummer in den Listen; das Auto setzt main.js, seit M8c aus der Garage)
export const auswahl = { auto: 0, etappe: 0 };
