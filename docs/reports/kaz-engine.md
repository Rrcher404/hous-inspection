# Kaz: engine report (`src/engine/`)

Status: shipped and playtested in a real browser against the finished `inside.js` and `outside.js` models.
`npx vite build` passes. I ran every one of the 74 components through `engine.openComponent()` and reviewed the contact sheets,
and drove walk, inspect, portal, trigger, thermal, drag-vs-click and rebuild flows with real mouse and keyboard events. The console is clean.
The only errors I saw were transient ones in `outside.js` while it was still being written.

## Module map

| file | job |
|---|---|
| `engine.js` | `createEngine({container,bus,store})`. Sets up the renderer, scene, sky dome, frame loop and two-pass inspect render, and wires the bus. It builds and rebuilds components (with disposal), handles zone/visibility/lighting changes, inspect framing, hover and click routing, travel with a fade, and the public API. The build is deferred one tick so the UI can paint first, and API calls made before `engine:ready` are queued. |
| `layout.js` | Single source for plan numbers: heights, roof surfaces (`mainTop/mainUnder/garTop/porchTop`), the terrain `gradeAt` (including the deck dip and the crawl-door well), `floorAt(level,x,z)`, `headroomAt`, room rectangles, openings, and level bounds. Everything else reads from here. |
| `textures.js` | About 25 canvas textures (wood floor, tile, carpet, lap siding, 3-tab shingles, brick, CMU, parge, concrete, dirt, grass, OSB, blown insulation, deck boards, fence, soffit, asphalt, 6-panel doors, louvers, grilles, house number) and the cached static material palette. Also the ring, check and glow sprite textures. |
| `batch.js` | `StaticBatch`: boxes with per-face materials, oriented members, planar quads, extruded convex prisms and arbitrary geometries, all merged into one mesh per material. UVs are in world metres so textures tile at true scale. |
| `house.js` | The static world: terrain (with a hole over the crawlspace), walls with real openings, baseboards and casings, floors and ceilings, foundation and vents, main, garage and porch roofs, gables, fascia, soffits, gutters and rakes, chimney, deck, porch, front walk, driveway apron, street, utility pole and service conductors, trees, shrubs, fence, horizon, furniture and fixtures, attic framing and insulation, crawl framing, piers, ducts and pipes. It returns groups per visibility layer, collision AABBs per level, ray occluders, portal meshes, and light-fixture positions. |
| `placements.js` | `PLACEMENTS`: an origin pose for all 74 components, plus `poseFor`/`applyPlacement` (roof tilt, valley spin and roll, under-sheathing mounts, view overrides) and `optimizeComponent` (per-component merge by material + checkpointId + thermal tag). |
| `controls.js` | Walk camera (WASD/arrows, drag to look, two-finger scroll to look, Shift to run, collision, eye height by floor and headroom, gentle head bob) and the inspect orbit (drag to orbit, wheel or pinch to zoom). Also eased tweens and click-vs-drag detection. |
| `interact.js` | Material swapper (base, thermal and highlight in one place), raycast picking with wall occluders, checkpoint picking, hint rings and logged badges. |
| `tools.js` | Flashlight (camera spotlight), thermal false colour (matcap materials, so it reads in the dark), per-tool cursors, and per-zone lighting profiles using a fixed light pool (no shader recompiles). |
| `zones.js` | Spawn poses, named exits, portal components, walk-through triggers, `zoneAt`, which component zones are drawn from where, static groups per level, and circle-vs-AABB collision. |

## API (as built)

```js
engine.goToZone(zoneId)          // fade to the zone's spawn pose (also used by ui:teleport)
engine.openComponent(id)         // same zone and within 7 m: ease straight in. Otherwise fade to a standing
                                 // spot in front of it (or the zone spawn) and ease into inspect. Portal
                                 // components open for inspection here; they do not travel.
engine.exitInspect()             // ease back to the exact walk pose (also on ui:inspect-exit)
engine.rebuild()                 // also runs on inspection:new
engine.getZone()
engine.debug = { camera, scene, renderer, componentObjects /* Map id -> Group */, recs, controls, house,
                 setPose({level,x,z,yaw,pitch}), info(), stats: { buildMs, meshes:{before,after}, fps } }
```

Events emitted match CONTEXT.md §7. `hover` carries an extra optional `portal` field (the destination) when the
hovered thing is a portal. The engine does **not** bind Esc and does **not** call `store.markZone` or `store.markComponent`
(per the coordinator's note: the UI owns both).

## Controls

| input | walk mode | inspect mode |
|---|---|---|
| W/A/S/D, ↑/↓ | move / strafe | (ignored) |
| ←/→ | turn | (ignored) |
| Shift | run (×2.1) | |
| drag | look, "grab the world" style (like a walkthrough panorama) | orbit around the component |
| two-finger scroll | look (natural-scroll aware) | zoom (pinch also zooms) |
| click | component: inspect; portal component or portal mesh: travel | tagged mesh: `checkpoint:click` |
| right-click / Shift-click / Alt-click / **E** on hover | inspect even if it's a portal (ladder, attic stairs, back door, crawl door) | |

Click vs drag: a click needs under 6 px of travel and under 700 ms. Every drag rotates and never fires a click (verified).
Input is ignored while `ui:modal {open:true}`, and keys are ignored while focus is in an input, textarea or select.

Walk speeds: house and yard 1.9 m/s, roof 1.2, attic 1.1, crawl 0.75. Eye heights: 1.6 / 1.55 / 1.5, and 0.55 in the crawl.
In the crawl you duck automatically under girders and the trunk duct. In the attic the eye lowers toward the eaves.

## Travel, portals, triggers

- Manifest portals: `ext-ladder` → roof, `hall-attic-ladder` → attic, `kit-back-door` → deck.
- **`ext-crawl-access` is treated as a portal into the crawl by the engine** even though the manifest doesn't mark it.
- Exit portal meshes (invisible, clickable, with a hover name): the deck side of the back door → kitchen, the attic hatch → hall,
  the crawl door from inside → yard by the door, the ladder top on the roof → yard at the ladder foot.
- Walk-through triggers (fade): hall ↔ garage through the fire door. Walking down the roof at the ladder exits to the yard.
  Stepping onto the attic hatch drops you into the hall. Walking to the crawl door exits. Triggers re-arm only after you leave them.
- The back door is a **real walkable opening**, because the inside model is ajar with jambs and threshold in the wall.
  The front door and the garage side door are open and walkable too. The overhead garage door is closed and blocks.

## Placement summary (origin, rotY or plane)

Exterior: grading wedge in front of the living room (3,·,11.7). Downspout and **gutter** at the front-left corner and front eave
(origin lifted so the model's own roof edge meets mine). Siding patch, service drop and meter on the garage **east** wall,
with the panel directly behind it inside. Living window outside at (3.5,0.7,10.2). Hose bib on the north wall by the laundry.
**A/C condenser back edge on the north wall** behind the furnace. Exterior GFCI under the porch. Front steps 7,·,10.2–11.8.
Driveway tilted to meet the garage slab (−0.15) and run to the street. Crawl access on the north foundation at x 9.6,
in a shallow dug well. Ladder at the front eave, x 14.

Roof (tilted +ROOF_PITCH; north plane yawed 180° first, per outside.js): shingle field, south plane (11,7.6).
Chimney at the west rake (−0.6,7.0) on a small roof apron that wraps the exterior chimney. Vent boot on the **north** plane
over the bath (9.8,3.0), lined up with a static PVC vent through the attic. Eave edge by the ladder. **Valley** on the west
side of the front-porch cross-gable (spun 41.8° in-plane and rolled flat onto the main plane). Ridge vent at the main ridge (flat).

Deck: ledger and framing on the north wall plane (framing per its free-mount note: origin on the wall plane at the joist bottom).
Guard on the north edge (rotY π: posts face outward). Stairs off the north edge on a concrete landing pad.
Post at the NE corner on grade, with my static beam at the height the model's post carries.

Interior: fireplace on the west wall, z 7. Smoke alarm, ceiling stain (near the chimney) and receptacle at 0.3 m on the south wall.
Kitchen run along the north wall (DW, sink, range, hood, GFCI at 1.02 m). Back door at x 5.05.
Bath: tub and toilet along the north wall, vanity and GFCI on the east wall, fan on the ceiling.
Primary: **window floor-referenced** at y 0 (sill 52 in), receptacle on the west wall, ceiling alarm, reach-in closet light.
Bed2: barred window on the north wall. **Door model in the real hall doorway** (11.9). Crack panel centred over that door at its head casing.
Hall: attic stairs in a 1.4×0.7 ceiling hole, CO/smoke alarm, return grille low on the wall.
Laundry: washer, dryer, furnace along the north wall. Garage: panel on the east wall (z 3), water heater NE corner,
fire door on the common wall in the hall line, overhead door, firewall patch.

Attic (all floor props at the drywall plane y 2.445; my insulation has holes where they sit): insulation patch, bath duct
over the bath fan, half-truss model at truss 12 with its heel on the north eave, soffit baffle at the south eave,
sheathing patch under the north plane aligned to my truss chords, supply duct, wiring, pests near the west gable.

Crawl: vapor retarder near the rear wall, pier and girder on the grid (replacing one static pier), joists rotated so they run N–S
like mine, block wall section as the east crawl wall (replacing that static run), termite section on the north wall,
drain/supply origin at the floor underside, flex duct at the joist bottom (its geometry only lands on the soil that way).

## Look, lighting, tools

- Sky gradient dome with a sun, fog, ACES tone mapping. One directional sun with soft shadows. The shadow map is rendered **once**
  (static sun, static world) and again after a rebuild, so there is no per-frame shadow cost.
- Interiors: hemisphere fill plus a pool of 3 point lights moved to the current room's fixtures. Emissive ceiling fixtures.
- Attic and crawl: sun off, hemisphere at 0.012, near black fog, faint daylight slivers at the ridge vent, eaves, gable louvers,
  foundation vents and the crawl door. Without the flashlight you get only a faint glow.
  The flashlight is a soft SpotLight on the camera (26 in dark zones, 3.5 in daylight).
- Thermal: materials swap to `MeshMatcapMaterial` false colour by `userData.thermal` (hot, warm, cool, cold, wet, neutral).
  It reads with no lights, invisible `userData.hit` boxes stay invisible, and everything is restored exactly when switched off.
  The sky is hidden and the clear colour goes black.
- Inspect mode: pass 1 renders the scene, then a 42% dim quad, then pass 2 redraws only the component, undimmed, where it is
  actually visible (depth is kept, so there is no x-ray through roofs or walls). Hint rings (orange, pulsing) sit on unlogged
  checkpoints when `settings.hints` is on. A small green check badge marks logged ones, updated on `finding:logged` and
  `settings:changed`. Hovering a checkpoint lifts its emissive. Cursors: grab, grabbing and pointer for the hand tool,
  and custom SVG cursors for the flashlight, moisture meter, tester and thermal camera.

## Performance (measured in the automation browser, 1280×800, PR 1)

Build takes about 530 ms (textures, shell and 74 models). Merging takes component meshes from 1417 to 803.
Draw calls: about 130–350 in rooms, attic and crawl, and about 900 in the front yard (which sees the whole facade and most exterior props).
Measured 113 fps in the yard view. Pixel ratio is capped at 2, and if 120 frames average over 21.5 ms it steps down 0.25 at a time to 1.
No allocations per frame in the hot path: the hover candidate lists are cached per visibility change, and collision, eye and tween
code reuses scratch objects. Lights never change count. Rebuilding twice leaves the renderer's geometry and texture counts unchanged
(no leak).

## Known issues

1. **The front-yard draw count (about 900) is the heaviest view.** It holds 60 fps in testing, but on a hot MacBook at DPR 2 the
   adaptive pixel ratio may kick in. The cheapest next step is distance or occlusion culling of deck and shed props from the front yard.
2. The **fire door** is a closed slab, so the hall ↔ garage crossing is a fade trigger, not a walk-through.
3. **Portal components** travel on a plain click. Their checkpoints (attic-ladder, door-threshold, crawl-door) are reached with
   right-click, Shift-click or E, or by `openComponent`/`ui:goto-component`. **The UI should hint this on hover** (see requests).
4. During inspect, the orbit has no collision. Swinging around a wall item can put the camera behind nearby geometry.
   The component is then hidden behind it, which is honest but can confuse.
5. bath-toilet ships its own floor patch (wood look) over my bath tile. It reads as a different floor at the toilet base.
6. att-truss and att-sheathing chords sit within a couple of centimetres of my static members (by design, aligned).
   Faint z-fighting is possible at grazing angles.
7. The roof valley: the model's 8° V can't match the real 37° dihedral against the porch roof, so I roll it flat onto the main
   plane and its porch-side half tucks under my porch shingles.
8. The Playwright browser is shared between agents. My checks ran in a private browser context.

## Contract notes and change requests

- **CR-1 (UI):** please show a hover hint for portal components and meshes, using the `hover.portal` field:
  "Click to climb / go through · right-click or E to inspect".
- **CR-2 (manifest, optional):** mark `ext-crawl-access` with `portal: 'crawl'` so the data matches the engine.
- **CR-3 (models, optional):** `deck-stairs` = 0.925 m and `deck-posts` (post 0.62 + beam 9.25 in) drive my deck heights.
  If either changes, update `STAIR_H` in `layout.js` and the beam math in `house.js`.
- Coordinator requests honoured: the deck's outer edge has a ≥ 0.9 m drop (the rear yard falls away under the deck),
  with 5-riser stairs and a landing pad. No Esc binding. No `markZone`/`markComponent`.
  `pri-window` is floor-referenced. The back door and bed2 door have real wall openings.
  Crawl ceiling origins are at the floor underside, except crawl-duct (see placements).
