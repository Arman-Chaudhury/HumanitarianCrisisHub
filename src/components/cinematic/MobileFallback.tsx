"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import type { Crisis } from "@/types/crisis";
import { getStatusColor } from "@/lib/statusColors";

/** Static Earth shown during SSR and while the WebGL bundle loads. */
function StaticEarth() {
  return (
    <div
      className="absolute inset-0 rounded-full overflow-hidden"
      style={{
        background:
          "radial-gradient(circle at 35% 35%, #1a5c8a 0%, #091d36 60%, #050b14 100%)",
        boxShadow: "inset -10px -16px 50px rgba(0,0,0,0.55), 0 0 60px rgba(108,184,255,0.12)",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/textures/earth_day.jpg"
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover opacity-90"
        style={{ objectPosition: "40% 42%" }}
      />
    </div>
  );
}

const MobileGlobe = dynamic(() => import("./MobileGlobe"), {
  ssr: false,
  loading: () => <StaticEarth />,
});

interface MobileFallbackProps {
  crises: Crisis[];
  selectedSlug: string | null;
  onSelectCrisis: (slug: string) => void;
  /** Show regardless of breakpoint (touch devices in landscape, reduced motion). */
  force?: boolean;
  /** Mount the WebGL globe (only once we know this is the active experience —
   *  avoids a second hidden GL context on desktop). */
  live?: boolean;
}

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  escalating: "Escalating",
  underreported: "Underreported",
};

/**
 * Touch-device / reduced-motion replacement for the scroll-choreographed
 * scene: a lighter live WebGL globe (auto-rotating, hotspots tappable) plus
 * a scrollable list of crisis cards.
 */
export default function MobileFallback({
  crises,
  selectedSlug,
  onSelectCrisis,
  force = false,
  live = false,
}: MobileFallbackProps) {
  return (
    <div className={`${force ? "" : "md:hidden "}mb-10`}>
      <div className="relative w-full aspect-square max-w-[460px] mx-auto mb-3">
        {live ? (
          <MobileGlobe crises={crises} selectedSlug={selectedSlug} onSelectCrisis={onSelectCrisis} />
        ) : (
          <StaticEarth />
        )}
      </div>
      <p className="text-center font-sans text-xs tracking-normal text-text-muted/80 mb-8">
        Tap a marker
      </p>

      <h3 className="font-sans font-semibold text-lg tracking-normal text-text-bright mb-4">
        Explore crises
      </h3>

      <ul className="space-y-2">
        {crises.map((c) => {
          const color = getStatusColor(c.status);
          return (
            <li key={c.slug}>
              <Link
                href={`/crises/${c.slug}`}
                className="flex items-center gap-3 px-4 py-3 rounded-sm border border-border bg-bg-card hover:bg-bg-card-hover transition-colors"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ background: color, boxShadow: `0 0 8px ${color}77` }}
                />
                <span className="font-sans font-medium text-base tracking-normal text-text-bright flex-1">
                  {c.name}
                </span>
                <span
                  className="font-sans text-xs tracking-normal"
                  style={{ color }}
                >
                  {STATUS_LABELS[c.status] ?? c.status}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
