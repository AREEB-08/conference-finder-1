import type { Profile } from "@/types/profile";

/**
 * The people behind Conference Finder.
 *
 * Everything rendered on /about and /about/[slug] comes from this file. To make
 * it yours, edit the strings below and drop matching images into
 * `public/profiles/`. No page component needs to change.
 *
 *   image:  "/profiles/ahmed.jpg"  ->  public/profiles/ahmed.jpg
 *   links:  add or remove freely; each renders as a labelled link
 *
 * Empty strings are always safe. An empty field is omitted from the page rather
 * than rendered blank, an empty `image` falls back to the person's initials,
 * and an empty link is dropped entirely. Placeholder text below is marked so
 * you can find it — no biography, affiliation or credential has been invented.
 */
export const profiles: Profile[] = [
  {
    slug: "ahmed",
    name: "Mohd Ahmed",
    role: "Co-founder",
    image: "/profiles/ahmed.jpg",
    // TODO: replace the placeholder fields below with your real details.
    affiliation: "",
    location: "",
    bio: [
      "Replace this paragraph with a short introduction: what you study, what you work on, and what led you to build Conference Finder.",
    ],
    researchInterests: [],
    education: [],
    email: "",
    links: [
      { label: "GitHub", href: "" },
      { label: "LinkedIn", href: "" },
      { label: "Google Scholar", href: "" },
      { label: "ORCID", href: "" },
      { label: "Website", href: "" },
    ],
  },
  {
    slug: "areeb",
    name: "Mohd Areeb",
    role: "Co-founder",
    image: "/profiles/areeb.jpg",
    // TODO: replace the placeholder fields below with your real details.
    affiliation: "",
    location: "",
    bio: [
      "Replace this paragraph with a short introduction: what you study, what you work on, and what you contribute to Conference Finder.",
    ],
    researchInterests: [],
    education: [],
    email: "",
    links: [
      { label: "GitHub", href: "" },
      { label: "LinkedIn", href: "" },
      { label: "Google Scholar", href: "" },
      { label: "ORCID", href: "" },
      { label: "Website", href: "" },
    ],
  },
];

export function getProfile(slug: string): Profile | undefined {
  return profiles.find((profile) => profile.slug === slug);
}
