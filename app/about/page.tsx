import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import ProfileAvatar from "@/components/ProfileAvatar";
import { profiles } from "@/config/profiles";
import { REVALIDATE_SECONDS } from "@/lib/data";

export const metadata: Metadata = {
  title: "About",
  description:
    "How this conference and journal index is compiled and maintained, and who maintains it.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  const minutes = Math.round(REVALIDATE_SECONDS / 60);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <header className="border-b border-[var(--rule)] pb-8">
        <h1 className="text-3xl">About this project</h1>
        <p className="mt-4 max-w-2xl leading-7 text-[var(--ink-muted)]">
          Finding a conference that fits your work usually means opening twenty
          tabs and copying deadlines into a document. This site is that document,
          made searchable and kept in one place.
        </p>
      </header>

      <section className="mt-10">
        <h2 className="text-xl">How it works</h2>
        <p className="mt-3 max-w-2xl leading-7 text-[var(--ink-muted)]">
          Every conference and journal here is entered by hand into a Google
          spreadsheet. The website reads that spreadsheet directly, so an edit to
          a deadline shows up here within about {minutes} minutes without anyone
          touching the code.
        </p>
        <p className="mt-3 max-w-2xl leading-7 text-[var(--ink-muted)]">
          That also sets the limits honestly. This is a curated list, not a
          complete index of academic publishing. Records marked as checked were
          verified against the official site by one of us on the date shown —
          that is our own check, not an endorsement by any indexing body. Impact
          factors, fees and deadlines all change, so treat this as a starting
          point and confirm details at the source.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-xl">Founders</h2>

        <ul className="mt-5 grid gap-4 sm:grid-cols-2">
          {profiles.map((profile) => (
            <li key={profile.slug}>
              <Link
                href={`/about/${profile.slug}`}
                className="group flex h-full flex-col rounded border border-[var(--rule)] bg-[var(--surface)] p-5 transition-colors hover:border-[var(--rule-strong)]"
              >
                <ProfileAvatar
                  src={profile.image}
                  name={profile.name}
                  size={64}
                />

                <h3 className="mt-4 text-base group-hover:text-[var(--accent)]">
                  {profile.name}
                </h3>
                <p className="mt-1 text-sm text-[var(--ink-muted)]">
                  {profile.role}
                </p>
                {profile.affiliation ? (
                  <p className="mt-2 text-sm text-[var(--ink-subtle)]">
                    {profile.affiliation}
                  </p>
                ) : null}

                <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm text-[var(--accent)]">
                  View profile
                  <ArrowRight size={14} aria-hidden="true" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
