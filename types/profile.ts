/** A link shown on a profile page. `label` is what the user reads. */
export interface ProfileLink {
  label: string;
  href: string;
}

/**
 * Everything shown on an About profile page. Edit `config/profiles.ts` to
 * change these; no page component needs to be touched.
 */
export interface Profile {
  /** URL segment: /about/<slug> */
  slug: string;
  name: string;
  role: string;
  /** Path under /public, e.g. "/profiles/me.jpg". Empty renders initials. */
  image: string;
  affiliation: string;
  location: string;
  bio: string[];
  researchInterests: string[];
  education: EducationEntry[];
  email: string;
  links: ProfileLink[];
}

export interface EducationEntry {
  qualification: string;
  institution: string;
  year: string;
}
