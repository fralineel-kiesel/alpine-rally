// Meilenstein 8h prüfen:  node tools/m8h-test.mjs [--nur a,b,c,...] [--alt <ordner 0.8g>] [--lang]
//   Teil A – Speicher (js/bestzeiten.js):
//   (a) Übernahme mit erfundenen Altdaten (gemischte Autos, ohne Id, prototyp, ohne Spur, mehr als 10 von einem Auto,
//       gleiche Zeiten): richtige Verteilung, Gesamt richtig, alter Schlüssel bitgleich unverändert
//   (b) zweimal übernehmen ohne Doppelungen; danach gilt der neue Schlüssel
//   (c) speichern: Platz je Auto, gesamtPlatz, gesamtBisher, Top 10 je Auto, elfte Zeit, Gleichstand
//   (d) Gesamt-Top-3 mit einem Auto auf allen drei Plätzen
//   (e) Speicher blockiert, kaputtes JSON, Speicher voll; geschätzte Speichergrösse
//   (f) loescheBestzeiten löscht beide Schlüssel
//   (g) die alten Aufrufe in rennablauf-test, overlay-test, m8c-test bleiben grün (ruft die Tests auf, dauert)
//   Teil B – Live-Vergleich und Zielbildschirm je Auto:
//   (h) Referenz je Auto (Audan-Bestzeit trägt nicht in den Delto-Vergleich; Auto ohne Zeit = keine Referenz; Garage lädt nach)
//   (i) Zielbildschirm: Titel, Zeilen, Farben für alle Fälle, Fanfare, Layout in drei Auflösungen, de/en; Einstellungstext
//   (j) Live-Vergleich mit Auto-Referenz über echte Testfahrer-Läufe: Anzeige stimmt, Zeit unverändert
// Die Übernahme ist mit erfundenen Altdaten geprüft, nicht mit echten Browser-Daten von Lino.

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { starteSpiel, WURZEL } from './spiel-browser.mjs';

const arg = (name) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : null; };
const NUR = arg('--nur') ? arg('--nur').split(',') : null;
const teil = (k) => !NUR || NUR.includes(k);
let fehler = 0;
const melde = (ok, text) => { console.log(`${ok ? '  ok  ' : 'FEHLER'} ${text}`); if (!ok) fehler++; };
const info = (text) => console.log(`       ${text}`);
const ALT_KEY = 'alpineRally.bestzeiten', NEU_KEY = 'alpineRally.bestzeiten2';
const werkzeug = (name, argumente = [], timeout = 6 * 3600000, wurzel = WURZEL) => {
  const r = spawnSync(process.execPath, [path.join(wurzel, 'tools', name), ...argumente], { encoding: 'utf8', timeout, maxBuffer: 64 * 1024 * 1024, cwd: wurzel });
  return { code: r.status, text: `${r.stdout || ''}${r.stderr || ''}` };
};

// Eine leichte Seite (ohne Spiel) auf demselben Server: dort wird js/bestzeiten.js direkt geladen
async function speicherSeite() {
  const s = await starteSpiel({ breite: 320, hoehe: 180 });
  await s.page.goto(`${s.url}/tools/m8h-test.mjs`);
  return s;
}
const imBrowser = (s, fn, a) => s.page.evaluate(fn, a);

// Erfundene Altdaten (Format bis 0.8g, eine gemeinsame Liste; absichtlich auch mehr als 10 Einträge)
const SPUR = Array.from({ length: 367 }, (_, i) => Math.round(i * 0.47 * 100) / 100);
const tag = (n) => `2026-10-${String(n).padStart(2, '0')}T12:00:00.000Z`;
const ALTDATEN = {
  passstrasse: [
    ...Array.from({ length: 12 }, (_, i) => ({ zeit: 160 + i, cps: [30, 90, 140], datum: tag(1 + i), auto: 'rt4', aufpralle: i, resets: 0, hoechstTempo: 50, spur: SPUR })),
    { zeit: 158.5, cps: [29, 88, 139], datum: tag(14), auto: 'delto', aufpralle: 0, resets: 0, hoechstTempo: 49, spur: SPUR },
    { zeit: 165.004, cps: [31, 91, 141], datum: tag(15), auto: 'escorta', aufpralle: 1, resets: 1, hoechstTempo: 47 }, // ohne Spur
    { zeit: 150.2, cps: [28, 85, 132], datum: tag(16), auto: 'l073', aufpralle: 0, resets: 0, hoechstTempo: 52, spur: SPUR },
    { zeit: 150.209, cps: [28, 85, 132], datum: tag(17), auto: 'imprexa', aufpralle: 0, resets: 0, hoechstTempo: 51, spur: SPUR }, // gleich wie l073 (Hundertstel)
    { zeit: 155, cps: [29, 87, 135], datum: tag(13) }, // ganz altes Format: ohne Auto, ohne Spur
    { zeit: 157, cps: [29, 87, 136], datum: tag(18), auto: 'prototyp', spur: SPUR },
    { zeit: 152, cps: [28, 86, 133], datum: tag(19), auto: 'rallye9000' }, // unbekannte Id
    { zeit: 'kaputt', cps: [] }, // kein gültiger Eintrag: fällt weg
  ],
  andere: [{ zeit: 199, cps: [], datum: null, auto: 'delto' }],
};

// =====================================================================
if (teil('a') || teil('b')) {
  console.log('(a) Übernahme der alten Bestzeiten, (b) zweimal übernehmen');
  const s = await speicherSeite();
  const r = await imBrowser(s, async ([alt, ALT_KEY, NEU_KEY]) => {
    localStorage.clear();
    const roh = JSON.stringify(alt);
    localStorage.setItem(ALT_KEY, roh);
    const B = await import('/js/bestzeiten.js');
    const kurz = (l) => l.map((e) => `${e.zeit}/${e.auto}`);
    const autos = ['rt4', 'delto', 'escorta', 'l073', 'imprexa'];
    const je = Object.fromEntries(autos.map((a) => [a, kurz(B.ladeBestzeiten('passstrasse', a))]));
    const ohne = kurz(B.ladeBestzeiten('passstrasse', 'prototyp'));
    const gesamt = kurz(B.ladeGesamtTop('passstrasse'));
    const gesamt10 = kurz(B.ladeBestzeiten('passstrasse'));
    const andere = kurz(B.ladeBestzeiten('andere', 'delto'));
    const neuRoh1 = localStorage.getItem(NEU_KEY);
    const altNach = localStorage.getItem(ALT_KEY);
    const escorta = B.ladeBestzeiten('passstrasse', 'escorta')[0];
    const rt4erst = B.ladeBestzeiten('passstrasse', 'rt4')[0];
    // (b) mehrfach lesen: nichts doppelt; neuen Schlüssel weg -> nochmals übernehmen: gleiches Ergebnis
    for (let i = 0; i < 5; i++) B.ladeBestzeiten('passstrasse', 'rt4');
    const neuRoh2 = localStorage.getItem(NEU_KEY);
    localStorage.removeItem(NEU_KEY);
    const nochmal = kurz(B.ladeBestzeiten('passstrasse'));
    const neuRoh3 = localStorage.getItem(NEU_KEY);
    // danach gilt der neue Schlüssel: Änderungen am alten werden nicht mehr übernommen
    localStorage.setItem(ALT_KEY, JSON.stringify({ passstrasse: [{ zeit: 100, cps: [], auto: 'delto' }] }));
    const nachAltAenderung = kurz(B.ladeBestzeiten('passstrasse', 'delto'));
    localStorage.setItem(ALT_KEY, roh);
    // ohne alte Zeiten wird nichts geschrieben
    localStorage.clear();
    const leer = B.ladeBestzeiten('passstrasse').length, leerKey = localStorage.getItem(NEU_KEY);
    return { je, ohne, gesamt, gesamt10, andere, neu1: neuRoh1, altGleich: altNach === roh, escorta, rt4erst, neu2: neuRoh2, nochmal, neu3: neuRoh3, nachAltAenderung, leer, leerKey };
  }, [ALTDATEN, ALT_KEY, NEU_KEY]);
  if (teil('a')) {
    melde(r.je.rt4.length === 10 && r.je.rt4[0] === '160/rt4' && r.je.rt4[9] === '169/rt4',
      `Audan: 12 alte Einträge -> die schnellsten 10 (${r.je.rt4[0]} … ${r.je.rt4[9]})`);
    melde(r.je.delto.join() === '158.5/delto' && r.je.escorta.join() === '165.004/escorta' && r.je.l073.join() === '150.2/l073' && r.je.imprexa.join() === '150.209/imprexa',
      `je Auto richtig verteilt: Delto ${r.je.delto}, Escorta ${r.je.escorta}, Lanza ${r.je.l073}, Subora ${r.je.imprexa}`);
    melde(r.ohne.join() === '152/rallye9000,155/null,157/prototyp',
      `ohne gültige Id (fehlt, prototyp, unbekannt) im Behälter "_ohne": ${r.ohne.join(', ')}`);
    melde(r.gesamt.join() === '150.2/l073,150.209/imprexa,152/rallye9000',
      `Gesamt-Top-3 über alle (Gleichstand l073/imprexa in Hundertsteln: die ältere vorn): ${r.gesamt.join(', ')}`);
    melde(r.gesamt10.length === 10 && r.gesamt10[3] === '155/null' && r.gesamt10[9] === '163/rt4',
      `ohne Auto: Gesamtliste mit 10 Einträgen (alte Bedeutung): ${r.gesamt10.join(', ')}`);
    melde(r.andere.join() === '199/delto', 'andere Etappe getrennt übernommen');
    melde(r.altGleich, 'alter Schlüssel nach der Übernahme bitgleich unverändert');
    melde(!!r.neu1 && r.escorta.spur === null && Array.isArray(r.rt4erst.spur) && r.rt4erst.spur.length === 367 && r.rt4erst.datum === '2026-10-01T12:00:00.000Z',
      `neuer Schlüssel geschrieben (${(r.neu1 || '').length} Zeichen); Spur, Datum übernommen, Eintrag ohne Spur gelesen`);
  }
  if (teil('b')) {
    melde(r.neu2 === r.neu1, '5x lesen: neuer Schlüssel unverändert (nichts doppelt)');
    melde(r.neu3 === r.neu1 && r.nochmal.join() === r.gesamt10.join(), 'neuer Schlüssel weg -> nochmals übernommen: genau dasselbe Ergebnis');
    melde(r.nachAltAenderung.join() === '158.5/delto', 'danach gilt der neue Schlüssel (spätere Änderung am alten wird nicht übernommen)');
    melde(r.leer === 0 && r.leerKey === null, 'ohne alte Zeiten: leer, nichts geschrieben');
  }
  melde(s.fehler.length === 0, `keine Fehler in der Konsole ${s.fehler.join(' | ')}`);
  await s.schliessen();
}

// =====================================================================
if (teil('c') || teil('d')) {
  console.log('(c) Speichern je Auto, (d) Gesamt-Top-3');
  const s = await speicherSeite();
  const r = await imBrowser(s, async () => {
    localStorage.clear();
    const B = await import('/js/bestzeiten.js');
    const E = (zeit, auto) => ({ zeit, cps: [zeit * 0.2, zeit * 0.5, zeit * 0.9], auto, aufpralle: 0, resets: 0, hoechstTempo: 40 });
    const S = (zeit, auto) => { const e = B.speichereBestzeit('passstrasse', E(zeit, auto)); return { ...e, bisher: e.bisher && e.bisher.zeit, gesamtBisher: e.gesamtBisher && e.gesamtBisher.zeit }; };
    const out = {};
    out.erst = S(170, 'rt4');                  // erste Zeit überhaupt
    out.rt4b = S(165, 'rt4');                  // neue Bestzeit Audan, auch Gesamtrekord
    out.deltoErst = S(175, 'delto');           // erste Zeit Delto (langsamer als Audan): Gesamtplatz 2
    out.deltoSchneller = S(160, 'delto');      // neue Delto-Bestzeit, schneller als Audan: Gesamtrekord
    out.esc = S(190, 'escorta');               // nicht in der Gesamt-Top-3
    out.proto = S(150, 'prototyp');            // ohne Auto: nur Gesamt
    out.nachProto = S(158, 'l073');            // Gesamtplatz 2 (hinter prototyp)
    // Top 10 je Auto: Audan bis 10 auffüllen, dann die elfte (schneller als der langsamste) und eine zu langsame
    for (const z of [180, 181, 182, 183, 184, 185, 186, 187]) S(z, 'rt4');
    out.rt4voll = B.ladeBestzeiten('passstrasse', 'rt4').map((e) => e.zeit);
    out.elf = S(175.5, 'rt4');
    out.rt4elf = B.ladeBestzeiten('passstrasse', 'rt4').map((e) => e.zeit);
    out.zuLangsam = S(200, 'rt4');
    // Gleichstand in Hundertsteln: die ältere vorn (auch über Autos in der Gesamtliste)
    out.gleich = S(165.004, 'rt4');
    out.rt4gleich = B.ladeBestzeiten('passstrasse', 'rt4').slice(0, 3).map((e) => e.zeit);
    out.deltoListe = B.ladeBestzeiten('passstrasse', 'delto').map((e) => e.zeit);
    out.gesamt = B.ladeGesamtTop('passstrasse').map((e) => `${e.zeit}/${e.auto}`);
    out.gesamt10 = B.ladeBestzeiten('passstrasse').map((e) => e.zeit);
    // Gleichstand über zwei Autos: imprexa fährt 158.003 (= l073 158.00 in Hundertsteln): kommt hinter l073
    out.gleichGesamt = S(158.003, 'imprexa');
    out.gesamtGleich = B.ladeGesamtTop('passstrasse').map((e) => `${e.zeit}/${e.auto}`);
    // (d) ein Auto auf allen drei Gesamtplätzen
    localStorage.clear();
    S(170, 'delto'); S(180, 'rt4');
    out.d1 = S(150, 'l073'); out.d2 = S(151, 'l073'); out.d3 = S(152, 'l073'); out.d4 = S(153, 'l073');
    out.dGesamt = B.ladeGesamtTop('passstrasse').map((e) => `${e.zeit}/${e.auto}`);
    out.dRoh = Object.keys(JSON.parse(localStorage.getItem('alpineRally.bestzeiten2')).passstrasse).sort();
    out.altKey = localStorage.getItem('alpineRally.bestzeiten');
    return out;
  });
  if (teil('c')) {
    const z = (e) => `Platz ${e.platz}/${e.anzahl}, bisher ${e.bisher}, gesamt ${e.gesamtPlatz}, gesamtBisher ${e.gesamtBisher}`;
    melde(r.erst.platz === 1 && r.erst.bisher === null && r.erst.gesamtPlatz === 1 && r.erst.gesamtBisher === null && r.erst.gespeichert, `erste Zeit überhaupt: ${z(r.erst)}`);
    melde(r.rt4b.platz === 1 && r.rt4b.bisher === 170 && r.rt4b.gesamtPlatz === 1 && r.rt4b.gesamtBisher === 170, `Audan schneller: ${z(r.rt4b)}`);
    melde(r.deltoErst.platz === 1 && r.deltoErst.bisher === null && r.deltoErst.anzahl === 1 && r.deltoErst.gesamtPlatz === 3 && r.deltoErst.gesamtBisher === 165,
      `erste Delto-Zeit (Audan-Zeiten zählen nicht als "bisher"): ${z(r.deltoErst)}`);
    melde(r.deltoSchneller.platz === 1 && r.deltoSchneller.bisher === 175 && r.deltoSchneller.gesamtPlatz === 1 && r.deltoSchneller.gesamtBisher === 165, `Delto schneller als alle: ${z(r.deltoSchneller)}`);
    melde(r.esc.platz === 1 && r.esc.gesamtPlatz === 0, `Escorta langsam: ${z(r.esc)}`);
    melde(r.proto.platz === 1 && r.proto.gesamtPlatz === 1 && r.nachProto.gesamtPlatz === 2 && r.nachProto.gesamtBisher === 150, `prototyp zählt in der Gesamtwertung: ${z(r.proto)}; Lanza danach ${z(r.nachProto)}`);
    melde(r.rt4voll.length === 10 && r.elf.platz === 3 && r.rt4elf.length === 10 && !r.rt4elf.includes(187) && r.rt4elf.includes(175.5),
      `Audan: 10 voll, elfte schnellere Zeit verdrängt die langsamste (Platz ${r.elf.platz}), nie mehr als 10`);
    melde(r.zuLangsam.platz === 0 && r.zuLangsam.gesamtPlatz === 0 && r.zuLangsam.anzahl === 10, 'zu langsame Zeit bei vollen 10: Platz 0, Gesamtplatz 0');
    melde(r.gleich.platz === 2 && r.rt4gleich.join() === '165,165.004,170', `Gleichstand je Auto: die ältere vorn (${r.rt4gleich.join(', ')})`);
    melde(r.deltoListe.join() === '160,175', 'Delto-Liste unberührt von den Audan-Zeiten');
    melde(r.gesamt.join() === '150/prototyp,158/l073,160/delto' && r.gesamt10.length === 10, `Gesamt-Top-3: ${r.gesamt.join(', ')}; Gesamt (ohne Auto) 10 Einträge`);
    melde(r.gleichGesamt.gesamtPlatz === 3 && r.gesamtGleich.join() === '150/prototyp,158/l073,158.003/imprexa',
      `Gleichstand über zwei Autos: die ältere vorn (${r.gesamtGleich.join(', ')}, Gesamtplatz ${r.gleichGesamt.gesamtPlatz})`);
    melde(r.altKey === null, 'alter Schlüssel wird beim Speichern nie geschrieben');
  }
  if (teil('d')) {
    melde(r.d1.gesamtPlatz === 1 && r.d2.gesamtPlatz === 2 && r.d3.gesamtPlatz === 3 && r.d4.gesamtPlatz === 0 && r.dGesamt.join() === '150/l073,151/l073,152/l073',
      `ein Auto auf allen drei Gesamtplätzen: ${r.dGesamt.join(', ')} (vierte Lanza-Zeit: Gesamtplatz ${r.d4.gesamtPlatz}, Platz ${r.d4.platz})`);
    melde(r.dRoh.join() === 'delto,l073,rt4', `Speicher: je Auto ein Behälter (${r.dRoh.join(', ')})`);
  }
  melde(s.fehler.length === 0, `keine Fehler in der Konsole ${s.fehler.join(' | ')}`);
  await s.schliessen();
}

// =====================================================================
if (teil('e') || teil('f')) {
  console.log('(e) Speicher blockiert, kaputt, voll; Grösse; (f) Löschen');
  const s = await speicherSeite();
  const r = await imBrowser(s, async ([alt, SPUR]) => {
    const B = await import('/js/bestzeiten.js');
    const E = (zeit, auto, spur = null) => ({ zeit, cps: [zeit * 0.2, zeit * 0.5, zeit * 0.9], auto, aufpralle: 1, resets: 0, hoechstTempo: 48.123456, spur });
    const out = {};
    const P = Storage.prototype, get = P.getItem, set = P.setItem, rem = P.removeItem;
    // kaputtes JSON im neuen Schlüssel: zählt als leer -> die alten Zeiten werden (wieder) übernommen
    localStorage.clear();
    localStorage.setItem('alpineRally.bestzeiten2', '{kaputt');
    out.kaputtLeer = B.ladeBestzeiten('passstrasse').length;
    localStorage.setItem('alpineRally.bestzeiten', JSON.stringify(alt));
    localStorage.setItem('alpineRally.bestzeiten2', '[1,2');
    out.kaputtUebernommen = B.ladeBestzeiten('passstrasse', 'rt4').length;
    localStorage.clear();
    localStorage.setItem('alpineRally.bestzeiten', 'auch kaputt');
    out.altKaputt = B.ladeBestzeiten('passstrasse').length;
    out.altKaputtSpeichern = B.speichereBestzeit('passstrasse', E(170, 'rt4')).platz;
    out.altKaputtBleibt = localStorage.getItem('alpineRally.bestzeiten');
    // Speicher blockiert (jeder Zugriff wirft): Zeiten gelten in der Sitzung
    localStorage.clear();
    P.getItem = function () { throw new DOMException('blockiert', 'SecurityError'); };
    P.setItem = function () { throw new DOMException('blockiert', 'SecurityError'); };
    P.removeItem = function () { throw new DOMException('blockiert', 'SecurityError'); };
    try {
      out.blockLeer = B.ladeBestzeiten('passstrasse').length;
      const b1 = B.speichereBestzeit('passstrasse', E(170, 'rt4'));
      const b2 = B.speichereBestzeit('passstrasse', E(160, 'delto'));
      out.block = { g1: b1.gespeichert, p1: b1.platz, g2: b2.gesamtPlatz, gb: b2.gesamtBisher && b2.gesamtBisher.zeit, liste: B.ladeBestzeiten('passstrasse').map((e) => e.zeit), delto: B.ladeBestzeiten('passstrasse', 'delto').length, geht: B.speicherGeht() };
      out.blockLoeschen = B.loescheBestzeiten();
      out.blockNachLoeschen = B.ladeBestzeiten('passstrasse').length;
    } catch (e) { out.blockFehler = String(e); }
    P.getItem = get; P.setItem = set; P.removeItem = rem;
    // Speicher voll (nur das Schreiben scheitert): kein Fehler, die Zeiten gelten bis zum Neuladen
    localStorage.clear();
    B.loescheBestzeiten();
    B.speichereBestzeit('passstrasse', E(180, 'rt4'));
    P.setItem = function (k, v) { if (k === 'alpineRally.bestzeiten2') throw new DOMException('voll', 'QuotaExceededError'); return set.call(this, k, v); };
    try {
      const v = B.speichereBestzeit('passstrasse', E(175, 'rt4'));
      out.voll = { gespeichert: v.gespeichert, platz: v.platz, liste: B.ladeBestzeiten('passstrasse', 'rt4').map((e) => e.zeit), roh: JSON.parse(localStorage.getItem('alpineRally.bestzeiten2')).passstrasse.rt4.length, geht: B.speicherGeht() };
    } catch (e) { out.vollFehler = String(e); }
    P.setItem = set;
    const w = B.speichereBestzeit('passstrasse', E(178, 'rt4')); // Speicher geht wieder: alles wird geschrieben
    out.wieder = { gespeichert: w.gespeichert, roh: JSON.parse(localStorage.getItem('alpineRally.bestzeiten2')).passstrasse.rt4.map((e) => e.zeit) };
    // Grösse: fünf Autos x 10 Einträge und 10 ohne Auto, alle mit Fahrspur (Werte wie im Spiel, auf 0.01 s)
    localStorage.clear();
    for (const a of ['rt4', 'delto', 'escorta', 'l073', 'imprexa', 'prototyp']) {
      for (let i = 0; i < 10; i++) B.speichereBestzeit('passstrasse', E(150 + i * 1.37 + Math.random(), a, SPUR.map((v) => Math.round(v * (1 + i * 0.009 + Math.random() * 0.01) * 100) / 100)));
    }
    out.groesse = { zeichen: localStorage.getItem('alpineRally.bestzeiten2').length, n: B.ladeBestzeiten('passstrasse', 'rt4').length };
    // (f) Löschen: beide Schlüssel weg (alt und neu), danach leer (auch ohne erneute Übernahme)
    localStorage.setItem('alpineRally.bestzeiten', JSON.stringify(alt));
    out.vorLoeschen = { alt: !!localStorage.getItem('alpineRally.bestzeiten'), neu: !!localStorage.getItem('alpineRally.bestzeiten2') };
    B.speichereLetztenLauf('passstrasse', { zeit: 170, cps: [], spur: null });
    out.loeschen = B.loescheBestzeiten();
    out.nachLoeschen = { alt: localStorage.getItem('alpineRally.bestzeiten'), neu: localStorage.getItem('alpineRally.bestzeiten2'), liste: B.ladeBestzeiten('passstrasse').length, rt4: B.ladeBestzeiten('passstrasse', 'rt4').length, letzter: !!B.ladeLetztenLauf('passstrasse') };
    return out;
  }, [ALTDATEN, SPUR]);
  if (teil('e')) {
    melde(r.kaputtLeer === 0 && r.kaputtUebernommen === 10, 'kaputtes JSON im neuen Schlüssel: leer; mit alten Zeiten werden diese (wieder) übernommen');
    melde(r.altKaputt === 0 && r.altKaputtSpeichern === 1 && r.altKaputtBleibt === 'auch kaputt', 'kaputter alter Schlüssel: leer, Speichern geht, der alte bleibt, wie er ist');
    melde(!r.blockFehler && r.blockLeer === 0 && r.block.g1 === false && r.block.p1 === 1 && r.block.g2 === 1 && r.block.gb === 170 && r.block.liste.join() === '160,170' && r.block.delto === 1 && !r.block.geht && r.blockNachLoeschen === 0,
      `Speicher blockiert: kein Fehler, Zeiten gelten in der Sitzung (${r.blockFehler || r.block.liste.join(', ')}), Löschen leert sie`);
    melde(!r.vollFehler && r.voll.gespeichert === false && r.voll.platz === 1 && r.voll.liste.join() === '175,180' && r.voll.roh === 1 && !r.voll.geht,
      `Speicher voll: kein Fehler, "nicht gespeichert", die Zeit gilt bis zum Neuladen (${r.vollFehler || r.voll.liste.join(', ')})`);
    melde(r.wieder.gespeichert && r.wieder.roh.join() === '175,178,180', 'Speicher geht wieder: auch die Zeit von vorher wird geschrieben');
    const kb = r.groesse.zeichen / 1024;
    melde(r.groesse.n === 10 && r.groesse.zeichen < 1500000, `Grösse: 5 Autos x 10 + 10 ohne Auto, alle mit Fahrspur = ${kb.toFixed(0)} KB Text (ca. ${(kb * 2).toFixed(0)} KB im Browser, Grenze meist 5 MB je Seite)`);
  }
  if (teil('f')) {
    melde(r.vorLoeschen.alt && r.vorLoeschen.neu && r.loeschen && r.nachLoeschen.alt === null && r.nachLoeschen.neu === null && r.nachLoeschen.liste === 0 && r.nachLoeschen.rt4 === 0,
      'loescheBestzeiten: alter und neuer Schlüssel weg, alle Listen leer (keine erneute Übernahme)');
    melde(r.nachLoeschen.letzter, '"Letzter Lauf" bleibt (wie bisher)');
  }
  melde(s.fehler.length === 0, `keine Fehler in der Konsole ${s.fehler.join(' | ')}`);
  await s.schliessen();
}

// --- Spiel mit Menü (Teil B und C) ---------------------------------------------------------------------------------
const fahrerCode = fs.readFileSync(path.join(WURZEL, 'tools/testfahrer-browser.js'), 'utf8');
async function bilderAbwarten(p, n = 3) {
  await p.evaluate((n) => new Promise((r) => { let k = 0; const f = () => (++k >= n ? r() : requestAnimationFrame(f)); requestAnimationFrame(f); }), n);
}
// Spiel laden (mit Menü) mit diesem Auto; Speicher leer; Hilfe insZiel wie in rennablauf-test (Fahrt über die Ziellinie
// mit vorgegebener Zeit, eingetragen wie im Spiel)
async function spielMitMenue(auto, { breite = 640, hoehe = 360, gamepad = false } = {}) {
  const s = await starteSpiel({ breite, hoehe, auto });
  if (gamepad) {
    await s.page.addInitScript(() => {
      window.__knopf = -1;
      navigator.getGamepads = () => [{ connected: true, axes: [0, 0], buttons: Array.from({ length: 17 }, (_, i) => ({ pressed: i === window.__knopf, value: i === window.__knopf ? 1 : 0 })) }];
    });
  }
  await s.page.addInitScript(() => { try { if (!sessionStorage.getItem('m8h')) { localStorage.clear(); sessionStorage.setItem('m8h', '1'); } } catch { /* blockiert */ } });
  await s.page.goto(`${s.url}/index.html`);
  await s.page.waitForFunction(() => window.__alpineRally, null, { timeout: 120000 });
  await bilderAbwarten(s.page);
  await s.page.evaluate((code) => {
    window.__fahrerUrl = URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
    const A = window.__alpineRally;
    const LEER = { gas: 0, bremse: 0, lenkung: 0, handbremse: false, reset: false, debug: false, notes: false };
    window.__T = {
      LEER,
      insZiel(zeit, cps) {
        A.anhalten = true;
        A.start({ countdown: false });
        A.setzeAuf(A.strecke.zielS - 30);
        const p = A.physik;
        p.vx = Math.sin(p.richtung) * 20; p.vz = Math.cos(p.richtung) * 20; p.vVor = 20;
        A.rennen.zustand = 'laeuft';
        A.rennen.zwischenzeiten = cps.slice(); A.rennen.naechsterCp = A.checkpoints.length;
        for (let n = 0; n < 2000 && A.rennen.zustand !== 'ziel'; n++) A.physikSchritt(A.SCHRITT, { ...LEER, gas: 0.5 });
        A.rennen.endZeit = zeit; A.rennen.zeit = zeit;
        A.rennSchritt(A.SCHRITT, LEER);
        return A.lauf.ergebnis;
      },
      bisZielschirm() { let n = 0; while (A.ablauf.zustand !== 'ziel' && n < 5000) { A.rennSchritt(A.SCHRITT, LEER); n++; } return n; },
      zielZeilen() { return A.seiten.ziel.eintraege().map((e) => ({ typ: e.typ, text: e.inhalt ? e.inhalt() : e.text, farbe: e.farbe || null, farben: e.farben || null })); },
    };
  }, fahrerCode);
  return s;
}

// =====================================================================
if (teil('h')) {
  console.log('(h) Referenz für den Live-Vergleich je Auto');
  const s = await spielMitMenue('');
  const r = await s.page.evaluate(async () => {
    const A = window.__alpineRally, B = await import('/js/bestzeiten.js'), E = await import('/js/einstellungen.js');
    localStorage.clear(); B.loescheBestzeiten();
    const ref = () => ({ n: A.vergleich.ref.n, quelle: A.vergleich.ref.quelle, ziel: Math.round(A.vergleich.referenzBei(A.strecke.zielS) * 100) / 100 });
    const out = {};
    A.ablauf.wechsle('menue');
    A.autoWechseln('rt4');
    B.speichereBestzeit('passstrasse', { zeit: 150, cps: [30, 90, 130], auto: 'rt4' });
    B.speichereBestzeit('passstrasse', { zeit: 140, cps: [28, 85, 125], auto: 'prototyp' }); // gesamtbeste, ohne Auto
    A.referenzLaden();
    out.rt4 = ref();
    A.autoWechseln('delto'); // Garage: Referenz sofort nachgeladen
    out.deltoGarage = ref();
    A.start({ countdown: false });
    out.deltoStart = ref();
    A.zumHauptmenue();
    A.autoWechseln('rt4');
    out.rt4Garage = ref();
    A.autoWechseln('delto');
    B.speichereBestzeit('passstrasse', { zeit: 165, cps: [33, 95, 140], auto: 'delto' });
    A.start({ countdown: false });
    out.deltoMitZeit = ref();
    // LETZTER LAUF: egal mit welchem Auto (wie bisher)
    B.speichereLetztenLauf('passstrasse', { zeit: 170, cps: [34, 96, 150], spur: null });
    E.setze('vergleichMit', 'letzter');
    out.letzter = ref();
    E.setze('vergleichMit', 'best');
    out.zurueck = ref();
    A.zumHauptmenue();
    return out;
  });
  melde(r.rt4.n > 0 && r.rt4.ziel === 150 && r.rt4.quelle === 'best', `Audan: Referenz = Audan-Bestzeit (${r.rt4.ziel} s), nicht die gesamtbeste 140 s ohne Auto`);
  melde(r.deltoGarage.n === 0 && r.deltoStart.n === 0, 'Delto ohne eigene Zeit: keine Referenz (in der Garage und beim Start), kein Rückfall auf andere Autos');
  melde(r.rt4Garage.n > 0 && r.rt4Garage.ziel === 150, 'zurück zum Audan in der Garage: Referenz sofort wieder die Audan-Bestzeit');
  melde(r.deltoMitZeit.n > 0 && r.deltoMitZeit.ziel === 165, `Delto mit eigener Zeit: Referenz ${r.deltoMitZeit.ziel} s (nicht die schnellere Audan-Zeit)`);
  melde(r.letzter.quelle === 'letzter' && r.letzter.ziel === 170 && r.zurueck.ziel === 165, 'Einstellung LETZTER LAUF: der letzte Lauf egal mit welchem Auto; zurück auf BESTZEIT AUTO');
  melde(s.fehler.length === 0, `keine Fehler in der Konsole ${s.fehler.join(' | ')}`);
  await s.schliessen();
}

// =====================================================================
if (teil('i')) {
  console.log('(i) Zielbildschirm: Titel, Zeilen, Farben, Fanfare, Layout');
  const s = await spielMitMenue('delto');
  const p = s.page;
  const fall = (vorher, zeit, { voll = false } = {}) => p.evaluate(async ([vorher, zeit, voll]) => {
    const A = window.__alpineRally, B = await import('/js/bestzeiten.js'), T = window.__T;
    B.loescheBestzeiten();
    for (const [z, a] of vorher) B.speichereBestzeit('passstrasse', { zeit: z, cps: [z * 0.2, z * 0.55, z * 0.9], auto: a });
    const P = Storage.prototype, set = P.setItem;
    if (voll) P.setItem = function (k, v) { if (k === 'alpineRally.bestzeiten2') throw new DOMException('voll', 'QuotaExceededError'); return set.call(this, k, v); };
    const fanfaren = [], f0 = A.ton.fanfare;
    A.ton.fanfare = (lang) => { fanfaren.push(lang); };
    const erg = JSON.parse(JSON.stringify(T.insZiel(zeit, [zeit * 0.2, zeit * 0.55, zeit * 0.9])));
    T.bisZielschirm();
    A.ton.fanfare = f0; P.setItem = set;
    const z = A.seiten.ziel;
    const out = { erg: { neueBest: erg.neueBest, gesamtRekord: erg.gesamtRekord, gesamtPlatz: erg.gesamtPlatz, platz: erg.platz, gespeichert: erg.gespeichert },
      titel: z.titel(), blinkt: z.blinkt, farbe: [z.titelFarbe(true), z.titelFarbe(false)], zeilen: T.zielZeilen(), fanfaren, masse: {} };
    // Layout: Tafel in drei Auflösungen, de und en (das Menü ist immer 320x180, die Pixelgrösse betrifft nur das 3D-Bild)
    const E = await import('/js/einstellungen.js'), TX = await import('/js/texte.js');
    for (const sp of ['de', 'en']) {
      TX.setzeSprache(sp);
      for (const a of [0, 1, 2]) {
        E.setze('aufloesung', a);
        A.menue.neuZeichnen();
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
        const m = A.menue.rollen;
        out.masse[`${sp}-${a}`] = { hoehe: m.hoehe, max: m.max, breite: m.breite, inhalt: m.inhalt, titel: z.titel() };
      }
    }
    TX.setzeSprache('de'); E.setze('aufloesung', 0);
    A.zumHauptmenue();
    return out;
  }, [vorher, zeit, voll]);
  const C = await p.evaluate(() => ({ ...window.__alpineRally.CONFIG.rennablauf, M: window.__alpineRally.CONFIG.menue }));
  const text = (f, re) => f.zeilen.find((z) => re.test(String(z.text)));
  const diff = (f) => text(f, /^[+-]?\d+\.\d\d$/);
  const layoutOk = (f) => Object.values(f.masse).every((m) => m.max === 0 && m.hoehe <= 163 && m.breite <= 316);
  const lay = (f) => `Tafel ${Math.max(...Object.values(f.masse).map((m) => m.hoehe))} hoch, ${Math.max(...Object.values(f.masse).map((m) => m.breite))} breit`;
  const faelle = {};
  // 1. allererste Zeit überhaupt
  faelle.erste = await fall([], 160);
  // 2. erste Zeit des Delto, ein anderes Auto ist schneller: GESAMT PLATZ 2
  faelle.ersteAuto = await fall([[150, 'rt4']], 160);
  // 3. Delto langsamer als die eigene Bestzeit, Gesamtplatz 3: beide Plätze in einer Zeile
  faelle.langsamer = await fall([[150, 'rt4'], [158, 'delto']], 160);
  // 4. neue Delto-Bestzeit, Gesamtplatz 2
  faelle.neueBest = await fall([[150, 'rt4'], [165, 'delto']], 160);
  // 5. Gesamtrekord (auch neue Delto-Bestzeit)
  faelle.rekord = await fall([[150, 'rt4'], [165, 'delto']], 145);
  // 6. Gesamtrekord mit der ersten Delto-Zeit
  faelle.rekordErste = await fall([[150, 'rt4']], 145);
  // 7. ungünstigster Fall für die Höhe: beide Platz-Zeilen und "ZEIT WIRD NICHT GESPEICHERT" (Speicher voll)
  faelle.voll = await fall([[150, 'rt4'], [158, 'delto']], 160, { voll: true });
  // 8. englisch: Titel
  const f = faelle;
  melde(f.erste.titel === 'ZIEL!' && !f.erste.blinkt && text(f.erste, /^ERSTE ZEIT$/) && !text(f.erste, /PLATZ/) && !f.erste.erg.gesamtRekord && f.erste.fanfaren.join() === 'false',
    `allererste Zeit: ZIEL!, ERSTE ZEIT, keine Platz-Zeile, kein Rekord, kurze Fanfare (${lay(f.erste)})`);
  const g2 = text(f.ersteAuto, /^GESAMT PLATZ/);
  melde(f.ersteAuto.titel === 'ZIEL!' && text(f.ersteAuto, /^ERSTE ZEIT$/) && g2 && g2.text === 'GESAMT PLATZ 2' && g2.farbe === C.M.farbeTitel,
    `erste Delto-Zeit hinter dem Audan: ZIEL!, ERSTE ZEIT, "${g2 && g2.text}" (gelb)`);
  const pl = text(f.langsamer, /^PLATZ/), dl = diff(f.langsamer);
  melde(f.langsamer.titel === 'ZIEL!' && pl && pl.text === 'PLATZ 2 VON 2 · GESAMT PLATZ 3' && pl.farben.join() === `${C.M.farbeGruppe},${C.M.farbeTitel}` && dl.text === '+2.00' && dl.farbe === C.farbeLangsamer,
    `langsamer als die eigene Bestzeit: "${pl && pl.text}" in einer Zeile, rot ${dl && dl.text} (gegen die Delto-Bestzeit, nicht den Audan)`);
  const nb = diff(f.neueBest), g3 = text(f.neueBest, /GESAMT PLATZ/);
  melde(f.neueBest.titel === 'NEUE BESTZEIT!' && f.neueBest.blinkt && f.neueBest.farbe[1] === C.farbeSchneller && nb.text === '-5.00' && nb.farbe === C.farbeSchneller
    && g3 && g3.text === 'GESAMT PLATZ 2' && !text(f.neueBest, /^PLATZ/) && f.neueBest.fanfaren.join() === 'false,true',
    `neue Delto-Bestzeit: NEUE BESTZEIT! (blinkt), grün ${nb && nb.text}, "${g3 && g3.text}", lange Fanfare`);
  const rd = diff(f.rekord);
  melde(f.rekord.titel === 'GESAMTREKORD!' && f.rekord.blinkt && f.rekord.erg.gesamtRekord && f.rekord.erg.neueBest && rd.text === '-20.00' && !text(f.rekord, /GESAMT PLATZ/) && f.rekord.fanfaren.join() === 'false,true',
    `Gesamtrekord: GESAMTREKORD! (blinkt, vor NEUE BESTZEIT), Vergleich mit der Delto-Bestzeit ${rd && rd.text}, keine GESAMT-PLATZ-Zeile, lange Fanfare`);
  melde(f.rekordErste.titel === 'GESAMTREKORD!' && f.rekordErste.blinkt && text(f.rekordErste, /^ERSTE ZEIT$/) && !f.rekordErste.erg.neueBest && f.rekordErste.fanfaren.join() === 'false,true',
    'Gesamtrekord mit der ersten Delto-Zeit: GESAMTREKORD!, ERSTE ZEIT, lange Fanfare');
  melde(!f.voll.erg.gespeichert && text(f.voll, /NICHT GESPEICHERT/) && text(f.voll, /^PLATZ 2 VON 2 · GESAMT PLATZ 3$/),
    `ungünstigster Fall (beide Plätze, nicht gespeichert): ${lay(f.voll)}`);
  melde(Object.values(f).every(layoutOk), `Layout in 320x180, 480x270, 640x360, de und en: nichts gerollt, Tafel höchstens 163 hoch (wie bis 0.8g), höchstens 316 breit; ${Object.entries(f).map(([k, v]) => `${k} ${lay(v)}`).join('; ')}`);
  melde(f.rekord.masse['en-0'].titel === 'OVERALL RECORD!' && f.neueBest.masse['en-0'].titel === 'NEW BEST TIME!' && f.erste.masse['en-0'].titel === 'FINISH!', 'englisch: OVERALL RECORD!, NEW BEST TIME!, FINISH!');
  // Einstellung VERGLEICH MIT: Text BESTZEIT AUTO, Seite nicht breiter (Tafelbreite gegen den Text "BESTZEIT" von 0.8g)
  const e = await p.evaluate(async () => {
    const A = window.__alpineRally, TX = await import('/js/texte.js'), P = await import('/js/pixel.js');
    const out = {};
    for (const sp of ['de', 'en']) {
      TX.setzeSprache(sp);
      A.ablauf.wechsle('menue'); A.menue.zeige(A.seiten.einstellungen, true); A.menue.neuZeichnen();
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      const l = A.menue.seite.eintraege, v = l.find((x) => x.text === 'einst.vergleichMit');
      out[sp] = { breite: A.menue.rollen.breite, inhalt: A.menue.rollen.inhalt, wert: TX.t('wert.bestzeit'), andere: TX.t('wert.letzterLauf'),
        zeichenOk: [...TX.t('wert.bestzeit'), ...TX.t('ziel.gesamtRekord'), ...TX.t('ziel.gesamtPlatz', { p: 2 })].every((ch) => ch === ' ' || P.SCHRIFT[ch]), optionen: v.optionen().length };
    }
    TX.setzeSprache('de');
    return out;
  });
  melde(e.de.wert === 'BESTZEIT AUTO' && e.en.wert === 'CAR BEST' && e.de.zeichenOk && e.en.zeichenOk, `Einstellung VERGLEICH MIT: "${e.de.wert}" / "${e.en.wert}", alle Zeichen in der Pixelschrift`);
  melde(e.de.breite === 283, `EINSTELLUNGEN nicht breiter als in 0.8g (de ${e.de.breite} Pixel, 0.8g 283; en ${e.en.breite})`);
  melde(s.fehler.length === 0, `keine Fehler in der Konsole ${s.fehler.join(' | ')}`);
  await s.schliessen();
}

// =====================================================================
if (teil('j')) {
  console.log('(j) Live-Vergleich gegen die Auto-Bestzeit über echte Testfahrer-Läufe');
  const s = await spielMitMenue('delto');
  const r = await s.page.evaluate(async () => {
    const A = window.__alpineRally, B = await import('/js/bestzeiten.js');
    const f = await import(window.__fahrerUrl);
    B.loescheBestzeiten();
    // eine schnelle Audan-Zeit (mit Spur) liegt vor: sie darf den Delto-Vergleich nicht füttern
    const spur = Array.from({ length: A.vergleich.K + 1 }, (_, k) => Math.round(k * 0.38 * 100) / 100);
    B.speichereBestzeit('passstrasse', { zeit: spur[spur.length - 1], cps: [30, 80, 120], auto: 'rt4', spur });
    A.ablauf.wechsle('menue'); A.autoWechseln('delto'); A.anhalten = true;
    const lauf = () => {
      const proben = { n: 0, sichtbar: 0, maxRoh: 0 };
      const r = f.fahreEtappe(A, 'mittel', () => {
        if (A.rennen.zustand !== 'laeuft' || ++proben.n % 60) return;
        const a = A.vergleich.aktualisiere(1, A.rennen.letztesS, A.rennen.zeit, true);
        if (a.sichtbar) { proben.sichtbar++; proben.maxRoh = Math.max(proben.maxRoh, Math.abs(A.vergleich.roh)); }
      });
      for (let i = 0; i < 2000 && !A.lauf.zielErledigt; i++) A.rennSchritt(A.SCHRITT, { gas: 0, bremse: 0, lenkung: 0, handbremse: false });
      const e = A.lauf.ergebnis;
      return { zeit: r.zeit, ziel: r.ziel, aufpralle: r.aufpralle ? r.aufpralle.length : null, ref: A.vergleich.ref.n, proben, auto: e.auto, bisher: e.bisher && e.bisher.zeit, neueBest: e.neueBest, gesamtPlatz: e.gesamtPlatz, platz: e.platz };
    };
    A.start({ countdown: false });
    const eins = lauf();
    const zwei = lauf();
    A.zumHauptmenue();
    return { eins, zwei, audan: spur[spur.length - 1] };
  });
  const fmt = (t) => `${Math.floor(t / 60)}:${(t % 60).toFixed(2).padStart(5, '0')}`;
  melde(r.eins.ziel && r.eins.ref === 0 && r.eins.proben.sichtbar === 0 && r.eins.auto === 'delto' && r.eins.bisher === null && r.eins.gesamtPlatz === 2,
    `1. Delto-Lauf ${fmt(r.eins.zeit)}: keine Referenz (die Audan-Zeit ${fmt(r.audan)} zählt nicht), Live-Vergleich nie sichtbar, ERSTE ZEIT, Gesamtplatz ${r.eins.gesamtPlatz}`);
  melde(r.zwei.ziel && r.zwei.ref > 0 && r.zwei.proben.sichtbar > 100 && r.zwei.proben.maxRoh < 0.05 && r.zwei.bisher === r.eins.zeit,
    `2. Delto-Lauf: Referenz = 1. Delto-Lauf (Spur), Anzeige in ${r.zwei.proben.sichtbar} Proben sichtbar, Unterschied höchstens ${r.zwei.proben.maxRoh.toFixed(3)} s (gleiche Fahrt)`);
  melde(r.zwei.zeit === r.eins.zeit && fmt(r.eins.zeit) === '2:41.60', `Zeit unverändert: ${fmt(r.eins.zeit)} beide Male (M8f-Tabelle Delto mittel 2:41.60)`);
  melde(s.fehler.length === 0, `keine Fehler in der Konsole ${s.fehler.join(' | ')}`);
  await s.schliessen();
}

// =====================================================================
if (teil('g')) {
  console.log('(g) alte Tests, die bestzeiten.js benutzen');
  for (const [t, a] of [['rennablauf-test.mjs', []], ['overlay-test.mjs', []], ['m8c-test.mjs', ['--nur', 'j']], ['m8b-test.mjs', []], ['m8e-test.mjs', ['--nur', 'h']]]) {
    const r = werkzeug(t, a);
    const fehlerZeilen = r.text.split('\n').filter((z) => /^\s*FEHLER|Error|Fehler im Spiel/.test(z));
    fs.mkdirSync('/tmp/m8h', { recursive: true });
    fs.writeFileSync(`/tmp/m8h/${t.replace('.mjs', '')}.log`, r.text);
    melde(r.code === 0 && !fehlerZeilen.length, `${t} ${a.join(' ')}: ${r.code === 0 ? 'grün' : `Code ${r.code}`}${fehlerZeilen.length ? ` – ${fehlerZeilen.slice(0, 3).join(' | ')}` : ''} (Ausgabe /tmp/m8h/)`);
  }
}

console.log(fehler ? `\n${fehler} FEHLER` : '\nalles ok');
process.exit(fehler ? 1 : 0);
