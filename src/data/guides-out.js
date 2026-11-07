// OWNER: Henny. Field Guide commentary (see CONTEXT.md §12 and src/data/guides.js).
// Outside zones: exterior, roof, deck, shed, attic, crawl. Every look item reads the same whether
// the part rolled good or bad: it says what good looks like and what bad looks like, and lets the
// player decide. Facts match src/data/checkpoints.js; the answers live there, not here.
export const GUIDES_OUT = {
  // ── EXTERIOR ────────────────────────────────────────────────────────────
  'ext-grading': {
    what: 'The soil strip along the foundation. Its only job here is to move water away from the house, because water that sits at the footing ends up in the crawlspace and the framing.',
    look: [
      { cp: 'grading-slope', text: 'Read how the ground tips at the wall. Good: a steady fall away, about 6 in over 10 ft. Bad: flat or tilted toward the house, water marks on the masonry.' },
      { text: 'Mulch heaped against the wall hides the foundation and holds water. Note any stretch where you cannot see the foundation at all.' },
    ],
    pro: 'Lay a level on the soil running out from the wall. Remember this spot, then check the same wall from inside the crawlspace.',
    watch: 'Tie the finding to the house. The NC SOP covers grading for its effect on the building, not the lawn or the landscaping.',
    terms: [
      { term: 'Negative grade', means: 'Soil that slopes toward the house.' },
      { term: 'Positive grade', means: 'Soil that slopes away from the house.' },
    ],
  },

  'ext-downspout': {
    what: 'The pipe that brings all the rain from one section of roof down to the ground. Where it lets go of that water matters more than the pipe itself.',
    look: [
      { cp: 'downspout-discharge', text: 'Follow the water, not the pipe. Good: carried several feet out, onto ground that keeps it moving away. Bad: released at the wall, with erosion or splash marks below.' },
      { text: 'An extension only works while it is attached. Check that it is connected to the bottom elbow, not just lying somewhere nearby.' },
    ],
    pro: 'Start at the gutter outlet, follow the elbow down, then read the soil under the outlet. Erosion there tells you the history.',
    terms: [
      { term: 'Splash block', means: 'A shallow tray that spreads downspout water away from the wall.' },
      { term: 'Extension', means: 'Pipe added to the bottom elbow to carry water away from the foundation.' },
    ],
  },

  'ext-gutter': {
    what: 'The trough along the front eave that catches roof water and hands it to the downspouts. Gutters fail by overflowing, and the overflow lands on the fascia and at the foundation.',
    look: [
      { cp: 'gutter-debris', text: 'Look into the trough, not just at it. Good: open and draining to the outlet. Bad: debris or growth holding water, or overflow staining on the outside face or fascia.' },
      { text: 'Sight along its length for sags, loose hangers, or a section pulling away from the fascia.' },
    ],
    pro: 'Get your eye level with the gutter lip, from a ladder or the roof edge. Then check the fascia below for staining or soft wood.',
    watch: 'Gritty granules in a gutter are a roof clue, not a gutter defect. Note them, then go read the shingles.',
    terms: [
      { term: 'Fascia', means: 'The trim board along the roof edge that the gutter hangs on.' },
      { term: 'Hanger', means: 'The bracket or spike that holds a gutter to the fascia.' },
    ],
  },

  'ext-siding': {
    what: 'Vinyl lap siding is a rain screen, not a waterproof skin. Some water gets behind it by design and drains down the housewrap, so panels must stay locked and the bottom edge must drain and be visible.',
    look: [
      { cp: 'siding-damage', text: 'Scan the panels at an angle. Good: every panel interlocked and lying in plane. Bad: punctures, cracks, or a panel unhooked from its neighbor and bowing out.' },
      { cp: 'siding-soil-clearance', text: 'Crouch at the lowest course. Good: a clear gap to grade, commonly taught as about 6 in, with masonry showing. Bad: cladding meeting or buried in the ground cover, masonry hidden.' },
    ],
    pro: 'Work the wall from a corner with your eye close to the surface so bows cast shadows. Then crouch and read the bottom course.',
    watch: 'Fading and small shallow dents are cosmetic, and cosmetic damage is not a required report item. Describe the cladding, and save findings for what lets water or pests in.',
    terms: [
      { term: 'Rain screen', means: 'Cladding that sheds most water and lets what gets behind it drain out.' },
      { term: 'Clearance', means: 'The gap between the ground and the bottom of the siding or framing.' },
    ],
  },

  'ext-window': {
    what: 'A double-hung vinyl window with insulated glass: two panes sealed around a spacer with dry air between. The seal is what makes it insulate; the frame and sealant keep water out of the wall.',
    look: [
      { cp: 'window-igu-seal', text: 'View each pane low and against something dark. Good: you see straight through the airspace. Bad: fog, film, or deposits trapped inside the unit, where no cloth can reach.' },
      { cp: 'window-sill-caulk', text: 'Check the sealant at sill and trim. Good: an unbroken joint, flexible and adhered on both sides. Bad: brittle, shrunk, or separated so a card would slide into the gap.' },
    ],
    pro: 'Look at the glass straight on, then from both sides at an angle. Seal haze comes and goes with temperature, so good light and a low angle matter.',
    watch: 'Weathered, crazed sealant tempts an over-call; judge bond and gaps instead. If you see a failed glass seal, report it in plain words.',
    terms: [
      { term: 'IGU', means: 'Insulated glass unit: two or more panes sealed together around a spacer.' },
      { term: 'Sash', means: 'The movable frame that holds the glass.' },
    ],
  },

  'ext-hose-bib': {
    what: 'The outdoor faucet. A hose lying in a puddle, pool, or fertilizer bucket can siphon that liquid back into the drinking water if supply pressure drops, so a small fitting on the spout matters.',
    look: [
      { cp: 'hose-bib-backflow', text: 'Look at the spout. Good: a vacuum breaker device on the outlet, threaded on or built in. Bad: plain hose threads with nothing to stop back-siphonage.' },
      { text: 'Run it: strong flow, clean shutoff, no drip at the stem. Then check the crawlspace below for a leak on the supply pipe.' },
    ],
    pro: 'Unhook the hose so you can see the threads. The NC SOP requires operating every exterior faucet attached to the house.',
    watch: 'Report what you observe at the spout. Whether a device actually works is beyond a visual inspection, so describe what is there, not how well it performs.',
    terms: [
      { term: 'Vacuum breaker', means: 'A fitting that lets air in so water cannot be siphoned backward.' },
      { term: 'Back-siphonage', means: 'Water pulled backward into the supply by a pressure drop.' },
      { term: 'Sillcock', means: 'An exterior wall faucet, often a frost-free type.' },
    ],
  },

  'ext-service-drop': {
    what: 'The overhead wires from the utility pole, the weatherhead where they enter the mast, and the meter. Nothing on the house side can shut these wires off, so this is eyes-only work.',
    look: [
      { cp: 'service-drop-clearance', text: 'Follow the wires from the pole. Good: about 10 ft over yards, 12 ft over a driveway, clear of tree limbs. Bad: too low, or branches touching or rubbing the conductors.' },
      { cp: 'service-drip-loop', text: 'At the top of the mast. Good: the service wires sag lower than the weatherhead before entering, so water drips free. Bad: wires climbing straight in, leading rain into the mast.' },
      { cp: 'meter-base', text: 'Look, do not touch. Good: mounted tight, utility seal in place, entries sealed. Bad: loose, damaged, rusted through, or open gaps where water can reach the conduit.' },
    ],
    pro: 'Read it with your eyes from pole to meter: height, contact, drip loop, then the base. Keep ladders and poles well away from the drop.',
    watch: 'Never pull a meter, break a utility seal, or touch anything near the drop. Faded or chalky finishes on utility equipment are cosmetic. Describe the service as overhead.',
    terms: [
      { term: 'Service drop', means: 'The overhead conductors from the utility pole to the house.' },
      { term: 'Weatherhead', means: 'The hooded fitting on top of the mast where the conductors enter.' },
      { term: 'Drip loop', means: 'A downward loop in the conductors that sheds rain before the weatherhead.' },
    ],
  },

  'ext-ac-condenser': {
    what: 'The outdoor half of a split A/C system: compressor, coil, and fan. It needs to sit level, breathe freely, and connect to the house through an insulated line set and a disconnect in sight of it.',
    look: [
      { cp: 'condenser-level', text: 'Judge the cabinet, not just the pad. Good: plumb, square to the house, with free air all round. Bad: a tilt you can see or measure, ground sunk beneath, tubing stretched tight.' },
      { cp: 'condenser-line-insulation', text: 'Find the two refrigerant lines. Good: the larger one jacketed end to end; the small one normally runs bare. Bad: jacket gone or decayed on the large line, copper wet with condensation.' },
      { cp: 'condenser-disconnect', text: 'Find the disconnect. Good: in view of the unit, rated for outdoors, its cover shutting fully. Bad: absent or out of view, a broken or missing cover, or live parts exposed.' },
    ],
    pro: 'Walk all the way around the unit. Check clearance from shrubs and fences, the coil fins, the pad, then follow the lines to the wall.',
    watch: 'Do not pull the disconnect while the unit runs. Refrigerant charge, capacity, and efficiency are beyond the home inspection standards of practice.',
    terms: [
      { term: 'Line set', means: 'The pair of copper refrigerant lines between the condenser and the indoor coil.' },
      { term: 'Suction line', means: 'The larger, insulated line carrying cool refrigerant vapor back to the compressor.' },
      { term: 'Disconnect', means: 'A switch by the unit so a technician can cut power and see it stays off.' },
    ],
  },

  'ext-receptacle': {
    what: 'An outdoor receptacle. Outside, a person is often grounded through damp soil or concrete, so this outlet needs ground-fault protection and a cover that keeps rain off the contacts.',
    look: [
      { cp: 'ext-receptacle-cover', text: 'Check the cover before your fingers go near it. Good: a whole lid that shuts and seals, gasket in place. Bad: any damage that leaves the contacts open to weather.' },
      { cp: 'ext-gfci', tool: 'tester', text: 'Read the tester lights, then press its GFCI button. Power cuts: protected, here or upstream. Stays on with correct wiring: not protected. Open ground: the button cannot test.' },
    ],
    pro: 'Outlet already dead before you test? Find and reset the tripped GFCI upstream. On an open-ground reading, use a GFCI device\'s own TEST button instead.',
    watch: 'Write what you tested, what happened, and where any protecting device is. Reset everything you trip before you leave.',
    terms: [
      { term: 'GFCI', means: 'Ground-fault circuit interrupter: cuts power when current leaks to ground.' },
      { term: 'In-use cover', means: 'A bubble cover that stays weatherproof with a plug inserted.' },
    ],
  },

  'ext-front-steps': {
    what: 'The brick steps from the front walk up to the stoop. Entry steps are among the most used stairs in a house, often wet, often climbed in the dark with full hands.',
    look: [
      { cp: 'steps-handrail', text: 'Count the risers, not the treads. Four or more calls for a handrail on at least one side. Good: present, solid, graspable. Bad: none, loose, or too wide to grip.' },
      { cp: 'steps-riser-height', text: 'Measure each riser, top and bottom especially. Good: all within about 3/8 in of each other, treads firm. Bad: one riser out of step with the rest, or a tread that moves.' },
    ],
    pro: 'Stand at the bottom and sight up the nosings for a straight line. Measure, then reach for whatever you would grab if you slipped.',
    terms: [
      { term: 'Riser', means: 'The vertical face of a step.' },
      { term: 'Nosing', means: 'The front edge of a tread.' },
      { term: 'Graspable', means: 'Shaped so a hand can wrap around it.' },
    ],
  },

  'ext-driveway': {
    what: 'A poured concrete slab with control joints cut into it. Concrete shrinks as it cures, and the joints tell it where to crack.',
    look: [
      { cp: 'driveway-cracks', text: 'Read the cracks. Good: tight, with both sides flush. Bad: open or widening cracks, one side heaved or sunk, a trip lip, or settlement toward the house.' },
      { text: 'Look at the edges where the driveway meets the garage slab and the walk. Edges that drop or tilt toward the house are the ones that matter.' },
    ],
    watch: 'Hairline shrinkage cracks and stains are cosmetic. A driveway earns a line for trip edges, heaving, or water sent toward the house.',
    terms: [
      { term: 'Control joint', means: 'A groove cut in concrete so shrinkage cracks form along it.' },
      { term: 'Displacement', means: 'One side of a crack sitting higher or lower than the other.' },
    ],
  },

  'ext-crawl-access': {
    what: 'The door into the crawlspace, set in the foundation wall beside a screened vent. It keeps animals and weather out and lets you in.',
    look: [
      { cp: 'crawl-door', text: 'Check door and vent. Good: closes and holds shut, frame sound, screening whole. Bad: no latch, rotted framing, torn screens, or gaps big enough for animals.' },
    ],
    pro: 'Open it, light the entry, and smell before you crawl in. Note where the access is; the report needs it.',
    watch: 'The NC SOP has you report the access location, whether the whole crawlspace was reachable, and how you inspected it.',
    terms: [
      { term: 'Foundation vent', means: 'A screened opening in the foundation wall that ventilates the crawlspace.' },
    ],
  },

  'ext-ladder': {
    what: 'An aluminum extension ladder leaning on the eave. It is your way onto the roof, and ladders are the most common way inspectors get hurt.',
    look: [],
    pro: 'Before climbing: set it near 75 degrees, feet firm, top extending past the eave, well away from the service drop. Keep three points of contact.',
    watch: 'The NC SOP does not require walking a roof. If it is wet, steep, or fragile, inspect from the ladder or the ground and say how.',
    terms: [
      { term: 'Three points of contact', means: 'Two hands and a foot, or two feet and a hand, on the ladder at all times.' },
    ],
  },

  // ── ROOF ────────────────────────────────────────────────────────────────
  'roof-shingles': {
    what: 'Three-tab asphalt shingles. The granules on top shield the asphalt from sunlight; once they wash away, the shingle dries, cracks, and stops shedding water reliably.',
    look: [
      { cp: 'shingle-granule-loss', text: 'Look across the slope, light behind you. Good: uniform mineral cover. Bad: bare areas where the asphalt or mat shows through, and grit collecting in gutters and downspouts.' },
      { cp: 'shingle-exposed-nails', text: 'Scan the courses, repair pieces too. Good: every nail head hidden under the course above, except sealed nails on the last ridge cap. Bad: exposed or backed-out nails, rust streaks below.' },
    ],
    pro: 'Note how you viewed it: walked, from the ladder, or from the ground with binoculars. Low sun across the slope makes lifted tabs cast shadows.',
    watch: 'Do not put a number of years on remaining roof life. Describe the covering, the condition you saw, and how you viewed it.',
    terms: [
      { term: 'Granules', means: 'The mineral grit on a shingle that protects the asphalt from sunlight.' },
      { term: 'Exposure', means: 'The part of each shingle course left showing.' },
    ],
  },

  'roof-chimney': {
    what: 'The brick chimney where it rises through the roof. Its top and its joint with the shingles take more weather than almost anything else on the house.',
    look: [
      { cp: 'chimney-flashing', text: 'Where brick meets roof. Good: two layers, one woven into the courses, one let into the mortar and lapped over it. Bad: mastic patching instead, cracked or pulled loose.' },
      { cp: 'chimney-crown', text: 'Up top, the cap of the masonry. Good: sound and sloped so water runs off the edges. Bad: cracking that reaches the flue, pieces missing, or soaked-looking brick under it.' },
      { cp: 'chimney-cap', text: 'At the flue opening. Good: a fastened cover with whole, clear screening. Bad: open to the sky, a loose or damaged cover, clogged screen, or nesting material.' },
    ],
    pro: 'Work bottom to top: flashing, brick faces, crown, then flue and cap. Later, check the attic and ceilings near the chimney for stains.',
    watch: 'The flue interior and draft are beyond a visual home inspection. Describe the visible parts and how you viewed them.',
    terms: [
      { term: 'Crown', means: 'The sloped mortar or concrete cap on top of a masonry chimney.' },
      { term: 'Step flashing', means: 'L-shaped metal pieces woven into each shingle course along a wall or chimney.' },
      { term: 'Counterflashing', means: 'Metal set into the mortar joints and lapped over the step flashing.' },
    ],
  },

  'roof-vent-boot': {
    what: 'The plumbing vent pipe and the rubber-collared boot that seals it through the shingles. The rubber usually gives out in sunlight long before the shingles around it do.',
    look: [
      { cp: 'vent-boot', text: 'Check collar and laps. Good: pliable rubber sealed to the pipe, base under the upper courses and over the lower. Bad: cracked, shrunken, or gapped rubber, or a base lapped backward.' },
    ],
    pro: 'Look hardest at the uphill side, where water hits first. Then find the same pipe in the attic and check the decking around it.',
    terms: [
      { term: 'Pipe boot', means: 'Flashing with a rubber collar that seals a vent pipe through the roof.' },
      { term: 'Plumbing vent', means: 'The pipe that lets drains breathe so traps are not siphoned dry.' },
    ],
  },

  'roof-edge': {
    what: 'Where the shingles end at the eave. The metal edge here carries water off the roof past the wood and into the gutter.',
    look: [
      { cp: 'drip-edge', text: 'Look under the first course. Good: a metal lip along the whole eave, with a small shingle overhang. Bad: no metal, and wood at the edge stained or giving under a thumb.' },
    ],
    pro: 'Sight along the eave from the ladder, then press the fascia and deck edge wherever they look dark. Wood that gives under a thumb has been wet.',
    watch: 'Many older roofs were built without drip edge. Report what is there and any damage you can see; do not cite a code year.',
    terms: [
      { term: 'Drip edge', means: 'L-shaped metal along the roof edge that kicks water clear of the fascia.' },
      { term: 'Rake', means: 'The sloped edge of a roof at a gable end.' },
    ],
  },

  'roof-valley': {
    what: 'The inside corner where two roof slopes meet. Valleys carry more water than any other part of the roof, so how the shingles run through them matters.',
    look: [
      { cp: 'valley-closed-cut', text: 'Read the cut line. Good: a straight trim line set back from the center, corners clipped, no fasteners near the center. Bad: nails near the center, or lifted cut edges.' },
    ],
    watch: 'Know the three common methods: woven, closed-cut, and open metal. Each is accepted. Judge how it was done, not which one was chosen.',
    terms: [
      { term: 'Closed-cut valley', means: 'One slope runs through the valley; the other is trimmed in a straight line over it.' },
      { term: 'Woven valley', means: 'Shingles from both slopes interlaced across the valley.' },
    ],
  },

  'roof-ridge-vent': {
    what: 'A shingle-over vent along the ridge, the high exhaust for attic air. It only works with intake low at the soffits, so it is half of a system.',
    look: [
      { cp: 'ridge-vent', text: 'Walk or sight the ridge. Good: continuous and lying flat, caps covering every fastener. Bad: lifted, crushed, or torn sections, unsealed nail heads, or missing caps.' },
    ],
    pro: 'Check it here, then confirm from the attic that the slot was actually cut: you should see daylight along the ridge.',
    watch: 'Judge exhaust and intake together. A ridge vent with blocked soffits can pull house air out instead of attic air.',
    terms: [
      { term: 'Ridge cap', means: 'Shingles folded over the peak of the roof.' },
    ],
  },

  // ── DECK ────────────────────────────────────────────────────────────────
  'deck-ledger': {
    what: 'The board fastened to the house that carries the house side of the deck, roughly half its load. When decks pull away from houses, this connection is usually where it starts.',
    look: [
      { cp: 'ledger-fasteners', text: 'Read the fasteners across the face. Good: staggered lags or through-bolts into the house framing. Bad: nails alone, or fasteners corroded and backing out.' },
      { cp: 'ledger-flashing', text: 'Check the top edge. Good: metal tucked under the wall layers and lapped over the board, wood sound under an awl. Bad: no metal, an open joint, decayed wood behind.' },
    ],
    pro: 'Probe the band joist below the ledger with an awl, and check it again from the crawlspace side if you can reach it.',
    terms: [
      { term: 'Ledger', means: 'The board attached to the house that the deck joists hang from.' },
      { term: 'Band joist', means: 'The house framing member the ledger fastens to.' },
      { term: 'Z-flashing', means: 'Z-shaped metal that sheds water over the top of the ledger.' },
    ],
  },

  'deck-framing': {
    what: 'The joists that carry the decking, and the metal hangers that connect each joist end to the ledger. A deck is only as strong as its weakest joist connection.',
    look: [
      { cp: 'joist-hangers', text: 'Check every joist end. Good: each one seated in a hanger, every specified hole filled. Bad: no hanger, angled nails only, holes left empty, or hangers corroding.' },
    ],
    pro: 'Get under the deck and work joist by joist with the light. Count holes and nails; a hanger is only as good as its fasteners.',
    terms: [
      { term: 'Joist hanger', means: 'A U-shaped metal bracket that holds a joist end to a ledger or beam.' },
      { term: 'Toe-nailing', means: 'Nails driven at an angle through the side of one board into another.' },
    ],
  },

  'deck-guard': {
    what: 'The guard around the deck edge. It has two jobs: stop an adult from going over, and stop a small child from slipping through.',
    look: [
      { cp: 'guard-height', text: 'Measure from walking surface to rail top. Good: at least 36 in, rigid when pushed. Bad: short of that, or posts that move. Guards are generally needed over a 30 in drop.' },
      { cp: 'baluster-spacing', text: 'Judge each opening against a 4-in sphere; a pro carries one. Good: it could not pass anywhere. Bad: it would slip through any gap.' },
    ],
    pro: 'Measure the drop at the outer edge, where the grade is lowest. Push each post as you go; a guard that flexes fails when someone leans on it.',
    terms: [
      { term: 'Guard', means: 'A barrier along an open edge to prevent falls. Not the same thing as a handrail.' },
      { term: 'Baluster', means: 'One of the vertical pieces filling the guard.' },
    ],
  },

  'deck-stairs': {
    what: 'The stairs from the deck down to the yard. Deck stairs are often wet, mossy, and used while carrying things, which is exactly when people fall.',
    look: [
      { cp: 'deck-stair-handrail', text: 'Count risers, then grip the rail. Good: a rail your fingers can close around, running the full flight. Bad: a wide flat board you can only lay a hand on, or none.' },
      { text: 'Also check for uneven risers, rocking treads, and soft wood where the stringers meet the ground.' },
    ],
    pro: 'Walk the stair once with your hand on the rail, the way an owner would at night. What your hand finds, or does not, is the finding.',
    watch: 'Do not let a guard cap pass for a handrail. Ask whether a slipping hand could close around it.',
    terms: [
      { term: 'Graspable', means: 'A rail shaped so a hand can wrap around it.' },
      { term: 'Return', means: 'A rail end that turns back to the post or wall so sleeves cannot catch.' },
    ],
  },

  'deck-posts': {
    what: 'The posts that carry the deck\'s outer beam down to the ground. How each one meets the ground decides whether it stays plumb and dry.',
    look: [
      { cp: 'post-footing', text: 'Probe the base. Good: plumb, on a footing, held off it by a metal base, wood sound. Bad: resting on loose masonry or dirt, leaning, decay at the bottom.' },
    ],
    pro: 'Probe at and just below the ground line, where rot hides under paint and soil. Sight each post against a house corner for plumb.',
    terms: [
      { term: 'Footing', means: 'The concrete pad that spreads a post\'s load into the soil.' },
      { term: 'Standoff base', means: 'A metal post base that holds wood off the concrete so it can dry.' },
    ],
  },

  // ── SHED ────────────────────────────────────────────────────────────────
  'shed-tile-roof': {
    what: 'The garden studio\'s clay barrel tile roof. Clay is long-lived but brittle, and much of the waterproofing is the underlayment beneath, so any gap in the tile exposes it to sun and rain.',
    look: [
      { cp: 'tile-slipped', text: 'Sight along the eave courses. Good: every row straight with the same overlap, closures in place. Bad: a piece that has slid down out of line, opening the course above it.' },
      { cp: 'tile-broken', text: 'Scan the field tile by tile. Good: every tile whole and seated. Bad: cracks running through a tile, missing pieces, or underlayment showing.' },
      { cp: 'tile-hip-mortar', text: 'Follow the hips to the top. Good: bedding continuous, every cap tile tight and in line. Bad: bedding missing or loose, caps shifted, openings where water or animals get in.' },
    ],
    pro: 'Inspect clay tile from the eave on a ladder or with binoculars. Walking it breaks tiles, and the NC SOP does not require walking any roof.',
    watch: 'Hairline shrinkage cracks in mortar bedding are common. Detached buildings may be outside scope; if the agreement includes the studio, say so and how you viewed it.',
    terms: [
      { term: 'Underlayment', means: 'The waterproof layer under the tile.' },
      { term: 'Batten', means: 'A wood strip the tiles rest on or hang from.' },
      { term: 'Bird stop', means: 'A closure filling the tile arches at the eave so birds cannot nest under them.' },
    ],
  },

  // ── ATTIC ───────────────────────────────────────────────────────────────
  'att-insulation': {
    what: 'Blown fiberglass on the ceiling plane, the main thing keeping summer heat and winter cold out of the rooms below. Depth and continuity both count.',
    look: [
      { cp: 'insulation-depth', text: 'Read the ruler, then spots away from the hatch. Good: depth matching the product card for about R-38; blown fiberglass needs well over a foot. Bad: a few inches, framing exposed.' },
      { cp: 'insulation-void', tool: 'thermal', text: 'Sweep the ceiling plane with the camera. Good: one even tone broken only by regular framing lines. Bad: a crisp-edged patch reading warmer than its surroundings in heating season. Confirm by eye.' },
    ],
    pro: 'Measure in several places, never just at the hatch, where insulation is always most disturbed. Note the type and approximate depth.',
    watch: 'Report type and approximate depth rather than an R-value. A thermal image is never a diagnosis by itself; explain it with something you can see.',
    terms: [
      { term: 'Loose fill', means: 'Insulation blown in as loose fibers rather than laid as batts.' },
      { term: 'Thermal bridge', means: 'Framing that carries heat around the insulation.' },
      { term: 'R-value', means: 'Resistance to heat flow. Higher insulates better.' },
    ],
  },

  'att-bath-duct': {
    what: 'The flexible duct from the bathroom exhaust fan. Its job is to carry shower moisture out of the house, not just out of the bathroom.',
    look: [
      { cp: 'bath-fan-termination', text: 'Follow it to its end. Good: tight to a roof or wall cap with a damper. Bad: ending loose in the attic, or only aimed toward a soffit or ridge vent.' },
      { text: 'Look up at the decking near where the duct ends. Staining or dark growth there tells you where its moisture has been going.' },
    ],
    pro: 'Start at the fan housing and keep the light on the duct all the way. Sags that hold condensation are worth a line too.',
    terms: [
      { term: 'Termination', means: 'Where a duct ends and discharges, ideally a cap outside the building.' },
      { term: 'Damper', means: 'A flap in the cap that closes when the fan is off.' },
    ],
  },

  'att-sheathing': {
    what: 'The underside of the roof decking. It is the one place you can read the roof from inside: leaks, condensation, and old repairs all leave their marks here.',
    look: [
      { cp: 'sheathing-stain', tool: 'moisture', text: 'Every stain asks: wet now? Meter the stain and a clean spot nearby. Matching low readings: dry today. Well above the reference, past about 19%: active moisture.' },
      { cp: 'sheathing-microbial', tool: 'flashlight', text: 'Dark decking can be grain, shadow, or growth, so light it close. Good: only the wood\'s own color variation, nails unrusted. Bad: fuzzy or speckled growth spreading across sheets, nails rusted.' },
    ],
    pro: 'Work each bay with the light raking along the decking. Match every stain to a penetration or detail you saw from the roof.',
    watch: 'If you see growth, call it microbial-like growth; naming mold is beyond the SOP. Describe each stain, where it is, and its reading.',
    terms: [
      { term: 'Decking', means: 'The plywood or OSB sheets the roof covering is fastened to.' },
      { term: 'WME', means: 'Wood moisture equivalent, the percentage a moisture meter reports.' },
      { term: 'Shiner', means: 'A roofing nail that missed the framing and pokes through the decking.' },
    ],
  },

  'att-truss': {
    what: 'Engineered roof trusses: top chords, bottom chords, and diagonal webs joined by metal gusset plates. Every member carries load in tension or compression, so the whole truss depends on each piece being there.',
    look: [
      { cp: 'truss-cut', text: 'Trace each truss member from plate to plate. Good: every web and chord continuous, plates tight and unbent. Bad: a web cut, notched, or removed, plates loose, or members cracked.' },
    ],
    pro: 'Look hardest where ducts, attic stairs, and storage platforms pass through; trades cut trusses to make room. Then check the roofline outside for a dip.',
    watch: 'Report what was altered and where, with a photo. Do not judge loads or suggest a fix in the report.',
    terms: [
      { term: 'Web', means: 'An interior truss member running between the chords.' },
      { term: 'Chord', means: 'The top or bottom member of a truss.' },
      { term: 'Gusset plate', means: 'The toothed metal plate pressed into a truss joint.' },
    ],
  },

  'att-soffit-vent': {
    what: 'The eave, seen from inside. Attic ventilation draws air in low at the soffit vents and out high at the ridge, so this narrow corner is where the intake has to stay open.',
    look: [
      { cp: 'soffit-baffles', text: 'Look where roof meets wall. Good: a held-open channel above the insulation to the vent. Bad: the channel filled or blocked, so no outside air or light comes through.' },
    ],
    pro: 'Turn your light off at the eave for a moment and look for daylight. Check several bays, not just the one by the hatch.',
    watch: 'Ventilation is judged as a system. Connect what you see here to the ridge vent and to any condensation on the decking near the eaves.',
    terms: [
      { term: 'Baffle', means: 'A chute between rafters or truss chords that keeps insulation off the vent path.' },
      { term: 'Soffit', means: 'The underside of the roof overhang, where intake vents usually are.' },
    ],
  },

  'att-duct': {
    what: 'An insulated flex duct carrying heated or cooled air from the furnace to a ceiling register below. A Raleigh attic tops 130°F in summer, so air that escapes up here is paid for and lost.',
    look: [
      { cp: 'attic-duct-joint', text: 'Follow it to the boot. Good: duct held on the boot by a mechanical fastener, insulation continuous across the joint. Bad: any gap, tape letting go, duct off the collar.' },
      { text: 'Along the run: kinks, crushed spots, or long sags between straps all choke airflow to the room.' },
    ],
    pro: 'Trace each run from the plenum to its boot with the light held low along the duct. Joints and supports fail long before the duct itself does.',
    watch: 'Report what you see at the joint. Sizing, airflow balance, and efficiency math are beyond the home inspection standards of practice.',
    terms: [
      { term: 'Boot', means: 'The sheet-metal box behind a register where the duct connects.' },
      { term: 'Collar', means: 'The short round neck on the boot or plenum that the duct slides over.' },
    ],
  },

  'att-wiring': {
    what: 'Sheathed cable running across the attic. Where two cables join, the connection belongs inside a covered junction box, so heat from a loose splice stays contained and the wires stay protected.',
    look: [
      { cp: 'open-splice', text: 'Find where cables join. Good: inside a covered, reachable junction box, cables clamped. Bad: conductors joined in the open with no box, however well wrapped.' },
      { text: 'Along the runs: cable stapled to framing, protected near the hatch and walkways, sheathing whole and unchewed.' },
    ],
    pro: 'Hands off. Look and photograph with the light, and keep your weight on framing as you follow each cable.',
    terms: [
      { term: 'Junction box', means: 'A covered box that encloses wire splices.' },
      { term: 'NM cable', means: 'Nonmetallic sheathed cable, the common house wiring.' },
    ],
  },

  'att-pests': {
    what: 'The insulation along the gable wall, a common route for rodents that get in through gable vents and gaps at the roof edge. You cannot read this surface without good light.',
    look: [
      { cp: 'rodent-activity', tool: 'flashlight', text: 'Shine the light low and flat across the surface. Good: an undisturbed surface with no sign of animals. Bad: runways or burrows, droppings, nesting material, or chewed cable.' },
    ],
    pro: 'Do not stir droppings, and wear a respirator near them. Check gable vent screens and roof-to-wall gaps for a way in.',
    watch: 'The NC SOP does not require reporting pests, but you may report what you see. Ordinary attic dust and debris are not evidence by themselves.',
    terms: [
      { term: 'Gable', means: 'The triangular end wall under the peak of a roof.' },
    ],
  },

  // ── CRAWL ───────────────────────────────────────────────────────────────
  'crawl-vapor-barrier': {
    what: 'The plastic sheet over the crawlspace soil. Bare soil releases a great deal of water vapor into the space under the house, and that moisture ends up in the wood.',
    look: [
      { cp: 'vapor-barrier', text: 'Look across the ground cover. Good: every bit of soil covered, overlaps at seams, edges turned up the walls and piers. Bad: rips, uncovered dirt, open seams, edges pulled back.' },
      { cp: 'standing-water', text: 'Check the low spots along the walls. Good: no pooling and no flood marks. Bad: water lying on the cover or soil, or lines on the masonry showing where it has stood.' },
    ],
    pro: 'Lift an edge near a wall and look underneath. Then connect any water you see to the grading and downspouts outside that wall.',
    watch: 'Slightly damp soil under plastic is common in NC crawlspaces. Standing water and flood marks are a separate question.',
    terms: [
      { term: 'Vapor retarder', means: 'A plastic sheet that slows moisture rising from the soil.' },
      { term: 'Silt line', means: 'A line of fine dirt left on a wall where water once stood.' },
    ],
  },

  'crawl-pier': {
    what: 'A masonry pier carrying a girder, the beam that holds up the floor joists. Piers take concentrated loads, so each one has to act as a single solid column.',
    look: [
      { cp: 'pier-crack', text: 'Read the masonry. Good: sound units, hairline joint cracks at most, nothing offset. Bad: cracking through the units or wide enough to measure, or courses pushed out of line.' },
      { cp: 'pier-shims', text: 'Look at the bearing on top. Good: the girder fully seated on solid, incompressible material. Bad: stacked or improvised wood packing, crushed, split, or working loose.' },
    ],
    pro: 'Rake the light across each pier face so offsets cast shadows. Then think upstairs: sloping floors, drywall cracks, and binding doors above it.',
    watch: 'Report width, displacement, and location. Leave the cause of movement to whoever evaluates it.',
    terms: [
      { term: 'Girder', means: 'The main beam that carries the floor joists.' },
      { term: 'Shim', means: 'A thin spacer that fills a gap so a beam bears fully.' },
      { term: 'Bearing', means: 'Where one member rests on and passes its load to another.' },
    ],
  },

  'crawl-joists': {
    what: 'The floor joists under the house. A joist works like a plank on edge: the top squeezes, the bottom stretches, and the middle of its depth does the least work.',
    look: [
      { cp: 'joist-notch', text: 'Check where pipes cross. Good: a modest bored hole near mid-depth, well off both edges. Bad: wood removed from the bottom edge near mid-span, or splitting from a cut.' },
      { cp: 'joist-moisture', tool: 'moisture', text: 'Meter the framing over the damp area, then a dry reference elsewhere. Good: both in the low teens. Bad: a clear jump over the reference, past about 19%. Then probe.' },
    ],
    pro: 'Work the framing bay by bay with your light along the bottom edges. Push meter pins across the grain, on clean wood.',
    watch: 'Report the cut and any split you see. Sizing a repair or judging spans is beyond a home inspection.',
    terms: [
      { term: 'Notch', means: 'A piece cut out of the edge of a joist.' },
      { term: 'Mid-span', means: 'The middle third of a joist\'s length, between supports.' },
    ],
  },

  'crawl-foundation-wall': {
    what: 'The concrete block wall that carries the house down to the footing and holds back the soil outside. Its cracks and stains are a record of movement and water.',
    look: [
      { cp: 'foundation-crack', text: 'Read cracks for width, displacement, and direction. Good: tight and in line, the wall plumb. Bad: wide stair-step cracking, blocks pushed in or out, a wall leaning.' },
      { cp: 'efflorescence', text: 'Check under any white bloom. Good: the masonry beneath is sound. Bad: the face under it spalling, crumbling, or cracked. Either way, a bloom records water moving through.' },
    ],
    pro: 'Rake the light along the wall face from one end. Then step outside and look at the grade and gutters above any wet or salted area.',
    watch: 'White bloom and hairline joint cracks tempt over-calls. Keep two questions apart: is the masonry sound, and where is the water coming from.',
    terms: [
      { term: 'Efflorescence', means: 'White mineral salts left on masonry as water evaporates.' },
      { term: 'Stair-step crack', means: 'A crack that zigzags along the mortar joints of block or brick.' },
    ],
  },

  'crawl-termite': {
    what: 'The top of the foundation, where the wood sill plate sits on the block. Subterranean termites live in the soil and need a sheltered path up to wood; this is where that path shows.',
    look: [
      { cp: 'termite-tubes', tool: 'flashlight', text: 'Light the masonry under the sill. Good: nothing raised or tunnel-like on the masonry, wood firm under the awl. Bad: earthen tunnels running up to the wood, hollow when broken.' },
    ],
    pro: 'Look hardest at pier tops, plumbing penetrations, and the sill along every wall. Probe the sill and rim wherever anything looks off.',
    watch: 'The NC SOP does not require you to report wood-destroying insects, but evidence you see belongs in the report. Describe it; do not identify species.',
    terms: [
      { term: 'Sill plate', means: 'The treated wood board bolted to the top of the foundation.' },
      { term: 'Shelter tube', means: 'An earthen tunnel termites build to travel between soil and wood.' },
    ],
  },

  'crawl-plumbing': {
    what: 'The drain and supply piping under the bathroom. Leaks down here can run for years before anyone upstairs notices, wetting the soil and framing below.',
    look: [
      { cp: 'drain-leak', tool: 'flashlight', text: 'Run water upstairs first, then light the joint while it flows. Good: stays dry under flow. Bad: active dripping, mineral trails, or wet ground cover beneath it.' },
      { cp: 'pex-supply', text: 'Read the print on the supply lines. Good: an accepted material, supported along its run, fittings made up tight. Bad: sagging runs, weeping fittings, or gray polybutylene.' },
    ],
    pro: 'Go fixture by fixture: drain joints under flow, supply lines at every fitting, then the soil below each for wet spots.',
    watch: 'The NC SOP asks you to describe supply piping materials. Read the print on the pipe before you name it.',
    terms: [
      { term: 'PEX', means: 'Cross-linked polyethylene, a flexible plastic supply pipe.' },
      { term: 'Polybutylene', means: 'An older, usually gray plastic supply pipe with a history of failures.' },
    ],
  },

  'crawl-duct': {
    what: 'Flex supply ductwork hung from the floor framing, carrying conditioned air to registers above. Down here a duct has two enemies: gravity and the damp ground.',
    look: [
      { cp: 'crawl-duct-down', text: 'Follow the run from trunk to boot. Good: off the ground on wide straps, outer jacket whole, both ends attached. Bad: down on the soil, jacket ripped, or an end pulled free.' },
    ],
    pro: 'Keep your light along the bottom of the run and your hand near each joint. Moving air is easy to feel in still crawlspace air.',
    watch: 'Report the condition you see. Duct sizing, airflow, and efficiency are beyond the home inspection standards of practice.',
    terms: [
      { term: 'Trunk', means: 'The main duct that the branch runs connect to.' },
      { term: 'Collar', means: 'The short round neck on a trunk or boot that a flex duct slides over.' },
    ],
  },
};

export const ZONE_GUIDES_OUT = {
  exterior: { intro: 'Outside. Pick a corner and walk the house in one direction so nothing gets skipped. Read it top down: roof edge, gutters, walls, windows, then grade and drainage. Water is the question everywhere. Keep clear of the service drop.' },
  roof: { intro: 'On the roof. The NC SOP does not require walking it, so wet, steep, or fragile roofs get viewed from the ladder or ground, and you say how. Step soft, stay off vents. Read the covering first, then every penetration, edge, and valley.' },
  deck: { intro: 'The deck. Before you trust it with your weight, look at how it holds on: ledger to the house, joists to the ledger, posts to the ground. Then guards, stairs, and handrails, measured, not eyeballed.' },
  shed: { intro: 'The garden studio. Detached buildings are outside the NC minimum, so your agreement decides whether it is in scope. Clay tile breaks underfoot: read it from the ladder at the eave or with binoculars, never by walking it.' },
  attic: { intro: 'The attic. Step only on framing, never between it: the ceiling below is half-inch drywall. Light on first. A pro reads the underside of the roof for stains, then structure, insulation, ventilation, and anything ducted, vented, or wired through here.' },
  crawl: { intro: 'The crawlspace. Light first, then look and smell before you go in: standing water, sewage odor, or exposed wiring are reasons to stop. Read ground and water, then foundation, piers, and framing, then pipes, ducts, and wires. Note what you could not reach.' },
};
