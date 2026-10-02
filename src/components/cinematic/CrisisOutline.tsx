"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { GLOBE_RADIUS } from "./constants";
import type { Outline } from "./outlines";

/** Just above the surface so the line clears the terrain texture. */
const OUTLINE_RADIUS = GLOBE_RADIUS + 0.02;

/** The outline waits for the camera to start moving, then fades in. */
const FADE_DELAY = 0.25;
const FADE_DURATION = 0.7;

function toSphere([lng, lat]: [number, number]): THREE.Vector3 {
  const latitude = (lat * Math.PI) / 180;
  const longitude = (lng * Math.PI) / 180;
  return new THREE.Vector3(
    OUTLINE_RADIUS * Math.cos(latitude) * Math.cos(longitude),
    OUTLINE_RADIUS * Math.sin(latitude),
    -OUTLINE_RADIUS * Math.cos(latitude) * Math.sin(longitude),
  );
}

interface CrisisOutlineProps {
  outline: Outline;
  color: string;
}

/**
 * Draws the selected crisis's boundary on the globe: a soft wide glow under a
 * crisp line, both fading in once the camera starts its move. Approximate
 * areas (a circle rather than a border) are dashed. Mount it keyed by crisis
 * so each selection starts its own fade.
 */
export default function CrisisOutline({ outline, color }: CrisisOutlineProps) {
  const rings = useMemo(
    () => outline.rings.map((ring) => ring.map(toSphere)),
    [outline],
  );
  const glows = useRef<THREE.ShaderMaterial[]>([]);
  const lines = useRef<THREE.ShaderMaterial[]>([]);
  const elapsed = useRef(0);

  useFrame((_state, delta) => {
    elapsed.current += delta;
    const t = Math.min(
      1,
      Math.max(0, (elapsed.current - FADE_DELAY) / FADE_DURATION),
    );
    const opacity = t * t * (3 - 2 * t);
    for (const material of glows.current) material.opacity = opacity * 0.22;
    for (const material of lines.current) material.opacity = opacity;
  });

  const dashed = Boolean(outline.approximate);

  return (
    <group>
      {rings.map((points, index) => (
        <group key={index}>
          <Line
            ref={(line) => {
              if (line) glows.current[index] = line.material as THREE.ShaderMaterial;
            }}
            points={points}
            color={color}
            lineWidth={6}
            transparent
            opacity={0}
            depthWrite={false}
          />
          <Line
            ref={(line) => {
              if (line) lines.current[index] = line.material as THREE.ShaderMaterial;
            }}
            points={points}
            color={color}
            lineWidth={1.6}
            transparent
            opacity={0}
            depthWrite={false}
            dashed={dashed}
            dashSize={0.06}
            gapSize={0.04}
          />
        </group>
      ))}
    </group>
  );
}
