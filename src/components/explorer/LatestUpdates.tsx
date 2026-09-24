import reliefweb from "@/data/reliefweb.json";
import type { ReliefWebItem } from "@/types/crisis";

export default function LatestUpdates({ slug }: { slug: string }) {
  const updates =
    (reliefweb.crises as Record<string, ReliefWebItem[]>)[slug] ?? [];

  return (
    <section aria-label="Latest reporting" className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Latest reporting
        </h2>
        <p className="mt-1 text-xs text-gray-600">Via UN ReliefWeb</p>
      </div>
      {updates.length === 0 ? (
        <p className="text-sm leading-relaxed text-gray-600">
          No updates are available in the current feed. Consult the briefing’s
          sources.
        </p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {updates.map((update) => (
            <li key={update.url} className="py-4 first:pt-0">
              <a
                href={update.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium leading-relaxed text-gray-900 hover:underline"
              >
                {update.title} <span aria-hidden="true">↗</span>
              </a>
              <p className="mt-2 text-xs text-gray-600">
                {update.source} · {update.date}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
