// Seitenprofil eines Autos aus den Modelldaten (Meilenstein 8f): für jede Stelle z die höchste Stelle y der
// Karosserie (Teile mit slot 'lack', ohne Flügel, Lichter und Anbauteile) und die längste „waagrechte Strecke“
// (die Höhe schwankt um weniger als 2 cm). Benutzt von tools/m8f-test.mjs (a). Das Spiel selbst lädt diese Datei nicht.

// Kanten [[z, y], [z, y]] eines Teils in der Seitenansicht
function kanten(t) {
  if (t.art === 'prisma') return t.profil.map((p, i) => [p, t.profil[(i + 1) % t.profil.length]]);
  let ecken = [];
  if (t.art === 'quader') {
    const [, y0, z0] = t.min, [, y1, z1] = t.max;
    ecken = [[z0, y0], [z1, y0], [z1, y1], [z0, y1]];
  } else if (t.art === 'trapez') {
    const [yu, , zuv, zuh] = t.unten, [yo, , zov, zoh] = t.oben;
    ecken = [[zuv, yu], [zuh, yu], [zoh, yo], [zov, yo]];
  }
  // (konvex: alle Paare decken den Umriss ab)
  const k = [];
  for (let i = 0; i < ecken.length; i++) for (let j = i + 1; j < ecken.length; j++) k.push([ecken[i], ecken[j]]);
  return k;
}

export function seitenProfil(modell, zVon, zBis, schritt = 0.01) {
  const K = modell.teile.filter((t) => t.slot === 'lack' && !t.licht).flatMap(kanten);
  const out = [];
  for (let n = 0; ; n++) {
    const z = zVon + n * schritt;
    if (z > zBis + 1e-9) break;
    let ymax = -Infinity;
    for (const [a, b] of K) {
      if ((a[0] - z) * (b[0] - z) > 0) continue;
      const d = b[0] - a[0];
      const y = Math.abs(d) < 1e-12 ? Math.max(a[1], b[1]) : a[1] + ((z - a[0]) / d) * (b[1] - a[1]);
      if (y > ymax) ymax = y;
    }
    out.push([z, ymax]);
  }
  return out;
}

// längste Strecke (m), auf der die Neigung (über je 10 cm) unter grad bleibt, mit Lage, Höhe und mittlerer Neigung
export function flacheStrecke(profil, grad = 3, fenster = 0.1) {
  const n = Math.max(1, Math.round(fenster / (profil[1][0] - profil[0][0])));
  const flach = profil.map((p, i) => {
    const a = profil[Math.max(0, i - (n >> 1))], b = profil[Math.min(profil.length - 1, i + (n >> 1))];
    return Math.abs(Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI) < grad;
  });
  let best = { laenge: 0, von: 0, bis: 0 }, start = -1;
  for (let i = 0; i <= profil.length; i++) {
    if (i < profil.length && flach[i]) { if (start < 0) start = i; continue; }
    if (start >= 0) {
      const l = profil[i - 1][0] - profil[start][0];
      if (l > best.laenge) best = { laenge: l, von: profil[start][0], bis: profil[i - 1][0] };
      start = -1;
    }
  }
  return best;
}
// mittlere Neigung (Grad) zwischen zwei Stellen z (positiv = fällt nach hinten ab)
export function neigung(profil, zHinten, zVorne) {
  const y = (z) => profil.reduce((b, p) => (Math.abs(p[0] - z) < Math.abs(b[0] - z) ? p : b))[1];
  return Math.atan2(y(zVorne) - y(zHinten), zVorne - zHinten) * 180 / Math.PI;
}

// längste Strecke (m), auf der die Höhe um weniger als toleranz schwankt, mit Lage und Höhe
export function waagrechteStrecke(profil, toleranz = 0.02) {
  let best = { laenge: 0, von: 0, bis: 0, hoehe: 0 };
  for (let i = 0; i < profil.length; i++) {
    let lo = profil[i][1], hi = lo;
    for (let j = i + 1; j < profil.length; j++) {
      lo = Math.min(lo, profil[j][1]); hi = Math.max(hi, profil[j][1]);
      if (hi - lo >= toleranz) break;
      const l = profil[j][0] - profil[i][0];
      if (l > best.laenge) best = { laenge: l, von: profil[i][0], bis: profil[j][0], hoehe: (lo + hi) / 2 };
    }
  }
  return best;
}
