export type Dim =
  | "none"
  | "length"       // m | ft
  | "length_s"     // mm | in
  | "area"         // m² | ft²
  | "volume"       // m³ | yd³
  | "force"        // kN | kip
  | "lineload"     // kN/m | kip/ft
  | "pressure"     // kPa | psf
  | "stress"       // MPa | ksi
  | "mass"         // kg | lb
  | "density"      // kg/m³ | lb/ft³
  | "moment"       // kN·m | kip·ft
  | "inertia"      // cm⁴ | in⁴
  | "modulus"      // cm³ | in³
  | "area_s"       // cm² | in²
  | "angle"        // °
  | "percent"      // %
  | "count"        // pcs
  | "currency"     // $
  | "liquid";      // L | gal

export type UnitSystem = "metric" | "imperial";

export type SelectOption = { value: string; label: string };

export type InputField = {
  key: string;
  label: string;
  dim?: Dim;
  /** default in SI (metric) units */
  default: number | string;
  min?: number;
  max?: number;
  step?: number;
  help?: string;
  type?: "number" | "select";
  options?: SelectOption[];
  group?: string;
  /** hide this input unless another input has a given value */
  showIf?: { key: string; values: string[] };
};

export type OutputValue = {
  key: string;
  label: string;
  value: number | string;
  dim?: Dim;
  precision?: number;
  primary?: boolean;
  note?: string;
  group?: string;
};

export type CalcResult = {
  outputs: OutputValue[];
  warnings?: string[];
  ok?: boolean;
};

export type Category =
  | "Structural"
  | "Concrete & Masonry"
  | "Finishes"
  | "Site & Civil"
  | "Planning & Tools";

export type CalculatorDef = {
  slug: string;
  name: string;
  tagline: string;
  category: Category;
  description: string;
  inputs: InputField[];
  compute: (v: Record<string, number | string>) => CalcResult;
  formulas?: string[];
  notes?: string[];
  /** key of an optional diagram component */
  diagram?: string;
};

export type Values = Record<string, number | string>;
