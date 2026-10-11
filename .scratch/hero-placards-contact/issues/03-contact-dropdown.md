# 03: Contact dropdown

**What to build:** The bottom-right `CONTACT ME` control becomes interactive. On
desktop it opens on hover (with a short close-delay so the pointer can move into
it); on touch it toggles on tap. When open, the three options animate downward:
Email, LinkedIn, and Resume. Hovering Email reveals the actual address; clicking
Email copies it to the clipboard and briefly flashes "Copied!" before reverting.
LinkedIn opens the profile in a new tab; Resume opens the resume PDF
(`/Arturo_Resume.pdf`) in a new tab.

**Blocked by:** 01 (needs the `CONTACT ME` region + content config)

**Status:** resolved

- [x] Dropdown opens on hover on desktop and stays open across a short close-delay
- [x] Dropdown toggles on tap on touch devices
- [x] The three options animate downward when the dropdown opens
- [x] Hovering Email reveals the configured address
- [x] Clicking Email copies the address to the clipboard
- [x] Email label flashes "Copied!" after a click, then reverts to idle; repeated
      clicks work
- [x] LinkedIn opens the configured profile URL in a new tab (`rel=noopener`)
- [x] Resume opens `/Arturo_Resume.pdf` in a new tab (`rel=noopener`)
- [x] A pure contact-copy controller (injected clipboard writer + timer) drives
      the idle → copied → idle label transitions
- [x] The controller is unit-tested (prior art: `sway.test.ts`) with no real
      clipboard or real timers
