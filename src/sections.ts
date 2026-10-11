// The six content sections that scroll below the Hero. They ship as empty
// placeholders — real copy is dropped in later (see spec "Out of Scope").

interface SectionDef {
  id: string;
  label: string;
  heading: string;
}

// Sections intentionally empty — the old placeholder sections (About me,
// Experience, Projects, Education, Certificates, Contacts) were removed. Real
// sections get built back on top later.
const SECTIONS: SectionDef[] = [];

export function renderSections(): string {
  return SECTIONS.map(
    (s) => `
    <section class="section" id="${s.id}">
      <p class="section__label">${s.label}</p>
      <h2 class="section__heading">${s.heading}</h2>
      <p class="section__placeholder">Content coming soon.</p>
    </section>`,
  ).join("");
}
