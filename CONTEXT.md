# CONTEXT.md — Walkthrough Inspector (hous-inspection)

Shared brief for every agent on this build. Read it fully before writing code. If something here
conflicts with your instinct, this file wins; if this file is silent, use judgment and note it in
your report.

## 1. What we're making

A first-person 3D **learning game**: the player is a home-inspector trainee walking a detailed
virtual house at **417 Loblolly Lane, Raleigh NC** (1987 ranch, vented crawlspace, attached garage,
rear deck, garden studio with a clay tile roof). They find components, examine them up close,
use real inspector tools, **classify** what they see (severity + who to refer), get instant teaching
feedback, take pop quizzes, and finish by generating an **inspection report** that is graded.

It is mapped to the 20 courses of InterNACHI's 120-hour NC pre-licensing program
(`src/data/courses.js`). The player is studying for the NC Home Inspector Licensure Board exam (the Board's own HILB exam, not the NHIE) right now.
Every mechanic must teach something real. Accuracy beats flash.

**Replayability:** checkpoints marked `variable` are randomized per inspection (seeded), so the
house is a different house every time. Some items are always defective, some are deliberate red
herrings (`ok`) that teach "don't over-call".

## 2. Stack & layout

- Vite 5 + vanilla ES modules + three@0.170 (`import * as THREE from 'three'`). No React. No TypeScript.
- No external asset files. Everything is procedural geometry + canvas textures. No CDN fetches at runtime.
- Run: `npm run dev` (port 5173). Build: `npm run build`. Contract check: `npm run check`.

```
index.html              root: #world (canvas host) + #ui (overlay)
src/main.js             boot + wiring            (orchestrator)
src/core/bus.js         pub/sub                   (orchestrator)
src/core/store.js       state, scoring, persist   (orchestrator)
src/data/manifest.js    zones/components/checkpoints — THE contract (orchestrator)
src/data/courses.js     20 courses                (orchestrator)
src/data/taxonomy.js    severities, referrals, tools (orchestrator)
src/data/checkpoints.js CHECKPOINT_CONTENT        (Henny)
src/data/quizzes.js     QUIZZES                   (Lindqvist)
src/data/lessons.js     LESSONS (field notes)     (Lindqvist)
src/models/kit.js       shared modelling kit      (orchestrator)
src/models/outside.js   builders: exterior, roof, deck, shed, garage, attic   (Isolde-A)
src/models/inside.js    builders: living, kitchen, bath, primary, bed2, hall, laundry, crawl (Isolde-B)
src/models/index.js     merge + fallback          (orchestrator)
src/engine/*            scene, house shell, movement, interaction, tools (Kaz)
src/ui/*                HUD, panels, quizzes, notebook, report, title  (Yuki)
```

**Only edit files you own.** If you need a change in someone else's file, write it in your report.

## 3. Domain model (manifest.js)

- **Zone** – area of the house. `type`: exterior | roof | interior | attic | crawl. `dark: true` = needs flashlight.
- **Component** – one inspectable object. Its `id` is also its model builder key. `mount` + `size` define the model origin and footprint. `portal: 'zoneId'` = clicking it travels there (ladder → roof, attic stairs → attic, back door → deck).
- **Checkpoint** – one judgment call inside a component. `kind`: `variable` | `defect` | `ok`. `tool`: required tool to perceive the condition (`flashlight` | `moisture` | `tester` | `thermal`).
- Per inspection, `store.inspection.states[checkpointId]` is `'defect'` or `'ok'`.

## 4. Mount conventions (models ⇄ engine)

Units are **metres**. Builders return a `THREE.Group` whose origin is:

| mount     | origin                                   | orientation                         |
|-----------|------------------------------------------|-------------------------------------|
| `floor` / `ground` | bottom-centre, resting on y=0   | front faces **+Z**                  |
| `wall`    | bottom-centre of the BACK face, back on z=0 plane | object extends into +Z, front faces +Z |
| `ceiling` | top-centre at y=0, hangs into −Y         | front faces +Z                      |
| `roof`    | bottom-centre on a flat y=0 plane        | engine tilts it to the roof pitch   |
| `free`    | builder's choice, document it            |                                     |

Keep within ~±25% of `size`. The engine places, rotates, and scales nothing else.

## 5. Model contract (Isolde-A / Isolde-B)

```js
import { THREE, box, cyl, pipe, tube, decal, texPlane, textTex, stainTex, canvasTex, tag, thermal, group, mat, C } from './kit.js';
export const builders = {
  'gar-water-heater': (states, comp) => { const g = group('wh'); /* ... */ return g; },
};
```

- `states[cpId]` is `'defect'` or `'ok'`. Render **both** versions convincingly for `variable` checkpoints. `defect`-kind only needs the defect look; `ok`-kind only the acceptable look.
- **Every checkpoint id of the component must be tagged** (`tag(mesh, cpId)`) on a clickable mesh in every state. Tag a mesh big enough to click (≥ ~6 cm). Tiny details (a nail head) get an invisible-ish slightly larger hit mesh: `mat(C.x, {transparent:true, opacity:0})` is fine.
- The defect must be **readable on screen** when the camera frames the component at ~1–1.5 m: a missing pipe, a visible double-tapped lug, a stain, a crack. Exaggerate slightly for legibility, never cartoonishly. The `ok` version must look plausibly the same object done right, so the player has to actually judge.
- Tool-only conditions (tool set in manifest) should look **visually normal or ambiguous** — the tool reveals the truth. E.g. `ceiling-stain` always shows a stain; only the moisture meter says if it's wet.
- Thermal: call `thermal(mesh, 'hot'|'warm'|'cool'|'cold'|'wet')` on meshes that should glow in IR (e.g. a hot breaker in defect state, cold void in insulation, wet drywall). Neutral otherwise.
- Use `C` palette + `mat()` (cached). Canvas textures for labels/data plates (`textTex`), e.g. the water heater data plate shows MFG date **2009**, smoke alarm back label shows a manufacture date older than 10 years.
- Detail matters: this is the "very detailed" part of the brief. Bevel-free primitives are fine; detail comes from correct parts (TPR valve, discharge tube, gas valve, draft hood, burner door, data plate; breakers with handles, bus bars, neutral bar, grounding conductor; etc.).
- Performance: aim for < 150 meshes per component, reuse materials, `castShadow` only on meaningful parts.

## 6. Engine contract (Kaz)

`src/engine/engine.js` exports `createEngine({ container, bus, store })` returning
`{ goToZone(zoneId), openComponent(componentId), exitInspect(), rebuild(), getZone() }`.
Build models with `buildComponent(componentId, store.inspection.states)` from `src/models/index.js`.

### Floor plan (you own exact geometry; keep these relationships)

+X = east, +Z = south (street). Interior finished floor **y = 0**, ceiling **2.44**. Outdoor grade **y = −0.75**.

```
                 NORTH (rear yard)                        
   shed (-7..-4, -7..-4)      deck x0.5–5.5, z−3.6–0 (top y≈−0.05), stairs down to grade
 z=0 ┌────────────┬─────────┬─────────┬──────────┐┌──────────┐
     │ KITCHEN    │ LAUNDRY │ BATH    │ BEDROOM 2││          │
     │ x0–6       │ x6–8.5  │ x8.5–11 │ x11–15   ││  GARAGE  │
 z4.5│ (open to   ├─────────┴─────────┴──────────┤│ x15–21.5 │
     │  living)   │  HALL  x6–15, z4.5–5.7  ──── fire door ─┤ z0–10   │
 z5.7│ LIVING     ├───────┬──────────────────────┤│ slab     │
     │ x0–6       │ FOYER │ PRIMARY BEDROOM      ││ y=−0.15  │
     │ fireplace  │ x6–8  │ x8–15                ││          │
     │ on west    │       │                      ││ overhead │
 z=10└────────────┴front door┴────────────────────┘└─door (south)┘
                 front steps z10–11.6 (4 risers, grade → floor)   driveway south of garage
```
- Gable roof, ridge along X at z=5, 6/12 pitch, small overhangs; garage has its own lower gable. Asphalt shingles. Exterior masonry chimney on the west wall around z≈7 rising ~1 m above the roof.
- **Crawlspace** under the main block: dirt/ground y≈−1.05, joists to y=0, block foundation walls, masonry piers on a grid, access door on the north foundation wall near x≈9. Camera crouched (eye ≈ −0.5). Dark.
- **Attic** above the ceiling: trusses, insulation on the ceiling plane, ridge vent, soffit vents at eaves. Accessed via pull-down stairs in the hall ceiling (~x=10, z=5.1). Dark.
- **Roof zone**: player stands on the roof (or on the ladder at the eave). Reached via the ladder component outside.
- Use sensible window and door openings. Rooms get real-looking finishes: wood floors, tile in bath/kitchen, baseboards, ceiling fixtures, simple furniture silhouettes so rooms feel lived-in (kept low-poly and NOT clickable).

### Movement & interaction
- Walk: WASD/arrows, **drag to look** (no pointer lock — the player uses a Mac trackpad), Shift to walk faster. Simple collision against walls. Floor height by location (interior 0, outside −0.75, garage −0.15, steps ramp).
- Hover: raycast from the mouse; components get a soft outline/emissive lift + `hover` event. Cursor changes.
- **Walk mode click on a component** → `component:open`: camera eases (~0.6 s) to a framing pose 1–1.5 m in front of it, enters **inspect mode**: orbit/zoom around the component with drag & wheel; everything else dims slightly. Esc / UI back → return to the exact walk pose.
- **Inspect mode click on a tagged mesh** → `checkpoint:click`.
- Portals: clicking a component with `portal` in walk mode travels to that zone's spawn (fade transition). Provide "return" spawns (e.g. leaving the attic drops you in the hall).
- Hints (`store.settings.hints`): in inspect mode show subtle pulsing rings on **unlogged** checkpoints; logged ones get a small check badge (listen to `finding:logged`).
- Dark zones: very low ambient. `flashlight` tool = SpotLight from the camera, soft cone. Without it, show only a faint glow so the player realizes they need it.
- `thermal` tool: swap materials to a false-colour palette by `userData.thermal` (hot=white/yellow, warm=orange, cool=purple, cold=deep blue, wet=dark blue/teal, neutral=mid purple-blue). Restore when switching off.
- Performance target: 60 fps on an M-series MacBook. One directional sun with shadows outside; cheap lights inside. `renderer.setPixelRatio(Math.min(devicePixelRatio, 2))`.

## 7. Events (src/core/bus.js)

Emitted by **engine**:
| event | payload |
|---|---|
| `engine:ready` | `{}` |
| `zone:enter` | `{ zoneId }` |
| `hover` | `{ componentId \| null, checkpointId \| null, name }` |
| `component:open` | `{ componentId }` (after camera arrives: `inspect:entered`) |
| `inspect:entered` | `{ componentId }` |
| `inspect:exited` | `{}` |
| `checkpoint:click` | `{ checkpointId, componentId, x, y }` (screen px) |

Emitted by **UI**:
| event | payload |
|---|---|
| `ui:teleport` | `{ zoneId }` |
| `ui:goto-component` | `{ componentId }` (travel to zone + open component) |
| `ui:inspect-exit` | `{}` |
| `ui:stick` | `{ x, y }` each -1..1 (y down) from the touch stick; `{0,0}` on release |
| `ui:modal` | `{ open: boolean }` — engine ignores movement/clicks while any modal is open |

Emitted by **store**: `tool:changed {tool}`, `finding:logged {checkpointId, entry, truth}`, `xp:gained`, `rank:up`, `quiz:answered`, `inspection:new`, `inspection:finished`, `settings:changed`.
Engine must handle `inspection:new` by rebuilding all component models with the new states.

## 8. Content contract (Henny) — `src/data/checkpoints.js`

```js
export const CHECKPOINT_CONTENT = {
  'panel-double-tap': {
    title: 'Double-tapped breaker',            // shown after the click
    course: 'elec-adv',                         // primary course id
    defect: {
      observe: 'What you see/feel/measure. Sensory. No verdict.',
      severity: 'safety',                       // safety|major|repair|monitor|ok
      rec: 'electrician', recAlt: [],           // taxonomy ids
      why: 'The teaching. 2–4 sentences. Mechanism of harm, how pros confirm.',
      report: 'Professional report narrative a real NC inspector would write.',
      reading: '…',                             // ONLY for tool checkpoints: what the tool shows
    },
    ok: { /* same shape; required for variable + ok kinds */ },
    tip: 'One field-craft tip.',
    nc: 'Optional NC-specific note (NC SOP 11 NCAC 08 .1100 series). Only if confident.',
  },
};
```
`defect`-kind checkpoints need only `defect`; `ok`-kind only `ok`; `variable` needs both.
Optional per state: `sevAlt: ['monitor']` = alternative severities that get full credit where licensed
inspectors legitimately differ (use sparingly; there must still be a best answer).

### Grading rules (round 2, after the Voss red-team)
- The **first** log of a checkpoint is the graded record. Re-logs are practice and never change the grade.
- `observe` is hidden until the player classifies. Revealing it ("Describe it for me") halves the points.
  The player is meant to judge from the 3D model; tool readouts are the evidence for tool-gated items.
- Referral points only count when the severity call is exact or one step off.
- Variable checkpoints roll defective 40% of the time.
Answers must be defensible to a licensed NC inspector. Where practice varies, accept alternatives with `recAlt` and say so in `why`.
Report language: inspectors **observe and report**, recommend evaluation/repair by a qualified professional; they do not diagnose beyond the SOP or quote code as a code official would.

## 9. Quizzes & lessons (Lindqvist)

```js
export const QUIZZES = [
  { id: 'q-wh-01', course: 'water-heater', components: ['gar-water-heater'], difficulty: 1,
    q: 'Question stem (licensing-exam style)', choices: ['A', 'B', 'C', 'D'], answer: 2, explain: 'Why, in 1–3 sentences.' },
];
export const LESSONS = {
  'water-heater': {
    oneLine: 'One-sentence version.',
    paragraph: 'One-paragraph version.',
    lookFor: ['bullet', 'bullet'],          // what to check in the field
    keyNumbers: [{ k: 'TPR discharge termination', v: '≤ 6 in above floor / drain' }],
    wobble: 'A do-something question that proves understanding.',
    mnemonic: 'optional memory hook',
  },
};
```
`components` links a quiz to components (pop quiz on first open). Quizzes with `components: []` are for room checks and Exam Mode.

## 10. UI (Yuki) — what screens exist

Title screen → New inspection / Continue / Exam Mode / Course Map / Settings. HUD (address, zone,
progress, XP & rank, tool belt 1–5, mini-map fast travel). Inspect panel (component name, checkpoint
list with neutral labels, back). **Log card** (observation → choose severity → choose referral →
feedback with `why`, sample report text, course chip, quiz offer). Tool readouts (moisture %,
3-light tester pattern, IR legend). Pop quiz modal. Notebook (Field Notes per course, course coverage
map, glossary). Report screen (NC-style summary page, findings by system, missed items, score, grade,
"show me" buttons, print). Toasts for XP / rank-up. Onboarding: a 60-second guided first room.

## 11. Voice & look

Calm, warm, professional. Think "a senior inspector riding along with you", not arcade. UI is a
clean field-tablet aesthetic: off-white cards, dark ink, one accent (safety orange `#f2803a`), severity
colours from taxonomy. System font stack or Inter-like. Respect `prefers-reduced-motion`.
No em-dashes in player-facing copy (use commas, colons, periods).

## 12. Field Guide (round 3): the inspector riding along

Asked for by the player: when you open something (e.g. the attic supply duct) a speech bubble explains
what you are looking at, what a pro checks on it, and how to describe it, with an option to turn it off.

### Content — `src/data/guides-out.js` + `src/data/guides-in.js` (Henny), merged in `src/data/guides.js`
- `guides-out.js`: zones exterior, roof, deck, shed, attic, crawl (40 components).
- `guides-in.js`: zones living, kitchen, bath, primary, bed2, hall, laundry, garage (34 components).

```js
export const GUIDES_OUT = {
  'att-duct': {
    what: 'What it is and why it matters, in plain words. 1–2 sentences, <= 45 words.',
    look: [ // one item PER CHECKPOINT (cp = checkpoint id), in the order a pro would check them,
            // plus at most ONE extra item without cp for a general glance (rendered as "Also worth a glance").
      { cp: 'attic-duct-joint', text: 'Neutral question + what good looks like vs what bad looks like. <= 32 words.' },
      { cp: 'some-tool-cp', tool: 'moisture', text: '...' }, // REQUIRED: tool = manifest tool for tool-gated checkpoints
    ],
    pro: 'Optional. How a pro moves around this thing: order, angle, where to put the light. <= 30 words.',
    watch: 'Optional. A judgement trap in general terms (over-calling, under-calling, what NOT to write). <= 30 words.',
    terms: [{ term: 'Boot', means: 'The sheet-metal box behind a register that the duct connects to.' }], // 1–3 report words
  },
};
export const ZONE_GUIDES_OUT = {
  attic: { intro: 'Arriving here: what this space is, what a pro checks first, the safety rule. <= 50 words.' },
};
```

**The golden rule.** Checkpoints are randomized per inspection. A guide must read *identically* whether the
part rolled defective or fine, and for `defect`-kind and `ok`-kind checkpoints too. So: describe both what
acceptable looks like and what a defect looks like, as a question the player answers by looking. Never
"this one is…", never hint a part is a red herring, never quote the severity or referral (that is the
player's call and is graded). The checkpoint content (`observe`/`why`/`report`/`tip`) is the reward after
logging; the guide must not paraphrase it so closely that it gives the answer away.
Facts must hold for an NC licensed inspector (11 NCAC 08 .1100 SOP). No em dashes. Plain words.

### UI (Yuki) — `src/ui/guide.js` (new), wiring in `ui.js`, settings, styles
- Bubble opens with inspect mode; zone intro on first entry to a zone per inspection.
- Setting `store.settings.guide`: `'always' | 'fade' | 'ask' | 'off'` (missing = `'fade'`).
  `fade` = opens by itself until you have judged every checkpoint of that component exactly, solo (no
  description, guide not open), at least once; randomized checkpoints need a solo exact call in BOTH the
  defect and the fine state (`store.mastery(cpId)` → `{ n, good, defect, ok }`). Then it starts folded as a
  small "Guide" pill. `ask` = always folded. `off` = nothing.
- No points are lost for reading the guide (unlike "Describe it for me", which halves points), but a log made
  with the guide open is recorded `guided: true`, never counts toward mastery, and the report shows the count.
- Desktop (>= 1180x600) floats the bubble left of the object; smaller screens show it as a "Guide" tab in the
  inspect sheet. The UI announces the bubble width on `component:open` so the engine frames beside it.

### Events
| event | payload | |
|---|---|---|
| `ui:guide-focus` | `{ checkpointId \| null, secs? }` | UI → engine: pulse that checkpoint's ring (teal, even with hints off) for `secs` (default 3) |
| `ui:guide-layout` | `{ left }` px | UI → engine: left inset taken by the open desktop bubble (0 when folded/docked) |
