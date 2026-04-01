import type { CrisisStat } from "@/types/crisis";

interface StatsBarProps {
  stats: CrisisStat[];
}

export default function StatsBar({ stats }: StatsBarProps) {
  return (
    <div
      className="grid gap-0 mb-11 animate-fade-up-3"
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
          <div className="font-display text-[38px] text-text-bright tracking-wider leading-none mb-1.5">
            {stat.value}
          </div>
          <div className="font-sans text-[11px] font-medium text-text-dim uppercase tracking-widest">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}
