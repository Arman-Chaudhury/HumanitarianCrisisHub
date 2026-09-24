"use client";

import Link from "next/link";

/**
 * Route-level error boundary. If any client component throws (for example a
 * WebGL context failure on an unusual browser), the visitor sees this instead
 * of Next.js's bare "Application error" screen, and the rest of the site
 * stays reachable.
 */
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="max-w-[720px] py-16">
      <h1 className="font-sans font-bold text-[clamp(28px,4vw,36px)] text-text-bright tracking-tight mb-3">
        Something went wrong displaying this page
      </h1>
      <p className="font-sans text-base text-text-body leading-relaxed mb-6">
        The crisis briefings are still available. You can retry, or go straight
        to the index.
      </p>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={reset}
          className="font-sans text-sm font-semibold text-white bg-gray-900 px-5 py-3 rounded hover:bg-gray-700 transition-colors"
        >
          Try again
        </button>
        <Link
          href="/#crises"
          className="font-sans text-sm font-semibold text-text-bright border border-border-hard px-5 py-3 rounded hover:bg-bg-card-hover transition-colors"
        >
          Browse all crises
        </Link>
      </div>
    </div>
  );
}
