"use client";

import Link from "next/link";
import type { Crisis } from "@/types/crisis";
import { getStatusColor } from "@/lib/statusColors";

interface MobileFallbackProps {
  crises: Crisis[];
}

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  escalating: "Escalating",
  underreported: "Underreported",
};

/**
 * Mobile (<768px) replacement for the WebGL globe scene. Shows a single
 * static Earth image and a tappable, scrollable list of crisis cards.
 */
export default function MobileFallback({ crises }: MobileFallbackProps) {
  return (
    <div className="md:hidden mb-10">
      {/* Static Earth — uses the existing land/water mask as a stylised globe */}
      <div className="relative w-full aspect-square max-w-[420px] mx-auto mb-8">
        <div
          className="absolute inset-[-8%] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(230,57,70,0.07) 0%, rgba(230,57,70,0.025) 40%, transparent 70%)",
          }}
        />
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
      </div>

      <h3 className="font-display text-2xl tracking-[0.1em] text-text-bright mb-4">
        EXPLORE CRISES
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
                <span className="font-display text-base tracking-wider text-text-bright flex-1">
                  {c.name.toUpperCase()}
                </span>
                <span
                  className="font-sans text-[10px] uppercase tracking-widest"
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
