// Zone detection, spawn poses, portal destinations, walk-through triggers, per-level
// collision, and which component zones are worth drawing from where you stand.
import { ROOMS, inRect, BOUNDS } from './layout.js';

const PI = Math.PI, H = PI / 2;

/** Spawn pose per zone (fast travel + portal arrivals). yaw 0 = looking north (−Z). */
export const POSES = {
  exterior: { level: 'ground', x: 8.6, z: 19.2, yaw: 0.05, pitch: -0.03 },
  roof:     { level: 'roof', x: 14.0, z: 9.9, yaw: 0.25, pitch: -0.28 },
  deck:     { level: 'ground', x: 3.6, z: -2.9, yaw: PI - 0.2, pitch: -0.1 },
  shed:     { level: 'ground', x: -5.5, z: -1.5, yaw: 0, pitch: -0.08 },
  living:   { level: 'ground', x: 4.9, z: 7.55, yaw: H + 0.05, pitch: -0.08 },
  kitchen:  { level: 'ground', x: 4.4, z: 3.7, yaw: 0.25, pitch: -0.12 },
  hall:     { level: 'ground', x: 14.1, z: 5.1, yaw: H, pitch: 0.05 },
  bath:     { level: 'ground', x: 9.55, z: 3.9, yaw: -0.15, pitch: -0.18 },
  primary:  { level: 'ground', x: 10.6, z: 6.9, yaw: PI - 0.35, pitch: -0.05 },
  bed2:     { level: 'ground', x: 12.6, z: 3.6, yaw: 0.2, pitch: -0.06 },
  laundry:  { level: 'ground', x: 7.35, z: 3.6, yaw: 0, pitch: -0.18 },
  garage:   { level: 'ground', x: 17.6, z: 6.9, yaw: -H + 0.75, pitch: -0.05 },
  attic:    { level: 'attic', x: 10.36, z: 6.05, yaw: H, pitch: -0.12 },
  crawl:    { level: 'crawl', x: 9.6, z: 0.95, yaw: PI, pitch: 0.02 },
};

/** Named exits (portal meshes, walk-through triggers, portal components). */
export const EXITS = {
  'attic>hall':     { level: 'ground', x: 11.1, z: 5.1, yaw: H, pitch: 0.12 },
  'crawl>exterior': { level: 'ground', x: 9.6, z: -1.8, yaw: PI, pitch: -0.2 },
  'roof>exterior':  { level: 'ground', x: 14.0, z: 12.7, yaw: 0, pitch: 0.05 },
  'deck>kitchen':   { level: 'ground', x: 5.05, z: 1.05, yaw: PI, pitch: -0.05 },
  'kitchen>deck':   { level: 'ground', x: 5.05, z: -0.95, yaw: 0, pitch: -0.05 },
  'hall>garage':    { level: 'ground', x: 15.8, z: 5.1, yaw: -H, pitch: 0 },
  'garage>hall':    { level: 'ground', x: 14.35, z: 5.1, yaw: H, pitch: 0 },
};

/** Clicking a portal component in walk mode travels here. */
export const PORTAL_COMPONENTS = {
  'ext-ladder': 'roof',
  'hall-attic-ladder': 'attic',
  'kit-back-door': 'kitchen>deck',
  'ext-crawl-access': 'crawl', // not marked as a portal in the manifest; the engine treats it as one
};

/** Walk-through triggers: entering the rect while moving along `dir` fades you to `to`. */
export const TRIGGERS = [
  { level: 'ground', rect: [14.5, 15.0, 4.65, 5.55], dir: [1, 0], to: 'hall>garage' },
  { level: 'ground', rect: [15.15, 15.62, 4.65, 5.55], dir: [-1, 0], to: 'garage>hall' },
  { level: 'roof', rect: [13.45, 14.55, 10.32, 11], dir: [0, 1], to: 'roof>exterior' },
  { level: 'attic', rect: [9.4, 10.6, 4.8, 5.4], dir: null, to: 'attic>hall' },
  { level: 'crawl', rect: [9.15, 10.05, 0, 0.48], dir: [0, -1], to: 'crawl>exterior' },
];

export function zoneAt(level, x, z) {
  if (level === 'attic') return 'attic';
  if (level === 'crawl') return 'crawl';
  if (level === 'roof') return 'roof';
  for (const r of ROOMS) if (inRect(x, z, r.x0, r.x1, r.z0, r.z1)) return r.zone;
  if (inRect(x, z, -0.3, 6.6, -5.8, -0.2)) return 'deck';
  if (inRect(x, z, -9.5, -1.8, -9.5, -0.9)) return 'shed';
  return 'exterior';
}

export const ZONE_LEVEL = { attic: 'attic', crawl: 'crawl', roof: 'roof' };
export const levelOfZone = (zone) => ZONE_LEVEL[zone] || 'ground';

const INTERIOR = ['living', 'kitchen', 'hall', 'bath', 'primary', 'bed2', 'laundry'];
/** Which component zones to draw when the player stands in a zone. */
export const VISIBLE = {
  exterior: ['exterior', 'roof', 'deck', 'shed', 'garage', 'living'],
  deck: ['exterior', 'roof', 'deck', 'shed', 'kitchen', 'bed2'],
  shed: ['exterior', 'roof', 'deck', 'shed'],
  roof: ['exterior', 'roof', 'deck', 'shed'],
  garage: ['garage', 'hall', 'exterior', 'roof', 'bed2', 'primary'],
  attic: ['attic'],
  crawl: ['crawl'],
};
for (const z of INTERIOR) VISIBLE[z] = [...INTERIOR, 'garage', 'exterior', 'deck'];

/** Static groups drawn per level. */
export const LEVEL_GROUPS = {
  ground: ['exterior', 'shell', 'roof', 'interior', 'glass'],
  roof: ['exterior', 'shell', 'roof', 'glass'],
  attic: ['roof', 'attic'],
  crawl: ['crawl', 'shell'],
};

// ── Collision: circle vs AABB list + level bounds ──────────────────────────
export function resolveCollision(level, pos, radius, colliders) {
  const list = colliders[level];
  for (let it = 0; it < 3; it++) {
    let moved = false;
    for (let i = 0; i < list.length; i++) {
      const b = list[i];
      if (pos.x < b.x0 - radius || pos.x > b.x1 + radius || pos.z < b.z0 - radius || pos.z > b.z1 + radius) continue;
      const cx = pos.x < b.x0 ? b.x0 : pos.x > b.x1 ? b.x1 : pos.x;
      const cz = pos.z < b.z0 ? b.z0 : pos.z > b.z1 ? b.z1 : pos.z;
      let dx = pos.x - cx, dz = pos.z - cz;
      const d2 = dx * dx + dz * dz;
      if (d2 >= radius * radius) continue;
      if (d2 > 1e-10) {
        const d = Math.sqrt(d2), push = radius - d;
        pos.x += (dx / d) * push; pos.z += (dz / d) * push;
      } else {
        // centre inside the box: push out along the shallowest axis
        const l = pos.x - b.x0, r = b.x1 - pos.x, t = pos.z - b.z0, bt = b.z1 - pos.z;
        const m = Math.min(l, r, t, bt);
        if (m === l) pos.x = b.x0 - radius; else if (m === r) pos.x = b.x1 + radius;
        else if (m === t) pos.z = b.z0 - radius; else pos.z = b.z1 + radius;
      }
      moved = true;
    }
    if (!moved) break;
  }
  const B = BOUNDS[level];
  if (pos.x < B.x0) pos.x = B.x0; if (pos.x > B.x1) pos.x = B.x1;
  if (pos.z < B.z0) pos.z = B.z0; if (pos.z > B.z1) pos.z = B.z1;
}

export function blockedAt(level, x, z, radius, colliders) {
  const B = BOUNDS[level];
  if (x < B.x0 || x > B.x1 || z < B.z0 || z > B.z1) return true;
  for (const b of colliders[level]) {
    if (x > b.x0 - radius && x < b.x1 + radius && z > b.z0 - radius && z < b.z1 + radius) return true;
  }
  return false;
}
