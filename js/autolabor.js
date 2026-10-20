// Auto-Labor (M8a): Hilfsseite zum Ansehen des Autos ohne Fahren (auto-labor.html, nicht im Menü verlinkt).
// Benutzt dieselbe baueAuto() aus js/car.js und dieselben Werte aus js/config.js wie das Spiel, dieselbe kleine
// Renderauflösung mit scharfem Hochskalieren. Die Regler ersetzen die Zahlen, die sonst die Fahrphysik liefert.
// Ändert nichts am Spiel (nichts wird gespeichert).

import * as THREE from 'three';
import { CONFIG } from './config.js';
import { baueAuto } from './car.js';
import { baueFederung } from './federung.js';
import { baueStaub } from './staub.js';

const $ = (id) => document.getElementById(id);
const O = CONFIG.autoOptik;

// --- Renderer wie im Spiel: feste kleine Auflösung, scharf hochskaliert ---
const renderer = new THREE.WebGLRenderer({ canvas: $('bild'), antialias: false });
renderer.setPixelRatio(1);
function aufloesung(nr) {
  const [b, h] = CONFIG.menue.aufloesungen[nr] || CONFIG.menue.aufloesungen[0];
  renderer.setSize(b, h, false);
  if (auto) auto.detail(b); // kleine Schrift am Auto erst bei feinerem Bild (wie im Spiel)
}
let auto = null;
aufloesung(0);

// --- Szene: Licht wie im Spiel, Boden, Hintergrund hell oder dunkel ---
const szene = new THREE.Scene();
const HELL = new THREE.Color(CONFIG.farben.dunst), DUNKEL = new THREE.Color('#141a22');
szene.background = HELL.clone();
const l = CONFIG.licht;
szene.add(new THREE.AmbientLight(l.umgebungFarbe, l.umgebungStaerke));
const sonne = new THREE.DirectionalLight(l.sonneFarbe, l.sonneStaerke);
sonne.position.set(...l.sonneRichtung);
szene.add(sonne);
const bodenGeo = new THREE.CircleGeometry(9, 24);
bodenGeo.rotateX(-Math.PI / 2);
const boden = new THREE.Mesh(bodenGeo, new THREE.MeshLambertMaterial({ color: CONFIG.farben.asphalt, flatShading: true }));
szene.add(boden);

const kamera = new THREE.PerspectiveCamera(CONFIG.kamera.sichtfeld, 16 / 9, 0.1, 300);

// --- Das Auto (dieselbe Funktion wie im Spiel) ---
auto = baueAuto(undefined, undefined, renderer.domElement.width);
szene.add(auto.objekt);
$('titel').textContent = `ALPINE RALLY · AUTO-LABOR · ${auto.modell.name}`; // (Name aus js/autos.js)
const federung = baueFederung();
const staub = baueStaub(szene);
const staubAuto = { x: 0, y: 0, z: 0, richtung: 0, vx: 0, vz: 0, tempo: 0, drift: 0, gas: 0, handbremse: false, schotter: true, belag: 'schotter' };

// --- Kamera: kreist um einen Punkt am Auto (Maus ziehen = drehen, Rad = Abstand) ---
const ZIEL = new THREE.Vector3(0, 0.65, 0);
const orbit = { gier: Math.PI, neig: 0.27, abstand: 7.2 };
// Ansichten: Kamera-Ort relativ zum Auto (x links, y hoch, z vorne). "Heck" = wie die Spielkamera (6.9 m hinter, 2.5 m hoch)
const ANSICHTEN = {
  heck: { name: 'HECK', pos: [0, CONFIG.kamera.hoehe, -CONFIG.kamera.abstand] },
  seite: { name: 'SEITE LINKS', pos: [7, 1.0, 0] },
  hinten34: { name: 'DREI-VIERTEL HINTEN', pos: [4.6, 2.2, -5.4] },
  front: { name: 'FRONT', pos: [0, 1.1, 7] },
  vorne34: { name: 'DREI-VIERTEL VORNE', pos: [4.6, 1.6, 5.4] },
  oben: { name: 'VON OBEN', pos: [0, 9, -0.01] },
};
function ansicht(name) {
  const a = ANSICHTEN[name];
  if (!a) return;
  const [x, y, z] = a.pos;
  const dx = x - ZIEL.x, dy = y - ZIEL.y, dz = z - ZIEL.z;
  orbit.abstand = Math.hypot(dx, dy, dz);
  orbit.gier = Math.atan2(dx, dz);
  orbit.neig = Math.asin(Math.max(-1, Math.min(1, dy / orbit.abstand)));
  drehscheibe = false; $('drehscheibe').classList.remove('an');
}
for (const [n, a] of Object.entries(ANSICHTEN)) {
  const k = document.createElement('button'); k.textContent = a.name; k.addEventListener('click', () => ansicht(n));
  $('ansichten').append(k);
}
function kameraSetzen() {
  const c = Math.cos(orbit.neig);
  kamera.position.set(ZIEL.x + Math.sin(orbit.gier) * c * orbit.abstand, ZIEL.y + Math.sin(orbit.neig) * orbit.abstand, ZIEL.z + Math.cos(orbit.gier) * c * orbit.abstand);
  kamera.lookAt(ZIEL);
}
const buehne = $('buehne');
let ziehen = null;
buehne.addEventListener('pointerdown', (e) => { ziehen = { x: e.clientX, y: e.clientY }; buehne.setPointerCapture(e.pointerId); });
buehne.addEventListener('pointermove', (e) => {
  if (!ziehen) return;
  orbit.gier -= (e.clientX - ziehen.x) * 0.008;
  orbit.neig = Math.max(-0.1, Math.min(1.55, orbit.neig + (e.clientY - ziehen.y) * 0.006));
  ziehen = { x: e.clientX, y: e.clientY };
});
buehne.addEventListener('pointerup', () => { ziehen = null; });
buehne.addEventListener('wheel', (e) => { e.preventDefault(); orbit.abstand = Math.max(2.5, Math.min(40, orbit.abstand * (e.deltaY > 0 ? 1.1 : 1 / 1.1))); }, { passive: false });

// --- Regler ---
const zustand = {
  lenkung: 0, tempo: 0, nicken: 0, rollen: 0, hub: 0, dreck: 0, dreckBelag: 'wiesenweg', bremslicht: false, rueckfahrlicht: false,
  staub: false, drehscheibe: false, hell: true, federTest: 0,
};
let drehscheibe = false;
for (const name of auto.modell.lackierungen) $('lackierung').insertAdjacentHTML('beforeend', `<option value="${name}">${name.toUpperCase()}</option>`);
$('lackierung').value = auto.lackName;
$('lackierung').addEventListener('change', () => { auto.lackierung($('lackierung').value); });
for (const b of Object.keys(O.dreck.belaege)) $('dreckBelag').insertAdjacentHTML('beforeend', `<option value="${b}">${b.toUpperCase()}</option>`);
$('dreckBelag').value = zustand.dreckBelag;
$('aufloesung').addEventListener('change', () => aufloesung(+$('aufloesung').value));
const anzeigen = () => {
  zustand.lenkung = +$('lenkung').value; zustand.tempo = +$('tempo').value / 3.6;
  zustand.nicken = +$('nicken').value; zustand.rollen = +$('rollen').value; zustand.hub = +$('hub').value;
  zustand.dreck = +$('dreck').value; zustand.dreckBelag = $('dreckBelag').value;
  $('lenkungW').textContent = (+$('lenkung').value).toFixed(2);
  $('tempoW').textContent = `${$('tempo').value} km/h`;
  $('nickenW').textContent = `${(+$('nicken').value).toFixed(1)}°`;
  $('rollenW').textContent = `${(+$('rollen').value).toFixed(1)}°`;
  $('hubW').textContent = `${(+$('hub').value).toFixed(1)} cm`;
  $('dreckW').textContent = (+$('dreck').value).toFixed(2);
};
for (const id of ['lenkung', 'tempo', 'nicken', 'rollen', 'hub', 'dreck', 'dreckBelag']) $(id).addEventListener('input', () => { zustand.federTest = 0; anzeigen(); });
anzeigen();
const schalter = (id, feld, text) => $(id).addEventListener('click', () => {
  zustand[feld] = !zustand[feld];
  $(id).classList.toggle('an', zustand[feld]);
  if (text) $(id).textContent = text(zustand[feld]);
});
schalter('bremslicht', 'bremslicht');
schalter('rueckfahrlicht', 'rueckfahrlicht');
schalter('staub', 'staub');
schalter('hintergrund', 'hell', (an) => `HINTERGRUND: ${an ? 'HELL' : 'DUNKEL'}`);
$('drehscheibe').addEventListener('click', () => { drehscheibe = !drehscheibe; $('drehscheibe').classList.toggle('an', drehscheibe); });
// Federung vorführen: Stoss (frontaler Aufprall mit 8 m/s) oder Bremsen (1 s Vollbremsung, dann los)
$('stoss').addEventListener('click', () => { federung.reset(); federung.stoss(-8, 0); zustand.federTest = 2.5; zustand.federArt = 'stoss'; });
$('bremsen').addEventListener('click', () => { federung.reset(); zustand.federTest = 2.5; zustand.federArt = 'bremsen'; });
$('federNull').addEventListener('click', () => {
  for (const id of ['nicken', 'rollen', 'hub']) $(id).value = 0;
  zustand.federTest = 0; anzeigen();
});

// --- BILD SPEICHERN: das aktuelle Bild (in der gewählten Pixelgrösse) als PNG ---
function bildDaten() {
  zeichne(0);
  return renderer.domElement.toDataURL('image/png');
}
$('speichern').addEventListener('click', () => {
  const a = document.createElement('a');
  a.href = bildDaten();
  a.download = `auto-labor-${auto.lackName}-${renderer.domElement.width}x${renderer.domElement.height}.png`;
  a.click();
});

// --- Bild ---
const farbe = new THREE.Color();
const haltung = { nicken: 0, rollen: 0, hub: 0 }; // Federung aus den Reglern
const dreckWerte = { menge: 0, r: 0, g: 0, b: 0 }; // Dreck aus dem Regler
const rad = { lenkwinkel: 0, strecke: 0, tempo: 0 }; // Räder aus den Reglern
function zeichne(dt) {
  if (drehscheibe) orbit.gier += dt * 0.6;
  kameraSetzen();
  szene.background.copy(zustand.hell ? HELL : DUNKEL);
  // Räder: Lenkung (bis radEinschlagMax) und Drehung aus dem Tempo
  const radMax = O.radEinschlagMax * Math.PI / 180;
  rad.lenkwinkel = -zustand.lenkung * radMax; rad.strecke = zustand.tempo * dt; rad.tempo = zustand.tempo;
  auto.raederBewegen(rad);
  // Federung: Regler oder Vorführung (Feder-Dämpfer wie im Spiel)
  if (zustand.federTest > 0) {
    zustand.federTest -= dt;
    const bremst = zustand.federArt === 'bremsen' && zustand.federTest > 1.5;
    federung.schritt(dt, bremst ? -10 : 0, 0, 0);
    auto.federung(federung);
  } else {
    haltung.nicken = zustand.nicken * Math.PI / 180; haltung.rollen = zustand.rollen * Math.PI / 180; haltung.hub = zustand.hub / 100;
    auto.federung(haltung);
  }
  // Dreck (Regler 0..1 direkt; im Spiel höchstens autoOptik.dreck.max), Farbe wie im Spiel je Belag
  const d = O.dreck.belaege[zustand.dreckBelag];
  farbe.set(d.farbe || CONFIG.staub.farbe);
  dreckWerte.menge = zustand.dreck; dreckWerte.r = farbe.r; dreckWerte.g = farbe.g; dreckWerte.b = farbe.b;
  auto.dreck(dreckWerte);
  auto.lichter(zustand.bremslicht, zustand.rueckfahrlicht);
  // Staub: das Auto steht, der Staub fliegt nach hinten weg, als ob es fährt (Tempo-Regler, mindestens 40 km/h)
  if (zustand.staub) {
    const v = Math.max(11, Math.abs(zustand.tempo)), m = CONFIG.staub.mitnehmen;
    staubAuto.tempo = v; staubAuto.vz = -v * (1 - m) / m; staubAuto.gas = 0.7;
    staubAuto.belag = zustand.dreckBelag === 'wiesenweg' ? 'wiesenweg' : 'schotter';
  } else staubAuto.tempo = 0;
  staub.aktualisiere(dt, staubAuto);
  renderer.render(szene, kamera);
}
let letzte = performance.now();
function schleife(jetzt) {
  requestAnimationFrame(schleife);
  const dt = Math.min(0.1, Math.max(0, (jetzt - letzte) / 1000));
  letzte = jetzt;
  zeichne(dt);
  if ((info.n = (info.n + 1) % 15) === 0) {
    const r = renderer.info.render, m = auto.modell.masse;
    $('info').textContent = `${auto.modell.name} · Lackierung ${auto.lackName.toUpperCase()} · Bild ${renderer.domElement.width}x${renderer.domElement.height}` +
      ` · ${r.calls} Zeichenaufrufe, ${r.triangles} Dreiecke (mit Boden${zustand.staub ? ' und Staub' : ''})\n` +
      `Masse: ${m.laenge} x ${m.breite} m, Radstand ${m.radstand} m, Spur ${m.spur} m, Radradius ${m.radRadius} m`;
  }
}
const info = { n: 0 };
ansicht('hinten34');
requestAnimationFrame(schleife);

// Für tools/auto-test.mjs und Bilder
window.__autoLabor = {
  THREE, CONFIG, auto, renderer, szene, kamera, federung, staub, orbit, zustand, ansicht, ANSICHTEN, bildDaten, zeichne,
  aufloesung, setzeDrehscheibe: (an) => { drehscheibe = an; },
};
