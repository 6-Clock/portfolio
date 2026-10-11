# Spec: 3D Lotus Splat Hero

Status: resolved

## Problem Statement

I'm building a new personal portfolio. I want the top of the page to feel alive and
distinctive — not a flat image or a stock header. I have a watercolor lotus illustration
I want turned into a 3D element that visitors can nudge with their mouse, so the first
thing someone sees is a tactile, memorable centerpiece rather than yet another static hero.

## Solution

The top section of the portfolio (the **Hero**) is a full-bleed, near-black panel with a
3D **Lotus Splat** — a Gaussian splat generated from my lotus illustration — as its
centerpiece. The visitor can drag (mouse or touch) to gently rotate the lotus left and
right; it eases back toward center when released, giving a living-parallax feel rather than
a full turntable. The lotus is the single hit of color against a dark, editorial backdrop,
with large minimal typography overlaid. Below the Hero, the rest of the portfolio
(About me, Experience, Projects, Education, Certificates, Contacts) scrolls as ordinary
sections. The site is a static build deployed to Vercel.

## User Stories

1. As a portfolio visitor, I want the top of the page to show a 3D lotus, so that my first impression is distinctive and memorable.
2. As a portfolio visitor, I want to drag the lotus horizontally with my mouse, so that I feel I'm interacting with the page rather than just reading it.
3. As a portfolio visitor on a phone, I want to drag the lotus with my finger, so that the interaction works on touch devices too.
4. As a portfolio visitor, I want the lotus to ease back toward center when I let go, so that the composition always resettles into its intended framing.
5. As a portfolio visitor, I want the rotation to stay within a gentle range, so that I never end up staring at the flat, thin edge of the illustration.
6. As a portfolio visitor, I want the lotus to appear smoothly (fade in) once it's ready, so that I don't see a jarring pop-in or a broken frame.
7. As a portfolio visitor on a low-end device or a browser without WebGL, I want a static image of the lotus instead, so that the Hero never looks broken.
8. As a portfolio visitor, I want the Hero to fill the screen on load, so that the lotus feels immersive and front-and-center.
9. As a portfolio visitor, I want to read the title text clearly over the dark backdrop, so that I immediately know whose portfolio this is.
10. As a portfolio visitor, I want to scroll past the Hero into the content sections, so that I can explore the rest of the portfolio.
11. As a portfolio visitor, I want the About me, Experience, Projects, Education, Certificates, and Contacts sections to exist, so that I know where future content will live.
12. As the portfolio owner, I want the Hero text to be an editable placeholder (`TITLE`) for now, so that I can drop in my real name and role later without rework.
13. As the portfolio owner, I want the lotus asset generated from my own illustration (`lotusflower_ref1.0.jpg`), so that the 3D element is unique to my portfolio.
14. As the portfolio owner, I want the asset generated on my own GPU via TripoSplat, so that I control the input and don't depend on a hosted service.
15. As the portfolio owner, I want the splat kept at a reasonable file size, so that the Hero loads quickly for visitors.
16. As the portfolio owner, I want the site to build to a static bundle, so that I can host it cheaply and simply on Vercel.
17. As the portfolio owner, I want to run the git and deploy commands myself, so that I keep control over what gets pushed and when.
18. As the portfolio owner, I want a clear list of deploy commands, so that shipping to Vercel is a copy-paste step.
19. As the portfolio owner, I want the reference materials kept out of the deployed bundle, so that visitors only download what the site needs.
20. As a developer picking this up, I want the rotation logic isolated as a pure module, so that I can test and tune the sway behavior without running WebGL.
21. As a developer picking this up, I want capability detection isolated, so that I can verify the live-vs-fallback decision in a test.
22. As a developer picking this up, I want a browser smoke check, so that I can confirm the Hero mounts and the fallback works end to end.

## Implementation Decisions

- **Asset pipeline (TripoSplat).** The **Lotus Splat** is generated offline from
  `Portfolio/references/lotusflower_ref1.0.jpg` using the local TripoSplat repo the user
  pulled. TripoSplat is a single-image → 3D-Gaussian model; it auto-removes the background
  (BiRefNet) and exports `.ply` + `.splat`. Target `num_gaussians = 131072` (fp16) for a
  ~4 MB `.splat`. The RTX 4060 (8 GB) is the constraint; if generation OOMs, drop to
  `65536` (~2 MB) and retry. Model weights download once into `TripoSplat/ckpts/`. Only the
  final `.splat` is copied into the site (as `public/lotus.splat`); the pipeline itself is
  not part of the site build.
- **Flat-source trade-off.** The source is a flat 2D illustration, so the resulting splat
  is a shallow 2.5D relief with no true back side. This is the reason the **Sway**
  interaction is constrained rather than a full turntable (see ADR).
- **Project scaffold.** Vite + TypeScript + three.js, scaffolded at the `Portfolio/` root.
  Static build output (`dist/`) is what deploys. `references/` and `information.md` remain
  in the repo but are excluded from the bundle.
- **Renderer.** SparkJS (three.js-native Gaussian-splat renderer, recommended by
  TripoSplat) loads `public/lotus.splat`. Any cross-origin isolation headers SparkJS
  requires are set in `vercel.json` and in the Vite dev server config.
- **Hero module.** Owns a full-viewport (100vh) canvas on a near-black background, mounts
  the SparkJS scene, overlays placeholder `TITLE` typography (large, minimal, lower-left),
  and fades the splat in on load.
- **Sway module (pure).** Maps pointer/touch drag state → a target azimuth clamped to
  roughly ±25°, and produces an ease-back-toward-center update per frame. No WebGL
  dependency; the Hero feeds its output into the camera/object transform. Exact clamp and
  easing constants are tuned once the real splat is visible.
- **Capability detection (pure).** A function that reports whether WebGL is usable; the
  Hero uses it to choose the live splat vs a static fallback image.
- **Fallback.** When WebGL is unavailable, the Hero renders a static rendered image of the
  lotus in place of the canvas.
- **Content shell.** Six stub sections below the Hero — About me, Experience, Projects,
  Education, Certificates, Contacts — as empty placeholders for later content.
- **Deploy.** Static build to Vercel via GitHub integration. The agent does **not** run any
  git or push commands; it prepares `vercel.json`, `.gitignore` (ignoring `node_modules`,
  `dist`, `ckpts/`), and a `DEPLOY.md` with the exact commands for the owner to run.

## Testing Decisions

- **What makes a good test here:** assert external behavior, not implementation. The valuable
  surface is the rotation math and the live-vs-fallback decision — both expressible as pure
  functions with deterministic inputs/outputs. WebGL rendering, SparkJS internals, and the
  splat's appearance are not unit-tested; they're verified visually and by a browser smoke
  check.
- **Seam 1 — Sway module (unit).** Given a sequence of drag deltas, the target azimuth stays
  within the clamp; past the clamp it saturates rather than overshooting; after release, the
  ease-back step moves monotonically toward center and settles. Pure, no browser.
- **Seam 2 — Capability detection (unit).** Given a present/absent WebGL context, the function
  returns the correct live-vs-fallback decision.
- **Seam 3 — Browser smoke (verification, via `/browse`).** Load the built site: the Hero
  canvas mounts with no console errors; with WebGL forced off, the static fallback renders in
  its place; the content sections are present below the Hero.
- **Prior art:** none yet — this is a greenfield project, so these seams establish the pattern
  (pure-logic unit tests + a single browser smoke check) for future work.

## Out of Scope

- Real Hero copy (name/role/tagline) — a `TITLE` placeholder stands in.
- Content for the six sections — they ship empty.
- Running TripoSplat as part of CI or the site build — asset generation is a one-time offline
  step.
- Full 360° rotation, zoom, or free-orbit of the lotus.
- Any git operations, remote creation, or the actual Vercel deploy — the owner runs these.
- Re-running or retraining TripoSplat beyond the single generation (and the one OOM fallback).
- SEO, analytics, accessibility beyond legible contrast, and cross-browser matrix testing.

## Further Notes

- The `.splat` format and SparkJS are the web-facing contract; the `.ply` is kept only as a
  source-of-truth backup, not shipped.
- The sway range and easing are intentionally left as tunable constants; expect one pass of
  hand-tuning after the real splat is in place.
- Domain vocabulary used here: **Hero** (the top full-viewport section), **Lotus Splat** (the
  Gaussian-splat asset), **Sway** (the constrained ease-back rotation). A `GLOSSARY.md` and an
  ADR capturing the 2.5D-relief/sway trade-off were offered during grilling and may be written
  alongside implementation.
