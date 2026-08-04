"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function SmoothScrollProvider() {
  useEffect(() => {
    if (window.matchMedia("(max-width: 767px)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    // Push every Lenis scroll event into ScrollTrigger so the two stay in sync
    // — without this, ScrollTrigger reads stale scroll values when Lenis is
    // mid-tween and the camera/timeline animation looks choppy.
    lenis.on("scroll", ScrollTrigger.update);

    // Drive Lenis from GSAP's ticker instead of a separate requestAnimationFrame
    // loop. Running both off the same RAF eliminates the one-frame phase offset
    // that makes scroll-driven WebGL animation feel jittery.
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  return null;
}
