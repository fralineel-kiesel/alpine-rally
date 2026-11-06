// Quelltext-Wächter (M10d): sucht in js/*.js Zeilen, die nur aus einer auskommentierten Zuweisung oder einem auskommentierten
// Funktionsaufruf bestehen (z. B. "// tonZ.schaltet = getriebe.schaltet;"), und Code, der hinter einem Kommentar am
// Zeilenende verschwunden ist ("x = 1; // Notiz y = 2;"). So ging in M10c der Schaltton verloren.
// Aufruf: node tools/kommentar-waechter.mjs  (Ende mit Fehlercode 1, wenn etwas ausserhalb der Ausnahmeliste gefunden wird)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const WURZEL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// Muster 1: ganze Zeile ist eine auskommentierte Zuweisung / ein Aufruf, endet mit Strichpunkt (wie Code)
const NUR_KOMMENTAR = /^\s*\/\/\s*[\w$.[\]]+(\s*[-+*/]?=(?!=)\s*\S.*|\(.*\))\s*;\s*$/;
// Muster 2: hinter einem Kommentar am Zeilenende steht etwas wie "a.b = c;" (Zuweisung mit Strichpunkt)
const HINTEN = /\S.*?\/\/.*\b[A-Za-z_$][\w$]*(\.[\w$]+)+\s*=(?!=)[^;]*;/;
// Ausnahmen: Datei und Anfang der Zeile (getrimmt) – nur mit Begründung
export const AUSNAHMEN = [
  ['js/musikstueck.js', "// bass = 'pump'", 'Erklärung der Felder eines Musik-Abschnitts, kein Code'],
  ['js/musikstueck.js', '// schlagzeug = Muster oben', 'Erklärung der Felder eines Musik-Abschnitts, kein Code'],
];

export function pruefe(wurzel = WURZEL) {
  const funde = [];
  for (const name of fs.readdirSync(path.join(wurzel, 'js')).filter((n) => n.endsWith('.js')).sort()) {
    const zeilen = fs.readFileSync(path.join(wurzel, 'js', name), 'utf8').split('\n');
    zeilen.forEach((z, i) => {
      const t = z.trim();
      // Zeichenketten mit "//" (URLs) nicht als Kommentar zählen
      const ohneText = z.replace(/'[^']*'|"[^"]*"|`[^`]*`/g, "''");
      const art = NUR_KOMMENTAR.test(z) ? 'auskommentiert' : (!t.startsWith('//') && HINTEN.test(ohneText) ? 'hinter Kommentar' : null);
      if (!art) return;
      const datei = `js/${name}`, ausnahme = AUSNAHMEN.find(([d, a]) => d === datei && t.startsWith(a));
      funde.push({ datei, zeile: i + 1, art, text: t.slice(0, 140), ausnahme: ausnahme ? ausnahme[2] : null });
    });
  }
  return funde;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const funde = pruefe(process.argv[2] ? path.resolve(process.argv[2]) : WURZEL);
  const offen = funde.filter((f) => !f.ausnahme);
  for (const f of funde) console.log(`${f.ausnahme ? 'Ausnahme' : 'FUND    '} ${f.datei}:${f.zeile} (${f.art}) ${f.text}${f.ausnahme ? ` – ${f.ausnahme}` : ''}`);
  console.log(offen.length ? `${offen.length} verdächtige Zeile(n)` : `keine verdächtigen Zeilen (${funde.length} Ausnahmen)`);
  process.exit(offen.length ? 1 : 0);
}
