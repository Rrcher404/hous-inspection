# Key-blind hint review and report-question overcalls (2026-11-08)

**Why:** Voss (2026-11-07) estimated ~100 giveaway hints among ~490 unread, and 16 "Best report?" quizzes had retry switched off because all three wrong options dismissed the condition.

**Method (outside check, not self-review):** each hint was shown to a reader who was not told the key: stem, the struck option, the other three options shuffled as A/B/C, and the hint. The reader said OPEN (2+ options still plausible) or POINTS (letter). Scoring against the hidden key was done by script (`score-blind.mjs`, scratchpad). Readers and writers were separate agents; each read only its own packet.

| Round | Hints read | Pointed at key | Other | Action |
|---|---|---|---|---|
| 1. Full bank (minus the 16) | 624 | 157 (25%) | 1 misleading, 1 false | Lindqvist writers G1 (83) + G2 (76) |
| Overcalls | 16 quizzes | | | Lindqvist F: one dismissive distractor per quiz replaced with an overcall (wrong authority or blown-up scope); 48 new hints |
| 2. Every hint on the 125 changed quizzes | 375 | 40 (11%) | 1 false | Lindqvist H (41) |
| 3. Every hint on the 34 H quizzes | 102 | 10 (10%) | 0 | Orchestrator I (10): neutral study prompts |

Round 2's reader flagged 13 hints the round-1 reader passed, so reader disagreement is around 5-10%: rounds 2-3 are at the noise floor.

**Shipped:** quizzes.js (16 overcalls, 14 explanation sentences), quiz-hints.js (F, G1, G2, H, I merged; NO_RETRY now empty, so every pop quiz and room check gets hint + retry). Checks: `npm run check` clean; quiz audit unchanged (key longest 21%, shortest 14%, none stands out); Voss lexical net 19 flags (was 57).

**Not verified:**
- Round I (10 hints) was written by the orchestrator and not re-read blind.
- Some hints are now "reread section X" study prompts where any direct rebuttal leaked. They teach less than a targeted hint.
- Readers flagged a few questions whose stem gives the answer regardless of hint (a 2011-date smoke alarm item, a "water tracks" stem, "Why report it?" stems, the fireblocking "before it is concealed" stem, the creosote "glaze" stem). Question rewrites, not hint fixes.
- **Stem rewrites (2026-11-08, patch J):** six flagged questions rewritten: q-sop-04 (smoke alarm, now "what else should you check"), q-sop-32 (pre-drywall, distractors now come from the .1117 exclusions, checked against the June 2026 rulebook text), q-ea-06 (panel rust), q-er-13 (disposal cable) and q-ca-07 (flex duct), the last two now "Best report?" with an overcall, and q-fp-04 (creosote, options are now bare stage numbers). A fresh reader who hadn't seen the key read the 18 new hints: 16 OPEN, 1 pointed at a wrong option (reworded), 1 overcall hint pointed at the key (the same accepted pattern as patch F). On a wording-only read, 2 stems came back clean; q-ea-06, q-er-13 and q-ca-07 still give the answer away by structure: the key is the only proportionate option among dismissals and an overcall. Fixing that needs a second plausible moderate option in each item; not done. The reworded hint and the bare-stage creosote options were not re-read.
- Field facts in the overcalls (utility, fire marshal, health dept. roles) and IRC R314.3 are from trade knowledge, not a fetched source. NC .1021, .1109, .1110(c) were checked against the June 2026 NCHILB rulebook text.
- Not tested on a real phone.
