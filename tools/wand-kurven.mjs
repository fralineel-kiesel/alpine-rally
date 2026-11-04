// M10c.1: Wand-Exploit je Kurve messen:  node tools/wand-kurven.mjs [--strecke <id>] [--auto <id>] [--wurzel <ordner>] [--json <datei>]
// Für jede enge Kurve (Radius unter 60 m) mit einer Wand daneben (Leitplanke, Zaun, Geländer, Absperr-Wand, Felswand) fährt
// der Testfahrer (Tastatur-Lenkung wie Stil "digital") ein Stück von 150 m vor bis 100 m nach der Kurve mehrmals, nur in
// dieser Kurve mit immer höherem Kurventempo (Querbeschleunigung 6 = digital ... 40 = Stil "wand", fast kein Bremsen).
// Wert der Wand = schnellste Fahrt OHNE Wandkontakt minus schnellste Fahrt MIT Wandkontakt (beide ohne Aufprall an Bäumen
// usw., Stück fertig). Exploit = die Wand bringt mehr als 0.3 s. (Ohne Kontakt schneller als "digital" zu sein, ist kein
// Exploit: der Testfahrer plant Kurven vorsichtig.)
import fs from 'node:fs';
import path from 'node:path';
import { starteSpiel, WURZEL, AUTO } from './spiel-browser.mjs';
import { streckenWahl } from './strecke-erzeugt.mjs';

const arg = (n) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null; };
const wahl = streckenWahl();
const wurzel = arg('--wurzel') ? path.resolve(arg('--wurzel')) : WURZEL;
const datei = arg('--datei') || path.join(wurzel, 'strecken', `${wahl.id}.js`);
const inhalt = fs.readFileSync(datei, 'utf8');
const spiel = await starteSpiel({ wurzel });
await spiel.page.route('**/__strecke/**', (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: inhalt }));
await spiel.page.addInitScript((n) => { window.__streckeAdresse = `${location.origin}/__strecke/${n}`; }, path.basename(datei));
await spiel.page.goto(`${spiel.url}/index.html?menue=aus&ton=aus`);
await spiel.page.waitForFunction(() => window.__alpineRally, null, { timeout: 180000, polling: 100 });
const code = fs.readFileSync(path.join(WURZEL, 'tools/testfahrer-browser.js'), 'utf8');
const r = await spiel.page.evaluate(async (code) => {
  const f = await import(URL.createObjectURL(new Blob([code], { type: 'text/javascript' })));
  const A = window.__alpineRally, S = A.strecke, P = A.physik;
  A.anhalten = true;
  const pr = f.PROFILE.wand, basis = { ...f.PROFILE.digital };
  const voll = f.bauePfad(A, Array.from(S.px), Array.from(S.pz), basis);
  const ohneBremse = f.bauePfad(A, Array.from(S.px), Array.from(S.pz), pr);
  // Kurven: zusammenhängende Meter, an denen "wand" schneller fahren will als digital
  const kurven = []; let k0 = -1;
  for (let i = 0; i < voll.n; i++) {
    const anders = ohneBremse.vZiel[i] > voll.vZiel[i] + 0.5;
    if (anders && k0 < 0) k0 = i;
    if (!anders && k0 >= 0) { if (i - k0 >= 3) kurven.push([k0, i]); k0 = -1; }
  }
  const lauf = (vZ, a, b) => {
    const xs = Array.from(S.px.slice(a, b)), zs = Array.from(S.pz.slice(a, b));
    const p = f.bauePfad(A, xs, zs, basis);
    for (let i = 0; i < p.n; i++) p.vZiel[i] = vZ[a + i];
    const w0 = A.wand ? A.wand.einschlaege : 0, ws0 = A.wand ? A.wand.kontaktSchritte : 0;
    // je Schritt: Wandkontakt (alt: Material Metall/Holz oder Felswand-Nähe) und Aufprall an anderen Hindernissen
    const C = A.CONFIG, MAT = C.audio.aufprall.materialien, q = {};
    const wandMat = new Set(['metall', 'holz'].map((m) => MAT.indexOf(m)));
    let wandKontakt = false, baumAufprall = false; const einschlaege = [];
    const schritt = A.physikSchritt;
    A.physikSchritt = (dt, e, nf) => {
      const l0 = A.kollision.letzterAufprall;
      schritt(dt, e, nf);
      S.abfrage(P.x, P.z, q);
      const anFels = q.wandSeite !== 0 && q.wandStaerke > 0.5 && Math.sign(q.seite) === q.wandSeite && Math.abs(q.seite) > C.grenze.wandGrenze - 1.0;
      const wk = A.wand ? A.wand.kontakt : (wandMat.has(A.kollision.kontaktArt) || anFels);
      if (A.wand && A.wand.strafe) einschlaege.push(`${Math.round(A.wand.letzter.winkel)}° ${Math.round(A.wand.letzter.vorher * 3.6)}->${Math.round(A.wand.letzter.nachher * 3.6)}`);
      if (wk) wandKontakt = true;
      else if (A.kollision.letzterAufprall !== l0) baumAufprall = true;
    };
    let e;
    try { e = f.fahreStueck(A, p, p.n - 5); } finally { A.physikSchritt = schritt; }
    return { zeit: e.zeit, fertig: e.fertig, wandKontakt, einschlaege, baumAufprall, gras: e.gras, strafen: A.wand ? A.wand.einschlaege - w0 : null, kontakt: A.wand ? (A.wand.kontaktSchritte - ws0) * A.SCHRITT : null };
  };
  const out = [];
  for (const [a, b] of kurven) {
    const von = Math.max(1, a - 150), bis = Math.min(S.anzahl - 2, b + 100);
    const versuche = [];
    for (const qk of [6, 7, 8, 9, 10, 11, 12, 14, 17, 20, 25, 30, 40]) {
      const vz = f.bauePfad(A, Array.from(S.px), Array.from(S.pz), { ...pr, wandQuer: qk, nurBereich: [a - 10, b + 10] }).vZiel;
      versuche.push({ quer: qk, ...lauf(vz, von, bis) });
    }
    // Kontakt: in 0.10c über das Material (Metall/Holz) bzw. die Felswand-Nähe, ab 0.10c.1 über A.wand
    const ok = versuche.filter((v) => v.fertig && !v.baumAufprall);
    const ohne = ok.filter((v) => !v.wandKontakt), mit = ok.filter((v) => v.wandKontakt);
    const best = (l) => l.reduce((m, v) => (!m || v.zeit < m.zeit ? v : m), null);
    const bo = best(ohne), bm = best(mit);
    out.push({ s: a, bis: b, ohne: bo, mit: bm, gewinn: bo && bm ? bo.zeit - bm.zeit : 0, versuche });
  }
  return { kurven: out, laenge: S.laenge };
}, code);
await spiel.schliessen();
const zz = (v) => (v ? `${v.zeit.toFixed(2)} s (quer ${v.quer}${v.strafen != null && v.wandKontakt ? `, ${v.strafen} Strafen ${v.einschlaege.join(' ')}, ${v.kontakt.toFixed(2)} s an der Wand` : ''})` : '–');
const ex = r.kurven.filter((k) => k.gewinn > 0.3);
const z = r.kurven.map((k) => `${String(k.s).padStart(5)}–${String(k.bis).padEnd(5)} m: ohne Wand ${zz(k.ohne)}, mit Wand ${zz(k.mit)} -> Wand bringt ${k.gewinn >= 0 ? '+' : ''}${k.gewinn.toFixed(2)} s${k.gewinn > 0.3 ? '  EXPLOIT' : ''}`);
console.log(`${wahl.id} ${AUTO} (${path.basename(wurzel)}): ${r.kurven.length} Wand-Kurven, Exploit (mehr als 0.3 s): ${ex.length}${ex.length ? ` – ${ex.map((k) => `${k.s} m +${k.gewinn.toFixed(2)} s`).join(', ')}` : ''}`);
console.log(z.join('\n'));
if (arg('--json')) fs.writeFileSync(arg('--json'), JSON.stringify(r, null, 1));
