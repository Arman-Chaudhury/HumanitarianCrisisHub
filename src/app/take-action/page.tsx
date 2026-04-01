import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Take Action",
  description:
    "Find your representatives, use call scripts and letter templates, and get shareable kits to demand change on humanitarian crises.",
};

export default function TakeActionPage() {
  return (
    <>
      <header className="mb-12 animate-fade-up">
        <h1 className="font-display text-[clamp(48px,10vw,90px)] text-text-bright tracking-[0.05em] leading-[0.92] mb-3">
          TAKE ACTION
        </h1>
        <p className="font-serif italic text-base text-text-muted">
          Tools to turn your concern into political pressure
        </p>
      </header>

      {/* Find Your Reps */}
      <section className="mb-12 animate-fade-up-1">
        <h2 className="font-display text-3xl text-text-muted tracking-[0.08em] mb-5">
          FIND YOUR REPRESENTATIVES
        </h2>
        <p className="font-sans text-base font-light leading-[1.8] text-text-body max-w-[680px] mb-6">
          Your elected officials work for you. A single phone call to a
          congressional office takes 2 minutes and is one of the most effective
          forms of political action. Offices track call volume — when enough
          people call about an issue, it gets attention.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <a
            href="https://www.house.gov/representatives/find-your-representative"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-5 border border-border rounded-lg bg-bg-card transition-all duration-300 hover:bg-bg-card-hover hover:border-border-hard"
          >
            <h3 className="font-serif text-lg text-text-bright mb-1">
              Find Your House Rep
            </h3>
            <p className="font-sans text-sm text-text-muted leading-relaxed">
              Look up your U.S. House Representative by ZIP code on house.gov
            </p>
          </a>
          <a
            href="https://www.senate.gov/senators/senators-contact.htm"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-5 border border-border rounded-lg bg-bg-card transition-all duration-300 hover:bg-bg-card-hover hover:border-border-hard"
          >
            <h3 className="font-serif text-lg text-text-bright mb-1">
              Find Your Senators
            </h3>
            <p className="font-sans text-sm text-text-muted leading-relaxed">
              Contact your two U.S. Senators through the official Senate directory
            </p>
          </a>
        </div>
      </section>

      {/* Call Script Template */}
      <section className="mb-12 pt-9 border-t-2 border-text-bright animate-fade-up-2">
        <h2 className="font-display text-3xl text-text-muted tracking-[0.08em] mb-5">
          CALL SCRIPT
        </h2>
        <p className="font-sans text-sm text-text-muted mb-4">
          Adapt this template for any crisis. Calls are more effective than
          emails.
        </p>
        <div className="p-6 border border-border-hard rounded-lg bg-bg-card max-w-[680px]">
          <p className="font-sans text-[15px] leading-[1.8] text-text-body">
            &ldquo;Hi, my name is{" "}
            <span className="text-crisis-red font-medium">[Your Name]</span> and
            I&apos;m a constituent from{" "}
            <span className="text-crisis-red font-medium">[City, State]</span>.
            I&apos;m calling to urge{" "}
            <span className="text-crisis-red font-medium">
              [Representative/Senator Name]
            </span>{" "}
            to{" "}
            <span className="text-crisis-red font-medium">
              [specific ask — e.g., support a ceasefire resolution, increase
              humanitarian funding, support sanctions]
            </span>
            . The humanitarian situation in{" "}
            <span className="text-crisis-red font-medium">[Crisis Region]</span>{" "}
            is dire, and I believe the United States has a responsibility to act.
            Thank you for your time.&rdquo;
          </p>
        </div>
      </section>

      {/* Letter Template */}
      <section className="mb-12 animate-fade-up-3">
        <h2 className="font-display text-3xl text-text-muted tracking-[0.08em] mb-5">
          LETTER TEMPLATE
        </h2>
        <p className="font-sans text-sm text-text-muted mb-4">
          Send this to your senators and representatives via email or postal
          mail.
        </p>
        <div className="p-6 border border-border-hard rounded-lg bg-bg-card max-w-[680px] space-y-4">
          <p className="font-sans text-[15px] leading-[1.8] text-text-body">
            Dear{" "}
            <span className="text-crisis-red font-medium">
              [Representative/Senator Name]
            </span>
            ,
          </p>
          <p className="font-sans text-[15px] leading-[1.8] text-text-body">
            I am writing as your constituent to express my deep concern about the
            humanitarian crisis in{" "}
            <span className="text-crisis-red font-medium">[Region]</span>.{" "}
            <span className="text-crisis-red font-medium">
              [Include 1-2 specific facts about the crisis]
            </span>
            .
          </p>
          <p className="font-sans text-[15px] leading-[1.8] text-text-body">
            I urge you to{" "}
            <span className="text-crisis-red font-medium">
              [specific policy ask]
            </span>
            . The United States has both the influence and the moral obligation
            to act.
          </p>
          <p className="font-sans text-[15px] leading-[1.8] text-text-body">
            Thank you for your attention to this matter. I look forward to your
            response.
          </p>
          <p className="font-sans text-[15px] leading-[1.8] text-text-body">
            Sincerely,
            <br />
            <span className="text-crisis-red font-medium">[Your Name]</span>
            <br />
            <span className="text-crisis-red font-medium">
              [Your Address]
            </span>
          </p>
        </div>
      </section>

      {/* Tips */}
      <section className="mb-8 animate-fade-up-4">
        <h2 className="font-display text-3xl text-text-muted tracking-[0.08em] mb-5">
          TIPS FOR EFFECTIVE ADVOCACY
        </h2>
        <div className="max-w-[680px] space-y-0">
          {[
            "Be specific — ask for a concrete policy action, not just 'do something'",
            "Identify yourself as a constituent — offices prioritize calls from their district",
            "Be concise and polite — the staffer answering is not your opponent",
            "Follow up — one call is good, repeated contact over weeks is better",
            "Bring friends — organize call-in days where multiple people contact the same office",
            "Attend town halls — ask your question on the record, in public",
          ].map((tip, i) => (
            <div
              key={i}
              className={`flex gap-5 items-baseline py-5 px-1 border-b border-border ${
                i === 0 ? "border-t border-border" : ""
              }`}
            >
              <div className="font-display text-[28px] text-crisis-red tracking-wide leading-none min-w-[36px] opacity-70">
                {String(i + 1).padStart(2, "0")}
              </div>
              <p className="font-sans text-[15px] leading-[1.7] text-text-body">
                {tip}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
