// The log card: observe -> classify -> learn. The heart of the game.
import { h, clear, append } from './dom.js';
import { icon } from './icons.js';
import { closeButton } from './modals.js';
import { CHECKPOINT_BY_ID, COMPONENT_BY_ID } from '../data/manifest.js';
import { RECOMMENDATIONS, TOOLS } from '../data/taxonomy.js';
import { clean, cpContent, cpState, cpTitle, SEV_LIST, SEV, REC, TOOL, courseShort, allQuizzes } from './content.js';
import { readout } from './readouts.js';

const VERDICT = {
  exact: { title: 'Spot on.', sub: 'That is the call a senior inspector would make.', cls: 'good', sfx: 'correct' },
  near: { title: 'Close.', sub: 'One step off on severity. Read the why, then you will have it.', cls: 'near', sfx: 'near' },
  wrong: { title: 'Not quite.', sub: 'Good that it happened here and not on a real report.', cls: 'bad', sfx: 'wrong' },
};

export function createLogCard(ctx) {
  const { bus, store } = ctx;
  let entry = null, ring = null, cur = null; // cur = { cp, comp, content, state, sc, step, choice }

  function open({ checkpointId, componentId, x, y }) {
    const cp = CHECKPOINT_BY_ID[checkpointId];
    if (!cp) return;
    if (entry) entry.close('replace');
    const comp = COMPONENT_BY_ID[componentId || cp.componentId];
    const state = store.stateOf(cp.id);
    const content = cpContent(cp.id);
    const prev = store.inspection.logged[cp.id];
    cur = {
      cp, comp, content, state, sc: cpState(cp.id, state),
      choice: prev ? { severity: prev.severity, rec: prev.rec, note: prev.note || '' } : { severity: null, rec: null, note: '' },
      step: prev ? 'feedback' : 'observe', result: prev || null, firstLog: false, reviewing: !!prev,
    };

    const wrap = h('div', { class: 'modal-wrap side', 'aria-labelledby': 'lc-title' });
    const card = h('div', { class: 'card logcard' });
    append(wrap, card);
    wrap.addEventListener('mousedown', (e) => { if (e.target === wrap) entry?.close('backdrop'); });

    if (x != null && y != null) {
      ring = h('div', { class: 'click-ring', style: { left: `${x}px`, top: `${y}px` }, 'aria-hidden': 'true' });
      append(ctx.layers.fx, ring);
    }
    entry = ctx.modals.open(wrap, {
      kind: 'logcard', label: 'Log a finding', onKey, initialFocus: '#lc-title',
      onClose: () => { ring?.remove(); ring = null; entry = null; cur = null; ctx.inspect?.render(); },
    });
    cur.card = card;
    render();
  }

  function onKey(e) {
    if (!cur) return false;
    const t = TOOLS.find(x => x.key === e.key);
    if (t && !e.metaKey && !e.ctrlKey && !(e.target && /input|textarea/i.test(e.target.tagName))) {
      ctx.sound.play('tool');
      store.setTool(t.id);
      if (cur.step !== 'feedback') render();
      return true;
    }
    if (e.key === 'Enter' && cur.step === 'feedback' && !(e.target && /button|textarea/i.test(e.target.tagName))) { entry?.close('done'); return true; }
    return false;
  }

  function header() {
    const { cp, comp, step } = cur;
    const title = step === 'feedback' ? cpTitle(cp) : clean(cp.label);
    return h('header', { class: 'lc-head' },
      h('div', null,
        h('div', { class: 'eyebrow' }, clean(comp?.name || 'Component')),
        h('h2', { id: 'lc-title', class: 'lc-title', tabindex: '-1' }, title)),
      closeButton(() => entry?.close('x')));
  }

  function render() {
    if (!cur) return;
    const { card } = cur;
    clear(card);
    append(card, header());
    const needTool = cur.cp.tool;
    if (cur.step !== 'feedback' && needTool && !store.canPerceive(cur.cp.id)) return renderBlocked(card);
    if (cur.step === 'feedback') return renderFeedback(card);
    renderObserve(card);
  }

  // ── Step 0: the condition needs a tool ──
  function renderBlocked(card) {
    const t = TOOL[cur.cp.tool];
    ctx.sound.play('select');
    const btn = h('button', { class: 'btn btn-primary', type: 'button', 'data-autofocus': '', onclick: () => { ctx.sound.play('tool'); store.setTool(t.id); render(); } },
      icon(t.icon, { size: 18 }), ` Switch to the ${t.label}`, h('kbd', { class: 'kbd-in' }, t.key));
    append(card, h('div', { class: 'lc-blocked' },
      h('div', { class: 'blocked-ico' }, icon(t.icon, { size: 34 })),
      h('h3', null, "Your eyes alone can't tell."),
      h('p', null, `From here it looks ordinary. To know what is really going on, you need the ${t.label.toLowerCase()}.`),
      h('p', { class: 'muted' }, clean(t.desc)),
      h('div', { class: 'lc-actions' }, btn, h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => entry?.close('later') }, 'Not now'))));
  }

  // ── Step 1: observe and classify ──
  function renderObserve(card) {
    const { cp, sc, choice } = cur;
    const body = h('div', { class: 'lc-body' });
    if (cp.tool) {
      const live = store.tool === cp.tool;
      if (live) store.markToolRead(cp.id);
      append(body, readout(cp.tool, sc?.reading, { remembered: !live }));
    }
    append(body, h('section', { class: 'observe' },
      h('div', { class: 'section-label' }, icon('eye', { size: 15 }), ' What you observe'),
      h('p', { class: 'observe-text' }, sc?.observe ? clean(sc.observe)
        : 'Teaching notes for this item are still being written. Judge from the model in front of you.')));

    // Severity pills
    const hintLine = h('p', { class: 'sev-hint', 'aria-live': 'polite' }, choice.severity ? SEV[choice.severity].hint : 'Pick the one that fits. Hover or focus a choice to see what it means.');
    const sevGroup = h('div', { class: 'sev-pills', role: 'radiogroup', 'aria-label': 'Severity' });
    SEV_LIST.forEach((sv, i) => {
      const on = choice.severity === sv.id;
      const b = h('button', {
        class: `sev-pill sev-${sv.id}${on ? ' on' : ''}`, type: 'button', role: 'radio', 'aria-checked': String(on),
        tabindex: on || (!choice.severity && i === 0) ? 0 : -1, title: sv.hint, style: { '--sev': sv.color },
        onclick: () => pickSev(sv.id),
        onmouseenter: () => { hintLine.textContent = sv.hint; },
        onmouseleave: () => { hintLine.textContent = choice.severity ? SEV[choice.severity].hint : 'Pick the one that fits. Hover or focus a choice to see what it means.'; },
        onfocus: () => { hintLine.textContent = sv.hint; },
        onkeydown: (e) => radioKeys(e, sevGroup, (el) => pickSev(el.dataset.v)),
        'data-v': sv.id,
      }, h('span', { class: 'sev-dot', 'aria-hidden': 'true' }), sv.display);
      append(sevGroup, b);
    });
    append(body, h('section', { class: 'classify' },
      h('div', { class: 'section-label', id: 'lc-sev' }, '1. How serious is it?'), sevGroup, hintLine));

    // Referral chips
    const recGroup = h('div', { class: 'rec-chips', role: 'radiogroup', 'aria-label': 'Referral' });
    RECOMMENDATIONS.forEach((r, i) => {
      const on = choice.rec === r.id;
      append(recGroup, h('button', {
        class: `chip chip-btn rec-chip${on ? ' on' : ''}${r.id === 'none' ? ' rec-none' : ''}`, type: 'button', role: 'radio', 'aria-checked': String(on),
        tabindex: on || (!choice.rec && i === 0) ? 0 : -1, 'data-v': r.id,
        onclick: () => pickRec(r.id),
        onkeydown: (e) => radioKeys(e, recGroup, (el) => pickRec(el.dataset.v)),
      }, r.label));
    });
    append(body, h('section', { class: 'classify' },
      h('div', { class: 'section-label' }, '2. Who should look at it?'), recGroup));

    // Note
    const note = h('textarea', { class: 'note', rows: 2, placeholder: 'Your words, if you want them in the report (optional)', 'aria-label': 'Note (optional)' });
    note.value = choice.note || '';
    note.addEventListener('input', () => { choice.note = note.value; });
    const noteWrap = h('details', { class: 'note-wrap', open: choice.note ? true : null },
      h('summary', null, 'Add a note (optional)'), note);
    append(body, noteWrap);

    const ready = choice.severity && choice.rec;
    const submit = h('button', { class: 'btn btn-primary btn-lg', type: 'button', disabled: !ready, onclick: submitFinding },
      store.isLogged(cur.cp.id) ? 'Log it again' : 'Log finding');
    const why = h('span', { class: 'muted small' }, ready ? '' : !choice.severity ? 'Choose a severity first.' : 'Now choose who to refer.');
    append(card, body, h('footer', { class: 'lc-foot' }, why, submit));

    function pickSev(id) {
      ctx.sound.play('select');
      choice.severity = id;
      if (id === 'ok' && !choice.rec) choice.rec = 'none';
      keepFocus(() => render(), `.sev-pill[data-v="${id}"]`);
    }
    function pickRec(id) {
      ctx.sound.play('select');
      choice.rec = id;
      keepFocus(() => render(), `.rec-chip[data-v="${id}"]`);
    }
  }

  function keepFocus(fn, sel) {
    const open = cur?.card.querySelector('.note-wrap')?.open;
    const scroll = cur?.card.querySelector('.lc-body')?.scrollTop || 0;
    fn();
    const body = cur?.card.querySelector('.lc-body');
    if (body) body.scrollTop = scroll;
    if (open) cur.card.querySelector('.note-wrap')?.setAttribute('open', '');
    cur?.card.querySelector(sel)?.focus({ preventScroll: true });
  }

  function radioKeys(e, group, pick) {
    const items = [...group.querySelectorAll('[role="radio"]')];
    const i = items.indexOf(e.currentTarget);
    let j = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') j = (i + 1) % items.length;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') j = (i - 1 + items.length) % items.length;
    if (j == null) return;
    e.preventDefault();
    pick(items[j]);
  }

  function submitFinding() {
    const { cp, sc, choice, state } = cur;
    // If content has not landed yet, grade gently from the true state so the loop still works.
    const answer = sc ? { severity: sc.severity, rec: sc.rec, recAlt: sc.recAlt || [] }
      : state === 'ok' ? { severity: 'ok', rec: 'none' }
        : { severity: choice.severity === 'ok' ? 'repair' : choice.severity, rec: choice.rec, recAlt: [] };
    const first = !store.isLogged(cp.id);
    const result = store.logFinding(cp.id, { severity: choice.severity, rec: choice.rec, note: choice.note }, answer);
    cur.result = result; cur.firstLog = first; cur.reviewing = false; cur.answer = answer; cur.step = 'feedback';
    ctx.sound.play(VERDICT[result.sevScore]?.sfx || 'click');
    render();
  }

  // ── Step 2: feedback, the teaching moment ──
  function renderFeedback(card) {
    const { cp, sc, content, result } = cur;
    const answer = cur.answer || (sc ? { severity: sc.severity, rec: sc.rec, recAlt: sc.recAlt || [] } : null);
    const v = VERDICT[result.sevScore] || VERDICT.wrong;
    const recOk = result.recRight;
    const body = h('div', { class: 'lc-body' });

    append(body, h('div', { class: `verdict ${v.cls}`, role: 'status' },
      h('div', { class: 'verdict-ico' }, icon(result.sevScore === 'wrong' ? 'x' : 'check', { size: 22 })),
      h('div', null, h('div', { class: 'verdict-title' }, v.title), h('div', { class: 'verdict-sub' }, v.sub)),
      h('div', { class: 'verdict-pts' }, cur.firstLog ? `+${result.points} XP`
        : cur.reviewing ? h('span', { class: 'muted small' }, `logged earlier, ${result.points} pts`)
          : h('span', { class: 'muted small' }, 'practice, no XP'))));

    const yourSev = SEV[result.severity], wantSev = answer ? SEV[answer.severity] : null;
    const recList = answer ? [answer.rec, ...(answer.recAlt || [])].filter(Boolean) : [];
    append(body, h('table', { class: 'compare' },
      h('thead', null, h('tr', null, h('th', null, ''), h('th', null, 'Your call'), h('th', null, 'Answer'))),
      h('tbody', null,
        h('tr', null, h('th', { scope: 'row' }, 'Severity'),
          h('td', null, sevPill(yourSev), mark(result.sevScore === 'exact' ? 'good' : result.sevScore === 'near' ? 'near' : 'bad')),
          h('td', null, wantSev ? sevPill(wantSev) : '')),
        h('tr', null, h('th', { scope: 'row' }, 'Referral'),
          h('td', null, REC[result.rec]?.label || result.rec, mark(recOk ? 'good' : 'bad')),
          h('td', null, recList.length ? REC[recList[0]]?.label || recList[0] : '',
            recList.length > 1 ? h('div', { class: 'muted small' }, `Also accepted: ${recList.slice(1).map(r => REC[r]?.label || r).join(', ')}`) : null)))));

    if (result.falsePositive) append(body, h('p', { class: 'callout warn' }, 'This one is acceptable. Over-calling scares buyers and costs you credibility, so learning to leave it alone is a real skill.'));
    if (result.missedDefect) append(body, h('p', { class: 'callout bad' }, 'This is a real defect. Missing it is the costliest mistake on a report, so it is worth a second look at why.'));

    if (!sc) append(body, h('p', { class: 'callout' }, 'The teaching notes for this item have not loaded yet, so this was graded on whether it is a defect at all.'));
    if (sc?.why) append(body, block('Why it matters', clean(sc.why)));
    if (sc?.report) append(body, h('section', { class: 'fb-block' },
      h('div', { class: 'section-label' }, icon('report', { size: 15 }), ' How a pro would write it'),
      h('blockquote', { class: 'report-sample' }, clean(sc.report))));
    if (content?.tip) append(body, h('section', { class: 'fb-block tip' }, h('div', { class: 'section-label' }, 'Field tip'), h('p', null, clean(content.tip))));
    if (content?.nc) append(body, h('section', { class: 'fb-block nc' }, h('div', { class: 'section-label' }, 'North Carolina note'), h('p', null, clean(content.nc))));

    const course = content?.course || cp.courses[0];
    const actions = h('div', { class: 'fb-links' },
      h('button', { class: 'chip chip-btn chip-course', type: 'button', onclick: () => ctx.notebook.openCourse(course) }, icon('book', { size: 14 }), ` Field Notes: ${courseShort(course)}`));
    const q = pickCourseQuiz(course, cp.componentId);
    if (q) append(actions, h('button', { class: 'chip chip-btn', type: 'button', onclick: () => { entry?.close('quiz'); ctx.quiz.run([q], { title: 'Quick question' }); } }, icon('quiz', { size: 14 }), ' Quick question on this'));
    append(body, actions);

    append(card, body, h('footer', { class: 'lc-foot' },
      h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => { cur.step = 'observe'; render(); } }, 'Log it again'),
      h('button', { class: 'btn btn-primary', type: 'button', 'data-autofocus': '', onclick: () => entry?.close('done') }, 'Done')));
    requestAnimationFrame(() => card.querySelector('[data-autofocus]')?.focus({ preventScroll: true }));
  }

  function pickCourseQuiz(course, compId) {
    const qs = allQuizzes().filter(q => q.course === course || (q.components || []).includes(compId));
    return qs.find(q => !store.profile.quizzes[q.id]) || null;
  }

  function block(label, text) {
    return h('section', { class: 'fb-block' }, h('div', { class: 'section-label' }, label), h('p', null, text));
  }

  bus.on('tool:changed', () => { if (cur && cur.step !== 'feedback') render(); });

  return { open, close: () => entry?.close('external'), get isOpen() { return !!entry; } };
}

export function sevPill(sv, extra = '') {
  if (!sv) return h('span', { class: 'muted' }, 'n/a');
  return h('span', { class: `sev-tag sev-${sv.id} ${extra}`, style: { '--sev': sv.color } }, h('span', { class: 'sev-dot', 'aria-hidden': 'true' }), sv.display);
}
function mark(kind) {
  const label = kind === 'good' ? 'correct' : kind === 'near' ? 'close' : 'incorrect';
  return h('span', { class: `mark ${kind}`, role: 'img', 'aria-label': label }, icon(kind === 'bad' ? 'x' : 'check', { size: 14 }));
}
