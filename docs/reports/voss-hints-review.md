# Voss: quiz-hint giveaway review (pre-ship outside check)

**Date:** 2026-11-07 · **Reviewer:** Cassius Voss (#08) · **Scope:** `src/data/quiz-hints.js` (672 hints, 224 quizzes) against `src/data/quizzes.js`, plus the retry path in `src/core/store.js` / `src/ui/quiz.js`. No src files edited.

**Contract.** Done means: (1) a reproducible test exists and its noise rate is reported; (2) the 14 writer-flagged quizzes, a seeded 40-hint sample, and the 8 named facts are read; (3) every hint I judge a giveaway or false has a replacement in `quiz-hints-fix.json` that passes the same test; (4) verdicts on a fixed scale, plus what I did not check.

**Test applied to every hint I read:** strike the option the hint belongs to. Read the hint as someone who does not know the material. Are 2 or more of the 3 remaining options still plausible? If the hint states the key's principle, names a feature only the key has, or says the condition is serious when every other remaining option dismisses it, it fails.

## Verdicts

| # | Severity | Finding | This survives if |
|---|---|---|---|
| 1 | **BLOCKER** | A correct answer on the retry is recorded exactly like a correct first try. `store.answerQuiz` (store.js:182-192) sets `rec.correct = true` and grants the 15 XP `quizRight` either way. Only the 5 XP first-try bonus is held back. Three readers use `.correct` as the learning signal: `inspect.js:95` (stops serving the quiz again), `quiz.js:136` (pushes it down the queue), `notebook.js:133` (mastery count). In the sample, 9 of 40 hints were giveaways (22%, Wilson 95% CI 12-38%). So a large share of retry-correct answers are really unassisted wrongs, and they get counted as mastered. | `answerQuiz` keeps a `firstTryCorrect` (or `assisted`) flag, and those three readers count only unassisted correct answers. This is a small code change in the store/UI owner's lane, not mine. Once it lands, hint quality becomes a teaching problem rather than a data problem, and this drops to MAJOR. |
| 2 | **MAJOR** | 78 hints across 53 quizzes are giveaways. Replacements are in `docs/reports/quiz-hints-fix.json`. Common patterns: the hint names a feature only the key has (q-ea-02 "what the panel label might permit", q-sop-27 lists the exam format that only the key states). It flips the struck option ("you have the allowance backwards", q-ea-04). It states the key's mechanism (q-mo-02, q-mo-09, q-pl-01, q-wh-04). Or it calls the condition serious when the key is the only option left that reports it (q-er-08, q-eg-04, q-pl-05). | `quiz-hints-fix.json` is merged by the hints owner (Lindqvist). One writer merges, and that writer checks the merged file. |
| 3 | **MAJOR** | Not every giveaway is fixed. About 180 of 672 hints were read. In the sample, the hints that neither automated check flagged still failed at about 6 in 31 (~19%). That points to roughly 100 more giveaways in the ~520 unread hints. This is an estimate with a wide range, not a count. | The writers make one full pass over the unread hints using the test above, with the key hidden while they read. Or finding 1 lands first, so the leftovers no longer distort the mastery data. |
| 4 | **MAJOR (PRE-EXISTING)** | 16 "Best report?" quizzes have one non-dismissive key and three dismissive distractors (acceptable / cosmetic / monitor / not reportable): q-er-02, q-er-08, q-er-10, q-ap-06, q-ap-09, q-eh-07, q-hv-03, q-hv-11, q-ai-03, q-ai-07, q-dk-04, q-dk-09, q-fd-05, q-eg-04, q-pl-05, plus most of q-ra-02. Any hint that answers the misconception ("it matters") rules out all three distractors at once. My replacements are narrow on purpose (each targets only its own option's reason), but that only reduces the leak. | Each of these quizzes gets one overcall distractor (for example "Major defect; refer to a structural engineer") so a non-dismissive wrong option stays on the retry. Or retry is turned off for these quizzes. Both are Jene's/Lindqvist's call (quizzes.js). |
| 5 | NIT | q-ai-08, hint on "30 in by 36 in": "one number in this rule belongs to the headroom above". 30 in is both the headroom and the key's long side (22 in by 30 in), so a learner may throw out the key. True, but it can mislead. Not rewritten. | Optional: name the headroom figure as separate from the opening's long side. |
| 6 | NIT | q-wh-04, original hint on "Gas collects inside the tank": "Is it gas?" implies there is never gas in the tank. Hydrogen can build up in a heater left unused for a while. It is not the cause of the explosion, so the hint's direction is right. Already replaced for the giveaway. | n/a |
| 7 | NIT | My own word-overlap check is noisy: 58% precision (see below). It is a triage net, not a ship gate. | Use it to triage only. A key-blind human read is the gate. |

Nothing in the fact list is wrong (see Facts).

## Method and numbers

**Scripts (reproducible):**
- `node docs/reports/voss-hints-check.mjs [--mode=raw|tight] [--flags=1] [--sample=40 --seed=20261107 --exclude=<ids>]`
- `node docs/reports/voss-hints-build-fix.mjs` rebuilds the fix JSON. It also runs my own check on every replacement: exact-text match, 8-25 words, no em dash, no "wrong/incorrect", and no word or number the replacement shares with the key alone.

**Coverage check:** 224 quizzes, 672 hints. Every wrong option has exactly one hint, and every hint key matches a wrong option exactly. 0 problems.

**Sweep 1, lexical (1a).** WORD flag: the hint shares a content word (4+ letters, crude stemming) with the key, and that word appears in neither of the other two remaining options. NUM flag: the hint has a number that, among the remaining options, appears only in the key.
- Raw mode: 135 flags.
- Tight mode, which also drops words found in the stem or the struck option because they cannot tell options apart: **57 flags** (56 WORD, 1 NUM).
- I read all 57. **33 are real giveaways, 24 are noise: precision 58%.** That is far over my 1-in-10 limit, so I tried to tighten it. A rare-word filter (document frequency ≤3/5/8/12/20 across all choices) gave 50/59/60/56/56% precision while losing recall. Lexical overlap cannot tell "names the key" apart from "uses the topic's ordinary vocabulary". Redesign failed, and I am reporting that rather than shipping a gate that is 40% noise.
- Noise examples: q-sop-17 ("required"), q-ap-02 ("function"), q-fp-01 (#8 rules out 8 in, does not choose among 16/12/20), q-st-05.

**Sweep 2, writer-flagged set (1b).** All 42 hints on q-sop-18, q-sop-23, q-ea-04, q-ea-02, q-ca-06, q-ca-04, q-ap-08, q-ef-05, q-hv-08, q-wh-08, q-rt-01, q-ai-06, q-dk-08, q-ra-07.
- 11 giveaways, 7 of them new: q-sop-18 W0, q-hv-08 (all 3: every hint pointed at "within sight"), q-ai-06 W3, q-dk-08 W2, q-ra-07 W3.
- q-sop-23 W1 and q-ef-05 W2 lean but leave 2 options plausible. Kept.
- q-ca-04, q-ap-08, q-wh-08, q-rt-01 are fine.

**Sweep 3, seeded sample (1c).** Seed **20261107** (mulberry32), 40 hints drawn from all hints outside the 14 writer-flagged quizzes. **9 giveaways (22%)**, 6 of them caught by no other sweep: q-rf-02 W1, q-wh-09 W0, q-dk-03 W2, q-rt-06 W3, q-sop-06 W0, q-mo-09 W1.

**Sweep 4, structural (added after sweep 3 showed the pattern).** Flag a hint when, after the strike, the key is the only remaining option that does not dismiss the condition. **62 flags.** I attacked this, my favourite finding, as a possible false alarm. A hint that rebuts only its own option's reason ("GFCI does not keep rain out") leaves the other dismissive options standing, so it passes. Only hints that call the condition serious fail. Result: **37 of 62 fail (60%), 32 of them new.**

**Totals:** 33 + 7 + 6 + 32 = **78 replacements in 53 quizzes**. About 180 distinct hints read. Stopping rule: every sweep still turned up new MAJORs, so the "two quiet sweeps" stop never came. I stopped at the call budget, which is why finding 3 exists.

## Facts the writers added (2)

All are correct as written. I checked them against the quiz explanations and my own trade knowledge. **I did not fetch primary sources this session (Assumed, not Verified).**
- q-er-03 W3: a GFCI responds to current imbalance (leakage), not to which slot is hot. Correct.
- q-sop-15 W3: NC plumbing SOP requires describing supply and distribution piping materials. Correct.
- q-mo-03: in-service dry framing reads about 8-12%. Correct for kiln-dried lumber in a conditioned house. It is ≤19% at the mill.
- q-fp-09: the apron flashing sits on the downslope face, not the upslope side the stem asks about. Correct.
- q-wh-04: see NIT 6. Right in direction, and replaced anyway.
- q-mo-09: a cold duct below dew point condenses, and supply ducts carry air, not condensate. Correct.
- q-fd-03 W2: termite mud tubes are brown and earthy. Correct.
- q-dk-08 W3: the handrail-end return rule (IRC R311.7.8.4, cited from memory) does not depend on material, so it covers metal rails. Correct.

## Not checked

- No fresh-context reader has looked at my 78 replacements. Only my own script checked them, which is a weaker check than this review applied to the writers. Have one of the writers read them with the key hidden before merging.
- ~490 hints were never read (see finding 3).
- I did not run the app or see hints rendered. I did not confirm that room checks (`logcard.js` / `content.js hintFor`) go through the same retry and store path as pop quizzes.
- No primary-source lookups for the facts.
- Independence: I saw that `quiz-hints-A/B/C.json` and earlier Voss reports exist. I did not read them.
