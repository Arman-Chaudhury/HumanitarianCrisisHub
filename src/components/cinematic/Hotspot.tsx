"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import type { Crisis } from "@/types/crisis";
import { getStatusColor } from "@/lib/statusColors";

interface HotspotProps {
  crisis: Crisis;
  selected: boolean;
  interactive: boolean;
  progressRef: MutableRefObject<number>;
  nodesRef: MutableRefObject<Map<string, THREE.Object3D>>;
  labelSetRef: MutableRefObject<Set<string>>;
  onClick: (slug: string) => void;
}

export default function Hotspot({
  crisis,
  selected,
  interactive,
  progressRef,
  nodesRef,
  labelSetRef,
  onClick,
}: HotspotProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [showLabel, setShowLabel] = useState(false);
  const previousVisibility = useRef(false);
  const position = useMemo(() => {
    const latitude = (crisis.coordinates.lat * Math.PI) / 180;
    const longitude = (crisis.coordinates.lng * Math.PI) / 180;
    return new THREE.Vector3(
      2.025 * Math.cos(latitude) * Math.cos(longitude),
      2.025 * Math.sin(latitude),
      -2.025 * Math.cos(latitude) * Math.sin(longitude),
    );
  }, [crisis.coordinates.lat, crisis.coordinates.lng]);

  useEffect(() => {
    const registry = nodesRef.current;
    if (groupRef.current) registry.set(crisis.slug, groupRef.current);
    return () => {
      registry.delete(crisis.slug);
    };
  }, [crisis.slug, nodesRef]);

  useFrame(() => {
    const visible =
      interactive &&
      progressRef.current >= 0.3 &&
      labelSetRef.current.has(crisis.slug);
    if (groupRef.current)
      groupRef.current.visible = progressRef.current >= 0.18;
    if (visible !== previousVisibility.current) {
      previousVisibility.current = visible;
      setShowLabel(visible);
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh
        onClick={
          interactive
            ? (event) => {
                event.stopPropagation();
                onClick(crisis.slug);
              }
            : undefined
        }
      >
        <sphereGeometry args={[selected ? 0.038 : 0.026, 10, 10]} />
        <meshBasicMaterial color={getStatusColor(crisis.status)} />
      </mesh>
      {showLabel && (
        <Html center position={[0, 0.06, 0]} zIndexRange={[30, 0]}>
          <button
            type="button"
            aria-pressed={selected}
            onClick={() => onClick(crisis.slug)}
            className={`max-w-[220px] truncate whitespace-nowrap border bg-white px-2 py-1 text-xs font-medium text-gray-900 ${selected ? "border-gray-900" : "border-gray-300"}`}
          >
            {crisis.name}
          </button>
        </Html>
      )}
    </group>
  );
}
