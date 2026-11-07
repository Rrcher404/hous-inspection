// Instrument readouts shown in the log card when the right tool is on a tool checkpoint.
// Each one is drawn from the content's `reading` text, so the content author stays in charge
// of what the instrument says.
import { h, s, reducedMotion } from './dom.js';
import { icon } from './icons.js';
import { clean, TOOL } from './content.js';

export function readout(tool, reading, { remembered = false } = {}) {
  const text = clean(reading || '');
  const body = {
    moisture: moistureDial,
    tester: testerLights,
    thermal: thermalStrip,
    flashlight: flashlightReveal,
  }[tool]?.(text);
  const t = TOOL[tool];
  return h('figure', { class: `readout readout-${tool}` },
    h('figcaption', { class: 'readout-head' }, icon(t?.icon || 'eye', { size: 16 }), h('span', null, t?.label || 'Reading'),
      remembered ? h('span', { class: 'readout-tag' }, 'your earlier reading') : h('span', { class: 'readout-tag live' }, 'live')),
    body || null,
    h('p', { class: 'readout-text' }, text || 'No reading recorded for this item yet. Judge from what you can see.'));
}

// ── Moisture meter: dial + digital number (%WME). ──
function moistureDial(text) {
  const m = /(\d+(?:\.\d+)?)\s*%/.exec(text) || /(\d+(?:\.\d+)?)/.exec(text);
  const val = m ? parseFloat(m[1]) : null;
  const relative = val != null && val > 45; // pinless meters often read on a 0-100 relative scale
  const max = relative ? 100 : 40;
  const wetAt = relative ? 60 : 20, warnAt = relative ? 40 : 16;
  const v = val == null ? 0 : Math.min(max, Math.max(0, val));
  const ang = (x) => Math.PI * (1 - x / max); // 180deg (left) -> 0deg (right)
  const pt = (x, r) => [50 + r * Math.cos(ang(x)), 54 - r * Math.sin(ang(x))];
  const arc = (a, b, cls) => {
    const [x1, y1] = pt(a, 40), [x2, y2] = pt(b, 40);
    return s('path', { d: `M${x1} ${y1} A40 40 0 0 1 ${x2} ${y2}`, class: cls, fill: 'none', 'stroke-width': 7 });
  };
  const needle = s('line', { x1: 50, y1: 54, x2: 50, y2: 18, class: 'needle' });
  const deg = (v / max) * 180 - 90;
  needle.style.transformBox = 'view-box';
  needle.style.transformOrigin = '50px 54px';
  if (reducedMotion()) needle.style.transform = `rotate(${deg}deg)`;
  else {
    needle.style.transform = 'rotate(-90deg)';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      needle.style.transition = 'transform 900ms cubic-bezier(.2,.8,.2,1)';
      needle.style.transform = `rotate(${deg}deg)`;
    }));
  }
  const status = val == null ? '' : val >= wetAt ? 'Wet' : val >= warnAt ? 'Elevated' : 'Dry';
  const svg = s('svg', { viewBox: '0 0 100 64', class: 'dial', role: 'img', 'aria-label': val == null ? 'Moisture meter' : `Moisture meter reads ${val} percent, ${status}` },
    arc(0, warnAt, 'z-dry'), arc(warnAt, wetAt, 'z-warn'), arc(wetAt, max, 'z-wet'),
    s('text', { x: 10, y: 63, class: 'dial-lbl' }, '0'),
    s('text', { x: 90, y: 63, class: 'dial-lbl', 'text-anchor': 'end' }, String(max)),
    needle, s('circle', { cx: 50, cy: 54, r: 3.5, class: 'hub' }));
  return h('div', { class: 'meter' }, svg,
    h('div', { class: 'meter-lcd' },
      h('div', { class: 'lcd-num' }, val == null ? '--' : `${val}`, h('small', null, relative ? ' rel' : ' %WME')),
      h('div', { class: `lcd-status ${status.toLowerCase()}` }, status)));
}

// ── 3-light receptacle tester: left red, centre + right amber (common tester legend). ──
// One in-game tester with its own printed legend. Real testers vary by brand, so the content
// names the legend word (CORRECT, OPEN GROUND, HOT/NEU REV...) and we light OUR fixed pattern for it.
const LEGEND = [
  { key: 'correct', label: 'CORRECT', p: [0, 1, 1] },
  { key: 'og', label: 'OPEN GROUND', p: [0, 1, 0] },
  { key: 'on', label: 'OPEN NEUTRAL', p: [0, 0, 1] },
  { key: 'oh', label: 'OPEN HOT', p: [0, 0, 0] },
  { key: 'hg', label: 'HOT/GND REV', p: [1, 1, 0] },
  { key: 'hn', label: 'HOT/NEU REV', p: [1, 0, 1] },
];
/** Legend key named in the reading text, or null when nothing matches. */
export function testerPattern(text) {
  const t = text.toLowerCase();
  if (/hot\s*\/\s*(gnd|ground)\s*rev|hot and ground reversed/.test(t)) return 'hg';
  if (/hot\s*\/\s*(neu|neutral)\s*rev|hot and neutral reversed|revers\w* polarity|polarity (is )?revers/.test(t)) return 'hn';
  if (/open\s*(ground|gnd)/.test(t)) return 'og';
  if (/open\s*(neutral|neu)\b/.test(t)) return 'on';
  if (/open\s*hot/.test(t)) return 'oh';
  if (/\bcorrect\b/.test(t)) return 'correct';
  return null;
}
function gfciResult(text) {
  const t = text.toLowerCase();
  if (!/gfci|trip/.test(t)) return null;
  if (/(does not|doesn't|did not|didn't|fails? to|failed to|won't|will not|never|not)\s+(\w+\s+){0,2}(trip|cut|shut)|stays energi[sz]ed|remains energi[sz]ed/.test(t)) return { ok: false, text: 'GFCI test button: did not trip, power stays on' };
  if (/trip(s|ped)?\b|cuts? off|power (goes|went|is) (off|out)|de-?energi[sz]ed/.test(t)) return { ok: true, text: 'GFCI test button: tripped, power cut' };
  return null;
}
function testerLights(text) {
  const key = testerPattern(text);
  const row = LEGEND.find(r => r.key === key) || null;
  const pattern = row ? row.p : [0, 0, 0];
  const lamp = (on, i) => h('span', { class: `lamp ${i === 0 ? 'red' : 'amber'}${on ? ' on' : ''}`, 'aria-hidden': 'true' });
  const g = gfciResult(text);
  return h('div', { class: 'tester' },
    h('div', { class: 'tester-body', role: 'img', 'aria-label': row ? `Tester lights match the legend: ${row.label}` : 'Tester lights: see the reading below' },
      h('div', { class: 'tester-lamps' }, pattern.map(lamp)),
      h('div', { class: 'tester-prongs', 'aria-hidden': 'true' }, h('i'), h('i'), h('i', { class: 'g' }))),
    h('table', { class: 'tester-legend' },
      h('caption', null, 'Legend printed on this tester'),
      h('tbody', null, LEGEND.map(r => h('tr', { class: r.key === key ? 'match' : '' },
        h('td', { class: 'legend-lamps' }, r.p.map((on, i) => h('span', { class: `dot ${i === 0 ? 'red' : 'amber'}${on ? ' on' : ''}` }))),
        h('td', null, r.label))))),
    g ? h('div', { class: `gfci ${g.ok ? 'ok' : 'bad'}` }, g.text) : null);
}

// ── Thermal camera: false-colour frame + temperature strip. Never a stand-alone diagnosis. ──
function thermalStrip(text) {
  const t = text.toLowerCase();
  // A number followed by "hotter / warmer / colder..." is a difference (delta T), not a temperature.
  const delta = /(\d+(?:\.\d+)?)\s*°\s*[fc]?\s*(hotter|warmer|colder|cooler|higher|lower|above|below)/i.exec(text);
  const temps = delta ? [] : [...text.matchAll(/(-?\d+(?:\.\d+)?)\s*°\s*([FC])?/g)].map(m => parseFloat(m[1]));
  const spread = temps.length >= 2 ? Math.max(...temps) - Math.min(...temps) : 0;
  const kind = /\b(uniform|evenly|even\b|consistent|no anomal)/.test(t) && !/not (uniform|even|consistent)/.test(t) ? 'even'
    : /wet|damp|moist/.test(t) ? 'wet'
      : /cold|cool|void|missing|gap|pushed aside|bare drywall|markedly different/.test(t) ? 'cold'
        : /hot|overheat|elevated temp/.test(t) || spread >= 15 ? 'hot'
          : /warm/.test(t) ? 'warm' : 'even';
  const spotLabel = delta ? `${/colder|cooler|lower|below/i.test(delta[2]) ? '−' : '+'}${delta[1]}°` : temps.length ? `${Math.max(...temps)}°` : null;
  const frame = h('div', { class: `ir-frame ir-${kind}`, role: 'img', 'aria-label': `Thermal image: ${kind === 'even' ? 'even temperatures, no anomaly' : kind === 'cold' ? 'a sharp cold patch' : kind + ' spot'}` },
    h('span', { class: 'ir-cross', 'aria-hidden': 'true' }),
    spotLabel ? h('span', { class: 'ir-spot' }, spotLabel) : null);
  let marks = null;
  if (delta) {
    marks = h('div', { class: 'ir-marks' }, h('span', { class: 'ir-mark', style: { left: '50%' } }, `ΔT ${spotLabel}F`));
  } else if (temps.length >= 1) {
    const lo = Math.min(...temps) - 10, hi = Math.max(...temps) + 10;
    marks = h('div', { class: 'ir-marks' }, temps.slice(0, 3).map(v => h('span', { class: 'ir-mark', style: { left: `${((v - lo) / (hi - lo)) * 100}%` } }, `${v}°`)));
  }
  return h('div', { class: 'ir' }, frame,
    h('div', { class: 'ir-scale' }, h('div', { class: 'ir-bar' }), marks,
      h('div', { class: 'ir-ends' }, h('span', null, 'cold'), h('span', null, 'hot'))),
    h('p', { class: 'ir-note' }, 'Thermal shows temperature differences only. Confirm with another tool before you call it.'));
}

// ── Flashlight: a raking beam sweeps the dark. ──
function flashlightReveal() {
  return h('div', { class: `torch${reducedMotion() ? ' still' : ''}`, 'aria-hidden': 'true' }, h('div', { class: 'beam' }));
}
