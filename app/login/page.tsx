import type { Metadata } from "next";
import { redirect } from "next/navigation";

import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import { PresenterFigure } from "@/components/illustrations/Figures";
import { Star4 } from "@/components/illustrations/Doodles";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Conference Finder to claim a username and build your researcher profile.",
  alternates: { canonical: "/login" },
};

export default async function LoginPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const searchParams = await props.searchParams;
  const user = await getUser();
  if (user) redirect("/profile");

  const failed = searchParams.error === "auth";
  const configured = isSupabaseConfigured();

  return (
    <div className="mx-auto grid min-h-[70dvh] max-w-5xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2">
      <div className="max-w-md">
        <p className="eyebrow">Account</p>
        <h1 className="mt-3 font-serif text-4xl font-normal leading-[1.2]">
          Welcome back, researcher
        </h1>
        <p className="mt-4 text-base leading-7 text-[var(--ink-muted)]">
          Sign in with Google to claim your username and build a public
          researcher profile — education, experience, publications and links,
          all in one place.
        </p>

        <div className="mt-8">
          <GoogleSignInButton />
        </div>

        {failed ? (
          <p className="mt-4 rounded-lg border border-[var(--state-urgent-line)] bg-[var(--state-urgent-wash)] px-3 py-2 text-sm text-[var(--state-urgent)]">
            Sign-in did not complete. Please try again.
          </p>
        ) : null}

        {!configured ? (
          <p className="mt-4 rounded-lg border border-[var(--state-soon-line)] bg-[var(--state-soon-wash)] px-3 py-2 text-sm leading-6 text-[var(--state-soon)]">
            Sign-in is not configured on this deployment yet. Set{" "}
            <code className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_URL</code>{" "}
            and{" "}
            <code className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>{" "}
            — see SETUP.md in the repository.
          </p>
        ) : null}

        <p className="mt-6 text-sm leading-6 text-[var(--ink-subtle)]">
          We only store your name, avatar and the profile details you choose to
          add. No passwords are kept — authentication is handled by Google.
        </p>
      </div>

      <div className="relative hidden justify-center lg:flex" aria-hidden="true">
        <PresenterFigure width={330} className="cf-drift" />
        <Star4 size={30} className="absolute right-10 top-2" />
      </div>
    </div>
  );
}
