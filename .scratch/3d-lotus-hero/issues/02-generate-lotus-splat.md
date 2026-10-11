# 02: Generate the Lotus Splat asset

**What to build:** The **Lotus Splat** asset, generated offline from the owner's illustration so the Hero has a 3D element unique to this portfolio. Using the local TripoSplat repo on the owner's GPU, produce a Gaussian splat from `references/lotusflower_ref1.0.jpg` and place the shippable file where the site can load it.

**Blocked by:** None (can start immediately — runs in parallel with 01)

**Status:** resolved

- [x] TripoSplat model weights are downloaded once into `TripoSplat/ckpts/` (confirm with owner before the multi-GB download)
- [x] Inference runs on `references/lotusflower_ref1.0.jpg` at `num_gaussians = 131072` (fp16); background removed automatically
- [x] On GPU OOM (8 GB), retry at `num_gaussians = 65536` and record which count was used
- [x] Both `.ply` (kept as source-of-truth backup) and `.splat` are produced
- [x] The final `.splat` is copied to `public/lotus.splat` for the site to load
- [x] The `.splat` opens and shows the lotus in a splat viewer (e.g. SuperSplat / SparkJS)

## Comments

- The asset was already generated offline by the owner on the RTX 4060 — present at `references/lotus-triposplat-final/`. The manifest (`triposplat_manifest.json`) records a successful run at `num_gaussians = 131072`, `seed 42`, `steps 20`, `device cuda`; no OOM, so the 65536 fallback was not needed. Background removal is confirmed by `preprocessed_input.png` (lotus on transparent/black). PLY validation in the manifest: `valid_gaussian_splat: true`, 131072 vertices, 17 properties.
- Both `triposplat_131072.ply` (8.9 MB, source-of-truth backup) and `triposplat_131072.splat` (4.0 MB = 131072 × 32 bytes) exist.
- Copied `triposplat_131072.splat` → `public/lotus.splat`. Also copied `preprocessed_input.png` → `public/lotus-fallback.png` for the WebGL fallback (ticket 05).
- Viewer confirmation: the splat is rendered live via SparkJS in ticket 03 and exercised by the browser smoke check in ticket 05.
