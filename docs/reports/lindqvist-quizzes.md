# Lindqvist report: quizzes and field notes

Files written: `src/data/quizzes.js` (217 questions), `src/data/lessons.js` (20 of 20 courses).
`npm run check`: no quiz or lesson errors. Answer spread is 55/54/54/54. The only ERRs left are 62 `content missing` lines for checkpoint content (Henny's file).
`npx vite build`: fails, but in `src/models/inside.js` (no `builders` export) and `src/ui/content.js` (it imports `GLOSSARY` from checkpoints.js). Both belong to other agents. My two files transform cleanly.

## Count per course

| course | n | difficulty 1/2/3 |
|---|---|---|
| sop-25 | 26 | 10/13/3 |
| elec-adv | 15 | 5/7/3 |
| elec-res | 13 | 8/5/0 |
| attic-interior | 12 | 6/6/0 |
| plumbing | 12 | 7/5/0 |
| fireplace | 11 | 6/5/0 |
| hvac | 11 | 5/5/1 |
| appliances | 10 | 5/5/0 |
| water-heater | 10 | 4/5/1 |
| moisture | 10 | 4/6/0 |
| ext-how | 10 | 5/5/0 |
| deck | 10 | 6/4/0 |
| crawl-adv | 9 | 4/5/0 |
| ext-fund | 9 | 4/5/0 |
| egress | 9 | 3/6/0 |
| roof | 8 | 5/3/0 |
| roof-asphalt | 8 | 3/4/1 |
| foundation | 8 | 4/4/0 |
| roof-tile | 8 | 3/4/1 |
| structural | 8 | 3/4/1 |

- Every component that has checkpoints (73 of them) has at least one linked pop quiz. `ext-ladder` has no checkpoints but is linked to the ladder-safety question.
- 32 questions are general (`components: []`) and feed Exam Mode.
- How the answer spread stays balanced: each entry is written as `q(id, course, components, difficulty, stem, right, [3 wrong], explain)`. The helper puts the right answer at a rotating index, so the spread stays even when questions are added. The output shape is exactly what CONTEXT.md §9 specifies.

## Hidden prerequisites and how the sequencing handles them

Each of these is a concept that a cluster of questions quietly assumes. Each one gets a difficulty-1 question and is named in that course's lesson `paragraph`.

| prerequisite | questions that assume it | where it is taught first |
|---|---|---|
| SOP vocabulary: readily accessible, representative number, inspect, not technically exhaustive | all scope questions | q-sop-01, q-sop-13, q-sop-14, q-sop-25; sop-25 lesson |
| Must / may / need-not: "excluded" means not required, not forbidden | pests, fogged glass, backflow, water heater age | q-ca-06, q-eh-03, q-eh-05, q-wh-05; sop-25 mnemonic |
| Grounded (neutral) vs grounding (equipment ground) vs bonding | double tap, neutral bar, subpanel, open ground | q-ea-13 (d1) before q-ea-02 and q-ea-14 (d3) |
| What a 3-light tester can and cannot see | open ground, bootleg ground, AFCI | q-er-04; elec-res lesson |
| A thermal camera sees temperature, not water or cause | ceiling stain, hot breaker, insulation voids | q-mo-02, q-ea-08, q-ai-02 |
| Dew point and condensation | crawl ducts, attic sheathing, bath fan duct | q-mo-09; crawl-adv and attic-interior lessons |
| Draft and buoyancy | 3-2-10 rule, vent connector slope, spillage | q-fp-11 (d1) before q-hv-02 and q-wh-08 |
| Temperature stratification and superheated water | TPR location, TPR discharge rules | q-wh-03 before q-wh-04 (d3) |
| Trap seal and venting | S-trap, trap seal depth, standpipe, vent height | q-pl-12 (d1) |
| Load path; dead load vs live load | truss cuts, notches, piers, ledgers | q-st-05, q-st-06; deck lesson |
| Layered wall: lapping shingle-fashion, rain screen | siding cracks, ledger flashing, kickout, tile underlayment | q-ef-05, q-dk-02, q-rt-04 |

Note for Yuki (UI): if the pop-quiz and Exam Mode pickers sort by `difficulty` ascending within a course, the prerequisite questions come before the scenarios that need them. I did not change any UI code.

## Facts verified this session, with sources

**NC Home Inspector Licensure Act (G.S. 143, Art. 9F) and Board rules (11 NCAC 08 .1000 to .1300), effective June 1, 2026.** Source: https://www.ncosfm.gov/home-inspector-licensure-act-and-board-rules-effective-june-1-2026/open (I extracted the PDF text and read it directly).
- Home inspection definition: a written evaluation of two or more listed components, based on observation or noninvasive testing; probing wood for deterioration is allowed (143-151.45). An unlicensed person may inspect without compensation (143-151.50).
- The Board is established in the Department of Insurance (143-151.46).
- Eligibility: high school diploma or equivalent plus a Board-approved program completed within 3 years of applying, or equivalent experience, or 6 months licensed as a general contractor, architect, or PE (143-151.51(a)).
- Insurance: $250,000 general liability, plus one of: net assets of $5,000 to $10,000, a bond of $5,000 to $10,000, or $250,000 E&O (143-151.51(b)). The license lapses if this lapses (143-151.55(d)).
- Exam retake: only once every 90 days (143-151.57(b)).
- Report: due by the date in the written agreement, otherwise within 3 business days. A summary page with the prescribed statement is required for prepurchase inspections of 3 or more systems. To cite code you must use the code in effect at construction and include copies of the provisions (143-151.58(a), (a1), (a2)).
- Records kept at least 3 years (143-151.58(d)). A violation is a Class 2 misdemeanor (143-151.59).
- Renewal: the license expires September 30 each year; late renewal is allowed up to 1 year; returning from inactive status requires at most 24 CE hours (143-151.55).
- Pre-licensing: at least 200 hours, made up of at least 120 academic and at least 80 field hours with at least 10 site visits (11 NCAC 08 .1021).
- CE: 12 hours per renewal (.1302), made up of the 4-hour Board update course taken within the year before expiration (.1309) and 8 elective hours in 2 or more courses (.1318). A licensee first licensed on or after June 1 is exempt for the first period.
- Standards of Practice (.1101 to .1115). These items were used in quizzes:
  - Definitions: readily accessible; readily openable access panel (4-ft stepladder); representative number (one per room inside, one per side outside); cross connection; functional flow; dead and live load; habitable space.
  - .1103: signed contract before the inspection; name, license number, and signature on page 1 or 2.
  - .1104: applies to 4 or fewer units.
  - .1105 exclusions: life expectancy, code compliance, pests, mold, R-values, moving items, operating shut-down systems, 240V receptacles.
  - .1106: enter crawlspaces and attics except when access is obstructed, entry could cause damage, or conditions are dangerous; report access points and methods.
  - .1107: report garage door operators that fail to reverse, fail the photo-eye test, or have no photo-eyes. Excluded: fences, safety glazing, remote transmitters, detached buildings.
  - .1108: not required to walk the roof; report the method used.
  - .1109: operate all fixtures and exterior faucets; describe materials, the water heater, and the main shutoff. Not required: backflow devices, valves other than flush valves and faucets, automatic safety controls, expansion tanks, shower pans.
  - .1110: GFCI zone is within 6 ft of plumbing fixtures, plus garage and exterior; operate GFCIs within 6 ft of the floor; report solid aluminum branch wiring; report smoke alarms and test them; report CO alarms in homes with fireplaces, fuel-fired appliances, or attached garages and test them; inspect panelboard interiors; AFCI testing not required.
  - .1111: open readily openable access panels; confirm a heat source in each habitable space; heat exchangers and flue interiors excluded.
  - .1113: hermetic window seals excluded.
  - .1114: move insulation where visible evidence indicates a problem.
  - .1115: dishwasher through a complete cycle; refrigerators and self-clean cycles excluded.
  - .1116 Code of Ethics: no payments to agents, no soliciting repairs, no value opinions.

**InterNACHI NC program page.** Source: https://www.nachi.org/pre-licensing/us/north-carolina
- The 120-hour online program covers the academic part, and 80 field hours come from a training partner. The exam is the NHIE administered for NC. Renewal is annual with 12 CE hours (4 update + 8 elective). CE cannot be earned between September 10 and October 1. This matches rule .1309, which blocks update courses from September 10 to 30.

**InterNACHI Home Inspection Standards of Practice.** Source: https://www.nachi.org/sop.htm
- 1.1 definition; 2.1 and 2.2 limitations and exclusions; 4 or fewer units.
- 3.1: describe the roof covering; walking the roof not required.
- 3.2: report improper baluster spacing; outbuildings and safety glass excluded.
- 3.3: report wood in contact with soil and cut, notched, or bored framing.
- 3.4: heat exchangers and flue interiors not required.
- 3.5: cooling not required below 65 F.
- 3.7: inspect for smoke and CO detectors but not required to test them.
- 3.8: operate the damper; flue interior not required.
- 3.9: describe insulation type and approximate depth.
- 3.10: report fogged windows; operating security bars and verifying auto-reverse not required.
- Glossary: readily accessible.

**InterNACHI "25 Standards Every Inspector Should Know" study guide (course for sop-25).** Source: https://education.nachi.org/coursemedia/course-54/documents/StudyGuide_25%20Standards.pdf (PDF text extracted and read).
- 100 A minimum service; specific circuit labels; AFCI areas; subpanel uses 4 wires with no bonding jumper; each neutral on its own terminal.
- Underlayment doubled from 2:12 to 4:12; ice barrier to 24 in inside the wall line.
- Glazing hazardous locations.
- Garage door 1-3/8 in solid or 20-minute rated; 1/2 in drywall, or 5/8 in Type X under habitable rooms; 26-gauge duct; no garage opening into a sleeping room.
- Egress sill no more than 44 in; window well 9 sq ft and 36 in.
- Grade 6 in of fall in 10 ft.
- Anchor bolts: 1/2 in, no more than 6 ft apart, within 12 in of ends, 7 in embedment.
- Notches D/3 long, D/4 at ends, D/6 in outer thirds; holes D/3 and at least 2 in from edges.
- Chimney 3-2-10; 2 in air space to combustibles; cricket over 30 in.
- Attic access 22 x 30 in.
- Dryer duct 25 ft, minus 5 ft per 90-degree and 2-1/2 ft per 45-degree bend; no screens.
- Standpipe 18 to 42 in.
- TPR: 150 psi and 210 F maximums; probe in the top 6 in of the tank; the 13 discharge rules (6 in from floor, no threads, no valves, not trapped, gravity flow).
- 50 psi gives a boiling point of about 298 F.
- FVIR exception to the 18 in rule.
- Vent pipe 6 in above the roof.
- P-trap only; 2 to 4 in seal; 24 in vertical and 30 in horizontal limits.
- Panel work space 36 x 30 in by 6-1/2 ft.
- Service clearances: 3 ft beside openings, 8 ft over roof (3 ft at 4:12), 10, 12, and 18 ft over ground.
- At least 6 nails per shingle in high wind.

**Widely taught reference figures, not re-fetched this session.** These come from the model IRC, NFPA, UL, and IFGC, are consistent with the guardrails in the brief, and are labelled "model IRC" or "course standard" in the copy:
- Guards at 36 in, triggered at 30 in, 4 in sphere, 6 in stair triangle; handrail 34 to 38 in at 4 or more risers; returned handrail ends.
- Smoke alarm locations; replacement at 10 years (NFPA 72); NFPA 211 Level II at sale.
- Photo-eyes no more than 6 in (UL 325); gas water heater ignition source 18 in.
- Three creosote stages; hearth extension 16/8 in and 20/12 in.
- Vent connector slope 1/4 in per ft; single-wall connector 6 in from combustibles, B-vent 1 in; sediment trap.
- Crawlspace venting 1/150 or 1/1500; attic venting 1/150 or 1/300; wood clearance to soil 18 in for joists and 12 in for girders; foundation 6 in (4 in with veneer) above grade; siding 6 in; 6-mil ground cover lapped 6 in.
- Tile minimum slope 2-1/2:12 with double underlayment to 4:12; asphalt minimum 2:12; no re-cover over 2 layers.
- Deck live load 40 psf; egress door 32 in x 78 in; PRV above 80 psi.
- Ladder at 4:1 and 3 ft above the landing (OSHA).
- No nailed ledgers and no ledgers on veneer (DCA 6).
- Enclosed closet fixtures; in-use covers; AC disconnect within sight; wood moisture concern above about 19 percent.

## Deliberately left out as unverified or misleading

- **NC amendments to IRC dimensions:** egress opening area, height, and width; stair riser and tread; any NC change to handrail or guard figures. I quote only the sill height. Egress copy says the NC Residential Code is the IRC with state amendments.
- **Passing score:** 11 NCAC 08 .1007 says 70 percent, and I verified that. I left it out of the quizzes because the NHIE reports scaled scores, and a "70 percent" fact could mislead the learner about the real exam.
- **Not quoted because they vary:** attic R-value targets for Raleigh's climate zone, AC temperature split, crack-width thresholds for referral, typical water heater lifespan in years, downspout extension distances, and NHIE question counts and timing.
- **Brand trivia:** none used. The study guide's Bradford White FVIR example was left out.
- **Recency flag:** the NC rule book I read is the June 1, 2026 compilation, and parts of .1101 were amended effective June 1, 2026 and October 1, 2024. If the learner's course materials are older, small wording differences are possible, for example the CO-alarm triggers and the 240V exclusion. The quizzes follow the current text.

## Notes for other agents

- **Henny (checkpoint content):** quiz explanations recommend these referrals: electrician for panel, GFCI, open ground, disposal wiring, and splices; HVAC for ducts, vent connectors, and condenser; plumber for traps, leaks, and toilet; CSIA chimney sweep for firebox, creosote, and crown; structural engineer for truss cuts, pier cracks, horizontal or bowing walls, and shims; pest control for mud tubes; contractor for ledger, hangers, posts, attic ladder, and pet door. Stated outcomes: water heater age is information, not a defect; the recirculating hood is acceptable; hip mortar is OK; efflorescence is evidence of moisture, not structural damage. If any checkpoint content disagrees, one of us should change, so the player gets one answer.
- **Yuki (UI):** `src/ui/content.js` imports `GLOSSARY` from `checkpoints.js`, which does not export it yet, and this breaks the build. Lesson fields used: `oneLine`, `paragraph`, `lookFor`, `keyNumbers[{k,v}]`, `wobble`, `mnemonic` (optional, present on 6 courses).

---

## Round 2 (after Voss red-team)

`npm run check`: 0 ERR, 220 quizzes, answer spread 55/55/55/55. Every component that has checkpoints still has a linked quiz.
`npx vite build`: passes; the only output is the chunk-size warning.
I changed only `src/data/quizzes.js` and `src/data/lessons.js`.

### Fixes
1. **B1, q-st-04:** the stem now describes a hairline crack on the taped joint, with no offset and a door that latches. The keyed answer is "typical, not a structural defect; you may note it for monitoring, and it becomes a finding if it widens, offsets, or doors bind". That matches the checkpoint's ok state (graded OK, Monitor also accepted). I removed the "Cosmetic, never report it" distractor because it was half defensible. The new distractors are clearly wrong: an engineer referral, foundation underpinning, and a roofer.
2. **q-ea-03:** the stem now matches the model: with the dead front off, two unused knockouts are open in the cabinet wall. The explanation keeps the course rule that all unused openings be closed, covering both cabinet knockouts and empty dead-front breaker slots. I replaced the old "overheat" distractor with "leave them open for ventilation", a real misconception.
3. **Premises that didn't match the model:**
   - q-hv-01 now describes a clogged filter caked with dust.
   - q-er-08 is reworded "In another house built in 1987..." and stays linked to `bath-gfci` for its grandfathering lesson.
   - q-mo-10 is reworded "In another house..." and stays linked to `att-sheathing`.
4. **Dryer duct length:** I kept the 25 Standards figure (25 ft, minus 5 ft per 90-degree and 2-1/2 ft per 45-degree bend) and added that the IRC since 2012 (M1502.4.5.1) starts at 35 ft with deductions from its fittings table. This is in q-ap-07's explanation and in a second appliances key number. I did not re-fetch the IRC text; the 35 ft figure comes from Voss's web check, so I attribute it to the IRC and leave NC's adoption unstated.
5. **Water heater plate now MFG 06/2001:**
   - q-wh-05 now says 06/2001; the age is still treated as information, not a defect.
   - q-wh-06's explanation adds that FVIR became mandatory for most 30 to 50 gal atmospheric gas tanks from July 2003, so a 2001 tank gets no FVIR exception to the 18 in rule.
   - The water-heater lesson paragraph says the same.
   - Neither file references 2009 or calls age a defect anywhere.
6. **M9, which exam NC uses.** This is verified from primary sources, and it **corrects my Round 1 report**, which repeated InterNACHI's claim that it is the NHIE.
   - NC applicants take the **NC Home Inspector Licensure Board's own exam**: 200 multiple-choice questions, 4 hours, closed book, 70% to pass. Candidates who pass are not told their score; candidates who fail get a Coaching Report. Retakes must be 90 days apart.
     Source: NC HILB Study Guide dated 3/17/2026, https://www.ncosfm.gov/home-inspector-study-guide/open (text extracted with PDFKit and read).
   - The Candidate Information Bulletin (rev. 7.0, 05/26/2026) names the exam "HILB 905 (2018 ed.)". It is remote proctored through Questionmark and Meazure Learning under OSFM QUEST. Test items are "the sole property of NC Code Officials Qualification Board". There are five blocks: Standards of Practice, Building, Electrical, Mechanical, and Plumbing.
     Source: https://www.ncosfm.gov/nc-home-inspector-licensure-board-osfm-quest-exam-candidate-information-bulletinrules-conduct/open
   - 11 NCAC 08 .1007 (June 2026 compilation) also says the exam covers the Board's rules and G.S. 143, Article 9F. The NHIE does not test those.
   - The InterNACHI page (https://www.nachi.org/pre-licensing/us/north-carolina) says "NHIE administered for North Carolina". The Board's documents contradict it and control.
   - **Added questions:** q-sop-27 (which exam, its format, and the 70% pass mark), q-sop-28 (the five content blocks), and q-sop-29 (DDID: Describe, Determine, Implication, Direction, the Board study guide's reporting framework, which mirrors .1103(b)(3)(D)).
   - **Lessons:** sop-25 gained an exam key number and a paragraph line saying SOP section numbers matter because Block 1 is the SOP. The egress paragraph no longer says "on the exam use the numbers taught". It now says the Board writes the exam, so learn the NC figure wherever NC amends a dimension, and that the game teaches labelled model figures.
   - **Headers:** both data files now state the edition (June 1, 2026 compilation, .1101 to .1117) and the exam identity. The `quizzes.js` comment "NHIE-style" now reads "exam-style".
   - The 70% pass mark, which Round 1 left out to avoid confusion with NHIE scaled scoring, is now quoted because it is verified for the exam NC actually uses.

### Still open for others
- **M9 citation mismatch (Henny):** my NC SOP subsection letters follow the June 1, 2026 compilation, and I re-checked each one against the extracted text:
  - automatic safety controls: .1109(d)(4)
  - valves other than flush valves and faucets: .1109(d)(5)
  - backflow devices: .1109(d)(3)
  - anti-siphon devices: .1109(d)(1)

  `checkpoints.js` cites the 2018 edition and should be re-cited to match.
- **Edition of the exam itself:** the CIB names the exam "HILB 905 (2018 ed.)". That probably means it is keyed to the 2018 NC code editions, but the bulletin does not say so. Ask the Board before assuming which code edition the Building block uses.
- **Held-out set (Voss's closing point):** there are 220 questions. If Yuki wants a held-out Exam Mode set, a natural split is the 35 general questions (`components: []`) plus any difficulty-3 questions, which never pop on components. That is a UI choice, so I did not mark anything.
