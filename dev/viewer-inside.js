// Dev-only viewer for src/models/inside.js: grid of every builder, defect/ok toggle,
// dark+flashlight and thermal previews, focus framing, and the model audit replicated.
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { COMPONENTS } from '../src/data/manifest.js';
import { builders } from '../src/models/inside.js';

const ZONES = ['living', 'kitchen', 'bath', 'primary', 'bed2', 'hall', 'laundry', 'crawl'];
const comps = COMPONENTS.filter(c => ZONES.includes(c.zone));

// wall-mount heights for the viewer (engine owns the real ones)
const WALL_Y = { 'liv-receptacle': 0.35, 'pri-receptacle': 0.35, 'kit-gfci': 1.07, 'bath-gfci': 1.07, 'liv-window': 0.85,
  'bed2-window': 0.85, 'kit-hood': 1.45, 'bed2-wall-crack': 2.05, 'hall-return': 0.25, 'crawl-termite': 0.55 };

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.getElementById('c').appendChild(renderer.domElement);
const scene = new THREE.Scene(); scene.background = new THREE.Color('#2a2c31');
const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.02, 200);
camera.position.set(12, 9, 30);
const controls = new OrbitControls(camera, renderer.domElement); controls.target.set(12, 1, 8); controls.enableDamping = true;

const hemi = new THREE.HemisphereLight('#fff8ee', '#4a4238', 1.1); scene.add(hemi);
const sun = new THREE.DirectionalLight('#fff4e0', 1.6); sun.position.set(10, 20, 14); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03; Object.assign(sun.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, far: 80 }); scene.add(sun);
const amb = new THREE.AmbientLight('#ffffff', 0.25); scene.add(amb);
const flash = new THREE.SpotLight('#fff6e8', 6, 12, 0.42, 0.5, 2); flash.visible = false;
camera.add(flash); flash.position.set(0.05, -0.05, 0); flash.target.position.set(0, 0, -1); camera.add(flash.target); scene.add(camera);

const CELL_X = 4.6, CELL_Z = 5.2, COLS = 6;
const cells = []; // { comp, root, anchor, model }
const state = { mode: 'defect', dark: false, thermal: false, labels: true };

comps.forEach((comp, i) => {
  const root = new THREE.Group();
  root.position.set((i % COLS) * CELL_X, 0, Math.floor(i / COLS) * CELL_Z);
  const crawl = comp.zone === 'crawl';
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(CELL_X - 0.2, CELL_Z - 0.2), new THREE.MeshStandardMaterial({ color: crawl ? '#4a3a28' : '#9c8566', roughness: 0.9 }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, -0.001, 0); floor.receiveShadow = true; root.add(floor);
  const anchor = new THREE.Group(); root.add(anchor);
  if (comp.mount === 'wall') {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(CELL_X - 0.4, crawl ? 1.6 : 2.6, 0.06), new THREE.MeshStandardMaterial({ color: crawl ? '#7d7a73' : '#e3ddd0', roughness: 0.95 }));
    wall.position.set(0, crawl ? 0.8 : 1.3, -1.0 - 0.03); wall.receiveShadow = true; root.add(wall);
    anchor.position.set(0, WALL_Y[comp.id] || 0, -1.0);
  } else if (comp.mount === 'ceiling') {
    const cy = crawl ? 1.05 : 2.44;
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(CELL_X - 0.4, 3.0), new THREE.MeshStandardMaterial({ color: crawl ? '#6b5236' : '#ece7dc', roughness: 0.95, side: THREE.DoubleSide }));
    ceil.rotation.x = Math.PI / 2; ceil.position.set(0, cy + 0.0005, -0.3); root.add(ceil);
    anchor.position.set(0, cy, -0.3);
  } else {
    anchor.position.set(0, 0, -0.3);
  }
  const lbl = document.createElement('div'); lbl.className = 'lbl'; lbl.innerHTML = `<b>${comp.id}</b> · ${comp.name}`; document.body.appendChild(lbl);
  scene.add(root);
  cells.push({ comp, root, anchor, model: null, lbl });
  const opt = document.createElement('option'); opt.value = comp.id; opt.textContent = `${comp.zone} · ${comp.id}`; document.getElementById('focus').appendChild(opt);
});

// like store.inspection.states: every checkpoint in the house (builders may read a neighbour's state)
function statesFor(comp, mode) {
  return Object.fromEntries(COMPONENTS.flatMap(c => c.checkpoints).map(cp => [cp.id, cp.kind === 'variable' ? mode : cp.kind]));
}
const THERMAL = { hot: '#fff3a0', warm: '#ff8c2a', cool: '#7a4cc8', cold: '#1b2a9a', wet: '#0f6a78', neutral: '#4b4f9a' };
const thermalMats = Object.fromEntries(Object.entries(THERMAL).map(([k, c]) => [k, new THREE.MeshBasicMaterial({ color: c })]));

function rebuild() {
  for (const cell of cells) {
    if (cell.model) cell.anchor.remove(cell.model);
    const fn = builders[cell.comp.id];
    cell.model = fn ? fn(statesFor(cell.comp, state.mode), cell.comp) : new THREE.Group();
    cell.model.traverse(o => { o.userData.componentId = cell.comp.id; if (o.isMesh) o.userData.origMat = o.material; });
    cell.anchor.add(cell.model);
  }
  applyThermal();
}
function applyThermal() {
  for (const cell of cells) cell.model?.traverse(o => {
    if (!o.isMesh) return;
    if (o.userData.hit) { o.material = o.userData.origMat; return; }
    o.material = state.thermal ? thermalMats[o.userData.thermal || 'neutral'] : o.userData.origMat;
  });
}
function applyLight() {
  hemi.intensity = state.dark ? 0.0 : 1.1; sun.intensity = state.dark ? 0.0 : 1.6; amb.intensity = state.dark ? 0.035 : 0.25;
  flash.visible = state.dark; scene.background.set(state.dark ? '#050506' : '#2a2c31');
}

// ── audit (same rules as src/models/audit.js, scoped to inside.js) ──
function audit() {
  const problems = [], rows = [];
  for (const comp of comps) {
    if (!builders[comp.id]) { problems.push(`${comp.id}: no builder`); continue; }
    for (const mode of ['defect', 'ok']) {
      let g; try { g = builders[comp.id](statesFor(comp, mode), comp); } catch (e) { problems.push(`${comp.id} [${mode}]: threw ${e.message}`); continue; }
      const found = new Set(); let meshes = 0;
      g.traverse(o => { if (o.isMesh) meshes++; if (o.userData.checkpointId) found.add(o.userData.checkpointId); });
      for (const cp of comp.checkpoints) if (!found.has(cp.id)) problems.push(`${comp.id} [${mode}]: "${cp.id}" not tagged`);
      if (meshes > 150) problems.push(`${comp.id} [${mode}]: ${meshes} meshes`);
      const bb = new THREE.Box3().setFromObject(g), sz = bb.getSize(new THREE.Vector3());
      if (mode === 'defect') rows.push(`${comp.id.padEnd(22)} ${String(meshes).padStart(3)}m  ${sz.x.toFixed(2)}×${sz.y.toFixed(2)}×${sz.z.toFixed(2)} (spec ${comp.size.join('×')})`);
    }
  }
  const el = document.getElementById('audit');
  el.innerHTML = (problems.length ? `<span class="bad">${problems.length} problems:\n${problems.join('\n')}</span>` : `<span class="good">✓ ${comps.length} components tag every checkpoint in defect + ok</span>`) + '\n\n' + rows.join('\n');
  window.__audit = { problems, rows };
  console.info('[viewer-inside audit]', problems.length ? problems : 'clean');
}

function focus(id, dist = 1.4, opts = {}) {
  const cell = cells.find(c => c.comp.id === id); if (!cell) return;
  const bb = new THREE.Box3().setFromObject(cell.model); const ctr = bb.getCenter(new THREE.Vector3());
  if (opts.target) ctr.set(...opts.target).add(cell.anchor.getWorldPosition(new THREE.Vector3()));
  const dir = new THREE.Vector3(...(opts.dir || [0, 0.35, 1])).normalize();
  controls.target.copy(ctr); camera.position.copy(ctr).addScaledVector(dir, dist); controls.update();
}
function overview() { camera.position.set(12, 14, 34); controls.target.set(11.5, 0.5, 11); controls.update(); }

const btn = (id, fn) => document.getElementById(id).addEventListener('click', fn);
function setMode(m) { state.mode = m; document.getElementById('bDefect').classList.toggle('on', m === 'defect'); document.getElementById('bOk').classList.toggle('on', m === 'ok'); rebuild(); }
function setDark(d) { state.dark = d; document.getElementById('bDark').classList.toggle('on', d); document.getElementById('bLit').classList.toggle('on', !d); applyLight(); }
function setThermal(t) { state.thermal = t; document.getElementById('bThermal').classList.toggle('on', t); applyThermal(); }
function setLabels(v) { state.labels = v; document.getElementById('bLabels').classList.toggle('on', v); }
btn('bDefect', () => setMode('defect')); btn('bOk', () => setMode('ok'));
btn('bLit', () => setDark(false)); btn('bDark', () => setDark(true)); btn('bThermal', () => setThermal(!state.thermal));
btn('bLabels', () => setLabels(!state.labels)); btn('bOverview', overview);
document.getElementById('focus').addEventListener('change', (e) => e.target.value && focus(e.target.value));

// hover readout: which checkpoint a mesh is tagged with
const ray = new THREE.Raycaster(), mouse = new THREE.Vector2();
renderer.domElement.addEventListener('pointermove', (e) => {
  mouse.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); ray.setFromCamera(mouse, camera);
  const hits = ray.intersectObjects(cells.map(c => c.model).filter(Boolean), true).filter(h => h.object.userData.checkpointId);
  document.getElementById('hover').textContent = hits[0] ? `${hits[0].object.userData.componentId} → ${hits[0].object.userData.checkpointId}` : '';
});

addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });
const v = new THREE.Vector3();
renderer.setAnimationLoop(() => {
  controls.update();
  for (const cell of cells) {
    cell.root.getWorldPosition(v); v.y += 2.9; v.z += -0.3; v.project(camera);
    const show = state.labels && v.z < 1 && Math.abs(v.x) < 1.1 && Math.abs(v.y) < 1.1;
    cell.lbl.style.display = show ? 'block' : 'none';
    if (show) { cell.lbl.style.left = ((v.x + 1) / 2 * innerWidth) + 'px'; cell.lbl.style.top = ((1 - v.y) / 2 * innerHeight) + 'px'; }
  }
  renderer.render(scene, camera);
});

rebuild(); applyLight(); audit(); overview();
/** Camera relative to a component's anchor: shot(id, camOffset, targetOffset, mode, dark, thermal). */
function shot(id, cam, tgt, mode = state.mode, dark = false, therm = false) {
  if (mode !== state.mode) setMode(mode); setDark(dark); setThermal(therm);
  const cell = cells.find(c => c.comp.id === id); const p = cell.anchor.getWorldPosition(new THREE.Vector3());
  camera.position.set(p.x + cam[0], p.y + cam[1], p.z + cam[2]); controls.target.set(p.x + tgt[0], p.y + tgt[1], p.z + tgt[2]); controls.update();
}
if (new URLSearchParams(location.search).has('clean')) { document.getElementById('ui').style.display = 'none'; setLabels(false); }
window.__viewer = { focus, setMode, setDark, setThermal, setLabels, overview, shot, cells, camera, controls };
