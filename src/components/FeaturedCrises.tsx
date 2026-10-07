import Link from "next/link";
import type { Crisis } from "@/types/crisis";
import StatusLabel from "./explorer/StatusLabel";

const FEATURED_COUNT = 6;

const STATUS_ORDER: Record<string, number> = {
  escalating: 0,
  active: 1,
  underreported: 2,
};

/** Most recently reviewed briefings first, escalating ahead of the rest. */
export function pickFeatured(crises: Crisis[]): Crisis[] {
  return [...crises]
    .sort(
      (a, b) =>
        b.lastUpdated.localeCompare(a.lastUpdated) ||
        (STATUS_ORDER[a.status] ?? 3) - (STATUS_ORDER[b.status] ?? 3) ||
        a.name.localeCompare(b.name),
    )
    .slice(0, FEATURED_COUNT);
}

export default function FeaturedCrises({ crises }: { crises: Crisis[] }) {
  const featured = pickFeatured(crises);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
            Recently updated briefings
          </h2>
          <p className="mt-2 text-base text-gray-600">
            Sourced briefings with vetted ways to help.
          </p>
        </div>
        <Link
          href="/crises"
          className="inline-flex min-h-11 items-center border border-gray-900 px-5 text-sm font-medium text-gray-900 hover:bg-gray-900 hover:text-white"
        >
          View all {crises.length} crises
        </Link>
      </div>
      <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map((crisis) => {
          const photo = crisis.photos?.[0];
          return (
            <li key={crisis.slug}>
              <Link
                href={`/crises/${crisis.slug}`}
                className="group flex h-full flex-col border border-gray-200 hover:border-gray-400"
              >
                {photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photo}
                    alt=""
                    loading="lazy"
                    className="aspect-[3/2] w-full object-cover"
                  />
                ) : (
                  <div
                    aria-hidden="true"
                    className="aspect-[3/2] w-full"
                    style={{ backgroundColor: crisis.color }}
                  />
                )}
                <div className="flex flex-1 flex-col p-5">
                  <StatusLabel status={crisis.status} />
                  <h3 className="mt-3 text-xl font-semibold text-gray-900 group-hover:underline">
                    {crisis.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">{crisis.region}</p>
                  <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-gray-700">
                    {crisis.summary}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
      <Link
        href="/crises"
        className="mt-6 inline-block text-sm font-medium text-gray-900 underline underline-offset-4 sm:hidden"
      >
        View all {crises.length} crises
      </Link>
    </div>
  );
}
