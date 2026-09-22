import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "Crisis Hub is an independent, non-partisan reference on humanitarian crises: what is happening, who is doing credible work on the ground, and how to help.",
};

export default function AboutPage() {
  return (
    <div className="max-w-[720px]">
      <header className="mb-12">
        <h1 className="font-sans font-bold text-[clamp(32px,5vw,44px)] text-text-bright tracking-tight leading-tight mb-3">About Crisis Hub</h1>
        <p className="font-sans text-lg text-text-muted leading-relaxed max-w-[680px]">
          An independent, non-partisan reference on the world&apos;s humanitarian
          crises, maintained as a public resource.
        </p>
      </header>

      <section className="mb-12">
        <h2 className="font-sans font-semibold text-xl text-text-bright mb-4">What Crisis Hub is</h2>
        <p className="font-sans text-base leading-[1.8] text-text-body mb-4">
          Crisis Hub documents 52 humanitarian crises in a consistent format.
          Each entry states what is happening, gives sourced statistics and
          background, and lists three ways to respond: organizations you can
          support, ways to raise awareness, and steps to press for policy change.
        </p>
        <p className="font-sans text-base leading-[1.8] text-text-body mb-4">
          The site exists because attention moves on faster than crises do.
          Coverage of Sudan, the Democratic Republic of the Congo, or Myanmar is
          intermittent, and the information people need in order to act is
          scattered across dozens of agencies. Crisis Hub keeps it in one place
          and keeps it current.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="font-sans font-semibold text-xl text-text-bright mb-4">Editorial policy</h2>
        <p className="font-sans text-base leading-[1.8] text-text-body mb-4">
          <strong className="font-semibold text-text-bright">Selection.</strong>{" "}
          A crisis is included when it affects a large population, is documented
          by at least one UN agency or major international humanitarian
          organization, and receives limited sustained coverage relative to its
          scale. Inclusion is not a political statement.
        </p>
        <p className="font-sans text-base leading-[1.8] text-text-body mb-4">
          <strong className="font-semibold text-text-bright">Sourcing.</strong>{" "}
          Statistics are drawn from UN OCHA, UNHCR, WFP, IPC, WHO, IOM, and
          established human-rights organizations, and each figure carries its
          source and reference date. Where sources disagree, the more
          conservative figure is used.
        </p>
        <p className="font-sans text-base leading-[1.8] text-text-body mb-4">
          <strong className="font-semibold text-text-bright">Review.</strong>{" "}
          Headlines and core indicators are refreshed automatically each night
          from UN data services. Narrative summaries and organization listings
          are reviewed by hand; each page shows the date of its last review.
        </p>
        <p className="font-sans text-base leading-[1.8] text-text-body mb-4">
          <strong className="font-semibold text-text-bright">Corrections.</strong>{" "}
          Errors are corrected as soon as they are verified. To report one, see
          the <Link href="/contact" className="underline text-text-bright">contact page</Link>.
        </p>
        <p className="font-sans text-base leading-[1.8] text-text-body mb-4">
          Full details are on the{" "}
          <Link href="/methodology" className="underline text-text-bright">methodology page</Link>.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="font-sans font-semibold text-xl text-text-bright mb-4">Independence and funding</h2>
        <p className="font-sans text-base leading-[1.8] text-text-body mb-4">
          Crisis Hub is not affiliated with any government, political party,
          or fundraising organization. It receives no funding and displays no
          advertising. Donation links go directly to the listed organizations;
          the site does not handle money.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="font-sans font-semibold text-xl text-text-bright mb-4">What Crisis Hub is not</h2>
        <ul className="list-disc pl-5 space-y-2 font-sans text-base leading-relaxed text-text-body">
          <li>Not a news outlet. It is a reference that stays useful after the news cycle moves on.</li>
          <li>Not politically aligned. Its only commitment is to the people affected.</li>
          <li>Not a charity or fundraising platform. It points to vetted organizations and stops there.</li>
        </ul>
      </section>

      <section className="mb-8 pt-8 border-t border-border-hard">
        <h2 className="font-sans font-semibold text-xl text-text-bright mb-4">Who maintains it</h2>
        <p className="font-sans text-base leading-[1.8] text-text-body mb-4">
          Crisis Hub was created and is maintained by Arman Chaudhury. The
          project is open source; the code and data are public on{" "}
          <a href="https://github.com/Arman-Chaudhury/HumanitarianCrisisHub" className="underline text-text-bright" target="_blank" rel="noopener noreferrer">GitHub</a>.
        </p>
      </section>
    </div>
  );
}
