// Exam Mode: 25 random questions from the whole bank, paced like the NC Board exam
// (HILB 905: 200 questions, 4 hours, closed book, 70% to pass), score at the end.
import { h, clear, shuffled, append } from './dom.js';
import { say } from './touch.js';
import { icon } from './icons.js';
import { closeButton, confirmDialog } from './modals.js';
import { clean, courseShort, allQuizzes } from './content.js';

const N = 25;
const SEC_PER_Q = 72; // NC Board exam: 200 questions in 4 hours
const PASS = 70;      // NC Board exam pass mark (%)

export function createExam(ctx) {
  const { store } = ctx;
  let entry = null, card = null, timer = 0;
  let opts = { timed: false, reveal: false };
  let run = null; // { qs, i, answers[], picked, startedAt, deadline }

  function open() {
    if (entry) return;
    const wrap = h('div', { class: 'screen screen-exam', 'aria-labelledby': 'ex-title' });
    card = h('div', { class: 'card exam' });
    append(wrap, h('div', { class: 'exam-shell' }, card));
    entry = ctx.modals.open(wrap, {
      kind: 'exam', label: 'Exam Mode', onKey, dismissable: true,
      onClose: () => { clearInterval(timer); entry = null; run = null; },
    });
    renderSetup();
  }

  function onKey(e) {
    if (!run || run.done || e.metaKey || e.ctrlKey) return false;
    const q = run.qs[run.i];
    const n = parseInt(e.key, 10);
    if (n >= 1 && n <= q.choices.length && !(opts.reveal && run.locked)) { pick(n - 1); return true; }
    if (e.key === 'Enter' && run.picked != null && !(e.target && e.target.tagName === 'BUTTON')) { commit(); return true; }
    if (e.key === 'Escape') { quit(); return true; }
    return false;
  }

  function renderSetup() {
    clear(card);
    const bank = allQuizzes();
    const n = Math.min(N, bank.length);
    const sw = (key, label, desc) => {
      const on = opts[key];
      return h('div', { class: 'st-row' },
        h('div', null, h('div', { class: 'st-label', id: `ex-${key}` }, label), h('div', { class: 'muted small' }, desc)),
        h('button', { class: `switch${on ? ' on' : ''}`, type: 'button', role: 'switch', 'aria-checked': String(on), 'aria-labelledby': `ex-${key}`, onclick: () => { opts[key] = !on; ctx.sound.play('click'); renderSetup(); card.querySelector(`[aria-labelledby="ex-${key}"]`)?.focus(); } }, h('span', { class: 'knob' })));
    };
    append(card, 
      h('header', { class: 'dialog-head' }, h('div', null, h('div', { class: 'eyebrow' }, 'Exam Mode'), h('h2', { id: 'ex-title', class: 'dialog-title' }, 'A practice run at the NC Board exam')), closeButton(() => entry?.close('x'))),
      bank.length
        ? h('p', null, `${n} questions drawn at random from all 20 courses. The NC Board exam is 200 questions in four hours, closed book, about 72 seconds each, and passes at 70%. Its first content block is the NC Standards of Practice. This is a short, honest slice of that.`)
        : h('p', { class: 'muted' }, 'The question bank is still being written. Check back soon.'),
      sw('timed', `Timed (${Math.round((n * SEC_PER_Q) / 60)} minutes)`, 'Same pace as the real exam. Unanswered questions count as wrong when time runs out.'),
      sw('reveal', 'Show answers as I go', 'Off is exam-style: you only see results at the end.'),
      h('footer', { class: 'dialog-actions' },
        h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => entry?.close('x') }, 'Not now'),
        h('button', { class: 'btn btn-primary btn-lg', type: 'button', disabled: !bank.length, 'data-autofocus': '', onclick: start }, 'Begin exam')));
  }

  function start() {
    ctx.sound.unlock(); ctx.sound.play('click');
    const qs = shuffled(allQuizzes()).slice(0, N);
    run = { qs, i: 0, answers: new Array(qs.length).fill(null), picked: null, locked: false, startedAt: Date.now(), done: false };
    if (opts.timed) {
      run.deadline = Date.now() + qs.length * SEC_PER_Q * 1000;
      timer = setInterval(tick, 1000);
    }
    renderQ();
  }

  function tick() {
    if (!run || run.done) return clearInterval(timer);
    const left = Math.max(0, run.deadline - Date.now());
    const el = card.querySelector('.ex-timer');
    if (el) { el.textContent = fmt(left); el.classList.toggle('low', left < 120000); }
    if (left <= 0) { clearInterval(timer); finish(true); }
  }

  function pick(idx) {
    if (run.locked) return;
    run.picked = idx;
    ctx.sound.play('select');
    if (opts.reveal) { commit(); return; }
    renderQ();
  }

  function commit() {
    if (run.picked == null) return;
    const q = run.qs[run.i];
    if (!run.locked) {
      run.answers[run.i] = run.picked;
      store.answerQuiz(q, run.picked);
      if (opts.reveal) { run.locked = true; ctx.sound.play(run.picked === q.answer ? 'correct' : 'wrong'); renderQ(); return; }
    }
    next();
  }

  function next() {
    run.locked = false;
    if (run.i < run.qs.length - 1) { run.i++; run.picked = run.answers[run.i]; renderQ(); }
    else finish(false);
  }

  function renderQ() {
    clear(card);
    const q = run.qs[run.i];
    const left = run.deadline ? Math.max(0, run.deadline - Date.now()) : null;
    append(card, h('header', { class: 'ex-head' },
      h('div', { class: 'ex-progress' },
        h('div', { class: 'eyebrow' }, `Question ${run.i + 1} of ${run.qs.length} · ${courseShort(q.course)}`),
        h('div', { class: 'bar thin', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': run.qs.length, 'aria-valuenow': run.i + 1, 'aria-label': 'Exam progress' },
          h('div', { class: 'bar-fill', style: { width: `${((run.i + 1) / run.qs.length) * 100}%` } }))),
      left != null ? h('div', { class: 'ex-timer', 'aria-label': 'Time left', role: 'timer' }, fmt(left)) : null,
      h('button', { class: 'btn btn-ghost btn-sm', type: 'button', onclick: quit }, 'End exam')));
    append(card, h('h2', { class: 'qz-q', id: 'ex-q', tabindex: '-1' }, clean(q.q)));
    const list = h('ol', { class: 'qz-choices', role: 'radiogroup', 'aria-labelledby': 'ex-q' });
    q.choices.forEach((c, idx) => {
      let cls = 'qz-choice';
      const sel = run.picked === idx;
      if (run.locked) cls += idx === q.answer ? ' right' : sel ? ' wrong' : ' dim';
      else if (sel) cls += ' picked';
      append(list, h('li', null, h('button', {
        class: cls, type: 'button', role: 'radio', 'aria-checked': String(sel), disabled: run.locked ? true : null,
        onclick: () => pick(idx),
      }, h('span', { class: 'qz-key', 'aria-hidden': 'true' }, String(idx + 1)), h('span', null, clean(c)))));
    });
    append(card, list);
    if (run.locked) {
      const ok = run.answers[run.i] === q.answer;
      append(card, h('div', { class: `qz-feedback ${ok ? 'good' : 'bad'}`, role: 'status' }, h('div', { class: 'verdict-title' }, ok ? 'Correct.' : 'Not this time.'), h('p', null, clean(q.explain || ''))));
    }
    const last = run.i === run.qs.length - 1;
    const btn = h('button', { class: 'btn btn-primary', type: 'button', disabled: run.picked == null, onclick: commit },
      run.locked || !opts.reveal ? (last ? 'Finish exam' : 'Next') : 'Check', icon('next', { size: 16 }));
    append(card, h('footer', { class: 'qz-foot' }, h('span', { class: 'muted small' }, run.locked ? say('Press Enter to continue.', '') : say('Keys 1 to 4 choose. Enter confirms.', 'Tap an answer, then confirm.')), btn));
    requestAnimationFrame(() => (run.locked || run.picked != null ? btn : card.querySelector('#ex-q'))?.focus({ preventScroll: true }));
  }

  async function quit() {
    if (!run || run.done) { entry?.close('x'); return; }
    const answered = run.answers.filter(a => a != null).length;
    const ok = await confirmDialog(ctx, { title: 'End the exam now?', body: h('p', null, `You've answered ${answered} of ${run.qs.length}. We'll score what you have.`), confirm: 'Score it', cancel: 'Keep going', focusCancel: true }); // Esc then Enter must not end the exam
    if (ok) finish(false);
  }

  function finish(timeUp) {
    clearInterval(timer);
    run.done = true;
    const total = run.qs.length;
    const right = run.qs.filter((q, i) => run.answers[i] === q.answer).length;
    const pct = Math.round((right / total) * 100);
    const mins = Math.round((Date.now() - run.startedAt) / 60000);
    const byCourse = {};
    run.qs.forEach((q, i) => { const c = (byCourse[q.course] ||= { n: 0, r: 0 }); c.n++; if (run.answers[i] === q.answer) c.r++; });
    const weak = Object.entries(byCourse).filter(([, v]) => v.r < v.n).sort((a, b) => (a[1].r / a[1].n) - (b[1].r / b[1].n)).slice(0, 4);
    ctx.sound.play(pct >= PASS ? 'correct' : 'near');
    clear(card);
    append(card, 
      h('header', { class: 'dialog-head' }, h('div', null, h('div', { class: 'eyebrow' }, timeUp ? 'Time is up' : 'Exam complete'), h('h2', { class: 'dialog-title', id: 'ex-title', tabindex: '-1' }, `${right} of ${total} correct`)), closeButton(() => entry?.close('x'))),
      h('div', { class: 'ex-score' },
        h('div', { class: `grade ${pct >= PASS ? 'grade-A' : pct >= PASS - 10 ? 'grade-C' : 'grade-F'}` }, `${pct}%`),
        h('div', null,
          h('p', { class: 'ex-pass' }, h('strong', null, `Pass mark: ${PASS}%. `), pct >= PASS ? 'You cleared it on this run.' : `You were ${PASS - pct} points short this run.`),
          h('p', null, pct >= PASS ? 'Keep clearing it across several runs before you trust it.' : pct >= PASS - 10 ? 'Getting there. Review the misses below, then read Field Notes for the weak spots.' : 'Plenty to learn from here. Review the explanations below, then read Field Notes for the weak spots.'),
          h('p', { class: 'muted small' }, `${mins} min · The NC Board exam passes at 70%. Treat this as a study signal: 25 questions from a bank you may have seen before is not a prediction.`))),
      weak.length ? h('div', { class: 'ex-weak' }, h('div', { class: 'section-label' }, 'Worth a review'),
        h('div', { class: 'chips' }, weak.map(([c, v]) => h('button', { class: 'chip chip-btn chip-course', type: 'button', onclick: () => ctx.notebook.openCourse(c) }, `${courseShort(c)} ${v.r}/${v.n}`)))) : null,
      h('details', { class: 'ex-review', open: true }, h('summary', null, 'Review every question'),
        h('ol', { class: 'ex-list' }, run.qs.map((q, i) => {
          const a = run.answers[i];
          const ok = a === q.answer;
          return h('li', { class: `ex-item ${ok ? 'good' : 'bad'}` },
            h('div', { class: 'ex-q' }, icon(ok ? 'check' : 'x', { size: 15 }), ' ', clean(q.q)),
            !ok ? h('div', { class: 'small' }, h('span', { class: 'muted' }, 'You: '), a == null ? 'no answer' : clean(q.choices[a])) : null,
            h('div', { class: 'small' }, h('span', { class: 'muted' }, 'Answer: '), clean(q.choices[q.answer])),
            h('p', { class: 'small muted' }, clean(q.explain || '')));
        }))),
      h('footer', { class: 'dialog-actions' },
        h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => entry?.close('done') }, 'Close'),
        h('button', { class: 'btn btn-primary', type: 'button', onclick: () => { run = null; renderSetup(); } }, 'Take another')));
    requestAnimationFrame(() => { card.querySelector('#ex-title')?.focus({ preventScroll: true }); const sc = card.closest('.screen'); if (sc) sc.scrollTop = 0; });
  }

  return { open, close: () => entry?.close('external') };
}

function fmt(ms) {
  const s = Math.ceil(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
