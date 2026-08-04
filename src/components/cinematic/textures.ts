import * as THREE from "three";

/**
 * Texture paths the cinematic Earth scene wants to load. Drop NASA Blue Marble
 * style assets at these paths in /public/textures/ to upgrade the look:
 *
 *   earth_day.jpg     — 2K (or 4K) realistic surface map
 *   earth_normal.jpg  — terrain bump/normal map
 *   earth_specular.jpg — ocean specular mask (white = water)
 *   earth_clouds.png   — cloud layer with alpha
 *   earth_night.jpg    — city lights night map
 *
 * If a file is missing the loader falls through to the existing
 * /earth-water.png base map and the scene degrades gracefully.
 */
export const TEXTURE_PATHS = {
  day: "/textures/earth_day.jpg",
  normal: "/textures/earth_normal.jpg",
  specular: "/textures/earth_specular.jpg",
  clouds: "/textures/earth_clouds.png",
  night: "/textures/earth_night.jpg",
  fallback: "/earth-water.png",
} as const;

/**
 * Synchronously create a TextureLoader-driven texture. Returns null if the
 * fetch fails. We use a manual onLoad/onError handler so the component can
 * decide which layers to render once textures resolve, without breaking
 * Strict Mode (the original Globe pattern uses useTexture/useMemo and we
 * preserve that approach for the day map).
 */
export function loadTextureWithFallback(
  loader: THREE.TextureLoader,
  url: string,
  onResolve: (tex: THREE.Texture | null) => void,
): void {
  loader.load(
    url,
    (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      onResolve(tex);
    },
    undefined,
    () => onResolve(null),
  );
}
