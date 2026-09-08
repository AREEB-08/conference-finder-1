import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookOpen, Briefcase, Globe, GraduationCap } from "lucide-react";

function GitHubIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.26 5.66.41.36.78 1.06.78 2.14 0 1.54-.01 2.79-.01 3.17 0 .31.21.67.8.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
    </svg>
  );
}

function LinkedInIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
    </svg>
  );
}

import { isValidUsername } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/profile";

export async function generateMetadata(props: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await props.params;
  return {
    title: `@${username}`,
    description: `Researcher profile of @${username} on Conference Finder.`,
    alternates: { canonical: `/u/${username}` },
  };
}

async function getProfile(username: string): Promise<Profile | null> {
  if (!isValidUsername(username)) return null;

  const supabase = await createClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .maybeSingle();

  return data ?? null;
}

/** Split a free-text field into displayable lines. */
function lines(value: string | null): string[] {
  return (value ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function ProfileSection({
  icon: Icon,
  title,
  entries,
}: {
  icon: typeof GraduationCap;
  title: string;
  entries: string[];
}) {
  if (entries.length === 0) return null;

  return (
    <section className="mt-8">
      <h2 className="eyebrow font-mono">
        <Icon size={14} aria-hidden="true" />
        {title}
      </h2>
      <ul className="mt-3 space-y-2">
        {entries.map((entry, index) => (
          <li
            key={`${entry}-${index}`}
            className="rounded-xl border border-[var(--rule)] bg-[var(--surface)] px-4 py-3 text-sm leading-6"
          >
            {entry}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default async function PublicProfilePage(props: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await props.params;
  const profile = await getProfile(username.toLowerCase());
  if (!profile) notFound();

  const links = [
    { href: profile.website, label: "Website", Icon: Globe },
    { href: profile.linkedin, label: "LinkedIn", Icon: LinkedInIcon },
    { href: profile.github, label: "GitHub", Icon: GitHubIcon },
  ].filter((link) => Boolean(link.href));

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <header className="rounded-xl bg-[var(--surface-sunken)] p-8">
        <div className="flex flex-wrap items-center gap-5">
          {profile.avatar_url ? (
            /* Remote Google avatar with unknown host. */
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt=""
              width={72}
              height={72}
              className="h-18 w-18 rounded-full border-2 border-[var(--surface)]"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="flex h-18 w-18 items-center justify-center rounded-full bg-[var(--accent)] font-serif text-2xl text-white">
              {(profile.full_name ?? profile.username ?? "?")
                .trim()
                .charAt(0)
                .toUpperCase()}
            </span>
          )}
          <div>
            <h1 className="font-serif text-3xl font-normal">
              {profile.full_name || `@${profile.username}`}
            </h1>
            <p className="mt-1 font-mono text-sm text-[var(--pine)]">
              @{profile.username}
            </p>
          </div>
        </div>

        {profile.bio ? (
          <p className="mt-5 max-w-xl text-base leading-7 text-[var(--ink-muted)]">
            {profile.bio}
          </p>
        ) : null}

        {links.length > 0 ? (
          <ul className="mt-5 flex flex-wrap gap-2">
            {links.map(({ href, label, Icon }) => (
              <li key={label}>
                <a
                  href={href as string}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--rule-strong)] bg-[var(--surface)] px-3.5 py-1.5 text-sm transition-colors hover:bg-[var(--surface-hover)]"
                >
                  <Icon size={14} aria-hidden="true" />
                  {label}
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </header>

      <ProfileSection
        icon={GraduationCap}
        title="Education"
        entries={lines(profile.education)}
      />
      <ProfileSection
        icon={Briefcase}
        title="Experience"
        entries={lines(profile.experience)}
      />
      <ProfileSection
        icon={BookOpen}
        title="Publications"
        entries={lines(profile.publications)}
      />
    </div>
  );
}
