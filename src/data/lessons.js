// OWNER: Lindqvist (educator). Field Notes per course. See CONTEXT.md §9.
//
// Every lesson comes in three sizes: oneLine (the sentence), paragraph (the why,
// including the hidden prerequisite the course silently assumes), and lookFor
// (what to actually do in the field). keyNumbers holds only figures verified against
// a source listed in docs/reports/lindqvist-quizzes.md. Figures labelled "model IRC"
// or "course standard" are national teaching numbers; NC amends some code numbers,
// and NC inspectors do not cite code unless they follow G.S. 143-151.58(a2).
// NC SOP citations follow the Board's compilation effective June 1, 2026. The NC licensing
// exam is the Board's own HILB exam (study guide 3/17/2026, CIB rev. 7.0), not the NHIE.
// `wobble` is a do-something check: if the player cannot do it in the house, they
// have not learned it yet.

export const LESSONS = {
  'sop-25': {
    oneLine: 'The Standards of Practice decide what you must inspect, what you may skip, and how you say it; the 25 building standards tell you what correct looks like.',
    paragraph: "Every exam question about scope hides one prerequisite: vocabulary. 'Readily accessible', 'representative number', 'inspect' (a visual examination) and 'not technically exhaustive' are defined terms, and most scope answers fall out of them. In North Carolina the binding rules are 11 NCAC 08 .1101 to .1117 (amended effective June 1, 2026), which in places ask more than the InterNACHI SOP: NC requires you to operate the test function of smoke alarms and of CO alarms in homes with fireplaces, fuel-fired appliances, or attached garages, and to report garage door operators that do not reverse. Learn the definitions first, then the musts, then the exclusions. The 25 Standards course adds the physical benchmarks (TPR discharge, garage separation, egress sill height, service clearances) that let you recognize a defect when you see one. The NC licensing exam is the Board's own exam, not the NHIE, and its first block is the Standards of Practice, so the NC section numbers matter. The Board's study guide frames every finding as DDID: Describe, Determine, Implication, Direction.",
    lookFor: [
      'Smoke alarms: present where expected, test function operated, back-label date within 10 years',
      'CO alarm present (this house has a fireplace, a gas furnace and water heater, and an attached garage)',
      'Garage-to-house door: solid or fire-rated, no pet door, closes and latches',
      'Garage separation drywall intact, penetrations sealed, ducts in the garage of sheet steel',
      'Overhead door: auto-reverse on resistance and on photo-eye interruption, eyes no higher than 6 in',
      'Report states what was not inspected and why, and your name, license number, and signature on page 1 or 2',
    ],
    keyNumbers: [
      { k: 'SOP applies to', v: '4 or fewer dwelling units, plus attached garages or carports' },
      { k: 'Smoke alarm replacement', v: '10 years from the manufacture date' },
      { k: 'Garage-to-house door', v: 'Solid wood or steel at least 1-3/8 in thick, or 20-minute rated' },
      { k: 'Garage-side drywall', v: '1/2 in minimum; 5/8 in Type X under habitable rooms' },
      { k: 'Photo-eye sensors', v: 'No higher than 6 in above the floor' },
      { k: 'NC report deadline', v: 'Date in the written agreement, otherwise 3 business days' },
      { k: 'NC pre-licensing education', v: '200 hours: at least 120 academic + 80 field (10+ site visits)' },
      { k: 'NC renewal', v: 'Expires Sept 30 yearly; 12 CE hours (4-hr Board update course + 8 elective)' },
      { k: 'NC insurance', v: '$250,000 general liability + net assets, bond ($5k to $10k), or $250,000 E&O' },
      { k: 'NC records retention', v: 'At least 3 years' },
      { k: 'NC licensing exam (Board, not NHIE)', v: '200 questions, 4 hours, closed book, 70% to pass; retake after 90 days' },
    ],
    wobble: 'Stand in the hallway and name every alarm this house needs, why each one is required by the NC SOP, and what you physically do to each one during the inspection.',
    mnemonic: "Must, May, Need-not: every SOP sentence is one of the three. Sort it before you answer.",
  },

  'elec-adv': {
    oneLine: 'Inside the panel you are checking that every conductor has its own proper termination and that heat, water, and open holes have no way in.',
    paragraph: "The hidden prerequisite is the three-name problem: the grounded conductor (neutral, white or gray) carries current home; the equipment grounding conductor (bare or green) only carries fault current; bonding ties metal together so a fault trips the breaker. Once those are distinct, the defects explain themselves: a double tap is two conductors under a terminal listed for one, neutrals must each have their own terminal, and in a subpanel the neutrals float on an isolated bar with no bonding jumper. Most panel defects are connection defects, and a loose connection makes heat, which is why the thermal camera earns its place here. The camera shows temperature, not cause, so you report and refer.",
    lookFor: [
      'Breaker terminals: one conductor each unless the breaker is listed for two',
      'Neutral bar: one neutral per terminal; grounds may share only as the manufacturer allows',
      'Dead front: every unused opening closed',
      'White conductors on breakers re-identified as hot (tape or paint) at terminations',
      'Rust or water tracks inside the cabinet, and where the water came from (mast, weatherhead, drip loop)',
      'Circuit directory complete and specific, not "Ben\'s room"',
      'Thermal scan of breakers under load: any one breaker hotter than its neighbours',
      'Service drop clearances over the roof, the driveway, and beside windows',
    ],
    keyNumbers: [
      { k: 'Minimum service, single dwelling (course standard)', v: '100 A' },
      { k: 'Panel working space', v: '36 in deep, 30 in wide (or panel width), 6-1/2 ft high' },
      { k: 'Service conductors beside doors, decks, operable windows', v: '3 ft clearance' },
      { k: 'Service drop over roof', v: '8 ft (may drop to 3 ft at 4:12 or steeper)' },
      { k: 'Service drop over residential yard and driveway', v: '12 ft' },
      { k: 'Service drop over public street', v: '18 ft' },
    ],
    wobble: 'With the dead front off, point to one grounded conductor, one equipment grounding conductor, and the grounding electrode conductor, and say which one should never share a terminal.',
    mnemonic: 'White goes home, green goes to ground, and neither shares a seat with a stranger.',
  },

  'crawl-adv': {
    oneLine: 'A crawlspace is a moisture system first and a structure second: find where water enters, where it sits, and what wood it reaches.',
    paragraph: "The prerequisite is dew point. Humid outdoor air entering a cool crawlspace can reach saturation on cold ducts and framing, so a vented crawl can be wetter in summer than in winter. The ground cover limits soil moisture; vents, grading, and gutters control the rest. Under the NC SOP you must enter the crawlspace unless access is obstructed, entry could damage the property, or dangerous or adverse conditions are suspected, and you must report where the access is, whether all areas were reachable, and how you inspected. Pests are excluded from required reporting in NC, but mud tubes and damaged wood are observations you can and should pass to a licensed pest control operator.",
    lookFor: [
      'Access door and vents: location, condition, screened',
      'Ground cover: continuous, lapped, not torn or bunched',
      'Standing water or efflorescence lines showing past water levels',
      'Mud tubes on piers and foundation faces',
      'Wood moisture readings on joists and sill near plumbing and at the low side',
      'Ducts: supported off the soil, connected, insulated',
      'Drain joints and supply lines for drips and staining',
    ],
    keyNumbers: [
      { k: 'Ground cover (closed crawlspace, model IRC)', v: '6-mil polyethylene, seams lapped 6 in' },
      { k: 'Vent area, vented crawl (model IRC)', v: '1 sq ft per 150 sq ft of floor; 1/1500 with a vapor retarder' },
      { k: 'Untreated joists above exposed ground (model IRC)', v: '18 in; girders 12 in' },
      { k: 'Wood moisture of concern', v: 'Above about 19 percent' },
    ],
    wobble: 'In the crawlspace, take moisture readings on three joists: one near the drain line, one at the far low corner, one mid-span. Explain what the difference between them tells you.',
  },

  'appliances': {
    oneLine: 'Operate each built-in appliance through its basic function, look at how it is installed, and know which ones NC says you may leave alone.',
    paragraph: "The hidden prerequisite is the scope list. NC 11 NCAC 08 .1115 requires you to operate the basic functions of the installed dishwasher (through a complete cycle), ranges, cooktops, permanently installed ovens, trash compactors, disposals, range hoods, and installed microwaves. It does not require refrigerators, non built-in appliances, clocks, timers, thermostat calibration, or self-cleaning cycles, and you need not operate an appliance that is in use or shut down. The safety defects live in the installation, not the menu: a missing anti-tip bracket, a dishwasher drain with no high loop, plastic dryer duct, and a dryer run too long to clear lint.",
    lookFor: [
      'Range: anti-tip bracket engaged at the rear foot; burners and oven heat',
      'Dishwasher: complete cycle, no leaks, drain hose high loop or air gap',
      'Disposal: runs, cable secured with a clamp at the knockout',
      'Hood: operates; note whether it exhausts outdoors or recirculates',
      'Dryer duct: smooth-wall metal, short, terminates outdoors with a damper and no screen',
      'Washer hoses: no bulges, cracks, or kinks',
    ],
    keyNumbers: [
      { k: 'Dryer duct maximum (course standard)', v: '25 ft, minus 5 ft per 90 deg bend, 2-1/2 ft per 45 deg bend' },
      { k: 'Dryer duct maximum (IRC since 2012, M1502.4.5.1)', v: '35 ft, minus fittings per the IRC table' },
      { k: 'Dishwasher test (NC)', v: 'Through a complete cycle' },
    ],
    wobble: 'At the range, find out whether the anti-tip device is engaged without pulling the range out, and say why it matters more in a house with children.',
  },

  'ext-fund': {
    oneLine: 'Read the exterior as a water story: where rain lands, which way the ground carries it, and whether the walls keep it out.',
    paragraph: "The prerequisite is the layered wall. Siding is a rain screen, not the waterproofing; the weather-resistive barrier and flashings behind it do the real work, lapped shingle-fashion so water always lands on the layer below. Grading is the first layer of that system. The NC SOP asks you to inspect vegetation, grading, and drainage only for their effect on the building and to describe the wall cladding. Do not over-call driveways: shrinkage cracks are normal; displacement, trip edges, and slopes toward the house are not.",
    lookFor: [
      'Soil slope away from the foundation for the first 10 ft',
      'Clearance between soil or mulch and the bottom of the siding',
      'Cladding type described; cracked, loose, or missing panels',
      'Foundation exposed enough to see (and to see termite tubes)',
      'Driveway and walks: displacement, trip edges, water flow toward the garage',
    ],
    keyNumbers: [
      { k: 'Grade away from foundation (course standard)', v: '6 in of fall in the first 10 ft' },
      { k: 'Foundation above finished grade (model IRC)', v: '6 in; 4 in with masonry veneer' },
      { k: 'Wood siding to ground (model IRC)', v: 'Less than 6 in requires decay-resistant or treated wood' },
    ],
    wobble: 'Walk the east wall and show where water from a heavy storm would travel from the roof edge to the ground, and the first place it could get into the house.',
  },

  'ext-how': {
    oneLine: 'Work the exterior in a fixed loop, top to bottom, and report what the water, the hardware, and the stairs are doing, not what they look like.',
    paragraph: "The hidden prerequisite is the difference between inspecting and evaluating appearance. NC excludes cosmetic damage, storm windows, fences, safety glazing, remote transmitters, and detached buildings; it requires cladding, flashings, trim, entry doors, a representative number of windows (one per side outside), decks, steps and railings, eaves, driveways, and drainage as it affects the house. Two places InterNACHI and NC diverge are worth memorizing: InterNACHI asks you to report obviously fogged insulated glass, while NC does not require you to inspect hermetic seals at all. Either way, you may report what you see.",
    lookFor: [
      'Gutters: clean, sloped to outlets, attached',
      'Downspouts: discharge carried well away from the foundation',
      'Kickout flashing where a roof edge dies into a wall',
      'Windows: sill sealant, sills shedding water outward, fogged panes',
      'Hose bib: operates, no leak, vacuum breaker present or not',
      'Steps: handrail where there are 4 or more risers, graspable, 34 to 38 in high',
    ],
    keyNumbers: [
      { k: 'Handrail required', v: '4 or more risers' },
      { k: 'Handrail height', v: '34 to 38 in above the tread nosings' },
      { k: 'Representative number outside (NC)', v: 'One per side of the building' },
    ],
    wobble: 'At the front steps, count the risers, measure the rail (or note its absence), and write the one-sentence report line you would put in an NC report.',
  },

  'fireplace': {
    oneLine: 'A fireplace is a controlled fire inside a wooden house: check that the masonry contains it, the flue carries it away, and nothing combustible is close enough to catch.',
    paragraph: "The hidden prerequisite is draft. Hot flue gas is less dense than the air around it and rises; the chimney height rule (3-2-10) exists to keep the top of the flue out of the roof's wind turbulence so that draft is not reversed. Creosote is the price of incomplete combustion, and its three stages tell you how dangerous the flue has become: sooty and brushable, crunchy and flaky, then glazed and tar-like. Neither the NC nor the InterNACHI SOP requires you to inspect the interior of the flue, so you inspect what is readily visible and recommend a Level II inspection by a CSIA-certified sweep at sale.",
    lookFor: [
      'Firebox: cracked or missing brick, open mortar joints',
      'Hearth extension: size and continuity in front of and beside the opening',
      'Damper: opens, closes, and seals',
      'Smoke chamber with a flashlight: creosote stage',
      'Crown: cracks, overhang, water shedding',
      'Flue top: cap or spark arrestor present',
      'Roof-to-chimney flashing: step flashing with counterflashing; cricket on wide chimneys',
    ],
    keyNumbers: [
      { k: 'Chimney height (3-2-10)', v: '3 ft above the roof, 2 ft above anything within 10 ft' },
      { k: 'Hearth extension, opening under 6 sq ft', v: '16 in in front, 8 in each side' },
      { k: 'Hearth extension, opening 6 sq ft or more', v: '20 in in front, 12 in each side' },
      { k: 'Interior masonry chimney to combustibles', v: '2 in air space' },
      { k: 'Cricket required (course standard)', v: 'Chimney wider than 30 in parallel to the ridge' },
      { k: 'Creosote stages', v: '3: sooty, flaky, glazed' },
    ],
    wobble: 'With a flashlight in the smoke chamber, name the creosote stage you see and explain why stage 3 changes your referral language.',
    mnemonic: '3-2-10: three up, two over, ten around.',
  },

  'hvac': {
    oneLine: 'Run the system with its normal controls, follow the air from return to supply, and follow the combustion gases from burner to sky.',
    paragraph: "Two hidden prerequisites carry this course. First, the air loop: the blower pulls from the return and pushes through supply ducts, so a clogged filter, a blocked return, or a disconnected duct changes the whole system. Second, venting: combustion gases rise because they are hot, so a vent connector must slope up toward the chimney and keep its clearance to wood. The NC SOP requires you to open readily openable access panels and say whether you did, and to report whether each habitable space has an installed heat and cooling source. It does not require you to inspect heat exchangers, light pilots, or judge whether rooms get enough air.",
    lookFor: [
      'Filter present, correct size, reasonably clean',
      'Vent connector: rises toward the chimney, joints secure, clearance to combustibles',
      'Burner compartment (access panel opened): flame pattern, rust, scorching',
      'Condenser: level, clear around the coil, disconnect within sight',
      'Refrigerant lines: the larger suction line insulated',
      'Ducts in attic and crawl: connected at boots, supported, insulated',
      'Each habitable room has a supply source',
    ],
    keyNumbers: [
      { k: 'Vent connector slope', v: 'At least 1/4 in per ft upward to the chimney' },
      { k: 'Single-wall connector to combustibles', v: '6 in (B-vent typically 1 in)' },
      { k: 'Cooling not required to run (InterNACHI SOP)', v: 'Outdoor temperature below 65 F' },
    ],
    wobble: 'Stand at the furnace and trace with your finger the path air takes from the hallway return to a bedroom register, then the path the combustion gas takes to the outdoors.',
  },

  'water-heater': {
    oneLine: 'A tank water heater is a pressure vessel full of near-boiling water: confirm the relief valve can safely dump it, the gas is clean and controlled, and the exhaust leaves the house.',
    paragraph: "The prerequisite is physics: water in a closed tank under pressure can be heated well above 212 F without boiling, and if the tank fails that water flashes to steam all at once. The temperature and pressure relief (TPR) valve prevents that, which is why its probe sits in the top 6 in of the tank where the hottest water stratifies, and why its discharge pipe must be full size, unvalved, untrapped, by gravity, and ending within 6 in of the floor where people can see it. In NC you describe fuel source, capacity, and location; you are not required to operate the TPR or other automatic safety controls, or to report on expansion tanks or life expectancy, though you may. Read the data plate date for two reasons: age is useful information for the client (not a defect by itself), and a gas tank made before July 2003 predates FVIR, so the 18 in garage elevation rule applies to it without exception.",
    lookFor: [
      'Data plate: fuel, capacity, manufacture date',
      'TPR discharge: full size, no threads, no valve, no trap, ends within 6 in of floor',
      'Ignition source height in the garage (or FVIR design)',
      'Gas supply: shutoff valve and sediment trap (drip leg) before the control',
      'Draft hood and vent: in place, sloped up, no spillage scorching',
      'Tank base and fittings: rust, leaks',
    ],
    keyNumbers: [
      { k: 'TPR discharge termination', v: 'Within 6 in of the floor or waste receptor' },
      { k: 'TPR opening limits', v: '150 psi maximum, 210 F maximum' },
      { k: 'TPR sensing location', v: 'Top 6 in of the tank' },
      { k: 'Gas water heater ignition source in a garage', v: '18 in above the floor (unless FVIR and allowed)' },
      { k: 'Boiling point at 50 psi', v: 'About 298 F' },
    ],
    wobble: 'Find the water heater and name the two things that tell you whether the TPR discharge is safe, then the one thing you deliberately do not do to the valve.',
    mnemonic: 'Full size, falls by gravity, finishes at six.',
  },

  'moisture': {
    oneLine: 'Water damage is a timeline: your tools tell you whether it is happening now, and your eyes tell you where it came from.',
    paragraph: "The hidden prerequisite is that a thermal camera does not see water. It sees temperature, and wet materials often read cooler because water evaporates; so do drafts, missing insulation, and shadows. The moisture meter confirms. A stain that reads dry today proves only that it is dry today, so you report the stain, the reading, and a recommendation to ask about history and monitor. Above about 19 percent wood moisture is a conducive condition for decay. The NC SOP asks you to report signs of abnormal or harmful water penetration or condensation; it does not ask you to determine mold, so describe what you see and refer.",
    lookFor: [
      'Ceiling stains: meter reading, then the attic above',
      'Sink cabinet floor: swelling, stains, wet readings',
      'Tub and shower: caulk joint, grout, tile wall readings below fittings',
      'Toilet base: rocking, wet floor reading',
      'Crawl framing: readings near plumbing and the low corner',
      'Efflorescence and tide lines on masonry',
    ],
    keyNumbers: [
      { k: 'Wood moisture of concern', v: 'Above about 19 percent' },
      { k: 'Moisture meter unit', v: '%WME (wood moisture equivalent)' },
    ],
    wobble: 'Use the thermal camera on the living room ceiling, then the moisture meter, and explain in one sentence why the camera alone could not have told you the stain was active.',
  },

  'attic-interior': {
    oneLine: 'The attic is where the house breathes and where interior problems are born: check insulation, the air path from soffit to ridge, and every duct that should be going outdoors.',
    paragraph: "The prerequisite is the stack effect plus dew point: warm, moist house air rises and leaks into the attic, and if ventilation cannot carry it out it condenses on cold sheathing, especially near the eaves. That is why a bath fan duct dumping into the attic and blocked soffit vents show up as dark sheathing. NC requires you to inspect insulation and vapor retarders in unfinished spaces, attic and foundation ventilation, and kitchen, bath, and laundry venting, and to move insulation where visible evidence points to a problem. You are not required to determine R-values; InterNACHI asks you to describe insulation type and approximate average depth. Inside the rooms, operate a representative number of windows and doors and do not over-call cosmetic wear.",
    lookFor: [
      'Attic access and pull-down stairs: fasteners, hinges, size',
      'Insulation: type, approximate depth, voids (thermal), disturbed areas',
      'Soffit vent path: baffles keeping insulation off the eave vents',
      'Bath fan duct: connected and terminating outdoors',
      'Sheathing underside: stains (meter) and dark discoloration near eaves (flashlight)',
      'Rodent droppings, tunnels, nesting',
      'Interior: windows and doors operate, latch, and lock; cracks at door corners',
    ],
    keyNumbers: [
      { k: 'Attic access opening (course standard)', v: '22 in by 30 in' },
      { k: 'Attic vent area (model IRC)', v: '1 sq ft per 150 sq ft; 1/300 when conditions are met' },
      { k: 'Representative number inside (NC)', v: 'One per room' },
    ],
    wobble: 'In the attic, find the bathroom fan duct and follow it to its end. Say what you would expect to see on the nearby sheathing if it ended in the attic, and why.',
  },

  'deck': {
    oneLine: 'Most deck collapses start at the ledger, so inspect the connection to the house first, then follow the load down to the footings.',
    paragraph: "The prerequisite is load path: deck loads go from boards to joists, joists to the ledger (through hangers) or to beams, beams to posts, posts to footings, footings to soil. A failure at any link drops the deck. The ledger is the classic failure because it is attached with nails, attached through brick veneer, or rotted behind missing flashing where water sits against the rim joist. NC requires you to inspect decks, steps, and railings and to probe wood where deterioration is suspected. Guards and handrails are about falls, not strength alone: a 4 in sphere test and a height check tell you whether a child or adult is protected.",
    lookFor: [
      'Ledger: bolts or lag screws (not nails), not through brick veneer',
      'Flashing over the ledger, lapped behind the siding',
      'Joist hangers: correct hanger, every nail hole filled with proper nails',
      'Posts: base condition, soil contact, probe for decay',
      'Guard height and baluster spacing',
      'Stairs: handrail, graspable, ends returned',
    ],
    keyNumbers: [
      { k: 'Guard required', v: 'Walking surface more than 30 in above grade within 36 in horizontally' },
      { k: 'Guard height (residential)', v: '36 in minimum' },
      { k: 'Guard openings', v: 'A 4 in sphere must not pass' },
      { k: 'Residential deck live load (model IRC)', v: '40 psf' },
    ],
    wobble: 'Stand under the deck and point to each link in the load path from the deck boards to the soil, then name the one link you would check first and why.',
    mnemonic: 'Ledger, Lag, Lap: what holds it, what fastens it, what flashes it.',
  },

  'elec-res': {
    oneLine: 'Test what you can reach, report what the tester tells you, and know what the tester cannot tell you.',
    paragraph: "The hidden prerequisite is what a three-light tester actually measures: voltage between pairs of slots. It reads open ground, reversed polarity, and open neutral, but it can be fooled by a bootleg ground (neutral jumpered to the ground terminal) and it says nothing about AFCI protection. GFCIs protect people by tripping when current out does not equal current back; AFCIs protect the building by detecting arcing. NC requires you to inspect a representative number of fixtures and receptacles, to inspect all readily accessible 120V receptacles within 6 ft of interior plumbing fixtures and in garages and on exteriors, to operate GFCIs within 6 ft of the floor, and to report readily accessible single-strand aluminum branch wiring. You are not required to test AFCIs or inspect 240V receptacles.",
    lookFor: [
      'Tester on a representative receptacle per room, all near plumbing, garage, and exterior',
      'GFCI test and reset where required',
      'Exterior covers intact; in-use (bubble) covers in wet locations',
      'Three-prong receptacles that show open ground',
      'Closet lights: enclosed lamps, clear of shelves',
      'Attic and crawl wiring: splices in covered boxes, cables secured',
      'Disposal and appliance cables clamped at knockouts',
    ],
    keyNumbers: [
      { k: 'NC receptacle zone near plumbing', v: 'Within 6 ft of interior fixtures, not separated by a door' },
      { k: 'NC GFCI operation', v: 'Those within 6 ft of the floor or ground' },
      { k: 'AFCI-protected areas (course standard)', v: '15 and 20 A, 120 V circuits in living areas, bedrooms, closets, hallways' },
    ],
    wobble: 'Test the primary bedroom receptacle and the bathroom receptacle. For each, say what the lights mean and the one condition that could still be wrong even if the lights read correct.',
  },

  'roof': {
    oneLine: 'Inspect every part of the roof system you can safely reach, and write down exactly how you did it.',
    paragraph: "The hidden prerequisite is method. The NC SOP requires you to describe the roof covering and report the methods used to inspect it, and it does not require you to walk on the roof; InterNACHI likewise lets you inspect from the ground or the eaves when walking is unsafe. That makes your report's method line part of the finding: 'viewed from the eave with binoculars' limits what you can claim. A roof system is coverings, drainage, flashings, skylights, chimneys, penetrations, and signs of leaks or condensation underneath, so a roof inspection is not finished until you have seen the attic side.",
    lookFor: [
      'Covering type and general condition described',
      'Penetrations: vent boots and flashing',
      'Chimney flashing and crown',
      'Gutters, downspouts, splash blocks',
      'Ridge and soffit ventilation working as a pair',
      'Attic underside of the deck: stains, daylight, condensation',
    ],
    keyNumbers: [
      { k: 'Plumbing vent above the roof (course standard)', v: '6 in minimum' },
      { k: 'Ladder above the landing', v: '3 ft' },
      { k: 'Ladder angle', v: '1 ft out for every 4 ft up' },
    ],
    wobble: 'Before climbing the ladder, write the one-line method statement you will put in the report, then name one thing you will check from the attic that the roof surface cannot show you.',
  },

  'roof-asphalt': {
    oneLine: 'Asphalt shingles fail by losing granules, losing fasteners, and losing their seal at edges and valleys.',
    paragraph: "The prerequisite is that shingles shed water by lapping, not by sealing, so slope matters: the lower the slope, the slower the water and the more underlayment is needed. Granules protect the asphalt from sunlight; when they wash off in gutters and bald patches appear, the shingle is ageing out. Exposed or raised nails are leak points, because a correct nail sits under the next course. Drip edge carries water off the deck edge into the gutter, and valleys concentrate more water than any other part of the roof.",
    lookFor: [
      'Granule loss, bare spots, granules in gutters',
      'Exposed, raised, or unsealed nails',
      'Cracked, curled, or missing tabs',
      'Drip edge present at eaves and rakes',
      'Valley type and condition',
      'Number of layers visible at the edge',
    ],
    keyNumbers: [
      { k: 'Minimum slope for asphalt shingles', v: '2:12' },
      { k: 'Double underlayment (course standard)', v: 'From 2:12 up to 4:12' },
      { k: 'Ice barrier where ice dams occur', v: 'To 24 in inside the exterior wall line' },
      { k: 'High-wind fastening (course standard)', v: 'At least 6 nails per shingle' },
    ],
    wobble: 'At the eave, show where a correct nail would be on the shingle in front of you and explain why a nail you can see is a leak path.',
  },

  'foundation': {
    oneLine: 'Read cracks for direction, width, and displacement: the pattern tells you what force made them.',
    paragraph: "The prerequisite is knowing which force makes which crack. Settlement pulls a block wall down unevenly and opens stair-step cracks in the mortar joints; soil pushing sideways makes horizontal cracks and bowing, which is usually the more serious pattern; shrinkage makes small vertical cracks. Efflorescence is salt left behind by water that moved through masonry: evidence of moisture, not of failure. Piers carry the girder, so look at both the masonry and the bearing on top. You describe, explain implications, and refer; you are not required to calculate strength or adequacy.",
    lookFor: [
      'Foundation type described (block walls, piers, crawlspace)',
      'Crack pattern: stair-step, horizontal, vertical; width; displacement',
      'Bowing or leaning walls',
      'Pier masonry: cracks, missing units, lean',
      'Girder bearing on piers: full, solid, no crushed or stacked shims',
      'White deposits: efflorescence versus damage',
    ],
    keyNumbers: [
      { k: 'Anchor bolts (course standard)', v: '1/2 in, max 6 ft apart, within 12 in of plate ends, 7 in embedment' },
    ],
    wobble: 'In the crawlspace, find one crack in the block wall and classify it by direction, then say what force most likely caused it and who you would refer it to.',
  },

  'roof-tile': {
    oneLine: 'Tile is a durable but brittle armour over the real roof, the underlayment, so inspect it without walking on it and report every gap in the armour.',
    paragraph: "The prerequisite is that clay and concrete tile is a water-shedding layer, not a waterproof one: the underlayment beneath it keeps the deck dry, and broken or slipped tiles expose that underlayment to sun and water. Tiles crack under foot, so inspect from a ladder, the ground, or a vantage point, and say so. Tile is far heavier than asphalt, so the framing must be designed for it. Note the scope trap on this property: the garden studio is a detached building, which the NC SOP excludes unless the written contract adds it.",
    lookFor: [
      'Broken, cracked, or missing field tiles',
      'Slipped tiles near the eave',
      'Hip and ridge mortar or fastened ridge: gaps, loose pieces',
      'Flashings at walls and penetrations',
      'Exposed underlayment',
    ],
    keyNumbers: [
      { k: 'Minimum slope for clay or concrete tile (model IRC)', v: '2-1/2:12' },
      { k: 'Double underlayment (model IRC)', v: 'From 2-1/2:12 to 4:12' },
    ],
    wobble: 'From the ladder at the studio, count the broken and slipped tiles you can see and write the method statement that tells the client what you could not see.',
  },

  'egress': {
    oneLine: 'Every sleeping room needs a way out that works in the dark, in smoke, without a key, and every stair needs a rail that stops a fall.',
    paragraph: "The prerequisite is that egress is about a person, not a part: a window is an escape opening only if someone can reach the sill, open it fully, and fit through, and bars defeat all of it unless they release from inside without a key, tool, or special knowledge. Guards stop falls from heights over 30 in, handrails stop falls on stairs of 4 or more risers, and the 4 in sphere keeps children from slipping through. The NC Residential Code is the IRC with state amendments and the licensing exam is written by the NC Board, so where NC amends a dimension, learn the NC figure; this game teaches the widely used model figures and labels them. In an NC report, describe the condition and its implication rather than quoting code unless you meet G.S. 143-151.58(a2).",
    lookFor: [
      'Each bedroom window: sill height, opens fully, size reasonable for escape',
      'Security bars: inside release present and working',
      'Stairs: handrail height, graspable, continuous',
      'Guards: height and opening size',
      'Garage-to-house door: proper construction, no sleeping room opening into the garage',
      'Smoke alarms in and outside sleeping rooms',
    ],
    keyNumbers: [
      { k: 'Emergency escape sill height', v: '44 in maximum above the floor' },
      { k: 'Window well (course standard)', v: '9 sq ft, 36 in projection and width' },
      { k: 'Guard height / trigger', v: '36 in; required above 30 in' },
      { k: 'Guard openings', v: '4 in sphere; 6 in at the stair triangle' },
      { k: 'Handrail', v: '34 to 38 in; 4 or more risers' },
      { k: 'Egress door (model IRC)', v: '32 in clear width, 78 in high' },
    ],
    wobble: 'In Bedroom 2, pretend the hall is full of smoke: describe each step you would take to get out through the window, and the first step where this house would stop you.',
  },

  'plumbing': {
    oneLine: 'Supply water must arrive clean and under control, waste must leave through a trap that keeps sewer gas out, and nothing should leak along the way.',
    paragraph: "The hidden prerequisite is the trap and its vent. A trap holds a water seal that blocks sewer gas; the vent lets air into the drain so flowing water does not siphon that seal away. That is why S-traps are prohibited, why traps must sit close to the fixture, and why vents run through the roof. On the supply side, a cross connection is any link between potable water and contamination. NC requires you to operate all plumbing fixtures and exterior faucets, describe supply and drain materials and the main shutoff location, and report on functional flow and drainage. You are not required to operate valves other than flush valves and faucets, or to determine backflow devices.",
    lookFor: [
      'Main water shutoff location',
      'Supply and drain materials (PEX, copper, PVC, cast iron)',
      'Traps: P-traps, no S-traps, no corrugated flex drains',
      'Functional flow at the highest fixture with another running',
      'Toilets: secure to the floor, no leaks at the base',
      'Leaks and stains below fixtures and in the crawl',
      'Laundry standpipe height and washer hoses',
    ],
    keyNumbers: [
      { k: 'Trap seal', v: '2 to 4 in' },
      { k: 'Fixture outlet to trap weir (course standard)', v: '24 in vertical, 30 in horizontal max' },
      { k: 'Laundry standpipe above trap weir', v: '18 to 42 in' },
      { k: 'Static water pressure requiring a PRV', v: 'Over 80 psi' },
    ],
    wobble: 'Under the bathroom vanity, trace the drain from the sink to the wall and say whether the trap can lose its seal, and what in the trap shape tells you.',
  },

  'structural': {
    oneLine: 'Follow the load path from roof to soil and report anything that interrupts it: cuts, notches, missing bearing, or movement.',
    paragraph: "The prerequisite is load: dead load is the weight of the building itself, live load is people, furniture, and snow, and both travel down a continuous path to the soil. Engineered members such as trusses have no spare capacity to cut: any cut or notch needs an engineer's design. Solid joists tolerate small notches and holes only in specific places. Drywall cracks are messengers, not verdicts: a hairline crack at a door corner is common, but wide or displaced cracks with sticking doors and sloped floors point to movement. You report, explain, and refer to a structural engineer; you do not calculate.",
    lookFor: [
      'Trusses: cut, broken, or altered webs and chords',
      'Joist notches and holes near plumbing runs',
      'Girder and pier bearing',
      'Drywall cracks: location, width, direction, doors that rub',
      'Signs of past repairs: sistered joists, added posts',
    ],
    keyNumbers: [
      { k: 'Joist notch depth, outer thirds', v: 'D/6; none in the middle third' },
      { k: 'Joist notch at the ends', v: 'D/4' },
      { k: 'Bored hole diameter', v: 'D/3, at least 2 in from the edges' },
    ],
    wobble: 'In the attic, find the altered truss and explain to the client in two sentences why a cut that looks small is a structural engineer referral.',
  },
};
