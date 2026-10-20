// The landing page's sections, in page order. The header, the mobile menu and
// the footer all link to these, so a section is renamed or moved in one place.
export const SECTIONS = [
  { id: "film", label: "The film" },
  { id: "map", label: "The map" },
  { id: "tour", label: "How it works" },
  { id: "yours", label: "Make it yours" },
  { id: "questions", label: "Questions" },
] as const;

/** The one address for support, privacy and everything else. */
export const CONTACT_EMAIL = "devauntaenorman@gmail.com";
