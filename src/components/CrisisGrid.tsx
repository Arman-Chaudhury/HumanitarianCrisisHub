import type { Crisis } from "@/types/crisis";
import CrisisCard from "./CrisisCard";

interface CrisisGridProps {
  crises: Crisis[];
}

export default function CrisisGrid({ crises }: CrisisGridProps) {
  return (
    <section className="animate-fade-up-5">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl text-text-muted tracking-[0.1em]">
          ALL CRISES
        </h2>
        <span className="font-sans text-xs text-text-dim tracking-wider">
          {crises.length} documented
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {crises.map((crisis) => (
          <CrisisCard key={crisis.slug} crisis={crisis} />
        ))}
      </div>
    </section>
  );
}
