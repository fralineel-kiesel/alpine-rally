// Staub auf Schotter (Meilenstein 3a): helle Wölkchen hinter den Hinterrädern.
// Seit M3b auch auf dem Wiesenweg: dunkler, erdig und schwächer (Farbe und Stärke je Belag: staub.belaege).
// Stärker beim Driften, mit Handbremse und beim Anfahren mit viel Gas, schwach bei ruhiger
// Fahrt, nie auf Asphalt. Höchstens staub.max Wölkchen gleichzeitig (fester Vorrat, der immer
// wieder benutzt wird: kein Speichermüll pro Bild), ein Zeichenaufruf (instanziert).
// Die Wölkchen sind gerastert durchscheinend (Pixelmuster), damit sie zum Pixel-Look passen
// und die Sicht nicht verdecken. Werte: config.js, Block "staub".

import * as THREE from 'three';
import { CONFIG } from './config.js';
import { zufall, mische, begrenze } from './util.js';

const VERTEX = /* glsl */ `
  #include <common>
  #include <fog_pars_vertex>
  attribute vec4 aWolke;     // x, y, z, Grösse (0 = aus)
  attribute float aDichte;   // 0..1
  attribute vec3 aFarbe;     // Farbe je Wölkchen (je Belag, M3b)
  varying vec2 vUv;
  varying float vDichte;
  varying vec3 vFarbe;
  void main() {
    vUv = uv;
    vDichte = aDichte;
    vFarbe = aFarbe;
    // Billboard: Ecke in Kamera-Richtung aufspannen
    vec4 mvPosition = viewMatrix * vec4(aWolke.xyz, 1.0);
    mvPosition.xy += position.xy * aWolke.w;
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`;
const FRAGMENT = /* glsl */ `
  #include <common>
  #include <fog_pars_fragment>
  varying vec2 vUv;
  varying float vDichte;
  varying vec3 vFarbe;
  // 4x4-Raster (Bayer): je nach Dichte werden mehr oder weniger Pixel gezeichnet
  float raster(vec2 p) {
    vec2 q = mod(floor(p), 4.0);
    float i = q.x + q.y * 4.0;
    if (i < 0.5) return 0.0;   if (i < 1.5) return 8.0;  if (i < 2.5) return 2.0;  if (i < 3.5) return 10.0;
    if (i < 4.5) return 12.0;  if (i < 5.5) return 4.0;  if (i < 6.5) return 14.0; if (i < 7.5) return 6.0;
    if (i < 8.5) return 3.0;   if (i < 9.5) return 11.0; if (i < 10.5) return 1.0; if (i < 11.5) return 9.0;
    if (i < 12.5) return 15.0; if (i < 13.5) return 7.0; if (i < 14.5) return 13.0; return 5.0;
  }
  void main() {
    vec2 d = vUv - 0.5;
    float r = length(d) * 2.0;
    // weiche, leicht wolkige Form: in der Mitte dichter
    float form = clamp(1.0 - r, 0.0, 1.0);
    float dichte = vDichte * form * (1.2 + 0.25 * sin(vUv.x * 13.0 + vUv.y * 7.0));
    if (dichte * 16.0 <= raster(gl_FragCoord.xy) + 0.5) discard;
    gl_FragColor = vec4(vFarbe * (0.92 + 0.12 * (1.0 - r)), 1.0);
    #include <colorspace_fragment>
    #include <fog_fragment>
  }
`;

export function baueStaub(szene) {
  const c = CONFIG.staub;
  const N = c.max;
  const rnd = zufall(c.seed);
  // Vorrat: Position, Tempo, Alter, Lebensdauer, Startgrösse
  const px = new Float32Array(N), py = new Float32Array(N), pz = new Float32Array(N);
  const vx = new Float32Array(N), vy = new Float32Array(N), vz = new Float32Array(N);
  const alter = new Float32Array(N).fill(1e9), leben = new Float32Array(N).fill(1), staerke = new Float32Array(N);
  let naechster = 0, guthaben = 0;

  const basis = new THREE.PlaneGeometry(1, 1);
  const geo = new THREE.InstancedBufferGeometry();
  geo.index = basis.index;
  geo.setAttribute('position', basis.attributes.position);
  geo.setAttribute('uv', basis.attributes.uv);
  const wolke = new THREE.InstancedBufferAttribute(new Float32Array(N * 4), 4);
  const dichte = new THREE.InstancedBufferAttribute(new Float32Array(N), 1);
  const farbeAttr = new THREE.InstancedBufferAttribute(new Float32Array(N * 3), 3);
  wolke.setUsage(THREE.DynamicDrawUsage);
  dichte.setUsage(THREE.DynamicDrawUsage);
  farbeAttr.setUsage(THREE.DynamicDrawUsage);
  geo.setAttribute('aWolke', wolke);
  geo.setAttribute('aDichte', dichte);
  geo.setAttribute('aFarbe', farbeAttr);
  geo.instanceCount = N;
  const l = CONFIG.licht;
  const licht = new THREE.Color(l.umgebungFarbe).multiplyScalar(l.umgebungStaerke).add(new THREE.Color(l.sonneFarbe).multiplyScalar(l.sonneStaerke * 0.5));
  // Farbe (schon mit Licht) und Stärke je Belag; ohne Angabe gilt staub.farbe und Stärke 1
  const jeBelag = {};
  for (const [belag, b] of Object.entries(c.belaege || { schotter: {} })) {
    jeBelag[belag] = { farbe: new THREE.Color(b.farbe || c.farbe).multiply(licht), staerke: b.staerke ?? 1 };
  }
  const standard = jeBelag.schotter || { farbe: new THREE.Color(c.farbe).multiply(licht), staerke: 1 };
  const mat = new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog]),
    vertexShader: VERTEX, fragmentShader: FRAGMENT, fog: true,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  mesh.name = 'staub';
  szene.add(mesh);

  // Ein Wölkchen an einem Hinterrad starten. wx, wz: zusätzlicher Wurf zur Seite (beim Driften)
  function starte(x, y, z, ax, az, st, wx = 0, wz = 0, farbe = standard.farbe) {
    const k = naechster;
    farbeAttr.array[k * 3] = farbe.r; farbeAttr.array[k * 3 + 1] = farbe.g; farbeAttr.array[k * 3 + 2] = farbe.b;
    farbeAttr.needsUpdate = true;
    naechster = (naechster + 1) % N;
    px[k] = x + (rnd() - 0.5) * 0.3; py[k] = y + 0.15; pz[k] = z + (rnd() - 0.5) * 0.3;
    // ein Teil des Autotempos, etwas zur Seite, nach oben
    vx[k] = ax * c.mitnehmen + wx + (rnd() - 0.5) * c.streuung;
    vz[k] = az * c.mitnehmen + wz + (rnd() - 0.5) * c.streuung;
    vy[k] = c.aufsteigen * (0.6 + rnd() * 0.8);
    alter[k] = 0;
    leben[k] = mische(c.leben[0], c.leben[1], rnd());
    staerke[k] = st;
  }

  // M3a.1: Welches Hinterrad ist als Nächstes dran? Wird über die Bilder hinweg gemerkt.
  // (Vorher fing jedes Bild wieder links an: Bei ruhiger Fahrt entsteht nur etwa ein Wölkchen pro
  // Bild, darum staubte es immer nur auf einer Seite.)
  let rad = 0;
  const zustand = { aktiv: 0, links: 0, rechts: 0 }; // links/rechts: so viele Wölkchen pro Rad (für Tests)
  // Jedes Bild: auto = { x, y, z, richtung, vx, vz, tempo, drift (Grad), gas, handbremse, schotter, belag }
  // schotter = true: es staubt (auf Schotter oder Wiesenweg); belag: welcher (Farbe und Stärke, sonst wie Schotter)
  function aktualisiere(dt, auto) {
    if (c.an && auto.schotter && auto.tempo > 0.8) {
      const art = jeBelag[auto.belag] || standard;
      const v = auto.tempo;
      let st = begrenze(v / 30, 0, 1) * c.ruhig;
      st += begrenze(Math.abs(auto.drift) / 25, 0, 1) * c.drift;
      if (auto.handbremse && v > 3) st += c.handbremse;
      if (auto.gas > 0.6 && v < 11) st += c.anfahren * (1 - v / 11);
      st = Math.min(1.2, st) * art.staerke;
      guthaben += st * c.proSekunde * dt;
      const fx = Math.sin(auto.richtung), fz = Math.cos(auto.richtung), lx = fz, lz = -fx;
      // beim Driften wirft jedes Rad den Staub zusätzlich nach aussen (beide Seiten gleich)
      const wurf = begrenze(Math.abs(auto.drift) / 25, 0, 1) * c.driftSeitlich;
      while (guthaben >= 1) {
        guthaben -= 1;
        const seite = rad++ % 2 ? 1 : -1;
        if (seite > 0) zustand.links++; else zustand.rechts++;
        starte(auto.x - fx * 1.3 + lx * 0.75 * seite, auto.y, auto.z - fz * 1.3 + lz * 0.75 * seite, auto.vx, auto.vz, Math.min(1, 0.35 + st),
          lx * seite * wurf, lz * seite * wurf, art.farbe);
      }
    } else guthaben = 0;
    // bewegen, wachsen, verblassen
    const w = wolke.array, d = dichte.array;
    let aktiv = 0;
    const bremsen = Math.exp(-c.bremsen * dt);
    for (let k = 0; k < N; k++) {
      alter[k] += dt;
      const f = alter[k] / leben[k];
      if (f >= 1) { w[k * 4 + 3] = 0; d[k] = 0; continue; }
      aktiv++;
      vx[k] *= bremsen; vz[k] *= bremsen; vy[k] *= bremsen;
      px[k] += vx[k] * dt; py[k] += vy[k] * dt; pz[k] += vz[k] * dt;
      w[k * 4] = px[k]; w[k * 4 + 1] = py[k]; w[k * 4 + 2] = pz[k];
      w[k * 4 + 3] = mische(c.groesse[0], c.groesse[1], Math.sqrt(f));
      d[k] = c.deckkraft * staerke[k] * (1 - f) * Math.min(1, f * 8);
    }
    wolke.needsUpdate = true;
    dichte.needsUpdate = true;
    zustand.aktiv = aktiv;
    mesh.visible = aktiv > 0; // kein Staub: kein Zeichenaufruf
  }
  return { mesh, aktualisiere, zustand };
}
