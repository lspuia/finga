import type { CalculatorDef } from "../types";

const BAG_YIELD = { 25: 0.0112, 40: 0.018 }; // m³ of concrete per premix bag (approx)

export const concrete: CalculatorDef = {
  slug: "concrete",
  name: "Concrete Volume",
  tagline: "Slabs, footings, columns, walls and stairs.",
  category: "Concrete & Masonry",
  description:
    "Concrete volume for the most common pours, with waste allowance, premix bag counts and cement / sand / aggregate breakdown for site-mixed concrete.",
  diagram: "concrete",
  inputs: [
    {
      key: "shape", label: "Element", type: "select", default: "slab", group: "Element",
      options: [
        { value: "slab", label: "Slab / footing (rectangular)" },
        { value: "column", label: "Round column / pier" },
        { value: "wall", label: "Wall" },
        { value: "stairs", label: "Stairs" },
      ],
    },
    { key: "L", label: "Length", dim: "length", default: 6, min: 0.01, step: 0.1, group: "Dimensions", showIf: { key: "shape", values: ["slab", "wall"] } },
    { key: "W", label: "Width", dim: "length", default: 4, min: 0.01, step: 0.1, group: "Dimensions", showIf: { key: "shape", values: ["slab"] } },
    { key: "T", label: "Thickness", dim: "length_s", default: 150, min: 1, step: 5, group: "Dimensions", showIf: { key: "shape", values: ["slab", "wall"] } },
    { key: "H", label: "Height", dim: "length", default: 3, min: 0.01, step: 0.1, group: "Dimensions", showIf: { key: "shape", values: ["column", "wall"] } },
    { key: "D", label: "Diameter", dim: "length_s", default: 400, min: 1, step: 10, group: "Dimensions", showIf: { key: "shape", values: ["column"] } },
    { key: "steps", label: "Number of steps", default: 12, min: 1, step: 1, group: "Dimensions", showIf: { key: "shape", values: ["stairs"] } },
    { key: "rise", label: "Riser height", dim: "length_s", default: 175, min: 1, step: 5, group: "Dimensions", showIf: { key: "shape", values: ["stairs"] } },
    { key: "run", label: "Tread depth", dim: "length_s", default: 280, min: 1, step: 5, group: "Dimensions", showIf: { key: "shape", values: ["stairs"] } },
    { key: "sw", label: "Stair width", dim: "length", default: 1.2, min: 0.01, step: 0.05, group: "Dimensions", showIf: { key: "shape", values: ["stairs"] } },
    { key: "waist", label: "Waist slab thickness", dim: "length_s", default: 150, min: 1, step: 5, group: "Dimensions", showIf: { key: "shape", values: ["stairs"] } },
    { key: "qty", label: "Number of identical elements", default: 1, min: 1, step: 1, group: "Quantity" },
    { key: "waste", label: "Waste allowance", dim: "percent", default: 8, min: 0, max: 50, step: 1, group: "Quantity" },
    {
      key: "mix", label: "Site mix ratio (cement : sand : aggregate)", type: "select", default: "1:2:4", group: "Site mix",
      options: [
        { value: "1:1.5:3", label: "1 : 1.5 : 3  (M20 — structural)" },
        { value: "1:2:4", label: "1 : 2 : 4  (M15 — general)" },
        { value: "1:3:6", label: "1 : 3 : 6  (M10 — blinding)" },
      ],
    },
  ],
  compute: (v) => {
    const shape = String(v.shape);
    let vol = 0;
    if (shape === "slab") vol = +v.L * +v.W * (+v.T / 1000);
    else if (shape === "column") vol = Math.PI * Math.pow(+v.D / 2000, 2) * +v.H;
    else if (shape === "wall") vol = +v.L * +v.H * (+v.T / 1000);
    else {
      const n = +v.steps, r = +v.rise / 1000, t = +v.run / 1000, w = +v.sw, waist = +v.waist / 1000;
      const stepsVol = n * 0.5 * r * t * w;
      const incl = Math.sqrt(r * r + t * t) * n;
      vol = stepsVol + incl * waist * w;
    }
    const net = vol * +v.qty;
    const total = net * (1 + +v.waste / 100);
    const [c, s, a] = String(v.mix).split(":").map(Number);
    const dry = total * 1.54; // dry volume factor
    const sum = c + s + a;
    const cementVol = (dry * c) / sum;
    const cementKg = cementVol * 1440;
    const sandM3 = (dry * s) / sum;
    const aggM3 = (dry * a) / sum;
    return {
      outputs: [
        { key: "total", label: "Concrete to order", value: total, dim: "volume", primary: true, note: `incl. ${v.waste}% waste` },
        { key: "net", label: "Net volume", value: net, dim: "volume", primary: true },
        { key: "mass", label: "Approx. mass", value: total * 2400, dim: "mass", primary: true },
        { key: "bags25", label: "Premix bags (25 kg)", value: Math.ceil(total / BAG_YIELD[25]), dim: "count", group: "Premix bags" },
        { key: "bags40", label: "Premix bags (40 kg)", value: Math.ceil(total / BAG_YIELD[40]), dim: "count", group: "Premix bags" },
        { key: "trucks", label: "Ready-mix trucks (6 m³)", value: Math.ceil(total / 6), dim: "count", group: "Premix bags" },
        { key: "cement", label: "Cement (50 kg bags)", value: Math.ceil(cementKg / 50), dim: "count", group: "Site mix", note: `${Math.round(cementKg)} kg` },
        { key: "sand", label: "Sand", value: sandM3, dim: "volume", group: "Site mix" },
        { key: "agg", label: "Coarse aggregate", value: aggM3, dim: "volume", group: "Site mix" },
        { key: "water", label: "Water (w/c 0.5)", value: cementKg * 0.5, dim: "liquid", group: "Site mix" },
      ],
    };
  },
  formulas: ["Slab: V = L × W × T", "Column: V = π(D/2)² × H", "Stairs: V = n·½·r·t·w + n·√(r²+t²)·waist·w", "Dry volume = 1.54 × wet volume"],
  notes: ["Premix bag yields are approximate; check the manufacturer's stated yield. Ready-mix is usually ordered in 0.25 m³ increments."],
};
