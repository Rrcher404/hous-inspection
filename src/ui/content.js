// Defensive accessors for content files that other agents are writing in parallel.
// Every accessor degrades gracefully when an entry (or the whole export) is missing.
import * as CP from '../data/checkpoints.js';
import * as QZ from '../data/quizzes.js';
import * as LS from '../data/lessons.js';
import * as QH from '../data/quiz-hints.js';
import { SEVERITIES, RECOMMENDATIONS, TOOLS } from '../data/taxonomy.js';
import { COURSE_BY_ID } from '../data/courses.js';
import { CHECKPOINTS } from '../data/manifest.js';

/** Player-facing text: no em-dashes, ever. Content authors may slip one in. */
export function clean(str) {
  if (str == null) return '';
  return String(str)
    .replace(/\s*—\s*/g, ', ')   // em dash
    .replace(/\s+–\s+/g, ', ');  // spaced en dash used as a dash (keep 40–60 ranges)
}

export const cpContent = (id) => (CP.CHECKPOINT_CONTENT || {})[id] || null;

/** The answer block for a checkpoint in this inspection's state, or null. */
export function cpState(id, state) {
  const c = cpContent(id);
  if (!c) return null;
  return c[state] || null;
}

export const allQuizzes = () => (Array.isArray(QZ.QUIZZES) ? QZ.QUIZZES : []).filter(q => q && q.id && Array.isArray(q.choices));
/** Questions whose wrong options all dismiss the condition: any hint would give the key away, so no retry. */
export const noRetry = (q) => !!(QH.NO_RETRY && QH.NO_RETRY.includes(q?.id));
/** Hint aimed at one wrong option (by its text), or null. */
export const hintFor = (q, choiceText) => (QH.QUIZ_HINTS || {})[q?.id]?.[choiceText] || null;
/** A copy of the question with its choices in a fresh random order (the key moves with them). */
export function shuffleChoices(q) {
  const order = q.choices.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
  return { ...q, choices: order.map(i => q.choices[i]), answer: order.indexOf(q.answer) };
}
export const lessonFor = (courseId) => (LS.LESSONS || {})[courseId] || null;

export function glossary() {
  const g = CP.GLOSSARY;
  if (!g) return [];
  const rows = Array.isArray(g)
    ? g.map(x => (typeof x === 'string' ? { term: x, def: '' } : {
        term: x.term || x.word || x.name || x.t || '',
        def: x.def || x.definition || x.meaning || x.d || x.text || '',
        course: x.course || null,
      }))
    : Object.entries(g).map(([term, v]) => (typeof v === 'string' ? { term, def: v } : { term, def: v?.def || v?.definition || '', course: v?.course || null }));
  return rows.filter(r => r.term).sort((a, b) => a.term.localeCompare(b.term));
}

// Display labels (taxonomy's own label for OK contains an em-dash; we keep ours clean).
const SEV_DISPLAY = { safety: 'Safety hazard', major: 'Major defect', repair: 'Repair', monitor: 'Monitor', ok: 'Acceptable' };
export const SEV_LIST = SEVERITIES.map(sv => ({ ...sv, display: SEV_DISPLAY[sv.id] || clean(sv.label), hint: clean(sv.hint) }));
export const SEV = Object.fromEntries(SEV_LIST.map(x => [x.id, x]));
export const REC = Object.fromEntries(RECOMMENDATIONS.map(r => [r.id, r]));
export const TOOL = Object.fromEntries(TOOLS.map(t => [t.id, t]));
export const courseShort = (id) => COURSE_BY_ID[id]?.short || id;

export const checkpointsForCourse = (courseId) => CHECKPOINTS.filter(cp => cp.courses.includes(courseId));

/** Title shown after the click (content title) or the neutral label. */
export function cpTitle(cp) { return clean(cpContent(cp.id)?.title || cp.label); }
