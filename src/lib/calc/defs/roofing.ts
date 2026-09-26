import type { CalculatorDef } from "../types";

export const roofing: CalculatorDef = {
  slug: "roofing",
  name: "Roofing",
  tagline: "Pitch, rafter length, roof area and materials.",
  category: "Finishes",
  description: "Rafter lengths, pitch angle, sloped roof area and covering quantities for a gable roof from plan dimensions and pitch.",
  diagram: "roof",
  inputs: [
    { key: "span", label: "Building width (span)", dim: "length", default: 10, min: 0.1, step: 0.1, group: "Plan" },
    { key: "length", label: "Building length (ridge)", dim: "length", default: 16, min: 0.1, step: 0.1, group: "Plan" },
    { key: "overhang", label: "Eave overhang", dim: "length_s", default: 450, min: 0, step: 50, group: "Plan" },
    { key: "gableOH", label: "Gable overhang", dim: "length_s", default: 300, min: 0, step: 50, group: "Plan" },
    { key: "pitchMode", label: "Pitch input", type: "select", default: "deg", group: "Pitch", options: [{ value: "deg", label: "Degrees" }, { value: "ratio", label: "Rise per 12 run" }] },
    { key: "pitchDeg", label: "Pitch", dim: "angle", default: 30, min: 0, max: 85, step: 1, group: "Pitch", showIf: { key: "pitchMode", values: ["deg"] } },
    { key: "pitchRise", label: "Rise per 12", default: 6, min: 0, max: 24, step: 0.5, group: "Pitch", showIf: { key: "pitchMode", values: ["ratio"] } },
    { key: "rafterSpacing", label: "Rafter spacing", dim: "length_s", default: 600, min: 100, step: 50, group: "Framing" },
    { key: "covering", label: "Covering", type: "select", default: "shingle", group: "Covering", options: [
      { value: "shingle", label: "Asphalt shingles (3 bundles / 9.29 m²)" },
      { value: "tile", label: "Concrete tiles (10 / m²)" },
      { value: "metal", label: "Metal sheets (0.9 m cover × 3 m)" },
    ] },
    { key: "waste", label: "Waste allowance", dim: "percent", default: 10, min: 0, max: 30, step: 1, group: "Covering" },
  ],
  compute: (v) => {
    const span = +v.span, len = +v.length, oh = +v.overhang / 1000, goh = +v.gableOH / 1000;
    const angle = v.pitchMode === "deg" ? +v.pitchDeg : (Math.atan(+v.pitchRise / 12) * 180) / Math.PI;
    const rad = (angle * Math.PI) / 180;
    const run = span / 2 + oh;
    const rise = (span / 2) * Math.tan(rad);
    const rafter = run / Math.cos(rad);
    const slopeLen = len + 2 * goh;
    const area = 2 * rafter * slopeLen;
    const planArea = (span + 2 * oh) * slopeLen;
    const nRafters = 2 * (Math.floor(slopeLen / (+v.rafterSpacing / 1000)) + 1);
    const w = 1 + +v.waste / 100;
    let covLabel = "", cov = 0;
    if (v.covering === "shingle") { covLabel = "Shingle bundles"; cov = Math.ceil((area * w) / 9.29 * 3); }
    else if (v.covering === "tile") { covLabel = "Roof tiles"; cov = Math.ceil(area * w * 10); }
    else { covLabel = "Metal sheets (0.9 × 3 m)"; cov = Math.ceil((area * w) / 2.7); }
    const warnings: string[] = [];
    if (angle < 15 && v.covering !== "metal") warnings.push("Pitch below 15° — shingles and tiles need a low-slope underlay or a different covering.");
    return {
      warnings,
      outputs: [
        { key: "rafter", label: "Rafter length (incl. overhang)", value: rafter, dim: "length", primary: true },
        { key: "area", label: "Roof surface area", value: area, dim: "area", primary: true },
        { key: "cov", label: covLabel, value: cov, dim: "count", primary: true, note: `incl. ${v.waste}% waste` },
        { key: "angle", label: "Pitch angle", value: angle, dim: "angle", group: "Geometry" },
        { key: "ratio", label: "Rise per 12", value: 12 * Math.tan(rad), precision: 2, group: "Geometry" },
        { key: "rise", label: "Ridge height above plate", value: rise, dim: "length", group: "Geometry" },
        { key: "factor", label: "Slope factor", value: 1 / Math.cos(rad), precision: 3, group: "Geometry" },
        { key: "planArea", label: "Plan area (incl. overhang)", value: planArea, dim: "area", group: "Geometry" },
        { key: "nRafters", label: "Rafters (both sides)", value: nRafters, dim: "count", group: "Framing" },
        { key: "rafterM", label: "Total rafter length", value: nRafters * rafter, dim: "length", group: "Framing" },
        { key: "ridge", label: "Ridge length", value: slopeLen, dim: "length", group: "Framing" },
        { key: "underlay", label: "Underlay rolls (30 m²)", value: Math.ceil((area * 1.15) / 30), dim: "count", group: "Framing" },
      ],
    };
  },
  formulas: ["Rafter = run / cos(θ)", "Rise = (span/2)·tan(θ)", "Area = 2 × rafter × ridge length", "θ = atan(rise/12)"],
};
