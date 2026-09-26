import type { CalculatorDef } from "../types";

export const earthwork: CalculatorDef = {
  slug: "earthwork",
  name: "Excavation & Earthwork",
  tagline: "Bank, loose and compacted volumes with haulage.",
  category: "Site & Civil",
  description: "Excavation volume for a pit or trench with battered sides, converted between bank, loose and compacted states, with truckloads and excavator time.",
  diagram: "earthwork",
  inputs: [
    { key: "L", label: "Length at base", dim: "length", default: 12, min: 0.1, step: 0.1, group: "Excavation" },
    { key: "W", label: "Width at base", dim: "length", default: 8, min: 0.1, step: 0.1, group: "Excavation" },
    { key: "D", label: "Depth", dim: "length", default: 2, min: 0.1, step: 0.1, group: "Excavation" },
    { key: "slope", label: "Side slope (H : 1V)", default: 0.5, min: 0, max: 3, step: 0.25, group: "Excavation", help: "0 = vertical sides, 1 = 45° batter." },
    { key: "soil", label: "Soil type", type: "select", default: "clay", group: "Soil", options: [
      { value: "sand", label: "Sand / gravel  (swell 12%, shrink 12%)" },
      { value: "loam", label: "Loam / topsoil  (swell 25%, shrink 20%)" },
      { value: "clay", label: "Clay  (swell 30%, shrink 15%)" },
      { value: "rock", label: "Blasted rock  (swell 50%, shrink −30%)" },
    ] },
    { key: "truck", label: "Truck capacity", dim: "volume", default: 10, min: 1, step: 1, group: "Haulage" },
    { key: "rate", label: "Excavator output", dim: "volume", default: 40, min: 1, step: 5, group: "Haulage", help: "Bank m³ per hour." },
    { key: "backfill", label: "Backfill required", dim: "volume", default: 60, min: 0, step: 5, group: "Haulage", help: "Compacted volume to be placed back." },
  ],
  compute: (v) => {
    const L = +v.L, W = +v.W, D = +v.D, s = +v.slope;
    const Lt = L + 2 * s * D, Wt = W + 2 * s * D;
    // prismoidal formula
    const A1 = L * W, A2 = Lt * Wt, Am = (L + s * D) * (W + s * D);
    const bank = (D / 6) * (A1 + 4 * Am + A2);
    const factors: Record<string, [number, number]> = { sand: [1.12, 0.88], loam: [1.25, 0.80], clay: [1.30, 0.85], rock: [1.50, 1.30] };
    const [swell, shrink] = factors[String(v.soil)];
    const loose = bank * swell;
    const compacted = bank * shrink;
    const trucks = Math.ceil(loose / +v.truck);
    const hours = bank / +v.rate;
    const backfillBank = +v.backfill / shrink;
    const spoil = Math.max(bank - backfillBank, 0);
    return {
      outputs: [
        { key: "bank", label: "Bank (in-situ) volume", value: bank, dim: "volume", primary: true },
        { key: "loose", label: "Loose volume to haul", value: loose, dim: "volume", primary: true, note: `swell ${Math.round((swell - 1) * 100)}%` },
        { key: "trucks", label: "Truckloads", value: trucks, dim: "count", primary: true },
        { key: "compacted", label: "Compacted volume", value: compacted, dim: "volume", group: "Volumes" },
        { key: "topArea", label: "Area at surface", value: A2, dim: "area", group: "Volumes" },
        { key: "topL", label: "Length at surface", value: Lt, dim: "length", group: "Volumes" },
        { key: "topW", label: "Width at surface", value: Wt, dim: "length", group: "Volumes" },
        { key: "hours", label: "Excavator time", value: hours, precision: 1, group: "Programme", note: "hours" },
        { key: "days", label: "Working days (8 h)", value: Math.ceil(hours / 8), dim: "count", group: "Programme" },
        { key: "reuse", label: "Bank volume retained for backfill", value: Math.min(backfillBank, bank), dim: "volume", group: "Disposal" },
        { key: "spoil", label: "Surplus spoil to remove (loose)", value: spoil * swell, dim: "volume", group: "Disposal" },
      ],
    };
  },
  formulas: ["Prismoidal: V = D/6 × (A₁ + 4Aₘ + A₂)", "Loose = bank × swell factor", "Compacted = bank × shrink factor"],
};
