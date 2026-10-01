"use client";

import { useEffect, useState } from "react";
import type { Crisis } from "@/types/crisis";
import CinematicExplorer from "./CinematicExplorer";
import Explorer from "./Explorer";

/**
 * Must match the `cinematic` screen in tailwind.config.ts. CSS uses it to
 * choose the right layout before JavaScript runs, so the page never flashes
 * the wrong one.
 */
const CINEMATIC_QUERY =
  "(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

type Mode = "unknown" | "cinematic" | "plain";

function hasWebgl(): boolean {
  try {
    const probe = document.createElement("canvas");
    const context = probe.getContext("webgl2") || probe.getContext("webgl");
    context?.getExtension("WEBGL_lose_context")?.loseContext();
    return Boolean(context);
  } catch {
    return false;
  }
}

function PlainHome({ crises }: { crises: Crisis[] }) {
  return (
    <>
      <header className="mb-8 grid gap-5 lg:grid-cols-[2fr_1fr] lg:items-end">
        <div>
          <p className="mb-3 text-sm text-gray-600">
            Independent humanitarian reference
          </p>
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-gray-900 sm:text-4xl lg:text-[44px]">
            {crises.length} humanitarian crises.
            <span className="block font-normal">
              What is happening, and how to help.
            </span>
          </h1>
        </div>
        <p className="max-w-md text-base leading-relaxed text-gray-600">
          Explore sourced briefings and find organizations working with people
          affected by humanitarian emergencies.
        </p>
      </header>
      <Explorer crises={crises} />
    </>
  );
}

/**
 * Chooses between the full-screen opening that settles into the explorer and
 * the explorer on its own. The opening needs a desktop pointer, room on
 * screen, motion allowed, and WebGL.
 */
export default function HomeExperience({ crises }: { crises: Crisis[] }) {
  const [mode, setMode] = useState<Mode>("unknown");

  useEffect(() => {
    const query = window.matchMedia(CINEMATIC_QUERY);
    const webgl = hasWebgl();
    const update = () => setMode(query.matches && webgl ? "cinematic" : "plain");
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return (
    <>
      {mode !== "plain" && (
        <div className="hidden cinematic:block">
          <CinematicExplorer crises={crises} active={mode === "cinematic"} />
        </div>
      )}
      {mode !== "cinematic" && (
        <div className={mode === "unknown" ? "cinematic:hidden" : ""}>
          <PlainHome crises={crises} />
        </div>
      )}
    </>
  );
}
