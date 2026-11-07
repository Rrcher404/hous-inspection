// Dev viewer for src/models/outside.js — lays every outside builder out on a grid.
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { COMPONENTS } from '../src/data/manifest.js';
import { builders, ROOF_PITCH } from '../src/models/outside.js';

const ZONES = ['exterior', 'roof', 'deck', 'shed', 'garage', 'attic'];
const comps = COMPONENTS.filter(c => ZONES.includes(c.zone));
const params = new URLSearchParams(location.search);
let mode = params.get('mode') === 'ok' ? 'ok' : 'defect';
let thermalOn = false, hitsOn = false, labelsOn = true;

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
document.body.appendChild(renderer.domElement);
const lr = new CSS2DRenderer(); lr.setSize(innerWidth, innerHeight); Object.assign(lr.domElement.style, { position: 'fixed', top: 0, left: 0, pointerEvents: 'none' }); document.body.appendChild(lr.domElement);

const scene = new THREE.Scene(); scene.background = new THREE.Color('#9fb3c4');
const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.02, 400);
const controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true;
scene.add(new THREE.HemisphereLight('#dfeaff', '#6b5a45', 1.1));
const sun = new THREE.DirectionalLight('#fff4e0', 2.2); sun.position.set(20, 30, 25); sun.castShadow = true;
sun.shadow.mapSize.set(4096, 4096); Object.assign(sun.shadow.camera, { left: -45, right: 45, top: 45, bottom: -45, far: 120 }); sun.shadow.bias = -0.0004;
scene.add(sun, sun.target);
const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshStandardMaterial({ color: '#7d8a6c' }));
ground.rotation.x = -Math.PI / 2; ground.position.y = -0.002; ground.receiveShadow = true; scene.add(ground);

const root = new THREE.Group(); scene.add(root);
const slots = {};
const COLS = 7;
const TH = { hot: '#fff27a', warm: '#ff8a2a', cool: '#8a4bd6', cold: '#1630b8', wet: '#127a8a' };
const thMat = {}; const neutral = new THREE.MeshBasicMaterial({ color: '#4c3f9a' });
const tm = (k) => thMat[k] || (thMat[k] = new THREE.MeshBasicMaterial({ color: TH[k] }));

function statesFor(comp, m) { return Object.fromEntries(comp.checkpoints.map(cp => [cp.id, cp.kind === 'variable' ? m : cp.kind])); }

function build() {
  root.clear(); 
  comps.forEach((comp, i) => {
    const cell = new THREE.Group(); cell.name = comp.id;
    const col = i % COLS, row = Math.floor(i / COLS);
    cell.position.set((col - (COLS - 1) / 2) * 9, 0, row * 9 - 18);
    const fn = builders[comp.id];
    let g;
    try { g = fn(statesFor(comp, mode), comp); } catch (e) { console.error(comp.id, e); g = new THREE.Group(); }
    g.traverse(o => { o.userData.componentId = comp.id; });
    const holder = new THREE.Group();
    if (comp.mount === 'roof') { holder.rotation.x = ROOF_PITCH; holder.position.y = 1.0; }
    if (comp.mount === 'ceiling') holder.position.y = 2.6;
    if (comp.mount === 'wall' || comp.id === 'deck-framing') {
      const [w, h] = comp.size;
      const wall = new THREE.Mesh(new THREE.PlaneGeometry(Math.max(w * 1.6, 1.2), Math.max(h * 1.4, 1.0)), new THREE.MeshStandardMaterial({ color: '#cfc9bc' }));
      wall.position.set(0, Math.max(h * 1.4, 1.0) / 2 - 0.1, -0.012); wall.receiveShadow = true; cell.add(wall);
      if (['gar-panel', 'ext-hose-bib', 'ext-receptacle', 'ext-window', 'ext-crawl-access'].includes(comp.id)) holder.position.y = comp.id === 'gar-panel' ? 1.1 : comp.id === 'ext-window' ? 0.8 : 0.3, wall.position.y += holder.position.y;
    }
    holder.add(g); cell.add(holder);
    const div = document.createElement('div'); div.className = 'lbl'; div.textContent = comp.id;
    const lab = new CSS2DObject(div); lab.position.set(0, -0.15, 1.2); cell.add(lab);
    root.add(cell); slots[comp.id] = { cell, g };
  });
  applyViews();
  runAudit();
}

function applyViews() {
  root.traverse(o => {
    if (!o.isMesh) return;
    if (!o.userData._mat) o.userData._mat = o.material;
    if (thermalOn) o.material = o.userData.hit ? o.userData._mat : (o.userData.thermal ? tm(o.userData.thermal) : neutral);
    else o.material = o.userData._mat;
    if (o.userData.hit) o.material = hitsOn ? hitVis : o.userData._mat;
  });
  root.traverse(o => { if (o.isCSS2DObject) o.visible = labelsOn; });
}
const hitVis = new THREE.MeshBasicMaterial({ color: '#ff00ff', wireframe: true });

function runAudit() {
  const out = [];
  for (const comp of comps) {
    for (const m of ['defect', 'ok']) {
      let g; try { g = builders[comp.id](statesFor(comp, m), comp); } catch (e) { out.push(`${comp.id} [${m}] THROWS ${e.message}`); continue; }
      const found = new Set(); let meshes = 0; const box = new THREE.Box3().setFromObject(g); const sz = box.getSize(new THREE.Vector3());
      g.traverse(o => { if (o.isMesh) meshes++; if (o.userData.checkpointId) found.add(o.userData.checkpointId); });
      for (const cp of comp.checkpoints) if (!found.has(cp.id)) out.push(`${comp.id} [${m}] untagged ${cp.id}`);
      for (const f of found) if (!comp.checkpoints.find(c => c.id === f)) out.push(`${comp.id} [${m}] stray tag ${f}`);
      if (meshes > 150) out.push(`${comp.id} [${m}] ${meshes} meshes`);
      if (m === 'defect') out.push(`  · ${comp.id}: ${meshes} meshes, bbox ${sz.toArray().map(v => v.toFixed(2)).join('×')} (size ${comp.size.join('×')})`);
    }
  }
  const probs = out.filter(l => !l.startsWith('  ·'));
  document.getElementById('audit').textContent = (probs.length ? `[audit] ${probs.length} problems\n` + probs.join('\n') : '[audit] all outside components tag every checkpoint in both states ✓');
  window.__audit = { problems: probs, info: out.filter(l => l.startsWith('  ·')) };
  console.info('[audit-outside]', probs.length ? probs : 'ok');
}

function focus(id, k = 1) {
  const s = slots[id]; if (!s) return;
  const box = new THREE.Box3().setFromObject(s.cell.children.find(c => c.children?.length && c !== s.cell.children[0]) || s.cell);
  const b2 = new THREE.Box3().setFromObject(s.g); const c = b2.getCenter(new THREE.Vector3()); const r = b2.getSize(new THREE.Vector3()).length() / 2;
  const d = Math.max(0.2, r * 1.9) * k;
  camera.position.set(c.x + d * 0.35, c.y + d * 0.35, c.z + d); controls.target.copy(c); controls.update();
}
function overview() { camera.position.set(0, 40, 50); controls.target.set(0, 0, 4); controls.update(); }
function view(id, dir = [0.35, 0.35, 1], k = 1, target) { focus(id, k); const s = slots[id]; const b2 = new THREE.Box3().setFromObject(s.g); const c = target ? s.g.localToWorld(new THREE.Vector3(...target)) : b2.getCenter(new THREE.Vector3()); const d = camera.position.distanceTo(controls.target); const v = new THREE.Vector3(...dir).normalize().multiplyScalar(d); camera.position.copy(c).add(v); controls.target.copy(c); controls.update(); }

function setMode(m) { mode = m; document.getElementById('mDef').classList.toggle('on', m === 'defect'); document.getElementById('mOk').classList.toggle('on', m === 'ok'); build(); }
const btn = (id, f) => document.getElementById(id).onclick = f;
btn('mDef', () => setMode('defect')); btn('mOk', () => setMode('ok'));
btn('tTherm', (e) => { thermalOn = !thermalOn; e.target.classList.toggle('on', thermalOn); applyViews(); });
btn('tHit', (e) => { hitsOn = !hitsOn; e.target.classList.toggle('on', hitsOn); applyViews(); });
btn('tLbl', (e) => { labelsOn = !labelsOn; e.target.classList.toggle('on', labelsOn); applyViews(); });
btn('tAll', overview);
const list = document.getElementById('list');
comps.forEach(c => { const a = document.createElement('a'); a.textContent = `${c.zone} · ${c.id}`; a.onclick = () => focus(c.id); list.appendChild(a); });

const ray = new THREE.Raycaster(), mv = new THREE.Vector2();
renderer.domElement.addEventListener('dblclick', (e) => {
  mv.set(e.clientX / innerWidth * 2 - 1, -e.clientY / innerHeight * 2 + 1); ray.setFromCamera(mv, camera);
  const h = ray.intersectObject(root, true).find(i => i.object.isMesh);
  document.getElementById('pick').textContent = h ? `${h.object.userData.componentId} → ${h.object.userData.checkpointId || '(untagged)'}${h.object.userData.thermal ? ' · thermal ' + h.object.userData.thermal : ''}` : 'nothing';
});
addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); lr.setSize(innerWidth, innerHeight); });
renderer.setAnimationLoop(() => { controls.update(); renderer.render(scene, camera); lr.render(scene, camera); });

window.__viewer = { focus, view, setMode, overview, slots, toggleLabels: (v) => { labelsOn = v; applyViews(); }, thermal: (v) => { thermalOn = v; applyViews(); }, hits: (v) => { hitsOn = v; applyViews(); } };
build();
const f = params.get('focus'); if (f) focus(f); else overview();
