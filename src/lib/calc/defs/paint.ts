import type { CalculatorDef } from "../types";

export const paint: CalculatorDef = {
  slug: "paint",
  name: "Paint",
  tagline: "Litres, cans and primer for walls and ceilings.",
  category: "Finishes",
  description: "Paint quantity for a room from its dimensions, subtracting doors and windows, with coats, coverage rate and can sizes.",
  inputs: [
    { key: "L", label: "Room length", dim: "length", default: 5, min: 0.1, step: 0.1, group: "Room" },
    { key: "W", label: "Room width", dim: "length", default: 4, min: 0.1, step: 0.1, group: "Room" },
    { key: "H", label: "Wall height", dim: "length", default: 2.7, min: 0.1, step: 0.05, group: "Room" },
    { key: "ceiling", label: "Include ceiling", type: "select", default: "yes", group: "Room", options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }] },
    { key: "doors", label: "Doors", default: 1, min: 0, step: 1, group: "Openings", help: "≈ 1.9 m² each" },
    { key: "windows", label: "Windows", default: 2, min: 0, step: 1, group: "Openings", help: "≈ 1.5 m² each" },
    { key: "coats", label: "Coats", default: 2, min: 1, max: 4, step: 1, group: "Paint" },
    { key: "coverage", label: "Coverage per litre", dim: "area", default: 11, min: 1, step: 0.5, group: "Paint", help: "Emulsion 10–12 m²/L, masonry 6–8 m²/L." },
    { key: "primer", label: "Primer coat", type: "select", default: "yes", group: "Paint", options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }] },
    { key: "waste", label: "Waste allowance", dim: "percent", default: 10, min: 0, max: 30, step: 1, group: "Paint" },
  ],
  compute: (v) => {
    const walls = 2 * (+v.L + +v.W) * +v.H;
    const ceil = v.ceiling === "yes" ? +v.L * +v.W : 0;
    const openings = +v.doors * 1.9 + +v.windows * 1.5;
    const net = Math.max(walls - openings, 0) + ceil;
    const litres = (net * +v.coats) / +v.coverage * (1 + +v.waste / 100);
    const primerL = v.primer === "yes" ? (net / (+v.coverage * 0.9)) * (1 + +v.waste / 100) : 0;
    return {
      outputs: [
        { key: "litres", label: "Topcoat paint", value: litres, dim: "liquid", primary: true, note: `${v.coats} coats` },
        { key: "primer", label: "Primer", value: primerL, dim: "liquid", primary: true },
        { key: "area", label: "Paintable area", value: net, dim: "area", primary: true },
        { key: "cans10", label: "10 L cans", value: Math.ceil(litres / 10), dim: "count", group: "Cans (topcoat)" },
        { key: "cans5", label: "5 L cans", value: Math.ceil(litres / 5), dim: "count", group: "Cans (topcoat)" },
        { key: "cans1", label: "1 L cans", value: Math.ceil(litres), dim: "count", group: "Cans (topcoat)" },
        { key: "walls", label: "Wall area (gross)", value: walls, dim: "area", group: "Areas" },
        { key: "ceil", label: "Ceiling area", value: ceil, dim: "area", group: "Areas" },
        { key: "open", label: "Openings deducted", value: openings, dim: "area", group: "Areas" },
      ],
    };
  },
  formulas: ["Area = 2(L + W)·H − openings + ceiling", "Litres = area × coats / coverage × (1 + waste)"],
};
