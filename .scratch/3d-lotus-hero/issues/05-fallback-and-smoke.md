# 05: WebGL fallback + browser smoke

**What to build:** The Hero never breaks. On devices or browsers without usable WebGL, a static image of the lotus is shown in place of the live splat, and a browser smoke check confirms the Hero mounts cleanly and the fallback path works end to end. Capability detection lives in a pure module so the live-vs-fallback decision is testable.

**Blocked by:** 03

**Status:** resolved

- [x] A pure capability-detection module reports whether WebGL is usable
- [x] When WebGL is unavailable, the Hero renders a static rendered image of the lotus instead of the canvas
- [x] Unit tests cover both the WebGL-present and WebGL-absent decisions and pass via `npm test`
- [x] A `/browse` smoke check confirms: the Hero canvas mounts with no console errors, the six content sections are present below it, and with WebGL forced off the static fallback renders in place

## Comments

- `src/hero/capability.ts` — `isWebGLSupported(createProbe?)` tries `webgl2`/`webgl`/`experimental-webgl` and returns false on any failure (no context, thrown error). The probe is injectable so the decision is testable without a real GL context.
- `src/hero/capability.test.ts` — 4 tests: context present → true; null context → false; probe throws → false; getContext throws → false.
- `hero.ts` branches on `isWebGLSupported()`: unusable → hide the canvas and show `public/lotus-fallback.png` (the TripoSplat `preprocessed_input.png`, bg-removed lotus on dark). Also falls back if the scene throws while mounting.
- `/browse` smoke (verified):
  - Production build (`npm run preview`, :4173): canvas mounts and reaches `is-ready`, no console errors (only benign WebGL ReadPixels perf warnings).
  - Six sections (`about…contacts`) present below the Hero in both paths.
  - WebGL forced off via a temporary inline-script harness on the dev server: canvas becomes `hidden`, the fallback `<img>` renders in place (loaded, 1024px), sections still present. Harness removed after verification.
  - Note: Vite's dev server emits a `431` + `application/wasm` MIME warning for SparkJS; these are dev-only — the production build inlines the WASM as a data URL and the preview console is clean.
