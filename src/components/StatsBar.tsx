import type { CrisisStat } from "@/types/crisis";

interface StatsBarProps {
  stats: CrisisStat[];
}

export default function StatsBar({ stats }: StatsBarProps) {
  return (
    <div
      className="grid gap-0 mb-11"
      style={{
        gridTemplateColumns: `repeat(${Math.min(stats.length, 4)}, 1fr)`,
      }}
    >
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className="relative py-[26px] text-center border-t border-b border-border-hard"
        >
          {/* Vertical divider */}
          {i < stats.length - 1 && (
            <div className="absolute right-0 top-[18%] h-[64%] w-px bg-border hidden sm:block" />
          )}
          <div className="font-sans font-semibold text-3xl text-text-bright tracking-normal leading-none mb-1.5">
            {stat.value}
          </div>
          <div className="font-sans text-xs font-medium text-text-dim tracking-normal">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}
