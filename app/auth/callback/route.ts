import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * OAuth callback. Supabase redirects here with a `code` after Google sign-in;
 * exchanging it sets the session cookies, then we send the user on.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next") ?? "/profile";
  // Only allow same-site relative redirects.
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/profile";

  if (code) {
    const supabase = await createClient();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        // Behind a load balancer (Vercel) the origin seen by the handler is
        // internal; prefer the forwarded host in production.
        const forwardedHost = request.headers.get("x-forwarded-host");
        const isLocal = process.env.NODE_ENV === "development";
        if (isLocal) return NextResponse.redirect(`${origin}${next}`);
        if (forwardedHost) {
          return NextResponse.redirect(`https://${forwardedHost}${next}`);
        }
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
