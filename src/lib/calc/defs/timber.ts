import type { CalculatorDef } from "../types";

export const timber: CalculatorDef = {
  slug: "timber-joist",
  name: "Timber Joist",
  tagline: "Span check for floor joists by bending, shear and deflection.",
  category: "Structural",
  description: "Check a sawn timber floor joist for bending, shear and deflection under uniform floor loading, and report the maximum allowable span.",
  inputs: [
    { key: "b", label: "Joist breadth", dim: "length_s", default: 47, min: 10, step: 1, group: "Section" },
    { key: "h", label: "Joist depth", dim: "length_s", default: 195, min: 20, step: 5, group: "Section" },
    { key: "spacing", label: "Joist spacing", dim: "length_s", default: 400, min: 100, step: 50, group: "Section" },
    { key: "span", label: "Clear span", dim: "length", default: 3.6, min: 0.1, step: 0.1, group: "Loading" },
    { key: "DL", label: "Dead load", dim: "pressure", default: 0.75, min: 0, step: 0.05, group: "Loading" },
    { key: "LL", label: "Live load", dim: "pressure", default: 1.5, min: 0, step: 0.1, group: "Loading" },
    { key: "grade", label: "Strength class", type: "select", default: "C24", group: "Material", options: [
      { value: "C16", label: "C16  (fm 16 MPa, E 8 000)" },
      { value: "C24", label: "C24  (fm 24 MPa, E 11 000)" },
      { value: "D40", label: "D40 hardwood  (fm 40 MPa, E 13 000)" },
      { value: "SPF2", label: "SPF No.2  (fm ≈ 8.6 MPa, E 9 500)" },
    ] },
    { key: "kmod", label: "Duration / moisture factor kmod", default: 0.8, min: 0.5, max: 1.1, step: 0.05, group: "Material" },
  ],
  compute: (v) => {
    const props: Record<string, { fm: number; fv: number; E: number }> = {
      C16: { fm: 16, fv: 3.2, E: 8000 }, C24: { fm: 24, fv: 4.0, E: 11000 }, D40: { fm: 40, fv: 4.0, E: 13000 }, SPF2: { fm: 8.6, fv: 1.0, E: 9500 },
    };
    const p = props[String(v.grade)];
    const b = +v.b, h = +v.h, s = +v.spacing / 1000, L = +v.span;
    const gammaM = 1.3, kmod = +v.kmod;
    const fmd = (p.fm * kmod) / gammaM, fvd = (p.fv * kmod) / gammaM;
    const selfW = (b * h / 1e6) * 4.2 ; // kN/m at 420 kg/m³
    const wService = (+v.DL + +v.LL) * s + selfW;
    const wUlt = (1.35 * +v.DL + 1.5 * +v.LL) * s + 1.35 * selfW;
    const M = (wUlt * L * L) / 8, V = (wUlt * L) / 2;
    const Z = (b * h * h) / 6, A = b * h, I = (b * h ** 3) / 12;
    const sigma = (M * 1e6) / Z, tau = (1.5 * V * 1e3) / A;
    // w in kN/m ≡ N/mm, L in m → mm, E in N/mm², I in mm⁴  ⇒ δ in mm
    const deltaMm = (5 * wService * L ** 4 * 1e12) / (384 * p.E * I);
    const limit = Math.min(L * 1000 / 250, 14);
    const uBend = sigma / fmd, uShear = tau / fvd, uDef = deltaMm / limit;
    // allowable span: solve each criterion
    const LmBend = Math.sqrt((8 * fmd * Z) / (wUlt * 1e6));
    const LmDef = Math.pow((384 * p.E * I * (1 / 250)) / (5 * wService * 1e9), 1 / 3);
    const Lmax = Math.min(LmBend, LmDef);
    const warnings: string[] = [];
    if (uBend > 1) warnings.push(`Bending utilisation ${(uBend * 100).toFixed(0)}% — increase depth or reduce spacing.`);
    if (uShear > 1) warnings.push(`Shear utilisation ${(uShear * 100).toFixed(0)}%.`);
    if (uDef > 1) warnings.push(`Deflection ${deltaMm.toFixed(1)} mm exceeds limit ${limit.toFixed(1)} mm.`);
    return {
      warnings,
      outputs: [
        { key: "util", label: "Governing utilisation", value: Math.max(uBend, uShear, uDef) * 100, dim: "percent", primary: true, note: uDef >= uBend && uDef >= uShear ? "deflection governs" : uBend >= uShear ? "bending governs" : "shear governs" },
        { key: "Lmax", label: "Max allowable span", value: Lmax, dim: "length", primary: true },
        { key: "delta", label: "Deflection", value: deltaMm, dim: "length_s", primary: true, note: `limit ${limit.toFixed(1)} mm` },
        { key: "M", label: "Design moment", value: M, dim: "moment", group: "Demands" },
        { key: "V", label: "Design shear", value: V, dim: "force", group: "Demands" },
        { key: "wUlt", label: "Factored line load", value: wUlt, dim: "lineload", group: "Demands" },
        { key: "sigma", label: "Bending stress", value: sigma, dim: "stress", group: "Stresses", note: `vs ${fmd.toFixed(1)} MPa` },
        { key: "tau", label: "Shear stress", value: tau, dim: "stress", group: "Stresses", note: `vs ${fvd.toFixed(2)} MPa` },
        { key: "uB", label: "Bending utilisation", value: uBend * 100, dim: "percent", group: "Stresses" },
        { key: "uS", label: "Shear utilisation", value: uShear * 100, dim: "percent", group: "Stresses" },
      ],
    };
  },
  formulas: ["σ = M / Z,  Z = bh²/6", "τ = 1.5V / A", "δ = 5wL⁴ / 384EI ≤ L/250 (≤ 14 mm)", "Design strengths = f·kmod / γM"],
  notes: ["Eurocode 5 style checks with γM = 1.3. Timber self-weight assumed 420 kg/m³."],
};
