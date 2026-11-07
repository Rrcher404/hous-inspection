// Field Guide: a senior inspector riding along (CONTEXT.md §12).
// Opens with inspect mode as a speech bubble beside the framed object (wide screens), or as a
// "Guide" tab inside the inspect sheet (phones, tablets, small windows), so it never covers the
// thing you are judging. Content comes from src/data/guides.js; a missing guide shows nothing.
import { h, clear, append } from './dom.js';
import { icon } from './icons.js';
import { say, isTouch } from './touch.js';
import { COMPONENT_BY_ID } from '../data/manifest.js';
import { TOOL_BY_ID } from '../data/taxonomy.js';
import { COMPONENT_GUIDES, ZONE_GUIDES } from '../data/guides.js';
import { clean } from './content.js';

export const GUIDE_MODES = [
  { id: 'always', label: 'Always open', desc: 'Opens every time you get up close to something.' },
  { id: 'fade', label: 'Fades as you learn', desc: 'Opens by itself until you have called every part of a thing right once, then waits folded.' },
  { id: 'ask', label: 'Only when I ask', desc: 'Stays folded as a small Guide button until you open it.' },
  { id: 'off', label: 'Off', desc: 'No guide at all. You can turn it back on here anytime.' },
];
const MODE_BY_ID = Object.fromEntries(GUIDE_MODES.map(m => [m.id, m]));
export const guideMode = (store) => (MODE_BY_ID[store.settings.guide] ? store.settings.guide : 'fade');

// The bubble floats beside the object only when there is room for it next to the framed object.
const FLOAT_MIN_W = 1180, FLOAT_MIN_H = 600;
const SEEN_KEY = 'hous-inspection:guide:v1'; // components opened before, across inspections

const str = (v) => (typeof v === 'string' && v.trim() ? clean(v.trim()) : '');

/** The zone intro line for the zone banner, or null. */
export function zoneIntro(zoneId) {
  return str((ZONE_GUIDES || {})[zoneId]?.intro) || null;
}

/** A validated guide for a component, or null when there is nothing worth showing. */
export function guideFor(componentId) {
  const g = (COMPONENT_GUIDES || {})[componentId];
  const comp = COMPONENT_BY_ID[componentId];
  if (!g || typeof g !== 'object' || !comp) return null;
  const cpById = Object.fromEntries(comp.checkpoints.map(cp => [cp.id, cp]));
  const items = (Array.isArray(g.look) ? g.look : []).filter(x => x && str(x.text));
  const checks = [], extras = [];
  for (const it of items) {
    const cp = it.cp && cpById[it.cp];
    const toolId = TOOL_BY_ID[it.tool] ? it.tool : cp?.tool;
    const row = { cp: cp ? cp.id : null, text: str(it.text), tool: toolId && toolId !== 'hand' ? toolId : null };
    (cp ? checks : extras).push(row);
  }
  const what = str(g.what);
  if (!what && !checks.length && !extras.length) return null;
  const terms = (Array.isArray(g.terms) ? g.terms : []).filter(t => t && str(t.term) && str(t.means)).map(t => ({ term: str(t.term), means: str(t.means) }));
  return { what, checks, extras: extras.slice(0, 1), pro: str(g.pro), watch: str(g.watch), terms };
}

function loadSeen() {
  try { const a = JSON.parse(localStorage.getItem(SEEN_KEY) || '{}')?.seen; return new Set(Array.isArray(a) ? a : []); } catch { return new Set(); }
}

export function createGuide(ctx) {
  const { bus, store, layers } = ctx;
  const synth = typeof window !== 'undefined' && window.speechSynthesis && typeof window.SpeechSynthesisUtterance === 'function' ? window.speechSynthesis : null;
  const seen = loadSeen();
  const saveSeen = () => { try { localStorage.setItem(SEEN_KEY, JSON.stringify({ seen: [...seen] })); } catch { /* private mode */ } };

  // ── state ──
  let compId = null, guide = null, open = false, mastered = false;
  let kinds = [];            // modal stack kinds, from ui:stack
  let tourOn = false;
  let speaking = false;
  let docked = computeDocked();
  let showTimer = 0, termOpen = -1;
  const detailsOpen = new Set();

  // ── elements ──
  const view = h('div', { class: 'gd-view' });
  const bubble = h('section', { class: 'card guide-bubble', id: 'gd-bubble', role: 'region', 'aria-labelledby': 'gd-title', hidden: true });
  const pill = h('button', { class: 'guide-pill', type: 'button', 'aria-expanded': 'false', 'aria-controls': 'gd-bubble', hidden: true, onclick: () => { ctx.sound.play('click'); setOpen(true, { user: true }); } });
  const live = h('div', { class: 'sr-only', 'aria-live': 'polite' });
  append(layers.panels, bubble, pill, live);

  function computeDocked() { return !(window.innerWidth >= FLOAT_MIN_W && window.innerHeight >= FLOAT_MIN_H); }
  const mode = () => guideMode(store);
  const available = () => !!(compId && guide && mode() !== 'off' && ctx.state.screen === 'game');
  const otherModal = () => kinds.some(k => k !== 'logcard');

  function isMastered(id) {
    const cps = COMPONENT_BY_ID[id]?.checkpoints || [];
    // a randomized part is only learned once you've called it right solo both ways: defective and fine
    return cps.length ? cps.every(cp => { const m = store.mastery(cp.id); return cp.kind === 'variable' ? (m.defect > 0 && m.ok > 0) : m.good > 0; }) : seen.has(id);
  }
  function decideOpen() {
    const m = mode();
    if (m === 'off' || tourOn || ctx.onboarding?.active) return false;
    if (m === 'always') return true;
    if (m === 'ask') return false;
    return !mastered;
  }

  // ── lifecycle ──
  function enter(id) {
    stopSpeech();
    compId = id; termOpen = -1; detailsOpen.clear();
    guide = guideFor(id);
    mastered = guide ? isMastered(id) : false;
    open = guide ? decideOpen() : false;
    if (guide && !(COMPONENT_BY_ID[id]?.checkpoints || []).length && !seen.has(id)) { seen.add(id); saveSeen(); }
    if (guide) renderView();
    layout();
  }
  function exit() {
    stopSpeech();
    compId = null; guide = null; open = false;
    layout();
  }

  /** Open or fold. In docked mode this switches the inspect sheet's tab. */
  function setOpen(v, { user = false } = {}) {
    if (!available()) return false;
    if (open === v) return true;
    open = v;
    if (!open) stopSpeech();
    if (docked) ctx.inspect?.render();
    layout();
    if (user && !docked) requestAnimationFrame(() => (open ? bubble.querySelector('.gd-fold') : pill)?.focus({ preventScroll: true }));
    return true;
  }
  const toggle = () => setOpen(!open, { user: false });

  // ── float layout (bubble or pill beside the object) ──
  function layout() {
    const canFloat = available() && !docked && !otherModal();
    bubble.hidden = !(canFloat && open);
    pill.hidden = !(canFloat && !open);
    if (!bubble.hidden && view.parentNode !== bubble) append(bubble, view);
    if (canFloat) {
      renderPill();
      place();
    }
    reportLayout();
  }
  // Tell the engine how much of the left edge the open bubble takes, so it frames the object beside it.
  let lastLeft = -1, openLeft = 324;
  function reportLayout() {
    const left = bubble.hidden ? 0 : Math.round(bubble.getBoundingClientRect().right + 8);
    if (left) openLeft = left;
    if (left === lastLeft) return;
    lastLeft = left;
    bus.emit('ui:guide-layout', { left });
  }

  function place() {
    const tl = document.querySelector('.hud-tl');
    const r = tl && tl.getClientRects().length ? tl.getBoundingClientRect() : null;
    const top = Math.round(r ? r.bottom + 12 : 132);
    bubble.style.setProperty('--gd-top', `${top}px`);
    pill.style.setProperty('--gd-top', `${top}px`);
    // tail: point at the framed object's centre (engine frames it in the free area left of the panel)
    requestAnimationFrame(() => {
      if (bubble.hidden) return;
      const H = window.innerHeight, dy = Math.min(55, H * 0.07);
      const cy = (H - 2 * dy) / 2;
      const bh = bubble.offsetHeight || 300;
      const y = Math.max(26, Math.min(bh - 30, cy - top));
      bubble.style.setProperty('--tail-y', `${Math.round(y)}px`);
    });
  }

  function renderPill() {
    clear(pill);
    const m = mode();
    const known = m === 'fade' && mastered;
    pill.setAttribute('aria-label', `Open the field guide${known ? ", you've got this one" : ''} (G)`);
    pill.title = 'Open the field guide (G)';
    append(pill,
      h('span', { class: 'gd-mark', 'aria-hidden': 'true' }, icon('guide', { size: 16 })),
      h('span', null, 'Guide'),
      known ? h('span', { class: 'gd-pill-sub' }, "you've got this one") : null,
      isTouch() ? null : h('kbd', { class: 'kbd-in' }, 'G'));
  }

  // ── the guide itself (one element, shown in the bubble or the inspect sheet) ──
  function speakBtn() {
    if (!synth) return null;
    return h('button', {
      class: `icon-btn sm gd-speak${speaking ? ' on' : ''}`, type: 'button', 'aria-pressed': String(speaking),
      'aria-label': speaking ? 'Stop reading aloud' : 'Read the guide aloud', title: speaking ? 'Stop reading' : 'Read aloud',
      onclick: () => (speaking ? stopSpeech() : speak()),
    }, icon(speaking ? 'stop' : 'speaker', { size: 18 }), h('span', { class: 'gd-speak-l' }, speaking ? 'Stop' : 'Listen'));
  }

  function lookRow(row) {
    const logged = row.cp && store.isLogged(row.cp);
    const t = row.tool && TOOL_BY_ID[row.tool];
    const toolOn = t && store.tool === t.id;
    const look = row.cp
      ? h('button', {
        class: 'gd-look', type: 'button', 'data-cp': row.cp,
        'aria-label': `${row.text} Show me where.${logged ? ' Logged.' : ''}`,
        onclick: (e) => showMe(row.cp, e.currentTarget),
      },
      h('span', { class: `gd-st${logged ? ' done' : ''}`, 'aria-hidden': 'true' }, logged ? icon('check', { size: 13 }) : h('span', { class: 'cp-empty' })),
      h('span', { class: 'gd-look-t' }, row.text,
        h('span', { class: 'gd-where', 'aria-hidden': 'true' }, icon('target', { size: 14 }), 'Show me where')))
      : h('p', { class: 'gd-look gd-look-plain' }, h('span', { class: 'gd-st', 'aria-hidden': 'true' }, icon('eye', { size: 13 })), h('span', { class: 'gd-look-t' }, row.text));
    const chip = t ? h('button', {
      class: `gd-tool${toolOn ? ' on' : ''}`, type: 'button', 'aria-pressed': String(!!toolOn),
      'aria-label': toolOn ? `${t.label} is in your hand` : `Switch to the ${t.label}`,
      title: toolOn ? `${t.label} is in your hand` : `Switch to the ${t.label} (${t.key})`,
      onclick: () => { if (store.tool !== t.id) { ctx.sound.play('tool'); store.setTool(t.id); } },
    }, icon(t.icon, { size: 15 }), h('span', null, toolOn ? `${t.label} in hand` : `Needs the ${t.label.toLowerCase()}`)) : null;
    return h('li', { class: 'gd-look-li' }, look, chip);
  }

  function more(key, title, body) {
    const d = h('details', { class: 'gd-more', open: detailsOpen.has(key) || null },
      h('summary', null, icon('next', { size: 14 }), h('span', null, title)), body);
    d.addEventListener('toggle', () => { if (d.open) detailsOpen.add(key); else detailsOpen.delete(key); });
    return d;
  }

  function termsBody() {
    const meaning = h('p', { class: 'gd-means', 'aria-live': 'polite', hidden: termOpen < 0 }, termOpen >= 0 ? guide.terms[termOpen]?.means : '');
    return h('div', null,
      h('div', { class: 'gd-terms' }, guide.terms.map((t, i) => h('button', {
        class: `chip chip-btn gd-term${termOpen === i ? ' on' : ''}`, type: 'button', 'aria-expanded': String(termOpen === i),
        onclick: () => { ctx.sound.play('click'); termOpen = termOpen === i ? -1 : i; renderView(); },
      }, t.term))),
      meaning,
      h('p', { class: 'muted small gd-terms-help' }, say('Click a word to see what it means. These are words a report would use.', 'Tap a word to see what it means. These are words a report would use.')));
  }

  function modeControl() {
    const cur = mode();
    return more('mode', `Guide opens: ${MODE_BY_ID[cur].label}`, h('div', { class: 'gd-modes', role: 'radiogroup', 'aria-label': 'When the field guide opens' },
      GUIDE_MODES.map(m => h('button', {
        class: `gd-mode${cur === m.id ? ' on' : ''}`, type: 'button', role: 'radio', 'aria-checked': String(cur === m.id),
        onclick: () => setMode(m.id),
      }, h('span', { class: 'gd-dot', 'aria-hidden': 'true' }), h('span', null, h('span', { class: 'gd-mode-l' }, m.label), h('span', { class: 'gd-mode-d' }, m.desc))))));
  }

  function renderView() {
    if (!guide) { clear(view); return; }
    const body = view.querySelector('.gd-body');
    const scroll = body ? body.scrollTop : 0;
    clear(view);
    view.classList.toggle('docked', docked);
    // Docked, the tab already says "Guide": no header, the Listen button floats beside the first line.
    const head = docked
      ? null
      : h('header', { class: 'gd-head' },
        h('span', { class: 'gd-mark', 'aria-hidden': 'true' }, icon('guide', { size: 16 })),
        h('h2', { class: 'gd-title', id: 'gd-title' }, 'Field guide'),
        speakBtn(),
        h('button', { class: 'icon-btn sm gd-fold', type: 'button', 'aria-expanded': 'true', 'aria-controls': 'gd-bubble', 'aria-label': 'Fold the guide (G)', title: 'Fold the guide (G)', onclick: () => { ctx.sound.play('click'); setOpen(false, { user: true }); } }, icon('fold', { size: 18 })));
    const n = guide.checks.filter(r => store.isLogged(r.cp)).length;
    const foot = h('footer', { class: 'gd-foot' },
      h('p', { class: 'gd-free' }, icon('check', { size: 14 }), 'Reading the guide never costs points.'),
      modeControl());
    append(view, head,
      h('div', { class: 'gd-body', role: docked ? 'tabpanel' : null, 'aria-labelledby': docked ? 'gd-tab-guide' : null },
        docked ? h('span', { class: 'gd-dock-speak' }, speakBtn()) : null,
        guide.what ? h('p', { class: 'gd-what' }, guide.what) : null,
        guide.checks.length ? [
          h('div', { class: 'gd-sec' }, h('span', null, 'What to check'), guide.checks.length > 1 ? h('span', { class: 'gd-sec-n' }, `${n} of ${guide.checks.length} logged`) : null),
          h('ul', { class: 'gd-looks' }, guide.checks.map(lookRow)),
        ] : null,
        guide.extras.length ? [h('div', { class: 'gd-sec quiet' }, 'Also worth a glance'), h('ul', { class: 'gd-looks' }, guide.extras.map(lookRow))] : null,
        guide.pro ? more('pro', 'How a pro works it', h('p', null, guide.pro)) : null,
        guide.watch ? more('watch', 'Watch out', h('p', null, guide.watch)) : null,
        guide.terms.length ? more('terms', 'Say it like a pro', termsBody()) : null,
        docked ? foot : null),
      docked ? null : foot);
    const nb = view.querySelector('.gd-body');
    if (nb) nb.scrollTop = scroll;
    if (!bubble.hidden) place();
  }

  function showMe(cpId, btn) {
    ctx.sound.play('select');
    bus.emit('ui:guide-focus', { checkpointId: cpId, secs: 3 });
    clearTimeout(showTimer);
    view.querySelectorAll('.gd-look.showing').forEach(b => b.classList.remove('showing'));
    btn?.classList.add('showing');
    live.textContent = 'Showing where it is, with a teal ring on the model.';
    showTimer = setTimeout(() => { btn?.classList.remove('showing'); }, 3000);
  }

  function setMode(v) {
    if (mode() === v) return;
    ctx.sound.play('click');
    const before = mode();
    store.setSetting('guide', v);
    if (v === 'off') {
      let dismiss;
      const undo = h('button', { class: 'btn btn-ghost btn-sm', type: 'button', onclick: () => { dismiss?.(); store.setSetting('guide', before); setOpen(true); } }, 'Undo');
      dismiss = ctx.toasts.push(h('div', { class: 'toast', role: 'status' },
        h('div', { class: 'toast-title small' }, 'Field guide is off'),
        h('div', { class: 'toast-sub' }, 'Turn it back on anytime in Settings, under Field guide.'),
        h('div', { class: 'toast-actions' }, undo)), 6000);
    }
  }

  // ── read aloud ──
  function speak() {
    if (!synth || !guide) return;
    synth.cancel();
    const parts = [guide.what];
    if (guide.checks.length) parts.push('What to check.', ...guide.checks.map(r => r.text));
    if (guide.extras.length) parts.push('Also worth a glance.', ...guide.extras.map(r => r.text));
    const u = new window.SpeechSynthesisUtterance(parts.filter(Boolean).join(' '));
    u.rate = 0.98;
    u.onend = u.onerror = () => { if (speaking) { speaking = false; renderView(); } };
    speaking = true;
    synth.speak(u);
    renderView();
  }
  function stopSpeech() {
    if (!speaking) return;
    speaking = false;
    try { synth?.cancel(); } catch { /* ignore */ }
    if (guide) renderView();
  }

  // ── docked mode: the inspect sheet asks for tabs and the view ──
  function dockInfo(id) {
    if (!docked || !available() || id !== compId) return null;
    const cps = COMPONENT_BY_ID[id]?.checkpoints || [];
    const n = cps.filter(cp => store.isLogged(cp.id)).length;
    const known = mode() === 'fade' && mastered;
    if (open && view.parentNode === bubble) view.remove();
    if (open) renderView();
    const tab = (sel, label, extra, onclick, id2) => h('button', {
      class: `gd-tab${sel ? ' on' : ''}`, type: 'button', role: 'tab', id: id2, 'aria-selected': String(sel), tabindex: sel ? 0 : -1,
      onclick, onkeydown: (e) => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); setOpen(!open, { user: true }); requestAnimationFrame(() => document.querySelector('.gd-tab.on')?.focus()); } },
    }, label, extra);
    const tabs = h('div', { class: 'gd-tabs', role: 'tablist', 'aria-label': 'Inspect panel' },
      tab(!open, 'Parts to judge', cps.length ? h('span', { class: 'gd-tab-n' }, `${n}/${cps.length}`) : null, () => { ctx.sound.play('click'); setOpen(false, { user: true }); }, 'gd-tab-parts'),
      tab(open, [h('span', { class: 'gd-mark sm', 'aria-hidden': 'true' }, icon('guide', { size: 13 })), 'Guide'], known ? h('span', { class: 'gd-tab-n', title: "You've got this one" }, icon('check', { size: 12 })) : null, () => { ctx.sound.play('click'); setOpen(true, { user: true }); }, 'gd-tab-guide'));
    return { tabs, open, view };
  }

  // ── events ──
  // The engine frames the object the moment it opens, before inspect:entered. Say now whether the
  // bubble will be open so the camera fits the object beside it instead of under it.
  bus.on('component:open', ({ componentId }) => {
    if (!guideFor(componentId) || computeDocked() || otherModal()) return;
    const was = mastered; mastered = isMastered(componentId);
    const willOpen = decideOpen(); mastered = was;
    const left = willOpen ? openLeft : 0;
    if (left !== lastLeft) { lastLeft = left; bus.emit('ui:guide-layout', { left }); }
  });
  bus.on('inspect:entered', ({ componentId }) => enter(componentId));
  bus.on('inspect:exited', () => exit());
  bus.on('inspection:new', () => exit());
  bus.on('finding:logged', () => { if (guide) renderView(); });
  bus.on('tool:changed', () => { if (guide) renderView(); });
  bus.on('ui:stack', ({ kinds: k }) => {
    kinds = k || [];
    if (otherModal() || (docked && kinds.includes('logcard'))) stopSpeech();
    layout();
  });
  bus.on('ui:modal', ({ open: o }) => { if (o && otherModal()) stopSpeech(); });
  bus.on('ui:tour', ({ active }) => {
    tourOn = !!active;
    if (!compId || !guide) return;
    if (tourOn && open) setOpen(false);
    else if (!tourOn && !open && decideOpen()) setOpen(true);
  });
  bus.on('settings:changed', ({ key }) => {
    if (key !== 'guide') return;
    if (mode() === 'off') { open = false; stopSpeech(); }
    if (guide) renderView();
    if (docked && compId) ctx.inspect?.render();
    layout();
  });
  let rz = 0;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(rz);
    rz = requestAnimationFrame(() => {
      const d = computeDocked();
      if (d !== docked) {
        docked = d;
        if (guide) renderView();
        if (compId) ctx.inspect?.render();
      }
      layout();
    });
  });

  return {
    toggle, setOpen, dockInfo,
    get isOpen() { return open; },
    get available() { return available(); },
    get docked() { return docked; },
    forgetSeen() { seen.clear(); try { localStorage.removeItem(SEEN_KEY); } catch { /* ignore */ } },
  };
}
