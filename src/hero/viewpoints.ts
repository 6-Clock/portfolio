// Viewpoints: the pure model behind named-orientation navigation. Each Viewpoint
// frames one feature of the pool at a fixed azimuth (degrees, offset from the
// resting frame). They form a loop; stepping forward/backward moves to the
// adjacent viewpoint. No DOM or WebGL here — the Hero feeds the resulting
// azimuth into the splat, so the wrap/continuity behaviour is unit-testable.

import type { Placard } from "../content";
import { SITE_CONTENT } from "../content";

export interface Viewpoint {
  /** Display name shown in the hero label. */
  name: string;
  /** Canonical azimuth in degrees, offset from the resting frame. */
  azimuthDeg: number;
  /** The overlay Placard that swaps in when this viewpoint is committed to. */
  placard: Placard;
}

// Ordered loop. Forward (FrontLotus → Bird → Dragonfly → FrontLotus) sweeps the
// whole circle in the negative direction, matching the degrees the pool's
// features actually sit at. Each viewpoint carries both its orientation and its
// Placard; the Placard copy comes from the single content config.
export const VIEWPOINTS: readonly Viewpoint[] = [
  { name: "FrontLotus", azimuthDeg: 0, placard: SITE_CONTENT.placards.FrontLotus },
  { name: "Bird", azimuthDeg: -165, placard: SITE_CONTENT.placards.Bird },
  { name: "Dragonfly", azimuthDeg: -335, placard: SITE_CONTENT.placards.Dragonfly },
];

export interface ViewpointState {
  /** Index into the viewpoint list. */
  index: number;
  /** Continuous azimuth in degrees. Unlike the canonical value it keeps
   *  accumulating past ±360 so stepping always moves in the pressed direction
   *  rather than snapping back across the loop seam. */
  azimuthDeg: number;
}

export function initialViewpoint(
  list: readonly Viewpoint[] = VIEWPOINTS,
): ViewpointState {
  return { index: 0, azimuthDeg: list[0].azimuthDeg };
}

/** Step to the adjacent viewpoint. `dir` > 0 is forward (clockwise/right),
 *  `dir` < 0 is backward. The returned azimuth continues in the pressed
 *  direction, wrapping across the seam instead of taking the short way back. */
export function stepViewpoint(
  state: ViewpointState,
  dir: number,
  list: readonly Viewpoint[] = VIEWPOINTS,
): ViewpointState {
  const n = list.length;
  const forward = dir > 0;
  const nextIndex = (((state.index + (forward ? 1 : -1)) % n) + n) % n;

  // Gap between the canonical angles, forced into the pressed direction so the
  // seam (e.g. Dragonfly -335° → FrontLotus) continues to -360° rather than +335°.
  let gap = list[nextIndex].azimuthDeg - list[state.index].azimuthDeg;
  if (forward && gap > 0) gap -= 360;
  if (!forward && gap < 0) gap += 360;

  return { index: nextIndex, azimuthDeg: state.azimuthDeg + gap };
}

export function viewpointName(
  state: ViewpointState,
  list: readonly Viewpoint[] = VIEWPOINTS,
): string {
  return list[state.index].name;
}

/** The Placard bound to the current viewpoint. Pure lookup, no DOM. */
export function viewpointPlacard(
  state: ViewpointState,
  list: readonly Viewpoint[] = VIEWPOINTS,
): Placard {
  return list[state.index].placard;
}
