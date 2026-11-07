// HUD: where am I, how far along, rank, tools, map, help, finish. Edges only; the centre stays clear.
import { h, clear, append } from './dom.js';
import { icon } from './icons.js';
import { ADDRESS, ZONE_BY_ID, CHECKPOINTS, CHECKPOINT_BY_ID } from '../data/manifest.js';
import { TOOLS } from '../data/taxonomy.js';
import { clean } from './content.js';
import { createMiniMap } from './minimap.js';
import { createJoystick } from './joystick.js';
import { isTouch } from './touch.js';
import { RANKS } from '../core/store.js';

export function createHUD(ctx) {
  const { bus, store, layers } = ctx;
  const el = h('div', { class: 'hud', hidden: true });
  append(layers.hud, el);

  // ── top-left: where you are ──
  const zoneName = h('div', { class: 'hud-zone' });
  const progText = h('div', { class: 'hud-prog-text' });
  const progFill = h('div', { class: 'bar-fill' });
  const tl = h('section', { class: 'card hud-tl', 'aria-label': 'Location and progress' },
    h('div', { class: 'hud-addr' }, icon('home', { size: 14 }), ` ${ADDRESS.street}`),
    zoneName,
    h('div', { class: 'bar', role: 'presentation' }, progFill),
    progText);

  // ── top-right: rank & actions ──
  const rankTitle = h('div', { class: 'hud-rank' });
  const xpText = h('div', { class: 'hud-xp-text' });
  const xpFill = h('div', { class: 'bar-fill xp' });
  const finishBtn = h('button', { class: 'btn btn-primary btn-sm hud-finish', type: 'button', 'aria-label': 'Finish inspection and write report (R)', title: 'Finish inspection and write report (R)', onclick: () => ctx.finishFlow() },
    icon('report', { size: 16 }), h('span', null, 'Finish inspection & write report'));
  const tr = h('section', { class: 'hud-tr', 'aria-label': 'Rank and actions' },
    h('div', { class: 'card hud-rankcard' },
      h('div', { class: 'hud-rank-row' }, rankTitle,
        h('div', { class: 'hud-icons' },
          h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Notebook (N)', title: 'Notebook (N)', 'data-coach': 'notebook', onclick: () => ctx.notebook.open() }, icon('book')),
          h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Settings', title: 'Settings', onclick: () => ctx.settings.open() }, icon('gear')))),
      h('div', { class: 'bar', role: 'presentation' }, xpFill),
      xpText),
    finishBtn);

  // ── bottom-centre: tool belt ──
  const toolName = h('div', { class: 'belt-name', 'aria-live': 'polite' });
  const beltBtns = {};
  const belt = h('div', { class: 'belt', role: 'toolbar', 'aria-label': 'Tool belt, keys 1 to 5', 'data-coach': 'belt' },
    TOOLS.map(t => {
      const b = h('button', {
        class: 'belt-btn', type: 'button', 'aria-pressed': 'false', 'aria-label': `${t.label} (${t.key})`, title: `${t.label} (${t.key})`,
        onclick: () => { ctx.sound.play('tool'); store.setTool(t.id); },
      }, icon(t.icon, { size: 22 }), h('span', { class: 'belt-key' }, t.key));
      beltBtns[t.id] = b;
      return b;
    }));
  const beltWrap = h('section', { class: 'belt-wrap', 'aria-label': 'Tools' }, toolName, belt);

  // ── bottom-left: controls help ──
  let helpOpen = false; // the tour teaches controls first; this stays one click away
  const help = h('section', { class: 'card help', 'aria-label': 'Controls' });
  function renderHelp() {
    clear(help);
    help.classList.toggle('collapsed', !helpOpen);
    const toggle = h('button', { class: 'help-toggle', type: 'button', 'aria-expanded': String(helpOpen), onclick: () => { helpOpen = !helpOpen; renderHelp(); } },
      icon('help', { size: 16 }), h('span', null, helpOpen ? 'Controls' : 'Controls (?)'));
    append(help, toggle);
    if (!helpOpen) return;
    const ins = !!ctx.state.inspecting;
    const rows = isTouch() ? (ins ? [
      ['Drag', 'Orbit around it'],
      ['Pinch', 'Zoom in and out'],
      ['Tap', 'A part to examine it'],
      ['Back', 'Return to walking'],
    ] : [
      ['Stick', 'Walk (push further to stride)'],
      ['Drag', 'Look around'],
      ['Tap', 'Inspect something'],
      ['Hold', 'Inspect a door or hatch'],
    ]) : ins ? [
      ['Drag', 'Orbit around it'],
      ['Scroll', 'Zoom in and out'],
      ['Click', 'A part to examine it'],
      ['1 to 5', 'Switch tools'],
      ['Esc', 'Back to walking'],
    ] : [
      ['W A S D', 'Walk (Shift: faster)'],
      ['Drag', 'Look around'],
      ['Click', 'Inspect what glows'],
      ['1 to 5', 'Switch tools'],
      ['N / M', 'Notebook / Map'],
      ['R', 'Finish & write report'],
    ];
    append(help, h('dl', { class: 'help-list' }, rows.map(([k, v]) => [h('dt', null, h('kbd', null, k)), h('dd', null, v)])));
  }

  // ── hover label near the cursor ──
  const hover = h('div', { class: 'hover-label', 'aria-hidden': 'true', hidden: true });
  append(layers.fx, hover);
  let mx = 0, my = 0, hoverOn = false;
  window.addEventListener('pointermove', (e) => {
    mx = e.clientX; my = e.clientY;
    if (hoverOn) placeHover();
  }, { passive: true });
  function placeHover() {
    const w = hover.offsetWidth || 120;
    const x = Math.min(mx + 16, window.innerWidth - w - 8);
    const y = Math.min(my + 18, window.innerHeight - 40);
    hover.style.transform = `translate(${x}px, ${y}px)`;
  }
  bus.on('hover', (p) => {
    const name = p && (p.componentId || p.checkpointId || p.portal) ? p.name : null;
    if (!name || ctx.modals.blocking) { hoverOn = false; hover.hidden = true; return; }
    clear(hover);
    const logged = p.checkpointId && store.isLogged(p.checkpointId);
    append(hover, logged ? icon('check', { size: 14 }) : null, h('span', null, clean(name)));
    if (!p.checkpointId && !ctx.state.inspecting) {
      const dest = p.portal && ZONE_BY_ID[p.portal]?.name;
      const hint = !dest ? 'click to inspect'
        : p.componentId ? `click to go to ${dest} · E to inspect` : `click to go to ${dest}`;
      append(hover, h('span', { class: 'hover-hint' }, hint));
    }
    if (p.checkpointId) {
      const cp = CHECKPOINT_BY_ID[p.checkpointId];
      append(hover, h('span', { class: 'hover-hint' }, logged ? 'logged, click to review' : (cp ? 'click to examine' : '')));
    }
    hover.hidden = false; hoverOn = true; placeHover();
  });
  bus.on('ui:modal', ({ open }) => { if (open) { hoverOn = false; hover.hidden = true; } });

  // ── mini-map ──
  const map = createMiniMap(ctx);
  const joy = createJoystick(ctx);

  append(el, tl, tr, beltWrap, help, map.el, joy.el);

  function renderProgress() {
    const total = CHECKPOINTS.length;
    const n = CHECKPOINTS.filter(cp => store.isLogged(cp.id)).length;
    progFill.style.width = `${(n / total) * 100}%`;
    clear(progText).append(h('strong', null, `${n}`), ` of ${total} checkpoints logged`);
    const z = ZONE_BY_ID[ctx.state.zone];
    zoneName.textContent = z ? z.name : 'Walkthrough';
    if (z) {
      const zc = CHECKPOINTS.filter(cp => cp.zone === z.id);
      const zn = zc.filter(cp => store.isLogged(cp.id)).length;
      append(zoneName, h('span', { class: 'hud-zone-count' }, ` ${zn}/${zc.length}`));
    }
  }
  function renderRank() {
    const r = store.rank();
    rankTitle.textContent = r.title;
    if (r.next) {
      const base = (RANKS.find(x => x.title === r.title) || RANKS[0]).xp;
      const pct = Math.max(0, Math.min(1, (r.xp - base) / (r.next.xp - base)));
      xpFill.style.width = `${pct * 100}%`;
      xpText.textContent = `${r.xp} XP · ${r.next.xp - r.xp} to ${r.next.title}`;
    } else {
      xpFill.style.width = '100%';
      xpText.textContent = `${r.xp} XP · top rank`;
    }
  }
  function renderTools() {
    for (const t of TOOLS) {
      const on = store.tool === t.id;
      beltBtns[t.id].classList.toggle('on', on);
      beltBtns[t.id].setAttribute('aria-pressed', String(on));
    }
    const t = TOOLS.find(x => x.id === store.tool);
    toolName.textContent = t ? t.label : '';
  }

  function renderAll() { renderProgress(); renderRank(); renderTools(); renderHelp(); map.render(); }

  bus.on('tool:changed', renderTools);
  bus.on('xp:gained', renderRank);
  bus.on('finding:logged', () => { renderProgress(); map.render(); });
  bus.on('inspection:new', renderAll);
  bus.on('zone:enter', ({ zoneId }) => { ctx.state.zone = zoneId; renderProgress(); map.setZone(zoneId); });

  renderAll();
  map.setZone(ctx.state.zone);

  return {
    el, map,
    show() { el.hidden = false; renderAll(); },
    hide() { el.hidden = true; },
    setInspecting(on) { el.classList.toggle('inspecting', !!on); renderHelp(); },
    toggleHelp(v) { helpOpen = v ?? !helpOpen; renderHelp(); },
    refresh: renderAll,
  };
}
