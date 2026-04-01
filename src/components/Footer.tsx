import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/", label: "Crises" },
  { href: "/take-action", label: "Take Action" },
  { href: "/resources", label: "Resources" },
  { href: "/about", label: "About" },
];

export default function Footer() {
  return (
    <footer className="mt-16 pt-6 border-t-2 border-text-bright animate-fade-up-7">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <Link href="/" className="font-serif text-lg text-text-dim">
          <em className="text-crisis-red italic">Crisis</em> Hub
        </Link>
        <div className="flex gap-5">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-sans text-xs text-text-faint tracking-wider uppercase hover:text-text-muted transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
      <p className="mt-3 font-sans text-xs text-text-faint leading-relaxed">
        Always verify organizations before donating. This is a student-built
        resource hub, not a news outlet. The most powerful thing you can do is
        start — and then keep going.
      </p>
    </footer>
  );
}
