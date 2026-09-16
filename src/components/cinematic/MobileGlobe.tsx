"use client";

import { useRef } from "react";
import type { Crisis } from "@/types/crisis";
import CinematicGlobe, { ZOOM_DEFAULT } from "./CinematicGlobe";

interface MobileGlobeProps {
  crises: Crisis[];
  selectedSlug: string | null;
  onSelectCrisis: (slug: string) => void;
}

/**
 * Phone/tablet globe: the same WebGL Earth in a lighter profile — day map
 * only, orbital camera from the start, auto-rotating, hotspots tappable.
 * No drag controls so the page keeps scrolling when you swipe across it.
 */
export default function MobileGlobe({ crises, selectedSlug, onSelectCrisis }: MobileGlobeProps) {
  // Always "past the intro": hotspots fully visible, interaction live.
  const progressRef = useRef(1);
  const zoomTargetRef = useRef(ZOOM_DEFAULT * 0.86); // a little closer on small screens

  return (
    <div className="w-full h-full [&_canvas]:!touch-pan-y">
      <CinematicGlobe
        crises={crises}
        progressRef={progressRef}
        selectedSlug={selectedSlug}
        interactive
        zoomTargetRef={zoomTargetRef}
        onSelectCrisis={onSelectCrisis}
        lite
        allowDrag={false}
        showLabels={false}
      />
    </div>
  );
}
