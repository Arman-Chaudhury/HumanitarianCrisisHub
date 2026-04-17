"use client";

import Link from "next/link";
import { useRef, useState, useEffect, useCallback } from "react";
import type { Crisis } from "@/types/crisis";

interface CrisisNavPillsProps {
  crises: Crisis[];
  currentSlug: string;
}

export default function CrisisNavPills({ crises, currentSlug }: CrisisNavPillsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll]);

  // Scroll active pill into center on mount / slug change
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const active = el.querySelector("[data-active='true']") as HTMLElement | null;
    if (active) {
      const offset = active.offsetLeft - el.clientWidth / 2 + active.offsetWidth / 2;
      el.scrollLeft = Math.max(0, offset);
    }
    // Defer so layout has settled before we measure
    const id = requestAnimationFrame(checkScroll);
    return () => cancelAnimationFrame(id);
  }, [currentSlug, checkScroll]);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
  };

  return (
    <div className="relative mb-11 animate-fade-up-1">
      {/* Left fade + arrow */}
      <div
        className="absolute left-0 top-0 bottom-0 z-10 flex items-center transition-opacity duration-200"
        style={{ opacity: canScrollLeft ? 1 : 0, pointerEvents: canScrollLeft ? "auto" : "none" }}
      >
        <div
          className="absolute left-0 top-0 bottom-0 w-14 pointer-events-none"
          style={{ background: "linear-gradient(to right, #161412 40%, transparent)" }}
        />
        <button
          onClick={() => scroll("left")}
          aria-label="Scroll left"
          className="relative z-10 w-6 h-6 flex items-center justify-center text-xl leading-none text-text-dim hover:text-text-bright transition-colors"
        >
          ‹
        </button>
      </div>

      {/* Scrollable pill row */}
      <div
        ref={scrollRef}
        className="flex gap-2.5 overflow-x-auto px-8"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <style>{`div::-webkit-scrollbar { display: none; }`}</style>
        {crises.map((c) => (
          <Link
            key={c.slug}
            href={`/crises/${c.slug}`}
            data-active={c.slug === currentSlug ? "true" : undefined}
            className={`flex-none px-[18px] py-2 rounded font-sans text-[13px] font-medium tracking-tight border transition-all duration-300 ${
              c.slug === currentSlug
                ? "text-text-bright border-crisis-red bg-crisis-red-dim shadow-[0_0_16px_rgba(230,57,70,0.09)]"
                : "text-text-dim border-border hover:text-text-muted hover:border-border-hard"
            }`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {/* Right fade + arrow */}
      <div
        className="absolute right-0 top-0 bottom-0 z-10 flex items-center transition-opacity duration-200"
        style={{ opacity: canScrollRight ? 1 : 0, pointerEvents: canScrollRight ? "auto" : "none" }}
      >
        <div
          className="absolute right-0 top-0 bottom-0 w-14 pointer-events-none"
          style={{ background: "linear-gradient(to left, #161412 40%, transparent)" }}
        />
        <button
          onClick={() => scroll("right")}
          aria-label="Scroll right"
          className="relative z-10 w-6 h-6 flex items-center justify-center text-xl leading-none text-text-dim hover:text-text-bright transition-colors"
        >
          ›
        </button>
      </div>
    </div>
  );
}
