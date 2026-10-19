// Bilder für Meilenstein 8a:  node tools/m8a-bilder.mjs [--alt <ordner der alten Version>] [--nur spiel,labor]
// Schreibt screenshots/m8a/:
//  - Spiel (1280x720 und Originalgrösse ...-320x180): vorher/nachher (Heck, Drei-Viertel, Seite; vorher nur mit --alt),
//    Start, Kurve (Seite beim Lenken), Bremsen, Beschleunigen, Kuppe, Drift mit Handbremse, nach dem Wiesenweg (Dreck),
//    Staub auf Schotter, Rückwärts mit Rückfahrlicht, die drei Demo-Kameras, Fahr-Labor
//  - Auto-Labor (je 320x180, 480x270, 640x360 in Originalgrösse): sechs Ansichten, drei Lackierungen, Lenkung voll
//    links/rechts, Nicken/Rollen am Anschlag, Dreck 0 / 0.5 / 1, Bremslicht, Rückfahrlicht, Räder im Stand und bei Tempo
// Gefahren wird echt (Testfahrer, Profil rt4 = Standard), für die Bilder hält die Physik an.

import fs from 'node:fs';
import path from 'node:path';
import { starteSpiel, WURZEL } from './spiel-browser.mjs';

const arg = (name) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : null; };
const NUR = arg('--nur') ? arg('--nur').split(',') : ['spiel', 'labor'];
const ORDNER = path.join(WURZEL, 'screenshots/m8a');
fs.mkdirSync(ORDNER, { recursive: true });
const fahrerCode = fs.readFileSync(path.join(WURZEL, 'tools/testfahrer-browser.js'), 'utf8');

// ------------------------------------------------------------------------------------------------ Spiel
async function spielBilder(wurzel, praefix, nurVergleich, adresseExtra = '') {
  const spiel = await starteSpiel({ wurzel, breite: 1280, hoehe: 720, auto: 'rt4' });
  const p = spiel.page;
  await p.addInitScript(() => { if (!sessionStorage.getItem('m8a')) { localStorage.clear(); sessionStorage.setItem('m8a', '1'); } });
  await p.goto(`${spiel.url}/index.html?menue=aus${adresseExtra}`);
  await p.waitForFunction(() => window.__alpineRally, null, { timeout: 120000 });
  await p.evaluate((c) => { window.__fahrerUrl = URL.createObjectURL(new Blob([c], { type: 'text/javascript' })); window.__alpineRally.anhalten = true; }, fahrerCode);
  const bilder = (n) => p.evaluate((n) => new Promise((r) => { let k = 0; const f = () => (++k >= n ? r() : requestAnimationFrame(f)); requestAnimationFrame(f); }), n);
  await bilder(10);
  const ruhe = async (ms = 400) => { await p.waitForTimeout(ms); await bilder(3); };
  async function bild(name, vorher) {
    if (vorher) await vorher();
    await ruhe();
    await p.screenshot({ path: path.join(ORDNER, `${name}.png`) });
    await p.setViewportSize({ width: 320, height: 180 });
    if (vorher) await vorher();
    await ruhe(300);
    await p.screenshot({ path: path.join(ORDNER, `${name}-320x180.png`) });
    await p.setViewportSize({ width: 1280, height: 720 });
    await ruhe(200);
    console.log('  ', name);
  }
  // Kamera relativ zum Auto (x links, y hoch, z vorne), null = Spielkamera
  const kamera = (k) => p.evaluate((k) => {
    const A = window.__alpineRally;
    if (!k) { A.testKamera = null; return; }
    const ph = A.physik, s = Math.sin(ph.richtung), c = Math.cos(ph.richtung);
    const y = A.autoModell ? A.autoModell.objekt.position.y : A.szene.children.find((o) => o.isGroup && Math.abs(o.position.x - ph.x) < 1e-6).position.y;
    const w = (x, yy, z) => [ph.x + x * c + z * s, y + yy, ph.z - x * s + z * c];
    A.testKamera = { pos: w(k[0], k[1], k[2]), ziel: w(k[3], k[4], k[5]) };
  }, k);
  // HUD-Leinwand (Anzeigen, Menü) aus- und einblenden, ohne Hinweis "HUD AUS" (geht auch in der alten Version)
  const hudZeigen = (an) => p.evaluate((an) => { const h = document.getElementById('hud'); if (h) h.style.visibility = an ? '' : 'hidden'; }, an);
  const VERGLEICH = { heck: null, dreiviertel: [-4.6, 2.2, -5.4, 0, 0.7, 0], seite: [6.2, 1.5, 0, 0, 0.7, 0] };
  // Vergleichsbilder an der Startlinie (Auto steht, Strasse gerade), ohne HUD
  await p.evaluate(() => { const A = window.__alpineRally; A.start({ countdown: false }); A.anhalten = true; A.setzeAuf(70); A.kameraSofort(); });
  await hudZeigen(false);
  for (const [n, k] of Object.entries(VERGLEICH)) await bild(`${praefix}-${n}`, () => kamera(k));
  await kamera(null);
  await hudZeigen(true);
  if (nurVergleich) { await spiel.schliessen(); return; }

  // fahren mit dem Testfahrer bis bisS (Rennen ohne Countdown); proSchritt: Dreck mitrechnen wie im Spiel
  const fahre = (bisS, profil = 'mittel') => p.evaluate(async ([bisS, profil]) => {
    const A = window.__alpineRally, f = await import(window.__fahrerUrl);
    f.fahreBis(A, profil, { bisS, proSchritt: () => { if (A.rennen.zustand === 'laeuft') A.dreckSchritt(A.SCHRITT); } });
    A.kameraSofort();
  }, [bisS, profil]);
  // ein paar Physik-Schritte mit fester Eingabe, Bilder dazwischen (Federung, Kamera, Staub laufen mit)
  const halte = (eingabe, schritte, alle = 2) => p.evaluate(([e, n, alle]) => {
    const A = window.__alpineRally;
    const ein = { gas: 0, bremse: 0, lenkung: 0, handbremse: false, reset: false, debug: false, notes: false, ...e };
    for (let i = 0; i < n; i++) {
      A.rennSchritt(A.SCHRITT, ein);
      if (i % alle === 0) A.autoZeichnen(A.SCHRITT * alle, A.physik.vVor * A.SCHRITT * alle);
    }
  }, [eingabe, schritte, alle]);
  const neu = () => p.evaluate(() => { const A = window.__alpineRally; A.start({ countdown: false }); A.anhalten = true; });

  // Start (Countdown-Stellung, Spielkamera, HUD an)
  await p.evaluate(() => { const A = window.__alpineRally; A.start(); A.anhalten = true; });
  await bild(`${praefix}-10-start`);
  // Kurve: Kehre 2 (Linkskurve) mitten in der Kurve, Spielkamera: man sieht die Seite
  await neu(); await fahre(1520);
  await bild(`${praefix}-11-kurve-seite`);
  // Bremsen: auf der langen Geraden mit Tempo, dann voll bremsen: Nase taucht
  await neu(); await fahre(2560, 'flott'); await halte({ bremse: 1 }, 30);
  await bild(`${praefix}-12-bremsen`, () => kamera([5.5, 1.1, 1.2, 0, 0.6, 0]));
  await kamera(null);
  // Beschleunigen aus dem Stand: Heck setzt sich
  await p.evaluate(() => { const A = window.__alpineRally; A.setzeAuf(2700); A.kameraSofort(); });
  await halte({ gas: 1 }, 40);
  await bild(`${praefix}-13-beschleunigen`, () => kamera([5.5, 1.1, -0.4, 0, 0.6, 0]));
  await kamera(null);
  // Kuppe: die stärkste Kuppe auf der Strecke suchen und schnell drüber
  const kuppe = await p.evaluate(() => {
    const A = window.__alpineRally, S = A.strecke;
    let best = 0, wo = 600;
    for (let i = 300; i < S.zielS - 30; i += 2) { const k = S.py[i + 8] - 2 * S.py[i] + S.py[i - 8]; if (k < best) { best = k; wo = i; } }
    return wo;
  });
  await neu(); await fahre(kuppe - 1, 'flott');
  await bild(`${praefix}-14-kuppe`, () => kamera([5.5, 1.0, 0.5, 0, 0.6, 0]));
  await kamera(null);
  // Drift mit Handbremse auf dem Schotter (Talschleife)
  await neu(); await fahre(860, 'flott'); await halte({ gas: 0.3, lenkung: 1, handbremse: true }, 55); await halte({ gas: 0.6, lenkung: -0.3 }, 12);
  await bild(`${praefix}-15-drift-handbremse`);
  // nach dem Wiesenweg: Dreck (ganze Etappe bis dorthin gefahren, Dreck wie im Spiel aufgebaut)
  await neu(); await fahre(3125);
  await bild(`${praefix}-16-nach-wiesenweg-dreck`, () => kamera([-4.2, 1.8, -4.8, 0, 0.6, 0]));
  await kamera(null);
  // Staub auf Schotter: auf dem Almweg fahren, Bilder laufen in Echtzeit weiter
  await neu(); await fahre(2150, 'flott');
  await p.evaluate(() => { const A = window.__alpineRally; A.anhalten = false; A.testEingabe = { gas: 1, lenkung: 0.35 }; });
  await p.waitForTimeout(1500);
  await p.evaluate(() => { const A = window.__alpineRally; A.anhalten = true; A.testEingabe = null; });
  await bild(`${praefix}-17-staub-schotter`);
  // Rückwärts mit Rückfahrlicht: im Stand Bremse = rückwärts
  await p.evaluate(() => { const A = window.__alpineRally; A.setzeAuf(700); A.kameraSofort(); });
  await halte({ bremse: 1 }, 120);
  await bild(`${praefix}-18-rueckwaerts-rueckfahrlicht`);
  // Demo-Kameras: Front tief, Verfolger seitlich, vorn oben (Demo-Fahrt im Menü, Kamera festgehalten; ohne das Menü
  // darüber, sonst verdeckt es das Auto in der Bildmitte)
  await hudZeigen(false);
  for (const [nr, name] of [[1, 'front-tief'], [0, 'verfolger-seitlich'], [2, 'vorn-oben']]) {
    await p.evaluate(([nr]) => {
      const A = window.__alpineRally, K = A.CONFIG.menue.demo.kameras;
      if (!A.__kameras) A.__kameras = K.slice();
      K.splice(0, K.length, { ...A.__kameras[nr], dauer: 999 });
      A.zumHauptmenue(); A.anhalten = true;
      for (let i = 0; i < 120 * 25; i++) A.demo.schritt(A.SCHRITT);
      for (let i = 0; i < 30; i++) A.demo.bild(1 / 30, A.autoModell.objekt.position.y);
    }, [nr]);
    await bild(`${praefix}-19-demo-${name}`, () => p.evaluate(() => { const A = window.__alpineRally; A.anhalten = true; }));
  }
  await p.evaluate(() => { const A = window.__alpineRally; const K = A.CONFIG.menue.demo.kameras; K.splice(0, K.length, ...A.__kameras); });
  await hudZeigen(true);
  if (spiel.fehler.length) console.log('Fehler im Spiel:', spiel.fehler.slice(0, 3).join(' | '));
  await spiel.schliessen();
}

async function fahrlaborBild() {
  const spiel = await starteSpiel({ breite: 1280, hoehe: 720 });
  const p = spiel.page;
  await p.goto(`${spiel.url}/index.html?menue=aus&auto=rt4&fahrlabor=1`);
  await p.waitForFunction(() => window.__alpineRally && window.__alpineRally.fahrlabor, null, { timeout: 120000 });
  await p.evaluate((c) => { window.__fahrerUrl = URL.createObjectURL(new Blob([c], { type: 'text/javascript' })); }, fahrerCode);
  await p.evaluate(async () => {
    const A = window.__alpineRally, f = await import(window.__fahrerUrl);
    A.start({ countdown: false }); A.anhalten = true; f.fahreBis(A, 'mittel', { bisS: 900 }); A.kameraSofort();
    // ein Wert verstellt, damit man die Markierung und den Text sieht
    const r = A.fahrlabor.panel.querySelector('input[type=range]'); r.value = 0.95; r.dispatchEvent(new Event('input'));
    A.fahrlabor.panel.querySelector('#fahrlaborKopieren').click();
  });
  await p.waitForTimeout(800);
  await p.screenshot({ path: path.join(ORDNER, '20-fahrlabor.png') });
  console.log('   20-fahrlabor');
  await spiel.schliessen();
}

// ------------------------------------------------------------------------------------------------ Auto-Labor
async function laborBilder() {
  const spiel = await starteSpiel({ breite: 1400, hoehe: 900 });
  const p = spiel.page;
  await p.goto(`${spiel.url}/auto-labor.html`);
  await p.waitForFunction(() => window.__autoLabor, null, { timeout: 60000 });
  await p.screenshot({ path: path.join(ORDNER, '30-auto-labor-seite.png') });
  // Raster aus mehreren Bildern in Originalgrösse; jedes Bild: { ansicht, zustand, lack, abstand }
  async function raster(name, bilderListe, aufl) {
    const d = await p.evaluate(async ([liste, aufl]) => {
      const L = window.__autoLabor;
      L.aufloesung(aufl);
      const imgs = [];
      for (const b of liste) {
        Object.assign(L.zustand, { lenkung: 0, tempo: 0, nicken: 0, rollen: 0, hub: 0, dreck: 0, dreckBelag: 'wiesenweg', bremslicht: false, rueckfahrlicht: false, staub: false, hell: true, federTest: 0 }, b.zustand || {});
        L.auto.lackierung(b.lack || 'werk');
        L.ansicht(b.ansicht);
        if (b.abstand) L.orbit.abstand *= b.abstand;
        for (let i = 0; i < 4; i++) L.zeichne(1 / 60);
        const img = new Image(); img.src = L.bildDaten(); await img.decode(); imgs.push(img);
      }
      const w = imgs[0].width, h = imgs[0].height, sp = Math.min(3, imgs.length);
      const c = document.createElement('canvas'); c.width = w * sp; c.height = h * Math.ceil(imgs.length / sp);
      const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
      imgs.forEach((im, i) => x.drawImage(im, (i % sp) * w, Math.floor(i / sp) * h));
      L.auto.lackierung('werk');
      return c.toDataURL();
    }, [bilderListe, aufl]);
    const datei = `${name}-${['320x180', '480x270', '640x360'][aufl]}.png`;
    fs.writeFileSync(path.join(ORDNER, datei), Buffer.from(d.split(',')[1], 'base64'));
    console.log('  ', datei);
  }
  const nah = 0.55;
  const SERIEN = {
    '31-labor-ansichten': ['heck', 'hinten34', 'seite', 'vorne34', 'front', 'oben'].map((a) => ({ ansicht: a })),
    '32-labor-lackierungen': ['werk', 'gletscher', 'dunkel'].flatMap((l) => [{ ansicht: 'hinten34', lack: l, abstand: nah }]),
    '33-labor-lenkung-links-rechts': [{ ansicht: 'vorne34', zustand: { lenkung: -1 }, abstand: nah }, { ansicht: 'vorne34', zustand: { lenkung: 1 }, abstand: nah },
      { ansicht: 'oben', zustand: { lenkung: 1 }, abstand: 0.5 }],
    '34-labor-nicken-rollen': [{ ansicht: 'seite', zustand: { nicken: 4 }, abstand: nah }, { ansicht: 'seite', zustand: { nicken: -4 }, abstand: nah },
      { ansicht: 'heck', zustand: { rollen: 5 }, abstand: nah }, { ansicht: 'heck', zustand: { rollen: -5 }, abstand: nah },
      { ansicht: 'seite', zustand: { hub: -12, nicken: 4 }, abstand: nah }, { ansicht: 'seite', zustand: { hub: 12 }, abstand: nah }],
    '35-labor-dreck-0-05-1': [0, 0.5, 1].map((d) => ({ ansicht: 'hinten34', zustand: { dreck: d }, abstand: nah })),
    '36-labor-bremslicht-rueckfahrlicht': [{ ansicht: 'heck', abstand: nah }, { ansicht: 'heck', zustand: { bremslicht: true }, abstand: nah },
      { ansicht: 'heck', zustand: { rueckfahrlicht: true }, abstand: nah }],
    '37-labor-raeder-stand-tempo': [{ ansicht: 'seite', abstand: 0.4 }, { ansicht: 'seite', zustand: { tempo: 15 }, abstand: 0.4 }, { ansicht: 'seite', zustand: { tempo: 35 }, abstand: 0.4 }],
  };
  for (const [name, liste] of Object.entries(SERIEN)) for (const aufl of [0, 1, 2]) await raster(name, liste, aufl);
  if (spiel.fehler.length) console.log('Fehler im Auto-Labor:', spiel.fehler.slice(0, 3).join(' | '));
  await spiel.schliessen();
}

if (NUR.includes('spiel')) {
  if (arg('--alt')) await spielBilder(path.resolve(arg('--alt')), '01-vorher', true);
  await spielBilder(WURZEL, '02-nachher', false);
  await fahrlaborBild();
}
if (NUR.includes('labor')) await laborBilder();
