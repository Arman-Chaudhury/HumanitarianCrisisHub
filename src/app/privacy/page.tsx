import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Crisis Hub collects no personal data, sets no cookies, and uses no analytics or advertising.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-[720px]">
      <header className="mb-12">
        <h1 className="font-sans font-bold text-[clamp(32px,5vw,44px)] text-text-bright tracking-tight leading-tight mb-3">Privacy</h1>
        <p className="font-sans text-lg text-text-muted leading-relaxed max-w-[680px]">Crisis Hub is designed to collect nothing about you.</p>
      </header>

      <section className="mb-12">
        <h2 className="font-sans font-semibold text-xl text-text-bright mb-4">What is collected</h2>
        <p className="font-sans text-base leading-[1.8] text-text-body mb-4">
          Nothing. The site sets no cookies, runs no analytics, serves no
          advertising, and has no accounts, forms, or tracking pixels. It is a
          set of static pages.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="font-sans font-semibold text-xl text-text-bright mb-4">Third parties</h2>
        <p className="font-sans text-base leading-[1.8] text-text-body mb-4">
          Pages load one typeface from Google Fonts, and the site is served by
          Vercel; each may log standard technical request data (such as IP
          address and browser type) under its own privacy policy. Links to
          external organizations lead to sites with their own policies.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-sans font-semibold text-xl text-text-bright mb-4">Changes</h2>
        <p className="font-sans text-base leading-[1.8] text-text-body mb-4">
          If any of this changes, this page will be updated first. Last
          reviewed September 2026.
        </p>
      </section>
    </div>
  );
}
