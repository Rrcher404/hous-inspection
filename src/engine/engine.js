// OWNER: Kaz. Placeholder so the app boots before the engine lands.
export function createEngine({ bus }) { setTimeout(() => bus.emit('engine:ready', {}), 0); return { goToZone() {}, openComponent() {}, exitInspect() {}, rebuild() {}, getZone: () => 'exterior' }; }
