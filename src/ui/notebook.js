// Notebook (N): Field Notes, Course Map, Glossary, Logbook.
import { h, clear, append } from './dom.js';
import { icon } from './icons.js';
import { closeButton } from './modals.js';
import { COURSES, COURSE_BY_ID } from '../data/courses.js';
import { CHECKPOINTS, ZONES, COMPONENT_BY_ID } from '../data/manifest.js';
import { clean, lessonFor, glossary, allQuizzes, checkpointsForCourse, cpTitle, SEV, REC } from './content.js';
import { sevPill } from './logcard.js';

const TABS = [
  { id: 'notes', label: 'Field Notes' },
  { id: 'map', label: 'Course Map' },
  { id: 'glossary', label: 'Glossary' },
  { id: 'log', label: 'Logbook' },
];
const SIZES = [
  { id: 'line', label: 'In a sentence' },
  { id: 'para', label: 'In a paragraph' },
  { id: 'full', label: 'Field checklist' },
];

export function createNotebook(ctx) {
  const { store, bus } = ctx;
  let entry = null, tab = 'notes', course = COURSES[0].id, size = 'para', query = '';
  let panel, tabBtns = {};

  function open(which, opts = {}) {
    if (which) tab = which;
    if (opts.course) course = opts.course;
    if (entry) { renderTabs(); renderPanel(); return; }
    const wrap = h('div', { class: 'modal-wrap center', 'aria-labelledby': 'nb-title' });
    const card = h('div', { class: 'card notebook' });
    append(wrap, card);
    wrap.addEventListener('mousedown', (e) => { if (e.target === wrap) entry?.close('backdrop'); });
    const tablist = h('div', { class: 'tabs', role: 'tablist', 'aria-label': 'Notebook sections' });
    tabBtns = {};
    for (const t of TABS) {
      const b = h('button', {
        class: 'tab', type: 'button', role: 'tab', id: `nb-tab-${t.id}`, 'aria-controls': 'nb-panel',
        onclick: () => { ctx.sound.play('click'); tab = t.id; renderTabs(); renderPanel(); },
        onkeydown: (e) => {
          const i = TABS.findIndex(x => x.id === tab);
          let j = null;
          if (e.key === 'ArrowRight') j = (i + 1) % TABS.length;
          if (e.key === 'ArrowLeft') j = (i - 1 + TABS.length) % TABS.length;
          if (j == null) return;
          e.preventDefault(); tab = TABS[j].id; renderTabs(); renderPanel(); tabBtns[tab].focus();
        },
      }, t.label);
      tabBtns[t.id] = b; append(tablist, b);
    }
    panel = h('div', { class: 'nb-panel', id: 'nb-panel', role: 'tabpanel', tabindex: '-1' });
    append(card, 
      h('header', { class: 'nb-head' },
        h('h2', { id: 'nb-title', class: 'nb-title' }, icon('book', { size: 20 }), ' Notebook'),
        tablist,
        closeButton(() => entry?.close('x'), 'Close notebook (N or Esc)')),
      panel);
    entry = ctx.modals.open(wrap, {
      kind: 'notebook', label: 'Notebook', initialFocus: `#nb-tab-${tab}`,
      onKey: (e) => {
        if ((e.key === 'n' || e.key === 'N') && !(e.target && /input|textarea/i.test(e.target.tagName))) { entry?.close('key'); return true; }
        return false;
      },
      onClose: () => { entry = null; },
    });
    renderTabs(); renderPanel();
  }

  function renderTabs() {
    for (const t of TABS) {
      const on = t.id === tab;
      tabBtns[t.id].setAttribute('aria-selected', String(on));
      tabBtns[t.id].tabIndex = on ? 0 : -1;
      tabBtns[t.id].classList.toggle('on', on);
    }
    panel?.setAttribute('aria-labelledby', `nb-tab-${tab}`);
  }

  function renderPanel() {
    if (!panel) return;
    clear(panel);
    ({ notes: renderNotes, map: renderMap, glossary: renderGlossary, log: renderLog })[tab]();
  }

  // ── Field Notes ──
  function renderNotes() {
    store.markLesson(course);
    const list = h('ul', { class: 'nb-courses', 'aria-label': 'Courses' }, COURSES.map(c => h('li', null,
      h('button', {
        class: `nb-course${c.id === course ? ' on' : ''}`, type: 'button', 'aria-current': c.id === course ? 'true' : null,
        onclick: () => { course = c.id; renderPanel(); panel.querySelector('.nb-detail')?.focus(); },
      }, h('span', { class: 'swatch', style: { background: c.color }, 'aria-hidden': 'true' }), h('span', null, c.short),
      store.profile.lessonsSeen.includes(c.id) ? h('span', { class: 'seen', 'aria-label': 'read' }, icon('check', { size: 12 })) : null))));
    const c = COURSE_BY_ID[course];
    const L = lessonFor(course);
    const detail = h('article', { class: 'nb-detail', tabindex: '-1', 'aria-labelledby': 'nb-course-title' });
    append(detail, h('div', { class: 'eyebrow' }, 'InterNACHI NC pre-licensing'),
      h('h3', { id: 'nb-course-title', class: 'nb-course-title' }, c.title));
    if (!L) {
      append(detail, h('p', { class: 'muted' }, 'Field notes for this course are on their way. Meanwhile, the checkpoints tagged to it in the house will teach you the essentials.'));
    } else {
      append(detail, h('div', { class: 'seg', role: 'radiogroup', 'aria-label': 'How much detail' }, SIZES.map(sz =>
        h('button', { class: `seg-btn${sz.id === size ? ' on' : ''}`, type: 'button', role: 'radio', 'aria-checked': String(sz.id === size), onclick: () => { size = sz.id; renderPanel(); panel.querySelector('.seg-btn.on')?.focus(); } }, sz.label))));
      if (size === 'line') append(detail, h('p', { class: 'nb-line' }, clean(L.oneLine)));
      if (size === 'para' || size === 'full') append(detail, h('p', { class: 'nb-para' }, clean(L.paragraph || L.oneLine)));
      if (size === 'full') {
        if (L.lookFor?.length) append(detail, h('h4', null, 'What to look for'), h('ul', { class: 'nb-look' }, L.lookFor.map(x => h('li', null, clean(x)))));
      }
      if (L.keyNumbers?.length && size !== 'line') append(detail, h('h4', null, 'Key numbers'),
        h('table', { class: 'nb-keys' }, h('tbody', null, L.keyNumbers.map(k => h('tr', null, h('th', { scope: 'row' }, clean(k.k)), h('td', null, clean(k.v))))))) ;
      if (L.mnemonic && size !== 'line') append(detail, h('p', { class: 'nb-mnemonic' }, h('strong', null, 'Memory hook: '), clean(L.mnemonic)));
      if (L.wobble) append(detail, h('div', { class: 'wobble' }, h('div', { class: 'section-label' }, 'The wobble question'), h('p', null, clean(L.wobble)), h('p', { class: 'muted small' }, 'Answer it by doing something in the house, not by reciting.')));
    }
    const cps = checkpointsForCourse(course);
    const logged = cps.filter(cp => store.isLogged(cp.id)).length;
    const qs = allQuizzes().filter(q => q.course === course);
    append(detail, h('div', { class: 'nb-actions' },
      h('span', { class: 'muted small' }, `${logged} of ${cps.length} checkpoints logged this inspection`),
      qs.length ? h('button', { class: 'btn btn-ghost btn-sm', type: 'button', onclick: () => ctx.quiz.forCourse(course) }, icon('quiz', { size: 15 }), ' Quiz me on this') : null));
    append(panel, h('div', { class: 'nb-notes' }, list, detail));
  }

  // ── Course Map ──
  function renderMap() {
    const qsAll = allQuizzes();
    let totalCp = 0, totalLogged = 0;
    const cards = COURSES.map(c => {
      const cps = checkpointsForCourse(c.id);
      const logged = cps.filter(cp => store.isLogged(cp.id)).length;
      const lifetime = store.profile.coursesTouched[c.id] || 0;
      const qs = qsAll.filter(q => q.course === c.id);
      const qc = qs.filter(q => store.profile.quizzes[q.id]?.correct).length;
      totalCp += cps.length; totalLogged += logged;
      const pct = cps.length ? logged / cps.length : 0;
      return h('li', { class: 'cm-card', style: { '--c': c.color } },
        h('button', { class: 'cm-btn', type: 'button', onclick: () => { course = c.id; tab = 'notes'; renderTabs(); renderPanel(); } },
          h('div', { class: 'cm-top' }, h('span', { class: 'swatch', style: { background: c.color }, 'aria-hidden': 'true' }), h('span', { class: 'cm-short' }, c.short),
            store.profile.lessonsSeen.includes(c.id) ? h('span', { class: 'seen', title: 'Field notes read' }, icon('book', { size: 13 })) : null),
          h('div', { class: 'cm-title' }, c.title),
          h('div', { class: 'cm-row' }, h('span', null, 'Checkpoints'), h('span', null, `${logged}/${cps.length}`)),
          h('div', { class: 'bar thin', role: 'presentation' }, h('div', { class: 'bar-fill', style: { width: `${pct * 100}%`, background: c.color } })),
          h('div', { class: 'cm-row' }, h('span', null, 'Quizzes right'), h('span', null, qs.length ? `${qc}/${qs.length}` : 'coming')),
          qs.length ? h('div', { class: 'bar thin', role: 'presentation' }, h('div', { class: 'bar-fill', style: { width: `${(qc / qs.length) * 100}%` } })) : null,
          lifetime ? h('div', { class: 'cm-life muted small' }, `${lifetime} logged across all inspections`) : null));
    });
    const loggedAll = CHECKPOINTS.filter(cp => store.isLogged(cp.id)).length;
    const touched = COURSES.filter(c => checkpointsForCourse(c.id).some(cp => store.isLogged(cp.id))).length;
    void totalCp; void totalLogged;
    append(panel, h('p', { class: 'nb-intro' }, `Every checkpoint in the house is tagged to one or more of InterNACHI's 20 NC courses. This inspection you've logged ${loggedAll} of ${CHECKPOINTS.length} checkpoints, touching ${touched} of 20 courses. Pick a course to read its Field Notes.`),
      h('ul', { class: 'cm-grid' }, cards));
  }

  // ── Glossary ──
  function renderGlossary() {
    const all = glossary();
    const input = h('input', { type: 'search', class: 'search', placeholder: 'Search terms, e.g. TPR, GFCI, efflorescence', 'aria-label': 'Search the glossary', value: query });
    const list = h('dl', { class: 'gloss' });
    const count = h('p', { class: 'muted small', 'aria-live': 'polite' });
    function fill() {
      clear(list);
      const q = query.trim().toLowerCase();
      const rows = q ? all.filter(r => r.term.toLowerCase().includes(q) || r.def.toLowerCase().includes(q)) : all;
      count.textContent = all.length ? `${rows.length} of ${all.length} terms` : '';
      if (!all.length) { append(list, h('p', { class: 'muted' }, 'The glossary is still being written. Field Notes and the feedback after each finding cover the key terms meanwhile.')); return; }
      if (!rows.length) { append(list, h('p', { class: 'muted' }, `Nothing matches "${query}". Try a shorter word.`)); return; }
      for (const r of rows) append(list, h('div', { class: 'gloss-row' }, h('dt', null, clean(r.term), r.course && COURSE_BY_ID[r.course] ? h('span', { class: 'chip chip-course sm' }, COURSE_BY_ID[r.course].short) : null), h('dd', null, clean(r.def))));
    }
    input.addEventListener('input', () => { query = input.value; fill(); });
    append(panel, h('div', { class: 'search-row' }, icon('search', { size: 18 }), input), count, list);
    fill();
    requestAnimationFrame(() => input.focus());
  }

  // ── Logbook ──
  function renderLog() {
    const logged = CHECKPOINTS.filter(cp => store.isLogged(cp.id));
    if (!logged.length) {
      append(panel, h('div', { class: 'empty' }, h('p', null, 'Nothing logged yet.'), h('p', { class: 'muted' }, 'Walk up to something, click it, then click a part of it to make your first call.')));
      return;
    }
    append(panel, h('p', { class: 'nb-intro' }, `${logged.length} of ${CHECKPOINTS.length} checkpoints logged in inspection ${store.inspection.id}.`));
    for (const z of ZONES) {
      const rows = logged.filter(cp => cp.zone === z.id);
      if (!rows.length) continue;
      append(panel, h('h4', { class: 'log-zone' }, z.name),
        h('ul', { class: 'log-list' }, rows.map(cp => {
          const e = store.inspection.logged[cp.id];
          return h('li', { class: 'log-row' },
            h('span', { class: `mark ${e.sevScore === 'exact' ? 'good' : e.sevScore === 'near' ? 'near' : 'bad'}`, role: 'img', 'aria-label': e.sevScore === 'exact' ? 'right' : e.sevScore === 'near' ? 'close' : 'missed' }, icon(e.sevScore === 'wrong' ? 'x' : 'check', { size: 13 })),
            h('div', { class: 'log-main' }, h('div', { class: 'log-title' }, cpTitle(cp)), h('div', { class: 'muted small' }, `${clean(COMPONENT_BY_ID[cp.componentId]?.name)} · ${REC[e.rec]?.label || e.rec}`),
              e.note ? h('div', { class: 'log-note' }, `"${e.note}"`) : null),
            sevPill(SEV[e.severity], 'sm'),
            h('button', { class: 'btn btn-ghost btn-sm', type: 'button', onclick: () => { entry?.close('goto'); bus.emit('ui:goto-component', { componentId: cp.componentId }); } }, 'Go there'));
        })));
    }
  }

  return {
    open: (which, opts) => open(which, opts),
    openCourse: (c) => open('notes', { course: c }),
    toggle: () => (entry ? entry.close('key') : open()),
    close: () => entry?.close('external'),
    get isOpen() { return !!entry; },
  };
}
