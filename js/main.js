// Start des Spiels und Spielschleife.
// Seit M5a mit Ablauf: Titel -> Hauptmenü (Demo-Fahrt dahinter) -> Rennen <-> Pause (js/ablauf.js).
// Seit M5b: STARTEN -> Countdown 3-2-1-GO -> Rennen -> Ziel ("ZIEL!", 3 s) -> Zielbildschirm (Bestzeiten, Statistik).
// Seit M6: Minimap und Live-Vergleich im HUD (Fahrspur alle 10 m, js/vergleich.js), Taste H = HUD aus/an.
// Seit M6.1: Zwischenzeit-Meldung grün/rot je nach Vergleich mit der Referenz an diesem Checkpoint.
// Seit M7a: Ton (js/audio.js) – erst nach dem ersten Tastendruck auf dem Titel; ohne Ton mit ?menue=aus oder ?ton=aus.
//           Der Ton liest nur (ton.aktualisiere einmal pro Bild, Ereignisse an den bestehenden Stellen).
// Seit M7b: Umgebungsklänge (Hörer = Kamera, Quellen einmal nach dem Aufbau der Welt) und Menü-Musik (musikModus).
// Seit M8a: Auto als 3D-Modell (js/car.js, Daten in js/autos.js) mit Federung (js/federung.js), Bremslicht,
//           Rückfahrlicht und Dreck; alles nur Optik (liest die Physik, ändert sie nie).
//           Fahrprofile (js/fahrprofil.js): ?auto=prototyp (Fahrverhalten bis 0.7b, Referenz) oder ?auto=rt4 (Standard);
//           mit ?fahrlabor=1 ein Seitenpanel zum Nachstellen (js/fahrlabor.js, sonst nicht geladen).
// Seit M8c: mehrere Autos. Das Menü (Garage, Seite AUTO) wählt Auto und Lackierung (autoWechseln): Modell neu bauen,
//           Fahrprofil umschalten, Masse (Felswand, Kollision, Staub) vom Modell; gemerkt in den Einstellungen.
//           ?auto=<id> (prototyp, rt4, delto, escorta) setzt Modell und Profil für Tests (prototyp = Audan mit Referenzprofil).
// Am Menü vorbei (für Tests): index.html?menue=aus oder window.__alpineRally.start({ countdown: false })
// (ohne Countdown wie vor M5b: Auto bei strasse.spawnBeiMeter, Zeit beginnt beim Überfahren der Startlinie).

import * as THREE from 'three';
import { CONFIG } from './config.js';
import { t, setzeSprache, beiSprachwechsel } from './texte.js';
import { einstellungen, ladeEinstellungen, setze, beiAenderung, belegeTaste } from './einstellungen.js';
import { baueAblauf } from './ablauf.js';
import { baueMenue } from './menue.js';
import { baueSeiten } from './menueseiten.js';
import { baueDemo } from './demofahrt.js';
import { AUTOS, ETAPPEN, auswahl } from './inhalte.js';
import { speichereBestzeit, hundertstel, ladeBestzeiten, speichereLetztenLauf, ladeLetztenLauf } from './bestzeiten.js';
import { baueVergleich } from './vergleich.js';
import { zeichneCountdown, countdownNummer } from './rennablauf.js';
import { baueStrecke } from './track.js';
import { baueWelt } from './world.js';
import { baueNetz } from './netz.js';
import { bauePflanzen, baueDeko, spriteGruppe } from './sprites.js';
import { baueAuto } from './car.js';
import { baueGarage } from './garage.js';
import { autoZuordnung, gibtAuto, STANDARD_AUTO, AUTO_MODELLE } from './autos.js';
import { baueFederung } from './federung.js';
import { Fahrphysik } from './physics.js';
import { Getriebe } from './getriebe.js';
import { baueAufheulen } from './tonfahrt.js';
import { waehleFahrprofil, profilAusAdresse, aktivesProfil, REFERENZ_PROFIL, tonWerte } from './fahrprofil.js';
import { leseEingabe, aktualisierePad, pad, setzeAbfangen, eingabeLeeren, tastenName } from './input.js';
import { baueTouch, beiTouchWechsel } from './touch.js'; // M9a: Touch-Knöpfe fürs Handy
import { baueHud, formatZeit } from './hud.js';
import { baueTachos } from './tacho.js';
import { pixelText } from './pixel.js';
import { baueKollision } from './kollision.js';
import { baueCheckpointTore } from './checkpoints.js';
import { baueStrassenrand } from './strassenrand.js';
import { baueKuehe } from './kuehe.js';
import { baueAbsperrungen } from './absperrungen.js';
import { baueStaub } from './staub.js';
import { baueStartZiel } from './startziel.js';
import { baueLeben, lebenPlaetze } from './leben.js';
import { bauePaceNotes } from './pacenotes.js';
import { winkelNorm, begrenze } from './util.js';
import { baueTon, materialVon, materialNr } from './audio.js';
import { umgebungsQuellen } from './umgebung.js';

// Einstellungen laden (fehlt der Browser-Speicher: Standardwerte) und Sprache setzen
ladeEinstellungen();
setzeSprache(einstellungen.sprache);
function dokumentSprache() {
  document.documentElement.lang = einstellungen.sprache;
  document.title = t('dokument.titel');
}
dokumentSprache();
beiSprachwechsel(dokumentSprache);
const menueAn = CONFIG.menue.an && new URLSearchParams(window.location.search).get('menue') !== 'aus';
// M8a: Fahrprofil über die Referenzwerte legen, bevor Physik und Getriebe gebaut werden.
// M8c: Auto aus der Adresse (?auto=..., nur für diesen Besuch, wird nicht gemerkt), sonst das gemerkte, sonst Audan Quarto
const adressAuto = profilAusAdresse();
let autoWahl = autoZuordnung(gibtAuto(adressAuto) ? adressAuto : gibtAuto(einstellungen.auto) ? einstellungen.auto : STANDARD_AUTO);
waehleFahrprofil(autoWahl.profil);
const fahrlaborAn = new URLSearchParams(window.location.search).get('fahrlabor') === '1';
// Ton (M7a): nur mit Menü (Tests mit ?menue=aus bleiben stumm), nicht mit ?ton=aus oder audio.an = false.
// Der AudioContext entsteht erst beim ersten Tastendruck / Klick auf dem Titel (zumMenue).
const ton = baueTon({ an: CONFIG.audio.an && menueAn && new URLSearchParams(window.location.search).get('ton') !== 'aus' });
ton.lautstaerke(einstellungen.lautstaerke);
ton.signalLautstaerke(einstellungen.signale); // M7a.1: Regler SIGNALTÖNE
ton.musikLautstaerke(einstellungen.musik); // M7b: Regler MUSIK

const lade = document.getElementById('lade');
lade.innerHTML = `${t('lade.titel')}<br><small>${t('lade.bauen')}</small>`;
function zeigeFehler(text) {
  lade.style.display = 'flex';
  lade.innerHTML = `${t('lade.fehler')}<br><small>${text}</small>`;
}
window.addEventListener('error', (e) => zeigeFehler(e.message));

// Kurz warten, damit "Lade..." sichtbar wird, bevor die Welt gebaut wird
await new Promise((r) => setTimeout(r, 30));

const B = CONFIG.bild.breite, H = CONFIG.bild.hoehe;
const buehne = document.getElementById('buehne');

// --- Renderer: feste kleine Auflösung, scharf hochskaliert ---
const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById('spiel'), antialias: false, powerPreference: 'high-performance',
});
renderer.setPixelRatio(1);
// Pixelgrösse (M5a): nur das 3D-Bild wird feiner, HUD und Menü bleiben im 320x180-Raster
function aufloesungSetzen() {
  const [rb, rh] = CONFIG.menue.aufloesungen[einstellungen.aufloesung] || [B, H];
  renderer.setSize(rb, rh, false);
}
aufloesungSetzen();

let touch = null; // M9a: Touch-Steuerung (js/touch.js), gebaut nach dem Menü
function anpassen() {
  if (touch && touch.an) { touch.layout(); return; } // M9a: im Touch-Modus legt js/touchlayout.js Bild und Knöpfe fest
  // (M8a: mit Fahr-Labor rückt das Bild um die Breite des Panels nach links)
  const breite = window.innerWidth - (fahrlabor ? fahrlabor.breite : 0);
  let s = Math.min(breite / B, window.innerHeight / H);
  if (CONFIG.bild.ganzzahligSkalieren && s >= 1) s = Math.floor(s);
  buehne.style.width = `${Math.floor(B * s)}px`;
  buehne.style.height = `${Math.floor(H * s)}px`;
}
let fahrlabor = null; // M8a: Seitenpanel (nur mit ?fahrlabor=1)
window.addEventListener('resize', anpassen);
anpassen();

// --- Szene, Licht, Nebel ---
const szene = new THREE.Scene();
szene.background = new THREE.Color(CONFIG.farben.dunst);
szene.fog = new THREE.Fog(CONFIG.farben.dunst, CONFIG.nebel.start, CONFIG.nebel.ende);
// Dunst nie ganz dicht (nebel.maxDichte): sonst wird alles ferne Gelände eine
// flache hellblaue Fläche unter den Bergen. Gilt für alle Materialien mit Nebel.
THREE.ShaderChunk.fog_fragment = THREE.ShaderChunk.fog_fragment.replace(
  'fogColor, fogFactor )', `fogColor, fogFactor * ${CONFIG.nebel.maxDichte.toFixed(3)} )`,
);
const l = CONFIG.licht;
szene.add(new THREE.AmbientLight(l.umgebungFarbe, l.umgebungStaerke));
const sonne = new THREE.DirectionalLight(l.sonneFarbe, l.sonneStaerke);
sonne.position.set(...l.sonneRichtung);
szene.add(sonne);

const kamera = new THREE.PerspectiveCamera(CONFIG.kamera.sichtfeld, B / H, 0.3, CONFIG.kamera.sichtweite);

// --- Welt aufbauen ---
const strecke = baueStrecke();
// Strassennetz (M3a): Etappe + Stummel an den Nebenwegen (nur für Gelände, Boden, Bäume, Rand)
const netz = baueNetz(strecke);
const welt = baueWelt(szene, strecke, netz);
const pflanzen = bauePflanzen(szene, strecke, welt);
// Leitplanken, Holzzäune, Schilder (Meilenstein 2a) – sind auch Hindernisse
const strassenrand = baueStrassenrand(szene, strecke, welt, pflanzen);
// Absperrungen auf den Stummeln der Nebenwege (M3a) – Hindernisse wie der Strassenrand
const absperrungen = baueAbsperrungen(szene, welt, [...pflanzen.hindernisse, ...strassenrand.hindernisse]);
strassenrand.hindernisse.push(...absperrungen.hindernisse);
// Kühe auf den Weiden (Meilenstein 2b) – sind auch Hindernisse
// (M3d: die neuen Herden am Wiesenweg lassen die Plätze von Hütte und Details frei)
const kuehe = baueKuehe(szene, strecke, welt, pflanzen, strassenrand, lebenPlaetze(netz));
// Start- und Zielbereich (M3c): Bögen, Band, Stroh, Zuschauer, Zelte, Autos – sind auch Hindernisse.
// Nach den Kühen (weicht ihnen aus); die Bäume kommen zu den anderen Bäumen (gleiche Zeichenaufrufe)
const startZiel = baueStartZiel(szene, strecke, welt, { pflanzen, rand: strassenrand, kuehe });
strassenrand.hindernisse.push(...startZiel.hindernisse);
if (startZiel.tannen.length || startZiel.laub.length) {
  pflanzen.tannen.push(...startZiel.tannen);
  pflanzen.laubbaeume.push(...startZiel.laub);
  pflanzen.hindernisse.push(...startZiel.hindernisseBaeume);
  const m = pflanzen.meshes;
  if (m.laub) { szene.remove(m.laub); m.laub.geometry.dispose(); m.laub.material.dispose(); }
  szene.add(m.laub = spriteGruppe(pflanzen.laubbaeume, pflanzen.laubTex));
}
startZiel.fern.push(...(absperrungen.meshes || []).filter((m) => m !== absperrungen.mesh && !m.name.startsWith('absperrungen-nebenweg-')));
// M3b: Absperrungen der weiteren Nebenwege (je eine Geometrie) gehen weiter weg als absperrung.sichtweite aus
const nebenwegSperren = (absperrungen.meshes || []).filter((m) => m.name.startsWith('absperrungen-nebenweg-'));
function nebenwegSperrenZeigen(kamPos) {
  for (const m of nebenwegSperren) {
    const k = m.geometry.boundingSphere;
    m.visible = k.center.distanceTo(kamPos) - k.radius < CONFIG.absperrung.sichtweite;
  }
}
// Leben an der Strecke (M3d): Alphütte und Details am Wiesenweg, Fan-Spots, Unfallautos – sind auch Hindernisse
const leben = baueLeben(szene, strecke, welt, { pflanzen, rand: strassenrand, kuehe });
strassenrand.hindernisse.push(...leben.hindernisse);
// Büsche, Jungtannen, Grasbüschel, Wald in der Ferne (M2b) – reine Deko, keine Hindernisse
const deko = baueDeko(szene, strecke, welt, pflanzen, strassenrand, kuehe, [...startZiel.buesche, ...leben.buesche]);
// (materialVon, M7a: Material je Hindernis nur für den Aufprallton; die Kollisionsrechnung bleibt gleich)
const kollision = baueKollision([...pflanzen.hindernisse, ...strassenrand.hindernisse, ...kuehe.hindernisse], materialVon);
const checkpoints = baueCheckpointTore(szene, strecke, netz);
const staub = baueStaub(szene); // Staub auf Schotter (M3a) und Wiesenweg (M3b)
const staubAuto = { x: 0, y: 0, z: 0, richtung: 0, vx: 0, vz: 0, tempo: 0, drift: 0, gas: 0, handbremse: false, schotter: false, belag: null, hinten: 1.3, seite: 0.75 };
// M8c: gemerkte Lackierung dieses Autos (unbekannt: car.js nimmt die erste des Autos)
const lackFuer = (modell) => einstellungen.lacke[modell] || null;
let auto = baueAuto(autoWahl.modell, lackFuer(autoWahl.modell), renderer.domElement.width); // (M8a: Detail nach Pixelgrösse)
szene.add(auto.objekt);
// M8c: alles, was an den Massen hängt, kommt vom gewählten Modell (Audan Quarto: genau die Werte von 0.8b)
function masseSetzen(m) {
  CONFIG.grenze.wandHuelle.laenge = m.masse.laenge; CONFIG.grenze.wandHuelle.breite = m.masse.breite;
  CONFIG.kollision.autoLaenge = m.kollision.laenge; CONFIG.kollision.autoBreite = m.kollision.breite;
  staubAuto.hinten = m.staub.hinten; staubAuto.seite = m.staub.seite;
}
masseSetzen(auto.modell);
const federung = baueFederung(); // M8a: Nicken, Rollen, Hub der Karosserie (nur Optik)
// M8a: Dreck am Auto (Menge 0..autoOptik.dreck.max, Farbe linear r, g, b); sauber bei jedem Start und Neustart
const dreck = { menge: 0, r: 0, g: 0, b: 0 };
const dreckFarben = {};
for (const [art, d] of Object.entries(CONFIG.autoOptik.dreck.belaege)) {
  const c = new THREE.Color(d.farbe || (CONFIG.staub.belaege[art] || {}).farbe || CONFIG.staub.farbe);
  dreckFarben[art] = { r: c.r, g: c.g, b: c.b };
}
// M8a: Eingabe des letzten Physik-Schritts (auch in der Demo-Fahrt) für Bremslicht und Rückfahrlicht
const lichtEin = { gas: 0, bremse: 0, handbremse: false };
const radZustand = { lenkwinkel: 0, strecke: 0, tempo: 0 }; // M8a: Räder (Einschlag, Strecke seit dem letzten Bild, Tempo)
const physik = new Fahrphysik();
const getriebe = new Getriebe();
// HUD mit Minimap (M6: die Karte wird hier einmal aus der Strecke gemalt)
const minimapT0 = performance.now();
const hud = baueHud(document.getElementById('hud'), strecke, checkpoints);
const minimapMs = performance.now() - minimapT0;
// Live-Vergleich (M6): Fahrspur dieses Laufs und Referenz (Bestzeit oder letzter Lauf)
const vergleich = baueVergleich(strecke, checkpoints);
// Pace-Notes (M4): Ansagen oben im Bild, beim Laden aus der Strecke berechnet
const paceNotes = bauePaceNotes(strecke, netz);
// Umgebungsklänge (M7b): Herden, Publikum, Brunnen, Vögel je Abschnitt, Passhöhe – nur gelesen, erst bei Bedarf
// berechnet (beim Entsperren des Tons), damit das Laden der Seite gleich lang bleibt
let tonQuellenWert = null;
const tonQuellen = () => tonQuellenWert || (tonQuellenWert = umgebungsQuellen({ strecke, netz, kuehe, startZiel, leben }));
ton.quellen(tonQuellen);

// --- Rennzustand ---
// bereit = vor der Startlinie (auch im Countdown), laeuft = Zeit läuft, ziel = durchs Ziel
const rennen = {
  zustand: 'bereit', zeit: 0, endZeit: 0, letztesS: 0, hilfe: true,
  naechsterCp: 0,        // welcher Checkpoint als nächster kommt (0 = der erste)
  zwischenzeiten: [],    // Zeit bei jedem Checkpoint (null = verpasst)
  cpVergleich: [],       // M7a: je erreichtem Checkpoint -1 schneller / 1 langsamer / 0 gleich oder keine Referenz (Punkte, Ton)
  meldung: null,         // Text oben im Bild: { text, farbe, bis, verpasstCp } (verpasstCp: M6, Minimap färbt ihn rot)
  uhr: 0,                // läuft immer (für die Anzeigedauer der Meldungen)
};
let debugAn = einstellungen.fps; // F3 (seit M5a auch in den Einstellungen, wird gespeichert)

// --- Rennablauf (M5b): Countdown, Ziel, Zielbildschirm ---
const RA = CONFIG.rennablauf;
const lauf = {
  mitCountdown: false, // wurde der laufende Lauf mit Countdown gestartet? (Neustart macht es wieder so)
  countdown: 0,        // Sekunden seit Beginn des Countdowns (3 Zahlen à rennablauf.zahlDauer)
  go: 0,               // so lange steht "GO!" noch (Sekunden)
  zielWarte: 0,        // Sekunden seit der Ziellinie (Zielbildschirm nach rennablauf.zielSchirmNach)
  zielErledigt: false, // Zeit schon eingetragen?
  ergebnis: null,      // was der Zielbildschirm zeigt (siehe zielErreicht)
  markiert: null,      // { etappe, datum } der gerade eingetragene Lauf (Bestzeiten-Seite, bis zum nächsten Start)
  pauseVon: 'rennen',  // aus welchem Zustand kam die Pause (rennen oder countdown)?
};
// --- Statistik (M5b): nur im Rennen zwischen GO und Ziel (rennen.zustand 'laeuft'), nicht in der Demo-Fahrt ---
const stat = {
  aufpralle: 0,          // harte Kontakte über rennablauf.aufprallSchwelle (einmal je Aufprall)
  hoechstTempo: 0,       // m/s
  resetsBasis: 0,        // rueck.anzahl beim Start (Resets = rueck.anzahl - resetsBasis)
  letzterAufprall: -1e9, // rennen.uhr beim letzten gezählten Aufprall (Sperrzeit)
};
const statResets = () => rueck.anzahl - stat.resetsBasis;
// Aufprall melden: wucht = Tempo Richtung Hindernis (m/s). Zählt einmal, dann rennablauf.aufprallSperre Ruhe
function aufprallZaehlen(wucht) {
  if (rennen.zustand !== 'laeuft' || !(wucht > RA.aufprallSchwelle)) return;
  if (rennen.uhr - stat.letzterAufprall < RA.aufprallSperre) return;
  stat.aufpralle++;
  stat.letzterAufprall = rennen.uhr;
}
// Tempo in die Grenze hinein (Richtung nx/nz zeigt in die Wand, wie bei physik.anGrenze)
const grenzWucht = (nx, nz) => Math.max(0, physik.vx * nx + physik.vz * nz);
// Für den Ton (M7a, nur gelesen): stärkster Kontakt im Bild (Wucht, Material), Kontakt zum Schleifen, Pedale aus der Physik
const FELS = materialNr('fels');
const tonInfo = { wucht: 0, art: 0, kontaktArt: -1, kontaktTempo: 0 };
const tonEingabe = { gas: 0, bremse: 0, handbremse: false };
let pnStand = 0; // so viele Pace-Notes-Kacheln sind schon erschienen (für das Signal)

const kam = { yaw: 0, pos: new THREE.Vector3(), ziel: new THREE.Vector3() };
const optik = { neigX: 0, neigZ: 0 }; // Neigung zum Gelände (seit M8a: Nicken und Rollen in js/federung.js)

function setzeAuf(s, seite = 0) {
  rueck.rest = 0; // ein laufender R-Countdown ist damit erledigt
  const p = strecke.punktBei(s);
  physik.reset(p.x + -p.tz * seite, p.z + p.tx * seite, Math.atan2(p.tx, p.tz));
  getriebe.reset();
  rennen.letztesS = s;
  kameraSofort();
}

function neustart() {
  setzeAuf(CONFIG.strasse.spawnBeiMeter);
  rennen.zustand = 'bereit';
  rennen.zeit = 0;
  rennen.endZeit = 0;
  rennen.naechsterCp = 0;
  rennen.zwischenzeiten = [];
  rennen.cpVergleich = [];
  rennen.meldung = null;
  paceNotes.zuruecksetzen();
  // M6: Fahrspur leeren, Referenz für den Live-Vergleich laden (nur hier, nicht jedes Bild)
  vergleich.zuruecksetzen();
  referenzLaden();
  // M5b: Statistik und Ziel zurück
  stat.aufpralle = 0; stat.hoechstTempo = 0; stat.resetsBasis = rueck.anzahl; stat.letzterAufprall = -1e9;
  lauf.countdown = 0; lauf.go = 0; lauf.zielWarte = 0; lauf.zielErledigt = false; lauf.ergebnis = null;
  // M7a: Ton – alle Schichten weich aus, nichts bleibt hängen
  ton.allesAus();
  // M8a: Auto wieder sauber
  dreck.menge = 0;
  auto.dreck(dreck);
  tonInfo.wucht = 0; tonInfo.kontaktArt = -1; tonEingabe.gas = 0; tonEingabe.bremse = 0; tonEingabe.handbremse = false;
  pnStand = paceNotes.anzeige.erschienen;
}

function zeigeMeldung(text, farbe, verpasstCp = -1) {
  rennen.meldung = { text, farbe, bis: rennen.uhr + CONFIG.checkpoints.anzeigeDauer, verpasstCp };
}

// Mit welcher Auto-Id wird ein Lauf eingetragen? (M8a: im Vergleichsprofil ?auto=prototyp "prototyp", sonst das Auto)
const laufAuto = () => (aktivesProfil() === REFERENZ_PROFIL ? REFERENZ_PROFIL : AUTOS[auswahl.auto].id);
// Referenz für den Live-Vergleich (M6): Platz 1 der Bestzeiten oder der letzte Lauf dieser Etappe (Einstellung)
// M8h: "Bestzeit" = die Bestzeit des gefahrenen Autos (hat es noch keine: keine Referenz, kein Rückfall auf andere Autos);
// der letzte Lauf gilt weiter egal mit welchem Auto
function referenzLaden() {
  const etappe = ETAPPEN[auswahl.etappe].id;
  const quelle = einstellungen.vergleichMit === 'letzter' ? 'letzter' : 'best';
  const eintrag = quelle === 'letzter' ? ladeLetztenLauf(etappe) : (ladeBestzeiten(etappe, laufAuto())[0] || null);
  vergleich.setzeReferenz(eintrag, quelle);
}

// Taste R (seit M4.1): Während des Rennens erst eine Wartezeit (config.js, zurueck.wartezeit), in der das
// Auto gesperrt ist und bis zum Stand bremst; die Rennzeit läuft weiter. Erst dann aufStrasse().
// Vor dem Start: sofort zurück auf die Strasse (wie bisher). Nach dem Ziel: Neustart (wie bisher).
// Nochmals R während der Wartezeit ändert nichts.
// M5b: Nach dem Ziel = NEU STARTEN (wie der Knopf im Zielbildschirm, mit Countdown, wenn der Lauf einen hatte).
// Im Countdown tut R nichts.
// Ergebnis (für Tests): 'neustart', 'sofort', 'countdown', 'laeuft schon' oder 'gesperrt'
const rueck = { rest: 0, anzahl: 0 }; // rest = verbleibende Wartezeit (s, 0 = kein Countdown), anzahl = ausgelöste Resets
function rTaste() {
  if (ablauf.zustand === 'countdown') return 'gesperrt';
  if (rennen.zustand === 'ziel') { neuStarten(); return 'neustart'; }
  if (rennen.zustand !== 'laeuft' || !(CONFIG.zurueck.wartezeit > 0)) { aufStrasse(); return 'sofort'; }
  if (rueck.rest > 0) return 'laeuft schon';
  rueck.rest = CONFIG.zurueck.wartezeit;
  return 'countdown';
}

// Zurück auf die Strassenmitte an der aktuellen Stelle (Blickrichtung der Strasse, Tempo 0)
function aufStrasse() {
  const q = strecke.abfrage(physik.x, physik.z);
  const s = begrenze(q.s, 2, strecke.laenge - 2);
  const p = strecke.punktBei(s);
  physik.reset(p.x, p.z, Math.atan2(p.tx, p.tz));
  getriebe.reset();
  rennen.letztesS = s;
  kameraSofort();
}

// --- Physik-Schritt mit Untergrund, Steigung und Begrenzungen ---
const qAuto = {}, qGrenze = {};
const SPERRE = { gas: 0, bremse: 0, lenkung: 0, handbremse: false, reset: false, debug: false, notes: false };
// leere Eingabe (nichts gedrückt); wird nie verändert
const LEER = Object.freeze({ gas: 0, bremse: 0, lenkung: 0, handbremse: false, reset: false, debug: false, notes: false, pause: false, hud: false });
const SCHRITT = 1 / 120;
let untergrund = 'asphalt';

function bodenHoehe(x, z) {
  return welt.bodenBei(x, z).h;
}

// nurFahren (M5a, Demo-Fahrt): nur Fahren und Kollisionen, keine Zeitmessung, nichts im Rennstand
function physikSchritt(dt, e, nurFahren = false) {
  const q = strecke.abfrage(physik.x, physik.z, qAuto);
  const boden = welt.bodenBei(physik.x, physik.z, q);
  untergrund = boden.art;
  const fx = Math.sin(physik.richtung), fz = Math.cos(physik.richtung);
  const hv = bodenHoehe(physik.x + fx * 1.3, physik.z + fz * 1.3);
  const hh = bodenHoehe(physik.x - fx * 1.3, physik.z - fz * 1.3);
  const u = CONFIG.untergrund[boden.art];

  let eingabe = e;
  // R-Countdown (M4.1): Auto gesperrt, bremst bis zum Stand (zurück auf die Strasse am Ende des Schritts)
  if (rueck.rest > 0 && !nurFahren) {
    if (rennen.zustand !== 'laeuft') rueck.rest = 0; // (z. B. im Ziel ausgerollt)
    else {
      const zb = CONFIG.zurueck.bremse;
      eingabe = SPERRE;
      SPERRE.bremse = physik.vVor > 0.5 ? zb : 0;
      SPERRE.gas = physik.vVor < -0.5 ? zb : 0; // rückwärts rollend: Gas bremst
    }
  }
  // Nach dem Ziel bremst das Auto von selbst bis zum Stand (aber nicht weiter in den Rückwärtsgang)
  // (M3c: Stärke in config.js, startZiel.zielBremse – das Auto steht vor der Absperrung der Ausrollstrecke)
  const zb = CONFIG.startZiel && CONFIG.startZiel.an !== false ? CONFIG.startZiel.zielBremse : 0.35;
  if (rennen.zustand === 'ziel' && !nurFahren) eingabe = { ...e, gas: 0, bremse: physik.vVor > 0.5 ? Math.max(e.bremse, zb) : 0 };
  lichtEin.gas = eingabe.gas; lichtEin.bremse = eingabe.bremse; lichtEin.handbremse = eingabe.handbremse; // M8a: nur für die Lichter

  const xAlt = physik.x, zAlt = physik.z, hAlt = boden.h, wAlt = physik.richtung;
  // Getriebe: wie stark treibt der Motor gerade an (Schaltpause = gar nicht)?
  // (M8a: der Belag geht mit, für die Allrad-Traktion und den Heck-Grip je Belag des Fahrprofils)
  const motor = getriebe.schritt(dt, eingabe, physik.vVor, physik.tempo, u.grip, boden.art);
  physik.schritt(dt, eingabe, {
    grip: u.grip, rollen: u.rollen, rollenTempo: u.rollenTempo, steigung: begrenze((hv - hh) / 2.6, -0.5, 0.5),
    rueckwaerts: u.rueckwaerts ?? 1, heck: u.heck ?? 1, stabilitaet: u.stabilitaet ?? 1, geradeaus: u.geradeaus ?? 1,
    rueckwaertsMax: u.rueckwaertsMax ?? 1, belag: boden.art,
  }, motor);

  // Zu steiler Hang (neben der Strasse): da kommt das Auto nicht hoch
  const g = CONFIG.grenze;
  const bodenNeu = welt.bodenBei(physik.x, physik.z);
  const weg = Math.hypot(physik.x - xAlt, physik.z - zAlt);
  // Steigung im Gelände messen: Stand das Auto vorher auf Asphalt oder Bankett, zählt dort die
  // Geländehöhe. Sonst wirkte die kleine Stufe vom Bankett auf die Wiese (wenige cm auf wenigen mm
  // Weg) wie eine senkrechte Wand, und das Auto blieb an der Bankett-Kante hängen.
  const hVorher = boden.art === 'gras' ? hAlt : welt.gelaendeHoehe(xAlt, zAlt);
  if (bodenNeu.art === 'gras' && weg > 1e-4 && (bodenNeu.h - hVorher) / weg > g.steilsterHang) {
    // Richtung bergauf (Gefälle zwischen alter und neuer Position messen)
    const mx = (physik.x + xAlt) / 2, mz = (physik.z + zAlt) / 2;
    let nx = welt.gelaendeHoehe(mx + 1, mz) - welt.gelaendeHoehe(mx - 1, mz);
    let nz = welt.gelaendeHoehe(mx, mz + 1) - welt.gelaendeHoehe(mx, mz - 1);
    let l = Math.hypot(nx, nz);
    if (l < 1e-3) { nx = physik.x - xAlt; nz = physik.z - zAlt; l = weg; }
    nx /= l; nz /= l;
    // nur den Teil der Bewegung bergauf zurücknehmen, seitlich darf es weiter
    const bergauf = (physik.x - xAlt) * nx + (physik.z - zAlt) * nz;
    if (bergauf > 0) {
      physik.x -= nx * bergauf;
      physik.z -= nz * bergauf;
    }
    physik.anGrenze(nx, nz, 0);
    // am Hang verliert das Auto Schwung
    physik.vx *= 0.985;
    physik.vz *= 0.985;
  }

  // M8a (nur Optik): Tempo vor den Hindernissen merken; was Bäume, Steine und Wände wegnehmen, ist ein Stoss für die Federung
  const stossVx = physik.vx, stossVz = physik.vz;
  // Bäume und Steine
  kollision.loese(physik, xAlt, zAlt, wAlt);
  let wucht = kollision.wucht; // M5b, Statistik: stärkster Aufprall in diesem Schritt (m/s Richtung Hindernis)
  let tonW = kollision.wucht, tonArt = kollision.wuchtArt, tonKontakt = kollision.kontaktArt; // M7a: nur für den Ton

  // Begrenzungen: Felswand, Abhang, zu weit weg
  const q2 = strecke.abfrage(physik.x, physik.z, qAuto);
  const rx = -q2.tz, rz = q2.tx; // rechts
  // Felswand (seit M3a.3): die ganze Karosserie gegen die sichtbare Wandfläche.
  // M5a.1: Nur wer von der Strasse her an die Wand fährt, wird quer zur Strasse zurückgeschoben (wie bisher).
  // Wer von der Wiese her auf Anfang oder Ende der Wand zufährt (also schon "hinter" der Wandfläche ist),
  // wurde früher in einem Schritt Meter weit auf die Strasse geworfen; jetzt hält ihn der Fels wie ein Hang auf.
  const wk = wandKontakt(q2, xAlt, zAlt, wAlt);
  // (M5b: vor der Felswand das Tempo hinein messen, für die Statistik; die Wand selbst ist unverändert.
  //  Die unsichtbaren Grenzen weiter unten zählen nicht als Aufprall, Linos Wunsch)
  if (wk.strasse > 0) {
    const gw = grenzWucht(rx * q2.wandSeite, rz * q2.wandSeite);
    wucht = Math.max(wucht, gw);
    if (gw > tonW) { tonW = gw; tonArt = FELS; } // M7a: Wand = Felswand-Ton
    tonKontakt = FELS;
    physik.anGrenze(rx * q2.wandSeite, rz * q2.wandSeite, wk.strasse);
  } else if (wk.fels > 0) {
    const gw = grenzWucht(wk.nx, wk.nz);
    wucht = Math.max(wucht, gw);
    if (gw > tonW) { tonW = gw; tonArt = FELS; }
    tonKontakt = FELS;
    physik.anGrenze(wk.nx, wk.nz, wk.fels);
  }
  if (q2.wandSeite && Math.sign(q2.seite) !== q2.wandSeite && q2.wandStaerke > 0.3) {
    // Abhang auf der anderen Seite
    const ueber = Math.abs(q2.seite) - g.abhangGrenze;
    if (ueber > 0) physik.anGrenze(-rx * q2.wandSeite, -rz * q2.wandSeite, ueber);
  }
  if (q2.abstand > g.maxAbstand) {
    // nächster Punkt, der als Strasse zählt: Etappe, seit M3c auch die Ausrollstrecke nach dem Ziel
    const p = netz.grenzPunkt(physik.x, physik.z, qGrenze);
    if (p.abstand > g.maxAbstand) {
      const nx = (physik.x - p.x) / p.abstand, nz = (physik.z - p.z) / p.abstand;
      physik.anGrenze(nx, nz, p.abstand - g.maxAbstand);
    }
  }

  // M8a: Stoss an die Federung (nur gelesen: Tempoänderung durch den Aufprall im Auto längs und quer)
  {
    const dvx = physik.vx - stossVx, dvz = physik.vz - stossVz;
    if (dvx * dvx + dvz * dvz > 0.25) {
      const sx = Math.sin(physik.richtung), sz = Math.cos(physik.richtung);
      federung.stoss(dvx * sx + dvz * sz, dvx * sz - dvz * sx);
    }
  }

  if (nurFahren) return; // Demo-Fahrt: kein Rennstand (und keine Statistik)
  aufprallZaehlen(wucht);
  // M7a: für den Ton merken (stärkster Kontakt im Bild; die unsichtbaren Grenzen machen keinen Ton)
  if (tonW > tonInfo.wucht) { tonInfo.wucht = tonW; tonInfo.art = tonArt; }
  if (tonKontakt >= 0) { tonInfo.kontaktArt = tonKontakt; tonInfo.kontaktTempo = physik.tempo; }
  tonEingabe.gas = eingabe.gas; tonEingabe.bremse = eingabe.bremse; tonEingabe.handbremse = eingabe.handbremse;

  // Zeitmessung und Checkpoints
  rennen.uhr += dt;
  const s = q2.s;
  const nahe = q2.abstand < 12;
  // Fährt das Auto "am Stück" vorwärts? (Ein Sprung von einem Ast der
  // Strecke auf einen anderen, z. B. über den Hang zwischen zwei Kehren,
  // zählt nicht als Durchfahrt.)
  const amStueck = Math.abs(s - rennen.letztesS) < 5;
  if (rennen.zustand === 'bereit' && rennen.letztesS < strecke.startS && s >= strecke.startS && nahe && amStueck) {
    rennen.zustand = 'laeuft';
    rennen.zeit = 0;
  } else if (rennen.zustand === 'laeuft') {
    rennen.zeit += dt;
    if (physik.tempo > stat.hoechstTempo) stat.hoechstTempo = physik.tempo; // M5b: Höchsttempo zwischen GO und Ziel
    const cp = CONFIG.checkpoints;
    const n = rennen.naechsterCp;
    if (n < checkpoints.length) {
      const cpS = checkpoints[n].s;
      if (amStueck && rennen.letztesS < cpS && s >= cpS && q2.abstand < cp.durchfahrtBreite) {
        // sauber durchs Tor gefahren
        rennen.zwischenzeiten[n] = rennen.zeit;
        rennen.naechsterCp++;
        // M6.1: grün = schneller als die Referenz an diesem Checkpoint, rot = langsamer, gelb = gleich / keine Referenz
        const u = vergleich.zwischenVergleich(n, rennen.zeit);
        const V = CONFIG.hud.vergleich;
        zeigeMeldung(t('hud.cp', { n: n + 1, zeit: formatZeit(rennen.zeit) }), u < 0 ? V.farbeSchneller : u > 0 ? V.farbeLangsamer : 'gelb');
        // M7a: dieselbe Entscheidung für den Punkt unter der Zeit (bleibt den ganzen Lauf) und den Checkpoint-Ton
        rennen.cpVergleich[n] = u < 0 ? -1 : u > 0 ? 1 : 0;
        ton.checkpoint(rennen.cpVergleich[n]);
      } else if (s > cpS + 5) {
        // schon hinter dem Tor, ohne durchgefahren zu sein
        zeigeMeldung(t('hud.cpVerpasst'), 'rot', n);
        ton.verpasst(); // M7a: tiefer Buzz
        if (cp.abkuerzungenVerhindern) {
          // zurück auf die Strassenmitte beim letzten erreichten Checkpoint
          setzeAuf(n > 0 ? checkpoints[n - 1].s + 1 : strecke.startS + 1);
          return;
        }
        rennen.zwischenzeiten[n] = null;
        rennen.naechsterCp++;
      }
    }
    // Das Ziel zählt nur, wenn alle Checkpoints passiert wurden
    const alleCps = !cp.abkuerzungenVerhindern || rennen.naechsterCp >= checkpoints.length;
    if (rennen.letztesS < strecke.zielS && s >= strecke.zielS && nahe && amStueck && alleCps) {
      rennen.zustand = 'ziel';
      rennen.endZeit = rennen.zeit;
    }
  }
  // M6: Fahrspur (nur lesen: Stelle und Rennzeit, die Physik merkt nichts)
  vergleich.schritt(s, rennen.zeit, rennen.zustand);
  rennen.letztesS = s;

  // R-Countdown abgelaufen: zurück auf die Strassenmitte, Tempo 0
  if (rueck.rest > 0) {
    rueck.rest -= dt;
    if (rueck.rest <= 1e-9) {
      rueck.rest = 0;
      aufStrasse();
      rueck.anzahl++;
    }
  }
}

// Wie tief steckt die Karosserie in der Felswand? Geprüft werden Punkte rundherum am Umriss (alle gut 0.5 m),
// jeder gegen die sichtbare Wandfläche an seiner Stelle, knapp über dem Boden (unten steht die Wand am weitesten vor).
// M5a.1: Jeder Punkt wird auch dort geprüft, wo er vor diesem Schritt war (xAlt, zAlt, wAlt):
//  - War er vor der Wandfläche und ist er selbst quer zur Strasse hineingefahren (von der Strasse her):
//    Ergebnis "strasse" = so weit (Meter quer zur Strasse) muss das Auto zurück, wie bisher (M3a.3).
//  - Kam er von hinten oder vom Wand-Ende (stand schon hinter der Fläche, die Wand war dort noch flach, oder die
//    Wandfläche kommt beim Längsfahren am weichen Wand-Ende auf ihn zu) und steckt jetzt im Fels: Ergebnis "fels"
//    mit Richtung nx/nz (in den Fels hinein). Der Teil der Bewegung in den Fels wird zurückgenommen, entlang darf
//    das Auto weiter (wie am zu steilen Hang). Nie zur Strasse geworfen.
//  Beides höchstens so weit, wie das Auto in diesem Schritt gefahren ist, plus grenze.wandSprungMax (vorher konnte
//  die Korrektur mehrere Meter auf einmal sein: das Auto wurde von der Wiese auf die Strasse "geworfen").
const qWand = {}, qWandAlt = {};
const wandErg = { strasse: 0, fels: 0, nx: 0, nz: 0 };
// Wo hat es nahe der Strecke überhaupt Felswand (±40 Punkte)? Sonst wird nichts gerechnet.
const wandNah = new Uint8Array(strecke.anzahl);
for (let i = 0; i < strecke.anzahl; i++) {
  if (strecke.wandSeite[i]) for (let k = Math.max(0, i - 40); k <= Math.min(strecke.anzahl - 1, i + 40); k++) wandNah[k] = 1;
}
// Wie weit steckt der Punkt (x, z) quer zur Strasse hinter der Wandfläche? (-Infinity = keine Wand dort)
function wandTiefe(x, z, qMitte, q) {
  strecke.abfrage(x, z, q);
  if (q.wandSeite !== qMitte.wandSeite || Math.sign(q.seite) !== q.wandSeite || Math.abs(q.i - qMitte.i) > 20) return -Infinity;
  const boden = welt.bodenBei(x, z, q).h;
  return Math.abs(q.seite) - welt.wandKante(q, boden - q.h + CONFIG.grenze.wandHuelle.ueberBoden);
}
// Wie weit ragt die Felsfläche bei (x, z) über die Prüfhöhe (Gelände + ueberBoden)? > 0 = Punkt steckt im Fels
// (unter dem Fels ist immer Gelände, die Strasse mit Bankett endet vor dem Wandfuss)
function felsUeber(x, z) {
  const f = welt.felsHoehe(x, z);
  if (f === -Infinity) return -5;
  return Math.max(-5, f - welt.gelaendeHoehe(x, z) - CONFIG.grenze.wandHuelle.ueberBoden);
}
function wandKontakt(qMitte, xAlt, zAlt, wAlt) {
  const g = CONFIG.grenze, h = g.wandHuelle;
  wandErg.strasse = 0; wandErg.fels = 0;
  if (!wandNah[qMitte.i]) return wandErg;
  const sx = Math.sin(physik.richtung), sz = Math.cos(physik.richtung);
  const ax = Math.sin(wAlt), az = Math.cos(wAlt);
  // von der Strasse her nur prüfen, wenn die Automitte auf der Wandseite ist (wie bisher)
  const wandSeite = qMitte.wandSeite && Math.sign(qMitte.seite) === qMitte.wandSeite
    && Math.abs(qMitte.seite) + Math.hypot(h.laenge, h.breite) / 2 >= CONFIG.felswand.abstand - 0.5;
  let strasse = 0, weg = 0, fels = 0, fx = 0, fz = 0;
  for (let k = 0; k < WAND_UMRISS.length; k += 2) {
    const a = WAND_UMRISS[k] * h.laenge / 2, b = WAND_UMRISS[k + 1] * h.breite / 2;
    const x = physik.x + sx * a + sz * b, z = physik.z + sz * a - sx * b;
    const xa = xAlt + ax * a + az * b, za = zAlt + az * a - ax * b; // derselbe Punkt vor diesem Schritt
    const dx = x - xa, dz = z - za;
    weg = Math.max(weg, Math.hypot(dx, dz));
    let vonStrasse = false;
    if (wandSeite) {
      const tief = wandTiefe(x, z, qMitte, qWand);
      if (tief > 0) {
        const tiefAlt = wandTiefe(xa, za, qMitte, qWandAlt);
        // vorher vor der Wandfläche (kleine Toleranz: die Wand dreht das Auto am Ende des Schritts noch etwas) und
        // die Tiefe kommt von der eigenen Bewegung nach aussen (nicht davon, dass die Wand beim Längsfahren näher kommt)
        const raus = Math.abs(qWand.seite) - Math.abs(qWandAlt.seite);
        if (tiefAlt > -Infinity && tiefAlt <= g.wandVorneToleranz && tief <= Math.max(0, raus) + g.wandSprungMax) {
          vonStrasse = true;
          if (tief > strasse) strasse = tief;
        }
      }
    }
    if (vonStrasse) continue;
    // von hinten / vom Wand-Ende: steckt der Punkt jetzt im Fels?
    const e = felsUeber(x, z);
    if (e <= 0) continue;
    // Richtung in den Fels (wo er höher über die Prüfhöhe ragt), wie ein Hang
    let nx = felsUeber(x + 0.4, z) - felsUeber(x - 0.4, z), nz = felsUeber(x, z + 0.4) - felsUeber(x, z - 0.4);
    let l = Math.hypot(nx, nz);
    if (l < 1e-4) { nx = dx; nz = dz; l = Math.hypot(nx, nz); }
    if (l < 1e-6) continue;
    nx /= l; nz /= l;
    const rein = dx * nx + dz * nz; // so weit ist der Punkt in diesem Schritt in den Fels gefahren
    if (rein > fels) { fels = rein; fx = nx; fz = nz; }
  }
  const max = weg + g.wandSprungMax; // nie ein Sprung: höchstens so weit, wie das Auto gefahren ist, plus wenig
  wandErg.strasse = Math.min(strasse, max);
  wandErg.fels = Math.min(fels, max);
  wandErg.nx = fx; wandErg.nz = fz;
  return wandErg;
}
// Punkte am Umriss (-1..1 längs, -1..1 quer): Seiten 9 Punkte, Front und Heck je 3 dazu
const WAND_UMRISS = [];
for (let k = 0; k <= 8; k++) WAND_UMRISS.push(-1 + k / 4, -1, -1 + k / 4, 1);
for (const b of [-0.5, 0, 0.5]) WAND_UMRISS.push(-1, b, 1, b);

// --- Auto-Optik: Position, Neigung zum Gelände, Federung (M8a), Räder, Lichter ---
function autoZeichnen(dt, wegStrecke) {
  const x = physik.x, z = physik.z, yaw = physik.richtung;
  const fx = Math.sin(yaw), fz = Math.cos(yaw), lx = Math.cos(yaw), lz = -Math.sin(yaw);
  const hv = bodenHoehe(x + fx * 1.3, z + fz * 1.3), hh = bodenHoehe(x - fx * 1.3, z - fz * 1.3);
  const hl = bodenHoehe(x + lx * 0.8, z + lz * 0.8), hr = bodenHoehe(x - lx * 0.8, z - lz * 0.8);
  const k = Math.min(1, dt * 14);
  optik.neigX += (Math.atan2(hv - hh, 2.6) - optik.neigX) * k;
  optik.neigZ += (Math.atan2(hl - hr, 1.6) - optik.neigZ) * k;
  const hm = bodenHoehe(x, z);
  const y = Math.max(hm, (hv + hh) / 2);
  auto.objekt.position.set(x, y, z);
  auto.objekt.rotation.set(-optik.neigX, yaw, optik.neigZ, 'YXZ');

  const o = CONFIG.autoOptik;
  // M8a: Federung (Feder und Dämpfer) statt einfacher Glättung. Gelände: Krümmung der Bodenhöhe längs (Kuppe < 0,
  // Senke > 0) mal Tempo² = Senkrechtbeschleunigung
  if (dt > 0) {
    const a = o.feder.gelaendeAbstand;
    const krumm = a === 1.3 ? (hv - 2 * hm + hh) / (a * a)
      : (bodenHoehe(x + fx * a, z + fz * a) - 2 * hm + bodenHoehe(x - fx * a, z - fz * a)) / (a * a);
    federung.schritt(dt, physik.beschlVor, physik.beschlSeit, physik.vVor * physik.vVor * krumm);
  }
  auto.federung(federung);
  const radMax = o.radEinschlagMax * Math.PI / 180; // sichtbarer Einschlag begrenzt (Physik unverändert)
  radZustand.lenkwinkel = begrenze(physik.lenkwinkel, -radMax, radMax);
  radZustand.strecke = wegStrecke; radZustand.tempo = physik.vVor;
  auto.raederBewegen(radZustand);
  // M8a: Bremslicht (Bremse vorwärts, Gas beim Rückwärtsrollen, Handbremse) und Rückfahrlicht (Gang R)
  const rueck = getriebe.gang < 0;
  auto.lichter(lichtEin.handbremse || (lichtEin.bremse > 0.05 && !rueck) || (lichtEin.gas > 0.05 && physik.vVor < -0.5), rueck);
}

// M8a: Dreck aufbauen (je Belag mal gefahrene Meter, höchstens dreck.max; Asphalt wäscht nichts ab).
// Neuer Dreck färbt nach und nach um (Wiesenweg nach Schotter: wird brauner), auch wenn die Menge schon voll ist.
function dreckSchritt(dt) {
  const D = CONFIG.autoOptik.dreck;
  const b = D.an ? D.belaege[untergrund] : null;
  if (b && dt > 0) {
    const zuwachs = b.aufbau * physik.tempo * dt;
    if (zuwachs > 0) {
      const c = dreckFarben[untergrund];
      const anteil = Math.min(1, zuwachs / Math.max(1e-6, Math.min(D.max, dreck.menge + zuwachs)));
      dreck.r += (c.r - dreck.r) * anteil; dreck.g += (c.g - dreck.g) * anteil; dreck.b += (c.b - dreck.b) * anteil;
      dreck.menge = Math.min(D.max, dreck.menge + zuwachs);
    }
  }
  auto.dreck(dreck, D.an);
}

// --- Verfolgerkamera ---
function kameraZiel() {
  const c = CONFIG.kamera;
  const y = auto.objekt.position.y;
  kam.ziel.set(physik.x - Math.sin(kam.yaw) * c.abstand, y + c.hoehe, physik.z - Math.cos(kam.yaw) * c.abstand);
}
function kameraSofort() {
  kam.yaw = physik.richtung;
  federung.reset(); // M8a: neu hingesetzt = Karosserie in Ruhe
  autoZeichnen(0, 0);
  kameraZiel();
  kam.pos.copy(kam.ziel);
}
const qKam = {}, qKamS = {}, qKamAuto = {};
// Absperrungen an Start und Ziel mit ihrer Höhe (für die Kamera)
const endSperren = netz.enden.map((ast) => ({ ast, hoehe: (absperrungen.liste.find((e) => e.ast === ast.nr) || { hoehe: 1.5 }).hoehe }));
function kameraFuehren(dt) {
  const c = CONFIG.kamera;
  let ziel = physik.richtung;
  if (physik.tempo > 3 && physik.vVor > 0) {
    const fahrt = Math.atan2(physik.vx, physik.vz);
    ziel = physik.richtung + winkelNorm(fahrt - physik.richtung) * c.fahrtrichtungAnteil;
  }
  kam.yaw += winkelNorm(ziel - kam.yaw) * (1 - Math.exp(-c.nachfuehren * dt));
  kameraZiel();
  kam.pos.lerp(kam.ziel, 1 - Math.exp(-c.positionGlaetten * dt));
  kameraKorrektur(kam.pos);
  kamera.position.copy(kam.pos);
  const y = auto.objekt.position.y;
  kamera.lookAt(
    physik.x + Math.sin(kam.yaw) * c.blickVoraus, y + c.blickHoehe, physik.z + Math.cos(kam.yaw) * c.blickVoraus,
  );
  // nur für automatische Screenshots: Kamera frei setzen
  const t = window.__alpineRally && window.__alpineRally.testKamera;
  if (t) {
    kamera.position.set(...t.pos);
    kamera.lookAt(...t.ziel);
  }
  welt.himmel.position.copy(kamera.position);
}

// Kamera nicht in die Felswand, nicht ins Stroh an Start/Ziel, nicht unter das Gelände
// (seit M5a eigene Funktion: auch für die Kameras der Demo-Fahrt)
function kameraKorrektur(pos, ueberBoden = 1.0) {
  const c = CONFIG.kamera;
  // nicht in die Felswand: höchstens bis 0.8 m vor den Wandfuss und (seit M3a.3) mit
  // kamera.wandAbstand Luft zur sichtbaren Wandfläche in Kamerahöhe
  const q = strecke.abfrage(pos.x, pos.z, qKam);
  // M5a.1: Steht das Auto selbst hinter der Wandfläche (von der Wiese her an Anfang/Ende der Wand oder am Hang
  // dahinter), sprang die Kamera sonst quer vor die Wand auf die Strasse. Dann nur: nicht im Fels (zum Auto hin).
  const qa = strecke.abfrage(physik.x, physik.z, qKamAuto);
  const autoHinten = q.wandSeite && Math.sign(qa.seite) === q.wandSeite && Math.abs(qa.seite) > CONFIG.felswand.abstand;
  if (autoHinten) {
    const dx = physik.x - pos.x, dz = physik.z - pos.z, l = Math.hypot(dx, dz);
    for (let k = 0; k < 40 && l > 0.5 && welt.felsHoehe(pos.x, pos.z) > pos.y - c.wandAbstand; k++) {
      pos.x += (dx / l) * 0.25; pos.z += (dz / l) * 0.25; // Schritt für Schritt zum Auto hin, bis die Kamera frei ist
    }
  } else if (q.wandSeite && Math.sign(q.seite) === q.wandSeite) {
    let max = welt.wandKante(q, pos.y - q.h - c.wandAbstand) - c.wandAbstand;
    if (q.wandStaerke > 0.2) max = Math.min(max, CONFIG.felswand.abstand - 0.8);
    const ueber = Math.abs(q.seite) - max;
    if (ueber > 0) {
      pos.x -= -q.tz * q.wandSeite * ueber;
      pos.z -= q.tx * q.wandSeite * ueber;
    }
  }
  // M3c: Steht die Kamera in oder hinter der Absperrung an Start oder Ziel (Auto fährt rückwärts hinein),
  // wird sie über die Absperrung gehoben (sonst sieht man ins Stroh)
  for (const { ast, hoehe } of endSperren) {
    const w = netz.stummelAbfrage(ast, pos.x, pos.z, 15, qKamS);
    const sp = ast.sperre;
    if (!w || Math.abs(w.seite) > sp.breite + 1.5) continue;
    if (w.s > sp.bogenU(begrenze(w.seite, -sp.breite, sp.breite)) - 1.5) pos.y = Math.max(pos.y, w.h + hoehe + 0.7);
  }
  // nicht unter das Gelände
  const boden = bodenHoehe(pos.x, pos.z) + ueberBoden;
  if (pos.y < boden) pos.y = boden;
}

// --- Spielschleife ---
let letzte = performance.now();
let akku = 0;
let fps = 60, fpsZaehler = 0, fpsZeit = 0;

// --- Ablauf: Titel, Hauptmenü, Rennen, Pause (seit M5a, js/ablauf.js) ---
const M = CONFIG.menue;
const hudLeinwand = document.getElementById('hud');
const hudCtx = hudLeinwand.getContext('2d');
const ablauf = baueAblauf();
const menue = baueMenue({
  tasteBelegen: belegeTaste, tasteLesen: (a, k) => einstellungen.tasten[a][k], tasteName: tastenName, aktionName: (a) => t(`aktion.${a}`),
  klang: (art, wert) => ton.menue(art, wert), // M7a: Menü-Töne
});
// Demo-Fahrt: fährt mit physikSchritt(..., nurFahren = true), schreibt also nichts in den Rennstand
const demo = baueDemo({
  strecke, welt, physik, getriebe, kamera,
  fahrSchritt: (dt, e) => physikSchritt(dt, e, true), kameraKorrektur: (p) => kameraKorrektur(p, 0.4),
});
ETAPPEN[0].laenge = (strecke.zielS - strecke.startS) / 1000;
ETAPPEN[0].checkpoints = checkpoints.length;

// Rennen frisch beginnen (Zeit 0, Checkpoints, Statistik zurück).
// M5b: Standard = mit Countdown: Auto steht mit der Schnauze an der Startlinie (rennablauf.schnauzeVorLinie),
// gesperrt bis GO, die Zeit beginnt bei GO. countdown: false = Testweg wie vor M5b (Auto bei strasse.spawnBeiMeter,
// Zeit beginnt beim Überfahren der Startlinie).
function starten({ countdown = true } = {}) {
  lauf.mitCountdown = countdown;
  lauf.markiert = null; // der hervorgehobene Lauf auf der Bestzeiten-Seite gilt nur bis zum nächsten Start
  neustart();
  kollision.letzterAufprall = null;
  if (!countdown) { ablauf.wechsle('rennen'); return; }
  setzeAuf(strecke.startS - CONFIG.grenze.wandHuelle.laenge / 2 - RA.schnauzeVorLinie);
  ablauf.wechsle('countdown');
}
// Neu starten (Pause, Zielbildschirm, R nach dem Ziel): gleich wie der laufende Lauf (im Spiel immer mit Countdown)
function neuStarten() { starten({ countdown: lauf.mitCountdown }); }
// Countdown: ein fester Schritt (Auto steht, keine Physik). Nach 3 Zahlen: GO, Auto frei, Zeit ab 0
// M7a: Pieps genau zu den Zahlen (beim ersten Schritt die 3, dann bei jeder neuen Zahl), GO-Ton mit GO.
// In der Pause laufen keine Schritte: nichts wird nachgeholt, nichts doppelt.
function countdownSchritt(dt) {
  const vorher = lauf.countdown;
  lauf.countdown += dt;
  if (lauf.countdown >= 3 * RA.zahlDauer - 1e-9) {
    rennen.zustand = 'laeuft';
    rennen.zeit = 0;
    lauf.go = RA.goDauer;
    ton.go();
    ablauf.wechsle('rennen');
  } else if (vorher === 0 || countdownNummer(lauf.countdown, 0) !== countdownNummer(vorher, 0)) {
    ton.countdown(); // (dieselbe Rechnung wie die Anzeige: Pieps im selben Schritt, in dem die Zahl erscheint)
  }
}
// Ein fester Schritt im Rennen (1/120 s): im Countdown zählt nur die Uhr, sonst Physik und Zeitmessung.
// Auch GO! und die Wartezeit bis zum Zielbildschirm laufen hier (genau auf 1/120 s, in der Pause eingefroren).
function rennSchritt(dt, e) {
  if (ablauf.zustand === 'countdown') { countdownSchritt(dt); return; }
  physikSchritt(dt, e);
  if (lauf.go > 0) lauf.go = Math.max(0, lauf.go - dt);
  // Ziel erreicht -> Zeit eintragen; nach rennablauf.zielSchirmNach Sekunden kommt der Zielbildschirm
  if (rennen.zustand === 'ziel') {
    if (!lauf.zielErledigt) zielErreicht();
    if (ablauf.zustand === 'rennen') {
      lauf.zielWarte += dt;
      if (lauf.zielWarte >= RA.zielSchirmNach - 1e-9) ablauf.wechsle('ziel');
    }
  }
}
// Ziel erreicht (einmal pro Lauf): Zeit eintragen (Top 10), Vergleich zur Bestzeit vor diesem Lauf merken
function zielErreicht() {
  lauf.zielErledigt = true;
  const etappe = ETAPPEN[auswahl.etappe];
  const cps = checkpoints.map((_, n) => (rennen.zwischenzeiten[n] == null ? null : rennen.zwischenzeiten[n]));
  // M6: Fahrspur (Rennzeit alle 10 m) mit der Bestzeit speichern; jeder fertige Lauf ist auch der "letzte Lauf"
  const spur = vergleich.fertigeSpur(rennen.endZeit);
  // (M8a: Läufe im Vergleichsprofil ?auto=prototyp tragen die Id "prototyp", sonst die Id des Autos wie bisher)
  const eintrag = {
    zeit: rennen.endZeit, cps, auto: laufAuto(),
    aufpralle: stat.aufpralle, resets: statResets(), hoechstTempo: stat.hoechstTempo, spur,
  };
  const erg = speichereBestzeit(etappe.id, eintrag);
  speichereLetztenLauf(etappe.id, { zeit: rennen.endZeit, cps, spur });
  lauf.ergebnis = {
    ...eintrag, platz: erg.platz, anzahl: erg.anzahl, bisher: erg.bisher, gespeichert: erg.gespeichert,
    neueBest: !!erg.bisher && hundertstel(eintrag.zeit) < hundertstel(erg.bisher.zeit), // nur echte Verbesserung (dieses Autos)
    // M8h: Gesamtwertung (alle Autos): Platz 1-3 (0 = nicht drin), gesamtbeste Zeit vor dem Lauf, Rekord = echt schneller
    gesamtPlatz: erg.gesamtPlatz, gesamtBisher: erg.gesamtBisher,
    gesamtRekord: !!erg.gesamtBisher && hundertstel(eintrag.zeit) < hundertstel(erg.gesamtBisher.zeit),
  };
  lauf.markiert = erg.platz > 0 ? { etappe: etappe.id, datum: erg.datum, auto: eintrag.auto } : null; // (M8h: mit Auto)
  ton.fanfare(false); // M7a: kurze Fanfare beim Überfahren der Ziellinie (neue Bestzeit: die lange zum Zielbildschirm)
}
// Pause aus dem Rennen oder dem Countdown (nicht im Zielbildschirm); Weiter geht dorthin zurück
function pausieren() {
  if (!ablauf.ist('rennen', 'countdown')) return;
  lauf.pauseVon = ablauf.zustand;
  ablauf.wechsle('pause');
  ton.pauseTon(true); // M7a: kurzer tiefer Ton (ein laufender Countdown-Pieps hört auf)
}
function weiter() {
  if (ablauf.zustand !== 'pause') return;
  ablauf.wechsle(lauf.pauseVon);
  ton.pauseTon(false); // M7a: kurzer hoher Ton
}
function zumMenue() {
  ton.entsperren(); // M7a: erster Tastendruck / Klick auf dem Titel: jetzt darf es Ton geben
  if (einstellungen.vollbild) vollbild(true); // gespeichertes Vollbild (geht nur nach einem Tastendruck)
  ablauf.wechsle('menue');
}
function zumHauptmenue() {
  neustart();
  demo.start();
  ablauf.wechsle('menue');
}
function zumTitel() { ablauf.wechsle('titel'); }
// Vollbild an/aus. ausMenue: aus den Einstellungen (klappt es nicht, steht dort wieder AUS)
function vollbild(an, ausMenue = false) {
  const nein = () => { if (ausMenue && !document.fullscreenElement) setze('vollbild', false); };
  try {
    if (an && !document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        // Chrome/Edge: Esc geht im Vollbild ans Spiel (Pause); lange halten verlässt das Vollbild
        if (navigator.keyboard && navigator.keyboard.lock) navigator.keyboard.lock(['Escape']).catch(() => {});
      }).catch(nein);
    } else if (!an && document.fullscreenElement) document.exitFullscreen().catch(() => {});
  } catch { nein(); /* Browser kann kein Vollbild */ }
}
const seiten = baueSeiten({
  menue, zumMenue, starten: () => starten(), weiter, neustartEtappe: neuStarten, zumHauptmenue, zumTitel, paceNotes, vollbild,
  neuStarten, ergebnis: () => lauf.ergebnis, markiert: () => lauf.markiert,
  autoWechseln: (id, lack) => autoWechseln(id, lack), autoWahl: () => autoWahl, autoModell: () => auto, // M8c: Garage
  aufheulen: () => aufheulenStarten(), // M8e: Motor kurz aufheulen (true = läuft, statt des Bestätigungstons)
  vollbildGeht: () => !!(document.fullscreenEnabled && document.documentElement.requestFullscreen), // M9a (iPhone: nein)
});
// M9a: Touch-Knöpfe (nur auf Touch-Geräten oder mit TOUCH = AN). Ton: auf dem iPhone zählt erst das Loslassen
// eines Fingers als Geste, darum dort noch einmal fortsetzen (js/audio.js weckt beim Aufsetzen)
touch = baueTouch({ buehne, hudLeinwand, ablauf, menue, zumMenue, anpassen });
anpassen(); // (jetzt mit Touch-Layout, falls an)
beiTouchWechsel(() => menue.neuZeichnen()); // (Titel: TIPPEN / TASTE DRÜCKEN)
window.addEventListener('touchend', () => ton.fortsetzen(), true);

// --- Aufheulen in der Garage (M8e): nach dem Bestätigen eines Autos dreht sein Motor kurz hoch (js/tonfahrt.js) ---
// Nur im Menü auf der Seite AUTO; Verlassen der Garage beendet es (der Ton blendet den Motor weich aus). Ein neues
// Bestätigen, während es noch läuft, beginnt neu bei der Drehzahl von gerade (kein Sprung). Ohne Ton (aus, noch gesperrt,
// Klänge noch nicht berechnet): false, dann kommt wie bisher der Bestätigungston.
let aufheulen = null;
function aufheulenStarten() {
  const A = CONFIG.garage.aufheulen;
  if (!A || !A.an || !ton.an || !ton.werk || ton.zustand !== 'running' || !ton.werk.aufbau.fertig) return false;
  if (!ablauf.ist('menue') || menue.seite !== seiten.auto) return false;
  const von = aufheulen ? aufheulen.zustand.drehzahl : CONFIG.getriebe.leerlauf;
  aufheulen = baueAufheulen(Getriebe, A, CONFIG.getriebe.leerlauf, CONFIG.audio.motor.hoechstDrehzahl, !!CONFIG.getriebe.turbo.an, von);
  return true;
}

// --- Autowechsel (M8c, Garage): nur im Menü, nie im Rennen, Countdown, in der Pause oder im Zielbildschirm ---
// id: Auto (rt4, delto, escorta, prototyp), lack: Lackierung (null = die gemerkte bzw. erste des Autos).
// Ein anderes Modell wird neu gebaut (das alte freigegeben), das Fahrprofil umgeschaltet, Getriebe, Federung und Dreck
// zurück, die Demo-Fahrt beginnt mit dem neuen Auto von vorn. Gemerkt in den Einstellungen. Ergebnis: true = gewechselt.
function autoWechseln(id, lack = null) {
  if (ablauf.ist('rennen', 'countdown', 'pause', 'ziel')) return false;
  const w = autoZuordnung(id);
  const lackName = lack ?? lackFuer(w.modell);
  const modellNeu = w.modell !== auto.modell.id;
  if (modellNeu) {
    const v = vorschauModelle.get(w.modell); // (M8d: die Vorschau dieses Autos wird nicht mehr gebraucht)
    if (v) { v.dispose(); vorschauModelle.delete(w.modell); }
    auto.dispose();
    auto = baueAuto(w.modell, lackName, renderer.domElement.width);
    szene.add(auto.objekt);
    masseSetzen(auto.modell);
  } else if (lackName && lackName !== auto.lackName) auto.lackierung(lackName);
  const neu = modellNeu || w.profil !== aktivesProfil() || w.auto !== autoWahl.auto;
  autoWahl = w;
  auswahl.auto = Math.max(0, AUTOS.findIndex((a) => a.id === w.modell));
  if (neu) {
    waehleFahrprofil(w.profil);
    ton.motorNeu(); // M8d: Motorklang des neuen Autos (feste Teile und Motor-Puffer; der Motor ist im Menü aus)
    getriebe.reset();
    dreck.menge = 0;
    auto.dreck(dreck);
    federung.reset();
    if (ablauf.ist('titel', 'menue')) demo.start(); else neustart(); // (Fahrphysik sauber auf den Start)
    referenzLaden(); // M8h: Live-Vergleich gegen die Bestzeit des neuen Autos (beim Start wird sie ohnehin neu geladen)
    if (fahrlabor && fahrlabor.alleZeigen) fahrlabor.alleZeigen();
  }
  // merken (das Auto der Adresse ?auto= nur, wenn im Menü gewählt; prototyp gibt es in der Garage nicht)
  if (w.auto !== 'prototyp') setze('auto', w.auto);
  if (einstellungen.lacke[w.modell] !== auto.lackName) { einstellungen.lacke[w.modell] = auto.lackName; setze('lacke', einstellungen.lacke); }
  menue.neuZeichnen();
  return true;
}
auswahl.auto = Math.max(0, AUTOS.findIndex((a) => a.id === autoWahl.modell));

ablauf.registriere('titel', { welt: 'demo', menue: true, abdunkeln: M.abdunkeln, betreten: () => menue.zeige(seiten.titel) });
ablauf.registriere('menue', { welt: 'demo', menue: true, abdunkeln: M.abdunkeln, betreten: () => menue.zeige(seiten.haupt) });
// (nach GO kommt 'rennen' mitten in der Spielschleife: dann nichts leeren, die Schritte laufen nahtlos weiter)
ablauf.registriere('rennen', { welt: 'rennen', hud: true, betreten: (alt) => { if (alt !== 'countdown') { eingabeLeeren(); akku = 0; } } });
ablauf.registriere('pause', { welt: null, hud: true, menue: true, abdunkeln: M.abdunkelnPause, betreten: () => menue.zeige(seiten.pause) });
// M5b: Countdown (Welt läuft, Auto gesperrt, HUD ohne Menü) und Zielbildschirm (Welt läuft weiter, abgedunkelt)
ablauf.registriere('countdown', { welt: 'rennen', hud: true, betreten: () => { eingabeLeeren(); akku = 0; } });
ablauf.registriere('ziel', {
  welt: 'rennen', hud: true, menue: true, abdunkeln: RA.abdunkeln,
  // M7a: lange Fanfare bei neuer Bestzeit (M8h: dieselbe beim Gesamtrekord)
  betreten: () => { menue.zeige(seiten.ziel); if (lauf.ergebnis && (lauf.ergebnis.neueBest || lauf.ergebnis.gesamtRekord)) ton.fanfare(true); },
});

// Einstellungen wirken sofort
beiAenderung((name, wert) => {
  if (name === 'aufloesung') { aufloesungSetzen(); auto.detail(renderer.domElement.width); } // M8a: Schrift am Auto je Pixelgrösse
  if (name === 'fps') debugAn = wert;
  if (name === 'vergleichMit') referenzLaden(); // M6: neue Referenz sofort (sonst beim nächsten Start)
  if (name === 'lautstaerke') ton.lautstaerke(wert); // M7a: sofort, weich
  if (name === 'signale') ton.signalLautstaerke(wert); // M7a.1: Regler SIGNALTÖNE, sofort
  if (name === 'musik') ton.musikLautstaerke(wert); // M7b: Regler MUSIK, sofort
  if (name === 'touch') touch.aktualisiere(); // M9a: Knöpfe sofort ein/aus
  menue.neuZeichnen();
});
document.addEventListener('fullscreenchange', () => {
  const an = !!document.fullscreenElement;
  if (an !== einstellungen.vollbild) setze('vollbild', an);
  if (!an) pausieren();
});
// Tastatur im Menü (im Rennen geht alles wie bisher an die Fahr-Eingabe)
setzeAbfangen((code, wiederholt) => (ablauf.def && ablauf.def.menue ? menue.taste(code, wiederholt) : false));
// Maus im Menü: Punkt im 320x180-Raster
function mausAnMenue(ev, art) {
  if (!ablauf.def || !ablauf.def.menue) return;
  if (fahrlabor && ev.target && fahrlabor.panel.contains(ev.target)) return; // M8a: Klicks im Fahr-Labor gehören dem Panel
  if (touch.mausIgnorieren(ev)) return; // M9a: vom Browser nachgemachte Klicks nach einer Berührung, Maus auf einem Touch-Knopf
  if (art !== 'bewegen' && ev.button !== 0) return;
  const r = hudLeinwand.getBoundingClientRect();
  menue.maus((ev.clientX - r.left) / r.width * B, (ev.clientY - r.top) / r.height * H, art);
}
window.addEventListener('mousemove', (ev) => mausAnMenue(ev, 'bewegen'));
window.addEventListener('mousedown', (ev) => mausAnMenue(ev, 'druecken'));
window.addEventListener('mouseup', (ev) => mausAnMenue(ev, 'loslassen'));
window.addEventListener('wheel', (ev) => { if (ablauf.def && ablauf.def.menue && ev.deltaY) menue.maus(0, 0, 'rad', ev.deltaY); }, { passive: true });
// Fenster verlässt den Fokus oder Tab wird gewechselt: automatisch Pause
window.addEventListener('blur', pausieren);
document.addEventListener('visibilitychange', () => { if (document.hidden) pausieren(); });

let sicht = 0, dunkel = 0; // Menü sichtbar (0..1), Abdunkeln der Szene (0..1)
// M8c: Garage (Menüseite AUTO): zweite kleine Szene im selben Renderer, gezeichnet nur, solange die Seite zu sehen ist
const garage = baueGarage(renderer);
const szeneInfo = { calls: 0, dreiecke: 0 }; // Zeichenaufrufe der Spielszene im letzten Bild (ohne Garage)
function garageSichtbar() {
  if (!ablauf.def || !ablauf.def.menue || sicht <= 0 || menue.seite !== seiten.auto) return null;
  return menue.einblendung > 0 ? seiten.garage.rahmen : null;
}
// M8d: Vorschau-Modelle für Autos, die in der Garage nur markiert (noch nicht bestätigt) sind: erst beim Markieren
// gebaut (mit der gemerkten Lackierung), nicht in der Spielszene, freigegeben, sobald die Garage zu ist
const vorschauModelle = new Map();
function vorschauAuto(id) {
  if (id === auto.modell.id) return auto;
  let v = vorschauModelle.get(id);
  if (!v) { v = baueAuto(id, lackFuer(id), renderer.domElement.width); vorschauModelle.set(id, v); }
  return v;
}
function vorschauFreigeben() {
  for (const v of vorschauModelle.values()) v.dispose();
  vorschauModelle.clear();
}
// M8g: Tacho-Vorschau in der Garage: eigener Tacho-Satz (nur der Drehzahlmesser) auf der HUD-Leinwand, über dem Menü.
// Zeigt das markierte Auto im Stil der Einstellung TACHO; Nadel auf Leerlauf, Gang N, beim Aufheulen (nur das gewählte
// Auto heult auf) folgt sie dessen Drehzahl, das Schaltlicht blitzt kurz mit (garage.tacho.lichtAb der Spitze = an).
const TEXT_FARBEN = { weiss: '#f4f4ee', gelb: '#ffd23c', rot: '#ff4a3a' };
const garageTacho = baueTachos(hudCtx, (tx, x, y, g = 1, f = 'weiss', a = 'links', sch) => pixelText(hudCtx, tx, x, y, g, TEXT_FARBEN[f] || f, a, sch));
const garageWerte = { ladedruck: 0, gas: 0, schaltet: false, lichtDrehzahl: 0 };
function garageTachoZeichnen(dt, vId, lage, alpha) {
  const m = AUTO_MODELLE[vId], profil = m ? m.fahrprofil : aktivesProfil();
  const T = CONFIG.garage.tacho, A = CONFIG.garage.aufheulen, leer = CONFIG.getriebe.leerlauf;
  const heult = !!aufheulen && vId === autoWahl.modell;
  const rpm = heult ? aufheulen.zustand.drehzahl : leer;
  const p = CONFIG.fahrprofile[profil], S = p && p.tacho && p.tacho.schaltlicht;
  const spitze = leer + A.spitze * (CONFIG.audio.motor.hoechstDrehzahl - leer);
  garageWerte.lichtDrehzahl = S ? leer + (rpm - leer) / (T.lichtAb * (spitze - leer)) * (S.an - leer) : 0;
  garageWerte.ladedruck = heult ? aufheulen.zustand.ladedruck : 0;
  garageWerte.gas = heult ? aufheulen.zustand.gas : 0;
  garageTacho.setzeModus(einstellungen.tacho);
  garageTacho.setzeSkala(profil);
  garageTacho.setzeLage(lage.cx, lage.cy);
  hudCtx.globalAlpha = alpha;
  garageTacho.zeichneVorschau(dt, rpm, 'N', garageWerte);
  hudCtx.globalAlpha = 1;
}
// Taste H (M6): ganzes HUD aus/an, nicht gespeichert (jeder Start der Seite mit HUD); hinweis = Sekunden "HUD AUS/AN"
const hudSchalter = { an: true, hinweis: 0 };
function hudUmschalten() {
  hudSchalter.an = !hudSchalter.an;
  hudSchalter.hinweis = CONFIG.hud.hudSchalter.hinweisDauer;
}
const nach = (w, ziel, schritt) => (w < ziel ? Math.min(ziel, w + schritt) : Math.max(ziel, w - schritt));

function schleife(jetzt) {
  requestAnimationFrame(schleife);
  // nie negativ (M5a): beim ersten Bild liegt der Zeitstempel des Browsers manchmal vor dem Ende des Ladens
  const dt = Math.max(0, Math.min(0.1, (jetzt - letzte) / 1000));
  letzte = jetzt;

  fpsZaehler++;
  fpsZeit += dt;
  if (fpsZeit >= 0.5) { fps = fpsZaehler / fpsZeit; fpsZaehler = 0; fpsZeit = 0; }

  aktualisierePad();
  touch.schritt(dt); // M9a: D-Pad-Wiederholung im Menü, Seitenwechsel lösen die Finger
  const zustandVorher = ablauf.zustand;
  if (ablauf.def.menue) menue.gamepad(dt, pad);

  // Eingabe nur, wenn gefahren wird (Rennen, Countdown, Zielbildschirm; im Menü gehen Tasten an das Menü).
  // Hat sich der Zustand in diesem Bild erst geändert (Gamepad im Menü), gilt eine leere Eingabe.
  let e = LEER;
  if (zustandVorher === ablauf.zustand && ablauf.def.welt === 'rennen') {
    e = leseEingabe(dt);
    // nur für automatische Tests: Eingabe von aussen
    const te = window.__alpineRally && window.__alpineRally.testEingabe;
    if (te) e = { ...e, ...te };
    if (e.pause) pausieren(); // (nicht im Zielbildschirm)
  }
  // Sicherung: wurde von aussen neu gestartet (z. B. Test ruft neustart()), gehört der Zielbildschirm weg
  if (ablauf.zustand === 'ziel' && rennen.zustand !== 'ziel') ablauf.wechsle('rennen');
  const def = ablauf.def;
  const anhalten = window.__alpineRally && window.__alpineRally.anhalten; // nur für Tests: Physik von aussen gesteuert
  const xVor = physik.x, zVor = physik.z;
  let dtWelt = dt; // 0 = eingefroren (Pause)
  if (def.welt === 'rennen') {
    const imCountdown = ablauf.zustand === 'countdown'; // R und Pace-Notes-Taste tun im Countdown nichts
    if (e.debug) { debugAn = !debugAn; setze('fps', debugAn); }
    if (e.notes && !imCountdown) {
      paceNotes.umschalten();
      zeigeMeldung(t(paceNotes.anzeige.an ? 'hud.ansagenAn' : 'hud.ansagenAus'), 'gelb');
    }
    if (e.reset && !imCountdown) rTaste();
    if (e.hud) hudUmschalten(); // (geht auch im Countdown)
    akku += dt;
    if (anhalten) akku = 0;
    while (akku >= SCHRITT) {
      rennSchritt(SCHRITT, e);
      akku -= SCHRITT;
    }
    if (physik.tempo > 3) rennen.hilfe = false;
    // (fährt ein Test direkt mit physikSchritt ins Ziel, wird die Zeit hier eingetragen)
    if (rennen.zustand === 'ziel' && !lauf.zielErledigt) zielErreicht();
  } else if (def.welt === 'demo') {
    akku += dt;
    if (anhalten) akku = 0;
    while (akku >= SCHRITT) {
      demo.schritt(SCHRITT);
      akku -= SCHRITT;
    }
  } else {
    dtWelt = 0; // Pause: Physik, Zeit, R-Countdown, Staub, Zuschauer, Rauch stehen still
    akku = 0;
  }

  if (dtWelt > 0) {
    const weg = Math.hypot(physik.x - xVor, physik.z - zVor) * Math.sign(physik.vVor || 1);
    autoZeichnen(dt, weg);
    dreckSchritt(dt); // M8a
    // Staub (nur auf Schotter und Wiesenweg): Werte ohne neue Objekte übergeben
    const ea = def.welt === 'demo' ? demo.eingabe : e;
    staubAuto.x = physik.x; staubAuto.z = physik.z; staubAuto.y = auto.objekt.position.y;
    staubAuto.richtung = physik.richtung; staubAuto.vx = physik.vx; staubAuto.vz = physik.vz;
    staubAuto.tempo = physik.tempo; staubAuto.drift = physik.driftWinkel;
    staubAuto.gas = ea.gas; staubAuto.handbremse = ea.handbremse; staubAuto.belag = untergrund;
    staubAuto.schotter = !!(CONFIG.staub.belaege && CONFIG.staub.belaege[untergrund]);
    staub.aktualisiere(dt, staubAuto);
  }
  let schwarz = 0;
  if (def.welt === 'rennen') kameraFuehren(dt);
  else if (def.welt === 'demo') {
    schwarz = demo.bild(dt, auto.objekt.position.y);
    welt.himmel.position.copy(kamera.position);
  }
  welt.aktualisiere(kamera.position);
  strassenrand.aktualisiere(kamera.position);
  startZiel.aktualisiere(dtWelt, kamera.position);
  leben.aktualisiere(dtWelt, kamera.position);
  nebenwegSperrenZeigen(kamera.position);
  renderer.render(szene, kamera);
  szeneInfo.calls = renderer.info.render.calls; szeneInfo.dreiecke = renderer.info.render.triangles; // M8c: nur die Szene
  // M8c: Garage – das drehende Modell in den Vorschau-Rahmen (nur solange die Seite AUTO zu sehen ist)
  const gRahmen = garageSichtbar();
  const vId = gRahmen ? seiten.garage.vorschauId() : null; // (M8g: einmal je Bild, auch für die Tacho-Vorschau)
  if (gRahmen) {
    const f = renderer.domElement.width / B;
    garage.zeichne(dt, vorschauAuto(vId), Math.round(gRahmen.x * f), Math.round((H - gRahmen.y - gRahmen.h) * f), Math.round(gRahmen.b * f), Math.round(gRahmen.h * f));
  } else if (vorschauModelle.size) vorschauFreigeben();

  // HUD (im Rennen und eingefroren in der Pause), darüber Abdunkeln und Menü
  if (hudSchalter.hinweis > 0) hudSchalter.hinweis = Math.max(0, hudSchalter.hinweis - dt);
  if (def.hud) {
    const notes = def.welt === 'rennen' ? paceNotes.aktualisiere(dt, rennen.letztesS, physik.tempo, rennen.zustand) : paceNotes.anzeige;
    paceSignal(notes, def.welt === 'rennen');
    // M6: Live-Vergleich (rechnet höchstens 5 Mal pro Sekunde neu, in der Pause eingefroren)
    const vgl = vergleich.aktualisiere(dtWelt, rennen.letztesS, rennen.zeit, rennen.zustand === 'laeuft');
    hud.zeichne({
      notes,
      zustand: rennen.zustand, zeit: rennen.zeit, endZeit: rennen.endZeit, hilfe: rennen.hilfe,
      dt: dtWelt, kmh: physik.tempo * 3.6, debug: debugAn, fps, countdown: rueck.rest,
      gang: getriebe.anzeige, drehzahl: getriebe.drehzahl, schaltet: getriebe.schaltet,
      ladedruck: getriebe.ladedruck, gas: tonEingabe.gas, turboAn: !!CONFIG.getriebe.turbo.an, // M8g: Ladedruck-/Lader-Anzeige
      meter: rennen.letztesS, laenge: strecke.laenge, drift: Math.abs(physik.driftWinkel),
      untergrund, zielSchirm: ablauf.zustand === 'ziel',
      hindernisse: kollision.anzahl, aufprall: kollision.letzterAufprall,
      meldung: rennen.meldung && rennen.uhr < rennen.meldung.bis ? rennen.meldung : null,
      zwischenzeiten: rennen.zwischenzeiten, cpVergleich: rennen.cpVergleich, anzahlCps: checkpoints.length,
      // M6: Minimap, Live-Vergleich, Taste H
      maxS: vergleich.spur.maxS, cpNaechster: rennen.naechsterCp, vergleich: vgl, vergleichQuelle: vergleich.ref.quelle,
      autoX: physik.x, autoZ: physik.z, richtung: physik.richtung, // M6.1: Minimap fährt mit dem Auto mit
      hudAus: !hudSchalter.an, hudHinweis: hudSchalter.hinweis,
      naechsterCp: rennen.naechsterCp < checkpoints.length
        ? { nummer: rennen.naechsterCp + 1, abstand: checkpoints[rennen.naechsterCp].s - rennen.letztesS }
        : { nummer: 0, abstand: strecke.zielS - rennen.letztesS },
    });
    // M5b: Countdown 3 - 2 - 1 und danach kurz GO! in der Bildmitte (in der Pause eingefroren)
    if (ablauf.zustand === 'countdown' || lauf.pauseVon === 'countdown' && ablauf.zustand === 'pause' || lauf.go > 0) {
      zeichneCountdown(hudCtx, lauf.countdown, lauf.go);
    }
  } else hudCtx.clearRect(0, 0, B, H);
  const k = dt / M.blende;
  dunkel = nach(dunkel, def.abdunkeln, k * 0.5);
  sicht = nach(sicht, def.menue ? 1 : 0, k);
  if (schwarz > 0 || dunkel > 0) {
    hudCtx.fillStyle = '#060a12';
    hudCtx.globalAlpha = Math.min(1, dunkel + schwarz);
    hudCtx.fillRect(0, 0, B, H);
    hudCtx.globalAlpha = 1;
  }
  if (sicht > 0) menue.zeichne(hudCtx, dt, sicht);
  // M8c: im HUD ein Loch über der Garage-Vorschau (das 3D-Bild liegt darunter), so weit wie die Seite eingeblendet ist
  if (gRahmen) {
    hudCtx.globalCompositeOperation = 'destination-out';
    hudCtx.globalAlpha = Math.min(1, sicht * menue.einblendung);
    hudCtx.fillRect(gRahmen.x, gRahmen.y, gRahmen.b, gRahmen.h);
    hudCtx.globalAlpha = 1;
    hudCtx.globalCompositeOperation = 'source-over';
    // M8g: Tacho-Vorschau (über dem Menü, so weit eingeblendet wie die Seite)
    if (seiten.garage.tacho) garageTachoZeichnen(dt, vId, seiten.garage.tacho, Math.min(1, sicht * menue.einblendung));
  }
  tonBild(dt);
  if (fahrlabor) fahrlabor.aktualisiere(dt); // M8a
}

// M7a: kurzes Signal für jede neu erscheinende Pace-Notes-Kachel (nur im Rennen und Countdown, nicht bei ausgeblendetem HUD)
function paceSignal(notes, imRennen) {
  if (notes.erschienen === pnStand) return;
  if (notes.erschienen > pnStand && imRennen && hudSchalter.an) ton.paceNote(notes.erschienen - pnStand);
  pnStand = notes.erschienen;
}

// --- Ton (M7a): einmal pro Bild die Zahlen aus dem Spiel an js/audio.js (keine neuen Objekte) ---
const TON_MODUS = { rennen: 'rennen', countdown: 'countdown', pause: 'pause', ziel: 'ziel' };
// M7b: Musik auf Titel und Menü (auch mit der Demo-Fahrt dahinter), leise in der Pause und auf dem Zielbildschirm
const MUSIK_MODUS = { titel: 'menue', menue: 'menue', pause: 'pause', ziel: 'ziel' };
const tonZ = {
  musikModus: 'aus', hx: 0, hz: 0, hyaw: 0, s: 0, // M7b: Hörer = Kamera (Ort, Blickrichtung), Streckenmeter
  modus: 'aus', drehzahl: 0, gang: 0, zielGang: 0, schaltet: false, gas: 0, bremse: 0, tempo: 0, vVor: 0, untergrund: 'asphalt', drift: 0,
  handbremse: false, aufprall: 0, aufprallArt: 0, kontaktArt: -1, kontaktTempo: 0,
  ladedruck: 0, turboAn: false, // M8b: echter Ladedruck des Getriebes und ob das Fahrprofil einen Turbo hat
  turboMal: 1, knallMal: 1,     // M8c: Turbo-Pfeifen/Blow-off und Knall-Chance mal diesen Werten (Fahrprofil)
};
function tonBild(dt) {
  tonZ.modus = TON_MODUS[ablauf.zustand] || 'aus'; // Titel, Menü, Demo-Fahrt: stumm (nur Musik)
  tonZ.musikModus = MUSIK_MODUS[ablauf.zustand] || 'aus';
  tonZ.hx = kam.pos.x; tonZ.hz = kam.pos.z; tonZ.hyaw = kam.yaw; tonZ.s = rennen.letztesS;
  tonZ.drehzahl = getriebe.drehzahl; tonZ.gang = getriebe.gang; tonZ.zielGang = getriebe.zielGang; tonZ.schaltet = getriebe.schaltet;
  tonZ.gas = tonEingabe.gas; tonZ.bremse = tonEingabe.bremse; tonZ.handbremse = tonEingabe.handbremse;
  tonZ.tempo = physik.tempo; tonZ.vVor = physik.vVor; tonZ.untergrund = untergrund; tonZ.drift = physik.driftWinkel;
  tonZ.ladedruck = getriebe.ladedruck; tonZ.turboAn = !!CONFIG.getriebe.turbo.an; // M8b
  tonZ.turboMal = tonWerte.turboMal; tonZ.knallMal = tonWerte.knallMal; // M8c: Ton je Auto (Fahrprofil, Block "ton")
  tonZ.aufprall = tonInfo.wucht; tonZ.aufprallArt = tonInfo.art; tonZ.kontaktArt = tonInfo.kontaktArt; tonZ.kontaktTempo = tonInfo.kontaktTempo;
  tonInfo.wucht = 0; tonInfo.kontaktArt = -1;
  // M8e: Aufheulen in der Garage (Ton-Modus 'garage': Motor an, keine Reifen, kein Wind, keine Umgebung)
  if (aufheulen && !(ablauf.ist('menue') && menue.seite === seiten.auto)) aufheulen = null;
  if (aufheulen) {
    const f = aufheulen.schritt(dt);
    tonZ.modus = 'garage';
    tonZ.drehzahl = f.drehzahl; tonZ.gang = 0; tonZ.zielGang = 0; tonZ.schaltet = false; tonZ.gas = f.gas; tonZ.bremse = 0;
    tonZ.handbremse = false; tonZ.tempo = 0; tonZ.vVor = 0; tonZ.drift = 0; tonZ.ladedruck = f.ladedruck;
    tonZ.aufprall = 0; tonZ.kontaktArt = -1;
    if (f.fertig) aufheulen = null;
  }
  ton.aktualisiere(dt, tonZ);
  // M8e: Flamme aus dem Auspuff, zur Zeit des Tons, die man gerade hört (gleichzeitig mit dem Pop)
  const hz = ton.hoerZeit ? ton.hoerZeit() : null;
  if (hz !== null) auto.flammeBild(hz);
}
// M8e: jeder Pop des Tons plant eine Flamme (Knistern nur jedes zweite bis dritte Mal und klein). Stärke 0..1 aus der
// Lautstärke des Pops (Knall 0.7-1.0, Schaltknall 1.25). Nur Optik: liest den Ton, ändert nichts daran
let knisterNr = 0;
ton.beiKnall((art, zeit, staerke) => {
  const F = CONFIG.auspuffFlamme;
  if (!F || !F.an) return;
  if (art === 'knistern') {
    knisterNr++;
    if ((knisterNr * 0.6180339887) % 1 >= F.knisternAnteil) return; // (gleichmässig verteilt, ohne Zufallszahl)
    auto.flammePlanen(zeit, 0);
  } else auto.flammePlanen(zeit, Math.max(0, Math.min(1, (staerke - 0.1) / 1.15)));
});

neustart();
lade.style.display = 'none';
if (menueAn) {
  demo.start();
  ablauf.wechsle('titel');
} else ablauf.wechsle('rennen');
requestAnimationFrame(schleife);
// M8a: Fahr-Labor nur mit ?fahrlabor=1 nachladen (sonst weder Datei noch Aufwand)
if (fahrlaborAn) {
  import('./fahrlabor.js').then((m) => {
    const f = m.baueFahrlabor({ physik, getriebe });
    fahrlabor = { panel: f.panel, breite: m.BREITE, aktualisiere: f.aktualisiere, text: f.text, alleZeigen: f.alleZeigen };
    window.__alpineRally.fahrlabor = fahrlabor;
    anpassen();
  });
}

// Für Tests (Screenshots) von aussen erreichbar
// start(): am Menü vorbei ins Rennen wie "STARTEN" (mit Countdown); start({ countdown: false }): ohne Countdown wie vor M5b
// rennSchritt(dt, e): ein fester Schritt wie in der Spielschleife (Countdown oder Physik), lauf/stat: Rennablauf, Statistik
window.__alpineRally = {
  THREE, physik, getriebe, strecke, netz, welt, rennen, kamera, renderer, szene, setzeAuf, aufStrasse, pflanzen, kameraSofort, kollision,
  physikSchritt, SCHRITT, neustart, rTaste, rueck, checkpoints, CONFIG, strassenrand, kuehe, deko, absperrungen, staub, startZiel, leben, paceNotes,
  hudMeldung: () => (rennen.meldung && rennen.uhr < rennen.meldung.bis ? rennen.meldung.text : ''),
  ablauf, menue, seiten, demo, einstellungen, start: (o) => starten(o), pausieren, weiter, zumHauptmenue, menueAn,
  rennSchritt, lauf, stat, statResets, neuStarten,
  hud, vergleich, referenzLaden, hudSchalter, hudUmschalten, minimapMs, // M6
  ton, tonZ, tonInfo, tonEingabe, zumMenue, tonBild, paceSignal, // M7a
  aufheulenStarten, get aufheulen() { return aufheulen; }, // M8e: Aufheulen in der Garage
  get tonQuellen() { return tonQuellen(); }, kam, // M7b
  get blenden() { return { sicht, dunkel }; },
  get autoModell() { return auto; }, federung, dreck, dreckSchritt, lichtEin, autoZeichnen, // M8a (M8c: Modell wechselt)
  autoWechseln, get autoWahl() { return autoWahl; }, masseSetzen, garage, szeneInfo, staubAuto, // M8c
  garageTacho, garageWerte, // M8g (Tests): Tacho-Vorschau der Garage
  vorschauModelle, // M8d (Tests): gerade gebaute Vorschau-Modelle der Garage
  get auto() { return aktivesProfil(); }, waehleFahrprofil, fahrlabor: null, // M8a: Id des Fahrprofils
  get untergrund() { return untergrund; },
  touch, // M9a (Tests): Touch-Steuerung
};
