"use client";

import { useState } from "react";
import type { Crisis, CrisisStatus } from "@/types/crisis";
import CrisisCard from "./CrisisCard";

interface CrisisGridProps {
  crises: Crisis[];
}

const CATEGORIES: { status: CrisisStatus; label: string; color: string }[] = [
  { status: "escalating", label: "Escalating", color: "#FFD166" },
  { status: "active", label: "Active", color: "#E63946" },
  { status: "underreported", label: "Underreported", color: "#D4580E" },
];

export default function CrisisGrid({ crises }: CrisisGridProps) {
  const [active, setActive] = useState<CrisisStatus>("escalating");

  const activeCategory = CATEGORIES.find((c) => c.status === active)!;
  const filtered = crises.filter((c) => c.status === active);

  return (
    <div className="">
      {/* Tab bar */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {CATEGORIES.map(({ status, label, color }) => {
          const count = crises.filter((c) => c.status === status).length;
          const isActive = active === status;
          return (
            <button
              key={status}
              onClick={() => setActive(status)}
              className={`flex items-center gap-2 px-4 py-2 rounded font-sans font-medium text-sm transition-colors border ${
                isActive
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-text-body border-border-hard hover:bg-bg-card-hover"
              }`}
            >
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ background: color }}
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
          <h2 className="font-sans font-semibold text-lg text-text-bright">
            {activeCategory.label} crises
          </h2>
          <span className="font-sans text-xs text-text-dim tracking-normal">
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
