import { describe, it, expect } from "vitest";
import { isWebGLSupported, type GLProbe } from "./capability";

function canvasReturning(ctx: unknown | null): () => GLProbe {
  return () => ({ getContext: () => ctx });
}

describe("capability: WebGL detection", () => {
  it("reports supported when a context is available", () => {
    expect(isWebGLSupported(canvasReturning({ fake: "gl" }))).toBe(true);
  });

  it("reports unsupported when no context can be created", () => {
    expect(isWebGLSupported(canvasReturning(null))).toBe(false);
  });

  it("reports unsupported when creating the probe throws", () => {
    expect(
      isWebGLSupported(() => {
        throw new Error("no canvas");
      }),
    ).toBe(false);
  });

  it("reports unsupported when getContext itself throws", () => {
    expect(
      isWebGLSupported(() => ({
        getContext: () => {
          throw new Error("context creation failed");
        },
      })),
    ).toBe(false);
  });
});
