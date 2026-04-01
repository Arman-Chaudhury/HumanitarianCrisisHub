import Link from "next/link";
import type { Crisis } from "@/types/crisis";

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
          className="w-2 h-2 rounded-sm animate-pulse"
          style={{ backgroundColor: crisis.color }}
        />
        <span
          className="font-sans text-[11px] font-semibold tracking-[0.18em] uppercase"
          style={{ color: crisis.color }}
        >
          {STATUS_LABELS[crisis.status] || crisis.status}
        </span>
      </div>

      {/* Crisis name */}
      <h2 className="font-display text-4xl text-text-bright tracking-wider mb-1 group-hover:tracking-[0.08em] transition-all duration-300">
        {crisis.name.toUpperCase()}
      </h2>

      {/* Region */}
      <p className="font-serif italic text-sm text-text-muted mb-4">
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
                className="font-display text-xl tracking-wider"
                style={{ color: crisis.color }}
              >
                {stat.value}
              </div>
              <div className="font-sans text-[10px] text-text-dim uppercase tracking-widest">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      )}
    </Link>
  );
}
