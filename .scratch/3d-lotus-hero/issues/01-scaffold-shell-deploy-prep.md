# 01: Scaffold site shell + deploy prep

**What to build:** A running portfolio site skeleton a visitor could already scroll. A Vite + TypeScript + three.js project rooted at `Portfolio/` renders a full-viewport (100vh) near-black **Hero** with the `TITLE` placeholder in large minimal type (lower-left), and below it the six stub sections — About me, Experience, Projects, Education, Certificates, Contacts — as empty placeholders that scroll normally. The project builds to a static bundle and is ready to hand off for deploy, without any git or push actions performed by the agent.

**Blocked by:** None (can start immediately)

**Status:** resolved

- [x] `npm run dev` serves a near-black full-viewport Hero with the `TITLE` placeholder text
- [x] The six named sections exist below the Hero and scroll as ordinary content
- [x] `npm run build` produces a static `dist/` with no errors
- [x] `vercel.json` (static build), `.gitignore` (ignoring `node_modules`, `dist`, `ckpts/`), and `DEPLOY.md` (exact git + Vercel commands for the owner to run) are present
- [x] `references/` and `information.md` remain in the repo but are excluded from the built bundle
- [x] No git/remote/deploy commands are run by the agent

## Comments

- Scaffolded Vite + TypeScript + three.js at `Portfolio/`. Hero markup in `src/hero/hero.ts`, six stub sections in `src/sections.ts`, styles in `src/style.css`. `npm run build` produces a clean `dist/` (verified). Deploy files: `vercel.json` (Vite static + COOP/COEP headers), `.gitignore` (node_modules, dist, ckpts/, references/, information.md), `DEPLOY.md` (owner-run git + Vercel steps). No git commands run by the agent.
