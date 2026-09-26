import type { CalculatorDef } from "../types";

export const beam: CalculatorDef = {
  slug: "beam",
  name: "Beam Analysis",
  tagline: "Moment, shear and deflection in seconds.",
  category: "Structural",
  description:
    "Maximum bending moment, shear force, support reactions and mid-span deflection for common beam cases under uniformly distributed or point loads.",
  diagram: "beam",
  inputs: [
    {
      key: "support", label: "Support condition", type: "select", default: "simple", group: "Configuration",
      options: [
        { value: "simple", label: "Simply supported" },
        { value: "cantilever", label: "Cantilever" },
        { value: "fixed", label: "Fixed both ends" },
      ],
    },
    {
      key: "loadType", label: "Load type", type: "select", default: "udl", group: "Configuration",
      options: [
        { value: "udl", label: "Uniformly distributed" },
        { value: "point", label: "Point load" },
      ],
    },
    { key: "L", label: "Span", dim: "length", default: 6, min: 0.1, step: 0.1, group: "Geometry & loads" },
    { key: "w", label: "Distributed load", dim: "lineload", default: 12, min: 0, step: 0.5, group: "Geometry & loads", showIf: { key: "loadType", values: ["udl"] } },
    { key: "P", label: "Point load", dim: "force", default: 40, min: 0, step: 1, group: "Geometry & loads", showIf: { key: "loadType", values: ["point"] } },
    { key: "a", label: "Load position from left", dim: "length", default: 3, min: 0, step: 0.1, group: "Geometry & loads", showIf: { key: "loadType", values: ["point"] }, help: "For cantilevers, measured from the fixed end." },
    { key: "E", label: "Elastic modulus E", dim: "stress", default: 200000, min: 1, step: 1000, group: "Section", help: "Steel ≈ 200 000 MPa, concrete ≈ 25 000 MPa, timber ≈ 11 000 MPa." },
    { key: "I", label: "Moment of inertia I", dim: "inertia", default: 8000, min: 0.01, step: 10, group: "Section", help: "About the bending axis." },
  ],
  compute: (v) => {
    const support = String(v.support);
    const loadType = String(v.loadType);
    const L = +v.L, w = +v.w, P = +v.P, E = +v.E, I = +v.I;
    const a = Math.min(Math.max(+v.a, 0), L);
    const b = L - a;
    const EI = E * 1e6 * (I * 1e-8); // N·m²  (MPa→Pa, cm⁴→m⁴)
    const warnings: string[] = [];

    let Mmax = 0, Vmax = 0, R1 = 0, R2 = 0, delta = 0, Mneg = 0, xM = 0;

    if (support === "simple") {
      if (loadType === "udl") {
        R1 = R2 = (w * L) / 2; Vmax = R1; Mmax = (w * L * L) / 8; xM = L / 2;
        delta = (5 * (w * 1000) * Math.pow(L, 4)) / (384 * EI);
      } else {
        R1 = (P * b) / L; R2 = (P * a) / L; Vmax = Math.max(R1, R2); Mmax = (P * a * b) / L; xM = a;
        const x = Math.sqrt((L * L - b * b) / 3);
        delta = a >= b
          ? ((P * 1000) * b * Math.pow(L * L - b * b, 1.5)) / (9 * Math.sqrt(3) * EI * L)
          : ((P * 1000) * a * Math.pow(L * L - a * a, 1.5)) / (9 * Math.sqrt(3) * EI * L);
        void x;
      }
    } else if (support === "cantilever") {
      if (loadType === "udl") {
        R1 = w * L; R2 = 0; Vmax = R1; Mmax = (w * L * L) / 2; xM = 0;
        delta = ((w * 1000) * Math.pow(L, 4)) / (8 * EI);
      } else {
        R1 = P; R2 = 0; Vmax = P; Mmax = P * a; xM = 0;
        delta = ((P * 1000) * a * a * (3 * L - a)) / (6 * EI);
      }
      Mneg = Mmax;
    } else {
      if (loadType === "udl") {
        R1 = R2 = (w * L) / 2; Vmax = R1; Mmax = (w * L * L) / 24; Mneg = (w * L * L) / 12; xM = L / 2;
        delta = ((w * 1000) * Math.pow(L, 4)) / (384 * EI);
      } else {
        R1 = (P * b * b * (3 * a + b)) / (L ** 3); R2 = (P * a * a * (a + 3 * b)) / (L ** 3);
        Vmax = Math.max(R1, R2);
        Mmax = (2 * P * a * a * b * b) / (L ** 3); xM = a;
        Mneg = Math.max((P * a * b * b) / (L * L), (P * a * a * b) / (L * L));
        delta = (2 * (P * 1000) * a ** 3 * b ** 3) / (3 * EI * L ** 3);
      }
    }

    const ratio = delta > 0 ? L / delta : Infinity;
    if (ratio < 360) warnings.push(`Deflection exceeds L/360 (currently L/${Math.round(ratio)}). Consider a stiffer section.`);
    if (loadType === "point" && support !== "cantilever" && (a <= 0 || a >= L)) warnings.push("Point load sits on a support; moment is zero.");

    return {
      warnings,
      outputs: [
        { key: "Mmax", label: support === "fixed" ? "Max positive moment" : "Max bending moment", value: Mmax, dim: "moment", primary: true, note: support === "cantilever" ? "at fixed end" : `at x = ${xM.toFixed(2)} m` },
        ...(Mneg && support === "fixed" ? [{ key: "Mneg", label: "Max negative moment (supports)", value: Mneg, dim: "moment" as const, primary: true }] : []),
        { key: "Vmax", label: "Max shear force", value: Vmax, dim: "force", primary: true },
        { key: "delta", label: "Max deflection", value: delta * 1000, dim: "length_s", primary: true, note: isFinite(ratio) ? `L/${Math.round(ratio)}` : "" },
        { key: "R1", label: support === "cantilever" ? "Fixed-end reaction" : "Reaction, left support", value: R1, dim: "force", group: "Reactions" },
        ...(support !== "cantilever" ? [{ key: "R2", label: "Reaction, right support", value: R2, dim: "force" as const, group: "Reactions" }] : []),
        { key: "totalLoad", label: "Total applied load", value: loadType === "udl" ? w * L : P, dim: "force", group: "Reactions" },
      ],
    };
  },
  formulas: [
    "Simply supported, UDL: M = wL²/8, V = wL/2, δ = 5wL⁴/384EI",
    "Simply supported, point load: M = Pab/L, δ = Pb(L²−b²)^1.5 / (9√3·EI·L)",
    "Cantilever, UDL: M = wL²/2, δ = wL⁴/8EI",
    "Fixed-fixed, UDL: M⁺ = wL²/24, M⁻ = wL²/12, δ = wL⁴/384EI",
  ],
  notes: [
    "Results are elastic and assume a prismatic, linearly elastic beam with small deflections.",
    "Serviceability limits: L/360 for floors with plaster ceilings, L/240 for roofs.",
  ],
};
