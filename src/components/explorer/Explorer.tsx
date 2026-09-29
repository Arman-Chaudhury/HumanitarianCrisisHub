"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Crisis } from "@/types/crisis";
import MobileFallback from "@/components/cinematic/MobileFallback";
import CrisisPanel from "./CrisisPanel";
import StatusLabel from "./StatusLabel";
import useExplorerMode from "./useExplorerMode";

const Globe = dynamic(() => import("@/components/cinematic/CinematicGlobe"), {
  ssr: false,
  loading: () => (
    <p role="status" className="p-6 text-sm text-text-muted">
      Loading globe…
    </p>
  ),
});

const TRANSITION_VIEWPORTS = 0.75;

export default function Explorer({ crises }: { crises: Crisis[] }) {
  const mode = useExplorerMode();
  const [selectedSlug, setSelectedSlug] = useState(
    crises.find((crisis) => crisis.slug === "sudan")?.slug ?? crises[0]?.slug,
  );
  const selected = crises.find((crisis) => crisis.slug === selectedSlug);
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const continueRef = useRef<HTMLButtonElement>(null);
  const focusPanelRef = useRef(false);
  const transitionRef = useRef(0);
  const labelScaleRef = useRef(1);
  const progressRef = useRef(1);
  const zoomTargetRef = useRef(7.2);
  const [visible, setVisible] = useState(true);
  const [documentVisible, setDocumentVisible] = useState(true);

  // Resize only when viewport geometry changes. Scroll changes compositing only.
  useEffect(() => {
    if (!mode.ready) return;
    const section = sectionRef.current;
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const intro = introRef.current;
    const panel = panelRef.current;
    if (!section || !stage || !canvas || !panel) return;
    let frame = 0;
    let start = 0;
    let distance = 1;
    let width = 0;

    const paint = () => {
      frame = 0;
      const progress = mode.opening
        ? Math.min(1, Math.max(0, (window.scrollY - start) / distance))
        : 1;
      transitionRef.current = progress;
      const eased = progress * progress * (3 - 2 * progress);
      const scale = mode.opening ? 1 - 0.34 * eased : 1;
      labelScaleRef.current = scale;
      canvas.style.setProperty("--globe-label-size", `${12 / scale}px`);
      canvas.style.transform = mode.opening
        ? `translate3d(${width * (0.16 - 0.35 * eased)}px, 0, 0) scale(${scale})`
        : "none";
      canvas.dataset.transitionProgress = progress.toFixed(3);

      if (intro) {
        intro.style.opacity = String(Math.max(0, 1 - progress * 3));
        intro.style.visibility = progress < 0.34 ? "visible" : "hidden";
        if (progress >= 0.34 && intro.contains(document.activeElement)) {
          section.focus({ preventScroll: true });
        }
        intro.inert = progress >= 0.34;
      }
      const ready = progress >= 0.999;
      panel.style.opacity = mode.opening
        ? String(Math.min(1, Math.max(0, (progress - 0.6) / 0.4)))
        : "1";
      panel.style.visibility =
        !mode.opening || progress > 0.6 ? "visible" : "hidden";
      if (!ready && panel.contains(document.activeElement)) {
        section.focus({ preventScroll: true });
      }
      panel.inert = !ready;
      panel.setAttribute("aria-hidden", String(!ready));
      if (ready && focusPanelRef.current) {
        panel
          .querySelector<HTMLElement>("[data-selected-heading]")
          ?.focus({ preventScroll: true });
        focusPanelRef.current = false;
      }
    };

    const measure = () => {
      const headerHeight =
        document.querySelector<HTMLElement>("[data-site-header]")
          ?.offsetHeight ?? 60;
      width = document.documentElement.clientWidth;
      const height = Math.max(420, window.innerHeight - headerHeight);
      distance = window.innerHeight * TRANSITION_VIEWPORTS;
      if (mode.opening) {
        section.style.width = `${width}px`;
        section.style.height = `${height + distance}px`;
        stage.style.height = `${height}px`;
        stage.style.top = `${headerHeight}px`;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
      } else {
        [section, stage, canvas].forEach((element) => {
          element.style.removeProperty("width");
          element.style.removeProperty("height");
        });
        stage.style.removeProperty("top");
      }
      start =
        section.getBoundingClientRect().top + window.scrollY - headerHeight;
      paint();
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
    };
  }, [mode.ready, mode.opening]);

  useEffect(() => {
    if (!mode.ready || !canvasRef.current) return;
    const observer = new IntersectionObserver(([entry]) =>
      setVisible(entry.isIntersecting),
    );
    observer.observe(canvasRef.current);
    const update = () => setDocumentVisible(!document.hidden);
    update();
    document.addEventListener("visibilitychange", update);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, [mode.ready]);

  const enterExplorer = useCallback(() => {
    if (!mode.opening || !sectionRef.current) return;
    const headerHeight =
      document.querySelector<HTMLElement>("[data-site-header]")?.offsetHeight ??
      60;
    const top =
      sectionRef.current.getBoundingClientRect().top +
      window.scrollY -
      headerHeight;
    focusPanelRef.current = true;
    window.scrollTo({
      top: top + window.innerHeight * TRANSITION_VIEWPORTS,
      behavior: "smooth",
    });
  }, [mode.opening]);

  const selectCrisis = (slug: string) => {
    setSelectedSlug(slug);
    if (transitionRef.current < 0.999) enterExplorer();
  };

  if (!selected) return null;
  if (!mode.ready) {
    return (
      <div
        role="status"
        aria-busy="true"
        className="flex min-h-[60svh] items-center justify-center text-sm text-text-muted"
      >
        Preparing crisis explorer…
      </div>
    );
  }

  return (
    <>
      {!mode.opening && (
        <header className="mb-7">
          <p className="mb-3 text-sm text-text-muted">
            Independent humanitarian reference
          </p>
          <h1 className="max-w-3xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            {crises.length} humanitarian crises. What is happening, and how to
            help.
          </h1>
        </header>
      )}
      <section
        ref={sectionRef}
        tabIndex={-1}
        aria-label="Global crisis explorer"
        data-explorer-mode={mode.opening ? "opening" : "direct"}
        className={
          mode.opening
            ? "relative left-1/2 -mt-8 -translate-x-1/2"
            : "relative border border-border"
        }
      >
        <div
          ref={stageRef}
          className={
            mode.opening
              ? "sticky overflow-hidden bg-institution-canvas"
              : "grid min-w-0 bg-institution-canvas lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]"
          }
        >
          <div
            ref={canvasRef}
            className={
              mode.opening
                ? "absolute left-0 top-0 origin-center will-change-transform"
                : "relative h-[430px] min-w-0 lg:h-[720px]"
            }
          >
            {mode.webgl ? (
              <Globe
                crises={crises}
                progressRef={progressRef}
                zoomTargetRef={zoomTargetRef}
                selectedSlug={selected.slug}
                onSelectCrisis={selectCrisis}
                interactive
                lite={mode.touch}
                allowDrag={!mode.touch}
                showLabels
                autoRotate={false}
                paused={!visible || !documentVisible}
                labelScaleRef={labelScaleRef}
              />
            ) : (
              <div className="h-full overflow-y-auto p-5">
                <MobileFallback
                  crises={crises}
                  selectedSlug={selected.slug}
                  onSelectCrisis={selectCrisis}
                  force
                  live={false}
                />
              </div>
            )}
          </div>
          {mode.opening && (
            <header
              ref={introRef}
              className="pointer-events-none absolute left-[5%] top-[12%] z-40 max-w-[32%]"
            >
              <p className="mb-4 text-sm text-text-muted">
                Independent humanitarian reference
              </p>
              <h1 className="text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">
                {crises.length} humanitarian crises.
              </h1>
              <p className="mt-5 max-w-sm text-xl leading-relaxed text-text-body">
                What is happening, and how to help.
              </p>
              <button
                ref={continueRef}
                type="button"
                onClick={enterExplorer}
                className="pointer-events-auto mt-8 min-h-11 border border-border-hard bg-white px-5 py-3 text-sm font-medium hover:bg-bg-deep"
              >
                Explore the crises <span aria-hidden="true">↓</span>
              </button>
              <p className="mt-4 text-sm text-text-muted">
                Scroll, or select a location on the globe.
              </p>
            </header>
          )}
          <aside
            ref={panelRef}
            aria-label="Selected crisis"
            aria-hidden={mode.opening}
            className={
              mode.opening
                ? "invisible absolute bottom-6 right-[4%] top-6 z-40 w-[34%] overflow-y-auto border border-border bg-white p-6 opacity-0"
                : "min-w-0 border-t border-border bg-white p-6 lg:max-h-[720px] lg:overflow-y-auto lg:border-l lg:border-t-0"
            }
          >
            <CrisisPanel crisis={selected} />
          </aside>
          {mode.webgl && (
            <div
              className={
                mode.opening
                  ? "absolute bottom-6 left-[5%] z-40 flex items-center gap-5"
                  : "absolute left-5 top-4 z-40 flex items-center gap-4"
              }
            >
              <div className="flex border border-border-hard bg-white">
                <button
                  type="button"
                  aria-label="Zoom in"
                  onClick={() => {
                    zoomTargetRef.current = Math.max(
                      5,
                      zoomTargetRef.current * 0.82,
                    );
                  }}
                  className="h-11 w-11 text-xl hover:bg-bg-deep"
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
                  className="h-11 w-11 border-l border-border-hard text-xl hover:bg-bg-deep"
                >
                  −
                </button>
              </div>
              <span className="text-xs text-text-muted">
                {mode.touch
                  ? "Tap a location"
                  : "Drag to rotate · Scroll to explore"}
              </span>
            </div>
          )}
        </div>
      </section>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border py-5">
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          <StatusLabel status="escalating" />
          <StatusLabel status="active" />
          <StatusLabel status="underreported" />
        </div>
        <Link
          href="/methodology"
          className="text-sm text-text-muted underline underline-offset-4"
        >
          How we classify crises
        </Link>
      </div>
    </>
  );
}
