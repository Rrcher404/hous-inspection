// Builds docs/reports/quiz-hints-fix.json from [quizId, wrong-option prefix, replacement] and validates each
// replacement: prefix resolves to exactly one wrong option, 8-25 words, no em dash, no "wrong"/"incorrect",
// and the replacement itself passes the WORD/NUM giveaway check (tight mode). Run: node docs/reports/voss-hints-build-fix.mjs
import { QUIZZES } from '../../src/data/quizzes.js';
import { writeFileSync } from 'fs';
const F = [
 // sweep 1: lexical flags confirmed on reading (33)
 ['q-sop-08','Acceptable, provided','A flap that closes fully still replaces part of the solid door. Ask whether the door\'s original job survives that swap.'],
 ['q-sop-27','A 100-question','Ask whether the NC licensing exam is a code-lookup test built on the IRC, or something else entirely.'],
 ['q-ea-02','Neutrals and grounds','Ask whether the terminal rule treats the two conductor types alike, or gives one of them more room.'],
 ['q-ea-04','When it is a separate','Ask why the code allows a white wire to be taped as a hot at all, and whether a conduit run ever needs that shortcut.'],
 ['q-er-03','It matters for 240','Ask whether polarity is a 240 V idea at all, given which two wires a 120 V receptacle uses.'],
 ['q-er-08','Note it as informational','Ask whether a rule that changed later decides how you report a condition you can see today.'],
 ['q-er-13','It is acceptable when the cable','Ask whether calling it an appliance cord settles anything about how it is attached under the sink.'],
 ['q-ca-02','15-lb','Ask whether roofing felt is made for ground contact, and what the code names for covering crawlspace soil.'],
 ['q-ca-06','Perform','Ask whether a full wood-destroying insect inspection sits inside a home inspector\'s standard job in NC.'],
 ['q-ap-03','To slow','Ask whether a high loop in a drain hose changes flow speed much, and what else its height could do.'],
 ['q-ef-06','Repair;','Ask what evidence would justify a repair call on these cracks: width, movement, or displacement.'],
 ['q-fp-03','Leave it alone','Ask whether the NC fireplace section mentions dampers at all, and in what way.'],
 ['q-fp-07','It is decorative','Ask whether anything at the very top of a chimney is there purely for looks, given what weather hits it.'],
 ['q-hv-10','Returns mainly','Ask whether the cooling season uses the return ducts at all, before tying them to one season.'],
 ['q-hv-11','Cosmetic; reattach','Ask whether tape is a lasting duct connection, and whether this call can wait for a service visit.'],
 ['q-wh-04','Gas collects','Ask whether a tank water heater\'s burner shares space with the tank\'s contents, or sits sealed off below them.'],
 ['q-mo-02','That mold','Ask whether any camera can identify a living organism behind drywall without sampling it.'],
 ['q-mo-05','It is cosmetic, though','Ask whether buyer opinion is what decides how an inspector classifies a condition.'],
 ['q-mo-10','The two stains','Ask whether you have evidence of two separate sources, or are assuming it.'],
 ['q-ai-04','Hold the','Ask whether a baffle is a fastener for insulation, or a shaped channel built for something else.'],
 ['q-dk-01','Acceptable if there are','Ask what a ledger has to resist besides gravity, and whether nail count alone settles that.'],
 ['q-dk-04','Acceptable if most','Ask who sets the count for a hanger\'s nail holes: the installer, or the hanger\'s maker.'],
 ['q-dk-08','To make the rail','Ask whether a return at the very end adds much stiffness to a rail already fixed along its run.'],
 ['q-rf-01','Certify','Ask whether NC lets inspectors predict or certify life expectancy for any component.'],
 ['q-rf-02','Boots are','Ask whether a part\'s trade decides if an inspector reports it, when the part sits on the roof.'],
 ['q-rt-08','The underlayment','Ask whether changing a roof covering affects only the layers right under it, or the structure too.'],
 ['q-eg-05','Mark them','Ask whether seeing a release lever tells you everything you need to report about these bars.'],
 ['q-pl-01','It drains too','Ask whether trap shape changes drain speed much, or matters for a different reason.'],
 ['q-pl-04','It is the modern','Ask whether newer and flexible means a material is allowed for drains, and where you would check.'],
 ['q-pl-04','It is acceptable if the run','Ask whether a short run changes what kind of pipe this is, or only how much of it there is.'],
 ['q-pl-05','Acceptable, since drain','Ask whether "now and then" describes a joint that is dripping while you watch.'],
 ['q-pl-05','Monitor it and','Ask whether a monitoring note is meant for a condition you suspect, or one already happening in front of you.'],
 ['q-pl-09','Steady flow','Ask whether NC asks you to judge flow at one faucet, or something about the system as a whole.'],
 // sweep 2: writer-flagged leaning set (7 more)
 ['q-sop-18','Cite the current','Ask whether the statute leaves code citations to your judgment, or puts conditions on them.'],
 ['q-hv-08','At the main panel','Ask whether a panel breaker counts as the condenser\'s service disconnect, or whether a separate one is expected.'],
 ['q-hv-08','Inside the house','Ask whether the thermostat and the disconnect do the same job. One controls cooling; what does the other control?'],
 ['q-hv-08','Anywhere along','Ask whether the rule sets a location for the disconnect, or accepts any switch on the circuit.'],
 ['q-ai-06','When the client','Ask whether a client\'s request is what sets an inspector\'s duties under the SOP.'],
 ['q-dk-08','For appearance','Ask whether a code rule would exist only for a neat look, and what else a rail\'s end could affect.'],
 ['q-ra-07','36 in up','Ask whether you are recalling the right distance, and whether more barrier always means the rule is met.'],
 // sweep 3: seeded random sample, seed 20261107 (6 more; q-rf-01 already above)
 ['q-rf-02','It is cosmetic until','Ask whether a roof part has to fail completely before an inspector reports it.'],
 ['q-wh-09','Yes; NC requires','Separate inspecting the valve from operating it. Ask whether NC makes operating it a blanket requirement.'],
 ['q-dk-03','It is a cosmetic','Ask whether cracked mortar is the main risk this question is about, or a side effect.'],
 ['q-rt-06','Monitor it and','Ask whether NC asks inspectors to schedule future visits, and what a yearly re-inspection would add.'],
 ['q-sop-06','A basement','Ask whether the trigger is about spaces below grade, or about something in the home that could foul the air.'],
 ['q-mo-09','The duct is too warm','Recheck how the stem describes the duct before choosing an explanation built on its temperature.'],
 // sweep 4: disposition items where the key is the only non-dismissive option left (32 more)
 ['q-er-02','Monitor it, unless','Ask whether a monitor note fits a part that already fails to close.'],
 ['q-er-10','Acceptable, as long as the tape','Ask whether the splice rule is about the tape at all.'],
 ['q-er-10','Acceptable in attics','Ask whether the splice rule changes from room to room, or applies wherever the splice sits.'],
 ['q-er-10','Monitor it, unless the tape','Ask whether tape condition is the standard the splice rule uses, or a stand-in you picked.'],
 ['q-ap-06','Acceptable if the run','Ask whether run length is the only thing a dryer duct is judged on.'],
 ['q-ap-06','Acceptable as long as the lint','Ask whether owner habits like filter cleaning are something an inspector can rely on in a report.'],
 ['q-ap-06','Cosmetic; suggest','Ask why anyone would suggest a rigid duct at all if the only issue were looks.'],
 ['q-ap-09','Acceptable while','Ask whether a hose has to leak before its condition counts as reportable.'],
 ['q-ap-09','Not reportable, because a washer','Ask whether the supply hose belongs to the appliance or to the plumbing, and whether that changes reporting.'],
 ['q-ap-09','Note it as cosmetic','Ask whether a bulge is a change to the hose\'s surface, or to its shape.'],
 ['q-eh-07','Acceptable; exterior','Ask whether the handrail rule sorts steps by indoor and outdoor, or by something you can count.'],
 ['q-hv-03','Acceptable as long as the joist','Ask whether clearance rules are written around visible damage, or around a set distance.'],
 ['q-hv-03','Not reportable, since vent','Ask whether a clearance you can measure from where you stand is beyond a visual inspection.'],
 ['q-hv-07','It mainly makes','Ask whether neighbor noise is the kind of effect an inspector\'s report is built around.'],
 ['q-hv-11','Acceptable, because the vented','Ask whether attic vents are sized for the air a cooling system moves, or only normal attic air exchange.'],
 ['q-ai-03','Acceptable, because the attic','Ask whether the attic\'s own venting is part of the bath fan\'s required path, or a separate system.'],
 ['q-ai-03','Acceptable as long as the duct','Ask whether duct insulation is what the bath fan rule is about.'],
 ['q-ai-07','Acceptable if the ladder','Ask whether a single test climb is a method the SOP expects an inspector to rely on.'],
 ['q-ai-07','Cosmetic, since the ladder','Ask whether folding and unfolding tests the part of the ladder the stem describes.'],
 ['q-ai-07','Not reportable, because attic','Ask whether NC\'s interior or attic sections mention pull-down stairs before treating them as excluded.'],
 ['q-dk-04','Acceptable, because screws','Ask whether "stronger" means the same thing for a screw pulled straight out and one loaded sideways.'],
 ['q-dk-04','Cosmetic, as long','Ask whether a hanger\'s shape is what you are checking here, or what fastens it.'],
 ['q-dk-09','Acceptable, because ground-contact','Ask whether a treatment label outranks what your probe just found at the base.'],
 ['q-dk-09','Monitor it, since the deck','Ask whether leaning is the first sign a post gives, or a late one.'],
 ['q-ra-02','They are cosmetic','Ask whether rust on a nail head is the issue itself, or a sign of something.'],
 ['q-ra-02','They matter in','Ask whether the concern with an exposed nail head depends on wind at all.'],
 ['q-fd-05','Acceptable; stacked','Ask whether shims being allowed means any shim condition is allowed.'],
 ['q-fd-05','Cosmetic, as long as the floor','Ask whether a level-feeling floor is how an inspector judges what sits on a pier.'],
 ['q-fd-05','Not reportable without','Ask whether reporting a support problem you can see requires any calculation under NC rules.'],
 ['q-eg-04','Acceptable, since the bars','Ask whether security is the only job a bedroom window has under the rules you studied.'],
 ['q-eg-04','Cosmetic, as long as the bars','Ask whether paint condition is what the stem\'s concern is about.'],
 ['q-eg-04','Acceptable if the bedroom door','Ask whether the escape rule counts exits through the door, or treats the window on its own.'],
];
const STOP = new Set('about above after again against also among another anything around because been before being below between both cannot could does doing down during each either else every from further have having here into itself just like made make many more most much must need never only other ours over same should since some such than that their them then there these they thing think this those through under until upon very want were what when where whether which while whose will with within without would your yours ask asks check consider look think question answer option options really kind part says does still even ever able something someone whose'.split(' '));
const stem = w => w.replace(/(ies)$/,'y').replace(/(ing|ed|es|s)$/,''), words = t => new Set((t.toLowerCase().match(/[a-z]{4,}/g)||[]).filter(w=>!STOP.has(w)).map(stem));
const out = {}, errs = []; const seen = new Set();
for (const [id, pre, hint] of F) {
  const q = QUIZZES.find(x => x.id === id); const m = q.choices.filter((c,i) => i !== q.answer && c.startsWith(pre));
  if (m.length !== 1) { errs.push(`${id} "${pre}": ${m.length} matches`); continue; }
  const wrong = m[0], k = `${id}|${wrong}`; if (seen.has(k)) errs.push(`dup ${k}`); seen.add(k);
  const n = hint.split(/\s+/).length; if (n < 8 || n > 25) errs.push(`${id} "${pre}": ${n} words`);
  if (/—/.test(hint) || /\b(wrong|incorrect)\b/i.test(hint)) errs.push(`${id} "${pre}": banned`);
  const key = q.choices[q.answer], others = q.choices.filter((c,i)=>i!==q.answer && c!==wrong);
  const ow = new Set(others.flatMap(o=>[...words(o)])), ex = new Set([...words(q.q), ...words(wrong)]);
  const hits = [...words(hint)].filter(w => words(key).has(w) && !ow.has(w) && !ex.has(w));
  const nh = (hint.match(/\d+/g)||[]).filter(x => key.includes(x) && !others.some(o=>o.includes(x)));
  if (hits.length || nh.length) errs.push(`${id} "${pre}": self-check flag ${hits.concat(nh)}`);
  (out[id] ||= {})[wrong] = hint;
}
writeFileSync('docs/reports/quiz-hints-fix.json', JSON.stringify(out, null, 2) + '\n');
console.log(JSON.stringify({ entries: F.length, written: seen.size, quizzes: Object.keys(out).length, errs }, null, 1));
