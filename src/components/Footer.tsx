import Link from "next/link";
import { Wordmark } from "./Navbar";

const COLUMNS = [
  {
    heading: "Explore",
    links: [
      { href: "/", label: "All crises" },
      { href: "/take-action", label: "Take action" },
      { href: "/resources", label: "Resources" },
    ],
  },
  {
    heading: "About",
    links: [
      { href: "/about", label: "About Crisis Hub" },
      { href: "/methodology", label: "Methodology and sources" },
      { href: "/contact", label: "Contact and corrections" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "https://github.com/Arman-Chaudhury/HumanitarianCrisisHub", label: "Source code (GitHub)" },
    ],
  },
];

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-20 pt-10 border-t border-border-hard">
      <div className="grid grid-cols-1 sm:grid-cols-[1.4fr_1fr_1fr_1fr] gap-8">
        <div>
          <Wordmark />
          <p className="mt-3 font-sans text-sm text-text-muted leading-relaxed max-w-[300px]">
            An independent, non-partisan reference on humanitarian crises and
            how to help. Not affiliated with any government or political
            organization.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.heading}>
            <h4 className="font-sans text-sm font-semibold text-text-bright mb-3">{col.heading}</h4>
            <ul className="space-y-2">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="font-sans text-sm text-text-muted hover:text-text-bright transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-10 pt-5 border-t border-border flex flex-wrap justify-between gap-2">
        <p className="font-sans text-xs text-text-faint">
          © {year} Crisis Hub. Content available for reuse with attribution.
        </p>
        <p className="font-sans text-xs text-text-faint">
          Headlines and indicators refreshed nightly from UN OCHA sources.
        </p>
      </div>
    </footer>
  );
}
