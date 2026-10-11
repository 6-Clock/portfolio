// Sway: the pure rotation model behind the lotus' turntable feel. It maps drag
// input to an unbounded azimuth and holds wherever the drag leaves it, so the
// splat can be rotated all the way around. No WebGL or DOM here — the Hero feeds
// `azimuth` into the splat pivot each frame, so the behaviour is unit-testable.

export interface SwayConfig {
  /** Max |azimuth| in radians, or Infinity for unbounded (full) rotation. */
  clampRad: number;
  /** Radians of azimuth per pixel of horizontal drag. */
  dragSensitivity: number;
  /** Fraction of the remaining distance to centre removed per frame on
   *  release (0..1). 0 disables spring-back so the azimuth holds in place. */
  easeBack: number;
  /** Below this |azimuth| the ease-back snaps to exactly 0 and settles. */
  settleEpsilon: number;
}

export interface SwayState {
  /** Current azimuth in radians — this is what the scene renders. */
  azimuth: number;
  /** Whether a pointer/touch drag is in progress. */
  dragging: boolean;
}

// Free turntable: unbounded rotation that holds where you leave it (no clamp,
// no spring-back). See ticket 04 notes.
export const DEFAULT_SWAY: SwayConfig = {
  clampRad: Infinity,
  dragSensitivity: 0.0015,
  easeBack: 0,
  settleEpsilon: 1e-4,
};

function clamp(value: number, limit: number): number {
  return Math.max(-limit, Math.min(limit, value));
}

export function createSway(): SwayState {
  return { azimuth: 0, dragging: false };
}

export function beginDrag(state: SwayState): SwayState {
  return { ...state, dragging: true };
}

export function release(state: SwayState): SwayState {
  return { ...state, dragging: false };
}

/** Apply a horizontal drag delta (px). Azimuth accumulates and saturates at the
 *  clamp rather than overshooting. */
export function applyDrag(
  state: SwayState,
  deltaPx: number,
  config: SwayConfig = DEFAULT_SWAY,
): SwayState {
  const next = state.azimuth + deltaPx * config.dragSensitivity;
  return { ...state, azimuth: clamp(next, config.clampRad) };
}

/** Advance one frame. While dragging, the azimuth is held where the drag put
 *  it; once released, it eases monotonically toward centre and settles at 0. */
export function step(
  state: SwayState,
  config: SwayConfig = DEFAULT_SWAY,
): SwayState {
  if (state.dragging) return state;
  const eased = state.azimuth * (1 - config.easeBack);
  if (Math.abs(eased) < config.settleEpsilon) {
    return { ...state, azimuth: 0 };
  }
  return { ...state, azimuth: eased };
}
