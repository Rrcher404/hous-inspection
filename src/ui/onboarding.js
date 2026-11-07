// First-run coach marks: five steps, each finishes itself when you do the thing. Never modal:
// you need your hands free to try it. Skippable; remembered in settings.onboarded.
import { h, clear, append } from './dom.js';
import { icon } from './icons.js';
import { isTouch, say } from './touch.js';

// Each step has keyboard copy and touch copy; `body`/`keys`/`target` may be functions of touch mode.
const STEPS = [
  { id: 'move', title: 'Walk around',
    body: () => say('Use W A S D or the arrow keys to walk. Hold Shift to walk faster.', 'Drag the round stick at the bottom left to walk. Push it all the way to stride out.'),
    keys: () => (isTouch() ? null : ['W', 'A', 'S', 'D']), target: () => (isTouch() ? '[data-coach="joy"]' : null) },
  { id: 'look', title: 'Look around',
    body: () => say('Press and drag anywhere on the view to turn your head. On a trackpad: click, hold, and slide.', 'Drag one finger anywhere on the view to turn your head.'), target: null },
  { id: 'open', title: 'Inspect something',
    body: () => say('Move your pointer over things. When one lifts and shows its name, click it to get up close.', 'Tap something to get up close. Tapping a door, hatch, or ladder takes you through it; press and hold to inspect it instead.'), target: null },
  { id: 'log', title: 'Make your first call',
    body: () => say('Up close, click a part of it, or pick it from the list on the right. Read what you observe, then choose how serious it is and who to refer.', 'Up close, tap a part of it, or pick it from the list. Pinch to zoom. Then choose how serious it is and who to refer.'), target: '.inspect' },
  { id: 'tools', title: 'Reach for a tool',
    body: () => say('Some things only a tool can tell you. Press 1 to 5 or click the belt. In the attic and crawlspace, the flashlight (2) is a must. Press M for the map to travel between rooms.', 'Some things only a tool can tell you. Tap a tool on the belt. In the attic and crawlspace, the flashlight is a must. Tap Map to travel between rooms.'),
    target: '[data-coach="belt"]' },
];
const val = (v) => (typeof v === 'function' ? v() : v);

export function createOnboarding(ctx) {
  const { bus, store, layers } = ctx;
  const el = h('section', { class: 'card coach', 'aria-live': 'polite', 'aria-label': 'Guided tour', hidden: true });
  append(layers.coach, el);
  let i = -1, offs = [], timer = 0, dragDist = 0, lastTarget = null;

  function start() {
    if (ctx.state.screen !== 'game') return;
    i = 0; show();
  }

  function stop(done) {
    clearTimeout(timer);
    offs.forEach(f => f()); offs = [];
    lastTarget?.classList.remove('coach-target'); lastTarget = null;
    el.hidden = true; i = -1;
    store.setSetting('onboarded', true);
    if (done) ctx.toasts.info('You are ready', say('Finish anytime with the report button, top right. Press N for your notebook.', 'Finish anytime with the report button, top right. Your notebook is the book icon.'), 4200);
  }

  function advance() {
    clearTimeout(timer);
    ctx.sound.play('xp');
    if (i >= STEPS.length - 1) return stop(true);
    i++; show();
  }

  function soon(ms = 900) { clearTimeout(timer); timer = setTimeout(advance, ms); }

  function show() {
    offs.forEach(f => f()); offs = [];
    const st = STEPS[i];
    lastTarget?.classList.remove('coach-target');
    const target = val(st.target);
    lastTarget = target ? document.querySelector(target) : null;
    lastTarget?.classList.add('coach-target');
    clear(el);
    el.hidden = false;
    el.dataset.step = st.id;
    append(el, 
      h('div', { class: 'coach-top' },
        h('span', { class: 'eyebrow' }, `Getting started · ${i + 1} of ${STEPS.length}`),
        h('button', { class: 'link-btn', type: 'button', onclick: () => stop(false) }, 'Skip tour')),
      h('h2', { class: 'coach-title' }, st.title),
      h('p', { class: 'coach-body' }, val(st.body)),
      val(st.keys) ? h('div', { class: 'coach-keys', 'aria-hidden': 'true' }, val(st.keys).map(k => h('kbd', null, k))) : null,
      h('div', { class: 'coach-dots', 'aria-hidden': 'true' }, STEPS.map((_, j) => h('span', { class: j === i ? 'on' : j < i ? 'done' : '' }))),
      h('div', { class: 'coach-actions' },
        h('button', { class: 'btn btn-ghost btn-sm', type: 'button', onclick: advance }, i === STEPS.length - 1 ? 'Done' : 'Next', icon('next', { size: 14 }))));

    // Auto-advance when the player actually does it.
    if (st.id === 'move') {
      const fn = (e) => { if (ctx.modals.count) return; if (/^(w|a|s|d|arrow(up|down|left|right))$/i.test(e.key)) soon(1200); };
      window.addEventListener('keydown', fn); offs.push(() => window.removeEventListener('keydown', fn));
      offs.push(bus.on('ui:stick', ({ x, y }) => { if (Math.hypot(x, y) > 0.3) soon(1600); }));
    }
    if (st.id === 'look') {
      dragDist = 0;
      let last = null;
      const down = (e) => { if (!e.target.closest('#ui .card, #ui button, #ui .joy')) last = [e.clientX, e.clientY]; };
      const move = (e) => { if (!last || !(e.buttons & 1)) return; dragDist += Math.hypot(e.clientX - last[0], e.clientY - last[1]); last = [e.clientX, e.clientY]; if (dragDist > 160) { last = null; soon(500); } };
      const up = () => { last = null; };
      window.addEventListener('pointerdown', down); window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
      offs.push(() => { window.removeEventListener('pointerdown', down); window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); });
    }
    if (st.id === 'open') offs.push(bus.on('inspect:entered', () => soon(700)));
    if (st.id === 'log') offs.push(bus.on('finding:logged', () => soon(400)));
    if (st.id === 'tools') offs.push(bus.on('tool:changed', ({ tool }) => { if (tool !== 'hand') soon(1400); }));
  }

  // The "log" step points at the inspect panel, which may not exist yet; re-point when it appears.
  bus.on('inspect:entered', () => {
    if (i < 0) return;
    const st = STEPS[i];
    const target = val(st.target);
    if (target) { lastTarget?.classList.remove('coach-target'); lastTarget = document.querySelector(target); lastTarget?.classList.add('coach-target'); }
  });
  bus.on('ui:modal', ({ open }) => { if (i >= 0) el.classList.toggle('dimmed', open); });

  return { start, stop, get active() { return i >= 0; } };
}
