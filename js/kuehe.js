// Kühe (Meilenstein 2b): Herden auf den eingezäunten Weiden im Tal und auf den Alpwiesen oben.
//
// Jede Kuh ist ein Sprite wie die Bäume (dreht sich zur Kamera), hat aber eine eigene
// Blickrichtung. Der Vertex-Shader rechnet den Winkel zwischen Blickrichtung und Kamera aus
// und nimmt die passende von 8 Ansichten (wie bei Doom). So sieht man eine Kuh von hinten,
// wenn man hinter ihr vorbeifährt, und nicht immer dieselbe Seite. Alle Kühe zusammen sind
// ein Zeichenaufruf (instanziert, ein Bild mit allen Ansichten, siehe kuhbild.js).
//
// Regeln, die nie gebrochen werden (Werte in config.js, Block "kuehe"):
//   - mindestens abstandStrasse von jeder Strassenmitte (auch von einer anderen Kehre)
//   - hinter einem Zaun im Feld, nicht in den Pfosten (abstandZaun), Weidetore bleiben frei
//   - nie auf der Innenseite der Kurven aus js/abkuerzungen.js (plus Puffer): Kühe sind
//     Hindernisse und dürfen an der Abkürzungs-Balance nichts ändern
//   - nur wo es flach ist und kein Wald steht
// Fester Zufall (seed): gleiche Strecke = gleiche Kühe.

import * as THREE from 'three';
import { CONFIG } from './config.js';
import { zufall, mische } from './util.js';
import { baueKollision } from './kollision.js';
import { kuhAtlas, KUH_ARTEN, KUH_BILD } from './kuhbild.js';
import { spriteMaterial } from './sprites.js';
import { randAbstand, torPruefer } from './strassenrand.js';
import { KUHFOLGE } from './kuhfolge.js';

// Wie die Bäume (sprites.js), aber die Ansicht (Spalte im Bild) hängt vom Winkel ab
const VERTEX = /* glsl */ `
  #include <common>
  #include <fog_pars_vertex>
  attribute vec3 aFuss;      // Fusspunkt in der Welt (tiefster Punkt unter dem Körper)
  attribute vec4 aDaten;     // Breite, Höhe, Zeile im Bild (Art * 3 + Pose), Helligkeit
  attribute float aBlick;    // Blickrichtung der Kuh (Winkel wie beim Auto: 0 = +z)
  uniform vec2 uRaster;      // Spalten (Ansichten), Zeilen
  varying vec2 vUv;
  varying float vHell;
  void main() {
    // nur um die Hochachse zur Kamera drehen
    vec2 zurKamera = cameraPosition.xz - aFuss.xz;
    vec2 d = normalize(zurKamera + vec2(1e-4, 0.0));
    vec3 rechts = vec3(d.y, 0.0, -d.x);
    // Winkel zwischen Blickrichtung der Kuh und Richtung zur Kamera -> Ansicht 0..7
    // (0 = von vorne, 2 = von der Seite, 4 = von hinten)
    vec2 f = vec2(sin(aBlick), cos(aBlick));
    float winkel = atan(f.x * d.y - f.y * d.x, dot(f, d));
    float ansicht = mod(floor(winkel / (6.2831853 / uRaster.x) + 0.5), uRaster.x);
    vec3 welt = aFuss + rechts * position.x * aDaten.x + vec3(0.0, position.y * aDaten.y, 0.0);
    vUv = vec2((ansicht + uv.x) / uRaster.x, 1.0 - (aDaten.z + 1.0 - uv.y) / uRaster.y);
    vHell = aDaten.w;
    vec4 mvPosition = viewMatrix * vec4(welt, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`;

// =====================================================================
// Plan: wo steht welche Kuh (ohne 3D; die Tests brauchen das auch)
// =====================================================================
// frei: optional weitere Kreise { x, z, r }, wo keine (neue) Kuh hin darf (M3d: Hütte, Details am Wiesenweg)
export function planeKuehe(strecke, welt, pflanzen, rand, frei = []) {
  const c = CONFIG.kuehe;
  let rnd = zufall(c.seed);
  const n = strecke.anzahl;
  const P = rand.plan;
  const q = {}, q2 = {};
  const idx = (s) => Math.max(0, Math.min(n - 1, Math.round(s)));

  // Bäume (mit Krone), Steine, Sperren: Kühe stehen nicht darunter oder darin
  const kolBaum = baueKollision([
    ...pflanzen.tannen.map((t) => ({ x: t.x, z: t.z, r: Math.max(0.45, t.b * 0.4) })),
    ...pflanzen.laubbaeume.map((t) => ({ x: t.x, z: t.z, r: Math.max(0.45, t.b * 0.4) })),
    ...pflanzen.steine.map((t) => ({ x: t.x, z: t.z, r: t.b * 0.5 })),
    ...pflanzen.felsbrocken.map((t) => ({ x: t.x, z: t.z, r: t.b * 0.5 })),
    ...pflanzen.hindernisse,
  ]);
  // Leitplanken, Zäune, Schilder
  const kolRand = baueKollision(rand.hindernisse);

  // Innenseite der Abkürzungs-Kurven (plus Puffer)
  const innen = [];
  for (const [liste, puffer] of [[strecke.nichtSchneiden, c.pufferNichtSchneiden], [strecke.schneiden, c.pufferSchneiden]]) {
    for (const k of liste) innen.push({ von: k.sVon - puffer, bis: k.sBis + puffer, seite: k.seite === 'rechts' ? 1 : -1 });
  }
  const istInnen = (s, seite) => innen.some((k) => s >= k.von && s <= k.bis && seite === k.seite);

  // Weidetore: Lücke und Weg ins Feld bleiben frei
  const torFrei = torPruefer(P);
  // M3d: Tore der neuen Zäune am Wiesenweg ebenso
  const torFreiZusatz = torPruefer({ ...P, tore: P.zusatzTore || [] });

  const kuehe = [];
  let kolFrei = null; // M3d: Plätze der neuen Objekte am Wiesenweg (nur für die neuen Herden)
  // Darf eine Kuh mit Radius r hier stehen?
  function ok(x, z, r) {
    strecke.abfrage(x, z, q);
    if (q.abstand < c.abstandStrasse + r) return false;
    if (welt.netz && welt.netz.stummelAbstand(x, z, 60) < c.abstandStrasse + r) return false; // Stummel (M3a)
    if (q.wandSeite && Math.sign(q.seite) === q.wandSeite && q.wandStaerke > 0.05 && q.abstand < 40) return false;
    if (istInnen(q.s, Math.sign(q.seite))) return false;
    // andere Äste der Strecke in der Nähe (z. B. die Kehre darüber): gleiche Regeln
    const ast = strecke.andererAst(x, z, q.s, 30, 60, q2);
    if (ast && (ast.abstand < c.abstandStrasse + r || istInnen(ast.s, Math.sign(ast.seite)))) return false;
    // flach? (über die Länge der Kuh)
    const h = [welt.gelaendeHoehe(x - 1.2, z), welt.gelaendeHoehe(x + 1.2, z), welt.gelaendeHoehe(x, z - 1.2), welt.gelaendeHoehe(x, z + 1.2)];
    if (Math.max(...h) - Math.min(...h) > c.maxSteigung * 2.4) return false;
    if (welt.waldBei(x, z, q.i) > c.maxWald) return false;
    if (!kolBaum.frei(x, z, r + c.abstandBaum)) return false;
    if (!kolRand.frei(x, z, r + c.abstandZaun)) return false;
    if (!torFrei(x, z, r, c.abstandTor, c.torTiefe) || !torFreiZusatz(x, z, r, c.abstandTor, c.torTiefe)) return false;
    if (kolFrei && !kolFrei.frei(x, z, r + c.abstandBaum)) return false;
    if (kuehe.some((k) => Math.hypot(k.x - x, k.z - z) < c.abstandKuh)) return false;
    return true;
  }

  // --- Weiden ---------------------------------------------------------------
  // Im Tal: die eingezäunten Wiesen (Zaunstücke derselben Seite mit Lücken unter 40 m = eine Weide)
  // Oben: Alpwiesen ohne Wald (Strasse höher als alpAb), mit oder ohne Zaun
  const zaunLinie = randAbstand(0, 1) + CONFIG.strassenrand.zaun.versatz;
  const tal = [], alp = [];
  for (const seite of [-1, 1]) {
    const laeufe = [...P.zaunLaeufe, ...P.tore].filter((l) => l.seite === seite && strecke.py[idx(l.von)] < c.alpAb).sort((a, b) => a.von - b.von);
    for (const l of laeufe) {
      const w = tal[tal.length - 1];
      if (w && w.seite === seite && l.von - w.bis < 40) w.bis = Math.max(w.bis, l.bis);
      else tal.push({ seite, von: l.von, bis: l.bis, zaun: true });
    }
    let start = -1;
    for (let i = 0; i <= n; i++) {
      const offen = i < n && strecke.py[i] >= c.alpAb && strecke.waldAnteil[i] < 0.1 && !strecke.wandSeite[i];
      if (offen && start < 0) start = i;
      if (!offen && start >= 0) { if (i - start > 40) alp.push({ seite, von: start, bis: i - 1, zaun: false }); start = -1; }
    }
  }
  for (const w of tal) w.laenge = w.bis - w.von;
  for (const w of alp) w.laenge = w.bis - w.von;
  const waehle = (liste) => {
    let r = rnd() * liste.reduce((m, w) => m + w.laenge, 0);
    for (const w of liste) { r -= w.laenge; if (r <= 0) return w; }
    return liste[liste.length - 1];
  };
  // Mitte einer Herde auf einer Weide: ein paar Plätze auswürfeln und den nehmen, den man von der
  // Strasse aus am besten sieht (wenigste Baumkronen auf der Sichtlinie von 25 m davor)
  const kronen = [...pflanzen.tannen, ...pflanzen.laubbaeume].map((t) => ({ x: t.x, z: t.z, r: t.b * 0.45 }));
  const kolKrone = baueKollision(kronen);
  function sicht(s, m) {
    const a = P.punkt(Math.max(0, s - 25), 0);
    const l = Math.hypot(m.x - a.x, m.z - a.z), n = Math.ceil(l / 2);
    let verdeckt = 0;
    for (let k = 1; k < n; k++) if (!kolKrone.frei(a.x + ((m.x - a.x) * k) / n, a.z + ((m.z - a.z) * k) / n, 0.2)) verdeckt++;
    return verdeckt;
  }
  function herdenMitte(w, nahe = null) {
    let best = null;
    for (let v = 0; v < c.sichtVersuche; v++) {
      const s = nahe != null ? Math.max(w.von + 8, Math.min(w.bis - 8, nahe + (rnd() - 0.5) * 80)) : mische(w.von + 8, w.bis - 8, rnd());
      const lat = w.zaun
        ? zaunLinie + mische(c.weideTiefe[0], c.weideTiefe[1], Math.pow(rnd(), 1.3))
        : mische(c.alpBreite[0], c.alpBreite[1], rnd());
      const m = P.punkt(s, w.seite * lat);
      if (!ok(m.x, m.z, c.radius)) continue; // hier darf keine Kuh stehen: anderen Platz würfeln
      m.verdeckt = sicht(s, m);
      if (!best || m.verdeckt < best.verdeckt) best = m;
    }
    return best;
  }

  // Eine Herde (oder ein Einzeltier) um die Mitte m aufstellen
  const posen = KUH_BILD.posen;
  const mitten = [];
  // abstand, radius, leben (M3d): eigener Herdenabstand und -radius für die neuen Herden, Kühe markieren
  function herde(m, anzahl, wo, abstand = c.herdenAbstand, radius0 = null, leben = false) {
    if (!m) return 0;
    if (anzahl > 1 && mitten.some((h) => Math.hypot(h.x - m.x, h.z - m.z) < abstand)) return 0;
    const radius = radius0 ?? mische(c.herdeRadius[0], c.herdeRadius[1], Math.min(1, (anzahl - 1) / 5));
    const richtung = rnd() * Math.PI * 2;
    const fell = (herdenNr + fellStart) % 3; // eine Fellart herrscht in der Herde vor (reihum, damit alle vorkommen)
    let gestellt = 0;
    for (let k = 0; k < anzahl; k++) {
      for (let v = 0; v < 14; v++) {
        const w = rnd() * Math.PI * 2, d = Math.sqrt(rnd()) * radius;
        const x = m.x + Math.cos(w) * d, z = m.z + Math.sin(w) * d;
        const zp = rnd();
        const pose = zp < c.posen[0] ? 0 : zp < c.posen[0] + c.posen[1] ? 1 : 2;
        const r = pose === 2 ? c.radiusLiegend : c.radius;
        const blick = rnd() < c.gleicheRichtung ? richtung + (rnd() - 0.5) * 1.2 : rnd() * Math.PI * 2;
        const f = rnd() < 0.6 ? fell : Math.floor(rnd() * 3);
        const art = f * 2 + (rnd() < 0.5 ? 0 : 1); // mit oder ohne Hörner
        const g = mische(c.groesse[0], c.groesse[1], rnd());
        if (!ok(x, z, r)) continue;
        kuehe.push({ x, z, blick, pose, art, groesse: g, r, wo, herde: herdenNr, ...(leben ? { leben: true } : {}) });
        gestellt++;
        break;
      }
    }
    if (gestellt) { herdenNr++; if (anzahl > 1) mitten.push(m); }
    return gestellt;
  }
  let herdenNr = 0;
  const fellStart = Math.floor(rnd() * 3);

  // M3d: eingefrorene Kühe (js/kuhfolge.js): stehen genau dort wie beim Stand M3b. Jede wird noch geprüft.
  const folge = KUHFOLGE && KUHFOLGE.seed === c.seed ? KUHFOLGE.kuehe : null;
  let weggefallen = 0;
  if (folge) {
    const gruppen = new Map();
    for (const [x, z, blick, pose, art, groesse, wo, nr] of folge) {
      const r = pose === 2 ? c.radiusLiegend : c.radius;
      if (!ok(x, z, r)) { weggefallen++; continue; }
      kuehe.push({ x, z, blick, pose, art, groesse, r, wo: wo ? 'alp' : 'tal', herde: nr });
      if (!gruppen.has(nr)) gruppen.set(nr, []);
      gruppen.get(nr).push({ x, z });
      herdenNr = Math.max(herdenNr, nr + 1);
    }
    // Herden-Mitten (für den Abstand der neuen Herden)
    for (const g of gruppen.values()) if (g.length > 1) mitten.push({ x: g.reduce((a, k) => a + k.x, 0) / g.length, z: g.reduce((a, k) => a + k.z, 0) / g.length });
  } else {
    const ziel = Math.max(0, c.anzahl - c.einzeln);
    const zielTal = tal.length ? Math.round(ziel * (alp.length ? c.anteilTal : 1)) : 0;
    const zielAlp = ziel - zielTal;
    const groesse = () => c.herde[0] + Math.floor(rnd() * (c.herde[1] - c.herde[0] + 1));
    // Zuerst die Weide hinter dem Schild "Kühe" (M2a.1): dort steht sicher eine grosse Herde
    const kuhSchild = P.schilder.find((s) => s.tafeln.some((t) => t.kachel === 'warnKuh'));
    if (kuhSchild && tal.length) {
      const weide = tal.filter((w) => w.bis > kuhSchild.s && w.von > kuhSchild.s - 20).sort((a, b) => a.von - b.von)[0];
      if (weide) for (let v = 0; v < 8 && !herde(herdenMitte(weide), c.herde[1], 'tal'); v++);
    }
    // Auf der Alpwiese nahe der Passhöhe steht sicher auch eine Herde
    const passWiesen = alp.filter((w) => w.von <= c.passBei && w.bis >= c.passBei);
    if (passWiesen.length) {
      for (let v = 0; v < 12; v++) {
        const w = passWiesen[Math.floor(rnd() * passWiesen.length)];
        if (herde(herdenMitte(w, c.passBei), c.herde[0] + 2, 'alp')) break;
      }
    }
    for (const [liste, zielN, wo] of [[tal, zielTal, 'tal'], [alp, zielAlp, 'alp']]) {
      if (!liste.length) continue;
      for (let v = 0; v < 80; v++) {
        const da = kuehe.filter((k) => k.wo === wo).length;
        if (da >= zielN) break;
        herde(herdenMitte(waehle(liste)), Math.min(groesse(), zielN - da), wo);
      }
    }
    // Einzeltiere irgendwo auf den Weiden
    const alle = [...tal, ...alp];
    for (let k = 0, v = 0; k < c.einzeln && v < 40 && alle.length; v++) {
      const w = waehle(alle);
      if (herde(herdenMitte(w), 1, w.zaun ? 'tal' : 'alp')) k++;
    }

    // Zusätzliche Herden (M3c, beim Start- und Zielbereich): erst ganz am Schluss, damit alle anderen Kühe
    // genau gleich bleiben. Ein paar Plätze würfeln, den ersten nehmen, an dem eine Kuh stehen darf.
    for (const z of c.zusatzHerden || []) {
      for (let v = 0; v < 16; v++) {
        const m = P.punkt(z.s + (rnd() - 0.5) * 30, z.seite * mische(z.lat[0], z.lat[1], rnd()));
        if (!ok(m.x, m.z, c.radius)) continue;
        if (herde(m, z.anzahl, 'tal')) break;
      }
    }
  }

  // M3d: neue Herden (am Wiesenweg) mit eigenem Zufall: die Kühe oben bleiben genau gleich.
  // Nie auf den Plätzen der neuen Objekte (Hütte, Brunnen, Heurollen ..., Liste "frei").
  const L = CONFIG.leben && CONFIG.leben.an !== false ? CONFIG.leben.kuehe : null;
  if (L && L.herden) {
    rnd = zufall(L.seed);
    kolFrei = frei.length ? baueKollision(frei) : null;
    for (const z of L.herden) {
      for (let v = 0; v < 24; v++) {
        const m = P.punkt(z.s + (rnd() - 0.5) * (z.streuung ?? 20), z.seite * mische(z.lat[0], z.lat[1], rnd()));
        if (!ok(m.x, m.z, c.radius)) continue;
        if (herde(m, z.anzahl, 'alp', L.herdenAbstand, z.radius, true)) break;
      }
    }
  }

  // Füsse auf den Boden: tiefster Punkt unter dem Körper (an Hängen schwebt sonst ein Bein)
  for (const k of kuehe) {
    const fx = Math.sin(k.blick), fz = Math.cos(k.blick), sx = fz, sz = -fx;
    const lang = 1.1 * k.groesse, breit = 0.35 * k.groesse;
    let y = Infinity;
    for (let a = -1; a <= 1.001; a += 0.125) {
      for (const b of [-1, 0, 1]) y = Math.min(y, welt.gelaendeHoehe(k.x + fx * a * lang + sx * b * breit, k.z + fz * a * lang + sz * b * breit));
    }
    k.y = y - 0.04;
    strecke.abfrage(k.x, k.z, q);
    k.s = q.s; k.abstand = q.abstand; k.seite = Math.sign(q.seite);
  }
  return { kuehe, weiden: { tal, alp }, eingefroren: !!folge, weggefallen };
}

// =====================================================================
// Aufbau: Sprites und Kollisionskreise
// =====================================================================
export function baueKuehe(szene, strecke, welt, pflanzen, rand, frei = []) {
  const t0 = performance.now();
  const c = CONFIG.kuehe;
  if (!c.an) return { kuehe: [], hindernisse: [], statistik: { anzahl: 0 } };
  const plan = planeKuehe(strecke, welt, pflanzen, rand, frei);
  const { kuehe } = plan;
  const tPlan = performance.now() - t0;
  const atlas = kuhAtlas();
  const tBild = performance.now() - t0 - tPlan;

  // Ein Viereck pro Kuh, alle in einem Zeichenaufruf
  const basis = new THREE.PlaneGeometry(1, 1);
  basis.translate(0, 0.5, 0);
  const geo = new THREE.InstancedBufferGeometry();
  geo.index = basis.index;
  geo.setAttribute('position', basis.attributes.position);
  geo.setAttribute('uv', basis.attributes.uv);
  const fuss = new Float32Array(kuehe.length * 3), daten = new Float32Array(kuehe.length * 4), blick = new Float32Array(kuehe.length);
  const rndH = zufall(c.seed + 1);
  kuehe.forEach((k, i) => {
    fuss.set([k.x, k.y, k.z], i * 3);
    daten.set([atlas.breiteM * k.groesse, atlas.hoeheM * k.groesse, k.art * KUH_BILD.posen.length + k.pose, 0.92 + rndH() * 0.14], i * 4);
    blick[i] = k.blick;
  });
  geo.setAttribute('aFuss', new THREE.InstancedBufferAttribute(fuss, 3));
  geo.setAttribute('aDaten', new THREE.InstancedBufferAttribute(daten, 4));
  geo.setAttribute('aBlick', new THREE.InstancedBufferAttribute(blick, 1));
  geo.instanceCount = kuehe.length;
  const mat = spriteMaterial(atlas.textur, 1, VERTEX, { uRaster: { value: new THREE.Vector2(atlas.spalten, atlas.zeilen) } });
  mat.uniforms.map.value = atlas.textur;
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  mesh.name = 'kuehe';
  if (kuehe.length) szene.add(mesh);

  // Kollision: ein Kreis um den Körper (Aufprall wie an einem Baum: hart zum Halt)
  const hindernisse = kuehe.map((k) => ({ x: k.x, z: k.z, r: k.r * k.groesse, kuh: true }));
  const zaehle = (f) => kuehe.filter(f).length;
  const statistik = {
    anzahl: kuehe.length, herden: new Set(kuehe.map((k) => k.herde)).size,
    eingefroren: plan.eingefroren, weggefallen: plan.weggefallen, neu: zaehle((k) => k.leben), // M3d
    tal: zaehle((k) => k.wo === 'tal'), alp: zaehle((k) => k.wo === 'alp'),
    stehend: zaehle((k) => k.pose === 0), grasend: zaehle((k) => k.pose === 1), liegend: zaehle((k) => k.pose === 2),
    arten: KUH_ARTEN.map((a, i) => `${a.name}: ${zaehle((k) => k.art === i)}`),
    naechsteStrasse: kuehe.length ? Math.round(Math.min(...kuehe.map((k) => k.abstand)) * 10) / 10 : null,
    ms: Math.round(performance.now() - t0), msPlan: Math.round(tPlan), msBild: Math.round(tBild),
  };
  return { kuehe, hindernisse, mesh, plan, statistik };
}
