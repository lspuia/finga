import Link from "next/link";
export default function NotFound() {
  return (
    <div className="mx-auto max-w-[1024px] px-5 py-32 text-center">
      <h1 className="display text-[48px]">Nothing here.</h1>
      <p className="mt-3 text-[19px] text-fg-2">That page doesn’t exist, or the calculator has moved.</p>
      <Link href="/calculators" className="btn btn-primary mt-8">All calculators</Link>
    </div>
  );
}
