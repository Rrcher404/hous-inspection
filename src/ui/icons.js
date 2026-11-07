// Inline stroke icons (24px grid). No asset files.
import { s } from './dom.js';

const P = {
  hand: 'M8 13V5.5a1.5 1.5 0 0 1 3 0V11 M11 10.5V4a1.5 1.5 0 0 1 3 0v7 M14 10.5V5.5a1.5 1.5 0 0 1 3 0V13a7 7 0 0 1-7 7h-.4a6 6 0 0 1-4.9-2.6L3.6 14.4a1.6 1.6 0 0 1 2.6-1.8L8 15',
  flashlight: 'M7 3h10v4l-3 4v10h-4V11L7 7z M12 14v2 M7 7h10',
  droplet: 'M12 3s6.5 6.6 6.5 11.2a6.5 6.5 0 0 1-13 0C5.5 9.6 12 3 12 3z M9 15a3 3 0 0 0 3 3',
  plug: 'M9 3v5 M15 3v5 M6.5 8h11v3.5a5.5 5.5 0 0 1-11 0z M12 17v4',
  thermal: 'M14 14.6V5a2 2 0 0 0-4 0v9.6a4 4 0 1 0 4 0z M12 9v8 M18 7c1 1 1 3 0 4 M20.5 5c2 2.4 2 5.6 0 8',
  book: 'M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z M4 20.5V5.5 M8 7h8 M8 10.5h6',
  gear: 'M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z M12 2.5v3 M12 18.5v3 M4.6 4.6l2.1 2.1 M17.3 17.3l2.1 2.1 M2.5 12h3 M18.5 12h3 M4.6 19.4l2.1-2.1 M17.3 6.7l2.1-2.1',
  map: 'M3 6.5l6-2.5 6 2.5 6-2.5v13.5l-6 2.5-6-2.5-6 2.5z M9 4v13.5 M15 6.5V20',
  report: 'M9 3.5h6v3H9z M7.5 5H5v16h14V5h-2.5 M8.5 12.5l2.5 2.5 5-5',
  check: 'M5 12.5l4.5 4.5L19 7',
  x: 'M6 6l12 12 M18 6L6 18',
  back: 'M15 5l-7 7 7 7',
  next: 'M9 5l7 7-7 7',
  timer: 'M12 8v5l3 2 M9 2.5h6 M12 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16z',
  eye: 'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  search: 'M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13z M15.5 15.5L20 20',
  pin: 'M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z M12 7a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z',
  star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z',
  print: 'M7 8V3h10v5 M7 17H4V9h16v8h-3 M7 13h10v8H7z',
  help: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14 M12 17h.01',
  quiz: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14 M12 17h.01',
  home: 'M3 11l9-7 9 7 M5 9.5V20h14V9.5 M10 20v-5h4v5',
  guide: 'M3.5 17.5h17 M5.5 17.5v-2.5a6.5 6.5 0 0 1 13 0v2.5 M10 8.8V5.5h4v3.3 M12 12.5v2',
  speaker: 'M4 9.5h3.5L12 5.5v13l-4.5-4H4z M15.5 9.5a3.5 3.5 0 0 1 0 5 M18 7a7 7 0 0 1 0 10',
  stop: 'M7 7h10v10H7z',
  fold: 'M6 14l6-6 6 6',
  target: 'M12 3v3 M12 18v3 M3 12h3 M18 12h3 M12 7.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9z M12 11.2v1.6',
};

export function icon(name, { size = 20, label } = {}) {
  const d = P[name] || P.help;
  const svg = s('svg', {
    viewBox: '0 0 24 24', width: size, height: size, fill: 'none', stroke: 'currentColor',
    'stroke-width': 1.8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: 'ico',
    'aria-hidden': label ? null : 'true', role: label ? 'img' : null, 'aria-label': label || null,
  }, s('path', { d }));
  return svg;
}

export const TOOL_ICON = { hand: 'hand', flashlight: 'flashlight', droplet: 'droplet', plug: 'plug', thermal: 'thermal' };
