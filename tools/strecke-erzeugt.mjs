// Erzeugte Daten in der Streckendatei lesen und schreiben (seit M10a).
// Die Werkzeuge (abkuerzungen.mjs, pacenotes-test.mjs --schreiben, kuhfolge-schreiben.mjs) schrieben früher eigene
// Dateien (js/abkuerzungen.js ...). Jetzt steht alles in strecken/<id>.js im Feld "erzeugt", zwischen den Zeilen
// "// <erzeugt NAME>" und "// </erzeugt>". Die Werkzeuge erzeugen den Text weiter im alten Format
// ("// Kommentar ... export const NAME = { ... };"), hier wird er in den Block umgeformt (und zurück).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const WURZEL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// M10b: Streckenwahl für alle Werkzeuge: --strecke <id oder Datei> (Standard alpen).
// Ergebnis: { id, datei (absolut), relativ (zur Projektwurzel, für Meldungen) }
export function streckenWahl(argv = process.argv) {
  const i = argv.indexOf('--strecke');
  const wert = i > 0 && argv[i + 1] ? argv[i + 1] : 'alpen';
  const datei = /[\\/]|\.js$/.test(wert) ? path.resolve(wert) : path.join(WURZEL, `strecken/${wert}.js`);
  if (!fs.existsSync(datei)) throw new Error(`Streckendatei ${datei} fehlt (--strecke ${wert})`);
  return { id: path.basename(datei, '.js'), datei, relativ: path.relative(WURZEL, datei) };
}
// Datei, in die die Werkzeuge erzeugte Daten schreiben: die gewählte Strecke (--strecke), sonst strecken/alpen.js.
// Mit anderer Wurzel (alter Stand zum Vergleich) die gleichnamige Datei dort.
export const STRECKEN_DATEI = (wurzel = WURZEL) => path.join(wurzel, streckenWahl().relativ);

function grenzen(text, schluessel) {
  const a = text.indexOf(`    // <erzeugt ${schluessel}>`);
  const e = text.indexOf('    // </erzeugt>', a);
  if (a < 0 || e < 0) throw new Error(`Block "<erzeugt ${schluessel}>" fehlt in der Streckendatei`);
  return [a, e + '    // </erzeugt>'.length];
}

// Block lesen, Ergebnis im alten Dateiformat (Kommentare + export const NAME = { ... };)
export function leseErzeugt(schluessel, name, datei = STRECKEN_DATEI()) {
  const text = fs.readFileSync(datei, 'utf8');
  const [a, e] = grenzen(text, schluessel);
  const zeilen = text.slice(a, e).split('\n').slice(1, -1).map((z) => z.replace(/^ {4}/, ''));
  const i = zeilen.findIndex((z) => z.startsWith(`${schluessel}:`));
  const kopf = zeilen.slice(0, i), rumpf = zeilen.slice(i + 1);
  if (zeilen[i].trim() === `${schluessel}: null,`) return `${kopf.join('\n')}\nexport const ${name} = null;\n`;
  rumpf[rumpf.length - 1] = '};';
  return `${kopf.join('\n')}\n\nexport const ${name} = {\n${rumpf.join('\n')}\n`;
}

// Block schreiben (text im alten Dateiformat)
export function schreibeErzeugt(schluessel, text, datei = STRECKEN_DATEI()) {
  const zeilen = text.replace(/\s+$/, '').split('\n');
  const aus = [`    // <erzeugt ${schluessel}>`];
  for (const z of zeilen) {
    if (/^export const \w+ = null;/.test(z)) aus.push(`    ${schluessel}: null,`);
    else if (/^export const \w+ = \{/.test(z)) aus.push(`    ${schluessel}: {`);
    else if (z === '};') aus.push('    },');
    else if (z.trim() === '') continue;
    else aus.push(`    ${z}`.replace(/\s+$/, ''));
  }
  aus.push('    // </erzeugt>');
  const alt = fs.readFileSync(datei, 'utf8');
  const [a, e] = grenzen(alt, schluessel);
  fs.writeFileSync(datei, alt.slice(0, a) + aus.join('\n') + alt.slice(e));
}
