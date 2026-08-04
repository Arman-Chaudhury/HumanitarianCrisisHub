"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Crisis } from "@/types/crisis";
import MobileFallback from "./MobileFallback";
import CrisisTakeoverModal from "./CrisisTakeoverModal";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const CinematicGlobe = dynamic(() => import("./CinematicGlobe"), {
  ssr: false,
  loading: () => null,
});

import { ZOOM_MIN, ZOOM_MAX, ZOOM_DEFAULT } from "./CinematicGlobe";

/** Multiplicative zoom step per button press. */
const ZOOM_STEP = 0.82;

interface CinematicHeroProps {
  crises: Crisis[];
}

const LEGEND = [
  { status: "escalating", label: "Escalating", color: "#FFD166" },
  { status: "active", label: "Active Crisis", color: "#E63946" },
  { status: "underreported", label: "Underreported", color: "#D4580E" },
];

/* ── Scroll runway ─────────────────────────────────────────────────────────
 * Hero is 315vh tall, giving 215vh of actual scroll distance to play with.
 *
 *   progress 0.00 – 0.12  Stage A: pure horizon, title visible
 *   progress 0.12 – 0.30  Stage A→B: camera lerps to orbital, title fades,
 *                                     hotspots fade in
 *   progress 0.30 – 0.86  Stage B: orbital interactive, OrbitControls live —
 *                                     opens the moment the full sphere lands;
 *                                     runs long since the runway was shortened
 *   progress 0.86 – 1.00  Stage C: quick dim, legend fades, stats grid below
 *                                     comes into view
 */

export default function CinematicHero({ crises }: CinematicHeroProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const titleOverlayRef = useRef<HTMLDivElement>(null);
  const globeWrapRef = useRef<HTMLDivElement>(null);
  const legendRef = useRef<HTMLDivElement>(null);

  // Mutable progress — read by CinematicGlobe's CameraRig + Hotspots every frame.
  // We deliberately do NOT track this in React state to avoid 60fps re-renders.
  const progressRef = useRef(0);

  // Target camera distance for the interactive zoom buttons; reset each time
  // the user scrolls into Stage B so the globe always greets them at default.
  const zoomTargetRef = useRef(ZOOM_DEFAULT);
  const wasInteractiveRef = useRef(false);

  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [modalCrisis, setModalCrisis] = useState<Crisis | null>(null);
  const [interactive, setInteractive] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setEnabled(!isMobile && !reduce);

    // Warm the browser cache for the globe textures immediately — the WebGL
    // canvas mounts via dynamic import, and without this the big day map only
    // starts downloading after the whole Three.js bundle has loaded.
    if (!isMobile) {
      [
        "/textures/earth_day.jpg",
        "/textures/earth_night.jpg",
        "/textures/earth_specular.jpg",
        "/textures/earth_clouds.png",
        "/textures/earth_normal.jpg",
      ].forEach((src) => {
        const img = new Image();
        img.src = src;
      });
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const ctx = gsap.context(() => {
      // Initial state — globe canvas occupies the full viewport at scale 1.
      // CSS only kicks in for the late corner-shrink in Stage C.
      gsap.set(globeWrapRef.current, {
        scale: 1,
        xPercent: 0,
        yPercent: 0,
        opacity: 1,
      });
      gsap.set(legendRef.current, { opacity: 0, y: -8 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom bottom",
          // Higher scrub = more smoothing of progress. With Lenis driving
          // scroll, scrub: 1 is a good sweet spot for cinematic feel.
          scrub: 1,
          onUpdate: (self) => {
            progressRef.current = self.progress;
            const p = self.progress;
            // Interactive only during Stage B (with a small buffer at edges
            // so we don't toggle on every micro-scroll near the boundary).
            const nowInteractive = p > 0.3 && p < 0.86;
            if (nowInteractive && !wasInteractiveRef.current) {
              zoomTargetRef.current = ZOOM_DEFAULT;
            }
            wasInteractiveRef.current = nowInteractive;
            setInteractive(nowInteractive);
          },
        },
      });

      // Stage A→B — title + tagline + cue fade (driven on the timeline so
      // they ride scroll just like everything else).
      tl.to(
        titleRef.current,
        { opacity: 0, y: -80, ease: "power2.out", duration: 0.16 },
        0.08,
      );
      tl.to(
        taglineRef.current,
        { opacity: 0, y: -40, ease: "power2.out", duration: 0.14 },
        0.06,
      );
      tl.to(
        cueRef.current,
        { opacity: 0, ease: "power2.out", duration: 0.10 },
        0.04,
      );

      // Camera handoff (horizon → orbital) is owned by CameraRig in
      // CinematicGlobe — no GSAP needed for that.

      // Legend chip cluster fades in once we're firmly orbital.
      tl.to(
        legendRef.current,
        { opacity: 1, y: 0, duration: 0.10, ease: "power2.out" },
        0.30,
      );

      // Stage C — legend fades, but instead of shrinking the canvas to a corner
      // rectangle, the globe stays full-viewport and dims to act as a quiet
      // background while stats + crisis grid below take focus.
      tl.to(
        legendRef.current,
        { opacity: 0, duration: 0.06, ease: "power2.out" },
        0.86,
      );
      tl.to(
        globeWrapRef.current,
        {
          opacity: 0.28,
          ease: "power2.inOut",
          duration: 0.14,
        },
        0.86,
      );
    }, heroRef);

    return () => ctx.revert();
  }, [enabled]);

  const onSelectCrisis = (slug: string) => {
    if (selectedSlug === slug) {
      window.location.assign(`/crises/${slug}`);
      return;
    }
    setSelectedSlug(slug);
    const crisis = crises.find((c) => c.slug === slug) ?? null;
    setModalCrisis(crisis);
  };

  const closeModal = () => {
    setModalCrisis(null);
    setSelectedSlug(null);
  };

  return (
    <>
      {/* Mobile fallback */}
      <MobileFallback crises={crises} />

      {/* Desktop scroll runway — empty section that just gives the page enough
          scrollable distance for the choreography. The visible content
          (title, globe, legend) lives in fixed-position overlays below. */}
      <section
        ref={heroRef}
        className="relative hidden md:block"
        style={{ height: "315vh" }}
        aria-label="Cinematic crisis globe"
      />

      {/* Fixed-position WebGL canvas — full viewport. Camera Rig handles the
          horizon → orbital flow; CSS only handles the late corner shrink. */}
      {enabled && (
        <div
          ref={globeWrapRef}
          className="fixed inset-0 z-[2] hidden md:flex items-center justify-center"
          style={{
            pointerEvents: interactive ? "auto" : "none",
            transformOrigin: "50% 50%",
          }}
        >
          <div className="w-full h-full">
            <CinematicGlobe
              crises={crises}
              progressRef={progressRef}
              selectedSlug={selectedSlug}
              interactive={interactive}
              zoomTargetRef={zoomTargetRef}
              onSelectCrisis={onSelectCrisis}
            />
          </div>
        </div>
      )}

      {/* Fixed-position title overlay — the "EVERY CRISIS. REAL ACTION." card
          that hangs over the horizon during Stage A and fades during Stage A→B. */}
      {enabled && (
        <div
          ref={titleOverlayRef}
          className="fixed inset-x-0 top-0 z-[5] hidden md:flex flex-col items-center text-center px-4"
          style={{ height: "100vh", justifyContent: "center", pointerEvents: "none" }}
        >
          <h1
            ref={titleRef}
            className="font-display text-[clamp(56px,13vw,140px)] text-text-bright tracking-[0.06em] leading-[0.9] mb-3 drop-shadow-[0_2px_24px_rgba(0,0,0,0.6)]"
          >
            EVERY CRISIS.
            <br />
            <span className="text-crisis-red">REAL ACTION.</span>
          </h1>
          <p
            ref={taglineRef}
            className="font-sans text-base sm:text-lg text-text-body font-light max-w-[520px] mx-auto leading-relaxed drop-shadow-[0_1px_12px_rgba(0,0,0,0.5)]"
          >
            One website documenting global humanitarian crises — three clear
            paths to help:{" "}
            <strong className="text-text-bright font-medium">donate</strong>,{" "}
            <strong className="text-text-bright font-medium">amplify</strong>,
            and{" "}
            <strong className="text-text-bright font-medium">demand change</strong>.
          </p>
          <div
            ref={cueRef}
            className="mt-14 font-sans text-[10px] tracking-[0.36em] uppercase text-text-muted/80 animate-pulse"
          >
            Scroll ↓
          </div>
        </div>
      )}

      {/* Legend chips — visible during Stage B */}
      {enabled && (
        <div
          ref={legendRef}
          className="fixed top-24 left-1/2 -translate-x-1/2 z-[6] hidden md:flex gap-3 px-4 py-2 rounded-full bg-bg-deep/70 backdrop-blur-md border border-border"
          style={{ pointerEvents: "none" }}
        >
          {LEGEND.map((l) => (
            <span
              key={l.status}
              className="flex items-center gap-1.5 font-sans text-[10px] tracking-[0.18em] uppercase text-text-body"
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: l.color, boxShadow: `0 0 6px ${l.color}77` }}
              />
              {l.label}
            </span>
          ))}
        </div>
      )}

      {/* Zoom controls — only while the globe is interactive. Wheel stays
          reserved for page scroll, so zoom is button-driven. */}
      {enabled && interactive && (
        <div className="fixed bottom-10 right-10 z-[6] hidden md:flex flex-col items-center gap-2">
          <button
            type="button"
            aria-label="Zoom in"
            onClick={() => {
              zoomTargetRef.current = Math.max(ZOOM_MIN, zoomTargetRef.current * ZOOM_STEP);
            }}
            className="w-11 h-11 rounded-full bg-bg-deep/70 backdrop-blur-md border border-border text-text-bright text-xl leading-none hover:bg-bg-card-hover transition-colors"
          >
            +
          </button>
          <button
            type="button"
            aria-label="Zoom out"
            onClick={() => {
              zoomTargetRef.current = Math.min(ZOOM_MAX, zoomTargetRef.current / ZOOM_STEP);
            }}
            className="w-11 h-11 rounded-full bg-bg-deep/70 backdrop-blur-md border border-border text-text-bright text-xl leading-none hover:bg-bg-card-hover transition-colors"
          >
            −
          </button>
          <span className="mt-1 font-sans text-[9px] tracking-[0.28em] uppercase text-text-muted/80 select-none">
            Zoom
          </span>
        </div>
      )}

      {/* Takeover modal */}
      <CrisisTakeoverModal crisis={modalCrisis} onClose={closeModal} />
    </>
  );
}
