// Ladezeit alte gegen neue Version (seit M2b):  node tools/ladezeit.mjs <ordner der alten Version> [anzahl]
// Abwechselnd geladen, gemessen im Spiel: Zeit ab Seitenaufruf, bis die Welt fertig gebaut ist.
// Der jeweils andere Browser steht auf einer leeren Seite (sonst bremst die Software-Grafik mit).
import path from 'node:path';
import { starteSpiel } from './spiel-browser.mjs';
const alt = await starteSpiel({ wurzel: path.resolve(process.argv[2]) });
const neu = await starteSpiel();
for (const s of [alt, neu]) await s.page.addInitScript(() => {
  let wert; Object.defineProperty(window, '__alpineRally', { configurable: true, get: () => wert, set: (v) => { wert = v; window.__fertigMs = performance.now(); } });
});
const n = +(process.argv[3] || 7);
async function miss(s) {
  await s.page.goto(`${s.url}/index.html`);
  await s.page.waitForFunction(() => window.__fertigMs, null, { timeout: 120000 });
  const ms = await s.page.evaluate(() => Math.round(window.__fertigMs));
  await s.page.goto('about:blank');
  return ms;
}
const za = [], zn = [];
await miss(alt); await miss(neu);
for (let i = 0; i < n; i++) { za.push(await miss(alt)); zn.push(await miss(neu)); }
const med = (a) => a.slice().sort((x, y) => x - y)[Math.floor(a.length / 2)];
console.log('alt', za.join(' '), 'Median', med(za));
console.log('neu', zn.join(' '), 'Median', med(zn));
await alt.schliessen(); await neu.schliessen();
