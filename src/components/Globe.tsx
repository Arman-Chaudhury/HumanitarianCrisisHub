"use client";

import { Suspense, useRef, useState, useMemo, useCallback, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useRouter } from "next/navigation";
import type { Crisis } from "@/types/crisis";

/* ── Convert lat/lng to 3D sphere position ── */
function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

/* ── Pulsing crisis hotspot ── */
interface CrisisHotspotProps {
  crisis: Crisis;
  isSelected: boolean;
  onSelect: (slug: string) => void;
}

function CrisisHotspot({ crisis, isSelected, onSelect }: CrisisHotspotProps) {
  const glowRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const position = useMemo(
    () => latLngToVector3(crisis.coordinates.lat, crisis.coordinates.lng, 2.02),
    [crisis.coordinates]
  );

  const normal = useMemo(() => position.clone().normalize(), [position]);

  // Local-space quaternion — orients +Z outward from the globe surface.
  // Applied as a local prop so it stays correct as the parent globe rotates.
  const orientation = useMemo(() => {
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
    return q;
  }, [normal]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (glowRef.current) {
      const s = 1 + Math.sin(t * 2.5) * 0.4;
      glowRef.current.scale.setScalar(s);
    }

    if (ringRef.current) {
      if (isSelected) {
        // Hide pulse ring when selected — outline takes over
        ringRef.current.scale.setScalar(1);
        (ringRef.current.material as THREE.MeshBasicMaterial).opacity = 0;
      } else {
        const ringScale = 1 + ((t * 0.6) % 2.5);
        ringRef.current.scale.setScalar(ringScale);
        const mat = ringRef.current.material as THREE.MeshBasicMaterial;
        mat.opacity = Math.max(0, 0.5 - ((t * 0.6) % 2.5) * 0.2);
      }
    }
  });

  const handleClick = useCallback(() => {
    onSelect(crisis.slug);
  }, [onSelect, crisis.slug]);

  const color = new THREE.Color(crisis.color);

  return (
    <group position={position} quaternion={orientation}>
      {/* Expanding ring pulse */}
      <mesh ref={ringRef}>
        <ringGeometry args={[0.025, 0.038, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>

      {/* Outer glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.055, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={isSelected ? 0.22 : 0.12} />
      </mesh>

      {/* Mid glow */}
      <mesh>
        <sphereGeometry args={[0.034, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={isSelected ? 0.55 : 0.3} />
      </mesh>

      {/* Core dot — clickable */}
      <mesh
        onClick={handleClick}
        onPointerOver={() => {
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "default";
        }}
      >
        <sphereGeometry args={[0.022, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={hovered || isSelected ? 1 : 0.9} />
      </mesh>

      {/* Region outline — flat ring on the globe surface, shown on selection */}
      {isSelected && (
        <mesh>
          <ringGeometry args={[0.18, 0.205, 64]} />
          <meshBasicMaterial color={color} transparent opacity={0.85} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Hover tooltip (suppressed when selected) */}
      {hovered && !isSelected && (
        <Html center distanceFactor={5} style={{ pointerEvents: "none" }}>
          <div
            className="whitespace-nowrap px-3 py-2 rounded-md shadow-lg"
            style={{
              background: "rgba(14,13,11,0.92)",
              border: `1px solid ${crisis.color}55`,
              backdropFilter: "blur(8px)",
            }}
          >
            <span className="font-sans text-xs font-semibold" style={{ color: "#f0ece2" }}>
              {crisis.name}
            </span>
            <span
              className="ml-2 font-sans text-[10px] uppercase tracking-wider font-medium"
              style={{ color: crisis.color }}
            >
              {crisis.status}
            </span>
          </div>
        </Html>
      )}
    </group>
  );
}

/* ── Globe mesh + hotspots in one rotating group ── */
interface RotatingGlobeProps {
  crises: Crisis[];
  selectedSlug: string | null;
  onSelect: (slug: string) => void;
}

function RotatingGlobe({ crises, selectedSlug, onSelect }: RotatingGlobeProps) {
  const groupRef = useRef<THREE.Group>(null);
  const earthTexture = useTexture("/earth-water.png");
  earthTexture.colorSpace = THREE.SRGBColorSpace;
  const { camera } = useThree();

  // Precompute each crisis's unit-sphere local position for rotation targeting
  const crisisPositions = useMemo(
    () =>
      Object.fromEntries(
        crises.map((c) => [
          c.slug,
          latLngToVector3(c.coordinates.lat, c.coordinates.lng, 1),
        ])
      ),
    [crises]
  );

  useFrame((_state, delta) => {
    if (!groupRef.current) return;
    const cam = camera as THREE.PerspectiveCamera;
    const selectedPos = selectedSlug ? crisisPositions[selectedSlug] : null;

    if (selectedPos) {
      // Rotate globe so the selected hotspot faces the camera (+Z world direction).
      // targetY = atan2(-x, z) gives the Y rotation that maximises the hotspot's Z component.
      const targetY = Math.atan2(-selectedPos.x, selectedPos.z);
      let diff = targetY - groupRef.current.rotation.y;
      // Normalise to [-PI, PI] so we always take the shortest arc
      while (diff > Math.PI) diff -= 2 * Math.PI;
      while (diff < -Math.PI) diff += 2 * Math.PI;
      groupRef.current.rotation.y += diff * 0.05;

      // Zoom in via FOV
      cam.fov = THREE.MathUtils.lerp(cam.fov, 28, 0.05);
    } else {
      // Auto-rotate when idle
      groupRef.current.rotation.y += delta * 0.06;

      // Restore FOV
      cam.fov = THREE.MathUtils.lerp(cam.fov, 45, 0.05);
    }

    cam.updateProjectionMatrix();
  });

  return (
    <group ref={groupRef}>
      {/* Dark ocean base sphere */}
      <mesh>
        <sphereGeometry args={[1.998, 64, 64]} />
        <meshBasicMaterial color="#091d36" />
      </mesh>

      {/* Land/water mask — additive blue tint over ocean (white), dark land (black) */}
      <mesh>
        <sphereGeometry args={[2, 64, 64]} />
        <meshBasicMaterial
          map={earthTexture}
          color={new THREE.Color("#1a5c8a")}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Atmospheric rim glow */}
      <mesh>
        <sphereGeometry args={[2.08, 64, 64]} />
        <meshBasicMaterial color="#3a7bd5" transparent opacity={0.12} side={THREE.BackSide} />
      </mesh>

      {crises.map((c) => (
        <CrisisHotspot
          key={c.slug}
          crisis={c}
          isSelected={selectedSlug === c.slug}
          onSelect={onSelect}
        />
      ))}
    </group>
  );
}

/* ── Scene ── */
interface GlobeSceneProps {
  crises: Crisis[];
  selectedSlug: string | null;
  onSelect: (slug: string) => void;
}

function GlobeScene({ crises, selectedSlug, onSelect }: GlobeSceneProps) {
  return (
    <>
      <ambientLight intensity={2.5} />
      <directionalLight position={[5, 3, 5]} intensity={2.0} />
      <directionalLight position={[-5, -2, -3]} intensity={0.5} />
      <Suspense fallback={null}>
        <RotatingGlobe crises={crises} selectedSlug={selectedSlug} onSelect={onSelect} />
      </Suspense>
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        rotateSpeed={0.5}
        minPolarAngle={Math.PI * 0.2}
        maxPolarAngle={Math.PI * 0.8}
      />
    </>
  );
}

/* ── Exported Globe component ── */
interface GlobeProps {
  crises: Crisis[];
}

export default function Globe({ crises }: GlobeProps) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const router = useRouter();

  // Navigate to the crisis page after the zoom animation has time to play.
  // Cleanup cancels the timer if the user selects a different crisis before it fires.
  useEffect(() => {
    if (!selectedSlug) return;
    const timer = setTimeout(() => {
      router.push(`/crises/${selectedSlug}`);
    }, 1200);
    return () => clearTimeout(timer);
  }, [selectedSlug, router]);

  return (
    <div className="relative w-full aspect-square max-w-[600px] mx-auto mb-16">
      <div
        className="absolute inset-[-10%] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(230,57,70,0.06) 0%, rgba(230,57,70,0.02) 40%, transparent 70%)",
        }}
      />
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        style={{ background: "transparent" }}
        dpr={[1, 2]}
      >
        <GlobeScene crises={crises} selectedSlug={selectedSlug} onSelect={setSelectedSlug} />
      </Canvas>
    </div>
  );
}
