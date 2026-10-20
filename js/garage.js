// Garage (Meilenstein 8c): drehendes 3D-Modell auf der Menüseite AUTO.
// Kein zweites WebGL-Fenster: eine zweite kleine Szene im selben Renderer. Nach dem Spielbild wird nur der Ausschnitt
// der Vorschau (Viewport + Scissor) mit dieser Szene neu gezeichnet, in derselben Renderauflösung wie das Spiel
// (Pixel-Look). Das Auto ist dasselbe Modell wie im Spiel: für dieses eine Bild auf die Drehscheibe gestellt (ruhig:
// keine Federung, Räder gerade und stehend, sauber, Lichter aus), danach genau so zurück, wie es war.
// main.js ruft zeichne() nur, solange die Seite AUTO offen ist: sonst kostet die Garage nichts.

import * as THREE from 'three';
import { CONFIG } from './config.js';

export function baueGarage(renderer) {
  const G = CONFIG.garage;
  const szene = new THREE.Scene();
  szene.background = new THREE.Color(G.hintergrund);
  const l = CONFIG.licht;
  szene.add(new THREE.AmbientLight(l.umgebungFarbe, l.umgebungStaerke));
  const sonne = new THREE.DirectionalLight(l.sonneFarbe, l.sonneStaerke);
  sonne.position.set(...l.sonneRichtung);
  szene.add(sonne);

  // Drehscheibe: flache Platte mit hellerem Rand; dreht sich mit dem Auto
  const scheibe = new THREE.Group();
  scheibe.name = 'garage-scheibe';
  szene.add(scheibe);
  const rand = new THREE.Mesh(new THREE.CylinderGeometry(G.platteRadius, G.platteRadius, G.platteHoehe, 28),
    new THREE.MeshLambertMaterial({ color: G.platteRand, flatShading: true }));
  rand.position.y = -G.platteHoehe / 2;
  scheibe.add(rand);
  const platte = new THREE.Mesh(new THREE.CylinderGeometry(G.platteRadius - 0.12, G.platteRadius - 0.12, 0.01, 28),
    new THREE.MeshLambertMaterial({ color: G.platte, flatShading: true }));
  platte.position.y = 0.005;
  scheibe.add(platte);

  const kamera = new THREE.PerspectiveCamera(G.sichtfeld, 2, 0.1, 60);
  let winkel = G.startWinkel * Math.PI / 180;

  // Zwischenspeicher für den Zustand des Spiel-Autos (keine neuen Objekte pro Bild)
  const pos = new THREE.Vector3(), quat = new THREE.Quaternion(), kQuat = new THREE.Quaternion();
  const radQ = [], RUHIG = { nicken: 0, rollen: 0, hub: 0 };
  const groesse = new THREE.Vector2();
  const info = { calls: 0, dreiecke: 0, bilder: 0 };

  // dt: Sekunden seit dem letzten Bild (dreht die Scheibe), auto: Modell aus js/car.js,
  // x, y, b, h: Ausschnitt in Pixeln des Renderers (y von unten, wie bei WebGL)
  function zeichne(dt, auto, x, y, b, h) {
    winkel += dt * 2 * Math.PI / G.drehDauer;
    scheibe.rotation.y = winkel;
    // Kamera: leicht von oben, das ganze Auto im Bild (Abstand nach der Länge des Autos)
    kamera.aspect = b / h;
    const abstand = G.abstand * Math.max(1, auto.modell.masse.laenge / 4.48);
    const neig = G.neigung * Math.PI / 180;
    kamera.position.set(0, G.blickHoehe + Math.sin(neig) * abstand, Math.cos(neig) * abstand);
    kamera.lookAt(0, G.blickHoehe, 0);
    kamera.updateProjectionMatrix();

    // Auto kurz auf die Scheibe stellen (und alles merken, was hier verändert wird)
    const o = auto.objekt, eltern = o.parent, k = auto.karosse;
    pos.copy(o.position); quat.copy(o.quaternion);
    const kY = k.position.y; kQuat.copy(k.quaternion);
    auto.raeder.forEach((r, i) => {
      if (!radQ[i]) radQ[i] = [new THREE.Quaternion(), new THREE.Quaternion()];
      radQ[i][0].copy(r.dreh.quaternion); radQ[i][1].copy(r.lenk.quaternion);
      r.dreh.quaternion.identity(); r.lenk.quaternion.identity();
    });
    const U = auto.uniforms, dreck = U.dreck.value, unschaerfe = U.unschaerfe.value;
    const [bremse, rueck] = auto.lichtZustand;
    U.dreck.value = 0; U.unschaerfe.value = 0;
    auto.lichter(false, false);
    auto.federung(RUHIG);
    scheibe.add(o);
    o.position.set(0, 0.01, 0);
    o.quaternion.identity();

    // nur den Ausschnitt zeichnen
    renderer.getSize(groesse);
    renderer.setViewport(x, y, b, h);
    renderer.setScissor(x, y, b, h);
    renderer.setScissorTest(true);
    renderer.render(szene, kamera);
    info.calls = renderer.info.render.calls; info.dreiecke = renderer.info.render.triangles; info.bilder++;
    renderer.setScissorTest(false);
    renderer.setViewport(0, 0, groesse.x, groesse.y);

    // alles zurück
    if (eltern) eltern.add(o); else scheibe.remove(o);
    o.position.copy(pos); o.quaternion.copy(quat);
    k.position.y = kY; k.quaternion.copy(kQuat);
    auto.raeder.forEach((r, i) => { r.dreh.quaternion.copy(radQ[i][0]); r.lenk.quaternion.copy(radQ[i][1]); });
    U.dreck.value = dreck; U.unschaerfe.value = unschaerfe;
    auto.lichter(bremse, rueck);
  }

  return { zeichne, szene, kamera, scheibe, info, get winkel() { return winkel; } };
}
