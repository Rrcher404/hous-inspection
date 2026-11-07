// Inspector tools as the engine sees them: flashlight (camera spotlight), thermal camera
// (false-colour material swap by userData.thermal), per-tool cursors, and the per-zone
// lighting profile (dark attic/crawl, interior fixtures from a fixed pool of lights).
import * as THREE from 'three';

const svg = (body, hx = 16, hy = 16, fb = 'crosshair') =>
  `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'>${body}</svg>`)}") ${hx} ${hy}, ${fb}`;
export const CURSORS = {
  hand: 'grab',
  flashlight: svg("<circle cx='16' cy='16' r='9' fill='none' stroke='#1d1d1f' stroke-width='3'/><circle cx='16' cy='16' r='9' fill='rgba(255,230,140,0.35)' stroke='#ffd75e' stroke-width='1.5'/><circle cx='16' cy='16' r='1.6' fill='#1d1d1f'/>"),
  moisture: svg("<path d='M16 3 C16 3 7 14 7 20 a9 9 0 0 0 18 0 C25 14 16 3 16 3z' fill='#4fa3e0' stroke='#0d2d48' stroke-width='2'/><circle cx='16' cy='20' r='1.6' fill='#fff'/>", 16, 20),
  tester: svg("<rect x='8' y='9' width='16' height='15' rx='3' fill='#f2c23a' stroke='#1d1d1f' stroke-width='2'/><rect x='11' y='3' width='3' height='7' fill='#1d1d1f'/><rect x='18' y='3' width='3' height='7' fill='#1d1d1f'/><circle cx='12' cy='17' r='1.6' fill='#e5484d'/><circle cx='16' cy='17' r='1.6' fill='#e5c43a'/><circle cx='20' cy='17' r='1.6' fill='#3fb67a'/>", 16, 3),
  thermal: svg("<rect x='5' y='5' width='22' height='22' fill='none' stroke='#1d1d1f' stroke-width='3'/><rect x='5' y='5' width='22' height='22' fill='none' stroke='#ff6ad5' stroke-width='1.5'/><path d='M16 10v12M10 16h12' stroke='#ff6ad5' stroke-width='1.5'/>"),
};

const PALETTE = { hot: '#fff3a0', warm: '#ff8a1e', cool: '#7a3fa8', cold: '#1a2a9a', wet: '#0f5f6f', neutral: '#3d3f86' };

export function createTools({ scene, camera, fixtures, reducedMotion }) {
  // lights (constant count: no shader recompiles when zones change)
  const hemi = new THREE.HemisphereLight('#d8e8ff', '#6d5d45', 1.0);
  const sun = new THREE.DirectionalLight('#fff1dc', 2.6);
  sun.position.set(-14, 34, 30); sun.target.position.set(8, 0, 4);
  sun.castShadow = true;
  sun.shadow.mapSize.set(4096, 4096);
  Object.assign(sun.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 5, far: 110 });
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03;
  scene.add(hemi, sun, sun.target);
  const pool = [0, 1, 2].map(() => { const l = new THREE.PointLight('#ffe2b8', 0, 9, 1.6); scene.add(l); return l; });
  const spot = new THREE.SpotLight('#fff6e6', 0, 16, 0.42, 0.55, 1.4);
  spot.position.set(0.12, -0.12, 0.05); spot.target.position.set(0, -0.05, -1);
  camera.add(spot, spot.target);
  const glow = new THREE.PointLight('#9fb2d6', 0, 3.5, 2); camera.add(glow);
  for (const l of [hemi, sun, spot, glow, ...pool]) l.layers.enableAll();

  let tool = 'hand', dark = false, thermalOn = false;
  const target = { hemi: 1.0, sun: 2.6, pool: 0 };
  const cur = { hemi: 1.0, sun: 2.6, pool: 0 };
  const poolTargets = [0, 0, 0];

  // thermal false-colour materials
  const thermalMats = {};
  for (const [k, c] of Object.entries(PALETTE)) {
    // matcap: shape-readable false colour that needs no scene lights (works in the dark attic)
    const cv = document.createElement('canvas'); cv.width = cv.height = 128;
    const g = cv.getContext('2d'), col = new THREE.Color(c);
    const hi = col.clone().lerp(new THREE.Color('#ffffff'), k === 'hot' ? 0.5 : 0.28), lo = col.clone().multiplyScalar(0.38);
    const grd = g.createRadialGradient(46, 42, 4, 64, 64, 66);
    grd.addColorStop(0, '#' + hi.getHexString()); grd.addColorStop(0.55, '#' + col.getHexString()); grd.addColorStop(1, '#' + lo.getHexString());
    g.fillStyle = grd; g.fillRect(0, 0, 128, 128);
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
    thermalMats[k] = new THREE.MeshMatcapMaterial({ matcap: tex, fog: false });
  }
  function thermalFor(mesh, baseMat) {
    if (baseMat.transparent && baseMat.opacity < 0.05) return baseMat;      // invisible hit boxes stay invisible
    if (baseMat.visible === false) return baseMat;
    const k = mesh.userData.thermal && thermalMats[mesh.userData.thermal] ? mesh.userData.thermal : 'neutral';
    return thermalMats[k];
  }

  function setProfile(zoneId, levelDark) {
    dark = levelDark;
    const interior = !['exterior', 'deck', 'shed', 'roof', 'attic', 'crawl'].includes(zoneId);
    if (dark) { target.hemi = 0.012; target.sun = 0; target.pool = 0; }
    else if (interior) { target.hemi = 0.62; target.sun = 2.6; target.pool = 1; }
    else { target.hemi = 1.0; target.sun = 2.6; target.pool = 0.25; }
    // reposition the interior light pool to this zone's fixtures (+ a neighbour)
    const list = [...(fixtures[zoneId] || [])];
    const neighbours = { living: 'kitchen', kitchen: 'living', hall: 'living', bath: 'hall', primary: 'hall', bed2: 'hall', laundry: 'hall', garage: 'hall' };
    if (neighbours[zoneId]) list.push(...(fixtures[neighbours[zoneId]] || []).slice(0, 1));
    for (let i = 0; i < pool.length; i++) {
      if (list[i]) { pool[i].position.set(list[i].x, Math.min(list[i].y, 1.75), list[i].z); poolTargets[i] = i < (fixtures[zoneId] || []).length ? 1 : 0.5; }
      else poolTargets[i] = 0;
    }
  }

  function update(dt) {
    const k = 1 - Math.exp(-dt * (reducedMotion ? 30 : 6));
    cur.hemi += (target.hemi - cur.hemi) * k; cur.sun += (target.sun - cur.sun) * k; cur.pool += (target.pool - cur.pool) * k;
    hemi.intensity = cur.hemi; sun.intensity = cur.sun;
    for (let i = 0; i < pool.length; i++) pool[i].intensity = 4.2 * cur.pool * poolTargets[i];
    const fl = tool === 'flashlight';
    // Headlamp: in dark zones the meter and tester are used with a dimmer light on,
    // the way a real inspector works. Eyes-only stays dark so the flashlight lesson holds.
    const headlamp = dark && (tool === 'moisture' || tool === 'tester');
    spot.intensity = fl ? (dark ? 26 : 3.5) : headlamp ? 11 : 0;
    glow.intensity = dark && !fl && !thermalOn ? 0.35 : 0;
  }

  return {
    get tool() { return tool; },
    get thermal() { return thermalOn; },
    get dark() { return dark; },
    setTool(t) { tool = t; thermalOn = t === 'thermal'; },
    thermalFor, setProfile, update, sun, hemi,
    cursor(hovering, dragging) {
      if (dragging) return 'grabbing';
      if (tool === 'hand') return hovering ? 'pointer' : 'grab';
      return CURSORS[tool] || 'crosshair';
    },
  };
}
