// The 20 courses of InterNACHI's 120-hour NCHILB-approved online program.
// Source: https://www.nachi.org/pre-licensing/us/north-carolina (reviewed 2026-11-07)
// `id` is the stable key every other data file uses.

export const COURSES = [
  { id: 'sop-25',         title: '25 Standards Every Inspector Should Know',            short: 'Standards',        color: '#7c6cf0' },
  { id: 'elec-adv',       title: 'Advanced Electrical Inspection Training',             short: 'Adv. Electrical',  color: '#f2b233' },
  { id: 'crawl-adv',      title: 'Advanced Inspection of Crawlspaces',                  short: 'Crawlspaces',      color: '#8a6a4a' },
  { id: 'appliances',     title: 'Appliance Inspection for Home Inspectors',            short: 'Appliances',       color: '#4fb3bf' },
  { id: 'ext-fund',       title: 'Fundamentals of Inspecting the Exterior',             short: 'Exterior Fund.',   color: '#5fa35a' },
  { id: 'fireplace',      title: 'How to Inspect Fireplaces, Stoves, and Chimneys',     short: 'Fireplaces',       color: '#d9653b' },
  { id: 'hvac',           title: 'How to Inspect HVAC Systems',                         short: 'HVAC',             color: '#3b8fd9' },
  { id: 'water-heater',   title: 'How to Inspect Water Heater Tanks',                   short: 'Water Heaters',    color: '#d94f6a' },
  { id: 'moisture',       title: 'How to Inspect for Moisture Intrusion',               short: 'Moisture',         color: '#2f9ed9' },
  { id: 'attic-interior', title: 'How to Inspect the Attic, Insulation, Ventilation & Interior', short: 'Attic & Interior', color: '#c99a3e' },
  { id: 'ext-how',        title: 'How to Inspect the Exterior',                         short: 'Exterior',         color: '#4c8c48' },
  { id: 'deck',           title: 'How to Perform Deck Inspections',                     short: 'Decks',            color: '#a0723f' },
  { id: 'elec-res',       title: 'How to Perform Residential Electrical Inspections',   short: 'Electrical',       color: '#e8a21f' },
  { id: 'roof',           title: 'How to Perform Roof Inspections',                     short: 'Roofs',            color: '#7d7d8c' },
  { id: 'roof-asphalt',   title: 'Inspecting Asphalt Shingle Roofs',                    short: 'Asphalt Shingles', color: '#5c5c6a' },
  { id: 'foundation',     title: 'Inspecting Foundation Walls and Piers',               short: 'Foundations',      color: '#9b8b7a' },
  { id: 'roof-tile',      title: 'Inspecting Tile Roofs',                               short: 'Tile Roofs',       color: '#c46a3c' },
  { id: 'egress',         title: 'Inspecting the Means of Egress',                      short: 'Egress',           color: '#e05555' },
  { id: 'plumbing',       title: 'Residential Plumbing Overview for Inspectors',        short: 'Plumbing',         color: '#3aa0a0' },
  { id: 'structural',     title: 'Structural Issues for Home Inspectors',               short: 'Structural',       color: '#8c6f5a' },
];

export const COURSE_BY_ID = Object.fromEntries(COURSES.map(c => [c.id, c]));
