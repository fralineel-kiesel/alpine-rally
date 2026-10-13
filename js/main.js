// Start des Spiels und Spielschleife.

import * as THREE from 'three';
import { CONFIG } from './config.js';
import { baueStrecke } from './track.js';
import { baueWelt } from './world.js';
import { bauePflanzen } from './sprites.js';
import { baueAuto } from './car.js';
import { Fahrphysik } from './physics.js';
import { leseEingabe } from './input.js';
import { baueHud, formatZeit } from './hud.js';
import { baueKollision } from './kollision.js';
import { baueCheckpointTore } from './checkpoints.js';
import { winkelNorm, begrenze } from './util.js';

const lade = document.getElementById('lade');
function zeigeFehler(text) {
  lade.style.display = 'flex';
  lade.innerHTML = `Fehler beim Starten:<br><small>${text}</small>`;
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
renderer.setSize(B, H, false);

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
const l = CONFIG.licht;
szene.add(new THREE.AmbientLight(l.umgebungFarbe, l.umgebungStaerke));
const sonne = new THREE.DirectionalLight(l.sonneFarbe, l.sonneStaerke);
sonne.position.set(...l.sonneRichtung);
szene.add(sonne);

const kamera = new THREE.PerspectiveCamera(CONFIG.kamera.sichtfeld, B / H, 0.3, CONFIG.kamera.sichtweite);

// --- Welt aufbauen ---
const strecke = baueStrecke();
const welt = baueWelt(szene, strecke);
const pflanzen = bauePflanzen(szene, strecke, welt);
const kollision = baueKollision(pflanzen.hindernisse);
const checkpoints = baueCheckpointTore(szene, strecke);
const auto = baueAuto();
szene.add(auto.objekt);
const physik = new Fahrphysik();
const hud = baueHud(document.getElementById('hud'));

// --- Rennzustand ---
// bereit = vor der Startlinie, laeuft = Zeit läuft, ziel = durchs Ziel
const rennen = {
  zustand: 'bereit', zeit: 0, endZeit: 0, letztesS: 0, hilfe: true,
  naechsterCp: 0,        // welcher Checkpoint als nächster kommt (0 = der erste)
  zwischenzeiten: [],    // Zeit bei jedem Checkpoint (null = verpasst)
  meldung: null,         // Text oben im Bild: { text, farbe, bis }
  uhr: 0,                // läuft immer (für die Anzeigedauer der Meldungen)
};
let debugAn = false;

const kam = { yaw: 0, pos: new THREE.Vector3(), ziel: new THREE.Vector3() };
const optik = { nicken: 0, rollen: 0, neigX: 0, neigZ: 0 };

function setzeAuf(s, seite = 0) {
  kollision.restRuck = 0;
  kollision.ruhigZeit = 0;
  const p = strecke.punktBei(s);
  physik.reset(p.x + -p.tz * seite, p.z + p.tx * seite, Math.atan2(p.tx, p.tz));
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
}

function zeigeMeldung(text, farbe) {
  rennen.meldung = { text, farbe, bis: rennen.uhr + CONFIG.checkpoints.anzeigeDauer };
}

// Taste R: zurück auf die Strassenmitte an der aktuellen Stelle
function aufStrasse() {
  const q = strecke.abfrage(physik.x, physik.z);
  const s = begrenze(q.s, 2, strecke.laenge - 2);
  const p = strecke.punktBei(s);
  kollision.restRuck = 0;
  kollision.ruhigZeit = 0;
  physik.reset(p.x, p.z, Math.atan2(p.tx, p.tz));
  rennen.letztesS = s;
  kameraSofort();
}

// --- Physik-Schritt mit Untergrund, Steigung und Begrenzungen ---
const qAuto = {};
const SCHRITT = 1 / 120;
let untergrund = 'asphalt';

function bodenHoehe(x, z) {
  return welt.bodenBei(x, z).h;
}

function physikSchritt(dt, e) {
  const q = strecke.abfrage(physik.x, physik.z, qAuto);
  const boden = welt.bodenBei(physik.x, physik.z, q);
  untergrund = boden.art;
  const fx = Math.sin(physik.richtung), fz = Math.cos(physik.richtung);
  const hv = bodenHoehe(physik.x + fx * 1.3, physik.z + fz * 1.3);
  const hh = bodenHoehe(physik.x - fx * 1.3, physik.z - fz * 1.3);
  const u = CONFIG.untergrund[boden.art];

  let eingabe = e;
  if (rennen.zustand === 'ziel') eingabe = { ...e, gas: 0, bremse: Math.max(e.bremse, 0.35) };

  const xAlt = physik.x, zAlt = physik.z, hAlt = boden.h, wAlt = physik.richtung;
  physik.schritt(dt, eingabe, {
    grip: u.grip, rollen: u.rollen, rollenTempo: u.rollenTempo, steigung: begrenze((hv - hh) / 2.6, -0.5, 0.5),
  });

  // Zu steiler Hang (neben der Strasse): da kommt das Auto nicht hoch
  const g = CONFIG.grenze;
  const bodenNeu = welt.bodenBei(physik.x, physik.z);
  const weg = Math.hypot(physik.x - xAlt, physik.z - zAlt);
  if (bodenNeu.art === 'gras' && weg > 1e-4 && (bodenNeu.h - hAlt) / weg > g.steilsterHang) {
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
  kollision.loese(physik, xAlt, zAlt, wAlt, dt);

  // Begrenzungen: Felswand, Abhang, zu weit weg
  const q2 = strecke.abfrage(physik.x, physik.z, qAuto);
  const rx = -q2.tz, rz = q2.tx; // rechts
  if (q2.wandSeite && q2.wandStaerke > 0.3) {
    const ws = q2.wandSeite;
    const aufWandSeite = Math.sign(q2.seite) === ws;
    const ueber = Math.abs(q2.seite) - (aufWandSeite ? g.wandGrenze : g.abhangGrenze);
    if (ueber > 0) {
      const r = aufWandSeite ? ws : -ws;
      physik.anGrenze(rx * r, rz * r, ueber);
    }
  }
  if (q2.abstand > g.maxAbstand) {
    const p = strecke.punktBei(strecke.s[q2.i]);
    const nx = (physik.x - p.x) / q2.abstand, nz = (physik.z - p.z) / q2.abstand;
    physik.anGrenze(nx, nz, q2.abstand - g.maxAbstand);
  }

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
    const cp = CONFIG.checkpoints;
    const n = rennen.naechsterCp;
    if (n < checkpoints.length) {
      const cpS = checkpoints[n].s;
      if (amStueck && rennen.letztesS < cpS && s >= cpS && q2.abstand < cp.durchfahrtBreite) {
        // sauber durchs Tor gefahren
        rennen.zwischenzeiten[n] = rennen.zeit;
        rennen.naechsterCp++;
        zeigeMeldung(`CP ${n + 1}  ${formatZeit(rennen.zeit)}`, 'gelb');
      } else if (s > cpS + 5) {
        // schon hinter dem Tor, ohne durchgefahren zu sein
        zeigeMeldung('CHECKPOINT VERPASST', 'rot');
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
}

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
  auto.raederBewegen(physik.lenkwinkel, wegStrecke);
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
const qKam = {};
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
  // nicht in die Felswand
  const q = strecke.abfrage(kam.pos.x, kam.pos.z, qKam);
  if (q.wandSeite && q.wandStaerke > 0.2 && Math.sign(q.seite) === q.wandSeite) {
    const max = CONFIG.felswand.abstand - 0.8;
    const ueber = Math.abs(q.seite) - max;
    if (ueber > 0) {
      kam.pos.x -= -q.tz * q.wandSeite * ueber;
      kam.pos.z -= q.tx * q.wandSeite * ueber;
    }
  }
  // nicht unter das Gelände
  const boden = bodenHoehe(kam.pos.x, kam.pos.z) + 1.0;
  if (kam.pos.y < boden) kam.pos.y = boden;
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

// --- Spielschleife ---
let letzte = performance.now();
let akku = 0;
let fps = 60, fpsZaehler = 0, fpsZeit = 0;

function schleife(jetzt) {
  requestAnimationFrame(schleife);
  const dt = Math.min(0.1, (jetzt - letzte) / 1000);
  letzte = jetzt;

  fpsZaehler++;
  fpsZeit += dt;
  if (fpsZeit >= 0.5) { fps = fpsZaehler / fpsZeit; fpsZaehler = 0; fpsZeit = 0; }

  let e = leseEingabe(dt);
  // nur für automatische Tests: Eingabe von aussen
  const te = window.__alpineRally && window.__alpineRally.testEingabe;
  if (te) e = { ...e, ...te };
  if (e.debug) debugAn = !debugAn;
  if (e.reset) {
    if (rennen.zustand === 'ziel') neustart();
    else aufStrasse();
  }

  const xVor = physik.x, zVor = physik.z;
  akku += dt;
  // nur für automatische Tests: Physik von aussen gesteuert
  if (window.__alpineRally && window.__alpineRally.anhalten) akku = 0;
  while (akku >= SCHRITT) {
    physikSchritt(SCHRITT, e);
    akku -= SCHRITT;
  }
  if (physik.tempo > 3) rennen.hilfe = false;
  const weg = Math.hypot(physik.x - xVor, physik.z - zVor) * Math.sign(physik.vVor || 1);

  autoZeichnen(dt, weg);
  kameraFuehren(dt);
  welt.aktualisiere(kamera.position);
  renderer.render(szene, kamera);

  hud.zeichne({
    zustand: rennen.zustand, zeit: rennen.zeit, endZeit: rennen.endZeit, hilfe: rennen.hilfe,
    kmh: physik.tempo * 3.6, debug: debugAn, fps,
    meter: rennen.letztesS, laenge: strecke.laenge, drift: Math.abs(physik.driftWinkel),
    untergrund: { asphalt: 'ASPHALT', bankett: 'BANKETT', gras: 'GRAS' }[untergrund],
    hindernisse: kollision.anzahl, aufprall: kollision.letzterAufprall,
    meldung: rennen.meldung && rennen.uhr < rennen.meldung.bis ? rennen.meldung : null,
    zwischenzeiten: rennen.zwischenzeiten, anzahlCps: checkpoints.length,
    naechsterCp: rennen.naechsterCp < checkpoints.length
      ? { nummer: rennen.naechsterCp + 1, abstand: checkpoints[rennen.naechsterCp].s - rennen.letztesS }
      : { nummer: 0, abstand: strecke.zielS - rennen.letztesS },
  });
}

neustart();
lade.style.display = 'none';
requestAnimationFrame(schleife);

// Für Tests (Screenshots) von aussen erreichbar
window.__alpineRally = {
  THREE, physik, strecke, welt, rennen, kamera, renderer, szene, setzeAuf, pflanzen, kameraSofort, kollision,
  physikSchritt, SCHRITT, neustart, checkpoints, CONFIG,
  hudMeldung: () => (rennen.meldung && rennen.uhr < rennen.meldung.bis ? rennen.meldung.text : ''),
};
