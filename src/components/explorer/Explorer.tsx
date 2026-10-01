"use client";

import { useState } from "react";
import type { Crisis } from "@/types/crisis";
import ExplorerGlobe from "./ExplorerGlobe";
import CrisisPanel from "./CrisisPanel";
import ExplorerLegend from "./ExplorerLegend";

/**
 * The explorer without the opening sequence: globe, selected-crisis panel and
 * legend in normal page flow. Used on phones, tablets, when motion is reduced,
 * and when WebGL is unavailable.
 */
export default function Explorer({ crises }: { crises: Crisis[] }) {
  const [selectedSlug, setSelectedSlug] = useState(
    crises.find((crisis) => crisis.slug === "sudan")?.slug ?? crises[0]?.slug,
  );
  const selected = crises.find((crisis) => crisis.slug === selectedSlug);
  if (!selected) return null;

  return (
    <section aria-label="Explore a crisis" className="border border-gray-200">
      <div className="grid min-w-0 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
        <ExplorerGlobe
          crises={crises}
          selectedSlug={selected.slug}
          onSelectCrisis={setSelectedSlug}
        />
        <aside
          aria-label="Selected crisis"
          className="min-w-0 bg-white p-6 lg:max-h-[720px] lg:overflow-y-auto"
        >
          <CrisisPanel crisis={selected} />
        </aside>
      </div>
      <ExplorerLegend />
    </section>
  );
}
