import type { CalculatorDef } from "../types";

export const stairs: CalculatorDef = {
  slug: "stairs",
  name: "Stair Design",
  tagline: "Risers, treads, stringers and code checks.",
  category: "Finishes",
  description: "Number of risers and treads, actual riser height, total run, stringer length and angle for a straight flight, with a comfort and code check.",
  diagram: "stairs",
  inputs: [
    { key: "rise", label: "Total rise (floor to floor)", dim: "length_s", default: 2900, min: 100, step: 10, group: "Geometry" },
    { key: "targetRiser", label: "Target riser height", dim: "length_s", default: 175, min: 100, max: 250, step: 5, group: "Geometry", help: "Residential max ≈ 190–200 mm; commercial ≈ 180 mm." },
    { key: "tread", label: "Tread depth (going)", dim: "length_s", default: 275, min: 150, max: 400, step: 5, group: "Geometry", help: "Min ≈ 250 mm; comfortable 275–300 mm." },
    { key: "nosing", label: "Nosing overhang", dim: "length_s", default: 25, min: 0, max: 50, step: 5, group: "Geometry" },
    { key: "width", label: "Stair width", dim: "length", default: 1, min: 0.5, step: 0.05, group: "Geometry" },
    { key: "headroom", label: "Available run", dim: "length", default: 4.5, min: 0.5, step: 0.1, group: "Constraints", help: "Horizontal space available for the flight." },
  ],
  compute: (v) => {
    const R = +v.rise, tr = +v.targetRiser, T = +v.tread, nos = +v.nosing;
    const n = Math.max(Math.round(R / tr), 2);
    const riser = R / n;
    const treads = n - 1;
    const run = treads * T;
    const stringer = Math.sqrt(run ** 2 + R ** 2);
    const angle = (Math.atan(R / run) * 180) / Math.PI;
    const twoRT = 2 * riser + T;
    const warnings: string[] = [];
    if (riser > 200) warnings.push(`Riser ${riser.toFixed(0)} mm exceeds the typical 200 mm residential maximum — add a riser.`);
    if (T < 250) warnings.push("Tread depth under 250 mm is below most code minimums.");
    if (twoRT < 600 || twoRT > 660) warnings.push(`Comfort rule 2R + T = ${twoRT.toFixed(0)} mm is outside the 600–660 mm range.`);
    if (angle > 42) warnings.push(`Stair angle ${angle.toFixed(1)}° is steeper than 42°.`);
    if (run / 1000 > +v.headroom) warnings.push("Total run exceeds the available horizontal space — consider a landing or steeper flight.");
    const altN = riser > 200 ? n + 1 : n - 1;
    return {
      warnings,
      outputs: [
        { key: "n", label: "Number of risers", value: n, dim: "count", primary: true },
        { key: "riser", label: "Actual riser height", value: riser, dim: "length_s", primary: true },
        { key: "treads", label: "Number of treads", value: treads, dim: "count", primary: true },
        { key: "run", label: "Total run", value: run / 1000, dim: "length", group: "Geometry" },
        { key: "stringer", label: "Stringer length", value: stringer / 1000, dim: "length", group: "Geometry" },
        { key: "angle", label: "Stair angle", value: angle, dim: "angle", group: "Geometry" },
        { key: "treadFull", label: "Tread incl. nosing", value: T + nos, dim: "length_s", group: "Geometry" },
        { key: "rule", label: "2R + T (comfort rule)", value: twoRT, dim: "length_s", group: "Checks", note: "target 600–660 mm" },
        { key: "rt", label: "R + T", value: riser + T, dim: "length_s", group: "Checks", note: "target 430–460 mm" },
        { key: "alt", label: "Alternative riser count", value: altN, dim: "count", group: "Checks", note: `${(R / altN).toFixed(0)} mm risers` },
        { key: "treadArea", label: "Tread material area", value: (treads * (T + nos) / 1000) * +v.width, dim: "area", group: "Materials" },
      ],
    };
  },
  formulas: ["n = round(total rise / target riser)", "riser = total rise / n", "run = (n − 1) × tread", "stringer = √(run² + rise²)"],
};
