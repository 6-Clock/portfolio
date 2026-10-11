# 03: Render the Lotus Splat in the Hero

**What to build:** The lotus actually appears. Integrate SparkJS so `public/lotus.splat` loads into the Hero, centered against the dark backdrop with the `TITLE` overlay on top, and fades in smoothly once ready. No drag interaction yet — this slice is the static 3D centerpiece.

**Blocked by:** 01, 02

**Status:** resolved

- [x] SparkJS is added and loads `public/lotus.splat` into a three.js scene in the Hero
- [x] The lotus renders centered and framed within the full-viewport Hero over the near-black background, with the `TITLE` overlay legible on top
- [x] The splat fades in on load rather than popping in; no broken/empty frame is shown while loading
- [x] Any cross-origin isolation headers SparkJS requires are added to `vercel.json` and the Vite dev server config
- [x] `npm run build` still succeeds and the built site renders the lotus

## Comments

- `src/hero/scene.ts` encapsulates the three.js + SparkJS WebGL scene: a `SplatMesh({ url: "/lotus.splat" })` added to a pivot group, recentered via its bounding box and framed by the camera. A 180° X-flip (`UP_FLIP_X`) sits the splat upright (SparkJS splats are Y-down vs three.js Y-up). The scene exposes `ready`, `setAzimuth()` (for ticket 04's Sway), and `dispose()`.
- `src/hero/hero.ts` mounts the scene into the Hero canvas and adds `is-ready` on load → CSS `opacity` transition fades the splat in (no pop-in; canvas starts at opacity 0).
- COOP/COEP headers set in both `vercel.json` and `vite.config.ts` (dev + preview).
- Verified against the production build via `npm run preview` + `/browse`: lotus renders upright/centered/in-color over near-black, `TITLE` legible (mix-blend-mode difference), Hero is exactly 100vh (720=innerHeight), canvas faded in, no console errors (only benign WebGL ReadPixels perf warnings from the splat sorter).
