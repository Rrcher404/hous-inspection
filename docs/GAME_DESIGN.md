# Walkthrough Inspector: Game Design

## The one-sentence version
Walk a real-feeling house, find what's wrong, decide how serious it is and who should fix it,
and learn the "why" from the exact course you're studying, until the judgement is automatic.

## Who it's for
One adult learner working through InterNACHI's 120-hour NC pre-licensing program, heading for
the NHIE and the 80 hours of field training. Mac, trackpad, study sessions of 20 to 60 minutes.

## Design pillars
1. **Judgement over recall.** The core verb isn't "click the defect", it's *classify* it:
   Safety / Major / Repair / Monitor / Acceptable, plus who to refer to. That's the skill the field
   training and the report actually need.
2. **Red herrings on purpose.** Efflorescence, aluminum service conductors, a closed-cut valley,
   a recirculating hood. Over-calling is a real professional failure (scared buyers, liability),
   so it's scored and explained.
3. **Tools reveal truth.** A ceiling stain always looks like a stain. Only the moisture meter tells
   you if it's wet today. A receptacle looks fine until the tester shows an open ground. That is
   how inspection works, so that's how the game works.
4. **A different house every time.** ~60 checkpoints are randomized per inspection from a seed.
   You can't memorize the house, only the method.
5. **Every mechanic traces to a course.** Each component and checkpoint is tagged to one or more of
   the 20 courses, so progress in the game shows up as coverage on the Course Map.

## Core loop
```
walk  →  spot a component  →  inspect up close (orbit)  →  pick a tool if needed
  →  click a checkpoint  →  read the observation  →  classify severity + referral
  →  instant feedback (why, sample report language, course link)  →  pop quiz sometimes
  →  room complete → room check quiz  →  finish → graded NC-style report with "show me" on misses
```

## The house
417 Loblolly Lane, Raleigh NC. 1987 single-story ranch over a vented crawlspace (very NC),
attached 2-car garage, rear deck, a garden studio with a clay tile roof (so the Tile Roofs course
has something to stand on). 14 zones, 74 components, 119 checkpoints.

| Zone | Teaches (courses) | Signature finds |
|---|---|---|
| Exterior | Exterior x2, Moisture, Electrical | negative grading, downspout at foundation, siding to soil, service drop in trees, missing GFCI |
| Roof | Roofs, Asphalt Shingles, Fireplaces | granule loss, exposed nails, cracked crown, caulk-only flashing, cracked vent boot |
| Deck | Decks, Structural, Egress | nailed ledger, missing hangers, 4-in sphere balusters, buried posts |
| Garden studio | Tile Roofs | broken and slipped clay tiles |
| Living | Fireplaces, Electrical, Moisture | cracked firebox, short hearth, creosote (flashlight), wet vs dry stain (meter) |
| Kitchen | Appliances, Plumbing, Electrical | no anti-tip bracket, no DW high loop, flex drain, unclamped disposal whip |
| Bath | Plumbing, Moisture | S-trap, loose toilet, wet tile wall (meter), GFCI |
| Bedrooms | Egress, Electrical, Structural | 52-in sill, bars with no release, open ground, settlement crack |
| Hall | Attic & Interior, Egress | attic ladder fasteners, smoke-only vs combo CO alarm |
| Laundry | HVAC, Appliances | clogged filter, flue joint, foil dryer duct, rubber washer hoses |
| Garage | Adv. Electrical, Water Heaters, Egress | double tap, open knockouts, white-as-hot, TPR discharge, 2009 data plate, pet door in fire door, auto-reverse |
| Attic | Attic, Structural, HVAC | 3-in insulation, fan vented into attic, cut truss, open splice, rodents |
| Crawlspace | Crawlspaces, Foundations, Structural, Moisture | torn vapor retarder, cracked pier, notched joist, mud tubes, fallen duct |

## Tools (keys 1 to 5)
Eyes & Hands · Flashlight (dark zones) · Moisture Meter (%WME) · Receptacle Tester (3-light + GFCI
button) · Thermal Camera (false-colour, never a stand-alone diagnosis).

## Scoring
Per checkpoint: severity exact 10, one step off 5 (never across Acceptable), right referral 5,
+2 for finding a real defect. Quizzes: 15, +5 first try. Report grade from total vs maximum.
Ranks: Trainee → Ride-Along Apprentice → Field Trainee → Associate → Licensed → Senior → Master.

## Learning layer
- **Pop quizzes** on first opening a component (NHIE-style, linked by component).
- **Room checks**: 3 questions when a room is fully logged.
- **Exam Mode**: 25 random questions from the whole bank.
- **Field Notes**: every course in three sizes (one line, one paragraph, the field checklist),
  key numbers, and a "wobble" question you answer by doing something in the house.
- **Course Map**: coverage of all 20 courses from what you've actually logged and answered.

## Build architecture
Vite + vanilla JS + three.js, no external assets (everything procedural + canvas textures).
One manifest is the contract between engine (placement), models (geometry + defect/ok renderings),
content (observe/why/report), quizzes, and UI. See `CONTEXT.md`.

## Built by a persona team
| Persona | Role | Owns |
|---|---|---|
| Kaz | engine technologist | `src/engine/` |
| Isolde (x2) | 3D prop and set dresser | `src/models/outside.js`, `inside.js` |
| Henny | NC inspector, report trainer | `src/data/checkpoints.js` |
| Lindqvist | exam-prep designer | `src/data/quizzes.js`, `lessons.js` |
| Yuki | interface empath | `src/ui/` |
| Voss | skeptic, red-teams the running build | review |
| Solano | synthesis | integration decisions |

## Roadmap ideas (not in v1)
- Report writing mode: type your own narrative, graded against key phrases.
- Timed "real inspection" mode with a 3-hour in-game clock and a client asking questions.
- More houses: 1920s bungalow with knob-and-tube, 2006 two-story with EIFS and a heat pump.
- Spaced repetition on missed quiz items across sessions.
