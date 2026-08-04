"use client";

import { useMemo } from "react";
import * as THREE from "three";

interface AtmosphereProps {
  radius?: number;
  intensity?: number;
}

/**
 * Fresnel rim around the Earth. Rendered on a back-side sphere slightly larger
 * than the planet so the rim glows where the eye-to-surface angle approaches
 * grazing. Warm cyan-white tone matches the brief.
 */
export default function Atmosphere({ radius = 2.18, intensity = 1.2 }: AtmosphereProps) {
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uIntensity: { value: intensity },
        uColor: { value: new THREE.Color(0x6cb8ff) },
        uHighlight: { value: new THREE.Color(0xe8f4ff) },
      },
      vertexShader: /* glsl */ `
        varying vec3 vNormal;
        varying vec3 vView;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vNormal = normalize(normalMatrix * normal);
          vView = normalize(-mv.xyz);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */ `
        varying vec3 vNormal;
        varying vec3 vView;
        uniform float uIntensity;
        uniform vec3 uColor;
        uniform vec3 uHighlight;
        void main() {
          float fres = pow(1.0 - clamp(dot(vNormal, vView), 0.0, 1.0), 2.4);
          vec3 col = mix(uColor, uHighlight, fres * 0.6);
          gl_FragColor = vec4(col, fres * uIntensity);
        }
      `,
      transparent: true,
      side: THREE.BackSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, [intensity]);

  return (
    <mesh material={material}>
      <sphereGeometry args={[radius, 64, 64]} />
    </mesh>
  );
}
