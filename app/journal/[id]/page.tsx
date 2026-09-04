import type { Metadata } from "next";
import { notFound } from "next/navigation";

import TopicBadge from "@/components/TopicBadge";
import VerifiedBadge from "@/components/VerifiedBadge";
import Badge from "@/components/ui/Badge";
import {
  BackLink,
  DetailRow,
  DetailSection,
  OfficialSiteButton,
} from "@/components/DetailLayout";
import { formatIsoDate } from "@/lib/dates";
import { getJournalById, getJournals } from "@/lib/data";
import { truncate } from "@/lib/utils";

export const revalidate = 600;

export async function generateStaticParams() {
  try {
    const { items } = await getJournals();
    return items.map((journal) => ({ id: journal.id }));
  } catch {
    return [];
  }
}

export async function generateMetadata(props: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await props.params;
  const journal = await getJournalById(id);

  if (!journal) return { title: "Journal not found" };

  const description =
    journal.description ||
    `${journal.name}${journal.publisher ? `, published by ${journal.publisher}` : ""}.`;

  return {
    title: journal.name,
    description: truncate(description, 155),
    alternates: { canonical: `/journal/${journal.id}` },
    openGraph: {
      title: journal.name,
      description: truncate(description, 155),
      url: `/journal/${journal.id}`,
      type: "article",
    },
  };
}

export default async function JournalDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const journal = await getJournalById(id);

  if (!journal) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <BackLink href="/journals" label="All journals" />

      <header className="mt-6 border-b border-[var(--rule)] pb-8">
        <div className="flex flex-wrap items-center gap-2">
          {journal.accessKind !== "Unspecified" ? (
            <Badge
              tone={journal.accessKind === "Open Access" ? "open" : "neutral"}
            >
              {journal.accessKind}
            </Badge>
          ) : null}
          {journal.quartile ? <Badge tone="accent">{journal.quartile}</Badge> : null}
          <VerifiedBadge verified={journal.verified} />
        </div>

        <h1 className="mt-4 text-3xl leading-tight">{journal.name}</h1>

        {journal.abbreviation ? (
          <p className="mt-2 text-[var(--ink-muted)]">{journal.abbreviation}</p>
        ) : null}

        {journal.description ? (
          <p className="mt-4 max-w-2xl leading-7 text-[var(--ink-muted)]">
            {journal.description}
          </p>
        ) : null}

        <div className="mt-6">
          <OfficialSiteButton url={journal.link} label="Visit journal website" />
        </div>
      </header>

      <DetailSection title="Publication details">
        <DetailRow label="Publisher" value={journal.publisher} />
        <DetailRow label="ISSN">
          {journal.issn ? <span className="tnum">{journal.issn}</span> : null}
        </DetailRow>
        <DetailRow label="eISSN">
          {journal.eissn ? <span className="tnum">{journal.eissn}</span> : null}
        </DetailRow>
        <DetailRow label="Frequency" value={journal.frequency} />
        <DetailRow label="Current volume" value={journal.volume} />
      </DetailSection>

      <DetailSection title="Reach and indexing">
        <DetailRow label="Indexed in">
          {journal.indexing.length > 0 ? (
            <ul className="flex flex-wrap gap-1.5">
              {journal.indexing.map((index) => (
                <li key={index}>
                  <Badge tone="neutral">{index}</Badge>
                </li>
              ))}
            </ul>
          ) : null}
        </DetailRow>

        <DetailRow label="Impact factor">
          {journal.impactFactorText ? (
            <span className="tnum">{journal.impactFactorText}</span>
          ) : null}
        </DetailRow>

        <DetailRow label="CiteScore">
          {journal.citeScore !== null ? (
            <span className="tnum">{journal.citeScore}</span>
          ) : null}
        </DetailRow>

        <DetailRow label="Quartile" value={journal.quartile} />
      </DetailSection>

      <DetailSection title="Access and charges">
        <DetailRow label="Open access" value={journal.openAccess} />
        <DetailRow label="Article processing charge" value={journal.apc} />
        <DetailRow label="Other fees" value={journal.fees} />
      </DetailSection>

      <DetailSection title="Submitting">
        <DetailRow label="Article types" value={journal.submissionType} />
        <DetailRow label="Length and format" value={journal.paperSize} />
      </DetailSection>

      {journal.subjects.length > 0 ? (
        <DetailSection title="Subjects">
          <DetailRow label="Research areas">
            <ul className="flex flex-wrap gap-1.5">
              {journal.subjects.map((subject) => (
                <li key={subject}>
                  <TopicBadge
                    topic={subject}
                    href={`/search?type=journal&subject=${encodeURIComponent(subject)}`}
                  />
                </li>
              ))}
            </ul>
          </DetailRow>
        </DetailSection>
      ) : null}

      <p className="mt-10 border-t border-[var(--rule)] pt-6 text-sm leading-6 text-[var(--ink-subtle)]">
        {journal.lastUpdated
          ? `This record was last updated on ${formatIsoDate(journal.lastUpdated)}. `
          : ""}
        Impact factors, charges and indexing change between editions. Check the
        publisher&rsquo;s own pages before you submit.
      </p>
    </div>
  );
}
