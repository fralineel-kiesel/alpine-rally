// Sichtlinien-Check für die Stummel (Meilenstein 3a):  node tools/stummel-sicht.mjs [--alle]
// Sieht man von der Etappe aus irgendwo das Ende eines Stummels? (Einzelheiten: tools/stummel-sicht.js)
// Seit M3c auch die Verlängerungen an Start und Ziel (von der Etappe und der Verlängerung aus,
// vorwärts und gewendet).
// --alle: jeden sichtbaren Strahl auflisten (sonst nur die ersten pro Stummel)
// --nur-gelaende: Bäume nicht mitzählen (zeigt, wo nur der Wald das Ende versteckt)

import { starteSpiel } from './spiel-browser.mjs';

const spiel = await starteSpiel();
await spiel.ladeSpiel();
const nurGelaende = process.argv.includes('--nur-gelaende');
const erg = await spiel.page.evaluate(async (nurGelaende) => {
  const m = await import('/tools/stummel-sicht.js');
  return { stummel: m.pruefeSicht(window.__alpineRally, { baeume: !nurGelaende }), enden: m.pruefeSichtEnden(window.__alpineRally, { baeume: !nurGelaende }) };
}, nurGelaende);
if (nurGelaende) console.log('(nur Gelände, Bäume zählen nicht)');
let fehler = 0;
for (const e of erg.stummel) {
  console.log(`Stummel ${e.stummel} (${e.art} bei ${e.sJ} m, ${e.laenge} m lang): ${e.strahlen} Strahlen geprüft, ` +
    `${e.sichtbar} sehen das Ende ${e.sichtbar ? '-> NICHT BESTANDEN' : '-> bestanden'}`);
  fehler += e.sichtbar;
  for (const g of e.gesehen.slice(0, process.argv.includes('--alle') ? Infinity : 12)) {
    console.log(`   von Etappe ${g.s} m (seitlich ${g.lat}, Kamera ${g.d} m hinter dem Auto) sieht man Stummel-Meter ${g.u} (Kante ${g.zielLat}), ${g.entfernung} m weit`);
  }
}
for (const e of erg.enden) {
  console.log(`Verlängerung ${e.ende} (${e.laenge} m, Absperrung bei ${e.sperreU} m): ${e.posten} Fahrpositionen, ${e.strahlen} Strahlen, ` +
    `${e.sichtbar} sehen das Ende ${e.sichtbar ? '-> NICHT BESTANDEN' : '-> bestanden'}`);
  fehler += e.sichtbar;
  for (const g of e.gesehen.slice(0, process.argv.includes('--alle') ? Infinity : 12)) {
    console.log(`   von ${g.wo} (${g.richtung}, seitlich ${g.lat}, Kamera ${g.d} m hinter dem Auto) sieht man Meter ${g.u} (Kante ${g.zielLat}), ${g.entfernung} m weit`);
  }
}
if (spiel.fehler.length) { console.log('Fehler im Spiel:', spiel.fehler); fehler++; }
await spiel.schliessen();
process.exit(fehler ? 1 : 0);
