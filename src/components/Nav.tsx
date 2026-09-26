"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UnitToggle } from "./UnitToggle";

const links = [
  { href: "/calculators", label: "Calculators" },
  { href: "/saved", label: "Saved" },
];

export function Nav() {
  const path = usePathname();
  return (
    <nav className="nav-blur fixed inset-x-0 top-0 z-50 border-b border-line">
      <div className="mx-auto flex h-12 max-w-[1024px] items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2 text-[15px] font-semibold tracking-tight">
          <span className="inline-block h-[14px] w-[14px] rounded-[4px] bg-fg" aria-hidden />
          Space Between Worlds
        </Link>
        <div className="flex items-center gap-6">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`hidden text-[13px] transition-colors sm:block ${path.startsWith(l.href) ? "text-fg" : "text-fg-2 hover:text-fg"}`}
            >
              {l.label}
            </Link>
          ))}
          <UnitToggle />
        </div>
      </div>
    </nav>
  );
}
