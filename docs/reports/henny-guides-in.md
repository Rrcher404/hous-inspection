# Henny: Field Guide, interior zones + garage (`src/data/guides-in.js`)

## Status
- 34/34 components written, plus `ZONE_GUIDES_IN` for living, kitchen, bath, primary, bed2, hall, laundry, garage.
- `npm run check`: no errors for my zones. The one remaining error (`guide missing: att-bath-duct`) is an attic component, so it belongs to the guides-out writer.
- Self-imposed limits met: `what` <= 45 words, every look item <= 32 words, `pro`/`watch` <= 30, intros <= 50, no em dashes, at most one extra look item per component.

## Known warning I could not clear
- `WARN guide gar-panel: 7 look items (max 4 + 1 extra)`. The panel has 7 checkpoints and the brief requires one look item per checkpoint, so I can't get under the warning's limit of 5 without breaking that rule. I left out the extra general item as asked. Suggestion for the checker owner: change the limit to `checkpoints.length + 1`.

## Neutrality choices (golden rule)
- Every look item gives a "Good: ... Bad: ..." pair, or a tool reading for each outcome. None says which state the part is in.
- Tool-gated items carry `tool` and describe the reading both ways: tester legend patterns, meter vs. dry reference, flashlight soot vs. glaze, thermal even vs. hot terminal.
- I left out details that are always present in the model, so mentioning them would tip the answer:
  - The anti-tip bracket still in its bag in the range drawer.
  - The shim under the toilet.
  - The ember scorches on the oak past the hearth.
- Tub surround: the model shows hairline-cracked grout by the soap dish in both states, so I did not list cracked grout as a defect sign there.
- Ok-kind red herrings (hood, threshold, wh-age, aluminum SE conductors, return grille, window, door, burners, supply stops) are written in the same Good/Bad voice. Each says what would make the part a defect.
- Water heater `wh-age`: I framed it as two separate questions, "how old" and "is it working now", instead of saying "age is not a defect".
- Words like "refer", "electrician" and "safety hazard" do not appear as verdicts anywhere.

## Facts I left out (length, or not sure enough for every case)
- Closet light clearance distances to storage.
- NC egress opening areas (the OSFM 4.0 / 5.0 / 5.7 sq ft nuance). I kept only the 44 in sill height.
- Vent connector slope (1/4 in per ft) and the 6 in clearance to combustibles for single-wall pipe.
- Garage wall gypsum thickness and Type X, and the 1-3/8 in solid door thickness.
- Creosote stages.
- Numbers I kept, because they match `checkpoints.js` exactly:
  - Hearth 16/8 and 20/12, split at 6 sq ft.
  - Smoke alarm 10 years.
  - Sill height 44 in.
  - Photo-eyes about 6 in.
  - TPR discharge within about 6 in of the floor.
  - Water heater 18 in elevation / FVIR.
  - Threshold 1-1/2 in vs. 7-3/4 in.
  - Creosote about 1/8 in.

## Checkpoint content notes (no errors found, small observations)
- `door-threshold` ok: the 7-3/4 in exception applies when the door does not swing over the landing. The guide says it that way. The content says "inswing", which is the usual case, so the two are consistent.
- `wh-age` ok: "At about 25 years" assumes the current year is 2026. That will go stale; consider "over 20 years".
- `return-grille` ok: says "This system's filter is at the furnace". Consistent with `furnace-filter`.
- `furnace-flue`: the model puts a "TYPE B GAS VENT" label on the vertical vent and draws the connector as single-wall pipe. That matches the content. The guide does not name the pipe type.
- I found no checkpoint content I think is wrong.

## Round 2: fixes from Voss's red team (docs/reports/voss-guide-redteam.md)
- **M1, ok-kind Good clauses.** I rewrote these as general criteria, not descriptions of this house's rendered detail: window, door latch, burners, supply stops, dishwasher run, bath fan, hood, return grille, water heater age, threshold.
  - I removed the hint lines "No filter behind the grille?" and "untouched knockout".
  - The general lessons now live in `watch` lines that apply to the whole category: ducted vs ductless hoods, where a filter can live, age vs condition, stranded vs solid aluminum.
- **M1, Bad clauses that near-copied the defect `observe` text.** Rewritten in category terms: panel-double-tap, disposal-wiring, dryer-duct, panel-rust. The checker's "a clause mirrors" warnings are cleared for all my components (drywall-crack, co-alarm, and panel-rust were the ones it flagged). The three mirror warnings still listed belong to guides-out (soffit-baffles, joist-notch, foundation-crack).
- **m3.** Every "NC requires / NC SOP" claim is now softened to "report what you observed" or "not part of a home inspection". That covers smoke alarms (both), CO alarm, range exclusions, flue, heat exchanger, washer valves, fire door, and water heater life. There are no NC citations left in this file.
- **m4.** The dryer Good clause now accepts "rigid or semi-rigid metal, or a listed foil transition".
- **m5.** The ceiling stain watch now reads: describe the stain, its size and location, and the reading next to your reference.

## Does `fire-door-closer` grading hold up for NC? (not edited, my opinion only)
- Current grading in `checkpoints.js`: defect = safety, sevAlt [repair], rec contractor.
- My understanding is that NC's amended residential code (2018 NC R302.5.1) keeps the solid / 1-3/8 in / 20-minute door requirement but did not adopt the IRC's self-closing language. I'm moderately confident in that, not certain, and I could not check the text here.
- If that is right, a door without a closer in a 1987 NC house is not a code shortfall. It is a recommended safety upgrade.
- Either Safety or Repair is defensible from the life-safety reasoning (fumes and fire).
- I would lean toward making Repair the best answer, with Safety as the sevAlt. The why text already admits the NC question is unsettled.
- Recommend that whoever owns `checkpoints.js` confirms R302.5.1 in the current NC Residential Code. If self-closing is not required, swap the primary and alternate severity and change "Current model codes call for" to "The IRC calls for; NC's amendment may not".
- The `fire-door-pet` grading is unaffected: the opening defeats the solid-door requirement either way.
