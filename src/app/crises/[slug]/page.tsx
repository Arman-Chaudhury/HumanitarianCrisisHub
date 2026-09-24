import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCrisisBySlug, getAllCrisisSlugs } from "@/lib/crises";
import Link from "next/link";
import StatsBar from "@/components/StatsBar";
import ActionTabs from "@/components/ActionTabs";
import CrisisPhotos from "@/components/explorer/CrisisPhotos";
import StatusLabel from "@/components/explorer/StatusLabel";
import LatestUpdates from "@/components/explorer/LatestUpdates";
import LiveIndicators from "@/components/LiveIndicators";

interface CrisisPageProps {
  params: { slug: string };
}

/* ── Static params for build-time generation ── */
export async function generateStaticParams() {
  const slugs = getAllCrisisSlugs();
  return slugs.map((slug) => ({ slug }));
}

/* ── Dynamic metadata per crisis ── */
export async function generateMetadata({
  params,
}: CrisisPageProps): Promise<Metadata> {
  const crisis = getCrisisBySlug(params.slug);
  if (!crisis) return { title: "Crisis Not Found" };

  return {
    title: `${crisis.name}: what is happening and how to help`,
    description: crisis.summary,
    openGraph: {
      title: `${crisis.name}: what is happening and how to help | Crisis Hub`,
      description: crisis.summary,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${crisis.name}: what is happening and how to help | Crisis Hub`,
      description: crisis.summary,
    },
  };
}

export default function CrisisPage({ params }: CrisisPageProps) {
  const crisis = getCrisisBySlug(params.slug);
  if (!crisis) notFound();

  const reviewed = new Date(crisis.lastUpdated).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });

  return (
    <article>
      <nav aria-label="Breadcrumb" className="mb-8 text-sm text-gray-600">
        <Link href="/#crises" className="underline underline-offset-4">
          All crises
        </Link>
        <span aria-hidden="true" className="mx-3">
          /
        </span>
        <span aria-current="page">{crisis.name}</span>
      </nav>
      <header className="mb-8">
        <StatusLabel status={crisis.status} />
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
              {crisis.name}
            </h1>
            <p className="mt-3 text-base text-gray-600">{crisis.region}</p>
          </div>
          <p className="text-sm text-gray-600">
            Last reviewed <time dateTime={crisis.lastUpdated}>{reviewed}</time>
          </p>
        </div>
        <p className="mt-6 max-w-4xl text-xl leading-relaxed text-gray-700">
          {crisis.summary}
        </p>
      </header>
      <nav
        aria-label="Briefing sections"
        className="mb-8 flex flex-wrap gap-x-6 gap-y-3 border-y border-gray-200 py-4 text-sm font-medium"
      >
        <a href="#background" className="underline-offset-4 hover:underline">
          Background
        </a>
        <a href="#reporting" className="underline-offset-4 hover:underline">
          Latest reporting
        </a>
        <a href="#help" className="underline-offset-4 hover:underline">
          How to help
        </a>
        <a href="#sources" className="underline-offset-4 hover:underline">
          Sources
        </a>
      </nav>
      <CrisisPhotos crisis={crisis} />
      <section aria-label="Key statistics" className="my-10">
        <StatsBar stats={crisis.stats} />
      </section>
      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <section id="background" className="scroll-mt-24">
          <h2 className="mb-5 text-2xl font-semibold text-gray-900">
            What is happening
          </h2>
          {crisis.context.split("\n\n").map((paragraph, index) => (
            <p
              key={index}
              className="mb-5 max-w-prose text-base leading-8 text-gray-700"
            >
              {paragraph}
            </p>
          ))}
        </section>
        <aside
          id="reporting"
          className="min-w-0 scroll-mt-24 border border-gray-200 p-6"
        >
          <LatestUpdates slug={crisis.slug} />
          <LiveIndicators slug={crisis.slug} />
        </aside>
      </div>
      <section
        id="help"
        className="mt-12 scroll-mt-24 border-t border-gray-200 pt-8"
      >
        <ActionTabs actions={crisis.actions} />
      </section>
      <section
        id="sources"
        className="mt-12 scroll-mt-24 border-t border-gray-200 pt-8"
      >
        <h2 className="text-2xl font-semibold text-gray-900">
          Sources and further reading
        </h2>
        <ul className="mt-5 divide-y divide-gray-200">
          {crisis.sources.map((source) => (
            <li key={source.url} className="py-4">
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-wrap justify-between gap-3 text-base text-gray-900 hover:underline"
              >
                <span>
                  {source.title} <span aria-hidden="true">↗</span>
                </span>
                <span className="text-sm text-gray-600">{source.org}</span>
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-gray-600">
          Spotted an error?{" "}
          <Link href="/contact" className="underline underline-offset-4">
            Contact us with a correction.
          </Link>
        </p>
      </section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: `${crisis.name} Humanitarian Crisis`,
            description: crisis.summary,
            dateModified: crisis.lastUpdated,
            author: { "@type": "Organization", name: "Crisis Hub" },
          }).replace(/</g, "\\u003c"),
        }}
      />
    </article>
  );
}
