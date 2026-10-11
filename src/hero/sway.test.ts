import { describe, it, expect } from "vitest";
import {
  createSway,
  beginDrag,
  applyDrag,
  release,
  step,
  DEFAULT_SWAY,
  type SwayConfig,
} from "./sway";

// A tight config keeps the arithmetic easy to reason about in tests.
const cfg: SwayConfig = {
  clampRad: 0.4, // ~23°
  dragSensitivity: 0.01, // rad per px
  easeBack: 0.5, // halve the distance to centre each step
  settleEpsilon: 1e-4,
};

describe("sway: clamp + saturation", () => {
  it("maps drag delta to azimuth within the clamp", () => {
    let s = beginDrag(createSway());
    s = applyDrag(s, 10, cfg); // 10px * 0.01 = 0.1 rad
    expect(s.azimuth).toBeCloseTo(0.1, 6);
    expect(Math.abs(s.azimuth)).toBeLessThanOrEqual(cfg.clampRad);
  });

  it("saturates at the clamp instead of overshooting", () => {
    let s = beginDrag(createSway());
    s = applyDrag(s, 1000, cfg); // way past the clamp
    expect(s.azimuth).toBeCloseTo(cfg.clampRad, 6);

    // Dragging further in the same direction stays pinned at the clamp.
    s = applyDrag(s, 1000, cfg);
    expect(s.azimuth).toBeCloseTo(cfg.clampRad, 6);
  });

  it("clamps symmetrically in the negative direction", () => {
    let s = beginDrag(createSway());
    s = applyDrag(s, -1000, cfg);
    expect(s.azimuth).toBeCloseTo(-cfg.clampRad, 6);
  });
});

describe("sway: ease-back after release", () => {
  it("moves monotonically toward centre and settles at exactly 0", () => {
    let s = beginDrag(createSway());
    s = applyDrag(s, 1000, cfg); // pinned at +clamp
    s = release(s);

    let prev = Math.abs(s.azimuth);
    let steps = 0;
    while (s.azimuth !== 0 && steps < 1000) {
      s = step(s, cfg);
      const mag = Math.abs(s.azimuth);
      expect(mag).toBeLessThanOrEqual(prev); // monotonic toward centre
      prev = mag;
      steps++;
    }
    expect(s.azimuth).toBe(0); // settled exactly
    expect(steps).toBeLessThan(1000); // in finite time
  });

  it("does not ease while the pointer is still held", () => {
    let s = beginDrag(createSway());
    s = applyDrag(s, 20, cfg); // 0.2 rad
    const held = step(s, cfg);
    expect(held.azimuth).toBeCloseTo(0.2, 6); // unchanged while dragging
  });
});

describe("sway: defaults", () => {
  it("exposes a free-turntable default: unbounded and no spring-back", () => {
    expect(DEFAULT_SWAY.clampRad).toBe(Infinity);
    expect(DEFAULT_SWAY.easeBack).toBe(0);
    expect(createSway().azimuth).toBe(0);
  });

  it("holds its azimuth after release with the default config", () => {
    let s = beginDrag(createSway());
    s = applyDrag(s, 1000, DEFAULT_SWAY); // large drag, no clamp
    const pinned = s.azimuth;
    expect(Math.abs(pinned)).toBeGreaterThan(1); // well past the old ±25°
    s = release(s);
    s = step(s, DEFAULT_SWAY);
    expect(s.azimuth).toBe(pinned); // stays where it was left
  });
});
