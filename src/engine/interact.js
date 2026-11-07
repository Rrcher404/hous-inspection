// Mouse raycasting, hover highlight, click routing, checkpoint hint rings / logged badges,
// and the material swapper shared by highlight + thermal (one place decides mesh.material).
import * as THREE from 'three';
import { ringTexture, checkTexture } from './textures.js';

// ── Material swapper ─────────────────────────────────────────────────────────
export function createSwapper() {
  const base = new WeakMap();      // mesh -> original material
  const hiCache = new Map();       // material -> highlight clone
  let thermalFn = null;            // (mesh, baseMat) => material | null
  const lit = new Set();           // meshes currently highlighted

  const baseOf = (mesh) => { let m = base.get(mesh); if (!m) { m = mesh.material; base.set(mesh, m); } return m; };
  function highlightOf(m) {
    let h = hiCache.get(m);
    if (h) return h;
    if ((m.transparent && m.opacity < 0.05) || m.visible === false) { hiCache.set(m, m); return m; } // invisible hit boxes stay invisible
    h = m.clone();
    if (h.emissive) {
      h.emissive = m.emissive.clone().add(new THREE.Color(0.2, 0.12, 0.04));
      h.emissiveIntensity = Math.max(1, m.emissiveIntensity || 1);
    } else if (h.color) h.color.multiplyScalar(1.35);
    hiCache.set(m, h);
    return h;
  }
  function refresh(mesh) {
    const b = baseOf(mesh);
    if (mesh.userData.hit) { if (mesh.material !== b) mesh.material = b; return; } // click targets never change look
    let m = thermalFn ? (thermalFn(mesh, b) || b) : b;
    if (lit.has(mesh)) m = Array.isArray(m) ? m.map(highlightOf) : highlightOf(m);
    if (mesh.material !== m) mesh.material = m;
  }
  return {
    baseOf, refresh,
    setHighlight(meshes, on) { for (const m of meshes) { if (on) lit.add(m); else lit.delete(m); refresh(m); } },
    clearHighlights() { const l = [...lit]; lit.clear(); l.forEach(refresh); },
    setThermal(fn, roots) { thermalFn = fn; for (const r of roots) r.traverse((o) => { if (o.isMesh) refresh(o); }); },
    forget(mesh) { lit.delete(mesh); base.delete(mesh); },
    disposeHighlightFor(mat) { const h = hiCache.get(mat); if (h && h !== mat) h.dispose(); hiCache.delete(mat); },
  };
}

// ── Interaction ─────────────────────────────────────────────────────────────
export function createInteraction({ camera, dom, swapper }) {
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const hits = [];
  const _box = new THREE.Vector3();
  let dirty = false, mx = 0, my = 0, inside = false;

  function setMouse(x, y) { mx = x; my = y; inside = true; dirty = true; }
  function leave() { inside = false; dirty = true; }
  function toNdc(x, y) {
    const r = dom.getBoundingClientRect();
    ndc.set(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1);
  }

  /** Nearest component/portal under the mouse, honouring wall occluders. */
  function pickWalk(x, y, comps, portals, occluders, far) {
    toNdc(x, y);
    ray.setFromCamera(ndc, camera); ray.far = far;
    let best = null, bestD = far;
    for (const c of comps) {
      if (!c.group.visible || !ray.ray.intersectsSphere(c.sphere)) continue;
      hits.length = 0;
      ray.intersectObject(c.group, true, hits);
      const h = hits[0];
      if (h && h.distance < bestD) { bestD = h.distance; best = { kind: 'component', comp: c, mesh: h.object, distance: h.distance }; }
    }
    for (const p of portals) {
      hits.length = 0;
      ray.intersectObject(p, false, hits);
      if (hits.length && hits[0].distance < bestD) { bestD = hits[0].distance; best = { kind: 'portal', mesh: p, portal: p.userData.portal, distance: hits[0].distance }; }
    }
    if (best) {
      for (const b of occluders) {
        if (ray.ray.intersectBox(b, _box) && ray.ray.origin.distanceTo(_box) < best.distance - 0.03) {
          // ignore the wall a wall-mounted item is fixed to (its own face)
          if (!b.containsPoint(ray.ray.origin)) return null;
        }
      }
    }
    return best;
  }
  /** Tagged mesh of the inspected component under the mouse. */
  function pickCheckpoint(x, y, group) {
    toNdc(x, y);
    ray.setFromCamera(ndc, camera); ray.far = 50;
    hits.length = 0;
    ray.intersectObject(group, true, hits);
    for (const h of hits) {
      let o = h.object, cp = null;
      while (o && o !== group.parent) { if (o.userData.checkpointId) { cp = o.userData.checkpointId; break; } o = o.parent; }
      if (cp) return { checkpointId: cp, mesh: h.object, point: h.point };
      if (h.object.visible && h.object.material?.opacity > 0.05) return null; // an untagged solid part is in front
    }
    return null;
  }
  return {
    setMouse, leave, get dirty() { return dirty; }, set dirty(v) { dirty = v; },
    get mouse() { return { x: mx, y: my, inside }; },
    pickWalk, pickCheckpoint,
  };
}

// ── Hint rings + check badges ───────────────────────────────────────────────
export function createHints(scene) {
  const ringTex = ringTexture('#f2803a'), checkTex = checkTexture();
  const ringMat = new THREE.SpriteMaterial({ map: ringTex, depthTest: false, depthWrite: false, transparent: true, sizeAttenuation: false });
  const checkMat = new THREE.SpriteMaterial({ map: checkTex, depthTest: false, depthWrite: false, transparent: true, sizeAttenuation: false });
  const group = new THREE.Group(); group.name = 'hints'; scene.add(group);
  group.layers.set(1);
  const items = []; // { cpId, ring, badge, pos }
  let t = 0;

  function clear() { for (const it of items) { group.remove(it.ring); group.remove(it.badge); } items.length = 0; }
  function show(compGroup, comp, isLogged, hintsOn) {
    clear();
    const boxes = new Map();
    compGroup.updateMatrixWorld(true);
    compGroup.traverse((o) => {
      if (!o.isMesh || !o.userData.checkpointId) return;
      const bb = new THREE.Box3().setFromObject(o);
      const cur = boxes.get(o.userData.checkpointId);
      if (cur) cur.union(bb); else boxes.set(o.userData.checkpointId, bb);
    });
    for (const cp of comp.checkpoints) {
      const bb = boxes.get(cp.id);
      if (!bb) continue;
      const pos = bb.getCenter(new THREE.Vector3());
      const ring = new THREE.Sprite(ringMat); ring.position.copy(pos); ring.renderOrder = 999; ring.layers.set(1);
      const badge = new THREE.Sprite(checkMat); badge.position.copy(pos); badge.renderOrder = 1000; badge.layers.set(1);
      badge.center.set(-0.35, -0.35); badge.scale.setScalar(0.03);
      group.add(ring); group.add(badge);
      items.push({ cpId: cp.id, ring, badge, pos });
    }
    update(isLogged, hintsOn);
  }
  function update(isLogged, hintsOn) {
    for (const it of items) {
      const logged = isLogged(it.cpId);
      it.badge.visible = logged;
      it.ring.visible = hintsOn && !logged;
    }
  }
  function tick(dt) {
    t += dt;
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (!it.ring.visible) continue;
      const k = 0.5 + 0.5 * Math.sin(t * 3.2 + i * 0.9);
      it.ring.scale.setScalar(0.03 + 0.012 * k);
      it.ring.material.opacity = 0.55 + 0.4 * (1 - k);
    }
  }
  return { show, update, clear, tick, group, get count() { return items.length; } };
}
