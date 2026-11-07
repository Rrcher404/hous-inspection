// =============================================================================
// MANIFEST: the single source of truth that ties the game together.
//
//   zone        -> where in the house (engine owns geometry + placement)
//   component   -> one inspectable thing; `id` is ALSO the model builder key
//   checkpoint  -> one judgment call inside a component (clickable sub-mesh)
//
// checkpoint.kind
//   'variable' : randomized per inspection, rendered as 'defect' OR 'ok'
//   'defect'   : always defective in this house
//   'ok'       : always acceptable (a red herring that teaches not to over-call)
// checkpoint.tool : the tool needed to SEE the condition (omit = eyes are enough)
// checkpoint.label: neutral location label shown to the player. NEVER reveals the answer.
//
// component.mount (model origin convention, see CONTEXT.md):
//   'floor'/'ground' : origin bottom-centre, sits on y=0, front faces +Z
//   'wall'           : origin at back-centre-bottom, back flat on z=0, front faces +Z
//   'ceiling'        : origin top-centre, hangs down into -Y, front faces +Z
//   'roof'           : origin bottom-centre on a roof plane (engine tilts it)
// component.size : approx [width, height, depth] in metres; builders should respect it.
//
// Engine places components; models build them; content explains them. All three key
// off the ids below. DO NOT rename ids without updating every data file.
// =============================================================================

export const ADDRESS = {
  street: '417 Loblolly Lane',
  city: 'Raleigh, NC 27610',
  built: 1987,
  style: 'Single-story ranch over vented crawlspace, attached 2-car garage',
  sqft: 1480,
  client: 'Dana & Marcus Whitfield (buyers)',
};

export const ZONES = [
  { id: 'exterior', name: 'Exterior & Grounds', type: 'exterior', dark: false, courses: ['ext-fund', 'ext-how', 'moisture', 'elec-res', 'egress'] },
  { id: 'roof',     name: 'Roof',               type: 'roof',     dark: false, courses: ['roof', 'roof-asphalt', 'fireplace'] },
  { id: 'deck',     name: 'Rear Deck',          type: 'exterior', dark: false, courses: ['deck', 'structural', 'egress'] },
  { id: 'shed',     name: 'Garden Studio (tile roof)', type: 'exterior', dark: false, courses: ['roof-tile', 'roof'] },
  { id: 'living',   name: 'Living Room',        type: 'interior', dark: false, courses: ['fireplace', 'elec-res', 'moisture', 'attic-interior'] },
  { id: 'kitchen',  name: 'Kitchen',            type: 'interior', dark: false, courses: ['appliances', 'plumbing', 'elec-res'] },
  { id: 'hall',     name: 'Hallway',            type: 'interior', dark: false, courses: ['attic-interior', 'egress', 'sop-25'] },
  { id: 'bath',     name: 'Hall Bathroom',      type: 'interior', dark: false, courses: ['plumbing', 'moisture', 'elec-res'] },
  { id: 'primary',  name: 'Primary Bedroom',    type: 'interior', dark: false, courses: ['egress', 'elec-res', 'attic-interior'] },
  { id: 'bed2',     name: 'Bedroom 2',          type: 'interior', dark: false, courses: ['egress', 'structural', 'elec-res'] },
  { id: 'laundry',  name: 'Laundry / Utility',  type: 'interior', dark: false, courses: ['hvac', 'appliances', 'plumbing'] },
  { id: 'garage',   name: 'Garage',             type: 'interior', dark: false, courses: ['elec-adv', 'water-heater', 'egress'] },
  { id: 'attic',    name: 'Attic',              type: 'attic',    dark: true,  courses: ['attic-interior', 'structural', 'hvac', 'elec-res'] },
  { id: 'crawl',    name: 'Crawlspace',         type: 'crawl',    dark: true,  courses: ['crawl-adv', 'foundation', 'structural', 'moisture', 'plumbing'] },
];

const c = (o) => o; // readability helper

export const COMPONENTS = [
  // ───────────────────────────── EXTERIOR ─────────────────────────────
  c({ id: 'ext-grading', zone: 'exterior', name: 'Grading at foundation', mount: 'ground', size: [6, 0.4, 3], courses: ['ext-fund', 'moisture'],
    checkpoints: [
      { id: 'grading-slope', label: 'Soil slope along foundation', kind: 'variable' },
    ] }),
  c({ id: 'ext-downspout', zone: 'exterior', name: 'Downspout & discharge', mount: 'wall', size: [0.6, 3.0, 1.6], courses: ['ext-how', 'moisture'],
    checkpoints: [
      { id: 'downspout-discharge', label: 'Downspout outlet', kind: 'variable' },
    ] }),
  c({ id: 'ext-gutter', zone: 'exterior', name: 'Gutter run (front eave)', mount: 'wall', size: [4, 0.4, 0.3], courses: ['ext-how', 'roof'],
    checkpoints: [
      { id: 'gutter-debris', label: 'Gutter trough', kind: 'defect' },
    ] }),
  c({ id: 'ext-siding', zone: 'exterior', name: 'Vinyl siding (east wall)', mount: 'wall', size: [3, 2.4, 0.1], courses: ['ext-fund', 'ext-how'],
    checkpoints: [
      { id: 'siding-soil-clearance', label: 'Bottom edge of siding', kind: 'defect' },
      { id: 'siding-damage', label: 'Siding panels', kind: 'variable' },
    ] }),
  c({ id: 'ext-window', zone: 'exterior', name: 'Living room window (exterior)', mount: 'wall', size: [1.6, 1.4, 0.2], courses: ['ext-how', 'moisture'],
    checkpoints: [
      { id: 'window-igu-seal', label: 'Insulated glass panes', kind: 'variable' },
      { id: 'window-sill-caulk', label: 'Sill and trim sealant', kind: 'ok' },
    ] }),
  c({ id: 'ext-hose-bib', zone: 'exterior', name: 'Hose bib', mount: 'wall', size: [0.25, 0.25, 0.3], courses: ['plumbing', 'ext-how'],
    checkpoints: [
      { id: 'hose-bib-backflow', label: 'Faucet outlet', kind: 'variable' },
    ] }),
  c({ id: 'ext-service-drop', zone: 'exterior', name: 'Electrical service drop & meter', mount: 'wall', size: [1.2, 3.5, 0.6], courses: ['elec-res', 'elec-adv'],
    checkpoints: [
      { id: 'service-drop-clearance', label: 'Overhead service conductors', kind: 'defect' },
      { id: 'service-drip-loop', label: 'Drip loop at weatherhead', kind: 'ok' },
      { id: 'meter-base', label: 'Meter base', kind: 'ok' },
    ] }),
  c({ id: 'ext-ac-condenser', zone: 'exterior', name: 'A/C condenser', mount: 'ground', size: [0.9, 0.9, 0.9], courses: ['hvac'],
    checkpoints: [
      { id: 'condenser-level', label: 'Condenser pad', kind: 'variable' },
      { id: 'condenser-line-insulation', label: 'Refrigerant line set', kind: 'defect' },
      { id: 'condenser-disconnect', label: 'Service disconnect', kind: 'ok' },
    ] }),
  c({ id: 'ext-receptacle', zone: 'exterior', name: 'Exterior receptacle', mount: 'wall', size: [0.2, 0.25, 0.15], courses: ['elec-res'],
    checkpoints: [
      { id: 'ext-gfci', label: 'Receptacle (test it)', kind: 'variable', tool: 'tester' },
      { id: 'ext-receptacle-cover', label: 'Weather cover', kind: 'defect' },
    ] }),
  c({ id: 'ext-front-steps', zone: 'exterior', name: 'Front entry steps', mount: 'ground', size: [1.8, 0.9, 1.6], courses: ['egress', 'ext-how'],
    checkpoints: [
      { id: 'steps-handrail', label: 'Stair handrail', kind: 'defect' },
      { id: 'steps-riser-height', label: 'Riser heights', kind: 'ok' },
    ] }),
  c({ id: 'ext-driveway', zone: 'exterior', name: 'Driveway', mount: 'ground', size: [5, 0.1, 8], courses: ['ext-fund'],
    checkpoints: [
      { id: 'driveway-cracks', label: 'Concrete surface', kind: 'ok' },
    ] }),
  c({ id: 'ext-crawl-access', zone: 'exterior', name: 'Crawlspace access door', mount: 'wall', size: [0.8, 0.6, 0.1], courses: ['crawl-adv'],
    checkpoints: [
      { id: 'crawl-door', label: 'Access door & foundation vent', kind: 'ok' },
    ], portal: 'crawl' }),
  c({ id: 'ext-ladder', zone: 'exterior', name: 'Ladder to roof', mount: 'wall', size: [0.5, 3.6, 1.0], courses: ['roof'],
    checkpoints: [] , portal: 'roof' }),

  // ───────────────────────────── ROOF ─────────────────────────────
  c({ id: 'roof-shingles', zone: 'roof', name: 'Asphalt shingle field', mount: 'roof', size: [3, 0.1, 2.5], courses: ['roof-asphalt', 'roof'],
    checkpoints: [
      { id: 'shingle-granule-loss', label: 'Shingle surface', kind: 'defect' },
      { id: 'shingle-exposed-nails', label: 'Shingle fasteners', kind: 'variable' },
    ] }),
  c({ id: 'roof-chimney', zone: 'roof', name: 'Chimney (above roofline)', mount: 'roof', size: [0.9, 1.5, 0.9], courses: ['fireplace', 'roof'],
    checkpoints: [
      { id: 'chimney-crown', label: 'Chimney crown', kind: 'defect' },
      { id: 'chimney-cap', label: 'Flue top', kind: 'variable' },
      { id: 'chimney-flashing', label: 'Chimney-to-roof flashing', kind: 'variable' },
    ] }),
  c({ id: 'roof-vent-boot', zone: 'roof', name: 'Plumbing vent pipe', mount: 'roof', size: [0.4, 0.5, 0.4], courses: ['roof', 'plumbing'],
    checkpoints: [
      { id: 'vent-boot', label: 'Pipe boot / flashing', kind: 'variable' },
    ] }),
  c({ id: 'roof-edge', zone: 'roof', name: 'Eave edge', mount: 'roof', size: [3, 0.2, 0.4], courses: ['roof-asphalt', 'roof'],
    checkpoints: [
      { id: 'drip-edge', label: 'Edge metal', kind: 'variable' },
    ] }),
  c({ id: 'roof-valley', zone: 'roof', name: 'Roof valley', mount: 'roof', size: [0.8, 0.1, 3], courses: ['roof-asphalt'],
    checkpoints: [
      { id: 'valley-closed-cut', label: 'Valley shingles', kind: 'ok' },
    ] }),
  c({ id: 'roof-ridge-vent', zone: 'roof', name: 'Ridge vent', mount: 'roof', size: [3, 0.15, 0.4], courses: ['roof', 'attic-interior'],
    checkpoints: [
      { id: 'ridge-vent', label: 'Ridge cap & vent', kind: 'ok' },
    ] }),

  // ───────────────────────────── DECK ─────────────────────────────
  c({ id: 'deck-ledger', zone: 'deck', name: 'Deck ledger board', mount: 'wall', size: [4, 0.3, 0.3], courses: ['deck', 'structural'],
    checkpoints: [
      { id: 'ledger-fasteners', label: 'Ledger fasteners', kind: 'defect' },
      { id: 'ledger-flashing', label: 'Top of ledger', kind: 'variable' },
    ] }),
  c({ id: 'deck-framing', zone: 'deck', name: 'Deck joists & hangers', mount: 'free', size: [2, 0.3, 3], courses: ['deck'],
    checkpoints: [
      { id: 'joist-hangers', label: 'Joist-to-ledger connections', kind: 'variable' },
    ] }),
  c({ id: 'deck-guard', zone: 'deck', name: 'Deck guardrail', mount: 'floor', size: [3, 1.0, 0.1], courses: ['deck', 'egress'],
    checkpoints: [
      { id: 'baluster-spacing', label: 'Baluster spacing', kind: 'defect' },
      { id: 'guard-height', label: 'Guard height', kind: 'ok' },
    ] }),
  c({ id: 'deck-stairs', zone: 'deck', name: 'Deck stairs', mount: 'floor', size: [1.0, 0.8, 1.6], courses: ['deck', 'egress'],
    checkpoints: [
      { id: 'deck-stair-handrail', label: 'Stair handrail', kind: 'variable' },
    ] }),
  c({ id: 'deck-posts', zone: 'deck', name: 'Deck support posts', mount: 'ground', size: [0.3, 0.8, 0.3], courses: ['deck', 'structural'],
    checkpoints: [
      { id: 'post-footing', label: 'Post base / footing', kind: 'variable' },
    ] }),

  // ───────────────────────────── SHED (TILE ROOF) ─────────────────────────────
  c({ id: 'shed-tile-roof', zone: 'shed', name: 'Clay tile roof (garden studio)', mount: 'ground', size: [3, 2.8, 3], courses: ['roof-tile'],
    checkpoints: [
      { id: 'tile-broken', label: 'Field tiles', kind: 'defect' },
      { id: 'tile-slipped', label: 'Tile courses near eave', kind: 'variable' },
      { id: 'tile-hip-mortar', label: 'Hip / ridge mortar', kind: 'ok' },
    ] }),

  // ───────────────────────────── LIVING ROOM ─────────────────────────────
  c({ id: 'liv-fireplace', zone: 'living', name: 'Masonry fireplace', mount: 'wall', size: [1.8, 2.4, 0.8], courses: ['fireplace'],
    checkpoints: [
      { id: 'firebox-brick', label: 'Firebox walls', kind: 'defect' },
      { id: 'hearth-extension', label: 'Hearth extension', kind: 'variable' },
      { id: 'damper', label: 'Damper', kind: 'variable' },
      { id: 'flue-creosote', label: 'Smoke chamber / flue (look up)', kind: 'variable', tool: 'flashlight' },
    ] }),
  c({ id: 'liv-smoke-alarm', zone: 'living', name: 'Smoke alarm', mount: 'ceiling', size: [0.15, 0.06, 0.15], courses: ['sop-25', 'egress'],
    checkpoints: [
      { id: 'smoke-alarm-age', label: 'Alarm (check the back label)', kind: 'defect' },
    ] }),
  c({ id: 'liv-receptacle', zone: 'living', name: 'Wall receptacle', mount: 'wall', size: [0.08, 0.12, 0.04], courses: ['elec-res'],
    checkpoints: [
      { id: 'liv-polarity', label: 'Receptacle (test it)', kind: 'variable', tool: 'tester' },
    ] }),
  c({ id: 'liv-ceiling-stain', zone: 'living', name: 'Ceiling stain', mount: 'ceiling', size: [0.8, 0.02, 0.6], courses: ['moisture', 'attic-interior'],
    checkpoints: [
      { id: 'ceiling-stain', label: 'Discoloured drywall', kind: 'variable', tool: 'moisture' },
    ] }),
  c({ id: 'liv-window', zone: 'living', name: 'Living room window (interior)', mount: 'wall', size: [1.6, 1.4, 0.2], courses: ['attic-interior'],
    checkpoints: [
      { id: 'window-operation', label: 'Sash operation & locks', kind: 'ok' },
    ] }),

  // ───────────────────────────── KITCHEN ─────────────────────────────
  c({ id: 'kit-range', zone: 'kitchen', name: 'Electric range', mount: 'floor', size: [0.76, 0.95, 0.66], courses: ['appliances'],
    checkpoints: [
      { id: 'range-anti-tip', label: 'Range base / rear foot', kind: 'defect' },
      { id: 'range-burners', label: 'Burners & oven', kind: 'ok' },
    ] }),
  c({ id: 'kit-dishwasher', zone: 'kitchen', name: 'Dishwasher', mount: 'floor', size: [0.6, 0.86, 0.6], courses: ['appliances', 'plumbing'],
    checkpoints: [
      { id: 'dw-drain-loop', label: 'Drain hose route (under sink)', kind: 'variable' },
      { id: 'dw-operation', label: 'Run cycle', kind: 'ok' },
    ] }),
  c({ id: 'kit-sink', zone: 'kitchen', name: 'Kitchen sink cabinet', mount: 'floor', size: [0.9, 0.9, 0.6], courses: ['plumbing', 'moisture'],
    checkpoints: [
      { id: 'sink-flex-drain', label: 'Trap & drain pipe', kind: 'variable' },
      { id: 'sink-leak', label: 'Cabinet floor', kind: 'variable', tool: 'moisture' },
      { id: 'disposal-wiring', label: 'Disposal electrical connection', kind: 'defect' },
    ] }),
  c({ id: 'kit-gfci', zone: 'kitchen', name: 'Countertop receptacle', mount: 'wall', size: [0.08, 0.12, 0.04], courses: ['elec-res'],
    checkpoints: [
      { id: 'kit-gfci-test', label: 'Receptacle (test it)', kind: 'variable', tool: 'tester' },
    ] }),
  c({ id: 'kit-hood', zone: 'kitchen', name: 'Range hood', mount: 'wall', size: [0.76, 0.3, 0.5], courses: ['appliances'],
    checkpoints: [
      { id: 'hood-recirc', label: 'Hood exhaust type', kind: 'ok' },
    ] }),
  c({ id: 'kit-back-door', zone: 'kitchen', name: 'Rear door to deck', mount: 'wall', size: [0.9, 2.05, 0.15], courses: ['egress', 'deck'],
    checkpoints: [
      { id: 'door-threshold', label: 'Threshold step down to deck', kind: 'ok' },
    ], portal: 'deck' }),

  // ───────────────────────────── BATH ─────────────────────────────
  c({ id: 'bath-toilet', zone: 'bath', name: 'Toilet', mount: 'floor', size: [0.4, 0.8, 0.7], courses: ['plumbing', 'moisture'],
    checkpoints: [
      { id: 'toilet-loose', label: 'Toilet mounting (rock it)', kind: 'defect' },
      { id: 'toilet-base-moisture', label: 'Floor at toilet base', kind: 'variable', tool: 'moisture' },
    ] }),
  c({ id: 'bath-vanity', zone: 'bath', name: 'Vanity & sink drain', mount: 'floor', size: [0.9, 0.85, 0.55], courses: ['plumbing'],
    checkpoints: [
      { id: 'vanity-s-trap', label: 'Trap configuration', kind: 'defect' },
      { id: 'vanity-supply-valves', label: 'Supply stops', kind: 'ok' },
    ] }),
  c({ id: 'bath-tub', zone: 'bath', name: 'Tub / shower surround', mount: 'floor', size: [1.5, 1.9, 0.8], courses: ['plumbing', 'moisture'],
    checkpoints: [
      { id: 'tub-caulk', label: 'Tub-to-wall joint', kind: 'variable' },
      { id: 'tub-wall-moisture', label: 'Tile wall below soap dish', kind: 'variable', tool: 'moisture' },
    ] }),
  c({ id: 'bath-gfci', zone: 'bath', name: 'Bathroom receptacle', mount: 'wall', size: [0.08, 0.12, 0.04], courses: ['elec-res'],
    checkpoints: [
      { id: 'bath-gfci-test', label: 'Receptacle (test it)', kind: 'variable', tool: 'tester' },
    ] }),
  c({ id: 'bath-fan', zone: 'bath', name: 'Exhaust fan', mount: 'ceiling', size: [0.3, 0.1, 0.3], courses: ['attic-interior', 'moisture'],
    checkpoints: [
      { id: 'bath-fan-operation', label: 'Fan operation', kind: 'ok' },
    ] }),

  // ───────────────────────────── PRIMARY BEDROOM ─────────────────────────────
  c({ id: 'pri-window', zone: 'primary', name: 'Bedroom window', mount: 'wall', size: [1.0, 1.0, 0.2], courses: ['egress'],
    checkpoints: [
      { id: 'egress-sill-height', label: 'Window sill height & opening', kind: 'defect' },
    ] }),
  c({ id: 'pri-smoke-alarm', zone: 'primary', name: 'Bedroom ceiling', mount: 'ceiling', size: [0.4, 0.06, 0.4], courses: ['sop-25', 'egress'],
    checkpoints: [
      { id: 'bedroom-smoke-alarm', label: 'Smoke alarm location', kind: 'variable' },
    ] }),
  c({ id: 'pri-receptacle', zone: 'primary', name: '3-prong receptacle', mount: 'wall', size: [0.08, 0.12, 0.04], courses: ['elec-res'],
    checkpoints: [
      { id: 'open-ground', label: 'Receptacle (test it)', kind: 'defect', tool: 'tester' },
    ] }),
  c({ id: 'pri-closet', zone: 'primary', name: 'Closet light', mount: 'ceiling', size: [0.4, 0.2, 0.4], courses: ['elec-res'],
    checkpoints: [
      { id: 'closet-light', label: 'Closet light fixture', kind: 'variable' },
    ] }),

  // ───────────────────────────── BEDROOM 2 ─────────────────────────────
  c({ id: 'bed2-window', zone: 'bed2', name: 'Bedroom 2 window', mount: 'wall', size: [1.0, 1.2, 0.25], courses: ['egress'],
    checkpoints: [
      { id: 'security-bars', label: 'Window bars', kind: 'defect' },
    ] }),
  c({ id: 'bed2-wall-crack', zone: 'bed2', name: 'Wall above door', mount: 'wall', size: [1.2, 0.8, 0.02], courses: ['structural', 'attic-interior'],
    checkpoints: [
      { id: 'drywall-crack', label: 'Crack at door corner', kind: 'variable' },
    ] }),
  c({ id: 'bed2-door', zone: 'bed2', name: 'Bedroom 2 door', mount: 'wall', size: [0.8, 2.05, 0.1], courses: ['attic-interior'],
    checkpoints: [
      { id: 'door-latch', label: 'Door swing & latch', kind: 'ok' },
    ] }),

  // ───────────────────────────── HALL ─────────────────────────────
  c({ id: 'hall-attic-ladder', zone: 'hall', name: 'Attic pull-down stairs', mount: 'ceiling', size: [0.7, 0.1, 1.4], courses: ['attic-interior', 'egress'],
    checkpoints: [
      { id: 'attic-ladder', label: 'Ladder hinges & fasteners', kind: 'defect' },
    ], portal: 'attic' }),
  c({ id: 'hall-co-alarm', zone: 'hall', name: 'Hallway alarm', mount: 'ceiling', size: [0.15, 0.06, 0.15], courses: ['sop-25', 'hvac'],
    checkpoints: [
      { id: 'co-alarm', label: 'Alarm type (smoke / CO)', kind: 'variable' },
    ] }),
  c({ id: 'hall-return', zone: 'hall', name: 'HVAC return grille', mount: 'wall', size: [0.6, 0.6, 0.05], courses: ['hvac'],
    checkpoints: [
      { id: 'return-grille', label: 'Return air grille', kind: 'ok' },
    ] }),

  // ───────────────────────────── LAUNDRY / UTILITY ─────────────────────────────
  c({ id: 'util-furnace', zone: 'laundry', name: 'Gas furnace', mount: 'floor', size: [0.55, 1.4, 0.75], courses: ['hvac'],
    checkpoints: [
      { id: 'furnace-filter', label: 'Air filter slot', kind: 'defect' },
      { id: 'furnace-flue', label: 'Vent connector (flue pipe)', kind: 'variable' },
      { id: 'furnace-burners', label: 'Burner compartment', kind: 'ok', tool: 'flashlight' },
    ] }),
  c({ id: 'util-dryer', zone: 'laundry', name: 'Clothes dryer', mount: 'floor', size: [0.7, 0.95, 0.7], courses: ['appliances'],
    checkpoints: [
      { id: 'dryer-duct', label: 'Dryer exhaust duct', kind: 'defect' },
    ] }),
  c({ id: 'util-washer', zone: 'laundry', name: 'Washing machine', mount: 'floor', size: [0.7, 0.95, 0.7], courses: ['plumbing', 'appliances'],
    checkpoints: [
      { id: 'washer-hoses', label: 'Supply hoses', kind: 'variable' },
    ] }),

  // ───────────────────────────── GARAGE ─────────────────────────────
  c({ id: 'gar-panel', zone: 'garage', name: 'Main electrical panel (dead front off)', mount: 'wall', size: [0.4, 0.75, 0.12], courses: ['elec-adv', 'elec-res'],
    checkpoints: [
      { id: 'panel-double-tap', label: 'Breaker terminals', kind: 'defect' },
      { id: 'panel-knockouts', label: 'Cabinet / dead-front openings', kind: 'variable' },
      { id: 'panel-white-hot', label: 'Branch conductor colours', kind: 'variable' },
      { id: 'panel-labeling', label: 'Circuit directory', kind: 'defect' },
      { id: 'panel-rust', label: 'Panel interior / service entrance', kind: 'variable' },
      { id: 'panel-aluminum-sec', label: 'Service entrance conductors', kind: 'ok' },
      { id: 'panel-breaker-heat', label: 'Breakers under load', kind: 'variable', tool: 'thermal' },
    ] }),
  c({ id: 'gar-water-heater', zone: 'garage', name: 'Gas water heater (50 gal)', mount: 'floor', size: [0.6, 1.6, 0.6], courses: ['water-heater', 'plumbing'],
    checkpoints: [
      { id: 'wh-tpr-discharge', label: 'TPR valve discharge', kind: 'defect' },
      { id: 'wh-age', label: 'Data plate', kind: 'defect' },
      { id: 'wh-elevation', label: 'Ignition source height', kind: 'variable' },
      { id: 'wh-sediment-trap', label: 'Gas supply drip leg', kind: 'variable' },
      { id: 'wh-draft-hood', label: 'Draft hood & vent', kind: 'ok' },
    ] }),
  c({ id: 'gar-fire-door', zone: 'garage', name: 'Garage-to-house door', mount: 'wall', size: [0.9, 2.05, 0.1], courses: ['egress', 'sop-25'],
    checkpoints: [
      { id: 'fire-door-closer', label: 'Door hinges / closer', kind: 'variable' },
      { id: 'fire-door-pet', label: 'Door slab', kind: 'defect' },
    ] }),
  c({ id: 'gar-overhead-door', zone: 'garage', name: 'Overhead garage door & opener', mount: 'wall', size: [4.8, 2.2, 0.3], courses: ['egress', 'sop-25'],
    checkpoints: [
      { id: 'door-auto-reverse', label: 'Opener reverse test', kind: 'defect' },
      { id: 'door-photo-eyes', label: 'Photo-eye sensors', kind: 'variable' },
    ] }),
  c({ id: 'gar-firewall', zone: 'garage', name: 'Garage / house common wall', mount: 'wall', size: [2, 2.4, 0.05], courses: ['sop-25', 'attic-interior'],
    checkpoints: [
      { id: 'firewall-penetration', label: 'Drywall separation', kind: 'variable' },
    ] }),

  // ───────────────────────────── ATTIC ─────────────────────────────
  c({ id: 'att-insulation', zone: 'attic', name: 'Attic insulation', mount: 'floor', size: [4, 0.3, 3], courses: ['attic-interior'],
    checkpoints: [
      { id: 'insulation-depth', label: 'Insulation depth (use the ruler)', kind: 'defect' },
      { id: 'insulation-void', label: 'Insulation coverage', kind: 'variable', tool: 'thermal' },
    ] }),
  c({ id: 'att-bath-duct', zone: 'attic', name: 'Bath fan duct', mount: 'floor', size: [0.4, 0.4, 1.2], courses: ['attic-interior', 'moisture'],
    checkpoints: [
      { id: 'bath-fan-termination', label: 'Duct termination', kind: 'defect' },
    ] }),
  c({ id: 'att-sheathing', zone: 'attic', name: 'Roof sheathing (underside)', mount: 'roof', size: [2.4, 0.05, 1.8], courses: ['attic-interior', 'roof', 'moisture'],
    checkpoints: [
      { id: 'sheathing-stain', label: 'Stain on decking', kind: 'variable', tool: 'moisture' },
      { id: 'sheathing-microbial', label: 'Dark discoloration near eave', kind: 'variable', tool: 'flashlight' },
    ] }),
  c({ id: 'att-truss', zone: 'attic', name: 'Roof trusses', mount: 'floor', size: [3, 2, 0.2], courses: ['structural'],
    checkpoints: [
      { id: 'truss-cut', label: 'Truss web members', kind: 'defect' },
    ] }),
  c({ id: 'att-soffit-vent', zone: 'attic', name: 'Eave / soffit ventilation', mount: 'floor', size: [2, 0.6, 0.6], courses: ['attic-interior'],
    checkpoints: [
      { id: 'soffit-baffles', label: 'Eave vent path', kind: 'variable' },
    ] }),
  c({ id: 'att-duct', zone: 'attic', name: 'Supply duct', mount: 'floor', size: [0.4, 0.4, 2], courses: ['hvac'],
    checkpoints: [
      { id: 'attic-duct-joint', label: 'Duct connection at boot', kind: 'variable' },
    ] }),
  c({ id: 'att-wiring', zone: 'attic', name: 'Attic wiring', mount: 'floor', size: [1, 0.2, 1], courses: ['elec-res'],
    checkpoints: [
      { id: 'open-splice', label: 'Cable splice', kind: 'defect' },
    ] }),
  c({ id: 'att-pests', zone: 'attic', name: 'Attic floor near gable', mount: 'floor', size: [1, 0.1, 1], courses: ['attic-interior'],
    checkpoints: [
      { id: 'rodent-activity', label: 'Insulation surface', kind: 'variable', tool: 'flashlight' },
    ] }),

  // ───────────────────────────── CRAWLSPACE ─────────────────────────────
  c({ id: 'crawl-vapor-barrier', zone: 'crawl', name: 'Vapor retarder (ground cover)', mount: 'ground', size: [4, 0.05, 3], courses: ['crawl-adv', 'moisture'],
    checkpoints: [
      { id: 'vapor-barrier', label: 'Ground cover', kind: 'defect' },
      { id: 'standing-water', label: 'Low area near rear wall', kind: 'variable' },
    ] }),
  c({ id: 'crawl-pier', zone: 'crawl', name: 'Masonry pier & girder', mount: 'ground', size: [0.5, 0.9, 0.5], courses: ['foundation', 'structural', 'crawl-adv'],
    checkpoints: [
      { id: 'pier-crack', label: 'Pier masonry', kind: 'defect' },
      { id: 'pier-shims', label: 'Pier-to-girder bearing', kind: 'variable' },
    ] }),
  c({ id: 'crawl-joists', zone: 'crawl', name: 'Floor joists', mount: 'ceiling', size: [3, 0.25, 2], courses: ['structural', 'crawl-adv', 'moisture'],
    checkpoints: [
      { id: 'joist-notch', label: 'Joist at plumbing run', kind: 'variable' },
      { id: 'joist-moisture', label: 'Joist wood moisture', kind: 'variable', tool: 'moisture' },
    ] }),
  c({ id: 'crawl-foundation-wall', zone: 'crawl', name: 'Block foundation wall', mount: 'wall', size: [3, 0.9, 0.2], courses: ['foundation', 'structural'],
    checkpoints: [
      { id: 'foundation-crack', label: 'Mortar joints', kind: 'variable' },
      { id: 'efflorescence', label: 'White deposits on block', kind: 'ok' },
    ] }),
  c({ id: 'crawl-termite', zone: 'crawl', name: 'Sill plate & foundation top', mount: 'wall', size: [2, 0.4, 0.3], courses: ['crawl-adv', 'structural'],
    checkpoints: [
      { id: 'termite-tubes', label: 'Foundation face below sill', kind: 'variable', tool: 'flashlight' },
    ] }),
  c({ id: 'crawl-plumbing', zone: 'crawl', name: 'Drain / supply piping', mount: 'ceiling', size: [2, 0.3, 0.3], courses: ['plumbing', 'crawl-adv'],
    checkpoints: [
      { id: 'drain-leak', label: 'Drain pipe joint', kind: 'variable', tool: 'flashlight' },
      { id: 'pex-supply', label: 'PEX supply lines', kind: 'ok' },
    ] }),
  c({ id: 'crawl-duct', zone: 'crawl', name: 'Crawlspace ductwork', mount: 'ceiling', size: [0.4, 0.4, 2.5], courses: ['hvac', 'crawl-adv'],
    checkpoints: [
      { id: 'crawl-duct-down', label: 'Flex duct run', kind: 'defect' },
    ] }),
];

// ── Derived lookups (do not edit) ─────────────────────────────────────────────
export const COMPONENT_BY_ID = Object.fromEntries(COMPONENTS.map(x => [x.id, x]));
export const CHECKPOINTS = COMPONENTS.flatMap(comp =>
  comp.checkpoints.map(cp => ({ ...cp, componentId: comp.id, zone: comp.zone, courses: comp.courses })));
export const CHECKPOINT_BY_ID = Object.fromEntries(CHECKPOINTS.map(x => [x.id, x]));
export const ZONE_BY_ID = Object.fromEntries(ZONES.map(z => [z.id, z]));
