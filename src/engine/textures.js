// Procedural canvas textures + the cached static-material palette for the house shell.
// No image files: everything is painted into canvases at boot (~20 small canvases).
import * as THREE from 'three';

let seed = 1337;
const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
const rr = (a, b) => a + (b - a) * rnd();

let maxAniso = 4;
export function setMaxAnisotropy(n) { maxAniso = Math.max(1, Math.min(8, n)); }

function canvas(w, h, draw) {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  const g = cv.getContext('2d');
  draw(g, w, h);
  return cv;
}
/** Texture whose image covers `metresU` × `metresV` of surface (geometry UVs are in metres). */
function tex(cv, metresU, metresV, { srgb = true } = {}) {
  const t = new THREE.CanvasTexture(cv);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(1 / metresU, 1 / metresV);
  t.anisotropy = maxAniso;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function noise(g, w, h, amt, alpha = 0.08, size = 1) {
  for (let i = 0; i < amt; i++) {
    const v = rnd() < 0.5 ? 0 : 255;
    g.fillStyle = `rgba(${v},${v},${v},${alpha * rnd()})`;
    g.fillRect(rnd() * w, rnd() * h, size, size);
  }
}
const shade = (hex, k) => {
  const c = new THREE.Color(hex); c.offsetHSL(0, 0, k); return '#' + c.getHexString();
};

// ── Painters ────────────────────────────────────────────────────────────────
function woodFloor(base = '#9a6a3f') {
  return canvas(512, 512, (g, w, h) => {
    const rows = 8, rh = h / rows;
    for (let r = 0; r < rows; r++) {
      let x = -rnd() * 300;
      while (x < w) {
        const len = rr(180, 420);
        g.fillStyle = shade(base, rr(-0.07, 0.06));
        g.fillRect(x, r * rh, len, rh);
        for (let s = 0; s < 14; s++) {
          g.strokeStyle = `rgba(60,35,15,${rr(0.05, 0.16)})`; g.lineWidth = rr(0.5, 1.6);
          const y = r * rh + rr(2, rh - 2);
          g.beginPath(); g.moveTo(x, y);
          g.bezierCurveTo(x + len * 0.3, y + rr(-3, 3), x + len * 0.6, y + rr(-3, 3), x + len, y + rr(-2, 2)); g.stroke();
        }
        g.fillStyle = 'rgba(30,18,8,0.55)'; g.fillRect(x, r * rh, 1.5, rh);
        x += len;
      }
      g.fillStyle = 'rgba(30,18,8,0.5)'; g.fillRect(0, r * rh, w, 1.5);
    }
    noise(g, w, h, 3000, 0.06);
  });
}
function tiles(a = '#d8cfbd', grout = '#9c9488', n = 4) {
  return canvas(512, 512, (g, w, h) => {
    g.fillStyle = grout; g.fillRect(0, 0, w, h);
    const s = w / n;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      g.fillStyle = shade(a, rr(-0.035, 0.03));
      g.fillRect(i * s + 3, j * s + 3, s - 6, s - 6);
      const grd = g.createLinearGradient(i * s, j * s, i * s + s, j * s + s);
      grd.addColorStop(0, 'rgba(255,255,255,0.10)'); grd.addColorStop(1, 'rgba(0,0,0,0.06)');
      g.fillStyle = grd; g.fillRect(i * s + 3, j * s + 3, s - 6, s - 6);
    }
    noise(g, w, h, 2500, 0.05);
  });
}
function carpet(base) {
  return canvas(256, 256, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    noise(g, w, h, 14000, 0.12, 1.5);
  });
}
function siding(base = '#d9d3c4') {
  return canvas(256, 512, (g, w, h) => {
    const laps = 10, lh = h / laps; // 0.1 m exposure (double-4 vinyl)
    for (let i = 0; i < laps; i++) {
      const y = i * lh;
      const grd = g.createLinearGradient(0, y, 0, y + lh);
      grd.addColorStop(0, shade(base, 0.04)); grd.addColorStop(0.85, shade(base, -0.01)); grd.addColorStop(1, shade(base, -0.12));
      g.fillStyle = grd; g.fillRect(0, y, w, lh);
      g.fillStyle = 'rgba(0,0,0,0.28)'; g.fillRect(0, y + lh - 2, w, 2);
      for (let s = 0; s < 10; s++) {
        g.fillStyle = `rgba(0,0,0,${rr(0.01, 0.035)})`; g.fillRect(0, y + rr(2, lh - 6), w, 1);
      }
    }
  });
}
function shingles(base = '#4d4e55') {
  return canvas(512, 512, (g, w, h) => {
    const rows = 7, rh = h / rows, tabs = 3, tw = w / tabs;
    for (let r = 0; r < rows; r++) {
      const off = (r % 2) * tw * 0.5;
      for (let t = -1; t <= tabs; t++) {
        g.fillStyle = shade(base, rr(-0.06, 0.05));
        g.fillRect(t * tw + off, r * rh, tw, rh);
        g.fillStyle = 'rgba(0,0,0,0.5)'; g.fillRect(t * tw + off, r * rh, 2, rh * 0.95);
      }
      const grd = g.createLinearGradient(0, r * rh, 0, r * rh + rh);
      grd.addColorStop(0, 'rgba(0,0,0,0.25)'); grd.addColorStop(0.25, 'rgba(0,0,0,0)');
      grd.addColorStop(0.92, 'rgba(0,0,0,0)'); grd.addColorStop(1, 'rgba(0,0,0,0.45)');
      g.fillStyle = grd; g.fillRect(0, r * rh, w, rh);
    }
    noise(g, w, h, 26000, 0.2, 1.2);
  });
}
function masonry(unitW, unitH, cols, rows, base, mortar, jitter = 0.06) {
  return canvas(512, Math.round(512 * (rows * unitH) / (cols * unitW)), (g, w, h) => {
    g.fillStyle = mortar; g.fillRect(0, 0, w, h);
    const bw = w / cols, bh = h / rows, m = Math.max(2, bw * 0.05);
    for (let r = 0; r < rows; r++) {
      const off = (r % 2) * bw * 0.5;
      for (let c = -1; c <= cols; c++) {
        g.fillStyle = shade(base, rr(-jitter, jitter));
        g.fillRect(c * bw + off + m / 2, r * bh + m / 2, bw - m, bh - m);
      }
    }
    noise(g, w, h, 9000, 0.12, 1.4);
  });
}
function concrete(base = '#b5b1a8', spots = 0.08) {
  return canvas(512, 512, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 40; i++) {
      const cx = rr(0, w), cy = rr(0, h), r = rr(30, 140);
      const grd = g.createRadialGradient(cx, cy, 0, cx, cy, r);
      grd.addColorStop(0, `rgba(0,0,0,${rr(0, spots)})`); grd.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = grd; g.fillRect(cx - r, cy - r, r * 2, r * 2);
    }
    noise(g, w, h, 30000, 0.12);
  });
}
function dirt() {
  return canvas(512, 512, (g, w, h) => {
    g.fillStyle = '#5e4630'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 60; i++) {
      const x = rr(0, w), y = rr(0, h), r = rr(20, 90);
      const grd = g.createRadialGradient(x, y, 0, x, y, r);
      grd.addColorStop(0, rnd() < 0.5 ? 'rgba(40,28,18,0.35)' : 'rgba(120,96,70,0.25)'); grd.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = grd; g.fillRect(x - r, y - r, r * 2, r * 2);
    }
    for (let i = 0; i < 500; i++) {
      g.fillStyle = `rgba(${rr(110, 170)},${rr(100, 150)},${rr(80, 120)},${rr(0.3, 0.8)})`;
      g.beginPath(); g.ellipse(rr(0, w), rr(0, h), rr(1, 4), rr(1, 3), rr(0, 3), 0, 6.3); g.fill();
    }
    noise(g, w, h, 30000, 0.15);
  });
}
function grass() {
  return canvas(512, 512, (g, w, h) => {
    g.fillStyle = '#5b8a3a'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 18000; i++) {
      g.strokeStyle = `hsla(${rr(78, 105)},${rr(30, 55)}%,${rr(22, 46)}%,0.55)`;
      const x = rr(0, w), y = rr(0, h);
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + rr(-2, 2), y - rr(3, 8)); g.stroke();
    }
  });
}
function osb() {
  return canvas(512, 512, (g, w, h) => {
    g.fillStyle = '#b48a55'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 1600; i++) {
      g.save(); g.translate(rr(0, w), rr(0, h)); g.rotate(rr(-0.5, 0.5) + (rnd() < 0.5 ? 0 : Math.PI / 2));
      g.fillStyle = `hsl(${rr(28, 40)},${rr(35, 55)}%,${rr(38, 62)}%)`;
      g.fillRect(-rr(8, 22), -rr(2, 5), rr(16, 44), rr(4, 10)); g.restore();
    }
    g.fillStyle = 'rgba(40,25,10,0.5)'; g.fillRect(0, 0, w, 2); g.fillRect(0, 0, 2, h);
  });
}
function insulation() {
  return canvas(256, 256, (g, w, h) => {
    g.fillStyle = '#d9b97a'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 700; i++) {
      const x = rr(0, w), y = rr(0, h), r = rr(4, 18);
      const grd = g.createRadialGradient(x, y, 0, x, y, r);
      grd.addColorStop(0, rnd() < 0.5 ? 'rgba(255,240,200,0.35)' : 'rgba(120,90,40,0.25)'); grd.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = grd; g.fillRect(x - r, y - r, r * 2, r * 2);
    }
    noise(g, w, h, 9000, 0.18);
  });
}
function boards(base, n, gap = 3, vertical = false) {
  return canvas(512, 512, (g, w, h) => {
    const s = (vertical ? w : h) / n;
    for (let i = 0; i < n; i++) {
      g.fillStyle = shade(base, rr(-0.06, 0.05));
      if (vertical) g.fillRect(i * s, 0, s - gap, h); else g.fillRect(0, i * s, w, s - gap);
      for (let k = 0; k < 10; k++) {
        g.fillStyle = `rgba(50,30,15,${rr(0.04, 0.12)})`;
        if (vertical) g.fillRect(i * s + rr(0, s - gap), 0, 1, h); else g.fillRect(0, i * s + rr(0, s - gap), w, 1);
      }
    }
    g.fillStyle = 'rgba(20,12,6,0.85)';
    for (let i = 0; i < n; i++) { if (vertical) g.fillRect(i * s + s - gap, 0, gap, h); else g.fillRect(0, i * s + s - gap, w, gap); }
    noise(g, w, h, 6000, 0.07);
  });
}
function plain(base, amt = 6000, a = 0.05) {
  return canvas(256, 256, (g, w, h) => { g.fillStyle = base; g.fillRect(0, 0, w, h); noise(g, w, h, amt, a, 1.5); });
}
function soffit() {
  return canvas(256, 256, (g, w, h) => {
    g.fillStyle = '#ece9e0'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 8; i++) {
      g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(i * 32, 0, 2, h);
      for (let y = 6; y < h; y += 8) { g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(i * 32 + 10, y, 12, 2); }
    }
  });
}
function asphalt() {
  return canvas(512, 512, (g, w, h) => { g.fillStyle = '#3b3c3e'; g.fillRect(0, 0, w, h); noise(g, w, h, 60000, 0.25, 1.3); });
}
function sixPanelDoor(base = '#f1efe8') {
  return canvas(256, 512, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    const panel = (x, y, pw, ph) => {
      g.fillStyle = 'rgba(0,0,0,0.13)'; g.fillRect(x, y, pw, ph);
      g.fillStyle = base; g.fillRect(x + 5, y + 5, pw - 10, ph - 10);
      g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(x, y, pw, 3);
    };
    const m = 28, gw = (w - m * 3) / 2;
    panel(m, 30, gw, 70); panel(m * 2 + gw, 30, gw, 70);
    panel(m, 130, gw, 160); panel(m * 2 + gw, 130, gw, 160);
    panel(m, 320, gw, 160); panel(m * 2 + gw, 320, gw, 160);
    noise(g, w, h, 2000, 0.03);
  });
}
function louver() {
  return canvas(256, 256, (g, w, h) => {
    g.fillStyle = '#f0eee7'; g.fillRect(0, 0, w, h);
    for (let y = 20; y < h - 20; y += 18) {
      g.fillStyle = '#2b2b2b'; g.fillRect(24, y, w - 48, 10);
      g.fillStyle = '#d8d5cc'; g.fillRect(24, y + 10, w - 48, 6);
    }
  });
}
function grille(base = '#ddd', slot = '#222') {
  return canvas(128, 64, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    for (let x = 8; x < w - 8; x += 10) { g.fillStyle = slot; g.fillRect(x, 8, 5, h - 16); }
  });
}
function houseNumber() {
  return canvas(256, 96, (g, w, h) => {
    g.fillStyle = '#20232a'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#c9a646'; g.lineWidth = 4; g.strokeRect(6, 6, w - 12, h - 12);
    g.fillStyle = '#e8d9a8'; g.font = 'bold 64px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('417', w / 2, h / 2 + 3);
  });
}

// ── Static materials (cached) ────────────────────────────────────────────────
const M = new Map();
const T = {};
function std(color, o = {}) { return new THREE.MeshStandardMaterial({ color, roughness: 0.88, metalness: 0, ...o }); }

export function initMaterials() {
  if (M.size) return M;
  T.wood = tex(woodFloor('#9c6b3e'), 1.4, 1.12);
  T.tileK = tex(tiles('#d9cfb8', '#a49a88', 4), 1.2, 1.2);
  T.tileB = tex(tiles('#e9ebe8', '#b9bdb9', 6), 0.9, 0.9);
  T.tileL = tex(tiles('#cfc8bb', '#9a9387', 3), 0.9, 0.9);
  T.carpetP = tex(carpet('#9a8f7e'), 0.8, 0.8);
  T.carpet2 = tex(carpet('#7d8a96'), 0.8, 0.8);
  T.siding = tex(siding('#d8d2c2'), 1.0, 1.0);
  T.shingle = tex(shingles('#4c4d54'), 1.0, 0.98);
  T.shingleG = tex(shingles('#55545a'), 1.0, 0.98);
  T.brick = tex(masonry(0.2, 0.0675, 5, 8, '#9a4a35', '#b4ab9b', 0.09), 1.0, 0.54);
  T.block = tex(masonry(0.4, 0.2, 4, 4, '#a7a49c', '#8f8b83', 0.04), 1.6, 0.8);
  T.blockParge = tex(concrete('#a9a59c', 0.05), 2.0, 2.0);
  T.concrete = tex(concrete('#b7b3aa'), 3, 3);
  T.slab = tex(concrete('#a9a69f', 0.12), 3, 3);
  T.dirt = tex(dirt(), 2.2, 2.2);
  T.grass = tex(grass(), 2.6, 2.6);
  T.osb = tex(osb(), 1.22, 1.22);
  T.insul = tex(insulation(), 0.9, 0.9);
  T.deck = tex(boards('#8f8458', 8, 4), 1.4, 1.12);
  T.fence = tex(boards('#a98b62', 6, 2, true), 0.84, 1.8);
  T.drywall = tex(plain('#ffffff', 5000, 0.035), 1.5, 1.5);
  T.soffit = tex(soffit(), 0.8, 0.8);
  T.asphalt = tex(asphalt(), 3, 3);
  T.lumber = tex(boards('#c49a64', 4, 1), 0.6, 0.6);
  T.door = new THREE.CanvasTexture(sixPanelDoor()); T.door.colorSpace = THREE.SRGBColorSpace;
  T.doorRed = new THREE.CanvasTexture(sixPanelDoor('#8e2a26')); T.doorRed.colorSpace = THREE.SRGBColorSpace;
  T.louver = new THREE.CanvasTexture(louver()); T.louver.colorSpace = THREE.SRGBColorSpace;
  T.grille = new THREE.CanvasTexture(grille('#e8e6df', '#30302e')); T.grille.colorSpace = THREE.SRGBColorSpace;
  T.vent = new THREE.CanvasTexture(grille('#5a5a58', '#111')); T.vent.colorSpace = THREE.SRGBColorSpace;
  T.number = new THREE.CanvasTexture(houseNumber()); T.number.colorSpace = THREE.SRGBColorSpace;

  const paint = (c) => std(c, { map: T.drywall, roughness: 0.92 });
  const add = (k, m) => { m.name = k; M.set(k, m); };
  // floors
  add('wood', std('#ffffff', { map: T.wood, roughness: 0.55 }));
  add('tileK', std('#ffffff', { map: T.tileK, roughness: 0.4 }));
  add('tileB', std('#ffffff', { map: T.tileB, roughness: 0.35 }));
  add('tileL', std('#ffffff', { map: T.tileL, roughness: 0.5 }));
  add('carpetP', std('#ffffff', { map: T.carpetP, roughness: 1 }));
  add('carpet2', std('#ffffff', { map: T.carpet2, roughness: 1 }));
  // paints
  add('p_kitchen', paint('#efe5cb')); add('p_living', paint('#e7ddcb')); add('p_hall', paint('#ece6da'));
  add('p_bath', paint('#d6e2e3')); add('p_primary', paint('#dde2d3')); add('p_bed2', paint('#ece7dc'));
  add('p_laundry', paint('#ecebe3')); add('p_garage', paint('#e6e3dc')); add('ceiling', paint('#f6f4ef'));
  add('trim', std('#f4f2ec', { roughness: 0.6 }));
  // exterior
  add('siding', std('#ffffff', { map: T.siding, roughness: 0.75 }));
  add('sidingG', std('#e9e6dc', { map: T.siding, roughness: 0.75 }));
  add('shingle', std('#ffffff', { map: T.shingle, roughness: 0.95 }));
  add('shingleG', std('#ffffff', { map: T.shingleG, roughness: 0.95 }));
  add('ridgecap', std('#3e3f45', { roughness: 0.95 }));
  add('brick', std('#ffffff', { map: T.brick, roughness: 0.92 }));
  add('block', std('#ffffff', { map: T.block, roughness: 0.95 }));
  add('parge', std('#ffffff', { map: T.blockParge, roughness: 0.95 }));
  add('concrete', std('#ffffff', { map: T.concrete, roughness: 0.92 }));
  add('slab', std('#ffffff', { map: T.slab, roughness: 0.9 }));
  add('dirt', std('#ffffff', { map: T.dirt, roughness: 1 }));
  add('grass', std('#ffffff', { map: T.grass, roughness: 1, vertexColors: true }));
  add('mulch', std('#5a3b24', { map: T.dirt, roughness: 1 }));
  add('osb', std('#ffffff', { map: T.osb, roughness: 0.95 }));
  add('insul', std('#ffffff', { map: T.insul, roughness: 1 }));
  add('lumber', std('#ffffff', { map: T.lumber, roughness: 0.9 }));
  add('deck', std('#ffffff', { map: T.deck, roughness: 0.9 }));
  add('fence', std('#ffffff', { map: T.fence, roughness: 0.95 }));
  add('soffit', std('#ffffff', { map: T.soffit, roughness: 0.8 }));
  add('asphalt', std('#ffffff', { map: T.asphalt, roughness: 0.95, polygonOffset: true, polygonOffsetFactor: -1 }));
  add('gutter', std('#f1efe9', { roughness: 0.5, metalness: 0.1 }));
  add('shutter', std('#23272b', { roughness: 0.7 }));
  add('glass', std('#9fbccc', { roughness: 0.05, metalness: 0.2, transparent: true, opacity: 0.28, depthWrite: false }));
  add('frame', std('#f5f4f0', { roughness: 0.5 }));
  add('door', std('#ffffff', { map: T.door, roughness: 0.6 }));
  add('doorRed', std('#ffffff', { map: T.doorRed, roughness: 0.5 }));
  add('louver', std('#ffffff', { map: T.louver, roughness: 0.8 }));
  add('grille', std('#ffffff', { map: T.grille, roughness: 0.6 }));
  add('fvent', std('#ffffff', { map: T.vent, roughness: 0.8 }));
  add('number', std('#ffffff', { map: T.number, roughness: 0.5 }));
  add('metal', std('#9aa1a8', { roughness: 0.45, metalness: 0.6 }));
  add('darkmetal', std('#3a3d42', { roughness: 0.5, metalness: 0.5 }));
  add('black', std('#1d1e21', { roughness: 0.7 }));
  add('ductMetal', std('#b9bec3', { roughness: 0.35, metalness: 0.7 }));
  add('flex', std('#c9c6bd', { roughness: 0.6, metalness: 0.2 }));
  add('plastic', std('#aeb6b8', { roughness: 0.3, metalness: 0.05, transparent: true, opacity: 0.55, depthWrite: false }));
  add('pvc', std('#f1f1ec', { roughness: 0.5 }));
  add('copper', std('#c27a45', { roughness: 0.35, metalness: 0.8 }));
  add('romex', std('#e9dfc5', { roughness: 0.7 }));
  // lights / glows
  add('bulb', new THREE.MeshStandardMaterial({ color: '#fff6e0', emissive: '#ffe7b8', emissiveIntensity: 1.4, roughness: 0.4 }));
  add('daylight', new THREE.MeshBasicMaterial({ color: '#cfe0ff', fog: false }));
  add('daylightDim', new THREE.MeshBasicMaterial({ color: '#4d5a6e', fog: false }));
  add('glowWarm', new THREE.MeshBasicMaterial({ color: '#5a4a35', fog: false }));
  // furniture / foliage
  add('fabBlue', std('#4b5f7a', { roughness: 1 })); add('fabTan', std('#b49e7f', { roughness: 1 }));
  add('fabGreen', std('#5d6e52', { roughness: 1 })); add('fabCream', std('#e7dfcf', { roughness: 1 }));
  add('fabRust', std('#8e4f37', { roughness: 1 })); add('bedding', std('#eae6dc', { roughness: 1 }));
  add('rug', std('#7b3f35', { map: T.carpetP, roughness: 1 }));
  add('woodMed', std('#8a5a33', { map: T.lumber, roughness: 0.7 })); add('woodDark', std('#5b3a22', { map: T.lumber, roughness: 0.65 }));
  add('woodLight', std('#c8a273', { map: T.lumber, roughness: 0.7 }));
  add('cabinet', std('#c9a77c', { map: T.lumber, roughness: 0.6 }));
  add('counter', std('#d6d0c4', { map: T.blockParge, roughness: 0.35 }));
  add('appWhite', std('#efefec', { roughness: 0.35, metalness: 0.1 }));
  add('mirror', std('#b9c7cf', { roughness: 0.12, metalness: 0.25 })); // no env map: a full metal mirror would render black
  add('bark', std('#5b4636', { roughness: 1 })); add('pineBark', std('#6b4a35', { roughness: 1 }));
  add('leaf', std('#3e6b2e', { roughness: 1, flatShading: true })); add('leafDark', std('#2f5426', { roughness: 1, flatShading: true }));
  add('needle', std('#35592d', { roughness: 1, flatShading: true })); add('shrub', std('#3d6230', { roughness: 1, flatShading: true }));
  add('azalea', std('#4f6e36', { roughness: 1, flatShading: true }));
  add('plasticRed', std('#a8352c', { roughness: 0.5 })); add('plasticGreen', std('#35663d', { roughness: 0.5 }));
  add('box', std('#b08d5e', { roughness: 0.95 }));
  return M;
}

export function getMat(key) {
  const m = M.get(key);
  if (!m) throw new Error('[engine] unknown static material ' + key);
  return m;
}

/** Radial glow / ring textures for sprites. */
export function ringTexture(color = '#f2803a') {
  const cv = canvas(128, 128, (g, w, h) => {
    g.strokeStyle = color; g.lineWidth = 9; g.beginPath(); g.arc(w / 2, h / 2, 44, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,0.9)'; g.lineWidth = 3; g.beginPath(); g.arc(w / 2, h / 2, 50, 0, Math.PI * 2); g.stroke();
    g.fillStyle = color; g.beginPath(); g.arc(w / 2, h / 2, 9, 0, Math.PI * 2); g.fill();
  });
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
}
export function checkTexture() {
  const cv = canvas(96, 96, (g, w, h) => {
    g.fillStyle = '#3fb67a'; g.beginPath(); g.arc(w / 2, h / 2, 40, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#fff'; g.lineWidth = 6; g.beginPath(); g.arc(w / 2, h / 2, 40, 0, Math.PI * 2); g.stroke();
    g.lineWidth = 10; g.lineCap = 'round'; g.lineJoin = 'round';
    g.beginPath(); g.moveTo(28, 50); g.lineTo(42, 64); g.lineTo(68, 34); g.stroke();
  });
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
}
export function glowTexture() {
  const cv = canvas(128, 128, (g, w, h) => {
    const grd = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    grd.addColorStop(0, 'rgba(255,250,235,1)'); grd.addColorStop(0.2, 'rgba(255,240,200,0.8)'); grd.addColorStop(1, 'rgba(255,230,180,0)');
    g.fillStyle = grd; g.fillRect(0, 0, w, h);
  });
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
}
