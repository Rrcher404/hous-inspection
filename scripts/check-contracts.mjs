// Node-side contract check for data files (models are audited in-browser by src/models/audit.js).
import { CHECKPOINTS, COMPONENTS, ZONES } from '../src/data/manifest.js';
import { COURSES } from '../src/data/courses.js';
import { SEVERITIES, RECOMMENDATIONS } from '../src/data/taxonomy.js';
import { CHECKPOINT_CONTENT } from '../src/data/checkpoints.js';
import { QUIZZES } from '../src/data/quizzes.js';
import { LESSONS } from '../src/data/lessons.js';

const sev = new Set(SEVERITIES.map(s => s.id));
const rec = new Set(RECOMMENDATIONS.map(r => r.id));
const courses = new Set(COURSES.map(c => c.id));
const comps = new Set(COMPONENTS.map(c => c.id));
const errs = [], warns = [];

for (const cp of CHECKPOINTS) {
  const c = CHECKPOINT_CONTENT[cp.id];
  if (!c) { errs.push(`content missing: ${cp.id}`); continue; }
  if (!courses.has(c.course)) errs.push(`${cp.id}: bad course "${c.course}"`);
  const need = cp.kind === 'variable' ? ['defect', 'ok'] : [cp.kind];
  for (const st of need) {
    const s = c[st];
    if (!s) { errs.push(`${cp.id}: missing "${st}" state`); continue; }
    for (const f of ['observe', 'severity', 'rec', 'why', 'report']) if (!s[f]) errs.push(`${cp.id}.${st}: missing ${f}`);
    if (s.severity && !sev.has(s.severity)) errs.push(`${cp.id}.${st}: bad severity ${s.severity}`);
    if (s.rec && !rec.has(s.rec)) errs.push(`${cp.id}.${st}: bad rec ${s.rec}`);
    for (const a of s.recAlt || []) if (!rec.has(a)) errs.push(`${cp.id}.${st}: bad recAlt ${a}`);
    for (const a of s.sevAlt || []) if (!sev.has(a)) errs.push(`${cp.id}.${st}: bad sevAlt ${a}`);
    if (cp.tool && !s.reading) warns.push(`${cp.id}.${st}: tool checkpoint without reading`);
    if (st === 'defect' && s.severity === 'ok') errs.push(`${cp.id}: defect state graded ok`);
  }
  if (!c.tip) warns.push(`${cp.id}: no tip`);
}
for (const k of Object.keys(CHECKPOINT_CONTENT)) if (!CHECKPOINTS.find(c => c.id === k)) warns.push(`orphan content: ${k}`);

const qids = new Set();
for (const q of QUIZZES) {
  if (qids.has(q.id)) errs.push(`dup quiz id ${q.id}`); qids.add(q.id);
  if (!courses.has(q.course)) errs.push(`${q.id}: bad course ${q.course}`);
  for (const c of q.components || []) if (!comps.has(c)) errs.push(`${q.id}: bad component ${c}`);
  if (!Array.isArray(q.choices) || q.choices.length < 2) errs.push(`${q.id}: choices`);
  if (!(q.answer >= 0 && q.answer < q.choices.length)) errs.push(`${q.id}: answer index`);
  if (!q.explain) errs.push(`${q.id}: no explain`);
}
for (const c of COURSES) {
  const n = QUIZZES.filter(q => q.course === c.id).length;
  if (n < 6) warns.push(`course ${c.id}: only ${n} quizzes`);
  if (!LESSONS[c.id]) errs.push(`lesson missing: ${c.id}`);
}
const answerDist = [0, 0, 0, 0]; QUIZZES.forEach(q => { if (q.answer < 4) answerDist[q.answer]++; });

console.log(`checkpoints ${CHECKPOINTS.length} | content ${Object.keys(CHECKPOINT_CONTENT).length} | quizzes ${QUIZZES.length} (answer spread ${answerDist.join('/')}) | lessons ${Object.keys(LESSONS).length}/${COURSES.length} | zones ${ZONES.length} | components ${COMPONENTS.length}`);
warns.forEach(w => console.log('WARN', w));
errs.forEach(e => console.log('ERR ', e));
process.exit(errs.length ? 1 : 0);
