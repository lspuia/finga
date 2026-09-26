import type { CalculatorDef } from "../types";

// [nominal dia mm, mass kg/m]
const BARS: Record<string, { d: number; kgm: number; label: string }> = {
  "10": { d: 10, kgm: 0.617, label: "10 mm  (#3)" },
  "12": { d: 12, kgm: 0.888, label: "12 mm  (#4)" },
  "16": { d: 16, kgm: 1.578, label: "16 mm  (#5)" },
  "20": { d: 20, kgm: 2.466, label: "20 mm  (#6)" },
  "25": { d: 25, kgm: 3.853, label: "25 mm  (#8)" },
  "32": { d: 32, kgm: 6.313, label: "32 mm  (#10)" },
  "40": { d: 40, kgm: 9.864, label: "40 mm  (#12)" },
};

export const rebar: CalculatorDef = {
  slug: "rebar",
  name: "Rebar",
  tagline: "Bar counts, weights and lap lengths for slabs and beams.",
  category: "Concrete & Masonry",
  description:
    "Quantity and weight of reinforcing steel for a rectangular mesh (slab / raft) or a set of straight bars, including lap lengths, cover and stock-length utilisation.",
  inputs: [
    {
      key: "mode", label: "Layout", type: "select", default: "mesh", group: "Layout",
      options: [
        { value: "mesh", label: "Two-way mesh in a slab" },
        { value: "bars", label: "Straight bars (count × length)" },
      ],
    },
    { key: "size", label: "Bar size", type: "select", default: "16", group: "Layout", options: Object.entries(BARS).map(([k, b]) => ({ value: k, label: b.label })) },
    { key: "L", label: "Slab length", dim: "length", default: 8, min: 0.1, step: 0.1, group: "Slab", showIf: { key: "mode", values: ["mesh"] } },
    { key: "W", label: "Slab width", dim: "length", default: 5, min: 0.1, step: 0.1, group: "Slab", showIf: { key: "mode", values: ["mesh"] } },
    { key: "sx", label: "Spacing along length", dim: "length_s", default: 200, min: 25, step: 25, group: "Slab", showIf: { key: "mode", values: ["mesh"] } },
    { key: "sy", label: "Spacing along width", dim: "length_s", default: 200, min: 25, step: 25, group: "Slab", showIf: { key: "mode", values: ["mesh"] } },
    { key: "layers", label: "Layers (top + bottom)", default: 2, min: 1, max: 2, step: 1, group: "Slab", showIf: { key: "mode", values: ["mesh"] } },
    { key: "cover", label: "Edge cover", dim: "length_s", default: 40, min: 0, step: 5, group: "Slab", showIf: { key: "mode", values: ["mesh"] } },
    { key: "count", label: "Number of bars", default: 24, min: 1, step: 1, group: "Bars", showIf: { key: "mode", values: ["bars"] } },
    { key: "len", label: "Bar length (each)", dim: "length", default: 9, min: 0.1, step: 0.1, group: "Bars", showIf: { key: "mode", values: ["bars"] } },
    { key: "lapFactor", label: "Lap length (× bar diameter)", default: 40, min: 0, max: 80, step: 1, group: "Details", help: "Typical 40–50d for tension laps." },
    { key: "stock", label: "Stock bar length", dim: "length", default: 12, min: 1, step: 0.5, group: "Details" },
    { key: "waste", label: "Waste allowance", dim: "percent", default: 5, min: 0, max: 30, step: 1, group: "Details" },
  ],
  compute: (v) => {
    const bar = BARS[String(v.size)];
    const mode = String(v.mode);
    const lap = (+v.lapFactor * bar.d) / 1000; // m
    const stock = +v.stock;
    let nBars = 0, totalLen = 0, nX = 0, nY = 0, lapsPerBar = 0;
    if (mode === "mesh") {
      const L = +v.L - 2 * (+v.cover / 1000), W = +v.W - 2 * (+v.cover / 1000);
      nX = Math.floor(W / (+v.sx / 1000)) + 1; // bars running along L
      nY = Math.floor(L / (+v.sy / 1000)) + 1; // bars running along W
      const layers = +v.layers;
      const lapsX = Math.max(0, Math.ceil(L / stock) - 1), lapsY = Math.max(0, Math.ceil(W / stock) - 1);
      totalLen = layers * (nX * (L + lapsX * lap) + nY * (W + lapsY * lap));
      nBars = layers * (nX + nY);
      lapsPerBar = Math.max(lapsX, lapsY);
    } else {
      nBars = +v.count;
      const laps = Math.max(0, Math.ceil(+v.len / stock) - 1);
      lapsPerBar = laps;
      totalLen = nBars * (+v.len + laps * lap);
    }
    const withWaste = totalLen * (1 + +v.waste / 100);
    const weight = withWaste * bar.kgm;
    const stockBars = Math.ceil(withWaste / stock);
    return {
      outputs: [
        { key: "weight", label: "Total steel weight", value: weight, dim: "mass", primary: true, note: `incl. ${v.waste}% waste` },
        { key: "len", label: "Total bar length", value: withWaste, dim: "length", primary: true },
        { key: "stockBars", label: `Stock bars to order (${stock} m)`, value: stockBars, dim: "count", primary: true },
        ...(mode === "mesh" ? [
          { key: "nX", label: "Bars per layer, along length", value: nX, dim: "count" as const, group: "Layout" },
          { key: "nY", label: "Bars per layer, along width", value: nY, dim: "count" as const, group: "Layout" },
        ] : []),
        { key: "nBars", label: "Total bars", value: nBars, dim: "count", group: "Layout" },
        { key: "lap", label: "Lap length", value: lap * 1000, dim: "length_s", group: "Details" },
        { key: "laps", label: "Laps per bar run", value: lapsPerBar, dim: "count", group: "Details" },
        { key: "kgm", label: "Unit mass", value: bar.kgm, dim: "mass", group: "Details", note: "per m" },
        { key: "tonnes", label: "Weight in tonnes", value: weight / 1000, precision: 2, group: "Details" },
      ],
    };
  },
  formulas: ["Bars per direction = floor(clear width / spacing) + 1", "Mass = 0.00617 × d²  kg/m", "Lap = k × d (k ≈ 40–50)"],
};
