// Sichtlinien-Check für die Stummel (Meilenstein 3a). Läuft im Browser (von
// tools/stummel-sicht.mjs und tools/nebenweg-test.mjs gestartet), das Spiel lädt diese Datei nicht.
//
// Frage: Sieht man von irgendeiner Fahrposition auf der Etappe das Ende eines Stummels?
// Kameras: entlang der Etappe alle 5 m, +-200 m um jede Kreuzung, auf der Strassenmitte und
// 2.5 m links/rechts davon, 2.5 m hoch, 3.1 m hinter dem Auto (Wert aus dem Auftrag) und
// 6.9 m hinter dem Auto (kamera.abstand im Spiel). Gezählt wird nur, was im Bild liegen kann
// (Blickwinkel der Kamera nach vorn, plus Reserve).
// Ziele: die letzten 40 m des Stummels (alle 5 m, auf der Mitte und an beiden Asphaltkanten,
// 0.3 m über der Strasse) und das Ende selbst.
// Ein Strahl ist verdeckt, wenn das Gelände (welt.gelaendeHoehe) oder die Strasse darüber liegt
// oder er durch die Krone eines Baums geht (Tannen und Laubbäume, schmaler gerechnet als ihr Bild).

export function pruefeSicht(A, { vorNach = 200, schritt = 5, abstaende = [3.1, 6.9], hoehe = 2.5, seiten = [-2.5, 0, 2.5], letzte = 40, stummel = null, baeume: mitBaeumen = true } = {}) {
  const S = A.strecke, W = A.welt, N = A.netz;
  const q = {};
  // Bäume in einem Raster (für die Kronen-Prüfung)
  const baeume = [...A.pflanzen.tannen, ...A.pflanzen.laubbaeume].filter((b) => b.h > 2.5);
  const Z = 16, raster = new Map();
  for (const b of baeume) {
    const k = `${Math.floor(b.x / Z)},${Math.floor(b.z / Z)}`;
    if (!raster.has(k)) raster.set(k, []);
    raster.get(k).push(b);
  }
  const krone = (x, y, z) => {
    const liste = raster.get(`${Math.floor(x / Z)},${Math.floor(z / Z)}`);
    if (!liste) return false;
    for (const b of liste) {
      if (y < b.y + b.h * 0.18 || y > b.y + b.h * 0.92) continue;
      // Krone wird nach oben schmaler (Tanne): Radius an dieser Höhe, nur 60 % des Bildes
      const f = (y - b.y) / b.h;
      const r = b.b * 0.5 * 0.6 * Math.min(1, (1 - f) * 1.4);
      if ((b.x - x) ** 2 + (b.z - z) ** 2 < r * r) return true;
    }
    return false;
  };
  const boden = (x, z) => {
    const g = W.gelaendeHoehe(x, z);
    const b = W.bodenBei(x, z);
    return Math.max(g, b.h);
  };
  // Ist der Strahl von a nach b frei? (die letzten 1.5 m vor dem Ziel zählen nicht: das Ziel liegt auf der Strasse)
  function frei(a, b) {
    const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2];
    const L = Math.hypot(dx, dz);
    const n = Math.ceil(L / 0.8);
    for (let k = 1; k < n; k++) {
      const f = k / n;
      if (L * (1 - f) < 1.5) break;
      const x = a[0] + dx * f, y = a[1] + dy * f, z = a[2] + dz * f;
      if (boden(x, z) > y) return { frei: false, grund: 'gelaende', bei: L * f };
      if (mitBaeumen && krone(x, y, z)) return { frei: false, grund: 'baum', bei: L * f };
    }
    return { frei: true };
  }
  const halbFov = Math.atan(Math.tan((A.CONFIG.kamera.sichtfeld * Math.PI) / 360) * (16 / 9)) + (10 * Math.PI) / 180;
  const ergebnis = [];
  for (const ast of N.aeste) {
    if (stummel != null && ast.nr !== stummel) continue;
    // Ziele
    const ziele = [];
    for (let u = Math.max(ast.sperreU + 5, ast.laenge - letzte); u <= ast.laenge; u += 5) {
      const i = Math.min(ast.anzahl - 1, Math.round(u));
      for (const lat of [-ast.halb, 0, ast.halb]) {
        ziele.push({ u: i, lat, p: [ast.px[i] - ast.tz[i] * lat, ast.py[i] + 0.3, ast.pz[i] + ast.tx[i] * lat] });
      }
    }
    let strahlen = 0, sichtbar = 0;
    const gesehen = [];
    for (let s = Math.max(5, ast.sJ - vorNach); s <= Math.min(S.laenge - 5, ast.sJ + vorNach); s += schritt) {
      const p = S.punktBei(s);
      for (const lat of seiten) {
        for (const d of abstaende) {
          const ax = p.x - p.tz * lat - p.tx * d, az = p.z + p.tx * lat - p.tz * d;
          const kam = [ax, p.h + hoehe, az];
          for (const z of ziele) {
            const wz = Math.atan2(z.p[0] - ax, z.p[2] - az), wf = Math.atan2(p.tx, p.tz);
            let dw = wz - wf;
            dw = Math.atan2(Math.sin(dw), Math.cos(dw));
            if (Math.abs(dw) > halbFov) continue;
            strahlen++;
            const r = frei(kam, z.p);
            if (r.frei) { sichtbar++; gesehen.push({ s, lat, d, u: z.u, zielLat: z.lat, entfernung: Math.round(Math.hypot(z.p[0] - ax, z.p[2] - az)) }); }
          }
        }
      }
    }
    ergebnis.push({ stummel: ast.nr, art: ast.art, sJ: ast.sJ, laenge: ast.laenge, ziele: ziele.length, strahlen, sichtbar, gesehen });
  }
  return ergebnis;
}
