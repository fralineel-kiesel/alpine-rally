// Eisseen (Meilenstein 11a.1): kleine gefrorene Seen AUF der Strasse der Gletscher-Etappe (Streckendatei "eisseen").
// Die Strasse weitet sich zu einer freien Eisfläche: in einer Ellipse um die Strasse (in Streckenmetern und Abstand zur
// Mitte, mit leicht welligem Ufer) ist der Boden überall Eis auf Strassenhöhe, das Gelände wird flach gemacht, und eine
// eigene Fläche mit Pixel-Textur (hellblau, Risse, Schneestaub, Glanzstreifen, dunkler Rand wie dickes Eis) liegt darüber.
// Auf dem See steht nichts (welt.imFels meldet den See wie Fels; Schneewall und Stangen lassen ihn aus).
// Werte: config.js, Block eissee; Farben: Streckendatei umgebung.farben (see…). Ohne "eisseen" passiert hier nichts.
import * as THREE from 'three';
import { CONFIG } from './config.js';
import { STRECKE } from './streckenlader.js';
import { leinwand, setze, zuTextur, hexZuRgb } from './pixel.js';
import { zufall, fbm, glatt, mische } from './util.js';

// Plan: welche Seen wo (reine Rechnung, für Gelände, Boden, Platzierung und Tests)
export function planeEisseen(strecke) {
  const C = CONFIG.eissee, daten = (STRECKE && STRECKE.eisseen) || [];
  const seen = daten.map((d, k) => {
    const rnd = zufall((d.seed ?? 7100) + k);
    const p = strecke.punktBei(d.s);
    return {
      s: d.s, laenge: d.laenge, breite: d.breite, halbL: d.laenge / 2, halbB: d.breite / 2,
      // welliges Ufer: Radius mal 1 + a1·sin(3θ + p1) + a2·sin(5θ + p2)
      p1: rnd() * Math.PI * 2, p2: rnd() * Math.PI * 2, seed: (d.seed ?? 7100) + k,
      x: p.x, z: p.z, umkreis: d.laenge / 2 + C.randGelaende + 15, // grober Kreis um den See (schnelle Vorprüfung)
    };
  });
  // rho: Abstand vom Seemittelpunkt relativ zum Ufer (unter 1 = auf dem See), in Streckenmetern s und Abstand seite
  const rho = (see, s, seite) => {
    const u = (s - see.s) / see.halbL, v = seite / see.halbB, th = Math.atan2(v, u);
    const r = 1 + C.uferWelle[0] * Math.sin(3 * th + see.p1) + C.uferWelle[1] * Math.sin(5 * th + see.p2);
    return Math.sqrt(u * u + v * v) / r;
  };
  // See an dieser Stelle (oder null) und wie weit (Meter, ungefähr) ausserhalb des Ufers (negativ = auf dem See)
  const aus = { see: null, rho: 9, draussen: 99 };
  function bei(s, seite) {
    aus.see = null; aus.rho = 9; aus.draussen = 99;
    for (const see of seen) {
      if (Math.abs(s - see.s) > see.halbL + C.randGelaende + 2) continue;
      const r = rho(see, s, seite);
      if (r < aus.rho) { aus.see = see; aus.rho = r; aus.draussen = (r - 1) * Math.min(see.halbB, see.halbL); }
    }
    return aus;
  }
  const naheXZ = (x, z) => seen.some((see) => (x - see.x) ** 2 + (z - see.z) ** 2 < see.umkreis * see.umkreis);
  return { an: seen.length > 0, seen, rho, bei, naheXZ };
}

// Pixel-Textur eines Sees (eigene Leinwand je See, deckt den ganzen See ab: so laufen die Risse über die ganze Fläche)
function seeTextur(see, rho, F, C) {
  const PM = C.pixelJeMeter;
  const L = see.laenge * 1.2, B = see.breite * 1.2;
  const W = Math.ceil(L * PM), H = Math.ceil(B * PM);
  const l = leinwand(W, H), rnd = zufall(see.seed * 7 + 3);
  const eis = hexZuRgb(F.seeEis), eisHell = hexZuRgb(F.seeEisHell), rand = hexZuRgb(F.seeRand), randDunkel = hexZuRgb(F.seeRandDunkel);
  const rissD = hexZuRgb(F.seeRissDunkel), rissH = hexZuRgb(F.seeRissHell), staub = hexZuRgb(F.seeStaub), glanz = hexZuRgb(F.seeGlanz);
  const zuSL = (x, y) => [see.s - L / 2 + (x + 0.5) / PM, -B / 2 + (y + 0.5) / PM];
  const mix = (a, b, t) => [Math.round(mische(a[0], b[0], t)), Math.round(mische(a[1], b[1], t)), Math.round(mische(a[2], b[2], t))];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const [s, lat] = zuSL(x, y), r = rho(see, s, lat);
      const n = fbm(s / 9, lat / 9, see.seed + 11, 3), n2 = fbm(s / 3.5, lat / 3.5, see.seed + 29, 2);
      // Grund: hellblau mit grossen, sanften Flecken (zwei Stufen, hart gerastert wie überall im Spiel)
      let c = n > 0.56 ? eisHell : eis;
      // einzelne glänzende Streifen (schräg, nur wo das Rauschen es zulässt)
      const st = Math.floor(x * 0.6 + y) % 29;
      if ((st === 0 || st === 1) && n2 > 0.45) c = glanz;
      // Schneestaub-Flecken; zu den Enden hin (Ein- und Ausfahrt) mehr Schnee auf dem Eis: Übergang Schnee → Eis
      const ende = glatt(C.staubEnde, 1, Math.abs(s - see.s) / see.halbL);
      if (n2 > C.staubSchwelle - ende * 0.45) c = mix(c, staub, n2 > C.staubSchwelle + 0.08 - ende * 0.45 ? 1 : 0.55);
      // Rand wie dickes Eis: zum Ufer hin dunkler, ganz aussen am dunkelsten
      if (r > 1) c = randDunkel;
      else if (r > C.randAb[1]) c = mix(c, randDunkel, 0.75);
      else if (r > C.randAb[0]) c = mix(c, rand, 0.55);
      setze(l, x, y, c);
    }
  }
  // Risse: deterministische Linien (Zufallsweg), dunkel mit heller Kante daneben, verzweigen sich manchmal
  const riss = (x0, y0, w0, schritte, tiefe) => {
    let x = x0, y = y0, w = w0;
    for (let k = 0; k < schritte; k++) {
      w += (rnd() - 0.5) * 0.7;
      x += Math.cos(w); y += Math.sin(w) * 0.8;
      const ix = Math.round(x), iy = Math.round(y);
      if (ix < 1 || iy < 1 || ix >= W - 1 || iy >= H - 1) return;
      const [s, lat] = zuSL(ix, iy);
      if (rho(see, s, lat) > C.randAb[1]) return;
      setze(l, ix, iy, rissD); setze(l, ix, iy + 1, rissH);
      if (tiefe < 2 && rnd() < 0.04) riss(x, y, w + (rnd() < 0.5 ? 1 : -1) * (0.6 + rnd() * 0.6), Math.round(schritte * 0.4), tiefe + 1);
    }
  };
  const anzahl = Math.round(mische(C.risse[0], C.risse[1], rnd()) * see.laenge / 80);
  for (let k = 0; k < anzahl; k++) {
    const x0 = W * (0.2 + 0.6 * rnd()), y0 = H * (0.25 + 0.5 * rnd());
    riss(x0, y0, rnd() * Math.PI * 2, Math.round(W * (0.35 + 0.4 * rnd())), 0);
  }
  const t = zuTextur(l, { mipmaps: true });
  t.minFilter = THREE.LinearMipmapLinearFilter; // wie die Eis-Strasse: in der Ferne ruhig, nah harte Pixel
  return { textur: t, L, B };
}

// Mesh: je See Reihen alle 1 m quer zur Strasse vom linken bis zum rechten Ufer, auf Strassenhöhe (flach quer),
// dazu ein dunkler Rand, der 0.2 m nach unten geht (Kante des dicken Eises). Liegt mit polygonOffset über der Strasse.
export function baueEisseen(szene, strecke, plan) {
  if (!plan || !plan.an) return { an: false, meshes: [], dreiecke: 0 };
  const C = CONFIG.eissee, F = STRECKE.umgebung.farben;
  const meshes = []; let dreiecke = 0;
  for (const see of plan.seen) {
    const { textur, L, B } = seeTextur(see, plan.rho, F, C);
    const pos = [], uv = [], idx = [];
    // Ufer je Reihe (s) und Seite: grösster Abstand mit rho <= 1 (in 0.1-m-Schritten von innen nach aussen)
    const ufer = (s, sd) => { let a = 0; while (a < see.halbB * 1.3 && plan.rho(see, s, sd * (a + 0.1)) <= 1) a += 0.1; return sd * a; };
    const reihen = [];
    for (let s = Math.ceil(see.s - see.halbL * 1.2); s <= see.s + see.halbL * 1.2; s++) {
      if (plan.rho(see, s, 0) > 1) continue;
      const p = strecke.punktBei(s), links = ufer(s, -1), rechts = ufer(s, 1);
      const reihe = [];
      for (let k = 0; k <= C.spalten; k++) {
        const lat = mische(links, rechts, k / C.spalten);
        reihe.push([p.x - p.tz * lat, p.h + C.heben, p.z + p.tx * lat, (s - (see.s - L / 2)) / L, 1 - (lat + B / 2) / B]);
      }
      reihen.push(reihe);
    }
    const dunkel = [0.5 / (L * C.pixelJeMeter), 1 - 0.5 / (B * C.pixelJeMeter)]; // Pixel ganz in der Ecke: dunkler Rand
    const punkt = (p) => { pos.push(p[0], p[1], p[2]); uv.push(p[3], p[4]); return pos.length / 3 - 1; };
    for (let r = 0; r + 1 < reihen.length; r++) {
      const A = reihen[r], Bb = reihen[r + 1];
      for (let k = 0; k < C.spalten; k++) {
        const a = punkt(A[k]), b = punkt(A[k + 1]), c = punkt(Bb[k + 1]), d = punkt(Bb[k]);
        idx.push(a, d, c, a, c, b);
      }
      // Rand links und rechts: 0.2 m senkrecht nach unten (dunkel)
      for (const [k, dreh] of [[0, 1], [C.spalten, -1]]) {
        const o1 = A[k], o2 = Bb[k];
        const u1 = [o1[0], o1[1] - C.randTiefe, o1[2], ...dunkel], u2 = [o2[0], o2[1] - C.randTiefe, o2[2], ...dunkel];
        const a = punkt([...o1.slice(0, 3), ...dunkel]), b = punkt([...o2.slice(0, 3), ...dunkel]), c = punkt(u2), d = punkt(u1);
        if (dreh > 0) idx.push(a, b, c, a, c, d); else idx.push(a, c, b, a, d, c);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    const mat = new THREE.MeshLambertMaterial({ map: textur, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geo, mat);
    szene.add(mesh);
    meshes.push(mesh);
    dreiecke += idx.length / 3;
  }
  return { an: true, meshes, dreiecke };
}
