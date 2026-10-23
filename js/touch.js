// Touch-Steuerung fürs Handy (Meilenstein 9a): Erkennung, Knöpfe auf der Seite, Mehrfinger-Eingabe.
// - Einstellung TOUCH (einstellungen.touch): 'auto' = Knöpfe nur auf Touch-Geräten (grober Zeiger, Touch-Punkte oder
//   die erste echte Berührung), 'an' = immer (am Computer mit der Maus prüfbar), 'aus' = nie (alles wie bis 0.8h).
// - Lage von Bild und Knöpfen: js/touchlayout.js; Aussehen: js/touchbild.js (einmal gemalt, nur kopiert).
// - Jeder Finger ist ein Pointer mit eigener Id und merkt sich, auf welchem Knopf er liegt; gleitet er auf einen
//   anderen Knopf (oder im D-Pad in eine andere Richtung), wechselt die Auslösung. Alle Ereignisse kommen am Fenster
//   an und werden mit der eigenen Trefferrechnung zugeordnet (so geht das Gleiten trotz Pointer-Capture).
// - Rennen: die Knöpfe lösen Aktionen aus (input.js, touchEingabe), nicht Tastencodes. Menü: D-Pad = Pfeiltasten (gehalten
//   mit Wiederholung), A = Enter, B = Esc, START = wie Gamepad-Start, R = Kurztaste der Seite; Antippen des Bilds = Maus.
// - Nie hängende Knöpfe: Abbruch, Fokusverlust, Tab-Wechsel, Drehen, Zustands- und Seitenwechsel lösen alle Finger.
//   Ein gelöster Finger zählt erst wieder, wenn er losgelassen und neu aufgesetzt wird.

import { CONFIG } from './config.js';
import { einstellungen } from './einstellungen.js';
import { touchEingabe } from './input.js';
import { berechneLayout, KLEINE, beschriftung } from './touchlayout.js';
import { beiSprachwechsel } from './texte.js';
import { malAlle, malBeschriftung } from './touchbild.js';

// Für Seiten und HUD: ist der Touch-Modus an? (ohne baueTouch immer aus)
const modus = { an: false };
export const touchAn = () => modus.an;
const hoerer = [];
export function beiTouchWechsel(f) { hoerer.push(f); }
// Läuft das Spiel als Web-App vom Home-Bildschirm (ohne Browser-Leisten)?
export const webAppModus = () => navigator.standalone === true
  || (typeof matchMedia === 'function' && (matchMedia('(display-mode: fullscreen)').matches || matchMedia('(display-mode: standalone)').matches));

const NAMEN = ['dpad', 'a', 'b', 'l', 'r', ...KLEINE];
const B = CONFIG.bild.breite, H = CONFIG.bild.hoehe;

// api: { buehne, hudLeinwand, ablauf, menue, zumMenue(), anpassen() (Layout neu, wie beim Ändern der Fenstergrösse) }
export function baueTouch({ buehne, hudLeinwand, ablauf, menue, zumMenue, anpassen }) {
  const T = CONFIG.touch;
  const geraet = (typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches) || navigator.maxTouchPoints > 0;
  let erstKontakt = false; // AUTO: erste echte Berührung schaltet die Knöpfe sofort ein
  let lay = null;          // aktuelles Layout (js/touchlayout.js)
  let safeTest = null;     // nur Tests: Safe-Area-Ränder vorgeben { o, r, u, l }
  let letzterTouch = -1e9; // Zeit der letzten Berührung (danach keine nachgemachten Mausklicks)
  const zeiger = new Map(); // pointerId -> { el, richtung (8), r4 (Menü), tot, maus }
  let bildZeiger = null;   // Finger, der im Menü auf dem Bild tippt/zieht (wie die Maus)
  const titelBeruehrungen = new Set(); // Berührungen, die auf dem Titelbildschirm begonnen haben
  const halten = { dpad: 0, r4: 0, a: false, b: false, l: false, r: false, select: false, start: false, notes: false };
  const gezeigt = { dpad: 0, a: 0, b: 0, l: 0, r: 0, select: 0, start: 0, notes: 0 }; // angezeigter Zustand je Knopf
  const menuePad = { richtung: 0, zeit: 0 };
  let letzteSeite = null;
  const zaehler = { ausgeloest: 0, geloest: 0 }; // (für Tests)

  // --- Seite: Ebene mit Steuerfläche und Knöpfen, nur im Touch-Modus aufgebaut -----------------
  let ebene = null, flaeche = null, probe = null;
  const leinwand = {}, schrift = {};
  let bilder = null;
  function aufbauen() {
    if (ebene) return;
    bilder = malAlle();
    ebene = document.createElement('div');
    ebene.id = 'touch';
    flaeche = document.createElement('div');
    flaeche.className = 'touch-flaeche';
    flaeche.style.background = T.farbeFlaeche;
    flaeche.style.borderTop = `2px solid ${T.farbeFlaecheRand}`;
    ebene.appendChild(flaeche);
    for (const n of NAMEN) {
      const c = document.createElement('canvas');
      c.width = bilder[n][0].width; c.height = bilder[n][0].height;
      c.className = `touch-knopf touch-${n}`;
      c.style.opacity = T.deckkraft;
      c.getContext('2d').drawImage(bilder[n][0], 0, 0);
      ebene.appendChild(c);
      leinwand[n] = c;
    }
    for (const n of KLEINE) {
      const c = malBeschriftung(beschriftung(n));
      c.className = 'touch-schrift';
      ebene.appendChild(c);
      schrift[n] = c;
    }
    // andere Sprache: Beschriftungen neu malen, Lage neu rechnen
    beiSprachwechsel(() => {
      for (const n of KLEINE) { const c = malBeschriftung(beschriftung(n)); ebene.replaceChild(c, schrift[n]); c.className = 'touch-schrift'; schrift[n] = c; }
      if (modus.an) anpassen();
    });
    // Safe-Area-Ränder (Notch, Home-Balken) misst ein unsichtbares Kästchen mit env(safe-area-inset-*)
    probe = document.createElement('div');
    probe.className = 'touch-probe';
    ebene.appendChild(probe);
    document.body.appendChild(ebene);
  }
  function leseSafe() {
    if (safeTest) return safeTest;
    if (!probe) return { o: 0, r: 0, u: 0, l: 0 };
    const s = getComputedStyle(probe);
    const z = (w) => parseFloat(w) || 0;
    return { o: z(s.paddingTop), r: z(s.paddingRight), u: z(s.paddingBottom), l: z(s.paddingLeft) };
  }
  const px = (w) => `${w}px`;
  function setze(el, r) { el.style.left = px(r.x); el.style.top = px(r.y); el.style.width = px(r.b); el.style.height = px(r.h); }

  // Layout neu (aus main.js anpassen(), nur im Touch-Modus): Bühne und Knöpfe an ihren Platz
  function layout() {
    aufbauen();
    const W = window.innerWidth, Hf = window.innerHeight;
    const alt = lay;
    lay = berechneLayout(W, Hf, leseSafe());
    setze(buehne, lay.bild);
    if (lay.flaeche) { flaeche.style.display = 'block'; setze(flaeche, lay.flaeche); } else flaeche.style.display = 'none';
    for (const n of NAMEN) setze(leinwand[n], lay.el[n].v);
    for (const n of KLEINE) setze(schrift[n], lay.el[n].s);
    if (alt && alt.format !== lay.format) alleLos(); // gedreht: kein Finger bleibt hängen
  }

  // --- Ein / aus ------------------------------------------------------------------------------
  const sollAn = () => einstellungen.touch === 'an' || (einstellungen.touch === 'auto' && (geraet || erstKontakt));
  function aktualisiere() {
    const neu = sollAn();
    if (neu === modus.an) return;
    modus.an = neu;
    alleLos();
    if (neu) {
      aufbauen();
      ebene.style.display = 'block';
      document.documentElement.classList.add('touch');
    } else {
      if (ebene) ebene.style.display = 'none';
      document.documentElement.classList.remove('touch');
      for (const k of ['left', 'top', 'width', 'height']) buehne.style[k] = '';
      lay = null;
    }
    anpassen();
    for (const f of hoerer) f(neu);
  }

  // --- Treffer und Zustand --------------------------------------------------------------------
  const drin = (r, x, y, rand = 0) => x >= r.x - rand && x < r.x + r.b + rand && y >= r.y - rand && y < r.y + r.h + rand;
  function trefferBei(x, y, vorher) {
    if (!lay) return null;
    for (const n of NAMEN) if (drin(lay.el[n], x, y)) return n;
    // ein Finger auf dem D-Pad darf etwas über den Rand rutschen (Daumen), ohne dass die Lenkung abbricht
    if (vorher === 'dpad' && drin(lay.el.dpad, x, y, lay.el.dpad.b * 0.2)) return 'dpad';
    return null;
  }
  // Richtung im D-Pad: 8 Richtungen (1 = hoch, im Uhrzeigersinn) fürs Fahren, 4 (1 hoch, 3 rechts, 5 runter, 7 links) fürs Menü
  function dpadRichtung(z, x, y) {
    const d = lay.el.dpad.v, r = d.b / 2;
    const dx = x - (d.x + r), dy = y - (d.y + r);
    if (Math.hypot(dx, dy) < T.dpadTotzone * r) { z.richtung = 0; z.r4 = 0; return; }
    const w = ((Math.atan2(dx, -dy) * 180 / Math.PI) + 360) % 360; // 0 = hoch, 90 = rechts
    // Schrägen: je dpadDiagonal Grad um 45, 135, 225, 315
    const halb = T.dpadDiagonal / 2;
    let r8 = 0;
    for (let i = 0; i < 4; i++) if (Math.abs(w - (45 + 90 * i)) <= halb) r8 = 2 + 2 * i;
    if (!r8) r8 = 1 + 2 * (Math.round(w / 90) % 4);
    z.richtung = r8;
    z.r4 = 1 + 2 * (Math.round(w / 90) % 4);
  }
  function aufElement(z, n, x, y) {
    z.el = n;
    if (n === 'dpad') dpadRichtung(z, x, y); else { z.richtung = 0; z.r4 = 0; }
  }

  // Gehaltene Knöpfe aus allen Fingern ableiten; neu gedrückte Knöpfe lösen ihre Aktion aus; Anzeige nachführen
  function ableiten() {
    const vorher = { a: halten.a, b: halten.b, l: halten.l, r: halten.r, select: halten.select, start: halten.start, notes: halten.notes };
    for (const n of NAMEN) if (n !== 'dpad') halten[n] = false;
    halten.dpad = 0; halten.r4 = 0;
    for (const z of zeiger.values()) {
      if (z.tot || !z.el) continue;
      if (z.el === 'dpad') { if (z.richtung || !halten.dpad) { halten.dpad = z.richtung; halten.r4 = z.r4; } } else halten[z.el] = true;
    }
    for (const n of NAMEN) if (n !== 'dpad' && halten[n] && !vorher[n]) druecken(n);
    // ans Rennen (im Menü nichts: dort gehen die Knöpfe ans Menü)
    const rennen = !(ablauf.def && ablauf.def.menue);
    const r = rennen ? halten.dpad : 0;
    touchEingabe.gas = rennen && (halten.a || r === 1 || r === 2 || r === 8);
    touchEingabe.bremse = rennen && (halten.b || (r >= 4 && r <= 6));
    touchEingabe.links = r >= 6 && r <= 8;
    touchEingabe.rechts = r >= 2 && r <= 4;
    touchEingabe.handbremse = rennen && halten.l;
    zeigen();
  }
  function zeigen() {
    if (!bilder) return;
    for (const n of NAMEN) {
      const s = n === 'dpad' ? (ablauf.def && ablauf.def.menue ? halten.r4 : halten.dpad) : halten[n] ? 1 : 0;
      if (s === gezeigt[n]) continue;
      gezeigt[n] = s;
      const x = leinwand[n].getContext('2d');
      x.clearRect(0, 0, leinwand[n].width, leinwand[n].height);
      x.drawImage(bilder[n][s], 0, 0);
    }
  }
  // Ein Knopf wurde neu gedrückt (A, B, L, R, START, SELECT, NOTES; das D-Pad wirkt über halten)
  function druecken(n) {
    zaehler.ausgeloest++;
    if (ablauf.zustand === 'titel') return; // Titel: erst beim Loslassen (Ton braucht eine echte Geste)
    if (ablauf.def && ablauf.def.menue) {
      const s = menue.seite;
      if (n === 'a') menue.taste('Enter', false, 'touch');
      else if (n === 'b') menue.taste('Escape', false, 'touch');
      else if (n === 'start') { if (s && s.startKnopf) s.startKnopf(); }
      else if (n === 'r') { const k = einstellungen.tasten.zurueck; if (s && s.kurztaste) s.kurztaste(k[0] || k[1]); }
      return;
    }
    if (n === 'r') touchEingabe.reset = true;
    else if (n === 'start') touchEingabe.pause = true;
    else if (n === 'select') touchEingabe.hud = true;
    else if (n === 'notes') touchEingabe.notes = true;
  }
  // Alle Finger lösen (Gas hört auf, Lenkung geht zurück); sie zählen erst nach neuem Aufsetzen wieder
  function alleLos() {
    for (const z of zeiger.values()) { z.tot = true; z.el = null; z.richtung = 0; z.r4 = 0; }
    if (bildZeiger !== null) { bildZeiger = null; menue.maus(-1, -1, 'loslassen'); }
    menuePad.richtung = 0;
    zaehler.geloest++;
    ableiten();
  }

  // --- Ereignisse -----------------------------------------------------------------------------
  const istTouch = (e) => e.pointerType === 'touch' || e.pointerType === 'pen';
  const imMenue = () => ablauf.def && ablauf.def.menue && ablauf.zustand !== 'titel';
  function aufBild(x, y) { const r = hudLeinwand.getBoundingClientRect(); return [(x - r.left) / r.width * B, (y - r.top) / r.height * H]; }

  window.addEventListener('pointerdown', (e) => {
    if (istTouch(e)) {
      letzterTouch = performance.now();
      if (!modus.an && einstellungen.touch === 'auto' && e.pointerType === 'touch' && !erstKontakt) { erstKontakt = true; aktualisiere(); }
      if (modus.an) menue.merkeEingabe('touch'); // (Hinweiszeilen, z. B. Garage: "A ODER ANTIPPEN")
    }
    if (!modus.an) return;
    if (!istTouch(e) && e.button !== 0) return;
    const n = trefferBei(e.clientX, e.clientY, null);
    if (!n && !istTouch(e)) return; // Maus neben den Knöpfen: wie bisher (main.js)
    const z = { el: null, richtung: 0, r4: 0, tot: false, maus: !istTouch(e) };
    zeiger.set(e.pointerId, z);
    if (n) aufElement(z, n, e.clientX, e.clientY);
    else if (imMenue() && bildZeiger === null) {
      // im Menü: Antippen des Bilds wie die Maus (im Rennen zählt das Bild nicht)
      bildZeiger = e.pointerId;
      const [x, y] = aufBild(e.clientX, e.clientY);
      menue.maus(x, y, 'bewegen');
      menue.maus(x, y, 'druecken');
    }
    ableiten();
  });
  window.addEventListener('pointermove', (e) => {
    const z = zeiger.get(e.pointerId);
    if (!z || z.tot) return;
    if (istTouch(e)) letzterTouch = performance.now();
    if (bildZeiger === e.pointerId) { const [x, y] = aufBild(e.clientX, e.clientY); menue.maus(x, y, 'bewegen'); return; }
    const n = trefferBei(e.clientX, e.clientY, z.el);
    const alt = z.el, altR = z.richtung, altR4 = z.r4;
    aufElement(z, n, e.clientX, e.clientY);
    if (z.el !== alt || z.richtung !== altR || z.r4 !== altR4) ableiten();
  });
  function loslassen(e, abbruch) {
    const z = zeiger.get(e.pointerId);
    if (!z) return;
    if (istTouch(e)) letzterTouch = performance.now();
    if (bildZeiger === e.pointerId) {
      bildZeiger = null;
      if (abbruch) menue.maus(-1, -1, 'loslassen');
      else { const [x, y] = aufBild(e.clientX, e.clientY); menue.maus(x, y, 'loslassen'); }
    }
    zeiger.delete(e.pointerId);
    // Maus (Touch AN am Computer): Klick auf einen Knopf auf dem Titel = weiter (Touch: siehe touchend)
    if (!abbruch && z.maus && z.el && !z.tot && ablauf.zustand === 'titel') zumMenue();
    ableiten();
  }
  window.addEventListener('pointerup', (e) => loslassen(e, false));
  window.addEventListener('pointercancel', (e) => loslassen(e, true));
  window.addEventListener('lostpointercapture', (e) => { if (zeiger.has(e.pointerId) && e.pointerType !== 'mouse') loslassen(e, true); });

  // Touch-Ereignisse: im Touch-Modus nie scrollen, zoomen oder Mausklicks nachmachen (preventDefault, nicht passiv).
  // Der Titel reagiert beim Loslassen (touchend zählt auf dem iPhone als Geste: erst dann darf der Ton starten).
  const eigen = (e) => !(e.target && e.target.closest && e.target.closest('#fahrlabor'));
  document.addEventListener('touchstart', (e) => {
    letzterTouch = performance.now();
    if (!modus.an || !eigen(e)) return;
    e.preventDefault();
    if (ablauf.zustand === 'titel') for (const t of e.changedTouches) titelBeruehrungen.add(t.identifier);
  }, { passive: false });
  document.addEventListener('touchmove', (e) => { if (modus.an && eigen(e)) e.preventDefault(); }, { passive: false });
  document.addEventListener('touchend', (e) => {
    letzterTouch = performance.now();
    if (!modus.an || !eigen(e)) return;
    e.preventDefault();
    let titel = false;
    for (const t of e.changedTouches) if (titelBeruehrungen.delete(t.identifier)) titel = true;
    if (titel && ablauf.zustand === 'titel') zumMenue();
  }, { passive: false });
  document.addEventListener('touchcancel', (e) => { for (const t of e.changedTouches) titelBeruehrungen.delete(t.identifier); });
  // iOS: Zwei-Finger-Zoom (gesture*) und langes Drücken (Kontextmenü) aus
  for (const art of ['gesturestart', 'gesturechange', 'gestureend']) document.addEventListener(art, (e) => { if (modus.an) e.preventDefault(); }, { passive: false });
  document.addEventListener('contextmenu', (e) => { if (modus.an && eigen(e)) e.preventDefault(); });
  // Fokus weg, Tab gewechselt, gedreht: alle Finger lösen
  window.addEventListener('blur', () => { if (zeiger.size) alleLos(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && zeiger.size) alleLos(); });
  window.addEventListener('orientationchange', () => { if (!modus.an) return; alleLos(); anpassen(); });
  if (window.visualViewport) window.visualViewport.addEventListener('resize', () => { if (modus.an) anpassen(); });
  // Zustandswechsel (Menü, Pause, Rennen, Ziel) lösen alle Finger; nur von Countdown zu Rennen (GO) bleibt alles gedrückt
  ablauf.beiWechsel((neu, alt) => { if (!(alt === 'countdown' && neu === 'rennen')) alleLos(); });

  // --- Jedes Bild (aus der Spielschleife): Seitenwechsel im Menü, D-Pad-Wiederholung im Menü ------------
  function schritt(dt) {
    if (!modus.an) return;
    const s = menue.seite;
    if (s !== letzteSeite) { letzteSeite = s; if (zeiger.size) alleLos(); }
    if (!imMenue()) { menuePad.richtung = 0; return; }
    const r = halten.r4, p = menuePad;
    let los = false, wiederholt = false;
    if (r !== p.richtung) { p.richtung = r; p.zeit = T.wiederholenNach; los = r !== 0; }
    else if (r) { p.zeit -= dt; if (p.zeit <= 0) { p.zeit = T.wiederholenAlle; los = true; wiederholt = true; } }
    if (!los) return;
    menue.taste(r === 1 ? 'ArrowUp' : r === 5 ? 'ArrowDown' : r === 7 ? 'ArrowLeft' : 'ArrowRight', wiederholt, 'touch');
  }

  // Maus-Ereignisse für das Menü (main.js) überspringen? Ja kurz nach einer Berührung (vom Browser nachgemacht)
  // und wenn die Maus gerade einen Knopf bedient oder auf einem liegt (Touch AN am Computer).
  function mausIgnorieren(ev) {
    if (performance.now() - letzterTouch < T.mausSperre) return true;
    if (!modus.an) return false;
    for (const z of zeiger.values()) if (z.maus) return true;
    return !!trefferBei(ev.clientX, ev.clientY, null);
  }

  aktualisiere();
  return {
    get an() { return modus.an; }, layout, aktualisiere, schritt, mausIgnorieren, alleLos,
    // für Tests
    get layoutJetzt() { return lay; }, halten, zaehler, get zeigerAnzahl() { return zeiger.size; }, gezeigt, eingabe: touchEingabe,
    get geraet() { return geraet; }, get erstKontakt() { return erstKontakt; },
    setzeSafeTest(s) { safeTest = s; if (modus.an) anpassen(); },
  };
}
