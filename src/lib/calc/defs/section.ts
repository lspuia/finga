import type { CalculatorDef } from "../types";

export const section: CalculatorDef = {
  slug: "section-properties",
  name: "Section Properties",
  tagline: "Area, inertia and section modulus for common shapes.",
  category: "Structural",
  description:
    "Geometric properties for rectangular, hollow rectangular, circular, hollow circular and I-shaped sections: area, second moment of area, section modulus and radius of gyration.",
  diagram: "section",
  inputs: [
    {
      key: "shape", label: "Shape", type: "select", default: "i", group: "Shape",
      options: [
        { value: "rect", label: "Solid rectangle" },
        { value: "hrect", label: "Hollow rectangle (RHS)" },
        { value: "circle", label: "Solid circle" },
        { value: "pipe", label: "Hollow circle (CHS)" },
        { value: "i", label: "I / H section" },
      ],
    },
    { key: "b", label: "Width b", dim: "length_s", default: 200, min: 1, step: 1, group: "Dimensions", showIf: { key: "shape", values: ["rect", "hrect", "i"] } },
    { key: "h", label: "Depth h", dim: "length_s", default: 400, min: 1, step: 1, group: "Dimensions", showIf: { key: "shape", values: ["rect", "hrect", "i"] } },
    { key: "t", label: "Wall thickness t", dim: "length_s", default: 8, min: 0.1, step: 0.5, group: "Dimensions", showIf: { key: "shape", values: ["hrect", "pipe"] } },
    { key: "tf", label: "Flange thickness", dim: "length_s", default: 16, min: 0.1, step: 0.5, group: "Dimensions", showIf: { key: "shape", values: ["i"] } },
    { key: "tw", label: "Web thickness", dim: "length_s", default: 10, min: 0.1, step: 0.5, group: "Dimensions", showIf: { key: "shape", values: ["i"] } },
    { key: "d", label: "Outer diameter", dim: "length_s", default: 219, min: 1, step: 1, group: "Dimensions", showIf: { key: "shape", values: ["circle", "pipe"] } },
    { key: "rho", label: "Material density", dim: "density", default: 7850, min: 1, step: 10, group: "Material", help: "Steel 7850, aluminium 2700, concrete 2400 kg/m³." },
  ],
  compute: (v) => {
    const shape = String(v.shape);
    const b = +v.b, h = +v.h, t = +v.t, tf = +v.tf, tw = +v.tw, d = +v.d, rho = +v.rho;
    let A = 0, Ix = 0, Iy = 0, yc = 0, xc = 0; // mm units
    const warnings: string[] = [];
    if (shape === "rect") { A = b * h; Ix = b * h ** 3 / 12; Iy = h * b ** 3 / 12; yc = h / 2; xc = b / 2; }
    else if (shape === "hrect") {
      const bi = b - 2 * t, hi = h - 2 * t;
      if (bi <= 0 || hi <= 0) warnings.push("Wall thickness too large for the outer dimensions.");
      A = b * h - Math.max(bi, 0) * Math.max(hi, 0);
      Ix = (b * h ** 3 - Math.max(bi, 0) * Math.max(hi, 0) ** 3) / 12;
      Iy = (h * b ** 3 - Math.max(hi, 0) * Math.max(bi, 0) ** 3) / 12; yc = h / 2; xc = b / 2;
    } else if (shape === "circle") { A = Math.PI * d ** 2 / 4; Ix = Iy = Math.PI * d ** 4 / 64; yc = xc = d / 2; }
    else if (shape === "pipe") {
      const di = d - 2 * t;
      if (di <= 0) warnings.push("Wall thickness too large for the outer diameter.");
      A = Math.PI * (d ** 2 - Math.max(di, 0) ** 2) / 4; Ix = Iy = Math.PI * (d ** 4 - Math.max(di, 0) ** 4) / 64; yc = xc = d / 2;
    } else {
      const hw = h - 2 * tf;
      if (hw <= 0) warnings.push("Flanges overlap — reduce flange thickness.");
      A = 2 * b * tf + Math.max(hw, 0) * tw;
      Ix = (b * h ** 3 - (b - tw) * Math.max(hw, 0) ** 3) / 12;
      Iy = (2 * tf * b ** 3 + Math.max(hw, 0) * tw ** 3) / 12; yc = h / 2; xc = b / 2;
    }
    const Sx = Ix / yc, Sy = Iy / xc;
    const rx = Math.sqrt(Ix / A), ry = Math.sqrt(Iy / A);
    const mass = A * 1e-6 * rho; // kg/m
    return {
      warnings,
      outputs: [
        { key: "A", label: "Cross-sectional area", value: A / 100, dim: "area_s", primary: true },
        { key: "Ix", label: "Moment of inertia Ixx", value: Ix / 1e4, dim: "inertia", primary: true },
        { key: "Sx", label: "Section modulus Sxx", value: Sx / 1e3, dim: "modulus", primary: true },
        { key: "Iy", label: "Moment of inertia Iyy", value: Iy / 1e4, dim: "inertia", group: "Weak axis" },
        { key: "Sy", label: "Section modulus Syy", value: Sy / 1e3, dim: "modulus", group: "Weak axis" },
        { key: "rx", label: "Radius of gyration rx", value: rx, dim: "length_s", group: "Radii of gyration" },
        { key: "ry", label: "Radius of gyration ry", value: ry, dim: "length_s", group: "Radii of gyration" },
        { key: "mass", label: "Mass per metre", value: mass, dim: "mass", group: "Mass", note: "per m (per ft ≈ ÷3.28)" },
      ],
    };
  },
  formulas: ["Rectangle: I = bh³/12", "I-section: I = [bh³ − (b−tw)(h−2tf)³]/12", "S = I / y,  r = √(I/A)"],
};
