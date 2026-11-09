// Fangnetze und Fangzäune (Meilenstein 11b, Streckendatei "fangnetze"): orange Netze an der Hangseite und an den
// Aussenseiten der Kehren im Skigebiet. Sie wirken wie Zaun und Leitplanke (Wand mit Wand-Strafe, js/wand.js): jedes
// Netz ist eine Reihe kleiner Kreise mit rand 'zaun' für die Kollision. Gezeichnet in einem Zeichenaufruf (Pfosten und
// Netz in einer Fläche, Pixel-Textur mit Löchern). Ohne "fangnetze" (Alpen, Finnland) passiert hier nichts.
// Eintrag: { von, bis, seite: -1 links / +1 rechts, art: 'netz' (hoch, Maschen) oder 'zaun' (niedriger, dicht) }.
// Werte: config.js, Block fangnetz.
import * as THREE from 'three';
import { CONFIG } from './config.js';
import { STRECKE } from './streckenlader.js';
import { leinwand, setze, zuTextur, hexZuRgb } from './pixel.js';

// Textur 16 x 16: links Netz (Maschen mit Löchern), rechts Zaun (dichte Latten mit schmalen Schlitzen); dunkle Pfosten
// am linken Rand jeder Hälfte, oben eine dunklere Kante (Seil)
function netzTextur(C) {
  const l = leinwand(32, 16), o = hexZuRgb(C.farbe), d = hexZuRgb(C.farbeDunkel), p = hexZuRgb(C.pfosten);
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
    if (x === 0) setze(l, x, y, p);
    else if (y === 0) setze(l, x, y, d);
    else if ((x + y) % 4 === 0 || (x - y + 16) % 4 === 0) setze(l, x, y, (x + y) % 8 === 0 ? d : o); // Maschen (Rauten)
  }
  for (let y = 0; y < 16; y++) for (let x = 16; x < 32; x++) {
    if (x === 16) setze(l, x, y, p);
    else if (y === 0 || y === 15) setze(l, x, y, d);
    else if (x % 4 !== 3) setze(l, x, y, y % 5 === 2 ? d : o); // dichte Latten
  }
  return zuTextur(l, { wiederholen: false, mipmaps: false });
}

export function baueFangnetze(szene, strecke, netz, welt) {
  const L = (STRECKE && STRECKE.fangnetze) || [], C = CONFIG.fangnetz;
  if (!L.length || !C) return { an: false, hindernisse: [], meshes: [], liste: [] };
  const pos = [], uv = [], idx = [], hindernisse = [], liste = [];
  const bank = CONFIG.strasse.bankett;
  for (const e of L) {
    const art = e.art === 'zaun' ? 'zaun' : 'netz', H = art === 'zaun' ? C.hoeheZaun : C.hoehe;
    const u0 = art === 'zaun' ? 0.5 : 0, sd = e.seite >= 0 ? 1 : -1;
    // Linie: alle schritt Meter ein Punkt neben dem Bankett (folgt der Breite der Strasse)
    const pkt = [];
    for (let s = e.von; s <= e.bis + 1e-6; s += C.schritt) {
      const p = strecke.punktBei(s), lat = sd * (netz.halbBei(s) + bank + C.abstand);
      const x = p.x - p.tz * lat, z = p.z + p.tx * lat;
      pkt.push({ x, z, y: Math.min(welt.gelaendeHoehe(x, z), p.h - 0.2) });
    }
    // Fläche: ein senkrechtes Band (beidseitig sichtbar über das Material), Textur je Feld einmal
    for (let k = 0; k < pkt.length; k++) {
      const q = pkt[k], b = pos.length / 3;
      pos.push(q.x, q.y, q.z, q.x, q.y + H, q.z);
      uv.push(u0 + (k % 2 ? 0.499 : 0), 0, u0 + (k % 2 ? 0.499 : 0), 1);
      if (k > 0) idx.push(b - 2, b, b - 1, b - 1, b, b + 1);
    }
    // Kollision: kleine Kreise entlang der Linie (rand 'zaun' = Wand mit Wand-Strafe)
    for (let k = 0; k + 1 < pkt.length; k++) {
      const a = pkt[k], c = pkt[k + 1], n = Math.max(1, Math.ceil(Math.hypot(c.x - a.x, c.z - a.z) / C.kreisAbstand));
      for (let j = 0; j < n; j++) hindernisse.push({ x: a.x + (c.x - a.x) * (j / n), z: a.z + (c.z - a.z) * (j / n), r: C.kreisRadius, rand: 'zaun', netz: true });
    }
    liste.push({ von: e.von, bis: e.bis, seite: sd, art });
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx); geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ map: netzTextur(C), alphaTest: 0.5, side: THREE.DoubleSide, emissive: new THREE.Color(C.leuchten), emissiveIntensity: 1 }));
  szene.add(mesh);
  return { an: true, hindernisse, meshes: [mesh], liste };
}
