"use client";

import dynamic from "next/dynamic";
import type { Crisis } from "@/types/crisis";

const Globe = dynamic(() => import("./Globe"), {
  ssr: false,
  loading: () => (
    <div className="relative w-full aspect-square max-w-[600px] mx-auto mb-16 flex items-center justify-center">
      <div className="absolute inset-0 rounded-full opacity-10 blur-3xl pointer-events-none bg-crisis-red" />
      <div className="font-sans text-xs text-text-dim tracking-widest uppercase animate-pulse">
        Loading globe…
      </div>
    </div>
  ),
});

interface GlobeLoaderProps {
  crises: Crisis[];
}

export default function GlobeLoader({ crises }: GlobeLoaderProps) {
  return <Globe crises={crises} />;
}
