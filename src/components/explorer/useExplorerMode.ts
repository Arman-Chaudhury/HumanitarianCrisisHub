"use client";

import { useEffect, useState } from "react";

export interface ExplorerMode {
  ready: boolean;
  opening: boolean;
  webgl: boolean;
  touch: boolean;
  reducedMotion: boolean;
}

/** Resolve capability before mounting either layout, avoiding an incorrect hero flash. */
export default function useExplorerMode(): ExplorerMode {
  const [mode, setMode] = useState<ExplorerMode>({
    ready: false,
    opening: false,
    webgl: false,
    touch: true,
    reducedMotion: true,
  });

  useEffect(() => {
    let webgl = false;
    try {
      const probe = document.createElement("canvas");
      const context = probe.getContext("webgl2") || probe.getContext("webgl");
      webgl = Boolean(context);
      context?.getExtension("WEBGL_lose_context")?.loseContext();
    } catch {
      webgl = false;
    }

    const wide = matchMedia("(min-width: 1200px)");
    const mouse = matchMedia("(hover: hover) and (pointer: fine)");
    const touch = matchMedia("(any-pointer: coarse)");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () =>
      setMode({
        ready: true,
        webgl,
        touch: touch.matches || !mouse.matches,
        reducedMotion: reduced.matches,
        opening:
          webgl &&
          wide.matches &&
          mouse.matches &&
          !touch.matches &&
          !reduced.matches,
      });
    const queries = [wide, mouse, touch, reduced];
    update();
    queries.forEach((query) => query.addEventListener("change", update));
    return () =>
      queries.forEach((query) => query.removeEventListener("change", update));
  }, []);

  return mode;
}
