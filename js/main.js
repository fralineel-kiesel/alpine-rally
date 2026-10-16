// Start des Spiels und Spielschleife.
// Seit M5a mit Ablauf: Titel -> Hauptmenü (Demo-Fahrt dahinter) -> Rennen <-> Pause (js/ablauf.js).
// Seit M5b: STARTEN -> Countdown 3-2-1-GO -> Rennen -> Ziel ("ZIEL!", 3 s) -> Zielbildschirm (Bestzeiten, Statistik).
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
import { speichereBestzeit, hundertstel } from './bestzeiten.js';
import { zeichneCountdown } from './rennablauf.js';
import { baueStrecke } from './track.js';
import { baueWelt } from './world.js';
import { baueNetz } from './netz.js';
import { bauePflanzen, baueDeko, spriteGruppe } from './sprites.js';
import { baueAuto } from './car.js';
import { Fahrphysik } from './physics.js';
import { Getriebe } from './getriebe.js';
import { leseEingabe, aktualisierePad, pad, setzeAbfangen, eingabeLeeren, tastenName } from './input.js';
import { baueHud, formatZeit } from './hud.js';
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

function anpassen() {
  let s = Math.min(window.innerWidth / B, window.innerHeight / H);
  if (CONFIG.bild.ganzzahligSkalieren && s >= 1) s = Math.floor(s);
  buehne.style.width = `${Math.floor(B * s)}px`;
  buehne.style.height = `${Math.floor(H * s)}px`;
}
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
const kollision = baueKollision([...pflanzen.hindernisse, ...strassenrand.hindernisse, ...kuehe.hindernisse]);
const checkpoints = baueCheckpointTore(szene, strecke, netz);
const staub = baueStaub(szene); // Staub auf Schotter (M3a) und Wiesenweg (M3b)
const staubAuto = { x: 0, y: 0, z: 0, richtung: 0, vx: 0, vz: 0, tempo: 0, drift: 0, gas: 0, handbremse: false, schotter: false, belag: null };
const auto = baueAuto();
szene.add(auto.objekt);
const physik = new Fahrphysik();
const getriebe = new Getriebe();
const hud = baueHud(document.getElementById('hud'));
// Pace-Notes (M4): Ansagen oben im Bild, beim Laden aus der Strecke berechnet
const paceNotes = bauePaceNotes(strecke, netz);

// --- Rennzustand ---
// bereit = vor der Startlinie (auch im Countdown), laeuft = Zeit läuft, ziel = durchs Ziel
const rennen = {
  zustand: 'bereit', zeit: 0, endZeit: 0, letztesS: 0, hilfe: true,
  naechsterCp: 0,        // welcher Checkpoint als nächster kommt (0 = der erste)
  zwischenzeiten: [],    // Zeit bei jedem Checkpoint (null = verpasst)
  meldung: null,         // Text oben im Bild: { text, farbe, bis }
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

const kam = { yaw: 0, pos: new THREE.Vector3(), ziel: new THREE.Vector3() };
const optik = { nicken: 0, rollen: 0, neigX: 0, neigZ: 0 };

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
  rennen.meldung = null;
  paceNotes.zuruecksetzen();
  // M5b: Statistik und Ziel zurück
  stat.aufpralle = 0; stat.hoechstTempo = 0; stat.resetsBasis = rueck.anzahl; stat.letzterAufprall = -1e9;
  lauf.countdown = 0; lauf.go = 0; lauf.zielWarte = 0; lauf.zielErledigt = false; lauf.ergebnis = null;
}

function zeigeMeldung(text, farbe) {
  rennen.meldung = { text, farbe, bis: rennen.uhr + CONFIG.checkpoints.anzeigeDauer };
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
const LEER = Object.freeze({ gas: 0, bremse: 0, lenkung: 0, handbremse: false, reset: false, debug: false, notes: false, pause: false });
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

  const xAlt = physik.x, zAlt = physik.z, hAlt = boden.h, wAlt = physik.richtung;
  // Getriebe: wie stark treibt der Motor gerade an (Schaltpause = gar nicht)?
  const motor = getriebe.schritt(dt, eingabe, physik.vVor, physik.tempo, u.grip);
  physik.schritt(dt, eingabe, {
    grip: u.grip, rollen: u.rollen, rollenTempo: u.rollenTempo, steigung: begrenze((hv - hh) / 2.6, -0.5, 0.5),
    rueckwaerts: u.rueckwaerts ?? 1, heck: u.heck ?? 1, stabilitaet: u.stabilitaet ?? 1, geradeaus: u.geradeaus ?? 1,
    rueckwaertsMax: u.rueckwaertsMax ?? 1,
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

  // Bäume und Steine
  kollision.loese(physik, xAlt, zAlt, wAlt);
  let wucht = kollision.wucht; // M5b, Statistik: stärkster Aufprall in diesem Schritt (m/s Richtung Hindernis)

  // Begrenzungen: Felswand, Abhang, zu weit weg
  const q2 = strecke.abfrage(physik.x, physik.z, qAuto);
  const rx = -q2.tz, rz = q2.tx; // rechts
  // Felswand (seit M3a.3): die ganze Karosserie gegen die sichtbare Wandfläche.
  // M5a.1: Nur wer von der Strasse her an die Wand fährt, wird quer zur Strasse zurückgeschoben (wie bisher).
  // Wer von der Wiese her auf Anfang oder Ende der Wand zufährt (also schon "hinter" der Wandfläche ist),
  // wurde früher in einem Schritt Meter weit auf die Strasse geworfen; jetzt hält ihn der Fels wie ein Hang auf.
  const wk = wandKontakt(q2, xAlt, zAlt, wAlt);
  // (M5b: vor jeder Grenze das Tempo hinein messen, für die Statistik; die Grenze selbst ist unverändert)
  if (wk.strasse > 0) {
    wucht = Math.max(wucht, grenzWucht(rx * q2.wandSeite, rz * q2.wandSeite));
    physik.anGrenze(rx * q2.wandSeite, rz * q2.wandSeite, wk.strasse);
  } else if (wk.fels > 0) {
    wucht = Math.max(wucht, grenzWucht(wk.nx, wk.nz));
    physik.anGrenze(wk.nx, wk.nz, wk.fels);
  }
  if (q2.wandSeite && Math.sign(q2.seite) !== q2.wandSeite && q2.wandStaerke > 0.3) {
    // Abhang auf der anderen Seite
    const ueber = Math.abs(q2.seite) - g.abhangGrenze;
    if (ueber > 0) {
      wucht = Math.max(wucht, grenzWucht(-rx * q2.wandSeite, -rz * q2.wandSeite));
      physik.anGrenze(-rx * q2.wandSeite, -rz * q2.wandSeite, ueber);
    }
  }
  if (q2.abstand > g.maxAbstand) {
    // nächster Punkt, der als Strasse zählt: Etappe, seit M3c auch die Ausrollstrecke nach dem Ziel
    const p = netz.grenzPunkt(physik.x, physik.z, qGrenze);
    if (p.abstand > g.maxAbstand) {
      const nx = (physik.x - p.x) / p.abstand, nz = (physik.z - p.z) / p.abstand;
      wucht = Math.max(wucht, grenzWucht(nx, nz));
      physik.anGrenze(nx, nz, p.abstand - g.maxAbstand);
    }
  }

  if (nurFahren) return; // Demo-Fahrt: kein Rennstand (und keine Statistik)
  aufprallZaehlen(wucht);

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
        zeigeMeldung(t('hud.cp', { n: n + 1, zeit: formatZeit(rennen.zeit) }), 'gelb');
      } else if (s > cpS + 5) {
        // schon hinter dem Tor, ohne durchgefahren zu sein
        zeigeMeldung(t('hud.cpVerpasst'), 'rot');
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

// --- Auto-Optik: Position, Neigung zum Gelände, Rollen in Kurven ---
function autoZeichnen(dt, wegStrecke) {
  const x = physik.x, z = physik.z, yaw = physik.richtung;
  const fx = Math.sin(yaw), fz = Math.cos(yaw), lx = Math.cos(yaw), lz = -Math.sin(yaw);
  const hv = bodenHoehe(x + fx * 1.3, z + fz * 1.3), hh = bodenHoehe(x - fx * 1.3, z - fz * 1.3);
  const hl = bodenHoehe(x + lx * 0.8, z + lz * 0.8), hr = bodenHoehe(x - lx * 0.8, z - lz * 0.8);
  const k = Math.min(1, dt * 14);
  optik.neigX += (Math.atan2(hv - hh, 2.6) - optik.neigX) * k;
  optik.neigZ += (Math.atan2(hl - hr, 1.6) - optik.neigZ) * k;
  const y = Math.max(bodenHoehe(x, z), (hv + hh) / 2);
  auto.objekt.position.set(x, y, z);
  auto.objekt.rotation.set(-optik.neigX, yaw, optik.neigZ, 'YXZ');

  const o = CONFIG.autoOptik;
  const k2 = Math.min(1, dt * 6);
  optik.nicken += (begrenze(-physik.beschlVor * o.nicken, -0.06, 0.06) - optik.nicken) * k2;
  optik.rollen += (begrenze(physik.beschlSeit * o.rollen, -0.08, 0.08) - optik.rollen) * k2;
  auto.karosse.rotation.set(optik.nicken, 0, optik.rollen);
  const radMax = o.radEinschlagMax * Math.PI / 180; // sichtbarer Einschlag begrenzt (Physik unverändert)
  auto.raederBewegen(begrenze(physik.lenkwinkel, -radMax, radMax), wegStrecke);
}

// --- Verfolgerkamera ---
function kameraZiel() {
  const c = CONFIG.kamera;
  const y = auto.objekt.position.y;
  kam.ziel.set(physik.x - Math.sin(kam.yaw) * c.abstand, y + c.hoehe, physik.z - Math.cos(kam.yaw) * c.abstand);
}
function kameraSofort() {
  kam.yaw = physik.richtung;
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
function countdownSchritt(dt) {
  lauf.countdown += dt;
  if (lauf.countdown >= 3 * RA.zahlDauer - 1e-9) {
    rennen.zustand = 'laeuft';
    rennen.zeit = 0;
    lauf.go = RA.goDauer;
    ablauf.wechsle('rennen');
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
  const eintrag = {
    zeit: rennen.endZeit, cps, auto: AUTOS[auswahl.auto].id,
    aufpralle: stat.aufpralle, resets: statResets(), hoechstTempo: stat.hoechstTempo,
  };
  const erg = speichereBestzeit(etappe.id, eintrag);
  lauf.ergebnis = {
    ...eintrag, platz: erg.platz, anzahl: erg.anzahl, bisher: erg.bisher, gespeichert: erg.gespeichert,
    neueBest: !!erg.bisher && hundertstel(eintrag.zeit) < hundertstel(erg.bisher.zeit), // nur echte Verbesserung
  };
  lauf.markiert = erg.platz > 0 ? { etappe: etappe.id, datum: erg.datum } : null;
}
// Pause aus dem Rennen oder dem Countdown (nicht im Zielbildschirm); Weiter geht dorthin zurück
function pausieren() {
  if (!ablauf.ist('rennen', 'countdown')) return;
  lauf.pauseVon = ablauf.zustand;
  ablauf.wechsle('pause');
}
function weiter() { if (ablauf.zustand === 'pause') ablauf.wechsle(lauf.pauseVon); }
function zumMenue() {
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
});

ablauf.registriere('titel', { welt: 'demo', menue: true, abdunkeln: M.abdunkeln, betreten: () => menue.zeige(seiten.titel) });
ablauf.registriere('menue', { welt: 'demo', menue: true, abdunkeln: M.abdunkeln, betreten: () => menue.zeige(seiten.haupt) });
// (nach GO kommt 'rennen' mitten in der Spielschleife: dann nichts leeren, die Schritte laufen nahtlos weiter)
ablauf.registriere('rennen', { welt: 'rennen', hud: true, betreten: (alt) => { if (alt !== 'countdown') { eingabeLeeren(); akku = 0; } } });
ablauf.registriere('pause', { welt: null, hud: true, menue: true, abdunkeln: M.abdunkelnPause, betreten: () => menue.zeige(seiten.pause) });
// M5b: Countdown (Welt läuft, Auto gesperrt, HUD ohne Menü) und Zielbildschirm (Welt läuft weiter, abgedunkelt)
ablauf.registriere('countdown', { welt: 'rennen', hud: true, betreten: () => { eingabeLeeren(); akku = 0; } });
ablauf.registriere('ziel', { welt: 'rennen', hud: true, menue: true, abdunkeln: RA.abdunkeln, betreten: () => menue.zeige(seiten.ziel) });

// Einstellungen wirken sofort
beiAenderung((name, wert) => {
  if (name === 'aufloesung') aufloesungSetzen();
  if (name === 'fps') debugAn = wert;
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

  // HUD (im Rennen und eingefroren in der Pause), darüber Abdunkeln und Menü
  if (def.hud) {
    const notes = def.welt === 'rennen' ? paceNotes.aktualisiere(dt, rennen.letztesS, physik.tempo, rennen.zustand) : paceNotes.anzeige;
    hud.zeichne({
      notes,
      zustand: rennen.zustand, zeit: rennen.zeit, endZeit: rennen.endZeit, hilfe: rennen.hilfe,
      dt: dtWelt, kmh: physik.tempo * 3.6, debug: debugAn, fps, countdown: rueck.rest,
      gang: getriebe.anzeige, drehzahl: getriebe.drehzahl, schaltet: getriebe.schaltet,
      meter: rennen.letztesS, laenge: strecke.laenge, drift: Math.abs(physik.driftWinkel),
      untergrund, zielSchirm: ablauf.zustand === 'ziel',
      hindernisse: kollision.anzahl, aufprall: kollision.letzterAufprall,
      meldung: rennen.meldung && rennen.uhr < rennen.meldung.bis ? rennen.meldung : null,
      zwischenzeiten: rennen.zwischenzeiten, anzahlCps: checkpoints.length,
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
}

neustart();
lade.style.display = 'none';
if (menueAn) {
  demo.start();
  ablauf.wechsle('titel');
} else ablauf.wechsle('rennen');
requestAnimationFrame(schleife);

// Für Tests (Screenshots) von aussen erreichbar
// start(): am Menü vorbei ins Rennen wie "STARTEN" (mit Countdown); start({ countdown: false }): ohne Countdown wie vor M5b
// rennSchritt(dt, e): ein fester Schritt wie in der Spielschleife (Countdown oder Physik), lauf/stat: Rennablauf, Statistik
window.__alpineRally = {
  THREE, physik, getriebe, strecke, netz, welt, rennen, kamera, renderer, szene, setzeAuf, aufStrasse, pflanzen, kameraSofort, kollision,
  physikSchritt, SCHRITT, neustart, rTaste, rueck, checkpoints, CONFIG, strassenrand, kuehe, deko, absperrungen, staub, startZiel, leben, paceNotes,
  hudMeldung: () => (rennen.meldung && rennen.uhr < rennen.meldung.bis ? rennen.meldung.text : ''),
  ablauf, menue, seiten, demo, einstellungen, start: (o) => starten(o), pausieren, weiter, zumHauptmenue, menueAn,
  rennSchritt, lauf, stat, statResets, neuStarten,
  get blenden() { return { sicht, dunkel }; },
};
