import type { CalculatorDef } from "../types";

export const column: CalculatorDef = {
  slug: "column",
  name: "Column Buckling",
  tagline: "Euler critical load and slenderness check.",
  category: "Structural",
  description:
    "Critical buckling load, slenderness ratio and an elastic-vs-yield comparison for an axially loaded column with common end conditions.",
  inputs: [
    {
      key: "K", label: "End condition (K)", type: "select", default: "1", group: "Configuration",
      options: [
        { value: "0.5", label: "Fixed – Fixed (K = 0.5)" },
        { value: "0.7", label: "Fixed – Pinned (K = 0.7)" },
        { value: "1", label: "Pinned – Pinned (K = 1.0)" },
        { value: "2", label: "Fixed – Free (K = 2.0)" },
      ],
    },
    { key: "L", label: "Unbraced length", dim: "length", default: 4, min: 0.1, step: 0.1, group: "Geometry" },
    { key: "A", label: "Cross-section area", dim: "area_s", default: 58.9, min: 0.1, step: 1, group: "Geometry", help: "e.g. W200×46: 58.9 cm²" },
    { key: "I", label: "Least moment of inertia", dim: "inertia", default: 1540, min: 0.01, step: 10, group: "Geometry", help: "Use the weak axis (Iy)." },
    { key: "E", label: "Elastic modulus E", dim: "stress", default: 200000, min: 1, step: 1000, group: "Material" },
    { key: "fy", label: "Yield strength", dim: "stress", default: 345, min: 1, step: 5, group: "Material" },
    { key: "P", label: "Applied axial load", dim: "force", default: 500, min: 0, step: 10, group: "Loading" },
  ],
  compute: (v) => {
    const K = +v.K, L = +v.L, E = +v.E, fy = +v.fy, P = +v.P;
    const A = +v.A * 1e-4; // cm² -> m²
    const I = +v.I * 1e-8; // cm⁴ -> m⁴
    const r = Math.sqrt(I / A);
    const KL = K * L;
    const slender = KL / r;
    const Pcr = (Math.PI ** 2 * E * 1e6 * I) / (KL * KL) / 1000; // kN
    const Fe = (Math.PI ** 2 * E) / (slender * slender); // MPa
    const Py = fy * A * 1e6 / 1000; // kN
    // AISC-style flexural buckling stress
    const lambdaLimit = 4.71 * Math.sqrt(E / fy);
    const Fcr = slender <= lambdaLimit ? Math.pow(0.658, fy / Fe) * fy : 0.877 * Fe;
    const Pn = Fcr * A * 1e6 / 1000;
    const phiPn = 0.9 * Pn;
    const util = P / phiPn;
    const warnings: string[] = [];
    if (slender > 200) warnings.push("Slenderness ratio exceeds 200 — generally not permitted for compression members.");
    if (util > 1) warnings.push(`Applied load exceeds design capacity (utilisation ${(util * 100).toFixed(0)}%).`);
    return {
      warnings,
      outputs: [
        { key: "Pcr", label: "Euler critical load", value: Pcr, dim: "force", primary: true },
        { key: "phiPn", label: "Design capacity φPn", value: phiPn, dim: "force", primary: true, note: "AISC flexural buckling, φ = 0.9" },
        { key: "util", label: "Utilisation", value: util * 100, dim: "percent", primary: true },
        { key: "slender", label: "Slenderness KL/r", value: slender, precision: 1, group: "Details" },
        { key: "r", label: "Radius of gyration", value: r * 1000, dim: "length_s", group: "Details" },
        { key: "Fe", label: "Elastic buckling stress Fe", value: Fe, dim: "stress", group: "Details" },
        { key: "Fcr", label: "Critical stress Fcr", value: Fcr, dim: "stress", group: "Details" },
        { key: "Py", label: "Squash load (A·fy)", value: Py, dim: "force", group: "Details" },
        { key: "mode", label: "Governing mode", value: slender <= lambdaLimit ? "Inelastic buckling" : "Elastic buckling", group: "Details" },
      ],
    };
  },
  formulas: [
    "Pcr = π²EI / (KL)²",
    "λ = KL / r,  r = √(I/A)",
    "Fcr = 0.658^(fy/Fe)·fy  when KL/r ≤ 4.71√(E/fy), else 0.877·Fe",
  ],
  notes: ["Design capacity follows AISC 360 Chapter E flexural buckling for a doubly symmetric section."],
};
