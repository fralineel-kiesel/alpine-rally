// Das Platzhalter-Auto "Ringwerk RT4": kantiges 80er-Rally-Coupé aus Boxen.
// Die Fahrphysik steckt in physics.js, hier nur Aussehen und Räder.

import * as THREE from 'three';
import { CONFIG } from './config.js';

// Kabine mit schräger Front- und Heckscheibe (8 Ecken)
function kabine(breiteUnten, breiteOben, zVorneUnten, zVorneOben, zHintenOben, zHintenUnten, hoehe) {
  const bu = breiteUnten / 2, bo = breiteOben / 2;
  const p = [
    [-bu, 0, zVorneUnten], [bu, 0, zVorneUnten], [bu, 0, zHintenUnten], [-bu, 0, zHintenUnten],
    [-bo, hoehe, zVorneOben], [bo, hoehe, zVorneOben], [bo, hoehe, zHintenOben], [-bo, hoehe, zHintenOben],
  ];
  // Flächen: [Ecken], Art ('dach', 'scheibe', 'seite')
  const flaechen = [
    [[4, 5, 6, 7], 'dach'],
    [[0, 1, 5, 4], 'scheibe'], // Frontscheibe
    [[2, 3, 7, 6], 'scheibe'], // Heckscheibe
    [[1, 2, 6, 5], 'seite'],
    [[3, 0, 4, 7], 'seite'],
  ];
  return { p, flaechen };
}

export function baueAuto() {
  const f = CONFIG.farben;
  const lack = new THREE.MeshLambertMaterial({ color: f.autoLack, flatShading: true });
  const streifen = new THREE.MeshLambertMaterial({ color: f.autoStreifen, flatShading: true });
  const scheiben = new THREE.MeshLambertMaterial({ color: f.autoScheiben, flatShading: true });
  const schwarz = new THREE.MeshLambertMaterial({ color: f.autoSchwarz, flatShading: true });
  const licht = new THREE.MeshBasicMaterial({ color: '#fff6d8' });
  const ruecklicht = new THREE.MeshBasicMaterial({ color: '#b01818' });
  const felge = new THREE.MeshLambertMaterial({ color: '#9a9c9e', flatShading: true });

  const auto = new THREE.Group();      // folgt Position + Richtung
  const karosse = new THREE.Group();   // neigt sich (Gelände, Kurven)
  auto.add(karosse);

  const box = (b, h, l, x, y, z, mat) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(b, h, l), mat);
    m.position.set(x, y, z);
    karosse.add(m);
    return m;
  };

  // Auto schaut nach +z. Masse ungefähr: 4.4 m lang, 1.8 m breit.
  const boden = 0.3;
  // Grundkörper (Motorhaube flach, Heck kantig)
  box(1.7, 0.52, 4.3, 0, boden + 0.26, 0, lack);
  // Kastenkotflügel vorne und hinten (breiter als der Körper)
  box(1.84, 0.44, 1.05, 0, boden + 0.3, 1.26, lack);
  box(1.84, 0.44, 1.05, 0, boden + 0.3, -1.26, lack);
  // Der eine farbige Streifen rundherum
  box(1.86, 0.1, 4.32, 0, boden + 0.36, 0, streifen);
  // Stossstangen
  box(1.76, 0.2, 0.14, 0, boden + 0.08, 2.17, schwarz);
  box(1.76, 0.2, 0.14, 0, boden + 0.08, -2.17, schwarz);
  // Scheinwerfer und Rücklichter
  box(0.46, 0.14, 0.04, -0.52, boden + 0.38, 2.16, licht);
  box(0.46, 0.14, 0.04, 0.52, boden + 0.38, 2.16, licht);
  box(0.42, 0.13, 0.04, -0.58, boden + 0.4, -2.16, ruecklicht);
  box(0.42, 0.13, 0.04, 0.58, boden + 0.4, -2.16, ruecklicht);
  // kleine Heckspoiler-Lippe
  box(1.5, 0.05, 0.3, 0, boden + 0.56, -1.98, schwarz);

  // Kabine: steile Frontscheibe, kantiges Dach
  {
    const k = kabine(1.56, 1.3, 0.62, 0.24, -1.05, -1.62, 0.56);
    const dachPos = [], scheibePos = [];
    for (const [ecken, art] of k.flaechen) {
      const [a, b, c, d] = ecken.map((i) => k.p[i]);
      const ziel = art === 'dach' ? dachPos : scheibePos;
      ziel.push(...a, ...b, ...c, ...a, ...c, ...d);
    }
    const mach = (arr, mat) => {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(arr, 3));
      g.computeVertexNormals();
      const m = new THREE.Mesh(g, mat);
      mat.side = THREE.DoubleSide;
      m.position.y = boden + 0.52;
      karosse.add(m);
    };
    mach(dachPos, lack.clone());
    mach(scheibePos, scheiben);
    // Dachkante etwas dicker
    box(1.32, 0.05, 1.29, 0, boden + 1.09, -0.405, lack);
  }

  // Räder: vorne lenkbar, alle drehen sich
  const raeder = [];
  const radGeo = new THREE.CylinderGeometry(0.33, 0.33, 0.24, 10);
  radGeo.rotateZ(Math.PI / 2);
  const felgeGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.25, 6);
  felgeGeo.rotateZ(Math.PI / 2);
  for (const [x, z, vorne] of [[-0.8, 1.26, true], [0.8, 1.26, true], [-0.8, -1.26, false], [0.8, -1.26, false]]) {
    const lenk = new THREE.Group();
    lenk.position.set(x, 0.33, z);
    const dreh = new THREE.Group();
    dreh.add(new THREE.Mesh(radGeo, schwarz));
    const fm = new THREE.Mesh(felgeGeo, felge);
    dreh.add(fm);
    lenk.add(dreh);
    auto.add(lenk); // Räder neigen sich nicht mit der Karosserie
    raeder.push({ lenk, dreh, vorne });
  }

  // einfacher dunkler Fleck als Schatten
  if (CONFIG.autoOptik.blobSchatten) {
    const g = new THREE.PlaneGeometry(2.0, 4.4);
    g.rotateX(-Math.PI / 2);
    const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: '#000', transparent: true, opacity: 0.3, depthWrite: false }));
    m.position.y = 0.05;
    m.renderOrder = 1;
    auto.add(m);
  }

  return {
    objekt: auto,
    karosse,
    // Räder drehen + einlenken
    raederBewegen(lenkwinkel, strecke) {
      for (const r of raeder) {
        r.dreh.rotation.x += strecke / 0.33;
        if (r.vorne) r.lenk.rotation.y = lenkwinkel;
      }
    },
  };
}
