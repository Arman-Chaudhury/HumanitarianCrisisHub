"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import type { Crisis } from "@/types/crisis";
import { getStatusColor } from "@/lib/statusColors";

function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

interface HotspotProps {
  crisis: Crisis;
  selected: boolean;
  interactive: boolean;
  /** Scroll progress 0..1 — used to fade hotspots in as the camera reaches orbital. */
  progressRef: MutableRefObject<number>;
  /** Registry of hotspot scene nodes, shared with the LabelPlanner. */
  nodesRef: MutableRefObject<Map<string, THREE.Object3D>>;
  /** Planner-approved set of slugs whose labels may show this frame. */
  labelSetRef: MutableRefObject<Set<string>>;
  onClick: (slug: string) => void;
}

/** Progress range over which hotspots fade in. Aligned with the camera move
 *  so dots start appearing midway through the horizon → orbital lerp. */
const FADE_IN_START = 0.18;
const FADE_IN_END = 0.3;

/**
 * Somber pulse hotspot. ~2.5s cadence, low max brightness — beacons not
 * headlights. Includes a flat ground-glow disc on the surface so the spot
 * reads as anchored to the planet.
 */
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
  const glowRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const groundRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const midRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [showLabel, setShowLabel] = useState(false);
  const showLabelRef = useRef(false);

  // Register this hotspot's node so the LabelPlanner can project it.
  useEffect(() => {
    const nodes = nodesRef.current;
    if (groupRef.current) nodes.set(crisis.slug, groupRef.current);
    return () => {
      nodes.delete(crisis.slug);
    };
  }, [crisis.slug, nodesRef]);

  const position = useMemo(
    () => latLngToVector3(crisis.coordinates.lat, crisis.coordinates.lng, 2.02),
    [crisis.coordinates],
  );

  const normal = useMemo(() => position.clone().normalize(), [position]);

  const orientation = useMemo(() => {
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
    return q;
  }, [normal]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const omega = (Math.PI * 2) / 2.5;
    const pulse = (Math.sin(t * omega) + 1) * 0.5; // 0..1

    // Stage gate — 0 during horizon, 1 by the time the camera reaches orbital
    const p = progressRef.current;
    const stageAlpha = Math.max(
      0,
      Math.min(1, (p - FADE_IN_START) / (FADE_IN_END - FADE_IN_START)),
    );

    if (groupRef.current) groupRef.current.visible = stageAlpha > 0.001;

    // Label visibility is decided centrally by the LabelPlanner (screen-space
    // collision) — here we only mirror its verdict into React state, flipping
    // only on change to avoid 60fps re-renders.
    const labelVisible =
      interactive && stageAlpha > 0.9 && labelSetRef.current.has(crisis.slug);
    if (labelVisible !== showLabelRef.current) {
      showLabelRef.current = labelVisible;
      setShowLabel(labelVisible);
    }

    if (glowRef.current) {
      glowRef.current.scale.setScalar(0.85 + pulse * 0.45);
      const m = glowRef.current.material as THREE.MeshBasicMaterial;
      m.opacity = (selected ? 0.2 : 0.1) * stageAlpha;
    }

    if (midRef.current) {
      const m = midRef.current.material as THREE.MeshBasicMaterial;
      m.opacity = (selected ? 0.5 : 0.28) * stageAlpha;
    }

    if (groundRef.current) {
      const m = groundRef.current.material as THREE.MeshBasicMaterial;
      m.opacity = (0.18 + pulse * 0.18) * stageAlpha;
    }

    if (coreRef.current) {
      const m = coreRef.current.material as THREE.MeshBasicMaterial;
      m.opacity = (hovered || selected ? 1 : 0.85) * stageAlpha;
    }

    if (ringRef.current) {
      const m = ringRef.current.material as THREE.MeshBasicMaterial;
      if (selected) {
        ringRef.current.scale.setScalar(1);
        m.opacity = 0;
      } else {
        const ringScale = 1 + ((t * 0.45) % 2.5);
        ringRef.current.scale.setScalar(ringScale);
        m.opacity = Math.max(0, 0.32 - ((t * 0.45) % 2.5) * 0.13) * stageAlpha;
      }
    }
  });

  const handleClick = useCallback(
    (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
      onClick(crisis.slug);
    },
    [onClick, crisis.slug],
  );

  const color = useMemo(() => new THREE.Color(getStatusColor(crisis.status)), [crisis.status]);
  const cursorReady = interactive;

  return (
    <group ref={groupRef} position={position} quaternion={orientation}>
      {/* Subtle ground glow on the surface */}
      <mesh ref={groundRef} position={[0, 0, -0.005]}>
        <circleGeometry args={[0.07, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.22}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Expanding ring pulse */}
      <mesh ref={ringRef}>
        <ringGeometry args={[0.016, 0.024, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.32} side={THREE.DoubleSide} />
      </mesh>

      {/* Outer glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={selected ? 0.2 : 0.1} />
      </mesh>

      {/* Mid glow */}
      <mesh ref={midRef}>
        <sphereGeometry args={[0.02, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={selected ? 0.5 : 0.28} />
      </mesh>

      {/* Core dot — clickable */}
      <mesh
        ref={coreRef}
        onClick={interactive ? handleClick : undefined}
        onPointerOver={() => {
          if (!cursorReady) return;
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          if (!cursorReady) return;
          setHovered(false);
          document.body.style.cursor = "default";
        }}
      >
        <sphereGeometry args={[0.014, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={hovered || selected ? 1 : 0.85}
        />
      </mesh>

      {/* Region outline ring shown when selected */}
      {selected && (
        <mesh>
          <ringGeometry args={[0.11, 0.126, 64]} />
          <meshBasicMaterial color={color} transparent opacity={0.85} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Persistent name label — planner-approved, clickable shortcut */}
      {showLabel && !hovered && !selected && (
        <Html
          center
          distanceFactor={5}
          position={[0, 0.055, 0.02]}
          zIndexRange={[40, 0]}
        >
          <div
            onClick={handleClick}
            className="whitespace-nowrap px-2 py-[3px] cursor-pointer"
          >
            <span
              className="font-sans text-[8.5px] font-medium tracking-wide"
              style={{
                color: "#f0ece2",
                textShadow:
                  "0 1px 3px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.7)",
              }}
            >
              {crisis.name}
            </span>
          </div>
        </Html>
      )}

      {/* Hover tooltip — only when interactive and not selected */}
      {hovered && interactive && !selected && (
        <Html center distanceFactor={5} style={{ pointerEvents: "none" }}>
          <div
            className="whitespace-nowrap px-3 py-2 rounded-md shadow-lg"
            style={{
              background: "rgba(14,13,11,0.92)",
              border: `1px solid ${getStatusColor(crisis.status)}55`,
              backdropFilter: "blur(8px)",
            }}
          >
            <span className="font-sans text-xs font-semibold" style={{ color: "#f0ece2" }}>
              {crisis.name}
            </span>
            <span
              className="ml-2 font-sans text-[10px] uppercase tracking-wider font-medium"
              style={{ color: getStatusColor(crisis.status) }}
            >
              {crisis.status}
            </span>
          </div>
        </Html>
      )}
    </group>
  );
}
