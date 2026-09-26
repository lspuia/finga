import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CALCULATORS, getCalculator } from "@/lib/calc/defs";
import { CalculatorClient } from "@/components/CalculatorClient";

export function generateStaticParams() {
  return CALCULATORS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = getCalculator(slug);
  return c ? { title: c.name, description: c.description } : {};
}

export default async function CalculatorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!getCalculator(slug)) notFound();
  return <CalculatorClient slug={slug} />;
}
