// Autos und Etappen für die Menüseiten AUTO und ETAPPE (seit M5a).
// Weitere Autos/Etappen: einfach einen Eintrag in die Liste schreiben (Texte in js/texte.js),
// das Menü zeigt dann alle untereinander.

export const AUTOS = [
  { id: 'rt4', name: 'auto.rt4.name', daten: ['auto.rt4.daten1', 'auto.rt4.daten2'] },
];

// laenge (km) und checkpoints werden beim Laden aus der Strecke gesetzt (main.js)
export const ETAPPEN = [
  { id: 'passstrasse', name: 'etappe.pass.name', daten: ['etappe.pass.daten2'], laenge: 0, checkpoints: 0 },
];

// Was ist gewählt? (bis jetzt gibt es nur je eines)
export const auswahl = { auto: 0, etappe: 0 };
