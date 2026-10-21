// Fahrprofile (Meilenstein 8a): Das heutige Fahrverhalten steht in config.js unter "auto" und "getriebe" und ist die
// Referenz (Profil "prototyp": daran hängen Pace-Notes, Abkürzungs-Sperren und die Testfahrer-Zeiten). Ein Auto mit
// eigenem Fahrgefühl (z. B. der Audan Quarto, Id rt4) ist ein Profil in config.js (fahrprofile), das nur einzelne Werte
// überschreibt. Beim Start legt main.js das gewählte Profil über die Referenz, bevor gefahren wird.
// Auswahl: index.html?auto=prototyp oder ?auto=rt4 (Standard: rt4, unbekannter Wert: rt4). Seit M8c wählt das Menü
// (Garage) das Auto und damit sein Profil (main.js); ?auto= setzt weiter beides (Tests).
// M8c: Block "ton" im Profil ({ turboMal, knallMal }, fehlt = 1): wie stark Turbo-Pfeifen/Blow-off und Pops klingen.
// Er liegt nicht in CONFIG, sondern in tonWerte (immer dasselbe Objekt, js/audio.js liest es über main.js).
// M8d: Motorklang je Auto: ton.motor = nur die Werte aus audio.motor, die vom Audan (Referenz) abweichen (auch einzelne
// Werte in pop/klack, Listen als Ganzes). Wie bei auto und getriebe: Schnappschuss der Referenz beim Laden, das gewählte
// Profil darüber, bei jedem Wechsel zuerst zurück auf die Referenz (kein Wert bleibt hängen). js/audio.js liest die
// Werte direkt aus CONFIG.audio.motor; was dort beim Bau fest ist, setzt main.js nach dem Wechsel neu (ton.motorNeu).
// Das Fahr-Labor (?fahrlabor=1) schaltet hiermit live um (nur das Fahrgefühl, den Motorklang nicht: der wechselt nur im
// Menü). Diese Datei kennt kein Three.js.

import { CONFIG } from './config.js';

export const STANDARD_PROFIL = 'rt4';
export const REFERENZ_PROFIL = 'prototyp';

// Kopie der Referenz (nur Zahlen, Texte, Wahrheitswerte, Felder, null), gemerkt beim Laden – bevor ein Profil darüberliegt
const kopie = (o) => JSON.parse(JSON.stringify(o));
const REFERENZ = { auto: kopie(CONFIG.auto), getriebe: kopie(CONFIG.getriebe), ton: { turboMal: 1, knallMal: 1 }, motor: kopie(CONFIG.audio.motor) };
// M8c: Ton-Werte des gewählten Profils (Turbo-Pfeifen und Blow-off mal turboMal, Knall-Chance mal knallMal)
export const tonWerte = { ...REFERENZ.ton };

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

let aktiv = null, aktivTon = null;
// Welches Profil gilt gerade? ('prototyp', 'rt4', ...)
export const aktivesProfil = () => aktiv;
// Gibt es dieses Profil?
export const gibtProfil = (id) => !!(id && CONFIG.fahrprofile && Object.prototype.hasOwnProperty.call(CONFIG.fahrprofile, id));

// Profil wählen: Referenz wiederherstellen, dann die Werte des Profils darüberlegen. Unbekannt oder leer: Standard (rt4).
// motorTon (M8d): auch den Motorklang umschalten (Standard ja; das Fahr-Labor schaltet nur das Fahrgefühl).
// Ergebnis: die Id des Profils, das jetzt gilt.
export function waehleFahrprofil(id, { motorTon = true } = {}) {
  const name = gibtProfil(id) ? id : STANDARD_PROFIL;
  setzeGleich(CONFIG.auto, REFERENZ.auto);
  setzeGleich(CONFIG.getriebe, REFERENZ.getriebe);
  const p = (CONFIG.fahrprofile || {})[name] || {};
  if (p.auto) ueberlagere(CONFIG.auto, p.auto);
  if (p.getriebe) ueberlagere(CONFIG.getriebe, p.getriebe);
  setzeGleich(tonWerte, REFERENZ.ton);
  if (p.ton) { const { motor, ...rest } = p.ton; ueberlagere(tonWerte, rest); }
  aktiv = name;
  if (motorTon) waehleMotorTon(name);
  return name;
}

// M8d: nur den Motorklang eines Profils über die Referenz (audio.motor) legen. Ergebnis: Id des Profils
export function waehleMotorTon(id) {
  const name = gibtProfil(id) ? id : STANDARD_PROFIL;
  setzeGleich(CONFIG.audio.motor, REFERENZ.motor);
  const p = (CONFIG.fahrprofile || {})[name] || {};
  if (p.ton && p.ton.motor) ueberlagere(CONFIG.audio.motor, p.ton.motor);
  aktivTon = name;
  return name;
}
// Welcher Motorklang gilt gerade?
export const aktivesTonProfil = () => aktivTon;
// Referenzwert des Motorklangs (audio.motor aus config.js, wie beim Laden) an einem Pfad ('rauh', 'pop.mitte')
export function motorReferenz(pfad) {
  return pfad.split('.').reduce((w, k) => (w == null ? undefined : w[k]), REFERENZ.motor);
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
