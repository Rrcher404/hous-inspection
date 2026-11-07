// DEV-only: verify every builder tags every checkpoint in both defect and ok renderings.
import { COMPONENTS } from '../data/manifest.js';
import { buildComponent, BUILDER_IDS } from './index.js';

export function auditModels() {
  const problems = [];
  for (const comp of COMPONENTS) {
    if (!BUILDER_IDS.includes(comp.id)) { problems.push(`${comp.id}: no builder (fallback crate used)`); continue; }
    for (const mode of ['defect', 'ok']) {
      const states = Object.fromEntries(comp.checkpoints.map(cp => [cp.id,
        cp.kind === 'variable' ? mode : cp.kind]));
      const g = buildComponent(comp.id, states);
      const found = new Set();
      let meshes = 0;
      g.traverse(o => { if (o.isMesh) meshes++; if (o.userData.checkpointId) found.add(o.userData.checkpointId); });
      for (const cp of comp.checkpoints) if (!found.has(cp.id)) problems.push(`${comp.id} [${mode}]: checkpoint "${cp.id}" not tagged`);
      if (meshes > 220) problems.push(`${comp.id} [${mode}]: ${meshes} meshes (heavy)`);
    }
  }
  if (problems.length) console.warn(`[audit] ${problems.length} model problems:\n` + problems.join('\n'));
  else console.info('[audit] all models tag all checkpoints ✓');
  window.__auditProblems = problems;
  return problems;
}
