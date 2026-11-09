// Seilbahn (Meilenstein 11b, Streckendatei "seilbahn"): Gondelbahn von der Talstation zur Bergstation im Skigebiet.
// Masten (Stahl, grau) auf einer geraden Linie, zwei Seile (hinauf, hinunter), Gondeln, die langsam im Kreis fahren.
// Reine Deko: keine Kollision (die Masten stehen neben der Strasse im Tiefschnee), kein Ton. Die Wege sind beim Laden
// vorberechnet; je Bild wird nur die Lage der Gondeln gesetzt (eine InstancedMesh, kein Garbage).
// Eintrag: { von: [s, lat], bis: [s, lat], masten, gondeln } (Talstation und Bergstation: Streckenmeter und Abstand,
// + = rechts). Werte: config.js, Block seilbahn. Ohne "seilbahn" (Alpen, Finnland) passiert hier nichts.
import * as THREE from 'three';
import { CONFIG } from './config.js';
import { STRECKE } from './streckenlader.js';

export function baueSeilbahn(szene, strecke, netz, welt) {
  const D = STRECKE && STRECKE.seilbahn, C = CONFIG.seilbahn;
  const aus = typeof location !== 'undefined' && /[?&]seilbahn=aus/.test(location.search); // (nur Bildzeit-Messung)
  if (!D || !C || aus) return { an: false, aktualisiere: () => {}, masten: [], gondeln: 0, meshes: [] };
  const punkt = (s, lat) => { const p = strecke.punktBei(s); return { x: p.x - p.tz * lat, z: p.z + p.tx * lat }; };
  const A = punkt(D.von[0], D.von[1]), B = punkt(D.bis[0], D.bis[1]);
  const L = Math.hypot(B.x - A.x, B.z - A.z), ex = (B.x - A.x) / L, ez = (B.z - A.z) / L, qx = -ez, qz = ex;
  // Masten: gleichmässig verteilt; steht einer zu nahe an der Strasse, wird er entlang der Linie verschoben
  const q = {}, masten = [];
  const frei = (x, z) => { strecke.abfrage(x, z, q); return Math.abs(q.seite) > netz.halbBei(q.s) + CONFIG.strasse.bankett + C.strasseAbstand; };
  for (let k = 0; k <= D.masten + 1; k++) {
    let a = (k / (D.masten + 1)) * L;
    if (k > 0 && k <= D.masten) for (let d = 0; d < 60 && !frei(A.x + ex * a, A.z + ez * a); d += 3) a += (d % 2 ? -1 : 1) * d;
    const x = A.x + ex * a, z = A.z + ez * a, boden = welt.gelaendeHoehe(x, z);
    masten.push({ a, x, z, boden, oben: boden + (k === 0 || k === D.masten + 1 ? C.stationHoehe : C.mastHoehe), station: k === 0 || k === D.masten + 1 });
  }
  // Seilhöhe an der Stelle a (zwischen zwei Masten leicht durchhängend); mindestens C.bodenFrei über dem Gelände
  for (let k = 1; k < masten.length - 1; k++) {
    const m = masten[k];
    for (let j = 1; j < 10; j++) { // (Masten höher setzen, bis das Seil überall frei ist)
      let tief = Infinity;
      for (const n of [masten[k - 1], masten[k + 1]]) for (let t = 0.1; t < 1; t += 0.1) {
        const x = m.x + (n.x - m.x) * t, z = m.z + (n.z - m.z) * t, y = m.oben + (n.oben - m.oben) * t - C.durchhang * 4 * t * (1 - t);
        tief = Math.min(tief, y - welt.gelaendeHoehe(x, z));
      }
      if (tief >= C.bodenFrei) break;
      m.oben += C.bodenFrei - tief + 1;
    }
  }
  const seilY = (a) => {
    let k = 0; while (k < masten.length - 2 && masten[k + 1].a < a) k++;
    const m0 = masten[k], m1 = masten[k + 1], t = Math.max(0, Math.min(1, (a - m0.a) / (m1.a - m0.a)));
    return m0.oben + (m1.oben - m0.oben) * t - C.durchhang * 4 * t * (1 - t);
  };
  // --- Masten (Kasten mit Querträger) und Seile: eine Fläche, ein Linienzug ---
  const pos = [], idx = [];
  const kasten = (x, y0, z, y1, b, t) => { // senkrechter Kasten b x t (quer x längs)
    const n = pos.length / 3;
    for (const [dy] of [[y0], [y1]]) for (const [u, v] of [[-b, -t], [b, -t], [b, t], [-b, t]]) pos.push(x + qx * u + ex * v, dy, z + qz * u + ez * v);
    for (let i = 0; i < 4; i++) { const a = n + i, b2 = n + ((i + 1) % 4); idx.push(a, b2, b2 + 4, a, b2 + 4, a + 4); }
    idx.push(n + 4, n + 5, n + 6, n + 4, n + 6, n + 7);
  };
  for (const m of masten) {
    if (m.station) continue; // (Stationen: das Gondelhaus steht dort schon, js/leben.js)
    kasten(m.x, m.boden - 0.5, m.z, m.oben, C.mastBreite / 2, C.mastBreite / 2);
    // Querträger oben (die zwei Seile hängen an seinen Enden)
    const n = pos.length / 3, y = m.oben, b = C.spur / 2 + 0.6, h = 0.35, t = 0.3;
    for (const [dy] of [[y - h], [y]]) for (const [u, v] of [[-b, -t], [b, -t], [b, t], [-b, t]]) pos.push(m.x + qx * u + ex * v, dy, m.z + qz * u + ez * v);
    for (let i = 0; i < 4; i++) { const a = n + i, b2 = n + ((i + 1) % 4); idx.push(a, b2, b2 + 4, a, b2 + 4, a + 4); }
  }
  const meshes = [];
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx);
  const g2 = geo.toNonIndexed(); g2.computeVertexNormals();
  const mastMesh = new THREE.Mesh(g2, new THREE.MeshLambertMaterial({ color: C.mastFarbe, flatShading: true }));
  szene.add(mastMesh); meshes.push(mastMesh);
  const linien = [];
  for (const sd of [-1, 1]) for (let a = 0; a < L; a += C.seilSchritt) {
    const a2 = Math.min(L, a + C.seilSchritt), o = sd * C.spur / 2;
    linien.push(A.x + ex * a + qx * o, seilY(a), A.z + ez * a + qz * o, A.x + ex * a2 + qx * o, seilY(a2), A.z + ez * a2 + qz * o);
  }
  const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute(linien, 3));
  const seil = new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: C.seilFarbe }));
  szene.add(seil); meshes.push(seil);
  // --- Gondeln: Kabine (Kasten) mit Gehänge, eine InstancedMesh; Umlauf 2L (hinauf rechts, hinunter links) ---
  const kab = new THREE.BoxGeometry(C.gondel[0], C.gondel[1], C.gondel[2]);
  kab.translate(0, -C.gondel[1] / 2 - C.gehaenge, 0);
  const N = D.gondeln, gm = new THREE.InstancedMesh(kab, new THREE.MeshLambertMaterial({ color: C.gondelFarbe }), N);
  gm.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  gm.frustumCulled = false; // (die Gondeln fahren über die ganze Linie; die Hülle der Instanzen kennt Three.js nicht)
  szene.add(gm); meshes.push(gm);
  // Umlauf vorberechnet (alle 1 m eine Lage), je Bild nur nachschlagen
  const U = Math.ceil(2 * L), lageX = new Float32Array(U), lageY = new Float32Array(U), lageZ = new Float32Array(U);
  for (let i = 0; i < U; i++) {
    const hin = i < L, a = hin ? i : 2 * L - i, o = (hin ? 1 : -1) * C.spur / 2;
    lageX[i] = A.x + ex * a + qx * o; lageY[i] = seilY(a); lageZ[i] = A.z + ez * a + qz * o;
  }
  const M = new THREE.Matrix4(), Q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.atan2(ex, ez)), S1 = new THREE.Vector3(1, 1, 1), V = new THREE.Vector3();
  let weg = 0;
  function aktualisiere(dt) {
    weg = (weg + dt * C.tempo) % U;
    for (let g = 0; g < N; g++) {
      const i = Math.floor((weg + (g * U) / N) % U);
      V.set(lageX[i], lageY[i], lageZ[i]);
      M.compose(V, Q, S1); gm.setMatrixAt(g, M);
    }
    gm.instanceMatrix.needsUpdate = true;
  }
  aktualisiere(0);
  return { an: true, aktualisiere, masten, gondeln: N, meshes, laenge: L, lage: () => weg, gondelMesh: gm };
}
