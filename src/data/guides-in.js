// OWNER: Henny. Field Guide commentary (see CONTEXT.md §12 and src/data/guides.js).
// Interior zones + garage. Every look item reads the same whether the part rolled good or bad:
// it says what good looks like and what bad looks like, and lets the player decide.
export const GUIDES_IN = {
  // ── LIVING ──────────────────────────────────────────────────────────────
  'liv-fireplace': {
    what: 'A wood-burning masonry fireplace: a firebrick-lined box, a damper to open and close the throat, and a flue running up the chimney. Every part exists to keep fire, embers, and smoke where they belong.',
    look: [
      { cp: 'hearth-extension', text: 'Measure the opening, then the hearth. Opening under 6 sq ft: 16 in in front, 8 in each side. 6 sq ft or more: 20 and 12. Less lets embers reach wood.' },
      { cp: 'firebox-brick', text: 'Rake your light low across the firebox walls. Good: full, tight mortar joints and whole firebrick. Bad: joints eroded deep, cracked or broken brick, gaps that lead behind the lining.' },
      { cp: 'damper', text: 'Gloves on, work the damper handle. Good: the plate swings fully open and closes snug. Bad: stuck, rusted in place, or only partly open. Rust here also hints at water coming down.' },
      { cp: 'flue-creosote', tool: 'flashlight', text: 'Point the light up past the damper. Thin, dry, matte soot that smudges is ordinary use. Thick crusty, flaky, or shiny tar-like glaze, past about 1/8 in, is chimney-fire fuel.' },
    ],
    pro: 'Work from the floor up: hearth, firebox, damper, then the flue. Eye protection before you touch the damper; years of soot come down when it moves.',
    watch: 'Say how much of the flue you actually saw from the firebox. A home inspection does not cover the full flue interior, so never imply you cleared it.',
    terms: [
      { term: 'Hearth extension', means: 'The noncombustible floor in front of and beside the fireplace opening.' },
      { term: 'Damper', means: 'The metal plate in the throat that opens for a fire and closes when it is out.' },
      { term: 'Creosote', means: 'Tar that condenses in a flue; heavy or glazed buildup can burn.' },
    ],
  },
  'liv-smoke-alarm': {
    what: 'A ceiling smoke alarm. The test button proves the horn and circuit work, not that the sensor still senses smoke well. Sensors wear out with age and dust, so every alarm is dated.',
    look: [
      { cp: 'smoke-alarm-age', text: 'Twist it off its base and read the manufacture date on the back. Within ten years: inside its service life. Older than ten: due for replacement, whatever the button says.' },
      { text: 'Note hardwired or battery-only. A hardwired alarm hangs on a short harness when twisted down; seat it back firmly when you are done.' },
    ],
    pro: 'Warn the occupants, press test with a pole or pen, then read the label. One date in a house usually tells you the age of every alarm.',
    watch: 'Report what you observed: whether an alarm is there and what the test button did. Never write that you tested sensitivity; the button cannot check that.',
    terms: [
      { term: 'Manufacture date', means: 'The date printed on the back label; the ten-year clock starts here.' },
      { term: 'Hardwired', means: 'Powered by house wiring, usually with a backup battery.' },
    ],
  },
  'liv-receptacle': {
    what: 'An ordinary 3-slot wall receptacle. Wiring faults inside the box are invisible from the cover plate, which is why every inspector carries a plug-in tester.',
    look: [
      { cp: 'liv-polarity', tool: 'tester', text: 'Plug in the tester and match its lights to the legend. Correct pattern: wired right, as far as it sees. Reversed hot and neutral, open ground, or no lights: a wiring fault.' },
      { text: 'Test both halves of the duplex, and look for a cracked face, scorching, or a device loose in the box.' },
    ],
    pro: 'Test at least one receptacle per room, more in an older house. Read the legend on your own tester every time; patterns differ by brand.',
    watch: 'A correct pattern means no fault this tester can see. A 3-light tester cannot detect a bootleg ground or a poor ground.',
    terms: [
      { term: 'Polarity', means: 'Hot on the narrow slot, neutral on the wide slot.' },
      { term: 'Duplex', means: 'A receptacle with two outlets on one device.' },
    ],
  },
  'liv-ceiling-stain': {
    what: 'A water stain on the living room ceiling. A stain proves water was here once. It cannot tell you whether water is here now; that takes a meter and a comparison.',
    look: [
      { cp: 'ceiling-stain', tool: 'moisture', text: 'Take a reference on dry drywall nearby, then read the stain. Same as the reference: dry today. Well above it: water is in the drywall now.' },
      { text: 'Press lightly near it for softness or sag, then think about what sits above: attic, roof, and near this wall, the chimney.' },
    ],
    pro: 'Make a note to look above this spot in the attic and at the roof flashing nearby. A stain is a clue that points somewhere else.',
    watch: 'Describe the stain, its size and location, and the reading next to your reference. Let the evidence carry the finding.',
    terms: [
      { term: 'Reference reading', means: 'A meter reading on the same material in a known-dry spot, for comparison.' },
      { term: 'WME', means: 'Wood moisture equivalent, the scale most meters read in.' },
    ],
  },
  'liv-window': {
    what: 'A double-hung window: two sashes that slide in tracks, held up by balances, locked by a sash lock. It is light, air, and in a bedroom, a way out.',
    look: [
      { cp: 'window-operation', text: 'Open it fully, let go, then close and lock it. Good: full travel, holds any position, latches secure. Bad: binds, will not hold up, will not close or lock.' },
      { text: 'Glance at the glass, the stool, and the bottom rail for cracks, rot, or water staining.' },
    ],
    watch: 'Stiff or paint-stuck sashes are common in older houses. Report what does not operate; energy performance and window ratings are not part of the inspection.',
    terms: [
      { term: 'Sash', means: 'The framed part of the window that holds the glass and moves.' },
      { term: 'Balance', means: 'The spring or cord system that holds a raised sash in place.' },
    ],
  },

  // ── KITCHEN ─────────────────────────────────────────────────────────────
  'kit-range': {
    what: 'A freestanding electric range. Two questions: do its basic functions work, and is it secured so it cannot tip forward when someone leans or stands on the open oven door?',
    look: [
      { cp: 'range-burners', text: 'Turn on each element and the oven. Good: every heating part reaches heat on its control. Bad: a cold element, a dead control, sparking, or burning smells.' },
      { cp: 'range-anti-tip', text: 'Pull the storage drawer and light the back corner. Good: a rear foot captured in a bracket fixed to the floor or wall. Bad: the foot sits free, nothing holding it.' },
    ],
    pro: 'Start the elements, check the bracket while they heat, then turn everything off and say so in your notes. Never test by putting weight on the oven door.',
    watch: 'Operate basic functions only. Thermostat calibration, timers, clocks, and self-clean are not part of a home inspection; do not imply you checked them.',
    terms: [
      { term: 'Anti-tip bracket', means: 'A bracket that locks a rear range foot to the floor or wall.' },
      { term: 'Surface element', means: 'The coil or burner on top of the range.' },
    ],
  },
  'kit-dishwasher': {
    what: 'A built-in dishwasher. It fills, washes, and pumps dirty water out through a drain hose to the sink drain or disposal. The hose route decides whether sink water can run back in.',
    look: [
      { cp: 'dw-operation', text: 'Start a full cycle early. Good: it completes the cycle and everything around it stays dry. Bad: it stalls, will not fill or drain, or water shows anywhere.' },
      { cp: 'dw-drain-loop', text: 'Follow the drain hose to the sink. Good: it climbs to a loop fastened high under the counter, or to an air gap, first. Bad: it runs low and flat straight in.' },
    ],
    pro: 'Start it first thing in the kitchen and come back at the end. Check the sink cabinet floor afterward; dishwasher drain leaks show up there.',
    terms: [
      { term: 'High loop', means: 'The drain hose raised and fastened up under the countertop.' },
      { term: 'Air gap', means: 'A counter-mounted fitting that physically breaks the drain line so water cannot siphon back.' },
    ],
  },
  'kit-sink': {
    what: 'The cabinet under the kitchen sink: drain and trap, the garbage disposal and its power feed, and the dishwasher drain. Water and electricity share a dark box here.',
    look: [
      { cp: 'sink-flex-drain', text: 'Run water and look at the pipe from the sink to the wall. Good: a smooth-wall plastic P-trap, snug slip nuts, draining fast. Bad: ribbed accordion pipe, sagging, or drips at joints.' },
      { cp: 'disposal-wiring', text: 'Find where power enters the disposal. Good: cable held by a listed connector, or a cord-and-plug kit. Bad: unprotected openings or cable that can move and chafe.' },
      { cp: 'sink-leak', tool: 'moisture', text: 'After the water has run a few minutes, meter the floor below the trap and a dry side panel. Readings match: old marks. Well above: water is reaching the floor now.' },
    ],
    pro: 'Fill the basin, then drain it while you watch from below with a light. A dry paper towel wrapped around each joint finds drips your eyes miss.',
    watch: 'Water rings under sinks are everywhere. The running test and the meter separate cosmetic marks from an active leak; let them decide, not the stain.',
    terms: [
      { term: 'P-trap', means: 'The U-shaped bend that holds water to block sewer gas.' },
      { term: 'Cable clamp', means: 'The fitting that grips a cable where it enters a metal box or appliance.' },
    ],
  },
  'kit-gfci': {
    what: 'A countertop GFCI receptacle by the sink. A GFCI cuts power in a fraction of a second when current leaks to ground, such as through a wet hand. They fail quietly, so you trip every one.',
    look: [
      { cp: 'kit-gfci-test', tool: 'tester', text: 'Read the wiring pattern, then press device TEST and the tester GFCI button. Good: it trips with a click, power drops, RESET restores it. Bad: nothing trips; power stays on.' },
      { text: 'If power is already dead, look for a tripped GFCI elsewhere: bathrooms and garage share circuits in surprising ways.' },
    ],
    pro: 'Trip it, confirm power is off with the tester, reset, and confirm power is back. Leave every GFCI the way you found it.',
    watch: 'TEST and RESET buttons on the face prove the device is a GFCI, not that it works. Only a trip is evidence.',
    terms: [
      { term: 'GFCI', means: 'Ground-fault circuit interrupter: a device that shuts off power when current leaks to ground.' },
      { term: 'Trip', means: 'The GFCI opening the circuit and cutting power.' },
    ],
  },
  'kit-hood': {
    what: 'A range hood over the cooktop. Some exhaust through a duct to the outdoors. Others, called recirculating or ductless, push air through a filter and back into the kitchen.',
    look: [
      { cp: 'hood-recirc', text: 'Run fan and light, then find where the air goes. Good: it works as its design intends, filters present. Bad: a duct ending in a cabinet or attic, no filter, dead fan.' },
          ],
    watch: 'Ducted and ductless hoods are both accepted designs that perform differently. Judge whether the hood does what its own design is meant to do.',
    terms: [
      { term: 'Recirculating hood', means: 'A ductless hood that filters air and returns it to the room.' },
      { term: 'Charcoal filter', means: 'The odor filter in a recirculating hood.' },
    ],
  },
  'kit-back-door': {
    what: 'The exterior door from the kitchen to the deck. Doors and their landings are where people trip and where water tries to get in, and the step that is acceptable depends on which way the door swings.',
    look: [
      { cp: 'door-threshold', text: 'Note the swing, then the drop. Good: about 1-1/2 in at most if the door swings over the landing, up to about 7-3/4 in if not. Bad: more than that.' },
      { text: 'Open, close, latch, and lock it. Look at the weatherstrip, the threshold, and the bottom of the jamb for rot.' },
    ],
    pro: 'Check the door from inside, then step out and look at the threshold from the deck side. The same drop reads differently from each side.',
    terms: [
      { term: 'Threshold', means: 'The strip under the door that seals the bottom of the opening.' },
      { term: 'Landing', means: 'The floor or deck surface just outside an exterior door.' },
      { term: 'Inswing', means: 'A door that opens into the house.' },
    ],
  },

  // ── BATH ────────────────────────────────────────────────────────────────
  'bath-toilet': {
    what: 'A floor-mounted toilet, sealed to the drain by a wax ring on the closet flange. If the toilet moves, the seal breaks, and water and sewer gas escape under the floor where nobody sees.',
    look: [
      { cp: 'toilet-loose', text: 'Straddle it and press side to side with your knees. Good: solid, no movement, bolts capped and snug. Bad: it rocks or shifts, the base caulk is cracked, the bolts are loose.' },
      { cp: 'toilet-base-moisture', tool: 'moisture', text: 'Flush a few times, then meter the floor at the base and near the door. Readings match: the discoloration is wear. Well above: water is reaching the floor at the seal.' },
    ],
    pro: 'Flush, check the tank and supply for drips, rock it, then meter. Knees feel movement your hands miss and are gentle on the fixture.',
    watch: 'Report movement and the reading. Whether the subfloor is damaged is confirmed from the crawlspace below, not guessed from above.',
    terms: [
      { term: 'Wax ring', means: 'The seal between the toilet and the drain flange.' },
      { term: 'Closet flange', means: 'The fitting in the floor the toilet bolts to.' },
    ],
  },
  'bath-vanity': {
    what: 'The vanity cabinet: hot and cold supply shutoffs and the sink drain with its trap. A trap only works if its water seal stays put, which depends on its shape and its vent.',
    look: [
      { cp: 'vanity-supply-valves', text: 'Look at the shutoffs without turning them. Good: a shutoff for each line, dry fittings, lines in sound condition. Bad: drips, corrosion, kinked or cracked lines, no shutoffs.' },
      { cp: 'vanity-s-trap', text: 'Trace the drain from the tailpiece. Good: a P-trap whose arm runs into the wall. Bad: an S-shaped trap that drops straight down through the floor, with no vent in sight.' },
      { text: 'Fill the basin and pull the stopper. Watch the joints and listen at the end: a gurgle is a trap seal being pulled.' },
    ],
    watch: 'Report the configuration you see. The vent design behind the wall is out of view, so describe, do not design the fix.',
    terms: [
      { term: 'Trap seal', means: 'The water held in the trap that blocks sewer gas.' },
      { term: 'Supply stop', means: 'The small shutoff valve under a fixture.' },
    ],
  },
  'bath-tub': {
    what: 'The tub and tiled surround. Tile is not waterproof on its own; the caulk joint, grout, and backer behind it keep shower water out of the wall framing and subfloor.',
    look: [
      { cp: 'tub-caulk', text: 'Follow the tub-to-tile joint all the way around, corners included. Good: a continuous bead bonded to both surfaces. Bad: cracks, gaps, peeling, or missing caulk.' },
      { cp: 'tub-wall-moisture', tool: 'moisture', text: 'Scan the tile below the soap dish and valve, then dry tile away from the shower. Readings match: darker grout is staining. Well above: water is behind the tile.' },
      { text: 'Press gently on tile just above the tub. Tile that moves or sounds hollow means water has been at the backer.' },
    ],
    watch: 'A pinless reading through tile is a comparison, not a measurement. The dry reference is half the result; write both numbers.',
    terms: [
      { term: 'Surround', means: 'The wall finish around a tub or shower.' },
      { term: 'Backer', means: 'The board behind the tile that it is set on.' },
    ],
  },
  'bath-gfci': {
    what: 'The bathroom receptacle beside the vanity, a GFCI. Bathrooms put water, grounded plumbing, and hair dryers within arm\'s reach, so this device has to actually trip.',
    look: [
      { cp: 'bath-gfci-test', tool: 'tester', text: 'Read the wiring pattern, then press device TEST and the tester GFCI button. Good: a click, power off, RESET brings it back. Bad: no trip and the receptacle stays live.' },
    ],
    pro: 'Trip, confirm dead with the tester, reset, confirm live. Note which device protects which receptacle; one GFCI often guards several.',
    watch: 'Judge by the trip, both ways. Do not condemn a device that trips because GFCIs sometimes fail, and do not pass one that has buttons but no trip.',
    terms: [
      { term: 'GFCI', means: 'Ground-fault circuit interrupter: shuts off power when current leaks to ground.' },
      { term: 'Downstream', means: 'Receptacles wired after a GFCI and protected by it.' },
    ],
  },
  'bath-fan': {
    what: 'The bathroom exhaust fan pulls shower moisture out before it soaks into drywall and grows mold. From here you can tell whether it moves air; where it sends that air is answered elsewhere.',
    look: [
      { cp: 'bath-fan-operation', text: 'Switch it on and test the draw at the grille with a tissue. Good: runs and draws steadily. Bad: dead, hums without drawing, rattles, or barely moves air.' },
      { text: 'Look at the ceiling around the grille for mildew or peeling paint, the marks of a room that stays damp.' },
    ],
    pro: 'Write yourself a note to follow this duct in the attic. Inspections are a chain of clues.',
    watch: 'From the bathroom you can only confirm airflow. Do not grade the duct route or termination from down here.',
    terms: [
      { term: 'Exhaust fan', means: 'A fan that moves room air to the outdoors.' },
      { term: 'Termination', means: 'Where a duct ends outside the house.' },
    ],
  },

  // ── PRIMARY BEDROOM ─────────────────────────────────────────────────────
  'pri-window': {
    what: 'A bedroom window doubles as an emergency escape: the second way out in a fire and the way in for a firefighter. Height and opening size decide whether a person can actually use it.',
    look: [
      { cp: 'egress-sill-height', text: 'Measure floor to the top of whatever you climb over, stool and frame included. Good: 44 in or lower, an opening a person fits through. Bad: over 44 in, or too small.' },
      { text: 'Open it fully. It should open without keys, tools, or special knowledge, and stay open.' },
    ],
    pro: 'Hook the tape on the finished floor and measure to the highest fixed part in the way, not to the glass.',
    watch: 'Many older homes predate current rules. Report the measurement and why it matters for escape; you are not the code official.',
    terms: [
      { term: 'Egress window', means: 'A window sized and placed for emergency escape and rescue.' },
      { term: 'Sill height', means: 'Floor to the bottom of the clear opening, measured to the top of the sill.' },
    ],
  },
  'pri-smoke-alarm': {
    what: 'The bedroom ceiling, where a smoke alarm belongs. People die in fires at night, and a closed bedroom door can keep smoke from a hall alarm until it is too late.',
    look: [
      { cp: 'bedroom-smoke-alarm', text: 'Scan the ceiling and upper walls. Good: an alarm inside the room, clear of the wall-ceiling corner, that sounds on test. Bad: no alarm in the room, only one in the hall.' },
      { text: 'If you can reach it safely, read the date on the back label too.' },
    ],
    watch: 'Older homes often predate in-bedroom alarms. Report what you observed, present or absent and the test result, without quoting code.',
    terms: [
      { term: 'Sleeping room', means: 'A bedroom; alarms are expected inside each one and outside the sleeping area.' },
      { term: 'Dead-air space', means: 'The corner where wall meets ceiling, where smoke is slow to reach.' },
    ],
  },
  'pri-receptacle': {
    what: 'A 3-slot receptacle. The third, round slot promises an equipment ground that carries fault current and trips the breaker. Whether the wire behind it exists only shows on a tester.',
    look: [
      { cp: 'open-ground', tool: 'tester', text: 'Plug in and match the lights to the legend. Correct: hot, neutral, and ground present, as far as it sees. Open ground: hot and neutral work, the third slot goes nowhere.' },
      { text: 'Test the other receptacles on this wall. One wiring fault often runs through a whole circuit.' },
    ],
    watch: 'A 3-slot face does not prove a ground. Report what the tester shows, not what the receptacle looks like.',
    terms: [
      { term: 'Equipment ground', means: 'The wire that carries fault current safely back to the panel.' },
      { term: 'Open ground', means: 'A grounding-type receptacle with no ground connected.' },
    ],
  },
  'pri-closet': {
    what: 'The closet light. Closets are small boxes of fabric and cardboard, and a hot bulb close to stored things can start a fire. The fixture type and its clearance to storage both matter.',
    look: [
      { cp: 'closet-light', text: 'Look at the fixture and how close the shelf sits. Good: a fully enclosed fixture mounted clear of storage. Bad: a bare bulb or open lamp holder near stacked boxes or clothes.' },
    ],
    watch: 'Judge how the closet is really used. A suitable fixture with storage piled up to it is still worth a sentence.',
    terms: [
      { term: 'Lamp holder', means: 'A bare socket, often porcelain with a pull chain, with no globe.' },
      { term: 'Enclosed fixture', means: 'A light whose lens fully covers the bulb.' },
    ],
  },

  // ── BEDROOM 2 ───────────────────────────────────────────────────────────
  'bed2-window': {
    what: 'A bedroom window fitted with security bars. Bars keep intruders out and can keep a sleeping child in and firefighters out, so how they open from inside is the whole question.',
    look: [
      { cp: 'security-bars', text: 'From inside, find how the bars open. Good: a working release that needs no key, tool, or special knowledge. Bad: fixed bars, a keyed lock, or a release painted shut.' },
      { text: 'Check that the window itself opens fully behind the bars.' },
    ],
    pro: 'If there is a release, operate it yourself. If someone says one exists that you cannot see, ask where and try it.',
    terms: [
      { term: 'Quick-release', means: 'An inside lever that frees security bars without a key or tool.' },
      { term: 'Escape opening', means: 'A window or door meant for getting out in an emergency.' },
    ],
  },
  'bed2-wall-crack': {
    what: 'A crack in the drywall above the door. Door corners are the weak point of a wall, so cracks show up there first. The shape of the crack and how the door works tell you what kind it is.',
    look: [
      { cp: 'drywall-crack', text: 'Work the door first, then read the crack. Good: thin, along a seam, flush both sides, door working normally. Bad: wide or widening, tapered, offset, or a door starting to bind.' },
    ],
    pro: 'Measure the width at its widest, run a fingertip across to feel for offset, and close the door slowly watching the head gap.',
    watch: 'Describe width, shape, offset, and the door. Do not diagnose a cause in the report, and do not call every hairline structural.',
    terms: [
      { term: 'Offset', means: 'One side of a crack sitting higher or proud of the other.' },
      { term: 'Tape joint', means: 'The taped seam where two drywall sheets meet.' },
    ],
  },
  'bed2-door': {
    what: 'An interior door. Besides privacy, a door is a quiet gauge of the frame around it: a square opening gives an even gap and a clean latch.',
    look: [
      { cp: 'door-latch', text: 'Close it slowly. Good: operates freely, gaps stay even all round, latch engages. Bad: rubs or binds, a wedge-shaped gap at the top corner, latch misses.' },
    ],
    pro: 'Read this door together with the wall above it and the doors across the house. One sticky door is a door; a pattern is a story.',
    watch: 'Doors stick for small reasons: humidity, paint, a loose hinge screw. Describe what it does before deciding what it means.',
    terms: [
      { term: 'Strike', means: 'The metal plate on the jamb the latch catches.' },
      { term: 'Racking', means: 'A frame pushed out of square.' },
    ],
  },

  // ── HALL ────────────────────────────────────────────────────────────────
  'hall-attic-ladder': {
    what: 'Folding stairs up to the attic. They carry you and whatever you carry through hinges and a frame fastened into the ceiling framing. When they fail, it is a fall from ceiling height.',
    look: [
      { cp: 'attic-ladder', text: 'Before climbing, check frame and pivot plates. Good: every hinge bolt in, frame fastened to framing as the label says, feet flat. Bad: missing bolts, nails or drywall screws, a shifting frame.' },
      { text: 'Unfold it fully: sections should line up straight, rails uncracked, treads tight.' },
    ],
    pro: 'Read the manufacturer label on the panel; it states the fasteners required. Look first, weight second, every time.',
    watch: 'Your safety is part of the inspection. If any ladder looks unsafe, not entering is valid, but the report must say so and why.',
    terms: [
      { term: 'Pivot plate', means: 'The hinge bracket that connects the stairs to their frame.' },
      { term: 'Lag screw', means: 'A heavy wood screw driven into framing.' },
    ],
  },
  'hall-co-alarm': {
    what: 'The hallway alarm outside the bedrooms. Carbon monoxide has no color or smell, and a smoke alarm does not sense it. This house burns gas and wood and has an attached garage.',
    look: [
      { cp: 'co-alarm', text: 'Read the label, not the shape. Good: a CO-rated unit, standalone or combined, that sounds on test. Bad: smoke-only, with no CO coverage near the bedrooms.' },
    ],
    pro: 'Check the hall and each bedroom for a CO alarm before you decide. Warn the occupants before pressing test.',
    watch: 'In a home with fuel-burning appliances, a fireplace, or an attached garage, whether CO alarms are present belongs in the report. Describe it; do not quote code.',
    terms: [
      { term: 'CO alarm', means: 'An alarm that senses carbon monoxide.' },
      { term: 'Combination alarm', means: 'One unit that senses both smoke and CO.' },
    ],
  },
  'hall-return': {
    what: 'A return grille: where house air is pulled back to the furnace to be heated or cooled again. Some systems keep the filter here; others keep it at the equipment.',
    look: [
      { cp: 'return-grille', text: 'Check it with the system running. Good: unobstructed, undamaged, and drawing air. Bad: blocked by furniture, crushed, heavily soiled, or not drawing.' },
    ],
    watch: 'Filters can sit at a return grille or at the equipment. Locate the system filter before you write anything about filters.',
    terms: [
      { term: 'Return air', means: 'Air drawn back to the HVAC system from the house.' },
      { term: 'Supply register', means: 'A grille that blows conditioned air into a room.' },
    ],
  },

  // ── LAUNDRY / UTILITY ───────────────────────────────────────────────────
  'util-furnace': {
    what: 'A gas furnace. It burns gas, heats air across a heat exchanger, and vents combustion gases, including carbon monoxide, out through a metal pipe. Air in, flame, gases out: each step can fail.',
    look: [
      { cp: 'furnace-filter', text: 'Slide the filter out. Good: light dust, frame square, airflow arrow toward the blower. Bad: caked gray, bowed or collapsing, missing, or in backward.' },
      { cp: 'furnace-burners', tool: 'flashlight', text: 'Light through the sight window while it fires. Good: steady blue flames sitting on the ports. Bad: yellow or lazy flames, flame rolling out, soot, scorching, or rust scale.' },
      { cp: 'furnace-flue', text: 'Follow the vent pipe from the furnace. Good: rises the whole way, screws at every joint, no rust or scorch. Bad: a separated joint, a downhill run, rust streaks, missing screws.' },
      { text: 'Look for a gas shutoff within reach of the furnace and a drip leg ahead of its gas valve.' },
    ],
    pro: 'Watch the flame as the blower starts. A flame that jumps or changes shape when air begins moving is worth writing down.',
    watch: 'A home inspection does not take the furnace apart to see the heat exchanger. Report what the sight window and readily openable panels show, and which you opened.',
    terms: [
      { term: 'Vent connector', means: 'The metal pipe from the appliance to the chimney or vent.' },
      { term: 'Sight window', means: 'A small window in the burner door for viewing the flame.' },
    ],
  },
  'util-dryer': {
    what: 'A clothes dryer and its exhaust duct. Dryer fires are mostly lint fires, and the duct decides how much lint collects and how hot the dryer runs.',
    look: [
      { cp: 'dryer-duct', text: 'Look behind the dryer at the duct to the wall. Good: rigid or semi-rigid metal, or a listed foil transition, short and open. Bad: combustible duct, long or crushed runs, heavy lint.' },
      { text: 'Plan to check the outside hood: the flap should open with the dryer running, and no screen should catch lint.' },
    ],
    pro: 'Run the dryer briefly, then feel for airflow outside. Weak flow at the hood with the dryer running points back to the duct.',
    terms: [
      { term: 'Transition duct', means: 'The short connector between the dryer and the wall duct.' },
      { term: 'Termination hood', means: 'The exterior fitting with a flap where the duct exits.' },
    ],
  },
  'util-washer': {
    what: 'The washing machine and its supply hoses. Those hoses hold full house water pressure day and night, and a burst one can flood a house in an hour.',
    look: [
      { cp: 'washer-hoses', text: 'Follow both hoses, valves to machine. Good: no bulges, kinks, cracks, or drips. Bad: a bulge, cracks at a bend, weeping fittings. Rubber fails this way far more than braided.' },
      { text: 'Look at the floor behind the machine and around the drain standpipe for old water marks.' },
    ],
    watch: 'Old washer valves can start leaking the moment they are touched, and operating them is not expected. Look, do not turn.',
    terms: [
      { term: 'Braided hose', means: 'A supply hose wrapped in stainless steel mesh.' },
      { term: 'Standpipe', means: 'The vertical drain pipe the washer hose discharges into.' },
    ],
  },

  // ── GARAGE ──────────────────────────────────────────────────────────────
  'gar-panel': {
    what: 'The main electrical panel, dead front off: service conductors in at the top, breakers on the bus bars, branch wires out to the house. It is the most hazardous thing you open all day.',
    look: [
      { cp: 'panel-labeling', text: 'Read the directory on the door. Good: every breaker clearly labeled. Bad: blanks, or only a few circuits named.' },
      { cp: 'panel-knockouts', text: 'Scan all six sides of the cabinet and the dead front. Good: every hole filled by a connector or its slug. Bad: open knockouts or empty breaker slots.' },
      { cp: 'panel-rust', text: 'Look over the interior and the top entry. Good: dry enclosure, clean metal at connections, entry sealed. Bad: any sign water has been inside, such as corrosion, staining, or deposits.' },
      { cp: 'panel-aluminum-sec', text: 'Name the service conductor metal at the main lugs. Good: tight lugs rated for that metal, clean insulation. Bad: discoloration, melting, or loose strands.' },
      { cp: 'panel-double-tap', text: 'Check every breaker terminal. Good: each terminal holds only what its breaker is listed for. Bad: more conductors under a terminal than its labeling allows.' },
      { cp: 'panel-white-hot', text: 'Follow any white wire landed on a breaker. Good: re-marked black or red, often half of a 240-volt pair. Bad: plain white on a single-pole breaker.' },
      { cp: 'panel-breaker-heat', tool: 'thermal', text: 'Scan with loads running. Even temperatures that follow load: normal. One terminal much hotter than its neighbors: a connection heating up.' },
    ],
    pro: 'Gloves, eye protection, dry footing. Read the whole panel before anything near it moves, and never touch, tighten, or pull anything inside.',
    watch: 'Stranded aluminum service conductors and solid single-strand aluminum branch wiring are different things with different histories. Know which one you are describing.',
    terms: [
      { term: 'Dead front', means: 'The inner cover with breaker cut-outs that shields live parts.' },
      { term: 'Double tap', means: 'Two conductors under one terminal made for one.' },
      { term: 'Main lugs', means: 'The terminals where the service conductors land in the panel.' },
    ],
  },
  'gar-water-heater': {
    what: 'A 50-gallon gas water heater in the garage: a flame under a pressurized tank. A pro checks how it relieves pressure, how it vents, how gas reaches it, and whether its flame can meet garage fumes.',
    look: [
      { cp: 'wh-age', text: 'Read the data plate: fuel, capacity, manufacture date, any FVIR listing. Good: tank and fittings dry, burner and controls operating. Bad: leaks, heavy corrosion, or no hot water.' },
      { cp: 'wh-elevation', text: 'Find the burner and pilot opening. Good: an FVIR listing, or the opening at least 18 in above the floor on a solid stand. Bad: a non-FVIR burner down near the slab.' },
      { cp: 'wh-sediment-trap', text: 'Follow the gas line into the control valve. Good: a tee just ahead of the valve with a capped pipe hanging below. Bad: the line drops straight in with no trap.' },
      { cp: 'wh-draft-hood', text: 'Look at the draft hood and vent. Good: hood centered and seated, connector rising with screwed joints. Bad: hood off-center, scorching, rust, or melted plastic on the tank top.' },
      { cp: 'wh-tpr-discharge', text: 'Find the relief valve and pipe. Good: full-size, hot-water-rated pipe ending within about 6 in of the floor or at a drain. Bad: no pipe, a threaded end, a valve in it.' },
    ],
    pro: 'Never lift the TPR lever during an inspection; a valve that opens may not reseat. Note the gas shutoff and protection from car bumpers.',
    watch: 'Age and condition are separate facts. Report the plate date plainly with what you observed, and leave remaining-life forecasts out.',
    terms: [
      { term: 'TPR valve', means: 'Temperature and pressure relief valve: opens to dump water if the tank overheats or overpressures.' },
      { term: 'FVIR', means: 'Flammable vapor ignition resistant: a design that keeps floor fumes from reaching the flame.' },
      { term: 'Drip leg', means: 'A capped pipe below a tee that catches debris in the gas line.' },
    ],
  },
  'gar-fire-door': {
    what: 'The door from the garage into the house. Together with the common wall it keeps car exhaust and a garage fire out of the living space, and it only does that when it is solid and closed.',
    look: [
      { cp: 'fire-door-closer', text: 'Open it fully and let go, then try from halfway. Good: spring hinges or a closer pull it shut and latched. Bad: plain hinges, the door stays open or stops short.' },
      { cp: 'fire-door-pet', text: 'Look over the whole slab, both faces. Good: solid wood, solid steel, or fire-rated, with nothing cut through. Bad: a pet door, glass panel, or any hole cut into it.' },
      { text: 'Check the hinge edge for a fire label, and that the latch and weatherstrip seal the door tight.' },
    ],
    watch: 'Report what the door does and why the separation matters. Requirements for this door have changed over the years, so describe it, do not quote code.',
    terms: [
      { term: 'Self-closing', means: 'A door that shuts and latches on its own from any open position.' },
      { term: 'Fire separation', means: 'The wall, ceiling, and door that slow fire and fumes between garage and house.' },
    ],
  },
  'gar-overhead-door': {
    what: 'The overhead garage door and opener. A closing door is heavy enough to crush a child, so openers carry two separate safety systems: reverse on contact, and photo-eyes near the floor.',
    look: [
      { cp: 'door-photo-eyes', text: 'Measure the photo-eyes, then break the beam with your foot as the door closes. Good: about 6 in or lower, and the door reverses. Bad: mounted high, misaligned, or ignored.' },
      { cp: 'door-auto-reverse', text: 'Lay a 2x4 flat under the door and close it. Good: it stops and reverses on contact. Bad: it keeps pressing down on the board. Keep a hand on the wall button.' },
      { text: 'Glance at springs, cables, and rail brackets for breaks, fraying, or loose fasteners.' },
    ],
    watch: 'Springs and cables store dangerous energy. Report what you see; never adjust them or the opener force settings yourself.',
    terms: [
      { term: 'Photo-eyes', means: 'Paired sensors that reverse the door when the beam is broken.' },
      { term: 'Auto-reverse', means: 'The opener reversing when the door meets resistance.' },
      { term: 'Torsion spring', means: 'The wound spring above the door that counterbalances it.' },
    ],
  },
  'gar-firewall': {
    what: 'The common wall between garage and house. Its garage-side drywall is the fire separation between where cars and fuel live and where people sleep. It only works if it is continuous.',
    look: [
      { cp: 'firewall-penetration', text: 'Scan the garage side of the wall, high and low. Good: continuous taped drywall, pipes and wires sealed tight. Bad: holes, open gaps around penetrations, or missing panels.' },
      { text: 'Include the garage ceiling and any attic hatch here; the separation runs there too.' },
    ],
    watch: 'Board type and thickness are hard to confirm by eye. Report the holes and gaps you can see.',
    terms: [
      { term: 'Penetration', means: 'Anywhere a pipe, wire, or duct passes through the wall.' },
      { term: 'Gypsum board', means: 'Drywall; its fire resistance is why it lines the garage.' },
    ],
  },
};

export const ZONE_GUIDES_IN = {
  living: { intro: 'The living room. Work it top to bottom: ceiling stains, alarms, a window, at least one receptacle. The fireplace gets its own slow look with gloves, eye protection, and a light. Never reach into a firebox that is hot or holds live ash.' },
  kitchen: { intro: 'The kitchen: water, heat, and power in one room. Start the dishwasher on a full cycle first so it finishes while you work. Then the range, the hood, the sink cabinet with water running, and the receptacles near the sink.' },
  bath: { intro: 'The bathroom. Run every fixture and flush the toilet a few times before you judge anything. Water damage here hides behind tile and under floors, so the moisture meter does the seeing. Test the receptacle and the fan before you leave.' },
  primary: { intro: 'The primary bedroom. People sleep here through fires, so a pro checks the escape window, the smoke alarm, and at least one receptacle, then the closet. Measure, test, and read labels instead of trusting how things look.' },
  bed2: { intro: 'Bedroom 2. Same bedroom checklist: escape window, alarm, receptacle. Then read walls and doors together. A crack above a door means little on its own and a lot more when the door binds.' },
  hall: { intro: 'The hall outside the bedrooms. Read the alarm label here, check the return grille with the system running, and look up at the attic stairs. Inspect the ladder before anyone climbs it, you included.' },
  laundry: { intro: 'The laundry and utility room: gas furnace, dryer, washer. Fuel-burning equipment comes first: how it gets air, how its flame looks, how it vents. Then follow the water and the lint: supply hoses, drain, dryer duct.' },
  garage: { intro: 'The garage, one step down from the house. Cars, fuel, the main panel, and a gas water heater share this space. A pro checks the separation to the house, the door safety reverse, the water heater, and opens the panel with gloves and dry footing.' },
};
