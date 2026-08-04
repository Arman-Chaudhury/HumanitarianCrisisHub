"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface AuroraProps {
  opacity?: number;
}

/**
 * Large low-opacity gradient sphere behind Earth. Slow rotation + a procedural
 * noise field gives the impression of distant cosmic light without the cost
 * of a real volume. Reuses the site's --red-dim feel via warm tinting.
 */
export default function Aurora({ opacity = 0.6 }: AuroraProps) {
  const ref = useRef<THREE.Mesh>(null);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uOpacity: { value: opacity },
        // Greenish atmospheric top, deep blue toward the horizon — close to
        // the reference's low-orbit feel while keeping a touch of red glow at
        // the side band so we don't lose the brand palette entirely.
        uTopColor: { value: new THREE.Color(0x1f4a3a) },
        uMidColor: { value: new THREE.Color(0x2a1418) },
        uBottomColor: { value: new THREE.Color(0x0a1622) },
      },
      vertexShader: /* glsl */ `
        varying vec3 vPos;
        void main() {
          vPos = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        varying vec3 vPos;
        uniform float uTime;
        uniform float uOpacity;
        uniform vec3 uTopColor;
        uniform vec3 uMidColor;
        uniform vec3 uBottomColor;

        // 3D-ish hash noise — cheap, good enough for a soft gradient
        float hash(vec3 p) {
          return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
        }
        float noise(vec3 p) {
          vec3 i = floor(p), f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          float n = mix(
            mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
                mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
            mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
                mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
          return n;
        }

        void main() {
          vec3 n = normalize(vPos);
          float h = n.y * 0.5 + 0.5;
          // Three-stop gradient: deep blue at horizon, red mid-belt, green top
          vec3 base = h < 0.5
            ? mix(uBottomColor, uMidColor, h * 2.0)
            : mix(uMidColor, uTopColor, (h - 0.5) * 2.0);
          float swirl = noise(n * 2.0 + uTime * 0.05) * 0.6 + 0.4;
          vec3 col = base * swirl;
          float r = length(vPos.xy) / length(vPos);
          float vignette = smoothstep(0.0, 0.85, r);
          gl_FragColor = vec4(col, uOpacity * vignette);
        }
      `,
      transparent: true,
      side: THREE.BackSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, [opacity]);

  useFrame(({ clock }, delta) => {
    material.uniforms.uTime.value = clock.getElapsedTime();
    if (ref.current) ref.current.rotation.y += delta * 0.01;
  });

  return (
    <mesh ref={ref} material={material}>
      <sphereGeometry args={[40, 32, 32]} />
    </mesh>
  );
}

export function setAuroraOpacity(material: THREE.ShaderMaterial | null, value: number) {
  if (!material) return;
  material.uniforms.uOpacity.value = value;
}
