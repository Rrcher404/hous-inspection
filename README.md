# Walkthrough Inspector

A first-person 3D home-inspection training game. Walk a detailed virtual house, use real inspector
tools, classify what you find, and learn from the InterNACHI North Carolina pre-licensing courses
as you go. Every inspection randomizes the house, so you learn the method, not the answers.

## Play

Online: **https://rrcher404.github.io/hous-inspection/** (works on a computer, phone, or tablet).

To run it locally:

```bash
npm install
npm run dev
```

Open http://localhost:5173.

| Control | Action |
|---|---|
| W A S D / arrows | Walk (Shift to move faster) |
| Drag | Look around |
| Click | Inspect a component, then click its parts |
| 1 to 5 | Eyes, Flashlight, Moisture Meter, Receptacle Tester, Thermal Camera |
| N | Notebook: Field Notes, Course Map, Glossary, Logbook |
| M | Map / fast travel |
| G | Field Guide: open or fold the inspector's commentary |
| Esc | Back |

On a phone or tablet: drag the stick (bottom left) to walk, drag one finger to look, tap to
inspect, press and hold a door, hatch, or ladder to inspect it instead of going through, and pinch
to zoom up close. Progress is saved in each browser separately.

**Field Guide.** When you open something, a bubble (on phones, a "Guide" tab) explains what it is,
what to check, which tool to bring, and how to describe it, with "Show me where" for each part.
Pick how much help you want in the bubble or in Settings: Always open, Fades as you learn,
Only when I ask, or Off.

## What's in the house
14 zones, 74 components, 119 checkpoints, mapped to all 20 courses of the 120-hour NC program.
See [docs/GAME_DESIGN.md](docs/GAME_DESIGN.md) for the full design and [CONTEXT.md](CONTEXT.md)
for the build contract.

## Scripts
- `npm run dev`: dev server
- `npm run build`: production build to `dist/`
- `npm run check`: validates content, quizzes, and field notes against the manifest

## Disclaimer
A study aid, not an official InterNACHI or NCHILB product. Real inspections follow the NC Home
Inspector Standards of Practice and your field training. When this game and your course disagree,
your course wins (and please open an issue).
