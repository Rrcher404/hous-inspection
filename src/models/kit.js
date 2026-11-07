// Shared modelling kit for component builders. Both model files import from here so the
// house reads as one place: same palette, same tagging, same thermal convention.
import * as THREE from 'three';

// ── Palette ──────────────────────────────────────────────────────────────────
const matCache = new Map();
/** Cached MeshStandardMaterial. opts: { color, roughness, metalness, emissive, transparent, opacity, side } */
export function mat(color, opts = {}) {
  const key = color + JSON.stringify(opts);
  if (!matCache.has(key)) {
    matCache.set(key, new THREE.MeshStandardMaterial({ color, roughness: 0.8, metalness: 0.0, ...opts }));
  }
  return matCache.get(key);
}

export const C = {
  white: '#f2f0ea', offWhite: '#e6e1d6', drywall: '#ece7dc', cream: '#efe6cf',
  wood: '#a87b4f', woodDark: '#6e4b2e', woodPT: '#8f8a5a', woodWet: '#4d3622', rot: '#3b2a1c',
  brick: '#9c4a34', firebrick: '#c98f62', mortar: '#bdb5a6', block: '#a9a69e', concrete: '#b9b5ac',
  steel: '#9aa1a8', galv: '#b8bfc4', copper: '#c27a45', brass: '#c9a646', black: '#1e1e22', darkGray: '#3a3c40',
  pvcWhite: '#f4f4f0', absBlack: '#262626', pexRed: '#c83b32', pexBlue: '#2e6fd0',
  shingle: '#4a4b52', shingleWorn: '#6d6a66', tile: '#b55b34', tileDark: '#8e4426',
  vinyl: '#d9d3c4', soil: '#6b5236', grass: '#5d8a3c', mulch: '#5a3a22', water: '#3a5f7a',
  insulation: '#e8c27a', insulationPink: '#e9a0a8', vapor: '#d8dde0', foil: '#cfd3d6',
  rust: '#8a4a22', stain: '#8c6d3f', soot: '#26221e', creosote: '#141210', mold: '#2d3324',
  copperWire: '#c4682c', wireWhite: '#efefef', wireBlack: '#111111', wireBare: '#c98c4f', wireGreen: '#2f8f3a',
  gasYellow: '#d9b830', red: '#c8312b', green: '#3b9b4a', amber: '#f0a020',
};

// ── Geometry helpers (all return Meshes positioned with their centre at [x,y,z]) ─
export function box(w, h, d, color, pos = [0, 0, 0], opts) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), typeof color === 'string' ? mat(color, opts) : color);
  m.position.set(...pos); m.castShadow = true; m.receiveShadow = true; return m;
}
export function cyl(rTop, rBot, h, color, pos = [0, 0, 0], opts, radial = 16) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, h, radial), typeof color === 'string' ? mat(color, opts) : color);
  m.position.set(...pos); m.castShadow = true; m.receiveShadow = true; return m;
}
export function sphere(r, color, pos = [0, 0, 0], opts) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), typeof color === 'string' ? mat(color, opts) : color);
  m.position.set(...pos); m.castShadow = true; return m;
}
/** A pipe from point a to point b (arrays). */
export function pipe(a, b, r, color, opts) {
  const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b);
  const len = va.distanceTo(vb);
  const m = cyl(r, r, len, color, [0, 0, 0], opts, 12);
  m.position.copy(va).add(vb).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), vb.clone().sub(va).normalize());
  return m;
}
/** Smooth tube along points (flex duct, hoses, wires). */
export function tube(points, r, color, opts, segs = 32) {
  const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
  const m = new THREE.Mesh(new THREE.TubeGeometry(curve, segs, r, 10, false), typeof color === 'string' ? mat(color, opts) : color);
  m.castShadow = true; return m;
}
/** Flat decal plane (stains, cracks, labels). Faces +Z by default. */
export function decal(w, h, color, pos = [0, 0, 0], opts = {}) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h),
    mat(color, { transparent: true, opacity: 0.85, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, ...opts }));
  m.position.set(...pos); return m;
}

/** Canvas texture for labels, data plates, stains with soft edges, etc.
 *  draw(ctx, w, h) paints into a w×h canvas. Returns a THREE.CanvasTexture. */
export function canvasTex(w, h, draw) {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  draw(cv.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
/** Plane with a canvas texture. */
export function texPlane(w, h, tex, pos = [0, 0, 0], opts = {}) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h),
    new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.9, polygonOffset: true, polygonOffsetFactor: -2, ...opts }));
  m.position.set(...pos); return m;
}
/** Soft radial stain texture (water stains, rust blooms, soot). */
export function stainTex(color = '#8c6d3f', rings = 3) {
  return canvasTex(256, 256, (g, w, h) => {
    for (let i = rings; i > 0; i--) {
      const r = (w / 2) * (i / rings) * 0.95;
      const grd = g.createRadialGradient(w / 2, h / 2, r * 0.6, w / 2, h / 2, r);
      grd.addColorStop(0, color + '00'); grd.addColorStop(0.85, color + 'aa'); grd.addColorStop(1, color + '00');
      g.fillStyle = grd; g.beginPath(); g.ellipse(w / 2, h / 2, r, r * 0.8, 0.3 * i, 0, Math.PI * 2); g.fill();
    }
  });
}
/** Text label texture (data plates, panel directory, alarm date stamps). */
export function textTex(lines, { w = 512, h = 256, bg = '#f4f1e8', fg = '#222', font = 'bold 30px monospace' } = {}) {
  return canvasTex(w, h, (g) => {
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    g.fillStyle = fg; g.font = font; g.textBaseline = 'top';
    const lh = parseInt(font.match(/(\d+)px/)[1], 10) * 1.25;
    lines.forEach((ln, i) => g.fillText(ln, 16, 14 + i * lh));
  });
}

// ── Tagging (the contract with the engine) ───────────────────────────────────
/**
 * Mark a mesh (or Group) as the clickable target for a checkpoint.
 * Every checkpoint id listed for the component MUST be tagged on at least one mesh,
 * in BOTH its 'defect' and 'ok' renderings.
 */
export function tag(obj, checkpointId) {
  obj.userData.checkpointId = checkpointId;
  obj.traverse?.(o => { if (o.isMesh) o.userData.checkpointId = checkpointId; });
  return obj;
}
/** Thermal camera hint: 'cold' | 'cool' | 'warm' | 'hot' | 'wet'. Untagged meshes render neutral. */
export function thermal(obj, kind) {
  obj.traverse?.(o => { if (o.isMesh) o.userData.thermal = kind; });
  obj.userData.thermal = kind;
  return obj;
}

/** Convenience: new group with name. */
export function group(name) { const g = new THREE.Group(); g.name = name; return g; }

export { THREE };
