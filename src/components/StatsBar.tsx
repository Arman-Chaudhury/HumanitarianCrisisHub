import type { CrisisStat } from "@/types/crisis";

export default function StatsBar({ stats }: { stats: CrisisStat[] }) {
  return (
    <dl className="grid gap-6 border-y border-gray-200 py-6 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label}>
          <dt className="text-sm text-gray-600">{stat.label}</dt>
          <dd className="mt-2 text-3xl font-semibold tracking-tight text-gray-900">
            {stat.value}
          </dd>
          <dd className="mt-3 text-xs leading-relaxed text-gray-600">
            {stat.source}
          </dd>
        </div>
      ))}
    </dl>
  );
}
