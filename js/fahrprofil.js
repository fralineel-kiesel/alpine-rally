// Fahrprofile (Meilenstein 8a): Das heutige Fahrverhalten steht in config.js unter "auto" und "getriebe" und ist die
// Referenz (Profil "prototyp": daran hängen Pace-Notes, Abkürzungs-Sperren und die Testfahrer-Zeiten). Ein Auto mit
// eigenem Fahrgefühl (z. B. der Ringwerk RT4) ist ein Profil in config.js (fahrprofile), das nur einzelne Werte
// überschreibt. Beim Start legt main.js das gewählte Profil über die Referenz, bevor gefahren wird.
// Auswahl: index.html?auto=prototyp oder ?auto=rt4 (Standard: rt4, unbekannter Wert: rt4).
// Das Fahr-Labor (?fahrlabor=1) schaltet hiermit live um. Diese Datei kennt kein Three.js.

import { CONFIG } from './config.js';

export const STANDARD_PROFIL = 'rt4';
export const REFERENZ_PROFIL = 'prototyp';

// Kopie der Referenz (nur Zahlen, Texte, Wahrheitswerte, Felder, null), gemerkt beim Laden – bevor ein Profil darüberliegt
const kopie = (o) => JSON.parse(JSON.stringify(o));
const REFERENZ = { auto: kopie(CONFIG.auto), getriebe: kopie(CONFIG.getriebe) };

const istObjekt = (w) => w !== null && typeof w === 'object' && !Array.isArray(w);
// ziel an Ort und Stelle auf die Werte von quelle setzen (Objekte bleiben dieselben, die Physik liest sie jeden Schritt)
function setzeGleich(ziel, quelle) {
  for (const k of Object.keys(ziel)) if (!(k in quelle)) delete ziel[k];
  for (const [k, w] of Object.entries(quelle)) {
    if (istObjekt(w)) {
      if (!istObjekt(ziel[k])) ziel[k] = {};
      setzeGleich(ziel[k], w);
    } else ziel[k] = Array.isArray(w) ? kopie(w) : w;
  }
}
// Werte aus dem Profil über ziel legen (nur was dort steht)
function ueberlagere(ziel, profil) {
  for (const [k, w] of Object.entries(profil)) {
    if (istObjekt(w)) {
      if (!istObjekt(ziel[k])) ziel[k] = {};
      ueberlagere(ziel[k], w);
    } else ziel[k] = Array.isArray(w) ? kopie(w) : w;
  }
}

let aktiv = null;
// Welches Profil gilt gerade? ('prototyp', 'rt4', ...)
export const aktivesProfil = () => aktiv;
// Gibt es dieses Profil?
export const gibtProfil = (id) => !!(id && CONFIG.fahrprofile && Object.prototype.hasOwnProperty.call(CONFIG.fahrprofile, id));

// Profil wählen: Referenz wiederherstellen, dann die Werte des Profils darüberlegen. Unbekannt oder leer: Standard (rt4).
// Ergebnis: die Id des Profils, das jetzt gilt.
export function waehleFahrprofil(id) {
  const name = gibtProfil(id) ? id : STANDARD_PROFIL;
  setzeGleich(CONFIG.auto, REFERENZ.auto);
  setzeGleich(CONFIG.getriebe, REFERENZ.getriebe);
  const p = (CONFIG.fahrprofile || {})[name] || {};
  if (p.auto) ueberlagere(CONFIG.auto, p.auto);
  if (p.getriebe) ueberlagere(CONFIG.getriebe, p.getriebe);
  aktiv = name;
  return name;
}

// Profil aus der Adresse (?auto=...), null = keins angegeben
export function profilAusAdresse(suche = typeof location !== 'undefined' ? location.search : '') {
  return new URLSearchParams(suche).get('auto');
}

// Wert eines Profils an einem Pfad ('auto.gripVorne', 'getriebe.allrad.schotter'), ohne etwas umzuschalten
export function profilWert(id, pfad) {
  const [bereich, ...rest] = pfad.split('.');
  const lies = (o) => rest.reduce((w, k) => (w == null ? undefined : w[k]), o);
  const p = ((CONFIG.fahrprofile || {})[id] || {})[bereich];
  const w = p ? lies(p) : undefined;
  return w !== undefined ? w : lies(REFERENZ[bereich]);
}
