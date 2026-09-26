import type { CalculatorDef } from "../types";

export const cost: CalculatorDef = {
  slug: "cost-estimate",
  name: "Cost Estimate",
  tagline: "Materials, labour, overhead and contingency.",
  category: "Planning & Tools",
  description: "A quick bottom-up cost estimate: materials with waste, labour by crew and duration, plant, overhead & profit, contingency and tax.",
  inputs: [
    { key: "materials", label: "Material cost (net)", dim: "currency", default: 42000, min: 0, step: 500, group: "Direct costs" },
    { key: "matWaste", label: "Material waste", dim: "percent", default: 7, min: 0, max: 30, step: 1, group: "Direct costs" },
    { key: "crew", label: "Crew size", default: 4, min: 1, step: 1, group: "Labour" },
    { key: "rate", label: "Hourly rate per worker", dim: "currency", default: 45, min: 0, step: 1, group: "Labour" },
    { key: "days", label: "Duration", default: 20, min: 0, step: 1, group: "Labour", help: "working days" },
    { key: "hours", label: "Hours per day", default: 8, min: 1, max: 14, step: 0.5, group: "Labour" },
    { key: "plant", label: "Plant & equipment", dim: "currency", default: 6000, min: 0, step: 100, group: "Other" },
    { key: "subs", label: "Subcontractors", dim: "currency", default: 12000, min: 0, step: 500, group: "Other" },
    { key: "ohp", label: "Overhead & profit", dim: "percent", default: 15, min: 0, max: 50, step: 1, group: "Markups" },
    { key: "cont", label: "Contingency", dim: "percent", default: 10, min: 0, max: 50, step: 1, group: "Markups" },
    { key: "tax", label: "Sales tax / VAT", dim: "percent", default: 0, min: 0, max: 30, step: 0.5, group: "Markups" },
    { key: "area", label: "Gross floor area (for unit rate)", dim: "area", default: 120, min: 0.1, step: 1, group: "Markups" },
  ],
  compute: (v) => {
    const mat = +v.materials * (1 + +v.matWaste / 100);
    const labourHours = +v.crew * +v.days * +v.hours;
    const labour = labourHours * +v.rate;
    const direct = mat + labour + +v.plant + +v.subs;
    const ohp = direct * (+v.ohp / 100);
    const sub1 = direct + ohp;
    const cont = sub1 * (+v.cont / 100);
    const sub2 = sub1 + cont;
    const tax = sub2 * (+v.tax / 100);
    const total = sub2 + tax;
    return {
      outputs: [
        { key: "total", label: "Total estimate", value: total, dim: "currency", precision: 0, primary: true },
        { key: "direct", label: "Direct costs", value: direct, dim: "currency", precision: 0, primary: true },
        { key: "rate", label: "Cost per m²", value: total / +v.area, dim: "currency", precision: 0, primary: true, note: "per m² GFA" },
        { key: "mat", label: "Materials incl. waste", value: mat, dim: "currency", precision: 0, group: "Breakdown" },
        { key: "labour", label: "Labour", value: labour, dim: "currency", precision: 0, group: "Breakdown", note: `${labourHours} h` },
        { key: "plant", label: "Plant", value: +v.plant, dim: "currency", precision: 0, group: "Breakdown" },
        { key: "subs", label: "Subcontractors", value: +v.subs, dim: "currency", precision: 0, group: "Breakdown" },
        { key: "ohp", label: "Overhead & profit", value: ohp, dim: "currency", precision: 0, group: "Markups" },
        { key: "cont", label: "Contingency", value: cont, dim: "currency", precision: 0, group: "Markups" },
        { key: "tax", label: "Tax", value: tax, dim: "currency", precision: 0, group: "Markups" },
        { key: "labourShare", label: "Labour share of direct cost", value: (labour / direct) * 100, dim: "percent", group: "Ratios" },
        { key: "matShare", label: "Material share of direct cost", value: (mat / direct) * 100, dim: "percent", group: "Ratios" },
      ],
    };
  },
  formulas: ["Direct = materials × (1 + waste) + labour + plant + subs", "Total = direct × (1 + OH&P) × (1 + contingency) × (1 + tax)"],
};
