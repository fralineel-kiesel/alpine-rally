// Screenshots, Zahlen und Prüfungen für Meilenstein 2a.1 (Sperren natürlicher, mehr Schilder).
//
//   node tools/sperren-bilder.mjs --endung b                      dieses Projekt, Bilder mit Endung b
//   node tools/sperren-bilder.mjs --wurzel <ordner> --endung a    alte Version (vorher)
//   --keine-bilder                                                nur Zahlen
//
// Bilder in 1280x720, ohne HUD, nach screenshots/m2a-1/:
//   - jede gesperrte Kurve von hinter dem Auto in Fahrtrichtung und von oben
//   - Tempo-Tafeln aus 15, 30 und 45 m (Lesbarkeit)
// Zahlen: Teile pro gesperrter Kurve (Reihen, Felsen, Stämme, Tannen, Steine), Teile, die
// ineinander stecken, Schilder nach Art, Zeichenaufrufe und Dreiecke an 4 Stellen.
// Das Spiel selbst lädt diese Datei nicht.

import fs from 'node:fs';
import path from 'node:path';
import { starteSpiel, WURZEL } from './spiel-browser.mjs';

const arg = (name) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : null; };
const wurzel = arg('--wurzel') ? path.resolve(arg('--wurzel')) : WURZEL;
const endung = arg('--endung') || 'b';
const bilder = !process.argv.includes('--keine-bilder');
const ordner = path.join(WURZEL, 'screenshots/m2a-1');
fs.mkdirSync(ordner, { recursive: true });

const spiel = await starteSpiel({ wurzel, breite: 1280, hoehe: 720 });
await spiel.ladeSpiel();
const page = spiel.page;
await page.addStyleTag({ content: '#hud { display: none !important; }' });
const warte = () => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(r)))));
const info = () => page.evaluate(() => {
  const r = window.__alpineRally.renderer.info.render;
  return { calls: r.calls, dreiecke: r.triangles };
});

// --- 1. Teile pro gesperrter Kurve und Teile, die ineinander stecken ---------------
const kurven = await page.evaluate(async () => {
  const A = window.__alpineRally;
  const { ABKUERZUNGEN } = await import('/js/abkuerzungen.js');
  const S = await import('/js/sperren.js');
  const px = await import('/js/pixel.js');
  const tex = { tanne: px.tannenTextur(), fels: px.felsbrockenTextur(), stein: px.steinTextur() };
  const basis = A.pflanzen.hindernisse.filter((h) => !h.sperre);
  const fk = A.CONFIG.kollision;
  const erg = [];
  // alle Sperren zusammen planen (wie im Spiel), dann jedes Teil seiner Kurve zuordnen
  const alle = S.planeAlleSperren(ABKUERZUNGEN.sperren, A.strecke, A.welt, tex, basis);
  const q = {};
  const inKurve = (k, sd) => (o) => {
    A.strecke.abfrage(o.x, o.z, q);
    return q.s >= k.sVon - 25 && q.s <= k.sBis + 25 && Math.sign(q.seite) === sd;
  };
  for (const k of ABKUERZUNGEN.nichtSchneiden) {
    const sd = k.seite === 'rechts' ? 1 : -1;
    const reihen = ABKUERZUNGEN.sperren.filter((r) => r.seite === sd && r.s >= k.sVon - 25 && r.s <= k.sBis + 25);
    const f = inKurve(k, sd);
    const t = { felsen: alle.felsen.filter(f), steine: alle.steine.filter(f), tannen: alle.tannen.filter(f), staemme: alle.staemme.filter(f), hindernisse: alle.hindernisse.filter(f) };
    const gruppe = alle.gruppen ? alle.gruppen.find((g) => g.seite === sd && g.sBis >= k.sVon - 25 && g.sVon <= k.sBis + 25) : null;
    // Kreise der sichtbaren Teile (für "steckt ineinander")
    const teile = [];
    for (const f of t.felsen) teile.push({ art: 'fels', kreise: [{ x: f.x, z: f.z, r: f.b * A.CONFIG.sperren.felsFaktor }] });
    for (const f of t.steine) teile.push({ art: 'stein', kreise: [{ x: f.x, z: f.z, r: f.b * fk.steinFaktor }] });
    for (const f of t.tannen) teile.push({ art: 'tanne', kreise: [{ x: f.x, z: f.z, r: fk.stammRadius }] });
    for (const st of t.staemme) {
      if (st.hoch > 0) continue; // liegt oben auf
      const kr = [];
      for (let f = -0.5; f <= 0.5001; f += 0.1) kr.push({ x: st.x + st.dx * f * (st.laenge - st.r), z: st.z + st.dz * f * (st.laenge - st.r), r: st.r });
      teile.push({ art: 'stamm', kreise: kr, st });
    }
    // Stämme desselben Stapels liegen absichtlich aneinander (parallel, direkt nebeneinander)
    const gleicherStapel = (a, b) => a.st && b.st && Math.abs(a.st.dx * b.st.dx + a.st.dz * b.st.dz) > 0.999 &&
      Math.hypot(a.st.x - b.st.x, a.st.z - b.st.z) < (a.st.r + b.st.r) * 1.2;
    // Stapel zählen: Stämme, die parallel direkt neben- oder aufeinander liegen, sind ein Stapel
    const st = t.staemme, stapelNr = st.map((_, i) => i);
    const wurzel = (i) => (stapelNr[i] === i ? i : (stapelNr[i] = wurzel(stapelNr[i])));
    for (let i = 0; i < st.length; i++) {
      for (let j = i + 1; j < st.length; j++) {
        if (Math.abs(st[i].dx * st[j].dx + st[i].dz * st[j].dz) > 0.999 && Math.hypot(st[i].x - st[j].x, st[i].z - st[j].z) < (st[i].r + st[j].r) * 1.2) stapelNr[wurzel(i)] = wurzel(j);
      }
    }
    const stapel = new Set(st.map((_, i) => wurzel(i))).size;
    let ineinander = 0, tiefstes = 0;
    for (let i = 0; i < teile.length; i++) {
      for (let j = i + 1; j < teile.length; j++) {
        if (gleicherStapel(teile[i], teile[j])) continue;
        let tief = 0;
        for (const a of teile[i].kreise) for (const b of teile[j].kreise) tief = Math.max(tief, a.r + b.r - Math.hypot(a.x - b.x, a.z - b.z));
        if (tief > 0.05) { ineinander++; tiefstes = Math.max(tiefstes, tief); }
      }
    }
    erg.push({
      kurve: `${k.sVon}–${k.sBis} ${k.seite}`, sVon: k.sVon, sBis: k.sBis, seite: sd,
      thema: gruppe ? gruppe.thema + (gruppe.beimischung && (gruppe.beimischung === 'fels' ? t.felsen : gruppe.beimischung === 'staemme' ? t.staemme : t.tannen).length
        ? ` + ${gruppe.beimischung}` : '') : 'gemischt',
      notloesung: gruppe ? gruppe.ueberlapp : null, stapel,
      reihen: reihen.length, felsen: t.felsen.length, staemme: t.staemme.length, tannen: t.tannen.length, steine: t.steine.length,
      teile: t.felsen.length + t.staemme.length + t.tannen.length + t.steine.length,
      kreise: t.hindernisse.length, ineinander, tiefstes: Math.round(tiefstes * 100) / 100,
    });
  }
  return erg;
});

// --- 2. Schilder nach Art ----------------------------------------------------------
const schilder = await page.evaluate(() => {
  const P = window.__alpineRally.strassenrand.plan;
  const arten = {};
  for (const sch of P.schilder) {
    for (const t of sch.tafeln) {
      const name = t.kachel.replace(/^km.*/, 'km').replace(/^kehre.*/, 'kehre');
      arten[name] = (arten[name] || 0) + 1;
    }
  }
  return {
    pfosten: P.schilder.length, tafeln: Object.values(arten).reduce((a, b) => a + b, 0), arten,
    liste: P.schilder.map((s) => `${Math.round(s.s)} ${s.seite > 0 ? 'R' : 'L'} ${s.tafeln.map((t) => t.kachel).join('+')}`),
  };
});

// --- 3. Bilder -----------------------------------------------------------------------
const STELLEN = [];
kurven.forEach((k, i) => {
  const n = String(i + 1).padStart(2, '0');
  STELLEN.push({ nr: n, name: `kurve-${k.sVon}-hinter-auto`, s: k.sVon + 6 });
  STELLEN.push({ nr: n, name: `kurve-${k.sVon}-schraeg-oben`, schraeg: k });
});
STELLEN.push({ nr: '05', name: `kehre-${kurven[1].sVon}-von-oben`, oben: kurven[1] });
// Leistung an 4 Stellen (hinter dem Auto)
const LEISTUNG = [
  { name: 'Tal (100 m)', s: 100 },
  { name: 'Kehre 1 (1352 m)', s: 1352 },
  { name: 'Kehren (1475 m)', s: 1475 },
  { name: 'Schikane (3175 m)', s: 3175 },
];

async function stelle(st) {
  await page.evaluate(({ s, oben, schraeg, sd }) => {
    const A = window.__alpineRally;
    A.testKamera = null;
    const k = oben || schraeg;
    if (k) {
      // Scheitel der Kurve, n = ins Kurveninnere
      const p = A.strecke.punktBei((k.sVon + k.sBis) / 2);
      const nx = -p.tz * k.seite, nz = p.tx * k.seite;
      const mx = p.x + nx * 8, mz = p.z + nz * 8;
      const h = A.welt.gelaendeHoehe(mx, mz);
      A.setzeAuf(k.sVon - 40);
      // von oben: fast senkrecht (leicht schräg, sonst sieht man die Sprites nur als Strich);
            // schräg: über der Strasse am Scheitel (aussen, dort steht nichts im Bild), 16 m hoch
      if (oben) A.testKamera = { pos: [mx - nx * 10, h + 30, mz - nz * 10], ziel: [mx, h, mz] };
      else A.testKamera = { pos: [p.x - nx * 5, p.h + 16, p.z - nz * 5], ziel: [mx, h, mz] };
    } else if (sd) {
      // Schild sd aus der Fahrerposition, abstand Meter davor
      const P = A.strassenrand.plan;
      const sch = P.schilder[sd.i];
      A.setzeAuf(Math.max(5, sch.s - sd.abstand + 7));
    } else A.setzeAuf(s);
  }, st);
  await warte();
}

const leistung = [];
for (const st of LEISTUNG) { await stelle(st); leistung.push({ ...st, ...(await info()) }); }

if (bilder) {
  for (const st of STELLEN) {
    await stelle(st);
    await page.screenshot({ path: path.join(ordner, `${st.nr}${endung}-${st.name}.png`) });
  }
  // neue Schilder (Tempo, Kühe, Kreuzung) aus 20 m, die erste Tempo-Tafel aus 15, 30 und 45 m
  // (Kamera steht ca. 7 m hinter dem Auto, also so weit vor dem Schild)
  const neue = await page.evaluate(() => window.__alpineRally.strassenrand.plan.schilder
    .map((s, i) => ({ i, s: Math.round(s.s), k: s.tafeln.map((t) => t.kachel).join('+') })).filter((s) => /tempo|Kuh|Kreuzung/.test(s.k)));
  for (const sch of neue) {
    await stelle({ sd: { i: sch.i, abstand: 20 } });
    await page.screenshot({ path: path.join(ordner, `06${endung}-schild-${sch.s}m-${sch.k}.png`) });
  }
  const t0 = neue.find((x) => /^tempo\d+$/.test(x.k)) || neue.find((x) => /tempo/.test(x.k));
  if (t0) {
    for (const abstand of [15, 30, 45]) {
      await stelle({ sd: { i: t0.i, abstand } });
      await page.screenshot({ path: path.join(ordner, `07${endung}-tempo-${t0.k}-aus-${abstand}m.png`) });
    }
  }
  await page.evaluate(() => { window.__alpineRally.testKamera = null; });
}

// ganze Strecke alle 50 m: schlimmste Stelle
const durchlauf = [];
const laenge = await page.evaluate(() => window.__alpineRally.strecke.laenge);
for (let s = 10; s < laenge - 10; s += 50) {
  await page.evaluate((s) => window.__alpineRally.setzeAuf(s), s);
  await warte();
  durchlauf.push({ s, ...(await info()) });
}

console.log(`Version: ${wurzel === WURZEL ? 'dieses Projekt' : wurzel}`);
console.log('\n| Kurve | Thema | Reihen | Felsbrocken | Stämme (Stapel) | Tannen | kleine Steine | Teile | Kollisionskreise | stecken ineinander |');
console.log('|---|---|---|---|---|---|---|---|---|---|');
for (const k of kurven) {
  console.log(`| ${k.kurve} | ${k.thema} | ${k.reihen} | ${k.felsen} | ${k.staemme} (${k.stapel}) | ${k.tannen} | ${k.steine} | ${k.teile} | ${k.kreise} |` +
    ` ${k.ineinander}${k.ineinander ? ` (bis ${k.tiefstes} m)` : ''} |`);
}
console.log(`\nSchilder: ${schilder.pfosten} Pfosten, ${schilder.tafeln} Tafeln:`, JSON.stringify(schilder.arten));
for (const z of schilder.liste) console.log(`  ${z}`);
console.log('\n| Stelle | Zeichenaufrufe | Dreiecke |');
console.log('|---|---|---|');
for (const e of leistung) console.log(`| ${e.name} | ${e.calls} | ${e.dreiecke} |`);
const maxCalls = durchlauf.reduce((a, b) => (b.calls > a.calls ? b : a));
const maxDr = durchlauf.reduce((a, b) => (b.dreiecke > a.dreiecke ? b : a));
console.log(`Durchlauf alle 50 m: meiste Zeichenaufrufe ${maxCalls.calls} bei ${maxCalls.s} m, meiste Dreiecke ${maxDr.dreiecke} bei ${maxDr.s} m`);
fs.writeFileSync(path.join(ordner, `zahlen-${endung}.json`), JSON.stringify({ kurven, schilder, leistung, durchlauf }, null, 1) + '\n');
if (spiel.fehler.length) console.log(`Fehler im Spiel: ${spiel.fehler.length}`);
await spiel.schliessen();
