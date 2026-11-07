// OWNER: Yuki. The whole UI layer: plain DOM over the 3D view.
// Talks to the engine only through bus events (CONTEXT.md §7) and engine.getZone().
import './styles.css';
import { h, isTyping, append } from './dom.js';
import { createModals, confirmDialog } from './modals.js';
import { createSound } from './sound.js';
import { createMemory } from './memory.js';
import { createToasts } from './toasts.js';
import { createHUD } from './hud.js';
import { createInspectPanel } from './inspect.js';
import { createLogCard } from './logcard.js';
import { createQuiz } from './quiz.js';
import { createNotebook } from './notebook.js';
import { createReport } from './report.js';
import { createTitle } from './title.js';
import { createSettings } from './settings.js';
import { createOnboarding } from './onboarding.js';
import { createExam } from './exam.js';
import { createGuide } from './guide.js';
import { onTouchMode } from './touch.js';
import { TOOLS } from '../data/taxonomy.js';
import { CHECKPOINTS, CHECKPOINT_BY_ID, ZONE_BY_ID } from '../data/manifest.js';

export function createUI({ root, bus, store, engine }) {
  root.textContent = '';
  root.classList.add('wi-root');
  document.documentElement.classList.add('wi');

  const layer = (cls) => { const el = h('div', { class: `wi-layer ${cls}` }); append(root, el); return el; };
  const layers = {
    hud: layer('hud-layer'),
    panels: layer('panel-layer'),
    fx: layer('fx-layer'),
    coach: layer('coach-layer'),
    modals: layer('modal-host'),
    toasts: layer('toast-layer'),
  };

  let startZone = 'exterior';
  try { startZone = engine?.getZone?.() || 'exterior'; } catch { /* engine still booting */ }

  const ctx = {
    root, bus, store, engine, layers,
    state: { screen: 'title', zone: startZone, inspecting: null },
  };
  ctx.sound = createSound(store);
  ctx.mem = createMemory(store);
  ctx.modals = createModals({ bus, host: layers.modals });
  ctx.toasts = createToasts(ctx);
  ctx.notebook = createNotebook(ctx);
  ctx.settings = createSettings(ctx);
  ctx.quiz = createQuiz(ctx);
  ctx.hud = createHUD(ctx);
  ctx.logcard = createLogCard(ctx);
  ctx.guide = createGuide(ctx); // before the inspect panel: its inspect:entered handler must run first
  ctx.inspect = createInspectPanel(ctx);
  ctx.report = createReport(ctx);
  ctx.exam = createExam(ctx);
  ctx.title = createTitle(ctx);
  ctx.onboarding = createOnboarding(ctx);
  onTouchMode(() => { root.classList.add('touch'); ctx.hud.refresh(); });

  // ── screen flow ──
  ctx.enterGame = () => {
    ctx.modals.closeWhere(e => ['title', 'report', 'exam'].includes(e.kind), 'enter');
    ctx.state.screen = 'game';
    ctx.hud.show();
    try { const z = engine?.getZone?.(); if (z) { ctx.state.zone = z; ctx.hud.map.setZone(z); } } catch { /* ignore */ }
    if (!store.settings.onboarded && !ctx.onboarding.active) setTimeout(() => { if (!store.settings.onboarded && !ctx.onboarding.active) ctx.onboarding.start(); }, 600);
  };
  ctx.showTitle = () => {
    if (ctx.onboarding.active) ctx.onboarding.stop(false);
    ctx.modals.closeWhere(e => e.kind !== 'title', 'title');
    ctx.title.open();
  };
  ctx.openReport = () => {
    // Re-opening a finished inspection shows the same report without granting XP twice.
    const s = store.summary();
    ctx.report.open({ summary: s, xpEarned: store.inspection.finishedAt ? Math.round(s.pct * 3) : 0 });
  };
  ctx.finishFlow = async () => {
    if (ctx.modals.count > 0 && !ctx.modals.has('notebook')) return;
    ctx.notebook.close();
    const s = store.summary();
    if (store.inspection.finishedAt) { ctx.openReport(); return; }
    const left = s.totalCheckpoints - s.loggedCount;
    const ok = await confirmDialog(ctx, {
      title: 'Finish and write the report?',
      body: h('div', null,
        h('p', null, `You've logged ${s.loggedCount} of ${s.totalCheckpoints} checkpoints.`),
        left > 0 ? h('p', { class: 'muted' }, `The ${left} you haven't logged score zero, and any defects among them count as missed. You can keep walking this house afterwards, but the grade is set when you finish.`)
          : h('p', { class: 'muted' }, 'Every checkpoint is logged. Nicely thorough.')),
      confirm: 'Write my report', cancel: 'Keep inspecting',
    });
    if (!ok) return;
    if (ctx.state.inspecting) bus.emit('ui:inspect-exit', {});
    ctx.inspect.close();
    if (ctx.onboarding.active) ctx.onboarding.stop(false);
    const before = store.profile.xp;
    const summary = store.finishInspection();
    ctx.report.open({ summary, xpEarned: store.profile.xp - before });
  };

  // ── engine events ──
  bus.on('checkpoint:click', (p) => {
    if (ctx.state.screen !== 'game' || !p?.checkpointId) return;
    if (ctx.modals.count > 0 && !ctx.modals.has('logcard')) return;
    ctx.logcard.open(p);
  });
  bus.on('ui:goto-component', () => { if (ctx.state.screen !== 'game') ctx.enterGame(); });
  bus.on('inspection:new', () => {
    ctx.logcard.close();
    ctx.inspect.close();
    ctx.hud.refresh();
  });

  // Room complete -> offer a 3-question room check from that zone's courses.
  bus.on('finding:logged', ({ checkpointId }) => {
    const cp = CHECKPOINT_BY_ID[checkpointId];
    if (!cp) return;
    const zoneCps = CHECKPOINTS.filter(c => c.zone === cp.zone);
    if (!zoneCps.every(c => store.isLogged(c.id))) return;
    if (!ctx.mem.add('roomChecks', cp.zone)) return;
    const canQuiz = store.settings.quizFrequency !== 'off' && ctx.quiz.pickFor(ZONE_BY_ID[cp.zone]?.courses || [], 3).length > 0;
    // wait for the log card to close so the toast is seen
    const offer = () => ctx.toasts.roomDone(cp.zone, canQuiz ? () => ctx.quiz.roomCheck(cp.zone) : null);
    if (ctx.logcard.isOpen) { const off = bus.on('ui:modal', ({ open }) => { if (!open) { off(); setTimeout(offer, 250); } }); }
    else offer();
  });

  // ── keyboard ──
  window.addEventListener('keydown', (e) => {
    const top = ctx.modals.top();
    if (e.key === 'Tab' && top) { ctx.modals.trap(e); return; }
    if (top) {
      if (top.onKey && top.onKey(e)) { e.preventDefault(); e.stopPropagation(); return; }
      // G still folds the desktop guide bubble while judging: it sits beside the log card, not under it
      if ((e.key === 'g' || e.key === 'G') && top.kind === 'logcard' && !ctx.guide.docked && !isTyping(e.target) && !e.metaKey && !e.ctrlKey && !e.altKey) {
        if (ctx.guide.toggle()) { e.preventDefault(); ctx.sound.play('click'); }
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault(); e.stopPropagation();
        if (top.dismissable !== false) { ctx.sound.play('click'); top.close('escape'); }
      }
      return;
    }
    if (ctx.state.screen !== 'game') return;
    if (isTyping(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key;
    const tool = TOOLS.find(t => t.key === k);
    if (tool) { ctx.sound.play('tool'); store.setTool(tool.id); return; }
    if (k === 'Escape') {
      if (ctx.state.inspecting) { e.stopPropagation(); ctx.inspect.back(); }
      return;
    }
    if (k === 'n' || k === 'N') { e.preventDefault(); ctx.sound.play('click'); ctx.notebook.open(); return; }
    if (k === 'm' || k === 'M') { e.preventDefault(); ctx.hud.map.toggle(); return; }
    if (k === 'g' || k === 'G') { if (ctx.state.inspecting && ctx.guide.toggle()) { e.preventDefault(); ctx.sound.play('click'); } return; }
    if (k === 'r' || k === 'R') { e.preventDefault(); ctx.finishFlow(); return; }
    if (k === '?' || k === 'h' || k === 'H') { ctx.hud.toggleHelp(); }
  }, true);

  // first gesture unlocks audio
  window.addEventListener('pointerdown', () => ctx.sound.unlock(), { once: true });

  ctx.title.open();

  return {
    showTitle: ctx.showTitle,
    enterGame: ctx.enterGame,
    openNotebook: (tab) => ctx.notebook.open(tab),
    openReport: ctx.openReport,
    finish: ctx.finishFlow,
    _ctx: ctx,
  };
}
