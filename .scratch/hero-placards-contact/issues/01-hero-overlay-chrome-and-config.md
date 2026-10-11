# 01: Hero overlay chrome + content config

**What to build:** The static overlay frame around the lotus-pool hero, matching
the reference designs, plus the single config module that later tickets fill in.
A visitor sees the viewpoint name centered at the top (uppercase, letter-spaced),
`VANCOUVER / PANAMA` top-right, a `PORTFOLIO` wordmark bottom-left, the existing
`SCROLL` hint bottom-center, and a `CONTACT ME` heading bottom-right (not yet
interactive). On a narrow/phone screen the overlay reflows to a readable vertical
stack instead of colliding corners. The overlay renders correctly over the WebGL
fallback image as well as the live splat. All text (name, location, email,
LinkedIn URL, resume path, placard copy) comes from one content/contact config
module, shipped with clearly-marked placeholders.

**Blocked by:** None (can start immediately)

**Status:** resolved

- [x] Viewpoint name label is relocated to top-center, uppercase and letter-spaced
- [x] `VANCOUVER / PANAMA` location renders top-right (static)
- [x] `PORTFOLIO` wordmark renders bottom-left (static, non-interactive)
- [x] Existing `SCROLL` hint still renders bottom-center
- [x] `CONTACT ME` heading renders bottom-right (no dropdown behavior yet)
- [x] The design-test empty box from the references is NOT rendered
- [x] A single content/contact config module holds name, location, email,
      LinkedIn URL, resume path (`/Arturo_Resume.pdf`), and placard copy as
      placeholders, and feeds the panel
- [x] Email placeholder recorded as `artuozhang3@gmail.com`; LinkedIn stubbed `#`;
      name stubbed `Arturo [LASTNAME]`
- [x] Overlay reflows to a vertical stack on narrow viewports (CSS-only)
- [x] Overlay chrome renders over the static fallback image when WebGL is absent
