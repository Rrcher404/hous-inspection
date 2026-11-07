# Isolde-B report: `src/models/inside.js`

36 builders across living, kitchen, bath, primary, bed2, hall, laundry and crawl.
`npx vite build` passes. The viewer audit (`dev/viewer-inside.html`, same rules as `src/models/audit.js`)
is clean: every checkpoint is tagged on a clickable mesh in both the all-defect and all-ok renderings.
The heaviest component is `liv-fireplace` at 125 meshes; everything else is 66 or fewer.

Viewer: `npm run dev`, then open `/dev/viewer-inside.html`. Add `?clean` to hide the UI.
`window.__viewer.shot(id, camOffset, targetOffset, 'defect'|'ok', dark, thermal)` frames a close-up.
It has toggles for defect/ok, dark + flashlight, thermal false-colour, labels and focus, plus a hover
readout of the checkpoint under the cursor. Its `statesFor()` passes the whole house's states, the same
as `store.inspection.states` (see the cross-component note below).

## Notes for the orchestrator and Kaz (engine)

1. **`pri-window` uses the floor as its origin.** y=0 is the finished floor and the stool top is at 52"
   (1.321 m), because the defect is the sill height itself. Place it at floor level. Its bounding box
   is 1.26 × 2.37 m, not the 1 × 1 in the manifest.
2. **Doors and windows.** Casing, stool and sashes sit on the wall face (z ≥ 0). Door jambs, the
   threshold and the deck landing outside `kit-back-door` sit at **z < 0**, inside the wall's
   thickness. `kit-back-door` (ajar, threshold visible) and `bed2-door` (swung open) need a real wall
   opening. Without one, the threshold is hidden behind the wall.
3. **Ceiling origin in the crawlspace.** I took it to be the underside of the floor (y=0), with joists
   down to −0.25 and soil at −1.05. `crawl-duct` lies on soil at about −0.93, so it is 1.05 m tall
   against a manifest height of 0.4. `crawl-joists` hangs from y=0.
4. **One cross-component read.** `kit-sink` reads `states['dw-drain-loop']` so the dishwasher hose in
   the sink cabinet matches the dishwasher. It also **tags that hose `dw-drain-loop`**, because the
   manifest label says "(under sink)". So a click inside `kit-sink` can emit a checkpoint that belongs
   to `kit-dishwasher`. The UI should resolve it through `CHECKPOINT_BY_ID`. `kit-dishwasher` shows
   the same route on its own left side (strapped high loop vs. lying on the floor) and tags it there
   too.
5. **Components bigger than the manifest size**, because the defect needs the room: `hall-attic-ladder`
   (hatch swung down, 1.5 m tall), `kit-range` (drawer pulled out onto the floor), `kit-sink` (doors
   open), `bath-vanity`, `bed2-door` (open), `util-furnace` (vent connector and B-vent up to 2.2 m),
   `util-dryer` (duct routed out the side), `crawl-pier` (0.7 m girder stub). If the engine already
   draws a continuous girder, my stub will overlap it.
6. **No env map assumed.** I kept metalness at 0.5 or below on chrome, galvanized and brass; at 0.9
   they render nearly black without one.

## GFCI decision (kit-gfci-test, bath-gfci-test)

Both components show a **GFCI device (TEST/RESET) in both states**. The defect state is a GFCI that
fails to trip under the tester, which is also a real defect. This keeps both checkpoints tool-gated,
as the manifest intends. The kitchen device is white with a green power LED (lit in both states, so it
gives nothing away). The bath device is an older almond unit. **Henny:** the defect `observe` text
should describe a GFCI-type receptacle that does not trip when tested, not a missing GFCI.

## Per component

**liv-fireplace** (wall). Brick chimney breast with the firebox opening cut out by alpha, and a soldier
course over the opening on a steel lintel angle. The firebox has splayed firebrick sides and a leaning
upper back.
- *firebox-brick* (always defect): mortar washed out of joints, cracks through brick, a broken-out
  brick (black void on the back wall, a shard still proud of the wall, the missing half on the hearth).
- *hearth-extension*: ok = 18" in front, 10" each side. Defect = 8" in front, nearly flush at the
  sides, with ember scorch marks on the floor just past the edge. Both states have a tape measure laid
  from the opening with real red 16" marks.
- *damper*: ok = plate open with a poker handle seated in its notch. Defect = rusted plate seized
  part-open and cocked, handle snapped to a stub, rust flakes on the hearth.
- *flue-creosote* (flashlight): smoke chamber, flue liner and smoke shelf, plus a reachable band on
  the throat underside and the top of the firebox back. Defect = near-black glossy glaze with tar runs
  that flash under the flashlight. Ok = matte dry soot.
- *Doubt:* the actual smoke chamber can only be seen from inside the opening, which an orbit camera at
  1–1.5 m can't reach. That is why the glaze also coats the throat and firebox top, where real glazed
  creosote is commonly found as well.

**liv-smoke-alarm** (always defect). Head twisted off its base and hanging on the 3-wire harness, back
label facing out: MFG DATE 2011 JUN 03 and "REPLACE 10 YEARS AFTER DATE OF MANUFACTURE". The housing
is yellowed with age.

**liv-receptacle** (tester). Ivory duplex receptacle, identical in both states.

**liv-ceiling-stain** (moisture). Irregular stain with tide lines, identical in both states. Thermal
'wet' only in the defect state.

**liv-window** (ok). Twin mulled double-hung windows with brass crescent locks, sash lifts, muntins,
stool, apron and casing.

**kit-range**. Electric coil range with a backguard clock. One coil is on, glowing and thermal 'hot'
(*range-burners* ok). *range-anti-tip* (always defect): the storage drawer is pulled and set on the
floor so the cavity and rear feet are open, and the anti-tip bracket kit is still in its bag in the
drawer.

**kit-dishwasher**. *dw-operation* (ok): CLEAN light on, door thermal 'warm'. *dw-drain-loop*: kick
plate off showing the pump. The hose is strapped high at the side (ok) or runs out along the floor
(defect).

**kit-sink**. Oak sink base, doors open, double stainless bowls, faucet, angle stops with braided
risers, disposal.
- *sink-flex-drain*: ok = PVC P-trap with trap arm and escutcheon. Defect = corrugated flex drain
  sagging into a belly.
- *disposal-wiring* (always defect): NM jacket ends about 6 cm short; loose black, white and bare
  conductors splay into a bare knockout with no connector.
- *sink-leak* (moisture): swollen cabinet floor with tide lines, identical in both states, thermal
  'wet' in defect.

**kit-gfci**. See the GFCI decision above.

**kit-hood** (ok, recirculating). Louvred discharge grille on the front, grease mesh over a black
charcoal pad, a "NON-DUCTED MODE" sticker, and the duct knockout still in place on top.

**kit-back-door** (ok). Steel half-lite door ajar 30°, deadbolt, knob, hinges and strikes, ribbed
aluminium threshold with oak cap, deck landing about 7 cm below. *Doubt:* the step-down only reads if
the engine cuts the opening (note 2).

**bath-toilet** (*toilet-loose* always defect). Bowl tilted about 2°, a shadow gap on the high side,
cracked caulk bead, one bolt cap popped and lying on the floor with a backed-off nut, a plastic shim
jammed under the low side. *toilet-base-moisture*: discoloured halo around the base in both states,
thermal 'wet' in defect.

**bath-vanity**. *vanity-s-trap* (always defect): tailpiece, U-bend, crown, then straight down through
the cabinet floor with no trap arm or vent. *vanity-supply-valves* (ok): chrome angle stops with
braided risers.

**bath-tub**. Alcove with tile on three walls (tile grid lines up across pieces), soap dish, valve,
spout, shower, pleated curtain. *tub-caulk*: ok = continuous beads. Defect = beads broken with open
dark gaps, a mildew line, and a peeled curl right under the soap dish. *tub-wall-moisture*: a separate
tile patch below the dish, greyed and hairline-cracked grout in both states, thermal 'wet' in defect.

**bath-gfci**. See the GFCI decision above.

**bath-fan** (ok). Slotted grille with the blower wheel visible behind it, and a square of tissue held
against the grille by suction (the field test).

**pri-window** (*egress-sill-height* always defect, floor-referenced). Single-hung window with the
lower sash raised and a screen in the opening. Tape hooked on the floor with its case on the stool,
reading 52", plus a blue painter's-tape note "SILL 52"".

**pri-smoke-alarm**. Ok = 10-year sealed alarm centred on a ceiling patch. Defect = no alarm: a
painted-over blank cover plate and the ghost ring of the old alarm. *Doubt:* the label says
"location"; I modelled "missing from the sleeping room" rather than a dead-air-corner placement.

**pri-receptacle** (*open-ground* always defect, tester). An ordinary-looking 3-prong receptacle with a
run of wall paint on the plate.

**pri-closet**. Shelf with stored boxes reaching toward the light. Defect = bare incandescent bulb in a
porcelain pull-chain lampholder (thermal 'hot'). Ok = enclosed LED disc.

**bed2-window** (*security-bars* always defect). Slider window behind a fixed square-tube grille bolted
into the wall with one-way bolts that have been painted over (never opened). There is no release
anywhere. *Doubt:* NC bars are usually mounted outside. I put these inside so they read from the
bedroom.

**bed2-wall-crack**. Defect = a wide diagonal crack from the head-casing corner, tapering and
branching, with a wedge gap where the drywall has pulled off the door head. Ok = a hairline along a
taped butt joint, with faint tape edges in raking light.

**bed2-door** (ok). Six-panel door swung open, latch tongue and strike visible, hinges, both knobs.

**hall-attic-ladder** (*attic-ladder* always defect, portal). Hatch swung down with the ladder still
folded on it, springs and operating arms. The pivot plates have four empty lag-screw holes each, a
couple of finish nails, one bent over, and the plate pulled off the jamb. The yellow manufacturer
label says pivot plates need lag screws.

**hall-co-alarm**. Ok = "SMOKE + CO" face with a CO ppm display. Defect = "SMOKE ALARM" only. Faces are
slightly emissive so they read from below.

**hall-return** (ok). Louvred grille with screws and a dark duct behind.

**util-furnace**. 80% upflow furnace with data plate (MFG 03/2004), blower door, gas shutoff, drip leg
and service switch.
- *furnace-filter* (always defect): filter slid half out of the return platform, matted grey felt
  over the pleats.
- *furnace-burners* (ok, flashlight): clean burners, manifold and gas valve seen through the sight
  window into a real compartment.
- *furnace-flue*: ok = rises toward the B-vent with screws at the joints. Defect = slopes back down,
  joint pulled apart with a gap and soot-blackened ends. Thermal 'hot' on the vent.

**util-dryer** (*dryer-duct* always defect). White vinyl accordion duct, crushed flat at the bend, run
out the side to a wall box with lint at the hood.

**util-washer**. Wall box with hot and cold valves, standpipe, drain hose. Ok = braided stainless
hoses. Defect = black rubber hoses, one with a blister near the valve.

**crawl-vapor-barrier**. *vapor-barrier* (always defect): translucent 6-mil poly, torn, a bare-soil gap
between sheets, a flap folded back, nothing run up the walls. *standing-water*: defect = glossy puddle
with a wet ring (thermal 'wet'). Ok = dry dip.

**crawl-pier**. *pier-crack* (always defect): CMU block slid outward, opening the head joint. The crack
runs up that joint, along the bed joint, then through the lower block, with a chip on the footing.
*pier-shims*: ok = steel shims in full bearing. Defect = loose stacked wood shims with a gap under the
girder.

**crawl-joists**. Joists run across the view. *joist-notch*: ok = 2" drain through drilled holes in the
middle third. Defect = deep notches in the bottom edge with a split running from the notch corner.
*joist-moisture*: joists and subfloor look normal in both states. There is also a grade stamp and a
stapled NM cable.

**crawl-foundation-wall**. *foundation-crack*: defect = stair-step crack that follows the real
running-bond joints, with the inboard section displaced. Ok = one hairline. *efflorescence* (ok): soft
white salts blooming from the bed joints.

**crawl-termite** (*termite-tubes*, flashlight). Ok and defect both have flat dirt drips (the
look-alike). Defect adds near-straight earthen shelter tubes up the block, over the cap and in under
the PT sill, coloured close to the block so they are subtle in the dark.

**crawl-plumbing**. *drain-leak* (flashlight): defect = weeping ABS coupling with a glossy wet sleeve
(thermal 'wet'), mineral crust and falling drops. *pex-supply* (ok): red and blue PEX with clips and
copper crimp rings. *Doubt:* the wet soil below isn't drawn, because the ground is outside this
ceiling-mounted model.

**crawl-duct** (*crawl-duct-down* always defect). Empty boot collar (thermal 'cool') with a loose zip
tie; the flex duct sags from its far strap onto the soil, open end showing insulation.

## What I cut, and why

Every component keeps one detail that only fits that object: the bagged anti-tip kit, the popped
bolt cap and the shim, the tissue on the fan, the painted-over bolt heads, the "fasten with lag
screws" label, the scorched floor past the short hearth, the CO ppm display. Uniform dots and evenly
spaced drips were removed wherever they made a surface look machine-made (filter dust, poly sheet,
cabinet stain, creosote runs).

## Files

- `src/models/inside.js`: the builders.
- `dev/viewer-inside.html`, `dev/viewer-inside.js`: the viewer and audit.
- Playwright left screenshots in `.playwright-mcp/` at the project root. I didn't delete them in case
  the parallel agent is using the same folder; they are safe to remove.

## Round 2 (Voss red-team: M4, M6, minor 13)

Mount origins are unchanged. `npx vite build` passes. The viewer audit is clean in both states, and it
now includes an anchor raycast check (below).

- **M6, vanity S-trap:** the trap is now laid out across the cabinet face, not front to back, so from a
  head-on camera you see tailpiece, U, crown, and a leg straight down through the cabinet floor. There is
  no trap arm to the wall and no vent tee. Doors open to 150°, and the spray bottle moved off the drop
  leg. The supply stops stay plainly chrome and correct for contrast.
- **M6, dryer duct:** the white vinyl accordion duct leaves the back, comes out the right side at floor
  level (kinked flat at the turn), then sags up the wall beside the dryer to a vent box at about 1.2 m,
  above the console. It is in view from the front framing. Lint sits at the hood.
- **Minor 13, toilet:** the brown floor halo is gone. `toilet-base-moisture` now lives on a transparent
  tagged disc at the base. It is invisible by eye and shows 'wet' in the thermal swap in the defect state.
- **M6, bed2-wall-crack:** the crack texture now has a transparent background, so there's no paler wall
  patch flagging the spot.
- **M4, real bug in my model:** the fireplace brick face was one alpha-cut plane, and raycasts ignore
  alpha, so every click or ring into the firebox hit untagged brick. That explains the dead
  firebox-brick, damper and flue rings Voss saw. The face is now a ShapeGeometry with a real opening.
- **M4, anchors:** every checkpoint in my 36 components now has one anchor: a 6 cm invisible tagged box
  with `userData.anchor = true` and name `anchor:<cpId>`, placed in front of the thing to look at. **Kaz:**
  put the hint ring at the anchor's world position instead of the union-bbox centre. In the viewer audit,
  a ray from a framing camera (front-up for floor/wall mounts, below-front for ceiling mounts) through
  each anchor must hit that checkpoint first, in both states. All pass. Fixing the occluded ones meant
  moving anchors off the ajar back-door slab and the drawer front, shrinking the vapor-barrier hit box so
  it no longer covers the standing-water area, and putting the flue anchor at the throat just behind the
  lintel.
- **M3 (hearth copy) and minor 2 (joist split):** the geometry is unchanged and consistent. The opening
  is 0.80 × 0.65 m (about 5.6 sq ft, so 16/8 applies). The ok hearth is about 18 in front and 10 in at
  the sides; the defect is about 8 in. **Henny:** set the copy to these numbers, and mention the split
  at the joist notch (Major is defensible).
- **M6 framing (hearth and threshold under the tool belt):** this is the engine's camera. The anchors
  give it a target.
