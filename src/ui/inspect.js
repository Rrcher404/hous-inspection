// Inspect panel: what you are looking at, what there is to judge, and a way back.
import { h, clear, append } from './dom.js';
import { say } from './touch.js';
import { icon } from './icons.js';
import { COMPONENT_BY_ID } from '../data/manifest.js';
import { clean, courseShort, allQuizzes, SEV } from './content.js';
import { sevPill } from './logcard.js';

export function createInspectPanel(ctx) {
  const { bus, store, layers } = ctx;
  const el = h('aside', { class: 'card inspect', 'aria-label': 'Inspecting', hidden: true });
  append(layers.panels, el);
  let compId = null, pendingQuiz = null, popTimer = 0;

  function open(id) {
    const comp = COMPONENT_BY_ID[id];
    if (!comp) return;
    compId = id;
    ctx.state.inspecting = id;
    store.markComponent(id);
    pendingQuiz = null;
    el.hidden = false;
    ctx.hud.setInspecting(true);
    render();
    maybePopQuiz(id);
  }

  function close() {
    clearTimeout(popTimer);
    compId = null; pendingQuiz = null;
    ctx.state.inspecting = null;
    el.hidden = true;
    ctx.hud.setInspecting(false);
  }

  function back() {
    ctx.sound.play('click');
    bus.emit('ui:inspect-exit', {});
    close(); // optimistic; the engine confirms with inspect:exited
  }

  function render() {
    if (!compId) return;
    const comp = COMPONENT_BY_ID[compId];
    clear(el);
    const cps = comp.checkpoints;
    const n = cps.filter(cp => store.isLogged(cp.id)).length;
    // Small screens: the field guide lives in this sheet as a second tab, so it never covers the object.
    const dock = ctx.guide?.dockInfo(compId) || null;
    el.classList.toggle('has-guide-tab', !!dock);
    el.classList.toggle('guide-on', !!dock?.open);
    append(el, 
      h('header', { class: 'insp-head' },
        h('div', { class: 'eyebrow' }, 'Inspecting'),
        h('h2', { class: 'insp-title' }, clean(comp.name)),
        h('div', { class: 'chips' }, comp.courses.map(c =>
          h('button', { class: 'chip chip-btn chip-course', type: 'button', title: 'Open Field Notes', onclick: () => ctx.notebook.openCourse(c) }, courseShort(c))))),
      dock ? dock.tabs : null,
      dock?.open ? dock.view : partsView(cps, n),
      h('footer', { class: 'insp-foot' },
        h('button', { class: 'btn btn-ghost', type: 'button', onclick: back }, icon('back', { size: 16 }), ' Back to walking', h('kbd', { class: 'kbd-in' }, 'Esc'))),
    );
  }

  function partsView(cps, n) {
    const comp = COMPONENT_BY_ID[compId];
    return [
      cps.length
        ? h('p', { class: 'insp-help' }, say('Click a part of it to examine, or pick one below.', 'Tap a part of it to examine, or pick one below. Pinch to zoom.'), h('span', { class: 'muted' }, ` ${n} of ${cps.length} logged.`))
        : h('p', { class: 'insp-help' }, 'Nothing to judge here. Have a look around it, then head back.'),
      h('ul', { class: 'cp-list' }, cps.map(cp => {
        const e = store.inspection.logged[cp.id];
        return h('li', null, h('button', {
          class: `cp-row${e ? ' logged' : ''}`, type: 'button',
          onclick: () => { ctx.sound.play('click'); ctx.logcard.open({ checkpointId: cp.id, componentId: comp.id }); },
        },
        h('span', { class: 'cp-status', 'aria-hidden': 'true' }, e ? icon('check', { size: 14 }) : h('span', { class: 'cp-empty' })),
        h('span', { class: 'cp-label' }, clean(cp.label)),
        e ? sevPill(SEV[e.severity], 'sm') : h('span', { class: 'cp-state muted' }, 'Not logged'),
        h('span', { class: 'sr-only' }, e ? `, logged as ${SEV[e.severity]?.display}` : ', not logged')));
      })),
      // The quiz waits until the player has judged something here, so it never spoils a finding.
      pendingQuiz && (n > 0 || !cps.length) ? h('button', { class: 'quiz-chip', type: 'button', onclick: () => takeQuiz() },
        icon('quiz', { size: 16 }), h('span', null, n === cps.length ? 'Bonus question unlocked' : 'A bonus question is waiting'), h('span', { class: 'muted small' }, '+20 XP')) : null,
    ];
  }

  function maybePopQuiz(id) {
    clearTimeout(popTimer);
    const freq = store.settings.quizFrequency || 'normal';
    if (freq === 'off') return;
    // ascending difficulty: the prerequisite (difficulty 1) question comes first
    const linked = allQuizzes().filter(q => (q.components || []).includes(id)).sort((a, b) => (a.difficulty ?? 2) - (b.difficulty ?? 2));
    if (!linked.length) return;
    const unanswered = linked.filter(q => !store.profile.quizzes[q.id]?.correct);
    let pick = null;
    if (freq === 'all') pick = unanswered[0] || linked[Math.floor(Math.random() * linked.length)];
    else {
      if (ctx.mem.has('popped', id)) return;
      const fresh = linked.filter(q => !store.profile.quizzes[q.id]);
      pick = fresh[0] || null;
    }
    if (!pick) return;
    // 'popped' is recorded in takeQuiz(), only when the quiz actually opens (Voss minor 5).
    pendingQuiz = pick;
    render();
    // Nothing to judge (portals): ask after a beat. Otherwise wait until every checkpoint
    // here is logged, so a question never gives away the answer to a finding.
    if (!COMPONENT_BY_ID[id].checkpoints.length) {
      popTimer = setTimeout(() => { if (compId === id && pendingQuiz === pick && ctx.modals.count === 0) takeQuiz(); }, 900);
    } else if (COMPONENT_BY_ID[id].checkpoints.every(cp => store.isLogged(cp.id))) {
      quizWhenFree(id); // came back to a finished component whose quiz was never taken
    }
  }

  function quizWhenFree(id) {
    clearTimeout(popTimer);
    const tick = () => {
      if (compId !== id || !pendingQuiz) return;
      if (ctx.modals.count === 0) takeQuiz();
      else popTimer = setTimeout(tick, 350);
    };
    popTimer = setTimeout(tick, 600);
  }

  function takeQuiz() {
    const q = pendingQuiz;
    if (!q) return;
    if (compId) ctx.mem.add('popped', compId);
    ctx.quiz.run([q], {
      title: 'Pop quiz', allowSkip: true,
      onDone: ({ answered }) => { if (answered) pendingQuiz = null; render(); },
    });
  }

  bus.on('inspect:entered', ({ componentId }) => open(componentId));
  bus.on('inspect:exited', () => close());
  bus.on('finding:logged', () => {
    render();
    if (!compId || !pendingQuiz) return;
    const cps = COMPONENT_BY_ID[compId].checkpoints;
    if (cps.every(cp => store.isLogged(cp.id))) quizWhenFree(compId);
  });
  bus.on('inspection:new', () => close());

  return { open, close, back, render, get componentId() { return compId; } };
}
