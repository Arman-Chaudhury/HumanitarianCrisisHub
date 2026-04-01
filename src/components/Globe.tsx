"use client";

import { useRef, useState, useMemo, useCallback, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import { useRouter } from "next/navigation";
import type { Crisis } from "@/types/crisis";

/* ── Clean land/water mask — smooth country shapes, no jagged edges ── */
const EARTH_TEXTURE_URL =
  "https://unpkg.com/three-globe@2.31.1/example/img/earth-water.png";

/* ── Convert lat/lng to 3D sphere position ── */
function latLngToVector3(
  lat: number,
  lng: number,
  radius: number
): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

/* ── Load earth texture with fallback ── */
function useEarthTexture() {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = "anonymous";
    loader.load(
      EARTH_TEXTURE_URL,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        setTexture(tex);
      },
      undefined,
      () => {
        // Fallback to local file if CDN fails
        loader.load("/earth-dark.jpg", (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          setTexture(tex);
        });
      }
    );
  }, []);

  return texture;
}

/* ── Pulsing crisis hotspot ── */
function CrisisHotspot({ crisis }: { crisis: Crisis }) {
  const glowRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const router = useRouter();

  const position = useMemo(
    () =>
      latLngToVector3(
        crisis.coordinates.lat,
        crisis.coordinates.lng,
        2.02
      ),
    [crisis.coordinates]
  );

  // Make the hotspot always face outward from globe center
  const normal = useMemo(() => position.clone().normalize(), [position]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (glowRef.current) {
      const s = 1 + Math.sin(t * 2.5) * 0.4;
      glowRef.current.scale.setScalar(s);
    }
    if (ringRef.current) {
      const ringScale = 1 + ((t * 0.6) % 2.5);
      ringRef.current.scale.setScalar(ringScale);
      const mat = ringRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.max(0, 0.5 - ((t * 0.6) % 2.5) * 0.2);
    }
  });

  const handleClick = useCallback(() => {
    router.push(`/crises/${crisis.slug}`);
  }, [router, crisis.slug]);

  const color = new THREE.Color(crisis.color);

  return (
    <group position={position} lookAt={[0, 0, 0]}>
      {/* Expanding ring pulse */}
      <mesh ref={ringRef} rotation={[0, 0, 0]}>
        <ringGeometry args={[0.04, 0.06, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Outer glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.12} />
      </mesh>

      {/* Mid glow */}
      <mesh>
        <sphereGeometry args={[0.065, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} />
      </mesh>

      {/* Core bright dot — clickable */}
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
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={hovered ? 1 : 0.9}
        />
      </mesh>

      {/* Tooltip on hover */}
      {hovered && (
        <Html center distanceFactor={5} style={{ pointerEvents: "none" }}>
          <div
            className="whitespace-nowrap px-3 py-2 rounded-md shadow-lg"
            style={{
              background: "rgba(14,13,11,0.92)",
              border: `1px solid ${crisis.color}55`,
              backdropFilter: "blur(8px)",
            }}
          >
            <span
              className="font-sans text-xs font-semibold"
              style={{ color: "#f0ece2" }}
            >
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
function RotatingGlobe({ crises }: { crises: Crisis[] }) {
  const groupRef = useRef<THREE.Group>(null);
  const earthTexture = useEarthTexture();

  useFrame((_state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.06;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Dark blue ocean base sphere */}
      <mesh>
        <sphereGeometry args={[1.998, 64, 64]} />
        <meshBasicMaterial color="#091d36" />
      </mesh>

      {/* Clean land/water mask — white land adds lighter blue on top */}
      <mesh>
        <sphereGeometry args={[2, 64, 64]} />
        {earthTexture ? (
          <meshBasicMaterial
            map={earthTexture}
            color={new THREE.Color("#1a5c8a")}
            transparent
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        ) : (
          <meshBasicMaterial color="#0b1a30" />
        )}
      </mesh>

      {/* Atmospheric blue rim glow */}
      <mesh>
        <sphereGeometry args={[2.08, 64, 64]} />
        <meshBasicMaterial
          color="#3a7bd5"
          transparent
          opacity={0.12}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Crisis hotspots — INSIDE the rotating group so they spin with the globe */}
      {crises.map((c) => (
        <CrisisHotspot key={c.slug} crisis={c} />
      ))}
    </group>
  );
}

/* ── Scene: lights, globe, controls ── */
function GlobeScene({ crises }: { crises: Crisis[] }) {
  return (
    <>
      <ambientLight intensity={2.5} />
      <directionalLight position={[5, 3, 5]} intensity={2.0} />
      <directionalLight position={[-5, -2, -3]} intensity={0.5} />
      <RotatingGlobe crises={crises} />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        rotateSpeed={0.5}
        autoRotate
        autoRotateSpeed={0.3}
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
  return (
    <div className="relative w-full aspect-square max-w-[600px] mx-auto mb-16">
      {/* Background glow behind globe */}
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
        <GlobeScene crises={crises} />
      </Canvas>
    </div>
  );
}