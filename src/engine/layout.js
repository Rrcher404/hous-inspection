// Shared plan geometry for the engine: dimensions, roof surfaces, terrain grade, floors.
// Every engine module reads from here so the shell, placements, collision and zones agree.
// Units: metres. +X east, +Z south (street). Interior finished floor y = 0.

export const CEIL = 2.44;          // finished ceiling
export const PLATE = 2.62;         // top of wall top plate
export const GRADE = -0.75;        // grade at the foundation
export const GARAGE_FLOOR = -0.15; // garage slab top
export const CRAWL_FLOOR = -1.05;  // crawlspace dirt
export const DECK_TOP = -0.05;
export const STAIR_H = 0.925;                // deck-stairs model: 5 risers of 0.185 (built for the >30 in drop)
export const STAIR_BASE = DECK_TOP - STAIR_H; // stairs land on a concrete pad at this height
export const SILL = -0.29;         // top of foundation / bottom of siding
export const JOIST_BOT = -0.255;
export const ATTIC_FLOOR = 2.53;   // top of the thin (3 in) blown insulation
export const ATTIC_ITEM_Y = 2.445; // attic floor props: origin = ceiling drywall (they carry their own insulation)

export const PITCH = 0.5;          // 6/12 main roof
export const GPITCH = 1 / 3;       // 4/12 garage roof (lower gable)
export const PITCH_A = Math.atan(PITCH);
export const HEEL = 2.72;          // sheathing underside at the outer wall line
export const ROOF_T = 0.05;        // sheathing + shingle (vertical)
export const RIDGE_Z = 5;
export const HALF = 5.2;           // ridge to outer wall face
export const OVH = 0.45;           // eave overhang (horizontal)

export const MAIN = { x0: -0.2, x1: 15.15, z0: -0.2, z1: 10.2, rakeW: -0.65, rakeE: 15.35 };
export const GAR = { x0: 15.15, x1: 21.7, z0: -0.2, z1: 10.2, rakeE: 22.0 };
export const PORCH = { x0: 5, x1: 9, xc: 7, half: 2, zFront: 12.0, ovh: 0.25 };
export const CHIMNEY = { x0: -1.0, x1: -0.2, z0: 6.55, z1: 7.45 };

// Openings shared by shell, placements and collision.
export const OPEN = {
  livWindow: { a0: 2.75, a1: 4.25, y0: 0.75, y1: 2.05 },
  frontDoor: { a0: 6.55, a1: 7.45, y0: 0, y1: 2.05 },
  priWindow: { a0: 10.06, a1: 10.94, y0: 1.33, y1: 2.29 },
  priWindow2: { a0: 12.41, a1: 13.29, y0: 1.33, y1: 2.29 },
  kitWindow: { a0: 1.1, a1: 2.0, y0: 1.05, y1: 2.0 },
  bathWindow: { a0: 10.3, a1: 10.8, y0: 1.5, y1: 2.1 },
  bed2Window: { a0: 12.55, a1: 13.45, y0: 0.8, y1: 1.9 },
  fireDoor: { a0: 4.65, a1: 5.55, y0: 0, y1: 2.05 },
  garSideDoor: { a0: 18.6, a1: 19.5, y0: GARAGE_FLOOR, y1: 1.9 },
  overhead: { a0: 16.03, a1: 20.63, y0: GARAGE_FLOOR, y1: 2.0 },
  crawlDoor: { a0: 9.28, a1: 9.92, y0: -0.82, y1: -0.3 },
  backDoor: { a0: 4.61, a1: 5.49, y0: 0, y1: 2.05 },
  backDoorX: [4.61, 5.49],
};

export const DRIVE = { x0: 15.83, x1: 20.83, z0: 10.2, z1: 18.2, xc: 18.33 };

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const smooth = (t) => t * t * (3 - 2 * t);

// ── Roof surfaces ────────────────────────────────────────────────────────────
export const mainUnder = (z) => HEEL + PITCH * (HALF - Math.abs(z - RIDGE_Z));
export const mainTop = (z) => mainUnder(z) + ROOF_T;
export const garUnder = (z) => HEEL + GPITCH * (HALF - Math.abs(z - RIDGE_Z));
export const garTop = (z) => garUnder(z) + ROOF_T;
export const porchUnder = (x) => HEEL + PITCH * (PORCH.half - Math.abs(x - PORCH.xc));
export const porchTop = (x) => porchUnder(x) + ROOF_T;

/** Top of whatever roof surface is under (x,z), or -Infinity. */
export function roofTopAt(x, z) {
  let y = -Infinity;
  if (x >= MAIN.rakeW && x <= MAIN.rakeE && z >= MAIN.z0 - OVH && z <= MAIN.z1 + OVH) y = mainTop(z);
  if (x >= CHIMNEY.x0 - 0.15 && x < MAIN.rakeW && z >= CHIMNEY.z0 - 0.2 && z <= CHIMNEY.z1 + 0.2) y = Math.max(y, mainTop(z));
  if (x >= GAR.x0 && x <= GAR.rakeE && z >= GAR.z0 - OVH && z <= GAR.z1 + OVH) y = Math.max(y, garTop(z));
  if (x >= PORCH.x0 - PORCH.ovh && x <= PORCH.x1 + PORCH.ovh && z >= 8.2 && z <= PORCH.zFront + 0.15) y = Math.max(y, porchTop(x));
  return y;
}

// ── Terrain ──────────────────────────────────────────────────────────────────
function distToHouse(x, z) {
  const dx = x < MAIN.x0 ? MAIN.x0 - x : x > GAR.x1 ? x - GAR.x1 : 0;
  const dz = z < MAIN.z0 ? MAIN.z0 - z : z > MAIN.z1 ? z - MAIN.z1 : 0;
  return Math.hypot(dx, dz);
}
/** Natural grade: flat at -0.75 near the house, falling gently away (positive drainage). */
export function baseGrade(x, z) {
  const d = distToHouse(x, z);
  let y = GRADE - 0.025 * clamp(d - 2.5, 0, 8);
  // shallow dug well in front of the crawl access door
  const cd = Math.hypot((x - 9.6) * 0.8, (z + 0.45) * 1.6);
  if (cd < 0.9) y -= 0.13 * smooth(1 - cd / 0.9);
  // the rear yard falls away under the deck so the outer edge has > 30 in (0.76 m) of drop
  if (z < MAIN.z0 && x > -1.8 && x < 7.4) {
    const wx = smooth(clamp(Math.min((x + 1.8) / 1.6, (7.4 - x) / 1.6), 0, 1));
    const wz = smooth(clamp((MAIN.z0 - z) / 3.2, 0, 1)) * smooth(clamp((z + 11) / 4, 0, 1));
    y -= 0.36 * wx * wz;
  }
  return y;
}
export const DRIVE_END = GRADE - 0.025 * (8 - 2.5);
/** Ground under the driveway slab (slab is 0.1 thick, top meets the garage slab at z=10.2). */
export const driveUnder = (z) => -0.25 + (DRIVE_END + 0.25) * clamp((z - DRIVE.z0) / (DRIVE.z1 - DRIVE.z0), 0, 1);

export function gradeAt(x, z) {
  const g = baseGrade(x, z);
  if (z < DRIVE.z0 - 0.01) return g;
  const d = x < DRIVE.x0 ? DRIVE.x0 - x : x > DRIVE.x1 ? x - DRIVE.x1 : 0;
  const w = smooth(clamp(1 - d / 2.2, 0, 1));
  if (w <= 0) return g;
  const dv = driveUnder(z);
  return g + (dv - g) * w * (z > DRIVE.z1 ? smooth(clamp(1 - (z - DRIVE.z1) / 2, 0, 1)) : 1);
}

// ── Rooms (interior plan rectangles) ─────────────────────────────────────────
export const ROOMS = [
  { id: 'kitchen', zone: 'kitchen', x0: 0, x1: 6, z0: 0, z1: 5.0 },
  { id: 'living', zone: 'living', x0: 0, x1: 6, z0: 5.0, z1: 10 },
  { id: 'laundry', zone: 'laundry', x0: 6, x1: 8.5, z0: 0, z1: 4.5 },
  { id: 'bath', zone: 'bath', x0: 8.5, x1: 11, z0: 0, z1: 4.5 },
  { id: 'bed2', zone: 'bed2', x0: 11, x1: 15, z0: 0, z1: 4.5 },
  { id: 'hall', zone: 'hall', x0: 6, x1: 15, z0: 4.5, z1: 5.7 },
  { id: 'foyer', zone: 'hall', x0: 6, x1: 8, z0: 5.7, z1: 10 },
  { id: 'primary', zone: 'primary', x0: 8, x1: 15, z0: 5.7, z1: 10 },
  { id: 'garage', zone: 'garage', x0: 15.0, x1: 21.7, z0: -0.2, z1: 10.2 },
];

export const inRect = (x, z, x0, x1, z0, z1) => x >= x0 && x <= x1 && z >= z0 && z <= z1;

// ── Walk surfaces per level ─────────────────────────────────────────────────
export const EYE = { ground: 1.6, roof: 1.55, attic: 1.5, crawl: 0.55 };

export function floorAt(level, x, z) {
  if (level === 'attic') return ATTIC_FLOOR;
  if (level === 'crawl') return CRAWL_FLOOR;
  if (level === 'roof') { const r = roofTopAt(x, z); return r > -1e8 ? r : GRADE; }
  if (inRect(x, z, 0, 15.0, 0, 10)) return 0;
  if (inRect(x, z, 15.0, 21.5, -0.05, 10.2)) return x < 15.15 ? 0 : GARAGE_FLOOR;
  if (inRect(x, z, 4.6, 5.5, -0.2, 0)) return 0; // back door threshold
  if (inRect(x, z, 0.5, 5.5, -3.6, -0.2)) return DECK_TOP;
  if (inRect(x, z, 4.1, 5.1, -4.7, -3.6)) return DECK_TOP + (STAIR_BASE - DECK_TOP) * clamp((-3.6 - z) / 1.1, 0, 1);
  if (inRect(x, z, 4.05, 5.15, -5.3, -4.7)) return STAIR_BASE;
  if (inRect(x, z, 6.1, 7.9, 10.2, 11.8)) return GRADE * clamp((z - 10.2) / 1.6, 0, 1);
  if (inRect(x, z, 18.5, 19.6, -1.2, -0.2)) return GARAGE_FLOOR + (GRADE - GARAGE_FLOOR) * clamp((-0.2 - z) / 1.0, 0, 1);
  if (inRect(x, z, DRIVE.x0, DRIVE.x1, DRIVE.z0, DRIVE.z1)) return driveUnder(z) + 0.1;
  return gradeAt(x, z);
}

/** Highest the eye may go at (x,z) on a level (low framing, roof underside). */
export function headroomAt(level, x, z) {
  if (level === 'attic') return mainUnder(z) - 0.22;
  if (level === 'crawl') {
    let h = -0.5;
    for (const gz of GIRDERS_Z) if (Math.abs(z - gz) < 0.42) h = Math.min(h, -0.62);
    if (Math.abs(z - 5.0) < 0.45 && x > 5.6 && x < 13.9) h = Math.min(h, -0.6);
    return h;
  }
  if (level === 'ground' && inRect(x, z, 0, 21.5, 0, 10)) return CEIL - 0.25;
  return 1e9;
}

export const GIRDERS_Z = [3.33, 6.67];
export const PIERS_X = [1.8, 4.2, 6.6, 9.0, 11.4, 13.8];

export const BOUNDS = {
  ground: { x0: -11.4, x1: 28.4, z0: -11.4, z1: 27 },
  roof: { x0: -0.45, x1: 21.85, z0: -0.5, z1: 10.6 },
  attic: { x0: 0.35, x1: 14.75, z0: 1.3, z1: 8.7 },
  crawl: { x0: 0.3, x1: 14.7, z0: 0.3, z1: 9.7 },
};
