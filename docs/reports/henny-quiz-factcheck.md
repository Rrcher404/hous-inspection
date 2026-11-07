# Henny (in the field): quiz-fix fact-check, outside check on Lindqvist A/B/C

Date: 2026-11-07. Scope: the flagged items in the brief, plus one strict-reviewer read of every patched item in quiz-fix-A/B/C.json. Output: `docs/reports/quiz-fix-D.json` (10 entries). I did not edit quizzes.js or the A/B/C files.

Tags: **[sourced]** = I read the quoted sentence in the source; **[secondary]** = the official code text was paywalled or blocked (codes.iccsafe.org returned 403), so the quote comes from a state or local adoption of the text, or from a code-explainer site; **[field practice]**; **[assumption]**.

## Sources

- **NC rule book**: *Home Inspector Licensure Act and Board Rules*, effective June 1, 2026 (ncosfm.gov): https://www.ncosfm.gov/home-inspector-licensure-act-and-board-rules-effective-june-1-2026/open. I fetched the PDF and pulled its text out with a local zlib script. Every NC quote below is from this file.
- **G.S. 143-151.51**: https://www.ncleg.gov/EnactedLegislation/Statutes/HTML/BySection/Chapter_143/GS_143-151.51.html
- **InterNACHI SOP**: https://www.nachi.org/sop.htm
- **IRC roofing text**, as adopted in the California Residential Code (IRC-based) [secondary]: https://gocodebook.com/library/us/ca/ca-residential-code/chapter-9-roof-assemblies/section-r905-requirements-for-roof-coverings
- **IRC R408 crawlspace**, InterNACHI's 2024 IRC guide [secondary]: https://www.nachi.org/under-floor-crawl-space.htm

## Audit (pasted)

```
A+B+C+D: items 224 | key strictly longest 47 (21%, chance is 25%) | key strictly shortest 8% | key stands out by length 0 | absolutes only in distractors 0 | mean key/option length 1.02
A+B+C:   items 224 | key strictly longest 46 (21%) | ... | key stands out by length 0 | ...
```

## Flagged items: verdicts

### Writer A

| id | verdict | source and quote |
|---|---|---|
| q-er-08 | **Key correct; the stem needs a one-word edit** | Rule book .1110(d)(3): report the "presence or absence of readily accessible... ground fault protection of receptacles within six feet of interior plumbing fixtures". The rule has no age carve-out, so the explanation stands [sourced]. The stem's "In **another** house built in 1987" assumes the question before it, and the quiz rotates questions. A patch cannot change a stem, so Lindqvist needs to edit quizzes.js and drop "another". q-mo-10 ("In another house, you find...") has the same problem. |
| q-sop-14 | **Correct**; explanation clarified in D | .1101(28): "limited to those panels within reach standing on the floor or from a four-foot stepladder" [sourced]. |
| q-sop-13 | **Correct**; no conflict with q-sop-14 | InterNACHI glossary: "in the judgment of the inspector, is capable of being safely observed" [sourced]. NC's own .1101(27) is "within reach, without the use of a ladder", so A's "no ladder" note is accurate [sourced]. The two items test different terms: "readily accessible" means no ladder, while access panels may be reached from a 4 ft stepladder. D's q-sop-14 explanation now says this outright. |
| q-sop-21 | **Correct** | G.S. 143-151.51(b): "General liability insurance in the amount of two hundred fifty thousand dollars ($250,000)", plus net assets or a bond of $5,000 to $10,000, or $250,000 in E&O [sourced]. Rule .1006(b) as amended June 1, 2026: the bond "shall be at least five thousand dollars ($5,000)"; .1006(a) adds that the GL policy must cover property damage and bodily injury [sourced]. G.S. 143-151.58(b): "must continuously maintain general liability insurance and minimum net assets, a bond, or errors and omissions insurance" [sourced]. |
| q-er-06 | **Correct** | .1110(a)(7): "the operation of ground fault circuit interrupters within six feet of the floor/ground" [sourced]. The phrase is in .1110. |
| q-er-12 (not patched) | **Correct** | Same .1110(a)(7). .1110(e)(2): not required to "test or operate any arc-fault circuit interrupters or other overcurrent devices". .1105(b)(17): not required to "inspect 240V receptacles or outlets" [sourced]. |
| q-sop-05 | **Correct**; the near-miss is clearly wrong | The model IRC requires an alarm in each sleeping room, outside each sleeping area, and on each story (R314.3). The distractor "hallway and each story" leaves out the bedrooms, so an expert would reject it [assumption: I quoted R314.3 from memory; ICC blocked the fetch]. |
| q-ca-05 | **Correct**; the distractors are clearly wrong | InterNACHI R408 guide: "at least 1 square foot for each 150 square feet"; with a Class I vapor retarder it "may be reduced to 1/1,500" [secondary]. The 1/50, 1/300-with-no-reduction, and flat 1/1,500 distractors each break one half of the rule. |

### Writer B

| id | verdict | source and quote |
|---|---|---|
| q-eh-03 | **Correct** | .1113(c)(4): not required to inspect "coatings on and hermetic seals between panes of glass in windows and doors" [sourced]. InterNACHI 3.10: "any window that was obviously fogged or displayed other evidence of broken seals" [sourced]. |
| q-eh-05 | **Correct; explanation fixed in D** | .1109(d)(3): not required to "determine the presence or absence of backflow devices" [sourced]. .1109(d)(1) is the closer cite for a vacuum breaker: "state the requirement for or effectiveness of anti-siphon devices" [sourced]. .1109(a)(1) still requires inspecting "cross connections" [sourced]. D's explanation cites all three. |
| q-wh-09 | **Correct** | .1109(d)(4): not required to "operate automatic safety controls" [sourced]. .1101(3) defines these as devices that protect against "excessively high or low pressures and temperatures", which covers a TPR valve [sourced]. |
| q-hv-09 (not patched) | **Correct; the section number in the brief is wrong** | InterNACHI SOP: not required to "operate equipment or systems if the exterior temperature is below 65° Fahrenheit" [sourced]. That sentence is in **SOP 3.5 Cooling**, not 3.7. The item itself cites no section number, so nothing needs to change. For the record, Heating is 3.4 and Fireplace is 3.8. |
| q-hv-01 | **Correct** | .1111(a)(6): "Heat distribution systems including fans, pumps, ducts and piping, with supports, insulation, air filters..." [sourced]. .1112(a)(2)(A) lists air filters for cooling too. The distractor "Filters are excluded" is clearly wrong. Note that .1111(e)(5)(E) excludes *electronic* air filters only. |
| q-ap-10 | **Correct** | .1115(b)(3): not required to inspect "Refrigeration units" [sourced]. (b)(2) excludes "Non built-in appliances" and (c) excludes appliances in use or shut down, so "a built-in refrigerator is still a refrigeration unit" holds. |

### Writer C

| id | verdict | source and quote |
|---|---|---|
| q-pl-01 | **Overstated; explanation fixed in D** | Code commentary lists S, bell, drum, and crown-vented traps as prohibited, with an exception that keeps drum traps as solids interceptors. A toilet has an integral trap [secondary: jaspector IRC 2021 P3201 pages; NACHI forum transcription of the 2000 IRC]. "P-traps with a vent are the only permitted fixture trap" overreaches. The key ("can siphon its own seal") is correct. |
| q-dk-09 | **Correct: NC REQUIRES probing** | .1107(b)(7): "probe exterior wood components where deterioration is suspected". .1106(c)(1): "Probe structural components where deterioration is suspected" [sourced]. D's explanation now cites both. |
| q-st-05 | **Explanation wrong; fixed in D** | .1101(35): a structural component supports "non-variable forces or weights (dead loads) and variable forces or weights (live loads)" [sourced]. The NC rule does not mention snow. In model code, snow is a separate load: R301.6 says the roof is designed for "the live load indicated in Table R301.6 or the [ground] snow load... whichever is greater" [secondary: municipal copies and JLC]. I removed snow from the live-load list. The key is correct. |
| q-ra-03 | **Explanation overstated; fixed in D** | IRC R905.2.6: the manufacturer's count, "but not less than four fasteners per strip shingle or two fasteners per individual shingle" [secondary: CA Residential Code text]. Six nails in high wind comes from the manufacturer's instructions (and some state amendments), not the base code. The key is correct. |
| q-rf-03 | **Explanation overstated; fixed in D** | The vent rule also uses 3 ft: within 10 ft of an openable window or door, the vent must rise 3 ft above the opening (P3103.5). The base roof extension is 6 in (P3103.1) [secondary: jaspector IRC 2021 vent pages; sources differ on 2 ft vs 3 ft by edition]. "3 ft is the chimney rule, not the vent rule" was too absolute. The key of 6 in is correct. |
| q-rt-05 | **Correct** | R905.2.2: "Asphalt shingles shall be used only on roof slopes of 2 units vertical in 12 units horizontal... or greater". R905.3.2: tile "on roof slopes of 2 1/2 units vertical in 12 units horizontal", with double underlayment up to 4:12 [secondary: CA Residential Code]. This also confirms q-ra-06. |
| q-rt-07 | **Correct** | .1107(c)(8): not required to inspect "detached buildings or structures" [sourced]. |
| q-pl-03 | **Correct** | .1109(d)(5): not required to "operate any valve except water closet flush valves, fixture faucets, and hose faucets" [sourced]. |
| q-ai-06 | **Correct** | .1114(d)(1): "Move insulation where readily visible evidence indicates a problem". (d)(2) adds drain penetrations, earth-filled stoops or porches, and exterior doors [sourced]. |

Other NC items I confirmed against the rule book along the way [sourced]: q-sop-11 (.1107(b)(4)-(6), (c)(4)), q-sop-19 (.1021: 120 classroom and 80 field hours with 10 site visits), q-sop-23 (.1116(h) solicits "repairs of systems or components found defective"), q-sop-24 (.1104(b)), q-sop-25 (.1101(30)), q-sop-26 ("once every 90 days"), q-sop-33 and q-ca-04 (.1106(c)(3)), q-ca-09 (.1106(c)(2)), q-ef-04, q-ef-08 (.1107), q-rf-01, q-rf-05 (.1108), q-rf-07 (.1101(31)), q-pl-09 (.1101(14)), q-eh-06 (.1101(7)), q-pl-11, q-wh-10, q-mo-06 (.1109), q-hv-04, q-hv-05 (.1111), q-ai-09 (.1113(b)(1)), q-ap-04 (.1115(a)(1)), q-fd-07 (.1106(b)), q-wh-05 (.1105(a)(1), (b)(11)), q-mo-08 and q-ai-12 (.1105(b)(7) mold).

## Step 2: strict-reviewer read of all patched items

I read all 224 patched items, checking three things: exactly one defensible key, distractors an expert would reject, and an explanation that matches the key. Failures and fixes:

- **q-ca-02 (A), fixed: the key misstated the code.** The key said the model IRC calls for "6-mil polyethylene". R408.3 calls for "A continuous Class I vapor retarder", with joints that "overlap by a minimum of 6 inches" [secondary: InterNACHI R408 guide]. That guide also says the IRC names no thickness. The new key is "A Class I vapor retarder, seams lapped 6 in and sealed". The 4-mil distractor stays wrong because its seams are butted. Open question, could not verify: OSFM pages say NC moves closed crawlspaces to its own R409 (6-mil poly, 12 in laps). I could not read the OSFM PDF (the link served a different document). The stem says "model IRC", so the item holds either way.
- **q-rf-07 (C), fixed: one distractor was arguably right.** NC .1101(31) includes "similar components used to carry water off a roof and away from a building", so an expert could count underground downspout drain lines as roof drainage. I replaced "Gutters and the underground storm drain lines" with "Gutters, plus the municipal storm sewer at the street".
- **q-eh-08 (B), explanation tidied.** "36 to 42 in is the guard height range" mixed the IRC 36 in minimum with the commercial 42 in figure. It now says guard height starts at 36 in for a house. The key was already correct.
- **Stems that depend on another question** (cannot be patched; Lindqvist needs to edit quizzes.js): q-er-08 and q-mo-10 both open with "another house".
- **No other failures.** Things I checked and left alone:
  - q-st-02: D/4 is the end-notch rule and the stem says "outer thirds". This is defensible, and the explanation draws the distinction.
  - q-eg-02: the key leaves out habitable attics but is still the only correct option.
  - q-sop-04: the "not reportable" distractor is wrong, because excluded means not required, not forbidden.

## What I did not do or could not verify

- I could not read the official ICC text (codes.iccsafe.org returned 403). Every IRC quote is tagged [secondary]. q-sop-05's R314.3 is from memory [assumption].
- I could not verify NC 2018 R409.2.1 (closed crawlspace liner) from a primary page.
- I did not edit stems. Two stems need the word "another" removed in quizzes.js.
- Entries in quiz-fix-D.json that have no `right`/`wrong` keep the A/B/C options, and D's `explain` replaces theirs. The applier must merge per field, which is how the audit already reads them.
- I read the A/B/C patches but no other agent's review of them.
