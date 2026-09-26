import type { CalculatorDef } from "../types";

const UNITS_LIB: Record<string, { l: number; h: number; w: number; label: string }> = {
  brick_std: { l: 215, h: 65, w: 102.5, label: "Standard brick 215 × 102.5 × 65" },
  brick_us: { l: 194, h: 57, w: 92, label: "US modular brick 7⅝ × 3⅝ × 2¼ in" },
  block_200: { l: 390, h: 190, w: 190, label: "CMU block 390 × 190 × 190" },
  block_140: { l: 390, h: 190, w: 140, label: "CMU block 390 × 140 × 190" },
  block_100: { l: 390, h: 190, w: 100, label: "CMU block 390 × 100 × 190" },
};

export const masonry: CalculatorDef = {
  slug: "brick-block",
  name: "Brick & Block",
  tagline: "Units, mortar and cement for masonry walls.",
  category: "Concrete & Masonry",
  description:
    "Number of bricks or concrete blocks for a wall of given area, allowing for openings and mortar joints, plus mortar volume and cement / sand quantities.",
  inputs: [
    { key: "unit", label: "Masonry unit", type: "select", default: "brick_std", group: "Wall", options: Object.entries(UNITS_LIB).map(([k, u]) => ({ value: k, label: u.label })) },
    { key: "L", label: "Wall length", dim: "length", default: 10, min: 0.1, step: 0.1, group: "Wall" },
    { key: "H", label: "Wall height", dim: "length", default: 2.7, min: 0.1, step: 0.1, group: "Wall" },
    { key: "leaves", label: "Leaves (thickness in units)", default: 1, min: 1, max: 3, step: 1, group: "Wall", help: "2 for a double-leaf solid brick wall." },
    { key: "openings", label: "Openings (doors, windows)", dim: "area", default: 3, min: 0, step: 0.1, group: "Wall" },
    { key: "joint", label: "Mortar joint", dim: "length_s", default: 10, min: 3, max: 20, step: 1, group: "Mortar" },
    {
      key: "mix", label: "Mortar mix (cement : sand)", type: "select", default: "1:4", group: "Mortar",
      options: [
        { value: "1:3", label: "1 : 3  (strong)" },
        { value: "1:4", label: "1 : 4  (general)" },
        { value: "1:6", label: "1 : 6  (weak / internal)" },
      ],
    },
    { key: "waste", label: "Waste allowance", dim: "percent", default: 5, min: 0, max: 30, step: 1, group: "Mortar" },
  ],
  compute: (v) => {
    const u = UNITS_LIB[String(v.unit)];
    const j = +v.joint;
    const grossArea = +v.L * +v.H;
    const netArea = Math.max(grossArea - +v.openings, 0);
    const unitFaceArea = ((u.l + j) * (u.h + j)) / 1e6; // m² incl. joints
    const perM2 = 1 / unitFaceArea;
    const leaves = +v.leaves;
    const unitsNet = netArea * perM2 * leaves;
    const units = Math.ceil(unitsNet * (1 + +v.waste / 100));
    const wallVol = netArea * (u.w * leaves / 1000);
    const unitVol = (u.l * u.h * u.w) / 1e9;
    const mortarWet = Math.max(wallVol - unitsNet * unitVol, 0);
    const mortarDry = mortarWet * 1.33 * (1 + +v.waste / 100);
    const [c, s] = String(v.mix).split(":").map(Number);
    const cementM3 = mortarDry * (c / (c + s));
    const cementBags = Math.ceil((cementM3 * 1440) / 50);
    const sandM3 = mortarDry * (s / (c + s));
    return {
      outputs: [
        { key: "units", label: `${u.label.split(" ")[0] === "CMU" ? "Blocks" : "Bricks"} to order`, value: units, dim: "count", primary: true, note: `incl. ${v.waste}% waste` },
        { key: "perM2", label: "Units per m² (single leaf)", value: perM2, precision: 1, primary: true },
        { key: "netArea", label: "Net wall area", value: netArea, dim: "area", primary: true },
        { key: "mortar", label: "Mortar (wet volume)", value: mortarWet, dim: "volume", group: "Mortar" },
        { key: "cement", label: "Cement (50 kg bags)", value: cementBags, dim: "count", group: "Mortar" },
        { key: "sand", label: "Sand", value: sandM3, dim: "volume", group: "Mortar" },
        { key: "wallVol", label: "Wall volume", value: wallVol, dim: "volume", group: "Details" },
        { key: "mass", label: "Approx. wall mass", value: wallVol * (u.label.startsWith("CMU") ? 1400 : 1900), dim: "mass", group: "Details" },
        { key: "pallets", label: "Pallets (500 bricks / 90 blocks)", value: Math.ceil(units / (u.label.startsWith("CMU") ? 90 : 500)), dim: "count", group: "Details" },
      ],
    };
  },
  formulas: ["Units/m² = 1 / [(l + j)(h + j)]", "Mortar = wall volume − units × unit volume", "Dry mortar = 1.33 × wet"],
};
