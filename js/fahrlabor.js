// Fahr-Labor (Meilenstein 8a): Seitenpanel zum Nachstellen des Fahrgefühls im laufenden Spiel.
// Nur mit index.html?fahrlabor=1 (main.js lädt diese Datei dann nach; ohne den Schalter gibt es weder Panel noch Aufwand).
// Regler mit dem Namen des Werts aus config.js, sofort wirksam (die Physik liest CONFIG bei jedem Schritt),
// Umschalter PROTOTYP / AUDAN QUARTO (Profil rt4; schaltet nur die Werte, das Aussehen bleibt), WERTE KOPIEREN und ALLES ZURÜCK.
// M8c: ein Knopf je Fahrprofil (PROTOTYP, AUDAN QUARTO, LANZA DELTO, FARD ESCORTA); die Regler wirken auf das gewählte.
// Nichts wird gespeichert: Neu laden = wieder die Werte aus config.js. Das Panel nimmt nur Mausklicks an; Tasten gehen
// weiter ans Spiel (Fahrtasten verhindern ohnehin, dass ein Regler auf Pfeiltasten reagiert).

import { CONFIG } from './config.js';
import { waehleFahrprofil, aktivesProfil, profilWert } from './fahrprofil.js';
import { AUTO_MODELLE } from './autos.js';

// Anzeigename eines Profils (M8b: rt4 = AUDAN QUARTO; die Id bleibt)
const profilName = (id) => (AUTO_MODELLE[id] ? AUTO_MODELLE[id].name : id.toUpperCase());

export const BREITE = 300; // Breite des Panels (Pixel); das Spielbild rückt so weit nach links

// Die Regler: Pfad in config.js, Bereich, Schritt, kurze Erklärung
export const REGLER = [
  { pfad: 'auto.gripVorne', min: 0.6, max: 1.4, schritt: 0.01, info: 'Haftung vorne (weniger = schiebt über die Front)' },
  { pfad: 'auto.gripHinten', min: 0.6, max: 1.5, schritt: 0.01, info: 'Haftung hinten (weniger = Heck kommt früher)' },
  { pfad: 'auto.lastVorneAnteil', min: 0.4, max: 0.65, schritt: 0.005, info: 'Anteil Gewicht vorne (0.5 = gleich)' },
  { pfad: 'auto.schwerpunktVorne', min: 0.35, max: 0.6, schritt: 0.005, info: 'Schwerpunkt: Anteil Radstand bis vorne' },
  { pfad: 'auto.traegheit', min: 1.5, max: 4, schritt: 0.05, info: 'Drehträgheit (höher = träger, ruhiger)' },
  { pfad: 'auto.gewichtstransfer', min: 0, max: 0.8, schritt: 0.01, info: 'Gewicht wandert beim Bremsen/Gas (0 = aus)' },
  { pfad: 'auto.gasImDrift', min: 0, max: 0.3, schritt: 0.005, info: 'Gas im Drift lockert das Heck' },
  { pfad: 'auto.stabilitaet', min: 0, max: 10, schritt: 0.1, info: 'zieht aus dem Drift gerade (höher = braver)' },
  { pfad: 'auto.vorneJeBelag.schotter', min: 0.9, max: 1.3, schritt: 0.01, info: 'Haftung vorne auf Schotter (mal; M8b)' },
  { pfad: 'getriebe.traktion', min: 5, max: 12, schritt: 0.1, info: 'so viel Schub geht auf den Boden (mal Grip)' },
  { pfad: 'getriebe.allrad.schotter', min: 0.8, max: 1.4, schritt: 0.01, info: 'Allrad: Traktion auf Schotter (mal)' },
  { pfad: 'getriebe.allrad.wiesenweg', min: 0.8, max: 1.4, schritt: 0.01, info: 'Allrad: Traktion auf dem Wiesenweg (mal; M8b)' },
  { pfad: 'getriebe.turbo.aufbau', min: 0.05, max: 1.5, schritt: 0.01, info: 'Turbo: Sekunden, bis der Ladedruck voll ist' },
  { pfad: 'getriebe.turbo.verlust', min: 0, max: 0.3, schritt: 0.005, info: 'Turbo: Schub-Verlust ohne Ladedruck (Turboloch)' },
];

const lies = (pfad) => pfad.split('.').reduce((o, k) => (o == null ? undefined : o[k]), CONFIG);
function schreibe(pfad, wert) {
  const teile = pfad.split('.'), letzter = teile.pop();
  const o = teile.reduce((x, k) => x[k], CONFIG);
  o[letzter] = wert;
}
const runde = (w, schritt) => {
  const stellen = Math.max(0, Math.ceil(-Math.log10(schritt)));
  return Number(w.toFixed(stellen));
};

// physik, getriebe: nur gelesen (Anzeige Ladedruck, Achslast, Tempo)
export function baueFahrlabor({ physik, getriebe }) {
  const stil = document.createElement('style');
  stil.textContent = `
    body { padding-right: ${BREITE}px; box-sizing: border-box; } /* Spielbild mittig im Platz links vom Panel */
    #fahrlabor { position: fixed; top: 0; right: 0; bottom: 0; width: ${BREITE}px; overflow-y: auto; box-sizing: border-box;
      background: rgba(18, 24, 32, 0.96); color: #f4f4ee; border-left: 1px solid #e6e2d3; font: 12px/1.35 monospace; padding: 8px 10px; z-index: 5; }
    #fahrlabor h1 { color: #ffd23c; font-size: 14px; letter-spacing: 2px; margin: 0 0 2px; }
    #fahrlabor p { color: #aab4be; margin: 0 0 8px; }
    #fahrlabor .profil { display: flex; flex-wrap: wrap; gap: 6px; margin: 6px 0 8px; }
    #fahrlabor button { font: inherit; color: #f4f4ee; background: #263240; border: 1px solid #e6e2d3; border-radius: 2px; padding: 3px 8px; cursor: pointer; }
    #fahrlabor button:hover { color: #ff9a2e; }
    #fahrlabor button.an { background: #ff9a2e; color: #000; }
    #fahrlabor .regler { margin: 6px 0; }
    #fahrlabor .kopf { display: grid; grid-template-columns: minmax(0, 1fr) 54px 24px; gap: 4px; align-items: center; }
    #fahrlabor .name { color: #8fb4d8; overflow-wrap: anywhere; }
    #fahrlabor .wert { color: #ffd23c; text-align: right; }
    #fahrlabor .wert.geaendert { color: #ff9a2e; }
    #fahrlabor .kopf button { padding: 0 4px; }
    #fahrlabor .info { color: #aab4be; font-size: 11px; }
    #fahrlabor input[type=range] { width: 100%; accent-color: #ff9a2e; margin: 2px 0 0; }
    #fahrlabor textarea { width: 100%; min-height: 70px; box-sizing: border-box; font: 11px/1.3 monospace; color: #f4f4ee; background: #0d1218; border: 1px solid #44505c; margin-top: 6px; }
    #fahrlabor .live { color: #aab4be; white-space: pre-wrap; margin: 6px 0; }
  `;
  document.head.append(stil);
  const panel = document.createElement('div');
  panel.id = 'fahrlabor';
  panel.innerHTML = `<h1>FAHR-LABOR</h1>
    <p>Werte live verstellen (wirkt sofort). Nur diese Seite: nichts wird gespeichert, neu laden = wieder wie vorher.
    Fahren mit den Tasten wie immer.</p>
    <div class="profil">${Object.keys(CONFIG.fahrprofile).map((id) => `<button data-profil="${id}">${profilName(id)}</button>`).join('')}</div>
    <div class="live" id="fahrlaborLive"></div>
    <div id="fahrlaborRegler"></div>
    <div class="profil"><button id="fahrlaborKopieren">WERTE KOPIEREN</button><button id="fahrlaborZurueck">ALLES ZURÜCK</button></div>
    <textarea id="fahrlaborText" readonly placeholder="Hier erscheinen die geänderten Werte zum Kopieren."></textarea>`;
  document.body.append(panel);
  const $ = (id) => panel.querySelector(`#${id}`);

  // Nach jedem Klick den Fokus zurück: Tasten gehören dem Spiel
  panel.addEventListener('pointerup', () => { setTimeout(() => { if (panel.contains(document.activeElement)) document.activeElement.blur(); }, 0); });
  panel.addEventListener('change', () => { if (panel.contains(document.activeElement)) document.activeElement.blur(); });

  const zeilen = REGLER.map((r) => {
    const el = document.createElement('div');
    el.className = 'regler';
    el.innerHTML = `<div class="kopf"><span class="name">${r.pfad}</span><span class="wert"></span><button title="zurück auf den Wert des Profils">↺</button></div>
      <input type="range" min="${r.min}" max="${r.max}" step="${r.schritt}"><div class="info">${r.info}</div>`;
    $('fahrlaborRegler').append(el);
    const eingabe = el.querySelector('input'), wert = el.querySelector('.wert');
    const z = { r, eingabe, wert };
    eingabe.addEventListener('input', () => { schreibe(r.pfad, runde(+eingabe.value, r.schritt)); zeige(z); });
    el.querySelector('button').addEventListener('click', () => { schreibe(r.pfad, profilWert(aktivesProfil(), r.pfad)); zeige(z); });
    return z;
  });
  function zeige(z) {
    const w = lies(z.r.pfad), basis = profilWert(aktivesProfil(), z.r.pfad);
    z.eingabe.value = w;
    z.wert.textContent = String(w);
    z.wert.classList.toggle('geaendert', w !== basis);
  }
  function alleZeigen() {
    for (const z of zeilen) zeige(z);
    for (const b of panel.querySelectorAll('[data-profil]')) b.classList.toggle('an', b.dataset.profil === aktivesProfil());
  }
  for (const b of panel.querySelectorAll('[data-profil]')) {
    b.addEventListener('click', () => { waehleFahrprofil(b.dataset.profil); alleZeigen(); });
  }
  // Alle geänderten Werte als Text, eine Zeile pro Wert ("auto.gripVorne = 0.95"), zuerst das Profil
  function text() {
    const geaendert = REGLER.filter((r) => lies(r.pfad) !== profilWert(aktivesProfil(), r.pfad));
    return [`profil = ${aktivesProfil()}`, ...geaendert.map((r) => `${r.pfad} = ${lies(r.pfad)}`)].join('\n');
  }
  $('fahrlaborKopieren').addEventListener('click', () => {
    const t = text();
    $('fahrlaborText').value = t;
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).catch(() => {});
  });
  $('fahrlaborZurueck').addEventListener('click', () => { waehleFahrprofil(aktivesProfil()); alleZeigen(); $('fahrlaborText').value = ''; });
  alleZeigen();

  // Live-Anzeige (5 Mal pro Sekunde): Tempo, Gang, Ladedruck, Achslast vorne
  let warte = 0;
  return {
    panel, text, alleZeigen, zeilen,
    aktualisiere(dt) {
      warte -= dt;
      if (warte > 0) return;
      warte = 0.2;
      const last = physik.lastVorne !== undefined ? ` · Last vorne ${Math.round(physik.lastVorne / (physik.lastVorne + physik.lastHinten) * 100)} %` : '';
      $('fahrlaborLive').textContent = `Profil ${profilName(aktivesProfil())} · ${Math.round(physik.tempo * 3.6)} km/h · Gang ${getriebe.anzeige}` +
        ` · Ladedruck ${(getriebe.ladedruck || 0).toFixed(2)}${last}`;
    },
  };
}
