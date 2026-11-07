// Tiny pub/sub. Every module talks through this; nobody imports another module's internals.
// Event catalogue lives in CONTEXT.md §Events.

export function createBus() {
  const map = new Map();
  return {
    on(evt, fn) {
      if (!map.has(evt)) map.set(evt, new Set());
      map.get(evt).add(fn);
      return () => map.get(evt)?.delete(fn);
    },
    once(evt, fn) {
      const off = this.on(evt, (p) => { off(); fn(p); });
      return off;
    },
    emit(evt, payload) {
      if (import.meta.env?.DEV && window.__BUS_DEBUG) console.debug('[bus]', evt, payload);
      map.get(evt)?.forEach(fn => {
        try { fn(payload); } catch (err) { console.error(`[bus] handler for "${evt}" threw`, err); }
      });
    },
  };
}
