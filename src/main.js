import { createBus } from './core/bus.js';
import { createStore } from './core/store.js';
import { createEngine } from './engine/engine.js';
import { createUI } from './ui/ui.js';
import { auditModels } from './models/audit.js';

const bus = createBus();
const store = createStore(bus);
const engine = createEngine({ container: document.getElementById('world'), bus, store });
const ui = createUI({ root: document.getElementById('ui'), bus, store, engine });

// Debug handle for playtesting from the console / automation.
window.__game = { bus, store, engine, ui };
if (import.meta.env.DEV) setTimeout(() => auditModels(), 1500);
