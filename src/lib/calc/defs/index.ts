import type { CalculatorDef, Category } from "../types";
import { beam } from "./beam";
import { column } from "./column";
import { section } from "./section";
import { loads } from "./loads";
import { footing } from "./footing";
import { retaining } from "./retaining";
import { timber } from "./timber";
import { concrete } from "./concrete";
import { rebar } from "./rebar";
import { masonry } from "./masonry";
import { plaster } from "./plaster";
import { paint } from "./paint";
import { tile } from "./tile";
import { drywall } from "./drywall";
import { roofing } from "./roofing";
import { stairs } from "./stairs";
import { earthwork } from "./earthwork";
import { asphalt } from "./asphalt";
import { slope } from "./slope";
import { converter } from "./converter";
import { cost } from "./cost";

export const CALCULATORS: CalculatorDef[] = [
  beam, column, section, loads, footing, retaining, timber,
  concrete, rebar, masonry, plaster,
  paint, tile, drywall, roofing, stairs,
  earthwork, asphalt, slope,
  converter, cost,
];

export const CATEGORIES: { name: Category; blurb: string }[] = [
  { name: "Structural", blurb: "Beams, columns, footings and loads. The numbers that hold everything up." },
  { name: "Concrete & Masonry", blurb: "Pours, bars, bricks and mortar. Order exactly what the site needs." },
  { name: "Finishes", blurb: "Paint, tile, board, roofing and stairs. Quantities for the last mile." },
  { name: "Site & Civil", blurb: "Earth, asphalt and gradients. Before and beneath the building." },
  { name: "Planning & Tools", blurb: "Units and money. The glue between every other calculation." },
];

export function getCalculator(slug: string) {
  return CALCULATORS.find((c) => c.slug === slug);
}

export function byCategory(cat: Category) {
  return CALCULATORS.filter((c) => c.category === cat);
}
