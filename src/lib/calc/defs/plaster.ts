import type { CalculatorDef } from "../types";

export const plaster: CalculatorDef = {
  slug: "plaster",
  name: "Plaster & Render",
  tagline: "Cement and sand for wall plastering.",
  category: "Concrete & Masonry",
  description: "Cement and sand quantities for internal plaster or external render over a given wall area and thickness.",
  inputs: [
    { key: "area", label: "Wall area to plaster", dim: "area", default: 60, min: 0.1, step: 1, group: "Surface" },
    { key: "thk", label: "Plaster thickness", dim: "length_s", default: 12, min: 3, max: 40, step: 1, group: "Surface", help: "Internal 12 mm, external render 15–20 mm." },
    { key: "coats", label: "Number of coats", default: 1, min: 1, max: 3, step: 1, group: "Surface" },
    {
      key: "mix", label: "Mix (cement : sand)", type: "select", default: "1:4", group: "Mix",
      options: [
        { value: "1:3", label: "1 : 3  (external)" },
        { value: "1:4", label: "1 : 4  (general)" },
        { value: "1:5", label: "1 : 5  (internal)" },
        { value: "1:6", label: "1 : 6  (internal, ceilings)" },
      ],
    },
    { key: "waste", label: "Waste allowance", dim: "percent", default: 10, min: 0, max: 40, step: 1, group: "Mix" },
  ],
  compute: (v) => {
    const wet = +v.area * (+v.thk / 1000) * +v.coats;
    const dry = wet * 1.35 * 1.2; // bulking + filling voids
    const total = dry * (1 + +v.waste / 100);
    const [c, s] = String(v.mix).split(":").map(Number);
    const cementM3 = total * (c / (c + s));
    const cementKg = cementM3 * 1440;
    const sandM3 = total * (s / (c + s));
    return {
      outputs: [
        { key: "cement", label: "Cement (50 kg bags)", value: Math.ceil(cementKg / 50), dim: "count", primary: true, note: `${Math.round(cementKg)} kg` },
        { key: "sand", label: "Sand", value: sandM3, dim: "volume", primary: true },
        { key: "wet", label: "Wet plaster volume", value: wet, dim: "volume", primary: true },
        { key: "dry", label: "Dry material volume", value: total, dim: "volume", group: "Details" },
        { key: "water", label: "Water (approx.)", value: cementKg * 0.6, dim: "liquid", group: "Details" },
        { key: "sandT", label: "Sand mass", value: sandM3 * 1600, dim: "mass", group: "Details" },
      ],
    };
  },
  formulas: ["Wet volume = area × thickness × coats", "Dry volume ≈ wet × 1.35 × 1.2"],
};
