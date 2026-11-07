// Title screen. First meaning in under two seconds: what this is, whose house, one big button.
import { h } from './dom.js';
import { icon } from './icons.js';
import { confirmDialog } from './modals.js';
import { ADDRESS, CHECKPOINTS } from '../data/manifest.js';
import { RANKS } from '../core/store.js';

export function createTitle(ctx) {
  const { store, bus } = ctx;
  let entry = null;
  let ready = false;
  const markReady = () => { ready = true; const s = entry?.el.querySelector('.ti-status'); if (s) s.textContent = 'The house is ready.'; };
  bus.on('engine:ready', markReady);
  setTimeout(markReady, 4000); // in case the engine was ready before the UI was listening

  function open() {
    if (entry) entry.close('replace');
    const ins = store.inspection;
    const logged = Object.keys(ins.logged).length;
    const finished = !!ins.finishedAt;
    const r = store.rank();
    const base = (RANKS.find(x => x.title === r.title) || RANKS[0]).xp;
    const pct = r.next ? Math.max(0, Math.min(1, (r.xp - base) / (r.next.xp - base))) : 1;
    const hist = store.profile.history.slice(0, 3);

    let primary;
    if (finished) primary = h('button', { class: 'btn btn-primary btn-xl', type: 'button', 'data-autofocus': '', onclick: () => startNew(false) }, 'Start a new inspection');
    else if (logged) primary = h('button', { class: 'btn btn-primary btn-xl', type: 'button', 'data-autofocus': '', onclick: () => go() },
      'Continue inspection', h('span', { class: 'btn-sub' }, `${logged} of ${CHECKPOINTS.length} logged`));
    else primary = h('button', { class: 'btn btn-primary btn-xl', type: 'button', 'data-autofocus': '', onclick: () => go() }, 'Start inspection');

    const secondary = h('div', { class: 'ti-secondary' },
      finished ? h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => ctx.openReport() }, icon('report', { size: 16 }), ' View last report') : null,
      !finished && logged ? h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => startNew(true) }, 'New inspection') : null,
      h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => ctx.exam.open() }, icon('timer', { size: 16 }), ' Exam Mode'),
      h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => ctx.notebook.open('map') }, icon('map', { size: 16 }), ' Course Map'),
      h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => ctx.settings.open() }, icon('gear', { size: 16 }), ' Settings'));

    const wrap = h('div', { class: 'screen screen-title', 'aria-labelledby': 'ti-name' },
      h('div', { class: 'ti-grid' },
        h('section', { class: 'ti-hero' },
          h('div', { class: 'ti-mark', 'aria-hidden': 'true' }, icon('home', { size: 28 })),
          h('h1', { id: 'ti-name', class: 'ti-name' }, 'Walkthrough Inspector'),
          h('p', { class: 'ti-tag' }, 'Walk a real-feeling house, find what is wrong, decide how serious it is and who should fix it. Built on the 20 courses of the InterNACHI North Carolina pre-licensing program.'),
          h('div', { class: 'ti-actions' }, primary, secondary),
          h('p', { class: 'ti-status muted small', 'aria-live': 'polite' }, ready ? 'The house is ready.' : 'Getting the house ready...')),
        h('aside', { class: 'ti-side' },
          h('div', { class: 'card ti-address' },
            h('div', { class: 'eyebrow' }, finished ? 'Last job' : logged ? 'Today\'s job, in progress' : 'Today\'s job'),
            h('div', { class: 'ti-street' }, ADDRESS.street),
            h('div', { class: 'ti-city' }, ADDRESS.city),
            h('dl', { class: 'ti-facts' },
              h('dt', null, 'Built'), h('dd', null, String(ADDRESS.built)),
              h('dt', null, 'Size'), h('dd', null, `${ADDRESS.sqft.toLocaleString()} sq ft`),
              h('dt', null, 'House'), h('dd', null, ADDRESS.style),
              h('dt', null, 'Client'), h('dd', null, ADDRESS.client)),
            h('p', { class: 'muted small' }, 'Conditions change with every inspection, so you learn the method, not the house.')),
          h('div', { class: 'card ti-rank' },
            h('div', { class: 'ti-rank-row' }, h('span', { class: 'rank-badge sm' }, icon('star', { size: 16 })),
              h('div', null, h('div', { class: 'ti-rank-title' }, r.title), h('div', { class: 'muted small' }, r.next ? `${r.xp} XP · ${r.next.xp - r.xp} to ${r.next.title}` : `${r.xp} XP · top rank`))),
            h('div', { class: 'bar', role: 'presentation' }, h('div', { class: 'bar-fill xp', style: { width: `${pct * 100}%` } })),
            hist.length ? h('ul', { class: 'ti-hist', 'aria-label': 'Recent reports' }, hist.map(x =>
              h('li', null, h('span', { class: `grade sm grade-${x.grade}` }, x.grade), h('span', null, `${x.pct}%`), h('span', { class: 'muted small' }, `${x.found}/${x.defects} defects · ${new Date(x.date).toLocaleDateString()}`)))) : null))));
    entry = ctx.modals.open(wrap, { kind: 'title', label: 'Walkthrough Inspector', dismissable: false, onClose: () => { entry = null; } });
    ctx.state.screen = 'title';
    ctx.hud.hide();
  }

  function go() {
    ctx.sound.unlock();
    ctx.sound.play('click');
    entry?.close('start');
    ctx.enterGame();
  }

  async function startNew(confirmFirst) {
    if (confirmFirst) {
      const n = Object.keys(store.inspection.logged).length;
      const ok = await confirmDialog(ctx, {
        title: 'Start a new inspection?',
        body: h('p', null, `Your current inspection has ${n} logged ${n === 1 ? 'finding' : 'findings'} and no report yet. A new inspection re-rolls the house and clears them. Your XP and quiz progress stay.`),
        confirm: 'Start fresh', cancel: 'Keep my inspection', danger: true,
      });
      if (!ok) return;
    }
    store.newInspection();
    go();
  }

  return { open, close: () => entry?.close('external'), get isOpen() { return !!entry; } };
}
