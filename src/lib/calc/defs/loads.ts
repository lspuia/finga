import type { CalculatorDef } from "../types";

export const loads: CalculatorDef = {
  slug: "load-takedown",
  name: "Load Takedown",
  tagline: "Area loads to line loads and factored combinations.",
  category: "Structural",
  description:
    "Convert floor area loads into a line load on a beam using its tributary width, then generate LRFD and ASD load combinations.",
  inputs: [
    { key: "DL", label: "Superimposed dead load", dim: "pressure", default: 1.5, min: 0, step: 0.1, group: "Area loads", help: "Finishes, services, partitions." },
    { key: "selfW", label: "Slab self-weight", dim: "pressure", default: 3.6, min: 0, step: 0.1, group: "Area loads", help: "150 mm concrete ≈ 3.6 kPa." },
    { key: "LL", label: "Live load", dim: "pressure", default: 2.4, min: 0, step: 0.1, group: "Area loads", help: "Residential 1.9–2.0, office 2.4, storage 4.8+ kPa." },
    { key: "trib", label: "Tributary width", dim: "length", default: 3, min: 0, step: 0.1, group: "Beam", help: "Half the span to each adjacent beam." },
    { key: "span", label: "Beam span", dim: "length", default: 6, min: 0.1, step: 0.1, group: "Beam" },
    { key: "beamW", label: "Beam self-weight", dim: "lineload", default: 0.5, min: 0, step: 0.05, group: "Beam" },
  ],
  compute: (v) => {
    const D = +v.DL + +v.selfW, L = +v.LL, trib = +v.trib, span = +v.span, bw = +v.beamW;
    const wD = D * trib + bw, wL = L * trib;
    const lrfd1 = 1.4 * wD;
    const lrfd2 = 1.2 * wD + 1.6 * wL;
    const asd = wD + wL;
    const wu = Math.max(lrfd1, lrfd2);
    const Mu = wu * span * span / 8, Vu = wu * span / 2;
    const Ma = asd * span * span / 8;
    return {
      outputs: [
        { key: "wu", label: "Factored line load wu (LRFD)", value: wu, dim: "lineload", primary: true, note: lrfd2 >= lrfd1 ? "1.2D + 1.6L governs" : "1.4D governs" },
        { key: "wa", label: "Service line load (ASD D + L)", value: asd, dim: "lineload", primary: true },
        { key: "Mu", label: "Factored moment Mu (simple span)", value: Mu, dim: "moment", primary: true },
        { key: "Vu", label: "Factored shear Vu", value: Vu, dim: "force", group: "Simple-span demands" },
        { key: "Ma", label: "Service moment Ma", value: Ma, dim: "moment", group: "Simple-span demands" },
        { key: "wD", label: "Dead line load", value: wD, dim: "lineload", group: "Unfactored" },
        { key: "wL", label: "Live line load", value: wL, dim: "lineload", group: "Unfactored" },
        { key: "c1", label: "1.4D", value: lrfd1, dim: "lineload", group: "Combinations" },
        { key: "c2", label: "1.2D + 1.6L", value: lrfd2, dim: "lineload", group: "Combinations" },
        { key: "RD", label: "Total reaction per support (service)", value: asd * span / 2, dim: "force", group: "Combinations" },
      ],
    };
  },
  formulas: ["w = q × tributary width + beam self-weight", "LRFD: max(1.4D, 1.2D + 1.6L)", "ASD: D + L", "M = wL²/8, V = wL/2"],
};
