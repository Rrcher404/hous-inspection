// Item-writing flaw audit for the quiz bank (Lindqvist's habit: measure, paste numbers, re-run after fixes).
//   node scripts/quiz-audit.mjs                 -> audit src/data/quizzes.js
//   node scripts/quiz-audit.mjs patch.json ...  -> audit with patches applied ({ id: { right, wrong:[3], explain? } })
//   add --list to print the flagged items, --only=course1,course2 to audit some courses
import { readFileSync } from 'node:fs';
import { QUIZZES } from '../src/data/quizzes.js';

const ABS = /\b(always|never|only|all|none|every|must|cannot|any)\b/i;

/** Per-item length cues. Returns flags for one question given its right answer and distractors. */
export function lengthFlags(right, wrong) {
  const all = [right, ...wrong];
  const lens = all.map(s => s.length);
  const max = Math.max(...lens), mean = lens.reduce((a, b) => a + b, 0) / lens.length;
  const othersMax = Math.max(...wrong.map(s => s.length));
  return {
    keyLongest: right.length === max && right.length > othersMax,   // strictly longest = a giveaway
    keyShortest: right.length < Math.min(...wrong.map(w => w.length)), // the reverse cue, if overcorrected
    keyStandsOut: right.length > othersMax * 1.25 && right.length - othersMax > 12,
    keyRatio: right.length / mean,
    absWrongOnly: wrong.some(w => ABS.test(w)) && !ABS.test(right),
  };
}

export function audit(items) {
  let longest = 0, shortest = 0, standsOut = 0, absWrong = 0, ratioSum = 0;
  const flagged = [];
  for (const it of items) {
    const f = lengthFlags(it.right, it.wrong);
    if (f.keyLongest) longest++;
    if (f.keyShortest) shortest++;
    if (f.keyStandsOut) { standsOut++; flagged.push(it.id); }
    if (f.absWrongOnly) absWrong++;
    ratioSum += f.keyRatio;
  }
  const n = items.length;
  return { n, longest, longestPct: Math.round((longest / n) * 100), shortestPct: Math.round((shortest / n) * 100), standsOut, absWrongOnly: absWrong, meanKeyRatio: +(ratioSum / n).toFixed(2), flagged };
}

export const asItems = (quizzes) => quizzes.map(q => ({ id: q.id, course: q.course, right: q.choices[q.answer], wrong: q.choices.filter((_, i) => i !== q.answer) }));

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const list = args.includes('--list');
  const only = (args.find(a => a.startsWith('--only=')) || '').slice(7).split(',').filter(Boolean);
  let items = asItems(QUIZZES).filter(it => !only.length || only.includes(it.course));
  for (const p of args.filter(a => a.endsWith('.json'))) {
    const patch = JSON.parse(readFileSync(p, 'utf8'));
    items = items.map(it => patch[it.id] ? { ...it, right: patch[it.id].right ?? it.right, wrong: patch[it.id].wrong ?? it.wrong } : it);
  }
  const r = audit(items);
  console.log(`items ${r.n} | key strictly longest ${r.longest} (${r.longestPct}%, chance is 25%) | key strictly shortest ${r.shortestPct}% | key stands out by length ${r.standsOut} | absolutes only in distractors ${r.absWrongOnly} | mean key/option length ${r.meanKeyRatio}`);
  if (list) for (const id of r.flagged) console.log('  stands out:', id);
}
