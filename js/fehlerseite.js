// Fehlerseite (seit M10a): "STRECKE KONNTE NICHT GELADEN WERDEN" plus kurzer Grund, im Pixel-Look (320x180).
// Braucht weder Three.js-Szene noch config.js (die hängt an der Strecke), nur Pixelschrift und Texte.

import { pixelText, zeichneTafel } from './pixel.js';
import { t, setzeSprache } from './texte.js';

// Text in Zeilen zu höchstens n Zeichen umbrechen
function umbrechen(text, n) {
  const zeilen = [];
  let z = '';
  for (const w of String(text).split(/\s+/)) {
    if (!w) continue;
    if ((z + ' ' + w).trim().length > n) { if (z) zeilen.push(z); z = w.slice(0, n); } else z = (z + ' ' + w).trim();
  }
  if (z) zeilen.push(z);
  return zeilen;
}

export function zeigeFehlerseite(fehler, { zurueck = false } = {}) {
  // Sprache wie in den Einstellungen (sonst Browser-Sprache)
  let sprache = (navigator.language || 'de').startsWith('de') ? 'de' : 'en';
  try { const e = JSON.parse(window.localStorage.getItem('alpineRally.einstellungen') || '{}'); if (e.sprache === 'de' || e.sprache === 'en') sprache = e.sprache; } catch { /* egal */ }
  setzeSprache(sprache);
  const lade = document.getElementById('lade');
  if (lade) lade.style.display = 'none';
  const buehne = document.getElementById('buehne');
  for (const c of buehne.querySelectorAll('canvas')) c.style.display = 'none';
  const B = 320, H = 180;
  const c = document.createElement('canvas');
  c.id = 'fehlerseite';
  c.width = B; c.height = H;
  buehne.appendChild(c);
  c.style.display = 'block';
  const anpassen = () => {
    const f = Math.min(window.innerWidth / B, window.innerHeight / H);
    buehne.style.width = `${Math.floor(B * f)}px`; buehne.style.height = `${Math.floor(H * f)}px`;
  };
  anpassen();
  window.addEventListener('resize', anpassen);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#121820';
  ctx.fillRect(0, 0, B, H);
  zeichneTafel(ctx, 14, 34, B - 28, 112, 3, '#1c2430', '#c8202a');
  pixelText(ctx, 'ALPINE RALLY', B / 2, 16, 1, '#8a9096', 'mitte');
  pixelText(ctx, t('fehler.strecke.titel'), B / 2, 46, 1, '#f4f4ee', 'mitte');
  const grund = t(`fehler.strecke.${fehler.grund}`);
  pixelText(ctx, grund, B / 2, 64, 1, '#f0c020', 'mitte');
  umbrechen(String(fehler.mehr || '').toUpperCase(), 46).slice(0, 4).forEach((z, i) => pixelText(ctx, z, 24, 80 + i * 10, 1, '#c9c9bd'));
  umbrechen(t('fehler.strecke.hinweis'), 46).forEach((z, i) => pixelText(ctx, z, B / 2, 124 + i * 10, 1, '#f4f4ee', 'mitte'));
  // M10b: andere Strecke kaputt: Taste/Klick/Antippen lädt neu mit der Standard-Etappe (ohne ?strecke= in der Adresse)
  if (zurueck) {
    pixelText(ctx, t('fehler.strecke.zurueck'), B / 2, 156, 1, '#f0c020', 'mitte');
    const weiter = () => { const u = new URL(window.location.href); u.searchParams.delete('strecke'); window.location.replace(u.href); };
    for (const n of ['keydown', 'pointerdown', 'touchstart']) window.addEventListener(n, weiter, { once: true });
  }
  window.__fehlerseite = { grund: fehler.grund, mehr: fehler.mehr, zurueck }; // für Tests
}
