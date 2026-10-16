// Demo-Fahrt hinter Titel und Hauptmenü (seit M5a).
// Der Testfahrer fährt die Etappe mit der echten Fahrphysik (gleiche Lenk- und Tempo-Logik wie
// tools/testfahrer-browser.js), die Kamera wechselt langsam und weich zwischen ein paar Blickwinkeln.
// Die Demo schreibt nichts in den Rennstand: gefahren wird mit fahrSchritt (nur Fahren, ohne Zeitmessung).
// Am Etappenende wird kurz abgeblendet und es beginnt von vorn.

import * as THREE from 'three';
import { CONFIG } from './config.js';
import { winkelNorm, begrenze } from './util.js';

// fahrSchritt(dt, eingabe): ein Physik-Schritt ohne Rennlogik. kameraKorrektur(pos): nicht in Wand/Gelände
export function baueDemo({ strecke, welt, physik, getriebe, kamera, fahrSchritt, kameraKorrektur }) {
  const D = CONFIG.menue.demo;
  const S = strecke;
  let pfad = null;

  // Pfad (Strassenmitte) mit Zieltempo je Punkt: aus der Krümmung und dem Grip des Belags
  function bauePfad() {
    const xs = S.px, zs = S.pz, n = S.anzahl, vZiel = new Float32Array(n);
    const q = {};
    for (let i = 0; i < n; i++) {
      const a = Math.max(0, i - 4), b = Math.min(n - 1, i + 4);
      const w1 = Math.atan2(xs[i] - xs[a], zs[i] - zs[a]), w2 = Math.atan2(xs[b] - xs[i], zs[b] - zs[i]);
      const lang = Math.hypot(xs[b] - xs[a], zs[b] - zs[a]) || 1;
      const kappa = Math.abs(winkelNorm(w2 - w1)) / (lang / 2);
      const art = welt.bodenBei(xs[i], zs[i], S.abfrage(xs[i], zs[i], q)).art;
      vZiel[i] = Math.min(60, Math.sqrt((D.quer * CONFIG.untergrund[art].grip) / Math.max(kappa, 1e-4)));
      if (S.s[i] > S.zielS + 5) vZiel[i] = Math.min(vZiel[i], 10); // nach dem Ziel ausrollen
    }
    for (let i = n - 2; i >= 0; i--) {
      const ds = Math.hypot(xs[i + 1] - xs[i], zs[i + 1] - zs[i]);
      vZiel[i] = Math.min(vZiel[i], Math.sqrt(vZiel[i + 1] ** 2 + 2 * D.bremsen * ds));
    }
    pfad = { xs, zs, vZiel, n };
  }

  function naechster(x, z, ab) {
    let best = ab, bestD = Infinity;
    const von = Math.max(0, ab - 10), bis = Math.min(pfad.n - 1, ab + 40);
    for (let i = von; i <= bis; i++) {
      const d = (pfad.xs[i] - x) ** 2 + (pfad.zs[i] - z) ** 2;
      if (d < bestD) { bestD = d; best = i; }
    }
    if (bestD > 400) {
      for (let i = 0; i < pfad.n; i++) {
        const d = (pfad.xs[i] - x) ** 2 + (pfad.zs[i] - z) ** 2;
        if (d < bestD) { bestD = d; best = i; }
      }
    }
    return best;
  }

  // Eingabe des Testfahrers (immer dasselbe Objekt, kein Abfall pro Bild)
  const e = { gas: 0, bremse: 0, lenkung: 0, handbremse: false, reset: false, debug: false, notes: false };
  function steuere(idx) {
    const v = Math.max(0, physik.vVor);
    const voraus = Math.min(pfad.n - 1, idx + Math.round(5 + v * 0.35));
    const ziel = Math.atan2(pfad.xs[voraus] - physik.x, pfad.zs[voraus] - physik.z);
    e.lenkung = begrenze(-winkelNorm(ziel - physik.richtung) * 2.5, -1, 1);
    const dv = pfad.vZiel[Math.min(pfad.n - 1, idx + 2)] - v;
    e.gas = dv > 0 ? begrenze(dv, 0, 1) : 0;
    e.bremse = dv < -0.3 ? begrenze(-dv * 0.5, 0, 1) : 0;
    return e;
  }

  // --- Zustand ---
  let idx = 0, steh = 0, ende = -1, schwarz = 1;
  const kam = { nr: 0, vorher: -1, zeit: 0, yaw: 0 };
  const qS = {};

  // (der Pfad wird erst beim ersten Schritt gebaut, nicht beim Laden: spart Ladezeit)
  function start() {
    const p = S.punktBei(CONFIG.strasse.spawnBeiMeter);
    physik.reset(p.x, p.z, Math.atan2(p.tx, p.tz));
    getriebe.reset();
    idx = 0; steh = 0; ende = -1;
    kam.nr = 0; kam.vorher = -1; kam.zeit = 0; kam.yaw = physik.richtung;
  }

  // Ein Physik-Schritt
  function schritt(dt) {
    if (!pfad) bauePfad();
    idx = naechster(physik.x, physik.z, idx);
    fahrSchritt(dt, steuere(idx));
    // hängen geblieben? (kommt kaum vor) -> ein Stück weiter auf die Strasse setzen
    if (physik.tempo < 0.5) steh += dt; else steh = 0;
    if (steh > 3) {
      steh = 0;
      const s = Math.min(S.laenge - 2, S.abfrage(physik.x, physik.z, qS).s + 4);
      const p = S.punktBei(s);
      physik.reset(p.x, p.z, Math.atan2(p.tx, p.tz));
      getriebe.reset();
    }
    // Etappe zu Ende: abblenden, dann von vorn
    if (ende < 0 && S.s[idx] > S.zielS + D.endeNachZiel) ende = D.schwarzblende;
  }

  // Kamera: Lage relativ zum Auto (rechts, hoch, vor), Blickziel ebenso
  const posA = new THREE.Vector3(), zielA = new THREE.Vector3(), posB = new THREE.Vector3(), zielB = new THREE.Vector3();
  function lage(k, pos, ziel, y) {
    const sx = Math.sin(kam.yaw), sz = Math.cos(kam.yaw); // vorwärts
    const rx = -sz, rz = sx;                                // rechts (wie im Spiel: -tz, tx)
    const [pr, ph, pv] = k.pos, [br, bh, bv] = k.blick;
    pos.set(physik.x + rx * pr + sx * pv, y + ph, physik.z + rz * pr + sz * pv);
    ziel.set(physik.x + rx * br + sx * bv, y + bh, physik.z + rz * br + sz * bv);
  }

  // Jedes Bild: Kamera setzen. Ergebnis: Schwarzblende 0..1 (für das HUD)
  function bild(dt, autoY) {
    const K = D.kameras;
    kam.zeit += dt;
    if (kam.zeit > K[kam.nr].dauer) { kam.vorher = kam.nr; kam.nr = (kam.nr + 1) % K.length; kam.zeit = 0; }
    kam.yaw += winkelNorm(physik.richtung - kam.yaw) * (1 - Math.exp(-D.drehGlaetten * dt));
    lage(K[kam.nr], posA, zielA, autoY);
    if (kam.vorher >= 0 && kam.zeit < D.wechsel) {
      let f = kam.zeit / D.wechsel;
      f = f * f * (3 - 2 * f); // weich an und aus
      lage(K[kam.vorher], posB, zielB, autoY);
      posA.lerp(posB, 1 - f);
      zielA.lerp(zielB, 1 - f);
    }
    kameraKorrektur(posA);
    kamera.position.copy(posA);
    kamera.lookAt(zielA);
    // Abblenden am Ende, Aufblenden am Anfang
    if (ende >= 0) {
      ende -= dt;
      schwarz = Math.min(1, Math.max(schwarz, 1 - ende / D.schwarzblende));
      if (ende <= 0) { start(); schwarz = 1; }
    } else schwarz = Math.max(0, schwarz - dt / D.schwarzblende);
    return schwarz;
  }

  return { start, schritt, bild, eingabe: e, get kameraNr() { return kam.nr; }, get index() { return idx; } };
}
