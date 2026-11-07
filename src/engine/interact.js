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
    if (mesh.userData.hit || mesh.userData.anchor) { if (mesh.material !== b) mesh.material = b; return; } // click targets / anchors never change look
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
  /** First visible surface point of `group` under the mouse (zoom-to-cursor). */
  function pickPoint(x, y, group) {
    toNdc(x, y);
    ray.setFromCamera(ndc, camera); ray.far = 50;
    hits.length = 0;
    ray.intersectObject(group, true, hits);
    for (const h of hits) if (h.object.visible && !(h.object.material?.opacity < 0.05)) return h.point.clone();
    return null;
  }
  const _w = new THREE.Vector3(), _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3();
  /** World point -> client px (and whether it is in front of the camera). */
  function toScreen(p, out) {
    _w.copy(p).project(camera);
    const r = dom.getBoundingClientRect();
    out.x = r.left + (_w.x + 1) / 2 * r.width; out.y = r.top + (1 - _w.y) / 2 * r.height; out.front = _w.z > -1 && _w.z < 1;
    return out;
  }
  /**
   * Ring anchors: for each checkpoint, a surface point on ITS OWN meshes that the engine's picker
   * resolves back to that checkpoint from the current camera, inside the free screen area, kept
   * >= `sep` px from other rings where the geometry allows it.
   */
  function computeAnchors(comp, cpMeshes, group, free, sep = 26) {
    group.updateMatrixWorld(true);
    const found = [];
    for (const cp of comp.checkpoints) {
      const meshes = cpMeshes.get(cp.id) || [];
      const cands = [];
      for (let pass = 0; pass < 2; pass++) {
      if (pass === 1 && found.length && found[found.length - 1].cpId === cp.id) {
        if (found[found.length - 1].valid.length) break;
        found.pop(); // nothing clear from here: retry with a much denser sample of this checkpoint's surface
      }
      cands.length = 0;
      const per = pass ? 240 : Math.max(4, Math.ceil(40 / Math.max(1, meshes.length)));
      const maxTests = pass ? 160 : 30;
      for (const m of meshes) {
        const g = m.geometry, pos = g.attributes.position;
        if (!g.boundingBox) g.computeBoundingBox();
        // explicit anchors win: `userData.anchor === true` marks an (invisible) anchor mesh, a point/array marks a local point
        const a = m.userData.anchor;
        if (a === true) { cands.push({ p: g.boundingBox.getCenter(new THREE.Vector3()).applyMatrix4(m.matrixWorld), pri: 2 }); continue; }
        if (a && (a.isVector3 || Array.isArray(a))) cands.push({ p: (a.isVector3 ? a.clone() : new THREE.Vector3(a[0], a[1], a[2])).applyMatrix4(m.matrixWorld), pri: 1 });
        cands.push({ p: g.boundingBox.getCenter(new THREE.Vector3()).applyMatrix4(m.matrixWorld), pri: 0 });
        const idx = g.index, triCount = idx ? idx.count / 3 : pos.count / 3;
        const step = Math.max(1, Math.floor(triCount / per));
        for (let t = 0; t < triCount; t += step) {
          const i0 = idx ? idx.getX(t * 3) : t * 3, i1 = idx ? idx.getX(t * 3 + 1) : t * 3 + 1, i2 = idx ? idx.getX(t * 3 + 2) : t * 3 + 2;
          _a.fromBufferAttribute(pos, i0); _b.fromBufferAttribute(pos, i1); _c.fromBufferAttribute(pos, i2);
          cands.push({ p: _a.add(_b).add(_c).multiplyScalar(1 / 3).applyMatrix4(m.matrixWorld).clone(), pri: 0 });
        }
      }
      const sc = { x: 0, y: 0, front: false };
      const onScreen = [];
      for (const c of cands) {
        toScreen(c.p, sc);
        if (!sc.front) continue;
        const inFree = sc.x > free.x0 && sc.x < free.x1 && sc.y > free.y0 && sc.y < free.y1;
        onScreen.push({ ...c, x: sc.x, y: sc.y, inFree });
      }
      if (!onScreen.length) { found.push({ cpId: cp.id, valid: [] }); continue; }
      let mx = 0, my = 0; for (const c of onScreen) { mx += c.x; my += c.y; } mx /= onScreen.length; my /= onScreen.length;
      onScreen.sort((u, v) => (v.pri - u.pri) || ((v.inFree ? 1 : 0) - (u.inFree ? 1 : 0)) || (Math.hypot(u.x - mx, u.y - my) - Math.hypot(v.x - mx, v.y - my)));
      const valid = [];
      for (let i = 0; i < onScreen.length && i < maxTests && valid.length < 8; i++) {
        const c = onScreen[i];
        const hit = pickCheckpoint(c.x, c.y, group);
        if (hit && hit.checkpointId === cp.id) {
          if (valid.some((v) => Math.hypot(v.x - c.x, v.y - c.y) < 6)) continue;
          valid.push({ pos: hit.point.clone(), x: c.x, y: c.y, inFree: c.inFree });
        }
      }
      found.push({ cpId: cp.id, valid, fallback: onScreen[0] });
      }
    }
    // assign: most constrained checkpoints first, keep rings apart
    const placed = [];
    for (const f of [...found].sort((a, b) => a.valid.length - b.valid.length)) {
      let pick = f.valid.find((v) => placed.every((p) => Math.hypot(p.x - v.x, p.y - v.y) >= sep));
      if (!pick && f.valid.length) {
        let bestD = -1;
        for (const v of f.valid) { let d = 1e9; for (const q of placed) d = Math.min(d, Math.hypot(q.x - v.x, q.y - v.y)); if (d > bestD) { bestD = d; pick = v; } }
      }
      if (pick) placed.push({ cpId: f.cpId, pos: pick.pos, x: pick.x, y: pick.y, resolved: true });
      else if (f.fallback) placed.push({ cpId: f.cpId, pos: f.fallback.p.clone(), x: f.fallback.x, y: f.fallback.y, resolved: false });
    }
    return placed;
  }
  return {
    setMouse, leave, get dirty() { return dirty; }, set dirty(v) { dirty = v; },
    get mouse() { return { x: mx, y: my, inside }; },
    pickWalk, pickCheckpoint, pickPoint, computeAnchors, toScreen,
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
  /** anchors: [{ cpId, pos }] (see computeAnchors). */
  function show(anchors, isLogged, hintsOn) {
    clear();
    for (const a of anchors) {
      const ring = new THREE.Sprite(ringMat); ring.position.copy(a.pos); ring.renderOrder = 999; ring.layers.set(1);
      const badge = new THREE.Sprite(checkMat); badge.position.copy(a.pos); badge.renderOrder = 1000; badge.layers.set(1);
      badge.center.set(-0.35, -0.35); badge.scale.setScalar(0.03);
      group.add(ring); group.add(badge);
      items.push({ cpId: a.cpId, ring, badge, pos: a.pos, resolved: a.resolved });
    }
    update(isLogged, hintsOn);
  }
  const _s = { x: 0, y: 0, front: false };
  /** Ring or badge under the mouse (within `rad` px), so a ring always selects its own checkpoint. */
  function pickAt(x, y, toScreen, rad = 16) {
    let best = null, bd = rad;
    for (const it of items) {
      if (!it.ring.visible && !it.badge.visible) continue;
      toScreen(it.pos, _s);
      if (!_s.front) continue;
      const d = Math.hypot(_s.x - x, _s.y - y);
      if (d < bd) { bd = d; best = it.cpId; }
    }
    return best;
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
  return { show, update, clear, tick, pickAt, group, items, get count() { return items.length; } };
}
