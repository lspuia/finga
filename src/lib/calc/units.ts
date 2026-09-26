import type { Dim, UnitSystem } from "./types";

type UnitSpec = { metric: string; imperial: string; factor: number }; // imperial = metric * factor

export const UNITS: Record<Dim, UnitSpec> = {
  none:     { metric: "",      imperial: "",       factor: 1 },
  length:   { metric: "m",     imperial: "ft",     factor: 3.280839895 },
  length_s: { metric: "mm",    imperial: "in",     factor: 1 / 25.4 },
  area:     { metric: "m²",    imperial: "ft²",    factor: 10.7639104 },
  volume:   { metric: "m³",    imperial: "yd³",    factor: 1.30795062 },
  force:    { metric: "kN",    imperial: "kip",    factor: 0.224808943 },
  lineload: { metric: "kN/m",  imperial: "kip/ft", factor: 0.0685217659 },
  pressure: { metric: "kPa",   imperial: "psf",    factor: 20.8854342 },
  stress:   { metric: "MPa",   imperial: "ksi",    factor: 0.145037738 },
  mass:     { metric: "kg",    imperial: "lb",     factor: 2.20462262 },
  density:  { metric: "kg/m³", imperial: "lb/ft³", factor: 0.0624279606 },
  moment:   { metric: "kN·m",  imperial: "kip·ft", factor: 0.737562149 },
  inertia:  { metric: "cm⁴",   imperial: "in⁴",    factor: 0.0240251 },
  modulus:  { metric: "cm³",   imperial: "in³",    factor: 0.0610237 },
  area_s:   { metric: "cm²",   imperial: "in²",    factor: 0.15500031 },
  angle:    { metric: "°",     imperial: "°",      factor: 1 },
  percent:  { metric: "%",     imperial: "%",      factor: 1 },
  count:    { metric: "",      imperial: "",       factor: 1 },
  currency: { metric: "$",     imperial: "$",      factor: 1 },
  liquid:   { metric: "L",     imperial: "gal",    factor: 0.264172052 },
};

export function unitLabel(dim: Dim | undefined, system: UnitSystem): string {
  if (!dim) return "";
  return UNITS[dim][system];
}

/** SI -> display */
export function toDisplay(value: number, dim: Dim | undefined, system: UnitSystem): number {
  if (!dim || system === "metric") return value;
  return value * UNITS[dim].factor;
}

/** display -> SI */
export function fromDisplay(value: number, dim: Dim | undefined, system: UnitSystem): number {
  if (!dim || system === "metric") return value;
  return value / UNITS[dim].factor;
}

/** sensible step size in display units */
export function displayStep(dim: Dim | undefined, system: UnitSystem, step?: number): number {
  if (step) return system === "metric" || !dim ? step : +(step * UNITS[dim].factor).toPrecision(1);
  return 1;
}
