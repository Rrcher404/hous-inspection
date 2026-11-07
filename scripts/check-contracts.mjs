// Node-side contract check for data files (models are audited in-browser by src/models/audit.js).
import { CHECKPOINTS, COMPONENTS, ZONES } from '../src/data/manifest.js';
import { COURSES } from '../src/data/courses.js';
import { SEVERITIES, RECOMMENDATIONS } from '../src/data/taxonomy.js';
import { CHECKPOINT_CONTENT } from '../src/data/checkpoints.js';
import { QUIZZES } from '../src/data/quizzes.js';
import { LESSONS } from '../src/data/lessons.js';
import { COMPONENT_GUIDES, ZONE_GUIDES } from '../src/data/guides.js';
import { TOOLS } from '../src/data/taxonomy.js';
import { audit, asItems } from './quiz-audit.mjs';

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
// ── Field Guide (CONTEXT.md §12) ──
const toolIds = new Set(TOOLS.map(t => t.id));
const words = (t) => String(t || '').trim().split(/\s+/).filter(Boolean).length;
const STOP = new Set('the and for with that this from into your have will they them then than when what each look good bad more about just like does there their only also some been were over under near onto'.split(' '));
const contentWords = (t) => new Set(String(t).toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(w => w.length > 3 && !STOP.has(w)));
const SPOIL = /\b(this one is|this is fine|this is ok|this is acceptable|nothing wrong|red herring|is defective|is missing here|you'?ll find|you will find)\b/i;
for (const comp of COMPONENTS) {
  const g = COMPONENT_GUIDES[comp.id];
  if (!g) { errs.push(`guide missing: ${comp.id}`); continue; }
  if (!g.what) errs.push(`guide ${comp.id}: no what`);
  if (words(g.what) > 55) warns.push(`guide ${comp.id}: what is ${words(g.what)} words (aim <= 45)`);
  const look = g.look || [];
  if (comp.checkpoints.length && !look.length) errs.push(`guide ${comp.id}: no look items`);
  if (look.length > Math.max(5, comp.checkpoints.length + 1)) warns.push(`guide ${comp.id}: ${look.length} look items (max checkpoints + 1 extra)`);
  const cpIds = new Set(comp.checkpoints.map(c => c.id));
  for (const cp of comp.checkpoints) if (!look.some(l => l.cp === cp.id)) errs.push(`guide ${comp.id}: no look item for checkpoint ${cp.id}`);
  for (const l of look) {
    if (l.cp && !cpIds.has(l.cp)) errs.push(`guide ${comp.id}: look item for foreign checkpoint ${l.cp}`);
    if (!l.text) errs.push(`guide ${comp.id}: empty look item`);
    if (words(l.text) > 40) warns.push(`guide ${comp.id}/${l.cp || 'extra'}: look item ${words(l.text)} words (aim <= 32)`);
    if (l.tool && !toolIds.has(l.tool)) errs.push(`guide ${comp.id}: bad tool ${l.tool}`);
    const cp = comp.checkpoints.find(c => c.id === l.cp);
    if (cp?.tool && l.tool !== cp.tool) errs.push(`guide ${comp.id}/${cp.id}: look item must name tool "${cp.tool}"`);
  }
  // a look item must not near-copy what the player would observe in one rolled state (Voss M1).
  // Topic words are shared by both states; what leaks is a clause that mirrors ONE state's observation.
  for (const l of look) {
    const cc = l.cp && CHECKPOINT_CONTENT[l.cp];
    if (!cc) continue;
    for (const half of String(l.text).split(/\b(?:Good|Bad):/i)) {
      const A = contentWords(half);
      if (A.size < 5) continue;
      const ov = (st) => { const o = cc[st]?.observe; if (!o) return null; const B = contentWords(o); return [...A].filter(w => B.has(w)).length / A.size; };
      const d = ov('defect'), k = ov('ok');
      for (const [st, v, other] of [['defect', d, k], ['ok', k, d]]) {
        if (v != null && v >= 0.85 && (other == null || v - other >= 0.25)) warns.push(`guide ${comp.id}/${l.cp}: a clause mirrors the ${st} observation (${v.toFixed(2)})`);
      }
    }
  }
  for (const t of [g.what, g.pro, g.watch, ...look.map(l => l.text)]) if (t && SPOIL.test(t)) errs.push(`guide ${comp.id}: possible spoiler wording: "${String(t).match(SPOIL)[0]}"`);
  if (/\u2014/.test(JSON.stringify(g))) warns.push(`guide ${comp.id}: em dash`);
  for (const w of g.terms || []) if (!w.term || !w.means) errs.push(`guide ${comp.id}: bad term`);
}
for (const k of Object.keys(COMPONENT_GUIDES)) if (!comps.has(k)) warns.push(`orphan guide: ${k}`);
for (const z of ZONES) {
  const zg = ZONE_GUIDES[z.id];
  if (!zg?.intro) errs.push(`zone guide missing: ${z.id}`);
  else if (words(zg.intro) > 60) warns.push(`zone guide ${z.id}: ${words(zg.intro)} words`);
}

// Quiz length cue (Lindqvist): the right answer must not be findable by picking the longest option.
{
  const qa = audit(asItems(QUIZZES));
  if (qa.longestPct > 35) warns.push(`quizzes: right answer is strictly the longest option in ${qa.longestPct}% of items (chance is 25%; keep <= 35%)`);
  if (qa.shortestPct < 10) warns.push(`quizzes: right answer is strictly the shortest option in only ${qa.shortestPct}% of items (overcorrected; "never the longest" becomes the cue)`);
  for (const id of qa.flagged) warns.push(`quiz ${id}: right answer stands out by length`);
}

const answerDist = [0, 0, 0, 0]; QUIZZES.forEach(q => { if (q.answer < 4) answerDist[q.answer]++; });

console.log(`checkpoints ${CHECKPOINTS.length} | content ${Object.keys(CHECKPOINT_CONTENT).length} | quizzes ${QUIZZES.length} (answer spread ${answerDist.join('/')}) | lessons ${Object.keys(LESSONS).length}/${COURSES.length} | zones ${ZONES.length} | components ${COMPONENTS.length} | guides ${Object.keys(COMPONENT_GUIDES).length}/${COMPONENTS.length}`);
warns.forEach(w => console.log('WARN', w));
errs.forEach(e => console.log('ERR ', e));
process.exit(errs.length ? 1 : 0);
