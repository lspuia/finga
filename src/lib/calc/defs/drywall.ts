import type { CalculatorDef } from "../types";

export const drywall: CalculatorDef = {
  slug: "drywall",
  name: "Drywall",
  tagline: "Sheets, screws, tape and compound.",
  category: "Finishes",
  description: "Plasterboard sheets, fasteners, joint tape and compound for walls and ceilings of a room.",
  inputs: [
    { key: "L", label: "Room length", dim: "length", default: 5, min: 0.1, step: 0.1, group: "Room" },
    { key: "W", label: "Room width", dim: "length", default: 4, min: 0.1, step: 0.1, group: "Room" },
    { key: "H", label: "Wall height", dim: "length", default: 2.7, min: 0.1, step: 0.05, group: "Room" },
    { key: "ceiling", label: "Include ceiling", type: "select", default: "yes", group: "Room", options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }] },
    { key: "openings", label: "Openings", dim: "area", default: 4, min: 0, step: 0.1, group: "Room" },
    { key: "sheet", label: "Sheet size", type: "select", default: "1200x2400", group: "Materials", options: [
      { value: "1200x2400", label: "1200 × 2400 mm  (4 × 8 ft)" },
      { value: "1200x2700", label: "1200 × 2700 mm  (4 × 9 ft)" },
      { value: "1200x3000", label: "1200 × 3000 mm  (4 × 10 ft)" },
      { value: "1200x3600", label: "1200 × 3600 mm  (4 × 12 ft)" },
    ] },
    { key: "layers", label: "Layers", default: 1, min: 1, max: 2, step: 1, group: "Materials" },
    { key: "waste", label: "Waste allowance", dim: "percent", default: 12, min: 0, max: 30, step: 1, group: "Materials" },
  ],
  compute: (v) => {
    const walls = 2 * (+v.L + +v.W) * +v.H - +v.openings;
    const ceil = v.ceiling === "yes" ? +v.L * +v.W : 0;
    const area = Math.max(walls, 0) + ceil;
    const [sw, sl] = String(v.sheet).split("x").map(Number);
    const sheetArea = (sw * sl) / 1e6;
    const gross = area * +v.layers * (1 + +v.waste / 100);
    const sheets = Math.ceil(gross / sheetArea);
    const screws = Math.ceil(area * +v.layers * 15); // ~15 screws per m²
    const tape = area * 1.2; // m of tape per m²
    const compound = area * +v.layers * 0.55; // kg per m² for 3-coat finish
    return {
      outputs: [
        { key: "sheets", label: "Sheets", value: sheets, dim: "count", primary: true, note: `incl. ${v.waste}% waste` },
        { key: "area", label: "Board area", value: area, dim: "area", primary: true },
        { key: "compound", label: "Joint compound", value: compound, dim: "mass", primary: true },
        { key: "screws", label: "Screws", value: screws, dim: "count", group: "Fasteners" },
        { key: "boxes", label: "Screw boxes (1000)", value: Math.ceil(screws / 1000), dim: "count", group: "Fasteners" },
        { key: "tape", label: "Joint tape", value: tape, dim: "length", group: "Finishing" },
        { key: "tapeRolls", label: "Tape rolls (75 m)", value: Math.ceil(tape / 75), dim: "count", group: "Finishing" },
        { key: "buckets", label: "Compound buckets (20 kg)", value: Math.ceil(compound / 20), dim: "count", group: "Finishing" },
        { key: "walls", label: "Wall area (net)", value: Math.max(walls, 0), dim: "area", group: "Areas" },
        { key: "ceil", label: "Ceiling area", value: ceil, dim: "area", group: "Areas" },
      ],
    };
  },
  formulas: ["Sheets = area × layers × (1 + waste) / sheet area", "Screws ≈ 15/m², tape ≈ 1.2 m/m², compound ≈ 0.55 kg/m²"],
};
