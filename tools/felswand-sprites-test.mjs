// Felswand-Test 2 (Meilenstein 5a.1): Steht etwas im Fels? Wirft die Wand das Auto?
//
//   node tools/felswand-sprites-test.mjs                    dieses Projekt
//   node tools/felswand-sprites-test.mjs --wurzel <ordner>  eine andere (z. B. alte) Version messen
//   --nur a  /  --nur b                                    nur einen Teil
//
// (a) Objekte im Fels: Alle platzierten Objekte aller Sorten (Tannen, Laubbäume, Steine, Felsbrocken, Stämme,
//     Büsche, Grasbüschel, Jungtannen, Fernwald, Nebenweg-Wald, Sichtschutz, Strassenrand, Kühe, Leben, Start/Ziel,
//     Absperrungen) werden geprüft: Senkrechter Strahl von oben auf das echte Felswand-Mesh, an der Mitte und
//     rundherum am Stamm. Liegt die Felsfläche höher als das Gelände (Toleranz 5 cm), steckt das Objekt im Fels.
//     Unabhängig davon, welcher Strassenpunkt der nächste ist (gezählt werden auch die Grenzfälle: nächster
//     Punkt ohne Wand, aber ±30 m daneben eine).
// (b) Wurf-Test: Das Auto fährt neben der Strasse (Wandseite, 8 / 12 / 18 m neben der Mitte) mit 30 / 60 / 100
//     km/h unter 0° / 15° / 45° auf den Anfang und das Ende jeder Wand zu. Gemessen: Verschiebung pro Schritt
//     (nie mehr als Tempo mal Schrittzeit plus einen kleinen Wert) und ob es wegen der Wand auf die Strasse kommt.
//     Dazu von der Strasse her gegen die Wand (wie bisher: stoppt an der sichtbaren Fläche).
// Das Spiel selbst lädt diese Datei nicht.

import path from 'node:path';
import { starteSpiel, WURZEL } from './spiel-browser.mjs';

const arg = (name) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : null; };
const wurzel = arg('--wurzel') ? path.resolve(arg('--wurzel')) : WURZEL;
const nur = arg('--nur');
const spiel = await starteSpiel({ wurzel });
await spiel.ladeSpiel();
const page = spiel.page;
let fehler = 0;
const pruefe = (ok, text) => { console.log(`  ${ok ? 'OK    ' : 'FEHLER'} ${text}`); if (!ok) fehler++; };
console.log(`Version: ${wurzel === WURZEL ? 'dieses Projekt' : wurzel}`);

// Wand-Abschnitte (aus den Streckendaten)
const abschnitte = await page.evaluate(() => {
  const S = window.__alpineRally.strecke, ab = [];
  let cur = null;
  for (let i = 0; i < S.anzahl; i++) {
    const ws = S.wandSeite[i];
    if (ws && (!cur || cur.ws !== ws)) { cur = { ws, von: S.s[i], bis: S.s[i], iVon: i, iBis: i }; ab.push(cur); } else if (ws) { cur.bis = S.s[i]; cur.iBis = i; } else cur = null;
  }
  return ab;
});
console.log('\nWand-Abschnitte (Strecke, Meter):');
for (const a of abschnitte) console.log(`  ${a.ws < 0 ? 'links ' : 'rechts'} ${a.von.toFixed(0)}–${a.bis.toFixed(0)} m (ein- und ausgeblendet über je 25 m)`);

// =====================================================================================================
// (a) Objekte im Fels
// =====================================================================================================
if (!nur || nur === 'a') {
  const a = await page.evaluate(() => {
    const A = window.__alpineRally, S = A.strecke, W = A.welt, T = A.THREE, C = A.CONFIG;
    let wand = W.felswandMesh;
    if (!wand) A.szene.traverse((o) => { if (!wand && o.isMesh && o.material.vertexColors && o.material.flatShading && o.material.side === T.DoubleSide) wand = o; });
    wand.updateMatrixWorld(true);
    const ray = new T.Raycaster(), o = new T.Vector3(), d = new T.Vector3(0, -1, 0);
    // Höhe der Felsfläche an (x, z): senkrechter Strahl von oben auf das echte Mesh (höchster Treffer)
    const fels = (x, z) => {
      o.set(x, 3000, z); ray.set(o, d); ray.far = 6000;
      const t = ray.intersectObject(wand, false);
      return t.length ? t[0].point.y : -Infinity;
    };
    // Wandpunkte (alle 2 m ein Querschnitt) für die schnelle Vorauswahl: nur Objekte bis 30 m an einer Wand prüfen
    const wp = [];
    for (let i = 0; i < S.anzahl; i += 2) if (S.wandSeite[i]) wp.push([S.px[i], S.pz[i]]);
    const nahWand = (x, z) => wp.some(([px, pz]) => (px - x) ** 2 + (pz - z) ** 2 < 30 * 30);
    const STAMM = [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1], [0.71, 0.71], [-0.71, 0.71], [0.71, -0.71], [-0.71, -0.71]];
    const imFels = (x, z, r) => {
      if (!nahWand(x, z)) return null;
      let tief = -Infinity;
      for (const [a, b] of STAMM) {
        const px = x + a * r, pz = z + b * r;
        tief = Math.max(tief, fels(px, pz) - W.gelaendeHoehe(px, pz));
        if (r === 0) break;
      }
      return tief;
    };
    const q = {};
    // Grenzfall: nächster Strassenpunkt hat keine Wand (oder Wand auf der anderen Seite), aber ±30 m daneben eine
    const grenzfall = (x, z) => {
      S.abfrage(x, z, q);
      if (q.wandSeite && Math.sign(q.seite) === q.wandSeite && q.wandStaerke > 0.05) return false;
      for (let k = Math.max(0, q.i - 30); k <= Math.min(S.anzahl - 1, q.i + 30); k++) if (S.wandSeite[k]) return true;
      return false;
    };
    const P = A.pflanzen, D = A.deko, K = C.kollision;
    const sorten = [];
    const sorte = (name, liste, radius) => sorten.push({ name, liste: liste || [], radius });
    const baum = (t) => K.stammRadius;
    sorte('Tannen (Wald)', P.tannen.filter((t) => !t.sichtschutz && !t.nebenwegWald && !t.sperre), baum);
    sorte('Tannen (Nebenweg-Wald)', P.tannen.filter((t) => t.nebenwegWald), baum);
    sorte('Tannen (Sichtschutz Stummel)', P.tannen.filter((t) => t.sichtschutz), baum);
    sorte('Laubbäume', P.laubbaeume, baum);
    sorte('Steine', P.steine.filter((t) => !t.nebenwegWald), (t) => t.b * K.steinFaktor);
    sorte('Steine (Nebenweg-Wald)', P.steine.filter((t) => t.nebenwegWald), (t) => t.b * K.steinFaktor);
    sorte('Felsbrocken (Sperren)', P.felsbrocken, (t) => t.b * K.steinFaktor);
    // Stämme: Punkte entlang des Stamms
    const staemme = [];
    for (const s of P.staemme || []) for (let f = -0.5; f <= 0.5; f += 0.125) staemme.push({ x: s.x + s.dx * s.laenge * f, z: s.z + s.dz * s.laenge * f, r: s.r });
    sorte('Stämme (Sperren)', staemme, (t) => t.r);
    sorte('Büsche', D.buesche.filter((b) => !b.gras), (t) => Math.min(0.35, t.b * 0.3));
    sorte('Grasbüschel', D.buesche.filter((b) => b.gras), (t) => Math.min(0.35, t.b * 0.3));
    sorte('Jungtannen', D.jungTannen, () => 0.25);
    sorte('Fernwald', D.fernbaeume, baum);
    sorte('Strassenrand (Pfosten, Schilder)', A.strassenrand.hindernisse, (t) => t.r);
    sorte('Kühe', A.kuehe.kuehe, (t) => t.r || 0.6);
    sorte('Leben (Fan-Spots, Alpweide, Wracks)', A.leben.hindernisse, (t) => t.r);
    sorte('Leben: Figuren', A.leben.figuren, () => 0.25);
    sorte('Leben: Büsche', A.leben.buesche, () => 0.3);
    sorte('Start/Ziel', [...A.startZiel.hindernisse, ...A.startZiel.zuschauer, ...A.startZiel.tannen, ...A.startZiel.laub, ...A.startZiel.buesche], (t) => t.r || 0.3);
    sorte('Absperrungen', [...A.absperrungen.hindernisse, ...A.absperrungen.tafeln], (t) => t.r || 0.3);
    const erg = [];
    let gesamt = 0, geprueft = 0, grenz = 0, abweichung = 0;
    for (const s of sorten) {
      const r = { name: s.name, anzahl: s.liste.length, nah: 0, grenz: 0, drin: [] };
      for (const t of s.liste) {
        gesamt++;
        const tief = imFels(t.x, t.z, s.radius(t));
        if (tief == null) continue;
        r.nah++; geprueft++;
        if (grenzfall(t.x, t.z)) { r.grenz++; grenz++; }
        const drin = tief > 0.05;
        if (drin) {
          S.abfrage(t.x, t.z, q);
          r.drin.push({ s: Math.round(q.s), seite: Math.round(q.seite * 10) / 10, tief: Math.round(tief * 100) / 100, x: Math.round(t.x * 10) / 10, z: Math.round(t.z * 10) / 10 });
        }
        // Gegenprobe: welt.imFels (gleiche Dreiecke, eigene Suche) muss dasselbe sagen
        if (W.imFels && W.imFels(t.x, t.z, s.radius(t)) !== drin) abweichung++;
      }
      erg.push(r);
    }
    return { erg, gesamt, geprueft, grenz, abweichung, hatImFels: !!W.imFels };
  });
  console.log('\n(a) Objekte im Fels (senkrechter Strahl auf das echte Felswand-Mesh, Mitte und Stamm rundherum):');
  let summe = 0;
  for (const r of a.erg) {
    summe += r.drin.length;
    const bsp = r.drin.slice(0, 6).map((d) => `${d.s} m/${d.seite} m (${d.tief} m)`).join(', ');
    console.log(`  ${r.name.padEnd(36)} ${String(r.anzahl).padStart(5)} gesamt, ${String(r.nah).padStart(4)} nahe Wand (${r.grenz} Grenzfälle): ${r.drin.length} im Fels${bsp ? `  z. B. ${bsp}` : ''}`);
  }
  console.log(`  geprüft: ${a.gesamt} Objekte, davon ${a.geprueft} bis 30 m an einer Wand, ${a.grenz} Grenzfälle (nächster Strassenpunkt ohne Wand, ±30 m daneben eine)`);
  pruefe(summe === 0, `kein Objekt steht im Fels oder ragt mit dem Stamm hinein (${summe} gefunden)`);
  if (a.hatImFels) pruefe(a.abweichung === 0, `welt.imFels sagt dasselbe wie der Strahl auf das Mesh (${a.abweichung} Abweichungen)`);
}

// =====================================================================================================
// (b) Wurf-Test
// =====================================================================================================
if (!nur || nur === 'b') {
  const b = await page.evaluate((abschnitte) => {
    const A = window.__alpineRally, S = A.strecke, P = A.physik, W = A.welt, dt = A.SCHRITT;
    const q = {};
    // Korrekturen mitschreiben, die zur Strasse hin schieben (anGrenze: n zeigt in die Grenze, das Auto geht -n)
    const orig = P.anGrenze, origK = A.kollision.loese;
    // Bäume und Steine (nicht die Wand) dürfen das Auto verschieben: das zählt nicht als Sprung
    let baumX = 0, baumZ = 0;
    A.kollision.loese = function (...arg) { const x = P.x, z = P.z; const r = origK.apply(this, arg); baumX += P.x - x; baumZ += P.z - z; return r; };
    let schub = 0, zurStrasse = { x: 0, z: 0 };
    P.anGrenze = function (nx, nz, ueber) {
      const w = -(nx * zurStrasse.x + nz * zurStrasse.z) * ueber; // Anteil der Verschiebung zur Strasse hin
      if (w > schub) schub = w;
      return orig.call(this, nx, nz, ueber);
    };
    const GAS = { gas: 1, bremse: 0, lenkung: 0, handbremse: false, reset: false, debug: false, notes: false };
    // Wie tief steckt die Karosserie (Umriss 4.48 x 1.86 m) von der Wiese her im Fels? Kürzester Weg (waagrecht)
    // von einem Umriss-Punkt aus dem Fels heraus (Fels = Felsfläche höher als Boden + 10 cm)
    const imF = (x, z) => W.felsHoehe && W.felsHoehe(x, z) > W.bodenBei(x, z).h + 0.1;
    const tiefe = (x, z) => {
      if (!imF(x, z)) return 0;
      for (let r = 0.05; r < 5; r += 0.05) for (let k = 0; k < 24; k++) { const w = (k / 24) * Math.PI * 2; if (!imF(x + Math.cos(w) * r, z + Math.sin(w) * r)) return r; }
      return 5;
    };
    const umrissTiefe = () => {
      const f = [Math.sin(P.richtung), Math.cos(P.richtung)], l = [Math.cos(P.richtung), -Math.sin(P.richtung)];
      let m = 0;
      for (let k = 0; k <= 8; k++) for (const b of [-1, 1]) { const a = -1 + k / 4; m = Math.max(m, tiefe(P.x + f[0] * a * 2.24 + l[0] * b * 0.93, P.z + f[1] * a * 2.24 + l[1] * b * 0.93)); }
      for (const b of [-0.5, 0, 0.5]) for (const a of [-1, 1]) m = Math.max(m, tiefe(P.x + f[0] * a * 2.24 + l[0] * b * 0.93, P.z + f[1] * a * 2.24 + l[1] * b * 0.93));
      return m;
    };
    // Eine Fahrt: Start bei Strecke s0, seitlich lat (Wandseite positiv), Richtung = Strasse (rueck: gegen die
    // Strasse) um winkel zur Strasse hin gedreht; Tempo v (m/s), Vollgas, nicht lenken, dauer Sekunden.
    function fahrt(ws, sZiel, lat, winkel, v, rueck, ohneWand) {
      const d = 35, w = (winkel * Math.PI) / 180, r = rueck ? -1 : 1;
      const p = S.punktBei(sZiel - r * d * Math.cos(w));
      const latStart = lat + d * Math.sin(w);
      const rx = -p.tz * ws, rz = p.tx * ws; // zur Wand hin
      const blick = Math.atan2(p.tx * r, p.tz * r) + (r * ws * w); // zur Strasse hin gedreht
      A.setzeAuf(S.s[p.i], 0);
      P.reset(p.x + rx * latStart, p.z + rz * latStart, blick);
      P.vx = Math.sin(blick) * v; P.vz = Math.cos(blick) * v;
      A.getriebe.reset();
      const alt = { wk: W.wandKante, fh: W.felsHoehe, imf: W.imFels };
      if (ohneWand) { W.wandKante = () => Infinity; if (W.felsHoehe) W.felsHoehe = () => -Infinity; }
      const e = { maxUeber: -Infinity, maxSchub: 0, strasseNach: null, minSeite: Infinity, steht: false, endeLat: 0, endeS: 0, imFels: 0 };
      let x = P.x, z = P.z, t = 0;
      for (; t < 3.5; t += dt) {
        const v0 = P.tempo;
        S.abfrage(P.x, P.z, q);
        zurStrasse = { x: q.tz * ws, z: -q.tx * ws };
        schub = 0; baumX = 0; baumZ = 0;
        A.physikSchritt(dt, GAS, true);
        const weg = Math.hypot(P.x - x - baumX, P.z - z - baumZ);
        e.maxUeber = Math.max(e.maxUeber, weg - Math.max(v0, P.tempo) * dt);
        e.maxSchub = Math.max(e.maxSchub, schub);
        x = P.x; z = P.z;
        S.abfrage(P.x, P.z, q);
        const seite = q.seite * ws; // + = Wandseite
        e.minSeite = Math.min(e.minSeite, seite);
        if (seite < 4.5 && e.strasseNach == null) e.strasseNach = t;
        if (!ohneWand && Math.round(t / dt) % 6 === 0) e.imFels = Math.max(e.imFels, umrissTiefe());
      }
      S.abfrage(P.x, P.z, q);
      e.endeLat = q.seite * ws; e.endeS = q.s; e.endeTempo = P.tempo * 3.6;
      Object.assign(W, { wandKante: alt.wk });
      if (alt.fh) W.felsHoehe = alt.fh;
      return e;
    }
    const zeilen = [];
    for (const a of abschnitte) {
      for (const [ende, sZiel, rueck] of [['Anfang', a.von + 4, false], ['Ende', a.bis - 4, true]]) {
        for (const lat of [8, 12, 18]) {
          for (const kmh of [30, 60, 100]) {
            for (const winkel of [0, 15, 45]) {
              const mit = fahrt(a.ws, sZiel, lat, winkel, kmh / 3.6, rueck, false);
              const ohne = fahrt(a.ws, sZiel, lat, winkel, kmh / 3.6, rueck, true);
              // "nur wegen der Wand auf der Strasse": mit Wand auf der Strasse, ohne Wand nie (in 3.5 s)
              const wegenWand = mit.strasseNach != null && ohne.strasseNach == null;
              const frueher = mit.strasseNach != null && ohne.strasseNach != null && mit.strasseNach < ohne.strasseNach - 0.05;
              zeilen.push({ wand: `${a.ws < 0 ? 'links' : 'rechts'} ${Math.round(a.von)}`, ende, lat, kmh, winkel, maxUeber: mit.maxUeber, maxSchub: mit.maxSchub,
                strasse: mit.strasseNach, strasseOhne: ohne.strasseNach, wegenWand, frueher, imFels: mit.imFels, endeLat: mit.endeLat, endeS: mit.endeS, endeTempo: mit.endeTempo });
            }
          }
        }
      }
    }
    P.anGrenze = orig; A.kollision.loese = origK;
    return zeilen;
  }, abschnitte);
  console.log('\n(b) Wurf-Test: von der Wiese (Wandseite) auf Anfang und Ende jeder Wand, Vollgas, nicht lenken, 3.5 s:');
  console.log('    (Sprung = Weg in einem Schritt minus Tempo mal Schrittzeit; Schub = grösste Korrektur zur Strasse hin in einem Schritt)');
  const cmz = (m) => `${(m * 100).toFixed(1)} cm`;
  for (const w of [...new Set(b.map((z) => `${z.wand} ${z.ende}`))]) {
    const g = b.filter((z) => `${z.wand} ${z.ende}` === w);
    const sp = g.reduce((m, z) => Math.max(m, z.maxUeber), -Infinity), sc = g.reduce((m, z) => Math.max(m, z.maxSchub), 0);
    const ww = g.filter((z) => z.wegenWand), fr = g.filter((z) => z.frueher);
    const bsp = (l) => l.slice(0, 3).map((z) => `${z.lat} m/${z.kmh} km/h/${z.winkel}° nach ${z.strasse.toFixed(2)} s (ohne Wand ${z.strasseOhne == null ? 'nie' : z.strasseOhne.toFixed(2) + ' s'})`).join(', ');
    console.log(`  ${w.padEnd(20)} ${g.length} Fahrten: grösster Sprung ${cmz(sp)}, grösster Schub ${cmz(sc)}, nur wegen der Wand auf der Strasse: ${ww.length}` +
      (ww.length ? `  z. B. ${bsp(ww)}` : '') + (fr.length ? `; früher auf der Strasse als ohne Wand (fährt sowieso hin): ${fr.length}, z. B. ${bsp(fr)}` : ''));
  }
  const schlimm = [...b].sort((x, y) => y.maxUeber - x.maxUeber).slice(0, 4);
  console.log(`  grösste Sprünge: ${schlimm.map((z) => `${z.wand} ${z.ende} ${z.lat} m ${z.kmh} km/h ${z.winkel}°: ${cmz(z.maxUeber)}`).join('; ')}`);
  const maxSprung = Math.max(...b.map((z) => z.maxUeber));
  pruefe(maxSprung <= 0.05, `nie ein Sprung: Weg pro Schritt höchstens Tempo mal Schrittzeit + 5 cm (grösster Überschuss ${cmz(maxSprung)}, ${b.length} Fahrten)`);
  const ww = b.filter((z) => z.wegenWand).length;
  pruefe(ww === 0, `das Auto landet nie nur wegen der Wand auf der Strasse (${ww} von ${b.length} Fahrten)`);
  const tf = b.map((z) => z.imFels).sort((x, y) => x - y);
  const tfMax = b.reduce((m, z) => (z.imFels > m.imFels ? z : m), b[0]);
  console.log(`  Karosserie im Fels (von der Wiese her, waagrecht gemessen): Median ${cmz(tf[Math.floor(tf.length / 2)])}, 90 % höchstens ${cmz(tf[Math.floor(tf.length * 0.9)])}, ` +
    `am meisten ${cmz(tfMax.imFels)} (${tfMax.wand} ${tfMax.ende} ${tfMax.lat} m ${tfMax.kmh} km/h ${tfMax.winkel}°)`);
  const steht = b.filter((z) => z.endeLat > 4.5).length;
  console.log(`  am Ende neben der Strasse (Wandseite): ${steht} von ${b.length} Fahrten; Rest ist (auch ohne Wand) auf die Strasse gefahren`);
}

if (spiel.fehler.length) pruefe(false, `Fehler in der Browser-Konsole: ${spiel.fehler.length}`);
console.log(fehler ? `\n${fehler} Prüfung(en) NICHT erfüllt.` : '\nAlle Prüfungen erfüllt.');
await spiel.schliessen();
process.exit(fehler ? 1 : 0);
