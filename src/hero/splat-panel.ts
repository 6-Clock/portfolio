// A reusable full-viewport (100vh) splat panel: a near-black stage hosting a 3D
// Gaussian splat with drag-to-Sway, fade-in, and a static-image fallback when
// WebGL is unavailable. The Hero (lotus pool) is an instance of this — only the
// asset URLs and overlay text differ.
import { mountSplatScene, type SplatScene } from "./scene";
import { attachSway } from "./sway-controller";
import { isWebGLSupported } from "./capability";
import {
  initialViewpoint,
  stepViewpoint,
  viewpointName,
  viewpointPlacard,
} from "./viewpoints";
import type { ContactConfig, Placard, SiteContent } from "../content";
import { createContactCopy } from "./contact-copy";

const DEG_TO_RAD = Math.PI / 180;

export interface SplatPanelOptions {
  /** Unique id for the panel element and its scoped queries. */
  id: string;
  /** URL of the .splat asset to load. */
  splatUrl: string;
  /** URL of the static image shown when WebGL is unavailable. */
  fallbackUrl: string;
  /** Alt text / description of the fallback image. */
  fallbackAlt: string;
  /** Hero text content + contact links. When present the panel renders the full
   *  hero chrome (placard, location, wordmark, contact dropdown). */
  content?: SiteContent;
  /** Whether to show the "Scroll" hint at the bottom. */
  scrollHint?: boolean;
  /** Whether to show viewpoint navigation (border arrows + name label, driven
   *  also by the Left/Right arrow keys). */
  viewpointNav?: boolean;
}

/** The lower-left Placard: a large name headline, or an eyebrow title + body. */
export function renderPlacard(p: Placard): string {
  if (p.kind === "name") {
    return `<h1 class="hero__placard-name">${p.title}</h1>`;
  }
  return `<p class="hero__placard-title">${p.title}</p>
          <p class="hero__placard-body">${p.body ?? ""}</p>`;
}

export function renderSplatPanel(o: SplatPanelOptions): string {
  const c = o.content;
  // Lower-left placard, seeded with the first (FrontLotus) viewpoint's copy.
  // Ticket 02 swaps its contents on viewpoint steps.
  const initialPlacard = c?.placards[viewpointName(initialViewpoint())];
  const placard = initialPlacard
    ? `<div class="hero__placard hero__placard--${initialPlacard.kind}" data-vp-placard>${renderPlacard(
        initialPlacard,
      )}</div>`
    : "";
  // Static corner chrome.
  const location = c
    ? `<div class="hero__location">${c.location
        .map((line) => `<span class="hero__location-row">${line}</span>`)
        .join("")}</div>`
    : "";
  const wordmark = c
    ? `<div class="hero__wordmark">${c.wordmark}</div>`
    : "";
  // Contact dropdown. Markup here; open/close + copy behavior wired in mount.
  // LinkedIn/Resume are plain new-tab anchors; Email is a button the copy
  // controller drives.
  const contact = c
    ? `<div class="hero__contact" data-contact>
         <button
             class="hero__contact-trigger"
             data-contact-trigger
             type="button"
             aria-haspopup="true"
             aria-expanded="false"
           >[CONTACT ME]</button>
         <div class="hero__contact-menu" data-contact-menu>
           <button class="hero__contact-opt" data-contact-email type="button">Email</button>
           <a
               class="hero__contact-opt"
               data-contact-linkedin
               href="${c.contact.linkedInUrl}"
               target="_blank"
               rel="noopener"
             >LinkedIn</a>
           <a
               class="hero__contact-opt"
               data-contact-resume
               href="${c.contact.resumePath}"
               target="_blank"
               rel="noopener"
             >Resume</a>
         </div>
       </div>`
    : "";
  const scrollHint = o.scrollHint
    ? `<div class="hero__scroll-hint">Scroll</div>`
    : "";
  const viewpointNav = o.viewpointNav
    ? `<button
           class="hero__vp-btn hero__vp-btn--prev"
           data-vp-prev
           type="button"
           aria-label="Previous viewpoint"
         >&lsaquo;</button>
       <button
           class="hero__vp-btn hero__vp-btn--next"
           data-vp-next
           type="button"
           aria-label="Next viewpoint"
         >&rsaquo;</button>
       <div class="hero__vp-name" data-vp-name>FrontLotus</div>`
    : "";

  return `
    <section class="hero" id="${o.id}" data-splat-panel="${o.id}">
      <div class="hero__stage">
        <canvas class="hero__canvas" data-hero-canvas></canvas>
        <img
          class="hero__fallback"
          data-hero-fallback
          src="${o.fallbackUrl}"
          alt="${o.fallbackAlt}"
          hidden
        />
      </div>
      ${placard}
      ${location}
      ${wordmark}
      ${contact}
      ${scrollHint}
      ${viewpointNav}
    </section>`;
}

// Mounts one panel's splat scene into its already-rendered markup. Queries are
// scoped to the panel element so multiple panels don't collide. When WebGL is
// unusable it shows the static fallback instead. Returns the live scene, or null
// when the fallback path is used (or mounting failed).
export function mountSplatPanel(
  panel: HTMLElement,
  splatUrl: string,
  content?: SiteContent,
): SplatScene | null {
  // Contact dropdown is part of the overlay chrome, so wire it first — it must
  // work on the WebGL-fallback path too, before any of the splat early-returns.
  if (content) wireContact(panel, content.contact);

  const canvas = panel.querySelector<HTMLCanvasElement>("[data-hero-canvas]");
  const fallback = panel.querySelector<HTMLImageElement>("[data-hero-fallback]");
  if (!canvas) return null;

  const showFallback = (): void => {
    canvas.hidden = true;
    if (fallback) fallback.hidden = false;
  };

  // No usable WebGL → show the static image instead of a broken canvas.
  if (!isWebGLSupported()) {
    showFallback();
    return null;
  }

  let scene: SplatScene;
  try {
    scene = mountSplatScene(canvas, splatUrl);
  } catch (err) {
    console.error(`Splat failed to mount (${panel.id}); using fallback`, err);
    showFallback();
    return null;
  }

  scene.ready
    .then(() => canvas.classList.add("is-ready"))
    .catch((err) => console.error(`Splat failed to load (${panel.id})`, err));

  // Drag (mouse or touch) rotates the splat; a free turntable that holds angle.
  const sway = attachSway(canvas, (radians) => scene.setAzimuth(radians));

  // Viewpoint navigation: border arrows + Left/Right keys glide between the
  // named Viewpoints. Drag still works and the name freezes on the last one.
  const nameEl = panel.querySelector<HTMLElement>("[data-vp-name]");
  if (nameEl) {
    const placardEl = panel.querySelector<HTMLElement>("[data-vp-placard]");
    let viewpoint = initialViewpoint();
    // Crossfade: fade the placard out, then at the mid-point swap its contents
    // and the name together and fade back in — timed to the pool's glide. Only
    // committed steps run this; free drag never calls go(), so the Placard and
    // name hold steady while the visitor looks around.
    const CROSSFADE_MS = 300;
    // dir > 0 steps forward (Right / next), dir < 0 backward (Left / prev).
    const go = (dir: number): void => {
      viewpoint = stepViewpoint(viewpoint, dir);
      sway.animateAzimuthTo(viewpoint.azimuthDeg * DEG_TO_RAD);
      if (placardEl) {
        placardEl.style.opacity = "0";
        window.setTimeout(() => {
          const p = viewpointPlacard(viewpoint);
          // Kind drives placement (name = top-right, prose = white card).
          placardEl.className = `hero__placard hero__placard--${p.kind}`;
          placardEl.innerHTML = renderPlacard(p);
          nameEl.textContent = viewpointName(viewpoint);
          placardEl.style.opacity = "1";
        }, CROSSFADE_MS);
      } else {
        nameEl.textContent = viewpointName(viewpoint);
      }
    };

    panel
      .querySelector("[data-vp-next]")
      ?.addEventListener("click", () => go(1));
    panel
      .querySelector("[data-vp-prev]")
      ?.addEventListener("click", () => go(-1));

    // Global arrow keys (Q10): Right = forward, Left = backward.
    window.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        go(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
      }
    });
  }

  return scene;
}

// Thin DOM glue for the Contact dropdown: open/close and the Email copy wiring.
// The copy state machine lives in the tested createContactCopy; here we only
// translate pointer events and re-render the label. Not a tested seam.
const CONTACT_CLOSE_DELAY_MS = 220;

function wireContact(panel: HTMLElement, contact: ContactConfig): void {
  const root = panel.querySelector<HTMLElement>("[data-contact]");
  const trigger = root?.querySelector<HTMLElement>("[data-contact-trigger]");
  const emailBtn = root?.querySelector<HTMLElement>("[data-contact-email]");
  if (!root || !trigger) return;

  // Open on hover with a close-delay (desktop), or toggle on tap (touch).
  const canHover = window.matchMedia("(hover: hover)").matches;
  let closeTimer = 0;
  const setOpen = (open: boolean): void => {
    root.classList.toggle("is-open", open);
    trigger.setAttribute("aria-expanded", String(open));
  };

  if (canHover) {
    root.addEventListener("mouseenter", () => {
      window.clearTimeout(closeTimer);
      setOpen(true);
    });
    root.addEventListener("mouseleave", () => {
      closeTimer = window.setTimeout(
        () => setOpen(false),
        CONTACT_CLOSE_DELAY_MS,
      );
    });
  } else {
    trigger.addEventListener("click", () =>
      setOpen(!root.classList.contains("is-open")),
    );
  }

  if (!emailBtn) return;

  // Email: hover reveals the address; click copies it and flashes "Copied!".
  let hovered = false;
  const copy = createContactCopy({
    address: contact.email,
    clipboard: {
      writeText: (text) => navigator.clipboard?.writeText(text),
    },
    scheduler: (fn, ms) => {
      const id = window.setTimeout(fn, ms);
      return () => window.clearTimeout(id);
    },
    onChange: () => renderEmailLabel(),
  });
  const renderEmailLabel = (): void => {
    if (copy.label === "copied") emailBtn.textContent = "Copied!";
    else emailBtn.textContent = hovered ? contact.email : "Email";
  };

  emailBtn.addEventListener("mouseenter", () => {
    hovered = true;
    renderEmailLabel();
  });
  emailBtn.addEventListener("mouseleave", () => {
    hovered = false;
    renderEmailLabel();
  });
  emailBtn.addEventListener("click", () => copy.copy());
}
