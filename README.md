# Space Between Worlds

Construction and structural engineering calculators, built with Next.js 16, React 19, Tailwind CSS 4 and Three.js.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build (all calculator pages are prerendered)
```

## What's inside

| Category | Calculators |
| --- | --- |
| Structural | Beam Analysis, Column Buckling, Section Properties, Load Takedown, Spread Footing, Retaining Wall, Timber Joist |
| Concrete & Masonry | Concrete Volume, Rebar, Brick & Block, Plaster & Render |
| Finishes | Paint, Tile & Flooring, Drywall, Roofing, Stair Design |
| Site & Civil | Excavation & Earthwork, Asphalt & Paving, Slope & Grade |
| Planning & Tools | Unit Converter, Cost Estimate |

Every calculator recalculates live, flips between metric and imperial (inputs and outputs), shows warnings when a result fails a common code or comfort limit, and can be copied, printed, shared as a link or saved.

## How a calculator is defined

Each calculator is a plain object in `src/lib/calc/defs/`:

```ts
export const paint: CalculatorDef = {
  slug: "paint",
  name: "Paint",
  category: "Finishes",
  inputs: [{ key: "L", label: "Room length", dim: "length", default: 5 }, ...],
  compute: (v) => ({ outputs: [{ key: "litres", label: "Topcoat paint", value: 12.7, dim: "liquid", primary: true }] }),
  formulas: ["Litres = area × coats / coverage"],
};
```

- All values are stored and computed in SI. The `dim` field tells the shell how to convert for display (`src/lib/calc/units.ts`).
- `showIf` hides an input unless a select has a given value.
- `primary: true` outputs become the large result cards; the rest are grouped by `group`.
- Add the definition to `CALCULATORS` in `src/lib/calc/defs/index.ts` and the page, card, footer link and static route appear automatically.
- Optional `diagram` keys map to SVG or Three.js previews in `src/components/diagrams/`.

## Plugging in a database

Saved results and the unit preference currently live in `localStorage` through a tiny store in `src/lib/storage.ts`. Replace the read/write functions there with API calls (or server actions) and the Saved page and Save button keep working unchanged.

## Structure

```
src/app                 routes: /, /calculators, /calculators/[slug], /saved
src/components          shell, nav, cards, diagrams, three.js scenes
src/lib/calc/defs       one file per calculator
src/lib/calc/units.ts   metric ↔ imperial conversion table
```
