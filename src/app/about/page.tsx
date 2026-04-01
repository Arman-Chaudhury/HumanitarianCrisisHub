import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "Crisis Hub is a student-built, open-source resource hub documenting global humanitarian crises with actionable ways to help.",
};

export default function AboutPage() {
  return (
    <>
      <header className="mb-12 animate-fade-up">
        <h1 className="font-display text-[clamp(48px,10vw,90px)] text-text-bright tracking-[0.05em] leading-[0.92] mb-3">
          ABOUT
        </h1>
        <p className="font-serif italic text-base text-text-muted">
          Why this exists and who built it
        </p>
      </header>

      <section className="mb-12 animate-fade-up-1">
        <h2 className="font-display text-3xl text-text-muted tracking-[0.08em] mb-5">
          THE MISSION
        </h2>
        <div className="max-w-[680px] space-y-4">
          <p className="font-sans text-base font-light leading-[1.8] text-text-body">
            Crisis Hub exists because people want to help but don&apos;t know
            where to start. Mainstream media coverage of humanitarian crises is
            inconsistent — Sudan, Congo, and Myanmar rarely trend. Donation
            links, political action steps, and educational context are scattered
            across dozens of sites.
          </p>
          <p className="font-sans text-base font-light leading-[1.8] text-text-body">
            This site brings it all together. One website. Every crisis. Three
            actions:{" "}
            <strong className="text-text-bright font-medium">Donate</strong>,{" "}
            <strong className="text-text-bright font-medium">Spread Awareness</strong>,
            and{" "}
            <strong className="text-text-bright font-medium">Demand Change</strong>.
            Always current. Always honest.
          </p>
        </div>
      </section>

      <section className="mb-12 animate-fade-up-2">
        <h2 className="font-display text-3xl text-text-muted tracking-[0.08em] mb-5">
          WHAT THIS IS NOT
        </h2>
        <div className="max-w-[680px] space-y-4">
          <p className="font-sans text-base font-light leading-[1.8] text-text-body">
            <strong className="text-text-bright font-medium">Not a news site</strong> —
            it&apos;s a resource hub that stays useful even when the news cycle moves on.
          </p>
          <p className="font-sans text-base font-light leading-[1.8] text-text-body">
            <strong className="text-text-bright font-medium">Not politically aligned</strong> —
            it&apos;s pro-human-rights, not pro-any-party.
          </p>
          <p className="font-sans text-base font-light leading-[1.8] text-text-body">
            <strong className="text-text-bright font-medium">Not a fundraising platform</strong> —
            it links to vetted organizations but doesn&apos;t handle money directly.
          </p>
        </div>
      </section>

      <section className="mb-12 pt-9 border-t-2 border-text-bright animate-fade-up-3">
        <h2 className="font-display text-3xl text-text-muted tracking-[0.08em] mb-5">
          OUR PRINCIPLES
        </h2>
        <div className="max-w-[680px] space-y-6">
          {[
            { title: "Cite everything", desc: "Every statistic, every claim is linked to a reputable source — UNHCR, WHO, ICRC, Reuters, AP, and more." },
            { title: "Never sensationalize", desc: "The facts are devastating enough. We state them plainly and let them speak for themselves." },
            { title: "Center affected voices", desc: "We prioritize journalists, activists, and organizations from the affected regions — not just Western NGOs." },
            { title: "Acknowledge complexity", desc: "We don't oversimplify conflicts into good/evil narratives. Context is essential for meaningful action." },
            { title: "Vet every organization", desc: "Before we list a donation link, we research using Charity Navigator, GiveWell, and direct investigation." },
            { title: "Stay current", desc: "A stale donation link is worse than none. Every page has a 'Last Updated' timestamp." },
          ].map((p, i) => (
            <div key={i} className="flex gap-5 items-baseline">
              <div className="font-display text-[28px] text-crisis-red tracking-wide leading-none min-w-[36px] opacity-70">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div>
                <h3 className="font-serif text-lg text-text-bright mb-1">{p.title}</h3>
                <p className="font-sans text-sm text-text-body leading-relaxed">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8 animate-fade-up-4">
        <h2 className="font-display text-3xl text-text-muted tracking-[0.08em] mb-5">
          WHO BUILT THIS
        </h2>
        <p className="font-sans text-base font-light leading-[1.8] text-text-body max-w-[680px]">
          Crisis Hub was created by Arman Chaudhury — a student who believes that
          access to clear, honest information and actionable pathways is the first
          step toward meaningful solidarity. This is a student-built project.
          It&apos;s open source, independent, and receives no funding from any
          political organization or government.
        </p>
      </section>
    </>
  );
}
