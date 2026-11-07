# Voss: red-team review of the running build

Reviewer: Cassius Voss. Scope: the real artifact on a fresh dev server (port 5195, 1280×800, cold localStorage),
plus a line-by-line read of `src/data/checkpoints.js`, `quizzes.js`, `lessons.js` against the models that
actually render. No project files were edited except this report. I report what I saw. Every "this fails"
comes with "survives if".

## How I tested (so you can discount what I didn't do)

- **Cold start:** title, then Start, then the 5-step tour. Walked with held W/A/S/D and dragged to look. Opened
  components with real mouse clicks after hover (grading, front steps). Logged findings through the real log card.
  Used the moisture meter (ceiling stain), the receptacle tester (primary bedroom), thermal (attic insulation), and the
  flashlight (attic and crawl). Also used the Notebook (N), the mini-map (M and fast-travel chips), Finish (R), the
  report, "Show me", New inspection (24 states re-rolled, models rebuilt, new UUIDs), and Exam Mode (two runs).
- **Automated sweeps:** I opened all 74 components with `engine.openComponent`. For each one I (a) projected every
  checkpoint's hint-ring position (the same union-bbox-center rule `interact.js` uses), moved the real mouse there, and
  read which checkpoint the engine reported on hover; and (b) measured framing distance and on-screen size.
  I also took contact-sheet screenshots of the hard defects, with and without the flashlight.
- **Movement:** I tried to get stuck on the roof (south and north eaves; walking off the south side correctly
  exits to the yard), in the crawl and attic (long strafes into walls), on the deck stairs (down to the yard and back
  up), against the deck guard, and through living → hall → laundry. **I did not get stuck anywhere.** Collision
  slides cleanly.
- **Console:** clean for the whole session (one `[audit] all models tag all checkpoints ✓` info line). The only
  errors were ~900/s that I caused by passing an invalid level (`'outside'`) to `engine.debug.setPose`. The debug API
  doesn't validate its input, but players can't reach it.
- **Web checks:** FVIR effective date (July 1, 2003 for 30, 40, and 50 gal atmospheric gas tanks, ANSI Z21.10.1);
  the IRC dryer-duct length (35 ft since the 2012 IRC, M1502.4.5.1); NC R302.5.1 self-closer (unresolved; one
  unofficial source says NC deleted "self-closing"); and the NC exam format (sources conflict on NHIE vs. a
  state exam).

---

## BLOCKER (teaches something wrong, or the game marks the right answer wrong)

### B1. The pop quiz and the checkpoint give opposite answers on the bed-2 hairline crack
- **Where:** `quizzes.js:1121` (q-st-04, linked to `bed2-wall-crack`) vs `checkpoints.js:1103` (`drywall-crack`, ok state).
- **Evidence:** q-st-04 asks about a "hairline diagonal crack at the upper corner of the Bedroom 2 door; door latches
  normally". The keyed answer is **"note and monitor"**, and "Cosmetic, so never report it" is a *wrong* choice. The
  checkpoint's ok state for exactly this crack is graded **`ok`**, and its text says it "is considered cosmetic" and cites
  NC .1105(a)(10). The pop quiz fires right after the player logs that component. Monitor vs. OK straddles the
  Acceptable line, so `store.logFinding` gives **zero** credit (there is no partial credit across Acceptable).
  The learner is taught one answer, then graded wrong for using it on the next house.
- **Survives if:** one answer wins in both files. Either grade the ok state `ok` with Monitor accepted, or change
  q-st-04's key to "Acceptable; describe it; escalate if it widens, offsets, or doors bind". Then make "never report it"
  clearly wrong for a different reason, such as "never mention it, even if it widens". Also add a cross-file check to
  `npm run check`: any quiz linked to a component whose stem describes an ok-state must agree with that state's severity.

### B2. A 2009 50-gal gas water heater without FVIR is graded a Safety hazard. That heater can't exist.
- **Where:** `checkpoints.js:1397` (`wh-elevation`, defect = safety). The data plate is in `outside.js` (MFG 09/2009, FVIR
  mark deliberately omitted). Related: q-wh-06 and the lesson's key numbers.
- **Evidence:** ANSI Z21.10.1 made FVIR mandatory for new 30, 40, and 50 gal atmospheric gas storage heaters from
  **July 1, 2003**. A 2009 50-gal natural-gas tank is FVIR by construction. The content's own tip says "Read the label
  before you write it up", and the model is built so that label can't be found. A learner who knows the rule, which is the
  FVIR exception the course and the NHIE teach, answers OK and is marked wrong on a Safety item.
- **Survives if:** either (a) change the plate date to pre-2003 (for example 2001, which also strengthens `wh-age`), or
  (b) keep 2009, show the FVIR label, and make the defect state about vehicle-impact protection instead. With (a),
  update `wh-age` copy ("approximately 17 years") and quiz q-wh-05.

### B3. The re-log rewrites the graded record, so the report grade measures nothing
- **Where:** `src/core/store.js:132-160` (`logFinding`, `data.inspection.logged[cpId] = entry` overwrites), and the "Log it again"
  button in the log card.
- **Evidence (reproduced in the UI):** I logged grading as Repair (17 pts), then Acceptable (5 pts), then Repair again
  (17 pts). The report sums only the latest entry. XP is first-log-only, but the **report grade and the "Missed items"
  list use the last entry**. A learner can log anything, read the answer, press "Log it again", and finish with an A.
  More importantly, the report then hides their real misses, which are the single most useful thing the report could
  show them.
- **Survives if:** the store keeps `first` (graded) and `latest` (practice) entries. `summary()` grades `first`.
  The report shows "corrected on retry" for items where they differ.

---

## MAJOR

### M1. The "What you observe" text gives away the answer before the player judges
- **Where:** every `variable` non-tool checkpoint in `checkpoints.js` (41 of 42 have state-specific `observe` text).
  `logcard.js` shows it before severity is chosen.
- **Evidence:** grading defect observe: "The bubble shows the ground falling toward the house". The ok version
  says it falls away. The S-trap, flex drain, photo-eyes ("about 3 ft"), hearth ("about 8 in"), and so on all name the
  defect. So the randomized 3D models (the expensive part of this build) are never needed to answer. The skill of
  *spotting* a defect is never tested, only the skill of classifying a described one. This also makes the question
  "do ok-state models give the answer away?" moot.
- **Survives if:** the log card first asks the one perception question ("Is something wrong here? Yes / No / Need a
  tool"), using a neutral prompt shared by both states (as the tool checkpoints already do). Only after that does it
  reveal `observe` and move to severity and referral. Score the perception call separately.

### M2. The content describes a different defect from the one the model shows (5 checkpoints)
| Checkpoint | Content says | Model shows | Ref |
|---|---|---|---|
| `wh-tpr-discharge` | discharge pipe "stops well above the floor", report "terminates well above the floor" | **no discharge pipe at all**, an open TPR outlet with mineral crust (`outside.js:1464-1468`) | `checkpoints.js:1371` |
| `service-drop-clearance` | drop sags to "about 8 ft above the walkway" | conductors at about 3.3 to 3.8 m (11 to 12 ft), basically level, **running through a tree limb** (`outside.js:543-571`); the tree contact is never mentioned | `checkpoints.js:148` |
| `panel-knockouts` | "with the dead front back on, two breaker slots are open with no filler plates" (and q-ea-03 says the same) | dead front is off; defect = **open knockout holes in the tub walls** (`outside.js:1396-1398`) | `checkpoints.js:1271`, `quizzes.js:165` |
| `dryer-duct` | "silvery foil accordion duct" | **white vinyl/plastic** ribbed duct (`inside.js:1495-1507`). q-ap-06 says "white plastic", so the quiz and the model agree and the checkpoint disagrees | `checkpoints.js:1225` |
| `joist-hangers` (defect) | "Each deck joist ... no metal hangers" | one joist missing its hanger, one hanger short of nails | `checkpoints.js:481` |
- **Survives if:** every `observe` and `report` is rewritten from a screenshot of the actual model, not from the brief.
  The TPR fix teaches the more common real defect ("no discharge pipe"), and the 6-in rule still applies. For
  service-drop, either drop the model's conductors to about 8 ft over a walk, or rewrite the content to "conductors in
  contact with tree limbs" (Repair/Safety, electrician plus utility). For panel-knockouts, rewrite the content and
  q-ea-03 to "unused knockouts open in the cabinet".

### M3. The hearth numbers contradict the model's own tape measure
- **Where:** `checkpoints.js:616` vs `inside.js:350,477`.
- **Evidence:** the content says the opening is "a little over 6 sq ft", so 20/12 applies, and the ok hearth is "about 20 in
  ... about a foot past each side". The model's opening is OW 0.80 m × (0.70 − 0.05) m = **0.52 m² ≈ 5.6 sq ft**
  (under 6, so 16/8 applies). The ok hearth is **0.46 m ≈ 18 in front and 0.25 m ≈ 10 in sides**, and a tape with
  16-in marks lies on it in both states. A learner who measures, which the tip tells them to do ("Measure the fireplace
  opening first"), gets a contradiction. Applying the content's rule, the ok state *fails* 20/12. Also, at the default
  framing the hearth sits under the tool belt (see M6).
- **Survives if:** the copy is set to the geometry. Use "about 5-1/2 sq ft opening, so 16 in front / 8 in sides". The ok
  state then reads "about 18 in, 10 in sides: exceeds 16/8". Keep q-fp-01 (5 sq ft → 16/8), which then reinforces it.

### M4. 14 hint rings target the wrong checkpoint, and about 26 more land on nothing
- **Where:** `src/engine/interact.js:117-135`. The ring sits at the center of the *union bbox* of every mesh tagged
  with that checkpoint, so split or two-sided parts put it in empty air or on a neighbour's mesh.
- **Evidence (real mouse hover at each ring; `ring(cp) → what the engine picked`):** steps-handrail→**steps-riser-height**
  (I clicked it for real and logged the wrong item); shingle-granule-loss→shingle-exposed-nails; baluster-spacing→guard-height;
  tile-hip-mortar→tile-broken; tile-broken→tile-slipped; dw-drain-loop→dw-operation; toilet-base-moisture→toilet-loose;
  fire-door-closer→fire-door-pet; door-photo-eyes→door-auto-reverse; joist-moisture→joist-notch; efflorescence→foundation-crack;
  condenser-line-insulation→condenser-level; ext-gfci→ext-receptacle-cover; and **four gar-panel rings (double-tap,
  aluminum-sec, rust, knockouts) → panel-breaker-heat**. Dead rings (hover returns nothing) include both deck-ledger
  checkpoints, deck-framing, deck-stair-handrail, chimney crown and flashing, firebox-brick, damper, flue-creosote,
  sink-flex-drain, vanity-supply-valves, tub-caulk, egress-sill-height, door-latch, furnace-flue and burners, dryer-duct,
  washer-hoses, wh-elevation, wh-sediment-trap, door-auto-reverse, firewall-penetration, both att-insulation checkpoints,
  and pex-supply. (My bbox is the same rule but not the identical code, so a few null results may be within a few
  pixels of a hit.)
- **Survives if:** each builder exports an explicit anchor per checkpoint (`userData.anchor` on the hit mesh). The ring
  goes there, and a dev check asserts that a raycast from the camera through each anchor returns that checkpoint.

### M5. Double tap, the panel's signature defect, can't be clicked and can't be read
- **Where:** `gar-panel` in `outside.js:1300-1400`.
- **Evidence:** `panel-breaker-heat` is tagged on the merged breaker stack, so hovering anywhere on the breakers
  (including over the double-tapped terminal) highlights the whole column as "Breakers under load". At the default
  framing (0.78 m) and fully zoomed in (0.56 m), I could not see two conductors under one screw. `panel-rust` was in the
  defect state and showed no visible rust at default framing.
- **Survives if:** breaker-heat is tagged on one breaker plus a hit box. The double-tap terminal gets an oversized hit
  box in front of the stack and an exaggerated pair of conductors (two different colours under one bright screw).

### M6. Default framing hides or shrinks the defect (measured)
| Component | Problem at `openComponent` framing | Evidence |
|---|---|---|
| `deck-ledger` | camera **4.6 m** away, in shade; the ledger is a 46-px strip; nails illegible; both rings overlap and are dead | contact sheet, framing sweep |
| `deck-framing` | 4.3 m; 280×43 px; hangers illegible | same |
| `bath-vanity` (S-trap) | viewed head-on, the S lies in the depth plane and **reads as one straight pipe**; the front rail hides the crown | crop of vanity screenshot |
| `util-dryer` | framed on the dryer's front; **the duct (the only checkpoint) is behind the machine, not in view** | contact sheet |
| `att-truss` | without the flashlight the camera faces a big pale plane; the cut web shows only with the light, from an oblique angle | contact sheet |
| `bed2-wall-crack` | camera aims at blank wall; the crack is cut off at the lower right; the component's paler wall patch flags "something here" | contact sheet |
| `liv-fireplace` | hearth extension and `kit-back-door` threshold sit **under the tool belt** (bbox y 630-759 px) | framing sweep |
| `gar-water-heater` | tank base, and so the "ignition source height", is below the tool belt; the TPR outlet is tiny | contact sheet |
- **Survives if:** each component gets a per-checkpoint "look" pose (a camera offset in placements). The checkpoint list
  in the inspect panel snaps to it. Then a contact-sheet test fails if a checkpoint's anchor is off-screen or under UI.

### M7. Thermal readout draws a cold patch while the text and the 3D view both say warm
- **Where:** `src/ui/readouts.js:116-121` vs `checkpoints.js:1539` and `outside.js:1629` (`thermal(pm,'warm')`).
- **Evidence:** the insulation-void defect reading says "reads warm against the cooler insulation", and the 3D
  false-colour shows orange strips. The readout's keyword parser hits `cool` (in "cooler") before `warm` and renders
  `ir-cold`, with the aria-label "Thermal image: a sharp cold patch". This happens on the exact concept Lindqvist flagged as
  a prerequisite: a thermal camera shows temperature, and the side you view from changes the sign.
- **Survives if:** content gets an explicit `thermalKind` field (`warm`/`cold`/`hot`/`wet`/`even`) instead of
  regex-parsing prose. The readout uses it, and a check asserts that it matches the model's `thermal()` tag.

### M8. The house is a teardown: about 68 of 119 checkpoints are defects, and about 29 are Safety
- **Where:** `store.js:30` (`rnd() < 0.55`) plus 36 always-defect checkpoints. Of the defect-state severities, 36 are `safety`.
- **Evidence:** my roll had **68 defects (29 safety, 32 repair, 6 major)**. A real 1987 ranch with 29 safety hazards
  doesn't exist. GAME_DESIGN pillar 2 says over-calling is "a real professional failure", but the base rate teaches the
  opposite: when in doubt, call it. A learner can call everything a defect and come out ahead.
- **Survives if:** variable checkpoints roll defect at about 30-35%, and a per-roll cap keeps Safety at about 8 to 12.
  The report shows "precision" (over-calls) next to "recall" (misses), so over-calling has a visible cost.

### M9. The two content authors cite the NC SOP from different editions, so section numbers disagree
- **Where:** the `checkpoints.js` header says ".1101-.1116, rev. Oct 1 2018". The `lessons.js` sop-25 paragraph says ".1101 to .1117
  (amended effective June 1, 2026)".
- **Evidence:** automatic safety controls: `wh-tpr-discharge` nc cites **.1109(d)(3)**, q-wh-09 cites **(d)(4)**. Valves:
  `vanity-supply-valves` cites **(d)(4)**, q-pl-03 cites **(d)(5)**. Backflow: `hose-bib-backflow` cites **(d)(1)-(2)**,
  q-eh-05 cites **(d)(3)**. If the NC exam is state-administered (sources conflict; the NCHILB study guide dated
  Mar 2026 describes its own 200-question closed-book exam), the learner gets one rule with two addresses.
- **Survives if:** Henny and Lindqvist agree on the current compilation, re-cite in one pass, and put the edition in one
  constant that both files import.

### M10. The fire-door self-closer is graded Safety. That's contested, and Repair gets no partial credit.
- **Where:** `checkpoints.js:1446`.
- **Evidence:** the content itself calls it a "safety upgrade" for a 1987 house. One (unofficial) source says NC deleted
  "self-closing" from its R302.5.1. Safety (rank 0) to Repair (rank 2) is two steps, so a defensible Repair call scores 0
  severity points.
- **Survives if:** grade it `repair` and accept Safety as near, or add an `sevAlt` list to the answer shape (as `recAlt`
  exists for referrals) so contested calls can accept two severities outright. Several of Henny's flagged items
  (double-tap, open-ground, joist-notch) would benefit from the same.

---

## MINOR

1. **Grading and downspout copy say "east side"**, but both models sit at the **front (south)** of the living room. The grading
   observe says "silty line on the block", but the foundation there is brick. (`checkpoints.js:22-44`)
2. **The joist-notch defect model has a split running from the notch corner** (Isolde-B report), but the observe text omits it
   and grades the defect Repair. A one-third-depth notch at mid-span *with a split* is what many inspectors would call Major. Mention
   the split and accept Major. (`checkpoints.js:1759`)
3. **Pop-quiz premises that don't match this house:** q-hv-01 "The furnace filter slot is **empty**" (the model shows a clogged
   filter). q-er-08 "no GFCI protection anywhere upstream" is linked to `bath-gfci` (the model always shows a GFCI). q-mo-10 puts the attic stain "directly
   above the living room ceiling stain" (the sheathing patch is over the bath, by the vent). Either unlink them or reword to "In another house...".
4. **Dryer duct length:** lesson and q-ap-07 teach "25 ft minus 5/90" as the course standard. The model IRC has said **35 ft**
   since 2012 (M1502.4.5.1). Keep the course figure if InterNACHI's current material says 25, but add "current IRC: 35 ft" so the
   learner isn't blindsided. (`lessons.js:98`, `quizzes.js:376`)
5. **Pop quizzes are burned on first open,** even if the player leaves before logging (`inspect.js:91` adds to `popped` before
   the quiz is shown). A player who peeks at a component and comes back later never gets its question. Mark `popped` only when the
   quiz actually opens.
6. **Calling a real defect "Acceptable" still earns referral points** where `recAlt` includes `none` (furnace-filter, panel-labeling,
   wh-age), because Acceptable auto-selects "No referral needed". Award referral points only when severity is not `wrong`.
7. **`wh-age` is `kind: 'defect'`** and counts toward "Defects found" and "Missed items", while q-wh-05 says to "report age as
   information, not as a defect". Either make it `ok`-kind with Monitor accepted, or keep it out of the defect tally.
8. **`sheathing-microbial` defect reading asserts "the eave below it is packed with insulation"**, but `soffit-baffles` rolls
   independently. When baffles roll ok, the two readings contradict. Make the reading conditional, or tie the rolls together.
9. **`sheathing-stain` says "along a rafter"**, but the attic is trusses.
10. **Exam Mode Esc behaviour:** Esc opens "End exam?" with **Score it** auto-focused. The reflex Esc then Enter ended my 25-question
    exam at question 2, and every remaining question was scored as wrong. Default focus should be "Keep going".
11. **The mini-map (about 290×310 px, open by default) covers the lower-right of the 3D view.** My first real click on the front
    steps hit the map instead of the steps. Start it collapsed after the tour, or make it translucent to pointer events outside its rooms.
12. **New inspection leaves you where you were** (I re-rolled while in the dark crawlspace). Send the player to the exterior spawn.
13. **The `bath-toilet` floor patch** (wood look) shows as a wood scrap on the bath tile (also visible in the vanity framing).
14. **The ledger's two rings overlap exactly** (fasteners and flashing at one point), and the front-steps rings sit on the treads with
    no handrail anchor. Both are covered by M4, but they're the most visible cases.
15. **The `setPose` debug API accepts an unknown level** and throws about 900 errors per second. Debug only, but it'll bite the next agent.

## What I checked and found sound
- No em-dashes or en-dashes in any player-facing data file. `clean()` also scrubs them.
- Tool gating works: the gate card names the tool and key, and switching shows a readout and then the observation.
  The tester legend lights the correct row (OPEN GROUND). The moisture dial parses all readings correctly.
- Esc closes the top card, then exits inspect. In one case early in the tour, I needed a second Esc.
- Report, "Show me" (travels and opens the component), Print bar, and New inspection (24 of 58 variables flipped, models
  rebuilt) all work. The Notebook's Field Notes and Glossary render.
- The key numbers that most often appear on exams are right: 4-in sphere; 36-in guard / 30-in trigger; 34-38 in
  handrail at 4+ risers; 44-in sill; 16/8 and 20/12 hearth; TPR within 6 in, 150 psi / 210 F; 18-in ignition source;
  6-in photo-eyes; 1/4 in per ft connector rise; 6 in / 1 in clearances; D/6, D/4, D/3, and the 2-in edge rule;
  18/12-in wood above soil; 1/150 and 1/1500 crawl vents; 1/150 and 1/300 attic vents; 19% WME; 40 psf;
  3-2-10; 22×30 attic access; 2-in chimney air space; 32×78 egress door.

---

## What would have to be true for this to fail anyway?

Suppose every item above is fixed: the rings land, the copy matches the models, and the grade records the first call.
This still fails if the learner's real bottleneck on exam day is the **question format, not the judgment**, and the game
only trains judgment on a house it has already described for her in words. Nothing here checks whether time in the game
moves her score on unseen NHIE-style items. The 217-question bank is the only exam-shaped instrument, and it's
small enough to memorize in a few sessions (Exam Mode draws 25 at random from it, with no spaced repetition and no held-out set).
So the quiet failure mode is a learner who gets every 3D call "Spot on", sees her Exam Mode percentage climb because the
questions repeat, feels ready, and meets 200 questions she has never seen. The build survives that if it keeps a
**held-out set of questions that never appear in pop quizzes or room checks**, scores Exam Mode only from that set, and
shows the trend over sessions. And someone must confirm with NCHILB which exam she is actually sitting, the NHIE or a
state exam that tests the 11 NCAC 08 citations M9 found in disagreement. Nobody on the team has checked that fact, and
the right content strategy depends on it.
