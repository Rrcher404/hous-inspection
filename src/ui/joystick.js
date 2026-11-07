// On-screen walk stick for touch screens: drag the knob to walk, further to stride out.
// Sends ui:stick {x, y} (each -1..1, y down) to the engine; lifting the finger sends zero.
import { h, append } from './dom.js';

const R = 46; // knob travel in px

export function createJoystick(ctx) {
  const { bus } = ctx;
  const knob = h('div', { class: 'joy-knob' });
  const el = h('div', { class: 'joy', role: 'presentation', 'aria-hidden': 'true', 'data-coach': 'joy' }, h('div', { class: 'joy-ring' }), knob);
  let id = -1, cx = 0, cy = 0, sent = false;

  function send(x, y) {
    if (!x && !y && !sent) return;
    sent = !!(x || y);
    bus.emit('ui:stick', { x, y });
  }
  function place(dx, dy) { knob.style.transform = `translate(${dx}px, ${dy}px)`; }
  function move(e) {
    let dx = e.clientX - cx, dy = e.clientY - cy;
    const d = Math.hypot(dx, dy);
    if (d > R) { dx *= R / d; dy *= R / d; }
    place(dx, dy);
    const dead = d < 6;
    send(dead ? 0 : dx / R, dead ? 0 : dy / R);
  }
  function release() {
    id = -1; el.classList.remove('active'); place(0, 0); send(0, 0);
  }

  el.addEventListener('pointerdown', (e) => {
    if (id !== -1) return;
    e.preventDefault(); e.stopPropagation();
    id = e.pointerId;
    const r = el.getBoundingClientRect();
    cx = r.left + r.width / 2; cy = r.top + r.height / 2;
    try { el.setPointerCapture(id); } catch { /* ignore */ }
    el.classList.add('active');
    move(e);
  });
  el.addEventListener('pointermove', (e) => { if (e.pointerId === id) move(e); });
  el.addEventListener('pointerup', (e) => { if (e.pointerId === id) release(); });
  el.addEventListener('pointercancel', (e) => { if (e.pointerId === id) release(); });
  el.addEventListener('contextmenu', (e) => e.preventDefault());
  bus.on('ui:modal', ({ open }) => { if (open && id !== -1) release(); });
  bus.on('inspect:entered', () => { if (id !== -1) release(); });

  return { el, release };
}
