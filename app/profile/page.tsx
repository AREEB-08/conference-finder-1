import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ExternalLink } from "lucide-react";

import ProfileForm from "@/components/profile/ProfileForm";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/profile";

export const metadata: Metadata = {
  title: "Your profile",
  description: "Claim your username and manage your researcher profile.",
  alternates: { canonical: "/profile" },
};

export default async function ProfilePage() {
  const supabase = await createClient();
  if (!supabase) redirect("/login");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  // The signup trigger normally creates this row; fall back to a blank
  // profile seeded from Google metadata so the form still works without it.
  const profile: Profile = data ?? {
    id: user.id,
    username: null,
    full_name: (user.user_metadata?.full_name as string | undefined) ?? null,
    avatar_url: (user.user_metadata?.avatar_url as string | undefined) ?? null,
    bio: null,
    linkedin: null,
    github: null,
    website: null,
    education: null,
    experience: null,
    publications: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <header className="mb-8 border-b border-[var(--rule)] pb-6">
        <p className="eyebrow">Your account</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <h1 className="font-serif text-4xl font-normal">Your profile</h1>
          {profile.username ? (
            <Link
              href={`/u/${profile.username}`}
              className="inline-flex items-center gap-1.5 rounded-full text-sm text-[var(--accent)] hover:underline"
            >
              View public page
              <ExternalLink size={14} aria-hidden="true" />
            </Link>
          ) : null}
        </div>
        <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--ink-muted)]">
          Signed in as {user.email}. Everything below is optional and public —
          share only what you want other researchers to see.
        </p>
      </header>

      <ProfileForm profile={profile} />
    </div>
  );
}
