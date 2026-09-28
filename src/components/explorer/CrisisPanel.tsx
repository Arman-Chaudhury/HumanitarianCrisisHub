import Link from "next/link";
import type { Crisis } from "@/types/crisis";
import StatusLabel from "./StatusLabel";
import CrisisPhotos from "./CrisisPhotos";
import LatestUpdates from "./LatestUpdates";

export default function CrisisPanel({ crisis }: { crisis: Crisis }) {
  return (
    <>
      <div aria-live="polite" aria-atomic="true">
        <StatusLabel status={crisis.status} />
        <h2
          tabIndex={-1}
          data-selected-heading
          className="mt-3 text-3xl font-semibold tracking-tight text-gray-900"
        >
          {crisis.name}
        </h2>
      </div>
      <p className="mt-2 text-sm text-gray-600">{crisis.region}</p>
      <p className="mt-2 text-xs text-gray-600">
        Last reviewed{" "}
        <time dateTime={crisis.lastUpdated}>{crisis.lastUpdated}</time>
      </p>
      <p className="mt-5 text-base leading-relaxed text-gray-700">
        {crisis.summary}
      </p>
      <dl className="my-6 grid grid-cols-2 gap-5 [overflow-wrap:anywhere] border-y border-gray-200 py-5">
        {crisis.stats.map((stat) => (
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
        href={`/crises/${crisis.slug}#help`}
        className="flex min-h-11 items-center justify-between gap-3 bg-institution-accent px-4 py-3 text-sm font-semibold text-white hover:bg-institution-accent-hover"
      >
        Support organizations <span aria-hidden="true">↗</span>
      </Link>
      <Link
        href={`/crises/${crisis.slug}`}
        className="mt-3 flex min-h-11 items-center justify-between border border-gray-300 px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50"
      >
        Read full briefing <span aria-hidden="true">→</span>
      </Link>
      <div className="mt-6">
        <CrisisPhotos crisis={crisis} compact />
      </div>
      <div className="mt-6 border-t border-gray-200 pt-6">
        <LatestUpdates slug={crisis.slug} />
      </div>
    </>
  );
}
