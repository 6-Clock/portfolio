# 02: Viewpoint placards

**What to build:** Each Viewpoint shows a bound Placard that swaps in when the
visitor steps to it. Stepping forward/backward with the arrow buttons or the
← → keys crossfades the Placard in time with the pool's rotation: FrontLotus
shows the Name headline (no body), Bird shows an "About me" card (title + body),
and Dragonfly shows a "What I do" card (title + body). Free-dragging the pool to
look around does NOT change the Placard — only committed viewpoint steps do, the
same state that drives the name label.

**Blocked by:** 01 (needs the overlay chrome regions + content config)

**Status:** resolved

- [x] The viewpoint model carries each Viewpoint's Placard content
      (`kind` + title + body; FrontLotus is a headline-only `name` kind,
      Bird/Dragonfly are `prose` kind)
- [x] A pure `viewpointPlacard(state)` lookup returns the Placard for the current
      viewpoint
- [x] `viewpoints.test.ts` is extended: stepping forward and backward returns the
      expected Placard per viewpoint; the Name placard has no body; the prose
      placards have a title and body
- [x] Stepping viewpoints (arrows / ← → keys) crossfades the Placard and updates
      the top-center name together
- [x] Free drag rotates the pool without changing the Placard
- [x] Placard copy ships as clearly-marked placeholders
- [x] `GLOSSARY.md` updated so a Viewpoint is defined as carrying both an
      orientation and its Placard
