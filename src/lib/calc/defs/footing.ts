import type { CalculatorDef } from "../types";

export const footing: CalculatorDef = {
  slug: "footing",
  name: "Spread Footing",
  tagline: "Size a pad footing from column load and soil bearing.",
  category: "Structural",
  description:
    "Required footing area and plan dimensions for a square or rectangular isolated footing, with bearing pressure check and concrete quantity.",
  diagram: "footing",
  inputs: [
    { key: "Pd", label: "Column dead load", dim: "force", default: 400, min: 0, step: 10, group: "Loads" },
    { key: "Pl", label: "Column live load", dim: "force", default: 250, min: 0, step: 10, group: "Loads" },
    { key: "qa", label: "Allowable bearing pressure", dim: "pressure", default: 150, min: 1, step: 5, group: "Soil", help: "Stiff clay 150–300, dense sand 200–400 kPa." },
    { key: "depth", label: "Footing thickness", dim: "length_s", default: 500, min: 100, step: 25, group: "Footing" },
    { key: "embed", label: "Depth of soil over footing", dim: "length_s", default: 600, min: 0, step: 50, group: "Footing" },
    { key: "aspect", label: "Length / width ratio", default: 1, min: 1, max: 3, step: 0.1, group: "Footing", help: "1 = square footing." },
    { key: "round", label: "Round dimensions to", dim: "length_s", default: 50, min: 1, step: 5, group: "Footing" },
  ],
  compute: (v) => {
    const P = +v.Pd + +v.Pl, qa = +v.qa;
    const tf = +v.depth / 1000, ds = +v.embed / 1000, ratio = +v.aspect, rnd = +v.round / 1000;
    const overburden = tf * 24 + ds * 18; // kPa
    const qnet = qa - overburden;
    const warnings: string[] = [];
    if (qnet <= 0) warnings.push("Overburden exceeds allowable bearing pressure — increase bearing capacity or reduce depth.");
    const Areq = qnet > 0 ? P / qnet : Infinity;
    const Bexact = Math.sqrt(Areq / ratio);
    const B = Math.ceil(Bexact / rnd) * rnd;
    const Lf = Math.ceil((Bexact * ratio) / rnd) * rnd;
    const Aprov = B * Lf;
    const qact = P / Aprov + overburden;
    const util = qact / qa;
    if (util > 1) warnings.push("Bearing pressure exceeds allowable — rounding produced too small a footing.");
    const vol = Aprov * tf;
    const Pu = 1.2 * +v.Pd + 1.6 * +v.Pl;
    return {
      warnings,
      outputs: [
        { key: "B", label: "Footing width B", value: B, dim: "length", primary: true },
        { key: "L", label: "Footing length L", value: Lf, dim: "length", primary: true },
        { key: "qact", label: "Actual bearing pressure", value: qact, dim: "pressure", primary: true, note: `${(util * 100).toFixed(0)}% of allowable` },
        { key: "Areq", label: "Required area", value: Areq, dim: "area", group: "Design" },
        { key: "Aprov", label: "Provided area", value: Aprov, dim: "area", group: "Design" },
        { key: "qnet", label: "Net allowable pressure", value: qnet, dim: "pressure", group: "Design", note: "after overburden" },
        { key: "qu", label: "Factored soil pressure (for RC design)", value: Pu / Aprov, dim: "pressure", group: "Design" },
        { key: "vol", label: "Concrete volume", value: vol, dim: "volume", group: "Quantities" },
        { key: "wt", label: "Footing self-weight", value: vol * 24, dim: "force", group: "Quantities" },
      ],
    };
  },
  formulas: ["q_net = q_allow − (γc·t + γs·d)", "A_req = P / q_net", "B = √(A_req / ratio)"],
  notes: ["Concrete taken as 24 kN/m³, soil 18 kN/m³. Reinforcement, punching shear and one-way shear must be checked separately."],
};
