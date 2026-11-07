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
    debug: { camera, scene, renderer, componentObjects, get controls() { return controls; }, get house() { return house; }, recs, info: () => renderer.info, setPose: (p) => controls?.setPose(p), stats: {} },
  };

  // ── components ─────────────────────────────────────────────────────────────
  const _bs = new THREE.Box3();
  function buildAll() {
    const states = store.inspection.states;
    let meshesBefore = 0, meshesAfter = 0;
    for (const comp of COMPONENTS) {
      const g = buildComponent(comp.id, states);
      const st = optimizeComponent(g);
      meshesBefore += st.before; meshesAfter += st.after;
      const pose = applyPlacement(g, comp);
      compRoot.add(g);
      g.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(g);
      const sphere = box.getBoundingSphere(new THREE.Sphere());
      const rec = { id: comp.id, comp, group: g, box, sphere, zone: comp.zone, level: levelOfZone(comp.zone), front: pose?.front || new THREE.Vector3(0, 0, 1), normal: pose?.normal || new THREE.Vector3(0, 1, 0), view: pose?.view || null, dist: pose?.dist || 0 };
      recs.set(comp.id, rec);
      componentObjects.set(comp.id, g);
    }
    api.debug.stats.meshes = { before: meshesBefore, after: meshesAfter };
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
    const half = THREE.MathUtils.degToRad(camera.fov / 2);
    const dist = rec.dist || THREE.MathUtils.clamp((r / Math.sin(half)) * 0.8, 0.45, 6.5);
    const pos = c.clone().addScaledVector(dir, dist);
    // keep the camera inside the space the component lives in
    const lvl = rec.level;
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
    return { target: c, framePos: pos, lim, phiMin, phiMax, rMin: Math.max(0.12, r * 0.35), rMax: Math.max(1.5, dist * 2.4) };
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
    controls.beginInspect(framing(rec), () => {
      if (!inspecting || inspecting.rec !== rec) return;
      hints.show(rec.group, rec.comp, (id) => store.isLogged(id), !!store.settings.hints);
      bus.emit('inspect:entered', { componentId: rec.id });
    });
    updateCursor();
  }
  function exitInspect(instant = false) {
    if (!inspecting) return;
    const rec = inspecting.rec;
    if (inspecting.hoverCp) swapper.setHighlight(inspecting.cpMeshes.get(inspecting.hoverCp) || [], false);
    hints.clear();
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
      const hit = interact.pickCheckpoint(m.x, m.y, inspecting.rec.group);
      const cp = hit?.checkpointId || null;
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
      const inspectInstead = opts.button === 2 || opts.alt || opts.shift;
      if (PORTAL_COMPONENTS[rec.id] && !inspectInstead) { travel(PORTAL_COMPONENTS[rec.id]); return; }
      openInspect(rec);
    } else if (controls.mode === 'inspect' && inspecting) {
      const hit = interact.pickCheckpoint(x, y, inspecting.rec.group);
      if (hit) bus.emit('checkpoint:click', { checkpointId: hit.checkpointId, componentId: inspecting.rec.id, x, y });
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
    camera.aspect = w / h; camera.updateProjectionMatrix();
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
      },
    });
    interact = createInteraction({ camera, dom: cv, swapper });
    hints = createHints(scene);
    controls.setPose(POSES.exterior);
    setZone(zoneAt('ground', POSES.exterior.x, POSES.exterior.z), true);
    applyTool(store.tool || 'hand');

    bus.on('ui:teleport', ({ zoneId }) => goToZone(zoneId));
    bus.on('ui:goto-component', ({ componentId }) => openComponent(componentId));
    bus.on('ui:inspect-exit', () => exitInspect());
    bus.on('ui:modal', ({ open }) => { modalOpen = !!open; controls.setModal(modalOpen); if (modalOpen) clearHover(); });
    bus.on('tool:changed', ({ tool }) => applyTool(tool));
    bus.on('finding:logged', () => { if (inspecting) hints.update((id) => store.isLogged(id), !!store.settings.hints); });
    bus.on('settings:changed', ({ key }) => { if (key === 'hints' && inspecting) hints.update((id) => store.isLogged(id), !!store.settings.hints); });
    bus.on('inspection:new', () => rebuild());

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
