"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import type { Crisis, ReliefWebItem } from "@/types/crisis";
import { getStatusColor } from "@/lib/statusColors";
import reliefweb from "@/data/reliefweb.json";

const STATUS_LABELS: Record<string, string> = {
  active: "Active Crisis",
  escalating: "Escalating",
  underreported: "Underreported",
};

interface CrisisTakeoverModalProps {
  crisis: Crisis | null;
  onClose: () => void;
}

/**
 * Slides up from the bottom (translateY 100% → 0, ~600ms power3.out). ESC and
 * the X button both close. "Read full" navigates to the dedicated crisis page.
 */
export default function CrisisTakeoverModal({ crisis, onClose }: CrisisTakeoverModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!crisis) return;

    if (overlayRef.current) {
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.25, ease: "power2.out" },
      );
    }
    if (panelRef.current) {
      gsap.fromTo(
        panelRef.current,
        { yPercent: 100 },
        { yPercent: 0, duration: 0.6, ease: "power3.out" },
      );
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [crisis, onClose]);

  if (!crisis) return null;

  const color = getStatusColor(crisis.status);
  const photos = crisis.photos ?? [];
  const credits = crisis.photoCredits ?? [];
  const updates: ReliefWebItem[] =
    (reliefweb.crises as Record<string, ReliefWebItem[]>)[crisis.slug] ?? [];

  const goToFullPage = () => router.push(`/crises/${crisis.slug}`);

  return (
    <div className="fixed inset-0 z-[100]" data-lenis-prevent>
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />

      <div
        ref={panelRef}
        className="absolute left-0 right-0 bottom-0 max-h-[88vh] overflow-y-auto bg-bg-deep border-t border-border-hard"
        role="dialog"
        aria-modal="true"
      >
        <div className="relative max-w-[920px] mx-auto px-5 sm:px-7 py-9">
          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 rounded-full border border-border-hard text-text-bright hover:bg-bg-card-hover transition-colors flex items-center justify-center"
          >
            <span aria-hidden className="text-lg leading-none">×</span>
          </button>

          {/* Status badge */}
          <div className="inline-flex items-center gap-2 mb-3.5">
            <span
              className="w-2 h-2 rounded-sm"
              style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}55` }}
            />
            <span
              className="font-sans text-[11px] font-semibold tracking-[0.18em] uppercase"
              style={{ color }}
            >
              {STATUS_LABELS[crisis.status] ?? crisis.status}
            </span>
          </div>

          <h2 className="font-display text-[clamp(40px,7vw,72px)] text-text-bright tracking-[0.05em] leading-[0.95] mb-2">
            {crisis.name.toUpperCase()}
          </h2>
          <p className="font-serif italic text-base text-text-muted tracking-wide mb-6">
            {crisis.region}
          </p>

          <p className="font-sans text-[16px] font-light leading-[1.75] text-text-body max-w-[640px] pl-5 border-l-[3px] mb-7"
             style={{ borderColor: color }}>
            {crisis.summary}
          </p>

          {/* Photos / placeholders */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-7">
            {(photos.length > 0 ? photos : [null, null, null]).slice(0, 5).map((src, i) => (
              <div
                key={i}
                className="relative aspect-[4/3] rounded-sm overflow-hidden bg-bg-card border border-border"
              >
                {src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={src}
                    alt={`${crisis.name} — crisis photo ${i + 1}`}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `radial-gradient(circle at 30% 30%, ${color}22, transparent 60%), linear-gradient(135deg, ${color}11, transparent)`,
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Photo attribution — required by Commons licenses */}
          {credits.length > 0 && (
            <p className="font-sans text-[10px] leading-relaxed text-text-dim -mt-5 mb-7">
              Photos via Wikimedia Commons:{" "}
              {credits.map((c, i) => (
                <span key={i}>
                  {i > 0 && " · "}
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline decoration-border hover:text-text-body transition-colors"
                  >
                    {c.artist}
                  </a>{" "}
                  ({c.license})
                </span>
              ))}
            </p>
          )}

          {/* Latest updates — auto-refreshed from UN ReliefWeb */}
          {updates.length > 0 && (
            <div className="mb-7">
              <h3 className="font-sans text-[11px] font-semibold tracking-[0.18em] uppercase text-text-dim mb-3">
                Latest Updates{" "}
                <span className="font-normal normal-case tracking-normal">
                  — via UN ReliefWeb
                </span>
              </h3>
              <ul className="space-y-2 border-l-[3px] pl-5" style={{ borderColor: `${color}55` }}>
                {updates.map((u) => (
                  <li key={u.url}>
                    <a
                      href={u.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block"
                    >
                      <span className="font-sans text-[14px] text-text-body group-hover:text-text-bright transition-colors leading-snug">
                        {u.title}
                      </span>
                      <span className="block font-sans text-[11px] text-text-dim mt-0.5">
                        {u.source} · {u.date}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Stats — top 3 */}
          {crisis.stats?.length > 0 && (
            <div className="grid grid-cols-3 gap-0 mb-7 border-t border-b border-border-hard">
              {crisis.stats.slice(0, 3).map((stat, i) => (
                <div
                  key={stat.label}
                  className={`relative py-5 text-center ${i < 2 ? "border-r border-border" : ""}`}
                >
                  <div className="font-display text-[28px] text-text-bright tracking-wider leading-none mb-1.5">
                    {stat.value}
                  </div>
                  <div className="font-sans text-[10px] font-medium text-text-dim uppercase tracking-widest">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CTAs */}
          <div className="flex flex-wrap gap-3">
            <a
              href={crisis.actions.donate?.[0]?.url ?? `/crises/${crisis.slug}`}
              target={crisis.actions.donate?.[0]?.url ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="px-5 py-3 font-sans text-xs font-semibold tracking-[0.12em] uppercase text-bg-deep transition-opacity hover:opacity-90"
              style={{ background: color }}
            >
              Donate
            </a>
            <button
              type="button"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: `${crisis.name} — Crisis Hub`,
                    text: crisis.summary,
                    url: `${window.location.origin}/crises/${crisis.slug}`,
                  }).catch(() => {});
                } else {
                  navigator.clipboard?.writeText(
                    `${window.location.origin}/crises/${crisis.slug}`,
                  );
                }
              }}
              className="px-5 py-3 font-sans text-xs font-semibold tracking-[0.12em] uppercase text-text-bright border border-border-hard hover:bg-bg-card-hover transition-colors"
            >
              Share
            </button>
            <button
              type="button"
              onClick={goToFullPage}
              className="px-5 py-3 font-sans text-xs font-semibold tracking-[0.12em] uppercase text-text-bright border border-text-bright hover:bg-text-bright hover:text-bg-deep transition-colors"
            >
              Read full →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
