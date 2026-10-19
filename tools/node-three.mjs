// Hilfe für Werkzeuge (M8a): js/car.js ohne Browser laden (z. B. Speicher pro Bild in Node messen).
// Leitet 'three' auf lib/three.module.min.js um und legt eine einfache Attrappe für "document" und Leinwände an
// (malen tut sie nichts). Das Spiel selbst lädt diese Datei nicht.
import { register } from 'node:module';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const WURZEL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const three = pathToFileURL(path.join(WURZEL, 'lib/three.module.min.js')).href;
register(`data:text/javascript,${encodeURIComponent(`export async function resolve(s, c, n) { return s === 'three' ? { url: ${JSON.stringify(three)}, shortCircuit: true } : n(s, c); }`)}`);

const leinwand = () => {
  const ctx = new Proxy({}, { get: (z, k) => (k in z ? z[k] : () => ({ data: [] })), set: (z, k, w) => { z[k] = w; return true; } });
  return { width: 1, height: 1, getContext: () => ctx, toDataURL: () => '' };
};
if (!globalThis.document) globalThis.document = { createElement: () => leinwand() };

// js/car.js laden (wurzel: anderes Projekt, z. B. die alte Version zum Vergleich)
export async function ladeAuto(wurzel = WURZEL) {
  return import(pathToFileURL(path.join(wurzel, 'js/car.js')).href);
}
