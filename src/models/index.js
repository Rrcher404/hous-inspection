// Merges the two builder libraries and supplies a fallback so a missing model never
// crashes the house: it renders a labelled crate with every checkpoint tagged.
import { COMPONENTS } from '../data/manifest.js';
import { builders as outside } from './outside.js';
import { builders as inside } from './inside.js';
import { box, tag, group, C } from './kit.js';

const all = { ...outside, ...inside };

function fallback(comp) {
  const g = group(comp.id + ':fallback');
  const [w, h, d] = comp.size;
  const body = box(Math.max(w, 0.2), Math.max(h, 0.2), Math.max(d, 0.2), C.steel, [0, Math.max(h, 0.2) / 2, Math.max(d, 0.2) / 2]);
  g.add(body);
  comp.checkpoints.forEach((cp, i) => {
    const s = 0.12;
    const m = box(s, s, s, C.amber, [(-w / 2) + s + i * (s * 1.6), Math.max(h, 0.2) + s, d / 2]);
    tag(m, cp.id); g.add(m);
  });
  return g;
}

/** Build the THREE.Group for a component given the inspection's checkpoint states. */
export function buildComponent(componentId, states) {
  const comp = COMPONENTS.find(c => c.id === componentId);
  const fn = all[componentId];
  let g;
  try { g = fn ? fn(states, comp) : fallback(comp); }
  catch (err) { console.error('[models] builder failed for', componentId, err); g = fallback(comp); }
  g.userData.componentId = componentId;
  g.traverse(o => { o.userData.componentId = componentId; });
  return g;
}

export const BUILDER_IDS = Object.keys(all);
