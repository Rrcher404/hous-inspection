// Report screen: an NC-style inspection report built from what the player actually logged,
// graded, with missed items you can walk back to.
import { h, append } from './dom.js';
import { icon } from './icons.js';
import { ADDRESS, CHECKPOINT_BY_ID, COMPONENT_BY_ID, ZONE_BY_ID } from '../data/manifest.js';
import { clean, cpContent, cpState, cpTitle, SEV_LIST, SEV, REC, courseShort } from './content.js';
import { sevPill } from './logcard.js';

const GRADE_LINE = {
  A: 'Report-ready work. A client could rely on this.',
  B: 'Strong. A few calls to tighten up.',
  C: 'A fair first pass. The missed items below are where the learning is.',
  D: 'Some real gaps. Walk back through the missed items with Show me.',
  F: 'Plenty left on the table. That is what practice runs are for.',
};

export function createReport(ctx) {
  const { store, bus } = ctx;
  let entry = null;

  function open({ summary, xpEarned = 0 }) {
    if (entry) entry.close('replace');
    const S = summary;
    const ins = store.inspection;
    const date = new Date(ins.finishedAt || Date.now());
    const dateStr = date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    const rank = store.rank();

    const wrap = h('div', { class: 'screen screen-report', 'aria-labelledby': 'rp-title' });
    const doc = h('article', { class: 'report' });
    append(wrap, doc);

    // Toolbar (not printed)
    append(doc, h('div', { class: 'rp-toolbar no-print' },
      h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => backToTitle() }, icon('back', { size: 16 }), ' Back to title'),
      h('div', { class: 'rp-tools' },
        h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => { ctx.sound.play('click'); window.print(); } }, icon('print', { size: 16 }), ' Print'),
        h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => backToHouse() }, 'Keep walking this house'),
        h('button', { class: 'btn btn-primary', type: 'button', onclick: () => newInspection() }, 'New inspection'))));

    // Cover
    append(doc, h('section', { class: 'rp-cover' },
      h('div', { class: 'rp-brand' }, 'Walkthrough Inspector · Training Report'),
      h('h1', { id: 'rp-title', class: 'rp-h1' }, 'Home Inspection Report'),
      h('div', { class: 'rp-address' }, h('div', { class: 'rp-street' }, ADDRESS.street), h('div', null, ADDRESS.city)),
      h('dl', { class: 'rp-meta' },
        meta('Client', ADDRESS.client),
        meta('Date of inspection', dateStr),
        meta('Inspector', rank.title === 'Trainee' ? 'Trainee inspector' : `Trainee inspector (${rank.title})`),
        meta('Report no.', S.id),
        meta('Property', `${ADDRESS.style}. Built ${ADDRESS.built}, about ${ADDRESS.sqft.toLocaleString()} sq ft.`),
        meta('Standard', 'Written to the format of the NC Home Inspector Standards of Practice (training exercise).')),
      h('div', { class: 'rp-score' },
        h('div', { class: `grade grade-${S.grade}`, 'aria-label': `Grade ${S.grade}` }, S.grade),
        h('div', null,
          h('div', { class: 'rp-pct' }, `${S.pct}%`),
          h('div', { class: 'muted' }, `${S.pts} of ${S.maxPts} points`),
          h('div', { class: 'rp-gradeline' }, GRADE_LINE[S.grade] || '')),
        h('dl', { class: 'rp-stats' },
          stat('Checkpoints logged', `${S.loggedCount} / ${S.totalCheckpoints}`),
          stat('Defects found', `${S.foundCount} / ${S.defectCount}`),
          stat('Over-calls', String(S.falsePositives.length)),
          stat('Called with the guide open', String(Object.values(ins.logged).filter(e => e.guided).length)),
          stat('XP earned', `+${xpEarned + findingXP()}`)))));

    // Summary by severity (the player's own calls)
    const found = Object.keys(ins.logged).filter(id => ins.states[id] === 'defect' && ins.logged[id].severity !== 'ok');
    const sum = h('section', { class: 'rp-section' }, h('h2', null, 'Summary'),
      h('p', { class: 'muted' }, 'These are the defects you found, grouped by the severity you gave them, with the narrative a working inspector would write. Where the grader disagrees with your call, it says so.'));
    if (!found.length) append(sum, h('p', { class: 'empty' }, 'No defects were reported. Every house has something; the missed items below show where to look.'));
    for (const sv of SEV_LIST.filter(x => x.id !== 'ok')) {
      const rows = found.filter(id => ins.logged[id].severity === sv.id);
      if (!rows.length) continue;
      append(sum, h('h3', { class: 'rp-sev-h', style: { '--sev': sv.color } }, sevPill(sv), h('span', { class: 'muted' }, ` ${rows.length}`)));
      append(sum, h('ol', { class: 'rp-findings' }, rows.map(id => finding(id))));
    }
    append(doc, sum);

    // Missed
    const missed = h('section', { class: 'rp-section' }, h('h2', null, `Missed items (${S.missed.length})`),
      h('p', { class: 'muted' }, 'Real defects in this house that did not make your report, either never logged or logged as acceptable. Show me takes you straight to it.'));
    if (!S.missed.length) append(missed, h('p', { class: 'empty good' }, 'Nothing missed. Every defect in this house is in your report.'));
    else append(missed, h('ul', { class: 'rp-missed' }, sortMissed(S.missed).map(id => {
      const cp = CHECKPOINT_BY_ID[id];
      const sc = cpState(id, 'defect');
      const comp = COMPONENT_BY_ID[cp.componentId];
      const loggedOk = ins.logged[id]?.severity === 'ok';
      return h('li', { class: 'rp-miss' },
        h('div', { class: 'rp-miss-main' },
          h('div', { class: 'rp-miss-title' }, cpTitle(cp), sc ? sevPill(SEV[sc.severity], 'sm') : null),
          h('div', { class: 'muted small' }, `${ZONE_BY_ID[cp.zone]?.name} · ${clean(comp?.name)}${loggedOk ? ' · you logged it as acceptable' : ' · not logged'}${loggedOk && ins.logged[id].practice && ins.logged[id].practice.severity !== 'ok' ? ' (caught on a practice run, graded on your first call)' : ''}`),
          sc?.why ? (loggedOk ? h('p', { class: 'rp-why' }, clean(sc.why))
            : h('details', { class: 'rp-why-d' }, h('summary', null, 'Why it matters'), h('p', { class: 'rp-why' }, clean(sc.why)))) : null),
        h('button', { class: 'btn btn-ghost btn-sm no-print', type: 'button', onclick: () => showMe(cp.componentId) }, icon('pin', { size: 15 }), ' Show me'));
    })));
    append(doc, missed);

    // Over-calls
    if (S.falsePositives.length) {
      append(doc, h('section', { class: 'rp-section' }, h('h2', null, `Over-calls (${S.falsePositives.length})`),
        h('p', { class: 'muted' }, 'You flagged these, but they are acceptable as found. Over-calling worries buyers, can sink a sale, and costs you credibility. Here is why each one is fine.'),
        h('ul', { class: 'rp-missed' }, S.falsePositives.map(id => {
          const cp = CHECKPOINT_BY_ID[id];
          const sc = cpState(id, 'ok');
          return h('li', { class: 'rp-miss' }, h('div', { class: 'rp-miss-main' },
            h('div', { class: 'rp-miss-title' }, cpTitle(cp), h('span', { class: 'muted small' }, ' you called it '), sevPill(SEV[ins.logged[id].severity], 'sm')),
            h('p', { class: 'rp-why' }, sc?.why ? clean(sc.why) : 'Inspected and functioning as intended for its age and type.')),
          h('button', { class: 'btn btn-ghost btn-sm no-print', type: 'button', onclick: () => showMe(cp.componentId) }, icon('pin', { size: 15 }), ' Show me'));
        }))));
    }

    // Per-system table
    append(doc, h('section', { class: 'rp-section' }, h('h2', null, 'By area'),
      h('table', { class: 'rp-table' },
        h('thead', null, h('tr', null, h('th', { scope: 'col' }, 'Area'), h('th', { scope: 'col' }, 'Logged'), h('th', { scope: 'col' }, 'Defects found'), h('th', { scope: 'col' }, 'Coverage'))),
        h('tbody', null, S.byZone.filter(z => z.total).map(z => h('tr', null,
          h('th', { scope: 'row' }, z.name),
          h('td', null, `${z.logged} / ${z.total}`),
          h('td', null, `${z.found} / ${z.defects}`),
          h('td', null, h('div', { class: 'bar thin', role: 'img', 'aria-label': `${Math.round((z.logged / z.total) * 100)} percent` }, h('div', { class: 'bar-fill', style: { width: `${(z.logged / z.total) * 100}%` } })))))))));

    append(doc, h('footer', { class: 'rp-disclaimer' },
      h('strong', null, 'Training simulation. '),
      'This is not a real inspection report. The property, client, and conditions are fictional, generated for practice. Nothing here is professional, legal, or code advice. Severity and referral answers reflect common practice under the North Carolina Standards of Practice and may differ from your instructor or jurisdiction.'));

    entry = ctx.modals.open(wrap, {
      kind: 'report', label: 'Inspection report',
      onClose: (reason) => { entry = null; if (reason === 'escape') ctx.showTitle(); },
    });
    ctx.state.screen = 'report';
    ctx.hud.hide();
    requestAnimationFrame(() => doc.querySelector('.rp-h1')?.setAttribute('tabindex', '-1'));
  }

  function finding(id) {
    const e = store.inspection.logged[id];
    const cp = CHECKPOINT_BY_ID[id];
    const sc = cpState(id, store.stateOf(id));
    const comp = COMPONENT_BY_ID[cp.componentId];
    const want = sc ? SEV[sc.severity] : null;
    const off = want && want.id !== e.severity;
    return h('li', { class: 'rp-finding' },
      h('div', { class: 'rp-f-head' },
        h('span', { class: 'rp-f-title' }, cpTitle(cp)),
        h('span', { class: 'muted small' }, `${ZONE_BY_ID[cp.zone]?.name} · ${clean(comp?.name)}`)),
      h('p', { class: 'rp-narr' }, sc?.report ? clean(sc.report) : `${cpTitle(cp)} observed. Recommend evaluation by a qualified professional.`),
      e.note ? h('p', { class: 'rp-note' }, h('strong', null, 'Inspector note: '), e.note) : null,
      h('div', { class: 'rp-f-meta' },
        h('span', null, 'Refer to: ', h('strong', null, REC[e.rec]?.label || e.rec), e.recRight ? '' : h('span', { class: 'rp-flag' }, ` grader: ${REC[sc?.rec]?.label || 'see notes'}`)),
        off ? h('span', { class: 'rp-flag' }, 'grader: ', sevPill(want, 'sm')) : null,
        h('span', { class: 'chip chip-course sm' }, courseShort(cpContent(id)?.course || cp.courses[0]))));
  }

  // Logged-as-acceptable first (the most instructive misses), then by severity.
  function sortMissed(ids) {
    const L = store.inspection.logged;
    const rank = (id) => SEV[cpState(id, 'defect')?.severity]?.rank ?? 9;
    return ids.slice().sort((a, b) => (L[b] ? 1 : 0) - (L[a] ? 1 : 0) || rank(a) - rank(b));
  }

  function findingXP() {
    const L = store.inspection.logged;
    return Object.values(L).reduce((s, e) => s + (e.points || 0), 0);
  }

  function showMe(componentId) {
    ctx.sound.play('click');
    entry?.close('goto');
    ctx.enterGame();
    bus.emit('ui:goto-component', { componentId });
  }
  function backToTitle() { ctx.sound.play('click'); entry?.close('title'); ctx.showTitle(); }
  function backToHouse() { ctx.sound.play('click'); entry?.close('house'); ctx.enterGame(); }
  function newInspection() {
    ctx.sound.play('click');
    entry?.close('new');
    store.newInspection();
    ctx.enterGame();
    ctx.toasts.info('A new house, same address', 'Conditions are re-rolled. You cannot memorize it, only the method.', 3800);
  }

  return { open, close: () => entry?.close('external'), get isOpen() { return !!entry; } };
}

function meta(k, v) { return [h('dt', null, k), h('dd', null, v)]; }
function stat(k, v) { return h('div', { class: 'rp-stat' }, h('dt', null, k), h('dd', null, v)); }
