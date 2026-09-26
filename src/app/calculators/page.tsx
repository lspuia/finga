import type { Metadata } from "next";
import { CalcLibrary } from "@/components/CalcLibrary";

export const metadata: Metadata = { title: "Calculators", description: "All construction and structural engineering calculators." };

export default function CalculatorsPage() {
  return <CalcLibrary />;
}
