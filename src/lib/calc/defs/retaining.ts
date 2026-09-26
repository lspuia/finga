import type { CalculatorDef } from "../types";

export const retaining: CalculatorDef = {
  slug: "retaining-wall",
  name: "Retaining Wall",
  tagline: "Rankine earth pressure and stability ratios.",
  category: "Structural",
  description:
    "Active earth pressure on a cantilever retaining wall using Rankine theory, with overturning and sliding factors of safety.",
  diagram: "retaining",
  inputs: [
    { key: "H", label: "Wall height (retained)", dim: "length", default: 3, min: 0.1, step: 0.1, group: "Geometry" },
    { key: "tStem", label: "Stem thickness", dim: "length_s", default: 300, min: 50, step: 25, group: "Geometry" },
    { key: "Bbase", label: "Base width", dim: "length", default: 2.4, min: 0.1, step: 0.1, group: "Geometry" },
    { key: "tBase", label: "Base thickness", dim: "length_s", default: 400, min: 50, step: 25, group: "Geometry" },
    { key: "heel", label: "Heel length", dim: "length", default: 1.6, min: 0, step: 0.1, group: "Geometry", help: "Base portion under the retained soil." },
    { key: "gamma", label: "Soil unit weight", default: 18, min: 10, max: 25, step: 0.5, group: "Soil", help: "kN/m³ (typ. 17–20)." },
    { key: "phi", label: "Friction angle φ", dim: "angle", default: 30, min: 0, max: 45, step: 1, group: "Soil" },
    { key: "q", label: "Surcharge", dim: "pressure", default: 10, min: 0, step: 1, group: "Soil" },
    { key: "mu", label: "Base friction coefficient", default: 0.5, min: 0.1, max: 1, step: 0.05, group: "Soil" },
  ],
  compute: (v) => {
    const H = +v.H, tb = +v.tBase / 1000, ts = +v.tStem / 1000, B = +v.Bbase, heel = +v.heel;
    const g = +v.gamma, phi = (+v.phi * Math.PI) / 180, q = +v.q, mu = +v.mu;
    const Ht = H + tb; // total height to base underside
    const Ka = Math.tan(Math.PI / 4 - phi / 2) ** 2;
    const Pa_soil = 0.5 * Ka * g * Ht * Ht;
    const Pa_q = Ka * q * Ht;
    const Pa = Pa_soil + Pa_q;
    const Mo = Pa_soil * Ht / 3 + Pa_q * Ht / 2;
    // resisting
    const Wstem = ts * H * 24, xStem = B - heel - ts / 2;
    const Wbase = B * tb * 24, xBase = B / 2;
    const Wsoil = heel * H * g, xSoil = B - heel / 2;
    const Wq = q * heel, xq = xSoil;
    const W = Wstem + Wbase + Wsoil + Wq;
    const Mr = Wstem * xStem + Wbase * xBase + Wsoil * xSoil + Wq * xq;
    const FSo = Mr / Mo, FSs = (mu * W) / Pa;
    const xbar = (Mr - Mo) / W;
    const e = B / 2 - xbar;
    const qmax = (W / B) * (1 + (6 * e) / B), qmin = (W / B) * (1 - (6 * e) / B);
    const warnings: string[] = [];
    if (FSo < 2) warnings.push(`Overturning factor of safety ${FSo.toFixed(2)} is below 2.0.`);
    if (FSs < 1.5) warnings.push(`Sliding factor of safety ${FSs.toFixed(2)} is below 1.5.`);
    if (Math.abs(e) > B / 6) warnings.push("Resultant falls outside the middle third — base uplift occurs.");
    return {
      warnings,
      outputs: [
        { key: "FSo", label: "Overturning FoS", value: FSo, precision: 2, primary: true, note: "target ≥ 2.0" },
        { key: "FSs", label: "Sliding FoS", value: FSs, precision: 2, primary: true, note: "target ≥ 1.5" },
        { key: "Pa", label: "Total active thrust", value: Pa, dim: "lineload", primary: true, note: "per metre of wall" },
        { key: "Ka", label: "Active coefficient Ka", value: Ka, precision: 3, group: "Pressures" },
        { key: "Mo", label: "Overturning moment", value: Mo, dim: "moment", group: "Pressures" },
        { key: "Mr", label: "Resisting moment", value: Mr, dim: "moment", group: "Pressures" },
        { key: "e", label: "Eccentricity", value: e, dim: "length", group: "Bearing" },
        { key: "qmax", label: "Max base pressure", value: qmax, dim: "pressure", group: "Bearing" },
        { key: "qmin", label: "Min base pressure", value: qmin, dim: "pressure", group: "Bearing" },
        { key: "W", label: "Total vertical load", value: W, dim: "lineload", group: "Bearing" },
      ],
    };
  },
  formulas: ["Ka = tan²(45° − φ/2)", "Pa = ½·Ka·γ·H² + Ka·q·H", "FoS_ot = ΣM_resist / ΣM_overturn", "FoS_sl = μ·ΣW / Pa"],
  notes: ["Per metre run of wall. Passive resistance in front of the toe is conservatively ignored."],
};
