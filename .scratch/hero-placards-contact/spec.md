# Spec: Hero placards + contact dropdown

Status: resolved

## Problem Statement

The hero already lets a visitor rotate the lotus-pool splat between its three
Viewpoints (FrontLotus, Bird, Dragonfly), but stepping between them only changes
a small name label — there is no actual content tied to each view, no way to
reach me, and none of the surrounding chrome from the agreed design. As a
visitor I land on the hero and learn nothing about who this is or how to get in
touch; as the site owner I have a navigable 3D scene with nothing to say.

## Solution

Each Viewpoint gains a **Placard** — a titled block of overlay text that swaps
in when the visitor steps to that view, crossfading in time with the pool's
rotation:

- **FrontLotus** → the **Name** placard (large headline, no body)
- **Bird** → an **About me** placard (title + body)
- **Dragonfly** → a **What I do** placard (title + body: skills / tools / focus)

Around the splat sits persistent hero chrome matching the reference designs: the
Viewpoint name centered at the top, a static location (`VANCOUVER / PANAMA`)
top-right, a static `PORTFOLIO` wordmark bottom-left, the existing `SCROLL` hint
bottom-center, and a **Contact dropdown** bottom-right.

The Contact dropdown opens on hover (desktop) or tap (touch) and reveals three
actions: **Email** (hover reveals the address, click copies it to the clipboard
and briefly flashes "Copied!"), **LinkedIn** (opens the profile in a new tab),
and **Resume** (opens the resume PDF in a new tab).

## User Stories

1. As a visitor, I want the hero to show a headline with the owner's name when I
   first land (FrontLotus), so that I immediately know whose portfolio this is.
2. As a visitor, I want stepping to the Bird viewpoint to reveal an "About me"
   placard, so that I can learn about the owner.
3. As a visitor, I want stepping to the Dragonfly viewpoint to reveal a "What I
   do" placard, so that I can understand the owner's skills and focus.
4. As a visitor, I want the placard to crossfade as the pool rotates, so that the
   text change feels connected to the 3D motion rather than abrupt.
5. As a visitor, I want the placard to change only when I commit to a viewpoint
   (arrow buttons / ← → keys), so that free-dragging the pool to look around
   doesn't flicker the text.
6. As a visitor using the keyboard, I want the ← and → keys to step viewpoints
   and swap placards, so that I can navigate without a mouse.
7. As a visitor, I want the current Viewpoint's name shown centered at the top in
   uppercase, so that I always know which view I'm looking at.
8. As a visitor, I want to see the owner's location (VANCOUVER / PANAMA) top-right,
   so that I know where they're based.
9. As a visitor, I want a `PORTFOLIO` wordmark bottom-left, so that the hero reads
   as a portfolio landing.
10. As a visitor, I want a `CONTACT ME` control bottom-right, so that I can find
    how to reach the owner.
11. As a desktop visitor, I want the contact dropdown to open when I hover over
    `CONTACT ME`, so that I can see the options without clicking.
12. As a desktop visitor, I want a short close-delay on the dropdown, so that
    moving my pointer from the heading into the options doesn't snap it shut.
13. As a touch/mobile visitor, I want to tap `CONTACT ME` to toggle the dropdown,
    so that I can use it without a hover state.
14. As a visitor, I want the three contact options to animate downward when the
    dropdown opens, so that the reveal feels intentional.
15. As a visitor, I want to hover the Email option and see the actual email
    address, so that I can read it before deciding to copy.
16. As a visitor, I want clicking the Email option to copy the address to my
    clipboard, so that I can paste it into my mail client.
17. As a visitor, I want the Email label to briefly flash "Copied!" after I click,
    so that I get confirmation the copy worked.
18. As a visitor, I want the Email label to revert from "Copied!" back to its
    normal state after a moment, so that the control is reusable.
19. As a visitor, I want clicking LinkedIn to open the owner's profile in a new
    tab, so that I don't lose the portfolio.
20. As a visitor, I want clicking Resume to open the resume PDF in a new tab, so
    that I can read or download it without leaving the page.
21. As a visitor on a narrow/phone screen, I want the hero overlay to reflow into
    a readable vertical stack (name/placard on top, contact as a tap-toggle),
    so that the corner elements don't collide or overflow.
22. As a visitor without WebGL, I want the existing static fallback image to still
    show with the overlay chrome, so that the hero degrades gracefully.
23. As the site owner, I want the email, LinkedIn URL, resume path, name, and
    placard copy to be defined in one obvious place, so that I can fill in real
    values without hunting through markup.

## Implementation Decisions

- **Placard bound to the Viewpoint model (reused seam).** The existing
  `viewpoints` model carries orientation only. It is broadened so each Viewpoint
  also carries its Placard content. A pure `viewpointPlacard(state)` lookup is
  added alongside the existing `viewpointName(state)`, returning the placard
  shape `{ kind, title, body }` where `kind` distinguishes the headline-only
  Name placard from titled About/What-I-do placards. Placard copy ships as
  clearly-marked placeholders.
- **Placard kinds.** `name` (large headline, no body) and `prose` (eyebrow title
  + body paragraph). FrontLotus = `name`; Bird and Dragonfly = `prose`.
- **Step-driven swaps only.** The placard and name label update on discrete
  viewpoint steps (arrow buttons / ← → keys), driven by the same viewpoint state
  that already exists. Free drag does not change either. No new navigation model.
- **Crossfade.** On step, the outgoing placard fades out and the incoming one
  fades in, timed to the pool's glide. This is DOM/CSS glue in the panel wiring,
  not a tested seam.
- **Hero chrome regions.** The splat panel renders: top-center Viewpoint name
  (the existing name label relocated and uppercased), top-right static location,
  bottom-left static `PORTFOLIO` wordmark, bottom-center existing `SCROLL` hint,
  bottom-right Contact dropdown. The empty design-test box from the references is
  not rendered.
- **Contact copy controller (new seam).** The Email copy interaction is a small
  pure controller that accepts an injected clipboard writer and a timer/scheduler
  and drives the label state transitions (idle → copied → idle). It mirrors the
  existing `sway` (pure) / `sway-controller` (DOM glue) split. The dropdown
  open/close (hover + close-delay on desktop, tap-toggle on touch) and the
  LinkedIn/Resume anchors are thin DOM glue, not part of this seam.
- **New-tab links.** LinkedIn and Resume are anchors opening in a new tab
  (`target=_blank` with `rel=noopener`). Resume points at the served resume PDF.
- **Single contact/content config.** Email address, LinkedIn URL, resume path,
  name, location, and placard copy are defined in one place and passed into the
  panel, so real values replace placeholders in one edit.
- **Responsive reflow.** Wide viewports keep the corner layout; narrow viewports
  reflow the overlay to a vertical stack with the contact control as a
  tap-toggle. CSS-only.

## Testing Decisions

- Good tests assert **external behavior at the chosen seam**, not DOM structure
  or CSS. They inject dependencies (clipboard, timer) rather than reaching into
  implementation.
- **Viewpoint/placard lookup** is tested through the existing `viewpoints` seam,
  extending `viewpoints.test.ts`: stepping forward/backward returns the expected
  placard for each viewpoint, the Name placard is `kind: name` with no body, and
  the About/What-I-do placards are `kind: prose` with a title and body. Prior art:
  the existing `viewpointName` assertions in `viewpoints.test.ts`.
- **Contact copy controller** gets its own unit test (prior art: `sway.test.ts`):
  a click invokes the injected clipboard writer with the configured address; the
  label transitions idle → "Copied!"; after the scheduled delay it reverts to
  idle; repeated clicks work. No real clipboard or real timers.
- The crossfade, dropdown hover/tap open-close, new-tab anchors, and responsive
  reflow are intentionally **not** unit-tested — they are thin DOM/CSS glue,
  consistent with the existing untested arrow/key wiring in `splat-panel.ts`.

## Out of Scope

- The scrollable content **sections** below the hero remain empty placeholders
  (unchanged); `PORTFOLIO` is a static wordmark, not yet a scroll link.
- Real placard copy, real name, and real LinkedIn URL — shipped as placeholders
  for the owner to fill in.
- The design-test empty box from the reference images.
- Any change to the splat assets, the sway/drag physics, or the WebGL fallback
  mechanism beyond ensuring the overlay chrome renders over the fallback.
- Analytics on contact clicks.

## Further Notes

- **Resume asset is present:** `public/Arturo_Resume.pdf`, served at
  `/Arturo_Resume.pdf`.
- **Email needs confirmation:** recorded as typed, `artuozhang3@gmail.com`
  (note the `artuo` spelling differs from the owner's account `arturo…`). Treat
  as a placeholder to confirm before launch.
- **LinkedIn URL** not yet provided — stub as `#` until supplied.
- **Name** provisional as `Arturo [LASTNAME]` until confirmed.
- Domain model: this spec introduces the term **Placard**; `GLOSSARY.md` is to be
  updated so a Viewpoint is defined as carrying both an orientation and its
  Placard.
