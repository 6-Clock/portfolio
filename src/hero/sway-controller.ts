// Thin DOM glue between pointer/touch input and the pure Sway model. It owns the
// listeners and a rAF loop that steps Sway and pushes the azimuth into the
// scene. All the behaviour worth testing lives in sway.ts; this file is just
// wiring (verified by the browser smoke check).
import {
  createSway,
  beginDrag,
  applyDrag,
  release,
  step,
  DEFAULT_SWAY,
  type SwayConfig,
  type SwayState,
} from "./sway";

export interface SwayController {
  /** Smoothly animate the azimuth to an absolute angle (radians) over `durationMs`.
   *  Used by viewpoint navigation (arrow keys / border buttons). A fresh drag
   *  cancels the animation and takes over from wherever it had reached. */
  animateAzimuthTo(radians: number, durationMs?: number): void;
  dispose(): void;
}

interface AzimuthTween {
  from: number;
  to: number;
  start: number;
  duration: number;
}

// Ease-in-out cubic: gentle acceleration and settle for the viewpoint glide.
function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function attachSway(
  canvas: HTMLElement,
  setAzimuth: (radians: number) => void,
  config: SwayConfig = DEFAULT_SWAY,
): SwayController {
  let state: SwayState = createSway();
  let lastX = 0;
  let frame = 0;
  let tween: AzimuthTween | null = null;

  const onPointerDown = (e: PointerEvent): void => {
    // Only the primary button/contact starts a drag (ignore right/middle click).
    if (e.button !== 0) return;
    tween = null; // a drag cancels any in-flight viewpoint glide
    state = beginDrag(state);
    lastX = e.clientX;
    canvas.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!state.dragging) return;
    const delta = e.clientX - lastX;
    lastX = e.clientX;
    state = applyDrag(state, delta, config);
  };

  const endDrag = (e: PointerEvent): void => {
    if (!state.dragging) return;
    state = release(state);
    canvas.releasePointerCapture?.(e.pointerId);
  };

  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", endDrag);
  canvas.addEventListener("pointercancel", endDrag);

  const tick = (now: number): void => {
    if (state.dragging) {
      tween = null;
      state = step(state, config);
    } else if (tween) {
      const t = tween.duration > 0 ? (now - tween.start) / tween.duration : 1;
      const clamped = Math.min(1, Math.max(0, t));
      const azimuth = tween.from + (tween.to - tween.from) * easeInOut(clamped);
      state = { ...state, azimuth };
      if (clamped >= 1) tween = null;
    } else {
      state = step(state, config);
    }
    setAzimuth(state.azimuth);
    frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);

  return {
    animateAzimuthTo(radians: number, durationMs = 600): void {
      tween = {
        from: state.azimuth,
        to: radians,
        start: performance.now(),
        duration: durationMs,
      };
    },
    dispose(): void {
      cancelAnimationFrame(frame);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", endDrag);
      canvas.removeEventListener("pointercancel", endDrag);
    },
  };
}
