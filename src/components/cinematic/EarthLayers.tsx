"use client";

import {
  useEffect,
  useMemo,
  useState,
  type MutableRefObject,
  type ReactNode,
} from "react";
import * as THREE from "three";
import { institutionColors } from "../../../tailwind.config";
import { TEXTURE_PATHS } from "./textures";

/** Optional layers may fail independently; the day texture has a base-map fallback. */
function useOptionalTexture(
  url: string | null,
  fallback?: string,
): THREE.Texture | null {
  const [loaded, setLoaded] = useState<{
    url: string;
    texture: THREE.Texture;
  } | null>(null);

  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    let ownedTexture: THREE.Texture | null = null;
    const loader = new THREE.TextureLoader();
    const accept = (texture: THREE.Texture) => {
      if (cancelled) {
        texture.dispose();
        return;
      }
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 4;
      ownedTexture = texture;
      setLoaded({ url, texture });
    };
    loader.load(url, accept, undefined, () => {
      if (!cancelled && fallback)
        loader.load(fallback, accept, undefined, () => {});
    });
    return () => {
      cancelled = true;
      ownedTexture?.dispose();
    };
  }, [url, fallback]);

  return loaded?.url === url ? loaded.texture : null;
}

const vertexShader = /* glsl */ `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vView;
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vView = normalize(-mv.xyz);
          gl_Position = projectionMatrix * mv;
        }
      `;
const fragmentShader = /* glsl */ `
        uniform sampler2D uDay;
        uniform sampler2D uNight;
        uniform sampler2D uSpecular;
        uniform float uHasNight;
        uniform float uHasSpecular;
        uniform vec3 uSunDir;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vView;

        void main() {
          vec3 sun = normalize(uSunDir);
          float cosTheta = dot(normalize(vNormal), sun);
          // Soft terminator
          float lit = smoothstep(-0.15, 0.25, cosTheta);

          vec3 day = texture2D(uDay, vUv).rgb;
          vec3 night = uHasNight > 0.5 ? texture2D(uNight, vUv).rgb : vec3(0.0);
          vec3 col = mix(night * 1.4, day, lit);

          // Ocean shimmer from specular mask
          if (uHasSpecular > 0.5) {
            float specMask = texture2D(uSpecular, vUv).r;
            vec3 h = normalize(sun + vView);
            float spec = pow(max(dot(normalize(vNormal), h), 0.0), 24.0);
            col += specMask * spec * lit * vec3(0.55, 0.7, 0.95) * 0.6;
          }

          gl_FragColor = vec4(col, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }
      `;

interface EarthLayersProps {
  groupRef: MutableRefObject<THREE.Group | null>;
  children?: ReactNode;
  /** Keep touch devices on the existing day-only texture profile. */
  lite?: boolean;
}

export default function EarthLayers({
  groupRef,
  children,
  lite = false,
}: EarthLayersProps) {
  const dayMap = useOptionalTexture(TEXTURE_PATHS.day, TEXTURE_PATHS.fallback);
  const nightMap = useOptionalTexture(lite ? null : TEXTURE_PATHS.night);
  const specularMap = useOptionalTexture(lite ? null : TEXTURE_PATHS.specular);
  const cloudsMap = useOptionalTexture(lite ? null : TEXTURE_PATHS.clouds);
  const uniforms = useMemo(
    () => ({
      uDay: { value: dayMap },
      uNight: { value: nightMap },
      uSpecular: { value: specularMap },
      uHasNight: { value: nightMap ? 1 : 0 },
      uHasSpecular: { value: specularMap ? 1 : 0 },
      uSunDir: { value: new THREE.Vector3(1, 0.3, 0.6).normalize() },
    }),
    [dayMap, nightMap, specularMap],
  );

  return (
    <group ref={groupRef}>
      {/* One opaque surface: never stack nearly coincident Earth shells. */}
      <mesh>
        <sphereGeometry args={[2, 64, 64]} />
        {!dayMap ? (
          <meshBasicMaterial key="loading" color={institutionColors.ocean} />
        ) : lite ? (
          // A new material compiles USE_MAP with the loaded texture present.
          <meshBasicMaterial key={dayMap.uuid} map={dayMap} />
        ) : (
          <shaderMaterial
            key="day-night"
            uniforms={uniforms}
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            transparent={false}
            depthWrite
          />
        )}
      </mesh>
      {/* Matching tessellation keeps the cloud shell outside every surface facet.
          No autonomous drift or fade: reduced-motion users get a static layer. */}
      {cloudsMap && !lite && (
        <mesh>
          <sphereGeometry args={[2.012, 64, 64]} />
          <meshBasicMaterial
            key={cloudsMap.uuid}
            map={cloudsMap}
            transparent
            opacity={0.55}
            depthWrite={false}
          />
        </mesh>
      )}
      {children}
    </group>
  );
}
