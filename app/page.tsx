import Link from "next/link";
import { ArrowRight } from "lucide-react";

import ConferenceCard from "@/components/ConferenceCard";
import DataSourceNotice from "@/components/DataSourceNotice";
import JournalCard from "@/components/JournalCard";
import HowItWorks from "@/components/landing/HowItWorks";
import LandingHero from "@/components/landing/LandingHero";
import LandingStats from "@/components/landing/LandingStats";
import Reveal from "@/components/landing/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { getConferences, getJournals, REVALIDATE_SECONDS } from "@/lib/data";
import { getDeadlineInfo } from "@/lib/dates";
import {
  buildConferenceFacets,
  featuredJournals,
  upcomingConferences,
} from "@/lib/search";

export const revalidate = 600;

export default async function LandingPage() {
  const [conferences, journals] = await Promise.all([
    getConferences(),
    getJournals(),
  ]);

  const closing = upcomingConferences(conferences.items, 3);
  const featuredConferences = upcomingConferences(conferences.items, 3);
  const journalPicks = featuredJournals(journals.items, 3);

  const openCount = conferences.items.filter((conference) =>
    ["open", "soon", "urgent", "today"].includes(
      getDeadlineInfo(conference.submissionDeadlineDate).status,
    ),
  ).length;

  const facets = buildConferenceFacets(conferences.items);

  return (
    <>
      <LandingHero closing={closing} />

      <LandingStats
        stats={[
          { label: "Conferences", value: conferences.items.length },
          {
            label: "Open for submissions",
            value: openCount,
            hint: "Deadline still ahead",
          },
          { label: "Journals", value: journals.items.length },
          { label: "Countries", value: facets.countries.length },
        ]}
      />

      <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
        <DataSourceNotice status={conferences.status} />
      </div>

      <HowItWorks />

      <div className="mx-auto max-w-6xl px-4 pb-4 sm:px-6">
        <Section
          title="Conferences"
          description="Calls for papers with the nearest submission deadlines."
          href="/conferences"
          linkLabel="View all conferences"
        >
          {featuredConferences.length > 0 ? (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featuredConferences.map((conference, index) => (
                <Reveal
                  as="li"
                  key={conference.id}
                  delay={index * 80}
                  className="h-full"
                >
                  <ConferenceCard conference={conference} />
                </Reveal>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[var(--ink-muted)]">
              No conferences are listed yet.
            </p>
          )}
        </Section>

        <Section
          title="Journals"
          description="Journals with their indexing, access model and reported impact."
          href="/journals"
          linkLabel="View all journals"
          className="mt-16"
        >
          {journalPicks.length > 0 ? (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {journalPicks.map((journal, index) => (
                <Reveal
                  as="li"
                  key={journal.id}
                  delay={index * 80}
                  className="h-full"
                >
                  <JournalCard journal={journal} />
                </Reveal>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[var(--ink-muted)]">
              No journals are listed yet.
            </p>
          )}
        </Section>
      </div>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <Reveal className="rounded border border-[var(--rule)] bg-[var(--surface)] p-8 sm:p-12">
          <h2 className="max-w-lg text-2xl leading-snug">
            Know a conference that should be on this list?
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--ink-muted)]">
            The list grows by people sending links. Send us a link to the
            official call for papers and we will add it to the sheet.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink href="/search">Search listings</ButtonLink>
            <ButtonLink href="/faq" variant="secondary">
              Read the FAQ
            </ButtonLink>
          </div>
        </Reveal>

        <p className="mt-10 border-t border-[var(--rule)] pt-6 text-sm leading-6 text-[var(--ink-subtle)]">
          Listings are compiled by hand and refresh about every{" "}
          {Math.round(REVALIDATE_SECONDS / 60)} minutes. This is a curated list,
          not a complete index of everything published — always confirm details
          on the official website before you submit.
        </p>
      </section>
    </>
  );
}

function Section({
  title,
  description,
  href,
  linkLabel,
  className = "",
  children,
}: {
  title: string;
  description: string;
  href: string;
  linkLabel: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={className}>
      <Reveal className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-[var(--rule)] pb-4">
        <div>
          <h2 className="text-2xl">{title}</h2>
          <p className="mt-1.5 text-sm text-[var(--ink-muted)]">{description}</p>
        </div>

        <Link
          href={href}
          className="inline-flex items-center gap-1.5 rounded text-sm text-[var(--accent)] hover:underline"
        >
          {linkLabel}
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </Reveal>

      {children}
    </section>
  );
}
