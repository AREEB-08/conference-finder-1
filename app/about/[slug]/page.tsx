import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ProfileAvatar from "@/components/ProfileAvatar";
import { BackLink, DetailRow } from "@/components/DetailLayout";
import { getProfile, profiles } from "@/config/profiles";
import { safeExternalUrl, truncate } from "@/lib/utils";

export function generateStaticParams() {
  return profiles.map((profile) => ({ slug: profile.slug }));
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const profile = getProfile(slug);

  if (!profile) return { title: "Profile not found" };

  return {
    title: profile.name,
    description: truncate(
      profile.bio[0] || `${profile.name}, ${profile.role}.`,
      155,
    ),
    alternates: { canonical: `/about/${profile.slug}` },
  };
}

export default async function ProfilePage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const profile = getProfile(slug);

  if (!profile) notFound();

  // Only render links that were actually filled in.
  const links = profile.links
    .map((link) => ({ ...link, href: safeExternalUrl(link.href) }))
    .filter((link) => link.href);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <BackLink href="/about" label="About" />

      <header className="mt-6 flex flex-col gap-6 border-b border-[var(--rule)] pb-8 sm:flex-row sm:items-start">
        <ProfileAvatar src={profile.image} name={profile.name} size={112} />

        <div>
          <h1 className="text-3xl leading-tight">{profile.name}</h1>
          <p className="mt-2 text-[var(--ink-muted)]">{profile.role}</p>

          {profile.affiliation ? (
            <p className="mt-1 text-sm text-[var(--ink-subtle)]">
              {profile.affiliation}
            </p>
          ) : null}

          {profile.location ? (
            <p className="mt-1 text-sm text-[var(--ink-subtle)]">
              {profile.location}
            </p>
          ) : null}
        </div>
      </header>

      {profile.bio.length > 0 ? (
        <section className="mt-8 max-w-2xl space-y-4">
          {profile.bio.map((paragraph, index) => (
            <p key={index} className="leading-7 text-[var(--ink-muted)]">
              {paragraph}
            </p>
          ))}
        </section>
      ) : null}

      {profile.researchInterests.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-xl">Research interests</h2>
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {profile.researchInterests.map((interest) => (
              <li
                key={interest}
                className="rounded border border-[var(--rule)] bg-[var(--surface-sunken)] px-2 py-0.5 text-sm text-[var(--ink-muted)]"
              >
                {interest}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {profile.education.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-xl">Education</h2>
          <dl className="mt-3">
            {profile.education.map((entry) => (
              <DetailRow
                key={`${entry.qualification}-${entry.institution}`}
                label={entry.qualification}
              >
                {entry.institution}
                {entry.year ? (
                  <span className="tnum text-[var(--ink-subtle)]">
                    {" "}
                    ({entry.year})
                  </span>
                ) : null}
              </DetailRow>
            ))}
          </dl>
        </section>
      ) : null}

      {links.length > 0 || profile.email ? (
        <section className="mt-10">
          <h2 className="text-xl">Elsewhere</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {profile.email ? (
              <li>
                <a
                  href={`mailto:${profile.email}`}
                  className="inline-flex rounded border border-[var(--rule-strong)] bg-[var(--surface)] px-3 py-1.5 text-sm transition-colors hover:bg-[var(--surface-hover)]"
                >
                  Email
                </a>
              </li>
            ) : null}

            {links.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer me"
                  className="inline-flex rounded border border-[var(--rule-strong)] bg-[var(--surface)] px-3 py-1.5 text-sm transition-colors hover:bg-[var(--surface-hover)]"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
