"use client";

import { useId, useRef, useState } from "react";
import type { CrisisActions } from "@/types/crisis";

const TABS = [
  { key: "donate", label: "Support organizations" },
  { key: "awareness", label: "Raise awareness" },
  { key: "political", label: "Press for change" },
] as const;

export default function ActionTabs({ actions }: { actions: CrisisActions }) {
  const [active, setActive] = useState(0);
  const id = useId();
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);
  const selected = TABS[active].key;

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900">How to help</h2>
      <div
        role="tablist"
        aria-label="Ways to help"
        className="my-6 flex overflow-x-auto border-b border-gray-200"
      >
        {TABS.map((tab, index) => (
          <button
            key={tab.key}
            ref={(element) => {
              buttons.current[index] = element;
            }}
            type="button"
            role="tab"
            id={`${id}-tab-${index}`}
            aria-controls={`${id}-panel-${index}`}
            aria-selected={active === index}
            tabIndex={active === index ? 0 : -1}
            onClick={() => setActive(index)}
            onKeyDown={(event) => {
              const moves: Record<string, number> = {
                ArrowRight: (index + 1) % TABS.length,
                ArrowLeft: (index + TABS.length - 1) % TABS.length,
                Home: 0,
                End: TABS.length - 1,
              };
              const next = moves[event.key];
              if (next === undefined) return;
              event.preventDefault();
              setActive(next);
              buttons.current[next]?.focus();
            }}
            className={`min-h-12 shrink-0 border-b-2 px-4 py-3 text-sm font-medium ${active === index ? "border-[#A44136] text-[#A44136]" : "border-transparent text-gray-600 hover:text-gray-900"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`${id}-panel-${active}`}
        aria-labelledby={`${id}-tab-${active}`}
        tabIndex={0}
      >
        {selected === "donate" ? (
          <div className="grid gap-4 md:grid-cols-2">
            {actions.donate.map((organization) => (
              <a
                key={organization.name}
                href={organization.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col border border-gray-200 p-6 hover:border-gray-400 hover:bg-gray-50"
              >
                <h3 className="text-xl font-semibold text-gray-900">
                  {organization.name}
                </h3>
                <p className="my-4 text-base leading-relaxed text-gray-600">
                  {organization.description}
                </p>
                <span className="mt-auto text-sm font-medium text-[#A44136]">
                  Visit organization ↗
                </span>
              </a>
            ))}
          </div>
        ) : (
          <ol className="list-decimal space-y-4 pl-6 text-base leading-relaxed text-gray-700">
            {actions[selected].map((item, index) => (
              <li key={index} className="pl-2">
                {item}
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
