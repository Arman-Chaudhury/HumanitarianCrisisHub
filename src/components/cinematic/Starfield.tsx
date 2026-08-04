"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface StarfieldProps {
  count?: number;
  radius?: number;
  twinkleFraction?: number;
}

/**
 * ~5000 instanced points scattered on a large sphere. A small fraction of
 * stars twinkle at varying frequencies. We pre-bake per-star phase + speed
 * into attribute buffers so the per-frame cost is just a uniform update.
 */
export default function Starfield({
  count = 5000,
  radius = 90,
  twinkleFraction = 0.05,
}: StarfieldProps) {
  const ref = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const baseAlpha = new Float32Array(count);
    const twinklePhase = new Float32Array(count);
    const twinkleSpeed = new Float32Array(count);
    const twinkleAmp = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Uniform sampling on a sphere (Marsaglia)
      const u = Math.random() * 2 - 1;
      const theta = Math.random() * Math.PI * 2;
      const r = Math.sqrt(1 - u * u);
      positions[i * 3 + 0] = radius * r * Math.cos(theta);
      positions[i * 3 + 1] = radius * u;
      positions[i * 3 + 2] = radius * r * Math.sin(theta);

      baseAlpha[i] = 0.35 + Math.random() * 0.55;
      twinklePhase[i] = Math.random() * Math.PI * 2;
      const twinkles = Math.random() < twinkleFraction;
      twinkleSpeed[i] = twinkles ? 0.6 + Math.random() * 1.6 : 0;
      twinkleAmp[i] = twinkles ? 0.45 : 0;
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geom.setAttribute("aBaseAlpha", new THREE.BufferAttribute(baseAlpha, 1));
    geom.setAttribute("aPhase", new THREE.BufferAttribute(twinklePhase, 1));
    geom.setAttribute("aSpeed", new THREE.BufferAttribute(twinkleSpeed, 1));
    geom.setAttribute("aAmp", new THREE.BufferAttribute(twinkleAmp, 1));
    return geom;
  }, [count, radius, twinkleFraction]);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: {
          value: typeof window !== "undefined" ? Math.min(window.devicePixelRatio, 2) : 1,
        },
      },
      vertexShader: /* glsl */ `
        attribute float aBaseAlpha;
        attribute float aPhase;
        attribute float aSpeed;
        attribute float aAmp;
        uniform float uTime;
        uniform float uPixelRatio;
        varying float vAlpha;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mv;
          float twinkle = sin(uTime * aSpeed + aPhase) * aAmp;
          vAlpha = clamp(aBaseAlpha + twinkle, 0.0, 1.0);
          float size = 1.4 + aAmp * 1.2;
          gl_PointSize = size * uPixelRatio * (260.0 / -mv.z);
        }
      `,
      fragmentShader: /* glsl */ `
        varying float vAlpha;
        void main() {
          vec2 c = gl_PointCoord - vec2(0.5);
          float d = length(c);
          if (d > 0.5) discard;
          float falloff = smoothstep(0.5, 0.0, d);
          gl_FragColor = vec4(vec3(1.0, 0.96, 0.88), vAlpha * falloff);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, []);

  useFrame(({ clock }) => {
    material.uniforms.uTime.value = clock.getElapsedTime();
  });

  return <points ref={ref} geometry={geometry} material={material} />;
}
