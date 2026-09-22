import Link from "next/link";
import type { Crisis } from "@/types/crisis";
import { getStatusColor } from "@/lib/statusColors";

interface CrisisCardProps {
  crisis: Crisis;
}

const STATUS_LABELS: Record<string, string> = {
  active: "Active Crisis",
  escalating: "Escalating",
  underreported: "Underreported",
};

export default function CrisisCard({ crisis }: CrisisCardProps) {
  return (
    <Link
      href={`/crises/${crisis.slug}`}
      className="group block p-6 border border-border rounded-lg bg-bg-card transition-all duration-300 hover:bg-bg-card-hover hover:border-border-hard hover:translate-y-[-2px]"
    >
      {/* Status tag */}
      <div className="flex items-center gap-2 mb-3">
        <span
          className="w-2 h-2 rounded-sm"
          style={{ backgroundColor: getStatusColor(crisis.status) }}
        />
        <span
          className="font-sans text-xs font-semibold tracking-normal"
          style={{ color: getStatusColor(crisis.status) }}
        >
          {STATUS_LABELS[crisis.status] || crisis.status}
        </span>
      </div>

      {/* Crisis name */}
      <h2 className="font-sans font-semibold text-xl text-text-bright tracking-normal mb-1  transition-all duration-300">
        {crisis.name}
      </h2>

      {/* Region */}
      <p className="font-sans text-sm text-text-muted mb-4">
        {crisis.region}
      </p>

      {/* Summary */}
      <p className="font-sans text-sm text-text-body leading-relaxed line-clamp-3">
        {crisis.summary}
      </p>

      {/* Key stats preview */}
      {crisis.stats.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border flex gap-6">
          {crisis.stats.slice(0, 2).map((stat) => (
            <div key={stat.label}>
              <div
                className="font-sans font-semibold text-lg tracking-normal"
                style={{ color: getStatusColor(crisis.status) }}
              >
                {stat.value}
              </div>
              <div className="font-sans text-xs text-text-dim tracking-normal">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      )}
    </Link>
  );
}
