// Schneewall (Meilenstein 11a): weicher Rand der Gletscher-Etappe statt Leitplanken.
// Ein niedriger, geräumter Schneewall links und rechts der Strasse (Streckendatei strassenrand.schneewall).
// Fährt das Auto hinein, taucht es ein: es wird gebremst (Anteil des Tempos je Sekunde) und von einer weichen Feder
// zur Strasse zurückgeschoben, tiefer als tiefeMax kommt es nicht (kein Abkürzen durch den Wall). Keine Wand-Strafe,
// keine MOTOR-Leuchte, kein Steckenbleiben (die Feder schiebt immer zur Strasse, rückwärts ist frei).
// Werte: config.js, Block schneewall. Ohne schneewall in der Streckendatei (Alpen, Finnland) passiert hier nichts.
import * as THREE from 'three';
import { CONFIG } from './config.js';

const begrenze = (w, a, b) => (w < a ? a : w > b ? b : w);

// strecke, netz, welt: wie im Spiel. Ergebnis: { an, links, rechts, kante, wirke(physik, q, dt), mesh }
export function baueSchneewall(strecke, netz, welt) {
  const C = CONFIG.schneewall, D = CONFIG.strassenrand && CONFIG.strassenrand.schneewall;
  const leer = { an: false, wirke: () => null, mesh: null };
  if (!C || !D || D.an === false) return leer;
  const n = strecke.anzahl;
  const links = new Uint8Array(n), rechts = new Uint8Array(n), kante = new Float32Array(n);
  const bank = CONFIG.strasse.bankett;
  for (let i = 0; i < n; i++) {
    kante[i] = netz.halbBei(i) + bank + C.abstand;
    links[i] = 1; rechts[i] = 1;
    // Felswand auf dieser Seite: dort steht der Fels, kein Wall
    if (strecke.wandSeite && strecke.wandSeite[i] === -1) links[i] = 0;
    if (strecke.wandSeite && strecke.wandSeite[i] === 1) rechts[i] = 0;
  }
  // von Hand ausgenommen (Streckendatei: ohne: [[von, bis, seite]], seite -1 = links, 1 = rechts, 0 = beide)
  for (const [von, bis, sd] of D.ohne || []) {
    for (let i = Math.max(0, Math.ceil(von)); i <= Math.min(n - 1, Math.floor(bis)); i++) { if (sd <= 0) links[i] = 0; if (sd >= 0) rechts[i] = 0; }
  }
  // An den Kreuzungen (Stummel, abgerundete Ecken) und an Start/Ziel-Verlängerungen bleibt eine Lücke
  const q = {};
  for (const ast of netz.aeste || []) {
    if (ast.art !== 'abzweig' && ast.art !== 'einmuendung') continue;
    const von = Math.max(0, Math.floor(ast.sJ - C.kreuzungLuecke)), bis = Math.min(n - 1, Math.ceil(ast.sJ + C.kreuzungLuecke));
    for (let i = von; i <= bis; i++) {
      for (const sd of [-1, 1]) {
        const l = sd * (kante[i] + C.breite / 2);
        const x = strecke.px[i] - strecke.tz[i] * l, z = strecke.pz[i] + strecke.tx[i] * l;
        const w = netz.stummelAbfrage(ast, x, z, 30, q);
        if (w && w.s > -2 && Math.abs(w.seite) < ast.halb + C.breite + 2) (sd < 0 ? links : rechts)[i] = 0;
      }
    }
  }
  // einzelne kurze Wall-Stücke (unter mindestLaenge) weglassen
  for (const a of [links, rechts]) {
    let st = -1;
    for (let i = 0; i <= n; i++) {
      if (i < n && a[i]) { if (st < 0) st = i; continue; }
      if (st >= 0 && i - st < C.mindestLaenge) a.fill(0, st, i);
      st = -1;
    }
  }

  // --- Physik (je Schritt, nicht in der Luft) ---
  // q: strecke.abfrage(physik) nach den Hindernissen. Ergebnis: Eintauchtiefe (m, 0 = kein Kontakt) und das Tempo
  // Richtung Wall beim ersten Kontakt (für Ton und Staub); kein Kontakt: null
  const aus = { tiefe: 0, wucht: 0, neu: false };
  let kontaktVorher = false;
  function wirke(physik, qa, dt) {
    const i = begrenze(Math.round(qa.i), 0, n - 1), sd = qa.seite >= 0 ? 1 : -1;
    const tiefe = (sd < 0 ? links[i] : rechts[i]) ? Math.abs(qa.seite) + C.autoHalb - kante[i] : 0;
    if (tiefe <= 0) { kontaktVorher = false; erg.kontakt = false; return null; }
    erg.kontakt = true; erg.kontaktSchritte++; // (für Werkzeuge und Tests)
    // Richtung zur Strasse (n) und Tempo in den Wall (vIn > 0 = hinein)
    const nx = qa.tz * sd, nz = -qa.tx * sd;
    const vIn = -(physik.vx * nx + physik.vz * nz);
    aus.neu = !kontaktVorher; aus.wucht = aus.neu ? Math.max(0, vIn) : 0; kontaktVorher = true;
    let t = tiefe;
    // 1. nicht tiefer als tiefeMax (wie eine Grenze: das Tempo hinein ist weg, aber ohne Strafe und ohne Abprallen)
    if (t > C.tiefeMax) {
      const ueber = t - C.tiefeMax;
      physik.x += nx * ueber; physik.z += nz * ueber;
      if (vIn > 0) { physik.vx += nx * vIn; physik.vz += nz * vIn; }
      t = C.tiefeMax;
    }
    // 2. bremsen: Anteil des Tempos je Sekunde, voll ab tiefeVoll
    const f = Math.max(0, 1 - C.verlustJeSek * dt * Math.min(1, t / C.tiefeVoll));
    physik.vx *= f; physik.vz *= f;
    // ... das Tempo in den Wall hinein wird zusätzlich weich geschluckt (das Auto taucht ein statt abzuprallen)
    const vIn2 = -(physik.vx * nx + physik.vz * nz);
    if (vIn2 > 0) {
      const g = Math.min(1, C.schlucken * dt), weg = vIn2 * g;
      physik.vx += nx * weg; physik.vz += nz * weg;
      // ... und was er schluckt, kostet zusätzlich Tempo entlang des Walls (wie Reibung beim Aufprall): wer in einer
      // Kehre mit Schwung in den Wall fährt, statt zu bremsen, verliert mehr, als er gewinnt (kein Polster)
      const tx = -nz, tz = nx, vt = physik.vx * tx + physik.vz * tz, vtNeu = Math.sign(vt) * Math.max(0, Math.abs(vt) - C.reibung * weg);
      physik.vx += tx * (vtNeu - vt); physik.vz += tz * (vtNeu - vt);
    }
    // 3. Feder: schiebt zur Strasse zurück (rutscht wieder heraus): als Tempo und, weil die Reifen seitlich haften
    //    (stehend hielte sie sonst nichts heraus), zusätzlich direkt an der Position
    physik.vx += nx * C.feder * t * dt; physik.vz += nz * C.feder * t * dt;
    const raus = Math.min(t, C.herausJeSek * t * dt);
    physik.x += nx * raus; physik.z += nz * raus;
    physik.drehrate *= Math.max(0, 1 - C.drehBremse * dt);
    // 4. schaut die Nase in den Wall, dreht der Schnee sie langsam parallel zum Wall (sonst fährt das Auto im Wall entlang)
    const fx = Math.sin(physik.richtung), fz = Math.cos(physik.richtung), hinein = -(fx * nx + fz * nz);
    if (hinein > -C.wegWinkel && physik.tempo > 1) {
      let ax = -nz, az = nx;
      if (ax * fx + az * fz < 0) { ax = -ax; az = -az; }
      // Ziel: parallel zum Wall, leicht zur Strasse hin gedreht (wegWinkel), damit es wirklich herausrutscht
      ax += nx * C.wegWinkel; az += nz * C.wegWinkel;
      let diff = Math.atan2(ax, az) - physik.richtung;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      // (schnell: kaum Ausrichten, sonst wäre der Wall in Kehren eine Lenkhilfe)
      // (auf Eis noch weniger: dort lenken die Reifen kaum, der Wall soll nicht lenken, wo die Reifen es nicht können)
      const langsam = Math.min(1, C.ausrichtenBis / Math.max(1, physik.tempo)) * (netz.belag && netz.belag[i] === 'eis' ? C.ausrichtenEis : 1);
      physik.richtung += Math.sign(diff) * Math.min(Math.abs(diff), C.ausrichten * langsam * dt * Math.min(1, t / C.tiefeVoll));
    }
    aus.tiefe = t;
    return aus;
  }

  // --- Aussehen: niedriger Wall, oben weiss, zur Strasse hell, aussen bläulicher Schatten (flach schattiert) ---
  const pos = [], col = [], idx = [];
  const weiss = new THREE.Color(C.farbeOben), innen = new THREE.Color(C.farbeInnen), schatten = new THREE.Color(C.farbeSchatten);
  const SCHRITT = C.schritt;
  for (const [sd, a] of [[-1, links], [1, rechts]]) {
    let st = -1;
    for (let i = 0; i <= n; i++) {
      const an = i < n && a[i];
      if (an && st < 0) st = i;
      if ((an && i < n - 1) || st < 0) continue;
      const bis = an ? i : i - 1;
      // Querschnitt alle SCHRITT Meter: Fuss innen, oben innen, oben aussen, Fuss aussen
      const reihe = [];
      for (let k = st; ; k = Math.min(bis, k + SCHRITT)) {
        const kr = kante[k], h0 = strecke.py[k];
        const pkt = (l, y) => [strecke.px[k] - strecke.tz[k] * sd * l, y, strecke.pz[k] + strecke.tx[k] * sd * l];
        const welle = C.hoehe * (1 + C.welle * Math.sin(k * 0.37 + sd));
        const fussA = pkt(kr + C.breite, 0); fussA[1] = Math.min(h0, welt.gelaendeHoehe(fussA[0], fussA[2])) - 0.3;
        const oben = h0 + welle;
        reihe.push([pkt(kr, h0 - 0.15), pkt(kr + C.breite * 0.3, oben), pkt(kr + C.breite * 0.7, oben - 0.1), fussA]);
        if (k === bis) break;
      }
      for (let r = 0; r + 1 < reihe.length; r++) {
        const A = reihe[r], B = reihe[r + 1];
        for (let f = 0; f < 3; f++) {
          const farbe = f === 0 ? innen : f === 1 ? weiss : schatten;
          const b0 = pos.length / 3;
          for (const p of [A[f], A[f + 1], B[f + 1], B[f]]) { pos.push(p[0], p[1], p[2]); col.push(farbe.r, farbe.g, farbe.b); }
          // Drehsinn: Flächen schauen nach oben/aussen (links und rechts gespiegelt)
          if (sd > 0) idx.push(b0, b0 + 1, b0 + 2, b0, b0 + 2, b0 + 3); else idx.push(b0, b0 + 2, b0 + 1, b0, b0 + 3, b0 + 2);
        }
      }
      st = -1;
    }
  }
  // Schneestangen (rot-weiss, Orientierung am Rand): alle stangenAbstand Meter auf dem Wall, zwei gekreuzte schmale
  // Flächen (von allen Seiten sichtbar), im selben Zeichenaufruf wie der Wall
  const rot = new THREE.Color(C.stangeRot), weissS = new THREE.Color(C.stangeWeiss);
  for (const [sd, a] of [[-1, links], [1, rechts]]) {
    for (let k = Math.round(C.stangenAbstand / 2) + (sd > 0 ? Math.round(C.stangenAbstand / 2) : 0); k < n; k += C.stangenAbstand) {
      if (!a[k]) continue;
      const l = sd * (kante[k] + C.breite * 0.3), x = strecke.px[k] - strecke.tz[k] * l, z = strecke.pz[k] + strecke.tx[k] * l;
      const y0 = strecke.py[k] + C.hoehe * 0.6, b = C.stangeBreite / 2, teil = C.stangeHoehe / C.stangeTeile;
      for (let t = 0; t < C.stangeTeile; t++) {
        const farbe = t % 2 ? weissS : rot, ya = y0 + t * teil, yb = ya + teil;
        for (const [dx, dz] of [[b, 0], [0, b]]) {
          const b0 = pos.length / 3;
          for (const [px, py, pz] of [[x - dx, ya, z - dz], [x + dx, ya, z + dz], [x + dx, yb, z + dz], [x - dx, yb, z - dz]]) { pos.push(px, py, pz); col.push(farbe.r, farbe.g, farbe.b); }
          idx.push(b0, b0 + 1, b0 + 2, b0, b0 + 2, b0 + 3);
        }
      }
    }
  }
  let mesh = null;
  if (idx.length) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    geo.setIndex(idx);
    const g2 = geo.toNonIndexed(); g2.computeVertexNormals(); // flach schattiert (jede Fläche eigene Normale)
    mesh = new THREE.Mesh(g2, new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide }));
  }
  const erg = { an: true, links, rechts, kante, wirke, mesh, dreiecke: idx.length / 3, kontakt: false, kontaktSchritte: 0 };
  return erg;
}
