// StaticBatch: collects static geometry by material and merges it into one mesh per
// material (and shadow flag). UVs are in world metres so canvas textures tile at real scale.
import * as THREE from 'three';
import { getMat } from './textures.js';

const _v = new THREE.Vector3(), _n = new THREE.Vector3(), _a = new THREE.Vector3(), _b = new THREE.Vector3();

export class StaticBatch {
  constructor(name) { this.name = name; this.buckets = new Map(); }

  _bucket(mat, cast) {
    const key = mat + '|' + (cast ? 1 : 0);
    let b = this.buckets.get(key);
    if (!b) { b = { mat, cast, p: [], n: [], uv: [] }; this.buckets.set(key, b); }
    return b;
  }

  /** Triangle with explicit UVs; flips winding so the face normal agrees with `want`. */
  tri(mat, p0, p1, p2, uv0, uv1, uv2, want, cast = true) {
    if (!mat) return;
    const b = this._bucket(mat, cast);
    _a.subVectors(p1, p0); _b.subVectors(p2, p0); _n.crossVectors(_a, _b);
    if (_n.lengthSq() < 1e-14) return;
    _n.normalize();
    if (want && _n.dot(want) < 0) { [p1, p2] = [p2, p1]; [uv1, uv2] = [uv2, uv1]; _n.negate(); }
    for (const [p, uv] of [[p0, uv0], [p1, uv1], [p2, uv2]]) {
      b.p.push(p.x, p.y, p.z); b.n.push(_n.x, _n.y, _n.z); b.uv.push(uv[0], uv[1]);
    }
  }

  /** Planar quad a,b,c,d (in order around the edge). UVs projected onto the quad's own axes. */
  quad(mat, a, b, c, d, want, cast = true, uAxis) {
    if (!mat) return;
    a = vec(a); b = vec(b); c = vec(c); d = vec(d);
    const n = new THREE.Vector3().subVectors(b, a).cross(new THREE.Vector3().subVectors(d, a)).normalize();
    if (want && n.dot(want) < 0) n.negate();
    const u = uAxis ? vec(uAxis).normalize() : new THREE.Vector3().subVectors(b, a).normalize();
    const v = new THREE.Vector3().crossVectors(n, u).normalize();
    const uv = (p) => [p.dot(u), p.dot(v)];
    this.tri(mat, a, b, c, uv(a), uv(b), uv(c), n, cast);
    this.tri(mat, a, c, d, uv(a), uv(c), uv(d), n, cast);
  }

  /** Axis-aligned box [x0,x1]×[y0,y1]×[z0,z1]. mats: key | {px,nx,py,ny,pz,nz,def}; null face = skipped. */
  box(x0, y0, z0, x1, y1, z1, mats, cast = true) {
    if (x1 < x0) [x0, x1] = [x1, x0]; if (y1 < y0) [y0, y1] = [y1, y0]; if (z1 < z0) [z0, z1] = [z1, z0];
    if (x1 - x0 < 1e-5 || y1 - y0 < 1e-5 || z1 - z0 < 1e-5) return;
    const m = (f) => (typeof mats === 'string' ? mats : (f in mats ? mats[f] : mats.def));
    const P = (x, y, z) => new THREE.Vector3(x, y, z);
    const face = (mat, a, b, c, d, want, uvf) => {
      if (!mat) return;
      this.tri(mat, a, b, c, uvf(a), uvf(b), uvf(c), want, cast);
      this.tri(mat, a, c, d, uvf(a), uvf(c), uvf(d), want, cast);
    };
    face(m('px'), P(x1, y0, z1), P(x1, y0, z0), P(x1, y1, z0), P(x1, y1, z1), X, (p) => [-p.z, p.y]);
    face(m('nx'), P(x0, y0, z0), P(x0, y0, z1), P(x0, y1, z1), P(x0, y1, z0), NX, (p) => [p.z, p.y]);
    face(m('pz'), P(x0, y0, z1), P(x1, y0, z1), P(x1, y1, z1), P(x0, y1, z1), Z, (p) => [p.x, p.y]);
    face(m('nz'), P(x1, y0, z0), P(x0, y0, z0), P(x0, y1, z0), P(x1, y1, z0), NZ, (p) => [-p.x, p.y]);
    face(m('py'), P(x0, y1, z1), P(x1, y1, z1), P(x1, y1, z0), P(x0, y1, z0), Y, (p) => [p.x, -p.z]);
    face(m('ny'), P(x0, y0, z0), P(x1, y0, z0), P(x1, y0, z1), P(x0, y0, z1), NY, (p) => [p.x, p.z]);
  }

  /** Oriented box: member from point a to point b (arrays), cross-section w×h, `up` hint for the h axis. */
  member(mat, a, b, w, h, up = [0, 1, 0], cast = true) {
    const A = vec(a), B = vec(b);
    const len = A.distanceTo(B);
    const zAxis = new THREE.Vector3().subVectors(B, A).normalize();
    let yAxis = vec(up).sub(zAxis.clone().multiplyScalar(vec(up).dot(zAxis)));
    if (yAxis.lengthSq() < 1e-6) yAxis = new THREE.Vector3(1, 0, 0);
    yAxis.normalize();
    const xAxis = new THREE.Vector3().crossVectors(yAxis, zAxis).normalize();
    const mtx = new THREE.Matrix4().makeBasis(xAxis, yAxis, zAxis).setPosition(A.clone().add(B).multiplyScalar(0.5));
    const g = new THREE.BoxGeometry(w, h, len);
    // metre UVs along the member
    const uv = g.attributes.uv, pos = g.attributes.position;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, pos.getZ(i) + pos.getX(i), pos.getY(i));
    this.geometry(mat, g, mtx, cast);
    g.dispose();
  }

  /** Extruded convex polygon. axis 'x': pts are [z,y], extruded x0→x1. axis 'z': pts [x,y], z0→z1. */
  prism(axis, a0, a1, pts, matLo, matHi, matEdge, cast = true) {
    const mk = axis === 'x' ? (s, p) => new THREE.Vector3(s, p[1], p[0]) : (s, p) => new THREE.Vector3(p[0], p[1], s);
    const contour = pts.map((p) => new THREE.Vector2(p[0], p[1]));
    const tris = THREE.ShapeUtils.triangulateShape(contour, []);
    const wantLo = axis === 'x' ? NX : NZ, wantHi = axis === 'x' ? X : Z;
    const uvOf = axis === 'x' ? (p) => [p.z, p.y] : (p) => [p.x, p.y];
    for (const [i, j, k] of tris) {
      if (matLo) { const A = mk(a0, pts[i]), B = mk(a0, pts[j]), C = mk(a0, pts[k]); this.tri(matLo, A, B, C, uvOf(A), uvOf(B), uvOf(C), wantLo, cast); }
      if (matHi) { const A = mk(a1, pts[i]), B = mk(a1, pts[j]), C = mk(a1, pts[k]); this.tri(matHi, A, B, C, uvOf(A), uvOf(B), uvOf(C), wantHi, cast); }
    }
    if (!matEdge) return;
    const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length, cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i], q = pts[(i + 1) % pts.length];
      const mid = [(p[0] + q[0]) / 2 - cx, (p[1] + q[1]) / 2 - cy];
      const want = axis === 'x' ? new THREE.Vector3(0, mid[1], mid[0]) : new THREE.Vector3(mid[0], mid[1], 0);
      this.quad(matEdge, mk(a0, p), mk(a0, q), mk(a1, q), mk(a1, p), want.normalize(), cast);
    }
  }

  /** Any BufferGeometry, transformed by matrix. UVs taken from the geometry (or zero). */
  geometry(mat, geo, matrix, cast = true) {
    const g = geo.index ? geo.toNonIndexed() : geo.clone();
    if (matrix) g.applyMatrix4(matrix);
    if (!g.attributes.normal) g.computeVertexNormals();
    const b = this._bucket(mat, cast);
    const p = g.attributes.position, n = g.attributes.normal, uv = g.attributes.uv;
    for (let i = 0; i < p.count; i++) {
      b.p.push(p.getX(i), p.getY(i), p.getZ(i));
      b.n.push(n.getX(i), n.getY(i), n.getZ(i));
      if (uv) b.uv.push(uv.getX(i), uv.getY(i)); else b.uv.push(0, 0);
    }
    g.dispose();
  }

  /** Merge everything into meshes under a new Group. */
  build(receive = true) {
    const group = new THREE.Group(); group.name = 'static:' + this.name;
    for (const b of this.buckets.values()) {
      if (!b.p.length) continue;
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(b.p, 3));
      g.setAttribute('normal', new THREE.Float32BufferAttribute(b.n, 3));
      g.setAttribute('uv', new THREE.Float32BufferAttribute(b.uv, 2));
      g.computeBoundingSphere(); g.computeBoundingBox();
      const mesh = new THREE.Mesh(g, getMat(b.mat));
      mesh.name = this.name + ':' + b.mat;
      mesh.castShadow = b.cast; mesh.receiveShadow = receive;
      mesh.matrixAutoUpdate = false; mesh.updateMatrix();
      mesh.userData.static = true;
      group.add(mesh);
    }
    this.buckets.clear();
    return group;
  }
}

const X = new THREE.Vector3(1, 0, 0), NX = new THREE.Vector3(-1, 0, 0);
const Y = new THREE.Vector3(0, 1, 0), NY = new THREE.Vector3(0, -1, 0);
const Z = new THREE.Vector3(0, 0, 1), NZ = new THREE.Vector3(0, 0, -1);
function vec(a) { return a.isVector3 ? a.clone() : new THREE.Vector3(a[0], a[1], a[2]); }
export { vec };
