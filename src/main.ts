import "./style.css";
import {
  renderSplatPanel,
  mountSplatPanel,
  type SplatPanelOptions,
} from "./hero/splat-panel";
import { renderSections } from "./sections";
import { SITE_CONTENT } from "./content";

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) throw new Error("#app mount point not found");

// The lotus-pool Hero splat panel, then the ordinary content sections.
const LOTUS: SplatPanelOptions = {
  id: "hero",
  splatUrl: "/lotuspoolwtt.splat",
  fallbackUrl: "/lotuspool.png",
  fallbackAlt: "Watercolor lotus pool illustration",
  content: SITE_CONTENT,
  scrollHint: true,
  viewpointNav: true,
};

// <main> is the white content layer below the Hero.
app.innerHTML = `
  ${renderSplatPanel(LOTUS)}
  <main>
    ${renderSections()}
  </main>`;

for (const panel of [LOTUS]) {
  const el = document.querySelector<HTMLElement>(
    `[data-splat-panel="${panel.id}"]`,
  );
  if (el) mountSplatPanel(el, panel.splatUrl, panel.content);
}
