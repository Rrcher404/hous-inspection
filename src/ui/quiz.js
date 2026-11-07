// Quiz modal: pop quizzes, room checks, and per-course practice. Keys 1 to 4.
// Choices are shuffled every showing. A first wrong pick gets a hint aimed at that option and one
// retry (Lindqvist's feedback ladder); then the worked explanation. The first-try XP bonus only
// goes to a right first pick. Exam Mode (exam.js) shuffles too but never hints.
import { h, clear, append } from './dom.js';
import { say } from './touch.js';
import { icon } from './icons.js';
import { closeButton } from './modals.js';
import { ZONE_BY_ID } from '../data/manifest.js';
import { clean, courseShort, allQuizzes, hintFor, shuffleChoices, noRetry } from './content.js';

export function createQuiz(ctx) {
  const { store } = ctx;

  /** run(list, { title, allowSkip, retry = true, onDone({answered, correct, total}) }) */
  function run(list, opts = {}) {
    const qs = list.filter(Boolean).map(shuffleChoices);
    const retryOn = opts.retry !== false;
    if (!qs.length) { ctx.toasts.info('No questions here yet', 'The question bank for this topic is still being written.'); opts.onDone?.({ answered: 0, correct: 0, total: 0 }); return; }
    let i = 0, picked = null, firstWrong = null, correct = 0, second = 0, answered = 0, gainedTotal = 0;
    const wrap = h('div', { class: 'modal-wrap center', 'aria-labelledby': 'qz-q' });
    const card = h('div', { class: 'card quiz' });
    append(wrap, card);
    const entry = ctx.modals.open(wrap, {
      kind: 'quiz', label: opts.title || 'Quiz', onKey,
      onClose: () => opts.onDone?.({ answered, correct, total: qs.length }),
    });

    function onKey(e) {
      if (e.metaKey || e.ctrlKey || e.altKey) return false;
      const q = qs[i];
      if (!q) return false;
      const n = parseInt(e.key, 10);
      if (picked == null && n >= 1 && n <= q.choices.length && n - 1 !== firstWrong) { choose(n - 1); return true; }
      if (picked != null && e.key === 'Enter' && !(e.target && e.target.tagName === 'BUTTON')) { next(); return true; }
      return false;
    }

    function choose(idx) {
      if (picked != null || idx === firstWrong) return;
      const q = qs[i];
      const r = store.answerQuiz(q, idx, { assisted: firstWrong != null }); // a retry-correct is practice, not mastery
      gainedTotal += r.gained || 0;
      if (!r.correct && retryOn && firstWrong == null && !noRetry(q)) {
        firstWrong = idx;
        ctx.sound.play('wrong');
        render();
        return;
      }
      picked = idx;
      answered++;
      if (r.correct) { if (firstWrong == null) correct++; else second++; }
      ctx.sound.play(r.correct ? 'correct' : 'wrong');
      render(r);
    }

    function next() {
      ctx.sound.play('click');
      if (i < qs.length - 1) { i++; picked = null; firstWrong = null; render(); }
      else if (qs.length > 1) renderSummary();
      else entry.close('done');
    }

    function render(result) {
      const q = qs[i];
      clear(card);
      append(card, h('header', { class: 'qz-head' },
        h('div', { class: 'eyebrow' }, `${opts.title || 'Quiz'} · ${courseShort(q.course)}`, qs.length > 1 ? h('span', { class: 'muted' }, `  ${i + 1} of ${qs.length}`) : null),
        closeButton(() => entry.close('x'), picked == null ? 'Skip for now' : 'Close')));
      append(card, h('h2', { id: 'qz-q', class: 'qz-q', tabindex: '-1', 'data-autofocus': picked == null ? '' : null }, clean(q.q)));
      const list = h('ol', { class: 'qz-choices', role: 'list' });
      q.choices.forEach((c, idx) => {
        let cls = 'qz-choice';
        const struck = picked == null && idx === firstWrong;
        if (struck) cls += ' wrong';
        if (picked != null) {
          if (idx === q.answer) cls += ' right';
          else if (idx === picked) cls += ' wrong';
          else cls += ' dim';
        }
        append(list, h('li', null, h('button', {
          class: cls, type: 'button', disabled: picked != null || struck ? true : null,
          onclick: () => choose(idx),
          'aria-label': `${idx + 1}. ${clean(c)}${picked != null && idx === q.answer ? ', correct answer' : ''}${(picked === idx || struck) && idx !== q.answer ? ', your answer, not right' : ''}`,
        }, h('span', { class: 'qz-key', 'aria-hidden': 'true' }, String(idx + 1)), h('span', null, clean(c)),
        picked != null && idx === q.answer ? icon('check', { size: 18 }) : picked === idx || struck || (picked != null && idx === firstWrong) ? icon('x', { size: 18 }) : null)));
      });
      append(card, list);
      if (picked == null && firstWrong != null) {
        const hint = hintFor(q, q.choices[firstWrong]);
        append(card, h('div', { class: 'qz-feedback hint', role: 'status' },
          h('div', { class: 'verdict-title' }, 'Not quite. One more try.'),
          h('p', null, clean(hint || 'Read the question again, slowly: what exactly is it asking you to decide?'))));
      }
      if (picked == null) {
        append(card, h('footer', { class: 'qz-foot' },
          h('span', { class: 'muted small' }, say('Press 1 to 4, or click an answer.', 'Tap an answer.')),
          opts.allowSkip !== false ? h('button', { class: 'btn btn-ghost btn-sm', type: 'button', onclick: () => entry.close('skip') }, 'Skip for now') : null));
      } else {
        const ok = picked === q.answer;
        const retried = firstWrong != null;
        append(card, h('div', { class: `qz-feedback ${ok ? 'good' : 'bad'}`, role: 'status' },
          h('div', { class: 'verdict-title' }, ok ? (retried ? 'Right on the second try.' : 'Correct.') : 'Not this time.'),
          h('p', null, clean(q.explain || '')),
          result?.gained ? h('div', { class: 'qz-xp' }, `+${result.gained} XP`) : ok && !retried ? h('div', { class: 'muted small' }, 'Already answered before, no new XP.') : null,
          ok && retried ? h('div', { class: 'muted small' }, 'This one will come back later, so you can get it on the first try.') : null));
        const last = i === qs.length - 1;
        const btn = h('button', { class: 'btn btn-primary', type: 'button', onclick: next }, last ? (qs.length > 1 ? 'See how you did' : 'Continue') : 'Next question', icon('next', { size: 16 }));
        append(card, h('footer', { class: 'qz-foot' }, h('span', { class: 'muted small' }, say('Press Enter to continue.', '')), btn));
        requestAnimationFrame(() => btn.focus({ preventScroll: true }));
      }
    }

    function renderSummary() {
      clear(card);
      const pct = Math.round((correct / qs.length) * 100);
      append(card, h('header', { class: 'qz-head' }, h('div', { class: 'eyebrow' }, opts.title || 'Quiz'), closeButton(() => entry.close('x'))),
        h('h2', { class: 'qz-q', id: 'qz-q' }, `You got ${correct} of ${qs.length} on the first try.`),
        second ? h('p', { class: 'muted' }, `${second} more on the second try, after a hint.`) : null,
        h('p', null, pct === 100 ? 'Clean sweep. That room is in your head now.' : pct >= 60 ? 'Solid. The ones you missed are worth a look in Field Notes.' : 'Worth another pass. Field Notes for these courses will help.'),
        gainedTotal ? h('div', { class: 'qz-xp' }, `+${gainedTotal} XP`) : null,
        h('footer', { class: 'qz-foot' }, h('span'), h('button', { class: 'btn btn-primary', type: 'button', 'data-autofocus': '', onclick: () => entry.close('done') }, 'Back to the house')));
      requestAnimationFrame(() => card.querySelector('[data-autofocus]')?.focus());
    }

    render();
    return entry;
  }

  /**
   * Pick n questions for a set of courses: not-yet-correct first, then ascending difficulty so the
   * difficulty-1 prerequisite questions come before the harder ones. Room checks prefer quizzes with
   * no component link (those are written for room checks and Exam Mode).
   */
  function pickFor(courses, n) {
    const pool = allQuizzes().filter(q => courses.includes(q.course));
    const key = (q) => [store.profile.quizzes[q.id]?.correct ? 1 : 0, q.difficulty ?? 2, (q.components || []).length ? 1 : 0, Math.random()];
    const cmp = (a, b) => { for (let i = 0; i < a[0].length; i++) if (a[0][i] !== b[0][i]) return a[0][i] - b[0][i]; return 0; };
    return pool.map(q => [key(q), q]).sort(cmp).slice(0, n).map(x => x[1])
      .sort((a, b) => (a.difficulty ?? 2) - (b.difficulty ?? 2));
  }

  function roomCheck(zoneId) {
    const z = ZONE_BY_ID[zoneId];
    const qs = pickFor(z?.courses || [], 3);
    return run(qs, { title: `Room check: ${z?.name || 'room'}` });
  }

  function forCourse(courseId, n = 3) {
    return run(pickFor([courseId], n), { title: 'Practice' });
  }

  return { run, roomCheck, forCourse, pickFor };
}
