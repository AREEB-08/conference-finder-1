import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

import { CACHE_TAG } from "@/lib/data";
import { clientKey, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * Force an immediate refresh from Google Sheets instead of waiting for the
 * cache window to expire.
 *
 * Protected by a shared secret so that anyone who finds the URL cannot make
 * the site hammer the Sheets API. When REVALIDATE_SECRET is unset the endpoint
 * is disabled outright rather than left open.
 *
 *   curl -X POST https://your-site/api/revalidate \
 *     -H "authorization: Bearer $REVALIDATE_SECRET"
 */
export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET?.trim();

  if (!secret) {
    return NextResponse.json(
      { success: false, error: "Manual revalidation is not enabled." },
      { status: 503 },
    );
  }

  const limit = rateLimit(clientKey(request.headers, "revalidate"), 10, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { success: false, error: "Too many requests." },
      { status: 429, headers: { "retry-after": String(limit.retryAfter) } },
    );
  }

  const header = request.headers.get("authorization") ?? "";
  const provided = header.startsWith("Bearer ") ? header.slice(7) : "";

  if (!timingSafeEqual(provided, secret)) {
    // Same message for missing and wrong tokens: do not confirm the format.
    return NextResponse.json(
      { success: false, error: "Not authorised." },
      { status: 401 },
    );
  }

  // "max" tells Next to serve the existing entry while the new one is fetched.
  revalidateTag(CACHE_TAG, "max");

  return NextResponse.json({
    success: true,
    revalidated: CACHE_TAG,
    at: new Date().toISOString(),
  });
}

/** Constant-time comparison so the secret cannot be recovered by timing. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;

  let mismatch = 0;
  for (let index = 0; index < a.length; index += 1) {
    mismatch |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return mismatch === 0;
}
