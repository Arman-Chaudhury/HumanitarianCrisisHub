"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export interface HomeStatItem {
  value: string;
  label: string;
}

interface HomeStatsProps {
  stats: HomeStatItem[];
}

/**
 * Stats grid revealed when the user scrolls past the globe section.
 * Each cell staggers in (50ms between cells) and the numeric portion of the
 * value counts up from 0 over 1.5s with power3.out easing.
 *
 * Values may include suffixes ("10M+", "96%", "1.8M") — we parse the leading
 * number, animate it, and re-render with the original suffix preserved.
 */
function parseValue(raw: string): { num: number; prefix: string; suffix: string; decimals: number } {
  const match = raw.match(/^(\D*)(-?\d*\.?\d+)(.*)$/);
  if (!match) return { num: 0, prefix: "", suffix: raw, decimals: 0 };
  const [, prefix, numStr, suffix] = match;
  const num = parseFloat(numStr);
  const decimals = numStr.includes(".") ? numStr.split(".")[1].length : 0;
  return { num, prefix, suffix, decimals };
}

export default function HomeStats({ stats }: HomeStatsProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const cells = Array.from(root.querySelectorAll<HTMLDivElement>("[data-cell]"));
    const valueEls = Array.from(root.querySelectorAll<HTMLDivElement>("[data-value]"));

    gsap.set(cells, { opacity: 0, y: 24 });

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top 85%",
          once: true,
        },
      });

      tl.to(cells, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out",
        stagger: 0.05,
      });

      valueEls.forEach((el) => {
        const raw = el.dataset.value ?? "";
        const { num, prefix, suffix, decimals } = parseValue(raw);
        const counter = { v: 0 };
        tl.to(
          counter,
          {
            v: num,
            duration: 1.5,
            ease: "power3.out",
            onUpdate: () => {
              el.textContent = prefix + counter.v.toFixed(decimals) + suffix;
            },
          },
          "<",
        );
      });
    }, root);

    return () => ctx.revert();
  }, [stats]);

  return (
    <div
      ref={rootRef}
      className="grid mb-12 mt-4"
      style={{ gridTemplateColumns: `repeat(${Math.min(stats.length, 4)}, 1fr)` }}
    >
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          data-cell
          className="relative py-7 text-center border-t border-b border-border-hard"
        >
          {i < stats.length - 1 && (
            <div className="absolute right-0 top-[18%] h-[64%] w-px bg-border hidden sm:block" />
          )}
          <div
            data-value={stat.value}
            className="font-display text-[clamp(28px,4vw,42px)] text-text-bright tracking-wider leading-none mb-2"
          >
            0
          </div>
          <div className="font-sans text-[11px] font-medium text-text-dim uppercase tracking-widest">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}
