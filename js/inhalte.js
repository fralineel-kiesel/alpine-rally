// Autos und Etappen für die Menüseiten AUTO und ETAPPE (seit M5a).
// Weitere Autos/Etappen: einfach einen Eintrag in die Liste schreiben (Texte in js/texte.js),
// das Menü zeigt dann alle untereinander.

// M8c: die Autos kommen aus js/autos.js (Reihenfolge wie dort), Texte je Id in js/texte.js (auto.<id>.name, .daten1/2)
import { AUTO_MODELLE } from './autos.js';

export const AUTOS = Object.keys(AUTO_MODELLE).map((id) => ({ id, name: `auto.${id}.name`, daten: [`auto.${id}.daten1`, `auto.${id}.daten2`] }));

// laenge (km) und checkpoints werden beim Laden aus der Strecke gesetzt (main.js)
export const ETAPPEN = [
  { id: 'passstrasse', name: 'etappe.pass.name', daten: ['etappe.pass.daten2'], laenge: 0, checkpoints: 0 },
];

// Was ist gewählt? (Nummer in den Listen; das Auto setzt main.js, seit M8c aus der Garage)
export const auswahl = { auto: 0, etappe: 0 };
