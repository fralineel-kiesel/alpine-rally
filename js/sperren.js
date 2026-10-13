// Abkürzungs-Sperren: Felsbrocken, Tannengruppen oder umgefallene Baumstämme
// auf der Innenseite von Kurven, die man sonst schneiden könnte.
//
// Wo eine Sperre steht, rechnet das Werkzeug tools/abkuerzungen.mjs aus und
// schreibt es nach js/abkuerzungen.js. Jede Sperre ("Reihe") ist eine Linie, die
// an der Stelle s quer von der Strasse weg ins Kurveninnere führt (von / bis =
// Abstand zur Strassenmitte). Entlang dieser Linie muss eine lückenlose Kette
// stehen (Lücken höchstens maxLuecke, das Auto ist breiter).
//
// Seit Meilenstein 2a.1 werden die Reihen einer Kurve zusammen geplant:
//   - eine Kurve = zusammenhängende Reihen (gleiche Seite, wenig Abstand)
//   - jede Kurve hat EIN Thema: nur Felsbrocken (mit ein paar kleinen Steinen),
//     nur umgefallene Stämme oder nur Tannen. Nachbarkurven nie dasselbe Thema.
//   - Teile, die schon stehen (auch Bäume/Steine aus der Landschaft), zählen für
//     die Kette mit. So laufen Reihen, die sich in der Kehre treffen, in einer
//     Gruppe zusammen statt als Mauer nebeneinander.
//   - kein Teil steckt in einem anderen (Abstand der Kreise plus abstandTeile)
// Wie es aussieht (Grössen, Lücken, Themen), steht in config.js unter "sperren".
// Fester Zufalls-Startwert: bei jeder Fahrt gleich.

import * as THREE from 'three';
import { CONFIG } from './config.js';
import { zufall, mische } from './util.js';
import { rindenTextur, holzringTextur } from './pixel.js';

const GRAD = Math.PI / 180;
export const THEMEN = ['fels', 'staemme', 'baeume'];

// Zufallszahl zwischen a und b, ganze Zahl zwischen a und b
const zwischen = (rnd, [a, b]) => mische(a, b, rnd());
const ganz = (rnd, [a, b]) => a + Math.floor(rnd() * (b - a + 1));

// Reihen zu Kurven zusammenfassen: gleiche Seite und weniger als gruppenAbstand Meter
// auseinander. Ergebnis (nach Streckenmeter sortiert): { seite, sVon, sBis, reihen }
export function gruppiereSperren(liste) {
  const c = CONFIG.sperren;
  const sortiert = liste.slice().sort((a, b) => a.seite - b.seite || a.s - b.s);
  const gruppen = [];
  for (const r of sortiert) {
    const g = gruppen[gruppen.length - 1];
    if (g && g.seite === r.seite && r.s - g.sBis < c.gruppenAbstand) { g.reihen.push(r); g.sBis = r.s; } else gruppen.push({ seite: r.seite, sVon: r.s, sBis: r.s, reihen: [r] });
  }
  return gruppen.sort((a, b) => a.sVon - b.sVon);
}

// Thema jeder Kurve: zuerst von Hand (config.js "themen", Schlüssel = ein Streckenmeter in
// der Kurve), dann mit festem Zufall. Nachbarkurven bekommen nie dasselbe Thema, Themen,
// die noch fehlen, kommen zuerst dran. Setzt g.thema und (in höchstens einer Kurve) g.beimischung.
export function waehleThemen(gruppen) {
  const c = CONFIG.sperren;
  const rnd = zufall(c.seed + 3);
  const vonHand = Object.entries(c.themen || {});
  for (const g of gruppen) {
    const treffer = vonHand.find(([s]) => +s >= g.sVon - c.gruppenAbstand && +s <= g.sBis + c.gruppenAbstand);
    g.thema = treffer && THEMEN.includes(treffer[1]) ? treffer[1] : null;
  }
  gruppen.forEach((g, i) => {
    if (g.thema) return;
    const nachbarn = [gruppen[i - 1], gruppen[i + 1]].filter(Boolean).map((n) => n.thema);
    let wahl = THEMEN.filter((t) => !nachbarn.includes(t));
    const fehlt = wahl.filter((t) => !gruppen.some((h) => h.thema === t));
    if (fehlt.length) wahl = fehlt;
    g.thema = wahl[Math.floor(rnd() * wahl.length)] || THEMEN[0];
  });
  const b = c.beimischung;
  const g = b && b.anteil > 0 ? gruppen.find((x) => x.thema === b.in) : null;
  if (g && b.thema !== g.thema) g.beimischung = b.thema;
  return gruppen;
}

// Plant alle Sperren (ohne 3D-Objekte; das Werkzeug braucht das auch).
// liste: Reihen { s, seite (+1 = rechts, -1 = links), von, bis }
// tex: Seitenverhältnisse der Sprites { tanne, fels, stein }
// basis: Hindernisse der Landschaft (Bäume, Steine), damit nichts in einem Baum steht
// Ergebnis: { tannen, felsen, steine, staemme, hindernisse, gruppen }
export function planeAlleSperren(liste, strecke, welt, tex, basis = []) {
  const alle = { tannen: [], felsen: [], steine: [], staemme: [], hindernisse: [], gruppen: [] };
  const gruppen = waehleThemen(gruppiereSperren(liste));
  for (const g of gruppen) {
    const e = planeKurve(g, strecke, welt, tex, basis);
    for (const k of Object.keys(alle)) if (k !== 'gruppen') alle[k].push(...e[k]);
    alle.gruppen.push({
      sVon: g.sVon, sBis: g.sBis, seite: g.seite, thema: g.thema, beimischung: g.beimischung || null, reihen: g.reihen.length,
      felsen: e.felsen.length, staemme: e.staemme.length, tannen: e.tannen.length, steine: e.steine.length, ueberlapp: e.ueberlapp,
    });
  }
  return alle;
}

// Eine Kurve planen: alle Reihen nacheinander, mit gemeinsamer Liste der Teile
function planeKurve(gruppe, strecke, welt, tex, basis) {
  const c = CONFIG.sperren, kc = CONFIG.kollision;
  const rnd = zufall(c.seed + Math.round(gruppe.sVon * 10) * 2 + (gruppe.seite > 0 ? 1 : 0));
  const q = {};
  const teile = [];      // was in dieser Kurve steht
  let ueberlapp = 0;     // Teile, die trotz allem ineinander stecken (Notlösung, sollte 0 sein)

  // Landschaft in der Nähe (Bäume/Steine aus M1): zählt für die Kette und für "nichts ineinander"
  const p0 = strecke.punktBei((gruppe.sVon + gruppe.sBis) / 2);
  const umkreis = (gruppe.sBis - gruppe.sVon) / 2 + c.maxTiefe + 10;
  const fremde = basis.filter((h) => Math.hypot(h.x - p0.x, h.z - p0.z) < umkreis)
    .map((h) => ({ x: h.x, z: h.z, r: h.r, sicht: h.r + 0.05 }));

  // Darf ein Kreis hier stehen? (weit genug von jeder Strasse, nicht in der Felswand)
  function platzOk(x, z, r, mindest) {
    strecke.abfrage(x, z, q);
    if (q.abstand - r < mindest) return false;
    if (q.wandSeite && Math.sign(q.seite) === q.wandSeite && q.wandStaerke > 0.05) return false;
    return true;
  }

  // Kreise eines Teils in der Welt: für die Kollision (r) und für "nichts ineinander" (sicht)
  function kreise(t) {
    if (t.art !== 'stamm') return [{ x: t.x, z: t.z, r: t.r, sicht: t.sicht }];
    if (t.oben) return []; // liegt auf den anderen, die halten schon
    const liste = [];
    const n = Math.max(1, Math.round(t.laenge / c.stammKreisAbstand));
    for (let k = 0; k <= n; k++) {
      const f = k / n - 0.5;
      liste.push({ x: t.x + t.dx * f * (t.laenge - t.r), z: t.z + t.dz * f * (t.laenge - t.r), r: t.r, sicht: t.r });
    }
    return liste;
  }
  // steht ein neues Glied (mehrere Teile) frei, ohne in etwas anderem zu stecken?
  function frei(neu) {
    const kr = neu.flatMap(kreise);
    for (const t of teile) {
      for (const a of kreise(t)) {
        for (const b of kr) if (Math.hypot(a.x - b.x, a.z - b.z) < a.sicht + b.sicht + c.abstandTeile) return false;
      }
    }
    for (const a of fremde) for (const b of kr) if (Math.hypot(a.x - b.x, a.z - b.z) < a.sicht + b.sicht + c.abstandTeile) return false;
    return true;
  }

  // --- Bausteine (in Weltkoordinaten). ort(d, u) rechnet Reihen-Koordinaten um.
  function fels(x, z, h) {
    const b = h * tex.fels.seitenVerhaeltnis;
    return { art: 'fels', x, z, h, b, r: b * c.felsFaktor, sicht: b * c.felsSicht };
  }
  function stein(x, z, h) {
    const b = h * tex.stein.seitenVerhaeltnis;
    return { art: 'stein', x, z, h, b, r: b * kc.steinFaktor, sicht: b * c.felsSicht };
  }
  function tanne(x, z, h) {
    return { art: 'tanne', x, z, h, b: h * tex.tanne.seitenVerhaeltnis, r: kc.stammRadius, sicht: kc.stammRadius };
  }
  // höchste Tanne, deren Krone an dieser Stelle nicht über die Strasse hängt
  function tannenHoehe(x, z) {
    strecke.abfrage(x, z, q);
    return ((q.abstand - c.kroneAbstand) * 2) / tex.tanne.seitenVerhaeltnis;
  }
  // Stapel umgefallener Stämme: Mitte (x, z), Richtung (ax, az), unten 1 oder 2 nebeneinander,
  // beim 3er-Stapel einer oben drauf
  function stapel(x, z, ax, az, laenge, dicke, anzahl) {
    const r = dicke / 2;
    const unten = anzahl === 1 ? [0] : [-r * 1.02, r * 1.02];
    const lagen = unten.map((v) => ({ v, hoch: 0 }));
    if (anzahl === 3) lagen.push({ v: 0, hoch: r * 1.7 });
    return lagen.map((lage, k) => ({
      art: 'stamm', x: x - az * lage.v, z: z + ax * lage.v, dx: ax, dz: az,
      laenge: laenge * (k === 2 ? 0.85 : 1) * (k === 1 ? 0.92 : 1), r, sicht: r, hoch: lage.hoch, oben: lage.hoch > 0,
    }));
  }

  // --- Reihen nacheinander zu Ketten machen
  for (const reihe of gruppe.reihen.slice().sort((a, b) => a.s - b.s)) {
    const rr = zufall(c.seed + Math.round(reihe.s * 10) * 2 + (reihe.seite > 0 ? 1 : 0));
    const p = strecke.punktBei(reihe.s);
    const nx = -p.tz * reihe.seite, nz = p.tx * reihe.seite; // von der Strasse weg ins Kurveninnere
    const ux = p.tx, uz = p.tz;                              // entlang der Strasse
    const ort = (d, u) => [p.x + nx * d + ux * u, p.z + nz * d + uz * u];
    const lokal = (k) => ({ d: (k.x - p.x) * nx + (k.z - p.z) * nz, u: (k.x - p.x) * ux + (k.z - p.z) * uz, r: k.r });
    // Die Kette verläuft leicht schräg und pendelt seitlich (keine gerade Reihe)
    const schraeg = Math.tan((rr() - 0.5) * 2 * c.schraeg * GRAD);
    const pendel = (rr() - 0.5) * c.seitlich;
    const uBei = (d) => (d - reihe.von) * schraeg + pendel;
    // kleinste Lücke (Kante zu Kante) zwischen zwei Gruppen von Kreisen
    const luecke = (a, b) => {
      let min = Infinity;
      for (const k1 of a) for (const k2 of b) min = Math.min(min, Math.hypot(k1.x - k2.x, k1.z - k2.z) - k1.r - k2.r);
      return min;
    };

    let front = reihe.von; // bis hier ist die Kette geschlossen (Abstand zur Strassenmitte)
    let kette = null;      // Kreise des letzten Glieds
    for (let runde = 0; runde < 80 && front < reihe.bis; runde++) {
      // a) Setzt etwas, das schon steht, die Kette fort? (im Korridor der Reihe, Lücke klein genug)
      const fortsetzung = (breite) => {
        let weiter = null, weiterD = front + 0.3;
        for (const k of teile.flatMap(kreise).concat(fremde)) {
          const l = lokal(k);
          if (Math.abs(l.u - uBei(l.d)) > breite + l.r || l.d + l.r <= weiterD) continue;
          if (kette ? luecke(kette, [k]) > c.maxLuecke : l.d - l.r > reihe.von + 0.5) continue;
          weiter = k; weiterD = l.d + l.r;
        }
        if (weiter) { front = weiterD; kette = [weiter]; }
        return !!weiter;
      };
      if (fortsetzung(c.korridor)) continue;

      // b) neues Glied. Art: Thema der Kurve, ab und zu die Beimischung
      let art = gruppe.thema;
      if (gruppe.beimischung && rnd() < c.beimischung.anteil) art = gruppe.beimischung;
      const spalt = zwischen(rnd, c.luecke);
      const versuche = [];
      // Varianten: seitlich verschoben, kleiner, mit kleinerer Lücke – die erste, die passt, gilt
      const seitlich = [0, 0.7, -0.7, 1.4, -1.4];
      const groesse = [1, 0.8, 0.62];
      const jitter = (rnd() - 0.5) * 0.8;
      if (art === 'fels') {
        const h0 = zwischen(rnd, c.felsHoehe);
        for (const g of groesse) for (const du of seitlich) for (const sp of [spalt, 0.15]) versuche.push({ g, du, sp });
        for (const v of versuche) {
          const b = h0 * v.g * tex.fels.seitenVerhaeltnis, r = b * c.felsFaktor;
          v.teile = (d) => { const [x, z] = ort(d + r, uBei(d + r) + jitter + v.du); return [fels(x, z, h0 * v.g)]; };
        }
      } else if (art === 'baeume') {
        for (const du of seitlich) for (const sp of [spalt, 0.15]) versuche.push({ du, sp, g: 1 });
        const hWunsch = zwischen(rnd, c.baumHoehe);
        for (const v of versuche) {
          v.teile = (d) => {
            const [x, z] = ort(d + kc.stammRadius, uBei(d + kc.stammRadius) + jitter + v.du);
            const h = Math.min(hWunsch, tannenHoehe(x, z));
            return h < c.jungHoehe ? null : [tanne(x, z, h)];
          };
        }
      } else {
        // Stämme: so lang, dass sie den Rest der Reihe möglichst in einem Stück zu machen
        const dicke = zwischen(rnd, c.stammDicke);
        const anzahl = ganz(rnd, c.stammStapel);
        const w0 = (rnd() - 0.5) * 2 * c.stammDrehung * GRAD;
        const rest = reihe.bis - front;
        const l0 = Math.max(c.stammLaenge[0], Math.min(c.stammLaenge[1], rest / Math.cos(w0) + dicke * 0.5 + rnd()));
        // Lieber lang als hoch gestapelt: erst volle Länge (Stapel, dann einzelner Stamm, auch
        // stärker gedreht), dann kürzer
        for (const lf of [1, 0.8, 0.62, 0.45]) {
          for (const anz of anzahl > 1 ? [anzahl, 1] : [1]) {
            for (const w of anz === anzahl ? [w0, -w0, w0 * 0.4] : [w0, -w0, w0 + 35 * GRAD, w0 - 35 * GRAD]) {
              for (const du of seitlich.slice(0, 3)) versuche.push({ lf, w, du, sp: spalt, anz });
            }
          }
        }
        for (const v of versuche) {
          const laenge = Math.max(c.stammKurz, l0 * v.lf);
          v.teile = (d) => {
            // Richtung (d, u) -> Welt; Mitte so, dass das nahe Ende bei d liegt
            const ad = Math.cos(v.w), au = Math.sin(v.w);
            const r = dicke / 2;
            const dm = d + r + ((laenge - r) / 2) * Math.abs(ad);
            const [x, z] = ort(dm, uBei(dm) + jitter * 0.5 + v.du);
            return stapel(x, z, nx * ad + ux * au, nz * ad + uz * au, laenge, dicke, v.anz);
          };
        }
      }
      // Platz prüfen: frei von Strasse und Felswand, nichts steckt ineinander, Lücke zur Kette
      // klein genug. Das erste Glied darf etwas weiter weg rücken (Kurve, Bankett).
      let gewaehlt = null;
      const ok = (neu) => neu && neu.every((t) => kreise(t).concat(t.oben ? [] : [{ x: t.x, z: t.z, r: t.r }])
        .every((kr) => platzOk(kr.x, kr.z, kr.r, c.abstandMitte)));
      const anschluss = (neu) => !kette || luecke(kette, neu.flatMap(kreise)) <= c.maxLuecke;
      for (const schub of kette ? [0] : [0, 0.25, 0.5, 0.75, 1, 1.5, 2]) {
        for (const v of versuche) {
          const neu = v.teile(front + (kette ? v.sp : 0) + schub);
          if (ok(neu) && anschluss(neu) && frei(neu)) { gewaehlt = neu; break; }
        }
        if (gewaehlt) break;
      }
      // kein Platz für ein neues Teil: schliesst etwas etwas weiter neben der Linie an?
      if (!gewaehlt && fortsetzung(c.korridor * 2.5)) continue;
      if (!gewaehlt) {
        // Notlösung: die Kette muss zu sein. Kleinste Variante direkt anschliessend, auch wenn
        // sie etwas berührt (wird gezählt und vom Werkzeug gemeldet, heute 0 Mal).
        const neu = versuche.length ? versuche[versuche.length - 1].teile(front + 0.15) : null;
        const not = neu && ok(neu) && anschluss(neu) ? neu : null;
        if (!not) break; // hier geht es nicht weiter (z. B. die nächste Kehre kommt)
        gewaehlt = not;
        ueberlapp++;
      }
      teile.push(...gewaehlt);
      kette = gewaehlt.flatMap(kreise);
      front = Math.max(...kette.map((k) => lokal(k).d + k.r));

      // Felsbrocken liegen in lockeren Gruppen: ab und zu ein kleinerer daneben
      if (gewaehlt[0].art === 'fels' && rnd() < c.felsBegleit) {
        const an = gewaehlt[0];
        const h = an.h * zwischen(rnd, [0.55, 0.8]);
        for (let versuch = 0; versuch < 6; versuch++) {
          const w = rnd() * Math.PI * 2, abst = an.sicht + h * tex.fels.seitenVerhaeltnis * c.felsSicht + c.abstandTeile + zwischen(rnd, [0.1, 0.8]);
          const t = fels(an.x + Math.cos(w) * abst, an.z + Math.sin(w) * abst, h);
          if (ok([t]) && frei([t])) { teile.push(t); break; }
        }
      }
      // Tannen stehen in Gruppen: ab und zu ein, zwei Begleiter daneben
      if (gewaehlt[0].art === 'tanne') {
        const n = rnd() < c.baumBegleit ? ganz(rnd, [1, 2]) : 0;
        for (let k = 0; k < n; k++) {
          const an = gewaehlt[0];
          const w = rnd() * Math.PI * 2, abst = zwischen(rnd, c.baumAbstand);
          const x = an.x + Math.cos(w) * abst, z = an.z + Math.sin(w) * abst;
          const h = Math.min(zwischen(rnd, c.baumHoehe) * 0.9, tannenHoehe(x, z));
          if (h < c.jungHoehe) continue;
          const t = tanne(x, z, h);
          if (ok([t]) && frei([t])) teile.push(t);
        }
      }
    }
  }

  // Felsbrocken bekommen ein paar kleine Steine drumherum (sieht natürlicher aus)
  const brocken = teile.filter((t) => t.art === 'fels');
  if (brocken.length && gruppe.thema === 'fels') {
    const n = ganz(rnd, c.begleitSteine);
    for (let k = 0, versuch = 0; k < n && versuch < n * 6; versuch++) {
      const an = brocken[Math.floor(rnd() * brocken.length)];
      const h = zwischen(rnd, c.steinHoehe);
      const w = rnd() * Math.PI * 2, abst = an.sicht + h * 0.6 + zwischen(rnd, [0.3, 1.6]);
      const t = stein(an.x + Math.cos(w) * abst, an.z + Math.sin(w) * abst, h);
      if (platzOk(t.x, t.z, t.r, c.abstandMitte) && frei([t])) { teile.push(t); k++; }
    }
  }

  // --- Ergebnis: Sprites, Stämme, Kollisionskreise
  const ergebnis = { tannen: [], felsen: [], steine: [], staemme: [], hindernisse: [], ueberlapp };
  const sprite = (t, versinken, varianten) => ({
    x: t.x, z: t.z, y: welt.gelaendeHoehe(t.x, t.z) - versinken, h: t.h, b: t.b,
    variante: Math.floor(rnd() * varianten), hell: 0.82 + rnd() * 0.22, spiegeln: rnd() < 0.5,
  });
  for (const t of teile) {
    if (t.art === 'tanne') ergebnis.tannen.push(sprite(t, 0.25, tex.tanne.varianten));
    else if (t.art === 'fels') ergebnis.felsen.push(sprite(t, 0.35, tex.fels.varianten));
    else if (t.art === 'stein') ergebnis.steine.push(sprite(t, 0.25, tex.stein.varianten));
    else ergebnis.staemme.push({ x: t.x, z: t.z, dx: t.dx, dz: t.dz, laenge: t.laenge, r: t.r, hoch: t.hoch, aeste: ganz(rnd, c.aeste), zufall: rnd() });
    for (const kr of kreise(t)) ergebnis.hindernisse.push({ x: kr.x, z: kr.z, r: kr.r, sperre: true });
  }
  return ergebnis;
}

// Die liegenden Baumstämme zeichnen: Low-Poly-Zylinder mit Rinde und hellem
// Holzring an den Enden, dazu ein paar abgebrochene Äste. Alles instanziert
// (ein Zeichenaufruf für alle Stämme, einer für alle Äste).
export function baueStaemme(szene, staemme, welt) {
  if (!staemme.length) return;
  const c = CONFIG.sperren;
  const rinde = rindenTextur();
  rinde.repeat.set(1, 2);
  const holz = holzringTextur();
  const matRinde = new THREE.MeshLambertMaterial({ map: rinde, flatShading: true });
  const matHolz = new THREE.MeshLambertMaterial({ map: holz, flatShading: true });

  // Zylinder liegt entlang x, Länge 1, Radius 1 (wird pro Stamm skaliert)
  const geo = new THREE.CylinderGeometry(1, 1, 1, c.stammSeiten, 1, false);
  geo.rotateZ(Math.PI / 2);
  const stammMesh = new THREE.InstancedMesh(geo, [matRinde, matHolz, matHolz], staemme.length);

  const astGeo = new THREE.CylinderGeometry(0.6, 1, 1, 5, 1, false);
  astGeo.translate(0, 0.5, 0); // Ast wächst vom Fuss nach oben (y)
  const anzahlAeste = staemme.reduce((n, s) => n + s.aeste, 0);
  const astMesh = new THREE.InstancedMesh(astGeo, matRinde, Math.max(1, anzahlAeste));

  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  const pos = new THREE.Vector3(), skal = new THREE.Vector3();
  let nAst = 0;
  staemme.forEach((s, i) => {
    const rnd = zufall(Math.floor(s.zufall * 1e9));
    const yaw = Math.atan2(-s.dz, s.dx); // Drehung um die Hochachse (x-Achse -> Stammrichtung)
    const halbe = s.laenge / 2;
    // Gelände unter dem Stamm abtasten (entlang und etwas quer), damit nichts durchsticht
    const h1 = welt.gelaendeHoehe(s.x - s.dx * halbe, s.z - s.dz * halbe);
    const h2 = welt.gelaendeHoehe(s.x + s.dx * halbe, s.z + s.dz * halbe);
    let heben = -Infinity;
    for (let f = -0.5; f <= 0.5001; f += 0.5 / Math.ceil(halbe / 0.4)) {
      const achse = mische(h1, h2, f + 0.5);
      for (const quer of [-0.7, 0, 0.7]) {
        const x = s.x + s.dx * f * s.laenge - s.dz * quer * s.r, z = s.z + s.dz * f * s.laenge + s.dx * quer * s.r;
        heben = Math.max(heben, welt.gelaendeHoehe(x, z) - achse);
      }
    }
    // Stamm liegt auf (Achse ca. 0.8 Radien über dem höchsten Punkt darunter)
    const y = (h1 + h2) / 2 + heben + s.r * c.stammAufliegen + s.hoch;
    const neigung = Math.atan2(h2 - h1, s.laenge);
    e.set(0, yaw, neigung, 'YZX');
    q.setFromEuler(e);
    pos.set(s.x, y, s.z);
    skal.set(s.laenge, s.r, s.r);
    m.compose(pos, q, skal);
    stammMesh.setMatrixAt(i, m);
    // Farbe leicht variieren
    const hell = 0.85 + rnd() * 0.25;
    stammMesh.setColorAt(i, new THREE.Color(hell, hell, hell));

    // abgebrochene Äste: kurze Stummel, schräg nach oben/aussen
    for (let k = 0; k < s.aeste; k++) {
      const f = (rnd() - 0.5) * 0.8;
      const um = rnd() * Math.PI * 2;
      const lokal = new THREE.Vector3(f * s.laenge, Math.cos(um) * s.r * 0.9, Math.sin(um) * s.r * 0.9).applyQuaternion(q);
      const ap = new THREE.Vector3(s.x, y, s.z).add(lokal);
      // Richtung: vom Stamm weg (Umfang) und etwas entlang des Stamms
      const richtung = new THREE.Vector3((rnd() - 0.5) * 0.8, Math.cos(um), Math.sin(um)).applyQuaternion(q).normalize();
      if (richtung.y < -0.2) richtung.y = -richtung.y; // nicht in den Boden
      const aq = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), richtung);
      const dicke = s.r * (0.12 + rnd() * 0.1);
      m.compose(ap, aq, new THREE.Vector3(dicke, s.r * (0.6 + rnd() * 1.2), dicke));
      astMesh.setMatrixAt(nAst++, m);
    }
  });
  stammMesh.instanceMatrix.needsUpdate = true;
  if (stammMesh.instanceColor) stammMesh.instanceColor.needsUpdate = true;
  astMesh.count = nAst;
  astMesh.instanceMatrix.needsUpdate = true;
  szene.add(stammMesh, astMesh);
}
