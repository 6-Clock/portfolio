# 04: Sway interaction (drag + touch)

**What to build:** The lotus becomes tactile. A visitor can drag — with mouse or finger — to rotate the lotus gently left and right within a constrained range, and it eases back toward center when released, giving living parallax rather than a full turntable that would expose the flat relief's edge. The rotation logic lives in a pure **Sway** module so it can be tuned and tested without WebGL.

**Blocked by:** 03

**Status:** resolved

- [x] A pure Sway module maps drag state (pointer/touch delta, release) to a target azimuth clamped to roughly ±25°, with a per-frame ease-back-toward-center update
- [x] The module is wired into the Hero so both mouse drag and touch drag rotate the lotus
- [x] On release, the lotus eases monotonically back to center and settles
- [x] Past the clamp the azimuth saturates instead of overshooting
- [x] Clamp and easing constants are hand-tuned against the real splat so no thin-edge view is reachable
- [x] Unit tests cover the clamp, saturation, and ease-back behavior and pass via `npm test`

## Comments

- `src/hero/sway.ts` is the pure model: `applyDrag` accumulates `deltaPx * dragSensitivity` and clamps to `±clampRad`; `step` holds while dragging and otherwise eases `azimuth *= (1 - easeBack)` with an epsilon snap to exactly 0. `DEFAULT_SWAY` is tuned to ±25°, ~0.0015 rad/px, 0.08 ease/frame.
- `src/hero/sway-controller.ts` is thin DOM glue: PointerEvents (cover mouse + touch + pen) drive the state, a rAF loop steps Sway and calls `scene.setAzimuth`. Wired in `hero.ts`.
- `src/hero/sway.test.ts`: 6 tests covering clamp, symmetric saturation, monotonic ease-back + settle-at-0, and hold-while-dragging — all pass via vitest.
- Verified live via `/browse`: a simulated +300px drag rotates the lotus and saturates at the clamp (relief stays readable, no thin edge); on pointerup it eases back to the resting framing. No console errors.
