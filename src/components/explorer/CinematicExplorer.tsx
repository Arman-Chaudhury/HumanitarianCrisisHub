"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Crisis } from "@/types/crisis";
import {
  GLOBE_RADIUS,
  ORBITAL_DISTANCE,
  ORBITAL_FOV,
  ZOOM_MAX,
  ZOOM_MIN,
  type LabelBounds,
  type ViewShift,
} from "@/components/cinematic/constants";
import { fitDistance } from "@/components/cinematic/outlines";
import CrisisPanel from "./CrisisPanel";
import ExplorerLegend from "./ExplorerLegend";

const Globe = dynamic(() => import("@/components/cinematic/CinematicGlobe"), {
  ssr: false,
  loading: () => null,
});

/* ── The opening, as a function of scroll progress (0 to 1) ────────────────
 *
 *   0.00 – 0.15  Horizon view with the headline.
 *   0.15 – 0.50  Camera pulls back to the whole globe. Headline fades.
 *   0.50 – 0.68  Full-screen globe. Drag to rotate, select a marker.
 *   0.68 – 0.98  Globe slides into the explorer frame. Panel arrives.
 *
 * One canvas is used throughout. It never changes size: the globe is moved
 * by shifting the camera's view, and the canvas is clipped to the frame.
 */
const RUNWAY_SCREENS = 0.8;
const FLY_START = 0.15;
const FLY_END = 0.5;
const SETTLE_START = 0.68;
const SETTLE_END = 0.98;

/** Share of the frame's smaller side that the globe's radius occupies. */
const SETTLED_RADIUS_SHARE = 0.4;
const ZOOM_STEP = 0.82;
/** Zoom is a factor on the settled distance; the floor lets a click frame a small country. */
const ZOOM_FACTOR_MIN = 0.28;
const ZOOM_FACTOR_MAX = 1.3;

interface Metrics {
  /** Scroll position at which the stage becomes pinned. */
  start: number;
  /** Scroll distance over which progress runs from 0 to 1. */
  distance: number;
  stageWidth: number;
  stageHeight: number;
  /** Gap between each stage edge and the globe's slot in the frame. */
  inset: { top: number; right: number; bottom: number; left: number };
  shift: ViewShift;
  settledDistance: number;
  /** Slot height over stage height: how much of the canvas the frame shows. */
  frameShare: number;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

function smoothstep(from: number, to: number, value: number): number {
  const t = clamp((value - from) / (to - from), 0, 1);
  return t * t * (3 - 2 * t);
}

/** Maps page progress onto the 0 to 1 range the globe's camera rig expects. */
function cameraProgress(progress: number): number {
  if (progress < FLY_START) return (progress / FLY_START) * 0.12;
  if (progress < FLY_END) {
    return 0.12 + ((progress - FLY_START) / (FLY_END - FLY_START)) * 0.18;
  }
  return 1;
}

interface CinematicExplorerProps {
  crises: Crisis[];
  /** False during server rendering and hydration: the shell shows, no canvas. */
  active: boolean;
}

export default function CinematicExplorer({
  crises,
  active,
}: CinematicExplorerProps) {
  const runwayRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const nightRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLParagraphElement>(null);

  // Values read by the WebGL scene every frame. Refs, not state, so that
  // scrolling never triggers a React render.
  const progressRef = useRef(0);
  const zoomTargetRef = useRef(ORBITAL_DISTANCE);
  const zoomFactorRef = useRef(1);
  const viewShiftRef = useRef<ViewShift>({ x: 0, y: 0 });
  const labelBoundsRef = useRef<LabelBounds | null>(null);
  const metricsRef = useRef<Metrics | null>(null);

  const [selectedSlug, setSelectedSlug] = useState(
    crises.find((crisis) => crisis.slug === "sudan")?.slug ?? crises[0]?.slug,
  );
  const [interactive, setInteractive] = useState(false);
  const [settled, setSettled] = useState(false);
  const [inView, setInView] = useState(true);
  const [headerHeight, setHeaderHeight] = useState(50);
  // Viewport width without the scrollbar. `100vw` includes it and would
  // make the page a few pixels wider than the window.
  const [viewportWidth, setViewportWidth] = useState<number | null>(null);
  const interactiveRef = useRef(false);
  const settledRef = useRef(false);

  const selected = crises.find((crisis) => crisis.slug === selectedSlug);

  /* ── Measure the layout. Runs on mount and whenever the stage resizes. ── */
  const measure = useCallback(() => {
    const runway = runwayRef.current;
    const stage = stageRef.current;
    const slot = slotRef.current;
    if (!runway || !stage || !slot) return;

    const header = document.querySelector("body > header");
    const measuredHeader =
      header instanceof HTMLElement ? header.offsetHeight : 0;
    setHeaderHeight(measuredHeader);
    setViewportWidth(document.documentElement.clientWidth);

    const stageBox = stage.getBoundingClientRect();
    const slotBox = slot.getBoundingClientRect();
    const inset = {
      top: slotBox.top - stageBox.top,
      right: stageBox.right - slotBox.right,
      bottom: stageBox.bottom - slotBox.bottom,
      left: slotBox.left - stageBox.left,
    };
    const slotCentreX = inset.left + slotBox.width / 2;
    const slotCentreY = inset.top + slotBox.height / 2;
    const radius =
      SETTLED_RADIUS_SHARE * Math.min(slotBox.width, slotBox.height);
    const halfFov = (ORBITAL_FOV * Math.PI) / 360;

    metricsRef.current = {
      start:
        runway.getBoundingClientRect().top + window.scrollY - measuredHeader,
      distance: Math.max(1, runway.offsetHeight - stage.offsetHeight),
      stageWidth: stageBox.width,
      stageHeight: stageBox.height,
      inset,
      shift: {
        x: stageBox.width / 2 - slotCentreX,
        y: stageBox.height / 2 - slotCentreY,
      },
      settledDistance: clamp(
        (GLOBE_RADIUS * (stageBox.height / 2)) / (Math.tan(halfFov) * radius),
        ZOOM_MIN,
        ZOOM_MAX,
      ),
      frameShare: slotBox.height / stageBox.height,
    };

    if (controlsRef.current) {
      const controls = controlsRef.current.style;
      controls.top = `${inset.top}px`;
      controls.left = `${inset.left}px`;
      controls.width = `${slotBox.width}px`;
      controls.height = `${slotBox.height}px`;
    }
  }, []);

  useEffect(() => {
    measure();
    const observer = new ResizeObserver(measure);
    if (stageRef.current) observer.observe(stageRef.current);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  /* ── Stop all work once the opening has scrolled out of view. ── */
  useEffect(() => {
    const runway = runwayRef.current;
    if (!runway) return;
    const observer = new IntersectionObserver(([entry]) =>
      setInView(entry.isIntersecting),
    );
    observer.observe(runway);
    return () => observer.disconnect();
  }, []);

  /* ── Apply one frame of the opening for a given progress. ── */
  const apply = useCallback((progress: number) => {
    const metrics = metricsRef.current;
    if (!metrics) return;

    const intro = 1 - smoothstep(0.06, 0.3, progress);
    const hint =
      smoothstep(0.42, 0.52, progress) *
      (1 - smoothstep(0.62, 0.72, progress));
    const settle = smoothstep(SETTLE_START, SETTLE_END, progress);
    const { inset, shift, stageWidth, stageHeight } = metrics;

    // Scene
    progressRef.current = cameraProgress(progress);
    viewShiftRef.current.x = shift.x * settle;
    viewShiftRef.current.y = shift.y * settle;
    zoomTargetRef.current = clamp(
      (ORBITAL_DISTANCE +
        (metrics.settledDistance - ORBITAL_DISTANCE) * settle) *
        zoomFactorRef.current,
      ZOOM_MIN,
      ZOOM_MAX,
    );
    labelBoundsRef.current =
      settle > 0.02
        ? {
            left: inset.left * settle,
            right: stageWidth - inset.right * settle,
            top: inset.top * settle,
            bottom: stageHeight - inset.bottom * settle,
          }
        : null;

    // Page
    if (headlineRef.current) {
      headlineRef.current.style.opacity = String(intro);
      headlineRef.current.style.transform = `translateY(${(1 - intro) * -32}px)`;
      headlineRef.current.style.visibility = intro < 0.01 ? "hidden" : "visible";
    }
    if (hintRef.current) hintRef.current.style.opacity = String(hint);
    if (nightRef.current) nightRef.current.style.opacity = String(1 - settle);
    if (frameRef.current) frameRef.current.style.opacity = String(settle);
    if (controlsRef.current) controlsRef.current.style.opacity = String(settle);
    if (panelRef.current) {
      panelRef.current.style.transform = `translateX(${(1 - settle) * 32}px)`;
    }
    if (canvasRef.current) {
      canvasRef.current.style.clipPath = `inset(${inset.top * settle}px ${
        inset.right * settle
      }px ${inset.bottom * settle}px ${inset.left * settle}px)`;
    }

    // State changes only when a threshold is crossed.
    const nextInteractive = progress >= FLY_END;
    if (nextInteractive !== interactiveRef.current) {
      interactiveRef.current = nextInteractive;
      setInteractive(nextInteractive);
    }
    const nextSettled = settle > 0.9;
    if (nextSettled !== settledRef.current) {
      settledRef.current = nextSettled;
      setSettled(nextSettled);
      // Leaving the explorer drops any click-driven zoom, so scrolling back
      // down lands on the standard view rather than a close-up.
      if (!nextSettled) zoomFactorRef.current = 1;
    }
  }, []);

  /* ── Follow the scroll position, eased, once per animation frame. ── */
  useEffect(() => {
    if (!active || !inView) return;

    let frame = 0;
    let previous = performance.now();
    let smoothed: number | null = null;

    const tick = (now: number) => {
      const elapsed = Math.min(0.1, (now - previous) / 1000);
      previous = now;
      const metrics = metricsRef.current;
      if (metrics) {
        const target = clamp(
          (window.scrollY - metrics.start) / metrics.distance,
          0,
          1,
        );
        smoothed =
          smoothed === null
            ? target
            : smoothed + (target - smoothed) * (1 - Math.pow(0.0005, elapsed));
        apply(smoothed);
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, inView, apply]);

  /* ── The hidden frame must not take keyboard focus. ── */
  useEffect(() => {
    if (frameRef.current) frameRef.current.inert = !settled;
  }, [settled]);

  const selectCrisis = useCallback((slug: string) => {
    setSelectedSlug(slug);
    const metrics = metricsRef.current;
    if (!metrics) return;
    const end = metrics.start + metrics.distance;
    if (window.scrollY < end - 4) {
      window.scrollTo({ top: end, behavior: "smooth" });
    }
  }, []);

  /* ── A clicked marker reports how big its outline is; pick the distance
   * that frames it in the slot and store it as a factor so the per-frame
   * zoom update and the buttons keep working from there. ── */
  const focusExtent = useCallback((extent: number) => {
    const metrics = metricsRef.current;
    if (!metrics) return;
    zoomFactorRef.current = clamp(
      fitDistance(extent, metrics.frameShare) / metrics.settledDistance,
      ZOOM_FACTOR_MIN,
      ZOOM_FACTOR_MAX,
    );
  }, []);

  const zoom = (factor: number) => {
    zoomFactorRef.current = clamp(
      zoomFactorRef.current * factor,
      ZOOM_FACTOR_MIN,
      ZOOM_FACTOR_MAX,
    );
  };

  if (!selected) return null;

  return (
    <section
      ref={runwayRef}
      aria-label="Crisis explorer"
      className="relative left-1/2 -mt-8 w-screen -translate-x-1/2"
      style={{
        width: viewportWidth ?? undefined,
        height: `calc(100vh - ${headerHeight}px + ${RUNWAY_SCREENS * 100}vh)`,
      }}
    >
      <div
        ref={stageRef}
        className="sticky overflow-hidden bg-white"
        style={{
          top: headerHeight,
          height: `calc(100vh - ${headerHeight}px)`,
        }}
      >
        <div ref={nightRef} className="absolute inset-0 bg-globe-night" />

        {/* The explorer frame. Hidden until the globe settles into it. */}
        <div
          ref={frameRef}
          className={`absolute inset-0 opacity-0 ${settled ? "" : "pointer-events-none"}`}
        >
          <div className="mx-auto flex h-full max-w-[1280px] flex-col px-5 py-5 sm:px-7">
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden border border-gray-200 bg-white">
              <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
                <div
                  ref={slotRef}
                  className="border-r border-gray-200 bg-globe-day"
                />
                <aside
                  ref={panelRef}
                  aria-label="Selected crisis"
                  className="min-h-0 overflow-y-auto bg-white p-6"
                >
                  <CrisisPanel crisis={selected} />
                </aside>
              </div>
              <ExplorerLegend />
            </div>
          </div>
        </div>

        {/* One canvas for the whole opening. */}
        <div ref={canvasRef} className="absolute inset-0 z-10">
          {active && (
            <Globe
              crises={crises}
              progressRef={progressRef}
              zoomTargetRef={zoomTargetRef}
              viewShiftRef={viewShiftRef}
              labelBoundsRef={labelBoundsRef}
              selectedSlug={selected.slug}
              onSelectCrisis={selectCrisis}
              onFocusExtent={focusExtent}
              interactive={interactive}
              autoRotate={!settled}
              paused={!inView}
              allowDrag
              showLabels
            />
          )}
        </div>

        {/* Labels and zoom buttons that sit over the globe's slot. */}
        <div
          ref={controlsRef}
          className="pointer-events-none absolute z-20 opacity-0"
        >
          <div className="absolute left-5 top-5">
            <p className="text-sm font-semibold text-gray-900">
              Global crisis explorer
            </p>
            <p className="mt-1 text-xs text-gray-600">
              {crises.length} documented crises
            </p>
          </div>
          <div className="absolute inset-x-5 bottom-5 flex items-center justify-between gap-4">
            <p className="text-xs text-gray-600">
              Drag to rotate · Select a marker
            </p>
            <div
              className={`flex border border-gray-300 bg-white ${settled ? "pointer-events-auto" : ""}`}
            >
              <button
                type="button"
                aria-label="Zoom in"
                tabIndex={settled ? 0 : -1}
                onClick={() => zoom(ZOOM_STEP)}
                className="h-11 w-11 text-xl hover:bg-gray-100"
              >
                +
              </button>
              <button
                type="button"
                aria-label="Zoom out"
                tabIndex={settled ? 0 : -1}
                onClick={() => zoom(1 / ZOOM_STEP)}
                className="h-11 w-11 border-l border-gray-300 text-xl hover:bg-gray-100"
              >
                −
              </button>
            </div>
          </div>
        </div>

        <div
          ref={headlineRef}
          className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-start px-6 pt-12 text-center"
        >
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-gray-900 xl:text-[52px]">
            {crises.length} Humanitarian Crises
            <span className="block font-normal">
              What is happening, and how to help.
            </span>
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-gray-700">
            Sourced briefings on humanitarian emergencies, with organizations
            working alongside the people affected.
          </p>
          <p className="mt-4 text-sm text-gray-500">Scroll to explore</p>
        </div>

        <p
          ref={hintRef}
          className="pointer-events-none absolute inset-x-0 bottom-8 z-20 text-center text-sm text-gray-600 opacity-0"
        >
          Drag to rotate. Select a marker, or keep scrolling.
        </p>
      </div>
    </section>
  );
}
