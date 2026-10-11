// Capability detection: can this browser actually run the live splat? The Hero
// uses this to choose the WebGL scene vs the static fallback image. The probe is
// injectable so the live-vs-fallback decision is unit-testable without a real
// WebGL context.

export interface GLProbe {
  getContext(type: string): unknown | null;
}

function defaultProbe(): GLProbe {
  return document.createElement("canvas");
}

/** True when a WebGL (or WebGL2) rendering context can be created. Any failure —
 *  no context, a thrown error, a missing canvas — resolves to "not usable" so
 *  the Hero falls back rather than showing a broken frame. */
export function isWebGLSupported(
  createProbe: () => GLProbe = defaultProbe,
): boolean {
  try {
    const probe = createProbe();
    return Boolean(
      probe.getContext("webgl2") ||
        probe.getContext("webgl") ||
        probe.getContext("experimental-webgl"),
    );
  } catch {
    return false;
  }
}
