import type { CalculatorDef, OutputValue } from "../types";

const TABLES: Record<string, { base: string; units: [string, number][] }> = {
  length: { base: "m", units: [["mm", 0.001], ["cm", 0.01], ["m", 1], ["km", 1000], ["in", 0.0254], ["ft", 0.3048], ["yd", 0.9144], ["mi", 1609.344]] },
  area: { base: "m²", units: [["mm²", 1e-6], ["cm²", 1e-4], ["m²", 1], ["ha", 1e4], ["in²", 6.4516e-4], ["ft²", 0.09290304], ["yd²", 0.83612736], ["acre", 4046.856]] },
  volume: { base: "m³", units: [["cm³", 1e-6], ["L", 1e-3], ["m³", 1], ["in³", 1.6387e-5], ["ft³", 0.0283168], ["yd³", 0.764555], ["US gal", 3.78541e-3], ["UK gal", 4.54609e-3]] },
  mass: { base: "kg", units: [["g", 1e-3], ["kg", 1], ["t (metric)", 1000], ["oz", 0.0283495], ["lb", 0.453592], ["US ton", 907.185], ["UK ton", 1016.05]] },
  force: { base: "N", units: [["N", 1], ["kN", 1000], ["MN", 1e6], ["kgf", 9.80665], ["tf", 9806.65], ["lbf", 4.44822], ["kip", 4448.22]] },
  pressure: { base: "Pa", units: [["Pa", 1], ["kPa", 1e3], ["MPa", 1e6], ["bar", 1e5], ["psi", 6894.757], ["ksi", 6.894757e6], ["psf", 47.8803], ["kgf/cm²", 98066.5], ["atm", 101325]] },
  moment: { base: "N·m", units: [["N·m", 1], ["kN·m", 1000], ["kgf·m", 9.80665], ["lbf·ft", 1.35582], ["kip·ft", 1355.82], ["lbf·in", 0.112985]] },
  lineload: { base: "N/m", units: [["N/m", 1], ["kN/m", 1000], ["kgf/m", 9.80665], ["lbf/ft", 14.5939], ["kip/ft", 14593.9]] },
  density: { base: "kg/m³", units: [["kg/m³", 1], ["g/cm³", 1000], ["t/m³", 1000], ["lb/ft³", 16.0185], ["lb/in³", 27679.9]] },
  speed: { base: "m/s", units: [["m/s", 1], ["km/h", 1 / 3.6], ["ft/s", 0.3048], ["mph", 0.44704], ["knot", 0.514444]] },
  temperature: { base: "°C", units: [] },
};

export const converter: CalculatorDef = {
  slug: "unit-converter",
  name: "Unit Converter",
  tagline: "Every engineering unit, side by side.",
  category: "Planning & Tools",
  description: "Convert a value into every common unit for its quantity — length, area, volume, mass, force, pressure, moment, density, speed and temperature.",
  inputs: [
    { key: "qty", label: "Quantity", type: "select", default: "pressure", group: "Convert", options: Object.keys(TABLES).map((k) => ({ value: k, label: k[0].toUpperCase() + k.slice(1) })) },
    { key: "value", label: "Value", default: 1, step: 1, group: "Convert" },
    // one "from" select per quantity so the dropdown only ever shows matching units
    ...Object.entries(TABLES).map(([q, t]) => ({
      key: `from_${q}`, label: "From unit", type: "select" as const, group: "Convert",
      default: q === "temperature" ? "°C" : q === "pressure" ? "MPa" : t.units[Math.min(2, t.units.length - 1)][0],
      options: q === "temperature" ? [{ value: "°C", label: "°C" }, { value: "°F", label: "°F" }, { value: "K", label: "K" }] : t.units.map(([u]) => ({ value: u, label: u })),
      showIf: { key: "qty", values: [q] },
    })),
  ],
  compute: (v) => {
    const q = String(v.qty), val = +v.value, from = String(v[`from_${q}`]);
    const warnings: string[] = [];
    if (q === "temperature") {
      let c: number;
      if (from === "°F") c = ((val - 32) * 5) / 9; else if (from === "K") c = val - 273.15; else c = val;
      return { warnings, outputs: [
        { key: "c", label: "Celsius", value: c, precision: 2, primary: true, note: "°C" },
        { key: "f", label: "Fahrenheit", value: (c * 9) / 5 + 32, precision: 2, primary: true, note: "°F" },
        { key: "k", label: "Kelvin", value: c + 273.15, precision: 2, primary: true, note: "K" },
      ] };
    }
    const t = TABLES[q];
    const f = t.units.find(([u]) => u === from) ?? t.units[0];
    const base = val * f[1];
    let shown = 0;
    const outputs: OutputValue[] = t.units.map(([u, k]) => {
      const isInput = u === f[0];
      const primary = !isInput && shown < 3; if (primary) shown++;
      return { key: u, label: u, value: base / k, precision: 4, primary, note: isInput ? "input" : undefined };
    });
    return { warnings, outputs };
  },
  notes: ["Pick the quantity, then the unit you have. Results use exact SI conversion factors."],
};
