import type { LiveStats } from "@/types/crisis";
import liveStats from "@/data/live-stats.json";

/** Compact number: 33699770 → "33.7M", 812345 → "812K". */
function compact(n: number): string {
  if (n >= 1e6) return `${(n / 1e6).toFixed(n >= 1e7 ? 0 : 1)}M`;
  if (n >= 1e3) return `${Math.round(n / 1e3)}K`;
  return String(n);
}

function monthYear(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

const ROWS: { key: keyof Omit<LiveStats, "iso3">; label: string }[] = [
  { key: "peopleInNeed", label: "People in need" },
  { key: "idps", label: "Internally displaced" },
  { key: "foodInsecure", label: "Acute food insecurity (IPC 3+)" },
];

interface LiveIndicatorsProps {
  slug: string;
  /** Tighter layout for the globe modal. */
  compactLayout?: boolean;
}

/**
 * Machine-updated indicators from UN OCHA's Humanitarian API on HDX,
 * refreshed nightly by the update-data workflow. Rendered only when data
 * exists for the crisis; the hand-curated stats remain the primary figures.
 */
export default function LiveIndicators({ slug, compactLayout = false }: LiveIndicatorsProps) {
  const stats = (liveStats.crises as Record<string, LiveStats>)[slug];
  if (!stats) return null;
  const rows = ROWS.filter((r) => stats[r.key]);
  if (rows.length === 0) return null;

  return (
    <div className={compactLayout ? "mb-7" : "mt-10"}>
      <h4
        className={
          compactLayout
            ? "font-sans text-xs font-semibold tracking-normal text-text-dim mb-3"
            : "font-sans font-semibold text-lg text-text-dim tracking-normal mb-3.5"
        }
      >
        {compactLayout ? "Live indicators" : "Live indicators"}
        <span className="ml-3 font-sans text-xs font-medium tracking-normal text-text-faint align-middle">
          auto-updated · UN OCHA HDX
        </span>
      </h4>
      <dl className={`grid gap-3 ${rows.length === 3 ? "grid-cols-3" : rows.length === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
        {rows.map((r) => {
          const ind = stats[r.key]!;
          return (
            <div key={r.key} className="border border-border rounded-sm px-3 py-3 bg-bg-card/60">
              <dd className="font-sans font-semibold text-2xl text-text-bright tracking-normal leading-none mb-1.5">
                {compact(ind.value)}
              </dd>
              <dt className="font-sans text-xs font-medium text-text-dim tracking-normal leading-snug">
                {r.label}
              </dt>
              <p className="font-sans text-xs text-text-faint mt-1">{monthYear(ind.asOf)}</p>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
