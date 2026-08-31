import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCrisisBySlug, getAllCrisisSlugs, getAllCrises } from "@/lib/crises";
import type { ReliefWebItem } from "@/types/crisis";
import StatsBar from "@/components/StatsBar";
import ActionTabs from "@/components/ActionTabs";
import CrisisNavPills from "@/components/CrisisNavPills";
import reliefweb from "@/data/reliefweb.json";

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
    title: `${crisis.name} — How to Help`,
    description: crisis.summary,
    openGraph: {
      title: `${crisis.name} Crisis — How to Help | Crisis Hub`,
      description: crisis.summary,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${crisis.name} Crisis — How to Help | Crisis Hub`,
      description: crisis.summary,
    },
  };
}

/* ── Status labels ── */
const STATUS_LABELS: Record<string, string> = {
  active: "Active Crisis",
  escalating: "Escalating",
  underreported: "Underreported",
};

export default function CrisisPage({ params }: CrisisPageProps) {
  const crisis = getCrisisBySlug(params.slug);
  if (!crisis) notFound();

  const allCrises = getAllCrises();

  return (
    <>
      {/* Crisis quick-nav pills */}
      <CrisisNavPills crises={allCrises} currentSlug={crisis.slug} />

      {/* Crisis header */}
      <header className="mb-11 animate-fade-up-2">
        <div className="inline-flex items-center gap-2 mb-3.5">
          <span
            className="w-2 h-2 rounded-sm animate-pulse"
            style={{
              backgroundColor: crisis.color,
              boxShadow: `0 0 10px ${crisis.color}40`,
            }}
          />
          <span
            className="font-sans text-[11px] font-semibold tracking-[0.18em] uppercase"
            style={{ color: crisis.color }}
          >
            {STATUS_LABELS[crisis.status] || crisis.status}
          </span>
        </div>

        <h1 className="font-display text-[clamp(56px,10vw,110px)] text-text-bright tracking-[0.05em] leading-[0.92] mb-2">
          {crisis.name.toUpperCase()}
        </h1>

        <p className="font-serif italic text-base text-text-muted tracking-wide mb-6">
          {crisis.region}
        </p>

        <p className="font-sans text-[17px] font-light leading-[1.75] text-text-body max-w-[600px] pl-5 border-l-[3px] border-crisis-red">
          {crisis.summary}
        </p>
      </header>

      {/* On-the-ground photography */}
      {(crisis.photos?.length ?? 0) > 0 && (
        <section className="mb-11 animate-fade-up-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {crisis.photos!.map((src, i) => (
              <div
                key={src}
                className="relative aspect-[4/3] overflow-hidden rounded-sm bg-bg-card border border-border"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`${crisis.name} — on-the-ground photo ${i + 1}`}
                  loading={i === 0 ? "eager" : "lazy"}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
          {(crisis.photoCredits?.length ?? 0) > 0 && (
            <p className="mt-2 font-sans text-[10px] leading-relaxed text-text-dim">
              Photos via Wikimedia Commons:{" "}
              {crisis.photoCredits!.map((c, i) => (
                <span key={i}>
                  {i > 0 && " · "}
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline decoration-border hover:text-text-body transition-colors"
                  >
                    {c.artist}
                  </a>{" "}
                  ({c.license})
                </span>
              ))}
            </p>
          )}
        </section>
      )}

      {/* Stats */}
      <StatsBar stats={crisis.stats} />

      {/* Latest updates — refreshed nightly from UN ReliefWeb */}
      {(() => {
        const updates: ReliefWebItem[] =
          (reliefweb.crises as Record<string, ReliefWebItem[]>)[crisis.slug] ?? [];
        if (updates.length === 0) return null;
        return (
          <section className="mt-10 animate-fade-up-4">
            <h4 className="font-display text-[22px] text-text-dim tracking-[0.1em] mb-3.5">
              LATEST UPDATES
              <span className="ml-3 font-sans text-[10px] font-medium tracking-[0.14em] text-text-faint uppercase align-middle">
                via UN ReliefWeb
              </span>
            </h4>
            <ul className="space-y-3 max-w-[680px]">
              {updates.map((u) => (
                <li key={u.url}>
                  <a
                    href={u.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block"
                  >
                    <span className="font-sans text-[15px] text-text-body group-hover:text-text-bright transition-colors leading-snug">
                      {u.title}
                    </span>
                    <span className="block font-sans text-[11px] text-text-dim mt-0.5">
                      {u.source} · {u.date}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        );
      })()}

      {/* Action Tabs */}
      <ActionTabs actions={crisis.actions} />

      {/* Background Context */}
      <section className="mt-12 pt-9 border-t-2 border-text-bright animate-fade-up-5">
        <h2 className="font-display text-4xl text-text-muted tracking-[0.08em] mb-5">
          BACKGROUND
        </h2>
        {crisis.context.split("\n\n").map((paragraph, i) => (
          <p
            key={i}
            className="font-sans text-base font-light leading-[1.8] text-text-body mb-4 max-w-[680px]"
          >
            {paragraph}
          </p>
        ))}
      </section>

      {/* Sources */}
      <section className="mt-12 pt-7 border-t border-border-hard animate-fade-up-6">
        <h4 className="font-display text-[22px] text-text-dim tracking-[0.1em] mb-3.5">
          SOURCES
        </h4>
        <div className="flex flex-wrap">
          {crisis.sources.map((source) => (
            <a
              key={source.title}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block font-sans text-[13px] text-text-muted mr-5 mb-2 border-b border-border pb-0.5 transition-all duration-200 hover:text-text-bright hover:border-text-bright"
            >
              {source.title}
            </a>
          ))}
        </div>
        <p className="mt-4 font-sans text-[11px] font-medium text-text-faint uppercase tracking-[0.1em]">
          Last updated: {new Date(crisis.lastUpdated).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </section>

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: `${crisis.name} Humanitarian Crisis`,
            description: crisis.summary,
            dateModified: crisis.lastUpdated,
            author: {
              "@type": "Organization",
              name: "Crisis Hub",
            },
          }),
        }}
      />
    </>
  );
}
