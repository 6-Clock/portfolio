// The single source of truth for the hero's text content and contact links.
// Everything a visitor reads in the hero chrome — the owner's name, location,
// wordmark, contact targets, and each Viewpoint's Placard copy — lives here so
// real values replace the placeholders in one edit, without hunting through
// markup. The splat panel and the viewpoint model both read from this.
//
// NOTE: values marked PLACEHOLDER are intentionally provisional — confirm them
// before launch (see .scratch/hero-placards-contact/spec.md "Further Notes").

/** A titled block of overlay text bound to a Viewpoint. */
export interface Placard {
  /** `name` = large headline, no body. `prose` = eyebrow title + body paragraph. */
  kind: "name" | "prose";
  /** Headline (name kind) or eyebrow title (prose kind). */
  title: string;
  /** Body paragraph. Present for `prose`, absent for `name`. */
  body?: string;
}

export interface ContactConfig {
  /** Address revealed on hover and copied to the clipboard on click. */
  email: string;
  /** Profile URL opened in a new tab. */
  linkedInUrl: string;
  /** Path to the resume PDF, served statically, opened in a new tab. */
  resumePath: string;
}

export interface SiteContent {
  /** Owner name — shown as the FrontLotus Name placard headline. */
  name: string;
  /** Static location rows shown top-right, one per line. */
  location: readonly string[];
  /** Static wordmark shown bottom-left. */
  wordmark: string;
  /** Contact targets for the bottom-right dropdown. */
  contact: ContactConfig;
  /** Placard copy keyed by Viewpoint name (FrontLotus / Bird / Dragonfly). */
  placards: Record<string, Placard>;
}

export const SITE_CONTENT: SiteContent = {
  name: "[ARTURO ZHANG]",
  location: ["CANADA, VANCOUVER", "PANAMA, PANAMA CITY"],
  wordmark: "PORTFOLIO",
  contact: {
    // Injected from .env (VITE_EMAIL) so the address isn't committed to source.
    // Set it in .env locally and in your host's env vars for production.
    email: import.meta.env.VITE_EMAIL ?? "",
    // PLACEHOLDER — real LinkedIn URL not yet provided; stub keeps the anchor inert.
    linkedInUrl: "#",
    resumePath: "/Arturo_Resume.pdf",
  },
  placards: {
    // FrontLotus: the landing headline — the owner's name, no body.
    FrontLotus: {
      kind: "name",
      // Same as `name` above; the owner's name as it should read large.
      title: "[ARTURO ZHANG]",
    },
    // Bird: About me.
    Bird: {
      kind: "prose",
      title: "[ABOUT ME]",
      // PLACEHOLDER — replace with real About copy.
      body: "A short placeholder introduction. Who I am, what I care about, and the kind of work I'm drawn to. Replace this with real copy before launch.",
    },
    // Dragonfly: What I do.
    Dragonfly: {
      kind: "prose",
      title: "[WHAT I DO]",
      // PLACEHOLDER — replace with real skills / tools / focus copy.
      body: "A short placeholder summary of skills, tools, and focus areas. Replace this with the real list before launch.",
    },
  },
};
