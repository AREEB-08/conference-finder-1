import type { Metadata } from "next";
import { notFound } from "next/navigation";

import DeadlineBadge from "@/components/DeadlineBadge";
import ModeBadge from "@/components/ModeBadge";
import TopicBadge from "@/components/TopicBadge";
import VerifiedBadge from "@/components/VerifiedBadge";
import {
  BackLink,
  DetailRow,
  DetailSection,
  OfficialSiteButton,
} from "@/components/DetailLayout";
import { formatIsoDate } from "@/lib/dates";
import { getConferenceById, getConferences } from "@/lib/data";
import { truncate } from "@/lib/utils";

export const revalidate = 600;

/** Prerender the known conferences; new ones render on first request. */
export async function generateStaticParams() {
  try {
    const { items } = await getConferences();
    return items.map((conference) => ({ id: conference.id }));
  } catch {
    return [];
  }
}

export async function generateMetadata(props: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await props.params;
  const conference = await getConferenceById(id);

  if (!conference) return { title: "Conference not found" };

  const parts = [
    conference.place,
    conference.conferenceDate,
    conference.topics.slice(0, 3).join(", "),
  ].filter(Boolean);

  const description =
    conference.description ||
    `${conference.name}. ${parts.join(". ")}`.trim();

  return {
    title: conference.name,
    description: truncate(description, 155),
    alternates: { canonical: `/conference/${conference.id}` },
    openGraph: {
      title: conference.name,
      description: truncate(description, 155),
      url: `/conference/${conference.id}`,
      type: "article",
    },
  };
}

export default async function ConferenceDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const conference = await getConferenceById(id);

  if (!conference) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <BackLink href="/conferences" label="All conferences" />

      <header className="mt-6 border-b border-[var(--rule)] pb-8">
        <div className="flex flex-wrap items-center gap-2">
          <DeadlineBadge isoDate={conference.submissionDeadlineDate} />
          <ModeBadge mode={conference.modeKind} title={conference.mode} />
          <VerifiedBadge verified={conference.verified} />
        </div>

        <h1 className="mt-4 text-3xl leading-tight">{conference.name}</h1>

        {conference.acronym && conference.acronym !== conference.name ? (
          <p className="mt-2 text-[var(--ink-muted)]">{conference.acronym}</p>
        ) : null}

        {conference.description ? (
          <p className="mt-4 max-w-2xl leading-7 text-[var(--ink-muted)]">
            {conference.description}
          </p>
        ) : null}

        <div className="mt-6">
          <OfficialSiteButton url={conference.link} />
        </div>
      </header>

      <DetailSection title="Important dates">
        <DetailRow label="Submission deadline">
          <span className="tnum">
            {formatIsoDate(conference.submissionDeadlineDate) ||
              conference.submissionDeadline ||
              "Not listed"}
          </span>
          {/* When the sheet holds a multi-part schedule, show it verbatim
              underneath rather than reducing it to one parsed date. */}
          {conference.submissionDeadlineDate &&
          conference.submissionDeadline &&
          conference.submissionDeadline.length > 24 ? (
            <span className="mt-1 block text-[var(--ink-subtle)]">
              {conference.submissionDeadline}
            </span>
          ) : null}
        </DetailRow>

        <DetailRow label="Conference date" value={conference.conferenceDate} />
        <DetailRow label="Notification" value={conference.notificationDate} />
        <DetailRow
          label="Registration deadline"
          value={conference.registrationDeadline}
        />
      </DetailSection>

      <DetailSection title="Where and how">
        <DetailRow label="Venue" value={conference.place} />
        <DetailRow label="City" value={conference.city} />
        <DetailRow label="Country" value={conference.country} />
        <DetailRow label="Participation" value={conference.mode} />
      </DetailSection>

      {conference.topics.length > 0 ? (
        <DetailSection title="Topics">
          <DetailRow label="Research areas">
            <ul className="flex flex-wrap gap-1.5">
              {conference.topics.map((topic) => (
                <li key={topic}>
                  <TopicBadge
                    topic={topic}
                    href={`/search?type=conference&topic=${encodeURIComponent(topic)}`}
                  />
                </li>
              ))}
            </ul>
          </DetailRow>
        </DetailSection>
      ) : null}

      <DetailSection title="Submission requirements">
        <DetailRow label="Paper size" value={conference.paperSize} />
        <DetailRow label="Paper format" value={conference.paperFormat} />
        <DetailRow label="Fees" value={conference.fees} />
        <DetailRow label="Indexing" value={conference.indexing} />
        <DetailRow label="Ranking" value={conference.ranking} />
        <DetailRow label="Status" value={conference.status} />
      </DetailSection>

      {conference.links.length > 1 ? (
        <DetailSection title="Links">
          <DetailRow label="Official pages">
            <ul className="space-y-1.5">
              {conference.links.map((link) => (
                <li key={link}>
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded break-all text-[var(--accent)] hover:underline"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </DetailRow>
        </DetailSection>
      ) : null}

      <p className="mt-10 border-t border-[var(--rule)] pt-6 text-sm leading-6 text-[var(--ink-subtle)]">
        {conference.lastUpdated
          ? `This record was last updated on ${formatIsoDate(conference.lastUpdated)}. `
          : ""}
        Details are transcribed by hand from the organiser&rsquo;s
        announcements. Confirm everything on the official website before
        submitting.
      </p>
    </div>
  );
}
