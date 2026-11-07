// OWNER: Kaz. Engine entry: renderer, scene, frame loop, and the glue between the house
// shell, component models, walk/inspect camera, interaction, tools and the event bus.
//   createEngine({ container, bus, store }) -> { goToZone, openComponent, exitInspect, rebuild, getZone, debug }
import * as THREE from 'three';
import { COMPONENTS, COMPONENT_BY_ID, ZONE_BY_ID } from '../data/manifest.js';
import { buildComponent } from '../models/index.js';
import { initMaterials, setMaxAnisotropy } from './textures.js';
import { buildHouse } from './house.js';
import { applyPlacement, optimizeComponent } from './placements.js';
import { createControls } from './controls.js';
import { createInteraction, createHints, createSwapper } from './interact.js';
import { createTools } from './tools.js';
import {
  POSES, EXITS, PORTAL_COMPONENTS, TRIGGERS, VISIBLE, LEVEL_GROUPS, zoneAt, levelOfZone, blockedAt,
} from './zones.js';
import { CEIL, CRAWL_FLOOR, JOIST_BOT, ATTIC_FLOOR, BOUNDS, floorAt, gradeAt, mainUnder, inRect } from './layout.js';

const SKY = { top: '#5f97d4', horizon: '#d4e4ee', bottom: '#b9c4b4' };
const NO_COLLIDE = new Set(['ext-front-steps', 'ext-driveway', 'ext-grading', 'ext-downspout', 'ext-gutter', 'deck-stairs', 'deck-framing', 'deck-ledger',
  'crawl-vapor-barrier', 'crawl-joists', 'crawl-plumbing', 'crawl-duct', 'att-insulation', 'att-pests', 'att-wiring', 'att-truss', 'att-sheathing',
  'att-soffit-vent', 'kit-back-door', 'gar-fire-door', 'bed2-door', 'hall-attic-ladder', 'gar-overhead-door', 'gar-firewall', 'ext-siding', 'ext-window']);
const NAV_ZONES = new Set(['attic', 'crawl']);

export function createEngine({ container, bus, store }) {
  const reducedMotion = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  Object.assign(container.style, { position: 'fixed', inset: '0', overflow: 'hidden', zIndex: '0', background: '#0e1014' });

  // ── renderer / scene / camera ─────────────────────────────────────────────
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  let pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(pixelRatio);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false;
  renderer.autoClear = false;
  const cv = renderer.domElement;
  Object.assign(cv.style, { display: 'block', width: '100%', height: '100%', touchAction: 'none', userSelect: 'none', outline: 'none' });
  cv.tabIndex = 0;
  container.appendChild(cv);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(SKY.horizon, 45, 200);
  const camera = new THREE.PerspectiveCamera(62, 1, 0.03, 450);
  scene.add(camera);
  renderer.setClearColor(SKY.horizon);

  const fadeEl = document.createElement('div');
  Object.assign(fadeEl.style, { position: 'absolute', inset: '0', background: '#07080a', opacity: '0', pointerEvents: 'none', transition: `opacity ${reducedMotion ? 80 : 220}ms ease` });
  container.appendChild(fadeEl);

  // sky dome
  const sky = new THREE.Mesh(new THREE.SphereGeometry(400, 32, 16), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new THREE.Color(SKY.top) }, hor: { value: new THREE.Color(SKY.horizon) }, bot: { value: new THREE.Color(SKY.bottom) }, sunDir: { value: new THREE.Vector3(-22, 34, 26).normalize() } },
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `uniform vec3 top; uniform vec3 hor; uniform vec3 bot; uniform vec3 sunDir; varying vec3 vP;
      void main(){ float h = vP.y; vec3 c = h > 0.0 ? mix(hor, top, pow(clamp(h,0.0,1.0), 0.55)) : mix(hor, bot, clamp(-h*4.0,0.0,1.0));
        float s = max(dot(normalize(vP), sunDir), 0.0); c += vec3(1.0,0.92,0.75) * (pow(s, 900.0) * 3.0 + pow(s, 12.0) * 0.18);
        gl_FragColor = vec4(c, 1.0); }`,
  }));
  sky.name = 'sky'; sky.renderOrder = -10; sky.frustumCulled = false;
  scene.add(sky);

  // dim overlay used between the two inspect passes
  const dimScene = new THREE.Scene();
  const dimCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  dimScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({ color: '#05070a', transparent: true, opacity: 0.42, depthTest: false, depthWrite: false })));

  // ── state ──────────────────────────────────────────────────────────────────
  const componentObjects = new Map();   // id -> Group
  const recs = new Map();               // id -> record
  let ready = false;
  const queue = [];
  let house = null, tools = null, controls = null, interact = null, hints = null;
  const swapper = createSwapper();
  const colliders = { ground: [], roof: [], attic: [], crawl: [] };
  let staticColliders = null;
  const compRoot = new THREE.Group(); compRoot.name = 'components'; scene.add(compRoot);
  let zone = null, modalOpen = false, dragging = false;
  let hover = { componentId: null, checkpointId: null, name: null, rec: null, portal: null, meshes: [] };
  let inspecting = null;   // { rec, cpMeshes: Map }
  let travelling = false;
  let triggersArmed = true;
  let shadowsDirty = true;

  const api = {
    goToZone: (zoneId) => (ready ? goToZone(zoneId) : queue.push(() => goToZone(zoneId))),
    openComponent: (id) => (ready ? openComponent(id) : queue.push(() => openComponent(id))),
    exitInspect: () => (ready ? exitInspect() : undefined),
    rebuild: () => (ready ? rebuild() : undefined),
    getZone: () => zone || 'exterior',
    debug: { camera, scene, renderer, componentObjects, get controls() { return controls; }, get house() { return house; }, recs, info: () => renderer.info,
      ringCheck: () => (inspecting ? hints.items.map((it) => { const s = interact.toScreen(it.pos, { x: 0, y: 0, front: false }); const fa = freeArea();
        return { cpId: it.cpId, x: Math.round(s.x), y: Math.round(s.y), inFree: s.x > fa.x0 && s.x < fa.x1 && s.y > fa.y0 && s.y < fa.y1,
          ray: interact.pickCheckpoint(s.x, s.y, inspecting.rec.group)?.checkpointId || null, final: hints.pickAt(s.x, s.y, interact.toScreen) || null }; }) : []), setPose: (p) => controls?.setPose(p), stats: {} },
  };

  // ── components ─────────────────────────────────────────────────────────────
  const _bs = new THREE.Box3();
  // Box of what the player can actually see. Box3.setFromObject counts every descendant, including the
  // invisible hit boxes (opacity 0) that make small parts clickable, which framed objects too far away.
  const _vb = new THREE.Box3();
  function seenOpacity(m) { const ms = Array.isArray(m.material) ? m.material : [m.material]; return Math.max(...ms.map((x) => (x && x.visible !== false ? (x.transparent ? x.opacity : 1) : 0))); }
  function visibleBox(root) {
    const box = new THREE.Box3();
    root.traverseVisible((o) => {
      if (!o.isMesh || !o.geometry) return;
      if (seenOpacity(o) < 0.05) return;
      if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
      _vb.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld);
      box.union(_vb);
    });
    return box.isEmpty() ? new THREE.Box3().setFromObject(root) : box;
  }
  function buildAll() {
    const states = store.inspection.states;
    let meshesBefore = 0, meshesAfter = 0;
    const shrunk = [], _v3a = new THREE.Vector3(), _v3b = new THREE.Vector3();
    for (const comp of COMPONENTS) {
      const g = buildComponent(comp.id, states);
      const st = optimizeComponent(g);
      meshesBefore += st.before; meshesAfter += st.after;
      const pose = applyPlacement(g, comp);
      compRoot.add(g);
      g.updateMatrixWorld(true);
      const box = visibleBox(g);
      const full = new THREE.Box3().setFromObject(g);
      if (full.getSize(_v3a).length() > box.getSize(_v3b).length() * 1.05) shrunk.push(comp.id);
      const sphere = box.getBoundingSphere(new THREE.Sphere());
      const rec = { id: comp.id, comp, group: g, box, sphere, zone: comp.zone, level: levelOfZone(comp.zone), front: pose?.front || new THREE.Vector3(0, 0, 1), normal: pose?.normal || new THREE.Vector3(0, 1, 0), view: pose?.view || null, dist: pose?.dist || 0, maxDist: pose?.maxDist || 0 };
      recs.set(comp.id, rec);
      componentObjects.set(comp.id, g);
    }
    api.debug.stats.meshes = { before: meshesBefore, after: meshesAfter };
    api.debug.stats.hitBoxFramed = shrunk; // components whose framing box shrank once invisible hit boxes were ignored
    rebuildColliders();
  }
  function rebuildColliders() {
    for (const k of Object.keys(colliders)) colliders[k] = staticColliders[k].slice();
    for (const rec of recs.values()) {
      const c = rec.comp;
      if (NO_COLLIDE.has(c.id) || c.mount === 'ceiling' || c.mount === 'roof') continue;
      const b = rec.box;
      const w = b.max.x - b.min.x, d = b.max.z - b.min.z, h = b.max.y - b.min.y;
      if (h < 0.35 || w * d < 0.03 || Math.min(w, d) < 0.06) continue;
      if (c.mount === 'wall' && Math.min(w, d) < 0.25) continue;
      colliders[rec.level].push({ x0: b.min.x, x1: b.max.x, z0: b.min.z, z1: b.max.z });
    }
  }
  function disposeComponents() {
    const geos = new Set(), mats = new Set(), texs = new Set();
    for (const rec of recs.values()) {
      rec.group.traverse((o) => {
        if (!o.isMesh) return;
        geos.add(o.geometry);
        const m = swapper.baseOf(o);
        for (const mm of [].concat(m)) if (mm) mats.add(mm);
        swapper.forget(o);
      });
      compRoot.remove(rec.group);
    }
    recs.clear(); componentObjects.clear();
    return { geos, mats, texs };
  }
  function collectMaterialTextures(m, out) {
    for (const k of Object.keys(m)) { const v = m[k]; if (v && v.isTexture) out.add(v); }
  }
  function rebuild() {
    if (inspecting) exitInspect(true);
    clearHover();
    const old = disposeComponents();
    buildAll();
    const keepG = new Set(), keepM = new Set(), keepT = new Set();
    for (const rec of recs.values()) rec.group.traverse((o) => { if (o.isMesh) { keepG.add(o.geometry); for (const mm of [].concat(o.material)) { keepM.add(mm); collectMaterialTextures(mm, keepT); } } });
    for (const g of old.geos) if (!keepG.has(g)) g.dispose();
    for (const m of old.mats) {
      if (keepM.has(m) || typeof m.dispose !== 'function') continue;
      const tx = new Set(); collectMaterialTextures(m, tx);
      for (const t of tx) if (!keepT.has(t)) t.dispose();
      swapper.disposeHighlightFor(m);
      m.dispose();
    }
    if (tools.thermal) swapper.setThermal(tools.thermalFor, [compRoot]);
    updateVisibility();
    shadowsDirty = true;
  }

  // ── visibility per level/zone ─────────────────────────────────────────────
  function updateVisibility() {
    const level = controls.state.level;
    const on = new Set(LEVEL_GROUPS[level]);
    for (const [k, g] of Object.entries(house.groups)) g.visible = on.has(k);
    sky.visible = (level === 'ground' || level === 'roof') && !tools.thermal;
    const vis = new Set(VISIBLE[zone] || VISIBLE.exterior);
    for (const rec of recs.values()) rec.group.visible = vis.has(rec.zone) || (inspecting && inspecting.rec === rec);
    refreshHoverLists();
  }
  function updateShadows() {
    // the sun is static: render the shadow map once, with the full ground-level world visible
    const saved = [];
    for (const [k, g] of Object.entries(house.groups)) { saved.push([g, g.visible]); g.visible = LEVEL_GROUPS.ground.includes(k); }
    for (const rec of recs.values()) { saved.push([rec.group, rec.group.visible]); rec.group.visible = !NAV_ZONES.has(rec.zone); }
    renderer.shadowMap.needsUpdate = true;
    renderer.render(scene, camera);
    for (const [g, v] of saved) g.visible = v;
    shadowsDirty = false;
  }

  // ── zones, travel, triggers ─────────────────────────────────────────────────
  function setZone(z, force = false) {
    if (z === zone && !force) return;
    zone = z;
    const lvl = controls.state.level;
    const dark = !!ZONE_BY_ID[z]?.dark;
    tools.setProfile(z, dark);
    scene.fog.color.set(dark || tools.thermal ? '#000000' : SKY.horizon);
    scene.fog.near = dark ? 4 : 45; scene.fog.far = dark ? 26 : 200;
    renderer.setClearColor(dark || tools.thermal ? '#000000' : SKY.horizon);
    void lvl;
    updateVisibility();
    bus.emit('zone:enter', { zoneId: z });
  }
  function fade(mid) {
    travelling = true;
    controls.freeze(true);
    fadeEl.style.opacity = '1';
    setTimeout(() => {
      try { mid(); } finally {
        requestAnimationFrame(() => { fadeEl.style.opacity = '0'; travelling = false; controls.freeze(false); });
      }
    }, reducedMotion ? 90 : 240);
  }
  function placeAt(pose) {
    controls.setPose(pose);
    triggersArmed = false;
    setZone(zoneAt(pose.level, pose.x, pose.z), true);
  }
  function travel(key, after) {
    const pose = EXITS[key] || POSES[key];
    if (!pose) return;
    if (inspecting) exitInspect(true);
    clearHover();
    fade(() => { placeAt(pose); after?.(); });
  }
  function goToZone(zoneId) {
    if (!POSES[zoneId]) { console.warn('[engine] unknown zone', zoneId); return; }
    travel(zoneId);
  }
  function checkTriggers() {
    const s = controls.state;
    let inside = false;
    for (const t of TRIGGERS) {
      if (t.level !== s.level) continue;
      const [x0, x1, z0, z1] = t.rect;
      if (!inRect(s.x, s.z, x0, x1, z0, z1)) continue;
      inside = true;
      if (!triggersArmed) continue;
      const md = controls.moveDir;
      if (t.dir && md.x * t.dir[0] + md.z * t.dir[1] < 0.25) continue;
      travel(t.to);
      return;
    }
    if (!inside) triggersArmed = true;
  }

  // ── inspect ─────────────────────────────────────────────────────────────────
  // ── inspect framing ──────────────────────────────────────────────────────
  // The UI keeps an inspect panel on the right (~360 px) and a tool belt at the bottom (~110 px).
  // An off-axis view offset re-centres the image on the free area; framing fills ~60% of it.
  const PANEL_W = 360, BELT_H = 110, FILL = 0.7;
  // The field guide bubble (desktop) sits on the left; the UI reports its width with ui:guide-layout.
  let guideLeft = 0, guideLeftCur = 0;
  function freeArea(target = false) {
    const r = cv.getBoundingClientRect(), W = r.width || 1, H = r.height || 1;
    let right = 2 * Math.min(PANEL_W / 2, W * 0.15), left = Math.min(target ? guideLeft : guideLeftCur, W * 0.3), dy = Math.min(BELT_H / 2, H * 0.07);
    // phone portrait: the UI moves the panel to a bottom sheet, so frame in the top half instead
    if (W <= 640 && H > W) { right = 0; left = 0; dy = H * 0.24; }
    const dx = (right - left) / 2, fw = W - right - left;
    return { W, H, dx, dy, fw, x0: r.left + left + 12, x1: r.left + W - right - 12, y0: r.top + 12, y1: r.top + H - 2 * dy - 12 };
  }
  const _occ = new THREE.Ray(), _hitP = new THREE.Vector3();
  function clearDistance(level, from, dir, maxD) {
    if (level !== 'ground') return maxD;
    _occ.origin.copy(from); _occ.direction.copy(dir);
    let d = maxD;
    for (const b of house.occluders) {
      if (b.containsPoint(from)) continue;
      if (_occ.intersectBox(b, _hitP)) { const t = from.distanceTo(_hitP); if (t > 0.02 && t < d) d = t; }
    }
    return d;
  }
  function fitDistance(box, c, dir, fa, dMin, dMax) {
    const fwd = dir.clone().negate();
    const upRef = Math.abs(fwd.y) > 0.97 ? new THREE.Vector3(0, 0, -1) : new THREE.Vector3(0, 1, 0);
    const right = new THREE.Vector3().crossVectors(fwd, upRef).normalize(), up = new THREE.Vector3().crossVectors(right, fwd);
    const tv = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const tanV = tv * (fa.H - 2 * fa.dy) / fa.H, tanH = tv * (fa.W / fa.H) * fa.fw / fa.W;
    const corners = [];
    for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const z of [box.min.z, box.max.z]) corners.push(new THREE.Vector3(x, y, z).sub(c));
    const frac = (d) => {
      let f = 0;
      for (const k of corners) { const depth = d + k.dot(fwd); if (depth < 0.05) return 9; f = Math.max(f, Math.abs(k.dot(right)) / (depth * tanH), Math.abs(k.dot(up)) / (depth * tanV)); }
      return f;
    };
    let lo = dMin, hi = dMax;
    if (frac(hi) > FILL) return hi;          // too big even at the cap: show the defect area up close
    if (frac(lo) <= FILL) return lo;
    for (let i = 0; i < 24; i++) { const m = (lo + hi) / 2; if (frac(m) > FILL) lo = m; else hi = m; }
    return hi;
  }
  function framing(rec) {
    const c = rec.box.getCenter(new THREE.Vector3());
    const size = rec.box.getSize(new THREE.Vector3());
    const r = Math.max(0.08, size.length() / 2);
    const mount = rec.comp.mount;
    const dir = new THREE.Vector3();
    let lim = 1.45, phiMin = 0.2, phiMax = 1.8;
    if (mount === 'ceiling') { dir.copy(rec.front).multiplyScalar(0.6).add(new THREE.Vector3(0, -1, 0)); lim = Math.PI; phiMin = 1.7; phiMax = 3.05; }
    else if (mount === 'roof') { dir.copy(rec.normal).addScaledVector(rec.front, 0.8); lim = 1.6; phiMin = 0.12; phiMax = 1.5; if (rec.zone === 'attic') { dir.copy(rec.normal).negate().addScaledVector(rec.front, -0.4); phiMin = 1.6; phiMax = 3.0; lim = 1.4; } }
    else if (mount === 'wall') { dir.copy(rec.front).add(new THREE.Vector3(0, 0.15, 0)); lim = 1.2; phiMin = 0.35; phiMax = 2.5; }
    else { dir.copy(rec.front).add(new THREE.Vector3(0, 0.6, 0)); }
    if (rec.level === 'crawl' && mount === 'ceiling') { dir.set(rec.front.x, -0.55, rec.front.z); }
    if (rec.view) { dir.copy(rec.view); lim = 1.3; phiMin = 0.3; phiMax = 2.6; }
    dir.normalize();
    // distance: fit the projected box to ~60% of the free area, capped (long thin parts are shown up close)
    const dims = [size.x, size.y, size.z].sort((p, q) => p - q);
    const dMax = rec.maxDist || THREE.MathUtils.clamp(1.6 + 3 * dims[1], 1.2, 3.0);
    const fa = freeArea(true);
    let dist = fitDistance(rec.box, c, dir, fa, 0.35, dMax);
    // never park the camera behind a wall: try swinging around the vertical axis first
    const lvl = rec.level;
    if (clearDistance(lvl, c, dir, dist + 0.15) < dist + 0.1) {
      let best = { d: -1, dir: dir.clone() };
      for (const ang of [0.35, -0.35, 0.7, -0.7, 1.05, -1.05]) {
        const dd = dir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), ang);
        const cd = clearDistance(lvl, c, dd, dist + 0.15);
        if (cd >= dist + 0.1) { best = { d: dist, dir: dd }; break; }
        if (cd > best.d) best = { d: cd, dir: dd };
      }
      dir.copy(best.dir);
      dist = Math.min(dist, Math.max(0.35, best.d - 0.12));
    }
    const pos = c.clone().addScaledVector(dir, dist);
    // keep the camera inside the space the component lives in
    if (lvl === 'attic' || lvl === 'crawl') {
      const B = BOUNDS[lvl];
      pos.x = THREE.MathUtils.clamp(pos.x, B.x0, B.x1);
      pos.z = THREE.MathUtils.clamp(pos.z, lvl === 'attic' ? Math.max(B.z0 - 1.0, -0.1) : B.z0, lvl === 'attic' ? Math.min(B.z1 + 1.0, 10.1) : B.z1);
    }
    const fl = (rec.view && lvl === 'ground' ? gradeAt(pos.x, pos.z) : floorAt(lvl, pos.x, pos.z)) + 0.22; // view overrides may look from under the deck
    let cap = 1e9;
    if (lvl === 'ground' && inRect(pos.x, pos.z, 0, 21.5, 0, 10)) cap = CEIL - 0.08;
    if (lvl === 'attic') cap = Math.max(ATTIC_FLOOR + 0.25, mainUnder(pos.z) - 0.12);
    if (lvl === 'crawl') cap = JOIST_BOT - 0.04;
    pos.y = THREE.MathUtils.clamp(pos.y, Math.min(fl, cap), cap);
    if (lvl === 'crawl') pos.y = Math.max(pos.y, CRAWL_FLOOR + 0.12);
    const d = pos.distanceTo(c);
    return { target: c, framePos: pos, box: rec.box, dist: d, lim, phiMin, phiMax, rMin: 0.15, rMax: Math.max(1.5, d * 2.4) };
  }
  // view offset follows the inspect transition so the target lands in the free area
  let offK = 0, offW = 0, offH = 0;
  function updateViewOffset() {
    const m = controls.mode;
    const sm = (t) => t * t * (3 - 2 * t);
    const k = !inspecting && m === 'walk' ? 0 : m === 'inspect' ? 1 : m === 'toInspect' ? sm(controls.tweenT) : m === 'toWalk' ? 1 - sm(controls.tweenT) : 0;
    const gl0 = guideLeftCur;
    guideLeftCur += (guideLeft - guideLeftCur) * (reducedMotion ? 1 : 0.18);
    if (Math.abs(guideLeft - guideLeftCur) < 0.5) guideLeftCur = guideLeft;
    const fa = freeArea();
    if (Math.abs(k - offK) < 1e-4 && fa.W === offW && fa.H === offH && gl0 === guideLeftCur) return;
    offK = k; offW = fa.W; offH = fa.H;
    if (k < 1e-4) camera.clearViewOffset();
    else camera.setViewOffset(fa.W, fa.H, fa.dx * k, fa.dy * k, fa.W, fa.H);
  }
  function placeRings() {
    if (!inspecting || !hints || !interact || !inspecting.rec?.group) return;
    const rec = inspecting.rec;
    camera.updateMatrixWorld();
    let anchors;
    try { anchors = interact.computeAnchors(rec.comp, inspecting.cpMeshes, rec.group, freeArea()); }
    catch (err) {
      console.warn('[engine] ring anchors fell back to bounding boxes', rec.id, err);
      anchors = [];
      for (const cp of rec.comp.checkpoints || []) {
        const ms = inspecting.cpMeshes.get(cp.id); if (!ms?.length) continue;
        const bb = new THREE.Box3(); for (const m of ms) bb.union(visibleBox(m));
        anchors.push({ cpId: cp.id, pos: bb.getCenter(new THREE.Vector3()), resolved: false });
      }
    }
    hints.show(Array.isArray(anchors) ? anchors : [], (id) => store.isLogged(id), !!store.settings.hints);
  }
  function openInspect(rec) {
    if (!rec || travelling) return;
    if (controls.mode === 'toWalk') controls.endInspect(null, true); // finish a return tween now
    if (controls.mode !== 'walk') return;
    clearHover();
    rec.group.visible = true;
    const cpMeshes = new Map();
    rec.group.traverse((o) => {
      if (!o.isMesh) return;
      o.layers.enable(1);
      const id = o.userData.checkpointId;
      if (id) { if (!cpMeshes.has(id)) cpMeshes.set(id, []); cpMeshes.get(id).push(o); }
    });
    inspecting = { rec, cpMeshes, hoverCp: null };
    bus.emit('component:open', { componentId: rec.id });
    const f = framing(rec);
    tools.setFill(true, f.dist);
    controls.beginInspect(f, () => {
      if (!inspecting || inspecting.rec !== rec) return;
      updateViewOffset();
      placeRings();
      bus.emit('inspect:entered', { componentId: rec.id });
    });
    updateCursor();
  }
  function exitInspect(instant = false) {
    if (!inspecting) return;
    const rec = inspecting.rec;
    if (inspecting.hoverCp) swapper.setHighlight(inspecting.cpMeshes.get(inspecting.hoverCp) || [], false);
    hints.clear();
    tools.setFill(false);
    rec.group.traverse((o) => { if (o.isMesh) o.layers.disable(1); });
    inspecting = null;
    emitHover(null, null, null);
    controls.endInspect(() => { bus.emit('inspect:exited', {}); updateVisibility(); updateCursor(); }, instant);
  }
  function openComponent(id) {
    const rec = recs.get(id);
    if (!rec) { console.warn('[engine] unknown component', id); return; }
    if (inspecting) exitInspect(true);
    if (controls.mode === 'toWalk') controls.endInspect(null, true);
    const s = controls.state;
    const sameZone = zone === rec.zone;
    const near = Math.hypot(rec.sphere.center.x - s.x, rec.sphere.center.z - s.z) < 7;
    if (sameZone && near && s.level === rec.level) { openInspect(rec); return; }
    // travel to a standing spot in front of the component, then frame it
    const f = framing(rec);
    let pose = null;
    const sx = f.framePos.x, sz = f.framePos.z;
    if (zoneAt(rec.level, sx, sz) === rec.zone && !blockedAt(rec.level, sx, sz, 0.24, colliders)) {
      const dx = f.target.x - sx, dz = f.target.z - sz;
      pose = { level: rec.level, x: sx, z: sz, yaw: Math.atan2(-dx, -dz), pitch: -0.1 };
    } else pose = POSES[rec.zone];
    if (inspecting) exitInspect(true);
    clearHover();
    fade(() => { placeAt(pose); });
    setTimeout(() => openInspect(rec), (reducedMotion ? 90 : 240) + 60);
  }

  // ── hover / click ───────────────────────────────────────────────────────────
  function emitHover(componentId, checkpointId, name, portal) {
    if (hover.componentId === componentId && hover.checkpointId === checkpointId && hover.name === name) return;
    hover.componentId = componentId; hover.checkpointId = checkpointId; hover.name = name;
    const payload = { componentId, checkpointId, name };
    if (portal) payload.portal = portal;
    bus.emit('hover', payload);
  }
  function clearHover() {
    if (hover.meshes.length) swapper.setHighlight(hover.meshes, false);
    hover.meshes = []; hover.rec = null; hover.portal = null;
    if (inspecting?.hoverCp) { swapper.setHighlight(inspecting.cpMeshes.get(inspecting.hoverCp) || [], false); inspecting.hoverCp = null; }
    emitHover(null, null, null);
    updateCursor();
  }
  // hover candidates are cached per visibility change (no per-frame allocation while walking)
  const hoverRecs = [], hoverPortals = [];
  const PORTAL_LEVEL = { 'deck>kitchen': 'ground', 'attic>hall': 'attic', 'crawl>exterior': 'crawl', 'roof>exterior': 'roof' };
  function refreshHoverLists() {
    const lvl = controls.state.level;
    hoverRecs.length = 0; hoverPortals.length = 0;
    for (const rec of recs.values()) if (rec.group.visible && (rec.level === lvl || (lvl === 'ground' && rec.level === 'roof'))) hoverRecs.push(rec);
    for (const p of house.portals) if (PORTAL_LEVEL[p.userData.portal.to] === lvl) hoverPortals.push(p);
  }
  const visibleRecs = () => hoverRecs;
  const visiblePortals = () => hoverPortals;
  function doHover() {
    const m = interact.mouse;
    if (!m.inside || modalOpen || travelling || dragging) { if (hover.rec || hover.portal || inspecting?.hoverCp) clearHover(); return; }
    if (controls.mode === 'walk') {
      const hit = interact.pickWalk(m.x, m.y, visibleRecs(), visiblePortals(), controls.state.level === 'ground' ? house.occluders : [], 12);
      const rec = hit?.kind === 'component' ? hit.comp : null;
      const portal = hit?.kind === 'portal' ? hit.portal : null;
      if (rec !== hover.rec) {
        if (hover.meshes.length) swapper.setHighlight(hover.meshes, false);
        hover.meshes = [];
        if (rec) { rec.group.traverse((o) => { if (o.isMesh) hover.meshes.push(o); }); swapper.setHighlight(hover.meshes, true); }
        hover.rec = rec;
      }
      hover.portal = portal;
      if (rec) emitHover(rec.id, null, rec.comp.name, PORTAL_COMPONENTS[rec.id] || undefined);
      else if (portal) emitHover(null, null, portal.name, portal.to);
      else emitHover(null, null, null);
    } else if (controls.mode === 'inspect' && inspecting) {
      const cp = hints.pickAt(m.x, m.y, interact.toScreen) || interact.pickCheckpoint(m.x, m.y, inspecting.rec.group)?.checkpointId || null;
      if (cp !== inspecting.hoverCp) {
        if (inspecting.hoverCp) swapper.setHighlight(inspecting.cpMeshes.get(inspecting.hoverCp) || [], false);
        if (cp) swapper.setHighlight(inspecting.cpMeshes.get(cp) || [], true);
        inspecting.hoverCp = cp;
      }
      const label = cp ? (inspecting.rec.comp.checkpoints.find((c) => c.id === cp)?.label || cp) : null;
      emitHover(inspecting.rec.id, cp, label || inspecting.rec.comp.name);
    }
    updateCursor();
  }
  function onClick(x, y, opts) {
    if (modalOpen || travelling) return;
    if (controls.mode === 'walk') {
      const hit = interact.pickWalk(x, y, visibleRecs(), visiblePortals(), controls.state.level === 'ground' ? house.occluders : [], 12);
      if (!hit) return;
      if (hit.kind === 'portal') { travel(hit.portal.to); return; }
      const rec = hit.comp;
      const inspectInstead = opts.button === 2 || opts.alt || opts.shift || opts.long;
      if (PORTAL_COMPONENTS[rec.id] && !inspectInstead) { travel(PORTAL_COMPONENTS[rec.id]); return; }
      openInspect(rec);
    } else if (controls.mode === 'inspect' && inspecting) {
      const cp = hints.pickAt(x, y, interact.toScreen) || interact.pickCheckpoint(x, y, inspecting.rec.group)?.checkpointId;
      if (cp) bus.emit('checkpoint:click', { checkpointId: cp, componentId: inspecting.rec.id, x, y });
    }
  }
  function onUseKey() {
    if (controls.mode === 'walk' && hover.rec) openInspect(hover.rec);
  }
  function updateCursor() {
    if (!tools) return;
    const hovering = !!(hover.rec || hover.portal || inspecting?.hoverCp);
    cv.style.cursor = tools.cursor(hovering, dragging);
  }

  // ── tools ───────────────────────────────────────────────────────────────────
  function applyTool(t) {
    const wasThermal = tools.thermal;
    tools.setTool(t);
    if (tools.thermal !== wasThermal) {
      swapper.setThermal(tools.thermal ? tools.thermalFor : null, [scene]);
      setZone(zone, true);
    }
    updateCursor();
  }

  // ── loop ───────────────────────────────────────────────────────────────────
  let last = performance.now(), frames = 0, acc = 0, firstFrame = true;
  function resize() {
    const w = container.clientWidth || window.innerWidth, h = container.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Portrait phones: a fixed vertical FOV leaves a ~30 deg sliver side to side. Widen the vertical
    // FOV until the view is ~58 deg across (capped so it never goes fish-eye). Desktop stays at 62.
    const want = 2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(29)) / camera.aspect);
    camera.fov = THREE.MathUtils.clamp(THREE.MathUtils.radToDeg(want), 62, 95);
    camera.updateProjectionMatrix();
  }
  function render() {
    renderer.clear();
    if (inspecting && (controls.mode === 'inspect' || controls.mode === 'toInspect')) {
      camera.layers.set(0);
      renderer.render(scene, camera);
      renderer.render(dimScene, dimCam);   // no depth test/write: pass-1 depth survives
      camera.layers.set(1);                  // undimmed redraw of the component where it is visible (LessEqual)
      renderer.render(scene, camera);
      camera.layers.set(0);
    } else renderer.render(scene, camera);
  }
  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    controls.update(dt);
    updateViewOffset();
    if (controls.mode === 'walk' && !travelling) {
      const s = controls.state;
      setZone(zoneAt(s.level, s.x, s.z));
      checkTriggers();
    }
    if (interact.dirty || controls.moving || controls.mode !== 'walk') { interact.dirty = false; doHover(); }
    tools.update(dt);
    hints.tick(dt);
    sky.position.copy(camera.position);
    if (shadowsDirty) updateShadows();
    render();
    // adaptive resolution: keep 60 fps by trimming pixel ratio if frames run long
    if (document.visibilityState === 'visible' && dt > 0) {
      acc += dt; frames++;
      if (frames >= 120) {
        const avg = acc / frames;
        api.debug.stats.fps = Math.round(1 / avg);
        if (avg > 0.0215 && pixelRatio > 1.01) { pixelRatio = Math.max(1, pixelRatio - 0.25); renderer.setPixelRatio(pixelRatio); resize(); console.info('[engine] pixel ratio ->', pixelRatio); }
        acc = 0; frames = 0;
      }
    }
    if (firstFrame) { firstFrame = false; ready = true; bus.emit('engine:ready', {}); queue.splice(0).forEach((fn) => fn()); }
  }

  // ── build (deferred one tick so the UI can paint its title screen first) ────
  function build() {
    const t0 = performance.now();
    initMaterials();
    setMaxAnisotropy(renderer.capabilities.getMaxAnisotropy());
    house = buildHouse();
    for (const g of Object.values(house.groups)) scene.add(g);
    staticColliders = house.colliders;
    tools = createTools({ scene, camera, fixtures: house.fixtures, reducedMotion });
    tools.sun.shadow.mapSize.set(3072, 3072);
    buildAll();
    controls = createControls({
      camera, dom: cv, store, colliders, reducedMotion,
      callbacks: {
        onHoverMove: (x, y) => interact.setMouse(x, y),
        onHoverLeave: () => interact.leave(),
        onClick, onUseKey,
        onDragState: (d) => { dragging = d; updateCursor(); },
        pickPoint: (x, y) => (inspecting ? interact.pickPoint(x, y, inspecting.rec.group) : null),
        onOrbitSettled: () => placeRings(),
      },
    });
    interact = createInteraction({ camera, dom: cv, swapper });
    hints = createHints(scene);
    controls.setPose(POSES.exterior);
    setZone(zoneAt('ground', POSES.exterior.x, POSES.exterior.z), true);
    applyTool(store.tool || 'hand');

    bus.on('ui:teleport', (e) => api.goToZone(e?.zoneId));
    bus.on('ui:goto-component', (e) => api.openComponent(e?.componentId));
    bus.on('ui:inspect-exit', () => exitInspect());
    bus.on('ui:stick', (e) => controls.setStick(e?.x, e?.y));
    bus.on('ui:guide-layout', (e) => { guideLeft = Math.max(0, Number(e?.left) || 0); });
    bus.on('ui:guide-focus', (e) => { if (inspecting) hints.focus(e?.checkpointId || null, e?.secs ?? 3); });
    bus.on('ui:modal', ({ open }) => { modalOpen = !!open; controls.setModal(modalOpen); if (modalOpen) clearHover(); });
    bus.on('tool:changed', ({ tool }) => applyTool(tool));
    bus.on('finding:logged', () => { if (inspecting) hints.update((id) => store.isLogged(id), !!store.settings.hints); });
    bus.on('settings:changed', ({ key }) => { if (key === 'hints' && inspecting) hints.update((id) => store.isLogged(id), !!store.settings.hints); });
    bus.on('inspection:new', () => { rebuild(); travel('exterior'); });

    new ResizeObserver(resize).observe(container);
    window.addEventListener('resize', resize);
    resize();
    // compile everything once (all groups visible) to avoid first-visit hitches
    const saved = [];
    for (const g of Object.values(house.groups)) { saved.push([g, g.visible]); g.visible = true; }
    for (const rec of recs.values()) { saved.push([rec.group, rec.group.visible]); rec.group.visible = true; }
    try { renderer.compile(scene, camera); } catch (e) { console.warn('[engine] precompile failed', e); }
    for (const [g, v] of saved) g.visible = v;
    api.debug.stats.buildMs = Math.round(performance.now() - t0);
    requestAnimationFrame(frame);
  }
  setTimeout(() => {
    try { build(); } catch (err) { console.error('[engine] build failed', err); throw err; }
  }, 0);

  return api;
}

// keep tree-shakers honest about the manifest import used only for lookups
void COMPONENT_BY_ID;
