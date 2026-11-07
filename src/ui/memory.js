// UI-only memory for the current inspection (which zone banners were shown, which pop quizzes
// were offered, which room checks were offered). Keyed by inspection id so a new inspection
// starts clean. Separate from the store because none of it affects scoring.
const KEY = 'hous-inspection:ui:v1';

export function createMemory(store) {
  let m;
  try { m = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch { m = {}; }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(m)); } catch { /* private mode */ } };
  function cur() {
    const id = store.inspection.id;
    if (m.insId !== id) { m = { insId: id, zones: [], popped: [], roomChecks: [] }; save(); }
    return m;
  }
  return {
    has(list, v) { return (cur()[list] || []).includes(v); },
    add(list, v) {
      const c = cur();
      c[list] = c[list] || [];
      if (c[list].includes(v)) return false;
      c[list].push(v); save(); return true;
    },
  };
}
