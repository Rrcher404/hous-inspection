// OWNER: Isolde-B (prop artist). Zones: living, kitchen, bath, primary, bed2, hall, laundry, crawl.
// export const builders = { 'component-id': (states, comp) => THREE.Group }
//
// Conventions used here (see CONTEXT.md §4):
//  - floor/ground: origin bottom-centre on y=0, front faces +Z.
//  - wall: origin bottom-centre of the back face on z=0, model extends into +Z (the room).
//    Windows and doors are modelled as shallow assemblies on the wall face (casing, stool,
//    sash). Door jambs/thresholds that live INSIDE the wall thickness sit at z<0 so they
//    line a wall opening if the engine cuts one.
//  - ceiling: origin top-centre at y=0, hangs into -Y.
//  - pri-window is FLOOR-REFERENCED (y=0 = finished floor) because its defect IS the sill
//    height; place it at floor level. See docs/reports/isolde-inside.md.
//  - Tool-gated conditions look the same in both states; thermal() carries the truth.
import { THREE, box, cyl, sphere, pipe, tube, decal, texPlane, canvasTex, stainTex, tag, thermal, group, mat, C } from './kit.js';

// ─────────────────────────────────────────────────────────────────────────────
// Local helpers
// ─────────────────────────────────────────────────────────────────────────────
const TEX = new Map();
const memo = (key, fn) => { if (!TEX.has(key)) TEX.set(key, fn()); return TEX.get(key); };
const MATS = new Map();
/** Cached textured material. */
function tmat(key, texFn, opts = {}) {
  if (!MATS.has(key)) MATS.set(key, new THREE.MeshStandardMaterial({ map: texFn(), roughness: 0.85, ...opts }));
  return MATS.get(key);
}
const wrap = (t) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
function rng(seed) { let s = seed >>> 0; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; }
const D2R = Math.PI / 180;

/** Scale a mesh's UVs in place (geometry is per-mesh from the kit helpers). */
function uvs(m, sx, sy) {
  const uv = m.geometry.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * sx, uv.getY(i) * sy);
  uv.needsUpdate = true; return m;
}
function rot(m, x = 0, y = 0, z = 0) { m.rotation.set(x, y, z); return m; }
function add(g, ...ms) { ms.forEach(m => g.add(m)); return ms[ms.length - 1]; }

/** Invisible-but-raycastable hit box for small features. */
const HIT = () => mat('#ff00ff', { transparent: true, opacity: 0, depthWrite: false });
function hit(g, id, w, h, d, pos) {
  const m = box(w, h, d, HIT(), pos); m.castShadow = false; m.receiveShadow = false; m.userData.hit = true;
  tag(m, id); g.add(m); return m;
}
/** Quad from 4 points (a bottom-left, b bottom-right, c top-right, d top-left). */
function quad(a, b, c, d, material, uw = 1, uh = 1) {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([...a, ...b, ...c, ...a, ...c, ...d]), 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([0, 0, uw, 0, uw, uh, 0, 0, uw, uh, 0, uh]), 2));
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, material); m.receiveShadow = true; return m;
}
const lerp3 = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
/** Bilinear point on a quad (u along a→b, v along a→d). */
function onQuad(a, b, c, d, u, v) { return lerp3(lerp3(a, b, u), lerp3(d, c, u), v); }
/** Plane in the XY plane with world-aligned UVs (so tiles line up across pieces). */
function planeXY(w, h, cx, cy, z, material, unit = 1) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), material);
  const uv = m.geometry.attributes.uv, p = m.geometry.attributes.position;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (p.getX(i) + cx) / unit, (p.getY(i) + cy) / unit);
  m.position.set(cx, cy, z); m.receiveShadow = true; return m;
}
/** Horizontal plane facing up (+Y) or down. */
function planeUp(w, d, pos, material, down = false) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), material);
  m.rotation.x = down ? Math.PI / 2 : -Math.PI / 2; m.position.set(...pos); m.receiveShadow = true; return m;
}
function lathe(points, color, pos, opts, segs = 32) {
  const m = new THREE.Mesh(new THREE.LatheGeometry(points.map(([r, y]) => new THREE.Vector2(r, y)), segs),
    typeof color === 'string' ? mat(color, { side: THREE.DoubleSide, ...opts }) : color);
  m.position.set(...pos); m.castShadow = true; m.receiveShadow = true; return m;
}
/** Extruded 2D shape. Shape is in XY; extrude along +Z by depth. */
function extrude(shape, depth, material, pos = [0, 0, 0]) {
  const m = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false }), material);
  m.position.set(...pos); m.castShadow = true; m.receiveShadow = true; return m;
}
function rectShape(x0, y0, x1, y1) {
  const s = new THREE.Shape(); s.moveTo(x0, y0); s.lineTo(x1, y0); s.lineTo(x1, y1); s.lineTo(x0, y1); s.lineTo(x0, y0); return s;
}
function rrectPath(path, x0, y0, x1, y1, r) {
  path.moveTo(x0 + r, y0); path.lineTo(x1 - r, y0); path.quadraticCurveTo(x1, y0, x1, y0 + r);
  path.lineTo(x1, y1 - r); path.quadraticCurveTo(x1, y1, x1 - r, y1); path.lineTo(x0 + r, y1);
  path.quadraticCurveTo(x0, y1, x0, y1 - r); path.lineTo(x0, y0 + r); path.quadraticCurveTo(x0, y0, x0 + r, y0); return path;
}
/** Horizontal slab with a hole, lying flat. Shape coords: x → world x, y → world -z. Bottom at y0. */
function flatSlab(shape, thickness, material, y0) {
  const m = extrude(shape, thickness, material);
  m.rotation.x = -Math.PI / 2; m.position.y = y0; return m;
}

// Shared material shortcuts
const M = {
  glass: () => mat('#9fb8c4', { transparent: true, opacity: 0.32, roughness: 0.05, metalness: 0.2 }),
  chrome: () => mat('#e2e5e8', { roughness: 0.2, metalness: 0.45 }), // no env map in the house: keep metals light
  steel: () => mat(C.steel, { roughness: 0.45, metalness: 0.6 }),
  stainless: () => mat('#cdd1d4', { roughness: 0.32, metalness: 0.4, side: THREE.DoubleSide }),
  iron: () => mat('#2a2a2c', { roughness: 0.7, metalness: 0.5 }),
  rust: () => mat('#7c3d1b', { roughness: 0.95, metalness: 0.2 }),
  brass: () => mat(C.brass, { roughness: 0.3, metalness: 0.5 }),
  pvc: () => mat(C.pvcWhite, { roughness: 0.5 }),
  abs: () => mat(C.absBlack, { roughness: 0.55 }),
  water: () => mat('#2f4a5c', { roughness: 0.05, metalness: 0.3, transparent: true, opacity: 0.85 }),
  dark: () => mat('#0b0b0c', { roughness: 1 }),
  porcelain: () => mat('#f6f5f1', { roughness: 0.15, metalness: 0.05 }),
  enamel: () => mat('#f3f2ee', { roughness: 0.22 }),
  paint: () => mat(C.white, { roughness: 0.6 }),
};

// ─────────────────────────────────────────────────────────────────────────────
// Canvas painting helpers
// ─────────────────────────────────────────────────────────────────────────────
function speckle(g, w, h, r, n, color, size = 2) {
  for (let i = 0; i < n; i++) { g.fillStyle = color(r()); g.fillRect(r() * w, r() * h, size * (0.5 + r()), size * (0.5 + r())); }
}
function noise(g, w, h, amp, r) {
  const img = g.getImageData(0, 0, w, h), d = img.data;
  for (let i = 0; i < d.length; i += 4) { const n = (r() - 0.5) * amp; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
  g.putImageData(img, 0, 0);
}
function jag(a, b, n, amp, r) {
  const pts = [a];
  for (let i = 1; i < n; i++) { const t = i / n; pts.push([a[0] + (b[0] - a[0]) * t + (r() - 0.5) * amp, a[1] + (b[1] - a[1]) * t + (r() - 0.5) * amp]); }
  pts.push(b); return pts;
}
/** Crack stroke that tapers from w0 to w1, with a light lip on one side (raking light). */
function crack(g, pts, w0, w1, color = '#1a1410', lip = 'rgba(255,255,255,0.35)') {
  g.lineCap = 'round'; g.lineJoin = 'round';
  for (let i = 1; i < pts.length; i++) {
    const t = i / (pts.length - 1), w = w0 + (w1 - w0) * t;
    if (lip) { g.strokeStyle = lip; g.lineWidth = w * 0.6; g.beginPath(); g.moveTo(pts[i - 1][0] - w * 0.7, pts[i - 1][1] - w * 0.5); g.lineTo(pts[i][0] - w * 0.7, pts[i][1] - w * 0.5); g.stroke(); }
    g.strokeStyle = color; g.lineWidth = w; g.beginPath(); g.moveTo(...pts[i - 1]); g.lineTo(...pts[i]); g.stroke();
  }
}
function blobPath(g, cx, cy, rx, ry, r, amp = 0.18, n = 28) {
  g.beginPath();
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2, k = 1 + (Math.sin(a * 3 + r() * 0.3) * 0.5 + (r() - 0.5)) * amp;
    const x = cx + Math.cos(a) * rx * k, y = cy + Math.sin(a) * ry * k;
    i ? g.lineTo(x, y) : g.moveTo(x, y);
  }
  g.closePath();
}
/** Running-bond brick field, rows from the bottom. ppm = pixels per metre. */
function drawBricks(g, W, H, ppm, o = {}) {
  const { bw = 0.194, bh = 0.057, j = 0.010, base = [156, 74, 52], seed = 3, mortar = C.mortar, spread = 34, clinker = 0.08 } = o;
  const r = rng(seed);
  g.fillStyle = mortar; g.fillRect(0, 0, W, H);
  speckle(g, W, H, r, W * H / 60, (q) => `rgba(${q < 0.5 ? '90,85,78' : '230,225,215'},0.25)`, 1.5);
  const cw = (bw + j) * ppm, ch = (bh + j) * ppm, jp = j * ppm;
  for (let row = 0; row * ch < H + ch; row++) {
    const y = H - (row + 1) * ch + jp / 2, off = (row % 2) * cw / 2;
    for (let x = -off; x < W; x += cw) {
      const v = (r() - 0.5) * spread, dk = r() < clinker ? -38 : 0;
      g.fillStyle = `rgb(${base[0] + v + dk},${base[1] + v * 0.6 + dk * 0.6},${base[2] + v * 0.5 + dk * 0.5})`;
      g.fillRect(x + jp / 2, y, bw * ppm, bh * ppm);
      for (let k = 0; k < 10; k++) { g.fillStyle = `rgba(${r() < 0.5 ? '0,0,0' : '255,230,200'},${r() * 0.14})`; g.fillRect(x + jp / 2 + r() * bw * ppm, y + r() * bh * ppm, 1 + r() * 3, 1 + r() * 2); }
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Textures (memoised so rebuilds on inspection:new stay cheap)
// ─────────────────────────────────────────────────────────────────────────────
const T = {
  drywall: () => memo('drywall', () => wrap(canvasTex(256, 256, (g, w, h) => { g.fillStyle = C.drywall; g.fillRect(0, 0, w, h); noise(g, w, h, 7, rng(11)); }))),
  paintWhite: () => memo('paintWhite', () => wrap(canvasTex(128, 128, (g, w, h) => { g.fillStyle = C.white; g.fillRect(0, 0, w, h); noise(g, w, h, 5, rng(12)); }))),
  wood: (key = 'wood', base = C.wood, seed = 5) => memo(key, () => wrap(canvasTex(512, 512, (g, w, h) => {
    const r = rng(seed); g.fillStyle = base; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 90; i++) {
      const y = r() * h, a = 0.05 + r() * 0.12; g.strokeStyle = `rgba(${r() < 0.6 ? '60,35,15' : '255,235,200'},${a})`;
      g.lineWidth = 1 + r() * 3; g.beginPath(); g.moveTo(0, y);
      for (let x = 0; x <= w; x += 32) g.lineTo(x, y + Math.sin(x * 0.01 + i) * 4 * r());
      g.stroke();
    }
    for (let i = 0; i < 3; i++) { const x = r() * w, y = r() * h; g.fillStyle = 'rgba(70,40,20,0.35)'; g.beginPath(); g.ellipse(x, y, 10 + r() * 8, 4 + r() * 3, 0, 0, 7); g.fill(); }
    noise(g, w, h, 10, r);
  }))),
  ply: () => memo('ply', () => wrap(canvasTex(512, 512, (g, w, h) => {
    const r = rng(21); g.fillStyle = '#b89263'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(90,60,30,${0.05 + r() * 0.1})`; g.beginPath(); g.ellipse(r() * w, r() * h, 60 + r() * 120, 8 + r() * 20, 0, 0, 7); g.fill(); }
    noise(g, w, h, 12, r);
  }))),
  soil: (key = 'soil', base = C.soil, seed = 31) => memo(key, () => wrap(canvasTex(512, 512, (g, w, h) => {
    const r = rng(seed); g.fillStyle = base; g.fillRect(0, 0, w, h); noise(g, w, h, 40, r);
    for (let i = 0; i < 260; i++) { const s = 1 + r() * 4; g.fillStyle = `rgba(${r() < 0.5 ? '40,28,16' : '150,130,100'},${0.3 + r() * 0.4})`; g.beginPath(); g.ellipse(r() * w, r() * h, s, s * 0.7, r() * 3, 0, 7); g.fill(); }
    for (let i = 0; i < 30; i++) { g.fillStyle = 'rgba(30,20,10,0.12)'; g.beginPath(); g.ellipse(r() * w, r() * h, 20 + r() * 50, 10 + r() * 30, r() * 3, 0, 7); g.fill(); }
  }))),
  block: () => memo('block', () => wrap(canvasTex(256, 128, (g, w, h) => {
    const r = rng(41); g.fillStyle = C.block; g.fillRect(0, 0, w, h); noise(g, w, h, 30, r);
    speckle(g, w, h, r, 500, () => 'rgba(40,40,40,0.35)', 1.5);
    g.strokeStyle = 'rgba(0,0,0,0.12)'; g.lineWidth = 3; g.strokeRect(2, 2, w - 4, h - 4);
  }))),
  tile: () => memo('tile', () => wrap(canvasTex(256, 256, (g, w, h) => {
    // one 4-1/4" tile per 1/4 of the texture: texture = 0.216 m square (2x2 tiles)
    const r = rng(51); g.fillStyle = '#c9c6bd'; g.fillRect(0, 0, w, h);
    const s = w / 2, j = 3;
    for (let i = 0; i < 2; i++) for (let k = 0; k < 2; k++) {
      const v = (r() - 0.5) * 6; g.fillStyle = `rgb(${242 + v},${240 + v},${232 + v})`; g.fillRect(i * s + j, k * s + j, s - 2 * j, s - 2 * j);
      const grd = g.createLinearGradient(i * s, k * s, i * s + s, k * s + s); grd.addColorStop(0, 'rgba(255,255,255,0.35)'); grd.addColorStop(1, 'rgba(0,0,0,0.05)');
      g.fillStyle = grd; g.fillRect(i * s + j, k * s + j, s - 2 * j, s - 2 * j);
    }
  }))),
  ribbed: (key, base, rib) => memo(key, () => wrap(canvasTex(64, 256, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 16) { const grd = g.createLinearGradient(0, y, 0, y + 16); grd.addColorStop(0, rib); grd.addColorStop(0.5, 'rgba(255,255,255,0.25)'); grd.addColorStop(1, rib); g.fillStyle = grd; g.fillRect(0, y, w, 16); }
  }))),
  stripes: (key, base, line, n = 16, horizontal = true) => memo(key, () => canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h); g.fillStyle = line;
    for (let i = 0; i < n; i++) horizontal ? g.fillRect(8, (i + 0.25) * h / n, w - 16, h / n * 0.45) : g.fillRect((i + 0.25) * w / n, 8, w / n * 0.45, h - 16);
  })),
  braid: () => memo('braid', () => wrap(canvasTex(64, 64, (g, w, h) => {
    g.fillStyle = '#9ea4a8'; g.fillRect(0, 0, w, h);
    for (let i = -h; i < w + h; i += 6) {
      g.strokeStyle = 'rgba(255,255,255,0.55)'; g.lineWidth = 2; g.beginPath(); g.moveTo(i, 0); g.lineTo(i + h, h); g.stroke();
      g.strokeStyle = 'rgba(40,40,40,0.45)'; g.beginPath(); g.moveTo(i + h, 0); g.lineTo(i, h); g.stroke();
    }
  }))),
  sky: () => memo('sky', () => canvasTex(64, 256, (g, w, h) => {
    const grd = g.createLinearGradient(0, 0, 0, h); grd.addColorStop(0, '#c9dbe6'); grd.addColorStop(0.6, '#e4ecef'); grd.addColorStop(1, '#a7b6a0');
    g.fillStyle = grd; g.fillRect(0, 0, w, h);
  })),
};
const glassSky = () => tmat('glass-sky', T.sky, { transparent: true, opacity: 0.55, roughness: 0.05, metalness: 0.15 });

/** Printed label texture: items = [{t, x, y, size, bold, color, align}] in px on a w×h canvas. */
function labelTex(key, w, h, bg, items, extra) {
  return memo(key, () => canvasTex(w, h, (g) => {
    if (bg) { g.fillStyle = bg; g.fillRect(0, 0, w, h); }
    extra?.pre?.(g, w, h);
    for (const it of items) {
      g.fillStyle = it.color || '#1d1d1f'; g.font = `${it.bold ? 'bold ' : ''}${it.size || 24}px ${it.font || 'Helvetica, Arial, sans-serif'}`;
      g.textAlign = it.align || 'left'; g.textBaseline = 'middle'; g.fillText(it.t, it.x, it.y);
    }
    extra?.post?.(g, w, h);
  }));
}

/** Tape-measure blade texture (inches). Red boxes on 16" marks like a real tape. */
function tapeTex(key, inches, vertical = false) {
  return memo(key, () => canvasTex(vertical ? 96 : 64 * inches, vertical ? 64 * inches : 96, (g, W, H) => {
    g.fillStyle = '#f1c927'; g.fillRect(0, 0, W, H);
    for (let i = 0; i <= inches * 8; i++) {
      const p = i * 8, major = i % 8 === 0, half = i % 4 === 0;
      const len = major ? 40 : half ? 26 : 14;
      g.fillStyle = '#151515';
      if (vertical) g.fillRect(0, H - p - 1, len, 2); else g.fillRect(p, 0, 2, len);
      if (major && i > 0) {
        const n = i / 8, red = n % 16 === 0;
        g.font = `bold ${n >= 10 ? 34 : 40}px Helvetica, Arial, sans-serif`; g.textBaseline = 'middle'; g.textAlign = 'center';
        if (red) { g.fillStyle = '#c8312b'; vertical ? g.fillRect(44, H - p - 22, 50, 44) : g.fillRect(p - 26, 46, 52, 46); }
        g.fillStyle = red ? '#ffffff' : '#151515';
        if (vertical) g.fillText(String(n), 69, H - p); else g.fillText(String(n), p, 70);
      }
    }
  }));
}

/** Standard duplex / GFCI receptacle + cover plate (wall mount: back at z=0, bottom at y=0). */
function receptacle({ gfci = false, device = '#f4f2ea', plate = '#f4f2ea', drip = false, led = null } = {}) {
  const g = group('receptacle');
  const P = mat(plate, { roughness: 0.35 }), Dv = mat(device, { roughness: 0.3 }), slot = mat('#121212', { roughness: 1 });
  add(g, box(0.071, 0.116, 0.005, P, [0, 0.058, 0.0025]));
  if (!gfci) {
    for (const sy of [0.058 + 0.0195, 0.058 - 0.0195]) {
      add(g, box(0.036, 0.029, 0.007, Dv, [0, sy, 0.0075]));
      add(g, box(0.0024, 0.0075, 0.002, slot, [-0.0065, sy + 0.003, 0.0112]));
      add(g, box(0.0024, 0.0095, 0.002, slot, [0.0065, sy + 0.003, 0.0112]));
      add(g, rot(cyl(0.0028, 0.0028, 0.002, slot, [0, sy - 0.0078, 0.0112]), Math.PI / 2));
    }
    add(g, rot(cyl(0.0035, 0.0035, 0.002, M.chrome(), [0, 0.058, 0.0062]), Math.PI / 2));
  } else {
    add(g, box(0.035, 0.068, 0.007, Dv, [0, 0.058, 0.0075]));
    for (const sy of [0.058 + 0.024, 0.058 - 0.024]) {
      add(g, box(0.0024, 0.0075, 0.002, slot, [-0.0065, sy + 0.002, 0.0112]));
      add(g, box(0.0024, 0.0095, 0.002, slot, [0.0065, sy + 0.002, 0.0112]));
      add(g, rot(cyl(0.0028, 0.0028, 0.002, slot, [0, sy - 0.0075, 0.0112]), Math.PI / 2));
    }
    const btn = labelTex('gfci-btn', 128, 64, null, [
      { t: 'TEST', x: 32, y: 32, size: 20, bold: true, color: '#f4f2ea' }, { t: 'RESET', x: 96, y: 32, size: 18, bold: true, color: '#1d1d1f' }],
      { pre: (g2) => { g2.fillStyle = '#1d1d1f'; g2.fillRect(4, 8, 56, 48); g2.fillStyle = '#e9e6dc'; g2.fillRect(68, 8, 56, 48); } });
    add(g, box(0.011, 0.007, 0.004, mat('#1d1d1f', { roughness: 0.4 }), [-0.008, 0.058, 0.0125]));
    add(g, box(0.011, 0.007, 0.004, mat('#e9e6dc', { roughness: 0.4 }), [0.008, 0.058, 0.0125]));
    add(g, texPlane(0.026, 0.013, btn, [0, 0.058, 0.0146]));
    if (led) add(g, box(0.003, 0.003, 0.002, mat(led, { emissive: led, emissiveIntensity: 0.9 }), [0.012, 0.058 - 0.034 + 0.004, 0.0115]));
  }
  for (const sy of [0.058 + 0.047, 0.058 - 0.047]) add(g, rot(cyl(0.003, 0.003, 0.002, M.chrome(), [0, sy, 0.0055]), Math.PI / 2));
  if (drip) { // painter skipped the plate: a cream run of wall paint over the top-right edge
    add(g, decal(0.022, 0.012, '#e9dfc4', [0.026, 0.108, 0.0056], { opacity: 0.95 }));
    add(g, decal(0.004, 0.022, '#e9dfc4', [0.031, 0.094, 0.0056], { opacity: 0.95 }));
  }
  return g;
}

const B = {};

// ═════════════════════════════════════════════════════════════════════════════
// LIVING ROOM
// ═════════════════════════════════════════════════════════════════════════════

/** Brick chimney-breast face 1.8×2.4 m with the firebox opening cut out (alpha) and a
 *  soldier course over the opening, the way a mason actually turns that lintel. */
const fireplaceFrontTex = () => memo('fp-front', () => canvasTex(900, 1200, (g, W, H) => {
  const ppm = 500;
  drawBricks(g, W, H, ppm, { seed: 7, base: [150, 70, 50] });
  // soldier course over opening (bricks on end)
  const x0 = 236, x1 = 664, yb = H - 0.70 * ppm, yt = yb - 0.204 * ppm, r = rng(8);
  g.fillStyle = C.mortar; g.fillRect(x0, yt, x1 - x0, yb - yt);
  for (let x = x0 + 2; x < x1 - 4; x += 0.067 * ppm) {
    const v = (r() - 0.5) * 30; g.fillStyle = `rgb(${142 + v},${64 + v * 0.6},${46 + v * 0.5})`;
    g.fillRect(x, yt + 3, 0.057 * ppm, yb - yt - 6);
  }
  // faint smoke shadow above the opening (honest wear, not a defect)
  const grd = g.createRadialGradient(W / 2, yb, 10, W / 2, yb - 40, 230);
  grd.addColorStop(0, 'rgba(25,20,18,0.30)'); grd.addColorStop(1, 'rgba(25,20,18,0)');
  g.fillStyle = grd; g.fillRect(x0 - 40, yb - 260, x1 - x0 + 80, 260);
  g.clearRect(250, yb, 400, (0.70 - 0.05) * ppm);
}));
const brickSideTex = () => memo('fp-side', () => canvasTex(200, 1200, (g, W, H) => drawBricks(g, W, H, 500, { seed: 9, base: [150, 70, 50] })));
const hearthTex = () => memo('fp-hearth', () => wrap(canvasTex(512, 512, (g, W, H) => drawBricks(g, W, H, 512, { seed: 13, bw: 0.194, bh: 0.092, base: [128, 62, 46], j: 0.008 }))));

/** Firebrick wall texture, sized to the wall (w×h metres). Soot darkens upward. */
function firebrickTex(key, wM, hM, flaws = {}) {
  return memo(key, () => canvasTex(Math.round(wM * 640), Math.round(hM * 640), (g, W, H) => {
    const ppm = 640, r = rng(flaws.seed || 17);
    drawBricks(g, W, H, ppm, { bw: 0.229, bh: 0.114, j: 0.0045, base: [196, 140, 98], mortar: '#d9cdb6', seed: flaws.seed || 17, spread: 26, clinker: 0.02 });
    const yOf = (m) => H - m * ppm, xOf = (m) => m * ppm;
    // mortar washed out of joints: dark eroded voids
    for (const [ax, ay, bx, by] of flaws.missing || []) {
      g.strokeStyle = '#0d0907'; g.lineWidth = 5 + r() * 3; g.lineCap = 'round';
      g.beginPath(); g.moveTo(xOf(ax), yOf(ay));
      const n = 8; for (let i = 1; i <= n; i++) g.lineTo(xOf(ax + (bx - ax) * i / n) + (r() - 0.5) * 3, yOf(ay + (by - ay) * i / n) + (r() - 0.5) * 3);
      g.stroke();
    }
    for (const c of flaws.cracks || []) crack(g, jag([xOf(c[0]), yOf(c[1])], [xOf(c[2]), yOf(c[3])], 9, 10, r), 4, 1.5, '#100b08', 'rgba(255,225,190,0.25)');
    if (flaws.hole) { // spalled/broken brick: a black void with a ragged lip
      const [hx, hy, hw, hh] = flaws.hole;
      g.fillStyle = '#070505'; blobPath(g, xOf(hx + hw / 2), yOf(hy + hh / 2), hw * ppm / 2, hh * ppm / 2, r, 0.25); g.fill();
      g.strokeStyle = 'rgba(230,180,140,0.6)'; g.lineWidth = 2; g.stroke();
    }
    // soot: heavier at the top and centre
    const sg = g.createLinearGradient(0, 0, 0, H); sg.addColorStop(0, `rgba(22,18,15,${flaws.sootTop ?? 0.82})`); sg.addColorStop(1, `rgba(22,18,15,${flaws.sootBot ?? 0.15})`);
    g.fillStyle = sg; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 12; i++) { g.fillStyle = 'rgba(20,16,14,0.18)'; blobPath(g, r() * W, r() * H * 0.7, 30 + r() * 60, 20 + r() * 40, r); g.fill(); }
  }));
}

B['liv-fireplace'] = (s) => {
  const g = group('liv-fireplace');
  const D = 0.40, OW = 0.80, OB = 0.05, OT = 0.70;
  const shortHearth = s['hearth-extension'] === 'defect';
  const badDamper = s['damper'] === 'defect';
  const creosote = s['flue-creosote'] === 'defect';

  // ── chimney breast (brick) ──
  const front = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 2.4), tmat('fp-front', fireplaceFrontTex, { alphaTest: 0.5 }));
  front.position.set(0, 1.2, D); front.receiveShadow = true; g.add(front);
  for (const sx of [-1, 1]) {
    const side = new THREE.Mesh(new THREE.PlaneGeometry(D, 2.4), tmat('fp-side', brickSideTex));
    side.position.set(sx * 0.9, 1.2, D / 2); side.rotation.y = sx * Math.PI / 2; g.add(side);
  }
  // steel lintel angle across the top of the opening
  add(g, box(0.88, 0.012, 0.075, M.iron(), [0, OT + 0.006, D - 0.04]));
  add(g, box(0.88, 0.07, 0.008, M.iron(), [0, OT + 0.035, D - 0.075]));

  // ── firebox (always cracked / open joints / a broken brick) ──
  const fbWalls = group('firebox');
  const sideMat = (k) => tmat('fb-side-' + k, () => firebrickTex('fb-side-' + k, 0.37, 0.67, { seed: k === 'L' ? 19 : 23,
    missing: k === 'L' ? [[0.04, 0.244, 0.30, 0.244], [0.12, 0.362, 0.25, 0.362]] : [[0.08, 0.476, 0.33, 0.476]],
    cracks: k === 'L' ? [[0.20, 0.10, 0.28, 0.33]] : [[0.10, 0.55, 0.22, 0.30]] }), { side: THREE.DoubleSide, roughness: 0.95 });
  const backMat = tmat('fb-back', () => firebrickTex('fb-back', 0.54, 0.36, { seed: 29, sootTop: 0.55,
    missing: [[0.02, 0.123, 0.26, 0.123], [0.31, 0.237, 0.52, 0.237], [0.26, 0.0, 0.26, 0.12]],
    cracks: [[0.17, 0.30, 0.30, 0.12], [0.40, 0.11, 0.47, 0.30]], hole: [0.035, 0.235, 0.13, 0.1] }), { side: THREE.DoubleSide, roughness: 0.95 });
  const upMat = tmat('fb-up', () => firebrickTex('fb-up', 0.62, 0.38, { seed: 31, sootTop: 0.92, sootBot: 0.55, missing: [[0.05, 0.13, 0.40, 0.13]] }), { side: THREE.DoubleSide, roughness: 0.95 });
  add(fbWalls, quad([-0.27, OB, 0.06], [0.27, OB, 0.06], [0.27, 0.41, 0.06], [-0.27, 0.41, 0.06], backMat));
  add(fbWalls, quad([-0.27, 0.41, 0.06], [0.27, 0.41, 0.06], [0.33, 0.745, 0.22], [-0.33, 0.745, 0.22], upMat));
  add(fbWalls, quad([-0.27, OB, 0.06], [-0.40, OB, D], [-0.40, OT, D], [-0.27, 0.75, 0.06], sideMat('L')));
  add(fbWalls, quad([0.40, OB, D], [0.27, OB, 0.06], [0.27, 0.75, 0.06], [0.40, OT, D], sideMat('R')));
  // broken brick: the missing half lies on the hearth, a shard still proud of the wall
  add(fbWalls, rot(box(0.115, 0.055, 0.06, mat(C.firebrick, { roughness: 0.95 }), [-0.25, OB + 0.03, 0.30]), 0.25, 0.6, 0.15));
  add(fbWalls, rot(box(0.05, 0.035, 0.04, mat('#b98257', { roughness: 0.95 }), [0.24, OB + 0.018, 0.33]), 0.4, -0.3, 0.5));
  add(fbWalls, rot(box(0.06, 0.05, 0.025, mat('#a77453', { roughness: 0.95 }), [-0.09, 0.31, 0.075]), 0, 0.15, 0.12));
  tag(fbWalls, 'firebox-brick'); g.add(fbWalls);
  hit(g, 'firebox-brick', 0.5, 0.3, 0.05, [0, 0.22, 0.09]);

  // firebox floor (inner hearth) + ash, grate, logs, ash dump
  const floorMat = tmat('fb-floor', () => firebrickTex('fb-floor', 0.8, 0.36, { seed: 37, sootTop: 0.5, sootBot: 0.3 }), { roughness: 1 });
  add(g, quad([-0.40, OB, D], [0.40, OB, D], [0.27, OB, 0.06], [-0.27, OB, 0.06], floorMat));
  add(g, box(0.8, OB, 0.36, mat('#5a4a3e'), [0, OB / 2, 0.22]));
  const ash = new THREE.Mesh(new THREE.CircleGeometry(0.22, 20), mat('#77736c', { roughness: 1 }));
  ash.rotation.x = -Math.PI / 2; ash.scale.set(1.3, 0.7, 1); ash.position.set(0, OB + 0.002, 0.22); g.add(ash);
  add(g, box(0.12, 0.005, 0.08, M.iron(), [-0.16, OB + 0.003, 0.25]));
  const grate = group('grate');
  for (const x of [-0.18, -0.06, 0.06, 0.18]) add(grate, box(0.022, 0.022, 0.26, M.iron(), [x, OB + 0.07, 0.22]));
  add(grate, box(0.44, 0.02, 0.02, M.iron(), [0, OB + 0.07, 0.34])); add(grate, box(0.44, 0.02, 0.02, M.iron(), [0, OB + 0.07, 0.10]));
  for (const x of [-0.2, 0.2]) for (const z of [0.12, 0.33]) add(grate, box(0.02, 0.07, 0.02, M.iron(), [x, OB + 0.035, z]));
  add(grate, rot(cyl(0.048, 0.05, 0.46, mat('#2b211b', { roughness: 1 }), [0, OB + 0.13, 0.24]), 0, 0.15, Math.PI / 2));
  add(grate, rot(cyl(0.04, 0.042, 0.40, mat('#35281f', { roughness: 1 }), [0.02, OB + 0.13, 0.15]), 0, -0.25, Math.PI / 2));
  g.add(grate);

  // ── throat + damper ──
  const damper = group('damper');
  const dMat = badDamper ? M.rust() : M.iron();
  add(damper, box(0.70, 0.04, 0.012, dMat, [0, 0.78, 0.365]));
  add(damper, box(0.70, 0.04, 0.012, dMat, [0, 0.78, 0.215]));
  add(damper, box(0.012, 0.04, 0.15, dMat, [-0.345, 0.78, 0.29])); add(damper, box(0.012, 0.04, 0.15, dMat, [0.345, 0.78, 0.29]));
  const pivot = new THREE.Group(); pivot.position.set(0, 0.79, 0.222);
  const plate = box(0.66, 0.008, 0.14, dMat, [0, 0, 0.07]); pivot.add(plate);
  if (badDamper) {
    // seized part-open and cocked (can't be closed): rust scale, handle snapped off at the stub
    pivot.rotation.set(-62 * D2R, 0, 6 * D2R);
    add(pivot, box(0.14, 0.004, 0.05, mat('#a35a2a', { roughness: 1 }), [0.16, 0.006, 0.08]));
    add(pivot, box(0.10, 0.004, 0.04, mat('#a35a2a', { roughness: 1 }), [-0.2, 0.006, 0.05]));
    damper.add(pivot);
    add(damper, pipe([0.15, 0.76, 0.36], [0.15, 0.70, 0.37], 0.006, M.rust()));
    add(damper, rot(box(0.02, 0.012, 0.012, mat('#a35a2a'), [0.15, 0.697, 0.37]), 0, 0, 0.6));
    const fr = rng(61);
    for (let i = 0; i < 9; i++) add(damper, rot(box(0.012 + fr() * 0.02, 0.002, 0.01 + fr() * 0.015, mat('#9a5328', { roughness: 1 }), [-0.25 + fr() * 0.5, OB + 0.004, 0.28 + fr() * 0.1]), 0, fr() * 3, 0));
  } else {
    pivot.rotation.set(-78 * D2R, 0, 0); damper.add(pivot);
    // poker-style control, seated in its notch
    add(damper, pipe([0.15, 0.79, 0.36], [0.15, 0.6, 0.375], 0.0055, M.iron()));
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.022, 0.005, 8, 16), M.iron()); ring.position.set(0.15, 0.578, 0.376); damper.add(ring);
    add(damper, box(0.03, 0.008, 0.012, M.iron(), [0.15, 0.74, 0.366]));
  }
  tag(damper, 'damper'); g.add(damper);
  hit(g, 'damper', 0.72, 0.07, 0.07, [0, 0.765, 0.355]);
  hit(g, 'damper', 0.08, 0.2, 0.06, [0.15, 0.67, 0.37]);

  // ── smoke chamber + flue (look up; flashlight reveals glossy creosote) ──
  const flue = group('flue');
  const fMat = creosote ? mat(C.creosote, { roughness: 0.12, metalness: 0.35, side: THREE.DoubleSide })
                        : mat('#2c2723', { roughness: 1, side: THREE.DoubleSide });
  const a0 = [-0.36, 0.80, 0.385], a1 = [0.36, 0.80, 0.385], b0 = [-0.36, 0.80, 0.18], b1 = [0.36, 0.80, 0.18];
  const t0 = [-0.10, 1.45, 0.32], t1 = [0.10, 1.45, 0.32], u0 = [-0.10, 1.45, 0.12], u1 = [0.10, 1.45, 0.12];
  const faces = [[a0, a1, t1, t0], [b1, b0, u0, u1], [b0, a0, t0, u0], [a1, b1, u1, t1]];
  faces.forEach(f => add(flue, quad(...f, fMat)));
  const L0 = [-0.10, 1.45, 0.12], L1 = [0.10, 1.45, 0.12], L2 = [0.10, 1.45, 0.32], L3 = [-0.10, 1.45, 0.32];
  const up = (p) => [p[0], 2.38, p[2]];
  [[L3, L2], [L1, L0], [L0, L3], [L2, L1]].forEach(([p, q]) => add(flue, quad(p, q, up(q), up(p), fMat)));
  add(flue, quad(up(L0), up(L1), up(L2), up(L3), M.dark()));
  // throat front wall (behind the lintel) and a glaze band on the top of the firebox back:
  // the part of this condition you can actually reach with a flashlight from the hearth
  add(flue, quad([-0.40, OT + 0.012, D - 0.03], [0.40, OT + 0.012, D - 0.03], [0.37, 0.80, D - 0.03], [-0.37, 0.80, D - 0.03], fMat));
  const ub = [[-0.27, 0.41, 0.06], [0.27, 0.41, 0.06], [0.33, 0.745, 0.22], [-0.33, 0.745, 0.22]];
  const bandA = onQuad(...ub, 0, 0.55), bandB = onQuad(...ub, 1, 0.55);
  const off = (p) => [p[0], p[1] + 0.002, p[2] + 0.005];
  add(flue, quad(off(bandA), off(bandB), off(ub[2]), off(ub[3]), fMat));
  // smoke shelf behind the damper
  add(flue, quad([-0.33, 0.745, 0.22], [0.33, 0.745, 0.22], [0.36, 0.80, 0.18], [-0.36, 0.80, 0.18], fMat));
  if (creosote) {
    // glazed third-degree creosote: blistered crust and tar runs on every face
    const cr = rng(71), crMat = mat('#0a0807', { roughness: 0.08, metalness: 0.4 });
    for (let i = 0; i < 26; i++) {
      const f = faces[i % 4], p = onQuad(...f, 0.1 + cr() * 0.8, 0.05 + cr() * 0.85);
      const m = sphere(0.012 + cr() * 0.014, crMat, p); m.scale.set(1, 1.8 + cr() * 2.2, 0.55); flue.add(m);
    }
    for (const u of [0.07, 0.16, 0.21, 0.38, 0.55, 0.61, 0.66, 0.84]) { // tar runs, bunched where the smoke rolls
      const p = onQuad(...ub, u + (cr() - 0.5) * 0.03, 0.55 + cr() * 0.1), k = cr();
      const m = sphere(0.006 + k * 0.009, crMat, [p[0], p[1] - 0.01 - k * 0.03, p[2] + 0.008]); m.scale.set(0.7 + cr() * 0.5, 1.6 + k * 3.5, 0.6); flue.add(m);
    }
    for (const x of [-0.31, -0.12, -0.07, 0.2, 0.29]) { const k = cr(); const m = sphere(0.006 + k * 0.006, crMat, [x, OT + 0.006, D - 0.035]); m.scale.set(1, 1.6 + k * 2, 0.7); flue.add(m); }
    for (let i = 0; i < 8; i++) {
      const f = faces[i % 4], p = onQuad(...f, 0.15 + cr() * 0.7, 0.02);
      const m = sphere(0.008, crMat, [p[0], p[1] - 0.01, p[2]]); m.scale.set(1, 3.2, 1); flue.add(m);
    }
  } else {
    const cr = rng(73), sMat = mat('#3a342f', { roughness: 1 });
    for (let i = 0; i < 8; i++) { const f = faces[i % 4], p = onQuad(...f, 0.15 + cr() * 0.7, 0.1 + cr() * 0.7); const m = sphere(0.018, sMat, p); m.scale.set(1.6, 0.6, 0.3); flue.add(m); }
  }
  tag(flue, 'flue-creosote'); g.add(flue);
  hit(g, 'flue-creosote', 0.5, 0.25, 0.18, [0, 1.0, 0.27]);
  hit(g, 'flue-creosote', 0.56, 0.12, 0.07, [0, 0.66, 0.18]);

  // ── hearth extension (+ tape measure laid from the opening) ──
  const hd = shortHearth ? 0.20 : 0.46, hs = shortHearth ? 0.03 : 0.25, hw = OW + 2 * hs;
  const hearthG = group('hearth');
  const slab = box(hw, 0.05, hd, tmat('fp-hearth-m', hearthTex), [0, 0.025, D + hd / 2]); uvs(slab, hw * 2.2, hd * 2.2); hearthG.add(slab);
  add(hearthG, box(hw + 0.01, 0.012, 0.012, mat('#5e3022'), [0, 0.044, D + hd]));
  const tapeLen = hd + 0.04;
  const blade = box(0.019, 0.0015, tapeLen, tmat('tape-h', () => tapeTex('tape-h', 24)), [-0.28, 0.051, D + tapeLen / 2]);
  // map: u (x) of the texture runs along the blade, 24" over 0.61 m
  const buv = blade.geometry.attributes.uv, bpos = blade.geometry.attributes.position;
  for (let i = 0; i < buv.count; i++) buv.setXY(i, (bpos.getZ(i) + tapeLen / 2) / 0.6096, bpos.getX(i) > 0 ? 1 : 0);
  blade.rotation.y = 0; hearthG.add(blade);
  add(hearthG, box(0.022, 0.012, 0.004, M.steel(), [-0.28, 0.056, D + 0.002]));
  add(hearthG, box(0.075, 0.075, 0.04, mat('#e8c21c', { roughness: 0.5 }), [-0.28, 0.0375, D + tapeLen + 0.04]));
  add(hearthG, rot(cyl(0.022, 0.022, 0.042, mat('#1e1e22'), [-0.28, 0.0375, D + tapeLen + 0.04]), Math.PI / 2, 0, Math.PI / 2));
  if (shortHearth) {
    // ember scorches on the oak just past the short hearth: the floor has been telling on it
    const sc = texPlane(0.6, 0.28, memo('scorch', () => canvasTex(256, 128, (c, w, h) => {
      const r = rng(81);
      for (let i = 0; i < 14; i++) { const x = 20 + r() * (w - 40), y = 10 + r() * (h - 40), rr = 3 + r() * 9; const grd = c.createRadialGradient(x, y, 0, x, y, rr); grd.addColorStop(0, 'rgba(20,10,5,0.95)'); grd.addColorStop(1, 'rgba(60,30,10,0)'); c.fillStyle = grd; c.beginPath(); c.arc(x, y, rr, 0, 7); c.fill(); }
    })), [0.05, 0.002, D + hd + 0.16]);
    sc.rotation.x = -Math.PI / 2; hearthG.add(sc);
  }
  tag(hearthG, 'hearth-extension'); g.add(hearthG);

  // ── mantel + a lived-in mantel ──
  add(g, box(1.5, 0.05, 0.22, tmat('mantel', () => T.wood('wood-dark', C.woodDark, 6)), [0, 1.40, D + 0.11]));
  add(g, box(1.42, 0.06, 0.03, mat(C.woodDark), [0, 1.35, D + 0.02]));
  for (const x of [-0.62, 0.62]) add(g, box(0.06, 0.14, 0.14, mat(C.woodDark), [x, 1.305, D + 0.07]));
  add(g, cyl(0.022, 0.025, 0.2, mat('#efe6cf'), [0.55, 1.525, D + 0.1]));
  add(g, cyl(0.03, 0.04, 0.03, M.brass(), [0.55, 1.44, D + 0.1]));
  add(g, rot(box(0.16, 0.2, 0.015, mat('#3b2f26'), [-0.45, 1.525, D + 0.06]), -0.12, 0.2, 0));
  add(g, rot(box(0.12, 0.155, 0.002, mat('#8ea3a8'), [-0.448, 1.527, D + 0.069]), -0.12, 0.2, 0));
  return g;
};

B['liv-smoke-alarm'] = () => {
  const g = group('liv-smoke-alarm');
  // mounting base stays on the ceiling; the head is twisted off and hanging on its harness
  add(g, cyl(0.066, 0.066, 0.012, mat('#ded5bd'), [0, -0.006, 0]));
  for (const [i, col] of [[0, C.wireBlack], [1, C.wireWhite], [2, '#c8312b']].map(([i, c]) => [i, c])) {
    add(g, tube([[-0.012 + i * 0.012, -0.012, 0], [-0.01 + i * 0.01, -0.05, 0.03], [0.0 + i * 0.006, -0.085, 0.045]], 0.0025, col));
  }
  add(g, box(0.03, 0.012, 0.02, mat('#f0ece0'), [0.006, -0.088, 0.048]));
  const head = new THREE.Group(); head.position.set(0.01, -0.13, 0.07); head.rotation.set(108 * D2R, 0, 8 * D2R);
  const yellowed = mat('#ddd0ac', { roughness: 0.6 });
  head.add(cyl(0.068, 0.068, 0.042, yellowed, [0, 0, 0]));
  head.add(cyl(0.05, 0.05, 0.004, mat('#d2c49f'), [0, 0.022, 0]));
  const lbl = labelTex('alarm-back', 512, 512, null, [
    { t: 'SMOKE ALARM', x: 256, y: 92, size: 44, bold: true, align: 'center' },
    { t: 'MODEL 4120  120V~ 60Hz', x: 256, y: 150, size: 28, align: 'center' },
    { t: 'IONIZATION · UL 217', x: 256, y: 192, size: 26, align: 'center' },
    { t: 'MFG DATE', x: 256, y: 250, size: 32, bold: true, align: 'center' },
    { t: '2011 JUN 03', x: 256, y: 302, size: 58, bold: true, align: 'center', font: 'Courier New, monospace' },
    { t: 'REPLACE 10 YEARS AFTER', x: 256, y: 372, size: 30, bold: true, align: 'center', color: '#a02020' },
    { t: 'DATE OF MANUFACTURE', x: 256, y: 410, size: 30, bold: true, align: 'center', color: '#a02020' },
  ], { pre: (c, w) => { c.fillStyle = '#e9dfc2'; c.beginPath(); c.arc(w / 2, w / 2, w / 2 - 6, 0, 7); c.fill(); c.strokeStyle = '#8c7b58'; c.lineWidth = 6; c.stroke(); } });
  const back = texPlane(0.112, 0.112, lbl, [0, 0.0245, 0]); back.rotation.x = -Math.PI / 2; head.add(back);
  for (const a of [0.3, 2.4, 4.4]) { const k = box(0.016, 0.008, 0.01, yellowed, [Math.cos(a) * 0.06, 0.024, Math.sin(a) * 0.06]); k.rotation.y = -a; head.add(k); }
  tag(head, 'smoke-alarm-age'); g.add(head);
  hit(g, 'smoke-alarm-age', 0.16, 0.14, 0.12, [0.01, -0.11, 0.06]);
  return g;
};

B['liv-receptacle'] = () => {
  const g = group('liv-receptacle');
  const r = receptacle({ device: '#efe9da', plate: '#efe9da' }); tag(r, 'liv-polarity'); g.add(r);
  hit(g, 'liv-polarity', 0.09, 0.14, 0.03, [0, 0.058, 0.012]);
  return g;
};

/** Ceiling stain with tide lines: dry or wet looks the same, only the meter (and IR) know. */
const ceilingStainTex = () => memo('ceil-stain', () => canvasTex(512, 384, (g, w, h) => {
  const r = rng(91);
  for (let k = 0; k < 5; k++) {
    const s = 1 - k * 0.17;
    blobPath(g, w / 2 + (r() - 0.5) * 20, h / 2 + (r() - 0.5) * 16, (w / 2 - 20) * s, (h / 2 - 20) * s, r, 0.16, 40);
    g.fillStyle = `rgba(165,128,70,${0.06 + k * 0.02})`; g.fill();
    g.strokeStyle = `rgba(120,85,40,${0.55 - k * 0.07})`; g.lineWidth = 3 + r() * 3; g.stroke();
  }
  blobPath(g, w * 0.55, h * 0.48, 40, 28, r, 0.3); g.fillStyle = 'rgba(110,80,40,0.35)'; g.fill();
}));
B['liv-ceiling-stain'] = (s) => {
  const g = group('liv-ceiling-stain');
  const base = planeUp(0.8, 0.6, [0, -0.002, 0], tmat('ceil-drywall', T.drywall), true); g.add(base);
  const st = new THREE.Mesh(new THREE.CircleGeometry(0.5, 32), new THREE.MeshStandardMaterial({ map: ceilingStainTex(), transparent: true, roughness: 0.95, polygonOffset: true, polygonOffsetFactor: -2, depthWrite: false }));
  st.rotation.x = Math.PI / 2; st.scale.set(0.74, 0.54, 1); st.position.set(0, -0.003, 0); g.add(st);
  if (s['ceiling-stain'] === 'defect') thermal(st, 'wet');
  tag(g, 'ceiling-stain');
  return g;
};

/** Twin (mulled) double-hung, painted wood, crescent locks: the window done right. */
function doubleHung(g, cx, w, h, y0, opts = {}) {
  const frame = mat(C.white, { roughness: 0.55 }), sashM = mat('#f6f4ee', { roughness: 0.5 });
  const half = h / 2;
  // upper sash (outer track) and lower sash (inner track)
  for (const [yy, z, lower] of [[y0 + half * 1.5, 0.022, false], [y0 + half * 0.5 + (opts.raise || 0), 0.042, true]]) {
    const sh = half + 0.02;
    add(g, box(w, 0.05, 0.035, sashM, [cx, yy - sh / 2 + 0.025, z]));
    add(g, box(w, 0.04, 0.035, sashM, [cx, yy + sh / 2 - 0.02, z]));
    add(g, box(0.05, sh, 0.035, sashM, [cx - w / 2 + 0.025, yy, z]));
    add(g, box(0.05, sh, 0.035, sashM, [cx + w / 2 - 0.025, yy, z]));
    add(g, planeXY(w - 0.1, sh - 0.09, cx, yy + 0.005, z, glassSky()));
    add(g, box(0.018, sh - 0.09, 0.012, sashM, [cx, yy + 0.005, z + 0.004]));
    add(g, box(w - 0.1, 0.018, 0.012, sashM, [cx, yy + 0.005, z + 0.004]));
    if (lower) {
      for (const sx of [-0.18, 0.18]) add(g, box(0.05, 0.012, 0.018, M.brass(), [cx + sx * w, yy - sh / 2 + 0.03, z + 0.026]));
      // crescent lock on the meeting rail
      add(g, box(0.06, 0.008, 0.03, M.brass(), [cx, yy + sh / 2 - 0.0, z + 0.008]));
      const cres = new THREE.Mesh(new THREE.TorusGeometry(0.018, 0.004, 6, 12, Math.PI), M.brass());
      cres.rotation.x = -Math.PI / 2; cres.position.set(cx, yy + sh / 2 + 0.006, z + 0.008); g.add(cres);
    }
  }
}
B['liv-window'] = () => {
  const g = group('liv-window');
  const trim = mat(C.white, { roughness: 0.55 });
  const W = 1.6, H = 1.4, y0 = 0.085, top = 1.33;
  add(g, box(W - 0.1, 0.06, 0.018, trim, [0, 0.03, 0.009]));               // apron
  add(g, box(W + 0.04, 0.025, 0.11, trim, [0, 0.0725, 0.055]));            // stool
  add(g, box(0.07, top - y0, 0.018, trim, [-W / 2 + 0.035, (top + y0) / 2, 0.009]));
  add(g, box(0.07, top - y0, 0.018, trim, [W / 2 - 0.035, (top + y0) / 2, 0.009]));
  add(g, box(W + 0.02, 0.075, 0.022, trim, [0, top + 0.0375, 0.011]));      // head casing
  add(g, box(W + 0.06, 0.018, 0.03, trim, [0, top + 0.084, 0.015]));       // cap
  add(g, box(0.05, top - y0, 0.03, trim, [0, (top + y0) / 2, 0.015]));      // centre mullion
  const sw = (W - 0.14 - 0.05) / 2;
  doubleHung(g, -(sw / 2 + 0.025), sw, top - y0, y0, {});
  doubleHung(g, sw / 2 + 0.025, sw, top - y0, y0, {});
  tag(g, 'window-operation');
  return g;
};

// ═════════════════════════════════════════════════════════════════════════════
// KITCHEN
// ═════════════════════════════════════════════════════════════════════════════
/** Ribs that run ACROSS a TubeGeometry's length (u axis). */
const ribbedU = (key, base, rib) => memo(key, () => wrap(canvasTex(256, 32, (g, w, h) => {
  g.fillStyle = base; g.fillRect(0, 0, w, h);
  for (let x = 0; x < w; x += 16) { const grd = g.createLinearGradient(x, 0, x + 16, 0); grd.addColorStop(0, rib); grd.addColorStop(0.5, 'rgba(255,255,255,0.3)'); grd.addColorStop(1, rib); g.fillStyle = grd; g.fillRect(x, 0, 16, h); }
})));
function ribTube(points, r, key, base, rib, ribsPerM = 120, opts = {}) {
  const m = tube(points, r, new THREE.MeshStandardMaterial({ map: ribbedU(key, base, rib), roughness: opts.roughness ?? 0.6, metalness: opts.metalness ?? 0, transparent: !!opts.opacity, opacity: opts.opacity ?? 1 }));
  m.geometry.computeBoundingSphere();
  const len = m.geometry.parameters.path.getLength();
  uvs(m, len * ribsPerM / 16, 1); return m;
}

B['kit-range'] = (s) => {
  const g = group('kit-range');
  const enamel = mat('#f1efe9', { roughness: 0.3 }), black = mat('#18181a', { roughness: 0.35 });
  const burners = group('burners');
  // body (oven section) sits over an open storage-drawer cavity
  add(burners, box(0.76, 0.73, 0.64, enamel, [0, 0.535, 0]));
  for (const x of [-0.37, 0.37]) add(g, box(0.02, 0.14, 0.64, enamel, [x, 0.10, 0]));
  add(g, box(0.72, 0.14, 0.01, mat('#3a3c40'), [0, 0.10, -0.315]));
  add(g, box(0.72, 0.012, 0.62, mat('#2a2a2c'), [0, 0.164, 0]));
  // oven door, window, handle
  add(burners, box(0.70, 0.50, 0.035, enamel, [0, 0.43, 0.3375]));
  add(burners, box(0.42, 0.22, 0.004, mat('#0d0d10', { roughness: 0.08, metalness: 0.3 }), [0, 0.46, 0.356]));
  add(burners, pipe([-0.28, 0.64, 0.38], [0.28, 0.64, 0.38], 0.011, M.chrome()));
  for (const x of [-0.26, 0.26]) add(burners, pipe([x, 0.64, 0.355], [x, 0.64, 0.38], 0.008, M.chrome()));
  // cooktop + coils
  add(burners, box(0.76, 0.02, 0.64, enamel, [0, 0.91, 0]));
  const coils = [[-0.19, 0.12, 0.10], [-0.19, -0.14, 0.075], [0.19, 0.12, 0.075], [0.19, -0.14, 0.10]];
  coils.forEach(([x, z, r], i) => {
    add(burners, cyl(r + 0.022, r + 0.018, 0.006, M.chrome(), [x, 0.922, z]));
    const lit = i === 2; // one coil switched on: it heats evenly
    const cm = lit ? mat('#5a1a0c', { emissive: '#ff4a14', emissiveIntensity: 1.1, roughness: 0.5 }) : mat('#2b2b2d', { roughness: 0.5, metalness: 0.5 });
    for (const k of [1, 0.68, 0.36]) { const t = new THREE.Mesh(new THREE.TorusGeometry(r * k, 0.0055, 6, 28), cm); t.rotation.x = -Math.PI / 2; t.position.set(x, 0.931, z); burners.add(t); if (lit) thermal(t, 'hot'); }
  });
  // backguard + controls
  add(burners, box(0.76, 0.20, 0.06, enamel, [0, 1.02, -0.29]));
  [-0.31, -0.2, 0.2, 0.31].forEach((x, i) => { add(burners, rot(cyl(0.021, 0.021, 0.025, black, [x, 1.01, -0.248]), Math.PI / 2)); add(burners, box(0.004, 0.018, 0.004, mat('#f1efe9'), [x, 1.02, -0.234])); if (i === 2) burners.children[burners.children.length - 1].rotation.z = 1.2; });
  add(burners, texPlane(0.2, 0.07, labelTex('range-clock', 256, 96, '#101412', [{ t: '12:47', x: 128, y: 48, size: 58, bold: true, align: 'center', color: '#3fe08a', font: 'Courier New, monospace' }]), [0, 1.03, -0.2595]));
  tag(burners, 'range-burners'); g.add(burners);
  // feet. No anti-tip bracket at the rear foot: the bracket is still in its bag in the drawer.
  const feet = group('feet');
  for (const x of [-0.34, 0.34]) for (const z of [-0.29, 0.29]) add(feet, cyl(0.013, 0.016, 0.03, M.steel(), [x, 0.015, z]));
  add(feet, cyl(0.024, 0.024, 0.004, mat('#9aa1a8'), [-0.34, 0.002, -0.29]));
  // drawer pulled and set on the floor in front
  const drawer = new THREE.Group(); drawer.position.set(0.12, 0, 0.72); drawer.rotation.y = -0.18;
  const dm = mat('#2c2c2e', { roughness: 0.6 });
  add(drawer, box(0.68, 0.008, 0.46, dm, [0, 0.004, 0])); add(drawer, box(0.72, 0.12, 0.02, enamel, [0, 0.06, 0.24]));
  for (const x of [-0.34, 0.34]) add(drawer, box(0.008, 0.08, 0.46, dm, [x, 0.044, 0]));
  add(drawer, box(0.68, 0.08, 0.008, dm, [0, 0.044, -0.23]));
  add(drawer, box(0.42, 0.006, 0.30, mat('#3d3d40', { roughness: 0.4, metalness: 0.5 }), [-0.1, 0.011, -0.03])); // cookie sheet
  const bag = group('bag');
  add(bag, box(0.17, 0.016, 0.12, mat('#e8eef2', { transparent: true, opacity: 0.45, roughness: 0.2 }), [0.19, 0.017, 0.06]));
  add(bag, box(0.09, 0.004, 0.04, M.steel(), [0.18, 0.014, 0.04]));
  add(bag, box(0.09, 0.03, 0.004, M.steel(), [0.18, 0.026, 0.02]));
  const sheet = texPlane(0.1, 0.07, labelTex('antitip-sheet', 256, 180, '#f7f5ee', [
    { t: 'ANTI-TIP', x: 128, y: 36, size: 40, bold: true, align: 'center', color: '#b42318' },
    { t: 'BRACKET KIT', x: 128, y: 80, size: 30, bold: true, align: 'center' },
    { t: 'INSTALL BEFORE USE', x: 128, y: 124, size: 22, align: 'center' },
    { t: '⚠ TIP-OVER HAZARD', x: 128, y: 158, size: 20, align: 'center', color: '#b42318' }]), [0.2, 0.0262, 0.07]);
  sheet.rotation.x = -Math.PI / 2; sheet.rotation.z = 0.1; add(bag, sheet);
  drawer.add(bag); g.add(drawer);
  tag(feet, 'range-anti-tip'); tag(bag, 'range-anti-tip'); g.add(feet);
  hit(g, 'range-anti-tip', 0.72, 0.13, 0.62, [0, 0.095, 0]);
  return g;
};

B['kit-dishwasher'] = (s) => {
  const g = group('kit-dishwasher');
  const panel = mat('#e9e7e1', { roughness: 0.3 });
  add(g, box(0.58, 0.74, 0.55, mat('#b5b8bb', { roughness: 0.5, metalness: 0.5 }), [0, 0.485, -0.005]));
  const op = group('op');
  add(op, box(0.595, 0.66, 0.03, panel, [0, 0.45, 0.285]));
  add(op, box(0.595, 0.08, 0.035, mat('#d9d7d0', { roughness: 0.35 }), [0, 0.82, 0.2825]));
  add(op, box(0.40, 0.022, 0.03, mat('#2a2a2c'), [0, 0.765, 0.31]));
  add(op, texPlane(0.46, 0.05, labelTex('dw-panel', 512, 64, '#d9d7d0', [
    { t: 'HEAVY', x: 40, y: 32, size: 22 }, { t: 'NORMAL', x: 130, y: 32, size: 22, bold: true }, { t: 'RINSE', x: 240, y: 32, size: 22 },
    { t: 'HEAT DRY', x: 320, y: 32, size: 22 }, { t: 'CLEAN', x: 432, y: 32, size: 22, bold: true, color: '#1d7a3a' }]), [0, 0.825, 0.3005]));
  add(op, box(0.008, 0.008, 0.004, mat('#3fd16b', { emissive: '#3fd16b', emissiveIntensity: 1 }), [0.255, 0.825, 0.302]));
  thermal(op.children[0], 'warm');
  tag(op, 'dw-operation'); g.add(op);
  // toe space: kick plate is off and lying on the floor so the pump and hose show
  add(g, box(0.58, 0.006, 0.09, panel, [0.02, 0.003, 0.44]));
  add(g, rot(cyl(0.045, 0.045, 0.09, mat('#1e1e22'), [0.04, 0.06, 0.12]), 0, 0, Math.PI / 2));
  add(g, rot(cyl(0.05, 0.05, 0.11, mat('#3a3c40', { metalness: 0.4 }), [0.16, 0.06, 0.06]), 0, 0, Math.PI / 2));
  add(g, box(0.06, 0.045, 0.06, mat('#8b8f93', { metalness: 0.4 }), [0.23, 0.035, 0.22]));
  add(g, tube([[0.29, 0.02, -0.1], [0.24, 0.035, 0.1], [0.23, 0.04, 0.19]], 0.0065, '#e9e2c8'));
  add(g, tube([[0.12, 0.05, -0.2], [0.18, 0.04, 0.05], [0.2, 0.05, 0.15]], 0.007, new THREE.MeshStandardMaterial({ map: T.braid(), metalness: 0.6, roughness: 0.4 })));
  for (const x of [-0.27, 0.27]) add(g, cyl(0.012, 0.014, 0.11, M.steel(), [x, 0.055, 0.24]));
  for (const x of [-0.25, 0.25]) add(g, box(0.05, 0.006, 0.03, M.steel(), [x, 0.866, 0.27]));
  // drain hose: high loop strapped up under the counter (ok) vs. lying on the floor (defect)
  const hose = group('dw-hose');
  const pts = s['dw-drain-loop'] === 'defect'
    ? [[0.0, 0.06, 0.12], [-0.16, 0.035, 0.09], [-0.3, 0.018, 0.03], [-0.42, 0.018, -0.06], [-0.5, 0.02, -0.14]]
    : [[0.0, 0.06, 0.12], [-0.16, 0.05, 0.09], [-0.305, 0.08, 0.02], [-0.318, 0.42, -0.04], [-0.318, 0.80, -0.1], [-0.33, 0.855, -0.17], [-0.37, 0.82, -0.22], [-0.46, 0.72, -0.22]];
  add(hose, ribTube(pts, 0.011, 'dw-hose', '#8d9196', 'rgba(0,0,0,0.35)', 110));
  if (s['dw-drain-loop'] !== 'defect') add(hose, box(0.03, 0.012, 0.05, M.steel(), [-0.32, 0.868, -0.15]));
  tag(hose, 'dw-drain-loop'); g.add(hose);
  hit(g, 'dw-drain-loop', 0.5, 0.12, 0.3, [-0.1, 0.06, 0.05]);
  hit(g, 'dw-drain-loop', 0.12, 0.85, 0.2, [-0.34, 0.45, -0.12]);
  return g;
};

/** Cabinet-floor water damage: overlapping tide lines that drift toward the trap, a darker
 *  swollen band where the particleboard has mushroomed. Same in wet and dry states. */
const cabStainTex = () => memo('cab-stain2', () => canvasTex(512, 352, (g, w, h) => {
  const r = rng(191);
  const blobs = [[0.62, 0.42, 0.34, 0.3], [0.45, 0.55, 0.26, 0.22], [0.78, 0.3, 0.16, 0.14]];
  for (const [cx, cy, rx, ry] of blobs) for (let k = 0; k < 3; k++) {
    const sc = 1 - k * 0.22; blobPath(g, cx * w + (r() - 0.5) * 20, cy * h + (r() - 0.5) * 14, rx * w * sc, ry * h * sc, r, 0.22, 34);
    g.fillStyle = `rgba(120,86,44,${0.07 + k * 0.03})`; g.fill(); g.strokeStyle = `rgba(92,62,28,${0.5 - k * 0.12})`; g.lineWidth = 2 + r() * 3; g.stroke();
  }
  const grd = g.createLinearGradient(0, h, 0, h - 40); grd.addColorStop(0, 'rgba(70,48,24,0.55)'); grd.addColorStop(1, 'rgba(70,48,24,0)');
  g.fillStyle = grd; g.fillRect(0, h - 40, w, 40);
  speckle(g, w, h, r, 260, () => 'rgba(60,42,22,0.25)', 2);
}));
B['kit-sink'] = (s) => {
  const g = group('kit-sink');
  const cab = tmat('cab-oak', () => T.wood('wood-oak', '#b8875a', 15)), carcass = mat('#d7c7a8', { roughness: 0.8 });
  // carcass
  for (const x of [-0.441, 0.441]) add(g, box(0.018, 0.87, 0.58, carcass, [x, 0.435, -0.01]));
  const floorB = box(0.864, 0.018, 0.56, mat('#cdbb98', { roughness: 0.9 }), [0, 0.109, -0.01]); g.add(floorB);
  add(g, box(0.864, 0.10, 0.018, mat('#3a2a1c'), [0, 0.05, 0.21]));
  add(g, box(0.864, 0.75, 0.006, carcass, [0, 0.495, -0.287]));
  // face frame + false front + open doors
  for (const x of [-0.425, 0.425]) add(g, box(0.05, 0.76, 0.02, cab, [x, 0.49, 0.29]));
  add(g, box(0.8, 0.03, 0.02, cab, [0, 0.125, 0.29]));
  add(g, box(0.8, 0.12, 0.02, cab, [0, 0.80, 0.29]));
  for (const side of [-1, 1]) {
    const pv = new THREE.Group(); pv.position.set(side * 0.40, 0.44, 0.30); pv.rotation.y = side * 112 * D2R;
    add(pv, box(0.40, 0.60, 0.02, cab, [-side * 0.2, 0, 0.01]));
    add(pv, box(0.30, 0.48, 0.008, tmat('cab-oak', () => T.wood('wood-oak', '#b8875a', 15)), [-side * 0.2, 0, 0.022]));
    add(pv, rot(cyl(0.011, 0.011, 0.025, M.brass(), [-side * 0.36, 0.2, 0.035]), Math.PI / 2));
    g.add(pv);
  }
  // countertop with sink cut-out + backsplash
  const top = rectShape(-0.45, -0.315, 0.45, 0.315); top.holes.push(rectShape(-0.40, -0.22, 0.40, 0.22));
  add(g, flatSlab(top, 0.035, mat('#d8d2c2', { roughness: 0.4 }), 0.865));
  add(g, box(0.9, 0.10, 0.015, mat('#d8d2c2', { roughness: 0.4 }), [0, 0.95, -0.3]));
  // double-bowl stainless sink
  const deck = rectShape(-0.42, -0.24, 0.42, 0.24);
  deck.holes.push(rectShape(-0.39, -0.20, -0.02, 0.19)); deck.holes.push(rectShape(0.02, -0.20, 0.39, 0.19));
  add(g, flatSlab(deck, 0.005, M.stainless(), 0.90));
  for (const x of [-0.205, 0.205]) {
    add(g, box(0.37, 0.20, 0.39, mat('#cdd1d4', { roughness: 0.32, metalness: 0.4, side: THREE.BackSide }), [x, 0.80, 0.005]));
    const outer = new THREE.Mesh(new THREE.BoxGeometry(0.372, 0.202, 0.392), [M.stainless(), M.stainless(), HIT(), M.stainless(), M.stainless(), M.stainless()]);
    outer.position.set(x, 0.80, 0.005); g.add(outer);
    add(g, cyl(0.045, 0.045, 0.004, M.chrome(), [x, 0.702, 0.005]));
  }
  // faucet
  add(g, cyl(0.03, 0.032, 0.03, M.chrome(), [0, 0.92, -0.215]));
  add(g, cyl(0.02, 0.022, 0.1, M.chrome(), [0, 0.98, -0.215]));
  add(g, tube([[0, 1.02, -0.215], [0, 1.1, -0.17], [0, 1.08, -0.06], [0, 1.02, -0.02]], 0.011, M.chrome()));
  add(g, rot(box(0.016, 0.012, 0.09, M.chrome(), [0, 1.04, -0.17]), -0.3, 0, 0));
  // supplies: angle stops + braided risers (not a checkpoint here, just right)
  for (const x of [-0.12, 0.12]) {
    add(g, rot(cyl(0.024, 0.024, 0.006, M.chrome(), [x, 0.42, -0.283]), Math.PI / 2));
    add(g, rot(cyl(0.011, 0.011, 0.06, M.chrome(), [x, 0.42, -0.255]), Math.PI / 2));
    add(g, box(0.035, 0.012, 0.012, M.chrome(), [x, 0.42, -0.235]));
    add(g, tube([[x, 0.43, -0.25], [x * 0.7, 0.62, -0.23], [x * 0.25, 0.86, -0.215]], 0.0055, new THREE.MeshStandardMaterial({ map: T.braid(), metalness: 0.6, roughness: 0.4 })));
  }
  // disposal under the left bowl
  const disp = group('disposal');
  add(disp, cyl(0.075, 0.075, 0.04, mat('#5a5e63', { metalness: 0.5 }), [-0.205, 0.68, 0.005]));
  add(disp, cyl(0.088, 0.085, 0.28, mat('#2c3034', { roughness: 0.5 }), [-0.205, 0.52, 0.005]));
  add(disp, cyl(0.089, 0.089, 0.03, mat('#b43a2a'), [-0.205, 0.6, 0.005]));
  g.add(disp);
  // electrical whip: NM cable into the disposal knockout with NO clamp/connector
  const whip = group('whip');
  add(whip, box(0.065, 0.065, 0.012, mat('#7f8489', { metalness: 0.5 }), [-0.205, 0.43, 0.089]));
  const ko = new THREE.Mesh(new THREE.TorusGeometry(0.012, 0.0022, 6, 16), mat('#3a3c40')); ko.position.set(-0.205, 0.43, 0.096); whip.add(ko);
  add(whip, rot(cyl(0.0105, 0.0105, 0.004, M.dark(), [-0.205, 0.43, 0.0955]), Math.PI / 2));
  // jacket stops ~6 cm short of the box; loose conductors splay up into a bare knockout
  add(whip, tube([[-0.33, 0.2, -0.283], [-0.3, 0.13, -0.05], [-0.25, 0.16, 0.13], [-0.215, 0.3, 0.135], [-0.208, 0.362, 0.126]], 0.0068, '#ece5cf'));
  add(whip, cyl(0.0072, 0.0072, 0.004, mat('#d9d1b8'), [-0.208, 0.364, 0.126]));
  for (const [mid, col, r] of [[[-0.228, 0.395, 0.122], C.wireBlack, 0.0032], [[-0.186, 0.4, 0.12], C.wireWhite, 0.0032], [[-0.206, 0.392, 0.128], C.wireBare, 0.0018]]) {
    add(whip, tube([[-0.208, 0.364, 0.126], mid, [-0.205, 0.43, 0.097]], r, col));
  }
  add(whip, box(0.06, 0.06, 0.02, mat('#e3ded0'), [-0.33, 0.2, -0.276]));
  tag(whip, 'disposal-wiring'); g.add(whip);
  hit(g, 'disposal-wiring', 0.09, 0.1, 0.08, [-0.205, 0.43, 0.11]);
  // drain: right tailpiece + continuous waste into a tee
  const drain = group('drain');
  const tp = M.pvc();
  add(drain, pipe([0.205, 0.70, 0.005], [0.205, 0.55, 0.005], 0.019, M.chrome()));
  add(drain, pipe([-0.12, 0.55, 0.005], [0.205, 0.55, 0.005], 0.019, tp));
  add(drain, cyl(0.026, 0.026, 0.05, tp, [0.205, 0.55, 0.005]));
  if (s['sink-flex-drain'] === 'defect') {
    // corrugated "flex" drain: ribbed walls that grab grease, a belly instead of a real trap
    add(drain, ribTube([[0.205, 0.53, 0.005], [0.205, 0.45, 0.0], [0.225, 0.40, -0.07], [0.21, 0.445, -0.16], [0.2, 0.47, -0.235], [0.2, 0.47, -0.285]], 0.021, 'flexdrain', '#f2f1ec', 'rgba(0,0,0,0.28)', 140));
    add(drain, rot(cyl(0.026, 0.026, 0.022, tp, [0.205, 0.525, 0.005]), 0, 0, 0));
  } else {
    add(drain, pipe([0.205, 0.53, 0.005], [0.205, 0.46, 0.005], 0.019, tp));
    const u = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.019, 8, 14, Math.PI), tp);
    u.rotation.set(0, Math.PI / 2, Math.PI); u.position.set(0.205, 0.46, -0.04); drain.add(u);
    add(drain, pipe([0.205, 0.46, -0.085], [0.205, 0.49, -0.085], 0.019, tp));
    add(drain, pipe([0.205, 0.49, -0.085], [0.205, 0.483, -0.285], 0.019, tp));
    for (const p of [[0.205, 0.47, 0.005], [0.205, 0.47, -0.085]]) add(drain, cyl(0.025, 0.025, 0.022, tp, p));
  }
  add(drain, rot(cyl(0.032, 0.032, 0.006, M.chrome(), [0.2, 0.48, -0.283]), Math.PI / 2));
  tag(drain, 'sink-flex-drain'); g.add(drain);
  hit(g, 'sink-flex-drain', 0.1, 0.16, 0.32, [0.205, 0.47, -0.13]);
  // dishwasher drain hose arrives through the right side panel (matches kit-dishwasher)
  const dwh = group('dw-hose-sink');
  const hp = s['dw-drain-loop'] === 'defect'
    ? [[0.45, 0.14, -0.2], [0.32, 0.128, -0.16], [0.12, 0.128, -0.07], [-0.05, 0.3, 0.0], [-0.1, 0.56, 0.025], [-0.118, 0.6, 0.02]]
    : [[0.45, 0.72, -0.2], [0.38, 0.84, -0.24], [0.24, 0.835, -0.25], [0.06, 0.7, -0.15], [-0.07, 0.62, -0.03], [-0.118, 0.6, 0.02]];
  add(dwh, ribTube(hp, 0.011, 'dw-hose', '#8d9196', 'rgba(0,0,0,0.35)', 110));
  if (s['dw-drain-loop'] !== 'defect') add(dwh, box(0.05, 0.012, 0.03, M.steel(), [0.3, 0.858, -0.25]));
  add(dwh, rot(cyl(0.008, 0.008, 0.03, mat('#2c3034'), [-0.13, 0.6, 0.02]), 0, 0, Math.PI / 2));
  tag(dwh, 'dw-drain-loop'); g.add(dwh);
  // cabinet floor: old swelling + tide marks (wet or dry: the meter decides)
  const st = planeUp(0.62, 0.42, [-0.04, 0.1195, -0.02], new THREE.MeshStandardMaterial({ map: cabStainTex(), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }));
  g.add(st); if (s['sink-leak'] === 'defect') thermal(st, 'wet');
  tag(st, 'sink-leak'); tag(floorB, 'sink-leak');
  add(g, cyl(0.032, 0.032, 0.18, mat('#2f8f6a', { roughness: 0.3 }), [0.32, 0.21, 0.14]));
  add(g, cyl(0.012, 0.012, 0.03, mat('#f2f0ea'), [0.32, 0.315, 0.14]));
  add(g, box(0.1, 0.03, 0.07, mat('#e5c84a', { roughness: 1 }), [0.3, 0.133, 0.0]));
  return g;
};

B['kit-gfci'] = () => {
  const g = group('kit-gfci');
  const r = receptacle({ gfci: true, led: '#3fd16b' }); tag(r, 'kit-gfci-test'); g.add(r);
  hit(g, 'kit-gfci-test', 0.09, 0.14, 0.03, [0, 0.058, 0.012]);
  return g;
};

B['kit-hood'] = () => {
  const g = group('kit-hood');
  const sh = mat('#f1efe9', { roughness: 0.35, metalness: 0.1 });
  add(g, box(0.76, 0.30, 0.01, sh, [0, 0.15, 0.005]));
  for (const x of [-0.375, 0.375]) add(g, box(0.01, 0.30, 0.49, sh, [x, 0.15, 0.255]));
  add(g, box(0.76, 0.01, 0.5, sh, [0, 0.295, 0.25]));
  add(g, box(0.76, 0.13, 0.012, sh, [0, 0.235, 0.494]));
  add(g, box(0.74, 0.012, 0.47, mat('#d8d6cf'), [0, 0.175, 0.245]));
  // recirculating: louvered discharge grille on the front + knockout still in the top
  add(g, texPlane(0.52, 0.04, T.stripes('hood-louver', '#d7d4cc', '#1c1c1e', 18, false), [0, 0.272, 0.5005]));
  const ko = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.003, 6, 32), mat('#b9b6ae')); ko.rotation.x = -Math.PI / 2; ko.position.set(0, 0.301, 0.22); g.add(ko);
  // underside: expanded-metal grease filter over a black charcoal pad, lamp lens, sticker
  const meshTex = memo('hood-filter', () => wrap(canvasTex(128, 128, (c, w, h) => {
    c.fillStyle = '#121212'; c.fillRect(0, 0, w, h); c.strokeStyle = '#b8bcc0'; c.lineWidth = 3;
    for (let y = 0; y < h; y += 16) for (let x = 0; x < w; x += 16) { c.beginPath(); c.moveTo(x, y + 8); c.lineTo(x + 8, y); c.lineTo(x + 16, y + 8); c.lineTo(x + 8, y + 16); c.closePath(); c.stroke(); }
  })));
  const fl = planeUp(0.5, 0.3, [-0.08, 0.1685, 0.27], new THREE.MeshStandardMaterial({ map: meshTex, metalness: 0.6, roughness: 0.4 }), true); uvs(fl, 4, 2.4); g.add(fl);
  add(g, box(0.52, 0.006, 0.32, M.steel(), [-0.08, 0.172, 0.27]));
  add(g, box(0.12, 0.01, 0.08, mat('#f6f1de', { emissive: '#fff2c8', emissiveIntensity: 0.35, transparent: true, opacity: 0.9 }), [0.28, 0.168, 0.33]));
  const stk = planeUp(0.16, 0.05, [0.28, 0.1685, 0.18], new THREE.MeshStandardMaterial({ map: labelTex('hood-stk', 320, 100, '#fbfaf5', [
    { t: 'NON-DUCTED MODE', x: 160, y: 32, size: 30, bold: true, align: 'center' }, { t: 'replace charcoal filter 6 mo.', x: 160, y: 70, size: 22, align: 'center' }]), polygonOffset: true, polygonOffsetFactor: -2 }), true);
  g.add(stk);
  for (const [x, t] of [[0.24, 'FAN'], [0.31, 'LIGHT']]) {
    add(g, box(0.022, 0.013, 0.008, mat('#2a2a2c'), [x, 0.2, 0.504]));
    add(g, texPlane(0.04, 0.014, labelTex('hood-' + t, 128, 44, null, [{ t, x: 64, y: 22, size: 30, bold: true, align: 'center', color: '#55575b' }]), [x, 0.185, 0.5005]));
  }
  tag(g, 'hood-recirc');
  return g;
};

B['kit-back-door'] = () => {
  const g = group('kit-back-door');
  const trim = mat(C.white, { roughness: 0.55 }), slabM = mat('#f4f2ec', { roughness: 0.4, metalness: 0.15 });
  for (const x of [-0.44, 0.44]) add(g, box(0.02, 2.04, 0.14, trim, [x, 1.02, -0.07]));
  add(g, box(0.9, 0.02, 0.14, trim, [0, 2.05, -0.07]));
  for (const x of [-0.425, 0.425]) add(g, box(0.012, 2.02, 0.014, mat('#5d5f63'), [x, 1.02, -0.125]));
  for (const x of [-1, 1]) add(g, box(0.065, 2.1, 0.016, trim, [x * 0.4825, 1.05, 0.008]));
  add(g, box(1.03, 0.07, 0.018, trim, [0, 2.095, 0.009]));
  // slab: steel half-lite, ajar ~30° into the kitchen
  const pv = new THREE.Group(); pv.position.set(-0.425, 0.024, -0.07); pv.rotation.y = -30 * D2R;
  add(pv, box(0.85, 1.06, 0.044, slabM, [0.425, 0.53, -0.022]));
  add(pv, box(0.85, 0.2, 0.044, slabM, [0.425, 1.92, -0.022]));
  add(pv, box(0.17, 0.76, 0.044, slabM, [0.085, 1.44, -0.022]));
  add(pv, box(0.17, 0.76, 0.044, slabM, [0.765, 1.44, -0.022]));
  add(pv, planeXY(0.51, 0.76, 0.425, 1.44, -0.022, glassSky()));
  for (const y of [1.075, 1.805]) add(pv, box(0.53, 0.025, 0.05, trim, [0.425, y, -0.022]));
  for (const x of [0.165, 0.685]) add(pv, box(0.025, 0.76, 0.05, trim, [x, 1.44, -0.022]));
  for (const y of [0.3, 0.78]) add(pv, box(0.62, 0.36, 0.006, mat('#ecebe5', { roughness: 0.4 }), [0.425, y, 0.003]));
  add(pv, rot(cyl(0.028, 0.028, 0.012, M.brass(), [0.77, 0.92, 0.006]), Math.PI / 2));
  add(pv, sphere(0.027, M.brass(), [0.77, 0.92, 0.045]));
  add(pv, rot(cyl(0.026, 0.026, 0.012, M.brass(), [0.77, 1.07, 0.006]), Math.PI / 2));
  add(pv, box(0.012, 0.035, 0.016, M.brass(), [0.77, 1.07, 0.02]));
  for (const y of [0.22, 1.0, 1.78]) add(pv, box(0.006, 0.09, 0.03, M.brass(), [-0.003, y, -0.01]));
  g.add(pv);
  for (const y of [0.944, 1.094]) add(g, box(0.004, 0.06, 0.025, M.brass(), [0.428, y, -0.09]));
  // threshold (adjustable oak cap on aluminium), exterior bevel, and the deck landing beyond
  const th = group('threshold');
  add(th, box(0.88, 0.022, 0.14, new THREE.MeshStandardMaterial({ map: T.stripes('thr-ribs', '#c9ccce', '#9a9ea2', 20, false), metalness: 0.7, roughness: 0.35 }), [0, 0.011, -0.07]));
  add(th, box(0.80, 0.012, 0.032, tmat('oak-cap', () => T.wood('wood-oak', '#b8875a', 15)), [0, 0.028, -0.085]));
  add(th, quad([-0.44, -0.035, -0.19], [0.44, -0.035, -0.19], [0.44, 0.0, -0.14], [-0.44, 0.0, -0.14], mat('#c9ccce', { metalness: 0.7, roughness: 0.35, side: THREE.DoubleSide })));
  for (let i = 0; i < 6; i++) add(th, box(0.135, 0.025, 0.34, tmat('deck-pt', () => T.wood('wood-pt', C.woodPT, 25)), [-0.375 + i * 0.15, -0.0645, -0.36]));
  tag(th, 'door-threshold'); g.add(th);
  hit(g, 'door-threshold', 0.9, 0.08, 0.36, [0, 0.0, -0.12]);
  return g;
};

// ═════════════════════════════════════════════════════════════════════════════
// BATH
// ═════════════════════════════════════════════════════════════════════════════
const braidMat = () => MATS.get('braid') || (MATS.set('braid', new THREE.MeshStandardMaterial({ map: T.braid(), metalness: 0.6, roughness: 0.4 })), MATS.get('braid'));
/** Chrome angle stop on a back wall at (x,y,zWall) feeding a braided riser to `to`. */
function angleStop(g, x, y, zWall, to) {
  add(g, rot(cyl(0.024, 0.024, 0.006, M.chrome(), [x, y, zWall + 0.003]), Math.PI / 2));
  add(g, rot(cyl(0.01, 0.01, 0.05, M.chrome(), [x, y, zWall + 0.028]), Math.PI / 2));
  add(g, cyl(0.013, 0.013, 0.03, M.chrome(), [x, y, zWall + 0.05]));
  add(g, box(0.034, 0.012, 0.01, M.chrome(), [x, y, zWall + 0.07]));
  add(g, tube([[x, y + 0.015, zWall + 0.05], [x + (to[0] - x) * 0.3, y + (to[1] - y) * 0.5, (zWall + 0.05 + to[2]) / 2], to], 0.0055, braidMat()));
}

B['bath-toilet'] = (s) => {
  const g = group('bath-toilet');
  const china = M.porcelain();
  const body = new THREE.Group(); body.rotation.z = 1.8 * D2R; // it rocks: sitting off its flange
  const bowl = lathe([[0.14, 0], [0.135, 0.025], [0.112, 0.07], [0.104, 0.14], [0.125, 0.25], [0.165, 0.34], [0.18, 0.372], [0.176, 0.388], [0.156, 0.384], [0.13, 0.33], [0.09, 0.26], [0.05, 0.22], [0, 0.21]], china, [0, 0, 0.07]);
  bowl.scale.set(1, 1, 1.3); body.add(bowl);
  const wtr = new THREE.Mesh(new THREE.CircleGeometry(0.095, 24), M.water()); wtr.rotation.x = -Math.PI / 2; wtr.scale.set(1, 1.3, 1); wtr.position.set(0, 0.27, 0.085); body.add(wtr);
  add(body, box(0.22, 0.12, 0.14, china, [0, 0.33, -0.17]));
  const seat = new THREE.Mesh(new THREE.TorusGeometry(0.152, 0.022, 10, 32), mat('#f4f3ef', { roughness: 0.3 }));
  seat.rotation.x = Math.PI / 2; seat.scale.set(1, 1.3, 0.45); seat.position.set(0, 0.398, 0.07); body.add(seat);
  const lid = cyl(0.165, 0.165, 0.018, mat('#f4f3ef', { roughness: 0.3 }), [0, 0.6, -0.135]); lid.rotation.x = -Math.PI / 2 + 0.12; lid.scale.set(0.95, 1, 1.12); body.add(lid);
  add(body, box(0.44, 0.36, 0.18, china, [0, 0.58, -0.24]));
  add(body, box(0.46, 0.03, 0.2, china, [0, 0.775, -0.24]));
  add(body, box(0.06, 0.012, 0.012, M.chrome(), [-0.175, 0.71, -0.145]));
  add(body, rot(cyl(0.012, 0.012, 0.01, M.chrome(), [-0.2, 0.71, -0.148]), Math.PI / 2));
  // bolt caps: right one in place, left one missing: bare bolt and a backed-off nut
  add(body, sphere(0.018, china, [0.125, 0.012, 0.0])).scale.set(1, 1.1, 1);
  add(body, cyl(0.005, 0.005, 0.05, M.brass(), [-0.14, 0.03, 0.0]));
  add(body, cyl(0.011, 0.011, 0.008, mat('#8a6a3a', { metalness: 0.5, roughness: 0.6 }), [-0.14, 0.034, 0.0], undefined, 6));
  add(body, cyl(0.014, 0.014, 0.002, M.steel(), [-0.14, 0.022, 0.0]));
  tag(body, 'toilet-loose'); g.add(body);
  // cracked caulk bead + the shadow gap under the lifted side
  const bead = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.004, 6, 40, 4.6), mat('#f0eee6')); bead.rotation.x = -Math.PI / 2; bead.rotation.z = 0.9; bead.scale.set(1, 1.3, 1); bead.position.set(0, 0.002, 0.07); g.add(bead);
  const gap = new THREE.Mesh(new THREE.RingGeometry(0.118, 0.136, 16, 1, -0.7, 1.4), mat('#141210', { transparent: true, opacity: 0.85, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }));
  gap.rotation.x = -Math.PI / 2; gap.scale.set(1, 1.3, 1); gap.position.set(0, 0.0015, 0.07); g.add(gap);
  // somebody already chased the rock: a plastic shim jammed under the low side, the cap popped off
  const shim = rot(box(0.07, 0.008, 0.035, mat('#f1efe6', { roughness: 0.5 }), [0.15, 0.004, 0.13]), 0, -0.5, 0.06); g.add(shim);
  const cap = sphere(0.019, M.porcelain(), [-0.21, 0.009, 0.12]); cap.scale.set(1, 0.6, 1); cap.rotation.z = 2.4; g.add(cap);
  tag(bead, 'toilet-loose'); tag(gap, 'toilet-loose'); tag(shim, 'toilet-loose'); tag(cap, 'toilet-loose');
  hit(g, 'toilet-loose', 0.07, 0.07, 0.07, [-0.14, 0.03, 0]);
  // supply stop + braided riser to the fill valve
  const sup = group('sup'); angleStop(sup, -0.12, 0.18, -0.35, [-0.12, 0.40, -0.25]); g.add(sup);
  add(g, cyl(0.016, 0.016, 0.02, mat('#d8d8d4'), [-0.12, 0.39, -0.25]));
  // floor at the base: faint discoloured grout halo (dry or wet: meter decides)
  const halo = planeUp(0.62, 0.72, [0, 0.0012, 0.04], new THREE.MeshStandardMaterial({ map: memo('toilet-halo', () => canvasTex(256, 300, (c, w, h) => {
    const grd = c.createRadialGradient(w / 2, h * 0.47, 40, w / 2, h * 0.47, 128); grd.addColorStop(0, 'rgba(120,96,60,0.55)'); grd.addColorStop(0.6, 'rgba(120,96,60,0.25)'); grd.addColorStop(1, 'rgba(120,96,60,0)');
    c.fillStyle = grd; c.fillRect(0, 0, w, h);
  })), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1 }));
  g.add(halo); tag(halo, 'toilet-base-moisture');
  if (s['toilet-base-moisture'] === 'defect') thermal(halo, 'wet');
  hit(g, 'toilet-base-moisture', 0.16, 0.012, 0.12, [0.0, 0.006, 0.36]);
  hit(g, 'toilet-base-moisture', 0.12, 0.012, 0.3, [0.24, 0.006, 0.05]);
  return g;
};

/** Sink-base style carcass with both doors swung open. W×H×D, front at +D/2. */
function vanityCarcass(g, W, H, D, wood) {
  const carcass = mat('#d7c7a8', { roughness: 0.8 });
  for (const x of [-W / 2 + 0.009, W / 2 - 0.009]) add(g, box(0.018, H - 0.03, D - 0.02, carcass, [x, (H - 0.03) / 2, -0.01]));
  const fl = add(g, box(W - 0.036, 0.018, D - 0.04, mat('#cdbb98'), [0, 0.109, -0.01]));
  add(g, box(W - 0.036, 0.10, 0.018, mat('#3a2a1c'), [0, 0.05, D / 2 - 0.09]));
  add(g, box(W - 0.036, H - 0.15, 0.006, carcass, [0, 0.12 + (H - 0.15) / 2, -D / 2 + 0.013]));
  for (const x of [-W / 2 + 0.025, W / 2 - 0.025]) add(g, box(0.05, H - 0.13, 0.02, wood, [x, 0.11 + (H - 0.13) / 2, D / 2 - 0.01]));
  add(g, box(W - 0.1, 0.03, 0.02, wood, [0, 0.125, D / 2 - 0.01]));
  add(g, box(W - 0.1, 0.1, 0.02, wood, [0, H - 0.08, D / 2 - 0.01]));
  const dh = H - 0.29, dw = (W - 0.1) / 2;
  for (const side of [-1, 1]) {
    const pv = new THREE.Group(); pv.position.set(side * (W / 2 - 0.05), 0.14 + dh / 2, D / 2); pv.rotation.y = side * 108 * D2R;
    add(pv, box(dw, dh, 0.02, wood, [-side * dw / 2, 0, 0.01]));
    add(pv, box(dw - 0.09, dh - 0.1, 0.008, wood, [-side * dw / 2, 0, 0.022]));
    add(pv, rot(cyl(0.01, 0.01, 0.025, M.chrome(), [-side * (dw - 0.04), dh / 2 - 0.06, 0.035]), Math.PI / 2));
    g.add(pv);
  }
  return fl;
}

B['bath-vanity'] = () => {
  const g = group('bath-vanity');
  const wood = tmat('vanity-wood', () => T.wood('wood-vanity', '#c49a6c', 41));
  const W = 0.9, H = 0.85, D = 0.55;
  vanityCarcass(g, W, 0.82, D, wood);
  // cultured-marble top with an integral oval bowl
  const marble = mat('#f1ede4', { roughness: 0.18 });
  const top = rectShape(-W / 2, -D / 2 - 0.01, W / 2, D / 2 + 0.01);
  const hole = new THREE.Path(); hole.absellipse(0, -0.01, 0.2, 0.15, 0, Math.PI * 2, false); top.holes.push(hole);
  add(g, flatSlab(top, 0.03, marble, 0.82));
  add(g, box(W, 0.09, 0.015, marble, [0, 0.895, -D / 2 + 0.0075]));
  const bowl = lathe([[0.2, 0], [0.185, -0.05], [0.14, -0.11], [0.07, -0.145], [0, -0.152]], marble, [0, 0.85, 0.01]); bowl.scale.set(1, 1, 0.75); g.add(bowl);
  add(g, cyl(0.022, 0.022, 0.004, M.chrome(), [0, 0.7, 0.01]));
  // 4" centerset faucet
  add(g, box(0.16, 0.018, 0.055, M.chrome(), [0, 0.859, -0.21]));
  add(g, tube([[0, 0.87, -0.21], [0, 0.93, -0.18], [0, 0.92, -0.11]], 0.011, M.chrome()));
  for (const x of [-0.065, 0.065]) add(g, cyl(0.016, 0.02, 0.035, M.chrome(), [x, 0.885, -0.21]));
  // S-trap: tailpiece, U, crown over, then straight DOWN through the cabinet floor (no vent, no trap arm)
  const tr = group('s-trap'), pv = M.pvc();
  add(tr, pipe([0, 0.7, 0.01], [0, 0.5, 0.01], 0.017, M.chrome()));
  const u = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.019, 8, 14, Math.PI), pv); u.rotation.set(0, Math.PI / 2, Math.PI); u.position.set(0, 0.5, -0.035); tr.add(u);
  add(tr, pipe([0, 0.5, -0.08], [0, 0.53, -0.08], 0.019, pv));
  const crown = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.019, 8, 14, Math.PI), pv); crown.rotation.set(0, Math.PI / 2, 0); crown.position.set(0, 0.53, -0.125); tr.add(crown);
  add(tr, pipe([0, 0.53, -0.17], [0, 0.09, -0.17], 0.019, pv));
  for (const y of [0.505, 0.36]) add(tr, cyl(0.025, 0.025, 0.022, pv, [0, y, y > 0.4 ? 0.01 : -0.17]));
  add(tr, cyl(0.036, 0.036, 0.005, M.chrome(), [0, 0.121, -0.17]));
  tag(tr, 'vanity-s-trap'); g.add(tr);
  hit(g, 'vanity-s-trap', 0.1, 0.5, 0.3, [0, 0.38, -0.08]);
  const sv = group('stops');
  angleStop(sv, -0.15, 0.36, -D / 2 + 0.016, [-0.065, 0.82, -0.21]);
  angleStop(sv, 0.15, 0.36, -D / 2 + 0.016, [0.065, 0.82, -0.21]);
  tag(sv, 'vanity-supply-valves'); g.add(sv);
  hit(g, 'vanity-supply-valves', 0.12, 0.1, 0.12, [-0.15, 0.36, -0.22]);
  hit(g, 'vanity-supply-valves', 0.12, 0.1, 0.12, [0.15, 0.36, -0.22]);
  add(g, cyl(0.03, 0.035, 0.2, mat('#e9eef2', { roughness: 0.3 }), [0.3, 0.218, 0.1]));
  add(g, box(0.03, 0.04, 0.05, mat('#2f6fd0'), [0.3, 0.338, 0.1]));
  return g;
};

B['bath-tub'] = (s) => {
  const g = group('bath-tub');
  const tileM = tmat('tile-m', T.tile, { roughness: 0.25 }), U = 0.216, zw = -0.395;
  // back wall tile, cut around the patch below the soap dish (UVs world-aligned so grout lines run through)
  const back = [[-0.75, 0.15, 0.40, 1.90], [0.45, 0.75, 0.40, 1.90], [0.15, 0.45, 0.40, 0.60], [0.15, 0.45, 0.98, 1.90]];
  for (const [x0, x1, y0, y1] of back) add(g, planeXY(x1 - x0, y1 - y0, (x0 + x1) / 2, (y0 + y1) / 2, zw, tileM, U));
  const patch = planeXY(0.30, 0.38, 0.30, 0.79, zw, tileM, U); g.add(patch);
  tag(patch, 'tub-wall-moisture'); if (s['tub-wall-moisture'] === 'defect') thermal(patch, 'wet');
  // grout around the dish has gone grey and hairline-cracked in both states: ambiguous by eye
  const gr = texPlane(0.24, 0.16, memo('grout-cracks', () => canvasTex(256, 170, (c, w, h) => {
    const r = rng(101); c.strokeStyle = 'rgba(70,60,50,0.55)'; c.lineWidth = 2;
    c.strokeRect(20, 20, w - 40, h - 40); crack(c, jag([30, h - 22], [w - 40, h - 20], 8, 4, r), 2, 1, 'rgba(50,40,30,0.7)', null);
  })), [0.30, 1.03, zw + 0.001]); g.add(gr);
  // end walls with tile faces
  for (const sx of [-1, 1]) {
    add(g, box(0.1, 1.9, 0.8, mat(C.drywall), [sx * 0.8, 0.95, 0]));
    const ew = planeXY(0.8, 1.5, 0, 1.15, 0, tileM, U); ew.rotation.y = -sx * Math.PI / 2; ew.position.set(sx * 0.749, 1.15, 0); g.add(ew);
  }
  // tub: apron, rim deck, basin (BackSide box reads as an enamel interior)
  const enamel = M.enamel();
  add(g, box(1.5, 0.37, 0.04, enamel, [0, 0.185, 0.38]));
  const rim = rectShape(-0.75, -0.4, 0.75, 0.4); const h = new THREE.Path(); rrectPath(h, -0.66, -0.30, 0.66, 0.33, 0.1); rim.holes.push(h);
  add(g, flatSlab(rim, 0.03, enamel, 0.37));
  add(g, box(1.32, 0.31, 0.63, mat('#f3f2ee', { roughness: 0.22, side: THREE.BackSide }), [0, 0.225, -0.015]));
  add(g, cyl(0.03, 0.03, 0.004, M.chrome(), [-0.55, 0.072, -0.015]));
  add(g, rot(cyl(0.035, 0.035, 0.008, M.chrome(), [-0.656, 0.29, -0.015]), 0, 0, Math.PI / 2));
  // valve, spout, shower on the left end wall
  add(g, rot(cyl(0.075, 0.075, 0.008, M.chrome(), [-0.745, 1.05, -0.05]), 0, 0, Math.PI / 2));
  add(g, box(0.06, 0.02, 0.11, M.chrome(), [-0.715, 1.05, -0.02]));
  add(g, rot(cyl(0.022, 0.026, 0.13, M.chrome(), [-0.685, 0.56, -0.05]), 0, 0, Math.PI / 2));
  add(g, cyl(0.007, 0.007, 0.03, M.chrome(), [-0.635, 0.585, -0.05]));
  add(g, pipe([-0.748, 1.86, -0.05], [-0.62, 1.82, -0.05], 0.011, M.chrome()));
  add(g, rot(cyl(0.045, 0.028, 0.05, M.chrome(), [-0.6, 1.8, -0.05]), 0, 0, 0.9));
  // soap dish + soap
  add(g, box(0.15, 0.075, 0.05, M.porcelain(), [0.30, 1.05, zw + 0.025]));
  add(g, box(0.13, 0.014, 0.05, M.porcelain(), [0.30, 1.018, zw + 0.045]));
  add(g, box(0.08, 0.022, 0.045, mat('#e6d6b8', { roughness: 0.6 }), [0.30, 1.036, zw + 0.045]));
  // tub-to-wall caulk
  const ck = group('caulk'), ckM = mat('#f4f4f0', { roughness: 0.5 });
  if (s['tub-caulk'] === 'defect') {
    for (const [x0, x1] of [[-0.66, -0.2], [-0.12, 0.08], [0.42, 0.66]]) add(ck, pipe([x0, 0.405, zw + 0.004], [x1, 0.405, zw + 0.004], 0.006, ckM));
    for (const [x0, x1] of [[-0.2, -0.12], [0.08, 0.42]]) add(ck, box(x1 - x0, 0.009, 0.008, mat('#0f0d0b'), [(x0 + x1) / 2, 0.404, zw + 0.004]));
    const mildew = texPlane(1.3, 0.05, memo('mildew', () => canvasTex(512, 24, (c, w, h) => {
      const r = rng(201); for (let i = 0; i < 260; i++) { c.fillStyle = `rgba(30,36,24,${0.25 + r() * 0.5})`; c.beginPath(); c.arc(r() * w, h - r() * r() * h, 0.6 + r() * 1.8, 0, 7); c.fill(); }
    })), [0, 0.428, zw + 0.002]); ck.add(mildew);
    const curl = tube([[0.24, 0.41, zw + 0.008], [0.27, 0.42, zw + 0.03], [0.3, 0.405, zw + 0.045], [0.33, 0.39, zw + 0.04]], 0.005, ckM); ck.add(curl);
    for (const sx of [-1, 1]) add(ck, rot(pipe([sx * 0.745, 0.405, -0.4], [sx * 0.735, 0.41, 0.1], 0.006, ckM), 0, 0, sx * 0.02));
  } else {
    add(ck, pipe([-0.66, 0.405, zw + 0.004], [0.66, 0.405, zw + 0.004], 0.006, ckM));
    for (const sx of [-1, 1]) add(ck, pipe([sx * 0.745, 0.405, -0.4], [sx * 0.745, 0.405, 0.33], 0.006, ckM));
  }
  tag(ck, 'tub-caulk'); g.add(ck);
  hit(g, 'tub-caulk', 1.32, 0.05, 0.05, [0, 0.41, zw + 0.02]);
  // curtain rod, bunched curtain, a shampoo bottle on the rim
  add(g, pipe([-0.75, 1.84, 0.36], [0.75, 1.84, 0.36], 0.012, M.chrome()));
  const cgeo = new THREE.CylinderGeometry(0.07, 0.085, 1.4, 48, 1, true), cp = cgeo.attributes.position;
  for (let i = 0; i < cp.count; i++) { const a = Math.atan2(cp.getZ(i), cp.getX(i)), k = 1 + 0.28 * Math.sin(a * 9); cp.setX(i, cp.getX(i) * k); cp.setZ(i, cp.getZ(i) * k); }
  cgeo.computeVertexNormals();
  const cur = new THREE.Mesh(cgeo, mat('#a9c4cf', { roughness: 0.9, side: THREE.DoubleSide })); cur.position.set(0.62, 1.13, 0.36); cur.scale.set(0.55, 1, 0.9); cur.castShadow = true; g.add(cur);
  add(g, cyl(0.03, 0.032, 0.18, mat('#c26d8a', { roughness: 0.35 }), [0.62, 0.49, -0.33]));
  return g;
};

B['bath-gfci'] = () => {
  const g = group('bath-gfci');
  const r = receptacle({ gfci: true, device: '#ece2c8', plate: '#ece2c8' }); tag(r, 'bath-gfci-test'); g.add(r);
  hit(g, 'bath-gfci-test', 0.09, 0.14, 0.03, [0, 0.058, 0.012]);
  return g;
};

B['bath-fan'] = () => {
  const g = group('bath-fan');
  const w = mat('#f3f2ee', { roughness: 0.4 });
  for (const [x, z, sw, sd] of [[0, 0.142, 0.3, 0.016], [0, -0.142, 0.3, 0.016], [0.142, 0, 0.016, 0.3], [-0.142, 0, 0.016, 0.3]]) add(g, box(sw, 0.022, sd, w, [x, -0.011, z]));
  add(g, planeUp(0.27, 0.27, [0, -0.003, 0], mat('#141416'), true));
  add(g, rot(cyl(0.07, 0.07, 0.012, mat('#3a3c40'), [0, -0.01, 0]), 0, 0.4, 0));
  const grilleTex = memo('fan-grille', () => canvasTex(256, 256, (c, W, H) => {
    c.fillStyle = '#f3f2ee'; c.fillRect(0, 0, W, H);
    for (let i = 0; i < 9; i++) c.clearRect(28, 26 + i * 23, W - 56, 11);
  }));
  const gp = planeUp(0.268, 0.268, [0, -0.021, 0], new THREE.MeshStandardMaterial({ map: grilleTex, alphaTest: 0.5, roughness: 0.4, side: THREE.DoubleSide }), true); g.add(gp);
  // a square of tissue held flat against the grille by the draw: the fan pulls
  const tp = planeUp(0.1, 0.1, [0.04, -0.0225, 0.02], mat('#fbfbf8', { roughness: 1, side: THREE.DoubleSide }), true); tp.rotation.z = 0.35; g.add(tp);
  tag(g, 'bath-fan-operation');
  return g;
};

// ═════════════════════════════════════════════════════════════════════════════
// PRIMARY BEDROOM
// ═════════════════════════════════════════════════════════════════════════════
B['pri-window'] = () => {
  // FLOOR-REFERENCED: y=0 is the finished floor. Stool top at 52" (1.321 m).
  const g = group('pri-window');
  const trim = mat(C.white, { roughness: 0.55 }), vinyl = mat('#f6f6f2', { roughness: 0.4 });
  const SILL = 1.321, TOP = 2.30;
  const win = group('win');
  add(win, box(0.98, 0.045, 0.018, trim, [0, SILL - 0.045, 0.009]));
  add(win, box(1.08, 0.022, 0.09, trim, [0, SILL - 0.011, 0.045]));
  for (const x of [-0.4925, 0.4925]) add(win, box(0.065, TOP - SILL + 0.065, 0.016, trim, [x, (SILL + TOP + 0.065) / 2, 0.008]));
  add(win, box(1.05, 0.065, 0.018, trim, [0, TOP + 0.0325, 0.009]));
  // single-hung: upper sash fixed (outer), lower sash raised to the stop (inner): the clear opening
  const mid = (SILL + TOP) / 2;
  for (const [y0, y1, z] of [[mid, TOP, 0.022], [mid - 0.02, TOP - 0.03, 0.04]]) {
    add(win, box(0.92, 0.045, 0.03, vinyl, [0, y0 + 0.0225, z])); add(win, box(0.92, 0.04, 0.03, vinyl, [0, y1 - 0.02, z]));
    for (const x of [-0.435, 0.435]) add(win, box(0.05, y1 - y0, 0.03, vinyl, [x, (y0 + y1) / 2, z]));
    add(win, planeXY(0.82, y1 - y0 - 0.085, 0, (y0 + y1) / 2, z, glassSky()));
  }
  for (const x of [-0.25, 0.25]) add(win, box(0.06, 0.012, 0.016, vinyl, [x, mid + 0.005, 0.064]));
  const scr = planeXY(0.88, mid - SILL - 0.03, 0, (SILL + mid) / 2, 0.012, new THREE.MeshStandardMaterial({ map: memo('screen', () => wrap(canvasTex(64, 64, (c, w, h) => { c.fillStyle = 'rgba(60,64,68,0.2)'; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(40,44,48,0.75)'; for (let i = 0; i < w; i += 4) { c.fillRect(i, 0, 1, h); c.fillRect(0, i, w, 1); } }))), transparent: true, side: THREE.DoubleSide }), 0.05);
  win.add(scr);
  for (const x of [-0.45, 0.45]) add(win, box(0.016, mid - SILL, 0.03, vinyl, [x, (SILL + mid) / 2, 0.02]));
  tag(win, 'egress-sill-height'); g.add(win);
  // inspector's tape hooked on the floor, case parked on the stool: reads 52"
  const tp = group('tape');
  const blade = box(0.025, SILL, 0.0015, tmat('tape-v', () => tapeTex('tape-v', 60, true)), [-0.565, SILL / 2, 0.012]); uvs(blade, 1, SILL / 1.524); tp.add(blade);
  add(tp, box(0.024, 0.004, 0.02, M.steel(), [-0.565, 0.002, 0.018]));
  add(tp, box(0.075, 0.075, 0.04, mat('#e8c21c', { roughness: 0.5 }), [-0.565, SILL + 0.0375, 0.03]));
  add(tp, rot(cyl(0.024, 0.024, 0.042, mat('#1e1e22'), [-0.565, SILL + 0.0375, 0.03]), Math.PI / 2));
  add(tp, box(0.04, 0.003, 0.02, mat('#c8312b'), [-0.535, SILL, 0.013]));
  // blue painter's-tape flag the inspector marked: floor to sill
  const flag = texPlane(0.11, 0.05, labelTex('tape-flag', 220, 100, '#5b8fd6', [{ t: 'SILL 52"', x: 110, y: 52, size: 44, bold: true, align: 'center', color: '#101830', font: 'Marker Felt, Comic Sans MS, sans-serif' }]), [-0.66, SILL - 0.06, 0.004]);
  flag.rotation.z = 0.06; tp.add(flag);
  tag(tp, 'egress-sill-height'); g.add(tp);
  hit(g, 'egress-sill-height', 0.1, 1.3, 0.05, [-0.565, 0.65, 0.02]);
  return g;
};

B['pri-smoke-alarm'] = (s) => {
  const g = group('pri-smoke-alarm');
  add(g, planeUp(0.4, 0.4, [0, -0.0015, 0], tmat('ceil-drywall', T.drywall), true));
  if (s['bedroom-smoke-alarm'] === 'defect') {
    // no alarm in the sleeping room: a painted-over blank cover and the ghost ring of the old one
    add(g, planeUp(0.17, 0.17, [0, -0.002, 0], new THREE.MeshStandardMaterial({ map: memo('ghost-ring', () => canvasTex(128, 128, (c, w, h) => {
      c.strokeStyle = 'rgba(150,130,90,0.45)'; c.lineWidth = 7; c.beginPath(); c.arc(w / 2, h / 2, 54, 0, 7); c.stroke();
      c.fillStyle = 'rgba(160,140,100,0.12)'; c.beginPath(); c.arc(w / 2, h / 2, 50, 0, 7); c.fill();
    })), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }), true));
    add(g, cyl(0.052, 0.052, 0.006, mat(C.white, { roughness: 0.7 }), [0, -0.005, 0]));
    for (const x of [-0.035, 0.035]) add(g, cyl(0.004, 0.004, 0.002, mat('#d9d6cc'), [x, -0.0085, 0]));
  } else {
    add(g, cyl(0.066, 0.068, 0.036, mat('#f7f7f3', { roughness: 0.4 }), [0, -0.018, 0]));
    add(g, planeUp(0.12, 0.12, [0, -0.0365, 0], new THREE.MeshStandardMaterial({ map: labelTex('alarm-face-ok', 256, 256, null, [
      { t: 'SMOKE', x: 128, y: 104, size: 38, bold: true, align: 'center', color: '#7c7d80' },
      { t: '10-YEAR SEALED', x: 128, y: 150, size: 20, align: 'center', color: '#9a9b9e' }], { pre: (c, w) => { c.fillStyle = '#f7f7f3'; c.beginPath(); c.arc(w / 2, w / 2, w / 2 - 2, 0, 7); c.fill(); c.strokeStyle = '#d8d8d2'; c.lineWidth = 3; for (let r = 60; r < 125; r += 14) { c.beginPath(); c.arc(w / 2, w / 2, r, 0, 7); c.stroke(); } } }), emissiveMap: TEX.get('alarm-face-ok'), emissive: '#ffffff', emissiveIntensity: 0.35, transparent: true }), true));
    add(g, cyl(0.016, 0.016, 0.006, mat('#e9e9e4'), [0, -0.039, 0.03]));
    add(g, sphere(0.003, mat('#3fd16b', { emissive: '#3fd16b', emissiveIntensity: 1 }), [0.04, -0.037, 0.02]));
  }
  tag(g, 'bedroom-smoke-alarm');
  return g;
};

B['pri-receptacle'] = () => {
  const g = group('pri-receptacle');
  const r = receptacle({ device: '#efe9da', plate: '#efe9da', drip: true }); tag(r, 'open-ground'); g.add(r);
  hit(g, 'open-ground', 0.09, 0.14, 0.03, [0, 0.058, 0.012]);
  return g;
};

B['pri-closet'] = (s) => {
  const g = group('pri-closet');
  // context: shelf with stored boxes reaching up toward the light
  add(g, box(0.62, 0.02, 0.3, mat(C.white, { roughness: 0.6 }), [0.02, -0.56, -0.3]));
  add(g, box(0.32, 0.38, 0.28, mat('#b58d5a', { roughness: 0.95 }), [0.08, -0.36, -0.3]));
  add(g, box(0.24, 0.2, 0.24, mat('#a37d4e', { roughness: 0.95 }), [-0.18, -0.45, -0.3]));
  add(g, box(0.18, 0.004, 0.06, mat('#d8c9a8'), [0.08, -0.169, -0.2]));
  const fx = group('fixture');
  if (s['closet-light'] === 'defect') {
    // bare incandescent in a porcelain keyless/pull-chain lampholder
    add(fx, cyl(0.055, 0.062, 0.034, M.porcelain(), [0, -0.017, 0]));
    add(fx, cyl(0.02, 0.02, 0.02, M.brass(), [0, -0.044, 0]));
    const bulb = sphere(0.032, mat('#fff6dc', { emissive: '#ffd890', emissiveIntensity: 0.55, roughness: 0.2, transparent: true, opacity: 0.92 }), [0, -0.1, 0]); bulb.scale.set(1, 1.15, 1); fx.add(bulb);
    add(fx, cyl(0.016, 0.02, 0.03, mat('#fff6dc', { emissive: '#ffd890', emissiveIntensity: 0.4, transparent: true, opacity: 0.9 }), [0, -0.064, 0]));
    thermal(bulb, 'hot');
    add(fx, cyl(0.0012, 0.0012, 0.26, mat('#b9b9b0', { metalness: 0.7 }), [0.03, -0.17, 0]));
    add(fx, cyl(0.004, 0.004, 0.02, mat('#d9d4c6'), [0.03, -0.305, 0]));
  } else {
    add(fx, cyl(0.15, 0.15, 0.028, mat('#f7f7f3', { roughness: 0.4 }), [0, -0.014, 0]));
    add(fx, cyl(0.135, 0.14, 0.018, mat('#fbfaf4', { emissive: '#fff6e0', emissiveIntensity: 0.5, roughness: 0.6 }), [0, -0.036, 0]));
  }
  tag(fx, 'closet-light'); g.add(fx);
  hit(g, 'closet-light', 0.16, 0.16, 0.16, [0, -0.08, 0]);
  return g;
};

// ═════════════════════════════════════════════════════════════════════════════
// BEDROOM 2
// ═════════════════════════════════════════════════════════════════════════════
B['bed2-window'] = () => {
  const g = group('bed2-window');
  const trim = mat(C.white, { roughness: 0.55 }), al = mat('#e9e8e2', { roughness: 0.35, metalness: 0.3 });
  const W = 0.92, y0 = 0.08, y1 = 1.14;
  add(g, box(W - 0.06, 0.05, 0.018, trim, [0, 0.025, 0.009]));
  add(g, box(W + 0.08, 0.022, 0.08, trim, [0, 0.066, 0.04]));
  for (const x of [-(W / 2 + 0.03), W / 2 + 0.03]) add(g, box(0.06, y1 - y0 + 0.06, 0.016, trim, [x, (y0 + y1 + 0.06) / 2, 0.008]));
  add(g, box(W + 0.12, 0.06, 0.018, trim, [0, y1 + 0.03, 0.009]));
  // horizontal slider: left panel fixed (outer), right panel slides (inner)
  for (const [cx, z] of [[-W / 4 + 0.01, 0.02], [W / 4 - 0.01, 0.036]]) {
    const pw = W / 2 + 0.02;
    add(g, box(pw, 0.035, 0.02, al, [cx, y0 + 0.0175, z])); add(g, box(pw, 0.035, 0.02, al, [cx, y1 - 0.0175, z]));
    for (const dx of [-pw / 2 + 0.0175, pw / 2 - 0.0175]) add(g, box(0.035, y1 - y0, 0.02, al, [cx + dx, (y0 + y1) / 2, z]));
    add(g, planeXY(pw - 0.07, y1 - y0 - 0.07, cx, (y0 + y1) / 2, z, glassSky()));
  }
  add(g, box(0.015, 0.06, 0.02, mat('#8a8c90'), [0.035, 0.62, 0.05]));
  // fixed security grille: square tube, bolted with one-way screws, no quick-release anywhere
  const bars = group('bars'), iron = mat('#1b1b1d', { roughness: 0.6, metalness: 0.4 }), zb = 0.18;
  const bx0 = -0.5, bx1 = 0.5, by0 = 0.02, by1 = 1.2;
  add(bars, box(bx1 - bx0, 0.022, 0.022, iron, [0, by0, zb])); add(bars, box(bx1 - bx0, 0.022, 0.022, iron, [0, by1, zb]));
  add(bars, box(0.022, by1 - by0, 0.022, iron, [bx0, (by0 + by1) / 2, zb])); add(bars, box(0.022, by1 - by0, 0.022, iron, [bx1, (by0 + by1) / 2, zb]));
  for (let i = 1; i < 8; i++) add(bars, box(0.016, by1 - by0, 0.016, iron, [bx0 + i * (bx1 - bx0) / 8, (by0 + by1) / 2, zb]));
  for (const y of [0.42, 0.82]) add(bars, box(bx1 - bx0, 0.016, 0.016, iron, [0, y, zb]));
  for (const x of [bx0, bx1]) for (const y of [0.12, 1.1]) {
    add(bars, box(0.03, 0.05, zb, iron, [x + Math.sign(x) * 0.02, y, zb / 2]));
    add(bars, box(0.06, 0.06, 0.006, iron, [x + Math.sign(x) * 0.035, y, 0.003]));
    add(bars, rot(cyl(0.008, 0.008, 0.006, iron, [x + Math.sign(x) * 0.035, y, 0.009]), Math.PI / 2));
    add(bars, decal(0.022, 0.03, '#efece4', [x + Math.sign(x) * 0.035, y + 0.002, 0.0125], { opacity: 0.9 })); // painted over: never opened
  }
  tag(bars, 'security-bars'); g.add(bars);
  hit(g, 'security-bars', 1.04, 1.22, 0.06, [0, 0.61, zb]);
  return g;
};

const wallCrackTex = (defect) => memo('wallcrack-' + defect, () => canvasTex(768, 512, (g, w, h) => {
  const r = rng(defect ? 111 : 113); const ppm = 640;
  g.fillStyle = C.drywall; g.fillRect(0, 0, w, h); noise(g, w, h, 7, r);
  const X = (m) => (m + 0.6) * ppm, Y = (m) => h - m * ppm;
  if (defect) {
    // diagonal crack off the head-casing corner, widest at the corner, plus drywall pulled off the head
    const pts = jag([X(0.465), Y(0.0)], [X(-0.12), Y(0.8)], 18, 18, r);
    crack(g, pts, 9, 1.5);
    for (let i = 4; i < 12; i += 4) { const p = pts[i]; crack(g, jag(p, [p[0] + 30 + r() * 30, p[1] - 20 - r() * 30], 4, 6, r), 2.5, 0.8, '#2a2018', null); }
    g.fillStyle = '#16110d'; g.beginPath(); g.moveTo(X(0.06), h); g.lineTo(X(0.47), h); g.lineTo(X(0.47), h - 9); g.closePath(); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(X(0.1), h - 13, X(0.47) - X(0.1), 2);
  } else {
    // a hairline along a taped butt joint: the paper tape edges still catch a raking light
    const x = X(0.47);
    g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(x - 24, 0, 2, h); g.fillStyle = 'rgba(0,0,0,0.07)'; g.fillRect(x + 22, 0, 2, h);
    crack(g, jag([x, h], [x - 2, h * 0.35], 12, 2, r), 1.4, 0.6, 'rgba(60,50,40,0.8)', null);
  }
}));
B['bed2-wall-crack'] = (s) => {
  const g = group('bed2-wall-crack');
  const p = planeXY(1.2, 0.8, 0, 0.4, 0.006, new THREE.MeshStandardMaterial({ map: wallCrackTex(s['drywall-crack'] === 'defect'), roughness: 0.9, polygonOffset: true, polygonOffsetFactor: -1 }));
  const uv = p.geometry.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, i % 2 ? 1 : 0, i < 2 ? 1 : 0);
  g.add(p); tag(p, 'drywall-crack');
  return g;
};

B['bed2-door'] = () => {
  const g = group('bed2-door');
  const trim = mat(C.white, { roughness: 0.55 }), slabM = mat('#f6f4ee', { roughness: 0.5 });
  for (const x of [-0.41, 0.41]) add(g, box(0.02, 2.04, 0.11, trim, [x, 1.02, -0.055]));
  add(g, box(0.84, 0.02, 0.11, trim, [0, 2.05, -0.055]));
  for (const x of [-0.395, 0.395]) add(g, box(0.012, 2.02, 0.03, trim, [x, 1.02, -0.075]));
  for (const zc of [0.008, -0.118]) {
    for (const x of [-0.4525, 0.4525]) add(g, box(0.065, 2.09, 0.016, trim, [x, 1.045, zc]));
    add(g, box(0.97, 0.065, 0.018, trim, [0, 2.09, zc]));
  }
  // strike plate + latch pocket on the latch jamb
  add(g, box(0.003, 0.07, 0.03, M.brass(), [0.399, 0.91, -0.03]));
  add(g, box(0.004, 0.022, 0.012, M.dark(), [0.4, 0.91, -0.03]));
  // six-panel hollow-core door, swung open into the room
  const pv = new THREE.Group(); pv.position.set(-0.39, 0.012, -0.022); pv.rotation.y = -72 * D2R;
  add(pv, box(0.78, 2.02, 0.035, slabM, [0.39, 1.01, -0.0175]));
  for (const zf of [0.002, -0.037]) for (const [x, y, w, h] of [[0.2, 1.74, 0.26, 0.34], [0.58, 1.74, 0.26, 0.34], [0.2, 1.12, 0.26, 0.72], [0.58, 1.12, 0.26, 0.72], [0.2, 0.36, 0.26, 0.5], [0.58, 0.36, 0.26, 0.5]])
    add(pv, box(w, h, 0.004, mat('#f1efe8', { roughness: 0.5 }), [x, y, zf]));
  for (const zf of [0.012, -0.047]) { add(pv, rot(cyl(0.026, 0.026, 0.01, M.brass(), [0.72, 0.91, zf * 0.5]), Math.PI / 2)); add(pv, sphere(0.026, M.brass(), [0.72, 0.91, zf * 1.6])); }
  add(pv, box(0.006, 0.022, 0.012, M.brass(), [0.782, 0.91, -0.0175]));
  add(pv, box(0.004, 0.06, 0.025, M.brass(), [0.7805, 0.91, -0.0175]));
  for (const y of [0.2, 1.0, 1.82]) add(pv, box(0.006, 0.09, 0.03, M.brass(), [-0.003, y, -0.012]));
  g.add(pv);
  tag(g, 'door-latch');
  return g;
};

// ═════════════════════════════════════════════════════════════════════════════
// HALL
// ═════════════════════════════════════════════════════════════════════════════
B['hall-attic-ladder'] = () => {
  const g = group('hall-attic-ladder');
  const trim = mat(C.white, { roughness: 0.55 }), lum = tmat('ladder-wood', () => T.wood('wood-ladder', '#c9a26f', 51));
  const OX = 0.28, OZ = 0.63;
  for (const sx of [-1, 1]) add(g, box(0.06, 0.012, 1.38, trim, [sx * (OX + 0.03), -0.006, 0]));
  for (const sz of [-1, 1]) add(g, box(0.68, 0.012, 0.06, trim, [0, -0.006, sz * (OZ + 0.03)]));
  for (const sx of [-1, 1]) add(g, box(0.02, 0.2, 1.26, lum, [sx * (OX + 0.01), 0.08, 0]));
  for (const sz of [-1, 1]) add(g, box(0.58, 0.2, 0.02, lum, [0, 0.08, sz * (OZ + 0.01)]));
  add(g, planeUp(0.56, 1.26, [0, 0.18, 0], M.dark(), true));
  // hatch panel swung down with the ladder still folded on it
  const pv = new THREE.Group(); pv.position.set(0, -0.03, -0.62); pv.rotation.x = 55 * D2R;
  add(pv, box(0.56, 0.012, 1.26, mat('#d9c7a2', { roughness: 0.8 }), [0, 0, 0.63]));
  for (const sx of [-1, 1]) {
    add(pv, box(0.03, 0.07, 1.2, lum, [sx * 0.24, 0.041, 0.63]));
    add(pv, box(0.03, 0.07, 0.86, lum, [sx * 0.24, 0.111, 0.5]));
    // panel hinge strap: 5 screw holes, 2 nails
    add(pv, box(0.04, 0.004, 0.15, M.steel(), [sx * 0.2, 0.008, 0.09]));
    for (let k = 0; k < 5; k++) add(pv, cyl(0.004, 0.004, 0.002, M.dark(), [sx * 0.2, 0.0105, 0.035 + k * 0.028]));
    for (const k of [0, 3]) add(pv, cyl(0.0055, 0.0055, 0.003, mat('#e6e8ea', { metalness: 0.8, roughness: 0.3 }), [sx * 0.2, 0.0115, 0.035 + k * 0.028]));
  }
  for (let k = 0; k < 5; k++) add(pv, box(0.45, 0.018, 0.08, lum, [0, 0.041, 0.18 + k * 0.24]));
  for (let k = 0; k < 3; k++) add(pv, box(0.45, 0.018, 0.08, lum, [0, 0.111, 0.2 + k * 0.26]));
  g.add(pv);
  // pull cord off the free end
  add(g, cyl(0.002, 0.002, 0.28, mat('#e7e1cf'), [0, -1.15, 0.07]));
  add(g, new THREE.Mesh(new THREE.TorusGeometry(0.02, 0.005, 6, 12), mat('#e7e1cf'))).position.set(0, -1.31, 0.07);
  // pivot plates hang just below the frame at the hinge end: 4 lag-screw holes each, all empty;
  // the plates are held by a couple of finish nails, one bent over, plate pulled off the jamb
  const nailM = mat('#eef0f2', { metalness: 0.5, roughness: 0.3 }), plateM = mat('#c3c9ce', { metalness: 0.45, roughness: 0.4 });
  for (const sx of [-1, 1]) {
    const x = sx * (OX + 0.026);
    add(g, box(0.005, 0.2, 0.2, plateM, [x, -0.06, -0.52]));
    add(g, box(0.005, 0.06, 0.06, plateM, [x, -0.18, -0.56]));
    for (const [dy, dz] of [[-0.11, -0.07], [-0.11, 0.07], [0.0, -0.07], [0.0, 0.07]]) add(g, rot(cyl(0.009, 0.009, 0.002, M.dark(), [x + sx * 0.0035, -0.05 + dy, -0.52 + dz]), 0, 0, Math.PI / 2));
    for (const [dy, dz] of [[-0.04, 0.0], [0.05, -0.03]]) add(g, rot(cyl(0.006, 0.006, 0.003, nailM, [x + sx * 0.004, -0.05 + dy, -0.52 + dz]), 0, 0, Math.PI / 2));
    if (sx > 0) add(g, pipe([x + 0.004, -0.0, -0.46], [x + 0.03, 0.01, -0.44], 0.0022, nailM));
    // spring + folding operating arm
    add(g, pipe([sx * 0.255, 0.1, -0.38], [sx * 0.255, -0.05, -0.56], 0.012, new THREE.MeshStandardMaterial({ map: T.stripes('spring', '#55585c', '#1e1f22', 24, true), metalness: 0.5, roughness: 0.4 })));
    add(g, pipe([sx * 0.27, -0.02, -0.12], [sx * 0.27, -0.28, -0.08], 0.006, M.steel()));
    add(g, pipe([sx * 0.27, -0.28, -0.08], [sx * 0.27, -0.44, -0.34], 0.006, M.steel()));
    hit(g, 'attic-ladder', 0.08, 0.26, 0.24, [x, -0.07, -0.52]);
  }
  // the label every one of these ships with
  const lbl = texPlane(0.3, 0.12, labelTex('ladder-label', 400, 160, '#f5d33a', [
    { t: '⚠ WARNING', x: 200, y: 26, size: 30, bold: true, align: 'center' },
    { t: 'Fasten pivot plates with', x: 200, y: 70, size: 24, align: 'center' },
    { t: '1/4" x 3" lag screws. Nails alone', x: 200, y: 102, size: 24, align: 'center' },
    { t: 'are NOT sufficient.', x: 200, y: 134, size: 24, bold: true, align: 'center' }]), [0, 0.0075, 0.07]);
  lbl.rotation.x = -Math.PI / 2; pv.add(lbl);
  tag(g, 'attic-ladder');
  return g;
};

B['hall-co-alarm'] = (s) => {
  const g = group('hall-co-alarm');
  const combo = s['co-alarm'] !== 'defect';
  add(g, cyl(0.07, 0.072, 0.04, mat('#f6f6f2', { roughness: 0.4 }), [0, -0.02, 0]));
  const face = combo
    ? labelTex('alarm-combo', 256, 256, null, [
      { t: 'SMOKE + CO', x: 128, y: 70, size: 30, bold: true, align: 'center', color: '#1d1d1f' },
      { t: 'CO  PPM', x: 128, y: 196, size: 18, bold: true, align: 'center', color: '#555' }],
      { pre: (c, w) => { c.fillStyle = '#f6f6f2'; c.beginPath(); c.arc(w / 2, w / 2, w / 2 - 2, 0, 7); c.fill(); c.fillStyle = '#bcd0c0'; c.fillRect(78, 98, 100, 58); c.fillStyle = '#1b2a1e'; c.font = 'bold 46px Courier New, monospace'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('  0', 124, 128); c.strokeStyle = '#d6d6d0'; c.lineWidth = 3; c.beginPath(); c.arc(w / 2, w / 2, 118, 0, 7); c.stroke(); } })
    : labelTex('alarm-smoke', 256, 256, null, [
      { t: 'SMOKE', x: 128, y: 82, size: 36, bold: true, align: 'center', color: '#1d1d1f' },
      { t: 'ALARM', x: 128, y: 120, size: 24, bold: true, align: 'center', color: '#555' },
      { t: 'PUSH TO TEST', x: 128, y: 200, size: 16, align: 'center', color: '#777' }],
      { pre: (c, w) => { c.fillStyle = '#f6f6f2'; c.beginPath(); c.arc(w / 2, w / 2, w / 2 - 2, 0, 7); c.fill(); c.strokeStyle = '#d6d6d0'; c.lineWidth = 3; for (let r = 92; r < 125; r += 12) { c.beginPath(); c.arc(w / 2, w / 2, r, 0, 7); c.stroke(); } c.fillStyle = '#e4e4de'; c.beginPath(); c.arc(w / 2, 162, 20, 0, 7); c.fill(); } });
  add(g, planeUp(0.136, 0.136, [0, -0.0405, 0], new THREE.MeshStandardMaterial({ map: face, emissiveMap: face, emissive: '#ffffff', emissiveIntensity: 0.35, transparent: true, roughness: 0.5 }), true));
  add(g, sphere(0.003, mat(combo ? '#3fd16b' : '#e5484d', { emissive: combo ? '#3fd16b' : '#e5484d', emissiveIntensity: 1 }), [0.05, -0.04, -0.02]));
  tag(g, 'co-alarm');
  hit(g, 'co-alarm', 0.16, 0.06, 0.16, [0, -0.025, 0]);
  return g;
};

B['hall-return'] = () => {
  const g = group('hall-return');
  const w = mat('#f3f2ee', { roughness: 0.4, metalness: 0.2 });
  add(g, box(0.56, 0.56, 0.004, mat('#121214'), [0, 0.3, 0.002]));
  for (const [x, y, sw, sh] of [[0, 0.585, 0.6, 0.03], [0, 0.015, 0.6, 0.03], [-0.285, 0.3, 0.03, 0.6], [0.285, 0.3, 0.03, 0.6]]) add(g, box(sw, sh, 0.012, w, [x, y, 0.006]));
  for (let i = 0; i < 14; i++) add(g, rot(box(0.54, 0.032, 0.002, w, [0, 0.05 + i * 0.037, 0.009]), -0.75, 0, 0));
  for (const x of [-0.285, 0.285]) for (const y of [0.015, 0.585]) add(g, rot(cyl(0.005, 0.005, 0.003, M.chrome(), [x, y, 0.013]), Math.PI / 2));
  tag(g, 'return-grille');
  return g;
};

// ═════════════════════════════════════════════════════════════════════════════
// LAUNDRY / UTILITY
// ═════════════════════════════════════════════════════════════════════════════
B['util-furnace'] = (s) => {
  const g = group('util-furnace');
  const cab = mat('#cfc9bb', { roughness: 0.5, metalness: 0.2 }), galv = mat(C.galv, { roughness: 0.5, metalness: 0.25 });
  const Wd = 0.55, Dp = 0.72, fz = Dp / 2;
  // return platform with the filter slot; filter slid half out: matted grey felt of dust
  add(g, box(Wd + 0.02, 0.2, Dp, galv, [0, 0.1, 0]));
  add(g, box(0.5, 0.03, 0.006, M.dark(), [0, 0.1, fz + 0.001]));
  const filt = group('filter');
  add(filt, box(0.5, 0.025, 0.64, mat('#f2efe6', { roughness: 0.9 }), [0, 0.1, fz - 0.02]));
  const dust = planeUp(0.46, 0.34, [0, 0.1132, fz + 0.12], new THREE.MeshStandardMaterial({ map: memo('filter-dust', () => canvasTex(256, 192, (c, w, h) => {
    const r = rng(121); c.fillStyle = '#7a756c'; c.fillRect(0, 0, w, h); noise(c, w, h, 50, r);
    // pleats still show as faint ridges under the felt; load heaviest down the middle where the blower pulls
    for (let x = 0; x < w; x += 16) { c.fillStyle = 'rgba(0,0,0,0.08)'; c.fillRect(x, 0, 3, h); }
    const lg = c.createLinearGradient(0, 0, w, 0); lg.addColorStop(0, 'rgba(70,64,56,0.2)'); lg.addColorStop(0.5, 'rgba(58,52,45,0.6)'); lg.addColorStop(1, 'rgba(70,64,56,0.2)');
    c.fillStyle = lg; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 260; i++) { c.strokeStyle = `rgba(${r() < 0.5 ? '170,165,155' : '60,55,50'},0.5)`; c.lineWidth = 1 + r() * 2; c.beginPath(); const x = r() * w, y = r() * h; c.moveTo(x, y); c.quadraticCurveTo(x + r() * 20, y + r() * 10, x + r() * 30 - 10, y + r() * 20); c.stroke(); }
  })), roughness: 1 }));
  filt.add(dust);
  add(filt, rot(texPlane(0.2, 0.02, labelTex('filter-edge', 256, 26, '#f2efe6', [{ t: '16x25x1  MERV 8  AIRFLOW →', x: 6, y: 13, size: 15, bold: true }]), [0, 0.1, fz + 0.3005]), 0, 0, 0));
  tag(filt, 'furnace-filter'); g.add(filt);
  hit(g, 'furnace-filter', 0.52, 0.08, 0.36, [0, 0.11, fz + 0.12]);
  // cabinet + blower door (louvred, data plate) + burner door with a sight window
  add(g, box(Wd, 0.6, Dp, cab, [0, 0.5, 0]));
  // upper (burner) section is a shell so the sight window looks into a real compartment
  for (const x of [-Wd / 2 + 0.005, Wd / 2 - 0.005]) add(g, box(0.01, 0.48, Dp, cab, [x, 1.04, 0]));
  add(g, box(Wd, 0.48, 0.01, cab, [0, 1.04, -Dp / 2 + 0.005]));
  add(g, box(Wd - 0.02, 0.01, Dp - 0.02, mat('#3a3734'), [0, 0.805, 0]));
  add(g, box(Wd - 0.02, 0.54, 0.012, cab, [0, 0.51, fz + 0.006]));
  add(g, texPlane(0.36, 0.1, T.stripes('furn-louver', '#cfc9bb', '#2a2826', 8, true), [0, 0.7, fz + 0.0125]));
  add(g, texPlane(0.2, 0.12, labelTex('furn-plate', 400, 240, '#e9e4d8', [
    { t: 'GAS-FIRED FURNACE · UPFLOW', x: 12, y: 24, size: 22, bold: true },
    { t: 'MODEL  GUH080A12   CAT. I', x: 12, y: 64, size: 22 },
    { t: 'INPUT 80,000 BTU/H   AFUE 80%', x: 12, y: 104, size: 22 },
    { t: 'NATURAL GAS · 115V 60HZ', x: 12, y: 144, size: 22 },
    { t: 'MFG DATE  03/2004', x: 12, y: 190, size: 30, bold: true }]), [-0.1, 0.42, fz + 0.0125]));
  const door = group('burner-door'), dy0 = 0.80, dy1 = 1.26;
  add(door, box(Wd - 0.02, 0.23, 0.012, cab, [0, dy0 + 0.115, fz + 0.006]));
  add(door, box(Wd - 0.02, 0.14, 0.012, cab, [0, dy1 - 0.07, fz + 0.006]));
  add(door, box(0.17, 0.09, 0.012, cab, [-0.18, 1.075, fz + 0.006]));
  add(door, box(0.17, 0.09, 0.012, cab, [0.18, 1.075, fz + 0.006]));
  add(door, planeXY(0.19, 0.09, 0, 1.075, fz + 0.008, mat('#5a5e60', { transparent: true, opacity: 0.25, roughness: 0.05 })));
  thermal(door, 'warm'); g.add(door);
  // burner compartment seen through the sight window (flashlight): clean, straight, no scale
  const bc = group('burners');
  add(bc, box(0.48, 0.2, 0.02, mat('#2b2a28', { roughness: 0.8 }), [0, 1.08, fz - 0.22]));
  for (let i = 0; i < 4; i++) add(bc, rot(cyl(0.016, 0.016, 0.2, mat('#7b7f83', { metalness: 0.5, roughness: 0.5 }), [-0.12 + i * 0.08, 1.05, fz - 0.11]), Math.PI / 2));
  add(bc, rot(cyl(0.012, 0.012, 0.4, M.steel(), [0, 1.05, fz - 0.015]), 0, 0, Math.PI / 2));
  add(bc, box(0.08, 0.07, 0.06, mat('#1d1d1f'), [0.18, 1.12, fz - 0.05]));
  add(bc, box(0.02, 0.012, 0.03, mat('#c8312b'), [0.18, 1.16, fz - 0.02]));
  add(bc, box(0.03, 0.01, 0.01, mat('#d9d4c4'), [-0.17, 1.09, fz - 0.03]));
  tag(bc, 'furnace-burners'); tag(door.children[4], 'furnace-burners'); g.add(bc);
  hit(g, 'furnace-burners', 0.2, 0.1, 0.06, [0, 1.075, fz + 0.03]);
  // supply plenum + duct up
  add(g, box(Wd + 0.02, 0.32, Dp - 0.02, galv, [0, 1.44, 0]));
  add(g, box(0.36, 0.2, 0.3, galv, [0, 1.7, -0.1]));
  // vent connector: side collar → elbow → riser → elbow → horizontal run to a B-vent
  const fl = group('flue'), pm = mat('#c2c8cc', { roughness: 0.4, metalness: 0.3 });
  const bad = s['furnace-flue'] === 'defect';
  const R = 0.05, xr = 0.37, yH0 = bad ? 1.80 : 1.76, yH1 = bad ? 1.735 : 1.795, xv = -0.12;
  add(fl, pipe([Wd / 2, 1.15, 0.12], [xr, 1.15, 0.12], R, pm));
  add(fl, sphere(R * 1.05, pm, [xr, 1.15, 0.12]));
  add(fl, pipe([xr, 1.15, 0.12], [xr, yH0, 0.12], R, pm));
  add(fl, sphere(R * 1.05, pm, [xr, yH0, 0.12]));
  const runA = [xr, yH0, 0.12], runB = [xv, yH1, 0.12];
  if (bad) {
    // joint pulled apart mid-run: a soot-black lip and a gap you could post a letter through
    const m1 = lerp3(runA, runB, 0.5), m2 = lerp3(runA, runB, 0.57);
    add(fl, pipe(runA, m1, R, pm)); add(fl, pipe(m2, runB, R * 0.96, pm));
    const lip = new THREE.Mesh(new THREE.TorusGeometry(R, 0.004, 6, 20), mat('#141210')); lip.position.set(...m1); lip.rotation.y = Math.PI / 2; fl.add(lip);
    // flue gas has been leaking here: the cut end and the pipe just upstream are soot-blackened
    const band = pipe(lerp3(runA, runB, 0.42), m1, R + 0.0015, mat('#1d1a17', { roughness: 0.9 })); fl.add(band);
    add(fl, pipe(m2, lerp3(runA, runB, 0.62), R * 0.96 + 0.0015, mat('#2a2622', { roughness: 0.9 })));
  } else {
    add(fl, pipe(runA, runB, R, pm));
    for (const t of [0.35, 0.7]) { const p = lerp3(runA, runB, t); add(fl, rot(cyl(R + 0.003, R + 0.003, 0.02, pm, p), 0, 0, Math.PI / 2)); for (const a of [0.3, 2.4, 4.5]) add(fl, sphere(0.004, M.dark(), [p[0], p[1] + Math.sin(a) * (R + 0.003), 0.12 + Math.cos(a) * (R + 0.003)])); }
  }
  add(fl, cyl(0.075, 0.075, 0.5, mat('#d4d8db', { roughness: 0.35, metalness: 0.3 }), [xv - 0.02, yH1 + 0.2, 0.12]));
  add(fl, texPlane(0.07, 0.03, labelTex('bvent', 160, 64, '#d4d8db', [{ t: 'TYPE B GAS VENT', x: 80, y: 32, size: 18, bold: true, align: 'center' }]), [xv - 0.02, yH1 + 0.3, 0.12 + 0.076]));
  thermal(fl, 'hot'); tag(fl, 'furnace-flue'); g.add(fl);
  hit(g, 'furnace-flue', 0.56, 0.14, 0.14, [(xr + xv) / 2, (yH0 + yH1) / 2, 0.12]);
  // gas supply: black iron, drip leg, yellow-handled shutoff (open: in line with the pipe)
  const gp = mat('#2a2b2d', { roughness: 0.6, metalness: 0.5 });
  add(g, pipe([0.34, 0.0, 0.2], [0.34, 0.95, 0.2], 0.011, gp));
  add(g, pipe([0.34, 0.95, 0.2], [Wd / 2, 0.95, 0.2], 0.011, gp));
  add(g, cyl(0.016, 0.016, 0.03, gp, [0.34, 0.6, 0.2]));
  add(g, pipe([0.34, 0.6, 0.2], [0.37, 0.6, 0.2], 0.011, gp));
  add(g, pipe([0.37, 0.6, 0.2], [0.37, 0.5, 0.2], 0.011, gp));
  add(g, cyl(0.014, 0.014, 0.02, gp, [0.37, 0.49, 0.2]));
  add(g, box(0.03, 0.03, 0.03, M.brass(), [0.34, 0.78, 0.2]));
  add(g, box(0.012, 0.09, 0.012, mat(C.gasYellow), [0.36, 0.78, 0.2]));
  // service switch at the unit
  add(g, box(0.06, 0.1, 0.04, galv, [Wd / 2 + 0.02, 1.42, -0.15]));
  add(g, box(0.004, 0.08, 0.05, mat('#c8312b'), [Wd / 2 + 0.042, 1.42, -0.15]));
  add(g, box(0.01, 0.02, 0.008, mat('#f4f2ea'), [Wd / 2 + 0.048, 1.43, -0.15]));
  return g;
};

B['util-dryer'] = () => {
  const g = group('util-dryer');
  const enamel = mat('#f3f2ee', { roughness: 0.3 });
  const zb = -0.23; // dryer back: pulled 12 cm off the wall at z=-0.35
  add(g, box(0.68, 0.88, 0.58, enamel, [0, 0.44, zb + 0.29]));
  add(g, box(0.68, 0.12, 0.1, enamel, [0, 0.94, zb + 0.05]));
  add(g, texPlane(0.4, 0.06, labelTex('dryer-panel', 512, 80, '#e7e5df', [{ t: 'TIMED DRY · PERM PRESS · AIR FLUFF', x: 256, y: 40, size: 26, bold: true, align: 'center', color: '#55575b' }]), [0, 0.94, zb + 0.1005]));
  for (const x of [-0.25, 0.25]) add(g, rot(cyl(0.028, 0.028, 0.03, mat('#cfcdc6'), [x, 0.94, zb + 0.11]), Math.PI / 2));
  add(g, rot(cyl(0.2, 0.2, 0.03, M.chrome(), [0, 0.45, zb + 0.595]), Math.PI / 2));
  add(g, rot(cyl(0.165, 0.165, 0.032, mat('#2a2d30', { roughness: 0.1, metalness: 0.3, transparent: true, opacity: 0.85 }), [0, 0.45, zb + 0.597]), Math.PI / 2));
  add(g, box(0.36, 0.01, 0.06, mat('#d6d4cd'), [0, 0.881, zb + 0.5]));
  // vinyl accordion transition duct, crushed behind the machine; lint at the wall box
  const duct = group('duct');
  add(duct, rot(cyl(0.052, 0.052, 0.04, M.steel(), [0, 0.16, zb - 0.02]), Math.PI / 2));
  const vin = { opacity: 0.8, roughness: 0.45 };
  add(duct, ribTube([[0, 0.16, zb - 0.03], [0.15, 0.19, zb - 0.075], [0.3, 0.14, zb - 0.09]], 0.05, 'vinyl-duct', '#e8e6de', 'rgba(120,115,100,0.55)', 90, vin));
  const crushed = ribTube([[0.3, 0.14, zb - 0.09], [0.4, 0.13, zb - 0.1], [0.45, 0.24, zb - 0.1]], 0.05, 'vinyl-duct', '#e8e6de', 'rgba(120,115,100,0.55)', 90, vin);
  crushed.scale.set(1, 1, 0.5); crushed.position.z = (zb - 0.1) * 0.5; duct.add(crushed); // kinked flat where it was shoved back
  add(duct, ribTube([[0.45, 0.24, zb - 0.1], [0.46, 0.33, -0.3], [0.46, 0.4, -0.31]], 0.05, 'vinyl-duct', '#e8e6de', 'rgba(120,115,100,0.55)', 90, vin));
  add(duct, box(0.18, 0.18, 0.04, mat('#f4f4f0', { roughness: 0.6 }), [0.46, 0.42, -0.33]));
  add(duct, rot(cyl(0.055, 0.055, 0.03, mat('#c9ced2', { metalness: 0.3 }), [0.46, 0.42, -0.31]), Math.PI / 2));
  add(duct, decal(0.12, 0.05, '#c9ccce', [0.46, 0.47, -0.307], { opacity: 0.9 }));
  const lr = rng(211); for (let i = 0; i < 6; i++) { const b = sphere(0.014 + lr() * 0.01, mat('#a7a39a', { roughness: 1 }), [0.39 + lr() * 0.15, 0.34 + lr() * 0.05, -0.3]); b.scale.set(1.5, 0.7, 0.6); duct.add(b); }
  tag(duct, 'dryer-duct'); g.add(duct);
  hit(g, 'dryer-duct', 0.3, 0.4, 0.14, [0.42, 0.28, -0.3]);
  return g;
};

B['util-washer'] = (s) => {
  const g = group('util-washer');
  const enamel = mat('#f3f2ee', { roughness: 0.3 });
  const zb = -0.22, wall = -0.35;
  add(g, box(0.68, 0.9, 0.6, enamel, [0, 0.45, zb + 0.3]));
  add(g, box(0.62, 0.012, 0.44, mat('#e8e6e0', { roughness: 0.25 }), [0, 0.906, zb + 0.34]));
  add(g, box(0.68, 0.14, 0.09, enamel, [0, 0.97, zb + 0.045]));
  add(g, texPlane(0.36, 0.05, labelTex('washer-panel', 512, 72, '#e7e5df', [{ t: 'REGULAR · DELICATE · RINSE & SPIN', x: 256, y: 36, size: 26, bold: true, align: 'center', color: '#55575b' }]), [0, 0.97, zb + 0.0905]));
  for (const x of [-0.26, 0.26]) add(g, rot(cyl(0.03, 0.03, 0.03, mat('#cfcdc6'), [x, 0.97, zb + 0.1]), Math.PI / 2));
  // washer box in the wall: hot (red) / cold (blue) valves
  add(g, box(0.32, 0.22, 0.012, mat('#f4f4f0'), [0, 1.16, wall + 0.006]));
  add(g, box(0.28, 0.18, 0.004, mat('#d7d7d0'), [0, 1.16, wall + 0.013]));
  const valves = group('valves');
  for (const [x, col] of [[-0.07, '#c8312b'], [0.07, '#2e6fd0']]) {
    add(valves, rot(cyl(0.012, 0.012, 0.05, M.brass(), [x, 1.18, wall + 0.035]), Math.PI / 2));
    add(valves, rot(cyl(0.022, 0.022, 0.012, mat(col), [x, 1.18, wall + 0.065]), Math.PI / 2));
    add(valves, cyl(0.011, 0.011, 0.04, M.brass(), [x, 1.145, wall + 0.04]));
  }
  g.add(valves);
  // supply hoses: braided stainless (ok) vs. black rubber with a blister by the valve (defect)
  const hoses = group('hoses'), bad = s['washer-hoses'] === 'defect';
  const hm = bad ? mat('#1a1a1c', { roughness: 0.55 }) : braidMat();
  for (const [x, i] of [[-0.07, 0], [0.07, 1]]) {
    add(hoses, tube([[x, 1.125, wall + 0.04], [x + 0.01, 1.0, wall + 0.06], [x * 0.6, 0.92, zb - 0.06], [x * 0.7, 0.86, zb - 0.01]], 0.011, hm));
    add(hoses, rot(cyl(0.016, 0.016, 0.03, M.brass(), [x * 0.7, 0.86, zb + 0.005]), Math.PI / 2));
    if (bad && i === 0) {
      const bl = sphere(0.024, mat('#1d1d20', { roughness: 0.35 }), [x + 0.006, 1.06, wall + 0.048]); bl.scale.set(1, 1.5, 1); hoses.add(bl);
      add(hoses, decal(0.012, 0.03, '#4a4a4c', [x + 0.006, 1.06, wall + 0.08], { opacity: 0.6 }));
    }
    if (bad) add(hoses, texPlane(0.012, 0.05, labelTex('hose-rubber', 32, 128, '#1a1a1c', [{ t: '|', x: 16, y: 64, size: 90, color: '#c8312b' }]), [x + 0.012, 1.0, wall + 0.073]));
  }
  tag(hoses, 'washer-hoses'); tag(valves, 'washer-hoses'); g.add(hoses);
  hit(g, 'washer-hoses', 0.24, 0.3, 0.12, [0, 1.02, wall + 0.06]);
  // standpipe + drain hose hooked over it
  add(g, pipe([0.27, 0.0, wall + 0.04], [0.27, 0.98, wall + 0.04], 0.026, M.pvc()));
  add(g, cyl(0.03, 0.03, 0.03, M.pvc(), [0.27, 0.97, wall + 0.04]));
  add(g, ribTube([[0.2, 0.7, zb - 0.01], [0.24, 0.98, zb - 0.06], [0.27, 1.04, wall + 0.06], [0.27, 0.92, wall + 0.04]], 0.013, 'washer-drain', '#8d9196', 'rgba(0,0,0,0.35)', 80));
  return g;
};

// ═════════════════════════════════════════════════════════════════════════════
// CRAWLSPACE (dark: built to be read by flashlight)
// ═════════════════════════════════════════════════════════════════════════════
const sheetTex = () => memo('vapor-sheet', () => wrap(canvasTex(512, 384, (g, w, h) => {
  const r = rng(131);
  // translucent 6-mil poly: soil reads through, crinkle highlights, boot-dragged smears
  g.fillStyle = 'rgba(200,206,208,0.72)'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 140; i++) { g.strokeStyle = `rgba(${r() < 0.6 ? '255,255,255' : '110,116,120'},${0.15 + r() * 0.3})`; g.lineWidth = 0.8 + r() * 1.6; g.beginPath(); const x = r() * w, y = r() * h; g.moveTo(x, y); g.quadraticCurveTo(x + (r() - 0.5) * 60, y + (r() - 0.5) * 30, x + (r() - 0.5) * 140, y + (r() - 0.5) * 50); g.stroke(); }
  for (let i = 0; i < 5; i++) { const x = r() * w, y = r() * h; const gr = g.createLinearGradient(x, y, x + 140, y + 30); gr.addColorStop(0, 'rgba(80,60,40,0.4)'); gr.addColorStop(1, 'rgba(80,60,40,0)'); g.fillStyle = gr; g.beginPath(); g.ellipse(x + 60, y + 12, 80, 18, r() * 0.6, 0, 7); g.fill(); }
  // tears: ragged holes right through the poly
  for (const [cx, cy, rx, ry] of [[150, 120, 70, 38], [360, 250, 90, 50], [430, 80, 40, 30]]) {
    g.globalCompositeOperation = 'destination-out'; blobPath(g, cx, cy, rx, ry, r, 0.45, 18); g.fill(); g.globalCompositeOperation = 'source-over';
  }
})));
B['crawl-vapor-barrier'] = (s) => {
  const g = group('crawl-vapor-barrier');
  const soil = planeUp(4, 3, [0, 0, 0], tmat('crawl-soil', () => T.soil('soil-crawl', '#5e4a33', 33), { roughness: 1 })); uvs(soil, 4, 3); g.add(soil);
  // poly ground cover: torn, seams not lapped, a strip of soil left bare, nothing run up the walls
  const vb = group('vb');
  const sm = new THREE.MeshStandardMaterial({ map: sheetTex(), transparent: true, alphaTest: 0.3, roughness: 0.35, side: THREE.DoubleSide });
  const sheet = (w, d, x, z, ry, seed) => {
    const geo = new THREE.PlaneGeometry(w, d, 16, 12); const p = geo.attributes.position, r = rng(seed);
    for (let i = 0; i < p.count; i++) p.setZ(i, (r() - 0.5) * 0.025 + Math.sin(p.getX(i) * 5 + seed) * 0.008);
    geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, sm); m.rotation.set(-Math.PI / 2, 0, ry); m.position.set(x, 0.012, z); m.receiveShadow = true; return m;
  };
  add(vb, sheet(2.3, 2.7, -0.75, 0.1, 0.03, 3));
  add(vb, sheet(1.1, 1.6, 1.35, 0.55, -0.12, 7));
  const flap = quad([0.42, 0.02, -0.2], [0.75, 0.02, -0.35], [0.66, 0.09, -0.05], [0.4, 0.06, 0.05], sm); vb.add(flap);
  tag(vb, 'vapor-barrier'); g.add(vb);
  hit(g, 'vapor-barrier', 0.9, 0.04, 2.6, [0.5, 0.02, 0.0]);
  // low area near the rear wall
  const low = group('low');
  if (s['standing-water'] === 'defect') {
    add(low, planeUp(1.3, 0.75, [0.55, 0.0025, -1.1], new THREE.MeshStandardMaterial({ map: memo('wet-ring', () => canvasTex(256, 160, (c, w, h) => { const grd = c.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w / 2); grd.addColorStop(0, 'rgba(35,25,15,0.9)'); grd.addColorStop(0.7, 'rgba(35,25,15,0.6)'); grd.addColorStop(1, 'rgba(35,25,15,0)'); c.fillStyle = grd; c.fillRect(0, 0, w, h); })), transparent: true, depthWrite: false })));
    const pool = new THREE.Mesh(new THREE.CircleGeometry(0.5, 28), mat('#1d2a33', { roughness: 0.03, metalness: 0.5, transparent: true, opacity: 0.88 }));
    pool.rotation.x = -Math.PI / 2; pool.scale.set(1.15, 0.6, 1); pool.position.set(0.55, 0.005, -1.1); low.add(pool);
    thermal(pool, 'wet');
  } else {
    add(low, planeUp(1.2, 0.7, [0.55, 0.0025, -1.1], new THREE.MeshStandardMaterial({ map: memo('dry-dip', () => canvasTex(256, 160, (c, w, h) => { const grd = c.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w / 2); grd.addColorStop(0, 'rgba(60,45,28,0.35)'); grd.addColorStop(1, 'rgba(60,45,28,0)'); c.fillStyle = grd; c.fillRect(0, 0, w, h); })), transparent: true, depthWrite: false })));
  }
  tag(low, 'standing-water'); g.add(low);
  hit(g, 'standing-water', 1.1, 0.04, 0.6, [0.55, 0.02, -1.1]);
  // what every crawlspace keeps: a cut-off 2x4 and a can from the framing crew
  add(g, rot(box(0.6, 0.038, 0.089, mat('#9c8159'), [-1.4, 0.03, -0.9]), 0, 0.5, 0));
  add(g, rot(cyl(0.033, 0.033, 0.12, mat('#9a2a24', { metalness: 0.6, roughness: 0.4 }), [1.6, 0.034, -0.3]), 0, 0, Math.PI / 2));
  return g;
};

const cmuMat = () => tmat('cmu', T.block, { roughness: 0.95 });
B['crawl-pier'] = (s) => {
  const g = group('crawl-pier');
  const conc = mat(C.concrete, { roughness: 1 });
  add(g, box(0.6, 0.1, 0.6, conc, [0, -0.01, 0]));
  const pier = group('pier');
  // 2 courses of 8x16 block, crossed; the upper south block has slid out on a stair crack
  const bw = 0.397, bh = 0.194, bd = 0.194;
  const blocks = [[0, 0.04, -0.1, false], [0, 0.04, 0.1, false], [-0.1, 0.24, 0, true], [0.1, 0.24, 0, true]];
  blocks.forEach(([x, y, z, rotd], i) => {
    const m = box(rotd ? bd : bw, bh, rotd ? bw : bd, cmuMat(), [x, y + bh / 2, z]);
    if (i === 3) { m.position.x += 0.03; m.position.y -= 0.004; m.rotation.z = -0.04; m.rotation.y = 0.05; }
    pier.add(m);
  });
  add(pier, box(0.39, 0.01, 0.39, mat(C.mortar), [0, 0.04 + bh + 0.004, 0]));
  add(pier, box(0.4, 0.1, 0.4, conc, [0, 0.44 + 0.05 - 0.004, 0]));
  // stair-step crack across the faces (dark, with a broken corner)
  // stair-step crack drawn to the real joints: up the head joint the slid block opened, along the
  // bed joint, then down through the lower unit (plane covers x ±0.2, y 0.045–0.495)
  const P = (x, y) => [(x + 0.2) / 0.4 * 256, (0.495 - y) / 0.45 * 256];
  const ckF = memo('pier-crack-f', () => canvasTex(256, 256, (c) => {
    const r = rng(141);
    crack(c, [P(0.004, 0.434), P(0.004, 0.24), P(-0.11, 0.237)], 6, 5, '#0d0b09', 'rgba(255,255,255,0.2)');
    crack(c, jag(P(-0.11, 0.237), P(-0.17, 0.05), 7, 8, r), 5, 1.5, '#0d0b09', 'rgba(255,255,255,0.2)');
  }));
  const ckS = memo('pier-crack-s', () => canvasTex(256, 128, (c) => { const r = rng(143); crack(c, jag([30, 0], [200, 128], 7, 10, r), 5, 1.5, '#0d0b09', null); }));
  for (const [z, ry] of [[0.2005, 0], [-0.2005, Math.PI]]) { const d = texPlane(0.4, 0.45, ckF, [0, 0.27, z]); d.rotation.y = ry; pier.add(d); }
  const dc = texPlane(0.4, 0.19, ckS, [0.2005, 0.137, 0]); dc.rotation.y = Math.PI / 2; pier.add(dc);
  add(pier, rot(box(0.06, 0.04, 0.05, cmuMat(), [0.19, 0.02, 0.24]), 0.3, 0.6, 0.4));
  tag(pier, 'pier-crack'); g.add(pier);
  // bearing: girder on the pier cap, via shims
  const top = 0.534, sh = group('shims');
  if (s['pier-shims'] === 'defect') {
    const wd = mat('#a98c62', { roughness: 0.95 });
    add(sh, rot(box(0.3, 0.012, 0.09, wd, [-0.04, top + 0.006, 0.04]), 0, 0.2, 0));
    add(sh, rot(box(0.28, 0.012, 0.08, mat('#8f7550'), [0.05, top + 0.018, -0.02]), 0, -0.35, 0.02));
    add(sh, rot(box(0.22, 0.008, 0.07, wd, [0.0, top + 0.028, 0.05]), 0.03, 0.7, 0));
    add(sh, rot(box(0.18, 0.01, 0.06, mat('#7e6648'), [0.12, top + 0.008, 0.19]), 0.1, 0.4, 0.05));
    add(sh, box(0.12, 0.005, 0.18, mat('#6e5a40'), [-0.14, top + 0.0025, -0.05]));
  } else {
    for (let i = 0; i < 2; i++) add(sh, box(0.36, 0.008, 0.2, mat('#5c6166', { metalness: 0.6, roughness: 0.6 }), [0, top + 0.004 + i * 0.008, 0]));
  }
  tag(sh, 'pier-shims'); g.add(sh);
  const gy = top + (s['pier-shims'] === 'defect' ? 0.034 : 0.016);
  const gir = group('girder');
  for (let i = 0; i < 3; i++) {
    const b = box(0.7, 0.235, 0.0375, tmat('joist-wood', () => T.wood('wood-joist', '#b08a5b', 61)), [0, gy + 0.1175, -0.0565 + i * 0.0377]); uvs(b, 0.7, 0.235);
    if (s['pier-shims'] === 'defect') b.rotation.x = (i - 1) * 0.006;
    gir.add(b);
  }
  if (s['pier-shims'] === 'defect') add(gir, decal(0.25, 0.02, '#0a0807', [0.1, gy + 0.004, 0.0565 + 0.02], { opacity: 0.9 }));
  g.add(gir); tag(gir, 'pier-shims');
  hit(g, 'pier-shims', 0.45, 0.06, 0.25, [0, top + 0.02, 0]);
  return g;
};

B['crawl-joists'] = (s) => {
  // joists run along X (camera sees the wide faces). Plumbing drops between joists 2 and 3,
  // then crosses the two front joists: drilled mid-depth (ok) or notched at the bottom edge (defect).
  const g = group('crawl-joists');
  const wood = tmat('joist-wood', () => T.wood('wood-joist', '#b08a5b', 61));
  const sub = box(3, 0.019, 2, tmat('ply-m', T.ply), [0, -0.0095, 0]); uvs(sub, 3, 2); g.add(sub); tag(sub, 'joist-moisture');
  const yT = -0.019, yB = -0.254, xp = 0.35, notched = s['joist-notch'] === 'defect';
  const zs = [-0.81, -0.405, 0, 0.405, 0.81];
  const pipeY = notched ? yB + 0.05 : (yT + yB) / 2;
  zs.forEach((z, i) => {
    if (i < 3) { const j = box(3, 0.235, 0.038, wood, [0, (yT + yB) / 2, z]); uvs(j, 3, 0.235); g.add(j); tag(j, 'joist-moisture'); return; }
    let sh;
    if (notched) {
      sh = new THREE.Shape(); sh.moveTo(-1.5, yB); sh.lineTo(xp - 0.035, yB); sh.lineTo(xp - 0.035, yB + 0.1); sh.lineTo(xp + 0.035, yB + 0.1); sh.lineTo(xp + 0.035, yB); sh.lineTo(1.5, yB); sh.lineTo(1.5, yT); sh.lineTo(-1.5, yT); sh.lineTo(-1.5, yB);
    } else {
      sh = rectShape(-1.5, yB, 1.5, yT); const hole = new THREE.Path(); hole.absarc(xp, pipeY, 0.03, 0, Math.PI * 2, true); sh.holes.push(hole);
    }
    const j = extrude(sh, 0.038, wood, [0, 0, z - 0.019]); g.add(j); tag(j, i === 4 ? 'joist-notch' : 'joist-moisture');
    if (i === 3) tag(j, 'joist-notch');
    if (notched) { // split running along the grain from the notch's inside corner
      const sp = texPlane(0.32, 0.03, memo('joist-split', () => canvasTex(256, 24, (c, w, h) => { crack(c, jag([0, 12], [w, 6], 10, 5, rng(151)), 4, 1, '#120d08', null); })), [xp + 0.035 + 0.16, yB + 0.1, z + 0.0195]);
      g.add(sp); tag(sp, 'joist-notch');
    }
  });
  // grade stamp on the front joist (the specific, unglamorous truth of lumber)
  add(g, texPlane(0.2, 0.09, labelTex('grade-stamp', 256, 116, null, [
    { t: 'No. 2  S-DRY', x: 128, y: 30, size: 30, bold: true, align: 'center', color: '#24324f' },
    { t: 'SPF   MILL 117', x: 128, y: 76, size: 28, bold: true, align: 'center', color: '#24324f' }],
    { pre: (c, w, h) => { c.strokeStyle = 'rgba(36,50,79,0.8)'; c.lineWidth = 4; c.strokeRect(6, 6, w - 12, h - 12); } }), [-0.8, -0.13, 0.81 + 0.0195]));
  // drain: drop from the subfloor, elbow, run toward the front through joists 4 and 5
  const dr = group('drain'), pm = M.abs(), R = 0.024;
  add(dr, pipe([xp, 0.0, 0.2], [xp, pipeY, 0.2], R, pm));
  add(dr, sphere(R * 1.15, pm, [xp, pipeY, 0.2]));
  add(dr, pipe([xp, pipeY, 0.2], [xp, pipeY - 0.006, 1.0], R, pm));
  tag(dr, 'joist-notch'); g.add(dr);
  hit(g, 'joist-notch', 0.14, 0.24, 0.1, [xp, (yT + yB) / 2, 0.81]);
  // NM cable stapled to joist 3
  add(g, pipe([-1.45, -0.06, 0.02], [1.45, -0.06, 0.02], 0.0045, mat('#ece5cf')));
  for (const x of [-1.0, 0.0, 1.0]) add(g, box(0.004, 0.014, 0.012, M.steel(), [x, -0.06, 0.026]));
  return g;
};

B['crawl-foundation-wall'] = (s) => {
  const g = group('crawl-foundation-wall');
  const W = 3, bw = 0.397, bh = 0.194, j = 0.0095, D = 0.2, bad = s['foundation-crack'] === 'defect';
  add(g, box(W, 0.9, D - 0.02, mat('#8f8b83', { roughness: 1 }), [0, 0.45, (D - 0.02) / 2]));
  const wall = group('blocks');
  // stair-step line follows real head joints: a joint in course 0, then half a block left per course
  const J0 = -W / 2 + 4 * (bw + j) + bw + j / 2;
  const stepX = (c) => J0 - c * (bw + j) / 2;
  for (let c = 0; c < 5; c++) {
    const cap = c === 4, hh = cap ? 0.09 : bh, y = c * (bh + j) + hh / 2;
    const off = (c % 2) * (bw + j) / 2;
    for (let x0 = -W / 2 - off; x0 < W / 2; x0 += bw + j) {
      const a = Math.max(x0, -W / 2), b = Math.min(x0 + bw, W / 2); if (b - a < 0.02) continue;
      const m = box(b - a, hh, D, cap ? mat(C.concrete, { roughness: 1 }) : cmuMat(), [(a + b) / 2, y, D / 2]); uvs(m, (b - a) / bw, 1);
      if (bad && (a + b) / 2 < stepX(c)) { m.position.z += 0.014 + (stepX(c) - (a + b) / 2) * 0.004; m.rotation.y = 0.004; }
      wall.add(m);
    }
  }
  tag(wall, 'foundation-crack'); g.add(wall);
  const ck = group('crack');
  if (bad) {
    for (let c = 0; c < 4; c++) {
      const x = stepX(c), y0 = c * (bh + j), xNext = stepX(c + 1);
      add(ck, box(0.012, bh + j, 0.01, M.dark(), [x, y0 + (bh + j) / 2, D + 0.006]));
      add(ck, box(x - xNext + 0.012, 0.012, 0.01, M.dark(), [(x + xNext) / 2, y0 + bh + j / 2, D + 0.006]));
    }
  } else {
    add(ck, box(0.0025, bh * 1.6, 0.004, mat('#2a2622'), [0.42, 0.3, D + 0.002]));
  }
  tag(ck, 'foundation-crack'); g.add(ck);
  hit(g, 'foundation-crack', 0.9, 0.9, 0.04, [0.2, 0.45, D + 0.02]);
  // efflorescence: white salts blooming low on the block (cosmetic, a red herring)
  const ef = group('efflor');
  const efTex = memo('efflor2', () => canvasTex(256, 160, (c, w, h) => {
    const r = rng(161);
    // salts bloom out of the bed joints and fade upward; soft edges, no rectangle
    for (let i = 0; i < 420; i++) {
      const x = w * (0.5 + (r() - 0.5) * 0.9), y = h * (0.35 + r() * 0.6);
      const fall = Math.max(0, 1 - Math.hypot((x - w / 2) / (w * 0.48), (y - h * 0.7) / (h * 0.42)));
      if (fall <= 0) continue;
      const rr = 1 + r() * 4; c.fillStyle = `rgba(246,245,240,${0.7 * fall})`; c.beginPath(); c.arc(x, y, rr, 0, 7); c.fill();
    }
    for (const jy of [0.11, 0.6]) for (let x = 20; x < w - 20; x += 2) {
      const a = Math.max(0, 1 - Math.abs(x - w / 2) / (w * 0.45)) * (0.4 + r() * 0.5);
      c.fillStyle = `rgba(250,250,246,${a})`; c.fillRect(x, h * jy - 2 - r() * 6, 2, 3 + r() * 4);
    }
  }));
  add(ef, texPlane(0.7, 0.42, efTex, [-0.95, 0.24, D + 0.004]));
  add(ef, texPlane(0.45, 0.3, efTex, [1.05, 0.17, D + 0.004]));
  tag(ef, 'efflorescence'); g.add(ef);
  return g;
};

B['crawl-termite'] = (s) => {
  const g = group('crawl-termite');
  const W = 2, D = 0.2;
  const face = group('face');
  for (const [c, off] of [[0, 0], [1, 0.2]]) for (let x0 = -W / 2 - off; x0 < W / 2; x0 += 0.4065) {
    const a = Math.max(x0, -W / 2), b = Math.min(x0 + 0.397, W / 2); if (b - a < 0.02) continue;
    const hh = c ? 0.09 : 0.194;
    const m = box(b - a, hh, D, c ? mat(C.concrete, { roughness: 1 }) : cmuMat(), [(a + b) / 2, c ? 0.2035 + 0.045 : 0.097, D / 2]); uvs(m, (b - a) / 0.397, 1); face.add(m);
  }
  add(face, box(W, 0.3, D - 0.02, mat('#8f8b83', { roughness: 1 }), [0, 0.15, (D - 0.02) / 2]));
  // dirt runs from old splash: flat stains in both states, the thing tubes get mistaken for
  const streak = memo('dirt-streaks', () => canvasTex(256, 128, (c, w, h) => {
    const r = rng(171); for (let i = 0; i < 14; i++) { const x = r() * w; c.strokeStyle = `rgba(80,62,42,${0.2 + r() * 0.25})`; c.lineWidth = 2 + r() * 5; c.beginPath(); c.moveTo(x, h); c.lineTo(x + (r() - 0.5) * 10, h * (0.2 + r() * 0.5)); c.stroke(); }
  }));
  add(face, texPlane(1.6, 0.2, streak, [0, 0.1, D + 0.002]));
  tag(face, 'termite-tubes'); g.add(face);
  // sill plate (PT) with sill sealer, anchor bolt, and the rim joist
  const sill = box(W, 0.038, 0.14, tmat('pt-wood', () => T.wood('wood-pt', C.woodPT, 25)), [0, 0.3125, 0.1]); uvs(sill, 2, 0.14); g.add(sill);
  add(g, box(W, 0.004, 0.14, mat('#5b7fa6', { roughness: 0.9 }), [0, 0.2955, 0.1]));
  add(g, cyl(0.007, 0.007, 0.03, M.steel(), [0.45, 0.345, 0.1])); add(g, box(0.05, 0.004, 0.05, M.steel(), [0.45, 0.333, 0.1])); add(g, cyl(0.012, 0.012, 0.012, M.steel(), [0.45, 0.341, 0.1], undefined, 6));
  const rim = box(W, 0.07, 0.038, tmat('joist-wood', () => T.wood('wood-joist', '#b08a5b', 61)), [0, 0.367, 0.05]); uvs(rim, 2, 0.07); g.add(rim);
  tag(sill, 'termite-tubes'); tag(rim, 'termite-tubes');
  if (s['termite-tubes'] === 'defect') {
    // subterranean termite shelter tubes: pencil-wide earthen tunnels up the block to the sill
    const tubes = group('tubes'), mud = mat('#6e5a44', { roughness: 1 }), r = rng(181);
    for (const [x0, drift] of [[-0.55, 0.02], [0.12, -0.035], [0.7, 0.01]]) {
      // near-straight, hugging the block, a little ragged; over the cap and in under the sill
      const pts = []; for (let k = 0; k <= 8; k++) pts.push([x0 + drift * k / 8 + (r() - 0.5) * 0.01, k * 0.035, D + 0.004]);
      const xe = x0 + drift;
      pts.push([xe, 0.296, D - 0.005], [xe + 0.003, 0.299, 0.18], [xe + 0.004, 0.31, 0.172]);
      const m = tube(pts, 0.0062, mud, undefined, 48); m.scale.z = 1; tubes.add(m);
      if (x0 === 0.12) { const bp = pts[3]; add(tubes, tube([bp, [bp[0] + 0.03, bp[1] + 0.06, D + 0.004], [bp[0] + 0.05, 0.2, D + 0.004]], 0.0048, mud)); }
    }
    for (const x of [-0.53, 0.085]) add(tubes, sphere(0.012, mud, [x, 0.315, 0.17])).scale.set(1.6, 0.7, 0.6);
    tag(tubes, 'termite-tubes'); g.add(tubes);
  }
  hit(g, 'termite-tubes', 1.9, 0.34, 0.04, [0, 0.18, D + 0.02]);
  return g;
};

B['crawl-plumbing'] = (s) => {
  const g = group('crawl-plumbing');
  const leak = s['drain-leak'] === 'defect';
  const pm = M.abs(), R = 0.03, yd = -0.21;
  const dr = group('drain');
  add(dr, pipe([-1.0, yd + 0.012, 0], [0.06, yd, 0], R, pm));
  add(dr, pipe([0.14, yd, 0], [1.0, yd - 0.01, 0], R, pm));
  add(dr, rot(cyl(R + 0.008, R + 0.008, 0.1, mat('#1d1d1d', { roughness: 0.5 }), [0.1, yd, 0]), 0, 0, Math.PI / 2));
  add(dr, rot(texPlane(0.1, 0.02, labelTex('abs-print', 256, 48, null, [{ t: 'ABS-DWV  ASTM D2661  2"', x: 128, y: 24, size: 22, bold: true, align: 'center', color: '#b9b9b0' }]), [-0.5, yd + 0.0065, R + 0.001]), 0, 0, 0));
  if (leak) {
    // weeping hub: glossy wet underside, mineral crust, drops on their way down
    const wet = mat('#121a1e', { roughness: 0.03, metalness: 0.2 });
    const streak = add(dr, pipe([0.15, yd - 0.0002, 0], [0.34, yd - 0.0015, 0], R + 0.0012, wet)); thermal(streak, 'wet');
    add(dr, rot(new THREE.Mesh(new THREE.TorusGeometry(R + 0.009, 0.004, 6, 20), mat('#d9d6c8', { roughness: 1 })), 0, Math.PI / 2, 0)).position.set(0.05, yd, 0);
    const dropM = mat('#8fb1c4', { roughness: 0.02, metalness: 0.2, transparent: true, opacity: 0.85 });
    for (const [dy, sc] of [[-0.045, 1], [-0.12, 0.8], [-0.24, 0.7]]) { const d = sphere(0.0055 * sc, dropM, [0.12, yd + dy, 0]); d.scale.set(1, 1.6, 1); dr.add(d); }
  }
  tag(dr, 'drain-leak'); g.add(dr);
  hit(g, 'drain-leak', 0.24, 0.16, 0.12, [0.1, yd - 0.03, 0]);
  // strap hangers from the joists
  for (const x of [-0.8, 0.0, 0.8]) {
    add(g, box(0.018, Math.abs(yd) - R, 0.002, mat('#d8d0b8'), [x, (yd + R) / 2, -R - 0.002]));
    const loop = new THREE.Mesh(new THREE.TorusGeometry(R + 0.003, 0.002, 4, 16, Math.PI), mat('#d8d0b8')); loop.rotation.set(0, 0, Math.PI); loop.position.set(x, yd, 0); loop.rotation.y = Math.PI / 2; g.add(loop);
  }
  // PEX supply: red/blue, clipped up close, a copper crimp-ring tee
  const px = group('pex');
  for (const [z, col] of [[0.09, C.pexRed], [0.13, C.pexBlue]]) {
    add(px, pipe([-1.0, -0.05, z], [1.0, -0.05, z], 0.009, mat(col, { roughness: 0.45 })));
    for (const x of [-0.7, 0.1, 0.8]) add(px, box(0.02, 0.05, 0.022, mat('#f0eee8'), [x, -0.025, z]));
  }
  add(px, pipe([0.45, -0.05, 0.13], [0.45, -0.05, 0.3], 0.009, mat(C.pexBlue, { roughness: 0.45 })));
  for (const x of [0.43, 0.47]) add(px, rot(cyl(0.012, 0.012, 0.008, M.brass(), [x, -0.05, 0.13]), 0, 0, Math.PI / 2));
  add(px, rot(cyl(0.012, 0.012, 0.008, mat(C.copper, { metalness: 0.8, roughness: 0.3 }), [0.45, -0.05, 0.16]), Math.PI / 2));
  tag(px, 'pex-supply'); g.add(px);
  hit(g, 'pex-supply', 1.6, 0.05, 0.09, [0, -0.05, 0.11]);
  return g;
};

B['crawl-duct'] = () => {
  const g = group('crawl-duct');
  // Origin = underside of the floor system (y=0); joists hang to -0.25 and the soil is at -1.05.
  const fl = group('flex');
  const galv = mat(C.galv, { roughness: 0.5, metalness: 0.25 });
  add(fl, box(0.36, 0.1, 0.3, galv, [0, -0.05, 0.9]));
  const collar = rot(cyl(0.1, 0.1, 0.12, galv, [0, -0.16, 0.9]), 0, 0, 0); fl.add(collar); thermal(collar, 'cool');
  add(fl, new THREE.Mesh(new THREE.CircleGeometry(0.095, 20), M.dark())).rotation.x = Math.PI / 2;
  fl.children[fl.children.length - 1].position.set(0, -0.221, 0.9);
  add(fl, decal(0.05, 0.08, '#9aa0a5', [0.098, -0.17, 0.92], { opacity: 0.9, side: THREE.DoubleSide }));
  const loose = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.003, 4, 20, 4.5), mat('#1b1b1d')); loose.rotation.x = Math.PI / 2; loose.position.set(0, -0.2, 0.9); fl.add(loose);
  // the duct: hung from a strap at the far end, sagging to the soil, open end lying in the dirt
  add(fl, box(0.03, 0.22, 0.002, mat('#8b8f93'), [0.0, -0.36, -1.18]));
  const path = [[0, -0.5, -1.25], [0.02, -0.74, -0.85], [0.05, -0.91, -0.35], [0.12, -0.93, 0.1], [0.2, -0.925, 0.45]];
  add(fl, ribTube(path, 0.12, 'flex-jacket', '#9da3a8', 'rgba(60,64,68,0.45)', 40, { metalness: 0.4, roughness: 0.5 }));
  const end = path[path.length - 1];
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.105, 0.022, 8, 20), mat(C.insulation, { roughness: 1 })); ring.position.set(...end); ring.rotation.y = Math.PI / 2 - 0.25; fl.add(ring);
  const inner = cyl(0.085, 0.085, 0.08, mat('#1a1a1a', { side: THREE.BackSide }), end); inner.rotation.set(0, -0.25, Math.PI / 2); fl.add(inner);
  thermal(fl.children[fl.children.length - 3], 'cool');
  tag(fl, 'crawl-duct-down'); g.add(fl);
  return g;
};

export const builders = B;
