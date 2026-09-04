import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/config/site";
import { profiles } from "@/config/profiles";
import { getConferences, getJournals } from "@/lib/data";

export const revalidate = 3600;

/**
 * Sitemap covering static pages plus every conference and journal detail page.
 * If the spreadsheet is unreachable the static routes are still emitted rather
 * than the whole sitemap failing.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, priority: 1 },
    { url: `${base}/conferences`, lastModified: now, priority: 0.9 },
    { url: `${base}/journals`, lastModified: now, priority: 0.9 },
    { url: `${base}/search`, lastModified: now, priority: 0.7 },
    { url: `${base}/about`, lastModified: now, priority: 0.5 },
    { url: `${base}/faq`, lastModified: now, priority: 0.4 },
    ...profiles.map((profile) => ({
      url: `${base}/about/${profile.slug}`,
      lastModified: now,
      priority: 0.3,
    })),
  ];

  try {
    const [conferences, journals] = await Promise.all([
      getConferences(),
      getJournals(),
    ]);

    return [
      ...staticRoutes,
      ...conferences.items.map((conference) => ({
        url: `${base}/conference/${conference.id}`,
        lastModified: conference.lastUpdated
          ? new Date(conference.lastUpdated)
          : now,
        priority: 0.8,
      })),
      ...journals.items.map((journal) => ({
        url: `${base}/journal/${journal.id}`,
        lastModified: journal.lastUpdated ? new Date(journal.lastUpdated) : now,
        priority: 0.8,
      })),
    ];
  } catch {
    return staticRoutes;
  }
}
