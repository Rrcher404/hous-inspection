# Henny: checkpoint content report

File written: `src/data/checkpoints.js`. It holds `CHECKPOINT_CONTENT` (all 119 manifest checkpoints) and `GLOSSARY` (44 terms).

## Status
- `npm run check`: zero ERR and zero WARN for checkpoints (119/119 content, every tool checkpoint has a `reading` in each required state).
- `npx vite build`: **fails, but not because of this file.** The error is `"builders" is not exported by "src/models/inside.js"`, a models file another agent is still writing. `checkpoints.js` bundles cleanly on its own with esbuild (177 KB) and imports cleanly in Node.
- No em-dashes in the file. Observe text is second person and gives no verdict. Report text follows observe / describe / refer, with no code-official language.

## Grading choices other agents should know about
- **Two "ok" states are graded `monitor`, not `ok`:** `ceiling-stain` and `sheathing-stain`, when they read dry. The stain is still evidence of water penetration, and NC SOP .1106(c)(4) and .1113(b)(2) require reporting it. So a player who picks "OK" on a dry stain is marked wrong, which is the intent. `rec` is `none`, with `recAlt` [contractor/roofer].
- `wh-age` (a `defect`-kind checkpoint) is graded **`monitor`** (plumber, alt none). The heater works. NC .1105(a)(1)/(b)(11) do not require reporting life expectancy, and the statutory summary page covers items "not functioning as intended". Many inspectors would grade it Major ("end of life"). That is contested, but Major sits two ranks away, so it gets no partial credit.
- `furnace-filter` accepts `none` as an alternate referral (it is homeowner maintenance). So does `panel-labeling`.

## Contested or questionable framing (please review)
1. **Deck height vs. the 30-in guard trigger.** CONTEXT puts the deck top at y about -0.05 and grade at -0.75, a drop of roughly 0.70 m (about 28 in). That is *under* the generally taught 30-in trigger for a required guard. `guard-height` and `baluster-spacing` assume the deck is over 30 in. Suggested fix: Kaz or Isolde-A lower the grade at the deck's outer edge so the drop is at least 0.8 m (32 in). Otherwise the lesson is technically shaky. I avoided stating the deck height in the copy, and the `guard-height` tip says to measure at the outer edge.
2. **`wh-elevation` (ignition source 18 in).** A 2009 50-gal atmospheric gas heater is very likely FVIR-listed. FVIR became the norm for most residential gas tanks in the mid-2000s, and model fuel-gas codes exempt FVIR-listed heaters from the 18-in elevation rule. A floor-mounted 2009 unit may therefore be acceptable. The content teaches "check for an FVIR label before calling it". Suggested fix: the water heater data plate texture should **not** show an FVIR listing, so the defect state holds up.
3. **Receptacle tester light positions are brand-specific.** The brief's example reads "Open ground: center + right lights". On many common 3-light testers, center + right is the *correct* pattern, and open ground is a single light. To avoid teaching a wrong pattern, all `reading` text uses legend wording ('CORRECT', 'OPEN GROUND', 'HOT/NEU REV') rather than light positions. **Yuki:** if the tester readout draws lights, define one in-game legend and use it consistently.
4. **`fire-door-closer`.** The self-closing requirement is a newer model-code provision, and I could not verify the NC Residential Code text. I graded the defect state `safety` and framed it as a "safety upgrade" for a 1987 house. Some NC inspectors would grade it Repair.
5. **`hose-bib-backflow`.** NC SOP .1109(d)(1)-(2) says inspectors are not required to report on anti-siphon or backflow devices. I graded the defect state `repair` and the `nc` note explains that reporting it goes beyond the NC minimum.
6. **`window-igu-seal`.** NC SOP .1113(c)(4) excludes the hermetic seals between panes. I graded the defect state `repair` (Monitor is defensible) and noted the NC exclusion.
7. **Garden studio (`tile-*`).** NC SOP .1107(c)(8) does not require inspecting detached buildings, and .1108(c)(1) does not require walking roofs. The content says to state in the report that the studio was in the agreement and how the roof was viewed.
8. **Severity calls where practice varies.** The `why` text says so, and adjacent picks get partial credit:
   - `panel-double-tap` safety (others say repair)
   - `open-ground` safety (repair)
   - `joist-hangers` major (safety)
   - `firebox-brick` safety (repair)
   - `damper` repair (safety)
   - `standing-water` repair (major)
   - `joist-notch` repair, structural (major)
   - `drywall-crack` defect major, structural / ok graded ok (some say monitor)
   - `efflorescence` ok (some say monitor)
   - `termite-tubes` major, pest
9. **The NC summary-page wording in the brief is outdated.** The brief's phrase "adversely affect habitability" is not in the current G.S. 143-151.58(a1). The current text says the summary must describe components that do not function as intended, or that appear not to (based on documented tangible evidence) and require subsequent examination or further investigation by a specialist. It *may* also describe safety concerns. **Lindqvist:** please use the current wording in quizzes and lessons.
10. **Geometry details I matched; modelers should match them too:**
    - Front steps: 4 risers of about 7-1/2 in each (0.75 m rise).
    - Rear door to deck: about a 2-in step (0 to -0.05). The `door-threshold` copy now says 2 in.
    - Bath GFCI ok-state resets at a garage GFCI. There is only one bathroom.
    - The living room ceiling stain is near the west wall and the chimney. The `why` text ties it to chimney flashing.
    - The smoke alarm label shows a date more than 10 years old. I did not state the year, to avoid a mismatch.
    - Water heater plate shows 2009. Photo-eyes sit about 3 ft (defect) or about 5 in (ok). Hearth is about 8 in (defect) or about 20 in (ok). Sill is about 52 in. Insulation is about 3 in. Balusters pass a 4-in sphere (gaps about 5 in). The S-trap is always under the bath vanity. The dryer duct is foil accordion.
11. **`service-drop-clearance`.** The observe text says the lowest point is about 8 ft above the walkway. The modelers should show the drop sagging low.

## NC-specific facts used in `nc` fields (verified)
| Fact | Source |
|---|---|
| NC SOP section numbering .1101-.1116, rev. Oct 1 2018. Text verified for .1103 (report content: describe, state not-inspected items, items not functioning as intended, implications, course of action), .1104, .1105 (exclusions: life expectancy (a)(1), code compliance (a)(5), pests/WDO (a)(9), cosmetic (a)(10), mold/environmental (b)(7), R-values (b)(9), predicting failure (b)(11)), .1106(c)(1)-(4), .1107(a)(7), (b)(1),(3)-(5), (c)(3),(8), .1108(a)(5), (b), (c)(1), .1109(a)(2)-(3), (b)(1), (c), (d)(1)-(4), .1110(a)(4)-(8), (b)(2)-(3), (c), (d), .1111(a)(6), (d), (e)(5)(A),(C), .1113(b)(1)-(2), (c)(4), .1114(a)(1)-(3), (b), (d)(2), .1115(a)(1),(2),(5), (b)(1). "Representative number" = one per room for windows and receptacles (.1101 definition) | NCHILB Standards of Practice & Code of Ethics, Oct 1 2018 (PDF): https://assets-powerstores-com.s3.amazonaws.com/data/org/20782/media/doc/standards_of_practice_oct_1_2018-74b9ee7b62afbd043b5cf7c9e102847a.pdf |
| Summary page (a1): required for prepurchase inspections of 3 or more systems. Must describe systems or components that do not function as intended, or appear not to based on documented tangible evidence and require subsequent examination or a specialist. May describe safety concerns. Report due within 3 business days unless otherwise agreed | G.S. 143-151.58: https://www.ncleg.gov/EnactedLegislation/Statutes/HTML/BySection/Chapter_143/GS_143-151.58.html |
| 2018 NC Residential Code R310.2.1: 4.0 sq ft net clear opening with sash fully open (for occupant escape). 5.0 sq ft (grade floor) and 5.7 sq ft are minimum opening sizes with sashes removed (for rescue) | NC OSFM interpretation, Apr 9 2019: https://www.ncosfm.gov/media/1755/open |
| 2018 NC Residential Code R310.2.2: sill height (44-in max referenced). "Sill" means any horizontal member at the bottom of the window unit that stays in place when the sash is operated (frame, stool, stop, operating-arm covers) | NC OSFM formal interpretation to Buncombe Co., Sept 25 2019: https://ncosfm.gov/formal-interpretations/190925-haynes-ncrc-r310-emergency-escape-and-rescue-sill-height/open |

**Not verified, so kept out of `nc` fields:**
- NC riser and tread figures
- NC adoption of the garage-door self-closer rule
- NC energy code ceiling R-value (the copy says "on the order of R-38" as general guidance)
- NC fuel-piping license classes
- NC frost depth

General numbers are stated as "generally accepted" or "commonly taught" (4-in sphere, 36-in guard, 30-in trigger, 4+ risers, 44-in sill, 6-in TPR termination, 18-in ignition source, 6-in photo-eyes, 10-year smoke alarm, 19% WME, hearth 16/8 and 20/12, joist notch and hole limits, vent connector 1/4 in per ft).
