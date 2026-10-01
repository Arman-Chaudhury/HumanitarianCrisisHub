/**
 * Globe numbers shared between the WebGL scene and the page components.
 * They live in their own file so a page can import them without pulling
 * Three.js into its bundle.
 */
export const GLOBE_RADIUS = 2;
export const ORBITAL_DISTANCE = 8.4;
export const ORBITAL_FOV = 38;
export const ZOOM_MIN = 5;
export const ZOOM_MAX = 10.5;

/** Pixel offset applied to the camera's view, so the globe can sit off-centre. */
export interface ViewShift {
  x: number;
  y: number;
}

/** Region of the canvas, in pixels, where hotspot labels are allowed. */
export interface LabelBounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
}
