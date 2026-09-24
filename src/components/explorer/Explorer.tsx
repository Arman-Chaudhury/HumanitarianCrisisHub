"use client";

import Link from "next/link";
import { useState } from "react";
import type { Crisis } from "@/types/crisis";
import ExplorerGlobe from "./ExplorerGlobe";
import StatusLabel from "./StatusLabel";
import CrisisPhotos from "./CrisisPhotos";
import LatestUpdates from "./LatestUpdates";

export default function Explorer({ crises }: { crises: Crisis[] }) {
  const [selectedSlug, setSelectedSlug] = useState(
    crises.find((crisis) => crisis.slug === "sudan")?.slug ?? crises[0]?.slug,
  );
  const selected = crises.find((crisis) => crisis.slug === selectedSlug);
  if (!selected) return null;

  return (
    <section aria-label="Explore a crisis" className="border border-gray-200">
      <div className="grid min-w-0 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
        <ExplorerGlobe
          crises={crises}
          selectedSlug={selected.slug}
          onSelectCrisis={setSelectedSlug}
        />
        <aside
          aria-label="Selected crisis"
          className="min-w-0 bg-white p-6 lg:max-h-[720px] lg:overflow-y-auto"
          data-lenis-prevent
        >
          <div aria-live="polite" aria-atomic="true">
            <StatusLabel status={selected.status} />
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-gray-900">
              {selected.name}
            </h2>
          </div>
          <p className="mt-2 text-sm text-gray-600">{selected.region}</p>
          <p className="mt-2 text-xs text-gray-600">
            Last reviewed{" "}
            <time dateTime={selected.lastUpdated}>{selected.lastUpdated}</time>
          </p>
          <p className="mt-5 text-base leading-relaxed text-gray-700">
            {selected.summary}
          </p>
          <dl className="my-6 grid grid-cols-2 gap-5 border-y border-gray-200 py-5">
            {selected.stats.slice(0, 2).map((stat) => (
              <div key={stat.label}>
                <dt className="text-sm text-gray-600">{stat.label}</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {stat.value}
                </dd>
                <dd className="mt-2 text-xs leading-relaxed text-gray-600">
                  {stat.source}
                </dd>
              </div>
            ))}
          </dl>
          <Link
            href={`/crises/${selected.slug}#help`}
            className="flex min-h-11 items-center justify-between gap-3 bg-[#A44136] px-4 py-3 text-sm font-semibold text-white hover:bg-[#87362D]"
          >
            Support organizations <span aria-hidden="true">↗</span>
          </Link>
          <Link
            href={`/crises/${selected.slug}`}
            className="mt-3 flex min-h-11 items-center justify-between border border-gray-300 px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50"
          >
            Read full briefing <span aria-hidden="true">→</span>
          </Link>
          <div className="mt-6">
            <CrisisPhotos crisis={selected} compact />
          </div>
          <div className="mt-6 border-t border-gray-200 pt-6">
            <LatestUpdates slug={selected.slug} />
          </div>
        </aside>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-200 px-5 py-4">
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          <StatusLabel status="escalating" />
          <StatusLabel status="active" />
          <StatusLabel status="underreported" />
        </div>
        <Link
          href="/methodology"
          className="text-sm text-gray-600 underline underline-offset-4"
        >
          How we classify crises
        </Link>
      </div>
    </section>
  );
}
