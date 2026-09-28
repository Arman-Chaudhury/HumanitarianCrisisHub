"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/", label: "Crises" },
  { href: "/take-action", label: "Take action" },
  { href: "/resources", label: "Resources" },
  { href: "/methodology", label: "Methodology", desktopOnly: true },
  { href: "/about", label: "About" },
];

/** Typographic wordmark: a small mark plus the name in the body typeface. */
export function Wordmark({ muted = false }: { muted?: boolean }) {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2.5"
      aria-label="Crisis Hub home"
    >
      <svg width="22" height="22" viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="32" r="30" className="fill-text-bright" />
        <circle cx="41" cy="24" r="8" className="fill-institution-accent" />
      </svg>
      <span
        className={`font-sans font-bold text-[17px] tracking-tight whitespace-nowrap ${muted ? "text-text-muted" : "text-text-bright"}`}
      >
        Crisis Hub
      </span>
    </Link>
  );
}

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col items-start justify-between gap-3 py-3 sm:flex-row sm:items-center sm:gap-4">
      <Wordmark />
      <div className="flex flex-wrap justify-start sm:justify-end gap-x-4 gap-y-1 sm:gap-x-6 min-w-0">
        {NAV_LINKS.map((link) => {
          const isActive =
            link.href === "/"
              ? pathname === "/" || pathname.startsWith("/crises")
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`font-sans text-sm whitespace-nowrap transition-colors ${
                link.desktopOnly ? "hidden sm:inline" : ""
              } ${
                isActive
                  ? "text-text-bright font-semibold"
                  : "text-text-muted hover:text-text-bright"
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
