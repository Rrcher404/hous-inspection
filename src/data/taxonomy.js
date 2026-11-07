// Classification vocabulary the player uses when logging a checkpoint.
// Scoring rules live in src/core/store.js.

export const SEVERITIES = [
  { id: 'safety',  label: 'Safety Hazard',        short: 'Safety',  color: '#e5484d', rank: 0,
    hint: 'Could cause injury, fire, shock, or carbon-monoxide exposure. Address right away.' },
  { id: 'major',   label: 'Major Defect',         short: 'Major',   color: '#f2803a', rank: 1,
    hint: 'Significantly deficient, near end of life, or likely to cause expensive damage. Needs a specialist.' },
  { id: 'repair',  label: 'Repair / Maintenance', short: 'Repair',  color: '#f2c23a', rank: 2,
    hint: 'Not functioning as intended or a deficiency that should be corrected, but not urgent or dangerous.' },
  { id: 'monitor', label: 'Monitor',              short: 'Monitor', color: '#4fa3e0', rank: 3,
    hint: 'Functioning now, but worth watching or budgeting for (age, minor wear, typical conditions).' },
  { id: 'ok',      label: 'Acceptable (No Defect)', short: 'OK',    color: '#3fb67a', rank: 4,
    hint: 'Inspected and functioning as intended. Do not over-call it.' },
];

export const RECOMMENDATIONS = [
  { id: 'electrician', label: 'Licensed electrician' },
  { id: 'plumber',     label: 'Licensed plumber' },
  { id: 'hvac',        label: 'Licensed HVAC contractor' },
  { id: 'roofer',      label: 'Qualified roofing contractor' },
  { id: 'structural',  label: 'Structural engineer' },
  { id: 'pest',        label: 'Licensed pest control / WDI inspector' },
  { id: 'chimney',     label: 'CSIA-certified chimney sweep' },
  { id: 'contractor',  label: 'Qualified general contractor' },
  { id: 'garage-door', label: 'Garage door technician' },
  { id: 'appliance',   label: 'Appliance service technician' },
  { id: 'none',        label: 'No referral needed' },
];

export const TOOLS = [
  { id: 'hand',       label: 'Eyes & Hands',      key: '1', icon: 'hand',
    desc: 'Look, touch, operate. The inspector\'s main instrument.' },
  { id: 'flashlight', label: 'Flashlight',        key: '2', icon: 'flashlight',
    desc: 'Required in attics and crawlspaces. Raking light reveals stains, cracks, and creosote.' },
  { id: 'moisture',   label: 'Moisture Meter',    key: '3', icon: 'droplet',
    desc: 'Pin/pinless reading of wood moisture equivalent (%WME). Tells an old dry stain from an active leak.' },
  { id: 'tester',     label: 'Receptacle Tester', key: '4', icon: 'plug',
    desc: '3-light tester with GFCI test button. Finds open grounds, reversed polarity, and missing GFCI protection.' },
  { id: 'thermal',    label: 'Thermal Camera',    key: '5', icon: 'thermal',
    desc: 'Infrared imaging. Shows temperature differences: missing insulation, wet areas, hot breakers. Never a stand-alone diagnosis.' },
];

export const SEV_BY_ID = Object.fromEntries(SEVERITIES.map(s => [s.id, s]));
export const REC_BY_ID = Object.fromEntries(RECOMMENDATIONS.map(r => [r.id, r]));
export const TOOL_BY_ID = Object.fromEntries(TOOLS.map(t => [t.id, t]));
