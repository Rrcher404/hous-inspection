// OWNER: Isolde-A (prop artist). Zones: exterior, roof, deck, shed, garage, attic.
// export const builders = { 'component-id': (states, comp) => THREE.Group }
//
// Conventions used here (see CONTEXT.md §4):
//  • Units are metres. 1 in = 0.0254.
//  • 'roof' mount: the roof surface is the local y=0 plane, +Z points DOWNSLOPE (toward the
//    eave), −Z upslope (toward the ridge). The engine tilts the whole group to the 6/12 pitch.
//    Anything that must stay truly vertical (chimney, vent pipe, fascia, ridge cap) is built in an
//    `upright()` sub-group pre-rotated by −ROOF_PITCH about X, which assumes the engine applies
//    rotation.x = +ROOF_PITCH (so +Z drops). Exported as ROOF_PITCH for the engine.
//  • 'deck-framing' (mount 'free'): origin at the house-wall plane, bottom of the joists at y=0,
//    joists run toward +Z (away from the house) for 3 m. Same convention as 'wall'.
//  • 'ext-ac-condenser' (ground): its back edge z=−0.45 is the house-wall plane (disconnect and
//    line-set penetration live there).
//  • Invisible click targets carry userData.hit = true (opacity 0, no shadow). An engine
//    thermal-material swap should skip meshes with userData.hit.
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { THREE, box, cyl, sphere, pipe, tube, decal, textTex, stainTex, canvasTex, tag, thermal, group, mat, C } from './kit.js';

const IN = 0.0254;
const PI = Math.PI;
export const ROOF_PITCH = Math.atan(6 / 12);

// ── tiny utilities ───────────────────────────────────────────────────────────
function rng(seed) {
  let s = 2166136261;
  for (const ch of String(seed)) s = Math.imul(s ^ ch.charCodeAt(0), 16777619) >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0; let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const isDef = (states, id) => states?.[id] === 'defect';

const _e = new THREE.Euler(), _q = new THREE.Quaternion(), _p = new THREE.Vector3(), _s = new THREE.Vector3(), _m = new THREE.Matrix4();
function xf(g, pos, rot, scl) {
  pos = pos || [0, 0, 0]; rot = rot || [0, 0, 0]; scl = scl || [1, 1, 1];
  _e.set(rot[0], rot[1], rot[2], rot[3] || 'XYZ'); _q.setFromEuler(_e);
  _m.compose(_p.set(pos[0], pos[1], pos[2]), _q, _s.set(scl[0], scl[1], scl[2])); g.applyMatrix4(_m); return g;
}
const gBox = (w, h, d, pos, rot) => xf(new THREE.BoxGeometry(w, h, d), pos, rot);
const gCyl = (rt, rb, h, pos, rot, seg = 12, open = false, ts = 0, tl = PI * 2) =>
  xf(new THREE.CylinderGeometry(rt, rb, h, seg, 1, open, ts, tl), pos, rot);
const gSph = (r, pos, scl = [1, 1, 1], ws = 8, hs = 6) => xf(new THREE.SphereGeometry(r, ws, hs), pos, [0, 0, 0], scl);
function gPipe(a, b, r, seg = 10, rb) {
  const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b);
  const g = new THREE.CylinderGeometry(r, rb ?? r, va.distanceTo(vb), seg, 1);
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), vb.clone().sub(va).normalize()));
  const c = va.add(vb).multiplyScalar(0.5); g.translate(c.x, c.y, c.z); return g;
}
/** Tube along points. ribs>0 corrugates alternate rings (flex duct). */
function gTube(pts, r, segs = 24, radial = 8, ribs = 0) {
  const curve = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p)));
  const g = new THREE.TubeGeometry(curve, segs, r, radial, false);
  if (ribs) {
    const pos = g.attributes.position, P = new THREE.Vector3(), c = new THREE.Vector3();
    for (let i = 0; i <= segs; i++) {
      curve.getPointAt(i / segs, c); const f = i % 2 ? 1 - ribs : 1;
      for (let j = 0; j <= radial; j++) {
        const k = i * (radial + 1) + j; P.fromBufferAttribute(pos, k).sub(c).multiplyScalar(f).add(c); pos.setXYZ(k, P.x, P.y, P.z);
      }
    }
    g.computeVertexNormals();
  }
  return g;
}
/** Give a geometry a flat vertex colour (with optional lightness offset). */
function tint(g, hex, dl = 0) {
  const c = new THREE.Color(hex); if (dl) c.offsetHSL(0, 0, dl);
  const n = g.attributes.position.count, a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { a[i * 3] = c.r; a[i * 3 + 1] = c.g; a[i * 3 + 2] = c.b; }
  g.setAttribute('color', new THREE.BufferAttribute(a, 3)); return g;
}
/** Merge geometries into one mesh (keeps mesh counts low). */
function merge(geos, material, opts) {
  const list = geos.filter(Boolean);
  if (!list.length) return null;
  const non = list.some(g => !g.index);
  const norm = list.map(g => (non && g.index) ? g.toNonIndexed() : g);
  const names = Object.keys(norm[0].attributes).filter(n => norm.every(g => g.attributes[n]));
  norm.forEach(g => Object.keys(g.attributes).forEach(n => { if (!names.includes(n)) g.deleteAttribute(n); }));
  const m = new THREE.Mesh(mergeGeometries(norm, false), typeof material === 'string' ? mat(material, opts) : material);
  m.castShadow = true; m.receiveShadow = true; return m;
}
function mesh(g, material, opts) {
  const m = new THREE.Mesh(g, typeof material === 'string' ? mat(material, opts) : material);
  m.castShadow = true; m.receiveShadow = true; return m;
}
const VC = (opts = {}) => mat('#ffffff', { vertexColors: true, ...opts });
/** Invisible, slightly oversized click target. */
function hit(w, h, d, pos, rot = [0, 0, 0]) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat('#ffffff', { transparent: true, opacity: 0, depthWrite: false }));
  m.position.set(...pos); m.rotation.set(rot[0], rot[1], rot[2]); m.userData.hit = true; m.castShadow = false; m.receiveShadow = false;
  return m;
}
function add(g, ...objs) { objs.forEach(o => o && g.add(o)); return g; }
function T(obj, id) { if (obj) tag(obj, id); return obj; }
/** Sub-group whose axes are world-aligned after the engine tilts a roof component. */
function upright(pos = [0, 0, 0]) { const u = group('upright'); u.rotation.x = -ROOF_PITCH; u.position.set(...pos); return u; }

// ── textures (cached; canvas work happens once per page) ─────────────────────
const _tex = new Map();
function ctex(key, w, h, draw, repeat = false) {
  if (!_tex.has(key)) { const t = canvasTex(w, h, draw); if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping; _tex.set(key, t); }
  return _tex.get(key);
}
const _tm = new Map();
/** Cached textured material. tile = [metres per repeat u, v] for uvBox(). */
function tmat(key, texFn, opts = {}, tile = [1, 1]) {
  if (!_tm.has(key)) { const m = new THREE.MeshStandardMaterial({ map: texFn(), roughness: 0.9, ...opts }); m.userData.tile = tile; _tm.set(key, m); }
  return _tm.get(key);
}
/** Cached transparent decal material from a texture. */
function dmat(key, texFn, opts = {}) {
  return tmat('d:' + key, texFn, { transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, roughness: 0.95, ...opts });
}
function tdecal(w, h, material, pos, rot = [0, 0, 0]) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), material);
  m.position.set(...pos); m.rotation.set(rot[0], rot[1], rot[2]); m.receiveShadow = true; return m;
}
/** Rescale box UVs so a repeating texture tiles at real-world size. */
function uvBox(g, w, h, d, uw, uh = uw) {
  const uv = g.attributes.uv, sp = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) for (let i = 0; i < 4; i++) { const k = f * 4 + i; uv.setXY(k, uv.getX(k) * sp[f][0] / uw, uv.getY(k) * sp[f][1] / uh); }
  return g;
}
function tBoxG(w, h, d, material, pos, rot) {
  const [uw, uh] = material.userData.tile || [1, 1];
  return xf(uvBox(new THREE.BoxGeometry(w, h, d), w, h, d, uw, uh), pos, rot);
}
function tBox(w, h, d, material, pos, rot) { return mesh(tBoxG(w, h, d, material, pos, rot), material); }

function hsl(h, s, l) { return `hsl(${h},${s}%,${l}%)`; }
const brickMat = () => tmat('brick', () => ctex('brick', 512, 256, (g, w, h) => {
  const r = rng('brick'); g.fillStyle = '#b4ab9b'; g.fillRect(0, 0, w, h);
  const rows = 6, cols = 4, bh = h / rows, bw = w / cols, m = 4;
  const col = [...Array(rows)].map(() => [...Array(cols)].map(() => hsl(8 + r() * 12, 40 + r() * 18, 27 + r() * 13)));
  for (let row = 0; row < rows; row++) {
    const off = (row % 2) * bw / 2;
    for (let c = -1; c <= cols; c++) {
      g.fillStyle = col[row][(c + cols) % cols]; g.fillRect(c * bw + off + m / 2, row * bh + m / 2, bw - m, bh - m);
    }
  }
  for (let i = 0; i < 1400; i++) { g.fillStyle = `rgba(0,0,0,${r() * 0.18})`; g.fillRect(r() * w, r() * h, 2, 2); }
}, true), { roughness: 0.95 }, [0.8128, 0.4064]);
const rowlockMat = () => tmat('rowlock', () => ctex('rowlock', 256, 256, (g, w, h) => {
  const r = rng('rowlock'); g.fillStyle = '#b4ab9b'; g.fillRect(0, 0, w, h);
  const n = 8, bw = w / n;
  for (let i = 0; i < n; i++) { g.fillStyle = hsl(8 + r() * 12, 40 + r() * 15, 25 + r() * 12); g.fillRect(i * bw + 2, 2, bw - 4, h - 4); }
  for (let i = 0; i < 800; i++) { g.fillStyle = `rgba(0,0,0,${r() * 0.2})`; g.fillRect(r() * w, r() * h, 2, 2); }
}, true), { roughness: 0.95 }, [0.57, 0.2]);
const concreteMat = (key = 'concrete', base = '#b9b5ac') => tmat(key, () => ctex(key, 256, 256, (g, w, h) => {
  const r = rng(key); g.fillStyle = base; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 3000; i++) { const v = r(); g.fillStyle = v > 0.5 ? `rgba(255,255,255,${r() * 0.12})` : `rgba(0,0,0,${r() * 0.12})`; g.fillRect(r() * w, r() * h, 1 + r() * 2, 1); }
  g.strokeStyle = 'rgba(0,0,0,0.06)';
  for (let y = 0; y < h; y += 3) { g.beginPath(); g.moveTo(0, y + r()); g.lineTo(w, y + r() * 2); g.stroke(); }
}, true), { roughness: 0.95 }, [1, 1]);
const osbMat = () => tmat('osb', () => ctex('osb', 512, 512, (g, w, h) => {
  const r = rng('osb'); g.fillStyle = '#c7a26c'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 1600; i++) {
    g.save(); g.translate(r() * w, r() * h); g.rotate((r() - 0.5) * 1.2);
    g.fillStyle = hsl(30 + r() * 10, 35 + r() * 25, 45 + r() * 22); g.fillRect(-18 - r() * 18, -3, 36 + r() * 30, 5 + r() * 4); g.restore();
  }
}, true), { roughness: 0.95 }, [1.22, 1.22]);
const finMat = () => tmat('fins', () => ctex('fins', 128, 128, (g, w, h) => {
  g.fillStyle = '#4a4e52'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#7d8388'; for (let x = 0; x < w; x += 2) g.fillRect(x, 0, 1, h);
  g.fillStyle = '#1d1f21'; for (let x = 0; x < w; x += 16) g.fillRect(x, 0, 3, h); for (let y = 0; y < h; y += 16) g.fillRect(0, y, w, 3);
}, true), { roughness: 0.6, metalness: 0.4 }, [0.12, 0.12]);
const screenMat = () => tmat('screen', () => ctex('screen', 64, 64, (g, w, h) => {
  g.clearRect(0, 0, w, h); g.strokeStyle = '#3c3f42'; g.lineWidth = 2;
  for (let i = 0; i <= w; i += 8) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, h); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(w, i); g.stroke(); }
}, true), { transparent: true, alphaTest: 0.3, side: THREE.DoubleSide, metalness: 0.5, roughness: 0.5 }, [0.05, 0.05]);
/** Transparent crack texture: random branching dark lines. */
function crackMat(key, { color = '#120d0a', width = 3, branches = 5, chip = false } = {}) {
  return dmat('crack:' + key, () => ctex('crack:' + key, 256, 256, (g, w, h) => {
    const r = rng(key); g.clearRect(0, 0, w, h); g.strokeStyle = color; g.lineCap = 'round';
    const walk = (x, y, a, len, lw) => {
      g.lineWidth = lw; g.beginPath(); g.moveTo(x, y);
      for (let i = 0; i < len; i++) { a += (r() - 0.5) * 0.9; x += Math.cos(a) * 7; y += Math.sin(a) * 7; g.lineTo(x, y); if (lw > 1.2 && r() < 0.08) walk(x, y, a + (r() - 0.5) * 2, len / 3, lw * 0.6); }
      g.stroke();
    };
    for (let b = 0; b < branches; b++) walk(w / 2, h / 2, (b / branches) * PI * 2 + r(), 12 + r() * 10, width);
    if (chip) { g.fillStyle = color; g.beginPath(); for (let i = 0; i < 14; i++) { const a = (i / 14) * PI * 2, rr = (chip === true ? 26 : chip) * (0.7 + r() * 0.5); g.lineTo(w / 2 + Math.cos(a) * rr * 1.3, h / 2 + Math.sin(a) * rr); } g.closePath(); g.fill(); }
  }));
}
const hexRGB = (h) => [0, 1, 2].map(i => parseInt(h.slice(1 + i * 2, 3 + i * 2), 16));
/** Soft irregular blotch (mud, soot, rot, ghosts). */
const stainMat = (key, color, rings = 3, opacity = 0.85) => dmat('stain:' + key, () => ctex('stain:' + key, 256, 256, (c, w, h) => {
  const r = rng(key), [R, G, B] = hexRGB(color); c.clearRect(0, 0, w, h);
  for (let i = 0; i < 22; i++) {
    const x = w / 2 + (r() - 0.5) * w * 0.45, y = h / 2 + (r() - 0.5) * h * 0.45, rad = w * (0.1 + r() * 0.16);
    const gr = c.createRadialGradient(x, y, 0, x, y, rad); gr.addColorStop(0, `rgba(${R},${G},${B},${0.2 + r() * 0.2})`); gr.addColorStop(1, `rgba(${R},${G},${B},0)`);
    c.fillStyle = gr; c.fillRect(0, 0, w, h);
  }
  for (let i = 0; i < 500; i++) { const a = r() * PI * 2, d = Math.pow(r(), 1.6) * w * 0.38; c.fillStyle = `rgba(${R},${G},${B},${r() * 0.35})`; c.fillRect(w / 2 + Math.cos(a) * d, h / 2 + Math.sin(a) * d, 2, 2); }
}), { opacity });
/** Water stain with tide lines (kit style) for genuine water marks. */
const ringMat = (key, color, rings = 3, opacity = 0.85) => dmat('ring:' + key, () => stainTex(color, rings), { opacity });
/** Vertical run-down streaks (rust, water tracks). */
const streakMat = (key, color, opacity = 0.85) => dmat('streak:' + key, () => ctex('streak:' + key, 64, 256, (c, w, h) => {
  const r = rng(key), [R, G, B] = hexRGB(color); c.clearRect(0, 0, w, h);
  for (let i = 0; i < 9; i++) { const x = w * 0.3 + r() * w * 0.4, len = h * (0.5 + r() * 0.5), gr = c.createLinearGradient(0, 0, 0, len); gr.addColorStop(0, `rgba(${R},${G},${B},0.9)`); gr.addColorStop(1, `rgba(${R},${G},${B},0)`); c.fillStyle = gr; c.fillRect(x, 0, 2 + r() * 6, len); }
}), { opacity });
/** Dark felt / lower course showing through tab slots. */
function underlay(x0, x1, z0, z1, y = 0.0012) { return mesh(xf(new THREE.PlaneGeometry(x1 - x0, z1 - z0), [(x0 + x1) / 2, y, (z0 + z1) / 2], [-PI / 2, 0, 0]), '#1d1d20', { roughness: 0.95 }); }
function blotchMat(key, draw) { return dmat('blotch:' + key, () => ctex('blotch:' + key, 256, 256, (g, w, h) => { g.clearRect(0, 0, w, h); draw(g, w, h, rng(key)); })); }

// Lumber & palettes ------------------------------------------------------------
const LUM = '#b99266';          // aged SYP framing
const LUM_CUT = '#e2c595';      // fresh saw cut
const PT = '#9a9476';           // weathered pressure-treated
const ALU = { metalness: 0.6, roughness: 0.35 };
const GALV = { metalness: 0.55, roughness: 0.5 };
const DS = { side: THREE.DoubleSide };

/** 3-tab shingle tabs between x0..x1 and zTop..zBot (roof frame, +Z downslope). */
function shingleTabs(x0, x1, zTop, zBot, { exp = 5 * IN, seed = 'sh', base = C.shingle, jitter = 0.05, pick, y0 = 0 } = {}) {
  const r = rng(seed); const out = { main: [], alt: [], picked: [] };
  const tabW = 12 * IN, slot = 0.25 * IN, depth = exp + 0.035, th = 0.004, lift = Math.atan2(0.005, depth);
  let course = 0;
  for (let zb = zBot; zb > zTop + 0.015; zb -= exp, course++) {
    const start = x0 - ((course * 6 * IN) % tabW) - tabW;
    for (let xa = start; xa < x1; xa += tabW) {
      const a = Math.max(xa + slot / 2, x0), b = Math.min(xa + tabW - slot / 2, x1);
      if (b - a < 0.015) continue;
      const dz = Math.min(depth, zb - zTop);
      const g = gBox(b - a, th, dz, [(a + b) / 2, y0 + 0.0045, zb - dz / 2], [-lift, 0, 0]);
      const which = pick ? pick((a + b) / 2, zb, course) : null;
      tint(g, base, (r() - 0.5) * jitter);
      if (which === 'skip') continue;
      (which === 'alt' ? out.alt : which === 'pick' ? out.picked : out.main).push(g);
    }
  }
  return out;
}
/** Displaced fluffy insulation surface (vertex coloured). fn(x,z,y)->y lets callers sculpt it. */
function insulationGeo(w, d, depth, seg, seed, fn, color = C.insulation) {
  const g = new THREE.PlaneGeometry(w, d, Math.round(w * seg), Math.round(d * seg)); g.rotateX(-PI / 2);
  const r = rng(seed), pos = g.attributes.position, col = new Float32Array(pos.count * 3), base = new THREE.Color(color);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    let y = depth + (r() - 0.5) * 0.014 + 0.007 * Math.sin(x * 21 + z * 6) * Math.cos(z * 17 - x * 3);
    if (fn) y = fn(x, z, y);
    pos.setY(i, Math.max(0.002, y));
    const k = 0.82 + r() * 0.26; col[i * 3] = base.r * k; col[i * 3 + 1] = base.g * k; col[i * 3 + 2] = base.b * k;
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.computeVertexNormals(); return g;
}
/** Split an indexed geometry's faces by a predicate on face centroid (x,z) → [rest, matching]. */
function splitFaces(geo, pred) {
  const idx = geo.index.array, pos = geo.attributes.position, a = [], b = [];
  for (let i = 0; i < idx.length; i += 3) {
    const i0 = idx[i], i1 = idx[i + 1], i2 = idx[i + 2];
    const cx = (pos.getX(i0) + pos.getX(i1) + pos.getX(i2)) / 3, cz = (pos.getZ(i0) + pos.getZ(i1) + pos.getZ(i2)) / 3;
    (pred(cx, cz) ? b : a).push(i0, i1, i2);
  }
  const ga = geo.clone(); ga.setIndex(a); const gb = geo.clone(); gb.setIndex(b); return [ga, gb];
}
/** Terrain-ish plane with vertex colours: hfn(x,z)->y, cfn(x,z)->hex. */
function groundGeo(w, d, seg, hfn, cfn, seed = 'g') {
  const g = new THREE.PlaneGeometry(w, d, Math.max(1, Math.round(w * seg)), Math.max(1, Math.round(d * seg))); g.rotateX(-PI / 2);
  const r = rng(seed), pos = g.attributes.position, col = new Float32Array(pos.count * 3), c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i); pos.setY(i, hfn(x, z));
    c.set(cfn(x, z, r)); c.offsetHSL(0, 0, (r() - 0.5) * 0.06); col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.computeVertexNormals(); return g;
}
/** Bottom chords / joists: 2x4 on edge along Z at given x positions. */
function chordsG(xs, z0, z1, h = 3.5 * IN, w = 1.5 * IN, y0 = 0) {
  return xs.map(x => tint(gBox(w, h, z1 - z0, [x, y0 + h / 2, (z0 + z1) / 2]), LUM, (Math.sin(x * 9) * 0.04)));
}


// Rectangular segment (downspouts, rails): w along X, d along the other cross axis.
function gRect(a, b, w, d) {
  const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b);
  const g = new THREE.BoxGeometry(w, va.distanceTo(vb), d);
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), vb.clone().sub(va).normalize()));
  const c = va.add(vb).multiplyScalar(0.5); g.translate(c.x, c.y, c.z); return g;
}
/** Bend a geometry's vertices: fn(x,y,z) -> dy. */
function bend(g, fn) { const p = g.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, p.getY(i) + fn(p.getX(i), p.getY(i), p.getZ(i))); g.computeVertexNormals(); return g; }
/** Scatter of leaf planes (vertex coloured). */
function leavesG(n, seed, place, palette) {
  const r = rng(seed), out = [];
  for (let i = 0; i < n; i++) {
    const [x, y, z, s = 1] = place(r, i);
    const g = new THREE.PlaneGeometry(0.045 * s, 0.028 * s);
    xf(g, [x, y, z], [r() * PI * 2, r() * PI * 2, r() * PI * 2]);
    out.push(tint(g, palette[Math.floor(r() * palette.length)], (r() - 0.5) * 0.08));
  }
  return out;
}
const LEAF_DEAD = ['#7b5a2e', '#8f6a35', '#5e4423', '#a07a3b', '#6b5a2a', '#4f4a22'];
const LEAF_LIVE = ['#3f6b2a', '#4c7a31', '#355d24', '#5b8a3a', '#2f5420'];
const WHITE_AL = mat('#eeece6', { roughness: 0.45, metalness: 0.25 });

const ext = {
  // ── Grading: soil plane sloping away (ok) or toward the foundation (defect). House at −Z.
  'ext-grading': (states) => {
    const g = group('grading'); const bad = isDef(states, 'grading-slope');
    const W = 6, D = 3, zh = -D / 2, id = 'grading-slope';
    const hfn = (x, z) => {
      const t = (z - zh) / D;
      let y = bad ? 0.02 + 0.13 * Math.pow(t, 0.7) : 0.16 - 0.15 * t;
      if (bad) { const px = (x + 0.4) / 1.4, pz = (z - zh - 0.2) / 0.5, d = px * px + pz * pz; if (d < 1) y -= 0.04 * (1 - d); }
      return y + 0.006 * Math.sin(x * 5.3) * Math.cos(z * 4.1);
    };
    const cfn = (x, z, r) => (z - zh < 0.9 + Math.sin(x * 1.7) * 0.08) ? (r() < 0.3 ? '#4a2f1c' : C.mulch) : (r() < 0.25 ? '#6f9a47' : C.grass);
    add(g, T(mesh(groundGeo(W, D, 10, hfn, cfn, 'grade'), VC({ roughness: 1 })), id));
    // Brick foundation face (the house side of the strip).
    add(g, T(tBox(W, 0.5, 0.1, brickMat(), [0, 0.15, zh - 0.05]), id));
    // Landscape edging: a rigid line that makes the soil's tilt legible.
    const edge = [];
    for (let i = 0; i < 24; i++) { const x = -2.9 + i * 0.25, z = zh + 0.9 + Math.sin(x * 1.7) * 0.08; edge.push(gBox(0.25, 0.05, 0.012, [x, hfn(x, z) + 0.012, z])); }
    add(g, T(merge(edge, '#1d1d1d', { roughness: 0.6 }), id));
    // Boxwoods in the bed.
    const r = rng('box'), bush = [];
    for (const bx of [-2.1, 1.9]) for (let i = 0; i < 9; i++) bush.push(tint(gSph(0.17 + r() * 0.08, [bx + (r() - 0.5) * 0.35, 0.32 + r() * 0.12, zh + 0.45 + (r() - 0.5) * 0.25], [1, 0.8, 1], 7, 5), '#2f4f25', (r() - 0.5) * 0.08));
    add(g, merge(bush, VC({ roughness: 1 })));
    if (bad) {
      const pud = new THREE.Mesh(new THREE.CircleGeometry(1, 28), mat(C.water, { roughness: 0.05, metalness: 0.3, transparent: true, opacity: 0.82 }));
      pud.rotation.x = -PI / 2; pud.scale.set(1.25, 0.42, 1); pud.position.set(-0.4, 0.028, zh + 0.22); pud.receiveShadow = true;
      add(g, T(pud, id));
      // Wet line and mud splash on the brick.
      add(g, T(tdecal(2.8, 0.16, stainMat('wetbrick', '#2c2219', 2, 0.75), [-0.4, 0.1, zh + 0.002]), id));
    } else {
      add(g, T(tdecal(5.6, 0.04, stainMat('soilline', '#4b3a28', 1, 0.35), [0, 0.17, zh + 0.002]), id));
    }
    return g;
  },

  // ── Downspout with (ok) a 4–5 ft extension onto a splash block, or (defect) dumping at the wall.
  'ext-downspout': (states) => {
    const g = group('downspout'); const bad = isDef(states, 'downspout-discharge'); const id = 'downspout-discharge';
    const dw = 3 * IN, dd = 2 * IN, zc = 0.012 + dd / 2;
    const parts = [
      gBox(0.6, 0.003, 0.11, [0, 2.8, 0.06]), gBox(0.6, 0.12, 0.003, [0, 2.86, 0.004]), gBox(0.6, 0.1, 0.003, [0, 2.85, 0.116]),
      gBox(0.6, 0.006, 0.014, [0, 2.915, 0.112]), gBox(0.003, 0.12, 0.115, [0.3, 2.86, 0.06]),
      gRect([0, 2.8, 0.07], [0, 2.71, 0.07], dw, dd), gRect([0, 2.72, 0.07], [0, 2.55, zc], dw, dd),
      gRect([0, 2.56, zc], [0, 0.32, zc], dw, dd), gRect([0, 0.33, zc], [0, 0.13, zc + 0.15], dw, dd),
    ];
    for (const y of [2.3, 1.5, 0.75]) parts.push(gBox(dw + 0.01, 0.022, 0.006, [0, y, zc + dd / 2 + 0.003]), gBox(0.006, 0.022, dd + 0.01, [dw / 2 + 0.003, y, zc]), gBox(0.006, 0.022, dd + 0.01, [-dw / 2 - 0.003, y, zc]));
    const ds = T(merge(parts, WHITE_AL), id); add(g, ds);
    const hfn = (x, z) => {
      let y = 0.008 + 0.004 * Math.sin(x * 9 + z * 7);
      if (bad) { const d = (x * x) / 0.05 + ((z - 0.32) ** 2) / 0.06; if (d < 1) y = 0.003; else if (d < 1.6) y += 0.02 * (1.6 - d); }
      return y;
    };
    const cfn = (x, z, r) => {
      if (bad) { const d = (x * x) / 0.08 + ((z - 0.32) ** 2) / 0.1; if (d < 1) return r() < 0.3 ? '#8a7f6c' : '#2c1f14'; }
      return z < 0.35 ? (r() < 0.3 ? '#4a2f1c' : C.mulch) : (r() < 0.25 ? '#6f9a47' : C.grass);
    };
    const gp = groundGeo(0.9, 1.75, 24, hfn, cfn, 'dsground'); gp.translate(0, 0, 0.875);
    // groundGeo samples before translation, so re-sample with shifted z
    const pos = gp.attributes.position; for (let i = 0; i < pos.count; i++) pos.setY(i, hfn(pos.getX(i), pos.getZ(i)));
    gp.computeVertexNormals();
    add(g, T(mesh(gp, VC({ roughness: 1 })), id));
    if (bad) {
      add(g, T(tdecal(0.5, 0.4, stainMat('mud', '#4a3826', 3, 0.8), [0, 0.18, 0.003]), id));
      // The extension, kicked off by the mower, lying in the grass.
      const extn = mesh(gRect([0, 0, 0], [0, 0, 1.15], dw, dd), WHITE_AL); extn.rotation.set(0.04, 0.55, 0.12); extn.position.set(0.12, 0.03, 0.55);
      add(g, T(extn, id));
      const pebbles = []; const r = rng('peb');
      for (let i = 0; i < 18; i++) pebbles.push(tint(gSph(0.008 + r() * 0.01, [(r() - 0.5) * 0.3, 0.004 + r() * 0.004, 0.32 + (r() - 0.5) * 0.3], [1, 0.6, 1]), '#9c917e', (r() - 0.5) * 0.1));
      add(g, T(merge(pebbles, VC()), id));
    } else {
      add(g, T(mesh(gRect([0, 0.115, zc + 0.15], [0, 0.06, 1.42], dw, dd), WHITE_AL), id));
      const sb = [gBox(0.3, 0.035, 0.55, [0, 0.02, 1.38]), gBox(0.03, 0.02, 0.55, [-0.135, 0.045, 1.38]), gBox(0.03, 0.02, 0.55, [0.135, 0.045, 1.38])];
      add(g, T(merge(sb, concreteMat()), id));
    }
    return g;
  },

  // ── Front-eave gutter: always clogged (leaves, sludge, a sprouting seedling, tiger-striping, sag).
  'ext-gutter': () => {
    const g = group('gutter'); const id = 'gutter-debris'; const L = 4;
    const sag = (x) => -0.022 * (1 - Math.pow(x / (L / 2), 2));
    add(g, box(L, 0.19, 0.022, C.white, [0, 0.135, -0.011]));
    // Roof edge above: drip edge + first shingle courses (local roof frame tilted to pitch).
    add(g, mesh(gBox(L, 0.04, 0.0015, [0, 0.222, 0.0015]), WHITE_AL));
    const rf = group('roofedge'); rf.position.set(0, 0.243, 0); rf.rotation.x = ROOF_PITCH;
    const st = shingleTabs(-L / 2, L / 2, -0.24, 0.035, { seed: 'gut' }); add(rf, merge(st.main, VC({ roughness: 0.95 })), underlay(-L / 2, L / 2, -0.24, 0.035)); add(g, rf);
    const tr = [
      gBox(L, 0.12, 0.003, [0, 0.12, 0.006]), gBox(L, 0.003, 0.085, [0, 0.06, 0.048]),
      gRect([0, 0.06, 0.09], [0, 0.086, 0.11], L, 0.003),
      gBox(L, 0.04, 0.003, [0, 0.105, 0.11]), gRect([0, 0.125, 0.11], [0, 0.15, 0.126], L, 0.003),
      gBox(L, 0.027, 0.003, [0, 0.163, 0.127]), gBox(L, 0.006, 0.012, [0, 0.177, 0.122]),
      gBox(0.004, 0.118, 0.125, [L / 2, 0.119, 0.066]),
    ];
    // gRect with length axis along Y then rotated; for X-long pieces rebuild:
    tr[2] = xf(new THREE.BoxGeometry(L, 0.003, Math.hypot(0.02, 0.026)), [0, 0.073, 0.1], [-Math.atan2(0.026, 0.02), 0, 0]);
    tr[4] = xf(new THREE.BoxGeometry(L, 0.003, Math.hypot(0.016, 0.025)), [0, 0.1375, 0.118], [-Math.atan2(0.025, 0.016), 0, 0]);
    for (let x = -1.8; x <= 1.81; x += 0.6) tr.push(gBox(0.025, 0.004, 0.125, [x, 0.178, 0.066]), gCyl(0.004, 0.004, 0.006, [x, 0.168, 0.131], [PI / 2, 0, 0], 6));
    const gut = merge(tr, WHITE_AL); bend(gut.geometry, (x) => sag(x)); add(g, T(gut, id));
    // Sludge bed + standing water + leaves + twigs + seedling.
    const sl = gBox(L - 0.02, 0.018, 0.08, [0, 0.07, 0.048]); bend(sl, (x, y) => sag(x) + 0.006 * Math.sin(x * 7));
    add(g, T(mesh(sl, '#3b2b1b', { roughness: 1 }), id));
    const w = gBox(1.6, 0.002, 0.07, [0, 0.081, 0.05]); bend(w, (x) => sag(x));
    add(g, T(mesh(w, C.water, { roughness: 0.05, metalness: 0.3, transparent: true, opacity: 0.7 }), id));
    const lv = leavesG(520, 'gutleaf', (r) => { const x = (r() - 0.5) * (L - 0.1), hump = 0.035 * Math.max(0, Math.sin(x * 2.3 + 1)); return [x, 0.072 + r() * (0.085 + hump) + sag(x), 0.02 + r() * 0.085, 0.6 + r() * 0.5]; }, LEAF_DEAD);
    const r = rng('twig');
    for (let i = 0; i < 14; i++) { const x = (r() - 0.5) * 3.6, y = 0.09 + r() * 0.06 + sag(x); lv.push(tint(gPipe([x, y, 0.03 + r() * 0.07], [x + (r() - 0.5) * 0.25, y + r() * 0.04, 0.03 + r() * 0.07], 0.003, 5), '#4b3a28')); }
    add(g, T(merge(lv, VC({ side: THREE.DoubleSide, roughness: 1 })), id));
    const seed = [tint(gPipe([0.9, 0.08 + sag(0.9), 0.06], [0.92, 0.23 + sag(0.9), 0.07], 0.0025, 5), '#6a5a2c')];
    for (let i = 0; i < 4; i++) { const p = new THREE.PlaneGeometry(0.05, 0.04); xf(p, [0.9 + Math.cos(i * 1.6) * 0.025, 0.2 + i * 0.01 + sag(0.9), 0.07 + Math.sin(i * 1.6) * 0.025], [-1.1 + i * 0.3, i * 1.6, 0.3]); seed.push(tint(p, LEAF_LIVE[i % 5])); }
    add(g, T(merge(seed, VC({ side: THREE.DoubleSide })), id));
    // Tiger-striping: dark streaks where water has overflowed the front lip.
    const tig = dmat('tiger', () => ctex('tiger', 512, 64, (c, W, H) => {
      const rr = rng('tiger'); c.clearRect(0, 0, W, H);
      for (let i = 0; i < 70; i++) { const x = rr() * W, wd = 1 + rr() * 4, len = H * (0.4 + rr() * 0.6); const gr = c.createLinearGradient(0, 0, 0, len); gr.addColorStop(0, 'rgba(40,34,28,0.55)'); gr.addColorStop(1, 'rgba(40,34,28,0)'); c.fillStyle = gr; c.fillRect(x, 0, wd, len); }
    }), { opacity: 0.9 });
    const tg = tdecal(L, 0.09, tig, [0, 0.128, 0.1295]); bend(tg.geometry, (x) => sag(x)); add(g, T(tg, id));
    return g;
  },

  // ── Vinyl lap siding, buried in mulch at the bottom (always) and optionally holed (variable).
  'ext-siding': (states) => {
    const g = group('siding'); const bad = isDef(states, 'siding-damage');
    const W = 3, exp = 4 * IN, n = Math.ceil(2.4 / exp), r = rng('sid');
    const field = [], low = [];
    for (let i = 0; i < n; i++) {
      const yb = i * exp, h = exp + 0.012;
      const geo = tint(gBox(W, h, 0.01, [0, yb + h / 2, 0.012], [-0.11, 0, 0]), C.vinyl, (r() - 0.5) * 0.015);
      (i < 2 ? low : field).push(geo, tint(gBox(W, 0.005, 0.004, [0, yb + 0.003, 0.021]), '#7d776b'));
      if (i % 3 === 1) { const sx = -1.2 + ((i * 0.83) % 2.3); (i < 2 ? low : field).push(tint(gBox(0.006, exp, 0.005, [sx, yb + exp / 2, 0.021]), C.vinyl, -0.03)); }
    }
    field.push(tint(gBox(0.09, 2.4, 0.09, [W / 2 - 0.045, 1.2, 0.045]), C.vinyl, 0.02));
    add(g, T(merge(field, VC({ roughness: 0.6 })), 'siding-damage'));
    add(g, T(merge(low, VC({ roughness: 0.6 })), 'siding-soil-clearance'));
    // Mulch heaped against the wall, over the bottom course.
    const hfn = (x, z) => 0.14 * Math.pow(Math.max(0, 1 - (z + 0.2) / 0.42), 1.3) + 0.012 * Math.sin(x * 13) * Math.cos(z * 20) + 0.004;
    const mg = groundGeo(3.05, 0.42, 30, (x, z) => hfn(x, z), (x, z, rr) => rr() < 0.35 ? '#3e2716' : C.mulch, 'mulch');
    mg.translate(0, 0, 0.2); const mp = mg.attributes.position; for (let i = 0; i < mp.count; i++) mp.setY(i, hfn(mp.getX(i), mp.getZ(i) - 0.2)); mg.computeVertexNormals();
    const chips = [mg];
    for (let i = 0; i < 90; i++) { const x = (r() - 0.5) * 2.9, z = r() * 0.35; chips.push(tint(gBox(0.025 + r() * 0.03, 0.006, 0.012, [x, hfn(x, z - 0.2) + 0.003, z + 0.012], [r(), r() * 3, r()]), r() < 0.5 ? '#6a4527' : '#4a2f1c')); }
    chips.forEach(c => { if (!c.attributes.color) tint(c, C.mulch); });
    add(g, T(merge(chips, VC({ roughness: 1 })), 'siding-soil-clearance'));
    add(g, T(tdecal(2.9, 0.32, stainMat('splash', '#5a4630', 3, 0.55), [0, 0.3, 0.026]), 'siding-soil-clearance'));
    if (bad) {
      add(g, T(tdecal(0.3, 0.27, crackMat('sidhole', { color: '#141210', width: 2.5, branches: 6, chip: true }), [-0.6, 0.64, 0.027], [-0.11, 0, 0]), 'siding-damage'));
      add(g, T(box(0.05, 0.004, 0.03, C.vinyl, [-0.55, 0.12, 0.25]), 'siding-damage'));
    }
    return g;
  },

  // ── Double-hung vinyl window (exterior). Lower IGU fogged when the seal has failed.
  'ext-window': (states) => {
    const g = group('extwin'); const bad = isDef(states, 'window-igu-seal');
    const trim = [gBox(1.6, 0.09, 0.035, [0, 1.355, 0.0175]), gBox(0.09, 1.225, 0.035, [-0.755, 0.6975, 0.0175]), gBox(0.09, 1.225, 0.035, [0.755, 0.6975, 0.0175]),
      gBox(1.68, 0.045, 0.11, [0, 0.0625, 0.05], [0.08, 0, 0])];
    add(g, T(merge(trim, C.white, { roughness: 0.55 }), 'window-sill-caulk'));
    const fr = [gBox(0.03, 1.225, 0.06, [-0.695, 0.6975, 0.03]), gBox(0.03, 1.225, 0.06, [0.695, 0.6975, 0.03]), gBox(1.42, 0.03, 0.06, [0, 1.295, 0.03]), gBox(1.42, 0.035, 0.07, [0, 0.1, 0.04])];
    // Sashes: lower (front plane z≈0.05), upper (z≈0.025)
    const sash = (y0, y1, z) => [gBox(0.045, y1 - y0, 0.035, [-0.6575, (y0 + y1) / 2, z]), gBox(0.045, y1 - y0, 0.035, [0.6575, (y0 + y1) / 2, z]),
      gBox(1.36, 0.045, 0.035, [0, y1 - 0.0225, z]), gBox(1.36, 0.055, 0.035, [0, y0 + 0.0275, z])];
    const sashes = [...fr, ...sash(0.1175, 0.715, 0.055), ...sash(0.68, 1.28, 0.028)];
    add(g, T(merge(sashes, '#f6f5f0', { roughness: 0.5 }), 'window-igu-seal'));
    // IGU spacers (the tell that these are sealed units)
    const sp = [];
    const spacer = (y0, y1, z) => { const x0 = -0.635 + 0.004, x1 = 0.635 - 0.004; sp.push(gBox(x1 - x0, 0.007, 0.004, [0, y0 + 0.0035, z]), gBox(x1 - x0, 0.007, 0.004, [0, y1 - 0.0035, z]), gBox(0.007, y1 - y0, 0.004, [x0 + 0.0035, (y0 + y1) / 2, z]), gBox(0.007, y1 - y0, 0.004, [x1 - 0.0035, (y0 + y1) / 2, z])); };
    spacer(0.172, 0.693, 0.056); spacer(0.702, 1.258, 0.029);
    add(g, T(merge(sp, '#8a8f94', { metalness: 0.6, roughness: 0.4 }), 'window-igu-seal'));
    const glass = mat('#9db6c2', { roughness: 0.04, metalness: 0.35, transparent: true, opacity: 0.32 });
    const gl1 = new THREE.Mesh(new THREE.PlaneGeometry(1.27, 0.52), glass); gl1.position.set(0, 0.4325, 0.058);
    const gl2 = new THREE.Mesh(new THREE.PlaneGeometry(1.27, 0.555), glass); gl2.position.set(0, 0.98, 0.031);
    add(g, T(gl1, 'window-igu-seal'), T(gl2, 'window-igu-seal'));
    // Room behind: drawn curtain, dim.
    const cur = tmat('curtain', () => ctex('curtain', 256, 256, (c, W, H) => {
      const gr = c.createLinearGradient(0, 0, W, 0); for (let i = 0; i <= 12; i++) gr.addColorStop(i / 12, i % 2 ? '#4d463c' : '#2e2924'); c.fillStyle = gr; c.fillRect(0, 0, W, H);
    }), { roughness: 1 });
    add(g, tdecal(1.42, 1.2, cur, [0, 0.7, 0.004]));
    if (bad) {
      const fog = dmat('fog', () => ctex('fog', 256, 128, (c, W, H) => {
        const rr = rng('fog'); c.clearRect(0, 0, W, H);
        const gr = c.createRadialGradient(W * 0.45, H * 0.65, 10, W / 2, H / 2, W * 0.6); gr.addColorStop(0, 'rgba(235,238,236,0.85)'); gr.addColorStop(1, 'rgba(225,230,228,0.55)');
        c.fillStyle = gr; c.fillRect(0, 0, W, H);
        for (let i = 0; i < 260; i++) { c.fillStyle = `rgba(255,255,255,${0.2 + rr() * 0.5})`; c.beginPath(); c.arc(rr() * W, rr() * H, 0.6 + rr() * 1.8, 0, PI * 2); c.fill(); }
        for (let i = 0; i < 26; i++) { const x = rr() * W; c.fillStyle = 'rgba(150,140,120,0.35)'; c.fillRect(x, H * (0.3 + rr() * 0.3), 1.2, H * 0.6); }
      }), { opacity: 1, roughness: 0.6 });
      add(g, T(tdecal(1.26, 0.51, fog, [0, 0.4325, 0.0565]), 'window-igu-seal'));
    }
    // A scraped label ghost in the upper pane: someone stopped half way.
    add(g, tdecal(0.07, 0.04, mat('#ffffff', { transparent: true, opacity: 0.35, depthWrite: false }), [0.55, 0.78, 0.0315]));
    add(g, mesh(gBox(0.05, 0.012, 0.02, [0, 0.721, 0.066]), C.brass, { metalness: 0.6, roughness: 0.35 }));
    // Sealant beads at trim / siding and under the sill.
    const ck = [gPipe([-0.8, 0.09, 0.003], [-0.8, 1.4, 0.003], 0.005, 6), gPipe([0.8, 0.09, 0.003], [0.8, 1.4, 0.003], 0.005, 6), gPipe([-0.8, 1.4, 0.003], [0.8, 1.4, 0.003], 0.005, 6),
      gPipe([-0.84, 0.035, 0.004], [0.84, 0.035, 0.004], 0.005, 6)];
    add(g, T(merge(ck, '#f4f3ee', { roughness: 0.4 }), 'window-sill-caulk'));
    return g;
  },

  // ── Hose bib (sillcock). OK: vacuum-breaker cap on the spout. Defect: bare hose thread.
  'ext-hose-bib': (states) => {
    const g = group('hosebib'); const bad = isDef(states, 'hose-bib-backflow'); const id = 'hose-bib-backflow';
    const BR = mat(C.brass, { metalness: 0.65, roughness: 0.35 });
    const body = [gCyl(0.036, 0.036, 0.008, [0, 0.14, 0.004], [PI / 2, 0, 0], 16), gCyl(0.016, 0.016, 0.085, [0, 0.14, 0.05], [PI / 2, 0, 0]),
      gCyl(0.02, 0.02, 0.03, [0, 0.14, 0.075], [PI / 2, 0, 0]), gCyl(0.013, 0.013, 0.05, [0, 0.112, 0.08]), gCyl(0.006, 0.006, 0.02, [0, 0.14, 0.098], [PI / 2, 0, 0])];
    add(g, T(merge(body, BR), id));
    add(g, merge([gCyl(0.031, 0.031, 0.008, [0, 0.14, 0.11], [PI / 2, 0, 0], 16), gBox(0.058, 0.008, 0.006, [0, 0.14, 0.115]), gBox(0.008, 0.058, 0.006, [0, 0.14, 0.115])], '#a32b22', { roughness: 0.5 }));
    const th = []; for (let i = 0; i < 4; i++) th.push(xf(new THREE.TorusGeometry(0.0128, 0.0015, 4, 14), [0, 0.098 - i * 0.006, 0.08], [PI / 2, 0, 0]));
    add(g, T(merge(th, BR), id));
    if (!bad) {
      add(g, T(merge([gCyl(0.017, 0.017, 0.03, [0, 0.07, 0.08]), gCyl(0.019, 0.019, 0.006, [0, 0.087, 0.08])], BR), id));
      add(g, T(mesh(gCyl(0.0155, 0.0155, 0.012, [0, 0.0535, 0.08]), '#9aa1a8', { metalness: 0.7, roughness: 0.3 }), id));
      add(g, mesh(gCyl(0.002, 0.002, 0.008, [0.018, 0.074, 0.08], [0, 0, PI / 2], 6), C.steel, { metalness: 0.7 }));
    } else {
      add(g, T(mesh(new THREE.CircleGeometry(0.009, 12), C.black), id)); g.children.at(-1).rotation.x = PI / 2; g.children.at(-1).position.set(0, 0.0865, 0.08);
    }
    add(g, mesh(xf(new THREE.TorusGeometry(0.036, 0.003, 4, 20), [0, 0.14, 0.001]), C.white, { roughness: 0.4 }));
    add(g, hit(0.08, 0.14, 0.09, [0, 0.09, 0.08]));
    T(g.children.at(-1), id);
    return g;
  },

  // ── Service drop, weatherhead with drip loops, meter base, GEC. Tree limbs on the drop (defect).
  'ext-service-drop': () => {
    const g = group('servicedrop');
    const MB = mat('#a5acb1', { metalness: 0.5, roughness: 0.45 });
    // Meter base + meter
    const base = [gBox(0.28, 0.4, 0.11, [0, 1.5, 0.055]), gCyl(0.098, 0.098, 0.016, [0, 1.5, 0.118], [PI / 2, 0, 0], 24), gBox(0.06, 0.03, 0.04, [0, 1.285, 0.06])];
    add(g, T(merge(base, MB), 'meter-base'));
    const face = dmat('meterface', () => ctex('meterface', 256, 256, (c, W, H) => {
      c.fillStyle = '#f2f1ea'; c.beginPath(); c.arc(W / 2, H / 2, W / 2, 0, PI * 2); c.fill();
      c.strokeStyle = '#222'; c.lineWidth = 2;
      for (let i = 0; i < 5; i++) { const x = 40 + i * 44, y = 92; c.beginPath(); c.arc(x, y, 18, 0, PI * 2); c.stroke(); c.beginPath(); c.moveTo(x, y); c.lineTo(x + 12 * Math.cos(i * 1.3), y + 12 * Math.sin(i * 1.3)); c.stroke(); }
      c.fillStyle = '#222'; c.font = 'bold 20px sans-serif'; c.fillText('kWh', 104, 150); c.font = '14px sans-serif'; c.fillText('CL200  240V  3W', 70, 175); c.fillStyle = '#111'; c.fillRect(60, 190, 136, 8);
    }), { opacity: 1 });
    add(g, T(tdecal(0.15, 0.15, face, [0, 1.5, 0.13]), 'meter-base'));
    const dome = mesh(gCyl(0.083, 0.083, 0.12, [0, 1.5, 0.186], [PI / 2, 0, 0], 24, true), mat('#dfe8ea', { transparent: true, opacity: 0.25, roughness: 0.05, metalness: 0.2, side: THREE.DoubleSide }));
    const cap = mesh(xf(new THREE.SphereGeometry(0.083, 20, 8, 0, PI * 2, 0, PI / 2), [0, 1.5, 0.246], [PI / 2, 0, 0], [1, 0.35, 1]), mat('#dfe8ea', { transparent: true, opacity: 0.25, roughness: 0.05, side: THREE.DoubleSide }));
    add(g, T(dome, 'meter-base'), T(cap, 'meter-base'));
    add(g, T(mesh(gBox(0.012, 0.03, 0.006, [0.09, 1.42, 0.13]), '#d8c13a'), 'meter-base'));
    // Mast + straps + weatherhead
    const GV = mat(C.galv, GALV);
    const mast = [gCyl(0.03, 0.03, 1.55, [0, 2.47, 0.05]), gBox(0.08, 0.02, 0.02, [0, 2.3, 0.05]), gBox(0.08, 0.02, 0.02, [0, 2.95, 0.05]),
      gCyl(0.042, 0.035, 0.06, [0, 3.26, 0.05]), gCyl(0.055, 0.055, 0.035, [0, 3.305, 0.05]), xf(new THREE.SphereGeometry(0.055, 14, 6, 0, PI * 2, 0, PI / 2), [0, 3.322, 0.05], [0, 0, 0], [1, 0.5, 1])];
    add(g, T(merge(mast, GV), 'service-drip-loop'));
    // Triplex: messenger + 2 twisted phase conductors along a sagging span into the tree.
    const S = new THREE.Vector3(0.36, 3.3, 0.09), E = new THREE.Vector3(1.55, 3.82, 1.55), up = new THREE.Vector3(0, 1, 0);
    const dir = E.clone().sub(S).normalize(), u = new THREE.Vector3().crossVectors(dir, up).normalize(), v = new THREE.Vector3().crossVectors(u, dir);
    const P = (t) => S.clone().lerp(E, t).add(new THREE.Vector3(0, -0.12 * Math.sin(PI * t), 0));
    const span = (phase, rad) => { const pts = []; for (let i = 0; i <= 40; i++) { const t = i / 40, p = P(t); if (rad) p.add(u.clone().multiplyScalar(Math.cos(t * 30 + phase) * rad)).add(v.clone().multiplyScalar(Math.sin(t * 30 + phase) * rad)); pts.push(p.toArray()); } return pts; };
    const drop = [tint(gTube(span(0, 0), 0.006, 60, 6), '#a9adb0'), tint(gTube(span(0, 0.012), 0.007, 80, 6), '#16171a'), tint(gTube(span(PI, 0.012), 0.007, 80, 6), '#16171a')];
    // Insulator on the wall
    drop.push(tint(gBox(0.03, 0.05, 0.05, [0.36, 3.3, 0.025]), '#7c8186'), tint(gCyl(0.018, 0.018, 0.04, [0.36, 3.3, 0.07], [0, 0, 0], 10), '#d9d4c7'));
    add(g, T(merge(drop, VC({ roughness: 0.5 })), 'service-drop-clearance'));
    // Drip loops: conductors leave the weatherhead downward, loop below it, rise to the splices.
    const loops = [];
    [-0.022, 0, 0.022].forEach((dx, i) => {
      const col = i === 1 ? '#a9adb0' : '#16171a';
      loops.push(tint(gTube([[dx, 3.285, 0.05 + dx * 0.4], [dx + 0.02, 3.12, 0.08], [0.1 + i * 0.03, 3.0 - i * 0.01, 0.1], [0.24 + i * 0.03, 3.08, 0.1], [0.31 + i * 0.012, 3.2, 0.095], [0.355 + (i - 1) * 0.008, 3.29, 0.09]], 0.0075, 40, 6), col));
      if (i !== 1) loops.push(tint(gCyl(0.012, 0.012, 0.05, [0.3 + i * 0.012, 3.185, 0.096], [0, 0, 0.4]), '#0f0f10'));
    });
    add(g, T(merge(loops, VC({ roughness: 0.5 })), 'service-drip-loop'));
    add(g, T(hit(0.5, 0.4, 0.2, [0.15, 3.15, 0.1]), 'service-drip-loop'));
    // Grounding electrode conductor + rod
    add(g, T(merge([gTube([[0.1, 1.3, 0.03], [0.1, 0.9, 0.012], [0.11, 0.4, 0.012], [0.12, 0.05, 0.03]], 0.0028, 20, 5), gCyl(0.008, 0.008, 0.08, [0.12, 0.0, 0.035]), gBox(0.025, 0.02, 0.025, [0.12, 0.035, 0.035])], C.copper, { metalness: 0.6, roughness: 0.4 }), 'meter-base'));
    // Tree limb resting on the drop, leaves swallowing the far end.
    const limb = [tint(gTube([[2.0, 3.0, 1.4], [1.5, 3.3, 1.15], [1.05, 3.5, 0.9], [0.68, 3.57, 0.72]], 0.04, 30, 8), '#4a3b2c'),
      tint(gTube([[1.05, 3.5, 0.9], [0.86, 3.43, 0.5], [0.72, 3.48, 0.38]], 0.016, 16, 6), '#4a3b2c'),
      tint(gTube([[1.5, 3.3, 1.15], [1.35, 3.6, 1.5], [1.25, 3.95, 1.6]], 0.022, 16, 6), '#4a3b2c'),
      tint(gTube([[0.68, 3.57, 0.72], [0.58, 3.52, 0.62], [0.5, 3.47, 0.5]], 0.012, 10, 5), '#4a3b2c')];
    const tips = [[0.52, 3.47, 0.52, 0.18, 70], [0.74, 3.47, 0.38, 0.16, 60], [1.5, 3.85, 1.55, 0.35, 160], [1.15, 3.6, 1.0, 0.22, 70], [1.25, 3.95, 1.6, 0.25, 80]];
    const lv = [];
    tips.forEach(([x, y, z, rad, n], k) => lv.push(...leavesG(n, 'drop' + k, (r) => [x + (r() - 0.5) * 2 * rad, y + (r() - 0.5) * 1.4 * rad, z + (r() - 0.5) * 2 * rad, 1.5 + r()], LEAF_LIVE)));
    add(g, T(merge(limb, VC({ roughness: 1 })), 'service-drop-clearance'), T(merge(lv, VC({ side: THREE.DoubleSide, roughness: 0.9 })), 'service-drop-clearance'));
    add(g, T(hit(0.5, 0.35, 0.5, [0.75, 3.48, 0.65]), 'service-drop-clearance'));
    return g;
  },

  // ── A/C condenser on its pad, line set (suction foam missing), disconnect + whip.
  'ext-ac-condenser': (states) => {
    const g = group('condenser'); const bad = isDef(states, 'condenser-level');
    const wall = -0.45;
    // Gravel bed (with an eroded void under the low corner when not level)
    const hfn = (x, z) => { let y = 0.006 + 0.004 * Math.sin(x * 31) * Math.cos(z * 27); if (bad) { const d = ((x + 0.38) ** 2 + (z - 0.38) ** 2) / 0.05; if (d < 1) y -= 0.05 * (1 - d); } return y; };
    const gb = groundGeo(1.0, 0.95, 30, hfn, (x, z, r) => { if (bad && ((x + 0.38) ** 2 + (z - 0.38) ** 2) < 0.04) return '#2d2016'; return r() < 0.5 ? '#8f8a80' : '#6e6a62'; }, 'gravel');
    gb.translate(0, 0, 0.02); add(g, T(mesh(gb, VC({ roughness: 1 })), 'condenser-level'));
    const P = group('padunit'); P.position.set(0.41, 0, -0.39);
    if (bad) P.rotation.set(0.085, 0, 0.1);
    const off = (x, y, z) => [x - 0.41, y, z + 0.39];
    add(P, T(tBox(0.82, 0.07, 0.82, concreteMat('pad', '#a3a199'), off(0, 0.035, 0.02)), 'condenser-level'));
    const CAB = '#c7c2b6';
    const U = group('unit'); U.position.set(...off(0, 0.07, 0.02));
    add(U, T(mesh(gBox(0.72, 0.06, 0.72, [0, 0.03, 0]), '#3b3f42'), 'condenser-level'));
    add(U, T(tBox(0.7, 0.56, 0.7, finMat(), [0, 0.34, 0]), 'condenser-level'));
    const posts = [], lid = [];
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) posts.push(gBox(0.045, 0.6, 0.045, [sx * 0.34, 0.33, sz * 0.34]));
    lid.push(gBox(0.74, 0.035, 0.08, [0, 0.645, 0.33]), gBox(0.74, 0.035, 0.08, [0, 0.645, -0.33]), gBox(0.08, 0.035, 0.58, [0.33, 0.645, 0]), gBox(0.08, 0.035, 0.58, [-0.33, 0.645, 0]));
    posts.push(gBox(0.2, 0.32, 0.02, [0.18, 0.4, -0.355]));      // service panel on the back-right
    add(U, T(merge([...posts, ...lid], CAB, { roughness: 0.6 }), 'condenser-level'));
    add(U, mesh(xf(new THREE.CircleGeometry(0.29, 24), [0, 0.6, 0], [-PI / 2, 0, 0]), '#16181a'));
    const blades = [gCyl(0.05, 0.05, 0.05, [0, 0.62, 0])]; for (let i = 0; i < 3; i++) blades.push(gBox(0.22, 0.004, 0.09, [Math.cos(i * 2.09) * 0.14, 0.615, Math.sin(i * 2.09) * 0.14], [0.25, -i * 2.09, 0]));
    add(U, merge(blades, '#222427'));
    const guard = dmat('fanguard', () => ctex('fanguard', 256, 256, (c, W, H) => {
      c.clearRect(0, 0, W, H); c.strokeStyle = '#1b1c1e'; c.lineWidth = 2.2;
      for (let r = 18; r < W / 2; r += 9) { c.beginPath(); c.arc(W / 2, H / 2, r, 0, PI * 2); c.stroke(); }
      c.lineWidth = 3; for (let i = 0; i < 8; i++) { c.beginPath(); c.moveTo(W / 2, H / 2); c.lineTo(W / 2 + Math.cos(i * PI / 4) * W / 2, H / 2 + Math.sin(i * PI / 4) * H / 2); c.stroke(); }
    }), { opacity: 1, alphaTest: 0.3, side: THREE.DoubleSide, metalness: 0.4 });
    add(U, tdecal(0.58, 0.58, guard, [0, 0.666, 0], [-PI / 2, 0, 0]));
    const plate = dmat('acplate', () => textTex(['CONDENSING UNIT', 'R-410A  2.5 TON', 'MFD 06/2016', '208/230V 1PH'], { w: 256, h: 128, font: 'bold 20px monospace', bg: '#e9e6dc' }), { opacity: 1 });
    add(U, tdecal(0.13, 0.065, plate, [0.351, 0.5, 0.15], [0, PI / 2, 0]));
    const VALVE = mat(C.brass, { metalness: 0.6, roughness: 0.35 });
    add(U, merge([gCyl(0.014, 0.014, 0.06, [0.37, 0.17, -0.29], [0, 0, PI / 2]), gCyl(0.009, 0.009, 0.05, [0.37, 0.12, -0.21], [0, 0, PI / 2])], VALVE));
    add(P, U); add(g, P);
    P.updateMatrixWorld(true);
    const wp = (x, y, z) => U.localToWorld(new THREE.Vector3(x, y, z)).toArray();
    const sv = wp(0.4, 0.17, -0.29), lv = wp(0.395, 0.12, -0.21), inlet = wp(0.3, 0.3, -0.36);
    // Line set into the wall
    const sPath = [sv, [sv[0] + 0.06, sv[1] + 0.01, sv[2] - 0.02], [0.47, 0.22, -0.36], [0.46, 0.38, wall + 0.03], [0.44, 0.42, wall - 0.02]];
    const lPath = [lv, [lv[0] + 0.05, lv[1], lv[2] - 0.03], [0.505, 0.2, -0.33], [0.5, 0.36, wall + 0.03], [0.48, 0.4, wall - 0.02]];
    const ls = [tint(gTube(lPath, 0.005, 30, 6), C.copper), tint(gSph(0.04, [0.46, 0.41, wall], [1, 0.8, 0.35]), '#8b8a85')];
    {
      // Suction line: foam gone except a few UV-shredded remnants; copper sweating.
      ls.push(tint(gTube(sPath, 0.011, 40, 8), C.copper));
      const curve = new THREE.CatmullRomCurve3(sPath.map(p => new THREE.Vector3(...p)));
      const rem = [[0.0, 0.12], [0.55, 0.62], [0.86, 0.97]];
      rem.forEach(([a, b]) => { const pts = []; for (let i = 0; i <= 6; i++) pts.push(curve.getPointAt(a + (b - a) * i / 6).toArray()); ls.push(tint(gTube(pts, 0.021, 14, 8, 0.25), '#1c1c1c')); });
      const rr = rng('sweat');
      for (let i = 0; i < 26; i++) { const p = curve.getPointAt(0.15 + rr() * 0.38); ls.push(tint(gSph(0.0028, [p.x + (rr() - 0.5) * 0.02, p.y - 0.01, p.z + (rr() - 0.5) * 0.02], [1, 1.3, 1], 6, 4), '#cfe3ec')); }
      for (let i = 0; i < 9; i++) ls.push(tint(gBox(0.02, 0.003, 0.012, [0.3 + rr() * 0.15, 0.075, 0.25 + rr() * 0.15], [0, rr() * 3, 0]), '#1c1c1c'));
    }
    add(g, T(merge(ls, VC({ roughness: 0.4, metalness: 0.3 })), 'condenser-line-insulation'));
    add(g, T(hit(0.14, 0.32, 0.22, [0.46, 0.26, -0.34]), 'condenser-line-insulation'));
    // Disconnect on the wall + liquidtight whip to the unit
    const DC = mat('#7f8589', { metalness: 0.4, roughness: 0.5 });
    add(g, T(merge([gBox(0.17, 0.26, 0.09, [-0.16, 0.95, wall + 0.045]), gBox(0.12, 0.05, 0.02, [-0.16, 0.97, wall + 0.1]), gCyl(0.012, 0.012, 0.12, [-0.16, 1.13, wall + 0.035])], DC), 'condenser-disconnect'));
    add(g, T(mesh(gTube([[-0.16, 0.82, wall + 0.05], [-0.12, 0.6, wall + 0.05], [0.1, 0.42, wall + 0.04], [inlet[0] - 0.05, inlet[1] + 0.03, inlet[2] - 0.03], inlet], 0.011, 50, 8, 0.12), '#6e7378', { roughness: 0.6 }), 'condenser-disconnect'));
    const lab = dmat('dclab', () => textTex(['A/C DISCONNECT', '30A  240V'], { w: 256, h: 96, bg: '#d33', fg: '#fff', font: 'bold 26px sans-serif' }), { opacity: 1 });
    add(g, T(tdecal(0.1, 0.035, lab, [-0.16, 1.03, wall + 0.0905]), 'condenser-disconnect'));
    return g;
  },

  // ── Exterior GFCI in a while-in-use bubble cover whose lid has broken off its hinge (always).
  'ext-receptacle': () => {
    const g = group('extrecept');
    const GR = mat('#8e9195', { roughness: 0.6 });
    add(g, mesh(gBox(0.078, 0.125, 0.05, [0, 0.125, 0.025]), GR));
    const fr = [gBox(0.125, 0.025, 0.008, [0, 0.2, 0.054]), gBox(0.125, 0.025, 0.008, [0, 0.05, 0.054]), gBox(0.025, 0.125, 0.008, [-0.05, 0.125, 0.054]), gBox(0.025, 0.125, 0.008, [0.05, 0.125, 0.054]),
      gCyl(0.005, 0.005, 0.02, [-0.03, 0.214, 0.06], [0, 0, PI / 2], 8), gCyl(0.005, 0.005, 0.009, [0.033, 0.214, 0.06], [0, 0, PI / 2], 8)];
    add(g, T(merge(fr, GR), 'ext-receptacle-cover'));
    const gf = dmat('gfciface', () => ctex('gfciface', 128, 192, (c, W, H) => {
      c.fillStyle = '#f2f0e8'; c.fillRect(0, 0, W, H);
      const outlet = (y) => { c.fillStyle = '#e6e3d8'; c.fillRect(22, y, 84, 52); c.fillStyle = '#1b1b1b'; c.fillRect(42, y + 12, 6, 20); c.fillRect(80, y + 12, 6, 24); c.beginPath(); c.arc(64, y + 42, 6, PI, 0); c.fill(); };
      outlet(10); outlet(130);
      c.fillStyle = '#2a2a2a'; c.font = 'bold 13px sans-serif'; c.fillText('TEST', 18, 100); c.fillText('RESET', 70, 100);
    }), { opacity: 1, roughness: 0.4 });
    add(g, T(tdecal(0.066, 0.104, gf, [0, 0.125, 0.0565]), 'ext-gfci'));
    add(g, T(merge([gBox(0.068, 0.106, 0.006, [0, 0.125, 0.053]), gBox(0.018, 0.009, 0.006, [-0.014, 0.125, 0.058]), gBox(0.018, 0.009, 0.006, [0.016, 0.125, 0.058])], '#f2f0e8', { roughness: 0.4 }), 'ext-gfci'));
    add(g, T(hit(0.075, 0.11, 0.03, [0, 0.125, 0.06]), 'ext-gfci'));
    // The bubble lid, snapped at one hinge, hanging askew.
    const LID = mat('#9fa3a6', { transparent: true, opacity: 0.6, roughness: 0.3, side: THREE.DoubleSide });
    const lid = group('lid'); lid.position.set(0.033, 0.214, 0.062); lid.rotation.set(0.5, 0.45, 0.62);
    const sh = [gBox(0.11, 0.15, 0.003, [-0.033, -0.075, 0.064]), gBox(0.003, 0.15, 0.064, [-0.088, -0.075, 0.032]), gBox(0.003, 0.15, 0.064, [0.022, -0.075, 0.032]), gBox(0.11, 0.003, 0.064, [-0.033, 0.0, 0.032])];
    add(lid, T(merge(sh, LID), 'ext-receptacle-cover'));
    add(lid, T(tdecal(0.09, 0.12, crackMat('lidcrack', { color: '#e8e8e8', width: 1.6, branches: 4 }), [-0.04, -0.07, 0.0662]), 'ext-receptacle-cover'));
    add(g, lid);
    add(g, T(hit(0.14, 0.12, 0.08, [0.06, 0.2, 0.11]), 'ext-receptacle-cover'));
    add(g, tdecal(0.02, 0.035, mat('#d8cdb3', { transparent: true, opacity: 0.8, depthWrite: false }), [0.031, 0.08, 0.0505]));
    return g;
  },

  // ── Brick front steps, 4 equal 7.4" risers, no handrail (a removed rail left its anchor bolts).
  'ext-front-steps': () => {
    const g = group('frontsteps'); const BW = 1.5, R = 0.1875, run = 0.27;
    const fronts = [-0.1, 0.17, 0.44, 0.71];        // landing front, then each tread's nosing line
    const body = [tBoxG(BW, 0.72, 0.7, brickMat(), [0, 0.36, -0.45])];
    for (let k = 3; k >= 1; k--) { const top = k * R - 0.03; const z0 = fronts[3 - k], z1 = fronts[4 - k]; body.push(tBoxG(BW, top, z1 - z0, brickMat(), [0, top / 2, (z0 + z1) / 2])); }
    add(g, T(merge(body, brickMat()), 'steps-riser-height'));
    const caps = [tBoxG(BW + 0.06, 0.03, 0.725, rowlockMat(), [0, 0.735, -0.4375])];
    for (let k = 3; k >= 1; k--) { const z0 = fronts[3 - k], z1 = fronts[4 - k] + 0.025; caps.push(tBoxG(BW + 0.06, 0.03, z1 - z0, rowlockMat(), [0, k * R - 0.015, (z0 + z1) / 2])); }
    add(g, T(merge(caps, rowlockMat()), 'steps-riser-height'));
    add(g, box(0.75, 0.012, 0.45, '#8a6a3c', [0, 0.756, -0.5]));
    // Ghost of a removed rail: anchor bolts and a lighter square where the post base sat.
    const RU = mat(C.rust, { roughness: 0.8, metalness: 0.3 });
    const studs = [];
    for (const [x, y, z] of [[0.68, 0.75, -0.2], [0.68, R, 0.62]]) {
      studs.push(gCyl(0.006, 0.006, 0.022, [x - 0.025, y + 0.011, z - 0.025]), gCyl(0.006, 0.006, 0.018, [x + 0.025, y + 0.009, z + 0.025]), gCyl(0.006, 0.006, 0.02, [x + 0.025, y + 0.01, z - 0.025]));
      add(g, T(tdecal(0.11, 0.11, stainMat('ghost' + z, '#d9cbb4', 1, 0.55), [x, y + 0.0015, z], [-PI / 2, 0, 0]), 'steps-handrail'));
    }
    add(g, T(merge(studs, RU), 'steps-handrail'));
    add(g, T(tdecal(0.05, 0.22, streakMat('ruststreak', '#7a3f1d', 0.6), [0.69, 0.62, -0.099]), 'steps-handrail'));
    const L = Math.hypot(0.81, 0.5625), ang = Math.atan2(0.5625, 0.81);
    for (const sx of [-1, 1]) add(g, T(hit(0.16, 0.45, L + 0.3, [sx * 0.72, (R + 0.75) / 2 + 0.75, 0.3], [ang, 0, 0]), 'steps-handrail'));
    return g;
  },

  // ── Driveway slab: control joints, hairline shrinkage cracks (normal), an oil stain.
  'ext-driveway': () => {
    const g = group('driveway'); const id = 'driveway-cracks';
    const top = concreteMat('drive', '#bab6ad'), side = mat(C.concrete);
    const sl = new THREE.Mesh(uvBox(new THREE.BoxGeometry(5, 0.1, 8), 5, 0.1, 8, 1, 1), [side, side, top, side, side, side]);
    sl.position.y = 0.05; sl.receiveShadow = true; add(g, T(sl, id));
    const J = mat('#3e3c39', { transparent: true, opacity: 0.85, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
    for (const z of [-1.333, 1.333]) add(g, T(tdecal(5, 0.008, J, [0, 0.1005, z], [-PI / 2, 0, 0]), id));
    add(g, T(tdecal(0.008, 8, J, [0, 0.1005, 0], [-PI / 2, 0, 0]), id));
    add(g, T(tdecal(5, 0.016, J, [0, 0.1005, -3.985], [-PI / 2, 0, 0]), id));
    [[1.2, -2.4, 'c1', 0.9], [-1.6, 0.6, 'c2', 0.8], [0.6, 2.7, 'c3', 1.0], [-0.4, -0.9, 'c4', 0.7]].forEach(([x, z, k, s]) =>
      add(g, T(tdecal(s, s, crackMat('drive' + k, { color: '#4a4640', width: 1.2, branches: 2 }), [x, 0.101, z], [-PI / 2, 0, (x * 3) % PI]), id)));
    add(g, tdecal(0.7, 0.55, stainMat('oil', '#2b2622', 3, 0.7), [0.95, 0.1012, -3.0], [-PI / 2, 0, 0.4]));
    return g;
  },

  // ── Crawlspace access door + screened foundation vent in the brick curtain wall (both fine).
  'ext-crawl-access': () => {
    const g = group('crawlaccess'); const id = 'crawl-door'; const B = brickMat();
    const bk = [tBoxG(1.0, 0.1, 0.1, B, [0, 0.05, 0.05]), tBoxG(1.0, 0.08, 0.1, B, [0, 0.56, 0.05]), tBoxG(0.06, 0.42, 0.1, B, [-0.47, 0.31, 0.05]),
      tBoxG(0.08, 0.42, 0.1, B, [0.21, 0.31, 0.05]), tBoxG(0.22, 0.15, 0.1, B, [0.36, 0.175, 0.05]), tBoxG(0.22, 0.09, 0.1, B, [0.36, 0.475, 0.05]), tBoxG(0.03, 0.42, 0.1, B, [0.485, 0.31, 0.05])];
    add(g, T(merge(bk, B), id));
    add(g, merge([gBox(0.61, 0.42, 0.01, [-0.135, 0.31, 0.01]), gBox(0.22, 0.18, 0.01, [0.36, 0.34, 0.01])], '#0b0b0b'));
    const fr = [gBox(0.61, 0.035, 0.03, [-0.135, 0.5025, 0.085]), gBox(0.61, 0.035, 0.03, [-0.135, 0.1175, 0.085]), gBox(0.035, 0.35, 0.03, [-0.4225, 0.31, 0.085]), gBox(0.035, 0.35, 0.03, [0.1525, 0.31, 0.085])];
    add(g, T(merge(fr, PT), id));
    add(g, T(box(0.53, 0.34, 0.018, '#66705f', [-0.135, 0.31, 0.095]), id));
    add(g, T(merge([gBox(0.05, 0.012, 0.006, [-0.36, 0.43, 0.107]), gBox(0.05, 0.012, 0.006, [-0.36, 0.19, 0.107]), gTube([[0.06, 0.27, 0.105], [0.07, 0.27, 0.125], [0.07, 0.35, 0.125], [0.06, 0.35, 0.105]], 0.004, 12, 5),
      gBox(0.018, 0.045, 0.012, [0.17, 0.31, 0.106])], C.black, { roughness: 0.5 }), id));
    const louv = []; for (let i = 0; i < 5; i++) louv.push(gBox(0.2, 0.004, 0.03, [0.36, 0.27 + i * 0.033, 0.07], [0.6, 0, 0]));
    louv.push(gBox(0.22, 0.012, 0.012, [0.36, 0.425, 0.095]), gBox(0.22, 0.012, 0.012, [0.36, 0.255, 0.095]), gBox(0.012, 0.18, 0.012, [0.255, 0.34, 0.095]), gBox(0.012, 0.18, 0.012, [0.465, 0.34, 0.095]));
    add(g, T(merge(louv, C.galv, GALV), id));
    add(g, T(tdecal(0.2, 0.16, screenMat(), [0.36, 0.34, 0.088]), id));
    return g;
  },

  // ── Aluminium extension ladder leaning at ~75°, the portal to the roof (no checkpoints).
  'ext-ladder': () => {
    const g = group('ladder');
    const L = Math.hypot(0.88, 3.6), ang = Math.atan2(0.88, 3.6);
    const fr = group('frame'); fr.position.set(0, 0, 0.82); fr.rotation.x = -ang;
    const AL = mat('#c9ced2', ALU);
    const rails = [], rungs = [];
    const section = (x, z, y0, y1) => {
      rails.push(gBox(0.022, y1 - y0, 0.075, [-x, (y0 + y1) / 2, z]), gBox(0.022, y1 - y0, 0.075, [x, (y0 + y1) / 2, z]));
      for (let y = y0 + 0.2; y < y1 - 0.08; y += 0.3) rungs.push(gCyl(0.016, 0.016, 2 * x, [0, y, z], [0, 0, PI / 2], 8));
    };
    section(0.21, 0, 0.05, 2.35); section(0.185, 0.085, 1.35, L);
    add(fr, merge(rails, AL), merge(rungs, mat('#b8bec3', ALU)));
    const dark = [gBox(0.06, 0.05, 0.11, [-0.21, 0.03, 0.01]), gBox(0.06, 0.05, 0.11, [0.21, 0.03, 0.01]), gBox(0.03, 0.06, 0.04, [-0.185, 1.45, 0.04]), gBox(0.03, 0.06, 0.04, [0.185, 1.45, 0.04]),
      gBox(0.03, 0.05, 0.05, [-0.185, L - 0.02, 0.085]), gBox(0.03, 0.05, 0.05, [0.185, L - 0.02, 0.085]), gCyl(0.03, 0.03, 0.02, [0, 2.25, 0.0], [0, 0, PI / 2], 12)];
    add(fr, merge(dark, '#2a2b2d', { roughness: 0.7 }));
    add(fr, mesh(gTube([[0, 2.25, 0.03], [0.02, 1.8, 0.05], [0.04, 1.0, 0.06], [0.05, 0.4, 0.045]], 0.005, 24, 5), '#d9c48c'));
    const lab = dmat('ladlab', () => textTex(['TYPE IA  300 LB', 'DUTY RATING', 'EXTENSION 16 FT', 'READ ALL INSTRUCTIONS'], { w: 256, h: 160, bg: '#f2b233', fg: '#111', font: 'bold 22px sans-serif' }), { opacity: 1 });
    add(fr, tdecal(0.07, 0.2, lab, [0.222, 0.9, 0], [0, PI / 2, 0]));
    add(fr, tdecal(0.05, 0.03, stainMat('paint', '#e8e2d2', 2, 0.9), [0.05, 1.1 + 0.0165, 0.012], [-PI / 2, 0, 0]));
    add(g, fr);
    return g;
  },
};

// ── roof helpers ─────────────────────────────────────────────────────────────
const SHING = () => VC({ roughness: 0.95 });
/** Convert a point in the upright (world-aligned) frame to the local roof frame. */
function upToLocal(x, y, z) { const c = Math.cos(ROOF_PITCH), s = Math.sin(ROOF_PITCH); return [x, y * c + z * s, -y * s + z * c]; }
/** Clip a convex polygon [[x,z],...] to the half-plane a*x + b*z <= c. */
function clipPoly(poly, a, b, c) {
  const out = [];
  for (let i = 0; i < poly.length; i++) {
    const P = poly[i], Q = poly[(i + 1) % poly.length];
    const dp = a * P[0] + b * P[1] - c, dq = a * Q[0] + b * Q[1] - c;
    if (dp <= 0) out.push(P);
    if ((dp < 0 && dq > 0) || (dp > 0 && dq < 0)) { const t = dp / (dp - dq); out.push([P[0] + t * (Q[0] - P[0]), P[1] + t * (Q[1] - P[1])]); }
  }
  return out;
}
/** Thin slab from a polygon in the XZ plane, top at y0+th. */
function slabFromPoly(poly, th, y0 = 0) {
  if (poly.length < 3) return null;
  const sh = new THREE.Shape(poly.map(([x, z]) => new THREE.Vector2(x, z)));
  const g = new THREE.ExtrudeGeometry(sh, { depth: th, bevelEnabled: false });
  g.rotateX(PI / 2); g.translate(0, y0 + th, 0); return g;   // shape y→+z, extrude → −y
}

const roof = {
  // ── Asphalt 3-tab field: granule loss (always) + a face-nailed repair shingle (variable).
  'roof-shingles': (states) => {
    const g = group('shingles'); const bad = isDef(states, 'shingle-exposed-nails');
    const W = 3, D = 2.5, exp = 5 * IN;
    const repairCourse = 9, rx0 = -0.16, rx1 = rx0 + 36 * IN;
    const st = shingleTabs(-W / 2, W / 2, -D / 2, D / 2, { seed: 'field', jitter: 0.05, base: '#55565a',
      pick: (x, zb, course) => (course === repairCourse && x > rx0 && x < rx1) ? 'alt' : null });
    add(g, T(merge(st.main, SHING()), 'shingle-granule-loss'), T(underlay(-W / 2, W / 2, -D / 2, D / 2), 'shingle-granule-loss'));
    // Repair shingle: newer charcoal strip.
    const rep = st.alt.map(geo => tint(geo, '#2f3036', 0));
    add(g, T(merge(rep, SHING()), 'shingle-exposed-nails'));
    const zb = D / 2 - repairCourse * exp;
    if (bad) {
      const nails = []; for (let i = 0; i < 6; i++) nails.push(gCyl(0.0068, 0.0068, 0.003, [rx0 + 0.08 + i * 0.145, 0.0105, zb - 0.03 - (i % 2) * 0.012], [0, 0, 0], 10));
      add(g, T(merge(nails, '#c9cdd0', { metalness: 0.8, roughness: 0.25 }), 'shingle-exposed-nails'));
      [1, 3, 4].forEach(i => add(g, T(tdecal(0.012, 0.06, streakMat('nailrust' + i, '#7a3f1d', 0.8), [rx0 + 0.08 + i * 0.145, 0.0108, zb - 0.0 - (i % 2) * 0.012], [-PI / 2, 0, 0]), 'shingle-exposed-nails')));
    }
    add(g, T(hit(rx1 - rx0 + 0.04, 0.03, exp + 0.03, [(rx0 + rx1) / 2, 0.012, zb - exp / 2]), 'shingle-exposed-nails'));
    // Bald patches: black asphalt showing, and in places the fibreglass mat itself.
    const bald = (k) => dmat('bald' + k, () => ctex('bald' + k, 256, 256, (c, w, h) => {
      const r = rng('bald' + k); c.clearRect(0, 0, w, h);
      const gauss = () => (r() + r() + r() - 1.5) / 1.5;
      for (let cl = 0; cl < 6; cl++) {
        const cx = 50 + r() * 156, cy = 50 + r() * 156, sg = 18 + r() * 26;
        for (let i = 0; i < 700; i++) { const x = cx + gauss() * sg * 1.6, y = cy + gauss() * sg; c.fillStyle = `rgba(16,16,18,${0.45 + r() * 0.5})`; c.fillRect(x, y, 1 + r() * 3, 1 + r() * 2); }
        if (cl % 2 === 0) for (let i = 0; i < 160; i++) { const x = cx + gauss() * sg * 0.7, y = cy + gauss() * sg * 0.35; c.fillStyle = `rgba(${150 + r() * 20},${140 + r() * 20},${118 + r() * 15},${0.6 + r() * 0.4})`; c.fillRect(x, y, 1 + r() * 2.5, 1 + r() * 1.5); }
      }
    }), { opacity: 1, roughness: 0.55 });
    [[-0.9, -0.55, 0.9, 0], [0.6, 0.45, 1.0, 1], [-0.2, 0.75, 0.7, 2], [1.0, -0.6, 0.6, 0]].forEach(([x, z, s, k]) =>
      add(g, T(tdecal(s, s * 0.75, bald(k), [x, 0.0102, z], [-PI / 2, 0, x]), 'shingle-granule-loss')));
    return g;
  },

  // ── Brick chimney above the roofline: cracked crown (always), cap (variable), flashing (variable).
  'roof-chimney': (states) => {
    const g = group('chimney'); const capOk = !isDef(states, 'chimney-cap'); const flOk = !isDef(states, 'chimney-flashing');
    const w = 0.75, d = 0.75, H = 1.12, t = Math.tan(ROOF_PITCH), cosT = Math.cos(ROOF_PITCH);
    const zf = (d / 2) / cosT;                       // footprint half-depth on the roof plane
    const st = shingleTabs(-0.72, 0.72, -0.78, 0.72, { seed: 'chim', pick: (x, zb) => (Math.abs(x) < w / 2 - 0.02 && zb > -zf + 0.03 && zb < zf + 0.1) ? 'skip' : null });
    add(g, merge(st.main, SHING()), underlay(-0.72, 0.72, -0.78, 0.72));
    const U = upright(); add(g, U);
    add(U, tBox(w, H + 0.8, d, brickMat(), [0, (H - 0.8) / 2, 0]));
    // Crown: cracked through, a corner spalled off (the chunk sits on the shingles below).
    const CR = concreteMat('crown', '#a9a69f');
    add(U, T(tBox(w + 0.1, 0.07, d + 0.1, CR, [0, H + 0.035, 0]), 'chimney-crown'));
    add(U, T(tdecal(0.84, 0.84, crackMat('crown', { width: 5, branches: 6 }), [0, H + 0.0705, 0], [-PI / 2, 0, 0]), 'chimney-crown'));
    add(U, T(tdecal(0.3, 0.07, crackMat('crownside', { width: 4, branches: 2 }), [0.08, H + 0.035, d / 2 + 0.0505]), 'chimney-crown'));
    add(U, T(tdecal(0.16, 0.16, stainMat('spall', '#3b3a36', 2, 0.9), [-w / 2 + 0.02, H + 0.071, d / 2 + 0.02], [-PI / 2, 0, 0]), 'chimney-crown'));
    const chunk = mesh(xf(new THREE.DodecahedronGeometry(0.045, 0), [-0.22, 0.03, 0.58], [0.3, 0.8, 0.1], [1.3, 0.6, 1]), CR);
    add(g, T(chunk, 'chimney-crown'));
    // Flue tile
    const ft = 0.105, fw = 0.018, fy = H + 0.07, fh = 0.14;
    add(U, T(merge([gBox(2 * ft, fh, fw, [0, fy + fh / 2, ft - fw / 2]), gBox(2 * ft, fh, fw, [0, fy + fh / 2, -ft + fw / 2]), gBox(fw, fh, 2 * ft, [ft - fw / 2, fy + fh / 2, 0]), gBox(fw, fh, 2 * ft, [-ft + fw / 2, fy + fh / 2, 0])], '#b5653d'), 'chimney-cap'));
    add(U, mesh(xf(new THREE.PlaneGeometry(2 * ft - 0.03, 2 * ft - 0.03), [0, fy + fh - 0.05, 0], [-PI / 2, 0, 0]), C.creosote));
    add(U, T(hit(0.36, 0.34, 0.36, [0, fy + 0.17, 0]), 'chimney-cap'));
    if (capOk) {
      const SS = mat('#c9cdd1', { metalness: 0.75, roughness: 0.3 });
      const cy = fy + fh + 0.11;
      const cap = [gBox(0.36, 0.012, 0.36, [0, cy + 0.11, 0]), xf(new THREE.ConeGeometry(0.255, 0.06, 4), [0, cy + 0.146, 0], [0, PI / 4, 0]),
        gBox(0.25, 0.03, 0.25, [0, fy + fh - 0.01, 0])];
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) cap.push(gBox(0.012, 0.23, 0.012, [sx * 0.135, cy, sz * 0.135]));
      add(U, T(merge(cap, SS), 'chimney-cap'));
      const scr = screenMat();
      [[0, 0.135, 0], [0, -0.135, PI], [0.135, 0, PI / 2], [-0.135, 0, -PI / 2]].forEach(([x, z, ry]) => add(U, T(tdecal(0.27, 0.2, scr, [x, cy, z], [0, ry, 0]), 'chimney-cap')));
    } else {
      add(U, T(merge([gBox(2 * ft, 0.004, fw, [0, fy + fh + 0.002, ft - fw / 2]), gBox(2 * ft, 0.004, fw, [0, fy + fh + 0.002, -ft + fw / 2]), gBox(fw, 0.004, 2 * ft, [ft - fw / 2, fy + fh + 0.002, 0]), gBox(fw, 0.004, 2 * ft, [-ft + fw / 2, fy + fh + 0.002, 0])], C.soot), 'chimney-cap'));
      const r = rng('nest'), tw = [];
      for (let i = 0; i < 16; i++) { const a = r() * PI * 2; tw.push(gPipe([Math.cos(a) * 0.06, fy + fh - 0.04, Math.sin(a) * 0.06], [Math.cos(a + 1) * 0.11, fy + fh + 0.02 + r() * 0.03, Math.sin(a + 1) * 0.1], 0.0025, 4)); }
      add(U, T(merge(tw, '#6b5534'), 'chimney-cap'));
    }
    // Flashing
    const id = 'chimney-flashing';
    if (flOk) {
      const M = mat('#a3a9ad', GALV);
      const step = [];
      for (const sx of [-1, 1]) for (let k = 0; k < 7; k++) step.push(gBox(0.003, 0.09, 0.15, [sx * (w / 2 + 0.0016), 0.045 + (k % 2) * 0.001, -zf + 0.07 + k * 0.127]));
      step.push(gBox(w + 0.12, 0.003, 0.13, [0, 0.0105, zf + 0.06]));
      add(g, T(merge(step, M), id));
      const cf = [];
      for (const sx of [-1, 1]) {
        const steps = [[-d / 2, 0], [0, d / 2]];
        steps.forEach(([za, zb]) => {
          const yr = (z) => -z * t, top = yr(za) + 0.17;
          const sh = new THREE.Shape([new THREE.Vector2(za, yr(za) + 0.07), new THREE.Vector2(zb, yr(zb) + 0.07), new THREE.Vector2(zb, top), new THREE.Vector2(za, top)]);
          const sg = new THREE.ShapeGeometry(sh); sg.rotateY(-PI / 2); sg.translate(sx * (w / 2 + 0.004), 0, 0); cf.push(sg);
        });
      }
      cf.push(gBox(w + 0.12, 0.1, 0.003, [0, -(d / 2) * t + 0.05, d / 2 + 0.0016]), gBox(w + 0.04, 0.07, 0.004, [0, -(d / 2) * t + 0.14, d / 2 + 0.004]));
      add(U, T(merge(cf, mat('#a3a9ad', { ...GALV, side: THREE.DoubleSide })), id));
      // Cricket (saddle) behind the chimney.
      const zb = -zf, hc = 0.16, ycP = (hc + (d / 2) * Math.sin(ROOF_PITCH)) / cosT;
      const Pk = upToLocal(0, ycP, -d / 2), A = [-w / 2, 0.012, zb], B = [w / 2, 0.012, zb], Tl = [0, 0.012, zb - 0.42];
      const cg = new THREE.BufferGeometry(); cg.setAttribute('position', new THREE.Float32BufferAttribute([...A, ...Tl, ...Pk, ...Pk, ...Tl, ...B], 3)); cg.computeVertexNormals();
      add(g, T(mesh(cg, mat('#a3a9ad', { ...GALV, side: THREE.DoubleSide })), id));
    } else {
      const RC = '#3b3833', beads = [], r = rng('caulk');
      const run = (a, b, n) => { for (let i = 0; i < n; i++) { if (r() < 0.18) continue; const t0 = i / n, t1 = (i + 0.85) / n; beads.push(gPipe(a.map((v, k) => v + (b[k] - v) * t0), a.map((v, k) => v + (b[k] - v) * t1), 0.011 + r() * 0.004, 6)); } };
      run([-w / 2 - 0.006, 0.01, -zf], [-w / 2 - 0.006, 0.01, zf], 9); run([w / 2 + 0.006, 0.01, -zf], [w / 2 + 0.006, 0.01, zf], 9);
      run([-w / 2, 0.01, zf + 0.006], [w / 2, 0.01, zf + 0.006], 7); run([-w / 2, 0.01, -zf - 0.006], [w / 2, 0.01, -zf - 0.006], 7);
      for (let i = 0; i < 30; i++) { const sx = r() < 0.5 ? -1 : 1; beads.push(gSph(0.012 + r() * 0.01, [sx * (w / 2 + 0.01), 0.012, -zf + r() * 2 * zf], [1, 0.5, 1.6])); }
      add(g, T(merge(beads, RC, { roughness: 0.5 }), id));
      add(U, T(tdecal(w, 0.3, stainMat('chimwet', '#3e2a20', 2, 0.6), [0, -(d / 2) * t + 0.12, d / 2 + 0.002]), id));
    }
    for (const sx of [-1, 1]) add(g, T(hit(0.1, 0.18, 2 * zf + 0.1, [sx * (w / 2 + 0.03), 0.06, 0]), id));
    add(g, T(hit(w + 0.15, 0.18, 0.12, [0, 0.06, zf + 0.05]), id));
    return g;
  },

  // ── PVC plumbing vent through a neoprene-collared boot: intact (ok) or split & shrunk (defect).
  'roof-vent-boot': (states) => {
    const g = group('ventboot'); const bad = isDef(states, 'vent-boot'); const id = 'vent-boot';
    const st = shingleTabs(-0.28, 0.28, -0.3, 0.28, { seed: 'vb' }); add(g, merge(st.main, SHING()), underlay(-0.28, 0.28, -0.3, 0.28));
    const M = mat('#a3a9ad', GALV);
    add(g, T(merge([gBox(0.3, 0.002, 0.34, [0, 0.0105, 0.03]), gCyl(0.06, 0.1, 0.035, [0, 0.028, 0.02], [0, 0, 0], 20)], M), id));
    const over = shingleTabs(-0.28, 0.28, -0.3, -0.12, { seed: 'vb2', y0: 0.004 }); add(g, merge(over.main, SHING()));
    const U = upright([0, 0, 0.02]); add(g, U);
    add(U, T(mesh(gCyl(0.03, 0.03, 0.5, [0, 0.1, 0], [0, 0, 0], 20), '#e6e3da', { roughness: 0.5 }), id));
    add(U, mesh(xf(new THREE.CircleGeometry(0.026, 16), [0, 0.351, 0], [-PI / 2, 0, 0]), '#0d0d0d'));
    const RB = mat('#2a2a2c', { roughness: 0.75, side: THREE.DoubleSide });
    if (!bad) {
      add(U, T(merge([gCyl(0.033, 0.046, 0.1, [0, 0.07, 0], [0, 0, 0], 20), xf(new THREE.TorusGeometry(0.0325, 0.004, 6, 20), [0, 0.12, 0], [PI / 2, 0, 0])], RB), id));
    } else {
      add(U, T(mesh(gCyl(0.042, 0.048, 0.1, [0, 0.07, 0], [0, 0, 0], 20, true, 0.3, PI * 2 - 0.6), RB), id));
      add(U, T(mesh(xf(new THREE.RingGeometry(0.0302, 0.042, 20), [0, 0.1195, 0], [-PI / 2, 0, 0]), '#060606', { side: THREE.DoubleSide }), id));
      add(U, T(mesh(gCyl(0.0425, 0.0485, 0.1, [0, 0.07, 0], [0, 0, 0], 20, true, 0.3, PI * 2 - 0.6), crackMat('bootcraze', { color: '#9c9c96', width: 1.4, branches: 7 })), id));
      add(g, T(tdecal(0.05, 0.16, streakMat('bootstreak', '#6b4a2a', 0.5), [0.02, 0.012, 0.13], [-PI / 2, 0, 0]), id));
    }
    add(U, T(hit(0.14, 0.2, 0.14, [0, 0.08, 0]), id));
    return g;
  },

  // ── Eave edge: drip edge under the shingles (ok) vs raw shingles over a rotting deck edge (defect).
  'roof-edge': (states) => {
    const g = group('roofedge'); const ok = !isDef(states, 'drip-edge'); const id = 'drip-edge';
    add(g, T(tBox(3, 0.012, 0.4, osbMat(), [0, -0.006, 0]), id));
    const st = shingleTabs(-1.5, 1.5, -0.2, ok ? 0.213 : 0.218, { seed: 'edge' });
    add(g, T(merge(st.main, SHING()), id), T(underlay(-1.5, 1.5, -0.2, 0.2), id));
    const U = upright([0, 0, 0.2]); add(g, U);
    add(U, T(mesh(gBox(3, 0.19, 0.025, [0, -0.105, -0.0125]), C.white, { roughness: 0.6 }), id));
    if (ok) {
      add(g, T(mesh(gBox(3, 0.0015, 0.05, [0, 0.0008, 0.175]), WHITE_AL), id));
      add(U, T(merge([gBox(3, 0.045, 0.0015, [0, -0.02, 0.0028]), gBox(3, 0.0015, 0.009, [0, -0.042, 0.007], [0.5, 0, 0])], WHITE_AL), id));
    } else {
      const droop = []; const r = rng('droop');
      for (let x = -1.45; x < 1.5; x += 0.305) droop.push(tint(gBox(0.298, 0.004, 0.028, [x + 0.15, -0.006 - r() * 0.006, 0.012], [0.55 + r() * 0.3, 0, (r() - 0.5) * 0.06]), C.shingle, (r() - 0.5) * 0.05));
      add(U, T(merge(droop, SHING()), id));
      add(U, T(mesh(gBox(3.002, 0.035, 0.026, [0, -0.028, -0.0125]), '#6d5a43', { roughness: 1 }), id));
      add(U, T(tdecal(3, 0.12, stainMat('fasciarot', '#3b2a1c', 3, 0.8), [0, -0.06, 0.0005]), id));
      add(g, T(mesh(gBox(3, 0.0122, 0.03, [0, -0.006, 0.186]), '#4d3a25', { roughness: 1 }), id));
    }
    add(U, T(hit(3, 0.1, 0.08, [0, -0.03, 0.02]), id));
    return g;
  },

  // ── Closed-cut valley done right: chevron courses, crisp cut 2" off centre, clipped corners.
  'roof-valley': () => {
    const g = group('valley'); const id = 'valley-closed-cut';
    const al = 0.6, phi = 0.14, exp = 5 * IN, depth = exp + 0.035, th = 0.004, r = rng('valley');
    const L = [], R = [];
    const tilt = (geo, side) => { geo.rotateZ(side < 0 ? -phi : phi); return geo; };
    const courseTabs = (side, zb, ci) => {
      const a = [Math.cos(al) * (side < 0 ? 1 : -1), Math.sin(al)], n = [-a[1] * (side < 0 ? 1 : -1), a[0] * (side < 0 ? 1 : -1)];
      // course line passes through (0, zb); tabs laid along it
      const out = [];
      for (let s = -1.2; s < 1.2; s += 12 * IN) {
        const s0 = s + ((ci * 6 * IN) % (12 * IN)), s1 = s0 + 12 * IN - 0.25 * IN;
        let poly = [[s0, 0], [s1, 0], [s1, -depth], [s0, -depth]].map(([u, v]) => [a[0] * u + n[0] * v, zb + a[1] * u + n[1] * v]);
        poly = clipPoly(poly, 0, -1, 1.5); poly = clipPoly(poly, 0, 1, 1.5);
        out.push(poly);
      }
      return out;
    };
    let ci = 0;
    for (let zb = 1.75; zb > -1.6; zb -= exp, ci++) {
      const lift = ci * 0.0004;
      courseTabs(-1, zb, ci).forEach(poly => {
        let pL = clipPoly(clipPoly(poly, 1, 0, 0), -1, 0, 0.4);
        let pX = clipPoly(clipPoly(poly, -1, 0, 0), 1, 0, 0.3);
        const gl = slabFromPoly(pL, th, lift); if (gl) L.push(tilt(tint(gl, C.shingle, (r() - 0.5) * 0.05), -1));
        const gx = slabFromPoly(pX, th, lift); if (gx) L.push(tilt(tint(gx, C.shingle, (r() - 0.5) * 0.05), 1));
      });
      courseTabs(1, zb, ci).forEach(poly => {
        let p = clipPoly(clipPoly(poly, -1, 0, -0.05), 1, 0, 0.4);
        // clip the upper corner at the cut line (water can't run along the top edge)
        p = clipPoly(p, -0.7, -0.7, -0.7 * 0.05 - 0.7 * (zb - depth) - 0.03);
        const gr = slabFromPoly(p, th, lift + 0.005); if (gr) R.push(tilt(tint(gr, C.shingle, (r() - 0.5) * 0.05), 1));
      });
    }
    add(g, T(merge(L, SHING()), id), T(merge(R, SHING()), id));
    add(g, T(tdecal(0.006, 3, mat('#4a77c4', { transparent: true, opacity: 0.25, depthWrite: false }), [0.052, 0.018 + 0.05 * Math.sin(phi), 0], [-PI / 2, 0, 0]), id));
    return g;
  },

  // ── Shingle-over ridge vent with cap shingles; nails concealed. (Always fine.)
  'roof-ridge-vent': () => {
    const g = group('ridgevent'); const id = 'ridge-vent';
    const U = upright(); add(g, U);
    const slope = (back) => { const s = group('slope'); if (back) s.rotation.y = PI; const f = group('f'); f.rotation.x = ROOF_PITCH; s.add(f); U.add(s); return f; };
    [false, true].forEach(back => {
      const f = slope(back);
      add(f, T(tBox(3, 0.012, 0.18, osbMat(), [0, -0.006, 0.12]), id));
      const st = shingleTabs(-1.5, 1.5, 0.05, 0.21, { seed: back ? 'rb' : 'rf' }); add(f, T(merge(st.main, SHING()), id), underlay(-1.5, 1.5, 0.05, 0.21));
      add(f, T(mesh(gBox(3, 0.02, 0.15, [0, 0.019, 0.075]), '#1f1f22', { roughness: 0.7 }), id));
      const ribs = []; for (let x = -1.48; x < 1.5; x += 0.05) ribs.push(gBox(0.006, 0.018, 0.006, [x, 0.019, 0.151]));
      add(f, merge(ribs, '#111'));
      const caps = [], r = rng('cap' + back);
      for (let x = -1.5, i = 0; x < 1.5; x += 5 * IN, i++) caps.push(tint(gBox(0.3, 0.004, 0.16, [x + 0.15, 0.033 + i * 0.0003, 0.08], [-0.02, 0, 0]), C.shingle, (r() - 0.5) * 0.05));
      add(f, T(merge(caps, SHING()), id));
    });
    add(U, T(merge([gBox(0.02, 0.05, 0.3, [-1.5, 0.0, 0]), gBox(0.02, 0.05, 0.3, [1.5, 0.0, 0])], '#1f1f22'), id));
    add(U, T(hit(3, 0.12, 0.36, [0, 0.0, 0]), id));
    return g;
  },
};

// ── deck helpers ─────────────────────────────────────────────────────────────
const PTV = () => VC({ roughness: 0.9 });
const ptBoard = (w, h, d, pos, rot, r) => tint(gBox(w, h, d, pos, rot), PT, r ? (r() - 0.5) * 0.06 : 0);
/** Face-nail heads (merged), and galvanized hanger. */
function hangerG(x, yb, h, zFace, nails, holes, opts = {}) {
  const jw = 1.5 * IN, t = 0.0016, flange = 0.035, seat = 0.05;
  const plate = [gBox(jw + 2 * t, t, seat, [x, yb - t / 2, zFace + seat / 2]), gBox(t, h * 0.85, seat, [x - jw / 2 - t / 2, yb + h * 0.425, zFace + seat / 2]), gBox(t, h * 0.85, seat, [x + jw / 2 + t / 2, yb + h * 0.425, zFace + seat / 2]),
    gBox(flange, h * 0.85, t, [x - jw / 2 - flange / 2, yb + h * 0.425, zFace + t / 2]), gBox(flange, h * 0.85, t, [x + jw / 2 + flange / 2, yb + h * 0.425, zFace + t / 2])];
  const pts = [];
  for (const sx of [-1, 1]) for (let k = 0; k < 4; k++) pts.push([x + sx * (jw / 2 + flange / 2), yb + 0.03 + k * h * 0.22, zFace + t + 0.001, 'face', sx]);
  for (const sx of [-1, 1]) for (let k = 0; k < 2; k++) pts.push([x + sx * (jw / 2 + t + 0.001), yb + 0.04 + k * h * 0.35, zFace + 0.03, 'side', sx]);
  pts.forEach((p, i) => {
    const filled = i < nails;
    const geo = p[3] === 'face' ? gCyl(0.0042, 0.0042, 0.002, [p[0], p[1], p[2]], [PI / 2, 0, 0], 8) : gCyl(0.0042, 0.0042, 0.002, [p[0], p[1], p[2]], [0, 0, PI / 2], 8);
    (filled ? opts.nails : holes).push(geo);
  });
  return plate;
}

const deck = {
  // ── Ledger: nailed only (always), flashing over the top (variable).
  'deck-ledger': (states) => {
    const g = group('ledger'); const flOk = !isDef(states, 'ledger-flashing'); const hOk = !isDef(states, 'joist-hangers');
    const r = rng('ledger'), L = 4, y0 = 0.03, lh = 0.235, top = y0 + lh, lt = 1.5 * IN;
    add(g, box(L, 0.3, 0.02, '#7d6a52', [0, 0.15, -0.01]));                                     // house rim behind
    const sid = []; for (let i = 0; i < 2; i++) sid.push(gBox(L, 0.11, 0.01, [0, 0.33 + i * 0.1, 0.006], [-0.11, 0, 0]));
    add(g, merge(sid, C.vinyl, { roughness: 0.6 }));
    add(g, T(mesh(tint(gBox(L, lh, lt, [0, y0 + lh / 2, lt / 2]), PT, -0.02), PTV()), 'ledger-fasteners'));
    // 16d nails in pairs, no lags or through-bolts anywhere; two have backed out.
    const nails = [], shanks = [];
    for (let x = -1.85; x < 1.9; x += 0.4) for (const dy of [0.05, 0.18]) {
      const pop = (Math.round(x * 10) === 5 && dy > 0.1) || (Math.round(x * 10) === -14 && dy < 0.1);
      nails.push(gCyl(0.0045, 0.0045, 0.002, [x + (r() - 0.5) * 0.03, y0 + dy, lt + (pop ? 0.012 : 0.001)], [PI / 2, 0, 0], 8));
      if (pop) shanks.push(gCyl(0.0017, 0.0017, 0.012, [x, y0 + dy, lt + 0.006], [PI / 2, 0, 0], 6));
    }
    add(g, T(merge([...nails, ...shanks], '#9aa0a3', { metalness: 0.6, roughness: 0.4 }), 'ledger-fasteners'));
    add(g, T(hit(L, 0.19, 0.03, [0, y0 + 0.1, lt + 0.012]), 'ledger-fasteners'));
    // Joist stubs + hangers (consistent with this inspection's hanger state).
    const jo = [], hg = [], hn = [], holes = [];
    for (let i = 0; i < 9; i++) {
      const x = -1.62 + i * 0.406, jh = 7.25 * IN, yb = top - jh;
      jo.push(ptBoard(1.5 * IN, jh, 0.28, [x, yb + jh / 2, lt + 0.14], null, r));
      if (hOk || i !== 4) hg.push(...hangerG(x, yb, jh, lt, 12, holes, { nails: hn }));
    }
    add(g, merge(jo, PTV()), merge(hg, mat(C.galv, GALV)), merge(hn, '#9aa0a3', { metalness: 0.6 }));
    if (holes.length) add(g, merge(holes, '#202020'));
    // Decking above
    const dk = []; for (let z = 0.015; z < 0.33; z += 0.143) dk.push(ptBoard(L, 0.025, 0.14, [0, top + 0.0125, z + 0.07], null, r));
    add(g, merge(dk, PTV()));
    if (flOk) {
      add(g, T(merge([gBox(L, 0.03, 0.0012, [0, top - 0.012, lt + 0.0008]), gBox(L, 0.0012, lt + 0.004, [0, top + 0.0008, lt / 2]), gBox(L, 0.05, 0.0012, [0, top + 0.03, 0.002])], C.galv, GALV), 'ledger-flashing'));
    } else {
      add(g, T(tdecal(L, 0.14, dmat('ledgerstreak', () => ctex('ledgerstreak', 512, 64, (c, W, H) => {
        const rr = rng('lstreak'); c.clearRect(0, 0, W, H);
        for (let i = 0; i < 60; i++) { const x = rr() * W, len = H * (0.3 + rr() * 0.7), gr = c.createLinearGradient(0, 0, 0, len); gr.addColorStop(0, 'rgba(40,28,16,0.85)'); gr.addColorStop(1, 'rgba(40,28,16,0)'); c.fillStyle = gr; c.fillRect(x, 0, 2 + rr() * 6, len); }
      }), { opacity: 1 }), [0, top - 0.07, lt + 0.0015]), 'ledger-flashing'));
      add(g, T(mesh(gBox(L, 0.012, lt + 0.002, [0, top - 0.006, lt / 2]), C.rot, { roughness: 1 }), 'ledger-flashing'));
      add(g, T(tdecal(L, 0.12, ringMat('rimwet', '#2e2116', 3, 0.7), [0, top - 0.04, 0.0005]), 'ledger-flashing'));
    }
    add(g, T(hit(L, 0.05, 0.04, [0, top - 0.01, lt + 0.015]), 'ledger-flashing'));
    return g;
  },

  // ── Joist-to-ledger connections from below. OK: hangers, every hole nailed. Defect: one joist
  //    toe-nailed with no hanger, another hanger hung on two nails.
  'deck-framing': (states) => {
    const g = group('framing'); const ok = !isDef(states, 'joist-hangers'); const id = 'joist-hangers';
    const r = rng('frm'), lt = 1.5 * IN, lh = 0.235, jh = 7.25 * IN, yb = lh - jh, JL = 2.4;
    add(g, mesh(tint(gBox(2.2, lh, lt, [0, lh / 2, lt / 2]), PT, -0.02), PTV()));
    const ln = []; for (let x = -1.0; x < 1.05; x += 0.4) for (const dy of [0.05, 0.18]) ln.push(gCyl(0.0045, 0.0045, 0.002, [x, dy, lt + 0.001], [PI / 2, 0, 0], 8));
    add(g, merge(ln, '#9aa0a3', { metalness: 0.6 }));
    const jo = [], hg = [], hn = [], holes = [], toe = [];
    const xs = [-0.812, -0.406, 0, 0.406, 0.812];
    xs.forEach((x, i) => {
      const drop = (!ok && i === 1) ? 0.012 : 0;
      jo.push(ptBoard(1.5 * IN, jh, JL - lt - 0.04, [x, yb + jh / 2 - drop, lt + 0.002 + (JL - lt - 0.04) / 2], null, r));
      if (ok) hg.push(...hangerG(x, yb, jh, lt, 12, holes, { nails: hn }));
      else if (i === 1) { for (const k of [0, 1, 2]) toe.push(gCyl(0.0018, 0.0018, 0.07, [x + (k - 1) * 0.012, yb + jh - 0.03 - k * 0.04, lt + 0.03], [-0.9, 0, (k - 1) * 0.3], 6), gCyl(0.0045, 0.0045, 0.002, [x + (k - 1) * 0.012, yb + jh - 0.005 - k * 0.04, lt + 0.055], [-0.9, 0, 0], 8)); }
      else if (i === 3) hg.push(...hangerG(x, yb, jh, lt, 2, holes, { nails: hn }));
      else hg.push(...hangerG(x, yb, jh, lt, 12, holes, { nails: hn }));
      add(g, T(hit(0.14, jh + 0.04, 0.12, [x, yb + jh / 2, lt + 0.05]), id));
    });
    jo.push(ptBoard(2.0, jh, lt, [0, yb + jh / 2, JL - lt / 2], null, r));
    add(g, merge(jo, PTV()));
    add(g, T(merge(hg, mat(C.galv, GALV)), id));
    if (hn.length) add(g, T(merge(hn, '#9aa0a3', { metalness: 0.6 }), id));
    if (holes.length) add(g, T(merge(holes, '#1a1a1a'), id));
    if (toe.length) add(g, T(merge(toe, '#9aa0a3', { metalness: 0.6 }), id));
    const dk = []; for (let z = 0.01; z < JL; z += 0.143) dk.push(ptBoard(2.1, 0.025, 0.137, [0, lh + 0.0125, z + 0.07], null, r));
    add(g, merge(dk, PTV()));
    return g;
  },

  // ── Guard: 36" to top of cap (ok), but 2x2 balusters spaced with ~5.5" clear (always defect).
  'deck-guard': () => {
    const g = group('guard'); const r = rng('guard');
    const capTop = 36 * IN, pw = 3.5 * IN;
    const dk = []; for (let x = -1.55; x < 1.55; x += 0.143) dk.push(ptBoard(0.14, 0.025, 0.16, [x + 0.07, -0.0125, -0.06], null, r));
    dk.push(ptBoard(3.1, 7.25 * IN, 1.5 * IN, [0, -0.025 - 3.625 * IN, 0.0], null, r));
    const GZ = 0.019 + pw / 2;
    add(g, merge(dk, PTV()));
    const fr = [];
    for (const x of [-1.45, 0, 1.45]) fr.push(ptBoard(pw, capTop - 0.038 + 0.2, pw, [x, (capTop - 0.038 - 0.2) / 2, GZ], null, r));
    fr.push(ptBoard(3.0, 0.038, 0.14, [0, capTop - 0.019, GZ], null, r));            // 2x6 cap
    fr.push(ptBoard(2.9, 3.5 * IN, 1.5 * IN, [0, capTop - 0.038 - 1.75 * IN, GZ], null, r)); // top rail
    fr.push(ptBoard(2.9, 1.5 * IN, 3.5 * IN, [0, 3 * IN + 0.75 * IN, GZ], null, r));    // bottom rail, 3" above deck
    add(g, T(merge(fr, PTV()), 'guard-height'));
    const bolts = []; for (const x of [-1.45, 0, 1.45]) for (const dy of [-0.06, -0.15]) bolts.push(gCyl(0.012, 0.012, 0.006, [x, dy, GZ + pw / 2 + 0.003], [PI / 2, 0, 0], 10));
    add(g, merge(bolts, '#8e9396', { metalness: 0.6 }));
    const bal = [], bw = 1.5 * IN, clear = 5.5 * IN, y0 = 4.5 * IN, y1 = capTop - 0.038 - 3.5 * IN;
    for (const [a, b] of [[-1.45, 0], [0, 1.45]]) {
      const inner = (b - a) - pw, n = Math.floor((inner - clear) / (bw + clear));
      const gap = (inner - n * bw) / (n + 1);
      for (let k = 0; k < n; k++) { const x = a + pw / 2 + gap + bw / 2 + k * (bw + gap); bal.push(ptBoard(bw, y1 - y0, bw, [x, (y0 + y1) / 2, GZ], null, r)); }
    }
    add(g, T(merge(bal, PTV()), 'baluster-spacing'));
    add(g, T(hit(2.9, y1 - y0 - 0.04, 0.08, [0, (y0 + y1) / 2, GZ]), 'baluster-spacing'));
    return g;
  },

  // ── Stairs from the deck (~0.925 m above grade): 5 equal risers, guards both sides.
  //    OK: graspable round handrail on brackets. Defect: only the flat 2x6 guard cap (not graspable).
  'deck-stairs': (states) => {
    const g = group('deckstairs'); const ok = !isDef(states, 'deck-stair-handrail'); const id = 'deck-stair-handrail';
    const r = rng('dst'), R = 0.185, run = 0.27, n = 5, zTop = -0.8;
    const zf = (i) => zTop + (n - i) * run;   // front (nosing) of tread i, i=1..4
    const yb = (i) => i * R - 0.025;
    const pts = [[zf(1), 0]];
    for (let i = 1; i <= n - 1; i++) { pts.push([zf(i), yb(i)], [zf(i) - run, yb(i)]); }
    const backLow = yb(n - 1) - 0.3, slope = R / run, zFoot = zTop + backLow / slope;
    pts.push([zTop, backLow], [zFoot, 0]);
    const sh = new THREE.Shape(pts.map(([z, y]) => new THREE.Vector2(z, y)));
    const str = [];
    for (const x of [-0.46, 0, 0.46]) { const sg = new THREE.ExtrudeGeometry(sh, { depth: 1.5 * IN, bevelEnabled: false }); sg.rotateY(-PI / 2); sg.translate(x + 0.75 * IN, 0, 0); str.push(tint(sg, PT, (r() - 0.5) * 0.05)); }
    for (let i = 1; i <= n - 1; i++) {
      for (const k of [0, 1]) str.push(ptBoard(1.0, 0.025, 0.135, [0, i * R - 0.0125, zf(i) - 0.0675 - k * 0.137 + 0.01], null, r));
      str.push(ptBoard(1.0, R - 0.025, 0.018, [0, i * R - 0.025 - (R - 0.025) / 2, zf(i) - 0.02], null, r));
    }
    str.push(ptBoard(1.0, R - 0.025, 0.018, [0, n * R - 0.025 - (R - 0.025) / 2, zTop + 0.009], null, r));
    add(g, merge(str, PTV()));
    add(g, tBox(1.2, 0.05, 0.5, concreteMat(), [0, 0.025, zf(1) + 0.27]));
    // Guards on both open sides (stair guard, 2x2s at < 4-3/8" clear).
    const gd = [], postH = 0.95;
    const railY = (z) => (zf(1) - z) * slope + R + 0.86;
    for (const sx of [-1, 1]) {
      const x = sx * 0.53;
      gd.push(ptBoard(3.5 * IN, postH + 0.15, 3.5 * IN, [x, (postH + 0.15) / 2 - 0.15 + 0.15, zf(1) - 0.05], null, r));
      gd.push(ptBoard(3.5 * IN, 1.15, 3.5 * IN, [x, n * R - 0.3 + 0.575, zTop + 0.05], null, r));
      const a = [x, railY(zf(1) - 0.05) - 0.03, zf(1) - 0.05], b = [x, railY(zTop + 0.05) - 0.03, zTop + 0.05];
      gd.push(tint(gRect(a, b, 5.5 * IN, 1.5 * IN), PT, 0.02));     // flat 2x6 cap rotated to the rake
      for (let z = zf(1) - 0.15; z > zTop + 0.12; z -= 0.1) { const yTop = railY(z) - 0.06, yBot = (zf(1) - z) * slope + 0.08; gd.push(ptBoard(1.5 * IN, yTop - yBot, 1.5 * IN, [x, (yTop + yBot) / 2, z], null, r)); }
    }
    // the 2x6 cap above is laid flat: rotate each cap about its axis so it lies wide-face-up
    add(g, T(merge(gd, PTV()), id));
    if (ok) {
      const x = 0.53 - 0.075, rail = [gTube([[x, railY(zf(1) + 0.15) - 0.02, zf(1) + 0.15], [x, railY(zf(1) - 0.05), zf(1) - 0.05], [x, railY(zTop + 0.05), zTop + 0.05]], 0.022, 20, 10)];
      for (const z of [zf(1) - 0.1, (zf(1) + zTop) / 2, zTop + 0.12]) rail.push(gBox(0.06, 0.012, 0.02, [x + 0.03, railY(z) - 0.03, z]), gCyl(0.004, 0.004, 0.04, [x + 0.01, railY(z) - 0.015, z]));
      add(g, T(merge(rail, '#a77f52', { roughness: 0.5 }), id));
    }
    for (const sx of [-1, 1]) { const L = Math.hypot(zf(1) - zTop, (zf(1) - zTop) * slope); add(g, T(hit(0.22, 0.35, L, [sx * 0.5, railY((zf(1) + zTop) / 2) - 0.05, (zf(1) + zTop) / 2], [Math.atan(slope), 0, 0]), id)); }
    return g;
  },

  // ── Support post: standoff base on a concrete pier (ok) vs buried in soil and rotting (defect).
  'deck-posts': (states) => {
    const g = group('posts'); const ok = !isDef(states, 'post-footing'); const id = 'post-footing';
    const r = rng('post'), pw = 5.5 * IN, top = 0.62;
    const soil = groundGeo(0.8, 0.8, 30, (x, z) => { let y = 0.005 + 0.005 * Math.sin(x * 19 + z * 11); if (!ok) y += 0.06 * Math.max(0, 1 - Math.hypot(x, z) / 0.3); return y; }, (x, z, rr) => rr() < 0.3 ? '#4a3524' : C.soil, 'postsoil');
    add(g, T(mesh(soil, VC({ roughness: 1 })), id));
    const beam = [ptBoard(0.72, 9.25 * IN, 1.5 * IN, [0, top + 0.004 + 4.625 * IN, -0.75 * IN], null, r), ptBoard(0.72, 9.25 * IN, 1.5 * IN, [0, top + 0.004 + 4.625 * IN, 0.75 * IN], null, r)];
    add(g, merge(beam, PTV()));
    add(g, merge([gBox(pw + 0.004, 0.003, 0.08, [0, top + 0.002, 0]), gBox(0.003, 0.11, 0.08, [pw / 2 + 0.002, top - 0.05, 0]), gBox(0.003, 0.11, 0.08, [-pw / 2 - 0.002, top - 0.05, 0])], C.galv, GALV));
    if (ok) {
      const base = 0.05 + 0.025;
      add(g, T(mesh(gCyl(0.16, 0.17, 0.12, [0, -0.01, 0], [0, 0, 0], 24), concreteMat('pier', '#adaaa2')), id));
      add(g, T(mesh(tint(gBox(pw, top - base, pw, [0, base + (top - base) / 2, 0]), PT, -0.02), PTV()), id));
      add(g, T(merge([gBox(pw + 0.01, 0.004, pw + 0.01, [0, 0.052, 0]), gBox(pw + 0.01, 0.022, 0.004, [0, 0.062, pw / 2 + 0.003]), gBox(pw + 0.01, 0.022, 0.004, [0, 0.062, -pw / 2 - 0.003]),
        gBox(0.004, 0.11, pw * 0.7, [pw / 2 + 0.003, 0.11, 0]), gBox(0.004, 0.11, pw * 0.7, [-pw / 2 - 0.003, 0.11, 0]), gCyl(0.012, 0.012, 0.015, [0, 0.058, 0])], C.galv, GALV), id));
      add(g, T(merge([gCyl(0.007, 0.007, 0.006, [pw / 2 + 0.006, 0.09, 0.02], [0, 0, PI / 2], 8), gCyl(0.007, 0.007, 0.006, [pw / 2 + 0.006, 0.14, -0.02], [0, 0, PI / 2], 8)], '#8e9396', { metalness: 0.6 }), id));
    } else {
      const lean = group('lean'); lean.rotation.z = 0.025; add(g, lean);
      add(lean, T(mesh(tint(gBox(pw, top + 0.15, pw, [0, (top - 0.15) / 2, 0]), PT, -0.02), PTV()), id));
      add(lean, T(mesh(gBox(pw + 0.002, 0.12, pw + 0.002, [0, 0.07, 0]), C.rot, { roughness: 1 }), id));
      add(lean, T(tdecal(0.08, 0.2, crackMat('postsplit', { width: 2, branches: 2 }), [0.01, 0.2, pw / 2 + 0.0015]), id));
      add(lean, T(tdecal(pw, 0.14, stainMat('postwick', '#2a1d12', 2, 0.85), [0, 0.18, pw / 2 + 0.0012]), id));
      const fung = []; for (let i = 0; i < 7; i++) fung.push(tint(gSph(0.012 + r() * 0.01, [(r() - 0.5) * pw, 0.08 + r() * 0.05, pw / 2 + 0.004], [1, 0.4, 0.6], 6, 4), '#d8c9a0', (r() - 0.5) * 0.1));
      add(lean, T(merge(fung, VC()), id));
    }
    add(g, T(hit(0.3, 0.3, 0.3, [0, 0.12, 0]), id));
    return g;
  },
};

// ── SHED: garden studio with a hipped (pyramid) two-piece clay barrel-tile roof ─────────────
const shed = {
  'shed-tile-roof': (states) => {
    const g = group('studio'); const slipped = isDef(states, 'tile-slipped');
    const r = rng('studio');
    const half = 1.2, wallTop = 2.1, eave = 1.5, eaveY = 2.0, pitch = Math.atan(5 / 12);
    const L = eave / Math.cos(pitch), apexY = eaveY + eave * Math.tan(pitch);
    // Slab, walls (board & batten), trim
    add(g, tBox(2.6, 0.1, 2.6, concreteMat('studioslab', '#aca9a1'), [0, 0.05, 0]));
    add(g, tBox(0.9, 0.06, 0.4, concreteMat('studiostep', '#a4a199'), [0, 0.03, half + 0.35]));
    const WALL = '#c9c7a6';
    const walls = [gBox(2.4, 2.0, 0.08, [0, 1.1, -half + 0.04]), gBox(0.08, 2.0, 2.4, [-half + 0.04, 1.1, 0]),
      gBox(0.08, 2.0, 2.4, [half - 0.04, 0.37, 0], [0, 0, 0]), gBox(0.08, 0.5, 2.4, [half - 0.04, 1.85, 0]),
      gBox(0.08, 0.6, 0.78, [half - 0.04, 1.3, -0.81]), gBox(0.08, 0.6, 0.78, [half - 0.04, 1.3, 0.81]),
      gBox(0.78, 2.0, 0.08, [-0.81, 1.1, half - 0.04]), gBox(0.78, 2.0, 0.08, [0.81, 1.1, half - 0.04]), gBox(0.84, 0.1, 0.08, [0, 2.05, half - 0.04])];
    walls[2] = gBox(0.08, 0.9, 2.4, [half - 0.04, 0.55, 0]);
    add(g, merge(walls, WALL, { roughness: 0.85 }));
    const bat = [];
    for (let k = -1.1; k <= 1.11; k += 0.3) {
      bat.push(gBox(0.04, 2.0, 0.02, [k, 1.1, -half - 0.01]), gBox(0.02, 2.0, 0.04, [-half - 0.01, 1.1, k]));
      if (Math.abs(k) > 0.5) bat.push(gBox(0.04, 2.0, 0.02, [k, 1.1, half + 0.01]));
      if (Math.abs(k) > 0.36) bat.push(gBox(0.02, 2.0, 0.04, [half + 0.01, 1.1, k]));
    }
    add(g, merge(bat, WALL, { roughness: 0.85 }));
    const trim = [];
    for (const [x, z, w, d] of [[-half, -half, 0.1, 0.1], [half, -half, 0.1, 0.1], [-half, half, 0.1, 0.1], [half, half, 0.1, 0.1]]) trim.push(gBox(w, 2.0, d, [x, 1.1, z]));
    trim.push(gBox(0.08, 2.0, 0.06, [-0.46, 1.05, half + 0.02]), gBox(0.08, 2.0, 0.06, [0.46, 1.05, half + 0.02]), gBox(1.0, 0.08, 0.06, [0, 2.05, half + 0.02]));
    trim.push(gBox(0.06, 0.08, 0.84, [half + 0.02, 1.62, 0]), gBox(0.06, 0.08, 0.84, [half + 0.02, 0.98, 0]), gBox(0.08, 0.04, 0.9, [half + 0.04, 0.95, 0]),
      gBox(0.06, 0.72, 0.08, [half + 0.02, 1.3, -0.42]), gBox(0.06, 0.72, 0.08, [half + 0.02, 1.3, 0.42]));
    add(g, merge(trim, C.white, { roughness: 0.6 }));
    // Door: half-lite, 4 panes
    const DOOR = '#3f5e57';
    add(g, merge([gBox(0.82, 0.98, 0.045, [0, 0.59, half - 0.02]), gBox(0.82, 0.12, 0.045, [0, 1.94, half - 0.02]), gBox(0.1, 0.9, 0.045, [-0.36, 1.43, half - 0.02]), gBox(0.1, 0.9, 0.045, [0.36, 1.43, half - 0.02]),
      gBox(0.62, 0.04, 0.05, [0, 1.43, half - 0.02]), gBox(0.04, 0.8, 0.05, [0, 1.43, half - 0.02]), gBox(0.5, 0.3, 0.012, [0, 0.42, half + 0.004]), gBox(0.5, 0.3, 0.012, [0, 0.78, half + 0.004])], DOOR, { roughness: 0.5 }));
    const GL = mat('#8fa9b4', { roughness: 0.05, metalness: 0.4, transparent: true, opacity: 0.45 });
    add(g, mesh(gBox(0.62, 0.8, 0.004, [0, 1.43, half - 0.02]), GL), mesh(gBox(0.76, 0.56, 0.004, [half - 0.04, 1.3, 0], [0, PI / 2, 0]), GL));
    add(g, merge([gSph(0.028, [0.32, 1.0, half + 0.04]), gCyl(0.03, 0.03, 0.02, [0.32, 1.0, half + 0.012], [PI / 2, 0, 0]), gBox(0.03, 0.08, 0.01, [0.32, 1.1, half + 0.008])], C.brass, { metalness: 0.7, roughness: 0.3 }));
    add(g, merge([gBox(0.1, 0.16, 0.06, [0.62, 1.7, half + 0.03])], C.black), mesh(gCyl(0.03, 0.03, 0.08, [0.62, 1.7, half + 0.075]), mat('#f3e3b0', { emissive: '#3a2f10', transparent: true, opacity: 0.85 })));
    add(g, mesh(gBox(1.5, 1.4, 0.01, [0, 1.0, 0]), '#2a2723'));      // dim interior behind glazing
    // Eaves: fascia + soffit
    const fx = [];
    for (const [rot] of [[0], [PI / 2], [PI], [-PI / 2]]) {
      const fz = gBox(3.0, 0.14, 0.025, [0, eaveY - 0.07, eave - 0.0125]); fz.rotateY(rot); fx.push(fz);
      const so = gBox(2.9, 0.012, 0.3, [0, eaveY - 0.135, half + 0.15]); so.rotateY(rot); fx.push(so);
    }
    add(g, merge(fx, C.white, { roughness: 0.6 }));
    // Roof deck / underlayment: four triangles to the apex.
    const und = new THREE.BufferGeometry(), v = [];
    const corners = [[-eave, eave], [eave, eave], [eave, -eave], [-eave, -eave]];
    for (let i = 0; i < 4; i++) { const a = corners[i], b = corners[(i + 1) % 4]; v.push(a[0], eaveY, a[1], b[0], eaveY, b[1], 0, apexY, 0); }
    und.setAttribute('position', new THREE.Float32BufferAttribute(v, 3)); und.computeVertexNormals();
    add(g, mesh(und, '#2b2724', { roughness: 0.9, side: THREE.DoubleSide }));
    // Tiles. Face frame F: plane y=0, eave along X at z=0, upslope toward −z.
    const faceMat = (rot) => new THREE.Matrix4().makeRotationY(rot).multiply(new THREE.Matrix4().makeTranslation(0, eaveY, eave)).multiply(new THREE.Matrix4().makeRotationX(pitch));
    const tileLen = 0.42, expo = 0.34;
    const pan = (u, s, len, dl) => tint(xf(new THREE.CylinderGeometry(0.092, 0.1, len, 9, 1, true, PI - 1.1, 2.2), [u, 0.105 + s * 0.012, -s - len / 2], [-PI / 2, 0, 0]), C.tile, dl);
    const cov = (u, s, len, dl) => tint(xf(new THREE.CylinderGeometry(0.068, 0.076, len, 9, 1, true, -1.3, 2.6), [u, 0.042 + s * 0.012, -s - len / 2], [-PI / 2, 0, 0]), C.tileDark, dl);
    const field = [], eaveRow = [], hipT = [], mortar = [];
    const brokenAt = { face: 0, u: 0.3, course: 2 };
    let broken = null;
    for (let f = 0; f < 4; f++) {
      const M = faceMat(f * PI / 2);
      for (let k = -7; k <= 7; k++) {
        for (const kind of ['pan', 'cov']) {
          const u = k * 0.2 + (kind === 'cov' ? 0.1 : 0);
          const smax = L * (1 - Math.abs(u) / (eave + 0.02)) - 0.06;
          if (smax < 0.12) continue;
          for (let c = 0, s = 0; s < smax; c++, s += expo) {
            const len = Math.min(tileLen, smax - s + 0.02);
            if (len < 0.08) break;
            const dl = (r() - 0.5) * 0.12;
            if (f === 0 && kind === 'cov' && c === brokenAt.course && Math.abs(u - brokenAt.u) < 0.01) { broken = { M, u, s, len }; continue; }
            let geo = kind === 'pan' ? pan(u, s, len, dl) : cov(u, s, len, dl);
            if (f === 0 && c === 0 && slipped && kind === 'cov' && (k === -2 || k === -1)) { geo.translate(0, -0.01, 0.13 + (k + 2) * 0.03); geo.rotateY((k + 1.5) * 0.06); }
            if (f === 0 && c === 0 && slipped && kind === 'pan' && k === 3) { geo.translate(0, 0, 0.07); geo.rotateY(0.05); }
            geo.applyMatrix4(M);
            (f === 0 && c <= 0 ? eaveRow : field).push(geo);
          }
        }
      }
      // Hip tiles along the corner from eave corner to apex, bedded in mortar.
      const A = new THREE.Vector3(eave, eaveY, eave).applyMatrix4(new THREE.Matrix4().makeRotationY(f * PI / 2)), Bp = new THREE.Vector3(0, apexY, 0);
      const d = Bp.clone().sub(A), len = d.length(); d.normalize();
      const upv = new THREE.Vector3(0, 1, 0).sub(d.clone().multiplyScalar(d.y)).normalize(), xv = new THREE.Vector3().crossVectors(upv, d);
      const HM = new THREE.Matrix4().makeBasis(xv, upv, d).setPosition(A);
      for (let s = 0; s < len - 0.05; s += 0.33) { const tl = Math.min(0.4, len - s); hipT.push(tint(xf(new THREE.CylinderGeometry(0.1, 0.11, tl, 10, 1, true, PI - 1.4, 2.8), [0, 0.085 + s * 0.004, s + tl / 2], [PI / 2, 0, 0]), C.tile, (r() - 0.5) * 0.1).applyMatrix4(HM)); }
      mortar.push(xf(new THREE.BoxGeometry(0.26, 0.07, len), [0, 0.05, len / 2]).applyMatrix4(HM));
    }
    const TM = VC({ roughness: 0.7, side: THREE.DoubleSide });
    add(g, T(merge(field, TM), 'tile-broken'));
    add(g, T(merge(eaveRow, TM), 'tile-slipped'));
    add(g, T(merge(hipT, TM), 'tile-hip-mortar'), T(merge(mortar, '#cfc6b2', { roughness: 0.95 }), 'tile-hip-mortar'));
    add(g, T(mesh(gSph(0.09, [0, apexY + 0.08, 0], [1, 1.3, 1], 10, 8), C.tile), 'tile-hip-mortar'));
    // Bird-stop closures at the front eave (fill the arch openings).
    const bs = []; for (let k = -7; k <= 7; k++) bs.push(xf(new THREE.CircleGeometry(0.066, 10, 0, PI), [k * 0.2 + 0.1, 0.04, -0.005]).applyMatrix4(faceMat(0)));
    add(g, T(merge(bs, '#a35230', { side: THREE.DoubleSide }), 'tile-slipped'));
    if (slipped) {
      const gaps = []; for (const k of [-2, -1]) gaps.push(xf(new THREE.PlaneGeometry(0.13, 0.14), [k * 0.2 + 0.1, 0.012, -0.36], [-PI / 2, 0, 0]).applyMatrix4(faceMat(0)));
      add(g, T(merge(gaps, '#151311'), 'tile-slipped'));
    }
    add(g, T(hit(3.0, 0.25, 0.5, [0, eaveY + 0.07, eave - 0.2], [-pitch, 0, 0]), 'tile-slipped'));
    // The broken cover tile: lower half in place, upper piece gone, felt showing; shard on the slab.
    const b = broken;
    if (b) {
      const lower = tint(xf(new THREE.CylinderGeometry(0.068, 0.076, b.len * 0.45, 9, 1, true, -1.3, 2.6), [b.u, 0.042 + b.s * 0.012, -b.s - b.len * 0.775], [-PI / 2, 0, 0]), C.tileDark).applyMatrix4(b.M);
      const hole = xf(new THREE.PlaneGeometry(0.15, b.len * 0.5), [b.u, 0.025, -b.s - b.len * 0.3], [-PI / 2, 0, 0]).applyMatrix4(b.M);
      const edge = xf(new THREE.PlaneGeometry(0.16, 0.05), [b.u, 0.075 + b.s * 0.012, -b.s - b.len * 0.55], [-PI / 2 + 0.4, 0, 0.3]).applyMatrix4(b.M);
      add(g, T(mesh(lower, VC({ roughness: 0.7, side: THREE.DoubleSide })), 'tile-broken'), T(mesh(hole, '#141210', { side: THREE.DoubleSide }), 'tile-broken'));
      add(g, T(mesh(edge, crackMat('tileedge', { color: '#5a2a16', width: 4, branches: 3 })), 'tile-broken'));
      const c = new THREE.Vector3(b.u, 0.06, -b.s - b.len * 0.4).applyMatrix4(b.M);
      add(g, T(hit(0.22, 0.2, 0.36, c.toArray(), [-pitch, 0, 0]), 'tile-broken'));
    }
    const shard = mesh(xf(new THREE.CylinderGeometry(0.07, 0.07, 0.14, 7, 1, true, PI - 0.9, 1.6), [0.45, 0.02, half + 0.55], [PI / 2 - 0.2, 0.7, 0.1]), C.tileDark, { side: THREE.DoubleSide });
    add(g, T(shard, 'tile-broken'));
    return g;
  },
};

// ── GARAGE ──────────────────────────────────────────────────────────────────
const garage = {
  // ── Main panel, dead front off. Door (hinged on the tub) open, showing a blank directory.
  'gar-panel': (states) => {
    const g = group('panel');
    const kOk = !isDef(states, 'panel-knockouts'), wOk = !isDef(states, 'panel-white-hot'), rOk = !isDef(states, 'panel-rust'), hOk = !isDef(states, 'panel-breaker-heat');
    const W = 0.36, H = 0.72, D = 0.095, GR = '#8f9498';
    add(g, merge([gBox(W, H, 0.004, [0, H / 2, 0.002]), gBox(0.004, H, D, [-W / 2 + 0.002, H / 2, D / 2]), gBox(0.004, H, D, [W / 2 - 0.002, H / 2, D / 2]),
      gBox(W, 0.004, D, [0, H - 0.002, D / 2]), gBox(W, 0.004, D, [0, 0.002, D / 2])], GR, { roughness: 0.6, metalness: 0.3 }));
    // Installer's pencil mark: someone signed this in 1987.
    add(g, tdecal(0.1, 0.03, dmat('pencil', () => textTex(['R. TATE  3-87'], { w: 256, h: 64, bg: 'rgba(0,0,0,0)', fg: 'rgba(60,60,70,0.8)', font: 'italic 34px serif' }), { opacity: 0.9 }), [-0.11, 0.69, 0.0045]));
    // Bus, neutral bar, ground bar
    const TIN = mat('#c9ccc8', { metalness: 0.7, roughness: 0.35 });
    add(g, merge([gBox(0.014, 0.4, 0.006, [-0.012, 0.34, 0.03]), gBox(0.014, 0.4, 0.006, [0.012, 0.34, 0.03])], TIN));
    const scr = []; for (let y = 0.2; y < 0.5; y += 0.021) scr.push(gCyl(0.0035, 0.0035, 0.008, [-0.14, y, 0.04], [PI / 2, 0, 0], 8)); for (let y = 0.16; y < 0.34; y += 0.024) scr.push(gCyl(0.0035, 0.0035, 0.008, [0.145, y, 0.04], [PI / 2, 0, 0], 8));
    add(g, merge([gBox(0.012, 0.32, 0.012, [-0.14, 0.35, 0.032]), gBox(0.01, 0.2, 0.012, [0.145, 0.25, 0.032]), ...scr], TIN));
    add(g, mesh(gCyl(0.004, 0.004, 0.012, [-0.14, 0.52, 0.03], [PI / 2, 0, 0], 8), C.green));
    // Breakers: two columns × 14 spaces (1" each). Specials kept separate for tagging & thermal.
    const rowY = (i) => 0.505 - i * 0.026;
    const bodies = [], handles = [];
    const spec = { dt: ['L', 4], heat: ['L', 7], wh: ['R', 8] };
    const isSpec = (col, i) => (col === 'L' && (i === 4 || i === 7)) || (col === 'R' && (i === 8 || i === 9));
    const brk = (col, i, span = 1) => { const x = col === 'L' ? -0.04 : 0.04, y = rowY(i) - (span - 1) * 0.013; return [gBox(0.074, 0.025 * span + 0.001 * (span - 1), 0.055, [x, y, 0.0675]), gBox(0.014 + (span - 1) * 0.004, 0.012 * span, 0.014, [x, y, 0.1])]; };
    for (const col of ['L', 'R']) for (let i = 0; i < 14; i++) {
      if (isSpec(col, i) || (col === 'R' && i >= 12) || (col === 'L' && i === 1) || (col === 'R' && i === 1)) continue;
      const span = (i === 0) ? 2 : 1; const [b, h] = brk(col, i, span); bodies.push(b); handles.push(h);
    }
    const main = [gBox(0.11, 0.1, 0.06, [0, 0.6, 0.04])];
    add(g, T(merge([...bodies, ...main], '#1d1e21', { roughness: 0.5 }), 'panel-breaker-heat'));
    add(g, T(merge([...handles, gBox(0.06, 0.03, 0.025, [0, 0.6, 0.083])], '#3a3c40', { roughness: 0.5 }), 'panel-breaker-heat'));
    const stab = []; for (const i of [12, 13]) stab.push(gBox(0.03, 0.012, 0.006, [0.015, rowY(i), 0.036]));
    add(g, merge(stab, TIN));
    const dtB = brk('L', 4), hB = brk('L', 7), wB = brk('R', 8, 2);
    const dtM = T(merge(dtB, '#1d1e21', { roughness: 0.5 }), 'panel-double-tap');
    const hM = T(merge(hB, '#1d1e21', { roughness: 0.5 }), 'panel-breaker-heat'); thermal(hM, hOk ? 'warm' : 'hot');
    const wM = T(merge(wB, '#1d1e21', { roughness: 0.5 }), 'panel-white-hot');
    add(g, dtM, hM, wM);
    // Branch wiring: hots to gutters and out the top/bottom clamps; neutrals to the bar; grounds to the ground bar.
    const blk = [], red = [], wht = [], bare = [], sheaths = [];
    const termX = (col) => col === 'L' ? -0.077 : 0.077;
    const route = (col, i, k, up) => {
      const tx = termX(col), y = rowY(i), gx = (col === 'L' ? -1 : 1) * (0.1 + (k % 4) * 0.005), ey = up ? 0.715 : 0.006, ex = (col === 'L' ? -1 : 1) * (0.06 + (k % 5) * 0.012);
      return [[tx, y, 0.088], [gx, y + 0.004, 0.07], [gx, up ? 0.64 : 0.08, 0.06], [ex, ey + (up ? -0.015 : 0.015), 0.055], [ex, ey, 0.05]];
    };
    let k = 0;
    for (const col of ['L', 'R']) for (let i = 0; i < 12; i++) {
      if ((col === 'L' && i === 1) || (col === 'R' && i === 1) || isSpec(col, i)) continue;
      const up = i < 6; const p = route(col, i, k++, up);
      (i === 0 ? red : blk).push(gTube(p, 0.0026, 18, 5));
      const end = p[p.length - 1];
      sheaths.push(tint(gCyl(0.0075, 0.0075, 0.03, [end[0], end[1] + (up ? -0.012 : 0.012), 0.05], [0, 0, 0], 8), (k % 3) ? '#e8e3d4' : '#d9b84a'));
      const ny = 0.2 + ((k * 7) % 14) * 0.021;
      wht.push(gTube([[end[0], end[1] + (up ? -0.025 : 0.025), 0.045], [col === 'L' ? -0.12 : 0.0, up ? 0.62 : 0.06, 0.04], [-0.125, ny, 0.045], [-0.14, ny, 0.044]], 0.0024, 16, 5));
      const gy = 0.16 + ((k * 5) % 8) * 0.024;
      bare.push(gTube([[end[0], end[1] + (up ? -0.025 : 0.025), 0.03], [0.12, up ? 0.55 : 0.1, 0.025], [0.145, gy, 0.03]], 0.0013, 14, 4));
    }
    add(g, merge(blk, '#151515', { roughness: 0.6 }), merge(red, '#b3221d', { roughness: 0.6 }), merge(wht, C.wireWhite, { roughness: 0.6 }), merge(bare, C.wireBare, { metalness: 0.6, roughness: 0.4 }), merge(sheaths, VC()));
    // Double tap: two conductors under one single-pole terminal screw.
    const dty = rowY(4);
    const dtw = merge([gTube([[-0.077, dty, 0.088], [-0.1, dty + 0.01, 0.07], [-0.103, 0.64, 0.06], [-0.09, 0.705, 0.052]], 0.0028, 18, 5),
      gTube([[-0.077, dty - 0.002, 0.09], [-0.108, dty - 0.01, 0.075], [-0.112, 0.08, 0.06], [-0.1, 0.012, 0.052]], 0.0024, 18, 5), gCyl(0.004, 0.004, 0.006, [-0.077, dty, 0.093], [PI / 2, 0, 0], 8)], '#151515', { roughness: 0.6 });
    add(g, T(dtw, 'panel-double-tap'), T(hit(0.09, 0.04, 0.05, [-0.06, dty, 0.085]), 'panel-double-tap'));
    // The loaded circuit (thermal truth)
    const hw = T(mesh(gTube([[-0.077, rowY(7), 0.088], [-0.115, rowY(7) - 0.004, 0.07], [-0.117, 0.08, 0.06], [-0.075, 0.012, 0.05]], 0.0028, 18, 5), '#151515', { roughness: 0.6 }), 'panel-breaker-heat');
    thermal(hw, hOk ? 'warm' : 'hot'); add(g, hw);
    // 240 V circuit on 10/2: black + white used as a hot.
    const y8 = rowY(8), y9 = rowY(9);
    add(g, T(mesh(gTube([[0.077, y8, 0.088], [0.11, y8, 0.07], [0.114, 0.08, 0.06], [0.09, 0.012, 0.052]], 0.003, 18, 5), '#151515', { roughness: 0.6 }), 'panel-white-hot'));
    add(g, T(mesh(gTube([[0.077, y9, 0.088], [0.104, y9 - 0.004, 0.07], [0.106, 0.08, 0.06], [0.082, 0.012, 0.052]], 0.003, 18, 5), C.wireWhite, { roughness: 0.6 }), 'panel-white-hot'));
    add(g, T(mesh(gCyl(0.008, 0.008, 0.03, [0.086, 0.018, 0.05]), '#e07b2a'), 'panel-white-hot'));
    if (wOk) { const tp = []; for (const y of [y9 - 0.008, y9 - 0.03, y9 - 0.05]) tp.push(gCyl(0.0042, 0.0042, 0.009, [0.104, y, 0.07], [0, 0, 0], 8)); add(g, T(merge(tp, '#0c0c0c', { roughness: 0.3 }), 'panel-white-hot')); }
    add(g, T(hit(0.06, 0.08, 0.04, [0.095, (y8 + y9) / 2 - 0.02, 0.08]), 'panel-white-hot'));
    // Service entrance: aluminum conductors from the top hub to the main lugs and neutral lug.
    const se = [gTube([[-0.015, 0.73, 0.05], [-0.02, 0.69, 0.06], [-0.03, 0.665, 0.07]], 0.008, 12, 8), gTube([[0.015, 0.73, 0.05], [0.02, 0.69, 0.06], [0.03, 0.665, 0.07]], 0.008, 12, 8),
      gTube([[0.0, 0.73, 0.03], [-0.07, 0.66, 0.03], [-0.13, 0.58, 0.035], [-0.14, 0.53, 0.04]], 0.008, 16, 8)];
    add(g, T(merge(se, '#1a1a1a', { roughness: 0.5 }), 'panel-aluminum-sec'));
    add(g, T(merge([gCyl(0.006, 0.006, 0.014, [-0.03, 0.655, 0.072], [0, 0, 0], 8), gCyl(0.006, 0.006, 0.014, [0.03, 0.655, 0.072], [0, 0, 0], 8), gCyl(0.006, 0.006, 0.014, [-0.14, 0.525, 0.042], [0, 0, 0], 8),
      gBox(0.02, 0.016, 0.018, [-0.03, 0.645, 0.07]), gBox(0.02, 0.016, 0.018, [0.03, 0.645, 0.07])], '#c3c8cb', { metalness: 0.8, roughness: 0.3 }), 'panel-aluminum-sec'));
    add(g, T(merge([gSph(0.006, [-0.03, 0.662, 0.08], [1, 0.6, 1]), gSph(0.006, [0.03, 0.662, 0.08], [1, 0.6, 1])], '#6f7378', { roughness: 0.9 }), 'panel-aluminum-sec'));
    add(g, T(merge([gTube([[0.0, 0.705, 0.033], [-0.02, 0.7, 0.032]], 0.0085, 4, 8)], '#f0f0f0'), 'panel-aluminum-sec'));
    add(g, mesh(gCyl(0.03, 0.03, 0.025, [0, 0.733, 0.04], [0, 0, 0], 16), C.galv, GALV));
    // Rust / water entry at the service hub.
    if (!rOk) {
      add(g, T(tdecal(0.14, 0.3, dmat('panelrust', () => ctex('panelrust', 128, 256, (c, w, h) => {
        const rr = rng('prust'); c.clearRect(0, 0, w, h);
        for (let i = 0; i < 22; i++) { const x = w * 0.3 + rr() * w * 0.4, len = h * (0.3 + rr() * 0.7), gr = c.createLinearGradient(0, 0, 0, len); gr.addColorStop(0, 'rgba(130,62,20,0.9)'); gr.addColorStop(1, 'rgba(130,62,20,0)'); c.fillStyle = gr; c.fillRect(x, 0, 2 + rr() * 5, len); }
      }), { opacity: 1 }), [0.0, 0.57, 0.0045]), 'panel-rust'));
      add(g, T(tdecal(0.12, 0.08, stainMat('panelrusttop', '#7b3c18', 3, 0.9), [0, 0.7175, 0.05], [PI / 2, 0, 0]), 'panel-rust'));
      add(g, T(merge([gSph(0.007, [-0.033, 0.67, 0.08]), gSph(0.006, [0.035, 0.668, 0.079]), gSph(0.005, [0.02, 0.672, 0.074])], C.rust, { roughness: 1 }), 'panel-rust'));
    }
    add(g, T(hit(0.33, 0.13, 0.02, [0, 0.645, 0.012]), 'panel-rust'));
    // Knockouts in the tub walls: sealed / intact (ok) or open holes (defect).
    const kos = [[[-0.06, 0.0045, 0.05], [0, 0, 0], 0.014], [[0.1, 0.0045, 0.045], [0, 0, 0], 0.018], [[-0.1755, 0.3, 0.05], [0, 0, PI / 2], 0.014]];
    kos.forEach(([p, rot, rr]) => {
      if (kOk) add(g, T(merge([gCyl(rr, rr, 0.0015, p, rot, 16), xf(new THREE.TorusGeometry(rr * 0.7, 0.0008, 4, 16), p, [rot[0] + PI / 2, rot[1], rot[2]])], '#7e8387', { metalness: 0.3 }), 'panel-knockouts'));
      else add(g, T(mesh(gCyl(rr, rr, 0.0015, p, rot, 16), '#050505'), 'panel-knockouts'));
      add(g, T(hit(0.05, 0.05, 0.05, [p[0] + (rot[2] ? 0.02 : 0), p[1] + (rot[2] ? 0 : 0.02), p[2]]), 'panel-knockouts'));
    });
    // Door with the circuit directory, swung open ~115°.
    const door = group('door'); door.position.set(-W / 2, H / 2, D); door.rotation.y = -2.0;
    add(door, T(merge([gBox(W, H, 0.004, [W / 2, 0, 0]), gBox(0.008, H, 0.015, [W - 0.004, 0, -0.008]), gBox(0.02, 0.04, 0.012, [W - 0.02, 0, 0.008])], GR, { roughness: 0.6, metalness: 0.3 }), 'panel-labeling'));
    const dir = tmat('directory', () => ctex('directory', 256, 448, (c, w, h) => {
      const rr = rng('dir'); c.fillStyle = '#efe9d6'; c.fillRect(0, 0, w, h);
      c.fillStyle = '#222'; c.font = 'bold 18px sans-serif'; c.fillText('CIRCUIT DIRECTORY', 32, 26);
      c.strokeStyle = '#8a8478'; c.lineWidth = 1; c.font = '11px sans-serif';
      for (let i = 0; i < 15; i++) { const y = 44 + i * 26; c.strokeRect(8, y, w / 2 - 12, 24); c.strokeRect(w / 2 + 4, y, w / 2 - 12, 24); c.fillStyle = '#555'; c.fillText(String(2 * i + 1), 12, y + 15); c.fillText(String(2 * i + 2), w / 2 + 8, y + 15); }
      c.fillStyle = 'rgba(90,90,100,0.35)'; c.font = 'italic 14px serif'; c.fillText('kit?', 40, 44 + 2 * 26 + 16); c.fillText('lites', w / 2 + 34, 44 + 5 * 26 + 16); c.fillText('?', 44, 44 + 9 * 26 + 16);
      const gr = c.createRadialGradient(w * 0.6, h * 0.7, 10, w * 0.6, h * 0.7, 110); gr.addColorStop(0, 'rgba(150,110,50,0.35)'); gr.addColorStop(0.8, 'rgba(150,110,50,0.25)'); gr.addColorStop(1, 'rgba(150,110,50,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h);
      for (let i = 0; i < 400; i++) { c.fillStyle = `rgba(120,100,70,${rr() * 0.12})`; c.fillRect(rr() * w, rr() * h, 2, 2); }
    }), { roughness: 0.95, side: THREE.DoubleSide });
    add(door, T(tdecal(0.25, 0.44, dir, [W / 2, 0.02, -0.003], [0, PI, 0]), 'panel-labeling'));
    add(g, door);
    return g;
  },

  // ── 50-gal atmospheric gas water heater. Data plate 09/2009, no FVIR listing. TPR has no
  //    discharge tube (always). Stand (variable). Drip leg (variable). Draft hood & vent fine.
  'gar-water-heater': (states) => {
    const g = group('wh'); const elevOk = !isDef(states, 'wh-elevation'); const trapOk = !isDef(states, 'wh-sediment-trap');
    const h0 = elevOk ? 18 * IN : 0, R = 0.25, top = h0 + 1.3;
    const JK = mat('#bdb6a6', { roughness: 0.5, metalness: 0.15 });
    add(g, mesh(gCyl(R, R, 1.25, [0, h0 + 0.04 + 0.625, 0], [0, 0, 0], 32), JK));
    add(g, merge([gCyl(R + 0.003, R + 0.003, 0.05, [0, h0 + 0.025, 0], [0, 0, 0], 32), gCyl(R - 0.005, R - 0.005, 0.02, [0, top, 0], [0, 0, 0], 32)], '#56524b', { roughness: 0.6 }));
    if (elevOk) {
      const stand = [gBox(0.6, 0.02, 0.6, [0, h0 - 0.01, 0])];
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) stand.push(gBox(0.035, h0 - 0.02, 0.035, [sx * 0.27, (h0 - 0.02) / 2, sz * 0.27]));
      for (const sz of [-1, 1]) stand.push(gBox(0.54, 0.025, 0.006, [0, 0.12, sz * 0.27]));
      for (const sx of [-1, 1]) stand.push(gBox(0.006, 0.025, 0.54, [sx * 0.27, 0.12, 0]));
      add(g, T(merge(stand, '#4b4f53', { roughness: 0.6, metalness: 0.4 }), 'wh-elevation'));
    }
    add(g, T(hit(0.6, h0 + 0.3, 0.62, [0, (h0 + 0.3) / 2, 0]), 'wh-elevation'));
    // Burner access door + gas control valve + pilot/thermocouple tubes
    add(g, T(merge([gBox(0.2, 0.14, 0.008, [0, h0 + 0.14, R - 0.006]), gBox(0.03, 0.02, 0.004, [0, h0 + 0.14, R + 0.0])], '#3f4246', { metalness: 0.3 }), 'wh-elevation'));
    add(g, T(tdecal(0.02, 0.016, mat('#14100c'), [0.06, h0 + 0.16, R + 0.0005]), 'wh-elevation'));
    const VB = mat('#2b2c2f', { roughness: 0.45 });
    add(g, mesh(gBox(0.1, 0.13, 0.07, [0, h0 + 0.33, R + 0.03]), VB));
    add(g, merge([gCyl(0.018, 0.018, 0.02, [0, h0 + 0.405, R + 0.035]), gBox(0.03, 0.006, 0.008, [0, h0 + 0.418, R + 0.035])], '#b8261f'));
    add(g, mesh(gCyl(0.03, 0.03, 0.012, [0, h0 + 0.32, R + 0.07], [PI / 2, 0, 0], 20), tmat('whdial', () => textTex(['VAC  A  B  C', '   HOT'], { w: 128, h: 64, bg: '#d6d0c2', font: 'bold 18px sans-serif' }))));
    add(g, merge([gTube([[-0.03, h0 + 0.27, R + 0.04], [-0.04, h0 + 0.2, R + 0.02], [-0.04, h0 + 0.16, R]], 0.0025, 10, 5), gTube([[0.02, h0 + 0.27, R + 0.04], [0.03, h0 + 0.2, R + 0.02], [0.035, h0 + 0.16, R]], 0.0025, 10, 5)], C.copper, { metalness: 0.6 }));
    // Data plate
    const plate = tmat('whplate', () => textTex(['MODEL G50-40N  NATURAL GAS', 'SERIAL 0909A417823', 'CAPACITY 50 U.S. GAL', 'INPUT 40,000 BTU/HR', 'RECOVERY 41 GPH @ 90°F', 'MFG DATE 09/2009', 'MAX WORKING PRESS 150 PSI'], { w: 512, h: 300, font: 'bold 30px monospace', bg: '#e8e3d3' }), { roughness: 0.6 });
    const pl = mesh(new THREE.PlaneGeometry(0.2, 0.12), plate); pl.position.set(0, h0 + 0.95, R + 0.002); add(g, T(pl, 'wh-age'));
    add(g, T(hit(0.22, 0.14, 0.02, [0, h0 + 0.95, R + 0.01]), 'wh-age'));
    // Top: anode plug, cold/hot nipples with dielectric unions, copper risers, cold shutoff
    const CU = mat(C.copper, { metalness: 0.6, roughness: 0.35 });
    add(g, mesh(gCyl(0.02, 0.02, 0.02, [0.0, top + 0.02, 0.12], [0, 0, 0], 6), '#7d7f80', { metalness: 0.6 }));
    const fit = [];
    for (const sx of [-1, 1]) fit.push(gCyl(0.013, 0.013, 0.06, [sx * 0.13, top + 0.03, -0.05]), gCyl(0.022, 0.022, 0.035, [sx * 0.13, top + 0.075, -0.05], [0, 0, 0], 6));
    add(g, merge(fit, '#a9a59a', { metalness: 0.6, roughness: 0.4 }));
    add(g, merge([gCyl(0.011, 0.011, 0.6, [-0.13, top + 0.39, -0.05]), gCyl(0.011, 0.011, 0.6, [0.13, top + 0.39, -0.05]), gCyl(0.018, 0.018, 0.05, [-0.13, top + 0.35, -0.05])], CU));
    add(g, mesh(gBox(0.07, 0.01, 0.012, [-0.13, top + 0.37, -0.02]), '#c8312b'));
    // Draft hood + vent connector (correct: rises, sloped up to the thimble, screwed joints)
    const GV = mat(C.galv, GALV);
    const dh = [gCyl(0.06, 0.11, 0.07, [0, top + 0.065, 0], [0, 0, 0], 24, true), gCyl(0.05, 0.05, 0.06, [0, top + 0.13, 0], [0, 0, 0], 20)];
    for (let i = 0; i < 3; i++) dh.push(gBox(0.012, 0.035, 0.012, [Math.cos(i * 2.1) * 0.095, top + 0.025, Math.sin(i * 2.1) * 0.095]));
    dh.push(gCyl(0.05, 0.05, 0.22, [0, top + 0.27, 0], [0, 0, 0], 20), gSph(0.052, [0, top + 0.39, 0], [1, 1, 1], 12, 8), gPipe([0, top + 0.39, 0], [0, top + 0.43, -0.4], 0.05, 20));
    add(g, T(merge(dh, mat(C.galv, { ...GALV, side: THREE.DoubleSide })), 'wh-draft-hood'));
    add(g, T(merge([gCyl(0.004, 0.004, 0.01, [0.05, top + 0.16, 0], [0, 0, PI / 2], 6), gCyl(0.004, 0.004, 0.01, [-0.05, top + 0.16, 0], [0, 0, PI / 2], 6), gCyl(0.004, 0.004, 0.01, [0, top + 0.16, 0.05], [PI / 2, 0, 0], 6)], C.steel, { metalness: 0.8 }), 'wh-draft-hood'));
    add(g, T(hit(0.26, 0.2, 0.26, [0, top + 0.09, 0]), 'wh-draft-hood'));
    // TPR valve on the side, outlet open with nothing on it.
    const BR = mat(C.brass, { metalness: 0.65, roughness: 0.35 });
    const ty = h0 + 1.13;
    add(g, T(merge([gCyl(0.016, 0.016, 0.06, [R + 0.02, ty, 0], [0, 0, PI / 2]), gCyl(0.02, 0.02, 0.04, [R + 0.05, ty, 0], [0, 0, 0], 8), gCyl(0.015, 0.015, 0.035, [R + 0.05, ty - 0.035, 0])], BR), 'wh-tpr-discharge'));
    add(g, T(mesh(gBox(0.045, 0.006, 0.012, [R + 0.06, ty + 0.025, 0], [0, 0, -0.3]), '#a9a59a', { metalness: 0.6 }), 'wh-tpr-discharge'));
    add(g, T(mesh(xf(new THREE.CircleGeometry(0.011, 12), [R + 0.05, ty - 0.0526, 0], [PI / 2, 0, 0]), '#090909'), 'wh-tpr-discharge'));
    add(g, T(mesh(gSph(0.009, [R + 0.055, ty - 0.055, 0.008], [1, 0.6, 1], 6, 4), '#e7e1d2', { roughness: 1 }), 'wh-tpr-discharge'));
    add(g, T(hit(0.14, 0.14, 0.1, [R + 0.05, ty - 0.01, 0]), 'wh-tpr-discharge'));
    // Gas supply
    const BI = mat('#2b2b2b', { roughness: 0.5, metalness: 0.4 });
    const gx = 0.33, gz = -0.28, ty2 = h0 + 0.33, id = 'wh-sediment-trap';
    add(g, mesh(gPipe([gx, 1.95, gz], [gx, h0 + 0.66, gz], 0.014), BI));
    add(g, T(merge([gCyl(0.02, 0.02, 0.06, [gx, h0 + 0.62, gz]), gBox(0.012, 0.012, 0.07, [gx, h0 + 0.62, gz + 0.04])], BI), id));
    add(g, mesh(gBox(0.014, 0.014, 0.075, [gx, h0 + 0.62, gz + 0.045]), C.gasYellow));
    if (trapOk) {
      const pp = [gPipe([gx, h0 + 0.59, gz], [gx, ty2, gz], 0.014), gCyl(0.021, 0.021, 0.045, [gx, ty2, gz], [0, 0, 0], 10), gPipe([gx, ty2, gz], [gx, ty2 - 0.1, gz], 0.014), gCyl(0.019, 0.019, 0.022, [gx, ty2 - 0.11, gz], [0, 0, 0], 8),
        gPipe([gx, ty2, gz], [gx, ty2, 0.29], 0.014), gCyl(0.024, 0.024, 0.03, [gx, ty2, 0.02], [PI / 2, 0, 0], 6), gSph(0.02, [gx, ty2, 0.29]), gPipe([gx, ty2, 0.29], [0.05, ty2, 0.29], 0.014)];
      add(g, T(merge(pp, BI), id));
    } else {
      add(g, T(merge([gPipe([gx, h0 + 0.59, gz], [gx, h0 + 0.55, gz], 0.014), gCyl(0.02, 0.02, 0.03, [gx, h0 + 0.535, gz], [0, 0, 0], 6), gCyl(0.02, 0.02, 0.03, [0.06, ty2, 0.29], [0, 0, PI / 2], 6)], BI), id));
      add(g, T(mesh(gTube([[gx, h0 + 0.52, gz], [gx, h0 + 0.4, gz + 0.1], [0.3, ty2 + 0.02, 0.2], [0.16, ty2, 0.3], [0.075, ty2, 0.29]], 0.009, 40, 8, 0.15), C.gasYellow, { roughness: 0.5 }), id));
    }
    add(g, T(hit(0.14, 0.32, 0.65, [gx, ty2 + 0.05, 0.0]), id));
    return g;
  },

  // ── Garage-to-house door: closer (variable), pet door cut into it (always).
  'gar-fire-door': (states) => {
    const g = group('firedoor'); const ok = !isDef(states, 'fire-door-closer');
    const TR = mat('#f0eee8', { roughness: 0.5 });
    add(g, merge([gBox(0.045, 2.08, 0.11, [-0.43, 1.04, 0.055]), gBox(0.045, 2.08, 0.11, [0.43, 1.04, 0.055]), gBox(0.905, 0.045, 0.11, [0, 2.075, 0.055]),
      gBox(0.065, 2.12, 0.015, [-0.485, 1.06, 0.1175]), gBox(0.065, 2.12, 0.015, [0.485, 1.06, 0.1175]), gBox(1.035, 0.065, 0.015, [0, 2.13, 0.1175])], TR));
    const SL = mat('#ecebe6', { roughness: 0.45, metalness: 0.15 });
    const pan = [gBox(0.81, 2.03, 0.044, [0, 1.025, 0.06])];
    for (const [x, y, w, h] of [[-0.19, 1.72, 0.27, 0.5], [0.19, 1.72, 0.27, 0.5], [-0.19, 1.05, 0.27, 0.62], [0.19, 1.05, 0.27, 0.62], [-0.19, 0.36, 0.27, 0.48], [0.19, 0.36, 0.27, 0.48]]) pan.push(gBox(w, h, 0.004, [x, y, 0.083]));
    add(g, T(merge(pan, SL), 'fire-door-pet'));
    // Pet flap (always): cut through the bottom of the slab.
    const PF = mat('#d9d6cc', { roughness: 0.5 });
    add(g, T(merge([gBox(0.26, 0.035, 0.03, [0, 0.47, 0.09]), gBox(0.26, 0.035, 0.03, [0, 0.13, 0.09]), gBox(0.035, 0.34, 0.03, [-0.1125, 0.3, 0.09]), gBox(0.035, 0.34, 0.03, [0.1125, 0.3, 0.09])], PF), 'fire-door-pet'));
    add(g, T(mesh(gBox(0.19, 0.3, 0.004, [0, 0.3, 0.09]), mat('#4a4844', { transparent: true, opacity: 0.75, roughness: 0.2 })), 'fire-door-pet'));
    add(g, T(mesh(gBox(0.16, 0.012, 0.008, [0, 0.16, 0.093]), C.black), 'fire-door-pet'));
    // Knob + deadbolt
    add(g, merge([gCyl(0.03, 0.03, 0.01, [0.33, 0.92, 0.087], [PI / 2, 0, 0]), gSph(0.028, [0.33, 0.92, 0.115]), gCyl(0.03, 0.03, 0.01, [0.33, 1.1, 0.087], [PI / 2, 0, 0]), gBox(0.012, 0.035, 0.015, [0.33, 1.1, 0.098])], '#b9b3a3', { metalness: 0.75, roughness: 0.3 }));
    // Hinges
    const HG = mat('#a8a49a', { metalness: 0.7, roughness: 0.35 }), hg = [];
    for (const y of [0.2, 1.0, 1.85]) hg.push(gCyl(0.008, 0.008, 0.1, [-0.405, y, 0.087]), gBox(0.03, 0.1, 0.003, [-0.39, y, 0.083]), gCyl(0.009, 0.009, 0.008, [-0.405, y + 0.054, 0.087]));
    add(g, T(merge(hg, HG), 'fire-door-closer'));
    if (ok) {
      add(g, T(merge([gBox(0.26, 0.055, 0.05, [-0.22, 1.93, 0.107]), gCyl(0.012, 0.012, 0.03, [-0.1, 1.96, 0.14]), gPipe([-0.1, 1.97, 0.15], [0.03, 2.02, 0.22], 0.008), gPipe([0.03, 2.02, 0.22], [0.1, 2.09, 0.14], 0.008), gBox(0.06, 0.04, 0.02, [0.1, 2.09, 0.13])], '#b7bbbe', { metalness: 0.6, roughness: 0.35 }), 'fire-door-closer'));
    } else {
      add(g, T(tdecal(0.3, 0.085, dmat('closerghost', () => ctex('closerghost', 256, 72, (c, w, h) => { c.clearRect(0, 0, w, h); c.fillStyle = 'rgba(255,255,252,0.9)'; c.fillRect(10, 10, w - 20, h - 20); c.strokeStyle = 'rgba(95,88,72,0.55)'; c.lineWidth = 5; c.strokeRect(10, 10, w - 20, h - 20); })), [-0.22, 1.93, 0.0825]), 'fire-door-closer'));
      const holes = []; for (const [x, y] of [[-0.33, 1.95], [-0.33, 1.91], [-0.11, 1.95], [-0.11, 1.91], [0.08, 2.12], [0.12, 2.12]]) holes.push(gCyl(0.003, 0.003, 0.002, [x, y, y > 2.1 ? 0.1257 : 0.0827], [PI / 2, 0, 0], 8));
      add(g, T(merge(holes, '#151515'), 'fire-door-closer'));
    }
    add(g, T(hit(0.45, 0.3, 0.12, [-0.2, 1.97, 0.12]), 'fire-door-closer'));
    return g;
  },

  // ── 16x7 sectional door from inside: tracks, torsion springs, opener rail, photo-eyes.
  //    Frozen moment of the reverse test: the door came down on a flat 2x4 and stayed down.
  'gar-overhead-door': (states) => {
    const g = group('overhead'); const eyesOk = !isDef(states, 'door-photo-eyes');
    const Wd = 4.88, Hd = 2.13, lift = 1.5 * IN, ST = mat('#f3f2ee', { roughness: 0.5, metalness: 0.2 });
    const sec = [], ribs = [];
    for (let i = 0; i < 4; i++) {
      const y = lift + 0.266 + i * 0.5325; sec.push(gBox(Wd, 0.528, 0.04, [0, y, 0.02]));
      for (const x of [-2.4, -1.22, 0, 1.22, 2.4]) ribs.push(gBox(0.05, 0.5, 0.012, [x, y, 0.046]));
      ribs.push(gBox(Wd - 0.04, 0.03, 0.012, [0, y + 0.24, 0.046]), gBox(Wd - 0.04, 0.03, 0.012, [0, y - 0.24, 0.046]));
    }
    ribs.push(gBox(Wd - 0.1, 0.07, 0.035, [0, lift + 0.5325 * 3 + 0.45, 0.07]));
    add(g, merge(sec, ST), merge(ribs, ST));
    const hw = [];
    for (let i = 1; i < 4; i++) { const y = lift + i * 0.5325; for (const x of [-1.22, 0, 1.22]) hw.push(gBox(0.06, 0.1, 0.008, [x, y, 0.058])); for (const sx of [-1, 1]) hw.push(gBox(0.08, 0.1, 0.008, [sx * 2.36, y, 0.058]), gCyl(0.005, 0.005, 0.1, [sx * 2.44, y, 0.07], [0, 0, PI / 2], 6)); }
    for (const sx of [-1, 1]) hw.push(gBox(0.08, 0.1, 0.008, [sx * 2.36, lift + 0.08, 0.058]), gCyl(0.005, 0.005, 0.1, [sx * 2.44, lift + 0.1, 0.07], [0, 0, PI / 2], 6), gBox(0.08, 0.1, 0.008, [sx * 2.36, lift + Hd - 0.08, 0.058]));
    add(g, merge(hw, C.galv, GALV));
    const rol = []; for (let i = 0; i <= 4; i++) for (const sx of [-1, 1]) rol.push(gCyl(0.025, 0.025, 0.018, [sx * 2.49, lift + Math.min(i * 0.5325, Hd - 0.1) + (i ? 0 : 0.1), 0.07], [0, 0, PI / 2], 12));
    add(g, merge(rol, '#e8e4da', { roughness: 0.4 }));
    // Tracks + header + jambs
    const tk = [];
    for (const sx of [-1, 1]) {
      tk.push(gBox(0.004, 2.1, 0.07, [sx * 2.525, 1.05, 0.07]), gBox(0.03, 2.1, 0.004, [sx * 2.51, 1.05, 0.035]), gBox(0.03, 2.1, 0.004, [sx * 2.51, 1.05, 0.105]),
        gRect([sx * 2.525, 2.1, 0.07], [sx * 2.525, 2.3, 0.2], 0.004, 0.07), gRect([sx * 2.525, 2.3, 0.2], [sx * 2.525, 2.36, 0.45], 0.004, 0.07), gBox(0.004, 0.07, 0.6, [sx * 2.525, 2.37, 0.75]),
        gBox(0.05, 0.05, 0.005, [sx * 2.53, 0.6, 0.02]), gBox(0.05, 0.05, 0.005, [sx * 2.53, 1.5, 0.02]));
    }
    add(g, merge(tk, C.galv, GALV));
    add(g, merge([gBox(5.3, 0.2, 0.04, [0, 2.25, 0.02]), gBox(0.14, 2.15, 0.04, [-2.6, 1.075, 0.02]), gBox(0.14, 2.15, 0.04, [2.6, 1.075, 0.02])], '#e9e6de', { roughness: 0.7 }));
    // Torsion assembly
    const tor = [gCyl(0.0125, 0.0125, 5.0, [0, 2.3, 0.14], [0, 0, PI / 2]), gCyl(0.06, 0.06, 0.05, [-2.45, 2.3, 0.14], [0, 0, PI / 2], 16), gCyl(0.06, 0.06, 0.05, [2.45, 2.3, 0.14], [0, 0, PI / 2], 16), gBox(0.12, 0.16, 0.006, [0, 2.3, 0.05])];
    add(g, merge(tor, '#55595d', { metalness: 0.6, roughness: 0.4 }));
    const helix = (x0, x1) => { const pts = []; const n = 220; for (let i = 0; i <= n; i++) { const t = i / n, a = t * 60 * PI; pts.push([x0 + (x1 - x0) * t, 2.3 + Math.cos(a) * 0.032, 0.14 + Math.sin(a) * 0.032]); } return gTube(pts, 0.0045, 440, 5); };
    add(g, merge([helix(-0.95, -0.1), helix(0.1, 0.95)], '#2a2b2d', { metalness: 0.5, roughness: 0.4 }));
    add(g, merge([gPipe([-2.47, 2.25, 0.12], [-2.47, lift + 0.1, 0.07], 0.002, 4), gPipe([2.47, 2.25, 0.12], [2.47, lift + 0.1, 0.07], 0.002, 4)], '#8c9196', { metalness: 0.7 }));
    // Opener rail, trolley, J-arm (door bracket), release cord.
    add(g, merge([gBox(0.04, 0.035, 0.95, [0, 2.31, 0.5]), gBox(0.08, 0.05, 0.04, [0, 2.3, 0.03]), gBox(0.03, 0.15, 0.004, [0, 2.38, 0.96])], '#3d4044', { metalness: 0.5 }));
    const jt = T(merge([gBox(0.06, 0.05, 0.08, [0, 2.27, 0.4]), gPipe([0, 2.25, 0.38], [0, 2.02, 0.12], 0.008), gPipe([0, 2.02, 0.12], [0, lift + Hd - 0.12, 0.06], 0.008), gBox(0.08, 0.1, 0.01, [0, lift + Hd - 0.13, 0.05])], '#6e7276', { metalness: 0.6 }), 'door-auto-reverse');
    add(g, jt, mesh(gPipe([0, 2.25, 0.4], [0, 1.85, 0.42], 0.0015, 4), '#d6d0bf'), mesh(gBox(0.03, 0.08, 0.03, [0, 1.82, 0.42]), C.red));
    // Reverse test: board on the floor, door sitting on it, daylight under the bottom edge.
    add(g, T(mesh(tint(gBox(1.0, 1.5 * IN, 3.5 * IN, [0, 0.75 * IN, 0.03]), LUM), VC()), 'door-auto-reverse'));
    add(g, T(mesh(gBox(Wd, 0.018, 0.05, [0, lift + 0.009, 0.02]), '#1c1c1c', { roughness: 0.8 }), 'door-auto-reverse'));
    add(g, T(mesh(gBox(Wd, lift, 0.004, [0, lift / 2, -0.01]), mat('#fff6dd', { emissive: '#fff1c8', emissiveIntensity: 0.9 })), 'door-auto-reverse'));
    add(g, T(hit(1.2, 0.18, 0.2, [0, 0.08, 0.06]), 'door-auto-reverse'));
    add(g, T(hit(0.25, 0.4, 0.5, [0, 2.15, 0.3]), 'door-auto-reverse'));
    // Photo-eyes: ≤ 6" off the floor (ok) or zip-tied ~3 ft up the track (defect, empty bracket below).
    const eyeY = eyesOk ? 0.13 : 0.9;
    const eye = [], led = [];
    for (const sx of [-1, 1]) {
      eye.push(gBox(0.08, 0.006, 0.05, [sx * 2.465, eyeY - 0.045, 0.1]), gBox(0.006, 0.07, 0.05, [sx * 2.507, eyeY - 0.015, 0.1]), gBox(0.045, 0.07, 0.055, [sx * 2.45, eyeY, 0.1]), gCyl(0.012, 0.012, 0.012, [sx * 2.423, eyeY + 0.01, 0.1], [0, 0, PI / 2], 10));
      led.push(gSph(0.005, [sx * 2.44, eyeY + 0.032, 0.128]));
      if (!eyesOk) eye.push(gBox(0.08, 0.006, 0.05, [sx * 2.465, 0.085, 0.1]), gBox(0.006, 0.07, 0.05, [sx * 2.507, 0.115, 0.1]));
    }
    add(g, T(merge(eye, '#2c2d30', { roughness: 0.5 }), 'door-photo-eyes'));
    add(g, T(merge(led, mat('#ffd060', { emissive: '#ffb020', emissiveIntensity: 1.2 })), 'door-photo-eyes'));
    add(g, merge([gPipe([-2.5, eyeY, 0.075], [-2.5, 2.1, 0.075], 0.002, 4), gPipe([2.5, eyeY, 0.075], [2.5, 2.1, 0.075], 0.002, 4)], '#f0f0ea'));
    if (!eyesOk) add(g, T(merge([gBox(0.004, 0.012, 0.075, [-2.53, eyeY + 0.02, 0.07]), gBox(0.004, 0.012, 0.075, [-2.53, eyeY - 0.03, 0.07]), gBox(0.004, 0.012, 0.075, [2.53, eyeY + 0.02, 0.07])], '#111'), 'door-photo-eyes'));
    for (const sx of [-1, 1]) add(g, T(hit(0.14, 0.16, 0.14, [sx * 2.45, eyeY, 0.1]), 'door-photo-eyes'));
    return g;
  },

  // ── Garage/house common wall: a pipe penetration sealed tight (ok) or a ragged open hole (defect).
  'gar-firewall': (states) => {
    const g = group('firewall'); const bad = isDef(states, 'firewall-penetration'); const id = 'firewall-penetration';
    const W = 2, H = 2.4, t = 0.0127, px = 0.45, py = 1.55;
    const DW = mat(C.drywall, { roughness: 0.9 });
    if (!bad) add(g, T(mesh(gBox(W, H, t, [0, H / 2, t / 2]), DW), id));
    else {
      const sh = new THREE.Shape([new THREE.Vector2(-W / 2, 0), new THREE.Vector2(W / 2, 0), new THREE.Vector2(W / 2, H), new THREE.Vector2(-W / 2, H)]);
      const r = rng('hole'), hole = new THREE.Path(), n = 14;
      for (let i = 0; i < n; i++) { const a = (i / n) * PI * 2, rr = 0.1 + r() * 0.05; const v = [px + Math.cos(a) * rr * 1.2, py + Math.sin(a) * rr]; i ? hole.lineTo(...v) : hole.moveTo(...v); }
      sh.holes.push(hole);
      add(g, T(mesh(new THREE.ExtrudeGeometry(sh, { depth: t, bevelEnabled: false }), DW), id));
      // Cavity contents live inside the drywall thickness so they read whatever is behind the wall.
      const hs = new THREE.Shape(hole.getPoints()); const hf = new THREE.ShapeGeometry(hs); hf.translate(0, 0, 0.0015);
      add(g, T(mesh(hf, '#16120e'), id));
      add(g, T(mesh(gBox(0.038, 0.45, 0.003, [px + 0.07, py, 0.004]), LUM), id));
      add(g, T(mesh(gBox(0.16, 0.4, 0.002, [px - 0.1, py - 0.02, 0.003]), '#d9909a', { roughness: 1 }), id));
      const deb = []; for (let i = 0; i < 6; i++) deb.push(gBox(0.03 + r() * 0.03, 0.012, 0.02, [px - 0.3 + r() * 0.6, 0.006, 0.05 + r() * 0.2], [0, r() * 3, 0]));
      add(g, T(merge(deb, C.drywall), id));
      add(g, T(tdecal(0.42, 0.34, stainMat('holeedge', '#cfc7b7', 2, 0.6), [px, py, t + 0.001]), id));
    }
    const seam = mat('#f5f2ea', { transparent: true, opacity: 0.8, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
    add(g, tdecal(0.1, H, seam, [0.22, H / 2, t + 0.0006]), tdecal(W, 0.1, seam, [0, 1.22, t + 0.0006]));
    const dots = []; for (let x = -0.78; x < 1; x += 0.405) for (let y = 0.15; y < H; y += 0.3) dots.push(xf(new THREE.CircleGeometry(0.006, 6), [x, y, t + 0.0008]));
    add(g, merge(dots, '#f7f4ee'));
    add(g, merge([gBox(0.07, 0.115, 0.008, [-0.7, 1.2, t + 0.004]), gBox(0.008, 0.022, 0.006, [-0.7, 1.2, t + 0.01])], C.white));
    // PVC line passing from the house side through the wall and down the garage face.
    const PV = mat(C.pvcWhite, { roughness: 0.5 });
    add(g, T(merge([gPipe([px, py, -0.1], [px, py, 0.07], 0.03, 16), gSph(0.033, [px, py, 0.075], [1, 1, 1], 12, 8), gPipe([px, py, 0.075], [px, py - 0.6, 0.075], 0.03, 16)], PV), id));
    if (!bad) { add(g, T(mesh(xf(new THREE.TorusGeometry(0.036, 0.008, 6, 20), [px, py, t + 0.002]), '#b8302a', { roughness: 0.7 }), id)); }
    add(g, T(hit(0.5, 0.45, 0.06, [px, py, 0.02]), id));
    return g;
  },
};

// ── ATTIC ───────────────────────────────────────────────────────────────────
const CH_XS = (w, step = 0.61) => { const xs = []; for (let x = -Math.floor(w / 2 / step) * step; x <= w / 2 + 1e-6; x += step) xs.push(x); return xs; };
const attic = {
  // ── Blown fiberglass at ~3" (chord tops showing), a ruler stake, a walked-on patch.
  'att-insulation': (states) => {
    const g = group('insul'); const voidBad = isDef(states, 'insulation-void');
    const W = 4, D = 3, inPatch = (x, z) => x > -1.45 && x < -0.45 && z > -0.95 && z < -0.15;
    add(g, box(W, 0.012, D, C.drywall, [0, -0.006, 0]));
    add(g, merge(chordsG(CH_XS(W - 0.2), -D / 2, D / 2), VC()));
    const ig = insulationGeo(W, D, 3 * IN, 14, 'att', (x, z, y) => {
      if (inPatch(x, z)) y -= 0.018 + 0.008 * Math.sin(x * 30) * Math.sin(z * 25);
      return y;
    });
    const [rest, patch] = splitFaces(ig, inPatch);
    add(g, T(mesh(rest, VC({ roughness: 1 })), 'insulation-depth'));
    const pm = T(mesh(patch, VC({ roughness: 1 })), 'insulation-void'); if (voidBad) thermal(pm, 'cold'); add(g, pm);
    const vh = T(hit(1.0, 0.08, 0.8, [-0.95, 0.04, -0.55]), 'insulation-void'); add(g, vh);
    // Depth ruler: 0–12" card on a stake.
    const rul = tmat('ruler', () => ctex('ruler', 64, 384, (c, w, h) => {
      c.fillStyle = '#f4d23c'; c.fillRect(0, 0, w, h); c.fillStyle = '#111'; c.font = 'bold 16px sans-serif';
      for (let i = 0; i <= 12; i++) { const y = h - i * (h / 12.6) - 6; c.fillRect(0, y, i % 2 ? 18 : 28, 2); if (i) c.fillText(String(i), 34, y + 6); }
      for (let i = 0; i <= 24; i++) { const y = h - i * (h / 25.2) - 6; c.fillRect(0, y, 10, 1); }
      c.save(); c.translate(56, h - 30); c.rotate(-PI / 2); c.font = 'bold 10px sans-serif'; c.fillText('INSULATION DEPTH  INCHES', 0, 0); c.restore();
    }), { roughness: 0.8, side: THREE.DoubleSide });
    const rm = mesh(new THREE.PlaneGeometry(0.075, 0.32), rul); rm.position.set(0.3, 0.16, 0.3); add(g, T(rm, 'insulation-depth'));
    add(g, T(mesh(gBox(0.014, 0.33, 0.006, [0.3, 0.165, 0.295]), LUM), 'insulation-depth'));
    return g;
  },

  // ── Bath fan duct that ends in the insulation (always).
  'att-bath-duct': () => {
    const g = group('bathduct'); const id = 'bath-fan-termination';
    const end = [0.06, 0.03, 0.52];
    add(g, box(0.5, 0.012, 1.3, C.drywall, [0, -0.006, 0]));
    add(g, merge(chordsG([-0.3, 0.3], -0.65, 0.65), VC()));
    const ig = insulationGeo(0.6, 1.3, 3 * IN, 16, 'bd', (x, z, y) => { const d = Math.hypot(x - end[0], z - end[2]); if (d < 0.18) y -= 0.03 * (1 - d / 0.18); if (Math.abs(x) < 0.13 && z < -0.25 && z > -0.53) y = 0.01; return y; });
    const ins = mesh(ig, VC({ roughness: 1 })); add(g, ins);
    add(g, merge([gBox(0.24, 0.14, 0.24, [0, 0.07, -0.4]), gCyl(0.05, 0.05, 0.05, [0, 0.08, -0.26], [PI / 2, 0, 0], 16)], C.galv, GALV));
    add(g, mesh(gTube([[-0.1, 0.13, -0.4], [-0.2, 0.11, -0.3], [-0.29, 0.095, -0.15]], 0.006, 10, 6), '#e2dccb'));
    add(g, T(mesh(gTube([[0, 0.08, -0.24], [0, 0.13, -0.05], [0.03, 0.11, 0.25], [0.05, 0.06, 0.44], end], 0.05, 90, 10, 0.08), mat('#c4c8cb', { metalness: 0.7, roughness: 0.4 })), id));
    add(g, T(tdecal(0.36, 0.36, ringMat('ductwet', '#7a6a48', 3, 0.75), [end[0], 0.06, end[2] + 0.02], [-PI / 2, 0, 0]), id));
    add(g, T(hit(0.25, 0.15, 0.3, [end[0], 0.06, end[2] - 0.05]), id));
    return g;
  },

  // ── Underside of the roof deck between top chords: stain (variable, moisture), dark growth near eave (variable, flashlight).
  'att-sheathing': (states) => {
    const g = group('sheathing'); const wet = isDef(states, 'sheathing-stain'); const mold = isDef(states, 'sheathing-microbial');
    const W = 2.4, D = 1.8;
    add(g, tBox(W, 0.012, D, osbMat(), [0, 0.006, 0]));
    add(g, merge(chordsG([-0.915, -0.305, 0.305, 0.915], -D / 2, D / 2, 3.5 * IN, 1.5 * IN, -3.5 * IN), VC()));
    const J = mat('#4a3a24', { transparent: true, opacity: 0.85, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
    add(g, tdecal(0.006, D, J, [0.0, -0.0005, 0], [PI / 2, 0, 0]), tdecal(W, 0.006, J, [0, -0.0005, -0.25], [PI / 2, 0, 0]));
    add(g, merge([gBox(0.02, 0.012, 0.006, [-0.6, -0.003, -0.25]), gBox(0.02, 0.012, 0.006, [0.6, -0.003, -0.25])], C.galv));
    add(g, tdecal(0.4, 0.12, dmat('apa', () => textTex(['APA RATED SHEATHING', '24/16  7/16 INCH', 'EXPOSURE 1'], { w: 256, h: 96, bg: 'rgba(0,0,0,0)', fg: 'rgba(30,40,70,0.75)', font: 'bold 20px sans-serif' }), { opacity: 1 }), [-0.6, -0.0007, -0.55], [PI / 2, 0, 0]));
    // Shiners: roofing nails that missed the chord.
    const sh = []; for (let x = -1.1; x < 1.15; x += 0.13) if (Math.abs(((x % 0.61) + 0.61) % 0.61 - 0.305) > 0.06) sh.push(xf(new THREE.ConeGeometry(0.0022, 0.02, 6), [x, -0.01, 0.12], [PI, 0, 0]));
    add(g, merge(sh, '#c3c7ca', { metalness: 0.8, roughness: 0.25 }));
    const st = T(tdecal(0.5, 0.42, ringMat('sheath', '#6e4c26', 4, 0.85), [0.0, -0.0009, -0.45], [PI / 2, 0, 0]), 'sheathing-stain');
    if (wet) thermal(st, 'wet'); add(g, st);
    add(g, T(hit(0.5, 0.03, 0.42, [0, -0.012, -0.45]), 'sheathing-stain'));
    const mm = mold ? blotchMat('mold', (c, w, h, r) => {
      for (let i = 0; i < 900; i++) { const x = r() * w, y = h * Math.pow(r(), 0.7), rad = 0.8 + r() * 3.5; c.fillStyle = `rgba(${18 + r() * 20},${22 + r() * 18},${16 + r() * 12},${0.35 + r() * 0.55})`; c.beginPath(); c.arc(x, y, rad, 0, PI * 2); c.fill(); }
    }) : blotchMat('weathered', (c, w, h, r) => {
      const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(80,78,70,0.55)'); gr.addColorStop(0.7, 'rgba(80,78,70,0.4)'); gr.addColorStop(0.71, 'rgba(80,78,70,0)'); c.fillStyle = gr; c.fillRect(0, 0, w * 0.48, h);
      for (let i = 0; i < 40; i++) { c.fillStyle = 'rgba(70,60,45,0.25)'; c.fillRect(r() * w * 0.48, r() * h * 0.7, 30, 4); }
    });
    add(g, T(tdecal(W - 0.05, 0.42, mm, [0, -0.0011, D / 2 - 0.23], [PI / 2, 0, 0]), 'sheathing-microbial'));
    add(g, T(hit(W - 0.05, 0.03, 0.42, [0, -0.013, D / 2 - 0.23]), 'sheathing-microbial'));
    return g;
  },

  // ── Fink truss section: one web cut out to pass a flex supply duct (always).
  'att-truss': () => {
    const g = group('truss'); const id = 'truss-cut';
    const r = rng('truss'), topY = (x) => 0.139 + (x + 1.5) * 0.5;
    add(g, box(3, 0.012, 0.7, C.drywall, [0, -0.006, 0]));
    add(g, mesh(insulationGeo(3, 0.7, 3 * IN, 10, 'tr'), VC({ roughness: 1 })));
    const lum = [tint(gBox(3, 3.5 * IN, 1.5 * IN, [0, 1.75 * IN, 0]), LUM), tint(gRect([-1.5, topY(-1.5), 0], [1.5, topY(1.5), 0], 3.5 * IN, 1.5 * IN), LUM, 0.02)];
    const W1 = [[0.1, 0.08, 0], [-0.75, topY(-0.75) - 0.05, 0]], a = [0.1, 0.08, 0], b = [1.0, topY(1.0) - 0.05, 0];
    lum.push(tint(gRect(...W1, 3.5 * IN, 1.5 * IN), LUM, -0.02));
    const lerp = (t) => a.map((v, i) => v + (b[i] - v) * t);
    lum.push(tint(gRect(a, lerp(0.3), 3.5 * IN, 1.5 * IN), LUM, -0.01), tint(gRect(lerp(0.72), b, 3.5 * IN, 1.5 * IN), LUM, -0.01));
    lum.push(tint(gRect(lerp(0.295), lerp(0.305), 3.6 * IN, 1.55 * IN), LUM_CUT), tint(gRect(lerp(0.715), lerp(0.725), 3.6 * IN, 1.55 * IN), LUM_CUT));
    add(g, T(merge(lum, VC()), id));
    const plate = tmat('gusset', () => ctex('gusset', 64, 64, (c, w, h) => { c.fillStyle = '#b3b9bd'; c.fillRect(0, 0, w, h); c.fillStyle = '#6e7377'; for (let y = 3; y < h; y += 8) for (let x = 2; x < w; x += 6) c.fillRect(x, y, 2, 5); }, true), { metalness: 0.6, roughness: 0.45 }, [0.08, 0.08]);
    const pl = [tBoxG(0.22, 0.14, 0.002, plate, [-1.38, 0.1, 0.0201]), tBoxG(0.16, 0.12, 0.002, plate, [0.1, 0.07, 0.0201]), tBoxG(0.14, 0.12, 0.002, plate, [-0.75, topY(-0.75) - 0.04, 0.0201]), tBoxG(0.14, 0.12, 0.002, plate, [1.0, topY(1.0) - 0.04, 0.0201])];
    add(g, T(merge(pl, plate), id));
    const dust = []; for (let i = 0; i < 60; i++) dust.push(tint(gBox(0.006, 0.002, 0.004, [0.35 + r() * 0.45, 0.085 + r() * 0.01, (r() - 0.5) * 0.3], [0, r() * 3, 0]), LUM_CUT));
    add(g, T(merge(dust, VC()), id));
    const c = lerp(0.51);
    add(g, mesh(gTube([[c[0] + 0.05, c[1] - 0.05, -0.9], [c[0], c[1], -0.2], [c[0], c[1], 0.2], [c[0] - 0.1, c[1] - 0.12, 0.9]], 0.13, 70, 14, 0.05), '#9ea4a8', { roughness: 0.5, metalness: 0.35, side: THREE.DoubleSide }));
    add(g, T(hit(0.4, 0.5, 0.1, [c[0], c[1], 0.06], [0, 0, -0.95]), id));
    return g;
  },

  // ── Eave from inside: baffle keeps the soffit path open (daylight glows) vs insulation packed tight.
  'att-soffit-vent': (states) => {
    const g = group('soffit'); const ok = !isDef(states, 'soffit-baffles'); const id = 'soffit-baffles';
    const sl = 0.5, deckY = (z) => 0.12 + (z + 0.5) * sl + 0.052;
    add(g, box(2, 0.012, 0.6, C.drywall, [0, -0.006, 0.05]));
    add(g, merge([tint(gBox(2, 0.076, 0.089, [0, -0.038, -0.255]), LUM), ...[-0.61, 0, 0.61].flatMap(x => [tint(gBox(1.5 * IN, 3.5 * IN, 0.75, [x, 1.75 * IN, -0.06]), LUM), tint(gRect([x, 0.12, -0.5], [x, 0.52, 0.3], 1.5 * IN, 3.5 * IN), LUM, 0.02)])], VC()));
    add(g, tBox(2, 0.012, 0.95, osbMat(), [0, deckY(-0.1) + 0.006, -0.1], [-Math.atan(sl), 0, 0]));
    add(g, T(mesh(gBox(2, 0.14, 0.004, [0, 0.07 + 0.01, -0.44]), mat('#fff3d6', { emissive: '#fff0cc', emissiveIntensity: 1.1 })), id));
    if (ok) {
      const bf = [];
      for (const [x0, x1] of [[-1, -0.61], [-0.61, 0], [0, 0.61], [0.61, 1]]) {
        const cx = (x0 + x1) / 2 + 0.0, w = x1 - x0 - 0.05;
        bf.push(xf(new THREE.BoxGeometry(w, 0.004, 0.8), [cx, deckY(-0.08) - 0.045, -0.08], [-Math.atan(sl), 0, 0]));
        for (const sx of [-1, 1]) bf.push(xf(new THREE.BoxGeometry(0.004, 0.045, 0.8), [cx + sx * w / 2, deckY(-0.08) - 0.022, -0.08], [-Math.atan(sl), 0, 0]));
        bf.push(gBox(w, 0.11, 0.004, [cx, 0.055 + 0.0, -0.3]));
      }
      add(g, T(merge(bf, '#e7d8cf', { roughness: 0.9 }), id));
      add(g, T(mesh(insulationGeo(2, 0.58, 0.11, 12, 'sof', (x, z, y) => y * Math.min(1, 0.4 + (z + 0.29) * 2)), VC({ roughness: 1 })), id));
      g.children.at(-1).position.z = 0.0;
    } else {
      const ig = insulationGeo(2, 0.78, 0.11, 14, 'sofbad', (x, z, y) => { const zz = z - 0.09; return zz < 0 ? Math.min(deckY(zz) - 0.005, y + (-zz) * 0.55 + 0.02) : y; });
      ig.translate(0, 0, -0.09); add(g, T(mesh(ig, VC({ roughness: 1 })), id));
    }
    add(g, T(hit(2, 0.25, 0.3, [0, 0.12, -0.3]), id));
    return g;
  },

  // ── Flex supply duct to a ceiling boot: taped & strapped (ok) or fallen off (defect).
  'att-duct': (states) => {
    const g = group('attduct'); const ok = !isDef(states, 'attic-duct-joint'); const id = 'attic-duct-joint';
    add(g, box(0.7, 0.012, 2.1, C.drywall, [0, -0.006, 0]));
    add(g, merge(chordsG([-0.3, 0.3], -1.05, 1.05), VC()));
    add(g, mesh(insulationGeo(0.6, 2.1, 3 * IN, 12, 'ad', (x, z, y) => (Math.abs(z - 0.75) < 0.1 && Math.abs(x) < 0.15) ? 0.01 : y), VC({ roughness: 1 })));
    add(g, mesh(gBox(0.4, 0.28, 0.2, [0, 0.14, -1.0]), C.galv, GALV));
    const boot = T(merge([gBox(0.26, 0.1, 0.14, [0, 0.05, 0.75]), gCyl(0.075, 0.075, 0.07, [0, 0.135, 0.75], [0, 0, 0], 20, true)], mat(C.galv, { ...GALV, side: THREE.DoubleSide })), id);
    add(g, boot);
    const JK = mat('#a9aeb2', { roughness: 0.5, metalness: 0.35 });
    if (ok) {
      add(g, T(mesh(gTube([[0, 0.24, -0.9], [0, 0.26, -0.4], [0, 0.24, 0.3], [0, 0.26, 0.6], [0, 0.2, 0.75], [0, 0.17, 0.75]], 0.11, 120, 12, 0.05), JK), id));
      add(g, T(merge([gCyl(0.112, 0.112, 0.03, [0, 0.16, 0.75], [0, 0, 0], 20), xf(new THREE.TorusGeometry(0.112, 0.004, 4, 24), [0, 0.15, 0.75], [PI / 2, 0, 0])], mat('#d5d8da', { metalness: 0.6, roughness: 0.3 })), id));
      add(g, mesh(gBox(0.02, 0.24, 0.004, [0, 0.38, 0.2]), '#2c2c2c'));
    } else {
      add(g, T(mesh(gTube([[0, 0.24, -0.9], [0, 0.26, -0.4], [0.02, 0.2, 0.15], [0.05, 0.13, 0.42]], 0.11, 100, 12, 0.05), JK), id));
      const mouth = T(merge([xf(new THREE.CircleGeometry(0.1, 20), [0.052, 0.13, 0.445], [0.35, 0.1, 0])], '#141414'), id); thermal(mouth, 'cool');
      add(g, mouth, T(mesh(xf(new THREE.TorusGeometry(0.1, 0.018, 6, 20), [0.052, 0.13, 0.445], [0.35, 0.1, 0]), C.insulation, { roughness: 1 }), id));
      thermal(boot, 'cool');
      add(g, T(mesh(xf(new THREE.PlaneGeometry(0.08, 0.05), [0.06, 0.16, 0.69], [0.4, 0.6, 0.2]), '#c9ccce', { metalness: 0.5, side: THREE.DoubleSide }), id));
    }
    add(g, T(hit(0.35, 0.3, 0.55, [0.03, 0.15, 0.6]), id));
    return g;
  },

  // ── Open splice: two NM cables twisted and taped, no box, lying on a chord (always).
  'att-wiring': () => {
    const g = group('wiring'); const id = 'open-splice';
    add(g, box(1.0, 0.012, 1.0, C.drywall, [0, -0.006, 0]));
    add(g, merge(chordsG([-0.3, 0.3], -0.5, 0.5), VC()));
    add(g, mesh(insulationGeo(1.0, 1.0, 3 * IN, 14, 'wr'), VC({ roughness: 1 })));
    const NM = '#d9cfb3', y = 0.098;
    const cab = [tint(gTube([[-0.5, 0.075, -0.38], [-0.32, y, -0.22], [-0.12, y, -0.06], [-0.06, y, -0.02]], 0.0065, 24, 8), NM), tint(gTube([[0.5, 0.075, 0.36], [0.3, y, 0.15], [0.12, y, 0.06], [0.07, y, 0.025]], 0.0065, 24, 8), NM)];
    add(g, T(merge(cab, VC({ roughness: 0.6 })), id));
    const tw = (a, b, phase, col, rr = 0.0026) => { const pts = []; for (let i = 0; i <= 24; i++) { const t = i / 24, ang = t * 14 + phase; pts.push([a[0] + (b[0] - a[0]) * t + Math.cos(ang) * 0.003, a[1] + (b[1] - a[1]) * t + Math.sin(ang) * 0.003, a[2] + (b[2] - a[2]) * t]); } return tint(gTube(pts, rr, 48, 5), col); };
    const wires = [
      tint(gTube([[-0.06, y, -0.02], [-0.02, y + 0.006, 0.0], [0.0, y + 0.01, 0.01]], 0.0026, 10, 5), '#151515'), tint(gTube([[0.07, y, 0.025], [0.03, y + 0.007, 0.012], [0.0, y + 0.01, 0.01]], 0.0026, 10, 5), '#151515'),
      tw([0.0, y + 0.01, 0.01], [0.02, y + 0.012, 0.08], 0, '#151515'), tw([0.0, y + 0.01, 0.01], [0.02, y + 0.012, 0.08], PI, '#151515'),
      tint(gTube([[-0.06, y, -0.02], [-0.05, y + 0.004, 0.02], [-0.04, y + 0.006, 0.05]], 0.0026, 10, 5), C.wireWhite), tint(gTube([[0.07, y, 0.025], [0.0, y + 0.005, 0.04], [-0.04, y + 0.006, 0.05]], 0.0026, 10, 5), C.wireWhite),
      tw([-0.04, y + 0.006, 0.05], [-0.05, y + 0.008, 0.1], 0, C.wireWhite), tw([-0.04, y + 0.006, 0.05], [-0.05, y + 0.008, 0.1], PI, C.wireWhite),
      tint(gTube([[-0.06, y - 0.004, -0.02], [-0.07, y - 0.002, 0.03], [-0.09, y, 0.06]], 0.0016, 10, 4), C.wireBare), tint(gTube([[0.07, y - 0.004, 0.025], [-0.02, y - 0.002, 0.05], [-0.09, y, 0.06]], 0.0016, 10, 4), C.wireBare),
    ];
    add(g, T(merge(wires, VC({ roughness: 0.5 })), id));
    add(g, T(merge([gSph(0.009, [0.015, y + 0.012, 0.065], [1, 1, 2.6], 8, 6), gSph(0.009, [-0.047, y + 0.008, 0.088], [1, 1, 2.2], 8, 6)], '#0d0d0d', { roughness: 0.25 }), id));
    add(g, T(mesh(xf(new THREE.ConeGeometry(0.009, 0.022, 10), [-0.053, y + 0.008, 0.115], [-PI / 2, 0, 0]), '#e0782c'), id));
    add(g, merge([gBox(0.02, 0.004, 0.012, [-0.3, 0.091, -0.2]), gBox(0.02, 0.004, 0.012, [0.3, 0.091, 0.15])], C.steel, { metalness: 0.6 }));
    add(g, T(hit(0.26, 0.08, 0.26, [-0.01, y + 0.01, 0.04]), id));
    return g;
  },

  // ── Insulation near the gable: droppings & tunnels (defect) vs undisturbed (ok).
  'att-pests': (states) => {
    const g = group('pests'); const bad = isDef(states, 'rodent-activity'); const id = 'rodent-activity';
    add(g, box(1.0, 0.012, 1.0, C.drywall, [0, -0.006, 0]));
    add(g, merge(chordsG([-0.3, 0.3], -0.5, 0.5), VC()));
    const path = [[-0.5, -0.1], [-0.2, 0.05], [0.0, -0.05], [0.25, 0.15], [0.5, 0.1]];
    const dPath = (x, z) => { let m = 9; for (let i = 0; i < path.length - 1; i++) { const [ax, az] = path[i], [bx, bz] = path[i + 1], vx = bx - ax, vz = bz - az, t = Math.max(0, Math.min(1, ((x - ax) * vx + (z - az) * vz) / (vx * vx + vz * vz))); m = Math.min(m, Math.hypot(x - ax - t * vx, z - az - t * vz)); } return m; };
    const ig = insulationGeo(1.0, 1.0, 3 * IN, 20, 'pest', bad ? (x, z, y) => { const d = dPath(x, z); return d < 0.04 ? 0.012 : d < 0.07 ? y + 0.012 : y; } : null);
    add(g, T(mesh(ig, VC({ roughness: 1 })), id));
    if (bad) {
      const r = rng('drop'), dr = [];
      for (let i = 0; i < 110; i++) {
        const k = r(), seg = Math.min(path.length - 2, Math.floor(k * (path.length - 1))), t = k * (path.length - 1) - seg;
        const x = path[seg][0] + (path[seg + 1][0] - path[seg][0]) * t + (r() - 0.5) * 0.12, z = path[seg][1] + (path[seg + 1][1] - path[seg][1]) * t + (r() - 0.5) * 0.12;
        const onChord = r() < 0.25, xx = onChord ? (r() < 0.5 ? -0.3 : 0.3) + (r() - 0.5) * 0.02 : x;
        const geo = gSph(0.0032, [0, 0, 0], [1, 1, 2.4], 6, 4); geo.rotateY(r() * PI); geo.translate(xx, onChord ? 0.092 : (dPath(xx, z) < 0.04 ? 0.016 : 0.08), z);
        dr.push(tint(geo, '#2a2118', (r() - 0.5) * 0.06));
      }
      add(g, T(merge(dr, VC({ roughness: 0.6 })), id));
      const nest = leavesG(60, 'nest', (rr) => [0.34 + (rr() - 0.5) * 0.16, 0.08 + rr() * 0.04, -0.35 + (rr() - 0.5) * 0.14, 0.7], ['#d9d4c4', '#bfb7a2', '#8f8670', '#e8c27a']);
      add(g, T(merge(nest, VC({ side: THREE.DoubleSide, roughness: 1 })), id));
    }
    return g;
  },
};

export const builders = { ...ext, ...roof, ...deck, ...shed, ...garage, ...attic };
