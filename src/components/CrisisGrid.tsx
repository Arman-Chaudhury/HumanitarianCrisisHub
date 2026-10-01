"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Crisis, CrisisStatus } from "@/types/crisis";
import StatusLabel from "./explorer/StatusLabel";

// Presentation-only grouping; editorial region descriptions remain untouched.
const REGION_SLUGS: Record<string, string[]> = {
  Africa: [
    "burkina-faso",
    "chad",
    "horn-of-africa-drought",
    "lake-chad",
    "mali",
    "mozambique",
    "nigeria",
    "sahel",
    "somalia",
    "south-sudan",
    "sudan",
    "congo",
    "eritrea",
    "libya",
    "madagascar",
    "niger",
    "san-bushmen",
    "cameroon",
    "central-african-republic",
    "ethiopia",
    "sahrawi-refugees",
  ],
  Americas: ["colombia", "haiti", "amazon-indigenous", "venezuela"],
  Asia: [
    "adivasi-india",
    "afghanistan",
    "balochistan",
    "bangladesh-climate",
    "kashmir",
    "pakistan-floods",
    "rohingya",
    "tibet",
    "west-papua",
    "myanmar",
    "north-korea",
    "tamils-sri-lanka",
    "turkmenistan",
    "uyghurs",
  ],
  "Europe and Caucasus": ["russia", "ukraine", "belarus", "nagorno-karabakh"],
  "Middle East": [
    "iran",
    "palestine",
    "iraq",
    "lebanon",
    "saudi-arabia",
    "syria",
    "yemen",
  ],
  Oceania: ["pacific-islands", "aboriginal-australians"],
};

function browsingRegion(crisis: Crisis): string {
  return (
    Object.entries(REGION_SLUGS).find(([, slugs]) =>
      slugs.includes(crisis.slug),
    )?.[0] ?? "Other regions"
  );
}

export default function CrisisGrid({ crises }: { crises: Crisis[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<CrisisStatus | "all">("all");
  const [region, setRegion] = useState("all");
  const regions = Array.from(new Set(crises.map(browsingRegion))).sort();
  const filtered = useMemo(
    () =>
      crises
        .filter((crisis) => {
          const matchesQuery = `${crisis.name} ${crisis.region}`
            .toLowerCase()
            .includes(query.trim().toLowerCase());
          return (
            matchesQuery &&
            (status === "all" || crisis.status === status) &&
            (region === "all" || browsingRegion(crisis) === region)
          );
        })
        .sort((a, b) => a.name.localeCompare(b.name)),
    [crises, query, status, region],
  );

  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
        Explore all crises
      </h2>
      <p className="mt-2 text-base text-gray-600">
        Search by country, community or affected area.
      </p>
      <div className="my-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr]">
        <label className="sm:col-span-2 lg:col-span-1">
          <span className="sr-only">Search crises</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search crises"
            className="min-h-12 w-full border border-gray-300 bg-white px-4 text-base"
          />
        </label>
        <label>
          <span className="sr-only">Filter by region</span>
          <select
            value={region}
            onChange={(event) => setRegion(event.target.value)}
            className="min-h-12 w-full border border-gray-300 bg-white px-4 text-base"
          >
            <option value="all">All regions</option>
            {regions.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Filter by status</span>
          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as CrisisStatus | "all")
            }
            className="min-h-12 w-full border border-gray-300 bg-white px-4 text-base"
          >
            <option value="all">All statuses</option>
            <option value="escalating">Escalating</option>
            <option value="active">Active</option>
            <option value="underreported">Underreported</option>
          </select>
        </label>
      </div>
      <p aria-live="polite" className="mb-4 text-sm text-gray-600">
        {filtered.length} of {crises.length} crises · A–Z
      </p>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((crisis) => (
          <Link
            key={crisis.slug}
            href={`/crises/${crisis.slug}`}
            className="flex flex-col items-start border border-gray-200 p-6 hover:border-gray-400 hover:bg-gray-50"
          >
            <StatusLabel status={crisis.status} />
            <h3 className="mt-4 text-xl font-semibold text-gray-900">
              {crisis.name}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              {crisis.region}
            </p>
            <p className="my-4 line-clamp-3 text-base leading-relaxed text-gray-700">
              {crisis.summary}
            </p>
            <span className="mt-auto text-sm font-medium text-gray-900">
              Read briefing <span aria-hidden="true">↗</span>
            </span>
          </Link>
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="border border-gray-200 p-8 text-center">
          <h3 className="text-lg font-semibold">No matching crises</h3>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setStatus("all");
              setRegion("all");
            }}
            className="mt-4 min-h-11 border border-gray-300 px-5 text-sm hover:bg-gray-50"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
