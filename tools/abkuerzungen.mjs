// Abkürzungen messen und Sperren planen (Meilenstein 1.1, Teil 2).
//
//   node tools/abkuerzungen.mjs           Analyse vorher, Sperren planen, js/abkuerzungen.js schreiben,
//                                         danach im Spiel nachprüfen
//   node tools/abkuerzungen.mjs --pruefen nur nachprüfen (nichts schreiben)
//
// Braucht Playwright mit Chromium (in der Testumgebung vorhanden). Startet einen
// kleinen Webserver, öffnet das Spiel im Headless-Browser und rechnet dort mit
// dem echten Gelände und den echten Hindernissen. Das Spiel selbst lädt nichts davon.

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const WURZEL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const nurPruefen = process.argv.includes('--pruefen');

// Playwright suchen (lokal oder global installiert)
async function ladePlaywright() {
  for (const versuch of [
    () => import('playwright'),
    () => import(createRequire(import.meta.url).resolve('playwright', { paths: [process.env.NODE_PATH || '', '/opt/node22/lib/node_modules'] })),
  ]) {
    try { return await versuch(); } catch { /* weiter */ }
  }
  throw new Error('Playwright nicht gefunden (npm i -g playwright)');
}

// kleiner Webserver für den Projektordner
const TYPEN = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.png': 'image/png' };
const server = http.createServer((req, res) => {
  const datei = path.join(WURZEL, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!datei.startsWith(WURZEL) || !fs.existsSync(datei) || fs.statSync(datei).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': TYPEN[path.extname(datei)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  fs.createReadStream(datei).pipe(res);
});
await new Promise((r) => server.listen(0, r));
const URL_SPIEL = `http://localhost:${server.address().port}/index.html`;

const pw = await ladePlaywright();
const { chromium } = pw.chromium ? pw : pw.default;
const browser = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 640, height: 360 } });
page.on('pageerror', (e) => console.log('Fehler im Spiel:', String(e)));

async function ladeSpiel() {
  const t0 = Date.now();
  await page.goto(URL_SPIEL);
  await page.waitForFunction(() => window.__alpineRally, null, { timeout: 120000 });
  const ms = Date.now() - t0;
  await page.evaluate(() => { window.__alpineRally.anhalten = true; });
  return ms;
}
const runde = (n, d = 1) => Math.round(n * 10 ** d) / 10 ** d;

// --- 1. vorher: ohne Sperren messen und Sperren planen -------------------------
if (!nurPruefen) {
  await ladeSpiel();
  const plan = await page.evaluate(async () => {
    const A = window.__alpineRally;
    const m = await import('/tools/abkuerzungen-analyse.js');
    const { baueKollision } = await import('/js/kollision.js');
    const px = await import('/js/pixel.js');
    const tex = { tanne: px.tannenTextur(), fels: px.felsbrockenTextur(), stein: px.steinTextur() };
    // Hindernisse ohne die Sperren (falls schon welche drin sind)
    const basis = A.pflanzen.hindernisse.filter((h) => !h.sperre);
    const kol = baueKollision(basis);
    const t0 = performance.now();
    const linien = m.findeAbkuerzungen(A.strecke, A.welt, kol);
    const ms = performance.now() - t0;
    // auch mit der echten Autobreite (1.8 m) – geplant wird gegen beide
    const linien18 = m.findeAbkuerzungen(A.strecke, A.welt, kol, { breite: 1.8 });
    const zahlen = {};
    for (const g of [5, 10]) zahlen[g] = m.findeAbkuerzungen(A.strecke, A.welt, kol, { minGewinn: g }).length;
    const kurven = m.gesperrteKurven(A.strecke, linien);
    const { sperren, rest } = m.planeSperren(A.strecke, A.welt, basis, tex, linien.concat(linien18));
    return {
      restListe: rest.map((l) => `${Math.round(l.sVon)} – ${Math.round(l.sBis)} ${l.seite > 0 ? 'rechts' : 'links'} ${l.gewinn.toFixed(1)} m (Breite ${l.halb * 2} m)`),
      ms, anzahl: linien.length, anzahl18: linien18.length, zahlen, kurven, sperren, rest: rest.length,
      laenge: A.strecke.laenge, minGewinn: A.CONFIG.abkuerzung.minGewinn,
      basis: basis.length,
    };
  });
  console.log(`\n=== VORHER (ohne Sperren, ${plan.basis} Hindernisse) ===`);
  console.log(`Analyse: ${runde(plan.ms, 0)} ms. Abkürzungen (Linien) mit Gewinn >= ${plan.minGewinn} m: ${plan.anzahl}` +
    ` (>= 5 m: ${plan.zahlen[5]}, >= 10 m: ${plan.zahlen[10]}); mit 1.8 m Durchfahrt: ${plan.anzahl18}`);
  console.log('| Kurve (Streckenmeter) | Innenseite | grösster Gewinn | Linien |');
  console.log('|---|---|---|---|');
  for (const k of plan.kurven) console.log(`| ${k.sVon} – ${k.sBis} | ${k.seite} | ${k.gewinn} m | ${k.linien} |`);
  console.log(`\nGeplante Sperren: ${plan.sperren.length} (nicht sperrbar: ${plan.rest} Linien)`);
  for (const r of plan.restListe) console.log(`  nicht sperrbar: ${r}`);

  const datei = `// Automatisch erzeugt von tools/abkuerzungen.mjs – bitte nicht von Hand ändern.
// Neu erzeugen (z. B. nach Änderungen an Strecke, Gelände oder Bäumen):
//   node tools/abkuerzungen.mjs
//
// sperren: wo Abkürzungs-Sperren stehen. s = Streckenmeter, seite = +1 rechts / -1 links
//   (Kurveninnenseite), von/bis = Abstand zur Strassenmitte (Meter). Wie die Sperren
//   aussehen, steht in config.js unter "sperren".
// nichtSchneiden: gesperrte Kurven, für die Pace-Note "nicht schneiden" (Meilenstein 4).

export const ABKUERZUNGEN = {
  streckenLaenge: ${runde(plan.laenge, 2)},
  minGewinn: ${plan.minGewinn},
  sperren: [
${plan.sperren.map((s) => `    { s: ${s.s}, seite: ${s.seite}, von: ${s.von}, bis: ${s.bis} },`).join('\n')}
  ],
  nichtSchneiden: [
${plan.kurven.map((k) => `    { sVon: ${k.sVon}, sBis: ${k.sBis}, seite: '${k.seite}' }, // Gewinn bis ${k.gewinn} m`).join('\n')}
  ],
};
`;
  fs.writeFileSync(path.join(WURZEL, 'js/abkuerzungen.js'), datei);
  console.log('-> js/abkuerzungen.js geschrieben');
}

// --- 2. nachher: Spiel neu laden (jetzt mit Sperren) und nachprüfen --------------
const ladeMs = await ladeSpiel();
const nach = await page.evaluate(async () => {
  const A = window.__alpineRally;
  const m = await import('/tools/abkuerzungen-analyse.js');
  const px = await import('/js/pixel.js');
  const tex = { tanne: px.tannenTextur(), fels: px.felsbrockenTextur(), stein: px.steinTextur() };
  const { ABKUERZUNGEN } = await import('/js/abkuerzungen.js');
  const linien = m.findeAbkuerzungen(A.strecke, A.welt, A.kollision);
  const linien18 = m.findeAbkuerzungen(A.strecke, A.welt, A.kollision, { breite: 1.8 });
  const luecke = m.groessteLuecke(A.strecke, A.welt, ABKUERZUNGEN.sperren, tex);
  // Wie nah kommt ein sichtbarer Teil einer Sperre der Strassenmitte? (Bankett endet bei 5.5 m)
  const P = A.pflanzen, q = {};
  const abst = (x, z) => A.strecke.abfrage(x, z, q).abstand;
  let nahFels = Infinity, nahStamm = Infinity;
  for (const f of P.felsbrocken) nahFels = Math.min(nahFels, abst(f.x, f.z) - f.b * 0.5);
  for (const st of P.staemme) {
    for (let f = -0.5; f <= 0.5; f += 0.05) nahStamm = Math.min(nahStamm, abst(st.x + st.dx * f * st.laenge, st.z + st.dz * f * st.laenge) - st.r);
  }
  let nahTanne = Infinity;
  for (const h of P.hindernisse) if (h.sperre && Math.abs(h.r - A.CONFIG.kollision.stammRadius) < 1e-9) nahTanne = Math.min(nahTanne, abst(h.x, h.z));
  const sperrH = P.hindernisse.filter((h) => h.sperre).length;
  return {
    linien: linien.map((l) => ({ sVon: Math.round(l.sVon), sBis: Math.round(l.sBis), gewinn: l.gewinn, seite: l.seite })),
    linien18: linien18.length,
    kurven: m.gesperrteKurven(A.strecke, linien),
    luecke,
    hindernisse: A.kollision.anzahl, sperrHindernisse: sperrH,
    sperren: ABKUERZUNGEN.sperren.length,
    felsbrocken: P.felsbrocken.length, staemme: P.staemme.length,
    nahFels, nahStamm, nahTanne, nichtSchneiden: A.strecke.nichtSchneiden,
  };
});
console.log(`\n=== NACHHER (mit ${nach.sperren} Sperren) ===`);
console.log(`Ladezeit im Headless-Browser: ${ladeMs} ms`);
console.log(`Hindernisse gesamt: ${nach.hindernisse} (davon Sperren: ${nach.sperrHindernisse} Kollisionskreise)`);
console.log(`Felsbrocken: ${nach.felsbrocken}, liegende Stämme: ${nach.staemme}`);
console.log(`Abkürzungen mit Gewinn >= ${(await page.evaluate(() => window.__alpineRally.CONFIG.abkuerzung.minGewinn))} m:` +
  ` ${nach.linien.length} (Durchfahrt 2.2 m), ${nach.linien18} (Durchfahrt 1.8 m = Autobreite)`);
for (const l of nach.linien.slice(0, 20)) console.log(`  übrig: ${l.sVon} – ${l.sBis} ${l.seite > 0 ? 'rechts' : 'links'} ${runde(l.gewinn)} m`);
console.log(`Grösste Lücke in einer Sperre (Engstelle der Kette): ${runde(nach.luecke.max, 2)} m (bei ${nach.luecke.wo} m)`);
console.log(`Nächster sichtbarer Teil zur Strassenmitte (Bankett endet bei 5.5 m): Felsbrocken ${runde(nach.nahFels, 2)} m,` +
  ` Stämme ${runde(nach.nahStamm, 2)} m, Tannen-Stamm ${runde(nach.nahTanne, 2)} m`);
console.log(`Einträge "nicht schneiden": ${nach.nichtSchneiden.length}`);

await browser.close();
server.close();
process.exit(nach.linien.length ? 1 : 0);
