// Field Guide: the inspector riding along with you. Commentary shown in a bubble when you open a
// component (and a short intro when you enter a zone). Written by Henny, split in two files by zone.
// Contract: CONTEXT.md §12. Checked by `npm run check`.
//
// GOLDEN RULE: the guide reads exactly the same whether this inspection rolled the part defective
// or fine. It teaches what to look at and what good vs bad looks like. It never tells you which
// one you are looking at, and it never hints that a part is a red herring.
import { GUIDES_OUT, ZONE_GUIDES_OUT } from './guides-out.js';
import { GUIDES_IN, ZONE_GUIDES_IN } from './guides-in.js';

export const COMPONENT_GUIDES = { ...GUIDES_OUT, ...GUIDES_IN };
export const ZONE_GUIDES = { ...ZONE_GUIDES_OUT, ...ZONE_GUIDES_IN };
