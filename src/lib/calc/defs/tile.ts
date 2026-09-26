import type { CalculatorDef } from "../types";

export const tile: CalculatorDef = {
  slug: "tile-flooring",
  name: "Tile & Flooring",
  tagline: "Tiles, boxes, adhesive and grout.",
  category: "Finishes",
  description: "Number of tiles and boxes for a floor or wall, with grout gap, cutting waste, adhesive and grout quantities.",
  inputs: [
    { key: "L", label: "Area length", dim: "length", default: 6, min: 0.1, step: 0.1, group: "Area" },
    { key: "W", label: "Area width", dim: "length", default: 4, min: 0.1, step: 0.1, group: "Area" },
    { key: "tl", label: "Tile length", dim: "length_s", default: 600, min: 10, step: 10, group: "Tile" },
    { key: "tw", label: "Tile width", dim: "length_s", default: 600, min: 10, step: 10, group: "Tile" },
    { key: "gap", label: "Grout gap", dim: "length_s", default: 3, min: 0, max: 20, step: 0.5, group: "Tile" },
    { key: "thk", label: "Tile thickness", dim: "length_s", default: 10, min: 3, max: 30, step: 1, group: "Tile" },
    { key: "perBox", label: "Tiles per box", default: 4, min: 1, step: 1, group: "Packaging" },
    { key: "layout", label: "Layout", type: "select", default: "straight", group: "Packaging", options: [{ value: "straight", label: "Straight (10% waste)" }, { value: "diagonal", label: "Diagonal / herringbone (15% waste)" }] },
    { key: "adh", label: "Adhesive bed thickness", dim: "length_s", default: 4, min: 2, max: 12, step: 1, group: "Packaging" },
  ],
  compute: (v) => {
    const area = +v.L * +v.W;
    const tlm = (+v.tl + +v.gap) / 1000, twm = (+v.tw + +v.gap) / 1000;
    const perM2 = 1 / (tlm * twm);
    const waste = v.layout === "diagonal" ? 0.15 : 0.10;
    const tiles = Math.ceil(area * perM2 * (1 + waste));
    const boxes = Math.ceil(tiles / +v.perBox);
    const groutVol = area * ((2 * +v.gap / 1000) / ((+v.tl / 1000) + (+v.tw / 1000)) ) * (+v.thk / 1000) * 1.0; // approximate
    const groutKg = ((+v.tl + +v.tw) / (+v.tl * +v.tw)) * +v.gap * +v.thk * 1.6 * area; // kg, standard formula
    void groutVol;
    const adhKg = area * (+v.adh) * 1.3; // ≈1.3 kg/m² per mm
    return {
      outputs: [
        { key: "tiles", label: "Tiles to order", value: tiles, dim: "count", primary: true, note: `incl. ${waste * 100}% waste` },
        { key: "boxes", label: "Boxes", value: boxes, dim: "count", primary: true, note: `${+v.perBox} per box` },
        { key: "area", label: "Floor area", value: area, dim: "area", primary: true },
        { key: "perM2", label: "Tiles per m²", value: perM2, precision: 2, group: "Details" },
        { key: "boxArea", label: "Coverage of one box", value: +v.perBox / perM2, dim: "area", group: "Details" },
        { key: "adh", label: "Adhesive (20 kg bags)", value: Math.ceil(adhKg / 20), dim: "count", group: "Consumables", note: `${Math.round(adhKg)} kg` },
        { key: "grout", label: "Grout", value: groutKg, dim: "mass", group: "Consumables" },
        { key: "spacers", label: "Spacers (approx.)", value: tiles * 4, dim: "count", group: "Consumables" },
      ],
    };
  },
  formulas: ["Tiles/m² = 1 / [(tl + gap)(tw + gap)]", "Grout (kg) = (tl + tw)/(tl·tw) × gap × thickness × 1.6 × area"],
};
