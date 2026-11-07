# Voss: Field Guide red-team (round 3)

Tested the running build on my own server (port 5181, now stopped) with Playwright: desktop 1440x900 and 1280x720, the 1180 float/dock boundary (1180x700, 1179x700, 1180x599), phone 375x812 and 844x390. I also diffed all 119 guide look items against both `observe` states in `checkpoints.js`, grouped by manifest kind (my script is in my scratchpad, not the repo). Console showed 0 errors and 0 warnings. Screenshots are in `docs/reports/shots/voss-*.png`.

**Bottom line:** no BLOCKER. I found no path where the guide or its UI reveals what a checkpoint rolled in this inspection. The text is static. Every checkpoint has a hit-mesh in both states (checked over 6 fresh inspections), so "Show me where" works the same either way. The check marks track "logged", not "right". Tool chips repeat what the manifest already requires. What I found is quieter than a leak: the guide makes the over-call lesson free, and nothing records that you had help.

---

## MAJOR

### M1. The guide disarms the red herrings, costs nothing, and nothing records it was open
*Files: `src/data/guides-in.js`, `guides-out.js`, `src/core/store.js`, report screen*

The `ok`-kind checkpoints exist to teach "don't over-call." In about 10 of the 26, the Good clause names the exact harmless detail the model shows, so the trap is defused before the player can fall into it:
- `window-sill-caulk`: "fine surface crazing is age". The model shows fine weathering cracks.
- `meter-base`: "faded paint is cosmetic". The model is faded.
- `driveway-cracks`: "hairline, too tight for a coin". This is the ok `observe`, nearly word for word.
- `tile-hip-mortar`: "hairline shrinkage cracks are common". The model has hairline cracks.
- `efflorescence`: "powdery salt that brushes off, block solid beneath". Verbatim.
- `return-grille`: the extra line "No filter behind the grille?". That is this house's exact condition.
- Also `hood-recirc`, `panel-aluminum-sec`, `wh-age` ("ask two separate questions") and `door-threshold`.

The same happens on the ok side of some variable items. `siding-damage` says "a small shallow dent is cosmetic", which is the ok model exactly. `standing-water` says "damp soil under plastic is common".

Measured: the clause that matches the model overlaps the real `observe` 0.45 to 0.57 (word overlap). The other clause overlaps about 0.2. Some Bad clauses are near-transcripts of the defect `observe`: `panel-double-tap` 1.00, `window-igu-seal` and `drip-edge` 0.89, `disposal-wiring` and `panel-rust` 0.86, `dryer-duct` 0.80. CONTEXT §12 says the guide "must not paraphrase it so closely that it gives the answer away." Taken alone, no item tells you which state you're in. But for any part the model renders clearly, judging becomes matching the picture to one of two descriptions. That is free, while "Describe it for me" costs half the points.

Fade mode makes it worse:
- The guide opens by default on every new part.
- `store.mastery().good` counts exact calls made with the guide open. So "you've got this one" can be earned without ever judging alone.
- The report scores guided and solo calls the same.

**Survives if** the guide stays free (the player asked for help, not a fine) but stops being invisible:
- Stamp `entry.guided = true` on the first log when the guide was open for that component.
- Have fade's mastery count only unguided exact calls. Then "fades as you learn" means "fades once you've done it alone."
- Add a report line such as "18 of 30 calls made with the guide open."
- Content fix: for `ok`-kind items, move the "X is cosmetic" defuser out of the Good clause and into `watch` as a general trap ("weathered sealant and faded finishes tempt over-calls"). Keep Good and Bad as criteria, not descriptions of this model.
- Add a check to `check-contracts.mjs`: warn when a Good or Bad clause overlaps one state's `observe` at 0.7 or more.

### M2. Fade "masters" a randomized part after seeing only one of its states
*File: `src/ui/guide.js` `isMastered`, `src/core/store.js` mastery*

Verified live. `attic-duct-joint` rolled ok. I logged one exact "Acceptable", re-entered, and the guide stayed folded with "you've got this one" showing (`voss-fade-mastered.png`). The player has never seen the defect state. With a 40% defect roll, the first two inspections will often be ok-ok.

**Survives if** mastery for `variable` checkpoints is stored per state (`good.defect`, `good.ok`) and requires both. `defect`- and `ok`-kind parts keep today's rule.

### M3. `ext-gfci` tells the player to look for an upstream GFCI when power stays on
*Files: `src/data/guides-out.js` `ext-receptacle`, and the same idea in `checkpoints.js` `ext-gfci.why`*

The guide says: "Stays on: check for an upstream GFCI before concluding." That reasoning is backwards (high confidence). If this receptacle were downstream of a GFCI receptacle or a GFCI breaker, the tester's button would trip that upstream device and the receptacle would go dead. "Stays on" with a correct ground pattern means it is not protected.

You look upstream when the receptacle is already dead (a tripped device somewhere). You also distrust the tester button when the tester shows an open ground, because the button needs a ground path. This is a licensing-exam concept, and the current wording points the player toward a false "probably fine" on a graded safety item.

**Survives if** it reads: "Power cuts off: protected (by this device or one upstream). Stays on: not protected. If the tester showed open ground, its GFCI button cannot test; use the device's own TEST button. Already dead: find the tripped GFCI and reset it." Fix the matching sentence in `why` too.

---

## MINOR

### m1. Wide objects are framed for the full width, then pushed against the inspect panel
*File: `src/engine/engine.js` `framing()` and `updateViewOffset`*

`fitDistance` runs once in `openInspect`, before `inspect:entered`. The bubble then opens and sends `ui:guide-layout {left: 324}`, but only the view offset reacts; the camera distance is never refit. Measured on `ext-siding` at 1440: the object is 755 px wide, which is exactly 0.7 × 1080, the free width without the bubble. After the 162 px slide it runs flush from the bubble (330) to under the panel edge (about 1085, panel at 1084) (`voss-wide-ext-siding.png`). The vapor barrier runs under both cards.

The slide itself is smooth (about 250 ms, eased; samples 237 → 259 → 264), so the camera does not jump badly when folding or unfolding. `gar-panel` and `att-insulation` fit fine.

**Survives if** the UI sends the expected bubble width on `component:open` (`decideOpen()` already knows it), so `framing()` fits against the right free area. Alternatively, `ui:guide-layout` could trigger a gentle dolly refit, not just a pan.

### m2. `att-insulation` depth number is low for blown fiberglass
`guides-out.js` says R-38 is "often 10 in or more". The guide's own `what` calls it blown fiberglass, which needs roughly 13 to 16 in for R-38 (cellulose is about 10 to 11 in). Confidence: medium-high. It does not change the grade (the model shows 3 in), but it is a number a learner will memorize.

**Survives if** it reads: "around R-38: roughly 13 in or more of blown fiberglass, less for cellulose."

### m3. NC SOP claims I could not confirm
Each needs Henny to check it against 11 NCAC 08 .1100 text. They are labelled as low confidence for that reason.
- `ext-window` watch: "NC SOP does not require inspecting seals between panes." Low confidence.
- `ext-hose-bib` watch: "not required to determine whether backflow devices are present." Many SOPs exclude determining their *effectiveness*, not their presence. Low-medium confidence.
- `liv-smoke-alarm` watch: "Report presence and the test result, as NC requires." I'm unsure NC requires operating the alarm. Low confidence.
- `gar-fire-door` watch: "Many older homes predate self-closing rules." My recollection is that the NC Residential Code amendment to R302.5.1 may not require self-closing, which would also bear on `fire-door-closer` being graded `safety`. Low confidence, but worth five minutes.

**Survives if** each NC claim either cites the paragraph in a code comment or is softened to "many SOPs" wording.

### m4. `util-dryer` Good clause overclaims
Good is "smooth rigid or semi-rigid metal". UL 2158A-listed foil transition ducts are also acceptable for the short connector. Medium confidence.

**Survives if** it reads: "rigid or semi-rigid metal, or a listed foil transition, short..."

### m5. Ceiling and sheathing stains: the guide nudges the severity
*Components: `liv-ceiling-stain` watch, `att-sheathing`*

"A dry reading does not erase a stain... not whether it belongs in the report" effectively tells the player not to pick Acceptable. That is the correct teaching (both ok states are graded `monitor`), but CONTEXT §12 says never hint the severity.

**Survives if** the team accepts this one consciously and notes it as an exception in §12. Otherwise keep only "describe the stain and the reading."

### m6. Narrow desktops and tablets lose side-by-side reading
Below 1180 px (a laptop with the window not maximized, 1179x700 in `voss-1179x700.png`), the guide becomes a tab that replaces the parts list. The desktop log card then covers the sheet, so you can't read the guide while judging, which is the reason the bubble exists. Over 1180 wide but under 600 tall gets the same treatment (`voss-1180x599.png`).

**Survives if** the float threshold looks at free left width, not the viewport: float when `W - 360 - 324 >= ~420`. Or let the docked log card show a collapsed "Guide" strip.

### m7. Phone landscape is cramped
At 844x390 the guide body has about 120 px of height. The floated "Listen" button breaks the first lines raggedly ("carrying heated or / cooled air"), and the "Parts to judge 0/1" tab wraps onto two lines (`voss-phone-landscape.png`).

**Survives if** in landscape the Listen button goes into the tab row, the tab label shortens to "Parts 0/1", and the HUD XP card collapses while inspecting.

### m8. Zone intros are one-shot and can't be re-read
The intro lives only in the zone toast, once per zone per inspection. The starting zone's intro, the exterior one with the service-drop safety line, never shows on a new game (the banner is skipped behind the title; Yuki noted this). `ctx.mem.add('guideZones', ...)` is written but never read.

**Survives if** the zone intro also appears as a quiet first line in the bubble (or tab) for the first component opened in each zone, and the starting zone fires its banner once the title closes.

### m9. Read aloud skips half the guide
It speaks `what` and the look items only. "How a pro works it", "Watch out" and the terms are never read. For a learner studying by ear, "watch" is the part that prevents mistakes.

**Survives if** it appends `watch` (and `pro` if short) after the checks.

### m10. Guide order differs from the panel order
On `gar-panel` the guide starts with the circuit directory; the panel starts with breaker terminals. "Show me where" bridges the gap, but a phone user switching tabs loses their place.

**Survives if** the panel adopts the guide's pro order, or the guide rows are numbered the same as the panel.

---

## What the feature is silent about (absence as evidence)
1. **No record of help.** Guided and unguided calls are identical in the store, the report and mastery (see M1). For a graded game, that is the loudest silence.
2. **No golden-rule test.** `check-contracts.mjs` checks ids, tools and lengths, but nothing guards against a future content edit that names this house's exact condition. The overlap metric in M1 is cheap to add.
3. **No content/checkpoint drift guard.** Henny already found `baluster-spacing` (5 in vs about 5.5 in) and `wh-age` ("about 25 years", which goes stale in 2027). Guide numbers are checked by hand only.
4. **No citations.** The player is told "the NC SOP says..." about 15 times with no way to verify it. An exam learner will quote these.
5. **No path from guide to lesson.** The bubble doesn't link to the course's Field Notes, though the panel's course chips do.
6. **The question I'd ask anyway:** what would make this fail even if every item above were fixed? A player on fade who reads every bubble will score very well and may still fail the Board exam, because the exam has no bubble. The scoring needs a solo signal (M1) so practice actually ends in performance without the guide.

## Checked and fine
- Tour: the guide stays folded during the coach card and opens when the tour ends.
- Quiz, settings and other modals hide the bubble; the log card leaves it up beside it.
- G toggles the bubble while the desktop log card is open (`voss-logcard-g.png`). It is ignored while typing and while walking.
- Off from the bubble shows a toast with Undo, which restores fade and reopens.
- The setting persists across reload; the settings row has four options, each with a description.
- 1180 vs 1179 switches cleanly between float and dock on resize.
- Phone docked tab: "Show me where" ring visible, no horizontal scroll at 375.
- The teal focus ring shows with hints off and clears after 3 s.
- 0 console errors.
