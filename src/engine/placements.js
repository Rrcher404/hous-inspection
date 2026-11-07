// Where every component lives, honouring each model's mount convention (CONTEXT.md §4).
// Positions are the model ORIGIN in world space; rotY turns the model's +Z (front) to face the
// viewer. Roof mounts are tilted to the plane they sit on. Also: per-component mesh merging
// (by material + checkpoint + thermal tag) so ~74 detailed props stay cheap to draw.
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {
  CEIL, GARAGE_FLOOR, CRAWL_FLOOR, DECK_TOP, STAIR_BASE, ATTIC_ITEM_Y, JOIST_BOT, MAIN,
  PITCH_A, mainTop, mainUnder, gradeAt, driveUnder, DRIVE, DRIVE_END,
} from './layout.js';

const PI = Math.PI, H = PI / 2;
const G = 'grade';

// mount 'roof' entries: plane 'S' (slopes down to +Z), 'N' (down to −Z), 'flat' (ridge), 'underN'/'underS'
// (hung under the sheathing in the attic). spin = rotation about the plane normal.
export const PLACEMENTS = {
  // ── EXTERIOR ──
  'ext-grading':        { p: [3.0, G, 11.7], r: 0 },
  'ext-downspout':      { p: [0.35, G, MAIN.z1], r: 0 },
  'ext-gutter':         { p: [2.2, 2.29, MAIN.z1 + 0.45 + 0.035], r: 0 },
  'ext-siding':         { p: [21.7, G, 7.5], r: H },
  'ext-window':         { p: [3.5, 0.7, MAIN.z1], r: 0 },
  'ext-hose-bib':       { p: [6.3, -0.12, MAIN.z0], r: PI },
  'ext-service-drop':   { p: [21.7, G, 2.5], r: H, maxDist: 4.0 },
  'ext-ac-condenser':   { p: [7.4, G, MAIN.z0 - 0.45], r: PI },  // model's back edge (z=-0.45) is the wall plane
  'ext-receptacle':     { p: [5.45, 0.05, MAIN.z1], r: 0 },
  'ext-front-steps':    { p: [7.0, -0.75, 11.0], r: 0 },
  'ext-driveway':       { p: [DRIVE.xc, null, 14.2], r: 0, tiltX: Math.atan((-0.25 - DRIVE_END) / 8) },
  'ext-crawl-access':   { p: [9.6, -0.86, MAIN.z0], r: PI },
  'ext-ladder':         { p: [14.0, G, 10.8], r: 0 },
  // ── ROOF ──
  'roof-shingles':      { roof: 'S', p: [11.0, 7.6] },
  'roof-chimney':       { roof: 'S', p: [-0.6, 7.0] },
  'roof-vent-boot':     { roof: 'N', p: [9.8, 3.0] },
  'roof-edge':          { roof: 'S', p: [12.0, 10.45] },
  'roof-valley':        { roof: 'S', p: [5.875, 9.325], spin: 'valley', roll: -0.14, lift: 0.006 },  // roll its west (−X) half flat onto the main plane; the porch side tucks under our porch shingles
  'roof-ridge-vent':    { roof: 'flat', p: [11.0, 5.0] },
  // ── DECK ──
  'deck-ledger':        { p: [3.0, DECK_TOP - 0.025 - 0.265, MAIN.z0 - 0.003], r: PI, view: [0.1, -0.15, -1], maxDist: 2.3 },  // look along the joists from the yard, under the beam  // ledger top = joist top
  'deck-framing':       { p: [3.0, DECK_TOP - 0.26, MAIN.z0], r: PI, view: [0.1, -0.25, -1], maxDist: 2.4 },  // free mount: origin wall plane, joist bottom; carries decking
  'deck-guard':         { p: [2.2, DECK_TOP, -3.58], r: PI },  // +Z = outward (posts on the outer face)
  'deck-stairs':        { p: [4.6, STAIR_BASE, -4.4], r: PI },
  'deck-posts':         { p: [5.3, G, -3.45], r: 0, view: [0.35, 0.2, -1] },  // grade; the model's post (0.62) + beam (9.25 in) meets the joists
  // ── SHED ──
  'shed-tile-roof':     { p: [-5.5, G, -5.5], r: 0, maxDist: 5.0 },
  // ── LIVING ──
  'liv-fireplace':      { p: [0, 0, 7.0], r: H },
  'liv-smoke-alarm':    { p: [3.4, CEIL, 6.1], r: 0 },
  'liv-receptacle':     { p: [1.0, 0.3, 10.0], r: PI },
  'liv-ceiling-stain':  { p: [1.5, CEIL, 8.6], r: 0 },
  'liv-window':         { p: [3.5, 0.7, 10.0], r: PI },
  // ── KITCHEN ──
  'kit-range':          { p: [2.98, 0, 0.35], r: 0 },
  'kit-dishwasher':     { p: [0.8, 0, 0.31], r: 0 },
  'kit-sink':           { p: [1.55, 0, 0.31], r: 0 },
  'kit-gfci':           { p: [2.3, 1.02, 0.0], r: 0 },
  'kit-hood':           { p: [2.98, 1.62, 0.0], r: 0 },
  'kit-back-door':      { p: [5.05, 0, 0.0], r: 0 },
  // ── BATH ──
  'bath-toilet':        { p: [10.5, 0, 0.37], r: 0 },
  'bath-vanity':        { p: [10.665, 0, 2.7], r: -H, view: [-1, -0.04, 0.3] },  // low, slightly oblique: trap in profile under the rail, stops still visible
  'bath-tub':           { p: [9.31, 0, 0.41], r: 0 },
  'bath-gfci':          { p: [10.94, 1.0, 3.35], r: -H },
  'bath-fan':           { p: [9.7, CEIL, 2.4], r: 0 },
  // ── PRIMARY ──
  'pri-window':         { p: [10.5, 0, 10.0], r: PI },   // floor-referenced model (sill height is the defect)
  'pri-smoke-alarm':    { p: [10.2, CEIL, 7.3], r: 0 },
  'pri-receptacle':     { p: [8.06, 0.3, 8.9], r: H },
  'pri-closet':         { p: [13.75, CEIL, 6.05], r: 0 },
  // ── BED 2 ──
  'bed2-window':        { p: [13.0, 0.75, 0.0], r: 0 },
  'bed2-wall-crack':    { p: [11.9, 2.12, 4.44], r: PI },
  'bed2-door':          { p: [11.9, 0, 4.44], r: PI },
  // ── HALL ──
  'hall-attic-ladder':  { p: [10.0, CEIL, 5.1], r: H },
  'hall-co-alarm':      { p: [7.4, CEIL, 5.1], r: 0 },
  'hall-return':        { p: [13.9, 0.12, 4.56], r: 0 },
  // ── LAUNDRY ──
  'util-furnace':       { p: [8.12, 0, 0.48], r: 0 },
  'util-dryer':         { p: [7.22, 0, 0.5], r: 0, view: [0.3, 1, 0.55] },  // look down behind the machine: the duct is the checkpoint
  'util-washer':        { p: [6.47, 0, 0.45], r: 0 },
  // ── GARAGE ──
  'gar-panel':          { p: [21.5, 1.15, 3.0], r: -H },
  'gar-water-heater':   { p: [20.85, GARAGE_FLOOR, 0.55], r: 0 },
  'gar-fire-door':      { p: [15.15, 0, 5.1], r: H },
  'gar-overhead-door':  { p: [18.33, GARAGE_FLOOR, 10.0], r: PI, maxDist: 4.2 },
  'gar-firewall':       { p: [15.15, GARAGE_FLOOR, 2.2], r: H },
  // ── ATTIC ──
  'att-insulation':     { p: [6.0, ATTIC_ITEM_Y, 7.2], r: 0 },
  'att-bath-duct':      { p: [9.7, ATTIC_ITEM_Y, 2.7], r: 0 },
  'att-sheathing':      { roof: 'underN', p: [0.3 + 0.61 * 10 - 0.305, 1.6] },  // its chords align with ours
  'att-truss':          { p: [0.3 + 0.61 * 12, ATTIC_ITEM_Y, 1.14], r: -H, view: [-1, 0.3, 0.35] },  // half truss: heel at the north eave, rising to +Z
  'att-soffit-vent':    { p: [4.0, ATTIC_ITEM_Y, 9.85], r: PI },  // local -Z = eave
  'att-duct':           { p: [12.0, ATTIC_ITEM_Y, 7.4], r: 0 },
  'att-wiring':         { p: [3.5, ATTIC_ITEM_Y, 4.0], r: 0 },
  'att-pests':          { p: [0.9, ATTIC_ITEM_Y, 3.5], r: 0 },
  // ── CRAWL ──
  'crawl-vapor-barrier':  { p: [6.4, CRAWL_FLOOR, 2.0], r: 0, view: [0.2, 0.3, 1] },
  'crawl-pier':           { p: [9.0, CRAWL_FLOOR, 3.33], r: 0 },
  'crawl-joists':         { p: [10.3, 0.0, 1.9], r: H },   // model joists run along its X; ours run N–S
  'crawl-foundation-wall':{ p: [15.2, -1.19, 6.0], r: -H },
  'crawl-termite':        { p: [11.5, -0.66, 0.0], r: 0 },
  'crawl-plumbing':       { p: [9.6, 0.0, 3.95], r: 0 },     // origin = floor underside; drain runs through the joists
  'crawl-duct':           { p: [4.5, JOIST_BOT, 5.0], r: H },
};

// ── Applying a placement ─────────────────────────────────────────────────────
const _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion();
const Yax = new THREE.Vector3(0, 1, 0), Xax = new THREE.Vector3(1, 0, 0);

function valleySpin() {
  // The west porch valley runs downhill toward (-X, +Z) in plan. In the tilted south-plane
  // frame that is du = -1 along the eave, dv = 1/cos(pitch) down the slope.
  return Math.atan2(-1, 1 / Math.cos(PITCH_A));
}

/** Returns { position, quaternion, front (world dir), normal } for a component. */
export function poseFor(comp) {
  const P = PLACEMENTS[comp.id];
  if (!P) return null;
  const out = { position: new THREE.Vector3(), quaternion: new THREE.Quaternion(), front: new THREE.Vector3(0, 0, 1), normal: new THREE.Vector3(0, 1, 0) };
  if (P.roof) {
    const [x, z] = P.p;
    let yaw = 0, tilt = PITCH_A, y;
    if (P.roof === 'S') y = mainTop(z);
    else if (P.roof === 'N') { y = mainTop(z); yaw = PI; }
    else if (P.roof === 'flat') { y = mainTop(z); tilt = 0; }
    else if (P.roof === 'underN' || P.roof === 'underS') { y = mainUnder(z); yaw = P.roof === 'underN' ? PI : 0; }
    _q.setFromAxisAngle(Yax, yaw);
    _q2.setFromAxisAngle(Xax, tilt);
    out.quaternion.copy(_q).multiply(_q2);
    if (P.spin === 'valley') out.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(Yax, valleySpin()));
    else if (P.spin) out.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(Yax, P.spin));
    if (P.roll) out.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), P.roll));
    out.normal.set(0, 1, 0).applyQuaternion(out.quaternion);
    out.position.set(x, y, z);
    if (P.lift) out.position.addScaledVector(out.normal, P.lift);
    if (P.roof.startsWith('under')) out.position.addScaledVector(out.normal, -0.003); // model y=0 = sheathing underside
    out.front.set(0, 0, 1).applyQuaternion(out.quaternion);
    return out;
  }
  let [x, y, z] = P.p;
  const r = P.r || 0;
  out.front.set(Math.sin(r), 0, Math.cos(r));
  if (y === G) {
    // wall mounts: sample the grade just in front of the wall
    const ox = comp.mount === 'wall' ? out.front.x * 0.25 : 0, oz = comp.mount === 'wall' ? out.front.z * 0.25 : 0;
    y = gradeAt(x + ox, z + oz) - 0.01;
  }
  if (comp.id === 'ext-driveway') y = (driveUnder(DRIVE.z0) + driveUnder(DRIVE.z1)) / 2 - 0.005;
  out.position.set(x, y, z);
  _q.setFromAxisAngle(Yax, r);
  out.quaternion.copy(_q);
  if (P.tiltX) out.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(Xax, P.tiltX));
  if (P.view) out.view = new THREE.Vector3(...P.view).normalize();
  if (P.dist) out.dist = P.dist;
  if (P.maxDist) out.maxDist = P.maxDist;
  if (comp.mount === 'ceiling') out.normal.set(0, -1, 0);
  else if (comp.mount === 'wall') out.normal.copy(out.front);
  return out;
}

export function applyPlacement(group, comp) {
  const pose = poseFor(comp);
  if (!pose) { console.warn('[engine] no placement for', comp.id); return null; }
  group.position.copy(pose.position);
  group.quaternion.copy(pose.quaternion);
  group.updateMatrixWorld(true);
  return pose;
}

// ── Per-component merge ──────────────────────────────────────────────────────
const KEEP_KEYS = new Set(['checkpointId', 'componentId', 'thermal']);
/**
 * Collapse a freshly built component group (at identity) into one mesh per
 * (material, checkpoint, thermal, shadow flags). Returns stats.
 */
export function optimizeComponent(root) {
  root.updateMatrixWorld(true);
  const inv = new THREE.Matrix4().copy(root.matrixWorld).invert();
  const buckets = new Map();
  const geoUse = new Map();
  root.traverse((o) => { if (o.isMesh) geoUse.set(o.geometry, (geoUse.get(o.geometry) || 0) + 1); });
  let before = 0;
  root.traverse((o) => {
    if (!o.isMesh) return;
    before++;
    if (o.isInstancedMesh || o.isSkinnedMesh || Array.isArray(o.material) || o.children.length) return;
    if (!o.visible || o.morphTargetInfluences) return;
    for (const k of Object.keys(o.userData)) if (!KEEP_KEYS.has(k)) return;
    const geo = o.geometry;
    if (!geo.attributes.position || geo.morphAttributes?.position) return;
    if (o.material.vertexColors && !geo.attributes.color) return;
    const m = new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld);
    if (m.determinant() < 0) return;
    const attrs = Object.keys(geo.attributes).filter((a) => ['position', 'normal', 'uv', 'color'].includes(a)).sort().join(',');
    if (!attrs.includes('normal')) return;
    const key = [o.material.uuid, o.userData.checkpointId || '', o.userData.thermal || '', o.castShadow ? 1 : 0, o.receiveShadow ? 1 : 0, o.renderOrder, attrs].join('|');
    let b = buckets.get(key);
    if (!b) { b = { meshes: [], mats: [] }; buckets.set(key, b); }
    b.meshes.push(o); b.mats.push(m);
  });
  let merged = 0;
  for (const b of buckets.values()) {
    if (b.meshes.length < 2) continue;
    const geos = [];
    const keepAttrs = Object.keys(b.meshes[0].geometry.attributes).filter((a) => ['position', 'normal', 'uv', 'color'].includes(a));
    for (let i = 0; i < b.meshes.length; i++) {
      let g = b.meshes[i].geometry;
      g = g.index ? g.toNonIndexed() : g.clone();
      for (const a of Object.keys(g.attributes)) if (!keepAttrs.includes(a)) g.deleteAttribute(a);
      g.morphAttributes = {}; g.clearGroups();
      g.applyMatrix4(b.mats[i]);
      geos.push(g);
    }
    let mg = null;
    try { mg = mergeGeometries(geos, false); } catch { mg = null; }
    geos.forEach((g) => g.dispose());
    if (!mg) continue;
    mg.computeBoundingSphere(); mg.computeBoundingBox();
    const src = b.meshes[0];
    const mesh = new THREE.Mesh(mg, src.material);
    mesh.castShadow = src.castShadow; mesh.receiveShadow = src.receiveShadow; mesh.renderOrder = src.renderOrder;
    for (const k of KEEP_KEYS) if (src.userData[k] !== undefined) mesh.userData[k] = src.userData[k];
    mesh.name = 'merged';
    root.add(mesh);
    for (const o of b.meshes) {
      o.parent.remove(o);
      const n = geoUse.get(o.geometry) - 1; geoUse.set(o.geometry, n);
      if (n <= 0) o.geometry.dispose();
    }
    merged += b.meshes.length;
  }
  // drop empty groups left behind
  const empties = [];
  root.traverse((o) => { if (o !== root && !o.isMesh && o.children.length === 0 && o.type === 'Group') empties.push(o); });
  empties.forEach((o) => o.parent && o.parent.remove(o));
  let after = 0; root.traverse((o) => { if (o.isMesh) after++; });
  return { before, after, merged };
}
