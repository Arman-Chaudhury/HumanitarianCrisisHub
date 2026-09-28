"use client";

import {
  useEffect,
  useState,
  type MutableRefObject,
  type ReactNode,
} from "react";
import * as THREE from "three";
import { institutionColors } from "../../../tailwind.config";
import { TEXTURE_PATHS } from "./textures";

interface EarthLayersProps {
  groupRef: MutableRefObject<THREE.Group | null>;
  children?: ReactNode;
  lite?: boolean;
}

/**
 * One opaque surface avoids intersecting facets from the former 40-segment
 * underlay and 64-segment shell (radii 1.998 and 2). There is no transparent
 * overlay, depth bias, cloud shell or animated fade to conceal that defect.
 */
export default function EarthLayers({ groupRef, children }: EarthLayersProps) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    let cancelled = false;
    let ownedTexture: THREE.Texture | null = null;
    const loader = new THREE.TextureLoader();

    const accept = (loaded: THREE.Texture) => {
      if (cancelled) {
        loaded.dispose();
        return;
      }
      loaded.colorSpace = THREE.SRGBColorSpace;
      loaded.anisotropy = 4;
      ownedTexture = loaded;
      setTexture(loaded);
    };

    loader.load(TEXTURE_PATHS.day, accept, undefined, () => {
      if (!cancelled) loader.load(TEXTURE_PATHS.fallback, accept);
    });

    return () => {
      cancelled = true;
      ownedTexture?.dispose();
    };
  }, []);

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[2, 64, 64]} />
        <meshBasicMaterial
          map={texture}
          color={texture ? institutionColors.paper : institutionColors.ocean}
          transparent={false}
          depthWrite
        />
      </mesh>
      {children}
    </group>
  );
}
