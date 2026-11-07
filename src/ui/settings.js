// Settings: hints, field guide, sound, quiz frequency, mouse sensitivity, tour replay, reset.
import { h, clear, append } from './dom.js';
import { closeButton, confirmDialog } from './modals.js';
import { GUIDE_MODES, guideMode } from './guide.js';

export function createSettings(ctx) {
  const { store } = ctx;
  let entry = null, card = null;

  function open() {
    if (entry) return;
    const wrap = h('div', { class: 'modal-wrap center', 'aria-labelledby': 'st-title' });
    card = h('div', { class: 'card dialog settings' });
    append(wrap, card);
    wrap.addEventListener('mousedown', (e) => { if (e.target === wrap) entry?.close('backdrop'); });
    entry = ctx.modals.open(wrap, { kind: 'settings', label: 'Settings', onClose: () => { entry = null; } });
    render();
  }

  function toggleRow(key, label, desc) {
    const on = !!store.settings[key];
    const id = `st-${key}`;
    return h('div', { class: 'st-row' },
      h('div', null, h('div', { class: 'st-label', id }, label), h('div', { class: 'muted small' }, desc)),
      h('button', {
        class: `switch${on ? ' on' : ''}`, type: 'button', role: 'switch', 'aria-checked': String(on), 'aria-labelledby': id,
        onclick: () => { store.setSetting(key, !on); if (key === 'sound' && !on) { ctx.sound.unlock(); ctx.sound.play('correct'); } else ctx.sound.play('click'); render(`.switch[aria-labelledby="${id}"]`); },
      }, h('span', { class: 'knob' })));
  }

  function guideRow() {
    const cur = guideMode(store);
    return h('div', { class: 'st-row col' },
      h('div', null, h('div', { class: 'st-label', id: 'st-guide' }, 'Field guide'),
        h('div', { class: 'muted small' }, "A senior inspector's notes on what you are looking at up close. Reading it never costs points.")),
      h('div', { class: 'st-radios', role: 'radiogroup', 'aria-labelledby': 'st-guide' }, GUIDE_MODES.map(m =>
        h('button', {
          class: `st-radio${cur === m.id ? ' on' : ''}`, type: 'button', role: 'radio', 'aria-checked': String(cur === m.id), 'data-guide': m.id,
          onclick: () => { ctx.sound.play('click'); store.setSetting('guide', m.id); render(`.st-radio[data-guide="${m.id}"]`); },
        }, h('span', { class: 'st-radio-dot', 'aria-hidden': 'true' }), h('span', null, h('span', { class: 'st-radio-l' }, m.label), h('span', { class: 'muted small st-radio-d' }, m.desc))))));
  }

  function render(focusSel) {
    clear(card);
    const freq = store.settings.quizFrequency || 'normal';
    const sens = Number(store.settings.mouseSensitivity || 1);
    const sensOut = h('output', { class: 'st-out' }, `${sens.toFixed(1)}x`);
    const slider = h('input', { type: 'range', min: '0.3', max: '2.5', step: '0.1', value: String(sens), 'aria-label': 'Mouse and trackpad look sensitivity', class: 'range' });
    slider.addEventListener('input', () => { sensOut.textContent = `${Number(slider.value).toFixed(1)}x`; });
    slider.addEventListener('change', () => store.setSetting('mouseSensitivity', Number(slider.value)));

    append(card, 
      h('header', { class: 'dialog-head' }, h('h2', { id: 'st-title', class: 'dialog-title' }, 'Settings'), closeButton(() => entry?.close('x'))),
      toggleRow('hints', 'Hints', 'Soft rings on parts you have not logged yet, while you are up close.'),
      guideRow(),
      toggleRow('sound', 'Sound', 'Small, quiet tones for right, wrong, and clicks.'),
      h('div', { class: 'st-row col' },
        h('div', null, h('div', { class: 'st-label', id: 'st-quiz' }, 'Pop quizzes'), h('div', { class: 'muted small' }, 'Short questions when you open something for the first time.')),
        h('div', { class: 'seg', role: 'radiogroup', 'aria-labelledby': 'st-quiz' }, [['off', 'Off'], ['normal', 'Now and then'], ['all', 'Every time']].map(([v, l]) =>
          h('button', { class: `seg-btn${freq === v ? ' on' : ''}`, type: 'button', role: 'radio', 'aria-checked': String(freq === v), onclick: () => { ctx.sound.play('click'); store.setSetting('quizFrequency', v); render(`.seg-btn[aria-checked="true"]`); } }, l)))),
      h('div', { class: 'st-row col' },
        h('div', { class: 'st-label' }, 'Look sensitivity'),
        h('div', { class: 'range-row' }, h('span', { class: 'muted small' }, 'Slower'), slider, h('span', { class: 'muted small' }, 'Faster'), sensOut)),
      h('div', { class: 'st-row' },
        h('div', null, h('div', { class: 'st-label' }, 'Guided tour'), h('div', { class: 'muted small' }, 'The five-step walkthrough of the controls.')),
        h('button', { class: 'btn btn-ghost btn-sm', type: 'button', onclick: () => { entry?.close('tour'); store.setSetting('onboarded', false); if (ctx.state.screen === 'game') ctx.onboarding.start(); else ctx.toasts.info('The tour starts when you enter the house.'); } }, 'Replay the tour')),
      h('div', { class: 'st-row danger-zone' },
        h('div', null, h('div', { class: 'st-label' }, 'Reset all progress'), h('div', { class: 'muted small' }, 'Clears XP, rank, quiz history, reports, and settings on this device.')),
        h('button', { class: 'btn btn-danger btn-sm', type: 'button', onclick: reset }, 'Reset...')),
    );
    if (focusSel) requestAnimationFrame(() => card.querySelector(focusSel)?.focus?.());
  }

  async function reset() {
    const ok = await confirmDialog(ctx, {
      title: 'Reset all progress?',
      body: h('p', null, 'This clears your XP, rank, every quiz answer, past reports, and the current inspection. It cannot be undone.'),
      confirm: 'Yes, reset everything', cancel: 'Keep my progress', danger: true,
    });
    if (!ok) return;
    store.resetAll();
    try { localStorage.removeItem('hous-inspection:ui:v1'); } catch { /* ignore */ }
    ctx.guide?.forgetSeen();
    entry?.close('reset');
    ctx.showTitle();
    ctx.toasts.info('Progress reset', 'A clean slate. Welcome back, Trainee.');
  }

  return { open, close: () => entry?.close('external') };
}
