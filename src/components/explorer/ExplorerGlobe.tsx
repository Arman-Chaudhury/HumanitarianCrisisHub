"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import MobileFallback from "@/components/cinematic/MobileFallback";
import type { Crisis } from "@/types/crisis";

const Globe = dynamic(() => import("@/components/cinematic/CinematicGlobe"), {
  ssr: false,
  loading: () => <p className="p-8 text-sm text-gray-600">Loading globe…</p>,
});

interface ExplorerGlobeProps {
  crises: Crisis[];
  selectedSlug: string;
  onSelectCrisis: (slug: string) => void;
}

export default function ExplorerGlobe({
  crises,
  selectedSlug,
  onSelectCrisis,
}: ExplorerGlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(1);
  const zoomTargetRef = useRef(7.2);
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [mobile, setMobile] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Preserve the existing capability check: never mount Canvas without WebGL.
    let available = false;
    try {
      const probe = document.createElement("canvas");
      const context = probe.getContext("webgl2") || probe.getContext("webgl");
      available = Boolean(context);
      context?.getExtension("WEBGL_lose_context")?.loseContext();
    } catch {
      available = false;
    }
    setWebgl(available);

    const touchQuery = window.matchMedia(
      "(max-width: 767px), (pointer: coarse)",
    );
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreferences = () => {
      setMobile(touchQuery.matches);
      setReducedMotion(motionQuery.matches);
    };
    updatePreferences();
    touchQuery.addEventListener("change", updatePreferences);
    motionQuery.addEventListener("change", updatePreferences);

    const observer = new IntersectionObserver(([entry]) =>
      setVisible(entry.isIntersecting),
    );
    if (containerRef.current) observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      touchQuery.removeEventListener("change", updatePreferences);
      motionQuery.removeEventListener("change", updatePreferences);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative min-w-0 border-b border-gray-200 bg-[#F2F4F3] lg:border-b-0 lg:border-r"
      aria-label="Interactive crisis globe"
    >
      <div className="absolute left-5 top-5 z-10 pointer-events-none">
        <p className="text-sm font-semibold text-gray-900">
          Global crisis explorer
        </p>
        <p className="mt-1 text-xs text-gray-600">
          {crises.length} documented crises
        </p>
      </div>
      <div className="h-[430px] lg:h-[720px]">
        {webgl === null && (
          <p role="status" className="px-5 pt-24 text-sm text-gray-600">
            Preparing globe…
          </p>
        )}
        {webgl === false && (
          <div
            className="h-full overflow-y-auto px-5 pb-6 pt-20"
            data-lenis-prevent
          >
            <MobileFallback
              crises={crises}
              selectedSlug={selectedSlug}
              onSelectCrisis={onSelectCrisis}
              force
              live={false}
            />
          </div>
        )}
        {webgl === true && (
          <div
            className={`h-full w-full ${mobile ? "[&_canvas]:!touch-pan-y" : ""}`}
          >
            <Globe
              crises={crises}
              progressRef={progressRef}
              zoomTargetRef={zoomTargetRef}
              selectedSlug={selectedSlug}
              onSelectCrisis={onSelectCrisis}
              interactive
              lite
              allowDrag={!mobile}
              showLabels
              autoRotate={mobile && !reducedMotion}
              paused={!visible}
            />
          </div>
        )}
      </div>
      {webgl && (
        <div className="absolute inset-x-5 bottom-5 flex items-center justify-between gap-4">
          <p className="text-xs text-gray-600">
            {mobile
              ? "Tap a marker to explore"
              : "Drag to rotate · Select a marker"}
          </p>
          <div className="flex border border-gray-300 bg-white">
            <button
              type="button"
              aria-label="Zoom in"
              onClick={() => {
                zoomTargetRef.current = Math.max(
                  5,
                  zoomTargetRef.current * 0.82,
                );
              }}
              className="h-11 w-11 text-xl hover:bg-gray-100"
            >
              +
            </button>
            <button
              type="button"
              aria-label="Zoom out"
              onClick={() => {
                zoomTargetRef.current = Math.min(
                  10.5,
                  zoomTargetRef.current / 0.82,
                );
              }}
              className="h-11 w-11 border-l border-gray-300 text-xl hover:bg-gray-100"
            >
              −
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
