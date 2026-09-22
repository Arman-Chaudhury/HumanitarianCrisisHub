import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Methodology and sources",
  description:
    "How Crisis Hub selects crises, sources its statistics, refreshes data from UN services, vets organizations, and licenses photography.",
};

export default function MethodologyPage() {
  return (
    <div className="max-w-[720px]">
      <header className="mb-12">
        <h1 className="font-sans font-bold text-[clamp(32px,5vw,44px)] text-text-bright tracking-tight leading-tight mb-3">Methodology and sources</h1>
        <p className="font-sans text-lg text-text-muted leading-relaxed max-w-[680px]">
          How the information on this site is gathered, checked, and kept current.
        </p>
      </header>

      <section className="mb-12">
        <h2 className="font-sans font-semibold text-xl text-text-bright mb-4">Crisis selection</h2>
        <p className="font-sans text-base leading-[1.8] text-text-body mb-4">
          Each entry meets three tests: a large affected population, documentation
          by at least one UN agency or major international humanitarian
          organization, and limited sustained public attention relative to its
          scale. Entries are classified as escalating, active, or underreported
          based on the trajectory described in the most recent UN situation
          reporting.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="font-sans font-semibold text-xl text-text-bright mb-4">Statistics</h2>
        <p className="font-sans text-base leading-[1.8] text-text-body mb-4">
          Every curated statistic on a crisis page names its source and reference
          period. Primary sources, in order of preference: UN OCHA humanitarian
          needs overviews and situation reports, UNHCR and IOM displacement data,
          the Integrated Food Security Phase Classification (IPC), WHO, UNICEF,
          and the reports of Human Rights Watch and Amnesty International.
          Where sources differ, the more conservative figure is shown.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="font-sans font-semibold text-xl text-text-bright mb-4">Automated data</h2>
        <p className="font-sans text-base leading-[1.8] text-text-body mb-4">
          Two datasets are refreshed automatically every night and committed to
          the public repository, so the site is updated without manual editing:
        </p>
        <ul className="list-disc pl-5 space-y-2 font-sans text-base leading-relaxed text-text-body mb-4">
          <li>
            <strong className="font-semibold text-text-bright">Latest updates</strong>: the three most
            recent reports per crisis from UN OCHA&apos;s ReliefWeb, with a news
            fallback when ReliefWeb is unavailable.
          </li>
          <li>
            <strong className="font-semibold text-text-bright">Live indicators</strong>: people in need,
            internally displaced persons, and IPC Phase 3+ food insecurity for
            each country covered by a UN response plan, from OCHA&apos;s
            Humanitarian API on the Humanitarian Data Exchange (HDX). Each value
            shows its reference month.
          </li>
        </ul>
        <p className="font-sans text-base leading-[1.8] text-text-body mb-4">
          Automated figures are shown alongside, never in place of, the curated
          statistics. Countries without a UN response plan have no live
          indicators, and the section is omitted for them.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="font-sans font-semibold text-xl text-text-bright mb-4">Vetting organizations</h2>
        <p className="font-sans text-base leading-[1.8] text-text-body mb-4">
          Before an organization is listed, its financial transparency and
          program record are checked through Charity Navigator, GiveWell, its own
          published audits, and its operational presence in the affected region.
          Preference is given to organizations working directly on the ground,
          including local and national organizations.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="font-sans font-semibold text-xl text-text-bright mb-4">Photography</h2>
        <p className="font-sans text-base leading-[1.8] text-text-body mb-4">
          Photographs are selected to show the people affected by each crisis
          rather than the place. All images are sourced from Wikimedia Commons
          under open licenses, and every image carries its photographer and
          license credit where it appears.
        </p>
      </section>

      <section className="mb-8 pt-8 border-t border-border-hard">
        <h2 className="font-sans font-semibold text-xl text-text-bright mb-4">Limitations</h2>
        <p className="font-sans text-base leading-[1.8] text-text-body mb-4">
          Humanitarian data is estimated under difficult conditions and revised
          often. Figures should be read as the best available estimate at the
          stated date, not as exact counts. If you find an error, please use the{" "}
          <Link href="/contact" className="underline text-text-bright">contact page</Link>.
        </p>
      </section>
    </div>
  );
}
