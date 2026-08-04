"use client";

import { useState } from "react";
import type { Crisis, CrisisStatus } from "@/types/crisis";
import CrisisCard from "./CrisisCard";

interface CrisisGridProps {
  crises: Crisis[];
}

const CATEGORIES: { status: CrisisStatus; label: string; color: string }[] = [
  { status: "escalating", label: "ESCALATING", color: "#FFD166" },
  { status: "active", label: "ACTIVE CRISIS", color: "#E63946" },
  { status: "underreported", label: "UNDERREPORTED", color: "#D4580E" },
];

export default function CrisisGrid({ crises }: CrisisGridProps) {
  const [active, setActive] = useState<CrisisStatus>("escalating");

  const activeCategory = CATEGORIES.find((c) => c.status === active)!;
  const filtered = crises.filter((c) => c.status === active);

  return (
    <div className="animate-fade-up-5">
      {/* Tab bar */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {CATEGORIES.map(({ status, label, color }) => {
          const count = crises.filter((c) => c.status === status).length;
          const isActive = active === status;
          return (
            <button
              key={status}
              onClick={() => setActive(status)}
              className="flex items-center gap-2 px-4 py-2 rounded-sm font-display text-sm tracking-[0.08em] transition-all duration-200 border"
              style={{
                borderColor: color,
                color: isActive ? "#0a0a0a" : color,
                backgroundColor: isActive ? color : "transparent",
                opacity: isActive ? 1 : 0.6,
              }}
            >
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ background: isActive ? "#0a0a0a" : color }}
              />
              {label}
              <span
                className="text-xs font-sans ml-1"
                style={{ opacity: 0.7 }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2
            className="font-display text-2xl tracking-[0.1em]"
            style={{ color: activeCategory.color }}
          >
            {activeCategory.label}
          </h2>
          <span className="font-sans text-xs text-text-dim tracking-wider">
            {filtered.length} documented
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((crisis) => (
            <CrisisCard key={crisis.slug} crisis={crisis} />
          ))}
        </div>
      </section>
    </div>
  );
}
