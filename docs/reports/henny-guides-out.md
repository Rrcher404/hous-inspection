# Henny: Field Guide, outside zones (`src/data/guides-out.js`)

## What was delivered
- `GUIDES_OUT` for all 40 components in exterior, roof, deck, shed, attic, crawl. One look item per checkpoint (54 checkpoint items), ordered the way I work each component, plus at most one general item. `ext-ladder` has `look: []` with a safety `pro` and a roof-walking `watch`.
- `ZONE_GUIDES_OUT` intros for all six zones. `attic` uses the exemplar verbatim. `att-duct` uses the exemplar, with its look item trimmed from 37 to 32 words to fit the limit (same facts).
- Tool-gated items carry `tool`: ext-gfci (tester), insulation-void (thermal), sheathing-stain and joist-moisture (moisture), sheathing-microbial, rodent-activity, termite-tubes, drain-leak (flashlight). Each one says what the tool shows either way.
- `npm run check`: no errors and no warnings. Word limits checked separately with a stricter count: what <= 45, look <= 32, pro/watch <= 30, intros <= 50. No em or en dashes.

## Golden-rule pass
I re-read every look item asking whether it tips the answer either way. Each item gives a Good and a Bad, and points only at features the model shows in both states (for example the repair shingle strip on `roof-shingles`, and the extension on `ext-downspout`). Severity and referral are never named. I left out wording like "safety", "hazard", "engineer", and "pest control", and took referral hints out of `watch` lines (chimney specialist, utility, a separate WDI license).
- `ext-front-steps`: the `what` does not give the riser count. The player has to count to four.
- `ok` red herrings (sill caulk, drip loop, meter base, disconnect, riser heights, driveway, crawl door, valley, ridge vent, guard height, hip mortar, efflorescence, PEX) are written in the same Good/Bad shape as the variable items.

## Facts I left out because I was not sure
- Handrail height (34 to 38 in) and the maximum riser height. Uniformity (3/8 in) is used because the checkpoint relies on it.
- Gutter and roof-life numbers, a vapor retarder mil thickness, and condenser clearance distances.
- Ladder: "near 75 degrees, top past the eave" is standard practice. I did not give the 3-ft extension figure.

## Checkpoint content worth a look (not my file)
- `window-sill-caulk` ok `why` says "This one is." That is fine as post-judgement reward text, but it is the only place where the reward copy talks about the specific instance.
- `baluster-spacing`: observe says gaps of "about 5 in", but the outside.js comment says "~5.5 in clear". This is minor, but the two should agree.
- `insulation-depth` observe says "between the ceiling joists", but the attic is framed with trusses (bottom chords). I wrote "framing" in the guide to fit both.
- `deck-guard`: the game has no 4-in sphere tool, so the guide says "judge each opening against a 4-in sphere; a pro carries one". If a sphere or a measure is added later, the guide text still works.
- `sheathing-stain` ok state is graded `monitor`, not `ok`. The guide stays neutral and only describes the meter reading.

## Round 2: fixes for Voss's guide red-team
- **M3 (ext-gfci):** The guide now reads: "Power cuts: protected, here or upstream. Stays on with correct wiring: not protected. Open ground: the button cannot test." `pro` covers the outlet that is already dead (go upstream and reset the tripped GFCI) and the open-ground case (use the device's own TEST button). In `checkpoints.js` `ext-gfci` I made the same change in four places: the defect `reading` (the test is valid because the ground is correct, and nothing upstream tripped), the defect `why` (the backwards upstream sentence is replaced with the correct logic, plus the open-ground caveat), the defect `report` ("remained energized when tested, indicating it is not GFCI protected"), and the ok `why` (the device that tripped may be this receptacle or one upstream).
- **M1:** I rewrote every look item to describe categories rather than the specific detail the model renders. The cosmetic lessons now live in general `watch` lines:
  - siding: fading and dents
  - window: crazed sealant
  - meter: faded finishes
  - driveway: hairline cracks and stains
  - shed: hairline cracks in the bedding
  - crawl wall: white bloom and hairline cracks
  - vapor barrier: damp soil under the plastic (new `watch`)

  No clause is at or above 0.85 overlap with one state's observe text. The only one left at 1.00 is the four-word lead-in "Where brick meets roof." on chimney-flashing, which is location only and has no Good/Bad content. `npm run check` is clean.
- **m2:** The insulation item now tells you to check depth against the product card for about R-38, and notes that blown fiberglass needs well over a foot. `checkpoints.js` `insulation-depth.why` still says "often 10 or more inches". I left it alone because it was outside my edit scope, but it should be changed to match.
- **m3:** I took out the NC claims I could not stand behind word for word: the window glass-seal line, hose-bib backflow "presence", receptacle "NC asks you to report", and the R-value "not required". The ones I kept are copied straight from the cited `nc` fields: grading, crawl access, faucet operation, roof walking, pests and WDI.
- **m5:** att-sheathing `watch` is now "If you see growth, call it microbial-like growth; naming mold is beyond the SOP. Describe each stain, where it is, and its reading."
