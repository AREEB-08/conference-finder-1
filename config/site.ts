/**
 * Site-wide configuration. Everything a rebrand or redeploy needs to touch
 * lives here rather than being scattered through page components.
 */

/**
 * Absolute base URL, used for canonical links, Open Graph and the sitemap.
 * Falls back to the Vercel-provided URL, then to localhost, so nothing needs
 * to be configured for a first deploy or for local development.
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (vercel) return `https://${vercel.replace(/\/+$/, "")}`;

  return "http://localhost:3000";
}

export const siteConfig = {
  name: "Jamia Hamdard Conference Finder",
  /** Used where the full name will not fit, such as the mobile navbar. */
  shortName: "JH Conference Finder",
  /** Rendered as the smaller line under the wordmark. */
  institution: "Jamia Hamdard",
  tagline: "Conferences and journals for your research",
  description:
    "Search academic conferences and journals by topic, deadline, location, publisher and indexing. Records are maintained in a spreadsheet and published here.",
  keywords: [
    "academic conferences",
    "research journals",
    "call for papers",
    "submission deadlines",
    "impact factor",
    "Scopus indexed journals",
  ],
} as const;

export interface NavItem {
  href: string;
  label: string;
}

/** Primary navigation. Kept short on purpose. */
export const mainNav: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/conferences", label: "Conferences" },
  { href: "/journals", label: "Journals" },
  { href: "/search", label: "Search" },
  { href: "/about", label: "About" },
];

export const footerNav: { title: string; items: NavItem[] }[] = [
  {
    title: "Discover",
    items: [
      { href: "/conferences", label: "Conferences" },
      { href: "/journals", label: "Journals" },
      { href: "/search", label: "Search" },
    ],
  },
  {
    title: "Project",
    items: [
      { href: "/about", label: "About" },
      { href: "/faq", label: "FAQ" },
    ],
  },
];
