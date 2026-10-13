// Abkürzungen messen, Kurven sperren oder freigeben und Sperren planen (M1.1, seit M1.2 mit Sperrquote).
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

// Zeitgewinn beim Schneiden je Kurve (Sekunden, Schlüssel = sVon der Kurve), gemessen
// mit echter Fahrphysik von tools/schneiden-test.mjs. Fehlt die Datei, zählt nur der Weg.
const ZEIT_DATEI = path.join(WURZEL, 'tools/schneiden-zeiten.json');
const ZEITEN = fs.existsSync(ZEIT_DATEI) ? JSON.parse(fs.readFileSync(ZEIT_DATEI, 'utf8')).zeitGewinn || {} : {};

// --- 1. vorher: ohne Sperren messen und Sperren planen -------------------------
if (!nurPruefen) {
  await ladeSpiel();
  const plan = await page.evaluate(async (ZEITEN) => {
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
    // Kurvenzonen bilden, jede bewerten und auswählen (Meilenstein 1.2)
    const alleLinien = linien.concat(linien18);
    const { zonen, ohneZone } = m.kurvenZonen(A.strecke, alleLinien);
    for (const z of zonen) {
      const b = m.bewerteZone(z, A.strecke, A.welt, basis, tex);
      z.bewertung = { reihe: b.reihe, dichte: b.dichte, wand: b.wand, hang: b.hang, sperren: b.sperren.length };
    }
    // Zeitgewinn mit echter Fahrphysik (falls vorher gemessen, siehe tools/schneiden-test.mjs)
    for (const z of zonen) if (ZEITEN[z.sVon] != null) z.zeitGewinn = ZEITEN[z.sVon];
    const auswahl = m.waehleZonen(zonen);
    const muster = m.abwechslung(zonen);
    // Sperren nur für gesperrte Zonen (und Linien ohne Zone, sicherheitshalber)
    const zuSperren = zonen.filter((z) => z.gesperrt).flatMap((z) => z.linien).concat(ohneZone);
    const { sperren, rest } = m.planeSperren(A.strecke, A.welt, basis, tex, zuSperren);
    // Freie Zonen: welche Abkürzungen bleiben wirklich offen? (Eine Sperre der
    // Nachbarkurve kann sie schon zumachen.) Daraus entsteht die Liste "schneiden".
    const teile = (await import('/js/sperren.js')).planeAlleSperren(sperren, A.strecke, A.welt, tex);
    const kolSperren = baueKollision(teile.hindernisse);
    const offenLinie = (l) => {
      const n = Math.ceil(Math.hypot(l.bx - l.ax, l.bz - l.az) / A.CONFIG.abkuerzung.pruefSchritt);
      for (let k = 0; k <= n; k++) if (!kolSperren.frei(l.ax + (l.bx - l.ax) * (k / n), l.az + (l.bz - l.az) * (k / n), l.halb)) return false;
      return true;
    };
    for (const z of zonen) {
      if (z.gesperrt) continue;
      const offen = z.linien.filter(offenLinie);
      z.gewinnOffen = offen.length ? Math.max(...offen.map((l) => l.gewinn)) : 0;
      if (!offen.length) z.grund += '; ABER: die Sperre der Nachbarkurve macht auch diese Abkürzungen zu';
    }
    const kurz = (z) => ({
      gewinnOffen: z.gewinnOffen != null ? Math.round(z.gewinnOffen * 10) / 10 : null,
      sVon: z.sVon, sBis: z.sBis, seite: z.seite > 0 ? 'rechts' : 'links', gewinn: Math.round(z.gewinn * 10) / 10,
      linien: z.linien.length, gesperrt: z.gesperrt, grund: z.grund, bewertung: z.bewertung, offen: z.offen,
      zeitGewinn: z.zeitGewinn,
    });
    return {
      restListe: rest.map((l) => `${Math.round(l.sVon)} – ${Math.round(l.sBis)} ${l.seite > 0 ? 'rechts' : 'links'} ${l.gewinn.toFixed(1)} m (Breite ${l.halb * 2} m)`),
      ms, anzahl: linien.length, anzahl18: linien18.length, zahlen, zonen: zonen.map(kurz), ohneZone: ohneZone.length,
      auswahl, muster, sperren, rest: rest.length,
      laenge: A.strecke.laenge, minGewinn: A.CONFIG.abkuerzung.minGewinn,
      basis: basis.length,
    };
  }, ZEITEN);
  console.log(`\n=== VORHER (ohne Sperren, ${plan.basis} Hindernisse) ===`);
  console.log(`Analyse: ${runde(plan.ms, 0)} ms. Abkürzungen (Linien) mit Gewinn >= ${plan.minGewinn} m: ${plan.anzahl}` +
    ` (>= 5 m: ${plan.zahlen[5]}, >= 10 m: ${plan.zahlen[10]}); mit 1.8 m Durchfahrt: ${plan.anzahl18}`);
  if (plan.ohneZone) console.log(`Linien ohne passende Kurve (werden trotzdem gesperrt): ${plan.ohneZone}`);
  const n = plan.zonen.length, g = plan.zonen.filter((z) => z.gesperrt).length;
  console.log(`\nKurvenzonen: ${n}, gesperrt: ${g}, frei: ${n - g}, Quote ${runde((g / n) * 100, 0)} %` +
    ` (Ziel ${plan.auswahl.ziel}, erlaubt ${plan.auswahl.minAnz}–${plan.auswahl.maxAnz})`);
  console.log(`Reihenfolge entlang der Strecke (G = gesperrt, F = frei): ${plan.muster.muster}` +
    (plan.muster.gesperrtAmStueck ? '  ACHTUNG: alle gesperrten am Stück' : '') +
    (plan.muster.freiAmStueck ? '  ACHTUNG: alle freien am Stück' : ''));
  console.log('| Kurve (Streckenmeter) | Innenseite | grösster Gewinn | Linien | Reihe | Bäume/100 m² | Wand | Hang | Zeitgewinn | Entscheid | Grund |');
  console.log('|---|---|---|---|---|---|---|---|---|---|---|');
  for (const z of plan.zonen) {
    const b = z.bewertung;
    console.log(`| ${z.sVon} – ${z.sBis} | ${z.seite} | ${z.gewinn} m | ${z.linien} | ${b.reihe} m | ${b.dichte} | ${b.wand} | ${Math.round(b.hang * 100)} % |` +
      ` ${z.zeitGewinn != null ? z.zeitGewinn.toFixed(2) + ' s' : '-'} | ${z.gesperrt ? 'gesperrt' : 'frei'} | ${z.grund} |`);
  }
  if (plan.zonen.some((z) => z.grund.startsWith('Pflicht'))) console.log('HINWEIS: Pflicht-Sperre(n) vorhanden, bitte in STAND.md melden.');
  console.log(`\nGeplante Sperren: ${plan.sperren.length} (nicht sperrbar: ${plan.rest} Linien)`);
  for (const r of plan.restListe) console.log(`  nicht sperrbar: ${r}`);
  const gesperrt = plan.zonen.filter((z) => z.gesperrt);
  const frei = plan.zonen.filter((z) => !z.gesperrt && z.gewinnOffen >= plan.minGewinn)
    .map((z) => ({ ...z, gewinn: z.gewinnOffen }));
  const datei = `// Automatisch erzeugt von tools/abkuerzungen.mjs – bitte nicht von Hand ändern.
// Neu erzeugen (z. B. nach Änderungen an Strecke, Gelände, Bäumen oder an
// "abkuerzung" in config.js):
//   node tools/abkuerzungen.mjs
//
// sperren: wo Abkürzungs-Sperren stehen. s = Streckenmeter, seite = +1 rechts / -1 links
//   (Kurveninnenseite), von/bis = Abstand zur Strassenmitte (Meter). Wie die Sperren
//   aussehen, steht in config.js unter "sperren".
// Seit Meilenstein 1.2 wird nur ein Teil der Kurven gesperrt (config.js: abkuerzung.sperrQuote,
// immerSperren, immerFrei, pflichtGewinn, pflichtZeit). Für die Pace-Notes (Meilenstein 4):
// nichtSchneiden: gesperrte Kurven (Sperren stehen) -> Pace-Note "nicht schneiden".
// schneiden: freie Kurven ohne Sperren, in denen Schneiden etwas bringt (Gewinn mindestens
//   minGewinn Meter Weg gegenüber der Strassenmitte) -> Pace-Note "schneiden".
//   sVon/sBis = Streckenmeter, seite = Kurveninnenseite, gewinn = gesparte Meter.

export const ABKUERZUNGEN = {
  streckenLaenge: ${runde(plan.laenge, 2)},
  minGewinn: ${plan.minGewinn},
  sperren: [
${plan.sperren.map((s) => `    { s: ${s.s}, seite: ${s.seite}, von: ${s.von}, bis: ${s.bis} },`).join('\n')}
  ],
  nichtSchneiden: [
${gesperrt.map((k) => `    { sVon: ${k.sVon}, sBis: ${k.sBis}, seite: '${k.seite}' }, // Gewinn bis ${k.gewinn} m – ${k.grund}`).join('\n')}
  ],
  schneiden: [
${frei.map((k) => `    { sVon: ${k.sVon}, sBis: ${k.sBis}, seite: '${k.seite}', gewinn: ${k.gewinn} }, // ${k.grund}`).join('\n')}
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
    // übrige Abkürzungen pro Zone: in gesperrten Zonen darf keine mehr übrig sein
    zonen: m.kurvenZonen(A.strecke, linien.concat(linien18)).zonen.map((z) => ({
      sVon: z.sVon, sBis: z.sBis, gewinn: z.gewinn, linien: z.linien.length,
      gesperrt: ABKUERZUNGEN.nichtSchneiden.some((k) => k.sVon <= z.sBis && k.sBis >= z.sVon && (k.seite === 'rechts') === (z.seite > 0)),
    })),
    luecke,
    hindernisse: A.kollision.anzahl, sperrHindernisse: sperrH,
    sperren: ABKUERZUNGEN.sperren.length,
    felsbrocken: P.felsbrocken.length, staemme: P.staemme.length,
    nahFels, nahStamm, nahTanne, nichtSchneiden: A.strecke.nichtSchneiden, schneiden: A.strecke.schneiden,
  };
});
console.log(`\n=== NACHHER (mit ${nach.sperren} Sperren) ===`);
console.log(`Ladezeit im Headless-Browser: ${ladeMs} ms`);
console.log(`Hindernisse gesamt: ${nach.hindernisse} (davon Sperren: ${nach.sperrHindernisse} Kollisionskreise)`);
console.log(`Felsbrocken: ${nach.felsbrocken}, liegende Stämme: ${nach.staemme}`);
console.log(`Abkürzungen mit Gewinn >= ${(await page.evaluate(() => window.__alpineRally.CONFIG.abkuerzung.minGewinn))} m:` +
  ` ${nach.linien.length} (Durchfahrt 2.2 m), ${nach.linien18} (Durchfahrt 1.8 m = Autobreite)`);
for (const z of nach.zonen) {
  console.log(`  übrig in Kurve ${z.sVon} – ${z.sBis}: ${z.linien} Linien, Gewinn bis ${runde(z.gewinn)} m` +
    ` (${z.gesperrt ? 'GESPERRT – darf nicht sein!' : 'frei, erlaubt'})`);
}
const durchGesperrt = nach.zonen.filter((z) => z.gesperrt).reduce((n, z) => n + z.linien, 0);
console.log(`Durchkommen in gesperrten Kurven: ${durchGesperrt} Linien`);
console.log(`Grösste Lücke in einer Sperre (Engstelle der Kette): ${runde(nach.luecke.max, 2)} m (bei ${nach.luecke.wo} m)`);
console.log(`Nächster sichtbarer Teil zur Strassenmitte (Bankett endet bei 5.5 m): Felsbrocken ${runde(nach.nahFels, 2)} m,` +
  ` Stämme ${runde(nach.nahStamm, 2)} m, Tannen-Stamm ${runde(nach.nahTanne, 2)} m`);
console.log(`Einträge "nicht schneiden": ${nach.nichtSchneiden.length}, "schneiden": ${nach.schneiden.length}`);

await browser.close();
server.close();
process.exit(durchGesperrt ? 1 : 0);
