# Yuki: UI layer report

Owner of `src/ui/` (16 files, ~3,000 lines, plain DOM + one stylesheet). Entry: `createUI({ root, bus, store, engine })` in `src/ui/ui.js`.

## Files

| File | What it owns |
|---|---|
| `ui.js` | Wiring, screen flow (title / game / report / exam), global keyboard, finish flow, room-complete detection |
| `styles.css` | Field-tablet look, tokens on `:root`, responsive rules, reduced motion, print stylesheet |
| `dom.js` | `h()` / `s()` element helpers, null-safe `append`, `isTyping`, `reducedMotion` |
| `modals.js` | Modal stack: focus trap, Esc, focus restore, the single source of `ui:modal`; `confirmDialog` |
| `content.js` | Defensive accessors for checkpoints / quizzes / lessons / GLOSSARY; `clean()` strips em-dashes from any content text; display severity labels |
| `title.js` | Title screen |
| `hud.js`, `minimap.js` | HUD, tool belt, controls help, hover label, SVG floor-plan mini-map |
| `inspect.js` | Inspect panel + pop-quiz trigger |
| `logcard.js`, `readouts.js` | Log card (tool gate, readout, classify, feedback) and instrument widgets |
| `quiz.js` | Pop quiz, room check, per-course practice |
| `exam.js` | Exam Mode |
| `notebook.js` | Field Notes, Course Map, Glossary, Logbook |
| `report.js` | Graded NC-style report |
| `toasts.js` | XP, rank-up, zone entered, room complete |
| `onboarding.js` | 5-step coach marks |
| `settings.js` | Settings |
| `sound.js` | WebAudio blips |
| `memory.js` | UI-only per-inspection memory (zone banners shown, pop quizzes offered, room checks offered) |

## Screen map

```
Title ──Start/Continue──▶ Game (HUD)
  │  ├─ Exam Mode (screen)            ├─ hover label near cursor
  │  ├─ Course Map (Notebook tab)     ├─ click component ─▶ engine ─▶ inspect:entered ─▶ Inspect panel
  │  ├─ Settings (dialog)             │      ├─ first open: pop quiz (after 0.9 s, skippable, stays as a chip)
  │  └─ View last report (if done)    │      └─ checkpoint:click / list row ─▶ Log card
  │                                   │             tool gate ▶ readout ▶ observe ▶ severity ▶ referral ▶ note ▶ feedback
  │                                   ├─ room fully logged ─▶ toast ▶ 3-question room check
  │                                   ├─ N Notebook · M map · 1-5 tools
  └──────────◀── Back to title ───────└─ Finish (button or R) ─▶ confirm ─▶ Report ─▶ Show me / New inspection / Print
```

## Keyboard map

| Key | Where | Does |
|---|---|---|
| 1 to 5 | walking, inspecting, inside the log card | switch tool (in the log card it also re-renders the readout) |
| 1 to 4 | quiz, exam | choose an answer |
| Enter | quiz / exam after answering; log card feedback | continue / next / done |
| N | game; inside the notebook | open / close notebook |
| M | game | expand / collapse mini-map |
| R | game | finish-and-report confirm |
| ? or H | game | toggle the controls card |
| Esc | top modal | closes it (not the title; exam asks before ending) |
| Esc | inspecting, no modal | `ui:inspect-exit` (Back to walking) |
| Tab / Shift+Tab | any modal | trapped inside the modal |
| Arrows | severity pills, referral chips, notebook tabs | roving selection |

The keydown listener is on `window` in the capture phase and calls `stopPropagation()` whenever the UI handles a key (Esc especially), so the engine never sees an Esc that only closed a card. WASD is never consumed by the UI.

## Contract usage

- Listens: `engine:ready`, `zone:enter`, `hover`, `inspect:entered`, `inspect:exited`, `checkpoint:click`, `tool:changed`, `finding:logged`, `xp:gained`, `rank:up`, `inspection:new`, `ui:modal`, `ui:goto-component` (to leave the title/report when something else asks to travel).
- Emits: `ui:teleport`, `ui:goto-component`, `ui:inspect-exit`, `ui:modal` (only from `modals.js`, only on change; title/report/exam count as modal, so the engine is paused on those screens).
- Engine methods used: only `engine.getZone()` (at boot and on entering the game). Travel is by event, per §7.
- The UI calls `store.markZone` and `store.markComponent` itself (see contract request 3).
- Missing content degrades: no observe text shows a polite placeholder; no answer block grades on defect / not-defect only and says so; no lesson, no glossary, no quizzes each show a calm empty state.

## Cold-stranger walkthrough (no context, mildly distracted, slightly bad wifi)

Seconds to first meaning are noted as **[Ns]**.

1. **Title [1s].** Name, one sentence of what it is, a big orange button, and the job card ("Today's job, 417 Loblolly Lane"). Fixed: the tagline was jammed against the title because a base `p` rule out-specified the component class; base element rules now use `:where()`. "Getting the house ready..." becomes "The house is ready." on `engine:ready`, with a 4 s fallback in case the engine was ready before the UI listened.
2. **Start [2s].** The HUD says where you are (zone, n/total) and the coach card says "Walk around" with WASD keys drawn. Fixed: coach card sat on top of the controls card; controls now start collapsed ("Controls (?)") because the tour teaches them. Fixed: a race where the tour could restart after being skipped.
3. **Each tour step finishes itself when you do it** (walk, drag 160 px, open something, log something, pick a tool). Hesitation is fine: Next and Skip are always there.
4. **First component.** The pop quiz used to ambush instantly; now it waits 0.9 s so you see the thing first, Skip leaves a "A pop quiz is waiting" chip. Fixed: initial focus landed on choice 1 with a heavy ring that read as pre-selected; focus now goes to the question.
5. **Inspect panel.** "Click a part of it to examine, or pick one below." The list is a safety net for anyone who cannot find a small mesh on a trackpad. Fixed: a literal "null" rendered in the panel (DOM `append(null)`); all appends now go through a null-safe helper.
6. **Log card.** A pulsing ring stays on the spot you clicked so you know what you are judging. Fixed: severity dots were invisible (CSS custom properties cannot be set with `Object.assign(style)`), focus first landed on the X (Enter would close the card), now on the title. Submit is disabled with a plain reason ("Choose a severity first."). Choosing Acceptable pre-selects "No referral needed".
7. **Tool gate.** "Your eyes alone can't tell." with one button to switch tools (and the key shown). Fixed: the card stretched full height with a big empty white area; side cards now fit content.
8. **Readouts.** Moisture dial animates to the number (status Dry / Elevated / Wet); tester shows the 3 lamps plus the tester's printed legend with the matching row highlighted, and a GFCI line; thermal shows a false-colour frame and scale with temperatures parsed from the reading. Fixed against the real content: "HOT/NEU REV" and "power cuts off" phrasings now parse; the amber lamp was invisible on the yellow body (now in a dark window); a 142 vs 84 °F reading showed an even frame (now any 15 °F spread reads as a hot spot).
9. **Feedback.** Verdict (Spot on / Close / Not quite), your call vs answer, why, "How a pro would write it" in a report serif, field tip, NC note, Field Notes chip, "Quick question on this". Over-calls and missed defects get a one-line explanation of why it matters professionally.
10. **Room complete.** Several rooms finishing at once stacked three toasts; now only one room offer shows at a time.
11. **Finish.** Copy said unlogged items "count as missed", which is not what the scorer does; now "score zero, and any defects among them count as missed".
12. **Report.** Fixed: sticky toolbar let text show through at the top; it is opaque and pinned to the very top. 56 missed items with full paragraphs was a wall: misses you logged as acceptable come first (most instructive), then by severity, and never-logged items fold their "why" behind a "Why it matters" toggle. XP toast moved below the toolbar on the report.
13. **Course Map.** Coverage line double-counted multi-course checkpoints ("2 of 202"); now "logged X of 119 checkpoints, touching N of 20 courses".
14. **Exam.** Results used to scroll to the bottom because the last button had focus; focus now goes to the score heading. Exam background made opaque (the title ghosted through).
15. **Narrow (880 px).** Inspect panel became a full-width sheet covering the component; now a 300 px right column under the rank card, bottom sheet only under 640 px. Map hides under 640 px; the Finish button shortens to "Finish & report" under 1100 px.

Checked and fine: Tab trap wraps inside the notebook; Esc in the log card closes only the card (inspect panel stays); Esc while inspecting exits; Show me closes the report, enters the game, and emits `ui:goto-component`; reduced motion kills animation; no em-dashes in UI strings and `clean()` scrubs content text.

Not verified in a browser: the print stylesheet (checked by reading only), and the real engine (tested against a scratch harness with a stub engine because `src/models/inside.js` was mid-write and the full build failed there, not in `src/ui/`).

## Coordinator follow-ups (done)

- **One in-game tester, own legend.** `readouts.js` defines fixed lamp patterns for CORRECT, OPEN GROUND, OPEN NEUTRAL, OPEN HOT, HOT/GND REV, HOT/NEU REV, lights the row whose legend word appears in `reading`, and shows all lamps dark with the text alone when nothing matches. Checked against all 12 real tester readings (CORRECT, HOT/NEU REV, OPEN GROUND, and the GFCI tripped / did-not-trip lines).
- **Ascending difficulty.** Pop quizzes take the lowest-difficulty linked question first; room checks and per-course practice pick not-yet-correct questions, then sort by difficulty so difficulty-1 prerequisites lead.
- **Garden studio scope note.** Entering `shed` shows the zone banner with the NC SOP detached-structure line; later entries show the line alone.
- **Thermal readings with deltas.** "about 38°F hotter than its neighbors" is now shown as ΔT +38°F (not as an absolute 38°); the insulation-void wording ("markedly different", "pushed aside down to bare drywall") reads as a cold patch.
- GLOSSARY (44 terms) renders and searches.

## Build status

- `src/ui/` builds clean under Vite/Rollup (verified by building a scratch entry that imports bus + store + ui).
- The full `npx vite build` currently fails in `src/models/index.js`: `builders` is not exported by `src/models/inside.js`, which another agent is still writing. Nothing in `src/ui/` is involved. Re-run once `inside.js` exports `builders`.

## Requested contract changes

1. **`finishInspection()` should be idempotent.** Today a second call adds report XP again and pushes a second history row. The UI guards it (if `finishedAt` is set it shows `summary()` instead), but the store should too:
   ```diff
   finishInspection() {
   +  if (data.inspection.finishedAt) return api.summary();
      const s = api.summary();
   ```
2. ~~`GLOSSARY` export~~: landed; shape `[{ term, def }]` is what the UI reads.
3. **Ownership of `markZone` / `markComponent`.** The UI calls both on `zone:enter` / `inspect:entered`. If the engine also calls them, nothing breaks (the UI keeps its own per-inspection memory for banners and pop quizzes), but please keep them UI-owned so `componentsOpened` stays meaningful.
4. **Engine and Esc.** The UI handles Esc in the capture phase and stops propagation when it acts. If the engine also binds Esc to exit inspect, it will simply not see the ones the UI consumed. Recommend the engine rely on `ui:inspect-exit` instead of its own Esc.
5. **Taxonomy copy.** `SEVERITIES[4].label` is `'Acceptable — No Defect'` (em-dash). The UI uses its own display labels, but anyone else rendering taxonomy labels will leak it. Suggest `'Acceptable (no defect)'`.
6. **Optional:** a `store.summary()` field for findings XP (`sum of logged points`). The report computes it itself today.
