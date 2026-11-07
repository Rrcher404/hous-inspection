// Static world: terrain, house shell (walls/openings/roofs), interior finishes + furniture,
// attic framing, crawlspace, porch, deck, yard, street. All merged per material.
// Returns render groups per visibility layer, collision AABBs per level, ray occluders,
// portal meshes and light-fixture positions.
import * as THREE from 'three';
import { StaticBatch } from './batch.js';
import { getMat } from './textures.js';
import {
  CEIL, PLATE, GRADE, GARAGE_FLOOR, CRAWL_FLOOR, DECK_TOP, STAIR_BASE, SILL, JOIST_BOT, ATTIC_FLOOR,
  HEEL, ROOF_T, OVH, MAIN, GAR, PORCH, CHIMNEY, OPEN, DRIVE, GIRDERS_Z, PIERS_X,
  mainUnder, mainTop, garUnder, garTop, porchUnder, porchTop, gradeAt, driveUnder, DRIVE_END,
} from './layout.js';

let seed = 4242;
const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
const rr = (a, b) => a + (b - a) * rnd();

export function buildHouse() {
  const B = {
    ext: new StaticBatch('exterior'),   // yard, shell exterior, porch, deck
    shell: new StaticBatch('shell'),    // walls + foundation (seen from most levels)
    roof: new StaticBatch('roof'),      // roof slabs + gables (seen from outside and the attic)
    int: new StaticBatch('interior'),   // finishes, furniture, fixtures
    att: new StaticBatch('attic'),
    crawl: new StaticBatch('crawl'),
    glass: new StaticBatch('glass'),
  };
  const col = { ground: [], roof: [], attic: [], crawl: [] };
  const occluders = [];
  const portals = [];
  const fixtures = {};
  const aabb = (level, x0, x1, z0, z1) => col[level].push({ x0: Math.min(x0, x1), x1: Math.max(x0, x1), z0: Math.min(z0, z1), z1: Math.max(z0, z1) });

  // ── Wall builder ──────────────────────────────────────────────────────────
  // axis 'x': wall runs along X (a = x), thickness in Z (c0..c1). lo face = at c0 (−Z), hi = at c1 (+Z).
  // axis 'z': wall runs along Z (a = z), thickness in X. lo = at c0 (−X), hi = at c1 (+X).
  function wall(b, axis, a0, a1, c0, c1, y0, y1, openings, lo, hi, opt = {}) {
    const ops = (openings || []).filter((o) => o.a1 > a0 && o.a0 < a1).map((o) => ({ ...o, a0: Math.max(o.a0, a0), a1: Math.min(o.a1, a1) })).sort((p, q) => p.a0 - q.a0);
    const jamb = opt.jamb || 'trim';
    const top = opt.top || 'lumber';
    const put = (p0, p1, q0, q1, faceTop, faceBot, endA, endB) => {
      if (p1 - p0 < 1e-4 || q1 - q0 < 1e-4) return;
      const mats = axis === 'x'
        ? { nz: lo, pz: hi, nx: endA, px: endB, py: faceTop, ny: faceBot }
        : { nx: lo, px: hi, nz: endA, pz: endB, py: faceTop, ny: faceBot };
      if (axis === 'x') { b.box(p0, q0, c0, p1, q1, c1, mats); occluders.push(new THREE.Box3(new THREE.Vector3(p0, q0, c0), new THREE.Vector3(p1, q1, c1))); }
      else { b.box(c0, q0, p0, c1, q1, p1, mats); occluders.push(new THREE.Box3(new THREE.Vector3(c0, q0, p0), new THREE.Vector3(c1, q1, p1))); }
    };
    let cur = a0;
    const segs = [];
    for (const o of ops) {
      put(cur, o.a0, y0, y1, top, null, cur === a0 ? opt.endMat || jamb : jamb, jamb);
      segs.push([cur, o.a0]);
      if (o.y0 > y0) put(o.a0, o.a1, y0, o.y0, o.glass ? 'frame' : jamb, null, null, null);
      if (o.y1 < y1) put(o.a0, o.a1, o.y1, y1, top, o.glass ? 'frame' : jamb, null, null);
      cur = o.a1;
    }
    put(cur, a1, y0, y1, top, null, jamb, opt.endMat || jamb);
    segs.push([cur, a1]);

    // collision: door openings are gaps
    if (opt.level !== false) {
      const lvl = opt.level || 'ground';
      let s = a0;
      for (const o of ops) {
        if (o.door) { if (o.a0 - s > 0.01) (axis === 'x' ? aabb(lvl, s, o.a0, c0, c1) : aabb(lvl, c0, c1, s, o.a0)); s = o.a1; }
      }
      if (a1 - s > 0.01) (axis === 'x' ? aabb(lvl, s, a1, c0, c1) : aabb(lvl, c0, c1, s, a1));
    }

    // baseboards + casings on painted faces
    const fy = opt.floorY ?? 0;
    for (const [side, mat] of [['lo', lo], ['hi', hi]]) {
      if (!mat || !mat.startsWith('p_')) continue;
      const c = side === 'lo' ? c0 : c1, d = side === 'lo' ? -1 : 1;
      const bb = (p0, p1, q0, q1, out) => {
        if (axis === 'x') b.int.box(p0, q0, c, p1, q1, c + d * out, 'trim');
        else b.int.box(c, q0, p0, c + d * out, q1, p1, 'trim');
      };
      let s2 = a0;
      for (const o of ops) {
        if (o.y0 <= fy + 0.01) { bb(s2, o.a0, fy, fy + 0.09, 0.012); s2 = o.a1; }
        if (o.noCasing) continue; // the component model carries its own casing
        // casing
        const cw = 0.07;
        bb(o.a0 - cw, o.a0, Math.max(fy, o.y0 - (o.y0 > fy + 0.01 ? 0.06 : 0)), o.y1 + cw, 0.016);
        bb(o.a1, o.a1 + cw, Math.max(fy, o.y0 - (o.y0 > fy + 0.01 ? 0.06 : 0)), o.y1 + cw, 0.016);
        bb(o.a0 - cw, o.a1 + cw, o.y1, o.y1 + cw, 0.016);
        if (o.y0 > fy + 0.01) bb(o.a0 - 0.04, o.a1 + 0.04, o.y0 - 0.025, o.y0, 0.05);
      }
      bb(s2, a1, fy, fy + 0.09, 0.012);
    }
    // glass + sash for windows
    for (const o of ops) {
      if (!o.glass) continue;
      const cm = (c0 + c1) / 2;
      if (axis === 'x') {
        B.glass.box(o.a0, o.y0, cm - 0.003, o.a1, o.y1, cm + 0.003, 'glass', false);
        if (o.sash !== false) {
          const ym = (o.y0 + o.y1) / 2;
          b.box(o.a0, ym - 0.025, cm - 0.03, o.a1, ym + 0.025, cm + 0.03, 'frame');
          b.box(o.a0, o.y0, cm - 0.03, o.a0 + 0.04, o.y1, cm + 0.03, 'frame');
          b.box(o.a1 - 0.04, o.y0, cm - 0.03, o.a1, o.y1, cm + 0.03, 'frame');
        }
      } else {
        B.glass.box(cm - 0.003, o.y0, o.a0, cm + 0.003, o.y1, o.a1, 'glass', false);
        if (o.sash !== false) {
          const ym = (o.y0 + o.y1) / 2;
          b.box(cm - 0.03, ym - 0.025, o.a0, cm + 0.03, ym + 0.025, o.a1, 'frame');
        }
      }
    }
    return segs;
  }
  B.shell.int = B.int; // baseboards go to interior batch
  B.ext.int = B.int;

  const W = (o) => ({ ...o, glass: true });
  const D = (o) => ({ ...o, door: true });
  const { livWindow, frontDoor, priWindow, priWindow2, kitWindow, bathWindow, bed2Window, fireDoor, garSideDoor, overhead } = OPEN;

  // ── Exterior walls (main block) ─────────────────────────────────────────────
  const northOps = [D({ ...OPEN.backDoor, noCasing: true }), W(kitWindow), W({ ...bathWindow }), W({ ...bed2Window, sash: false, noCasing: true })];
  wall(B.shell, 'x', MAIN.x0, 6, MAIN.z0, 0, SILL, PLATE, northOps, 'siding', 'p_kitchen');
  wall(B.shell, 'x', 6, 8.5, MAIN.z0, 0, SILL, PLATE, northOps, 'siding', 'p_laundry');
  wall(B.shell, 'x', 8.5, 11, MAIN.z0, 0, SILL, PLATE, northOps, 'siding', 'p_bath');
  wall(B.shell, 'x', 11, MAIN.x1, MAIN.z0, 0, SILL, PLATE, northOps, 'siding', 'p_bed2');
  const southOps = [W({ ...livWindow, sash: false, noCasing: true }), D(frontDoor), W({ ...priWindow, sash: false, noCasing: true }), W(priWindow2)];
  wall(B.shell, 'x', MAIN.x0, 6, 10, MAIN.z1, SILL, PLATE, southOps, 'p_living', 'siding');
  wall(B.shell, 'x', 6, 8, 10, MAIN.z1, SILL, PLATE, southOps, 'p_hall', 'siding');
  wall(B.shell, 'x', 8, MAIN.x1, 10, MAIN.z1, SILL, PLATE, southOps, 'p_primary', 'siding');
  wall(B.shell, 'z', MAIN.z0, 5, MAIN.x0, 0, SILL, PLATE, [], 'siding', 'p_kitchen');
  wall(B.shell, 'z', 5, MAIN.z1, MAIN.x0, 0, SILL, PLATE, [], 'siding', 'p_living');
  // house / garage common wall (fire separation)
  wall(B.shell, 'z', MAIN.z0, 4.5, 15.0, 15.15, SILL, PLATE, [], 'p_bed2', 'p_garage', { floorY: 0 });
  wall(B.shell, 'z', 4.5, 5.7, 15.0, 15.15, SILL, PLATE, [D(fireDoor)], 'p_hall', 'p_garage');
  wall(B.shell, 'z', 5.7, MAIN.z1, 15.0, 15.15, SILL, PLATE, [], 'p_primary', 'p_garage');
  // garage baseboards on the garage face of the common wall are skipped (slab-level): add a curb
  B.shell.box(15.15, GARAGE_FLOOR, 0, 15.2, 0.0, 10, 'concrete');
  // garage walls
  wall(B.shell, 'x', GAR.x0, GAR.x1, GAR.z0, 0, GARAGE_FLOOR, PLATE, [D(garSideDoor)], 'siding', 'p_garage', { floorY: GARAGE_FLOOR });
  wall(B.shell, 'x', GAR.x0, GAR.x1, 10, GAR.z1, GARAGE_FLOOR, PLATE, [overhead], 'p_garage', 'siding', { floorY: GARAGE_FLOOR });
  wall(B.shell, 'z', GAR.z0, GAR.z1, 21.5, GAR.x1, GARAGE_FLOOR, PLATE, [], 'p_garage', 'siding', { floorY: GARAGE_FLOOR });

  // ── Interior partitions ───────────────────────────────────────────────────
  const x6ops = [D({ a0: 4.56, a1: 5.64, y0: 0, y1: 2.1 }), D({ a0: 6.3, a1: 9.5, y0: 0, y1: 2.1 })];
  wall(B.shell, 'z', 0, 4.5, 5.94, 6.06, 0, PLATE, x6ops, 'p_kitchen', 'p_laundry');
  wall(B.shell, 'z', 4.5, 5.0, 5.94, 6.06, 0, PLATE, x6ops, 'p_kitchen', 'p_hall');
  wall(B.shell, 'z', 5.0, 10, 5.94, 6.06, 0, PLATE, x6ops, 'p_living', 'p_hall');
  const z45 = [D({ a0: 7.0, a1: 7.8, y0: 0, y1: 2.05 }), D({ a0: 8.8, a1: 9.55, y0: 0, y1: 2.05 }), D({ a0: 11.49, a1: 12.31, y0: 0, y1: 2.05, noCasing: true })];
  wall(B.shell, 'x', 6.06, 8.5, 4.44, 4.56, 0, PLATE, z45, 'p_laundry', 'p_hall');
  wall(B.shell, 'x', 8.5, 11, 4.44, 4.56, 0, PLATE, z45, 'p_bath', 'p_hall');
  wall(B.shell, 'x', 11, 15, 4.44, 4.56, 0, PLATE, z45, 'p_bed2', 'p_hall');
  wall(B.shell, 'z', 0, 4.44, 8.44, 8.56, 0, PLATE, [], 'p_laundry', 'p_bath');
  wall(B.shell, 'z', 0, 4.44, 10.94, 11.06, 0, PLATE, [], 'p_bath', 'p_bed2');
  wall(B.shell, 'x', 8.0, 15, 5.64, 5.76, 0, PLATE, [D({ a0: 8.6, a1: 9.4, y0: 0, y1: 2.05 })], 'p_hall', 'p_primary');
  wall(B.shell, 'z', 5.76, 10, 7.94, 8.06, 0, PLATE, [], 'p_hall', 'p_primary');
  wall(B.shell, 'x', 12.5, 15, 6.36, 6.44, 0, PLATE, [D({ a0: 12.75, a1: 14.75, y0: 0, y1: 2.05 })], 'p_primary', 'p_primary');
  wall(B.shell, 'z', 5.76, 6.36, 12.44, 12.56, 0, PLATE, [], 'p_primary', 'p_primary');

  // ── Floors, ceilings ────────────────────────────────────────────────────────
  const floor = (x0, x1, z0, z1, m, y = 0) => B.int.box(x0, y - 0.02, z0, x1, y, z1, { py: m, def: null }, false);
  floor(0, 6, 0, 5.0, 'tileK'); floor(0, 6, 5.0, 10, 'wood');
  floor(6, 8.5, 0, 4.5, 'tileL'); floor(8.5, 11, 0, 4.5, 'tileB'); floor(11, 15, 0, 4.5, 'carpet2');
  floor(6, 15, 4.5, 5.7, 'wood'); floor(6, 8, 5.7, 10, 'wood'); floor(8, 15, 5.7, 10, 'carpetP');
  // garage slab
  B.shell.box(GAR.x0, GARAGE_FLOOR - 0.1, 0, 21.5, GARAGE_FLOOR, MAIN.z1, { py: 'slab', pz: 'concrete', def: null }, false);
  // ceilings (one plane with a hole for the attic stairs)
  const ceil = (x0, x1, z0, z1) => B.int.box(x0, CEIL, z0, x1, CEIL + 0.01, z1, { ny: 'ceiling', def: null }, true);
  const HX0 = 9.3, HX1 = 10.7, HZ0 = 4.75, HZ1 = 5.45;
  ceil(0, 15, 0, HZ0); ceil(0, 15, HZ1, 10); ceil(0, HX0, HZ0, HZ1); ceil(HX1, 15, HZ0, HZ1);
  ceil(GAR.x0, 21.5, 0, 10);
  // hatch frame (seen from the hall)
  B.int.box(HX0 - 0.05, CEIL - 0.015, HZ0 - 0.05, HX1 + 0.05, CEIL, HZ0, 'trim');
  B.int.box(HX0 - 0.05, CEIL - 0.015, HZ1, HX1 + 0.05, CEIL, HZ1 + 0.05, 'trim');

  // ── Foundation ───────────────────────────────────────────────────────────────
  const fvN = [2.5, 6.0, 12.5], fvS = [2.0, 4.9, 9.4, 12.9];
  const fvOps = (xs) => xs.map((x) => ({ a0: x - 0.2, a1: x + 0.2, y0: -0.62, y1: -0.42 }));
  wall(B.shell, 'x', MAIN.x0, 15.2, MAIN.z0, 0, CRAWL_FLOOR, SILL, [OPEN.crawlDoor, ...fvOps(fvN)], 'parge', 'block', { level: false, jamb: 'block', top: 'block' });
  wall(B.shell, 'x', MAIN.x0, 15.2, 10, MAIN.z1, CRAWL_FLOOR, SILL, fvOps(fvS), 'block', 'parge', { level: false, jamb: 'block', top: 'block' });
  wall(B.shell, 'z', 0, 10, MAIN.x0, 0, CRAWL_FLOOR, SILL, [], 'parge', 'block', { level: false, jamb: 'block', top: 'block' });
  wall(B.shell, 'z', 0, 4.5, 15.0, 15.2, CRAWL_FLOOR, SILL, [], 'block', 'parge', { level: false, jamb: 'block', top: 'block' });
  wall(B.shell, 'z', 7.5, 10, 15.0, 15.2, CRAWL_FLOOR, SILL, [], 'block', 'parge', { level: false, jamb: 'block', top: 'block' });
  // garage stem walls (visible above grade)
  B.shell.box(15.2, -0.95, GAR.z0, GAR.x1, GARAGE_FLOOR - 0.001, 0, { nz: 'parge', def: null });
  B.shell.box(21.5, -0.95, GAR.z0, GAR.x1, GARAGE_FLOOR - 0.001, GAR.z1, { px: 'parge', def: null });
  B.shell.box(15.2, -0.95, 10, 16.03, GARAGE_FLOOR - 0.001, GAR.z1, { pz: 'parge', def: null });
  B.shell.box(20.63, -0.95, 10, GAR.x1, GARAGE_FLOOR - 0.001, GAR.z1, { pz: 'parge', def: null });
  // foundation vents: grille outside, daylight inside
  for (const x of fvN) { B.ext.box(x - 0.2, -0.62, MAIN.z0 - 0.006, x + 0.2, -0.42, MAIN.z0, { nz: 'fvent', def: null }); B.crawl.box(x - 0.2, -0.62, MAIN.z0, x + 0.2, -0.42, MAIN.z0 + 0.004, { pz: 'daylightDim', def: null }, false); }
  for (const x of fvS) { B.ext.box(x - 0.2, -0.62, MAIN.z1, x + 0.2, -0.42, MAIN.z1 + 0.006, { pz: 'fvent', def: null }); B.crawl.box(x - 0.2, -0.62, MAIN.z1 - 0.004, x + 0.2, -0.42, MAIN.z1, { nz: 'daylightDim', def: null }, false); }

  // ── Roofs ────────────────────────────────────────────────────────────────────
  const zE0 = MAIN.z0 - OVH, zE1 = MAIN.z1 + OVH;
  function slab(xa, xb, z0, z1, top, topMat) {
    // plane from z0 to z1 (both edges along X), top surface y = top(z); bottom = top − ROOF_T
    const t0 = top(z0), t1 = top(z1);
    const up = new THREE.Vector3(0, 1, 0);
    B.roof.quad(topMat, [xa, t0, z0], [xb, t0, z0], [xb, t1, z1], [xa, t1, z1], up, true, [1, 0, 0]);
    B.roof.quad('osb', [xa, t0 - ROOF_T, z0], [xb, t0 - ROOF_T, z0], [xb, t1 - ROOF_T, z1], [xa, t1 - ROOF_T, z1], up.clone().negate(), true, [1, 0, 0]);
    B.roof.quad('trim', [xa, t0, z0], [xa, t1, z1], [xa, t1 - ROOF_T, z1], [xa, t0 - ROOF_T, z0], new THREE.Vector3(-1, 0, 0));
    B.roof.quad('trim', [xb, t0, z0], [xb, t1, z1], [xb, t1 - ROOF_T, z1], [xb, t0 - ROOF_T, z0], new THREE.Vector3(1, 0, 0));
  }
  slab(MAIN.rakeW, MAIN.rakeE, 5, zE1, mainTop, 'shingle');
  slab(MAIN.rakeW, MAIN.rakeE, 5, zE0, mainTop, 'shingle');
  slab(CHIMNEY.x0 - 0.15, MAIN.rakeW + 0.01, CHIMNEY.z0 - 0.2, CHIMNEY.z1 + 0.2, mainTop, 'shingle');
  slab(GAR.x0, GAR.rakeE, 5, zE1, garTop, 'shingleG');
  slab(GAR.x0, GAR.rakeE, 5, zE0, garTop, 'shingleG');
  // porch cross gable (two planes, each a trapezoid meeting the main roof along the valleys)
  {
    const zf = PORCH.zFront + 0.15, xw = PORCH.x0 - PORCH.ovh, xe = PORCH.x1 + PORCH.ovh, xc = PORCH.xc;
    const yr = porchTop(xc), ye = porchTop(xw);
    const zv = 10.2 - (yr - ROOF_T - HEEL) / 0.5;       // ridge meets main roof
    const zd = 10.2 + (HEEL - (ye - ROOF_T)) / 0.5;     // eave meets main roof
    const up = new THREE.Vector3(0, 1, 0);
    for (const [xo, sgn] of [[xw, -1], [xe, 1]]) {
      B.roof.quad('shingle', [xo, ye, zf], [xc, yr, zf], [xc, yr, zv], [xo, ye, zd], up, true, [0, 0, -1]);
      B.roof.quad('soffit', [xo, ye - ROOF_T, zf], [xc, yr - ROOF_T, zf], [xc, yr - ROOF_T, zv], [xo, ye - ROOF_T, zd], up.clone().negate(), true, [0, 0, -1]);
      B.roof.quad('trim', [xo, ye, zf], [xc, yr, zf], [xc, yr - ROOF_T, zf], [xo, ye - ROOF_T, zf], new THREE.Vector3(0, 0, 1));
      B.roof.quad('trim', [xo, ye, zf], [xo, ye, zd], [xo, ye - ROOF_T, zd], [xo, ye - ROOF_T, zf], new THREE.Vector3(sgn, 0, 0));
      B.roof.member('gutter', [xo + sgn * 0.06, ye - 0.08, zf], [xo + sgn * 0.06, ye - 0.08, zd + 0.05], 0.11, 0.1);
    }
    B.roof.member('ridgecap', [xc, yr + 0.02, zv], [xc, yr + 0.02, zf], 0.22, 0.05);
    // gable face + trim
    B.ext.prism('z', 12.0, 12.04, [[PORCH.x0, HEEL - 0.1], [PORCH.x1, HEEL - 0.1], [xc, porchUnder(xc) - 0.02]], null, 'siding', 'trim');
    B.ext.member('trim', [PORCH.x0 - 0.1, HEEL - 0.15, 12.06], [PORCH.x1 + 0.1, HEEL - 0.15, 12.06], 0.06, 0.18);
    // posts, beams, porch ceiling
    for (const px of [5.15, 8.85]) {
      const g = gradeAt(px, 11.85);
      B.ext.box(px - 0.075, g, 11.775, px + 0.075, HEEL - 0.1, 11.925, 'trim');
      B.ext.box(px - 0.12, g - 0.05, 11.73, px + 0.12, g + 0.12, 11.97, 'concrete');
      aabb('ground', px - 0.08, px + 0.08, 11.77, 11.93);
      B.ext.box(px - 0.06, HEEL - 0.3, 10.2, px + 0.06, HEEL - 0.06, 11.9, 'trim');
    }
    B.ext.box(PORCH.x0 - 0.05, HEEL - 0.3, 11.8, PORCH.x1 + 0.05, HEEL - 0.06, 11.95, 'trim');
    B.ext.box(PORCH.x0, 2.58, 10.2, PORCH.x1, 2.6, 11.95, { ny: 'soffit', def: null });
    // porch lantern + house number
    B.ext.box(6.18, 1.62, 10.2, 6.32, 1.9, 10.32, 'black');
    B.ext.box(6.2, 1.66, 10.22, 6.3, 1.86, 10.31, 'bulb');
    B.ext.box(7.62, 1.8, 10.2, 7.98, 1.93, 10.215, { pz: 'number', def: 'black' });
  }
  // ridge caps
  B.roof.box(MAIN.rakeW, mainTop(5) - 0.03, 4.86, 9.5, mainTop(5) + 0.04, 5.14, 'ridgecap');
  B.roof.box(12.5, mainTop(5) - 0.03, 4.86, MAIN.rakeE, mainTop(5) + 0.04, 5.14, 'ridgecap');
  B.roof.box(GAR.x0, garTop(5) - 0.03, 4.88, GAR.rakeE, garTop(5) + 0.04, 5.12, 'ridgecap');
  // fascia, soffit, gutters
  const fasciaRun = (x0, x1, under, z, dir, gutter = true) => {
    const yb = under - 0.16, yt = under + ROOF_T;
    B.roof.box(x0, yb, z - (dir > 0 ? 0.035 : 0), x1, yt, z + (dir < 0 ? 0.035 : 0), 'trim');
    const zw = dir > 0 ? MAIN.z1 : MAIN.z0;
    B.roof.box(x0, yb, Math.min(zw, z), x1, yb + 0.012, Math.max(zw, z), { ny: 'soffit', py: null, def: 'trim' });
    if (gutter) {
      const zg0 = z + dir * 0.035, zg1 = zg0 + dir * 0.13;
      B.roof.box(x0 + 0.02, yb + 0.04, Math.min(zg0, zg1), x1 - 0.02, yb + 0.17, Math.max(zg0, zg1), { py: 'darkmetal', def: 'gutter' });
    }
  };
  fasciaRun(MAIN.rakeW, PORCH.x0 - PORCH.ovh, mainUnder(zE1), zE1, 1, false);
  fasciaRun(PORCH.x1 + PORCH.ovh, MAIN.rakeE, mainUnder(zE1), zE1, 1);
  fasciaRun(MAIN.rakeW, MAIN.rakeE, mainUnder(zE0), zE0, -1);
  fasciaRun(GAR.x0, GAR.rakeE, garUnder(zE1), zE1, 1);
  fasciaRun(GAR.x0, GAR.rakeE, garUnder(zE0), zE0, -1);
  // rake boards (gable edges)
  const rake = (x, under) => {
    B.roof.member('trim', [x, under(zE0) - 0.1, zE0], [x, under(5) - 0.1 + ROOF_T, 5], 0.03, 0.2, [0, 1, 0]);
    B.roof.member('trim', [x, under(5) - 0.1 + ROOF_T, 5], [x, under(zE1) - 0.1, zE1], 0.03, 0.2, [0, 1, 0]);
  };
  rake(MAIN.rakeW - 0.015, mainUnder); rake(GAR.rakeE + 0.015, garUnder);
  // gable walls
  const gablePts = (under) => [[MAIN.z0, PLATE], [MAIN.z1, PLATE], [MAIN.z1, HEEL], [5, under(5) - 0.005], [MAIN.z0, HEEL]];
  B.roof.prism('x', MAIN.x0, 0, gablePts(mainUnder), 'siding', 'osb', 'lumber');
  B.roof.prism('x', 15.0, 15.15, gablePts(mainUnder), 'osb', 'siding', 'lumber');
  B.roof.prism('x', 21.5, GAR.x1, gablePts(garUnder), 'osb', 'siding', 'lumber');
  // gable vents (louver outside, daylight inside the attic)
  B.roof.box(MAIN.x0 - 0.01, 4.05, 4.6, MAIN.x0, 4.65, 5.4, { nx: 'louver', def: null });
  B.att.box(0, 4.05, 4.6, 0.004, 4.65, 5.4, { px: 'daylight', def: null }, false);
  B.roof.box(15.15, 4.62, 4.65, 15.16, 5.02, 5.35, { px: 'louver', def: null });
  B.att.box(14.996, 4.62, 4.65, 15.0, 5.02, 5.35, { nx: 'daylight', def: null }, false);
  B.roof.box(GAR.x1, 3.7, 4.65, GAR.x1 + 0.01, 4.2, 5.35, { px: 'louver', def: null });

  // corner boards
  const corner = (x0, x1, z0, z1, y0) => B.ext.box(x0, y0, z0, x1, PLATE + 0.05, z1, 'trim');
  corner(MAIN.x0 - 0.025, MAIN.x0 + 0.1, MAIN.z1 - 0.1, MAIN.z1 + 0.025, SILL);
  corner(MAIN.x0 - 0.025, MAIN.x0 + 0.1, MAIN.z0 - 0.025, MAIN.z0 + 0.1, SILL);
  corner(GAR.x1 - 0.1, GAR.x1 + 0.025, GAR.z1 - 0.1, GAR.z1 + 0.025, GARAGE_FLOOR);
  corner(GAR.x1 - 0.1, GAR.x1 + 0.025, GAR.z0 - 0.025, GAR.z0 + 0.1, GARAGE_FLOOR);
  // exterior window trim + shutters (south) and trim (north)
  const extTrimS = (o, shutters) => {
    const z = MAIN.z1;
    B.ext.box(o.a0 - 0.09, o.y0 - 0.05, z, o.a0, o.y1 + 0.09, z + 0.025, 'trim');
    B.ext.box(o.a1, o.y0 - 0.05, z, o.a1 + 0.09, o.y1 + 0.09, z + 0.025, 'trim');
    B.ext.box(o.a0 - 0.12, o.y1, z, o.a1 + 0.12, o.y1 + 0.11, z + 0.035, 'trim');
    B.ext.box(o.a0 - 0.08, o.y0 - 0.06, z, o.a1 + 0.08, o.y0, z + 0.06, 'trim');
    if (shutters) {
      const sw = Math.min(0.42, (o.a1 - o.a0) * 0.45);
      B.ext.box(o.a0 - 0.11 - sw, o.y0 - 0.02, z, o.a0 - 0.11, o.y1 + 0.06, z + 0.03, 'shutter');
      B.ext.box(o.a1 + 0.11, o.y0 - 0.02, z, o.a1 + 0.11 + sw, o.y1 + 0.06, z + 0.03, 'shutter');
    }
  };
  extTrimS(priWindow2, true); extTrimS(priWindow, true);
  // living window: component carries the trim; we add shutters only
  B.ext.box(2.25, 0.72, MAIN.z1, 2.64, 2.12, MAIN.z1 + 0.03, 'shutter');
  B.ext.box(4.36, 0.72, MAIN.z1, 4.75, 2.12, MAIN.z1 + 0.03, 'shutter');
  const extTrimN = (o) => {
    const z = MAIN.z0;
    B.ext.box(o.a0 - 0.09, o.y0 - 0.05, z - 0.025, o.a0, o.y1 + 0.09, z, 'trim');
    B.ext.box(o.a1, o.y0 - 0.05, z - 0.025, o.a1 + 0.09, o.y1 + 0.09, z, 'trim');
    B.ext.box(o.a0 - 0.12, o.y1, z - 0.035, o.a1 + 0.12, o.y1 + 0.11, z, 'trim');
    B.ext.box(o.a0 - 0.08, o.y0 - 0.06, z - 0.06, o.a1 + 0.08, o.y0, z, 'trim');
  };
  extTrimN(kitWindow); extTrimN(bathWindow); extTrimN(bed2Window);
  // front door: open slab (red six-panel), threshold, exterior casing
  door(B.int, 'doorRed', frontDoor.a0 + 0.02, 10.0, 'x', -1, 0.88);
  B.ext.box(frontDoor.a0 - 0.1, 0, MAIN.z1, frontDoor.a0, 2.15, MAIN.z1 + 0.03, 'trim');
  B.ext.box(frontDoor.a1, 0, MAIN.z1, frontDoor.a1 + 0.1, 2.15, MAIN.z1 + 0.03, 'trim');
  B.ext.box(frontDoor.a0 - 0.12, 2.05, MAIN.z1, frontDoor.a1 + 0.12, 2.18, MAIN.z1 + 0.04, 'trim');
  B.int.box(frontDoor.a0, -0.005, 9.98, frontDoor.a1, 0.012, MAIN.z1 + 0.02, 'woodLight');
  // interior doors (open, swung against a wall)
  door(B.int, 'door', 7.02, 4.44, 'x', -1, 0.78);       // laundry
  door(B.int, 'door', 8.82, 4.44, 'x', -1, 0.73);       // bath
  door(B.int, 'door', 8.62, 5.76, 'x', 1, 0.78);        // primary
  door(B.int, 'door', garSideDoor.a1 - 0.04, 0.0, 'x', 1, 0.86, GARAGE_FLOOR + 0.02); // garage side door
  // back door: exterior face of the kitchen door (closed) + portal
  {
    const [x0, x1] = OPEN.backDoorX;
    B.ext.box(x0 - 0.1, 0, MAIN.z0 - 0.03, x0, 2.15, MAIN.z0, 'trim');
    B.ext.box(x1, 0, MAIN.z0 - 0.03, x1 + 0.1, 2.15, MAIN.z0, 'trim');
    B.ext.box(x0 - 0.12, 2.05, MAIN.z0 - 0.04, x1 + 0.12, 2.18, MAIN.z0, 'trim');
    B.ext.box(x1 + 0.18, 1.62, MAIN.z0 - 0.12, x1 + 0.32, 1.9, MAIN.z0, 'black');
    B.ext.box(x1 + 0.2, 1.66, MAIN.z0 - 0.11, x1 + 0.3, 1.86, MAIN.z0 - 0.02, 'bulb');
    portals.push(portalBox((x0 + x1) / 2, 1.02, MAIN.z0 - 0.05, x1 - x0, 2.05, 0.1, 'deck>kitchen', 'Back door (into the kitchen)'));
  }
  // overhead door exterior casing + coach lights
  B.ext.box(overhead.a0 - 0.12, GARAGE_FLOOR, GAR.z1, overhead.a0, 2.12, GAR.z1 + 0.03, 'trim');
  B.ext.box(overhead.a1, GARAGE_FLOOR, GAR.z1, overhead.a1 + 0.12, 2.12, GAR.z1 + 0.03, 'trim');
  B.ext.box(overhead.a0 - 0.12, 2.0, GAR.z1, overhead.a1 + 0.12, 2.12, GAR.z1 + 0.04, 'trim');
  for (const x of [overhead.a0 - 0.45, overhead.a1 + 0.45]) {
    B.ext.box(x - 0.08, 1.55, GAR.z1, x + 0.08, 1.85, GAR.z1 + 0.13, 'black');
    B.ext.box(x - 0.06, 1.58, GAR.z1 + 0.02, x + 0.06, 1.82, GAR.z1 + 0.12, 'bulb');
  }
  aabb('ground', overhead.a0, overhead.a1, 10.0, GAR.z1); // overhead door is closed

  // ── Chimney (exterior masonry, west wall) ─────────────────────────────────
  {
    const { x0, x1, z0, z1 } = CHIMNEY;
    B.ext.box(x0, CRAWL_FLOOR, z0 - 0.3, x1, 1.45, z1 + 0.3, { px: null, def: 'brick' });
    B.ext.prism('x', x0, x1, [[z0 - 0.3, 1.45], [z1 + 0.3, 1.45], [z1, 1.95], [z0, 1.95]], 'brick', null, 'brick');
    B.ext.prism('x', x0, x1, [[z0, 1.9], [z1, 1.9], [z1, mainTop(z1) - 0.01], [z0, mainTop(z0) - 0.01]], 'brick', null, 'brick');
    aabb('ground', x0, x1, z0 - 0.3, z1 + 0.3);
    aabb('roof', x0 - 0.05, x1 + 0.05, z0 - 0.05, z1 + 0.05);
  }

  // ── Service drop (utility pole + overhead conductors) ───────────────────────
  {
    const px = 26.2, pz = 21.2, g = gradeAt(px, pz);
    const pole = new THREE.CylinderGeometry(0.13, 0.17, 9.5, 10);
    B.ext.geometry('pineBark', pole, new THREE.Matrix4().makeTranslation(px, g + 4.75, pz)); pole.dispose();
    B.ext.box(px - 0.9, g + 8.6, pz - 0.06, px + 0.9, g + 8.72, pz + 0.06, 'woodDark');
    aabb('ground', px - 0.2, px + 0.2, pz - 0.2, pz + 0.2);
    const a = new THREE.Vector3(px - 0.3, g + 8.4, pz), b = new THREE.Vector3(GAR.x1 + 0.3, 2.55, 2.5);
    const pts = [];
    for (let i = 0; i <= 12; i++) {
      const t = i / 12, p = a.clone().lerp(b, t);
      p.y -= Math.sin(Math.PI * t) * 1.9; pts.push(p);
    }
    for (const off of [0, 0.06, -0.06]) {
      const curve = new THREE.CatmullRomCurve3(pts.map((p) => p.clone().add(new THREE.Vector3(off, off * 0.5, 0))));
      const tg = new THREE.TubeGeometry(curve, 40, 0.011, 5, false);
      B.ext.geometry('black', tg, null, false); tg.dispose();
    }
  }

  // ── Deck (north of kitchen) ───────────────────────────────────────────────
  {
    const x0 = 0.5, x1 = 5.5, z0 = -3.6, z1 = MAIN.z0;
    // decking sits 3 mm low so the deck-framing / deck-guard models' own boards win where they overlap
    B.ext.box(x0, DECK_TOP - 0.03, z0, x1, DECK_TOP - 0.003, z1, { py: 'deck', def: 'woodMed' });
    B.ext.box(x0, -0.33, z0, x1, DECK_TOP - 0.03, z0 + 0.05, 'woodMed');
    B.ext.box(x0, -0.33, z0, x0 + 0.05, DECK_TOP - 0.03, z1, 'woodMed');
    B.ext.box(x1 - 0.05, -0.33, z0, x1, DECK_TOP - 0.03, z1, 'woodMed');
    // joists on the same 16 in grid as the ledger/framing models (x = 3 ± 0.406k), 2x8 depth
    for (const jx of [0.97, 1.376, 1.782, 4.218, 4.624, 5.03]) B.ext.box(jx - 0.019, DECK_TOP - 0.025 - 0.184, z0 + 0.05, jx + 0.019, DECK_TOP - 0.03, z1, 'woodMed');
    // doubled 2x10 beam at the height the deck-posts model carries it (post top 0.62 + 9.25 in)
    const gp = gradeAt(5.3, -3.45), bTop = gp + 0.62 + 0.235, bBot = gp + 0.62;
    B.ext.box(x0, bBot, -3.488, x1, bTop, -3.412, 'woodMed');
    for (const px of [0.65, 1.85]) B.ext.box(px - 0.07, gradeAt(px, -3.45) - 0.05, -3.52, px + 0.07, bBot, -3.38, 'woodMed'); // kept clear of the x≈3 sightline to the ledger
    // guards: west + east sides, north stubs
    const guard = (ax, a0, a1, c, axis) => {
      for (let a = a0 + 0.06; a < a1 - 0.03; a += 0.13) {
        if (axis === 'z') B.ext.box(c - 0.02, DECK_TOP, a - 0.02, c + 0.02, DECK_TOP + 0.9, a + 0.02, 'woodMed');
        else B.ext.box(a - 0.02, DECK_TOP, c - 0.02, a + 0.02, DECK_TOP + 0.9, c + 0.02, 'woodMed');
      }
      if (axis === 'z') { B.ext.box(c - 0.07, DECK_TOP + 0.9, a0, c + 0.07, DECK_TOP + 0.94, a1, 'woodMed'); B.ext.box(c - 0.03, DECK_TOP + 0.05, a0, c + 0.03, DECK_TOP + 0.12, a1, 'woodMed'); }
      else { B.ext.box(a0, DECK_TOP + 0.9, c - 0.07, a1, DECK_TOP + 0.94, c + 0.07, 'woodMed'); B.ext.box(a0, DECK_TOP + 0.05, c - 0.03, a1, DECK_TOP + 0.12, c + 0.03, 'woodMed'); }
    };
    guard(null, z0, z1, x0 + 0.04, 'z'); guard(null, z0, z1, x1 - 0.04, 'z');
    guard(null, 3.7, 4.08, z0 + 0.04, 'x'); guard(null, 5.12, x1, z0 + 0.04, 'x');
    for (const [px, pz] of [[x0 + 0.04, z0 + 0.04], [x1 - 0.04, z0 + 0.04], [4.08, z0 + 0.04], [5.12, z0 + 0.04], [x0 + 0.04, z1 - 0.05], [x1 - 0.04, z1 - 0.05]])
      B.ext.box(px - 0.05, DECK_TOP, pz - 0.05, px + 0.05, DECK_TOP + 1.0, pz + 0.05, 'woodMed');
    // collision: the deck reads as a raised platform from the yard and is railed from above
    aabb('ground', x0, x0 + 0.1, z0, z1); aabb('ground', x1 - 0.1, x1, z0, z1);
    aabb('ground', x0, 4.1, z0, z0 + 0.1); aabb('ground', 5.1, x1, z0, z0 + 0.1);
    aabb('ground', 4.0, 4.1, -4.9, z0); aabb('ground', 5.1, 5.2, -4.9, z0);
    // concrete landing pad: the yard falls away under the deck (>0.76 m drop at the outer edge),
    // so the 0.8 m stair unit lands on a pad that adds the final riser to grade.
    B.ext.box(4.05, gradeAt(4.6, -5.3) - 0.12, -5.3, 5.15, STAIR_BASE, -4.25, 'concrete');
    // deck furniture: grill, two chairs, table
    furnBox(B.ext, 0.85, 1.35, DECK_TOP, 0.8, -1.4, -0.85, 'black', 'ground');
    B.ext.box(0.9, 0.8, -1.38, 1.3, 1.02, -0.87, 'darkmetal');
    chair(B.ext, 3.3, -2.0, 0, 'woodLight', DECK_TOP); chair(B.ext, 3.3, -2.9, Math.PI, 'woodLight', DECK_TOP);
    furnBox(B.ext, 2.9, 3.7, DECK_TOP + 0.66, DECK_TOP + 0.7, -2.75, -2.15, 'woodLight', 'ground');
    for (const [lx, lz] of [[2.95, -2.7], [3.65, -2.7], [2.95, -2.2], [3.65, -2.2]]) B.ext.box(lx - 0.02, DECK_TOP, lz - 0.02, lx + 0.02, DECK_TOP + 0.66, lz + 0.02, 'woodLight');
  }

  // ── Front walk, driveway apron, sidewalk, street, garage stoop ───────────────
  {
    const g1 = gradeAt(7, 12.7);
    B.ext.prism('x', 6.4, 7.6, [[11.8, -1.15], [20.4, -1.15], [20.4, gradeAt(7, 20.4) + 0.04], [12.7, g1 + 0.04], [11.8, GRADE + 0.04]], 'concrete', 'concrete', 'concrete');
    B.ext.prism('x', DRIVE.x0, DRIVE.x1, [[DRIVE.z1, -1.15], [21.8, -1.15], [21.8, -0.86], [DRIVE.z1, DRIVE_END + 0.1]], 'concrete', 'concrete', 'concrete');
    B.ext.box(-45, -1.1, 20.4, 55, -0.86, 21.8, 'concrete');
    B.ext.box(-45, -1.1, 21.8, 55, -0.84, 22.0, 'concrete');
    B.ext.box(-45, -1.2, 22.0, 55, -0.94, 30, { py: 'asphalt', def: null }, false);
    B.ext.box(-45, -1.1, 30, 55, -0.86, 31.6, 'concrete');
    // stoop at the garage side door
    B.ext.box(18.5, GRADE - 0.2, -0.5, 19.6, GARAGE_FLOOR, MAIN.z0, 'concrete');
    B.ext.box(18.5, GRADE - 0.2, -0.8, 19.6, -0.35, -0.5, 'concrete');
    B.ext.box(18.5, GRADE - 0.2, -1.1, 19.6, -0.55, -0.8, 'concrete');
    // mailbox
    B.ext.box(5.16, gradeAt(5.2, 20.2), 20.16, 5.24, gradeAt(5.2, 20.2) + 1.05, 20.24, 'woodDark');
    B.ext.box(5.05, gradeAt(5.2, 20.2) + 1.05, 19.95, 5.35, gradeAt(5.2, 20.2) + 1.27, 20.45, 'black');
    aabb('ground', 5.1, 5.3, 20.1, 20.3);
    // mulch bed + foundation shrubs in front of the primary bedroom
    B.ext.box(8.3, GRADE - 0.05, MAIN.z1, 13.55, GRADE + 0.02, 11.3, { py: 'mulch', def: null }, false);
  }

  // ── Terrain (with a hole over the crawlspace footprint) ───────────────────
  B.terrain = terrain();

  // ── Trees, shrubs, fence, horizon ─────────────────────────────────────────
  const trees = [
    ['pine', -9.6, -8.6, 1.0], ['pine', -9.2, 3.5, 1.1], ['pine', 25.5, -7.5, 1.05], ['pine', 26.3, 6.5, 0.95],
    ['pine', 10.5, -8.8, 1.15], ['pine', -6.5, 17.5, 1.0], ['pine', 31, 18, 1.1],
    ['oak', 2.0, 16.8, 1.0], ['oak', 18.5, -7.8, 0.9], ['dogwood', 12.8, 15.2, 1.0], ['dogwood', -3.2, -2.8, 0.8],
  ];
  for (const [kind, x, z, s] of trees) tree(B.ext, kind, x, z, s, aabb);
  for (const [x, z, s] of [[8.75, 10.75, 1], [9.85, 10.8, 0.9], [10.95, 10.7, 1.05], [12.05, 10.8, 0.95], [13.2, 10.75, 0.9],
    [21.0, 10.95, 0.8], [15.6, 10.9, 0.8], [-0.6, 9.6, 1.1], [-0.6, 3.0, 0.9], [22.3, 1.0, 0.9], [-0.7, -0.9, 1.0]]) shrub(B.ext, x, z, s);
  fence(B.ext, aabb);
  for (let i = 0; i < 44; i++) {
    const a = (i / 44) * Math.PI * 2, r = rr(60, 80);
    const x = 8 + Math.cos(a) * r, z = 6 + Math.sin(a) * r * 0.9;
    const h = rr(10, 18);
    const cone = new THREE.ConeGeometry(rr(3, 5), h, 7);
    B.ext.geometry(rnd() < 0.5 ? 'needle' : 'leafDark', cone, new THREE.Matrix4().makeTranslation(x, -1 + h / 2 + 2, z), false); cone.dispose();
    const tr = new THREE.CylinderGeometry(0.4, 0.5, 3, 6);
    B.ext.geometry('pineBark', tr, new THREE.Matrix4().makeTranslation(x, 0.5, z), false); tr.dispose();
  }

  // ── Interior furnishing ────────────────────────────────────────────────────
  furnish(B.int, aabb, fixtures);

  // ── Attic ────────────────────────────────────────────────────────────────
  attic(B.att, HX0, HX1, HZ0, HZ1, portals);

  // ── Crawlspace ─────────────────────────────────────────────────────────────
  crawl(B.crawl, portals);

  // roof-level portal: ladder top at the front eave
  portals.push(portalBox(14.0, mainTop(10.6) + 0.35, 10.75, 0.8, 0.9, 0.5, 'roof>exterior', 'Ladder (climb down)'));

  const groups = {
    exterior: B.ext.build(), shell: B.shell.build(), roof: B.roof.build(), interior: B.int.build(),
    attic: B.att.build(), crawl: B.crawl.build(), glass: B.glass.build(),
  };
  groups.exterior.add(B.terrain);
  groups.glass.traverse((o) => { if (o.isMesh) { o.renderOrder = 2; o.castShadow = false; } });
  return { groups, colliders: col, occluders, portals, fixtures };
}

// ── helpers ───────────────────────────────────────────────────────────────────
function portalBox(x, y, z, w, h, d, to, name) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshBasicMaterial({ visible: false }));
  m.position.set(x, y, z); m.updateMatrix(); m.matrixAutoUpdate = false; m.updateMatrixWorld(true);
  m.userData.portal = { to, name };
  return m;
}

/** Door slab hinged at (hx, hz) on a wall running along X; swings into dir (±Z) lying along Z. */
function door(b, mat, hx, hz, _axis, dir, width, y0 = 0) {
  const g = new THREE.BoxGeometry(0.04, 2.02, width);
  // map the panel texture onto the broad faces only (BoxGeometry face order: px, nx, py, ny, pz, nz)
  b.geometry(mat, g, new THREE.Matrix4().makeTranslation(hx + 0.02, y0 + 1.01, hz + dir * (width / 2 + 0.005)));
  g.dispose();
  b.box(hx + 0.04, y0 + 0.95, hz + dir * (width - 0.09) - 0.02, hx + 0.08, y0 + 1.0, hz + dir * (width - 0.09) + 0.02, 'metal');
}

function furnBox(b, x0, x1, y0, y1, z0, z1, mat, level, aabb) {
  b.box(x0, y0, z0, x1, y1, z1, mat);
  if (aabb && level) aabb(level, x0, x1, z0, z1);
}
function chair(b, x, z, rot, mat, y0 = 0) {
  const s = Math.sin(rot), c = Math.cos(rot);
  const P = (dx, dz) => [x + dx * c + dz * s, z - dx * s + dz * c];
  const seat = new THREE.BoxGeometry(0.42, 0.04, 0.42);
  b.geometry(mat, seat, new THREE.Matrix4().makeRotationY(rot).setPosition(x, y0 + 0.45, z)); seat.dispose();
  const back = new THREE.BoxGeometry(0.42, 0.45, 0.04);
  const [bx, bz] = P(0, -0.2);
  b.geometry(mat, back, new THREE.Matrix4().makeRotationY(rot).setPosition(bx, y0 + 0.7, bz)); back.dispose();
  for (const [dx, dz] of [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]]) {
    const [lx, lz] = P(dx, dz);
    b.box(lx - 0.02, y0, lz - 0.02, lx + 0.02, y0 + 0.45, lz + 0.02, mat);
  }
}

function jitter(geo, amt) {
  const p = geo.attributes.position;
  const key = (x, y, z) => `${x.toFixed(3)},${y.toFixed(3)},${z.toFixed(3)}`;
  const offs = new Map();
  for (let i = 0; i < p.count; i++) {
    const k = key(p.getX(i), p.getY(i), p.getZ(i));
    if (!offs.has(k)) offs.set(k, [rr(-amt, amt), rr(-amt, amt), rr(-amt, amt)]);
    const o = offs.get(k);
    p.setXYZ(i, p.getX(i) + o[0], p.getY(i) + o[1], p.getZ(i) + o[2]);
  }
  geo.computeVertexNormals();
  return geo;
}

function tree(b, kind, x, z, s, aabb) {
  const g = gradeAt(x, z);
  const M = (px, py, pz, sx = 1, sy = 1, sz = 1) => new THREE.Matrix4().compose(new THREE.Vector3(px, py, pz), new THREE.Quaternion(), new THREE.Vector3(sx, sy, sz));
  if (kind === 'pine') {
    const h = 11 * s;
    const trunk = new THREE.CylinderGeometry(0.12 * s, 0.24 * s, h, 8);
    b.geometry('pineBark', trunk, M(x, g + h / 2, z)); trunk.dispose();
    for (let i = 0; i < 6; i++) {
      const r = rr(1.1, 1.9) * s, y = g + h - rr(0, 3.2) * s;
      const blob = jitter(new THREE.IcosahedronGeometry(r, 1), r * 0.18);
      b.geometry(i % 2 ? 'needle' : 'leafDark', blob, M(x + rr(-1.1, 1.1) * s, y, z + rr(-1.1, 1.1) * s, 1, 0.62, 1)); blob.dispose();
    }
    aabb('ground', x - 0.28, x + 0.28, z - 0.28, z + 0.28);
  } else if (kind === 'oak') {
    const h = 3.6 * s;
    const trunk = new THREE.CylinderGeometry(0.22 * s, 0.34 * s, h, 8);
    b.geometry('bark', trunk, M(x, g + h / 2, z)); trunk.dispose();
    for (let i = 0; i < 7; i++) {
      const r = rr(1.6, 2.5) * s;
      const blob = jitter(new THREE.IcosahedronGeometry(r, 1), r * 0.16);
      b.geometry(i % 3 ? 'leaf' : 'leafDark', blob, M(x + rr(-2, 2) * s, g + h + rr(0.6, 2.8) * s, z + rr(-2, 2) * s, 1, 0.75, 1)); blob.dispose();
    }
    aabb('ground', x - 0.36, x + 0.36, z - 0.36, z + 0.36);
  } else {
    const h = 1.8 * s;
    const trunk = new THREE.CylinderGeometry(0.08, 0.12, h, 6);
    b.geometry('bark', trunk, M(x, g + h / 2, z)); trunk.dispose();
    for (let i = 0; i < 5; i++) {
      const r = rr(0.8, 1.2) * s;
      const blob = jitter(new THREE.IcosahedronGeometry(r, 1), r * 0.2);
      b.geometry('azalea', blob, M(x + rr(-1, 1) * s, g + h + rr(0.2, 1.2) * s, z + rr(-1, 1) * s, 1, 0.55, 1)); blob.dispose();
    }
    aabb('ground', x - 0.15, x + 0.15, z - 0.15, z + 0.15);
  }
}
function shrub(b, x, z, s) {
  const g = gradeAt(x, z);
  const blob = jitter(new THREE.IcosahedronGeometry(0.48 * s, 1), 0.08);
  b.geometry(rnd() < 0.5 ? 'shrub' : 'azalea', blob, new THREE.Matrix4().compose(new THREE.Vector3(x, g + 0.36 * s, z), new THREE.Quaternion(), new THREE.Vector3(1.15, 0.85, 1)));
  blob.dispose();
}
function fence(b, aabb) {
  const run = (x0, z0, x1, z1) => {
    const len = Math.hypot(x1 - x0, z1 - z0), n = Math.ceil(len / 2.4);
    for (let i = 0; i < n; i++) {
      const t0 = i / n, t1 = (i + 1) / n;
      const ax = x0 + (x1 - x0) * t0, az = z0 + (z1 - z0) * t0, bx = x0 + (x1 - x0) * t1, bz = z0 + (z1 - z0) * t1;
      const g = Math.min(gradeAt(ax, az), gradeAt(bx, bz));
      if (Math.abs(x1 - x0) > Math.abs(z1 - z0)) b.box(ax, g - 0.05, az - 0.02, bx, g + 1.8, az + 0.02, 'fence');
      else b.box(ax - 0.02, g - 0.05, az, ax + 0.02, g + 1.8, bz, 'fence');
      b.box(ax - 0.05, g - 0.1, az - 0.05, ax + 0.05, g + 1.9, az + 0.05, 'woodMed');
    }
    aabb('ground', Math.min(x0, x1) - 0.05, Math.max(x0, x1) + 0.05, Math.min(z0, z1) - 0.05, Math.max(z0, z1) + 0.05);
  };
  run(-11.6, -11.6, 28.6, -11.6); run(-11.6, -11.6, -11.6, 12.5); run(28.6, -11.6, 28.6, 12.5);
}

function terrain() {
  const xs = [], zs = [];
  for (let x = -45; x <= 55; x += 1) xs.push(x);
  for (let z = -40; z <= 40; z += 1) zs.push(z);
  for (const v of [MAIN.x0, MAIN.x1]) xs.push(v);
  for (const v of [MAIN.z0, MAIN.z1]) zs.push(v);
  xs.sort((a, b) => a - b); zs.sort((a, b) => a - b);
  const nx = xs.length, nz = zs.length;
  const pos = new Float32Array(nx * nz * 3), uv = new Float32Array(nx * nz * 2), colr = new Float32Array(nx * nz * 3);
  const c = new THREE.Color();
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
    const k = j * nx + i, x = xs[i], z = zs[j];
    pos[k * 3] = x; pos[k * 3 + 1] = gradeAt(x, z) - 0.004; pos[k * 3 + 2] = z;
    uv[k * 2] = x; uv[k * 2 + 1] = -z;
    const n = 0.5 + 0.25 * Math.sin(x * 0.21 + z * 0.13) + 0.25 * Math.sin(x * 0.07 - z * 0.19);
    c.setRGB(0.8 + 0.25 * n, 0.85 + 0.15 * n, 0.72 + 0.12 * n);
    if (z > 20.2) c.multiplyScalar(0.92);
    colr[k * 3] = c.r; colr[k * 3 + 1] = c.g; colr[k * 3 + 2] = c.b;
  }
  const idx = [];
  for (let j = 0; j < nz - 1; j++) for (let i = 0; i < nx - 1; i++) {
    const cx = (xs[i] + xs[i + 1]) / 2, cz = (zs[j] + zs[j + 1]) / 2;
    if (cx > MAIN.x0 && cx < MAIN.x1 && cz > MAIN.z0 && cz < MAIN.z1) continue; // crawlspace hole
    const a = j * nx + i, b2 = a + 1, c2 = a + nx, d = c2 + 1;
    idx.push(a, c2, b2, b2, c2, d);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  g.setAttribute('color', new THREE.BufferAttribute(colr, 3));
  g.setIndex(idx); g.computeVertexNormals(); g.computeBoundingSphere();
  const m = new THREE.Mesh(g, getMat('grass'));
  m.name = 'terrain'; m.receiveShadow = true; m.matrixAutoUpdate = false; m.userData.static = true;
  return m;
}

// ── Interior furniture & fixtures ────────────────────────────────────────────
function furnish(b, aabb, fixtures) {
  const fx = (zone, x, y, z) => { (fixtures[zone] ||= []).push(new THREE.Vector3(x, y, z)); };
  const dome = (x, z, zone, r = 0.17) => {
    const g = new THREE.SphereGeometry(r, 14, 6, 0, Math.PI * 2, 0, Math.PI / 2);
    b.geometry('bulb', g, new THREE.Matrix4().makeRotationX(Math.PI).setPosition(x, CEIL, z), false); g.dispose();
    b.box(x - r - 0.02, CEIL - 0.015, z - r - 0.02, x + r + 0.02, CEIL, z + r + 0.02, 'trim', false);
    if (zone) fx(zone, x, CEIL - 0.25, z);
  };
  const box = (x0, x1, y0, y1, z0, z1, m, collide = false) => { b.box(x0, y0, z0, x1, y1, z1, m); if (collide) aabb('ground', x0, x1, z0, z1); };
  const rug = (x0, x1, z0, z1, m) => b.box(x0, 0, z0, x1, 0.008, z1, { py: m, def: m }, false);
  const plate = (x, y, z, axis, dir) => {
    if (axis === 'x') b.box(x - 0.035, y, z, x + 0.035, y + 0.11, z + dir * 0.008, 'appWhite');
    else b.box(x, y, z - 0.035, x + dir * 0.008, y + 0.11, z + 0.035, 'appWhite');
  };
  const register = (x0, x1, z0, z1) => b.box(x0, 0, z0, x1, 0.006, z1, { py: 'fvent', def: 'darkmetal' }, false);

  // Living
  box(3.78, 4.7, 0, 0.42, 6.6, 8.7, 'fabBlue', true);
  box(4.46, 4.72, 0.42, 0.86, 6.6, 8.7, 'fabBlue');
  box(3.78, 4.72, 0.42, 0.62, 6.6, 6.82, 'fabBlue'); box(3.78, 4.72, 0.42, 0.62, 8.48, 8.7, 'fabBlue');
  box(3.84, 4.44, 0.42, 0.5, 6.84, 7.64, 'fabTan'); box(3.84, 4.44, 0.42, 0.5, 7.66, 8.46, 'fabTan');
  box(2.3, 3.0, 0.38, 0.43, 7.15, 8.15, 'woodMed', true);
  for (const [x, z] of [[2.34, 7.19], [2.96, 7.19], [2.34, 8.11], [2.96, 8.11]]) box(x - 0.025, x + 0.025, 0, 0.38, z - 0.025, z + 0.025, 'woodMed');
  rug(1.5, 3.55, 6.4, 9.0, 'rug');
  box(1.3, 2.1, 0, 0.42, 8.55, 9.35, 'fabRust', true); box(1.3, 2.1, 0.42, 0.85, 9.2, 9.35, 'fabRust');
  box(1.3, 1.45, 0.42, 0.62, 8.55, 9.35, 'fabRust'); box(1.95, 2.1, 0.42, 0.62, 8.55, 9.35, 'fabRust');
  box(4.6, 5.75, 0, 1.85, 9.62, 9.98, 'woodDark', true);
  for (const y of [0.45, 0.9, 1.35]) box(4.62, 5.73, y, y + 0.025, 9.6, 9.97, 'woodMed');
  for (let i = 0; i < 18; i++) { const x = 4.66 + i * 0.058; box(x, x + 0.04, 0.47, 0.47 + rr(0.16, 0.26), 9.66, 9.9, ['fabRust', 'fabBlue', 'fabGreen', 'fabCream'][i % 4]); }
  box(5.5, 5.54, 0, 1.45, 6.08, 6.12, 'darkmetal'); box(5.36, 5.68, 1.45, 1.7, 5.94, 6.26, 'fabCream');
  // ceiling fan
  { const g = new THREE.CylinderGeometry(0.12, 0.14, 0.18, 12); b.geometry('woodDark', g, new THREE.Matrix4().makeTranslation(3.0, CEIL - 0.25, 7.8)); g.dispose();
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + 0.3; const bl = new THREE.BoxGeometry(0.6, 0.012, 0.13); b.geometry('woodMed', bl, new THREE.Matrix4().makeRotationY(a).setPosition(3.0 + Math.cos(a) * 0.42, CEIL - 0.3, 7.8 - Math.sin(a) * 0.42)); bl.dispose(); }
    b.box(2.98, CEIL - 0.16, 7.78, 3.02, CEIL, 7.82, 'woodDark');
    const s = new THREE.SphereGeometry(0.1, 12, 6); b.geometry('bulb', s, new THREE.Matrix4().makeTranslation(3.0, CEIL - 0.38, 7.8), false); s.dispose();
    fx('living', 3.0, CEIL - 0.5, 7.8); }
  register(1.0, 1.3, 9.75, 9.85); register(3.4, 3.7, 9.75, 9.85);
  plate(5.85, 1.2, 10, 'z', -1);

  // Kitchen: base run (components fill the sink/DW/range gaps), uppers, fridge, island, table
  const ctop = (x0, x1) => box(x0, x1, 0.88, 0.92, 0, 0.63, 'counter');
  box(0, 0.5, 0.08, 0.88, 0, 0.6, 'cabinet'); ctop(0, 1.1);
  box(2.0, 2.6, 0.08, 0.88, 0, 0.6, 'cabinet'); ctop(2.0, 2.6);
  box(3.36, 4.2, 0.08, 0.88, 0, 0.6, 'cabinet'); ctop(3.36, 4.2);
  box(0, 0.5, 0, 0.08, 0, 0.55, 'woodDark'); box(2.0, 2.6, 0, 0.08, 0, 0.55, 'woodDark'); box(3.36, 4.2, 0, 0.08, 0, 0.55, 'woodDark');
  aabb('ground', 0, 4.25, 0, 0.66);
  box(0, 1.1, 1.42, 2.2, 0, 0.33, 'cabinet'); box(2.0, 2.6, 1.42, 2.2, 0, 0.33, 'cabinet');
  box(2.6, 3.36, 1.95, 2.2, 0, 0.33, 'cabinet'); box(3.36, 4.2, 1.42, 2.2, 0, 0.33, 'cabinet');
  for (const x of [0.55, 2.3, 3.78]) box(x - 0.005, x + 0.005, 1.45, 2.17, 0.33, 0.34, 'woodDark');
  box(0.02, 0.77, 0, 1.76, 0.75, 1.6, 'appWhite', true);
  box(0.77, 0.79, 0.9, 1.5, 1.45, 1.5, 'metal'); box(0.77, 0.79, 0.25, 0.75, 1.45, 1.5, 'metal');
  box(0.02, 0.77, 1.1, 1.11, 0.75, 1.6, 'darkmetal');
  box(1.6, 3.6, 0.08, 0.88, 2.0, 2.85, 'cabinet', true); box(1.55, 3.65, 0.88, 0.93, 1.95, 2.9, 'counter'); box(1.65, 3.55, 0, 0.08, 2.05, 2.8, 'woodDark');
  box(1.6, 3.0, 0.72, 0.76, 3.9, 4.8, 'woodMed', true);
  for (const [x, z] of [[1.66, 3.96], [2.94, 3.96], [1.66, 4.74], [2.94, 4.74]]) box(x - 0.03, x + 0.03, 0, 0.72, z - 0.03, z + 0.03, 'woodMed');
  chair(b, 1.95, 3.6, Math.PI, 'woodMed'); chair(b, 2.65, 3.6, Math.PI, 'woodMed'); chair(b, 1.95, 5.1, 0, 'woodMed'); chair(b, 2.65, 5.1, 0, 'woodMed');
  aabb('ground', 1.6, 3.0, 3.35, 5.35);
  box(2.5, 2.7, CEIL - 0.06, CEIL, 1.2, 2.0, 'bulb'); box(2.47, 2.73, CEIL - 0.07, CEIL - 0.06, 1.17, 2.03, 'trim');
  fx('kitchen', 2.6, CEIL - 0.3, 1.6);
  for (const x of [2.1, 3.1]) { b.box(x - 0.005, 1.7, 2.42, x + 0.005, CEIL, 2.43, 'black'); const s = new THREE.ConeGeometry(0.13, 0.16, 12, 1, true); b.geometry('darkmetal', s, new THREE.Matrix4().makeTranslation(x, 1.68, 2.425)); s.dispose(); b.box(x - 0.04, 1.58, 2.39, x + 0.04, 1.62, 2.46, 'bulb', false); }
  fx('kitchen', 2.3, 2.0, 4.3);
  register(4.5, 4.8, 0.7, 0.8); plate(4.35, 1.2, 0.0, 'x', 1);

  // Laundry
  box(6.1, 7.6, 1.55, 1.58, 0, 0.32, 'woodLight');
  box(6.2, 6.42, 1.58, 1.86, 0.05, 0.25, 'plasticRed'); box(6.5, 6.66, 1.58, 1.8, 0.06, 0.22, 'appWhite'); box(7.0, 7.3, 1.58, 1.72, 0.05, 0.25, 'box');
  dome(7.3, 2.4, 'laundry');
  // dryer exhaust hood outside the north wall
  b.box(7.12, 0.32, MAIN.z0 - 0.09, 7.32, 0.5, MAIN.z0, 'appWhite');

  // Bath
  box(10.925, 10.94, 1.05, 1.9, 2.3, 3.1, 'mirror');
  box(10.87, 10.94, 1.95, 2.05, 2.4, 3.0, 'bulb');
  box(8.56, 8.6, 1.18, 1.21, 2.5, 3.2, 'metal'); box(8.56, 8.62, 0.75, 1.21, 2.55, 3.15, 'fabCream');
  rug(9.0, 9.7, 0.95, 1.55, 'fabBlue');
  fx('bath', 10.5, 2.05, 2.7);
  plate(9.75, 1.2, 4.44, 'x', -1);

  // Bedroom 2
  box(11.08, 12.08, 0, 0.3, 0.5, 2.55, 'woodLight', true); box(11.1, 12.06, 0.3, 0.52, 0.52, 2.53, 'bedding');
  box(11.1, 12.06, 0.52, 0.56, 1.1, 2.5, 'fabBlue'); box(11.25, 11.9, 0.52, 0.64, 0.58, 0.95, 'bedding');
  box(11.08, 12.08, 0, 0.95, 0.45, 0.5, 'woodLight');
  box(12.55, 13.65, 0.72, 0.76, 0.02, 0.58, 'woodLight', true);
  for (const [x, z] of [[12.59, 0.06], [13.61, 0.06], [12.59, 0.54], [13.61, 0.54]]) box(x - 0.02, x + 0.02, 0, 0.72, z - 0.02, z + 0.02, 'woodLight');
  chair(b, 13.1, 0.95, Math.PI, 'woodLight');
  box(13.62, 14.8, 0, 0.8, 3.96, 4.44, 'woodMed', true);
  for (const y of [0.25, 0.5]) box(13.64, 14.78, y, y + 0.01, 3.95, 3.96, 'woodDark');
  rug(11.4, 13.6, 2.0, 3.5, 'rug');
  dome(13.0, 2.3, 'bed2');
  register(12.1, 12.4, 0.2, 0.3); plate(12.45, 1.2, 4.44, 'x', -1);

  // Hall + foyer
  rug(8.6, 14.2, 4.86, 5.34, 'fabRust');
  box(10.6, 10.7, 1.4, 1.52, 4.56, 4.585, 'appWhite');
  dome(12.6, 5.1, 'hall', 0.14); dome(7.0, 8.3, 'hall', 0.15);
  box(7.56, 7.94, 0, 0.8, 7.0, 8.2, 'woodDark', true); box(7.92, 7.94, 1.1, 1.8, 7.2, 8.0, 'mirror');
  rug(6.4, 7.6, 8.9, 9.85, 'rug');
  plate(6.06, 1.2, 9.65, 'z', 1);

  // Primary bedroom
  box(12.85, 14.98, 0, 0.35, 7.25, 8.85, 'woodDark', true); box(12.87, 14.96, 0.35, 0.6, 7.27, 8.83, 'bedding');
  box(12.85, 14.35, 0.6, 0.66, 7.24, 8.86, 'fabGreen'); box(14.42, 14.9, 0.6, 0.72, 7.35, 8.0, 'bedding'); box(14.42, 14.9, 0.6, 0.72, 8.1, 8.75, 'bedding');
  box(14.92, 14.99, 0, 1.15, 7.2, 8.9, 'woodDark');
  for (const [z0, z1] of [[6.7, 7.15], [8.95, 9.4]]) { box(14.5, 14.98, 0, 0.6, z0, z1, 'woodMed', true); box(14.66, 14.82, 0.6, 0.86, z0 + 0.15, z0 + 0.31, 'fabCream'); }
  box(8.06, 8.56, 0, 0.88, 6.6, 7.9, 'woodMed', true);
  for (const y of [0.3, 0.6]) box(8.56, 8.565, y, y + 0.01, 6.62, 7.88, 'woodDark');
  rug(11.8, 14.6, 6.9, 9.3, 'rug');
  box(12.6, 14.95, 1.7, 1.72, 5.8, 6.32, 'woodLight'); box(12.6, 14.95, 1.63, 1.65, 6.04, 6.08, 'metal');
  for (let i = 0; i < 14; i++) { const x = 12.75 + i * 0.15; box(x, x + rr(0.04, 0.09), rr(0.85, 1.05), 1.62, 5.86, 6.26, ['fabBlue', 'fabCream', 'fabRust', 'fabGreen', 'fabTan'][i % 5]); }
  dome(11.6, 7.9, 'primary');
  register(10.3, 10.6, 9.75, 9.85); plate(9.5, 1.2, 5.76, 'x', 1);

  // Garage
  for (const x of [15.4, 17.6]) for (const z of [0.04, 0.5]) box(x - 0.02, x + 0.02, GARAGE_FLOOR, 1.95, z - 0.02, z + 0.02, 'metal');
  for (const y of [0.05, 0.6, 1.2, 1.8]) box(15.4, 17.6, GARAGE_FLOOR + y, GARAGE_FLOOR + y + 0.03, 0.02, 0.52, 'metal');
  aabb('ground', 15.38, 17.62, 0, 0.55);
  for (const [x, y, w] of [[15.5, 0.08, 0.5], [16.1, 0.08, 0.45], [16.9, 0.63, 0.55], [15.6, 1.23, 0.4], [16.3, 1.23, 0.6], [17.0, 0.08, 0.5]]) box(x, x + w, GARAGE_FLOOR + y, GARAGE_FLOOR + y + rr(0.25, 0.4), 0.06, 0.46, rnd() < 0.5 ? 'box' : 'plasticGreen');
  box(15.2, 15.85, GARAGE_FLOOR + 0.84, GARAGE_FLOOR + 0.9, 6.2, 8.2, 'woodLight', true);
  box(15.2, 15.85, GARAGE_FLOOR, GARAGE_FLOOR + 0.84, 6.25, 6.3, 'woodLight'); box(15.2, 15.85, GARAGE_FLOOR, GARAGE_FLOOR + 0.84, 8.1, 8.15, 'woodLight');
  box(15.16, 15.18, GARAGE_FLOOR + 1.1, GARAGE_FLOOR + 1.9, 6.2, 8.2, 'woodLight');
  // mower
  box(19.2, 19.75, GARAGE_FLOOR + 0.08, GARAGE_FLOOR + 0.35, 1.3, 1.85, 'plasticRed', true);
  for (const [x, z] of [[19.22, 1.35], [19.73, 1.35], [19.22, 1.8], [19.73, 1.8]]) { const w = new THREE.CylinderGeometry(0.09, 0.09, 0.05, 12); b.geometry('black', w, new THREE.Matrix4().makeRotationZ(Math.PI / 2).setPosition(x, GARAGE_FLOOR + 0.09, z)); w.dispose(); }
  b.member('black', [19.3, GARAGE_FLOOR + 0.35, 1.85], [19.3, GARAGE_FLOOR + 0.95, 2.35], 0.025, 0.025); b.member('black', [19.65, GARAGE_FLOOR + 0.35, 1.85], [19.65, GARAGE_FLOOR + 0.95, 2.35], 0.025, 0.025);
  // bins
  box(20.9, 21.45, GARAGE_FLOOR, GARAGE_FLOOR + 1.05, 8.6, 9.2, 'plasticGreen', true); box(20.9, 21.45, GARAGE_FLOOR, GARAGE_FLOOR + 1.05, 7.9, 8.5, 'darkmetal', true);
  for (const [x, z] of [[17.3, 4.0], [19.3, 6.5]]) { box(x - 0.08, x + 0.08, CEIL - 0.06, CEIL, z - 0.08, z + 0.08, 'appWhite'); const s = new THREE.SphereGeometry(0.06, 10, 6); b.geometry('bulb', s, new THREE.Matrix4().makeTranslation(x, CEIL - 0.11, z), false); s.dispose(); fx('garage', x, CEIL - 0.3, z); }
  plate(15.16, 1.2, 4.45, 'z', 1);
}

// ── Attic framing ───────────────────────────────────────────────────────────
// Footprints (world x0,x1,z0,z1) of attic floor components; see placements.js.
const ATTIC_HOLES = [
  [4.0, 8.0, 5.7, 8.7],        // att-insulation
  [9.45, 9.95, 2.05, 3.35],    // att-bath-duct
  [11.65, 12.35, 6.35, 8.45],  // att-duct
  [3.0, 4.0, 3.5, 4.5],        // att-wiring
  [0.4, 1.4, 3.0, 4.0],        // att-pests
  [7.27, 7.97, -0.36, 2.64],   // att-truss
  [3.0, 5.0, 9.5, 10.0],       // att-soffit-vent
];
function attic(b, HX0, HX1, HZ0, HZ1, portals) {
  const W = 0.038, D = 0.089;
  for (let k = 0; k < 24; k++) {
    const x = 0.3 + 0.61 * k;
    const skipWebs = k === 12; // att-truss component stands here
    const zc = skipWebs ? 2.64 : MAIN.z0; // att-truss component supplies the north end of truss 12
    b.box(x - W / 2, 2.455, zc, x + W / 2, 2.455 + D, MAIN.z1, 'lumber');
    const tc = (z) => mainUnder(z) - 0.05;
    b.member('lumber', [x, tc(skipWebs ? 2.64 : MAIN.z0 - 0.45), skipWebs ? 2.64 : MAIN.z0 - 0.45], [x, tc(5), 5], W, D, [0, 1, 0]);
    b.member('lumber', [x, tc(5), 5], [x, tc(MAIN.z1 + 0.45), MAIN.z1 + 0.45], W, D, [0, 1, 0]);
    if (!skipWebs) {
      const zb1 = MAIN.z0 + 10.4 / 3, zb2 = MAIN.z0 + 20.8 / 3;
      const zt1 = MAIN.z0 + 10.4 / 4, zt2 = MAIN.z0 + 31.2 / 4;
      const yb = 2.455 + D;
      b.member('lumber', [x, yb, zb1], [x, tc(zt1) - 0.04, zt1], W * 0.9, 0.064);
      b.member('lumber', [x, yb, zb1], [x, tc(5) - 0.06, 5], W * 0.9, 0.064);
      b.member('lumber', [x, yb, zb2], [x, tc(5) - 0.06, 5], W * 0.9, 0.064);
      b.member('lumber', [x, yb, zb2], [x, tc(zt2) - 0.04, zt2], W * 0.9, 0.064);
    }
  }
  // insulation (thin blown layer) with the hatch hole
  // Attic floor components carry their own insulation patch: leave holes where they sit.
  const holes = [[HX0 - 0.05, HX1 + 0.05, HZ0 - 0.05, HZ1 + 0.05], ...ATTIC_HOLES];
  const xs = [...new Set([0, 15, ...holes.flatMap((h) => [h[0], h[1]])])].filter((v) => v >= 0 && v <= 15).sort((a, b) => a - b);
  const zs = [...new Set([0, 10, ...holes.flatMap((h) => [h[2], h[3]])])].filter((v) => v >= 0 && v <= 10).sort((a, b) => a - b);
  for (let i = 0; i < xs.length - 1; i++) for (let j = 0; j < zs.length - 1; j++) {
    const cx = (xs[i] + xs[i + 1]) / 2, cz = (zs[j] + zs[j + 1]) / 2;
    if (holes.some((h) => cx > h[0] && cx < h[1] && cz > h[2] && cz < h[3])) continue;
    b.box(xs[i], 2.45, zs[j], xs[i + 1], ATTIC_FLOOR, zs[j + 1], { py: 'insul', def: null }, false);
  }
  // hatch framing + warm light rising from the hall
  b.box(HX0 - 0.05, 2.45, HZ0 - 0.05, HX1 + 0.05, 2.65, HZ0, 'lumber');
  b.box(HX0 - 0.05, 2.45, HZ1, HX1 + 0.05, 2.65, HZ1 + 0.05, 'lumber');
  b.box(HX0 - 0.05, 2.45, HZ0, HX0, 2.65, HZ1, 'lumber'); b.box(HX1, 2.45, HZ0, HX1 + 0.05, 2.65, HZ1, 'lumber');
  b.box(HX0, 2.44, HZ0, HX1, 2.45, HZ1, { py: 'glowWarm', def: null }, false);
  portals.push(portalBox((HX0 + HX1) / 2, 2.52, (HZ0 + HZ1) / 2, HX1 - HX0, 0.12, HZ1 - HZ0, 'attic>hall', 'Attic hatch (climb down)'));
  // daylight at ridge vent slot and eaves
  b.box(0.6, mainUnder(5) - 0.012, 4.975, 14.6, mainUnder(5) - 0.002, 5.025, { ny: 'daylight', def: null }, false);
  b.box(0, PLATE, MAIN.z0 - 0.002, 15, HEEL - 0.01, MAIN.z0, { pz: 'daylightDim', def: null }, false);
  b.box(0, PLATE, MAIN.z1, 15, HEEL - 0.01, MAIN.z1 + 0.002, { nz: 'daylightDim', def: null }, false);
  // wall top plates poking through the insulation
  for (const z of [4.5, 5.7]) b.box(6, ATTIC_FLOOR - 0.02, z - 0.045, 15, PLATE, z + 0.045, 'lumber');
  for (const x of [6, 8.5, 11]) b.box(x - 0.045, ATTIC_FLOOR - 0.02, 0, x + 0.045, PLATE, 4.5, 'lumber');
  // romex runs + junction box, plumbing vent, bare bulb near the hatch
  b.member('romex', [1.2, 2.6, 2.3], [13.8, 2.6, 2.3], 0.012, 0.006);
  b.member('romex', [6.2, 2.6, 7.6], [13.8, 2.6, 7.6], 0.012, 0.006);
  b.member('romex', [10.9, 2.6, 2.3], [10.9, 2.6, 7.6], 0.012, 0.006);
  b.box(10.85, 2.585, 2.25, 10.95, 2.66, 2.35, 'darkmetal');
  { const v = new THREE.CylinderGeometry(0.042, 0.042, mainUnder(3.0) - 2.45, 12); b.geometry('pvc', v, new THREE.Matrix4().makeTranslation(9.8, (mainUnder(3.0) + 2.45) / 2, 3.0)); v.dispose(); }
  b.box(10.54, 3.4, 5.9, 10.66, 3.47, 6.0, 'appWhite');
  { const s = new THREE.SphereGeometry(0.04, 10, 6); b.geometry('appWhite', s, new THREE.Matrix4().makeTranslation(10.6, 3.36, 5.95)); s.dispose(); }
}

// ── Crawlspace ─────────────────────────────────────────────────────────────
function crawl(b, portals) {
  b.box(0, CRAWL_FLOOR - 0.05, 0, 15, CRAWL_FLOOR, 10, { py: 'dirt', def: null }, false);
  const sheet = (x0, x1, z0, z1, y = 0.004) => b.box(x0, CRAWL_FLOOR + 0.001, z0, x1, CRAWL_FLOOR + y, z1, { py: 'plastic', def: null }, false);
  sheet(0.3, 5.2, 5.4, 9.7); sheet(9.6, 14.7, 0.3, 4.0); sheet(7.2, 14.7, 6.0, 9.7, 0.006);
  b.box(0, -0.02, 0, 15, 0, 10, { ny: 'osb', def: null });
  for (let k = 0; k < 37; k++) {
    const x = 0.2 + 0.4064 * k;
    const spans = (x > 9.25 && x < 11.35) ? [[0.04, 0.35], [3.45, 9.96]] : [[0.04, 9.96]];
    for (const [z0, z1] of spans) b.box(x - 0.019, JOIST_BOT, z0, x + 0.019, -0.02, z1, 'lumber');
  }
  b.box(0, JOIST_BOT, 0, 15, -0.02, 0.04, 'lumber'); b.box(0, JOIST_BOT, 9.96, 15, -0.02, 10, 'lumber');
  b.box(0, JOIST_BOT, 0, 0.04, -0.02, 10, 'lumber'); b.box(14.96, JOIST_BOT, 0, 15, -0.02, 10, 'lumber');
  b.box(MAIN.x0, SILL, MAIN.z0, 15.2, JOIST_BOT, 0, 'lumber'); b.box(MAIN.x0, SILL, 10, 15.2, JOIST_BOT, MAIN.z1, 'lumber');
  b.box(MAIN.x0, SILL, 0, 0, JOIST_BOT, 10, 'lumber'); b.box(15.0, SILL, 0, 15.2, JOIST_BOT, 10, 'lumber');
  for (const gz of GIRDERS_Z) b.box(0, -0.505, gz - 0.07, 15, JOIST_BOT, gz + 0.07, 'lumber');
  for (const px of PIERS_X) for (const gz of GIRDERS_Z) {
    if (px === 9.0 && gz === 3.33) continue; // crawl-pier component
    b.box(px - 0.2, CRAWL_FLOOR, gz - 0.2, px + 0.2, -0.505, gz + 0.2, 'block');
  }
  // trunk duct, plenum drop, flex branches
  b.box(6.0, -0.47, 4.78, 13.5, -0.27, 5.22, 'ductMetal');
  b.box(7.9, -0.47, 0.3, 8.35, -0.02, 0.72, 'ductMetal');
  const flex = (pts, r = 0.1) => { const c = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p))); const t = new THREE.TubeGeometry(c, 36, r, 10, false); b.geometry('flex', t, null); t.dispose(); };
  flex([[8.12, -0.35, 0.72], [8.12, -0.62, 2.0], [8.12, -0.66, 3.33], [8.12, -0.5, 4.4], [8.12, -0.37, 4.8]], 0.13);
  flex([[12.8, -0.37, 4.78], [12.8, -0.55, 4.2], [12.8, -0.66, 3.33], [12.8, -0.45, 2.0], [12.8, -0.06, 0.6]]);
  flex([[10.5, -0.37, 5.22], [10.5, -0.6, 5.9], [10.5, -0.66, 6.67], [10.5, -0.45, 8.0], [10.5, -0.06, 9.4]]);
  flex([[3.0, -0.2, 9.4], [3.0, -0.5, 8.4], [3.1, -0.66, 6.67], [3.0, -0.62, 5.8], [3.3, -0.4, 5.2]]);
  // PVC building drain to the street side, a copper supply run
  { const a = new THREE.Vector3(9.6, -0.45, 4.25), c = new THREE.Vector3(9.6, -0.78, 10.1); b.member('pvc', a.toArray(), c.toArray(), 0.1, 0.1); }
  b.member('copper', [6.3, -0.3, 0.1], [6.3, -0.3, 4.4], 0.022, 0.022);
  b.member('copper', [6.3, -0.3, 4.4], [9.4, -0.3, 4.4], 0.022, 0.022);
  // exit glow at the access door + portal
  const { a0, a1, y0, y1 } = OPEN.crawlDoor;
  b.box(a0, y0, MAIN.z0 + 0.012, a1, y1, MAIN.z0 + 0.016, { pz: 'daylightDim', def: null }, false);
  portals.push(portalBox((a0 + a1) / 2, (y0 + y1) / 2, MAIN.z0 + 0.1, a1 - a0, y1 - y0, 0.2, 'crawl>exterior', 'Crawlspace door (climb out)'));
}
