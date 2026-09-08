import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

/** POST-only sign out, then back to the homepage. */
export async function POST(request: Request) {
  const supabase = await createClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}
