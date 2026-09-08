import { NextResponse } from "next/server";

import { clientKey, rateLimit } from "@/lib/rate-limit";
import { isValidUsername } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/username?u=some_name — live availability check for the claim form.
 * Response: { valid, available }.
 */
export async function GET(request: Request) {
  const limit = rateLimit(clientKey(request.headers, "username-check"), 60, 60_000);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const username = (searchParams.get("u") ?? "").trim().toLowerCase();

  if (!isValidUsername(username)) {
    return NextResponse.json({ valid: false, available: false });
  }

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase is not configured" },
      { status: 503 },
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }

  // A username you already own counts as available to you.
  const available = !data || data.id === user?.id;

  return NextResponse.json({ valid: true, available });
}
