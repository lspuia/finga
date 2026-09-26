import type { CalculatorDef } from "../types";

export const asphalt: CalculatorDef = {
  slug: "paving",
  name: "Asphalt & Paving",
  tagline: "Tonnage for asphalt, base course and sub-base.",
  category: "Site & Civil",
  description: "Material tonnage for a paved area built up from sub-base, base course and asphalt layers, with truckloads.",
  inputs: [
    { key: "L", label: "Length", dim: "length", default: 50, min: 0.1, step: 1, group: "Area" },
    { key: "W", label: "Width", dim: "length", default: 6, min: 0.1, step: 0.1, group: "Area" },
    { key: "tAsph", label: "Asphalt thickness", dim: "length_s", default: 50, min: 0, step: 5, group: "Layers" },
    { key: "rhoAsph", label: "Asphalt density", dim: "density", default: 2350, min: 1, step: 10, group: "Layers" },
    { key: "tBase", label: "Base course thickness", dim: "length_s", default: 150, min: 0, step: 10, group: "Layers" },
    { key: "rhoBase", label: "Base compacted density", dim: "density", default: 2200, min: 1, step: 10, group: "Layers" },
    { key: "tSub", label: "Sub-base thickness", dim: "length_s", default: 200, min: 0, step: 10, group: "Layers" },
    { key: "rhoSub", label: "Sub-base compacted density", dim: "density", default: 2100, min: 1, step: 10, group: "Layers" },
    { key: "waste", label: "Waste allowance", dim: "percent", default: 5, min: 0, max: 20, step: 1, group: "Haulage" },
    { key: "truck", label: "Truck payload", default: 20, min: 1, step: 1, group: "Haulage", help: "tonnes" },
  ],
  compute: (v) => {
    const area = +v.L * +v.W;
    const w = 1 + +v.waste / 100;
    const asphT = (area * (+v.tAsph / 1000) * +v.rhoAsph / 1000) * w;
    const baseT = (area * (+v.tBase / 1000) * +v.rhoBase / 1000) * w;
    const subT = (area * (+v.tSub / 1000) * +v.rhoSub / 1000) * w;
    const total = asphT + baseT + subT;
    const tack = area * 0.35; // L/m² tack coat
    return {
      outputs: [
        { key: "asph", label: "Asphalt", value: asphT, precision: 1, primary: true, note: "tonnes" },
        { key: "base", label: "Base course", value: baseT, precision: 1, primary: true, note: "tonnes" },
        { key: "sub", label: "Sub-base", value: subT, precision: 1, primary: true, note: "tonnes" },
        { key: "area", label: "Paved area", value: area, dim: "area", group: "Details" },
        { key: "total", label: "Total material", value: total, precision: 1, group: "Details", note: "tonnes" },
        { key: "depth", label: "Total build-up depth", value: +v.tAsph + +v.tBase + +v.tSub, dim: "length_s", group: "Details" },
        { key: "tack", label: "Tack coat", value: tack, dim: "liquid", group: "Details" },
        { key: "trucksA", label: "Asphalt truckloads", value: Math.ceil(asphT / +v.truck), dim: "count", group: "Haulage" },
        { key: "trucksB", label: "Aggregate truckloads", value: Math.ceil((baseT + subT) / +v.truck), dim: "count", group: "Haulage" },
      ],
    };
  },
  formulas: ["Tonnes = area × thickness × density / 1000 × (1 + waste)"],
};
