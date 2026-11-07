// Toasts: XP, rank up, zone entered, room complete. Top-centre band, never the middle of the view.
import { h, append } from './dom.js';
import { say } from './touch.js';
import { icon } from './icons.js';
import { ZONE_BY_ID, CHECKPOINTS } from '../data/manifest.js';
import { courseShort } from './content.js';

// One-line scope notes shown on entering a zone.
const ZONE_NOTE = {
  shed: 'Detached structures are outside the NC Standards of Practice unless added to the inspection agreement. Your client added the garden studio.',
};

const REASON = { finding: 'Finding logged', quiz: 'Quiz answered', report: 'Report written' };

export function createToasts(ctx) {
  const { bus, store, layers } = ctx;
  const host = h('div', { class: 'toasts', 'aria-live': 'polite', 'aria-atomic': 'false' });
  append(layers.toasts, host);

  function push(el, ms = 2600) {
    append(host, el);
    requestAnimationFrame(() => el.classList.add('in'));
    let t = setTimeout(dismiss, ms);
    function dismiss() {
      clearTimeout(t);
      el.classList.remove('in');
      el.classList.add('out');
      setTimeout(() => el.remove(), 260);
    }
    el.addEventListener('mouseenter', () => clearTimeout(t));
    el.addEventListener('mouseleave', () => { t = setTimeout(dismiss, 1400); });
    // keep the band short
    while (host.children.length > 4) host.firstElementChild.remove();
    return dismiss;
  }

  // Merge rapid XP gains into one chip so a finding + bonus doesn't stack three toasts.
  let xpChip = null, xpSum = 0, xpTimer = 0;
  bus.on('xp:gained', ({ amount, reason }) => {
    if (!amount) return;
    ctx.sound.play('xp');
    if (xpChip && document.contains(xpChip)) {
      xpSum += amount;
      xpChip.querySelector('.xp-amt').textContent = `+${xpSum} XP`;
      clearTimeout(xpTimer);
      xpTimer = setTimeout(() => { xpChip = null; }, 900);
      return;
    }
    xpSum = amount;
    xpChip = h('div', { class: 'toast toast-xp', role: 'status' },
      h('span', { class: 'xp-amt' }, `+${amount} XP`),
      h('span', { class: 'toast-sub' }, REASON[reason] || 'Progress'));
    push(xpChip, 2200);
    xpTimer = setTimeout(() => { xpChip = null; }, 900);
  });

  bus.on('rank:up', ({ title }) => {
    ctx.sound.play('rank');
    const el = h('div', { class: 'toast toast-rank', role: 'status' },
      h('div', { class: 'rank-badge' }, icon('star', { size: 26 })),
      h('div', null,
        h('div', { class: 'toast-eyebrow' }, 'New rank'),
        h('div', { class: 'toast-title' }, title),
        h('div', { class: 'toast-sub' }, 'Your judgement is getting sharper. Keep going.')));
    push(el, 5200);
  });

  bus.on('zone:enter', ({ zoneId }) => {
    const z = ZONE_BY_ID[zoneId];
    if (!z) return;
    store.markZone(zoneId);
    const note = ZONE_NOTE[zoneId];
    if (!ctx.mem.add('zones', zoneId)) {
      if (note && ctx.state.screen === 'game') push(h('div', { class: 'toast toast-note', role: 'status' }, h('div', { class: 'toast-sub' }, note)), 5200);
      return;
    }
    if (ctx.state.screen !== 'game') return;
    ctx.sound.play('zone');
    const total = CHECKPOINTS.filter(cp => cp.zone === zoneId).length;
    const el = h('div', { class: 'toast toast-zone', role: 'status' },
      h('div', { class: 'toast-eyebrow' }, 'Entering'),
      h('div', { class: 'toast-title' }, z.name),
      h('div', { class: 'chips' }, z.courses.map(c => h('span', { class: 'chip chip-course' }, courseShort(c)))),
      h('div', { class: 'toast-sub' }, z.dark && store.tool !== 'flashlight'
        ? `It's dark in here. ${say('Press 2 for the flashlight.', 'Tap the flashlight on the belt.')} ${total} checkpoints.`
        : `${total} checkpoints in this area`),
      note ? h('p', { class: 'toast-note-line' }, note) : null);
    push(el, note ? 6500 : 4200);
  });

  return {
    push,
    info(text, sub, ms = 2600) {
      return push(h('div', { class: 'toast', role: 'status' }, h('div', { class: 'toast-title small' }, text), sub ? h('div', { class: 'toast-sub' }, sub) : null), ms);
    },
    roomDone(zoneId, onQuiz) {
      host.querySelectorAll('.toast-room').forEach(n => n.remove()); // one offer at a time
      const z = ZONE_BY_ID[zoneId];
      let dismiss;
      const btn = onQuiz ? h('button', { class: 'btn btn-primary btn-sm', type: 'button', onclick: () => { dismiss?.(); onQuiz(); } }, 'Take the 3-question room check') : null;
      const el = h('div', { class: 'toast toast-room', role: 'status' },
        h('div', { class: 'toast-eyebrow' }, icon('check', { size: 14 }), ' Room complete'),
        h('div', { class: 'toast-title small' }, `All checkpoints in ${z?.name || 'this room'} logged`),
        btn ? h('div', { class: 'toast-actions' }, btn, h('button', { class: 'btn btn-ghost btn-sm', type: 'button', onclick: () => dismiss?.() }, 'Not now')) : null);
      dismiss = push(el, 9000);
    },
  };
}
