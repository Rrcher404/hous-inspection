# Lindqvist: overcall distractors for the 16 "Best report?" quizzes (Voss finding 4)

**Contract.** For each of the 16 NO_RETRY quizzes, swap one dismissive distractor for an overcall: a wrong answer that a nervous new inspector would believe. The key and src/ stay untouched. Write three hints per quiz. Deliverables: `docs/reports/quiz-fix-F.json` (wrong options, plus `explain` where a clause was added), `docs/reports/quiz-hints-F.json` (48 hints), and this file. **Done means:** each quiz has two dismissive options plus one overcall; the overcall is beaten by the quiz's own explanation; all 48 hints pass the rule script; the full-bank audit and the 16-item audit show no length cue.

**Baseline.** src/ already contains fix files A, C, D and E (checked option by option). B differs only where E later replaced it. Fix F is built on the current src.

## Per quiz: the replaced option, the overcall, and the misconception behind it

| quiz | replaced (weakest dismissive) | overcall | misconception (one line) |
|---|---|---|---|
| q-er-02 | Monitor it, unless the receptacle shows corrosion | Shock hazard; turn off the circuit and refer to the power utility | "Anything electrical outdoors is the utility's problem, and a shock risk means shut it off." |
| q-er-08 | Note it as informational, since GFCI rules changed later | Cite a code violation and require the seller to rewire before closing | "A missing safety device is a code violation, and I decide what the seller fixes." |
| q-er-10 | Monitor it, unless the tape is brittle or loose | Fire hazard; recommend rewiring the attic circuits before closing | "One bad splice means the whole attic's wiring can't be trusted." |
| q-ap-06 | Cosmetic; suggest a neater rigid duct the next time it is serviced | Fire hazard; refer to the fire marshal before anyone uses the dryer | "A fire risk belongs to the fire authorities." |
| q-ap-09 | Note it as cosmetic wear on the hose cover, which is common with age | Shut off the main water valve until a plumber repipes | "A flood risk means shut off the house water and call for new plumbing." |
| q-eh-07 | Acceptable, because concrete steps do not need a handrail | Structural defect; refer to a structural engineer | "Anything wrong with stairs is structural." |
| q-hv-03 | Not reportable, since vent clearances are left to the HVAC trade | Fire hazard; have the fire department inspect it before closing | "A clearance to wood is a fire-department matter." |
| q-hv-11 | Cosmetic; reattach it with tape the next time it is serviced | Major defect; replace the attic duct system before closing | "One failed joint condemns the whole duct system." |
| q-ai-03 | Acceptable as long as the duct run is insulated | Refer to a structural engineer for moisture damage to the roof deck | "Moisture in the attic means the roof structure is damaged." |
| q-ai-07 | Cosmetic, since the ladder still folds and unfolds | Refer to a structural engineer to evaluate the ceiling framing | "A ladder that might pull out of the ceiling is a framing problem." |
| q-dk-04 | Cosmetic, as long as the hangers are not bent | Imminent collapse; tear down the deck and rebuild it | "Bad hanger fastening means the deck is about to fall." |
| q-dk-09 | Monitor it, since the deck is not visibly leaning | Condemn the deck; recommend demolishing it and building new | "One rotted post means the whole deck is gone." |
| q-fd-05 | Cosmetic, as long as the floor above feels level | Foundation failure; refer for underpinning | "Anything wrong at a pier is a foundation failure." |
| q-eg-04 | Cosmetic, as long as the bars are painted and sound | Refer to the fire marshal to condemn the bedroom | "A fire-escape problem goes to the fire marshal, who can close the room." |
| q-pl-05 | Acceptable, since drain joints drip now and then | Sewage hazard; refer to the health department | "A leaking drain is a public sewage hazard." |
| q-ra-02 | They are cosmetic once the heads have rusted | They mean the roof has failed and needs replacing now | "Visible fastener faults mean the whole roof failed." |

**Kept the two strongest dismissives in each quiz.** "Weakest" was my judgment. I usually dropped the generic "Cosmetic" or "Monitor" option when a sharper dismissive (GFCI, grandfathering, lint filter, invasive probing) was already present. In q-pl-05 I kept "Monitor ... final walkthrough", because the final walkthrough is the buyer's, not the inspector's, which is a real belief to correct. That meant dropping "drain joints drip".

**Explanation clauses added (14).** Each adds one sentence on why the overcall goes too far. Every quiz has one except q-hv-03 and q-ra-02, where the existing explanation already names the right referral ("Refer to an HVAC contractor"; "sealing or correction by a roofer").

**Three quizzes now use a structural-engineer overcall** (q-eh-07, q-ai-03, q-ai-07). Each one is beaten in its own explanation. Over the 16, the overcall types are: wrong authority (utility, fire marshal, fire department, health department) ×5, wrong specialist (structural engineer) ×3, scope or severity overreach (code citation, rewire, repipe, replace, tear down, demolish, underpin, new roof) ×8.

## Audit numbers (pasted)

`node scripts/quiz-audit.mjs --list` (before, current src):
```
items 224 | key strictly longest 47 (21%, chance is 25%) | key strictly shortest 16% | key stands out by length 0 | absolutes only in distractors 0 | mean key/option length 1.02
```
`node scripts/quiz-audit.mjs docs/reports/quiz-fix-F.json --list` (after):
```
items 224 | key strictly longest 47 (21%, chance is 25%) | key strictly shortest 14% | key stands out by length 0 | absolutes only in distractors 0 | mean key/option length 1.02
```
No item is listed as "stands out", before or after.

**The 16 on their own** (same `audit()` from scripts/quiz-audit.mjs, run on the subset):
- Before: key strictly longest 1/16 (6%), **strictly shortest 6/16 (38%)**, stands out 0, mean key ratio 1.01.
- After: key strictly longest 1/16 (6%: q-hv-11), strictly shortest 3/16 (19%: q-er-10, q-ap-06, q-ra-02), stands out 0, absolutes only in distractors 0, mean key ratio 0.99.

The overcalls were sized to cut the key-is-shortest cue from 38% to below chance. One draft broke it in the other direction: it put "all" or "must" into three overcalls, which made "absolutes only in distractors" 3. I trimmed them to 0.

Per-item lengths after (key / wrong):
```
q-er-02  key 64 wrong 72/52/65    ratio 1.01
q-er-08  key 71 wrong 73/59/69    ratio 1.04
q-er-10  key 64 wrong 73/66/65  SHORTEST  ratio 0.96
q-ap-06  key 64 wrong 65/68/67  SHORTEST  ratio 0.97
q-ap-09  key 59 wrong 61/60/53    ratio 1.01
q-eh-07  key 55 wrong 63/63/49    ratio 0.96
q-hv-03  key 63 wrong 56/59/63    ratio 1.05
q-hv-11  key 67 wrong 60/58/58 LONGEST   ratio 1.10
q-ai-03  key 57 wrong 58/67/48    ratio 0.99
q-ai-07  key 59 wrong 64/62/49    ratio 1.01
q-dk-04  key 51 wrong 53/50/52    ratio 0.99
q-dk-09  key 55 wrong 59/59/49    ratio 0.99
q-ra-02  key 46 wrong 53/53/49  SHORTEST  ratio 0.92
q-fd-05  key 42 wrong 54/42/49    ratio 0.90
q-eg-04  key 48 wrong 57/48/49    ratio 0.95
q-pl-05  key 45 wrong 45/50/48    ratio 0.96
```

## Hints (48)

A script checked all 48 hints. The script is in my scratchpad and is not shipped; it uses the same word and number logic as Voss's `voss-hints-check.mjs` tight mode, run against the patched options. Checks: 8 to 25 words, no em or en dash, no "wrong"/"incorrect", the hint's keys match the final wrong text exactly, no content word or number that appears only in the key, and no severity words ("serious", "hazard", "matters", "minor", "cosmetic", ...) in overcall hints. **First run: 3 flags** (q-er-02 "receptacles", q-ap-09 "house", q-eh-07 "stair", all words the key shares). I rewrote them. **Final run: 48 hints, 0 flagged.**

Shape of the hints:
- **Dismissive-option hints** answer only that option's own reason ("does tape contain heat", "does a 1987 build date change what you report"). The overcall now keeps a second non-dismissive option on the board, so a few of them imply the condition needs reporting.
- **Overcall hints** question only the scope or the authority ("Does one splice tell you about every circuit up there?", "whether a fire marshal inspects appliance venting in a private home"). None says the condition is minor.
- **Strike test.** For each hint I struck its option and asked whether 2 or more of the remaining 3 stay plausible from the hint alone. All 48 passed my read. Closest calls: the q-eh-07 "6 risers" hint, which leans on the count, but "exempt" and the overcall survive it; and the q-dk-09 "treated wood" hint, which points at the soft probe, but the overcall and "invasive" survive it.

## Verified vs Assumed

**Verified (how):**
- The 16 items, their keys, and their explanations as they stand in `src/data/quizzes.js` today (read the source; compared fix files A to E against src).
- All 16 are in `NO_RETRY` (`src/data/quiz-hints.js:1129`).
- A home inspection is not a code inspection, and code compliance is a general exclusion. Used for the q-er-08 overcall. Source: `src/data/quizzes.js` q-sop-01 and q-sop-15 explanations ("not a code inspection"; ".1105 ... code compliance ... excluded"), plus the existing hints on q-eg-05-style code-citation distractors in `quiz-hints.js:442,471`.
- NC does not ask the inspector to determine mold (`src/data/lessons.js:213`). This is why I avoided a mold overcall on q-ai-03.
- Every overcall is contradicted by its own quiz's explanation, which names the right referral (HVAC contractor, plumber, contractor, roofer, electrician) or the actual fix (box, metal duct, hose, inside release, bearing). Checked by reading each one.
- Audit and hint-rule numbers: script output pasted above.

**Assumed (not looked up this session; treated as common field practice):**
- The power utility does not repair premises wiring or receptacles (q-er-02 clause).
- A fire marshal or fire department does not inspect appliance venting, vent clearances, or egress bars in a private one-family resale, and cannot "condemn" a bedroom on an inspector's referral (q-ap-06, q-hv-03, q-eg-04).
- A county health department does not handle a drip in a private drain line inside a house (q-pl-05).
- Shutting off the house water main, or a circuit, is not the inspector's call under NC SOP (q-ap-09, q-er-02). I did not open 21 NCAC 66 for a clause that says this.
- Crushed shims are a bearing problem, not a reason for underpinning, unless the pier or footing has moved (q-fd-05).
- The strike-test read is my own, done with the key known. Under AGENT-CRAFT section 3 that is not an outside check. A key-blind read by Voss or a fresh-context reviewer is still owed before ship.

## Decisions left with Jene
- **Retry for these 16.** With the overcalls in, a non-dismissive wrong option stays on the board after every strike, which is the condition Voss gave for finding 4 to be resolved. Turning retry back on (removing them from `NO_RETRY`) is Jene's call, after the key-blind read. Voss's finding 1 (retry-correct counted as mastery) still applies either way.
- **Merge.** These files patch the same ids as fix files A to E. Fix F is built on today's src, so it should be merged last, by one writer.
