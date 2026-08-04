"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/", label: "Crises" },
  { href: "/take-action", label: "Take Action" },
  { href: "/resources", label: "Resources" },
  { href: "/about", label: "About" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-[50] flex items-center justify-between pb-5 pt-3 -mt-3 mb-10 border-b-2 border-text-bright bg-bg/80 backdrop-blur-md animate-fade-up">
      <Link href="/" className="font-serif text-2xl text-text-bright tracking-tight">
        <em className="text-crisis-red italic">Crisis</em> Hub
      </Link>
      <div className="flex gap-4 sm:gap-7">
        {NAV_LINKS.map((link) => {
          const isActive =
            link.href === "/"
              ? pathname === "/" || pathname.startsWith("/crises")
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`font-sans text-[11px] sm:text-xs font-medium tracking-widest uppercase transition-colors duration-200 ${
                isActive
                  ? "text-text-bright"
                  : "text-text-dim hover:text-text-muted"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
