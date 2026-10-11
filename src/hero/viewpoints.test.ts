// NOTE: Reconstructed test. The original viewpoints.test.ts was deleted and
// could not be recovered byte-for-byte; these cases re-cover the public API of
// ./viewpoints (initialViewpoint / stepViewpoint / viewpointName /
// viewpointPlacard) and the loop/continuity behaviour it documents.
import { describe, it, expect } from "vitest";
import {
  VIEWPOINTS,
  initialViewpoint,
  stepViewpoint,
  viewpointName,
  viewpointPlacard,
} from "./viewpoints";

describe("viewpoints", () => {
  it("starts at the first viewpoint (FrontLotus, 0°)", () => {
    const vp = initialViewpoint();
    expect(vp.index).toBe(0);
    expect(vp.azimuthDeg).toBe(VIEWPOINTS[0].azimuthDeg);
    expect(viewpointName(vp)).toBe("FrontLotus");
  });

  it("steps forward through the loop in the negative direction", () => {
    let vp = initialViewpoint();
    vp = stepViewpoint(vp, 1);
    expect(vp.index).toBe(1);
    expect(viewpointName(vp)).toBe("Bird");
    expect(vp.azimuthDeg).toBe(-165);

    vp = stepViewpoint(vp, 1);
    expect(vp.index).toBe(2);
    expect(viewpointName(vp)).toBe("Dragonfly");
    expect(vp.azimuthDeg).toBe(-335);
  });

  it("continues past the seam rather than snapping back", () => {
    // Dragonfly (-335°) → FrontLotus forward should keep decreasing to -360°,
    // not jump the short way back to 0°.
    let vp = initialViewpoint();
    vp = stepViewpoint(vp, 1); // Bird
    vp = stepViewpoint(vp, 1); // Dragonfly
    vp = stepViewpoint(vp, 1); // FrontLotus (wrapped)
    expect(vp.index).toBe(0);
    expect(vp.azimuthDeg).toBe(-360);
    expect(viewpointName(vp)).toBe("FrontLotus");
  });

  it("steps backward across the seam in the pressed direction", () => {
    // FrontLotus (0°) backward → Dragonfly should increase to +25°, continuing
    // the pressed (positive) direction instead of diving to -335°.
    let vp = initialViewpoint();
    vp = stepViewpoint(vp, -1);
    expect(vp.index).toBe(2);
    expect(viewpointName(vp)).toBe("Dragonfly");
    expect(vp.azimuthDeg).toBe(25);
  });

  it("returns the Placard bound to the current viewpoint", () => {
    let vp = initialViewpoint();
    expect(viewpointPlacard(vp)).toBe(VIEWPOINTS[0].placard);
    vp = stepViewpoint(vp, 1);
    expect(viewpointPlacard(vp)).toBe(VIEWPOINTS[1].placard);
  });
});
