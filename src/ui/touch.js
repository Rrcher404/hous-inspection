// Touch mode: true on phones and tablets (a coarse pointer), and flips on for good the first
// time a finger touches the screen (a touch laptop). It drives the on-screen stick, the
// phone layout (.touch on the UI root) and the wording ("tap", "pinch") in the copy.
let on = false;
try { on = matchMedia('(any-pointer: coarse)').matches && !matchMedia('(any-pointer: fine)').matches; } catch { /* old browser */ }
const subs = new Set();

export const isTouch = () => on;
export function onTouchMode(fn) { subs.add(fn); if (on) fn(true); return () => subs.delete(fn); }

window.addEventListener('pointerdown', (e) => {
  if (on || e.pointerType !== 'touch') return;
  on = true;
  subs.forEach((fn) => fn(true));
}, { capture: true, passive: true });

/** Pick the keyboard or the touch wording. */
export const say = (keyboard, touch) => (on ? touch : keyboard);
