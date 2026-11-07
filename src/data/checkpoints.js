// OWNER: Henny (inspector content). One entry per checkpoint id in manifest.js. See CONTEXT.md §8.
//
// Shape: { title, course, defect?: State, ok?: State, tip, nc? }
// State: { observe, severity, rec, recAlt?, why, report, reading? }
//
// House rules for this file:
//  - observe = what the player perceives, no verdict. Tool checkpoints: `observe` is what the
//    eyes see (ambiguous); `reading` is what the instrument shows.
//  - report = how a licensed NC inspector would write it: observe, describe, refer. No code-official
//    language ("violation"); numbers are given as "generally accepted" practice.
//  - nc = only facts verified against the NC Home Inspector Standards of Practice
//    (11 NCAC 08 .1101-.1116, rev. Oct 1 2018), G.S. 143-151.58, or NC OSFM interpretations.
//    Sources are listed in docs/reports/henny-content.md.
//  - No em-dashes in player-facing copy.

export const CHECKPOINT_CONTENT = {
  // ───────────────────────────── EXTERIOR ─────────────────────────────
  'grading-slope': {
    title: "Grading at the foundation",
    course: 'ext-fund',
    defect: {
      observe: "You lay a 4-ft level on the soil running out from the wall. The bubble shows the ground falling toward the house, and there is a dark, silty line on the block where water has puddled against it.",
      severity: 'repair', rec: 'contractor', recAlt: [],
      why: "Negative grade sends roof and surface water to the foundation, where it soaks the soil beside the footing, wets the crawlspace, and feeds wood decay and termites. The generally accepted target is a fall of about 6 in within the first 10 ft from the house, or a swale that does the same job. Confirm it with a level, then look for the matching wet wall inside the crawlspace.",
      report: "The inspector observed soil sloping toward the foundation (negative grade) along the east side of the home, with evidence of water pooling against the foundation. This condition can direct surface water toward the crawlspace. Recommend regrading so that soil slopes away from the home, by a qualified contractor.",
    },
    ok: {
      observe: "Your level shows the soil dropping steadily away from the wall, roughly 6 in over the first 10 ft. There are no silt lines or puddle marks on the block.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "This is what you want to see: positive grade carries water away before it can load the soil beside the footing. Describe it, note that you checked it, and move on. Do not invent a defect where the drainage is doing its job.",
      report: "Grading adjacent to the foundation was observed to slope away from the home at the time of the inspection. No deficiencies were noted.",
    },
    tip: "Read the grade from the crawlspace side too. A damp, stained foundation wall inside usually lines up with a low spot outside.",
    nc: "NC SOP .1107(a)(7) has you inspect vegetation, grading, and drainage only with respect to their effect on the condition of the building. Keep the finding tied to the house, not the lawn.",
  },

  'downspout-discharge': {
    title: "Downspout discharge",
    course: 'ext-how',
    defect: {
      observe: "The downspout ends at the base of the wall with no extension or splash block. The soil below it is washed out into a small hollow, and the siding just above grade is splashed with mud.",
      severity: 'repair', rec: 'contractor', recAlt: ['roofer'],
      why: "A downspout gathers all the rain from its section of roof. Dumping it at the foundation concentrates that water exactly where it does the most harm: saturated soil at the footing and a wet crawlspace. Common practice is to discharge at least 4 to 6 ft from the foundation onto ground that slopes away, or into a working drain line. The washed-out hollow is your evidence it has been happening for a while.",
      report: "The downspout at the east side discharges directly at the foundation, and soil erosion was observed. Recommend installing an extension or splash block to carry roof water at least 4 to 6 feet away from the home, by a qualified contractor.",
    },
    ok: {
      observe: "The downspout turns into a rigid extension that carries water about 5 ft out onto a splash block, on ground that slopes away from the house.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "Water is being delivered well away from the foundation onto ground that keeps it moving away. That is the whole job of a downspout. Extensions get kicked aside and mowed over, so mention that they need to stay in place.",
      report: "The downspout discharges onto an extension and splash block directing water away from the foundation. No deficiencies were noted.",
    },
    tip: "Follow every downspout to where its water actually lands. If it goes underground, state that the buried drain line and its outlet could not be verified.",
  },

  'gutter-debris': {
    title: "Clogged gutter",
    course: 'ext-how',
    defect: {
      observe: "The gutter trough is packed with leaves and dark sludge, and a seedling is growing in it. Below, the fascia board shows dark streaks where water has been spilling over the front edge.",
      severity: 'repair', rec: 'contractor', recAlt: ['roofer'],
      why: "A clogged gutter overflows at the front, or worse, behind itself, soaking the fascia, the soffit, and the soil at the foundation. Overflowing gutters are behind much of the fascia rot and foundation wetting you find elsewhere in a house. Cleaning is routine maintenance, but it belongs in the report because the consequences are not routine.",
      report: "Gutters at the front eave were observed to be clogged with debris and vegetation, with evidence of overflow staining at the fascia. Recommend cleaning the gutters and verifying proper drainage, and evaluating the fascia for moisture damage, by a qualified contractor.",
    },
    tip: "Look into gutters from a ladder at the eave. From the ground, a full gutter looks exactly like an empty one.",
  },

  'siding-soil-clearance': {
    title: "Siding in contact with soil",
    course: 'ext-fund',
    defect: {
      observe: "The bottom of the vinyl siding disappears into the mulch bed. You push a finger down past the bottom edge and find no gap and no visible foundation.",
      severity: 'repair', rec: 'contractor', recAlt: ['pest'],
      why: "Siding buried in soil or mulch holds moisture against the sheathing and framing behind it, and gives termites a hidden path into the wood. It also hides the foundation, so you cannot see mud tubes there. The commonly taught clearance between grade and wood-based framing, sheathing, or siding is about 6 in. The fix is usually pulling soil or mulch back, not replacing siding. Pest control is a reasonable second referral because this is a conducive condition for wood-destroying insects.",
      report: "The bottom edge of the vinyl siding on the east wall is in contact with soil and mulch, and the foundation was not visible in this area. This condition is conducive to moisture damage and wood-destroying insect activity. Recommend lowering the grade or removing mulch to restore clearance, by a qualified contractor.",
    },
    tip: "Wherever soil covers the foundation, write down that you could not see it. It protects you and tells the next inspector where to look.",
  },

  'siding-damage': {
    title: "Vinyl siding condition",
    course: 'ext-how',
    defect: {
      observe: "One vinyl panel has a fist-sized hole with cracked edges, and the panel above it has come unlocked from its neighbor and bows away from the wall.",
      severity: 'repair', rec: 'contractor', recAlt: [],
      why: "Vinyl siding is a rain screen, not a waterproof skin: water that gets behind it is supposed to drain down the housewrap and out. A hole or an unlocked panel lets wind-driven rain in faster than that system can handle, and invites insects and birds. Damaged panels can usually be replaced individually.",
      report: "Damaged vinyl siding was observed on the east wall, including a hole in one panel and an adjacent panel that has unlocked. Recommend repair or replacement of the damaged panels by a qualified siding contractor.",
    },
    ok: {
      observe: "The panels are locked together and lie flat. The ones in full sun are slightly faded, and there is a small, shallow dent in one panel at knee height.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "Fading and a small dent are cosmetic; they do not change the siding's ability to shed water. NC inspectors are not required to report cosmetic damage, and calling it a defect dilutes the items that matter. Describe the material, confirm the panels are intact and locked, and move on.",
      report: "Wall cladding is vinyl siding. Panels were observed to be intact with minor cosmetic fading and denting. No functional deficiencies were noted.",
    },
    tip: "Vinyl should be hung loose enough to slide a little side to side. Siding nailed tight buckles in summer heat, so waviness can be an installation clue, not damage.",
    nc: "NC SOP .1105(a)(10): inspectors are not required to report cosmetic damage. NC SOP .1107(b)(1) does require you to describe the wall cladding material.",
  },

  'window-igu-seal': {
    title: "Insulated glass seal",
    course: 'ext-how',
    defect: {
      observe: "Between the two panes of the lower sash you see a milky haze and dried water spots. It does not wipe off from either side of the glass.",
      severity: 'repair', rec: 'contractor', recAlt: [],
      why: "Fogging between panes means the edge seal of the insulated glass unit has failed; humid air got into the space and left mineral deposits behind. The window still keeps weather out, but it loses insulating value and the haze usually worsens. The repair is replacing the glass unit or sash, not the whole window. Some inspectors grade a faint haze as Monitor, which is reasonable.",
      report: "Fogging was observed between the panes of the living room window lower sash, indicating a failed insulated glass seal. Recommend replacement of the insulated glass unit by a qualified window contractor.",
    },
    ok: {
      observe: "Both panes are clear when you look at them from several angles. The only marks are ordinary dust on the outside of the glass.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "Clear glass with no haze or condensation between the panes means the seal is holding. Seal failures can come and go with temperature and humidity, so you looked at an angle in good light before calling it clear. That is the habit to keep.",
      report: "The living room window glazing was observed to be clear, with no visible evidence of seal failure at the time of the inspection.",
    },
    tip: "View the glass at a low angle against a dark background. Seal failure shows as a faint rainbow haze long before it is obvious straight on.",
    nc: "NC SOP .1113(c)(4) states inspectors are not required to inspect coatings on or hermetic seals between panes of glass. Reporting a failed seal you notice is optional (.1103(c)(1)), and if you do report it, report it clearly.",
  },

  'window-sill-caulk': {
    title: "Window sill sealant",
    course: 'ext-how',
    ok: {
      observe: "The sealant joint along the sill and trim is continuous and still bonded to both surfaces. Its surface shows fine weathering cracks, and the paint over it has dulled.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "Sealant ages, and surface crazing is normal. What matters is whether the joint is still bonded on both sides and continuous, with no gap you could slide a card into. This one is. Writing up every weathered caulk joint turns a report into noise; mention sealant as routine maintenance if your report style includes that, but it is not a defect.",
      report: "Exterior sealant at the living room window sill and trim was observed to be intact and adhered. Exterior sealants require periodic maintenance.",
    },
    tip: "Press a fingernail into the bead. Flexible and bonded is fine. Hard, shrunken, and pulled away on one side is the one to call.",
  },

  'hose-bib-backflow': {
    title: "Hose bib backflow protection",
    course: 'plumbing',
    defect: {
      observe: "The exterior faucet has a plain threaded hose outlet with no vacuum breaker fitting on it. A garden hose with a spray nozzle is attached.",
      severity: 'repair', rec: 'plumber', recAlt: [],
      why: "Without a vacuum breaker, a drop in supply pressure can siphon whatever the hose is lying in (a pool, a bucket of fertilizer, a puddle) back into the drinking water. That is back-siphonage, one form of cross connection. An inexpensive screw-on hose bib vacuum breaker, or a frost-free sillcock with one built in, prevents it.",
      report: "The exterior hose faucet was not equipped with a vacuum breaker (backflow prevention device). Recommend installing a hose bib vacuum breaker to protect the potable water supply from back-siphonage, by a licensed plumber.",
    },
    ok: {
      observe: "A small brass vacuum breaker is threaded onto the faucet outlet, its bleed cap visible. The faucet runs strongly and shuts off cleanly with no drip at the stem.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "A vacuum breaker on the outlet prevents back-siphonage from the hose. You operated the faucet, confirmed flow and shutoff, and saw the device. That is a complete check.",
      report: "The exterior hose faucet was operated and has a vacuum breaker installed. No deficiencies were noted.",
    },
    tip: "Run every exterior faucet, then check the wall behind it, or the crawlspace below it, for a leak in the supply pipe.",
    nc: "NC SOP .1109(c) requires operating all exterior faucets attached to the house. NC SOP .1109(d)(1)-(2) says you are not required to state the requirement for or effectiveness of anti-siphon devices, or the presence or absence of backflow devices, so reporting a missing vacuum breaker is permitted and common, but goes beyond the NC minimum.",
  },

  'service-drop-clearance': {
    title: "Service drop clearance",
    course: 'elec-res',
    defect: {
      observe: "The overhead service wires sag across the side yard. At their lowest point they hang about 8 ft above the walkway, low enough that someone carrying a ladder or pole could touch them.",
      severity: 'safety', rec: 'electrician', recAlt: [],
      why: "Service drop conductors are energized and, on the utility side, have no overcurrent protection at the house. Generally accepted minimum clearances are about 10 ft above grade where only pedestrians go, 12 ft over residential driveways, and 3 ft from windows, doors, and decks. The drop usually belongs to the utility, so the electrician typically coordinates the correction with the power company. Never touch or probe a drop; estimate its height against something you know.",
      report: "The overhead service drop conductors were observed to have low clearance above the side yard walkway, approximately 8 feet at the lowest point. This is a safety hazard. Recommend evaluation and correction by a licensed electrician in coordination with the electric utility.",
    },
    tip: "Estimate height against a known reference, such as the gutter line of a one-story house or a measured ladder, and never extend a tape or pole toward the wires.",
  },

  'service-drip-loop': {
    title: "Service drip loop",
    course: 'elec-res',
    ok: {
      observe: "Where the service conductors meet the weatherhead on top of the mast, they droop in a U-shaped loop below the head before rising into it.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "That droop is a drip loop, and it is correct. Rain running along the conductors drips off the bottom of the loop instead of following the wires into the weatherhead and down the mast into the meter and panel. A missing drip loop would be the defect.",
      report: "A drip loop is present at the service entrance weatherhead. No deficiencies were observed.",
    },
    tip: "The weatherhead should sit above the point where the drop attaches, so the loop always hangs lower than the head.",
  },

  'meter-base': {
    title: "Meter base",
    course: 'elec-res',
    ok: {
      observe: "The meter is seated in its base and the utility seal ring is intact. The base is fastened flat to the wall with sealant around the conduit entry. The finish is faded but not rusted through.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "The meter and its seal belong to the utility. You inspect the base for secure mounting, physical damage, rust-through, and gaps that could let water into the conduit or panel. Faded paint is cosmetic. Never pull a meter or break a seal.",
      report: "The electric meter base was observed to be securely mounted with no visible damage. The electrical service is overhead.",
    },
    tip: "This is the moment to note the service type and the meter location for your report description.",
    nc: "NC SOP .1110(b)(3) requires describing the electrical service type as overhead or underground.",
  },

  'condenser-level': {
    title: "A/C condenser level",
    course: 'hvac',
    defect: {
      observe: "The condenser's concrete pad has settled at one corner. The cabinet leans visibly, your torpedo level on the top panel shows the bubble well off center, and the refrigerant lines are pulled taut at the wall.",
      severity: 'repair', rec: 'hvac', recAlt: [],
      why: "Condensers are designed to sit level so compressor oil returns properly and the coil and line set are not under strain. Manufacturers publish their own tolerances; a lean you can see from across the yard is beyond any of them. Re-leveling the pad is usually simple, and the HVAC technician should check the line set for stress at the same visit.",
      report: "The A/C condenser pad has settled and the unit is out of level, with tension observed on the refrigerant lines. Recommend re-leveling and evaluation of the line set by a licensed HVAC contractor.",
    },
    ok: {
      observe: "The condenser sits on a level pad. There is open clearance around the coil on all sides and nothing stacked on top.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "Level, with clear airflow. Clearance matters as much as level: a condenser boxed in by shrubs or fencing recirculates its own hot discharge air and works harder. Nothing to report here.",
      report: "The A/C condenser was observed to be level, with adequate clearance for airflow.",
    },
    tip: "Put your level on the cabinet top panel, not on the pad. Pads crack and tilt; the cabinet is what matters.",
  },

  'condenser-line-insulation': {
    title: "Refrigerant line insulation",
    course: 'hvac',
    defect: {
      observe: "The larger of the two copper refrigerant lines is bare for about 3 ft between the wall and the unit. What foam remains is cracked and crumbling, and the bare copper is beaded with condensation.",
      severity: 'repair', rec: 'hvac', recAlt: [],
      why: "The larger line is the suction line, carrying cold refrigerant vapor back to the compressor. Bare, it picks up heat (cutting capacity and efficiency) and sweats, dripping water at the wall and foundation. The small liquid line is normally left uninsulated, so do not write that one up. Sunlight destroys foam, which is why it fails first outdoors.",
      report: "Insulation on the refrigerant suction line at the A/C condenser is missing and deteriorated. Recommend replacement with UV-resistant insulation by a licensed HVAC contractor.",
    },
    tip: "With the system running, the insulated suction line feels cool and the small liquid line feels warm. That tells you which is which on any system.",
  },

  'condenser-disconnect': {
    title: "Condenser service disconnect",
    course: 'hvac',
    ok: {
      observe: "A weatherproof pull-out disconnect box is mounted on the wall a few feet from the condenser, in plain sight of it. The cover closes and latches.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "This is the arrangement you want: a disconnect within sight of the equipment, so a technician can shut off power and see that no one turns it back on. A non-fused pull-out disconnect is normal; it is a switch, not overcurrent protection. Overcurrent protection is the breaker back at the panel, sized to the condenser's data plate.",
      report: "A service disconnect is present within sight of the A/C condenser. No deficiencies were observed.",
    },
    tip: "Do not pull the disconnect while the unit is running. Turn the system off at the thermostat first.",
  },

  'ext-gfci': {
    title: "Exterior receptacle GFCI",
    course: 'elec-res',
    defect: {
      observe: "A duplex receptacle in a weatherproof box beside the patio, mounted a little above grade. Nothing about its face tells you whether it is protected.",
      reading: "3-light tester: the 'CORRECT' wiring pattern. Tester's GFCI button pressed: the receptacle does not trip and stays energized. No GFCI device upstream was found to reset at the garage, bathrooms, or panel.",
      severity: 'safety', rec: 'electrician', recAlt: [],
      why: "Outdoors, a person is often grounded through damp soil or concrete. A GFCI compares the current going out on the hot with the current returning on the neutral and trips at a few milliamps of imbalance (about 4 to 6 mA), fast enough to prevent most electrocutions. Before calling 'no GFCI', look for protection upstream: a GFCI receptacle elsewhere on the circuit or a GFCI breaker in the panel.",
      report: "The exterior receptacle at the patio did not trip when tested, and no upstream GFCI protection was found. This is a shock hazard. Recommend installation of GFCI protection by a licensed electrician.",
    },
    ok: {
      observe: "A duplex receptacle in a weatherproof box beside the patio, mounted a little above grade. Nothing about its face tells you whether it is protected.",
      reading: "3-light tester: the 'CORRECT' wiring pattern. Tester's GFCI button pressed: power cuts off at the receptacle. The protecting GFCI resets normally.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "Correct wiring and working ground-fault protection: the receptacle is functioning as intended. Remember to reset whatever you trip, and note where the protecting device is so the owner can find it.",
      report: "The exterior receptacle tested with correct wiring and is GFCI protected. No deficiencies were observed.",
    },
    tip: "A plug-in tester needs an equipment ground to create its test fault. On a two-wire circuit, use the GFCI's own test button instead.",
    nc: "NC SOP .1110(a)(6)-(7) requires testing the polarity and grounding of all receptacles on the exterior of inspected structures, and the operation of ground fault circuit interrupters.",
  },

  'ext-receptacle-cover': {
    title: "Exterior receptacle weather cover",
    course: 'elec-res',
    defect: {
      observe: "The receptacle's flip-up weather lid is cracked and its hinge is broken, so the lid hangs open and the face of the receptacle is exposed to rain.",
      severity: 'repair', rec: 'electrician', recAlt: [],
      why: "Outdoor receptacles need a cover that keeps rain off the contacts. Where a cord may stay plugged in, the accepted practice is an 'in-use' (bubble) cover that stays weatherproof with the plug inserted. Water in a receptacle box corrodes the contacts and can cause nuisance tripping or shock. It is a cheap part, but it is wet-location protection, not decoration.",
      report: "The exterior receptacle weather cover is damaged and does not close. Recommend replacement with an in-use weatherproof cover by a licensed electrician.",
    },
    tip: "Look behind the lid for a gasket, and for wasp or mud-dauber nests before you put your fingers there.",
  },

  'steps-handrail': {
    title: "Front steps handrail",
    course: 'egress',
    defect: {
      observe: "The front entry steps have four risers from the walk up to the stoop. There is no handrail on either side.",
      severity: 'safety', rec: 'contractor', recAlt: [],
      why: "Stair falls happen to people who are carrying groceries, distracted, or walking in the dark or rain. The widely taught threshold is a handrail on at least one side of any stair with four or more risers, mounted roughly 34 to 38 in above the tread nosings and shaped so a hand can wrap around it. Entry steps are among the most used stairs in a house and are often wet.",
      report: "No handrail is installed at the front entry steps (four risers). This is a fall hazard. Recommend installing a graspable handrail by a qualified contractor.",
    },
    tip: "Count risers, not treads. Four risers is the trigger.",
  },

  'steps-riser-height': {
    title: "Front step riser heights",
    course: 'egress',
    ok: {
      observe: "You measure each riser. All are about 7-1/2 in, and the tallest and shortest differ by less than 3/8 in. The treads are level and solid underfoot.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "Uniformity is the safety feature. Your foot learns a stair's rhythm on the first step, and a riser that differs from the others by more than about 3/8 in is what trips people. These are uniform and within the generally accepted maximum riser height, so there is nothing to report.",
      report: "Front step risers were observed to be reasonably uniform in height. No deficiencies were noted.",
    },
    tip: "Measure the top and bottom risers carefully. Those are the ones that change when a walk is repoured or a stoop settles.",
  },

  'driveway-cracks': {
    title: "Driveway cracking",
    course: 'ext-fund',
    ok: {
      observe: "The concrete has a few hairline cracks running off the control joints, too tight to slip a coin into. Neither side of any crack is higher than the other.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "Concrete shrinks as it cures, and control joints are cut so it cracks where it is told to. Hairline cracks with no vertical displacement and no trip edge are normal. A driveway becomes reportable when cracks widen, heave, settle toward the house or garage, or leave a lip you can catch a toe on.",
      report: "The concrete driveway exhibits typical minor shrinkage cracking. No significant displacement or trip hazards were observed.",
    },
    tip: "Look at how the driveway meets the garage slab. Settlement toward the house sends water to the garage door.",
  },

  'crawl-door': {
    title: "Crawlspace access",
    course: 'crawl-adv',
    ok: {
      observe: "The access door is a solid panel that latches tight in a framed opening in the block wall. The foundation vent beside it has an intact screen and no gaps.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "A crawlspace door is there to keep out animals and weather and to give you a way in. This one does both. Note the access location and how you inspected the crawlspace in your report.",
      report: "Crawlspace access is through an exterior door on the north foundation wall. The door and adjacent foundation vent were observed to be in serviceable condition.",
    },
    tip: "Before you go in, look and smell. Standing water, sewage odor, or exposed wiring at the entry are reasons to pause and say why.",
    nc: "NC SOP .1106(c)(2)-(3): enter crawlspaces unless access is obstructed, entry could damage the property, or dangerous conditions are suspected, and report the method used to inspect the crawlspace.",
  },

  // ───────────────────────────── ROOF ─────────────────────────────
  'shingle-granule-loss': {
    title: "Shingle granule loss",
    course: 'roof-asphalt',
    defect: {
      observe: "Across the south slope the shingle surface is patchy. Many tabs have lost their granules and show the black asphalt underneath, and the gutters below hold a layer of gritty granules.",
      severity: 'major', rec: 'roofer', recAlt: [],
      why: "Granules shield the asphalt from ultraviolet light. Once they wash away, the asphalt dries out and cracks, and the shingle stops shedding water reliably. Some shedding is normal on a new roof, but widespread bare spots on an aged roof mean it is near the end of its service life. Hail bruising and manufacturing defects can also cause granule loss, which is one more reason a roofer should evaluate.",
      report: "Widespread granule loss with exposed asphalt was observed on the south roof slope, indicating the roof covering is near the end of its service life. Recommend evaluation by a qualified roofing contractor for repair or replacement options.",
    },
    tip: "Look at the bottom of the downspouts. Granules collect there and tell you how fast a roof is wearing.",
    nc: "NC SOP .1108(b) requires describing the roof covering material and reporting the method used to inspect the roofing (walked, from a ladder, from the ground with binoculars). .1108(c)(1): you are not required to walk the roof.",
  },

  'shingle-exposed-nails': {
    title: "Shingle fasteners",
    course: 'roof-asphalt',
    defect: {
      observe: "Along several courses you see shiny nail heads exposed in the shingle field. A few have backed out and are lifting the shingle above them.",
      severity: 'repair', rec: 'roofer', recAlt: [],
      why: "Every nail in a shingle field should be covered by the course above. An exposed nail is a direct path for water into the deck, and a backed-out nail punches up through the shingle above and breaks its seal strip. Exposed nails usually mean high nailing or a shingle replaced without proper fastening.",
      report: "Exposed and raised fasteners were observed in the shingle field. Recommend repair by a qualified roofing contractor to prevent water intrusion.",
    },
    ok: {
      observe: "Nail heads in the field are all hidden under the overlying courses. On the very last ridge cap piece you see two nail heads covered with dabs of sealant.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "Concealed fasteners are correct. The two sealed nails on the final ridge cap are standard practice, because that last piece has nothing above it to cover its nails. Know that exception so you do not write it up.",
      report: "Shingle fasteners were observed to be concealed by overlying courses. No deficiencies were noted.",
    },
    tip: "Walk or view the roof with the sun low and behind you. Raised nails and lifted tabs cast shadows.",
  },

  'chimney-crown': {
    title: "Chimney crown",
    course: 'fireplace',
    defect: {
      observe: "The mortar crown on top of the chimney is cracked into several pieces, with a chunk missing at one corner. The cracks run up to the flue tile, and the brick just below is darker where water has been soaking in.",
      severity: 'repair', rec: 'chimney', recAlt: ['contractor'],
      why: "The crown is the chimney's roof. Cracks let water into the masonry, where freeze-thaw cycles spall the brick and rust the damper and firebox parts below. A proper crown slopes and overhangs the brick to shed water away from the flue. Chimney sweeps and masonry contractors both do this repair, so either referral is reasonable.",
      report: "The chimney crown was observed to be cracked and deteriorated, allowing water entry into the masonry. Recommend repair by a CSIA-certified chimney professional or a qualified masonry contractor.",
    },
    tip: "Dark, wet-looking brick near the top of a chimney, seen from the yard with binoculars, often points to a failed crown before you ever climb up.",
  },

  'chimney-cap': {
    title: "Chimney flue cap",
    course: 'fireplace',
    defect: {
      observe: "The clay flue tile sticks up out of the crown with nothing over it. You can see down into the flue, and there are twigs scattered on the crown.",
      severity: 'repair', rec: 'chimney', recAlt: ['contractor'],
      why: "An uncapped flue takes rain straight down to the damper and smoke chamber, and invites birds and animals to nest. A cap with mesh also works as a spark arrestor, keeping embers off the roof. The twigs hint at nesting, which can block the flue and push smoke back into the house.",
      report: "No rain cap or spark arrestor is installed on the chimney flue, and debris was observed on the crown. Recommend installation of a chimney cap and evaluation of the flue for obstructions by a CSIA-certified chimney professional.",
    },
    ok: {
      observe: "A metal cap with a mesh screen sits over the flue tile, secured with no gaps. The screen is clean.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "A secure cap with intact mesh keeps rain, animals, and sparks where they belong. Nothing to report.",
      report: "A chimney cap with spark arrestor screen is installed and appeared serviceable.",
    },
    tip: "If the cap screen looks black and furry, it is choked with creosote and can restrict the draft. Recommend cleaning it with the flue.",
  },

  'chimney-flashing': {
    title: "Chimney flashing",
    course: 'roof',
    defect: {
      observe: "Where the chimney meets the shingles, the flashing is one piece of bent metal held on with a thick bead of black roof cement. The cement has cracked and pulled away from the brick, leaving a dark gap.",
      severity: 'repair', rec: 'roofer', recAlt: ['chimney', 'contractor'],
      why: "Proper chimney flashing has two layers: step flashing woven into the shingle courses, and counterflashing set into the mortar joints and lapped over it. Roof cement is a temporary patch; it dries, shrinks, and lets water run behind the flashing, often showing up later as a ceiling stain. Roofers and chimney contractors both repair flashing.",
      report: "The chimney flashing relies on roof cement, which has separated from the masonry. Recommend repair by a qualified roofing contractor or chimney professional to prevent water intrusion. Recommend checking the interior below for evidence of leaks.",
    },
    ok: {
      observe: "Step flashing is tucked under each shingle course along the sides of the chimney, and counterflashing is set into the mortar joints and lapped down over it. No surface cement is needed anywhere.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "Step plus counterflashing is the textbook detail: each piece sheds water onto the one below. Wide chimneys also call for a cricket on the uphill side to split the water flow around them.",
      report: "Chimney flashing consists of step and counterflashing and appeared serviceable at the time of the inspection.",
    },
    tip: "Then check the ceiling and attic near the chimney. Flashing faults usually announce themselves inside first.",
  },

  'vent-boot': {
    title: "Plumbing vent boot",
    course: 'roof',
    defect: {
      observe: "The rubber collar around the plumbing vent pipe is split on the uphill side. When you press near it, the crack opens and shows a gap around the pipe.",
      severity: 'repair', rec: 'roofer', recAlt: [],
      why: "Neoprene vent boots are one of the most common roof leak sources, because the rubber breaks down in sunlight, often well before the shingles around it. Water runs down the pipe into the attic and usually shows as a stain on the decking or ceiling near the vent.",
      report: "The plumbing vent pipe boot is cracked. Recommend replacement of the pipe flashing boot by a qualified roofing contractor.",
    },
    ok: {
      observe: "The pipe boot's rubber collar is supple and snug to the pipe all the way around. Its metal base slides under the shingles above and lies over the shingles below.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "A tight collar plus correct lapping (under the courses above, over the courses below) means water flows over the flashing, never behind it.",
      report: "The plumbing vent flashing appeared serviceable at the time of the inspection.",
    },
    tip: "Look for the matching stain on the attic side of every roof penetration you saw from outside.",
  },

  'drip-edge': {
    title: "Eave drip edge",
    course: 'roof-asphalt',
    defect: {
      observe: "At the eave, the shingles hang over a bare wood edge with no metal. The edge of the roof decking and the top of the fascia are dark and soft where water has wicked in.",
      severity: 'repair', rec: 'roofer', recAlt: [],
      why: "Drip edge carries water off the shingles past the fascia and into the gutter, and protects the edge of the decking. Without it, surface tension curls water back under the shingle edge and rots the deck edge and fascia. Shingle manufacturers and current practice call for drip edge at eaves and rakes, but many older roofs lack it, so report the condition and the damage.",
      report: "No drip edge flashing was observed at the eave, and deterioration of the roof decking edge and fascia was noted. Recommend repair by a qualified roofing contractor.",
    },
    ok: {
      observe: "A painted metal drip edge runs the full length of the eave. The shingles overhang it slightly, and water is directed into the gutter.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "The drip edge is present and the shingle overhang is right, so water leaves the roof clear of the wood.",
      report: "Drip edge flashing is installed at the eaves. No deficiencies were noted.",
    },
    tip: "Know the lap rule: at the eave, drip edge goes under the underlayment; at the rake, it goes over.",
  },

  'valley-closed-cut': {
    title: "Closed-cut valley",
    course: 'roof-asphalt',
    ok: {
      observe: "In the valley, shingles from one slope run straight across the valley line. Shingles from the other slope are cut in a clean straight line a couple of inches short of the valley center, with their upper corners clipped.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "This is a closed-cut valley, a standard method approved by most shingle manufacturers, along with woven and open metal valleys. The cut edge sits about 2 in back from the centerline so water runs on lapped shingles, and the clipped corners keep water from running sideways under the cut course. No visible metal in a valley is not a defect.",
      report: "The roof valley is a closed-cut installation and appeared serviceable at the time of the inspection.",
    },
    tip: "In a closed-cut valley, look for nail heads near the valley center or lifted shingles along the cut line. Those are the real defects.",
  },

  'ridge-vent': {
    title: "Ridge vent",
    course: 'roof',
    ok: {
      observe: "A shingle-over ridge vent runs along the ridge, topped with ridge cap shingles. The fasteners are hidden and the vent lies flat and continuous.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "Ridge vents exhaust warm, moist attic air at the highest point. They work as a system with intake vents low at the soffits. On the roof you check that it is intact and fastened; in the attic you confirm the slot below it was actually cut, by seeing daylight along the ridge.",
      report: "A ridge vent is installed and appeared serviceable. Attic ventilation is provided by ridge and soffit vents.",
    },
    tip: "A ridge vent without soffit intake can pull conditioned air out of the house. Always evaluate exhaust and intake together.",
  },

  // ───────────────────────────── DECK ─────────────────────────────
  'ledger-fasteners': {
    title: "Deck ledger attachment",
    course: 'deck',
    defect: {
      observe: "The ledger board is attached to the house with a row of nails. You find no lag screws or through-bolts anywhere along its length, and a few rusted nail heads have pulled slightly away from the wood.",
      severity: 'safety', rec: 'contractor', recAlt: ['structural'],
      why: "The ledger carries roughly half the deck's load into the house. Nails alone are not considered an adequate ledger connection because they can withdraw under load, especially as they corrode in treated lumber. Ledger separation is widely recognized as a leading cause of deck collapse. The accepted connection is staggered lag screws or through-bolts into the house band joist, sized and spaced for the joist span. A deck contractor can retrofit them; a structural engineer is reasonable for unusual framing or a large deck.",
      report: "The deck ledger is attached to the home with nails only; no bolts or lag screws were observed. This is a safety concern due to the risk of ledger separation. Recommend evaluation and repair by a qualified deck contractor or structural engineer before regular use of the deck.",
    },
    tip: "Look for the other end of the bolts. Nuts and washers on the inside of the band joist, seen from the crawlspace, confirm through-bolts.",
  },

  'ledger-flashing': {
    title: "Deck ledger flashing",
    course: 'deck',
    defect: {
      observe: "There is no flashing above the ledger. The siding comes straight down to the ledger board, and the house band joist behind it shows dark staining and a soft spot when you probe it with an awl.",
      severity: 'repair', rec: 'contractor', recAlt: [],
      why: "Water running down the wall gets trapped between the ledger and the band joist, where it rots both pieces and corrodes the fasteners holding the deck to the house. Flashing, commonly a metal Z-flashing or membrane, should lap under the housewrap above and over the ledger. The soft spot means concealed damage is likely, which a contractor needs to open up and assess.",
      report: "No flashing was observed above the deck ledger, and moisture staining and soft wood were found at the band joist. Recommend repair by a qualified contractor, including evaluation of concealed framing.",
    },
    ok: {
      observe: "A metal Z-flashing runs along the top of the ledger, tucked up under the siding and lapped down over the ledger face. The wood below is dry and firm when probed.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "Flashing that laps correctly under the wall layers above and over the ledger sends water away from the joint. Probing confirmed the wood behind it is sound.",
      report: "Flashing is installed above the deck ledger. The adjacent framing probed solid. No deficiencies were noted.",
    },
    tip: "Probe the band joist below the ledger from the crawlspace too. That is where hidden rot shows first.",
    nc: "NC SOP .1106(c)(1) and .1107(b)(5) require probing structural and exterior wood components where deterioration is suspected.",
  },

  'joist-hangers': {
    title: "Joist-to-ledger connections",
    course: 'deck',
    defect: {
      observe: "Each deck joist butts against the ledger and is held only by two or three nails driven in at an angle. There are no metal hangers, and one joist end has split around a nail.",
      severity: 'major', rec: 'contractor', recAlt: ['structural'],
      why: "Toe-nails rely on a few nails loaded sideways in end grain; they split the joist end and pull loose. Joist hangers, installed with every manufacturer-specified nail, carry the load in bearing. Combined with a weak ledger attachment this adds up to a real collapse risk, so grading it a Safety Hazard is also defensible.",
      report: "Deck joists are toe-nailed to the ledger without joist hangers, and splitting was observed at one joist end. Recommend installation of appropriate joist hangers and evaluation of the deck framing by a qualified deck contractor.",
    },
    ok: {
      observe: "Each joist sits in a galvanized hanger with a nail in every hole. The hangers show only light surface rust.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "Fully nailed, corrosion-resistant hangers are the accepted connection. You checked the two things that usually go wrong: nails in every hole, and hangers that are not rusting away in contact with treated lumber.",
      report: "Deck joists are supported by metal joist hangers at the ledger. No deficiencies were observed.",
    },
    tip: "Count the holes. A ten-hole hanger with two nails in it, or with drywall screws, is not doing a hanger's job.",
  },

  'baluster-spacing': {
    title: "Guard baluster spacing",
    course: 'deck',
    defect: {
      observe: "You pass a 4-in test sphere between the balusters with room to spare. The gaps measure about 5 in.",
      severity: 'safety', rec: 'contractor', recAlt: [],
      why: "The 4-in sphere rule exists because a small child's head and body can pass through a wider gap, and children are the ones who fall. The generally accepted rule is that guard openings should not allow a 4-in sphere to pass. Adding balusters is a cheap fix for a serious hazard.",
      report: "The deck guardrail baluster spacing allows passage of a 4-inch sphere. This is a fall hazard, particularly for children. Recommend correction by a qualified contractor.",
    },
    tip: "Carry a 4-in ball or a 4-in length of pipe. It turns an argument into a fact.",
  },

  'guard-height': {
    title: "Guard height",
    course: 'deck',
    ok: {
      observe: "From the deck surface to the top of the rail measures about 36 in. The posts are firm when you push on them.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "A guard is generally required where a walking surface is more than 30 in above the grade below, and 36 in is the commonly taught minimum guard height for residential decks. This guard meets that height and feels solid. Height is only part of the story: infill spacing and post strength matter too.",
      report: "The deck guardrail height was observed to be approximately 36 inches. The guard posts were firm.",
    },
    tip: "Measure the drop at the outer edge of the deck, where the grade is usually lowest, before deciding whether a guard is required.",
  },

  'deck-stair-handrail': {
    title: "Deck stair handrail",
    course: 'deck',
    defect: {
      observe: "The deck stairs drop five risers to the yard. Guards run down both sides, topped with a flat 2x6 cap about 36 in above the nosings. Try to wrap your hand around it: you can only press your palm on top.",
      severity: 'safety', rec: 'contractor', recAlt: [],
      why: "Four or more risers is the commonly taught trigger for a handrail, and a handrail must be graspable. A 2x6 laid flat is a guard cap: it stops you going over the side, but a slipping hand cannot close around it. Deck stairs are often wet, mossy, and used while carrying things, which is exactly when people fall.",
      report: "The deck stairs (five risers) have guards with a flat 2x6 cap but no graspable handrail. This is a fall hazard. Recommend installing a graspable handrail by a qualified contractor.",
    },
    ok: {
      observe: "A round wooden handrail runs the full length of the stair on one side, about 36 in above the tread nosings, returning to a post at each end. You can wrap your hand around it.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "Graspability is what makes a handrail a handrail. A 2x6 laid flat is a guard cap; a round or shaped rail about 1-1/4 to 2 in across is something a slipping hand can actually grip. Returned ends keep sleeves and bag straps from catching.",
      report: "A graspable handrail is installed at the deck stairs. No deficiencies were observed.",
    },
    tip: "Grip the rail and lean on it the way a person who is falling would. A rail that flexes or pulls loose is a defect even if it looks right.",
  },

  'post-footing': {
    title: "Deck post footing",
    course: 'deck',
    defect: {
      observe: "The support post sits on a loose concrete block set on bare soil. The block has tipped, the post is out of plumb, and the bottom few inches of the post are dark and soft when you probe them.",
      severity: 'major', rec: 'contractor', recAlt: ['structural'],
      why: "Posts deliver the deck's load to the ground. A loose block on topsoil can settle and tip, and wood sitting on wet soil or concrete without a standoff rots from the bottom up. The accepted approach is a concrete footing on undisturbed soil below the local frost depth, with a post base that holds the wood off the concrete. Reading backwards: the tipped block and the rot tell you the post has been moving and wet for a long time.",
      report: "The deck support post rests on a loose block on soil, is out of plumb, and shows decay at its base. Recommend evaluation and repair by a qualified deck contractor.",
    },
    ok: {
      observe: "The post stands plumb in a galvanized post base bolted to a poured concrete footing that sits slightly above grade. The wood at the base probes firm.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "A real footing plus a standoff base keeps the post supported and dry. That is the detail you are looking for at every post.",
      report: "Deck posts bear on concrete footings with metal post bases. No deficiencies were observed.",
    },
    tip: "Probe posts at and just below the ground line. Rot hides under a paint film and under the soil.",
  },

  // ───────────────────────────── GARDEN STUDIO (TILE ROOF) ─────────────────────────────
  'tile-broken': {
    title: "Broken clay tiles",
    course: 'roof-tile',
    defect: {
      observe: "From the ladder you see several clay barrel tiles in the field cracked through. One is missing a corner, and you can see the underlayment beneath it.",
      severity: 'repair', rec: 'roofer', recAlt: [],
      why: "Clay tile is very durable but brittle: it breaks under foot traffic, falling limbs, and impact. The tile is largely a sun and impact shield, and the underlayment beneath does much of the waterproofing. Exposed underlayment degrades in sunlight, so broken tiles should be replaced before it fails. Do not walk on clay tile to inspect it; you will break more.",
      report: "Several broken clay roof tiles were observed on the garden studio roof, with underlayment exposed at one location. Recommend repair by a roofing contractor experienced with tile roofs.",
    },
    tip: "Inspect tile from the eave on a ladder or with binoculars. A tile roof should not be walked by an inspector.",
    nc: "NC SOP .1107(c)(8): detached buildings are not required to be inspected, and .1108(c)(1): walking the roof is not required. If your agreement includes the studio, say so in the report and state how you viewed the roof.",
  },

  'tile-slipped': {
    title: "Slipped tiles",
    course: 'roof-tile',
    defect: {
      observe: "Near the eave, two tiles have slid down out of their course, leaving a gap in the row above where the underlayment and a batten show through.",
      severity: 'repair', rec: 'roofer', recAlt: [],
      why: "Tiles slip when fasteners corrode or break, or when someone has walked the roof. The gap exposes underlayment to sunlight and water, and a slipped tile can fall from the eave onto someone below. Resetting and properly fastening the tiles is a routine tile repair.",
      report: "Slipped clay tiles were observed near the eave of the garden studio roof, exposing underlayment. Recommend resetting and securing the tiles by a roofing contractor experienced with tile roofs.",
    },
    ok: {
      observe: "The courses near the eave are straight and even, with each tile overlapping the one below by the same amount.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "Straight courses with consistent overlap mean the tiles are holding position. Nothing to report.",
      report: "Tile courses at the eave appeared aligned and secure at the time of the inspection.",
    },
    tip: "Sight along a course from the rake edge. A slipped tile breaks the straight line, and that is easier to see than the gap itself.",
  },

  'tile-hip-mortar': {
    title: "Hip and ridge mortar",
    course: 'roof-tile',
    ok: {
      observe: "The mortar bedding under the hip and ridge tiles is continuous, with a few hairline surface cracks. Every ridge tile is seated and none look displaced.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "Mortar-set hips and ridges commonly develop hairline shrinkage cracks that do not affect performance. What you look for is missing mortar, loose or displaced ridge tiles, and gaps that let in water or animals. Hairline cracks alone are not a defect.",
      report: "Hip and ridge tiles are mortar set and appeared secure, with minor hairline cracking typical of mortar. No deficiencies were noted.",
    },
    tip: "Look at the ground and gutters below the hips. Chunks of fallen mortar mean the bedding is breaking up.",
  },

  // ───────────────────────────── LIVING ROOM ─────────────────────────────
  'firebox-brick': {
    title: "Firebox masonry",
    course: 'fireplace',
    defect: {
      observe: "Inside the firebox, several mortar joints on the back wall are eroded deep enough to slip a key into, and one firebrick has a crack running through it. Soot stains line the open joints.",
      severity: 'safety', rec: 'chimney', recAlt: ['contractor'],
      why: "The firebox is lined with firebrick set in refractory mortar so the heat of the fire stays inside the masonry. Open joints let heat and hot gases reach the surrounding structure and the cavity behind the firebox, where framing may be closer than you think. Repairs use refractory mortar, not ordinary mortar. Until repaired, the fireplace should not be used.",
      report: "Deteriorated mortar joints and a cracked firebrick were observed in the firebox. This is a fire safety concern. Recommend evaluation and repair by a CSIA-certified chimney professional prior to use.",
    },
    tip: "Hold your flashlight low and rake the beam across the firebox walls. Open joints that look fine head-on cast clear shadows at a low angle.",
  },

  'hearth-extension': {
    title: "Hearth extension",
    course: 'fireplace',
    defect: {
      observe: "The brick hearth in front of the firebox opening is about 8 in deep before the wood floor begins. The fireplace opening itself is a little over 6 sq ft.",
      severity: 'safety', rec: 'chimney', recAlt: ['contractor'],
      why: "Embers pop and logs roll out of fireplaces; the hearth extension is the noncombustible zone that catches them. The commonly taught minimums are 16 in in front and 8 in on each side for openings under 6 sq ft, and 20 in in front and 12 in on each side for openings of 6 sq ft or more. At 8 in, an ember that rolls out lands on the wood floor.",
      report: "The hearth extension projects approximately 8 inches in front of the fireplace opening, less than generally accepted minimums. This is a fire hazard. Recommend evaluation and correction by a CSIA-certified chimney professional or qualified masonry contractor.",
    },
    ok: {
      observe: "The brick hearth projects about 20 in in front of the opening and about a foot past each side. It is all masonry, tight to the floor, with no gaps.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "For an opening of this size, about 20 in in front and 12 in to the sides is the commonly taught minimum, and this hearth meets it. Also check that rugs and furniture are not sitting on the hearth.",
      report: "The hearth extension appeared adequate in size and was in serviceable condition.",
    },
    tip: "Measure the fireplace opening first. Its area decides which hearth numbers apply.",
  },

  'damper': {
    title: "Fireplace damper",
    course: 'fireplace',
    defect: {
      observe: "You pull the damper handle and it moves about an inch, then stops. With your light you see the cast-iron plate is rusted in place, mostly closed.",
      severity: 'repair', rec: 'chimney', recAlt: ['contractor'],
      why: "A damper that will not open fully will push smoke and carbon monoxide into the room the first time someone lights a fire. A rusted damper also tells you water is coming down the flue, so connect this to the crown and cap above. Repair options include replacing the damper or installing a top-sealing damper at the chimney top.",
      report: "The fireplace damper is rusted and does not open fully. Recommend repair by a CSIA-certified chimney professional before the fireplace is used.",
    },
    ok: {
      observe: "The damper swings fully open with a firm pull and closes snugly. With it open, you can see daylight far above.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "A damper that opens fully for a fire and closes tight when it is out is doing both of its jobs: venting smoke and keeping conditioned air in.",
      report: "The fireplace damper was operated and functioned as intended.",
    },
    tip: "Wear gloves and eye protection when you work a damper. Years of soot and rust land on your face the moment it moves.",
  },

  'flue-creosote': {
    title: "Smoke chamber and flue deposits",
    course: 'fireplace',
    defect: {
      observe: "Looking up past the damper into the smoke chamber, the surfaces are dark. In this light you cannot tell what is on them.",
      reading: "Flashlight: the smoke chamber and lower flue are coated with a thick, crusty black deposit, puffy and flaky in places and shiny and tar-like in others. It is well over 1/8 in thick.",
      severity: 'safety', rec: 'chimney', recAlt: [],
      why: "Creosote is wood tar that condenses in a cool flue. It is described in three stages: first stage, dry powdery soot that brushes off; second stage, flaky and crunchy; third stage, a glossy tar-like glaze that is very hard to remove. Heavy or glazed deposits are fuel for a chimney fire. Industry guidance commonly calls for sweeping once buildup reaches about 1/8 in. NFPA 211, the industry standard, calls for a Level II chimney inspection when a property is sold or transferred.",
      report: "Heavy creosote deposits were observed in the smoke chamber and the visible portion of the flue. This is a chimney fire hazard. Recommend cleaning and a Level II chimney inspection by a CSIA-certified chimney sweep prior to use.",
    },
    ok: {
      observe: "Looking up past the damper into the smoke chamber, the surfaces are dark. In this light you cannot tell what is on them.",
      reading: "Flashlight: a thin, dry, matte layer of soot you can smudge with a fingertip. No crust, no glaze, and no debris on the smoke shelf.",
      severity: 'ok', rec: 'none', recAlt: ['chimney'],
      why: "A thin layer of dry soot is normal in a fireplace that gets used. Many inspectors still recommend a Level II chimney inspection at every sale because so much of a flue cannot be seen from below, so a chimney referral here is accepted too.",
      report: "The visible portions of the smoke chamber and flue showed light soot only. The full interior of the flue was not visible. Routine annual chimney inspection and cleaning is recommended.",
    },
    tip: "Say exactly how much of the flue you could see. 'Viewed from the firebox with a flashlight' is a sentence that protects everyone.",
    nc: "NC SOP .1111(e)(5)(A) states the inspector is not required to inspect the interior of flues. Report what is readily visible with a light and state that the flue interior was not fully inspected.",
  },

  'smoke-alarm-age': {
    title: "Smoke alarm age",
    course: 'sop-25',
    defect: {
      observe: "You twist the alarm off its base and read the label on the back. The printed manufacture date is well over ten years ago. The test button still sounds the horn.",
      severity: 'safety', rec: 'contractor', recAlt: ['electrician'],
      why: "Smoke sensors degrade with age, dust, and humidity, so an old alarm can pass its button test and still be slow to sense real smoke. The test button checks the horn and circuitry, not the sensor's sensitivity. NFPA 72 and the major manufacturers call for replacing smoke alarms 10 years from the manufacture date. Hardwired, interconnected alarms should be replaced with compatible units.",
      report: "The living room smoke alarm is more than 10 years past its date of manufacture. Smoke alarms should be replaced 10 years from the date of manufacture. Recommend replacement of all aged smoke alarms. This is a life-safety item.",
    },
    tip: "If one alarm in a house is past ten years, assume they were all installed together and check every one you can reach.",
    nc: "NC SOP .1110(a)(8) and (d): inspect smoke detectors, report in writing on their presence or absence, and operate their test function if readily accessible, except when they are part of a central system.",
  },

  'liv-polarity': {
    title: "Receptacle polarity",
    course: 'elec-res',
    defect: {
      observe: "A standard 3-slot duplex receptacle on the living room wall, cover plate in place. Nothing looks wrong.",
      reading: "3-light tester: the light pattern matches 'HOT/NEU REV' (hot and neutral reversed) on the tester's legend.",
      severity: 'safety', rec: 'electrician', recAlt: [],
      why: "With reversed polarity the hot conductor lands on the wide (neutral) slot. A lamp switch then interrupts the neutral instead of the hot, leaving the socket shell energized even with the lamp off. It is usually a simple correction at the receptacle, but one reversal often means more on the circuit, so an electrician should check the rest.",
      report: "The living room receptacle tested with reversed polarity (hot and neutral reversed). This is a shock hazard. Recommend evaluation and correction by a licensed electrician.",
    },
    ok: {
      observe: "A standard 3-slot duplex receptacle on the living room wall, cover plate in place. Nothing looks wrong.",
      reading: "3-light tester: the 'CORRECT' pattern on the tester's legend.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "Correct wiring at the tested receptacle. Know your tool's limits: a 3-light tester cannot detect a 'bootleg' ground (neutral jumpered to the ground terminal) or a poor-quality ground, so 'correct' means 'no fault this tester can see'.",
      report: "A representative number of receptacles in the living room were tested and found to have correct polarity and grounding.",
    },
    tip: "Light patterns differ between tester brands. Read the legend on your own tester, every time, and test both halves of the duplex.",
    nc: "NC SOP .1110(a)(5) requires operating a representative number of receptacles (the NC definition is one per room), and (a)(6) requires polarity and grounding tests of all receptacles within 6 ft of interior plumbing fixtures, in the garage or carport, and on the exterior.",
  },

  'ceiling-stain': {
    title: "Ceiling stain",
    course: 'moisture',
    defect: {
      observe: "A tan, ring-shaped stain about the size of a dinner plate on the living room ceiling, near the west wall. The drywall surface is intact and not sagging.",
      reading: "Moisture meter: 29% WME at the stain, wet relative to the 11% reference reading on adjacent drywall.",
      severity: 'repair', rec: 'contractor', recAlt: ['roofer'],
      why: "A stain only tells you water was there once; the meter tells you it is there now. A reading well above the reference on the same material means an active leak or condensation source. Above this ceiling is the attic and, near the west wall, the chimney, so check the chimney flashing and the attic side before guessing. Wet drywall can sag and grow mold, and the leak behind it is usually doing damage you cannot see.",
      report: "A water stain was observed on the living room ceiling near the west wall. Elevated moisture readings were obtained at the stain at the time of the inspection, indicating active moisture intrusion. Recommend further evaluation by a qualified contractor to identify and correct the source, followed by repair of damaged materials.",
    },
    ok: {
      observe: "A tan, ring-shaped stain about the size of a dinner plate on the living room ceiling, near the west wall. The drywall surface is intact and not sagging.",
      reading: "Moisture meter: 11% WME at the stain, the same as the 11% reference on adjacent drywall. Dry at the time of inspection.",
      severity: 'monitor', rec: 'none', recAlt: ['contractor', 'roofer'],
      why: "A dry stain is evidence of a past leak that may have been fixed, or of one that only appears in wind-driven rain. It is still reportable, because it is a sign of water penetration. Note the dry reading, recommend asking the seller about its history, and recommend monitoring, especially after storms. Calling it 'no defect' and leaving it out is the mistake here.",
      report: "A water stain was observed on the living room ceiling. Moisture readings at the stain were dry at the time of the inspection. Recommend asking the seller about the history of this stain and monitoring the area, particularly after heavy rain.",
    },
    tip: "Always take a reference reading on the same material in a known-dry area. A number means nothing until you compare it.",
    nc: "NC SOP .1106(c)(4) and .1113(b)(2) require reporting signs of water penetration into the building, so even a dry stain belongs in the report.",
  },

  'window-operation': {
    title: "Window operation",
    course: 'attic-interior',
    ok: {
      observe: "The sashes slide up and down smoothly, stay where you leave them, close fully, and the sash lock engages firmly.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "Notice what you actually checked: it opens, it stays open (the balances work), it closes fully, and it locks. That is a window functioning as intended.",
      report: "A representative number of windows were operated and functioned as intended.",
    },
    tip: "A window that will not stay up is a guillotine for small fingers. Always test whether the sash holds its position.",
    nc: "NC SOP .1113(b)(1) requires operating a representative number of windows and interior doors; the NC definition of representative number for windows is one per room.",
  },

  // ───────────────────────────── KITCHEN ─────────────────────────────
  'range-anti-tip': {
    title: "Range anti-tip device",
    course: 'appliances',
    defect: {
      observe: "You pull out the storage drawer under the oven and shine your light at the back. The rear leveling foot sits on the floor with no anti-tip bracket around it.",
      severity: 'safety', rec: 'appliance', recAlt: ['contractor'],
      why: "A child standing on an open oven door, or an adult leaning on it, can tip a freestanding range forward, bringing hot pots and the range down on top of them. Ranges are supplied with an anti-tip bracket that captures a rear foot to the floor or wall. It is often left off during installation or not reinstalled after the range is moved.",
      report: "No anti-tip bracket was observed at the range. This is a tip-over safety hazard. Recommend installation of the manufacturer's anti-tip device by a qualified appliance technician or contractor.",
    },
    tip: "Look through the drawer opening instead of tipping the range. Never put your own weight on an oven door to test it.",
  },

  'range-burners': {
    title: "Range and oven operation",
    course: 'appliances',
    ok: {
      observe: "Each surface element glows red within a minute, the oven heats up, and all the controls respond normally.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "You operated the basic functions and they work. You are not required to check thermostat calibration, timers, or the self-clean cycle, so do not imply that you did.",
      report: "The electric range and oven were operated using normal controls and functioned at the time of the inspection.",
    },
    tip: "Turn everything off when you are done and say so in your notes. A forgotten burner is a bad way to end an inspection.",
    nc: "NC SOP .1115(a)(2) requires operating the basic functions of ranges, cooktops, and ovens; .1115(b)(1) excludes clocks, timers, self-cleaning functions, and thermostat calibration.",
  },

  'dw-drain-loop': {
    title: "Dishwasher drain hose",
    course: 'appliances',
    defect: {
      observe: "Under the sink, the dishwasher drain hose runs flat along the cabinet floor and connects straight to the disposal inlet. There is no high loop and no air gap at the counter.",
      severity: 'repair', rec: 'plumber', recAlt: ['appliance'],
      why: "Without a high loop or an air gap, dirty water from the sink and disposal can drain back into the dishwasher and contaminate it. A high loop secured up under the countertop, or an air gap fitting where one is required locally, keeps drain water flowing one way only.",
      report: "The dishwasher drain hose is not looped up or connected through an air gap. Recommend installing a high loop or air gap to prevent backflow, by a licensed plumber.",
    },
    ok: {
      observe: "The drain hose rises in a loop strapped to the underside of the countertop before dropping to the disposal inlet.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "The high loop sits above the drain connection, so water from the sink cannot run back into the dishwasher. A simple detail done right.",
      report: "The dishwasher drain line includes a high loop. No deficiencies were noted.",
    },
    tip: "Make sure the loop is actually fastened up high. Hoses held by a single zip tie often slide back down over time.",
  },

  'dw-operation': {
    title: "Dishwasher operation",
    course: 'appliances',
    ok: {
      observe: "You run the dishwasher through a full cycle. It fills, washes, drains, and finishes with no leaks at the door or underneath.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "A full cycle with no leaks is the test. Start it early in the inspection so it finishes while you work elsewhere, then come back and look underneath.",
      report: "The dishwasher was operated through a complete cycle and functioned at the time of the inspection. No leaks were observed.",
    },
    tip: "After the cycle, check the cabinet floor under the sink. Dishwasher drain leaks show up there, not at the dishwasher.",
    nc: "NC SOP .1115(a)(1) requires operating installed dishwashers through a complete cycle.",
  },

  'sink-flex-drain': {
    title: "Sink trap and drain",
    course: 'plumbing',
    defect: {
      observe: "The sink drain drops through a ribbed, flexible accordion-style pipe that bends into a loose trap shape before entering the wall.",
      severity: 'repair', rec: 'plumber', recAlt: [],
      why: "Corrugated flexible drain pipe catches grease and food in its ribs, clogs readily, and can sag out of shape and lose its water seal. It is not generally accepted for permanent trap or drain use. A smooth-wall PVC or ABS P-trap with slip joints is the usual fix.",
      report: "A corrugated flexible drain pipe is used at the kitchen sink trap. This material is prone to clogging and is not intended for permanent drain use. Recommend replacement with a standard P-trap by a licensed plumber.",
    },
    ok: {
      observe: "A smooth white PVC P-trap with slip-nut joints connects the sink tailpiece to the wall drain. Water drains quickly with no drips.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "Smooth-wall pipe in a proper P-trap shape holds its water seal and drains freely. You ran the water and checked the joints: complete.",
      report: "The kitchen sink drain and trap functioned with no leaks observed.",
    },
    tip: "Run water for a full minute and wrap a dry paper towel around each joint. It finds drips your eyes miss.",
  },

  'sink-leak': {
    title: "Sink cabinet floor",
    course: 'moisture',
    defect: {
      observe: "The cabinet floor under the trap has a darker patch and a few water rings, and the front edge of the particleboard looks a little swollen.",
      reading: "Moisture meter: 32% WME at the cabinet floor under the trap, wet relative to the 10% reference on the dry side panel.",
      severity: 'repair', rec: 'plumber', recAlt: [],
      why: "An elevated reading directly below the plumbing points to an active drain or supply leak. Particleboard cabinet floors swell and crumble when wet and rarely recover. Run the water and watch the joints to find the source, then report both the leak and the damaged cabinet floor.",
      report: "Elevated moisture readings and swelling were observed at the kitchen sink cabinet floor, indicating an active leak. Recommend evaluation and repair by a licensed plumber, and repair of the damaged cabinet floor.",
    },
    ok: {
      observe: "The cabinet floor under the trap has a darker patch and a few water rings, the kind a wet sponge or cleaner bottle leaves behind.",
      reading: "Moisture meter: 10% WME, the same as the reference on the dry side panel. No drips with the water running.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "Faint rings with dry readings, no swelling, and no drips while the fixture runs are typical cosmetic marks under a sink. You did the work that lets you say so: you ran the water, checked the joints, and measured. Calling this a leak would be an over-call.",
      report: "The kitchen sink cabinet floor showed minor cosmetic staining. Moisture readings were dry and no leaks were observed with the fixture operating.",
    },
    tip: "Take the reading after you have run the sink for a few minutes, not before. Some leaks only happen while water is flowing.",
    nc: "NC SOP .1105(a)(10): cosmetic damage is not required to be reported.",
  },

  'disposal-wiring': {
    title: "Disposal electrical connection",
    course: 'elec-res',
    defect: {
      observe: "The disposal's power cable enters the bottom of the unit through a bare knockout hole with no cable clamp. The cable sheath is rubbed through on the sharp edge, and you can see the insulated conductors inside.",
      severity: 'safety', rec: 'electrician', recAlt: [],
      why: "Disposals vibrate every time they run. Without a listed cable clamp, the sheath chafes against the knockout edge until the conductor insulation is exposed or cut, creating a shock and short-circuit hazard in a cabinet where water is common. The fix is a proper connector, or a listed cord-and-plug kit where the disposal is meant to plug in.",
      report: "The garbage disposal electrical cable lacks a strain relief clamp at the unit, and the cable sheathing is damaged. This is a shock hazard. Recommend correction by a licensed electrician.",
    },
    tip: "While you are under the sink, look for a receptacle back there too, and test it if the disposal or dishwasher plugs in.",
  },

  'kit-gfci-test': {
    title: "Kitchen countertop GFCI",
    course: 'elec-res',
    defect: {
      observe: "A GFCI receptacle with TEST and RESET buttons beside the sink. It looks like every other GFCI. Looking protected and being protected are not the same thing.",
      reading: "3-light tester: the 'CORRECT' wiring pattern. Device TEST button pressed: nothing happens. Tester's GFCI button pressed: the receptacle does not trip and stays energized. The GFCI device has failed.",
      severity: 'safety', rec: 'electrician', recAlt: [],
      why: "Countertop receptacles near a sink are where wet hands, grounded plumbing, and appliances meet. A GFCI that will not trip gives the false comfort of protection with none of the function: GFCI devices wear out, and a failed one can keep passing power indefinitely. That is why you operate every GFCI you can reach instead of trusting the buttons on its face.",
      report: "The GFCI receptacle at the kitchen countertop near the sink did not trip when tested with its TEST button or with a GFCI tester. The device appears to have failed and is not providing ground-fault protection. This is a shock hazard. Recommend replacement by a licensed electrician.",
    },
    ok: {
      observe: "A GFCI receptacle with TEST and RESET buttons beside the sink. It looks like every other GFCI. Looking protected and being protected are not the same thing.",
      reading: "3-light tester: the 'CORRECT' wiring pattern. Device TEST button pressed: it trips with a click and power cuts off. RESET restores power. Tester's GFCI button gives the same result.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "Correct wiring and a GFCI that trips and resets: it is functioning as intended. The test that matters is the trip, not the presence of buttons. Always reset what you trip before you leave the room.",
      report: "Kitchen countertop receptacles tested with correct wiring and are GFCI protected.",
    },
    tip: "When a receptacle trips and you cannot find which GFCI did it, check the garage and bathrooms. Builders often chained circuits in surprising ways.",
    nc: "NC SOP .1110(a)(6)-(7): test polarity and grounding of all receptacles within 6 ft of interior plumbing fixtures, and the operation of GFCIs.",
  },

  'hood-recirc': {
    title: "Recirculating range hood",
    course: 'appliances',
    ok: {
      observe: "The range hood's fan and light work. There is no duct above it: air passes through a charcoal filter and blows back into the kitchen through a grille on the front.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "A recirculating (ductless) hood is an accepted, listed appliance. It traps grease and some odor but does not remove heat or moisture from the house. That is a performance trade-off, not a defect. A defect would be a ducted hood that dumps into a cabinet or attic, a missing filter, or a fan that does not run.",
      report: "The range hood is a recirculating type with a charcoal filter. The fan and light were operated and functioned. Note that recirculating hoods do not exhaust moisture or heat to the exterior.",
    },
    tip: "Look up inside the cabinet above the hood. Ducts that end inside the cabinet are a common and real defect.",
    nc: "NC SOP .1115(a)(5) requires inspecting and operating the basic functions of ventilation equipment or range hoods.",
  },

  'door-threshold': {
    title: "Rear door threshold",
    course: 'egress',
    ok: {
      observe: "The rear door swings inward into the kitchen. Outside, the deck surface is a small step down, about 2 in below the threshold.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "A small drop from an exterior door threshold to the landing outside is normal and keeps water out. The commonly taught limit is a landing no more than about 1-1/2 in below the threshold, with an exception at exterior doors that do not swing over the landing, where a step of up to about 7-3/4 in is generally accepted. This inswing door with a 2-in drop is well inside that. A door swinging out over a tall step would be the problem.",
      report: "The rear entry door was operated and functioned. The step down to the deck landing appeared typical.",
    },
    tip: "Look at which way the door swings before you judge the step. The same drop can be fine for an inswing door and a hazard for an outswing one.",
  },

  // ───────────────────────────── BATH ─────────────────────────────
  'toilet-loose': {
    title: "Loose toilet",
    course: 'plumbing',
    defect: {
      observe: "When you press your knees against the sides of the bowl and shift your weight, the toilet rocks noticeably on the floor. The caulk bead at its base is cracked.",
      severity: 'repair', rec: 'plumber', recAlt: [],
      why: "A rocking toilet breaks the wax ring seal between the toilet and the closet flange. Each flush can then leak a little water, and let sewer gas out, under the toilet, rotting the subfloor out of sight. Tightening the bolts is not enough once it has rocked; the ring usually needs replacing and the flange and floor should be checked.",
      report: "The hall bathroom toilet is loose at the floor. Recommend resetting the toilet with a new wax seal and evaluating the flange and subfloor, by a licensed plumber.",
    },
    tip: "Test with your knees, not your hands. It is gentle on the fixture, and you will feel movement a hand misses.",
  },

  'toilet-base-moisture': {
    title: "Floor at toilet base",
    course: 'moisture',
    defect: {
      observe: "The vinyl floor around the toilet base looks slightly darker than the rest of the room.",
      reading: "Moisture meter: 34% WME at the floor beside the toilet base, wet relative to the 12% reference reading on the same floor near the door.",
      severity: 'repair', rec: 'plumber', recAlt: ['contractor'],
      why: "Elevated moisture at a toilet base usually means the wax seal is leaking with each flush. The subfloor under vinyl can rot for years before the floor feels soft. Pair this with the crawlspace: the subfloor and joists under the bathroom are where you confirm the damage.",
      report: "Elevated moisture readings were obtained at the floor around the hall bathroom toilet base, indicating a leak. Recommend repair by a licensed plumber and evaluation of the subfloor for damage.",
    },
    ok: {
      observe: "The vinyl floor around the toilet base looks slightly darker than the rest of the room.",
      reading: "Moisture meter: 12% WME at the toilet base, the same as the 12% reference reading near the door.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "The reading matches the dry reference, so the discoloration is just wear or grime at a spot people mop around. No active moisture at the time of inspection.",
      report: "Moisture readings at the floor around the toilet base were within normal range at the time of the inspection.",
    },
    tip: "Flush the toilet a few times before you take your reading. A wax seal that only leaks under flow will not show on a dry floor.",
  },

  'vanity-s-trap': {
    title: "Vanity trap configuration",
    course: 'plumbing',
    defect: {
      observe: "Under the vanity, the drain drops from the sink, curves down and back up, then turns straight down through the floor instead of into the wall. The pipe forms an S shape, and there is no vent connection in the cabinet.",
      severity: 'repair', rec: 'plumber', recAlt: [],
      why: "A trap's water seal is what keeps sewer gas out of the room. In an S-trap, the vertical drop right after the trap lets draining water siphon the seal out behind it, so the trap can be left empty after use. S-traps are not accepted in modern plumbing practice. The fix is a P-trap to a properly vented drain, which may need a new vent or, where locally allowed, an air admittance valve.",
      report: "An S-trap configuration was observed at the hall bathroom vanity. S-traps can siphon dry and allow sewer gases into the home. Recommend correction by a licensed plumber.",
    },
    tip: "Fill the basin, pull the stopper, and listen. A gurgle at the end is the sound of the trap seal being siphoned.",
  },

  'vanity-supply-valves': {
    title: "Vanity supply stops",
    course: 'plumbing',
    ok: {
      observe: "Hot and cold supply stops are quarter-turn valves with braided stainless supply lines to the faucet. The fittings are dry, with no corrosion.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "Quarter-turn stops with braided lines are a tidy, modern arrangement, and they let anyone shut off this faucet without shutting off the house. Dry fittings and no corrosion: nothing to report.",
      report: "Fixture supply stops and lines at the hall bathroom vanity appeared serviceable with no leaks observed.",
    },
    tip: "Look, do not turn. An old stop valve that has not moved in years can start leaking the moment you touch it.",
    nc: "NC SOP .1109(d)(4): inspectors are not required to operate any valve except water closet flush valves, fixture faucets, and hose faucets.",
  },

  'tub-caulk': {
    title: "Tub-to-wall joint",
    course: 'moisture',
    defect: {
      observe: "The caulk along the tub-to-tile joint is cracked and missing at the corners, and you can see dark gaps where the tile meets the tub rim.",
      severity: 'repair', rec: 'contractor', recAlt: [],
      why: "That joint moves every time the tub fills and empties, which is why it gets caulk instead of grout. Once it opens, shower water runs behind the tile and into the wall framing and subfloor. It is maintenance, but it is the cheapest moisture defect in the house to fix and one of the most expensive to ignore.",
      report: "Caulk at the tub-to-wall joint is deteriorated and missing in areas. Recommend removing and replacing the caulk to prevent water intrusion, by a qualified contractor.",
    },
    ok: {
      observe: "A continuous bead of caulk seals the tub-to-tile joint all the way around, with no gaps, peeling, or discoloration.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "A continuous, bonded bead at the tub joint is what keeps shower water on the tile. Nothing to report.",
      report: "The tub-to-wall caulk joint appeared intact at the time of the inspection.",
    },
    tip: "Press gently on the tile just above the tub. Tile that moves or sounds hollow means water has already been getting in.",
  },

  'tub-wall-moisture': {
    title: "Tile wall moisture",
    course: 'moisture',
    defect: {
      observe: "The tile below the soap dish looks normal, though the grout lines there are slightly darker than elsewhere on the wall.",
      reading: "Moisture meter (pinless, through tile): 30% WME-equivalent below the soap dish, elevated relative to the 12% reference on the tile wall away from the shower.",
      severity: 'repair', rec: 'contractor', recAlt: ['plumber'],
      why: "Elevated readings behind tile mean water is getting into the wall, through failed grout, a cracked soap dish, or a leaking valve or shower arm. Left alone, it rots the backer and framing and grows mold behind the tile, which you will not see until tiles loosen. A pinless meter reading through tile is a comparison scan, so the dry reference is the important half of the measurement.",
      report: "Elevated moisture readings were obtained at the tub surround below the soap dish, indicating water intrusion behind the tile. Recommend evaluation and repair by a qualified contractor; a licensed plumber should evaluate the valve if a plumbing leak is suspected.",
    },
    ok: {
      observe: "The tile below the soap dish looks normal, though the grout lines there are slightly darker than elsewhere on the wall.",
      reading: "Moisture meter (pinless, through tile): 12% WME-equivalent, the same as the reference on the dry tile wall.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "Darker grout in the wettest part of a shower is normal staining. The reading matches dry tile, so there is no evidence of water behind the wall.",
      report: "Moisture readings at the tub surround were within normal range at the time of the inspection.",
    },
    tip: "Scan the wall below the valve and the soap dish first. Those two spots are where most hidden tub-wall leaks start.",
  },

  'bath-gfci-test': {
    title: "Bathroom receptacle GFCI",
    course: 'elec-res',
    defect: {
      observe: "A GFCI receptacle with TEST and RESET buttons beside the vanity mirror. It looks like every other GFCI. Looking protected and being protected are not the same thing.",
      reading: "3-light tester: the 'CORRECT' wiring pattern. Device TEST button pressed: nothing happens. Tester's GFCI button pressed: the receptacle does not trip and stays energized. The GFCI device has failed.",
      severity: 'safety', rec: 'electrician', recAlt: [],
      why: "Bathrooms combine water, grounded plumbing, and hair dryers. A GFCI that will not trip is one of the most important shock hazards you can find, because everyone in the house believes they are protected. GFCI devices can fail and keep passing power, which is why you operate them instead of trusting the buttons.",
      report: "The GFCI receptacle in the hall bathroom did not trip when tested with its TEST button or with a GFCI tester. The device appears to have failed and is not providing ground-fault protection. This is a shock hazard. Recommend replacement by a licensed electrician.",
    },
    ok: {
      observe: "A GFCI receptacle with TEST and RESET buttons beside the vanity mirror. It looks like every other GFCI. Looking protected and being protected are not the same thing.",
      reading: "3-light tester: the 'CORRECT' wiring pattern. Device TEST button pressed: it trips with a click and power cuts off. RESET restores power. Tester's GFCI button gives the same result.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "Correct wiring and a GFCI that trips and resets: functioning as intended. Do not over-call a working device just because GFCIs sometimes fail. Your evidence is the trip.",
      report: "The hall bathroom GFCI receptacle tested with correct wiring and tripped and reset normally.",
    },
    tip: "Reset every GFCI you trip before you leave the room, and write down where it was.",
    nc: "NC SOP .1110(a)(6)-(7): test polarity and grounding of all receptacles within 6 ft of interior plumbing fixtures, and the operation of GFCIs.",
  },

  'bath-fan-operation': {
    title: "Bath exhaust fan operation",
    course: 'attic-interior',
    ok: {
      observe: "The fan runs quietly when switched on, and a square of toilet tissue held to the grille is pulled flat against it.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "The fan moves air, which is all you can confirm from the bathroom. Where that air goes is a separate question you answer in the attic or at the exterior: a working fan that dumps moist air into the attic is a defect up there, not down here.",
      report: "The bathroom exhaust fan was operated and functioned. See the attic section for the duct termination.",
    },
    tip: "Make a note to follow this fan's duct when you get to the attic. Inspections are a chain of clues.",
    nc: "NC SOP .1114(a)(3) requires inspecting kitchen, bathroom, and laundry venting systems.",
  },

  // ───────────────────────────── PRIMARY BEDROOM ─────────────────────────────
  'egress-sill-height': {
    title: "Bedroom escape window sill height",
    course: 'egress',
    defect: {
      observe: "You measure from the bedroom floor to the top of the window sill: about 52 in. The window opens normally, but you would have to climb up to get through it.",
      severity: 'safety', rec: 'contractor', recAlt: [],
      why: "In a fire, a bedroom window is the second way out for the occupant and the way in for a firefighter. Emergency escape and rescue openings are generally held to a maximum sill height of 44 in above the floor, along with minimum opening dimensions. At 52 in, a child, an older adult, or anyone groggy with smoke may not be able to get out. Many older homes predate current rules, so report it as a safety concern and let a contractor and the local building official sort out the correction.",
      report: "The primary bedroom window sill is approximately 52 inches above the floor, higher than the generally accepted maximum of 44 inches for emergency escape and rescue openings. This may impede emergency escape. Recommend evaluation and correction by a qualified contractor.",
    },
    tip: "Measure to the top of the highest part you would actually have to climb over, including the frame and stool, not just to the glass.",
    nc: "The 2018 NC Residential Code R310 limits escape opening sill height to 44 in, and an NC OSFM formal interpretation (2019) treats the 'sill' as any horizontal member that stays in place when the sash is operated. NC's opening size rule is distinctive: per the OSFM, 4.0 sq ft is the minimum net clear opening with the sash fully open, while 5.0 sq ft (grade floor) and 5.7 sq ft are the minimum opening sizes with the sashes removed. As an inspector you report the measurement and the safety concern, not a code violation.",
  },

  'bedroom-smoke-alarm': {
    title: "Bedroom smoke alarm",
    course: 'sop-25',
    defect: {
      observe: "You scan the bedroom ceiling and upper walls. There is no smoke alarm in the room; the nearest one you can find is out in the hallway.",
      severity: 'safety', rec: 'contractor', recAlt: ['electrician'],
      why: "Many fatal home fires happen at night, and a closed bedroom door can keep smoke away from a hallway alarm until it is too late. Current practice calls for a smoke alarm inside each sleeping room, outside each sleeping area, and on every level, ideally interconnected so one sounds them all. Older homes often predate the in-bedroom requirement, so report it as a safety upgrade rather than a code violation.",
      report: "No smoke alarm was observed in the primary bedroom. Recommend installation of smoke alarms in each sleeping room, outside sleeping areas, and on each level, as a life-safety upgrade.",
    },
    ok: {
      observe: "A smoke alarm is mounted on the ceiling near the middle of the bedroom. It sounds when you press the test button.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "Ceiling-mounted away from the wall, out of the dead-air pocket where wall meets ceiling, and it sounds when tested. Still check the manufacture date on the back if you can reach it safely.",
      report: "A smoke alarm is present in the primary bedroom and responded to its test button.",
    },
    tip: "Press test buttons with a pole or the back of a pen, and warn the occupants first. A sounding alarm startles everyone.",
    nc: "NC SOP .1110(d) requires reporting in writing on the presence or absence of smoke detectors and operating their test function if readily accessible, except when they are part of a central system.",
  },

  'open-ground': {
    title: "Ungrounded 3-prong receptacle",
    course: 'elec-res',
    defect: {
      observe: "A 3-slot (grounding-type) receptacle in the primary bedroom. The cover plate is clean and nothing looks damaged.",
      reading: "3-light tester: the light pattern matches 'OPEN GROUND' on the tester's legend. Hot and neutral are correct; no equipment ground is present.",
      severity: 'safety', rec: 'electrician', recAlt: [],
      why: "A 3-slot receptacle promises a ground that is not there. Appliances with metal cases and surge protectors rely on that ground to carry fault current and trip the breaker; without it, a fault can leave the case energized. Accepted corrections are restoring the equipment ground, or adding GFCI protection with the receptacle labeled 'No Equipment Ground', which protects people but not surge suppressors. Some inspectors grade this Repair; Safety is the stronger call because the receptacle misleads users.",
      report: "The primary bedroom 3-prong receptacle tested with an open ground (no equipment ground present). Recommend evaluation and correction by a licensed electrician.",
    },
    tip: "One open ground usually means the whole circuit, or a whole era of wiring. Test the neighbors before you write it up as one receptacle.",
    nc: "NC SOP .1110(a)(6) requires grounding tests for all receptacles within 6 ft of plumbing fixtures, in the garage or carport, and on the exterior. Bedroom receptacles fall under the representative-number rule of .1110(a)(5), but testing more is allowed and wise in an older home.",
  },

  'closet-light': {
    title: "Closet light fixture",
    course: 'elec-res',
    defect: {
      observe: "The closet ceiling has a bare-bulb porcelain lamp holder with a pull chain. The bulb hangs about a foot from the edge of the shelf, where blankets and boxes are stacked.",
      severity: 'safety', rec: 'electrician', recAlt: [],
      why: "Hot bulbs can ignite fabric and cardboard stored next to them. The generally accepted rule prohibits open or partially enclosed incandescent fixtures in clothes closets and sets clearances between other fixture types and the storage area. The usual fix is an inexpensive, fully enclosed LED fixture mounted clear of the shelf.",
      report: "An open-bulb light fixture is installed in the primary bedroom closet near stored items. This is a fire hazard. Recommend replacement with an enclosed fixture approved for closet use, by a licensed electrician.",
    },
    ok: {
      observe: "The closet has a surface-mounted, fully enclosed LED fixture on the ceiling, well clear of the shelf.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "Enclosed and cool-running, mounted away from the storage space: the right fixture for a closet.",
      report: "The closet light fixture was operated and functioned. No deficiencies were noted.",
    },
    tip: "Look at how the closet is actually used. A legal fixture can still become a hazard when storage is piled up to it.",
  },

  // ───────────────────────────── BEDROOM 2 ─────────────────────────────
  'security-bars': {
    title: "Bedroom window security bars",
    course: 'egress',
    defect: {
      observe: "Steel bars are bolted over the outside of the bedroom window. From inside you find no release lever, latch, or key mechanism; the bars are fixed.",
      severity: 'safety', rec: 'contractor', recAlt: [],
      why: "Bars that keep burglars out also keep a sleeping child in and firefighters out. Bars over a bedroom escape window are only acceptable with an inside release that opens without a key, tool, or special knowledge. People have died behind fixed security bars. Ask whether a release exists that you cannot see, and test it if one does.",
      report: "Fixed security bars without an interior quick-release are installed over the Bedroom 2 window, blocking the emergency escape and rescue opening. This is a life-safety hazard. Recommend removal or replacement with release-equipped bars by a qualified contractor.",
    },
    tip: "If bars have a release, operate it yourself. A release that is painted shut is the same as no release.",
  },

  'drywall-crack': {
    title: "Crack at door corner",
    course: 'structural',
    defect: {
      observe: "A crack runs diagonally from the upper corner of the door frame toward the ceiling. It is about 3/16 in wide at the top and tapers toward the door, the drywall on one side sits slightly proud of the other, and the door rubs at the head when you close it.",
      severity: 'major', rec: 'structural', recAlt: ['contractor'],
      why: "Read the crack backwards. A tapered diagonal crack with an offset, plus a door that has started to bind, says the framing around the opening has moved, not just the tape. That points to settlement or a support issue below, so look at the piers and girder under this room in the crawlspace. A structural engineer can tell whether the movement is old and finished or ongoing. Describe it and refer; do not diagnose the cause in the report.",
      report: "A diagonal crack with offset was observed above the Bedroom 2 door, and the door rubs at the head jamb. These conditions may indicate structural movement. Recommend evaluation by a licensed structural engineer.",
    },
    ok: {
      observe: "A thin hairline crack runs from the corner of the door frame along the drywall tape joint. It is about the width of a pencil line, with no offset, and the door opens, closes, and latches freely.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "Hairline cracks at door and window corners are among the most common things you will see. Drywall seams meet at the weakest point of the wall, and normal framing shrinkage and seasonal humidity crack the tape. No width, no offset, and a door that works: not a structural sign. Writing this up as structural would scare a buyer out of a good house.",
      report: "Minor hairline drywall cracking typical of normal settlement and shrinkage was observed at the Bedroom 2 door corner. This is considered cosmetic.",
    },
    tip: "Check the door before you judge the crack. A crack with a binding door is a story; a crack with a door that works is usually just a crack.",
    nc: "NC SOP .1105(a)(10): cosmetic damage is not required to be reported.",
  },

  'door-latch': {
    title: "Interior door operation",
    course: 'attic-interior',
    ok: {
      observe: "The door swings without rubbing, the gap along the head and latch side is even, and the latch catches the strike firmly.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "Interior doors are a quiet structural gauge. An even gap and a latch that catches means the frame is still square. Compare this door with the ones on the other side of the house.",
      report: "A representative number of interior doors were operated and functioned as intended.",
    },
    tip: "Close the door slowly and watch the gap at the top corner. A wedge-shaped gap is the first sign a frame is racking.",
  },

  // ───────────────────────────── HALL ─────────────────────────────
  'attic-ladder': {
    title: "Attic pull-down stairs",
    course: 'attic-interior',
    defect: {
      observe: "When you pull the stairs down, the frame shifts in the ceiling opening. Several hinge bolts are missing, the frame is held to the ceiling framing by only a few drywall screws, and the bottom section's feet do not sit flat on the floor.",
      severity: 'safety', rec: 'contractor', recAlt: [],
      why: "Folding attic stairs carry a person plus whatever they are carrying, through hinges and a frame attachment the manufacturer specifies, typically nails or lag screws through the frame into the framing on all sides, and every hinge bolt in place. Drywall screws are brittle and can snap in shear, and missing hinge bolts let a section fold under load. A failed attic ladder is a serious fall. If the attachment looks unsafe, do not climb it.",
      report: "The attic pull-down stairs are inadequately fastened, with missing hinge hardware and frame attachment using drywall screws, and the ladder sections do not rest properly on the floor. This is a fall hazard. Recommend repair or replacement by a qualified contractor.",
    },
    tip: "Look at the fasteners before you put weight on the ladder, every time. Your safety is part of the inspection.",
    nc: "NC SOP .1106(c)(2)-(3): enter attics except when access is obstructed, entry could damage the property, or dangerous conditions are suspected, and report the method used to inspect the attic. An unsafe ladder is a valid reason not to enter; say so in the report.",
  },

  'co-alarm': {
    title: "Carbon monoxide alarm",
    course: 'sop-25',
    defect: {
      observe: "The hallway alarm's label reads 'Smoke Alarm' only. You find no carbon monoxide alarm in the hall or the bedrooms. This house has a gas furnace, a gas water heater, a wood-burning fireplace, and an attached garage.",
      severity: 'safety', rec: 'contractor', recAlt: ['electrician'],
      why: "Carbon monoxide is invisible and odorless, and smoke alarms do not detect it. A home with fuel-burning appliances, a fireplace, or an attached garage should have a CO alarm outside each sleeping area. This house has all three risk factors. A combination smoke and CO alarm is a simple fix.",
      report: "No carbon monoxide alarm was observed. The home has fuel-burning appliances, a fireplace, and an attached garage. Recommend installation of carbon monoxide alarms outside sleeping areas.",
    },
    ok: {
      observe: "The hallway alarm is a combination smoke and carbon monoxide alarm, labeled for both, and it sounds when you press the test button.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "A combination alarm outside the bedrooms covers both hazards. Check its date like any smoke alarm; CO sensors have a limited life too, and the manufacturer's label will say when to replace it.",
      report: "A combination smoke and carbon monoxide alarm is installed in the hallway outside the bedrooms and responded to its test button.",
    },
    tip: "Read the label, not the shape. Smoke-only and combination alarms often look identical from the floor.",
    nc: "NC SOP .1110(d) requires reporting in writing on the presence or absence of installed carbon monoxide alarms in any home with fireplaces, fuel-fired appliances, or attached garages, and operating their test function if readily accessible.",
  },

  'return-grille': {
    title: "HVAC return grille",
    course: 'hvac',
    ok: {
      observe: "A large return air grille is mounted on the hall wall. It is clean and open, and it pulls a sheet of paper against it while the system runs. There is no filter behind this grille.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "Filters can live at the return grille or at the equipment; either works as long as the system has one, and it is in good condition. This system's filter is at the furnace. A return that is open, unobstructed, and drawing air is functioning as intended.",
      report: "The HVAC return air grille in the hallway was unobstructed and drawing air. The system filter is located at the furnace.",
    },
    tip: "When you find no filter at the return, go find it at the equipment before you write 'no filter'.",
  },

  // ───────────────────────────── LAUNDRY / UTILITY ─────────────────────────────
  'furnace-filter': {
    title: "Furnace air filter",
    course: 'hvac',
    defect: {
      observe: "You slide the filter out of its slot at the furnace. It is caked gray with dust, bowed inward in the middle, and its cardboard frame is starting to collapse.",
      severity: 'repair', rec: 'hvac', recAlt: ['none'],
      why: "A clogged filter starves the blower of air. That can overheat the heat exchanger and trip the high-limit switch in winter, freeze the A/C coil in summer, and pull dirt into the system once the filter collapses. Swapping a filter is homeowner maintenance, so 'no referral' is defensible, but when a filter looks this neglected, recommending HVAC service is the safer advice because the blower and coil are probably dirty too.",
      report: "The furnace air filter was observed to be heavily loaded and deformed. Recommend replacing the filter and having the system cleaned and serviced by a licensed HVAC contractor.",
    },
    tip: "Note the filter size printed on the frame and the airflow arrow. Filters installed backward are common.",
    nc: "NC SOP .1111(a)(6) includes air filters in the heat distribution system, and .1111(d) requires opening readily openable access panels and reporting whether they were removed.",
  },

  'furnace-flue': {
    title: "Furnace vent connector",
    course: 'hvac',
    defect: {
      observe: "The single-wall metal vent pipe from the furnace has a joint pulled apart by about half an inch, with no screws holding it. The run slopes slightly downhill toward the vent, and there is rust streaking at the joint.",
      severity: 'safety', rec: 'hvac', recAlt: [],
      why: "The vent connector carries combustion gases, including carbon monoxide, out of the house. A separated joint can spill those gases into the laundry room, and a connector that runs downhill fights the natural draft. Generally accepted practice is a rise of at least 1/4 in per foot toward the vent, joints fastened with screws (commonly three per joint), and about 6 in of clearance to combustibles for single-wall pipe. Rust at a joint suggests condensation, which is itself a venting clue.",
      report: "The furnace vent connector has a separated joint and slopes downward toward the vent. This can allow combustion gases, including carbon monoxide, to enter the home. Recommend immediate evaluation and repair by a licensed HVAC contractor.",
    },
    ok: {
      observe: "The vent connector rises steadily from the furnace toward the vent. Each joint is fastened with three sheet-metal screws, and there is no rust or scorching.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "Upward slope, fastened joints, clearance, and no signs of spillage or condensation: the connector is doing its job.",
      report: "The furnace vent connector appeared properly sloped and secured at the time of the inspection.",
    },
    tip: "Look for scorching, soot, or rust around the draft diverter and the joints. Those marks are the history of a vent that has been spilling.",
  },

  'furnace-burners': {
    title: "Furnace burner compartment",
    course: 'hvac',
    ok: {
      observe: "Through the burner compartment's sight window you can make out the burners, but the compartment is too dark to judge.",
      reading: "Flashlight: the burner flames are steady and blue with small, even inner cones. No yellow tips, no flames lifting off the ports or rolling out, and no soot, scorch marks, or rust scale in the compartment.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "Steady blue flames that stay on the burner ports indicate normal combustion. Yellow, lazy flames, soot, rust scale falling from above, or scorch marks at the compartment opening would point to poor combustion or a possible heat exchanger problem, and an HVAC referral. You look through openings the manufacturer provides; you do not disassemble the furnace to see more.",
      report: "The furnace was operated using normal controls. Burner flames observed through the viewing port appeared normal. The heat exchanger is not visible without disassembly and was not inspected.",
    },
    tip: "Watch the flame as the blower starts. A flame that wavers or changes shape when the blower comes on is a classic heat exchanger warning sign.",
    nc: "NC SOP .1111(e)(5)(C): heat exchangers are not required to be inspected. .1111(d): open readily openable access panels and report the method of inspection and whether panels were removed.",
  },

  'dryer-duct': {
    title: "Dryer exhaust duct",
    course: 'appliances',
    defect: {
      observe: "Behind the dryer, a silvery foil accordion duct runs to the wall, sagging into loops and crushed flat where the dryer was pushed back. Lint is packed around the joint at the dryer.",
      severity: 'safety', rec: 'contractor', recAlt: ['appliance'],
      why: "Dryer fires are mostly lint fires. Foil accordion duct traps lint in its ridges, crushes easily, and can tear or melt, and a crushed duct makes the dryer run hotter and longer. Generally accepted practice is smooth rigid or semi-rigid metal duct, as short and straight as possible. Some manufacturers allow a short, listed flexible transition duct between dryer and wall, but never one that is concealed or crushed like this.",
      report: "The clothes dryer is vented with flexible foil duct that is crushed and lint-laden. This is a fire hazard. Recommend replacement with smooth metal duct and cleaning of the vent system, by a qualified contractor.",
    },
    tip: "Go outside and check the termination too. A running dryer should push the flap open, and the hood should have no screen to catch lint.",
    nc: "NC SOP .1114(a)(3) requires inspecting laundry venting systems.",
  },

  'washer-hoses': {
    title: "Washer supply hoses",
    course: 'plumbing',
    defect: {
      observe: "The washer is fed by black rubber hoses. Near the fitting on the hot side, the hose has a visible bulge, and the rubber is cracked where it bends.",
      severity: 'repair', rec: 'plumber', recAlt: ['appliance'],
      why: "A rubber washer hose holds full water pressure whenever the valves are open, which is usually all the time. A bulge is a weakened wall close to bursting, and a burst hose can release hundreds of gallons an hour until someone shuts it off. Braided stainless hoses, and turning the valves off when away, greatly reduce the risk.",
      report: "The washing machine hot water supply hose is bulging and cracked. Recommend replacement with braided stainless steel hoses.",
    },
    ok: {
      observe: "The washer connects with braided stainless steel hoses with no kinks, bulges, or drips at the fittings.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "Braided hoses in good condition with dry fittings: nothing to report.",
      report: "Washing machine supply hoses were braided stainless steel and no leaks were observed.",
    },
    tip: "Look at the floor behind the washer and the drain standpipe while you are back there. Leaks hide behind laundry machines.",
    nc: "NC SOP .1109(c) excludes faucets whose flow end is connected to an appliance from the requirement to operate fixtures, so you are not required to operate the washer valves.",
  },

  // ───────────────────────────── GARAGE: ELECTRICAL PANEL ─────────────────────────────
  'panel-double-tap': {
    title: "Double-tapped breaker",
    course: 'elec-adv',
    defect: {
      observe: "On one single-pole breaker, two separate wires are clamped under the one terminal screw.",
      severity: 'safety', rec: 'electrician', recAlt: [],
      why: "Most breaker terminals are designed and listed for a single conductor. With two, the screw clamps tightly on one and loosely on the other, and a loose connection heats, arcs, and can start a fire inside the panel. A few breaker models are listed for two conductors and are marked that way, which is why you check the breaker's labeling before you write it up. The fix is usually a pigtail or an added breaker. Some inspectors grade this Repair; the mechanism of harm is fire, so Safety is the stronger call.",
      report: "Two conductors are connected to a single breaker terminal (double tap). Unless the breaker is listed for two conductors, this can result in loose connections and overheating. Recommend evaluation and correction by a licensed electrician.",
    },
    tip: "Check the neutral bar too. Two neutrals under one screw is a separate, commonly reported defect.",
    nc: "NC SOP .1110(a)(4) requires inspecting branch circuit conductors, their overcurrent devices, and the compatibility of their ampacities at the panel interior.",
  },

  'panel-knockouts': {
    title: "Dead front openings",
    course: 'elec-adv',
    defect: {
      observe: "With the dead front back on, two breaker slots are open with no filler plates. You can see the bus bar stabs through the gaps.",
      severity: 'safety', rec: 'electrician', recAlt: [],
      why: "The dead front is the barrier between fingers and energized parts. An open slot lets anyone touching the panel reach the bus, and lets sparks out of the enclosure if something fails. Filler plates matched to the panel brand are inexpensive.",
      report: "Open breaker knockout slots were observed in the panel dead front, exposing energized parts. This is a shock hazard. Recommend installing approved filler plates by a licensed electrician.",
    },
    ok: {
      observe: "Every opening in the dead front is filled by a breaker handle or a filler plate.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "No openings to energized parts. That is exactly what a dead front is for.",
      report: "The panel dead front was intact with no open knockouts.",
    },
    tip: "Check the dead front before you remove it and after you replace it. Make sure all its screws are blunt-tipped panel screws, not sharp sheet-metal screws that can pierce wires.",
  },

  'panel-white-hot': {
    title: "White conductors used as hots",
    course: 'elec-adv',
    defect: {
      observe: "A white wire is landed on a single-pole breaker. It has no black or red tape or marking anywhere along its length.",
      severity: 'repair', rec: 'electrician', recAlt: [],
      why: "White insulation is reserved for the grounded (neutral) conductor. A white wire on a single-pole breaker is either a misused neutral or a cable conductor used as a hot without being re-identified, and it misleads the next person into treating a live wire as a neutral. Re-identification with tape or paint is permitted when a cable's white is used as a hot, as on many 240-volt circuits.",
      report: "A white conductor connected to a breaker was observed without re-identification as an ungrounded (hot) conductor. Recommend evaluation and correction by a licensed electrician.",
    },
    ok: {
      observe: "A white wire from a two-conductor cable is landed on one pole of a double-pole 240-volt breaker. It is wrapped with black tape near its end.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "This is a permitted use: in a two-conductor cable feeding a 240-volt load, the white serves as a hot and is re-identified with tape. Knowing this keeps you from over-calling a correct installation.",
      report: "Branch conductors at the panel appeared properly identified.",
    },
    tip: "Follow the white back to the cable it came from. If its black partner is on the other pole of the same breaker, you are probably looking at a 240-volt circuit.",
  },

  'panel-labeling': {
    title: "Circuit directory",
    course: 'elec-adv',
    defect: {
      observe: "The circuit directory on the panel door is blank except for 'Range' and 'A/C' written in pencil. Most breakers have no label at all.",
      severity: 'repair', rec: 'electrician', recAlt: ['none'],
      why: "In an emergency, or during a repair, people need to know which breaker shuts off which circuit. Unlabeled panels lead to people working on circuits they believe are off. Labeling means tracing each circuit; an electrician can do it, and so can a careful owner, which is why both referrals are accepted.",
      report: "The electrical panel circuit directory is incomplete. Recommend accurately labeling all circuits; a licensed electrician can assist.",
    },
    tip: "Do not trust a directory you did not verify. Labels go stale every time someone remodels.",
  },

  'panel-rust': {
    title: "Panel interior condition",
    course: 'elec-adv',
    defect: {
      observe: "Inside the panel, rust streaks run down from where the service entrance cable enters the top. The neutral bar screws and several breaker terminals are crusted with corrosion, and there are dried water marks on the bottom of the enclosure.",
      severity: 'safety', rec: 'electrician', recAlt: [],
      why: "Water is getting into the panel, usually down the service entrance cable or through an unsealed top entry. Corrosion raises resistance at connections, which makes heat, and can keep breakers from operating properly. The water source must be found and sealed and the corroded parts evaluated; sometimes the result is panel replacement.",
      report: "Rust, corrosion, and evidence of water entry were observed inside the main electrical panel. This is a safety concern. Recommend evaluation and repair by a licensed electrician, including sealing the source of water entry.",
    },
    ok: {
      observe: "The panel interior is dry and clean, with only light dust. Terminals are bright, and the service cable entry at the top is sealed.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "A dry, clean interior with sound connections and a sealed entry is what you want. Dust alone is not a defect.",
      report: "The main panel interior was observed to be dry with no evidence of corrosion or water entry.",
    },
    tip: "Rust streaks point uphill to the source. Follow them to the top of the panel, then go outside and look at the service entrance.",
  },

  'panel-aluminum-sec': {
    title: "Aluminum service entrance conductors",
    course: 'elec-adv',
    ok: {
      observe: "The service entrance conductors entering the main breaker are stranded aluminum, dull silver in color, coated with gray antioxidant compound at the lugs. There is no discoloration or melted insulation.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "Stranded aluminum service entrance conductors are normal and widely used. They are sized larger than copper for the same ampacity and terminate on lugs rated for aluminum. That is a different thing from single-strand (solid) aluminum branch circuit wiring of the late 1960s and 1970s, which is a known fire concern. Do not confuse the two.",
      report: "Service entrance conductors are stranded aluminum. No deficiencies were observed at the service terminations.",
    },
    tip: "Look for 'AL/CU' or 'AL' markings on the main lugs. They tell you the lugs are rated for aluminum.",
    nc: "NC SOP .1110(b)(2) requires describing service entry conductor materials, and .1110(c) requires reporting in writing any readily accessible single-strand aluminum branch circuit wiring. Stranded aluminum service conductors are described, not called a defect.",
  },

  'panel-breaker-heat': {
    title: "Breakers under load",
    course: 'elec-adv',
    defect: {
      observe: "The breakers all look the same: no discoloration, no odor, and every handle is in the ON position.",
      reading: "Thermal camera: with the A/C and range running, one breaker reads about 38°F hotter than its neighbors, with the hot spot concentrated at its terminal.",
      severity: 'safety', rec: 'electrician', recAlt: [],
      why: "A loaded breaker runs warmer than an idle one, so compare similar breakers under similar load. A hot spot concentrated at a terminal points to a loose or corroded connection or a failing breaker, both of which can lead to arcing and fire. Thermal imaging is a screening tool, not a diagnosis: report the anomaly and let the electrician measure the load and check the connection.",
      report: "Thermal imaging identified one breaker operating at a significantly higher temperature than adjacent breakers under load. This may indicate a loose connection or failing breaker and is a potential fire hazard. Recommend evaluation by a licensed electrician.",
    },
    ok: {
      observe: "The breakers all look the same: no discoloration, no odor, and every handle is in the ON position.",
      reading: "Thermal camera: breaker temperatures are uniform within a few degrees. Loaded breakers are only slightly warmer than idle ones, and there are no hot spots at terminals.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "Small, even temperature differences that follow the load are normal. No anomaly means no finding.",
      report: "No thermal anomalies were observed at the panel at the time of the inspection.",
    },
    tip: "Thermal needs load. A loose terminal on a circuit that is switched off looks perfectly normal, so turn things on before you scan.",
  },

  // ───────────────────────────── GARAGE: WATER HEATER ─────────────────────────────
  'wh-tpr-discharge': {
    title: "TPR valve discharge",
    course: 'water-heater',
    defect: {
      observe: "The temperature and pressure relief (TPR) valve's discharge pipe stops well above the garage floor, its open end pointing out toward where a person would stand.",
      severity: 'safety', rec: 'plumber', recAlt: [],
      why: "If controls fail, a water heater can overheat; when the TPR valve opens, it releases scalding water and steam. The discharge pipe exists to direct that safely: full size of the valve outlet, no threads on the end, no valve in it, draining by gravity, and terminating within about 6 in of the floor, or at an approved drain or the exterior. A pipe that ends at knee or waist height sprays scalding water on whoever is nearby. Do not test the TPR valve during an inspection; it may not reseat.",
      report: "The water heater temperature and pressure relief valve discharge pipe terminates well above the floor. This is a scalding hazard. Recommend extending the discharge pipe to within 6 inches of the floor or to an approved location, by a licensed plumber.",
    },
    tip: "Check the discharge pipe material too. It should be rated for hot water; a garden hose or thin plastic tube on a TPR valve is a defect.",
    nc: "NC SOP .1109(a)(3) includes automatic safety controls in the hot water system inspection, while .1109(d)(3) says you are not required to operate them.",
  },

  'wh-age': {
    title: "Water heater age",
    course: 'water-heater',
    defect: {
      observe: "The data plate on the tank shows a manufacture date of 2009. The heater is working: the burner lights and the water at the kitchen tap runs hot.",
      severity: 'monitor', rec: 'plumber', recAlt: ['none'],
      why: "Tank-type gas water heaters commonly last somewhere around 8 to 12 years, depending on water quality and maintenance. At roughly 17 years, this one is well past that range. Age is not a malfunction: the heater is functioning as intended, so this is a budgeting item, not a repair. The risk is a tank leak; a garage location limits the damage, but buyers should plan for replacement. Some inspectors grade it Major as end of life; Monitor fits a unit that still works.",
      report: "The water heater data plate indicates a manufacture date of 2009, making the unit approximately 17 years old, which is beyond the typical service life of tank-type water heaters. It was functioning at the time of the inspection. Recommend budgeting for replacement; a licensed plumber can advise.",
    },
    tip: "If there is no printed date, the serial number usually encodes it. Learn the common manufacturers' formats.",
    nc: "NC SOP .1105(a)(1) and (b)(11): inspectors are not required to report the life expectancy of components or predict future failure. Reporting the manufacture date is still useful, and since the summary page (G.S. 143-151.58(a1)) is for components that do not function as intended, a working but old heater does not have to be listed there.",
  },

  'wh-elevation': {
    title: "Ignition source height",
    course: 'water-heater',
    defect: {
      observe: "The gas water heater sits directly on the garage slab. Its burner and pilot opening are only a few inches above the floor.",
      severity: 'safety', rec: 'plumber', recAlt: [],
      why: "Gasoline vapor is heavier than air and collects near a garage floor, where an open burner or pilot can ignite it. The traditional rule raises the ignition source at least 18 in above the garage floor. Many gas water heaters built since the mid-2000s are listed as flammable vapor ignition resistant (FVIR), and model codes accept that listing in place of elevation, so look for an FVIR label before you call it. Either way, the heater should be protected from vehicle impact.",
      report: "The gas water heater rests on the garage floor with its ignition source less than 18 inches above the floor, and no flammable vapor ignition resistant (FVIR) listing was confirmed. This is a fire hazard. Recommend evaluation by a licensed plumber.",
    },
    ok: {
      observe: "The water heater stands on a sturdy platform, with its burner opening about 18 in above the garage floor.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "Raised 18 in, the ignition source is above the layer where heavy fuel vapors collect. Also check that the platform is solid and that a car cannot hit the heater.",
      report: "The water heater is elevated on a platform in the garage. No deficiencies were observed regarding ignition source height.",
    },
    tip: "Read the label before you write it up. An FVIR-listed heater on the floor is a different finding than an older unit on the floor.",
  },

  'wh-sediment-trap': {
    title: "Gas drip leg",
    course: 'water-heater',
    defect: {
      observe: "The gas line drops straight into the water heater's gas control valve. There is no tee with a capped pipe extending down below it.",
      severity: 'repair', rec: 'plumber', recAlt: ['hvac'],
      why: "A drip leg (sediment trap) is a short capped pipe below a tee just ahead of the appliance. Debris and moisture in the gas line fall into it instead of fouling the gas valve and burner orifices. Fuel gas codes and most installation instructions call for one at appliances such as water heaters and furnaces (ranges and dryers are commonly exempt). Gas piping is done by licensed plumbers and by HVAC or fuel piping contractors, so either referral is reasonable.",
      report: "No sediment trap (drip leg) was observed on the gas supply at the water heater. Recommend installation by a licensed plumber or gas piping contractor.",
    },
    ok: {
      observe: "A tee is installed in the gas supply just ahead of the control valve, with a short capped nipple extending down below it.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "That capped leg is the sediment trap, installed where it belongs, just ahead of the appliance.",
      report: "A sediment trap is present on the gas supply at the water heater.",
    },
    tip: "While you are looking at the gas line, find the appliance shutoff valve and note it. Every gas appliance should have one within reach.",
  },

  'wh-draft-hood': {
    title: "Draft hood and vent",
    course: 'water-heater',
    ok: {
      observe: "The draft hood sits centered on top of the tank with its legs seated. The vent connector rises from it with screws at each joint, and there are no scorch marks or melted plastic on the tank top.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "The draft hood lets room air mix with flue gases to stabilize draft. Scorching, rust, or melted plastic around the hood would point to backdrafting, with combustion gases spilling into the garage. None of that here.",
      report: "The water heater draft hood and vent connector appeared properly installed with no evidence of backdrafting at the time of the inspection.",
    },
    tip: "After the burner has run a few minutes, hold a mirror near the hood rim. A mirror that fogs means flue gases are spilling out.",
  },

  // ───────────────────────────── GARAGE: DOORS & SEPARATION ─────────────────────────────
  'fire-door-closer': {
    title: "Garage door self-closer",
    course: 'sop-25',
    defect: {
      observe: "The door between the garage and the house hangs on three plain butt hinges. There is no spring hinge or closer, and when you let go of the open door, it stays where it is.",
      severity: 'safety', rec: 'contractor', recAlt: [],
      why: "The garage-to-house door is part of the fire and fume separation, and it only works when it is closed. A self-closing door keeps car exhaust and a garage fire out of the house when someone forgets to close it. Current model codes call for this door to be self-closing, but many older homes, like this 1987 house, predate that, so report it as a safety upgrade. Spring hinges are an inexpensive fix.",
      report: "The door between the garage and the living space is not self-closing. Recommend installing self-closing hinges or a closer as a safety upgrade, by a qualified contractor.",
    },
    ok: {
      observe: "Opened fully and released, the door swings closed and latches on its own, pulled by spring hinges.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "A self-closing, latching door keeps the separation intact without relying on anyone remembering. That is the condition you want.",
      report: "The garage-to-house door is self-closing and latched when tested.",
    },
    tip: "Test from fully open and from halfway. Weak spring hinges often close a door partway and stop short of the latch.",
  },

  'fire-door-pet': {
    title: "Pet door in garage-to-house door",
    course: 'sop-25',
    defect: {
      observe: "The solid door between the garage and the house has a plastic pet door cut into its lower panel, with a flexible flap.",
      severity: 'safety', rec: 'contractor', recAlt: [],
      why: "Cutting a pet door through the garage-to-house door defeats its fire and fume separation: the plastic flap burns through quickly, and it lets exhaust in every time the car runs. This door should be solid wood or steel about 1-3/8 in thick, or a 20-minute fire-rated door, with no openings cut through it.",
      report: "A pet door has been installed in the door between the garage and the living space, compromising the fire separation. This is a safety hazard. Recommend replacing the door with a solid or fire-rated door, by a qualified contractor.",
    },
    tip: "Look at the top and hinge edge of the door for a fire rating label. It tells you what the door was before someone modified it.",
  },

  'door-auto-reverse': {
    title: "Garage door auto-reverse",
    course: 'sop-25',
    defect: {
      observe: "With the opener closing the door, you meet the bottom edge with firm, steady resistance. The door keeps pressing down instead of stopping and reversing.",
      severity: 'safety', rec: 'garage-door', recAlt: [],
      why: "A closing garage door is heavy, and the auto-reverse feature is what keeps it from crushing a child or pet. Federal safety requirements since the early 1990s have required openers to reverse on contact and to have an external entrapment sensor, usually photo-eyes. Often the fix is a force or limit adjustment; an opener that cannot be adjusted to reverse should be replaced.",
      report: "The garage door opener did not reverse when meeting resistance during closing. This is an entrapment hazard. Recommend evaluation and repair or replacement by a qualified garage door technician.",
    },
    tip: "Test contact reverse and the photo-eyes separately; they are two different safety systems. Keep a hand on the wall button so you can stop the door instantly.",
    nc: "NC SOP .1107(b)(4) requires reporting whether or not any garage door operator will automatically reverse or stop when meeting reasonable resistance during closing.",
  },

  'door-photo-eyes': {
    title: "Garage door photo-eyes",
    course: 'sop-25',
    defect: {
      observe: "The photo-eye sensors are mounted on the door tracks about 3 ft above the floor, aimed at each other across the opening.",
      severity: 'safety', rec: 'garage-door', recAlt: [],
      why: "Photo-eyes stop and reverse the door when something breaks the beam. They exist to catch a small child or pet under the door, so manufacturers require them low, generally no more than about 6 in above the floor. At 3 ft, a toddler can be under the beam. Owners often raise them to stop false trips; they should be lowered and realigned.",
      report: "The garage door photo-eye sensors are mounted approximately 3 feet above the floor, higher than the manufacturer-specified height of about 6 inches or less. This is an entrapment hazard. Recommend correction by a qualified garage door technician.",
    },
    ok: {
      observe: "The sensors are mounted on each track about 5 in above the floor, their indicator lights steady. Passing your foot through the beam stops and reverses the closing door.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "Low, aligned, and working when tested: the sensors protect the zone where a child or pet would actually be.",
      report: "The garage door photo-eye sensors are installed and reversed the door when the beam was interrupted.",
    },
    tip: "Break the beam with your foot, not a box. You are testing whether it sees something the size of a small child near the floor.",
  },

  'firewall-penetration': {
    title: "Garage-to-house wall separation",
    course: 'sop-25',
    defect: {
      observe: "On the garage side of the common wall there is a ragged hole about 4 in across around a pipe, leaving the stud bay open to view.",
      severity: 'safety', rec: 'contractor', recAlt: [],
      why: "The drywall on the garage side of the house wall is the fire separation between where cars and fuel are kept and where people sleep. The commonly taught minimum is 1/2-in gypsum board on the garage side of walls separating the garage from the house, with 5/8-in Type X under habitable rooms above. An unsealed hole lets fire and fumes bypass that barrier. A drywall patch or fire-rated sealant is the usual repair.",
      report: "An unsealed penetration was observed in the drywall separating the garage from the living space. This compromises the fire separation. Recommend repair with appropriate materials by a qualified contractor.",
    },
    ok: {
      observe: "The drywall on the common wall is continuous and taped, and the one pipe penetration is sealed tight with fire-rated sealant.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "Continuous gypsum with sealed penetrations keeps the separation intact. That is the standard you are checking against.",
      report: "The garage-to-house separation wall was observed to be intact.",
    },
    tip: "Look high as well as low. Attic access hatches and duct penetrations in the garage ceiling are part of the same separation.",
  },

  // ───────────────────────────── ATTIC ─────────────────────────────
  'insulation-depth': {
    title: "Attic insulation depth",
    course: 'attic-interior',
    defect: {
      observe: "You stand the attic ruler in the loose-fill insulation between the ceiling joists in several spots. It reads about 3 in everywhere, and the tops of the ceiling joists are fully exposed.",
      severity: 'repair', rec: 'contractor', recAlt: [],
      why: "About 3 in of loose fill is a small fraction of what current energy guidance suggests for central North Carolina's climate, which is on the order of R-38, often 10 or more inches depending on the material. It is not a safety hazard, but it costs the owner comfort and energy every month, and exposed joists act as thermal bridges. Air sealing the ceiling before adding insulation is the usual advice.",
      report: "Attic insulation is loose-fill with an average depth of approximately 3 inches, which is low by current standards. Recommend evaluation by a qualified insulation contractor for air sealing and additional insulation.",
    },
    tip: "Measure in several places away from the hatch. Insulation near the access is always the most disturbed and the least representative.",
    nc: "NC SOP .1114(b) requires describing insulation in unfinished spaces and the absence of insulation at conditioned surfaces, while .1105(b)(9) says you are not required to determine R-values. Report type and approximate depth.",
  },

  'insulation-void': {
    title: "Insulation coverage",
    course: 'attic-interior',
    defect: {
      observe: "The insulation surface looks fairly even from where you stand, with a few low spots toward the far wall.",
      reading: "Thermal camera: a sharp-edged rectangle roughly 2 by 3 ft near the far wall reads markedly different from the surrounding insulation, matching a spot where the insulation has been pushed aside down to bare drywall.",
      severity: 'repair', rec: 'contractor', recAlt: [],
      why: "A void is a thermal shortcut: heat flows through a small bare patch far faster than through the insulated area around it, and voids are common where someone has walked or worked in an attic. Thermal imaging needs a meaningful temperature difference between inside and outside to show this well. Confirm what the camera shows by looking at the spot before you write it up.",
      report: "An area of missing insulation was observed in the attic near the far wall, confirmed with thermal imaging and visual inspection. Recommend restoring insulation coverage by a qualified contractor.",
    },
    ok: {
      observe: "The insulation surface looks fairly even from where you stand, with a few low spots toward the far wall.",
      reading: "Thermal camera: the insulated ceiling plane reads evenly between the joists. The joist lines show as the expected thermal stripes, and there are no sharp-edged anomalies.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "Uniform readings with only the expected joist pattern mean coverage is continuous, even if shallow. The low spots are surface texture, not voids.",
      report: "Thermal imaging did not identify significant voids in the attic insulation coverage at the time of the inspection.",
    },
    tip: "A thermal camera shows temperature, not insulation. Always explain the anomaly with something you can see or measure.",
  },

  'bath-fan-termination': {
    title: "Bath fan duct termination",
    course: 'attic-interior',
    defect: {
      observe: "Following the bath fan's flexible duct across the attic, you find it ends in the insulation a few feet from the fan, pointing at nothing. The decking above that spot has faint dark staining.",
      severity: 'repair', rec: 'contractor', recAlt: [],
      why: "A bath fan is supposed to take moist air out of the house. Ending its duct in the attic delivers that moisture into the coldest space in the building, where it condenses on the decking and nails and feeds mold and rot. The duct should run to a dedicated exterior termination, such as a roof or wall cap with a damper, not just aimed toward a soffit or ridge vent.",
      report: "The bathroom exhaust fan duct terminates in the attic rather than at the exterior, and staining was observed on the roof decking above. Recommend extending the duct to a proper exterior termination, by a qualified contractor.",
    },
    tip: "Follow every exhaust duct to its end: bath, kitchen, and dryer. The termination is where the defects hide.",
    nc: "NC SOP .1114(a)(3) requires inspecting kitchen, bathroom, and laundry venting systems.",
  },

  'sheathing-stain': {
    title: "Roof decking stain",
    course: 'moisture',
    defect: {
      observe: "On the underside of the roof decking near the plumbing vent there is a dark, irregular stain, with a water trail running downslope along a rafter.",
      reading: "Moisture meter: 26% WME at the stain, elevated relative to the 12% reference on dry decking nearby.",
      severity: 'repair', rec: 'roofer', recAlt: [],
      why: "Wood moisture above about 19% is conducive to decay fungi. A wet reading at a roof penetration points to an active leak, most likely at the vent boot or flashing directly above. Match the stain to what you saw on the roof; that pairing makes your report credible.",
      report: "A water stain with elevated moisture readings was observed on the roof decking near the plumbing vent, indicating an active roof leak. Recommend evaluation and repair by a qualified roofing contractor.",
    },
    ok: {
      observe: "On the underside of the roof decking near the plumbing vent there is a dark, irregular stain, with a water trail running downslope along a rafter.",
      reading: "Moisture meter: 11% WME at the stain, the same as the reference on dry decking. Dry at the time of inspection.",
      severity: 'monitor', rec: 'none', recAlt: ['roofer'],
      why: "A dry stain at a penetration is evidence of a past leak; boots get replaced and the stain stays. Report it, note it was dry, and recommend monitoring, especially after heavy rain. If the roof above showed a fresh repair, say so.",
      report: "A water stain was observed on the roof decking near the plumbing vent. Moisture readings were dry at the time of the inspection. Recommend monitoring for evidence of active leakage, particularly after heavy rain.",
    },
    tip: "Inspect the attic during or right after rain when you can. A dry day can hide a leak that only shows in a storm.",
    nc: "NC SOP .1108(a)(5) and .1106(c)(4) require inspecting and reporting signs of leaks or abnormal condensation on building components.",
  },

  'sheathing-microbial': {
    title: "Dark decking near the eave",
    course: 'attic-interior',
    defect: {
      observe: "Near the eave on the north slope, the decking looks darker than elsewhere in the attic, but in the dim light you cannot tell whether it is discoloration or shadow.",
      reading: "Flashlight: black, speckled growth across several sheets of decking near the eave, fuzzy in spots, with rust on the protruding nail tips. The eave below it is packed with insulation.",
      severity: 'repair', rec: 'contractor', recAlt: ['roofer'],
      why: "This pattern, concentrated on the colder north slope near blocked eaves, is the signature of attic condensation: warm, moist air meets cold decking and condenses, feeding microbial growth and rusting nails. The cure is ventilation and control of moisture sources, such as cleared soffits and bath fans vented outside, not just cleaning. Describe it as microbial-like growth and refer; identifying mold is outside a home inspection.",
      report: "Dark staining consistent with microbial growth and rusted nail tips were observed on the roof decking near the north eave, indicating attic condensation. Recommend evaluation of attic ventilation and moisture sources by a qualified contractor. Further evaluation by an environmental professional may be considered.",
    },
    ok: {
      observe: "Near the eave on the north slope, the decking looks darker than elsewhere in the attic, but in the dim light you cannot tell whether it is discoloration or shadow.",
      reading: "Flashlight: the dark area is simply a darker sheet of plywood with its natural grain. The surface is smooth, dry, and clean, and the nail tips are bright.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "Plywood and OSB vary in color from sheet to sheet. With no fuzz, no staining pattern, bright nails, and dry wood, there is no evidence of condensation. Light it up before you call it.",
      report: "Roof decking in the attic was observed to be in serviceable condition with no evidence of abnormal condensation.",
    },
    tip: "Look at the nail tips poking through the decking. Rusty tips are a moisture history written in steel.",
    nc: "NC SOP .1105(b)(7): inspectors are not required to determine the presence or absence of mold or other environmental hazards, but .1106(c)(4) still requires reporting signs of abnormal or harmful condensation.",
  },

  'truss-cut': {
    title: "Cut truss web",
    course: 'structural',
    defect: {
      observe: "One diagonal web member of a roof truss has been cut through and removed to make room for a duct. Two short stubs are still attached at the metal gusset plates.",
      severity: 'major', rec: 'structural', recAlt: [],
      why: "A truss is an engineered system where every web carries load in tension or compression. Removing one can overload the remaining members and lead to sagging or failure, and the effect can take years to show. Repairs must be designed by an engineer or the truss manufacturer, not improvised with a scrap of lumber.",
      report: "A roof truss web member was observed to be cut and removed. Modifying engineered trusses can compromise their structural integrity. Recommend evaluation and a repair design by a licensed structural engineer.",
    },
    tip: "Check the roofline from outside for a dip above the altered truss. It tells you whether the cut has already had an effect.",
  },

  'soffit-baffles': {
    title: "Eave ventilation path",
    course: 'attic-interior',
    defect: {
      observe: "At the eaves, insulation is stuffed tight against the underside of the roof decking. You cannot see daylight from the soffit vents, and there are no baffles holding the insulation back.",
      severity: 'repair', rec: 'contractor', recAlt: [],
      why: "Attic ventilation depends on air entering low at the soffits and leaving high at the ridge. Insulation blocking the soffits shuts off the intake, so the ridge vent cannot draw, and heat and moisture build up near the cold eaves, exactly where condensation stains show up. Baffles, also called rafter vents, hold a channel open above the insulation.",
      report: "Insulation is blocking the soffit vents at the eaves, and no baffles are installed. This restricts attic ventilation. Recommend installing baffles and clearing the vent path, by a qualified contractor.",
    },
    ok: {
      observe: "Foam baffles run up from the top of the wall between the rafters, keeping a clear channel above the insulation. You can see daylight from the soffit vents.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "An open intake path at every rafter bay lets the ventilation system work as designed.",
      report: "Soffit ventilation baffles are installed and the intake path appeared clear.",
    },
    tip: "Turn off your flashlight at the eave for a moment. Daylight from the soffit is the simplest test of an open vent path.",
  },

  'attic-duct-joint': {
    title: "Supply duct connection",
    course: 'hvac',
    defect: {
      observe: "At a ceiling register boot, the flexible supply duct has pulled off the collar and lies an inch or two away. With the air handler running, you feel conditioned air blowing into the attic.",
      severity: 'repair', rec: 'hvac', recAlt: [],
      why: "A disconnected supply duct conditions the attic instead of the room. It wastes energy, starves the room it served, and in humid weather cold air causes condensation on the boot, drywall, and insulation. Proper connections pull the inner liner over the collar, secure it with a tie strap, and seal it with mastic or listed tape.",
      report: "An attic supply duct is disconnected at the register boot, discharging conditioned air into the attic. Recommend reconnecting and sealing the duct by a licensed HVAC contractor.",
    },
    ok: {
      observe: "The flex duct's inner liner is pulled over the boot collar and secured with a tie strap, the outer jacket is strapped over it, and the joint is sealed.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "Liner strapped, jacket strapped, joint sealed: that is a connection that will stay put and not leak.",
      report: "Attic supply duct connections observed appeared secure.",
    },
    tip: "Find the room that feels weak on airflow downstairs, then look for its duct in the attic. The two usually go together.",
  },

  'open-splice': {
    title: "Attic cable splice",
    course: 'elec-res',
    defect: {
      observe: "Two lengths of sheathed cable lie on the attic floor, joined by twisted wires wrapped in electrical tape. There is no junction box.",
      severity: 'safety', rec: 'electrician', recAlt: [],
      why: "Splices must be enclosed in an accessible junction box with a cover, so that heat or arcing from a loose connection is contained and the splice is protected from damage. A taped splice buried in combustible insulation is a fire hazard. A box, proper connectors, and cable clamps are the fix.",
      report: "An open wire splice without a junction box was observed in the attic. This is a fire and shock hazard. Recommend correction by a licensed electrician.",
    },
    tip: "Do not touch or move suspect wiring in an attic. Look, photograph, and report.",
  },

  'rodent-activity': {
    title: "Attic floor near gable",
    course: 'attic-interior',
    defect: {
      observe: "On the attic floor near the gable, the insulation surface has some dark marks and an uneven texture you cannot make out in the dim light.",
      reading: "Flashlight: trails and tunnels through the insulation, dark rice-sized droppings concentrated along the top of the wall, and gnaw marks on a nearby cable sheath.",
      severity: 'repair', rec: 'pest', recAlt: ['contractor'],
      why: "Rodents contaminate insulation, chew wiring (a fire risk), and get in through gaps that also let in weather. Droppings along a path mean there is a route; the entry is often a gable vent screen or a gap where the roof meets the wall. Avoid disturbing droppings, and wear a respirator when you are near them. The chewed cable deserves its own line in the report.",
      report: "Evidence of rodent activity, including droppings, tunneling in the insulation, and gnawed cable sheathing, was observed in the attic near the gable. Recommend evaluation and exclusion by a licensed pest control professional, and evaluation of damaged wiring by a licensed electrician.",
    },
    ok: {
      observe: "On the attic floor near the gable, the insulation surface has some dark marks and an uneven texture you cannot make out in the dim light.",
      reading: "Flashlight: the marks are dust and a few bits of fallen wood debris. The insulation is undisturbed, with no droppings, trails, or nesting.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "Attics collect dust and construction debris. Without droppings, trails, or nesting material, there is no evidence of activity, and saying otherwise would be an over-call.",
      report: "No evidence of rodent activity was observed in the accessible areas of the attic.",
    },
    tip: "Shine your light low and flat across the insulation. Trails and tunnels show up as shadows.",
    nc: "NC SOP .1105(a)(9): inspectors are not required to report on the presence or absence of pests such as wood-damaging organisms, rodents, or insects. You may still report what you see, and with chewed wiring present you should.",
  },

  // ───────────────────────────── CRAWLSPACE ─────────────────────────────
  'vapor-barrier': {
    title: "Crawlspace vapor retarder",
    course: 'crawl-adv',
    defect: {
      observe: "The plastic ground cover is torn in several places and pulled back from the walls, leaving large areas of bare, damp soil exposed, especially around the piers.",
      severity: 'repair', rec: 'contractor', recAlt: [],
      why: "Bare crawlspace soil releases a great deal of water vapor, raising humidity, wetting the wood above, and feeding mold and wood-destroying insects. A vapor retarder (commonly 6-mil polyethylene) covering the soil, lapped at the seams and run up the walls and piers a little, cuts that dramatically. It is one of the most common and most cost-effective fixes in NC crawlspaces.",
      report: "The crawlspace vapor retarder is damaged and incomplete, leaving areas of soil exposed. Recommend repair or replacement of the vapor retarder to provide full ground coverage, by a qualified contractor.",
    },
    tip: "Lift the edge of the plastic near a wall. What is under it, dry soil, wet soil, or standing water, tells you more than the plastic itself.",
    nc: "NC SOP .1114(a)(1)-(2) requires inspecting vapor retarders in unfinished spaces and the ventilation of foundation areas.",
  },

  'standing-water': {
    title: "Water in crawlspace",
    course: 'crawl-adv',
    defect: {
      observe: "In the low area near the rear wall, water stands in a shallow pool on top of the ground cover. The block wall above it shows a dark, damp band and a line of silt.",
      severity: 'repair', rec: 'contractor', recAlt: [],
      why: "Standing water in a crawlspace is where most crawlspace problems start: high humidity, wet framing, decay, mold, and termites. The source is usually outside, from grading, downspouts, or groundwater, so look back outside at the grade and gutters above this wall. Corrections range from drainage fixes outside to interior drains and a sump. Some inspectors grade this Major; with an unknown source and a silt line showing repeated pooling, that is defensible.",
      report: "Standing water was observed in the crawlspace near the rear foundation wall, with silt and moisture staining on the wall. Recommend evaluation and correction of the water source and crawlspace drainage by a qualified contractor.",
    },
    ok: {
      observe: "The soil under the ground cover near the rear wall is dark and slightly damp to the touch, but there is no standing water, no silt line, and no water marks on the block.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "Slightly damp soil under plastic is typical in NC crawlspaces, especially in humid months. What matters is standing water, silt lines, or water marks showing that water has flowed or pooled. None here.",
      report: "No standing water was observed in the crawlspace at the time of the inspection.",
    },
    tip: "Silt lines and water marks on the wall record past flooding. A dry crawlspace today can still show you last month's storm.",
    nc: "NC SOP .1106(c)(4) requires reporting signs of abnormal or harmful water penetration into the building.",
  },

  'pier-crack': {
    title: "Cracked masonry pier",
    course: 'foundation',
    defect: {
      observe: "A crack runs from top to bottom through the masonry pier, stepping through the mortar joints and splitting one block. It is wide enough to fit a coin, about 1/4 in, and the top course has shifted slightly sideways under the girder.",
      severity: 'major', rec: 'structural', recAlt: [],
      why: "Piers carry concentrated loads from the girders. A wide crack with displacement means the pier is no longer acting as one solid column, often from footing settlement, overload, or poor construction. Look upstairs for the matching symptoms: sloping floors, drywall cracks, binding doors. A structural engineer should evaluate; repairs range from rebuilding the pier to adding a new footing.",
      report: "A significant crack with displacement was observed in a masonry pier supporting the main girder. Recommend evaluation by a licensed structural engineer.",
    },
    tip: "Measure the crack width and photograph it with a ruler in frame. That is the record the next inspector or engineer needs.",
    nc: "NC SOP .1106(a)-(b): inspect and describe the foundation, floor structure, and columns or piers.",
  },

  'pier-shims': {
    title: "Pier-to-girder bearing",
    course: 'foundation',
    defect: {
      observe: "Between the top of the pier and the girder, a stack of wood shingles and scrap boards fills a gap of about 2 in. Several pieces are crushed and split, and one has slipped partly out.",
      severity: 'repair', rec: 'contractor', recAlt: ['structural'],
      why: "Stacked, crushed, or loose wood shims do not give reliable bearing, and untreated wood on masonry absorbs moisture and decays. As the shims crush, the girder settles and the floor above dips. Proper shimming uses solid, non-compressible material set tight, with full bearing under the girder.",
      report: "The girder is supported on the pier by stacked, crushed wood shims. Recommend correction to provide solid bearing by a qualified contractor; a structural engineer may be consulted.",
    },
    ok: {
      observe: "The girder bears fully on a solid cap block on top of the pier, with tight steel shims and no gaps.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "Full bearing on solid, non-compressible material is exactly what the girder needs.",
      report: "Girder bearing at the piers appeared solid.",
    },
    tip: "Tap shims with your awl handle. Solid bearing sounds and feels tight; loose shims rattle or move.",
  },

  'joist-notch': {
    title: "Joist at plumbing run",
    course: 'structural',
    defect: {
      observe: "Where the drain pipe crosses, a joist has a notch cut out of its bottom edge, about one third of the way through its depth, near the middle of its span. The floor above is not visibly sagging yet.",
      severity: 'repair', rec: 'structural', recAlt: ['contractor'],
      why: "The bottom edge of a joist at mid-span carries the most tension, so notching it there is the worst place to cut. The generally taught limits for sawn joists are notches no deeper than 1/6 of the joist depth and never in the middle third of the span, and bored holes no larger than 1/3 of the depth and at least 2 in from the top and bottom edges. A structural engineer can specify a repair, often sistering or a reinforcing plate, which a contractor then installs.",
      report: "A floor joist has been notched at the bottom edge near mid-span to accommodate plumbing. This can reduce the joist's load capacity. Recommend evaluation by a licensed structural engineer and repair as specified.",
    },
    ok: {
      observe: "The drain pipe passes through a neat bored hole in the middle of the joist's depth, a couple of inches across, well away from the top and bottom edges.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "A modest hole near the center of the joist depth sits along the neutral axis, where the wood carries the least stress. That is the accepted way to run pipe through a joist.",
      report: "Floor framing was observed to be in serviceable condition where plumbing passes through the joists.",
    },
    tip: "Remember 'bottom middle is off limits.' The bottom edge in the middle third of a span is never cut.",
  },

  'joist-moisture': {
    title: "Joist wood moisture",
    course: 'moisture',
    defect: {
      observe: "The joists above the low area near the rear wall look sound, with some light surface discoloration.",
      reading: "Moisture meter: 24% WME in the joists above the rear low area, compared with 13% in joists near the front of the crawlspace.",
      severity: 'repair', rec: 'contractor', recAlt: ['pest'],
      why: "Wood moisture above about 19% is conducive to decay fungi and makes wood attractive to wood-destroying insects. A reading in this range means crawlspace moisture is getting into the framing. Probe for softness, and trace the moisture to its source: vapor retarder gaps, standing water, or grading. This measurement turns 'damp crawlspace' into evidence.",
      report: "Elevated wood moisture (approximately 24%) was measured in floor joists near the rear of the crawlspace. Wood moisture above about 19% is conducive to decay and wood-destroying insect activity. Recommend evaluation and correction of crawlspace moisture conditions by a qualified contractor.",
    },
    ok: {
      observe: "The joists above the low area near the rear wall look sound, with some light surface discoloration.",
      reading: "Moisture meter: 13% WME, consistent with joists throughout the crawlspace.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "Readings in the low teens are normal for framing in a vented NC crawlspace. The discoloration is surface staining, not active moisture.",
      report: "Wood moisture readings in the crawlspace framing were within a normal range at the time of the inspection.",
    },
    tip: "Pin meters read wood moisture best on clean wood. Push the pins across the grain and note the species correction if your meter has one.",
  },

  'foundation-crack': {
    title: "Block foundation wall cracking",
    course: 'foundation',
    defect: {
      observe: "A stair-step crack runs diagonally up through the mortar joints of the block wall. It is about 1/4 in wide at its widest, and the blocks above it have shifted slightly outward from the ones below.",
      severity: 'major', rec: 'structural', recAlt: ['contractor'],
      why: "Wide stair-step cracking with displacement says the wall is moving, from differential settlement or soil pressure, not just shrinking. Contrast it with hairline mortar cracks, which are common and usually harmless. Measure the width, check for displacement in any direction, and look for related signs upstairs. Structural engineers evaluate; foundation contractors repair, which is why both referrals are accepted.",
      report: "Stair-step cracking approximately 1/4 inch wide with displacement was observed in the block foundation wall. This may indicate structural movement. Recommend evaluation by a licensed structural engineer.",
    },
    ok: {
      observe: "A few hairline cracks follow the mortar joints of the block wall. They are tight, with no offset, and the wall is plumb.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "Hairline mortar cracks with no width and no displacement are typical of masonry and usually come from shrinkage. Do not turn them into a structural finding.",
      report: "Minor hairline cracking typical of block foundations was observed. No significant displacement was noted.",
    },
    tip: "Width, displacement, and direction, in that order. Those three facts sort cosmetic cracks from structural ones.",
  },

  'efflorescence': {
    title: "White deposits on block",
    course: 'foundation',
    ok: {
      observe: "White, powdery deposits coat parts of the block wall near the bottom. They brush off with a gloved finger, and the block underneath is solid and uncracked.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "This is efflorescence: mineral salt left behind when water moves through masonry and evaporates at the surface. It tells you moisture is passing through the wall, which is worth connecting to the grading and gutters outside, but by itself it is not a structural defect and does not mean the wall is failing. Writing efflorescence up as structural damage is a classic over-call. Some inspectors note it as Monitor for moisture; that is a style choice, not a structural one.",
      report: "White mineral deposits (efflorescence) were observed on the foundation block. Efflorescence indicates moisture movement through the masonry and is common in crawlspaces; it is not, by itself, a structural concern. Maintain good exterior drainage.",
    },
    tip: "Separate the two questions: is the masonry sound (look for spalling and cracks), and where is the water coming from (go outside and look).",
  },

  'termite-tubes': {
    title: "Foundation face below sill",
    course: 'crawl-adv',
    defect: {
      observe: "Along the foundation face below the sill plate, a few thin, earthy lines climb the block. They are hard to read in the shadows.",
      reading: "Flashlight: pencil-width mud tubes run up the block from the soil to the sill plate. One you break open is hollow and damp inside, consistent with subterranean termite activity.",
      severity: 'major', rec: 'pest', recAlt: [],
      why: "Subterranean termites need contact with soil moisture, so they build shelter tubes over foundations to reach wood. Tubes reaching the sill mean they have found a path, and damage inside the sill and joists can be hidden. Refer to a licensed pest control operator for a wood-destroying insect report and treatment, and probe the sill and nearby framing for damage.",
      report: "Mud tubes consistent with subterranean termite activity were observed on the foundation wall extending to the sill plate. Recommend evaluation and treatment by a licensed pest control operator, and evaluation of the framing for concealed damage.",
    },
    ok: {
      observe: "Along the foundation face below the sill plate, a few thin, earthy lines climb the block. They are hard to read in the shadows.",
      reading: "Flashlight: the lines are dried mud splash and mortar drips. There are no tubes or galleries, and the sill plate probes solid.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "Mortar drips and splash marks are common on foundation walls. Lit up and probed, nothing here suggests termite activity.",
      report: "No evidence of wood-destroying insect activity was observed in the accessible areas of the crawlspace. This inspection is not a wood-destroying insect inspection.",
    },
    tip: "Look hardest at pier tops, plumbing penetrations, and the sill along the foundation walls. Termites travel the paths that stay damp.",
    nc: "NC SOP .1105(a)(9): inspectors are not required to report on the presence or absence of wood-damaging organisms. When you see evidence, report it and refer; a separate wood-destroying insect report comes from a licensed pest control operator.",
  },

  'drain-leak': {
    title: "Drain pipe joint",
    course: 'plumbing',
    defect: {
      observe: "Under the bathroom, the drain pipe joint is in deep shadow.",
      reading: "Flashlight: with water running upstairs, the joint is dripping. There are white mineral streaks below it and a wet, darkened patch on the ground cover.",
      severity: 'repair', rec: 'plumber', recAlt: [],
      why: "Drain leaks in crawlspaces can go unnoticed for years, wetting the soil and framing below the bathroom. The method is the lesson: run the fixtures above for functional drainage, then look at the joints below with a light while the water is flowing.",
      report: "An active leak was observed at a drain pipe joint in the crawlspace below the bathroom. Recommend repair by a licensed plumber.",
    },
    ok: {
      observe: "Under the bathroom, the drain pipe joint is in deep shadow.",
      reading: "Flashlight: the joint is dry and clean, with no drips or staining, even after running water upstairs.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "You tested it under flow and it stayed dry. That is a real 'no leak' finding, not an assumption.",
      report: "No leaks were observed at the accessible drain piping in the crawlspace with fixtures operated.",
    },
    tip: "Ask a helper to run the tub and flush the toilet while you are below, or run them yourself right before you go down.",
    nc: "NC SOP .1109(a)(2) includes leaks in the drain, waste, and vent system, and .1114(d)(2) requires moving floor insulation where plumbing drain and waste pipes penetrate floors.",
  },

  'pex-supply': {
    title: "PEX supply lines",
    course: 'plumbing',
    ok: {
      observe: "Red and blue flexible plastic supply lines run along the joists in plastic hangers every few feet, joined with crimped copper rings at brass fittings. The pipe is printed 'PEX' along its length.",
      severity: 'ok', rec: 'none', recAlt: [],
      why: "PEX is a widely used, accepted supply piping. Supported, protected from sunlight, and properly crimped, it is fine. Do not confuse it with polybutylene, usually gray and installed roughly from the late 1970s to the mid-1990s, which has a history of failures and should be reported. In a 1987 house, a PEX repipe like this is often an improvement over the original piping.",
      report: "Water supply piping is PEX. No leaks or deficiencies were observed in the accessible piping.",
    },
    tip: "Read the printing on the pipe. It tells you the material, the standard, and often the manufacturer, which ends the guessing.",
    nc: "NC SOP .1109(b)(1) requires describing water supply and distribution piping materials.",
  },

  'crawl-duct-down': {
    title: "Crawlspace flex duct",
    course: 'hvac',
    defect: {
      observe: "A section of flex supply duct has fallen from its straps and lies on the ground cover. Its outer jacket is torn, and at the far end it has pulled away from the trunk collar.",
      severity: 'repair', rec: 'hvac', recAlt: [],
      why: "A duct lying on the ground gets crushed and wet, and a disconnected one dumps conditioned air into the crawlspace, wasting energy and, in summer, causing condensation on cold duct surfaces and joists. Flex duct should be supported off the ground at regular intervals with wide straps that do not pinch it.",
      report: "A crawlspace supply duct has fallen to the ground, has a torn jacket, and is disconnected at the trunk. Recommend repair, reconnection, and proper support by a licensed HVAC contractor.",
    },
    tip: "Feel for air at duct joints with the system running. In a crawlspace, leaks are easier to feel than to see.",
  },
};

// ───────────────────────────── GLOSSARY ─────────────────────────────
// Terms a trainee meets in this house. Plain-English definitions, no em-dashes.
export const GLOSSARY = [
  { term: "AFCI", def: "Arc-fault circuit interrupter. A breaker or receptacle that detects the electrical signature of dangerous arcing in wiring and shuts the circuit off to prevent fires." },
  { term: "Air admittance valve (AAV)", def: "A one-way valve that lets air into a drain line to protect trap seals where a conventional vent pipe is impractical. Accepted only where the local plumbing code allows it." },
  { term: "Air gap (dishwasher)", def: "A countertop fitting that breaks the connection between the dishwasher drain and the sink drain so dirty water cannot flow back into the dishwasher." },
  { term: "Antioxidant compound", def: "A paste applied to aluminum conductors at their terminals to prevent oxidation and keep the connection tight and cool." },
  { term: "Back-siphonage", def: "Reverse flow of contaminated water into the potable supply caused by a drop in supply pressure. Prevented by vacuum breakers and air gaps." },
  { term: "Baffle (rafter vent)", def: "A channel installed between rafters at the eaves that keeps insulation from blocking soffit vents, preserving the attic ventilation path." },
  { term: "Cross connection", def: "Any physical connection between the drinking water supply and a source of contamination, such as a hose lying in a pool." },
  { term: "Counterflashing", def: "Flashing set into a masonry or wall joint and lapped over the base or step flashing so water cannot run behind it." },
  { term: "Creosote stages", def: "First stage: dry, powdery soot that brushes off. Second stage: flaky, crunchy, puffy deposits. Third stage: a glossy, tar-like glaze that is very hard to remove and very flammable." },
  { term: "Cricket", def: "A small peaked structure on the uphill side of a wide chimney that diverts water around it." },
  { term: "Dead front", def: "The inner cover of an electrical panel that guards energized parts while leaving the breaker handles exposed." },
  { term: "Double tap", def: "Two conductors under a single breaker terminal that is listed for only one. Risks a loose, overheating connection." },
  { term: "Draft hood", def: "The fitting on top of an atmospheric gas water heater that mixes room air with flue gases to stabilize the draft." },
  { term: "Drip edge", def: "Bent metal flashing at roof eaves and rakes that carries water off the shingles past the fascia and protects the decking edge." },
  { term: "Drip leg (sediment trap)", def: "A capped pipe below a tee just ahead of a gas appliance that collects debris and moisture before they reach the gas valve." },
  { term: "Drip loop", def: "The downward loop in service conductors just below the weatherhead that makes rain drip off instead of running into the service mast." },
  { term: "Efflorescence", def: "White, powdery mineral salts left on masonry when water moving through it evaporates. A moisture indicator, not by itself a structural defect." },
  { term: "Emergency escape and rescue opening", def: "A bedroom window or door large enough, and low enough, for an occupant to escape and a firefighter to enter. Sill height is generally limited to 44 in above the floor." },
  { term: "FVIR", def: "Flammable vapor ignition resistant. A listing for gas water heaters designed so flammable vapors near the floor will not be ignited by the burner." },
  { term: "GFCI", def: "Ground-fault circuit interrupter. Trips when current leaving on the hot does not return on the neutral, at an imbalance of a few milliamps, to prevent electrocution." },
  { term: "Girder", def: "A main horizontal beam, usually supported on piers in a crawlspace, that carries the floor joists." },
  { term: "Grounded conductor (neutral)", def: "The circuit conductor intentionally connected to earth at the service, normally white or gray. Not the same as the equipment grounding conductor." },
  { term: "Guard", def: "A barrier along an open-sided walking surface, generally required where the drop exceeds 30 in, commonly at least 36 in high at residential decks, with openings that will not pass a 4-in sphere." },
  { term: "Handrail", def: "A graspable rail along a stair, commonly required where there are four or more risers and mounted about 34 to 38 in above the tread nosings." },
  { term: "Hearth extension", def: "The noncombustible floor area in front of and beside a fireplace opening that catches embers and rolling logs." },
  { term: "High loop", def: "A dishwasher drain hose routed up to the underside of the countertop before it drops to the drain, preventing backflow into the dishwasher." },
  { term: "Insulated glass unit (IGU)", def: "Two or more panes sealed together around the edge with a gas or air space between them. A failed seal shows as fogging between the panes." },
  { term: "Kick-out flashing", def: "A diverter at the bottom of a roof-to-wall intersection that kicks water into the gutter instead of letting it run down behind the siding." },
  { term: "Ledger", def: "The board fastened to the house that supports one end of the deck joists. Ledger separation is a leading cause of deck collapse." },
  { term: "Open ground", def: "A 3-slot receptacle with no equipment grounding conductor connected. Shown on a 3-light tester as 'open ground'." },
  { term: "PEX", def: "Cross-linked polyethylene, a flexible plastic water supply pipe joined with crimp or expansion fittings. Accepted and widely used." },
  { term: "Photo-eyes", def: "The paired infrared sensors at the bottom of garage door tracks that reverse a closing door when the beam is broken. Mounted no more than about 6 in above the floor." },
  { term: "Polybutylene", def: "A gray, sometimes blue, plastic supply pipe used roughly from the late 1970s to the mid-1990s, with a history of failures. Its presence should be reported." },
  { term: "Reversed polarity", def: "Hot and neutral conductors swapped at a receptacle, leaving parts of plugged-in devices energized when switched off." },
  { term: "S-trap", def: "A drain trap that drops straight down after the bend, forming an S. It can siphon its own water seal dry and let sewer gas in." },
  { term: "Service drop", def: "The overhead conductors from the utility pole to the house. Usually owned by the utility." },
  { term: "Service entrance conductors", def: "The conductors from the service point (drop or lateral) to the main disconnect. Stranded aluminum is common and acceptable." },
  { term: "Smoke alarm 10-year rule", def: "Smoke alarms should be replaced 10 years after the manufacture date printed on the back, even if they still pass the test button." },
  { term: "Summary page (NC)", def: "Required by G.S. 143-151.58(a1) for prepurchase inspections of three or more systems. It must describe components that do not function as intended, or that appear not to based on documented evidence and need further examination or a specialist." },
  { term: "TPR valve", def: "Temperature and pressure relief valve on a water heater. Opens to release water if the tank overheats or overpressurizes; its discharge pipe should end within about 6 in of the floor or at an approved location." },
  { term: "Vapor retarder", def: "A material, usually polyethylene sheeting on crawlspace soil, that slows the movement of water vapor into the structure." },
  { term: "Vent connector", def: "The pipe that carries combustion gases from a gas appliance to the chimney or vent. Should rise toward the vent and have secured joints." },
  { term: "WDI / WDO", def: "Wood-destroying insects or organisms, such as subterranean termites and decay fungi. A WDI report is prepared by a licensed pest control operator." },
  { term: "WME", def: "Wood moisture equivalent, the percentage a moisture meter reports. In wood, readings above about 19% are conducive to decay; always compare with a dry reference on the same material." },
];
