import { NextResponse } from "next/server";

import { getConferences, REVALIDATE_SECONDS } from "@/lib/data";
import {
  buildConferenceFacets,
  parseConferenceParams,
  searchConferences,
} from "@/lib/search";
import { clientKey, rateLimit } from "@/lib/rate-limit";

export const revalidate = 600;

/**
 * Conference listing API.
 *
 * Accepts the same query parameters as /conferences, so a UI URL can be turned
 * into an API call by changing the path. Returns one page at a time rather than
 * the whole dataset.
 */
export async function GET(request: Request) {
  const limit = rateLimit(
    clientKey(request.headers, "conferences"),
    60,
    60_000,
  );

  if (!limit.allowed) {
    return NextResponse.json(
      { success: false, error: "Too many requests." },
      { status: 429, headers: { "retry-after": String(limit.retryAfter) } },
    );
  }

  try {
    const url = new URL(request.url);
    const filters = parseConferenceParams(url.searchParams);

    const { items, status } = await getConferences();
    const results = searchConferences(items, filters);

    return NextResponse.json(
      {
        success: true,
        ...results,
        facets: url.searchParams.get("facets")
          ? buildConferenceFacets(items)
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
    // Deliberately opaque: the underlying error may name internal config.
    return NextResponse.json(
      { success: false, error: "Could not load conferences." },
      { status: 503 },
    );
  }
}
