// Test für Meilenstein 5a (Menüs, Einstellungen, Pause, Sprache):  node tools/menue-test.mjs
//  (a) Tastatur-Navigation durch jede Seite und zurück ohne Fehler
//  (b) Einstellungen werden gespeichert und nach Neuladen wiedergefunden
//  (c) ohne Browser-Speicher (localStorage blockiert) läuft alles mit Standardwerten
//  (d) Pause friert die Rennzeit ein (vor/nach 3 s Pause gleich), danach läuft sie ohne Sprung weiter
//  (e) Fokusverlust (Fenster/Tab) löst die Pause aus
//  (f) jeder Text in texte.js hat Deutsch und Englisch, nichts leer, alle Zeichen in der Pixelschrift
//  (g) Tastenbelegung ändert wirklich die Eingabe, doppelte Belegung wird verhindert
//  (h) Neustart setzt Zeit und Checkpoints zurück
//  (i) Demo-Fahrt schreibt nichts in den Rennstand, "Starten" beginnt sauber an der Startlinie
// M5b: STARTEN und NEUSTART führen jetzt in den Countdown (Auto mit der Schnauze an der Startlinie); die Teile
//      (a), (c), (g), (h), (i) sind darauf angepasst. Mehr zum Countdown: tools/rennablauf-test.mjs
//  (j) Credits (M5a.1): Mitwirkende und Unterstützer in de/en, leere Liste = keine Gruppe, rollt mit vielen Namen
// Dazu: keine Fehler in der Konsole.

import { starteSpiel } from './spiel-browser.mjs';

let fehlerZahl = 0;
const pruefe = (ok, text, info = '') => {
  console.log(`  ${ok ? 'OK   ' : 'FEHLER'} ${text}${info ? `  (${info})` : ''}`);
  if (!ok) fehlerZahl++;
};
const warte = (p, ms) => p.waitForTimeout(ms);

// Spiel mit Menü laden und warten, bis die Schleife läuft
async function lade(opt = {}) {
  const spiel = await starteSpiel({ breite: 640, hoehe: 360 });
  if (opt.ohneSpeicher) {
    await spiel.page.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', { configurable: true, get() { throw new DOMException('blockiert', 'SecurityError'); } });
    });
  }
  await spiel.ladeSpiel(false, { menue: true });
  await bilderAbwarten(spiel.page);
  return spiel;
}
// ein paar Bilder abwarten (Software-Grafik: die ersten Bilder sind langsam)
async function bilderAbwarten(p, n = 3) {
  await p.evaluate((n) => new Promise((r) => { let k = 0; const f = () => (++k >= n ? r() : requestAnimationFrame(f)); requestAnimationFrame(f); }), n);
}
const A = (p, f, arg) => p.evaluate(f, arg);
const zustand = (p) => A(p, () => window.__alpineRally.ablauf.zustand);
const seite = (p) => A(p, () => window.__alpineRally.menue.seite && window.__alpineRally.menue.seite.id);
const wahl = (p) => A(p, () => window.__alpineRally.menue.wahl);
async function taste(p, code, n = 1) { for (let i = 0; i < n; i++) await p.keyboard.press(code); }
// Esc im Rennen: die Pause kommt mit dem nächsten Bild (Spielschleife liest die Eingabe)
async function pauseTaste(p) { await p.keyboard.press('Escape'); await bilderAbwarten(p, 2); }
async function zu(p, nr) { for (let i = 0; i < 40 && (await wahl(p)) !== nr; i++) await taste(p, 'ArrowDown'); return (await wahl(p)) === nr; }
async function oeffne(p, nr) { await zu(p, nr); await taste(p, 'Enter'); }
// Nummer eines Eintrags auf der aktuellen Seite (nach Text-Schlüssel oder Typ)
const nrVon = (p, schluessel) => A(p, (s) => {
  const se = window.__alpineRally.menue.seite;
  const l = typeof se.eintraege === 'function' ? se.eintraege() : se.eintraege;
  return l.findIndex((e) => (e.text === s || e.typ === s) && e.typ !== 'gruppe');
}, schluessel);

// =====================================================================
console.log('(a) Tastatur-Navigation durch alle Seiten');
{
  const spiel = await lade();
  const p = spiel.page;
  pruefe(await zustand(p) === 'titel' && await seite(p) === 'titel', 'Start auf dem Titelbildschirm');
  await taste(p, 'KeyX'); // beliebige Taste
  pruefe(await zustand(p) === 'menue' && await seite(p) === 'haupt', 'beliebige Taste -> Hauptmenü');
  const erwartet = { 1: 'auto', 2: 'etappe', 3: 'bestzeiten', 4: 'einstellungen', 5: 'steuerung', 6: 'credits' };
  for (const [nr, id] of Object.entries(erwartet)) {
    await oeffne(p, +nr);
    const s = await seite(p);
    // alle Einträge einmal ganz durch (auch Rollen)
    const n = await A(p, () => { const se = window.__alpineRally.menue.seite; return (typeof se.eintraege === 'function' ? se.eintraege() : se.eintraege).length; });
    await taste(p, 'ArrowDown', n + 1);
    await taste(p, 'ArrowUp', 2);
    let unter = '';
    if (id === 'einstellungen') {
      await oeffne(p, await nrVon(p, 'einst.tasten'));
      unter = await seite(p);
      await taste(p, 'ArrowDown', 12);
      await taste(p, 'Escape');
    }
    if (id === 'steuerung') {
      await oeffne(p, await nrVon(p, 'steuerung.symbole'));
      unter = await seite(p);
      await taste(p, 'ArrowDown', 25);
      await taste(p, 'Backspace'); // auch Rücktaste = zurück
    }
    const zurueck = await seite(p);
    await taste(p, 'Escape');
    pruefe(s === id && (await seite(p)) === 'haupt' && zurueck === id, `${id} öffnen und zurück`, unter ? `Unterseite ${unter}` : '');
  }
  // ZURÜCK als letzter Punkt (Enter darauf)
  await oeffne(p, 4);
  const letzte = await A(p, () => { const se = window.__alpineRally.menue.seite; const l = se.eintraege; return l[l.length - 1].typ; });
  await zu(p, (await nrVon(p, 'zurueck')));
  await taste(p, 'Enter');
  pruefe(letzte === 'zurueck' && (await seite(p)) === 'haupt', 'ZURÜCK ist der letzte Punkt und führt zurück');
  // Esc im Hauptmenü -> Titel, Enter -> Hauptmenü, Starten -> Rennen
  await taste(p, 'Escape');
  const t1 = await zustand(p);
  await taste(p, 'Enter');
  await zu(p, 0); await taste(p, 'Enter');
  pruefe(t1 === 'titel' && (await zustand(p)) === 'countdown', 'Esc im Hauptmenü -> Titel; STARTEN -> Countdown (M5b)');
  // Pause, Einstellungen aus der Pause, Rückfrage NEIN / JA
  await pauseTaste(p);
  const ps = [await zustand(p), await seite(p)];
  await oeffne(p, 2);
  const ein = await seite(p);
  await taste(p, 'Escape');
  await oeffne(p, 3);
  const fr = [await seite(p), await wahl(p)];
  await taste(p, 'Enter'); // NEIN (vorgewählt)
  const nachNein = await seite(p);
  await oeffne(p, 3); await zu(p, 2); await taste(p, 'Enter'); // JA
  pruefe(ps[0] === 'pause' && ps[1] === 'pause' && ein === 'einstellungen' && fr[0] === 'frage' && fr[1] === 3 && nachNein === 'pause'
    && (await zustand(p)) === 'menue' && (await seite(p)) === 'haupt', 'Pause: Einstellungen, Rückfrage (NEIN vorgewählt, NEIN -> Pause, JA -> Hauptmenü)',
  `${ps} ${ein} ${fr} ${nachNein} ${await zustand(p)} ${await seite(p)}`);
  // Maus: Hover hebt hervor, Klick bestätigt (Bestzeiten), Regler ziehen
  await p.waitForFunction(() => window.__alpineRally.menue.treffer.some((h) => h.nr === 3 && !h.platz), null, { timeout: 60000 });
  const box = await A(p, () => window.__alpineRally.menue.treffer.find((h) => h.nr === 3));
  const umr = (x, y) => [x / 320 * 640, y / 180 * 360];
  await p.mouse.move(...umr(box.x + box.b / 2, box.y + box.h / 2));
  const hover = await wahl(p);
  await p.mouse.down(); await p.mouse.up();
  const nachKlick = await seite(p);
  await taste(p, 'Escape');
  await oeffne(p, 4);
  await zu(p, await nrVon(p, 'einst.lautstaerke'));
  await p.waitForFunction(() => { const A = window.__alpineRally; return A.menue.treffer.some((h) => h.nr === A.menue.wahl && h.reglerB); }, null, { timeout: 60000 });
  const regler = await A(p, () => { const A = window.__alpineRally; return A.menue.treffer.find((h) => h.nr === A.menue.wahl && h.reglerB); });
  await p.mouse.move(...umr(regler.reglerX + 2, regler.y + 5));
  await p.mouse.down();
  await p.mouse.move(...umr(regler.reglerX + regler.reglerB * 0.5, regler.y + 5), { steps: 4 });
  await p.mouse.up();
  const laut = await A(p, () => window.__alpineRally.einstellungen.lautstaerke);
  pruefe(hover === 3 && nachKlick === 'bestzeiten' && laut === 50, 'Maus: Hover wählt, Klick öffnet, Regler ziehen', `Lautstärke ${laut} %`);
  await taste(p, 'Escape');
  pruefe(spiel.fehler.length === 0, 'keine Fehler in der Konsole', spiel.fehler.join(' | '));
  await spiel.schliessen();
}

// =====================================================================
console.log('(b) Einstellungen speichern und nach Neuladen wiederfinden');
{
  const spiel = await lade();
  const p = spiel.page;
  await taste(p, 'Enter');
  await oeffne(p, 4);
  const stelle = async (schluessel, r = 1, n = 1) => { await zu(p, await nrVon(p, schluessel)); await taste(p, r > 0 ? 'ArrowRight' : 'ArrowLeft', n); };
  await stelle('einst.aufloesung', 1);       // 480x270
  await stelle('einst.paceNotes', 1);        // aus
  await stelle('einst.einheiten', 1);        // mph
  await stelle('einst.fps', 1);              // an
  await stelle('einst.lenk', 1);             // Stufe 3
  await stelle('einst.totzone', -1);         // Stufe 1
  await stelle('einst.lautstaerke', -1, 4);  // 50 %
  await stelle('einst.sprache', 1);          // Englisch
  const vorher = await A(p, () => { const A = window.__alpineRally; return JSON.stringify({ ...A.einstellungen, notes: A.paceNotes.anzeige.an, b: A.renderer.domElement.width }); });
  await p.reload();
  await p.waitForFunction(() => window.__alpineRally, null, { timeout: 120000 });
  await bilderAbwarten(p);
  const nachher = await A(p, () => { const A = window.__alpineRally; return JSON.stringify({ ...A.einstellungen, notes: A.paceNotes.anzeige.an, b: A.renderer.domElement.width }); });
  const n = JSON.parse(nachher);
  const sprache = await A(p, async () => (await import('/js/texte.js')).aktuelleSprache());
  pruefe(vorher === nachher && n.aufloesung === 1 && n.b === 480 && n.notes === false && n.einheit === 'mph' && n.fps === true
    && n.lenkStufe === 3 && n.totzoneStufe === 1 && n.lautstaerke === 50 && n.sprache === 'en' && sprache === 'en',
  'alle Werte nach Neuladen gleich', nachher);
  pruefe(spiel.fehler.length === 0, 'keine Fehler in der Konsole', spiel.fehler.join(' | '));
  await spiel.schliessen();
}

// =====================================================================
console.log('(c) ohne Browser-Speicher');
{
  const spiel = await lade({ ohneSpeicher: true });
  const p = spiel.page;
  const e = await A(p, () => JSON.stringify(window.__alpineRally.einstellungen));
  const std = await A(p, () => JSON.stringify(window.__alpineRally.CONFIG.menue.standard));
  pruefe(e === std, 'Standardwerte', e.slice(0, 80) + '…');
  await taste(p, 'Enter'); await oeffne(p, 4);
  await zu(p, await nrVon(p, 'einst.einheiten')); await taste(p, 'ArrowRight');
  await zu(p, await nrVon(p, 'einst.paceNotes')); await taste(p, 'ArrowRight');
  const ok = await A(p, () => window.__alpineRally.einstellungen.einheit === 'mph' && window.__alpineRally.paceNotes.anzeige.an === false);
  await taste(p, 'Escape'); await zu(p, 0); await taste(p, 'Enter');
  await bilderAbwarten(p);
  pruefe(ok && (await zustand(p)) === 'countdown', 'Einstellungen ändern geht trotzdem, Rennen startet (Countdown)');
  pruefe(spiel.fehler.length === 0, 'keine Fehler in der Konsole', spiel.fehler.join(' | '));
  await spiel.schliessen();
}

// =====================================================================
console.log('(d) Pause friert alles ein, (e) Fokusverlust = Pause, (h) Neustart');
{
  const spiel = await lade();
  const p = spiel.page;
  await taste(p, 'Enter'); await zu(p, 0); await taste(p, 'Enter');
  // über die Startlinie fahren (echte Spielschleife, Gas von aussen)
  await A(p, () => { window.__alpineRally.testEingabe = { gas: 1 }; });
  await p.waitForFunction(() => window.__alpineRally.rennen.zustand === 'laeuft' && window.__alpineRally.rennen.zeit > 0.6, null, { timeout: 120000 });
  await A(p, () => { window.__alpineRally.testEingabe = null; window.__alpineRally.rTaste(); }); // R-Countdown läuft
  await bilderAbwarten(p, 2);
  await pauseTaste(p);
  const uZeit = () => A(p, () => {
    let w = []; window.__alpineRally.szene.traverse((o) => { if (o.material && o.material.uniforms && o.material.uniforms.uZeit) w.push(o.material.uniforms.uZeit.value); });
    return w.join(',');
  });
  const stand = () => A(p, () => { const A = window.__alpineRally; return { z: A.rennen.zeit, x: A.physik.x, z2: A.physik.z, r: A.rueck.rest, uhr: A.rennen.uhr }; });
  const v = await stand(), u1 = await uZeit();
  await warte(p, 3000);
  const n = await stand(), u2 = await uZeit();
  pruefe((await zustand(p)) === 'pause' && v.z === n.z && v.x === n.x && v.z2 === n.z2 && v.r === n.r && v.uhr === n.uhr && u1 === u2,
    'Rennzeit, Auto, R-Countdown, Zuschauer/Rauch stehen in der Pause', `Zeit ${v.z.toFixed(3)} -> ${n.z.toFixed(3)} s, R ${v.r.toFixed(2)} s`);
  // weiter: läuft nahtlos weiter
  const z0 = n.z;
  await taste(p, 'Escape');
  await bilderAbwarten(p, 1);
  const z1 = (await stand()).z;
  await bilderAbwarten(p, 6);
  const z2 = (await stand()).z;
  pruefe((await zustand(p)) === 'rennen' && z1 - z0 <= 0.21 && z2 > z1, 'nach Weiter läuft die Zeit ohne Sprung weiter', `+${(z1 - z0).toFixed(3)} s im ersten Bild, dann ${z2.toFixed(2)} s`);
  // (e) Fenster verliert den Fokus / Tab wird gewechselt
  await A(p, () => window.dispatchEvent(new Event('blur')));
  const p1 = await zustand(p);
  await taste(p, 'Escape');
  const p2 = await zustand(p);
  await A(p, () => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange')); });
  const p3 = await zustand(p);
  await A(p, () => { delete document.hidden; });
  pruefe(p1 === 'pause' && p2 === 'rennen' && p3 === 'pause', '(e) Fokusverlust und Tab-Wechsel lösen Pause aus');
  // (h) Neustart: Checkpoint 1 echt durchfahren, dann Pause -> NEUSTART DER ETAPPE (seit M5b mit Countdown)
  await taste(p, 'Escape');
  await A(p, () => {
    const A = window.__alpineRally;
    A.anhalten = true;
    const cp = A.checkpoints[0].s;
    A.setzeAuf(cp - 30);
    A.rennen.zustand = 'laeuft'; A.rennen.zeit = 25;
    // einfach der Strassenmitte nach (Punkt 12 m voraus anpeilen)
    const q = {};
    for (let i = 0; i < 1200 && A.rennen.naechsterCp === 0; i++) {
      const s = A.strecke.abfrage(A.physik.x, A.physik.z, q).s;
      const z = A.strecke.punktBei(s + 12);
      let d = Math.atan2(z.x - A.physik.x, z.z - A.physik.z) - A.physik.richtung;
      d = Math.atan2(Math.sin(d), Math.cos(d));
      A.physikSchritt(A.SCHRITT, { gas: A.physik.tempo < 12 ? 1 : 0, bremse: 0, lenkung: Math.max(-1, Math.min(1, -d * 2.5)), handbremse: false });
    }
    A.anhalten = false;
  });
  const vorNeu = await A(p, () => ({ ...window.__alpineRally.rennen }));
  await pauseTaste(p); await oeffne(p, 1);
  const r = await A(p, () => {
    const A = window.__alpineRally, C = A.CONFIG, s = A.strecke.punktBei(A.strecke.startS - C.grenze.wandHuelle.laenge / 2 - C.rennablauf.schnauzeVorLinie);
    return { ...A.rennen, d: Math.hypot(A.physik.x - s.x, A.physik.z - s.z), v: A.physik.tempo, zust: A.ablauf.zustand };
  });
  pruefe(vorNeu.naechsterCp === 1 && vorNeu.zwischenzeiten.length === 1 && r.zust === 'countdown' && r.zeit === 0 && r.zustand === 'bereit'
    && r.naechsterCp === 0 && r.zwischenzeiten.length === 0 && r.d < 0.5 && r.v < 0.5,
  '(h) Neustart setzt Zeit, Checkpoints und Auto zurück', `vorher CP ${vorNeu.naechsterCp}, Zeit ${vorNeu.zeit.toFixed(1)} s -> Zeit ${r.zeit}, CP ${r.naechsterCp}, ${r.d.toFixed(2)} m vom Start`);
  pruefe(spiel.fehler.length === 0, 'keine Fehler in der Konsole', spiel.fehler.join(' | '));
  await spiel.schliessen();
}

// =====================================================================
console.log('(f) Texte Deutsch und Englisch');
{
  const spiel = await starteSpiel();
  const p = spiel.page;
  await spiel.ladeSpiel(true);
  const erg = await A(p, async () => {
    const { TEXTE } = await import('/js/texte.js');
    const { SCHRIFT } = await import('/js/pixel.js');
    const fehlt = [], leer = [], zeichen = new Set(), platz = [];
    for (const [k, e] of Object.entries(TEXTE)) {
      for (const s of ['de', 'en']) {
        if (typeof e[s] !== 'string') fehlt.push(`${k}.${s}`);
        else if (!e[s].trim()) leer.push(`${k}.${s}`);
        else if (!k.startsWith('lade.') && !k.startsWith('dokument.')) for (const c of e[s].replace(/\{\w+\}/g, '').toUpperCase()) if (!SCHRIFT[c]) zeichen.add(`${c} (${k})`);
      }
      const ph = (s) => (s || '').match(/\{\w+\}/g)?.sort().join() || '';
      if (ph(e.de) !== ph(e.en)) platz.push(k);
      if (/ß/.test(e.de || '')) fehlt.push(`${k}: ß statt ss`);
    }
    return { n: Object.keys(TEXTE).length, fehlt, leer, zeichen: [...zeichen], platz };
  });
  pruefe(erg.fehlt.length === 0 && erg.leer.length === 0, `alle ${erg.n} Schlüssel in de und en, keine leeren Texte, kein ß`, [...erg.fehlt, ...erg.leer].join(', '));
  pruefe(erg.platz.length === 0, 'Platzhalter in beiden Sprachen gleich', erg.platz.join(', '));
  pruefe(erg.zeichen.length === 0, 'alle Zeichen gibt es in der Pixelschrift', erg.zeichen.join(', '));
  await spiel.schliessen();
}

// =====================================================================
console.log('(g) Tastenbelegung');
{
  const spiel = await lade();
  const p = spiel.page;
  await taste(p, 'Enter'); await oeffne(p, 4); await oeffne(p, await nrVon(p, 'einst.tasten'));
  // Gas, Taste 1 -> G
  await zu(p, 1); await taste(p, 'Enter');
  const wartet = await A(p, () => window.__alpineRally.menue.wartet);
  await taste(p, 'KeyG');
  const T = () => A(p, () => JSON.parse(JSON.stringify(window.__alpineRally.einstellungen.tasten)));
  let t = await T();
  pruefe(wartet && t.gas[0] === 'KeyG', 'Gas auf G gelegt', JSON.stringify(t.gas));
  // reservierte Taste: Enter geht nicht
  await taste(p, 'Enter'); await taste(p, 'Enter');
  t = await T();
  pruefe(t.gas[0] === 'KeyG' && !JSON.stringify(t).includes('Enter'), 'Enter ist reserviert (wird nicht belegt)');
  // Esc bricht ab
  await taste(p, 'Enter'); await taste(p, 'Escape');
  pruefe((await A(p, () => !window.__alpineRally.menue.wartet)) && (await seite(p)) === 'tasten' && (await T()).gas[0] === 'KeyG', 'Esc bricht das Belegen ab');
  // G auf Bremse legen -> wird getauscht, nie doppelt
  await zu(p, 2); await taste(p, 'Enter'); await taste(p, 'KeyG');
  t = await T();
  const alle = Object.values(t).flat().filter(Boolean);
  pruefe(t.bremse[0] === 'KeyG' && t.gas[0] === 'ArrowDown' && new Set(alle).size === alle.length, 'schon vergebene Taste wird getauscht, nie doppelt', `Gas ${t.gas}, Bremse ${t.bremse}`);
  // W (Gas, Taste 2) auf Links Taste 2 -> Tausch mit A
  await zu(p, 3); await taste(p, 'ArrowRight'); await taste(p, 'Enter'); await taste(p, 'KeyW');
  t = await T();
  const alle2 = Object.values(t).flat().filter(Boolean);
  pruefe(t.links[1] === 'KeyW' && t.gas[1] === 'KeyA' && new Set(alle2).size === alle2.length, 'Tausch auch bei Taste 2', `Gas ${t.gas}, Links ${t.links}`);
  // Gas zurück auf G (Tausch mit Bremse), dann fahren: G beschleunigt, Pfeil hoch nicht mehr
  await zu(p, 1); await taste(p, 'ArrowLeft'); await taste(p, 'Enter'); await taste(p, 'KeyG');
  t = await T();
  await taste(p, 'Escape'); await taste(p, 'Escape'); await zu(p, 0); await taste(p, 'Enter');
  await p.waitForFunction(() => window.__alpineRally.ablauf.zustand === 'rennen', null, { timeout: 120000 }); // nach dem Countdown (M5b)
  await bilderAbwarten(p, 2);
  const tempo = () => A(p, () => window.__alpineRally.physik.tempo);
  await p.keyboard.down('ArrowUp'); await bilderAbwarten(p, 30); await p.keyboard.up('ArrowUp');
  const vPfeil = await tempo();
  await p.keyboard.down('KeyG'); await bilderAbwarten(p, 40);
  const vG = await tempo();
  await p.keyboard.up('KeyG');
  pruefe(t.gas[0] === 'KeyG' && vPfeil < 0.3 && vG > 2, 'neue Gas-Taste G beschleunigt das Auto, Pfeil hoch nicht mehr', `Pfeil hoch ${(vPfeil * 3.6).toFixed(1)} km/h, G ${(vG * 3.6).toFixed(1)} km/h`);
  // STANDARD stellt alles zurück
  await pauseTaste(p); await oeffne(p, 2); await oeffne(p, await nrVon(p, 'einst.tasten'));
  await oeffne(p, await nrVon(p, 'tasten.standard'));
  t = await T();
  const std = await A(p, () => JSON.stringify(window.__alpineRally.CONFIG.menue.standard.tasten));
  pruefe(JSON.stringify(t) === std, 'STANDARD stellt alle Tasten zurück');
  pruefe(spiel.fehler.length === 0, 'keine Fehler in der Konsole', spiel.fehler.join(' | '));
  await spiel.schliessen();
}

// =====================================================================
console.log('(i) Demo-Fahrt und Starten');
{
  const spiel = await lade();
  const p = spiel.page;
  const rennStand = () => A(p, () => {
    const A = window.__alpineRally;
    return JSON.stringify({ rennen: A.rennen, rueck: A.rueck, notes: [A.paceNotes.anzeige.anzahl, A.paceNotes.anzeige.naechste] });
  });
  const vorher = await rennStand();
  const pos0 = await A(p, () => [window.__alpineRally.physik.x, window.__alpineRally.physik.z]);
  // warten, bis die Demo ein Stück gefahren ist (höchstens 90 s, Software-Grafik ist langsam)
  await p.waitForFunction((p0) => Math.hypot(window.__alpineRally.physik.x - p0[0], window.__alpineRally.physik.z - p0[1]) > 10, pos0, { timeout: 90000 }).catch(() => {});
  const pos1 = await A(p, () => [window.__alpineRally.physik.x, window.__alpineRally.physik.z]);
  const weg = Math.hypot(pos1[0] - pos0[0], pos1[1] - pos0[1]);
  pruefe(weg > 3 && (await rennStand()) === vorher, 'Demo fährt (Titel), Rennstand bleibt unberührt', `${weg.toFixed(1)} m gefahren`);
  // die ganze Etappe im Zeitraffer: kommt durch, hängt nicht, beginnt von vorn
  const d = await A(p, () => {
    const A = window.__alpineRally;
    A.anhalten = true;
    A.demo.start();
    let t = 0, maxS = 0, steh = 0;
    const q = {};
    while (t < 400) {
      A.demo.schritt(A.SCHRITT); t += A.SCHRITT;
      const s = A.strecke.abfrage(A.physik.x, A.physik.z, q).s;
      if (s > maxS) maxS = s;
      if (A.physik.tempo < 0.5) steh += A.SCHRITT;
      if (A.strecke.s[A.demo.index] > A.strecke.zielS + A.CONFIG.menue.demo.endeNachZiel) break;
    }
    const zeit = t;
    for (let i = 0; i < 20; i++) A.demo.bild(0.05, A.physik.y || 0); // abblenden -> von vorn
    const neu = A.demo.index;
    A.anhalten = false;
    return { zeit, maxS, ziel: A.strecke.zielS, steh, neu, aufprall: A.kollision.letzterAufprall };
  });
  pruefe(d.maxS > d.ziel && d.neu < 30 && d.steh < 3, 'Demo fährt die ganze Etappe und beginnt danach von vorn', `${d.zeit.toFixed(1)} s bis hinter das Ziel, ${d.steh.toFixed(1)} s stehend`);
  pruefe((await rennStand()) === vorher, 'auch danach nichts im Rennstand');
  const best = await A(p, () => { try { return localStorage.getItem('alpineRally.bestzeiten2') || localStorage.getItem('alpineRally.bestzeiten'); } catch { return 'x'; } }); // (M8h: neuer Schlüssel)
  pruefe(best === null, 'keine Bestzeit gespeichert');
  // Hauptmenü -> Starten: Auto steht an der Startposition (seit M5b mit der Schnauze an der Startlinie), Zeit 0
  await bilderAbwarten(p, 10);
  await taste(p, 'Enter'); await zu(p, 0); await taste(p, 'Enter');
  const r = await A(p, () => {
    const A = window.__alpineRally, C = A.CONFIG, s = A.strecke.punktBei(A.strecke.startS - C.grenze.wandHuelle.laenge / 2 - C.rennablauf.schnauzeVorLinie);
    return { zust: A.ablauf.zustand, d: Math.hypot(A.physik.x - s.x, A.physik.z - s.z), v: A.physik.tempo, rennen: A.rennen, auf: A.kollision.letzterAufprall, gang: A.getriebe.anzeige };
  });
  pruefe(r.zust === 'countdown' && r.d < 0.05 && r.v < 0.3 && r.rennen.zustand === 'bereit' && r.rennen.zeit === 0 && r.rennen.naechsterCp === 0 && r.auf === null,
    'Starten: Auto steht sauber an der Startlinie, Zeit 0, Countdown läuft (M5b)', `${r.d.toFixed(3)} m vom Start, Gang ${r.gang}`);
  pruefe(spiel.fehler.length === 0, 'keine Fehler in der Konsole', spiel.fehler.join(' | '));
  await spiel.schliessen();
}

// =====================================================================
console.log('(j) Credits: Mitwirkende und Unterstützer (M5a.1)');
{
  const spiel = await lade();
  const p = spiel.page;
  await taste(p, 'KeyX');
  await bilderAbwarten(p, 3);
  const nrCredits = await nrVon(p, 'menue.credits');
  await oeffne(p, nrCredits);
  await bilderAbwarten(p, 4);
  // Zeilen der Seite: Text, Farbe (Überschrift = Farbe der Gruppen in den Einstellungen)
  const zeilen = () => A(p, () => {
    const A = window.__alpineRally, se = A.menue.seite, M = A.CONFIG.menue;
    const l = typeof se.eintraege === 'function' ? se.eintraege() : se.eintraege;
    return l.map((e) => (e.inhalt ? { text: e.inhalt(), gruppe: e.farbe === M.farbeGruppe } : { text: '', leer: true }));
  });
  const neuOeffnen = () => A(p, () => { const A = window.__alpineRally; A.menue.schliesse(); A.menue.oeffne(A.seiten.credits); });
  const sprache = (s) => A(p, (s) => window.__alpineRally.seiten.einstellungen.eintraege.find((x) => x.text === 'einst.sprache' && x.typ === 'auswahl').setzen(s), s);
  // Überschrift und darunter die Namen (ein Name pro Zeile)
  const gruppe = (z, titel) => {
    const i = z.findIndex((x) => x.text === titel && x.gruppe);
    if (i < 0) return null;
    const namen = [];
    for (const x of z.slice(i + 1)) { if (x.leer || x.gruppe) break; namen.push(x.text); }
    return namen;
  };
  let z = await zeilen();
  const de = { m: gruppe(z, 'MITWIRKENDE'), u: gruppe(z, 'UNTERSTÜTZER') };
  pruefe((await seite(p)) === 'credits' && JSON.stringify(de) === '{"m":["LOUIS"],"u":["SHAI-RON"]}',
    'Deutsch: MITWIRKENDE / LOUIS, UNTERSTÜTZER / SHAI-RON (Überschrift in der Gruppenfarbe)', `${JSON.stringify(de)}`);
  const iIdee = z.findIndex((x) => x.text.startsWith('IDEE')), iM = z.findIndex((x) => x.text === 'MITWIRKENDE');
  pruefe(iIdee >= 0 && iM > iIdee, 'die Gruppen stehen unter "Idee und Design / Gebaut mit Claude"');
  await sprache('en'); await bilderAbwarten(p, 2);
  z = await zeilen();
  const en = { m: gruppe(z, 'CONTRIBUTORS'), u: gruppe(z, 'SUPPORTERS') };
  pruefe(JSON.stringify(en) === '{"m":["LOUIS"],"u":["SHAI-RON"]}', 'Englisch: CONTRIBUTORS / LOUIS, SUPPORTERS / SHAI-RON (Namen nicht übersetzt)', JSON.stringify(en));
  await sprache('de');
  // leere Liste = keine Gruppe
  await A(p, () => { const C = window.__alpineRally.CONFIG.menue.credits; window.__cAlt = { ...C }; C.unterstuetzer = []; });
  await neuOeffnen(); z = await zeilen();
  const leer1 = !z.some((x) => x.text === 'UNTERSTÜTZER') && z.some((x) => x.text === 'MITWIRKENDE');
  await A(p, () => { window.__alpineRally.CONFIG.menue.credits.mitwirkende = []; });
  await neuOeffnen(); z = await zeilen();
  const leer2 = !z.some((x) => x.gruppe);
  pruefe(leer1 && leer2, 'leere Liste = Gruppe erscheint nicht (auch beide leer)');
  // 1 + 1 Namen: passt bei 320x180 ohne Rollen; 6 Namen (3 + 3) und 12 Namen: rollt, nichts abgeschnitten
  const pruefeGroesse = async (m, u) => {
    await A(p, ([m, u]) => { const C = window.__alpineRally.CONFIG.menue.credits; C.mitwirkende = m; C.unterstuetzer = u; }, [m, u]);
    await neuOeffnen(); await bilderAbwarten(p, 3);
    const r0 = await A(p, () => window.__alpineRally.menue.rollen);
    await taste(p, 'ArrowDown', 30); await bilderAbwarten(p, 2);
    const r1 = await A(p, () => window.__alpineRally.menue.rollen);
    await taste(p, 'ArrowUp', 30); await bilderAbwarten(p, 2);
    const r2 = await A(p, () => window.__alpineRally.menue.rollen);
    const zz = await zeilen();
    // jede Liste vollständig, ein Name pro Zeile, unter ihrer Überschrift
    const alle = JSON.stringify(gruppe(zz, 'MITWIRKENDE')) === JSON.stringify(m) && JSON.stringify(gruppe(zz, 'UNTERSTÜTZER')) === JSON.stringify(u);
    return { r0, r1, r2, alle };
  };
  const g2 = await pruefeGroesse(['LOUIS'], ['SHAI-RON']);
  pruefe(g2.r0.max === 0 && g2.r0.y0 >= 0 && g2.r0.y0 + g2.r0.hoehe <= 180, 'mit 2 Namen passt die Seite ganz auf 320x180 (rollt nicht)', `Tafel ${g2.r0.breite}x${g2.r0.hoehe} px, Inhalt ${g2.r0.gesamt} px`);
  const g6 = await pruefeGroesse(['LOUIS', 'ANNA', 'BEAT'], ['SHAI-RON', 'MARIA', 'ZOE']);
  const g12 = await pruefeGroesse(['LOUIS', 'ANNA', 'BEAT', 'CHRIGU', 'DANI', 'EVA'], ['SHAI-RON', 'MARIA', 'ZOE', 'NOAH', 'LEA', 'TIM']);
  for (const [n, g] of [[6, g6], [12, g12]]) {
    pruefe(g.alle && g.r0.scroll === 0 && g.r1.scroll === g.r1.max && g.r1.max === g.r1.gesamt - g.r1.sichtH && g.r2.scroll === 0 && g.r0.y0 >= 0 && g.r0.y0 + g.r0.hoehe <= 180 && g.r0.inhalt + 2 * 6 + 2 <= 316, // (breiter würde die Tafel den Text abschneiden)
      `mit ${n} Namen: Seite beginnt oben, rollt mit Pfeil runter bis ganz unten und zurück, Tafel im Bild`, `Inhalt ${g.r1.gesamt} px, sichtbar ${g.r1.sichtH} px, gerollt bis ${g.r1.max} px`);
  }
  // ZURÜCK geht auch nach dem Rollen
  await taste(p, 'ArrowDown', 30); await taste(p, 'Enter'); await bilderAbwarten(p, 3);
  pruefe((await seite(p)) === 'haupt', 'Enter nach dem Rollen = ZURÜCK zum Hauptmenü');
  await A(p, () => Object.assign(window.__alpineRally.CONFIG.menue.credits, window.__cAlt));
  // Namen: nur Zeichen, die die Pixelschrift kennt; neue Text-Schlüssel in de und en
  const k = await A(p, async () => {
    const { SCHRIFT } = await import('/js/pixel.js');
    const { TEXTE } = await import('/js/texte.js');
    const C = window.__alpineRally.CONFIG.menue.credits;
    const namen = [...C.mitwirkende, ...C.unterstuetzer];
    return {
      zeichen: namen.flatMap((n) => [...n].filter((c) => !SCHRIFT[c])),
      schluessel: ['credits.mitwirkende', 'credits.unterstuetzer'].filter((s) => !(TEXTE[s] && TEXTE[s].de && TEXTE[s].en)),
    };
  });
  pruefe(k.zeichen.length === 0 && k.schluessel.length === 0, 'Namen nur mit Zeichen der Pixelschrift; neue Schlüssel credits.mitwirkende / credits.unterstuetzer in de und en', [...k.zeichen, ...k.schluessel].join(', '));
  pruefe(spiel.fehler.length === 0, 'keine Fehler in der Konsole', spiel.fehler.join(' | '));
  await spiel.schliessen();
}

console.log(fehlerZahl ? `\n${fehlerZahl} Prüfung(en) FEHLGESCHLAGEN` : '\nAlle Prüfungen bestanden.');
process.exit(fehlerZahl ? 1 : 0);
