// Checkpoints: Tore quer über die Strasse (zwei Pfosten und ein Banner).
// Die Zeitmessung und das Prüfen auf Abkürzungen passiert in main.js.

import * as THREE from 'three';
import { CONFIG } from './config.js';
import { checkpointBannerTextur, pfostenTextur } from './pixel.js';

export function baueCheckpointTore(szene, strecke) {
  const c = CONFIG.checkpoints;
  const pfostenTex = pfostenTextur();
  const pfostenMat = new THREE.MeshLambertMaterial({ map: pfostenTex });
  const halb = c.torBreite / 2;
  const liste = [];
  c.beiMeter.forEach((meter, n) => {
    const p = strecke.punktBei(meter);
    const tor = new THREE.Group();
    // Pfosten links und rechts
    for (const seite of [-1, 1]) {
      const geo = new THREE.BoxGeometry(0.3, c.torHoehe + 0.6, 0.3);
      // Ringel: Textur wiederholt sich alle 0.8 m
      const uv = geo.attributes.uv;
      for (let i = 0; i < uv.count; i++) uv.setY(i, uv.getY(i) * ((c.torHoehe + 0.6) / 0.8));
      const m = new THREE.Mesh(geo, pfostenMat);
      m.position.set(seite * halb, (c.torHoehe + 0.6) / 2 - 0.6, 0);
      tor.add(m);
    }
    // Banner oben (beidseitig mit Nummer)
    const banner = new THREE.Mesh(
      new THREE.BoxGeometry(c.torBreite + 0.3, 1.1, 0.12),
      new THREE.MeshLambertMaterial({ map: checkpointBannerTextur(n + 1) }),
    );
    banner.position.set(0, c.torHoehe - 0.55, 0);
    tor.add(banner);
    tor.position.set(p.x, p.h, p.z);
    tor.rotation.y = Math.atan2(p.tx, p.tz);
    szene.add(tor);
    liste.push({ s: meter, nummer: n + 1 });
  });
  return liste;
}
