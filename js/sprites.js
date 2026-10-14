// Bäume und Steine als 2D-Sprites (Billboards) wie bei N64/PS1.
// Sie drehen sich nur um die Hochachse zur Kamera (kippen nicht mit).
// Alle Sprites einer Sorte werden in einem Rutsch gezeichnet (instanziert).

import * as THREE from 'three';
import { CONFIG } from './config.js';
import { zufall, fbm, mische, glatt } from './util.js';
import { tannenTextur, laubTextur, steinTextur, felsbrockenTextur, buschTextur, BUSCH } from './pixel.js';
import { baueKollision } from './kollision.js';
import { randAbstand, torPruefer } from './strassenrand.js';
import { planeAlleSperren, baueStaemme } from './sperren.js';
import { ABKUERZUNGEN } from './abkuerzungen.js';

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

// vertex: eigener Vertex-Shader (seit M2b für die Kühe, die je nach Winkel eine andere Ansicht zeigen)
export function spriteMaterial(textur, varianten, vertex = VERTEX, extraUniforms = {}) {
  const l = CONFIG.licht;
  // ungefähr so hell wie eine sonnenbeschienene Fläche im Gelände
  const licht = new THREE.Color(l.umgebungFarbe).multiplyScalar(l.umgebungStaerke)
    .add(new THREE.Color(l.sonneFarbe).multiplyScalar(l.sonneStaerke * 0.55))
    .multiplyScalar(CONFIG.sprites.helligkeit);
  return new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.merge([
      THREE.UniformsLib.fog,
      { map: { value: null }, uVarianten: { value: varianten }, uLicht: { value: licht }, ...extraUniforms },
    ]),
    vertexShader: vertex,
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

  // Hindernisse für die Kollision: bei Bäumen nur der Stamm, Steine nach Breite
  const k = CONFIG.kollision;
  const hindernisse = [
    ...tannen.map((t) => ({ x: t.x, z: t.z, r: k.stammRadius })),
    ...laubbaeume.map((t) => ({ x: t.x, z: t.z, r: k.stammRadius })),
    ...steine.map((t) => ({ x: t.x, z: t.z, r: t.b * k.steinFaktor })),
  ];

  // Abkürzungs-Sperren (je Kurve Felsbrocken, Tannengruppen oder Stämme) – siehe sperren.js
  const fels = felsbrockenTextur();
  let sperrenListe = ABKUERZUNGEN.sperren;
  if (sperrenListe.length && Math.abs(ABKUERZUNGEN.streckenLaenge - strecke.laenge) > 0.5) {
    console.warn('Abkürzungs-Sperren passen nicht zur Strecke – bitte tools/abkuerzungen.mjs neu laufen lassen.');
    sperrenListe = [];
  }
  // (die Landschaft wird mitgegeben, damit kein Teil einer Sperre in einem Baum steht)
  const sperren = planeAlleSperren(sperrenListe, strecke, welt, { tanne, fels, stein }, hindernisse);
  tannen.push(...sperren.tannen);
  steine.push(...sperren.steine);
  hindernisse.push(...sperren.hindernisse);
  baueStaemme(szene, sperren.staemme, welt);

  const meshes = {};
  for (const [name, liste, tex] of [['tannen', tannen, tanne], ['laub', laubbaeume, laub], ['steine', steine, stein], ['felsen', sperren.felsen, fels]]) {
    if (liste.length) szene.add(meshes[name] = spriteGruppe(liste, tex));
  }
  return { tannen, laubbaeume, steine, felsbrocken: sperren.felsen, staemme: sperren.staemme, hindernisse, sperren: sperrenListe, meshes, tanne };
}

// =====================================================================
// Meilenstein 2b: Büsche, Jungtannen, Grasbüschel und Wald in der Ferne.
// Läuft nach Strassenrand und Kühen (Büsche stehen an Zäunen, nicht in Toren, nicht in Kühen).
// Alles ohne Kollision (reine Deko), darum ändern sie nichts an den Abkürzungen.
// Jungtannen und Fernbäume sind Tannen: Sie kommen in denselben Zeichenaufruf wie die Tannen.
// Büsche und Grasbüschel sind ein Bild zusammen: ein Zeichenaufruf.
// =====================================================================
export function baueDeko(szene, strecke, welt, pflanzen, rand, kuehe) {
  const t0 = performance.now();
  const c = CONFIG.buesche;
  const rnd = zufall(c.seed); // eigener Zufall: die Bäume und Steine bleiben genau gleich
  const q = {};
  const { px, pz, tx, tz } = strecke;
  const busch = buschTextur();
  const buesche = [], jungTannen = [];

  // Hier steht schon etwas Festes (Stamm, Stein, Pfosten, Kuh)?
  const kolFest = baueKollision([
    ...pflanzen.hindernisse, ...rand.hindernisse,
    ...kuehe.hindernisse.map((k) => ({ x: k.x, z: k.z, r: k.r + c.abstandKuh })),
  ]);
  const torFrei = torPruefer(rand.plan);
  function frei(x, z, mindest, r) {
    strecke.abfrage(x, z, q);
    if (q.abstand < mindest) return false;
    if (q.wandSeite && Math.sign(q.seite) === q.wandSeite && q.wandStaerke > 0.05 && q.abstand < 26) return false;
    return kolFest.frei(x, z, r) && torFrei(x, z, r, 1.5, 12);
  }
  function steilheit(x, z) {
    const h = welt.gelaendeHoehe(x, z);
    return Math.hypot(welt.gelaendeHoehe(x + 2, z) - h, welt.gelaendeHoehe(x, z + 2) - h) / 2;
  }
  // Ein Busch (art: 'gruen', 'gras' oder zufällig blühend/Beeren)
  function setzeBusch(x, z, art) {
    const gras = art === 'gras';
    let variante;
    if (gras) variante = BUSCH.gras[Math.floor(rnd() * BUSCH.gras.length)];
    else {
      const w = rnd();
      variante = w < c.blueten ? BUSCH.bluete : w < c.blueten + c.beeren ? BUSCH.beere : BUSCH.gruen[Math.floor(rnd() * BUSCH.gruen.length)];
    }
    const h = mische(...(gras ? c.grasHoehe : c.hoehe), rnd()) * (variante === BUSCH.beere ? 0.75 : 1);
    const b = h * busch.seitenVerhaeltnis * (0.9 + rnd() * 0.35);
    const hell = 0.85 + rnd() * 0.22, spiegeln = rnd() < 0.5;
    if (steilheit(x, z) > c.maxSteil || !frei(x, z, c.mindestAbstand, 0.35)) return false;
    buesche.push({ x, z, y: welt.gelaendeHoehe(x, z) - 0.08, h, b, variante, hell, spiegeln, gras });
    return true;
  }
  function setzeJungtanne(x, z) {
    const h = mische(c.jungHoehe[0], c.jungHoehe[1], rnd());
    const variante = Math.floor(rnd() * pflanzen.tanne.varianten), hell = 0.85 + rnd() * 0.2, spiegeln = rnd() < 0.5;
    if (steilheit(x, z) > c.maxSteil || !frei(x, z, c.jungAbstand, 0.6)) return false;
    jungTannen.push({ x, z, y: welt.gelaendeHoehe(x, z) - 0.1, h, b: h * pflanzen.tanne.seitenVerhaeltnis, variante, hell, spiegeln });
    return true;
  }
  const punktNeben = (i, lat) => [px[i] - tz[i] * lat, pz[i] + tx[i] * lat];
  const versuche = (proKm, laenge = strecke.laenge) => Math.round((proKm * laenge) / 1000);

  if (c.an) {
    // 1. Gruppen am Strassenrand
    for (let n = versuche(c.randGruppenProKm); n > 0; n--) {
      const i = Math.floor(rnd() * strecke.anzahl), seite = rnd() < 0.5 ? -1 : 1;
      const [mx, mz] = punktNeben(i, seite * mische(c.randBreite[0], c.randBreite[1], rnd()));
      const anzahl = c.gruppe[0] + Math.floor(rnd() * (c.gruppe[1] - c.gruppe[0] + 1));
      if (rnd() > 0.65 || steilheit(mx, mz) > 0.6) continue;
      for (let k = 0; k < anzahl; k++) {
        const w = rnd() * Math.PI * 2, d = rnd() * c.gruppeRadius;
        setzeBusch(mx + Math.cos(w) * d, mz + Math.sin(w) * d, rnd() < 0.2 ? 'gras' : 'gruen');
      }
    }
    // 2. hinter Zäunen und Leitplanken
    const P = rand.plan;
    for (const [liste, versatz] of [[P.zaunLaeufe, CONFIG.strassenrand.zaun.versatz], [P.plankenLaeufe, 0]]) {
      for (const l of liste) {
        for (let n = versuche(c.zaunProKm, l.bis - l.von); n > 0; n--) {
          const s = mische(l.von, l.bis, rnd());
          const p = P.punkt(s, l.seite * (randAbstand(s, l.seite) + versatz + 0.8 + rnd() * 1.6));
          setzeBusch(p.x, p.z, rnd() < 0.25 ? 'gras' : 'gruen');
        }
      }
    }
    // 3. am Waldrand (wo das Wald-Rauschen gerade an der Grenze ist): Büsche und Jungtannen
    const sp = CONFIG.sprites;
    for (let n = versuche(c.waldrandProKm); n > 0; n--) {
      const i = Math.floor(rnd() * strecke.anzahl), seite = rnd() < 0.5 ? -1 : 1;
      const lat = c.mindestAbstand + Math.pow(rnd(), c.verteilung) * (c.breite - c.mindestAbstand);
      const [x, z] = punktNeben(i, seite * lat);
      const wurf = rnd(), jung = rnd() < 0.3;
      const roh = fbm(x / 140, z / 140, sp.seed); // dasselbe Rauschen wie die Waldstücke der Tannen
      const rand0 = 1 - Math.min(1, Math.abs(roh - 0.53) / 0.07);
      if (wurf > 0.75 * rand0 * Math.min(1, strecke.baumFaktor[i] + 0.3) || steilheit(x, z) > 0.8) continue;
      if (jung && lat >= c.jungAbstand) setzeJungtanne(x, z);
      else setzeBusch(x, z, rnd() < 0.15 ? 'gras' : 'gruen');
    }
    // 4. vereinzelt auf den Wiesen (eher Grasbüschel)
    for (let n = versuche(c.wieseProKm); n > 0; n--) {
      const i = Math.floor(rnd() * strecke.anzahl), seite = rnd() < 0.5 ? -1 : 1;
      const lat = c.mindestAbstand + Math.pow(rnd(), c.verteilung) * (c.breite - c.mindestAbstand);
      const [x, z] = punktNeben(i, seite * lat);
      const gras = rnd() < 0.55;
      if (welt.waldBei(x, z, i) > 0.3 || steilheit(x, z) > 0.6) continue;
      setzeBusch(x, z, gras ? 'gras' : 'gruen');
    }
  }

  // --- Wald in der Ferne: grosse Tannen zwischen fw.von und fw.bis neben der Strasse ---
  const fw = CONFIG.fernwald;
  const fern = [];
  if (fw.baeume) {
    const rndF = zufall(fw.seed);
    for (let n = versuche(fw.baeumeProKm); n > 0; n--) {
      const i = Math.floor(rndF() * strecke.anzahl), seite = rndF() < 0.5 ? -1 : 1;
      const [x, z] = punktNeben(i, seite * mische(fw.von, fw.bis, rndF()));
      const wurf = rndF(), h = mische(fw.hoehe[0], fw.hoehe[1], rndF());
      const variante = Math.floor(rndF() * pflanzen.tanne.varianten), hell = mische(fw.helligkeit[0], fw.helligkeit[1], rndF()), spiegeln = rndF() < 0.5;
      const d = welt.streckeAbstand(x, z); // grob genug: hier ist weit und breit keine Strasse
      if (d < fw.von - 10) continue;
      const rampe = glatt(fw.von, fw.voll, d) * (1 - glatt(fw.aus, fw.bis, d));
      if (rampe <= 0) continue;
      const steil = steilheit(x, z);
      if (steil > 1.1) continue; // Felswand
      const chance = rampe * welt.waldBei(x, z, undefined, d) * mische(1, fw.hang, glatt(0.15, 0.6, steil)) * 0.75;
      if (wurf > chance) continue;
      // Im Boden verankern: weit weg wird nur das grobe Gelände gezeichnet
      const y = Math.min(welt.gelaendeHoehe(x, z), welt.gelaendeHoeheGrob(x, z)) - fw.einsinken;
      fern.push({ x, z, y, h, b: h * pflanzen.tanne.seitenVerhaeltnis, variante, hell, spiegeln });
    }
  }

  // Zeichnen: Tannen-Gruppe neu bauen (nahe Tannen + Jungtannen + Fernbäume), Büsche dazu
  const m = pflanzen.meshes;
  if (m.tannen) { szene.remove(m.tannen); m.tannen.geometry.dispose(); m.tannen.material.dispose(); }
  szene.add(m.tannen = spriteGruppe([...pflanzen.tannen, ...jungTannen, ...fern], pflanzen.tanne));
  if (buesche.length) szene.add(m.buesche = spriteGruppe(buesche, busch));

  const statistik = {
    buesche: buesche.filter((b) => !b.gras).length, gras: buesche.filter((b) => b.gras).length,
    jungTannen: jungTannen.length, fernbaeume: fern.length, ms: Math.round(performance.now() - t0),
  };
  return { buesche, jungTannen, fernbaeume: fern, statistik };
}
