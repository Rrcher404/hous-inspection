# Isolde-A report: outside models (`src/models/outside.js`)

38 builders: every component in the exterior, roof, deck, shed, garage and attic zones. `npx vite build` passes.
Audit result: every checkpoint is tagged in both the defect and ok renders (viewer audit, plus the main page's `[audit]` reports all models ✓). The heaviest component is `gar-panel` at 40 meshes. Most use 5–30, because repeated parts (shingle tabs, tiles, balusters, nails, leaves, wires) are merged into one mesh each.
Dev viewer: `dev/viewer-outside.html` + `dev/viewer-outside.js`. It shows a grid of every builder with an all-defect / all-ok toggle, labels, a thermal false-colour preview, and a toggle that makes invisible hit boxes visible. It runs its own audit, and double-clicking a mesh shows which checkpoint it belongs to. API: `window.__viewer.focus(id)`, `view(id, dir, k, localTarget)`, `setMode('ok'|'defect')`.

## Conventions the engine needs (please read, Kaz)
- **Roof mount:** local y=0 is the roof surface, and **+Z points downslope** toward the eave. Parts that must stay truly vertical are pre-rotated by `−ROOF_PITCH` about X inside an `upright` sub-group: the chimney, vent pipe and collar, fascia/drip-edge leg, and ridge cap. That only works if the engine tilts the component with `rotation.x = +ROOF_PITCH` (`export const ROOF_PITCH = atan(6/12)`). If the engine uses the opposite sign or yaw-then-pitch order, those parts will lean.
- **`deck-framing` (free):** uses the same convention as wall mount. Origin is on the house-wall plane at the bottom of the joists, and the joists run +Z for 2.4 m.
- **`ext-ac-condenser`:** the back edge (z = −0.45) is the house-wall plane. The disconnect and the line-set wall penetration sit there.
- **Hit boxes:** invisible click targets carry `userData.hit = true` (opacity 0, depthWrite off, no shadow). The thermal material swap should skip them, or they will light up as boxes.
- **Cross-component consistency:** `deck-ledger` reads `states['joist-hangers']` (default ok), so its joist stubs match the framing component.

## Per component
**ext-grading:** Brick foundation strip, mulch bed with black edging, two boxwoods, lawn.
- OK: soil falls 15 cm over 3 m away from the house, with a dry soil line on the brick.
- Defect: soil dishes toward the wall, with a puddle against the foundation and a wet band on the brick.

**ext-downspout:** Gutter stub, 2×3 downspout with offset elbows, three straps, bottom kick-out elbow.
- OK: about 1.3 m (4.3 ft) aluminium extension onto a splash block.
- Defect: outlet dumps at the wall into a dark eroded patch with exposed pebbles and mud splashed on the wall. The extension lies kicked into the grass.

**ext-gutter (always defect):** Fascia, drip edge, shingle edge, and a box-built K-style gutter with hidden hangers. It sags mid-run and is packed with about 500 dead leaves, twigs, sludge, standing water and a sprouting seedling. Tiger-striping (overflow streaks) runs down the face.

**ext-siding:** 4-in vinyl lap siding with lap seams, shadow lines and a corner post.
- Always defect: mulch heaped over the bottom course, with dirt splash-back on it.
- Variable defect: an impact hole with radiating cracks, and a broken chip lying in the mulch.

**ext-window:** Vinyl double-hung: brick mould, sloped sill, two sashes with visible grey IGU spacers, sash lock, and a curtained room behind.
- Defect: lower IGU milky with mineral streaks.
- OK-kind sealant: continuous beads at the trim and under the sill.
- Detail: a half-scraped label ghost.

**ext-hose-bib:** Flange, brass body, wheel handle, threaded spout.
- OK: brass vacuum-breaker cap with its set screw.
- Defect: bare hose threads.

**ext-service-drop:** Meter base with glass meter, dial face and seal; RMC mast with straps; weatherhead.
- OK-kind drip loop: three conductors loop below the head to taped splices.
- Insulator on the wall; a triplex span (messenger plus two twisted phase conductors) sagging out.
- The service drop runs through a tree limb whose leaves swallow the far end, which also hides where the cable stops.
- GEC runs down to an acorn-clamped rod.

**ext-ac-condenser:** Pad, base pan, fin coil with guard grille, corner posts, fan guard with blades, service panel and valves, data plate (R-410A, 2016).
- Always defect: the suction line is bare copper with three shredded foam remnants, sweat beads and foam flakes. The small liquid line is bare, which is normal.
- OK-kind: disconnect on the wall with a liquidtight whip.
- Variable defect: pad and unit tilted about 5–6° into an eroded corner. The line set follows the tilt.

**ext-receptacle:** Grey weatherproof box with a GFCI face (TEST/RESET).
- Always defect: the in-use bubble lid has snapped one hinge, hangs askew and is cracked.
- The GFCI looks identical in both states; the tester decides.

**ext-front-steps:** Brick body, rowlock caps with nosings, four equal 7.4-in risers, coir doormat.
- Always defect: no handrail. A removed rail left rusted anchor stubs, pale post-base ghosts and a rust streak.
- Hit volumes sit where a rail would be.

**ext-driveway:** 5×8 m broom-finish slab with sawn control joints, an expansion joint at the garage, hairline shrinkage cracks (the red herring) and an oil stain.

**ext-crawl-access:** Brick surround, PT frame, painted access door (24×16 in) with strap hinges, D-pull and turn-button latch. Louvered screened foundation vent with a dark crawlspace behind.

**ext-ladder:** Two-section aluminium extension ladder at about 75° (4:1), fly section on the climber side. Rung locks, pulley and rope, swivel feet, a duty-rating label and a paint drip. No tags.

**roof-shingles:** 3-tab field, 5-in exposure, 6-in offset, with dark underlay showing in the slots.
- Always defect: granule-loss clusters of black asphalt, with flecks of tan fibreglass mat in the worst spots.
- Variable: a newer charcoal repair strip in both states. The defect version has six exposed face-nails with rust runs.

**roof-chimney:** Brick stack, crown, terracotta flue tile, and a shingle patch around it.
- Always defect: crown cracked through, a spalled corner, and the chunk lying on the shingles.
- Cap variable. OK: stainless rain cap with spark screen. Defect: open, soot-rimmed flue with nesting twigs.
- Flashing variable. OK: step flashing at every course, stepped counter-flashing, front apron and a cricket behind. Defect: lumpy, broken roof-cement beads, no metal, no cricket, and a damp stain on the brick.

**roof-vent-boot:** 2-in PVC vent, galvanized base plate tucked under the upslope course.
- OK: snug neoprene collar.
- Defect: collar split open at the front so the white pipe shows through, a dark gap ring at the top, crazing, and a streak down the plate.

**roof-edge:** OSB deck edge, fascia, shingles.
- OK: white drip edge under the starter with a hemmed kick-out.
- Defect: shingles drooping raw over the fascia, rotted deck edge and a stained fascia top.

**roof-valley (ok):** Closed-cut valley. Chevron courses, the woven side running about 30 cm past centre, the cut side trimmed 2 in off centre with clipped upper corners, a faint chalk line, and no exposed nails.

**roof-ridge-vent (ok):** Shingle-over ridge vent on both slopes with a slot gap, louver ribs, cap shingles at 5-in exposure, end plugs and concealed nails.

**deck-ledger:** House rim and siding, a PT 2×10 ledger, joist stubs with hangers, decking.
- Always defect: pairs of 16d nails only, with no lags or through-bolts, and two nails backing out.
- Flashing variable. OK: Z-flashing with a drip leg over the ledger top. Defect: water streaks, a rotted top edge and a stained rim.

**deck-framing:** Five 2×8 joists at 16 in o.c., ledger (nailed), rim joist, gapped decking (light through the gaps).
- OK: galvanized U hangers with every hole nailed.
- Defect: one joist has no hanger, is toe-nailed with three angled nails and has dropped 12 mm. Another hanger has two nails and empty holes.

**deck-guard:** Deck edge with rim, 4×4 posts carriage-bolted to the rim, 2×4 rails, 2×6 cap.
- OK-kind guard height: top of cap at 36 in.
- Always defect: 2×2 balusters with 5.5-in clear spacing.

**deck-stairs:** Built for the coordinator's 0.925 m deck height. Five equal 7.3-in risers, closed riser boards, three cut stringers, a concrete landing pad, and guards on both open sides (balusters under 4-3/8 in).
- OK: a round graspable handrail on brackets, about 34 in above the nosings.
- Defect: only the flat 2×6 guard cap, which is not graspable. See doubts.

**deck-posts:** 6×6 post under a doubled 2×10 beam with a post cap. The top of the beam is at about 0.86 m.
- OK: concrete pier with a galvanized standoff base and a visible 1-in standoff.
- Defect: post buried in mounded soil, leaning about 1.4°, with a rotted band at grade, a split, wicking stain and fungal bodies.

**shed-tile-roof:** Garden studio, 2.4 m square. Slab and step; board-and-batten walls; half-lite green door with knob and lamp; side window; fascia and soffit. Pyramid hip roof at 5:12, with two-piece clay barrel tiles: pans and covers, varied clay tones, laid in a running pattern and cut at the hips.
- OK-kind hip / ridge mortar: hip covers bedded in neat mortar, with a finial.
- Always defect: one cover tile broken mid-field with its top gone, felt showing, and a shard on the ground.
- Slipped tiles (variable). Defect: two eave covers slid about 13–16 cm, exposing felt, and a pan sits askew. OK: straight eave course with bird-stop closures.

**gar-panel:** Grey tub; main breaker; 2×14 spaces of breakers with handles; bus with two exposed stabs; neutral bar with screws and a green bonding screw; ground bar. Black, red, white and bare branch wiring routed to NM sheaths at the clamps. Aluminium SE conductors from the top hub to the main lugs, with anti-oxidant paste and a white-taped neutral (OK-kind).
- Always defect: a double-tapped single-pole breaker, with two conductors under one screw.
- Always defect: the door, hinged on the tub and swung open 115°, carries a faded, water-stained, essentially blank directory.
- White conductor on a 2-pole breaker fed by orange 10/2 (variable). OK: black tape on the white. Defect: plain white.
- Rust (variable). Defect: rust runs from the hub down the back, plus corrosion on the lugs.
- Knockouts (variable). Defect: three open holes in the bottom and left tub walls. OK: intact knockouts.
- Breaker heat (thermal variable): one breaker reads `warm` (OK) or `hot` (defect) with its conductor. All other breakers are neutral.
- Detail: "R. TATE 3-87" in pencil on the back.

**gar-water-heater:** Jacket, base, top cover, burner access door with sight glass, gas control valve with knob and temperature dial, pilot/thermocouple tubes, anode, cold/hot nipples with dielectric unions, copper risers and a cold shutoff.
- Always defect: data plate reads MODEL G50-40N NATURAL GAS / SERIAL 0909A… / 50 GAL / 40,000 BTU/HR / MFG DATE 09/2009, **with no FVIR mark** (per the coordinator).
- OK-kind: draft hood on legs; vent connector rises, then slopes up to the wall, with screwed joints.
- Always defect: TPR valve on the side with its outlet open, no discharge tube, and a mineral crust.
- Elevation (variable). OK: on an 18-in steel stand. Defect: on the floor.
- Sediment trap (variable). OK: shutoff, tee, capped drip leg, union, hard pipe. Defect: yellow flex connector straight to the valve, with no tee or drip leg.

**gar-fire-door:** Frame and casing, embossed six-panel steel slab, knob and deadbolt, three hinges.
- Always defect: a smoked-flap pet door cut into the bottom of the slab.
- OK: hydraulic closer with arm.
- Defect: no closer; a paint-ghost outline and screw holes where one used to be.

**gar-overhead-door:** 16×7 sectional door from inside: four sections with struts and stiles, hinges, rollers in tracks curving back, header and jambs, torsion springs on a shaft with drums and cables, opener rail stub with trolley, J-arm, and a red release handle.
- Always defect: a frozen reverse test. The door sits on a flat 2×4, with daylight under the bottom edge.
- OK photo-eyes: 13 cm (5 in) up the tracks, with LEDs.
- Defect photo-eyes: zip-tied about 0.9 m (3 ft) up, with empty brackets still at the bottom.

**gar-firewall:** Taped drywall with screw dimples and a switch plate. A 2-in PVC line comes through the wall and turns down.
- OK: tight cut sealed with red fire caulk.
- Defect: a ragged hole showing stud, pink batt and a dark cavity, with crumbs on the floor. The cavity contents sit inside the drywall thickness, so they read whatever is behind the wall.

**att-insulation:** Drywall ceiling, 2×4 bottom chords at 24 in, blown insulation at about 3 in so the chord tops show.
- Always defect (depth): a yellow 0–12 in ruler card with the surface at the 3-in mark.
- Variable (thermal): a walked-on patch that looks identical in both states. Only the defect version is thermal `cold`.

**att-bath-duct (always defect):** Fan housing with whip and a ribbed foil flex duct that dives into the insulation, with damp, compressed insulation at the buried end.

**att-sheathing (underside):** OSB with seams, H-clips, an APA stamp, top chords at 24 in, and roofing-nail shiners.
- Stain shows in both states. Defect is thermal `wet`.
- Near the eave. Defect: speckled dark growth. OK: a straight-edged weathering band, plausible but benign.

**att-truss (always defect):** Bottom chord, top chord at 6/12, two webs with gusset plates. One web has its middle cut out, with fresh-cut ends and sawdust, and a large flex supply duct passes through the gap.

**att-soffit-vent:** Top plate, heels, top chords, roof deck, and an emissive daylight strip at the soffit.
- OK: foam baffles in every bay with dams; insulation stops at the dams and light glows through.
- Defect: insulation packed into the eave up to the deck, so no light.

**att-duct:** Trunk takeoff, insulated flex duct, ceiling boot, insulation.
- OK: duct seated on the collar, foil tape and strap, hanger strap.
- Defect: duct fallen off about 30 cm short, with an open mouth and fibreglass tuft. The collar is exposed with flapping old tape. Mouth and boot are thermal `cool`.

**att-wiring (always defect):** Two NM cables on a chord with staples. Sheaths are stripped back. Blacks are twisted and taped, whites twisted under a wire nut and tape, and the bare grounds are twisted together, all with no box.

**att-pests:** Insulation near the gable.
- Defect: tunnels down to the drywall, about 110 droppings along the runs and on the chords, and a shredded nest.
- OK: undisturbed.

## Accuracy doubts / content alignment (Henny, please check)
1. **deck-stair-handrail defect:** modelled as "guards present but only a flat 2×6 cap, no graspable handrail", not as "no rail at all". The stair has a total rise of about 36.5 in, so leaving out the guards would add an untagged guard defect. If the content says "missing handrail", the observation still holds: there is no graspable handrail.
2. **panel-knockouts ("Dead front openings"):** the dead front is removed, so the openings are modelled as open knockouts in the tub walls. Suggest relabelling to "Cabinet / dead-front openings". The directory sits on a door hinged to the tub so it can be seen with the dead front off.
3. **ext-gfci:** the GFCI looks identical in both states, and the tester gives the verdict.
4. **insulation-void:** follows the brief and shows the void as a `cold` patch. Seen from the attic side in winter, a void would actually read warm. Fine for a ceiling-side reading.
5. **ext-service-drop:** the tree contact is the only clearance problem shown. Drop height is not modelled as deficient.
6. **Sizes over ±25%:** service drop, gutter and downspout bounding boxes run larger because cables, leaves and extensions extend out. The overhead door includes about 1 m of horizontal track and opener rail. The water heater on its stand plus the vent is about 2.0 m tall. The garage panel's open door adds depth.
7. **OSB sheathing in a 1987 house:** plausible, though plywood was equally common then.

## Round 2 (responding to the Voss red-team: B2, M5, M6, minor 14)
- **B2, water heater:** the data plate now reads MODEL G50-40N NATURAL GAS / SERIAL 0601A417823 / 50 GAL / 40,000 BTU/HR / **MFG DATE 06/2001**, with no FVIR label. That makes it pre-FVIR; the requirement started July 2003. The 18-in stand is still variable. The TPR valve body and its open outlet are enlarged, and the bore and mineral crust now read at inspect distance. Copy that still says 2009 / "about 17 years" (wh-age, q-wh-05) should be updated to 2001, which is roughly 25 years old in 2026.
- **M5, panel:**
  - `panel-breaker-heat` is now tagged on **one** breaker only, plus a small hit box on its face. The loaded breaker is left column, row 8; thermal reads warm (ok) or hot (defect). The rest of the breaker stack, the main breaker and the handles are untagged and no longer steal clicks.
  - Double tap: a black and a red conductor run side by side into one oversized tin saddle with a bright slotted screw, with an anchored hit box over the lug. The builder also supports `states['panel-double-tap']='ok'`, which drops the red conductor.
  - Rust now reads at default framing: broad streaks on the tub's inner side walls, the back gutters and the main-breaker face, plus a rusted hub and crusted lugs. All of it is absent in the ok state.
  - Every panel checkpoint has its own anchored target: knockouts on the bottom-wall hole, white-hot at the 2-pole terminals, aluminum SE at the main lugs, rust in the top gutters, and the directory on the door.
- **Minor 14, deck ledger:** the two checkpoints are now physically separate.
  - `ledger-fasteners` is the ledger board plus the nail heads. The nails are bigger and brighter, sit in two rows in the lower two-thirds of the face, two have backed out, and the hit band covers that zone.
  - `ledger-flashing` is only the top band. OK: a brighter Z-flashing lip. Defect: a dark open joint at the siding, a rotted top edge and short water streaks. Its hit box sits at the top edge.
  - The ledger is a lighter colour than the joists so it reads in deck shade.
- **Minor 14, front steps:** `steps-handrail` is now a sawn-off rail post stub on a rusted base plate at the right edge of the landing, plus one anchored click volume running along the right side at handrail height. The ghost decals and rust streak are visual only (`noPick`) and no longer pull the ring onto the treads or risers.
- **M6:** deck-framing joists are shortened to 1.8 m so default framing lands nearer the hangers. The receptacle's broken lid is swung aside so the GFCI face is visible and clickable. The water-heater TPR is enlarged (see B2).
- **Ring anchors for Kaz:** every checkpoint in my 38 components now has one hit mesh with `userData.anchor = true`, placed in front of the evidence. If the engine centres the ring on the anchor meshes rather than the union bbox, the rings land on the right part. A dev raycast test checks this: from a camera 1.2 m in front, aim at the anchor centre and confirm the first tagged mesh hit is that checkpoint. It shows **0 mismatches in both states**; it had 19–21 before the anchors. Decorative decals that overlap other parts use `noPick` (an empty raycast).
- Verified: viewer audit 0 problems in both states, the main page reports `[audit] all models tag all checkpoints ✓`, `vite build` passes, and the dev server is stopped. Mount origins are unchanged.
