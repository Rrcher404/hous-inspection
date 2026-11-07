// Voss hint-giveaway check. Run: node docs/reports/voss-hints-check.mjs [--mode=raw|tight] [--dump=ids] [--sample=N --seed=S]
// For each hint on wrong option W of quiz Q: remaining = choices minus W (key + 2 others).
// Flag WORD: hint shares a content word with the key that appears in neither other remaining option.
// Flag NUM:  hint contains a number that appears in the key but in no other remaining option.
// tight mode also drops words that appear in the stem or in the struck option (they don't discriminate).
import { QUIZZES } from '../../src/data/quizzes.js';
import { QUIZ_HINTS } from '../../src/data/quiz-hints.js';
const args = Object.fromEntries(process.argv.slice(2).map(a => a.replace(/^--/, '').split('=')));
const mode = args.mode || 'tight';
const STOP = new Set('about above after again against also among another anything around because been before being below between both cannot could does doing down during each either else every from further have having here into itself just like made make many more most much must need never only other ours over same should since some such than that their them then there these they thing think this those through under until upon very want were what when where whether which while whose will with within without would your yours ask asks check consider look think question answer option options really kind part says does still even ever able something someone whose'.split(' '));
const stem = w => w.replace(/(ies)$/,'y').replace(/(ing|ed|es|s)$/,'');
const words = t => new Set((t.toLowerCase().match(/[a-z]{4,}/g) || []).filter(w => !STOP.has(w)).map(stem));
const nums = t => new Set(t.match(/\d+(?:\.\d+)?/g) || []);
const byId = Object.fromEntries(QUIZZES.map(q => [q.id, q]));
const rows = []; const problems = [];
for (const [qid, map] of Object.entries(QUIZ_HINTS)) {
  const q = byId[qid]; if (!q) { problems.push(`no quiz ${qid}`); continue; }
  const key = q.choices[q.answer];
  for (const [wrong, hint] of Object.entries(map)) {
    const wi = q.choices.indexOf(wrong);
    if (wi < 0 || wi === q.answer) { problems.push(`${qid}: hint key not a wrong option: ${wrong}`); continue; }
    const others = q.choices.filter((c, i) => i !== wi && i !== q.answer);
    const hw = words(hint), kw = words(key), ow = new Set(others.flatMap(o => [...words(o)]));
    const ex = mode === 'tight' ? new Set([...words(q.q), ...words(wrong)]) : new Set();
    const wordHits = [...hw].filter(w => kw.has(w) && !ow.has(w) && !ex.has(w));
    const hn = nums(hint), kn = nums(key), on = new Set(others.flatMap(o => [...nums(o)]));
    const numHits = [...hn].filter(n => kn.has(n) && !on.has(n));
    rows.push({ qid, wrong, hint, key, others, wordHits, numHits, flagged: wordHits.length + numHits.length > 0 });
  }
}
for (const q of QUIZZES) for (const [i, c] of q.choices.entries()) if (i !== q.answer && !(QUIZ_HINTS[q.id] || {})[c]) problems.push(`${q.id}: missing hint for "${c}"`);
const flagged = rows.filter(r => r.flagged);
console.log(JSON.stringify({ mode, hints: rows.length, quizzes: QUIZZES.length, flagged: flagged.length, word: flagged.filter(r=>r.wordHits.length).length, num: flagged.filter(r=>r.numHits.length).length, problems: problems.slice(0, 20), problemCount: problems.length }));
const fmt = r => `## ${r.qid} [${r.wordHits.concat(r.numHits.map(n=>'#'+n)).join(',')}]\n KEY: ${r.key}\n OTH: ${r.others.join(' | ')}\n STRUCK: ${r.wrong}\n HINT: ${r.hint}`;
if (args.flags) flagged.forEach(r => console.log(fmt(r)));
if (args.dump) { const ids = new Set(args.dump.split(',')); rows.filter(r => ids.has(r.qid)).forEach(r => console.log(fmt(r))); }
if (args.sample) { // mulberry32, seeded
  let s = Number(args.seed) >>> 0; const rnd = () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const excl = new Set((args.exclude || '').split(','));
  const pool = rows.filter(r => !excl.has(r.qid)); const pick = [];
  while (pick.length < Number(args.sample)) { const r = pool.splice(Math.floor(rnd() * pool.length), 1)[0]; pick.push(r); }
  pick.forEach(r => console.log(fmt(r)));
}
