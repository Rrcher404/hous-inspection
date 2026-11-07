// Top-down mini-map of 417 Loblolly Lane (CONTEXT.md §6). Every room is a button that emits ui:teleport.
import { h, s, clear, append } from './dom.js';
import { icon } from './icons.js';
import { ZONE_BY_ID, CHECKPOINTS } from '../data/manifest.js';

// Plan coordinates: x east, z south (street at the bottom of the map).
const ROOMS = [
  { zone: 'kitchen', x: 0, z: 0, w: 6, d: 5, label: 'Kitchen' },
  { zone: 'living', x: 0, z: 5, w: 6, d: 5, label: 'Living' },
  { zone: 'laundry', x: 6, z: 0, w: 2.5, d: 4.5, label: 'Lndry', small: true },
  { zone: 'bath', x: 8.5, z: 0, w: 2.5, d: 4.5, label: 'Bath', small: true },
  { zone: 'bed2', x: 11, z: 0, w: 4, d: 4.5, label: 'Bed 2' },
  { zone: 'hall', x: 6, z: 4.5, w: 9, d: 1.2, label: 'Hall', small: true },
  { zone: 'hall', x: 6, z: 5.7, w: 2, d: 4.3, label: 'Foyer', small: true, tiny: true, alias: true },
  { zone: 'primary', x: 8, z: 5.7, w: 7, d: 4.3, label: 'Primary' },
  { zone: 'garage', x: 15.2, z: 0, w: 6.3, d: 10, label: 'Garage' },
  { zone: 'deck', x: 0.5, z: -3.6, w: 5, d: 3.4, label: 'Deck', outdoor: true },
  { zone: 'shed', x: -7, z: -7, w: 3, d: 3, label: 'Studio', outdoor: true, small: true },
];

const QUICK = [
  { zone: 'exterior', label: 'Outside' },
  { zone: 'roof', label: 'Roof' },
  { zone: 'attic', label: 'Attic' },
  { zone: 'crawl', label: 'Crawl' },
  { zone: 'deck', label: 'Deck' },
  { zone: 'shed', label: 'Studio' },
];

export function createMiniMap(ctx) {
  const { bus, store } = ctx;
  // Starts collapsed so it never eats clicks in the lower-right of the view (Voss minor 11).
  // M or the button opens it; the player's choice is remembered on this device.
  const PREF = 'hous-inspection:ui:map-open';
  let expanded = false;
  try { expanded = localStorage.getItem(PREF) === '1'; } catch { /* ignore */ }
  let current = null;

  const el = h('nav', { class: 'card minimap', 'aria-label': 'Mini-map. Choose a room to travel there.' });
  const head = h('div', { class: 'mm-head' });
  const body = h('div', { class: 'mm-body' });
  append(el, head, body);

  function go(zoneId) {
    if (ctx.state.inspecting) bus.emit('ui:inspect-exit', {});
    ctx.sound.play('click');
    bus.emit('ui:teleport', { zoneId });
  }

  function zoneDone(zoneId) {
    const cps = CHECKPOINTS.filter(cp => cp.zone === zoneId);
    const n = cps.filter(cp => store.isLogged(cp.id)).length;
    return { n, total: cps.length, done: cps.length > 0 && n === cps.length };
  }

  function roomButton(r) {
    const z = ZONE_BY_ID[r.zone];
    const st = zoneDone(r.zone);
    const cls = ['mm-room', r.outdoor && 'outdoor', current === r.zone && 'here', st.done && 'done'].filter(Boolean).join(' ');
    const g = s('g', {
      class: cls, tabindex: r.alias ? -1 : 0, role: 'button',
      'aria-label': `Go to ${z?.name || r.label}, ${st.n} of ${st.total} logged${current === r.zone ? ', you are here' : ''}`,
    });
    append(g, 
      s('rect', { x: r.x, y: r.z, width: r.w, height: r.d, rx: 0.25 }),
      s('text', { x: r.x + r.w / 2, y: r.z + r.d / 2 + (r.small ? 0.35 : 0.45), 'text-anchor': 'middle', class: r.tiny ? 'xs' : r.small ? 'sm' : '' }, r.label),
    );
    if (st.done) append(g, s('circle', { cx: r.x + r.w - 0.6, cy: r.z + 0.6, r: 0.35, class: 'mm-dot' }));
    g.addEventListener('click', () => go(r.zone));
    g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(r.zone); } });
    const title = s('title', null, z?.name || r.label);
    g.prepend(title);
    return g;
  }

  function render() {
    clear(head); clear(body);
    append(head, 
      expanded ? h('span', { class: 'mm-title' }, icon('map', { size: 16 }), ' Map')
        : h('button', { class: 'mm-title mm-open', type: 'button', onclick: () => toggle(true) }, icon('map', { size: 16 }), ' Map: travel to a room'),
      h('button', {
        class: 'icon-btn sm', type: 'button', 'aria-expanded': String(expanded),
        'aria-label': expanded ? 'Collapse map (M)' : 'Expand map (M)', title: expanded ? 'Collapse map (M)' : 'Expand map (M)',
        onclick: () => toggle(),
      }, h('kbd', null, 'M')),
    );
    el.classList.toggle('collapsed', !expanded);
    if (!expanded) return;

    const svg = s('svg', { viewBox: '-8 -8 30.5 21', class: 'mm-svg', role: 'group', 'aria-label': 'Floor plan' });
    // yard (exterior) is the background: clicking it goes outside
    const yard = s('g', { class: `mm-yard${current === 'exterior' ? ' here' : ''}`, tabindex: -1 },
      s('rect', { x: -8, y: -8, width: 30.5, height: 21, rx: 0.6 }));
    yard.addEventListener('click', () => go('exterior'));
    append(svg, yard);
    // driveway + front steps (decor)
    append(svg, s('rect', { x: 15.8, y: 10, width: 5, height: 3, class: 'mm-drive' }));
    append(svg, s('rect', { x: 6.2, y: 10, width: 1.6, height: 1.4, class: 'mm-drive' }));
    append(svg, s('text', { x: 18.3, y: 12, 'text-anchor': 'middle', class: 'mm-street' }, 'street'));
    append(svg, s('text', { x: 7, y: -6.8, 'text-anchor': 'middle', class: 'mm-street' }, 'rear yard'));
    for (const r of ROOMS) append(svg, roomButton(r));
    // You-are-here pin for zones that are not a room on the plan
    const offPlan = { roof: [8, 5], attic: [10, 5.1], crawl: [9, 0.2] }[current];
    if (offPlan) append(svg, s('circle', { cx: offPlan[0], cy: offPlan[1], r: 0.7, class: 'mm-pin' }));
    append(body, svg);

    const quick = h('div', { class: 'mm-quick', role: 'group', 'aria-label': 'Other areas' },
      QUICK.map(q => {
        const st = zoneDone(q.zone);
        return h('button', {
          class: `chip chip-btn${current === q.zone ? ' here' : ''}${st.done ? ' done' : ''}`, type: 'button',
          'aria-label': `Go to ${ZONE_BY_ID[q.zone]?.name || q.label}`, 'aria-current': current === q.zone ? 'location' : null,
          onclick: () => go(q.zone),
        }, q.label);
      }));
    append(body, quick);
  }

  function toggle(v) {
    expanded = v ?? !expanded;
    try { localStorage.setItem(PREF, expanded ? '1' : '0'); } catch { /* ignore */ }
    render();
  }
  function setZone(z) { current = z; render(); }

  render();
  return { el, render, toggle, setZone };
}
