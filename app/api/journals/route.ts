import { NextResponse } from "next/server";

import { getJournals, REVALIDATE_SECONDS } from "@/lib/data";
import {
  buildJournalFacets,
  parseJournalParams,
  searchJournals,
} from "@/lib/search";
import { clientKey, rateLimit } from "@/lib/rate-limit";

export const revalidate = 600;

/** Journal listing API. Mirrors /api/conferences. */
export async function GET(request: Request) {
  const limit = rateLimit(clientKey(request.headers, "journals"), 60, 60_000);

  if (!limit.allowed) {
    return NextResponse.json(
      { success: false, error: "Too many requests." },
      { status: 429, headers: { "retry-after": String(limit.retryAfter) } },
    );
  }

  try {
    const url = new URL(request.url);
    const filters = parseJournalParams(url.searchParams);

    const { items, status } = await getJournals();
    const results = searchJournals(items, filters);

    return NextResponse.json(
      {
        success: true,
        ...results,
        facets: url.searchParams.get("facets")
          ? buildJournalFacets(items)
          : undefined,
        source: status,
      },
      {
        headers: {
          "cache-control": `public, s-maxage=${REVALIDATE_SECONDS}, stale-while-revalidate=60`,
        },
      },
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Could not load journals." },
      { status: 503 },
    );
  }
}
