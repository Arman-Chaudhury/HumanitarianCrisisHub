"use client";

import { Suspense, useRef, type MutableRefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { Crisis } from "@/types/crisis";
import EarthLayers from "./EarthLayers";
import Aurora from "./Aurora";
import Starfield from "./Starfield";
import Hotspot from "./Hotspot";

/* ── Camera waypoints ──────────────────────────────────────────────────────
 * Stage A (horizon): camera close, looking up — Earth fills the bottom of
 * the frame as a curved horizon. Aurora and stars sit above.
 * Stage B (orbital): camera pulled back and centered — full sphere visible,
 * hotspots make sense, OrbitControls take over.
 * The CSS layer in CinematicHero handles the Stage C corner shrink; the
 * camera stays put at orbital from progress 0.5 onward.
 */
const HORIZON_POS = new THREE.Vector3(0, -0.45, 3.3);
const HORIZON_LOOK = new THREE.Vector3(0, 1.2, 0);
const HORIZON_FOV = 52;

const ORBITAL_POS = new THREE.Vector3(0, 0, 8.4);
const ORBITAL_LOOK = new THREE.Vector3(0, 0, 0);
const ORBITAL_FOV = 38;

/** Progress range over which the horizon → orbital camera move plays.
 *  Ends early so the globe is ready to interact as soon as the title clears. */
const TRANSITION_START = 0.12;
const TRANSITION_END = 0.3;

/** Camera-distance bounds for the interactive zoom buttons. */
export const ZOOM_MIN = 5;
export const ZOOM_MAX = 10.5;
export const ZOOM_DEFAULT = ORBITAL_POS.z;

/** Minimum facing-dot so only front-hemisphere spots get labels. */
const LABEL_MIN_FACING = 0.3;

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

interface CinematicGlobeProps {
  crises: Crisis[];
  /** Mutable scroll-progress 0..1 — read every frame to drive the camera. */
  progressRef: MutableRefObject<number>;
  selectedSlug: string | null;
  /** True only during Stage B; gates OrbitControls + hotspot clicks. */
  interactive: boolean;
  /** Target camera distance while interactive — driven by the zoom buttons. */
  zoomTargetRef: MutableRefObject<number>;
  onSelectCrisis: (slug: string) => void;
}

/**
 * ZoomRig — dollies the camera toward the button-driven target distance while
 * OrbitControls owns rotation. Wheel stays reserved for page scroll, so zoom
 * comes only from the on-screen buttons. OrbitControls re-derives its
 * spherical state from camera.position each update, so an external dolly
 * composes cleanly with user rotation.
 */
function ZoomRig({
  zoomTargetRef,
  interactive,
}: {
  zoomTargetRef: MutableRefObject<number>;
  interactive: boolean;
}) {
  const { camera } = useThree();
  useFrame((_state, delta) => {
    if (!interactive) return;
    const dist = camera.position.length();
    const next = THREE.MathUtils.damp(dist, zoomTargetRef.current, 4, delta);
    camera.position.multiplyScalar(next / dist);
  });
  return null;
}

/**
 * CameraRig — the heart of the horizon → orbital flow. Lerps camera position,
 * lookAt, and FOV every frame from a ref-driven scroll progress. Stays out of
 * the way during Stage B so OrbitControls owns the camera; resumes lerping
 * the moment the user scrolls back out, picking up from wherever the user
 * left it.
 */
function CameraRig({
  progressRef,
  interactive,
}: {
  progressRef: MutableRefObject<number>;
  interactive: boolean;
}) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3());
  const targetLook = useRef(new THREE.Vector3());
  const currentLook = useRef(new THREE.Vector3().copy(HORIZON_LOOK));

  useFrame((_state, delta) => {
    if (interactive) return; // OrbitControls owns the camera in Stage B

    const p = progressRef.current;

    if (p <= TRANSITION_START) {
      targetPos.current.copy(HORIZON_POS);
      targetLook.current.copy(HORIZON_LOOK);
    } else if (p >= TRANSITION_END) {
      targetPos.current.copy(ORBITAL_POS);
      targetLook.current.copy(ORBITAL_LOOK);
    } else {
      const t = easeInOutCubic(
        (p - TRANSITION_START) / (TRANSITION_END - TRANSITION_START),
      );
      targetPos.current.lerpVectors(HORIZON_POS, ORBITAL_POS, t);
      targetLook.current.lerpVectors(HORIZON_LOOK, ORBITAL_LOOK, t);
    }

    // Ease toward the scrub-driven target instead of snapping to it. This
    // matters most when scrolling out of Stage B: OrbitControls may have left
    // the camera anywhere, and a direct copy() produced a visible jump. The
    // damping constant is framerate-independent.
    const k = 1 - Math.pow(0.0001, delta);
    camera.position.lerp(targetPos.current, k);
    currentLook.current.lerp(targetLook.current, k);
    camera.lookAt(currentLook.current);

    const cam = camera as THREE.PerspectiveCamera;
    let targetFov = ORBITAL_FOV;
    if (p <= TRANSITION_START) targetFov = HORIZON_FOV;
    else if (p < TRANSITION_END) {
      const t = easeInOutCubic(
        (p - TRANSITION_START) / (TRANSITION_END - TRANSITION_START),
      );
      targetFov = HORIZON_FOV + (ORBITAL_FOV - HORIZON_FOV) * t;
    }
    cam.fov += (targetFov - cam.fov) * k;
    cam.updateProjectionMatrix();
  });

  return null;
}

/**
 * LabelPlanner — decides each frame which hotspot labels are visible using
 * screen-space collision: candidates (front-facing, zoomed in) are sorted by
 * how directly they face the camera, then greedily placed; any label whose
 * estimated rect overlaps an already-placed one is dropped. Already-visible
 * labels get a priority bonus so the set doesn't flicker as the globe drifts.
 */
function LabelPlanner({
  crises,
  interactive,
  nodesRef,
  labelSetRef,
}: {
  crises: Crisis[];
  interactive: boolean;
  nodesRef: MutableRefObject<Map<string, THREE.Object3D>>;
  labelSetRef: MutableRefObject<Set<string>>;
}) {
  const { camera } = useThree();
  const world = useRef(new THREE.Vector3());
  const camDir = useRef(new THREE.Vector3());

  useFrame(() => {
    const next = new Set<string>();

    // All front-facing hotspots keep their labels at every zoom level; the
    // back hemisphere is the only cull. (Screen-space collision culling was
    // tried here and removed — restore from history if labels re-crowd.)
    if (interactive) {
      camDir.current.copy(camera.position).normalize();
      for (const c of crises) {
        const node = nodesRef.current.get(c.slug);
        if (!node) continue;
        node.getWorldPosition(world.current);
        const facing = world.current.normalize().dot(camDir.current);
        if (facing >= LABEL_MIN_FACING) next.add(c.slug);
      }
    }

    const cur = labelSetRef.current;
    let changed = next.size !== cur.size;
    if (!changed) {
      next.forEach((s) => {
        if (!cur.has(s)) changed = true;
      });
    }
    if (changed) labelSetRef.current = next;
  });

  return null;
}

/** The rotating Earth + hotspots group. Auto-rotates when nothing is
 *  selected; eases the selected hotspot toward the camera otherwise. */
interface RotatingSceneProps extends Omit<CinematicGlobeProps, "zoomTargetRef"> {
  nodesRef: MutableRefObject<Map<string, THREE.Object3D>>;
  labelSetRef: MutableRefObject<Set<string>>;
}

function RotatingScene({
  crises,
  progressRef,
  selectedSlug,
  interactive,
  nodesRef,
  labelSetRef,
  onSelectCrisis,
}: RotatingSceneProps) {
  const groupRef = useRef<THREE.Group | null>(null);

  const targetPositions = useRef<Record<string, THREE.Vector3>>({});
  if (Object.keys(targetPositions.current).length === 0) {
    crises.forEach((c) => {
      const lat = c.coordinates.lat;
      const lng = c.coordinates.lng;
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lng + 180) * (Math.PI / 180);
      targetPositions.current[c.slug] = new THREE.Vector3(
        -Math.sin(phi) * Math.cos(theta),
        Math.cos(phi),
        Math.sin(phi) * Math.sin(theta),
      );
    });
  }

  useFrame((_state, delta) => {
    if (!groupRef.current) return;
    if (selectedSlug && targetPositions.current[selectedSlug]) {
      const p = targetPositions.current[selectedSlug];
      const targetY = Math.atan2(-p.x, p.z);
      let diff = targetY - groupRef.current.rotation.y;
      while (diff > Math.PI) diff -= 2 * Math.PI;
      while (diff < -Math.PI) diff += 2 * Math.PI;
      groupRef.current.rotation.y += diff * 0.05;
    } else {
      groupRef.current.rotation.y += delta * 0.045;
    }
  });

  return (
    <EarthLayers groupRef={groupRef}>
      {crises.map((c) => (
        <Hotspot
          key={c.slug}
          crisis={c}
          selected={selectedSlug === c.slug}
          interactive={interactive}
          progressRef={progressRef}
          nodesRef={nodesRef}
          labelSetRef={labelSetRef}
          onClick={onSelectCrisis}
        />
      ))}
    </EarthLayers>
  );
}

export default function CinematicGlobe({
  crises,
  progressRef,
  selectedSlug,
  interactive,
  zoomTargetRef,
  onSelectCrisis,
}: CinematicGlobeProps) {
  // Registry of hotspot scene nodes (for world-position lookups) and the
  // planner-approved set of visible labels — both mutable, read every frame.
  const nodesRef = useRef(new Map<string, THREE.Object3D>());
  const labelSetRef = useRef(new Set<string>());

  return (
    <Canvas
      camera={{
        position: [HORIZON_POS.x, HORIZON_POS.y, HORIZON_POS.z],
        fov: HORIZON_FOV,
      }}
      style={{ background: "transparent" }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={1.3} />
      <directionalLight position={[5, 3, 5]} intensity={1.6} />
      <directionalLight position={[-5, -2, -3]} intensity={0.35} />

      <Aurora opacity={0.55} />
      <Starfield />

      <Suspense fallback={null}>
        <RotatingScene
          crises={crises}
          progressRef={progressRef}
          selectedSlug={selectedSlug}
          interactive={interactive}
          nodesRef={nodesRef}
          labelSetRef={labelSetRef}
          onSelectCrisis={onSelectCrisis}
        />
      </Suspense>

      <LabelPlanner
        crises={crises}
        interactive={interactive}
        nodesRef={nodesRef}
        labelSetRef={labelSetRef}
      />

      <CameraRig progressRef={progressRef} interactive={interactive} />
      <ZoomRig zoomTargetRef={zoomTargetRef} interactive={interactive} />

      {interactive && (
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableDamping
          dampingFactor={0.08}
          rotateSpeed={0.45}
          minPolarAngle={Math.PI * 0.2}
          maxPolarAngle={Math.PI * 0.8}
        />
      )}
    </Canvas>
  );
}
