// First-person walk camera (WASD/arrows + drag-to-look, no pointer lock) and the inspect
// orbit camera. Drag semantics are "grab the world" (like a walkthrough panorama), which
// matches a Mac trackpad; two-finger scroll looks around gently in walk mode and zooms in
// inspect mode. Click vs drag is decided on pointerup (moved < 6 px and < 700 ms).
import * as THREE from 'three';
import { EYE, floorAt, headroomAt } from './layout.js';
import { resolveCollision } from './zones.js';

const LOOK = 0.0042;     // rad per px of drag
const ORBIT = 0.0065;
const RADIUS = 0.22;
const SPEED = { ground: 1.9, roof: 1.2, attic: 1.1, crawl: 0.75 };
const RUN = 2.1;
const smooth = (t) => t * t * (3 - 2 * t);

export function createControls({ camera, dom, store, colliders, reducedMotion, callbacks }) {
  const st = {
    level: 'ground', x: 8.6, z: 19.2, eyeY: 1.0, yaw: 0, pitch: 0,
    vx: 0, vz: 0, bob: 0, mode: 'walk', frozen: false,
  };
  const keys = new Set();
  const ptr = { down: false, id: -1, x: 0, y: 0, sx: 0, sy: 0, t: 0, moved: 0, button: 0, lastX: 0, lastY: 0, inside: false };
  const tween = { active: false, t: 0, dur: 0.6, fromP: new THREE.Vector3(), toP: new THREE.Vector3(), fromQ: new THREE.Quaternion(), toQ: new THREE.Quaternion(), done: null };
  const orbit = { target: new THREE.Vector3(), target0: new THREE.Vector3(), box: new THREE.Box3(), r: 1, theta: 0, phi: 1, theta0: 0, lim: 1.4, rMin: 0.15, rMax: 4, phiMin: 0.12, phiMax: 2.9 };
  let settleTimer = 0;
  const settled = () => { clearTimeout(settleTimer); settleTimer = setTimeout(() => { if (st.mode === 'inspect') callbacks.onOrbitSettled?.(); }, 260); };
  const _e = new THREE.Euler(0, 0, 0, 'YXZ');
  const _v = new THREE.Vector3(), _p = { x: 0, z: 0 };
  let modal = false;

  const sens = () => (store.settings?.mouseSensitivity || 1);
  const typing = (e) => {
    const t = e.target;
    return t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable);
  };

  // ── input ────────────────────────────────────────────────────────────────
  function onDown(e) {
    if (modal) return;
    if (e.button !== 0 && e.button !== 2) return;
    ptr.down = true; ptr.id = e.pointerId; ptr.button = e.button;
    ptr.sx = ptr.lastX = e.clientX; ptr.sy = ptr.lastY = e.clientY; ptr.t = performance.now(); ptr.moved = 0;
    try { dom.setPointerCapture(e.pointerId); } catch { /* ignore */ }
  }
  function onMove(e) {
    ptr.x = e.clientX; ptr.y = e.clientY; ptr.inside = true;
    callbacks.onHoverMove?.(e.clientX, e.clientY);
    if (!ptr.down || modal) return;
    const dx = e.clientX - ptr.lastX, dy = e.clientY - ptr.lastY;
    ptr.lastX = e.clientX; ptr.lastY = e.clientY;
    ptr.moved += Math.abs(dx) + Math.abs(dy);
    if (ptr.moved < 4) return;
    callbacks.onDragState?.(true);
    if (st.mode === 'walk' && !st.frozen) {
      st.yaw += dx * LOOK * sens();
      st.pitch = THREE.MathUtils.clamp(st.pitch + dy * LOOK * sens(), -1.35, 1.35);
    } else if (st.mode === 'inspect') {
      orbit.theta = THREE.MathUtils.clamp(orbit.theta - dx * ORBIT * sens(), orbit.theta0 - orbit.lim, orbit.theta0 + orbit.lim);
      orbit.phi = THREE.MathUtils.clamp(orbit.phi - dy * ORBIT * sens(), orbit.phiMin, orbit.phiMax);
    }
  }
  function onUp(e) {
    if (!ptr.down || e.pointerId !== ptr.id) return;
    ptr.down = false;
    try { dom.releasePointerCapture(e.pointerId); } catch { /* ignore */ }
    callbacks.onDragState?.(false);
    if (ptr.moved >= 6 && st.mode === 'inspect') settled();
    if (modal) return;
    const dt = performance.now() - ptr.t;
    if (ptr.moved < 6 && dt < 700) callbacks.onClick?.(e.clientX, e.clientY, { button: ptr.button, alt: e.altKey, shift: e.shiftKey });
  }
  function onWheel(e) {
    e.preventDefault();
    if (modal) return;
    if (st.mode === 'inspect') {
      let k = Math.exp(e.deltaY * (e.ctrlKey ? 0.01 : 0.0015));
      k = THREE.MathUtils.clamp(orbit.r * k, orbit.rMin, orbit.rMax) / orbit.r; // effective scale after limits
      // zoom about the surface point under the cursor: scaling camera and target about P keeps P
      // fixed on screen (read a lug, a nail, a date stamp). Zooming out drifts back to the framing.
      if (k < 1) { const pt = callbacks.pickPoint?.(e.clientX, e.clientY); if (pt) orbit.target.lerp(pt, 1 - k); }
      else if (k > 1) orbit.target.lerp(orbit.target0, Math.min(1, (k - 1) * 1.2));
      orbit.box.clampPoint(orbit.target, orbit.target);
      orbit.r *= k;
      settled();
    } else if (st.mode === 'walk' && !st.frozen && !e.ctrlKey) {
      st.yaw -= e.deltaX * 0.0022 * sens();
      st.pitch = THREE.MathUtils.clamp(st.pitch - e.deltaY * 0.0016 * sens(), -1.35, 1.35);
    }
  }
  function onKey(e, down) {
    if (typing(e)) return;
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (down) {
      if (modal) return;
      if (k === 'e' && !e.repeat) callbacks.onUseKey?.();
      if (['w', 'a', 's', 'd', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Shift'].includes(k)) {
        keys.add(k);
        if (k.startsWith('Arrow')) e.preventDefault();
      }
    } else keys.delete(k);
    if (e.key === 'Shift') { if (down) keys.add('Shift'); else keys.delete('Shift'); }
  }
  const kd = (e) => onKey(e, true), ku = (e) => onKey(e, false);
  const blur = () => keys.clear();
  const ctx = (e) => e.preventDefault();
  const leave = () => { ptr.inside = false; callbacks.onHoverLeave?.(); };
  dom.addEventListener('pointerdown', onDown);
  dom.addEventListener('pointermove', onMove);
  dom.addEventListener('pointerup', onUp);
  dom.addEventListener('pointercancel', onUp);
  dom.addEventListener('pointerleave', leave);
  dom.addEventListener('wheel', onWheel, { passive: false });
  dom.addEventListener('contextmenu', ctx);
  window.addEventListener('keydown', kd);
  window.addEventListener('keyup', ku);
  window.addEventListener('blur', blur);

  // ── walk ───────────────────────────────────────────────────────────────
  function targetEye(level, x, z) {
    const f = floorAt(level, x, z);
    let e = f + EYE[level];
    const h = headroomAt(level, x, z);
    if (e > h) e = h;
    if (e < f + 0.3) e = f + 0.3;
    return e;
  }
  function walkPose(outP, outQ) {
    outP.set(st.x, st.eyeY + st.bob, st.z);
    _e.set(st.pitch, st.yaw, 0, 'YXZ');
    outQ.setFromEuler(_e);
  }

  let distWalked = 0;
  const moveDir = { x: 0, z: 0 };
  function updateWalk(dt) {
    let f = 0, s = 0, turn = 0;
    if (!st.frozen && !modal) {
      if (keys.has('w') || keys.has('ArrowUp')) f += 1;
      if (keys.has('s') || keys.has('ArrowDown')) f -= 1;
      if (keys.has('d')) s += 1;
      if (keys.has('a')) s -= 1;
      if (keys.has('ArrowLeft')) turn += 1;
      if (keys.has('ArrowRight')) turn -= 1;
    }
    st.yaw += turn * 1.9 * dt;
    const sp = SPEED[st.level] * (keys.has('Shift') ? RUN : 1);
    const len = Math.hypot(f, s) || 1;
    const sy = Math.sin(st.yaw), cy = Math.cos(st.yaw);
    // forward = (-sin yaw, -cos yaw); right = (cos yaw, -sin yaw)
    const wx = ((-sy) * f + cy * s) / len * sp, wz = ((-cy) * f - sy * s) / len * sp;
    const a = 1 - Math.exp(-(f || s ? 11 : 14) * dt);
    st.vx += (wx - st.vx) * a; st.vz += (wz - st.vz) * a;
    if (Math.abs(st.vx) < 1e-4) st.vx = 0; if (Math.abs(st.vz) < 1e-4) st.vz = 0;
    _p.x = st.x + st.vx * dt; _p.z = st.z + st.vz * dt;
    resolveCollision(st.level, _p, RADIUS, colliders);
    const moved = Math.hypot(_p.x - st.x, _p.z - st.z);
    moveDir.x = st.vx; moveDir.z = st.vz;
    st.x = _p.x; st.z = _p.z;
    const te = targetEye(st.level, st.x, st.z);
    const k = 1 - Math.exp(-(te > st.eyeY ? 12 : 16) * dt);
    st.eyeY += (te - st.eyeY) * k;
    if (Math.abs(te - st.eyeY) > 1.2) st.eyeY = te;
    distWalked += moved;
    const bobAmp = reducedMotion || st.level === 'crawl' ? 0 : Math.min(1, Math.hypot(st.vx, st.vz) / 2) * 0.016;
    st.bob += (Math.sin(distWalked * 7.2) * bobAmp - st.bob) * Math.min(1, dt * 10);
    walkPose(camera.position, camera.quaternion);
  }

  // ── tween + orbit ───────────────────────────────────────────────────────────
  function startTween(toP, toQ, dur, done) {
    tween.fromP.copy(camera.position); tween.fromQ.copy(camera.quaternion);
    tween.toP.copy(toP); tween.toQ.copy(toQ);
    tween.t = 0; tween.dur = reducedMotion ? Math.min(dur, 0.2) : dur; tween.active = true; tween.done = done;
  }
  function updateTween(dt) {
    tween.t += dt / tween.dur;
    const t = smooth(Math.min(1, tween.t));
    camera.position.lerpVectors(tween.fromP, tween.toP, t);
    camera.quaternion.slerpQuaternions(tween.fromQ, tween.toQ, t);
    if (tween.t >= 1) { tween.active = false; const d = tween.done; tween.done = null; d?.(); }
  }
  function orbitPose(outP) {
    const sp = Math.sin(orbit.phi);
    outP.set(orbit.target.x + orbit.r * sp * Math.sin(orbit.theta), orbit.target.y + orbit.r * Math.cos(orbit.phi), orbit.target.z + orbit.r * sp * Math.cos(orbit.theta));
  }
  const _m = new THREE.Matrix4(), _up = new THREE.Vector3(0, 1, 0);
  function lookQuat(from, to, outQ) {
    _m.lookAt(from, to, _up); outQ.setFromRotationMatrix(_m);
  }
  function updateOrbit() {
    orbitPose(camera.position);
    lookQuat(camera.position, orbit.target, camera.quaternion);
  }

  // ── API ─────────────────────────────────────────────────────────────────
  const api = {
    state: st,
    get mode() { return st.mode; },
    get tweenT() { return tween.active ? Math.min(1, tween.t) : 1; },
    get tweening() { return tween.active; },
    get moving() { return Math.hypot(st.vx, st.vz) > 0.15; },
    moveDir,
    setModal(v) { modal = v; if (v) { keys.clear(); ptr.down = false; } },
    setPose(p) {
      if (!p || (p.level && !(p.level in EYE)) || !Number.isFinite(p.x) || !Number.isFinite(p.z)) { console.warn('[engine] setPose ignored (bad pose)', p); return false; }
      st.level = p.level || st.level; st.x = p.x; st.z = p.z;
      st.yaw = p.yaw ?? st.yaw; st.pitch = p.pitch ?? 0; st.vx = st.vz = 0; st.bob = 0;
      st.eyeY = targetEye(st.level, st.x, st.z);
      walkPose(camera.position, camera.quaternion);
    },
    getPose() { return { level: st.level, x: st.x, z: st.z, yaw: st.yaw, pitch: st.pitch, eyeY: st.eyeY }; },
    freeze(v) { st.frozen = v; if (v) { st.vx = st.vz = 0; } },
    /** Ease into an orbit around target, starting from camera pose `frame`. */
    beginInspect({ target, framePos, lim, rMin, rMax, phiMin, phiMax, box }, onArrive) {
      st.mode = 'toInspect'; st.vx = st.vz = 0; keys.clear();
      orbit.target.copy(target); orbit.target0.copy(target);
      orbit.box.copy(box || new THREE.Box3(target, target)).expandByScalar(0.1);
      _v.subVectors(framePos, target);
      orbit.r = _v.length();
      orbit.theta = orbit.theta0 = Math.atan2(_v.x, _v.z);
      orbit.phi = Math.acos(THREE.MathUtils.clamp(_v.y / orbit.r, -1, 1));
      orbit.lim = lim; orbit.rMin = Math.min(rMin, 0.15); orbit.rMax = rMax; orbit.phiMin = phiMin; orbit.phiMax = phiMax;
      const q = new THREE.Quaternion(); lookQuat(framePos, target, q);
      startTween(framePos, q, 0.6, () => { st.mode = 'inspect'; onArrive?.(); });
    },
    endInspect(onDone, instant = false) {
      const p = new THREE.Vector3(), q = new THREE.Quaternion();
      walkPose(p, q);
      if (instant) { camera.position.copy(p); camera.quaternion.copy(q); st.mode = 'walk'; tween.active = false; onDone?.(); return; }
      st.mode = 'toWalk';
      startTween(p, q, 0.5, () => { st.mode = 'walk'; onDone?.(); });
    },
    update(dt) {
      if (tween.active) { updateTween(dt); return; }
      if (st.mode === 'walk') updateWalk(dt);
      else if (st.mode === 'inspect') updateOrbit();
    },
    pointer: ptr,
    dispose() {
      dom.removeEventListener('pointerdown', onDown); dom.removeEventListener('pointermove', onMove);
      dom.removeEventListener('pointerup', onUp); dom.removeEventListener('pointercancel', onUp);
      dom.removeEventListener('pointerleave', leave);
      dom.removeEventListener('wheel', onWheel); dom.removeEventListener('contextmenu', ctx);
      window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku); window.removeEventListener('blur', blur);
    },
  };
  return api;
}
