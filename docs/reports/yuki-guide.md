# Field Guide UI (Yuki, round 3)

## What shipped
- `src/ui/guide.js` (new): bubble, pill, docked tab view, mode logic, read aloud, `guideFor()` validator, `zoneIntro()`.
- `ui.js`: creates `ctx.guide` before the inspect panel (its `inspect:entered` handler must run first); `G` key (inspecting only, not while typing, never while any modal is up).
- `inspect.js`: on small screens the sheet gets two tabs, "Parts to judge 0/1" and "Guide".
- `settings.js`: "Field guide" row with four radio options and one sentence each; reset also clears the guide's "seen before" memory.
- `toasts.js`: the zone banner carries the intro line (no second card). Toasts can now be held open (`.hold`).
- `hud.js`: `G  Open or fold the field guide` in the desktop inspect help rows.
- `modals.js`: emits `ui:stack { kinds }` on every stack change (UI-internal; the guide uses it to hide under other cards but stay up beside the log card).
- `onboarding.js`: emits `ui:tour { active }` on start/stop (UI-internal).
- `icons.js`: guide (hard hat), speaker, stop, fold, target.
- `styles.css`: guide block at the end. Teal (`--guide`) is used only for the guide, because the engine's "show me" ring is teal: the row and the ring share a colour, so the link reads without words.

Missing or partial guide: `guideFor()` returns null and nothing renders (no pill, no tab, no errors). Unknown `cp` ids fall under "Also worth a glance"; invalid `tool` ids fall back to the checkpoint's manifest tool.
The temporary fixture is removed; all 74 guides landed (`npm run check`: guides 74/74). `npm run build` passes.

## Layout decision: float on wide screens, tab in the sheet everywhere else
- **Float (viewport >= 1180 x 600):** bubble at left 16, just under the location card, 300 wide, tail pointing right at the framed object's centre line (computed from the engine's free-area formula). On desktop the log card is a right-side card (x >= 954 at 1440), so the bubble stays up and readable while you judge, never overlaps it, and never sits under its clicks. Folded, it is a "Guide" pill in the same spot.
- **Docked (phones portrait and landscape, tablets, windows under 1180):** the guide is a "Guide" tab inside the inspect sheet; the pill is the tab itself. **Why:** on a 375x812 phone the object gets roughly 85 to 375 px of height between the HUD and the sheet. Any card there covers the thing you are meant to judge. A stranger with one thumb is already looking at the sheet; two labelled tabs are the most familiar pattern there is, and nothing new appears over the object. Folding the guide just means going back to "Parts to judge". With the guide tab open on a phone, the sheet drops the course chips and eyebrow and grows to 50vh so `what` and the first check fit without scrolling (seconds to first meaning: about 1). The phone log card is a bottom sheet that covers the inspect sheet, so the guide hides behind it naturally, as asked.
- Phone landscape (844x390): the guide tab runs the right column top 104 to bottom 8, width 280, clear of the tool belt. Tablet portrait (768x1024): tab in the side panel, roomy.

## Modes
- always: opens each time. fade (default): opens until every checkpoint of the component has `mastery.good > 0`, then starts folded, and the pill says "Guide, you've got this one" (the tab shows a small check). No-checkpoint components use "opened before", stored across inspections in `hous-inspection:guide:v1`. ask: starts folded. off: no bubble, pill or tab.
- In-bubble control ("Guide opens: ...", a disclosure in the footer). Choosing Off shows a toast saying where to turn it back on, **with an Undo button** (my addition: the hesitation before "Off" is fear of losing it for good).
- Changing the mode mid-inspection does not fold or open the current bubble; it applies from the next thing you open. A bubble that vanishes under your finger feels like a mistake.
- Zone banner: off = no intro; ask = a "What a pro checks first here" link that expands the intro and holds the toast until "Got it"; always/fade = the intro shows inline, the toast lasts 6 to 16 s by word count, pauses on hover, and has "Got it".

## Coexistence
- Tour: the guide stays folded while the coach card is up, then opens per mode when the tour ends (verified). The player can still open it by hand.
- Hidden behind settings, notebook, quiz, exam, report, confirm (any modal kind other than `logcard`). Hidden while walking. Read aloud stops on fold, exit, a blocking modal, and when the log card opens on a docked layout.
- Focus: never moved on auto-open. Folding by the button moves focus to the pill, and vice versa (user action only).

## Verified in a real browser (Playwright, port 5180)
Desktop 1440x900: att-duct bubble, show-me emits `ui:guide-focus {attic-duct-joint, 3}` and the teal ring pulses on the model, the row highlights for 3 s; G folds and unfolds; the pill reopens it; the log card opens with the bubble still up and clickable (bubble right 316, log card left 954); G is ignored while the log card is up; tool chip on att-pests switches to the flashlight and lights up; Settings hides the bubble and its radios work; all four modes on re-entry; fade with mastery gives a folded pill with "you've got this one"; Off from the bubble plus Undo; the tour keeps it folded and it opens after; ask-mode and off-mode zone banners.
Phone 375x812 with touch: docked tab opens by default in fade, show-me works, Parts tab and back, the log card sheet covers the sheet, G switches tabs. Phone landscape 844x390 and tablet 768x1024 checked by screenshot.
Screenshots: `docs/reports/shots/guide-desktop-att-duct.png`, `guide-desktop-logcard.png`, `guide-phone-att-duct.png`.

## Pushback and requests
1. **Engine (Kaz): the bubble can overlap very wide objects on desktop.** The free area is computed with a fixed `PANEL_W = 360` on the right only. At 1440 wide the object centre sits at x=540, so anything wider than about 450 px reaches under the bubble (x 16 to 316). Suggested: listen for a `ui:guide-layout { left: px }` event (I would emit 316 when the bubble is open, 0 otherwise) and use it as a left inset in `freeArea()` (`dx = (PANEL_W - left) / 2`). It is a two-line change; I have not emitted the event yet so nothing breaks before the engine handles it.
2. I kept G blocked while the log card is open, as specified, but on desktop reading the guide while judging is the point, and the bubble's own fold button works there. Allowing G alongside the pass-through log card would be reasonable.
3. Read aloud keeps going on desktop when the log card opens (it is pass-through, not a blocking modal). It stops for every blocking modal.

## Not verified
- Real speech output (headless has `speechSynthesis` but I did not listen); real iOS Safari and real touch hardware; VoiceOver pass over the tabs and radios (roles and labels are in place).
- The starting zone at game start never gets a zone banner (pre-existing: the banner is skipped while the title screen is up), so the exterior intro is not shown on the first entry of a new inspection.
- The dev server reloaded several times while other agents edited data files; the checks above were each run in one pass after a reload.
