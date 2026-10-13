// Bäume und Steine als 2D-Sprites (Billboards) wie bei N64/PS1.
// Sie drehen sich nur um die Hochachse zur Kamera (kippen nicht mit).
// Alle Sprites einer Sorte werden in einem Rutsch gezeichnet (instanziert).

import * as THREE from 'three';
import { CONFIG } from './config.js';
import { zufall, fbm, mische } from './util.js';
import { tannenTextur, laubTextur, steinTextur } from './pixel.js';

const VERTEX = /* glsl */ `
  #include <common>
  #include <fog_pars_vertex>
  attribute vec3 aFuss;      // Fusspunkt in der Welt
  attribute vec4 aDaten;     // Breite, Höhe, Variante, Helligkeit (negativ = gespiegelt)
  uniform float uVarianten;
  varying vec2 vUv;
  varying float vHell;
  void main() {
    // nur um die Hochachse zur Kamera drehen
    vec2 zurKamera = cameraPosition.xz - aFuss.xz;
    vec2 d = normalize(zurKamera + vec2(1e-4, 0.0));
    vec3 rechts = vec3(d.y, 0.0, -d.x);
    vec3 welt = aFuss + rechts * position.x * aDaten.x + vec3(0.0, position.y * aDaten.y, 0.0);
    float u = aDaten.w < 0.0 ? 1.0 - uv.x : uv.x;
    vUv = vec2((aDaten.z + u) / uVarianten, uv.y);
    vHell = abs(aDaten.w);
    vec4 mvPosition = viewMatrix * vec4(welt, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`;

const FRAGMENT = /* glsl */ `
  #include <common>
  #include <fog_pars_fragment>
  uniform sampler2D map;
  uniform vec3 uLicht;
  varying vec2 vUv;
  varying float vHell;
  void main() {
    vec4 t = texture2D(map, vUv);
    if (t.a < 0.5) discard;   // harte Kanten (alphaTest)
    gl_FragColor = vec4(t.rgb * uLicht * vHell, 1.0);
    #include <colorspace_fragment>
    #include <fog_fragment>
  }
`;

function spriteMaterial(textur, varianten) {
  const l = CONFIG.licht;
  // ungefähr so hell wie eine sonnenbeschienene Fläche im Gelände
  const licht = new THREE.Color(l.umgebungFarbe).multiplyScalar(l.umgebungStaerke)
    .add(new THREE.Color(l.sonneFarbe).multiplyScalar(l.sonneStaerke * 0.55))
    .multiplyScalar(CONFIG.sprites.helligkeit);
  return new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.merge([
      THREE.UniformsLib.fog,
      { map: { value: null }, uVarianten: { value: varianten }, uLicht: { value: licht } },
    ]),
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    fog: true,
  });
}

function spriteGruppe(liste, tex) {
  const basis = new THREE.PlaneGeometry(1, 1);
  basis.translate(0, 0.5, 0);
  const geo = new THREE.InstancedBufferGeometry();
  geo.index = basis.index;
  geo.setAttribute('position', basis.attributes.position);
  geo.setAttribute('uv', basis.attributes.uv);
  const fuss = new Float32Array(liste.length * 3), daten = new Float32Array(liste.length * 4);
  liste.forEach((s, i) => {
    fuss.set([s.x, s.y, s.z], i * 3);
    daten.set([s.b, s.h, s.variante, s.hell * (s.spiegeln ? -1 : 1)], i * 4);
  });
  geo.setAttribute('aFuss', new THREE.InstancedBufferAttribute(fuss, 3));
  geo.setAttribute('aDaten', new THREE.InstancedBufferAttribute(daten, 4));
  geo.instanceCount = liste.length;
  const mat = spriteMaterial(tex.textur, tex.varianten);
  mat.uniforms.map.value = tex.textur;
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  return mesh;
}

export function bauePflanzen(szene, strecke, welt) {
  const c = CONFIG.sprites;
  const rnd = zufall(c.seed);
  const q = {};
  const { px, pz, tx, tz } = strecke;

  // Darf hier etwas stehen? (nicht auf der Strasse, nicht in der Felswand)
  function frei(x, z, mindest) {
    strecke.abfrage(x, z, q);
    if (q.abstand < mindest) return false;
    if (q.wandSeite && Math.sign(q.seite) === q.wandSeite && q.wandStaerke > 0.05 && q.abstand < 26) return false;
    return true;
  }
  function steilheit(x, z) {
    const h = welt.gelaendeHoehe(x, z);
    return Math.hypot(welt.gelaendeHoehe(x + 2, z) - h, welt.gelaendeHoehe(x, z + 2) - h) / 2;
  }

  // Sprites entlang der Strecke verteilen: zufällige Stelle der Strecke,
  // zufälliger Abstand links oder rechts (nahe der Strasse dichter, weiter weg
  // dünner – dort liegt eh Dunst). Ob dort wirklich etwas steht, entscheidet
  // "chance" zusammen mit der Baumdichte des Abschnitts.
  function verteile(proKm, tex, hoehe, chance) {
    const liste = [];
    const versuche = Math.round((proKm * strecke.laenge) / 1000);
    for (let n = 0; n < versuche; n++) {
      const i = Math.floor(rnd() * strecke.anzahl);
      const seite = rnd() < 0.5 ? -1 : 1;
      const nah = strecke.nahWald[i] > 0.5;
      const ab = nah ? c.waldAbstand : c.mindestAbstand;
      const lat = seite * (ab + Math.pow(rnd(), c.verteilung) * (c.breite - ab));
      const x = px[i] - tz[i] * lat, z = pz[i] + tx[i] * lat;
      const wurf = rnd();
      if (!frei(x, z, ab)) continue;
      const k = q.i; // nächster Streckenpunkt (kann ein anderer Ast sein)
      // Waldstücke (Rauschen), dazu geschlossener Wald je nach Abschnitt
      let wald = fbm(x / 140, z / 140, c.seed);
      if (fbm(x / 70, z / 70, c.seed + 9) > 1 - strecke.waldAnteil[k] * 0.75) wald = 1;
      if (wurf > chance(wald, q.abstand, steilheit(x, z), x, z) * strecke.baumFaktor[k]) continue;
      const h = mische(hoehe[0], hoehe[1], rnd());
      liste.push({
        x, z, y: welt.gelaendeHoehe(x, z) - 0.25,
        h, b: h * tex.seitenVerhaeltnis,
        variante: Math.floor(rnd() * tex.varianten),
        hell: 0.82 + rnd() * 0.26,
        spiegeln: rnd() < 0.5,
      });
    }
    return liste;
  }

  const tanne = tannenTextur(), laub = laubTextur(), stein = steinTextur();

  // Tannen: Waldstücke an den Hängen und einzelne nahe der Strasse
  const tannen = verteile(c.tannenProKm, tanne, c.tannenHoehe, (wald, d, steil) => {
    if (steil > 1.1) return 0.02;
    if (wald > 0.53) return 0.95;
    if (d < 16) return 0.32;
    return 0.06;
  });
  // Laubbäume: eher am Waldrand und weiter unten
  const laubbaeume = verteile(c.laubProKm, laub, c.laubHoehe, (wald, d, steil, x, z) => {
    if (steil > 0.7) return 0;
    const unten = welt.gelaendeHoehe(x, z) < 60 ? 1 : 0.3;
    if (wald > 0.45 && wald < 0.55) return 0.5 * unten;
    return 0.08 * unten;
  });
  // Steine: am Strassenrand und an steilen Stellen
  const steine = verteile(c.steineProKm, stein, c.steinHoehe, (wald, d, steil) => {
    if (steil > 0.8) return 0.6;
    if (d < 14) return 0.35;
    return 0.06;
  });

  for (const [liste, tex] of [[tannen, tanne], [laubbaeume, laub], [steine, stein]]) {
    if (liste.length) szene.add(spriteGruppe(liste, tex));
  }
  // Hindernisse für die Kollision: bei Bäumen nur der Stamm, Steine nach Breite
  const k = CONFIG.kollision;
  const hindernisse = [
    ...tannen.map((t) => ({ x: t.x, z: t.z, r: k.stammRadius })),
    ...laubbaeume.map((t) => ({ x: t.x, z: t.z, r: k.stammRadius })),
    ...steine.map((t) => ({ x: t.x, z: t.z, r: t.b * k.steinFaktor })),
  ];
  return { tannen, laubbaeume, steine, hindernisse };
}
