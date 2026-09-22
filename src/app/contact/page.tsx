import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact and corrections",
  description: "How to report an error, suggest a crisis or organization, or reach the maintainer of Crisis Hub.",
};

const REPO = "https://github.com/Arman-Chaudhury/HumanitarianCrisisHub";

export default function ContactPage() {
  return (
    <div className="max-w-[720px]">
      <header className="mb-12">
        <h1 className="font-sans font-bold text-[clamp(32px,5vw,44px)] text-text-bright tracking-tight leading-tight mb-3">Contact and corrections</h1>
        <p className="font-sans text-lg text-text-muted leading-relaxed max-w-[680px]">
          Corrections are the most valuable message this site receives.
        </p>
      </header>

      <section className="mb-12">
        <h2 className="font-sans font-semibold text-xl text-text-bright mb-4">Report an error</h2>
        <p className="font-sans text-base leading-[1.8] text-text-body mb-4">
          If a statistic, source, or organization listing is wrong or out of
          date, open an issue in the public repository with the page address
          and, if possible, a link to a better source. Verified corrections are
          applied promptly and noted in the page&apos;s review date.
        </p>
        <a
          href={`${REPO}/issues/new`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block font-sans text-sm font-semibold text-white bg-gray-900 px-5 py-3 rounded hover:bg-gray-700 transition-colors"
        >
          Open a correction on GitHub
        </a>
      </section>

      <section className="mb-12">
        <h2 className="font-sans font-semibold text-xl text-text-bright mb-4">Suggest a crisis or organization</h2>
        <p className="font-sans text-base leading-[1.8] text-text-body mb-4">
          Suggestions are welcome through the same channel. Please include the
          UN or humanitarian-agency reporting that documents the crisis, or the
          organization&apos;s transparency records, so the entry can be vetted
          against the <a href="/methodology" className="underline text-text-bright">methodology</a>.
        </p>
      </section>

      <section className="mb-8 pt-8 border-t border-border-hard">
        <h2 className="font-sans font-semibold text-xl text-text-bright mb-4">Maintainer</h2>
        <p className="font-sans text-base leading-[1.8] text-text-body mb-4">
          Crisis Hub is maintained by Arman Chaudhury. For anything not suited
          to a public issue, contact details are on the{" "}
          <a href="https://github.com/Arman-Chaudhury" className="underline text-text-bright" target="_blank" rel="noopener noreferrer">maintainer&apos;s GitHub profile</a>.
        </p>
      </section>
    </div>
  );
}
