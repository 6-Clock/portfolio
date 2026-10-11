# Deploy

This portfolio is a static Vite build deployed to **Vercel via GitHub integration**.
The commands below are yours to run — the agent does not run any git, push, or
deploy commands.

## One-time: build locally to sanity-check

```bash
cd Portfolio
npm install
npm run build      # produces dist/
npm run preview    # serves dist/ locally at http://localhost:4173
```

## One-time: create the repo and push

Run these from the `Portfolio/` directory.

```bash
git init
git add .
git commit -m "Initial portfolio: 3D lotus splat hero"
git branch -M main
git remote add origin git@github.com:<your-username>/<your-repo>.git
git push -u origin main
```

`node_modules/`, `dist/`, `ckpts/`, `references/`, and `information.md` are
git-ignored, so only the site source plus the splat and fallback assets it
loads (`public/lotuspoolwtt.splat`, `public/lotuspool.png`) are pushed.

## One-time: connect Vercel

1. Go to https://vercel.com/new and import the GitHub repo you just pushed.
2. Set the **Root Directory** to `Portfolio` (if the repo root is this folder,
   leave it as-is).
3. Vercel auto-detects Vite. The settings below come from `vercel.json`:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - The cross-origin isolation headers (COOP/COEP) required by the splat
     renderer are applied automatically from `vercel.json`.
4. Click **Deploy**.

## Ongoing: ship changes

```bash
git add .
git commit -m "<what changed>"
git push
```

Every push to `main` triggers a production deploy. Pushes to other branches get
preview deploys.
