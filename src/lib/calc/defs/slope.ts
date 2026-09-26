import type { CalculatorDef } from "../types";

export const slope: CalculatorDef = {
  slug: "slope-grade",
  name: "Slope & Grade",
  tagline: "Percent, ratio, degrees and drainage falls.",
  category: "Site & Civil",
  description: "Convert between grade, ratio and angle, and compute the drop over a run — for drainage, ramps, driveways and pipes.",
  diagram: "slope",
  inputs: [
    { key: "mode", label: "Known values", type: "select", default: "riserun", group: "Input", options: [
      { value: "riserun", label: "Rise and run" },
      { value: "percent", label: "Grade % and run" },
      { value: "angle", label: "Angle and run" },
      { value: "ratio", label: "Ratio 1 : n and run" },
    ] },
    { key: "run", label: "Horizontal run", dim: "length", default: 20, min: 0.001, step: 0.1, group: "Input" },
    { key: "rise", label: "Rise / fall", dim: "length_s", default: 400, step: 10, group: "Input", showIf: { key: "mode", values: ["riserun"] } },
    { key: "pct", label: "Grade", dim: "percent", default: 2, step: 0.1, group: "Input", showIf: { key: "mode", values: ["percent"] } },
    { key: "deg", label: "Angle", dim: "angle", default: 5, step: 0.5, group: "Input", showIf: { key: "mode", values: ["angle"] } },
    { key: "n", label: "1 in n", default: 40, min: 0.01, step: 1, group: "Input", showIf: { key: "mode", values: ["ratio"] } },
    { key: "use", label: "Check against", type: "select", default: "drain", group: "Check", options: [
      { value: "drain", label: "Drainage pipe (min 1 in 80 for 100 mm)" },
      { value: "ramp", label: "Accessible ramp (max 1 : 12)" },
      { value: "drive", label: "Driveway (max 15–20%)" },
      { value: "paving", label: "Surface fall (min 1 : 60)" },
      { value: "none", label: "None" },
    ] },
  ],
  compute: (v) => {
    const run = +v.run;
    let rise = 0;
    const mode = String(v.mode);
    if (mode === "riserun") rise = +v.rise / 1000;
    else if (mode === "percent") rise = (run * +v.pct) / 100;
    else if (mode === "angle") rise = run * Math.tan((+v.deg * Math.PI) / 180);
    else rise = run / +v.n;
    const grade = (rise / run) * 100;
    const angle = (Math.atan(rise / run) * 180) / Math.PI;
    const ratioN = rise !== 0 ? run / Math.abs(rise) : Infinity;
    const slopeLen = Math.sqrt(run * run + rise * rise);
    const warnings: string[] = [];
    const use = String(v.use);
    const g = Math.abs(grade);
    if (use === "drain" && g < 1.25) warnings.push("Fall is flatter than 1 in 80 — a 100 mm foul drain may not self-cleanse.");
    if (use === "ramp" && g > 8.33) warnings.push("Steeper than 1 : 12 — not compliant for an accessible ramp.");
    if (use === "drive" && g > 15) warnings.push("Steeper than 15% — driveways above this need transitions to avoid scraping.");
    if (use === "paving" && g < 1.67) warnings.push("Fall is flatter than 1 in 60 — surface water may pond.");
    return {
      warnings,
      outputs: [
        { key: "grade", label: "Grade", value: grade, dim: "percent", primary: true },
        { key: "ratio", label: "Ratio", value: isFinite(ratioN) ? `1 : ${ratioN.toFixed(ratioN < 10 ? 2 : 0)}` : "flat", primary: true },
        { key: "angle", label: "Angle", value: angle, dim: "angle", primary: true },
        { key: "rise", label: "Rise / fall over run", value: rise * 1000, dim: "length_s", group: "Geometry" },
        { key: "run", label: "Horizontal run", value: run, dim: "length", group: "Geometry" },
        { key: "slopeLen", label: "Slope length", value: slopeLen, dim: "length", group: "Geometry" },
        { key: "per10", label: "Fall per 10 m", value: (rise / run) * 10 * 1000, dim: "length_s", group: "Geometry" },
        { key: "permille", label: "Per mille (‰)", value: grade * 10, precision: 1, group: "Geometry" },
      ],
    };
  },
  formulas: ["Grade % = rise / run × 100", "Angle = atan(rise / run)", "Ratio 1 : n where n = run / rise"],
};
