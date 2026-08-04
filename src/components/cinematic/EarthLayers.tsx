"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { TEXTURE_PATHS } from "./textures";

/**
 * Earth surface + cloud layer. Uses the same synchronous useLoader / useMemo
 * pattern as the original Globe to avoid the Strict Mode texture race that
 * burned us before.
 *
 * If the realistic NASA textures are not present in /public/textures/ we
 * fall back to the existing /earth-water.png base map and skip the layers
 * that need the missing assets.
 */

function useOptionalTexture(url: string): THREE.Texture | null {
  // We use a manual loader so a 404 doesn't throw and break the whole scene.
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    let cancelled = false;
    loader.load(
      url,
      (t) => {
        if (cancelled) return;
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = 8;
        setTex(t);
      },
      undefined,
      () => {
        // Missing texture is fine — caller handles the null branch.
      },
    );
    return () => {
      cancelled = true;
    };
  }, [url]);
  return tex;
}

interface EarthLayersProps {
  /** Reference assigned to the rotating group (surface + clouds + hotspots). */
  groupRef: React.MutableRefObject<THREE.Group | null>;
  /** Children rendered inside the rotating group (hotspots). */
  children?: React.ReactNode;
}

export default function EarthLayers({ groupRef, children }: EarthLayersProps) {
  const dayMap = useOptionalTexture(TEXTURE_PATHS.day);
  const normalMap = useOptionalTexture(TEXTURE_PATHS.normal);
  const specularMap = useOptionalTexture(TEXTURE_PATHS.specular);
  const cloudsMap = useOptionalTexture(TEXTURE_PATHS.clouds);
  const nightMap = useOptionalTexture(TEXTURE_PATHS.night);

  const cloudsRef = useRef<THREE.Mesh>(null);

  // Custom shader for the day/night blend when realistic textures are present.
  const surfaceMaterial = useMemo(() => {
    if (!dayMap) return null;
    return new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        uDay: { value: dayMap },
        uNight: { value: nightMap },
        uSpecular: { value: specularMap },
        uHasNight: { value: nightMap ? 1.0 : 0.0 },
        uHasSpecular: { value: specularMap ? 1.0 : 0.0 },
        uSunDir: { value: new THREE.Vector3(1, 0.3, 0.6).normalize() },
        // Fade-in so the surface materializes over the dark silhouette
        // instead of popping when the day texture finishes downloading.
        uFade: { value: 0 },
      },
      vertexShader: /* glsl */ `
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
      `,
      fragmentShader: /* glsl */ `
        uniform sampler2D uDay;
        uniform sampler2D uNight;
        uniform sampler2D uSpecular;
        uniform float uHasNight;
        uniform float uHasSpecular;
        uniform vec3 uSunDir;
        uniform float uFade;
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

          gl_FragColor = vec4(col, uFade);
        }
      `,
    });
  }, [dayMap, nightMap, specularMap]);

  useFrame((_state, delta) => {
    // Ease the surface and clouds in once their textures have resolved.
    if (surfaceMaterial) {
      const u = surfaceMaterial.uniforms.uFade;
      u.value = Math.min(1, u.value + delta * 1.2);
    }
    if (cloudsRef.current) {
      // Clouds drift slightly faster than the surface
      cloudsRef.current.rotation.y += delta * 0.063;
      const m = cloudsRef.current.material as THREE.MeshBasicMaterial;
      m.opacity = Math.min(0.55, m.opacity + delta * 0.35);
    }
  });

  return (
    <>
      <group ref={groupRef}>
        {/* Dark ocean base sphere — keeps a believable silhouette before the
            surface shader has resolved or when only the fallback map is up. */}
        <mesh>
          <sphereGeometry args={[1.998, 64, 64]} />
          <meshBasicMaterial color="#0a1d36" />
        </mesh>

        {/* NASA surface fades in over the dark base once its texture lands —
            no flat-color fallback layer, so there's no blue flash on load. */}
        {surfaceMaterial && (
          <mesh>
            <sphereGeometry args={[2, 96, 96]} />
            <primitive object={surfaceMaterial} attach="material" />
          </mesh>
        )}

        {/* Optional normal-mapped relief overlay (additive bump look) */}
        {normalMap && surfaceMaterial && (
          <mesh>
            <sphereGeometry args={[2.001, 96, 96]} />
            <meshStandardMaterial
              transparent
              opacity={0.0}
              normalMap={normalMap}
              normalScale={new THREE.Vector2(0.6, 0.6)}
            />
          </mesh>
        )}

        {children}
      </group>

      {/* Cloud layer — rotates faster and outside the rotating group so
          its motion is independent of the hotspot rotation. */}
      {cloudsMap && (
        <mesh ref={cloudsRef}>
          <sphereGeometry args={[2.012, 96, 96]} />
          <meshBasicMaterial
            map={cloudsMap}
            transparent
            opacity={0}
            depthWrite={false}
            blending={THREE.NormalBlending}
          />
        </mesh>
      )}
    </>
  );
}
