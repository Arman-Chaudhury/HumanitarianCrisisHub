"use client";

import { useState } from "react";
import type { CrisisActions } from "@/types/crisis";

interface ActionTabsProps {
  actions: CrisisActions;
}

type Tab = "donate" | "awareness" | "political";

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: "donate", label: "Donate", icon: "♥" },
  { key: "awareness", label: "Awareness", icon: "◉" },
  { key: "political", label: "Action", icon: "⚡" },
];

export default function ActionTabs({ actions }: ActionTabsProps) {
  const [active, setActive] = useState<Tab>("donate");

  return (
    <div className="animate-fade-up-4">
      {/* Tab Buttons */}
      <div className="flex gap-0 mb-8" role="tablist">
        {TABS.map((tab, i) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={active === tab.key}
            onClick={() => setActive(tab.key)}
            className={`py-3.5 px-5 sm:px-7 font-sans text-[13px] font-semibold tracking-wide transition-all duration-300 border border-border ${
              i < TABS.length - 1 ? "border-r-0" : ""
            } ${
              active === tab.key
                ? "text-text-bright bg-crisis-red border-crisis-red"
                : "text-text-dim bg-transparent hover:text-text-muted hover:bg-[rgba(255,255,255,0.02)]"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Donate Panel */}
      {active === "donate" && (
        <div className="flex flex-col gap-0 animate-fade-up" role="tabpanel">
          {actions.donate.map((org, i) => (
            <a
              key={org.name}
              href={org.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`group flex flex-col sm:flex-row items-start sm:items-center justify-between py-6 px-1 text-inherit no-underline border-b border-border transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:pl-4 hover:bg-gradient-to-r hover:from-bg-card-hover hover:to-transparent ${
                i === 0 ? "border-t border-border" : ""
              }`}
            >
              <div>
                <h3 className="font-serif text-[22px] text-text-bright mb-1.5">
                  {org.name}
                </h3>
                <p className="font-sans text-sm text-text-muted leading-relaxed max-w-[520px]">
                  {org.description}
                </p>
              </div>
              <span className="mt-3 sm:mt-0 font-sans text-xs font-semibold text-crisis-red tracking-wider whitespace-nowrap py-2.5 px-5 border-[1.5px] border-crisis-red rounded transition-all duration-200 group-hover:bg-crisis-red group-hover:text-text-bright group-hover:shadow-[0_0_20px_rgba(230,57,70,0.09)]">
                Donate →
              </span>
            </a>
          ))}
        </div>
      )}

      {/* Awareness Panel */}
      {active === "awareness" && (
        <div className="flex flex-col gap-0 animate-fade-up" role="tabpanel">
          {actions.awareness.map((item, i) => (
            <div
              key={i}
              className={`flex gap-5 items-baseline py-5 px-1 border-b border-border transition-all duration-300 hover:pl-3 ${
                i === 0 ? "border-t border-border" : ""
              }`}
            >
              <div className="font-display text-[32px] text-crisis-red tracking-wide leading-none min-w-[36px] opacity-70">
                {String(i + 1).padStart(2, "0")}
              </div>
              <p className="font-sans text-[15px] leading-[1.7] text-text-body">
                {item}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Political Action Panel */}
      {active === "political" && (
        <div className="flex flex-col gap-0 animate-fade-up" role="tabpanel">
          {actions.political.map((item, i) => (
            <div
              key={i}
              className={`flex gap-5 items-baseline py-5 px-1 border-b border-border transition-all duration-300 hover:pl-3 ${
                i === 0 ? "border-t border-border" : ""
              }`}
            >
              <div className="font-display text-[32px] text-crisis-red tracking-wide leading-none min-w-[36px] opacity-70">
                {String(i + 1).padStart(2, "0")}
              </div>
              <p className="font-sans text-[15px] leading-[1.7] text-text-body">
                {item}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
